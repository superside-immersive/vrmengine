# Phase C JS quarantine

Files moved here after explicit feature removal from the reduced build.

## Moved files

- `js/box3d.js`
  - The Box3D feature was disabled in runtime by `js/_SA2.js`.
  - `settings.html` was updated to stop exposing and persisting the Box3D option.
  - With `Settings.CSSTransform3DBoxAnimate` forced to `0`, runtime references no longer activate `Box3D` methods.
