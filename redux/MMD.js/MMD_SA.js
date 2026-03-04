// MMD for System Animator
// (2025-02-22)

var use_full_spectrum = true

var _runtime_global = (typeof self !== 'undefined') ? self : ((typeof window !== 'undefined') ? window : this)
if (_runtime_global.AvatarRuntimeOptions && !_runtime_global.MMD_SA_options)
  _runtime_global.MMD_SA_options = _runtime_global.AvatarRuntimeOptions
if (_runtime_global.MMD_SA_options && !_runtime_global.AvatarRuntimeOptions)
  _runtime_global.AvatarRuntimeOptions = _runtime_global.MMD_SA_options

var AvatarRuntimeOptions = _runtime_global.AvatarRuntimeOptions || _runtime_global.MMD_SA_options || {}
_runtime_global.AvatarRuntimeOptions = _runtime_global.MMD_SA_options = AvatarRuntimeOptions

var MMD_SA_options = AvatarRuntimeOptions

var AvatarRuntime = {
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
// [AUDIO REMOVED]
      }
      return false
    }

    if (!SL_MC_video_obj) {
// prevent stack overflow when some functions in SL_MC_Place may run SL._mouse_event_main again
      setTimeout(function () { SL_MC_Place() }, 0)
    }

    if (!SL._media_player) {
SL_MC_simple_mode = true

var m = cw.SL_MC_video_obj
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

// [AUDIO REMOVED] — stubs for sender and vo
var sender = { playbackRate: 1 };
var vo = {
  BPM_mode: false,
  motion_by_song_name_mode: false,
  beat_reference: 0,
  audio_obj: null,
  playbackRate_scale: 1,
  audio_onended: function() {},
  _audio_BPM_detection_finished: function() {}
};
self.Audio_BPM = { audio_obj: null, vo: vo };

/*
c = this.canvas_webgl = document.createElement("canvas")
c.id = "SL_WebGL"
c.width  = MMD_SA_options.width
c.height = MMD_SA_options.height
*/

// Camera view properties — loaded from js/mmd/camera-view.js
MMD_SA_setupCameraView();

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
        if (mp && !mp.is_host && !mp.is_client) {
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
else if (MMD_SA_options.Dungeon.multiplayer && MMD_SA_options.Dungeon.multiplayer.init)
  MMD_SA_options.Dungeon.multiplayer.init(sb_func)
else
  sb_func()
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
    mode = !!(SL._media_player && SL._media_player.currentTime)
  }
}
else {
  mode = false
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


// VMDSpectrum, toggle_shadowMap, MME_init, light_list — loaded from js/mmd/shadowmap-spectrum.js

// WebGL2 shader conversion — loaded from js/mmd/webgl2-convert.js

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
System._browser.DEBUG_show('Motion export has been removed from this build.');
return Promise.resolve();
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


AvatarRuntime.init_my_model = function (zip_path, path_local) {
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

var MMD_SA = AvatarRuntime;
if (typeof self !== 'undefined') {
  self.AvatarRuntime = AvatarRuntime;
  self.MMD_SA = AvatarRuntime;
  self.AvatarRuntimeOptions = AvatarRuntimeOptions;
  self.MMD_SA_options = AvatarRuntimeOptions;
}
if (typeof window !== 'undefined') {
  window.AvatarRuntime = AvatarRuntime;
  window.MMD_SA = AvatarRuntime;
  window.AvatarRuntimeOptions = AvatarRuntimeOptions;
  window.MMD_SA_options = AvatarRuntimeOptions;
}


// [AUDIO REMOVED] — Audio3D no-op compatibility layer
MMD_SA.Audio3D = (function () {
  var _no_audio_player_obj = {
    timestamp: 0,
    player: {
      volume: 0,
      pause: function () {}
    }
  };

  var _no_audio_object = {
    play: function () { return null; },
    get_player_obj: function () { return null; }
  };

  var audio_object_by_name = (typeof Proxy === "function")
    ? new Proxy({}, {
      get: function (target, prop) {
        if ((prop in target) && target[prop])
          return target[prop];
        return _no_audio_object;
      },
      set: function (target, prop, value) {
        target[prop] = value || _no_audio_object;
        return true;
      }
    })
    : {};

  function ensure_audio_object(name) {
    if (!name)
      return _no_audio_object;
    if (!audio_object_by_name[name])
      audio_object_by_name[name] = _no_audio_object;
    return audio_object_by_name[name] || _no_audio_object;
  }

  return {
    audio_object_by_name: audio_object_by_name,

    load: function (sound) {
      ensure_audio_object(sound && sound.name);
      return _no_audio_object;
    },

    detach_positional_audio: function () {
      return _no_audio_player_obj;
    },

    attach_positional_audio: function () {
      return _no_audio_player_obj;
    }
  };
})();



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

// Model_obj, MMD_dummy_obj, MMD (PMX loader) — loaded from js/mmd/threex-model.js
// (factory call after TX is defined below)

// three-vrm 1.0
  const use_VRM1 = !MMD_SA_options.THREEX_options || (MMD_SA_options.THREEX_options.use_VRM1 !== false);

  var GLTF_loader;

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
  TX.init_common = init_common;
  TX.init_on_MMDStarted = init_on_MMDStarted;

// Model_obj, MMD_dummy_obj, MMD — loaded from js/mmd/threex-model.js
  const { Model_obj, MMD_dummy_obj, MMD } = MMD_SA_createTHREEX_Model(TX);
  TX.Model_obj = Model_obj;
  TX.MMD = MMD;
  TX.MMD_dummy_obj = MMD_dummy_obj;

// VRM — loaded from js/mmd/threex-vrm.js
  const VRM = MMD_SA_createTHREEX_VRM(TX);
  TX.VRM = VRM;


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
    MMD_SA_options.THREEX_options.model_path = System.Gadget.path + '/jThree/model/AliciaSolid.zip#/AliciaSolid.vrm'
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

    // mesh_obj + GOML — loaded from js/mmd/threex-scene.js
    // renderer + camera + light — loaded from js/mmd/threex-render-system.js

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

  // Merge mesh_obj + GOML (extracted to threex-scene.js)
  Object.assign(threeX, MMD_SA_createTHREEX_Scene(TX));

  // Merge renderer + camera + light (extracted to threex-render-system.js)
  Object.assign(threeX, MMD_SA_createTHREEX_RenderSystem(TX));

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

// Custom actions — loaded from js/mmd/custom-actions.js
Object.assign(MMD_SA, MMD_SA_createCustomActions());

// WebGL2 conversion — loaded from js/mmd/webgl2-convert.js
Object.assign(MMD_SA, MMD_SA_createWebGL2Convert());

// Bone utils — loaded from js/mmd/bone-utils.js
Object.assign(MMD_SA, MMD_SA_createBoneUtils());

// Motion control — loaded from js/mmd/motion-control.js
Object.assign(MMD_SA, MMD_SA_createMotionControl());

// MME shaders — loaded from js/mmd/mme-shaders.js
Object.assign(MMD_SA, MMD_SA_createMMEShaders());

// MME render pipeline — loaded from js/mmd/mme-render.js
Object.assign(MMD_SA, MMD_SA_createMMERender());

// Mirrors, depth render — loaded from js/mmd/mirrors.js
Object.assign(MMD_SA, MMD_SA_createMirrors());

// Shadowmap, VMD Spectrum, MME init — loaded from js/mmd/shadowmap-spectrum.js
Object.assign(MMD_SA, MMD_SA_createShadowmapSpectrum());

// Defaults — loaded from js/mmd/defaults.js
// (must run AFTER all Object.assign calls — in pre-R3 code all properties
//  were inline in the MMD_SA literal, so they existed before initDefaults)
MMD_SA_initDefaults();

// Matrix rain
if (returnBoolean("UseMatrixRain") || use_MatrixRain) {
  use_MatrixRain = true
  //document.write('<script language="JavaScript" src="js/canvas_matrix_rain.js"></scr'+'ipt>');
}

// WebGL 2D
var use_WebGL_2D// = false
if (use_WebGL_2D) {
  //document.write('<script language="JavaScript" src="js/html5_webgl2d.js"></scr'+'ipt>');
}
