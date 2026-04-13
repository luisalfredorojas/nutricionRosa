export interface KPISummary {
  totalPacientes: number
  totalFichas: number
  promedioIMC: number | null
  promedioGrasaBajada: number | null
  promedioMusculoCambiado: number | null
  promedioPesoPerdido: number | null
  pacientesRiesgoAlto: number
  distribucionGrasa: GrasaDistribucion[]
  distribucionRiesgo: RiesgoDistribucion[]
}

export interface RiesgoDistribucion {
  nivel: string
  cantidad: number
}

export interface GrasaDistribucion {
  clasificacion: string
  cantidad: number
  porcentaje: number
}

export interface KPIFilter {
  empresaId: string | null
}
