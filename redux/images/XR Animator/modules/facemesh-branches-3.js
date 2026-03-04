// facemesh-branches-3.js
(function () {
var F = window._FMO;
var {
  bg_branch, done_branch, panorama_branch, object3D_branch, about_branch,
  other_options_branch, record_motion_branch, mocap_options_branch, facemesh_options_branch, motion_control_branch,
  onDrop_change_panorama, onDrop_JSON_change_facemesh_calibration, animate_object3D, adjust_object3D, build_octree,
  add_grid, change_panorama, rotate_dome, remove_skybox, change_HDRI,
  remove_HDRI, ML_off, mirror_3D_off, reset_scene_explorer, reset_scene_UI,
  reset_scene, onDrop_add_object3D, HDRI_list, object3d_cache,
} = F;

F.branches.push(
// 29
      (()=>{
const hand_page_index = 6;
const tilt_page_index = hand_page_index+1;
const object_tracking_page_index = tilt_page_index+1;
return [
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options').replace(/\<smoothing\>/, System._browser.translation.get('Misc.' + ((System._browser.camera.mocap_data_smoothing == 1) ? 'Small' : ((System._browser.camera.mocap_data_smoothing == 2) ? 'Normal' : 'Min')))) + '\n8. ' + System._browser.translation.get('Misc.done'); }
 ,bubble_index: 3
 ,branch_list: [
  { key:1, event_index:1 },
  { key:2, event_index:hand_page_index },
  { key:3, branch_index:facemesh_options_branch },
  { key:4, event_index:object_tracking_page_index },
  { key:5, event_id: {
      func: function () {
if (++System._browser.camera.mocap_data_smoothing > 2)
  System._browser.camera.mocap_data_smoothing = 0;
      },
      goto_event: { branch_index:mocap_options_branch },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.mocap_data_smoothing.tooltip')
);
    }
  },
  { key:6, event_index:tilt_page_index },
  { key:7, branch_index:mocap_options_branch+4,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.clear_bounding_box.tooltip')
);
    }
  },
  { key:8, is_closing_event:true, branch_index:done_branch }
  ]
          }
        },

        ...(()=>{
          let is_full_body_mocap;
          function change_hip_config(e) {
//DEBUG_show((e.detail.motion_old == e.detail.motion_new)+'/'+Date.now())
if (e.detail.motion_old == e.detail.motion_new) {
  if (e.detail.motion_new.filename != 'stand_simple') return;
  if (is_full_body_mocap == !e.detail.motion_new.para_SA.motion_tracking_upper_body_only) return;
}

is_full_body_mocap = (e.detail.motion_new.filename == 'stand_simple') ? !e.detail.motion_new.para_SA.motion_tracking_upper_body_only : null;

System._browser.camera.poseNet.hip_adjustment_set = MMD_SA.MMD.motionManager.filename;
hip_adjustment_set = System._browser.camera.poseNet.hip_adjustment_set;

MMD_SA_options.Dungeon.run_event(null,mocap_options_branch,hip_adjustment_index);
          }

          let page2_index = 2;

          const hip_adjustment_index = 3;
          const body_collider_index = 4;
          const z_depth_scale_event_index = 5;

          let hip_adjustment_option_active = 'Configuration set';
          const hip_adjustment_options = ['Configuration set', 'General weighting', 'Head motion weight', 'Head pitch rotation', 'Chest rotation offset', 'Y-axis adjustment', 'Scale X', 'Scale Y', 'Scale Z', 'Rotation', 'Smoothing'];

          let hip_adjustment_set = '_default_';
          const hip_adjustment_config = ['_default_', '_default_full_body_', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

          let body_collider_option_active = 'Chest size';
          const body_collider_options = ['Head size', 'Chest size', 'Waist size', 'Hip size'];

          let option_plus_minus = 'arm_horizontal_offset';
          const body_tracking_options = ['arm_horizontal_offset', 'arm_vertical_offset', 'hip_depth_scale', 'hip_z_position_offset', 'hip_y_position_offset', 'limb_entry_duration', 'limb_return_duration', 'upper_rotation_offset'];

          return [
            {
          message: {
  get content() {
    return [
'1. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.AI_model_quality') + ': ' + System._browser.translation.get('Misc.' + (MMD_SA_options.user_camera.ML_models.pose.model_quality || 'Normal')),
'2. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.AI_model_quality.z_depth_scale') + ': ' + ((MMD_SA_options.user_camera.ML_models.pose.model_quality == 'Best') ? System._browser.translation.get('Misc.' + ((MMD_SA_options.user_camera.ML_models.pose.z_depth_scale) ? ((MMD_SA_options.user_camera.ML_models.pose.z_depth_scale<3)?'Max':'Min'):'Medium')) : 'N/A'),
'3. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_horizontal_offset') + ': ' + (System._browser.camera.poseNet.arm_horizontal_offset_percent||0) + '%' + ((option_plus_minus == 'arm_horizontal_offset') ? '➕➖' : '  　　'),
'4. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_vertical_offset') + ': ' + (System._browser.camera.poseNet.arm_vertical_offset_percent||0) + '%' + ((option_plus_minus == 'arm_vertical_offset') ? '➕➖' : '  　　'),
'5. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_depth_scale') + ': ' + System._browser.camera.poseNet.hip_depth_scale_percent + '%' + ((option_plus_minus == 'hip_depth_scale') ? '➕➖' : ''),
'6. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_z_position_offset') + ': ' + System._browser.camera.poseNet.hip_z_position_offset_percent + '%' + ((option_plus_minus == 'hip_z_position_offset') ? '➕➖' : ''),
'7. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_y_position_offset') + ': ' + System._browser.camera.poseNet.hip_y_position_offset_percent + '%' + ((option_plus_minus == 'hip_y_position_offset') ? '➕➖' : ''),
'8. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment') + ' ' + ((page2_index!=hip_adjustment_index) ? '▶️' : '📖'),
'9. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider') + ' ' + ((page2_index!=body_collider_index) ? '▶️' : '📖'),

'X. ' + System._browser.translation.get('Misc.done'),
    ].join('\n');
  },
  bubble_index: 3,
  para: { row_max:11 },
  branch_list: [
  { key:'any', func:(e)=>{
let step;

if ((page2_index == body_collider_index) && /Arrow(Up|Down)/.test(e.code)) {
  step = body_collider_index;

  let index = body_collider_options.findIndex(v=>v==body_collider_option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = body_collider_options.length-1;
  }
  else if (index > body_collider_options.length-1) {
    index = 0;
  }
  body_collider_option_active = body_collider_options[index];
}
else if ((page2_index == body_collider_index) && /Arrow(Left|Right)/.test(e.code)) {
  step = body_collider_index;

  const bc = System._browser.camera.poseNet.body_collider;

  const v = (e.code == 'ArrowRight') ? 5 : -5;
  switch (body_collider_option_active) {
    case 'Head size':
bc.head.size_percent = THREE.Math.clamp(bc.head.size_percent + v, 45,300);
if (bc.head.size_percent < 50)
  bc.head.size_percent = (v < 0) ? 0 : 50;
      break;
    case 'Chest size':
bc.chest.size_percent = THREE.Math.clamp(bc.chest.size_percent + v, 45,300);
if (bc.chest.size_percent < 50)
  bc.chest.size_percent = (v < 0) ? 0 : 50;
      break;
    case 'Waist size':
bc.waist.size_percent = THREE.Math.clamp(bc.waist.size_percent + v, 45,300);
if (bc.waist.size_percent < 50)
  bc.waist.size_percent = (v < 0) ? 0 : 50;
      break;
    case 'Hip size':
bc.hip.size_percent = THREE.Math.clamp(bc.hip.size_percent + v, 45,300);
if (bc.hip.size_percent < 50)
  bc.hip.size_percent = (v < 0) ? 0 : 50;
      break;
    default:
      return false;
  }
}
else if ((page2_index == hip_adjustment_index) && /Arrow(Up|Down)/.test(e.code)) {
  step = hip_adjustment_index;

  let index = hip_adjustment_options.findIndex(v=>v==hip_adjustment_option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = hip_adjustment_options.length-1;
  }
  else if (index > hip_adjustment_options.length-1) {
    index = 0;
  }
  hip_adjustment_option_active = hip_adjustment_options[index];
}
else if ((page2_index == hip_adjustment_index) && /Arrow(Left|Right)/.test(e.code)) {
  step = hip_adjustment_index;

  System._browser.camera.poseNet.hip_adjustment_set = hip_adjustment_set;

  const v = (e.code == 'ArrowRight') ? 1 : -1;
  switch (hip_adjustment_option_active) {
    case 'Configuration set':
if ((MMD_SA.MMD.motionManager.filename == 'stand_simple') && !MMD_SA.MMD.motionManager.para_SA.motion_tracking_upper_body_only) return false;

let _index = hip_adjustment_config.findIndex(c=>c==hip_adjustment_set) + v;
if (_index < 0) {
  _index = hip_adjustment_config.length-1;
}
else if (_index >= hip_adjustment_config.length) {
  _index = 0;
}
hip_adjustment_set = hip_adjustment_config[_index];

if (!System._browser.camera.poseNet.hip_adjustment[hip_adjustment_set])
  System._browser.camera.poseNet.hip_adjustment[hip_adjustment_set] = {};

System._browser.camera.poseNet.hip_adjustment_set = hip_adjustment_set;
      break;
    case 'General weighting':
System._browser.camera.poseNet.hip_adjustment_weight_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_weight_percent + v, 0,200);
      break;
    case 'Head motion weight':
System._browser.camera.poseNet.hip_adjustment_head_weight_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_head_weight_percent + v, 0,100);
      break;
    case 'Head pitch rotation':
System._browser.camera.poseNet.hip_adjustment_head_pitch_rotation_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_head_pitch_rotation_percent + v*5, -200,200);
      break;
    case 'Chest rotation offset':
System._browser.camera.poseNet.hip_adjustment_head_chest_rotation_offset_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_head_chest_rotation_offset_percent + v, -75,75);
      break;
    case 'Y-axis adjustment':
System._browser.camera.poseNet.hip_adjustment_adjust_y_axis_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_adjust_y_axis_percent + v, 0,100);
      break;
    case 'Scale X':
System._browser.camera.poseNet.hip_adjustment_scale_x_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_scale_x_percent + v*5, -500,500);
      break;
    case 'Scale Y':
System._browser.camera.poseNet.hip_adjustment_scale_y_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_scale_y_percent + v*5, -500,500);
      break;
    case 'Scale Z':
System._browser.camera.poseNet.hip_adjustment_scale_z_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_scale_z_percent + v*5, -500,500);
      break;
    case 'Rotation':
if (hip_adjustment_set == '_default_full_body_') {
  System._browser.camera.poseNet.hip_adjustment_full_body_weighting_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_full_body_weighting_percent + v, 0,100);
}
else {
  System._browser.camera.poseNet.hip_adjustment_rotation_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_rotation_percent + v*5, -500,500);
}
      break;
    case 'Smoothing':
System._browser.camera.poseNet.hip_adjustment_smoothing_percent = THREE.Math.clamp(System._browser.camera.poseNet.hip_adjustment_smoothing_percent + v, 0,100);
      break;
    default:
      return false;
 }
}
else if (/Arrow(Up|Down)/.test(e.code)) {
  step = 1;

  let index = body_tracking_options.findIndex(v=>v==option_plus_minus);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = body_tracking_options.length-1;
  }
  else if (index > body_tracking_options.length-1) {
    index = 0;
  }
  option_plus_minus = body_tracking_options[index];
}
else if ((e.key == '+') || (e.key == '-')) {
  step = 1;

  let inc = (e.key == '+') ? 1 : -1;
  if (option_plus_minus == 'arm_horizontal_offset') {
    System._browser.camera.poseNet.arm_horizontal_offset_percent = THREE.Math.clamp((System._browser.camera.poseNet.arm_horizontal_offset_percent||0) + inc*2, -200,200);
  }
  else if (option_plus_minus == 'arm_vertical_offset') {
    System._browser.camera.poseNet.arm_vertical_offset_percent = THREE.Math.clamp((System._browser.camera.poseNet.arm_vertical_offset_percent||0) + inc*2, -100,100);
  }
  else if (option_plus_minus == 'limb_entry_duration') {
    System._browser.camera.poseNet.limb_entry_duration_percent = THREE.Math.clamp((System._browser.camera.poseNet.limb_entry_duration_percent||0) + inc*5, 25,400);
  }
  else if (option_plus_minus == 'limb_return_duration') {
    System._browser.camera.poseNet.limb_return_duration_percent = THREE.Math.clamp((System._browser.camera.poseNet.limb_return_duration_percent||0) + inc*5, 25,400);
  }
  else if (option_plus_minus == 'hip_depth_scale') {
    System._browser.camera.poseNet.hip_depth_scale_percent = THREE.Math.clamp((System._browser.camera.poseNet.hip_depth_scale_percent||0) + inc*2, 10,300);
  }
  else if (option_plus_minus == 'hip_z_position_offset') {
    System._browser.camera.poseNet.hip_z_position_offset_percent = THREE.Math.clamp((System._browser.camera.poseNet.hip_z_position_offset_percent||0) + inc, -100,100);
  }
  else if (option_plus_minus == 'hip_y_position_offset') {
    System._browser.camera.poseNet.hip_y_position_offset_percent = THREE.Math.clamp((System._browser.camera.poseNet.hip_y_position_offset_percent||0) + inc, -100,100);
  }
  else if (option_plus_minus == 'upper_rotation_offset') {
    const _pose = (MMD_SA.MMD.motionManager.para_SA.motion_tracking?.ML_models?.pose || MMD_SA_options.user_camera.ML_models.pose);
    _pose.upper_rotation_offset = ((_pose.upper_rotation_offset||0) + inc) % 360;
  }
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null, mocap_options_branch, step);

return true;
  } },

  { key:1, event_id: {
      func: function () {
MMD_SA_options.user_camera.ML_models.pose.model_quality = (!MMD_SA_options.user_camera.ML_models.pose.model_quality) ? 'Best' : undefined;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.AI_model_quality.tooltip')
);
    }
  },
  { key:2, event_index:z_depth_scale_event_index,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.AI_model_quality.z_depth_scale.tooltip')
);
    }
  },
  { key:3, event_id: {
      func: function () {
option_plus_minus = 'arm_horizontal_offset';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_horizontal_offset') + ((option_plus_minus == 'arm_horizontal_offset') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_horizontal_offset.tooltip')
);
    }
  },
  { key:4, event_id: {
      func: function () {
option_plus_minus = 'arm_vertical_offset';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_vertical_offset') + ((option_plus_minus == 'arm_vertical_offset') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_vertical_offset.tooltip')
);
    }
  },
  { key:5, event_id: {
      func: function () {
option_plus_minus = 'hip_depth_scale';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_depth_scale') + ((option_plus_minus == 'hip_depth_scale') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_depth_scale.tooltip')
);
    }
  },
  { key:6, event_id: {
      func: function () {
option_plus_minus = 'hip_z_position_offset';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_z_position_offset') + ((option_plus_minus == 'hip_z_position_offset') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_z_position_offset.tooltip')
);
    }
  },
  { key:7, event_id: {
      func: function () {
option_plus_minus = 'hip_y_position_offset';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_y_position_offset') + ((option_plus_minus == 'hip_y_position_offset') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_y_position_offset.tooltip')
);
    }
  },
  { key:8, event_id: {
      func: function () {
page2_index = (page2_index != hip_adjustment_index) ? hip_adjustment_index : 2;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    }
  },
  { key:9, event_id: {
      func: function () {
page2_index = (page2_index != body_collider_index) ? body_collider_index : 2;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    }
  },
  { key:'X', is_closing_event:true, func:()=>{
window.removeEventListener('SA_MMD_model0_onmotionchange', change_hip_config);
    },
    branch_index:done_branch,
  }
  ]
          },
          goto_event: { branch_index:mocap_options_branch, get step() {
if (page2_index == hip_adjustment_index) {
  System._browser.camera.poseNet.hip_adjustment_set = MMD_SA.MMD.motionManager.filename;
  hip_adjustment_set = System._browser.camera.poseNet.hip_adjustment_set;
}

return page2_index;
            }
          }
            },
// 2
            {
          message: {
  get content() {
    let body_bend_reduction_power;
    switch (System._browser.camera.poseNet.body_bend_reduction_power) {
      case 0.25:
        body_bend_reduction_power = 'Small';
        break;
      case 0.5:
        body_bend_reduction_power = 'Medium';
        break;
      case 0.75:
        body_bend_reduction_power = 'Large';
        break;
      case 1:
        body_bend_reduction_power = 'Full';
        break;
    }

    return [
'A. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.shoulder_tracking') + ': ' + ((System._browser.camera.poseNet.shoulder_tracking) ? 'ON' : 'OFF'),
'B. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_bend_reduction') + ': ' + ((body_bend_reduction_power) ? System._browser.translation.get('Misc.' + body_bend_reduction_power) : 'OFF'),
'C. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.leg_IK') + ': ' + ((MMD_SA_options.user_camera.ML_models.pose.use_legIK)?'ON':'OFF'),
'D. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_IK') + ': ' + ((MMD_SA_options.user_camera.ML_models.pose.use_armIK)?'ON':'OFF'),
'E. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.auto_grounding') + ' (' + (System._browser.hotkeys.config_by_id['mocap_auto_grounding']?.accelerator[0]||'') + '): ' + ((!System._browser.camera.poseNet.auto_grounding)?'OFF':'ON'),
'F. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_camera') + ' (' + (System._browser.hotkeys.config_by_id['hip_camera']?.accelerator[0]||'') + '): ' + ((System._browser.camera.poseNet.hip_camera) ? 'ON' : 'OFF'),
'G. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.limb_entry_duration') + ': ' + System._browser.camera.poseNet.limb_entry_duration_percent + '%' + ((option_plus_minus == 'limb_entry_duration') ? '➕➖' : '  　　'),
'H. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.limb_return_duration') + ': ' + System._browser.camera.poseNet.limb_return_duration_percent + '%' + ((option_plus_minus == 'limb_return_duration') ? '➕➖' : '  　　'),
'I. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.upper_rotation_offset') + ': ' + ((MMD_SA.MMD.motionManager.para_SA.motion_tracking?.ML_models?.pose || MMD_SA_options.user_camera.ML_models.pose).upper_rotation_offset||0) + '°' + ((option_plus_minus == 'upper_rotation_offset') ? '➕➖' : ''),
'J. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hide_avatar_on_tracking_loss') + ': ' + ((System._browser.camera.poseNet.hide_avatar_on_tracking_loss == 1) ? System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hide_avatar_on_tracking_loss.non_VMC') : ((System._browser.camera.poseNet.hide_avatar_on_tracking_loss)?'ON':'OFF')),
    ].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:11 },
  branch_list: [
  { key:'A', event_id: {
      func: function () {
System._browser.camera.poseNet.shoulder_tracking = (System._browser.camera.poseNet.shoulder_tracking) ? 0 : null;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.shoulder_tracking.tooltip')
);
    }
  },
  { key:'B', event_id: {
      func: function () {
let v = System._browser.camera.poseNet.body_bend_reduction_power || 0;
v += 0.25;
if (v > 1)
  v = 0;
System._browser.camera.poseNet.body_bend_reduction_power = v;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_bend_reduction.tooltip')
);
    }
  },
  { key:'C', branch_index:mocap_options_branch+1,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.leg_IK.tooltip')
);
    }
  },
  { key:'D', event_id: {
      func: function () {
// Do not set .use_armIK to false as it will completely disable it instead of auto select
MMD_SA_options.user_camera.ML_models.pose.use_armIK = (!MMD_SA_options.user_camera.ML_models.pose.use_armIK) || null;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.arm_IK.tooltip')
);
    }
  },
  { key:'E', branch_index:mocap_options_branch+3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.auto_grounding.tooltip').replace(/\<hotkey\>/, System._browser.hotkeys.config_by_id['mocap_auto_grounding']?.accelerator[0]||'N/A')
);
    }
  },
  { key:'F', event_id: {
      func: function () {
System._browser.camera.poseNet.hip_camera = !System._browser.camera.poseNet.hip_camera;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_camera.tooltip').replace(/\<hotkey\>/, System._browser.hotkeys.config_by_id['hip_camera']?.accelerator[0]||'N/A')
);
    }
  },
  { key:'G', event_id: {
      func: function () {
option_plus_minus = 'limb_entry_duration';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.limb_entry_duration') + ((option_plus_minus == 'limb_entry_duration') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.limb_entry_duration.tooltip')
);
    }
  },
  { key:'H', event_id: {
      func: function () {
option_plus_minus = 'limb_return_duration';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.limb_return_duration') + ((option_plus_minus == 'limb_return_duration') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.limb_return_duration.tooltip')
);
    }
  },
  { key:'I', event_id: {
      func: function () {
option_plus_minus = 'upper_rotation_offset';
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.upper_rotation_offset') + ((option_plus_minus == 'upper_rotation_offset') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.press_to_change_value') + ')' : '') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.upper_rotation_offset.tooltip')
);
    }
  },
  { key:'J', event_id: {
      func: function () {
if (++System._browser.camera.poseNet.hide_avatar_on_tracking_loss > 2)
  System._browser.camera.poseNet.hide_avatar_on_tracking_loss = 0;
      },
      goto_event: { branch_index:mocap_options_branch, step:1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hide_avatar_on_tracking_loss.tooltip')
);
    }
  },
  ]
          }
            },
// 3
            {
              func: function () {
window.removeEventListener('SA_MMD_model0_onmotionchange', change_hip_config);
window.addEventListener('SA_MMD_model0_onmotionchange', change_hip_config);
              },
              message: {
  get content() {
    const scale = System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale');

    System._browser.camera.poseNet.hip_adjustment_set = MMD_SA.MMD.motionManager.filename;
    const is_active_set = (System._browser.camera.poseNet.hip_adjustment_set == hip_adjustment_set);

    System._browser.camera.poseNet.hip_adjustment_set = hip_adjustment_set;

    return [
System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.' + ((hip_adjustment_set == '_default_full_body_') ? 'full_body_mocap' : 'upper_body_mocap')),
//'・' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value'),
'A. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.configuration_set') + ': ' + ((is_active_set) ? '✔️' : '') + ((hip_adjustment_set.indexOf('_default_') != -1) ? System._browser.translation.get('Misc.default') + ((hip_adjustment_set == '_default_') ? '🙋' : '💃') : hip_adjustment_set) + ((hip_adjustment_option_active=='Configuration set')?'⬅️➡️':''),
'B. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.general_weighting') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'OFF' : System._browser.camera.poseNet.hip_adjustment_weight_percent + '%') + ((hip_adjustment_option_active=='General weighting')?'⬅️➡️':''),
'C.    ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_head_weight_percent + '%') + ((hip_adjustment_option_active=='Head motion weight')?'⬅️➡️':'  　　'),
'D.       ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.pitch_rotation') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_head_pitch_rotation_percent + '%') + ((hip_adjustment_option_active=='Head pitch rotation')?'⬅️➡️':''),
'E.       ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.chest_rotation_offset') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_head_chest_rotation_offset_percent + '%') + ((hip_adjustment_option_active=='Chest rotation offset')?'⬅️➡️':'  　　'),
'F.    ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.y_axis_adjustment') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_adjust_y_axis_percent + '%') + ((hip_adjustment_option_active=='Y-axis adjustment')?'⬅️➡️':''),
'G.    ┣ ' + scale + ' X: ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_scale_x_percent + '%') + ((hip_adjustment_option_active=='Scale X')?'⬅️➡️':''),
'H.    ┣ ' + scale + ' Y: ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_scale_y_percent + '%') + ((hip_adjustment_option_active=='Scale Y')?'⬅️➡️':''),
'I.     ┣ ' + scale + ' Z: ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_scale_z_percent + '%') + ((hip_adjustment_option_active=='Scale Z')?'⬅️➡️':''),
((hip_adjustment_set == '_default_full_body_') ? 
'R.    ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.full_body_weighting') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_full_body_weighting_percent + '%') + ((hip_adjustment_option_active=='Rotation')?'⬅️➡️':'')
:
'R.    ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.rotation') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_rotation_percent + '%') + ((hip_adjustment_option_active=='Rotation')?'⬅️➡️':'')
),
'S.    ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.smoothing') + ': ' + ((System._browser.camera.poseNet.hip_adjustment_weight_percent == 0) ? 'N/A' : System._browser.camera.poseNet.hip_adjustment_smoothing_percent + '%') + ((hip_adjustment_option_active=='Smoothing')?'⬅️➡️':''),
    ].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:12, font_scale:0.9 },
  branch_list: [
  { key:'A', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Configuration set';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.configuration_set') + ((hip_adjustment_option_active=='Configuration set')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.configuration_set.tooltip')
);
    }
  },
  { key:'B', event_id: {
      func:()=>{
hip_adjustment_option_active = 'General weighting';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.general_weighting') + ((hip_adjustment_option_active=='General weighting')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.general_weighting.tooltip')
);
    }
  },
  { key:'C', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Head motion weight';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight') + ((hip_adjustment_option_active=='Head motion weight')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.tooltip')
);
    }
  },
  { key:'D', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Head pitch rotation';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.pitch_rotation') + ((hip_adjustment_option_active=='Head pitch rotation')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.pitch_rotation.tooltip')
);
    }
  },
  { key:'E', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Chest rotation offset';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.chest_rotation_offset') + ((hip_adjustment_option_active=='Chest rotation offset')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.head_motion_weight.chest_rotation_offset.tooltip')
);
    }
  },
  { key:'F', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Y-axis adjustment';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.y_axis_adjustment') + ((hip_adjustment_option_active=='Y-axis adjustment')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.y_axis_adjustment.tooltip')
);
    }
  },
  { key:'G', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Scale X';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale') + ' X' + ((hip_adjustment_option_active=='Scale X')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale.x.tooltip')
);
    }
  },
  { key:'H', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Scale Y';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale') + ' Y' + ((hip_adjustment_option_active=='Scale Y')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale.y.tooltip')
);
    }
  },
  { key:'I', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Scale Z';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale') + ' Z' + ((hip_adjustment_option_active=='Scale Z')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.scale.z.tooltip')
);
    }
  },
  { key:'R', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Rotation';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
const p_name = (hip_adjustment_set == '_default_full_body_') ? 'full_body_weighting' : 'rotation';
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.'+p_name) + ((hip_adjustment_option_active=='Rotation')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.'+p_name+'.tooltip')
);
    }
  },
  { key:'S', event_id: {
      func:()=>{
hip_adjustment_option_active = 'Smoothing';
      },
      goto_event: { branch_index:mocap_options_branch, step:hip_adjustment_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.smoothing') + ((hip_adjustment_option_active=='Smoothing')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.hip_adjustment.smoothing.tooltip')
);
    }
  },
  ]
              }
            },
// 4
            {
              message: {
  get content() {
    const size = System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size');
    const bc = System._browser.camera.poseNet.body_collider;

    return [
System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider'),
'A. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.mode') + ': ' + ((bc.mode == 1) ? System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.upper_body_mocap') : ((bc.mode == 0) ? 'OFF' : System._browser.translation.get('Misc.full'))),
'B. ┗ ' + ' ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.head') + ': ' + ((bc.mode == 0) ? 'N/A' : bc.head.size_percent + '%') + ((body_collider_option_active=='Head size')?'⬅️➡️':''),
'C.     ┗ ' + ' ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.reaction_type') + ': ' + ((bc.mode == 0 || !bc.head.enabled) ? 'N/A' : System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.reaction_type.' + bc.head.reaction_type)),
'D. ┗ ' + ' ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.chest') + ': ' + ((bc.mode == 0) ? 'N/A' : bc.chest.size_percent + '%') + ((body_collider_option_active=='Chest size')?'⬅️➡️':''),
'E. ┗ ' + ' ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.waist') + ': ' + ((bc.mode == 0) ? 'N/A' : bc.waist.size_percent + '%') + ((body_collider_option_active=='Waist size')?'⬅️➡️':''),
'F. ┗ ' + ' ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.hip') + ': ' + ((bc.mode == 0) ? 'N/A' : bc.hip.size_percent + '%') + ((body_collider_option_active=='Hip size')?'⬅️➡️':''),
    ].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:11 },
  branch_list: [
  { key:'A', event_id: {
      func:()=>{
const bc = System._browser.camera.poseNet.body_collider;
if (++bc.mode > 2)
  bc.mode = 0;
      },
      goto_event: { branch_index:mocap_options_branch, step:body_collider_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.tooltip')
);
    }
  },
  { key:'B', event_id: {
      func:()=>{
body_collider_option_active = 'Head size';
      },
      goto_event: { branch_index:mocap_options_branch, step:body_collider_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.head') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.space') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size') + ((body_collider_option_active=='Head size')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.tooltip')
);
    }
  },
  { key:'C', event_id: {
      func:()=>{
const bc = System._browser.camera.poseNet.body_collider;
bc.head.reaction_type = (bc.head.reaction_type == 'z_push') ? 'sphere' : 'z_push';
      },
      goto_event: { branch_index:mocap_options_branch, step:body_collider_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.reaction_type') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.reaction_type.tooltip')
);
    }
  },
  { key:'D', event_id: {
      func:()=>{
body_collider_option_active = 'Chest size';
      },
      goto_event: { branch_index:mocap_options_branch, step:body_collider_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.chest') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.space') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size') + ((body_collider_option_active=='Chest size')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.tooltip')
);
    }
  },
  { key:'E', event_id: {
      func:()=>{
body_collider_option_active = 'Waist size';
      },
      goto_event: { branch_index:mocap_options_branch, step:body_collider_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.waist') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.space') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size') + ((body_collider_option_active=='Waist size')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.tooltip')
);
    }
  },
  { key:'F', event_id: {
      func:()=>{
body_collider_option_active = 'Hip size';
      },
      goto_event: { branch_index:mocap_options_branch, step:body_collider_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.hip') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.space') + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size') + ((body_collider_option_active=='Hip size')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.body_tracking_options.body_collider.size.tooltip')
);
    }
  },
  ]
              }
            }
          ];
        })(),
// 5
        {
          func: function () {
if (MMD_SA_options.user_camera.ML_models.pose.model_quality != 'Best') return;

if (MMD_SA_options.user_camera.ML_models.pose.z_depth_scale && (MMD_SA_options.user_camera.ML_models.pose.z_depth_scale < 3))
  MMD_SA_options.user_camera.ML_models.pose.z_depth_scale = undefined;
else if (MMD_SA_options.user_camera.ML_models.pose.z_depth_scale > 3)
  MMD_SA_options.user_camera.ML_models.pose.z_depth_scale = 2;
else
  MMD_SA_options.user_camera.ML_models.pose.z_depth_scale = 4.5;
          },
          goto_event: { branch_index:mocap_options_branch, step:1 },
        },
// 6
        (()=>{
          let option_active = 'Depth adjustment';
          const options = ['Depth adjustment', 'IRL hand/shoulder scale', 'Depth scale'];
          return {
            message: {
  get content() {
return [
  '1. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment') + ': ' + ((MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent == 0) ? 'OFF' : MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent + '%') + ((option_active=='Depth adjustment')?'⬅️➡️':''),
//  '・Press ⬅️➡️ to change value',
  '2. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.IRL_hand_shoulder_scale') + ': ' + ((MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent == 0) ? 'OFF' : MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent + '%') + ((option_active=='IRL hand/shoulder scale')?'⬅️➡️':'  　　'),
//\n' + '        ' + '┗ ' + palm_shoulder_scale() + '
  '3. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.depth_scale') + ': ' + ((MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent == 0) ? 'OFF' : MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent + '%') + ((option_active=='Depth scale')?'⬅️➡️':''),
  '4. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization') + ': ' + ((System._browser.camera.handpose.stabilize_arm == 2) ? 'ON' : ((System._browser.camera.handpose.stabilize_arm == 1) ? System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization.upper_body_mocap') : 'OFF')),
  '5. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization.time_to_stabilize') + ': ' + ((System._browser.camera.handpose.stabilize_arm) ? ((System._browser.camera.handpose.stabilize_arm_time) ? ((System._browser.camera.handpose.stabilize_arm_time == 1) ? '1 ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization.time_to_stabilize.frame') : System._browser.camera.handpose.stabilize_arm_time + 'ms') : '0') : 'N/A'),
  '6. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.hand_stabilization') + ': ' + ((System._browser.camera.handpose.stabilize_hand_percent) ? System._browser.camera.handpose.stabilize_hand_percent + '%' : 'OFF') + '➕➖',
  '7. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.constrain_tracking_region') + ': ' + ((System._browser.camera.handpose.constrain_tracking_region) ? 'ON' : System._browser.translation.get('Misc.auto')),
  '8. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.standalone_web_worker') + ': ' + ((System._browser.camera.handpose.use_hands_worker == 1) ? System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.standalone_web_worker.parallel') : ((System._browser.camera.handpose.use_hands_worker == 2) ? System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.standalone_web_worker.synced') : 'OFF')),
  '9. ' + System._browser.translation.get('Misc.done'),
].join('\n');
  }
 ,bubble_index: 3
 ,para: { row_max:11 }
 ,branch_list: [
  { key:'any', func:(e)=>{
if (/Arrow(Up|Down)/.test(e.code)) {
  let index = options.findIndex(v=>v==option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = options.length-1;
  }
  else if (index > options.length-1) {
    index = 0;
  }
  option_active = options[index];
}
else if (/Arrow(Left|Right)/.test(e.code)) {
  const v = (e.code == 'ArrowRight') ? 1 : -1;
  switch (option_active) {
    case 'Depth adjustment':
MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent = THREE.Math.clamp(MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent + v, 0,100);
      break;
    case 'IRL hand/shoulder scale':
MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent = THREE.Math.clamp(MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent + v, 10,50);
      break;
    case 'Depth scale':
MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent = THREE.Math.clamp(MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent + v, 10,90);
      break;
    default:
      return false;
  }
}
else if ((e.key == '+') || (e.key == '-')) {
  const v = (e.key == '+') ? 1 : -1;
  System._browser.camera.handpose.stabilize_hand_percent = THREE.Math.clamp(System._browser.camera.handpose.stabilize_hand_percent + v, 0,100);
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null,mocap_options_branch,hand_page_index);

return true;
  } },

  { key:1, event_id: {
      func:()=>{
option_active = 'Depth adjustment';
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment') + ((option_active=='Depth adjustment')?' (' +  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.tooltip')
);
    }
  },
  { key:2, event_id: {
      func:()=>{
option_active = 'IRL hand/shoulder scale';
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.IRL_hand_shoulder_scale') + ((option_active=='IRL hand/shoulder scale')?' (' +  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.press_to_change_value') + ')' :'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.IRL_hand_shoulder_scale.tooltip')
);
    }
  },
  { key:3, event_id: {
      func:()=>{
option_active = 'Depth scale';
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.depth_scale') + ((option_active=='Depth scale')?' (' +  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.press_to_change_value') + ')' :'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.depth_adjustment.depth_scale.tooltip')
);
    }
  },
  { key:4, event_id: {
      func:()=>{
if (--System._browser.camera.handpose.stabilize_arm < 0)
  System._browser.camera.handpose.stabilize_arm = 2
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization.tooltip')
);
    }
  },
  { key:5, event_id: {
      func:()=>{
if (!System._browser.camera.handpose.stabilize_arm_time) {
  System._browser.camera.handpose.stabilize_arm_time = 1;
}
else if (System._browser.camera.handpose.stabilize_arm_time == 1) {
  System._browser.camera.handpose.stabilize_arm_time = 100;
}
else if (System._browser.camera.handpose.stabilize_arm_time == 100) {
  System._browser.camera.handpose.stabilize_arm_time = 200;
}
else {
  System._browser.camera.handpose.stabilize_arm_time = 0;
}
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization.time_to_stabilize') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.arm_stabilization.time_to_stabilize.tooltip')
);
    }
  },
  { key:6, event_id: {
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.hand_stabilization') + ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.hand_stabilization.press_to_change_value') + '):\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.hand_stabilization.tooltip')
);
    }
  },
  { key:7, event_id: {
      func:()=>{
System._browser.camera.handpose.constrain_tracking_region = !System._browser.camera.handpose.constrain_tracking_region;
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.constrain_tracking_region') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.constrain_tracking_region.tooltip')
);
    }
  },
  { key:8, event_id: {
      func:()=>{
if (++System._browser.camera.handpose.use_hands_worker > 2)
  System._browser.camera.handpose.use_hands_worker = 0;
      },
      goto_event: { branch_index:mocap_options_branch, step:hand_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.standalone_web_worker') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.hand_tracking_options.standalone_web_worker.tooltip')
);
    }
  },
  { key:9, is_closing_event:true, branch_index:done_branch }
  ]
            }
          };
        })(),
// 7
        {
          message: {
get content() {
  const tilt_adjustment = MMD_SA.MMD.motionManager.para_SA.motion_tracking?.camera?.tilt_adjustment || System._browser.camera.tilt_adjustment;
  return [
    System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset'),
    ((tilt_adjustment.enabled) ? '- ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset.press_to_adjust_offset_angle') : ''),
    ((tilt_adjustment.enabled) ? '- ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset.press_to_adjust_weighting_applied') : ''),
    '1. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset.tilt_adjustment') + ': ' + ((tilt_adjustment.enabled) ? 'ON' : 'OFF'),
    ((tilt_adjustment.enabled) ? '    ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset.angle') + ': ' + (tilt_adjustment.angle) + '° ⬆️⬇️' : ''),
    ((tilt_adjustment.enabled) ? '    ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset.weighting_body') + ': ' + Math.round(tilt_adjustment.pose_weight * 100) + '% ⬅️➡️' : ''),
    '2. ' + System._browser.translation.get('Misc.done'),
  ].filter(v=>v).join('\n');
},
bubble_index: 3,
branch_list: [
  { key:'any', func:(e)=>{
const tilt_adjustment = MMD_SA.MMD.motionManager.para_SA.motion_tracking?.camera?.tilt_adjustment || System._browser.camera.tilt_adjustment;
if (/Arrow(Up|Down)/.test(e.code)) {
  let a = tilt_adjustment.angle;
  a += (e.code == 'ArrowUp') ? 1 : -1;
  if (Math.abs(a) > 90)
    a = Math.sign(a) * 90;
  tilt_adjustment.angle = a;
}
else if (/Arrow(Left|Right)/.test(e.code)) {
  let p = Math.round(tilt_adjustment.pose_weight * 100);
  p += (e.code == 'ArrowRight') ? 1 : -1;
  tilt_adjustment.pose_weight = Math.min(Math.max(p,-100),100)/100;
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null,null,tilt_page_index);

return true;
  } },
  { key:1, event_id: {
      func:()=>{
const tilt_adjustment = MMD_SA.MMD.motionManager.para_SA.motion_tracking?.camera?.tilt_adjustment || System._browser.camera.tilt_adjustment;
tilt_adjustment.enabled = !tilt_adjustment.enabled;
      },
      goto_event: { branch_index:mocap_options_branch, step:tilt_page_index },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.webcam_angle_offset.tooltip')
);
    }
  },
  { key:2, is_closing_event:true, branch_index:done_branch }
],
          }
        },
// 8
        ...(()=>{
          const _od = {};

          let option_active = 'detection_score_threshold';
          options = ['detection_score_threshold', 'tracking_score_threshold'];

          return [
            {
              func: function () {
const od = System._browser.camera.object_detection;
_od.framework = od.framework;
_od.model = od.model;
_od.framework_classification = od.framework_classification;
_od.model_classification = od.model_classification;
              },
              next_step: {},
            },
// 9
            {
              message: {
  get content() {
return [
  '1. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.detection_AI_framework') + ': ' + _od.framework,
  '2. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.model') + ': ' + System._browser.camera.object_detection.framework_model[_od.framework][_od.model]?.option_name,
  '3. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.classification_AI_framework') + ': ' + _od.framework_classification,
  '4. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.model') + ': ' + System._browser.camera.object_detection.framework_model_classification[_od.framework_classification][_od.model_classification]?.option_name,
  '5. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.detection_score_threshold') + ': ' + System._browser.camera.object_detection.detection_score_threshold_percent + '%' + ((option_active=='detection_score_threshold') ? '⬅️➡️' : '  　　'),
  '6. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.tracking_score_threshold') + ': ' + System._browser.camera.object_detection.tracking_score_threshold_percent + '%' + ((option_active=='tracking_score_threshold') ? '⬅️➡️' : '  　　'),
  '7. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.detection_interval') + ': ' + System._browser.camera.object_detection.detection_interval + 'ms',
  '8. 🌐' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.download_trackable_props'),
  '9. ' + System._browser.translation.get('Misc.done'),
].join('\n');
  },
  bubble_index: 3,
  branch_list: [
  { key:'any', func:(e)=>{
if (/Arrow(Up|Down)/.test(e.code)) {
  let index = options.findIndex(v=>v==option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = options.length-1;
  }
  else if (index > options.length-1) {
    index = 0;
  }
  option_active = options[index];
}
else if (/Arrow(Left|Right)/.test(e.code)) {
  const v = (e.code == 'ArrowRight') ? 1 : -1;
  switch (option_active) {
    case 'detection_score_threshold':
System._browser.camera.object_detection.detection_score_threshold_percent = THREE.Math.clamp(System._browser.camera.object_detection.detection_score_threshold_percent + v, 10,80);
      break;
    case 'tracking_score_threshold':
System._browser.camera.object_detection.tracking_score_threshold_percent = THREE.Math.clamp(System._browser.camera.object_detection.tracking_score_threshold_percent + v, 10,80);
      break;
    default:
      return false;
  }
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null,mocap_options_branch,object_tracking_page_index+1);

return true;
  } },
  { key:1, event_id: {
      func:()=>{
const framework = Object.keys(System._browser.camera.object_detection.framework_model);

let index = framework.indexOf(_od.framework);
if (++index >= framework.length)
  index = 0;
_od.framework = framework[index];
_od.model = Object.keys(System._browser.camera.object_detection.framework_model[_od.framework])[0];
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.detection_AI_framework.tooltip')
);
    }
  },
  { key:2, event_id: {
      func:()=>{
const framework = Object.keys(System._browser.camera.object_detection.framework_model);
const model = Object.keys(System._browser.camera.object_detection.framework_model[_od.framework]);

let index = model.indexOf(_od.model);
if (++index >= model.length)
  index = 0;
_od.model = model[index];
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.model.tooltip')
);
    }
  },
  { key:3, event_id: {
      func:()=>{
const framework = Object.keys(System._browser.camera.object_detection.framework_model_classification);

let index = framework.indexOf(_od.framework_classification);
if (++index >= framework.length)
  index = 0;
_od.framework_classification = framework[index];
_od.model_classification = Object.keys(System._browser.camera.object_detection.framework_model_classification[_od.framework_classification])[0];
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.classification_AI_framework.tooltip')
);
    }
  },
  { key:4, event_id: {
      func:()=>{
const framework = Object.keys(System._browser.camera.object_detection.framework_model_classification);
const model = Object.keys(System._browser.camera.object_detection.framework_model_classification[_od.framework_classification]);

let index = model.indexOf(_od.model_classification);
if (++index >= model.length)
  index = 0;
_od.model_classification = model[index];
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.model.tooltip')
);
    }
  },
  { key:5, event_id: {
      func:()=>{
option_active = 'detection_score_threshold';
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.detection_score_threshold.tooltip').replace(/\<press_to_change_value\>/, (option_active=='detection_score_threshold') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.press_to_change_value') + ')' : '')
);
    }
  },
  { key:6, event_id: {
      func:()=>{
option_active = 'tracking_score_threshold';
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.tracking_score_threshold.tooltip').replace(/\<press_to_change_value\>/, (option_active=='tracking_score_threshold') ? ' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.press_to_change_value') + ')' : '')
);
    }
  },
  { key:7, event_id: {
      func:()=>{
const s = [0,250,500,1000];
let index = s.indexOf(System._browser.camera.object_detection.detection_interval);
if (++index >= s.length)
  index = 0;
System._browser.camera.object_detection.detection_interval = s[index];
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.object_tracking_options.detection_interval.tooltip')
);
    }
  },
  { key:8, event_id: {
      func:()=>{
var url = 'https://ko-fi.com/s/eae52effa9'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
      },
      goto_event: { branch_index:mocap_options_branch, step:object_tracking_page_index+1 },
    }
  },
  { key:9, is_closing_event:true, event_id: {
      func:()=>{
Object.assign(System._browser.camera.object_detection, _od);
      },
      goto_event: { branch_index:done_branch },
    },
  },
  ],
              },
            },
          ];
        })(),

      ];
})()


);
})();
