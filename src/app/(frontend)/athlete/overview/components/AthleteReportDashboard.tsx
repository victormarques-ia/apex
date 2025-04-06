'use client'

import React, { useEffect, useState } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { LineChart } from '@mui/x-charts/LineChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const metricOptions = [
  { key: 'weight', label: 'Peso (kg)', color: '#EF444470' },
  { key: 'bodyFat', label: 'Gordura (%)', color: '#10B98170' },
  { key: 'abdominalFold', label: 'Dobra abdominal (mm)', color: '#8B5CF670' },
  { key: 'armMeasurement', label: 'Braço (cm)', color: '#F59E0B70' },
  { key: 'thighFold', label: 'Dobra coxa (mm)', color: '#06B6D470' },
]

const AthleteReportDashboard = ({ athleteId }: { athleteId: string }) => {
  const [startDate, setStartDate] = useState<string>('2025-04-01')
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['weight'])

  const getDaysBetween = (start: string, end: string): string[] => {
    const dates: string[] = []
    let current = parseISO(start)
    const last = parseISO(end)
    while (current <= last) {
      dates.push(format(current, 'yyyy-MM-dd'))
      current = addDays(current, 1)
    }
    return dates
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!athleteId) return
      const days = getDaysBetween(startDate, endDate)
      const results: any[] = []
      for (const date of days) {
        try {
          const res = await fetch(`/api/athlete-profiles/reports/latest?date=${date}&athleteId=${athleteId}`)
          if (res.ok) {
            const json = await res.json()
            if (json?.data) {
              results.push({ ...json.data, date })
            }
          }
        } catch (err) {
          console.error('Erro buscando dados de', date, err)
        }
      }
      setAssessmentHistory(results)
    }
    fetchData()
  }, [athleteId, startDate, endDate])

  const toggleMetric = (key: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap items-center">
        <label className="text-sm">
          Início:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          />
        </label>
        <label className="text-sm">
          Fim:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {metricOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleMetric(key)}
            className={`px-3 py-1 rounded-md border text-sm ${selectedMetrics.includes(key) ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            series={metricOptions.filter(m => selectedMetrics.includes(m.key)).map(({ key, label, color }) => ({
              data: assessmentHistory.map((a) => a[key]),
              label,
              color,
            }))}
            height={300}
            xAxis={[{ data: assessmentHistory.map((a) => format(new Date(a.date), 'dd/MM')), scaleType: 'point' }]}
            yAxis={[{ label: 'Valores' }]}
            margin={{ top: 40, bottom: 20, left: 40, right: 10 }}
            slotProps={{ legend: { position: { vertical: 'top', horizontal: 'middle' } } }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default AthleteReportDashboard
