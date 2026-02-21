Archivos con más de 1000 líneas en redux
Se encontraron 33 archivos que superan las 1000 líneas. Todos son cargados (directa o dinámicamente) por XR_Animator.html.

Top 10 — Más grandes
#	Archivo	Líneas	Propósito
1	js/jszip.js	11,577	Librería JSZip (crear/leer zips)
2	three.js/libs/mmdparser.module.js	11,531	Parser de formatos MMD (PMD/PMX/VMD)
3	js/dungeon.js	8,143	Sistema de juego dungeon
4	js/mp3.js	7,754	Decoder MP3 (Aurora.js)
5	MMD.js/MMD_SA.js	2,500	Lógica principal del motor 3D MMD (era 5,412 → 3,279 → 2,500 — refactorizado R1+R2)
6	three.js/loaders/GLTFLoader.js	4,723	Loader GLTF/GLB
7	js/aac.js	4,655	Decoder AAC (Aurora.js)
8	three.js/loaders/FBXLoader.js	4,315	Loader FBX
9	js/aurora.js	3,968	Framework de audio Aurora.js
10	js/EQP_gallery.js	3,535	Sistema de galería/ecualizador
Archivos 11-33
#	Archivo	Líneas	Propósito
11	three.js/exporters/GLTFExporter.js	3,381	Exportador GLTF
12	settings.html	2,829	Página de settings (UI)
13	three.js/libs/fflate.module.js	2,673	Compresión/descompresión rápida
14	three.js/loaders/EXRLoader.js	2,564	Loader de imágenes HDR EXR
15	js/jsmediatags.js	2,535	Lector de metadata (ID3)
16	three.js/loaders/MMDLoader.js	2,238	Loader de modelos MMD
17	three.js/three-vrm-animation.module.js	2,030	Animación VRM
18	three.js/Geometry.js	1,953	Geometry legacy de Three.js
19	three.js/postprocessing/N8AO.js	1,740	Ambient Occlusion
20	js/dungeon-generator.js	1,731	Generador procedural de dungeons
21	js/mmd/defaults.js	1,531	Configs por defecto MMD
22	js/mmd/wallpaper3d.js	1,509	Fondos 3D con profundidad
23	jThree/index.js	1,462	Framework jThree (carga modelos/motion)
24	js/mmd/threex-vrm.js	1,413	Carga VRM, mapeo de huesos
25	js/SA_webkit.js	1,405	Integración WebKit/Electron
26	three.js/animation/MMDPhysics.js	1,401	Física MMD (rigid bodies)
27	js/mmd/threex-motion.js	1,348	Import/export de motion (BVH/VMD)
28	js/html5.js	1,288	Canvas/media HTML5
29	js/html5_webgl2d.js	1,249	Motor de render 2D con WebGL
30	three.js/animation/MMDAnimationHelper.js	1,208	Helper de animación MMD (IK, física)
31	js/mmd/threex-ppe.js	1,085	Post-procesamiento (DOF, Bloom)
32	js/mmd/speech-bubble.js	1,075	Burbujas de diálogo
33	js/dungeon/map.js	1,001	Renderizado del mapa dungeon
Clasificación por tipo
Librerías de terceros (no tocar): jszip, mmdparser, mp3, aac, aurora, fflate, jsmediatags, fingerpose, GLTFLoader, FBXLoader, EXRLoader, GLTFExporter, N8AO — ~14 archivos
Código propio/modificado del proyecto: MMD_SA, EQP_gallery, settings.html, defaults, wallpaper3d, jThree/index, threex-vrm, SA_webkit, threex-motion, html5, html5_webgl2d, threex-ppe, speech-bubble, dungeon, dungeon-generator, dungeon/map, Geometry — ~17 archivos
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