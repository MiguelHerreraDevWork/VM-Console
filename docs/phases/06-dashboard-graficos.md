# Fase 06 — Dashboard y panel de recursos asignados

> **Estado:** Terminada (el estado oficial vive en [PLAN.md](../PLAN.md)).
> **Depende de:** [03](03-api-vms.md), [04](04-shell-rutas.md). Reutiliza componentes de [05](05-listado-formularios.md) si ya existen. · **Habilita:** [07](07-optimistic-ui.md)

## 1. Objetivo, alcance y exclusiones

**Objetivo:** un `/dashboard` que resuma el parque de VMs y muestre, en un panel pequeño con gráficos, la **suma de cores, RAM y disco asignados a las VMs encendidas**.

**Entrega:**

- Función pura de agregación con pruebas.
- Tres indicadores: vCPU, RAM en GB y disco en GB de las VMs `ON`.
- Recuento de VMs encendidas, apagadas y totales.
- Gráfico de recursos asignados.
- Rejilla de `VmCard` con acciones solo para ADMIN.
- Estados de carga, vacío y error.

**Exclusiones:**

- Porcentajes de utilización, capacidad total, métricas en vivo e históricos: **prohibido inventarlos** ([DECISIONES §2](../DECISIONES.md)).
- Lógica optimista → [07](07-optimistic-ui.md).
- Resaltado en tiempo real → [08](08-tiempo-real.md).

## 2. Trazabilidad

| Fuente | Requisito o decisión | Cómo se cubre aquí |
| --- | --- | --- |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Panel pequeño con gráficos (ej. Chart.js o Recharts) del uso total de recursos asignados: suma de cores, RAM y disco de las VMs activas | Pasos 1–4 |
| [Enunciado › Parte 1 › 2](../ENUNCIADO_PRUEBA.md) | Dashboard privado; el Cliente no ve los botones de crear, editar y eliminar; el Administrador ve todo | Paso 5 |
| [Enunciado › Parte 1 › 1](../ENUNCIADO_PRUEBA.md) | Skeletons y estados vacíos | Paso 6 |
| [DECISIONES §2](../DECISIONES.md) | «Activas» = `status=ON`; sin porcentajes ni capacidad total | Paso 1 y textos del panel |
| [DECISIONES §5](../DECISIONES.md) | `/dashboard`: resumen y panel de cores, RAM y disco de VMs encendidas | Pasos 2–5 |
| [DECISIONES §1 y §5](../DECISIONES.md) | Recharts; tarjetas en el dashboard con acciones de VM y botón de encender/apagar visibles solo para ADMIN; temas oscuro y claro | Pasos 4–5 |
| *Decisión propia* | Desglose por SO con selector de métrica | Paso 4 |

## 3. Dependencias y contratos

- **Entradas:**
  - query `['vms']` y componentes `VmCard`, `VmActions` y `VmStatusBadge` de [05](05-listado-formularios.md). Si 05 aún no los tiene, se crean aquí en `features/vms/components` y 05 los reutiliza;
  - shell y primitivas de [04](04-shell-rutas.md).
- **Agregación** en `features/dashboard/lib/aggregate-resources.ts`:
  - `aggregateResources(vms)` devuelve `{ on, off, total, allocated: { cores, ramGb, diskGb }, byOs: Array<{ os, cores, ramGb, diskGb }> }`, calculado **solo** con las VMs `ON`.
  - Es pura, de modo que el dashboard se deriva de la misma caché. Cuando [07](07-optimistic-ui.md) cambie la caché de forma optimista, los totales cambiarán a la vez sin código extra.
- **Gráfico:** desglose por SO de cada recurso, que permite comparar magnitudes dentro de una misma unidad. Nunca se mezclan vCPU y GB en un mismo eje.

## 4. Secuencia de implementación

1. **Agregación y pruebas unitarias.**
   - Casos: lista vacía da ceros; todas `OFF` da ceros; mezcla `ON`/`OFF` suma solo `ON`; varios SO se agrupan bien; las cifras del seed coinciden con un cálculo SQL de referencia (`SUM` con `status='ON'`).
   - Resultado observable: `pnpm --filter web test` en verde.
2. **Indicadores.**
   - Hacer: tres tarjetas con el valor, la unidad («vCPU», «GB RAM», «GB disco») y la etiqueta «Asignados a VMs encendidas». Además, el recuento de encendidas, apagadas y totales. Cifras con `Intl.NumberFormat('es')`.
   - Resultado observable: los valores coinciden con el SQL de referencia.
3. **Dirección del gráfico** con `ui-ux-pro-max` (`--domain chart`, más la guía de accesibilidad) e `impeccable` para la jerarquía del panel. *Previsto; se registra solo si se ejecuta.*
   - Resultado observable: tipo de gráfico justificado y registrado.
4. **Gráfico.**
   - Opción por defecto: un selector segmentado `vCPU | RAM | Disco` sobre un gráfico de barras horizontales por SO.
   - Requisitos:
     - Recharts cargado solo en el cliente (`dynamic`, sin SSR);
     - contenedor responsivo y colores tomados de los tokens, de modo que el gráfico cambia con el tema;
     - tooltips con unidad;
     - alternativa textual: tabla oculta visualmente o resumen con `aria`;
     - el color nunca es la única señal.
   - Resultado observable: el gráfico cambia de métrica sin recargar y se lee en 390 px.
5. **Rejilla de VMs.**
   - Hacer: `VmCard` con nombre, SO, especificaciones y estado. Para ADMIN, `VmActions` y el CTA «Nueva VM»; para CLIENT, ninguna acción en el DOM. Enlace «Ver todas» a `/vms`.
   - Resultado observable: las tarjetas son el objetivo del resaltado de [08](08-tiempo-real.md).
6. **Estados.**
   - Skeleton del panel y de las tarjetas con sus dimensiones finales.
   - Si no hay VMs: `EmptyState` (CTA solo para ADMIN).
   - Si hay VMs pero ninguna `ON`: indicadores a 0 y el mensaje «No hay VMs encendidas; no hay recursos asignados», sin un gráfico vacío engañoso.
   - Error con reintento.
   - Resultado observable: cada estado se puede forzar.
7. **Revisión** con `impeccable` (`audit` del dashboard en móvil y escritorio) y corrección en una tanda.
   - Resultado observable: hallazgos anotados.

## 5. Verificación

> Todo lo de esta sección es **planeado**. Registrar las ejecuciones reales abajo.

- **Exactitud:**
  - Comparar los indicadores con una consulta SQL sobre la base de desarrollo (`SELECT SUM(cores), SUM(ram), SUM(disk) FROM "Vm" WHERE status='ON'`, ajustando los nombres de tabla al esquema real).
  - Apagar una VM, desde la UI si [05](05-listado-formularios.md) ya existe o con `curl` (`PUT`), y comprobar que los totales bajan exactamente sus recursos.
- **Sin invenciones:** buscar en la UI «%», «capacidad» o «uso real»; no deben aparecer.
- **Roles:** ADMIN ve el CTA y las acciones en las tarjetas; CLIENT ve indicadores, gráfico y tarjetas sin acciones (verificado en el DOM).
- **Estados:** DB sin VMs, todas `OFF`, API detenida y red lenta.
- **Responsive y accesibilidad:**
  - 390, 768 y 1440 px;
  - selector de métrica operable con teclado y estado anunciado;
  - alternativa textual del gráfico leída por un lector de pantalla;
  - contraste de las barras frente al fondo, en tema oscuro y en tema claro.

## 6. Criterios de aceptación

- [x] Los indicadores muestran la suma de cores, RAM y disco de las VMs `ON` y coinciden con la consulta SQL de referencia.
- [x] Existe al menos un gráfico de recursos asignados que no mezcla unidades en un eje, tiene alternativa textual y no muestra porcentajes ni capacidad total.
- [x] Los totales se recalculan al cambiar el estado de una VM sin recargar la página.
- [x] Estados de carga, vacío (sin VMs y sin VMs encendidas) y error verificados.
- [x] CLIENT no tiene controles de escritura en el DOM del dashboard.
- [x] Revisado en móvil y escritorio.

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo o pregunta | Opción por defecto | ¿Decisión humana? |
| --- | --- | --- | --- |
| **Significado de «VMs activas»** | El enunciado dice «activas»; [DECISIONES §2](../DECISIONES.md) lo interpreta como `status=ON`. Otra lectura posible: todas las VMs existentes | Mantener `ON`, rotulándolo en la UI («VMs encendidas») | Ya decidido; se documenta como supuesto en el README |
| Librería de gráficos | — | Recharts | Resuelto ([DECISIONES §1](../DECISIONES.md)) |
| Forma del gráfico | Tres unidades distintas en un panel pequeño | Métrica seleccionable y barras por SO. Alternativa: tres mini-barras, una por indicador | No; la decide la revisión con skills |
| Acciones en el dashboard | Que el CLIENT las vea o las tenga deshabilitadas | Tarjetas con acciones solo para ADMIN dentro de `RoleGate`, reutilizando los componentes de [05](05-listado-formularios.md) | Resuelto ([DECISIONES §5](../DECISIONES.md)) |
| Tamaño de bundle | Recharts añade peso | Carga diferida del componente del gráfico | No |

## Registro de evidencia

Fecha: **2026-10-19**. Alcance del encargo en [BITACORA_IA.md](../BITACORA_IA.md), fase 06.

| Paso | Comando / procedimiento | Resultado |
| --- | --- | --- |
| Skills | `ui-ux-pro-max --domain chart` (horizontal bar por categoría); `impeccable detect` dashboard | Bar Chart horizontal justificado; detect `[]` |
| Agregación | `aggregate-resources.test.ts` | Casos vacío / all OFF / mezcla ON·OFF |
| Calidad | `pnpm --filter @repo/web typecheck`; lint; test | typecheck/lint OK; **7/7** tests |
| SQL ref. | `SUM(...) FILTER (WHERE status='ON')` sobre `"Vm"` | **28 / 76 / 1020** (7 ON, 5 OFF, 12 total) = KPIs UI |
| Recálculo | `PUT` admin apaga `web-frontend-01` → SQL **26 / 72 / 980**; reload dashboard | KPIs UI `["26","72","980"]`; VM restaurada a ON |
| CLIENT | DOM: `write: []`; sin Nueva VM; gráfico + 12 tarjetas | OK |
| Responsive | Viewport 390 px (CDP) + escritorio | KPIs apilados; selector métrica operable |
| Gráfico | Selector vCPU/RAM/Disco; tabla `sr-only`; tokens CSS | Sin mezcla de unidades; sin «%» inventado |
