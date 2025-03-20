import { di } from '@/app/di'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> | { athleteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const resolvedParams = params instanceof Promise ? await params : params
    const athleteId = resolvedParams.athleteId
    
    const result = await di.dailyConsumptionService.getDailyConsumption(athleteId, date)
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
    
    const nutritionTotals = await di.dailyConsumptionService.calculateNutrition(result.docs)
    
    return NextResponse.json({
      ...result,
      nutritionTotals,
    })
  } catch (error) {
    console.error('Error in consumption API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
