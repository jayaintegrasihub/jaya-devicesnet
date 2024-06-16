import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INFLUXDB_CLIENT } from './influxdb.constant';
import { InfluxDB } from '@influxdata/influxdb-client';

export function createInfluxdbClientProvider(): Provider {
  return {
    provide: INFLUXDB_CLIENT,
    useFactory(configService: ConfigService) {
      return new InfluxDB({
        url: configService.get('INFLUXDB_URL', 'http://localhost:8086'),
        token: configService.get('INFLUXDB_TOKEN', ''),
      });
    },
    inject: [ConfigService],
  };
}
