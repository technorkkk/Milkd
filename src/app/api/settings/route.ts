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

    const settings = await db.settings.findUnique({
      where: { businessId: business.id },
    })

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await db.settings.create({
        data: {
          businessId: business.id,
          darkMode: false,
          retentionMonths: 5,
          currency: 'INR',
        },
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { darkMode, retentionMonths, currency } = body

    const business = await db.business.findFirst()
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 400 }
      )
    }

    const existing = await db.settings.findUnique({
      where: { businessId: business.id },
    })

    let settings

    if (existing) {
      settings = await db.settings.update({
        where: { businessId: business.id },
        data: {
          ...(darkMode !== undefined && { darkMode }),
          ...(retentionMonths !== undefined && { retentionMonths }),
          ...(currency !== undefined && { currency }),
        },
      })
    } else {
      settings = await db.settings.create({
        data: {
          businessId: business.id,
          darkMode: darkMode ?? false,
          retentionMonths: retentionMonths ?? 5,
          currency: currency ?? 'INR',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
