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
import { ApiKeysService } from './api-keys.service';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CreateApiKeysDto } from './dto/create-api-keys.dto';
import { UpdateApiKeysDto } from './dto/update-api-keys.dto';
import { ApiKeysEntity } from './entity/api-keys-entity';
import { ApiKeysGuard } from './guards/api-keys.guard';

@Controller('api-keys')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Get('/')
  @RequestLogs('getAllApiKeys')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findAll(@Query() params: any) {
    const apikeys = await this.apiKeysService.findAll({ where: params });
    const apiKeysEntity = apikeys.map(
      ({ createdAt: _x, updatedAt: _y, ...apikeys }) =>
        new ApiKeysEntity(apikeys),
    );
    return {
      status: 'success',
      data: { apiKeys: apiKeysEntity },
    };
  }

  @Get('/:id')
  @RequestLogs('getApiKey')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findOne(@Param('id') id: string) {
    const apiKey = await this.apiKeysService.findOne({ id });
    const apiKeyEntity = new ApiKeysEntity(apiKey);
    return {
      status: 'success',
      data: { apiKey: apiKeyEntity },
    };
  }

  @Post('/')
  @RequestLogs('postApiKeys')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async create(@Body() data: CreateApiKeysDto) {
    const expiresIn = this.apiKeysService.convertDatesTotDaysFormat(
      new Date(data.expiresAt),
    );
    // generate secret key here
    const secretKey = this.apiKeysService.uniqueStringSecure(64, 'base64');
    const apiKey = await this.apiKeysService.signAccessToken(
      {
        username: data.username,
      },
      secretKey,
      expiresIn,
    );

    const api = await this.apiKeysService.create({
      apiKey,
      secretKey,
      ...data,
    });
    return {
      status: 'success',
      data: { apiKey: api },
    };
  }

  @Patch('/:id')
  @RequestLogs('patchApiKeys')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async update(@Param('id') id: string, @Body() data: UpdateApiKeysDto) {
    const apikeys = await this.apiKeysService.update({
      where: { id },
      data,
    });
    const apikeysEntity = new ApiKeysEntity(apikeys);
    return {
      status: 'success',
      data: { api: apikeysEntity },
    };
  }

  @Delete('/:id')
  @RequestLogs('deleteApiKeys')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async delete(@Param('id') id: string) {
    await this.apiKeysService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }

  @Get('/test/test')
  @RequestLogs('testApiKeys')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  test() {
    return {
      status: 'success',
      data: null,
    };
  }
}
