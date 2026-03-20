# Plan de cuarentena de `Dungeon` para XR Animator

## Objetivo

Reducir gradualmente la dependencia de `XR_Animator.html` respecto al stack legacy de `Dungeon`, preservando solo lo que sirve para:

- VRM
- VMC
- MediaPipe / facemesh / pose
- suavizado de captura
- animación desde archivos
- explorer mode básico mientras siga siendo útil

**No objetivo**: mantener gameplay RPG, combate, multiplayer ni lógica de dungeon crawler.

---

## Hallazgos de la revisión

### 1. `XR_Animator.html` sigue cargando `dungeon.js`

La carga real sigue ocurriendo desde `images/XR Animator/animate.js`:

- `XRA_DungeonOptionsCompat()` decide si se inyecta `js/dungeon.js`
- el bootstrap modular ya dejó comentada esa carga en `images/XR Animator/modules/bootstrap-scripts.js`, pero el path legacy sigue activo

### 2. XR Animator todavía usa bastante superficie de `Dungeon`

Hoy no se puede borrar `dungeon.js` de golpe. XR Animator depende de estas áreas:

#### A. Runtime de eventos/UI
- `Dungeon.run_event(...)`
- `Dungeon.events`
- `Dungeon.dialogue_branch_mode`
- `Dungeon._event_active`
- `Dungeon.event_mode`

#### B. Layout e inventario del menú
- `Dungeon.inventory.max_base`
- `Dungeon.inventory.max_row`
- `Dungeon.inventory.UI.muted`
- `Dungeon.item_base`

#### C. Explorer mode / cámara / suelo
- `Dungeon_options.character_movement_disabled`
- `Dungeon_options.camera_position_z_sign`
- `Dungeon.update_camera_position_base()`
- `Dungeon.para_by_grid_id[2].ground_y`
- `Dungeon.character.pos / rot / pos_update()`

#### D. Objetos auxiliares de escena
- `Dungeon.Object3D_proxy_base`
- `Dungeon.object_base_list`
- `Dungeon.utils.adjust_boundingBox(...)`

#### E. Feedback visual/sonoro
- `Dungeon.sprite.animate(...)`
- `Dungeon.sound.audio_object_by_name[...]`

### 3. Hay acoples RPG todavía vivos dentro de XR Animator

En `images/XR Animator/animate.js` siguen apareciendo referencias directas a:

- `item_base.baseball`
- `item_base.social_distancing`
- `character.hp_add(...)`

O sea: parte del contenido “de juego” fue reciclado para experiencias XR / prompts / minijuegos, así que **no todo lo temático RPG está muerto aún**.

### 4. `vrm-direct` ya es el camino correcto para el futuro

El repo ya tiene una dirección clara:

- `js/vrm-direct/vrm-direct-loader.js`
- `js/vrm-direct/vrm-direct-solver.js`
- `js/vrm-direct/vrm-direct-pose-solver.js`
- `js/vrm-direct/vrm-direct-animator.js`
- `PLAN_VRM_STANDALONE.md`

Eso encaja mucho más con el objetivo final que `Dungeon`.

---

## Qué conservar sí o sí por ahora

### Núcleo de tracking / avatar
- `js/facemesh_lib.js`
- `js/tracking/*`
- `js/one_euro_filter.js`
- `js/mocap_lib_module.js`
- `js/mmd/threex-vrm.js`
- `js/vrm-direct/*`
- `images/XR Animator/animate.js`

### Capa `Dungeon` todavía necesaria
- `run_event.js`
- `events_default.js`
- `inventory.js`
- `items.js`
- `utils.js`
- `character.js`
- `map.js`
- `Object3D_proxy_base` / `AreaDataSaved`
- partes de `scene_auto_fit.js` que tocan explorer mode

---

## Primeros candidatos a cuarentena

Ordenados de más seguro a menos seguro.

### Fase Q1 — muy probable / bajo riesgo

#### 1. `js/dungeon/multiplayer.js`
Motivo:
- no forma parte del objetivo XR actual
- las referencias están muy encapsuladas
- parece activarse solo si existe `Dungeon_options.multiplayer`

Acción propuesta:
- mover a cuarentena lógica y carga
- dejar stub mínimo `Dungeon.multiplayer = { init(){}, update_online_data(){}, process_remote_online_data(){} }`
- mantener compatibilidad si alguna comprobación espera que exista

#### 2. textos y ayudas explícitamente “game”
Ejemplo:
- copy de multiplayer
- textos “know more about this game”
- documentación residual de dungeon crawler

Acción propuesta:
- cuarentena documental/UI, no funcional

### Fase Q2 — separable con flag

#### 3. combate / combos / parry
Afecta sobre todo:
- `motions.js`
- `character.js`
- `utils.js`
- restos en `dungeon.js`

Motivo:
- arquitectura ya indica que el subsistema de combate/combo quedó desactivado en runtime
- pero todavía hay muchas definiciones cargadas

Acción propuesta:
- crear flag `XR_DISABLE_DUNGEON_COMBAT`
- si está activo, no registrar:
  - combos
  - motions `PC combat *`
  - lógica de parry
  - ataques / damage loop no usados por XR
- no borrar todavía; solo no inicializar

### Fase Q3 — bundle core legacy

#### 4. `dungeon.core.min.js` por piezas
Contiene:
- dungeon generator
- terrain
- rbush
- nipplejs

Acción propuesta:
- dividir por necesidad real
- mantener solo lo indispensable

Subcandidatos:
- `dungeon-generator.js` → casi seguro prescindible a medio plazo
- `terrain.js` → probable prescindible
- `mersenne-twister.js` → prescindible si desaparecen seeds/gameplay
- `rbush` → revisar antes; puede seguir ayudando en colisiones
- `nipplejs` → revisar según si quieres mantener explorer mode móvil

---

## Lo que NO conviene mandar a cuarentena todavía

### 1. `run_event.js`
Es el corazón de menús, prompts y ramas de XR Animator.

### 2. `events_default.js`
Mucha UI contextual de XR sigue viviendo ahí.

### 3. `inventory.js` + `items.js`
Aunque suenen a juego, hoy sostienen parte del layout y acciones del menú.

### 4. `baseball` y `social_distancing`
Son temáticos de juego, pero `animate.js` todavía los usa directamente.
No se deben quitar antes de reemplazarlos por acciones XR neutrales.

### 5. `update_camera_position_base()` y estado de explorer mode
`scene_auto_fit.js` y `animate.js` dependen de eso para bloquear movimiento, rotar cámara y fijar suelo.

---

## Plan recomendado por etapas

### Etapa 1 — Congelar superficie pública
Crear inventario oficial de la API `Dungeon` que XR usa todavía.

Salida esperada:
- lista corta `XR needs / XR does not need`
- sin tocar comportamiento

### Etapa 2 — Fachada XR mínima
Crear una capa explícita tipo `XRA_RuntimeCompat` o ampliar la actual familia `XRA_*Compat()`.

Objetivo:
- que `animate.js`, `scene_auto_fit.js` y `threex-vrm.js` dejen de hablar con `Dungeon` completo
- que hablen solo con una interfaz mínima

Interfaz mínima inicial:
- eventos
- inventory/menu layout
- explorer mode
- tooltip
- sound/sprite
- object proxy

### Etapa 3 — Cuarentena de módulos enteros
Empezar por:
1. `multiplayer.js`
2. documentación y copy de dungeon crawler
3. registro de combate/combo bajo flag

### Etapa 4 — Sustitución de semánticas “game”
Reemplazar en `animate.js`:
- `baseball`
- `social_distancing`
- `hp_add(...)`

por nombres y módulos neutrales XR, por ejemplo:
- `interaction_challenge`
- `distance_prompt`
- `avatar_feedback`

### Etapa 5 — Reducir `dungeon.core.min.js`
Cuando explorer mode y colisiones estén claros:
- quitar generator/terrain/seed
- revisar rbush
- decidir si `nipplejs` se queda o sale

### Etapa 6 — Desacoplar VRM final
Seguir la línea de `PLAN_VRM_STANDALONE.md` para que el runtime VRM + MediaPipe + smoothing pueda vivir sin `Dungeon` y ojalá sin gran parte del stack MMD legacy.

---

## Checklist manual antes de cada cuarentena

1. abre `XR_Animator.html`
2. carga un VRM
3. activa tracking MediaPipe
4. verifica facemesh / cuerpo / smoothing
5. verifica cambio de pose y motions por archivo
6. verifica menús principales
7. verifica explorer mode si sigue habilitado
8. verifica que no se rompe `scene_auto_fit`
9. revisa consola por referencias a `Dungeon.*`

---

## Siguiente paso recomendado

El siguiente paso más seguro es:

**quitar primero `multiplayer.js` del path activo mediante una fachada/stub y validar que XR Animator no cambie de comportamiento.**

Después de eso, el segundo paso sería **poner el combate detrás de un flag de runtime**, sin borrar todavía código.
