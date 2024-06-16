import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TypesService {
  constructor(private prisma: PrismaService) {}

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TypesWhereUniqueInput;
    where?: Prisma.TypesWhereInput;
    orderBy?: Prisma.TypesOrderByWithRelationInput;
  }) {
    return this.prisma.types.findMany(params);
  }

  findOne(where: Prisma.TypesWhereUniqueInput) {
    return this.prisma.types.findFirstOrThrow({ where });
  }

  create(data: Prisma.TypesCreateInput) {
    return this.prisma.types.create({ data });
  }

  update(params: {
    where: Prisma.TypesWhereUniqueInput;
    data: Prisma.TypesUpdateInput;
  }) {
    return this.prisma.types.update(params);
  }

  delete(where: Prisma.TypesWhereUniqueInput) {
    return this.prisma.types.delete({ where });
  }
}
