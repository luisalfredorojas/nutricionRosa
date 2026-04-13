# CLAUDE.md — NutricionRosa

## Descripcion del Proyecto

NutricionRosa es una plataforma web para una nutricionista que atiende pacientes de grandes empresas. Permite crear fichas medicas nutricionales, visualizar datos en una tabla interactiva con columnas fijas, exportar a PDF y generar KPIs nutricionales filtrados por empresa.

La marca usa una paleta de colores en tonos **pastel rosado**.

---

## Stack Tecnologico

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Framework | **Next.js 14+ (App Router)** | SSR/SSG, API routes integradas, despliegue nativo en Vercel |
| Lenguaje | **TypeScript** | Tipado estricto para datos medicos, menos errores en runtime |
| Base de datos | **Supabase (PostgreSQL + Auth)** | Auth integrado, RLS, realtime, el usuario ya lo usa |
| ORM | **Supabase JS Client** | SDK nativo, tipos generados automaticamente |
| UI Framework | **Tailwind CSS + shadcn/ui** | Componentes accesibles, facil tematizacion en rosado pastel |
| Tabla | **TanStack Table v8** | Columnas fijas (sticky), virtualizacion, sorting, filtros |
| Formularios | **React Hook Form + Zod** | Validacion robusta de datos medicos |
| PDF Export | **@react-pdf/renderer** o **jsPDF + html2canvas** | Exportacion client-side de tablas |
| Charts/KPIs | **Recharts** | Graficos ligeros y compatibles con React |
| Deploy | **Vercel** | CI/CD automatico, preview deploys, edge functions |

---

## Estructura del Proyecto

```
nutricion-rosa/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── fichas/
│   │   │   │   ├── page.tsx              # Lista de fichas
│   │   │   │   ├── nueva/page.tsx        # Crear ficha nueva
│   │   │   │   └── [id]/page.tsx         # Ver/editar ficha
│   │   │   ├── tabla/page.tsx            # Tabla matriz con columnas fijas
│   │   │   ├── kpis/page.tsx             # Dashboard de KPIs
│   │   │   └── page.tsx                  # Dashboard principal
│   │   ├── api/
│   │   │   ├── fichas/route.ts
│   │   │   └── export-pdf/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                      # Redirect a login o dashboard
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── ficha/
│   │   │   ├── DatosPersonalesForm.tsx
│   │   │   ├── FichaNutricionalForm.tsx
│   │   │   ├── DatosBalanzaForm.tsx
│   │   │   ├── HabitosForm.tsx
│   │   │   └── IndicadoresCalculados.tsx
│   │   ├── tabla/
│   │   │   ├── MatrizPacientes.tsx       # Tabla principal con columnas fijas
│   │   │   ├── ColumnDefs.tsx
│   │   │   └── ExportPDFButton.tsx
│   │   ├── kpis/
│   │   │   ├── KPICard.tsx
│   │   │   ├── GrasaChart.tsx
│   │   │   ├── MusculoChart.tsx
│   │   │   └── FiltroEmpresa.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Logo.tsx
│   │   └── auth/
│   │       └── LoginForm.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser client
│   │   │   ├── server.ts                 # Server client
│   │   │   └── middleware.ts             # Auth middleware
│   │   ├── formulas/
│   │   │   └── indicadores.ts            # TODAS las formulas nutricionales
│   │   ├── validators/
│   │   │   └── ficha.ts                  # Schemas Zod
│   │   ├── utils.ts
│   │   └── constants.ts                  # Opciones de dropdowns, colores
│   ├── types/
│   │   ├── ficha.ts                      # Tipos de ficha medica
│   │   ├── database.ts                   # Tipos generados de Supabase
│   │   └── kpi.ts
│   └── hooks/
│       ├── useFichas.ts
│       ├── useKPIs.ts
│       └── useEmpresaFilter.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Schema de base de datos
├── public/
│   └── logo.svg
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## Modelo de Datos (Supabase/PostgreSQL)

### Tabla: `empresas`
```sql
CREATE TABLE empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla: `pacientes`
```sql
CREATE TABLE pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  edad INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM age(fecha_nacimiento))::INTEGER
  ) STORED,
  correo TEXT,
  ciudad TEXT,
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla: `fichas_nutricionales`
```sql
CREATE TABLE fichas_nutricionales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_consulta DATE DEFAULT CURRENT_DATE,
  
  -- Motivo
  motivo_consulta TEXT,
  
  -- Ficha Nutricional
  diagnostico_clinico TEXT,
  peso_kg DECIMAL(5,2),
  talla_m DECIMAL(3,2),
  imc DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN talla_m > 0 THEN ROUND(peso_kg / (talla_m * talla_m), 2) ELSE NULL END
  ) STORED,
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_cadera DECIMAL(5,2),
  indice_cc DECIMAL(4,2) GENERATED ALWAYS AS (
    CASE WHEN circunferencia_cadera > 0 THEN ROUND(circunferencia_cintura / circunferencia_cadera, 2) ELSE NULL END
  ) STORED,
  recordatorio_24h TEXT,
  comentarios TEXT,
  
  -- Datos Balanza
  porcentaje_masa_grasa DECIMAL(5,2),
  porcentaje_masa_muscular DECIMAL(5,2),
  edad_metabolica INTEGER,
  grasa_visceral DECIMAL(5,2),
  
  -- Habitos
  digestion TEXT CHECK (digestion IN ('Irregular', 'Normal', 'Estrenimiento', 'Diarrea')),
  descanso TEXT CHECK (descanso IN ('4-5 horas', '5-7 horas', '> 7 horas')),
  nivel_estres TEXT CHECK (nivel_estres IN ('Bajo', 'Medio', 'Alto', 'Ocasional')),
  consumo_agua TEXT CHECK (consumo_agua IN ('Menos de 1 lt', 'Entre 1 - 1,5 lts', 'Entre 2 - 2,5 lts', '> 3 lts')),
  consumo_frutas TEXT CHECK (consumo_frutas IN ('Ocasional', '> 4 veces por semana', '< 2 veces por semana')),
  consumo_vegetales TEXT CHECK (consumo_vegetales IN ('Ocasional', '> 3 veces por semana', '< 2 veces por semana')),
  actividad_fisica TEXT CHECK (actividad_fisica IN ('No realiza', 'Bajo (1 o 2 veces por semana)', 'Moderado (3 a 4 veces por semana)', 'Intenso (Hasta 6 veces por semana)')),
  consumo_cafe TEXT CHECK (consumo_cafe IN ('Todos los dias', '> 3 veces por semana', 'Irregular')),
  consumo_alcohol TEXT CHECK (consumo_alcohol IN ('No consume', 'Semanal', 'Mensual')),
  consumo_tabaco TEXT CHECK (consumo_tabaco IN ('No consume', 'Semanal', 'Mensual')),
  no_le_gusta_comer TEXT,
  
  -- Indicadores Calculados (se calculan en el frontend y se guardan)
  peso_ideal DECIMAL(5,2),
  dx_grasa TEXT,           -- Diagnostico de grasa corporal
  dx_musculo TEXT,         -- Diagnostico de masa muscular
  riesgo_metabolico TEXT,  -- Clasificacion de riesgo
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)
```sql
-- Solo la nutricionista autenticada puede ver/editar datos
ALTER TABLE fichas_nutricionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Politica: usuario autenticado tiene acceso completo
CREATE POLICY "Authenticated users full access" ON fichas_nutricionales
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON pacientes
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON empresas
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## Formulas e Indicadores Nutricionales

Archivo: `src/lib/formulas/indicadores.ts`

### 1. IMC (Indice de Masa Corporal)
```
IMC = peso (kg) / talla (m)^2
```
**Clasificacion OMS:**
| IMC | Clasificacion |
|-----|--------------|
| < 18.5 | Bajo peso |
| 18.5 - 24.9 | Normal |
| 25.0 - 29.9 | Sobrepeso |
| 30.0 - 34.9 | Obesidad grado I |
| 35.0 - 39.9 | Obesidad grado II |
| >= 40.0 | Obesidad grado III |

### 2. Peso Ideal (Formula de Lorentz)
```
Mujeres: Peso Ideal = (talla_cm - 100) - ((talla_cm - 150) / 2.5)
Hombres: Peso Ideal = (talla_cm - 100) - ((talla_cm - 150) / 4)
```
> Nota: Si la nutricionista prefiere otra formula (Devine, Robinson, Hamwi), se puede cambiar facilmente.

### 3. Indice Cintura-Cadera (ICC)
```
ICC = circunferencia_cintura / circunferencia_cadera
```
**Clasificacion de Riesgo Cardiovascular (OMS):**
| | Bajo | Moderado | Alto |
|--|------|----------|------|
| Mujeres | < 0.75 | 0.75 - 0.82 | > 0.82 |
| Hombres | < 0.85 | 0.85 - 0.95 | > 0.95 |

### 4. Diagnostico de Grasa Corporal (% Masa Grasa)
**Clasificacion por genero:**

**Mujeres:**
| % Grasa | Clasificacion |
|---------|--------------|
| < 14% | Grasa esencial / Bajo |
| 14 - 20% | Atletico |
| 21 - 24% | Fitness |
| 25 - 31% | Promedio |
| > 31% | Obesidad |

**Hombres:**
| % Grasa | Clasificacion |
|---------|--------------|
| < 6% | Grasa esencial / Bajo |
| 6 - 13% | Atletico |
| 14 - 17% | Fitness |
| 18 - 24% | Promedio |
| > 24% | Obesidad |

### 5. Diagnostico de Masa Muscular (% Masa Muscular)
**Clasificacion por genero:**

**Mujeres:**
| % Musculo | Clasificacion |
|-----------|--------------|
| < 24% | Bajo |
| 24 - 30% | Normal |
| 31 - 35% | Alto |
| > 35% | Muy alto |

**Hombres:**
| % Musculo | Clasificacion |
|-----------|--------------|
| < 33% | Bajo |
| 33 - 39% | Normal |
| 40 - 44% | Alto |
| > 44% | Muy alto |

### 6. Riesgo Metabolico
Se evalua combinando:
- **Grasa visceral**: < 9 = Normal, 10-14 = Alto, >= 15 = Muy alto
- **ICC** (ver tabla arriba)
- **Circunferencia de cintura**: Mujeres > 88cm = Riesgo, Hombres > 102cm = Riesgo

**Clasificacion final:**
- **Bajo**: Grasa visceral normal + ICC bajo + cintura normal
- **Moderado**: Uno de los tres indicadores elevado
- **Alto**: Dos o mas indicadores elevados
- **Muy alto**: Los tres indicadores elevados

---

## KPIs del Dashboard

Los KPIs principales que se calculan son:

1. **% Promedio de grasa bajado** — Diferencia entre primera y ultima ficha por paciente
2. **% Promedio de masa muscular cambiado** — Diferencia entre primera y ultima ficha
3. **Promedio de IMC actual** — IMC promedio de la ultima ficha de cada paciente
4. **Distribucion de diagnosticos de grasa** — Pie chart con clasificaciones
5. **Pacientes en riesgo metabolico alto** — Contador y porcentaje
6. **Promedio de peso perdido (kg)** — Diferencia de peso primera vs ultima ficha
7. **Adherencia a habitos saludables** — Score basado en habitos registrados

Todos los KPIs se filtran por empresa usando el componente `FiltroEmpresa`.

---

## Diseno y Paleta de Colores

**Marca**: NutricionRosa
**Tema**: Tonos pastel rosado, profesional y limpio

```typescript
// tailwind.config.ts - colores personalizados
colors: {
  rosa: {
    50:  '#fdf2f8',  // Background muy claro
    100: '#fce7f3',  // Background cards
    200: '#fbcfe8',  // Borders suaves
    300: '#f9a8d4',  // Hover states
    400: '#f472b6',  // Botones secundarios
    500: '#ec4899',  // Botones primarios
    600: '#db2777',  // Botones hover
    700: '#be185d',  // Texto accent
    800: '#9d174d',  // Headers
    900: '#831843',  // Texto fuerte
  }
}
```

---

## Tabla/Matriz de Pacientes

### Columnas Fijas (primeras 3)
1. **Nombre del paciente**
2. **Empresa**
3. **Fecha de consulta**

### Columnas desplazables
Todas las demas columnas de la ficha nutricional, incluyendo:
- Datos personales (edad, ciudad)
- Medidas (peso, talla, IMC, cintura, cadera, ICC)
- Datos balanza (% grasa, % musculo, edad metabolica, grasa visceral)
- Habitos (todos los campos)
- Indicadores calculados (peso ideal, dx grasa, dx musculo, riesgo metabolico)

### Funcionalidades de la tabla
- Scroll horizontal con 3 primeras columnas sticky
- Sorting por cualquier columna
- Filtro por empresa (dropdown global)
- Busqueda por nombre de paciente
- Exportar a PDF (boton que genera PDF de la tabla visible)

---

## Reglas de Desarrollo

### Convenciones de Codigo
- **Idioma del codigo**: Ingles para nombres de variables, funciones y componentes
- **Idioma del contenido**: Espanol para labels, textos de UI, mensajes
- **Componentes**: Functional components con TypeScript
- **Estado del servidor**: Server Components por defecto, 'use client' solo cuando sea necesario
- **Imports**: Usar path aliases `@/` para `src/`
- **Archivos**: kebab-case para archivos, PascalCase para componentes

### Buenas Practicas
- Validar TODOS los datos medicos con Zod antes de guardar
- Calcular indicadores tanto en frontend (preview) como guardar en DB
- Usar Supabase RLS para seguridad
- Implementar loading states y error handling en cada pagina
- Responsive design (mobile-first)
- Accesibilidad (labels en formularios, contraste suficiente)

### Variables de Entorno Requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de produccion
npm run build

# Lint
npm run lint

# Generar tipos de Supabase
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

---

## Orden de Implementacion Sugerido

1. **Setup del proyecto** — Next.js + Tailwind + shadcn/ui + Supabase
2. **Autenticacion** — Login con Supabase Auth, middleware de proteccion
3. **Modelo de datos** — Migracion SQL en Supabase
4. **Formulario de ficha** — Crear/editar fichas con validacion y calculos
5. **Lista de fichas** — Pagina con listado de fichas creadas
6. **Tabla/Matriz** — Tabla interactiva con columnas fijas y filtros
7. **KPIs** — Dashboard con indicadores y graficos
8. **Export PDF** — Generacion de PDF de la tabla
9. **Polish** — Tematizacion rosa, responsive, UX final
