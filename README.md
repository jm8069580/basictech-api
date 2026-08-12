# basictech-api

Backend **NestJS** de **BasicTechShop**, e-commerce de productos de computación.

Es la **migración** del backend que antes vivía como API routes dentro del frontend Next.js (`../../react/ecommerce`). Usa el mismo modelo de datos Prisma/PostgreSQL y autenticación **JWT** (access 15m + refresh 7d) en lugar de NextAuth.

## Requisitos

- Node.js 20+
- PostgreSQL (la DB `basictech_shop` es compartida con el frontend)

## Instalación

```bash
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET, etc.

# Sembrar datos iniciales
npm run db:seed
```

## Desarrollo

```bash
# Servidor en modo watch (puerto 3001)
npm run start:dev
```

## Endpoints actuales

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/auth/register` | Registro de usuario | Público |
| POST | `/auth/login` | Login, devuelve access + refresh | Público |
| POST | `/auth/refresh` | Renovar access token | Público |
| GET | `/auth/me` | Usuario actual | Autenticado |
| GET | `/products` | Listado con filtros y paginación | Público |
| POST | `/products` | Crear producto | ADMIN |
| GET | `/products/:id` | Detalle (por slug o id) | Público |
| PUT/DELETE | `/products/:id` | Actualizar/eliminar | ADMIN |
| GET | `/categories` | Categorías con conteo | Público |
| POST | `/categories` | Crear categoría | ADMIN |
| GET | `/brands` | Marcas con conteo | Público |
| POST | `/brands` | Crear marca | ADMIN |

## Pendiente de migrar

- Orders y addresses
- Checkout/Stripe + webhook
- Upload/Cloudinary
- Admin dashboard y admin users

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor en modo watch |
| `npm run build` | Compila a `dist/` |
| `npm run lint` | ESLint con `--fix` |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Tests e2e |
| `npm run db:seed` | Seed de la base de datos |

## Documentación para agentes de IA

Ver [CLAUDE.md](./CLAUDE.md) con el detalle de arquitectura, convenciones y estado de la migración.
