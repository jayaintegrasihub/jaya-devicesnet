import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ProvisioningService } from './provisioning.service';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { StartProvisionDto } from './dto/start-provisioning.dto';

@Controller('provisioning')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class ProvisioningController {
  constructor(private provisioningService: ProvisioningService) {}

  @Post('/')
  @RequestLogs('startProvisioning')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  provisioning(@Body() data: StartProvisionDto) {
    const { serialNumber } = data;
    return this.provisioningService.provision(serialNumber);
  }
}
