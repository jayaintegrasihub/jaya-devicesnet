import { Global, Module } from '@nestjs/common';
import { RequestLogsController } from './request-logs.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RequestLogsService } from './request-logs.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [RequestLogsController],
  providers: [RequestLogsService],
})
export class RequestLogsModule {}
