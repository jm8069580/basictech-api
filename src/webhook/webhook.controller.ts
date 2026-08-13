import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post('stripe')
  async stripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    if (!signature) {
      throw new BadRequestException('No signature');
    }

    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));

    try {
      await this.webhookService.handleEvent(rawBody, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid signature');
    }

    return { received: true };
  }
}
