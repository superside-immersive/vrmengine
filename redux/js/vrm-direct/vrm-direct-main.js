/* ============================================================
 *  VRM Direct-Tracking – Entry Point / Public API
 *  js/vrm-direct/vrm-direct-main.js
 *
 *  Orchestrates loader, solver and animator.
 *  Exposes  window.VRMDirect  for settings panel & console use.
 * ============================================================ */
(function () {
  'use strict';

  /* ---- private state ---- */
  var _enabled      = false;
  var _initializing = false;

  /* ---- default config (overridable via VRMDirect.config) ---- */
  var CONFIG = {
    vrmUrl  : 'finalsnoo.vrm',   // relative to page root
    scale   : 11,
    offsetX : 0,                  // centered in scene
    offsetY : 0,
    offsetZ : 0
  };

  /* ─── MMD offset helpers ─── */
  var _mmdOrigX = null;   // saved original MMD root X position

  function _offsetMMDRight() {
    try {
      var models = window.MMD_SA && MMD_SA.MMD && MMD_SA.MMD.models;
      if (!models || !models.length) return;
      var mesh = models[0].mesh;
      if (!mesh) return;
      if (_mmdOrigX === null) _mmdOrigX = mesh.position.x;
      mesh.position.x = _mmdOrigX + 15;
    } catch (e) {
      console.warn('[VRMDirect] Could not offset MMD mesh:', e.message);
    }
  }

  function _restoreMMDPosition() {
    try {
      var models = window.MMD_SA && MMD_SA.MMD && MMD_SA.MMD.models;
      if (!models || !models.length) return;
      var mesh = models[0].mesh;
      if (!mesh) return;
      if (_mmdOrigX !== null) {
        mesh.position.x = _mmdOrigX;
        _mmdOrigX = null;
      }
    } catch (e) {
      console.warn('[VRMDirect] Could not restore MMD mesh:', e.message);
    }
  }

  /* ---- helpers ---- */

  /** Sync the checkbox in the settings iframe (if open). */
  function _syncCheckbox() {
    try {
      var frames = document.querySelectorAll('iframe');
      for (var i = 0; i < frames.length; i++) {
        var doc = frames[i].contentDocument || frames[i].contentWindow.document;
        var cb  = doc && doc.getElementById('VRMDirectEnabled');
        if (cb) cb.checked = _enabled;
      }
    } catch (e) { /* cross-origin or not loaded – ignore */ }

    /* Also sync the toolbar button glow */
    var tbBtn = document.getElementById('btn_vrm_direct');
    if (tbBtn) tbBtn.classList.toggle('xra-toolbar-btn--active', _enabled);
  }

  /** Persist current state so settings page can restore it. */
  function _saveState() {
    try {
      if (window.System && System.Gadget && System.Gadget.Settings) {
        System.Gadget.Settings.writeString('VRMDirectEnabled', _enabled ? '1' : '0');
      }
    } catch (e) { /* ignore */ }
  }

  /* ---- core enable / disable ---- */

  function enable() {
    if (_enabled || _initializing) return;

    /* Verificar que tenemos una escena (propia o de MMD) */
    var sceneReady = !!(window._VRMDirectScene ||
                       (window.MMD_SA && window.MMD_SA.THREEX && MMD_SA.THREEX.scene));
    if (!sceneReady) {
      console.warn('[VRMDirect] Scene not ready – retrying in 2 s');
      setTimeout(enable, 2000);
      return;
    }

    _initializing = true;
    console.log('[VRMDirect] Enabling …');

    var loadCfg = {
      vrmUrl  : CONFIG.vrmUrl,
      scale   : CONFIG.scale,
      offsetX : CONFIG.offsetX,
      offsetY : CONFIG.offsetY,
      offsetZ : CONFIG.offsetZ
    };

    VRMDirectLoader.load(loadCfg)
      .then(function (handle) {
        // Inyectar renderer y cámara al handle para que el animator pueda renderear
        handle.renderer = window._VRMDirectRenderer || null;
        handle.camera   = window._VRMDirectCamera   || null;
        VRMDirectAnimator.start(handle);
        _enabled      = true;
        _initializing = false;
        _saveState();
        _syncCheckbox();

        // Hide the MMD avatar — VRM takes over visually.
        // frames.skin (SA IK) keeps running underneath so tracking quality is unchanged.
        if (window.MMD_SA) MMD_SA.hide_3D_avatar = true;

        // Shift MMD model to the right so it doesn't overlap when shown for comparison
        _offsetMMDRight();

        console.log('[VRMDirect] Enabled ✓');
      })
      .catch(function (err) {
        _initializing = false;
        console.error('[VRMDirect] Enable failed:', err);
        /* Make sure we clean up anything partially loaded */
        try { VRMDirectAnimator.stop(); } catch (e) {}
        try { VRMDirectLoader.unload();  } catch (e) {}
      });
  }

  function disable() {
    if (!_enabled && !_initializing) return;
    console.log('[VRMDirect] Disabling …');

    // Restore MMD avatar visibility before tearing down
    if (window.MMD_SA) MMD_SA.hide_3D_avatar = false;

    // Restore MMD model to original centered position
    _restoreMMDPosition();

    try { VRMDirectAnimator.stop(); } catch (e) {}
    try { VRMDirectLoader.unload();  } catch (e) {}

    _enabled      = false;
    _initializing = false;
    _saveState();
    _syncCheckbox();
    console.log('[VRMDirect] Disabled ✓');
  }

  function toggle() {
    if (_enabled) disable(); else enable();
  }

  /* ---- public API ---- */
  window.VRMDirect = {
    enable  : enable,
    disable : disable,
    toggle  : toggle,

    get isEnabled()    { return _enabled; },
    get isLoading()    { return _initializing; },

    /** Mutable config – change before calling enable(). */
    config  : CONFIG,

    /* Convenience setters for console / settings panel */
    setLerp: function (v) {
      if (window.VRMDirectAnimator) VRMDirectAnimator.lerpFactor = v;
    },
    setPosition: function (x, y, z) {
      var h = window.VRMDirectLoader && VRMDirectLoader.getHandle();
      if (!h || !h.mesh) return;
      if (x !== undefined) h.mesh.position.x = x;
      if (y !== undefined) h.mesh.position.y = y;
      if (z !== undefined) h.mesh.position.z = z;
    },
    setScale: function (s) {
      var h = window.VRMDirectLoader && VRMDirectLoader.getHandle();
      if (!h || !h.mesh) return;
      h.mesh.scale.set(s, s, s);
    }
  };

  /* ---- auto-enable en cuanto la escena esté lista ---- */

  function _tryAutoEnable() {
    // Si MMD_SA existe pero la escena aún no está lista, esperar — NO caer a standalone
    if (window.MMD_SA) {
      if (window.MMD_SA.THREEX && MMD_SA.THREEX.scene) {
        setTimeout(enable, 500);
      } else {
        setTimeout(_tryAutoEnable, 300);   // MMD cargando — reintentar
      }
      return;
    }
    // Modo standalone (sin MMD en absoluto): crear renderer/camera/scene propios
    var T = window._VRMDirectTHREE;        // sólo usar THREE explícitamente asignado
    if (!T) { setTimeout(_tryAutoEnable, 200); return; }
    if (!window._VRMDirectScene) {
      var ctx = VRMDirectLoader.createOwnContext();
      window._VRMDirectScene    = ctx.scene;
      window._VRMDirectCamera   = ctx.camera;
      window._VRMDirectRenderer = ctx.renderer;
    }
    setTimeout(enable, 500);
  }

  if (window.addEventListener) {
    /* jThree_ready: MMD está listo — reusar su escena */
    window.addEventListener('jThree_ready', function () {
      window._VRMDirectScene    = null;  // _getScene() usará MMD_SA.THREEX.scene
      window._VRMDirectCamera   = null;
      window._VRMDirectRenderer = null;
      setTimeout(enable, 3000);
    });
  }

  /* Fallback standalone (sin jThree): arrancar por cuenta propia */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(_tryAutoEnable, 200); });
  } else {
    setTimeout(_tryAutoEnable, 200);
  }

  /* ── Keyboard shortcut: Q = toggle MMD avatar visibility for comparison ── */
  window.addEventListener('keydown', function (e) {
    // Ignore when typing in an input / textarea
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'q' || e.key === 'Q') {
      if (!window.MMD_SA) return;
      MMD_SA.hide_3D_avatar = !MMD_SA.hide_3D_avatar;
      console.log('[VRMDirect] MMD avatar ' + (MMD_SA.hide_3D_avatar ? 'HIDDEN (VRM only)' : 'VISIBLE (comparing)'));
    }
  });

})();
