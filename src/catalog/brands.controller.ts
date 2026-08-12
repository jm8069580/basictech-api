import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CatalogService } from './catalog.service';
import { BrandCreateDto } from './dto/brand-create.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  findAll() {
    return this.catalogService.findBrands();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: BrandCreateDto) {
    return this.catalogService.createBrand(dto);
  }
}
