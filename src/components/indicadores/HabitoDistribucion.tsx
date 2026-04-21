'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HabitoDistribucionProps {
  titulo: string
  data: { valor: string; count: number }[]
}

const COLORS = ['#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d']

export function HabitoDistribucion({ titulo, data }: HabitoDistribucionProps) {
  const chartData = data.map((d) => ({ name: d.valor, value: d.count }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-44 text-rosa-300">
            <p className="text-xs">Sin datos</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #fbcfe8',
                  fontSize: '11px',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '10px' }}
                formatter={(value) => (
                  <span style={{ fontSize: '10px', color: '#9d174d' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
