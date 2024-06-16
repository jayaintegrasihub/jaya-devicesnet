import { Logger, Provider } from '@nestjs/common';
import { NatsModule } from './nats.module';
import { NATS_LOGGER_PROVIDER } from './nats.constant';

export function createNatsLoggerProvider(): Provider {
  return {
    provide: NATS_LOGGER_PROVIDER,
    useFactory: () => {
      const logger = new Logger(NatsModule.name);
      return logger;
    },
  };
}
