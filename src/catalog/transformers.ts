import type { Brand, Category } from '@prisma/client';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface BrandDto {
  id: string;
  name: string;
  logo?: string;
  productCount: number;
}

type CategoryWithCount = Category & {
  _count?: { products: number };
};

type BrandWithCount = Brand & {
  _count?: { products: number };
};

const CATEGORY_INCLUDE = {
  _count: { select: { products: { where: { isActive: true } } } },
} as const;

const BRAND_INCLUDE = {
  _count: { select: { products: { where: { isActive: true } } } },
} as const;

export function transformCategory(category: CategoryWithCount): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon || 'Package',
    productCount: category._count?.products ?? 0,
  };
}

export function transformBrand(brand: BrandWithCount): BrandDto {
  return {
    id: brand.id,
    name: brand.name,
    logo: brand.logo || undefined,
    productCount: brand._count?.products ?? 0,
  };
}

export { CATEGORY_INCLUDE, BRAND_INCLUDE };
