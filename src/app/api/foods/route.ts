import { di } from '@/app/di'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    
    const result = await di.dailyConsumptionService.getFoods(search)
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in foods API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}