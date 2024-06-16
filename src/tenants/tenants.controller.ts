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
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { TenantsEntity } from './entity/tenants.entity';
import { CreateTenantDto } from './dto/create-tenants.dto';
import { UpdateTenantDto } from './dto/update-tenants.dto';
import { RequestLogs } from 'src/request-logs/request-logs.decorator';

@Controller('tenants')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('/')
  @RequestLogs('getAllTenants')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findAll() {
    const tenants = await this.tenantsService.findAll({});
    const tenantsEntity = tenants.map((tenant) => new TenantsEntity(tenant));

    return {
      status: 'success',
      data: { tenants: tenantsEntity },
    };
  }

  @Get('/:id')
  @RequestLogs('getTenant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async findOne(@Param('id') id: string) {
    const tenant = await this.tenantsService.findOne({ id });
    const tenantEntity = new TenantsEntity(tenant);
    return {
      status: 'success',
      data: { tenant: tenantEntity },
    };
  }

  @Post('/')
  @RequestLogs('postTenant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async create(@Body() data: CreateTenantDto) {
    const tenant = await this.tenantsService.create(data);
    const tenantEntity = new TenantsEntity(tenant);
    return {
      status: 'success',
      data: { tenant: tenantEntity },
    };
  }

  @Patch('/:id')
  @RequestLogs('patchTenant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async update(@Param('id') id: string, @Body() data: UpdateTenantDto) {
    const tenant = await this.tenantsService.update({ where: { id }, data });
    const tenantEntity = new TenantsEntity(tenant);
    return {
      status: 'success',
      data: { tenant: tenantEntity },
    };
  }

  @Delete('/:id')
  @RequestLogs('deleteTenant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async delete(@Param('id') id: string) {
    await this.tenantsService.delete({ id });
    return {
      status: 'success',
      data: null,
    };
  }
}
