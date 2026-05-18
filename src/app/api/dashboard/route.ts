import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Today's deliveries
    const todayDeliveries = await db.dailyDelivery.findMany({
      where: { date: today },
      include: {
        customer: {
          select: { name: true, milkType: true },
        },
      },
    })

    const todayDeliveriesCount = todayDeliveries.length
    const todayLiters = todayDeliveries.reduce((sum, d) => sum + d.liters, 0)
    const todayAmount = todayDeliveries.reduce((sum, d) => sum + d.amount, 0)

    // Today's collections
    const todayPayments = await db.payment.findMany({
      where: { date: today },
    })
    const todayCollections = todayPayments.reduce((sum, p) => sum + p.amount, 0)

    // Total customers
    const totalCustomers = await db.customer.count()

    // Total outstanding across all customers
    const allDeliveries = await db.dailyDelivery.findMany({
      select: { customerId: true, amount: true },
    })
    const allPayments = await db.payment.findMany({
      select: { customerId: true, amount: true },
    })

    const totalDeliveryAmount = allDeliveries.reduce((sum, d) => sum + d.amount, 0)
    const totalPaymentAmount = allPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalOutstanding = totalDeliveryAmount - totalPaymentAmount

    // Morning and Evening deliveries
    const morningDeliveries = todayDeliveries
      .filter((d) => d.shift === 'MORNING')
      .map((d) => ({
        id: d.id,
        customerId: d.customerId,
        customerName: d.customer.name,
        milkType: d.customer.milkType,
        liters: d.liters,
        rate: d.rate,
        amount: d.amount,
      }))

    const eveningDeliveries = todayDeliveries
      .filter((d) => d.shift === 'EVENING')
      .map((d) => ({
        id: d.id,
        customerId: d.customerId,
        customerName: d.customer.name,
        milkType: d.customer.milkType,
        liters: d.liters,
        rate: d.rate,
        amount: d.amount,
      }))

    return NextResponse.json({
      todayDeliveries: todayDeliveriesCount,
      todayLiters: Math.round(todayLiters * 100) / 100,
      todayAmount: Math.round(todayAmount * 100) / 100,
      todayCollections: Math.round(todayCollections * 100) / 100,
      totalCustomers,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      morningDeliveries,
      eveningDeliveries,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
