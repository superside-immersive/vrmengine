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

### 3A — Extract MMD_SA.js: audio + SFX
- `js/mmd/audio.js` (~300 lines) ← MMD_SA.js lines 253-1039
- `js/mmd/sfx.js` (~300 lines) ← MMD_SA.js lines 6651-7350

### 3B — Extract MMD_SA.js: speech-bubble + VFX
- `js/mmd/speech-bubble.js` (~300 lines) ← lines 2597-3668
- `js/mmd/vfx.js` (~300 lines) ← lines 7347-8766

### 3C — Extract MMD_SA.js: WebXR + OSC
- `js/mmd/webxr.js` (~300 lines) ← lines 5300-6190
- `js/mmd/osc.js` (~300 lines) ← lines 14000-14880

### 3D — Extract MMD_SA.js: gamepad + depth-wallpaper
- `js/mmd/gamepad.js` (~300 lines) ← lines 14886-15400
- `js/mmd/depth-wallpaper.js` (~300 lines) ← lines 15400-16200

### 3E — Verify MMD_SA.js integration after Etapa 3

### 4A — Extract MMD_SA.js core: camera + motion
- `js/mmd/camera.js` (~300 lines)
- `js/mmd/motion.js` (~300 lines)

### 4B — Extract MMD_SA.js core: renderer + post-processing
- `js/mmd/renderer.js` (~300 lines)
- `js/mmd/post-processing.js` (~300 lines)

### 4C — Extract MMD_SA.js core: bones + WebGL utils
- `js/mmd/bones.js` (~300 lines)
- `js/mmd/webgl-utils.js` (~250 lines)

### 4D — Extract MMD_SA.js core: VRM + bloom/SSAO/DOF
- `js/mmd/vrm-loader.js` (~300 lines)
- `js/mmd/vrm-rig.js` (~300 lines)
- `js/mmd/bloom-ssao.js` (~300 lines)
- `js/mmd/dof.js` (~200 lines)

### 4E — MMD_SA.js as orchestrator (~300-500 lines)

### 5A — Split _SA.js: init, resize, events, utils → js/app/
### 5B — Split _SA.js: animation, sequence, ev-usage → js/app/
### 5C — Split _SA.js: gallery, settings-io, background, reload, dragdrop → js/app/

### 6A — Split dungeon.js: core, combat, inventory, player → js/dungeon/
### 6B — Split dungeon.js: map, camera, npc, dialogue → js/dungeon/
### 6C — Split dungeon.js: events, ui, rendering, audio, input, config → js/dungeon/

### 7A — Split EQP.js + unify core.js/core_extra.js
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
