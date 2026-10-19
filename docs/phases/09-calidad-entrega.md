# Fase 09 — Calidad final, documentación y entrega

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** 01–07, y [08](08-tiempo-real.md) si se realiza. Se prepara durante todo el proyecto: cada fase deja evidencia en su «Registro de evidencia».

## 1. Objetivo, alcance y exclusiones

**Objetivo:** que el evaluador clone el repositorio, lo levante desde cero siguiendo solo el README, entre como Administrador y como Cliente, y compruebe cada requisito. Y que la documentación diga únicamente lo que de verdad funciona.

**Entrega:**

- `README.md` completo.
- Diagrama de arquitectura.
- Resumen de decisiones y de la estructura de carpetas del frontend.
- Bitácora de IA veraz.
- Pasada final de calidad (pruebas, build, revisión visual y de accesibilidad).
- Recorrido integral con ambos roles.
- Publicación del repositorio, con aprobación humana.

**Exclusiones:**

- Funcionalidad nueva. Si la verificación revela un fallo, se corrige en la fase de origen y se vuelve aquí.
- Despliegue en la nube: la evaluación es local.

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 4 › 1](../ENUNCIADO_PRUEBA.md) | URLs accesibles de los repositorios (monorepo permitido) | Paso 9 |
| [Enunciado › Parte 4 › 2](../ENUNCIADO_PRUEBA.md) | Guía de despliegue local paso a paso desde cero | Pasos 1 y 7 |
| [Enunciado › Parte 4 › 2](../ENUNCIADO_PRUEBA.md) | Credenciales de prueba Administrador y Cliente, o script de seed | Paso 1 |
| [Enunciado › Parte 4 › 3](../ENUNCIADO_PRUEBA.md) | Diagrama de la interacción Cliente–API–Real-Time | Paso 2 |
| [Enunciado › Parte 4 › 3](../ENUNCIADO_PRUEBA.md) | Decisiones arquitectónicas y estructura de carpetas del frontend | Paso 3 |
| [Enunciado › Parte 4 › 4](../ENUNCIADO_PRUEBA.md) | «Bitácora de IA»: herramientas, delegación e intervención, 1–2 prompts clave | Paso 4 |
| [Enunciado › Nota sobre IA](../ENUNCIADO_PRUEBA.md) | Se evalúa guiar la IA hacia arquitectura escalable, código limpio y alta fidelidad | Pasos 4–6 |
| [DECISIONES §4](../DECISIONES.md) | Cookie siempre `Secure`; el README explica HTTPS local si la fase 02 lo adoptó | Paso 1 |
| [DECISIONES §2, §5 y §6](../DECISIONES.md) | Limitaciones documentadas: gana la última escritura, tiempo real solo para cambios de estado, borrador de alta en memoria | Pasos 1–2 |
| [DECISIONES §7](../DECISIONES.md) | Verificación manual con ambos roles y pruebas de API obligatorias, Playwright adicional; instrucciones de alcance en `BITACORA_IA.md`; publicación del repositorio pendiente de decisión | Pasos 4, 5 y 9 |
| [DECISIONES §7](../DECISIONES.md) | No cerrar solo porque compile; ADMIN y CLIENT, errores, recarga y móvil | Pasos 5–7 |
| [PLAN.md](../PLAN.md) | Bitácora con prompts **reales**, nunca reconstruidos | Paso 4 |

## 3. Dependencias y contratos

- **Entradas:**
  - el borrador del README de [01](01-infraestructura.md);
  - la colección `curl` de [03](03-api-vms.md);
  - la estructura de [04](04-shell-rutas.md);
  - el archivo de diseño con la paleta de [04](04-shell-rutas.md);
  - el resultado del spike de [02](02-autenticacion.md) (cookie `Secure`) y de [08](08-tiempo-real.md) (transporte);
  - los «Registros de evidencia» de todas las fases.
- **Fuente de la Bitácora:** [`docs/BITACORA_IA.md`](../BITACORA_IA.md) para herramientas, alcance y resultados, junto con los registros de evidencia de cada fase. Si un prompt no se conservó, **no se reescribe de memoria**: se elige otro que sí exista.
- **Salida:** el README del repositorio raíz y `PLAN.md` actualizado solo con evidencia.

## 4. Secuencia de implementación

1. **README: uso.** Estructura:
   1. qué es;
   2. requisitos previos con versiones;
   3. instalación limpia paso a paso, probada en Windows (PowerShell) e indicando equivalentes POSIX;
   4. variables de entorno;
   5. scripts;
   6. credenciales de seed (solo para uso local);
   7. recorrido de evaluación por rol;
   8. notas de seguridad: atributos de la cookie (siempre `Secure`), navegadores verificados, defensa de `Origin`, límite de intentos, por qué no hay token en el body ni en `localStorage` y la configuración de HTTPS local, si la fase 02 la adoptó;
   9. supuestos y reglas: «activas» = `ON`, límites de validación, normalización y unicidad de nombres, el CLIENT ve todas las VMs;
   10. limitaciones conocidas: gana la última escritura, el tiempo real cubre solo cambios de estado, y el borrador de un alta fallida se pierde al recargar.
2. **Diagrama** en Mermaid dentro del README, para que se renderice en el proveedor Git; si no, en SVG.
   - Componentes: navegador (Next.js SPA) → `/api` (proxy de Next) → Fastify (REST, auth, autorización) → PostgreSQL (Prisma).
   - Canal Socket.IO de Fastify a los navegadores, con la cookie en el *handshake* y solo el evento `vm:updated` por cambio de estado.
   - Secuencia breve de login y cookie, y de mutación optimista con su difusión.
   - Si [08](08-tiempo-real.md) no se implementó, el canal se marca explícitamente como «no implementado (plus)».
3. **Decisiones arquitectónicas.**
   - Hacer: un resumen breve de por qué este stack, con enlace a [DECISIONES.md](../DECISIONES.md); la estructura de carpetas de `apps/web/src` y su razón (rutas finas, `features/` por dominio, primitivas en `components/ui`); y el estado global (TanStack Query como estado del servidor, la sesión en la misma caché, sin store adicional).
   - Resultado observable: un evaluador entiende la estructura sin abrir el código.
4. **Bitácora de IA.**
   - Herramientas realmente usadas: Claude Code con el modelo empleado y las skills **efectivamente ejecutadas**, según `BITACORA_IA.md` y los registros de evidencia.
   - Qué se delegó y dónde intervino una persona: decisiones de seguridad, correcciones, rechazos de propuestas. Tomarlo de los registros.
   - 1–2 prompts clave **literales**, con su contexto y lo que se corrigió después.
   - Resultado observable: cada afirmación de la Bitácora tiene respaldo en un registro.
5. **Calidad automatizada.**
   - Hacer: `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` en verde. Las pruebas de API de 02 y 03 son obligatorias.
   - Adicional, solo si hay margen: un *smoke* E2E con Playwright (login de ambos roles, ausencia de acciones para CLIENT y reversión optimista con `page.route`). No sustituye el recorrido manual de §5.
   - Resultado observable: salidas anotadas.
6. **Revisión visual final** con `impeccable` (`audit`, `critique` o `polish` en una tanda acotada, según su SKILL.md) y `ui-ux-pro-max` para comprobar accesibilidad y responsive, sobre login, dashboard, listado y formularios en 390 px y 1440 px.
   - Resultado observable: hallazgos y correcciones registrados. Solo se declaran las skills realmente ejecutadas.
7. **Recorrido integral desde cero** en un clon nuevo, en otra carpeta y con la base de datos vacía, siguiendo solo el README. Ver §5.
   - Resultado observable: el checklist de §5 completo y anotado.
8. **Higiene de seguridad.**
   - Hacer: confirmar con `git ls-files` que `.env` no está versionado y buscar secretos en el historial. Comprobar que `.env.example` solo tiene valores inocuos y que los logs no imprimen cookies ni contraseñas.
   - Resultado observable: sin hallazgos.
9. **Repositorio.**
   - Hacer:
     1. inicializar Git localmente, porque hoy el directorio no es un repositorio, y hacer commits con mensajes claros;
     2. **presentar la decisión pendiente** de proveedor, visibilidad y nombre;
     3. solo con esa decisión tomada y el `push` autorizado, crear el remoto y verificar que la URL es accesible para el evaluador.
   - Resultado observable: la URL del repositorio clona correctamente desde otra ubicación. **Antes de esa decisión no se publica nada.**
10. **Cierre del plan:** actualizar `PLAN.md` con el estado y la evidencia de cada fase.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Registrar las ejecuciones reales abajo.

Checklist del recorrido integral, con resultado anotado en cada punto:

- [ ] Clon limpio, instalación, base de datos, migración, seed y arranque siguiendo solo el README.
- [ ] **ADMIN:**
  - login;
  - dashboard con totales correctos (comprobados con SQL);
  - crear, editar, encender/apagar y eliminar;
  - validación en tiempo real;
  - reversión ante un fallo forzado en las tres operaciones;
  - toasts, skeletons y estado vacío.
- [ ] **CLIENT:**
  - login;
  - ve el dashboard y el listado;
  - ningún control de escritura en el DOM;
  - `/vms/new` redirige;
  - `curl` de `POST`, `PUT` y `DELETE` con su cookie devuelve `403`.
- [ ] **Sesión:**
  - recarga conservada;
  - logout;
  - acceso privado sin sesión redirigido;
  - token ausente de JSON y del almacenamiento del navegador;
  - atributos de la cookie revisados.
- [ ] **API:** casos 400, 401, 403, 404 y 409 de la colección manual.
- [ ] **Responsive y accesibilidad:** 390 px y 1440 px; teclado; contraste; `prefers-reduced-motion`.
- [ ] **Tiempo real** (si aplica): dos sesiones, resaltado y reconexión.
- [ ] **Documentación:** el diagrama coincide con lo implementado; la Bitácora tiene respaldo; las credenciales funcionan.

## 6. Criterios de aceptación

- [ ] Una instalación desde un clon limpio funciona siguiendo solo el README, y quedó registrada.
- [ ] El README contiene guía local, credenciales de ADMIN y CLIENT, diagrama, decisiones y estructura del frontend, notas de seguridad, supuestos y limitaciones.
- [ ] La Bitácora de IA nombra las herramientas realmente usadas, la delegación y la intervención humana, y 1–2 prompts literales con respaldo.
- [ ] `typecheck`, `lint`, `test` y `build` en verde, con la salida registrada.
- [ ] El recorrido integral de §5 está completo para ambos roles.
- [ ] El repositorio es accesible por URL y no contiene secretos.
- [ ] `PLAN.md` refleja el estado real de cada fase, con su evidencia.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| **Publicación del repositorio** | El enunciado pide URLs accesibles; publicar es una acción externa | Preparar todo en local; la persona decide proveedor, visibilidad y nombre (y con ello la URL), y autoriza el `push` | **Sí: decisión pendiente para esta fase** |
| Prompts reales | Si no se guardan durante el proyecto, la Bitácora no podrá incluirlos con veracidad | Documentar instrucciones de alcance en `BITACORA_IA.md` sin transcribir mensajes personales | Resuelto ([DECISIONES §7](../DECISIONES.md)) |
| Playwright | Aporta evidencia repetible, pero consume tiempo | *Smoke* mínimo solo si 01–07 cierran con margen | Resuelto ([DECISIONES §1 y §7](../DECISIONES.md)) |
| Diagrama sin tiempo real | El enunciado pide mostrar el servicio de tiempo real | Diagramarlo como plus no implementado, sin presentarlo como funcional | No |

## Registro de evidencia

### 2026-10-19 — Cierre fase 09

**Quality gates**

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | OK (contracts + api + web) |
| `pnpm lint` | OK |
| `pnpm test` | OK — contracts 10, api 24, web 17 |
| `pnpm build` | OK — Next.js 15.5.28, rutas `/login` `/dashboard` `/vms` `/vms/new` `/vms/[id]/edit` |

**README / docs**

- `README.md` reescrito: instalación PowerShell/POSIX, credenciales, recorrido por rol, Mermaid (REST + Socket.IO), estructura `apps/web/src`, Bitácora, limitaciones.
- HTTPS local **no** adoptado: cookie `Secure` aceptada en `http://localhost` (fase 02).

**Skills realmente ejecutadas**

- `impeccable context` (cwd `apps/web`) + `impeccable detect --json` → `[]`.
- CLI `impeccable audit` / `critique` / `polish`: **no disponibles** en el launcher (`Unknown command: audit`); revisión visual hecha en navegador Cursor (390 px y 1440 px).
- `ui-ux-pro-max`: `py -3 …/search.py "keyboard focus contrast responsive" --domain ux` (6 reglas a11y/foco/contraste).

**Recorrido (navegador Cursor + API)**

- SQL ON: `cores=28`, `ram=76`, `disk=1020` → dashboard ADMIN/CLIENT muestra 28 / 76 / 1020; tras encender `backup-cold-01`: Encendidas 8, RAM 78 GB, disco 2020 GB.
- **CLIENT:** sin Nueva/Editar/Eliminar/Encender en DOM; `/vms/new` → `/vms`; `POST`/`PUT`/`DELETE /vms` → `403`; indicador «En vivo».
- **ADMIN:** login, «Nueva VM», toggle pendiente→OK, KPIs actualizados, «En vivo».
- **Sesión:** logout → `/login`; cookie `session` con `HttpOnly; Secure; SameSite=Lax; Path=/`; body de login sin token; `/me` y `/vms` sin cookie → `401`.
- **API:** login inválido → `400 VALIDATION_ERROR`; sin sesión → `401`.
- **Responsive:** 390 px (nav inferior / cabecera compacta) y 1440 px OK; `prefers-reduced-motion` en `apps/web/src/styles/globals.css`.
- Optimista forzado (409/404/red) y empty state: evidencia de fases 05–07; no se reabrió Playwright.

**Higiene**

- `git check-ignore -v .env` → ignorado; `.env` no versionado.
- `.env.example` solo valores de desarrollo.
- Logger Fastify con `redact` de cookie / `set-cookie` / `password`.

**Git / publicación**

- `git init` + commits locales: `6ee8103` (entrega inicial), `d33e179` (`prisma generate` en `postinstall` / `db:migrate`; elimina `debug-socket.ts`).
- Clon limpio en `%TEMP%\ifx-clean-clone2`: `pnpm install` (postinstall genera cliente), `pnpm db:seed` OK, `pnpm typecheck` OK.
- Hallazgo corregido: sin `prisma generate`, el seed del clon fallaba; quedó en el flujo de install/migrate.
- **URL remota:** pendiente — decidir proveedor, visibilidad y nombre; **no hay `push`**.

### Checklist §5 (anotado)

- [x] Clon limpio / instalación según README (local; remoto pendiente).
- [x] ADMIN: login, KPIs=SQL, toggle; CRUD/validación/optimistic cubiertos en 05–07.
- [x] CLIENT: dashboard+listado, sin escritura DOM, `/vms/new` redirige, API `403`.
- [x] Sesión: logout, 401 sin cookie, cookie Secure, sin token en JSON.
- [x] API 400/401/403 (+ 404/409 en suite de tests).
- [x] Responsive 390/1440; reduced-motion en CSS.
- [x] Tiempo real: «En vivo» en ambos roles; cambio de status actualiza KPIs.
- [x] Documentación README + Bitácora alineada.

### Criterios §6

- [x] README completo y gates en verde.
- [x] Bitácora con instrucciones de alcance y resultados respaldados por la evidencia de las fases.
- [x] Recorrido ambos roles.
- [x] Sin secretos en Git; **URL pública pendiente de decisión humana** (no bloquea el cierre local acordado en DECISIONES §7).
- [x] `PLAN.md` actualizado.
