# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**basictech-api** es el backend **NestJS** e-commerce base/template. Funciona como **core reutilizable** para derivar tiendas de distintos rubros sin empezar de 0.

- Frontend que lo consume: `../../react/ecommerce` (Next.js 16).
- Modelo de datos: Prisma + PostgreSQL (`basictech_shop`, puerto 5490).
- Auth: **JWT** (access 15m + refresh 7d).
- **Parametrizable por cliente** vía `.env` y tabla `store_config` (moneda, país, envío, prefijo de orden, tax, etc.).

> Ver [TEMPLATE.md](./TEMPLATE.md) para la guía de cómo derivar un nuevo cliente.

## Stack

| Tecnología | Uso |
|------------|-----|
| NestJS 11 | Framework |
| TypeScript | Lenguaje |
| Prisma 7 + `@prisma/adapter-pg` | ORM |
| PostgreSQL | Base de datos |
| passport-jwt + @nestjs/jwt | Autenticación |
| class-validator / class-transformer | Validación de DTOs |
| bcryptjs | Hash de contraseñas |
| Stripe | Pagos |
| Cloudinary | Imágenes |

## Módulos

```
src/
├── main.ts                # Bootstrap, puerto desde .env (PORT=3001), rawBody (webhook)
├── app.module.ts          # ConfigModule global, Prisma y todos los módulos
├── prisma/                # PrismaModule y PrismaService (global)
├── config/                # StoreConfigModule (global) — config de tienda por .env + DB
├── email/                 # EmailModule (global) — stub SMTP (nodemailer-ready)
├── auth/                  # AuthService/Controller, DTOs, guards, strategies JWT
├── products/              # ProductsService/Controller, DTOs, transformers
├── catalog/               # CategoriesController, BrandsController, transformers
├── addresses/             # CRUD de direcciones del usuario, transformers
├── orders/                # Pedidos + detalle, crear, estado (admin), tax
├── checkout/              # Sesión de Stripe Checkout (moneda/país/envío parametrizable)
├── webhook/               # Webhook de Stripe (raw body), orderNumber configurable
├── upload/                # Subida/borrado de imágenes en Cloudinary (folder configurable)
├── admin/                 # Dashboard y listado de pedidos (admin)
├── users/                 # Gestión de usuarios (admin)
├── coupons/               # CRUD + validación de cupones (PERCENTAGE/FIXED)
├── wishlist/              # Favoritos del usuario
└── reviews/               # Reseñas de productos (rating 1-5 + summary)
```

## Configuración de tienda (parametrizable)

Los parámetros se leen de `.env` primero, luego de la tabla `store_config` (key-value), con defaults:

| Key | Env var | Default | Descripción |
|-----|---------|---------|-------------|
| appName | `APP_NAME` | BasicTechShop | Nombre de la tienda |
| appUrl | `APP_URL` | http://localhost:3000 | URL del frontend |
| currency | `CURRENCY` | pen | Moneda Stripe (pen, usd, eur) |
| orderPrefix | `ORDER_PREFIX` | BT | Prefijo de número de orden |
| shippingCountries | `SHIPPING_COUNTRIES` | PE | Países permitidos (CSV) |
| freeShippingThreshold | `FREE_SHIPPING_THRESHOLD` | 200 | Subtotal mínimo para envío gratis |
| taxRate | `TAX_RATE` | 0 | Tasa de impuesto (0.18 = 18% IGV) |
| cloudinaryFolder | `CLOUDINARY_FOLDER` | basictech/products | Folder de Cloudinary |

Las tarifas de envío se configuran en la tabla `shipping_rates`.

## Convenciones

- **Módulos**: controller + service + DTOs (class-validator) en `dto/`.
- **Transformers**: respuestas con la misma forma que espera el frontend.
- **Auth**: rutas protegidas por defecto (guard global JWT); `@Public()` para públicas, `@Roles('ADMIN')` para restringir.
- **Errores**: HTTP exceptions de Nest (401/403/404/409), mensajes en español.
- **Seed**: `SEED_PROFILE=basictech npm run db:seed` (core + profile).

## Configuración

- `.env` (no versionado): ver `.env.example` para todas las variables.
- El token de Notion (`NOTION_TOKEN`) **no pertenece a este proyecto**; es del MCP de la raíz del workspace.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor en modo watch (puerto 3001) |
| `npm run build` | Compila a `dist/` |
| `npm run lint` | ESLint con `--fix` |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Tests e2e |
| `npm run db:seed` | Seed de la base de datos (core + profile) |
| `npm run db:migrate` | Prisma migrate dev |
