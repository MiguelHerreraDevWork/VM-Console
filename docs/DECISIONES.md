# Decisiones de arquitectura y contrato — IFX

Este documento fija los acuerdos para planificar e implementar la prueba. El texto original está en `ENUNCIADO_PRUEBA.md`; si hay conflicto, prevalece el enunciado. Son decisiones de implementación, no requisitos atribuidos a IFX. El origen y la fecha de cada cambio constan en la [§8](#8-registro-de-decisiones).

## 1. Alcance y tecnología

- Entrega pensada para ejecución local en un monorepo con **pnpm workspaces**.
- `apps/web`: **Next.js + React + TypeScript**.
  - App Router para rutas y layouts.
  - Componentes de cliente donde se necesiten formularios, caché, gráficos y cambios optimistas.
  - La experiencia debe sentirse como SPA.
- `apps/api`: **Fastify + TypeScript**, responsable de REST, autenticación, autorización y, si se implementa el extra, Socket.IO.
- `packages/contracts`: **Zod** para esquemas, tipos y normalizaciones compartidos entre web, API y seed. No importar código de servidor en el frontend.
- Persistencia: **PostgreSQL local mediante Docker Compose + Prisma** para esquema, migraciones y seed. Las versiones exactas se fijan en el lockfile al crear el proyecto.
- Librerías de la web:

  | Ámbito | Elección | Uso |
  | --- | --- | --- |
  | Estado del servidor | **TanStack Query** | La sesión vive en la misma caché; no se añade un store global salvo necesidad demostrada |
  | Formularios | **react-hook-form** | Con resolver Zod que reutiliza los esquemas de `packages/contracts` |
  | Estilos | **Tailwind CSS** | Tokens semánticos en variables CSS |
  | Gráficos | **Recharts** | Cargado solo en el cliente |
  | Diálogos y menús | **Radix** | Solo donde aporte accesibilidad o un ahorro claro (diálogos, confirmación, menús) |
  | Toasts | **sonner** | Solo donde aporte |
  | Iconos | **lucide** | Solo donde aporte |

- Contraseñas con **argon2id**.
- Pruebas:
  - **Vitest** para contratos, API (`inject`), utilidades y componentes de la web.
  - Las pruebas de API usan una **base de datos de pruebas separada** de la de desarrollo, en el mismo contenedor.
  - **Playwright** es una prueba adicional, solo si hay margen.
- Calidad de código: ESLint y Prettier; paquetes internos con prefijo `@repo/`.
- La web es la prioridad de tiempo y acabado. WebSockets es un plus condicionado a que lo obligatorio ya funcione.

## 2. Modelo de datos y reglas

### User

`id` UUID, `email` único, `passwordHash`, `role` (`ADMIN` o `CLIENT`), `createdAt`.

### VM

| Campo | Tipo y regla |
| --- | --- |
| `id` | UUID |
| `name` | Nombre normalizado |
| `nameKey` | Clave interna única, no expuesta en la API |
| `cores` | Entero, de 1 a 64 |
| `ram` | Entero en GB, de 1 a 512 |
| `disk` | Entero en GB, de 10 a 4096 |
| `os` | Valor de una lista permitida |
| `status` | `ON` u `OFF` |
| `createdAt`, `updatedAt` | Fechas |

- **Nombres del enunciado:** la API conserva `name`, `cores`, `ram`, `disk`, `os` y `status`. La interfaz muestra unidades explícitas.
- **Lista de `os`:** `Ubuntu`, `Debian`, `Windows Server` y `Rocky Linux`. Vive en `packages/contracts` y puede ampliarse sin cambiar el modelo.
- **Límites:** los rangos de la tabla son límites de producto propuestos, no del PDF.
- **Nombre de VM:**
  - **Caracteres permitidos:** letras Unicode (incluidas las acentuadas y `ñ`, con sus marcas combinables), dígitos, espacios y guion (`-`). Longitud de 3 a 50 caracteres después de normalizar.
  - **Normalización:** una función de `packages/contracts`, usada por la web, la API y el seed, aplica en este orden: Unicode **NFC**, recorte de espacios en los extremos y reducción de los espacios internos repetidos a uno solo. El valor normalizado es el que se valida, se guarda y se devuelve.
  - **Unicidad sin distinguir mayúsculas:** `nameKey` es el nombre normalizado en minúsculas.
    - `Web-01` y `WEB-01` chocan.
    - `José` y `Jose` son distintos, porque los acentos se conservan.
    - `José` escrito en forma descompuesta (NFD) choca con su forma compuesta tras NFC.
  - **Garantía en la base de datos:** restricción `UNIQUE` sobre `nameKey`, declarada en el esquema Prisma.
    - La API traduce su violación a `409`.
    - Solo el servicio de VMs y el seed escriben `nameKey`, con la misma función.
    - Se prefiere esta columna derivada frente a un índice por expresión `lower(name)` por dos motivos: Prisma la gestiona en sus migraciones sin desviaciones, y no depende del locale de PostgreSQL.
- **Gráficos:** muestran **recursos asignados**, es decir, la suma de `cores`, `ram` y `disk` de las VMs con `status=ON`. Supuesto: «VMs activas» del enunciado = encendidas. No se muestran porcentajes de utilización ni se inventa una capacidad total.
- **Visibilidad:** el CLIENT ve todas las VMs; no hay VMs propias de cada usuario.
- **Ediciones simultáneas:** gana la última escritura. Es una limitación documentada en el README.
- **Seed:** reproducible e idempotente, con al menos un ADMIN, un CLIENT y varias VMs en ambos estados. Las credenciales de demostración se documentan en el README y solo son válidas en local.

## 3. Contrato HTTP

Base pública desde la web: `/api`; la web la reenvía al servicio Fastify local. Las rutas de la API son:

| Método y ruta | Acceso | Resultado principal |
| --- | --- | --- |
| `POST /login` | Público | Establece la cookie; body `{ user: { id, email, role } }` sin JWT |
| `GET /me` | Autenticado | `{ user: { id, email, role } }` |
| `POST /logout` | Autenticado | Limpia la cookie; `204` |
| `GET /vms` | ADMIN, CLIENT | `{ items: VM[] }` |
| `POST /vms` | ADMIN | `201` + VM creada |
| `PUT /vms/:id` | ADMIN | `200` + VM actualizada |
| `DELETE /vms/:id` | ADMIN | `204` |
| `GET /health` | Público | `200 { status: 'ok' }`, o `503` si la base de datos no responde |

- **VM en respuestas:** `{ id, name, cores, ram, disk, os, status, createdAt, updatedAt }`, con fechas ISO 8601. `nameKey` no se expone.
- **Errores JSON:** `{ error: { code, message, details? } }`. El campo `code` es semántico (estable para el cliente); el status HTTP va aparte. Catálogo en `packages/contracts` (fase 02; la fase 03 añade códigos de VM):

  | `code` | Status | Cuándo |
  | --- | --- | --- |
  | `VALIDATION_ERROR` | 400 | Validación, incluido un `:id` que no es UUID |
  | `INVALID_CREDENTIALS` | 401 | Login con email o contraseña incorrectos (mismo mensaje en ambos) |
  | `UNAUTHENTICATED` | 401 | Sin sesión o JWT inválido/expirado |
  | `FORBIDDEN` | 403 | Rol insuficiente |
  | `ORIGIN_NOT_ALLOWED` | 403 | Cabecera `Origin` ajena en mutaciones |
  | `NOT_FOUND` | 404 | Ruta inexistente |
  | `VM_NOT_FOUND` | 404 | VM inexistente |
  | `VM_NAME_TAKEN` | 409 | Nombre duplicado según `nameKey` |
  | `CONFLICT` | 409 | Conflicto genérico (reservado) |
  | `RATE_LIMITED` | 429 | Exceso de intentos de login |
  | `INTERNAL_ERROR` | 500 | Falla inesperada, sin filtrar detalles internos |

- La API valida payloads y autorización aunque el frontend oculte los controles. La autorización se resuelve antes de validar el body.
- `PUT` se mantiene como pide el enunciado: acepta el objeto completo de VM editable y rechaza campos desconocidos o faltantes.
- No existe `GET /vms/:id`. La edición toma la VM de `GET /vms` y vuelve a consultar la lista si la caché está vacía, por ejemplo al abrir directamente o recargar `/vms/[id]/edit`.

## 4. Sesión y seguridad local

- **JWT:**
  - firmado, con vida de 8 h y sin *refresh token*, dentro de una cookie;
  - nunca se envía en JSON ni se guarda en el almacenamiento del navegador.
- **Login:**
  - si el email no existe, se verifica igualmente contra un hash ficticio, de modo que la respuesta es el mismo `401` que con una contraseña incorrecta;
  - límite de intentos en `POST /login`, que responde `429` al superarlo.
- **Cookie:**
  - atributos: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` y sin `Domain`;
  - **`Secure=true` es el objetivo y no se desactiva para declarar cumplido el requisito.**
- **Verificación de la cookie:**
  - La fase 02 comprueba que los navegadores objetivo aceptan la cookie `Secure` en `http://localhost`. Esos navegadores son Chrome, Edge y Firefox actuales.
  - Si alguno no la acepta, se plantea **HTTPS local** con un certificado de desarrollo, documentado en el README.
  - Cualquier otra excepción requiere aprobación humana explícita y queda registrada en la §8.
- **CSRF:**
  - La web usa `/api` bajo su mismo origen para evitar una configuración CORS abierta.
  - Fastify rechaza las mutaciones con una cabecera `Origin` ajena al origen configurado.
  - `SameSite` no es la única defensa CSRF.
- **Cabeceras y tamaño:** cabeceras de seguridad y límite de tamaño del body en la API.
- **Rol vigente:** cada petición autenticada recarga el usuario desde la base de datos, de modo que un usuario borrado o con el rol cambiado pierde los permisos de inmediato.
- **Sesión y escrituras:**
  - `GET /me` restaura la sesión tras una recarga;
  - `POST /logout` borra la cookie;
  - la API responde `403` a las escrituras de CLIENT aunque las llame directamente.
- **Secretos:** van en `.env`, ignorado por Git. `.env.example` documenta las variables con valores de desarrollo inocuos; no se publica un secreto de producción.

## 5. Pantallas y comportamiento visual

- **`/login`:** formulario, errores claros y redirección al dashboard al iniciar sesión.
- **`/dashboard`:**
  - resumen de VMs, panel de cores, RAM y disco de las VMs encendidas, y tarjetas de VMs;
  - las acciones de VM (crear, editar, eliminar, encender/apagar) son visibles solo para ADMIN; para CLIENT no existen en el DOM.
- **`/vms`:**
  - listado responsivo con estados de carga, vacío y error;
  - ADMIN ve alta, edición, eliminación y el botón rápido de encender/apagar;
  - CLIENT no ve esos controles.
- **Botón rápido de encender/apagar:** es un `PUT` con el objeto completo y solo existe para ADMIN.
- **`/vms/new` y `/vms/[id]/edit`:**
  - accesibles solo a ADMIN, con validación inmediata y mensajes de campo;
  - la edición funciona al abrir directamente y al recargar (ver §3).
- **Tema:**
  - oscuro por defecto y modo claro mediante un selector; la calidad del tema oscuro es prioritaria;
  - ambos temas cumplen contraste WCAG AA;
  - la preferencia se guarda en el navegador (no es un dato sensible) y se aplica antes del primer pintado.
- **Identidad:**
  - nombre de producto neutral; propuesta inicial «VM Console», ajustable en la fase 04;
  - paleta inspirada en la referencia de IFX (fondo azul profundo, acentos azul eléctrico y cian), con superficies legibles y contraste suficiente. Los colores son guía visual, no un sistema de marca oficial;
  - no se reconstruye ni se presenta ningún logo como oficial.
- **Idioma:** la interfaz está en español. Los enums de la API, en inglés, se muestran como «Administrador»/«Cliente» y «Encendida»/«Apagada».
- **Interacciones:** toasts de éxito y error, skeletons, confirmación antes de eliminar, foco visible y navegación por teclado.
- **UI optimista para crear, actualizar y eliminar:** se muestra el resultado antes de la respuesta, se conserva el estado previo, se revierte ante un error y se reconcilia con el servidor tras el éxito.
  - **Alta fallida:** se retira el elemento provisional y se conservan en memoria los datos del formulario para reintentar.
  - **Actualización fallida:** se restaura la versión previa del elemento.
  - **Borrado fallido:** el elemento se reinserta en su posición.
  - **Borrado con `404`** (la VM ya no existe): no se reinserta; se vuelve a consultar `GET /vms` y se muestra un aviso informativo, sin dejar una VM fantasma.
  - La reversión se aplica por elemento y no restaurando una instantánea completa, para no deshacer mutaciones concurrentes.
  - Tras mutación con éxito se invalida `['vms']` solo si no quedan otras mutaciones de VMs en vuelo. Tras error no se invalida: la caché ya revirtió el elemento afectado y un refetch fallido (API caída) no debe vaciar el listado.

## 6. Tiempo real (plus)

- **Alcance:** sincronizar los **cambios de estado** (`status`) hechos por un ADMIN, como pide el plus. Las altas, las bajas y las ediciones sin cambio de estado no se difunden en tiempo real; se ven al volver a consultar.
- **Servidor:** si se implementa, Socket.IO vive en `apps/api` y autentica la conexión con la misma cookie y con un `Origin` permitido.
- **Evento:** tras persistir un `PUT` que cambia `status`, se emite `vm:updated` con la VM completa. Los clientes actualizan su caché y resaltan brevemente la tarjeta afectada.
- **Reconexión:** al reconectar, se vuelve a consultar `GET /vms` para recuperar los eventos perdidos. No se debe duplicar un cambio optimista recibido después por el socket.
- **Transporte (fase 08):** conexión **directa** del navegador a `NEXT_PUBLIC_API_URL` (p. ej. `http://localhost:4000`). Los rewrites de Next solo cubren `/api/:path*` y no proxifican el *upgrade* de `/socket.io`. Socket.IO usa `cors.origin = WEB_ORIGIN` (un único origen) y `withCredentials`; la cookie de sesión sin `Domain` se envía a `localhost` en cualquier puerto (`SameSite=Lax`).

## 7. Fases y verificación

- Los planes de cada fase viven en `docs/phases/` y se enlazan desde `PLAN.md`. Citan este documento y el enunciado, y definen dependencias, pasos, criterios de aceptación y comprobaciones.
- Ninguna fase se da por terminada solo porque compile. Hay que comprobar el flujo con ADMIN y CLIENT, los errores de la API, la recarga de sesión y la vista móvil cuando aplique.
- **Obligatorio en cada fase pertinente:** la verificación manual con ambos roles y las pruebas de API. Playwright es adicional.
- **Bitácora de IA:** `docs/BITACORA_IA.md` resume las herramientas y el trabajo delegado e incluye instrucciones de alcance por módulo, sin transcribir mensajes personales de autorización. El README final se nutre de la bitácora y de la evidencia de cada fase. No se inventan ejecuciones de skills ni resultados de pruebas.
- **Repositorio:** el proveedor, la visibilidad y la URL se deciden en la fase 09. No se publica antes de esa decisión.

## 8. Registro de decisiones

| Fecha | Cambio | Origen |
| --- | --- | --- |
| 2026-10-19 | Transporte Socket.IO: conexión directa a la API (`NEXT_PUBLIC_API_URL`) con CORS/`Origin` = `WEB_ORIGIN`; Next no proxifica `/socket.io` | Spike fase 08 |
| 2026-10-19 | Invalidación de `['vms']` solo tras mutación exitosa (no tras error), para no vaciar el listado si la API está caída | Fase 07, verificación de rollback de red |
| 2026-10-19 | Cierre de la fase 02 con prueba del middleware de roles en una ruta exclusiva de test; el `403` real sobre `/vms` se cierra en la fase 03 | Revisión humana de los planes |
| 2026-10-19 | `Secure=true` como objetivo; HTTPS local si el navegador objetivo no la acepta; nunca desactivarla en silencio. Sustituye la excepción `Secure=false` anterior | Revisión humana |
| 2026-10-19 | Tema oscuro por defecto con modo claro; acciones del dashboard y botón de encender/apagar solo para ADMIN; reglas, normalización y unicidad de nombres; reversión de altas con datos conservados y `404` en borrado sin fantasmas; tiempo real limitado a cambios de estado; edición robusta ante recarga | Revisión humana |
| 2026-10-19 | TanStack Query, react-hook-form, Tailwind, Recharts, argon2id y Vitest; Radix, sonner y lucide solo donde aporten; base de pruebas separada; `GET /health`; límite de intentos de login; rol vigente consultado en la base de datos; Playwright opcional | Revisión humana |
| 2026-10-19 | El CLIENT ve todas las VMs; interfaz en español; gana la última escritura; nombre de producto neutral sin logo oficial; instrucciones de alcance por fase en la Bitácora; publicación del repositorio pendiente para la fase 09 | Revisión humana |
| 2026-10-19 | Detalles técnicos registrados para cumplir las decisiones anteriores: columna `nameKey` con `UNIQUE`; normalización NFC con recorte y reducción de espacios; JWT de 8 h; verificación contra un hash ficticio; código `429`; `503` en `/health`; navegadores objetivo Chrome, Edge y Firefox; ESLint y Prettier; prefijo `@repo/` | Decisión propia registrada; revisable |
| 2026-10-19 | Códigos de error JSON pasan de números tipo HTTP (`400`) a códigos semánticos (`VALIDATION_ERROR`, etc.), alineados con el plan de la fase 02. El status HTTP sigue siendo numérico en la respuesta | Implementación fase 02; revisable |
| 2026-10-19 | Códigos `VM_NOT_FOUND` y `VM_NAME_TAKEN` para el CRUD de VMs | Implementación fase 03 |
