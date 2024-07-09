import { Module } from '@nestjs/common';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { MqttAclModule } from 'src/mqtt-acl/mqtt-acl.module';
import { MqttAccountModule } from 'src/mqtt-account/mqtt-account.module';

@Module({
  controllers: [ProvisioningController],
  providers: [ProvisioningService],
  imports: [ApiKeysModule, MqttAclModule, MqttAccountModule],
})
export class ProvisioningModule {}
