(function () {
  'use strict';

  const XR_Animator_UIEvents20to24Bridge = {
    buildEvents(MMD_SA_options, context) {
      if (!MMD_SA_options || !context) {
        return [[], [], [], [], []];
      }

      const {
        object3D_branch,
        done_branch,
        record_motion_branch,
        getExplorerMode,
        setExplorerMode,
        setUseAvatarAsCenter,
        object3d_list,
        object3d_cache,
        reset_scene_explorer,
        reset_scene_UI,
        explorer_ground_y,
        build_octree,
        adjust_object3D,
        buildMiscOptionsMenuEvents,
      } = context;

      const dungeon = XRA_DungeonCompat();
      const dungeon_options = XRA_DungeonOptionsCompat();

      return [
// 20
     [
        {
          func: ()=>{
if (MMD_SA_options.interaction_animation_disabled) {
  speech_bubble2('(Explorer mode removed in this build.)', 4);
  XRA_runEvent("_FACEMESH_OPTIONS_", object3D_branch, 0);
  return;
}

if (getExplorerMode()) {
  reset_scene_explorer(true);

  MMD_SA.reset_camera(true);

  XRA_runEvent("_FACEMESH_OPTIONS_", object3D_branch, 0);
  return;
}

if (!MMD_SA.OSC.VMC.sender_enabled) {
  if (!object3d_cache.size) {
    speech_bubble2(System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.explorer_mode.no_object'), 5, { no_word_break:true });
    XRA_runEvent("_FACEMESH_OPTIONS_", object3D_branch, 0);
    return;
  }

  let obj_count = 0;
  for (const value of object3d_cache.values()) {
    if (!value) {
      speech_bubble2(System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.explorer_mode.still_loading'), 5);
      XRA_runEvent("_FACEMESH_OPTIONS_", object3D_branch, 0);
      return;
    }
    if (!value.parent_bone) obj_count++;
  }

  if (!obj_count) {
    speech_bubble2(System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.explorer_mode.no_explorable_object'), 5);
    XRA_runEvent("_FACEMESH_OPTIONS_", object3D_branch, 0);
    return;
  }
}

XRA_runEvent();
          }
        },
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.explorer_mode.confirm'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, event_index:2 },
    { key:[2,'Esc'], branch_index:object3D_branch }
  ]
          }
        },
        {
          func: function () {
reset_scene_UI();

setExplorerMode(true);
MMD_SA_options.user_camera.ML_models.look_at_screen = false;

setUseAvatarAsCenter(true);

System._browser.on_animation_update.add(()=>{XRA_runEvent()},2*30,1);
          },
          next_step:{}
        },
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.explorer_mode.starting'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:[1,'Esc'], event_index:3 },
  ]
          }
        },
        {
          func: function () {
object3d_list.forEach(object3d=>{
  build_octree(object3d);
});

window.addEventListener('SA_keydown', adjust_object3D);

dungeon._states.action_allowed_in_event_mode = true;
dungeon_options.character_movement_disabled = false;

dungeon_options.camera_position_z_sign = -1;
dungeon.update_camera_position_base();

const motion_list_index = (System._browser.camera.poseNet.enabled) ? 2 : 1;
if (MMD_SA.MMD.motionManager.para_SA._speed) {
  dungeon_options.item_base.pose._change_motion_(MMD_SA_options._XRA_pose_list[motion_list_index].findIndex(p=>p.name == MMD_SA.MMD.motionManager.filename), true);
}
dungeon_options.item_base.pose._change_motion_(MMD_SA_options._XRA_pose_list[motion_list_index].findIndex(p=>p.name == 'tsuna_standby'), true);

dungeon.para_by_grid_id[2].ground_y = explorer_ground_y;
          }
         ,goto_event: { id:"_FACEMESH_OPTIONS_", branch_index:object3D_branch }
        },
      ]

// 21
     ,[
        {
          message: {
  get content() { return 'XR Animator (v0.33.3)\n' + System._browser.translation.get('XR_Animator.UI.UI_options.about_XR_Animator.message'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, event_id: {
        func: function () {
var url = 'https://youtube.com/playlist?list=PLLpwhHMvOCSt3i7NQcyJq1fFhoMiSmm5H'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    }
   ,{ key:2, event_id: {
        func: function () {
var url = self._readme_url_ || 'https://github.com/ButzYung/SystemAnimatorOnline#readme'; //System.Gadget.path + '/readme.txt'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    }
   ,{ key:3, event_id: {
        func:()=>{
var url = 'https://github.com/ButzYung/SystemAnimatorOnline/releases'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    }
   ,{ key:4, event_id: {
        func:()=>{
var url = 'https://ko-fi.com/butzyung/shop'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    }
   ,{ key:5, event_index:1 }
   ,{ key:6, event_id: {
        func:()=>{
var url = 'https://github.com/ButzYung/SystemAnimatorOnline#contacts'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    }
   ,{ key:7, is_closing_event:true, event_index:99 }
  ]
          }
        },
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.about_XR_Animator.support') + ((0&&webkit_electron_mode) ? '\n3. 🟡Bitcoin\n4. Cancel' : '\n3. ' + System._browser.translation.get('Misc.cancel')); }
 ,bubble_index: 3
 ,get branch_list() { return [
    { key:1, event_id: {
        func:()=>{
var url = (System._browser.translation.language == 'ja') ? 'https://xra.fanbox.cc/' : 'https://ko-fi.com/butzyung';
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    },
    { key:2, event_id: {
        func:()=>{
var url = 'https://www.paypal.me/AnimeThemeGadgets'
if (webkit_electron_mode)
  webkit_electron_remote.shell.openExternal(url)
else
  window.open(url)
        }
       ,ended: true
      }
    }
  ].concat((0&&webkit_electron_mode) ? [
    { key:3, event_id: {
        func:()=>{
navigator.clipboard.writeText('1KkHVxgn4tusMhXNt1qFqSpiCiDRcqUh8p').then(()=>{
  speech_bubble2('The following BTC address has been copied to the clipboard. Thanks in advance for any amount you will be sending!🙏\n・1KkHVxgn4tusMhXNt1qFqSpiCiDRcqUh8p', 10, { scale:1, no_word_break:true });
});
        }
       ,ended: true
      }
    },
    { key:4, is_closing_event:true }
  ] : [
    { key:3, is_closing_event:true }
  ]); }
          },
          next_step: {}
        },
        {
          message: {
get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.about_XR_Animator.support.sponsor').replace(/\<list\>/, System._browser.translation.get('XR_Animator.UI.UI_options.about_XR_Animator.support.sponsor.list')); },
bubble_index: 3,
index: 1,
bubble_index: 3,
          }
        }
      ]
// 22
     ,[
        {
          message: {
            content: 'Motion export has been removed from this build.'
           ,duration: 4
          }
         ,ended: true
        }
      ]
// 23
     ,[
        ...buildMiscOptionsMenuEvents(MMD_SA_options),

      ]
// 24
     ,[
      ]
      ];
    }
  };

  window.XR_Animator_UIEvents20to24Bridge = XR_Animator_UIEvents20to24Bridge;
})();
