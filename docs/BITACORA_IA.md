# Bitácora de IA

Este documento resume el trabajo con IA, los resultados observados y las instrucciones de alcance por módulo.

- La sección «Prompts clave (literales)» reproduce **sin cambios** dos instrucciones reales usadas con Claude Code.
- Las «Instrucciones de alcance por módulo» del final son **resúmenes normalizados** que explican profesionalmente cada encargo; no son transcripciones.
- Ninguna sección registra mensajes personales ni autorizaciones.

## Herramientas utilizadas

| Herramienta                                         | Uso realizado                                                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code (extensión de VS Code, Claude Opus 5.5) | Planes de fase, consolidación de decisiones, revisión integral, indicadores de carga, Panel de resumen, filtros y revisión final de entrega |
| Cursor (Composer / Auto)                            | Implementación de las fases 01–09                                                                                                       |
| ui-ux-pro-max                                       | Consulta de sistema de diseño, UX y accesibilidad; guías UX de carga, estados vacíos y uso del color en la revisión integral            |
| impeccable                                          | Contexto, detección y revisión visual de pantallas; auditoría y pulido de la revisión integral                                          |
| animate                                             | Criterio para resaltar cambios de estado en tiempo real; transiciones de ruta, diálogos, menús y cambio de tema en la revisión integral |

## Delegación y criterio humano

- La IA apoyó la planificación, generación de código, pruebas, documentación y revisión visual.
- La persona responsable definió la arquitectura, aprobó el alcance de cada fase, resolvió las discrepancias con el enunciado y mantuvo la decisión de no publicar el repositorio sin autorización expresa.
- Los resultados y comprobaciones concretas permanecen en los registros de evidencia de docs/phases/. No se atribuyen skills, tests ni revisiones que no se hayan ejecutado.

## Resultados por módulo

| Fase | Resultado documentado                                      | Evidencia                             |
| ---- | ---------------------------------------------------------- | ------------------------------------- |
| 01   | Monorepo, PostgreSQL, migración, seed y esqueletos web/API | docs/phases/01-infraestructura.md     |
| 02   | Login, sesión, cookie, roles y protecciones de API         | docs/phases/02-autenticacion.md       |
| 03   | CRUD de VMs, validación y matriz de permisos               | docs/phases/03-api-vms.md             |
| 04   | Temas, shell responsivo, login visual y primitivas         | docs/phases/04-shell-rutas.md         |
| 05   | Listado, formularios y acciones por rol                    | docs/phases/05-listado-formularios.md |
| 06   | Dashboard y recursos asignados a VMs encendidas            | docs/phases/06-dashboard-graficos.md  |
| 07   | Mutaciones optimistas, reversión y feedback                | docs/phases/07-optimistic-ui.md       |
| 08   | Socket.IO para cambios de estado y reconexión              | docs/phases/08-tiempo-real.md         |
| 09   | Verificación local, README y preparación de entrega        | docs/phases/09-calidad-entrega.md     |

## Revisión integral posterior (Claude Code)

Contraste del código implementado con el enunciado, DECISIONES.md y los planes, con prioridad en frontend y experiencia de uso.

- **Skills ejecutadas:**
  - `impeccable`: carga de contexto, auditoría técnica, detector en la línea base y tras los cambios (sin hallazgos en ambos casos) y pulido según su guía de calidad;
  - `ui-ux-pro-max`: consultas a su base de guías UX. La consulta sobre cambio de tema no obtuvo coincidencias;
  - `animate`: elección de propiedades, curvas y duraciones de las transiciones.
- **Fallos funcionales corregidos:**
  - el shell se remontaba en cada navegación y reconectaba el socket;
  - una consulta al montar el listado borraba de la vista el alta o la edición optimista todavía en vuelo;
  - el parámetro `next` admitía `/\host`, una redirección abierta;
  - la sesión se sembraba después del primer render;
  - el foco no volvía al cerrar el diálogo de borrado.
- **Cambios visuales:**
  - contraste AA en el tema claro y en el botón destructivo;
  - toasts que siguen el tema de la app;
  - barra superior móvil compacta;
  - panel de recursos con métricas como pestañas;
  - estado con punto además de color;
  - formulario por secciones con mensajes en lenguaje de usuario;
  - spinners en acciones puntuales y carga de ruta dentro del shell;
  - transiciones de ruta, diálogo, menú y tema con alternativa para movimiento reducido.
- **Verificación:**
  - typecheck, lint y tests del monorepo (contratos 10, API 24, web 26);
  - capturas en Chrome de ambos roles y temas a 1440 y 390 px;
  - script de navegador local con 25 comprobaciones: sumas, tiempo real, reversión de las tres mutaciones, 404 sin fantasma, estados de carga, vacío y error, tema, movimiento reducido, redirección abierta y 403 de Cliente.
- **Pendiente:** `pnpm build` no se ejecutó porque el servidor de desarrollo activo comparte `.next`.

## Corrección de indicadores de carga (Claude Code)

- **Navegación:**
  - los iconos del menú ya no se sustituyen por un spinner;
  - el área principal muestra la carga de la vista de destino desde el clic;
  - la carga de ruta (`loading.tsx`) y la de datos usan la misma cabecera, etiqueta y esqueleto, para que no haya saltos ni indicadores duplicados.
- **Mutaciones:**
  - estados pendientes junto a la VM: «Creando…», «Guardando cambios…», «Encendiendo…», «Apagando…» y «Eliminando…»;
  - solo se bloquean las acciones de esa VM y los toasts confirman el resultado final.
- **Borrado:** por decisión humana, la fila queda marcada hasta la respuesta en lugar de desaparecer al instante (registrado en DECISIONES.md §5 y §8).
- **Verificación:**
  - typecheck, lint y tests (contratos 10, API 24, web 34, con 8 nuevos de mutaciones y sumas);
  - `next build` en un directorio separado (`NEXT_DIST_DIR`);
  - script de navegador con red lenta simulada (27 comprobaciones en escritorio y móvil, ambos temas);
  - regresión funcional de 25 comprobaciones.

## Login y Panel de resumen (Claude Code)

- **Skills ejecutadas:**
  - `impeccable`: guías `colorize` y `layout`, detector en modo general y `layout` (sin hallazgos);
  - `ui-ux-pro-max`: consultas a su base de gráficos (ranking con barras horizontales ordenadas, etiquetas directas y alternativa textual visible) y de UX sobre contraste;
  - `animate`: aplicada su secuencia de decisión, que concluyó no animar barras ni degradado.
- **Cambios:**
  - se retira del login el texto sobre el entorno y la cookie;
  - degradado azul/cian compartido por el fondo del login y la cabecera del resumen del Panel;
  - el Panel deja de repetir el listado de VMs y suma el ranking de las 5 VMs encendidas por recurso, junto al gráfico por SO.
- **Verificación:**
  - typecheck, lint, tests (web 37, con 3 nuevos del ranking) y build;
  - capturas de login, Panel y Máquinas con ambos roles, temas y anchos;
  - 23 comprobaciones del Panel: ranking frente a API, teclado, unidades, ausencia de porcentajes, cambio optimista, estados, permisos y 390 px;
  - regresión funcional de 25 comprobaciones, con la suma del Panel en vivo y el resaltado en Máquinas en fila y tarjeta.

## Filtros del inventario (Claude Code)

- **Cambios:**
  - búsqueda por nombre y filtros de estado y SO en Máquinas, con recuento, restablecer y estado sin resultados;
  - filtrado en el cliente sobre la caché de `GET /vms` y reflejado en la URL;
  - sin endpoints ni cambios de permisos.
- **Skills:** consultas de `ui-ux-pro-max` sobre búsqueda, sin resultados y reflujo de filtros; detector de `impeccable` sin hallazgos.
- **Verificación:**
  - tests (web 42, con 5 nuevos de filtrado), typecheck, lint y build;
  - 64 comprobaciones de navegador con Admin y Cliente en escritorio y móvil, ambos temas: búsqueda sin acentos, filtros frente a API, URL y recarga, sin resultados, optimista, tiempo real, permisos, teclado y 390 px;
  - regresión funcional de 25 comprobaciones.

## Filtros responsivos (Claude Code)

- **Causa:**
  - el grid saltaba a tres columnas según el viewport (`sm`) aunque el menú lateral redujera el espacio, de modo que a 768 px los filtros medían 110 px, «Sistema operativo» ocupaba dos líneas y «Windows Server» quedaba recortado; también se recortaba a 320 y 640 px;
  - el menú del `<select>` nativo lo dibuja el navegador, con letra grande, más ancho que el control y sin control de posición desde CSS.
- **Cambios:**
  - `FilterSelect` (Radix `DropdownMenu` + `RadioGroup`, ya instalado) solo para los filtros;
  - distribución con container queries;
  - el formulario mantiene su `<select>`.
- **Verificación:**
  - medición de controles y del menú abierto a 320, 390, 640, 768 y 1440 px en ambos temas (sin recortes, etiquetas en una línea, 44 px, menú dentro de pantalla y sin scroll horizontal);
  - 76 comprobaciones de filtros con ambos roles, incluido teclado;
  - filtrado a 320, 640 y 768 px;
  - tests, typecheck, lint, build y regresión funcional.

## Prompts clave (literales)

Dos instrucciones reales, copiadas sin cambios, usadas con Claude Code para resolver problemas de diseño de componentes y de estado.

Indicadores de carga y estados pendientes:

````text
Corrige específicamente la ubicación y el significado de los indicadores de carga del frontend. Lee CLAUDE.md y revisa la implementación actual antes de editar. Conserva los cambios locales existentes.

En la navegación entre Panel y Máquinas, no reemplaces los iconos del menú por un spinner: los iconos deben permanecer visibles y reconocibles. Mientras la navegación o los datos de la nueva vista estén realmente pendientes, muestra un indicador circular o un estado de carga apropiado dentro del área principal donde aparecerá esa vista. Hazlo también al abrir Nueva máquina virtual y Editar cuando exista una espera real. Coordina la carga de ruta con la carga de datos del cliente para evitar una pantalla vacía, indicadores duplicados o un spinner permanente. No introduzcas demoras artificiales solo para mostrar la animación.

Al encender o apagar una VM, conserva el cambio optimista y muestra junto a esa VM un indicador con el texto Encendiendo… o Apagando… hasta que responda la API. Para crear, editar y eliminar, muestra el estado pendiente en el lugar donde el usuario sigue viendo la operación. Ten en cuenta que crear y editar navegan de inmediato al listado: el indicador del botón del formulario desaparece, por lo que el listado también debe mostrar claramente la VM pendiente. Deshabilita solo las acciones que puedan entrar en conflicto con esa operación. Al finalizar, usa los toasts existentes de Sonner para confirmar éxito o informar el error y conserva la reversión optimista.

Usa el Spinner y los componentes que ya existen. Revisa accesibilidad, aria-busy, anuncio de estado y prefers-reduced-motion. Prueba con una red lenta simulada y con respuestas exitosas y fallidas: Panel → Máquinas, Máquinas → Panel, apertura de Nueva VM, edición, encender, apagar, crear, guardar y eliminar. Comprueba escritorio y móvil en ambos temas. Ejecuta tests, lint, typecheck y build pertinentes; añade pruebas solo para los comportamientos que puedan romperse.

Al terminar, explica dónde aparece cada indicador, qué ocurre si la API falla, qué comprobaste y qué quedó pendiente. No publiques ni hagas push.
````

Filtros responsivos de Máquinas:

````text
Corrige la interfaz responsiva de los filtros Estado y Sistema operativo en la página Máquinas. Actualmente los selectores o sus opciones se ven demasiado grandes y no se adaptan bien al espacio disponible.

Revisa VmFiltersBar.tsx, el componente Select compartido y sus estilos. Comprueba el control cerrado y el menú abierto antes de cambiar código. En móvil, organiza búsqueda y filtros sin desbordamiento horizontal; en anchos intermedios evita forzar los tres campos en una fila demasiado estrecha. Asegura que las etiquetas y el valor seleccionado sean legibles, que los controles tengan un tamaño táctil adecuado y que el menú de opciones no se salga de la pantalla.

Si el problema proviene del menú nativo de `<select>` y no puede resolverse de forma fiable con CSS, utiliza una alternativa accesible y compacta para estos filtros, preferiblemente compatible con los componentes Radix que ya usa el proyecto. Conserva navegación por teclado, foco visible, etiquetas, ambos temas y el comportamiento de filtrado actual. No alteres innecesariamente el selector del formulario de creación y edición.

Verifica visualmente los filtros abiertos y cerrados a 320, 390, 640, 768 y 1440 px, en tema oscuro y claro. Comprueba que no haya scroll horizontal y que seleccionar Estado o Sistema operativo siga filtrando correctamente. Ejecuta las comprobaciones pertinentes y comunica qué causaba el problema, qué cambiaste y qué verificaste. Deja los cambios locales; no publiques el repositorio.
````

Dónde intervino la persona en estos dos casos:
- En el primero, al aparecer una contradicción con `DECISIONES.md`, decidió que el borrado mantuviera la fila marcada «Eliminando…».
- En el segundo, la causa (rejilla basada en el viewport y menú nativo del navegador) se midió antes de cambiar el código.

## Revisión final de entrega (Claude Code)

- **Alcance:** contraste del estado final con el enunciado, sin añadir funciones.
- **Instalación limpia:** en una copia aislada siguiendo el README.
- **Comandos y recorrido:** typecheck, lint, test y build, y recorrido en navegador con ambos roles, temas y anchos. Detalle y resultados en `docs/phases/09-calidad-entrega.md`.
- **Hallazgos corregidos en documentación:**
  - el README no indicaba `pnpm db:test:migrate` antes de `pnpm test`, y en una instalación limpia fallaban 23 tests de API;
  - faltaban avisos de Windows: `pnpm build` con `pnpm dev` en marcha da `EPERM`, y una ruta de proyecto muy larga supera el límite de 260 caracteres;
  - los prompts del README pasan a ser literales;
  - la fase 09 citaba commits que ya no existen; se añadió una nota de corrección.
- **Skills:** no se ejecutaron skills de diseño en esta revisión; no hubo cambios de interfaz.

## Instrucciones de alcance por módulo

Estos textos describen el encargo técnico de forma reutilizable y legible. Para evaluar lo que efectivamente se comprobó, consultar la evidencia de cada fase.

### Planificación de módulos

```text
Lee CLAUDE.md, docs/ENUNCIADO_PRUEBA.md, docs/DECISIONES.md y docs/PLAN.md. Crea los nueve planes en docs/phases siguiendo el orden, la estructura y los criterios de revisión del plan maestro. Esta tarea autoriza únicamente documentación: no implementes código ni cambies el estado de las fases. Al finalizar, verifica cobertura del enunciado, dependencias entre módulos y decisiones pendientes; informa los hallazgos.
```

### Alineación documental

```text
Continúa únicamente con la consolidación documental de los nueve planes. Corrige la evidencia de la fase 02 para que pruebe el middleware de roles, y reserva el 403 real de las rutas de VMs para la fase 03. Mantén Secure como objetivo de la cookie y define HTTPS local si el navegador no la admite en localhost. Registra en DECISIONES.md las decisiones aprobadas de temas, permisos, nombres, UI optimista, tiempo real, herramientas y pruebas; actualiza los planes afectados y enlázalos desde PLAN.md. Revisa de nuevo contradicciones y cobertura. No implementes código, no cambies estados y no publiques el repositorio.
```

### Fase 01 — Infraestructura, PostgreSQL y seed

```text
Empecemos la fase 01: infraestructura, PostgreSQL y seed. Esta instrucción autoriza implementar únicamente esa fase.

Lee CLAUDE.md, docs/ENUNCIADO_PRUEBA.md, docs/DECISIONES.md, docs/PLAN.md y docs/phases/01-infraestructura.md. Los nueve planes ya existen; actualiza la sección obsoleta de CLAUDE.md que aún presenta su creación como próximo encargo.

Implementa la fase 01 en el orden previsto: monorepo pnpm, contratos compartidos, PostgreSQL con Docker Compose, esquema y migración Prisma, seed idempotente, esqueleto Fastify con /health, esqueleto Next.js con /api y scripts de arranque. Mantén .env fuera de Git y documenta las variables en .env.example. No implementes login, CRUD, pantallas definitivas ni WebSockets.

Marca la fase En curso al comenzar. Ejecuta las comprobaciones previstas, incluida la repetición del seed y el acceso a /health a través de la web. Registra comandos, resultados y problemas reales. Marca la fase Terminada solo si la evidencia de cierre está comprobada; si falta Docker u otra dependencia, conserva un estado que refleje el avance real y explica el bloqueo.

Al terminar, informa los archivos cambiados, las verificaciones, los pendientes y si la fase 02 puede comenzar. No avances a la fase 02 ni publiques el repositorio.
```

### Fase 02 — Autenticación, sesión y roles

```text
Empecemos la fase 02: autenticación, sesión y autorización. Esta instrucción autoriza implementar únicamente esa fase.

Lee CLAUDE.md, el enunciado, DECISIONES.md, PLAN.md y docs/phases/02-autenticacion.md. Inspecciona el resultado real de la fase 01 antes de editar. Implementa login, /me, logout, cookie JWT con HttpOnly, Secure y SameSite, hash y verificación de contraseñas, límite de intentos, consulta del rol vigente, validación de Origin, cliente web de sesión, guardas y login funcional. Prueba el middleware de roles con una ruta exclusiva de test; los 403 de escritura sobre VMs corresponden a la fase 03.

Comprueba la cookie Secure en los navegadores disponibles en localhost. Si no funciona, plantea y prueba HTTPS local; no declares satisfecho el requisito desactivando Secure. Ejecuta tests y los casos manuales pertinentes, registra evidencia y actualiza el estado solo según lo comprobado. Informa archivos, resultados, límites del entorno y si la fase 03 puede comenzar. No implementes CRUD de VMs ni publiques el repositorio.
```

### Fase 03 — API CRUD de VMs

```text
Empecemos la fase 03: API CRUD de VMs. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/03-api-vms.md; inspecciona las fases 01 y 02 ya implementadas. Crea POST /vms, GET /vms, PUT /vms/:id y DELETE /vms/:id con validación compartida, normalización y unicidad de nombres en PostgreSQL, autorización por rol y errores coherentes. Comprueba todas las combinaciones de endpoint y rol, los códigos 400, 401, 403, 404 y 409 y la persistencia real. Verifica que un Cliente reciba 403 en las tres escrituras, incluso al llamar la API directamente.

Ejecuta tests y las peticiones manuales previstas, registra comandos y resultados, y marca la fase Terminada solo con evidencia. Informa qué cambió, qué falta y si la fase 04 puede comenzar. No construyas todavía las pantallas de gestión, la UI optimista ni Socket.IO; no publiques el repositorio.
```

### Fase 04 — Dirección visual y rutas

```text
Empecemos la fase 04: dirección visual, shell y rutas. Esta instrucción autoriza implementar únicamente esa fase.

Lee CLAUDE.md, el enunciado, DECISIONES.md, PLAN.md y docs/phases/04-shell-rutas.md. Sigue el flujo global de UI/UX del usuario: lee las skills pertinentes antes de utilizarlas y registra solo las que ejecutes. Define la dirección visual a partir de la referencia IFX, con tema oscuro prioritario y modo claro seleccionable. Implementa tokens, primitivas, shell responsivo, navegación, login visual y protección de rutas. El Cliente no debe ver acciones de escritura. No presentes como oficial un logo reconstruido.

Verifica escritorio, móvil, contraste, teclado, estados de carga y error y ambos roles. Anota hallazgos visuales y correcciones, actualiza el estado con evidencia y reporta los pendientes. No implementes aún el listado completo, gráficos, UI optimista ni tiempo real; no publiques el repositorio.
```

### Fase 05 — Listado y formularios

```text
Empecemos la fase 05: listado y formularios de VMs. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/05-listado-formularios.md. Construye el listado responsivo y los flujos de alta, edición y borrado conectados a la API. Usa los contratos y roles ya definidos: los controles de escritura deben estar ausentes para Cliente. Valida en tiempo real y conserva los estados de carga, vacío y error. La edición debe funcionar al abrir directamente o recargar su URL, volviendo a consultar GET /vms si la caché está vacía. En esta fase las mutaciones pueden ser pesimistas; la UI optimista pertenece a la 07.

Prueba ambos roles, validaciones, errores y navegación en móvil y escritorio. Ejecuta las comprobaciones pertinentes y registra evidencia antes de cerrar la fase. Informa resultados y pendientes; no construyas aún gráficos ni WebSockets y no publiques el repositorio.
```

### Fase 06 — Dashboard y gráficos

```text
Empecemos la fase 06: dashboard y gráficos. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/06-dashboard-graficos.md. Construye el dashboard con KPIs y visualización de la suma de cores, RAM y disco asignados a VMs encendidas. Usa los datos reales de GET /vms; no inventes capacidad total ni porcentajes de utilización. Incluye acciones rápidas solo para Administrador y conserva el diseño responsive y los dos temas.

Compara las sumas de la interfaz con la base de datos y verifica el cambio al encender o apagar una VM, además de los estados vacío, carga y error. Revisa la accesibilidad del gráfico y ambas vistas de rol. Registra resultados y actualiza el estado solo con evidencia. No implementes aún UI optimista ni tiempo real; no publiques el repositorio.
```

### Fase 07 — UI optimista

```text
Empecemos la fase 07: UI optimista y feedback. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/07-optimistic-ui.md. Implementa cambios optimistas al crear, actualizar y eliminar VMs: la interfaz debe responder antes de la API, revertir los fallos y reconciliarse con el servidor. Conserva los datos del formulario si falla un alta. Ante un 404 de borrado, vuelve a consultar y muestra un aviso sin reinsertar una VM inexistente. Incluye estados pendientes, toasts y skeletons donde corresponda; protege las mutaciones por rol.

Provoca al menos un fallo por operación y comprueba el rollback, los KPIs y la ausencia de duplicados o fantasmas. Ejecuta pruebas pertinentes y revisa la experiencia visual. Registra evidencia y pendientes antes de cerrar. No implementes Socket.IO ni publiques el repositorio.
```

### Fase 08 — Tiempo real

```text
Empecemos la fase 08: tiempo real, marcado como plus. Esta instrucción autoriza implementar únicamente esa fase si las obligatorias 01 a 07 están verificadas.

Lee los documentos fuente y docs/phases/08-tiempo-real.md. Implementa Socket.IO para comunicar cambios de estado de VMs después de persistirlos, con autenticación por cookie y control de Origin. Sincroniza la caché de los clientes conectados, resalta brevemente la VM que cambió y vuelve a consultar el listado tras una reconexión. Limita el alcance a cambios de estado; altas y bajas en tiempo real quedan fuera.

Prueba con dos sesiones y roles distintos que el cambio se ve sin recargar, que los KPIs se actualizan y que la reconexión recupera eventos perdidos. Ejecuta las comprobaciones pertinentes, registra resultados y cierra solo con evidencia. No publiques el repositorio.
```

### Fase 09 — Calidad y entrega

```text
Empecemos la fase 09: calidad final y entrega local. Esta instrucción autoriza únicamente la verificación y documentación final.

Lee los documentos fuente y docs/phases/09-calidad-entrega.md. Completa el README con instalación limpia, credenciales de seed, recorrido por rol, decisiones de arquitectura, estructura del frontend y diagrama. Construye la Bitácora de IA con herramientas realmente usadas, intervención humana y uno o dos prompts que puedan verificarse en el archivo de mensajes originales. Ejecuta typecheck, lint, tests y build; recorre la aplicación desde una instalación limpia con ambos roles y revisa las pantallas y errores principales. Corrige los fallos encontrados en su fase de origen y vuelve a verificar.

Prepara Git local y comprueba que no haya secretos versionados. Registra evidencia, límites y pendientes. No publiques ni crees un remoto sin una decisión humana sobre proveedor y visibilidad. Informa si la entrega local está completa y qué falta para proporcionar una URL accesible.
```

### Revisión integral y mejora final

```text
Revisa el proyecto implementado contrastando el código con CLAUDE.md, el enunciado, DECISIONES.md y los planes de fase. Presenta primero un diagnóstico breve ordenado por impacto y un plan concreto; después ejecuta las mejoras. Prioriza calidad de frontend y experiencia de uso sin descuidar errores funcionales o de seguridad. Usa impeccable como guía principal, ui-ux-pro-max como apoyo y animate para transiciones que aporten claridad, leyendo cada skill antes de usarla. Revisa login, dashboard, listado, formularios, navegación de escritorio y móvil, ambos temas y ambos roles; mejora jerarquía, espaciado, contraste, iconos, hovers, foco, estados vacíos y errores; añade transiciones de navegación, carga de página e indicadores circulares para acciones puntuales, conservando los skeletons y respetando prefers-reduced-motion. Aprovecha Sonner, Lucide, Tailwind y Radix antes de proponer otras librerías. Comprueba autenticación, permisos, validaciones, sumas, reversión de las tres mutaciones optimistas y tiempo real; ejecuta las verificaciones del monorepo. Deja los cambios locales y revisables: sin publicar, sin push y sin reescribir el historial.
```

### Corrección de indicadores de carga

````text
Corrige la ubicación y el significado de los indicadores de carga del frontend. En la navegación entre vistas, conserva los iconos del menú y muestra la espera dentro del área principal donde aparecerá la vista, también al abrir creación y edición cuando exista una espera real; coordina la carga de ruta con la de datos para evitar pantallas vacías, indicadores duplicados o spinners permanentes, sin demoras artificiales. Al encender o apagar una VM, conserva el cambio optimista y muestra junto a ella «Encendiendo…» o «Apagando…» hasta que responda la API. Para crear, editar y eliminar, muestra el estado pendiente donde el usuario sigue viendo la operación, incluido el listado tras navegar; bloquea solo las acciones en conflicto y confirma el resultado con los toasts existentes, manteniendo la reversión optimista. Revisa accesibilidad, aria-busy, anuncios de estado y prefers-reduced-motion; prueba con red lenta, éxito y fallo en escritorio, móvil y ambos temas; ejecuta tests, lint, typecheck y build. No publiques ni hagas push.
````

### Login y Panel de resumen

````text
Revisa y mejora la experiencia visual del login y del Panel sobre el estado actual del repositorio, conservando los cambios locales. Retira del login el texto sobre el entorno y la cookie sin alterar la sesión. Da jerarquía al Panel con un degradado azul/cian sutil, coherente con el login y los tokens, aplicado a una sola zona principal. Retira del Panel el listado duplicado de VMs (el inventario y sus acciones permanecen en Máquinas, con un acceso claro) y conviértelo en un resumen: totales de VMs y recursos asignados a las encendidas, el gráfico por sistema operativo y las cinco VMs encendidas con más asignación del recurso seleccionado, con unidades y sin presentarlo como uso, capacidad o porcentaje. Mantén la actualización optimista y en tiempo real, el resaltado en Máquinas y los permisos por rol; cuida carga, vacío, error, teclado, alternativa textual, 390 y 1440 px y prefers-reduced-motion, sin añadir dependencias. Actualiza DECISIONES.md y DESIGN.md sin reescribir la evidencia histórica. Verifica ambos roles y temas, y no publiques ni hagas push.
````
