import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const res: { [key: string]: any } = {};
    const errObj = exception.getResponse();

    /** Handle Zod Validation */
    const isBadRequest = status === 400;
    const isResponseIsObject = typeof errObj === 'object';
    if (isBadRequest && isResponseIsObject && 'message' in errObj) {
      res.status = 'fail';
      res.data = {};
      const messages = (errObj as any).message as string[];
      messages.forEach((errMess) => {
        const [key, value] = errMess.split(':');
        res.data[key] = value;
      });
    }

    if (status === 404) {
      res.status = 'fail';
      res.data = errObj || { message: errObj };
    }

    if (status === 401) {
      res.status = 'fail';
      res.data = errObj || { auth: 'Unauthorized' };
    }

    if (status === 500) {
      res.status = 'error';
      res.message = 'Internal Server Error';
    }

    response.status(status).json(res);
  }
}
