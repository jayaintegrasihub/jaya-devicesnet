import { Nodes, Prisma } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { TenantsEntity } from 'src/tenants/entity/tenants.entity';

export class NodesEntity implements Nodes {
  constructor({ tenant, ...data }: Partial<NodesEntity>) {
    Object.assign(this, data);

    if (tenant) {
      this.tenant = new TenantsEntity(tenant);
    }
  }

  id: string;
  alias: string;
  description: string | null;
  group: Prisma.JsonValue;
  serialNumber: string;
  type: string;

  @Exclude()
  tenantId: string | null;

  tenant: Partial<TenantsEntity> | null;
  createdAt: Date;
  updatedAt: Date;
}
