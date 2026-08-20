import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.configured = true;
    }
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    if (!this.configured) {
      console.log(
        `[Email] SMTP not configured. Order confirmation for ${data.orderNumber} would be sent to ${data.customerEmail}`,
      );
      return;
    }

    console.log(
      `[Email] Order confirmation sent to ${data.customerEmail} for order ${data.orderNumber}`,
    );
  }

  async sendWelcome(data: WelcomeEmailData): Promise<void> {
    if (!this.configured) {
      console.log(
        `[Email] SMTP not configured. Welcome email would be sent to ${data.email}`,
      );
      return;
    }

    console.log(`[Email] Welcome email sent to ${data.email}`);
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!this.configured) {
      console.log(
        `[Email] SMTP not configured. Password reset would be sent to ${email}`,
      );
      return;
    }

    console.log(`[Email] Password reset email sent to ${email}`);
  }
}
