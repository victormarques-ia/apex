'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ScheduleItem = {
  time: string
  activity: string
  details?: string
  type: string
  status: 'completed' | 'pending' | 'modifiable'
}

const DailySchedule = ({ scheduleData }: { scheduleData: ScheduleItem[] }) => {
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
        return 'Não concluído'
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
        {scheduleData.length > 0 ? (
          <div className="w-full overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 w-24">Horário</th>
                  <th className="text-left py-2 px-4">Atividade</th>
                  <th className="text-right py-2 px-4 w-40">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((item, index) => (
                  <React.Fragment key={index}>
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
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${getStatusStyles(
                            item.status,
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
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
