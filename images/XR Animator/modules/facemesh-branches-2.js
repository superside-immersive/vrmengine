// facemesh-branches-2.js
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
      [
        {
          func: function () {
const v_bg = document.getElementById("VdesktopBG");
if (v_bg) {
  v_bg.pause();
  v_bg.style.visibility = 'hidden';
}

MMD_SA.Wallpaper3D.visible = false;

LdesktopBG_host.style.display = F.bg_state_default;
document.body.style.backgroundColor = F.bg_color_default;
LdesktopBG.style.backgroundImage = F.bg_wallpaper_default;
MMD_SA_options.user_camera.display.webcam_as_bg = F.webcam_as_bg_default;
          }
         ,goto_branch: bg_branch
        }
      ]

     ,[
        {
          func: function () {
const v_bg = document.getElementById("VdesktopBG");
if (v_bg) {
  v_bg.pause();
  v_bg.style.visibility = 'hidden';
}

LdesktopBG_host.style.display = "none"
document.body.style.backgroundColor = "#000000"
          }
         ,goto_branch: bg_branch
        }
      ]

     ,[
        {
          func: function () {
const v_bg = document.getElementById("VdesktopBG");
if (v_bg) {
  v_bg.pause();
  v_bg.style.visibility = 'hidden';
}

LdesktopBG_host.style.display = "none"
document.body.style.backgroundColor = "#FFFFFF"
          }
         ,goto_branch: bg_branch
        }
      ]

     ,[
        {
          func: function () {
const v_bg = document.getElementById("VdesktopBG");
if (v_bg) {
  v_bg.pause();
  v_bg.style.visibility = 'hidden';
}

LdesktopBG_host.style.display = "none"
document.body.style.backgroundColor = "#00FF00"
          }
         ,goto_branch: bg_branch
        }
      ]
// 10
     ,[
        {
          func: function () {
const v_bg = document.getElementById("VdesktopBG");
if (v_bg) {
  v_bg.pause();
  v_bg.style.visibility = 'hidden';
}

MMD_SA_options.user_camera.display.webcam_as_bg = true
DEBUG_show('(Use webcam as BG)', 2)
          }
         ,goto_branch: bg_branch
        }
      ]

     ,[
        {
          func: function () {
reset_scene_UI();
          }
         ,ended: true
        }
      ]

     ,(()=>{
        let skybox_option_active = 'rotation_axis_angle';
        let skybox_options = ['rotation_speed', 'rotation_axis_angle'];

        return [
          {
            func: function () {
DragDrop.onDrop_finish = onDrop_change_panorama;
            }
           ,message: {
  get content() {
return System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox').replace('<rotation_speed>', ((F.dome_rotation_speed)?'x'+F.dome_rotation_speed:0) + ((skybox_option_active == 'rotation_speed')?'⬅️➡️':'')).replace('<rotation_axis_angle>', F.dome_axis_angle + '°' + ((skybox_option_active == 'rotation_axis_angle')?'⬅️➡️':''));
  }
 ,bubble_index: 3
 ,para: { row_max:11 }
 ,branch_list: [
    { key:'any', func:(e)=>{
let step;

if (/Arrow(Up|Down)/.test(e.code)) {
  let index = skybox_options.findIndex(v=>v==skybox_option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = skybox_options.length-1;
  }
  else if (index > skybox_options.length-1) {
    index = 0;
  }
  skybox_option_active = skybox_options[index];
}
else if (/Arrow(Left|Right)/.test(e.code)) {
  if (skybox_option_active == 'rotation_speed') {
    const v = (e.code == 'ArrowRight') ? 1 : -1;
    let speed_ini = F.dome_rotation_speed;
    F.dome_rotation_speed = THREE.Math.clamp(F.dome_rotation_speed+v, 0,16);
    if (!speed_ini) {
      if (F.dome_rotation_speed) {
        System._browser.on_animation_update.remove(rotate_dome,1);
        System._browser.on_animation_update.add(rotate_dome,0,1,-1);
      }
    }
    else {
      if (!F.dome_rotation_speed)
        System._browser.on_animation_update.remove(rotate_dome,1);
    }
  }
  else if (skybox_option_active == 'rotation_axis_angle') {
    const v = (e.code == 'ArrowRight') ? 5 : -5;
    F.dome_axis_angle = THREE.Math.clamp(F.dome_axis_angle+v, 0,360);
    if (!F.dome_rotation_speed) {
      const a = F.dome_axis_angle * Math.PI/180;
      MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.quaternion.copy(MMD_SA.TEMP_q.set(0,Math.sin(a),0, Math.cos(a)));
      if (!MMD_SA.THREEX.enabled) {
        MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.useQuaternion = true;
      }
      else {
        MMD_SA.THREEX.scene.backgroundRotation.y = MMD_SA.THREEX.scene.environmentRotation.y = a;
      }
    }
  }
}
else if (MMD_SA.THREEX.enabled && ((e.key == '+') || (e.key == '-'))) {
  const v = (e.key == '+') ? 0.01 : -0.01;
  MMD_SA.THREEX.scene.environmentIntensity = MMD_SA.THREEX.scene.backgroundIntensity = THREE.Math.clamp(MMD_SA.THREEX.scene.environmentIntensity+v, 0,1);
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null, panorama_branch, 0);

return true;
    } }
   ,{ key:1, event_id: {
        func: function () {
          remove_skybox();
          remove_HDRI();
        },
        goto_branch: panorama_branch
      }
    }
   ,{ key:2, branch_index:panorama_branch+1 }
   ,{ key:3, branch_index:panorama_branch+2 }
   ,{ key:4, branch_index:panorama_branch+3 }
   ,{ key:5, event_id: {
        func: function () { skybox_option_active = 'rotation_speed'; },
        goto_branch: panorama_branch
      },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.rotation_speed') + ((skybox_option_active=='rotation_speed')?' (' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.rotation_speed.tooltip')
);
      }
    }
   ,{ key:6, event_id: {
        func: function () { skybox_option_active = 'rotation_axis_angle'; },
        goto_branch: panorama_branch
      },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.rotation_axis_angle') + ((skybox_option_active=='rotation_axis_angle')?' (' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.press_to_change_value') + ')':'') + ':\n' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.rotation_axis_angle.tooltip')
);
      }
    }
/*
   ,{ key:7, event_id:{ func:()=>{
var url = 'https://skybox.blockadelabs.com/';
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
      }, goto_branch:done_branch }
    }
*/
   ,{ key:'X', is_closing_event:true, branch_index:done_branch }
  ]
            },
            next_step: {}
          },
          {
            func: function () {
if (MMD_SA.THREEX.enabled) MMD_SA_options.Dungeon.run_event();
            }
          },
          {
            func: function () {}
           ,message: {
  get content() {
return System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.HDRI').replace(/\<HDRI_mode\>/, System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.HDRI.mode.' + MMD_SA.THREEX.utils.HDRI.mode)).replace(/\<HDRI_light_intensity\>/, Math.round(MMD_SA.THREEX.scene.environmentIntensity*100));
  },
  index: 1,
  bubble_index: 3,
  para: { row_max:11 },
  branch_list: [
    { key:'A', event_id: {
        func: function () { change_HDRI(1); },
        goto_branch: panorama_branch
      }
    },
    { key:'B', event_id: {
        func: function () { change_HDRI(2); },
        goto_branch: panorama_branch
      }
    },
    { key:'C', event_id: {
        func: function () { change_HDRI(3); },
        goto_branch: panorama_branch
      }
    },
    { key:'D', event_id: {
        func: function () { change_HDRI(4); },
        goto_branch: panorama_branch
      }
    },
    { key:'E', event_id: {
        func: function () { change_HDRI(5); },
        goto_branch: panorama_branch
      }
    },
    { key:'F', event_id: {
        func: function () {
if (++MMD_SA.THREEX.utils.HDRI.mode > 2)
  MMD_SA.THREEX.utils.HDRI.mode = 0;

if (MMD_SA.THREEX.utils.HDRI.mode == 2) {
  const HDRI_path = MMD_SA.THREEX.utils.HDRI.path;
  if (MMD_SA.THREEX.utils.HDRI.path) {
    let HDRI_filename = HDRI_path.replace(/^.+[\/\\]/, '');
    let HDRI_index = ((HDRI_path != HDRI_filename) && (HDRI_list.indexOf(HDRI_filename)+1)) || null;
    if (HDRI_index)
      change_HDRI(HDRI_index);
  }
}
        },
        goto_branch: panorama_branch
      },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.HDRI.mode.tooltip')
);
      }
    },
    { key:'G', event_id: {
        func: function () {},
        goto_branch: panorama_branch
      },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.skybox.HDRI.light_intensity.tooltip')
);
      }
    },
    { key:'H', event_id:{ func:()=>{
var url = 'https://polyhaven.com/hdris';
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        },
        goto_branch: panorama_branch
      }
    }
  ],
            }
          },
        ];
      })()

     ,[
        {
          func: function () {
change_panorama(1);
          }
         ,goto_branch: panorama_branch
        }
      ]

     ,[
        {
          func: function () {
change_panorama(2);
          }
         ,goto_branch: panorama_branch
        }
      ]
// 15
     ,[
        {
          func: function () {
change_panorama(3);
          }
         ,goto_branch: panorama_branch
        }
      ]
// 16
     ,[]
// 17
     ,[]
// 18
     ,[
        {
          func: function () {
MMD_SA_options.Dungeon._3D_scene_builder_mode_ = true;

if (F._overlay_mode > -1)
  System._browser.overlay_mode = F._overlay_mode;
F._overlay_mode = -1;

DragDrop.onDrop_finish = onDrop_add_object3D;

add_grid();

Ldebug.style.transformOrigin = "0 0";
Ldebug.style.transform = "scale(1.5,1.5)";

window.removeEventListener('SA_keydown', adjust_object3D);
window.addEventListener('SA_keydown', adjust_object3D);
          }
         ,message: {
  get content() {
return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder').replace(/\<extra_model\>/, System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.' + ((MMD_SA.THREEX.enabled)?'THREEX':'MMD'))).replace(/\<F.explorer_mode\>/, (F.explorer_mode)?'ON':'OFF');
// return 'Drop a ' + ((MMD_SA.THREEX.enabled) ? 'GLB model, ' : 'zipped PMX model, ') + 'zipped .X model or image/video file as 3D object. Info about the active object is on the top left corner. Use keyboard for controls.\n1. Show keyboard controls\n2. Hide UI\n3. Export 3D scene JSON\n4. Explorer mode: ' + ((F.explorer_mode)?'ON':'OFF') + '\n5. Done';
  }
 ,para: { row_max:10 }
 ,bubble_index: 3
 ,get branch_list() { return [
    { key:1, event_id:[[
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.keyboard_controls.1'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, event_index:1 }
  ]
          }
        },
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.keyboard_controls.2').replace(/\<\F.explorer_mode>/, System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.keyboard_controls.2.' + ((F.explorer_mode)?'next':'back'))); }
 ,bubble_index: 3
 ,get branch_list() { return (F.explorer_mode) ? [
    { key:1, event_index:2 },
  ] : [
    { key:1, event_id:'_FACEMESH_OPTIONS_', branch_index:object3D_branch }
  ]; },
          }
        },
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.keyboard_controls.3'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, event_id:'_FACEMESH_OPTIONS_', branch_index:object3D_branch }
  ]
          }
        },
      ]]
    },
    { key:2, branch_index:object3D_branch+1 },
    { key:3, event_id:{
        func:()=>{
          DEBUG_show('(Scene export is removed from this build.)', 4);
        }
       ,goto_event: { id:"_FACEMESH_OPTIONS_", branch_index:object3D_branch }
      }
    },
    { key:4, branch_index:object3D_branch+2,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.explorer_mode.tooltip')
);
      }
    },
    { key:5, is_closing_event:true, func:()=>{MMD_SA_options.Dungeon._3D_scene_builder_mode_ = false}, branch_index:done_branch }
  ]; }
//  ].concat((F.explorer_mode) ? [] : [{ key:5, branch_index:done_branch }]); }
          }
        }
      ]
// 19
     ,[
        {
          func: function () {
if (0&& System._browser.overlay_mode == 0) {
  F._overlay_mode = 0;
  System._browser.overlay_mode = 1;
}

DEBUG_show();
DEBUG_show((F.object3d_list.length) ? (F.object3d_index+1) + ': ' + F.object3d_list[F.object3d_index].user_data.id : '(Drag and drop a 3D object file to begin.)');
          }
         ,message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.restore_UI'); }
 ,duration: 3
 ,bubble_index: 3
 ,branch_list: [
    { key:[1,'Esc'], branch_index:object3D_branch }
  ]
          }
        }
      ]

// 20-24
     ,...XR_Animator_buildUIEvents20to24(MMD_SA_options, {
        object3D_branch,
        done_branch,
        record_motion_branch,
        getExplorerMode: ()=>F.explorer_mode,
        setExplorerMode: (value)=>{ F.explorer_mode = value; },
        setUseAvatarAsCenter: (value)=>{ use_avatar_as_center = value; },
        object3d_list: F.object3d_list,
        object3d_cache,
        reset_scene_explorer,
        reset_scene_UI,
        explorer_ground_y: F.explorer_ground_y,
        build_octree,
        adjust_object3D,
        buildMiscOptionsMenuEvents: XR_Animator_buildMiscOptionsMenuEvents,
      })
// 25
     ,[
        {
          func: function () {
if (System._browser.camera.initialized) {
  if (!System._browser.camera.ML_warmed_up) {
    System._browser.on_animation_update.add(()=>{ MMD_SA.SpeechBubble.message(0, System._browser.translation.get('XR_Animator.UI.motion_capture.ML_on.record_motion.model_warming_up'), 4*1000); }, 0,0);
    MMD_SA_options.Dungeon.run_event(null,done_branch,0);
  }
  else {
    MMD_SA_options.Dungeon.run_event()
  }
}
else {
  System._browser.on_animation_update.add(()=>{ MMD_SA.SpeechBubble.message(0, System._browser.translation.get('XR_Animator.UI.motion_capture.ML_on.record_motion.choose_input'), 4*1000); }, 0,0);
  MMD_SA_options.Dungeon.run_event(null,done_branch,0);
}
          }
        },
        {
          func: function () {
System._browser.camera._info = System._browser.translation.get('XR_Animator.UI.motion_capture.ML_on.record_motion.choose_speed.info');
          }
         ,message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.motion_capture.ML_on.record_motion.choose_speed'); }
 ,bubble_index: 3
 ,branch_list: [
  { key:1, branch_index:record_motion_branch+1 },
  { key:2, branch_index:record_motion_branch+2 },
  { key:3, branch_index:record_motion_branch+3 },
  { key:4, is_closing_event:true, branch_index:done_branch }
  ]
          }
        }
      ]
// 26
     ,[
        {
          func: function () {
mirror_3D_off()
System._browser.camera.motion_recorder.speed = 1
System._browser.camera._info = ''
DEBUG_show('(Motion recording STARTED / x1 speed)', 3)
          }
         ,ended: true
        }
      ]
// 27
     ,[
        {
          func: function () {
mirror_3D_off()
System._browser.camera.motion_recorder.speed = 0.5
System._browser.camera._info = ''
DEBUG_show('(Motion recording STARTED / x0.5 speed)', 3)
          }
         ,ended: true
        }
      ]
// 28
     ,[
        {
          func: function () {
mirror_3D_off()
System._browser.camera.motion_recorder.speed = 0.25
System._browser.camera._info = ''
DEBUG_show('(Motion recording STARTED / x0.25 speed)', 3)
          }
         ,ended: true
        }
      ]


);
})();
