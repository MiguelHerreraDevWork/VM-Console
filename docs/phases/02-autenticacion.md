# Fase 02 — Autenticación, sesión y autorización

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** [01](01-infraestructura.md) · **Habilita:** [03-api-vms](03-api-vms.md) y [04-shell-rutas](04-shell-rutas.md), que pueden avanzar en paralelo.

## 1. Objetivo, alcance y exclusiones

**Objetivo:** sesión segura de extremo a extremo.

- La API emite un JWT solo dentro de una cookie `HttpOnly` y autoriza por rol en el servidor.
- La web restaura la sesión, protege las rutas privadas y expone el rol para ocultar acciones.

**Entrega — API:**

- `POST /login`, `GET /me` y `POST /logout`.
- Plugins `authenticate` y `requireRole`.
- Manejador de errores uniforme.
- Comprobación de `Origin` en mutaciones, límite de intentos de login y cabeceras de seguridad.

**Entrega — web:**

- Cliente HTTP tipado.
- `QueryClientProvider`.
- Hooks de sesión.
- Guardas de servidor para rutas privadas y de administrador.
- Formulario de login funcional sin diseño final.
- Logout.
- Manejo global de `401`.
- Componente `RoleGate`.

**Exclusiones:**

- Diseño visual del login y del shell → [04](04-shell-rutas.md).
- Endpoints `/vms` → [03](03-api-vms.md); el `403` real sobre escrituras de VM se verifica allí.
- Autenticación del socket → [08](08-tiempo-real.md).
- Registro de usuarios, recuperación de contraseña y *refresh tokens*: fuera de alcance.

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 2 › 1](../ENUNCIADO_PRUEBA.md) | JWT no en el body ni en `localStorage`; cookie `HttpOnly`, `Secure` y `SameSite`; el frontend confía en que la cookie viaja sola | Pasos 3–6 y 9; verificación en DevTools |
| [Enunciado › Parte 2 › 1](../ENUNCIADO_PRUEBA.md) | `POST /login` valida email y password, establece la cookie y devuelve solo usuario y rol | Paso 6 |
| [Enunciado › Parte 2 › 2](../ENUNCIADO_PRUEBA.md) | CRUD protegido por middleware JWT y roles | Plugins `authenticate` y `requireRole` (paso 3), aplicados en [03](03-api-vms.md) |
| [Enunciado › Parte 1 › 2](../ENUNCIADO_PRUEBA.md) | Login como ruta pública; Dashboard y VMs como rutas privadas protegidas; el Cliente no ve los botones de escritura | Pasos 10–12 |
| [DECISIONES §3](../DECISIONES.md) | Contrato de `/login`, `/me` y `/logout`; forma de error; códigos 400, 401 y 403 | Pasos 3 y 6 |
| [DECISIONES §4](../DECISIONES.md) | `SameSite=Lax`, `Path=/`, sin `Domain`; `Secure` en HTTPS; `Origin` en mutaciones; `/me` restaura sesión; hash robusto | Pasos 2–6 |
| [DECISIONES §5](../DECISIONES.md) | `/vms/new` y `/vms/[id]/edit` solo ADMIN | Paso 11 |
| [DECISIONES §4 y §8](../DECISIONES.md) | `Secure=true` como objetivo y HTTPS local si un navegador objetivo no la acepta; límite de intentos con `429`; `401` uniforme con hash ficticio; rol vigente leído de la base de datos; JWT de 8 h | Pasos 2–5 y 8 |
| [DECISIONES §8](../DECISIONES.md) | El cierre de la fase prueba el middleware de roles con una ruta exclusiva de test; el `403` real sobre `/vms` se cierra en [03](03-api-vms.md) | Paso 7 |
| *Decisión propia* | Validación del parámetro `next` para evitar redirecciones abiertas | Paso 11 |

## 3. Dependencias y contratos

- **Entradas desde [01](01-infraestructura.md):**
  - `buildApp()`, `config` y la utilidad `password.ts`;
  - modelo `User` con usuarios de seed;
  - proxy `/api`.
- **Contratos nuevos en `@repo/contracts`:**
  - `loginInputSchema` (`email`, `password`);
  - `sessionUserSchema` (`{ id, email, role }`);
  - `sessionResponseSchema` (`{ user }`);
  - catálogo de `code` de error: `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `FORBIDDEN`, `ORIGIN_NOT_ALLOWED`, `NOT_FOUND`, `RATE_LIMITED` e `INTERNAL_ERROR`. [03](03-api-vms.md) añade los códigos propios de VM.
- **Cookie** (nombre por definir; por defecto `session`):
  - `HttpOnly`, `SameSite=Lax`, `Path=/`, sin `Domain`;
  - `Max-Age` igual a la vida del JWT;
  - `Secure` siempre activo. No existe una opción para desactivarlo ([DECISIONES §4](../DECISIONES.md)).
- **JWT:**
  - contenido: `sub` (id de usuario), `role` y `exp`;
  - firma HS256 con `JWT_SECRET`;
  - vida de 8 h, sin *refresh token*.
  - `authenticate` verifica la firma y **recarga el usuario desde la DB**, de modo que un rol cambiado o un usuario borrado invalidan la sesión.
- **Rutas web:**
  - Pública: `/login`. Si ya hay sesión, redirige a `/dashboard`.
  - Privadas: `/dashboard` y `/vms`.
  - Solo ADMIN: `/vms/new` y `/vms/[id]/edit`.
- **Estado compartido en web:**
  - Query `['session']`, sembrada desde el layout de servidor.
  - `useSession()` devuelve `{ user, role, isAdmin }`.
  - `RoleGate` **no renderiza** su contenido cuando falta el permiso, en lugar de deshabilitarlo.

## 4. Secuencia de implementación

1. **Contratos de auth y catálogo de errores** en `packages/contracts/src/auth.ts` y `errors.ts`.
   - Resultado observable: tipos disponibles en web y API.
2. **Servicio de login** en `apps/api/src/modules/auth/`.
   - Hacer: buscar por email normalizado y verificar con argon2id. Si el email no existe, verificar igualmente contra un hash ficticio para igualar tiempos. Responder siempre `401 INVALID_CREDENTIALS` con el mismo mensaje.
   - Resultado observable: probado con `inject`.
3. **Plugins de Fastify.**
   - Hacer:
     - registrar `@fastify/cookie` y `@fastify/jwt` (lectura desde la cookie);
     - crear el decorador `authenticate`, que responde 401 `UNAUTHENTICATED` y añade `request.user` cargado desde la DB;
     - crear `requireRole('ADMIN')`, que responde 403 `FORBIDDEN`;
     - añadir un `setErrorHandler` central que convierte errores Zod en 400 con `details` por campo, devuelve 404 JSON para rutas inexistentes y 500 sin traza ni detalles internos.
   - Resultado observable: respuestas siempre con forma `{ error }`.
4. **Defensa CSRF complementaria.**
   - Hacer: añadir un hook `onRequest` para `POST`, `PUT`, `PATCH` y `DELETE`. Si la cabecera `Origin` existe y no coincide con `WEB_ORIGIN`, responder `403 ORIGIN_NOT_ALLOWED`. Las peticiones sin `Origin` (clientes no navegador) pasan, porque un navegador siempre la envía en mutaciones.
   - Resultado observable: probado con `inject`.
5. **Endurecimiento.**
   - Hacer: `@fastify/rate-limit` en `/login` (por defecto 10 intentos por minuto e IP, con `429 RATE_LIMITED`), `@fastify/helmet`, límite de tamaño del body y `bodyLimit` en JSON.
   - Resultado observable: el intento 11 recibe 429.
6. **Rutas.**
   - `POST /login`: valida el body, crea la cookie y responde `200 { user }`, sin token.
   - `GET /me`: responde `{ user }`.
   - `POST /logout`: borra la cookie con los mismos atributos y responde `204`.
   - Resultado observable: casos de §5 en verde.
7. **Pruebas de API con Vitest e `inject`.**
   - Hacer: cubrir los casos de §5. Para validar `requireRole` antes de [03](03-api-vms.md), el archivo de prueba registra una ruta protegida (por ejemplo, `POST /__test__/admin-only`) **solo en su propia instancia** de `buildApp()`. La ruta nunca se añade a `buildApp()`, a `server.ts` ni a ningún módulo de producción.
   - Resultado observable: `pnpm --filter api test` en verde. Con la API arrancada normalmente, la ruta de test responde `404`, lo que prueba que no quedó en producción.
8. **Spike del proxy y de la cookie `Secure`.**
   - Hacer: confirmar en Chrome, Edge y Firefox actuales, los navegadores objetivo:
     - que el rewrite de Next propaga `Set-Cookie`, `Cookie` y `Origin`;
     - que el navegador guarda y reenvía la cookie `Secure` en `http://localhost:3000`.
   - Si algún navegador objetivo la rechaza:
     1. **no** desactivar `Secure`;
     2. plantear HTTPS local con un certificado de desarrollo para la web (por ejemplo, la opción HTTPS del servidor de desarrollo de Next o un certificado de `mkcert`) y `WEB_ORIGIN=https://localhost:3000`;
     3. presentar la propuesta antes de aplicarla y registrarla en DECISIONES.
   - Resultado observable: navegador, versión y resultado anotados en el registro de evidencia.
9. **Cliente HTTP web** en `apps/web/src/lib/api-client.ts`.
   - Hacer: `fetch` relativo a `/api` con `credentials: 'same-origin'`, parseo del error a `ApiError` (código, mensaje y detalles) y ningún almacenamiento de tokens.
   - Resultado observable: tipos de respuesta inferidos de los contratos.
10. **Sesión en web** en `apps/web/src/features/auth/` y `src/app/providers.tsx`.
    - Hacer:
      - crear `useSession`, `useLogin` y `useLogout`;
      - el logout limpia la caché de React Query y redirige a `/login`;
      - un manejador global de `401` en el `QueryCache` y el `MutationCache` limpia la caché y redirige a `/login?next=<ruta>`.
    - Resultado observable: la sesión expirada lleva al login sin pantallas rotas.
11. **Guardas de servidor.**
    - Hacer:
      - el layout de `(private)` consulta `GET ${API_INTERNAL_URL}/me` reenviando **solo** la cookie de sesión. Con 401 redirige a `/login?next=…`; con éxito siembra `['session']`;
      - un layout de administrador en `vms/new` y `vms/[id]/edit` redirige a CLIENT a `/vms`;
      - el parámetro `next` se acepta solo si es una ruta interna que empieza por `/` y no por `//`.
    - Resultado observable: sin parpadeo de contenido privado.
12. **Login mínimo y `RoleGate`.**
    - Hacer: formulario con email, password, error visible y estado de envío, más `RoleGate` y un helper `can(role, action)`.
    - Resultado observable: base funcional que [04](04-shell-rutas.md) diseña y [05](05-listado-formularios.md) aplica.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Registrar las ejecuciones reales abajo.

**API automatizada (Vitest + `inject`):**

| Caso | Esperado |
| --- | --- |
| Login ADMIN o CLIENT válido | `200`, body `{ user: { id, email, role } }` sin token; `Set-Cookie` con `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` y `Max-Age` |
| Usuario cuyo rol cambia en la base de datos tras el login | La petición siguiente usa el rol nuevo |
| Password incorrecta o email inexistente | `401 INVALID_CREDENTIALS`, mismo mensaje en ambos casos |
| Body sin email o con email inválido | `400 VALIDATION_ERROR` con `details` |
| `/me` con cookie válida, sin cookie, con JWT manipulado o con JWT expirado | `200`, `401`, `401`, `401` |
| `/logout` | `204`, cookie con `Max-Age=0`; el `/me` siguiente responde `401` |
| Mutación con `Origin` ajeno | `403 ORIGIN_NOT_ALLOWED` |
| Más de N logins por minuto | `429 RATE_LIMITED` |
| Ruta exclusiva de test: CLIENT / ADMIN / sin sesión | `403` / `200` / `401` |
| La misma ruta contra la API arrancada normalmente | `404`: no existe en producción |
| Error inesperado simulado | `500 INTERNAL_ERROR` sin traza |

**Navegador (manual):**

1. Iniciar sesión en cada navegador objetivo y abrir DevTools › Application: la cookie aparece con `HttpOnly` y `Secure` marcados, `document.cookie` no la muestra y `localStorage` y `sessionStorage` no contienen tokens.
2. En la pestaña Network, la respuesta de login no incluye el JWT.
3. Recargar `/dashboard` mantiene la sesión.
4. Cerrar sesión y volver con el botón Atrás no muestra datos privados.
5. Abrir `/dashboard` sin sesión redirige al login, y tras iniciar sesión se vuelve a la ruta original.
6. Como CLIENT, abrir `/vms/new` redirige a `/vms`.
7. `/login?next=//evil.example` se ignora.

**Accesibilidad básica del login mínimo:** etiquetas asociadas y error anunciado. El diseño accesible completo es de [04](04-shell-rutas.md).

## 6. Criterios de aceptación

- [x] Admin y Cliente inician sesión; el body no contiene el token y la cookie tiene los atributos acordados, incluido `Secure`.
- [x] La cookie `Secure` funciona en `localhost` con Chrome/Chromium y Edge. Firefox **no está instalado** en esta máquina; no se desactivó `Secure` ni se planteó HTTPS (no hubo rechazo en los navegadores probados).
- [x] `GET /me` restaura la sesión tras recargar, y `POST /logout` la invalida en el navegador.
- [x] Credenciales inválidas dan el mismo `401` sin revelar si el email existe.
- [x] `requireRole('ADMIN')` devuelve `403` a CLIENT en una prueba automatizada sobre una ruta exclusiva de test, y esa ruta responde `404` en la API normal. El `403` real sobre `POST`, `PUT` y `DELETE /vms` se verifica y cierra en [03](03-api-vms.md).
- [x] Un cambio de rol en la base de datos se aplica en la petición siguiente sin volver a iniciar sesión.
- [x] Las mutaciones con `Origin` ajeno se rechazan, y el login tiene límite de intentos.
- [x] Las rutas privadas no se renderizan sin sesión, y CLIENT no accede a las rutas de creación y edición.
- [x] Ningún token aparece en `localStorage`, en `sessionStorage` ni en JSON de respuesta.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| **`Secure` en HTTP local** | Chrome y Edge la aceptan en `localhost`. Firefox no instalado aquí | `Secure` siempre activo; HTTPS no necesario de momento | Opcional: verificar Firefox cuando esté instalado |
| Proxy de Next | Un rewrite podría alterar `Origin`, `Host` o `Set-Cookie` | Rewrite propaga `Set-Cookie` con `HttpOnly; Secure; SameSite=Lax` | No |
| Rol vigente en cada petición | Recargar el usuario cuesta una consulta por petición | Aceptable a esta escala; da revocación inmediata | Resuelto ([DECISIONES §4](../DECISIONES.md)) |
| Ruta exclusiva de test | Que acabe registrada en producción por error | Definirla solo en el archivo de prueba y verificar el `404` en la API normal | No |
| Expiración durante el uso | Sin *refresh token*, la sesión caduca y hay que volver a iniciar sesión | Redirigir al login con `next` (toast en fase 04/07) | No |

## Registro de evidencia

Fecha: **2026-10-19**. Alcance del encargo en [BITACORA_IA.md](../BITACORA_IA.md), fase 02.

| Paso | Comando / procedimiento | Resultado |
| --- | --- | --- |
| Contrato | Códigos de error semánticos en `@repo/contracts`; actualización en `DECISIONES.md` | Alineado plan 02 vs números HTTP previos |
| Tests API | `pnpm --filter @repo/api test` | 11/11 verdes (login, cookie attrs, 401 uniforme, `/me`, logout, Origin, 429, roles, 404 de ruta test, 500 sin stack) |
| Proxy login | `POST http://localhost:3000/api/login` | `200` body solo `{ user }`; `Set-Cookie: session=…; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Lax` |
| `/me` vía proxy | Cookie de sesión | `200` con usuario |
| Chromium (Cursor) | Login UI → `/dashboard`; `document.cookie` sin `session`; storage vacío; logout → `/login` | OK |
| Edge 155 | CDP + script temporal `scripts/spike-secure-cookie.mjs` | Cookie `httpOnly+secure+Lax`; sin token en JS storage |
| Firefox | — | **No instalado** en la máquina |
| CLIENT | `GET /vms/new` con cookie CLIENT | `307` → `/vms` |
| RoleGate | Dashboard ADMIN muestra bloque admin-only | Visible solo para ADMIN |
| Calidad | `pnpm typecheck`, `pnpm lint`, `pnpm test` | En verde |

**Problemas reales:** PowerShell rompe JSON en `curl -d "{...}"` (usar `--data-binary @file`). Borrar `.next` con el servidor vivo provoca 500 hasta reiniciar. `exactOptionalPropertyTypes` exigió cuidado en `RequestInit` y opciones de plugins.
