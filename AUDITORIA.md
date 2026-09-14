# Auditoría de Accesibilidad, UX y Diseño Responsive

**Proyecto auditado:** `paginaCristianoRonaldo/` (index.html, styles.css, script.js)
**Estándar de referencia:** WCAG 2.2 Nivel AA, UX y diseño responsive
**Tipo de auditoría:** No destructiva · Revisión estática del código (HTML, CSS, JS) + cálculo de contraste
**Fecha:** 2026-09-13
**Archivos evaluados:**
- `index.html` (409 líneas)
- `styles.css` (1136 líneas)
- `script.js` (321 líneas)

---

## 1. Resumen ejecutivo

El sitio es un proyecto educativo bien estructurado: semántica HTML5 correcta, una única `h1`, jerarquía de encabezados sin saltos, secciones etiquetadas con `aria-labelledby`, imágenes con `alt` descriptivo y dimensiones, soporte de `prefers-reduced-motion`, manejo de teclado en los componentes interactivos y fallbacks para `IntersectionObserver`. El parche de foco definido (`:focus-visible`) y los tamaños de objetivo táctil son, en su mayoría, sólidos.

Se detectaron **0 hallazgos críticos, 3 altos, 4 medios y 4 bajos**.

Los tres hallazgos de nivel alto están centrados en el usuario de teclado y pantalla táctil y en la robustez:

1. **Menú móvil fuera de la pantalla sigue en el orden de tabulación** (teclado: el foco cae sobre enlaces invisibles).
2. **Contenido depende de JavaScript para ser visible** (`.reveal { opacity: 0 }`): si el script falla o se bloquea, la mayor parte del contenido queda oculto.
3. **Sin indicador de foco visible** en los elementos interactivos con `tabindex` (línea de tiempo y galería).

El único incumplimiento contrastado de color (1.4.3 AA) es la variable `--color-text-muted` (`#6a6a7a`, ratios 3.05–3.72:1), usada en cinco tipos de texto. También se recomienda corregir el patrón del *lightbox* (sin *focus trap* ni restauración de foco), la semántica de la línea de tiempo y añadir un enlace "Saltar al contenido".

Al tratarse de una auditoría estática sin navegador rendereado, los hallazgos marcados como "riesgo" (B3: posible micro-desbordamiento a 320px) deben confirmarse con una verificación visual de prueba, indicada en la sección 5.

---

## 2. Hallazgos por severidad

### 2.1 Críticos
Ninguno detectado.

### 2.2 Altos

| ID | Hallazgo | Criterio WCAG |
|----|----------|---------------|
| A1 | Los enlaces del menú móvil siguen en el orden de tabulación cuando el panel está cerrado y fuera de la pantalla (`right: -100%`). El foco del teclado cae sobre enlaces invisibles, perdiendo el indicador de foco y desorientando al usuario. | 2.4.7 Foco visible (AA) · 2.4.11 Foco no oscurecido (AA, WCAG 2.2) · 2.1.1 Teclado |
| A2 | El contenido principal queda `opacity: 0` de forma predeterminada (`.reveal`) y solo se hace visible si JavaScript añade la clase `.visible`. Si el JS falla o se bloquea, biografía, línea de tiempo, estadísticas, galería y palmarés permanecen invisibles. Los contadores además parten de "0". | 2.4.3 Orden de foco (robustez/contenido disponible) · 4.1.1 |
| A3 | Los elementos interactivos `div[tabindex]` de la línea de tiempo y la galería no tienen ningún estilo de foco (el CSS solo cubre `a`, `button` e `input`). Un usuario de teclado no ve dónde está el foco. | 2.4.7 Foco visible (AA) |

### 2.3 Medios

| ID | Hallazgo | Criterio WCAG |
|----|----------|---------------|
| M1 | Incumplimiento de contraste del texto atenuado `#6a6a7a` (3.05–3.72:1, mínimo requerido 4.5:1). Afecta al hint de la línea de tiempo, etiquetas de las tarjetas de biografía, encabezados del footer, pie del footer y el indicador "Scroll". | 1.4.3 Contraste (AA) |
| M2 | La línea de tiempo usa `div[role="listitem"][tabindex="0"][aria-expanded]` como interruptor. `aria-expanded` no es válido sobre `listitem` y el rol anunciado ("elemento de lista") no comunica que sea interactivo/expandible. Además la descripción oculta con `max-height: 0` sigue siendo leída por lectores de pantalla, por lo que la expansión/contracción no se percibe igual que visualmente. | 4.1.2 Nombre, rol y valor (AA) · 1.3.2 Orden con significado |
| M3 | El *lightbox* es `role="dialog"` + `aria-modal="true"` pero no aplica *focus trap* (Tab puede salir del diálogo y seguir el contenido detrás) ni restaura el foco al elemento que lo abrió al cerrar (el foco queda en `body` porque el botón de cierre pasa a `display:none`). No cumple el patrón de diálogo modal. | Patrón ARIA dialog · UX de teclado (asociado a 2.1.1/2.4.3) |
| M4 | No existe un enlace "Saltar al contenido". El usuario de teclado debe atravesar la navegación fija en cada visita para llegar a `<main>`. | 2.4.1 Evitar bloques (A) |

### 2.4 Bajos

| ID | Hallazgo | Criterio/Justificación |
|----|----------|------------------------|
| B1 | La barra de navegación no tiene fondo hasta que el scroll supera 80 px. Sobre la foto del héroe, el contraste de los enlaces y el logo no está garantizado (depende de la zona de la imagen). | 1.4.3 (contingente al fondo) |
| B2 | El botón de menú no usa `aria-controls` y, al abrir, no se mueve el foco a la primera opción del menú; tampoco hay cierre con `Escape`. | Patrón ARIA disclosure nav · UX teclado |
| B3 | **Riesgo** de micro-desbordamiento de los números "900+"/"1200+" a 320 px: en 2 columnas la tarjeta queda en ~128 px de ancho y el texto en `font-size: clamp(2rem, 4vw, 3rem)` (28 px a raíz de 14 px) con Playfair 900 ocuparía ≈76 px frente a ~72 px disponibles. | 1.4.10 Reflow / verificación visual |
| B4 | Enlaces externos abren nueva pestaña sin indicación textual previa; redundancia de `role="list"` en `<ul>` nativo. | Buenas prácticas de UX (email/whitelist) · ARIA |

---

## 3. Evidencia concreta

Todas las referencias corresponden al contenido real de los archivos.

### A1 — Enlaces del menú móvil enfocables mientras están ocultos
- `styles.css:981-998`: dentro de `@media (max-width: 768px)`, `.nav-links { position: fixed; right: -100%; ... }`. El panel sale de la pantalla, pero **no** se le aplica `display:none`, `visibility:hidden`, `aria-hidden` ni `inert`.
- `styles.css:996-998`: solo `right: 0` al añadir `.open`. La ocultación es puramente posicional.
- `script.js:33-46`: el manejador del menú solo alterna las clases `.open`/`.active` y `aria-expanded`. Nunca se oculta del árbol de accesibilidad.
- Consecuencia: con la ventana ≤768 px, un recorrido con Tab (desde el logo) cae en `Navegación principal > Biografía` **invisible**; el indicador de foco no se aprecia (2.4.11 falla) y el usuario pierde su posición.

### A2 — Contenido invisible sin JavaScript
- `styles.css:145-154`: `.reveal { opacity: 0; transform: translateY(40px); }` como estado predeterminado; solo `.reveal.visible { opacity: 1; }`.
- `script.js:89-118`: la visibilidad se añade exclusivamente vía `IntersectionObserver`.
- Aplicado en `index.html` a: títulos y subtítulos de sección (ej. `index.html:62-63`), `.bio-grid` (`index.html:65`), `.timeline` (ítems `index.html:122-204`), `.stats-grid`/tarjetas (`index.html:217-236`), galería (`index.html:248-288`) y palmarés (`index.html:300-353`).
- Sin JS (bloqueado o error antes de `DOMContentLoaded`), todas esas secciones quedan `opacity: 0`. El hero y el footer sí son visibles porque no usan `.reveal` (el hero usa animación CSS con `forwards`, `styles.css:1111-1119;1122-1136`).
- Afectación asociada: los contadores parten de texto "0" (`index.html:219,224,229,234,302...`) y solo se rellenan con `script.js:186-251`.

### A3 — Sin indicador de foco en elementos con `tabindex`
- `styles.css:104-110`: el único estado de foco es `a:focus-visible, button:focus-visible, input:focus-visible`. Los elementos enfocables por `tabindex` están excluidos:
  - `.timeline-item` con `tabindex="0"`: `index.html:122, 136, 150, 164, 178, 192`.
  - `.gallery-item` con `tabindex="0"`: `index.html:248, 262, 276`.
- Un `<div>` no recibe anillo de foco del navegador por defecto; sin regla explícita, **no hay indicador de foco** al recorrerlos con el teclado.

### M1 — Contraste insuficiente de `--color-text-muted` (#6a6a7a)
Mediciones (comprobadas por cálculo de luminancia relativa según WCAG 2.x):

| Uso | Fondo | Ratio |
|-----|-------|-------|
| `.timeline-toggle-hint` (`styles.css:608-613`; `index.html:132,146,160,174,188,202`) | tarjeta sobre `#12121a` | **3.05:1** ✗ |
| `.bio-info-card .label` (`styles.css:478-485`; `index.html:93-102`) | tarjeta sobre `#0a0a0f` | **3.46:1** ✗ |
| `.footer-links h4`, `.footer-social h4` (`styles.css:891-898`; `index.html:373,383`) | `#12121a` | **3.51:1** ✗ |
| `.footer-bottom p` (`styles.css:953-956`; `index.html:394-395`) | `#12121a` | **3.51:1** ✗ |
| `.scroll-indicator` (`styles.css:266-281`; `index.html:48-51`, `aria-hidden`) | sobre el hero | 3.51:1 ✗ (decorativo, menor prioridad) |
| `--color-text-muted` vs `#0a0a0f` general | — | **3.72:1** ✗ |

Requisito 1.4.3 AA para texto normal: **4.5:1**. Todas las instancias quedan por debajo.
Referencias del token: `styles.css:21`.

*(Otros contrastes cumplen: texto primario 17.39:1 · secundario 7.67:1 (sobre `#0a0a0f`) y 7.23:1 (sobre `#12121a`) · oro `#d4a843` 8.92:1 · foco `#6ea8fe` 8.18:1 · texto del CTA sobre el degradado oro ≥4.91:1.)*

### M2 — Semántica de la línea de tiempo
- `index.html:120`: contenedor `div.timeline role="list"`.
- `index.html:122-204`: cada ítem es `div[role="listitem"][tabindex="0"][aria-expanded="false"]`.
- `script.js:128-175`: se alterna `.active` y `aria-expanded`, y el texto del hint entre "Clic para más detalles"/"Clic para cerrar".
- `styles.css:593-606`: la descripción se oculta con `max-height: 0; overflow: hidden; opacity: 0`, que **no la elimina del árbol de accesibilidad** (a diferencia de `display:none`/`hidden`/`aria-hidden`).
- Problemas: (1) `aria-expanded` no está permitido en el rol `listitem` (ARIA en HTML); (2) el rol anunciado es "elemento de lista", no un control; (3) los lectores de pantalla leen la descripción aunque esté "contraída".

### M3 — *Lightbox* sin gestor de foco completo
- `index.html:401-405`: `div#lightbox role="dialog" aria-modal="true" aria-label="Visor de imagen"`.
- `script.js:270-289`: al abrir, se asigna `src`/`alt` y se llama `lightboxClose.focus()` (correcto).
- `script.js:305-320`: cierre con `Escape` y restauración de scroll, pero **sin** restaurar el foco al elemento (`gallery-item`) que abrió el diálogo; al cerrar, el foco queda en `document.body`.
- No existe bloqueo de Tab dentro del diálogo: con `aria-modal="true"` el lector de pantalla y el teclado pueden recorrer el contenido tras el diálogo.

### M4 — Ausencia de enlace "Saltar al contenido"
- El primer elemento enfocable tras llegar a la página es el logo (`index.html:19`) y los enlaces de `nav` (`index.html:25-31`), todos en una `nav` fija (`styles.css:298-313`).
- No se halló ningún `a.skip-link` ni `href="#main"`.

### B1 — Navegación sin fondo hasta 80 px
- `styles.css:298-313`: `.main-nav` comienza transparente; el fondo `rgba(10,10,15,0.9)` solo aparece con `.scrolled` (`styles.css:308-313`).
- `script.js:50-56`: se añade `.scrolled` únicamente cuando `scrollY > 80`.
- En el estado inicial, enlaces y logo se dibujan sobre la foto de fondo del hero (`styles.css:188-191`); el contraste depende de la zona de imagen, no verificable estáticamente.

### B2 — Menú sin `aria-controls`, sin gestión de foco E/S
- `index.html:20-24`: el botón `#navToggle` tiene `aria-expanded` pero no `aria-controls="navLinks"`.
- `script.js:33-46`: al abrir no se desplaza el foco al primer enlace; no hay cierre con `Escape`.

### B3 — Riesgo de overflow a 320 px en los contadores
- `styles.css:1041-1044` y `1081-1083`: a ≤768 px y ≤480 px `.stats-grid` mantiene **2 columnas** (`1fr 1fr`).
- `styles.css:117-122` (`.container` padding 0 1.5rem) → a 320 px cada columna ≈ (320 − 48 − 16)/2 ≈ 128 px.
- `styles.css:667-674`: `.stat-number` en `clamp(2rem, 4vw, 3rem)`; a raíz de 14 px (`styles.css:1073-1075`) el mínimo son 28 px en Playfair 900; "1200+" ≈ 76 px frente a ~72 px de contenido útil (padding `2rem`, `styles.css:628-637`). Posible salto de línea/desbordamiento. Requiere verificación visual.

### B4 — Menores
- `index.html:343-351`: enlaces a Instagram/Wikipedia/YouTube abren en `_blank` sin aviso previo (sí incluyen `rel="noopener noreferrer"`, correcto).
- `index.html:25`: `role="list"` sobre `<ul>` nativo es redundante (dentro de lo válido).

---

## 4. Recomendaciones de corrección

| ID | Recomendación |
|----|---------------|
| A1 | Ocultar el menú del árbol de accesibilidad cuando está cerrado en móvil: aplicar `visibility: hidden` (+ `aria-hidden="true"` o `inert`) sobre `.nav-links` sin `.open`, y `visibility: visible` al abrir. Alternativa robusta: `display: none` fuera de `.open` combinado con una transición de opacidad/transform (o envolver en un contenedor con `overflow: hidden` y `max-height`). Revisar en `script.js:33-46` que el toggle siga actualizando el `aria-expanded`. |
| A2 | No ocultar contenido como estado por defecto. Opción recomendada: invertir la clase—añadir `document.documentElement.classList.add('js')` al inicio de `script.js:10` y restringir `opacity: 0` a `html.js .reveal`; añadir además un bloque `@media (scripting: none)` en `styles.css:145-154` que fuerce `opacity: 1`. Como refuerzo: los contadores deberían renderizar el valor final como texto-base en HTML (el "0" es incompatible con no-JS). |
| A3 | Ampliar la regla de foco de `styles.css:104-110` para incluir `[tabindex]`, `.timeline-item:focus-visible` y `.gallery-item:focus-visible`, usando el mismo `outline: 3px solid var(--color-focus)` con `outline-offset`. |
| M1 | Subir `--color-text-muted` a un valor ≥4.5:1 sobre ambos fondos, p. ej. `#9a9aad` (~5.7:1 en `#0a0a0f`; ~5.4:1 en `#12121a`). Alternativa puntual: usar `--color-text-secondary` (`#a0a0b0`, 7+ :1) en el hint, etiquetas y pie. Recalcular tras el cambio. |
| M2 | Convertir cada ítem en `<li><button type="button">...</button></li>` dentro de un `<ul role="list">` (o usar un `<details>/<summary>` para expansión nativa). El botón hereda el foco (resuelve A3), permite `aria-expanded` válido y elimina el `tabindex` manual. Para evitar que el texto "contraído" se lea, usar `hidden`/`display:none` real al contraer. |
| M3 | Implementar *focus trap* en el diálogo (recoger `keydown` Tab/Shift+Tab y ciclar entre los focables del lightbox) y guardar `document.activeElement` al abrir para restaurarlo al cerrar (`script.js:270-320`). Considerar `aria-labelledby` sobre la captura en lugar de duplicar `alt`. |
| M4 | Añadir tras abrir `<body>` un enlace invisible-por-default `/ visible-on-focus`: `<a class="skip-link" href="#main">Saltar al contenido</a>` (estilo con `:focus` para mostrarlo y `:focus-visible`), y `main id="main"`/`tabindex="-1"` para recibir el foco (si `<main>` es nativo no necesita `tabindex`). |
| B1 | Aplicar el fondo translúcido con `backdrop-filter` de forma permanente, o elevar el umbral y añadir mínimo un sutil gradiente oscuro bajo la `nav` en el estado inicial para garantizar contraste sobre el hero. |
| B2 | Añadir `aria-controls="navLinks"` al botón (`index.html:20`); al abrir el menú con teclado, mover el foco al primer enlace; cerrar con `Escape` (reutilizando el patrón de `script.js:305-309`). |
| B3 | En `@media (max-width: 480px)` pasar `.stats-grid` a 1 columna, o reducir a `clamp(1.6rem, 6vw, 2rem)` el mínimo de `.stat-number` y/o el padding de `.stat-card`. Verificar con captura a 320 px. |
| B4 | Indicar la apertura en pestaña nueva (texto/ícono "en nueva pestaña" o `aria-description`); mantener `rel="noopener noreferrer"`. Eliminar la redundancia `role="list"` de `index.html:25` (el `ul` nativo ya lo aporta). |

---

## 5. Pruebas que deberían repetirse después de corregir

1. **Escaneo automático:** ejecutar axe-core o pa11y con configuración "WCAG 2.2 AA" sobre la página y exigir 0 violaciones (especialmente 1.4.3, 2.4.7, 2.4.11, 4.1.2).
2. **Recorrido completo de teclado (Tab/Shift+Tab)** en 320 px y escritorio: el foco debe ser visible en todos los elementos interactivos (A3), no debe caer en elementos ocultos del menú móvil (A1) y debe respetar el orden visual.
3. **Menú móvil con teclado:** Tab hasta el botón, `Enter` abre, el foco salta al primer enlace, `Escape` cierra y el foco vuelve al botón; `aria-expanded` y `aria-controls` correctos en todo el ciclo (A1, B2).
4. **Lightbox con teclado:** Tab/Shift+Tab deben ciclar dentro del diálogo (sin salir) y, al cerrar, el foco debe volver a la imagen que lo abrió (M3). Repetir con lector de pantalla (NVDA/VoiceOver) para confirmar el anuncio de diálogo modal.
5. **Sin JavaScript:** recargar con JS deshabilitado/bloqueado y verificar que biografía, línea de tiempo, estadísticas, galería y palmarés se muestren íntegros y con números correctos (A2).
6. **Contraste:** recalcular todos los usos de `--color-text-muted` con un validador (WebAIM/axe) sobre los fondos `#0a0a0f`, `#12121a` y las tarjetas translúcidas; objetivo ≥4.5:1 (M1).
7. **Anchores de viewport:** capturas y comprobación de overflow (`document.scrollingElement.scrollWidth <= innerWidth`) en **320, 390, 768 y 1280+ px**. Prestar atención a `.stats-grid` (B3) y a la línea de tiempo apilada a la izquierda.
8. **Lector de pantalla:** en la línea de tiempo debe anunciarse "botón / expandido / contraído" y la descripción no debe leerse contraída (M2).
9. **`prefers-reduced-motion: reduce`:** todas las animaciones desactivadas y sin elementos bloqueados en `opacity: 0` (A2 parcial).
10. **Objetivos táctiles:** en un dispositivo real de 320–390 px, verificar objetivos de hit ≥24×24 px (nav, controles, enlaces del footer).
11. **Zoom/reflow:** 200 % y 400 % (equivalente a CSS reflow 1280→320 px) sin scroll horizontal ni texto cortado.
12. **Regresión de código:** `node --check script.js` sin errores y consola del navegador limpia al cargar las 4 anchuras de prueba.

---

### Nota de método
Auditoría estática: no se modificó ningún archivo. Los ratios de contraste se calcularon a partir de los tokens de color reales. Los comportamientos dependientes del motor de render (fuga de foco en móvil, posible overflow a 320 px) quedan señalados como hallazgos con su causa en el código y deben confirmarse con las pruebas de la sección 5.