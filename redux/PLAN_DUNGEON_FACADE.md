# Plan de fachada mínima para `Dungeon`

## Conclusión actual

`Dungeon` no puede recortarse por bloques desde `animate.js` sin romper XR Animator.
Hoy cumple dos roles mezclados:

1. motor legacy de juego / inventario / eventos
2. capa runtime de UI y navegación de XR Animator

La simplificación segura no es "borrar items/eventos" sino **preservar primero la superficie pública usada por XR Animator**.

---

## Superficie mínima usada por XR Animator

### 1. Runtime de eventos / menús
Uso detectado en `animate.js` y módulos XR:

- `Dungeon.run_event(...)`
- `Dungeon.events[...]`
- `Dungeon_options.events_default[...]`
- `Dungeon._event_active.id`
- `Dungeon.event_mode`
- `Dungeon.dialogue_branch_mode`
- `Dungeon._states.event_mode_locked`
- `Dungeon._states.action_allowed_in_event_mode`

Esto es el núcleo del sistema de menús, ramas, overlays y acciones contextualizadas.

### 2. Inventario / layout UI
Aunque parezca “gameplay”, parte del layout del menú depende de:

- `Dungeon.inventory.max_base`
- `Dungeon.inventory.max_row`
- `Dungeon.inventory.UI.muted`
- `Dungeon.inventory.find(...)`

Esto se usa para slots, páginas y estado de UI.

### 3. Tooltips / interacción UI
XR Animator usa directamente:

- `Dungeon.utils.tooltip(...)`

Sin eso se rompen ayudas/contextos del menú.

### 4. Movimiento / cámara / explorer mode
XR Animator reutiliza:

- `Dungeon.motion['PC movement forward']`
- `Dungeon.motion_filename_by_id`
- `Dungeon.motion_id_by_filename`
- `Dungeon.update_camera_position_base()`
- `Dungeon.para_by_grid_id[2].ground_y`

Esto afecta explorer mode, cámara y movimiento asociado a poses.

### 5. Estado de personaje / objetos / feedback
También hay uso directo de:

- `Dungeon.character.hp_add(...)`
- `Dungeon.object_base_list[0].object_list[0]._obj`
- `Dungeon.sprite.animate(...)`
- `Dungeon.sound.audio_object_by_name[...]`

---

## Dependencias peligrosas que NO se pueden borrar todavía

### `item_base.baseball`
No es solo un item opcional.
Tiene acoples directos con:

- lógica de motion end / score
- bloqueo de `event_mode`
- `object_base_list`
- `sprite.animate(...)`
- `sound.audio_object_by_name[...]`

### `item_base.social_distancing`
Tampoco es aislado.
Hoy interviene en:

- checks de duración/fin de motions
- resets al cambiar motion
- ramas de UI/eventos

### `item_base.pose`
Es crítico para pose switching y explorer mode.

---

## Estrategia segura

### Fase 5A — congelar superficie pública
Crear una lista canónica de API pública que XR Animator consume:

- eventos
- inventario/UI
- tooltips
- movimiento/cámara
- pose hooks
- feedback audiovisual

Objetivo: dejar explícito qué debe seguir existiendo aunque luego cambie la implementación interna.

### Fase 5B — fachada compat
Crear una fachada `DungeonCompat` que inicialmente delegue 1:1 al `Dungeon` real.

No reemplazar todavía comportamiento.
Solo centralizar accesos usados por XR Animator.

### Fase 5C — migrar consumidores XR
Mover accesos directos de XR Animator desde:

- `MMD_SA_options.Dungeon...`
- `MMD_SA_options.Dungeon_options...`

hacia la fachada compat.

### Fase 5D — recortar internals
Recién cuando todo XR Animator use la fachada:

- reimplementar partes mínimas
- desactivar gameplay real detrás de flags
- borrar internals no usados

---

## Próximo cambio seguro

El próximo cambio seguro es **introducir una fachada sin cambiar comportamiento**.

Orden sugerido:

1. crear módulo compat de sólo delegación
2. redirigir primero `run_event`, `utils.tooltip`, `event_mode`, `_event_active`
3. redirigir después inventario/UI
4. dejar `baseball` y `social_distancing` para el final, tras separar motion logic

---

## Lo que NO conviene hacer ahora

- borrar `item_base.baseball`
- borrar `item_base.social_distancing`
- cortar `events` / `events_default`
- tocar `object_base_list`
- tocar `run_event` sin fachada previa

Eso ya mostró regresiones visuales y deformación del rig.
