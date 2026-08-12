import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CatalogService } from './catalog.service';
import { CategoryCreateDto } from './dto/category-create.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  findAll() {
    return this.catalogService.findCategories();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CategoryCreateDto) {
    return this.catalogService.createCategory(dto);
  }
}
