# Phase G JS quarantine

Files moved here after removing the related reduced-build feature.

## Moved files

- `js/pico.worker.js`
  - This worker was used by the legacy face-detection / `Laughing Man` path inside `js/SA_system_emulation.min.js`.
  - The XR Animator `laughing_man` item was changed to a removed-feature message in both the modular and monolithic item definitions.
  - No direct MediaPipe facemesh/pose/hands dependency was found in the current tracking stack.
