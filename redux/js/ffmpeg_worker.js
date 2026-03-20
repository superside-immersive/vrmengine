// Reduced-build inert shim for ffmpeg_worker.js
// The original FFmpeg worker is quarantined in _quarantine/js/phase-f/.
// This shim satisfies the stale new Worker("js/ffmpeg_worker.js") call
// in SA_system_emulation.min.js without restoring video encoding.
// It posts "OK" so the FFmpeg.load() promise resolves, then ignores all messages.

postMessage("OK");

self.onmessage = function () {
  // no-op: encoding is not available in the reduced build
};
