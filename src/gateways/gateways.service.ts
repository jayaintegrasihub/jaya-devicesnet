import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GatewaysEntity } from './entity/gateways.entity';

@Injectable()
export class GatewaysService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
        MqttAccount: { select: { username: true, password: true } },
      },
    });
  }

  findOne(where: Prisma.GatewaysWhereUniqueInput) {
    return this.prisma.gateways.findFirstOrThrow({
      where,
      include: { tenant: { select: { id: true, name: true } } },
    });
  }

  create(data: Prisma.GatewaysCreateInput) {
    return this.prisma.gateways.create({ data });
  }

  update(params: {
    where: Prisma.GatewaysWhereUniqueInput;
    data: Prisma.GatewaysUpdateInput;
  }) {
    return this.prisma.gateways.update(params);
  }

  delete(where: Prisma.GatewaysWhereUniqueInput) {
    return this.prisma.gateways.delete({ where });
  }

  // Add cache to increase data retrieval performance
  async findOneWithSerialNumber(where: Prisma.GatewaysWhereUniqueInput) {
    const cache = (await this.cacheManager.get(where.serialNumber!)) as string;
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
        gateway.serialNumber,
        JSON.stringify(gateway),
        0,
      );
      return new GatewaysEntity(gateway);
    }
  }
}
