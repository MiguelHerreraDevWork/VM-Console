# Bitácora de IA

Este documento resume el trabajo con IA, los resultados observados y las instrucciones de alcance por módulo. Las instrucciones de la sección final están redactadas para explicar profesionalmente el encargo de cada fase. No son una transcripción de mensajes personales ni un registro de autorizaciones.

## Herramientas utilizadas

| Herramienta | Uso realizado |
| --- | --- |
| Claude Code (extensión de VS Code, Claude Opus 5.5) | Planes de fase y consolidación de decisiones |
| Cursor (Composer / Auto) | Implementación de las fases 01–09 |
| ui-ux-pro-max | Consulta de sistema de diseño, UX y accesibilidad |
| impeccable | Contexto, detección y revisión visual de pantallas |
| animate | Criterio para resaltar cambios de estado en tiempo real |

## Delegación y criterio humano

- La IA apoyó la planificación, generación de código, pruebas, documentación y revisión visual.
- La persona responsable definió la arquitectura, aprobó el alcance de cada fase, resolvió las discrepancias con el enunciado y mantuvo la decisión de no publicar el repositorio sin autorización expresa.
- Los resultados y comprobaciones concretas permanecen en los registros de evidencia de docs/phases/. No se atribuyen skills, tests ni revisiones que no se hayan ejecutado.

## Resultados por módulo

| Fase | Resultado documentado | Evidencia |
| --- | --- | --- |
| 01 | Monorepo, PostgreSQL, migración, seed y esqueletos web/API | docs/phases/01-infraestructura.md |
| 02 | Login, sesión, cookie, roles y protecciones de API | docs/phases/02-autenticacion.md |
| 03 | CRUD de VMs, validación y matriz de permisos | docs/phases/03-api-vms.md |
| 04 | Temas, shell responsivo, login visual y primitivas | docs/phases/04-shell-rutas.md |
| 05 | Listado, formularios y acciones por rol | docs/phases/05-listado-formularios.md |
| 06 | Dashboard y recursos asignados a VMs encendidas | docs/phases/06-dashboard-graficos.md |
| 07 | Mutaciones optimistas, reversión y feedback | docs/phases/07-optimistic-ui.md |
| 08 | Socket.IO para cambios de estado y reconexión | docs/phases/08-tiempo-real.md |
| 09 | Verificación local, README y preparación de entrega | docs/phases/09-calidad-entrega.md |

## Instrucciones de alcance por módulo

Estos textos describen el encargo técnico de forma reutilizable y legible. Para evaluar lo que efectivamente se comprobó, consultar la evidencia de cada fase.

### Planificación de módulos

````text
Lee CLAUDE.md, docs/ENUNCIADO_PRUEBA.md, docs/DECISIONES.md y docs/PLAN.md. Crea los nueve planes en docs/phases siguiendo el orden, la estructura y los criterios de revisión del plan maestro. Esta tarea autoriza únicamente documentación: no implementes código ni cambies el estado de las fases. Al finalizar, verifica cobertura del enunciado, dependencias entre módulos y decisiones pendientes; informa los hallazgos.
````

### Alineación documental

````text
Continúa únicamente con la consolidación documental de los nueve planes. Corrige la evidencia de la fase 02 para que pruebe el middleware de roles, y reserva el 403 real de las rutas de VMs para la fase 03. Mantén Secure como objetivo de la cookie y define HTTPS local si el navegador no la admite en localhost. Registra en DECISIONES.md las decisiones aprobadas de temas, permisos, nombres, UI optimista, tiempo real, herramientas y pruebas; actualiza los planes afectados y enlázalos desde PLAN.md. Revisa de nuevo contradicciones y cobertura. No implementes código, no cambies estados y no publiques el repositorio.
````

### Fase 01 — Infraestructura, PostgreSQL y seed

````text
Empecemos la fase 01: infraestructura, PostgreSQL y seed. Esta instrucción autoriza implementar únicamente esa fase.

Lee CLAUDE.md, docs/ENUNCIADO_PRUEBA.md, docs/DECISIONES.md, docs/PLAN.md y docs/phases/01-infraestructura.md. Los nueve planes ya existen; actualiza la sección obsoleta de CLAUDE.md que aún presenta su creación como próximo encargo.

Implementa la fase 01 en el orden previsto: monorepo pnpm, contratos compartidos, PostgreSQL con Docker Compose, esquema y migración Prisma, seed idempotente, esqueleto Fastify con /health, esqueleto Next.js con /api y scripts de arranque. Mantén .env fuera de Git y documenta las variables en .env.example. No implementes login, CRUD, pantallas definitivas ni WebSockets.

Marca la fase En curso al comenzar. Ejecuta las comprobaciones previstas, incluida la repetición del seed y el acceso a /health a través de la web. Registra comandos, resultados y problemas reales. Marca la fase Terminada solo si la evidencia de cierre está comprobada; si falta Docker u otra dependencia, conserva un estado que refleje el avance real y explica el bloqueo.

Al terminar, informa los archivos cambiados, las verificaciones, los pendientes y si la fase 02 puede comenzar. No avances a la fase 02 ni publiques el repositorio.
````

### Fase 02 — Autenticación, sesión y roles

````text
Empecemos la fase 02: autenticación, sesión y autorización. Esta instrucción autoriza implementar únicamente esa fase.

Lee CLAUDE.md, el enunciado, DECISIONES.md, PLAN.md y docs/phases/02-autenticacion.md. Inspecciona el resultado real de la fase 01 antes de editar. Implementa login, /me, logout, cookie JWT con HttpOnly, Secure y SameSite, hash y verificación de contraseñas, límite de intentos, consulta del rol vigente, validación de Origin, cliente web de sesión, guardas y login funcional. Prueba el middleware de roles con una ruta exclusiva de test; los 403 de escritura sobre VMs corresponden a la fase 03.

Comprueba la cookie Secure en los navegadores disponibles en localhost. Si no funciona, plantea y prueba HTTPS local; no declares satisfecho el requisito desactivando Secure. Ejecuta tests y los casos manuales pertinentes, registra evidencia y actualiza el estado solo según lo comprobado. Informa archivos, resultados, límites del entorno y si la fase 03 puede comenzar. No implementes CRUD de VMs ni publiques el repositorio.
````

### Fase 03 — API CRUD de VMs

````text
Empecemos la fase 03: API CRUD de VMs. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/03-api-vms.md; inspecciona las fases 01 y 02 ya implementadas. Crea POST /vms, GET /vms, PUT /vms/:id y DELETE /vms/:id con validación compartida, normalización y unicidad de nombres en PostgreSQL, autorización por rol y errores coherentes. Comprueba todas las combinaciones de endpoint y rol, los códigos 400, 401, 403, 404 y 409 y la persistencia real. Verifica que un Cliente reciba 403 en las tres escrituras, incluso al llamar la API directamente.

Ejecuta tests y las peticiones manuales previstas, registra comandos y resultados, y marca la fase Terminada solo con evidencia. Informa qué cambió, qué falta y si la fase 04 puede comenzar. No construyas todavía las pantallas de gestión, la UI optimista ni Socket.IO; no publiques el repositorio.
````

### Fase 04 — Dirección visual y rutas

````text
Empecemos la fase 04: dirección visual, shell y rutas. Esta instrucción autoriza implementar únicamente esa fase.

Lee CLAUDE.md, el enunciado, DECISIONES.md, PLAN.md y docs/phases/04-shell-rutas.md. Sigue el flujo global de UI/UX del usuario: lee las skills pertinentes antes de utilizarlas y registra solo las que ejecutes. Define la dirección visual a partir de la referencia IFX, con tema oscuro prioritario y modo claro seleccionable. Implementa tokens, primitivas, shell responsivo, navegación, login visual y protección de rutas. El Cliente no debe ver acciones de escritura. No presentes como oficial un logo reconstruido.

Verifica escritorio, móvil, contraste, teclado, estados de carga y error y ambos roles. Anota hallazgos visuales y correcciones, actualiza el estado con evidencia y reporta los pendientes. No implementes aún el listado completo, gráficos, UI optimista ni tiempo real; no publiques el repositorio.
````

### Fase 05 — Listado y formularios

````text
Empecemos la fase 05: listado y formularios de VMs. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/05-listado-formularios.md. Construye el listado responsivo y los flujos de alta, edición y borrado conectados a la API. Usa los contratos y roles ya definidos: los controles de escritura deben estar ausentes para Cliente. Valida en tiempo real y conserva los estados de carga, vacío y error. La edición debe funcionar al abrir directamente o recargar su URL, volviendo a consultar GET /vms si la caché está vacía. En esta fase las mutaciones pueden ser pesimistas; la UI optimista pertenece a la 07.

Prueba ambos roles, validaciones, errores y navegación en móvil y escritorio. Ejecuta las comprobaciones pertinentes y registra evidencia antes de cerrar la fase. Informa resultados y pendientes; no construyas aún gráficos ni WebSockets y no publiques el repositorio.
````

### Fase 06 — Dashboard y gráficos

````text
Empecemos la fase 06: dashboard y gráficos. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/06-dashboard-graficos.md. Construye el dashboard con KPIs y visualización de la suma de cores, RAM y disco asignados a VMs encendidas. Usa los datos reales de GET /vms; no inventes capacidad total ni porcentajes de utilización. Incluye acciones rápidas solo para Administrador y conserva el diseño responsive y los dos temas.

Compara las sumas de la interfaz con la base de datos y verifica el cambio al encender o apagar una VM, además de los estados vacío, carga y error. Revisa la accesibilidad del gráfico y ambas vistas de rol. Registra resultados y actualiza el estado solo con evidencia. No implementes aún UI optimista ni tiempo real; no publiques el repositorio.
````

### Fase 07 — UI optimista

````text
Empecemos la fase 07: UI optimista y feedback. Esta instrucción autoriza implementar únicamente esa fase.

Lee los documentos fuente y docs/phases/07-optimistic-ui.md. Implementa cambios optimistas al crear, actualizar y eliminar VMs: la interfaz debe responder antes de la API, revertir los fallos y reconciliarse con el servidor. Conserva los datos del formulario si falla un alta. Ante un 404 de borrado, vuelve a consultar y muestra un aviso sin reinsertar una VM inexistente. Incluye estados pendientes, toasts y skeletons donde corresponda; protege las mutaciones por rol.

Provoca al menos un fallo por operación y comprueba el rollback, los KPIs y la ausencia de duplicados o fantasmas. Ejecuta pruebas pertinentes y revisa la experiencia visual. Registra evidencia y pendientes antes de cerrar. No implementes Socket.IO ni publiques el repositorio.
````

### Fase 08 — Tiempo real

````text
Empecemos la fase 08: tiempo real, marcado como plus. Esta instrucción autoriza implementar únicamente esa fase si las obligatorias 01 a 07 están verificadas.

Lee los documentos fuente y docs/phases/08-tiempo-real.md. Implementa Socket.IO para comunicar cambios de estado de VMs después de persistirlos, con autenticación por cookie y control de Origin. Sincroniza la caché de los clientes conectados, resalta brevemente la VM que cambió y vuelve a consultar el listado tras una reconexión. Limita el alcance a cambios de estado; altas y bajas en tiempo real quedan fuera.

Prueba con dos sesiones y roles distintos que el cambio se ve sin recargar, que los KPIs se actualizan y que la reconexión recupera eventos perdidos. Ejecuta las comprobaciones pertinentes, registra resultados y cierra solo con evidencia. No publiques el repositorio.
````

### Fase 09 — Calidad y entrega

````text
Empecemos la fase 09: calidad final y entrega local. Esta instrucción autoriza únicamente la verificación y documentación final.

Lee los documentos fuente y docs/phases/09-calidad-entrega.md. Completa el README con instalación limpia, credenciales de seed, recorrido por rol, decisiones de arquitectura, estructura del frontend y diagrama. Construye la Bitácora de IA con herramientas realmente usadas, intervención humana y uno o dos prompts que puedan verificarse en el archivo de mensajes originales. Ejecuta typecheck, lint, tests y build; recorre la aplicación desde una instalación limpia con ambos roles y revisa las pantallas y errores principales. Corrige los fallos encontrados en su fase de origen y vuelve a verificar.

Prepara Git local y comprueba que no haya secretos versionados. Registra evidencia, límites y pendientes. No publiques ni crees un remoto sin una decisión humana sobre proveedor y visibilidad. Informa si la entrega local está completa y qué falta para proporcionar una URL accesible.
````
