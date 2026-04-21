// Auto-generated types from Supabase schema
// Run: npx supabase gen types typescript --project-id <id> > src/types/database.ts
// These are placeholder types until connected to real Supabase project

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          created_at?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          id: string
          codigo: string | null
          nombre: string
          fecha_nacimiento: string
          edad: number | null
          sexo: string
          correo: string | null
          ciudad: string | null
          empresa_id: string | null
          tipo_paciente: 'privado' | 'empresa'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo?: string | null
          nombre: string
          fecha_nacimiento: string
          sexo: string
          correo?: string | null
          ciudad?: string | null
          empresa_id?: string | null
          tipo_paciente?: 'privado' | 'empresa'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string | null
          nombre?: string
          fecha_nacimiento?: string
          sexo?: string
          correo?: string | null
          ciudad?: string | null
          empresa_id?: string | null
          tipo_paciente?: 'privado' | 'empresa'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      fichas_nutricionales: {
        Row: {
          id: string
          numero_ficha: string | null
          tipo: 'inicial' | 'seguimiento' | null
          ficha_padre_id: string | null
          paciente_id: string
          fecha_consulta: string
          motivo_consulta: string | null
          diagnostico_clinico: string | null
          peso_kg: number | null
          talla_m: number | null
          imc: number | null
          circunferencia_cintura: number | null
          circunferencia_cadera: number | null
          circunferencia_brazo: number | null
          fecha_ultima_menstruacion: string | null
          indice_cc: number | null
          recordatorio_24h: string | null
          comentarios: string | null
          balanza_id: string | null
          porcentaje_masa_grasa: number | null
          porcentaje_masa_muscular: number | null
          edad_metabolica: number | null
          grasa_visceral: number | null
          digestion: string | null
          descanso: string | null
          nivel_estres: string | null
          consumo_agua: string | null
          consumo_frutas: string | null
          consumo_vegetales: string | null
          actividad_fisica: string | null
          consumo_cafe: string | null
          consumo_alcohol: string | null
          consumo_tabaco: string | null
          no_le_gusta_comer: string | null
          le_gusta_comer: string | null
          peso_ideal: number | null
          dx_grasa: string | null
          dx_musculo: string | null
          riesgo_metabolico: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_ficha?: string | null
          tipo?: 'inicial' | 'seguimiento' | null
          ficha_padre_id?: string | null
          paciente_id: string
          fecha_consulta?: string
          motivo_consulta?: string | null
          diagnostico_clinico?: string | null
          peso_kg?: number | null
          talla_m?: number | null
          circunferencia_cintura?: number | null
          circunferencia_cadera?: number | null
          circunferencia_brazo?: number | null
          fecha_ultima_menstruacion?: string | null
          recordatorio_24h?: string | null
          comentarios?: string | null
          balanza_id?: string | null
          porcentaje_masa_grasa?: number | null
          porcentaje_masa_muscular?: number | null
          edad_metabolica?: number | null
          grasa_visceral?: number | null
          digestion?: string | null
          descanso?: string | null
          nivel_estres?: string | null
          consumo_agua?: string | null
          consumo_frutas?: string | null
          consumo_vegetales?: string | null
          actividad_fisica?: string | null
          consumo_cafe?: string | null
          consumo_alcohol?: string | null
          consumo_tabaco?: string | null
          no_le_gusta_comer?: string | null
          le_gusta_comer?: string | null
          peso_ideal?: number | null
          dx_grasa?: string | null
          dx_musculo?: string | null
          riesgo_metabolico?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_ficha?: string | null
          tipo?: 'inicial' | 'seguimiento' | null
          ficha_padre_id?: string | null
          paciente_id?: string
          fecha_consulta?: string
          motivo_consulta?: string | null
          diagnostico_clinico?: string | null
          peso_kg?: number | null
          talla_m?: number | null
          circunferencia_cintura?: number | null
          circunferencia_cadera?: number | null
          circunferencia_brazo?: number | null
          fecha_ultima_menstruacion?: string | null
          recordatorio_24h?: string | null
          comentarios?: string | null
          balanza_id?: string | null
          porcentaje_masa_grasa?: number | null
          porcentaje_masa_muscular?: number | null
          edad_metabolica?: number | null
          grasa_visceral?: number | null
          digestion?: string | null
          descanso?: string | null
          nivel_estres?: string | null
          consumo_agua?: string | null
          consumo_frutas?: string | null
          consumo_vegetales?: string | null
          actividad_fisica?: string | null
          consumo_cafe?: string | null
          consumo_alcohol?: string | null
          consumo_tabaco?: string | null
          no_le_gusta_comer?: string | null
          le_gusta_comer?: string | null
          peso_ideal?: number | null
          dx_grasa?: string | null
          dx_musculo?: string | null
          riesgo_metabolico?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fichas_nutricionales_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          }
        ]
      }
      balanza_configs: {
        Row: {
          id: string
          nombre: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      balanza_campos: {
        Row: {
          id: string
          balanza_id: string
          nombre_campo: string
          unidad: '%' | 'kg' | 'lb'
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          balanza_id: string
          nombre_campo: string
          unidad: '%' | 'kg' | 'lb'
          orden?: number
          created_at?: string
        }
        Update: {
          id?: string
          balanza_id?: string
          nombre_campo?: string
          unidad?: '%' | 'kg' | 'lb'
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "balanza_campos_balanza_id_fkey"
            columns: ["balanza_id"]
            isOneToOne: false
            referencedRelation: "balanza_configs"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
  }
}

export type Empresa = Database['public']['Tables']['empresas']['Row']
export type Paciente = Database['public']['Tables']['pacientes']['Row']
export type FichaNutricional = Database['public']['Tables']['fichas_nutricionales']['Row']
export type BalanzaConfig = Database['public']['Tables']['balanza_configs']['Row']
export type BalanzaCampo = Database['public']['Tables']['balanza_campos']['Row']
