import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '../api-keys.service';

@Injectable()
export class ApiKeysGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey = this.extractTokenFromHeader(request);
    if (!apiKey) {
      throw new UnauthorizedException();
    }

    try {
      const { secretKey, isEnable } = await this.apiKeysService.findOne({
        apiKey,
      });

      if (!isEnable) throw new UnauthorizedException();

      const payload = await this.apiKeysService.verifyAccessToken(
        apiKey,
        secretKey,
      );
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    return request.headers['api-key'] as string;
  }
}
