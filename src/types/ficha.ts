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

export type ClasificacionGrasa =
  | 'Grasa esencial / Bajo'
  | 'Atletico'
  | 'Fitness'
  | 'Promedio'
  | 'Obesidad'

export type ClasificacionMusculo = 'Bajo' | 'Normal' | 'Alto' | 'Muy alto'

export type ClasificacionRiesgoMetabolico = 'Bajo' | 'Moderado' | 'Alto' | 'Muy alto'

export type ClasificacionICC = 'Bajo' | 'Moderado' | 'Alto'

export interface IndicadoresCalculados {
  imc: number | null
  clasificacionIMC: ClasificacionIMC | null
  pesoIdeal: number | null
  indiceCC: number | null
  clasificacionICC: ClasificacionICC | null
  dxGrasa: ClasificacionGrasa | null
  dxMusculo: ClasificacionMusculo | null
  riesgoMetabolico: ClasificacionRiesgoMetabolico | null
}
