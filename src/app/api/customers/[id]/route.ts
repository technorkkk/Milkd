import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        deliveries: {
          orderBy: [{ date: 'desc' }, { shift: 'desc' }],
        },
        payments: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Compute balance
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

    // Recent 10 deliveries
    const recentDeliveries = customer.deliveries.slice(0, 10)

    // Recent 10 payments
    const recentPayments = customer.payments.slice(0, 10)

    // Month-wise liters aggregation (last 6 months)
    const now = new Date()
    const monthWiseLiters: Array<{ month: number; year: number; liters: number }> = []

    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth() + 1
      const year = d.getFullYear()
      const monthStr = `${year}-${String(month).padStart(2, '0')}`

      const litersForMonth = customer.deliveries
        .filter((del) => del.date.startsWith(monthStr))
        .reduce((sum, del) => sum + del.liters, 0)

      if (litersForMonth > 0) {
        monthWiseLiters.push({
          month,
          year,
          liters: Math.round(litersForMonth * 100) / 100,
        })
      }
    }

    return NextResponse.json({
      id: customer.id,
      businessId: customer.businessId,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      milkType: customer.milkType,
      dailyLimit: customer.dailyLimit,
      balance,
      totalLiters: Math.round(totalLiters * 100) / 100,
      recentDeliveries,
      recentPayments,
      monthWiseLiters,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, address, milkType, dailyLimit } = body

    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(milkType !== undefined && { milkType }),
        ...(dailyLimit !== undefined && { dailyLimit }),
      },
      include: {
        deliveries: { select: { amount: true, liters: true } },
        payments: { select: { amount: true } },
      },
    })

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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    await db.customer.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Customer deleted' })
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
