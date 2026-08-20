import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { StoreConfigService } from '../config/store-config.service';

@Injectable()
export class WebhookService {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly storeConfig: StoreConfigService,
  ) {
    this.stripe = new Stripe(
      this.config.get<string>('STRIPE_SECRET_KEY') ?? 'sk_test_placeholder',
      {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      },
    );
  }

  async handleEvent(rawBody: Buffer, signature: string): Promise<void> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    );

    if (event.type === 'checkout.session.completed') {
      await this.handleCheckoutCompleted(event.data.object);
    }
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }

    const itemsData = session.metadata?.items;
    const items: { id: string; qty: number }[] = itemsData
      ? (JSON.parse(itemsData) as { id: string; qty: number }[])
      : [];

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error('User not found:', userId);
        return;
      }

      const customerAddress = session.customer_details?.address;
      const address = await this.prisma.address.create({
        data: {
          userId: user.id,
          label: 'Envio',
          name: session.customer_details?.name || user.name,
          phone: session.customer_details?.phone || '',
          address: customerAddress?.line1 || '',
          city: customerAddress?.city || '',
          state: customerAddress?.state || '',
          zipCode: customerAddress?.postal_code || '',
          isDefault: false,
        },
      });

      const productIds = items.map((item) => item.id);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const subtotal = (session.amount_subtotal || 0) / 100;
      const shipping = (session.shipping_cost?.amount_total || 0) / 100;
      const total = (session.amount_total || 0) / 100;

      const order = await this.prisma.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          orderNumber: await this.generateOrderNumber(),
          status: 'PROCESSING',
          subtotal,
          shipping,
          total,
          paymentMethod: 'Stripe',
          stripeSessionId: session.id,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return {
                productId: item.id,
                name: product?.name || 'Producto',
                price: product?.price || 0,
                quantity: item.qty,
                total: (Number(product?.price) || 0) * item.qty,
              };
            }),
          },
        },
      });

      for (const item of items) {
        await this.prisma.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.qty },
          },
        });
      }

      console.log('Order created:', order.orderNumber);
    } catch (error) {
      console.error('Error processing order:', error);
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const settings = await this.storeConfig.getAll();
    const count = await this.prisma.order.count();
    return `${settings.orderPrefix}-${new Date().getFullYear()}-${String(
      count + 1,
    ).padStart(4, '0')}`;
  }
}
