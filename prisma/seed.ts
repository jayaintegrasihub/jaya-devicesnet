/**
 * Bootstrap seed for a fresh database.
 *
 * A brand-new Postgres is unusable without this: every users/tenants/api-keys
 * endpoint sits behind AccessTokenGuard + RoleGuard, so there is no way to
 * create the first admin over HTTP. Worse, jaya-transport-service calls
 * `GET /health` with an `api-key` header at startup and log.Fatalf()s when it
 * fails -- and that route is behind ApiKeysGuard, which reads the ApiKeys
 * table. Empty table => 401 => permanent crash loop.
 *
 * Everything here is idempotent (upsert) and deterministic, so re-running it
 * against a live database changes nothing.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} (see .env.example)`);
  }
  return value;
}

const b64url = (input: Buffer | string): string =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/**
 * ApiKeysGuard looks the row up by `apiKey`, then calls
 * `jwtService.verifyAsync(apiKey, { secret: secretKey })` -- so the stored
 * `apiKey` is itself an HS256 JWT signed with the row's `secretKey`.
 *
 * We sign it by hand rather than pulling in `jsonwebtoken` (no @types shipped)
 * and deliberately emit no `iat`/`exp` claims, which makes the token a pure
 * function of (secret, payload). That is what lets this script be re-run
 * without invalidating the token already sitting in the deployed .env.
 */
function signApiKey(payload: Record<string, unknown>, secret: string): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const signature = b64url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );
  return `${header}.${body}.${signature}`;
}

async function seedAdmin(): Promise<void> {
  const username = required('SEED_ADMIN_USERNAME');
  const email = required('SEED_ADMIN_EMAIL');
  const password = required('SEED_ADMIN_PASSWORD');

  // RoleGuard -> AccessControlService.isAuthorized is a plain `===` with no
  // hierarchy, so this must be exactly 'admin' (Role.ADMIN), not 'ADMIN'.
  await prisma.users.upsert({
    where: { username },
    update: {},
    create: {
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      role: 'admin',
    },
  });

  console.log(`[seed] admin user ready: ${username}`);
}

async function seedTransportApiKey(): Promise<string> {
  const username = process.env.TRANSPORT_API_USERNAME ?? 'jaya-transport-service';
  const secretKey = required('TRANSPORT_API_SECRET');
  const apiKey = signApiKey({ username }, secretKey);

  await prisma.apiKeys.upsert({
    where: { username },
    update: { apiKey, secretKey, isEnable: true },
    create: {
      username,
      apiKey,
      secretKey,
      isEnable: true,
      // Column is a free-text String, not a timestamp. The guard never reads
      // it -- expiry is carried by the JWT, and we mint a non-expiring one.
      expiresAt: 'never',
      description: 'Used by jaya-transport-service to reach the core API.',
    },
  });

  console.log(`[seed] api key ready for: ${username}`);
  return apiKey;
}

async function seedMqttSuperuser(
  label: string,
  usernameVar: string,
  passwordVar: string,
): Promise<void> {
  const username = process.env[usernameVar];
  const password = process.env[passwordVar];
  if (!username || !password) {
    console.log(`[seed] ${usernameVar} unset, skipping ${label} broker account`);
    return;
  }

  // EMQX authenticates against this table directly. Passwords are stored in
  // plaintext (bcrypt in auth.service.ts is for humans only), which is why
  // emqx.conf pins password_hash_algorithm to `plain`.
  //
  // isSuperUser bypasses the MqttAcl rules. That is required for the transport
  // service, which subscribes to the shared-subscription topics
  // `$share/g1/JI/v2/#` and `$share/g1/provisioning` -- no per-device ACL row
  // would ever grant those -- and for the api, which publishes commands to
  // arbitrary `JI/v2/+/+/command` topics.
  await prisma.mqttAccount.upsert({
    where: { username },
    update: { password, isSuperUser: true },
    create: {
      username,
      password,
      isSuperUser: true,
      // Column is non-null and unique but only meaningful for real devices;
      // reuse the username so these service rows cannot collide with one.
      serialNumber: username,
    },
  });

  console.log(`[seed] mqtt superuser ready: ${username} (${label})`);
}

async function main(): Promise<void> {
  await seedAdmin();
  const apiKey = await seedTransportApiKey();
  await seedMqttSuperuser('api', 'API_MQTT_USERNAME', 'API_MQTT_PASSWORD');
  await seedMqttSuperuser(
    'transport',
    'TRANSPORT_MQTT_USERNAME',
    'TRANSPORT_MQTT_PASSWORD',
  );

  console.log('\n[seed] JAYA_TOKEN for jaya-transport-service:');
  console.log(`JAYA_TOKEN=${apiKey}\n`);
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
