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

    const milkPrices = await db.milkPrice.findMany({
      where: { businessId: business.id },
    })

    return NextResponse.json(milkPrices)
  } catch (error) {
    console.error('Get milk prices error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milk prices' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { prices } = body as { prices: Array<{ type: string; price: number }> }

    if (!prices || !Array.isArray(prices)) {
      return NextResponse.json(
        { error: 'prices array is required' },
        { status: 400 }
      )
    }

    const business = await db.business.findFirst()
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      prices.map((p) =>
        db.milkPrice.upsert({
          where: { type: p.type },
          update: { price: p.price },
          create: {
            businessId: business.id,
            type: p.type,
            price: p.price,
          },
        })
      )
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Update milk prices error:', error)
    return NextResponse.json(
      { error: 'Failed to update milk prices' },
      { status: 500 }
    )
  }
}
