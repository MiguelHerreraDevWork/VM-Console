# Plan maestro de ejecución — IFX

## Propósito y fuentes de verdad

Este archivo gobierna **secuencia, estado y evidencia** del trabajo. No sustituye el enunciado ni el contrato técnico.

| Documento | Función | Regla de mantenimiento |
| --- | --- | --- |
| [`ENUNCIADO_PRUEBA.md`](ENUNCIADO_PRUEBA.md) | Transcripción del PDF recibido | Conservar fiel al original; no introducir decisiones propias |
| [`DECISIONES.md`](DECISIONES.md) | Arquitectura, datos, API, seguridad y comportamiento acordados | Actualizar antes de cambiar contratos o supuestos de implementación |
| `PLAN.md` | Orden, dependencias, seguimiento y puertas de calidad | Actualizar al iniciar o cerrar fases, con evidencia real |
| [`phases/*.md`](phases/) | Plan ejecutable de cada módulo | Mantenerlo alineado con los tres documentos anteriores |
| [`BITACORA_IA.md`](BITACORA_IA.md) | Resumen del uso de IA e instrucciones de alcance por módulo | Mantenerlo alineado con la evidencia de las fases; no registrar mensajes personales |
| `README.md` | Guía de ejecución y entrega para el evaluador | Completar con comandos y resultados realmente comprobados |

Si una decisión contradice el PDF, prevalece el PDF. Si los documentos internos discrepan, se detiene la planificación de ese punto, se señala la contradicción y se propone una corrección explícita. Un supuesto no se convierte en requisito de IFX.

## Objetivo y estrategia de entrega

Entregar una aplicación local reproducible con:

- frontend pulido y responsivo;
- autenticación segura y roles;
- CRUD con validación;
- visualización de recursos;
- UI optimista con reversión.

La API sostiene las restricciones de seguridad; ocultar acciones en la interfaz es una capa adicional. WebSockets es un **plus**, limitado a sincronizar cambios de estado de VMs, y no desplaza requisitos obligatorios ni la documentación final.

La evaluación es local. El evaluador debe poder:

1. levantar PostgreSQL mediante Docker Compose;
2. ejecutar migraciones y seed;
3. iniciar web y API;
4. entrar con usuarios Administrador y Cliente;
5. recorrer los casos del README.

Las versiones exactas se fijan en el lockfile al construir el monorepo.

## Estado actual

**Fases 01–09 terminadas** en local. Repositorio [publicado en GitHub](https://github.com/MiguelHerreraDevWork/VM-Console), rama `main`.

- README, quality gates y recorrido integral verificados; repositorio remoto público `MiguelHerreraDevWork/VM-Console`.
- **Revisión final de entrega (2026-10-19):** instalación limpia según el README, comandos de calidad y recorrido en navegador sobre el estado final. La evidencia está en una sección propia de [09-calidad-entrega](phases/09-calidad-entrega.md), separada de la evidencia histórica.

Estados válidos de una fase: `Pendiente`, `En curso`, `Bloqueada` o `Terminada`.

| Fase | Resultado esperado | Dependencias | Estado | Evidencia mínima de cierre |
| --- | --- | --- | --- | --- |
| [01-infraestructura](phases/01-infraestructura.md) | Workspace, configuración, PostgreSQL, migraciones y seed | — | Terminada | Arranque desde una instalación limpia, documentado y reproducido |
| [02-autenticacion](phases/02-autenticacion.md) | Login, sesión, cookie, roles y rutas protegidas | 01 | Terminada | Admin y Cliente entran; `/me` y logout funcionan; la cookie `Secure` funciona en `localhost` con los navegadores objetivo, o HTTPS local queda planteado; el middleware de roles devuelve `403` a CLIENT en una ruta exclusiva de test que no existe en producción |
| [03-api-vms](phases/03-api-vms.md) | CRUD, esquemas, validación y errores | 01–02 | Terminada | Operaciones y respuestas probadas, incluidos 400, 401, 403, 404 y 409; `403` real de CLIENT en `POST`, `PUT` y `DELETE /vms`; unicidad de nombres garantizada en la base de datos |
| [04-shell-rutas](phases/04-shell-rutas.md) | Diseño base, temas, login, navegación y vistas privadas | 01–02 | Terminada | Escritorio y móvil revisados en tema oscuro y claro; Cliente sin acciones de escritura |
| [05-listado-formularios](phases/05-listado-formularios.md) | Listado, alta, edición y borrado | 03–04 | Terminada | Flujos completos; validación inmediata; estados vacío y error; la edición funciona al recargar |
| [06-dashboard-graficos](phases/06-dashboard-graficos.md) | Resumen y panel de recursos asignados | 03–04 | Terminada | Sumas de cores, RAM y disco solo de VMs encendidas, comprobadas |
| [07-optimistic-ui](phases/07-optimistic-ui.md) | Mutaciones optimistas y feedback | 05–06 | Terminada | Crear, editar y borrar se reflejan al instante y revierten al fallar; `404` en borrado sin VM fantasma; skeletons y toasts |
| [08-tiempo-real](phases/08-tiempo-real.md) | Sincronización de cambios de estado con Socket.IO (plus) | 03, 07 | Terminada | Dos sesiones ven el cambio de estado; la reconexión recupera el estado; animación breve |
| [09-calidad-entrega](phases/09-calidad-entrega.md) | Verificación final y documentación | 01–07; 08 si se realiza | Terminada | README, credenciales, diagrama, Bitácora de IA y recorrido integral comprobados; Git y publicación remota verificados |

Las fases 03 y 04 pueden avanzar en paralelo una vez exista la autenticación base; sus contratos vienen de `DECISIONES.md`. La fase 09 se prepara durante el proyecto y se cierra al final. Si el tiempo limita, se recorta la fase 08 antes que cualquiera de los requisitos obligatorios.

## Decisiones y condiciones

| Decisión | Fase | Situación |
| --- | --- | --- |
| Repositorio remoto | 09 | Resuelto: GitHub público [VM-Console](https://github.com/MiguelHerreraDevWork/VM-Console), rama `main` |
| HTTPS local | 02 | Condicional: solo se plantea si la cookie `Secure` no funciona en `http://localhost` con algún navegador objetivo |
| Transporte de Socket.IO (mismo origen o conexión directa con CORS de un único origen) | 08 | Resuelto: conexión directa a `NEXT_PUBLIC_API_URL` (ver `DECISIONES.md`) |

## Planes por módulo

Los nueve planes se crearon el 2026-10-19 y se consolidaron con las decisiones del registro de `DECISIONES.md` §8. Cada plan sigue esta estructura:

1. **Objetivo, alcance y exclusiones:** qué queda entregado y qué se deja a otra fase.
2. **Trazabilidad:** requisitos exactos del enunciado y decisiones aplicables, con enlaces a documentos y sección. Se indica «decisión propia» para los detalles no exigidos por IFX.
3. **Dependencias y contratos:** fase previa, entradas y salidas, rutas, datos y estados compartidos cuando aplique.
4. **Secuencia de implementación:** pasos pequeños en orden, archivos o áreas esperadas y resultado observable por paso. Sin pseudocódigo extenso que envejezca antes de implementarse.
5. **Verificación:** casos felices, errores, permisos, responsive y accesibilidad, con comandos o procedimiento manual. Se distingue la verificación planeada de la ejecutada.
6. **Criterios de aceptación:** lista medible para declarar la fase terminada.
7. **Riesgos y decisiones abiertas:** solo los reales, con una opción por defecto y marcando lo que requiere decisión humana.

Además de la estructura, cada fase cumple condiciones propias:

- **02:** cubre la cookie y la autorización de backend, no solo las guardas visuales.
- **06:** no inventa capacidad total ni porcentajes de uso.
- **07:** especifica la reversión de **crear, actualizar y eliminar**.
- **08:** queda marcada como plus.
- **09:** incluye la Bitácora de IA con herramientas, delegación e intervención humana, y 1–2 prompts **reales**, nunca reconstruidos.

## Revisión de los planes antes de implementar

- Los nueve archivos existen, se enlazan entre sí donde corresponde y no duplican el contrato técnico completo.
- Cada requisito obligatorio del PDF aparece al menos en una fase. Los requisitos transversales aparecen donde se implementan y donde se verifican.
- Las dependencias no forman ciclos y cada fase tiene una salida demostrable.
- El plan cubre estados de carga, vacío, error, validación, roles, rollback, móvil, seguridad de cookie y datos de prueba.
- Las verificaciones son factibles en la máquina local y no se presentan como ejecutadas antes de escribir código.
- Las decisiones nuevas se registran en `DECISIONES.md` antes de cerrar los planes. Si no hay decisión nueva, no se modifica por rutina.

## Gobierno del avance

- Al iniciar la implementación real de una fase, cambiar su estado a `En curso`.
- Cerrar como `Terminada` solo con evidencia: comando y resultado, prueba manual reproducible o revisión visual descrita. Compilar no demuestra por sí solo una funcionalidad.
- Si una verificación falla, mantener `En curso` o `Bloqueada`, anotar el bloqueo y corregir antes de cerrar.
- Si cambia un contrato, actualizar `DECISIONES.md`, los planes afectados y el código correspondiente en la misma tarea.
- Mantener un registro breve de evidencia por fase en su archivo. El README final refleja únicamente lo que realmente funciona.
- Mantener [`BITACORA_IA.md`](BITACORA_IA.md) como resumen de herramientas, delegación, resultados e instrucciones de alcance por módulo. No incluir mensajes personales de autorización ni atribuir a la IA skills o verificaciones que no se ejecutaron.
- No empezar tiempo real si compromete UI, seguridad, CRUD o documentación obligatoria.
