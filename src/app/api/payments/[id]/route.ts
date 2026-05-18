import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const payment = await db.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const customerId = payment.customerId

    await db.payment.delete({ where: { id } })

    // Compute updated customer balance
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        deliveries: { select: { amount: true } },
        payments: { select: { amount: true } },
      },
    })

    const totalDeliveryAmount = customer
      ? customer.deliveries.reduce((sum, d) => sum + d.amount, 0)
      : 0
    const totalPaymentAmount = customer
      ? customer.payments.reduce((sum, p) => sum + p.amount, 0)
      : 0
    const balance = Math.round((totalDeliveryAmount - totalPaymentAmount) * 100) / 100

    return NextResponse.json({
      success: true,
      balance,
    })
  } catch (error) {
    console.error('Delete payment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
