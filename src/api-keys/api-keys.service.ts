import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ApiKeysWhereUniqueInput;
    where?: Prisma.ApiKeysWhereInput;
    orderBy?: Prisma.ApiKeysOrderByWithRelationInput;
  }) {
    return this.prisma.apiKeys.findMany({ ...params });
  }

  findOne(where: Prisma.ApiKeysWhereInput) {
    return this.prisma.apiKeys.findFirstOrThrow({
      where,
    });
  }

  async create(data: Prisma.ApiKeysCreateInput) {
    const api = await this.prisma.apiKeys.create({ data });
    return api;
  }

  async update(params: {
    where: Prisma.ApiKeysWhereUniqueInput;
    data: Prisma.ApiKeysUpdateInput;
  }) {
    return await this.prisma.apiKeys.update(params);
  }

  delete(where: Prisma.ApiKeysWhereUniqueInput) {
    return this.prisma.apiKeys.delete({ where });
  }

  signAccessToken(
    data: { username: string },
    secretToken: string,
    expires: string,
  ) {
    return this.jwtService.signAsync(data, {
      secret: secretToken,
      expiresIn: expires,
    });
  }

  verifyAccessToken(token: string, secretToken: string) {
    return this.jwtService.verifyAsync(token, {
      secret: secretToken,
    });
  }

  uniqueStringSecure(length: number, encoding: BufferEncoding) {
    return crypto.randomBytes(length).toString(encoding);
  }

  convertDatesTotDaysFormat(targetDate: Date) {
    const diff = targetDate.getTime() - new Date().getTime();
    const differenceInDays = Math.floor(diff / (24 * 60 * 60 * 1000));

    return `${differenceInDays}d`;
  }
}
