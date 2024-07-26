import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantsEntity } from './entity/tenants.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';

describe('TenantsController', () => {
  let tenantsService: TenantsService;
  let tenantsController: TenantsController;

  const tenant = {
    id: '1f9f150a-6329-4f10-af33-00bf402d53b5',
    name: 'UBS',
    description: 'Project UBS',
    createdAt: new Date('2024-07-15T14:37:36.672Z'),
    updatedAt: new Date('2024-07-15T14:37:36.672Z'),
  };

  const mockTenantsEntity = [tenant].map((tenant) => new TenantsEntity(tenant));

  const mockTenantEntity = new TenantsEntity(tenant);

  const TenantsMock = {
    findAll: jest.fn().mockResolvedValueOnce([tenant]),
    findOne: jest.fn().mockResolvedValueOnce(tenant),
    create: jest.fn().mockResolvedValueOnce(tenant),
    update: jest.fn().mockResolvedValueOnce(tenant),
    delete: jest.fn().mockResolvedValueOnce({ status: 'success', data: null }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        InfluxdbClientModule,
      ],
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: TenantsMock,
        },
      ],
    }).compile();

    tenantsService = module.get<TenantsService>(TenantsService);
    tenantsController = module.get<TenantsController>(TenantsController);
  });

  it('should be defined', () => {
    expect(tenantsService).toBeDefined();
    expect(tenantsController).toBeDefined();
  });

  describe('findAll', () => {
    const expectedResponse = {
      status: 'success',
      data: { tenants: mockTenantsEntity },
    };

    it('should return data list of tenants', async () => {
      jest
        .spyOn(tenantsService, 'findAll')
        .mockResolvedValue([{ ...tenant, bucketId: 'bucket-test' }]);

      const result = await tenantsController.findAll();

      expect(tenantsService.findAll);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const expectedResponse = {
      status: 'success',
      data: { tenant: mockTenantEntity },
    };

    it('should return one data of tenant', async () => {
      const id = '1f9f150a-6329-4f10-af33-00bf402d53b5';

      jest
        .spyOn(tenantsService, 'findOne')
        .mockResolvedValue({ ...tenant, bucketId: 'bucket-test' });

      const result = await tenantsController.findOne(id);

      expect(tenantsService.findOne).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: { tenant: mockTenantEntity },
    };

    it('should return status success and data tenant', async () => {
      const payload = {
        name: 'UBS',
        description: 'Project UBS',
      };

      jest
        .spyOn(tenantsService, 'create')
        .mockResolvedValue({ ...tenant, bucketId: 'bucket-test' });

      const result = await tenantsController.create(payload);

      expect(tenantsService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const expectedResponse = {
      status: 'success',
      data: { tenant: mockTenantEntity },
    };

    it('should return status success and data tenant', async () => {
      const id = '1f9f150a-6329-4f10-af33-00bf402d53b5';
      const payload = {
        name: 'UBS',
        description: 'Project UBS',
      };

      jest
        .spyOn(tenantsService, 'update')
        .mockResolvedValue({ ...tenant, bucketId: 'bucket-test' });

      const result = await tenantsController.update(id, payload);

      expect(tenantsService.update).toHaveBeenCalledWith({
        where: { id },
        data: payload,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('delete', () => {
    const expectedResponse = {
      status: 'success',
      data: null,
    };

    it('should return status success', async () => {
      const id = '1f9f150a-6329-4f10-af33-00bf402d53b5';
      const result = await tenantsController.delete(id);

      expect(tenantsService.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });
});
