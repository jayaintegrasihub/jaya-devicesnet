import { SetMetadata } from '@nestjs/common';
export const REQUEST_LOG_DATA = 'request-logs';

export const RequestLogs = (...args: string[]) =>
  SetMetadata(REQUEST_LOG_DATA, args);
