import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';

export interface DashboardStatsDto {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface DashboardResponseDto {
  stats: DashboardStatsDto;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

export interface AdminOrderItemDto {
  name: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
}

export interface AdminOrderDto {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: AdminOrderItemDto[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrdersResponseDto {
  orders: AdminOrderDto[];
  total: number;
  limit: number;
  offset: number;
}

const ADMIN_ORDER_INCLUDE = {
  user: {
    select: { name: true, email: true },
  },
  address: true,
  items: {
    include: {
      product: {
        select: { images: true },
      },
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      revenueData,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const statusCounts = ordersByStatus.reduce(
      (acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue: Number(revenueData._sum.total ?? 0),
      },
      ordersByStatus: {
        pending: statusCounts.pending ?? 0,
        processing: statusCounts.processing ?? 0,
        shipped: statusCounts.shipped ?? 0,
        delivered: statusCounts.delivered ?? 0,
        cancelled: statusCounts.cancelled ?? 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.name,
        email: order.user.email,
        total: Number(order.total),
        status: order.status.toLowerCase(),
        createdAt: order.createdAt.toISOString(),
      })),
    };
  }

  async getOrders(query: AdminOrdersQueryDto): Promise<AdminOrdersResponseDto> {
    const where: Prisma.OrderWhereInput = {};

    if (query.status && query.status !== 'all') {
      where.status = query.status.toUpperCase() as OrderStatus;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ADMIN_ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user.name,
          email: order.user.email,
        },
        status: order.status.toLowerCase(),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        shippingAddress: {
          name: order.address.name,
          address: order.address.address,
          city: order.address.city,
          state: order.address.state,
          zipCode: order.address.zipCode,
        },
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
          image: item.product.images[0] ?? '',
        })),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      total,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    };
  }
}
