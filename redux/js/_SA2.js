// (2025-08-24) — [SIMPLIFIED Ronda 1: Electron IPC removed]

var IPC

;(function () {
  document.addEventListener("contextmenu", function (event) { event.preventDefault(); }, false);
  // [REMOVED] Electron IPC object (~375 lines) — browser-only mode
})();


(function () {
  if (EQP_gallery)
    //SA.loader.loadScriptSync('js/EQP_gallery.js')

  if (use_EQP_ripple || use_EQP_fireworks) {
    //SA.loader.loadScriptSync('js/EQP_canvas_effects_core.js')
    if (!EQP_gallery && use_WebGL && !self.WebGL_2D) {
      // SA.loader.loadScriptSync('js/html5_webgl2d.js')
    }
  }

  if (use_SVG_Clock) {
    // SA.loader.loadScriptSync('js/svg_clock.js')
  }

  // [AUDIO REMOVED] AudioFFT disabled
  Settings.UseAudioFFT = false
  Settings.UseAudioFFTLiveInput = false

  Settings.CSSTransform3DBoxAnimate = parseInt(System.Gadget.Settings.readString("CSSTransform3DBoxAnimate"))
  if (!Settings.CSSTransform3DBoxAnimate)
    Settings.CSSTransform3DBoxAnimate = parseInt(Settings_default.CSSTransform3DBoxAnimate)
  if (Settings.CSSTransform3DBoxAnimate)
    SA.loader.loadScriptSync('js/box3d.js')

  if (!is_SA_child_animation && returnBoolean("UseWebcamHeadtracking"))
    SA.loader.loadScriptSync('js/tracking/headtracker_ar.js')

  if (gallery.length && !gallery_cache_obj.SS_mode) {
    var galleries = (SEQ_gallery) ? SEQ_gallery : [{gallery:gallery}]

    for (var i = 0; i < galleries.length; i++)
      galleries[i].gallery.sort(function (a,b) { return a.frame - b.frame })
  }
})();

// "SA_GadgetLocalConfig()" — [REMOVED Ronda 1: desktop-only]
;(function () {
  if (use_SA_browser_mode) return;
  // [REMOVED] desktop-only settings (~20 lines)
})();

// Electron window setup — [REMOVED Ronda 1: desktop-only]
;(function () {
  if (!use_SA_system_emulation || is_SA_child_animation) return;
  // [REMOVED] Electron always-on-top, ipcRenderer, window setup (~90 lines)
})();
