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
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { MqttAclService } from './mqtt-acl.service';
import { MqttAclEntity } from './entity/mqtt-acl.entity';
import { CreateMqttAclDto } from './dto/create-mqtt-acl.dto';
import { Prisma } from '@prisma/client';
import { UpdateMqttAclDto } from './dto/update-mqtt-acl.dto';

@Controller('mqtt-acl')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class MqttAclController {
  constructor(private mqttAclService: MqttAclService) {}

  @Get('/')
  @RequestLogs('getAllMqttAcl')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findAll(@Query() params: any) {
    const mqttAcls = await this.mqttAclService.findAll({ where: params });
    const mqttAclsEntity = mqttAcls.map(
      (gateway: Partial<MqttAclEntity>) => new MqttAclEntity(gateway),
    );
    return {
      status: 'success',
      data: { mqttAcls: mqttAclsEntity },
    };
  }

  @Post('/')
  @RequestLogs('postMqttAcl')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async create(@Body() data: CreateMqttAclDto) {
    const mqttAcl = await this.mqttAclService.create(
      data as Prisma.MqttAclCreateInput,
    );
    const mqttAclEntity = new MqttAclEntity(mqttAcl);
    return {
      status: 'success',
      data: { mqttAcl: mqttAclEntity },
    };
  }

  @Patch('/:id')
  @RequestLogs('patchMqttAcl')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async update(@Param('id') id: number, @Body() data: UpdateMqttAclDto) {
    const mqttAcl = await this.mqttAclService.update({
      where: { id },
      data: data as Prisma.MqttAclUpdateInput,
    });
    const mqttAclEntity = new MqttAclEntity(mqttAcl);
    return {
      status: 'success',
      data: { mqttAcl: mqttAclEntity },
    };
  }

  @Delete('/:id')
  @RequestLogs('deleteMqttAcl')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async delete(@Param('id') id: number) {
    await this.mqttAclService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }
}
