import { Logger, Provider } from '@nestjs/common';
import { MQTT_LOGGER_PROVIDER } from './mqtt.constant';
import { MqttModule } from './mqtt.module';

export function createMqttLoggerProvider(): Provider {
  return {
    provide: MQTT_LOGGER_PROVIDER,
    useFactory: () => {
      const logger = new Logger(MqttModule.name);
      return logger;
    },
  };
}
