# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**basictech-api** es el backend **NestJS** de **BasicTechShop** (e-commerce de productos de computación). Es la **migración** del backend que antes vivía dentro del frontend Next.js (`../../react/ecommerce/src/app/api/*`) a un API independiente.

- Frontend que lo consume: `../../react/ecommerce` (Next.js 16).
- Mismo modelo de datos: Prisma + PostgreSQL (`basictech_shop`, puerto 5490). El schema es idéntico al del frontend.
- Auth: **JWT** (access 15m + refresh 7d) en lugar de NextAuth.

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

## Estado de la migración

- ✅ **Auth**: register, login, refresh, me. Guards `JwtAuthGuard` (global) y `RolesGuard` con decoradores `@Public()`, `@Roles(...)`, `@CurrentUser()`.
- ✅ **Products**: CRUD + listado con filtros (categoría, marca, rango de precio, sort, búsqueda) y paginación vía DTO de query.
- ✅ **Catalog**: categories y brands.
- ⏳ **Pendiente**: orders, addresses, checkout/Stripe + webhook, upload/Cloudinary, admin dashboard, admin users.

> No crear features nuevas en las API routes de Next (`react/ecommerce/src/app/api/*`); implementarlas aquí en Nest y apuntar el frontend a este API.

## Estructura

```
src/
├── main.ts                # Bootstrap, puerto desde .env (PORT=3001)
├── app.module.ts          # ConfigModule global (.env), Prisma, Auth, Products, Catalog
├── prisma/                # PrismaModule y PrismaService
├── auth/                  # AuthService/Controller, DTOs, guards, strategies JWT
├── products/              # ProductsService/Controller, DTOs (create/update/query), transformers
└── catalog/               # CategoriesController, BrandsController, transformers
```

## Convenciones

- **Módulos**: controller + service + DTOs (class-validator) en `dto/`.
- **Transformers**: respuestas con la misma forma que espera el frontend (`src/lib/transformers.ts` del repo React), p. ej. `product.category` es el **slug**, `price` es número.
- **Auth**: rutas protegidas por defecto (guard global JWT); usar `@Public()` para públicas y `@Roles('ADMIN')` para restringir.
- **Errores**: HTTP exceptions de Nest (401/403/404/409), mensajes en español consistentes con el frontend.
- **Seed**: `npm run db:seed` (users, categorías, marcas, productos de ejemplo).

## Configuración

- `.env` (no versionado): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d`, `PORT=3001`, Stripe/Cloudinary pendientes.
- Hay `.env.example` versionado.
- El token de Notion (`NOTION_TOKEN`) **no pertenece a este proyecto** ni al ecommerce; es del MCP de la raíz del workspace.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor en modo watch (puerto 3001) |
| `npm run build` | Compila a `dist/` |
| `npm run lint` | ESLint con `--fix` |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Tests e2e |
| `npm run db:seed` | Seed de la base de datos |
