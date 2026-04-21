'use client'

import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import type { FichaCompletaInput } from '@/lib/validators/ficha'
import type { BalanzaConfig } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface DatosBalanzaFormProps {
  form: UseFormReturn<FichaCompletaInput>
}

export function DatosBalanzaForm({ form }: DatosBalanzaFormProps) {
  const { register, formState: { errors } } = form
  const [balanzas, setBalanzas] = useState<BalanzaConfig[]>([])

  useEffect(() => {
    fetch('/api/balanzas')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBalanzas(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="balanza_id">Tipo de medición (Balanza)</Label>
        <Select id="balanza_id" {...register('balanza_id')} placeholder="Seleccionar balanza...">
          {balanzas.map((b) => (
            <option key={b.id} value={b.id}>{b.nombre}</option>
          ))}
        </Select>
        <p className="text-sm text-rosa-400">
          Configura nuevas balanzas en <a href="/configuracion/balanzas" className="underline">Configuración → Balanzas</a>
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="porcentaje_masa_grasa">
          % Masa grasa
        </Label>
        <Input
          id="porcentaje_masa_grasa"
          type="number"
          step="0.1"
          min={0}
          max={100}
          {...register('porcentaje_masa_grasa')}
          placeholder="Ej: 28.5"
        />
        {errors.porcentaje_masa_grasa && (
          <p className="text-xs text-red-600">{errors.porcentaje_masa_grasa.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="porcentaje_masa_muscular">
          % Masa muscular
        </Label>
        <Input
          id="porcentaje_masa_muscular"
          type="number"
          step="0.1"
          min={0}
          max={100}
          {...register('porcentaje_masa_muscular')}
          placeholder="Ej: 32.0"
        />
        {errors.porcentaje_masa_muscular && (
          <p className="text-xs text-red-600">{errors.porcentaje_masa_muscular.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edad_metabolica">Edad metabólica</Label>
        <Input
          id="edad_metabolica"
          type="number"
          min={1}
          max={120}
          {...register('edad_metabolica')}
          placeholder="Ej: 35"
        />
        {errors.edad_metabolica && (
          <p className="text-xs text-red-600">{errors.edad_metabolica.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="grasa_visceral">Grasa visceral</Label>
        <Input
          id="grasa_visceral"
          type="number"
          step="0.1"
          min={0}
          max={50}
          {...register('grasa_visceral')}
          placeholder="Ej: 8"
        />
        {errors.grasa_visceral && (
          <p className="text-xs text-red-600">{errors.grasa_visceral.message}</p>
        )}
      </div>
    </div>
  )
}
