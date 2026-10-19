# Prueba Técnica (Full Stack) – Enfocado en Front

Duración estimada: 2 días máximo.

## Descripción general del proyecto:

Tu tarea principal es desarrollar una Single Page Application (SPA) altamente pulida y responsiva para gestionar máquinas virtuales (VMs) y deberás desarrollar una API RESTful de soporte.

## Parte 1: Desarrollo Frontend

El frontend debe ser el protagonista. Puedes utilizar React, Angular o Vue. Se evaluará profundamente la arquitectura de componentes, el manejo de estado global y la fidelidad visual.

### 1. Requisitos de UI/UX:

- Estética Moderna: El dashboard debe tener un aspecto premium. Se valorará altamente la implementación de un Dark Mode nativo y el uso de tendencias de diseño limpias.
- Gestión de Estado y Optimistic UI:
  - Al crear, actualizar o eliminar una VM, la interfaz debe reaccionar de manera inmediata (Optimistic UI) mientras la petición se resuelve en el servidor, revirtiendo el cambio si la API falla
- Data Visualization: Incluir un pequeño panel con gráficos (ej. Chart.js o Recharts) que muestre el uso total de recursos asignados (Suma de Cores, RAM y Disco de todas las VMs activas).
- Feedback Visual: Implementar skeletons durante la carga de datos, notificaciones toast para acciones de éxito/error, y manejo de estados vacíos (empty states).

### 2. FrontEnd Modulos a Desarrollar:

- Ruta pública: Login.
- Ruta privada (Dashboard): Protegida. Si el usuario es 'Cliente', la UI debe ocultar completamente (no solo deshabilitar) los botones de crear, editar y eliminar. Si es 'Administrador', debe ver todo.
- Ruta privada Creación/edición de VMs: Debe tener validaciones en tiempo real (ej. no permitir RAM negativa, validar formato del nombre, etc).
- Ruta privada Listado de Vms

### 3. Implementación Real-Time ( Plus )

- Integrar WebSockets o Socket.io. Si un administrador actualiza el estado de una VM (ej. de "Apagada" a "Encendida"), esta tarjeta debe actualizarse instantáneamente en la pantalla de todos los clientes conectados, con una leve animación que resalte el cambio.

## Parte 2: Desarrollo de la API Backend (Soporte)

La API debe manejar las operaciones CRUD, pero con un enfoque en la seguridad y las buenas prácticas que típicamente los prompts básicos de IA pasan por alto. (Puedes usar Node.js, .NET Core, Python, Go, etc.).

### 1. Autenticación Segura:

- Requisito clave: El token JWT no debe ser devuelto en el body y guardado en el localStorage del frontend (práctica insegura). El backend debe configurar el JWT en una cookie HttpOnly, Secure y SameSite. El frontend debe manejar sus peticiones sabiendo que la cookie viaja automáticamente.
- POST /login: Valida email y password y establece la cookie HttpOnly. Retorna solo la información del usuario y su rol (Administrador o Cliente).

### 2. Endpoints CRUD (Protegidos por el Middleware de JWT):

- POST /vms: Crear máquina virtual (name, cores, ram, disk, os, status). Solo Admin.
- GET /vms: Listar todas las VMs. Admin y Cliente.
- PUT /vms/{id}: Actualizar detalles. Solo Admin.
- DELETE /vms/{id}: Eliminar VM. Solo Admin.

## Parte 4: Entregables y Documentación

Para dar por finalizada la prueba, el candidato deberá enviar los siguientes elementos.

### 1. Repositorios de Código:

- URLs Accesibles: Enlaces a los repositorios. Pueden ser repositorios separados (Frontend / Backend) o un Monorepo.

### 2. Documentación Funcional (README Principal):

- Guía de Despliegue Local: Instrucciones claras paso a paso para levantar el proyecto desde cero.
- Credenciales de Prueba: Proveer al menos un usuario Administrador y un usuario Cliente preconfigurados (o un script de seed) para facilitar la revisión.

### 3. Documentación Técnica y Arquitectura:

- Diagrama Base: Un esquema visual que explique la interacción entre el Cliente, la API y el servicio de Real-Time (WebSockets).
- Decisiones Arquitectónicas: Un breve resumen justificando las tecnologías elegidas y cómo se estructuraron las carpetas del Frontend.

### 4. Meta-Documentación (Si aplica):

En tu archivo README.md, debes incluir una sección llamada "Bitácora de IA". Aquí debes documentar:

1. ¿Qué herramientas de IA utilizaste?
2. ¿Para qué partes delegaste el trabajo pesado (ej. "¿Generar el login, algun CRUD backend”) y dónde tuviste que intervenir?
3. Muestra 1 o 2 prompts clave que utilizaste para resolver un problema complejo (ej. la configuración de WebSockets o el diseño de los componentes).

Nota sobre el uso de IA: Sabemos que el uso de asistentes de IA para acelerar el desarrollo son una gran herramienta. Sin embargo, evaluaremos tu capacidad para guiar a la IA hacia una arquitectura escalable, código limpio y resultados de alta fidelidad.
