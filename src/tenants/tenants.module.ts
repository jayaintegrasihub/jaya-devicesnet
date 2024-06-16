import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';

@Module({
  imports: [AuthModule, InfluxdbClientModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
