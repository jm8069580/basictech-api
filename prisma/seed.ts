import 'dotenv/config'
import { seedCore } from './seeds/seed-core'
import { seedBasicTechProfile } from './seeds/profiles/basictech'

async function main() {
  const profile = process.env.SEED_PROFILE ?? 'basictech'

  await seedCore()

  switch (profile) {
    case 'basictech':
      await seedBasicTechProfile()
      break
    default:
      console.log(`Unknown SEED_PROFILE: ${profile}. Skipping profile seed.`)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })
    await prisma.$disconnect()
    pool.end()
  })
