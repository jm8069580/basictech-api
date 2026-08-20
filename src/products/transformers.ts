import type { Brand, Category, Product } from '@prisma/client';

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
}

type ProductWithRelations = Product & {
  category: Category;
  brand: Brand;
  reviews?: { rating: number }[];
};

export function transformProduct(product: ProductWithRelations): ProductDto {
  const reviews = product.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand.name,
    category: product.category.slug,
    price: Number(product.price),
    originalPrice: product.comparePrice
      ? Number(product.comparePrice)
      : undefined,
    images: product.images,
    description: product.description ?? '',
    specs: (product.specs as Record<string, string>) ?? {},
    stock: product.stock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    rating: avgRating,
  };
}
