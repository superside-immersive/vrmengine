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

Estado actual:
- **Rollback aplicado**: `motion_demo_pack01.zip` restaurado en `redux/MMD.js/motion/` tras detectar `404` en runtime.

Riesgo/compatibilidad:
- Algunas coreografías demo (las que apuntaban al zip) ya no estarán disponibles.

Rollback rápido:
- Re-copiar `motion_demo_pack01.zip` desde `MMD.js/motion/` original a `redux/MMD.js/motion/`.

## Block W — assets opcionales no referenciados (2026-02-20)

Objetivo: recortar archivos sin referencias directas en `redux` y mantener estable el flujo principal de `XR_Animator`.

Eliminado:
- `redux/js/electron_main.js`
- `redux/images/sign_loop.png`
- `redux/images/ST_cube02_1.jpg`
- `redux/images/ST_cube02_2.jpg`
- `redux/images/ST_cube02_3.jpg`
- `redux/images/ST_cube02_4.jpg`
- `redux/images/ST_cube02_5.jpg`
- `redux/MMD.js/motion/tsuna/tsuna_run.vmd`
- `redux/MMD.js/motion/sleep/sleep01.vmd`
- `redux/MMD.js/motion/walk_n_run/run_H46_f60-180.vmd`
- `redux/MMD.js/motion/_kiss_blush.vmd`
- `redux/MMD.js/motion/_kiss2_blush.vmd`
- `redux/MMD.js/motion/_kiss2_blush_v01.vmd`

Resultado:
- ~0.82MB menos acumulados en el bloque.
- `redux` pasa de ~55M a ~54M.
- Preflight Fase 3 en OK.
- `XR_Animator` en `200`.

Riesgo/compatibilidad:
- Posible impacto únicamente en presets legacy que referencien explícitamente esas texturas/motions.

Rollback rápido:
- Re-copiar esos archivos desde el árbol original a sus mismos paths dentro de `redux/`.

## Block X — desactivar P2P/chat opcional (2026-02-20)

Objetivo: reducir scripts no críticos para flujo XR/tracking en build redux slim.

Cambios:
- `redux/js/core_extra.js`
	- Eliminada inyección condicional de:
		- `js/peerjs.min.js`
		- `js/chatbox.js`
	- Eliminada asignación `ChatboxAT.channel` dependiente de `P2P_network`.

Eliminado:
- `redux/js/peerjs.min.js`
- `redux/js/chatbox.js`

Resultado:
- ~188KB menos.
- `du` redondea `redux` en ~54M.
- Preflight Fase 3 en OK.
- `XR_Animator` en `200`.

Riesgo/compatibilidad:
- Se deshabilitan sesiones P2P/chatbox en el runtime redux slim.

Rollback rápido:
- Re-copiar ambos archivos desde `js/` original a `redux/js/`.
- Restaurar en `redux/js/core_extra.js` los bloques de carga condicional de PeerJS/Chatbox.

## Block Y — electron preload no-web (2026-02-20)

Objetivo: recortar archivo específico de Electron sin uso en ruta web redux.

Eliminado:
- `redux/js/electron_web_browser_preload.js`

Resultado:
- Recorte pequeño (sin cambio visible por redondeo de `du`).
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Impacta únicamente el flujo Electron preload; no afecta runtime web objetivo.

Rollback rápido:
- Re-copiar `electron_web_browser_preload.js` desde `js/` original a `redux/js/`.

## Block Z — plugins jThree legacy no referenciados (2026-02-20)

Objetivo: recortar plugins/shader backup legacy sin referencias directas en el runtime redux actual.

Eliminado:
- `redux/jThree/plugin/v2.1.2_jThree.Trackball.js`
- `redux/jThree/MMDplugin/fshader_old.c`
- `redux/jThree/plugin/three_AbstractCorridor.js`
- `redux/jThree/plugin/three_SubterraneanFlyThrough.js`
- `redux/jThree/plugin/three_NV15SpaceCurvature.js`

Resultado:
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.
- `redux/jThree` baja aprox. de ~7.5M a ~7.4M.

Riesgo/compatibilidad:
- Posible impacto solo en configuraciones legacy que invoquen explícitamente esos plugins.

Rollback rápido:
- Re-copiar los 5 archivos desde `jThree/` original a sus mismos paths dentro de `redux/jThree/`.

## Block AA — imágenes opcionales no referenciadas (2026-02-20)

Objetivo: recortar dos imágenes top-level no referenciadas por código en redux.

Eliminado:
- `redux/images/sign_construction.png`
- `redux/images/watershader_water.jpg`

Resultado:
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.
- Reducción pequeña (sin cambio visible por redondeo en `du`).

Riesgo/compatibilidad:
- Solo podría afectar presets/efectos legacy que pidan esos assets por nombre exacto.

Rollback rápido:
- Re-copiar ambos archivos desde `images/` original a `redux/images/`.

## Block AB — motions `.vmd` sueltos no referenciados (2026-02-20)

Objetivo: recortar motions individuales no referenciados por nombre en el código redux.

Eliminado:
- `redux/MMD.js/motion/hit/w01_すべって尻もち.vmd`
- `redux/MMD.js/motion/hit/r01_普通に転ぶ.vmd`
- `redux/MMD.js/motion/hit/h01_何かにぶつかる小.vmd`
- `redux/MMD.js/motion/walk_n_run/run_H16_f0-40.vmd`
- `redux/MMD.js/motion/walk_n_run/run_H26_f20-60.vmd`
- `redux/MMD.js/motion/walk_n_run/front flip.vmd`
- `redux/MMD.js/motion/kidnap.vmd`
- `redux/MMD.js/motion/PO_chest00.vmd`
- `redux/MMD.js/motion/PO_chest.vmd`

Resultado:
- ~215KB menos.
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Posible impacto en configuraciones legacy que usen esos nombres exactos.

Rollback rápido:
- Re-copiar esos 9 archivos desde `MMD.js/motion/` original a los mismos paths en `redux/MMD.js/motion/`.

## Block AC — motions `_number_meter_*` no referenciados (2026-02-20)

Objetivo: recorte incremental de motions standalone no referenciados por nombre en redux.

Eliminado:
- `redux/MMD.js/motion/_number_meter_1.vmd`
- `redux/MMD.js/motion/_number_meter_2.vmd`
- `redux/MMD.js/motion/_number_meter_3.vmd`
- `redux/MMD.js/motion/_number_meter_4.vmd`
- `redux/MMD.js/motion/_number_meter_5.vmd`

Resultado:
- ~105KB menos.
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Posible impacto en presets legacy que usen esos nombres exactos.

Rollback rápido:
- Re-copiar esos 5 archivos desde `MMD.js/motion/` original a `redux/MMD.js/motion/`.

## Block AD — motions casual/walk no referenciados (2026-02-20)

Objetivo: recorte incremental de motions sueltos no referenciados por nombre en redux.

Eliminado:
- `redux/MMD.js/motion/casual/女の子座り→立ち上がる_gumi_v01.vmd`
- `redux/MMD.js/motion/casual/へなへなと座り込む_gumi.vmd`
- `redux/MMD.js/motion/walk_n_run/walk_A04_f0-40_s13.44.vmd`
- `redux/MMD.js/motion/casual/OTL→立ち上がり.vmd`

Resultado:
- ~67KB menos.
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Posible impacto en presets legacy que usen esos nombres exactos.

Rollback rápido:
- Re-copiar esos 4 archivos desde `MMD.js/motion/` original a sus mismos paths en `redux/MMD.js/motion/`.

## Block AE — texturas ST no referenciadas (2026-02-20)

Objetivo: recortar texturas top-level no referenciadas por nombre en redux.

Eliminado:
- `redux/images/ST_tex09.jpg`
- `redux/images/ST_tex08.jpg`
- `redux/images/ST_tex03.jpg`

Resultado:
- ~402KB menos.
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.
- `redux/images` baja aprox. de ~4.4M a ~4.0M.

Riesgo/compatibilidad:
- Posible impacto en presets legacy que usen esos nombres exactos.

Rollback rápido:
- Re-copiar estos 3 archivos desde `images/` original a `redux/images/`.

## Block AF — plugins de efectos jThree no referenciados (2026-02-20)

Objetivo: recortar efectos visuales legacy no referenciados por nombre en redux.

Eliminado:
- `redux/jThree/plugin/three_RemnantX.js`
- `redux/jThree/plugin/three_CheapCloudFlythrough.js`
- `redux/jThree/plugin/three_Cubescape.js`
- `redux/jThree/plugin/three_TransparentCubeField.js`
- `redux/jThree/plugin/three_IntoTheVoid.js`

Resultado:
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.
- `redux` baja de ~55M a ~54M.
- `redux/jThree` baja aprox. de ~7.4M a ~7.3M.

Riesgo/compatibilidad:
- Posible impacto en presets/escenas legacy que usen esos efectos explícitamente.

Rollback rápido:
- Re-copiar los 5 archivos desde `jThree/plugin/` original a `redux/jThree/plugin/`.

## Block AG — plugins jThree FX adicionales no referenciados (2026-02-20)

Objetivo: mantener poda conservadora removiendo efectos legacy sin referencias por nombre en redux.

Eliminado:
- `redux/jThree/plugin/three_FractalCondos.js`
- `redux/jThree/plugin/three_CombustibleVoronoi.js`
- `redux/jThree/plugin/three_EmbellishedAV.js`
- `redux/jThree/plugin/three_FunkyDiscoBall.js`
- `redux/jThree/plugin/three_Ribbons.js`

Resultado:
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.
- Reducción pequeña (sin cambio visible por redondeo de `du` en `redux`).

Riesgo/compatibilidad:
- Posible impacto en presets/escenas legacy que usen esos efectos explícitamente.

Rollback rápido:
- Re-copiar estos 5 archivos desde `jThree/plugin/` original a `redux/jThree/plugin/`.

## Observabilidad de test (2026-02-20)

Objetivo: confirmar visualmente en consola que el VRM cargó sin depender de inspección manual indirecta.

Cambios:
- `redux/MMD.js/MMD_SA.js`
	- Auto-click de `LMMD_StartButton` en runtime redux para iniciar carga automáticamente al abrir la página.
- `redux/js/mmd/threex-vrm.js`
	- Log explícito de carga completada:
		- `console.log('[XRA][VRM_LOADED]', { index, url, isVRM1, metaVersion })`

Resultado:
- Facilita validar si “cargó el VRM” durante testing de poda.
- Mantiene `XR_Animator` y preflight en OK.

## Block AH — motions `.vmd` pequeños no referenciados (2026-02-20)

Objetivo: recortar motions sueltos no referenciados por nombre en redux.

Eliminado:
- `redux/MMD.js/motion/cover_chest_v02a.vmd`
- `redux/MMD.js/motion/cover_chest_v02.vmd`
- `redux/MMD.js/motion/cover_chest_v01.vmd`
- `redux/MMD.js/motion/penguin_stand.vmd`

Resultado:
- ~34KB menos.
- `XR_Animator` en `200`.
- Preflight Fase 3 en OK.

Riesgo/compatibilidad:
- Posible impacto en presets legacy que usen esos nombres exactos.

Rollback rápido:
- Re-copiar esos 4 archivos desde `MMD.js/motion/` original a `redux/MMD.js/motion/`.

## Validación automática VRM (2026-02-20)

Objetivo: correr en cada bloque una prueba automática que verifique carga real del modelo, no solo `200` HTTP.

Cambios:
- `redux/scripts/vrm_console_check.mjs`
	- Abre `redux/XR_Animator.html` en headless Chrome (Playwright Core).
	- Escucha consola y falla si no aparece `[XRA][VRM_LOADED]` dentro del timeout.
- `redux/scripts/phase3_preflight.sh`
	- Ejecuta VRM console-check por defecto (`RUN_VRM_CHECK=1`).
- `package.json`
	- Agrega `playwright-core` en `devDependencies`.

Resultado:
- El preflight pasa solo si hay `200` en endpoints críticos **y** aparece `[XRA][VRM_LOADED]`.

## Block AI — imágenes top-level no referenciadas (2026-02-20)

Objetivo: recorte mínimo y conservador sobre assets chicos sin referencias textuales en `redux`.

Eliminado:
- `redux/images/cc4-by-nc-sa-80x15.png`
- `redux/images/cc4-by-nc-sa-88x31.png`
- `redux/images/icon_film_64x64.png`
- `redux/images/icon_link_64x64.png`

Resultado:
- `9,646` bytes menos.
- `XR_Animator` en `200`.
- Preflight + VRM console-check en OK (`[XRA][VRM_LOADED]` detectado).

Riesgo/compatibilidad:
- Bajo; no se encontraron referencias textuales en runtime redux.

Rollback rápido:
- Re-copiar estos 4 archivos desde `images/` original a `redux/images/`.

## Block AJ — imágenes grandes no referenciadas (2026-02-20)

Objetivo: recortar imágenes de mayor tamaño sin referencias textuales en runtime redux.

Eliminado:
- `redux/images/ST_tex05.jpg`
- `redux/images/kiss_mark_red.png`
- `redux/images/ST_cube02_0.jpg`
- `redux/images/icon_miku_64x64.png`
- `redux/images/_bg_dummy/EQF_bars_bg0_o50.png`
- `redux/images/_bg_dummy/EQF_bars_blue_bg0.png`

Resultado:
- `267,161` bytes menos.
- `XR_Animator` en `200`.
- Preflight + VRM console-check en OK (`[XRA][VRM_LOADED]` detectado).
- Re-scan posterior del criterio heurístico: `0` imágenes candidatas restantes.

Riesgo/compatibilidad:
- Bajo; no se detectaron referencias textuales en runtime redux para esos nombres.

Rollback rápido:
- Re-copiar estos 6 archivos desde `images/` original a `redux/images/`.

## Block AK — imágenes grandes no solicitadas en runtime XR (2026-02-20)

Objetivo: poda guiada por requests reales de arranque de `XR_Animator` (no solo por `grep`).

Método:
- Script de auditoría agregado: `redux/scripts/xra_image_requests.mjs`.
- Resultado de auditoría en arranque: solo se solicitaron 5 imágenes top-level (`SB_*` y `kiss_mark_red_o66.png`).

Eliminado:
- `redux/images/ST_tex01.jpg`
- `redux/images/ST_tex02.jpg`
- `redux/images/ST_tex11.png`
- `redux/images/ST_tex12.png`
- `redux/images/ST_tex16.png`
- `redux/images/ST_tex19.png`
- `redux/images/bg_abstract_1024x1024.jpg`
- `redux/images/watershader_cloud.png`

Resultado:
- `881,408` bytes menos.
- `XR_Animator` en `200`.
- Preflight + VRM console-check en OK (`[XRA][VRM_LOADED]` detectado).
- Snapshot: `redux 53M`, `redux/images 2.8M`.
- No quedan imágenes grandes sueltas fuera de ZIP en `redux/images`.

Riesgo/compatibilidad:
- Medio-bajo: no solicitadas en el flujo de arranque XR validado, pero potencialmente usadas por presets legacy alternativos.

Rollback rápido:
- Re-copiar estos 8 archivos desde `images/` original a `redux/images/`.

## Block AL — motions sueltos no referenciados remanentes (2026-02-20)

Objetivo: cerrar la poda conservadora de motions sueltos con cero referencias textuales.

Eliminado:
- `redux/MMD.js/motion/_0s.vmd`
- `redux/MMD.js/motion/penguin_dance.vmd`
- `redux/MMD.js/motion/_0m.vmd`

Resultado:
- `7,751` bytes menos.
- `XR_Animator` en `200`.
- Preflight + VRM console-check en OK (`[XRA][VRM_LOADED]` detectado).

Estado conservador actual:
- Sin candidatos grandes restantes con criterio estricto de seguridad (sin referencia textual + no solicitado en arranque XR).
- El peso restante está principalmente en assets/engines críticos del runtime.

Rollback rápido:
- Re-copiar estos 3 archivos desde `MMD.js/motion/` original a `redux/MMD.js/motion/`.

## Block AM — ZIPs dungeon/SFX agresivos (2026-02-20)

Objetivo: quitar funcionalidades consideradas no prioritarias (dungeon/SFX) aunque el runtime las solicite.

Eliminado:
- `redux/images/_dungeon/item_icon.zip`
- `redux/sound/SFX_pack01.zip`

Resultado:
- `195,227` bytes menos.
- `XR_Animator` en `200`.
- Preflight + VRM console-check en OK (`[XRA][VRM_LOADED]` detectado).
- Se registran `404/XMLHttpRequestZIP ERROR` esperables para esos recursos.

Riesgo/compatibilidad:
- Medio: funcionalidades dungeon/SFX quedan degradadas o inoperativas.

Rollback rápido:
- Re-copiar ambos ZIP desde `images/_dungeon/` y `sound/` originales a `redux/`.

## Block AN — ZIPs effects/gameplay agresivos (2026-02-20)

Objetivo: eliminar recursos de efectos/gameplay secundarios para mayor reducción.

Eliminado:
- `redux/images/sprite_sheet.zip`
- `redux/MMD.js/motion/motion_rpg_pack01.zip`
- `redux/images/XR Animator/assets/motion_misc.zip`

Resultado:
- `1,059,120` bytes menos.
- `XR_Animator` en `200`.
- Preflight + VRM console-check en OK (`[XRA][VRM_LOADED]` detectado).
- Snapshot: `redux 52M`, `redux/images 2.1M`, `redux/MMD.js 2.8M`, `redux/jThree 7.3M`.
- Se registran `404/XMLHttpRequestZIP ERROR` esperables para esos recursos.

Riesgo/compatibilidad:
- Medio-alto: recorte sobre recursos solicitados en runtime (aceptado por objetivo de poda agresiva).

Rollback rápido:
- Re-copiar estos 3 ZIP desde árbol original a sus paths en `redux/`.

## Rollback AM/AN — regresión reportada (2026-02-20)

Síntoma reportado:
- Múltiples `404` y `XMLHttpRequestZIP ERROR` en carga de:
	- `images/_dungeon/item_icon.zip`
	- `sound/SFX_pack01.zip`
	- `images/sprite_sheet.zip`
	- `images/XR Animator/assets/motion_misc.zip`
	- `MMD.js/motion/motion_rpg_pack01.zip`

Acción correctiva:
- Restauración de los 5 ZIPs desde `git` (HEAD) en `redux/`.

Verificación:
- `bash redux/scripts/phase3_preflight.sh` en OK.
- `[XRA][VRM_LOADED]` detectado.
- Los ZIPs restaurados vuelven a cargar (sin `404` para esos recursos).

Estado:
- Se revierte el bloque agresivo AM/AN para volver a baseline funcional.
