import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreConfigService } from './store-config.service';
import { StoreConfigUpdateDto } from './dto/store-config-update.dto';

@Controller('config')
export class StoreConfigController {
  constructor(private readonly storeConfig: StoreConfigService) {}

  @Public()
  @Get()
  async getPublicConfig() {
    const settings = await this.storeConfig.getAll();
    return {
      appName: settings.appName,
      currency: settings.currency,
      shippingCountries: settings.shippingCountries,
      freeShippingThreshold: settings.freeShippingThreshold,
      taxRate: settings.taxRate,
    };
  }

  @Roles('ADMIN')
  @Put()
  async updateConfig(@Body() dto: StoreConfigUpdateDto) {
    const entries: Record<string, string> = {};

    if (dto.appName !== undefined) entries.appName = dto.appName;
    if (dto.currency !== undefined) entries.currency = dto.currency;
    if (dto.shippingCountries !== undefined) {
      entries.shippingCountries = dto.shippingCountries.join(',');
    }
    if (dto.freeShippingThreshold !== undefined) {
      entries.freeShippingThreshold = String(dto.freeShippingThreshold);
    }
    if (dto.taxRate !== undefined) entries.taxRate = String(dto.taxRate);

    await this.storeConfig.setMany(entries);
    return this.getPublicConfig();
  }
}
