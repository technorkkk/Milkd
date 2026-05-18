import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body as { type: 'ALL' | 'CUSTOMERS' | 'DELIVERIES' | 'PAYMENTS' }

    if (!type) {
      return NextResponse.json(
        { error: 'type is required (ALL, CUSTOMERS, DELIVERIES, PAYMENTS)' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'ALL': {
        // Delete all invoices first, then customers (cascades to deliveries, payments), then remaining invoices
        const deletedInvoices = await db.invoice.deleteMany()
        const deletedCustomers = await db.customer.deleteMany()
        return NextResponse.json({
          success: true,
          message: 'All data reset',
          deleted: {
            invoices: deletedInvoices.count,
            customers: deletedCustomers.count,
          },
        })
      }

      case 'CUSTOMERS': {
        // Deleting customers cascades to deliveries, payments, invoices
        const deleted = await db.customer.deleteMany()
        return NextResponse.json({
          success: true,
          message: 'All customers and related data deleted',
          deleted: { customers: deleted.count },
        })
      }

      case 'DELIVERIES': {
        // Delete invoices that reference deliveries we're about to delete
        await db.invoice.deleteMany()
        const deleted = await db.dailyDelivery.deleteMany()
        return NextResponse.json({
          success: true,
          message: 'All deliveries deleted',
          deleted: { deliveries: deleted.count },
        })
      }

      case 'PAYMENTS': {
        // Delete invoices that reference payments we're about to delete
        await db.invoice.deleteMany()
        const deleted = await db.payment.deleteMany()
        return NextResponse.json({
          success: true,
          message: 'All payments deleted',
          deleted: { payments: deleted.count },
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use ALL, CUSTOMERS, DELIVERIES, or PAYMENTS' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Reset data error:', error)
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    )
  }
}
