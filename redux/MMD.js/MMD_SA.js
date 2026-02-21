// MMD for System Animator
// (2025-02-22)

var use_full_spectrum = true

var MMD_SA_options

var MMD_SA = {
  initialized: false
 ,init: function () {
if (this.initialized)
  return
this.initialized = true

this.fadeout_canvas = document.createElement("canvas")
/*
this.fadeout_dummy = new Image()
this.fadeout_dummy.src = toFileProtocol(System.Gadget.path + '\\images\\laughing_man_134x120.png')
*/

var c_host = (returnBoolean("CSSTransform3DDisabledForContent")) ? document.getElementById("Lbody_host") : document.getElementById("Lbody")

MMD_SA.reset_gravity = function () {
  if (MMD_SA._gravity_)
    return

//  var gravity_default = MMD_SA.MMD.motionManager.para_SA.gravity || [0,-1,0]
  MMD_SA._gravity_ = MMD_SA.MMD.motionManager.para_SA.gravity_reset
  if (!MMD_SA._gravity_) {
    MMD_SA._gravity_ = [0,1,0]
//    MMD_SA._gravity_ = [0,0,0]
//    MMD_SA._gravity_[random(3)] = (Math.random() > 0.5) ? 2 : -2
  }
//DEBUG_show(MMD_SA._gravity_)

  MMD_SA._gravity_factor = 1
};

c_host.ondblclick = function (e) {
  if (!MMD_SA.use_jThree || MMD_SA_options.MMD_disabled || !MMD_SA.MMD_started)
    return

  if (MMD_SA_options.ondblclick && MMD_SA_options.ondblclick(e))
    return

  if (!MMD_SA_options.Dungeon || !MMD_SA_options.Dungeon.character.TPS_camera_lookAt_) {
    MMD_SA.reset_camera(true)
    DEBUG_show("(camera reset)", 2)
  }

  MMD_SA.reset_gravity()
};

var d = document.createElement("div")
var ds = d.style
d.id = "SL_Host_Parent"
ds.position = "absolute"
ds.left = ds.top = "0px"
ds.zIndex = 10
c_host.appendChild(d)

var d = document.createElement("div")
var ds = d.style
d.id = "SL_Host"
ds.position = "absolute"
ds.left = ds.top = "0px"
ds.zIndex = 2
SL_Host_Parent.appendChild(d)

if (MMD_SA_options.use_THREEX) {
  const c = document.createElement("canvas")
  c.id = "SLX"
  c.width  = self.EV_width  = MMD_SA_options.width
  c.height = self.EV_height = MMD_SA_options.height
  const cs = c.style
  cs.position = "absolute"
  cs.left = cs.top = "0px"
  cs.zIndex = 1
  SL_Host.appendChild(c)
}

var c = document.createElement("canvas")
c.id = "SL"
c.width  = self.EV_width  = MMD_SA_options.width
c.height = self.EV_height = MMD_SA_options.height
var cs = c.style
cs.position = "absolute"
cs.left = cs.top = "0px"
cs.zIndex = 1
SL_Host.appendChild(c)

if (this.use_jThree) {
  // SL was "overwritten" by some unknown reason. Use the following to restore it.
  self.SL = c

  c = document.createElement("canvas")
  c.id = "SL_2D_front"
  c.width  = MMD_SA_options.width
  c.height =  MMD_SA_options.height
  cs = c.style
  cs.position = "absolute"
  cs.left = cs.top = "0px"
  cs.zIndex = 2
  cs.display = "none"
  SL_Host.appendChild(c)

  if (use_WebGL_2D)
    WebGL_2D.createObject(SL_2D_front)

  if (use_MatrixRain) {
    this.matrix_rain = new MatrixRain(1024,1024, MMD_SA_options.MatrixRain_options);
    this.matrix_rain.matrixCreate()

    this.matrix_rain._SA_draw = function(skip_matrix) {
if (!this._SA_active)
  return

if (use_full_fps && !skip_matrix)
  skip_matrix = !EV_sync_update.frame_changed("matrixDraw")

this.matrixDraw(skip_matrix)
if (MMD_SA_options.MatrixRain_options && MMD_SA_options.MatrixRain_options.draw_bg)
  this.draw(MMD_SA_options.MatrixRain_options.draw_bg());
    };

    window.addEventListener("MMDStarted", function () {
      System._browser.on_animation_update.add(function () {
MMD_SA.matrix_rain._SA_draw()
      },0,0, -1);
    });

    DEBUG_show("Use Matrix rain", 2)
  }
}

SL_Host_Parent.style.width  = MMD_SA_options.width  + "px"
SL_Host_Parent.style.Height = MMD_SA_options.height + "px"

this.custom_action_index = (MMD_SA_options.custom_action.length) ? MMD_SA_options.motion.length : 0
for (var i = 0, len = MMD_SA_options.custom_action.length; i < len; i++) {
  var ca = MMD_SA_options.custom_action[i]
  var da = (typeof ca == 'string') ? MMD_SA.custom_action_default[ca] : ca

  var index = MMD_SA_options.motion.length
  da.action.motion_index = index
  MMD_SA_options.custom_action[i] = da.action
  MMD_SA_options.motion[index] = da.motion
  da.motion.jThree_para = { animation_check: da.animation_check || null }

  da.action.para_by_model_index = {}
  for (var j = 0, j_max = MMD_SA_options.model_para_obj_all.length; j < j_max; j++)
    da.action.para_by_model_index[j] = {}
}

MMD_SA_options.motion.forEach(function (motion) {
  if (motion.para_SA)
    MMD_SA_options.motion_para[motion.path.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "")] = motion.para_SA;
});

// media control START
SL._mouseout_timerID = null

SL._mouse_event_main = function () {
  if (MMD_SA_options.MMD_disabled && (DragDrop.relay_id != null)) {
    var cw = document.getElementById("Ichild_animation" + DragDrop.relay_id).contentWindow
    if (!cw.SL._mouse_event_main()) {
      if (SL_MC_video_obj) {
// prevent stack overflow when some functions in audio_onended may run SL._mouse_event_main again
        setTimeout(function () { Audio_BPM.vo.audio_onended() }, 0)
      }
      return false
    }

    if (!SL_MC_video_obj) {
// prevent stack overflow when some functions in SL_MC_Place may run SL._mouse_event_main again
      setTimeout(function () { SL_MC_Place() }, 0)
    }

    if (!SL._media_player) {
SL_MC_simple_mode = true

var m = cw.SL_MC_video_obj||cw.WMP.player.audio_obj
SL._media_player = {
  get muted()  {
    return m && m.muted
  }
 ,set muted(v) {
    if (m)
      cw.SL_MC_Sound()
  }

 ,get currentTime() {
    return (m && m.currentTime) || 0
  }
 ,set currentTime(v) {
    if (!m)
      return

    if (v == 0)
      cw.SL_MC_Stop()
    else {
      var t = m.currentTime
      if (v > t)
        cw.SL_MC_Forward()
      else
        cw.SL_MC_Backward()
    }
  }

 ,get paused() {
    return m && m.paused
  }

 ,get play() {
    return (m && cw.SL_MC_Play) || function () {}
  }
 ,get pause() {
    return (m && cw.SL_MC_Play) || function () {}
  }
}
    }
    SL_MC_video_obj = SL._media_player
  }

  if (SL_MC_video_obj && (MMD_SA.music_mode || System._browser.camera.media_control_enabled) || MMD_SA.motion_player_control.enabled) {
    if (SL._mouseout_timerID) {
      clearTimeout(SL._mouseout_timerID)
      SL._mouseout_timerID = null
    }
    return true
  }

  return false
}

var m = {}

Lbody_host.onmouseover = m.onmouseover = C_media_control.onmouseover = function () {
  if (!SL._mouse_event_main())
    return

  SL_Media_MouseEnter(SL_MC_video_obj)
}

Lbody_host.onmouseout = m.onmouseout = function () {
  if (!SL._mouse_event_main())
    return

  SL._mouseout_timerID = setTimeout('C_media_control.style.visibility="hidden"', ((returnBoolean("IgnoreMouseEventsPartial"))?2000:100))
}
// END

// audio — loaded from js/mmd/audio.js
var _audio_result = MMD_SA_initAudio();
var sender = _audio_result.sender;
var vo = _audio_result.vo;
// audio END (delegate)

/*
c = this.canvas_webgl = document.createElement("canvas")
c.id = "SL_WebGL"
c.width  = MMD_SA_options.width
c.height = MMD_SA_options.height
*/

Object.defineProperty(MMD_SA, "camera_auto_adjust_scale_enabled", {
  get: function () {
return MMD_SA_options.camera_auto_adjust && !THREE.MMD.getCameraMotion().length && (this.MMD.motionManager.para_SA.camera_auto_adjust !== false) && !this.MMD.motionManager.para_SA.use_mother_bone;
  }
});

Object.defineProperty(MMD_SA, "camera_auto_adjust_fov_enabled", {
  get: function () {
return MMD_SA_options.camera_auto_adjust && !THREE.MMD.getCameraMotion().length && ((this.MMD.motionManager.para_SA.camera_auto_adjust !== false) || this.MMD.motionManager.para_SA.camera_auto_adjust_fov);
  }
});

Object.defineProperty(MMD_SA, "camera_auto_adjust_scale",
{
  get: function () {
if (!this.camera_auto_adjust_scale_enabled) return 1;

const modelX = MMD_SA.THREEX.get_model(0);
let scale1 = modelX.para.left_leg_length / 10.569580078125;
let scale2 = modelX.para.spine_length / 4.97462;
if (((scale1 > 1) && (scale2 < 1)) || ((scale1 < 1) && (scale2 > 1))) return 1;

let scale = (scale1+scale2)/2;//(scale1 > 1) ? Math.min(scale1, scale2) : Math.max(scale1, scale2);//

const mod = 0.9;
const mod2 = 1 * ((scale < 1) ? Math.pow(scale, 0.25) : 1);

scale = (scale > 1) ? Math.max(scale*mod, 1) : Math.min(scale/mod, 1);
scale = 1 + (scale-1) * mod2;

return scale;
  }
});

Object.defineProperty(MMD_SA, "center_view_raw",
{
  get: function () {
if (MMD_SA_options.MMD_disabled)
  return [0,0,0];

var para_SA = this.MMD.motionManager.para_SA;
var cv = (para_SA.center_view || MMD_SA_options.center_view || [0,0,0]).slice();

if (MMD_SA_options.Dungeon && !MMD_SA.music_mode) {
  if (!para_SA.center_view_enforced)
    cv[2] = -cv[2];
}

let scale = this.camera_auto_adjust_scale;
if (scale != 1) {
  const c_base = MMD_SA._v3a_.fromArray(MMD_SA_options.camera_position_base).add(MMD_SA.TEMP_v3.fromArray(cv));
  c_base.multiplyScalar(scale);
  cv = c_base.sub(MMD_SA.TEMP_v3.fromArray(MMD_SA_options.camera_position_base)).toArray();
  cv[2] *= MMD_SA_options.Dungeon_options.camera_position_z_sign;
}
else if (MMD_SA_options.camera_auto_adjust && ((cv[1] == 0) || this.MMD.motionManager.para_SA.use_mother_bone)) {

  const modelX = MMD_SA.THREEX.get_model(0);
  let scale_offset = (modelX.para.hip_center.y + modelX.para.spine_length/2) - (11.364640235900879 + 4.97462/2);
  scale_offset *= 0.75;
  if (scale_offset < 0) scale_offset *= 0.85;
  cv[1] += scale_offset*0.5;

}

if (this.camera_auto_adjust_fov_enabled) {
// https://hofk.de/main/discourse.threejs/2022/CalculateCameraDistance/CalculateCameraDistance.html
// fov 50: 0.93261531630999718566001238959912
  let f_fov = 2 * Math.tan(Math.PI/180 * MMD_SA.THREEX.camera.obj.fov / 2);
  let fov_mod = 0.93261531630999718566001238959912/f_fov;
  fov_mod = 1 + (fov_mod-1) * 0.5;
  cz = MMD_SA_options.camera_position_base[2] * MMD_SA_options.Dungeon_options.camera_position_z_sign;
  cv[2] = ((cv[2] + cz) * fov_mod - cz);
}

return cv
  }
});

Object.defineProperty(MMD_SA, "center_view",
{
  get: function () {
let cv = this.center_view_raw;

if (MMD_SA_options.Dungeon && !MMD_SA.music_mode) {
  let c = MMD_SA_options.Dungeon.character
  let rot = c.rot//.clone()
//  if (c.mount_para && c.mount_para.mount_rotation) rot.add(MMD_SA.TEMP_v3.copy(c.mount_para.mount_rotation).multiplyScalar(Math.PI/180))
  cv = MMD_SA._v3a_.fromArray(cv).applyEuler(rot).toArray()
}

return cv
  }
});

Object.defineProperty(MMD_SA, "center_view_lookAt",
{
  get: function () {
if (MMD_SA_options.MMD_disabled)
  return [0,0,0];

var para_SA = this.MMD.motionManager.para_SA;
var center_view_lookAt = para_SA.center_view_lookAt || MMD_SA_options.center_view_lookAt;

let scale = this.camera_auto_adjust_scale;
if (!center_view_lookAt) {
  center_view_lookAt = this.center_view_raw.slice(0,2);
  center_view_lookAt.push(0)
}
else {
  if (scale != 1)
    center_view_lookAt = MMD_SA._v3a_.fromArray(center_view_lookAt).multiplyScalar(scale).toArray();
}

if (MMD_SA.center_view_lookAt_offset) {
  center_view_lookAt = center_view_lookAt.slice();
  for (var i = 0; i < 3; i++)
    center_view_lookAt[i] += MMD_SA.center_view_lookAt_offset[i] * scale;
}


if (MMD_SA_options.Dungeon && !MMD_SA.music_mode) {
  center_view_lookAt = MMD_SA._v3a_.fromArray(center_view_lookAt).applyEuler(MMD_SA_options.Dungeon.character.rot).toArray();
}

return center_view_lookAt
  }
});

if (this.use_jThree) {
// jThree START
this.motion_number_meter_index = MMD_SA_options.motion.length
for (var i = 0; i < 5; i++)
  MMD_SA_options.motion.push({path:'MMD.js/motion/motion_basic_pack01.zip#/_number_meter_' + (i+1) + '.vmd', jThree_para:{}, match:{skin_jThree:/^(\u5DE6)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369|.\u6307.)/}})
for (var i = 0; i < 5; i++)
  MMD_SA_options.motion.push({path:'MMD.js/motion/motion_basic_pack01.zip#/_number_meter_' + (i+1) + '.vmd', jThree_para:{}, match:{skin_jThree:/^(\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369|.\u6307.)/}})

var use_startup_screen = !!MMD_SA_options.startup_screen || (!MMD_SA_options.MMD_disabled && ((/AT_SystemAnimator_v0001\.gadget/.test(System.Gadget.path) && !SA_topmost_window.returnBoolean("AutoItStayOnDesktop") && !SA_topmost_window.returnBoolean('IgnoreMouseEvents')) || ((MMD_SA_options.Dungeon || (browser_native_mode && !webkit_window)) && (MMD_SA_options.startup_screen !== false))));
if (use_startup_screen) {
  if (!MMD_SA_options.startup_screen)
    MMD_SA_options.startup_screen = {}
}

if (browser_native_mode || MMD_SA_options.Dungeon || use_startup_screen) {
  Ldebug.style.posLeft = Ldebug.style.posTop = 40
  Ldebug.style.transformOrigin = "0 0"
  Ldebug.style.transform = "scale(3,3)"
  window.addEventListener("MMDStarted", function (e) {
    Ldebug.style.posLeft = Ldebug.style.posTop = 0
    Ldebug.style.transform = Ldebug.style.transformOrigin = ""
    if (MMD_SA_options.Dungeon && (!MMD_SA_options.WebXR || !MMD_SA_options.WebXR.AR)) {
      LdesktopBG.style.backgroundImage = ""
      LdesktopBG.style.backgroundColor = "black"
    }
  });
}

let init = async function () {
  await MMD_SA.THREEX.init()

  await MMD_SA.THREEX.GUI.init();

  if (MMD_SA._init_my_model) {
    MMD_SA._init_my_model()
    MMD_SA._init_my_model = null
  }
  Ldebug.style.cursor = "default";
  if (MMD_SA._click_to_reset) {
    Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
    MMD_SA._click_to_reset = null;
  }
  if (is_mobile) document.documentElement.requestFullscreen();

  MMD_SA.MME_init()
  MMD_SA.jThree_ready()

  resize()
};

if (use_startup_screen) {
  if (MMD_SA_options.startup_screen.init) {
    MMD_SA_options.startup_screen.init(async ()=>{ await init(); });
  }
  else {
const sb_func = async function () {
    let sb = document.createElement("div")
    sb.id = "LMMD_StartButton"
    sb.className = "StartButton"
//  sb.href="#"
    sb.addEventListener("click", async function () {
      if (MMD_SA_options.Dungeon_options && MMD_SA_options.Dungeon_options.multiplayer) {
        const mp = MMD_SA_options.Dungeon.multiplayer
        if (!mp.is_host && !mp.is_client) {
          if (!confirm("You are about to start without joining a game from other players, which means you will start in \"host\" mode. In this mode, you won't be able to join other players' games, but on the other hand, other players can join yours."))
            return
          ChatboxAT.SendData_ChatSend([System._browser.P2P_network.process_message('/host')])
        }
      }
//      sb.style.display = "none"
      document.body.removeChild(sb)

      await init();
    }, true);
    sb._msg_mouseover = sb._msg_mouseover_default = System._browser.translation.get('MMD.start').replace(/\<VRM\>/, ((MMD_SA_options.use_THREEX) ? '/VRM ' : ' '));
    sb.addEventListener("mouseover", function () {
      DEBUG_show(this._msg_mouseover, -1);
    }, true);
    sb.style.zIndex = 601
    sb.textContent = "START"
    document.body.appendChild(sb)

    let path, blob;
    if (webkit_electron_mode) {
      path = LABEL_LoadSettings("LABEL_3D_model_path", "");
      if (path && FSO_OBJ.FileExists(path)) {
        const response = await fetch(toFileProtocol(path));
        if (linux_mode) {
          blob = new Blob([await response.arrayBuffer()]);
        }
        else {
          blob = await response.blob();
        }
      }
    }
    else {
      const response = await SystemAnimator_caches.match(["/user-defined-local/my_model.zip", "/user-defined-local/my_model.vrm"], {});
      if (response) {
        blob = await response.blob();
//console.log(blob)
//console.log(response)
        path = response.statusText.split('|').find(v=>/\.(zip|vrm)$/i.test(v)) || 'my_model.zip';
      }
    }

    if (blob) {
      blob.name = path;
      blob.isFileSystem = true;
      await SA_DragDropEMU(blob);
    }

    if (returnBoolean("AutoItStayOnDesktop")) {
      sb.click();
    }

    if (!returnBoolean("AutoItStayOnDesktop")) {
      System._browser.on_animation_update.add(()=>{
        if (document.body.contains(sb)) {
          sb.click();
        }
      }, 1,0);
    }
};

if (!MMD_SA_options.Dungeon)
  sb_func()
else
  MMD_SA_options.Dungeon.multiplayer.init(sb_func)
  }
}
else {
  init()
}
// jThree END
}
  }


// custom modes START
 ,_music_mode_: false
 ,set music_mode(v) { this._music_mode_=!!v; }
 ,get music_mode() {
if (this._music_mode_) return true;

var mode
if (MMD_SA_options.MMD_disabled) {
  if (DragDrop.relay_id != null) {
    var w_obj = document.getElementById("Ichild_animation" + DragDrop.relay_id).contentWindow
    mode = w_obj.SL && w_obj.SL._mouse_event_main && w_obj.SL._mouse_event_main()
  }
  else {
    mode = !!(SL._media_player && SL._media_player.currentTime) || (self.AudioFFT && AudioFFT.use_live_input)
  }
}
else {
  mode = Audio_BPM.vo.BPM_mode || Audio_BPM.vo.motion_by_song_name_mode
}
return mode
  }

 ,get _busy_mode1_() {
return this._marker_runner_mode_ || (this._hit_legs_ || this._hit_head_)
  }
// END

 // Custom actions — loaded from js/mmd/custom-actions.js (match_bone, copy_first_bone_frame, get_parent_bone_list, custom_action_default)

 ,vmd_by_filename: {}

 ,fadeout_opacity: null

 // Motion control — loaded from js/mmd/motion-control.js (motion_shuffle, load_external_motion, seek_motion, motion_player_control)

// getter/setter on MMD_SA.meter_motion_disabled instead of MMD_SA_options.meter_motion_disabled for backward compatibility (PMD version)
 ,get meter_motion_disabled()  {
return (MMD_SA.music_mode || MMD_SA._busy_mode1_ || this.MMD.motionManager.para_SA.meter_motion_disabled || this._meter_motion_disabled || MMD_SA_options.meter_motion_disabled || (WallpaperEngine_CEF_mode && (MMD_SA_options.meter_motion_disabled == null)))
  }
 ,set meter_motion_disabled(b) { this._meter_motion_disabled = b; }

 ,_j3_obj_by_id: {}
 ,_debug_msg: []

 ,_rx: 0
 ,_ry: 0

 // MME shaders — loaded from js/mmd/mme-shaders.js (MME_PPE_*, MME_shader*, vshader_2d, fshader_2d, GOML_*)

// speech bubble — loaded from js/mmd/speech-bubble.js
 ,SpeechBubble: MMD_SA_createSpeechBubble()
// speech bubble END

// bone utils — loaded from js/mmd/bone-utils.js

 ,_camera_position_: null
 ,get camera_position() {
//jThree("#MMD_camera").three(0)===MMD_SA._trackball_camera.object
return this._camera_position_ || MMD_SA._trackball_camera.object.position;
  }

 ,gravity: [0,-1,0]

 ,_skin_interp_default: new Uint8Array([20,20,20,20,20,20,20,20, 107,107,107,107,107,107,107,107])

 ,_custom_morph: []
 ,_custom_skin: []

 ,playbackRate: 1
// ._playbackRate is basically for internal use only
 ,_playbackRate: 1


// Reserve extra slots for morph targets, just in case external loading of VMD motions is needed, which may have new morph animations
 ,morphTargets_length_extra: 10


// MME render pipeline — loaded from js/mmd/mme-render.js


// mirrors, depth render — loaded from js/mmd/mirrors.js


// tray menu — loaded from js/mmd/tray-menu.js
 ,tray_menu_func: MMD_SA_createTrayMenu()


 ,VMDSpectrum_EV_usage_PROCESS: function (obj, u, decay_factor) {
u /= 100
if (use_full_fps)
  decay_factor *= ((RAF_animation_frame_unlimited)?1:2)/EV_sync_update.count_to_10fps_

// decay control
if (Settings.ReverseAnimation) {
  if (u - decay_factor > obj.u_last)
    u = obj.u_last + decay_factor
}
else {
  if (u + decay_factor < obj.u_last)
    u = obj.u_last - decay_factor
}
obj.u_last = u

return u// * 100
  }

 ,VMDSpectrum_process: function (model, model_para) {
if (!model_para.VMDSpectrum_initialized) {
  model_para.VMDSpectrum_initialized = true

  if (!model_para.VMDSpectrum_band) {
    model_para.VMDSpectrum_band = []
    for (var m_name in model_para.morph_default) {
      if (/^band(\d+)$/.test(m_name))
        model_para.VMDSpectrum_band.push(parseInt(RegExp.$1))
    }
  }
  model_para._VMDSpectrum_decay = []
  model_para.VMDSpectrum_band.forEach(function (b) {
    model_para._VMDSpectrum_decay.push({})
  });
}

if (!MMD_SA.music_mode)
  return

model_para._custom_morph = []
model_para.VMDSpectrum_band.forEach(function (i, idx) {
  var v = 0
  model_para.VMDSpectrum_band16_to_band[i-1].forEach(function (band) {
    v += EV_usage_sub.sound_raw[band].usage_raw
  });
  var weight = MMD_SA.VMDSpectrum_EV_usage_PROCESS(model_para._VMDSpectrum_decay[idx], Math.min(v/model_para.VMDSpectrum_band16_to_band[i-1].length,100), 0.2)

  var m_name = "band" + i
  var _m_idx = model.pmx.morphs_index_by_name[m_name]
  var _m = model.pmx.morphs[_m_idx]
  model_para._custom_morph.push({ key:{ name:m_name, weight:weight, morph_type:_m.type, morph_index:_m_idx }, idx:model.morph.target_index_by_name[m_name] })
});
  }

// WebGL2 shader conversion — loaded from js/mmd/webgl2-convert.js

// shadowMap
 ,toggle_shadowMap: function (enabled) {
if (enabled == null)
  enabled = MMD_SA_options.use_shadowMap
else
  MMD_SA_options.use_shadowMap = enabled

enabled = !!enabled

var renderer = MMD_SA.renderer
renderer.shadowMapAutoUpdate = enabled;

//					renderer.shadowMapEnabled = true;
					//renderer.shadowMapType = THREE.BasicShadowMap;
					//renderer.shadowMapType = THREE.PCFShadowMap;
//					renderer.shadowMapType = THREE.PCFSoftShadowMap;
					//renderer.shadowMapCullFace = THREE.CullFaceBack;
//					renderer.shadowMapDebug = true;
// AT: cascaded shadow map
renderer.shadowMapCascade = MMD_SA_options.shadow_para.use_cascaded_shadow_map
//renderer.shadowMapDebug = true;

// http://learningthreejs.com/blog/2012/01/20/casting-shadows/
//var light_id = "#MMD_DirLight"//"#light_spo" //
//var light = jThree(light_id).three( 0 );

// http://www20.atpages.jp/katwat/three.js_r58/examples/mytest34/menu.html
// var lightParam = {length:40, angle:-30/180*Math.PI},

for (var i = 1, i_max = MMD_SA.light_list.length; i < i_max; i++) {
  var light = MMD_SA.light_list[i].obj
  if (light instanceof THREE.PointLight)
    continue

  light.castShadow = enabled;
  if (enabled && renderer.shadowMapCascade) {
    light.shadowCascade = true
    console.log("Use cascaded shadow map")
  }
//light.onlyShadow = true;
  for (var p in MMD_SA_options.shadow_para)
    light[p] = MMD_SA_options.shadow_para[p]
//light.shadowCameraVisible = true; // for debug

//setTimeout(function(){console.log(light)}, 3000)
}

THREE.MMD.getModels().forEach(function (model, idx) {
  var mesh = model.mesh

  var model_para = MMD_SA_options.model_para_obj_all[idx];
  var material_para = (model_para.material_para && model_para.material_para._default_) || {};

  var cs = !!mesh.castShadow
  var rs = !!mesh.receiveShadow
  mesh.castShadow    = enabled && ((material_para.castShadow != null)    ? !!material_para.castShadow : true);
  mesh.receiveShadow = enabled && ((material_para.receiveShadow != null) ? !!material_para.receiveShadow : model_para.is_object || !MMD_SA_options.ground_shadow_only);

  if (/*(cs != mesh.castShadow) || */(rs != mesh.receiveShadow)) {
    mesh.material.materials.forEach(function(m) {
      m.needsUpdate = true;
    });
  }
});

MMD_SA_options.x_object.forEach(function (x_object, idx) {
  var obj = x_object._obj
  var mesh = ((obj.children.length==1) && (obj.children[0].children.length==0) && obj.children[0]) || obj;

  var cs = !!mesh.castShadow
  var rs = !!mesh.receiveShadow
  obj.castShadow    = mesh.castShadow    = enabled && !!x_object.castShadow;
  obj.receiveShadow = mesh.receiveShadow = enabled && !!x_object.receiveShadow;

  if (/*(cs != mesh.castShadow) || */(rs != mesh.receiveShadow)) {
    mesh.material.materials.forEach(function (m) {
      m.needsUpdate = true;
    });
  }
});

window.dispatchEvent(new CustomEvent("SA_MMD_toggle_shadowMap"));

  }

 ,light_list: []

 ,MME_init: function () {
var MME_saved = MMD_SA_options.MME_saved[MMD_SA_options.model_para_obj._filename] || MMD_SA_options.MME_saved[MMD_SA_options.model_para_obj._filename_cleaned]
if (MME_saved) {
  MMD_SA_options.MME.self_overlay = Object.clone(MME_saved.self_overlay)
  MMD_SA_options.MME.HDR = Object.clone(MME_saved.HDR)
  MMD_SA_options.MME.serious_shader = Object.clone(MME_saved.serious_shader)
  MMD_SA_options.MME.SAO = Object.clone(MME_saved.SAO)
}

MMD_SA_options.MME.self_overlay = MMD_SA_options.MME.self_overlay || { enabled:false }
MMD_SA_options.MME.HDR = MMD_SA_options.MME.HDR || { enabled:false }
MMD_SA_options.MME.serious_shader = MMD_SA_options.MME.serious_shader || { enabled:false }
MMD_SA_options.MME.SAO = MMD_SA_options.MME.SAO || { disabled_by_material:[] }

MMD_SA_options.MME._self_overlay = Object.clone(MMD_SA_options.MME.self_overlay)
MMD_SA_options.MME._HDR = Object.clone(MMD_SA_options.MME.HDR)
MMD_SA_options.MME._serious_shader = Object.clone(MMD_SA_options.MME.serious_shader)
MMD_SA_options.MME._SAO = Object.clone(MMD_SA_options.MME.SAO)
//console.log(MMD_SA_options.MME)
  }

 ,ripple_process: MMD_SA_createRipple()


// WebXR — loaded from js/mmd/webxr.js
 ,WebXR: MMD_SA_createWebXR()


 ,load_texture: function (url) {
const THREE = MMD_SA.THREEX.THREE;

const canvas = document.createElement('canvas')
const texture = new THREE.Texture(canvas)

System._browser.load_file(toFileProtocol(url), async function (xhr) {
  const bitmap = await createImageBitmap(xhr.response)

  canvas.width  = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d').drawImage(bitmap, 0,0)
  texture.needsUpdate = true

  bitmap.close()
}, 'blob', true);

return texture;
  }

 ,BVHLoader: function () {
return System._browser.load_script(toFileProtocol(System.Gadget.path + ((localhost_mode || (webkit_electron_mode && /AT_SystemAnimator_v0001\.gadget/.test(System.Gadget.path))) ? '/_private/js/BVHLoader.js' : '/js/BVHLoader.min.js')));
  }

 ,VMD_FileWriter: function () {
return Promise.all([
  System._browser.load_script(toFileProtocol(System.Gadget.path + '/js/VMD_filewriter.js')),
  System._browser.load_script(toFileProtocol(System.Gadget.path + '/js/encoding.min.js'))
]);
  }

// Camera_MOD — loaded from js/mmd/camera-mod.js
 ,Camera_MOD: MMD_SA_createCameraMod()

 ,get_bounding_host: function (obj) {
// MMD model || X || THREEX model
return obj.geometry || ((obj.children.length==1) && (obj.children[0].children.length==0) && obj.children[0].geometry) || obj;
  }

 ,mouse_to_ray: function (mirrored, clamp_dimension) {
const use_screen_data = System._browser.use_screen_data;
const _cursor = (use_screen_data && System._browser._electron_cursor_pos) || { x:System._browser._WE_mouse_x, y:System._browser._WE_mouse_y };
const _window = (use_screen_data && System._browser._electron_window_pos?.slice(0)) || [Lbody_host.style.posLeft, Lbody_host.style.posTop];
if (is_SA_child_animation) {
  const ani = parent.SA_child_animation[SA_child_animation_id]
  _window[0] += ani.x
  _window[1] += ani.y
}

const y = (_cursor.y-_window[1])/B_content_height-0.5 - ((MMD_SA_options.camera_type == 'Ort')?0.5:0);
const _pos = new THREE.Vector3(((_cursor.x-_window[0])/B_content_width-0.5)*2, -(y)*2, 0.5);
if (clamp_dimension) {
  _pos.x = THREE.Math.clamp(_pos.x, -1,1);
  _pos.y = THREE.Math.clamp(_pos.y, -1,1);
}
//DEBUG_show(_pos.toArray().join('\n'))
const camera = MMD_SA._trackball_camera.object;
_pos.unproject(camera).sub(camera.position).normalize();

if (mirrored) {
  _pos.applyQuaternion(MMD_SA._q1.copy(camera.quaternion).conjugate());
  _pos.z *= -1;
  _pos.applyQuaternion(camera.quaternion);
}

_pos.multiplyScalar(100);
//DEBUG_show(_pos.toArray().join('\n'))
_pos.add(camera.position);

return _pos;
  }

// temp stuff
 ,_readVector_scale: 1
 ,_mouse_pos_3D: []

};


MMD_SA.init_my_model = function (zip_path, path_local) {
  var model_filename = path_local.replace(/^.+[\/\\]/, "")

  var _MME_v = {};
  ["_toFloat", "_EV_usage_PROCESS", "PostProcessingEffects"].forEach(function (p) {
    _MME_v[p] = MMD_SA_options.MME[p]
  });

  MMD_SA_options.model_path_default = MMD_SA_options.model_path = zip_path + "#/" + path_local

  var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx")
  var model_para_obj = MMD_SA_options.model_para_obj = Object.assign({}, MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || MMD_SA_options.model_para._default_ || {})
  model_para_obj._filename_raw = model_filename
  model_para_obj._filename = model_filename
  model_para_obj._filename_cleaned = model_filename_cleaned

  if (!model_para_obj.skin_default)
    model_para_obj.skin_default = { _is_empty:true }
// save some headaches and make sure that every VMD has morph (at least a dummy) in "Dungeon" mode
  if (!model_para_obj.morph_default) model_para_obj.morph_default = {}//{ _is_empty:!MMD_SA_options.Dungeon }//

  MMD_SA_options._MME = Object.clone(MMD_SA_options._MME_)
  if (Object.keys(MMD_SA_options._MME).length == 0) {
    MMD_SA_options._MME = {
      self_overlay: {
  enabled: 1
 ,opacity: 0.4
      }
     ,HDR: {
  enabled: 1
 ,opacity: 0.2
      }
     ,serious_shader: {
  enabled: 0
      }
    }
  }

//console.log(MMD_SA_options._MME)
//model_para_obj.skin_default = { "くちびる上_IK": { pos:{x:0, y:0.1, z:0} } }
//model_para_obj.morph_default = { "あ2": { weight:1 } }

// always use the default .character
  model_para_obj.character = MMD_SA_options.model_para_obj_all[0].character

  MMD_SA_options.model_para_obj_all[0] = MMD_SA_options.model_para_obj_by_filename[model_filename] = model_para_obj
  model_para_obj._model_index = 0
  for (var p in _MME_v) {
    MMD_SA_options.MME[p] = _MME_v[p];
  }
};


// Audio3D — loaded from js/mmd/sfx.js
MMD_SA.Audio3D = MMD_SA_createAudio3D();



// Sprite — loaded from js/mmd/sprite.js
MMD_SA.Sprite = MMD_SA_createSprite();

// CameraShake — loaded from js/mmd/camera-shake.js
MMD_SA.CameraShake = MMD_SA_createCameraShake();


MMD_SA.THREEX = (function () {

  function init() {
if (!threeX.enabled) {
  init_common();
  return;
}

data.scene = new THREE.Scene();
data.renderer = new THREE.WebGLRenderer({
  canvas: SLX,
  alpha: true,
  antialias: true,
  stencil: false,
  preserveDrawingBuffer: true
});

//data.renderer.outputColorSpace = THREE.SRGBColorSpace;//LinearSRGBColorSpace;//

data.renderer.setPixelRatio(window.devicePixelRatio);

GLTF_loader = new THREE.GLTFLoader();

if (MMD_SA_options.use_shadowMap) {
  data.renderer.shadowMap.enabled = true;
  data.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

if (THREE.OutlineEffect) {
  data.OutlineEffect = new THREE.OutlineEffect( data.renderer, {
defaultThickness: 0.001,
defaultColor: [ 0.25, 0.25, 0.25 ],
defaultAlpha: 0.5,
//defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
  });
}

init_common();

if (MMD_SA_options.MMD_disabled) return;

window.addEventListener("MMDStarted", ()=>{
  init_on_MMDStarted();
});

if (1) {
  MMD_SA.init_my_model(System.Gadget.path + '/jThree/model/DUMMY.zip', 'DUMMY_v01.pmx')
}

if (MMD_SA_options.THREEX_options.use_MMD) {
  MMD.init()
//F:\\MMD\\models\\Tda式初音ミク・アペンドVer1.00\\Tda式初音ミク・アペンド_Ver1.00.pmx
//F:\\MMD\\models\\--\\H35\\H35a11_v05.pmx
//F:\\MMD\\models\\YYB Hatsune Miku_NT\\YYB Hatsune Miku_NT_1.0ver.pmx
//F:\\MMD\\stages\\体育館\\体育館.pmx
  MMD.load((/\.pmx$/i.test(MMD_SA_options.THREEX_options.model_path) && MMD_SA_options.THREEX_options.model_path)||'F:\\MMD\\models\\--\\H35\\H35a11_v05.pmx', {
    pmx_index: 0,

    get_parent: function () {
      if (!MMD_SA.MMD_started) return null

      this.parent_data = _THREE.MMD.getModels()[0]
      return this.parent_data.mesh;
    },

    update: function () {}
  });
}
else {
  VRM.init()

  VRM.load(MMD_SA_options.THREEX_options.model_path, {
    vrm_index: 0,

    get_parent: function () {
      if (!MMD_SA.MMD_started) return null

      this.parent_data = _THREE.MMD.getModels()[0]
      return this.parent_data.mesh;
    },

    update: function () {}
  });
}
  }

  const init_common = (function () {
    var initialized;
    return function () {
if (initialized) return;
initialized = true;

const THREE = MMD_SA.THREEX.THREEX;

v1 = new THREE.Vector3();
v2 = new THREE.Vector3();
v3 = new THREE.Vector3();
v4 = new THREE.Vector3();

q1 = new THREE.Quaternion();
q2 = new THREE.Quaternion();
q3 = new THREE.Quaternion();
q4 = new THREE.Quaternion();

e1 = new THREE.Euler();
e2 = new THREE.Euler();
e3 = new THREE.Euler();
e4 = new THREE.Euler();

m1 = new THREE.Matrix4();
m2 = new THREE.Matrix4();
m3 = new THREE.Matrix4();
m4 = new THREE.Matrix4();

p1 = new THREE.Plane();
l1 = new THREE.Line3();

r1 = new THREE.Ray();

// 37.4224, 35
rot_arm_axis[ 1] = new THREE.Quaternion().setFromEuler(e1.set(0,0,37.4224/180*Math.PI));
rot_arm_axis[-1] = rot_arm_axis[ 1].clone().conjugate();

// 14.3594, 12.5
const shoulder_mod = (threeX.enabled) ? 0.5 : 1;
// convert_T_pose_rotation_to_A_pose
rot_shoulder_axis[0] = {};
rot_shoulder_axis[0][ 1] = new THREE.Quaternion().setFromEuler(e1.set(0,0,12.5*shoulder_mod/180*Math.PI));
rot_shoulder_axis[0][-1] = rot_shoulder_axis[0][ 1].clone().conjugate();
// convert_A_pose_rotation_to_T_pose
if (!rot_shoulder_axis[1]) {
  rot_shoulder_axis[1] = {};
  rot_shoulder_axis[1][ 1] = new THREE.Quaternion().setFromEuler(e1.set(0,0,12.5*shoulder_mod/180*Math.PI));
  rot_shoulder_axis[1][-1] = rot_shoulder_axis[1][ 1].clone().conjugate();
}
    };
  })();

  if (MMD_SA_options.MMD_disabled) {
    window.addEventListener('jThree_ready', ()=>{
MMD_SA.MMD = { motionManager: { para_SA:{} } };
    });
  }

  const init_on_MMDStarted = (function () {
    var initialized;
    return function () {
if (initialized) return;
initialized = true;

const THREE = MMD_SA.THREEX.THREEX;

_THREE.MMD.getModels().forEach((model,i)=>{
  var bones_by_name = model.mesh.bones_by_name
  var model_para = MMD_SA_options.model_para_obj_all[i]

  model_para._hip_pos = v1.fromArray(bones_by_name['上半身'].pmxBone.origin).add(v2.fromArray(bones_by_name['下半身'].pmxBone.origin)).multiplyScalar(0.5).toArray();
  model_para._hip_offset = {};
  model_para._hip_offset['センター'] = v1.fromArray(model_para._hip_pos).sub(v2.fromArray(bones_by_name['センター'].pmxBone.origin)).toArray();
  model_para._hip_offset['グルーブ'] = v1.fromArray(model_para._hip_pos).sub(v2.fromArray(bones_by_name['グルーブ'].pmxBone.origin)).toArray();
  model_para._hip_offset['腰'] = v1.fromArray(model_para._hip_pos).sub(v2.fromArray(bones_by_name['腰'].pmxBone.origin)).toArray();
});
    };
  })();

  const Model_obj = (function () {
    class Animation {
      #_enabled = false;

      #_mixer;

      clips = [];
      actions = [];

      get enabled() {
return this.#_enabled;
      }

      set enabled(v) {
this.#_enabled = !!v;

const THREE = MMD_SA.THREEX.THREE;

if (v) {
  this._motion_index = _THREE.MMD.getModels()[this.model.index].skin._motion_index;
  this.play();

  System._browser.on_animation_update.add(()=>{MMD_SA.motion_player_control.enabled = true;}, 0,1);
}
else {
  this.stop();
}
      }

      get mixer() {
const THREE = MMD_SA.THREEX.THREE;

if (!this.#_mixer) {
  this.#_mixer = new THREE.AnimationMixer(this.model.mesh);
}
return this.#_mixer;
      }

      get has_clip() { return this.clips.length; }

      get action() { return this.actions[this.action_index]; }

      get motion_index() {
return (this.enabled) ? this.action_index : _THREE.MMD.getModels()[this.model.index].skin._motion_index;
      }

      get time() {
return (this.enabled) ? this.action.time : _THREE.MMD.getModels()[this.model.index].skin.time;
      }

      get duration() {
return (this.enabled) ? this.action.getClip().duration : _THREE.MMD.getModels()[this.model.index].skin.duration;
      }

      add_clip(clip)  {
this.stop();

const action = this.mixer.clipAction( clip );
if (this.actions.indexOf(action) == -1) {
  this.action_index = this.actions.length;
  this.actions.push(action);
}
if (this.clips.indexOf(clip) == -1) this.clips.push(clip);

this.play();
      }

      action_index = -1;
      find_action_index(name) {
//this.mixer.existingAction(name)
return this.actions.findIndex(action=>action._clip.name==name);
      }

      play(index = this.action_index) {
if (index > -1) {
  this.action_index = index;
  this.actions[index].paused = false;
  this.actions[index].play();
}
      }

      pause(index = this.action_index) {
//  this.actions.forEach(action=>{ action.play(); });
if (index > -1) {
  this.action_index = index;
  this.actions[index].paused = true;
}
      }

      stop(index = this.action_index) {
if (index > -1) {
  this.actions[index].stop();
}
else {
  this.mixer.stopAllAction();
}
      }

      clear() {
var mixer = this.mixer;

mixer.stopAllAction();
this.action_index = -1;
this.clips.forEach(clip=>{ mixer.uncacheClip(clip); });
this.clips = [];
this.actions = [];
      }

      constructor(model) {
this.model = model;
      }
    }

    return function (index, model, para) {
this.index = this.index_default = index;

if (model)
  this.model = model;
if (para)
  this.para = para;

this.animation = new Animation(this);

/*
 define the following properties on each inherited class
.mesh
.is_T_pose
.use_tongue_out
.get_bone_by_MMD_name()
.update_model()
*/

models[index] = this
    };
  })();

  const MMD_dummy_obj = function (index) {
Model_obj.call(this, index);
  };

// three-vrm 1.0
  const use_VRM1 = !MMD_SA_options.THREEX_options || (MMD_SA_options.THREEX_options.use_VRM1 !== false);

  var GLTF_loader;

  Model_obj.prototype = {
    constructor: Model_obj,

    get model_scale() {
return this.mesh.scale.y;
    },

    get model_para() {
if (!threeX.enabled) return MMD_SA_options.model_para_obj_all[this.index];

return MMD_SA_options.THREEX_options.model_para[this.model_path.replace(/^.+[\/\\]/, '')] || {};
    },

    get model_path() {
if (!threeX.enabled) {
  return decodeURIComponent((MMD_SA.MMD_started) ? this.model.pmx.url : ((this.index == 0) ? MMD_SA_options.model_path : MMD_SA_options.model_path_extra[this.index-1]));
}

return decodeURIComponent((MMD_SA.MMD_started) ? this.para.url : ((this.index == 0) ? MMD_SA_options.THREEX_options.model_path : MMD_SA_options.THREEX_options.model_path_extra[this.index-1]));
    },

    para: (()=>{
      const handler = {
        get(obj, prop) {
return MMD_SA_options.model_para_obj[prop];
        },
      };

      return new Proxy({}, handler);
    })(),

    get_bone_origin_by_MMD_name: (()=>{
      let v1, v2;
      window.addEventListener('jThree_ready', ()=>{
v1 = new THREE.Vector3();
v2 = new THREE.Vector3();
      });

      return function (name, root_origin) {
if (threeX.enabled && !root_origin)
  return this.para.pos0[VRM.bone_map_MMD_to_VRM[name]]?.slice().map(v=>v*this.model_scale);

let b = (!threeX.enabled) ? this.get_bone_by_MMD_name(name) : _THREE.MMD.getModels()[0].mesh.bones_by_name[name];
if (!b) return null;
if (!root_origin) return b.pmxBone.origin;

v1.fromArray(b.pmxBone.origin);
while (b.parent?.pmxBone) {
  b = b.parent;
  v1.sub(v2.fromArray(b.pmxBone.origin));
}

return v1.toArray();
      };
    })(),

    get_bone_position_by_MMD_name: function (name, local_only) {
var bone = this.get_bone_by_MMD_name(name);
if (!bone) return null;

const is_MMD_dummy = (this.type=='MMD_dummy');
const bone_matrix = (is_MMD_dummy) ? bone.skinMatrix : bone.matrixWorld;

const pos = new THREE.Vector3().setFromMatrixPosition(bone_matrix);

if (local_only) {
  if (!is_MMD_dummy)
    pos.sub(this.mesh.position).applyQuaternion(q1.copy(this.mesh.quaternion).conjugate());
}
else {
  if (is_MMD_dummy)
    pos.applyQuaternion(this.mesh.quaternion).add(this.mesh.position);
}

return pos;
    },

    get_bone_rotation_by_MMD_name: (function () {
      var _m1, _q1;
      window.addEventListener('jThree_ready', ()=>{
const THREE = MMD_SA.THREEX.THREE;
_m1 = new THREE.Matrix4();
_q1 = new THREE.Quaternion();
      });

      return function (name, local_only) {
var bone = this.get_bone_by_MMD_name(name);
if (!bone) return null;

const is_MMD_dummy = (this.type=='MMD_dummy');
//if (parent_only) bone = bone.parent;
const bone_matrix = (is_MMD_dummy) ? bone.skinMatrix : bone.matrixWorld;

const rot = new THREE.Quaternion().setFromRotationMatrix(_m1.extractRotation(bone_matrix));
// multiply, instead of premultiply
if (!is_MMD_dummy && !this.is_VRM1) rot.multiply(_q1.set(0,-1,0,0));

if (local_only) {
  if (!is_MMD_dummy)
    rot.premultiply(_q1.copy(this.mesh.quaternion.conjugate()))
}
else {
  if (is_MMD_dummy)
    rot.premultiply(this.mesh.quaternion)
}

return rot;
      };
    })(),

    get_MMD_bone_parent: (function () {
const MMD_bone_tree = { name:'センター', children: [
  { name:'上半身', children: [
    { name:'上半身2', children: [
      { name:'上半身3', children: [
        { name:'首', children: [
          { name:'頭', children: [
            { name:'目', children: [
            ]},
          ]},
        ]},
        { name:'肩', children: [
          { name:'腕', children: [
            { name:'ひじ', children: [
              { name:'手首', children: [
                { name:'親指０', children: [
                  { name:'親指１', children: [
                    { name:'親指２', children: [
                    ]},
                  ]},
                ]},
                { name:'人指１', children: [
                  { name:'人指２', children: [
                    { name:'人指３', children: [
                    ]},
                  ]},
                ]},
                { name:'中指１', children: [
                  { name:'中指２', children: [
                    { name:'中指３', children: [
                    ]},
                  ]},
                ]},
                { name:'薬指１', children: [
                  { name:'薬指２', children: [
                    { name:'薬指３', children: [
                    ]},
                  ]},
                ]},
                { name:'小指１', children: [
                  { name:'小指２', children: [
                    { name:'小指３', children: [
                    ]},
                  ]},
                ]},
              ]},
            ]},
          ]},
        ]},
      ]},
    ]},
  ]},
  { name:'足', children: [
    { name:'ひざ', children: [
      { name:'足首', children: [
        { name:'足先EX', children: [
        ]},
      ]},
    ]},
  ]},
]};

function find_bone(name, tree=MMD_bone_tree, tree_parent) {
  if (name) {
    if (tree.name == name)
      return tree;
  }
  else {
    if (tree_parent)
      tree.parent = tree_parent;
  }

  for (const tree_child of tree.children) {
    const _tree = find_bone(name, tree_child, tree);
    if (_tree)
      return _tree;
  }
}

find_bone();

      return function (name) {
let dir = name.charAt(0);
if (dir == '左' || dir == '右') {
  name = name.substring(1, name.length);
}
else {
  dir = '';
}

let bone_parent = find_bone(name);

const b = this.mesh.bones_by_name;

do {
  bone_parent = bone_parent.parent;
}
while (bone_parent && !b[bone_parent.name] && !b[dir+bone_parent.name]);

// console.log(name, bone_parent && bone_parent.name, bone_parent && (b[bone_parent.name] || b[dir+bone_parent.name]))
return bone_parent && (b[bone_parent.name] || b[dir+bone_parent.name]);
      };
    })(),

    resetPhysics: function () {
if (threeX.enabled) {
//  if (this.type == 'VRM') {}
}
else {
  this.model.resetPhysics();
}
    },

    update_model: function () {}
  };

  MMD_dummy_obj.prototype = Object.create( Model_obj.prototype );

  Object.defineProperties(MMD_dummy_obj.prototype, {
    type: {
      value: 'MMD_dummy'
    },

    is_T_pose: {
      value: false
    },

    use_tongue_out: {
      get: function () { return (MMD_SA_options.model_para_obj.facemesh_morph['ぺろっ']?.name in this.model.pmx.morphs_index_by_name); },
    },

    model: {
      get: function () { return _THREE.MMD.getModels()[this.index]; }
    },

    mesh: {
      get: function () { return this.model.mesh; }
    },

    getBoneNode: {
      get: function () { return this.get_bone_by_MMD_name; }
    },

    get_bone_by_MMD_name: {
      value: function (name) { return this.mesh.bones_by_name[name]; }
    }
  });


// MMD START
  const MMD = (function () {

    function init() {
      if (THREE.MMDAnimationHelper) {
        data.MMDAnimationHelper = new THREE.MMDAnimationHelper();
        data.MMDAnimationHelper_clock = new THREE.Clock();
      }
    }

    function PMX_object(index, pmx, para) {
Model_obj.call(this, index, pmx, para);
this.mesh = pmx;

if (!MMD_SA.MMD_started)
  pmx_list.push(this)
    }

    PMX_object.prototype = Object.create( Model_obj.prototype );

    Object.defineProperties(PMX_object.prototype, {
      type: {
        value: 'PMX'
      },

      is_T_pose: {
        value: false
      },

      getBoneNode: {
        get: function () { return this.get_bone_by_MMD_name; }
      },

      get_bone_by_MMD_name : {
        value: function (name) {
return this.bones_by_name[name];
        }
      },

      update_model: {
        value: function () {
var mesh = this.mesh
//mesh.matrixAutoUpdate = false

// bone START

var mesh_MMD = _THREE.MMD.getModels()[0].mesh
var bones_by_name = mesh_MMD.bones_by_name

mesh.position.copy(mesh_MMD.position);
mesh.quaternion.copy(mesh_MMD.quaternion);

data.MMDAnimationHelper && data.MMDAnimationHelper.update(data.MMDAnimationHelper_clock.getDelta());
        }
      }
    });

    var pmx_list = [];

    return {
      get pmx_list() { return pmx_list; },
      set pmx_list(v) { pmx_list = v; },

      init: init,

      load: async function (url, para) {
MMD_SA.fn.load_length_extra++

var url_raw = url;
var model_filename = url.replace(/^.+[\/\\]/, '')

var object_url;
await new Promise((resolve) => {
  if (!/\.zip\#/i.test(url)) {
    url = toFileProtocol(url)
    resolve()
    return
  }

  System._browser.load_file(url, function(xhr) {
    object_url = url = URL.createObjectURL(xhr.response);
    resolve();
  }, 'blob', true);
});

const loader = new THREE.MMDLoader();

loader.loadWithAnimation(

  // URL of the PMX you want to load
  url,
System.Gadget.path + '/MMD.js/motion/demo/after_school_stride/after_school_stride.vmd',

  function ( mmd ) {
const mesh = mmd.mesh

data.MMDAnimationHelper && data.MMDAnimationHelper.add( mmd.mesh, { animation:mmd.animation, physics:false } );

if (MMD_SA_options.use_shadowMap) {
  mesh.castShadow = true
}

data.scene.add( mesh );
console.log(mesh)

var pmx_obj = new PMX_object(para.pmx_index, mesh, { url:url_raw });

var bones_by_name = {}
mesh.skeleton.bones.forEach(b=>{
  bones_by_name[b.name] = b;
});

pmx_obj.bones_by_name = bones_by_name;

var obj = Object.assign({
  data: pmx_obj,
  obj: mesh,
  get parent() { return this.get_parent(); },

  no_scale: true,
}, para);//, MMD_SA_options.THREEX_options.model_para[model_filename]||{});

obj_list.push(obj)

if (object_url) {
  URL.revokeObjectURL(object_url)
}

MMD_SA.fn.setupUI()

  },

  // called while loading is progressing
  (progress) => {},

  // called when loading has errors
  (error) => console.error(error)

);
      },

    };
  })();
// MMD END

// Shared state object for extracted THREEX sub-modules.
// Uses getter/setter pairs so sub-modules read/write the same closure vars.
  const TX = {};
  Object.defineProperties(TX, {
    THREE:   { get(){return THREE},  set(v){THREE=v},  enumerable:true },
    _THREE:  { get(){return _THREE}, set(v){_THREE=v}, enumerable:true },
    data:    { get(){return data},   enumerable:true },
    threeX:  { get(){return threeX}, enumerable:true },
    obj_list:{ get(){return obj_list},set(v){obj_list=v}, enumerable:true },
    models:  { get(){return models}, enumerable:true },
    models_dummy:{ get(){return models_dummy}, enumerable:true },
    v1:{get(){return v1},set(v){v1=v},enumerable:true},
    v2:{get(){return v2},set(v){v2=v},enumerable:true},
    v3:{get(){return v3},set(v){v3=v},enumerable:true},
    v4:{get(){return v4},set(v){v4=v},enumerable:true},
    q1:{get(){return q1},set(v){q1=v},enumerable:true},
    q2:{get(){return q2},set(v){q2=v},enumerable:true},
    q3:{get(){return q3},set(v){q3=v},enumerable:true},
    q4:{get(){return q4},set(v){q4=v},enumerable:true},
    e1:{get(){return e1},set(v){e1=v},enumerable:true},
    e2:{get(){return e2},set(v){e2=v},enumerable:true},
    e3:{get(){return e3},set(v){e3=v},enumerable:true},
    e4:{get(){return e4},set(v){e4=v},enumerable:true},
    m1:{get(){return m1},set(v){m1=v},enumerable:true},
    m2:{get(){return m2},set(v){m2=v},enumerable:true},
    m3:{get(){return m3},set(v){m3=v},enumerable:true},
    m4:{get(){return m4},set(v){m4=v},enumerable:true},
    p1:{get(){return p1},set(v){p1=v},enumerable:true},
    l1:{get(){return l1},set(v){l1=v},enumerable:true},
    r1:{get(){return r1},set(v){r1=v},enumerable:true},
    enabled: { get(){return enabled},set(v){enabled=v}, enumerable:true },
    loaded:  { get(){return loaded}, set(v){loaded=v},  enumerable:true },
    loading: { get(){return loading},set(v){loading=v},  enumerable:true },
    resolve_loading:{ get(){return resolve_loading},set(v){resolve_loading=v}, enumerable:true },
    GLTF_loader:{ get(){return GLTF_loader},set(v){GLTF_loader=v}, enumerable:true },
    use_OutlineEffect:{ get(){return use_OutlineEffect},set(v){use_OutlineEffect=v}, enumerable:true },
    rot_arm_axis:{ get(){return rot_arm_axis}, enumerable:true },
    rot_shoulder_axis:{ get(){return rot_shoulder_axis}, enumerable:true },
  });
  TX.use_VRM1 = use_VRM1;
  TX.Model_obj = Model_obj;
  TX.MMD = MMD;
  TX.MMD_dummy_obj = MMD_dummy_obj;
  TX.init_common = init_common;
  TX.init_on_MMDStarted = init_on_MMDStarted;

// VRM — loaded from js/mmd/threex-vrm.js
  const VRM = MMD_SA_createTHREEX_VRM(TX);


  var enabled = true;
  var loaded, loading, resolve_loading;

  var THREE, _THREE;
  var data = {};
  var obj_list = [];
  var models = [];
  var models_dummy = [];

  var v1, v2, v3, v4;
  var q1, q2, q3, q4;
  var e1, e2, e3, e4;
  var m1, m2, m3, m4;

  var p1, p2;
  var l1, l2;
  var r1;

  var rot_arm_axis = {};
  var rot_shoulder_axis = {};

  var use_OutlineEffect;

  var threeX  = {

    three_filename: (webkit_electron_mode) ? 'three.module.js' : 'three.module.min.js',

    data: data,

    get v1(){return v1},get v2(){return v2},get v3(){return v3},get v4(){return v4},
    get q1(){return q1},get q2(){return q2},get q3(){return q3},get q4(){return q4},
    get e1(){return e1},get e2(){return e2},get e3(){return e3},get e4(){return e4},
    get m1(){return m1},get m2(){return m2},get m3(){return m3},get m4(){return m4},

    get p1(){return p1},
    get l1(){return l1},

    get r1(){return r1},

    get enabled() { return MMD_SA_options.use_THREEX && enabled; },
    set enabled(v) {
if (!MMD_SA_options.use_THREEX) return;
enabled = !!v;
// save some headaches to not change SL's visibility here as other features (e.g. mouse events) may require it to be visible
//SL.style.visibility  = (!enabled) ? 'inherit' : 'hidden'
SLX.style.visibility = ( enabled) ? 'inherit' : 'hidden';
    },

    get THREE() { return (this.enabled) ? THREE : self.THREE; },

    get _THREE() { return (this.enabled) ? _THREE : self.THREE; },

    get THREEX() { return THREE; },

    get obj_list() { return obj_list; },
    set obj_list(v) { obj_list = v; },

    get SL() { return document.getElementById((this.enabled) ? "SLX" : "SL"); },

    get scene() { return (this.enabled) ? data.scene : MMD_SA.scene; },

    get use_VRM1() { return use_VRM1; },

    get use_sRGBEncoding() { return use_VRM1; },

    get use_OutlineEffect() { return data.OutlineEffect && (use_OutlineEffect || VRM.use_OutlineEffect); },
    set use_OutlineEffect(v) { use_OutlineEffect = v; },

    get _rot_shoulder_axis() { return rot_shoulder_axis; },

    get models() { return models; },
    get models_dummy() { return models_dummy; },

    get_model: function (index) { return models[index]; },

    rot_arm_axis: rot_arm_axis,

    MMD_dummy_obj: MMD_dummy_obj,

    init: function () {
// common init START
THREE = _THREE = self.THREE;

for (let i = 0; i < MMD_SA_options.model_path_extra.length+1; i++) {
  models_dummy[i] = models[i] = new MMD_dummy_obj(i);
}
// common init END

if (loaded) {
  init();
  return Promise.resolve();
}

if (!MMD_SA_options.MMD_disabled) {
  if ((MMD_SA_options.model_path != MMD_SA_options.model_path_default) || (!MMD_SA_options.THREEX_options.model_path && !MMD_SA_options.THREEX_options.enabled_by_default)) {
    this.enabled = false;
  }

  if (!this.enabled) {
    return (MMD_SA_options.Dungeon_options && MMD_SA_options.Dungeon.use_octree) ? this.utils.load_octree() : Promise.resolve();
  }

  if (!MMD_SA_options.THREEX_options.model_path) {
    MMD_SA_options.THREEX_options.model_path = System.Gadget.path + '/three.js/model/AliciaSolid.zip#/AliciaSolid.vrm'
    MMD_SA_options.THREEX_options.model_para['AliciaSolid.vrm'] = Object.assign(MMD_SA_options.THREEX_options.model_para['AliciaSolid.vrm']||{}, {
      icon_path: 'icon_v01.jpg'
    });
  }
}

DEBUG_show('Loading THREEX...')

if (!loading) {
  MMD_SA.THREEX.load_scripts()
}

return new Promise((resolve)=>{
  resolve_loading = function () {
    init()
    resolve()
  };
});
    },

    PPE: MMD_SA_createTHREEX_PPE(TX),


    mesh_obj: (function () {
      function mesh_obj(id, obj) {
this.id = id
this._obj = obj

mesh_obj_by_id[id] = this
      }

      mesh_obj.prototype.three = function () {
return this._obj;
      };

      mesh_obj.prototype.show = function () {
this._obj.visible = true;
if (!threeX.enabled) {
  this._obj.traverse(c=>{
    if (c.isMesh) c.visible = true;
  });
}
      };

      mesh_obj.prototype.hide = function () {
this._obj.visible = false;
if (!threeX.enabled) {
  this._obj.traverse(c=>{
    if (c.isMesh) c.visible = false;
  });
}
      };

      const mesh_obj_by_id = {};

      let mesh_obj_list = [];

      window.addEventListener("jThree_ready", () => {
const THREE = threeX.THREE;

const img_dummy = (MMD_SA.THREEX.enabled) ? null : document.createElement('canvas');
if (!MMD_SA.THREEX.enabled) img_dummy.width = img_dummy.height = 1;

MMD_SA_options.x_object.forEach((x_obj, idx) => {
  if (!x_obj.path) return

// separating url and toFileProtocol(url) here, but x_obj.path is almost always a zip url, so they are effectively the same anyways (i.e. not a blob url)
  const url = x_obj.path;
  new THREE.XLoader( toFileProtocol(url), function( mesh ) {
var model_filename = toLocalPath(url).replace(/^.+[\/\\]/, "")
var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.x$/, ".x").replace(/[\-\_]v\d+\.x$/, ".x")
var model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || {}

const _mesh = mesh;
mesh = new THREE.Object3D()
mesh.add(_mesh)
//console.log(mesh)

let material_para = model_para.material_para || {}
material_para = material_para._default_ || {}
if (material_para.receiveShadow != false)
  mesh.receiveShadow = true

if (MMD_SA.THREEX.enabled) {
}
else {
  if (model_para.instanced_drawing)
    mesh.instanced_drawing = model_para.instanced_drawing
//  mesh.instanced_drawing = 99

  mesh.useQuaternion = true
}

threeX.mesh_obj.set("x_object" + idx, mesh)

mesh.scale.set(0,0,0)

//console.log(mesh)
MMD_SA.fn.setupUI()
  }, function() {
  });
});

MMD_SA.GOML_head_list.sort((...ab)=>{
  const score = [];
  ab.forEach((obj,i)=>{
    switch (obj.tag) {
      case 'txr':
        score[i] = -3;
        break;
      case 'geo':
        score[i] = -2;
        break;
      default:
        score[1] = 0;
    }
  });

  return score[0] - score[1];
});

var mtl_id_used = {};

MMD_SA.GOML_head_list.forEach(obj=>{
  if (obj.tag == 'txr') {
// { tag:'txr', id:'DungeonPlane'+i+'TXR', src:p_obj.map, para:{ repeat:[1,1] } }
    const tex = new THREE.Texture(img_dummy);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    if (obj.para.repeat) tex.repeat.set(...obj.para.repeat);
    if (MMD_SA.THREEX.enabled) tex.colorSpace = THREE.SRGBColorSpace;

    const img = new Image();
    img.onload = ()=>{
      tex.image = img;
      tex.needsUpdate = true;
      MMD_SA.fn.setupUI();
    };
    img.src = toFileProtocol(obj.src);

    threeX.mesh_obj.set(obj.id, tex, true);
  }
  else if (obj.tag == 'geo') {
// { tag:'geo', id:'DungeonGEO_' + (geo), type:'Plane', para:[1,1, parseInt(RegExp.$1),parseInt(RegExp.$2)] }
    const geo = new THREE[obj.type + 'Geometry'](...obj.para);
    threeX.mesh_obj.set(obj.id, geo, true);
    MMD_SA.fn.setupUI();
  }
  else if (obj.tag == 'mtl') {
// { tag:'mtl', id:'DungeonPlane'+i+'MTL', type:'MeshPhong', para:mtl_param_common, para_extra:mtl_param_common_extra }
/*
  var mtl_param_common = {};
  if (p_obj.opacity == null) mtl_param_common.transparent = false;
//'renderOrder' : 'renderDepth'
  if (p_obj.renderDepth != null) mtl_param_common.renderDepth = p_obj.renderDepth;
  if (p_obj.side) mtl_param_common.side = p_obj.side;
  if (p_obj.map) mtl_param_common.map = 'DungeonPlane'+p_obj.map_id+'TXR';
  if (p_obj.normalMap) mtl_param_common.normalMap = 'DungeonPlane'+p_obj.normalMap_id+'TXR_N';
//'color' : 'ambient'
  if (p_obj.ambient) mtl_param_common.ambient = p_obj.ambient;
  if (p_obj.specularMap) {
    mtl_param_common.specularMap = 'DungeonPlane'+p_obj.specularMap_id+'TXR_S';
    mtl_param_common.specular = '#FFFFFF';
  }
  else {
    if (p_obj.specular) mtl_param_common.specular = p_obj.specular;
  }
  if (p_obj.emissive) mtl_param_common.emissive = p_obj.emissive;
*/
    const mtl = new THREE[obj.type + 'Material']();

    if (MMD_SA.THREEX.enabled) {
      if (obj.renderDepth) {
        obj.renderOrder = obj.renderDepth;
        delete obj.renderDepth;
      }
      if (obj.ambient) {
        obj.color = obj.ambient;
        delete obj.ambient;
      }
    }

    const mtl_id_used_count = mtl_id_used[obj.id]||0;
    mtl_id_used[obj.id] = mtl_id_used_count + 1;

    for (const map of ['map', 'normalMap', 'specularMap', 'displacementMap']) {
      if (obj.para[map])
        obj.para[map] = threeX.mesh_obj.get_three(obj.para[map]);
// a workaround for material.repeat trick in old THREE
      if (!MMD_SA.THREEX.enabled && (map == 'map') && (mtl_id_used_count > 0)) {
console.log('THREEX: Texture cloned (' + obj.id + '.' + map + ')');
        obj.para[map] = obj.para[map].clone();
      }
//if (map != 'map') delete obj.para[map];
    }

    for (const color of ['color', 'ambient', 'specular', 'emissive']) {
      if (obj.para[color]) {
        if (mtl[color] != null) {
          obj.para[color] = mtl[color].set(obj.para[color]);
        }
        else {
console.error('THREEX error: No .' + color + ' in material');
          delete obj.para[color];
        }
      }
    }

    Object.assign(mtl, obj.para, obj.para_extra);

    threeX.mesh_obj.set(obj.id, mtl, true);
    MMD_SA.fn.setupUI();
  }
});

MMD_SA.GOML_scene_list.forEach(obj=>{
  if (obj.tag == 'mesh') {
// { tag:'mesh', id:'DungeonPlane'+i+'MESH_LV'+lvl, geo:'DungeonGEO_'+geo_id, mtl:'DungeonPlane'+i+'MTL' + ((p_obj.displacementMap && (geo_id != "1x1"))?'_D':''), instanced_drawing:instanced_drawing||null, style:{ scale:0, opacity:p_obj.opacity||null } }
    const mesh = new THREE.Mesh();
    mesh.geometry = threeX.mesh_obj.get_three(obj.geo);
    mesh.material = threeX.mesh_obj.get_three(obj.mtl);
    if (obj.instanced_drawing && !MMD_SA.THREEX.enabled)
      mesh.instanced_drawing = obj.instanced_drawing;
    if (obj.style.scale != null)
      mesh.scale.setScalar(obj.style.scale);
    if (obj.style.opacity != null)
      mesh.opacity = obj.style.opacity;

    threeX.mesh_obj.set(obj.id, mesh);
  }
});
      });

      let scene_obj_waiting_list = [];

      window.addEventListener("GOML_ready", () => {
scene_obj_waiting_list.forEach(obj=>{
  threeX.scene.add(obj);
  obj.visible = false;
});
scene_obj_waiting_list.length = 0;

MMD_SA_options.mesh_obj_preload_list.forEach(obj => {
  threeX.mesh_obj.set(obj.id, obj.create())
});
      });

      return {
get: function (id) {
  id = id.replace(/^\#/, '');
  return mesh_obj_by_id[id] || jThree('#' + id);
},

get_three: function (id) {
  return this.get(id).three(0);
},

set: function (id, obj, skip_scene) {
  new mesh_obj(id, obj)

  if (!skip_scene) {
    if (threeX.scene) {
      threeX.scene.add(obj)
      obj.visible = false
    }
    else {
      scene_obj_waiting_list.push(obj);
    }
  }

  return obj
}
      };
    })(),

    renderer: (function () {
      var _device_framebuffer = null;

      window.addEventListener('jThree_ready', function () {
// a "hack" to set default framebuffer for WebXR
if (threeX.enabled) {
  const state = threeX.renderer.obj.state;
  state._bindFramebuffer = state.bindFramebuffer;
  state.bindFramebuffer = function ( target, framebuffer ) {
    return this._bindFramebuffer( target, (framebuffer === null) ? _device_framebuffer : framebuffer );
  };
}
      });

      window.addEventListener('MMDStarted', ()=>{
Object.defineProperty(MMD_SA._trackball_camera.object, 'fov', (()=>{
  let fov = MMD_SA._trackball_camera.object.fov;
  return {
    get: function () { return fov; },
    set: function (v) {
      if (fov != v)
        window.dispatchEvent(new CustomEvent('SA_MMD_camera_FOV_on_change'));
      fov = v;
    }
  };
})());
      });

      return {
        get obj() { return (threeX.enabled) ? data.renderer : MMD_SA._renderer; },

// device framebuffer (mainly for WebXR)
        get device_framebuffer() { return _device_framebuffer; },
        set device_framebuffer(fb) {
if (fb != _device_framebuffer) {
  _device_framebuffer = fb;
  const _gl = this.obj.getContext();
  if (threeX.enabled) {
    this.obj.state.bindFramebuffer(_gl.FRAMEBUFFER, fb);
  }
  else {
    _gl.bindFramebuffer(_gl.FRAMEBUFFER, fb);
  }
}
        },

        get devicePixelRatio() { return (threeX.enabled) ? this.obj.getPixelRatio() : this.obj.devicePixelRatio; },
        set devicePixelRatio(v) {
if (!threeX.enabled) {
  this.obj.devicePixelRatio = v;
}
else {
  this.obj.setPixelRatio(v);
}
        },

        setSize: function (width, height) {
MMD_SA._renderer.setSize(width, height);
threeX.enabled && this.obj.setSize(width, height);
        },

        render: function (scene, camera) {
if (!threeX.enabled) return false

threeX.camera.update(camera)

var lights = scene.__lights
lights.forEach(light=>{
  threeX.light.update(light)
});

obj_list.forEach((obj) => {
  var mesh = obj.obj
  var p = obj.parent
  if (!p) {
    mesh.visible = false
    return
  }

  mesh.position.copy(p.position)
  mesh.quaternion.copy(p.quaternion)
  if (!obj.no_scale)
    mesh.scale.copy(p.scale)
  mesh.visible = p.visible

  obj.update && obj.update()
});

if (MMD_SA.MMD_started) {
  _THREE.MMD.getModels().forEach((m,idx)=>{
    var mesh = m.mesh

// if mesh.matrixAutoUpdate is true, update the model matrixWorld here (AFTER the default routine of MMD mesh matrixWorld update)
    if (mesh.matrixAutoUpdate) {
      MMD_SA.THREEX.get_model(idx).update_model();
    }

// MMD physics (.simulate()) has been skipped. Do the necessary stuff here.
    if (mesh._reset_rigid_body_physics_ > 0) {
      mesh._reset_rigid_body_physics_ = Math.max(mesh._reset_rigid_body_physics_ - Math.min(RAF_timestamp_delta/1000*30, 1), 0)
    }

    m.simulateCallback && m.simulateCallback();
  });
}

if (!System._browser.rendering_check()) return true;

let obj_hidden_list = [];
if (MMD_SA.hide_3D_avatar) {
  const obj_check_list = [models[0].mesh];
  if (MMD_SA_options.Dungeon) {
    obj_check_list.push(MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj);
    if (MMD_SA.THREEX._object3d_list_ && !MMD_SA.THREEX._XR_Animator_scene_?.settings?.avatar_replacement_mode)
      obj_check_list.push(...MMD_SA.THREEX._object3d_list_.map(obj=>obj._obj));
  }
  obj_check_list.forEach(obj=>{
    if (obj.visible) {
      obj.visible = false;
      obj_hidden_list.push(obj);
    }
  });
}

if (threeX.use_OutlineEffect) {
//  data.renderer.autoClear = true
  data.OutlineEffect.render( data.scene, data.camera );
//  data.renderer.autoClear = false
}
else {
  if (!threeX.PPE.render(data.scene, data.camera)) {
    data.renderer.toneMapping = THREE.NoToneMapping;
    data.renderer.render(data.scene, data.camera);
  }
}

obj_hidden_list.forEach(obj=>{
  obj.visible = true;
});

//DEBUG_show(Date.now())
return true
        }
      };
    })(),

    camera: {
      get obj() { return (threeX.enabled) ? data.camera : (MMD_SA._renderer.__camera || MMD_SA._trackball_camera.object); },

      clone: function (camera) {
if (!threeX.enabled) return

// camera.near needs to be big enough to avoid flickers in N8AO
var c = new THREE.PerspectiveCamera( camera.fov, camera.aspect, Math.max(camera.near,1), camera.far )
camera._THREEX_child = c

if (!data.camera) data.camera = c
return c
      },

      update: function (camera) {
if (!threeX.enabled) return;

var c = camera._THREEX_child;
if (!c) return;

c.position.copy(camera.position)
c.quaternion.copy(camera.quaternion)
c.up.copy(camera.up)

c.matrixAutoUpdate = camera.matrixAutoUpdate
if (!c.matrixAutoUpdate) {
  c.matrix.copy(camera.matrix);
  c.matrixWorld.copy(camera.matrixWorld);
}

// always update projection matrix when necessary, as there are compatibility issues simply by copying the projection matrix from the old camera
if (c.fov != camera.fov) {
  c.fov = camera.fov;
  c.updateProjectionMatrix();
}
      },

      resize: function (width, height) {
(MMD_SA._renderer.__camera || MMD_SA._trackball_camera.object).resize(width, height);
if (threeX.enabled) {
  this.obj.aspect = width/height
  this.obj.updateProjectionMatrix()
}
      },

      control: {
        enabled: true
      }
    },

    light: (()=>{
      const obj = {
        AmbientLight: [],
        DirectionalLight: [],
      };

      return {
        obj: {
          get AmbientLight() { return (threeX.enabled) ? obj.AmbientLight : []; },
          get DirectionalLight() { return (threeX.enabled) ? obj.DirectionalLight : []; },
        },

        clone: function (light) {
if (!threeX.enabled) return

var type
if (light instanceof _THREE.DirectionalLight) {
  type = 'DirectionalLight'
}
else if (light instanceof _THREE.AmbientLight) {
  type = 'AmbientLight'
}

var l = new THREE[type]()
light._THREEX_child = l
l._THREE_parent = light;

obj[type].push(l);

// https://threejs.org/docs/#api/en/lights/DirectionalLight
if (type == 'DirectionalLight') {
  const para = MMD_SA_options.shadow_para
  l.shadow.mapSize.set(para.shadowMapWidth, para.shadowMapWidth)

  data.scene.add(l.target)
}

data.scene.add(l)
        },

        update: function (light) {
if (!threeX.enabled) return

var c, c_max;
c = light._THREEX_child;
c.position.copy(light.position);
c.color.copy(light.color);
c_max = Math.max(c.color.r, c.color.g, c.color.b);

// r149 => r150
// https://github.com/mrdoob/three.js/wiki/Migration-Guide#r149--r150
//threeX.renderer.obj.physicallyCorrectLights=true;
//if (threeX.renderer.obj.physicallyCorrectLights) c_max *= 5;

c_max *= 5; // [9F] useLegacyLights comments removed (obsolete Three.js property)

if (c.type == 'DirectionalLight') {
  if (use_VRM1)
    c.intensity = light.intensity * c_max;
  c.intensity *= 3;

  const c_scale = Math.min(1/c_max);
  c.color.multiplyScalar(c_scale);

  c.target.position.copy(light.target.position)

  if (c.castShadow != light.castShadow) {
    c.castShadow = light.castShadow
    if (c.castShadow) {
      const para = light//MMD_SA_options.shadow_para
      c.shadow.camera.left = para.shadowCameraLeft
      c.shadow.camera.right = para.shadowCameraRight
      c.shadow.camera.top = para.shadowCameraTop
      c.shadow.camera.bottom = para.shadowCameraBottom
      c.shadow.camera.updateProjectionMatrix()
//console.log(para)
/*
if (!this._shadow_camera_helper) {
const helper = this._shadow_camera_helper = new THREE.CameraHelper( c.shadow.camera );
data.scene.add(helper)
}
*/
      console.log('(THREEX shadow camera enabled)')
    }
  }
}
else if (c.type == 'AmbientLight') {
  if (use_VRM1) {
    c.intensity = c_max * 0.5;
  }
  c.intensity *= 2/3;
}
        }
      };
    })(),

    VRM: VRM,

    get GLTF_loader() { return GLTF_loader; },

    utils: {

      press_key: function (k) {
const ck = k.split('+');
let command, code;
if (ck.length == 1) {
  code = ck[0];
}
else {
  command = ck[0];
  code = ck[1];
}

let altKey, ctrlKey, shiftKey;
switch (command) {
  case 'Alt':
    altKey = true;
    break;
  case 'Ctrl':
    ctrlKey = true;
    break;
  case 'Shift':
    shiftKey = true;
    break;
}

let key, keyCode;
if (/^[A-Z]$/.test(code)) {
  code = 'Key' + code;
}
else if (/Numpad(\d)/.test(code)) {
  keyCode = 96 + parseInt(RegExp.$1);
}
else if (/Arrow(Up|Down|Left|Right)/.test(code)) {
  switch (RegExp.$1) {
    case 'Left':
      keyCode = 37;
      break;
    case 'Up':
      keyCode = 38;
      break;
    case 'Down':
      keyCode = 39;
      break;
    case 'Right':
      keyCode = 40;
      break;
  }
}
else if (code == 'NumpadAdd') {
  key = '+';
  keyCode = 107;

}
else if (code == 'NumpadSubtract') {
  key = '-';
  keyCode = 109;
}
else if (code == 'Space') {
  keyCode = 32;
}

document.dispatchEvent(new KeyboardEvent('keydown', { code, keyCode, altKey, ctrlKey, shiftKey }));
      }

    }

  };

  // Merge GUI and load_scripts (extracted to threex-gui.js)
  Object.assign(threeX, MMD_SA_createTHREEX_GUI(TX));

  // Merge extracted utilities (extracted to threex-utils.js)
  Object.assign(threeX.utils, MMD_SA_createTHREEX_Utils(TX));

  // Merge motion utilities (extracted to threex-motion.js)
  Object.assign(threeX.utils, MMD_SA_createTHREEX_Motion(TX));

  return threeX;

})();


// OSC — loaded from js/mmd/osc.js
MMD_SA.OSC = MMD_SA_createOSC();

// Gamepad — loaded from js/mmd/gamepad.js
MMD_SA.Gamepad = MMD_SA_createGamepad();

// Wallpaper3D — loaded from js/mmd/wallpaper3d.js
MMD_SA.Wallpaper3D = MMD_SA_createWallpaper3D();

// Defaults — loaded from js/mmd/defaults.js
MMD_SA_initDefaults();

// WebGL2 conversion — loaded from js/mmd/webgl2-convert.js
Object.assign(MMD_SA, MMD_SA_createWebGL2Convert());

// Bone utils — loaded from js/mmd/bone-utils.js
Object.assign(MMD_SA, MMD_SA_createBoneUtils());

// Custom actions — loaded from js/mmd/custom-actions.js
Object.assign(MMD_SA, MMD_SA_createCustomActions());

// Motion control — loaded from js/mmd/motion-control.js
Object.assign(MMD_SA, MMD_SA_createMotionControl());

// MME shaders — loaded from js/mmd/mme-shaders.js
Object.assign(MMD_SA, MMD_SA_createMMEShaders());

// MME render pipeline — loaded from js/mmd/mme-render.js
Object.assign(MMD_SA, MMD_SA_createMMERender());

// Mirrors, depth render — loaded from js/mmd/mirrors.js
Object.assign(MMD_SA, MMD_SA_createMirrors());

// Matrix rain
if (returnBoolean("UseMatrixRain") || use_MatrixRain) {
  use_MatrixRain = true
  document.write('<script language="JavaScript" src="js/canvas_matrix_rain.js"></scr'+'ipt>');
}

// WebGL 2D
var use_WebGL_2D// = false
if (use_WebGL_2D) {
  document.write('<script language="JavaScript" src="js/html5_webgl2d.js"></scr'+'ipt>');
}
