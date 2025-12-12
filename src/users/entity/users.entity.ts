import { Users } from '@prisma/client';

export class UsersEntity implements Users {
  constructor({ ...data }: Partial<UsersEntity>) {
    Object.assign(this, data);
  }

  id: string;
  username: string;
  email: string;
  password: string;
  refreshToken: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
