import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { NodesModule } from 'src/nodes/nodes.module';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [
    AuthModule,
    InfluxdbClientModule,
    NodesModule,
    ApiKeysModule,
    TenantsModule,
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}
