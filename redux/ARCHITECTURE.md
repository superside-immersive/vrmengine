# System Animator Online — Arquitectura Completa

> Estado docs: **unificado** (2026-02-23). Este archivo es la fuente canónica de arquitectura, inventario y estado técnico. El contenido operativo de `files.md` fue consolidado aquí.

> Documento generado: 2026-02-22  
> Codebase: `redux/` (versión refactorizada)  
> Tamaño: 87 MB, 141 archivos JS, ~90,000 líneas (sin contar `.min.js`)

---

## ¿Qué es System Animator Online?

Es un **motor de animación 3D en tiempo real** que corre en el navegador. Soporta modelos **MMD (MikuMikuDance)** y **VRM**, con features como:

- **Motion capture por webcam** (cuerpo, manos, cara) usando MediaPipe
- **Dungeon crawler 3D** con exploración, inventario y generación procedural
- **Música reactiva** (BPM detection, FFT spectrum, beat-driven animation)
- **WebXR** (AR/VR)
- **Post-procesamiento** (bloom, AO, DOF, toon shading)
- **Exportación** (BVH, VMD, GLTF, video capture)

### Historia

Originalmente fue un **Windows Desktop Gadget** (`.gadget`) y ha pasado por múltiples capas de emulación:

```
Windows Gadget API → HTA → XUL/Firefox → NW.js → Electron → Web puro
```

Toda la capa de emulación (`System.Gadget.*`) existe para simular la API de Windows Desktop Gadgets en un browser moderno.

### Glosario rápido (nombres runtime)

- **MMD** en este repo significa el ecosistema/formato **MikuMikuDance** (PMX/PMD/VMD), no toda la app.
- Nombre canónico interno del runtime: **AvatarRuntime**.
- Nombre canónico interno de opciones: **AvatarRuntimeOptions**.
- Aliases legacy (compatibilidad): **MMD_SA** y **MMD_SA_options**.

---

## Cadena de Carga (Boot Sequence)

```
XR_Animator.html
│
│  <head>
│  ├─ globals.js            ← Crea namespace SA.* (state registry global)
│  ├─ module-loader.js      ← SA.loader (loadScriptSync, loadScript, loadModule)
│  ├─ core.js               ← Settings_default, toFileProtocol(), env detection
│  ├─ core_extra.js         ← SA_load_scripts(), SA_load_body(), SA_load_body2()
│  │   ├─ SA_system_emulation_ext.js  ← SystemEXT (temp folders, env vars)
│  │   ├─ SA_system_emulation.min.js  ← System.Gadget API emulation completa
│  │   └─ settings_WE.js              ← (solo si WallpaperEngine_CEF_mode)
│  │
│  └─ SA_load_scripts()     ← Lee path_demo.json, parsea URL params
│
│  <body onload="init()">
│  ├─ SA_load_body()         ← Decide qué cargar según entorno
│  │   ├─ [localhost_mode] → dragdrop.js + img_cache.js + seq.js + shell_folder.js
│  │   └─ [producción]    → _core.00.min.js (bundle de los 4 anteriores)
│  │   ├─ _SA.js             ← App principal + 15 módulos app/* + 29 módulos mmd/*
│  │   └─ _SA2.js            ← IPC, context menu, EQP_gallery, box3d, headtracker
│  │
│  └─ SA_load_body2()        ← Cierra el bootstrap
│
│  init()                    ← sa-init.js → arranca Animate_RAF(), dungeon, settings
```

### Detalle de lo que carga `_SA.js`

```
_SA.js (661 líneas)
├── js/app/*.js         (15 módulos de aplicación)
├── js/EQP.js           (ecualizador/canvas effects)
├── js/mmd/*.js         (29 módulos del motor 3D)
├── MMD.js/MMD_SA.js    (orquestador 3D central)
└── js/animate_filters.js (condicional)
```

### Detalle de lo que carga `_SA2.js`

```
_SA2.js (530 líneas)
├── IPC (comunicación inter-ventana, solo Electron)
├── js/EQP_gallery.js
├── js/EQP_canvas_effects_core.js
├── js/html5_webgl2d.js    (condicional: WebGL 2D)
├── js/svg_clock.js        (condicional: UseSVGClock)
├── js/box3d.js            (condicional: Electron)
└── js/tracking/headtracker_ar.js
```

### Startup resolver (2026-02-23)

`core_extra.js` ahora centraliza la resolución de startup en `SA_startup_context` (global y en `SA.startup.context`) y emite trazas estructuradas `[SA][startup]`.

Campos principales:

- `resolvedFolder`
- `source`
- `selectedEntry`
- `entrySource`
- `warnings[]`
- `legacyFallbackUsed`

Matriz de precedencia de startup (folder):

1. `url:f` (child animation)
2. `url:cmd_line`
3. `runtime:argv`
4. `persisted:animation_path_default` / `persisted:animation_path_default_demo`
5. `legacy:wallpaperengine-demo11` (fallback explícito + warning)

Selección de entry (`_SA.js`):

1. `declared_entry` (`SA_project_JSON.entry_js|entry|startup_entry`)
2. `legacy_auto_discovery` (`animate.js` detectado por ruta o escaneo)
3. `mmd_runtime_fallback` (`MMD.js/MMD_SA.js`)

La ruta legacy queda observada: cuando entra en auto-discovery se registra warning y `legacyFallbackUsed=true`.

### Autoridades de carga (quick map)

- Página de entrada: `XR_Animator.html`
- Resolver de startup + precedencia: `js/core_extra.js`
- Alias demo→carpeta: `js/path_demo.json`
- Selección de entry: `js/_SA.js`
- Recarga por interacción (dragdrop/relaunch): `js/app/dragdrop-handler.js`
- Persistencia de carpeta/settings: `settings.html` y `js/app/settings-io.js`

### Matriz de verificación manual de startup (2026-02-23)

Para validar que el resolver funciona correctamente en los escenarios principales. Abrir las DevTools → consola y filtrar por `[SA][startup]`.

| # | Caso | Cómo reproducirlo | `source` esperado | `entrySource` esperado | `legacyFallbackUsed` |
|---|------|-------------------|-------------------|------------------------|----------------------|
| 1 | **demo20 hardcoded** | Abrir `XR_Animator.html` sin parámetros (dev default: `cmd_line:"demo20"`) | `url:cmd_line` | `legacy_auto_discovery` | `true` |
| 2 | **Override por URL** | `XR_Animator.html?cmd_line=demo15` o con carpeta específica | `url:cmd_line` | `declared_entry` (si `SA_project.json` tiene `entry_js`) o `legacy_auto_discovery` | depende |
| 3 | **Dragdrop / reload** | Arrastrar carpeta de animación a la ventana | `url:cmd_line` (nuevo) | igual que caso 1 | — |
| 4 | **Fallback legacy WallpaperEngine** | Forzar `WallpaperEngine_CEF_mode=true` sin `cmd_line` | `legacy:wallpaperengine-demo11` | `legacy_auto_discovery` | `true` |
| 5 | **Declared entry** | Carpeta con `SA_project.json` conteniendo `"entry_js": "mi_animate.js"` | cualquier válido | `declared_entry` | `false` |

Señales de alerta en consola:

```
[SA][startup] {"stage":"folder-resolved", "source":"legacy:...", "legacyFallbackUsed":true, "warnings":[...]}
```

Indica que el arranque cayó en un path legacy — revisar `cmd_line` en `XR_Animator.html` o el `SA_project.json` de la carpeta cargada.

---

## Módulos por Capa

### 1. CAPA DE EMULACIÓN — Compatibilidad con Windows Gadget API

Hace que código escrito para la API de Windows Desktop Gadgets (`System.Gadget`, `System.Shell`, etc.) funcione en un navegador web moderno.

| Archivo | Líneas | Función |
|---------|--------|---------|
| `SA_system_emulation.min.js` | minificado | **El más crítico.** Emula toda la API `System.Gadget`, `System.Shell`, settings read/write, wallpaper masking, face detection (pico.js), fingerpose, body-pix, video capture (FFmpeg worker), BPM detection |
| `SA_system_emulation_ext.js` | ~200 | `SystemEXT` — gestión de carpetas temporales, script loading, variables de entorno |
| `_core.00.min.js` | minificado | Bundle de: `DragDrop` (drag-and-drop), `imgCache_Object` (caché de imágenes), `Seq` (motor de secuencias/timer), `Shell_ReturnItemsFromFolder` (enumeración de archivos) |
| `SA_webkit.js` | 1,402 | Bridge para NW.js/Electron/Wallpaper Engine. Emula `ActiveXObject`, `require('fs')`, `WScript.Shell` usando `SA_project_JSON` como manifest de archivos disponibles |
| `SA_gimage_emulation.js` | 165 | Emula `g:image` — sprites posicionables del Windows Gadget desktops mediante DOM elements |

### 2. CAPA CORE — Bootstrap y configuración

| Archivo | Líneas | Función |
|---------|--------|---------|
| `globals.js` | 326 | Namespace `SA.*` centralizado — `SA.platform` (detección de entorno), `SA.settings`, `SA.debug`, `SA.paths`, `SA.os` |
| `module-loader.js` | 157 | `SA.loader` — registro de scripts cargados, previene doble-carga. Métodos: `loadScriptSync()` (via document.write), `loadScript()` (async), `loadModule()` (ES import), `loadScriptsSequential()`, `loadScriptsParallel()` |
| `core.js` | 727 | `Settings_default` (todos los valores por defecto), `Setting_name_list` / `Setting_name_list_boolean`, `toFileProtocol()` → convierte paths locales a file:// URLs, `toLocalPath()` → inverso, `toRegExp()` — escape para RegExp, detección de entorno (Chrome, localhost, mobile, SO) |
| `core_extra.js` | 822 | `SA_load_scripts()` — lee `path_demo.json`, parsea URL params (`cmd_line`, demo IDs). `SA_load_body()` — decide si cargar archivos individuales (localhost) o bundles min.js (producción). `SA_load_body2()` — cierra bootstrap |

#### Variables globales clave definidas en core.js/core_extra.js

| Variable | Tipo | Significado |
|----------|------|-------------|
| `use_SA_browser_mode` | bool | Siempre `true` en web — indica modo HTML browser vs gadget nativo |
| `localhost_mode` | bool | `true` si URL contiene "localhost" o "192.168." — activa carga de archivos individuales en vez de bundles |
| `_js_min_mode_` | bool | `true` — indica usar bundles minificados |
| `webkit_mode` / `webkit_electron_mode` | bool | Detección de Electron/NW.js |
| `WallpaperEngine_CEF_mode` | bool | Detección de Wallpaper Engine (CEF) |
| `browser_native_mode` | bool | Modo browser nativo (no emulación) |
| `w3c_mode` | bool | Browser W3C estándar |
| `is_SA_child_animation` | bool | Si esta ventana es una child animation (iframe) |
| `SA_topmost_window` | Window | Referencia a la ventana padre o self |
| `windows_mode` / `linux_mode` / `mac_mode` | bool | Detección de SO |

### 3. CAPA DE APLICACIÓN (`js/app/`) — 15 módulos

Extraídos del monolítico `_SA.js` original durante la refactorización Step 5A-5C. Son el **corazón del runtime** de la aplicación.

| Archivo | Líneas | Función | Funciones clave |
|---------|--------|---------|-----------------|
| `sa-init.js` | 164 | **Entry point** — arranca animation loops, dungeon, settings | `init()` |
| `animate.js` | 213 | RAF animation loop — maneja framerate | `Animate_RAF()`, `Animate()`, `EV_sync_update` |
| `animate-core.js` | 511 | Lógica per-frame principal (la función más compleja) | `Animate_core()` |
| `resize.js` | 684 | Manejo de ventana: zoom, fullscreen, docking, screen adapt | `resize()` |
| `ev-processing.js` | 591 | Procesa FFT audio, EQ bands, eventos de rendimiento | `processEV()`, `updateEvent()`, `EQ_Emu` |
| `events.js` | 349 | Handlers de teclado/mouse, hotkeys | `SA_OnKeyDown_Gadget()`, `SA_OnDocument()` |
| `init-ui.js` | 361 | Setup de la UI del browser: toolbar, mouse hooks | `SA_init_browser_ui()` |
| `seq-animate.js` | 314 | Slideshow/secuencia de imágenes, FPS calculation | `SEQ_Animate()`, `SEQ_CalculateFPS()` |
| `dragdrop-handler.js` | 276 | Validación y procesamiento de archivos arrastrados | `SA_DragDropEMU()`, `DragDrop_install()` |
| `load-main.js` | 222 | Deserializa todos los settings del usuario al startup | `loadMain()` |
| `ev-init.js` | 215 | Configura el data source de animación (CPU/NET/SOUND) | `parseEventToMonitor()`, `initEV()` |
| `background.js` | 212 | Compositing del fondo — shadow layers, BG dimensions | `BG_Basic()`, `BG_AddShadow()`, `BG_dim_calculate` |
| `gallery-utils.js` | 138 | Preload de dimensiones de imágenes para galería | `loadImageDimALL()`, `loadImageDim()` |
| `settings-io.js` | 132 | Serializa settings a `System.Gadget.Settings` | `Settings_writeJS()` |
| `utils.js` | 64 | Helpers pequeños usados en todo el proyecto | `addZero()`, `random()`, `barPhysics()` |

### 4. MOTOR DE AVATAR 3D (legacy MMD naming) (`js/mmd/` + `MMD.js/`) — 29 módulos

Todos siguen el patrón **factory function**: `window.MMD_SA_createXxx = function(TX) { return {...}; }`. Se ensamblan en `MMD_SA.js` con `Object.assign(MMD_SA, MMD_SA_createXxx(TX))`.

#### 4.1 Orquestador central

| Archivo | Líneas | Función |
|---------|--------|---------|
| `MMD.js/MMD_SA.js` | 1,139 | **Core del motor de avatar 3D (legacy MMD naming).** Init, canvas setup, gravity, wiring de todos los sub-módulos. Reducido de 5,412 → 1,139 líneas (−79%) tras 3 rondas de extracción |

#### 4.2 Pipeline de rendering (THREEX)

| Archivo | Líneas | Función |
|---------|--------|---------|
| `threex-render-system.js` | 305 | WebGLRenderer, framebuffer, camera (clone/update/resize), light system (DirectionalLight + AmbientLight + shadow) |
| `threex-scene.js` | 263 | Sistema de mesh_obj (create/get/set), procesamiento de GOML scene list, carga de x_objects (objetos 3D extra) |
| `threex-model.js` | 562 | `Model_obj` class (con Animation inner class), `MMD_dummy_obj`, `find_bone()`, loader PMX |
| `mme-render.js` | 569 | Pipeline de render MME: shuffle groups, `render()`, `render_extra()`, gestión de EffectComposers |
| `mme-shaders.js` | 614 | Shaders MME/PPE: self_overlay, HDR, serious_shader, 2D shaders, GOML strings |
| `mirrors.js` | 61 | Mirror rendering, depth render mode, createMirror |

#### 4.3 Cámara y vista

| Archivo | Líneas | Función |
|---------|--------|---------|
| `camera-view.js` | 137 | camera_auto_adjust_scale/fov, center_view, center_view_lookAt |
| `camera-mod.js` | 183 | Camera_MOD — multi-mod stacking, offsets, rotation |
| `camera-shake.js` | ~80 | Shake/vibración de cámara |

#### 4.4 Modelos y animación

| Archivo | Líneas | Función |
|---------|--------|---------|
| `threex-vrm.js` | 1,413 | Carga de modelos VRM 0.x/1.0, mapeo de huesos MMD↔VRM, blend shapes, salida VMC protocol |
| `threex-motion.js` | 1,348 | Import/export de motion: VMD, BVH, conversión FBX→VMD, clases BoneKey/MorphKey |
| `bone-utils.js` | 230 | 7 funciones de utilidad de huesos MMD |
| `custom-actions.js` | 330 | match_bone, copy_first_bone_frame, custom_action_default |
| `motion-control.js` | 270 | motion_shuffle, load_external_motion, seek_motion, motion_player_control |
| `defaults.js` | 1,528 | Configuración por defecto: model paths, THREEX options, motion config, camera, dungeon defaults |

#### 4.5 Post-procesamiento y efectos

| Archivo | Líneas | Función |
|---------|--------|---------|
| `threex-ppe.js` | 1,085 | Post-processing: DOF (depth of field), N8AO (ambient occlusion), UnrealBloom, EffectComposer management |
| `vfx.js` | 344 | Visual effects: aura, ring effects, sprite-based FX con Animator class |
| `sprite.js` | 982 | Sistema de sprites 3D para efectos |
| `speech-bubble.js` | 1,075 | Burbujas de diálogo: sprite-based con cache, canvas rendering, message groups |
| `wallpaper3d.js` | 1,509 | Fondos 3D parallax con AI depth estimation (Depth Anything v2) + super-resolution (Swin2SR) |
| `ripple.js` | 160 | Física de ondas en agua (IIFE) |
| `shadowmap-spectrum.js` | 171 | toggle_shadowMap, VMDSpectrum_*, light_list, MME_init |
| `webgl2-convert.js` | 65 | Conversión de shaders WebGL1 → WebGL2 |

#### 4.6 Input y conectividad

| Archivo | Líneas | Función |
|---------|--------|---------|
| `gamepad.js` | 440 | Gamepad API — profiles de control, button/axis mapping, multi-gamepad |
| `webxr.js` | 898 | WebXR AR/VR — sesiones, hit-testing, anchors, dom_overlay |
| `osc.js` | 190 | VMC protocol — envía datos de huesos/morph via WebSocket a apps externas |
| `tray-menu.js` | 460 | Dispatch handler del menú de bandeja (Electron) |
| `threex-gui.js` | 356 | Integración dat.GUI / lil-gui para controles THREEX |
| `threex-utils.js` | 706 | Utilidades THREEX compartidas |

### 5. SISTEMA DE TRACKING (`js/tracking/` + raíz) — 18 archivos

Motion capture por webcam usando MediaPipe + TensorFlow.js.

| Archivo | Ubicación | Líneas | Función |
|---------|-----------|--------|---------|
| `mocap_lib_module.js` | js/ | 361 | **Orquestador** de body/hand/face tracking (ES module). Factory `Core(AT)` con estado compartido `S`. Maneja lifecycle de PoseNet/MoveNet/BlazePose/MediaPipe Holistic |
| `facemesh_lib.js` | js/ | 188 | **Orquestador face mesh** (IIFE). `FacemeshAT` global, config para MediaPipe Face Landmarker, eye tracking, emotion detection |
| `one_euro_filter.js` | js/ | 188 | **1€ (One Euro) Filter** — reduce jitter en señales de tracking. Soporta scalar, vector 3D, y quaternion (4D con slerp) |
| `pose_lib.js` | tracking/ | — | PoseNet/MoveNet/BlazePose body pose estimation |
| `pose_worker.js` | tracking/ | — | Web Worker para pose processing |
| `hands_lib.js` | tracking/ | — | MediaPipe hands tracking |
| `hands_worker.js` | tracking/ | — | Web Worker para procesamiento de manos |
| `facemesh_worker.js` | tracking/ | — | Web Worker para face landmarks |
| `facemesh-core.js` | tracking/ | — | Inicialización de face landmarker |
| `facemesh-draw.js` | tracking/ | — | Dibuja landmarks en canvas overlay |
| `facemesh-emotions.js` | tracking/ | — | Detección de emociones por landmarks faciales |
| `facemesh-processor.js` | tracking/ | — | Procesamiento de coordenadas faciales |
| `headtracker_ar.js` | tracking/ | — | Head tracking para AR |
| `mocap-constants.js` | tracking/ | — | Constantes de keypoints MediaPipe |
| `mocap-hands-processor.js` | tracking/ | — | Procesador de landmarks de manos |
| `mocap-mediapipe-bridge.js` | tracking/ | — | Bridge entre MediaPipe y el motor 3D |
| `mocap-pose-processor.js` | tracking/ | — | Procesador de pose body |
| `mocap-video-processor.js` | tracking/ | — | Procesamiento de frames de video |

#### Flujo de tracking

```
Webcam → Video element
  → mocap_lib_module.js (orquestador)
    → pose_worker.js      (body keypoints via Web Worker)
    → hands_worker.js     (hand landmarks via Web Worker)
    → facemesh_worker.js  (face landmarks via Web Worker)
  → one_euro_filter.js   (suavizado de señal)
  → mocap-mediapipe-bridge.js → Motor 3D (MMD_SA / THREEX)
```

### 6. DUNGEON CRAWLER (`js/dungeon/` + `dungeon.js`) — 25 archivos

Un **dungeon crawler 3D** integrado en la aplicación, construido sobre el motor MMD/Three.js. El jugador controla un personaje anime en primera/tercera persona explorando mazmorras generadas proceduralmente, sistema de inventario, eventos/diálogos tipo visual novel, y multiplayer P2P.

#### 6.1 Core

| Archivo | Líneas | Función |
|---------|--------|---------|
| `dungeon.js` | 799 | Orquestador: `_jump_physics()`, `Object3D_proxy_base` (bounding boxes), `AreaDataSaved`, random dungeon generator, defaults de iluminación/fog/sombras, joystick móvil (nipplejs), seed generation |
| `dungeon.core.min.js` | minificado | Bundle de: `MersenneTwister` (PRNG), `Dungeon` generator (rooms/corridors), `generateTerrain` (diamond-square heightmap), `rbush` (R-tree spatial index), `nipplejs` (virtual joystick mobile) |

#### 6.2 Módulos extraídos (`js/dungeon/`)

| Archivo | Líneas | Función |
|---------|--------|---------|
| `motions.js` | 585 | Definiciones de 30+ animaciones VMD del personaje |
| `restart.js` | 1,202 | Generación procedural, transiciones de área, save/load de estado |
| `game_loop.js` | 1,242 | Loop principal: movimiento, gravedad, cámara, TPS/FPS |
| `map.js` | 1,000 | Minimap con fog-of-war, grid rendering, LOD |
| `run_event.js` | 768 | Motor de eventos scripted (diálogos, branches, triggers) |
| `collision.js` | 716 | Colisiones multi-capa: esfera→AABB→mesh (Octree/R-tree) |
| `character.js` | 486 | Stats, HP, luces dinámicas, PC followers, monturas |
| `scene_init.js` | ~300 | Construcción de la escena 3D: meshes, materiales, LOD |
| `items.js` | ~300 | Items: pociones, monedas, mapa, tome-menú, bags |
| `inventory.js` | ~200 | Inventario paginado con drag-and-drop (80 slots) |
| `path_motion.js` | ~250 | Movimiento scripted por waypoints con interpolación |
| `ui.js` | ~200 | HUD: portrait, barra HP, inventory bar, tooltips |
| `key_map.js` | — | WASD + Space + flechas, swap de mapas de input |
| `i18n.js` | 248 | Traducciones EN/JA/ZH para toda la UI del dungeon |
| `sfx_check.js` | — | Verificación y carga de efectos de sonido |
| `shadow_toggle.js` | — | Toggle dinámico de sombras en grid/objetos |
| `skydome.js` | — | Esfera de cielo panorámico con blend de fog |
| `multiplayer.js` | — | P2P WebRTC (PeerJS): sync posición/animación/área |
| `events_default.js` | 705 | Player Manual, controles, menú in-game, reset options |
| `object_setup.js` | — | Registro de objetos, PC followers, GOML objects |
| `check_states.js` | — | Auto-damage, state machine del personaje |
| `pc_click_reaction.js` | — | Reacciones al click con sonidos y eventos |
| `ray-click.js` | — | Raycasting 3D para interacción con objetos |
| `utils.js` | — | Utilidades del dungeon |

---

`combat.js` y `combat_combo.js` fueron removidos, y el sistema de combate quedó desactivado en runtime.

#### 6.3 Qué HACE el Dungeon — Análisis completo de gameplay

##### A. EXPLORACIÓN Y MOVIMIENTO

**Movimiento del jugador:**
- Control direccional por teclado (WASD) con simulación delta-time per-frame
- **Curvas de aceleración** — el movimiento no es instantáneo; hay ramp-up/ramp-down suave
- **Sistema de inercia** — al soltar teclas, la velocidad se mantiene brevemente (para caídas con impulso horizontal)
- **Speed scaling** — velocidad modificable globalmente o por montura

**Dos modos de cámara:**
- **FPS mode** (por defecto): A/D rotan la cámara, W/S mueven adelante/atrás
- **TPS mode** (toggle con ↓): WASD da movimiento absoluto estilo analog-stick, cámara fija detrás del personaje
- **Target lock (legacy)**: desactivado en la configuración actual
- **Colisión de cámara**: la posición de cámara se verifica contra el grid para no atravesar paredes

**Gravedad y caídas:**
- Simulación cuadrática completa: $y = v \cdot t + \frac{1}{2}(98 \times 1.5) \cdot t^2$
- Si caes >5 frames → animación de aterrizaje en slow-motion (playback rate 0.001×)
- Si caes >1.2 segundos → el personaje se cae de bruces ("faceplant") con sonido de golpe pesado y animación de levantarse
- No puedes atacar ni moverte mientras estás en el aire

**Saltos:**
- **Forward jump**: salto corto si WASD está presionado + Space
- **High jump**: salto alto dramático si Shift + Space (sin movimiento)
- La altura escala con cuánto tiempo mantienes Space (0.25×–1.0× over 250ms)
- Física parabólica calculada con ecuaciones de velocidad/aceleración

**Sistema de monturas:**
- El jugador puede **montar objetos** (vehículos, criaturas) que se convierten en "PC follower"
- La montura puede: ocultar el personaje, cambiar posición de cámara, modificar velocidad, aplicar bone morphs
- Al desmontar, el jugador se reposiciona relativo a la dirección que mira
- Estado de montura se guarda por área

**Seguimiento de normales del suelo:**
- Los followers se adaptan a la rotación del terreno con lerp suave — las monturas se inclinan en pendientes

##### B. SISTEMA DE ACCIÓN (LEGACY DESACTIVADO)

El subsistema de combate/combo quedó desactivado en runtime y su documentación detallada fue retirada para evitar confusión.

##### C. SISTEMA DE COLISIONES

**Multi-capa:**
1. **Broad phase** — sphere-sphere (distancia rápida para descartar objetos lejanos)
2. **Narrow phase** — AABB intersection con boxes expandidos/trasladados
3. **Mesh-level** — opcional por objeto:
   - **RBush** (R-tree) para ordenar triángulos (mundos planos)
   - **Octree capsule intersection** (terreno 3D complejo) — el personaje es una cápsula

**Respuesta física:**
- **Pushback basado en masa**: `feedback = 1 - obj.mass / (obj.mass + subject.mass)` — el más liviano es empujado más
- **Sliding along walls**: cuando hay bloqueo, prueba bloquear X, Z, Y, luego combinaciones (XZ, XY, ZY) para encontrar dirección de deslizamiento
- **Ground tracking**: raycasts hacia abajo para detectar superficies, soporta caminar sobre objetos (cajas, puentes, plataformas móviles)

**Plataformas móviles:**
- El jugador trackea sobre qué objeto está parado (`ground_obj`)
- El movimiento del objeto se suma al movimiento del jugador

**Triggers/checkpoints:**
- Triggers por zona (esfera de distancia o volumen Box3) con callbacks `onenter`, `onstay`, `onexit`
- Exit conditions pueden **forzar al jugador de vuelta** a su última posición válida (muros invisibles)
- Triggers disparan eventos del juego (`run_event()`) para cutscenes, transiciones de área, encuentros

##### E. SISTEMA DE EVENTOS (estilo visual novel)

**Motor de scripting con:**
- **Diálogos/Speech Bubbles** en burbujas configurables (duración, delay, font scale, posición)
- **Branching dialogue** — el jugador elige opciones con Numpad 1-9 que saltan a diferentes `branch_index`
- **Lógica condicional** — `_if/_then/_else` con operadores (`===`, `>=`, `<`, etc.) sobre `event_flag` variables
- **Event flags** persistentes por evento para progresión de quests

**Acciones de eventos:**
| Acción | Qué hace |
|--------|----------|
| `message` | Muestra diálogo en speech bubble |
| `branch_list` | Opciones de diálogo con branches |
| `turn_to_character` | NPCs giran físicamente a mirarse durante diálogos |
| `swap_PC` | Toma control de un personaje diferente |
| `mount` / `dismount` | Montar/desmontar objetos/NPCs |
| `set_position` / `set_rotation` | Reposicionar/rotar objetos |
| `hide` / `show` | Mostrar/ocultar objetos |
| `follow_PC` / `unfollow_PC` | NPCs siguen/dejan de seguir al jugador |
| `motion` | Setea animaciones VMD en cualquier personaje |
| `inventory` | Da items al jugador |
| `combat_mode` | Legacy desactivado |
| `play_sound` | Audio posicional/global |
| `camera_focus` | Fuerza cámara a mirar un punto |
| `load_area` | Transición a otra área |
| `goto_branch` / `goto_event` | Control de flujo de eventos |

**Defeat/Victory:**
- Callbacks separadas para derrota del PC y cada enemigo
- Enemigos se ocultan al morir
- Animación de victoria cuando todos los enemigos son derrotados

##### F. ITEMS E INVENTARIO

**Items definidos:**
| Item | Función |
|------|---------|
| **_backpack_** | Toggle del panel de inventario extendido |
| **_map_** | Toggle del minimapa |
| **Tome (menu)** | Menú RPG in-game: Restart, Reset, Player Manual, Settings |
| **coin** | Moneda (stack hasta 999,999) |
| **potion_hp_50** | Poción HP medium — cura 50% del HP max (stack 9) |
| **bag01/bag02** | Bolsas de almacenamiento adicional |

**Inventario paginado:**
- **Toolbar base**: 8 slots (hotbar) siempre visibles
- **Páginas extendidas**: 3 páginas × 24 slots = 72 slots extra
- **Total**: 80 slots
- **Drag-and-drop** entre slots con swap/stack automático
- **Double-click** para usar items (con SFX de acceso/denegación)
- **Bordes de rareza** con colores
- **Tooltips** al hover con descripción

##### G. GENERACIÓN PROCEDURAL Y ÁREAS

**Dungeon generator:**
- Usa `dungeon-generator` (npm) con Mersenne Twister seeded
- Configurable: width, height, min/max room size, corridor density, interconnects
- Grid 2D donde cada celda = room ID, pared (1), o corredor (0)
- Soporta grids predefinidos como alternativa a procedural

**Sistema de áreas:**
- Múltiples `area_id` con opciones, eventos, objetos y estado independientes
- Tres modos de restart:
  - **Full reset** (0): limpia seeds + todo el estado
  - **Partial** (1): preserva seeds (mantiene mapas procedurales) pero limpia flags/inventario
  - **Area change** (2): guarda estado actual y carga nueva área

**Objetos en el mundo:**
- Placement por room ID, posición grid, o coordenadas absolutas
- Sistema de clones: un template genera múltiples instancias
- **LOD**: objetos cercanos con mesh full, lejanos se convierten en cubos del color del fog
- Pool/cache de meshes para rendimiento

##### H. MUNDO VISUAL

**Skydome:**
- Esfera panorámica (radio 256) con textura de cielo (4096×2048 desktop, 2048×2048 mobile)
- **Blend de fog** en el horizonte: la parte inferior del cielo tiene fill del color del fog con gradiente suave
- Sigue al jugador siempre (está en `PC_follower_list`)

**Iluminación:**
- Luz direccional con sombras (shadow camera configurable)
- Luz ambiente configurable por área
- Point lights opcionales
- **Luces dinámicas que siguen al jugador** (attached lights)

**Niebla:**
- Fog configurable near/far con color
- Soporta tinte de matrix rain

**Materiales de grid:**
- Texturas de piso/pared/techo con normal maps, specular maps, displacement maps
- Soporta superficies reflectivas (mirrors) y ondas de agua (wave effects)

**Sombras dinámicas:**
- Toggle de sombras en runtime
- Update batched por material para performance
- Cada objeto tiene flags independientes de castShadow/receiveShadow

##### I. MINIMAP

- **Canvas translúcido** anclado al bottom-right de la pantalla
- **Fog-of-war**: solo se revelan tiles que el jugador ha visitado
- **Punto blanco** = posición del jugador en tiempo real
- **Puntos amarillos** = otros jugadores en multiplayer
- **Flecha de brújula** rotativa mostrando dirección del personaje
- Escala adaptativa según viewport (2×, 4×, 8×)

##### J. CONTROLES

| Tecla | Acción |
|-------|--------|
| **W** | Mover adelante |
| **S** | Mover atrás (about-turn: gira 180° y camina) |
| **A** | Rotar izq (FPS) / Strafe izq (TPS) |
| **D** | Rotar der (FPS) / Strafe der (TPS) |
| **Space** | Salto (forward si WASD, high si Shift) |
| **↑** | Ciclar 3 distancias de cámara (close/medium/far) |
| **↓** | Toggle TPS mode / Deseleccionar target |
| **←/→** | Seleccionar enemigo anterior/siguiente |
| **Numpad 1-9** | Diálogos: elegir opción |
| **Esc** | Toggle overlay / toggle inventario |
| **Mouse drag** | Rotar cámara |
| **Mouse wheel** | Zoom |
| **Ctrl+drag** | Pan de cámara |
| **Double-click** | Interactuar con objeto / Reset cámara |

**Mobile:** Joystick virtual (nipplejs) con zonas de input escaladas

##### K. MULTIPLAYER

- **P2P via WebRTC** (PeerJS): host con `/host`, connect con `/connect <peer_id>`
- **Sincronización** a 30fps de: posición, rotación, animación/motion state, playback rate
- **Chatbox** con mensajes de join/leave
- Jugadores deben estar en mismo game_version + chapter + area
- Workaround para throttling de tabs en background
- **OPC** (Other Player Characters) aparecen como modelos 3D en el mundo

##### L. INTERNACIONALIZACIÓN

- Traducciones completas EN/JA/ZH para:
  - UI del dungeon (backpack, settings, controles)
  - Player Manual (controles básicos)
  - Menú in-game (restart, settings, misc)
  - Tooltips y mensajes del sistema

##### M. IA DE ENEMIGOS (Legacy)

El comportamiento avanzado de combate para NPCs quedó desactivado en runtime.

### 7. LIBRERÍAS 3D (`three.js/`)

Archivos de Three.js (r160+) y extensiones, la mayoría sin modificar.

#### Core

| Archivo | Función |
|---------|---------|
| `three.module.min.js` | Three.js core (ES module, minificado) |
| `three-vrm.module.min.js` | @pixiv/three-vrm — carga modelos VRM 0.x / 1.0 |
| `three-vrm-animation.module.js` | @pixiv/three-vrm-animation — reproduce animaciones VRM |
| `Geometry.js` | Polyfill de `Geometry` legacy (removida en three.js r125) |

#### Loaders

| Archivo | Función |
|---------|---------|
| `GLTFLoader.js` | Carga modelos glTF/GLB (loader base para VRM) |
| `FBXLoader.js` | Carga modelos/animaciones FBX |
| `MMDLoader.js` | Carga modelos MMD (PMD/PMX) y motions VMD |
| `_BVHLoader.js` | Carga archivos BVH motion capture (versión patcheada) |
| `EXRLoader.js` | Carga imágenes HDR en formato OpenEXR |
| `RGBELoader.js` | Carga environment maps Radiance HDR (.hdr) |
| `TGALoader.js` | Carga texturas TGA |
| `GLTFExporter.js` | Exporta escenas a glTF/GLB |

#### Post-processing

| Archivo | Función |
|---------|---------|
| `EffectComposer.js` | Manager de cadena de post-procesamiento multi-pass |
| `RenderPass.js` | Pass estándar de render de escena |
| `ShaderPass.js` | Pass genérico de shader fullscreen |
| `UnrealBloomPass.js` | Bloom HDR estilo Unreal Engine |
| `N8AO.js` | Screen-space Ambient Occlusion |
| `OutlineEffect.js` | Outline toon/cel-shade (estilo MMD) |
| `MaskPass.js` | Stencil mask para efectos selectivos |
| `OutputPass.js` | Pass final (tone mapping, color space) |
| `Pass.js` | Clase base de todos los passes |

#### Shaders

| Archivo | Función |
|---------|---------|
| `MMDToonShader.js` | Toon shading estilo MMD |
| `BokehShader2.js` | Depth-of-field bokeh |
| `CopyShader.js` | Copy/passthrough |
| `LuminosityHighPassShader.js` | Extracción de pixels brillantes para bloom |
| `OutputShader.js` | Shader final con ajustes |

#### Animation

| Archivo | Función |
|---------|---------|
| `MMDPhysics.js` | Ammo.js rigid body / joint physics para MMD |
| `MMDAnimationHelper.js` | Orquesta animación MMD (IK, física, grant) per frame |
| `CCDIKSolver.js` | Cyclic Coordinate Descent IK solver |

#### Utilidades

| Archivo | Función |
|---------|---------|
| `BufferGeometryUtils.js` | Merge/interleave buffer geometries |
| `Octree.js` | Spatial partition para colisiones/ray queries rápidas |
| `Capsule.js` | Geometría capsule para colisiones |
| `fflate.module.js` | Compresión/descompresión DEFLATE/ZIP rápida |
| `mmdparser.module.js` | Parsea archivos binarios PMD/PMX/VMD/VPD |
| `lil-gui.module.min.js` | GUI controls (sucesor de dat.gui) |
| `NURBSCurve.js` + `NURBSUtils.js` | Curvas NURBS (usadas por FBXLoader) |
| `TextureUtils.js` | Utilidades de conversión de texturas |

#### BVH → VRM Animation

| Archivo | Función |
|---------|---------|
| `convertBVHToVRMAnimation.js` | Convierte parsed BVH a VRM animation clips |
| `getRootBone.js` | Encuentra root bone de un skeleton BVH |
| `mapSkeletonToVRM.js` | Mapea bones BVH → bones humanoid VRM |
| `pickByProbability.js` | Weighted random pick para mapping |
| `VRMAnimationExporterPlugin.js` | Plugin GLTF exporter para escribir `.vrma` |

### 8. FRAMEWORK jThree (`jThree/`)

| Archivo | Líneas | Función |
|---------|--------|---------|
| `index.js` | 1,462 | **Pipeline de carga de modelos/motions** — tracking de progreso de carga (`setupUI`), creación de modelos cuando todos los assets llegan, lifecycle de x_objects (objetos 3D extra) |
| `jquery.min.js` | minificado | jQuery (dependencia legacy de jThree) |
| `three.core.min.js` | minificado | Build custom de Three.js pre-r100 (legacy, coexiste con three.module.min.js r160) |
| `three.core.effect.min.js` | minificado | Efectos para el Three.js legacy |
| `MMDplugin/` | — | Plugin MMD para jThree: `ammo_proxy.js` (proxy para física Ammo.js), shaders |
| `model/` | — | Modelos MMD empaquetados (.zip) |

### 9. UI y CSS

| Archivo | Líneas | Función |
|---------|--------|---------|
| `js/ui/panel-manager.js` | 453 | `XRA_PanelManager` — sistema de panels CSS modernos que reemplaza speech bubbles 3D, toolbar unificado. IIFE bien estructurado |
| `css/main.css` | — | Estilos principales de la aplicación |
| `css/panels.css` | — | Estilos de paneles XRA |
| `css/settings.css` | — | Estilos de la página de settings |
| `css/tabber.css` | — | Estilos del sistema de tabs |
| `settings.html` | 2,828 | Página de configuración completa (muchos controles) |

### 10. Audio y FX

| Archivo | Líneas | Función |
|---------|--------|---------|
| `beatdetektor.js` | 670 | BPM detection en tiempo real desde FFT data. Algoritmo CubicFX con 128 rangos de frecuencia. LGPL. Usado para animaciones reactivas a música |
| `jsmediatags.js` | 2,534 | Lector de metadata ID3 de archivos de audio |

### 11. Herramientas de desarrollo

| Archivo | Tipo | Función |
|---------|------|---------|
| `vrm_console_check.mjs` | Dev | Script Playwright que carga XR_Animator.html headless y espera `[XRA][VRM_LOADED]` en consola (smoke test, 90s timeout) |
| `xra_image_requests.mjs` | Dev | Script Playwright que captura todas las requests a `/redux/images/` durante 30s (para detectar imágenes muertas) |
| `phase3_preflight.sh` | Dev | Script de validación pre-commit |

---

## Archivos en Cuarentena (`js/_quarantine/`)

35 archivos movidos a cuarentena durante la poda. **Ninguno tiene copia en `js/`** (excepto `facemesh_lib.js` y `facemesh_triangulation.json`), lo que significa que los que son referenciados por código activo **dan 404 en runtime**.

### MUERTOS — Borrar sin riesgo (13 archivos)

| Archivo | Motivo |
|---------|--------|
| `aac.js` | Decoder AAC de Aurora framework, sin referencias |
| `aurora.js` | Framework de audio Aurora, sin referencias |
| `aurora_web_audio.js` | Backend Web Audio de Aurora, sin referencias |
| `mp3.js` | Decoder MP3 de Aurora, sin referencias |
| `svg.js` | SVG drawing del viejo gadget, sin referencias |
| `youtube_decode.js` | Decoder de URLs YouTube, sin referencias |
| `facemesh_lib.js` | Duplicado — copia activa existe en `js/facemesh_lib.js` |
| `facemesh_triangulation.json` | Duplicado — copia activa existe en `js/facemesh_triangulation.json` |
| `mersenne-twister.js` | Ya bundleado en `dungeon.core.min.js`, rama individual nunca ejecuta (`_js_min_mode_=true`) |
| `dungeon-generator.js` | Ya bundleado en `dungeon.core.min.js` |
| `terrain.js` | Ya bundleado en `dungeon.core.min.js` |
| `EQP_core.js` | Solo aparece en comentario de `globals.js` + cargado por `EQP.js` que está en cuarentena → cadena rota |
| `html5.js` | Cargado por `EQP.js` que está en cuarentena → cadena rota |

### DAN 404 EN RUNTIME — Necesitan restaurarse a `js/` (22 archivos)

#### Siempre fallan (se cargan en cada sesión)

| Archivo | Quién lo carga |
|---------|----------------|
| `EQP.js` | `_SA.js:180` — `SA.loader.loadScriptSync('js/EQP.js')` |
| `EQP_gallery.js` | `_SA2.js:388` |
| `EQP_canvas_effects_core.js` | `_SA2.js:391` |
| `jszip.js` | `defaults.js:1399` — lista de preload |

#### Fallan en localhost (tu entorno de desarrollo)

| Archivo | Quién lo carga | Condición |
|---------|----------------|-----------|
| `dragdrop.js` | `core_extra.js:394` | `localhost_mode` (en producción usa `_core.00.min.js`) |
| `img_cache.js` | `core_extra.js:395` | `localhost_mode` |
| `seq.js` | `core_extra.js:396` | `localhost_mode` |
| `shell_folder.js` | `core_extra.js:397` | `localhost_mode` |

#### Fallan cuando el usuario activa el feature

| Archivo | Quién lo carga | Cuándo |
|---------|----------------|--------|
| `html5_webgl2d.js` | `_SA2.js:393` + `MMD_SA.js:1151` | WebGL 2D activo |
| `box3d.js` | `_SA2.js:408` | Solo Electron |
| `svg_clock.js` | `_SA2.js:398` | `UseSVGClock` habilitado |
| `animate_filters.js` | `_SA.js:659` | `UseFilters` sin EQP_gallery |
| `BVH_filewriter.js` | `threex-motion.js:1334` | Al exportar BVH |
| `VMD_filewriter.js` | `MMD_SA.js:537` | Al exportar VMD |
| `scene_auto_fit.js` | `animate.js:8343` | Auto-fit escena activo |
| `ffmpeg_worker.js` | `SA_system_emulation.min.js` | Al capturar video |
| `fingerpose.js` | `SA_system_emulation.min.js` | Hand gesture detection |
| `pico.worker.js` | `SA_system_emulation.min.js` | Face detection (pico.js) |
| `settings_WE.js` | `core_extra.js:42` | Solo Wallpaper Engine |

#### Solo fallan en settings.html

| Archivo | Quién lo carga |
|---------|----------------|
| `SA_dialog.js` | `settings.html:12` |
| `SA_system_emulation_settings.js` | `settings.html:11` |
| `tabber-minimized.js` | `settings.html:20` |

---

## Código Obsoleto / Legacy

### Definitivamente muerto (borrable)

| Qué | Dónde | Por qué |
|-----|-------|---------|
| Flags IE9/IE8/XUL | `globals.js`, `core.js` | Siempre false, nadie usa IE/XUL. Se mantienen por propagación a child animations |
| `ActiveXObject` paths reales | `core_extra.js`, `SA_webkit.js` | Solo funciona emulado; las ramas reales son dead code |
| Silverlight (`use_Silverlight`) | `_SA.js` | Muerto desde ~2017, flag mantenida por inercia semántica |
| HTA paths (`HTA_use_GPU_acceleration`) | `core.js`, `core_extra.js` | HTA fue retirado hace años |
| Settings obsoletos | `core.js:158` | `SwapRegistryCheck`, `UseSilverlight`, `UseSL_windowless`, `XULSilverlightAuto`, `BPMByWebAudioAPI`, `Use30FPS` — marcados `// obsolete` en el propio código |
| WMP (Windows Media Player) | `_SA.js:164` | `[LEGACY REMOVED 9C]` |

### Parcialmente obsoleto (legacy mezclado con código vivo)

| Archivo | Problema |
|---------|----------|
| `core_extra.js` | ~20 comentarios `[LEGACY REMOVED]` donde las líneas fueron borradas pero los vars dummy y comentarios persisten |
| `_SA.js` | ~10 markers `[LEGACY REMOVED]` — Silverlight, xul_mode, WMP |
| `SA_system_emulation_ext.js` | Ramas enteras de `ActiveXObject` que nunca ejecutan en web |
| `resize.js` (684 líneas) | Monolítico, marcado para split futuro |
| `animate-core.js` | Paths `FSO_OBJ.FileExists` que son dead code en web |
| `ev-processing.js` | Referencias a WMI/ActiveX que nunca ejecutan |
| `jThree/three.core.min.js` | Three.js pre-r100 legacy — coexiste con three.module.min.js r160+ |

---

## Diagrama de Dependencias

```
XR_Animator.html
│
├── EMULATION LAYER ───────────────────────────────────────
│   globals.js → module-loader.js → core.js → core_extra.js
│   └── SA_system_emulation.min.js (System.Gadget API)
│   └── SA_system_emulation_ext.js (SystemEXT)
│   └── SA_webkit.js (Electron/NW.js bridge)
│   └── _core.00.min.js (DragDrop, imgCache, Seq)
│
├── APPLICATION LAYER ─────────────────────────────────────
│   _SA.js
│   ├── js/app/utils.js ─ events.js ─ init-ui.js ─ resize.js
│   ├── js/app/ev-init.js ─ animate.js ─ animate-core.js
│   ├── js/app/ev-processing.js ─ seq-animate.js
│   ├── js/app/sa-init.js ─ dragdrop-handler.js ─ load-main.js
│   ├── js/app/settings-io.js ─ background.js ─ gallery-utils.js
│   └── js/EQP.js (ecualizador/effects)
│   _SA2.js
│   └── EQP_gallery, box3d, headtracker, svg_clock
│
├── 3D ENGINE LAYER ───────────────────────────────────────
│   _SA.js → carga secuencial:
│   ├── js/mmd/speech-bubble.js ─ vfx.js ─ webxr.js ─ osc.js
│   ├── js/mmd/gamepad.js ─ wallpaper3d.js ─ sprite.js
│   ├── js/mmd/camera-shake.js ─ defaults.js
│   ├── js/mmd/threex-vrm.js ─ threex-ppe.js ─ threex-motion.js
│   ├── js/mmd/threex-utils.js ─ threex-gui.js
│   ├── js/mmd/threex-model.js ─ threex-scene.js ─ threex-render-system.js
│   ├── js/mmd/camera-view.js ─ shadowmap-spectrum.js
│   ├── js/mmd/webgl2-convert.js ─ ripple.js ─ bone-utils.js
│   ├── js/mmd/tray-menu.js ─ custom-actions.js ─ motion-control.js
│   ├── js/mmd/mme-shaders.js ─ mme-render.js ─ mirrors.js ─ camera-mod.js
│   └── MMD.js/MMD_SA.js (orquestador central)
│   Three.js ecosystem:
│   ├── three.js/three.module.min.js (r160+)
│   ├── three.js/loaders/* (GLTF, FBX, MMD, BVH, EXR, RGBE, TGA)
│   ├── three.js/postprocessing/* (Bloom, AO, DOF, Outline)
│   ├── three.js/animation/* (MMDPhysics, IK, AnimationHelper)
│   └── three.js/libs/* (fflate, mmdparser, Octree, lil-gui)
│   jThree pipeline:
│   └── jThree/index.js (model/motion loading + progress)
│
├── TRACKING LAYER ────────────────────────────────────────
│   js/mocap_lib_module.js (ES module orquestador)
│   js/facemesh_lib.js (IIFE orquestador)
│   js/one_euro_filter.js (signal smoothing)
│   └── js/tracking/*.js (16 archivos: workers, processors, bridges)
│   └── js/@mediapipe/tasks/* (WASM + ML models)
│
├── DUNGEON LAYER ─────────────────────────────────────────
│   js/dungeon.js + js/dungeon.core.min.js
│   └── js/dungeon/*.js (24 módulos)
│
├── AUDIO/FX LAYER ────────────────────────────────────────
│   js/beatdetektor.js (BPM detection)
│   js/jsmediatags.js (ID3 metadata)
│
└── UI LAYER ──────────────────────────────────────────────
    js/ui/panel-manager.js (XRA panels + toolbar)
    css/*.css
    settings.html
```

---

## Historial de Refactorización

### Update 2026-02-23 — Cleanup de export/postFX (build actual)

Se completó un cleanup funcional orientado a simplificar el runtime de `redux/`:

- **Exportación desactivada/removida del build**: rutas y toggles legacy de export (BVH/GLTF/VMD/video capture) retirados del flujo activo.
- **Post-procesamiento desactivado/removido del build**: limpieza de flags `Use3D*` y wiring de UI/settings para bloom/AO/diffusion/PPE.
- **Compatibilidad preservada**: se mantuvieron los caminos de **MediaPipe**, **VRM** y **VMC/OSC**.

Archivos clave afectados en el cierre final de postFX:

- `js/core.js`
- `js/mmd/defaults.js`
- `js/mmd/tray-menu.js`
- `settings.html`
- `js/SA_system_emulation.min.js`

Validación ejecutada:

- Búsqueda de `Use3D*` sin coincidencias en `redux/**/*.{js,html}`.
- Sintaxis OK en archivos tocados.
- Smoke test HTTP de `redux/XR_Animator.html` correcto tras reinicio.

Commit de cierre de esta etapa:

- `e1b353b` — `cleanup: remove final Use3D post-processing residues`

### MMD_SA.js — Reducción del 79%

```
Original:  5,412 líneas
Ronda R1:  5,412 → 3,279 (−2,133, −39%) — 7 módulos extraídos
Ronda R2:  3,279 → 2,500 (−779, −24%)  — 3 módulos extraídos
Ronda R3:  2,500 → 1,139 (−1,361, −54%) — 5 módulos extraídos
Total:     5,412 → 1,139 (−4,273, −79%) — 15 módulos en js/mmd/
```

### dungeon.js — Descomposición

```
Original:  8,142 líneas
Actual:    799 líneas (orquestador) + 24 módulos en js/dungeon/
```

### _SA.js — Descomposición

```
Extraídos 15 módulos a js/app/ (Steps 5A-5C)
```
