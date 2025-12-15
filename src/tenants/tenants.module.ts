import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { AccessControlService } from 'src/shared/access-control.service';
import { RoleGuard } from 'src/role/guards/role.guard';

@Module({
  imports: [AuthModule, InfluxdbClientModule],
  controllers: [TenantsController],
  providers: [TenantsService, AccessControlService, RoleGuard],
  exports: [TenantsService],
})
export class TenantsModule {}
