import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProvisioningService {
  constructor(private prisma: PrismaService) {}

  async provision(serialNumber: string) {
    const [gateway, node] = await Promise.all([
      this.prisma.gateways.findFirst({
        where: {
          serialNumber: serialNumber,
        },
      }),
      this.prisma.nodes.findFirst({
        where: {
          serialNumber: serialNumber,
        },
      }),
    ]);
    if (gateway == null && node == null)
      throw new NotFoundException('gateway or node not found');

    let mqttUser: any;
    mqttUser = await this.prisma.mqttAccount.findFirst({
      where: {
        gatewaySerialNumber: serialNumber,
      },
    });

    if (mqttUser === null) {
      mqttUser = await this.prisma.mqttAccount.create({
        data: {
          isSuperUser: false,
          username: serialNumber,
          password: this.uniqueStringSecure(),
          gatewaySerialNumber: serialNumber,
        },
      });
    }

    const { username, password } = mqttUser;
    return {
      username,
      password,
      status: 'success',
    };
  }

  private uniqueStringSecure() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
  }
}
