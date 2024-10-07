import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GatewaysEntity } from './entity/gateways.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { Prisma } from '@prisma/client';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';

@Controller('gateways')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class GatewaysController {
  constructor(private gatewaysService: GatewaysService) {}

  @Get('/')
  @RequestLogs('getAllGateways')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findAll(@Query() params: any) {
    const gateways = await this.gatewaysService.findAll({ where: params });
    const gatewaysEntity = gateways.map(
      (gateway: Partial<GatewaysEntity>) => new GatewaysEntity(gateway),
    );
    return {
      status: 'success',
      data: { gateways: gatewaysEntity },
    };
  }

  @Get('/:id')
  @RequestLogs('getGateway')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findOne(@Param('id') id: string) {
    const gateway = await this.gatewaysService.findOne(id);
    const gatewaysEntity = new GatewaysEntity(gateway);
    return {
      status: 'success',
      data: { gateway: gatewaysEntity },
    };
  }

  @Post('/')
  @RequestLogs('postGateway')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async create(@Body() data: CreateGatewayDto) {
    const gateway = await this.gatewaysService.create(
      data as Prisma.GatewaysCreateInput,
    );
    const gatewaysEntity = new GatewaysEntity(gateway);
    return {
      status: 'success',
      data: { gateway: gatewaysEntity },
    };
  }

  @Patch('/:id')
  @RequestLogs('patchGateway')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async update(@Param('id') id: string, @Body() data: UpdateGatewayDto) {
    const gateway = await this.gatewaysService.update({
      where: { id },
      data: data as Prisma.GatewaysUpdateInput,
    });
    const gatewaysEntity = new GatewaysEntity(gateway);
    return {
      status: 'success',
      data: { gateway: gatewaysEntity },
    };
  }

  @Delete('/:id')
  @RequestLogs('deleteGateway')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async delete(@Param('id') id: string) {
    await this.gatewaysService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }

  @Get('/find-node/:id')
  @RequestLogs('findNode')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findNode(@Param('id') id: string) {
    const nodes = await this.gatewaysService.findNode(id);
    return {
      status: 'success',
      data: { nodes },
    };
  }
}
