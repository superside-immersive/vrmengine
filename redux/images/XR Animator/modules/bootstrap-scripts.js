(function () {
  if (window.XR_Animator_BootstrapScripts)
    return

  function load(options) {
    const opts = options || {}
    const MMD_SA_options = opts.MMD_SA_options || window.MMD_SA_options
    const toFileProtocol = opts.toFileProtocol || window.toFileProtocol
    const Settings = opts.Settings || window.Settings
    const documentRef = opts.documentRef || document

    if (window.__XR_ANIMATOR_BOOTSTRAP_SCRIPTS_LOADED__)
      return
    window.__XR_ANIMATOR_BOOTSTRAP_SCRIPTS_LOADED__ = true

    documentRef.write('<script language="JavaScript" src="' + toFileProtocol(Settings.f_path + '/animate_customized.js') + '"></scr'+'ipt>')

    if (MMD_SA_options.Dungeon_options) {
      // documentRef.write('<script language="JavaScript" src="js/dungeon.js"></scr'+'ipt>')
    }
    documentRef.write('<script language="JavaScript" src="js/mmd/speech-bubble.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/vfx.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/webxr.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/osc.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/gamepad.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/wallpaper3d.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/sprite.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/camera-shake.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="js/mmd/defaults.js"></scr'+'ipt>')
    documentRef.write('<script language="JavaScript" src="MMD.js/MMD_SA.js"></scr'+'ipt>')
  }

  window.XR_Animator_BootstrapScripts = {
    load: load,
  }
})();
