###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:22-alpine AS development

WORKDIR /usr/src/app

# https://github.com/prisma/prisma/discussions/19341
RUN apk add --no-cache openssl

# Copying manifests first keeps `npm ci` cached across source-only changes.
COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npx prisma generate

USER node

###################
# MIGRATOR
###################
# One-shot container for `prisma migrate deploy` and `prisma db seed`.
#
# Built from scratch rather than branching off `development`: that stage carries
# Nest, exceljs, webpack and the lint toolchain, which this image has no use for
# and which matter now that it is pulled over the network on every deploy.
# Installing only what seed.ts actually imports takes it from ~990MB to ~420MB.
#
# Versions are pinned to package-lock.json rather than the ranges in
# package.json -- the lockfile resolves prisma/@prisma/client to 5.15.0, not the
# 5.7.1 the range implies, and the CLI must match the client.

FROM node:22-alpine AS migrator

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

# A minimal manifest instead of the app's: `prisma db seed` reads the seed
# command out of package.json, but installing from the real one would drag in
# the entire runtime dependency tree.
RUN printf '%s' \
      '{"name":"jaya-migrator","private":true,' \
      '"prisma":{"seed":"ts-node prisma/seed.ts"}}' > package.json \
 && npm i --no-save --no-audit --no-fund \
      @prisma/client@5.15.0 \
      bcrypt@5.1.1 \
      prisma@5.15.0 \
      ts-node@10.9.2 \
      typescript@5.4.5 \
 && npm cache clean --force

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node prisma ./prisma

RUN npx prisma generate

USER node

CMD ["npx", "prisma", "migrate", "deploy"]

###################
# BUILD FOR PRODUCTION
###################

FROM node:22-alpine AS build

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --chown=node:node package*.json ./

# The Nest CLI is a devDependency, so reuse the fully-installed node_modules
# from the development stage instead of installing twice.
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

# Drop devDependencies. The generated Prisma client survives because
# @prisma/client is a production dependency with a postinstall hook.
RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:22-alpine AS production

RUN apk add --no-cache openssl wget

# The upstream image ships a `node` user; run as it rather than root. Note that
# a `USER` in an earlier stage does not carry across a FROM, so this must be
# restated here.
WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

ENV NODE_ENV=production

USER node

EXPOSE 3000

# `GET /` is the only unauthenticated route -- `/health` sits behind
# ApiKeysGuard and hits Postgres, so it is useless as a liveness probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "dist/main.js"]
