import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.wishlistService.findAll(user.id);
  }

  @Post(':productId')
  add(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.add(user.id, productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.id, productId);
  }

  @Delete()
  clear(@CurrentUser() user: AuthUser) {
    return this.wishlistService.clear(user.id);
  }
}
