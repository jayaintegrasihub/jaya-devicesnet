import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MqttAccountService {
  constructor(private prisma: PrismaService) {}

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MqttAccountWhereUniqueInput;
    where?: Prisma.MqttAccountWhereInput;
    orderBy?: Prisma.MqttAccountOrderByWithRelationInput;
  }) {
    return this.prisma.mqttAccount.findMany({
      ...params,
    });
  }

  findOne(where: Prisma.MqttAccountWhereUniqueInput) {
    return this.prisma.mqttAccount.findFirst({
      where,
    });
  }

  async create(serialNumber: string) {
    return this.prisma.mqttAccount.create({
      data: {
        isSuperUser: false,
        username: serialNumber,
        password: this.uniqueStringSecure(),
        serialNumber: serialNumber,
      },
    });
  }

  async update(params: {
    where: Prisma.MqttAccountWhereUniqueInput;
    data: Prisma.MqttAccountUpdateInput;
  }) {
    return this.prisma.mqttAccount.update(params);
  }

  delete(where: Prisma.MqttAccountWhereUniqueInput) {
    return this.prisma.mqttAccount.delete({ where });
  }

  private uniqueStringSecure() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
  }
}
