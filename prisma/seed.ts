import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.dailyDelivery.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.milkPrice.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // Create user
  const user = await prisma.user.create({
    data: {
      name: 'Rahul',
      email: 'rahul@dairy.com',
      password: 'hashed123',
    },
  })

  // Create business
  const business = await prisma.business.create({
    data: {
      userId: user.id,
      name: 'Rahul Dairy Farm',
      phone: '9876543210',
      address: 'Main Road, Village',
    },
  })

  // Create milk prices
  const cowPrice = await prisma.milkPrice.create({
    data: {
      businessId: business.id,
      type: 'COW',
      price: 50,
    },
  })

  const buffaloPrice = await prisma.milkPrice.create({
    data: {
      businessId: business.id,
      type: 'BUFFALO',
      price: 60,
    },
  })

  // Create settings
  await prisma.settings.create({
    data: {
      businessId: business.id,
      darkMode: false,
      retentionMonths: 5,
      currency: 'INR',
    },
  })

  // Create 5 customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'Amit Sharma',
        phone: '9876543211',
        address: 'House 1, Main Street',
        milkType: 'COW',
        dailyLimit: 5,
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'Priya Patel',
        phone: '9876543212',
        address: 'House 2, Cross Road',
        milkType: 'BUFFALO',
        dailyLimit: 3,
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'Rajesh Kumar',
        phone: '9876543213',
        address: 'House 3, Park Lane',
        milkType: 'COW',
        dailyLimit: 4,
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'Sunita Devi',
        phone: '9876543214',
        address: 'House 4, Temple Road',
        milkType: 'BUFFALO',
        dailyLimit: 2,
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'Vikram Singh',
        phone: '9876543215',
        address: 'House 5, Market Chowk',
        milkType: 'COW',
        dailyLimit: 6,
      },
    }),
  ])

  // Today's date
  const today = new Date().toISOString().split('T')[0]

  // Sample deliveries for today - both shifts for each customer
  const deliveryData: Array<{
    customerId: string
    date: string
    shift: string
    liters: number
    rate: number
    amount: number
  }> = []

  for (const customer of customers) {
    const rate = customer.milkType === 'COW' ? cowPrice.price : buffaloPrice.price

    // Morning delivery
    const morningLiters = Math.round(customer.dailyLimit * 0.6 * 100) / 100
    deliveryData.push({
      customerId: customer.id,
      date: today,
      shift: 'MORNING',
      liters: morningLiters,
      rate,
      amount: Math.round(morningLiters * rate * 100) / 100,
    })

    // Evening delivery
    const eveningLiters = Math.round(customer.dailyLimit * 0.4 * 100) / 100
    deliveryData.push({
      customerId: customer.id,
      date: today,
      shift: 'EVENING',
      liters: eveningLiters,
      rate,
      amount: Math.round(eveningLiters * rate * 100) / 100,
    })
  }

  await prisma.dailyDelivery.createMany({ data: deliveryData })

  // Sample payments
  await prisma.payment.createMany({
    data: [
      {
        customerId: customers[0].id,
        amount: 500,
        date: today,
        method: 'CASH',
        note: 'Monthly advance',
      },
      {
        customerId: customers[1].id,
        amount: 300,
        date: today,
        method: 'UPI',
        note: 'Weekly payment',
      },
      {
        customerId: customers[2].id,
        amount: 200,
        date: today,
        method: 'CASH',
      },
      {
        customerId: customers[4].id,
        amount: 1000,
        date: today,
        method: 'BANK',
        note: 'Full month payment',
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log(`User: ${user.name} (${user.email})`)
  console.log(`Business: ${business.name}`)
  console.log(`Milk Prices: COW=₹${cowPrice.price}, BUFFALO=₹${buffaloPrice.price}`)
  console.log(`Customers: ${customers.map((c) => c.name).join(', ')}`)
  console.log(`Deliveries: ${deliveryData.length} entries for ${today}`)
  console.log('Payments: 4 sample payments')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
