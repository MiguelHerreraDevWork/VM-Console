# Diseño — VM Console

<!-- No es una paleta ni un sistema de marca oficial de IFX. -->

Modo de superficie: **Operate** (panel de operación). Oscuro por defecto.

## Dirección

Consola de infraestructura nocturna: azul profundo como suelo, azul eléctrico para acciones primarias, cian para acentos secundarios e indicadores. Tipografía sans de trabajo (**Manrope**); mono solo para IDs técnicos (**JetBrains Mono**). Sin glassmorphism ornamental ni CTA naranja (la sugerencia de `ui-ux-pro-max` se descartó por conflicto con `docs/DECISIONES.md`).

## Tokens (tema oscuro — prioritario)

| Token            | Valor     | Uso                 | Contraste vs fondo (aprox.) |
| ---------------- | --------- | ------------------- | --------------------------- |
| `--bg`           | `#07101C` | Lienzo              | —                           |
| `--surface`      | `#0E1A2B` | Sidebar / paneles   | —                           |
| `--surface-2`    | `#15243A` | Cards / inputs      | —                           |
| `--border`       | `#243552` | Separadores         | —                           |
| `--text`         | `#E8EEF7` | Texto principal     | ~14:1 sobre `--bg`          |
| `--muted`        | `#9BB0C9` | Secundario          | ~7:1 sobre `--bg`           |
| `--accent`       | `#3B82F6` | Primario / links    | —                           |
| `--accent-hover` | `#60A5FA` | Hover primario      | —                           |
| `--on-accent`    | `#061018` | Texto sobre accent  | ~8:1                        |
| `--accent-2`     | `#22D3EE` | Cian / badges ON    | —                           |
| `--success`      | `#34D399` | Éxito               | —                           |
| `--danger`       | `#F87171` | Error / destructivo | —                           |
| `--warning`      | `#FBBF24` | Aviso               | —                           |
| `--focus`        | `#67E8F9` | Anillo de foco      | ≥3:1                        |

## Tokens (tema claro)

| Token            | Valor     | Uso                      | Contraste                                       |
| ---------------- | --------- | ------------------------ | ----------------------------------------------- |
| `--bg`           | `#F4F7FB` | Lienzo                   | —                                               |
| `--surface`      | `#FFFFFF` | Paneles                  | —                                               |
| `--surface-2`    | `#E8EEF7` | Inputs / chips           | —                                               |
| `--border`       | `#C9D5E5` | Separadores              | —                                               |
| `--text`         | `#0B1726` | Texto                    | ~14:1                                           |
| `--muted`        | `#4A6078` | Secundario               | ~5.5:1                                          |
| `--accent`       | `#1D4ED8` | Primario                 | —                                               |
| `--accent-hover` | `#1E40AF` | Hover                    | —                                               |
| `--on-accent`    | `#FFFFFF` | Sobre accent             | ~8:1                                            |
| `--accent-2`     | `#0E7490` | Cian (texto de badges)   | ~5.4:1 sobre blanco, ~4.6:1 sobre `--surface-2` |
| `--success`      | `#047857` | Éxito / estado Encendida | ~5.4:1                                          |
| `--danger`       | `#B91C1C` | Texto de error           | ~6.5:1                                          |
| `--warning`      | `#B45309` | Aviso («Reconectando…»)  | ~5.0:1                                          |
| `--focus`        | `#0284C7` | Foco                     | ≥3:1                                            |

Los valores anteriores de cian (`#0891B2`), verde (`#059669`) y ámbar (`#D97706`) quedaban por debajo de 4.5:1 en texto pequeño y se sustituyeron en la revisión integral.

## Tokens comunes añadidos

| Token                                                     | Uso                                                                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `--surface-hover`, `--border-strong`                      | Hover de filas, tarjetas y controles                                                                                          |
| `--accent-soft`                                           | Fondo de navegación activa, pestaña de métrica seleccionada y cursor del gráfico                                              |
| `--danger-solid` / `--danger-solid-hover` / `--on-danger` | Botón destructivo: blanco sobre `#DC2626` (~4.8:1) en ambos temas; el rojo claro del tema oscuro con texto blanco daba ~2.8:1 |
| `--overlay`, `--shadow-pop`                               | Fondo de diálogos y elevación de menús, toasts y diálogos                                                                     |
| `--glow-1`, `--glow-2`                                    | Brillos azul (`--accent`) y cian (`--accent-2`) del degradado de acento: 22 % y 14 % en oscuro, 12 % y 10 % en claro          |

### Degradado de acento

- **Clases:** `.bg-glow-page` (fondo del login) y `.bg-glow-surface` (cabecera del resumen del Panel). Usan dos elipses radiales: azul arriba a la izquierda y cian abajo a la derecha. Es la misma dirección que el login, para que ambas pantallas se reconozcan.
- **Una zona por vista:** nunca en tarjetas sueltas, filas del inventario ni formularios. Es estático, sin animación.
- **Contraste:** en el tema claro los brillos son más contenidos. El texto secundario (`--muted`) mantiene ≥ 4.5:1 sobre el punto más saturado del degradado: ~6:1 en oscuro y ~5.6:1 en claro, calculado sobre la mezcla, no medido con herramienta.

## Movimiento

Curvas y duraciones de la skill `animate`: `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)`; solo `transform` y `opacity`; menos de 300 ms.

| Elemento                         | Movimiento                                           | Con `prefers-reduced-motion`      |
| -------------------------------- | ---------------------------------------------------- | --------------------------------- |
| Entrada de ruta (`template.tsx`) | Fundido + 6 px, 160 ms                               | Solo fundido, 120 ms              |
| Diálogo de confirmación          | Escala 0.96 → 1 + fundido, 220 ms; fondo con fundido | Solo fundido                      |
| Menú de usuario                  | Escala desde el disparador, 180 ms                   | Solo fundido                      |
| Pulsación de botones             | `scale(0.97)`, 160 ms                                | Sin escala                        |
| Cambio de tema                   | Crossfade de View Transitions, 220 ms                | Cambio inmediato                  |
| Resaltado en tiempo real         | Fondo y anillo cian, 200 ms                          | Anillo estático                   |
| Spinners de acción               | Giro continuo                                        | Se mantiene: es feedback esencial |

Las barras del gráfico no se animan al cargar: la animación por defecto de Recharts (1.5 s) simulaba una espera.

## Tipografía

- UI: Manrope 400/500/600/700 via `next/font/google`.
- Datos/IDs: JetBrains Mono 400/500.
- Escala: 12 / 14 / 16 / 18 / 24 / 32 (rem). Ratio ~1.2. Body 16px, line-height 1.5.

## Espaciado, radio, elevación

- Escala 4px: 4, 8, 12, 16, 24, 32, 48.
- Radios: `--radius-sm` 6px, `--radius` 10px, `--radius-lg` 16px.
- Sombra: `0 1px 2px rgb(0 0 0 / 0.35), 0 8px 24px rgb(0 0 0 / 0.25)` (oscuro); más suave en claro.
- Transiciones UI: 150–200ms; respetar `prefers-reduced-motion`.

## Componentes

Primitivas en `components/ui` usan solo variables CSS. Radix para Dialog/AlertDialog/DropdownMenu; sonner para toasts; lucide para iconos.

- **Carga de vista:** `RouteLoadingView` combina la cabecera real de la vista de destino, `ViewLoading` (spinner + texto con `role="status"`) y un esqueleto con la geometría final.
  - Aparece en el área principal desde el clic: los enlaces lo activan con `LinkPendingReporter` y la navegación programática con `useNavigateWithPending`.
  - Lo releva `loading.tsx` y, después, la carga de datos de cliente con la misma etiqueta: «Cargando panel…», «Cargando inventario…», «Abriendo formulario…» o «Cargando datos de la VM…».
  - Los iconos del menú nunca se sustituyen. Con los datos ya en caché no hay espera ni indicador.
- **Operaciones sobre una VM:** nota con spinner y texto junto a la VM («Creando…», «Guardando cambios…», «Encendiendo…», «Apagando…», «Eliminando…»), fondo tintado, `aria-busy` en la fila o tarjeta y bloqueo solo de sus acciones. El toast confirma el resultado final.
- **Spinner:** con `prefers-reduced-motion` gira más despacio (1,6 s por vuelta) en lugar de detenerse, y siempre va acompañado de texto.
- **Estado de VM:** badge con punto (relleno = Encendida, contorno = Apagada); no depende solo del color.
- **Estados vacío y error:** icono + título + explicación + acción. El botón de alta solo existe para Administrador.
- **Formularios:** secciones con `legend`, ayuda de rango por campo, error con icono junto al campo. El botón de envío no se deshabilita por invalidez: al enviar se muestran los errores y el foco salta al primero.
- **Shell:** vive en el layout privado y persiste entre rutas. La miga de pan de la barra superior se deriva de la ruta; cada vista tiene un único `h1`.
- **Máquinas, filtros:** `VmFiltersBar` sobre la tabla o las tarjetas.
  - Búsqueda por nombre (`type="search"`, filtra al escribir, sin distinguir mayúsculas ni acentos) y filtros de Estado y Sistema operativo con `FilterSelect`.
  - **`FilterSelect`** (solo filtros; el formulario conserva el `<select>` nativo):
    - es Radix `DropdownMenu` + `RadioGroup`, con un botón de 44 px y texto de 14 px;
    - el menú tiene el ancho del botón, nunca supera el espacio disponible en pantalla (`--radix-dropdown-menu-content-available-*`) y sus opciones miden 40 px, 44 px con puntero táctil;
    - se sustituyó el `<select>` nativo porque su menú desplegable lo dibuja el navegador o el sistema: tipografía grande, más ancho que el control y sin control de posición desde CSS;
    - teclado: Enter o Espacio abren, flechas, búsqueda por letras y Escape devuelve el foco. El nombre accesible combina etiqueta y valor («Estado Encendidas»).
  - **Distribución por ancho del contenedor** (`@container`, no del viewport, porque el menú lateral reduce el espacio a partir de 768 px): menos de 20 rem en una columna; desde 20 rem, búsqueda arriba y los dos filtros en paralelo; desde 42 rem, los tres en fila.
  - Recuento con `role="status"`: «12 VMs en el inventario» sin filtros, «3 de 12 VMs coinciden» con filtros.
  - «Restablecer filtros» solo está activo con algún filtro y devuelve el foco a la búsqueda.
  - Sin coincidencias: estado vacío propio con los filtros activos y la acción de restablecer, distinto del inventario vacío.
- **Login:** marca, tarjeta con el formulario y selector de tema sobre el degradado de página. Sin texto de pie: la explicación técnica de la cookie no aporta al usuario y la sesión no cambia.
- **Panel (resumen):** un único bloque `ResourcePanel`.
  - Cabecera con degradado: título, totales de VMs (total, encendidas, apagadas) y «Ver inventario».
  - Pestañas vCPU / RAM / Disco con el total asignado; se navegan con ←/→, Inicio y Fin.
  - Debajo, para el recurso elegido: gráfico por SO (Recharts, con tabla `sr-only` como alternativa) y `TopVmsList`, la lista ordenada (`<ol>`) de las 5 VMs encendidas con más asignación, con nombre, SO y valor con unidad («vCPU», «GB RAM», «GB disco»). La barra solo compara con la primera del ranking; no es uso, capacidad ni porcentaje, y no se anima.
  - Con todas las VMs apagadas, un único mensaje sustituye a ambas vistas.
  - **Sin listado de VMs:** el inventario, sus acciones y el resaltado en vivo viven en Máquinas. El Panel solo resume, para no repartir las mismas operaciones entre dos vistas.

## Anti-patrones (esta fase)

- Colores hex en componentes.
- Cards anidadas decorativas.
- Logo IFX reconstruido.
- Inter / Roboto / Arial como display.
