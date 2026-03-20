# Phase E JS quarantine

Files moved here after explicit feature removal from the reduced build.

## Moved files

- `js/animate_filters.js`
  - The visual filters feature was disabled in runtime by `js/_SA.js`.
  - `settings.html` was updated to stop exposing and persisting the `UseFilters` option.
  - No direct MediaPipe tracking dependency was found in `js/animate_filters.js` during audit.
