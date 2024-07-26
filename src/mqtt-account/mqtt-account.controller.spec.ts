import { Test, TestingModule } from '@nestjs/testing';
import { MqttAccountController } from './mqtt-account.controller';
import { MqttAccountService } from './mqtt-account.service';
import { MqttAccountEntity } from './entity/mqtt-account.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('MqttAccountController', () => {
  let mqttAccountService: MqttAccountService;
  let mqttAccountController: MqttAccountController;

  const mqttAccount = {
    id: 1,
    serialNumber: 'sigittest',
    username: 'sigittest',
    password: 'qcmcus',
    isSuperUser: false,
    createdAt: new Date('2024-07-14T15:31:14.053Z'),
    updatedAt: new Date('2024-07-14T15:31:14.053Z'),
  };

  const mockMqttAccountEntity = [mqttAccount].map(
    (mqttAccount) => new MqttAccountEntity(mqttAccount),
  );

  const mockmqttAccountEntity = new MqttAccountEntity(mqttAccount);

  const mqttAccountMock = {
    findAll: jest.fn().mockResolvedValueOnce([mqttAccount]),
    findOne: jest.fn().mockResolvedValueOnce(mqttAccount),
    create: jest.fn().mockResolvedValueOnce(mqttAccount),
    delete: jest.fn().mockResolvedValueOnce({ status: 'success', data: null }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
      ],
      controllers: [MqttAccountController],
      providers: [
        {
          provide: MqttAccountService,
          useValue: mqttAccountMock,
        },
      ],
    }).compile();

    mqttAccountService = module.get<MqttAccountService>(MqttAccountService);
    mqttAccountController = module.get<MqttAccountController>(
      MqttAccountController,
    );
  });

  it('should be defined', () => {
    expect(mqttAccountService).toBeDefined();
    expect(mqttAccountController).toBeDefined();
  });

  describe('findAll', () => {
    const expectedResponse = {
      status: 'success',
      data: { mqttAccounts: mockMqttAccountEntity },
    };

    it('should return data list of mqttAccounts', async () => {
      const params = { someFilter: 'someValue' };

      jest
        .spyOn(mqttAccountService, 'findAll')
        .mockResolvedValue([mqttAccount]);

      const result = await mqttAccountController.findAll(params);

      expect(mqttAccountService.findAll).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const expectedResponse = {
      status: 'success',
      data: { mqttAccount: mockmqttAccountEntity },
    };

    it('should return one data of mqttAccounts', async () => {
      const serialNumber = 'sigittest';

      jest.spyOn(mqttAccountService, 'findOne').mockResolvedValue(mqttAccount);

      const result = await mqttAccountController.findOne(serialNumber);

      expect(mqttAccountService.findOne).toHaveBeenCalledWith({ serialNumber });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: { mqttAccount: mockmqttAccountEntity },
    };

    it('should return status success and data mqttAccount', async () => {
      const payload = {
        serialNumber: 'sigittest',
      };

      jest.spyOn(mqttAccountService, 'create').mockResolvedValue(mqttAccount);

      const result = await mqttAccountController.create(payload);

      expect(mqttAccountService.create).toHaveBeenCalledWith(
        payload.serialNumber,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('delete', () => {
    const expectedResponse = {
      status: 'success',
      data: null,
    };

    it('should return status success', async () => {
      const serialNumber = 'sigittest';
      const result = await mqttAccountController.delete(serialNumber);

      expect(mqttAccountService.delete).toHaveBeenCalledWith({ serialNumber });
      expect(result).toEqual(expectedResponse);
    });
  });
});
