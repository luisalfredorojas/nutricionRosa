import type {
  SexoType,
  ClasificacionIMC,
  ClasificacionGrasa,
  ClasificacionMusculo,
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
// Peso Ideal — Fórmula de Lorentz
// ─────────────────────────────────────────────

export function calcularPesoIdeal(
  tallaCm: number | null | undefined,
  sexo: SexoType | null | undefined
): number | null {
  if (!tallaCm || !sexo) return null
  if (sexo === 'Femenino') {
    return Math.round(((tallaCm - 100) - (tallaCm - 150) / 2.5) * 10) / 10
  }
  return Math.round(((tallaCm - 100) - (tallaCm - 150) / 4) * 10) / 10
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
    if (icc < 0.75) return 'Bajo'
    if (icc <= 0.82) return 'Moderado'
    return 'Alto'
  }

  // Masculino
  if (icc < 0.85) return 'Bajo'
  if (icc <= 0.95) return 'Moderado'
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
    if (porcentajeGrasa < 14) return 'Grasa esencial / Bajo'
    if (porcentajeGrasa <= 20) return 'Atletico'
    if (porcentajeGrasa <= 24) return 'Fitness'
    if (porcentajeGrasa <= 31) return 'Promedio'
    return 'Obesidad'
  }

  // Masculino
  if (porcentajeGrasa < 6) return 'Grasa esencial / Bajo'
  if (porcentajeGrasa <= 13) return 'Atletico'
  if (porcentajeGrasa <= 17) return 'Fitness'
  if (porcentajeGrasa <= 24) return 'Promedio'
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
    if (porcentajeMusculo < 24) return 'Bajo'
    if (porcentajeMusculo <= 30) return 'Normal'
    if (porcentajeMusculo <= 35) return 'Alto'
    return 'Muy alto'
  }

  // Masculino
  if (porcentajeMusculo < 33) return 'Bajo'
  if (porcentajeMusculo <= 39) return 'Normal'
  if (porcentajeMusculo <= 44) return 'Alto'
  return 'Muy alto'
}

// ─────────────────────────────────────────────
// Riesgo Metabólico
// Combina: grasa visceral + ICC + cintura
// ─────────────────────────────────────────────

export function calcularRiesgoMetabolico(params: {
  grasaVisceral: number | null | undefined
  icc: number | null | undefined
  cintura: number | null | undefined
  sexo: SexoType | null | undefined
}): ClasificacionRiesgoMetabolico | null {
  const { grasaVisceral, icc, cintura, sexo } = params

  if (!sexo) return null

  let indicadoresElevados = 0

  // Grasa visceral
  if (grasaVisceral !== null && grasaVisceral !== undefined) {
    if (grasaVisceral >= 15) indicadoresElevados += 1
    else if (grasaVisceral >= 10) indicadoresElevados += 0.5
  }

  // ICC
  if (icc !== null && icc !== undefined) {
    const clasificacion = clasificarICC(icc, sexo)
    if (clasificacion === 'Alto') indicadoresElevados += 1
    else if (clasificacion === 'Moderado') indicadoresElevados += 0.5
  }

  // Cintura
  if (cintura !== null && cintura !== undefined) {
    const umbral = sexo === 'Femenino' ? 88 : 102
    if (cintura > umbral) indicadoresElevados += 1
  }

  if (indicadoresElevados === 0) return 'Bajo'
  if (indicadoresElevados <= 0.5) return 'Bajo'
  if (indicadoresElevados <= 1) return 'Moderado'
  if (indicadoresElevados <= 2) return 'Alto'
  return 'Muy alto'
}

// ─────────────────────────────────────────────
// Calcular todos los indicadores de una vez
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

  const tallaCm = tallaM ? tallaM * 100 : null
  const imc = calcularIMC(pesoKg, tallaM)
  const icc = calcularICC(cintura, cadera)

  return {
    imc,
    clasificacionIMC: clasificarIMC(imc),
    pesoIdeal: calcularPesoIdeal(tallaCm, sexo),
    indiceCC: icc,
    clasificacionICC: clasificarICC(icc, sexo),
    dxGrasa: clasificarGrasa(porcentajeGrasa, sexo),
    dxMusculo: clasificarMusculo(porcentajeMusculo, sexo),
    riesgoMetabolico: calcularRiesgoMetabolico({ grasaVisceral, icc, cintura, sexo }),
  }
}
