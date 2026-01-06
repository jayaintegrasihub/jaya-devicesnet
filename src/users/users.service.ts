import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface UsersWithTenant extends Users {
  tenant: Array<{ tenant: any }>;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async find(
    usersWhereUniqueInputs: Prisma.UsersWhereUniqueInput,
  ): Promise<UsersWithTenant> {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: usersWhereUniqueInputs,
      include: {
        tenant: {
          select: {
            tenant: true,
          },
        },
      },
    });
    return {
      ...user,
      tenant: user.tenant.map((t: any) => t.tenant),
    };
  }

  public update(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: Prisma.UsersUpdateInput & { confirmPassword?: string };
  }): Promise<Users> {
    const { where, data } = params;

    if (
      data.password &&
      data.confirmPassword &&
      data.password !== data.confirmPassword
    ) {
      throw new ForbiddenException('Passwords do not match.');
    }

    const { confirmPassword, ...dataWithoutConfirmPassword } = data;
    const updatedData: Prisma.UsersUpdateInput = {
      ...dataWithoutConfirmPassword,
    };
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
    return this.prisma.users.findMany({
      ...params,
      include: {
      tenant: {
        select: {
        tenant: true,
        },
      },
      },
    }).then(users =>
      users.map(user => ({
      ...user,
      tenant: user.tenant.map((t: any) => t.tenant),
      }))
    );
  }

  async create(
    data: Prisma.UsersCreateInput & { confirmPassword?: string },
  ): Promise<Users> {
    if (
      data.password &&
      data.confirmPassword &&
      data.password !== data.confirmPassword
    ) {
      throw new ForbiddenException('Passwords do not match.');
    }

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
