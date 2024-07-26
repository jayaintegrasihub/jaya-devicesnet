import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { NodesModule } from 'src/nodes/nodes.module';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { GatewaysModule } from 'src/gateways/gateways.module';

describe('telemetryController', () => {
  let telemetryService: TelemetryService;
  let telemetryController: TelemetryController;

  const RS = {
    result: '_result',
    table: 0,
    _time: '2024-07-09T08:11:47Z',
    _value: 0,
    Floor: '2',
    Tray: '3',
    _field: 'RS',
    _measurement: 'Rantai',
    device: 'MMA24DCC3E2DCCC',
  };

  const telemetry = {
    telemetry: { RS },
    statusDevice: {
      status: 'ONLINE',
    },
  };

  const statusDevices = {
    nodes: [
      {
        _time: '2024-07-09T08:14:07Z',
        Floor: '1',
        Tray: '3',
        _measurement: 'nodehealth',
        device: 'MMA24DCC3E1A738',
        fwVersion: '2.0.0',
        humidity: 34.33000183105469,
        hwVersion: '2.0.0',
        messageId: 0,
        rdVersion: '2.1.0',
        rssi: 55,
        temperature: 32.25,
        uptime: 113014,
        status: 'ONLINE',
        alias: 'R209',
      },
    ],
    gateways: [
      {
        _time: '2024-07-09T08:14:09Z',
        Floor: '2',
        Tray: '3',
        _measurement: 'gatewayhealth',
        device: 'HUB744DBD75896C',
        fwVersion: '2.0.0',
        humidity: 39.20000076293945,
        hwVersion: '2.0.0',
        messageId: 0,
        rdVersion: '2.1.0',
        rssi: 0,
        temperature: 30.360000610351,
        uptime: 22131,
        status: 'ONLINE',
        alias: 'Gateway 02',
      },
    ],
    timeNow: 1720512852402,
  };

  const runtime = {
    runtime: 60,
    alias: 'R209',
    serialNumber: 'MMA24DCC3E1A738',
    _value: 'value-test',
  };

  const ProvisionMock = {
    findLast: jest.fn().mockResolvedValueOnce(telemetry),
    findHistory: jest.fn().mockResolvedValueOnce([RS]),
    statusDevices: jest.fn().mockResolvedValueOnce(statusDevices),
    accessTokenStatusDevice: jest.fn().mockResolvedValueOnce(statusDevices),
    runtime: jest.fn().mockResolvedValueOnce([runtime]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        InfluxdbClientModule,
        NodesModule,
        ApiKeysModule,
        TenantsModule,
        GatewaysModule,
      ],
      controllers: [TelemetryController],
      providers: [
        {
          provide: TelemetryService,
          useValue: ProvisionMock,
        },
      ],
    }).compile();

    telemetryService = module.get<TelemetryService>(TelemetryService);
    telemetryController = module.get<TelemetryController>(TelemetryController);
  });

  it('should be defined', () => {
    expect(telemetryService).toBeDefined();
    expect(telemetryController).toBeDefined();
  });

  describe('findLast', () => {
    const expectedResponse = {
      status: 'success',
      data: telemetry,
    };

    it('should return status success with last data RS', async () => {
      const field = 'RS';
      const params = {
        serialNumber: 'MMA24DCC3E2DCCC',
      };
      jest.spyOn(telemetryService, 'findLast').mockResolvedValue(telemetry);

      const result = await telemetryController.findLast(
        field,
        params.serialNumber,
      );

      expect(telemetryService.findLast).toHaveBeenCalledWith(
        field,
        params.serialNumber,
      );

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findHistory', () => {
    const expectedResponse = {
      status: 'success',
      data: { telemetries: [RS] },
    };

    it('should return status success with history data RS', async () => {
      const query = {
        field: 'RS',
        startTime: '2024-07-09T03:00:00.000Z',
        endTime: '2024-07-09T03:15:00.000Z',
      };
      const params = {
        serialNumber: 'MMA24DCC3E2DCCC',
      };

      jest
        .spyOn(telemetryService, 'findHistory')
        .mockResolvedValue({ telemetries: [RS] });

      const result = await telemetryController.findHistory(
        query,
        params.serialNumber,
      );

      expect(telemetryService.findHistory).toHaveBeenCalledWith(
        query,
        params.serialNumber,
      );

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('statusDevices', () => {
    const expectedResponse = {
      status: 'success',
      data: { statusDevices },
    };

    it('should return status success with data status devices', async () => {
      const tenant = 'tenant-test';

      jest
        .spyOn(telemetryService, 'statusDevices')
        .mockResolvedValue(statusDevices);

      const result = await telemetryController.statusDevice(tenant, '');

      expect(telemetryService.statusDevices).toHaveBeenCalledWith(tenant, '');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('accessTokenStatusDevice', () => {
    const expectedResponse = {
      status: 'success',
      data: { statusDevices },
    };

    it('should return status success with data status devices', async () => {
      const tenant = 'tenant-test';
      const type = 'rantai';

      jest
        .spyOn(telemetryService, 'statusDevices')
        .mockResolvedValue(statusDevices);

      const result = await telemetryController.statusDevice(tenant, type);

      expect(telemetryService.statusDevices).toHaveBeenCalledWith(tenant, type);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('runtime', () => {
    const expectedResponse = {
      status: 'success',
      data: { runtime: [runtime] },
    };

    it('should return status success with list data runtime', async () => {
      const tenant = 'tenant-test';
      const query = {
        type: 'rantai',
        startTime: '2024-07-09T03:00:00.000Z',
        endTime: '2024-07-09T03:15:00.000Z',
      };

      jest.spyOn(telemetryService, 'runtime').mockResolvedValue([runtime]);

      const result = await telemetryController.runtime(tenant, query);

      expect(telemetryService.runtime).toHaveBeenCalledWith(
        query.startTime,
        query.endTime,
        tenant,
        query.type,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
