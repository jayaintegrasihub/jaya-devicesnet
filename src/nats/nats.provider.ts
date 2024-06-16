import { Logger, Provider } from '@nestjs/common';
import { NATS_LOGGER_PROVIDER, NATS_STREAM_CLIENT } from './nats.constant';
import { connect } from 'nats';

export function createNatsProvider(): Provider {
  return {
    provide: NATS_STREAM_CLIENT,
    useFactory: async (logger: Logger) => {
      const nc = await connect({
        servers: process.env.NATS_SERVER,
        user: process.env.NATS_USER,
        pass: process.env.NATS_PASSWORD,
      });

      logger.log(`Connected To NATS ${nc.getServer()}`);

      return nc;
    },
    inject: [NATS_LOGGER_PROVIDER],
  };
}
