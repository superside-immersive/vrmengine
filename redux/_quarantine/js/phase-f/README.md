# Phase F JS quarantine

Files moved here because they are out of scope for the reduced browser/dev build.

## Moved files

- `js/ffmpeg_worker.js`
  - This worker is only used by the FFmpeg encode path inside `System._browser.video_capture`.
  - The FFmpeg branch is gated by Electron mode in `js/SA_system_emulation.min.js`.
  - For the preserved target here (`localhost/dev` browser runtime), this file is not required.
  - Video capture UI was already removed from the reduced XR Animator flow.
