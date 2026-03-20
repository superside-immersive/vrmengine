// facemesh-branches-4.js
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
// 30
      [
        {
          func: function () {
MMD_SA_options.user_camera.ML_models.pose.use_legIK = !MMD_SA_options.user_camera.ML_models.pose.use_legIK;
if (MMD_SA_options.user_camera.ML_models.pose.use_legIK) {
  System._browser.camera.poseNet.frames.remove('skin', '左ひざ');
  System._browser.camera.poseNet.frames.remove('skin', '右ひざ');
}
          }
         ,goto_event: { branch_index:mocap_options_branch, step:1 }
        }
      ]
// 31
     ,[]
// 32
     ,[
        {
          func: function () {
System._browser.camera.poseNet.auto_grounding = !System._browser.camera.poseNet.auto_grounding;
          }
         ,goto_event: { branch_index:mocap_options_branch, step:1 }
        }
      ]
// 33
     ,[
        {
          func: function () {
const camera = System._browser.camera;
if (!camera.poseNet.enabled) {
  DEBUG_show('(Body mocap only)', 2);
  return;
}
if (!camera.video || (camera.video.pause && !camera.video.paused)) {
  DEBUG_show('(Paused video input required)', 2);
  return;
}
if (!camera.poseNet._bb) {
  DEBUG_show('(No bounding box to clear)', 2);
  return;
}

System._browser.camera.poseNet.bb_clear = 15
          }
         ,goto_branch: mocap_options_branch
        }
      ]

// 34
     ,(()=>{
        let page_index = 3;

        let option_active = 'General weighting';
        const options = ['General weighting', 'Joy/Fun', 'Angry', 'Sorrow', 'Surprised', 'Tongue out', 'Others', 'AI', 'AI neutralness', 'Vowel'];

        const branch_list_common = [
    { key:'any', func:(e)=>{
if ((e.key == '+') || (e.key == '-')) {
  const v = (e.key == '+') ? 2 : -2;
  System._browser.camera.facemesh.eye_bone_rotation_percent = THREE.Math.clamp(System._browser.camera.facemesh.eye_bone_rotation_percent + v, 0,200);
}
else if (page_index == 2) {
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
      case 'General weighting':
System._browser.camera.facemesh.emotion_weight_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_weight_percent + v, 0,100);
        break;
      case 'Joy/Fun':
System._browser.camera.facemesh.emotion_joy_fun_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_joy_fun_percent + v, 0,200);
        break;
      case 'Angry':
System._browser.camera.facemesh.emotion_angry_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_angry_percent + v, 0,200);
        break;
      case 'Sorrow':
System._browser.camera.facemesh.emotion_sorrow_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_sorrow_percent + v, 0,200);
        break;
      case 'Surprised':
System._browser.camera.facemesh.emotion_surprised_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_surprised_percent + v, 0,200);
        break;
      case 'Tongue out':
System._browser.camera.facemesh.emotion_tongue_out_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_tongue_out_percent + v, 0,100);
        break;
      case 'Others':
System._browser.camera.facemesh.emotion_others_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_others_percent + v, 0,200);
        break;
      case 'AI':
const p_min = 30;
System._browser.camera.facemesh.emotion_AI_detection_percent = (System._browser.camera.facemesh.emotion_AI_detection_percent + v < p_min) ? ((v > 0) ? p_min : 0) : THREE.Math.clamp(System._browser.camera.facemesh.emotion_AI_detection_percent + v, 0,200);
        break;
      case 'AI neutralness':
if ((System._browser.camera.facemesh.emotion_weight_percent == 0) || (System._browser.camera.facemesh.emotion_AI_detection_percent == 0)) return false;

System._browser.camera.facemesh.emotion_AI_detection_neutralness_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_AI_detection_neutralness_percent + v, 0,100);
        break;
      case 'Vowel':
System._browser.camera.facemesh.emotion_vowel_percent = THREE.Math.clamp(System._browser.camera.facemesh.emotion_vowel_percent + v, 30,100);
        break;
      default:
        return false;
    }
  }
  else {
    return false;
  }
}
else {
  return false;
}

XRA_runEvent(null,facemesh_options_branch,0);
return true;
      }
    },
    { key:1, branch_index:facemesh_options_branch+2,
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.eye_tracking.tooltip')
);
      }
    },
    { key:2, branch_index:facemesh_options_branch+1,
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.blink_LR_sync.tooltip')
);
      }
    },
    { key:3, event_id:{ func:()=>{
if (System._browser.camera.facemesh.eye_tracking) {
  if (++System._browser.camera.facemesh.blink_clarity > 3)
    System._browser.camera.facemesh.blink_clarity = 1;
}
      }, goto_branch:facemesh_options_branch },
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.blink_clarity.tooltip')
);
      }
    },
    { key:4, event_id:{ func:()=>{ System._browser.camera.facemesh.auto_blink = !System._browser.camera.facemesh.auto_blink; }, goto_branch:facemesh_options_branch },
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.auto_blink.tooltip')
);
      }
    },
    { key:5, event_id:{ func:()=>{}, goto_branch:facemesh_options_branch },
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.eye_bone_rotation.tooltip')
);
      }
    },
    { key:6, event_id:{ func:()=>{
page_index = (page_index == 2) ? 3 : 2;
        },
//        goto_event: { branch_index:facemesh_options_branch, step:0 },
        goto_branch:facemesh_options_branch,
      },
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.tooltip')
);
      }
    },
    { key:7, event_id:{ func:()=>{
if (System._browser.camera.facemesh.enabled && System._browser.camera.video) {
  page_index = (page_index == 1) ? 3 : 1;
}
        },
        goto_branch:facemesh_options_branch,
      },
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.calibration_options.tooltip')
);
      }
    },
    { key:'X', is_closing_event:true, branch_index:done_branch },
        ];

        return [
// 0
        {
          message: {
  get content() {
const camera = System._browser.camera;

let blink_clarity;
switch (System._browser.camera.facemesh.blink_clarity) {
  case 2:
    blink_clarity = 'High';
    break;
  case 3:
    blink_clarity = 'Very high';
    break;
  default:
    blink_clarity = 'Normal';
}
blink_clarity = System._browser.translation.get('Misc.' + blink_clarity);

return [
  '1. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.eye_tracking') + ': ' + ((!System._browser.camera.facemesh.eye_tracking)?'OFF':'ON'),
  '2. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.blink_LR_sync') + ': ' + ((System._browser.camera.facemesh.eye_tracking) ? ((!System._browser.camera.facemesh.blink_sync)?'OFF':'ON') : 'N/A'),
  '3. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.blink_clarity') + ': ' + ((System._browser.camera.facemesh.eye_tracking) ? blink_clarity : 'N/A'),
  '4. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.auto_blink') + ': ' + ((!System._browser.camera.facemesh.auto_blink)?'OFF':'ON'),
  '5. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.eye_bone_rotation') + ': ' + (System._browser.camera.facemesh.eye_bone_rotation_percent + '%') + '➕➖',
  '6. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options') + ((page_index == 2) ? '📖' : ' ▶️'),
  ...((System._browser.camera.facemesh.enabled && System._browser.camera.video) ? ['7. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.calibration_options') + ((page_index == 1) ? '📖' : ' ▶️')] : []),
  'X. ' + System._browser.translation.get('Misc.done'),
].join('\n');
  }
 ,para: { row_max:11 }
 ,bubble_index: 3
 ,branch_list: branch_list_common,
          },
          goto_event: { branch_index:facemesh_options_branch, get step() { return page_index; } },
        },
// 1
        {
          message: {
get content() { return System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.calibration_options.message'); },
index: 1,
bubble_index: 3,
branch_list: [
  { key:'A', sb_index: 1, branch_index:facemesh_options_branch+3 },
  { key:'B', sb_index: 1, branch_index:facemesh_options_branch+4 },
  { key:'C', sb_index: 1, branch_index:facemesh_options_branch+5 },
],
          }
        },
// 2
        (()=>{
          const _branch_list = [
  { key:'A', event_id: {
      func:()=>{
option_active = 'General weighting';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.general_weighting') + ((option_active=='General weighting')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.general_weighting.tooltip')
);
    }
  },
  { key:'B', event_id: {
      func:()=>{
option_active = 'Joy/Fun';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.joy_fun') + ((option_active=='Joy/Fun')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.joy_fun.tooltip')
);
    }
  },
  { key:'C', event_id: {
      func:()=>{
option_active = 'Angry';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.angry') + ((option_active=='Angry')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.angry.tooltip')
);
    }
  },
  { key:'D', event_id: {
      func:()=>{
option_active = 'Sorrow';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.sorrow') + ((option_active=='Sorrow')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.sorrow.tooltip')
);
    }
  },
  { key:'E', event_id: {
      func:()=>{
option_active = 'Surprised';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.surprised') + ((option_active=='Surprised')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.surprised.tooltip')
);
    }
  },
  { key:'F', event_id: {
      func:()=>{
option_active = 'Tongue out';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.tongue_out') + ((option_active=='Tongue out')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.tongue_out.tooltip')
);
    }
  },
  { key:'G', event_id: {
      func:()=>{
option_active = 'Others';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('Misc.others') + ((option_active=='Others')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.others.tooltip')
);
    }
  },
  { key:'H', event_id: {
      func:()=>{
option_active = 'AI';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection') + ((option_active=='AI')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection.tooltip')
);
    }
  },
  { key:'I', event_id: {
      func:()=>{
if ((System._browser.camera.facemesh.emotion_weight_percent == 0) || (System._browser.camera.facemesh.emotion_AI_detection_percent == 0)) return;

const interval = [250,500,1000]
let index = interval.indexOf(System._browser.camera.facemesh.emotion_AI_detection_interval);
if (++index >= interval.length)
  index = 0
System._browser.camera.facemesh.emotion_AI_detection_interval = interval[index];
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection.interval.tooltip')
);
    }
  },
  { key:'J', event_id: {
      func:()=>{
option_active = 'AI neutralness';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection.neutralness') + ((option_active=='AI neutralness')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection.neutralness.tooltip')
);
    }
  },
  { key:'K', event_id: {
      func:()=>{
option_active = 'Vowel';
      },
      goto_event: { branch_index:facemesh_options_branch, step:2 },
    },
    sb_index: 1,
    onmouseover: function (e) {
XRA_runEvent(this.event_id);
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.vowel') + ((option_active=='Vowel')?' (' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value.short') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.vowel.tooltip')
);
    }
  },
          ];

          return {
            message: {
  get content() {
    return [
System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.emotion_tracking'),
//'・Press ⬆️⬇️ to switch option',
//'・' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.press_to_change_value'),
'A. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.general_weighting') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'OFF' : System._browser.camera.facemesh.emotion_weight_percent + '%') + ((option_active=='General weighting')?'⬅️➡️':'  　　'),
'B. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.joy_fun') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_joy_fun_percent + '%') + ((option_active=='Joy/Fun')?'⬅️➡️':'  　　'),
'C. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.angry') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_angry_percent + '%') + ((option_active=='Angry')?'⬅️➡️':'  　　'),
'D. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.sorrow') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_sorrow_percent + '%') + ((option_active=='Sorrow')?'⬅️➡️':'  　　'),
'E. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.surprised') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_surprised_percent + '%') + ((option_active=='Surprised')?'⬅️➡️':'  　　'),
'F. ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.tongue_out') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_tongue_out_percent + '%') + ((option_active=='Tongue out')?'⬅️➡️':'  　　'),
'G. ┣ ' + System._browser.translation.get('Misc.others') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_others_percent + '%') + ((option_active=='Others')?'⬅️➡️':''),
'H. ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_AI_detection_percent + '%') + ((option_active=='AI')?'⬅️➡️':'  　　'),
'I.     ┣ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection.interval') + ': ' + (((System._browser.camera.facemesh.emotion_weight_percent == 0) || (System._browser.camera.facemesh.emotion_AI_detection_percent == 0)) ? 'N/A' : System._browser.camera.facemesh.emotion_AI_detection_interval + 'ms'),
'J.    ┗ ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.AI_detection.neutralness') + ': ' + (((System._browser.camera.facemesh.emotion_weight_percent == 0) || (System._browser.camera.facemesh.emotion_AI_detection_percent == 0)) ? 'N/A' : System._browser.camera.facemesh.emotion_AI_detection_neutralness_percent + '%') + ((option_active=='AI neutralness')?'⬅️➡️':'  　　'),
'K. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.emotion_tracking_options.vowel') + ': ' + ((System._browser.camera.facemesh.emotion_weight_percent == 0) ? 'N/A' : System._browser.camera.facemesh.emotion_vowel_percent + '%') + ((option_active=='Vowel')?'⬅️➡️':'  　　'),
    ].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:12, font_scale:0.95 },
  branch_list: _branch_list,
            }
          };
        })(),

// 3
        {
          message: {
  get content() {
let lean_tracking;
switch (System._browser.camera.facemesh.lean_tracking) {
  case 1:
    lean_tracking = 'Min';
    break;
  case 2:
    lean_tracking = 'Normal';
    break;
  case 3:
    lean_tracking = 'Max';
    break;
}
if (lean_tracking)
  lean_tracking = System._browser.translation.get('Misc.' + lean_tracking);

let mouth_tracking_sensitivity;
switch (System._browser.camera.facemesh.mouth_tracking_sensitivity) {
  case 1:
    mouth_tracking_sensitivity = 'High';
    break;
  case 2:
    mouth_tracking_sensitivity = 'Very high';
    break;
  case 3:
    mouth_tracking_sensitivity = 'Max';
    break;
  default:
    mouth_tracking_sensitivity = 'Normal';
}
mouth_tracking_sensitivity = System._browser.translation.get('Misc.' + mouth_tracking_sensitivity);

return [
  'A. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.AI_model_inference_device') + ': ' + System._browser.camera.facemesh.model_inference_device,
  'B. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.auto_look_at_camera') + ' (' + (System._browser.hotkeys.config_by_id['auto_look_at_camera']?.accelerator[0]||'') + '): ' + ((!System._browser.camera.facemesh.auto_look_at_camera)?'OFF':'ON'),
  'C. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.mouth_tracking_sensitivity') + ': ' + mouth_tracking_sensitivity,
  'D. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.lean_tracking') + ': ' + (lean_tracking || 'OFF'),
].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { font_scale:1 },
  branch_list: [
    { key:'A', event_id:{ func:()=>{
System._browser.camera.facemesh.model_inference_device = (System._browser.camera.facemesh.model_inference_device == 'CPU') ? 'GPU' : 'CPU';
        },
        goto_event: { branch_index:facemesh_options_branch, step:3 },
      },
      sb_index: 1,
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.AI_model_inference_device.tooltip')
);
      }
    },
    { key:'B', event_id:{ func:()=>{
System._browser.camera.facemesh.auto_look_at_camera = !System._browser.camera.facemesh.auto_look_at_camera;
        },
        goto_event: { branch_index:facemesh_options_branch, step:3 },
      },
      sb_index: 1,
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.auto_look_at_camera.tooltip').replace(/\<hotkey\>/, System._browser.hotkeys.config_by_id['auto_look_at_camera']?.accelerator[0]||'')
);
      }
    },
    { key:'C', event_id:{ func:()=>{
if (++System._browser.camera.facemesh.mouth_tracking_sensitivity > 3)
  System._browser.camera.facemesh.mouth_tracking_sensitivity = 0;
        },
        goto_event: { branch_index:facemesh_options_branch, step:3 },
      },
      sb_index: 1,
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.mouth_tracking_sensitivity.tooltip')
);
      }
    },
    { key:'D', event_id:{ func:()=>{
if (++System._browser.camera.facemesh.lean_tracking > 3)
  System._browser.camera.facemesh.lean_tracking = 0;
        },
        goto_event: { branch_index:facemesh_options_branch, step:3 },
      },
      sb_index: 1,
      onmouseover: function (e) {
XRA_tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.lean_tracking.tooltip')
);
      }
    },
  ],
          }
        },

        ];
      })()
// 35
     ,[
        {
          func: function () {
if (System._browser.camera.facemesh.eye_tracking)
  System._browser.camera.facemesh.blink_sync = !System._browser.camera.facemesh.blink_sync;
          }
         ,goto_branch: facemesh_options_branch
        }
      ]
// 36
     ,[
        {
          func: function () {
System._browser.camera.facemesh.eye_tracking = !System._browser.camera.facemesh.eye_tracking;
          }
         ,goto_branch: facemesh_options_branch
        }
      ]
// 37
     ,[
        {
          func: (()=>{
            function check_calibration(e) {
const sb_para = { font_scale:1, font:'"Segoe UI",Roboto,Ubuntu,"SF Pro"' };

const percent = e.detail.percent;
if (percent >= 100) {
  window.removeEventListener('SA_camera_facemesh_calibrating', check_calibration);
  MMD_SA.SpeechBubble.list[1].message(0, '(' + System._browser.translation.get('XR_Animator.UI.streamer_mode.calibrating_face_data') + ' - 100%)', 2000, sb_para);
}
else {
  MMD_SA.SpeechBubble.list[1].message(0, '(' + System._browser.translation.get('XR_Animator.UI.streamer_mode.calibrating_face_data') + ' - ' + percent + '%)\n' + System._browser.translation.get('XR_Animator.UI.streamer_mode.face_data_calibrating_message'), 0, sb_para);
}
            }

            return function () {
System._browser.camera.facemesh.reset_calibration(true);
XRA_runEvent(null,done_branch,0);

window.addEventListener('SA_camera_facemesh_calibrating', check_calibration);
            };
          })()
        }
      ]
// 38
     ,[
        {
          func: function () {
MMD_SA.SpeechBubble.list[1].hide();
window.addEventListener('SA_dragdrop_JSON', onDrop_JSON_change_facemesh_calibration);
          }
         ,message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.motion_capture.mocap_options.face_tracking_options.calibration_options.import_calibration'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, is_closing_event:true, branch_index:done_branch }
  ]
          }
        }
      ]
// 39
     ,[
        {
          func: function () {
const facemesh = System._browser.camera.facemesh;

if (!facemesh.calibrated) {
//  System._browser.on_animation_update.add(()=>{MMD_SA.SpeechBubble.message(0, 'Calibration needs to be complete before it can be exported.', 3*1000);}, 0,0);
  System._browser.camera.DEBUG_show('(Calibration needs to be complete before it can be exported.)', 5); XRA_runEvent(null, facemesh_options_branch, 0); return;
}
else {
  facemesh.export_calibration();
}
XRA_runEvent(null,done_branch,0);
          }
        }
      ]

// 40
     ,[
        {
          func: function () {
if (1) {
  XRA_runEvent(null,done_branch,0)
  MMD_SA.SpeechBubble.message(0, '(🚧 Work in progress 🚧)', 3*1000)
}
else if (!webkit_electron_mode) {
  XRA_runEvent(null,done_branch,0)
  MMD_SA.SpeechBubble.message(0, 'This option is for native app mode only.', 3*1000)
}
else {
  XRA_runEvent()
}
          }
        }
       ,{
          message: {
    content: 'Motion control feature has been removed in this build.\n\n1. Cancel'
 ,bubble_index: 3
 ,branch_list: [
    { key:1, is_closing_event:true, branch_index:done_branch }
  ]
          }
        }
      ]
// 41
     ,[
        {
          func: function () {
MMD_SA.SpeechBubble.message(0, 'Motion control feature has been removed.', 3*1000)
          }
         ,ended: true
        }
      ]
// 42
     ,[
        {
          func: function () {
MMD_SA.SpeechBubble.message(0, 'Motion control feature has been removed.', 3*1000)
          }
         ,ended: true
        }
      ]


);
})();
