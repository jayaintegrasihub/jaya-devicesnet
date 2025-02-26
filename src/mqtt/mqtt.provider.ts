import { Logger, Provider } from '@nestjs/common';
import { connect } from 'mqtt';
import { MQTT_CLIENT_INSTANCE, MQTT_LOGGER_PROVIDER } from './mqtt.constant';
import { MODULE_OPTIONS_TOKEN } from './mqtt.module-definition';

export function createMqttClientProvider(): Provider {
  return {
    provide: MQTT_CLIENT_INSTANCE,
    useFactory: (options: any, logger: Logger) => {
      let client = connect(options.url, { ...options, connectTimeout: 3000 });
      client.on('connect', () => {
        logger.log(
          `MQTT Client connect to ${client.options.hostname} with port ${client.options.port}`,
        );
      });

      client.on('close', () => {
        logger.log('MQTT Client is disconnect');

        reconnect();
      });

      function reconnect() {
        logger.log('Attempting to reconnect...');
        setTimeout(() => {
          client = connect(options.url);
        }, 5000);
      }

      return client;
    },
    inject: [MODULE_OPTIONS_TOKEN, MQTT_LOGGER_PROVIDER],
  };
}
