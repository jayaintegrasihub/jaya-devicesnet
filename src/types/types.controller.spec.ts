import { Test, TestingModule } from '@nestjs/testing';
import { TypesController } from './types.controller';
import { TypesService } from './types.service';
import { TypesEntity } from './entity/types.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InfluxdbClientModule } from 'src/influxdb/influxdb.module';

describe('TypesController', () => {
  let typesService: TypesService;
  let typesController: TypesController;

  const type = {
    id: 'a5a725d3-6a33-432e-bdd8-e8c83890835b',
    name: 'Water Monitoring',
    groups: ['Building', 'Floor'],
    description: 'okok',
    createdAt: new Date('2024-07-15T14:53:24.292Z'),
    updatedAt: new Date('2024-07-15T14:53:24.292Z'),
  };

  const mockTypesEntity = [type].map(
    ({ createdAt: _x, updatedAt: _y, ...type }) => new TypesEntity(type),
  );

  const mockTypeEntity = new TypesEntity(type);

  const TypesMock = {
    findAll: jest.fn().mockResolvedValueOnce([type]),
    findOne: jest.fn().mockResolvedValueOnce(type),
    create: jest.fn().mockResolvedValueOnce(type),
    update: jest.fn().mockResolvedValueOnce(type),
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
      controllers: [TypesController],
      providers: [
        {
          provide: TypesService,
          useValue: TypesMock,
        },
      ],
    }).compile();

    typesService = module.get<TypesService>(TypesService);
    typesController = module.get<TypesController>(TypesController);
  });

  it('should be defined', () => {
    expect(typesService).toBeDefined();
    expect(typesController).toBeDefined();
  });

  describe('findAll', () => {
    const expectedResponse = {
      status: 'success',
      data: { types: mockTypesEntity },
    };

    it('should return data list of types', async () => {
      const params = { someFilter: 'someValue' };
      jest.spyOn(typesService, 'findAll').mockResolvedValue([type]);

      const result = await typesController.findAll(params);

      expect(typesService.findAll).toHaveBeenCalledWith({ where: params });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const expectedResponse = {
      status: 'success',
      data: { type: mockTypeEntity },
    };

    it('should return one data of type', async () => {
      const id = 'a5a725d3-6a33-432e-bdd8-e8c83890835b';

      jest.spyOn(typesService, 'findOne').mockResolvedValue(type);

      const result = await typesController.findOne(id);

      expect(typesService.findOne).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: { type: mockTypeEntity },
    };

    it('should return status success and data type', async () => {
      const payload = {
        name: 'Water Monitoring',
        groups: ['Building', 'Floor'],
        description: 'okok',
      };

      jest.spyOn(typesService, 'create').mockResolvedValue(type);

      const result = await typesController.create(payload);

      expect(typesService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const expectedResponse = {
      status: 'success',
      data: { type: mockTypeEntity },
    };

    it('should return status success and data type', async () => {
      const id = 'a5a725d3-6a33-432e-bdd8-e8c83890835b';
      const payload = {
        name: 'Water Monitoring',
        groups: ['Building', 'Floor'],
        description: 'okok',
      };

      jest.spyOn(typesService, 'update').mockResolvedValue(type);

      const result = await typesController.update(id, payload);

      expect(typesService.update).toHaveBeenCalledWith({
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
      const id = 'a5a725d3-6a33-432e-bdd8-e8c83890835b';
      const result = await typesController.delete(id);

      expect(typesService.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResponse);
    });
  });
});
