import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: ProductCreateDto) {
    return this.productsService.create(dto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: ProductUpdateDto) {
    return this.productsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
