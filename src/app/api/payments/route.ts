import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const date = searchParams.get('date')
    const method = searchParams.get('method')

    const where: Prisma.PaymentWhereInput = {}
    if (customerId) where.customerId = customerId
    if (date) where.date = date
    if (method) where.method = method

    const payments = await db.payment.findMany({
      where,
      include: {
        customer: {
          select: { name: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    const result = payments.map((p) => ({
      id: p.id,
      customerId: p.customerId,
      customerName: p.customer.name,
      amount: p.amount,
      date: p.date,
      method: p.method,
      note: p.note,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, amount, date, method, note } = body

    if (!customerId || amount === undefined || !date || !method) {
      return NextResponse.json(
        { error: 'customerId, amount, date, and method are required' },
        { status: 400 }
      )
    }

    const customer = await db.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const payment = await db.payment.create({
      data: {
        customerId,
        amount,
        date,
        method,
        note: note || null,
      },
      include: {
        customer: {
          select: { name: true },
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
        payment: {
          id: payment.id,
          customerId: payment.customerId,
          customerName: payment.customer.name,
          amount: payment.amount,
          date: payment.date,
          method: payment.method,
          note: payment.note,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
        balance,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
