import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const AuthPayload = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
