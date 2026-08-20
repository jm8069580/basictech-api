import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { StoreConfigService } from '../config/store-config.service';
import { CheckoutDto } from './dto/checkout.dto';

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string | null;
}

@Injectable()
export class CheckoutService {
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly storeConfig: StoreConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.config.get<string>('STRIPE_SECRET_KEY') ?? 'sk_test_placeholder',
      {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      },
    );
  }

  async createSession(
    userId: string,
    userEmail: string,
    dto: CheckoutDto,
  ): Promise<CheckoutSessionResponse> {
    const settings = await this.storeConfig.getAll();

    const lineItems = dto.items.map((item) => ({
      price_data: {
        currency: settings.currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const subtotal = dto.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const qualifiesForFreeShipping = subtotal >= settings.freeShippingThreshold;

    const shippingOptions = await this.buildShippingOptions(
      qualifiesForFreeShipping,
      settings.currency,
    );

    const session = await this.stripe.checkout.sessions
      .create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${settings.appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${settings.appUrl}/checkout/cancel`,
        customer_email: userEmail || undefined,
        metadata: {
          ...dto.metadata,
          userId,
          items: JSON.stringify(
            dto.items.map((i) => ({ id: i.id, qty: i.quantity })),
          ),
        },
        shipping_options: shippingOptions,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries:
            settings.shippingCountries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
      })
      .catch(() => {
        throw new InternalServerErrorException(
          'Error creating checkout session',
        );
      });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  private async buildShippingOptions(
    qualifiesForFreeShipping: boolean,
    currency: string,
  ): Promise<Stripe.Checkout.SessionCreateParams.ShippingOption[]> {
    const rates = await this.prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: { amount: 'asc' },
    });

    if (rates.length > 0) {
      return rates.map((rate) => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: qualifiesForFreeShipping
              ? 0
              : Math.round(Number(rate.amount) * 100),
            currency,
          },
          display_name: rate.name,
          delivery_estimate: {
            minimum: { unit: 'business_day', value: rate.minDays },
            maximum: { unit: 'business_day', value: rate.maxDays },
          },
        },
      }));
    }

    if (qualifiesForFreeShipping) {
      return [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency },
            display_name: 'Envio gratis',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency },
            display_name: 'Envio express',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ];
    }

    return [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 1500, currency },
          display_name: 'Envio estandar',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 5 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 3000, currency },
          display_name: 'Envio express',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 1 },
            maximum: { unit: 'business_day', value: 2 },
          },
        },
      },
    ];
  }
}
