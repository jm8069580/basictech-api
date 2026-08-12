import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { CatalogService } from './catalog.service';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [CategoriesController, BrandsController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
