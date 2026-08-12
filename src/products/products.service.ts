import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { ProductDto, transformProduct } from './transformers';

export interface ProductListResponse {
  products: ProductDto[];
  total: number;
  limit: number | null;
  offset: number;
}

const PRODUCT_INCLUDE = {
  category: true,
  brand: true,
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductsQueryDto): Promise<ProductListResponse> {
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sortBy);

    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      include: PRODUCT_INCLUDE,
      take: query.limit,
      skip: query.offset ?? 0,
    });

    const total = await this.prisma.product.count({ where });

    return {
      products: products.map(transformProduct),
      total,
      limit: query.limit ?? null,
      offset: query.offset ?? 0,
    };
  }

  async create(dto: ProductCreateDto): Promise<ProductDto> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        price: dto.price,
        comparePrice: dto.comparePrice ?? null,
        stock: dto.stock ?? 0,
        images: dto.images ?? [],
        specs: dto.specs as Prisma.InputJsonValue,
        isNew: dto.isNew ?? false,
        isFeatured: dto.isFeatured ?? false,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
      },
      include: PRODUCT_INCLUDE,
    });

    return transformProduct(product);
  }

  async findOne(idOrSlug: string): Promise<ProductDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
        isActive: true,
      },
      include: PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return transformProduct(product);
  }

  async update(idOrSlug: string, dto: ProductUpdateDto): Promise<ProductDto> {
    const existing = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prisma.product.update({
      where: { id: existing.id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        comparePrice: dto.comparePrice,
        stock: dto.stock,
        images: dto.images,
        specs: dto.specs as Prisma.InputJsonValue,
        isNew: dto.isNew,
        isFeatured: dto.isFeatured,
        isActive: dto.isActive,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
      },
      include: PRODUCT_INCLUDE,
    });

    return transformProduct(product);
  }

  async remove(idOrSlug: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }

  private buildWhere(query: ProductsQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.brand) {
      where.brand = { slug: query.brand };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    if (query.new === 'true') {
      where.isNew = true;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sortBy?: ProductsQueryDto['sortBy'],
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'popular':
        return { stock: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }
}
