import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrandCreateDto } from './dto/brand-create.dto';
import { CategoryCreateDto } from './dto/category-create.dto';
import {
  BRAND_INCLUDE,
  CATEGORY_INCLUDE,
  transformBrand,
  transformCategory,
  type BrandDto,
  type CategoryDto,
} from './transformers';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategories(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      include: CATEGORY_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return categories.map(transformCategory);
  }

  async createCategory(dto: CategoryCreateDto): Promise<CategoryDto> {
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
      },
      include: CATEGORY_INCLUDE,
    });

    return transformCategory(category);
  }

  async findBrands(): Promise<BrandDto[]> {
    const brands = await this.prisma.brand.findMany({
      include: BRAND_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return brands.map(transformBrand);
  }

  async createBrand(dto: BrandCreateDto): Promise<BrandDto> {
    const brand = await this.prisma.brand.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        logo: dto.logo,
      },
      include: BRAND_INCLUDE,
    });

    return transformBrand(brand);
  }
}
