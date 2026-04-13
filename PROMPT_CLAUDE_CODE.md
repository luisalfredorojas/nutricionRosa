# Prompt Optimizado para Claude Code — NutricionRosa

> Copia y pega este prompt en Claude Code para comenzar el desarrollo del proyecto.

---

## Prompt

```
Eres un desarrollador senior full-stack trabajando en el proyecto NutricionRosa. Lee el archivo CLAUDE.md en la raiz del proyecto antes de cada tarea — contiene el contexto completo: stack, estructura, modelo de datos, formulas medicas y reglas de desarrollo.

## Contexto del Proyecto

NutricionRosa es una plataforma web para una nutricionista que atiende pacientes corporativos. La plataforma permite:

1. **Autenticacion**: Login seguro con Supabase Auth
2. **Fichas medicas**: Crear fichas nutricionales completas con datos personales, medidas antropometricas, datos de balanza, habitos y calculos automaticos
3. **Tabla/Matriz**: Visualizar todos los pacientes en una tabla con las 3 primeras columnas fijas (nombre, empresa, fecha) y scroll horizontal para el resto
4. **KPIs**: Dashboard con indicadores nutricionales (% grasa bajado, masa muscular, IMC promedio, riesgo metabolico) filtrados por empresa
5. **Export PDF**: La tabla se puede exportar como PDF

## Stack
- Next.js 14+ (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS + shadcn/ui
- TanStack Table v8 (columnas sticky)
- React Hook Form + Zod
- Recharts (graficos)
- jsPDF + html2canvas o @react-pdf/renderer (export PDF)
- Deploy en Vercel

## Reglas Obligatorias

1. SIEMPRE lee CLAUDE.md antes de empezar cualquier tarea
2. Usa TypeScript estricto — nunca `any`
3. Server Components por defecto, `'use client'` solo cuando sea necesario
4. Valida TODOS los datos medicos con Zod
5. Las formulas nutricionales estan en CLAUDE.md — implementalas en `src/lib/formulas/indicadores.ts`
6. Calcula indicadores en frontend (preview en tiempo real) Y guardalos en Supabase
7. Usa la paleta rosa pastel definida en CLAUDE.md para toda la UI
8. Responsive design mobile-first
9. Codigo en ingles, contenido de UI en espanol
10. Maneja loading states y errores en cada pagina

## Formulas que DEBES implementar automaticamente

- **IMC** = peso / talla^2 (clasificacion OMS)
- **Peso Ideal** = Formula de Lorentz (necesita campo sexo)
- **ICC** = cintura / cadera (clasificacion OMS por genero)
- **Dx Grasa** = Clasificacion del % de masa grasa por genero
- **Dx Musculo** = Clasificacion del % de masa muscular por genero
- **Riesgo Metabolico** = Combinacion de grasa visceral + ICC + cintura

Todas las tablas de clasificacion estan detalladas en CLAUDE.md.

## Orden de Implementacion

Sigue este orden estrictamente:

### Fase 1: Fundacion
- [ ] Inicializar proyecto Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Configurar Supabase client (browser + server)
- [ ] Configurar tailwind.config.ts con paleta rosa
- [ ] Crear layout principal con sidebar y header
- [ ] Implementar autenticacion (login/logout con Supabase Auth)
- [ ] Middleware de proteccion de rutas

### Fase 2: Modelo de Datos
- [ ] Crear migracion SQL con tablas: empresas, pacientes, fichas_nutricionales
- [ ] Aplicar RLS policies
- [ ] Generar tipos TypeScript desde Supabase
- [ ] Crear schemas de validacion Zod

### Fase 3: Fichas Medicas
- [ ] Implementar `src/lib/formulas/indicadores.ts` con TODAS las formulas
- [ ] Formulario multi-seccion: Datos Personales > Ficha Nutricional > Datos Balanza > Habitos
- [ ] Calculos en tiempo real (IMC, ICC, peso ideal, diagnosticos)
- [ ] Guardar ficha en Supabase
- [ ] Lista de fichas con busqueda

### Fase 4: Tabla/Matriz
- [ ] Implementar tabla con TanStack Table v8
- [ ] 3 primeras columnas sticky (nombre, empresa, fecha)
- [ ] Scroll horizontal para las demas columnas
- [ ] Sorting y filtros
- [ ] Filtro global por empresa

### Fase 5: KPIs
- [ ] KPI cards: % grasa bajado, % musculo cambiado, IMC promedio
- [ ] Pacientes en riesgo metabolico alto
- [ ] Graficos con Recharts
- [ ] Filtro por empresa aplicado a todos los KPIs

### Fase 6: Export y Polish
- [ ] Export tabla a PDF
- [ ] Tematizacion completa rosa pastel
- [ ] Responsive final
- [ ] Testing de flujo completo

## Cuando tengas dudas

- Consulta CLAUDE.md para formulas, estructura y decisiones de diseno
- Si una formula no esta clara, usa la clasificacion mas estandar de la OMS
- Prioriza funcionalidad sobre estetica en las primeras fases
- Usa subagentes para tareas paralelas cuando sea posible (ej: un agente para el schema SQL mientras otro prepara los componentes de UI)
```

---

## Notas de Uso

### Como usar este prompt

1. Abre tu terminal en la carpeta del proyecto
2. Ejecuta `claude` para iniciar Claude Code
3. Asegurate de que `CLAUDE.md` esta en la raiz del proyecto
4. Pega el prompt de arriba o referencia este archivo
5. Claude Code leera automaticamente CLAUDE.md para contexto

### Tips para sesiones productivas

- **Una fase a la vez**: No saltes entre fases. Completa una antes de seguir.
- **Verifica cada paso**: Despues de cada implementacion, pide a Claude Code que haga `npm run build` para verificar que no hay errores.
- **Subagentes**: Para tareas independientes (ej: formulas + SQL schema), pide que use agentes en paralelo.
- **Iteraciones**: Si algo no queda bien, describe el problema especifico. "El calculo de IMC no esta usando la formula correcta" es mejor que "arreglalo".
