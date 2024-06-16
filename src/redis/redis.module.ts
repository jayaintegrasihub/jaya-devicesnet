import { Module } from '@nestjs/common';
import { createRedisProvider } from './redis.provider';
import { REDIS } from './redis.constant';

@Module({
  providers: [createRedisProvider()],
  exports: [REDIS],
})
export class RedisModule {}
