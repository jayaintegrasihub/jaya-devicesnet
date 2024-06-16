import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { REQUEST_LOG_DATA } from './request-logs.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { getClientIp } from 'request-ip';
import { Prisma } from '@prisma/client';

@Injectable()
export class RequestLogsInterceptor implements NestInterceptor {
  logger = new Logger(RequestLogsInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private prisma: PrismaService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        this.saveLog(context, 'success', response);
        return response;
      }),
      catchError((err) => {
        this.saveLog(context, 'error');
        return throwError(() => err);
      }),
    );
  }

  async saveLog(
    context: ExecutionContext,
    status: 'success' | 'error',
    response?: any,
  ) {
    const requestLog = this.reflector.get(
      REQUEST_LOG_DATA,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const ip = getClientIp(request) ?? 'null';

    if (requestLog) {
      const data: Prisma.RequestLogsCreateInput = {
        auditLog: requestLog[0],
        ipAddress: ip,
        body: JSON.stringify(request.body),
        params: JSON.stringify(request.params),
        status: status,
        response: JSON.stringify(response) ?? 'none',
        user: request.user.username,
      };
      try {
        await this.prisma.requestLogs.create({
          data,
        });
      } catch (error) {
        this.logger.error('Unable to save request log', error);
      }
    }
  }
}
