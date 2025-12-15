import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  find(usersWhereUniqueInputs: Prisma.UsersWhereUniqueInput): Promise<Users> {
    return this.prisma.users.findUniqueOrThrow({
      where: usersWhereUniqueInputs,
    });
  }

  public update(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: Prisma.UsersUpdateInput;
  }): Promise<Users> {
    const { where, data } = params;

    const updatedData: Prisma.UsersUpdateInput = { ...data };
    if (data.password) {
      updatedData['password'] = bcrypt.hashSync(data.password as string, 10);
    }

    if (data.tenant) {
      updatedData.tenant = data.tenant;
    }

    return this.prisma.users.update({
      data: updatedData,
      where,
      include: {
        tenant: true,
      },
    });
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsersWhereUniqueInput;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput;
  }): Promise<Users[]> {
    return this.prisma.users.findMany({ ...params });
  }

  async create(data: Prisma.UsersCreateInput): Promise<Users> {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const userData: Prisma.UsersCreateInput = {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
    };

    if (data.tenant) {
      userData.tenant = data.tenant;
    }

    return this.prisma.users.create({
      data: userData,
      include: {
        tenant: true,
      },
    });
  }

  delete(params: {
    where: Prisma.UsersWhereUniqueInput;
    req: any;
  }): Promise<Users> {
    const { where, req } = params;
    const userId = req.user.id;
    if (where.id === userId) {
      throw new ForbiddenException('Users cannot delete themselves.');
    }
    return this.prisma.users.delete({ where });
  }
}
