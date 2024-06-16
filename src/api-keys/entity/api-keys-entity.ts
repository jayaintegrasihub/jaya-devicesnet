import { ApiKeys } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ApiKeysEntity implements ApiKeys {
  constructor({ ...data }: Partial<ApiKeysEntity>) {
    Object.assign(this, data);
  }

  id: string;
  username: string;
  expiresAt: string;
  description: string | null;
  isEnable: boolean;

  @Exclude()
  apiKey: string;
  @Exclude()
  secretKey: string;

  createdAt: Date;
  updatedAt: Date;
}
