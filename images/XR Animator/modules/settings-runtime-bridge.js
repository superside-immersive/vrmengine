(function () {
  if (window.XR_Animator_SettingsRuntimeBridge)
    return

  function create(MMD_SA_options) {
    function exportSettingsToStorage() {
      const config = MMD_SA_options._XRA_settings_export()
      System.Gadget.Settings.writeString('LABEL_XRA_settings', JSON.stringify(config))
    }

    function tryImportSettingsFromJSON(json, result) {
      if (!json || !json.XR_Animator_settings)
        return false

      if (result)
        result.return_value = true

      MMD_SA_options._XRA_settings_import(json.XR_Animator_settings)
      DEBUG_show('✅Settings imported', 3)
      return true
    }

    function updateStreamerModeMotionId(mm) {
      if (!System._browser.camera.ML_enabled || !mm)
        return

      if (mm.filename == 'stand_simple') {
        MMD_SA_options.user_camera.streamer_mode.motion_id = (mm.para_SA.motion_tracking_upper_body_only) ? 1 : 0
      }
      else if (mm.para_SA.motion_tracking_enabled) {
        MMD_SA_options.user_camera.streamer_mode.motion_id = mm.filename
      }
    }

    function installSettingsLifecycleHandlers() {
      if (window.__XR_ANIMATOR_SETTINGS_LIFECYCLE_INSTALLED__)
        return

      if (window.XR_Animator_SettingsLifecycle && (typeof window.XR_Animator_SettingsLifecycle.install === 'function')) {
        window.XR_Animator_SettingsLifecycle.install({
          shouldWriteSettings: function () { return MMD_SA_options.Dungeon.started },
          onWriteSettings: exportSettingsToStorage,
          onImportFromJSON: function (e) {
            tryImportSettingsFromJSON(e.detail.json, e.detail.result)
          },
          onImportSettings: function () {
            MMD_SA_options._XRA_settings_import()
          },
          onAnimationUpdateImport: function () {
            System._browser.on_animation_update.add(function () {
              MMD_SA_options._XRA_settings_import()
            }, 0, 0)
          },
          onMotionChanged: function (e) {
            updateStreamerModeMotionId(e.detail.motion_new)
          },
        })
        return
      }

      window.__XR_ANIMATOR_SETTINGS_LIFECYCLE_INSTALLED__ = true

      window.addEventListener('SA_writeSettings', function () {
        if (!MMD_SA_options.Dungeon.started)
          return
        exportSettingsToStorage()
      })

      window.addEventListener('load', function () {
        window.addEventListener('SA_dragdrop_JSON', function (e) {
          tryImportSettingsFromJSON(e.detail.json, e.detail.result)
        })

        MMD_SA_options._XRA_settings_import()
      })

      window.addEventListener('jThree_ready', function () {
        MMD_SA_options._XRA_settings_import()
      })

      window.addEventListener('MMDStarted', function () {
        System._browser.on_animation_update.add(function () {
          MMD_SA_options._XRA_settings_import()
        }, 0, 0)

        window.addEventListener('SA_MMD_model0_onmotionchange', function (e) {
          updateStreamerModeMotionId(e.detail.motion_new)
        })
      })
    }

    return {
      installSettingsLifecycleHandlers: installSettingsLifecycleHandlers,
      exportSettingsToStorage: exportSettingsToStorage,
      tryImportSettingsFromJSON: tryImportSettingsFromJSON,
      updateStreamerModeMotionId: updateStreamerModeMotionId,
    }
  }

  window.XR_Animator_SettingsRuntimeBridge = {
    create: create,
  }
})();
