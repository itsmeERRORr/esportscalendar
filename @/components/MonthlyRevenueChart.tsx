'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent } from "@/components/ui/card"
import { Event } from '../types/event'

interface MonthlyRevenueChartProps {
  events: Event[]
}

export function MonthlyRevenueChart({ events }: MonthlyRevenueChartProps) {
  const monthlyData = useMemo(() => {
    console.log('Processing events for MonthlyRevenueChart:', events);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    const data = months.map(month => ({ name: month, total: 0 }))

    if (Array.isArray(events)) {
      events.forEach(event => {
        if (event && event.startDate && event.totalp && event.status === 'Paid') {
          const date = new Date(event.startDate)
          const monthIndex = date.getMonth()
          if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
            data[monthIndex].total += Number(event.totalp) || 0
          }
        }
      })
    }

    console.log('Processed monthly data:', data);
    return data
  }, [events])

  const hasNonZeroValues = useMemo(() => {
    return monthlyData.some(item => item.total > 0);
  }, [monthlyData]);

  if (!Array.isArray(events) || events.length === 0) {
    console.log('No events data available for chart');
    return <div>No data available for chart</div>
  }

  return (
    <Card className="col-span-4">
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => hasNonZeroValues ? `€${value}` : ''}
            />
            <Tooltip
              formatter={(value: number) => hasNonZeroValues ? [`€${value.toFixed(2)}`, 'Earnings'] : ['No data', 'Earnings']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="total" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

