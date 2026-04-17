'use client'

import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import type { FichaCompletaInput } from '@/lib/validators/ficha'
import { SEXO_OPTIONS } from '@/lib/constants'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Building2, User } from 'lucide-react'

interface Empresa {
  id: string
  nombre: string
}

interface DatosPersonalesFormProps {
  form: UseFormReturn<FichaCompletaInput>
}

export function DatosPersonalesForm({ form }: DatosPersonalesFormProps) {
  const { register, formState: { errors }, watch, setValue } = form
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  const tipoPaciente = watch('tipo_paciente') ?? 'empresa'

  useEffect(() => {
    fetch('/api/empresas')
      .then((r) => r.json())
      .then(({ data }) => setEmpresas(data ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Tipo de paciente toggle */}
      <div className="md:col-span-2 space-y-1.5">
        <Label>Tipo de paciente *</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setValue('tipo_paciente', 'privado', { shouldValidate: true })
              setValue('empresa_id', '')
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              tipoPaciente === 'privado'
                ? 'bg-rosa-50 border-rosa-400 text-rosa-800'
                : 'bg-white border-gray-200 text-gray-500 hover:border-rosa-200 hover:text-rosa-700'
            }`}
          >
            <User className="h-4 w-4" />
            Privado
          </button>
          <button
            type="button"
            onClick={() => setValue('tipo_paciente', 'empresa', { shouldValidate: true })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              tipoPaciente === 'empresa'
                ? 'bg-rosa-50 border-rosa-400 text-rosa-800'
                : 'bg-white border-gray-200 text-gray-500 hover:border-rosa-200 hover:text-rosa-700'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Empresa
          </button>
        </div>
        <input type="hidden" {...register('tipo_paciente')} />
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="nombre">Nombre completo *</Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Ej: María González"
        />
        {errors.nombre && (
          <p className="text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fecha_nacimiento">Fecha de nacimiento *</Label>
        <Input
          id="fecha_nacimiento"
          type="date"
          {...register('fecha_nacimiento')}
        />
        {errors.fecha_nacimiento && (
          <p className="text-xs text-red-600">{errors.fecha_nacimiento.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sexo">Sexo *</Label>
        <Select id="sexo" {...register('sexo')} placeholder="Seleccionar...">
          {SEXO_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        {errors.sexo && (
          <p className="text-xs text-red-600">{errors.sexo.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="correo">Correo electrónico</Label>
        <Input
          id="correo"
          type="email"
          {...register('correo')}
          placeholder="correo@ejemplo.com"
        />
        {errors.correo && (
          <p className="text-xs text-red-600">{errors.correo.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ciudad">Ciudad</Label>
        <Input
          id="ciudad"
          {...register('ciudad')}
          placeholder="Ej: Santiago"
        />
      </div>

      {tipoPaciente === 'empresa' && (
        <div className="space-y-1.5">
          <Label htmlFor="empresa_id">Empresa</Label>
          <Select id="empresa_id" {...register('empresa_id')} placeholder="Seleccionar empresa...">
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </Select>
        </div>
      )}
    </div>
  )
}
