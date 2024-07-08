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

    const fluxQuery = `
    from(bucket: "${tenant?.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "${type}")
    ${filterTagsFlux}
    |> filter(fn: (r) => r["device"] == "${serialNumber}")
    |> filter(fn: (r) => ${filterFields})
    |> last()
    |> drop(columns: ["_start", "_stop"])`;

    const resultQuery = await this.queryApi.collectRows(fluxQuery);
    const obj = {};
    fields.split(',').forEach((data) => {
      const dataInflux =
        (resultQuery.find((x: any) => x._field === data) as any) || null;
      obj[data] = dataInflux;
    });

    const statusFlux = `
    from(bucket: "${tenant?.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "devices-heart-beat")
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

  async tdsReport(query: any, deviceNumber: string) {
    const device = await this.nodesService.findOneWithSerialNumber({
      serialNumber: deviceNumber,
    });

    const { serialNumber, tenant, type } = device;
    const {
      startTime,
      endTime,
    }: { fields: string; startTime: string; endTime: string } = query;

    const fluxQuery = `
    from(bucket: "${tenant?.name}")
    |> range(start: ${startTime}, stop: ${endTime})
    |> filter(fn: (r) => r["_measurement"] == "${type}")
    |> filter(fn: (r) => r["device"] == "${serialNumber}")
    |> filter(fn: (r) => r["_field"] == "salinity" or r["_field"] == "tds" or r["_field"] == "temperature" or r["_field"] == "conductivity")
    |> max()
    |> drop(columns: ["_start", "_stop"])`;

    const result = await this.queryApi.collectRows(fluxQuery);
    const refactoredData = result.reduce(
      (acc: any, { result: _x, table: _y, _measurement: _z, ...data }) => {
        const key = data._field;
        if (!acc[key]) {
          acc[key] = [];
        }
        if (key !== 'salinity') data._value *= 0.1;
        acc[key] = data;
        return acc;
      },
      {},
    );
    return refactoredData;
  }

  async statusDevices(tenantName: string, type?: string) {
    const tenant = await this.tenantsService.findOne({
      name: tenantName,
    });
    const nodes = await this.nodesService.findAll({
      where: {
        tenantId: tenant.id,
        type,
      },
    });
    const gateways = await this.gatewaysService.findAll({
      where: {
        tenantId: tenant.id,
        type,
      },
    });
    console.log(nodes);
    const filterNodes = nodes
      .map((device) => `r["device"] == "${device.serialNumber}"`)
      .join(' or ');
    const nodefluxQuery = `
    from(bucket: "${tenant.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "nodehealth")
    |> filter(fn: (r) => ${filterNodes})
    |> last()
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> group(columns: ["device"])
    |> sort(columns: ["_time"], desc: false) 
    |> last(column: "device")
    |> drop(columns: ["_start", "_stop"])`;

    const filterGateways = gateways
      .map((device) => `r["device"] == "${device.serialNumber}"`)
      .join(' or ');
    const gatewayfluxQuery = `
    from(bucket: "${tenant.name}")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "gatewayhealth")
    |> filter(fn: (r) => ${filterGateways})
    |> last()
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> group(columns: ["device"])
    |> sort(columns: ["_time"], desc: false)
    |> last(column: "device")
    |> drop(columns: ["_start", "_stop"])`;

    let nodeHealthData: never[] = [];
    let gatewayhealthData: never[] = [];
    try {
      nodeHealthData = await this.queryApi.collectRows(nodefluxQuery);
      gatewayhealthData = await this.queryApi.collectRows(gatewayfluxQuery);
    } catch {}

    const timeNow = new Date().getTime();

    const calculateDataOnline = (
      data: Array<any>,
      devices: { alias: string; serialNumber: string }[],
    ) => {
      return data.map(({ result: _x, table: _y, ...data }) => {
        const point = data;
        const diff =
          (timeNow - new Date(point._time as string).getTime()) / 1000;
        point['status'] = diff < 60 ? 'ONLINE' : 'OFFLINE';
        point['alias'] =
          devices.find((device) => device.serialNumber === point.device)
            ?.alias || point.device;
        return point;
      });
    };
    return {
      nodes: calculateDataOnline(nodeHealthData, nodes),
      gateways: calculateDataOnline(gatewayhealthData, gateways),
      timeNow,
    };
  }
}
