'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { fichaCompletaSchema, type FichaCompletaInput } from '@/lib/validators/ficha'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import type { SexoType } from '@/types/ficha'
import { DatosPersonalesForm } from './DatosPersonalesForm'
import { FichaNutricionalForm } from './FichaNutricionalForm'
import { DatosBalanzaForm } from './DatosBalanzaForm'
import { HabitosForm } from './HabitosForm'
import { IndicadoresCalculadosDisplay } from './IndicadoresCalculados'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TABS = [
  { id: 'personales', label: 'Datos Personales' },
  { id: 'nutricional', label: 'Ficha Nutricional' },
  { id: 'balanza', label: 'Datos Balanza' },
  { id: 'habitos', label: 'Hábitos' },
] as const

type TabId = typeof TABS[number]['id']

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function FichaForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('personales')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FichaCompletaInput>({
    resolver: zodResolver(fichaCompletaSchema),
    defaultValues: {
      fecha_consulta: getTodayString(),
      correo: '',
      ciudad: '',
      empresa_id: '',
      motivo_consulta: '',
      diagnostico_clinico: '',
      recordatorio_24h: '',
      comentarios: '',
      no_le_gusta_comer: '',
    },
  })

  const watchedValues = form.watch()

  const indicadores = calcularTodosLosIndicadores({
    pesoKg: watchedValues.peso_kg ?? null,
    tallaM: watchedValues.talla_m ?? null,
    cintura: watchedValues.circunferencia_cintura ?? null,
    cadera: watchedValues.circunferencia_cadera ?? null,
    porcentajeGrasa: watchedValues.porcentaje_masa_grasa ?? null,
    porcentajeMusculo: watchedValues.porcentaje_masa_muscular ?? null,
    grasaVisceral: watchedValues.grasa_visceral ?? null,
    sexo: (watchedValues.sexo as SexoType) ?? null,
  })

  const onSubmit = async (data: FichaCompletaInput) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/fichas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al guardar la ficha')
      }

      router.push('/fichas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main form area */}
        <div className="flex-1 min-w-0">
          {/* Tab navigation */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-rosa-800 shadow-sm'
                    : 'text-rosa-600 hover:text-rosa-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Card>
            <CardContent className="pt-6">
              {activeTab === 'personales' && <DatosPersonalesForm form={form} />}
              {activeTab === 'nutricional' && <FichaNutricionalForm form={form} />}
              {activeTab === 'balanza' && <DatosBalanzaForm form={form} />}
              {activeTab === 'habitos' && <HabitosForm form={form} />}
            </CardContent>
          </Card>

          {/* Tab navigation buttons */}
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab)
                if (idx > 0) setActiveTab(TABS[idx - 1].id)
              }}
              disabled={activeTab === 'personales'}
            >
              ← Anterior
            </Button>
            {activeTab !== 'habitos' ? (
              <Button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab)
                  setActiveTab(TABS[idx + 1].id)
                }}
              >
                Siguiente →
              </Button>
            ) : (
              <Button
                type="button"
                disabled={saving}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {saving ? 'Guardando...' : 'Guardar Ficha'}
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Indicators sidebar */}
        <div className="xl:w-72 shrink-0">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Indicadores Calculados</CardTitle>
            </CardHeader>
            <CardContent>
              <IndicadoresCalculadosDisplay indicadores={indicadores} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
