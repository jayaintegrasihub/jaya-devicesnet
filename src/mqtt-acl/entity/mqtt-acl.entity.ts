import { $Enums, MqttAcl } from '@prisma/client';

export class MqttAclEntity implements MqttAcl {
  constructor({ ...data }: Partial<MqttAclEntity>) {
    Object.assign(this, data);
  }

  id: number;
  ipaddress: string;
  clientid: string;
  username: string;
  action: $Enums.ACTION;
  permission: $Enums.PERMISSION;
  qos: number | null;
  retain: number | null;
  topic: string;
  serialNumber: string;

  createdAt: Date;
  updatedAt: Date;
}
