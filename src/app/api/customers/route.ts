import { db, ensureBusiness } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Ensure business exists before querying (handles fresh DB)
    await ensureBusiness()

    const customers = await db.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        deliveries: {
          select: { amount: true, liters: true },
        },
        payments: {
          select: { amount: true },
        },
      },
    })

    const customersWithBalance = customers.map((customer) => {
      const totalDeliveryAmount = customer.deliveries.reduce(
        (sum, d) => sum + d.amount,
        0
      )
      const totalPaymentAmount = customer.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      )
      const totalLiters = customer.deliveries.reduce(
        (sum, d) => sum + d.liters,
        0
      )
      const balance = Math.round((totalDeliveryAmount - totalPaymentAmount) * 100) / 100

      return {
        id: customer.id,
        businessId: customer.businessId,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        milkType: customer.milkType,
        dailyLimit: customer.dailyLimit,
        balance,
        totalLiters: Math.round(totalLiters * 100) / 100,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }
    })

    return NextResponse.json(customersWithBalance)
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, milkType, dailyLimit } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const business = await ensureBusiness()

    const customer = await db.customer.create({
      data: {
        businessId: business.id,
        name,
        phone: phone || null,
        address: address || null,
        milkType: milkType || 'COW',
        dailyLimit: dailyLimit || 0,
      },
    })

    return NextResponse.json({
      ...customer,
      balance: 0,
      totalLiters: 0,
    }, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
