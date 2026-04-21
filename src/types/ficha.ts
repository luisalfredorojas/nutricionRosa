import type { FichaNutricional, Paciente, Empresa } from './database'

export type FichaConPaciente = FichaNutricional & {
  pacientes: Paciente & {
    empresas: Empresa | null
  }
}

export type SexoType = 'Femenino' | 'Masculino'

export type ClasificacionIMC =
  | 'Bajo peso'
  | 'Normal'
  | 'Sobrepeso'
  | 'Obesidad grado I'
  | 'Obesidad grado II'
  | 'Obesidad grado III'

export type ClasificacionGrasa = 'Bajo' | 'Normal' | 'Elevado' | 'Obesidad'

export type ClasificacionMusculo = 'Muy bajo' | 'Bajo' | 'Normal' | 'Bueno' | 'Muy bueno'

export type ClasificacionGrasaVisceral = 'Normal' | 'Elevada' | 'Muy elevada'

export type ClasificacionRiesgoMetabolico = 'Bajo' | 'Aumentado' | 'Alto'

export type ClasificacionICC = 'Bajo' | 'Moderado' | 'Alto'

export interface IndicadoresCalculados {
  imc: number | null
  clasificacionIMC: ClasificacionIMC | null
  pesoIdeal: number | null
  indiceCC: number | null
  clasificacionICC: ClasificacionICC | null
  dxGrasa: ClasificacionGrasa | null
  dxMusculo: ClasificacionMusculo | null
  dxGrasaVisceral: ClasificacionGrasaVisceral | null
  riesgoMetabolico: ClasificacionRiesgoMetabolico | null
}
