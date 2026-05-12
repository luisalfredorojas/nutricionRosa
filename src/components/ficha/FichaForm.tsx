'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm, FieldErrors } from 'react-hook-form'
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
import { AlertCircle, Check, RotateCcw } from 'lucide-react'

const DRAFT_KEY = 'ficha_draft_nueva'

const TABS = [
  { id: 'personales', label: 'Datos Personales' },
  { id: 'nutricional', label: 'Ficha Nutricional' },
  { id: 'balanza', label: 'Datos Balanza' },
  { id: 'habitos', label: 'Hábitos' },
] as const

type TabId = typeof TABS[number]['id']

const FIELD_LABELS: Record<string, string> = {
  nombre: 'Nombre completo',
  fecha_nacimiento: 'Fecha de nacimiento',
  sexo: 'Sexo',
  correo: 'Correo electrónico',
  ciudad: 'Ciudad',
  empresa_id: 'Empresa',
  fecha_consulta: 'Fecha de consulta',
  motivo_consulta: 'Motivo de consulta',
  diagnostico_clinico: 'Diagnóstico clínico',
  peso_kg: 'Peso',
  talla_m: 'Talla',
  circunferencia_cintura: 'Cintura',
  circunferencia_cadera: 'Cadera',
  circunferencia_brazo: 'Brazo',
  porcentaje_masa_grasa: '% Masa grasa',
  porcentaje_masa_muscular: '% Masa muscular',
  edad_metabolica: 'Edad metabólica',
  grasa_visceral: 'Grasa visceral',
  digestion: 'Digestión',
  descanso: 'Descanso',
  nivel_estres: 'Nivel de estrés',
  consumo_agua: 'Consumo de agua',
  consumo_frutas: 'Consumo de frutas',
  consumo_vegetales: 'Consumo de vegetales',
  actividad_fisica: 'Actividad física',
  consumo_cafe: 'Consumo de café',
  consumo_alcohol: 'Consumo de alcohol',
  consumo_tabaco: 'Consumo de tabaco',
}

const FIELD_TAB: Record<string, TabId> = {
  nombre: 'personales', fecha_nacimiento: 'personales', sexo: 'personales',
  correo: 'personales', ciudad: 'personales', empresa_id: 'personales', tipo_paciente: 'personales',
  fecha_consulta: 'nutricional', motivo_consulta: 'nutricional', diagnostico_clinico: 'nutricional',
  peso_kg: 'nutricional', talla_m: 'nutricional', circunferencia_cintura: 'nutricional',
  circunferencia_cadera: 'nutricional', circunferencia_brazo: 'nutricional',
  fecha_ultima_menstruacion: 'nutricional', recordatorio_24h: 'nutricional', comentarios: 'nutricional',
  balanza_id: 'balanza', porcentaje_masa_grasa: 'balanza', porcentaje_masa_muscular: 'balanza',
  edad_metabolica: 'balanza', grasa_visceral: 'balanza',
  digestion: 'habitos', descanso: 'habitos', nivel_estres: 'habitos', consumo_agua: 'habitos',
  consumo_frutas: 'habitos', consumo_vegetales: 'habitos', actividad_fisica: 'habitos',
  consumo_cafe: 'habitos', consumo_alcohol: 'habitos', consumo_tabaco: 'habitos',
  no_le_gusta_comer: 'habitos', le_gusta_comer: 'habitos',
}

interface FormError {
  message: string
  fields?: string[]
}

function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface FichaFormProps {
  defaultTipoPaciente?: 'privado' | 'empresa'
  redirectTo?: string
  fichaId?: string
  initialValues?: Partial<FichaCompletaInput>
}

export function FichaForm({ defaultTipoPaciente = 'empresa', redirectTo, fichaId, initialValues }: FichaFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('personales')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<FormError | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstRenderRef = useRef(true)

  const isEditMode = Boolean(fichaId)

  const form = useForm<FichaCompletaInput>({
    resolver: zodResolver(fichaCompletaSchema),
    defaultValues: {
      fecha_consulta: getTodayString(),
      tipo_paciente: defaultTipoPaciente,
      correo: '',
      ciudad: '',
      empresa_id: '',
      motivo_consulta: '',
      diagnostico_clinico: '',
      recordatorio_24h: '',
      comentarios: '',
      no_le_gusta_comer: '',
      le_gusta_comer: '',
      balanza_id: '',
      ...initialValues,
    },
  })

  const watchedValues = form.watch()

  // Detectar borrador al montar (solo en modo nueva ficha)
  useEffect(() => {
    if (isEditMode) return
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.nombre) setHasDraft(true)
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [isEditMode])

  // Auto-guardado con debounce de 2 segundos
  useEffect(() => {
    if (isEditMode) return
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues))
        setDraftSaved(true)
      } catch {
        // localStorage no disponible
      }
    }, 2000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [watchedValues, isEditMode])

  function restoreDraft() {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) return
      form.reset(JSON.parse(saved))
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
    setHasDraft(false)
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setDraftSaved(false)
  }

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

  // Navega a la primera tab que tenga errores y retorna los campos con problema
  function handleValidationErrors(errors: FieldErrors<FichaCompletaInput>): string[] {
    const errorFields = Object.keys(errors)
    const firstErrorField = errorFields[0]
    const targetTab = firstErrorField ? (FIELD_TAB[firstErrorField] ?? 'personales') : 'personales'
    setActiveTab(targetTab)
    return errorFields
      .map((f) => FIELD_LABELS[f] ?? f)
      .filter(Boolean)
  }

  const onInvalid = (errors: FieldErrors<FichaCompletaInput>) => {
    const fields = handleValidationErrors(errors)
    setFormError({
      message: 'Hay campos obligatorios incompletos o con errores:',
      fields,
    })
  }

  const onSubmit = async (data: FichaCompletaInput) => {
    setSaving(true)
    setFormError(null)

    try {
      const url = isEditMode ? `/api/fichas/${fichaId}` : '/api/fichas'
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()

        if (body.details?.fieldErrors) {
          const fields = Object.entries(body.details.fieldErrors as Record<string, string[]>)
            .map(([field, msgs]) => `${FIELD_LABELS[field] ?? field}: ${msgs[0]}`)
          setFormError({
            message: 'No se pudo guardar la ficha. Revisa los siguientes campos:',
            fields,
          })
        } else {
          setFormError({ message: body.error ?? 'Error al guardar la ficha' })
        }
        return
      }

      if (!isEditMode) localStorage.removeItem(DRAFT_KEY)
      const destination = redirectTo
        ?? (isEditMode ? `/fichas/${fichaId}` : (form.getValues('tipo_paciente') === 'privado' ? '/privados' : '/empresas'))
      router.push(destination)
      router.refresh()
    } catch {
      setFormError({ message: 'No se pudo conectar con el servidor. Intenta nuevamente.' })
    } finally {
      setSaving(false)
    }
  }

  // Indica si una tab tiene errores (para mostrar indicador visual)
  const tabsWithErrors = new Set(
    Object.keys(form.formState.errors).map((f) => FIELD_TAB[f]).filter(Boolean)
  )

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Banner de borrador detectado */}
          {hasDraft && !isEditMode && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Hay un borrador guardado de una ficha anterior. ¿Deseas restaurarlo?</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button type="button" size="sm" variant="outline" onClick={discardDraft}>
                  Descartar
                </Button>
                <Button type="button" size="sm" onClick={restoreDraft}>
                  Restaurar borrador
                </Button>
              </div>
            </div>
          )}

          {/* Indicador de borrador guardado */}
          {draftSaved && !isEditMode && (
            <div className="flex justify-end mb-2">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Check className="h-3 w-3" /> Borrador guardado
              </span>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'bg-white text-rosa-800 shadow-sm'
                    : 'text-rosa-600 hover:text-rosa-800'
                }`}
              >
                {tab.label}
                {tabsWithErrors.has(tab.id) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Card>
            <CardContent className="pt-6">
              {activeTab === 'personales' && <DatosPersonalesForm form={form} disabledTipo={isEditMode} />}
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
                onClick={() => form.handleSubmit(onSubmit, onInvalid)()}
              >
                {saving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Guardar Ficha'}
              </Button>
            )}
          </div>

          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{formError.message}</p>
                  {formError.fields && formError.fields.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 list-disc list-inside">
                      {formError.fields.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
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
