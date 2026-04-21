'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface DateRangeFilterProps {
  desde: string | null
  hasta: string | null
  onChange: (desde: string | null, hasta: string | null) => void
}

export function DateRangeFilter({ desde, hasta, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-xs font-medium text-rosa-600 mb-1">Desde</label>
        <Input
          type="date"
          value={desde ?? ''}
          onChange={(e) => onChange(e.target.value || null, hasta)}
          className="w-40"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-rosa-600 mb-1">Hasta</label>
        <Input
          type="date"
          value={hasta ?? ''}
          onChange={(e) => onChange(desde, e.target.value || null)}
          className="w-40"
        />
      </div>
      {(desde || hasta) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(null, null)}
          className="text-rosa-500"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
