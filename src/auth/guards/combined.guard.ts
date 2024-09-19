import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';

@Injectable()
export class CombinedGuard implements CanActivate {
  constructor(
    private guard1: AccessTokenGuard,
    private guard2: ApiKeysGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [access, iam] = await Promise.all([
      this.guard1.canActivate(context).catch(() => false),
      this.guard2.canActivate(context).catch(() => false),
    ]);

    if (access || iam) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
