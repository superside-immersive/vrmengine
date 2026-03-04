(function () {
  if (window.XR_Animator_UIOptionsSettingsActions)
    return

  function buildEvents(MMD_SA_options) {
    return [
      {
        func: ()=>{
          if (window.SA && SA.loader && (typeof SA.loader.loadScriptSync === 'function')) {
            SA.loader.loadScriptSync('images/XR Animator/modules/settings-save.js');
          }

          if (window.XR_Animator_SettingsSave && (typeof window.XR_Animator_SettingsSave.save === 'function'))
            return window.XR_Animator_SettingsSave.save(MMD_SA_options)

          const config = MMD_SA_options._XRA_settings_export();
          const json = JSON.stringify({ XR_Animator_settings:config }, null, '\t');
          System._browser.save_file('XRA_settings.json', json, 'application/json');
        },
        ended: true,
      },
      {
        message: {
          get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.reset_all_settings'); },
          bubble_index: 3,
          branch_list: [
            { key:1, event_index:8 },
            { key:2, is_closing_event:true, event_index:99 },
          ],
        }
      },
      {
        func: ()=>{
          if (window.SA && SA.loader && (typeof SA.loader.loadScriptSync === 'function')) {
            SA.loader.loadScriptSync('images/XR Animator/modules/settings-reset.js');
          }

          if (window.XR_Animator_SettingsReset && (typeof window.XR_Animator_SettingsReset.resetAll === 'function'))
            return window.XR_Animator_SettingsReset.resetAll(MMD_SA_options)

          DEBUG_show('⚠️Settings reset module unavailable', 3);
        },

        ended: true,
      },
    ];
  }

  window.XR_Animator_UIOptionsSettingsActions = {
    buildEvents: buildEvents,
  }
})();
