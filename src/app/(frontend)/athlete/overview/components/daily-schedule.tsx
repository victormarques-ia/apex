'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

type ScheduleItem = {
  time?: string
  activity: string
  details?: string
  type: string
  status: 'completed' | 'pending' | 'modifiable'
  date?: string // Add a date field
  id?: string // Optional unique identifier
}

const DailySchedule = ({
  scheduleData,
  currentDate = new Date(), // Default to current date if not provided
}: {
  scheduleData: ScheduleItem[]
  currentDate?: Date
}) => {
  // Create a state to manage the activities and their statuses
  const [activities, setActivities] = useState<ScheduleItem[]>([])

  // Helper function to format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Initialize activities state when scheduleData changes
  useEffect(() => {
    // Filter activities for the current date
    const todayString = formatDate(currentDate)
    const todayActivities = scheduleData.filter(
      (item) =>
        // Either no date specified (assume today), or explicitly set to today's date
        !item.date || formatDate(new Date(item.date)) === todayString,
    )

    // Add a temporary ID to each activity for tracking if not present
    const activitiesWithIds = todayActivities.map((item, index) => ({
      ...item,
      id: item.id || `activity-${index}`,
      date: todayString, // Ensure date is set
    }))

    setActivities(activitiesWithIds)
  }, [scheduleData, currentDate])

  // Separate timed activities (meals) from untimed activities (workouts)
  const timedActivities = activities.filter((item) => item.time)
  const untimedActivities = activities.filter((item) => !item.time)

  // Function to toggle status between completed and pending
  const toggleStatus = (id: string) => {
    setActivities((currentActivities) =>
      currentActivities.map((activity) => {
        if (activity.id === id) {
          // Toggle between completed and pending
          const newStatus = activity.status === 'completed' ? 'pending' : 'completed'
          return { ...activity, status: newStatus }
        }
        return activity
      }),
    )
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white'
      case 'modifiable':
        return 'bg-yellow-500 text-white'
      case 'pending':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-500 opacity-60 text-white'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'modifiable':
        return 'Modificar'
      case 'pending':
        return 'Pendente'
      default:
        return 'Indeterminado'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-6">
            {/* Timed activities (meals) */}
            {timedActivities.length > 0 && (
              <div className="w-full overflow-auto">
                <h3 className="text-lg font-medium mb-2">Refeições</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 w-24">Horário</th>
                      <th className="text-left py-2 px-4">Atividade</th>
                      <th className="text-right py-2 px-4 w-40">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timedActivities.map((item, index) => (
                      <React.Fragment key={`timed-${index}`}>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 text-sm">{item.time}</td>
                          <td className="py-2 px-4">
                            <div className="text-sm">{item.activity}</div>
                            {item.details && (
                              <div className="text-xs text-gray-500 whitespace-pre-line mt-1">
                                {item.details}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStatus(item.id || '')}
                                className="p-1 h-8 w-8"
                              >
                                {item.status === 'completed' ? (
                                  <X className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500" />
                                )}
                              </Button>
                              <span
                                className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${getStatusStyles(
                                  item.status,
                                )}`}
                              >
                                {getStatusLabel(item.status)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Untimed activities (workouts) */}
            {untimedActivities.length > 0 && (
              <div className="w-full">
                <h3 className="text-lg font-medium mb-2">Treinos</h3>
                <div className="grid gap-3">
                  {untimedActivities.map((item, index) => (
                    <div key={`untimed-${index}`} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{item.activity}</div>
                          {item.details && (
                            <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                              {item.details}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(item.id || '')}
                            className="p-1 h-8 w-8"
                          >
                            {item.status === 'completed' ? (
                              <X className="h-5 w-5 text-red-500" />
                            ) : (
                              <Check className="h-5 w-5 text-green-500" />
                            )}
                          </Button>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${getStatusStyles(
                              item.status,
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma atividade agendada para hoje.</p>
            <p className="text-sm text-gray-400 mt-2">
              Entre em contato com seu treinador para mais informações.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailySchedule
