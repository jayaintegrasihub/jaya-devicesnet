import { Module } from '@nestjs/common';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { RedisModule } from 'src/redis/redis.module';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { AccessControlService } from 'src/shared/access-control.service';
import { RoleGuard } from 'src/role/guards/role.guard';

@Module({
  imports: [
    AuthModule,
    CacheModule.register(),
    InfluxdbClientModule,
    RedisModule,
    ApiKeysModule,
  ],
  controllers: [NodesController],
  providers: [NodesService, AccessControlService, RoleGuard],
  exports: [NodesService],
})
export class NodesModule {}
