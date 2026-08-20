import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CouponCreateDto } from './dto/coupon-create.dto';
import { CouponUpdateDto } from './dto/coupon-update.dto';

export interface CouponDto {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message: string;
  coupon?: CouponDto;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CouponDto[]> {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map((c) => this.toDto(c));
  }

  async create(dto: CouponCreateDto): Promise<CouponDto> {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('El codigo de cupon ya existe');
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description ?? null,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minSubtotal: dto.minSubtotal ?? null,
        maxDiscount: dto.maxDiscount ?? null,
        status: dto.status ?? 'ACTIVE',
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        usageLimit: dto.usageLimit ?? null,
      },
    });

    return this.toDto(coupon);
  }

  async update(id: string, dto: CouponUpdateDto): Promise<CouponDto> {
    const existing = await this.prisma.coupon.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Cupon no encontrado');
    }

    const data: Prisma.CouponUpdateInput = {};

    if (dto.code !== undefined) data.code = dto.code.toUpperCase();
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.discountType !== undefined) data.discountType = dto.discountType;
    if (dto.discountValue !== undefined) data.discountValue = dto.discountValue;
    if (dto.minSubtotal !== undefined) data.minSubtotal = dto.minSubtotal;
    if (dto.maxDiscount !== undefined) data.maxDiscount = dto.maxDiscount;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.startsAt !== undefined)
      data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.endsAt !== undefined)
      data.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data,
    });

    return this.toDto(coupon);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.coupon.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Cupon no encontrado');
    }

    await this.prisma.coupon.delete({ where: { id } });

    return { success: true };
  }

  async validate(
    code: string,
    subtotal?: number,
  ): Promise<CouponValidationResult> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupon no encontrado' };
    }

    if (coupon.status !== 'ACTIVE') {
      return { valid: false, discount: 0, message: 'Cupon no activo' };
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return { valid: false, discount: 0, message: 'Cupon aun no vigente' };
    }
    if (coupon.endsAt && now > coupon.endsAt) {
      return { valid: false, discount: 0, message: 'Cupon expirado' };
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: 'Cupon ha alcanzado el limite de uso',
      };
    }

    if (coupon.minSubtotal !== null && subtotal !== undefined) {
      if (subtotal < Number(coupon.minSubtotal)) {
        return {
          valid: false,
          discount: 0,
          message: `Subtotal minimo requerido: S/${Number(coupon.minSubtotal)}`,
        };
      }
    }

    let discount = 0;
    const sub = subtotal ?? 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (sub * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount !== null) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Math.min(Number(coupon.discountValue), sub);
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      message: 'Cupon valido',
      coupon: this.toDto(coupon),
    };
  }

  async applyCoupon(couponId: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  private toDto(c: Prisma.CouponGetPayload<Record<string, never>>): CouponDto {
    return {
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discountType.toLowerCase(),
      discountValue: Number(c.discountValue),
      minSubtotal: c.minSubtotal ? Number(c.minSubtotal) : null,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      status: c.status.toLowerCase(),
      startsAt: c.startsAt ? c.startsAt.toISOString() : null,
      endsAt: c.endsAt ? c.endsAt.toISOString() : null,
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
