import { db, ensureBusiness } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

function serializeMilkPrice(mp: {
  id: string
  businessId: string
  type: string
  price: number
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: mp.id,
    businessId: mp.businessId,
    type: mp.type,
    price: mp.price,
    createdAt: mp.createdAt.toISOString(),
    updatedAt: mp.updatedAt.toISOString(),
  }
}

export async function GET() {
  try {
    const business = await ensureBusiness()

    const milkPrices = await db.milkPrice.findMany({
      where: { businessId: business.id },
    })

    return NextResponse.json(milkPrices.map(serializeMilkPrice))
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

    const business = await ensureBusiness()

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

    return NextResponse.json(results.map(serializeMilkPrice))
  } catch (error) {
    console.error('Update milk prices error:', error)
    return NextResponse.json(
      { error: 'Failed to update milk prices' },
      { status: 500 }
    )
  }
}
