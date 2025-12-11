import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { AuthModule } from 'src/auth/auth.module';
import { AccessControlService } from 'src/shared/access-control.service';
import { RoleGuard } from 'src/role/guards/role.guard';

@Module({
  imports: [AuthModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService , AccessControlService, RoleGuard],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
