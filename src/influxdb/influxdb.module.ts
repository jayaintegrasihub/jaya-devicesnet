import { Module } from '@nestjs/common';
import { createInfluxdbClientProvider } from './influxdb-client.provider';
import { INFLUXDB_CLIENT, INFLUXDB_CLIENT_APIS } from './influxdb.constant';
import { InfluxdbClientApisService } from './influxdb-client-apis.service';

@Module({
  providers: [
    createInfluxdbClientProvider(),
    {
      provide: INFLUXDB_CLIENT_APIS,
      useClass: InfluxdbClientApisService,
    },
  ],
  exports: [INFLUXDB_CLIENT, INFLUXDB_CLIENT_APIS],
})
export class InfluxdbClientModule {}
