import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddressDto } from './dto/address.dto';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.addressesService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: AddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.addressesService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddressDto,
  ) {
    return this.addressesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.addressesService.remove(id, user.id);
  }
}
