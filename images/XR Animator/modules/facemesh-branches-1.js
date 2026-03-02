// facemesh-branches-1.js
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
//0
      [
        {
          _show_other_options_: false,

          message: {
  get content() { this._motion_for_export_ = /\.(bvh|fbx)$/i.test(MMD_SA.vmd_by_filename[MMD_SA.MMD.motionManager.filename].url) || System._browser.camera.motion_recorder.vmd; return (!MMD_SA_options.Dungeon.events["_FACEMESH_OPTIONS_"][0]._show_other_options_ && System._browser.camera.ML_enabled) ? (['record_motion','mocap_options','mocap_off'].map((node,i)=>(i+1) + '. ' + System._browser.translation.get('XR_Animator.UI.motion_capture.ML_on.'+node)).join('\n') + '\n4. ' + System._browser.translation.get('Misc.cancel') /*\n4. Enable motion control\n5. Other options*/ ) : ['UI_and_overlays','scene','miscellaneous_options','about_XR_Animator'].map((node,i)=>(i+1) + '. ' + System._browser.translation.get('XR_Animator.UI.UI_options.'+node)).join('\n') + '\n5. ' + System._browser.translation.get('Misc.cancel'); }//'1. UI and overlays\n2. BG/Scene/3D\n3. Visual effects\n4. Miscellaneous options\n5. About XR Animator\n6. Cancel'; }
 ,bubble_index: 3
 ,get branch_list() {
return (!MMD_SA_options.Dungeon.events["_FACEMESH_OPTIONS_"][0]._show_other_options_ && System._browser.camera.ML_enabled) ? ((this._motion_for_export_) ? [
  { key:1, branch_index:record_motion_branch },
  { key:2, branch_index:mocap_options_branch },
  { key:3, branch_index:2 },
//  { key:5, event_id:{ func:()=>{MMD_SA_options.Dungeon.events["_FACEMESH_OPTIONS_"][0]._show_other_options_=true;setTimeout(()=>{MMD_SA_options.Dungeon.events["_FACEMESH_OPTIONS_"][0]._show_other_options_=false},0);}, goto_event: { id:"_FACEMESH_OPTIONS_", branch_index:0 } } },
  { key:4, is_closing_event:true }
] : [
  { key:1, branch_index:record_motion_branch },
  { key:2, branch_index:mocap_options_branch },
  { key:3, branch_index:2 },
//  { key:4, branch_index:motion_control_branch },
//  { key:5, event_id:{ func:()=>{MMD_SA_options.Dungeon.events["_FACEMESH_OPTIONS_"][0]._show_other_options_=true;setTimeout(()=>{MMD_SA_options.Dungeon.events["_FACEMESH_OPTIONS_"][0]._show_other_options_=false},0);}, goto_event: { id:"_FACEMESH_OPTIONS_", branch_index:0 } } },
  { key:4, is_closing_event:true }
]) : [
  { key:1, branch_index:1 },
  { key:2, branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.tooltip')
);
    }
  },
  { key:3, branch_index:other_options_branch },
  { key:4, branch_index:about_branch },
  { key:5, is_closing_event:true }
];
  }
          }
        }
      ]

     ,[
        {
          goto_event: { id:"_SETTINGS_", branch_index:11 }
        }
      ]

     ,[
        {
          func: function () {
ML_off()
          }
         ,ended: true
        }
      ]

     ,[
        {
          func: function () {
//DragDrop.onDrop_finish = onDrop_scene_JSON;

window.removeEventListener('SA_MMD_before_render', animate_object3D);
window.addEventListener('SA_MMD_before_render', animate_object3D);
          }
         ,message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.message').replace(/\<zipped\>/, (webkit_electron_mode) ? '' : System._browser.translation.get('XR_Animator.UI.UI_options.scene.message.zipped')); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:bg_branch }
   ,{ key:2, branch_index:panorama_branch }
   ,{ key:3, branch_index:object3D_branch }
   ,{ key:4, event_id:{
        func:()=>{
          DEBUG_show('(Scene export is removed from this build.)', 4);
        }
       ,goto_event: { id:"_FACEMESH_OPTIONS_", branch_index:done_branch }
      }
    }
   ,{ key:5, branch_index:4 }//keep_dialogue_branch_list:true, 
   ,{ key:6, is_closing_event:true }
  ]
          }
        }
      ]

     ,[
        {
          message: {
//  index: 1,
//  para: { scale:0.75 },
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.reset_scene_to_default'); },
  para: { no_word_break:true },
  branch_list: [
//    { key:8, event_index:1 },
//    { key:9, event_id:{ sb_index:1, ended:true } },
    { key:1, event_index:1 },
    { key:2, is_closing_event:true, event_index:999 },
  ]
          }
        },
        {
          func: function () {
reset_scene();
          }
         ,goto_event: { id:"_FACEMESH_OPTIONS_", branch_index:done_branch }
        }
      ]
//5
     ,(()=>{
        let LR_option_active = 'scale_xy';
        const LR_options = ['scale_xy', 'scale_z', 'depth_shift', 'depth_contrast', 'depth_blur', 'depth_smoothing', 'pos_x_offset', 'pos_y_offset', 'pos_z_offset'];

        let PM_option_active = 'camera_position_y';
        const PM_options = ['camera_position_y', 'camera_position_z'];

        let advanced_options_enabled;

        const status_msg_waiting = '(⏳Waiting for image input)';
        let status_msg = '';
        window.addEventListener('load', ()=>{
status_msg = status_msg_waiting;
Object.defineProperty(MMD_SA_options, '_Wallpaper3D_status_', {
  get: function () { return status_msg;  },
  set: function (v) {
    status_msg = v;
    if (F.wallpaper_dialog_enabled) {
      MMD_SA_options.Dungeon.run_event(null,bg_branch,1);
    }
  }
});
        });

        let status_msg2 = '';
        window.addEventListener('load', ()=>{
Object.defineProperty(MMD_SA_options, '_Wallpaper3D_status2_', {
  get: function () { return status_msg2;  },
  set: function (v) {
    status_msg2 = v;
    if (F.wallpaper_generator_dialog_enabled) {
      MMD_SA_options.Dungeon.run_event(null,bg_branch,3);
    }
  }
});
        });

        return [
          {
            func: function () {
F.wallpaper_dialog_enabled = true;
            }
           ,message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.background').replace(/\<image_input_handler\>/, (MMD_SA_options.image_input_handler_as_wallpaper) ? System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.image_input_handler_as_wallpaper') : System._browser.translation.get('Misc.default')); }
 ,bubble_index: 3
 ,para: { row_max:11 }
 ,branch_list: [
    { key:1, branch_index:bg_branch+1 },
    { key:2, branch_index:bg_branch+2 },
    { key:3, branch_index:bg_branch+3 },
    { key:4, branch_index:bg_branch+4 },
    { key:5, branch_index:bg_branch+5 },
    { key:6, event_id:{ func:()=>{
MMD_SA_options.image_input_handler_as_wallpaper = !MMD_SA_options.image_input_handler_as_wallpaper;
      }, goto_event:{event_index:0} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.image_input_handler_as_wallpaper.tooltip')
);
      }
    },
    { key:'X', is_closing_event:true, func:()=>{ F.wallpaper_dialog_enabled=false; }, branch_index:done_branch }
  ]
            },
            next_step: {}
          },
          {
            func: function () {
F.wallpaper_dialog_enabled = true;
if (advanced_options_enabled) MMD_SA_options.Dungeon.run_event();
            },
            message: {
  get content() {
    return [
(MMD_SA.Wallpaper3D.enabled) ? status_msg : '(🔒3D mode disabled)',
'A. ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper') + ': ' + ((MMD_SA.Wallpaper3D.enabled)?'ON':'OFF'),
'B. ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_xy') + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.scale_xy_percent + '%' : 'N/A') + ((LR_option_active == 'scale_xy')?'⬅️➡️':'  　　'),
'C. ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z')  + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.scale_z_percent +  '%' : 'N/A') + ((LR_option_active == 'scale_z') ?'⬅️➡️':'  　　'),
'D.    ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_shift')  + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.depth_shift_percent +  '%' : 'N/A') + ((LR_option_active == 'depth_shift') ?'⬅️➡️':'  　　'),
'E.    ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_contrast')  + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.depth_contrast_percent +  '%' : 'N/A') + ((LR_option_active == 'depth_contrast') ?'⬅️➡️':'  　　'),
'F.    ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_blur')  + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.depth_blur + 'px'  : 'N/A') + ((LR_option_active == 'depth_blur') ?'⬅️➡️':'  　　'),
'G.    ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_smoothing')  + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.depth_smoothing_percent +  '%' : 'N/A') + ((LR_option_active == 'depth_smoothing') ?'⬅️➡️':'  　　'),
'H. ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.position_x_offset') + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.pos_x_offset_percent + '%' : 'N/A') + ((LR_option_active == 'pos_x_offset')?'⬅️➡️':'  　　'),
'I.  ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.position_y_offset') + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.pos_y_offset_percent + '%' : 'N/A') + ((LR_option_active == 'pos_y_offset')?'⬅️➡️':'  　　'),
'J. ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.position_z_offset') + ': ' + ((MMD_SA.Wallpaper3D.enabled) ? MMD_SA.Wallpaper3D.options.pos_z_offset_percent + '%' : 'N/A') + ((LR_option_active == 'pos_z_offset')?'⬅️➡️':'  　　'),
'K. ' + ((advanced_options_enabled)?'📖':'◀️') + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.advanced_options')
    ].join('\n');
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:12, no_word_break:true, font_scale:0.90 },
  branch_list: [
    { key:'any', func:function (e) {
let step;
if (/Arrow(Up|Down)/.test(e.code)) {
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
  if (MMD_SA.Wallpaper3D.enabled) {
    if (LR_option_active == 'scale_xy') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.scale_xy_percent + step, 100,200);
      MMD_SA.Wallpaper3D.options.scale_xy_percent = v;
    }
    else if (LR_option_active == 'scale_z') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.scale_z_percent + step * ((MMD_SA.Wallpaper3D.options.scale_z_percent + step > 100) ? 10 : 1), 10,1000);
      MMD_SA.Wallpaper3D.options.scale_z_percent = v;
    }
    else if (LR_option_active == 'depth_shift') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.depth_shift_percent + step*5, -300,300);
      MMD_SA.Wallpaper3D.options.depth_shift_percent = v;
    }
    else if (LR_option_active == 'depth_contrast') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.depth_contrast_percent + step * ((MMD_SA.Wallpaper3D.options.depth_contrast_percent + step > 0) ? 5 : 1), -100,300);
      MMD_SA.Wallpaper3D.options.depth_contrast_percent = v;
    }
    else if (LR_option_active == 'depth_blur') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.depth_blur + step, 0,16);
      MMD_SA.Wallpaper3D.options.depth_blur = v;
    }
    else if (LR_option_active == 'depth_smoothing') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.depth_smoothing_percent + step, 0,100);
      MMD_SA.Wallpaper3D.options.depth_smoothing_percent = v;
    }
    else if (LR_option_active == 'pos_x_offset') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.pos_x_offset_percent + step, -50,50);
      MMD_SA.Wallpaper3D.options.pos_x_offset_percent = v;
    }
    else if (LR_option_active == 'pos_y_offset') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.pos_y_offset_percent + step, -50,50);
      MMD_SA.Wallpaper3D.options.pos_y_offset_percent = v;
    }
    else if (LR_option_active == 'pos_z_offset') {
      let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.pos_z_offset_percent + step, -50,50);
      MMD_SA.Wallpaper3D.options.pos_z_offset_percent = v;
    }
  }
}
else if (advanced_options_enabled && /(\+|\-)/.test(e.key)) {
  step = (e.key == '+') ? 1 : -1;
  if (PM_option_active == 'camera_position_y') {
    let v = Math.round(THREE.Math.clamp(MMD_SA.Wallpaper3D.options.exported_camera_position_y + step/10, 0,10) * 10) / 10;
    if (v < 0.5)
      v = (step > 0) ? 0.5 : 0;
    MMD_SA.Wallpaper3D.options.exported_camera_position_y = v;
  }
  else if (PM_option_active == 'camera_position_z') {
    let v = Math.round(THREE.Math.clamp(MMD_SA.Wallpaper3D.options.exported_camera_position_z + step/10, 0,10) * 10) / 10;
    if (v < 0.5)
      v = (step > 0) ? 0.5 : 0;
    MMD_SA.Wallpaper3D.options.exported_camera_position_z = v;
  }
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null,null,1);

return true;
      }
    },

    { key:'A', event_id:{ func:()=>{
MMD_SA.Wallpaper3D.enabled = !MMD_SA.Wallpaper3D.enabled;
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.tooltip')
);
      }
    },
    { key:'B', event_id:{ func:()=>{
LR_option_active = 'scale_xy';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_xy.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'scale_xy') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'C', event_id:{ func:()=>{
LR_option_active = 'scale_z';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'scale_z') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'D', event_id:{ func:()=>{
LR_option_active = 'depth_shift';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_shift.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'depth_shift') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'E', event_id:{ func:()=>{
LR_option_active = 'depth_contrast';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_contrast.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'depth_contrast') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'F', event_id:{ func:()=>{
LR_option_active = 'depth_blur';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_blur.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'depth_blur') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'G', event_id:{ func:()=>{
LR_option_active = 'depth_smoothing';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.scale_z.depth_smoothing.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'depth_smoothing') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'H', event_id:{ func:()=>{
LR_option_active = 'pos_x_offset';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.position_x_offset.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'pos_x_offset') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'I', event_id:{ func:()=>{
LR_option_active = 'pos_y_offset';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.position_x_offset.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'pos_y_offset') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'J', event_id:{ func:()=>{
LR_option_active = 'pos_z_offset';
      }, goto_event:{event_index:1} },
      sb_index: 1,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.position_z_offset.tooltip').replace(/\<press_to_change_value\>/, (LR_option_active == 'pos_z_offset') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.press_to_change_value')+')' : '')
);
      }
    },
    { key:'K', event_id:{ func:()=>{
advanced_options_enabled = !advanced_options_enabled;
      }, goto_event:{event_index:0} },
      sb_index: 1
    },
  ]
            }
          },
          {
            message: {
  get content() {
    return [
//'⚙️' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.advanced_options'),
'L. ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.depth_model') + ': ' + MMD_SA.Wallpaper3D.depth_model_name[MMD_SA.Wallpaper3D.options.depth_model],
'M. ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.super_resolution') + ': ' + ((MMD_SA.Wallpaper3D.options.SR_mode) ? 'ON' : 'OFF'),
'N. ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.super_resolution.model') + ': ' + ((MMD_SA.Wallpaper3D.options.SR_mode) ? MMD_SA.Wallpaper3D.SR_model_name[MMD_SA.Wallpaper3D.options.SR_model] : 'N/A'),
'O. ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.keep_worker_thread') + ': ' + System._browser.translation.get('Misc.' + ((MMD_SA.Wallpaper3D.options.keeps_worker_thread)?'yes':'no')),
'P. 🔄' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper'),
'Q. 🖥️' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.create_desktop_shortcut'),
'X. ' + System._browser.translation.get('Misc.done'),
    ].join('\n');
  },
  bubble_index: 3,
  para: { row_max:11, no_word_break:true, font_scale:0.95 },
  branch_list: [
    { key:'L', event_id:{ func:()=>{
const depth_model_list = Object.keys(MMD_SA.Wallpaper3D.depth_model_name);
let depth_model_index = depth_model_list.findIndex(m=>m==MMD_SA.Wallpaper3D.options.depth_model);
if (++depth_model_index >= depth_model_list.length)
  depth_model_index = 0;
MMD_SA.Wallpaper3D.options.depth_model = depth_model_list[depth_model_index];
      }, goto_event:{event_index:2} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.depth_model.tooltip')
);
      }
    },
    { key:'M', event_id:{ func:()=>{
if (++MMD_SA.Wallpaper3D.options.SR_mode > 1)
  MMD_SA.Wallpaper3D.options.SR_mode = 0;
      }, goto_event:{event_index:2} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.super_resolution.tooltip')
);
      }
    },
    { key:'N', event_id:{ func:()=>{
if (!MMD_SA.Wallpaper3D.options.SR_mode) return;

const SR_model_list = Object.keys(MMD_SA.Wallpaper3D.SR_model_name);
let SR_model_index = SR_model_list.findIndex(m=>m==MMD_SA.Wallpaper3D.options.SR_model);
if (++SR_model_index >= SR_model_list.length)
  SR_model_index = 0;
MMD_SA.Wallpaper3D.options.SR_model = SR_model_list[SR_model_index];
      }, goto_event:{event_index:2} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.super_resolution.model.tooltip')
);
      }
    },
    { key:'O', event_id:{ func:()=>{
MMD_SA.Wallpaper3D.options.keeps_worker_thread = !MMD_SA.Wallpaper3D.options.keeps_worker_thread;
      }, goto_event:{event_index:2} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.keep_worker_thread.tooltip')
);
      }
    },
    { key:'P', event_id:{ func:function () {
status_msg2 = (MMD_SA.Wallpaper3D.options.converter_session) ? '⏯️Last session resumable' : '✔️Status: Idle';
System._browser.on_animation_update.add(()=>{ MMD_SA_options.Dungeon.run_event('_FACEMESH_OPTIONS_',bg_branch,3); }, 0,0);
this.ended = true;
      } },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.tooltip')
);
      }
    },
    { key:'Q', event_id:{ func:()=>{
createAnimationShortcut(Settings.f_path.replace(/XR Animator$/, '2D-to-3D Wallpaper'), true);
MMD_SA_options._Wallpaper3D_status_ = '(✔️3D wallpaper desktop shortcut created)';
      }, goto_event:{event_index:2} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.create_desktop_shortcut.tooltip')
);
      }
    },
    { key:'X', is_closing_event:true, func:()=>{ F.wallpaper_dialog_enabled=false; advanced_options_enabled=false; }, branch_index:done_branch },
  ]
            }
          },

          (()=>{
            async function onDrop_generate_3D_wallpaper(item) {
var src = item.path;
if (item.isFolder) {
  if (!webkit_electron_mode) {
    DEBUG_show('NOTE: Folder/video conversion not supported in web app version', 5);
    return;
  }

  await MMD_SA.Wallpaper3D.converter.start(src, true);
  MMD_SA_options.Dungeon.run_event(null,bg_branch,3);
}
else if (item.isFileSystem && /([^\/\\]+)\.(png|jpg|jpeg|bmp|webp|mp4|mkv|webm|mov)$/i.test(src) && !/xra\-3d\-wallpaper_[^\/\\]+$/i.test(src)) {
  if (/([^\/\\]+)\.(mp4|mkv|webm|mov)$/i.test(src) && !webkit_electron_mode) {
    DEBUG_show('NOTE: Folder/video conversion not supported in web app version', 5);
    return;
  }

  await MMD_SA.Wallpaper3D.converter.start(src);
  MMD_SA_options.Dungeon.run_event(null,bg_branch,3);
}
else {
  F._onDrop_finish.call(DragDrop, item);
}
            }

            const image_format = ['jpeg', 'png', 'webp'];

            return {
              func: function () {
F.wallpaper_dialog_enabled=false; advanced_options_enabled=false;

F.wallpaper_generator_dialog_enabled = true;

DragDrop.onDrop_finish = onDrop_generate_3D_wallpaper;
              },
              message: {
  get content() {
    return [
System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter'),
'・' + MMD_SA_options._Wallpaper3D_status2_,
...(()=>{
  if (MMD_SA.Wallpaper3D.converter.running) {
    return [
'1. ' + '⏯️' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.pause_resume'),
'2. ' + '⏹️' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.stop'),
    ];
  }

  const options = [
'1. ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.batch_conversion_format') + ': ' + MMD_SA.Wallpaper3D.options.converter_image_format.toUpperCase(),
'2. ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.batch_conversion_format.quality') + ': ' + ((MMD_SA.Wallpaper3D.options.converter_image_format == 'png') ? 100 : MMD_SA.Wallpaper3D.options.converter_image_quality + '⬅️➡️'),
'3. 📝' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.note_on_conversion'),
  ];

  if (MMD_SA.Wallpaper3D.options.converter_session)
    options.push('4. ' + '▶️' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.resume_from_last_conversion'));

  return options;
})(),
'X. ' + System._browser.translation.get('Misc.cancel')
    ].join('\n');
  },
  bubble_index: 3,
  para: { font_scale:1 },
  branch_list: [
    { key:'any', func:function (e) {
let step;
if (/Arrow(Left|Right)/.test(e.code)) {
  if (MMD_SA.Wallpaper3D.converter.running || (MMD_SA.Wallpaper3D.options.converter_image_format == 'png')) return false;

  step = (e.code == 'ArrowLeft') ? -1 : 1;
  let v = THREE.Math.clamp(MMD_SA.Wallpaper3D.options.converter_image_quality + step, 50,100);
  MMD_SA.Wallpaper3D.options.converter_image_quality = v;
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null,bg_branch,3);

return true;
      }
    },
    { key:1, event_id:{ func:()=>{
if (MMD_SA.Wallpaper3D.converter.running) {
  MMD_SA.Wallpaper3D.converter.pause();
}
else {
  let index = image_format.indexOf(MMD_SA.Wallpaper3D.options.converter_image_format);
  if (++index >= image_format)
    index = 0;
  MMD_SA.Wallpaper3D.options.converter_image_format = image_format[index];
}
      }, goto_event:{event_index:3} },
      onmouseover: function (e) {
if (MMD_SA.Wallpaper3D.converter.running) return;

MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.batch_conversion_format.tooltip')
);
      }
    },
    { key:2, event_id:{ func:()=>{
if (MMD_SA.Wallpaper3D.converter.running) {
  MMD_SA.Wallpaper3D.converter.stop();
}
      }, goto_event:{event_index:3} },
      onmouseover: function (e) {
if (MMD_SA.Wallpaper3D.converter.running) return;

MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.background.3D_wallpaper.convert_3D_wallpaper.converter.batch_conversion_format.quality.tooltip')
);
      }
    },
    { key:3, event_id:{ func:()=>{
const note = toLocalPath(System.Gadget.path.replace(/[^\/\\]+$/, '') + '/accessories/ffmpeg/note_on_conversion.txt');
if (webkit_electron_mode) {
  System.Shell.execute(note);
}
else {
  window.open(note);
}
      }, goto_event:{event_index:3} },
    },
    { key:4, event_id:{ func:()=>{
if (!MMD_SA.Wallpaper3D.converter.running && MMD_SA.Wallpaper3D.options.converter_session) {
  MMD_SA.Wallpaper3D.converter.start();
}
      }, goto_event:{event_index:3} },
    },
    { key:'X', is_closing_event:true, func:()=>{ F.wallpaper_generator_dialog_enabled=false; MMD_SA.Wallpaper3D.converter.stop(); }, branch_index:done_branch },
  ]
              }
            };
          })(),
        ];
      })()


);
})();
