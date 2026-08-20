# basictech-api

Backend **NestJS** e-commerce base/template. Diseñado para ser **reutilizable** como core de tiendas de distintos rubros (computación, moda, alimentos, etc.) sin empezar de 0.

> Ver [TEMPLATE.md](./TEMPLATE.md) para la guía de cómo derivar un nuevo cliente.

## Características

- **Auth JWT**: register, login, refresh, me. Guards `@Public()`, `@Roles()`, `@CurrentUser()`.
- **Products**: CRUD + filtros (categoría, marca, precio, sort, búsqueda) + paginación.
- **Catalog**: categories y brands.
- **Addresses**: CRUD del usuario autenticado.
- **Orders**: pedidos, detalle, crear, estado (admin), con **tax** e **impuestos**.
- **Checkout**: Stripe Checkout con moneda, país y envío **parametrizable**.
- **Webhook**: Stripe webhook que crea la orden al completar pago.
- **Upload**: imágenes a Cloudinary (folder configurable).
- **Admin**: dashboard + listado de pedidos + gestión de usuarios.
- **Coupons**: CRUD + validación (PERCENTAGE/FIXED, minSubtotal, maxDiscount, vencimiento, límite de uso).
- **Wishlist**: favoritos del usuario.
- **Reviews**: reseñas de productos con rating 1-5 + summary (promedio + distribución).
- **Email**: stub SMTP listo para nodemailer (order confirmation, welcome, password reset).
- **StoreConfig**: configuración de tienda por `.env` + tabla `store_config` (runtime).

## Requisitos

- Node.js 20+
- PostgreSQL

## Instalación

```bash
npm install

cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET, APP_NAME, CURRENCY, etc.

# Iniciar DB con Docker
docker-compose up -d

# Sembrar datos iniciales
SEED_PROFILE=basictech npm run db:seed
```

## Desarrollo

```bash
npm run start:dev  # http://localhost:3001
```

## Endpoints

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/config` | Config pública de la tienda | Público |
| POST | `/auth/register` | Registro | Público |
| POST | `/auth/login` | Login | Público |
| POST | `/auth/refresh` | Renovar token | Público |
| GET | `/auth/me` | Usuario actual | Autenticado |
| GET | `/products` | Listado con filtros y paginación | Público |
| POST | `/products` | Crear producto | ADMIN |
| GET | `/products/:id` | Detalle (por slug o id) | Público |
| PUT/DELETE | `/products/:id` | Actualizar/eliminar | ADMIN |
| GET/POST | `/categories` | Categorías | Público/ADMIN |
| GET/POST | `/brands` | Marcas | Público/ADMIN |
| GET/POST/PUT/DELETE | `/addresses` | Direcciones del usuario | Autenticado |
| GET/POST | `/orders` | Pedidos | Autenticado |
| GET/PUT | `/orders/:id` | Detalle / estado | Autenticado/ADMIN |
| POST | `/checkout` | Sesión de Stripe | Autenticado |
| POST | `/webhook/stripe` | Webhook de Stripe | Público |
| POST/DELETE | `/upload` | Imágenes Cloudinary | ADMIN |
| GET | `/admin/dashboard` | Stats | ADMIN |
| GET | `/admin/orders` | Listado de pedidos | ADMIN |
| GET/POST | `/users` | Gestión de usuarios | ADMIN |
| GET/POST/PATCH/DELETE | `/coupons` | CRUD cupones | ADMIN |
| GET | `/coupons/validate` | Validar cupón | Público |
| GET/POST/DELETE | `/wishlist` | Wishlist del usuario | Autenticado |
| GET/POST/PATCH/DELETE | `/reviews` | Reseñas de productos | Público/Autenticado |

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor en modo watch |
| `npm run build` | Compila a `dist/` |
| `npm run lint` | ESLint con `--fix` |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Tests e2e |
| `npm run db:seed` | Seed (core + profile según `SEED_PROFILE`) |

## Documentación

- [TEMPLATE.md](./TEMPLATE.md) — Guía para derivar un nuevo cliente.
- [CLAUDE.md](./CLAUDE.md) — Detalle de arquitectura y convenciones.
