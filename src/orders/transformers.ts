import { Prisma } from '@prisma/client';

export const ORDER_INCLUDE = {
  user: {
    select: { name: true, email: true },
  },
  address: true,
  items: {
    include: {
      product: {
        include: { brand: true },
      },
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;

export interface OrderListItemDto {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  items: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}

export interface OrderDetailDto {
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
  notes: string | null;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: {
    productId: string;
    slug: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreatedDto {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
}

export function transformOrderListItem(
  order: OrderWithRelations,
): OrderListItemDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status.toLowerCase(),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    shippingAddress: `${order.address.address}, ${order.address.city}`,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      brand: item.product.brand?.name ?? '',
      price: Number(item.price),
      quantity: item.quantity,
      image: item.product.images[0] ?? '',
    })),
  };
}

export function transformOrderDetail(
  order: OrderWithRelations,
): OrderDetailDto {
  return {
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
    notes: order.notes,
    shippingAddress: {
      name: order.address.name,
      phone: order.address.phone ?? '',
      address: order.address.address,
      city: order.address.city,
      state: order.address.state,
      zipCode: order.address.zipCode ?? '',
    },
    items: order.items.map((item) => ({
      productId: item.productId,
      slug: item.product.slug,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total),
      image: item.product.images[0] ?? '',
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
