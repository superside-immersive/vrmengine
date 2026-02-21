# Redux Phase Log

### Fase 0 — Baseline y control
- Objetivo: confirmar arranque actual antes de migrar.
- Archivos tocados: `docs/REDUX_MIGRATION_GUIDE.md`, `redux/PHASE_LOG.md`
- Comandos de prueba: pendiente en esta fase de implementación.
- Resultado: plan operativo creado.
- Riesgos detectados: alta carga dinámica y acoplamiento global.
- Checkpoint: pendiente.
- Rollback aplicado: No.

### Fase 1 — Scaffold mínimo
- Objetivo: crear `redux/` con entrypoint+bootstrap básico.
- Archivos tocados:
	- `redux/XR_Animator.html`
	- `redux/css/main.css`
	- `redux/js/globals.js`
	- `redux/js/module-loader.js`
	- `redux/js/core.js`
	- `redux/js/core_extra.js`
- Comandos de prueba:
	- `ls redux && ls redux/js && ls redux/css`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
- Resultado: completada (entrypoint responde `200`).
- Riesgos detectados: la carga dinámica de fases posteriores aún depende de más runtime no migrado.
- Checkpoint: pendiente (recomendado commit: `phase1: create redux scaffold minimum bootstrap`).
- Rollback aplicado: No

### Fase 2 — Runtime core dinámico
- Objetivo: migrar runtime mínimo para evitar faltantes en carga dinámica.
- Archivos tocados:
	- `redux/js/_SA.js`
	- `redux/js/SA_system_emulation.min.js`
	- `redux/js/SA_system_emulation_ext.js`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/_SA.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/SA_system_emulation.min.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/SA_system_emulation_ext.js`
- Resultado: completada (arranque en `redux/` con assets críticos servidos en `200`).
- Riesgos detectados: funcionalidad avanzada aún requiere verificación por fase (tracking, spring bones, VMC).
- Checkpoint: pendiente (recomendado commit: `phase2: copy core dynamic runtime files`).
- Rollback aplicado: No

#### Fix de arranque (errores reportados)
- Síntomas reportados:
	- `ActiveXObject is not defined`
	- `path_demo.json not found/readable/parsable`
	- `404` en `js/SA_webkit.js` y `js/jsmediatags.js`
- Causa raíz:
	- Faltaban archivos de bootstrap que fuerzan el modo webkit/browser en runtime; al faltar, caía en fallback legacy incompatible.
- Correcciones aplicadas:
	- Copiados a `redux/js`: `SA_webkit.js`, `jsmediatags.js`, `path_demo.json`.
	- Copiados bundles transitivos iniciales: `redux/js/mmd`, `redux/js/tracking`, `redux/MMD.js`, `redux/three.js`, `redux/jThree`, `redux/images/XR Animator`.
	- Copiado automático de dependencias `loadScriptSync('js/...')` faltantes detectadas en `_SA.js` (16 archivos `redux/js/app/*` y `redux/js/EQP.js`).
- Verificación:
	- Todos los endpoints críticos responden `200` en `redux/`.

### Fase 3 — Tracking Holistic + filtros
- Objetivo: verificar tracking pose/manos/cara en `redux` con recursos MediaPipe locales y smoothing activo.
- Archivos tocados:
	- `docs/REDUX_MIGRATION_GUIDE.md`
	- `redux/PHASE_LOG.md`
	- `redux/scripts/phase3_preflight.sh`
	- `redux/PHASE3_MANUAL_CHECKLIST.md`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/mocap_lib_module.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/tracking/mocap-mediapipe-bridge.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/tracking/one_euro_filter.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/tasks/pose_landmarker_full.task`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/tasks/face_landmarker.task`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/tasks/hand_landmarker.task`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_internal.wasm`
- Resultado: preflight técnico OK (`200` en entrypoint + tracking + modelos/wasm).
- Riesgos detectados: falta smoke manual con cámara para cerrar criterio de salida de Fase 3.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Preparación Fase 7 — Baseline de tamaño
- Objetivo: definir orden de poda sin romper tracking.
- Comandos de prueba:
	- `du -sh redux/* | sort -hr`
	- `du -sh redux/js/@mediapipe redux/MMD.js redux/jThree redux/three.js redux/images`
	- `find redux -type f -name '*.map' -print0 | xargs -0 du -ch | tail -1`
- Resultado:
	- Top carpetas: `redux/js` (~196M, de los cuales `redux/js/@mediapipe` ~192M), `redux/MMD.js` (~39M), `redux/jThree` (~34M).
	- `*.map` aporta ~932K (poda segura pero impacto menor).
- Riesgos detectados: la mayor reducción requiere recortar modelos/funciones opcionales; debe hacerse por bloques con smoke test entre bloques.
- Siguiente bloque propuesto (post cierre Fase 3): empezar por dungeon (`redux/js/dungeon*`, `redux/images/_dungeon`) y revalidar arranque + tracking.

### Fase 7 — Bloque A (poda conservadora MediaPipe no-core)
- Objetivo: reducir tamaño sin tocar tracking base (pose/manos/cara).
- Archivos tocados:
	- `redux/js/@mediapipe/tasks/efficientdet_lite0_INT8.tflite`
	- `redux/js/@mediapipe/tasks/efficientdet_lite0_FP32.tflite`
	- `redux/js/@mediapipe/tasks/efficientdet_lite2_INT8.tflite`
	- `redux/js/@mediapipe/tasks/efficientdet_lite2_FP32.tflite`
	- `redux/js/@mediapipe/tasks/efficientnet_lite0_INT8.tflite`
	- `redux/js/@mediapipe/tasks/efficientnet_lite2_INT8.tflite`
	- `redux/PRUNING_NOTES.md`
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe redux/js/@mediapipe/tasks`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **286M → 227M** (~59M menos).
	- Tamaño `redux/js/@mediapipe`: **192M → 133M**.
	- Preflight Fase 3: OK (`200` en entrypoint + tracking + task/wasm críticos).
- Riesgos detectados:
	- Se deshabilita disponibilidad local de detección/clasificación por esos modelos eliminados (no forma parte del core de tracking objetivo).
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque B (assets opcionales MMD/jThree)
- Objetivo: reducir tamaño en assets demo/modelos no-default conservando tracking + VRM base.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/demo/` (~34M)
	- Eliminado `redux/jThree/model/Appearance Miku/`
	- Eliminado `redux/jThree/model/Appearance Teto IS 1.0.5/`
	- Eliminado `redux/jThree/model/Appearance Miku.min.zip`
	- Eliminados `redux/jThree/model/golem002.zip`, `pawn.zip`, `pompom.zip`, `yukari.zip`
	- Ajustado fallback en `redux/js/mmd/defaults.js` para usar `jThree/model/alicia.min.zip#/Alicia_solid_v02.pmx`
- Comandos de prueba:
	- `du -sh redux redux/MMD.js redux/jThree`
	- `redux/scripts/phase3_preflight.sh`
	- `node -c redux/js/mmd/defaults.js`
- Resultado:
	- Tamaño `redux`: **227M → 175M** (~52M menos).
	- Tamaño `redux/MMD.js`: **39M → 4.8M**.
	- Tamaño `redux/jThree`: **34M → 16M**.
	- Preflight Fase 3: OK (tracking crítico mantiene `200`).
- Riesgos detectados:
	- Se eliminan modelos/motions demo opcionales; experiencias que dependan de esos paths pueden no estar disponibles.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque C (imágenes no esenciales)
- Objetivo: recortar imágenes/texturas de `redux/images` que no son core para tracking+VRM.
- Archivos tocados:
	- Eliminadas 32 imágenes top-level opcionales (`ST_tex*`, `ST_cube02_*`, thumbnails XR, wallpapers, clouds/signs/kiss marks, etc.).
- Comandos de prueba:
	- `du -sh redux redux/images redux/js redux/MMD.js redux/jThree`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **175M → 170M** (~5.1M menos).
	- Tamaño `redux/images`: **7.7M inicial → 2.7M**.
	- Preflight Fase 3: OK (`200` en entrypoint + tracking + task/wasm críticos).
- Riesgos detectados:
	- Algunos efectos visuales no-core (PPE/fondos/texturas legacy) pueden no estar disponibles.
	- `XR Animator/assets` no se tocó para evitar romper `must_load` de `animate.js`.
- Checkpoint: pendiente.
- Rollback aplicado: Sí (se restauraron 32 archivos top-level de `redux/images` tras detectar `404` en runtime sobre `SB_*` y `kiss_mark_*`).

#### Hotfix — Restauración de assets de imágenes
- Motivo: regresión funcional reportada (VRM/runtime inestable con `404` en texturas usadas por `speech-bubble` y carga de efectos).
- Acción: re-copia de los 32 archivos eliminados desde `images/` original hacia `redux/images/`.
- Verificación:
	- `200` en `redux/images/SB_irregular01.png`, `SB_mokumoku01.png`, `SB_mokumoku01a.png`, `kiss_mark_red_o66.png`, `kiss_mark_red.png`.
	- Preflight Fase 3 nuevamente en OK.

### Fase 7 — Bloque D (limpieza tasks-vision no-runtime)
- Objetivo: recortar archivos de desarrollo/documentación en `tasks-vision` sin tocar runtime `mjs + wasm`.
- Archivos tocados:
	- Eliminados `README.md`, `package.json`, `vision.d.ts`, `vision_bundle.cjs`, `vision_bundle.cjs.map`, `vision_bundle.mjs.map`.
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe/tasks/tasks-vision`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **175M → 174M** (~1M menos).
	- Preflight Fase 3: OK (`200` en entrypoint + tracking + task/wasm críticos).
- Riesgos detectados:
	- Se pierde metadata/tipos de desarrollo (sin impacto esperado en runtime browser).
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque E (fallback a modelos full + poda heavy)
- Objetivo: eliminar binarios `heavy` de MediaPipe sin romper tracking en runtime.
- Archivos tocados:
	- `redux/js/tracking/mocap-mediapipe-bridge.js`
	- Eliminado `redux/js/@mediapipe/tasks/pose_landmarker_heavy.task`
	- Eliminado `redux/js/@mediapipe/holistic/pose_landmark_heavy.tflite`
- Cambios aplicados:
	- Pose landmarker forzado a `pose_landmarker_full.task` (creación y `setOptions`).
	- Holistic legacy fijado a `modelComplexity: 1` (evita request de `pose_landmark_heavy.tflite`).
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe redux/js/@mediapipe/tasks redux/js/@mediapipe/holistic`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **174M → 119M** (~55M menos).
	- Preflight Fase 3: OK (`200` en entrypoint + tracking + task/wasm críticos).
- Riesgos detectados:
	- Opción de calidad “Best” queda degradada a modelo `full` para garantizar footprint y estabilidad.
	- `node -c` sobre `mocap-mediapipe-bridge.js` no aplica por ser módulo ES (`export`); verificación válida se hizo por runtime/preflight.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Verificación operativa — Reset de servidor
- Objetivo: confirmar estado limpio de servidor antes de continuar poda.
- Comandos de prueba:
	- `lsof -ti:8080 | xargs kill`
	- `python3 nocache_server.py 8080`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Servidor reiniciado correctamente.
	- Entry responde `200` y preflight Fase 3 en OK.

### Fase 7 — Bloque F (sourcemaps residuales)
- Objetivo: limpieza final de bajo riesgo.
- Archivos tocados:
	- Eliminado `redux/jThree/script/jquery-2.1.1.min.map`
	- Eliminado `redux/jThree/script/jquery.min.map`
- Comandos de prueba:
	- `du -sh redux`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Recorte adicional ~252KB.
	- Tamaño `redux` se mantiene reportando ~119M.
	- Preflight Fase 3: OK.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque G (Holistic legacy mínimo)
- Objetivo: recortar artefactos legacy no requeridos por la configuración actual.
- Archivos tocados:
	- Eliminado `redux/js/@mediapipe/holistic/_holistic.js`
	- Eliminado `redux/js/@mediapipe/holistic/pose_landmark_lite.tflite`
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe/holistic`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **119M → 116M** (~2.8M menos).
	- Preflight Fase 3: OK (`200` en endpoints críticos).
- Riesgos detectados:
	- Se pierde variante `lite` de holistic legacy; configuración actual sigue en `modelComplexity: 1` (full).
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque H (metadata Holistic)
- Objetivo: limpieza 100% segura de docs/tipos no-runtime.
- Archivos tocados:
	- Eliminado `redux/js/@mediapipe/holistic/README.md`
	- Eliminado `redux/js/@mediapipe/holistic/index.d.ts`
	- Eliminado `redux/js/@mediapipe/holistic/package.json`
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe/holistic`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Recorte pequeño (~20KB); tamaño `redux` se mantiene reportando ~116M.
	- Preflight Fase 3: OK.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque I (Ammo legacy backups no referenciados)
- Objetivo: recortar artefactos legacy en física MMD sin tocar el flujo activo.
- Archivos tocados:
	- Eliminado `redux/jThree/MMDplugin/__ammo_v30.js`
	- Eliminado `redux/jThree/MMDplugin/__ammo_ORIGINAL.js`
	- Eliminado `redux/jThree/MMDplugin/ammo.js`
- Validación de referencias:
	- Búsqueda global: sin referencias runtime a esos archivos.
	- `ammo_worker.js` mantiene carga de `__ammo_v20200227.wasm.js` / `__ammo_v20200227.js`.
- Comandos de prueba:
	- `du -sh redux redux/jThree redux/jThree/MMDplugin`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/jThree/MMDplugin/ammo_worker.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/jThree/MMDplugin/__ammo_v20200227.wasm.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/jThree/MMDplugin/__ammo_v20200227.js`
- Resultado:
	- Tamaño `redux`: **116M → 111M** (~4.9MB menos).
	- Preflight Fase 3: OK.
	- Endpoints activos de Ammo: `200`.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque J (Tasks Vision sin fallback no-SIMD)
- Objetivo: recorte de alto impacto en WASM de MediaPipe Tasks manteniendo flujo SIMD actual.
- Archivos tocados:
	- Eliminado `redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_nosimd_internal.wasm`
	- Eliminado `redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_nosimd_internal.js`
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe/tasks/tasks-vision/wasm`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_internal.wasm`
- Resultado:
	- Tamaño `redux`: **111M → 102M** (~9.6MB menos).
	- Preflight Fase 3: OK.
	- Runtime SIMD (`vision_wasm_internal.wasm`) en `200`.
- Riesgos detectados:
	- Navegadores sin soporte SIMD ya no tienen fallback local `nosimd` para Tasks Vision.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque K (Holistic sin fallback no-SIMD)
- Objetivo: reducir footprint de Holistic conservando ruta SIMD principal.
- Archivos tocados:
	- Eliminado `redux/js/@mediapipe/holistic/holistic_solution_wasm_bin.wasm`
	- Eliminado `redux/js/@mediapipe/holistic/holistic_solution_wasm_bin.js`
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe/holistic`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/holistic/holistic.js`
	- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/redux/js/@mediapipe/holistic/holistic_solution_simd_wasm_bin.wasm`
- Resultado:
	- Tamaño `redux`: **102M → 96M** (~6.7MB menos).
	- Preflight Fase 3: OK.
	- Endpoints SIMD Holistic activos en `200`.
- Riesgos detectados:
	- Navegadores sin SIMD ya no tienen fallback local para Holistic legacy.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque L (imágenes top-level no referenciadas)
- Objetivo: recortar assets de `redux/images` sin uso detectado en código `redux/`.
- Archivos tocados:
	- Eliminado `redux/images/zhen-yao-2bG6fFQDLLQ-unsplash.jpg`
	- Eliminado `redux/images/texture_vocaloids00.jpg`
	- Eliminado `redux/images/wood_wallpaper_flip-h.jpg`
	- Eliminado `redux/images/texture_floor_marble.jpg`
	- Eliminado `redux/images/XR_Animator_thumbnail01.png`
	- Eliminado `redux/images/XR_Animator_thumbnail02.png`
- Validación previa:
	- Búsqueda en `redux/**` sin matches para esos nombres.
- Comandos de prueba:
	- `du -sh redux redux/images`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **96M → 93M** (~3.1MB menos).
	- Tamaño `redux/images`: **7.7M → 4.8M**.
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Si algún preset externo/legacy referencia thumbnails o texturas por nombre fijo, podría requerir rollback puntual.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque M (modelo opcional clock_stage_ver2)
- Objetivo: podar asset de escenario opcional no referenciado en `redux/`.
- Archivos tocados:
	- Eliminado `redux/jThree/model/clock_stage_ver2/clock_stage_ver2.pmx`
	- Eliminado `redux/jThree/model/clock_stage_ver2/readme.txt`
	- Eliminada carpeta `redux/jThree/model/clock_stage_ver2/`
- Validación previa:
	- Búsqueda en `redux/**` sin referencias a `clock_stage_ver2`.
- Comandos de prueba:
	- `du -sh redux redux/jThree`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **93M → 91M** (~2.0MB menos).
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Presets legacy que dependan explícitamente de ese escenario pueden perder disponibilidad.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque N (Three.js fallback Electron)
- Objetivo: reducir tamaño en bundle web eliminando fallback no usado en navegador local.
- Archivos tocados:
	- Eliminado `redux/three.js/three.module.js`
- Validación previa:
	- `MMD_SA.js` selecciona `three.module.min.js` cuando `webkit_electron_mode` es falso.
- Comandos de prueba:
	- `du -sh redux redux/three.js`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `curl -s -o /dev/null -w "three_min:%{http_code}" http://127.0.0.1:8080/redux/three.js/three.module.min.js`
- Resultado:
	- Tamaño `redux`: **91M → 89M** (~1.27MB menos).
	- Preflight Fase 3: OK.
	- `three.module.min.js` activo en `200`.
- Riesgos detectados:
	- Modo Electron (`webkit_electron_mode=true`) pierde fallback local `three.module.js`.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque O (eliminación Holistic legacy completa)
- Objetivo: recorte mayor removiendo stack legacy de `@mediapipe/holistic` y priorizando pipeline Tasks.
- Archivos tocados:
	- `redux/js/tracking/mocap-mediapipe-bridge.js`
	- Eliminada carpeta `redux/js/@mediapipe/holistic/` completa
- Cambio aplicado:
	- `PoseAT_load_lib`: bloque `use_holistic_legacy` envuelto en `try/catch`.
	- Si falta legacy, se fuerza `options.use_holistic_legacy = false` y continúa pipeline no-legacy.
- Comandos de prueba:
	- `du -sh redux redux/js/@mediapipe`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **89M → 61M** (~30.3MB menos).
	- Preflight Fase 3: OK.
	- Entry `XR_Animator` en `200`.
- Riesgos detectados:
	- Se elimina completamente soporte local Holistic legacy.
	- Funciones que dependan estrictamente de legacy ahora hacen fallback al pipeline no-legacy.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque P (motions opcionales camera_appeal)
- Objetivo: poda fina de motions de cámara no referenciados en flujo activo.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/model/camera_appeal02.vmd`
	- Eliminado `redux/MMD.js/motion/model/camera_appeal03.vmd`
- Validación previa:
	- Búsqueda sin referencias para `camera_appeal02` / `camera_appeal03`.
	- `camera_appeal01` se conserva (usado por `jThree/_AR_demo_01.js`).
- Comandos de prueba:
	- `du -sh redux redux/MMD.js`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **61M → 60M** (~326KB menos).
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Solo impacta presets que refieran explícitamente esos motions removidos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque Q (font Symbola embebida)
- Objetivo: reducir bundle CSS removiendo fuente TTF pesada y usando fallback local del sistema.
- Archivos tocados:
	- `redux/css/main.css`
	- Eliminado `redux/css/Symbola605.ttf`
- Cambio aplicado:
	- `@font-face` actualizado para usar `local("Symbola")`, `local("Segoe UI Symbol")`, `local("Noto Sans Symbols")`.
- Comandos de prueba:
	- `du -sh redux redux/css`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **60M → 59M** (~1.72MB menos).
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- En sistemas sin esas fuentes locales puede variar visualmente algunos glifos/símbolos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque R (jQuery duplicado legacy)
- Objetivo: limpieza de duplicado no usado en `jThree/script`.
- Archivos tocados:
	- Eliminado `redux/jThree/script/jquery-2.1.1.min.js`
- Validación previa:
	- Única referencia encontrada estaba comentada en `redux/js/mmd/defaults.js`.
- Comandos de prueba:
	- `du -sh redux redux/jThree/script`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Recorte ~84KB.
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Nulos para flujo actual (se mantiene `jquery.min.js` activo).
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque S (assets AR demo opcionales)
- Objetivo: eliminar payload de demo AR no referenciado por flujo principal.
- Archivos tocados:
	- Eliminado `redux/jThree/_AR_demo_01.js`
	- Eliminado `redux/MMD.js/motion/model/camera_appeal01.vmd`
	- Eliminado `redux/MMD.js/motion/walk_n_run/walk_hip.vmd`
- Validación previa:
	- `camera_appeal01` y `walk_hip` solo estaban referidos por `_AR_demo_01.js`.
	- `_AR_demo_01.js` no estaba referenciado por el runtime principal de `redux/`.
- Comandos de prueba:
	- `du -sh redux redux/MMD.js redux/jThree`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `curl -s -o /dev/null -w "ROOT:%{http_code}" http://127.0.0.1:8080/SystemAnimator_online.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **59M → 58M** (~544KB menos).
	- Preflight Fase 3: OK.
	- Entry points web en `200`.
- Riesgos detectados:
	- Se deshabilita demo AR legacy asociada a esos assets.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque T (plugin three.proton no referenciado)
- Objetivo: limpieza de plugin opcional no cargado en runtime actual.
- Archivos tocados:
	- Eliminado `redux/jThree/plugin/three.proton.js`
- Validación previa:
	- Única referencia encontrada estaba comentada en `redux/js/mmd/defaults.js`.
- Comandos de prueba:
	- `du -sh redux redux/jThree/plugin`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Recorte ~114KB.
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Efectos que dependan de three.proton legacy no estarán disponibles.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque U (forzar js_min_mode + poda jThree no-min)
- Objetivo: consolidar ejecución en bundle minificado y remover duplicados no-min.
- Archivos tocados:
	- `redux/js/core.js`
	- Eliminado `redux/jThree/script/v2.1.2_jThree.js`
	- Eliminado `redux/jThree/MMDplugin/v2.1.2_jThree.MMD.js`
- Cambio aplicado:
	- Activado `var _js_min_mode_ = true` en `redux/js/core.js`.
- Comandos de prueba:
	- `node -c redux/js/core.js`
	- `du -sh redux redux/jThree`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `curl -s -o /dev/null -w "three_core_min:%{http_code}" http://127.0.0.1:8080/redux/jThree/three.core.min.js`
- Resultado:
	- Tamaño `redux`: **58M → 57M** (~1.43MB menos).
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Flujos que dependan del path no-min de jThree ya no estarán disponibles.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque V (motion_demo_pack01 opcional)
- Objetivo: recortar paquete de motions demo no-must-load.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/motion_demo_pack01.zip`
- Validación previa:
	- Referencias en `animate.js` son motions demo sin bandera `must_load`.
- Comandos de prueba:
	- `du -sh redux redux/MMD.js`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `curl -s -o /dev/null -w "ROOT:%{http_code}" http://127.0.0.1:8080/SystemAnimator_online.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **57M → 55M** (~1.85MB menos).
	- Preflight Fase 3: OK.
	- Entrypoints web en `200`.
- Riesgos detectados:
	- Al elegir esas coreografías demo específicas, no estarán disponibles.
- Checkpoint: pendiente.
- Rollback aplicado: Sí (hotfix posterior: restaurado `redux/MMD.js/motion/motion_demo_pack01.zip` por `404` en runtime)

### Fase 7 — Bloque W (assets opcionales no referenciados)
- Objetivo: recorte incremental de bajo riesgo en runtime principal (`XR_Animator`) eliminando archivos sin referencias directas en `redux`.
- Archivos tocados:
	- Eliminado `redux/js/electron_main.js`
	- Eliminado `redux/images/sign_loop.png`
	- Eliminados `redux/images/ST_cube02_1.jpg` a `ST_cube02_5.jpg`
	- Eliminado `redux/MMD.js/motion/tsuna/tsuna_run.vmd`
	- Eliminado `redux/MMD.js/motion/sleep/sleep01.vmd`
	- Eliminado `redux/MMD.js/motion/walk_n_run/run_H46_f60-180.vmd`
	- Eliminados `redux/MMD.js/motion/_kiss_blush.vmd`, `_kiss2_blush.vmd`, `_kiss2_blush_v01.vmd`
- Comandos de prueba:
	- `du -sh redux redux/images redux/js redux/MMD.js redux/jThree`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Tamaño `redux`: **55M → 54M** (~0.82MB menos).
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
- Riesgos detectados:
	- Presets legacy específicos que apunten a esos motions/texturas opcionales podrían no estar disponibles.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque X (P2P/chat opcional desactivado)
- Objetivo: reducir payload de red no crítico para el flujo principal de tracking/XR.
- Archivos tocados:
	- `redux/js/core_extra.js` (eliminada inyección dinámica de `peerjs.min.js` y `chatbox.js`)
	- Eliminado `redux/js/peerjs.min.js`
	- Eliminado `redux/js/chatbox.js`
- Comandos de prueba:
	- `node -c redux/js/core_extra.js`
	- `du -sh redux redux/js redux/images redux/MMD.js redux/jThree`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Reducción adicional ~188KB (redondeo de `du` mantiene `redux` en ~54M).
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
- Riesgos detectados:
	- Se deshabilita funcionalidad P2P/chatbox en build redux slim.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque Y (Electron preload no-web)
- Objetivo: recorte conservador eliminando script exclusivo de Electron no usado en runtime web de `redux`.
- Archivos tocados:
	- Eliminado `redux/js/electron_web_browser_preload.js`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/js redux/MMD.js redux/images redux/jThree`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Reducción pequeña (sin cambio de redondeo en `du`: `redux` permanece en ~55M).
- Riesgos detectados:
	- Sin impacto esperado en modo web; afecta solo preload específico de Electron.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque Z (plugins jThree legacy no referenciados)
- Objetivo: recorte conservador de plugins/backup shader sin referencias directas en runtime redux.
- Archivos tocados:
	- Eliminado `redux/jThree/plugin/v2.1.2_jThree.Trackball.js`
	- Eliminado `redux/jThree/MMDplugin/fshader_old.c`
	- Eliminado `redux/jThree/plugin/three_AbstractCorridor.js`
	- Eliminado `redux/jThree/plugin/three_SubterraneanFlyThrough.js`
	- Eliminado `redux/jThree/plugin/three_NV15SpaceCurvature.js`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/jThree redux/MMD.js redux/js redux/images`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Reducción pequeña (sin cambio de redondeo en `redux`: ~55M; `redux/jThree`: ~7.5M → ~7.4M).
- Riesgos detectados:
	- Posible impacto solo en escenas/efectos legacy que carguen explícitamente esos plugins antiguos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AA (imágenes opcionales no referenciadas)
- Objetivo: micro-recorte de imágenes top-level no referenciadas por runtime redux.
- Archivos tocados:
	- Eliminado `redux/images/sign_construction.png`
	- Eliminado `redux/images/watershader_water.jpg`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/images`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Reducción pequeña (sin cambio de redondeo visible en `du`).
- Riesgos detectados:
	- Impacto esperado solo en efectos visuales legacy que usen esos nombres explícitos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AB (motions `.vmd` sueltos no referenciados)
- Objetivo: recorte incremental de motions standalone sin referencias textuales en runtime redux.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/hit/w01_すべって尻もち.vmd`
	- Eliminado `redux/MMD.js/motion/hit/r01_普通に転ぶ.vmd`
	- Eliminado `redux/MMD.js/motion/hit/h01_何かにぶつかる小.vmd`
	- Eliminado `redux/MMD.js/motion/walk_n_run/run_H16_f0-40.vmd`
	- Eliminado `redux/MMD.js/motion/walk_n_run/run_H26_f20-60.vmd`
	- Eliminado `redux/MMD.js/motion/walk_n_run/front flip.vmd`
	- Eliminado `redux/MMD.js/motion/kidnap.vmd`
	- Eliminado `redux/MMD.js/motion/PO_chest00.vmd`
	- Eliminado `redux/MMD.js/motion/PO_chest.vmd`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/MMD.js redux/MMD.js/motion`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Recorte aplicado: ~215KB (`redux/MMD.js/motion` ~3.4M → ~3.2M).
- Riesgos detectados:
	- Posible impacto solo en presets legacy que invoquen esos filenames exactos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AC (motions `_number_meter_*` no referenciados)
- Objetivo: micro-recorte adicional de motions standalone sin referencias textuales.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/_number_meter_1.vmd`
	- Eliminado `redux/MMD.js/motion/_number_meter_2.vmd`
	- Eliminado `redux/MMD.js/motion/_number_meter_3.vmd`
	- Eliminado `redux/MMD.js/motion/_number_meter_4.vmd`
	- Eliminado `redux/MMD.js/motion/_number_meter_5.vmd`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/MMD.js redux/MMD.js/motion`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Recorte aplicado: ~105KB (`redux/MMD.js/motion` ~3.2M → ~3.1M).
- Riesgos detectados:
	- Posible impacto solo en presets legacy que invoquen esos filenames exactos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AD (motions casual/walk no referenciados)
- Objetivo: micro-recorte adicional de motions sueltos sin referencias textuales en runtime redux.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/casual/女の子座り→立ち上がる_gumi_v01.vmd`
	- Eliminado `redux/MMD.js/motion/casual/へなへなと座り込む_gumi.vmd`
	- Eliminado `redux/MMD.js/motion/walk_n_run/walk_A04_f0-40_s13.44.vmd`
	- Eliminado `redux/MMD.js/motion/casual/OTL→立ち上がり.vmd`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/MMD.js redux/MMD.js/motion`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Recorte aplicado: ~67KB (`redux/MMD.js/motion` ~3.1M → ~3.0M).
- Riesgos detectados:
	- Posible impacto solo en presets legacy que invoquen esos filenames exactos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AE (texturas ST no referenciadas)
- Objetivo: recorte incremental de texturas top-level sin referencias textuales en runtime redux.
- Archivos tocados:
	- Eliminado `redux/images/ST_tex09.jpg`
	- Eliminado `redux/images/ST_tex08.jpg`
	- Eliminado `redux/images/ST_tex03.jpg`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/images`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- `redux/images` ~4.4M → ~4.0M (recorte ~402KB).
- Riesgos detectados:
	- Posible impacto solo en presets legacy que usen esos nombres exactos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AF (plugins de efectos jThree no referenciados)
- Objetivo: recorte incremental de efectos visuales legacy sin referencias textuales en runtime redux.
- Archivos tocados:
	- Eliminado `redux/jThree/plugin/three_RemnantX.js`
	- Eliminado `redux/jThree/plugin/three_CheapCloudFlythrough.js`
	- Eliminado `redux/jThree/plugin/three_Cubescape.js`
	- Eliminado `redux/jThree/plugin/three_TransparentCubeField.js`
	- Eliminado `redux/jThree/plugin/three_IntoTheVoid.js`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/jThree redux/images redux/MMD.js`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- `redux`: **55M → 54M**.
	- `redux/jThree`: ~7.4M → ~7.3M.
- Riesgos detectados:
	- Posible impacto solo en presets legacy que carguen explícitamente esos efectos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AG (plugins jThree FX adicionales no referenciados)
- Objetivo: continuar poda conservadora de efectos visuales legacy sin referencias textuales en runtime redux.
- Archivos tocados:
	- Eliminado `redux/jThree/plugin/three_FractalCondos.js`
	- Eliminado `redux/jThree/plugin/three_CombustibleVoronoi.js`
	- Eliminado `redux/jThree/plugin/three_EmbellishedAV.js`
	- Eliminado `redux/jThree/plugin/three_FunkyDiscoBall.js`
	- Eliminado `redux/jThree/plugin/three_Ribbons.js`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/jThree redux/MMD.js redux/images`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Reducción pequeña (sin cambio de redondeo en `redux`: ~54M).
- Riesgos detectados:
	- Posible impacto solo en presets legacy que carguen explícitamente esos efectos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Observabilidad/arranque — Auto-START + señal explícita de VRM cargado
- Objetivo: acelerar testing y detectar de forma inequívoca cuándo el modelo VRM terminó de cargar.
- Archivos tocados:
	- `redux/MMD.js/MMD_SA.js`
	- `redux/js/mmd/threex-vrm.js`
- Cambios aplicados:
	- Auto-START en runtime redux (si no se activa `AutoItStayOnDesktop`, se dispara click automático en `LMMD_StartButton`).
	- Log explícito en consola al cargar VRM: `"[XRA][VRM_LOADED]"` con `index`, `url`, `isVRM1`, `metaVersion`.
- Comandos de prueba:
	- `node -c redux/MMD.js/MMD_SA.js`
	- `node -c redux/js/mmd/threex-vrm.js`
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Sintaxis OK en ambos archivos.
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).

### Fase 7 — Bloque AH (motions `.vmd` pequeños no referenciados)
- Objetivo: continuar poda conservadora de motions sueltos sin referencias textuales.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/cover_chest_v02a.vmd`
	- Eliminado `redux/MMD.js/motion/cover_chest_v02.vmd`
	- Eliminado `redux/MMD.js/motion/cover_chest_v01.vmd`
	- Eliminado `redux/MMD.js/motion/penguin_stand.vmd`
- Comandos de prueba:
	- `curl -s -o /dev/null -w "XR:%{http_code}" http://127.0.0.1:8080/redux/XR_Animator.html`
	- `redux/scripts/phase3_preflight.sh`
	- `du -sh redux redux/MMD.js redux/MMD.js/motion redux/jThree redux/images`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK (`200` en endpoints críticos).
	- Recorte aplicado: ~34KB (`redux/MMD.js/motion` ~3.0M → ~2.9M).
- Riesgos detectados:
	- Posible impacto solo en presets legacy que invoquen esos filenames exactos.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Validación obligatoria automatizada — VRM console gate
- Objetivo: convertir en automática la validación de carga real del VRM en cada bloque de cambios.
- Archivos tocados:
	- `package.json`
	- `redux/scripts/phase3_preflight.sh`
	- `redux/scripts/vrm_console_check.mjs`
- Cambios aplicados:
	- Se agrega `playwright-core` como dependencia de desarrollo.
	- Se crea `redux/scripts/vrm_console_check.mjs` (headless con Chrome local) que abre `redux/XR_Animator.html`, captura consola y exige el marcador `[XRA][VRM_LOADED]`.
	- `redux/scripts/phase3_preflight.sh` ahora ejecuta el VRM console-check por defecto (`RUN_VRM_CHECK=1`).
- Comandos de prueba:
	- `redux/scripts/phase3_preflight.sh`
- Resultado:
	- Endpoints críticos en `200`.
	- Check de consola VRM en OK (`[XRA][VRM_LOADED]` detectado).

### Fase 7 — Bloque AI (assets de imagen chicos sin referencia)
- Objetivo: poda mínima de bajo riesgo sobre imágenes top-level sin referencias textuales en `redux`.
- Archivos tocados:
	- Eliminado `redux/images/cc4-by-nc-sa-80x15.png`
	- Eliminado `redux/images/cc4-by-nc-sa-88x31.png`
	- Eliminado `redux/images/icon_film_64x64.png`
	- Eliminado `redux/images/icon_link_64x64.png`
- Comandos de prueba:
	- `redux/scripts/phase3_preflight.sh` (incluye VRM console-check)
	- `du -sh redux redux/images redux/MMD.js redux/jThree`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
	- VRM cargado confirmado por consola: `[XRA][VRM_LOADED]`.
	- Recorte aplicado: `9,646` bytes.
- Riesgos detectados:
	- Impacto esperado nulo; eran assets sin referencia textual en runtime redux.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AJ (imágenes grandes no referenciadas)
- Objetivo: eliminar imágenes de mayor peso sin referencias textuales en runtime redux.
- Archivos tocados:
	- Eliminado `redux/images/ST_tex05.jpg`
	- Eliminado `redux/images/kiss_mark_red.png`
	- Eliminado `redux/images/ST_cube02_0.jpg`
	- Eliminado `redux/images/icon_miku_64x64.png`
	- Eliminado `redux/images/_bg_dummy/EQF_bars_bg0_o50.png`
	- Eliminado `redux/images/_bg_dummy/EQF_bars_blue_bg0.png`
- Comandos de prueba:
	- `redux/scripts/phase3_preflight.sh` (incluye VRM console-check)
	- Re-scan de imágenes sin referencia textual
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
	- VRM cargado confirmado por consola: `[XRA][VRM_LOADED]`.
	- Recorte aplicado: `267,161` bytes.
	- Estado posterior del scan heurístico: `0` candidatos adicionales.
- Riesgos detectados:
	- Bajo; sin referencias textuales detectadas en runtime redux.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AK (imágenes grandes no solicitadas en runtime de arranque)
- Objetivo: continuar poda de imágenes pesadas usando evidencia de requests reales en arranque de `XR_Animator`.
- Archivos tocados:
	- Agregado `redux/scripts/xra_image_requests.mjs` (script de auditoría de requests de imágenes).
	- Eliminado `redux/images/ST_tex01.jpg`
	- Eliminado `redux/images/ST_tex02.jpg`
	- Eliminado `redux/images/ST_tex11.png`
	- Eliminado `redux/images/ST_tex12.png`
	- Eliminado `redux/images/ST_tex16.png`
	- Eliminado `redux/images/ST_tex19.png`
	- Eliminado `redux/images/bg_abstract_1024x1024.jpg`
	- Eliminado `redux/images/watershader_cloud.png`
- Comandos de prueba:
	- `node redux/scripts/xra_image_requests.mjs`
	- `bash redux/scripts/phase3_preflight.sh` (incluye VRM console-check)
	- `du -sh redux redux/images redux/MMD.js redux/jThree`
- Resultado:
	- Requests de imágenes en arranque: `5` (`SB_*` y `kiss_mark_red_o66.png`).
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
	- VRM cargado confirmado por consola: `[XRA][VRM_LOADED]`.
	- Recorte aplicado: `881,408` bytes.
	- Snapshot de tamaño: `redux 53M`, `redux/images 2.8M`.
	- Relevamiento final: no quedan imágenes grandes sueltas fuera de ZIP en `redux/images`.
- Riesgos detectados:
	- Medio-bajo; estas imágenes no aparecen en requests de arranque de XR, pero podrían afectar presets legacy no cubiertos por ese flujo.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AL (motions sueltos no referenciados remanentes)
- Objetivo: agotar poda conservadora de motions sueltos sin referencias textuales.
- Archivos tocados:
	- Eliminado `redux/MMD.js/motion/_0s.vmd`
	- Eliminado `redux/MMD.js/motion/penguin_dance.vmd`
	- Eliminado `redux/MMD.js/motion/_0m.vmd`
- Comandos de prueba:
	- `bash redux/scripts/phase3_preflight.sh` (incluye VRM console-check)
	- `du -sh redux redux/images redux/MMD.js redux/jThree`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
	- VRM cargado confirmado por consola: `[XRA][VRM_LOADED]`.
	- Recorte aplicado: `7,751` bytes.
	- Snapshot: `redux 53M`, `redux/images 2.8M`, `redux/MMD.js 3.1M`, `redux/jThree 7.3M`.
- Riesgos detectados:
	- Bajo; archivos sin referencias textuales en runtime redux.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Estado de poda conservadora (actual)
- No quedan imágenes grandes sueltas ni motions sueltos con criterio de “sin referencia textual” + “no solicitado en arranque XR”.
- Los archivos de mayor peso restantes pertenecen mayormente a componentes críticos del runtime (`@mediapipe/tasks`, modelo VRM principal, ZIPs solicitados en arranque, motores de física/render).

### Fase 7 — Bloque AM (ZIPs dungeon/SFX agresivos)
- Objetivo: remover paquetes ligados a funcionalidades secundarias (dungeon/SFX) aunque sean solicitados por el runtime.
- Archivos tocados:
	- Eliminado `redux/images/_dungeon/item_icon.zip`
	- Eliminado `redux/sound/SFX_pack01.zip`
- Comandos de prueba:
	- `bash redux/scripts/phase3_preflight.sh` (incluye VRM console-check)
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
	- VRM cargado confirmado por consola: `[XRA][VRM_LOADED]`.
	- Recorte aplicado: `195,227` bytes.
	- Se observan `404/XMLHttpRequestZIP ERROR` esperables en esos ZIP removidos.
- Riesgos detectados:
	- Medio: pérdida funcional de features dungeon/SFX, sin impacto en carga base VRM.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Bloque AN (ZIPs effects/gameplay agresivos)
- Objetivo: continuar recorte de paquetes secundarios de efectos/gameplay solicitados por runtime.
- Archivos tocados:
	- Eliminado `redux/images/sprite_sheet.zip`
	- Eliminado `redux/MMD.js/motion/motion_rpg_pack01.zip`
	- Eliminado `redux/images/XR Animator/assets/motion_misc.zip`
- Comandos de prueba:
	- `bash redux/scripts/phase3_preflight.sh` (incluye VRM console-check)
	- `du -sh redux redux/images redux/MMD.js redux/jThree`
- Resultado:
	- `XR_Animator`: `200`.
	- Preflight Fase 3: OK.
	- VRM cargado confirmado por consola: `[XRA][VRM_LOADED]`.
	- Recorte aplicado: `1,059,120` bytes.
	- Snapshot: `redux 52M`, `redux/images 2.1M`, `redux/MMD.js 2.8M`, `redux/jThree 7.3M`.
	- Se observan `404/XMLHttpRequestZIP ERROR` esperables en ZIPs removidos.
- Riesgos detectados:
	- Medio-alto: se eliminan recursos de efectos/gameplay que sí eran solicitados por runtime; objetivo aceptado por criterio de poda agresiva.
- Checkpoint: pendiente.
- Rollback aplicado: No

### Fase 7 — Rollback de AM/AN por regresión de runtime
- Objetivo: corregir regresión reportada por usuario (`404/XMLHttpRequestZIP ERROR`) tras poda agresiva de ZIPs.
- Archivos restaurados:
	- `redux/images/_dungeon/item_icon.zip`
	- `redux/sound/SFX_pack01.zip`
	- `redux/images/sprite_sheet.zip`
	- `redux/images/XR Animator/assets/motion_misc.zip`
	- `redux/MMD.js/motion/motion_rpg_pack01.zip`
- Acción aplicada:
	- Restauración desde `git` (HEAD) con `git checkout -- <paths>`.
- Verificación:
	- `bash redux/scripts/phase3_preflight.sh` en OK.
	- Marcador de carga detectado: `[XRA][VRM_LOADED]`.
	- Requests ZIP restaurados vuelven a `Cache STORED` (sin `404` para esos recursos).
- Resultado:
	- Runtime recuperado al estado funcional previo al bloque agresivo.
