# Fase 08 — Tiempo real con Socket.IO (PLUS)

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Esta fase es un plus.** Solo se inicia con 01–07 terminadas y la documentación de [09](09-calidad-entrega.md) encaminada. Si falta tiempo, se recorta esta fase y no un requisito obligatorio ([PLAN.md](../PLAN.md)).
> **Alcance limitado** a sincronizar los **cambios de estado** de VMs (`ON` ↔ `OFF`) hechos por un administrador ([DECISIONES §6](../DECISIONES.md)).
> **Depende de:** [03](03-api-vms.md), [07](07-optimistic-ui.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** cuando un administrador cambia el estado de una VM (de Apagada a Encendida o al revés), todos los clientes conectados ven la tarjeta o fila actualizada al instante, con un resaltado breve.

**Entrega:**

- Servidor Socket.IO en `apps/api`, autenticado con la misma cookie.
- Emisión de `vm:updated` solo cuando un `PUT` persistido cambia `status`.
- Proveedor de socket en la web que reconcilia la caché `['vms']`.
- Animación de resaltado accesible.
- Recuperación de estado al reconectar.
- Indicador discreto de conexión.

**Exclusiones** ([DECISIONES §6](../DECISIONES.md)):

- **Altas y bajas en tiempo real.** Tampoco las ediciones que no cambian `status`. Se ven al volver a consultar `GET /vms` (navegación, foco de ventana o reconexión).
- Presencia de usuarios, chat y eventos de cliente a servidor.
- Escalado horizontal (adaptador Redis).

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 1 › 3](../ENUNCIADO_PRUEBA.md) | (Plus) WebSockets o Socket.io; un cambio de estado hecho por un admin se ve al instante en todos los clientes conectados, con una leve animación que resalte el cambio | Pasos 2–6 |
| [Enunciado › Parte 4 › 3](../ENUNCIADO_PRUEBA.md) | Diagrama Cliente–API–Real-Time | Insumo para [09](09-calidad-entrega.md) |
| [DECISIONES §6](../DECISIONES.md) | Alcance limitado a cambios de `status`; Socket.IO en `apps/api`; autenticación con cookie y `Origin`; `vm:updated` tras persistir; reconsultar `GET /vms` al reconectar; no duplicar el cambio optimista | Pasos 1–6 |
| [DECISIONES §4](../DECISIONES.md) | Sin CORS abierto; rol vigente; cookie `Secure` | Paso 2 |
| *Decisión propia* | Indicador de conexión; desconexión programada a la hora de `exp` | Pasos 3 y 5 |

## 3. Dependencias y contratos

- **Entradas:**
  - gancho `afterVmUpdate(previous, updated)` de [03](03-api-vms.md);
  - caché `['vms']` y utilidad `replaceById` de [07](07-optimistic-ui.md);
  - `VmCard` y las filas de [05](05-listado-formularios.md) y [06](06-dashboard-graficos.md).
- **Contrato del evento** en `@repo/contracts/realtime.ts`: `vm:updated` con la carga `{ vm: Vm }`, validada con `vmSchema` al recibirla. Se emite solo si `previous.status !== updated.status`. Lleva la VM completa, de modo que si el mismo `PUT` cambió otros campos también llegan.
- **Autenticación del *handshake*:**
  - leer la cookie de sesión de `socket.request.headers.cookie`;
  - verificar el JWT y cargar el usuario vigente desde la base de datos; si falla, `next(new Error('UNAUTHENTICATED'))`;
  - exigir que `Origin` coincida con `WEB_ORIGIN`.
  - Los sockets solo reciben; el servidor ignora cualquier evento entrante.
- **Reconciliación en la web:**
  - Al recibir `vm:updated`, si hay una mutación local en vuelo para ese id, se ignora: el `onSettled` de [07](07-optimistic-ui.md) ya invalida.
  - Si no, `replaceById` se aplica solo si `updatedAt` es mayor o igual que el de la caché.
  - El id se marca como resaltado durante unos 1.5 s.
  - Si el id no está en la caché (una VM creada en otra sesión y aún no consultada), se invalida `['vms']` en lugar de insertarla, para no simular un alta en tiempo real.

## 4. Secuencia de implementación

1. **Spike de transporte.** → Conexión directa a `NEXT_PUBLIC_API_URL` (Next no proxifica `/socket.io`). Registrado en DECISIONES §6.
2. **Servidor** en `apps/api/src/realtime/`.
3. **Proveedor web** en `features/realtime/`.
4. **Resaltado** (CSS; skill `animate`).
5. **Indicador de conexión** en la topbar.
6. **Pruebas** API + unitarias de reconciliación.
7. **Revisión** `impeccable detect`.

## 5. Verificación

> Ejecutada; ver registro abajo.

## 6. Criterios de aceptación

- [x] Un cambio de estado hecho por un ADMIN se refleja en otra sesión conectada sin recargar, con un resaltado breve y accesible.
- [x] Solo se emite el evento cuando cambia `status`. Las altas, las bajas y las ediciones sin cambio de estado no se difunden.
- [x] Solo los sockets autenticados con la cookie y el origen permitido se conectan.
- [x] Tras una reconexión, el cliente recupera el estado real con `GET /vms`.
- [x] Los cambios optimistas locales no se duplican ni se pisan con eventos propios o atrasados.
- [x] Insumo de diagrama para [09](09-calidad-entrega.md): Cliente ↔ API HTTP (proxy `/api`) + Socket.IO directo a la API; evento solo `vm:updated` por cambio de `status`.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| Transporte | Los rewrites de Next pueden no proxificar WebSocket | Conexión directa con CORS de un único origen | Resuelto (DECISIONES §6) |
| Alcance limitado | Un evaluador podría esperar ver también altas y bajas | Fuera de alcance por decisión | Resuelto |
| Caducidad del JWT con el socket abierto | El token se valida solo en el *handshake* | Desconectar en el logout y a la hora de `exp` | No |
| Tiempo | Puede desplazar el pulido o la documentación | No iniciar sin 01–07 terminadas | Regla ya aprobada |

## Registro de evidencia

### Spike de transporte

Next `rewrites` solo mapean `/api/:path*` → API. `/socket.io` no se proxifica. **Decisión:** cliente → `NEXT_PUBLIC_API_URL` con `withCredentials` y `cors.origin = WEB_ORIGIN`.

### Comandos

```text
pnpm --filter @repo/api test     # 24/24 (incl. 3 realtime)
pnpm --filter @repo/web test     # 17/17 (incl. reconcile)
pnpm --filter @repo/api db:seed  # tras tests que vacían fixtures
impeccable detect --target apps/web/src/features/realtime  # []
impeccable detect --target apps/web/src/features/vms/VmCard.tsx  # []
```

### Manual (CLIENT en browser + ADMIN vía API)

1. Sesión `cliente@demo.local` en `/dashboard`: indicador **En vivo**.
2. ADMIN `PUT` apaga `web-frontend-01` → CLIENT sin recargar: KPIs **26 vCPU / 72 GB / 980 GB**; anuncio `aria-live` «web-frontend-01 ahora está Apagada».
3. Restaurado ON (API cores ON = 28).

### Skills

- Secuencia de decisión de `animate` aplicada (propósito: state indication; CSS transition; 200ms `--ease-out`; reduced-motion estático).
- `impeccable detect` → `[]`.

### Prompt de IA

Ver el alcance de la fase 08 en [BITACORA_IA.md](../BITACORA_IA.md).
