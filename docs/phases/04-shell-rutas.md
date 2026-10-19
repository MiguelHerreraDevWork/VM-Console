# Fase 04 — Dirección visual, shell y rutas

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** [01](01-infraestructura.md), [02](02-autenticacion.md) · **En paralelo con:** [03](03-api-vms.md) · **Habilita:** [05](05-listado-formularios.md), [06](06-dashboard-graficos.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** fijar la identidad visual y el esqueleto navegable de la SPA para que las fases siguientes solo añadan contenido.

**Entrega:**

- Dirección de diseño documentada: paleta final, tipografía, espaciado, radios y elevación.
- Tokens en CSS con tema oscuro nativo por defecto y modo claro mediante un selector. La calidad del oscuro es prioritaria.
- Primitivas de UI accesibles.
- `AppShell` responsivo: barra lateral en escritorio y navegación compacta en móvil.
- Login diseñado sobre la lógica de [02](02-autenticacion.md).
- Menú de usuario con rol y logout.
- Páginas temporales para `/dashboard`, `/vms`, `/vms/new` y `/vms/[id]/edit`.
- Infraestructura de feedback: `Toaster`, `Skeleton`, `EmptyState`, `ErrorState` y `ConfirmDialog`.
- Páginas `not-found` y `error`.
- Estructura de carpetas del frontend acordada.

**Exclusiones:**

- Datos reales de VMs, tabla y formularios → [05](05-listado-formularios.md).
- KPIs y gráficos → [06](06-dashboard-graficos.md).
- Lógica optimista → [07](07-optimistic-ui.md).
- Animación de tiempo real → [08](08-tiempo-real.md).
- Logo oficial de IFX: no se reconstruye. Se usa un nombre de producto neutral y sin marca (ver §7).

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 1](../ENUNCIADO_PRUEBA.md) | SPA altamente pulida y responsiva; se evalúan arquitectura de componentes y fidelidad visual | Pasos 1–8 y estructura de carpetas |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Aspecto premium; Dark Mode nativo; tendencias limpias | Pasos 2–3 |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Skeletons, toasts y estados vacíos | Primitivas del paso 5, usadas en 05–07 |
| [Enunciado › Parte 1 › 2](../ENUNCIADO_PRUEBA.md) | Login público; rutas privadas Dashboard, creación/edición y listado; el Cliente no ve acciones de escritura | Pasos 4, 6 y 7 |
| [DECISIONES §5](../DECISIONES.md) | Rutas `/login`, `/dashboard`, `/vms`, `/vms/new` y `/vms/[id]/edit`; azul profundo, azul eléctrico y cian como guía; foco visible y teclado | Pasos 2–7 |
| [CLAUDE.md](../../CLAUDE.md) | Skills `ui-ux-pro-max` e `impeccable` (y `animate` solo si aporta); documentar la paleta; no reconstruir el logo | Pasos 1–2 y 9 |
| [DECISIONES §1 y §5](../DECISIONES.md) | Tailwind CSS; Radix, `sonner` y `lucide` solo donde aporten; oscuro por defecto con modo claro; nombre de producto neutral; paleta inspirada en la referencia de IFX sin logo oficial; interfaz en español | Pasos 2–6 |
| *Decisión propia* | `next/font` para las fuentes; aplicar el tema antes del primer pintado mediante un script mínimo en `<head>` | Pasos 3 y 6 |

## 3. Dependencias y contratos

- **Entradas desde [02](02-autenticacion.md):**
  - `useSession`, `useLogin`, `useLogout` y `RoleGate`;
  - guardas de layout y cliente HTTP.
- **Estructura de carpetas** en `apps/web/src/`. Este es el contrato para 05–08 y para el README:

  ```text
  app/                 rutas, layouts y providers (sin lógica de negocio)
    login/
    (private)/         guarda de sesión y AppShell
      dashboard/  vms/  vms/new/  vms/[id]/edit/
  features/
    auth/              hooks de sesión, LoginForm, RoleGate, UserMenu
    vms/               api, hooks de query y mutación, componentes, utilidades
    dashboard/         agregación y componentes de recursos
  components/
    ui/                primitivas (Button, Input, Select, Dialog, Skeleton, Badge, EmptyState…)
    layout/            AppShell, Sidebar, Topbar, MobileNav
  lib/                 api-client, query-client, formateo de unidades y fechas
  styles/              globals.css y tokens
  ```

- **Etiquetas de la interfaz:**
  - `ADMIN` → «Administrador»; `CLIENT` → «Cliente»;
  - `ON` → «Encendida»; `OFF` → «Apagada»;
  - unidades siempre visibles («GB», «vCPU»).
- **Tokens:** variables CSS semánticas (`--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--accent-2`, `--success`, `--danger`, `--focus`…). Los componentes nunca usan colores en crudo.
- **Tema:**
  - atributo `data-theme="dark" | "light"` en `<html>`, con `dark` por defecto;
  - la preferencia se guarda en `localStorage`, dentro de `try/catch`; es una preferencia visual y no un dato sensible;
  - un script mínimo en `<head>` la aplica antes del primer pintado;
  - Tailwind lee los tokens, de modo que los componentes no cambian entre temas.

## 4. Secuencia de implementación

1. **Contexto de diseño con skills** (*previsto, no ejecutado aún*).
   - Hacer:
     - leer `SKILL.md` y las referencias aplicables de `impeccable` y `ui-ux-pro-max`;
     - ejecutar `impeccable context`. En Windows sin `sh`, usar el `.cmd` que indica la skill;
     - usar `impeccable init`/`shape` para fijar el contexto del producto. Su modo es *Operate*, un panel de operación;
     - ejecutar la consulta `--design-system` de `ui-ux-pro-max` con una descripción del producto (gestión de VMs e infraestructura, dashboard oscuro) y `--stack` para Next.js/React si la skill lo ofrece.
   - Resultado observable: dirección de diseño escrita y aprobable antes de codificar.
2. **Paleta y tipografía finales.**
   - Hacer: partir de la referencia (azul profundo, azul eléctrico, cian) y comprobar contraste AA: 4.5:1 en texto y 3:1 en componentes y foco. Documentarlo en el archivo de diseño que generen las skills (por ejemplo, `DESIGN.md`), indicando que no es una paleta oficial de marca.
   - Resultado observable: tabla de tokens con los ratios de contraste medidos.
3. **Tokens y tema.**
   - Hacer:
     1. `globals.css` con los tokens del tema oscuro, `color-scheme`, la escala de espaciado y tipografía, radios, sombras y `prefers-reduced-motion`. El oscuro se termina y se revisa primero.
     2. Después, los tokens del tema claro con su propio contraste AA verificado, sin degradar el oscuro.
     3. El script anti-parpadeo descrito en §3.
   - Resultado observable: la página temporal se ve con los tokens en ambos temas, sin parpadeo al recargar.
4. **Login diseñado.**
   - Hacer: aplicar el diseño a `LoginForm` con:
     - etiquetas visibles y errores junto al campo y en general;
     - estado de envío con el botón bloqueado;
     - mostrar u ocultar la contraseña;
     - autocompletado correcto (`email`, `current-password`).
   - Resultado observable: login usable con teclado en 360 px y en escritorio.
5. **Primitivas UI** en `components/ui/`.
   - Hacer: `Button`, `Input`, `NumberInput` con sufijo de unidad, `Select`, `Switch` o `SegmentedControl`, `Badge`, `Skeleton`, `EmptyState`, `ErrorState` con botón «Reintentar», `ConfirmDialog` sobre AlertDialog y `Toaster`.
   - Resultado observable: una página de muestra temporal en desarrollo, que se elimina antes de cerrar la fase.
6. **AppShell.**
   - Hacer:
     - barra lateral con Dashboard y VMs;
     - topbar con título, `UserMenu` (email, insignia de rol, «Cerrar sesión»), selector de tema accesible (botón con `aria-pressed` o menú, con etiqueta en texto) y CTA «Nueva VM» envuelto en `RoleGate`;
     - en móvil, navegación compacta;
     - enlace «Saltar al contenido»;
     - *landmarks* (`nav`, `main`, `header`).
   - Resultado observable: navegación entre rutas sin recarga completa.
7. **Rutas temporales** con título, *breadcrumb* y skeleton representativo.
   - Hacer: añadir también `not-found.tsx`, `error.tsx` y la página de edición con un id inexistente.
   - Resultado observable: todas las rutas existen y respetan las guardas.
8. **Ajustes responsive** en 360, 390, 768, 1024, 1280 y 1440 px.
   - Resultado observable: sin scroll horizontal y con objetivos táctiles ≥ 44 px.
9. **Revisión con `impeccable`** (`audit` y `critique` sobre el shell y el login) y corrección en una sola tanda, según su SKILL.md.
   - Resultado observable: hallazgos y correcciones anotados en el registro de evidencia.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Registrar las ejecuciones reales abajo.

- **Roles:**
  - Como ADMIN se ven «Nueva VM» y la navegación completa.
  - Como CLIENT, el botón **no existe en el DOM**: se inspecciona con DevTools o se busca con `queryByRole` en una prueba.
- **Responsive:** capturas de login, dashboard y VMs en 390 px y 1440 px, con ambos roles, en tema oscuro y en tema claro.
- **Tema:**
  - la primera visita abre en oscuro;
  - el cambio a claro persiste tras recargar y no hay parpadeo del tema contrario;
  - el selector funciona con teclado;
  - con `localStorage` bloqueado, la app sigue funcionando en oscuro.
- **Accesibilidad:**
  - recorrido completo con Tab y Shift+Tab, con foco visible;
  - `Esc` cierra diálogos y el foco vuelve al disparador;
  - contraste medido en tokens;
  - lector de pantalla básico en login (Narrator o NVDA): etiquetas y errores anunciados;
  - Lighthouse Accessibility como referencia, no como única prueba.
- **Estados:** las páginas temporales muestran skeleton; `/vms/<uuid inexistente>/edit` muestra el estado de error o inexistente; las rutas desconocidas muestran `not-found`.
- **Movimiento:** con `prefers-reduced-motion` activo no hay transiciones superfluas.

## 6. Criterios de aceptación

- [x] Paleta, tipografía y escala documentadas con ratios de contraste AA verificados, y declaradas como no oficiales de marca.
- [x] El tema oscuro nativo es el predeterminado y se aplica a toda la app sin colores en crudo en los componentes.
- [x] El modo claro está disponible mediante un selector, persiste sin parpadeo y cumple contraste AA; el oscuro conserva su acabado.
- [x] Login y shell revisados en móvil y escritorio, sin scroll horizontal ni solapes.
- [x] CLIENT no tiene en el DOM ningún control de crear, editar o eliminar en el shell.
- [x] Navegación completa por teclado con foco visible, y diálogos con foco atrapado y restaurado.
- [x] Las primitivas de feedback (toast, skeleton, empty, error y confirmación) están listas para 05–07.
- [x] La revisión con `impeccable` está ejecutada y sus hallazgos críticos corregidos. Solo se declara si se ejecutó de verdad.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| Dos temas | Mantener dos paletas puede restar calidad al oscuro o consumir tiempo | Terminar y revisar primero el oscuro; el claro reutiliza la misma estructura de tokens | Resuelto ([DECISIONES §5](../DECISIONES.md)) |
| Librerías de UI | Añadir Radix, `sonner` o `lucide` donde no aportan | Radix solo para Dialog, AlertDialog y menús con gestión de foco; `sonner` para toasts; `lucide` para iconos | Resuelto ([DECISIONES §1](../DECISIONES.md)) |
| Nombre y logo | No hay logo apto en el repositorio | «VM Console» con un monograma tipográfico simple, ajustable en esta fase, sin imitar ni presentar un logo oficial | Resuelto ([DECISIONES §5](../DECISIONES.md)) |
| Fuentes | `next/font/google` descarga las fuentes al compilar; sin red, el build falla | Autoalojar las fuentes elegidas (`next/font/local`) si el spike lo aconseja | No |
| Idioma | El enunciado está en español | UI en español; códigos de la API en inglés, mapeados a etiquetas | No |

## Registro de evidencia

Fecha: **2026-10-19**. Alcance del encargo en [BITACORA_IA.md](../BITACORA_IA.md), fase 04.

| Paso | Comando / procedimiento | Resultado |
| --- | --- | --- |
| Skills | Lectura de `SKILL.md` de `ui-ux-pro-max` e `impeccable`; `impeccable.cmd context --target apps/web/src/app/login` | PRODUCT.md / DESIGN.md cargados; modo Operate; dark-first IFX |
| Design system | Consulta `--design-system` de `ui-ux-pro-max` → `design-system/vm-console/MASTER.md` | Parcialmente sobreescrito por DECISIONES (sin CTA naranja; oscuro primero) |
| Tokens | `apps/web/src/styles/globals.css` + `ThemeScript` en `<head>` | `data-theme` dark por defecto; claro vía selector; tokens semánticos |
| Calidad | `pnpm --filter @repo/web typecheck`; `pnpm --filter @repo/web lint` | typecheck OK; lint OK |
| Roles ADMIN | Login `admin@demo.local`; dashboard/vms; «Nueva VM» visible | OK; badge «Administrador» |
| Roles CLIENT | Login `cliente@demo.local`; CDP: `nuevaVmLinks: []` | «Nueva VM» / «Crear primera VM» **ausentes del DOM** |
| Tema | Toggle claro ↔ oscuro; `localStorage` `vm-console-theme=light`; sin scroll horizontal | Persiste; primera visita dark en HTML SSR |
| Responsive | Viewport 390 px (CDP) + escritorio | Sidebar oculta; `MobileNav`; sin scroll horizontal |
| Estados | `/vms/0000…/edit` (ADMIN) → ErrorState; `/ruta-inexistente-fase04` → not-found | OK |
| Detector | `impeccable.cmd detect --json` (login, private, components, LoginForm, globals) | `[]` |
| Audit (manual, 5 dims) | A11y 3 · Perf 3 · Theme 4 · Responsive 3 · Integrity 4 | **17/20 Good** |
| Critique | Assessment A (subagente) + B (subagente + detect) | Sin críticos; majors: nav EN→ES, errores login duplicados, active móvil; corregidos en una tanda (Panel/Máquinas, MobileNav alineado, alert solo API) |
| Questions | Menú interactivo de critique | `Questions skipped: cierre de fase 04 autorizado` |
