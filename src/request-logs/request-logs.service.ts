import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RequestLogsService {
  constructor(private prisma: PrismaService) {}
  findMany(params: Prisma.RequestLogsFindManyArgs) {
    return this.prisma.requestLogs.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }
}
