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
- ✅ **Addresses**: CRUD del usuario autenticado (listado, crear, actualizar, eliminar). Maneja el default (al marcar uno se desmarcan los demás) y devuelve 409 al borrar una dirección con pedidos asociados.
- ✅ **Orders**: listado de pedidos del usuario, detalle (dueño o admin), crear pedido (valida que la dirección sea del usuario, genera `ORD-AAAA-0001`) y actualizar estado (admin, `@Roles('ADMIN')`).
- ✅ **Checkout**: `POST /checkout` crea sesión de Stripe Checkout (S/ moneda PEN, envío gratis ≥ S/200). Errores de Stripe se mapean a 500 genérico. Requiere `STRIPE_SECRET_KEY`.
- ✅ **Webhook**: `POST /webhook/stripe` (público, `rawBody` habilitado en `main.ts`). En `checkout.session.completed` crea dirección + pedido y descuenta stock. Requiere `STRIPE_WEBHOOK_SECRET`.
- ✅ **Upload**: `POST /upload` (multipart, admin) sube a Cloudinary (valida JPG/PNG/WebP/GIF ≤ 5MB) y `DELETE /upload?publicId=` lo elimina. Requiere credenciales Cloudinary.
- ✅ **Admin**: `GET /admin/dashboard` (stats, pedidos por estado, recientes) y `GET /admin/orders` (listado con filtros `status`/`limit`/`offset`).
- ✅ **Admin users**: `GET /users` (filtros `role`/`status`) y `POST /users` (crea con bcrypt; email duplicado → 400), ambos admin.
- ✅ **Frontend conectado**: el frontend (`react/ecommerce`) consume este API (`localhost:3001`) vía `src/lib/api.ts`; las API routes de Next (`/api/*`) y NextAuth fueron eliminadas.

> No crear features nuevas en el frontend; implementarlas aquí en Nest y consumirlas con `src/lib/api.ts` del frontend.

## Estructura

```
src/
├── main.ts                # Bootstrap, puerto desde .env (PORT=3001), rawBody habilitado (webhook)
├── app.module.ts          # ConfigModule global (.env), Prisma y todos los módulos
├── prisma/                # PrismaModule y PrismaService
├── auth/                  # AuthService/Controller, DTOs, guards, strategies JWT
├── products/              # ProductsService/Controller, DTOs (create/update/query), transformers
├── catalog/               # CategoriesController, BrandsController, transformers
├── addresses/             # CRUD de direcciones del usuario, transformers
├── orders/                # Pedidos del usuario + detalle, crear pedido, estado (admin)
├── checkout/              # Sesión de Stripe Checkout
├── webhook/               # Webhook de Stripe (raw body), crea orden al completar pago
├── upload/                # Subida/borrado de imágenes en Cloudinary (admin)
├── admin/                 # Dashboard y listado de pedidos (admin)
└── users/                 # Gestión de usuarios (listar/crear, admin)
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
