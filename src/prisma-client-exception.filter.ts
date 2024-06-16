import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

export type ErrorCodesStatusMapping = {
  [key: string]: number;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private errorCodesStatusMapping: ErrorCodesStatusMapping = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
    P2003: HttpStatus.BAD_REQUEST,
    P1001: HttpStatus.INTERNAL_SERVER_ERROR,
  };

  catch(exception: any, host: ArgumentsHost): void {
    const statusCode = this.errorCodesStatusMapping[exception.code];
    const message =
      `[${exception.code}]: ` + this.exceptionShortMessage(exception.message);

    if (host.getType() === 'http') {
      if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
        return super.catch(new HttpException({ message }, statusCode), host);
      }

      return super.catch(
        new HttpException({ status: 'fail', data: { message } }, statusCode),
        host,
      );
    }
  }

  private exceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));
    return shortMessage
      .substring(shortMessage.indexOf('\n'))
      .replace(/\n/g, '')
      .trim();
  }
}
