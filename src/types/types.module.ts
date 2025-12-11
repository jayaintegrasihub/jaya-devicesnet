import { Module } from '@nestjs/common';
import { TypesController } from './types.controller';
import { TypesService } from './types.service';
import { AuthModule } from 'src/auth/auth.module';
import { AccessControlService } from 'src/shared/access-control.service';
import { RoleGuard } from 'src/role/guards/role.guard';

@Module({
  imports: [AuthModule],
  controllers: [TypesController],
  providers: [TypesService, AccessControlService, RoleGuard],
})
export class TypesModule {}
