import { Test, TestingModule } from '@nestjs/testing';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { NodesEntity } from './entity/node.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';
import { RedisModule } from 'src/redis/redis.module';

describe('nodesController', () => {
  let nodesService: NodesService;
  let nodesController: NodesController;

  const nodes = {
    id: 'c9599c90-01c4-4ef4-8060-1acdff175512',
    serialNumber: 'AI3494545BA57C',
    alias: 'Supply Demin 10 Gedung Depan',
    description: 'LoRa Node',
    type: 'Water Monitoring',
    group: {
      Floor: '1',
      Building: 'Atas',
    },
    tenant: {
      id: 'c665711b-5f98-414f-9606-1f044e8a5f45',
      name: 'UBS',
    },
    tenantId: 'tenant-id',
    createdAt: new Date('2024-06-24T05:30:36.069Z'),
    updatedAt: new Date('2024-06-24T05:30:36.069Z'),
  };

  const mockNodesEntity = [nodes].map(
    ({ createdAt: _x, updatedAt: _y, ...nodes }) => new NodesEntity(nodes),
  );

  const mockNodeEntity = new NodesEntity(nodes);

  const NodesMock = {
    findAll: jest.fn().mockResolvedValueOnce([nodes]),
    findOne: jest.fn().mockResolvedValueOnce(nodes),
    create: jest.fn().mockResolvedValueOnce(nodes),
    update: jest.fn().mockResolvedValueOnce(nodes),
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
      controllers: [NodesController],
      providers: [
        {
          provide: NodesService,
          useValue: NodesMock,
        },
      ],
    }).compile();

    nodesService = module.get<NodesService>(NodesService);
    nodesController = module.get<NodesController>(NodesController);
  });

  it('should be defined', () => {
    expect(nodesService).toBeDefined();
    expect(nodesController).toBeDefined();
  });

  describe('findAll', () => {
    const expectedResponse = {
      status: 'success',
      data: { nodes: mockNodesEntity },
    };

    it('should return data list of nodes', async () => {
      const params = { someFilter: 'someValue' };

      jest.spyOn(nodesService, 'findAll').mockResolvedValue([nodes]);

      const result = await nodesController.findAll(params);

      expect(nodesService.findAll).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const expectedResponse = {
      status: 'success',
      data: { node: mockNodeEntity },
    };

    it('should return onee data of gateways', async () => {
      const id = 'c9599c90-01c4-4ef4-8060-1acdff175512';

      jest.spyOn(nodesService, 'findOne').mockResolvedValue(nodes);

      const result = await nodesController.findOne(id);

      expect(nodesService.findOne).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: { node: mockNodeEntity },
    };

    it('should return status success and data node', async () => {
      const payload = {
        serialNumber: 'MMA24DCC3E2E571',
        alias: 'Supply Demin 112 Gedung Depan',
        description: 'LoRa Node',
        group: {
          Building: 'Atas',
          Floor: '1',
        },
        type: 'Rantai',
        tenantId: 'c665711b-5f98-414f-9606-1f044e8a5f45a',
      };

      jest.spyOn(nodesService, 'create').mockResolvedValue(nodes);

      const result = await nodesController.create(payload);

      expect(nodesService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const expectedResponse = {
      status: 'success',
      data: { node: mockNodeEntity },
    };

    it('should return status success and data mqttAcl', async () => {
      const id = 'c9599c90-01c4-4ef4-8060-1acdff175512';
      const payload = {
        serialNumber: 'MMA24DCC3E2E571',
        alias: 'Supply Demin 112 Gedung Depan',
        description: 'LoRa Node',
        group: {
          Building: 'Atas',
          Floor: '1',
        },
        type: 'Rantai',
        tenantId: 'c665711b-5f98-414f-9606-1f044e8a5f45a',
      };

      jest.spyOn(nodesService, 'update').mockResolvedValue(nodes);

      const result = await nodesController.update(id, payload);

      expect(nodesService.update).toHaveBeenCalledWith({
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
      const id = 'c9599c90-01c4-4ef4-8060-1acdff175512';
      const result = await nodesController.delete(id);

      expect(nodesService.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });
});
