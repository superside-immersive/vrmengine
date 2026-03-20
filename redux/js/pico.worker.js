// Reduced-build inert shim for pico.worker.js
// The original pico face-detection worker is quarantined in _quarantine/js/phase-g/.
// This shim satisfies the stale new Worker("js/pico.worker.js") call
// in SA_system_emulation.min.js without restoring pico face detection.
// It posts a status string so worker_initialized becomes true, then ignores messages.

postMessage("reduced build shim – pico face detection disabled");

self.onmessage = function () {
  // no-op: pico face detection is not available in the reduced build
};
