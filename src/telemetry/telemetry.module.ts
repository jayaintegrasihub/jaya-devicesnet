import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { NodesModule } from 'src/nodes/nodes.module';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { ConfigType } from '@nestjs/config';
import mqttConfiguration from '../config/mqtt.config';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { TelemetryMqttPublisher } from 'src/mqtt/telemetry/telemetry.mqtt-publisher';

@Module({
  imports: [
    AuthModule,
    InfluxdbClientModule,
    NodesModule,
    ApiKeysModule,
    TenantsModule,
    GatewaysModule,
    MqttModule.forRootAsync({
      useFactory: (config: ConfigType<typeof mqttConfiguration>) => config,
      inject: [mqttConfiguration.KEY],
    }),
  ],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    AccessTokenGuard,
    ApiKeysGuard,
    TelemetryMqttPublisher,
  ],
})
export class TelemetryModule {}
