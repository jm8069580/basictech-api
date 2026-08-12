import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 'user-1',
    name: 'Juan Perez',
    email: 'juan@example.com',
    password: 'hashed-password',
    phone: null,
    avatar: null,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('deberia crear el usuario y devolver tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      bcryptMock.hash.mockResolvedValue('hashed-password' as never);

      const result = await service.register({
        name: 'Juan Perez',
        email: 'juan@example.com',
        password: 'secret123',
      });

      expect(bcryptMock.hash).toHaveBeenCalledWith('secret123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Juan Perez',
          email: 'juan@example.com',
          password: 'hashed-password',
        },
      });
      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(result.user.email).toBe('juan@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('deberia lanzar ConflictException si el email ya existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          name: 'Juan Perez',
          email: 'juan@example.com',
          password: 'secret123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deberia validar credenciales y devolver tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcryptMock.compare.mockResolvedValue(true as never);

      const result = await service.login({
        email: 'juan@example.com',
        password: 'secret123',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user.role).toBe('CUSTOMER');
    });

    it('deberia lanzar UnauthorizedException si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@example.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deberia lanzar UnauthorizedException si la contrasena es incorrecta', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcryptMock.compare.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'juan@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deberia lanzar ForbiddenException si la cuenta no esta activa', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'SUSPENDED',
      });
      bcryptMock.compare.mockResolvedValue(true as never);

      await expect(
        service.login({ email: 'juan@example.com', password: 'secret123' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('deberia emitir nuevos tokens con un refresh token valido', async () => {
      mockJwt.verify.mockReturnValue({
        sub: 'user-1',
        email: 'juan@example.com',
        role: 'CUSTOMER',
        type: 'refresh',
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refresh({ refreshToken: 'valid-refresh' });

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
    });

    it('deberia lanzar UnauthorizedException con token invalido', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(
        service.refresh({ refreshToken: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deberia rechazar un access token usado como refresh', async () => {
      mockJwt.verify.mockReturnValue({
        sub: 'user-1',
        email: 'juan@example.com',
        role: 'CUSTOMER',
        type: 'access',
      });

      await expect(
        service.refresh({ refreshToken: 'access-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('deberia devolver el usuario publico sin password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.me('user-1');

      expect(result.id).toBe('user-1');
      expect(result).not.toHaveProperty('password');
    });

    it('deberia lanzar UnauthorizedException si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.me('missing')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
