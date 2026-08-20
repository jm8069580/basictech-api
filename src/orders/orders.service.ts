import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StoreConfigService } from '../config/store-config.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  ORDER_INCLUDE,
  OrderCreatedDto,
  OrderDetailDto,
  OrderListItemDto,
  transformOrderDetail,
  transformOrderListItem,
} from './transformers';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeConfig: StoreConfigService,
  ) {}

  async findAll(userId: string): Promise<OrderListItemDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(transformOrderListItem);
  }

  async create(userId: string, dto: CreateOrderDto): Promise<OrderCreatedDto> {
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Direccion no encontrada');
    }

    const settings = await this.storeConfig.getAll();
    const orderCount = await this.prisma.order.count();
    const orderNumber = `${settings.orderPrefix}-${new Date().getFullYear()}-${String(
      orderCount + 1,
    ).padStart(4, '0')}`;

    const taxRate = settings.taxRate;
    const tax = dto.subtotal * taxRate;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        subtotal: dto.subtotal,
        shipping: dto.shipping,
        tax,
        discount: 0,
        total: dto.total,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes ?? null,
        userId,
        addressId: dto.addressId,
        items: {
          create: dto.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            productId: item.productId,
          })),
        },
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
    };
  }

  async findOne(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<OrderDetailDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return transformOrderDetail(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<{
    id: string;
    orderNumber: string;
    status: string;
    updatedAt: string;
  }> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status.toUpperCase() as OrderStatus,
        notes: dto.notes ?? null,
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
