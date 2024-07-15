import { Test, TestingModule } from '@nestjs/testing';
import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';
import { GatewaysEntity } from './entity/gateways.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('GatewaysController', () => {
  let gatewaysService: GatewaysService;
  let gatewaysController: GatewaysController;

  const gateway = {
    id: '1be3c4ef-6a64-4560-b958-5c862d0fff32',
    serialNumber: 'HUB744DBD75896C',
    alias: 'Gateway 02',
    description: 'This is gateways test',
    type: 'Water Monitoring',
    group: {
      Floor: '1',
      Building: 'Atas',
    },
    tenantId: 'tenant-id',
    createdAt: new Date('2024-06-24T05:30:36.069Z'),
    updatedAt: new Date('2024-06-24T05:30:36.069Z'),
  };

  const mockGatewaysEntity = [gateway].map(
    (gateway) => new GatewaysEntity(gateway),
  );

  const mockGatewayEntity = new GatewaysEntity(gateway);

  const GatewayMock = {
    findAll: jest.fn().mockResolvedValueOnce([gateway]),
    findOne: jest.fn().mockResolvedValueOnce(gateway),
    create: jest.fn().mockResolvedValueOnce(gateway),
    update: jest.fn().mockResolvedValueOnce(gateway),
    delete: jest.fn().mockResolvedValueOnce({ status: 'success', data: null }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        CacheModule.register(),
        InfluxdbClientModule,
        RedisModule,
      ],
      controllers: [GatewaysController],
      providers: [
        {
          provide: GatewaysService,
          useValue: GatewayMock,
        },
      ],
    }).compile();

    gatewaysService = module.get<GatewaysService>(GatewaysService);
    gatewaysController = module.get<GatewaysController>(GatewaysController);
  });

  it('should be defined', () => {
    expect(gatewaysService).toBeDefined();
    expect(gatewaysController).toBeDefined();
  });

  describe('findAll', () => {
    const expectedResponse = {
      status: 'success',
      data: { gateways: mockGatewaysEntity },
    };

    it('should return data list of gateways', async () => {
      const params = { someFilter: 'someValue' };

      jest.spyOn(gatewaysService, 'findAll').mockResolvedValue([
        {
          ...gateway,
          tenant: {
            id: 'tenant-id',
            name: 'tenant-name',
          },
        },
      ]);

      const result = await gatewaysController.findAll(params);

      expect(gatewaysService.findAll).toHaveBeenCalledWith({ where: params });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const expectedResponse = {
      status: 'success',
      data: { gateway: mockGatewayEntity },
    };

    it('should return onee data of gateways', async () => {
      const id = '1be3c4ef-6a64-4560-b958-5c862d0fff32';

      jest.spyOn(gatewaysService, 'findOne').mockResolvedValue({
        ...gateway,
        tenant: {
          id: 'tenant-id',
          name: 'tenant-name',
        },
      });

      const result = await gatewaysController.findOne(id);

      expect(gatewaysService.findOne).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: { gateway: mockGatewayEntity },
    };

    it('should return status success and data gateway', async () => {
      const payload = {
        serialNumber: 'HUB744DBD75896C',
        alias: 'Gateway 02',
        description: 'This is gateways test',
        group: {
          Building: 'Atas',
          Floor: '1',
        },
        type: 'Water Monitoring',
        tenantId: 'c665711b-5f98-414f-9606-1f044e8a5f45',
      };

      jest.spyOn(gatewaysService, 'create').mockResolvedValue(gateway);

      const result = await gatewaysController.create(payload);

      expect(gatewaysService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const expectedResponse = {
      status: 'success',
      data: { gateway: mockGatewayEntity },
    };

    it('should return status success and data gateway', async () => {
      const id = '1be3c4ef-6a64-4560-b958-5c862d0fff32';
      const payload = {
        serialNumber: 'HUB744DBD75896C',
        alias: 'Gateway 02',
        description: 'This is gateways test',
        group: {
          Building: 'Atas',
          Floor: '1',
        },
        type: 'Water Monitoring',
        tenantId: 'c665711b-5f98-414f-9606-1f044e8a5f45',
      };

      jest.spyOn(gatewaysService, 'update').mockResolvedValue(gateway);

      const result = await gatewaysController.update(id, payload);

      expect(gatewaysService.update).toHaveBeenCalledWith({
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
      const id = '1be3c4ef-6a64-4560-b958-5c862d0fff32';
      const result = await gatewaysController.delete(id);

      expect(gatewaysService.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });
});
