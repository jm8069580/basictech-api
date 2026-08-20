import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export async function seedCore() {
  console.log('Seeding core data...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.shippingRate.deleteMany()
  await prisma.storeConfig.deleteMany()
  await prisma.user.deleteMany()

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@basictech.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      phone: '+51 999 888 777',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  const customerUser = await prisma.user.create({
    data: {
      email: 'juan@email.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Juan Perez',
      phone: '+51 987 654 321',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  })
  console.log(`Created customer user: ${customerUser.email}`)

  await prisma.address.create({
    data: {
      label: 'Casa',
      name: 'Juan Perez',
      phone: '+51 987 654 321',
      address: 'Av. Javier Prado 1234',
      city: 'Lima',
      state: 'Lima',
      zipCode: '15036',
      isDefault: true,
      userId: customerUser.id,
    },
  })
  console.log('Created address for customer')

  await prisma.shippingRate.createMany({
    data: [
      {
        name: 'Envio estandar',
        amount: 15,
        currency: 'pen',
        minDays: 3,
        maxDays: 5,
        isActive: true,
      },
      {
        name: 'Envio express',
        amount: 30,
        currency: 'pen',
        minDays: 1,
        maxDays: 2,
        isActive: true,
      },
    ],
  })
  console.log('Created shipping rates')

  await prisma.storeConfig.createMany({
    data: [
      { key: 'appName', value: process.env.APP_NAME ?? 'BasicTechShop' },
      { key: 'appUrl', value: process.env.APP_URL ?? 'http://localhost:3000' },
      { key: 'currency', value: process.env.CURRENCY ?? 'pen' },
      { key: 'orderPrefix', value: process.env.ORDER_PREFIX ?? 'BT' },
      {
        key: 'shippingCountries',
        value: process.env.SHIPPING_COUNTRIES ?? 'PE',
      },
      {
        key: 'freeShippingThreshold',
        value: process.env.FREE_SHIPPING_THRESHOLD ?? '200',
      },
      { key: 'taxRate', value: process.env.TAX_RATE ?? '0' },
      {
        key: 'cloudinaryFolder',
        value: process.env.CLOUDINARY_FOLDER ?? 'basictech/products',
      },
    ],
  })
  console.log('Created store config')

  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: '10% de descuento en tu primera compra',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSubtotal: 50,
      status: 'ACTIVE',
    },
  })
  console.log('Created welcome coupon')
}
