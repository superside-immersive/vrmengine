# Phase H JS quarantine

Files moved here after disabling all reduced-build entry points that activated gesture-control logic.

Additional hardening was applied after the move so the reduced build no longer depends on gesture internals even if scene auto-fit is still loaded.

## Moved files

- `js/fingerpose.js`
  - This library backed legacy hand-gesture interpretation for `System._browser.motion_control`.
  - User-facing motion-control entry points were removed from XR Animator.
  - `scene_auto_fit.js` was updated to skip gesture hooks in reduced mode.
  - `scene_auto_fit.js` now guards all gesture processing when `fp` is unavailable.
  - `scene_auto_fit.js` only tears down `motion_control` state when its gesture plugin was actually activated.
  - No direct MediaPipe pose/facemesh/hand landmark loading dependency remained for the reduced browser/dev target.

## Reduced-build compatibility shim

- `js/fingerpose.js`
  - A tiny local shim now exists at the original path.
  - Purpose: satisfy stale lazy-load paths in `SA_system_emulation.min.js` without restoring the real gesture library.
  - The shim provides inert `fp` classes/constants only; it does not restore gesture recognition.
  - The shim is tagged with `fp.__reduced_build_shim__ = true` so reduced-build runtime guards can reject it as a real gesture backend.
  - The shim estimator returns an empty fingerpose-like result shape for safer compatibility with stale motion-control callers.
  - The shim also exposes inert built-in gesture placeholders such as `fp.Gestures.VictoryGesture` and `fp.Gestures.ThumbsUpGesture` for stale minified callers.

## Retained dependencies after phase H

- `js/scene_auto_fit.js`
  - Still required for scene auto-fit data and scene parsing/import paths.
  - Gesture code is now inert in the reduced build unless the legacy gesture layer is explicitly present and enabled.

## Validation

- XR Animator still responds in the local browser/dev flow.
- `settings.html` still responds.
- No diagnostics were introduced in `js/scene_auto_fit.js`.
