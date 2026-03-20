# Phase B audit - blocked candidates

This folder documents JavaScript files audited for quarantine but **not moved yet**.

Current preserved scope:

- XR Animator current flow
- localhost/dev browser runtime
- MediaPipe tracking and calibration/settings
- `settings.html`
- VRMA import/export path
- BVH export

## Blocked for now

### `js/box3d.js`
- Audit completed in this phase.
- Feature removal and quarantine were completed later in phase C.
- See `../phase-c/README.md`.

### `js/svg_clock.js`
- Audit completed in this phase.
- Feature removal and quarantine were completed later in phase D.
- See `../phase-d/README.md`.

### `js/animate_filters.js`
- Audit completed in this phase.
- Feature removal and quarantine were completed later in phase E.
- See `../phase-e/README.md`.

### `js/ffmpeg_worker.js`
- Audit completed in this phase.
- Quarantine was completed later in phase F for the reduced browser/dev target because the FFmpeg path is Electron-gated.
- See `../phase-f/README.md`.

### `js/fingerpose.js`
- Audit completed in this phase.
- Quarantine was completed later in phase H after disabling motion-control entry points and scene gesture hooks in reduced mode.
- See `../phase-h/README.md`.

### `js/pico.worker.js`
- Audit completed in this phase.
- Quarantine was completed later in phase G after disabling the legacy `Laughing Man` face-detection toggle.
- See `../phase-g/README.md`.

### `js/scene_auto_fit.js`
- Still referenced by XR Animator scene parsing/export paths.
- Reduced-build hardening was completed later so gesture paths are inert when `fingerpose.js` is missing or reduced mode is active.
- Conclusion: do not quarantine until scene auto-fit itself is explicitly out of scope and removed.
