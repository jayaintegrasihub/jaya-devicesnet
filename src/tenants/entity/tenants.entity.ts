import { Tenants } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class TenantsEntity implements Tenants {
  constructor({ ...data }: Partial<TenantsEntity>) {
    Object.assign(this, data);
  }

  id: string;
  name: string;
  description: string | null;

  @Exclude()
  bucketId: string | null;

  createdAt: Date;
  updatedAt: Date;
}
