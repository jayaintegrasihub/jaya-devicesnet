import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { REDIS } from 'src/redis/redis.constant';
import Redis from 'ioredis';
import { INFLUXDB_CLIENT } from 'src/influxdb/influxdb.constant';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { ConfigService } from '@nestjs/config';
import { GatewaysEntity } from './entity/gateways.entity';

@Injectable()
export class GatewaysService {
  private queryApi: QueryApi;

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(REDIS) private redis: Redis,
    @Inject(INFLUXDB_CLIENT) private influx: InfluxDB,
    private configService: ConfigService,
  ) {
    const org = this.configService.get('INFLUXDB_ORG_ID');
    const queryApi = this.influx.getQueryApi(org);
    this.queryApi = queryApi;
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.GatewaysWhereUniqueInput;
    where?: Prisma.GatewaysWhereInput;
    orderBy?: Prisma.GatewaysOrderByWithRelationInput;
  }) {
    return this.prisma.gateways.findMany({
      ...params,
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  findOne(identifier: string) {
    return this.prisma.gateways.findFirstOrThrow({
      where: {
        OR: [{ id: identifier }, { serialNumber: identifier }],
      },
      include: { tenant: { select: { id: true, name: true } } },
    });
  }

  async create(data: Prisma.GatewaysCreateInput) {
    const gateway = await this.prisma.gateways.create({ data });
    await this.cacheManager.del(`gateway/${gateway.serialNumber}`);
    return gateway;
  }

  async update(params: {
    where: Prisma.GatewaysWhereUniqueInput;
    data: Prisma.GatewaysUpdateInput;
  }) {
    const gateway = await this.prisma.gateways.update(params);
    // this redis delete for logic jaya-transport-service
    await this.redis.del(`device/${gateway.serialNumber}`);
    await this.cacheManager.del(`gateway/${gateway.serialNumber!}`);
    return gateway;
  }

  async delete(where: Prisma.GatewaysWhereUniqueInput) {
    const gateway = await this.prisma.gateways.findFirstOrThrow({ where });

    // this redis delete for logic jaya-transport-service
    await this.redis.del(`device/${gateway.serialNumber}`);
    return this.prisma.gateways.delete({ where });
  }

  // Add cache to increase data retrieval performance
  async findOneWithSerialNumber(where: Prisma.GatewaysWhereUniqueInput) {
    const cache = (await this.cacheManager.get(
      `gateway/${where.serialNumber!}`,
    )) as string;
    if (cache) {
      const gateway = JSON.parse(cache);
      return new GatewaysEntity(gateway);
    } else {
      const gateway = await this.prisma.gateways.findFirstOrThrow({
        where,
        include: {
          tenant: { select: { id: true, name: true } },
        },
      });
      await this.cacheManager.set(
        `gateway/${gateway.serialNumber}`,
        JSON.stringify(gateway),
        0,
      );
      return new GatewaysEntity(gateway);
    }
  }

  // find node which connected with gateway
  async findNode(identifier: string) {
    const { serialNumber, tenant } =
      await this.prisma.gateways.findFirstOrThrow({
        where: {
          OR: [{ id: identifier }, { serialNumber: identifier }],
        },
        include: {
          tenant: {
            select: { name: true },
          },
        },
      });
    const fluxQuery = `
    from(bucket: "${tenant?.name}")
    |> range(start: -7d)
    |> filter(fn: (r) => r["_measurement"] == "deviceshealth")
    |> filter(fn: (r) => r["gateway"] == "${serialNumber}" and r["device"] != "${serialNumber}")
    |> last(column : "_time")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> group(columns: ["device"], mode:"by")  
    |> last(column : "_time")`;
    const nodeInflux = await this.queryApi.collectRows(fluxQuery);
    const listNode = nodeInflux.map((value: any) => {
      return { serialNumber: value.device };
    });
    const nodes = await this.prisma.nodes.findMany({
      where: {
        OR: listNode,
      },
    });
    const resultNode = nodes.map((node) => {
      const nodeFromInflux = nodeInflux.find(
        (value: any) => value.device === node.serialNumber,
      ) as any;
      return { ...node, ...nodeFromInflux };
    });
    return resultNode;
  }
}
