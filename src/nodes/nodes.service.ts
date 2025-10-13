import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodesEntity } from './entity/node.entity';
import { REDIS } from 'src/redis/redis.constant';
import Redis from 'ioredis';
import { INFLUXDB_CLIENT } from 'src/influxdb/influxdb.constant';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodesService {
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
    cursor?: Prisma.NodesWhereUniqueInput;
    where?: Prisma.NodesWhereInput;
    orderBy?: Prisma.NodesOrderByWithRelationInput;
  }) {
    return this.prisma.nodes.findMany({
      ...params,
      include: { tenant: { select: { id: true, name: true } } },
    });
  }

  findOne(where: Prisma.NodesWhereUniqueInput) {
    return this.prisma.nodes.findFirstOrThrow({
      where,
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: Prisma.NodesCreateInput) {
    const node = await this.prisma.nodes.create({ data });
    await this.cacheManager.del(`node/${node.serialNumber!}`);
    return node;
  }

  async update(params: {
    where: Prisma.NodesWhereUniqueInput;
    data: Prisma.NodesUpdateInput;
  }) {
    const node = await this.prisma.nodes.update(params);
    // this redis delete for logic jaya-transport-service
    await this.redis.del(`device/${node.serialNumber}`);
    await this.cacheManager.del(`node/${node.serialNumber!}`);
    return node;
  }

  async delete(where: Prisma.NodesWhereUniqueInput) {
    const node = await this.prisma.nodes.findFirstOrThrow({ where });

    // this redis delete for logic jaya-transport-service
    await this.redis.del(`device/${node.serialNumber}`);
    return this.prisma.nodes.delete({ where });
  }

  // Add cache to increase data retrieval performance
  async findOneWithSerialNumber(where: Prisma.NodesWhereUniqueInput) {
    const cache = (await this.cacheManager.get(
      `node/${where.serialNumber!}`,
    )) as string;
    if (cache) {
      const node = JSON.parse(cache);
      return new NodesEntity(node);
    } else {
      const node = await this.prisma.nodes.findFirstOrThrow({
        where,
        include: {
          tenant: { select: { id: true, name: true } },
        },
      });
      await this.cacheManager.set(
        `node/${node.serialNumber}`,
        JSON.stringify(node),
        10000,
      );
      return new NodesEntity(node);
    }
  }

  async findByAlias(alias: string) {
    const node = await this.prisma.nodes.findFirstOrThrow({
      where: { alias },
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });

    const fluxQuery = `
    from(bucket: "${node.tenant?.name}")
    |> range(start: -400d)
    |> filter(fn: (r) => r["_measurement"] == "deviceshealth")
    |> filter(fn: (r) => r["device"] == "${node.serialNumber}")
    |> last(column : "_time")
    |> keep(columns: ["gateway", "_time"])`;
    const nodeInflux = (await this.queryApi.collectRows(fluxQuery)).map(
      ({ result, table, ...value }) => value,
    );

    return { ...node, meta: nodeInflux[0] || {} };
  }
}
