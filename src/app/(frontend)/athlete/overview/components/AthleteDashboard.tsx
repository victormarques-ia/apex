'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DailySchedule from './daily-schedule'
import { number } from 'zod'

type AssessmentData = {
  weight: number
  bodyFat: number
  abdominalFold: number
  armMeasurement: number
  thighFold: number
  lastAssessment?: {
    weight: number
    bodyFat: number
    abdominalFold: number
    armMeasurement: number
    thighFold: number
  }
}

type ScheduleItem = {
  time: string
  activity: string
  details?: string
  diet_plan?: number
  foods?: {
    name: string
    quantity: number
  }
  type: string
  status: 'completed' | 'pending' | 'modifiable'
}

const AthleteDashboard = ({ athleteId }: { athleteId: string }) => {
  const [loading, setLoading] = useState(true)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (!athleteId) return
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch reports data
        try {
          const date = format(currentDate, 'yyyy-MM-dd')
          const assessmentResponse = await fetch(
            `/api/athlete-profiles/reports/latest?date=${date}&athleteId=${athleteId}`,
          )
          if (assessmentResponse.ok) {
            const assessmentResult = await assessmentResponse.json()
            if (assessmentResult.data) {
              setAssessmentData(assessmentResult.data)
            }
          } else {
            console.error('Failed to fetch assessment data:', await assessmentResponse.text())
          }
        } catch (error) {
          console.error('Error fetching assessment data:', error)
        }

        // Fetch activities data using the endpoint
        console.log('Fetching activities for date:', currentDate)
        const formattedDate = format(currentDate, 'yyyy-MM-dd')
        try {
          const activitiesResponse = await fetch(
            `/api/athlete-profiles/get-activities?date=${formattedDate}`,
          )

          if (activitiesResponse.ok) {
            const activitiesResult = await activitiesResponse.json()
            if (activitiesResult.data && activitiesResult.data.activities) {
              // Set schedule data with the activities from the API
              setScheduleData(activitiesResult.data.activities)
              console.log('Fetched activities:', activitiesResult.data)
            } else {
              // No activities found for this date
              setScheduleData([])
              console.log('No activities found for the selected date')
            }
          } else {
            console.error('Failed to fetch activities:', await activitiesResponse.text())
            setScheduleData([])
          }
        } catch (error) {
          console.error('Error fetching activities:', error)
          setScheduleData([])
        }
      } catch (err) {
        console.error('Error in dashboard component:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [athleteId, currentDate])

  // Calculate difference from last report
  const calculateDifference = (current: number, previous: number | undefined): string => {
    if (previous === undefined) return ''
    const diff = current - previous
    return diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando dados...</p>
      </div>
    )
  }

  // Handle date change
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate)
    // This will trigger the useEffect to fetch new data
  }

  // Handler for previous day
  const handlePreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 1)
    handleDateChange(newDate)
  }

  // Handler for next day
  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 1)
    handleDateChange(newDate)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Dia anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="relative">
            <input
              type="date"
              value={format(currentDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="absolute opacity-0 w-full h-full cursor-pointer z-10"
            />
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-md flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Próximo dia"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Assessment cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Weight card */}
        <Card className="bg-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentData ? (
              <>
                <div className="text-2xl font-bold">{assessmentData.weight} kg</div>
                {assessmentData.lastAssessment && (
                  <div className="text-xs text-gray-600">
                    {calculateDifference(
                      assessmentData.weight,
                      assessmentData.lastAssessment.weight,
                    )}{' '}
                    kg desde a última avaliação
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Sem dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Body fat card */}
        <Card className="bg-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Percentual de gordura</CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentData ? (
              <>
                <div className="text-2xl font-bold">{assessmentData.bodyFat}%</div>
                {assessmentData.lastAssessment && (
                  <div className="text-xs text-gray-600">
                    {calculateDifference(
                      assessmentData.bodyFat,
                      assessmentData.lastAssessment.bodyFat,
                    )}
                    % desde a última avaliação
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Sem dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abdominal fold card */}
        <Card className="bg-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dobra abdominal</CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentData ? (
              <>
                <div className="text-2xl font-bold">{assessmentData.abdominalFold}mm</div>
                {assessmentData.lastAssessment && (
                  <div className="text-xs text-gray-600">
                    {calculateDifference(
                      assessmentData.abdominalFold,
                      assessmentData.lastAssessment.abdominalFold,
                    )}
                    mm desde a última avaliação
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Sem dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arm measurement card */}
        <Card className="bg-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Braço</CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentData ? (
              <>
                <div className="text-2xl font-bold">{assessmentData.armMeasurement}cm</div>
                {assessmentData.lastAssessment && (
                  <div className="text-xs text-gray-600">
                    {calculateDifference(
                      assessmentData.armMeasurement,
                      assessmentData.lastAssessment.armMeasurement,
                    )}
                    cm desde a última avaliação
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Sem dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thigh fold card */}
        <Card className="bg-cyan-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dobra da coxa</CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentData ? (
              <>
                <div className="text-2xl font-bold">{assessmentData.thighFold}mm</div>
                {assessmentData.lastAssessment && (
                  <div className="text-xs text-gray-600">
                    {calculateDifference(
                      assessmentData.thighFold,
                      assessmentData.lastAssessment.thighFold,
                    )}
                    mm desde a última avaliação
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Sem dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily schedule using the existing component */}
      <DailySchedule scheduleData={scheduleData} currentDate={currentDate} />
    </div>
  )
}

export default AthleteDashboard
