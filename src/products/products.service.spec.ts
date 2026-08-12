import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const product = {
    id: 'prod-1',
    name: 'ROG Strix GeForce RTX 4080',
    slug: 'rog-strix-rtx-4080',
    description: null,
    price: { toString: () => '1299.99' },
    comparePrice: { toString: () => '1499.99' },
    stock: 10,
    images: ['https://example.com/img.jpg'],
    specs: null,
    isNew: false,
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: 'cat-1',
    brandId: 'brand-1',
    category: {
      id: 'cat-1',
      name: 'Componentes',
      slug: 'componentes',
      icon: 'Cpu',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    brand: {
      id: 'brand-1',
      name: 'ASUS',
      slug: 'asus',
      logo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('deberia listar productos con total, limit y offset', async () => {
      mockPrisma.product.findMany.mockResolvedValue([product]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: undefined, skip: 0 }),
      );
      expect(result.total).toBe(1);
      expect(result.products[0].price).toBe(1299.99);
      expect(result.products[0].brand).toBe('ASUS');
      expect(result.products[0].category).toBe('componentes');
      expect(result.limit).toBeNull();
      expect(result.offset).toBe(0);
    });

    it('deberia aplicar filtros de busqueda y precio', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({
        search: 'gpu',
        minPrice: 100,
        maxPrice: 500,
        sortBy: 'price-asc',
        limit: 5,
        offset: 10,
      });

      const findManyCalls = mockPrisma.product.findMany.mock
        .calls as Prisma.ProductFindManyArgs[][];
      const args = findManyCalls[0][0];
      const where = args.where as
        | (Prisma.ProductWhereInput & {
            price?: { gte?: number; lte?: number };
          })
        | undefined;
      const price = where?.price as { gte?: number; lte?: number } | undefined;
      expect(where?.OR).toBeDefined();
      expect(price?.gte).toBe(100);
      expect(price?.lte).toBe(500);
      expect(args.orderBy).toEqual({ price: 'asc' });
      expect(args.take).toBe(5);
    });
  });

  describe('findOne', () => {
    it('deberia buscar por slug o id', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(product);

      const result = await service.findOne('rog-strix-rtx-4080');

      expect(mockPrisma.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ slug: 'rog-strix-rtx-4080' }, { id: 'rog-strix-rtx-4080' }],
            isActive: true,
          },
        }),
      );
      expect(result.id).toBe('prod-1');
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('deberia crear un producto y transformarlo', async () => {
      mockPrisma.product.create.mockResolvedValue(product);

      const result = await service.create({
        name: 'ROG Strix GeForce RTX 4080',
        slug: 'rog-strix-rtx-4080',
        price: 1299.99,
        categoryId: 'cat-1',
        brandId: 'brand-1',
      });

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stock: 0,
            isNew: false,
          }) as object,
        }),
      );
      expect(result.price).toBe(1299.99);
      expect(result.originalPrice).toBe(1499.99);
    });
  });

  describe('update', () => {
    it('deberia actualizar el producto existente', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.product.update.mockResolvedValue(product);

      const result = await service.update('prod-1', { price: 1099.99 });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: expect.objectContaining({ price: 1099.99 }) as object,
        include: expect.anything() as object,
      });
      expect(result.id).toBe('prod-1');
    });

    it('deberia lanzar NotFoundException si el producto no existe', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deberia eliminar el producto y devolver success', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.product.delete.mockResolvedValue(product);

      const result = await service.remove('prod-1');

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
      expect(result).toEqual({ success: true });
    });

    it('deberia lanzar NotFoundException si el producto no existe', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
