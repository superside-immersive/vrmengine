(function () {
  if (window.XR_Animator_SettingsReset)
    return

  function resetAll(MMD_SA_options) {
    const XRA_settings_default = {
      "XR_Animator_settings": {
        "user_camera": {
          "pixel_limit": {
            "disabled": false,
            "current": null
          },
          "display": {
            "video": {},
            "wireframe": {}
          },
          "ML_models": {
            "pose": {},
            "hands": {},
            "facemesh": {},
            "object_detection": {},
            "tilt_adjustment": Object.assign({}, System._browser.camera.tilt_adjustment),
          },
          "motion_recorder": {},
          "streamer_mode": {
            "camera_preference": {}
          }
        },
        "gamepad": [{}],
        "model_path_extra": [],
        "hotkeys": {
          "is_global": true
        },
        "audio_visualizer": !MMD_SA_options.interaction_animation_disabled,
        "camera_face_locking": null,
        "shoulder_adjust": null,
        "selfie_mode": false,
        "video_capture": {},
        "UI_muted": false,
        "language": null,
        "pose": {},
        "VMC": {}
      }
    };

    System.Gadget.Settings.writeString('LABEL_XRA_settings', '');

    MMD_SA_options._XRA_pose_reset();
    MMD_SA_options._XRA_clear_custom_motion();

    if (MMD_SA.THREEX.enabled) {
      for (const PPE of ['UnrealBloom', 'N8AO', 'DOF']) {
        let param;
        switch (PPE) {
          case 'UnrealBloom':
            param = ['params', 'params_vrm'];
            break;
          case 'N8AO':
            param = ['effectController', 'effectController_vrm'];
            break;
          case 'DOF':
            param = ['effectController'];
            break;
        }

        param?.forEach(p=>{
          if (MMD_SA.THREEX.PPE.initialized) {
            MMD_SA.THREEX.PPE[PPE][p].reset?.();
            MMD_SA.THREEX.PPE[PPE].enabled = false;
          }
          else {
            MMD_SA.THREEX.PPE[PPE][p] = null;
          }
        });
      }
    }

    MMD_SA_options._XRA_settings_import(XRA_settings_default.XR_Animator_settings);
    DEBUG_show('✅Settings reset', 3);
  }

  window.XR_Animator_SettingsReset = {
    resetAll: resetAll,
  }
})();
