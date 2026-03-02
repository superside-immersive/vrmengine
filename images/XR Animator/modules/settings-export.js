(function () {
  if (window.XR_Animator_SettingsExport)
    return

  window.XR_Animator_SettingsExport = {
    build: function (MMD_SA_options) {
function custom_motion() {
  const cm = (webkit_electron_mode) ? MMD_SA_options._XRA_pose_list[0].filter(m=>m.is_custom_motion).map(m=>m.path) : [];
  return cm.slice(Math.max(cm.length-10,0));
}

System._browser.camera.poseNet.hip_adjustment_set = null;

const config = {};

config.user_camera = {
  pixel_limit: {
    current: MMD_SA_options.user_camera.pixel_limit.current,
    disabled: MMD_SA_options.user_camera.pixel_limit.disabled,
  },

  portrait_mode: MMD_SA_options.user_camera.portrait_mode,
  fps: MMD_SA_options.user_camera.fps || null,

  display: {
    video: { hidden:MMD_SA_options.user_camera.display.video.hidden },
    wireframe: { hidden:MMD_SA_options.user_camera.display.wireframe.hidden },
  },

  ML_models: {
    pose: {
      model_quality: MMD_SA_options.user_camera.ML_models.pose.model_quality,
      z_depth_scale: MMD_SA_options.user_camera.ML_models.pose.z_depth_scale,
      use_legIK: MMD_SA_options.user_camera.ML_models.pose.use_legIK,
      use_armIK: !!MMD_SA_options.user_camera.ML_models.pose.use_armIK,
      auto_grounding: System._browser.camera.poseNet.auto_grounding,
      shoulder_tracking: System._browser.camera.poseNet.shoulder_tracking,
      body_bend_reduction_power: System._browser.camera.poseNet.body_bend_reduction_power,
      hip_camera: System._browser.camera.poseNet.hip_camera,

      hip_adjustment: System._browser.camera.poseNet.hip_adjustment,
      hip_adjustment_set_by_motion_name: (()=>{
        Object.keys(System._browser.camera.poseNet.hip_adjustment_set_by_motion_name).forEach(name=>{
          if (!MMD_SA_options._XRA_pose_list[0].find(p=>p.name==name))
            delete System._browser.camera.poseNet.hip_adjustment_set_by_motion_name[name];
        });
        return System._browser.camera.poseNet.hip_adjustment_set_by_motion_name;
      })(),

      upper_rotation_offset: MMD_SA_options.user_camera.ML_models.pose.upper_rotation_offset,
      arm_horizontal_offset_percent: System._browser.camera.poseNet.arm_horizontal_offset_percent,
      arm_vertical_offset_percent: System._browser.camera.poseNet.arm_vertical_offset_percent,
      limb_entry_duration_percent: System._browser.camera.poseNet.limb_entry_duration_percent,
      limb_return_duration_percent: System._browser.camera.poseNet.limb_return_duration_percent,
      hip_depth_scale_percent: System._browser.camera.poseNet.hip_depth_scale_percent,
      hip_y_position_offset_percent: System._browser.camera.poseNet.hip_y_position_offset_percent,
      hip_z_position_offset_percent: System._browser.camera.poseNet.hip_z_position_offset_percent,
      hide_avatar_on_tracking_loss: System._browser.camera.poseNet.hide_avatar_on_tracking_loss,

      body_collider: (()=>{
        const bc = {
          mode:  System._browser.camera.poseNet.body_collider.mode,
        };
        for (const part of ['head','chest','waist','hip'])
          bc[part] = { size_percent:System._browser.camera.poseNet.body_collider[part].size_percent };
        bc.head.reaction_type = System._browser.camera.poseNet.body_collider.head.reaction_type;
        return bc;
      })(),
    },
    hands: {
      stabilize_hand_percent: System._browser.camera.handpose.stabilize_hand_percent,
      stabilize_arm: System._browser.camera.handpose.stabilize_arm,
      stabilize_arm_time: System._browser.camera.handpose.stabilize_arm_time,
      use_hands_worker: System._browser.camera.handpose.use_hands_worker,
      depth_adjustment_percent: MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent,
      palm_shoulder_scale_percent: MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent,
      depth_scale_percent: MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent,
      constrain_tracking_region: System._browser.camera.handpose.constrain_tracking_region,
    },
    facemesh: {
      model_inference_device: System._browser.camera.facemesh.model_inference_device,
      eye_tracking: System._browser.camera.facemesh.eye_tracking,
      blink_sync: System._browser.camera.facemesh.blink_sync,
      blink_clarity: System._browser.camera.facemesh.blink_clarity,
      auto_blink: System._browser.camera.facemesh.auto_blink,
      auto_look_at_camera: System._browser.camera.facemesh.auto_look_at_camera,
      eye_bone_rotation_percent: System._browser.camera.facemesh.eye_bone_rotation_percent,
      mouth_tracking_sensitivity: System._browser.camera.facemesh.mouth_tracking_sensitivity,
      lean_tracking: System._browser.camera.facemesh.lean_tracking,
      emotion_weight_percent: System._browser.camera.facemesh.emotion_weight_percent,
      emotion_joy_fun_percent: System._browser.camera.facemesh.emotion_joy_fun_percent,
      emotion_angry_percent: System._browser.camera.facemesh.emotion_angry_percent,
      emotion_sorrow_percent: System._browser.camera.facemesh.emotion_sorrow_percent,
      emotion_surprised_percent: System._browser.camera.facemesh.emotion_surprised_percent,
      emotion_tongue_out_percent: System._browser.camera.facemesh.emotion_tongue_out_percent,
      emotion_others_percent: System._browser.camera.facemesh.emotion_others_percent,
      emotion_AI_detection_percent: System._browser.camera.facemesh.emotion_AI_detection_percent,
      emotion_AI_detection_interval: System._browser.camera.facemesh.emotion_AI_detection_interval,
      emotion_AI_detection_neutralness_percent: System._browser.camera.facemesh.emotion_AI_detection_neutralness_percent,
      emotion_vowel_percent: System._browser.camera.facemesh.emotion_vowel_percent,
    },
    object_detection: {
      framework: System._browser.camera.object_detection.framework,
      model: System._browser.camera.object_detection.model,
      detection_score_threshold_percent: System._browser.camera.object_detection.detection_score_threshold_percent,
      tracking_score_threshold_percent: System._browser.camera.object_detection.tracking_score_threshold_percent,
      detection_interval: System._browser.camera.object_detection.detection_interval,
      framework_classification: System._browser.camera.object_detection.framework_classification,
      model_classification: System._browser.camera.object_detection.model_classification,
    },
    mocap_data_smoothing: System._browser.camera.mocap_data_smoothing,
    tilt_adjustment: Object.assign({}, System._browser.camera.tilt_adjustment),
    debug_hidden: MMD_SA_options.user_camera.ML_models.debug_hidden,
  },

  streamer_mode: MMD_SA_options.user_camera.streamer_mode,
};

MMD_SA_options.gamepad[0].enabled = MMD_SA.Gamepad.enabled;
config.gamepad = MMD_SA_options.gamepad;

config.model_path_extra = MMD_SA_options.THREEX_options.model_path_extra;

const hotkeys = System._browser.hotkeys;
config.hotkeys = {
  is_global: hotkeys.is_global,

  configs: hotkeys._hotkey_config.map(c=>{
    const _config = { id:c.id };

    const config = hotkeys.config_by_id[c.id];
    const global_disabled = hotkeys.accelerators[config.accelerator[0]].config.global_disabled;
    if (!!global_disabled !== !!c.global_disabled)
      _config.global_disabled = global_disabled;
    if (config.accelerator[0] != c.accelerator[0])
      _config.accelerator = config.accelerator;

    return _config;
  }),
};
config.VRM_joint_stiffness_percent = MMD_SA.THREEX.VRM.joint_stiffness_percent;
config.camera_auto_zoom_percent = MMD_SA_options._camera_auto_zoom_percent;
config.audio_visualizer = MMD_SA_options.use_CircularSpectrum;

for (const p of ['camera_face_locking', 'camera_face_locking_percent', 'camera_face_locking_look_at_target_percent', 'camera_face_locking_movement_x_percent', 'camera_face_locking_movement_y_percent', 'camera_face_locking_movement_z_percent', 'camera_face_locking_z_min', 'camera_face_locking_vertical_constraint_percent', 'camera_face_locking_smooth_time']) {
  config[p] = MMD_SA_options[p];
}

config.image_input_handler_as_wallpaper = !!MMD_SA_options.image_input_handler_as_wallpaper;
const wallpaper_3d_config = {};
for (const p of MMD_SA.Wallpaper3D.options_to_save) {
  wallpaper_3d_config[p] = MMD_SA.Wallpaper3D.options_general[p];
}
config.wallpaper_3d = wallpaper_3d_config;

config.shoulder_adjust = MMD_SA.THREEX.shoulder_adjust;

config.selfie_mode = MMD_SA_options.Dungeon_options.item_base.hand_camera.selfie_mode;
config.hand_camera_fov = MMD_SA_options.Dungeon_options.item_base.hand_camera.fov;

const vc = System._browser.video_capture;
config.video_capture = {
  target_width: vc.target_width,
  target_height: vc.target_height,
  fps: vc.fps,
  target_mime_type: vc.target_mime_type,
};

config.UI_muted = MMD_SA_options.Dungeon.inventory.UI._muted;

config.language = (System._browser.translation.language && (System._browser.translation.language_full != System._browser.translation.language_default)) ? System._browser.translation.language : null;

config.pose = {
  order: MMD_SA_options._XRA_pose_list[0].map(m=>m.index_default),
  custom_motion: custom_motion(),
};

config.PPE = {
  UnrealBloom: {
    params: MMD_SA.THREEX.PPE.UnrealBloom.params,
    params_vrm: MMD_SA.THREEX.PPE.UnrealBloom.params_vrm,
  },
  N8AO: {
    effectController: MMD_SA.THREEX.PPE.N8AO.effectController,
    effectController_vrm: MMD_SA.THREEX.PPE.N8AO.effectController_vrm,
  },
  DOF: {
    effectController: MMD_SA.THREEX.PPE.DOF.effectController,
  },
};

config.VMC = {
  send: {
    port: MMD_SA.OSC.VMC.options.plugin.send.port,
    host: MMD_SA.OSC.VMC.options.plugin.send.host,
  },
  app_mode: MMD_SA.OSC.app_mode,

  VMC_receiver: {
    config: Object.assign({}, System._browser.camera.VMC_receiver.config),
    receiver_config: System._browser.camera.VMC_receiver.options.receiver.map(ro=>Object.assign({}, ro)),
  },
};

return config;
    }
  }
})();
