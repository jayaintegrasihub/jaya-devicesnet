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
import { TypesService } from './types.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { TypesEntity } from './entity/types.entity';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { RoleGuard } from 'src/role/guards/role.guard';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/role/decorator/roles.decorator';

@Controller('types')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class TypesController {
  constructor(private typesService: TypesService) {}

  @Get('/')
  @RequestLogs('getAllTypes')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async findAll(@Query() params: any) {
    const types = await this.typesService.findAll({ where: params });
    const typesEntity = types.map(
      ({ createdAt: _x, updatedAt: _y, ...type }) => new TypesEntity(type),
    );
    return {
      status: 'success',
      data: { types: typesEntity },
    };
  }

  @Get('/:id')
  @RequestLogs('getType')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async findOne(@Param('id') id: string) {
    const type = await this.typesService.findOne({ id });
    const typeEntity = new TypesEntity(type);
    return {
      status: 'success',
      data: { type: typeEntity },
    };
  }

  @Post('/')
  @RequestLogs('postType')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async create(@Body() data: CreateTypeDto) {
    const type = await this.typesService.create(data);
    const typeEntity = new TypesEntity(type);
    return {
      status: 'success',
      data: { type: typeEntity },
    };
  }

  @Patch('/:id')
  @RequestLogs('patchType')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async update(@Param('id') id: string, @Body() data: UpdateTypeDto) {
    const type = await this.typesService.update({
      where: { id },
      data,
    });
    const typeEntity = new TypesEntity(type);
    return {
      status: 'success',
      data: { type: typeEntity },
    };
  }

  @Delete('/:id')
  @RequestLogs('deleteType')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async delete(@Param('id') id: string) {
    await this.typesService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }
}
