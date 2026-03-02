(function () {
  if (window.XR_Animator_SettingsLifecycle)
    return

  function install(options) {
    const opts = options || {}
    if (window.__XR_ANIMATOR_SETTINGS_LIFECYCLE_INSTALLED__)
      return
    window.__XR_ANIMATOR_SETTINGS_LIFECYCLE_INSTALLED__ = true

    window.addEventListener('SA_writeSettings', function () {
      if (!opts.shouldWriteSettings || !opts.shouldWriteSettings())
        return
      if (opts.onWriteSettings)
        opts.onWriteSettings()
    })

    window.addEventListener('load', function () {
      window.addEventListener('SA_dragdrop_JSON', function (e) {
        if (!opts.onImportFromJSON)
          return
        opts.onImportFromJSON(e)
      })

      if (opts.onImportSettings)
        opts.onImportSettings()
    })

    window.addEventListener('jThree_ready', function () {
      if (opts.onImportSettings)
        opts.onImportSettings()
    })

    window.addEventListener('MMDStarted', function () {
      if (opts.onMMDStarted)
        opts.onMMDStarted()

      if (opts.onAnimationUpdateImport)
        opts.onAnimationUpdateImport()

      window.addEventListener('SA_MMD_model0_onmotionchange', function (e) {
        if (opts.onMotionChanged)
          opts.onMotionChanged(e)
      })
    })
  }

  window.XR_Animator_SettingsLifecycle = {
    install: install,
  }
})();
