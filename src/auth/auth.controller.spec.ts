// import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  const mockAuth = {
    user: {
      id: 'user-id',
      username: 'Alice',
      email: 'alice@gmail.com',
      password: 'alice123',
      refreshToken: 'refresh-token',
      createdAt: new Date('2024-07-14 03:08:56.723'),
      updatedAt: new Date('2024-07-14 03:08:56.723'),
    },
    tokens: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  };

  const expectedAuth = {
    status: 'success',
    data: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  };

  const AuthMock = {
    signIn: jest.fn().mockResolvedValueOnce(mockAuth),
    refreshTokens: jest.fn().mockResolvedValueOnce(mockAuth.tokens),
    signout: jest.fn().mockResolvedValueOnce({ status: 'success', data: null }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        UsersModule,
        JwtModule.register({}),
        ConfigModule,
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: AuthMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    it('should return data status and token', async () => {
      const payload = {
        username: 'Alice',
        password: 'alice123',
      };

      jest
        .spyOn(authService, 'signIn')
        .mockImplementation(() => Promise.resolve(mockAuth));

      const result = await authController.signIn(payload);

      expect(authService.signIn).toHaveBeenCalledWith(
        payload.username,
        payload.password,
      );
      expect(result).toEqual(expectedAuth);
    });

    it('should throw UnauthorizedException if credentials are wrong', async () => {
      const payload = {
        username: 'Alice',
        password: 'wrongPassword',
      };

      jest.spyOn(authService, 'signIn').mockImplementation(() => {
        throw new UnauthorizedException({
          username: 'Username/Password mismtach',
          password: 'Username/Password is wrong',
        });
      });

      try {
        await authController.signIn(payload);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.response).toEqual({
          username: 'Username/Password mismtach',
          password: 'Username/Password is wrong',
        });
      }

      expect(authService.signIn).toHaveBeenCalledWith(
        payload.username,
        payload.password,
      );
    });
  });

  describe('refresh', () => {
    it('should return data status and token', async () => {
      const payload = {
        id: 'user-id',
        refreshToken: 'refresh-token',
      };

      jest
        .spyOn(authService, 'refreshTokens')
        .mockImplementation(() => Promise.resolve(mockAuth.tokens));

      const result = await authController.refresh(payload);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        payload.id,
        payload.refreshToken,
      );
      expect(result).toEqual(expectedAuth);
    });

    it('should throw Forbidden if refreshToken not found or not valid', async () => {
      const payload = {
        id: 'user-id',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(authService, 'refreshTokens').mockImplementation(() => {
        throw new ForbiddenException();
      });

      try {
        await authController.refresh(payload);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.response).toEqual({
          message: 'Forbidden',
          statusCode: 403,
        });
      }

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        payload.id,
        payload.refreshToken,
      );
    });
  });

  describe('signOut', () => {
    it('should return data status success', async () => {
      const payload = {
        id: 'user-id',
      };
      const mockAuth = {
        status: 'success',
        data: null,
      };

      expect(await authController.signout(payload)).toEqual(mockAuth);
    });
  });
});
