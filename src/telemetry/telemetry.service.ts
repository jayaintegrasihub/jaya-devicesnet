import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodesService } from 'src/nodes/nodes.service';
import { INFLUXDB_CLIENT } from 'src/influxdb/influxdb.constant';
import { TenantsService } from 'src/tenants/tenants.service';
import { GatewaysService } from 'src/gateways/gateways.service';

Injectable();
export class TelemetryService {
  private queryApi: QueryApi;

  constructor(
    @Inject(INFLUXDB_CLIENT) private influx: InfluxDB,
    private configService: ConfigService,
    private nodesService: NodesService,
    private tenantsService: TenantsService,
    private gatewaysService: GatewaysService,
  ) {
    const org = this.configService.get('INFLUXDB_ORG_ID');
    const queryApi = this.influx.getQueryApi(org);
    this.queryApi = queryApi;
  }
  async findLast(query: any, deviceNumber: string) {
    const device = await this.nodesService.findOneWithSerialNumber({
      serialNumber: deviceNumber,
    });

    const { serialNumber, tenant, type } = device;
    const { fields, ...tags }: { fields: string } = query;
    const filterFields =
      fields !== undefined
        ? fields
            .split(',')
            .map((x) => `r["_field"] == "${x}"`)
            .join(' or ')
        : '';

    const filterTags: Array<string> = [];
    for (const key in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, key)) {
        filterTags.push(`r["${key}"] == "${tags[key]}"`);
      }
    }

    const filterTagsFlux =
      filterTags.length !== 0
        ? `|> filter(fn: (r) => ${filterTags.join(' or ')})`
        : '';
    const filterFieldsFlux =
      filterFields === '' ? '' : `|> filter(fn: (r) => ${filterFields})`;

    const fluxQuery = `
    from(bucket: "${tenant?.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "${type}")
    ${filterTagsFlux}
    |> filter(fn: (r) => r["device"] == "${serialNumber}")
    ${filterFieldsFlux}
    |> last()
    |> drop(columns: ["_start", "_stop"])`;

    const resultQuery = await this.queryApi.collectRows(fluxQuery);
    const obj = {};
    resultQuery.forEach((data: any) => {
      obj[data._field] = data;
    });

    const statusFlux = `
    from(bucket: "${tenant?.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "deviceshealth")
    |> filter(fn: (r) => r["device"] == "${serialNumber}")
    |> last()
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> group(columns: ["device"])
    |> last(column: "device")
    |> drop(columns: ["_start", "_stop"])`;
    const resultStatus = await this.queryApi.collectRows(statusFlux);
    const timeNow = new Date().getTime();
    const dataOnline = resultStatus.map(
      ({ result: _x, table: _y, ...data }) => {
        const point = data;
        const diff =
          (timeNow - new Date(point._time as string).getTime()) / 1000;
        point['status'] = diff < 60 ? 'ONLINE' : 'OFFLINE';
        point['alias'] = device.alias;
        return point;
      },
    );
    return { telemetry: obj, statusDevice: dataOnline[0] };
  }

  async findHistory(query: any, deviceNumber: string) {
    const device = await this.nodesService.findOneWithSerialNumber({
      serialNumber: deviceNumber,
    });

    const { serialNumber, tenant, type } = device;
    const {
      fields,
      startTime,
      endTime,
      aggregate,
      ...tags
    }: {
      fields: string;
      startTime: string;
      endTime: string;
      aggregate: string;
    } = query;
    const filterFields = fields
      .split(',')
      .map((x) => `r["_field"] == "${x}"`)
      .join(' or ');

    const filterTags: Array<string> = [];
    for (const key in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, key)) {
        filterTags.push(`r["${key}"] == "${tags[key]}"`);
      }
    }

    const filterTagsFlux =
      filterTags.length !== 0
        ? `|> filter(fn: (r) => ${filterTags.join(' or ')})`
        : '';

    const aggreateFlux =
      aggregate !== undefined
        ? `|> aggregateWindow(every: ${aggregate}, fn: median)`
        : '';

    const fluxQuery = `
    from(bucket: "${tenant?.name}")
    |> range(start: ${startTime}, stop: ${endTime})
    |> filter(fn: (r) => r["_measurement"] == "${type}")
    ${filterTagsFlux}
    |> filter(fn: (r) => r["device"] == "${serialNumber}")
    |> filter(fn: (r) => ${filterFields})
    ${aggreateFlux}
    |> drop(columns: ["_start", "_stop"])`;

    const resultQuery = await this.queryApi.collectRows(fluxQuery);
    const obj = {};
    fields.split(',').forEach((data) => {
      const dataInflux = resultQuery.filter(
        (x: any) => x._field === data,
      ) as any;
      obj[data] = dataInflux;
    });
    return obj;
  }

  async statusDevices(tenantName: string, type?: string) {
    const tenant = await this.tenantsService.findOne({
      name: tenantName,
    });
    const nodes = await this.nodesService.findAll({
      where: {
        tenantId: tenant.id,
        AND: {
          type,
        },
      },
    });
    const gateways = await this.gatewaysService.findAll({
      where: {
        tenantId: tenant.id,
        AND: {
          type,
        },
      },
    });
    const devices = nodes.concat(gateways);
    if (devices.length === 0)
      return {
        nodes: [],
        gateways: [],
        timeNow: new Date().getTime(),
      };

    const filterDevices = devices
      .map((device) => `r["device"] == "${device.serialNumber}"`)
      .join(' or ');
    const devicefluxQuery = `
    from(bucket: "${tenant.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "deviceshealth")
    |> filter(fn: (r) => ${filterDevices})
    |> last()
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> group(columns: ["device"])
    |> sort(columns: ["_time"], desc: false) 
    |> last(column: "device")
    |> drop(columns: ["_start", "_stop"])`;
    const deviceHealthData = await this.queryApi.collectRows(devicefluxQuery);

    const timeNow = new Date().getTime();

    const calculateDataOnline = (
      data: Array<any>,
      devices: { alias: string; serialNumber: string }[],
    ) => {
      return devices
        .map((device) => {
          const point = data.find((x) => x.device === device.serialNumber);
          if (point === undefined) return;
          const diff =
            (timeNow - new Date(point._time as string).getTime()) / 1000;
          point['status'] = diff < 60 ? 'ONLINE' : 'OFFLINE';
          point['alias'] = device.alias;
          return point;
        })
        .filter((x) => x);
    };
    return {
      nodes: calculateDataOnline(deviceHealthData, nodes),
      gateways: calculateDataOnline(deviceHealthData, gateways),
      timeNow,
    };
  }

  async runtime(
    startTime: string,
    endTime: string,
    tenantName: string,
    type: string,
  ) {
    const tenant = await this.tenantsService.findOne({
      name: tenantName,
    });
    const nodes = await this.nodesService.findAll({
      where: {
        tenantId: tenant.id,
        type,
      },
    });

    const filterNodes = nodes
      .map((device) => `r["device"] == "${device.serialNumber}"`)
      .join(' or ');
    const fluxQuery = `
    import "contrib/tomhollingworth/events"
    import "experimental/array"
    import "math"

    from(bucket: "${tenantName}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r["_measurement"] == "${type}")
      |> filter(fn: (r) => ${filterNodes})
      |> filter(fn: (r) => r["_field"] == "RS")
      |> events.duration(unit: 1s)
      |> filter(fn: (r) => r["_value"] == 1)
      |> sum(column: "duration")
      |> map(fn: (r) => ({  device: r["device"], _value: math.round(x: float(v:r["duration"]) / 60.00) }))`;

    const runtimeData = await this.queryApi.collectRows(fluxQuery);
    return nodes.map((node) => {
      const runtime: any = runtimeData.find(
        (data: any) => data.device === node.serialNumber,
      );
      return {
        _value: runtime === undefined ? 0 : runtime._value,
        alias: node.alias,
        serialNumber: node.serialNumber,
      };
    });
  }
}
