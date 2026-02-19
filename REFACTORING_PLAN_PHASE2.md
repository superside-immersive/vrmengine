# System Animator Online — Refactoring Plan Phase 2

## Goal
Continue restructuring the codebase toward ~300-line files.
Phase 1 completed structural extraction. Phase 2 focuses on:
1. **Deep cleanup** of legacy dead code (Silverlight, WMP, IE, HTA/XUL)
2. **THREEX IIFE extraction** (6,400 lines in MMD_SA.js) using shared state pattern
3. **Unrefactored original files** (EQP_gallery 3,540 lines, SA_webkit 1,428, chatbox 1,183, etc.)
4. **Reduction of extracted files** still >300 lines

## Rules (same as Phase 1)
- Files ~300 lines max (except datasets)
- Legacy global variables kept as `window.xxx` aliases during transition
- Commit: `git -c commit.gpgsign=false commit -m "message"`
- Verify syntax: `node -c file.js`
- HTTP server on port 8080
- **Primary entry point: XR_Animator.html** (`cmd_line: "demo20"`)

## Context: What `use_Silverlight` actually means
Despite the name, `use_Silverlight = true` is used as a **semantic flag** meaning "uses advanced rendering (SVG/HTML5 canvas)" — NOT actual Silverlight plugin. The flag `ps.use_Silverlight` on each EQP part means "this part uses the canvas/SVG rendering path". Only the pure XAML generation code and `SL_Init()` calls are truly dead Silverlight code.

**Safe to remove:**
- XAML string generation blocks (`else if (use_Silverlight)` with XAML templates)
- `EQP_SL_xaml` array and `EV_SL_init` function (creates XAML elements via `SL.content.createFromXaml`)
- `SL_Init()` calls (function no longer exists — was in deleted Silverlight.js)
- `use_Silverlight_only` conditions (always `false`)
- IE DXImageTransform filters (IE-only CSS)

**NOT safe to remove (despite "SL" naming):**
- `ps.use_Silverlight` flag on individual parts — means "uses canvas/SVG renderer"
- `SL_loaded` variable — defined in html5.js and svg.js, means "canvas renderer ready"
- `SL_root`, `SL_content`, `SL` — emulation objects defined in html5.js/svg.js
- `EQP_SL_w/h/x/y` — used for canvas sizing calculations

## Context: What `ie8_mode` / `ie9_mode` means
These are always `true` in all supported environments. They were IE version gates. Code in `else` branches (non-IE fallback paths like `DXImageTransform` filters) is dead.

## Context: XUL helper files
- `SA_xul_create_shortcut.js` and `SA_xul_link_target.js` — despite "xul" names, these are **WSH scripts** (Windows Script Host) still used by Electron on Windows. Keep them.
- `SA_xul_image_dimension.js` — zero references, deleted in Phase 2 prep.

---

## Etapa 9 — Purge Legacy Dead Code

### 9A — Remove dead Silverlight XAML code from EQP.js
**Files:** `js/EQP.js`
**What to remove:**
- The `else if (use_Silverlight)` XAML generation branch (~90 lines, L444–534) — this creates XAML strings that would be loaded into actual Silverlight plugin. Since use_HTML5 or use_SVG always matches first in modern browsers, this branch is dead.
- `EQP_SL_xaml = []` declaration (L37) — only used by the XAML branch above and EV_SL_init
- `EV_SL_init` function (L717–766) — creates XAML elements via `SL.content.createFromXaml`, but `SL_Init` (which sets up the Silverlight control) was deleted in Phase 1. This function is dead.
- `SL_Init()` call at L686 — function doesn't exist anymore
- `use_Silverlight_only && !EQP_SL_xaml.length` condition (L651) — `use_Silverlight_only` is always `false`, dead branch
- IE `DXImageTransform` code at L545, L552 — IE-only, dead in `ie9_mode` else branch

**What to keep:**
- `ps.use_Silverlight = true` assignments in SVG and HTML5 branches (L339, L377) — this is just a rendering flag
- `if (use_Silverlight)` block at L665–688 — this initializes canvas/SVG sizing (EQP_SL_x/y/w/h). Keep but simplify: remove `SL_Init()` dead branch
- `if (EQP_allow_resize || use_Silverlight) EQP_resize()` at L654 — still functional

**Estimated reduction:** ~150 lines

### 9B — Remove dead Silverlight code from EQP_gallery.js
**Files:** `js/EQP_gallery.js`
**What to remove:**
- `EV_SL_init` duplicate function (L3532+) — dead, same as EQP.js version
- `SL_Init()` call (L2711) — function doesn't exist
- `SL_content.children.add(...)` calls (L147, L867) — Silverlight XAML insertion, dead

**Careful:** EQP_gallery.js is 3,540 lines and heavily complex. Only remove confirmed dead code in this step.

### 9C — Remove dead WMP code
**Files:** `js/EQP_core.js`, `js/_SA.js`, `js/svg.js`, `js/SA_media_control.js`, `js/audio_BPM.js`
**What to remove:**
- `use_WMP` variable declaration and all conditions (`if (use_WMP && WMP.in_use)` etc.)
- `self.use_WMP = self.WMP_hidden = true` in `_SA.js` L165
- `WMP_mask`, `WMP_left`, `WMP_top`, `WMP_width`, `WMP_height` block in `EQP_core.js` L548–559
- `if (self.WMP) WMP.dragdrop_init()` in `svg.js` L155–157
- WMP references in `SA_media_control.js` — these need careful review as SA_media_control.js may have HTML5 audio code interleaved with WMP code
- IE9/WMP branch in `audio_BPM.js` L451

**Note:** `wmp.js` was already deleted in Phase 1 (Step 1A). The `WMP` global object is now always undefined, so all `use_WMP && WMP.in_use` conditions are always false.

### 9D — Simplify IE mode variables
**Files:** `js/core.js`, `js/globals.js`, `js/_SA.js`, `js/app/resize.js`, `js/app/ev-processing.js`, `js/EQP.js`, `js/chatbox.js`, `js/dragdrop.js`, `js/EQP_gallery.js`
**What to do:**
- `ie_64bit`: always `false` — remove variable, remove all conditions (replace with `false` branch)
- `ie8_mode`: always `true` in all paths — simplify all conditions (replace `(ie8_mode)?X:Y` with `X`)
- `ie9_mode` / `ie9_native`: always `true` in all paths — simplify conditioned code, remove dead `else` branches (DXImageTransform filters, `img.filters.item(...)` calls, `attachEvent` fallbacks)
- Remove `DXImageTransform` CSS filter strings (IE-only): EQP.js L545, EQP_gallery.js L1239, app/resize.js L498
- `pixastic.js` L15-16: replace `attachEvent` fallback with `addEventListener` only

**WARNING:** `ie9_mode` is used in ~40 places. Work through them one by one. Many are in files not yet refactored (EQP_gallery.js).

### 9E — Clean HTA/XUL remnants
**Files:** `js/SA_system_emulation_ext.js`, `js/core.js`, `js/core_extra.js`, `js/_SA2.js`, `js/dragdrop.js`, `js/EQP_core.js`, `js/audio_fft.js`
**What to do:**
- `xul_mode` branches: in SA_system_emulation_ext.js (L4, L12, L48, L345, L351), core.js (L545), dragdrop.js (L8-10), EQP_core.js (L10), audio_fft.js (L144) — `xul_mode` is always `undefined`/`false`, simplify conditions
- `HTA_path` / `HTA_folder_as_config_folder` in SA_system_emulation_ext.js (L18-19, L278, L375-455) — assess if Electron shortcut creation still uses these; if not, remove
- `SA_HTA_folder` in core_extra.js (L6, L120-132), _SA2.js (L428-431) — variable declarations and assignments, check if still used downstream
- `xul_version` in core.js (L545) — always 0, remove

**CAREFUL with SA_system_emulation_ext.js:** This file handles real Electron/NW.js functionality (shortcut creation, environment paths). The `webkit_mode` branches must be preserved. Only remove `xul_mode` branches.

### 9F — Remove misc dead code
**Files:** various
**What to remove:**
- `Seq_speed_delay = 1` in `_SA.js` L30 — obsolete, always 1. Remove variable and simplify multiply in `ev-processing.js` L732
- Commented-out code block `SA_regread.js` in `SA_webkit.js` L753-760
- Commented-out `useLegacyLights` in `MMD_SA.js` L8107-8109
- `EV_SL_init` duplicate declaration between EQP.js and EQP_gallery.js (covered in 9A/9B)

### 9G — Verify + commit Etapa 9
- `node -c` on every modified file
- `grep -r "use_Silverlight_only\|SL_Init\|EQP_SL_xaml\|DXImageTransform\|use_WMP\b\|ie_64bit\|Seq_speed_delay" js/ --include="*.js"` — verify no remnants
- Test XR_Animator.html on http://127.0.0.1:8080
- Commit each sub-step separately for easy rollback

---

## Etapa 10 — Extract THREEX IIFE from MMD_SA.js

### Architecture Overview

**Current state:** `MMD_SA.THREEX` is a single IIFE (lines 3859–10265 in MMD_SA.js, ~6,400 lines) that returns a `threeX` object. It has ~30 closure variables that all subsections share.

**Strategy:** Create a shared state object `TX` at the top of the IIFE, containing all closure variables. Extract subsections into separate files as functions that receive `TX`. Load via `SA.loader.loadScriptSync` from `_SA.js`. The IIFE becomes a thin orchestrator (~1,500 lines).

**Shared state object `TX`** (created at IIFE top):
```js
const TX = {
  data, models, models_dummy, obj_list,
  THREE, _THREE,
  v1, v2, v3, v4, q1, q2, q3, q4,
  e1, e2, e3, e4, m1, m2, m3, m4,
  p1, l1, r1,
  rot_arm_axis, rot_shoulder_axis,
  enabled, loaded, loading, resolve_loading,
  use_OutlineEffect,
  threeX, VRM, MMD, GLTF_loader,
  // references set during init
  use_VRM1: undefined,
  MMD_bone_tree: undefined,
}
```

**Note:** `TX` properties are mutable — sub-modules modify them (e.g., `TX.THREE = self.THREE`). Getters on `threeX` already abstract access, so external code doesn't need to change.

### 10A — Extract VRM sub-IIFE
**Source:** MMD_SA.js lines 4574–6047 (~1,473 lines)
**Target:** `js/mmd/threex-vrm.js`
**Pattern:** `window.MMD_SA_createTHREEX_VRM = function(TX) { ... return VRM; }`
**Closure deps:** TX.data, TX.models, TX.THREE, TX._THREE, TX.v1-v4, TX.q1-q4, TX.e1-e4, TX.m1-m4, TX.threeX, TX.GLTF_loader, TX.use_VRM1, TX.rot_shoulder_axis
**Called from:** MMD_SA.js THREEX IIFE: `const VRM = MMD_SA_createTHREEX_VRM(TX);`

### 10B — Extract PPE (Post-Processing Effects)
**Source:** MMD_SA.js lines 6174–7254 (~1,080 lines) — DOF, N8AO, UnrealBloom
**Target:** `js/mmd/threex-ppe.js`
**Pattern:** `window.MMD_SA_createTHREEX_PPE = function(TX) { ... return PPE; }`
**Closure deps:** TX.data, TX.THREE, TX.threeX
**Sub-sections:** DOF (~350 lines), N8AO (~350 lines), UnrealBloom (~380 lines)
**Note:** Each effect loads its own shaders via dynamic `import()`. The PPE object orchestrates enable/disable/render.

### 10C — Extract motion import/export utilities
**Source:** MMD_SA.js lines 8312–9649 (~1,337 lines)
**Target:** `js/mmd/threex-motion.js`
**Pattern:** `window.MMD_SA_createTHREEX_Motion = function(TX) { ... return { load_THREEX_motion, export_GLTF_motion, export_GLTF, export_VRMA, convert_AnimationClip_to_VMD }; }`
**Contains:** Mixamo FBX loading, GLTF motion loading, VMD conversion, rig map building, BVH export, GLTF/VRMA export
**Closure deps:** TX.THREE, TX._THREE, TX.threeX, TX.models, TX.v1-v4, TX.q1-q4, TX.e1-e4

### 10D — Extract misc utilities
**Source:** MMD_SA.js various sections (~700 lines total)
**Target:** `js/mmd/threex-utils.js`
**Pattern:** `window.MMD_SA_createTHREEX_Utils = function(TX) { ... return { camera_auto_targeting, HDRI, dispose, display_helper, load_octree, computeBoundingBox, convert_pose_rotation, load_THREEX }; }`
**Contains:**
- `camera_auto_targeting` (L9651–9901, ~250 lines) — face/target tracking
- `HDRI` (L9910–10024, ~114 lines) — environment map loading
- `display_helper` (L10063–10195, ~132 lines) — debug bone visualization
- `dispose` (L10026–10061, ~35 lines)
- `computeBoundingBox` (L8175–8207, ~32 lines)
- `convert_A/T_pose_rotation` (L8208–8250, ~42 lines)
- `rig_map` data (L8252–8310, ~58 lines)
- `load_THREEX` (L8158–8173, ~15 lines)
- `load_octree` (L9903–9908, ~5 lines)

### 10E — Extract GUI + load_scripts
**Source:** MMD_SA.js lines 7256–7601 (~345 lines)
**Target:** `js/mmd/threex-gui.js`
**Pattern:** `window.MMD_SA_createTHREEX_GUI = function(TX) { ... return { GUI, load_scripts }; }`
**Contains:**
- `GUI` object (L7256–7429) — dat.GUI integration, light/camera controls
- `load_scripts` async function (L7431–7601) — imports Three.js modules, GLTFLoader, three-vrm

### 10F — Verify THREEX extraction
- `node -c` on all new files + MMD_SA.js
- Expected MMD_SA.js THREEX reduction: ~6,400 → ~1,500 lines
- Total MMD_SA.js: ~10,291 → ~5,400 lines
- Test XR_Animator.html fully (model loading, motion, effects)
- Commit

---

## Etapa 11 — Extract pre-THREEX sections from MMD_SA.js

### 11A — Extract motion management
**Source:** MMD_SA.js lines ~560–1200 (~640 lines)
**Target:** `js/mmd/motion.js`
**Contains:** `assign_motion`, `model_seek_time`, `time_update`, `_finalize`, `_vmd`, motion shuffle, motion loading pipeline
**Closure deps:** Uses `MMD_SA` and `MMD_SA_options` globals (no closure — these are global object methods)
**Pattern:** Global function that adds methods to `MMD_SA` object

### 11B — Extract model init + camera utilities
**Source:** MMD_SA.js lines ~3455–3858 (~400 lines)
**Target:** `js/mmd/model-init.js`
**Contains:** `init_my_model`, `reset_camera`, `get_camera_base`, `get_camera_raw`, `mouse_to_ray`, `bone_origin`
**Note:** These are direct properties/methods on the `MMD_SA` object — simple extraction.

### 11C — Verify + commit
- Expected MMD_SA.js reduction to ~4,400 lines (still large due to remaining THREEX orchestrator + init + event handlers)
- Remaining bulk: MMD_SA.init() (complex), BPM/audio sync, custom actions, GOML mesh generation — tightly coupled
- Commit

---

## Etapa 12 — Split unrefactored original files

### 12A — Split EQP_gallery.js (3,540 lines → js/eqp/)
**Analysis needed first:** Read the file structure and identify independent subsections. Likely candidates:
- Gallery browse/navigation
- Image loading/preloading
- Playlist management
- Drag-drop handling
- Sorting/filtering
- Silverlight/HTML5 rendering (after 9B cleanup)

**This is the largest unrefactored file and needs careful analysis before splitting.**

### 12B — Split SA_webkit.js (1,428 lines → js/webkit/)
**Contains:** Electron/NW.js platform-specific code
**Likely sub-modules:**
- File system operations (read/write/browse)
- Window management (maximize, minimize, transparency)
- Tray menu
- Screenshot/capture
- WebKit-specific UI

### 12C — Split chatbox.js (1,183 lines)
**Contains:** P2P chat system
**Likely sub-modules:**
- Chat UI rendering
- P2P messaging (PeerJS integration)
- Message formatting/parsing

### 12D — Split canvas_matrix_rain.js (710 lines)
**Contains:** Matrix rain effect — likely a single class, may not split cleanly.

### 12E — Reduce EQP_core.js (697 lines)
**Post-cleanup of Silverlight/WMP in Etapa 9, this may already drop under 400 lines.** Assess after 9C.

### 12F — Reduce core.js (757 lines) and core_extra.js (847 lines)
**Post-cleanup of IE/HTA variables in Etapa 9, these may shrink significantly.** Assess after 9D/9E.

### 12G — Split audio_BPM.js (794 lines)
**Contains:** BPM detection, beat analysis — assess split feasibility.

### 12H — Split SA_system_emulation_ext.js (571 lines)
**Post-cleanup of HTA/XUL in 9E, may drop under 400. Assess.**

---

## Etapa 13 — Reduce extracted files >300 lines

Files extracted in Phase 1 that still exceed the 300-line target:

| File | Lines | Action |
|------|-------|--------|
| `mmd/defaults.js` | 1,531 | Split: model defaults, THREEX options, extra models, mesh gen |
| `mmd/wallpaper3d.js` | 1,509 | Split: depth estimation, parallax engine, video processing |
| `dungeon/restart.js` | 1,405 | Split: scene restart, area transitions, save/load |
| `mmd/speech-bubble.js` | 1,075 | Split: SB class/rendering, dialogue branching, highlight |
| `dungeon/map.js` | 1,001 | Split: grid blocking, mesh generation, minimap |
| `mmd/sprite.js` | 987 | Split: TextureAnimator, explosion/hit effects, HP bar |
| `mmd/webxr.js` | 898 | Split: AR session, VR session, hit-testing |
| `mmd/audio.js` | 802 | Split: BPM sync, drag-drop handlers, media events |
| `app/ev-processing.js` | 769 | Monolithic function — deferred (deep local deps) |
| `dungeon/run_event.js` | 769 | Event engine — assess split feasibility |
| `dungeon/events_default.js` | 705 | Data/events — may be acceptable as dataset |
| `app/resize.js` | 699 | Monolithic function — deferred (deep local deps) |
| `dungeon/multiplayer.js` | 675 | P2P networking — assess split |
| `dungeon/utils.js` | 523 | Utilities — assess split |
| `app/animate-core.js` | 512 | Monolithic function — deferred |
| `dungeon/character.js` | 497 | Character controller — assess split |
| `mmd/gamepad.js` | 440 | Gamepad controller — close to target |
| `dungeon/inventory.js` | 379 | Inventory manager — close to target |
| `app/events.js` | 362 | Key handlers — close to target |
| `app/init-ui.js` | 360 | UI init — close to target |
| `app/seq-animate.js` | 315 | Seq animation — close to target |
| `mmd/vfx.js` | 344 | VFX effects — close to target |

**Priority:** Files >800 lines first. Files 300–500 lines are acceptable unless easy to split.

---

## Key File Sizes After Phase 1

| File | Lines | Status |
|------|-------|--------|
| MMD.js/MMD_SA.js | 10,292 | THREEX IIFE ~6,400 acopladas |
| js/dungeon.js | 8,143 | IIFE principal, 10 módulos extraídos |
| js/EQP_gallery.js | 3,540 | No tocado |
| js/SA_webkit.js | 1,428 | No tocado |
| js/chatbox.js | 1,183 | No tocado |
| js/core_extra.js | 847 | Limpieza parcial |
| js/audio_BPM.js | 794 | No tocado |
| js/EQP.js | 780 | EQP_EV_init restante |
| js/canvas_matrix_rain.js | 710 | No tocado |
| js/EQP_core.js | 697 | No tocado |
| js/_SA.js | 645 | Cerca del objetivo |
| js/audio_fft.js | 591 | No tocado |
| js/SA_system_emulation_ext.js | 571 | No tocado |
| js/_SA2.js | 535 | No tocado |

## Load Chain (XR_Animator.html, demo20 path)

```
HTML <script> tags:
  globals.js → module-loader.js → core.js → core_extra.js → SA_load_scripts()

core.js loads:
  SA_webkit.js, jsmediatags.js

core_extra.js loads:
  SA_system_emulation_ext.js, SA_system_emulation.min.js

SA_load_scripts() loads:
  _SA.js, _SA2.js, _core.00.min.js (or dev: dragdrop.js, img_cache.js, seq.js, shell_folder.js)

_SA.js loads (via SA.loader.loadScriptSync):
  app/utils.js, app/events.js, app/init-ui.js, app/resize.js,
  app/ev-init.js, app/animate.js, app/animate-core.js,
  app/ev-processing.js, app/seq-animate.js, app/sa-init.js,
  app/dragdrop-handler.js, app/load-main.js, app/settings-io.js,
  app/background.js, app/gallery-utils.js
  
  Then conditionally (MMD path for demo20):
  mmd/audio.js, mmd/sfx.js, mmd/speech-bubble.js, mmd/vfx.js,
  mmd/webxr.js, mmd/osc.js, mmd/gamepad.js, mmd/wallpaper3d.js,
  mmd/sprite.js, mmd/camera-shake.js, mmd/defaults.js
  → MMD.js/MMD_SA.js

_SA2.js loads conditionally:
  EQP_gallery.js, EQP_canvas_effects_core.js, svg_clock.js,
  audio_fft.js, box3d.js, headtracker_ar.js

EQP.js loads:
  EQP_core.js, EQP_FB.js, eqp/resize.js, eqp/animate.js,
  eqp/wallpaper_mode.js, html5.js or svg.js

MMD_SA.js internally loads:
  canvas_matrix_rain.js (conditional)

dungeon.js loads:
  dungeon.core.min.js (or dev: mersenne-twister.js, dungeon-generator.js, etc.)
  dungeon/inventory.js, dungeon/restart.js, dungeon/multiplayer.js,
  dungeon/check_states.js, dungeon/events_default.js, dungeon/run_event.js,
  dungeon/sfx_check.js, dungeon/utils.js, dungeon/character.js, dungeon/map.js

SA_load_body():
  SA_gimage_emulation.js
```

## Recommended Execution Order

1. **Etapa 9** (cleanup) — lowest risk, reduces noise for later steps
2. **Etapa 10** (THREEX) — highest impact, cuts MMD_SA.js in half
3. **Etapa 11** (pre-THREEX) — moderate impact
4. **Etapa 12** (original files) — independent work per file
5. **Etapa 13** (reduce extracted) — polish pass

Each Etapa can be done in a separate conversation. Each sub-step (9A, 9B, etc.) should be committed independently.
