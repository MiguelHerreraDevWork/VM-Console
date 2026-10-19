# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS en monorepo pnpm (`apps/web`). Estado remoto con TanStack Query. Autenticación por cookie HttpOnly vía API Fastify.

## Users

- **Administrador:** opera el inventario de VMs (crear, editar, eliminar, encender/apagar) en un entorno de evaluación local.
- **Cliente:** consulta el mismo inventario sin acciones de escritura.

Situación: revisión técnica local (prueba Full Stack); no hay multi-tenant ni VMs “propias” por usuario.

## Product Purpose

**VM Console** es un panel local para gestionar máquinas virtuales con autenticación por roles, listados claros y un resumen de recursos asignados a VMs encendidas. El éxito es que un evaluador pueda entrar con ADMIN y CLIENT, recorrer los flujos y juzgar la calidad del frontend.

## Positioning

Frontend protagonista con API segura de soporte: la UI oculta acciones que el rol no puede hacer, y el servidor las deniega igual. Nombre de producto neutral; la paleta se inspira en una referencia visual (azul profundo / eléctrico / cian) **sin** pretender ser marca oficial de IFX.

## Operating Context

- Arranque local con Docker PostgreSQL, seed y `pnpm dev`.
- Rutas: `/login`, `/dashboard`, `/vms`, `/vms/new`, `/vms/[id]/edit`.
- Tema oscuro por defecto (escena de operación / consola); modo claro opcional.
- Idioma de interfaz: español.

## Capabilities and Constraints

- Roles ADMIN / CLIENT; JWT solo en cookie `Secure`.
- CRUD de VMs en API (fase 03); formularios y gráficos reales en fases 05–06.
- Sin logo oficial; monograma tipográfico simple permitido.
- WebSockets es plus (fase 08), fuera de esta fase.

## Brand Commitments

- Nombre: **VM Console** (ajustable).
- Guía de color (no oficial): fondo azul profundo, acentos azul eléctrico y cian.
- No reconstruir ni presentar logos de IFX.

## Evidence on Hand

- Requisitos: `docs/ENUNCIADO_PRUEBA.md`, `docs/DECISIONES.md`.
- Auth y API: fases 01–03 implementadas.
- Referencia de diseño de sistema generada por `ui-ux-pro-max` en `design-system/vm-console/MASTER.md` (parcialmente sobreescrita por DECISIONES: oscuro primero, sin CTA naranja).

## Product Principles

1. Operar primero: claridad de tarea sobre ornamentación.
2. Seguridad visible: el CLIENT no ve controles de escritura en el DOM.
3. Tema oscuro como calidad prioritaria; el claro no degrada el oscuro.
4. Feedback honesto: carga, vacío, error y confirmación son ciudadanos de primera.
5. Contraste AA en texto y foco.

## Accessibility & Inclusion

Contraste WCAG AA (4.5:1 texto, 3:1 UI/foco), navegación por teclado, foco visible, `prefers-reduced-motion`, etiquetas en español, objetivos táctiles ≥ 44 px.
