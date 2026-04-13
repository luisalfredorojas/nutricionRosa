'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { GrasaDistribucion } from '@/types/kpi'

interface GrasaChartProps {
  data: GrasaDistribucion[]
}

const COLORS: Record<string, string> = {
  'Grasa esencial / Bajo': '#a78bfa',
  Atletico: '#34d399',
  Fitness: '#6ee7b7',
  Promedio: '#fbbf24',
  Obesidad: '#f87171',
}

const DEFAULT_COLORS = ['#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d']

export function GrasaChart({ data }: GrasaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-rosa-300">
        <p className="text-sm">Sin datos suficientes</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.clasificacion,
    value: d.cantidad,
    porcentaje: d.porcentaje,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} pacientes`, name]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #fbcfe8',
            fontSize: '12px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: '11px', color: '#9d174d' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
