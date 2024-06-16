import { Injectable } from '@nestjs/common';
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

    return this.prisma.users.update({
      data: updatedData,
      where,
    });
  }
}
