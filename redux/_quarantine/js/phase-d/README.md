# Phase D JS quarantine

Files moved here after explicit feature removal from the reduced build.

## Moved files

- `js/svg_clock.js`
  - The SVG Clock feature was disabled in runtime by `js/_SA.js`.
  - `settings.html` was updated to stop exposing and persisting the SVG Clock option.
  - With `use_SVG_Clock` forced to `false`, runtime references no longer activate `SVG_Clock` methods.
