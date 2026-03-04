(function () {
  if (window.XR_Animator_SettingsSave)
    return

  function save(MMD_SA_options) {
    const config = MMD_SA_options._XRA_settings_export();
    const json = JSON.stringify({ XR_Animator_settings:config }, null, '\t');
    System._browser.save_file('XRA_settings.json', json, 'application/json');
  }

  window.XR_Animator_SettingsSave = {
    save: save,
  }
})();
