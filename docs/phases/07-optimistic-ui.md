# Fase 07 — UI optimista con reversión y feedback

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** [05](05-listado-formularios.md), [06](06-dashboard-graficos.md) · **Habilita:** [08](08-tiempo-real.md) y el cierre en [09](09-calidad-entrega.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** que crear, actualizar (incluido encender/apagar) y eliminar una VM se reflejen **al instante** en el listado, las tarjetas y los totales del dashboard, y se **reviertan con precisión** si la API falla, con feedback claro en todo momento.

**Entrega:**

- `useCreateVm`, `useUpdateVm` y `useDeleteVm` convertidos a optimistas.
- Utilidades puras de caché con pruebas.
- Indicador visual de «pendiente».
- Política de toasts.
- Revisión final de los skeletons en todas las vistas.

**Exclusiones:**

- Sincronización entre clientes → [08](08-tiempo-real.md).
- Deshacer tras un éxito (*undo*): no lo exige el enunciado.

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Al crear, actualizar o eliminar, la interfaz reacciona de inmediato mientras la petición se resuelve y revierte el cambio si la API falla | Pasos 2–5 |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Skeletons durante la carga, toasts de éxito y error, estados vacíos | Pasos 6–7 |
| [Enunciado › Parte 1](../ENUNCIADO_PRUEBA.md) | Se evalúa el manejo de estado global | Toda la fase: caché única como fuente de verdad |
| [DECISIONES §5](../DECISIONES.md) | Mostrar el resultado antes de la respuesta, conservar el estado previo, revertir ante error y reconciliar tras el éxito | Pasos 1–5 |
| [DECISIONES §6](../DECISIONES.md) | No duplicar un cambio optimista recibido luego por socket | Contrato de ids del paso 2, aplicado en [08](08-tiempo-real.md) |
| [DECISIONES §5](../DECISIONES.md) | Alta fallida: revertir y conservar los datos del formulario; `404` en borrado: volver a consultar y avisar, sin VM fantasma; reversión por elemento | Pasos 2–4 |
| *Decisión propia* | Borrador en memoria mediante un proveedor de la app (`VmDraftProvider`), sin almacenamiento persistente | Paso 2 |

## 3. Dependencias y contratos

- **Entradas:**
  - hooks pesimistas y formularios de [05](05-listado-formularios.md);
  - agregación derivada de la caché de [06](06-dashboard-graficos.md);
  - `Toaster` de [04](04-shell-rutas.md).
- **Modelo de caché en la web:**
  - `['vms']` guarda `VmView[]`, donde `VmView = Vm & { pending?: 'create' | 'update' | 'delete' }`.
  - `pending` es solo de la UI y nunca se envía a la API.
  - Una VM creada de forma optimista lleva `id` provisional `temp-<uuid>`.
- **Protocolo común** (TanStack Query, `onMutate`, `onError`, `onSuccess` y `onSettled`):
  1. `cancelQueries(['vms'])` para que una petición en curso no pise el cambio optimista.
  2. Guardar **solo el estado previo del elemento afectado**, junto con su índice si es un borrado.
  3. Aplicar el cambio optimista con `pending`.
  4. En `onError`, revertir **solo ese elemento**, sin restaurar la lista entera, para no pisar otras mutaciones simultáneas, y mostrar un toast de error con el mensaje de la API.
  5. En `onSuccess`, sustituir por la entidad del servidor.
  6. En `onSettled`, invalidar `['vms']` solo si la mutación tuvo éxito y no quedan otras mutaciones de VMs en vuelo (`isMutating({ mutationKey: ['vms'] }) === 1`). Tras error no se invalida (ver [DECISIONES §5](../DECISIONES.md)).
- **Utilidades puras** en `features/vms/lib/cache.ts`: `insertTemp`, `replaceById`, `removeById`, `restoreAt` y `markPending`.

## 4. Secuencia de implementación

1. **Utilidades de caché y pruebas unitarias.**
2. **Crear optimista** (+ `VmDraftProvider`, navegación cliente vía `DraftNavBridge`).
3. **Actualizar optimista** (edición y encender/apagar).
4. **Eliminar optimista** (incluido `404` sin fantasma). Desde el 2026-10-19, la fila permanece marcada «Eliminando…» hasta la respuesta y deja de contar en las sumas desde el inicio ([DECISIONES §5](../DECISIONES.md)).
5. **Bloqueos de coherencia** (acciones bloqueadas si `pending` o `temp-…`).
6. **Indicador de pendiente** (`opacity`, «Guardando…», `aria-busy`).
7. **Política de feedback** (toasts éxito/error; error persistente con «Volver al formulario»).
8. **Revisión** con `impeccable detect` (el CLI no expone `audit`/`harden` en esta versión).

## 5. Verificación

> Registros ejecutados abajo.

## 6. Criterios de aceptación

- [x] Crear, actualizar (incluido encender/apagar) y eliminar se reflejan antes de la respuesta en el listado, las tarjetas y los totales del dashboard.
- [x] Cada una de las tres operaciones revierte exactamente su cambio ante error de la API y de red, comprobado con los casos de la tabla de §5.
- [x] Una reversión no deshace otras mutaciones concurrentes que tuvieron éxito (reversión por id/índice).
- [x] No quedan elementos `temp-…`, duplicados ni VMs fantasma tras éxito, error o `404`.
- [x] Tras un alta/edición fallida, el formulario se reabre con los datos enviados (borrador en memoria + navegación cliente).
- [x] Toasts de éxito y error en todos los flujos; skeletons sin saltos de layout; estados vacíos intactos.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| Navegar antes de la respuesta | Si el alta falla, el usuario ya salió del formulario | Toast persistente con «Volver al formulario» y el borrador intacto en memoria | Resuelto ([DECISIONES §5](../DECISIONES.md)) |
| `404` en el borrado | Dejar una VM fantasma en la interfaz | No reinsertar; volver a consultar `GET /vms` y avisar | Resuelto ([DECISIONES §5](../DECISIONES.md)) |
| Reversión por elemento frente a instantánea completa | Restaurar la instantánea entera pisa mutaciones concurrentes | Reversión dirigida por id | No |
| Validación duplicada | Los avisos de nombre duplicado contra la caché reducen, pero no eliminan, los `409` | El servidor es la autoridad; el `409` siempre provoca reversión | No |
| Invalidar tras error de red | Un `invalidateQueries` con la API caída vaciaba el listado | Invalidar solo en éxito | Documentado en DECISIONES |

## Registro de evidencia

### Comandos

```text
pnpm --filter @repo/web typecheck   # ok
pnpm --filter @repo/web test        # 13/13 (cache utils + VmForm + VmActions)
impeccable detect --target apps/web/src/features/vms   # salida vacía = []
```

### Casos de la tabla §5 (manual, ADMIN en localhost:3000)

| Operación | Fallo / caso | Resultado |
| --- | --- | --- |
| Crear éxito | Alta `opt-ok-ui` ON | Aparece al instante en `/vms`; toast «VM creada»; KPIs suben con ON |
| Crear `409` | Nombre `opt-race-dup` creado vía API con caché desactualizada | Temp visible → removido; toast error + «Volver al formulario» |
| Actualizar `409` | Renombrar a nombre creado en carrera (`race-upd-409` / `draft-ret-test`) | Nombre previo restaurado (`opt-ok-ui`); toast + borrador; «Volver al formulario» precarga `draft-ret-test` |
| Encender/Apagar éxito | Dashboard: apagar `web-frontend-01` | KPIs 28/76/1020 → 26/72/980 al instante; restaurado ON (API: cores ON = 28) |
| Encender/Apagar red | API detenida (puerto 4000) + apagar | Toast «No se pudo guardar»; tras ajuste, no se invalida en error (evita vaciar inventario) |
| Eliminar `404` | Borrar `opt-race-dup` vía API y luego Eliminar en UI | No reaparece; lista alineada al servidor; aviso informativo |
| CLIENT | Sesión `cliente@demo.local` | Sin controles de escritura (RoleGate) |

### Skills

- `impeccable detect` sobre `apps/web/src/features/vms` → `[]`.
- `impeccable audit`/`harden` no están en el CLI instalado (`Unknown command`); no se registran como ejecutados.

### Prompt de IA

Ver el alcance de la fase 07 en [BITACORA_IA.md](../BITACORA_IA.md).

### Archivos principales

- `apps/web/src/features/vms/lib/cache.ts` (+ tests)
- `apps/web/src/features/vms/hooks.ts` (mutaciones optimistas)
- `apps/web/src/features/vms/VmDraftProvider.tsx`, `DraftNavBridge.tsx`, `draft-nav.ts`
- `apps/web/src/features/vms/{Create,Edit}VmPage.tsx`, `VmActions.tsx`, `VmCard.tsx`, `VmTable.tsx`, `VmForm.tsx`, `types.ts`
- `apps/web/src/app/providers.tsx` (proveedor de borrador)
