// item-base-part3.js — Item base entries: body_pix, snapshot, rec, options, social_distancing, laughing_man
// Extracted from animate.js
(function () {
  function XRA_dungeon() {
    return XRA_DungeonCompat();
  }

  function XRA_dungeonOptions() {
    return XRA_DungeonOptionsCompat();
  }

  function XRA_inventory() {
    return XRA_dungeon().inventory;
  }

  if (!XRA_dungeonOptions()) return;
  Object.assign(XRA_dungeonOptions().item_base, {
    "body_pix" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/selfie_segmentation_64x64.png'
 ,info_short: "Segmentation AI"
// ,is_base_inventory: true

// ,index_default: (is_mobile) ? undefined : 5

 ,stock_max: 1
 ,stock_default: 1

 ,action: {
    func: (function () {
      var initialized, loading;

      var script_list;

      function load_script(idx, onFinish) {
var src = script_list[idx]
var name = src.replace(/^.+[\/\\]/, "")

let script = document.createElement('script');
script.onload = () => {
  if (++idx >= script_list.length) {
    onFinish()
  }
  else {
    load_script(idx, onFinish)
  }
};
script.src = src;
document.head.appendChild(script);

var msg = '(Loading ' + name + ')'
console.log(msg)
DEBUG_show(msg, 3)
      };

      async function init() {
if (!initialized) {
  await new Promise((resolve, reject) => {
loading = true

script_list = [];
if (MMD_SA.WebXR.user_camera.bodyPix.use_bodySegmentation) {
  script_list.push(
    'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-segmentation'
  );
}
else {
  script_list.push(
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix'
  );
}

load_script(0, ()=>{
  loading = false
  initialized = true
  resolve();
});
  });
}

if (MMD_SA.WebXR.user_camera.bodyPix.enabled) {
  MMD_SA.WebXR.user_camera.bodyPix.enabled = false
  DEBUG_show("Selfie Segmentation AI:OFF", 2)
}
else {
  MMD_SA.WebXR.user_camera.bodyPix.enabled = true
  DEBUG_show("Selfie Segmentation AI:ON", 2)
}
      }

      return function (item) {
if (!MMD_SA.WebXR.user_camera.visible) {
  MMD_SA.SpeechBubble.message(0, System._browser.translation.get('XR_Animator.UI.segmentation_AI.no_input'), 3*1000);
  return true
}
if (MMD_SA.WebXR.user_camera.ML_enabled) {
  MMD_SA.SpeechBubble.message(0, System._browser.translation.get('XR_Animator.UI.segmentation_AI.mocap_on'), 5*1000);
  return true
}
if (System._browser.camera.hidden_enforced) {
  MMD_SA.SpeechBubble.message(0, System._browser.translation.get('XR_Animator.UI.segmentation_AI.camera_hidden'), 3*1000);
  return true;
}
if (loading) {
  DEBUG_show("(Selfie Segmentation AI still loading)", 2)
  return true
}

init()
      };
    })()
//   ,anytime: true
  }

 ,get info() {
    return System._browser.translation.get('XR_Animator.UI.segmentation_AI.info').replace(/\<enable\>/, System._browser.translation.get('XR_Animator.UI.segmentation_AI.' + ((MMD_SA.WebXR.user_camera.bodyPix.enabled)?'disable':'enable')));
  }
    }

   ,"snapshot" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/taking-a-selfie_64x64.png'
 ,info_short: "Snapshot"
// ,is_base_inventory: true

 ,index_default: undefined

 ,stock_max: 1
 ,stock_default: 0
 ,action: {
    func: function (item) {
MMD_SA.SpeechBubble.message(0, 'Snapshot feature has been removed.', 3*1000);
return true;
    }
   ,anytime: true
  }
    }

   ,"rec" : (()=>{
      function snapshot(e) {
if (System._browser.hotkeys.disabled) return;

const ev = e.detail.e;
if (ev.altKey || ev.ctrlKey || ev.shiftKey) return;
switch (ev.code) {
  case 'F12':
    MMD_SA.SpeechBubble.message(0, 'Snapshot feature has been removed.', 3*1000);
    break
  case 'F9':
    MMD_SA.SpeechBubble.message(0, 'Video capture feature has been removed.', 3*1000);
    break
  case 'F10':
    MMD_SA.SpeechBubble.message(0, 'Video capture feature has been removed.', 3*1000);
    break
  default:
    return;
}

e.detail.result.return_value = true;
      }

      window.addEventListener('MMDStarted', ()=>{
        window.addEventListener('SA_keydown', snapshot);
      });

      const rec = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/rec_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.media_recorder.info_short'); }
// ,is_base_inventory: true

 ,get index_default() { return (is_mobile) ? undefined : XRA_inventory().max_base+1; }

 ,stock_max: 1
 ,stock_default: 0

 ,action: {
    func: function (item) {
MMD_SA.SpeechBubble.message(0, 'Media recorder feature has been removed.', 3*1000);
return true;
    }
//   ,anytime: true
  }

 ,get info() { return System._browser.translation.get('XR_Animator.UI.media_recorder.info'); }
      };

      return rec;
    })()

   ,"XR_Animator_options" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/user-experience_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.UI_options.info_short');}
// ,is_base_inventory: true

 ,index_default: (is_mobile) ? 4 : 5

 ,stock_max: 1
 ,stock_default: 1

 ,action: {
    func: function (item) {
XRA_dungeon().events["_FACEMESH_OPTIONS_"][0]._show_other_options_=true;setTimeout(()=>{XRA_dungeon().events["_FACEMESH_OPTIONS_"][0]._show_other_options_=false},0);
XRA_runEvent("_FACEMESH_OPTIONS_",0);
    }
//   ,anytime: true
  }

 ,get info() { return System._browser.translation.get('XR_Animator.UI.UI_options.info');}
    }

   ,"VMC_protocol" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/vmpc_logo_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.VMC_protocol.info_short'); }
// ,is_base_inventory: true

 ,index_default: (is_mobile) ? undefined : 4
 ,stock_default: (is_mobile) ? 0 : 1

 ,stock_max: 1
 ,action: {
    func: function (item) {
if (!webkit_electron_mode || !MMD_SA.THREEX.enabled) {
  MMD_SA.SpeechBubble.message(0, System._browser.translation.get('XR_Animator.UI.VMC_protocol.not_supported'), 5*1000);
  return true;
}

XRA_runEvent("_VMC_PROTOCOL_",0);
    }
//   ,anytime: true
  }

 ,get info() { return System._browser.translation.get('XR_Animator.UI.VMC_protocol.info'); }
    }

   ,"air_blower": (function () {
      function air_blower_frame() {
if (MMD_SA.ammo_proxy && MMD_SA.ammo_proxy._timeStep) return// {DEBUG_show(Date.now()); return; }

const t = Date.now();
let windPower = ( Math.sin( t * Math.PI / 3 ) + 1 ) / 2;
windPower = 0.5 + windPower*0.5;

let _air_vector = air_vector;
if (!_air_vector) {
  _air_vector = get_direction();
}

let gravity = MMD_SA.TEMP_v3.fromArray(_air_vector).multiplyScalar(windPower);
//DEBUG_show(gravity.toArray(),0,1)

THREE.MMD.setGravity( gravity.x*9.8*10, gravity.y*9.8*10, gravity.z*9.8*10 )
      }

      function get_direction() {
const camera = MMD_SA._trackball_camera.object;
const phase = Math.floor((state-1)/2);
return MMD_SA.TEMP_v3.copy(camera.position).sub(camera._lookAt).normalize().multiplyScalar(2 * ((phase == 1) ? 1 : -1)).toArray();
      }

      let state = 0;
      let air_vector;
      let msg = '';
      var air_blower = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/hair-dryer_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.air_blower.info_short'); }
// ,is_base_inventory: true

 ,index_default: undefined

 ,stock_max: 1
 ,stock_default: 1
 ,action: {
    func: function () {
var phase = 1
if (++state <= 4) {

  if (state % 2) {
    air_vector = null;
    if (state == 1) {
      System._browser.on_animation_update.add(air_blower_frame, 0,phase,-1)
      msg = '🌬️Air blowing';
    }
    else {
      msg = '🌬️Air sucking';
    }
  }
  else {
    air_vector = get_direction();
    msg += '/fixed direction';
  }
  DEBUG_show('(' + msg + ')', 3);
}
else {
  System._browser.on_animation_update.remove(air_blower_frame,phase)
  DEBUG_show("(🌬️Air blower stopped)", 3)
  air_blower.reset()
}
    }
   ,anytime: true
  }
 ,reset: function () {
if (!MMD_SA.MMD_started || !state) return

state = 0
var gravity = MMD_SA.MMD.motionManager.para_SA.gravity || [0,-1,0]
THREE.MMD.setGravity( gravity[0]*9.8*10, gravity[1]*9.8*10, gravity[2]*9.8*10 )
  }

 ,get info() { return System._browser.translation.get('XR_Animator.UI.air_blower.info'); }
      };

      return air_blower;
    })()

   ,"social_distancing": (function () {
      var social_distancing_started;

      var v3a, v3b;
      window.addEventListener("jThree_ready", function () {
v3a = new THREE.Vector3()
v3b = new THREE.Vector3()
      });

      var social_distancing = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/coronavirus_social_distancing_64x64.png'
 ,info_short: "Social meter"
// ,is_base_inventory: true

   ,get index_default() { return (is_mobile) ? undefined : (XRA_inventory().max_base+XRA_inventory().max_base*(XRA_inventory().max_row-1))+2; }

 ,stock_max: 1
 ,stock_default: (MMD_SA_options.interaction_animation_disabled) ? 0 : 1//(is_mobile) ? 1 : 0
 ,action: {
    func: function (item) {
if (MMD_SA_options.interaction_animation_disabled)
  return true

var model_mesh = THREE.MMD.getModels()[0].mesh
if (!model_mesh.visible)
  return true

var d = XRA_dungeon()
if (d.event_mode && !social_distancing_started)
  return true

if (social_distancing_started) {
  if (MMD_SA.WebXR._circle_2m && MMD_SA.WebXR._circle_2m.visible) {
    d.run_event("circle_2m_hide")
    DEBUG_show("Social distancing:ON / Circle:OFF", 2)
  }
  else {
    item.reset()
    DEBUG_show("Social distancing:OFF", 2)
  }
  return false
}
//DEBUG_show(MMD_SA.MMD.motionManager.filename)

var dis = this._social_distance()

if (dis < 2)
  return true
if (!/standmix2_modified/.test(MMD_SA.MMD.motionManager.filename))
  return true
if (XRA_dungeonOptions().item_base.baseball._started)
  return true

social_distancing_started = true

d.run_event("circle_2m_show")

d._states.event_mode_locked = true

DEBUG_show("Social distancing:ON / Circle:ON", 2)

this._social_distance_check(999,999)
    }
   ,anytime: true

   ,_social_distance: function () {
return v3a.copy(MMD_SA.camera_position).setY(0).distanceTo(v3b.copy(THREE.MMD.getModels()[0].mesh.position).setY(0))/10 / MMD_SA.WebXR.zoom_scale;
    }

   ,_social_distance_check: function (min, max) {
var dis = this._social_distance()
//DEBUG_show(dis)
if ((dis > min) && (dis < max))
  return true

if (/surrender_v03/.test(MMD_SA.MMD.motionManager.filename)) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["surrender-R_v03"]]
}
else if (dis < 0.75) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["surrender_v03"]]
}
else if (dis < 2) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_照れる1"], MMD_SA_options.motion_index_by_name["emote-mod_照れる2"]]
}
else if (dis < 4) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_お辞儀1"], MMD_SA_options.motion_index_by_name["emote-mod_お辞儀2"], MMD_SA_options.motion_index_by_name["emote-mod_肯定する1"], MMD_SA_options.motion_index_by_name["emote-mod_肯定する2"]]
}
else if (dis < 6) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_歓迎する1"], MMD_SA_options.motion_index_by_name["emote-mod_歓迎する2"]]
}
else if (dis < 8) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_がっかり1"], MMD_SA_options.motion_index_by_name["emote-mod_がっかり2"], MMD_SA_options.motion_index_by_name["emote-mod_肩をすくめる1"], MMD_SA_options.motion_index_by_name["emote-mod_肩をすくめる2"]]
}
else {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_すねる1"], MMD_SA_options.motion_index_by_name["emote-mod_すねる2"], MMD_SA_options.motion_index_by_name["emote-mod_よろめく1"], MMD_SA_options.motion_index_by_name["emote-mod_よろめく2"]]
}

MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
    }
  }
 ,reset: function () {
if (!social_distancing_started)
  return
social_distancing_started = false

XRA_runEvent("circle_2m_hide")

XRA_dungeon()._states.event_mode_locked = false

MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["standmix2_modified"]]
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
  }

 ,get _started() { return social_distancing_started; }
      };

      return social_distancing;
    })()

   ,"menu": {
    get index_default() { return XRA_inventory().max_base + XRA_inventory().max_base*(XRA_inventory().max_row-1)*2 +1; }
    }

   ,"_map_": {
    get index_default() { return XRA_inventory().max_base + XRA_inventory().max_base*(XRA_inventory().max_row-1)*2 +2; }
    }

   ,"bag01": {
  info_short: 'Bag (AR)',
    get index_default() { return XRA_inventory().max_base; },
    }

  ,"bag02": {
  info_short: 'Bag (misc)',
    get index_default() { return XRA_inventory().max_base * XRA_inventory().max_row -1; },
    }


   ,"laughing_man" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/laughing_man_64x64.png'
 ,info_short: "Laughing Man"
// ,is_base_inventory: true
 ,stock_max: 1
 ,stock_default: 0//1
 ,action: {
    func: function (item) {
MMD_SA.SpeechBubble.message(0, 'Laughing Man feature has been removed.', 3*1000);
return true;
    }
   ,anytime: true
  }
    }


  });
})();
