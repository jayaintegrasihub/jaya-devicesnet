import { Module } from '@nestjs/common';
import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    AuthModule,
    CacheModule.register(),
    InfluxdbClientModule,
    RedisModule,
  ],
  controllers: [GatewaysController],
  providers: [GatewaysService],
  exports: [GatewaysService],
})
export class GatewaysModule {}
