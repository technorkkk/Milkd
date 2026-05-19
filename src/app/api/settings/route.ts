import { db, ensureBusiness } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

function serializeSettings(settings: {
  id: string
  businessId: string
  darkMode: boolean
  retentionMonths: number
  currency: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: settings.id,
    businessId: settings.businessId,
    darkMode: settings.darkMode,
    retentionMonths: settings.retentionMonths,
    currency: settings.currency,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  }
}

export async function GET() {
  try {
    const business = await ensureBusiness()

    let settings = await db.settings.findUnique({
      where: { businessId: business.id },
    })

    if (!settings) {
      // Create default settings if they don't exist
      settings = await db.settings.create({
        data: {
          businessId: business.id,
          darkMode: false,
          retentionMonths: 5,
          currency: 'INR',
        },
      })
    }

    return NextResponse.json(serializeSettings(settings))
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

    const business = await ensureBusiness()

    let settings = await db.settings.findUnique({
      where: { businessId: business.id },
    })

    if (settings) {
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

    return NextResponse.json(serializeSettings(settings))
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
