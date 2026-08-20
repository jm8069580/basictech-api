import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { ReviewCreateDto } from './dto/review-create.dto';
import { ReviewUpdateDto } from './dto/review-update.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Public()
  @Get('product/:productId/summary')
  getSummary(@Param('productId') productId: string) {
    return this.reviewsService.getSummary(productId);
  }

  @Post('product/:productId')
  create(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: ReviewCreateDto,
  ) {
    return this.reviewsService.create(user.id, productId, dto);
  }

  @Patch('product/:productId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: ReviewUpdateDto,
  ) {
    return this.reviewsService.update(user.id, productId, dto);
  }

  @Delete('product/:productId')
  remove(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.reviewsService.remove(user.id, productId);
  }
}
