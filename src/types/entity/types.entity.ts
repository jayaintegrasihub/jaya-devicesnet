import { Types } from '@prisma/client';

export class TypesEntity implements Types {
  constructor({ ...data }: Partial<TypesEntity>) {
    Object.assign(this, data);
  }

  id: string;
  description: string | null;
  groups: string[];
  name: string;

  createdAt: Date;
  updatedAt: Date;
}
