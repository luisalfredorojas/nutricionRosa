'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface RiesgoData {
  nivel: string
  cantidad: number
}

interface RiesgoChartProps {
  data: RiesgoData[]
}

const RIESGO_COLORS: Record<string, string> = {
  Bajo: '#34d399',
  Moderado: '#fbbf24',
  Alto: '#f87171',
  'Muy alto': '#ef4444',
}

export function RiesgoChart({ data }: RiesgoChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-rosa-300">
        <p className="text-sm">Sin datos suficientes</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
        <XAxis
          dataKey="nivel"
          tick={{ fontSize: 11, fill: '#9d174d' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#be185d' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value} pacientes`, 'Cantidad']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #fbcfe8',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.nivel}
              fill={RIESGO_COLORS[entry.nivel] ?? '#f472b6'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
