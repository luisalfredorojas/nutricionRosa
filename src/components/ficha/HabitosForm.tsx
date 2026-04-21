'use client'

import { UseFormReturn } from 'react-hook-form'
import type { FichaCompletaInput } from '@/lib/validators/ficha'
import {
  DIGESTION_OPTIONS,
  DESCANSO_OPTIONS,
  NIVEL_ESTRES_OPTIONS,
  CONSUMO_AGUA_OPTIONS,
  CONSUMO_FRUTAS_OPTIONS,
  CONSUMO_VEGETALES_OPTIONS,
  ACTIVIDAD_FISICA_OPTIONS,
  CONSUMO_CAFE_OPTIONS,
  CONSUMO_ALCOHOL_OPTIONS,
  CONSUMO_TABACO_OPTIONS,
} from '@/lib/constants'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface HabitosFormProps {
  form: UseFormReturn<FichaCompletaInput>
}

export function HabitosForm({ form }: HabitosFormProps) {
  const { register } = form

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="digestion">Digestión</Label>
        <Select id="digestion" {...register('digestion')} placeholder="Seleccionar...">
          {DIGESTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descanso">Descanso</Label>
        <Select id="descanso" {...register('descanso')} placeholder="Seleccionar...">
          {DESCANSO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nivel_estres">Nivel de estrés</Label>
        <Select id="nivel_estres" {...register('nivel_estres')} placeholder="Seleccionar...">
          {NIVEL_ESTRES_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consumo_agua">Consumo de agua</Label>
        <Select id="consumo_agua" {...register('consumo_agua')} placeholder="Seleccionar...">
          {CONSUMO_AGUA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consumo_frutas">Consumo de frutas</Label>
        <Select id="consumo_frutas" {...register('consumo_frutas')} placeholder="Seleccionar...">
          {CONSUMO_FRUTAS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consumo_vegetales">Consumo de vegetales</Label>
        <Select id="consumo_vegetales" {...register('consumo_vegetales')} placeholder="Seleccionar...">
          {CONSUMO_VEGETALES_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="actividad_fisica">Actividad física</Label>
        <Select id="actividad_fisica" {...register('actividad_fisica')} placeholder="Seleccionar...">
          {ACTIVIDAD_FISICA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consumo_cafe">Consumo de café</Label>
        <Select id="consumo_cafe" {...register('consumo_cafe')} placeholder="Seleccionar...">
          {CONSUMO_CAFE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consumo_alcohol">Consumo de alcohol</Label>
        <Select id="consumo_alcohol" {...register('consumo_alcohol')} placeholder="Seleccionar...">
          {CONSUMO_ALCOHOL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consumo_tabaco">Consumo de tabaco</Label>
        <Select id="consumo_tabaco" {...register('consumo_tabaco')} placeholder="Seleccionar...">
          {CONSUMO_TABACO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="le_gusta_comer">Si le gusta comer</Label>
        <Textarea
          id="le_gusta_comer"
          {...register('le_gusta_comer')}
          placeholder="Alimentos que el paciente consume y le gustan..."
          rows={2}
        />
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label htmlFor="no_le_gusta_comer">No le gusta comer</Label>
        <Textarea
          id="no_le_gusta_comer"
          {...register('no_le_gusta_comer')}
          placeholder="Alimentos que el paciente no consume o no le gustan..."
          rows={2}
        />
      </div>
    </div>
  )
}
