import { Test, TestingModule } from '@nestjs/testing';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';
import { ConfigModule } from '@nestjs/config';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { MqttAclModule } from 'src/mqtt-acl/mqtt-acl.module';
import { MqttAccountModule } from 'src/mqtt-account/mqtt-account.module';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('ProvisioningController', () => {
  let provisioningService: ProvisioningService;
  let provisioningController: ProvisioningController;

  const gateway = {
    username: 'HUB744DBD75896C',
    password: '14is1o6',
    status: 'success',
  };

  const ProvisionMock = {
    provision: jest.fn().mockResolvedValueOnce(gateway),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ApiKeysModule,
        MqttAclModule,
        MqttAccountModule,
      ],
      controllers: [ProvisioningController],
      providers: [
        {
          provide: ProvisioningService,
          useValue: ProvisionMock,
        },
      ],
    }).compile();

    provisioningService = module.get<ProvisioningService>(ProvisioningService);
    provisioningController = module.get<ProvisioningController>(
      ProvisioningController,
    );
  });

  it('should be defined', () => {
    expect(provisioningService).toBeDefined();
    expect(provisioningController).toBeDefined();
  });

  describe('create', () => {
    const expectedResponse = {
      username: 'HUB744DBD75896C',
      password: '14is1o6',
      status: 'success',
    };

    it('should return status success with data username and password', async () => {
      const payload = {
        serialNumber: 'HUB744DBD75896C',
      };

      jest.spyOn(provisioningService, 'provision').mockResolvedValue(gateway);

      const result = await provisioningController.provisioning(payload);

      expect(provisioningService.provision).toHaveBeenCalledWith(
        payload.serialNumber,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
