import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Role } from 'src/enums/role.enum';
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

  // findAll(params: {
  //   skip?: number;
  //   take?: number;
  //   cursor?: Prisma.TenantsWhereUniqueInput;
  //   where?: Prisma.TenantsWhereInput;
  //   orderBy?: Prisma.TenantsOrderByWithRelationInput;
  // }) {
  //   return this.prisma.tenants.findMany(params);
  // }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.TenantsWhereUniqueInput;
      where?: Prisma.TenantsWhereInput;
      orderBy?: Prisma.TenantsOrderByWithRelationInput;
    },
    req: any,
  ) {
    const { id: userId, role } = req.user;
    
    if (!userId) {
      throw new NotFoundException('User not found in request');
    }

    if (role === Role.ADMIN) {
      return this.prisma.tenants.findMany({ ...params });
    }

    const userTenants = await this.prisma.userTenants.findMany({
      where: { userId },
      select: { tenantId: true },
    });
    const tenantIds = userTenants.map((ut) => ut.tenantId);

    const where = {
      ...params.where,
      id: { in: tenantIds },
    };

    return this.prisma.tenants.findMany({
      ...params,
      where,
    });
  }

  findOne(where: Prisma.TenantsWhereUniqueInput) {
    return this.prisma.tenants.findFirstOrThrow({ where });
  }

  async create(data: Prisma.TenantsCreateInput) {
    let bucket: { id?: string; name?: string } | null = null;
    let task: { id?: string } | null = null;

    try {
      bucket = await this.influxApi.buckets.postBuckets({
        body: {
          description: data.description ?? 'none',
          name: data.name,
          orgID: this.configService.get<string>('INFLUXDB_ORG_ID')!,
        },
      });

      task = await this.influxApi.tasks.postTasks({
        body: {
          orgID: this.configService.get<string>('INFLUXDB_ORG_ID')!,
          flux: [
            'import "timezone"',
            '',
            `option task = {name: "${data.name}_completeness", cron: "0 17 * * *", offset: 30s}`,
            '',
            `base = from(bucket: "${bucket.name}")`,
            '  |> range(start: -1d)',
            '  |> filter(fn: (r) => r["_measurement"] == "deviceshealth" and r["_field"] == "uptime")',
            '  |> group(columns: ["device"])',
            '  |> sort(columns: ["_time"], desc: false)',
            '',
            'b = base',
            '  |> count()',
            '  |> map(fn: (r) => ({r with _field: "count", _time: r._stop}))',
            '',
            'a = base',
            '  |> difference()',
            '  |> filter(fn: (r) => r._value > 0)',
            '  |> sum()',
            '  |> map(fn: (r) => ({r with _field: "duration", _time: r._stop}))',
            '',
            'union(tables: [a, b])',
            '  |> map(fn: (r) => ({r with _measurement: "completeness_daily", _time: r._time}))',
            `  |> to(bucket: "${bucket.name}")`,
          ].join('\n'),
        },
      });

      const tenant = await this.prisma.tenants.create({
        data: { ...data, bucketId: bucket.id! },
      });

      return tenant;
    } catch (error) {
      if (task?.id) {
        try {
          await this.influxApi.tasks.deleteTasksID({ taskID: task.id });
        } catch (rollbackError) {
          this.logger.error(
            `Failed to rollback task ${task.id}:`,
            rollbackError,
          );
        }
      }

      if (bucket?.id) {
        try {
          await this.influxApi.buckets.deleteBucketsID({ bucketID: bucket.id });
        } catch (rollbackError) {
          this.logger.error(
            `Failed to rollback bucket ${bucket.id}:`,
            rollbackError,
          );
        }
      }

      throw error;
    }
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
