import { Inject, Injectable } from '@nestjs/common';
import { INFLUXDB_CLIENT } from './influxdb.constant';
import { InfluxDB } from '@influxdata/influxdb-client';
import {
  BucketsAPI,
  OrgsAPI,
  SetupAPI,
  TasksAPI,
} from '@influxdata/influxdb-client-apis';

@Injectable()
export class InfluxdbClientApisService {
  private orgsApi: OrgsAPI;
  private bucketsApi: BucketsAPI;
  private setupApi: SetupAPI;
  private taskApi: TasksAPI;

  constructor(@Inject(INFLUXDB_CLIENT) private influxdb: InfluxDB) {
    this.orgsApi = new OrgsAPI(this.influxdb);
    this.bucketsApi = new BucketsAPI(this.influxdb);
    this.setupApi = new SetupAPI(influxdb);
    this.taskApi = new TasksAPI(this.influxdb);
  }

  get orgs(): OrgsAPI {
    return this.orgsApi;
  }

  get buckets(): BucketsAPI {
    return this.bucketsApi;
  }

  get setup(): SetupAPI {
    return this.setupApi;
  }

  get tasks(): TasksAPI {
    return this.taskApi;
  }
}
