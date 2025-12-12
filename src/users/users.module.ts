import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AccessControlService } from 'src/shared/access-control.service';
import { RoleGuard } from 'src/role/guards/role.guard';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, AccessControlService, RoleGuard],
  exports: [UsersService],
})
export class UsersModule {}
