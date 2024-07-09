import { Module } from '@nestjs/common';
import { MqttAclController } from './mqtt-acl.controller';
import { MqttAclService } from './mqtt-acl.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MqttAclController],
  providers: [MqttAclService],
  imports: [AuthModule],
  exports: [MqttAclService],
})
export class MqttAclModule {}
