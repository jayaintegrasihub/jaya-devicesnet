import { Test, TestingModule } from '@nestjs/testing';
import { MqttAclController } from './mqtt-acl.controller';
import { MqttAclService } from './mqtt-acl.service';
import { MqttAclEntity } from './entity/mqtt-acl.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ACTION, PERMISSION } from '@prisma/client';

describe('MqttAclController', () => {
  let mqttAclService: MqttAclService;
  let mqttAclController: MqttAclController;

  const mqttAcl = {
    id: 1,
    ipaddress: 'testIp',
    username: 'testUser',
    clientid: 'clientid',
    action: ACTION.all,
    permission: PERMISSION.allow,
    topic: 'devices/test',
    qos: null,
    retain: null,
    serialNumber: 'sigittest',
  };

  const mockMqttAclsEntity = [mqttAcl].map(
    (mqttAcl) => new MqttAclEntity(mqttAcl),
  );

  const mockMqttAclEntity = new MqttAclEntity(mqttAcl);

  const mqttAclMock = {
    findAll: jest.fn().mockResolvedValueOnce([mqttAcl]),
    create: jest.fn().mockResolvedValueOnce(mqttAcl),
    update: jest.fn().mockResolvedValueOnce(mqttAcl),
    delete: jest.fn().mockResolvedValueOnce({ status: 'success', data: null }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
      ],
      controllers: [MqttAclController],
      providers: [
        {
          provide: MqttAclService,
          useValue: mqttAclMock,
        },
      ],
    }).compile();

    mqttAclService = module.get<MqttAclService>(MqttAclService);
    mqttAclController = module.get<MqttAclController>(MqttAclController);
  });

  it('should be defined', () => {
    expect(mqttAclService).toBeDefined();
    expect(mqttAclController).toBeDefined();
  });

  describe('findAll', () => {
    const expectedResponse = {
      status: 'success',
      data: { mqttAcls: mockMqttAclsEntity },
    };

    it('should return data list of mqttAcls', async () => {
      const params = { someFilter: 'someValue' };

      jest.spyOn(mqttAclService, 'findAll').mockResolvedValue([mqttAcl]);

      const result = await mqttAclController.findAll(params);

      expect(mqttAclService.findAll).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: { mqttAcl: mockMqttAclEntity },
    };

    it('should return status success and data mqttAcl', async () => {
      const payload = {
        serialNumber: 'sigittest',
        ipaddress: 'testIp',
        clientid: 'clientid',
        username: 'testUser',
        action: ACTION.all,
        permission: PERMISSION.allow,
        topic: 'devices/test',
      };

      jest.spyOn(mqttAclService, 'create').mockResolvedValue(mqttAcl);

      const result = await mqttAclController.create(payload);

      expect(mqttAclService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const expectedResponse = {
      status: 'success',
      data: { mqttAcl: mockMqttAclEntity },
    };

    it('should return status success and data mqttAcl', async () => {
      const id = 1;
      const payload = {
        serialNumber: 'sigittest',
        ipaddress: 'testIpUpdate',
        clientid: 'clientidUpdate',
        username: 'testUserUpdate',
        action: ACTION.all,
        permission: PERMISSION.allow,
        topic: 'devices/test/update',
      };

      jest.spyOn(mqttAclService, 'update').mockResolvedValue(mqttAcl);

      const result = await mqttAclController.update(id, payload);

      expect(mqttAclService.update).toHaveBeenCalledWith({
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
      const id = 1;
      const result = await mqttAclController.delete(id);

      expect(mqttAclService.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });
});
