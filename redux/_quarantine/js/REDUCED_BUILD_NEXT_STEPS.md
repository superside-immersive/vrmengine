# Reduced build next steps

Current preserved scope:

- XR Animator current flow
- localhost/dev browser runtime
- MediaPipe tracking, smoothing, calibration, and settings
- OSC/VMC UDP sending
- `settings.html`
- VRMA import/export
- BVH export

Completed quarantine phases:

- Phase A: `html5_webgl2d.js`, `youtube_decode.js`, `settings_WE.js`
- Phase C: `box3d.js`
- Phase D: `svg_clock.js`
- Phase E: `animate_filters.js`
- Phase F: `ffmpeg_worker.js`
- Phase G: `pico.worker.js`
- Phase H: `fingerpose.js`

Compatibility shims now in use:

- `js/fingerpose.js`
   - reduced-build inert shim kept only to satisfy stale lazy-load paths in the minified system runtime
   - returns empty fingerpose-like estimator results instead of restoring gesture detection
   - exposes inert built-in gesture placeholders required by stale virtual-mouse/game motion-control code
- `js/ffmpeg_worker.js`
   - inert Worker shim kept only to satisfy the stale FFmpeg worker creation path in `SA_system_emulation.min.js`
   - immediately acknowledges startup and ignores encode requests
- `js/pico.worker.js`
   - inert Worker shim kept only to satisfy the stale pico face-detection worker creation path in `SA_system_emulation.min.js`
   - immediately acknowledges startup and ignores worker messages

Current status of `scene_auto_fit.js`:

- Keep for now.
- Reason: still participates in scene parsing/import and `auto_fit_list` behavior.
- Gesture-related behavior is now inert in reduced mode and when `fingerpose.js` is absent.
- The legacy gesture runtime is now split into smaller helpers, so this front is close to stabilization and remaining work is mostly optional cleanup.

Loader/runtime hardening now in place:

- `core_extra.js` no longer tries to load quarantined `settings_WE.js`
- `core.js` now provides an inert global `Box3D` stub so stale animation hooks cannot throw even if the legacy script stays quarantined
- `core.js` now also provides an inert global `SVG_Clock` stub so guarded legacy clock hooks remain safe even if `use_SVG_Clock` is toggled accidentally
- stale worker loads in `SA_system_emulation.min.js` now resolve to inert shims instead of 404ing

Preserved export/networking checklist:

- VRMA import/export
  - keep [js/mmd/threex-motion.js](js/mmd/threex-motion.js#L437-L458) for `.vrma` import and clip creation
  - keep [js/mmd/threex-motion.js](js/mmd/threex-motion.js#L1305-L1343) for `export_VRMA`
  - keep [three.js/three-vrm-animation.module.js](three.js/three-vrm-animation.module.js) and [three.js/bvh2vrma/convertBVHToVRMAnimation.js](three.js/bvh2vrma/convertBVHToVRMAnimation.js)
- BVH export/import support
  - keep [js/BVH_filewriter.js](js/BVH_filewriter.js)
  - keep [js/mmd/threex-motion.js](js/mmd/threex-motion.js#L1317-L1335)
  - keep [three.js/loaders/_BVHLoader.js](three.js/loaders/_BVHLoader.js)
- OSC/VMC UDP sending
  - keep [js/_SA.js](js/_SA.js#L688-L698) load of `js/mmd/osc.js`
  - keep [MMD.js/MMD_SA.js](MMD.js/MMD_SA.js#L1179-L1180) OSC initialization
  - keep [js/mmd/defaults.js](js/mmd/defaults.js#L238-L245) VMC default ports/state

Recommended next sequence:

1. Optional final cleanup inside `scene_auto_fit.js`
   - Only if worthwhile for readability: keep shrinking the legacy gesture runtime into tiny helpers.
   - Reference map: `SCENE_AUTO_FIT_REDUCTION_MAP.md`.

2. Protect preserved exports and networking during future reductions
   - Treat the checklist above as required surface for browser/dev reduced builds.

3. Optional cleanup pass on dead browser-only comments/legacy guards
   - Safe-to-ignore commented references remain for `html5_webgl2d.js`, `youtube_decode.js`, and `animate_filters.js`.
   - Remove only if doing a readability cleanup, not as a runtime fix.

4. Keep rechecking stale minified compatibility entry points before deleting any shim
   - `SA_system_emulation.min.js` still contains hardcoded lazy-load and worker paths.
   - Do not remove the shim files until those minified entry points are replaced or bypassed.

Stop conditions:

- Do not remove `scene_auto_fit.js` while scene import/export or `auto_fit_list` still relies on it.
- Do not remove anything under `js/tracking/`, `js/@mediapipe/`, or core XR Animator boot/runtime files without a separate audit.
- Do not touch VRMA/BVH/OSC-VMC paths unless a dedicated replacement exists.
