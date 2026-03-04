(function () {
  if (window.XR_Animator_MiscOptionsMenu)
    return

  window.XR_Animator_MiscOptionsMenu = {
    buildEvents: function (MMD_SA_options) {
      function loadModuleEvents(scriptPath, namespace, warningText) {
        if (window.SA && SA.loader && (typeof SA.loader.loadScriptSync === 'function')) {
          SA.loader.loadScriptSync(scriptPath);
        }

        if (window[namespace] && (typeof window[namespace].buildEvents === 'function')) {
          return window[namespace].buildEvents(MMD_SA_options);
        }

        if (warningText && window.console && console.warn) {
          console.warn(warningText);
        }

        return [];
      }

      return [
        ...(()=>{
          let LR_option_active = 'locking_percent';
          const LR_options = ['locking_percent', 'look_at_target', 'movement_x', 'movement_y', 'movement_z', 'z_min', 'vertical_constraint', 'smooth_time', 'auto_zoom'];

          return [
        {
          message: {
  get content() {
return System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.message').replace(/\<VRM_joint_stiffness_percent\>/, MMD_SA.THREEX.VRM.joint_stiffness_percent).replace(/\<audio_visualizer\>/, (MMD_SA_options.use_CircularSpectrum)?'ON':'OFF');
  },
  bubble_index: 3,
  para: { no_word_break:true },
  branch_list: [
    { key:'any', func:function (e) {
let step;
if (MMD_SA.THREEX.enabled && /(\+|\-)/.test(e.key)) {
  step = (e.key == '+') ? 1 : -1;
  MMD_SA.THREEX.VRM.joint_stiffness_percent = THREE.Math.clamp(MMD_SA.THREEX.VRM.joint_stiffness_percent + step*2, 10,200);
}
else if (/Arrow(Up|Down)/.test(e.code)) {
  let index = LR_options.findIndex(v=>v==LR_option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = LR_options.length-1;
  }
  else if (index > LR_options.length-1) {
    index = 0;
  }
  LR_option_active = LR_options[index];
}
else if (/Arrow(Left|Right)/.test(e.code)) {
  step = (e.code == 'ArrowLeft') ? -1 : 1;
  if (LR_option_active == 'auto_zoom') {
    let v = THREE.Math.clamp(MMD_SA_options._camera_auto_zoom_percent + step, 0,100);
    if (v < 50)
      v = (step == 1) ? 50 : 0;
    MMD_SA_options._camera_auto_zoom_percent = v;
  }
  else if (MMD_SA_options.camera_face_locking !== false) {
    if (LR_option_active == 'locking_percent') {
      let v = THREE.Math.clamp(MMD_SA_options.camera_face_locking_percent + step, 0,100);
      MMD_SA_options.camera_face_locking_percent = v;
    }
    else if (LR_option_active == 'look_at_target') {
      let v = THREE.Math.clamp(MMD_SA_options.camera_face_locking_look_at_target_percent + step*2, -200,200);
      MMD_SA_options.camera_face_locking_look_at_target_percent = v;
    }
    else if (/movement_(\w)/.test(LR_option_active)) {
      const dir = RegExp.$1;
      const p = 'camera_face_locking_movement_' + dir + '_percent';
      const limit = (dir == 'z') ? 100 : 200;
      let v = THREE.Math.clamp(MMD_SA_options[p] + step*2, -limit,limit);
      MMD_SA_options[p] = v;
    }
    else if (LR_option_active == 'z_min') {
      let v = THREE.Math.clamp(MMD_SA_options.camera_face_locking_z_min + step/10, 0.5,5);
      MMD_SA_options.camera_face_locking_z_min = v;
    }
    if (LR_option_active == 'vertical_constraint') {
      let v = THREE.Math.clamp(MMD_SA_options.camera_face_locking_vertical_constraint_percent + step, 0,100);
      MMD_SA_options.camera_face_locking_vertical_constraint_percent = v;
    }
    else if (LR_option_active == 'smooth_time') {
      let v = THREE.Math.clamp(MMD_SA_options.camera_face_locking_smooth_time + step/10, 0.1,2);
      MMD_SA_options.camera_face_locking_smooth_time = v;
    }
  }
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null,null,0);

return true;
      }
    },

    { key:1, event_index:3 },
    { key:2, event_index:9 },
    { key:3, event_index:0,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.VRM_joint_stiffness.tooltip')
);
      }
    },
    { key:4, event_index:2,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.audio_visualizer.tooltip')
);
      }
    },
    { key:5, event_index:6,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.export_all_settings.tooltip')
);
      }
    },
    { key:6, event_index:7 },
    { key:7, is_closing_event:true, event_index:99 },
  ],
          },
          next_step: {},
        },

        {
          message: {
  get content() {
    return [
'A. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking') + ': ' + ((MMD_SA_options.camera_face_locking==null)?System._browser.translation.get('Misc.auto'):(MMD_SA_options.camera_face_locking)?'ON':'OFF'),
'B. ┣  ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_percent + '%' : 'N/A') + ((LR_option_active == 'locking_percent')?'⬅️➡️':'  　　'),
'C.    ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.look_at_target') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_look_at_target_percent + '%' : 'N/A') + ((LR_option_active == 'look_at_target')?'⬅️➡️':'  　　'),
'D.    ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.movement_x') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_movement_x_percent + '%' : 'N/A') + ((LR_option_active == 'movement_x')?'⬅️➡️':'  　　'),
'E.    ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.movement_y') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_movement_y_percent + '%' : 'N/A') + ((LR_option_active == 'movement_y')?'⬅️➡️':'  　　'),
'F. ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.movement_z') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_movement_z_percent + '%' : 'N/A') + ((LR_option_active == 'movement_z')?'⬅️➡️':'  　　'),
'G.    ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.movement_z.minimum_distance') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_z_min : 'N/A') + ((LR_option_active == 'z_min')?'⬅️➡️':'  　　'),
'H. ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.vertical_constraint') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_vertical_constraint_percent + '%' : 'N/A') + ((LR_option_active == 'vertical_constraint')?'⬅️➡️':'  　　'),
'I.  ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.smooth_time') + ': ' + ((MMD_SA_options.camera_face_locking !== false) ? MMD_SA_options.camera_face_locking_smooth_time : 'N/A') + ((LR_option_active == 'smooth_time')?'⬅️➡️':'  　　'),
'J.  ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_auto_zoom') + ': ' + ((MMD_SA_options._camera_auto_zoom_percent) ? (MMD_SA_options._camera_auto_zoom_percent+'%') :'OFF') + ((LR_option_active == 'auto_zoom')?'⬅️➡️':'  　　'),
    ].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:11, no_word_break:true },
  branch_list: [
    { key:'A', event_id:{ func:()=>{
if (MMD_SA_options.camera_face_locking == null) {
  MMD_SA_options.camera_face_locking = true;
}
else if (MMD_SA_options.camera_face_locking) {
  MMD_SA_options.camera_face_locking = false;
}
else {
  MMD_SA_options.camera_face_locking = null;
}
//MMD_SA.THREEX.utils.camera_auto_targeting({ id:'face', enabled:MMD_SA_options.camera_face_locking });
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.tooltip')
);
      }
    },
    { key:'B', event_id:{ func:()=>{
LR_option_active = 'locking_percent';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'locking_percent') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'C', event_id:{ func:()=>{
LR_option_active = 'look_at_target';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.look_at_target.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'look_at_target') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'D', event_id:{ func:()=>{
LR_option_active = 'movement_x';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.movement_x.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'movement_x') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'E', event_id:{ func:()=>{
LR_option_active = 'movement_y';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.locking_percent.movement_x.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'movement_y') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'F', event_id:{ func:()=>{
LR_option_active = 'movement_z';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.movement_z.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'movement_z') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'G', event_id:{ func:()=>{
LR_option_active = 'z_min';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.movement_z.minimum_distance.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'z_min') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'H', event_id:{ func:()=>{
LR_option_active = 'vertical_constraint';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.vertical_constraint.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'vertical_constraint') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'I', event_id:{ func:()=>{
LR_option_active = 'smooth_time';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.smooth_time.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'smooth_time') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_face_locking.press_to_change_value')+')' : '')
);
      },
    },
    { key:'J', event_id:{ func:()=>{
LR_option_active = 'auto_zoom';
    }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.camera_auto_zoom.tooltip')
);
      },
    },
  ],
          }
        }
          ];
        })(),

        {
          func: ()=>{
MMD_SA_options.use_CircularSpectrum = !MMD_SA_options.use_CircularSpectrum;
          },
          goto_event: { event_index:0 },
        },
// 3
        {
message: {
  index: 1,
  bubble_index: 3,
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.extra').replace(/\<switch_avatar_model\>/, (System._browser.hotkeys.config_by_id['switch_avatar_model'].accelerator[0] == 'Alt+1')?'Alt+1-4':'Ctrl+1-4'); }
},
next_step: {},
        },

        ...(()=>{
function get_state(id) {
  const hotkeys = System._browser.hotkeys

  let state = '✔️';
//  if (!id) return (hotkeys.is_global) ? '🌐' : state;

  const config = hotkeys.config_by_id[id];
  if (!config) return '❌';

  if (hotkeys.accelerators[config.accelerator[0]].is_global)
    state = '🌐';

  return state;
}

function check_hotkey(acc) {
  if (!acc) {
    if (!hotkey_combo || !hotkey_combo[0] || !hotkey_combo[1]) return false;
    acc = hotkey_combo.join('+');
  }

  let state;
  if (System._browser.hotkeys._hotkey_reserved.indexOf(acc) != -1) {
    state = false;
    hotkey_info = '❌' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.reserved');
  }
  else {
    state = browser_native_mode || !webkit_electron_remote.globalShortcut.isRegistered(acc);
    hotkey_info = (state) ? '✔️OK' : '❌' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.not_usable');
  }

  return state;
}

          var hotkey_id, hotkey_combo, hotkey_info, hotkey_acc;

          var branch_list = [
    { key:'any', func:(e)=>{
if (!hotkey_id) return false;
if (!hotkey_combo) return false;
if (hotkey_acc) return false;

if (e.code == 'Escape') {
  hotkey_acc = hotkey_combo = null;
  MMD_SA_options.Dungeon.run_event(null,null,5);
  return true;
}

if (/Alt|Control|Shift/.test(e.key)) {
  hotkey_combo[0] = e.key.replace(/Control/, 'Ctrl');
}
else if (/Key([A-Z])/.test(e.code)) {
  hotkey_combo[1] = RegExp.$1;
}

for (let i = 0; i < 2; i++) {
  if (!hotkey_combo[i])
    hotkey_combo[i] = '';
}

if (check_hotkey()) {
  hotkey_acc = hotkey_combo.join('+');
  hotkey_combo = null;
  System._browser.hotkeys.disabled = false;
}

MMD_SA_options.Dungeon.run_event(null,null,5);

return true;
    } },
    ...['switch_motion','arm_to_leg_control_mode','mocap_auto_grounding','hand_camera','selfie_mode','auto_look_at_camera','hip_camera'].map((id,i)=>{
      return { key:i+1, event_id:{ func:()=>{
hotkey_id = id;
hotkey_combo = hotkey_info = hotkey_acc = null;
        }, goto_event:{event_index:5} }
      };
    }),

    { key:'A', event_id:{ func:()=>{
if (hotkey_id) return;

const id = 'switch_avatar_model';
const hotkeys = System._browser.hotkeys;
const config = hotkeys.config_by_id[id];
const acc = [];
const acc_command = (config.accelerator[0] == 'Alt+1') ? 'Ctrl' : 'Alt';
for (let i = 0; i < 4; i++) {
  acc[i] = acc_command + '+' + (i+1);
}

if (!hotkeys.register(id, acc)) {
  const acc_default = hotkeys._hotkey_config.find(c=>c.id==id).accelerator;
  hotkeys.register(id, acc_default);
  DEBUG_show('❌' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.not_registered') + ' (' + acc_default[0] + ')', 5);
}
      }, goto_event:{event_index:3} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.extra.switch_avatar_model.tooltip')
);
      }
    },

    { key:'D', event_id:{ func:()=>{
if (!hotkey_id) return;

const hotkeys = System._browser.hotkeys
const config = hotkeys.config_by_id[hotkey_id];
hotkeys.enable_global(hotkey_id, !!hotkeys.accelerators[config.accelerator[0]].config.global_disabled);
    }, goto_event:{event_index:4} } },

    { key:'C', event_id:{ func:()=>{
if (!hotkey_id) return;
if (hotkey_id == 'switch_motion') return;

System._browser.hotkeys.disabled = true;

hotkey_combo = [];
hotkey_info = hotkey_acc = null;
    }, goto_event:{event_index:4} } },

    { key:'R', event_id:{ func:()=>{
if (!hotkey_id) return;
if (hotkey_id == 'switch_motion') return;

const hotkeys = System._browser.hotkeys;
const acc_default = hotkeys._hotkey_config.find(c=>c.id==hotkey_id).accelerator;

if (acc_default[0] == hotkeys.config_by_id[hotkey_id].accelerator[0]) {
  hotkey_info = (hotkey_acc) ? '✔️' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.reset') + ' (' + acc_default[0] + ')' : '(' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.already_default') + ')';
}
else {
  hotkeys.register(hotkey_id, acc_default);
  hotkey_info = '✔️' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.reset') + ' (' + acc_default[0] + ')';
}

hotkey_combo = hotkey_acc = null;
    }, goto_event:{event_index:4} } },

    { key:'F', event_id:{ func:()=>{
System._browser.hotkeys.disabled = false;

if (!hotkey_id) return;

const hotkeys = System._browser.hotkeys;
if (hotkey_acc) {
  const acc_default = hotkeys._hotkey_config.find(c=>c.id==hotkey_id).accelerator;
  if (!hotkeys.register(hotkey_id, [hotkey_acc])) {
    hotkeys.register(hotkey_id, acc_default);
    DEBUG_show('❌' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.not_registered') + ' (' + acc_default[0] + ')', 5);
  }
  else {
    DEBUG_show('✔️' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.registered') + ' (' + hotkey_acc + ')', 5);
  }
}

hotkey_id = hotkey_combo = hotkey_info = hotkey_acc = null;
    }, goto_event:{event_index:3} } },

    { key:'G', event_id:{ func:()=>{System._browser.hotkeys.register_global(!System._browser.hotkeys.is_global)}, goto_event:{event_index:3} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.global_hotkey_mode.tooltip')
);
      }
    },
    { key:'X', get is_closing_event() { return !System._browser.hotkeys.disabled; }, event_id:{ func:()=>{
System._browser.hotkeys.disabled = false;

hotkey_id = hotkey_combo = hotkey_info = hotkey_acc = null;
    }, goto_event:{event_index:99} } },
          ];

          return [
// 4
            {
              func: ()=>{
if (hotkey_id) MMD_SA_options.Dungeon.run_event();
              },
              message: {
  get content() {
const hotkeys = System._browser.hotkeys;

return [
  '1. ' + get_state('switch_motion') + 'Alt/Ctrl+Num0-9' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.switch_motion'),
  '2. ' + get_state('arm_to_leg_control_mode') + hotkeys.config_by_id['arm_to_leg_control_mode'].accelerator[0] + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.arm_as_leg_control'),
  '3. ' + get_state('mocap_auto_grounding') + hotkeys.config_by_id['mocap_auto_grounding'].accelerator[0] + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.auto_grounding'),
//  '・' + get_state('camera_3D_lock') + 'Ctrl+L to toggle 3D camera lock',
  '4. ' + get_state('hand_camera') + hotkeys.config_by_id['hand_camera'].accelerator[0] + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.hand_camera'),
  '5. ' + get_state('selfie_mode') + hotkeys.config_by_id['selfie_mode'].accelerator[0] + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.selfie_mode'),
  '6. ' + get_state('auto_look_at_camera') + hotkeys.config_by_id['auto_look_at_camera'].accelerator[0] + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.auto_look_at_camera'),
  '7. ' + get_state('hip_camera') + hotkeys.config_by_id['hip_camera'].accelerator[0] + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.hip_camera'),
  'G. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.global_hotkey_mode') + '🌐: ' + ((System._browser.hotkeys.is_global) ? 'ON' : 'OFF'),
  'X. ' + System._browser.translation.get('Misc.done'),
].join('\n');
  },
  bubble_index: 3,
  para: { no_word_break:true, font_scale:0.9 },
  branch_list: branch_list,
              },
            },

// 5
            {
              message: {
  get content() {
const hotkeys = System._browser.hotkeys
const config = hotkeys.config_by_id[hotkey_id];

return [
  get_state(hotkey_id) + hotkey_id,

  ...(()=>{
if (hotkey_id == 'switch_motion') return [System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.hotkey') + ': Alt/Ctrl+Num0-9'];

if (!hotkey_combo) return [System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.hotkey') + ': ' + (hotkey_acc||config.accelerator[0])];

let info = System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.valid_keys') + ':\n・Alt/Ctrl/Shift\n・A-Z\n' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.press_to_cancel');

if (!hotkey_combo.length) {
  return [
System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.current_hotkey') + ': ' + config.accelerator[0],
info,
  ];
}

return [
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.current_hotkey') + ': ' + hotkey_combo.join('+'),
  info,
];
  })(),

  ...((hotkey_info)?[hotkey_info]:[]),

  ...((hotkey_combo || browser_native_mode) ? [] : ['D. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.global_hotkey') + ': ' + ((hotkeys.accelerators[config.accelerator[0]].config.global_disabled) ? 'OFF' : 'ON')]),

  ...(()=>{
if ((hotkey_id == 'switch_motion') || hotkey_combo) return [];

if (!hotkey_combo) {
  return [
    'C. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.change_hotkey'),
    'R. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.hotkey.reset_hotkey'),
  ];
}
  })(),

  ...((hotkey_combo) ? [] : ['F. ' + System._browser.translation.get('Misc.finish')]),
].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { font_scale:1 },
  branch_list: branch_list,
              },
            },
          ];
        })(),
        ...loadModuleEvents(
          'images/XR Animator/modules/ui-options-settings-actions.js',
          'XR_Animator_UIOptionsSettingsActions',
          '[XR Animator] Settings actions module unavailable'
        ),

        ...loadModuleEvents(
          'images/XR Animator/modules/gamepad-control-menu.js',
          'XR_Animator_GamepadControlMenu'
        ),
      ];
    },
  }
})();
