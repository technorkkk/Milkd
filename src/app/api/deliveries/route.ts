import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const shift = searchParams.get('shift')
    const customerId = searchParams.get('customerId')

    const where: Prisma.DailyDeliveryWhereInput = {}
    if (date) where.date = date
    if (shift) where.shift = shift
    if (customerId) where.customerId = customerId

    const deliveries = await db.dailyDelivery.findMany({
      where,
      include: {
        customer: {
          select: { name: true, milkType: true },
        },
      },
      orderBy: [{ date: 'desc' }, { shift: 'desc' }],
    })

    const result = deliveries.map((d) => ({
      id: d.id,
      customerId: d.customerId,
      customerName: d.customer.name,
      milkType: d.customer.milkType,
      date: d.date,
      shift: d.shift,
      liters: d.liters,
      rate: d.rate,
      amount: d.amount,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get deliveries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, date, shift, liters } = body

    if (!customerId || !date || !shift || liters === undefined) {
      return NextResponse.json(
        { error: 'customerId, date, shift, and liters are required' },
        { status: 400 }
      )
    }

    // Get customer to find milkType
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get milk price for the customer's milk type
    const milkPrice = await db.milkPrice.findUnique({
      where: { type: customer.milkType },
    })

    if (!milkPrice) {
      return NextResponse.json(
        { error: `No price found for milk type: ${customer.milkType}` },
        { status: 400 }
      )
    }

    const rate = milkPrice.price
    const amount = Math.round(liters * rate * 100) / 100

    // Create delivery
    const delivery = await db.dailyDelivery.create({
      data: {
        customerId,
        date,
        shift,
        liters,
        rate,
        amount,
      },
      include: {
        customer: {
          select: { name: true, milkType: true },
        },
      },
    })

    // Compute updated customer balance
    const customerWithRecords = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        deliveries: { select: { amount: true } },
        payments: { select: { amount: true } },
      },
    })

    const totalDeliveryAmount = customerWithRecords!.deliveries.reduce(
      (sum, d) => sum + d.amount,
      0
    )
    const totalPaymentAmount = customerWithRecords!.payments.reduce(
      (sum, p) => sum + p.amount,
      0
    )
    const balance = Math.round((totalDeliveryAmount - totalPaymentAmount) * 100) / 100

    return NextResponse.json(
      {
        delivery: {
          id: delivery.id,
          customerId: delivery.customerId,
          customerName: delivery.customer.name,
          milkType: delivery.customer.milkType,
          date: delivery.date,
          shift: delivery.shift,
          liters: delivery.liters,
          rate: delivery.rate,
          amount: delivery.amount,
          createdAt: delivery.createdAt,
          updatedAt: delivery.updatedAt,
        },
        balance,
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle unique constraint violation (one delivery per customer per date per shift)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Delivery already exists for this customer, date, and shift' },
        { status: 409 }
      )
    }

    console.error('Create delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to create delivery' },
      { status: 500 }
    )
  }
}
