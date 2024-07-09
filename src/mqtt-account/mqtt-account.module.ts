import { Module } from '@nestjs/common';
import { MqttAccountController } from './mqtt-account.controller';
import { MqttAccountService } from './mqtt-account.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MqttAccountController],
  providers: [MqttAccountService],
  imports: [AuthModule],
  exports: [MqttAccountService],
})
export class MqttAccountModule {}
