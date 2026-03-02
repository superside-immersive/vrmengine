// motion-control.js — extracted from MMD_SA.js
// Motion shuffle, external motion loading, seek, and player control

window.MMD_SA_createMotionControl = function () {
return {

 motion_shuffle_index: -1
 ,motion_shuffle_started: false
 ,motion_shuffle: function () {
var vo = Audio_BPM.vo
var ignore_para = vo.motion_by_song_name_mode

var mmd = MMD_SA.MMD
var mm = mmd.motionManager
var para = (ignore_para) ? {} : mm.para_SA

var range

var motion_changed = false

var fading
// check the backup list ._motion_shuffle_list_default instead of .motion_shuffle_list_default since .motion_shuffle_list_default can be null sometimes
if (!MMD_SA_options._motion_shuffle && !MMD_SA_options._motion_shuffle_list_default) {
  fading = (MMD_SA.motion_shuffle_started && para.loopback_fading)

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
  var motion_index_old = (MMD_SA._force_motion_shuffle || !MMD_SA_options.motion_shuffle_list || (MMD_SA.motion_shuffle_index == -1)) ? -1 : MMD_SA_options.motion_shuffle_list[MMD_SA.motion_shuffle_index]
  if (MMD_SA._force_motion_shuffle || (!para.loop_count && (!MMD_SA_options.motion_shuffle_list || (++MMD_SA.motion_shuffle_index >= MMD_SA_options.motion_shuffle_list.length)))) {
    MMD_SA_options.motion_shuffle_list = (MMD_SA_options.motion_shuffle_list_default && MMD_SA_options.motion_shuffle_list_default.slice(0).shuffle()) || MMD_SA_options._motion_shuffle_list || MMD_SA_options.motion_shuffle.slice(0).shuffle()
//if (MMD_SA_options._motion_shuffle_list) DEBUG_show(MMD_SA_options.motion_shuffle_list,0,1)
    MMD_SA_options._motion_shuffle_list = null
    MMD_SA.motion_shuffle_index = 0
  }

  var motion_index = MMD_SA_options.motion_shuffle_list[MMD_SA.motion_shuffle_index]

  if ((motion_index_old != motion_index) || (MMD_SA.motion_index_for_external == motion_index)) {
    var filename_old = (MMD_SA.use_jThree) ? ((MMD_SA.motion_shuffle_started) ? mm.filename : "<CHANGED>") : null

    mm = mmd.motionManager = MMD_SA.motion[motion_index]
    para = (ignore_para) ? {} : mm.para_SA
    para.loop_count = 0

    motion_changed = (filename_old) ? (filename_old != mm.filename) : ((motion_index_old != -1) || (motion_index != 0))
    fading = (MMD_SA.motion_shuffle_started && (motion_changed || para.loopback_fading))
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

MMD_SA.motion_shuffle_started = true

if (mm.firstFrame_)
  mmd.setFrameNumber(mm.firstFrame_)

if (MMD_SA._no_fading)
  fading = MMD_SA._no_fading = false
var xr = MMD_SA.WebXR
MMD_SA.fading = fading && (!xr.session || (xr.use_dummy_webgl && (!xr.user_camera.initialized || xr.user_camera.visible)));
if (!fading)
  return motion_changed

if (!MMD_SA.OSC.VMC.sender_enabled)
  MMD_SA.fadeout_opacity = 1;
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

};
};
