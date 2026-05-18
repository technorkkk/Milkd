import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const business = await db.business.findFirst()
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 400 }
      )
    }

    const settings = await db.settings.findUnique({
      where: { businessId: business.id },
    })

    const retentionMonths = settings?.retentionMonths ?? 5

    // Calculate cutoff date
    const now = new Date()
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - retentionMonths, 1)
    const cutoffStr = cutoffDate.toISOString().split('T')[0]

    // Delete deliveries older than cutoff
    const deletedDeliveries = await db.dailyDelivery.deleteMany({
      where: {
        date: { lt: cutoffStr },
      },
    })

    // Delete payments older than cutoff
    const deletedPayments = await db.payment.deleteMany({
      where: {
        date: { lt: cutoffStr },
      },
    })

    // Delete invoices for months older than cutoff
    const cutoffYear = cutoffDate.getFullYear()
    const cutoffMonth = cutoffDate.getMonth() + 1

    const deletedInvoices = await db.invoice.deleteMany({
      where: {
        OR: [
          { year: { lt: cutoffYear } },
          {
            year: cutoffYear,
            month: { lt: cutoffMonth },
          },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      cutoffDate: cutoffStr,
      deleted: {
        deliveries: deletedDeliveries.count,
        payments: deletedPayments.count,
        invoices: deletedInvoices.count,
      },
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup old records' },
      { status: 500 }
    )
  }
}
