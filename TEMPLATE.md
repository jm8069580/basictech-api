# TEMPLATE.md — Cómo derivar un nuevo cliente desde basictech-api

`basictech-api` es el **template/core** de un backend e-commerce NestJS. Este documento explica cómo derivar una nueva instancia para un cliente con productos/contexto distinto.

## Pasos para derivar un cliente nuevo

### 1. Clonar el repositorio

```bash
git clone basictech-api <cliente>-api
cd <cliente>-api

# Mantener el upstream para recibir mejoras del core
git remote add upstream <url-de-basictech-api>
```

### 2. Configurar variables de entorno

Editar `.env` con los valores del cliente:

```env
# Base de datos — usar un nombre distinto por cliente
DATABASE_URL="postgresql://<cliente>:<pass>@localhost:<puerto>/<cliente>_shop"

# Identidad de la tienda
APP_NAME="<Cliente>Shop"
APP_URL="https://<cliente>.com"
CURRENCY="usd"          # pen, usd, eur, etc.
ORDER_PREFIX="<SIGLAS>" # p. ej. ACME
SHIPPING_COUNTRIES="US,CA"
FREE_SHIPPING_THRESHOLD="100"
TAX_RATE="0.18"         # 18% IGV Perú, 0% para precios tax-included

# Cloudinary folder del cliente
CLOUDINARY_FOLDER="<cliente>/products"
```

### 3. Ajustar docker-compose.yml

Cambiar el nombre del contenedor, DB y credenciales:

```yaml
services:
  postgres:
    container_name: <cliente>-db
    environment:
      POSTGRES_USER: <cliente>
      POSTGRES_PASSWORD: <pass>
      POSTGRES_DB: <cliente>_shop
    ports:
      - "<puerto>:5432"
    volumes:
      - <cliente>-postgres-data:/var/lib/postgresql/data

volumes:
  <cliente>-postgres-data:
```

### 4. Crear seed profile del cliente

Crear `prisma/seeds/profiles/<cliente>.ts` con categorías, marcas y productos del rubro del cliente (moda, alimentos, ferretería, etc.).

Registrarlo en `prisma/seed.ts`:

```typescript
import { seed<Cliente>Profile } from './seeds/profiles/<cliente>'

switch (profile) {
  case '<cliente>':
    await seed<Cliente>Profile()
    break
  // ...
}
```

Ejecutar:

```bash
SEED_PROFILE=<cliente> npm run db:seed
```

### 5. (Opcional) Extender el schema

Si el cliente necesita campos adicionales (variantes de producto, talla/color, fecha de vencimiento, etc.):

1. Agregar los campos/modelos en `prisma/schema.prisma`.
2. Crear la migración: `npx prisma migrate dev --name <descripcion>`.
3. Implementar los módulos/services correspondientes en `src/`.

### 6. Sincronizar mejoras del core

Para traer mejoras del template original:

```bash
git fetch upstream
git merge upstream/main
# resolver conflictos si se customization divergió
npx prisma migrate dev   # aplicar migraciones nuevas
```

## Configuración sin redeploy: StoreConfig

Los parámetros de la tienda también se pueden cambiar en runtime vía la tabla `store_config` (key-value) o usando `StoreConfigService`:

```typescript
// Ejemplo: cambiar umbral de envío gratis
await storeConfigService.set('freeShippingThreshold', '150')
```

Las tarifas de envío se gestionan en la tabla `shipping_rates`.

## Endpoints disponibles

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/config` | Config pública de la tienda | Público |
| POST | `/auth/register` | Registro | Público |
| POST | `/auth/login` | Login | Público |
| POST | `/auth/refresh` | Renovar token | Público |
| GET | `/auth/me` | Usuario actual | Autenticado |
| GET/POST/PUT/DELETE | `/products` | CRUD de productos | Público/ADMIN |
| GET/POST | `/categories` | Categorías | Público/ADMIN |
| GET/POST | `/brands` | Marcas | Público/ADMIN |
| GET/POST/PUT/DELETE | `/addresses` | Direcciones del usuario | Autenticado |
| GET/POST | `/orders` | Pedidos | Autenticado |
| GET/PUT | `/orders/:id` | Detalle / estado | Autenticado/ADMIN |
| POST | `/checkout` | Sesión Stripe | Autenticado |
| POST | `/webhook/stripe` | Webhook Stripe | Público |
| POST/DELETE | `/upload` | Imágenes Cloudinary | ADMIN |
| GET | `/admin/dashboard` | Stats | ADMIN |
| GET | `/admin/orders` | Listado pedidos | ADMIN |
| GET/POST | `/users` | Gestión usuarios | ADMIN |
| GET/POST/PATCH/DELETE | `/coupons` | CRUD cupones | ADMIN |
| GET | `/coupons/validate` | Validar cupón | Público |
| GET/POST/DELETE | `/wishlist` | Wishlist del usuario | Autenticado |
| GET/POST/PATCH/DELETE | `/reviews` | Reseñas de productos | Público/Autenticado |

## Puntos seguros de personalización

- `prisma/schema.prisma` — extender con campos del cliente
- `prisma/seeds/profiles/` — datos del catálogo del cliente
- `.env` — todos los parámetros de tienda
- `src/products/transformers.ts` — ajustar shape de respuesta si el frontend necesita campos distintos
- `src/checkout/checkout.service.ts` — lógica de envío/pagos específica
- `src/email/` — plantillas de email con branding del cliente
