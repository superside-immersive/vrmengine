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


 ,match_bone: function (name, match) {
if (!match || match.all_bones || (match.bone_name && (match.bone_name.indexOf(name) != -1)) || (match.bone_group && MMD_SA.model.bone_table_by_name[name] && (match.bone_group.indexOf(MMD_SA.model.bone_table_by_name[name].group_name) != -1) && (!match.bone_name_RE || match.bone_name_RE.test(name))))
  return true
return false
  }

 ,copy_first_bone_frame: function (index, bones, match) {
var mm = MMD_SA.motion[index]
if (!match)
  match = MMD_SA_options.motion[index].match

for (var name in bones) {
  if (!MMD_SA.match_bone(name, match) || !bones[name])
    continue
  var bm = mm.modelMotions[0].boneMotions[name]
  if (!bm)
    continue

  bm[0].location = bones[name].location
  bm[0].rotation = bones[name].rotation
}
  }

 ,get_parent_bone_list: function (model, bone_name) {
var bt = model.bone_table_by_name[bone_name]
if (!bt)
  return []

var bone_index = bt.index
var bones = model.bones
var bone = bones[bone_index]
if (bone.parent_bone_name_list)
  return bone.parent_bone_name_list

var list = []
var table = model.bone_table
var p_index = bone.parent_bone_index
while (table[p_index] && (p_index != bone_index)) {
  list.push(bones[p_index].name)
  p_index = bones[p_index].parent_bone_index
}

bone.parent_bone_name_list = list
return list
  }

 ,custom_action_default: {
    "motion_blending_model0": {
      action: {
        condition: function (is_bone_action, objs) {
if (objs._model_index) return false

if (objs != MMD_SA.Animation_dummy) {
  let mm = MMD_SA.motion[objs._motion_index]

  let duration = this.blending_options.duration || 5/30
  let blending_ratio = 1 - ((RAF_timestamp - this._time_ini)/1000 / duration)
  if (blending_ratio <= 0) {
    let model = THREE.MMD.getModels()[0]
    model.skin_MMD_SA_extra[0] = model.morph_MMD_SA_extra[0] = MMD_SA.Animation_dummy
    return false
  }
  objs._blending_ratio_ = blending_ratio
//DEBUG_show(mm.filename + '/'+this._delta0_from_last_loop+'/'+blending_ratio);return false;
  if (this._seek_time_ != null) {
    objs._seek_time_ = this._seek_time_
    this._seek_time_ = null
  }

  return true
}

return false
        }

       ,onFinish: function (model_index) {
        }
      }

     ,motion: {}
    }

   ,"kissing": {
      action: {
        condition: (function () {
  var motion_name;

  return function (is_bone_action, objs) {
var is_kissing
var busy = MMD_SA.use_jThree && (((MMD_SA_options.allows_kissing) ? MMD_SA.MMD.motionManager.para_SA.allows_kissing===false : !MMD_SA.MMD.motionManager.para_SA.allows_kissing) || (MMD_SA_options.Dungeon && MMD_SA_options.Dungeon.event_mode) || System._browser.camera.facemesh.enabled || MMD_SA.music_mode || MMD_SA._busy_mode1_ || MMD_SA._horse_machine_mode_)

if (MMD_SA.use_jThree && this._kissing && motion_name && (motion_name != MMD_SA.MMD.motionManager.filename))
  this.onFinish()
motion_name = MMD_SA.MMD.motionManager.filename

const scale = MMD_SA.camera_auto_adjust_scale;
if (MMD_SA.use_jThree && !busy && (MMD_SA.camera_position.y > MMD_SA._head_pos.y - 2*scale) && (Math.abs(MMD_SA.camera_position.x - MMD_SA._head_pos.x) < 10*scale) && (MMD_SA._head_pos.distanceTo(MMD_SA.camera_position) < 10*scale)) {
  is_kissing = true
}
else {
  is_kissing = self.HeadTrackerAR && HeadTrackerAR.running && (HeadTrackerAR._cz > 1+0.333*0.25);
}

if (MMD_SA.use_jThree) {
  var _vmd = MMD_SA.vmd_by_filename[MMD_SA.MMD.motionManager.filename]
  if (_vmd && _vmd.use_armIK)
    is_kissing = false
}

if (is_kissing) {
  if (!this._kissing) {
    this.frame = 0
  }
  if (is_bone_action && !this.frame)
    MMD_SA.copy_first_bone_frame(this.motion_index, objs, {bone_group:["腕"], skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369)/})
  this._kissing = MMD_SA.meter_motion_disabled = true
}

if (is_bone_action && this._kissing) {
  if (self.HeadTrackerAR)
    HeadTrackerAR._cz_mod = 2/HeadTrackerAR._cz

  var m = MMD_SA.motion[this.motion_index||1]
  var mod
  if (this.frame > m.lastFrame-15)
    mod = m.lastFrame - this.frame
  else if (this.frame < 15)
    mod = this.frame
  else
    mod = 15
  mod = mod*2 / 180 * Math.PI

  if (MMD_SA.use_jThree) {
    var bones = objs.mesh.bones_by_name
    var head = bones["頭"]
    var neck = bones["首"]

    var head_ry = (head) ? MMD_SA._v3a.setEulerFromQuaternion(head.quaternion).y : 0
    var neck_ry = (neck) ? MMD_SA._v3a.setEulerFromQuaternion(neck.quaternion).y : 0
//DEBUG_show(bones["上半身"])
//    MMD_SA.process_bone(bones["上半身"], [mod, head_ry+neck_ry, 0])
    MMD_SA.process_bone(head, [-mod/2, 0, 0], (head_ry)?[1,0,1]:null)
    MMD_SA.process_bone(neck, [-mod/2, 0, 0], (neck_ry)?[1,0,1]:null)

    if (this.frame >= 44) {
      var ratio = (this.frame - 44) / ((m.lastFrame-15) - 44)
      if (ratio > 1)
        ratio = 1

      var kiss = MMD_SA_options.mesh_obj_by_id["KissMESH"]
      var head_pos = MMD_SA._v3a.copy(MMD_SA._head_pos)
//      head_pos.y += 1
      kiss._obj.position.copy(head_pos.add(MMD_SA._v3b.copy(MMD_SA.camera_position).sub(head_pos).multiplyScalar(0.2 + ratio*0.6)))
      kiss._obj.scale.x = kiss._obj.scale.y = kiss._obj.scale.z = 0.5 + ratio * 0.5
      kiss.show()
    }

//    if (MMD_SA_options.use_speech_bubble && (this.frame == 0)) MMD_SA.SpeechBubble.message(0, ["Here is your X'mas kiss~\n\u2661"].shuffle()[0], 5000, { pos_mod:[-3,-5,0] });
//"主人，錫錫～\u2661", "飛吻啊，主人～\u2661"
  }
}

return this._kissing
  };
        })()

       ,look_at_mouse_disabled: true

       ,_HeadTrackerAR_timerID: null
       ,onFinish: function () {
var that = this
if (this._HeadTrackerAR_timerID)
  clearTimeout(this._HeadTrackerAR_timerID)
this._HeadTrackerAR_timerID = setTimeout(function () { if (!that.kissing && self.HeadTrackerAR) HeadTrackerAR._cz_mod=1; }, 100)

if (MMD_SA.use_jThree)
  MMD_SA_options.mesh_obj_by_id["KissMESH"].hide()

this._kissing = MMD_SA.meter_motion_disabled = false
        }
//       ,motion_index: 1
      }

     ,motion: {path:'MMD.js/motion/motion_basic_pack01.zip#/_kiss2_blush_v02.vmd', match:{all_morphs:true, skin_jThree:true, morph_jThree:true}}
    }

   ,"cover_undies": {
      action: {
        condition: function (is_bone_action, objs) {
if (objs._model_index) return false

var busy = MMD_SA._busy_mode1_ || !MMD_SA_options.look_at_screen || System._browser.camera.ML_enabled;
if (MMD_SA._hit_hip_ || ((MMD_SA_options.model_para_obj._cover_undies != false) && (MMD_SA.MMD.motionManager.para_SA._cover_undies != false) && !busy && !MMD_SA.custom_action_default.kissing.action._kissing && this._condition(is_bone_action, objs, (((MMD_SA._rx*180/Math.PI) % 360 > 45 * ((MMD_SA.use_jThree) ? 0.75 : 1)) )/* && !Audio_BPM.vo.motion_by_song_name_mode*/) )) {
  this._undies_visible = true

  if (!this._adjust(is_bone_action, objs)) {
    if (is_bone_action && MMD_SA.use_jThree) {
      MMD_SA._update_with_look_at_screen_ = { bone_list:[{name:["左肩","右肩"],ratio:1}], parent_list:["上半身2", "上半身"] }
//bone_list:[{name:["左肩","右肩"],ratio:0.2}, {name:["左腕","右腕"],ratio:0.2}, {name:["左ひじ","右ひじ"],ratio:1}, {name:["左手首"],ratio:-0.5}, {name:["右手首"],ratio:0.5}]
    }
  }

  if (!this._cover_undies) {
    this.frame = 0
    if (MMD_SA_options.use_speech_bubble)
      this._onmessage()
  }
  if (is_bone_action && !this.frame) {
    MMD_SA.copy_first_bone_frame(this.motion_index, objs, {bone_group:["腕"], skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369)/})
  }

  this._cover_undies = true
}
else
  this._undies_visible = false
//DEBUG_show(this.frame); 
return this._cover_undies
        }

       ,_condition: function (is_bone_action, objs, _default) {
return _default;
        }

       ,_adjust: (function () {
var skin;
var key_by_motion_name = { _default_:{} };
var key_name = "_default_";
var bone_list = ["左肩","左腕","左ひじ","左手捩","左手首", "右肩","右腕","右ひじ","右手捩","右手首"];

function assign_motion(name) {
  if (key_name == name) return;
  key_name = name

  var key = key_by_motion_name[name]
  skin.forEach(function (s) {
    var kb = key[s.keys[0].name]
    if (kb)
      s.keys.forEach(k => {k.rot=kb.rot});
  });
}

return function (is_bone_action, objs) {
  if (!is_bone_action)
    return false

  var mm = MMD_SA.MMD.motionManager
  if (key_by_motion_name[mm.filename]) {
    assign_motion(mm.filename)
    return true
  }

  var model_para_obj = MMD_SA_options.model_para_obj
  var motion_para = mm.para_SA
  var motion_sd = motion_para && motion_para.adjustment_per_model && (motion_para.adjustment_per_model[model_para_obj._filename] || motion_para.adjustment_per_model[model_para_obj._filename_cleaned] || motion_para.adjustment_per_model._default_);
  motion_sd = motion_sd && motion_sd.skin_default && motion_sd.skin_default["cover_undies"];

  if (!motion_sd) {
    assign_motion("_default_")
    return false
  }

  if (!skin) {
    let cache = THREE.MMD.getModels()[0]._MMD_SA_cache
    skin = cache[Object.keys(cache).find(e => /_cover_undies_blush/.test(e))]
    if (!skin)
      return false

    skin = skin.skin.targets.filter(s => s.keys.length && (bone_list.indexOf(s.keys[0].name) != -1));
    skin.forEach(function (s) {
      key_by_motion_name._default_[s.keys[0].name] = { rot:s.keys[0].rot } 
    });
  }

  var key = key_by_motion_name[mm.filename] = {}

  skin.forEach(function (s) {
    var name = s.keys[0].name;
    var kb = motion_sd[name];
    key[name] = { rot:(kb) ? MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.fromArray([-kb.rot.x, kb.rot.y, -kb.rot.z].map((n,i) => n*Math.PI/180)), 'YXZ').toArray() : [0,0,0,1] };
  });

  assign_motion(mm.filename)
  return true
};
      })()

       ,_onmessage: function () {
if (MMD_SA_options.Dungeon && MMD_SA_options.Dungeon_options.use_PC_click_reaction_default) return
MMD_SA.SpeechBubble.message(((MMD_SA.music_mode)?2:0), ["Hey...\n>_<", "Where are you looking at...\n>_<"].shuffle()[0])
        }

       ,onFinish: function () {
if (MMD_SA._hit_body_defined_ && !MMD_SA._hit_body_but_hip_)
  MMD_SA_options.Dungeon._states.object_click_disabled = false

if (this._undies_visible) {
  this.frame=15
} else {
  this._cover_undies=false
}
        }
//       ,motion_index: 2
      }

     ,motion: {path:'MMD.js/motion/motion_basic_pack01.zip#/_cover_undies_blush.vmd', match:{bone_group:["腕","指"], all_morphs:true, skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369|.\u6307.)/, morph_jThree:true}}

     ,animation_check: function (idx) {
if (!MMD_SA.use_jThree)
  return true

var _vmd = MMD_SA.vmd_by_filename[MMD_SA.MMD.motionManager.filename];
if (this._is_skin) {
  return _vmd && !_vmd.use_armIK && !MMD_SA._horse_machine_mode_;
}
/*
var keys = this.targets[idx].keys
var name = keys[0].name
var model_para_obj = MMD_SA_options.model_para_obj_all[this._model_index]
var md = model_para_obj.morph_default && model_para_obj.morph_default[name]
if (md && (!md.weight_scale || md.weight)) {
  keys[0].weight = keys[1].weight = (!md.motion_filter || md.motion_filter.test(decodeURIComponent(_vmd.url))) ? ((md.weight!=null)?md.weight:1) : 0
}
*/
return true
      }
    }
  }

 ,vmd_by_filename: {}

 ,fadeout_opacity: null

 ,motion_shuffle_index: -1
 ,motion_shuffle_started: false
 ,motion_shuffle: function () {
var vo = Audio_BPM.vo
var ignore_para = vo.motion_by_song_name_mode

var mmd = this.MMD
var mm = mmd.motionManager
var para = (ignore_para) ? {} : mm.para_SA

var range

var motion_changed = false

var fading
// check the backup list ._motion_shuffle_list_default instead of .motion_shuffle_list_default since .motion_shuffle_list_default can be null sometimes
if (!MMD_SA_options._motion_shuffle && !MMD_SA_options._motion_shuffle_list_default) {
  fading = (this.motion_shuffle_started && para.loopback_fading)

  if (para.range) {
    mm.range_index = random(para.range.length)
    range = para.range[mm.range_index]
  }
  else
    range = { time:[0,0] }
  mm.firstFrame_ = range.time[0]
  mm.lastFrame_  = (range.time[1] || mm.lastFrame)
}
else {
  var motion_index_old = (this._force_motion_shuffle || !MMD_SA_options.motion_shuffle_list || (this.motion_shuffle_index == -1)) ? -1 : MMD_SA_options.motion_shuffle_list[this.motion_shuffle_index]
  if (this._force_motion_shuffle || (!para.loop_count && (!MMD_SA_options.motion_shuffle_list || (++this.motion_shuffle_index >= MMD_SA_options.motion_shuffle_list.length)))) {
    MMD_SA_options.motion_shuffle_list = (MMD_SA_options.motion_shuffle_list_default && MMD_SA_options.motion_shuffle_list_default.slice(0).shuffle()) || MMD_SA_options._motion_shuffle_list || MMD_SA_options.motion_shuffle.slice(0).shuffle()
//if (MMD_SA_options._motion_shuffle_list) DEBUG_show(MMD_SA_options.motion_shuffle_list,0,1)
    MMD_SA_options._motion_shuffle_list = null
    this.motion_shuffle_index = 0
  }

  var motion_index = MMD_SA_options.motion_shuffle_list[this.motion_shuffle_index]

  if ((motion_index_old != motion_index) || (MMD_SA.motion_index_for_external == motion_index)) {
    var filename_old = (this.use_jThree) ? ((this.motion_shuffle_started) ? mm.filename : "<CHANGED>") : null

    mm = mmd.motionManager = this.motion[motion_index]
    para = (ignore_para) ? {} : mm.para_SA
    para.loop_count = 0

    motion_changed = (filename_old) ? (filename_old != mm.filename) : ((motion_index_old != -1) || (motion_index != 0))
    fading = (this.motion_shuffle_started && (motion_changed || para.loopback_fading))
  }
  else {
    fading = para.loopback_fading
  }

  if (para.range) {
    mm.range_index = random(para.range.length)
    range = para.range[mm.range_index]
  }
  else
    range = { time:[0,0], random_range_disabled:ignore_para }
  mm.firstFrame_ = range.time[0]
  mm.lastFrame_  = (range.time[1] || mm.lastFrame)

  if (para.loop) {
    if (!para.loop_count) {
      para.loop_count = 0
      para.loop_max = para.loop[0] + random((para.loop[1]-para.loop[0])+1) + 1
    }
    if (++para.loop_count > para.loop_max)
      para.loop_count = 0
  }
  else {
//mm.firstFrame_ = 2000
//mmd.setFrameNumber(2000)
    var BPM = ((para.BPM && para.BPM.BPM) || 120)
    var playbackRate = (vo.BPM_mode) ? vo._sender.playbackRate : 120/BPM
    var r_base = (para.random_range_time_base || MMD_SA_options.random_range_time_base || 20)
    var r = Math.round(r_base * playbackRate)
    if (!(range.random_range_disabled || para.random_range_disabled || MMD_SA_options.random_range_disabled) && (mm.lastFrame_ - mm.firstFrame_ > (r*2+10)*30)) {
      var length = random(r*30) + r*30
      mm.firstFrame_ += random((mm.lastFrame_ - mm.firstFrame_) - length)
      mm.lastFrame_  = mm.firstFrame_ + length
    }
//DEBUG_show([mm.firstFrame_,mm.lastFrame_],0,1)
  }
//DEBUG_show(this.motion_shuffle_index+'/'+motion_index+'/'+MMD_SA_options.motion_shuffle_list+'/'+JSON.stringify(range)+'/'+parseInt(mm.lastFrame)+'/'+parseInt(THREE.MMD.getModels()[mm._model_index]._MMD_SA_cache[MMD_SA_options.motion[mm._index].path].skin.duration*30),0,1)
}

this.motion_shuffle_started = true

if (mm.firstFrame_)
  mmd.setFrameNumber(mm.firstFrame_)

if (MMD_SA._no_fading)
  fading = MMD_SA._no_fading = false
var xr = this.WebXR
this.fading = fading && (!xr.session || (xr.use_dummy_webgl && (!xr.user_camera.initialized || xr.user_camera.visible)));
if (!fading)
  return motion_changed

if (!MMD_SA.OSC.VMC.sender_enabled)
  this.fadeout_opacity = 1;
return motion_changed
  }

 ,load_external_motion: function (src, _onload) {
const name_new = src.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "");

let index;

const model = THREE.MMD.getModels()[0];

let resolve_func;
const promise = new Promise((resolve)=>{ resolve_func=resolve; });

function _finalize() {
  MMD_SA_options.motion_index_by_name[name_new] = index
  var m = MMD_SA_options.motion[index] = { path:src }

// assigning a new MotionManager() ensures that motion change can be detected in .motion_shuffle() even if the motion index remains the same
  var mm = MMD_SA.motion[index] = new MMD_SA.MMD.MotionManager()
  mm.filename = name_new

  mm.para_SA = MMD_SA_options.motion_para[name_new] = MMD_SA_options.motion_para[name_new]||{};
  mm.para_SA.is_custom_motion = true;

  for (const p of [['look_at_screen',false], ['random_range_disabled',true], ['motion_tracking_enabled',true], ['motion_tracking_upper_body_only',true]]) {
    if (mm.para_SA[p[0]] == null)
      mm.para_SA[p[0]] = p[1];
  }

  mm._index = mm.para_SA._index = index
  mm.para_SA._path = src

  var result = { return_value:false };
  window.dispatchEvent(new CustomEvent("SA_on_external_motion_loaded", { detail:{ path:src, result:result } }));

  if (_onload) {
    _onload();
  }
  else if (!result.return_value && (_onload !== false)) {
    MMD_SA_options.motion_shuffle = [index]
    MMD_SA_options.motion_shuffle_list_default = null
    MMD_SA._force_motion_shuffle = true

    System._browser.on_animation_update.add(()=>{MMD_SA.motion_player_control.enabled = true;}, 0,1);
  }

  THREE.MMD.setupCameraMotion(model._MMD_SA_cache[src].camera)

  resolve_func();
}

function _vmd(vmd_components) {
  function _vmd_loaded( vmd ) {
    index = MMD_SA_options.motion_index_by_name[name_new] || MMD_SA_options.motion.length;
    vmd._index = index;

    vmd_components && vmd_components.forEach(_vmd=>{
      if (_vmd.morphKeys.length) {
        vmd._morph_component = _vmd;
        vmd._morph_component.url = vmd.url;
      }
      else if (_vmd.cameraKeys.length) {
        vmd._camera_component = _vmd;
        vmd._camera_component.url = vmd.url;
      }
    });

    model._MMD_SA_cache[src] = model.setupMotion_MMD_SA(vmd)

    for (var i = 1, i_max = MMD_SA_options.model_para_obj_all.length; i < i_max; i++) {
      const model_para = MMD_SA_options.model_para_obj_all[i];
      if (model_para.mirror_motion_from_first_model) {
        const _model = THREE.MMD.getModels()[i];
        _model._MMD_SA_cache[src] = _model.setupMotion_MMD_SA(vmd);
      }
    }

    _finalize();
  }

  model._VMD(src, _vmd_loaded);
}

if (MMD_SA.motion[MMD_SA_options.motion_index_by_name[name_new]]) {
  if (_onload) {
    _onload();
  }
  resolve_func();
}
//else if (MMD_SA.vmd_by_filename[name_new]) { _finalize(); }
else {
  const para_SA = MMD_SA_options.motion_para[name_new] = MMD_SA_options.motion_para[name_new] || {};

  const c_promise_list = [];
  const vmd_components = [];
  for (const c_name of ['morph_component_by_filename', 'camera_component_by_filename']) {
    const c = para_SA[c_name];
    if (c) {
      c_promise_list.push(new Promise(resolve=>{
        model._VMD(src.replace(/[^\/\\]+$/, "") + para_SA[c_name] + ".vmd", function( vmd ) { vmd_components.push(vmd); resolve(); });
      }));
    }
  }

  if (c_promise_list.length) {
    Promise.all(c_promise_list).then(()=>{
      _vmd(vmd_components);
    });
  }
  else {
    _vmd();
  }
}

return promise;
  }

 ,seek_motion: function (time, must_update) {
function model_seek_time(v, i) {
  const modelX = MMD_SA.THREEX.get_model(i);
  if (MMD_SA.THREEX.enabled && modelX.animation.enabled) {
    modelX.animation.mixer.setTime(time);
  }
  else {
    v.seekMotion( time );
  }
}

must_update = must_update && !THREE.MMD.motionPlaying;

if (must_update) jThree.MMD.play(true)

THREE.MMD.getCameraMotion().forEach( function( m ) {
  m.seek( time );
});

THREE.MMD.getModels().forEach( function( v, i ) {
  model_seek_time(v, i);
  MMD_SA.THREEX.get_model(i).resetPhysics();
});

if (must_update) {
  System._browser.on_animation_update.add(()=>{
    jThree.MMD.pause();
    THREE.MMD.getModels().forEach( function( v, i ) {
      model_seek_time(v, i);
    });
  }, 0,1);
}
  }

 ,motion_player_control: (function () {
    function time_update() {
if (MMD_SA._force_motion_shuffle || (animation_mixer_enabled != MMD_SA.THREEX.get_model(0).animation.enabled) || (motion_index != MMD_SA.THREEX.get_model(0).animation.motion_index)) {
  MMD_SA.motion_player_control.enabled = false;
  return;
}

SL_MC_Timeupdate(SL_MC_video_obj);
    }

    var motion_index = -1;
    var enabled = false;
    var animation_mixer_enabled = false;

    return {
      get enabled() { return enabled; },
      set enabled(v) {
if (v && System._browser.camera.media_control_enabled) {
  if (!System._browser.camera.video.paused || System._browser.camera.video.currentTime) return;
}

motion_index = (v) ? MMD_SA.THREEX.get_model(0).animation.motion_index : -1;

if (enabled == !!v) return;
enabled = !!v;

animation_mixer_enabled = MMD_SA.THREEX.get_model(0).animation.enabled;

if (enabled) {
  System._browser.camera.media_control_enabled = false;

  this.paused = false;
  SL_MC_simple_mode = true;
  SL_MC_video_obj = this;
  SL_MC_Place(1, 0,-64);
  System._browser.on_animation_update.add(time_update, 1,1,-1);
}
else {
  if (this.paused) this.play();
  SL_MC_Place(-1);
  System._browser.on_animation_update.remove(time_update, 1);
}
      },

      play: function () {
jThree.MMD.play(true);
this.paused = false;
      },

      pause: function () {
jThree.MMD.pause();
this.paused = true;
      },

      get currentTime() { return MMD_SA.THREEX.get_model(0).animation.time; },
      set currentTime(v) {
MMD_SA.seek_motion(v, true);
      },

      get duration() { return MMD_SA.THREEX.get_model(0).animation.duration; }
    };
  })()

// getter/setter on MMD_SA.meter_motion_disabled instead of MMD_SA_options.meter_motion_disabled for backward compatibility (PMD version)
 ,get meter_motion_disabled()  {
return (MMD_SA.music_mode || MMD_SA._busy_mode1_ || this.MMD.motionManager.para_SA.meter_motion_disabled || this._meter_motion_disabled || MMD_SA_options.meter_motion_disabled || (WallpaperEngine_CEF_mode && (MMD_SA_options.meter_motion_disabled == null)))
  }
 ,set meter_motion_disabled(b) { this._meter_motion_disabled = b; }

 ,_j3_obj_by_id: {}
 ,_debug_msg: []

 ,_rx: 0
 ,_ry: 0

 ,MME_PPE_scale_getter: function (w, h) {
// return a non-zero dummy value (0.5) when MMD_SA has not been initialized
var v = (MMD_SA.initialized) ? Math.min((w * h) / (SL.width * SL.height), 1) : 0.5
//setTimeout('DEBUG_show("' + (v+'/'+SL.width +"x"+ SL.height) + '",0,1)', 1000)
return v
  }

 ,MME_PPE_init: function (effect_name, tex_list, para) {
var EC = MMD_SA_options.MME.PostProcessingEffects
if (!EC._texture_common)
  EC._texture_common = {}

this._texture_list = tex_list || []

if ((this._texture_list.indexOf('[music canvas]') != -1) && !EC._music_canvas) {
  EC._music_canvas = document.createElement("canvas")
  EC._music_canvas.width  = 512
  EC._music_canvas.height = 2
}

this._texture_list.forEach(function (src) {
  var src_para = src.split("|")
  src = src_para[0]
  var filename = src.replace(/^.+[\/\\]/, "")
//console.log(filename+'/'+src)
  if (filename == '[music canvas]') {
    if (!EC._texture_common[filename]) {
      var mc = EC._texture_common[filename] = new THREE.Texture(EC._music_canvas)
      mc.generateMipmaps = false
      mc.minFilter = mc.magFilter
      mc.needsUpdate = true
    }
  }
  else {
    var _src
    if (src_para.length==1) {
      _src = toFileProtocol(src)
    }
    else {
      if (/^(.+\_)0(\.\w{3,4})$/.test(src)) {
        _src = []
        var re1 = RegExp.$1
        var re2 = RegExp.$2
        for (var i = 0; i < 6; i++)
          _src.push(toFileProtocol(re1 + i + re2))
//console.log(_src)
      }
    }

    EC._texture_common[filename] = EC._texture_common[filename] || THREE.ImageUtils[(src_para.length==1) ? "loadTexture" : "loadTextureCube"](_src, undefined, function (tex) { tex.needsUpdate=true });
    EC._texture_common[filename].wrapS = EC._texture_common[filename].wrapT = THREE.RepeatWrapping;
  }
});

var u_para = {'iResolution':{}, 'iGlobalTime':{}}
if (para) {
  for (var u_name in para)
    u_para[u_name] = para[u_name]
}

var u = this.uniforms

u["tDiffuse"] = { type: "t", value: null }
u["SA_idle"] =  { type: "i", value: 0 }
u["SA_idle_hidden"] =  { type: "i", value: 0 }
if (u_para["iResolution"])
  u["iResolution"] =  { type: "v3", value: new THREE.Vector3(640,480,1) }
if (u_para["iGlobalTime"])
  u["iGlobalTime"] =  { type: "f", value: 0 }
if (u_para["ST_opacity"])
  u["ST_opacity"] =  { type: "f", value: 0 }

for (var i = 0, i_max = this._texture_list.length; i < i_max; i++) {
  u["iChannel" + i] = { type: "t", value: null }
}

var fs_uniforms = [
		"varying vec2 vUv;",
"uniform sampler2D tDiffuse;",
((u_para["iResolution"]) ? "uniform vec3 iResolution;"  : ""),
((u_para["iGlobalTime"]) ? "uniform float iGlobalTime;" : ""),
"uniform bool SA_idle;",
"uniform bool SA_idle_hidden;"
];

this._texture_list.forEach(function (src, i) {
  fs_uniforms.push("uniform " + ((src.split("|").length==1) ? "sampler2D" : "samplerCube") + " iChannel" + i + ";")
});

if (u_para.ST_opacity) {
  fs_uniforms.push("uniform float ST_opacity;")
}

if (/^(AbstractCorridor|Cubescape|FractalCondos|FunkyDiscoBall|RemnantX|Ribbons|SubterraneanFlyThrough)$/.test(effect_name)) {
  fs_uniforms.push('#define SOLID_BG')
}
else if (WallpaperEngine_CEF_mode) {
  if (!returnBoolean("SA_Shadertoy_transparent"))
    fs_uniforms.push('#define SOLID_BG')
}
else if (EC.use_solid_bg || (EC.effects_by_name[effect_name] && EC.effects_by_name[effect_name].use_solid_bg) || ((EC.use_solid_bg == null) && !MMD_SA_options.MMD_disabled && returnBoolean("CSSTransformFullscreen") && (returnBoolean("AutoItStayOnDesktop") || returnBoolean("DisableTransparency")))) {
  fs_uniforms.push('#define SOLID_BG')
}

this.fragmentShader = fs_uniforms.join("\n") + "\n" + this.fragmentShader
  }

 ,MME_PPE_refreshUniforms: function (effect_name, refresh_all_uniforms, para) {
var EC = MMD_SA_options.MME.PostProcessingEffects
var e = EC._effects[effect_name]

var u_para = {'iResolution':{}, 'iGlobalTime':{}}
if (para) {
  for (var u_name in para)
    u_para[u_name] = para[u_name]
}

if (refresh_all_uniforms) {
  if (u_para['iResolution'])
    e.uniforms[ 'iResolution' ].value = new THREE.Vector3(EC._width, EC._height, 1);

  this._texture_list.forEach(function (src, idx) {
    var filename = src.split("|")[0].replace(/^.+[\/\\]/, "")
    e.uniforms[ 'iChannel' + idx ].value = EC._texture_common[filename]
  });
}

var idle_effect_disabled = EC.effects_by_name[effect_name] && EC.effects_by_name[effect_name].idle_effect_disabled
e.uniforms[ 'SA_idle' ].value = (MMD_SA.music_mode) ? 0 : 1
if (EC.idle_effect_disabled || ((EC.idle_effect_disabled !== false) && (idle_effect_disabled || ((idle_effect_disabled == null) && /^(AbstractMusic|Adrenaline|AmbilightVisualization2|AudioEQCircles|AudioSurfII|DancingDots|EmbellishedAV|Ribbons)$/.test(effect_name))))) {
  e.uniforms[ 'SA_idle_hidden' ].value = e.uniforms[ 'SA_idle' ].value
}

if (u_para['iGlobalTime']) {
  e.uniforms[ 'iGlobalTime' ].value = performance.now()/1000 * (u_para['iGlobalTime'].scale||1) + (u_para['iGlobalTime'].base||0);
}

if (u_para['ST_opacity']) {
  var w_beat = (MMD_SA_options.MMD_disabled && (DragDrop.relay_id != null)) ? document.getElementById("Ichild_animation" + DragDrop.relay_id).contentWindow : self
  var beat = (w_beat.EV_usage_sub && w_beat.EV_usage_sub.BD) ? w_beat.EV_usage_sub.BD.beat : 0

  var beat_pow = u_para['ST_opacity'].pow || 1
  var beat_decay = u_para['ST_opacity'].decay || 0.2
  var beat_min = (u_para['ST_opacity'].min == null) ? 0.25 : u_para['ST_opacity'].min
  var beat_max = u_para['ST_opacity'].max || 1-beat_min
  var beat_idle = (u_para['ST_opacity'].idle == null) ? 1 : u_para['ST_opacity'].idle

  e.uniforms[ 'ST_opacity' ].value = (!MMD_SA.music_mode && (!MMD_SA_options.MMD_disabled || !(self.AudioFFT && AudioFFT.use_live_input)) && beat_idle) || beat_min + Math.pow(EC.effects_by_name[effect_name]._EV_usage_PROCESS(beat, beat_decay), beat_pow) * beat_max
}
  }

 ,MME_PPE_main: function (effect_name) {
var PPE = MMD_SA_options.MME.PostProcessingEffects || { effects_by_name:{} }
var PPE_by_name = PPE.effects_by_name[effect_name] || {}

var fg_opacity = 0.8
var effect_opacity = 1.0
var shader_color_adjust_pre = []
var shader_color_adjust_post = []
var use_simple_blending = false
var effect_on_top = false

var bg_blackhole_opacity  = 0.8
var feather_width = 0.25

var is_render_target = PPE_by_name.scale || PPE_by_name.is_render_target

switch (effect_name) {
  case "JustSnow":
    effect_on_top = true
    bg_blackhole_opacity = 0
    break
  case "AudioEQCircles":
    feather_width *= 0.5
  case "AbstractMusic":
  case "AudioSurfII":
  case "EmbellishedAV":
    effect_opacity = 0.8
  case "AudioSurfIII":
  case "NoiseAnimationFlow":
  case "NoiseAnimationElectric":
    bg_blackhole_opacity = 0
    break
  case "GalaxyOfUniverses":
//    bg_blackhole_opacity = 0.5
    shader_color_adjust_post = [
//(color.r + color.g + color.b) / 3.0
//color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722
'color.rgb = mix(vec3((color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722) * 0.5), color.rgb, ST_opacity);'
    ];
    break
  case "DeformReliefTunnel":
    bg_blackhole_opacity = 0
  case "AbstractCorridor":
  case "Cubescape":
  case "FractalCondos":
  case "RemnantX":
  case "SubterraneanFlyThrough":
  case "FunkyDiscoBall":
    fg_opacity = 0.9
  case "NV15SpaceCurvature":
    use_simple_blending = true
    break
/*
  case "BloomPostProcess":
    is_render_target = true
    feather_width = 0
    bg_blackhole_opacity = 0
    break
*/
}

if (PPE_by_name.fg_opacity)
  fg_opacity = PPE_by_name.fg_opacity

var fullscreen = returnBoolean("CSSTransformFullscreen") && returnBoolean("AutoItStayOnDesktop")
//console.log(fullscreen)
bg_blackhole_opacity = (PPE_by_name.bg_blackhole_opacity==0 || (PPE.bg_blackhole_opacity==0 && !PPE_by_name.bg_blackhole_opacity) || fullscreen) ? 0 : bg_blackhole_opacity
feather_width = (PPE_by_name.feather_width==0 || (PPE.feather_width==0 && !PPE_by_name.feather_width) || fullscreen) ? 0 : (PPE_by_name.feather_width || PPE.feather_width || feather_width)

var toFloat = MMD_SA_options.MME._toFloat

var shader_feather = [
'vec2 xy = vUv - vec2(0.5, 0.5);',
'float len = length(xy);'
];

if (feather_width) {
  shader_feather.push(
'#ifndef SOLID_BG',
'if (len > 0.0) {',
'  float scale = 0.5 / max(abs(xy.x), abs(xy.y));',
'  xy *= scale;',
'  float len_max = length(xy);',
'  color.a *= smoothstep(len_max,len_max * ' + toFloat(1-feather_width) + ', len);',
'}',
'#endif'
  );
} 

var shader_bg_blackhole = []
if (bg_blackhole_opacity) {
  shader_bg_blackhole.push(
'#ifndef SOLID_BG',
'float bg_a = smoothstep(1.0,0.5, clamp(len * 2.0, 0.0,1.0)) * ' + toFloat((is_render_target) ? Math.pow(bg_blackhole_opacity, 0.5) : bg_blackhole_opacity) + ';',//toFloat((is_render_target) ? bg_blackhole_opacity : Math.pow(bg_blackhole_opacity, 0.5)) + ';',
'if (bg_a > 0.0) {',

//(gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0
//(max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)) + min(gl_FragColor.r, min(gl_FragColor.g, gl_FragColor.b))) / 2.0
//gl_FragColor.r*0.2126 + gl_FragColor.g*0.7152 + gl_FragColor.b*0.0722
//vec3(0.0), gl_FragColor.rgb, gl_FragColor.a + (1.0-gl_FragColor.a) * (1.0-pow(bg_a,0.5))
//mix(vec3(), vec3(0.0), bg_a), gl_FragColor.rgb, gl_FragColor.a

'  gl_FragColor = vec4(mix(vec3(0.0), gl_FragColor.rgb, gl_FragColor.a + (1.0-gl_FragColor.a) * (1.0-pow(bg_a,1.0/2.718281828459))), bg_a + (1.0-bg_a) * gl_FragColor.a);',//bg_a + (1.0-bg_a) * ' + ((is_render_target) ? 'gl_FragColor.a' : 'pow(gl_FragColor.a, 0.5)') + ');',

//'  gl_FragColor = vec4(mix(vec3(0.0), gl_FragColor.rgb, gl_FragColor.a), max(bg_a, gl_FragColor.a));',
'}',
'#endif'
  );
}
//else
if (!is_render_target) {
  shader_bg_blackhole.push(
'gl_FragColor.a = pow(gl_FragColor.a, 0.5);'
  );
}

var shader = [
'vec4 texel = texture2D( tDiffuse, vUv );',

'if (SA_idle_hidden) { gl_FragColor = vec4(texel.rgb, pow(texel.a, 0.5)); return; }',

'vec4 color;',
'vec2 coord = vec2(0.5) + (vUv * (iResolution.xy - vec2(1.0)));',
'mainImage(color, coord);'
];

if (is_render_target) {
  shader.push(
shader_feather.join("\n"),

'#ifdef SOLID_BG',
//'  gl_FragColor = color;',
'  gl_FragColor = vec4(mix(vec3(0.0),color.rgb,color.a), 1.0);',
'#else',
'  gl_FragColor = color;',
'#endif',

shader_bg_blackhole.join("\n")
  );
}
else {
  shader.push(
//http://entropymine.com/imageworsener/grayscale/
//http://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
//https://en.wikipedia.org/wiki/Luma_%28video%29
//The formula for luminosity is 0.2126×Red + 0.7152×Green + 0.0722×Blue
//'color.a = (color.r + color.g + color.b) / 3.0;',
'color.rgb = clamp(color.rgb, 0.0,1.0);',

((PPE_by_name.opacity < 1) ? 'color.a *= ' + toFloat(PPE_by_name.opacity) + ';' : ''),

shader_color_adjust_pre.join("\n"),

'#ifdef SOLID_BG',

shader_color_adjust_post.join("\n"),

'gl_FragColor = vec4(texel.rgb + color.rgb * (1.0 - texel.a * ' + toFloat(fg_opacity) + '), 1.0);',
'#else',

shader_feather.join("\n")
  );

  if (use_simple_blending) {
    shader.push(
shader_color_adjust_post.join("\n"),
'gl_FragColor = vec4(texel.rgb + color.rgb * (1.0 - texel.a * ' + toFloat(fg_opacity) + '), texel.a + color.a * (1.0 - texel.a));'
    );
  }
  else {
    shader.push(
'float c_max = max(color.r, max(color.g, color.b));',

'if (c_max > 0.001) {',
'  color.rgb *= 1.0/c_max;',
'  color.a *= c_max * ' + toFloat(effect_opacity) + ';',
'}',
'else { color.a = 0.0; }',

shader_color_adjust_post.join("\n")
    );

    if (effect_on_top) {
      shader.push(
'gl_FragColor = vec4(mix(texel.rgb, color.rgb, color.a), texel.a + color.a * (1.0 - texel.a));'
      );
    }
    else {
      shader.push(
'float color_a = pow(color.a * (1.0 - texel.a*0.8), texel.a * 1.0/max(1.0+(color.a-texel.a), 0.001));',
'gl_FragColor = vec4(texel.rgb * clamp(texel.a * 1.5 / max(color_a, 0.001), 0.0,1.0) + color.rgb * color_a, texel.a + color.a * (1.0 - texel.a));'
      );
    }
  }

  shader.push(
shader_bg_blackhole.join("\n"),

'#endif'
  );
}
//console.log(shader.join("\n"))

return shader.join("\n")
  }

 ,vshader_2d:
  'attribute vec2 a_position;\n'
+ 'attribute vec2 a_texCoord;\n'
+ 'uniform vec2 u_resolution;\n'
+ 'varying vec2 v_texCoord;\n'
+ 'void main() {\n'
+ '  // convert the rectangle from pixels to 0.0 to 1.0\n'
+ '  vec2 zeroToOne = a_position / u_resolution;\n'
+ '  // convert from 0->1 to 0->2\n'
+ '  vec2 zeroToTwo = zeroToOne * 2.0;\n'
+ '  // convert from 0->2 to -1->+1 (clipspace)\n'
+ '  vec2 clipSpace = zeroToTwo - 1.0;\n'
+ '  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n'
+ '  // pass the texCoord to the fragment shader\n'
+ '  // The GPU will interpolate this value between points.\n'
+ '  v_texCoord = a_texCoord;\n'
+ '}\n'

 ,fshader_2d:
  'precision mediump float;\n'
+ '// our texture\n'
+ 'uniform sampler2D u_image;\n'
+ 'uniform float uAlpha;\n'
+ '// the texCoords passed in from the vertex shader.\n'
+ 'varying vec2 v_texCoord;\n'
+ 'void main() {\n'
//+ '  gl_FragColor = texture2D(u_image, v_texCoord);\n'
+ '  vec4 textureColor = texture2D(u_image, v_texCoord);\n'
+ '  gl_FragColor = vec4(textureColor.rgb, textureColor.a * uAlpha);\n'
+ '}\n'

 ,MME_shader_inline_switch_mode: true

 ,MME_shader_branch: function (name, is_open, _not_) {
if (this.MME_shader_inline_switch_mode) {
  return (is_open) ? 'if (' + ((_not_) ? '!' : '') + name + ') {\n' : '}\n'
}
else {
  return (is_open) ? '#if' + ((_not_) ? 'n' : '') + 'def ' + name + '\n' : '#endif\n'
}
  }

 ,MME_shader_fshader: {}

 ,MME_shader: function (name) {
var fvar = ""
var fshader = ""
var mme = MMD_SA_options.MME[name]
if (!(mme.enabled==null || mme.enabled)) {
  if (!this.MME_shader_inline_switch_mode)
    return { fvar:fvar, fshader:fshader }
}

if (!this.MME_shader_fshader[name]) {
  this.MME_shader_fshader[name] = {}

  var toFloat = MMD_SA_options.MME._toFloat

  fvar +=
  ((this.MME_shader_inline_switch_mode) ? 'uniform bool ' + name.toUpperCase() + ';' : '#define ' + name.toUpperCase()) + '\n'

  switch (name) {
    case "self_overlay":
// concepts borrowed from "o_SelfOverlay" MME effect for MMD, by おたもん

fvar +=
  'uniform float self_overlay_opacity;\n'
+ 'uniform float self_overlay_brightness;\n'
+ 'uniform vec3 self_overlay_color_adjust;\n'

fshader +=
  this.MME_shader_branch("SELF_OVERLAY", true)

+ 'vec4 color_temp_self_overlay = gl_FragColor;\n'
+ 'color_temp_self_overlay.rgb *= self_overlay_brightness;\n'
+ 'color_temp_self_overlay.rgb = mix(color_temp_self_overlay.rgb * self_overlay_color_adjust, color_temp_self_overlay.rgb, color_temp_self_overlay.rgb);\n'


+ 'color_temp_self_overlay.r = (gl_FragColor.r < 0.5) ? gl_FragColor.r * color_temp_self_overlay.r * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - color_temp_self_overlay.r);\n'
+ 'color_temp_self_overlay.g = (gl_FragColor.g < 0.5) ? gl_FragColor.g * color_temp_self_overlay.g * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - color_temp_self_overlay.g);\n'
+ 'color_temp_self_overlay.b = (gl_FragColor.b < 0.5) ? gl_FragColor.b * color_temp_self_overlay.b * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - color_temp_self_overlay.b);\n'

/*
branchless test
http://stackoverflow.com/questions/4176247/efficiency-of-branching-in-shaders
- using mix to replace branch
http://stackoverflow.com/questions/20982307/glsl-hlsl-multiple-single-line-conditional-statements-as-opposed-to-single-blo
- it seems ()?: is already considered branchless in some cases?
*/
/*
+ 'color_temp_self_overlay.r = mix(gl_FragColor.r * color_temp_self_overlay.r * 2.0, 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - color_temp_self_overlay.r), float(gl_FragColor.r >= 0.5));\n'
+ 'color_temp_self_overlay.g = mix(gl_FragColor.g * color_temp_self_overlay.g * 2.0, 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - color_temp_self_overlay.g), float(gl_FragColor.g >= 0.5));\n'
+ 'color_temp_self_overlay.b = mix(gl_FragColor.b * color_temp_self_overlay.b * 2.0, 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - color_temp_self_overlay.b), float(gl_FragColor.b >= 0.5));\n'
*/

+ 'gl_FragColor.rgb = mix(gl_FragColor.rgb, color_temp_self_overlay.rgb, self_overlay_opacity);\n'

+ this.MME_shader_branch("SELF_OVERLAY", false)
break

    case "HDR":
// concepts borrowed from "o_Bleach-bypass" MME effect for MMD, by おたもん

fvar +=
  '#define HDR_GAMMA 2.2\n'
+ 'const vec3 LumiFactor = vec3(0.2126, 0.7152, 0.0722);\n'
+ 'uniform float HDR_opacity;\n'

fshader +=
  this.MME_shader_branch("HDR", true)

+ 'vec4 color_temp_HDR = gl_FragColor;\n'

+ 'vec3 negativeGray = pow(color_temp_HDR.rgb, vec3(HDR_GAMMA));\n'
+ 'negativeGray = vec3(1.0 - pow(dot(LumiFactor, negativeGray), 1.0/HDR_GAMMA));\n'

+ 'color_temp_HDR.r = (gl_FragColor.r < 0.5) ? gl_FragColor.r * negativeGray.r * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - negativeGray.r);\n'
+ 'color_temp_HDR.g = (gl_FragColor.g < 0.5) ? gl_FragColor.g * negativeGray.g * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - negativeGray.g);\n'
+ 'color_temp_HDR.b = (gl_FragColor.b < 0.5) ? gl_FragColor.b * negativeGray.b * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - negativeGray.b);\n'

+ 'color_temp_HDR.r = (gl_FragColor.r < 0.5) ? pow(color_temp_HDR.r, 2.0 * (1.0 - gl_FragColor.r)) : pow(color_temp_HDR.r, 1.0 / (2.0 * gl_FragColor.r));\n'
+ 'color_temp_HDR.g = (gl_FragColor.g < 0.5) ? pow(color_temp_HDR.g, 2.0 * (1.0 - gl_FragColor.g)) : pow(color_temp_HDR.g, 1.0 / (2.0 * gl_FragColor.g));\n'
+ 'color_temp_HDR.b = (gl_FragColor.b < 0.5) ? pow(color_temp_HDR.b, 2.0 * (1.0 - gl_FragColor.b)) : pow(color_temp_HDR.b, 1.0 / (2.0 * gl_FragColor.b));\n'

+ 'gl_FragColor.rgb = mix(gl_FragColor.rgb, color_temp_HDR.rgb, HDR_opacity);\n'

+ this.MME_shader_branch("HDR", false)
break

    case "serious_shader":
/*
concepts borrowed from the following MME effects for MMD, by Elle/データP
- SeriousShader
- AdultShader
*/

if (!mme.type)
  mme.type = "SeriousShader"

fvar +=
  'uniform float serious_shader_shadow_opacity;\n'
+ 'uniform float OverBright;\n'
//+ '#define OverBright ' + toFloat((mme.OverBright || ((mme.type == "AdultShaderS2") ? 1.15 : 1.2)) + MMD_SA_options.SeriousShader_OverBright_adjust) + '\n'// 白飛びする危険性をおかして明るくする。
+ 'uniform float ShadowDarkness;\n'// セルフシャドウの最大暗さ
+ 'uniform float ToonPower;\n'// 影の暗さ

//if (mme.type == "SeriousShader") {
  fvar +=
  '#define UnderSkinDiffuse ' + toFloat(mme.UnderSkinDiffuse || 0.2) + '\n'// 皮下散乱
//}
//else {
  fvar +=
  '#define FresnelCoef ' + toFloat(mme.FresnelCoef || 0.08) + '\n'// フレネル項の係数
+ '#define FresnelFact ' + toFloat(mme.FresnelFact || 5) + '\n'// フレネル項
+ 'uniform float EyeLightPower;\n'// 視線方向での色合いの変化
+ 'uniform int serious_shader_mode;\n'
//}

fshader +=
  this.MME_shader_branch("SERIOUS_SHADER", true)

+ '#ifdef METAL\n'
+ '  gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient + totalSpecular );\n'
+ '  #ifdef MMD_TOONMAP\ngl_FragColor.xyz *= totalToon;\n#endif\n'
+ '#else\n'
//+ 'gl_FragColor.xyz = vec3(0.5); ShadowColor.xyz = vec3(0.5);\n'
+ '  gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient );\n'
+ '  ShadowColor.xyz = ShadowColor.xyz * ( (emissive + totalDiffuse)*(1.0-serious_shader_shadow_opacity) + ambientLightColor * ambient );\n'

// NOTE: MMD_TOONMAP is undefined when there in no toon map. However, in original MME (full.fx), no toon map merely means a full white one.
+ '  float comp = 1.0;\n'
+ '  #ifdef MMD_TOONMAP\n'
+ '    ShadowColor.rgb *= pow(totalToon, vec3(ToonPower));\n'//ToonPower);\n'
+ '  #endif\n'

+ 'if (serious_shader_mode == 0) { gl_FragColor.rgb *= OverBright; }\n'
//+ ((mme.type == "SeriousShader") ? 'gl_FragColor.rgb *= OverBright;\n' : '')//OverBright;

// NOTE: MAX_DIR_LIGHTS > 0 causes ERROR on Electron (v0.33.4) for unknown reasons
+ '  #ifdef MAX_DIR_LIGHTS\n'
+ '    comp = 0.0;\n'
+ '    for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n'

+ 'comp += comp_list[i] * ((comp_list[i]>=0.0) ? (shadowColor.x-1.0)*ShadowDarkness+1.0 : ((serious_shader_mode == 0) ? ShadowDarkness-1.0 : 0.0));\n'
//+ 'comp += comp_list[i] * ((comp_list[i]>=0.0) ? (shadowColor.x-1.0)*ShadowDarkness+1.0 : ' + ((mme.type == "SeriousShader") ? 'ShadowDarkness-1.0' : '0.0') + ');\n'

+ '    }\n'
+ '    comp = clamp(comp, 0.0, 1.0);\n'
+ '  #endif\n'

// Using RGBtoYCbCr here is bugged for some unknown reasons
+ '  Y  =  0.298912 * ShadowColor.r + 0.586611 * ShadowColor.g + 0.114478 * ShadowColor.b;\n'
+ '  Cb = -0.168736 * ShadowColor.r - 0.331264 * ShadowColor.g + 0.5      * ShadowColor.b;\n'
+ '  Cr =  0.5      * ShadowColor.r - 0.418688 * ShadowColor.g - 0.081312 * ShadowColor.b;\n'
+ '  shadowColor.x = mix(1.0-MMDShadow,1.0, shadowColor.x);\n'
+ '  gl_FragColor.rgb = mix(mix(clamp(YCbCrtoRGB(Y *shadowColor.x, Cb, Cr), vec3(0.),vec3(1.)), ShadowColor.rgb *shadowColor.x, 0.5), gl_FragColor.rgb, comp);\n'
//+ '  gl_FragColor.rgb = mix(ShadowColor.rgb *shadowColor.x, gl_FragColor.rgb, comp);\n'
+ '  gl_FragColor.xyz += totalSpecular;\n'

//if (mme.type == "SeriousShader") {
  fshader +=
  'if (serious_shader_mode == 0) {\n'
+ '  float d = pow(abs(dot(normal, viewPosition)), UnderSkinDiffuse);\n'//pow(abs(dot(normalize(IN.Normal),normalize(IN.Eye))),UnderSkinDiffuse);\n'
+ '  gl_FragColor.xyz += totalSpecular * (1.0 - d);\n'
+ '}\n'
//}
//else {
  fshader +=
  'else {\n'
+ '  float EN = abs(dot(normal, viewPosition));\n'
+ '  float d = pow(EN, EyeLightPower);\n'//EyeLightPower	0.7 / 2.0
+ '  gl_FragColor.rgb *= mix(gl_FragColor.rgb, vec3(OverBright), d);\n'//OverBright
+ '  gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 1.0);\n'

//  if (/AdultShaderS/.test(mme.type)) {
//    fshader +=
//+ '  if ((serious_shader_mode == 1) || (serious_shader_mode == 2)) {\n'
+ '    d = FresnelCoef * pow(1.0-EN, FresnelFact) * (comp*0.4+0.6);\n'//FresnelCoef/FresnelFact
+ '    gl_FragColor.rgb += totalSpecular * d;\n'
//+ '  }\n'
+ '}\n'
//  }
//}

fshader +=
  '#endif\n'

+ this.MME_shader_branch("SERIOUS_SHADER", false)

    default:
break
  }

  this.MME_shader_fshader[name] = { fvar:fvar, fshader:fshader }
}

return this.MME_shader_fshader[name]
  }

 ,GOML_import: ""
 ,GOML_head: ""
 ,GOML_scene: ""

 ,GOML_head_list: []
 ,GOML_scene_list: []

// speech bubble — loaded from js/mmd/speech-bubble.js
 ,SpeechBubble: MMD_SA_createSpeechBubble()
// speech bubble END

 ,face_camera: function (v3, q_to_apply, absolute_facing) {
var cam = MMD_SA.camera_position
var camR = cam.clone().sub(v3)
if (q_to_apply)
  camR = camR.applyQuaternion(q_to_apply)

var v3r = new THREE.Vector3()
var _divisor
var _x_diff = camR.x
var _y_diff = camR.y
var _z_diff = camR.z

_divisor = Math.sqrt(Math.pow(_x_diff,2) + Math.pow(_z_diff,2))
v3r.x = Math.atan2(-_y_diff, Math.abs(_divisor))
if (absolute_facing && (_z_diff < 0)) {
  v3r.x = MMD_SA.normalize_angle((v3r.x > 0) ? Math.PI - v3r.x : -Math.PI - v3r.x)
}

_divisor = _z_diff
v3r.y = Math.atan2(_x_diff, Math.abs(_divisor))
if (absolute_facing && (_z_diff < 0)) {
//  v3r.y = (v3r.y > 0) ? Math.PI - v3r.y : -Math.PI - v3r.y
  v3r.z = Math.PI
}
v3r.y *= Math.abs(Math.cos(v3r.x))

return v3r
  }

 ,normalize_angle: function (r) {
var circle = Math.PI * 2
r = r % circle
if (r > Math.PI)
  r -= circle
else if (r < -Math.PI)
  r += circle

return r
  }

 ,get_bone_position: (function () {
    var TEMP_m4, q1;
    window.addEventListener("jThree_ready", function () {
      TEMP_m4 = new THREE.Matrix4();
      q1 = new THREE.Quaternion();
    });

    return function (mesh, name, parent_to_stop, A_pose_enforced) {
function convert_to_A_pose(bone) {
  return (!A_pose_enforced || !is_T_pose) ? bone.quaternion : q1.fromArray(MMD_SA.THREEX.utils.convert_T_pose_rotation_to_A_pose(bone.name, bone.quaternion.toArray()));
}

var pos = new THREE.Vector3();

const mesh_by_number = typeof mesh == 'number';
const is_THREEX = (mesh_by_number) ? MMD_SA.THREEX.enabled : !!mesh.model;
const is_T_pose = MMD_SA.THREEX.get_model((mesh_by_number) ? mesh : mesh._model_index).is_T_pose;

var model, bone;
if (is_THREEX) {
  model = (mesh_by_number) ? MMD_SA.THREEX.get_model(mesh) : mesh;
  mesh = model.mesh;
  bone = model.get_bone_by_MMD_name(name);
}
else {
  if (mesh_by_number) mesh = THREE.MMD.getModels()[mesh].mesh;
  bone = (typeof name == "string") ? mesh.bones_by_name[name] : mesh.bones[name];
}

if (!bone) return pos;

// should be safe and save some headaches without the need to set A_pose_enforced manually, since MMD bones should always operate on A pose
if ((A_pose_enforced == null) && !mesh.model) A_pose_enforced = true;

if (parent_to_stop && (typeof parent_to_stop == "string")) {
  parent_to_stop = (is_THREEX) ? model.get_bone_by_MMD_name(parent_to_stop) : mesh.bones_by_name[parent_to_stop];
}

pos.copy(bone.position);
var _bone = bone;
while ((_bone.parent !== mesh) && (_bone.parent !== parent_to_stop)) {
  _bone = _bone.parent;
  pos.applyMatrix4(TEMP_m4.makeRotationFromQuaternion(convert_to_A_pose(_bone)).setPosition(_bone.position));
}
if (is_THREEX) pos.multiply(mesh.scale);
if (!parent_to_stop)
  pos.applyMatrix4(TEMP_m4.makeRotationFromQuaternion(mesh.quaternion).setPosition(mesh.position));

return pos;
    };
  })()

 ,get_bone_rotation: (()=>{
    var q1;
    window.addEventListener('jThree_ready', ()=>{
      q1 = new THREE.Quaternion();
    });

    return function (mesh, name, parent_only, parent_to_stop, A_pose_enforced) {
function convert_to_A_pose(bone) {
  return (!A_pose_enforced || !is_T_pose) ? bone.quaternion : q1.fromArray(MMD_SA.THREEX.utils.convert_T_pose_rotation_to_A_pose(bone.name, bone.quaternion.toArray()));
}

const is_T_pose = MMD_SA.THREEX.get_model(mesh._model_index).is_T_pose;

var rot = new THREE.Quaternion();
var bone = (typeof name == "string") ? mesh.bones_by_name[name] : mesh.bones[name]
if (!bone)
  return rot

if (parent_to_stop && (typeof parent_to_stop == "string"))
  parent_to_stop = mesh.bones_by_name[parent_to_stop]

if (!parent_only)
  rot.copy(convert_to_A_pose(bone));

var _bone = bone;
while ((_bone.parent !== mesh) && (_bone.parent !== parent_to_stop)) {
  _bone = _bone.parent;
// parent x self
  rot.multiplyQuaternions(convert_to_A_pose(_bone), rot)
}
if (!parent_to_stop)
  rot.multiplyQuaternions(mesh.quaternion, rot)

return rot.normalize();
    };
  })()

 ,get_bone_rotation_parent: function (mesh, name, parent_to_stop, A_pose_enforced) {
return this.get_bone_rotation(mesh, name, true, parent_to_stop, A_pose_enforced)
  }

 ,clean_axis_rotation: (function () {
    var rot_v3;
    window.addEventListener("jThree_ready", function () {
      rot_v3 = new THREE.Vector3();
    });

    return function (q, euler_order, clean_depth=1) {
rot_v3.setEulerFromQuaternion(q, euler_order)
for (var i = 3-clean_depth; i < 3; i++)
  rot_v3[euler_order.charAt(i).toLowerCase()] = 0
q.setFromEuler(rot_v3, euler_order)

return rot_v3
    };
  })()

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


 ,MME_shuffle: function (id, e_name) {
var EC = MMD_SA_options.MME.PostProcessingEffects
if (!EC || !EC.enabled || !EC.effects.length)
  return

var id_list = []
if (id == null) {
  for (id in EC.shuffle_group)
    id_list.push(id)
}
else
  id_list.push(id)

id_list.forEach(function (id) {
  var sg = EC.shuffle_group[id]
  var sg_effect_by_name
  sg.effects.forEach(function (e) {
if (!sg_effect_by_name && e_name && (e.name == e_name))
  sg_effect_by_name = true
EC._effects[e.name].enabled = false
  });

  var e
  if (sg_effect_by_name) {
    e = EC._effects[e_name]
  } else {
    if (sg.shuffle_list_index == null)
      sg.shuffle_list_index = -1
    if (!sg.shuffle_list || (++sg.shuffle_list_index >= sg.shuffle_list.length)) {
      var list = []
      for (var i = 0, i_max = sg.effects.length; i < i_max; i++)
        list.push(i)
      sg.shuffle_list = list.shuffle()
      sg.shuffle_list_index = 0
    }
    e = EC._effects[sg.effects[sg.shuffle_list[sg.shuffle_list_index]].name]
  }

  e.enabled = true
});

this.MME_set_renderToScreen()

this.MME_check_mipmap_render_target()
  }

 ,MME_set_renderToScreen: function () {
var EC = MMD_SA_options.MME.PostProcessingEffects
if (!EC || !EC.enabled || !EC.effects.length)
  return

EC.effects.forEach(function (e) {
  e.obj.renderToScreen = false
});

for (var i = EC.effects.length-1; i >= 0; i--) {
  var e_obj = EC.effects[i].obj
  if (e_obj.enabled) {
    e_obj.renderToScreen = true
    break
  }
}
  }

 ,MME_composer_disabled_check: (function () {
var check = function (c) {
  if ((c._index == 0) || !c.passes.length)
    return

  for (var i = 0, i_max = c.passes.length; i < i_max; i++) {
  if (c.passes[i]._shuffle_group_id != null) DEBUG_show(c.passes[i]._name,0,1)
    if (c.passes[i].enabled) {
      return
    }
  }

  c._disabled = true
};

return function (c) {
  check.call(this, c)
  this.MME_check_mipmap_render_target()
};
  })()

 ,_mipmap_render_target_list: []
 ,MME_check_mipmap_render_target: function () {
var EC = MMD_SA_options.MME.PostProcessingEffects
var mipmap_render_target_list = []
var changed

var effects_to_check = ["BloomPostProcess"]
effects_to_check.forEach(function (name) {
  var e = EC.effects_by_name[name]
  var c_index = -1
  if (e.obj.enabled && /SOURCE_READBUFFER(\d+)/.test(e.obj.textureID)) {
    c_index = parseInt(RegExp.$1)
    var c = EC._composers_list[c_index]
    if (c._disabled) {
      for (var i = c_index-1; i >= 0; i--) {
        if (!EC._composers_list[i]._disabled) {
          c_index = i
          break
        }
      }
    }
  }

  changed = (e._composer_index_active != c_index)
  e._composer_index_active = c_index
  mipmap_render_target_list.push({name:name, composer_index:c_index})
});

this._mipmap_render_target_list = mipmap_render_target_list
if (MMD_SA.MMD_started && EC._initialized && changed) {
  console.log("mipmap_render_target_list:")
  console.log(mipmap_render_target_list)
// trigger render target refresh
  EC._width = EC._height = 0
}

return mipmap_render_target_list
  }

 ,render: function (renderer) {

window.dispatchEvent(new CustomEvent("SA_MMD_before_render"));

if (!MMD_SA_options.MMD_disabled && MMD_SA_options.use_THREEX && MMD_SA.MMD_started) {
  const MMD_mesh0 = THREE.MMD.getModels()[0].mesh;
  const model0 = MMD_SA.THREEX.get_model(0);
//DEBUG_show(['頭', '上半身'].map(b=>model0.get_bone_position_by_MMD_name(b).distanceTo(MMD_SA._trackball_camera.object.position)).join('\n'))
  const avatar_visible_distance = MMD_SA_options.avatar_visible_distance || 3;
  if (MMD_mesh0.visible) {
    const check_list = ['頭', '上半身'].map(b=>model0.get_bone_position_by_MMD_name(b));
    check_list.push(MMD_SA.TEMP_v3.copy(check_list[check_list.length-1]).lerp(MMD_mesh0.position, 0.5));
    if (check_list.some(p=>p.distanceTo(MMD_SA._trackball_camera.object.position) < avatar_visible_distance)) {
      MMD_mesh0.visible = false;
      System._browser.on_animation_update.add(()=>{ MMD_mesh0.visible=true }, 0,0);
    }
  }
}

//if (!MMD_SA.MMD_started) return true
//var _t=performance.now()
MMD_SA._mirror_rendering_ = true
MMD_SA._THREE_mirror.forEach(function (m, idx) {
  var mirror_obj = MMD_SA.mirror_obj[idx]
  if (!mirror_obj.custom_action || !mirror_obj.custom_action(m))
    m.render()
});
MMD_SA._mirror_rendering_ = false

var _visible = {}
MMD_SA._skip_render_list.forEach(function (id) {
// jThree(id).three(0) works during loading
  var obj = (/^\#(.+)$/.test(id)) ? ((MMD_SA.MMD_started) ? MMD_SA_options.mesh_obj_by_id[RegExp.$1] : jThree(id).three(0)) : MMD_SA_options.x_object_by_name[id]
  if (obj && obj.visible) {
//DEBUG_show(id+"/"+Date.now())
    _visible[id] = true
    if (MMD_SA.MMD_started)
      obj.hide()
    else
      obj.visible = false
  }
});

var EC = MMD_SA_options.MME.PostProcessingEffects
if (EC && EC.enabled && EC.effects.length)
  this.render_extra(renderer)
else
  renderer.render( renderer.__camera.userData.scene, renderer.__camera )

for (var id in _visible) {
  var obj = (/^\#(.+)$/.test(id)) ? ((MMD_SA.MMD_started) ? MMD_SA_options.mesh_obj_by_id[RegExp.$1] : jThree(id).three(0)) : MMD_SA_options.x_object_by_name[id]
  if (obj) {
    if (MMD_SA.MMD_started)
      obj.show()
    else
      obj.visible = true
  }
}
//DEBUG_show(JSON.stringify(renderer.info.render))
//DEBUG_show(Math.round(performance.now()-_t)+'\n'+Date.now())

window.dispatchEvent(new CustomEvent("SA_MMD_after_render"));

return true
 }

 ,render_extra: function (renderer) {
var EC = MMD_SA_options.MME.PostProcessingEffects

var refresh_all_uniforms = false

if (!EC._initialized) {
refresh_all_uniforms = true

var composer, effect
//EC._composers = {}
EC._composers_list = []
//EC._render_targets = {}
EC._render_targets_list = []
EC._createRenderTarget = function (para_obj, push_render_targets_list) {
  var w, h
  if (para_obj.scale) {
     w = Math.round(this._width  * para_obj.scale)
     h = Math.round(this._height * para_obj.scale)
  }
  else {
    w = para_obj.width
    w = para_obj.height
  }
  var parameters = para_obj.para || { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false }
  var rt = new THREE.WebGLRenderTarget( w, h, parameters )
  if (para_obj.use_multisample)
    rt._use_multisample = 4
  if (push_render_targets_list) {
    EC._render_targets_list.push({ render_target:rt, para:para_obj, composer_index:para_obj.composer_index, onreload:para_obj.onreload })
  }
  return rt
}
EC._effects = {}
EC._width  = renderer.context.canvas.width
EC._height = renderer.context.canvas.height


// back ported to r58
renderer.getPixelRatio = function () { return this.devicePixelRatio; }
if (!THREE.PlaneBufferGeometry)
  THREE.PlaneBufferGeometry = THREE.PlaneGeometry
THREE.WebGLRenderTarget.prototype.setSize = function ( width, height ) {

		if ( this.width !== width || this.height !== height ) {

			this.width = width;
			this.height = height;

			this.dispose();

		}

};


// depth buffer START
EC._depthRenderTarget = new THREE.WebGLRenderTarget( EC._width, EC._height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
//EC._depthMaterial = new THREE.MeshDepthMaterial();
//EC._depthMaterial.blending = THREE.NoBlending;
// depth buffer END


composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, undefined, (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:THREE.RGBAFormat}; })() );
composer._index = 0
if (EC.use_FXAA) {
  composer.addPass( new THREE.RenderPass( renderer.__camera.userData.scene, renderer.__camera, null ) );
  EC._effects.FXAAShader = new THREE.ShaderPass(THREE.FXAAShader)
  composer.addPass(EC._effects.FXAAShader)
}
else {
  Object.defineProperty(composer, "_source_readBuffer", {
  get: function () {
if (this._buffer_written)
  return this.readBuffer
return this._source_readBuffer_
  }

 ,set: function (v) {
this._source_readBuffer_ = v
  }
  });

  var use_multisample = (!MMD_SA_options.MMD_disabled && MMD_SA.use_webgl2)
  MMD_SA.use_MSAA_FBO = use_multisample

  if (use_multisample && MMD_SA.MMD_started)
    DEBUG_show("Use MSAA FBO", 2)

  composer._source_readBuffer = EC._createRenderTarget({
    use_multisample:use_multisample

// mipmap check
   ,para: (function () { var c_index=0; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false }; })()

   ,scale:EC.SSAA_scale||((MMD_SA_options.MMD_disabled||use_multisample)?1:2)
   ,onreload:function (renderTarget_new) { EC._composers_list[0]._source_readBuffer=renderTarget_new; }
  }, true);
}

//composer.addPass( new THREE.BloomPass( 1, 15*2, 2, 512 ) );

//composer.readBuffer.premultiplyAlpha = composer.writeBuffer.premultiplyAlpha = false
/*
effect = new THREE.ShaderPass(THREE.CopyShader)
effect.renderToScreen = true;
composer.addPass( effect );
*/

var effect_count = {}
var composer_index_source_readBuffer = -1
var composer_index_source_readBuffer_USED = []
var source_readBuffer_effect0_group_id = null

for (var _e = 0, _e_length = EC.effects.length; _e < _e_length; _e++) {
  var e = EC.effects[_e]
  var name = e.name
  var index_sub
  var texture_id = undefined

  var e_source = EC.effects[_e + ((name == "EffectToNormalSize") ? -1 : 0)]
  if ((composer._source_readBuffer && (source_readBuffer_effect0_group_id == null)) || ((e_source.shuffle_group_id != null) && (e_source.shuffle_group_id == source_readBuffer_effect0_group_id))) {
  }
  else {
    composer_index_source_readBuffer = -1
    source_readBuffer_effect0_group_id = null
  }
  source_readBuffer_effect0_group_id = (e_source.shuffle_group_id != null) ? e_source.shuffle_group_id : "NOT_USED"
//  if (composer._source_readBuffer)
    composer_index_source_readBuffer = composer._index


  if (/^(BloomPostProcess|ChildAnimation|DiffusionX|JustSnow|SAOShader)$/.test(name) || e.create_composer) {
    composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, undefined, (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:THREE.RGBAFormat}; })() );
    composer._index = EC._composers_list.length-1

Object.defineProperty(composer, "_source_readBuffer", {
  get: function () {
    if (this._buffer_written)//(this.passes[0].enabled)
      return this.readBuffer

var composer_last_active_index = 0
for (var i = this._index-1; i >= 0; i--) {
  if (!EC._composers_list[i]._disabled) {
    composer_last_active_index = i
    break
  }
}
var c = EC._composers_list[composer_last_active_index]
return c._source_readBuffer || c.readBuffer
  }
});
  }
  else if (name == "EffectToNormalSize") {
    if (!e_source.scale)
      continue

    composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, undefined, (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:THREE.RGBAFormat}; })() );
    composer._index = EC._composers_list.length-1
//    texture_id = "MANUAL_ASSIGN"

    if (EC._composers_list[composer._index-1]._disabled)
      composer._disabled = true
  }
  else if (e.scale) {
    composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, EC._createRenderTarget({ scale:e.scale, composer_index:EC._composers_list.length }, true), (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:null}; })() );
    composer._index = EC._composers_list.length-1
    texture_id = "MANUAL_ASSIGN"
  }

  if (!texture_id && (composer_index_source_readBuffer != -1)) {
    texture_id = "SOURCE_READBUFFER" + composer_index_source_readBuffer
    composer_index_source_readBuffer_USED[composer_index_source_readBuffer] = true
  }

  index_sub = effect_count[name] = effect_count[name] || 0
  if (index_sub)
    name += index_sub
  effect_count[name]++

  if (name == "BloomPass") {
    effect = e.obj = EC._effects[name] = new THREE.BloomPass(1*1.5, 15*2, 0.25, 512*2)
    effect.textureID = texture_id
//console.log(effect)
  }
  else
    effect = e.obj = EC._effects[name] = new THREE.ShaderPass(THREE[name], texture_id)

  effect._composer_index = composer._index
  effect._index_sub = index_sub
  effect._index = _e
  effect._name = name

  if (_e == _e_length-1)
    effect.renderToScreen = true
  composer.addPass(effect)

  effect._enabled = !!e.enabled || (e.enabled == null)
console.log(name+'/'+texture_id+'/'+effect._enabled)
  if (e.scale) {
    Object.defineProperty(effect, "enabled",
{
  get: function () {
return this._enabled
  }

 ,set: function (v) {
this._enabled = v

EC._composers_list[this._composer_index]._disabled = !v
if (EC._composers_list[this._composer_index+1])
  EC._composers_list[this._composer_index+1]._disabled = !v
  }
});
  }
  else {
    Object.defineProperty(effect, "enabled",
{
  get: function () {
return this._enabled && !EC._composers_list[this._composer_index]._disabled
  }

 ,set: function (v) {
this._enabled = v

if (v)
  EC._composers_list[this._composer_index]._disabled = false
  }
});
  }
  effect.enabled = !!effect._enabled

  if (e.shuffle_group_id != null) {
    effect.enabled = false
  }
}

EC._composers_list.forEach(function (c) {
  MMD_SA.MME_composer_disabled_check(c)
});

MMD_SA.MME_shuffle();

this.MME_check_mipmap_render_target().forEach(function (r) {
  if (r.composer_index == -1)
    return

  var c = EC._composers_list[r.composer_index]
  if (r.composer_index == 0) {
    c._source_readBuffer.minFilter = THREE.LinearMipMapLinearFilter
  }
  else {
    c.readBuffer.minFilter  = THREE.LinearMipMapLinearFilter
    c.writeBuffer.minFilter = THREE.LinearMipMapLinearFilter
  }
  console.log("Startup MIPMAP render target:"+r.composer_index)
});

// put it at the end to avoid unnecessary render target refresh during .MME_check_mipmap_render_target()
EC._initialized = true
}


var w = renderer.context.canvas.width
var h = renderer.context.canvas.height
if ((EC._width != w) || (EC._height != h)) {
  EC._width  = w
  EC._height = h

  refresh_all_uniforms = true

EC._depthRenderTarget.dispose()
EC._depthRenderTarget = new THREE.WebGLRenderTarget( EC._width, EC._height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
//EC._depthMaterial = new THREE.MeshDepthMaterial();
//EC._depthMaterial.blending = THREE.NoBlending;

  EC._render_targets_list.forEach(function (obj) {
    var rt = EC._createRenderTarget(obj.para)
    if (obj.composer_index != null) {
      EC._composers_list[obj.composer_index]._render_target_new = rt
    }
    else
      obj.render_target.dispose()
    obj.render_target = rt
  });

  EC._composers_list.forEach(function (c) {
    c.reset(c._render_target_new)
    c._render_target_new = undefined
  });

  EC._render_targets_list.forEach(function (obj) {
    if (obj.onreload)
      obj.onreload(obj.render_target)
  });

// to make sure that MMD_SA._trackball_camera has already been defined
  MMD_SA._trackball_camera && MMD_SA._trackball_camera.resize()

  DEBUG_show("(viewport resized)", 2)
}

for (var e_name in EC._effects) {
  THREE[e_name] && THREE[e_name]._refreshUniforms && THREE[e_name]._refreshUniforms(refresh_all_uniforms, EC._effects[e_name]._index_sub)
}


/*
var oldClearColor = renderer.getClearColor()
var oldClearAlpha = renderer.getClearAlpha()
renderer.setClearColor( oldClearColor, oldClearAlpha );
renderer.setClearColor( new THREE.Color("#008"), 0 );
*/


//MMD_SA._depth_render_mode_ = 1
if (!EC.use_FXAA) {
// Skip rendering after first one doesn't seem to help reduce GPU usage (maybe there is actually nothing rendered when the scene is empty), so comment out for now.
//  if (!MMD_SA_options.MMD_disabled || !EC._render_targets_list[0]._rendered) {
    renderer.render( renderer.__camera.userData.scene, renderer.__camera, EC._render_targets_list[0].render_target, true )
//    EC._render_targets_list[0]._rendered = true
//  }
}
//MMD_SA._depth_render_mode_ = 0

//return true


if (EC.use_SAO) {
  MMD_SA._depth_render_mode_ = 1
/*
var oldClearColor = renderer.getClearColor()
var oldClearAlpha = renderer.getClearAlpha()
renderer.setClearColor( new THREE.Color("#FFF"), 1 );
renderer.clearTarget(EC._depthRenderTarget)
renderer.autoClear = false
*/
/*
if (!self._depthMaterial_) {
		var depthShader = THREE.ShaderLib[ "depthRGBA" ];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
console.log(depthUniforms)
let _depthMaterial = self._depthMaterial_ =
//		_depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
//		_depthMaterialMorph = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true } );
//		_depthMaterialSkin = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, skinning: true } );
		_depthMaterialMorphSkin = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true, skinning: true } );

		_depthMaterial._shadowPass = true;
}
*/
//renderer.__camera.userData.scene.overrideMaterial = self._depthMaterial_
  renderer.render( renderer.__camera.userData.scene, renderer.__camera, EC._depthRenderTarget, true );
//renderer.__camera.userData.scene.overrideMaterial = null
/*
renderer.autoClear = true
renderer.setClearColor( oldClearColor, oldClearAlpha );
*/
  MMD_SA._depth_render_mode_ = 0
}


EC._composers_list.forEach(function (c) {
  c._buffer_written = false
  if (!c._disabled)
    c.render()
});

return true
  }

 ,camera_list: []

// depth render
 ,__depth_render_mode__: 0
 ,_depth_render_uniform_list: []
 ,get _depth_render_mode_() { return this.__depth_render_mode__ }
 ,set _depth_render_mode_(v) {
this.__depth_render_mode__ = v
var disabled_by_material = MMD_SA_options.MME.SAO.disabled_by_material
this._depth_render_uniform_list.forEach(function (obj) {
  var v_this = v
  if (v_this == 1) {
    if (disabled_by_material.indexOf(obj.name) != -1)
      v_this = 2
  }
  obj.uniform.value = v_this
});
  }


// mirrors
 ,_THREE_mirror: []
 ,_skip_render_list: []
 ,mirror_index: -1
 ,mirror_obj: []
 ,createMirror: function (para) {
if (para.created)
  return null
para.created = true

para.mirror_index = ++this.mirror_index
this.mirror_obj[this.mirror_index] = para

if (!para.plane && !para.geo_type)
  para.plane = [30,30]
if (para.plane) {
  para.geo_type  = "Plane"
  para.geo_param = para.plane
}

if (!para.baseTexture)
  para.baseTexture = System.Gadget.path + '/images/bg.png'

if (para.hidden)
  MMD_SA._skip_render_list.push('#Mirror' + this.mirror_index + 'MESH')

return {
  geo:  '<geo id="Mirror' + this.mirror_index + 'GEO" type="' + para.geo_type + '" param="' + para.geo_param.join(" ") + '" />\n'
 ,mtl:  '<mtl id="Mirror' + this.mirror_index + 'MTL" type="Mirror" param="mirror_index:' + this.mirror_index + '; mesh:#Mirror' + this.mirror_index + 'MESH; renderer:#MMD_renderer; camera:#MMD_camera; clipBias:0.003; textureWidth:' + (para.textureWidth||1024) + '; textureHeight:' + (para.textureHeight||1024) + ';' + ((para.clip_y != null) ? ' clip_y:' + para.clip_y + ';' : '') + '" />\n'
 ,mesh: '<mesh id="Mirror' + this.mirror_index + 'MESH" geo="#Mirror' + this.mirror_index + 'GEO" mtl="#Mirror' + this.mirror_index + 'MTL" style="' + para.style + '" />\n'
};
  }


// tray menu
 ,tray_menu_func: function (para) {
switch (para[0]) {
  case "MODEL":
    if (para[1] == "override_default") {
      var bool = parseInt(para[2])
      System.Gadget.Settings.writeString('MMDOverrideDefaultForExternalModel', ((!bool)?"non_default":""))
      if (!bool)
        System.Gadget.Settings.writeString('LABEL_MMD_model_path', '')
      if (linux_mode)
        System._browser.update_tray()
      return
    }

    var model_path = decodeURIComponent(para[1])
    if (!/^(\w+\:|\/)/.test(model_path))
      model_path = System.Gadget.path + toLocalPath("\\" + model_path)
    if ((model_path == MMD_SA_options.model_path) || (MMD_SA_options.model_path_extra.indexOf(model_path) != -1)) {
      DEBUG_show("(model already in use)", 2)
      System._browser.update_tray({MMD_model_path:MMD_SA_options.model_path})
      return
    }
    if (!confirm("This will restart the gadget.")) {
      System._browser.update_tray({MMD_model_path:MMD_SA_options.model_path})
      return
    }

    DragDrop_install({ path:model_path })
    return
  case "VISUAL_EFFECTS":
    var model_filename_cleaned = MMD_SA_options.model_para_obj._filename_cleaned
    switch (para[1]) {
      case "load_default":
        if (!confirm("This will load the default visual effect settings."))
          return
        MMD_SA_options.MME.self_overlay = Object.clone(MMD_SA_options.MME._self_overlay)
        MMD_SA_options.MME.HDR = Object.clone(MMD_SA_options.MME._HDR)
        MMD_SA_options.MME.serious_shader = Object.clone(MMD_SA_options.MME._serious_shader)
        MMD_SA_options.MME.SAO = Object.clone(MMD_SA_options.MME._SAO)
        MMD_SA._MME_uniforms_updated_ = Date.now()
        System._browser.update_tray()
        break
      case "save_default":
        if (!confirm("This will save the current visual effect settings as the default for the current MMD model, which will be applied to any System Animator animations that uses the same MMD model.\n\nIf this is an external model, this model path will also be added to the model list, which can be selected from the tray menu for any other System Animator MMD animations."))
          return
        var MME_saved = MMD_SA_options.MME_saved[model_filename_cleaned]
        if (!MME_saved)
          MME_saved = MMD_SA_options.MME_saved[model_filename_cleaned] = {}
        delete MMD_SA_options.MME.self_overlay.use_default
        delete MMD_SA_options.MME.HDR.use_default
        delete MMD_SA_options.MME.serious_shader.use_default
// update saved
        var model_path = MMD_SA_options.model_path
        if (model_path.indexOf(System.Gadget.path) == 0)
          model_path = model_path.substr(System.Gadget.path.length+1)
        MME_saved.path_full = model_path
        MME_saved.self_overlay = Object.clone(MMD_SA_options.MME.self_overlay)
        MME_saved.HDR = Object.clone(MMD_SA_options.MME.HDR)
        MME_saved.serious_shader = Object.clone(MMD_SA_options.MME.serious_shader)
        MME_saved.SAO = Object.clone(MMD_SA_options.MME.SAO)
// update default
        MMD_SA_options.MME._self_overlay = Object.clone(MME_saved.self_overlay)
        MMD_SA_options.MME._HDR = Object.clone(MME_saved.HDR)
        MMD_SA_options.MME._serious_shader = Object.clone(MME_saved.serious_shader)
        MMD_SA_options.MME._SAO = Object.clone(MME_saved.SAO)
        try {
          var f = FSO_OBJ.OpenTextFile(System.Gadget.path + '\\TEMP\\MMD_MME_by_model.json', 2, true);
          f.Write(JSON.stringify(MMD_SA_options.MME_saved))
          f.Close()
          DEBUG_show("(MME settings saved)", 2)
        }
        catch (err) {}
        System._browser.update_tray()
        break
      case "delete_default":
        if (!MMD_SA_options.MME_saved[model_filename_cleaned]) {
          DEBUG_show("(No saved settings exist)", 3)
          return
        }
        if (!confirm("This will delete the saved visual effect and model list settings for the current MMD model."))
          return
        delete MMD_SA_options.MME_saved[model_filename_cleaned]
        try {
          var f = FSO_OBJ.OpenTextFile(System.Gadget.path + '\\TEMP\\MMD_MME_by_model.json', 2, true);
          f.Write(JSON.stringify(MMD_SA_options.MME_saved))
          f.Close()
          DEBUG_show("(MME settings deleted)", 2)
          System._browser.update_tray()
        }
        catch (err) {}
        break
      case "reset":
        if (!confirm("This will reset all visual effect settings to the original defaults (i.e. model-based effects enabled with default parameters, post-processing effects disabled)."))
          return
        MMD_SA_options.MME.self_overlay = { enabled:true }
        MMD_SA_options.MME.HDR = { enabled:true }
        MMD_SA_options.MME.serious_shader = { enabled:true }
        MMD_SA_options.MME.SAO = { disabled_by_material:[] }
        var PPE = MMD_SA_options.MME.PostProcessingEffects
        PPE.use_SAO = PPE.use_Diffusion = PPE.use_BloomPostProcess = false
        System.Gadget.Settings.writeString('Use3DSAO', '')
        System.Gadget.Settings.writeString('Use3DDiffusion', '')
        MMD_SA._MME_uniforms_updated_ = Date.now()
        System._browser.update_tray()
        break
      case "OFF":
        if (!confirm("This will disable all visual effects, and reset lighting/shadow to its default state."))
          return
        MMD_SA_options.MME.self_overlay = { enabled:false }
        MMD_SA_options.MME.HDR = { enabled:false }
        MMD_SA_options.MME.serious_shader = { enabled:false }
        MMD_SA_options.MME.SAO = { disabled_by_material:[] }
        var PPE = MMD_SA_options.MME.PostProcessingEffects
        PPE.enabled = PPE.use_SAO = PPE.use_Diffusion = PPE.use_BloomPostProcess = false
        System.Gadget.Settings.writeString('Use3DPPE', '')
        System.Gadget.Settings.writeString('Use3DSAO', '')
        System.Gadget.Settings.writeString('Use3DDiffusion', '')
        System.Gadget.Settings.writeString('MMDLightColor', '')
        System.Gadget.Settings.writeString('MMDLightPosition', '')
        System.Gadget.Settings.writeString('MMDShadow', '')
        var light = MMD_SA.light_list[1].obj
        light.color.set(MMD_SA_options.light_color)
        light.position.fromArray(MMD_SA_options.light_position).add(THREE.MMD.getModels()[0].mesh.position)
        MMD_SA._MME_uniforms_updated_ = Date.now()
        System._browser.update_tray()
        break
      case "Shadow":
        var shadow = parseFloat(para[2])
        if (shadow < 0)
          return
        if (shadow == 0) {
          MMD_SA_options.use_shadowMap = false
          System.Gadget.Settings.writeString('MMDShadow', '')
        }
        else {
          MMD_SA_options.use_shadowMap = true
          MMD_SA_options.shadow_darkness = shadow
          System.Gadget.Settings.writeString('MMDShadow', shadow)
        }
        MMD_SA.toggle_shadowMap()
//        System._browser.update_tray()
        break
      case "Light":
        var light = MMD_SA.light_list[1].obj
        switch (para[2]) {
          case "color":
            var color = parseInt(para[4])
            if (color < 0)
              return
            var index
            switch (para[3]) {
              case "red":
                index = 0
                break
              case "green":
                index = 1
                break
              case "blue":
                index = 2
                break
            }
            var color_p = ["r", "g", "b"]
            light.color[color_p[index]] = color / 255
            var hex = '#' + light.color.getHexString()
            System.Gadget.Settings.writeString('MMDLightColor', hex)
            DEBUG_show("Light color:" + hex, 3)
            break
          case "position":
            var pos = parseFloat(para[4])
            if (pos < -1)
              return
            var index
            switch (para[3]) {
              case "X":
                index = 0
                break
              case "Y":
                index = 1
                break
              case "Z":
                index = 2
                break
            }
            var model_pos = THREE.MMD.getModels()[0].mesh.position
            var pos_p = ["x", "y", "z"]
            var p = pos_p[index]
            light.position[p] = pos * MMD_SA_options.light_position_scale + model_pos[p]
            var pos_array = MMD_SA.TEMP_v3.copy(light.position).sub(model_pos).toArray()
            for (var i = 0; i < 3; i++)
              pos_array[i] = Math.round(pos_array[i]/MMD_SA_options.light_position_scale * 10) / 10
            System.Gadget.Settings.writeString('MMDLightPosition', JSON.stringify(pos_array))
            DEBUG_show("Light position:" + pos_array, 3)
            break
          case "reset":
            if (!confirm("This will reset lighting to its default state."))
              return
            System.Gadget.Settings.writeString('MMDLightColor', '')
            System.Gadget.Settings.writeString('MMDLightPosition', '')
            light.color.set(MMD_SA_options.light_color)
            light.position.fromArray(MMD_SA_options.light_position).add(THREE.MMD.getModels()[0].mesh.position)
            System._browser.update_tray()
            break
        }
        break
      case "PPE":
        var PPE = MMD_SA_options.MME.PostProcessingEffects
        switch (para[2]) {
          case "enabled":
            PPE.enabled = MMD_SA_options._PPE_enabled = !!parseInt(para[3])
            System.Gadget.Settings.writeString('Use3DPPE', ((PPE.enabled)?"non_default":""))
            System._browser.update_tray()
            break
          case "SAO":
            switch (para[3]) {
              case "disabled_by_material":
                var m_name = para[4]
                var disabled_by_material = MMD_SA_options.MME.SAO.disabled_by_material
                if (parseInt(para[5])) {
                  if (disabled_by_material.indexOf(m_name) == -1)
                    disabled_by_material.push(m_name)
                }
                else
                  MMD_SA_options.MME.SAO.disabled_by_material = disabled_by_material.filter(function (v) { return (v != m_name) })
                System._browser.update_tray()
                DEBUG_show('(Click "Save default" to save changes.)', 5)
                break
              default:
                PPE.use_SAO = !!parseInt(para[3])
                System.Gadget.Settings.writeString('Use3DSAO', ((PPE.use_SAO)?"non_default":""))
                break
            }
            break
          case "Diffusion":
            PPE.use_Diffusion = !!parseInt(para[3])
            System.Gadget.Settings.writeString('Use3DDiffusion', ((PPE.use_Diffusion)?"non_default":""))
            break
          case "BloomPostProcess":
            switch (para[3]) {
              case "blur_size":
                var v = parseFloat(para[4])
                if (v == -1)
                  return
                PPE.effects_by_name["BloomPostProcess"].blur_size = v
                System.Gadget.Settings.writeString('Use3DBloomPostProcessBlurSize', (v==0.5)?"":v)
                break
              case "threshold":
                var v = parseFloat(para[4])
                if (v == -1)
                  return
                PPE.effects_by_name["BloomPostProcess"].threshold = v
                System.Gadget.Settings.writeString('Use3DBloomPostProcessThreshold', (v==0.5)?"":v)
                break
              case "intensity":
                var v = parseFloat(para[4])
                if (v == -1)
                  return
                PPE.effects_by_name["BloomPostProcess"].intensity = v
                System.Gadget.Settings.writeString('Use3DBloomPostProcessIntensity', (v==0.5)?"":v)
                break
              default:
                PPE.use_BloomPostProcess = !!parseInt(para[3])
                System.Gadget.Settings.writeString('Use3DBloomPostProcess', ((PPE.use_BloomPostProcess)?"non_default":""))
                System._browser.update_tray()
                break
            }
            break
        }
        break
      case "SelfOverlay":
        var mme = MMD_SA_options.MME.self_overlay
        switch (para[2]) {
          case "opacity":
            var opacity = parseFloat(para[3])
            if (opacity < 0)
              return
            if (opacity == 0)
              mme.enabled = false
            else {
              mme.enabled = true
              mme.opacity = opacity
            }
            break
          case "brightness":
            var brightness = parseFloat(para[3])
            if (brightness < 0)
              return
            mme.brightness = brightness
            break
          case "color_adjust":
            var color = parseFloat(para[4])
            if (color < 0)
              return
            var color_adjust = mme.color_adjust || [1.5,1,1]
            var index
            switch (para[3]) {
              case "red":
                index = 0
                break
              case "green":
                index = 1
                break
              case "blue":
                index = 2
                break
            }
            color_adjust[index] = color
            mme.color_adjust = color_adjust
            break
          case "use_default":
            var use_default = parseInt(para[3])
            if (use_default) {
              MMD_SA_options.MME.self_overlay = Object.clone(MMD_SA_options.MME._self_overlay)
              MMD_SA._MME_uniforms_updated_ = Date.now()
              System._browser.update_tray()
              return
            }
            break
        }
        MMD_SA._MME_uniforms_updated_ = Date.now()
        MMD_SA_options.MME.self_overlay.use_default = false
        System._browser.update_tray()
        break
      case "HDR":
        var mme = MMD_SA_options.MME.HDR
        switch (para[2]) {
          case "opacity":
            var opacity = parseFloat(para[3])
            if (opacity < 0)
              return
            if (opacity == 0)
              mme.enabled = false
            else {
              mme.enabled = true
              mme.opacity = opacity
            }
            break
          case "use_default":
            var use_default = parseInt(para[3])
            if (use_default) {
              MMD_SA_options.MME.HDR = Object.clone(MMD_SA_options.MME._HDR)
              MMD_SA._MME_uniforms_updated_ = Date.now()
              System._browser.update_tray()
              return
            }
            break
        }
        MMD_SA._MME_uniforms_updated_ = Date.now()
        MMD_SA_options.MME.HDR.use_default = false
        System._browser.update_tray()
        break
      case "SeriousShader":
        var mme = MMD_SA_options.MME.serious_shader
        switch (para[2]) {
          case "OFF":
            mme.enabled = false
            break
          case "mode":
            mme.enabled = true
            var mode = parseInt(para[3])
            if (mode == 0)
              mme.type = "SeriousShader"
            else if (mode == 1)
              mme.type = "AdultShaderS2"
            else
              mme.type = "AdultShaderS"
//            mme.OverBright = (mme.type == "AdultShaderS2") ? 1.15 : 1.2
            break
          case "shadow_opacity":
            switch (para[3]) {
              case "material_x_0.5":
                if (!mme.material)
                  mme.material = {}
                var name = MMD_SA._material_list[para[4]]
                var v = (parseInt(para[5])) ? 0.5 : 1
                if (mme.material[name])
                  mme.material[name].shadow_opacity_scale = v
                else
                  mme.material[name] = { shadow_opacity_scale:v }
                break
              default:
                var opacity = parseFloat(para[3])
                if (opacity < 0)
                  return
                mme.shadow_opacity = opacity
              break
            }
            break
          case "OverBright":
            var over_bright = parseFloat(para[3])
            if (over_bright < 0)
              return
            mme.OverBright = over_bright
            break
          case "use_default":
            var use_default = parseInt(para[3])
            if (use_default) {
              MMD_SA_options.MME.serious_shader = Object.clone(MMD_SA_options.MME._serious_shader)
              MMD_SA._MME_uniforms_updated_ = Date.now()
              System._browser.update_tray()
              return
            }
            break
        }
        MMD_SA._MME_uniforms_updated_ = Date.now()
        MMD_SA_options.MME.serious_shader.use_default = false
        System._browser.update_tray()
        break
    }
    break

  case "look_at_camera":
    var _bool = !!parseInt(para[1])
    if (_bool)
      MMD_SA_options.look_at_screen = true
    else
      MMD_SA_options.look_at_screen = MMD_SA_options.look_at_mouse = false
    System.Gadget.Settings.writeString('MMDLookAtCamera', ((!MMD_SA_options.look_at_screen)?"non_default":""))
    System.Gadget.Settings.writeString('MMDLookAtMouse',  ((!MMD_SA_options.look_at_mouse) ?"non_default":""))
    break

  case "look_at_mouse":
    var _bool = !!parseInt(para[1])
    if (_bool)
      MMD_SA_options.look_at_mouse = MMD_SA_options.look_at_screen = true
    else
      MMD_SA_options.look_at_mouse = false
    System.Gadget.Settings.writeString('MMDLookAtCamera', ((!MMD_SA_options.look_at_screen)?"non_default":""))
    System.Gadget.Settings.writeString('MMDLookAtMouse',  ((!MMD_SA_options.look_at_mouse) ?"non_default":""))
    break

  case "trackball_camera":
    MMD_SA._trackball_camera.enabled = !!parseInt(para[1])
    System.Gadget.Settings.writeString('MMDTrackballCamera', ((!MMD_SA._trackball_camera.enabled)?"non_default":""))
    break

  case "random_camera":
    System.Gadget.Settings.writeString('MMDRandomCamera', ((!parseInt(para[1]))?"non_default":""))
    MMD_SA.reset_camera()
    break

  case "OSC_VMC_CLIENT":
    switch (para[1]) {
      case "enabled":
        MMD_SA.OSC.VMC.sender_enabled = !!parseInt(para[2]);
        break;
      case "send_camera_data":
        MMD_SA.OSC.VMC.send_camera_data = !!parseInt(para[2]);
        break;
      case "app_mode":
        MMD_SA.OSC.app_mode = para[2];
        break;
      case "hide_3D_avatar":
        MMD_SA.hide_3D_avatar = !!parseInt(para[2]);
        break;
    }
    break
}

if (linux_mode)
  System._browser.update_tray()
  }


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

// WebGL2 shader conversion
// http://www.shaderific.com/blog/2014/3/13/tutorial-how-to-update-a-shader-for-opengl-es-30
// https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html
// http://forum.playcanvas.com/t/webgl-2-0-and-engine-release-notes-v0-207-22-02-16/3445

 ,webgl2_vshader_prefix_convert: function (string) {
if (!this.use_webgl2)
  return string

string = '#version 300 es\n' + this.webgl2_vshader_main_convert(string) + '\nout vec4 SA_FragColor;\n\n'
return string
  }

 ,webgl2_fshader_prefix_convert: function (string) {
if (!this.use_webgl2)
  return string

string = '#version 300 es\n' + this.webgl2_fshader_main_convert(string) + '\nout vec4 SA_FragColor;\n\n'
return string
  }

 ,webgl2_common_convert: function (string) {
if (!this.use_webgl2)
  return string

string = string.replace(/texture([^\w\()\_])/g, "texSA$1").replace(/texture(2D|Cube)\(/g, "texture(").replace(/texture2DProj\(/g, "textureProj(").replace(/gl_FragColor/g, "SA_FragColor").replace(/\#extension GL_OES_standard_derivatives \: enable/, "")
//.replace(/gl_FragDepthEXT/g, "gl_FragDepth")
return string
  }

 ,webgl2_vshader_main_convert: function (string) {
if (!this.use_webgl2)
  return string

string = this.webgl2_common_convert(string).replace(/varying /g, "out ").replace(/attribute /g, "in ")
return string
  }

 ,webgl2_fshader_main_convert: function (string) {
if (!this.use_webgl2)
  return string

string = this.webgl2_common_convert(string).replace(/varying /g, "in ")
return string
  }

 ,webgl2_RGBA_internal: function (gl, format, type) {
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
// https://www.khronos.org/registry/webgl/specs/latest/2.0/

if (!this.use_webgl2)
  return format

if (type == gl.FLOAT) {
  return ((format == gl.RGBA) ? gl.RGBA32F : format)
}
return format//gl.RGBA8
  }

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

 ,ripple_process: (function () {
    var drop_list = []
    var pos_to_track
    var _timestamp = 0
    var _timestamp_to_renew = 0

    var v3_bone, v3a

    function get_pos(mesh, bone_name, v3) {
      return (v3||v3_bone).getPositionFromMatrix(mesh.bones_by_name[bone_name].skinMatrix).applyMatrix4(mesh.matrixWorld)
    }

    function ripple_reset() {
      for (var i = 0, i_max = MMD_SA_options.ripple_max; i < i_max; i++)
        drop_list[i] = new THREE.Vector4()
      pos_to_track = {}
      _timestamp = 0
      _timestamp_to_renew = 0
    }

    window.addEventListener("MMDStarted", function () {
      v3_bone = new THREE.Vector3()
      v3a = new THREE.Vector3()
      ripple_reset()
    });

    window.addEventListener("SA_Dungeon_onrestart", function () {
      ripple_reset()
    });

    return function () {
if (!MMD_SA.MMD_started)
  return drop_list

var timestamp = RAF_timestamp
if (_timestamp == timestamp)
  return drop_list

// first frame: initialize and return
if (!_timestamp) {
  _timestamp = timestamp
//左足首//ＩＫ
//右足首
  let mesh = THREE.MMD.getModels()[0].mesh
  pos_to_track.PC = {
    timestamp:_timestamp
   ,bones: [
  { name:"左足首", pos:get_pos(mesh, "左足首").clone() }
 ,{ name:"右足首", pos:get_pos(mesh, "右足首").clone() }
    ]
  };
  return drop_list
}

var t_diff = (timestamp - _timestamp) / 1000
_timestamp = timestamp

var index_free = []
var index_spare = []
var active_drop_count = 0
drop_list.forEach(function (drop, idx) {
  if (!drop.z) {
    index_free.push(idx)
    return
  }

  drop.w += 0.1 * t_diff*60*1.5
  if (drop.w > 50) {
    drop.z = 0
    index_free.push(idx)
  }
  else {
    active_drop_count++
    index_spare.push({ idx:idx, w:drop.w })
  }
});

//DEBUG_show([active_drop_count,drop_list[0].w,Date.now()].join("\n"))

// renew drop 10 times/sec
if (_timestamp_to_renew == PC_count_absolute)
  return drop_list
_timestamp_to_renew = PC_count_absolute

var d = MMD_SA_options.Dungeon

var index_spare_sorted = false
for (var model_name in pos_to_track) {
  var model_obj = pos_to_track[model_name]
  t_diff = (timestamp - model_obj.timestamp) / 1000
  if (t_diff == 0)
    continue

  var mesh
  if (model_name == "PC") {
    mesh = THREE.MMD.getModels()[0].mesh
  }

  var pos_base = get_pos(mesh, "全ての親", v3a)
  
  if (d) {
    let x = ~~(pos_base.x/d.grid_size)
    let y = ~~(pos_base.z/d.grid_size)
    let grid_para = d.get_para(x,y)
    let material_id = grid_para.floor_material_index
    if (material_id == null)
      material_id = d.floor_material_index_default
    let p = d.grid_material_list[material_id]
    if (!p || !p.waveBaseSpeed) continue

    let ground_y_water = d.get_para(x,y,true).ground_y_visible || 0
    if (pos_base.y > ground_y_water) continue

//DEBUG_show(pos_base.toArray().join("\n") + "\n\n" + get_pos(mesh, "左足首").toArray().join("\n"))
  }

  var drop_new_list = []
  model_obj.bones.forEach(function (bone, idx) {
    var pos = get_pos(mesh, bone.name)
    var dis_in_1_sec = pos.distanceTo(bone.pos) / t_diff
//DEBUG_show(dis_in_1_sec+'\n'+Date.now())
    if (dis_in_1_sec > 10) {
      var z = dis_in_1_sec/(30*2)
      drop_new_list.push({ bone_idx:idx, z:z })
    }
    bone.pos.copy(pos)
  });

  model_obj.timestamp = timestamp
  if (drop_new_list.length) {
    drop_new_list.sort(function (a,b) { return b.z-a.z })
    var drop_new_max = Math.min(2, drop_new_list.length, MMD_SA_options.ripple_max)
    if (index_free.length < drop_new_max) {
      if (!index_spare_sorted) {
        index_spare_sorted = true
        index_spare.sort(function (a,b) { return b.w-a.w })
      }
      for (var i = 0, i_max = drop_new_max-index_free.length; i < i_max; i++)
        index_free.push(index_spare.shift().idx)
    }

    for (var i = 0; i < drop_new_max; i++) {
      var drop_new = drop_list[index_free.shift()]
      var drop_new_para = drop_new_list[i]
      pos_base = model_obj.bones[drop_new_para.bone_idx].pos
      drop_new.x = pos_base.x
      drop_new.y = pos_base.z
      drop_new.z = Math.min(drop_new_para.z, 2)
//DEBUG_show(z_max*30+'\n'+Date.now())
      drop_new.w = 0//-2//
    }
  }
}

return drop_list
    };
  })()


// WebXR — loaded from js/mmd/webxr.js
 ,WebXR: MMD_SA_createWebXR()


 ,get_bone_axis_rotation: (function () {
    var RE_arm = new RegExp("^(" + toRegExp(["左","右"],"|") + ")(" + toRegExp(["肩","腕","ひじ","手首"],"|") + "|." + toRegExp("指") + ".)");

    return function (mesh, name_full, use_THREEX_bone) {
function bone_origin(name) {
  return (use_THREEX_bone) ? modelX.get_bone_origin_by_MMD_name(name): bones_by_name[name].pmxBone.origin;
}

var d = name_full.charAt(0)
var sign_LR = (d=="左") ? 1 : -1

var bones_by_name = mesh.bones_by_name

const modelX = MMD_SA.THREEX.get_model(mesh._model_index);
if (MMD_SA.THREEX.enabled && !bone_origin(name_full))
  use_THREEX_bone = false;

var x_axis, y_axis, z_axis;

const model_para = MMD_SA_options.model_para_obj_all[mesh._model_index];
// Not using .localCoordinate by default as it can be screwed up for some models
if (model_para.use_bone_localCoordinate && bones_by_name[name_full].pmxBone.localCoordinate) {
// z from .localCoordinate is already inverted
  x_axis = MMD_SA._v3a.fromArray(bones_by_name[name_full].pmxBone.localCoordinate[0]);
// z-axis inverted (?)
  z_axis = MMD_SA._v3b.fromArray(bones_by_name[name_full].pmxBone.localCoordinate[1])//.negate();
  if (sign_LR == -1) { x_axis.x *= -1; z_axis.x *= -1; }

  y_axis = MMD_SA.TEMP_v3.crossVectors(x_axis, z_axis).normalize().negate();
}
else {
  const axis_end = bones_by_name[name_full].pmxBone.end;
  const axis = (use_THREEX_bone || (typeof axis_end == 'number')) ? (((axis_end == -1) || !bone_origin(mesh.bones[axis_end]?.name)) ? MMD_SA._v3a.fromArray(bone_origin(name_full)).sub(MMD_SA._v3a_.fromArray(bone_origin(bones_by_name[name_full].parent.name))) : MMD_SA._v3a.fromArray(bone_origin(mesh.bones[axis_end].name)).sub(MMD_SA._v3a_.fromArray(bone_origin(name_full)))).normalize() : MMD_SA._v3a.fromArray(axis_end).normalize();

  if (RE_arm.test(name_full)) {
    x_axis = axis;
    if (sign_LR == -1) x_axis.x *= -1;

    z_axis = MMD_SA._v3b.set(0,0,1).applyQuaternion(MMD_SA._q1.setFromUnitVectors(MMD_SA._v3b_.set(1,0,0), x_axis));

    y_axis = MMD_SA.TEMP_v3.crossVectors(x_axis, z_axis).normalize().negate();
  } 
  else {
    y_axis = axis.negate();
    y_axis.z *= -1
    z_axis = MMD_SA._v3b.set(0,0,1).applyQuaternion(MMD_SA._q1.setFromUnitVectors(MMD_SA._v3b_.set(0,1,0), y_axis));
    sign_LR = 1

    x_axis = MMD_SA.TEMP_v3.crossVectors(y_axis, z_axis).normalize();
  }
}

let rot_m4 = MMD_SA.TEMP_m4.set(
    x_axis.x, x_axis.y, x_axis.z, 0,
    y_axis.x, y_axis.y, y_axis.z, 0,
    z_axis.x, z_axis.y, z_axis.z, 0,
    0,0,0,1
);

var r = new THREE.Quaternion().setFromBasis(rot_m4);

// you can only invert 2+ axes directly in quaternion by inverting the signs
// inverting .z and .y is the same as inverting .x and .w
if (sign_LR==1) { r.z *= -1; r.y *= -1; }
/*
let a = MMD_SA.TEMP_v3.setEulerFromQuaternion(r, 'ZYX')
a.z *= -1;
a.y *= -1;
r.setFromEuler(a, 'ZYX')
*/
//console.log(name_full, x_axis.clone(), y_axis.clone(), z_axis.clone(), x_axis.angleTo(z_axis))
//console.log(name_full, new THREE.Vector3().setEulerFromQuaternion(r, 'ZYX').multiplyScalar(180/Math.PI));

if (MMD_SA.THREEX.enabled && !use_THREEX_bone) {
  if (name_full.indexOf('指') != -1) {
    const r_v3 = MMD_SA.TEMP_v3.setEulerFromQuaternion(r, 'ZYX');
    r_v3.z -= Math.sign(r_v3.z) * 37.4224/180*Math.PI;
    r.setFromEuler(r_v3, 'ZYX');
  }
  else if (name_full.indexOf('足首') == -1) {
    r.set(0,0,0,1)
  }
}

return r;
    };
  })()

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

 ,Camera_MOD: (function () {
    let camera_mod;

    let vp, vt;
    let v1, v2, v3, v4, v5;
    window.addEventListener('jThree_ready', ()=>{
      vp = new THREE.Vector3();
      vt = new THREE.Vector3();
      v1 = new THREE.Vector3();
      v2 = new THREE.Vector3();
      v3 = new THREE.Vector3();
      v4 = new THREE.Vector3();
      v5 = new THREE.Vector3();

      camera_mod = class Camera_mod {
constructor(id) {
  this.id = id;
  this.pos_last = new THREE.Vector3();
  this.target_last = new THREE.Vector3();

  this.up_z_last = 0;

  Camera_mod.mod_list[id] = this;
}

adjust(pos, target, up_z) {
  Camera_mod.update_camera_base();

  const obj = MMD_SA._trackball_camera;

  if (pos) {
    Camera_mod.pos_last.sub(this.pos_last).add(pos);
    obj.object.position.copy(Camera_mod.c_pos).add(Camera_mod.pos_last);
    this.pos_last.copy(pos);
  }
  if (target) {
    Camera_mod.target_last.sub(this.target_last).add(target);
    obj.target.copy(Camera_mod.c_target).add(Camera_mod.target_last);
    this.target_last.copy(target);
  }
  if (up_z != null) {
    Camera_mod.up_z_last = Camera_mod.up_z_last - this.up_z_last + up_z;
    Camera_mod.rotate_up_z(obj.object.up, Camera_mod.c_up, Camera_mod.up_z_last);
    this.up_z_last = up_z;
  }
}

static update_camera_base() {
  const obj = MMD_SA._trackball_camera;

  Camera_mod.c_pos.copy(obj.object.position).sub(Camera_mod.pos_last);
  Camera_mod.c_target.copy(obj.target).sub(Camera_mod.target_last);

  if (Math.abs(Camera_mod.up_z_last) > 0.0001) {
    Camera_mod.rotate_up_z(Camera_mod.c_up, obj.object.up, -Camera_mod.up_z_last);
  }
}

static rotate_up_z(up_target, up, z) {
  const obj = MMD_SA._trackball_camera;

  const axis = Camera_mod.#v1.copy(obj.object.position).sub(obj.target).normalize();
  const up_rot = Camera_mod.#q1.setFromAxisAngle(axis, z);
  return up_target.copy(up).applyQuaternion(up_rot);
}

static #up = new THREE.Vector3(0,1,0);
static #q1 = new THREE.Quaternion();
static #q2 = new THREE.Quaternion();
static #v1 = new THREE.Vector3();
static #v2 = new THREE.Vector3();

static c_pos = new THREE.Vector3();
static c_target = new THREE.Vector3();
static pos_last = new THREE.Vector3();
static target_last = new THREE.Vector3();

static c_up = new THREE.Vector3();
static up_z_last = 0;

static mod_list = {};
static get_mod(id) {
  return Camera_mod.mod_list[id] || new Camera_mod(id);
}
      }

      window.addEventListener('MMDCameraReset_after', (e)=>{
        if (e.detail.enforced === false) return;

        System._browser.on_animation_update.add(()=>{
          var obj = MMD_SA._trackball_camera;
          obj.object.position.add(camera_mod.pos_last);
          obj.target.add(camera_mod.target_last);

          camera_mod.rotate_up_z(obj.object.up, obj.object.up, camera_mod.up_z_last);
        },0,0);
      });
    });

    return {
      get _obj() { return camera_mod; },

      adjust_camera: function (id, pos, target, up) {
if (!MMD_SA.MMD_started) return;

const c_mod = camera_mod.get_mod(id);
c_mod.adjust(pos, target, up);

return c_mod;
      },

      get_mod: function (id) {
return camera_mod.get_mod(id);
      },

      get_camera_base: function (ignore_list, update_camera_base) {
if (update_camera_base !== false)
  camera_mod.update_camera_base();

const pos = vp.copy(camera_mod.c_pos);
const target = vt.copy(camera_mod.c_target);
let up_z = camera_mod.up_z_last;

((ignore_list === true) ? Object.keys(camera_mod.mod_list) : ignore_list)?.forEach(id=>{
  const c = camera_mod.mod_list[id];
  if (c) {
    pos.add(c.pos_last);
    target.add(c.target_last);
    up_z += c.up_z_last;
  }
});

return {
  pos:pos,
  target:target,
  up_z: up_z,
};
      },

      get_camera_raw: function (update_camera_base, offset_rotation) {
const obj = MMD_SA._trackball_camera;

const cam_base_mod = this.get_camera_base(true, update_camera_base);
const pos_base = v4.copy(cam_base_mod.pos);
const target_base = v5.copy(cam_base_mod.target);
const up_z_base = cam_base_mod.up_z;
      
const cam_base_mod2 = this.get_camera_base(null, false);

let z = v1.setEulerFromQuaternion(obj.object.quaternion, 'YXZ').z;
const z_offset = up_z_base - cam_base_mod2.up_z;
z -= z_offset;

const pos = v2.copy(obj.object.position);
const pos_offset = pos_base.sub(cam_base_mod2.pos);
pos.sub(pos_offset);

const target = v3.copy(obj.target);
const target_offset = target_base.sub(cam_base_mod2.target);
target.sub(target_offset);

const model_pos = THREE.MMD.getModels()[0].mesh.position;
const cam_base_pos = v4.fromArray(MMD_SA_options.camera_position_base).add(MMD_SA.TEMP_v3.fromArray(MMD_SA.center_view)).add(model_pos);
const cam_base_target = v5.copy(THREE.MMD.getModels()[0].mesh.position).add(MMD_SA.TEMP_v3.fromArray(MMD_SA.center_view_lookAt)).add(MMD_SA.TEMP_v3.fromArray(MMD_SA_options.camera_lookAt));
if (offset_rotation) {
  const axis = v1.copy(cam_base_pos).sub(cam_base_target).normalize();
  const q = MMD_SA.TEMP_q.setFromUnitVectors(axis, MMD_SA.TEMP_v3.copy(pos).sub(target).normalize());
  pos.sub(target).applyQuaternion(q.conjugate()).add(target);
}

return {
  pos: pos.sub(cam_base_pos),
  target: target.sub(cam_base_target),
  up_z: z,
};
      },
    };
  })()

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
  TX.MMD_bone_tree = MMD_bone_tree;

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

    GUI: {
      obj: {},

      create: function () {
const gui = new THREE.GUI();

const host = SL_Host;
host.appendChild(gui.domElement);
gui.domElement.addEventListener('mousedown', (e)=>{
//  e.preventDefault();
  e.stopPropagation();
});

gui.domElement.addEventListener('click', (e)=>{ e.stopPropagation(); });
document.addEventListener('click', (e)=>{
  let d = document.activeElement;
  while (d) {
    d = d.parentElement;
    if (d == gui.domElement) {
      document.activeElement.blur();
//DEBUG_show(Date.now())
    }
  }
});

gui.add({
  'Hide Controls': function () {
    gui.hide();
  },
}, 'Hide Controls');
console.log(gui);

gui.hide();

return gui;
      },

      update: function (gui) {
gui.controllers.forEach(c=>{
  const v = c.object[c._name];
  if (typeof c != 'function')
    c.setValue(v);
});
      },

      init: async function () {
const GUI = await import(System.Gadget.path + '/three.js/libs/lil-gui.module.min.js');
THREE.GUI = GUI.GUI;

const gui = this.obj.visual_effects = this.create();

const gui_light_and_camera = gui.addFolder( 'Light and camera' );

window.addEventListener('MMDStarted', (()=>{
  function update_tray() {
    function f() {
      if (System._browser.camera.initialized) {
        System._browser.update_tray();
      }
      else {
        MMD_SA.reset_camera();
      }
    }

    System._browser.on_animation_update.remove(f, 0);
    System._browser.on_animation_update.add(f, 0,0);
  }

  function reset_camera() {
    function f() {
      System._browser.camera._update_camera_reset();
    }

    MMD_SA.reset_camera();
    System._browser.on_animation_update.remove(f, 1);
    System._browser.on_animation_update.add(f, 1,1);
  }

  return ()=>{
let dir_light_pos = MMD_SA_options._light_position;
threeX.light.params_directional_light_default = {
  color: MMD_SA_options._light_color,
  x: dir_light_pos[0],
  y: dir_light_pos[1],
  z: dir_light_pos[2],
};

const params = threeX.light.params_directional_light = Object.assign({
  reset: function () {
/*
    const light = MMD_SA.light_list[1].obj;
    System.Gadget.Settings.writeString('MMDLightColor', '');
    System.Gadget.Settings.writeString('MMDLightPosition', '');
    light.color.set(MMD_SA_options.light_color);
    light.position.fromArray(MMD_SA_options.light_position).add(THREE.MMD.getModels()[0].mesh.position);
    System._browser.update_tray();
*/
    gui_directional_light.controllers.forEach(c=>{c.reset()});
  },
}, threeX.light.params_directional_light_default);

const gui_directional_light = gui_light_and_camera.addFolder( 'Directional Light Parameters' );
gui_directional_light.addColor( params, 'color' ).onChange( function ( value ) {
  const light = MMD_SA.light_list[1].obj;
  System.Gadget.Settings.writeString('MMDLightColor', value);
  light.color.set(MMD_SA_options.light_color);
  update_tray();
});
for (const d of ['x', 'y', 'z']) {
  gui_directional_light.add( params, d, -1,1 ).onChange( function ( value ) {
    const v = Number(value);
    const light = MMD_SA.light_list[1].obj;
    v1.set(params.x, params.y, params.z);
    v1[d] = v;
    System.Gadget.Settings.writeString('MMDLightPosition', '[' + v1.toArray().join(',') + ']');
    light.position.fromArray(MMD_SA_options.light_position).add(_THREE.MMD.getModels()[0].mesh.position);
    update_tray();
  });
}
gui_directional_light.add( params, 'reset' );

dir_light_pos = MMD_SA_options.light_position;
Object.assign(params, {
  color: MMD_SA_options.light_color,
  x: dir_light_pos[0]/MMD_SA_options.light_position_scale,
  y: dir_light_pos[1]/MMD_SA_options.light_position_scale,
  z: dir_light_pos[2]/MMD_SA_options.light_position_scale,
});
gui_directional_light.controllers.forEach(c=>{c.updateDisplay()});

gui_directional_light.close();

const params_camera = Object.assign({
  reset: function () {
    gui_camera.controllers.forEach(c=>{c.reset()});
    reset_camera();
  },
}, {
  'FOV (main camera)': 50,
  'FOV (hand camera)': 60,
});

const hand_camera = MMD_SA_options.Dungeon_options?.item_base.hand_camera;

const gui_camera = gui_light_and_camera.addFolder( 'Camera' );
gui_camera.add( params_camera, 'FOV (main camera)', 30, 120, 1 ).onChange( function ( value ) {
  System.Gadget.Settings.writeString('LABEL_CameraFOV', (value==50)?'':value);
  MMD_SA._trackball_camera.object.fov = value;
  MMD_SA._trackball_camera.object.updateProjectionMatrix();

  reset_camera();
});
gui_camera.add( params_camera, 'FOV (hand camera)', 30, 120, 1 ).onChange( function ( value ) {
  if (hand_camera)
    hand_camera.fov = value;
});
gui_camera.add( params_camera, 'reset' );
gui_camera.close();

if (System.Gadget.Settings.readString('LABEL_CameraFOV'))
  params_camera['FOV (main camera)'] = parseInt(System.Gadget.Settings.readString('LABEL_CameraFOV'));
if (hand_camera) {
  if (hand_camera.fov) {
    params_camera['FOV (hand camera)'] = hand_camera.fov;
  }
  else {
    hand_camera.fov = params_camera['FOV (hand camera)'];
  }
}
threeX.GUI.update(gui_camera);
  };
})());
      },
    },

    load_scripts: async function () {
loading = true

//await System._browser.load_script('./three.js/three.min.js');

const THREE_module = await import(System.Gadget.path + '/three.js/' + threeX.three_filename);
self.THREE = {};
Object.assign(self.THREE, THREE_module);

const Geometry_module = await import(System.Gadget.path + '/three.js/Geometry.js');
Object.assign(self.THREE, Geometry_module);

self.THREE.XLoader = _THREE.XLoader;

if (MMD_SA_options.THREEX_options.use_OutlineEffect) {
// Jun 10, 2023
  const OutlineEffect_module = await import(System.Gadget.path + '/three.js/effects/OutlineEffect.js');
  Object.assign(self.THREE, OutlineEffect_module);
  console.log('OutlineEffect.js loaded')
}

if (MMD_SA_options.THREEX_options.use_MMD) {
  const MMD_module = await import(System.Gadget.path + '/three.js/loaders/MMDLoader.js');
  Object.assign(self.THREE, MMD_module);
  console.log('MMDLoader.js loaded')
  if (MMD_SA_options.THREEX_options.use_MMDAnimationHelper) {
    const MMDAnimationHelper_module = await import(System.Gadget.path + '/three.js/animation/MMDAnimationHelper.js');
    Object.assign(self.THREE, MMDAnimationHelper_module);
    console.log('MMDAnimationHelper.js loaded')
  }
}

// Apr 3, 2024
const GLTFLoader_module = await import(System.Gadget.path + '/three.js/loaders/GLTFLoader.js');
Object.assign(self.THREE, GLTFLoader_module);

//const GLTFExporter_module = await import(System.Gadget.path + '/three.js/exporters/GLTFExporter.js');
//Object.assign(self.THREE, GLTFExporter_module);

// three-vrm 1.0
if (use_VRM1) {
//  await System._browser.load_script('./three.js/three-vrm.min_OLD.js');
  const three_vrm_module = await System._browser.load_script(System.Gadget.path + '/three.js/three-vrm.module.min.js', true);
  Object.assign(self.THREE, three_vrm_module);
}
else {
  await System._browser.load_script('./three.js/three-vrm.min_v0.6.11.js');
}

THREE = self.THREEX = self.THREE
self.THREE = _THREE

//await this.PPE.init();

if (MMD_SA_options.Dungeon_options && MMD_SA_options.Dungeon.use_octree) await this.utils.load_octree();


// extend three-vrm START
// three.vrm 1.0
if (use_VRM1 && !THREE.VRMSpringBoneManager.prototype.setCenter) {
// https://github.com/pixiv/three-vrm/issues/1112
// https://pixiv.github.io/three-vrm/packages/three-vrm/docs/classes/VRMSpringBoneManager.html#joints
  THREE.VRMSpringBoneManager.prototype.setCenter = function (obj3d) {
    this.joints.forEach(joint=>{
//console.log(joint.center)
      joint.center = obj3d;
    });
  };
}
// extend three-vrm END


// extend three.js START

// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
// https://github.com/mrdoob/three.js/blob/master/src/math/Vector4.js
THREE.Quaternion.prototype.toAxisAngle = function () {
  if (this.w > 1) this.normalize(); // if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
  var angle = 2 * Math.acos(this.w);
  var s = Math.sqrt(1-this.w*this.w); // assuming quaternion normalised then w is less than 1, so term always positive.
  if (s < 0.0001) { // test to avoid divide by zero, s is always positive due to sqrt
    // if s close to zero then direction of axis not important
    x = 1;//this.x; // if it is important that axis is normalised then replace with x=1; y=z=0;
    y = 0;//this.y;
    z = 0;//this.z;
  } else {
    x = this.x / s; // normalise axis
    y = this.y / s;
    z = this.z / s;
  }

  return [new THREE.Vector3(x,y,z), angle]
};

// backward compatibility START

THREE.Euler.prototype.multiplyScalar = THREE.Vector3.prototype.multiplyScalar;
THREE.Euler.prototype.add = THREE.Vector3.prototype.add;
THREE.Euler.prototype.setEulerFromQuaternion = THREE.Euler.prototype.setFromQuaternion;
THREE.Euler.prototype.copy = function ( euler ) {
  if (euler._order === undefined) {
    this._x = euler.x;
    this._y = euler.y;
    this._z = euler.z;
  }
  else {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;
  }

  this._onChangeCallback();
  return this;
};

THREE.Box3.prototype.size = function (size_v3=new THREE.Vector3()) {
  return this.getSize(size_v3);
};
THREE.Box3.prototype.center = function (center_v3=new THREE.Vector3()) {
  return this.getCenter(center_v3);
};

THREE.Vector3.prototype.getPositionFromMatrix = THREE.Vector3.prototype.setFromMatrixPosition;

THREE.Quaternion.prototype.setFromEuler = (function () {
  const setFromEuler = THREE.Quaternion.prototype.setFromEuler;

  return function (euler, order) {
    if (order) euler._order = order;
    return setFromEuler.call(this, euler);
  };
})();

THREE.Matrix4.decompose = (function () {
  const decompose = THREE.Matrix4.decompose;

  return function (position, quaternion, scale) {
    if (position) return decompose.call(this, position, quaternion, scale);

    position = new THREE.Vector3();
    quaternion = new THREE.Quaternion();
    scale = new THREE.Vector3();

    decompose.call(this, position, quaternion, scale);
    return [position, quaternion, scale];
  };
})();

THREE.BufferGeometry.prototype.applyMatrix = THREEX.BufferGeometry.prototype.applyMatrix4;

THREE.Math = THREE.MathUtils;

Object.defineProperty(THREE.Object3D.prototype, 'renderDepth', {
  get: function () { return this.renderOrder; },
  set: function (v) { this.renderOrder = v; },
});

Object.defineProperty(THREEX.Mesh.prototype, 'useQuaternion', {
  get: ()=>true,
  set: ()=>{},
});

// backward compatibility END

// extend three.js END


loading = false;
loaded = true;

resolve_loading && resolve_loading();
    },

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
