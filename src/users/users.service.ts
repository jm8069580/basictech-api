import { BadRequestException, Injectable } from '@nestjs/common';
import { UserStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersQueryDto } from './dto/users-query.dto';

export interface UserListDto {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
  orders: number;
  totalSpent: number;
}

export interface UserCreatedDto {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UsersQueryDto): Promise<UserListDto[]> {
    const where: Record<string, string> = {};

    if (query.role) {
      where.role = query.role.toUpperCase();
    }

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          select: {
            total: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
      orders: user._count.orders,
      totalSpent: user.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      ),
    }));
  }

  async create(dto: CreateUserDto): Promise<UserCreatedDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('El email ya esta registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone ?? null,
        role: (dto.role?.toUpperCase() ?? 'CUSTOMER') as UserRole,
        status: UserStatus.ACTIVE,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
    };
  }
}
