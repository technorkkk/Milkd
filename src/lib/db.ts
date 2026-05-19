import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Ensures a business exists in the database.
 * If no business is found, it auto-creates one with default values,
 * along with default milk prices and settings.
 * This prevents "No business found" errors on fresh installations.
 * Uses upsert for milk prices to handle concurrent calls safely.
 */
export async function ensureBusiness() {
  let business = await db.business.findFirst()

  if (!business) {
    // Create a default user first (use upsert to handle race conditions)
    const user = await db.user.upsert({
      where: { email: 'owner@dairy.com' },
      update: {},
      create: {
        name: 'Dairy Owner',
        email: 'owner@dairy.com',
        password: 'default123',
      },
    })

    // Create the business
    business = await db.business.create({
      data: {
        userId: user.id,
        name: 'My Dairy Farm',
        phone: '',
        address: '',
      },
    })

    // Create default milk prices using upsert to avoid unique constraint violations
    await db.milkPrice.upsert({
      where: { type: 'COW' },
      update: { price: 50, businessId: business.id },
      create: { businessId: business.id, type: 'COW', price: 50 },
    })
    await db.milkPrice.upsert({
      where: { type: 'BUFFALO' },
      update: { price: 60, businessId: business.id },
      create: { businessId: business.id, type: 'BUFFALO', price: 60 },
    })

    // Create default settings (use upsert in case it already exists)
    await db.settings.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        darkMode: false,
        retentionMonths: 5,
        currency: 'INR',
      },
    })
  }

  return business
}
