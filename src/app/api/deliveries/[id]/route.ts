import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const delivery = await db.dailyDelivery.findUnique({
      where: { id },
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    const customerId = delivery.customerId

    await db.dailyDelivery.delete({ where: { id } })

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
      deletedDelivery: {
        id: delivery.id,
        customerId: delivery.customerId,
        date: delivery.date,
        shift: delivery.shift,
        liters: delivery.liters,
        amount: delivery.amount,
      },
      balance,
    })
  } catch (error) {
    console.error('Delete delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to delete delivery' },
      { status: 500 }
    )
  }
}
