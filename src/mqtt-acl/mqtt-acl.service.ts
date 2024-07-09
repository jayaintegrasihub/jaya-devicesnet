import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MqttAclService {
  constructor(private prisma: PrismaService) {}

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MqttAclWhereUniqueInput;
    where?: Prisma.MqttAclWhereInput;
    orderBy?: Prisma.MqttAclOrderByWithRelationInput;
  }) {
    return this.prisma.mqttAcl.findMany({
      ...params,
    });
  }

  findOne(where: Prisma.MqttAclWhereUniqueInput) {
    return this.prisma.mqttAcl.findFirstOrThrow({
      where,
    });
  }

  async create(data: Prisma.MqttAclCreateInput) {
    return this.prisma.mqttAcl.create({ data });
  }

  async update(params: {
    where: Prisma.MqttAclWhereUniqueInput;
    data: Prisma.MqttAclUpdateInput;
  }) {
    return this.prisma.mqttAcl.update(params);
  }

  delete(where: Prisma.MqttAclWhereUniqueInput) {
    return this.prisma.mqttAcl.delete({ where });
  }
}
