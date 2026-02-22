Archivos con más de 1000 líneas en redux
Se encontraron 37 archivos que superan las 1000 líneas. Todos son cargados (directa o dinámicamente) por XR_Animator.html.

---

## Poda XR_Animator (2026-02-21)

### Estado
- Poda incremental aplicada con validación automática (`redux/js/phase3_preflight.sh`) y rollback inmediato si falla.
- Endpoint y runtime objetivo mantenidos: `XR_Animator.html` + detección `[XRA][VRM_LOADED]`.
- Limpieza no funcional aplicada: eliminación de metadatos macOS `.DS_Store` en `redux/` (6 archivos), sin impacto runtime.
- Limpieza no funcional aplicada: eliminación de `MMD.js/motion/walk_n_run/Readme.txt` y `rules.txt` (docs auxiliares), sin impacto runtime.
- Limpieza no funcional aplicada: movidos a cuarentena `jThree/MMDplugin/fshader.c` y `jThree/MMDplugin/vshader.c` en `redux/_quarantine_assets/`.
- Limpieza no funcional aplicada: movidos a cuarentena `MMD.js/motion/{landing,tsuna,model,talk}/readme.txt` en `redux/_quarantine_assets/`, sin impacto runtime.
- Barrido adicional (docs/metadata/sources) sin nuevos candidatos activos de bajo riesgo en `redux/`.
- Limpieza no funcional aplicada: movida a cuarentena la carpeta vacía `MMD.js/motion/sleep` en `redux/_quarantine_assets/`, sin impacto runtime.
- Prueba agresiva controlada (1 archivo): movido a cuarentena `images/icon_document.png` (referencia sólo comentada), preflight OK sin impacto runtime.
- Prueba agresiva controlada (1 archivo): movido a cuarentena `images/icon_folder.png` (referencia sólo comentada), preflight OK sin impacto runtime.
- Prueba agresiva controlada (1 archivo): movido a cuarentena `images/icon_gallery.png` (referencia sólo comentada), preflight OK sin impacto runtime.
- Prueba agresiva controlada (1 archivo): movido a cuarentena `images/icon_setting.png` (referencia sólo comentada), preflight OK sin impacto runtime.
- Prueba agresiva controlada (1 archivo): movido a cuarentena `images/icon_closing.png` (referencia sólo comentada), preflight OK sin impacto runtime.
- Batch agresivo controlado (2 archivos): movidos a cuarentena `images/_bg_dummy/EQF_bars_bg0.png` y `images/_bg_dummy/EQF_bars_bg0_o66.png` (referencias sólo en `EQP_gallery.js` ya cuarentenado), preflight OK sin impacto runtime.
- Batch por funcionalidad (speech-bubble, 4 archivos): movidos a cuarentena `images/SB_irregular01.png`, `images/SB_kakukaku01.png`, `images/SB_mokumoku01.png`, `images/SB_mokumoku01a.png`; preflight OK sin impacto runtime.
- Reversión de emergencia aplicada: restaurados `images/SB_irregular01.png`, `images/SB_kakukaku01.png`, `images/SB_mokumoku01.png`, `images/SB_mokumoku01a.png` desde cuarentena por 404 en runtime; preflight + `[XRA][VRM_LOADED]` OK.
- Batch por funcionalidad (background/fallback, 3 archivos): movidos a cuarentena `images/bg.png`, `images/_bg_dummy/1x1.png`, `images/empty.gif`; preflight OK sin impacto runtime.
- Limpieza no funcional aplicada: eliminado `images/_dungeon/.DS_Store` (metadata macOS), preflight OK sin impacto runtime.
- Barrido de remanentes en `images/` completado: sin nuevos candidatos de bajo riesgo (activos restantes con referencias runtime; `_bg_dummy/` vacío se mantiene por compatibilidad de rutas históricas).

### Archivos movidos a cuarentena (estables)
- `js/settings_WE.js`
- `js/pico.worker.js`
- `js/facemesh_lib.js`
- `js/EQP_core.js`
- `js/EQP_gallery.js`
- `js/dungeon-generator.js`
- `js/mersenne-twister.js`
- `js/terrain.js`
- `js/EQP.js`
- `js/html5.js`
- `js/jszip.js`
- `js/aac.js`
- `js/mp3.js`
- `js/aurora_web_audio.js`
- `js/facemesh_triangulation.json`
- `js/aurora.js`

### Archivos restaurados por riesgo (mantener activos)
- `js/beatdetektor.js`
- `js/jsmediatags.js`
- `js/dungeon.js`
- `js/SA_gimage_emulation.js`
- `js/path_demo.json`
- `js/SA_webkit.js`
- `js/SA_system_emulation_ext.js`

### Archivos críticos detectados (NO mover)
- `js/SA_system_emulation.min.js` (al faltar: `System is not defined`, falla bootstrap)
- `js/_core.00.min.js` (al faltar: `imgCache_Object` / `DragDrop` no definidos)

### Regla operativa
- Si cualquier batch no logra `[XRA][VRM_LOADED]`, revertir de inmediato y marcar los archivos como críticos o de riesgo alto.

Top 10 — Más grandes
#	Archivo	Líneas	Propósito
1	js/jszip.js	11,576	Librería JSZip (crear/leer zips)
2	three.js/libs/mmdparser.module.js	11,530	Parser de formatos MMD (PMD/PMX/VMD)
3	js/dungeon.js	8,142	Sistema de juego dungeon
4	js/mp3.js	7,753	Decoder MP3 (Aurora.js)
5	three.js/loaders/GLTFLoader.js	4,722	Loader GLTF/GLB
6	js/aac.js	4,654	Decoder AAC (Aurora.js)
7	three.js/loaders/FBXLoader.js	4,314	Loader FBX
8	js/aurora.js	3,967	Framework de audio Aurora.js
9	js/EQP_gallery.js	3,534	Sistema de galería/ecualizador
10	three.js/exporters/GLTFExporter.js	3,380	Exportador GLTF
Archivos 11-37
#	Archivo	Líneas	Propósito
11	settings.html	2,828	Página de settings (UI)
12	three.js/libs/fflate.module.js	2,672	Compresión/descompresión rápida
13	three.js/loaders/EXRLoader.js	2,563	Loader de imágenes HDR EXR
14	js/jsmediatags.js	2,534	Lector de metadata (ID3)
15	three.js/loaders/MMDLoader.js	2,237	Loader de modelos MMD
16	three.js/three-vrm-animation.module.js	2,029	Animación VRM
17	three.js/Geometry.js	1,952	Geometry legacy de Three.js
18	three.js/postprocessing/N8AO.js	1,739	Ambient Occlusion
19	js/dungeon-generator.js	1,730	Generador procedural de dungeons
20	js/scene_auto_fit.js	1,622	Auto-fit de escena 3D (posición/escala adaptativa)
21	js/mmd/defaults.js	1,530	Configs por defecto MMD
22	js/mmd/wallpaper3d.js	1,508	Fondos 3D con profundidad
23	jThree/index.js	1,461	Framework jThree (carga modelos/motion)
24	js/mmd/threex-vrm.js	1,412	Carga VRM, mapeo de huesos
25	js/SA_webkit.js	1,404	Integración WebKit/Electron
26	js/dungeon/restart.js	1,404	Sistema de reinicio/restart del dungeon
27	three.js/animation/MMDPhysics.js	1,400	Física MMD (rigid bodies)
28	three.js/utils/BufferGeometryUtils.js	1,371	Utilidades de geometría (merge, compute tangents)
29	js/mmd/threex-motion.js	1,347	Import/export de motion (BVH/VMD)
30	js/html5.js	1,287	Canvas/media HTML5
31	js/html5_webgl2d.js	1,248	Motor de render 2D con WebGL
32	three.js/animation/MMDAnimationHelper.js	1,207	Helper de animación MMD (IK, física)
33	jThree/MMDplugin/ammo_proxy.js	1,169	Proxy para librería de física Ammo.js
34	MMD.js/MMD_SA.js	1,139	Lógica principal del motor 3D MMD (era 5,412 → 1,139 — refactorizado R1+R2+R3)
35	js/mmd/threex-ppe.js	1,084	Post-procesamiento (DOF, Bloom)
36	js/mmd/speech-bubble.js	1,074	Burbujas de diálogo
37	js/dungeon/map.js	1,000	Renderizado del mapa dungeon
Clasificación por tipo
Librerías de terceros (no tocar): jszip, mmdparser, mp3, aac, aurora, fflate, jsmediatags, GLTFLoader, FBXLoader, EXRLoader, GLTFExporter, N8AO, BufferGeometryUtils — ~13 archivos
Código propio/modificado del proyecto: MMD_SA, EQP_gallery, settings.html, defaults, wallpaper3d, jThree/index, threex-vrm, SA_webkit, threex-motion, html5, html5_webgl2d, threex-ppe, speech-bubble, dungeon, dungeon-generator, dungeon/map, dungeon/restart, scene_auto_fit, ammo_proxy, Geometry — ~20 archivos
Three.js adaptados: MMDLoader, MMDPhysics, MMDAnimationHelper, three-vrm-animation — ~4 archivos
Nota sobre archivos minificados
Archivos como three.js/three.module.min.js, jThree/three.core.min.js, y js/SA_system_emulation.min.js son enormes en bytes pero tienen pocas líneas por estar minificados — no aparecen en el conteo pero representan código masivo.

---

## Refactorización de MMD_SA.js — Ronda 1 (completada)

**Objetivo:** Extraer secciones independientes de MMD_SA.js a módulos en `js/mmd/`.
**Patrón:** `window.MMD_SA_createXxx = function() { return {...}; }` (factory), wired via `Object.assign(MMD_SA, ...)` post-literal.
**Resultado:** 5,412 → 3,279 líneas (−2,133, −39%).

### Módulos extraídos (7)

| # | Módulo | Líneas | Contenido |
|---|--------|--------|-----------|
| 1 | webgl2-convert.js | ~65 | 6 funciones de conversión de shaders WebGL1→WebGL2 |
| 2 | ripple.js | ~160 | Física de ondas en agua (IIFE) |
| 3 | bone-utils.js | ~230 | 7 funciones de utilidad de huesos MMD |
| 4 | tray-menu.js | ~460 | Dispatch handler del menú de bandeja del sistema |
| 5 | custom-actions.js | ~330 | match_bone, copy_first_bone_frame, custom_action_default |
| 6 | motion-control.js | ~270 | motion_shuffle, load_external_motion, seek_motion, motion_player_control |
| 7 | mme-shaders.js | ~600 | MME_PPE_*, MME_shader*, vshader_2d, fshader_2d, GOML_* |

### Total de módulos en js/mmd/: 23

audio.js, bone-utils.js, camera-shake.js, custom-actions.js, defaults.js, gamepad.js, mme-shaders.js, motion-control.js, osc.js, ripple.js, sfx.js, speech-bubble.js, sprite.js, threex-gui.js, threex-motion.js, threex-ppe.js, threex-utils.js, threex-vrm.js, tray-menu.js, vfx.js, wallpaper3d.js, webgl2-convert.js, webxr.js

---

## MMD_SA.js — Mapa estructural actual (2,500 líneas)

### Fuera de THREEX IIFE (~1,000 líneas)

| Rango | Líneas | Sección | Notas |
|-------|--------|---------|-------|
| 1-7 | 7 | Header, vars globales | — |
| 8-37 | 30 | MMD_SA object literal (core props) | Esqueleto mínimo |
| 38-443 | 406 | `MMD_SA.init()` body | Canvas setup, startup screen, media control, audio |
| 443-607 | 164 | Propiedades: music_mode, delegation, playbackRate, morphTargets | — |
| 608-615 | 8 | Comentarios de módulos extraídos (mme-render, mirrors) | — |
| 616-700 | 85 | `tray_menu_func`, `VMDSpectrum_*`, `toggle_shadowMap`, `MME_init`, `ripple_process`, `WebXR` | — |
| 700-810 | 110 | `load_texture`, `BVHLoader`, `VMD_FileWriter`, `Camera_MOD` (factory call), `get_bounding_host`, `mouse_to_ray`, `init_my_model` | — |
| 810-920 | 110 | Audio3D, Sprite, CameraShake wiring | — |
| 921-2455 | 1,535 | THREEX IIFE completa | Ver detalle abajo |
| 2456-2500 | 44 | Wiring (Object.assign, matrix rain, WebGL 2D) | — |

### Dentro de THREEX IIFE (1,535 líneas)

| Rango | Líneas | Sección | Notas |
|-------|--------|---------|-------|
| 923-1020 | 98 | `init()` — carga Three.js módulos, crea renderer | — |
| 1021-1078 | 58 | `init_common` — inicialización común post-carga | — |
| 1079-1099 | 21 | `init_on_MMDStarted` — setup por modelo al iniciar | — |
| 1100-1235 | 136 | `Model_obj` — clase/wrapper de modelo con helpers de huesos | — |
| 1236-1504 | 269 | `MMD_dummy_obj` + `find_bone()` + helpers de huesos | Candidato R3 |
| 1505-1650 | 146 | `MMD` IIFE interno — carga PMX/VMD y dispara MMDStarted | — |
| 1651-2452 | 802 | TX shared state + `threeX` object (renderer, scene, light, camera, materials, shadow, keyboard) | El más grande |

---

## Refactorización de MMD_SA.js — Ronda 2 (completada)

### Módulos extraídos (3)

| # | Módulo | Líneas | Contenido |
|---|--------|--------|-----------|
| 1 | mme-render.js | 568 | MME_shuffle, MME_set_renderToScreen, MME_composer_disabled_check, MME_check_mipmap_render_target, render(), render_extra() |
| 2 | camera-mod.js | 183 | Camera_MOD IIFE completa (multi-mod stacking, camera offsets, rotation) |
| 3 | mirrors.js | 61 | camera_list, _depth_render_mode_, createMirror, mirror_obj, _THREE_mirror |

**Resultado R2:** 3,279 → 2,500 líneas (−779, −24%)
**Resultado acumulado R1+R2:** 5,412 → 2,500 líneas (−2,912, −54%)

### Total de módulos en js/mmd/: 26

audio.js, bone-utils.js, camera-mod.js, camera-shake.js, custom-actions.js, defaults.js, gamepad.js, mirrors.js, mme-render.js, mme-shaders.js, motion-control.js, osc.js, ripple.js, sfx.js, speech-bubble.js, sprite.js, threex-gui.js, threex-motion.js, threex-ppe.js, threex-utils.js, threex-vrm.js, tray-menu.js, vfx.js, wallpaper3d.js, webgl2-convert.js, webxr.js

---

## Refactorización de MMD_SA.js — Ronda 3 (completada)

### Módulos extraídos (5)

| # | Módulo | Líneas | Patrón | Contenido |
|---|--------|--------|--------|-----------|
| 1 | camera-view.js | 137 | setup (defineProperty) | camera_auto_adjust_scale/fov, center_view, center_view_lookAt |
| 2 | shadowmap-spectrum.js | 171 | factory (Object.assign) | toggle_shadowMap, VMDSpectrum_*, light_list, MME_init |
| 3 | threex-model.js | 561 | factory TX (IIFE) | Model_obj, Animation, MMD_dummy_obj, find_bone, MMD (PMX loader) |
| 4 | threex-scene.js | 262 | factory TX (Object.assign) | mesh_obj system, GOML head/scene list processing, x_object loading |
| 5 | threex-render-system.js | 304 | factory TX (Object.assign) | renderer (WebGL, devicePixelRatio, render pipeline), camera (clone/update/resize), light (DirectionalLight, AmbientLight, shadow) |

**Resultado R3:** 2,500 → 1,139 líneas (−1,361, −54%)
**Resultado acumulado R1+R2+R3:** 5,412 → 1,139 líneas (−4,273, −79%)

### Total de módulos en js/mmd/: 31

audio.js, bone-utils.js, camera-mod.js, camera-shake.js, camera-view.js, custom-actions.js, defaults.js, gamepad.js, mirrors.js, mme-render.js, mme-shaders.js, motion-control.js, osc.js, ripple.js, sfx.js, shadowmap-spectrum.js, speech-bubble.js, sprite.js, threex-gui.js, threex-model.js, threex-motion.js, threex-ppe.js, threex-render-system.js, threex-scene.js, threex-utils.js, threex-vrm.js, tray-menu.js, vfx.js, wallpaper3d.js, webgl2-convert.js, webxr.js

---

## MMD_SA.js — Mapa estructural actual (1,139 líneas)

### Fuera de THREEX IIFE (~650 líneas)

| Rango | Líneas | Sección | Notas |
|-------|--------|---------|-------|
| 1-7 | 7 | Header, vars globales | — |
| 8-37 | 30 | MMD_SA object literal (core props) | Esqueleto mínimo |
| 38-267 | 230 | `MMD_SA.init()` body | Canvas setup, startup screen, media control, audio, camera-view setup call |
| 268-442 | 175 | Propiedades: music_mode, delegation, playbackRate, morphTargets | — |
| 443-530 | 88 | `tray_menu_func`, `ripple_process`, `WebXR` refs | Sólo llamadas a factory |
| 531-648 | 118 | `load_texture`, `BVHLoader`, `VMD_FileWriter`, `Camera_MOD`, `get_bounding_host`, `mouse_to_ray`, `init_my_model`, Audio3D, Sprite, CameraShake | Wiring/helpers |
| 649-1090 | 441 | THREEX IIFE completa | Ver detalle abajo |
| 1091-1140 | 49 | Wiring (Object.assign × 9, matrix rain, WebGL 2D) | — |

### Dentro de THREEX IIFE (441 líneas)

| Rango | Líneas | Sección | Notas |
|-------|--------|---------|-------|
| 651-719 | 69 | `init()` — carga Three.js módulos, crea renderer | — |
| 720-777 | 58 | `init_common` — inicialización común post-carga | — |
| 778-813 | 36 | `init_on_MMDStarted` — setup por modelo al iniciar | — |
| 814-816 | 3 | Comentario: Model_obj extraído | — |
| 817-858 | 42 | TX shared state object (getter/setter pairs) | Proxy a closure vars |
| 859-870 | 12 | Factory calls (Model_obj, VRM) + TX assignments | — |
| 871-895 | 25 | `var` declarations (models, mesh_obj_by_id, SLX, etc.) | Hoisted |
| 896-997 | 102 | `threeX` object start (props, getters, init, PPE) | — |
| 998-999 | 2 | Comentarios: mesh_obj + renderer/camera/light extraídos | — |
| 1000-1070 | 71 | VRM, GLTF_loader, utils.press_key | — |
| 1071-1087 | 17 | Object.assign merges (GUI, Scene, RenderSystem, Utils, Motion) | — |
| 1088-1090 | 3 | `return threeX; })();` | — |