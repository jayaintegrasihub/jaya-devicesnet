import { Test, TestingModule } from '@nestjs/testing';
import { RequestLogsController } from './request-logs.controller';
import { RequestLogsService } from './request-logs.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

describe('RequestLogsController', () => {
  let requestLogsService: RequestLogsService;
  let requestLogsController: RequestLogsController;

  const requestLogs = {
    id: 1,
    user: 'Alice',
    auditLog: 'audit-log',
    ipAddress: null,
    status: null,
    body: null,
    params: null,
    response: null,
    createdAt: new Date('2024-06-24T05:30:36.069Z'),
  };

  const RequestLogsMock = {
    findMany: jest.fn().mockResolvedValueOnce([requestLogs]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
      ],
      controllers: [RequestLogsController],
      providers: [
        {
          provide: RequestLogsService,
          useValue: RequestLogsMock,
        },
      ],
    }).compile();

    requestLogsService = module.get<RequestLogsService>(RequestLogsService);
    requestLogsController = module.get<RequestLogsController>(
      RequestLogsController,
    );
  });

  it('should be defined', () => {
    expect(requestLogsService).toBeDefined();
    expect(requestLogsController).toBeDefined();
  });

  describe('create', () => {
    const expectedResponse = {
      status: 'success',
      data: {
        requestLogs: [requestLogs],
      },
    };

    it('should return request logs between startTime and endTime', async () => {
      const startTime = '2024-07-12T07:43:18.283Z';
      const endTime = '2024-07-12T08:00:15.283Z';
      const take = '10';

      jest
        .spyOn(requestLogsService, 'findMany')
        .mockResolvedValue([requestLogs]);

      const result = await requestLogsController.findAll(
        '',
        take,
        startTime,
        endTime,
      );

      expect(requestLogsService.findMany).toHaveBeenCalledWith({
        take: parseInt(take),
        where: {
          createdAt: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should return request logs with cursor', async () => {
      const cursor = '1';
      const take = '10';

      jest
        .spyOn(requestLogsService, 'findMany')
        .mockResolvedValue([requestLogs]);

      const result = await requestLogsController.findAll(cursor, take, '', '');

      expect(requestLogsService.findMany).toHaveBeenCalledWith({
        take: parseInt(take),
        cursor: { id: parseInt(cursor) },
        skip: 1,
        orderBy: {
          createdAt: 'asc',
        },
      });

      expect(result).toEqual({
        status: 'success',
        data: { requestLogs: [requestLogs] },
      });
    });
  });
});
