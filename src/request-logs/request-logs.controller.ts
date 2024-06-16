import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { RequestLogsService } from './request-logs.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

@Controller('request-logs')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class RequestLogsController {
  constructor(private requestLogs: RequestLogsService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findAll(
    @Query('cursor') cursor: string,
    @Query('take') take: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    let requestLogs: Array<any> = [];
    if (startTime && endTime) {
      requestLogs = await this.requestLogs.findMany({
        take: parseInt(take),
        where: {
          createdAt: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } else {
      requestLogs = await this.requestLogs.findMany({
        take: parseInt(take),
        cursor: { id: parseInt(cursor) },
        skip: 1,
        orderBy: {
          createdAt: 'asc',
        },
      });
    }

    return {
      status: 'success',
      data: { requestLogs },
    };
  }
}
