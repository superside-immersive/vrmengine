# scene_auto_fit reduction map

Purpose: identify what must stay for the reduced XR Animator build and what is now only legacy interactive gesture logic.

## Keep for now

### Auto-fit core
- `auto_fit_core()`
- `auto_fit_loop()`
- `auto_fit()`
- Reason: these implement scene object placement, scaling, transform reset, and `auto_fit_list` behavior.

### Runtime hooks required by auto-fit
- `adjust_hip_y_offset()`
- `adjust_height_offset_by_bone()`
- `load()` bootstrapping for:
  - motion target tracking
  - auto-fit refresh on motion change
  - scene unload cleanup
  - `auto_fit_list` initialization
- Reason: these are still part of scene load/update behavior, even in the reduced build.

### Optional but still retained
- `morph_event()`
- Reason: still tied to scene action payloads and not yet separately audited.

## Legacy interactive layer now effectively inert in reduced build

### Gesture runtime
- `process_gesture()`
- `gesture_plugin`
- gesture-estimator helper inside `gesture_plugin.process()`
- `restore_explorer_mode()`
- keypress gesture plumbing inside `load()`

Reason:
- depends on `fingerpose` / `fp`
- tied to `System._browser.motion_control`
- tied to scene `on.gesture` payloads
- user-facing motion-control entry points were already removed from the reduced build
- stale minified loaders are now satisfied by an inert compatibility shim instead of the real library

## Current hardening already in place

- `process_gesture()` is now only a thin gated wrapper around the isolated legacy runtime body (`process_gesture_runtime()`)
- legacy gesture candidate collection is now isolated in `collect_gesture_candidates()`
- per-candidate alias/cooldown/runtime checks are now isolated in `resolve_gesture_candidate()`
- legacy gesture condition evaluation is now isolated in `gesture_condition_passed()`
- legacy gesture side-effects (`attach` / `detach` / `place` / `transform` / `motion_tracking` / `blendshape` / `user_data`) are now isolated in `apply_gesture_action()` inside that runtime body
- gesture processing exits immediately in reduced mode
- gesture processing exits immediately when `fp` is unavailable
- gesture runtime also refuses the reduced-build shim via `fp.__reduced_build_shim__`
- `gesture_plugin.init()` now also marks the shim as unavailable, matching the runtime guard path
- backend availability is now separated from scene activation through `scene_gesture_backend_available()`
- no-op gesture paths now clear stale per-hand gesture matches instead of leaving previous detections behind
- shared helpers now centralize gesture-runtime gating and teardown:
  - `scene_gesture_data()`
  - `scene_gesture_runtime_enabled()`
  - `clear_gesture_attached_object_flags()`
  - `reset_gesture_runtime_state()`
  - `deactivate_gesture_runtime()`
- shared helpers now also isolate load-time activation and gesture object marking:
  - `mark_gesture_attached_objects()`
  - `activate_gesture_runtime()`
- the dungeon gesture key handler is now only assigned when the real gesture runtime can actually activate
- gesture plugin activation requires both:
  - reduced mode disabled
  - `fp` present
  - scene gesture data present
- scene unload only tears down motion-control state if the gesture plugin was actually activated

## Safe next refactor target

Goal: convert the legacy interactive layer into an explicit reduced-build stub without changing scene import/auto-fit behavior.

Current status:
- the gesture runtime has already been split into a thin gate plus focused helpers
- further work here is now mostly readability cleanup unless a later reduction needs to physically remove the legacy block

### Candidate boundary
- Keep:
  - `auto_fit_core()`
  - `auto_fit_loop()`
  - `auto_fit()`
  - `morph_event()`
  - `adjust_hip_y_offset()`
  - `adjust_height_offset_by_bone()`
  - `load()` minimal auto-fit path
- Stub or isolate:
  - `process_gesture()` body
  - `gesture_plugin`
  - scene `on.gesture` attach/detach/place/transform handlers
  - motion-control plugin registration
  - dungeon key gesture handling
  - explorer-mode restoration triggered by gesture flow

## Stop conditions

Do not remove `scene_auto_fit.js` while any of the following still apply:
- XR Animator scene parsing/import still references it
- `auto_fit_list` still relies on it
- scene object placement still depends on its `load()` path

Do not remove gesture code blindly from the file until a reduced-build stub preserves:
- successful scene loading
- successful `auto_fit_list` execution
- no regressions in local browser/dev runtime
