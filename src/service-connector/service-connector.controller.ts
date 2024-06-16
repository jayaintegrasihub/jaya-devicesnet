import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { GatewaysService } from 'src/gateways/gateways.service';
import { NodesService } from 'src/nodes/nodes.service';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';

@Controller('service-connector')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class ServiceConnectorController {
  constructor(
    private gatewaysService: GatewaysService,
    private nodesService: NodesService,
  ) {}

  @Get('/:id')
  @RequestLogs('findDeviceOnServiceConnector')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async findAll(@Param('id') id: string) {
    let gateway: any = null;
    let node: any = null;
    try {
      [gateway, node] = await Promise.all([
        this.gatewaysService.findOneWithSerialNumber({ serialNumber: id }),
        this.nodesService.findOneWithSerialNumber({ serialNumber: id }),
      ]);
    } catch (error) {}

    return {
      status: 'success',
      data: { device: gateway || node },
    };
  }
}
