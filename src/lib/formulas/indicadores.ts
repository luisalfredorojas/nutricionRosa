import type {
  SexoType,
  ClasificacionIMC,
  ClasificacionGrasa,
  ClasificacionMusculo,
  ClasificacionGrasaVisceral,
  ClasificacionRiesgoMetabolico,
  ClasificacionICC,
  IndicadoresCalculados,
} from '@/types/ficha'

// ─────────────────────────────────────────────
// IMC — Índice de Masa Corporal
// ─────────────────────────────────────────────

export function calcularIMC(
  pesoKg: number | null | undefined,
  tallaM: number | null | undefined
): number | null {
  if (!pesoKg || !tallaM || tallaM <= 0) return null
  return Math.round((pesoKg / (tallaM * tallaM)) * 100) / 100
}

export function clasificarIMC(imc: number | null | undefined): ClasificacionIMC | null {
  if (imc === null || imc === undefined) return null
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25.0) return 'Normal'
  if (imc < 30.0) return 'Sobrepeso'
  if (imc < 35.0) return 'Obesidad grado I'
  if (imc < 40.0) return 'Obesidad grado II'
  return 'Obesidad grado III'
}

// ─────────────────────────────────────────────
// Peso Ideal — 22 × talla²(m)
// ─────────────────────────────────────────────

export function calcularPesoIdeal(
  tallaM: number | null | undefined
): number | null {
  if (!tallaM || tallaM <= 0) return null
  return Math.round(22 * tallaM * tallaM * 10) / 10
}

// ─────────────────────────────────────────────
// ICC — Índice Cintura-Cadera
// ─────────────────────────────────────────────

export function calcularICC(
  cintura: number | null | undefined,
  cadera: number | null | undefined
): number | null {
  if (!cintura || !cadera || cadera <= 0) return null
  return Math.round((cintura / cadera) * 100) / 100
}

export function clasificarICC(
  icc: number | null | undefined,
  sexo: SexoType | null | undefined
): ClasificacionICC | null {
  if (icc === null || icc === undefined || !sexo) return null

  if (sexo === 'Femenino') {
    if (icc < 0.80) return 'Bajo'
    if (icc <= 0.85) return 'Moderado'
    return 'Alto'
  }

  // Masculino
  if (icc < 0.95) return 'Bajo'
  if (icc <= 1.0) return 'Moderado'
  return 'Alto'
}

// ─────────────────────────────────────────────
// Diagnóstico de Masa Grasa
// ─────────────────────────────────────────────

export function clasificarGrasa(
  porcentajeGrasa: number | null | undefined,
  sexo: SexoType | null | undefined
): ClasificacionGrasa | null {
  if (porcentajeGrasa === null || porcentajeGrasa === undefined || !sexo) return null

  if (sexo === 'Femenino') {
    if (porcentajeGrasa < 18) return 'Bajo'
    if (porcentajeGrasa <= 28) return 'Normal'
    if (porcentajeGrasa <= 34) return 'Elevado'
    return 'Obesidad'
  }

  // Masculino
  if (porcentajeGrasa < 8) return 'Bajo'
  if (porcentajeGrasa <= 19) return 'Normal'
  if (porcentajeGrasa <= 24) return 'Elevado'
  return 'Obesidad'
}

// ─────────────────────────────────────────────
// Diagnóstico de Masa Muscular
// ─────────────────────────────────────────────

export function clasificarMusculo(
  porcentajeMusculo: number | null | undefined,
  sexo: SexoType | null | undefined
): ClasificacionMusculo | null {
  if (porcentajeMusculo === null || porcentajeMusculo === undefined || !sexo) return null

  if (sexo === 'Femenino') {
    if (porcentajeMusculo < 24) return 'Muy bajo'
    if (porcentajeMusculo <= 30) return 'Bajo'
    if (porcentajeMusculo <= 35) return 'Normal'
    if (porcentajeMusculo <= 40) return 'Bueno'
    return 'Muy bueno'
  }

  // Masculino
  if (porcentajeMusculo < 33) return 'Muy bajo'
  if (porcentajeMusculo <= 39) return 'Bajo'
  if (porcentajeMusculo <= 44) return 'Normal'
  if (porcentajeMusculo <= 49) return 'Bueno'
  return 'Muy bueno'
}

// ─────────────────────────────────────────────
// Grasa Visceral
// ─────────────────────────────────────────────

export function clasificarGrasaVisceral(
  nivel: number | null | undefined
): ClasificacionGrasaVisceral | null {
  if (nivel === null || nivel === undefined) return null
  if (nivel <= 9) return 'Normal'
  if (nivel <= 14) return 'Elevada'
  return 'Muy elevada'
}

// ─────────────────────────────────────────────
// Riesgo Metabólico — basado en cintura
// ─────────────────────────────────────────────

export function calcularRiesgoMetabolico(params: {
  cintura: number | null | undefined
  sexo: SexoType | null | undefined
}): ClasificacionRiesgoMetabolico | null {
  const { cintura, sexo } = params
  if (cintura === null || cintura === undefined || !sexo) return null

  if (sexo === 'Femenino') {
    if (cintura < 80) return 'Bajo'
    if (cintura < 88) return 'Aumentado'
    return 'Alto'
  }

  // Masculino
  if (cintura < 94) return 'Bajo'
  if (cintura < 102) return 'Aumentado'
  return 'Alto'
}

// ─────────────────────────────────────────────
// Calcular todos los indicadores
// ─────────────────────────────────────────────

export function calcularTodosLosIndicadores(params: {
  pesoKg: number | null | undefined
  tallaM: number | null | undefined
  cintura: number | null | undefined
  cadera: number | null | undefined
  porcentajeGrasa: number | null | undefined
  porcentajeMusculo: number | null | undefined
  grasaVisceral: number | null | undefined
  sexo: SexoType | null | undefined
}): IndicadoresCalculados {
  const { pesoKg, tallaM, cintura, cadera, porcentajeGrasa, porcentajeMusculo, grasaVisceral, sexo } = params

  const imc = calcularIMC(pesoKg, tallaM)
  const icc = calcularICC(cintura, cadera)

  return {
    imc,
    clasificacionIMC: clasificarIMC(imc),
    pesoIdeal: calcularPesoIdeal(tallaM),
    indiceCC: icc,
    clasificacionICC: clasificarICC(icc, sexo),
    dxGrasa: clasificarGrasa(porcentajeGrasa, sexo),
    dxMusculo: clasificarMusculo(porcentajeMusculo, sexo),
    dxGrasaVisceral: clasificarGrasaVisceral(grasaVisceral),
    riesgoMetabolico: calcularRiesgoMetabolico({ cintura, sexo }),
  }
}
