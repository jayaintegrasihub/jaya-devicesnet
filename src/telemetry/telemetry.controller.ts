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
  InternalServerErrorException,
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
import { MqttClient } from '@nestjs/microservices/external/mqtt-client.interface';
import { Column } from 'exceljs';
import { ExcelService } from 'src/utils/excel/excel.service';
import { Response } from 'express';

@Controller('telemetry')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class TelemetryController {
  constructor(
    private telemetryService: TelemetryService,
    @Inject(MQTT_CLIENT_INSTANCE) private mqtt: MqttClient,
    private excelService: ExcelService,
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

  @Sse('/last/sse/:device')
  @RequestLogs('getLastTelemetrySse')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  findLastSse(
    @Query() query: any,
    @Param('device') device: string,
  ): Observable<MessageEvent> {
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

  @Get('/history-devices')
  @RequestLogs('getHistoryTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CombinedGuard)
  async findHistoryDevices(@Query() query: any) {
    const telemetries = await this.telemetryService.findHistoryDevices(query);
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

  @Sse('/status-device/sse/:tenant')
  @RequestLogs('getStatusDeviceTelemetrySse')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  statusDeviceSse(
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

  @Sse('/status-telemetry-device/sse/:tenant')
  @RequestLogs('getStatusDeviceTelemetrySse')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  statusTelemetryDeviceSse(
    @Param('tenant') tenant: string,
    @Query('type') type: string,
  ): Observable<MessageEvent> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(() =>
        from(this.telemetryService.statusTelemetryDevice(tenant, type)),
      ),
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

  @Get('/runtime-device/:serialNumber')
  @RequestLogs('getRuntimeTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async runtimePerDevice(
    @Param('serialNumber') serialNumber: string,
    @Query() query: any,
  ) {
    const { startTime, endTime, field } = query;
    const runtime = await this.telemetryService.runtimePerDevice(
      startTime,
      endTime,
      serialNumber,
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

  @Sse('/gateway-health/:device')
  @RequestLogs('getGatewayHealth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  gatewayHealth(@Param('device') device: string): Observable<MessageEvent> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(() => from(this.telemetryService.gatewayHealth(device))),
      map(
        (gatewayHealth) =>
          ({
            data: {
              status: 'success',
              data: { gatewayHealth },
            },
          }) as MessageEvent,
      ),
    );
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
    const { startTime, endTime, timezone } = query;
    const completeness = await this.telemetryService.completeness(
      startTime,
      endTime,
      serialNumber,
      timezone,
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
  async command(@Body() data: CommandPayloadDto) {
    if (!this.mqtt.connected) {
      throw new InternalServerErrorException(
        'server not connected to message broker',
      );
    }
    const command = await this.telemetryService.postCommandToMQTT(data);
    return {
      status: 'success',
      data: { command },
    };
  }

  @Get('/health-history/:serialNumber')
  @RequestLogs('getHealthHistory')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async healthHistory(
    @Param('serialNumber') serialNumber: string,
    @Query() query: any,
  ) {
    const { startTime, endTime } = query;
    const healthHistory = await this.telemetryService.healthHistory(
      serialNumber,
      startTime,
      endTime,
    );
    return {
      status: 'success',
      data: { healthHistory },
    };
  }

  @Get('/report-completeness')
  @RequestLogs('getCompletenessTelemetry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async reportCompleteness(@Query() query: any) {
    const { tenantId, type, startTime, endTime, timezone } = query;

    const report = await this.telemetryService.reportCompleteness(
      tenantId,
      type,
      startTime,
      endTime,
      timezone,
    );
    return {
      status: 'success',
      data: { report },
    };
  }

  @Get('/report-completeness/:serialNumber')
  @RequestLogs('getCompletenessbySerialNumber')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async reportCompletenessBySerialNumber(
    @Query() query: any,
    @Param('serialNumber') serialNumber: string,
  ) {
    const { startTime, endTime, timezone } = query;
    const completenessDevice =
      await this.telemetryService.reportCompletenessBySerialNumber(
        serialNumber,
        startTime,
        endTime,
        timezone,
      );
    return {
      status: 'success',
      data: { completenessDevice },
    };
  }

  @Get('export/report-completeness')
  // @RequestLogs('exportCompleteness')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AccessTokenGuard)
  async exportReportCompleteness(@Query() query: any, @Res() res: Response) {
    const { tenantId, type, startTime, endTime, timezone } = query;
    const reports = await this.telemetryService.reportCompleteness(
      tenantId,
      type,
      startTime,
      endTime,
      timezone,
    );

    const gatewaysReport = reports.gateways
      .map((gateway) => {
        const alias = gateway.alias;
        return gateway.report.map((r: any) => ({
          alias,
          expectedDataCount: Math.round(r.duration / 10),
          percentage: ((r.count / (r.duration / 10)) * 100).toFixed(1),
          ...r,
        }));
      })
      .flat();
    const nodesReport = reports.nodes
      .map((node) => {
        const alias = node.alias;
        return node.report.map((r: any) => ({
          alias,
          expectedDataCount: Math.round(r.duration / 10),
          percentage: ((r.count / (r.duration / 10)) * 100).toFixed(1),
          ...r,
        }));
      })
      .flat();
    const deviceReport = gatewaysReport.concat(nodesReport);

    const columns: Partial<Column>[] = [
      { header: 'alias', key: 'alias', width: 10 },
      { header: 'time', key: '_start', width: 10 },
      { header: 'device', key: 'device', width: 10 },
      { header: 'count', key: 'count', width: 10 },
      { header: 'duration', key: 'duration', width: 10 },
      { header: 'expected data count', key: 'expectedDataCount', width: 10 },
      { header: 'percentage', key: 'percentage', width: 10 },
    ];

    const buffer = await this.excelService.generateExcel(
      'Report',
      columns,
      deviceReport,
      timezone,
    );

    const filename = new Date().toISOString() + '_Report_Completeness.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('export/report-completeness/:serialNumber')
  // @RequestLogs('exportCompleteness')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AccessTokenGuard)
  async exportCompletenessBySerialNumber(
    @Query() query: any,
    @Param('serialNumber') serialNumber: string,
    @Res() res: Response,
  ) {
    const { startTime, endTime, timezone } = query;
    const result = await this.telemetryService.reportCompletenessBySerialNumber(
      serialNumber,
      startTime,
      endTime,
      timezone,
    );
    const alias = result.alias;
    const reports = result.report.map((x: any) => ({
      alias,
      expectedDataCount: Math.round(x.duration / 10),
      percentage: ((x.count / (x.duration / 10)) * 100).toFixed(1),
      ...x,
    }));

    const columns: Partial<Column>[] = [
      { header: 'alias', key: 'alias', width: 10 },
      { header: 'time', key: '_start', width: 10 },
      { header: 'device', key: 'device', width: 10 },
      { header: 'count', key: 'count', width: 10 },
      { header: 'duration', key: 'duration', width: 10 },
      { header: 'expected data count', key: 'expectedDataCount', width: 10 },
      { header: 'percentage', key: 'percentage', width: 10 },
    ];

    const buffer = await this.excelService.generateExcel(
      'Report',
      columns,
      reports,
      timezone,
    );

    const filename =
      new Date().toISOString() + '_Report_Completeness_By_SerialNumber.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }
}
