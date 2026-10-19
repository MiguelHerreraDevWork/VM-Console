# Fase 05 — Listado, alta, edición y borrado de VMs

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** [03](03-api-vms.md), [04](04-shell-rutas.md) · **Habilita:** [07](07-optimistic-ui.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** los flujos completos de VMs en la web, con validación inmediata y permisos reflejados en la UI.

**Entrega:**

- `/vms`: listado responsivo, con tabla en escritorio y tarjetas en móvil, y estados de carga, vacío y error.
- `/vms/new` y `/vms/[id]/edit`: formulario compartido con validación en tiempo real.
- Borrado con confirmación.
- Acción rápida «Encender/Apagar» para ADMIN.
- Hooks de query y mutación centralizados en `features/vms/hooks`.

**Exclusiones:**

- Las mutaciones de esta fase son **pesimistas**: esperan a la respuesta e invalidan la caché. [07](07-optimistic-ui.md) las vuelve optimistas dentro de los mismos hooks.
- Dashboard y gráficos → [06](06-dashboard-graficos.md).
- Resaltado en tiempo real → [08](08-tiempo-real.md).
- Búsqueda, filtros y paginación: no los exige el enunciado.

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 1 › 2](../ENUNCIADO_PRUEBA.md) | Ruta privada de listado de VMs | Pasos 1–3 |
| [Enunciado › Parte 1 › 2](../ENUNCIADO_PRUEBA.md) | Ruta privada de creación y edición con validación en tiempo real (no RAM negativa, formato del nombre, etc.) | Pasos 4–6 |
| [Enunciado › Parte 1 › 2](../ENUNCIADO_PRUEBA.md) | El Cliente no ve en absoluto (no solo deshabilitados) los botones de crear, editar y eliminar | `RoleGate` en el paso 3 y verificación en el DOM |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Skeletons, toasts y estados vacíos | Pasos 2, 7 y 8 |
| [DECISIONES §2](../DECISIONES.md) | Límites, lista `os` y unidades visibles | Formulario basado en `vmInputSchema` |
| [DECISIONES §3](../DECISIONES.md) | `PUT` con el objeto completo; 400 y 409 | Paso 6 |
| [DECISIONES §5](../DECISIONES.md) | Confirmación antes de eliminar; estados de carga, vacío y error; foco y teclado | Pasos 2–8 |
| [DECISIONES §1, §2, §3 y §5](../DECISIONES.md) | TanStack Query y react-hook-form; reglas y normalización del nombre; edición desde `GET /vms` que funciona al recargar; botón rápido de encender/apagar solo para ADMIN; el CLIENT ve todas las VMs | Pasos 1, 4–6 y 8 |
| *Decisión propia* | Aviso de nombre duplicado contra la caché; tabla en escritorio y tarjetas en móvil | Pasos 3 y 5 |

## 3. Dependencias y contratos

- **Entradas:**
  - API de [03](03-api-vms.md);
  - primitivas, shell, `RoleGate` y estructura de [04](04-shell-rutas.md);
  - `vmInputSchema` de [01](01-infraestructura.md).
- **Estado remoto:**
  - Query `['vms']`, que devuelve `VM[]`.
  - Hooks `useVmsQuery`, `useCreateVm`, `useUpdateVm` y `useDeleteVm` con `mutationKey: ['vms', <op>]`.
  - La misma caché alimenta [06](06-dashboard-graficos.md) y la reconcilia [08](08-tiempo-real.md).
- **Formulario:**
  - `react-hook-form` con `zodResolver(vmInputSchema)` y `mode: 'onChange'`.
  - Los errores se muestran cuando el campo se ha tocado o modificado, para no gritar al primer carácter.
- **Edición sin `GET /vms/:id`:**
  - La página obtiene la lista con `ensureQueryData(['vms'])`: usa la caché si existe y, si está vacía (apertura directa, nueva pestaña o recarga), vuelve a consultar `GET /vms`. Después busca la VM por id.
  - Mientras carga, muestra el skeleton del formulario.
  - Si la VM no existe, muestra un estado «VM no encontrada» con un enlace al listado.
  - Si falla la consulta, muestra `ErrorState` con reintento.
- **Componentes compartidos con 06 y 08:** `VmStatusBadge`, `VmSpecs`, `VmActions` (dentro de `RoleGate`) y `VmCard`.

## 4. Secuencia de implementación

1. **Capa de datos** en `features/vms/api.ts` y `hooks/`.
   - Hacer: funciones tipadas para los cuatro endpoints y las queries y mutaciones pesimistas. En éxito se invalida `['vms']`; en error, el `ApiError` se propaga.
   - Resultado observable: `/vms` lista los datos del seed.
2. **Estados de la lista.**
   - Skeleton con la forma final de filas y tarjetas, sin saltos de layout.
   - `ErrorState` con «Reintentar».
   - `EmptyState` distinto por rol: ADMIN ve un CTA «Crear la primera VM»; CLIENT ve solo el mensaje.
   - Resultado observable: los tres estados se pueden forzar, con la DB vacía y con la API detenida.
3. **Lista responsiva.**
   - Desde `lg`, una tabla semántica: `<table>` con `<th scope>` y nombre, SO, vCPU, RAM, disco, estado y acciones.
   - En pantallas menores, `VmCard`.
   - `VmActions` (editar, eliminar, encender/apagar) dentro de `RoleGate`.
   - Resultado observable: CLIENT ve la lista sin la columna ni los botones de acción.
4. **Formulario compartido** `VmForm`:
   - `name`, con recorte e indicación del formato permitido;
   - `cores`, `ram` y `disk` como `NumberInput` con unidad, `inputmode="numeric"`, solo enteros, sin negativos y con rango visible;
   - `os` como `Select` con las opciones de los contratos;
   - `status` como `SegmentedControl`;
   - texto de ayuda con los rangos y el botón de envío deshabilitado mientras el formulario no sea válido.
   - Resultado observable: la RAM negativa, decimal o vacía se marca al instante con un mensaje junto al campo.
5. **`/vms/new`.**
   - Hacer:
     - valores por defecto razonables;
     - aviso inmediato si el nombre ya existe en la caché, comparando con `vmNameKey`: mismas reglas que la base de datos, sin distinguir mayúsculas y con los acentos como caracteres distintos;
     - al guardar, toast de éxito y navegación a `/vms`.
   - Resultado observable: la VM creada aparece en la lista.
6. **`/vms/[id]/edit`.**
   - Hacer:
     - formulario precargado desde la caché, o desde `GET /vms` si la caché está vacía (§3);
     - `PUT` con el objeto completo;
     - un `400` con `details` se traslada a `setError` en cada campo;
     - un `409` marca el campo `name`;
     - un `404` muestra un toast y lleva al listado.
   - Resultado observable: los errores del servidor se ven en el campo correcto.
7. **Borrado.**
   - Hacer: `ConfirmDialog` que nombra la VM, con el foco inicial en «Cancelar» y la acción destructiva diferenciada. Al confirmar, toast de éxito o error.
   - Resultado observable: la VM desaparece tras confirmar; al cancelar no pasa nada.
8. **Acción rápida de estado, solo para ADMIN.**
   - Hacer: `useUpdateVm` con la VM completa y `status` invertido, dentro de `RoleGate`. El botón tiene etiqueta accesible («Encender web-01»).
   - Resultado observable: el estado cambia y el toast lo confirma. Es la base para [08](08-tiempo-real.md).
9. **Revisión de UX** con `ui-ux-pro-max` (consultas de formularios y feedback por dominio) e `impeccable` (`audit` o `harden` sobre lista y formulario). *Previsto; se registra solo si se ejecuta.*
   - Resultado observable: hallazgos corregidos en una tanda.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Registrar las ejecuciones reales abajo.

- **ADMIN:**
  1. Crear una VM válida.
  2. Editar su RAM y su nombre.
  3. Encenderla y apagarla.
  4. Eliminarla con confirmación y cancelar otro borrado.
- **CLIENT:**
  - Ve la lista completa.
  - En el DOM no existen «Nueva VM», editar, eliminar ni encender/apagar.
  - Escribir a mano `/vms/new` redirige ([02](02-autenticacion.md)).
- **Validación en tiempo real:**
  - RAM `-1`, `0`, `1.5` y vacía; cores `65`; disco `9`;
  - nombres `ab`, `vm_01` y uno de 51 caracteres;
  - nombre duplicado con otras mayúsculas.
  - Cada caso muestra el mensaje junto al campo sin enviar el formulario.
  - `Ñandú 01` y `José` son válidos.
- **Edición robusta:** abrir `/vms/<id>/edit` directamente en una pestaña nueva y recargarlo; el formulario se precarga tras consultar `GET /vms`. Con un id inexistente, aparece «VM no encontrada».
- **Errores del servidor:**
  - `409`: crear el mismo nombre desde dos sesiones con la caché desactualizada.
  - `404`: editar una VM borrada en otra sesión.
  - `500` o caída de red: API detenida o bloqueo de `/api/vms` en DevTools › *Network request blocking*.
- **Estados:** lista vacía (`db:reset` sin seed de VMs, o borrar todas), error y skeleton con la red ralentizada a *Slow 3G*.
- **Responsive y accesibilidad:**
  - tabla y tarjetas en 390 px y 1440 px;
  - formulario con Tab y Enter;
  - errores asociados con `aria-describedby` y anunciados;
  - foco devuelto tras cerrar el diálogo.
- **Obligatorio:** el recorrido manual con ADMIN y con CLIENT de esta sección.
- **Pruebas de componentes** (Vitest y Testing Library): `VmForm` (mensajes por campo) y la ausencia de acciones con rol CLIENT. Playwright queda para [09](09-calidad-entrega.md), solo si hay margen.

## 6. Criterios de aceptación

- [x] ADMIN completa crear, editar, encender/apagar y eliminar con confirmación desde la UI, contra la API real.
- [x] CLIENT ve el listado y ningún control de escritura existe en el DOM.
- [x] Todas las reglas de `vmInputSchema` se validan mientras se escribe, con mensajes junto al campo; los `400` y `409` del servidor se reflejan en el campo correcto.
- [x] Los estados de carga, vacío (distinto por rol) y error con reintento son visibles y verificados.
- [x] La lista es usable en 390 px y en escritorio, y el formulario es completamente operable con teclado.
- [x] `/vms/[id]/edit` funciona al abrirlo directamente y al recargarlo.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| Edición con la caché vacía | Pedir la lista completa para editar una sola VM | Aceptable con el volumen esperado; no se añade endpoint | Resuelto ([DECISIONES §3](../DECISIONES.md)) |
| Tabla y tarjetas | Dos representaciones que mantener | Comparten `VmSpecs`, `VmActions` y `VmStatusBadge`; solo cambia el contenedor | No |
| Formularios y estado remoto | Añadir stores adicionales sin necesidad | react-hook-form con el esquema Zod compartido; TanStack Query sin Redux ni Zustand | Resuelto ([DECISIONES §1](../DECISIONES.md)) |

## Registro de evidencia

Fecha: **2026-10-19**. Alcance del encargo en [BITACORA_IA.md](../BITACORA_IA.md), fase 05.

| Paso | Comando / procedimiento | Resultado |
| --- | --- | --- |
| Datos | `features/vms/api.ts` + hooks pesimistas `['vms']` / `['vms', op]` | Invalidación al éxito |
| Calidad | `pnpm --filter @repo/web typecheck`; lint; `pnpm --filter @repo/web test` | typecheck/lint OK; **4/4** tests (VmForm + CLIENT sin acciones) |
| Skills | `ui-ux-pro-max` `--domain ux` form/feedback/empty; `impeccable detect` sobre `features/vms` y rutas | UX guidelines OK; detect `[]` |
| ADMIN UI | Crear `fase05-test-01`; encender; editar RAM→8; diálogo eliminar (Cancelar deja `cache-redis-01`) | Flujos OK contra API real |
| CLIENT | Login; `/vms` con 12 VMs; CDP `writeBtns: []`, `nuevaVm: false`; `/vms/new` → `/vms` | Sin controles de escritura en DOM |
| Edición directa | Abrir `/vms/<uuid>/edit` con caché vía `ensureQueryData` | Formulario precargado; missing/error states implementados |
