# System Animator Online — Refactoring Plan

## Goal
Restructure the codebase into ~300-line files for AI readability and maintainability.
Migrate to ES Modules progressively. Remove legacy platform support. Never break functionality.

## Rules
- Files ~300 lines max (except datasets)
- Legacy global variables kept as `window.xxx` aliases during transition
- Current `document.write()` script loading untouched until Etapa 8
- Commit: `git -c commit.gpgsign=false commit -m "message"`
- Verify syntax: `node -c file.js`
- HTTP server on port 8080

---

## Completed

### 0A — Global State Registry ✅
- Created `js/globals.js` with `window.SA` namespace (SA.platform, SA.os, SA.settings, SA.debug, SA.child, SA.paths, SA.shell, SA.ui, SA.project)
- Added `SA.syncFromGlobals()` / `SA.syncToGlobals()` bridge functions
- Called `SA.syncFromGlobals()` at end of `js/core.js` and `js/core_extra.js`
- Added `globals.js` script tag to all 15 HTML entry points before `core.js`

### 0B — Module Loader ✅
- Created `js/module-loader.js` with `SA.loader` (loadScript, loadModule, loadScriptsSequential, loadScriptsParallel, isLoaded, getRegistry)
- Added `module-loader.js` to all 15 HTML entry points between `globals.js` and `core.js`

### 1A — Remove Legacy Files ✅
- Deleted: `js/SA_xul.js`, `js/SA_silverlight.js`, `js/Silverlight.js`, `js/SA_regread.js`, `js/SA_launcher.js`, `js/wmp.js`
- Deleted: `SystemAnimator_ie.hta`, `SystemAnimator_ie.html`, `SystemAnimator_xul.html`, `xul_silverlight.html`, `SystemAnimator_cef.html`, `gadget.xml`
- Cleaned references in: `js/core.js` (XUL block), `js/_SA.js` (SA_launcher WSH block), `js/EQP.js` (Silverlight scripts), `js/EQP_core.js` (WMP), `js/EQP_gallery.js` (Silverlight scripts)

---

## Pending

### 1B — Clean _SA.js of legacy branches ✅
- Removed `use_Silverlight` conditions (11 refs) — set to `true` constant for cross-file compat
- Removed `use_Silverlight_only` assignments (3 refs) — set to `false` constant
- Removed all `xul_mode` branches (8 refs): XUL_onload, xul_path, xul_transparent_mode, CSS Moz prefix, video format preference, HTA launch path
- Removed `ActiveXObject` initialization block (Shell.Application, FSO, WScript.Shell)
- Kept `oShell`, `Shell_OBJ`, `FSO_OBJ` variable declarations (referenced elsewhere)
- 5258 → 5217 lines (−41 lines; original estimate overstated — branches were conditions on larger blocks, not large blocks themselves)

### 1C — Clean core.js and core_extra.js of legacy ✅
- **core.js** (792→773): Removed `ie_64bit` (always false), removed `getHTAUseGPUAcceleration()` function + `HTA_use_GPU_acceleration` var
- **core_extra.js** (859→843): Removed `xul_mode`/`webkit_mode` re-declarations, removed `xul_mode` branch in SA_load_scripts, removed `oHTA.commandLine` HTA branch, removed `ie9_native`→`getHTAUseGPUAcceleration()` call, removed XUL event handler block, simplified `SA_top_window` to `self`
- **EQP_gallery.js** (3582→3539): Simplified all `use_Silverlight` conditions (always true), removed `!use_Silverlight` dead branches, removed `use_Silverlight_only` dead code block (Silverlight dummy layer ~38 lines), kept SL_* API references for deeper cleanup later

### 2A — Create tracking folder structure ✅
- Created `js/tracking/`
- Moved 7 files: `pose_lib.js`, `pose_worker.js`, `hands_lib.js`, `hands_worker.js`, `facemesh_worker.js`, `one_euro_filter.js`, `headtracker_ar.js` → `js/tracking/`
- Updated import paths in `pose_lib.js`, `hands_lib.js` (`../mocap_lib_module.js`), `facemesh_worker.js` (`../facemesh_lib.js`)
- Updated refs in `MMD_SA.js`, `_SA2.js`, `SA_system_emulation.min.js`
- Worker-relative `importScripts` paths auto-resolved (same dir)

### 2B — Split mocap_lib_module.js (1970 lines) ✅
- `js/tracking/mocap-constants.js` (47 lines) — BLAZEPOSE_KEYPOINTS, blazepose_translated, get_pose_index
- `js/tracking/mocap-pose-processor.js` (364 lines) — pose_adjust, process_facemesh
- `js/tracking/mocap-hands-processor.js` (469 lines) — hands_adjust, is_hand_visible, get_hand_canvas
- `js/tracking/mocap-mediapipe-bridge.js` (545 lines) — PoseAT_load_lib, HandsAT_load_lib, load_vision_common, create_mediapipe_hand_landmarker
- `js/tracking/mocap-video-processor.js` (368 lines) — PoseAT_process_video_buffer, HandsAT_process_video_buffer
- `js/mocap_lib_module.js` rewritten as orchestrator (350 lines) — Core constructor, init, shared state `S`, imports
- All extracted functions take shared state object `S` as first param (replaces closure vars)
- `pose_lib.js`/`hands_lib.js` import path unchanged (`'../mocap_lib_module.js'`)
- All as ES Modules (export/import), static imports at module level
- Commit: `c5f5ace`

### 2C — Split facemesh_lib.js (1134 lines) ✅
- `js/tracking/facemesh-core.js` (268 lines) — fm_path_adjusted, fm_load_scripts, fm_init, fm_load_lib, _fm_model_init
- `js/tracking/facemesh-processor.js` (322 lines) — fm_process_video_buffer, fm_process_facemesh, fm_rgba_to_grayscale
- `js/tracking/facemesh-emotions.js` (55 lines) — fm_emotion_detection (object detection worker management)
- `js/tracking/facemesh-draw.js` (247 lines) — fm_draw, fm_draw_facemesh, fm_draw_pose, fm_draw_hand, fm_drawPath
- `js/facemesh_lib.js` rewritten as orchestrator (184 lines) — IIFE preserved, shared state `S`, dynamic imports
- All extracted functions take shared state object `S` as first param (replaces closure vars)
- `facemesh_worker.js` import path unchanged (`'../facemesh_lib.js'`)
- Sub-modules as ES Modules (export), loaded via dynamic `import()` from IIFE (same pattern as pose_lib.js)

### 3A — Extract MMD_SA.js: audio + SFX ✅
- `js/mmd/audio.js` (801 lines) — BPM sender/vo, DragDrop.onDrop_finish, audio event handlers, media/motion/model drag-drop
- `js/mmd/sfx.js` (296 lines) — Audio3D IIFE: THREE_Audio wrapper, Audio_Player, Audio_Object, positional audio, channel management
- Both as global functions (`window.MMD_SA_initAudio`, `window.MMD_SA_createAudio3D`) called synchronously from MMD_SA.js
- Scripts loaded via `document.write` in `_SA.js` before `MMD_SA.js`
- MMD_SA.js: 18,371 → 17,304 lines (−1,067)

### 3B — Extract MMD_SA.js: speech-bubble + VFX ✅
- `js/mmd/speech-bubble.js` (1074 lines) — SpeechBubble IIFE: SB class, canvas text rendering, bubble positioning, dialogue branching, highlight system
- `js/mmd/vfx.js` (343 lines) — VFX IIFE: FX class, Animator, aura/ring effects, texture preloading, 3D mesh VFX
- Both as global functions (`window.MMD_SA_createSpeechBubble`, `window.MMD_SA_createVFX`) called synchronously from MMD_SA.js
- Scripts loaded via `document.write` in `_SA.js` before `MMD_SA.js`
- MMD_SA.js: 17,304 → 15,906 lines (−1,398)

### 3C — Extract MMD_SA.js: WebXR + OSC ✅
- `js/mmd/webxr.js` (897 lines) — WebXR IIFE: AR/VR session management, XR hit-testing, anchor compatibility, immersive mode
- `js/mmd/osc.js` (189 lines) — OSC IIFE: VMC class, Open Sound Control protocol, DatagramPlugin, Warudo/VNyan/VSeeFace modes
- Both as global functions (`window.MMD_SA_createWebXR`, `window.MMD_SA_createOSC`) called synchronously from MMD_SA.js
- Scripts loaded via `document.write` in `_SA.js` before `MMD_SA.js`
- MMD_SA.js: 15,906 → 14,826 lines (−1,080)

### 3D — Extract MMD_SA.js: gamepad + Wallpaper3D ✅
- `js/mmd/gamepad.js` (439 lines) — Gamepad IIFE: Gamepad class, control profiles (camera pan/rotate/zoom, avatar move/jump, mocap, custom buttons), button state management
- `js/mmd/wallpaper3d.js` (1508 lines) — Wallpaper3D IIFE: depth estimation, 3D parallax wallpaper, transformers worker, canvas depth effects, video/image processing
- Both as global functions (`window.MMD_SA_createGamepad`, `window.MMD_SA_createWallpaper3D`) called synchronously from MMD_SA.js
- Scripts loaded via `document.write` in `_SA.js` before `MMD_SA.js`
- MMD_SA.js: 14,826 → 12,887 lines (−1,939)

### 3E — Verify MMD_SA.js integration after Etapa 3 ✅
- All 8 extracted modules pass syntax check (`node -c`)
- MMD_SA.js reduced from 18,371 → 12,887 lines (−5,484, ~30% reduction)
- All `MMD_SA_create*`/`MMD_SA_init*` calls verified in MMD_SA.js
- All 8 `document.write` script tags verified in `_SA.js`
- Extracted modules: audio.js (801), sfx.js (296), speech-bubble.js (1074), vfx.js (343), webxr.js (897), osc.js (189), gamepad.js (439), wallpaper3d.js (1508) = 5,547 lines total

### 4A — Extract MMD_SA.js: Sprite + CameraShake ✅
- `js/mmd/sprite.js` (986 lines) — Sprite IIFE: TextureAnimator, sprite sheet management, explosions/blood/hit/HP bar effects, Dungeon VFX integration
- `js/mmd/camera-shake.js` (92 lines) — CameraShake IIFE: magnitude/duration/decay curves, offset rendering, camera position perturbation
- Both as global functions (`window.MMD_SA_createSprite`, `window.MMD_SA_createCameraShake`) called synchronously from MMD_SA.js
- Scripts loaded via `document.write` in `_SA.js` before `MMD_SA.js`
- **Fix**: Restored `gadget.xml` (deleted in 1A but required by SA_system_emulation for Settings init)
- MMD_SA.js: 12,887 → 11,818 lines (−1,069)

### 4B — Extract MMD_SA.js: Defaults block ✅
- `js/mmd/defaults.js` (1530 lines) — standalone IIFE: model path defaults, THREEX options, model selection/parameters, extra models, X-ray, mesh/material generation, script loading
- Global function `window.MMD_SA_initDefaults` called synchronously from MMD_SA.js
- Script loaded via `document.write` in `_SA.js` before `MMD_SA.js`
- MMD_SA.js: 11,818 → 10,291 lines (−1,527)

### 4C — Extract MMD_SA.js THREEX sub-modules: VRM + PPE — DEFERRED
- VRM (1,474 lines) and PPE (1,081 lines) are tightly coupled to THREEX closure variables (30+ and 50+ refs to `modelX`, `threeX`, `bones_by_name`, etc.)
- Extracting would require passing all closure dependencies as parameters — too risky
- These need interface refactoring before extraction (future step)

### 4D — Extract MMD_SA.js THREEX sub-modules: utils — DEFERRED
- Same issue: utils section (2,040 lines) heavily references THREEX closure variables
- Recommend: future step after establishing THREEX public API

### 4E — Verify MMD_SA.js after Etapa 4 ✅
- All 11 extracted modules pass syntax check (`node -c`)
- MMD_SA.js reduced from 18,371 → 10,291 lines (−8,080, ~44% reduction)
- All `MMD_SA_create*`/`MMD_SA_init*` calls verified in MMD_SA.js
- All 11 `document.write` script tags verified in `_SA.js`
- Extracted modules: audio.js (801), sfx.js (296), speech-bubble.js (1074), vfx.js (343), webxr.js (897), osc.js (189), gamepad.js (439), wallpaper3d.js (1508), sprite.js (986), camera-shake.js (92), defaults.js (1530) = 8,155 lines total
- Remaining THREEX IIFE (~6,400 lines) tightly coupled — deferred to future refactoring
- **Fix applied**: Restored `gadget.xml` deleted in 1A (required by SA_system_emulation for Settings init)

### 5A — Split _SA.js: init, resize, events, utils → js/app/ ✅
- `js/app/utils.js` (65 lines) — addZero, random, SA_OnBeforeUnload_Common, AutoIt_Execute, CheckDockState, barPhysics + bar_accelerate var
- `js/app/events.js` (350 lines) — SA_OnKeyDown IIFE (closure), SA_OnKeyDown_Gadget, SA_OnDocument, SA_OnFolder, SA_OnGallery, SA_ClearInterface, SA_OnMouseDown, SA_CreateHTA, SA_AnimationAppend_Switch, EQP_gallery_append_mode/SA_animation_append_mode/SA_confirm_HTA vars
- `js/app/init-ui.js` (340 lines) — SA_init_browser_ui() wrapping System._browser init, mouseover/mouseout custom handlers, fullscreen/restore/minimize/resize/rotate buttons, child animation dblclick, onkeydown + writeSettings_CORE assignment
- `js/app/resize.js` (700 lines) — resize() function + all resize vars (webkit_saved_screenLeft/Top, EV_frame_offset, SA_zoom/rotate/body_offset, SA_fullscreen_offset, B_content_width/height, _resize_loop_). Exceeds 300-line limit due to monolithic function with deep local variable dependencies — deferred to future split.
- All as global functions loaded via `document.write` in `_SA.js` before any runtime calls
- Functions only called at runtime (init, resize, event handlers) — safe to extract
- Bottom IIFE functions (loadFolder_CORE, ItemsFromFolder, ValidatePath, LABEL_LoadSettings) kept in _SA.js (called during parsing)
- _SA.js: 5,234 → 3,781 lines (−1,453)
### 5B — Split _SA.js: animation, sequence, ev-usage → js/app/ ✅
- `js/app/ev-init.js` (225 lines) — EventToMonitor_para1, parseEventToMonitor, EV_usage_list, EV_usage_sub, Sound_EQBand_mod, Sound_Spectrum data object, Sound_classRoot, initEV
- `js/app/animate.js` (200 lines) — EV_usage/PC_count vars, EV_sync_update object + defineProperty, use_RAF/RAF vars, Animate_RAF, Animate, RAF_animation_frame vars, SA_external_command vars
- `js/app/animate-core.js` (511 lines) — Animate_core function (monolithic, deferred further split — deep local variable dependencies)
- `js/app/ev-processing.js` (768 lines) — EQ_Emu, oShell/Shell_OBJ/FSO_OBJ declarations, regRoot, axDllClass, AT_bass_band, EV_usage_sub_CREATE, EV_usage_PROCESS, EV_object, processEV (giant switch), updateEvent
- `js/app/seq-animate.js` (314 lines) — SEQ_CalculateFPS, SEQ vars, EV_AdjustTimer, random_sorting, SEQ_gallery_restore_order, SEQ_Animate, Gallery_h/v_align, AnimateFrame
- All as global functions loaded via `document.write` in `_SA.js`
- animate-core.js and ev-processing.js exceed 300-line limit due to monolithic functions with deep local dependencies — deferred to future split
- _SA.js: 3,781 → 1,789 lines (−1,992)
### 5C — Split _SA.js: gallery, settings-io, background, reload, dragdrop → js/app/ ✅
- `js/app/sa-init.js` (160 lines) — init() function (main body onload entry point)
- `js/app/dragdrop-handler.js` (278 lines) — SA_DragDropEMU, DragDrop_RE vars, DragDrop_install, SA_Reload_PRE, SA_Reload
- `js/app/load-main.js` (240 lines) — loadMain() function (reads all settings, initializes EV monitoring, resize)
- `js/app/settings-io.js` (120 lines) — Settings_writeJS, SettingsClosed
- `js/app/background.js` (210 lines) — BG vars, BG_Basic, BG_AddShadow, BG_AddBlackhole, OP selection (OP_gallery_sorting, OP_change, OP_change_event), Canvas_BDDraw_disabled, Canvas_BDDraw
- `js/app/gallery-utils.js` (130 lines) — loadImageDimALL, loadImageDim, SA_extra_info_on, SEQ_SmartPreloading vars, SEQ_SmartPreloading, SEQ_SmartPreloading_Core
- All as global functions loaded via `document.write` in `_SA.js`
- Parse-time code kept in _SA.js: ValidatePath, ItemsFromFolder, FrameObject, SEQ_generate_gallery, LABEL_LoadSettings, loadFolder_CORE, gallery/SEQ vars, bottom IIFE
- _SA.js: 1,789 → 644 lines (−1,145)

### 6A — Split dungeon.js: inventory, restart, multiplayer → js/dungeon/ ✅
- Exposed closure vars `_CombatStats`, `_AreaDataSaved` on return object
- Created js/dungeon/inventory.js (378 lines) — INV class, inventory manager
- Created js/dungeon/restart.js (1,404 lines) — scene restart/area transitions
- Created js/dungeon/multiplayer.js (674 lines) — P2P networking, OPC sync
- Added `document.write` loading for modules before `init()` call
- dungeon.js: 14,108 → 11,667 lines (−2,441)
### 6B — Split dungeon.js: events, states, sfx, utils → js/dungeon/ ✅
- Created js/dungeon/check_states.js (34 lines) — auto-damage, HP checking, character state actions
- Created js/dungeon/events_default.js (704 lines) — default event/dialogue data (player manual, settings, WebXR options, misc, defeated handler)
- Created js/dungeon/run_event.js (768 lines) — event execution engine (_event_active, run_event IIFE: branching dialogue, combat, NPC interactions, inventory events)
- Created js/dungeon/sfx_check.js (44 lines) — footstep sound effects tied to animation frames
- Created js/dungeon/utils.js (522 lines) — create_combat_character, create_combat_event, grid_array_by_object, adjust_boundingBox, tooltip
- Added `document.write` loading for 5 modules after Step 6A modules
- dungeon.js: 11,667 → 9,620 lines (−2,047)
### 6C — Split dungeon.js: character, map → js/dungeon/ ✅
- Created js/dungeon/character.js (496 lines) — character controller: position, rotation, camera TPS, combat mode toggle, mount/dismount, bounding box, key bindings, reset
- Created js/dungeon/map.js (1,000 lines) — check_grid_blocking, GOML_dungeon_blocks (mesh generation), get_ground_y (bilinear interpolation), get_para (grid params), update_dungeon_blocks (minimap, wall rendering, grid cache)
- Closure var refs in character.js updated: Object3D_proxy_base → MMD_SA_options.Dungeon.Object3D_proxy_base, CombatStats → MMD_SA_options.Dungeon._CombatStats
- dungeon.js: 9,620 → 8,142 lines (−1,478)

### 7A — Split EQP.js + clean core.js/core_extra.js ✅
- **EQP.js** extracted 3 modules into `js/eqp/`:
  - `js/eqp/resize.js` (174 lines) — EQP_resize function (part sizing, Silverlight/HTML5/CSS3 scaling)
  - `js/eqp/animate.js` (287 lines) — EQP_EV_animate_full + CANVAS_must_redraw (per-frame opacity/scale/rotation animation, canvas compositing)
  - `js/eqp/wallpaper_mode.js` (86 lines) — EQP_wallpaper_mode object (position adjustment for wallpaper display, fireworks/WebGL offsets)
  - Modules loaded via `document.write` after EQP_core.js
  - EQP.js: 1,314 → 779 lines (−535). Remaining bulk: EQP_EV_init (635 lines, too tightly integrated to split)
- **core.js**: removed 4 dead polyfills (String.trim ES5, Date.now ES5, Array.find ES2015, Object.assign ES2015)
  - core.js: 774 → 717 lines (−57)
  - Added clarifying comments for vars re-declared in core_extra.js (oShell, Shell_OBJ, FSO_OBJ, is_SA_child_animation, SA_child_animation_id, SA_topmost_window)
- **core_extra.js**: added documentation comments for re-declaration intent
  - Kept two-file split (core.js = definitions/utils/platform detection, core_extra.js = script orchestration/UI generation)
  - Analysis showed merging is viable (~1,560 lines) but the current split matches logical roles

### 8A — JSDoc, ES module entry point, remove document.write, var→let/const

---

## Key File Sizes (Original)
| File | Lines | Priority |
|------|-------|----------|
| MMD.js/MMD_SA.js | 18,371 | CRITICAL |
| js/dungeon.js | 14,105 | HIGH |
| js/_SA.js | 5,263 | HIGH |
| js/mocap_lib_module.js | 1,970 | HIGH (body tracking) |
| js/EQP.js | 1,319 | MEDIUM |
| js/facemesh_lib.js | 1,134 | HIGH (body tracking) |
| js/core_extra.js | 857 | MEDIUM |
| js/core.js | 791 | LOW |

## Architecture
- Load order: globals.js → module-loader.js → core.js → core_extra.js → SA_load_scripts() → _SA.js → _SA2.js → EQP.js → MMD_SA.js
- All code uses global variables on `window`
- Platform support: Browser + Electron/NW.js + Wallpaper Engine CEF (legacy HTA/XUL/Silverlight removed)
- Body tracking uses Web Workers with ES module imports (mocap_lib_module.js)
- 3D rendering via Three.js + jThree fork
- `document.write()` for synchronous script loading (will be replaced in Etapa 8)

## Notes
- **Primary entry point: XR_Animator.html** — This is the main file in active use (sets `cmd_line: "demo20"`). It contains extra features and is the reference for all testing. All refactoring must be validated against this entry point first.
