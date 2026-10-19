# Fase 01 — Infraestructura, base de datos y seed

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** — · **Habilita:** [02-autenticacion](02-autenticacion.md), [03-api-vms](03-api-vms.md), [04-shell-rutas](04-shell-rutas.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** un monorepo que cualquier evaluador pueda levantar desde cero en su máquina: dependencias instaladas, PostgreSQL en Docker, migración aplicada, datos de demostración cargados y web y API respondiendo.

**Entrega:**

- Workspace pnpm con `apps/web`, `apps/api` y `packages/contracts`, scripts raíz multiplataforma y TypeScript estricto.
- `packages/contracts` con los esquemas Zod base de VM, enumeraciones y forma de error compartida.
- Docker Compose con PostgreSQL y healthcheck.
- Esquema Prisma (`User`, `Vm`), migración inicial y seed idempotente con ADMIN, CLIENT y VMs en ambos estados.
- Esqueleto Fastify con `GET /health` y configuración validada al arrancar.
- Esqueleto Next.js (App Router) con el proxy `/api` hacia Fastify.
- `.env.example` y un borrador de la sección «Puesta en marcha» del README.

**Exclusiones:**

- Login, cookie, JWT y guardas → [02](02-autenticacion.md). Esta fase solo deja lista la utilidad de hash para el seed.
- Endpoints `/vms` → [03](03-api-vms.md).
- Diseño visual, tokens y layout → [04](04-shell-rutas.md).
- README final → [09](09-calidad-entrega.md).

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 4 › 2](../ENUNCIADO_PRUEBA.md) | Guía de despliegue local paso a paso | Secuencia reproducible y borrador del README |
| [Enunciado › Parte 4 › 2](../ENUNCIADO_PRUEBA.md) | Usuario Administrador y Cliente preconfigurados o script de seed | Seed idempotente con ambos roles |
| [Enunciado › Parte 2 › 2](../ENUNCIADO_PRUEBA.md) | Campos de VM: `name, cores, ram, disk, os, status` | Modelo Prisma y esquemas Zod |
| [Enunciado › Parte 4 › 1](../ENUNCIADO_PRUEBA.md) | Repositorio o monorepo | Monorepo pnpm |
| [DECISIONES §1](../DECISIONES.md) | pnpm workspaces, Next.js, Fastify, Zod, PostgreSQL con Docker Compose y Prisma | Estructura y herramientas de esta fase |
| [DECISIONES §2](../DECISIONES.md) | Modelo `User` y `VM`, límites de validación, lista `os`, seed con ambos roles y estados | Esquema, contratos y seed |
| [DECISIONES §3](../DECISIONES.md) | Base `/api` reenviada a Fastify | Rewrite de Next hacia la API |
| [DECISIONES §4](../DECISIONES.md) | Secretos en `.env` ignorado; `.env.example` con valores inocuos | Configuración y `.gitignore` |
| [DECISIONES §2](../DECISIONES.md) | Normalización del nombre (NFC, recorte, espacios) y unicidad sin distinguir mayúsculas mediante `nameKey` con `UNIQUE` | Pasos 3, 6 y 7 |
| [DECISIONES §1, §3 y §8](../DECISIONES.md) | Vitest con base de pruebas separada, argon2id, `GET /health`, ESLint y Prettier, prefijo `@repo/` | Pasos 2, 3, 7 y 8 |

## 3. Dependencias y contratos

- **Entradas:** ninguna fase previa. Requiere Node LTS, Corepack/pnpm y Docker Desktop en la máquina.
- **Salidas para fases siguientes:**
  - `@repo/contracts` exporta:
    - `ROLES` (`ADMIN`, `CLIENT`), `VM_STATUSES` (`ON`, `OFF`) y `VM_OS_OPTIONS` (`Ubuntu`, `Debian`, `Windows Server`, `Rocky Linux`);
    - `normalizeVmName` (NFC, recorte y reducción de espacios) y `vmNameKey` (nombre normalizado en minúsculas), según [DECISIONES §2](../DECISIONES.md);
    - `vmInputSchema` con los límites de [DECISIONES §2](../DECISIONES.md), que normaliza `name` antes de validarlo;
    - `vmSchema`, la VM de respuesta con fechas ISO;
    - `apiErrorSchema` (`{ error: { code, message, details? } }`) y los tipos inferidos.
  - `apps/api` expone `buildApp()`, una fábrica de la app sin `listen`, para que las pruebas usen `inject`. También expone `config` validado con Zod.
  - Base de datos migrada y con datos de seed.
  - Proxy `GET http://localhost:3000/api/*` → `http://localhost:4000/*`.
- **Variables de entorno:**

  | Variable | Uso |
  | --- | --- |
  | `DATABASE_URL` | Conexión a PostgreSQL |
  | `DATABASE_URL_TEST` | Base de pruebas separada |
  | `JWT_SECRET` | Firma del JWT (≥ 32 caracteres) |
  | `JWT_EXPIRES_IN` | Vida del token (8 h) |
  | `WEB_ORIGIN` | Origen permitido de la web (`https://` si se adopta HTTPS local en [02](02-autenticacion.md)) |
  | `API_PORT` | Puerto de la API |
  | `API_INTERNAL_URL` | URL de la API usada por Next |
  | `POSTGRES_*` | Credenciales del contenedor |
  | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credenciales del ADMIN de demostración |
  | `SEED_CLIENT_EMAIL` / `SEED_CLIENT_PASSWORD` | Credenciales del CLIENT de demostración |

  Las variables de JWT se definen aquí, pero se consumen en [02](02-autenticacion.md). No hay una variable para desactivar `Secure`: la cookie siempre es `Secure` ([DECISIONES §4](../DECISIONES.md)).
- **Modelo:** el que fija [DECISIONES §2](../DECISIONES.md).
  - `os` se guarda como `String` y se valida con Zod, de modo que la lista puede crecer sin migración.
  - `role` y `status` son enums de Prisma.
  - `nameKey String @unique` es la garantía de unicidad en la base de datos y no se expone en la API.

## 4. Secuencia de implementación

1. **Prerrequisitos fijados.**
   - Hacer: añadir `.nvmrc` y `engines`, y el campo `packageManager` para Corepack.
   - Resultado observable: `node -v` y `pnpm -v` coinciden con lo documentado.
2. **Workspace raíz.**
   - Archivos: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` (strict), `.gitignore` (`.env`, `node_modules`, `.next`, `dist`, artefactos de Prisma si aplica), `.editorconfig` y configuración ESLint + Prettier.
   - Resultado observable: `pnpm install` termina sin errores.
3. **`packages/contracts`.**
   - Hacer: crear los esquemas y tipos listados en §3, sin dependencias de servidor, y tests unitarios de:
     - límites: `cores` 0/1/64/65, `ram` negativa, `disk` 9/10/4096/4097, nombres de 2, 3, 50 y 51 caracteres y caracteres inválidos;
     - normalización: `"  Ñandú   01 "` → `"Ñandú 01"`; `José` en NFD → NFC;
     - claves: `vmNameKey("WEB-01") === vmNameKey("web-01")` y `vmNameKey("José") !== vmNameKey("Jose")`.
   - Resultado observable: `pnpm --filter @repo/contracts test` en verde.
4. **Docker Compose.**
   - Hacer: servicio `db` con versión mayor de PostgreSQL fijada, volumen nombrado, healthcheck `pg_isready` y puerto configurable.
   - Resultado observable: `docker compose up -d db` queda en estado *healthy*.
5. **Configuración.**
   - Hacer: crear `.env.example` y `apps/api/src/config.ts`, que valida con Zod y falla al arrancar si falta algo.
   - Resultado observable: sin `.env`, la API se detiene con un mensaje que nombra la variable que falta.
6. **Prisma.**
   - Hacer: escribir `apps/api/prisma/schema.prisma` con `User` y `Vm`, `nameKey` con `@unique`, UUID y timestamps automáticos, y crear la migración inicial.
   - Resultado observable: `pnpm db:migrate` crea las tablas, y la migración contiene el índice único sobre `nameKey`.
7. **Utilidad de hash y seed.**
   - Hacer: crear `apps/api/src/auth/password.ts`, que envuelve argon2id y que reutilizará [02](02-autenticacion.md), y `apps/api/prisma/seed.ts`. El seed:
     - crea por upsert 1 ADMIN y 1 CLIENT;
     - crea unas 10–12 VMs mezclando `ON`/`OFF` y los cuatro SO;
     - valida cada VM con `vmInputSchema` y calcula `nameKey` con `vmNameKey`, la misma función que usará la API;
     - incluye al menos un nombre con acento o `ñ`.
   - Resultado observable: `pnpm db:seed` ejecutado dos veces deja los mismos conteos.
8. **Esqueleto API.**
   - Hacer:
     - crear `apps/api/src/app.ts` (`buildApp`) y `server.ts`;
     - configurar el logger con redacción de `cookie`, `set-cookie` y `password`;
     - añadir `GET /health`, que responde 200 con DB accesible y 503 si no lo está.
   - Resultado observable: `curl http://localhost:4000/health` devuelve 200.
9. **Esqueleto web.**
   - Hacer:
     - crear `apps/web` con App Router y TypeScript;
     - en la configuración de Next, añadir el rewrite `/api/:path*` → `${API_INTERNAL_URL}/:path*` y `transpilePackages` para `@repo/contracts`;
     - crear una página temporal.
   - Resultado observable: `http://localhost:3000/api/health` responde 200 a través del proxy.
10. **Scripts raíz.**
    - Hacer: crear `dev` (web y API en paralelo), `build`, `typecheck`, `lint`, `test`, `db:up`, `db:migrate`, `db:seed` y `db:reset`. Deben funcionar en PowerShell y en shells POSIX, sin `&&` dependiente del shell ni rutas sin comillas.
    - Resultado observable: la secuencia completa funciona en Windows.
11. **Borrador del README.**
    - Hacer: escribir la sección «Puesta en marcha local» solo con los comandos ya reproducidos.
    - Resultado observable: otra persona puede seguirla sin preguntar.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Las ejecuciones reales se anotan en el «Registro de evidencia».

- **Instalación limpia:**
  1. Borrar `node_modules`, `.next`, `dist` y el volumen de Docker.
  2. Copiar `.env.example` a `.env` y ejecutar `pnpm install`, `pnpm db:up`, `pnpm db:migrate`, `pnpm db:seed` y `pnpm dev`.
  3. Comprobar que `/health` responde directamente y a través de `/api`.
- **Seed:**
  - Debe existir exactamente 1 ADMIN y 1 CLIENT, y VMs en ambos estados.
  - Si se repite el seed, no hay duplicados ni errores.
  - El hash de las contraseñas no es texto plano.
- **Errores de entorno:**
  - Docker detenido → mensaje claro.
  - Puerto 5432 ocupado → se documenta cómo cambiarlo.
  - Falta una variable → la API no arranca.
- **Calidad:** `pnpm typecheck`, `pnpm lint` y `pnpm test` (contratos) en verde.
- **Base de pruebas:** crear y migrar la base de `DATABASE_URL_TEST`, y comprobar que reiniciarla no altera los datos de desarrollo.
- **Garantía de unicidad:** insertar a mano con `psql` dos filas con el mismo `nameKey` falla por la restricción.
- **Entorno real del usuario:** repetir el arranque en esta máquina Windows. La ruta del repositorio contiene espacios («B4N3D or Banned», «SOFTWARE DEVELOPMENT»), y eso debe funcionar.

## 6. Criterios de aceptación

- [x] Instalación limpia reproducida de principio a fin en Windows siguiendo solo el borrador del README.
- [x] `docker compose` levanta PostgreSQL *healthy* y la migración inicial se aplica sin intervención manual.
- [x] El seed es idempotente y crea ADMIN, CLIENT y al menos 3 VMs `ON` y 3 `OFF` válidas según `vmInputSchema`.
- [x] `@repo/contracts` se importa desde web y API sin arrastrar código de servidor, y sus tests de límites pasan.
- [x] La API no arranca con configuración inválida, y `/health` responde por el puerto directo y por `/api`.
- [x] `.env` está ignorado por Git (entrada en `.gitignore`), y `.env.example` contiene solo valores de desarrollo inocuos. *(El directorio aún no es un repositorio Git; la regla de ignore queda lista.)*
- [x] La base de pruebas separada existe y se puede reiniciar sin tocar la de desarrollo.
- [x] La restricción `UNIQUE` sobre `nameKey` existe en la base de datos y las funciones de normalización tienen pruebas.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| Ruta con espacios en Windows | Scripts, Prisma o Docker pueden romperse con espacios | Comillas en todos los scripts y probar en esta ruta exacta | No — verificado en esta máquina |
| Puerto 5432 ocupado | PostgreSQL local en conflicto | Puerto configurable con `POSTGRES_PORT`, documentado | No |
| Consumo de `@repo/contracts` | Fuente TS directa o paquete compilado | Fuente TS + `transpilePackages`; Next necesita `resolve.extensionAlias` para imports `.js` → `.ts` | No — resuelto en `apps/web/next.config.ts` |
| Base de pruebas | Las pruebas de 02 y 03 no deben tocar los datos de demostración | Segunda base en el mismo contenedor (`DATABASE_URL_TEST`), reiniciada antes de la suite | Resuelto ([DECISIONES §1](../DECISIONES.md)) |
| Instalación de argon2id en Windows | Un módulo nativo puede fallar al instalarse | `@node-rs/argon2` con binarios precompilados | No — instaló y hasheó correctamente |
| Normalización Unicode | Que web, API y seed normalicen de forma distinta y dejen pasar duplicados | Una sola función en `@repo/contracts`, probada | No |
| Credenciales de demostración | Emails y contraseñas del seed | `admin@demo.local` y `cliente@demo.local` con contraseñas de desarrollo en `.env.example`, válidas solo en local | No (ajustable) |
| Corepack en Windows | `corepack enable` falló con `EPERM` al escribir en `Program Files` | Usar pnpm global ya instalado (`10.26.2`), fijado en `packageManager` | No |

## Registro de evidencia

Fecha: **2026-10-19**. Entorno: Windows 10, Node `v24.21.0`, pnpm `10.26.2`, Docker `29.8.0` / Compose `v5.5.1`. Ruta con espacios. Alcance del encargo en [BITACORA_IA.md](../BITACORA_IA.md), fase 01.

| Paso | Comando / procedimiento | Resultado |
| --- | --- | --- |
| Instalación | `Copy-Item .env.example .env`; `pnpm install` | OK. pnpm 10 bloqueó scripts nativos hasta declarar `pnpm.onlyBuiltDependencies` (Prisma, esbuild). |
| Docker | `pnpm db:up`; healthcheck | Contenedor `ifx-postgres` *healthy* en puerto 5432. |
| Migración | `pnpm --filter @repo/api db:migrate:dev -- --name init --skip-seed` | Creó `apps/api/prisma/migrations/20261019165224_init` con `UNIQUE INDEX "Vm_nameKey_key"`. |
| Seed ×2 | `pnpm db:seed` dos veces | Ambos: `ADMIN:1`, `CLIENT:1`, `vms.total:12`, `ON:7`, `OFF:5`. Sin duplicados. |
| Hashes | Lectura de `User.passwordHash` | Prefijo `$argon2…`; no texto plano. |
| Contratos | `pnpm --filter @repo/contracts test` | 10 tests en verde (límites, NFC, `vmNameKey`). |
| Calidad | `pnpm typecheck`; `pnpm lint`; `pnpm test` | En verde tras ajustar ignore de `next-env.d.ts` y `rootDir` de contracts. |
| Config inválida | `loadConfig({})` | Error: `Invalid environment: DATABASE_URL — Required`. |
| `/health` API | `curl http://localhost:4000/health` | `200` `{"status":"ok"}`. |
| `/health` proxy | `curl http://localhost:3000/api/health` | `200` `{"status":"ok"}`. |
| Página web | `curl http://localhost:3000/` | `200` (tras `extensionAlias` en Next para imports `.js` de contracts). |
| Base test | `pnpm db:test:migrate` | Aplica la misma migración a `ifx_test`. Conteos: dev `users=2,vms=12`; test `users=0,vms=0`. |
| Unicidad | Dos `INSERT` con el mismo `nameKey` vía `psql` | Segundo falla: `duplicate key value violates unique constraint "Vm_nameKey_key"`. |
| `.env` | Entrada en `.gitignore` | Presente. El directorio aún no es un repo Git (`git check-ignore` no aplica). |

**Problemas reales y correcciones:**

1. pnpm 10 ignoró scripts de Prisma hasta `onlyBuiltDependencies`.
2. Prisma no veía `.env` en la raíz: scripts de migrate usan `node --env-file=../../.env`.
3. Next no resolvía `./constants.js` desde fuentes TS: `webpack.resolve.extensionAlias`.
4. `corepack enable` → `EPERM`; se usó pnpm global.
