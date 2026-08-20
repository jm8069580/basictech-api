import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressesModule } from './addresses/addresses.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CouponsModule } from './coupons/coupons.module';
import { EmailModule } from './email/email.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StoreConfigModule } from './config/store-config.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { WebhookModule } from './webhook/webhook.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    StoreConfigModule,
    EmailModule,
    AuthModule,
    ProductsModule,
    CatalogModule,
    AddressesModule,
    OrdersModule,
    CheckoutModule,
    WebhookModule,
    UploadModule,
    AdminModule,
    UsersModule,
    CouponsModule,
    WishlistModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
