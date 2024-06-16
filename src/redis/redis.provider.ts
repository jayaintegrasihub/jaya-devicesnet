import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS } from './redis.constant';
// https://github.com/redis/ioredis
import Redis from 'ioredis';

export function createRedisProvider(): Provider {
  return {
    provide: REDIS,
    useFactory(configService: ConfigService) {
      return new Redis({
        host: configService.get('REDIS_URL', 'localhost'),
        port: parseInt(configService.get('REDIS_PORT', '6379')),
        username: configService.get('REDIS_USERNAME', ''),
        password: configService.get('REDIS_PASSWORD', ''),
      });
    },
    inject: [ConfigService],
  };
}
