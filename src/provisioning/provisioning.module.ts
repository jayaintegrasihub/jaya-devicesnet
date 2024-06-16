import { Module } from '@nestjs/common';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';

@Module({
  controllers: [ProvisioningController],
  providers: [ProvisioningService],
  imports: [ApiKeysModule],
})
export class ProvisioningModule {}
