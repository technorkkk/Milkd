import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params
    const { searchParams } = new URL(request.url)
    const monthStr = searchParams.get('month')
    const yearStr = searchParams.get('year')

    if (!monthStr || !yearStr) {
      return NextResponse.json(
        { error: 'month and year query parameters are required' },
        { status: 400 }
      )
    }

    const month = parseInt(monthStr, 10)
    const year = parseInt(yearStr, 10)

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if invoice already exists
    const existingInvoice = await db.invoice.findUnique({
      where: {
        customerId_month_year: {
          customerId,
          month,
          year,
        },
      },
    })

    if (existingInvoice) {
      return NextResponse.json(existingInvoice)
    }

    // Compute from deliveries and payments
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

    const deliveries = await db.dailyDelivery.findMany({
      where: {
        customerId,
        date: { startsWith: monthPrefix },
      },
    })

    const payments = await db.payment.findMany({
      where: {
        customerId,
        date: { startsWith: monthPrefix },
      },
    })

    const totalLiters = Math.round(
      deliveries.reduce((sum, d) => sum + d.liters, 0) * 100
    ) / 100
    const totalAmount = Math.round(
      deliveries.reduce((sum, d) => sum + d.amount, 0) * 100
    ) / 100
    const paidAmount = Math.round(
      payments.reduce((sum, p) => sum + p.amount, 0) * 100
    ) / 100
    const balance = Math.round((totalAmount - paidAmount) * 100) / 100

    // Create the invoice
    const invoice = await db.invoice.create({
      data: {
        customerId,
        month,
        year,
        totalLiters,
        totalAmount,
        paidAmount,
        balance,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Get/generate invoice error:', error)
    return NextResponse.json(
      { error: 'Failed to get or generate invoice' },
      { status: 500 }
    )
  }
}
