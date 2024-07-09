import { Injectable, NotFoundException } from '@nestjs/common';
import { MqttAccountService } from 'src/mqtt-account/mqtt-account.service';
import { MqttAclService } from 'src/mqtt-acl/mqtt-acl.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProvisioningService {
  constructor(
    private prisma: PrismaService,
    private mqttAccountService: MqttAccountService,
    private mqttAclService: MqttAclService,
  ) {}

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
    mqttUser = await this.mqttAccountService.findOne({
      serialNumber,
    });
    if (mqttUser === null) {
      mqttUser = await this.mqttAccountService.create(serialNumber);
      await this.mqttAclService.create({
        action: 'publish',
        permission: 'allow',
        username: serialNumber,
        topic: 'JI/v2/#',
        clientid: serialNumber,
        serialNumber,
      });
    }

    const { username, password } = mqttUser;
    return {
      username,
      password,
      status: 'success',
    };
  }
}
