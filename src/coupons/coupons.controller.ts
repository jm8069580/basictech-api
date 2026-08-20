import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CouponCreateDto } from './dto/coupon-create.dto';
import { CouponUpdateDto } from './dto/coupon-update.dto';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CouponCreateDto) {
    return this.couponsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CouponUpdateDto) {
    return this.couponsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  @Public()
  @Get('validate')
  validate(@Query('code') code: string, @Query('subtotal') subtotal?: string) {
    const sub = subtotal ? Number(subtotal) : undefined;
    return this.couponsService.validate(code, sub);
  }
}
