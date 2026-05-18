import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const business = await db.business.findFirst()
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 400 }
      )
    }
    return NextResponse.json({
      id: business.id,
      name: business.name,
      phone: business.phone,
      address: business.address,
    })
  } catch (error) {
    console.error('Get business error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address } = body

    const business = await db.business.findFirst()
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 400 }
      )
    }

    const updated = await db.business.update({
      where: { id: business.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      address: updated.address,
    })
  } catch (error) {
    console.error('Update business error:', error)
    return NextResponse.json(
      { error: 'Failed to update business info' },
      { status: 500 }
    )
  }
}
