import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  const category = {
    id: 'cat-1',
    name: 'Componentes',
    slug: 'componentes',
    icon: 'Cpu',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 3 },
  };

  const brand = {
    id: 'brand-1',
    name: 'ASUS',
    slug: 'asus',
    logo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 2 },
  };

  const mockPrisma = {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    brand: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  describe('findCategories', () => {
    it('deberia listar categorias ordenadas por nombre', async () => {
      mockPrisma.category.findMany.mockResolvedValue([category]);

      const result = await service.findCategories();

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
      expect(result[0]).toEqual({
        id: 'cat-1',
        name: 'Componentes',
        slug: 'componentes',
        icon: 'Cpu',
        productCount: 3,
      });
    });

    it('deberia usar un icono por defecto si no tiene', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { ...category, icon: null },
      ]);

      const result = await service.findCategories();

      expect(result[0].icon).toBe('Package');
    });
  });

  describe('createCategory', () => {
    it('deberia crear una categoria', async () => {
      mockPrisma.category.create.mockResolvedValue(category);

      const result = await service.createCategory({
        name: 'Componentes',
        slug: 'componentes',
      });

      expect(mockPrisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Componentes' }) as object,
        }),
      );
      expect(result.productCount).toBe(3);
    });
  });

  describe('findBrands', () => {
    it('deberia listar marcas ordenadas por nombre', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([brand]);

      const result = await service.findBrands();

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
      expect(result[0]).toEqual({
        id: 'brand-1',
        name: 'ASUS',
        logo: undefined,
        productCount: 2,
      });
    });
  });

  describe('createBrand', () => {
    it('deberia crear una marca', async () => {
      mockPrisma.brand.create.mockResolvedValue(brand);

      const result = await service.createBrand({
        name: 'ASUS',
        slug: 'asus',
      });

      expect(mockPrisma.brand.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'asus' }) as object,
        }),
      );
      expect(result.name).toBe('ASUS');
    });
  });
});
