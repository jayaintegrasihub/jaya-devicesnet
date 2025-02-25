import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Sse,
  UseGuards,
  UseInterceptors,
  UsePipes,
  Body,
  Inject,
  Res,
} from '@nestjs/common';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { TelemetryService } from './telemetry.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { from, interval, map, Observable, startWith, switchMap } from 'rxjs';
import { CombinedGuard } from 'src/api-keys/guards/combined.guard';
import { CommandPayloadDto } from './dto/command.dto';
import { MQTT_CLIENT_INSTANCE } from 'src/mqtt/mqtt.constant';
import { Response } from 'express';
import { MqttClient } from '@nestjs/microservices/external/mqtt-client.interface';

@Controller('telemetry')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class TelemetryController {
  constructor(
    private telemetryService: TelemetryService,
    @Inject(MQTT_CLIENT_INSTANCE) private mqtt: MqttClient,
  ) {}

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
  @UseGuards(CombinedGuard)
  async findHistory(@Query() query: any, @Param('device') device: string) {
    const telemetries = await this.telemetryService.findHistory(query, device);
    return {
      status: 'success',
      data: { telemetries },
    };
  }

  @Get('/status-device/:tenant')
  @RequestLogs('getStatusDeviceTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async statusDevice(
    @Param('tenant') tenant: string,
    @Query('type') type: string,
  ) {
    const statusDevices = await this.telemetryService.statusDevices(
      tenant,
      type,
    );
    return {
      status: 'success',
      data: { statusDevices },
    };
  }

  @Get('/access-token/status-device/:tenant')
  @RequestLogs('getStatusDeviceTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async accessTokenStatusDevice(
    @Param('tenant') tenant: string,
    @Query('type') type: string,
  ) {
    const statusDevices = await this.telemetryService.statusDevices(
      tenant,
      type,
    );
    return {
      status: 'success',
      data: { statusDevices },
    };
  }

  @Get('/runtime/:tenant')
  @RequestLogs('getRuntimeTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async runtime(@Param('tenant') tenant: string, @Query() query: any) {
    const { startTime, endTime, type, field } = query;
    const runtime = await this.telemetryService.runtime(
      startTime,
      endTime,
      tenant,
      type,
      field,
    );
    return {
      status: 'success',
      data: { runtime },
    };
  }

  @Get('/details/:device')
  @RequestLogs('getDetailsTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findLastWithStatus(
    @Query() query: any,
    @Param('device') device: string,
  ) {
    const telemetry = await this.telemetryService.findLast(query, device);
    return {
      status: 'success',
      data: telemetry,
    };
  }

  @Sse('/access-token/status-device/sse/:tenant')
  @RequestLogs('getStatusDeviceTelemetrySSE')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  sse(
    @Param('tenant') tenant: string,
    @Query('type') type: string,
  ): Observable<MessageEvent> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(() => from(this.telemetryService.statusDevices(tenant, type))),
      map(
        (statusDevices) =>
          ({
            data: {
              status: 'success',
              data: { statusDevices },
            },
          }) as MessageEvent,
      ),
    );
  }

  @Sse('/details/sse/:device')
  @RequestLogs('getDetailsTelemetrySse')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  findLastWithStatusSse(@Query() query: any, @Param('device') device: string) {
    return interval(10000).pipe(
      startWith(0),
      switchMap(() => from(this.telemetryService.findLast(query, device))),
      map(
        (telemetry) =>
          ({
            data: {
              status: 'success',
              data: { telemetry },
            },
          }) as MessageEvent,
      ),
    );
  }

  @Get('/completeness/:serialNumber')
  @RequestLogs('getCompletenessTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async completeness(
    @Param('serialNumber') serialNumber: string,
    @Query() query: any,
  ) {
    const { startTime, endTime } = query;
    const completeness = await this.telemetryService.completeness(
      startTime,
      endTime,
      serialNumber,
    );
    return {
      status: 'success',
      data: { completeness },
    };
  }

  @Post('/command')
  @RequestLogs('commandHandlerTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CombinedGuard)
  async command(@Body() data: CommandPayloadDto, @Res() res: Response) {
    if (!this.mqtt.connected) {
      res.status(503).send({
        status: 503,
        message: 'Service not connected to message broker',
      });
    }

    const command = await this.telemetryService.postCommandToMQTT(data);
    return {
      status: 'success',
      data: { command },
    };
  }
}
