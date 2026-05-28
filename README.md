# Better Bookmarks Canvas

Este proyecto es una **homepage personal para gestionar bookmarks** en formato tipo tablero/canvas.
Está pensada para abrirse como página de inicio del navegador y centralizar accesos rápidos de trabajo, estudio y repositorios.

---

## Objetivo del sistema

Permitir que una persona:

- Agrupe links por contexto (ej: Work, Learning, Repositories).
- Reordene visualmente sus grupos y bookmarks.
- Edite su tablero sin fricción (crear, editar, mover, borrar).
- Personalice apariencia (tema, wallpaper, densidad visual).
- Guarde todo localmente sin cuentas ni backend.

---

## Qué hace hoy (funcionalidad actual)

### 1) Estructura por secciones

- El tablero está dividido en **secciones**.
- Cada sección tiene:
  - título
  - tipo (`links` o `repos`)
  - colección de bookmarks
- Se pueden crear nuevas secciones:
  - sección normal (`links`)
  - sección de repositorios (`repos`)

### 2) Gestión completa de bookmarks

Por cada sección se puede:

- Agregar bookmark.
- Editar bookmark.
- Eliminar bookmark.
- Mover bookmark dentro de la misma sección.
- Arrastrar bookmark y soltarlo en otra sección.

Cada bookmark tiene:

- nombre (label)
- URL
- icono opcional (ej emoji)

### 3) Canvas / interacción visual

- Las secciones se muestran como tarjetas en un tablero.
- Las secciones se pueden reordenar:
  - por botones (izquierda/derecha)
  - por drag & drop
- Los bookmarks se pueden mover por drag & drop entre secciones.

### 4) Modo repositorios

Las secciones de tipo `repos` muestran los links con identidad de proveedor:

- detección de `GitHub`, `GitLab`, `Bitbucket` u `other`
- badge visual por proveedor
- extracción de `owner/repo` desde la URL cuando es posible

### 5) Búsqueda

- Input global para filtrar bookmarks por texto.
- Filtra por título y URL dentro de las secciones.

### 6) Personalización visual

- **Dark/Light mode** con toggle manual.
- Si no hay preferencia guardada, usa preferencia del sistema operativo.
- Persistencia del tema en `localStorage`.
- Wallpaper personalizado:
  - subir imagen
  - limpiar wallpaper
  - persistencia local

### 7) Preferencias de visualización

- Toggle de **compact mode** (más denso / menos denso).
- Toggle de **favicons** (mostrar/ocultar iconos de sitio).

### 8) Persistencia y migración

- Los datos se guardan localmente (sin servidor).
- Usa un modelo actual `Workspace v2`.
- Incluye migración automática desde formato legacy de secciones.

---

## Qué NO hace (todavía)

- Sin autenticación ni sincronización en la nube.
- Sin colaboración multiusuario.
- Sin import/export de workspace.
- Sin categorías jerárquicas profundas (solo secciones + bookmarks).
- Sin analíticas ni tracking.

---

## Modelo mental para diseñar UI (para LLM de diseño)

Pensar la app como:

1. **Un canvas principal** con tarjetas de secciones.
2. **Un header de control** con búsqueda y acciones globales.
3. **Interacciones de edición inline + modal** para operaciones frecuentes.
4. **Visual system limpio y rápido**: alto contraste, legibilidad, foco en escaneo.
5. **Flujo first-click fast**: abrir link en 1 click, editar en pocos pasos.

---

## Flujos clave de usuario (que el diseño debe optimizar)

1. Abrir app y lanzar un link frecuente en menos de 2 segundos.
2. Crear nueva sección y cargar 3-5 bookmarks rápidamente.
3. Arrastrar bookmarks entre secciones para reorganizar contexto.
4. Alternar Dark/Light y mantener coherencia visual.
5. Buscar un bookmark por texto parcial y abrirlo de inmediato.

---

## Restricciones del producto (importante para proponer diseño)

- Debe sentirse rápida incluso con muchas tarjetas.
- Debe mantener claridad visual en dark y light.
- Debe soportar pantallas desktop primero (responsive en mobile como secundario).
- Evitar UI recargada: priorizar rapidez, jerarquía visual y escaneabilidad.
- Mantener acciones CRUD accesibles sin saturar cada tarjeta.

---

## Prompt sugerido para pasar a un LLM de diseño

> Diseña una interfaz moderna para una homepage tipo canvas de bookmarks.
> La app permite crear secciones (`links` y `repos`), agregar/editar/eliminar/mover bookmarks, drag & drop entre secciones, búsqueda global, dark/light mode, wallpaper y toggles de densidad/favicons.
> El foco es productividad diaria: abrir enlaces rápido, reorganizar contenido sin fricción y mantener un look limpio premium.
> Proponé arquitectura visual completa (layout, componentes, estados, empty states, interacción hover/focus, tokens visuales y sistema de color), optimizada para desktop y rendimiento.