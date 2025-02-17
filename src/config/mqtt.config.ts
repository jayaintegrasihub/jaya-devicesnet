import { registerAs } from '@nestjs/config';

export default registerAs('MQTT', () => ({
  url: process.env.MQTT_URL,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: process.env.MQTT_CLIENT_ID,
}));
