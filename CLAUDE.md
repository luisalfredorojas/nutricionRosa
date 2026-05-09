# CLAUDE.md — NutricionRosa

## Descripción del Proyecto

NutricionRosa es una plataforma web para una nutricionista que atiende pacientes corporativos (empresas) y privados. Permite crear fichas médicas nutricionales completas, generar seguimientos, calcular indicadores clínicos automáticamente, visualizar métricas consolidadas por empresa, exportar a PDF/Excel y gestionar usuarios con roles.

La marca usa una paleta de colores en tonos **pastel rosado** — profesional, limpia y femenina.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js App Router | 14.2.0 |
| Lenguaje | TypeScript (strict) | 5.4.0 |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) | — |
| SDK cliente | @supabase/supabase-js | 2.43.4 (PINNED) |
| SSR auth | @supabase/ssr | 0.3.0 (PINNED) |
| UI | Tailwind CSS + shadcn/ui + Radix UI | 3.4.0 |
| Tabla | TanStack React Table | 8.17.0 |
| Formularios | React Hook Form + Zod | 7.51.0 / 3.23.0 |
| Gráficos | Recharts | 2.12.0 |
| PDF | jsPDF + jspdf-autotable + html2canvas | 2.5.1 / 5.0.7 / 1.4.1 |
| Excel | xlsx | 0.18.5 |
| Íconos | lucide-react | 0.376.0 |
| Deploy | Vercel | — |
| Package manager | **pnpm** (npm tiene problemas de caché en este equipo) | — |

> **IMPORTANTE**: Las versiones de `@supabase/supabase-js` y `@supabase/ssr` están **pinned** a 2.43.4 y 0.3.0 respectivamente. No actualizar — la API de cookies en versiones más nuevas rompe la autenticación SSR.

---

## Entorno Local

```
Supabase URL:      http://127.0.0.1:54321
Anon key:          <ver .env.local o ejecutar: supabase status>
Secret key:        <ver .env.local o ejecutar: supabase status>
PostgreSQL:        postgresql://postgres:postgres@127.0.0.1:54322/postgres
Supabase Studio:   http://127.0.0.1:54323

Usuario de prueba: nutricionista@demo.com / demo1234

Comandos:
  supabase start   # Arranca Docker con Supabase local
  supabase stop    # Detiene los contenedores
  pnpm dev         # Servidor Next.js en localhost:3000
  pnpm build       # Build de producción
  pnpm lint        # Linting
```

Variables de entorno (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Modelo de Datos (PostgreSQL / Supabase)

### Tabla: `empresas`
```sql
id          UUID PK
nombre      TEXT UNIQUE NOT NULL
created_at  TIMESTAMPTZ
```

### Tabla: `pacientes`
```sql
id              UUID PK
codigo          TEXT UNIQUE          -- Auto-generado: PAC-0001, PAC-0002...
nombre          TEXT NOT NULL
fecha_nacimiento DATE NOT NULL
sexo            TEXT CHECK ('Femenino' | 'Masculino')
correo          TEXT
ciudad          TEXT
empresa_id      UUID FK → empresas (ON DELETE SET NULL)
tipo_paciente   TEXT DEFAULT 'empresa' CHECK ('privado' | 'empresa')
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Tabla: `fichas_nutricionales`
```sql
id                    UUID PK
numero_ficha          TEXT UNIQUE       -- Auto-generado: F-0001, F-0002...
tipo                  TEXT DEFAULT 'inicial' CHECK ('inicial' | 'seguimiento')
ficha_padre_id        UUID FK → fichas_nutricionales   -- Para seguimientos
paciente_id           UUID FK → pacientes (ON DELETE CASCADE)
fecha_consulta        DATE

-- Clínico
motivo_consulta       TEXT
diagnostico_clinico   TEXT
recordatorio_24h      TEXT
comentarios           TEXT

-- Mediciones
peso_kg               DECIMAL(5,2)
talla_m               DECIMAL(3,2)
imc                   DECIMAL(5,2) GENERATED ALWAYS   -- peso / talla²
circunferencia_cintura DECIMAL(5,2)
circunferencia_cadera  DECIMAL(5,2)
circunferencia_brazo   DECIMAL(5,2)
indice_cc             DECIMAL(4,2) GENERATED ALWAYS   -- cintura / cadera
fecha_ultima_menstruacion DATE                        -- Solo mujeres

-- Datos Balanza
porcentaje_masa_grasa    DECIMAL(5,2)
porcentaje_masa_muscular DECIMAL(5,2)
edad_metabolica          INTEGER
grasa_visceral           DECIMAL(5,2)
balanza_id               UUID FK → balanza_configs

-- Hábitos (todos TEXT con CHECK constraints)
digestion         CHECK ('Irregular' | 'Normal' | 'Estrenimiento' | 'Diarrea')
descanso          CHECK ('4-5 horas' | '5-7 horas' | '> 7 horas')
nivel_estres      CHECK ('Bajo' | 'Medio' | 'Alto' | 'Ocasional')
consumo_agua      CHECK ('Menos de 1 lt' | 'Entre 1 - 1,5 lts' | 'Entre 2 - 2,5 lts' | '> 3 lts')
consumo_frutas    CHECK ('Ocasional' | '> 4 veces por semana' | '< 2 veces por semana')
consumo_vegetales CHECK ('Ocasional' | '> 3 veces por semana' | '< 2 veces por semana')
actividad_fisica  CHECK ('No realiza' | 'Bajo (1 o 2 veces por semana)' | 'Moderado (3 a 4 veces por semana)' | 'Intenso (Hasta 6 veces por semana)')
consumo_cafe      CHECK ('Todos los dias' | '> 3 veces por semana' | 'Irregular')
consumo_alcohol   CHECK ('No consume' | 'Semanal' | 'Mensual')
consumo_tabaco    CHECK ('No consume' | 'Semanal' | 'Mensual')
no_le_gusta_comer TEXT
le_gusta_comer    TEXT

-- Indicadores calculados (calculados en frontend, guardados en DB)
peso_ideal         DECIMAL(5,2)
dx_grasa           TEXT    -- 'Bajo' | 'Normal' | 'Elevado' | 'Obesidad'
dx_musculo         TEXT    -- 'Muy bajo' | 'Bajo' | 'Normal' | 'Bueno' | 'Muy bueno'
riesgo_metabolico  TEXT    -- 'Bajo' | 'Aumentado' | 'Alto'

created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

### Tabla: `balanza_configs`
```sql
id          UUID PK
nombre      TEXT UNIQUE    -- Ej: "Omron HBF-701", "Tanita BC-601"
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

### Tabla: `balanza_campos`
```sql
id            UUID PK
balanza_id    UUID FK → balanza_configs (ON DELETE CASCADE)
nombre_campo  TEXT            -- Ej: "Peso", "Masa grasa"
unidad        TEXT CHECK ('%' | 'kg' | 'lb')
orden         INTEGER
created_at    TIMESTAMPTZ
```

### Tabla: `user_profiles`
```sql
id          UUID PK FK → auth.users (ON DELETE CASCADE)
email       TEXT
nombre      TEXT
role        user_role ENUM DEFAULT 'asistente' CHECK ('admin' | 'asistente')
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

### Migraciones (orden de aplicación)
| Archivo | Contenido |
|---------|-----------|
| `001_initial_schema.sql` | Tablas base, RLS policies |
| `002_fix_rls_policies.sql` | Fix: usar `auth.uid() IS NOT NULL` en lugar de `auth.role()` |
| `003_patient_continuity.sql` | Secuencias para `codigo`/`numero_ficha`, columnas `tipo` y `ficha_padre_id` |
| `004_tipo_paciente.sql` | Columna `tipo_paciente` en pacientes ('privado' / 'empresa') |
| `005_balanza_habits_fum_brazo.sql` | Tablas balanza, `le_gusta_comer`, `fecha_ultima_menstruacion`, `circunferencia_brazo` |
| `006_user_roles.sql` | `user_profiles`, enum `user_role`, trigger auto-create en signup |

### Row Level Security (RLS)
Todas las tablas usan `auth.uid() IS NOT NULL` — cualquier usuario autenticado tiene acceso completo. Los admin pueden gestionar `user_profiles`; los usuarios solo pueden editar su propio perfil.

---

## API Routes

Todas las rutas están en `src/app/api/`. Usan el cliente Supabase del servidor.

### `GET /api/fichas`
Devuelve fichas con paciente + empresa anidados.
Query params: `empresa_id?`, `paciente_id?`
Orden: `fecha_consulta DESC`. Límite desde cliente: 200 registros.

### `POST /api/fichas`
Crea ficha nueva. Si el paciente no existe, lo crea también.
Body: `FichaCompletaInput` (validado con Zod).
Calcula indicadores antes de guardar.
Retorna: `{ id, paciente_id }`.

### `GET /api/fichas/[id]`
Ficha individual con paciente + empresa anidados.

### `PUT /api/fichas/[id]`
Actualización parcial. Recalcula indicadores si cambian campos relevantes.
También actualiza campos del paciente si se incluyen.
Retorna: `{ id }`.

### `DELETE /api/fichas/[id]`
Elimina ficha. Retorna: `{ success: true }`.

### `POST /api/fichas/[id]/seguimiento`
Crea ficha de seguimiento vinculada a la ficha padre.
Establece `ficha_padre_id` = id padre y `tipo: 'seguimiento'`.
Retorna: `{ id, paciente_id }`.

### `GET /api/indicadores`
Métricas agregadas. Motor principal del dashboard de indicadores.
Query params: `scope` ('empresa' | 'privado'), `empresa_id?`, `paciente_id?`, `fecha_desde?`, `fecha_hasta?`
Retorna `IndicadoresData`:
```typescript
{
  peso:             { promedio?, actual?, delta? }
  grasa:            { deltaPromedio?, actual?, delta? }
  musculo:          { deltaPromedio?, actual?, delta? }
  mejoresCambios:   Array<{ nombre, empresa, deltaGrasa, deltaMusculo }> // top 3, solo scope empresa
  distribucionIMC:  { [clasificacion]: number }
  totalPacientes:   number
  atendidosPorMes:  Array<{ mes: string; count: number }>
  citasControl:     number                   // fichas de seguimiento
  habitos:          { [campo]: { [valor]: number } }
}
```
Scope `privado`: historial de todas las fichas de un paciente.
Scope `empresa`: última ficha por paciente (para deltas, compara con primera ficha).

### `GET /api/dashboard`
Estadísticas globales de inicio.
Query params: `desde?`, `hasta?`
Retorna: conteos de pacientes, distribución por sexo, métricas de peso/IMC/grasa, últimas 5 fichas, total de empresas.

### `GET /api/empresas`
Lista todas las empresas ordenadas por nombre.

### `POST /api/empresas`
Crea empresa. Body: `{ nombre: string }`. 409 si ya existe.

### `PUT /api/empresas/[id]`
Actualiza nombre de empresa.

### `DELETE /api/empresas/[id]`
Elimina empresa. 409 si tiene pacientes vinculados.

### `POST /api/empresas/[id]/bulk-upload`
Importación masiva de pacientes desde Excel/CSV.
Retorna resultados con conteos de éxito/error.

### `GET /api/balanzas`
Lista configuraciones de balanza con sus campos anidados.

### `POST /api/balanzas`
Crea config de balanza con campos.
Body: `{ nombre: string, campos: { nombre_campo, unidad, orden? }[] }`.
Rollback si falla la inserción de campos.

### `PUT /api/balanzas/[id]` / `DELETE /api/balanzas/[id]`
Gestión de configuraciones de balanza.

---

## Rutas y Páginas

| URL | Archivo | Descripción |
|-----|---------|-------------|
| `/` | `app/page.tsx` | Redirect a `/inicio` |
| `/login` | `app/(auth)/login/page.tsx` | Login con Supabase Auth |
| `/inicio` | `app/(dashboard)/inicio/page.tsx` | Dashboard principal |
| `/fichas` | `app/(dashboard)/fichas/page.tsx` | Lista de todas las fichas (SSR, límite 200) |
| `/fichas/nueva` | `app/(dashboard)/fichas/nueva/page.tsx` | Crear ficha nueva |
| `/fichas/[id]` | `app/(dashboard)/fichas/[id]/page.tsx` | Detalle de ficha + historial del paciente |
| `/fichas/[id]/editar` | `app/(dashboard)/fichas/[id]/editar/page.tsx` | Editar ficha existente |
| `/fichas/[id]/seguimiento` | `app/(dashboard)/fichas/[id]/seguimiento/page.tsx` | Crear ficha de seguimiento |
| `/privados` | `app/(dashboard)/privados/page.tsx` | Lista de pacientes privados (agrupado por paciente) |
| `/privados/[id]/indicadores` | `app/(dashboard)/privados/[id]/indicadores/page.tsx` | Indicadores de un paciente privado |
| `/empresas` | `app/(dashboard)/empresas/page.tsx` | Lista de empresas |
| `/empresas/[id]/fichas` | `app/(dashboard)/empresas/[id]/fichas/page.tsx` | Fichas de una empresa |
| `/empresas/[id]/indicadores` | `app/(dashboard)/empresas/[id]/indicadores/page.tsx` | Indicadores de una empresa |
| `/empresas/fichas` | `app/(dashboard)/empresas/fichas/page.tsx` | Todas las fichas de empresas |
| `/empresas/indicadores` | `app/(dashboard)/empresas/indicadores/page.tsx` | Indicadores consolidados de todas las empresas |
| `/tabla` | `app/(dashboard)/tabla/page.tsx` | Matriz de pacientes (TanStack Table, columnas sticky) |
| `/configuracion` | `app/(dashboard)/configuracion/page.tsx` | Configuración general |
| `/configuracion/balanzas` | `app/(dashboard)/configuracion/balanzas/page.tsx` | Gestión de balanzas |
| `/usuarios` | `app/(dashboard)/usuarios/page.tsx` | Gestión de usuarios (solo admin) |

Todas las páginas del dashboard usan el layout en `app/(dashboard)/layout.tsx`.

---

## Estructura de Componentes

### Layout
- `components/layout/DashboardShell.tsx` — Wrapper con sidebar + header
- `components/layout/Sidebar.tsx` — Navegación: Inicio, Fichas, Privados, Empresas, Tabla, Configuración, Usuarios
- `components/layout/Header.tsx` — Barra superior: email del usuario, badge de rol (Admin/Asistente), logout
- `components/layout/BackButton.tsx` — Botón de navegación hacia atrás

### Ficha (formulario multi-sección)
- `components/ficha/FichaForm.tsx` — Formulario principal con 4 tabs. Props:
  - `defaultTipoPaciente?: 'privado' | 'empresa'`
  - `redirectTo?: string`
  - `fichaId?: string` (modo edición)
  - `initialValues?: Partial<FichaCompletaInput>`
- `components/ficha/DatosPersonalesForm.tsx` — Nombre, fecha de nacimiento, sexo, email, ciudad, tipo de paciente, empresa
- `components/ficha/FichaNutricionalForm.tsx` — Peso, talla, circunferencias, diagnóstico, recordatorio 24h
- `components/ficha/DatosBalanzaForm.tsx` — % grasa, % músculo, grasa visceral, edad metabólica, selección de balanza
- `components/ficha/HabitosForm.tsx` — Todos los hábitos + preferencias alimentarias
- `components/ficha/IndicadoresCalculadosDisplay.tsx` — Badges con los indicadores calculados en tiempo real
- `components/ficha/DeleteFichaButton.tsx` — Eliminar con confirmación (Dialog)
- `components/ficha/SeguimientoForm.tsx` — Formulario simplificado para seguimiento (reutiliza secciones)
- `components/ficha/TablaComparativa.tsx` — Tabla comparando todas las fichas del paciente en el tiempo
- `components/ficha/ExportFichaPDF.tsx` — Exportar una ficha a PDF (jsPDF)

### Lista / Tabla
- `components/fichas/FichasListClient.tsx` — Lista de fichas con filtro y ordenamiento
- `components/privados/PrivadosListClient.tsx` — Lista de pacientes privados agrupados
- `components/tabla/TablaClientWrapper.tsx` — Wrapper de TanStack Table
- `components/tabla/ColumnDefs.tsx` — Definición de columnas para la matriz
- `components/tabla/ExportPDFButton.tsx` — Export PDF de la tabla
- `components/tabla/ExportExcelButton.tsx` — Export Excel (xlsx)
- `components/tabla/MatrizPacientes.tsx` — Vista grilla de pacientes

### Indicadores / Dashboard
- `components/indicadores/IndicadoresDashboard.tsx` — Tarjetas de métricas + gráficos (Recharts)
- `components/indicadores/DateRangeFilter.tsx` — Selector de rango de fechas
- `components/indicadores/MejoresCambios.tsx` — Widget top 3 mejoras
- `components/indicadores/HabitoDistribucion.tsx` — Gráficos de distribución de hábitos
- `components/indicadores/ExportIndicadoresPDF.tsx` — Export PDF de indicadores
- `components/dashboard/DashboardClient.tsx` — Dashboard principal con estadísticas globales

### Configuración
- `components/configuracion/BalanzasManager.tsx` — CRUD de configuraciones de balanza
- `components/empresas/EmpresasManager.tsx` — CRUD de empresas
- `components/usuarios/UsuariosManager.tsx` — Asignación de roles (solo admin)
- `components/empresas/BulkUpload.tsx` — Importación masiva de pacientes

---

## Hooks

### `useFichas({ empresaId?, pacienteId? })`
Archivo: `src/hooks/useFichas.ts`
Consulta `GET /api/fichas` y retorna `{ fichas, loading, error, refetch }`.

### `useEmpresaFilter()`
Archivo: `src/hooks/useEmpresaFilter.ts`
Consulta la tabla `empresas` directamente por el cliente de Supabase.
Retorna `{ empresas, selectedEmpresaId, setSelectedEmpresaId, loading }`.

### `useIndicadores({ scope, empresaId?, pacienteId?, fechaDesde?, fechaHasta? })`
Archivo: `src/hooks/useIndicadores.ts`
Consulta `GET /api/indicadores` con los parámetros dados.
Retorna `{ data: IndicadoresData | null, loading, error, refetch }`.

---

## Lib: Fórmulas Nutricionales (`src/lib/formulas/indicadores.ts`)

Todas las funciones son puras y sin efectos secundarios. Los indicadores se calculan en el frontend al editar el formulario y se persisten en la base de datos.

| Función | Entrada | Salida |
|---------|---------|--------|
| `calcularIMC(pesoKg, tallaM)` | números | número o null |
| `clasificarIMC(imc)` | número | 'Bajo peso' / 'Normal' / 'Sobrepeso' / 'Obesidad grado I/II/III' |
| `calcularPesoIdeal(tallaM)` | metros | 22 × talla² |
| `calcularICC(cintura, cadera)` | cm | ratio |
| `clasificarICC(icc, sexo)` | ratio, sexo | 'Bajo' / 'Moderado' / 'Alto' |
| `clasificarGrasa(porcentaje, sexo)` | %, sexo | 'Bajo' / 'Normal' / 'Elevado' / 'Obesidad' |
| `clasificarMusculo(porcentaje, sexo)` | %, sexo | 'Muy bajo' / 'Bajo' / 'Normal' / 'Bueno' / 'Muy bueno' |
| `clasificarGrasaVisceral(nivel)` | número | 'Normal' / 'Elevada' / 'Muy elevada' |
| `calcularRiesgoMetabolico({ cintura, sexo })` | cm, sexo | 'Bajo' / 'Aumentado' / 'Alto' |
| `calcularTodosLosIndicadores(params)` | objeto con todos los campos | `IndicadoresCalculados` |

### Rangos por sexo

**ICC (Índice Cintura-Cadera)**
| Clasificación | Mujeres | Hombres |
|--------------|---------|---------|
| Bajo | < 0.80 | < 0.95 |
| Moderado | 0.80–0.85 | 0.95–1.00 |
| Alto | > 0.85 | > 1.00 |

**% Masa Grasa**
| Clasificación | Mujeres | Hombres |
|--------------|---------|---------|
| Bajo | < 14% | < 6% |
| Normal | 14–24% | 6–17% |
| Elevado | 25–31% | 18–24% |
| Obesidad | > 31% | > 24% |

**% Masa Muscular**
| Clasificación | Mujeres | Hombres |
|--------------|---------|---------|
| Muy bajo | < 24% | < 33% |
| Bajo | 24–30% | 33–39% |
| Normal | 31–35% | 40–44% |
| Bueno | > 35% | > 44% |

**Grasa Visceral**: < 9 Normal, 10–14 Elevada, >= 15 Muy elevada (sin diferencia por sexo).

**Riesgo Metabólico (cintura)**
| Clasificación | Mujeres | Hombres |
|--------------|---------|---------|
| Bajo | < 80 cm | < 94 cm |
| Aumentado | 80–87 cm | 94–101 cm |
| Alto | >= 88 cm | >= 102 cm |

---

## Lib: Validación Zod (`src/lib/validators/ficha.ts`)

Schemas exportados:
- `datosPersonalesSchema` — nombre, fecha_nacimiento, sexo, correo, ciudad, tipo_paciente, empresa_id
- `fichaNutricionalSchema` — peso_kg, talla_m, circunferencias, diagnóstico, recordatorio
- `datosBalanzaSchema` — % grasa, % músculo, edad_metabolica, grasa_visceral
- `habitosSchema` — todos los hábitos + preferencias alimentarias
- `fichaCompletaSchema` — merge de los 4 schemas anteriores

Helper: `optionalNumber()` — preprocessor que convierte string vacío → null antes de validar como número opcional.

---

## Lib: Constantes (`src/lib/constants.ts`)

Arrays `const` para los dropdowns del formulario:
`DIGESTION_OPTIONS`, `DESCANSO_OPTIONS`, `NIVEL_ESTRES_OPTIONS`, `CONSUMO_AGUA_OPTIONS`, `CONSUMO_FRUTAS_OPTIONS`, `CONSUMO_VEGETALES_OPTIONS`, `ACTIVIDAD_FISICA_OPTIONS`, `CONSUMO_CAFE_OPTIONS`, `CONSUMO_ALCOHOL_OPTIONS`, `CONSUMO_TABACO_OPTIONS`, `SEXO_OPTIONS`

---

## Lib: Supabase (`src/lib/supabase/`)

- `client.ts` — Instancia browser con `createBrowserClient()`. Sin genérico `<Database>` (tipos placeholder hasta conectar Supabase real).
- `server.ts` — Instancia servidor con `createServerClient()`, usa `await cookies()` de Next.js.
- `middleware.ts` — Refresca sesión con `updateSession()`. Usa API `get/set/remove` de cookies (NO `getAll/setAll` — esa es la API de versiones más nuevas).
- `get-user-profile.ts` — Obtiene la fila `user_profiles` del usuario actual.

---

## Tipos TypeScript (`src/types/`)

### `database.ts`
Tipos generados de Supabase (placeholder hasta conectar a proyecto real):
`Empresa`, `Paciente`, `FichaNutricional`, `BalanzaConfig`, `BalanzaCampo` — con variantes `Row`, `Insert`, `Update`.

### `ficha.ts`
- `FichaConPaciente` — FichaNutricional con paciente + empresa anidados
- `SexoType` — `'Femenino' | 'Masculino'`
- Tipos de clasificación: `ClasificacionIMC`, `ClasificacionGrasa`, `ClasificacionMusculo`, `ClasificacionGrasaVisceral`, `ClasificacionRiesgoMetabolico`, `ClasificacionICC`
- `IndicadoresCalculados` — objeto con todos los resultados de clasificación

### `user.ts`
- `UserRole` — `'admin' | 'asistente'`
- `UserProfile` — fila completa de `user_profiles`

---

## Diseño y Paleta de Colores

**Marca**: NutricionRosa — tonos pastel rosado, profesional, limpio.

### Colores personalizados (tailwind.config.ts)
```
rosa-50:  #fdf2f8   Background muy claro (páginas, fondos)
rosa-100: #fce7f3   Background de cards
rosa-200: #fbcfe8   Bordes suaves
rosa-300: #f9a8d4   Hover states
rosa-400: #f472b6   Botones secundarios, badges
rosa-500: #ec4899   Botones primarios, acentos
rosa-600: #db2777   Hover de botones primarios
rosa-700: #be185d   Texto de acento
rosa-800: #9d174d   Headers, texto fuerte
rosa-900: #831843   Texto de mayor énfasis
```

Variables CSS definidas en `globals.css` para compatibilidad con shadcn/ui (formato HSL):
`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--card`, `--popover`, `--radius`.

### Reglas de diseño
- Mobile-first, responsive en todos los breakpoints
- Sidebar colapsable en móvil
- Cards con fondo `rosa-100`, borde `rosa-200`
- Botones primarios: `bg-rosa-500 hover:bg-rosa-600 text-white`
- Badges de clasificación:
  - Verde: resultados saludables (Normal, Bajo riesgo)
  - Amarillo: moderado (Sobrepeso, Riesgo aumentado)
  - Rojo: alto riesgo (Obesidad, Alto)
- Loading skeletons en todas las páginas con datos asíncronos

---

## Sistema de Roles

Enum: `'admin' | 'asistente'`

| Capacidad | Admin | Asistente |
|-----------|-------|-----------|
| Ver fichas | ✓ | ✓ |
| Crear/editar fichas | ✓ | ✓ |
| Eliminar fichas | ✓ | ✓ |
| Gestionar empresas | ✓ | ✓ |
| Gestionar balanzas | ✓ | ✓ |
| Gestionar usuarios | ✓ | ✗ |
| Ver `/usuarios` | ✓ | ✗ |

El perfil se crea automáticamente al registrarse (trigger en Supabase). El rol por defecto es `asistente`. Solo un admin puede promover a otro usuario a admin.

---

## Flujo Principal de la Aplicación

```
Login (Supabase Auth)
  └─ /inicio (Dashboard global)
       ├─ Estadísticas: total pacientes, fichas recientes, promedios globales
       └─ Navegación principal:

  /fichas
    ├─ Lista todas las fichas (empresa + privado)
    ├─ /fichas/nueva → FichaForm (4 tabs) → guarda + redirect a detalle
    ├─ /fichas/[id] → Detalle: indicadores, historial, botones editar/seguimiento/eliminar
    ├─ /fichas/[id]/editar → FichaForm pre-cargado con datos existentes
    └─ /fichas/[id]/seguimiento → SeguimientoForm vinculado a la ficha padre

  /privados
    ├─ Lista pacientes privados (agrupado, una fila por paciente)
    └─ /privados/[id]/indicadores → Gráficos de evolución del paciente

  /empresas
    ├─ Lista de empresas con contador de pacientes
    ├─ /empresas/[id]/fichas → Fichas de esa empresa
    ├─ /empresas/[id]/indicadores → KPIs de esa empresa
    ├─ /empresas/fichas → Todas las fichas de todas las empresas
    └─ /empresas/indicadores → KPIs consolidados de todas las empresas

  /tabla
    └─ Matriz de todos los pacientes (TanStack Table, 3 columnas sticky, export PDF/Excel)

  /configuracion
    └─ /configuracion/balanzas → CRUD de modelos de balanza y sus campos

  /usuarios (solo admin)
    └─ Listar usuarios + cambiar roles
```

---

## Flujo de una Ficha Nueva

1. Usuario navega a `/fichas/nueva`
2. `FichaForm` renderiza con 4 tabs: Datos Personales → Ficha Nutricional → Datos Balanza → Hábitos
3. React Hook Form gestiona el estado. Zod valida en tiempo real.
4. `IndicadoresCalculadosDisplay` recalcula y muestra badges al cambiar peso/talla/circunferencias/% grasa/% músculo.
5. Al enviar, `POST /api/fichas`:
   - Si el paciente no existe → crea paciente con código auto-generado (PAC-XXXX)
   - Calcula todos los indicadores en el servidor
   - Guarda ficha con número auto-generado (F-XXXX)
6. Redirect a `/fichas/[id]`

## Flujo de Seguimiento

1. Desde `/fichas/[id]`, botón "Crear seguimiento"
2. Navega a `/fichas/[id]/seguimiento` (SeguimientoForm)
3. Datos del paciente pre-cargados (solo lectura); se completan nuevas medidas
4. `POST /api/fichas/[id]/seguimiento` → nueva ficha con `tipo: 'seguimiento'` y `ficha_padre_id`
5. En el detalle de cualquier ficha del paciente, `TablaComparativa` muestra la evolución completa

---

## Tabla/Matriz de Pacientes (`/tabla`)

Columnas fijas (sticky left):
1. Nombre del paciente
2. Empresa
3. Fecha de consulta

Columnas desplazables:
- Datos personales: edad, ciudad, sexo
- Medidas: peso, talla, IMC, cintura, cadera, ICC
- Balanza: % grasa, % músculo, edad metabólica, grasa visceral
- Indicadores: dx grasa, dx músculo, riesgo metabólico
- Hábitos: todos los campos

Funcionalidades:
- Scroll horizontal con sticky columns (TanStack Table)
- Sorting por cualquier columna
- Filtro global por empresa y búsqueda por nombre
- Export PDF (jsPDF + autotable)
- Export Excel (xlsx)

---

## KPIs e Indicadores

Calculados por `/api/indicadores`. Los gráficos usan Recharts.

### Scope empresa (todas las empresas o una específica)
- **Delta promedio de grasa**: diferencia primera ficha → última ficha por paciente
- **Delta promedio de músculo**: ídem
- **Distribución de IMC**: pie chart de categorías en la última ficha de cada paciente
- **Total pacientes atendidos**
- **Atendidos por mes**: bar chart (últimos 12 meses)
- **Citas de control**: conteo de fichas de seguimiento
- **Top 3 mejoras**: pacientes con mayor reducción de grasa corporal
- **Distribución de hábitos**: por campo (agua, ejercicio, sueño, etc.)

### Scope privado (un paciente específico)
- **Evolución de peso**: línea temporal de todas las fichas
- **Evolución de grasa y músculo**: línea temporal
- **Historial de hábitos**: cambios a lo largo del tiempo

---

## Exportaciones

| Componente | Librería | Formato | Contenido |
|-----------|---------|---------|-----------|
| `ExportFichaPDF` | jsPDF + autotable | PDF | Ficha individual: paciente, medidas, indicadores, hábitos |
| `ExportPDFButton` | jsPDF + autotable | PDF landscape | Tabla/matriz con filtros activos |
| `ExportExcelButton` | xlsx | .xlsx | Todas las columnas visibles de la tabla |
| `ExportIndicadoresPDF` | html2canvas + jsPDF | PDF | Captura de gráficos de indicadores |

---

## Gotchas y Decisiones Técnicas

### Supabase sin genérico `<Database>`
Los clientes en `client.ts` y `server.ts` **no usan** el genérico `<Database>`. Los tipos placeholder en `database.ts` causan errores TypeScript `never` con los internos de Supabase. Cuando se conecte el proyecto real de Supabase, regenerar tipos con:
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```
Y luego agregar `<Database>` a los clientes.

### Joins sin tipado
Los resultados de joins de Supabase son `unknown[]` cuando no hay tipado de DB. Usar `as unknown as TuTipo[]` (doble cast) — **no** `as TuTipo[]` directo.

### `tsconfig.json` target ES2017
Necesario para iterar `Map.values()` en los hooks. No bajar a ES5/ES2015.

### Cookies SSR — API v0.3.0
`@supabase/ssr@0.3.0` usa `get(name)`, `set(name, value, options)`, `remove(name, options)`. Las versiones nuevas usan `getAll()` / `setAll()`. No mezclar.

### `pnpm` como package manager
`npm install` falla con errores de permisos de caché en este equipo. Siempre usar `pnpm`.

### Números de ficha y paciente auto-generados
- Pacientes: `PAC-XXXX` (secuencia SQL en DB)
- Fichas: `F-XXXX` (secuencia SQL en DB)
Generados por funciones SQL en la migración `003_patient_continuity.sql`.

---

## Convenciones de Código

- **Idioma del código**: inglés (variables, funciones, componentes)
- **Idioma del contenido**: español (labels, mensajes de UI, textos)
- **Componentes**: functional components con TypeScript
- **Estado del servidor**: Server Components por defecto; `'use client'` solo cuando sea necesario (interactividad, hooks de estado)
- **Imports**: path alias `@/` para `src/`
- **Archivos**: `kebab-case.tsx` para archivos, `PascalCase` para componentes
- **Validación**: Zod en todos los endpoints de API y formularios
- **Indicadores**: calcular en frontend (preview) **y** persistir en DB

---

## Estado de Fases

- [x] Fase 1: Fundación — Next.js + Tailwind + shadcn/ui + Supabase (build OK)
- [x] Fase 2: Modelo de datos — Migraciones SQL, tipos, schemas Zod, API routes, hooks
- [x] Fase 3: Formularios médicos — FichaForm + 4 secciones + indicadores + lista + detalle
- [x] Fase 4: Tabla/Matriz — TanStack Table v8, 3 cols sticky, sort, export PDF/Excel
- [x] Fase 5: KPIs — 6+ cards, PieChart grasa, BarChart riesgo/meses, filtro empresa
- [x] Fase 6: Polish — sidebar mobile, dashboard real, búsqueda fichas, loading skeletons, seed data
- [x] Fase 7: Roles — admin/asistente con gestión de usuarios, RLS policies actualizadas
- [x] Fase 8: Balanza flexible — configs de balanza, campos configurables, FUM, brazo
- [x] Fase 9: Continuidad — fichas de seguimiento vinculadas, tabla comparativa, pacientes privados
