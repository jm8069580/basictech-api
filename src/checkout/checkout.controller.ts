import { Body, Controller, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.checkoutService.createSession(user.id, user.email, dto);
  }
}
