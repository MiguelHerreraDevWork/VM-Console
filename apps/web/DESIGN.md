# Diseño — VM Console

<!-- No es una paleta ni un sistema de marca oficial de IFX. -->

Modo de superficie: **Operate** (panel de operación). Oscuro por defecto.

## Dirección

Consola de infraestructura nocturna: azul profundo como suelo, azul eléctrico para acciones primarias, cian para acentos secundarios e indicadores. Tipografía sans de trabajo (**Manrope**); mono solo para IDs técnicos (**JetBrains Mono**). Sin glassmorphism ornamental ni CTA naranja (la sugerencia de `ui-ux-pro-max` se descartó por conflicto con `docs/DECISIONES.md`).

## Tokens (tema oscuro — prioritario)

| Token | Valor | Uso | Contraste vs fondo (aprox.) |
| --- | --- | --- | --- |
| `--bg` | `#07101C` | Lienzo | — |
| `--surface` | `#0E1A2B` | Sidebar / paneles | — |
| `--surface-2` | `#15243A` | Cards / inputs | — |
| `--border` | `#243552` | Separadores | — |
| `--text` | `#E8EEF7` | Texto principal | ~14:1 sobre `--bg` |
| `--muted` | `#9BB0C9` | Secundario | ~7:1 sobre `--bg` |
| `--accent` | `#3B82F6` | Primario / links | — |
| `--accent-hover` | `#60A5FA` | Hover primario | — |
| `--on-accent` | `#061018` | Texto sobre accent | ~8:1 |
| `--accent-2` | `#22D3EE` | Cian / badges ON | — |
| `--success` | `#34D399` | Éxito | — |
| `--danger` | `#F87171` | Error / destructivo | — |
| `--warning` | `#FBBF24` | Aviso | — |
| `--focus` | `#67E8F9` | Anillo de foco | ≥3:1 |

## Tokens (tema claro)

| Token | Valor | Uso | Contraste |
| --- | --- | --- | --- |
| `--bg` | `#F4F7FB` | Lienzo | — |
| `--surface` | `#FFFFFF` | Paneles | — |
| `--surface-2` | `#E8EEF7` | Inputs / chips | — |
| `--border` | `#C9D5E5` | Separadores | — |
| `--text` | `#0B1726` | Texto | ~14:1 |
| `--muted` | `#4A6078` | Secundario | ~5.5:1 |
| `--accent` | `#1D4ED8` | Primario | — |
| `--accent-hover` | `#1E40AF` | Hover | — |
| `--on-accent` | `#FFFFFF` | Sobre accent | ~8:1 |
| `--accent-2` | `#0891B2` | Cian | — |
| `--success` | `#059669` | Éxito | — |
| `--danger` | `#DC2626` | Error | — |
| `--warning` | `#D97706` | Aviso | — |
| `--focus` | `#0284C7` | Foco | ≥3:1 |

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

## Anti-patrones (esta fase)

- Colores hex en componentes.
- Cards anidadas decorativas.
- Logo IFX reconstruido.
- Inter / Roboto / Arial como display.
