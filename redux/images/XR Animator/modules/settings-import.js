(function () {
  if (window.XR_Animator_SettingsImport)
    return

  async function importConfig(MMD_SA_options, config) {
function XRA_dungeon() {
  return XRA_DungeonCompat();
}

function XRA_dungeonOptions() {
  return XRA_DungeonOptionsCompat();
}

function shoulder_adjust(p) {
  MMD_SA.THREEX.shoulder_adjust = config[p];

  if (!MMD_SA.THREEX.enabled) return;

  const rot_shoulder_axis = MMD_SA.THREEX._rot_shoulder_axis;
  if (!rot_shoulder_axis[1])
    rot_shoulder_axis[1] = {};
  rot_shoulder_axis[1][ 1] = new THREE.Quaternion().setFromEuler(MMD_SA.THREEX.e1.set(0, 0, ((!MMD_SA.THREEX.shoulder_adjust)?12.5*0.5:((MMD_SA.THREEX.shoulder_adjust=='Full')?12.5:0)) /180*Math.PI));
  rot_shoulder_axis[1][-1] = rot_shoulder_axis[1][ 1].clone().conjugate();

  if (!rot_shoulder_axis[0])
    rot_shoulder_axis[0] = {};
  rot_shoulder_axis[0][ 1] = rot_shoulder_axis[1][ 1]
  rot_shoulder_axis[0][-1] = rot_shoulder_axis[1][-1]
}

try {
  if (!config) {
    config = System.Gadget.Settings.readString('LABEL_XRA_settings');
    if (!config) return;

    config = JSON.parse(decodeURIComponent(config));
  }

  MMD_SA_options._XRA_settings_imported = config;

  for (const p in config) {
    switch (p) {
      case 'language':
        System._browser.translation.language = config[p];
        break;
    }
  }
  if (!loaded) return;

  if (!MMD_SA.THREEX.THREEX) return;

  for (const p in config) {
    switch (p) {
      case 'shoulder_adjust':
        shoulder_adjust(p);
        break;
    }
  }
  if (!MMD_SA.MMD_started) return;

  for (const p in config) {
    switch (p) {
      case 'user_camera':
        Object.assign(MMD_SA_options.user_camera.pixel_limit, config[p].pixel_limit);
        MMD_SA_options.user_camera.portrait_mode = config[p].portrait_mode;
        MMD_SA_options.user_camera.fps = config[p].fps;
        MMD_SA_options.user_camera.display.video.hidden = config[p].display.video.hidden;
        MMD_SA_options.user_camera.display.wireframe.hidden = config[p].display.wireframe.hidden;
        MMD_SA_options.user_camera.ML_models.debug_hidden = config[p].ML_models.debug_hidden;

        MMD_SA_options.user_camera.ML_models.pose.model_quality = config[p].ML_models.pose.model_quality || null;
        MMD_SA_options.user_camera.ML_models.pose.z_depth_scale = config[p].ML_models.pose.z_depth_scale || null;
        MMD_SA_options.user_camera.ML_models.pose.use_legIK = config[p].ML_models.pose.use_legIK;
        MMD_SA_options.user_camera.ML_models.pose.use_armIK = (config[p].ML_models.pose.use_armIK !== false) || null;
        MMD_SA_options.user_camera.ML_models.pose.upper_rotation_offset = config[p].ML_models.pose.upper_rotation_offset;
        System._browser.camera.poseNet.auto_grounding = config[p].ML_models.pose.auto_grounding;
        System._browser.camera.poseNet.shoulder_tracking = config[p].ML_models.pose.shoulder_tracking;
        System._browser.camera.poseNet.body_bend_reduction_power = config[p].ML_models.pose.body_bend_reduction_power;
        System._browser.camera.poseNet.hip_camera = config[p].ML_models.pose.hip_camera;
        System._browser.camera.poseNet.arm_horizontal_offset_percent = config[p].ML_models.pose.arm_horizontal_offset_percent;
        System._browser.camera.poseNet.arm_vertical_offset_percent = config[p].ML_models.pose.arm_vertical_offset_percent;
        System._browser.camera.poseNet.limb_entry_duration_percent = config[p].ML_models.pose.limb_entry_duration_percent;
        System._browser.camera.poseNet.limb_return_duration_percent = config[p].ML_models.pose.limb_return_duration_percent;
        System._browser.camera.poseNet.hide_avatar_on_tracking_loss = config[p].ML_models.pose.hide_avatar_on_tracking_loss;

        System._browser.camera.poseNet.hip_adjustment_set_by_motion_name = Object.assign({}, config[p].ML_models.pose.hip_adjustment_set_by_motion_name);
        System._browser.camera.poseNet.hip_adjustment = Object.assign({ _default_:{} }, config[p].ML_models.pose.hip_adjustment);
        System._browser.camera.poseNet.hip_adjustment_set = null;

        for (const pp of [
'hip_adjustment_weight_percent', 'hip_adjustment_head_weight_percent', 'hip_adjustment_adjust_y_axis_percent', 'hip_adjustment_smoothing_percent',
'hip_adjustment_scale_x_percent', 'hip_adjustment_scale_y_percent', 'hip_adjustment_scale_z_percent', 'hip_adjustment_head_pitch_rotation_percent', 'hip_adjustment_head_chest_rotation_offset_percent',
'hip_adjustment_rotation_percent'
        ]) {
          if (config[p].ML_models.pose[pp] != null)
            System._browser.camera.poseNet[pp] = config[p].ML_models.pose[pp];
        }

        System._browser.camera.poseNet.hip_depth_scale_percent = config[p].ML_models.pose.hip_depth_scale_percent;
        System._browser.camera.poseNet.hip_y_position_offset_percent = config[p].ML_models.pose.hip_y_position_offset_percent;
        System._browser.camera.poseNet.hip_z_position_offset_percent = config[p].ML_models.pose.hip_z_position_offset_percent;

        System._browser.camera.poseNet.body_collider.mode = config[p].ML_models.pose.body_collider?.mode;
        for (const part of ['head','chest','waist','hip']) System._browser.camera.poseNet.body_collider[part].size_percent = config[p].ML_models.pose.body_collider?.[part]?.size_percent;
        System._browser.camera.poseNet.body_collider.head.reaction_type = config[p].ML_models.pose.body_collider?.head?.reaction_type;

        if (config[p].ML_models.hands.depth_adjustment_percent != null)
          MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent = config[p].ML_models.hands.depth_adjustment_percent;
        if (config[p].ML_models.hands.palm_shoulder_scale_percent != null)
          MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent = config[p].ML_models.hands.palm_shoulder_scale_percent;
        if (config[p].ML_models.hands.depth_scale_percent != null)
          MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent = config[p].ML_models.hands.depth_scale_percent;
        System._browser.camera.handpose.stabilize_arm = config[p].ML_models.hands?.stabilize_arm;
        System._browser.camera.handpose.stabilize_arm_time = config[p].ML_models.hands?.stabilize_arm_time;
        System._browser.camera.handpose.stabilize_hand_percent = config[p].ML_models.hands?.stabilize_hand_percent;
        System._browser.camera.handpose.constrain_tracking_region = config[p].ML_models.hands?.constrain_tracking_region;
        System._browser.camera.handpose.use_hands_worker = (config[p].ML_models.hands?.use_hands_worker) ? ((config[p].ML_models.hands?.use_hands_worker == 2) ? 2 : 1) : 0;

        System._browser.camera.facemesh.model_inference_device = config[p].ML_models.facemesh.model_inference_device;
        System._browser.camera.facemesh.eye_tracking = config[p].ML_models.facemesh.eye_tracking;
        System._browser.camera.facemesh.blink_sync = config[p].ML_models.facemesh.blink_sync;
        System._browser.camera.facemesh.blink_clarity = config[p].ML_models.facemesh.blink_clarity;
        System._browser.camera.facemesh.auto_blink = config[p].ML_models.facemesh.auto_blink;
        System._browser.camera.facemesh.auto_look_at_camera = config[p].ML_models.facemesh.auto_look_at_camera;
        System._browser.camera.facemesh.eye_bone_rotation_percent = config[p].ML_models.facemesh.eye_bone_rotation_percent;
        System._browser.camera.facemesh.mouth_tracking_sensitivity = config[p].ML_models.facemesh.mouth_tracking_sensitivity;
        System._browser.camera.facemesh.lean_tracking = config[p].ML_models.facemesh.lean_tracking;
        System._browser.camera.facemesh.emotion_weight_percent = config[p].ML_models.facemesh.emotion_weight_percent;
        System._browser.camera.facemesh.emotion_joy_fun_percent = config[p].ML_models.facemesh.emotion_joy_fun_percent;
        System._browser.camera.facemesh.emotion_angry_percent = config[p].ML_models.facemesh.emotion_angry_percent;
        System._browser.camera.facemesh.emotion_sorrow_percent = config[p].ML_models.facemesh.emotion_sorrow_percent;
        System._browser.camera.facemesh.emotion_surprised_percent = config[p].ML_models.facemesh.emotion_surprised_percent;
        System._browser.camera.facemesh.emotion_tongue_out_percent = config[p].ML_models.facemesh.emotion_tongue_out_percent;
        System._browser.camera.facemesh.emotion_others_percent = config[p].ML_models.facemesh.emotion_others_percent;
        System._browser.camera.facemesh.emotion_AI_detection_percent = config[p].ML_models.facemesh.emotion_AI_detection_percent;
        System._browser.camera.facemesh.emotion_AI_detection_interval = config[p].ML_models.facemesh.emotion_AI_detection_interval;
        System._browser.camera.facemesh.emotion_AI_detection_neutralness_percent = config[p].ML_models.facemesh.emotion_AI_detection_neutralness_percent;
        System._browser.camera.facemesh.emotion_vowel_percent = config[p].ML_models.facemesh.emotion_vowel_percent;

        System._browser.camera.object_detection.framework = config[p].ML_models.object_detection?.framework;
        System._browser.camera.object_detection.model = config[p].ML_models.object_detection?.model;
        System._browser.camera.object_detection.detection_score_threshold_percent = config[p].ML_models.object_detection?.detection_score_threshold_percent;
        System._browser.camera.object_detection.tracking_score_threshold_percent = config[p].ML_models.object_detection?.tracking_score_threshold_percent;
        System._browser.camera.object_detection.detection_interval = config[p].ML_models.object_detection?.detection_interval;
        System._browser.camera.object_detection.framework_classification = config[p].ML_models.object_detection?.framework_classification;
        System._browser.camera.object_detection.model_classification = config[p].ML_models.object_detection?.model_classification;

        System._browser.camera.mocap_data_smoothing = config[p].ML_models.mocap_data_smoothing;

        MMD_SA_options.user_camera.streamer_mode = config[p].streamer_mode || { camera_preference:{} };
        Object.assign(System._browser.camera.tilt_adjustment, config[p].ML_models.tilt_adjustment||{});
        break;

      case 'gamepad':
        MMD_SA_options.gamepad = config[p];
        MMD_SA.Gamepad.enabled = (MMD_SA_options.interaction_animation_disabled) ? false : MMD_SA_options.gamepad[0].enabled;
        break;

      case 'model_path_extra':
        MMD_SA_options.THREEX_options.model_path_extra = config[p];
        break;

      case 'hotkeys':
        const hotkeys = System._browser.hotkeys;
        if (!XRA_dungeon().started) {
          hotkeys.is_global = config[p].is_global;
          break;
        }

        hotkeys.is_global = config[p].is_global;

        hotkeys.configs?.forEach(config=>{
          const config_default = hotkeys._hotkey_config.find(c=>c.id==config.id);
          if (config_default)
            hotkeys.add(Object.assign({}, config_default, config));
        });
        break;

      case 'VRM_joint_stiffness_percent':
        MMD_SA.THREEX.VRM.joint_stiffness_percent = config[p];
        break;

      case 'camera_auto_zoom_percent':
        MMD_SA_options._camera_auto_zoom_percent = config[p];
        break;

      case 'camera_face_locking':
        MMD_SA_options.camera_face_locking = config[p];
        break;
      case 'camera_face_locking_percent':
        MMD_SA_options.camera_face_locking_percent = config[p];
        break;
      case 'camera_face_locking_look_at_target_percent':
        MMD_SA_options.camera_face_locking_look_at_target_percent = config[p];
        break;
      case 'camera_face_locking_movement_x_percent':
        MMD_SA_options.camera_face_locking_movement_x_percent = config[p];
        break;
      case 'camera_face_locking_movement_y_percent':
        MMD_SA_options.camera_face_locking_movement_y_percent = config[p];
        break;
      case 'camera_face_locking_movement_z_percent':
        MMD_SA_options.camera_face_locking_movement_z_percent = config[p];
        break;
      case 'camera_face_locking_z_min':
        MMD_SA_options.camera_face_locking_z_min = config[p];
        break;
      case 'camera_face_locking_vertical_constraint_percent':
        MMD_SA_options.camera_face_locking_vertical_constraint_percent = config[p];
        break;
      case 'camera_face_locking_smooth_time':
        MMD_SA_options.camera_face_locking_smooth_time = config[p];
        break;

      case 'image_input_handler_as_wallpaper':
        MMD_SA_options.image_input_handler_as_wallpaper = (MMD_SA_options.interaction_animation_disabled) ? false : config[p];
        break;
      case 'wallpaper_3d':
        if (MMD_SA_options.interaction_animation_disabled)
          break;
        for (const _p of MMD_SA.Wallpaper3D.options_to_save) {
          MMD_SA.Wallpaper3D.options_general[_p] = config[p][_p];
        }
        break;

      case 'audio_visualizer':
        MMD_SA_options.use_CircularSpectrum = (MMD_SA_options.interaction_animation_disabled) ? false : config[p];
        break;

      case 'video_capture':
        Object.assign(System._browser.video_capture, config[p]);
        break;

      case 'selfie_mode':
        XRA_dungeonOptions().item_base.hand_camera.selfie_mode = (MMD_SA_options.interaction_animation_disabled) ? false : config[p];
        break;

      case 'hand_camera_fov':
        XRA_dungeonOptions().item_base.hand_camera.fov = config[p];
        if (config[p] != null)
          MMD_SA.THREEX.GUI.obj.visual_effects.folders[0].children[1].controllers[1].setValue(config[p]);
        break;

      case 'UI_muted':
        XRA_dungeon().inventory.UI.muted = config[p];
        break;

      case 'pose':
        if (config[p].custom_motion) {
          for (let i = 0; i < config[p].custom_motion.length; i++) {
            const path = config[p].custom_motion[i];
            const name = path.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "");
            if (MMD_SA_options.motion_index_by_name[name] == null) {
              const index = MMD_SA_options.motion.length;
              MMD_SA_options.motion_index_by_name[name] = index;
              MMD_SA_options.motion.push({ path:path });
              window.dispatchEvent(new CustomEvent("SA_on_external_motion_loaded", { detail:{ path:path, index:1000+(index-MMD_SA.motion_max_default), result:{ return_value:false } } }));
            }
          }
        }
        MMD_SA_options._XRA_pose_reset(config[p].order);
        break;

      case 'PPE':
        Object.keys(config[p]).forEach(effect=>{
          const ec = config[p][effect];
          switch (effect) {
            case 'UnrealBloom':
              const UnrealBloom = MMD_SA.THREEX.PPE.UnrealBloom;
              for (const param of ['params', 'params_vrm']) {
                if (ec[param]) {
                  UnrealBloom[param] = Object.assign({}, ec[param]);
                }
              }
              break;
            case 'N8AO':
              const N8AO = MMD_SA.THREEX.PPE.N8AO;
              for (const param of ['effectController', 'effectController_vrm']) {
                if (ec[param]) {
                  N8AO[param] = Object.assign({}, ec[param]);
                }
              }
              break;
            case 'DOF':
              const DOF = MMD_SA.THREEX.PPE.DOF;
              for (const param of ['effectController']) {
                if (ec[param]) {
                  DOF[param] = Object.assign({}, ec[param]);
                }
              }
              break;
          }
        });
        break;

      case 'VMC':
        MMD_SA.OSC.VMC.options.plugin.send.port = parseInt(config[p].send?.port) || MMD_SA.OSC.VMC.options_default.plugin.send.port;
        MMD_SA.OSC.VMC.options.plugin.send.host = config[p].send?.host || MMD_SA.OSC.VMC.options_default.plugin.send.host;
        if (MMD_SA.OSC.VMC.plugin) {
          MMD_SA.OSC.VMC.plugin.options.send.port = MMD_SA.OSC.VMC.options.plugin.send.port;
          MMD_SA.OSC.VMC.plugin.options.send.host = MMD_SA.OSC.VMC.options.plugin.send.host;
        }

        MMD_SA.OSC.app_mode = config[p].app_mode;

        if (config[p].VMC_receiver) {
          Object.assign(System._browser.camera.VMC_receiver.config, config[p].VMC_receiver.config);
          System._browser.camera.VMC_receiver.options.receiver.forEach((ro, i)=>{
            Object.assign(ro, config[p].VMC_receiver.receiver_config[i]);
          });

          if (XRA_dungeon().started) {
            const r_off = System._browser.camera.VMC_receiver.options.receiver.every(r=>!r.enabled);
            if (System._browser.camera.VMC_receiver.enabled) {
              if (r_off) {
                System._browser.camera.VMC_receiver.enabled = false;
              }
              else {
                System._browser.camera.VMC_receiver.receiver.forEach(r=>{ r.enabled=r.config.enabled; });
              }
            }
            else {
              if (!r_off) {
                System._browser.camera.VMC_receiver.enabled = true;
              }
            }
          }
        }
        break;
    }
  }
}
catch (err) {
  console.error(err);
  System.Gadget.Settings.writeString('LABEL_XRA_settings', '');
}
  }

  window.XR_Animator_SettingsImport = {
    importConfig: importConfig,
  }
})();
