import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { transformProduct, type ProductDto } from '../products/transformers';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<ProductDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, brand: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => transformProduct(item.product));
  }

  async add(userId: string, productId: string): Promise<{ success: boolean }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });

    return { success: true };
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<{ success: boolean }> {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });

    return { success: true };
  }

  async clear(userId: string): Promise<{ success: boolean }> {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId },
    });

    return { success: true };
  }
}
