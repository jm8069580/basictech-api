import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { StoreConfigService } from './store-config.service';

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
}
