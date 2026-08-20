import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewCreateDto } from './dto/review-create.dto';
import { ReviewUpdateDto } from './dto/review-update.dto';

export interface ReviewDto {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  user: {
    id: string;
    name: string;
  };
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: { rating: number; count: number }[];
}

const REVIEW_INCLUDE = {
  user: {
    select: { id: true, name: true },
  },
} satisfies Prisma.ReviewInclude;

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: typeof REVIEW_INCLUDE;
}>;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: string): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: REVIEW_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.toDto(r));
  }

  async getSummary(productId: string): Promise<ProductReviewSummary> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0 })),
      };
    }

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const distMap = new Map<number, number>();
    for (const r of reviews) {
      distMap.set(r.rating, (distMap.get(r.rating) ?? 0) + 1);
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      distribution: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: distMap.get(rating) ?? 0,
      })),
    };
  }

  async create(
    userId: string,
    productId: string,
    dto: ReviewCreateDto,
  ): Promise<ReviewDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Ya has reseñado este producto');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: dto.rating,
        title: dto.title ?? null,
        comment: dto.comment ?? null,
      },
      include: REVIEW_INCLUDE,
    });

    return this.toDto(review);
  }

  async update(
    userId: string,
    productId: string,
    dto: ReviewUpdateDto,
  ): Promise<ReviewDto> {
    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!existing) {
      throw new NotFoundException('Reseña no encontrada');
    }

    const review = await this.prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
      include: REVIEW_INCLUDE,
    });

    return this.toDto(review);
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<{ success: boolean }> {
    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!existing) {
      throw new NotFoundException('Reseña no encontrada');
    }

    await this.prisma.review.delete({ where: { id: existing.id } });

    return { success: true };
  }

  private toDto(r: ReviewWithUser): ReviewDto {
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      user: {
        id: r.user.id,
        name: r.user.name,
      },
      productId: r.productId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
