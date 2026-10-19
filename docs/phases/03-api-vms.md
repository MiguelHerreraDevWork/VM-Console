# Fase 03 — API CRUD de VMs

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** [01](01-infraestructura.md), [02](02-autenticacion.md) · **En paralelo con:** [04](04-shell-rutas.md) · **Habilita:** [05](05-listado-formularios.md), [06](06-dashboard-graficos.md), [08](08-tiempo-real.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** el CRUD de VMs, seguro y predecible, con la validación y la autorización aplicadas en el servidor aunque la UI oculte los controles.

**Entrega:**

- `GET /vms`, `POST /vms`, `PUT /vms/:id` y `DELETE /vms/:id` en `apps/api/src/modules/vms/`, separados en rutas y servicio.
- Validación con los esquemas de `@repo/contracts`.
- Traducción de los errores de Prisma a los códigos acordados.
- Suite de pruebas por rol y por caso límite.
- Un punto único después de persistir, donde [08](08-tiempo-real.md) podrá emitir eventos.

**Exclusiones:**

- Cualquier UI → [05](05-listado-formularios.md) y [06](06-dashboard-graficos.md).
- Emisión de eventos Socket.IO → [08](08-tiempo-real.md).
- `GET /vms/:id`, paginación, filtros y `PATCH`: no los exige el enunciado (ver §7).

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 2 › 2](../ENUNCIADO_PRUEBA.md) | `POST /vms` (name, cores, ram, disk, os, status) solo Admin; `GET /vms` Admin y Cliente; `PUT /vms/{id}` solo Admin; `DELETE /vms/{id}` solo Admin | Pasos 2–5 |
| [Enunciado › Parte 2](../ENUNCIADO_PRUEBA.md) | Seguridad y buenas prácticas que suelen pasarse por alto | Validación estricta, autorización por endpoint, errores sin fugas, pruebas por rol |
| [DECISIONES §2](../DECISIONES.md) | `name` único, límites de cada campo, lista `os`, `status` `ON`/`OFF` | Esquemas compartidos y restricción de DB |
| [DECISIONES §3](../DECISIONES.md) | Respuestas `{ items }`, `201`, `200` y `204`; forma de error; 400, 401, 403, 404, 409 y 500; `PUT` con el objeto completo | Pasos 2–6 |
| [DECISIONES §4](../DECISIONES.md) | `403` a escrituras de CLIENT aunque llame directo | Paso 7 |
| [DECISIONES §2](../DECISIONES.md) | Normalización del nombre y unicidad sin distinguir mayúsculas mediante `nameKey` con `UNIQUE` en la base de datos; acentos distintos; gana la última escritura | Pasos 3, 4 y 6 |
| [DECISIONES §3](../DECISIONES.md) | `400` para un id con formato inválido; `PUT` estricto; autorización antes de validar; sin `GET /vms/:id` | Pasos 3–5 |
| [DECISIONES §6](../DECISIONES.md) | Tiempo real limitado a cambios de `status` | Gancho `afterVmUpdate` (§3) |
| *Decisión propia* | Orden de `GET` por `createdAt` descendente | Paso 2 |

## 3. Dependencias y contratos

- **Entradas:**
  - `authenticate`, `requireRole`, el manejador de errores y el hook de `Origin` de [02](02-autenticacion.md);
  - `vmInputSchema` y `vmSchema` de [01](01-infraestructura.md).
- **Contrato:** el de [DECISIONES §3](../DECISIONES.md), sin duplicarlo aquí. Se añaden estos detalles:
  - `PUT` recibe `vmInputSchema` completo con `.strict()`; los campos desconocidos o la falta de alguno dan `400`.
  - `:id` se valida como UUID; un formato inválido da `400` y un UUID inexistente da `404 VM_NOT_FOUND`.
  - El servicio normaliza `name` con `normalizeVmName` y calcula `nameKey` con `vmNameKey` en cada alta y edición.
  - La unicidad la garantiza el `UNIQUE` de `nameKey` en la base de datos, no una consulta previa: así se evita la carrera entre dos altas simultáneas.
  - Un nombre duplicado (`Web-01` frente a `web-01`) da `409 VM_NAME_TAKEN` con `details.field = 'name'`, tanto al crear como al renombrar. `José` y `Jose` no chocan. Guardar una VM con su propio nombre no es conflicto.
  - `GET /vms` ordena por `createdAt` descendente.
- **Códigos nuevos** en el catálogo de `@repo/contracts`: `VM_NOT_FOUND` y `VM_NAME_TAKEN`.
- **Salida para [08](08-tiempo-real.md):** tras persistir un `PUT`, el servicio llama a un único `afterVmUpdate(previous, updated)`, que por ahora no hace nada (*no-op*). 08 lo usará solo cuando cambie `status`. Las altas y bajas no tienen gancho porque quedan fuera del tiempo real ([DECISIONES §6](../DECISIONES.md)). Es un preparativo mínimo, sin dependencias nuevas.

## 4. Secuencia de implementación

1. **Serialización.**
   - Hacer: un mapper de Prisma a `vmSchema`, con fechas ISO 8601 y sin campos internos.
   - Resultado observable: un test unitario del mapper.
2. **`GET /vms`** con `authenticate`.
   - Resultado observable: ADMIN y CLIENT reciben `{ items }` con las VMs del seed.
3. **`POST /vms`** con `authenticate`, `requireRole('ADMIN')` y validación del body.
   - Hacer: normalizar `name` (contratos), calcular `nameKey` y responder `201` con la VM creada, sin `nameKey`.
   - Resultado observable: la VM aparece en el `GET` siguiente con el nombre normalizado.
4. **`PUT /vms/:id`.**
   - Hacer: validar el parámetro y el body completo, recalcular `nameKey`, actualizar y responder `200`. Un `P2025` de Prisma se convierte en `404`. Leer la versión previa en la misma operación, para pasársela a `afterVmUpdate`.
   - Resultado observable: `updatedAt` cambia y `createdAt` se mantiene.
5. **`DELETE /vms/:id`.**
   - Hacer: responder `204`; un id inexistente da `404`.
   - Resultado observable: la VM desaparece del `GET`.
6. **Errores de persistencia.**
   - Hacer: un `P2002` de Prisma sobre `nameKey` se convierte en `409 VM_NAME_TAKEN`; cualquier otro error termina en `500` genérico, registrado en el log sin datos sensibles.
   - Resultado observable: ver §5.
7. **Suite de pruebas** en `apps/api/test/vms.test.ts` (Vitest + `inject` sobre la base de pruebas, reiniciada antes de la suite).
   - Resultado observable: `pnpm --filter api test` en verde.
8. **Colección manual.**
   - Hacer: guardar comandos `curl` o un archivo `.http` en `apps/api/` con login, cookie y cada operación, para el README.
   - Resultado observable: reproducible sin la web.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Registrar las ejecuciones reales abajo.

**Matriz de permisos (automatizada):**

| Endpoint | Sin sesión | CLIENT | ADMIN |
| --- | --- | --- | --- |
| `GET /vms` | 401 | 200 | 200 |
| `POST /vms` | 401 | **403** | 201 |
| `PUT /vms/:id` | 401 | **403** | 200 |
| `DELETE /vms/:id` | 401 | **403** | 204 |

La petición de CLIENT con datos inválidos debe dar `403` y no `400`. La autorización va en `onRequest` o `preValidation`, antes que la validación del body, para no filtrar reglas.

**Validación (`400` con `details` por campo):**

- `cores`: 0, 65, `1.5` y `"4"` (cadena) se rechazan; 1 y 64 se aceptan.
- `ram`: -1 y 0 se rechazan; 1 y 512 se aceptan; 513 se rechaza.
- `disk`: 9 y 4097 se rechazan; 10 y 4096 se aceptan.
- `name`:
  - se rechazan 2 caracteres, 51 caracteres, `"vm_01"`, `"vm@01"`, solo espacios y `"<script>"`;
  - se aceptan 3 y 50 caracteres, nombres con espacios y guion, `"Ñandú 01"` y `"Producción-2"`;
  - `"  web   01 "` se guarda como `"web 01"`.
- `os` fuera de la lista y `status` `"RUNNING"` se rechazan; un campo extra y un campo faltante en `PUT` se rechazan.

**Errores de negocio:**

- Crear con un nombre existente da `409`, también con otras mayúsculas (`WEB-01` frente a `web-01`) o con el mismo nombre en NFD. Renombrar a un nombre existente da `409`.
- `José` y `Jose` pueden coexistir.
- Guardar una VM con su propio nombre, o cambiando solo sus mayúsculas, da `200`.
- Dos `POST` simultáneos con el mismo nombre: uno da `201` y el otro `409`, porque la restricción es de la base de datos.
- `PUT` o `DELETE` sobre un UUID inexistente da `404`; sobre `abc`, `400`.
- Un `500` simulado (por ejemplo, con el cliente de Prisma mockeado) no expone el stack ni el SQL.

**Contrato:** cada respuesta pasa `vmSchema` o `apiErrorSchema` en el test; las fechas son ISO.

**Manual:** repetir la matriz con `curl` usando la cookie real del login. Incluir `-H "Origin: http://evil.example"` para confirmar el `403 ORIGIN_NOT_ALLOWED`.

## 6. Criterios de aceptación

- [x] Los cuatro endpoints cumplen métodos, rutas, permisos y respuestas de [DECISIONES §3](../DECISIONES.md).
- [x] La matriz de permisos completa pasa en prueba automatizada, con `403` a CLIENT en `POST`, `PUT` y `DELETE`. Esto cierra la evidencia pendiente de [02](02-autenticacion.md).
- [x] Los casos de 400, 401, 403, 404 y 409 están cubiertos y devuelven `{ error: { code, message, details? } }`.
- [x] Ningún error devuelve detalles internos.
- [x] La unicidad sin distinguir mayúsculas y con los acentos como caracteres distintos queda probada, y la garantiza la base de datos.
- [x] La colección manual reproduce los flujos contra la API real.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| Unicidad y caracteres de `name` | Escribir `nameKey` de forma distinta a la del seed o la web | Una sola función de contratos para todos; pruebas de §5 | Resuelto ([DECISIONES §2](../DECISIONES.md)) |
| Sin `GET /vms/:id` | La edición necesita los datos de una VM | [05](05-listado-formularios.md) consulta `GET /vms` si la caché está vacía | Resuelto ([DECISIONES §3](../DECISIONES.md)) |
| Concurrencia | Dos admins editan la misma VM | Gana la última escritura; limitación documentada en el README | Resuelto ([DECISIONES §2](../DECISIONES.md)) |
| Orden de autorización y validación | Validar antes de autorizar filtra reglas a CLIENT | `preValidation` con `authenticate` / `requireRole` antes del parse Zod en el handler | Verificado (CLIENT + body inválido → `403`) |

## Registro de evidencia

Fecha: **2026-10-19**. Alcance del encargo en [BITACORA_IA.md](../BITACORA_IA.md), fase 03.

| Paso | Comando / procedimiento | Resultado |
| --- | --- | --- |
| Contratos | `VM_NOT_FOUND`, `VM_NAME_TAKEN`, `vmWriteSchema` | Actualizados en contracts + DECISIONES |
| Tests | `pnpm --filter @repo/api test` | 21/21 verdes (11 auth + 9 vms + 1 mapper) |
| Matriz permisos | Automatizada en `test/vms.test.ts` | CLIENT `403` en POST/PUT/DELETE; GET 200 para ambos roles |
| Unicidad | `WEB-01` vs `web-01` → 409; `José`/`Jose` coexisten; NFD choca; carrera → 201+409 | OK |
| Manual curl | Login, GET, POST 201, PUT 200, DELETE 204, CLIENT POST 403, Origin evil 403 | OK contra API en `:4000` |
| Colección | `apps/api/vms.http` | Añadida; enlace en README |
| Calidad | `pnpm typecheck`, `pnpm lint` | En verde |

Gancho `afterVmUpdate` deja no-op listo para la fase 08.
