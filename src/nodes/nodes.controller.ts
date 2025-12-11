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
import { NodesService } from './nodes.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { NodesEntity } from './entity/node.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Prisma } from '@prisma/client';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { ApiKeysGuard } from 'src/api-keys/guards/api-keys.guard';
import { RoleGuard } from 'src/role/guards/role.guard';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/role/decorator/roles.decorator';

@Controller('nodes')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class NodesController {
  constructor(private nodesService: NodesService) {}

  @Get('/')
  @RequestLogs('getAllNodes')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async findAll(@Query() params: any) {
    const nodes = await this.nodesService.findAll({ where: params });
    const nodesEntity = nodes.map((node) => new NodesEntity(node));
    return {
      status: 'success',
      data: { nodes: nodesEntity },
    };
  }

  @Get('/alias/:alias')
  // @RequestLogs('getAllNodes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeysGuard)
  async findByAlias(@Param('alias') alias: string) {
    const node = await this.nodesService.findByAlias(alias);
    return {
      status: 'success',
      data: { node },
    };
  }

  @Get('/:id')
  @RequestLogs('getNode')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async findOne(@Param('id') id: string) {
    const Node = await this.nodesService.findOne({ id });
    const NodeEntity = new NodesEntity(Node);
    return {
      status: 'success',
      data: { node: NodeEntity },
    };
  }

  @Post('/')
  @RequestLogs('postNode')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async create(@Body() data: CreateNodeDto) {
    const Node = await this.nodesService.create(
      data as Prisma.NodesCreateInput,
    );
    const NodeEntity = new NodesEntity(Node);
    return {
      status: 'success',
      data: { node: NodeEntity },
    };
  }

  @Patch('/:id')
  @RequestLogs('patchNode')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async update(@Param('id') id: string, @Body() data: UpdateNodeDto) {
    const node = await this.nodesService.update({
      where: { id },
      data: data as Prisma.NodesUpdateInput,
    });
    const NodeEntity = new NodesEntity(node);
    return {
      status: 'success',
      data: { node: NodeEntity },
    };
  }

  @Delete('/:id')
  @RequestLogs('deleteNode')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async delete(@Param('id') id: string) {
    await this.nodesService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }
}
