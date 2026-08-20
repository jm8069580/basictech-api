import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface StoreSettings {
  appName: string;
  appUrl: string;
  currency: string;
  orderPrefix: string;
  shippingCountries: string[];
  freeShippingThreshold: number;
  taxRate: number;
  cloudinaryFolder: string;
}

const ENV_KEYS = {
  appName: 'APP_NAME',
  appUrl: 'APP_URL',
  currency: 'CURRENCY',
  orderPrefix: 'ORDER_PREFIX',
  shippingCountries: 'SHIPPING_COUNTRIES',
  freeShippingThreshold: 'FREE_SHIPPING_THRESHOLD',
  taxRate: 'TAX_RATE',
  cloudinaryFolder: 'CLOUDINARY_FOLDER',
} as const;

const DEFAULTS: StoreSettings = {
  appName: 'BasicTechShop',
  appUrl: 'http://localhost:3000',
  currency: 'pen',
  orderPrefix: 'BT',
  shippingCountries: ['PE'],
  freeShippingThreshold: 200,
  taxRate: 0,
  cloudinaryFolder: 'basictech/products',
};

@Injectable()
export class StoreConfigService {
  private cache: Map<string, string> = new Map();
  private cacheLoaded = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getAll(): Promise<StoreSettings> {
    await this.loadCache();

    return {
      appName: this.get('appName', DEFAULTS.appName),
      appUrl: this.get('appUrl', DEFAULTS.appUrl),
      currency: this.get('currency', DEFAULTS.currency),
      orderPrefix: this.get('orderPrefix', DEFAULTS.orderPrefix),
      shippingCountries: this.getList(
        'shippingCountries',
        DEFAULTS.shippingCountries,
      ),
      freeShippingThreshold: this.getNumber(
        'freeShippingThreshold',
        DEFAULTS.freeShippingThreshold,
      ),
      taxRate: this.getNumber('taxRate', DEFAULTS.taxRate),
      cloudinaryFolder: this.get('cloudinaryFolder', DEFAULTS.cloudinaryFolder),
    };
  }

  async getValue(key: string): Promise<string | null> {
    await this.loadCache();
    return this.cache.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.storeConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    this.cache.set(key, value);
  }

  async setMany(entries: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.set(key, value);
    }
  }

  private get(key: keyof typeof ENV_KEYS, fallback: string): string {
    const envValue = this.config.get<string>(ENV_KEYS[key]);
    if (envValue !== undefined && envValue !== '') {
      return envValue;
    }
    return this.cache.get(key) ?? fallback;
  }

  private getNumber(key: keyof typeof ENV_KEYS, fallback: number): number {
    const raw = this.get(key, String(fallback));
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private getList(key: keyof typeof ENV_KEYS, fallback: string[]): string[] {
    const raw = this.get(key, fallback.join(','));
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private async loadCache(): Promise<void> {
    if (this.cacheLoaded) return;
    const rows = await this.prisma.storeConfig.findMany();
    for (const row of rows) {
      this.cache.set(row.key, row.value);
    }
    this.cacheLoaded = true;
  }
}
