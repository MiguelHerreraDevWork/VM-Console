# IFX — instrucciones de proyecto para Claude Code

## Misión y fuentes

Construir una prueba Full Stack de gestión de VMs evaluada localmente, con **frontend como protagonista** y una API segura de soporte. Antes de proponer o cambiar código, leer en este orden:

1. `docs/ENUNCIADO_PRUEBA.md` — requisitos originales; no editar su transcripción.
2. `docs/DECISIONES.md` — decisiones aprobadas de stack, datos, API, sesión y UX.
3. `docs/PLAN.md` — fases, dependencias, estado y evidencia de cierre.
4. `docs/phases/<fase>.md` — pasos de la fase activa, cuando existan.

Si hay discrepancia, priorizar el enunciado y las instrucciones actuales del usuario; exponer la discrepancia antes de codificarla. No atribuir a IFX decisiones añadidas por el equipo.

## Alcance del trabajo

Los nueve planes de `docs/phases/` ya existen y están enlazados desde `docs/PLAN.md`. La implementación avanza **una fase verificable a la vez**, según el estado en `PLAN.md` y la autorización del usuario. No anticipar funcionalidades de fases posteriores salvo contratos o preparativos mínimos necesarios para evitar retrabajo. No afirmar verificaciones que aún no se han ejecutado; cerrar una fase como `Terminada` solo con evidencia concreta en su plan.

Antes de implementar, leer el plan de la fase activa en `docs/phases/`. Al iniciar, marcarla `En curso` en `PLAN.md` y en su archivo; al cerrar, registrar comandos, resultados y problemas reales, y actualizar `docs/BITACORA_IA.md` con el alcance y los resultados comprobados, sin registrar mensajes personales de autorización.

## Arquitectura acordada

- Monorepo pnpm: `apps/web` con Next.js/React/TypeScript; `apps/api` con Fastify/TypeScript; `packages/contracts` con Zod para contratos compartidos.
- PostgreSQL local mediante Docker Compose; Prisma para modelo, migraciones y seed reproducible.
- JWT en cookie HttpOnly; nunca en el cuerpo de login ni en `localStorage`. Autorizar en cada endpoint y ocultar en la UI las acciones que un Cliente no puede realizar.
- Mantener los nombres y métodos exigidos por el PDF. Extensiones como `/me` y `/logout` se describen en `docs/DECISIONES.md`.
- Implementar WebSockets solo después de cerrar lo obligatorio; es un plus, no una condición de arranque.

## Trabajo con la configuración global de Claude Code

La guía global de UI/UX del usuario ya define las skills permitidas y su flujo. Para este dashboard, seguir su ruta de SaaS/dashboard: **`ui-ux-pro-max` e `impeccable`**, y `animate` solo cuando aporte a interacciones concretas. Antes de usar cualquier skill, leer su `SKILL.md` y referencias aplicables. No repetir ni reemplazar la guía global aquí, no afirmar que una skill fue usada sin haberla ejecutado y no usar otras skills de diseño salvo petición explícita del usuario.

La referencia visual recibida sugiere azul profundo, azul eléctrico y cian. Es una dirección de diseño, no un sistema de marca oficial ni una especificación de colores exactos. Documentar la paleta final y revisar contraste, tipografía, espaciado, responsive, foco, carga, vacío, error y validación. Si no existe un archivo de logo apto en el repositorio, no reconstruirlo como si fuera oficial.

## Disciplina de ejecución y evidencia

- Antes de editar: inspeccionar el estado actual del repositorio y la fase activa. Preservar cambios existentes.
- Durante la implementación: respetar contratos compartidos, hacer cambios acotados y actualizar el plan de fase cuando cambie el enfoque.
- Al verificar: ejecutar comprobaciones pertinentes y revisar visualmente las pantallas afectadas. Probar ambos roles y los fallos relevantes; una compilación exitosa no sustituye esas pruebas.
- Al cerrar: registrar qué cambió, qué se comprobó y qué queda pendiente. Actualizar el estado en `docs/PLAN.md` solo con evidencia concreta.
- Secretos en `.env` ignorado por Git; `.env.example` contiene solo valores de desarrollo seguros. No publicar tokens, contraseñas reales ni cadenas de conexión privadas.
- El README final debe permitir una instalación limpia y contener diagrama, credenciales de seed y una **Bitácora de IA veraz**: herramientas efectivamente usadas, trabajo delegado, intervención humana y 1–2 prompts reales.

## Criterio de calidad

Preferir una solución clara y completa para el plazo de dos días: componentes por funcionalidad, estados globales y remotos bien definidos, respuestas de API coherentes y errores visibles. No agregar abstracciones, paquetes o servicios que no ayuden a cumplir un criterio de aceptación. Si surge una decisión nueva, documentarla en `docs/DECISIONES.md` y reflejarla en los planes afectados antes de implementarla.
