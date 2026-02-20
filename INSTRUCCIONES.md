# Implementación Redux — Estado Actual

## Resumen
Copia funcional de XR Animator en `redux/`. El VRM carga, renderiza y anima correctamente en `http://127.0.0.1:8080/redux/XR_Animator.html`.

## Fases completadas

### Fase 0 — Baseline
- Documentación: `docs/REDUX_MIGRATION_GUIDE.md`, `redux/PHASE_LOG.md`

### Fase 1 — Scaffold mínimo
- Entry point: `redux/XR_Animator.html`
- Bootstrap chain: `globals.js` → `module-loader.js` → `core.js` → `core_extra.js`

### Fase 2 — Runtime core + dependencias (COMPLETA)
VRM renderiza con animaciones. Todo el bootstrap ejecuta sin errores bloqueantes.

**Archivos copiados al `redux/`:**

| Directorio | Contenido |
|------------|-----------|
| `redux/` (raíz) | `XR_Animator.html`, `gadget.xml`, `settings.html`, `z_blank.html`, `z_blank2.html`, `drop_area.html`, `icon.png`, `logo.gif` |
| `redux/css/` | `main.css`, `settings.css`, `tabber.css`, `Symbola605.ttf` |
| `redux/js/` | ~65 archivos JS: bootstrap (`globals.js`, `module-loader.js`, `core.js`, `core_extra.js`), runtime (`_SA.js`, `_SA2.js`, `SA_system_emulation.min.js`, `SA_system_emulation_ext.js`, `SA_webkit.js`), audio (`audio_BPM.js`, `aurora.js`, etc.), tracking (`mocap_lib_module.js`, `facemesh_lib.js`, etc.), dungeon (`dungeon.js`, `dungeon.core.min.js`, etc.) |
| `redux/js/app/` | 15 módulos: `animate-core.js`, `animate.js`, `background.js`, `dragdrop-handler.js`, `ev-init.js`, `ev-processing.js`, `events.js`, `gallery-utils.js`, `init-ui.js`, `load-main.js`, `resize.js`, `sa-init.js`, `seq-animate.js`, `settings-io.js`, `utils.js` |
| `redux/js/dungeon/` | 10 sub-módulos: `character.js`, `map.js`, `inventory.js`, `restart.js`, `multiplayer.js`, `check_states.js`, `events_default.js`, `run_event.js`, `sfx_check.js`, `utils.js` |
| `redux/js/mmd/` | Directorio completo: `defaults.js`, `threex-vrm.js`, `threex-gui.js`, `threex-motion.js`, `threex-utils.js`, `osc.js`, `audio.js`, `sfx.js`, `speech-bubble.js`, `sprite.js`, `vfx.js`, `wallpaper3d.js`, `webxr.js`, `camera-shake.js`, `gamepad.js`, `threex-ppe.js` |
| `redux/js/tracking/` | Directorio completo: workers, `pose_lib.js`, `hands_lib.js`, `mocap-mediapipe-bridge.js`, `mocap-video-processor.js`, `one_euro_filter.js`, `facemesh-core.js`, etc. |
| `redux/js/@mediapipe/` | Tasks + modelos MediaPipe (192MB) |
| `redux/MMD.js/` | `MMD_SA.js` + motion files |
| `redux/three.js/` | Three.js loaders, shaders, libs |
| `redux/jThree/` | Three.js core, plugins, modelo default (`model/alicia.min.zip`) |
| `redux/images/` | `XR Animator/` (animate.js + assets), `_bg_dummy/`, `_dungeon/item_icon.zip`, UI images, textures |
| `redux/sound/` | `SFX_pack01.zip` |
| `redux/js_filters/` | `animate.js` |
| `redux/TEMP/` | `MMD_MME_by_model.json` (stub `{}`) |

**Fix aplicado en redux (no en repo principal):**
- `redux/js/mmd/threex-gui.js:235`: Agregado optional chaining `MMD_SA_options.Dungeon?.use_octree`

## Fases pendientes

### Fase 3 — Verificar tracking MediaPipe Holistic
- Confirmar que pose/hands/face tracking funciona con los filtros actuales
- Archivos clave: `js/mocap_lib_module.js`, `js/tracking/`, `js/@mediapipe/`
- Test: activar cámara y verificar que el avatar sigue los movimientos

### Fase 4 — Verificar VRM + Three.js + Spring Bones + GUI
- Confirmar spring bones (pelo/ropa) funcionan
- Verificar menú de configuración de tracking (GUI de dat.gui)
- Test: menú de settings accesible y funcional

### Fase 5 — VRM default + animaciones fallback
- Confirmar que el modelo VRM default (`jThree/model/alicia.min.zip`) tiene animaciones idle cuando tracking no está activo
- Las motion packs ya están copiados: `MMD.js/motion/motion_basic_pack01.zip`, `motion_demo_pack01.zip`, `motion_rpg_pack01.zip`
- `images/XR Animator/assets/motion_misc.zip` y `assets.zip` también copiados

### Fase 6 — VMC sender (Electron)
- Verificar `js/mmd/osc.js` (clase VMC) funciona en modo Electron
- `js/electron_main.js` ya copiado
- Test: ejecutar con Electron y verificar envío OSC

### Fase 7 — Pruning (IMPORTANTE)
- Eliminar dungeon game (`js/dungeon.js`, `js/dungeon/`, `js/dungeon-generator.js`, `js/dungeon_mesh_sorting.js`, `js/terrain.js`, `images/_dungeon/`)
- Eliminar VFX no esenciales
- Eliminar galleries/demos no usados
- Reducir `images/XR Animator/animate.js` (16K líneas) — quitar configs de dungeon
- Objetivo: reducir de 286MB a <100MB

### Fase 8 — Aislamiento completo
- Verificar que `redux/` no depende de ningún archivo fuera de `redux/`
- Hacer paths relativos internos
- Test final: mover `redux/` a otra ubicación y verificar que funciona

## Cómo levantar el servidor
```bash
cd /Users/mpalenque/demobodytracking/SystemAnimatorOnline
python3 nocache_server.py 8080
# Abrir: http://127.0.0.1:8080/redux/XR_Animator.html
```

## Reglas de continuidad
1. Avanzar una fase por vez
2. Testear y registrar en `redux/PHASE_LOG.md` antes de seguir
3. Crear checkpoint git por fase
4. Si falla, rollback inmediato al checkpoint anterior
5. No modificar archivos fuera de `redux/` (el repo principal queda intacto)
6. Guía completa: `docs/REDUX_MIGRATION_GUIDE.md`