import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { createNatsProvider } from './nats.provider';
import { NATS_LOGGER_PROVIDER, NATS_STREAM_CLIENT } from './nats.constant';
import { createNatsLoggerProvider } from './nats-logger.provider';
import { NatsJetsream } from './nats.jetstream';

@Module({
  imports: [DiscoveryModule],
  providers: [createNatsProvider(), createNatsLoggerProvider(), NatsJetsream],
  exports: [NATS_STREAM_CLIENT, NATS_LOGGER_PROVIDER],
})
export class NatsModule {}
