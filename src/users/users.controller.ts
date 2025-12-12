import {
  Controller,
  Get,
  UsePipes,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Roles } from 'src/role/decorator/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/role/guards/role.guard';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';

@Controller('users')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  @RequestLogs('getAllUsers')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async findAll(@Query() params: any) {
    const users = await this.usersService.findAll({ where: params });
    const usersEntity = users.map(
      ({ password: _p, createdAt: _x, updatedAt: _y, ...user }) => user,
    );
    return {
      status: 'success',
      data: { users: usersEntity },
    };
  }

  @Get(':id')
  @RequestLogs('getUser')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.find({ id });
    const usersEntity = (({ password: _p, ...user }) => user)(user);
    return {
      status: 'success',
      data: { user: usersEntity },
    };
  }

  @Post('/')
  @RequestLogs('createUser')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async create(@Body() createUserDto: CreateUsersDto) {
    const user = this.usersService.create(createUserDto);
    const usersEntity = (({ password: _p, refreshToken: _r, ...user }) => user)(await user);
    return {
      status: 'success',
      data: { user: usersEntity },
    };
  }

  @Patch(':id')
  @RequestLogs('updateUser')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async update(@Param('id') id: string, @Body() data: UpdateUsersDto) {
    const user = await this.usersService.update({
      where: { id }, 
      data
    });
    const usersEntity = (({ password: _p, refreshToken: _r, ...user }) => user)(user);
    return {
      status: 'success',
      data: { user: usersEntity },
    };
  }

  @Delete(':id')
  @RequestLogs('deleteUser')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async delete(@Param('id') id: string) {
    await this.usersService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }
}
