import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodesEntity } from './entity/node.entity';
import { REDIS } from 'src/redis/redis.constant';
import Redis from 'ioredis';

@Injectable()
export class NodesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(REDIS) private redis: Redis,
  ) {}

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
        0,
      );
      return new NodesEntity(node);
    }
  }
}
