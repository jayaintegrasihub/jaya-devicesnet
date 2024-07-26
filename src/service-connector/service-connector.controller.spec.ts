import { Test, TestingModule } from '@nestjs/testing';
import { ServiceConnectorController } from './service-connector.controller';
import { ConfigModule } from '@nestjs/config';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NodesModule } from 'src/nodes/nodes.module';
import { GatewaysService } from 'src/gateways/gateways.service';

describe('ServiceConectorController', () => {
  let gatewaysService: GatewaysService;
  let serviceConnectorController: ServiceConnectorController;

  const device = {
    id: 'eaf0387c-8a27-4d58-abd9-0a506a3bdbe4',
    serialNumber: 'MIA744DBD758A68',
    alias: 'Gateway 01',
    description: 'This is gateways test',
    type: 'Water Monitoring',
    group: {
      Floor: '1',
      Building: 'Atas',
    },
    tenantId: 'c665711b-5f98-414f-9606-1f044e8a5f45',
    createdAt: new Date('2024-06-13T07:12:04.365Z'),
    updatedAt: new Date('2024-06-13T07:12:04.365Z'),
    tenant: {
      id: 'c665711b-5f98-414f-9606-1f044e8a5f45',
      name: 'UBS',
    },
  };

  const GatewaysMock = {
    findOneWithSerialNumber: jest.fn().mockResolvedValueOnce(device),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ApiKeysModule,
        NodesModule,
      ],
      controllers: [ServiceConnectorController],
      providers: [
        {
          provide: GatewaysService,
          useValue: GatewaysMock,
        },
      ],
    }).compile();

    gatewaysService = module.get<GatewaysService>(GatewaysService);
    serviceConnectorController = module.get<ServiceConnectorController>(
      ServiceConnectorController,
    );
  });

  it('should be defined', () => {
    expect(GatewaysService).toBeDefined();
    expect(serviceConnectorController).toBeDefined();
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: {
        device,
      },
    };

    it('should return status success with data gateway or node', async () => {
      const payload = {
        serialNumber: 'HUB744DBD75896C',
      };

      jest
        .spyOn(gatewaysService, 'findOneWithSerialNumber')
        .mockResolvedValue(device);

      const result = await serviceConnectorController.findAll(
        payload.serialNumber,
      );

      expect(gatewaysService.findOneWithSerialNumber).toHaveBeenCalledWith({
        serialNumber: payload.serialNumber,
      });
      expect(result).toEqual(expectedResponse);
    });
  });
});
