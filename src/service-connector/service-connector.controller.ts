import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { GatewaysEntity } from 'src/gateways/entity/gateways.entity';
import { GatewaysService } from 'src/gateways/gateways.service';
import { NodesEntity } from 'src/nodes/entity/node.entity';
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
    let gateway: GatewaysEntity | null = null;
    let node: NodesEntity | null = null;

    try {
      gateway = await this.gatewaysService.findOneWithSerialNumber({
        serialNumber: id,
      });
    } catch (error) {}

    try {
      node = await this.nodesService.findOneWithSerialNumber({
        serialNumber: id,
      });
    } catch (error) {}

    if (!gateway && !node) {
      throw new NotFoundException('Device not found');
    }

    return {
      status: 'success',
      data: { device: gateway || node },
    };
  }
}
