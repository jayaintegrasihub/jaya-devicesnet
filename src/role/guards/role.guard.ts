import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorator/roles.decorator';
import { Role } from '../../enums/role.enum';
import { AccessControlService } from '../../shared/access-control.service';
import { AuthService } from '../../auth/auth.service';

export class TokenDto {
  id: string;
  username: string;
  role: string;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
    private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const payload = await this.authService.verifyAccessToken(token);
      
      request['user'] = payload;
      
      for (let role of requiredRoles) {
        const result = this.accessControlService.isAuthorized({
          requiredRole: role,
          currentRole: payload.role as Role,
        });

        if (result) {
          return true;
        }
      }
      
      throw new ForbiddenException('Insufficient permissions');
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}