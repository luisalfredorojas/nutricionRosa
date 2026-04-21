'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { formatDecimal } from '@/lib/utils'

interface MejoresCambiosProps {
  data: { paciente_nombre: string; metric: string; delta: number }[]
}

export function MejoresCambios({ data }: MejoresCambiosProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-rosa-600" />
          Mejores Cambios
        </CardTitle>
        <p className="text-xs text-rosa-400">Top 3 pacientes con mayor progreso</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-rosa-300">
            <p className="text-sm">Sin datos suficientes</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {data.map((item, i) => (
              <li
                key={`${item.paciente_nombre}-${i}`}
                className="flex items-center justify-between p-3 rounded-lg bg-rosa-50 border border-rosa-100"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rosa-200 text-rosa-800 font-bold text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-rosa-800">
                      {item.paciente_nombre}
                    </p>
                    <p className="text-xs text-rosa-500">{item.metric}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    item.delta < 0 ? 'text-green-600' : 'text-rosa-700'
                  }`}
                >
                  {item.delta > 0 ? '+' : ''}
                  {formatDecimal(item.delta, 1)}%
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
