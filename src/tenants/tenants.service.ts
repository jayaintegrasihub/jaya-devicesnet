import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { InfluxdbClientApisService } from 'src/influxdb/influxdb-client-apis.service';
import { INFLUXDB_CLIENT_APIS } from 'src/influxdb/influxdb.constant';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantsService {
  private logger = new Logger(TenantsService.name);
  influxApi: InfluxdbClientApisService;

  constructor(
    private prisma: PrismaService,
    @Inject(INFLUXDB_CLIENT_APIS) influxApi: InfluxdbClientApisService,
    private configService: ConfigService,
  ) {
    this.influxApi = influxApi;
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TenantsWhereUniqueInput;
    where?: Prisma.TenantsWhereInput;
    orderBy?: Prisma.TenantsOrderByWithRelationInput;
  }) {
    return this.prisma.tenants.findMany(params);
  }

  findOne(where: Prisma.TenantsWhereUniqueInput) {
    return this.prisma.tenants.findFirstOrThrow({ where });
  }

  async create(data: Prisma.TenantsCreateInput) {
    const tenant = await this.prisma.$transaction(async (tx) => {
      const bucket = await this.influxApi.buckets.postBuckets({
        body: {
          description: data.description ?? 'none',
          name: data.name,
          orgID: this.configService.getOrThrow('INFLUXDB_ORG_ID'),
        },
      });
      const tenant = await tx.tenants.create({
        data: { ...data, bucketId: bucket.id! },
      });
      return tenant;
    });
    return tenant;
  }

  update(params: {
    where: Prisma.TenantsWhereUniqueInput;
    data: Prisma.TenantsUpdateInput;
  }) {
    return this.prisma.tenants.update(params);
  }

  delete(where: Prisma.TenantsWhereUniqueInput) {
    return this.prisma.tenants.delete({ where });
  }
}
