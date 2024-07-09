import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { MqttAccountService } from './mqtt-account.service';
import { MqttAccountEntity } from './entity/mqtt-account.entity';
import { CreateMqttAccountDto } from './dto/create-mqtt-account.dto';

@Controller('mqtt-account')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class MqttAccountController {
  constructor(private mqttAccountService: MqttAccountService) {}

  @Get('/')
  @RequestLogs('getAllMqttAccount')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findAll(@Query() params: any) {
    const mqttAccount = await this.mqttAccountService.findAll({
      where: params,
    });
    const mqttAccountEntity = mqttAccount.map(
      (mqttAccount: Partial<MqttAccountEntity>) =>
        new MqttAccountEntity(mqttAccount),
    );
    return {
      status: 'success',
      data: { mqttAccounts: mqttAccountEntity },
    };
  }

  @Get('/:serialNumber')
  @RequestLogs('getMqttAccount')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findOne(@Param('serialNumber') serialNumber: string) {
    const mqttAccount = await this.mqttAccountService.findOne({
      serialNumber: serialNumber,
    });
    if (mqttAccount == null)
      throw new NotFoundException('mqtt account not found');
    const mqttAccountEntity = new MqttAccountEntity(mqttAccount);
    return {
      status: 'success',
      data: { mqttAccount: mqttAccountEntity },
    };
  }

  @Post('/')
  @RequestLogs('postMqttAccount')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async create(@Body() data: CreateMqttAccountDto) {
    const { serialNumber } = data;
    const mqttAccount = await this.mqttAccountService.create(serialNumber);
    const mqttAccountEntity = new MqttAccountEntity(mqttAccount);
    return {
      status: 'success',
      data: { mqttAccount: mqttAccountEntity },
    };
  }

  // No update controller

  @Delete('/:serialNumber')
  @RequestLogs('deleteMqttAccount')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async delete(@Param('serialNumber') serialNumber: string) {
    await this.mqttAccountService.delete({ serialNumber: serialNumber });
    return {
      status: 'success',
      data: null,
    };
  }
}
