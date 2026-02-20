# Redux Pruning Notes

## Block A — MediaPipe non-core models (2026-02-20)

Objetivo: reducir tamaño sin afectar tracking base (pose/manos/cara).

Eliminados de `redux/js/@mediapipe/tasks/`:
- `efficientdet_lite0_INT8.tflite`
- `efficientdet_lite0_FP32.tflite`
- `efficientdet_lite2_INT8.tflite`
- `efficientdet_lite2_FP32.tflite`
- `efficientnet_lite0_INT8.tflite`
- `efficientnet_lite2_INT8.tflite`

Racional:
- Son modelos de **object detection / image classification**.
- El core objetivo de migración prioriza tracking Holistic + VRM.
- Se mantiene intacto: `pose_landmarker_*`, `hand_landmarker.task`, `face_landmarker.task`, wasm y holistic legacy.

Rollback rápido:
- Re-copiar estos archivos desde el árbol original a `redux/js/@mediapipe/tasks/`.

## Block B — MMD demo motions + jThree modelos opcionales (2026-02-20)

Objetivo: bajar peso fuerte manteniendo VRM base (`alicia.min.zip`) y tracking.

Eliminados:
- `redux/MMD.js/motion/demo/`
- `redux/jThree/model/Appearance Miku/`
- `redux/jThree/model/Appearance Teto IS 1.0.5/`
- `redux/jThree/model/Appearance Miku.min.zip`
- `redux/jThree/model/golem002.zip`
- `redux/jThree/model/pawn.zip`
- `redux/jThree/model/pompom.zip`
- `redux/jThree/model/yukari.zip`

Compatibilidad aplicada:
- `redux/js/mmd/defaults.js`: fallback default de modelo cambiado a
	`jThree/model/alicia.min.zip#/Alicia_solid_v02.pmx`.

Rollback rápido:
- Re-copiar los paths eliminados desde árbol original.
- Restaurar fallback anterior en `redux/js/mmd/defaults.js` si se necesita volver a `Appearance Miku`.

## Block C — imágenes top-level no esenciales (2026-02-20)

Objetivo: reducir peso en `redux/images` sin tocar `XR Animator/assets`.

Eliminado:
- 32 imágenes de texturas/fondos/miniaturas no-core (incluye `zhen-yao-...jpg`, `XR_Animator_thumbnail01/02.png`, `ST_tex*`, `ST_cube02_*`, `watershader_*`, etc.).

Resultado:
- `redux/images` quedó en ~2.7M.
- Preflight Fase 3 se mantiene OK.

Rollback rápido:
- Re-copiar los archivos desde `images/` original al mismo path en `redux/images/`.

Estado actual:
- **Rollback aplicado** para este bloque (restaurados 32 archivos), porque aparecieron `404` en assets usados en runtime (`SB_*`, `kiss_mark_*`) durante carga de VRM/escena.

## Block D — tasks-vision dev artifacts (2026-02-20)

Objetivo: recorte seguro de archivos no-runtime en `redux/js/@mediapipe/tasks/tasks-vision/`.

Eliminado:
- `README.md`
- `package.json`
- `vision.d.ts`
- `vision_bundle.cjs`
- `vision_bundle.cjs.map`
- `vision_bundle.mjs.map`

Se mantiene:
- `XRA_module_loader.js`
- `vision_bundle.mjs`
- `wasm/` completo

Resultado:
- ~952KB menos, preflight Fase 3 OK.

## Block E — MediaPipe heavy → full fallback (2026-02-20)

Objetivo: recorte fuerte en modelos de pose manteniendo tracking funcional.

Cambios:
- `redux/js/tracking/mocap-mediapipe-bridge.js`
	- Pose landmarker usa siempre `pose_landmarker_full.task`.
	- Holistic legacy usa `modelComplexity: 1`.

Eliminado:
- `redux/js/@mediapipe/tasks/pose_landmarker_heavy.task`
- `redux/js/@mediapipe/holistic/pose_landmark_heavy.tflite`

Resultado:
- ~55MB menos acumulados en este bloque.
- Preflight Fase 3 se mantiene OK.

Rollback rápido:
- Restaurar ambos archivos borrados desde árbol original.
- Revertir en `mocap-mediapipe-bridge.js` la selección `full`→`heavy/full` y `modelComplexity` dinámico.

## Block F — sourcemaps residuales (2026-02-20)

Eliminado:
- `redux/jThree/script/jquery-2.1.1.min.map`
- `redux/jThree/script/jquery.min.map`

Resultado:
- ~252KB menos.
- Sin impacto runtime esperado, preflight Fase 3 en OK.

## Block G — Holistic legacy mínimo (2026-02-20)

Eliminado:
- `redux/js/@mediapipe/holistic/_holistic.js`
- `redux/js/@mediapipe/holistic/pose_landmark_lite.tflite`

Resultado:
- ~2.8MB menos.
- Preflight Fase 3 en OK.

Nota:
- El flujo queda orientado a `modelComplexity: 1` (full) en legacy.

## Block H — Holistic metadata (2026-02-20)

Eliminado:
- `redux/js/@mediapipe/holistic/README.md`
- `redux/js/@mediapipe/holistic/index.d.ts`
- `redux/js/@mediapipe/holistic/package.json`

Resultado:
- ~20KB menos.
- Preflight Fase 3 en OK.

## Block I — Ammo legacy backups no referenciados (2026-02-20)

Objetivo: recortar copias legacy en `redux/jThree/MMDplugin` sin afectar el flujo de física activo.

Eliminado:
- `redux/jThree/MMDplugin/__ammo_v30.js`
- `redux/jThree/MMDplugin/__ammo_ORIGINAL.js`
- `redux/jThree/MMDplugin/ammo.js`

Validación previa:
- Búsqueda global de referencias sin usos runtime de esos paths.
- `redux/jThree/MMDplugin/ammo_worker.js` continúa usando:
	- `__ammo_v20200227.wasm.js`
	- `__ammo_v20200227.js`

Resultado:
- ~4.9MB menos.
- `redux` pasa de ~116M a ~111M.
- Preflight Fase 3 en OK.
- Endpoints de ammo activos (`ammo_worker.js`, `__ammo_v20200227.wasm.js`, `__ammo_v20200227.js`) en `200`.

Rollback rápido:
- Re-copiar esos tres archivos desde el árbol original a `redux/jThree/MMDplugin/`.

## Block J — Tasks Vision sin fallback no-SIMD (2026-02-20)

Objetivo: reducir peso en `tasks-vision/wasm` manteniendo el flujo SIMD principal.

Eliminado:
- `redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_nosimd_internal.wasm`
- `redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_nosimd_internal.js`

Resultado:
- ~9.6MB menos.
- `redux` pasa de ~111M a ~102M.
- Preflight Fase 3 en OK.
- `vision_wasm_internal.wasm` activo en `200`.

Riesgo/compatibilidad:
- Se elimina fallback local para navegadores sin SIMD en MediaPipe Tasks Vision.

Rollback rápido:
- Re-copiar ambos archivos desde el árbol original a `redux/js/@mediapipe/tasks/tasks-vision/wasm/`.

## Block K — Holistic sin fallback no-SIMD (2026-02-20)

Objetivo: reducir peso en Holistic legacy manteniendo la ruta SIMD.

Eliminado:
- `redux/js/@mediapipe/holistic/holistic_solution_wasm_bin.wasm`
- `redux/js/@mediapipe/holistic/holistic_solution_wasm_bin.js`

Resultado:
- ~6.7MB menos.
- `redux` pasa de ~102M a ~96M.
- Preflight Fase 3 en OK.
- `holistic.js` y `holistic_solution_simd_wasm_bin.wasm` en `200`.

Riesgo/compatibilidad:
- Se elimina fallback local no-SIMD para Holistic legacy.

Rollback rápido:
- Re-copiar ambos archivos desde el árbol original a `redux/js/@mediapipe/holistic/`.

## Block L — Imágenes top-level no referenciadas (2026-02-20)

Objetivo: recorte de bajo riesgo en `redux/images` con búsqueda previa de referencias.

Eliminado:
- `redux/images/zhen-yao-2bG6fFQDLLQ-unsplash.jpg`
- `redux/images/texture_vocaloids00.jpg`
- `redux/images/wood_wallpaper_flip-h.jpg`
- `redux/images/texture_floor_marble.jpg`
- `redux/images/XR_Animator_thumbnail01.png`
- `redux/images/XR_Animator_thumbnail02.png`

Resultado:
- ~3.1MB menos.
- `redux` pasa de ~96M a ~93M.
- `redux/images` baja a ~4.8M.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Posible impacto solo en presets legacy que esperen esos nombres fijos fuera del flujo principal.

Rollback rápido:
- Re-copiar esos 6 archivos desde `images/` original a `redux/images/`.

## Block M — Modelo opcional clock_stage_ver2 (2026-02-20)

Objetivo: recorte de asset de escenario opcional sin referencias en `redux/`.

Eliminado:
- `redux/jThree/model/clock_stage_ver2/clock_stage_ver2.pmx`
- `redux/jThree/model/clock_stage_ver2/readme.txt`
- carpeta `redux/jThree/model/clock_stage_ver2/`

Resultado:
- ~2.0MB menos.
- `redux` pasa de ~93M a ~91M.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Solo impacta presets legacy que apunten explícitamente a ese escenario.

Rollback rápido:
- Re-copiar carpeta `clock_stage_ver2/` desde `jThree/model/` original a `redux/jThree/model/`.

## Block N — Three.js fallback Electron (2026-02-20)

Objetivo: recortar bundle orientado a web removiendo fallback de Electron.

Eliminado:
- `redux/three.js/three.module.js`

Resultado:
- ~1.27MB menos.
- `redux` pasa de ~91M a ~89M.
- Preflight Fase 3 en OK.
- `redux/three.js/three.module.min.js` en `200`.

Riesgo/compatibilidad:
- El modo Electron (`webkit_electron_mode`) esperaba `three.module.js`.

Rollback rápido:
- Re-copiar `three.module.js` desde `three.js/` original a `redux/three.js/`.

## Block O — Eliminación completa de Holistic legacy (2026-02-20)

Objetivo: recorte de alto impacto priorizando MediaPipe Tasks sobre stack legacy Holistic.

Cambios:
- `redux/js/tracking/mocap-mediapipe-bridge.js`
	- El flujo `use_holistic_legacy` ahora tiene `try/catch`.
	- Si no está disponible legacy, hace fallback automático (`options.use_holistic_legacy = false`).

Eliminado:
- Carpeta completa `redux/js/@mediapipe/holistic/`.

Resultado:
- ~30.3MB menos.
- `redux` pasa de ~89M a ~61M.
- Preflight Fase 3 en OK.
- `redux/XR_Animator.html` en `200`.

Riesgo/compatibilidad:
- Se pierde soporte local de Holistic legacy.
- Flujos legacy dependen del fallback no-legacy (Tasks).

Rollback rápido:
- Re-copiar carpeta `js/@mediapipe/holistic/` desde árbol original a `redux/js/@mediapipe/holistic/`.
- Revertir cambio `try/catch` en `redux/js/tracking/mocap-mediapipe-bridge.js` si se requiere fail-hard legacy.

## Block P — Motions opcionales camera_appeal02/03 (2026-02-20)

Objetivo: poda fina de motions de cámara no usados en flujo activo.

Eliminado:
- `redux/MMD.js/motion/model/camera_appeal02.vmd`
- `redux/MMD.js/motion/model/camera_appeal03.vmd`

Resultado:
- ~326KB menos.
- `redux` pasa de ~61M a ~60M.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Solo afecta presets que hagan referencia explícita a esos dos motions.

Rollback rápido:
- Re-copiar ambos `.vmd` desde `MMD.js/motion/model/` original a `redux/MMD.js/motion/model/`.

## Block Q — Fuente embebida Symbola (2026-02-20)

Objetivo: bajar peso de CSS eliminando TTF local pesada.

Cambios:
- `redux/css/main.css`
	- `@font-face` ajustado a fuentes locales del sistema (`Symbola`, `Segoe UI Symbol`, `Noto Sans Symbols`).

Eliminado:
- `redux/css/Symbola605.ttf`

Resultado:
- ~1.72MB menos.
- `redux` pasa de ~60M a ~59M.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Puede variar la apariencia de algunos símbolos según fuentes disponibles en el sistema.

Rollback rápido:
- Re-copiar `Symbola605.ttf` desde `css/` original a `redux/css/`.
- Restaurar `src: url(Symbola605.ttf) format("truetype");` en `redux/css/main.css`.

## Block R — jQuery duplicado legacy (2026-02-20)

Objetivo: remover duplicado no usado de jQuery en `jThree/script`.

Eliminado:
- `redux/jThree/script/jquery-2.1.1.min.js`

Resultado:
- ~84KB menos.
- `redux` se mantiene en ~59M (redondeo de `du`).
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Nulo para flujo actual; la ruta activa sigue usando `jquery.min.js`.

Rollback rápido:
- Re-copiar `jquery-2.1.1.min.js` desde `jThree/script/` original a `redux/jThree/script/`.

## Block S — Assets de demo AR legacy (2026-02-20)

Objetivo: podar assets de demo AR no usados por el flujo principal.

Eliminado:
- `redux/jThree/_AR_demo_01.js`
- `redux/MMD.js/motion/model/camera_appeal01.vmd`
- `redux/MMD.js/motion/walk_n_run/walk_hip.vmd`

Resultado:
- ~544KB menos.
- `redux` pasa de ~59M a ~58M.
- Preflight Fase 3 en OK.
- `XR_Animator` y `SystemAnimator_online` en `200`.

Riesgo/compatibilidad:
- Se pierde demo AR legacy basada en `_AR_demo_01.js`.

Rollback rápido:
- Re-copiar esos 3 archivos desde árbol original a sus mismos paths en `redux/`.

## Block T — Plugin three.proton no referenciado (2026-02-20)

Objetivo: eliminar plugin legacy no usado por el flujo actual.

Eliminado:
- `redux/jThree/plugin/three.proton.js`

Resultado:
- ~114KB menos.
- `redux` se mantiene en ~58M (redondeo de `du`).
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Se pierden efectos legacy que dependan de three.proton.

Rollback rápido:
- Re-copiar `three.proton.js` desde `jThree/plugin/` original a `redux/jThree/plugin/`.

## Block U — Forzar js_min_mode + eliminar jThree no-min (2026-02-20)

Objetivo: ejecutar siempre por ruta minificada y recortar bundles no-min redundantes.

Cambios:
- `redux/js/core.js`
	- Activado `var _js_min_mode_ = true`.

Eliminado:
- `redux/jThree/script/v2.1.2_jThree.js`
- `redux/jThree/MMDplugin/v2.1.2_jThree.MMD.js`

Resultado:
- ~1.43MB menos.
- `redux` pasa de ~58M a ~57M.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Se fuerza ruta minificada; paths no-min de jThree dejan de estar disponibles.

Rollback rápido:
- Re-copiar ambos archivos desde `jThree/` original a los mismos paths en `redux/jThree/`.
- Revertir `var _js_min_mode_ = true` en `redux/js/core.js`.

## Block V — motion_demo_pack01 opcional (2026-02-20)

Objetivo: reducir tamaño removiendo motions demo no críticos.

Eliminado:
- `redux/MMD.js/motion/motion_demo_pack01.zip`

Resultado:
- ~1.85MB menos.
- `redux` pasa de ~57M a ~55M.
- Preflight Fase 3 en OK.
- `XR_Animator` y `SystemAnimator_online` en `200`.

Riesgo/compatibilidad:
- Algunas coreografías demo (las que apuntaban al zip) ya no estarán disponibles.

Rollback rápido:
- Re-copiar `motion_demo_pack01.zip` desde `MMD.js/motion/` original a `redux/MMD.js/motion/`.
