# Phase A JS quarantine

Scope for this quarantine pass:

- Preserve XR Animator current flow only
- Preserve localhost/dev browser runtime only
- Preserve MediaPipe tracking, calibration/settings, OSC/VMC
- Preserve `settings.html`
- Preserve VRMA import and BVH export

Files moved here in Phase A:

- `js/html5_webgl2d.js`
  - Current active load sites are commented out in the browser/dev path.
- `js/youtube_decode.js`
  - Current load site in `js/html5.js` is commented out.
- `js/settings_WE.js`
  - Only used for Wallpaper Engine mode, which is out of scope for this reduced browser/dev target.

Notes:

- These moves are intentionally reversible.
- Do not quarantine bootstrap/runtime core files from `js/`, `images/XR Animator/`, `js/tracking/`, or `js/dungeon/` without a separate audit.
- `js/VMD_filewriter.js` is blocked pending decision on legacy VMD export behavior.
