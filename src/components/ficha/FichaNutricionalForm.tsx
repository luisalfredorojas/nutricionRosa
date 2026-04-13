'use client'

import { UseFormReturn } from 'react-hook-form'
import type { FichaCompletaInput } from '@/lib/validators/ficha'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FichaNutricionalFormProps {
  form: UseFormReturn<FichaCompletaInput>
}

export function FichaNutricionalForm({ form }: FichaNutricionalFormProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="fecha_consulta">Fecha de consulta *</Label>
        <Input
          id="fecha_consulta"
          type="date"
          {...register('fecha_consulta')}
        />
        {errors.fecha_consulta && (
          <p className="text-xs text-red-600">{errors.fecha_consulta.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="diagnostico_clinico">Diagnóstico clínico</Label>
        <Input
          id="diagnostico_clinico"
          {...register('diagnostico_clinico')}
          placeholder="Ej: Síndrome metabólico"
        />
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="motivo_consulta">Motivo de consulta</Label>
        <Textarea
          id="motivo_consulta"
          {...register('motivo_consulta')}
          placeholder="Describe el motivo de la consulta..."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="peso_kg">
          Peso <span className="text-rosa-400 font-normal">(kg)</span>
        </Label>
        <Input
          id="peso_kg"
          type="number"
          step="0.1"
          {...register('peso_kg')}
          placeholder="Ej: 65.5"
        />
        {errors.peso_kg && (
          <p className="text-xs text-red-600">{errors.peso_kg.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="talla_m">
          Talla <span className="text-rosa-400 font-normal">(m)</span>
        </Label>
        <Input
          id="talla_m"
          type="number"
          step="0.01"
          {...register('talla_m')}
          placeholder="Ej: 1.65"
        />
        {errors.talla_m && (
          <p className="text-xs text-red-600">{errors.talla_m.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="circunferencia_cintura">
          Circunferencia cintura <span className="text-rosa-400 font-normal">(cm)</span>
        </Label>
        <Input
          id="circunferencia_cintura"
          type="number"
          step="0.1"
          {...register('circunferencia_cintura')}
          placeholder="Ej: 80"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="circunferencia_cadera">
          Circunferencia cadera <span className="text-rosa-400 font-normal">(cm)</span>
        </Label>
        <Input
          id="circunferencia_cadera"
          type="number"
          step="0.1"
          {...register('circunferencia_cadera')}
          placeholder="Ej: 100"
        />
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="recordatorio_24h">Recordatorio 24 horas</Label>
        <Textarea
          id="recordatorio_24h"
          {...register('recordatorio_24h')}
          placeholder="Describe la alimentación del día anterior..."
          rows={3}
        />
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="comentarios">Comentarios</Label>
        <Textarea
          id="comentarios"
          {...register('comentarios')}
          placeholder="Observaciones adicionales..."
          rows={2}
        />
      </div>
    </div>
  )
}
