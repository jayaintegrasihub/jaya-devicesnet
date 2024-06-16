import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { TelemetryService } from './telemetry.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('telemetry')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class TelemetryController {
  constructor(private telemetryService: TelemetryService) {}

  @Get('/last/:device')
  @RequestLogs('getLastTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async findLast(@Query() query: any, @Param('device') device: string) {
    const telemetry = await this.telemetryService.findLast(query, device);
    return {
      status: 'success',
      data: { ...telemetry },
    };
  }

  @Get('/history/:device')
  @RequestLogs('getHistoryTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async findHistory(@Query() query: any, @Param('device') device: string) {
    const telemetries = await this.telemetryService.findHistory(query, device);
    return {
      status: 'success',
      data: { telemetries },
    };
  }

  @Get('/report/:device')
  @RequestLogs('getReportTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async volumeUsage(@Query() query: any, @Param('device') device: string) {
    const [volumeUsage, tdsReport] = await Promise.all([
      this.telemetryService.volumeUsage(query, device),
      this.telemetryService.tdsReport(query, device),
    ]);
    return {
      status: 'success',
      data: { volumeUsage, tdsReport },
    };
  }

  @Get('/status-device/:tenant')
  @RequestLogs('getStatusDeviceTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async statusDevice(@Param('tenant') tenant: string) {
    const statusDevice = await this.telemetryService.statusDevice(tenant);
    return {
      status: 'success',
      data: { statusDevice },
    };
  }

  @Get('/access-token/status-device/:tenant')
  @RequestLogs('getStatusDeviceTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async accessTokenStatusDevice(@Param('tenant') tenant: string) {
    const statusDevice = await this.telemetryService.statusDevice(tenant);
    return {
      status: 'success',
      data: { statusDevice },
    };
  }
}
