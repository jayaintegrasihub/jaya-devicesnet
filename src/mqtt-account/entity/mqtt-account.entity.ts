import { MqttAccount } from '@prisma/client';

export class MqttAccountEntity implements MqttAccount {
  constructor({ ...data }: Partial<MqttAccountEntity>) {
    Object.assign(this, data);
  }

  id: number;
  isSuperUser: boolean;
  password: string;
  username: string;
  serialNumber: string;
  createdAt: Date;
  updatedAt: Date;
}
