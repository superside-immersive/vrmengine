// MMD_SA audio — BPM sender, drag-drop handler, audio init
// Extracted from MMD_SA.js lines 253-1039 (// audio START … // audio END)

/**
 * Initialise the audio/BPM subsystem inside MMD_SA.init().
 * All referenced names (MMD_SA, MMD_SA_options, Audio_BPM, DragDrop, …)
 * are expected to exist on `window` at call time.
 * @returns {{ sender, vo }}
 */
window.MMD_SA_initAudio = function () {

// audio START
var sender = {
  _playbackRate: 1
 ,defaultPlaybackRate: 1
 ,pause: function () {}
 ,play: function () {}
}

Object.defineProperty(sender, "playbackRate",
{
  get: function () {
var vo = Audio_BPM.vo;
if (vo.BPM_mode) {
  const img = (this._EQP_obj || {});
  const ao = vo.audio_obj;
  const bpm = ao.BPM || 120;
  let speed = bpm/vo.BPM;
//  if (speed < 0.75) speed *= 2;
  this.defaultPlaybackRate = this._playbackRate = img._playbackRate = speed * (vo.playbackRate_scale || 1);
}

return this._playbackRate;
  }
 ,set: function (v) {
this._playbackRate = v
  }
});

var vo
vo = Audio_BPM.vo = sender.vo = {
  is_webgl:true
 ,_sender: sender

 ,beat_reference: 1//dummy
}

Object.defineProperty(vo, "BPM",
{
  get: function () {
var para = MMD_SA.MMD.motionManager.para_SA
// default to 120 to avoid errors when para_SA is not predefined
return ((para.BPM) ? para.BPM.BPM : 120)
  }
});


vo.audio_onended = function (e) {
  if (!MMD_SA_options.MMD_disabled) {
    vo.BPM_mode = false
    vo.motion_by_song_name_mode = false

    sender.defaultPlaybackRate = sender.playbackRate = 1
    MMD_SA.MMD.frame_time_ref = 0

    if (MMD_SA_options._motion_shuffle_list_default) {
      MMD_SA_options.motion_shuffle = MMD_SA_options._motion_shuffle_list_default.slice(0)
      MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice(0)
      MMD_SA._force_motion_shuffle = true
    }
  }

  SL_MC_Place(-1)

  var EC = MMD_SA_options.MME && MMD_SA_options.MME.PostProcessingEffects
  var music_canvas = EC && EC._music_canvas
  if (music_canvas) {
    EC._texture_common['[music canvas]'].needsUpdate = true
    music_canvas.getContext("2d").clearRect(0,0, 512,2)
  }

  if (MMD_SA_options.PPE_disabled_on_idle) {
    MMD_SA_options.MME.PostProcessingEffects.enabled = false
  }
  MMD_SA_options.audio_onended && MMD_SA_options.audio_onended()

  window.dispatchEvent(new CustomEvent("SA_audio_onended"));

  DEBUG_show("Audio:END", 2)
}

Audio_BPM.checkWinamp(vo)

DragDrop_RE = eval('/\\.(' + DragDrop_RE_default_array.concat(["vmd", "bvh", "mp3", "wav", "aac", "zip", "json", "vrm", "vrma", "fbx", "gltf", "glb", "exr", "hdr"]).join("|") + ')$/i')

DragDrop.onDrop_finish = async function (item) {
  function load_motion(func) {
if (MMD_SA.MMD_started) {
  func();
  return;
}

if (!System._browser.video_capture.trigger_on_startup_motion) {
  DEBUG_show('(No custom motion before start)', 2);
  return;
}

const ev = (MMD_SA_options.Dungeon_options) ? 'SA_Dungeon_onstart' : 'MMDStarted';
if (typeof System._browser.video_capture.trigger_on_startup_motion == 'function')
  window.removeEventListener(ev, System._browser.video_capture.trigger_on_startup_motion);

System._browser.video_capture.trigger_on_startup_motion = ()=>{
  System._browser.on_animation_update.add(async ()=>{
    await func();

    System._browser.on_animation_update.add(async ()=>{
      MMD_SA.seek_motion(0);
      MMD_SA.motion_player_control.pause();
      await System._browser.video_capture.start();
    }, 0,1);
  }, 10,0);
};

window.addEventListener(ev, System._browser.video_capture.trigger_on_startup_motion);

DEBUG_show('(Startup motion added)', 2);
  }

  const promises_to_return = [];
  window.dispatchEvent(new CustomEvent('SA_dragdrop_start', { detail:{ item:item, promises_to_return:promises_to_return } }));
  const results = await Promise.all(promises_to_return);
  if (results.some(r=>r)) return;

  let src = item.path;
//DEBUG_show(src,0,1)
  if (item.isFileSystem && /([^\/\\]+)\.zip$/i.test(src)) {
//DEBUG_show(toFileProtocol(src))
//    if (!MMD_SA.jThree_ready) return;

    const zip_file = SA_topmost_window.DragDrop._path_to_obj[src.replace(/^(.+)[\/\\]/, "")]

const zip = await new self.JSZip().loadAsync(zip_file, {
  decodeFileName: (function () {
    const decoder = new TextDecoder('shift-jis')
    return function (bytes) {
      return decoder.decode(bytes);
    };
  })()
});

// will be called, even if content is corrupted
//console.log(999,src)

if (!MMD_SA.MMD_started) {
  SA_topmost_window.DragDrop._zip_by_url = SA_topmost_window.DragDrop._zip_by_url || {};
  SA_topmost_window.DragDrop._zip_by_url[src] = zip;
}
else {
  XMLHttpRequestZIP.zip_by_url(src, zip);
}

const motion_list = zip.file(/[^\/\\]+.vmd$/i);
const motion_set_list = motion_list.filter(motion=>{
  const motion_filename = motion.name.replace(/^.+[\/\\]/, "").replace(/\.\w+$/, "");

  let is_motion_set;

  const morph_vmd = motion_filename + '_morph';
  if (motion_list.some(m=>m.name.indexOf(morph_vmd)!=-1)) {
    is_motion_set = true;
    const para_SA = MMD_SA_options.motion_para[motion_filename] = MMD_SA_options.motion_para[motion_filename] || {};
    if (!para_SA.morph_component_by_filename)
      para_SA.morph_component_by_filename = morph_vmd;
  }

  const camera_vmd = motion_filename + '_camera';
  if (motion_list.some(m=>m.name.indexOf(camera_vmd)!=-1)) {
    is_motion_set = true;
    const para_SA = MMD_SA_options.motion_para[motion_filename] = MMD_SA_options.motion_para[motion_filename] || {};
    if (!para_SA.camera_component_by_filename)
      para_SA.camera_component_by_filename = camera_vmd;
  }

  return is_motion_set;
});

let files_added
let music_list = zip.file(/[^\/\\]+.(mp3|wav|aac)$/i)
if (music_list.length) {
  if (!MMD_SA_options.motion_by_song_name)
    MMD_SA_options.motion_by_song_name = {}

  let keys_used = []
  for (let music_filename in MMD_SA_options.motion_by_song_name) {
    let k = MMD_SA_options.motion_by_song_name[music_filename].key
    if (k)
      keys_used.push(k)
  }

  let keys_available = []
  for (let i = 1; i <= 9; i++) {
    if (keys_used.indexOf(i) == -1)
      keys_available.push(i)
  } 

  keys_used = []
  music_list.slice(0,keys_available.length).forEach(function (music) {
    var music_filename = music.name.replace(/^.+[\/\\]/, "").replace(/\.\w+$/, "")
//DEBUG_show(music_filename,0,1)
    var vmd = motion_list.find(m=>m.name.indexOf(music_filename+'.')!=-1);
    if (vmd) {
      files_added = true
      let k = keys_available.shift()
      keys_used.push(k)

      const video = zip.file(new RegExp(toRegExp(music_filename) + '_video\\.(mp4|mkv|webm)$', 'i'));

      MMD_SA_options.motion_by_song_name[music_filename] = {
  motion_path: (src + "#/" + vmd.name)
 ,song_path: (src + "#/" + music.name)
 ,video_path: video.length && (src + "#/" + video[0].name)
 ,key: k
      };

      if (!MMD_SA.MMD_started && System._browser.video_capture.trigger_on_startup_motion) {
        const ev = (MMD_SA_options.Dungeon_options) ? 'SA_Dungeon_onstart' : 'MMDStarted';
        if (typeof System._browser.video_capture.trigger_on_startup_motion == 'function')
          window.removeEventListener(ev, System._browser.video_capture.trigger_on_startup_motion);

        System._browser.video_capture.trigger_on_startup_motion = ()=>{
          System._browser.on_animation_update.add(()=>{
MMD_SA_options.use_CircularSpectrum = false;

window.addEventListener('SA_motion_by_song_name_mode_onstart', (e)=>{
  const promise = new Promise((resolve)=>{
    System._browser.on_animation_update.add(async ()=>{
      await System._browser.video_capture.start();
      resolve();
    }, 0,0);
  });

  e.detail.result.promise = promise;
}, {once:true});

document.dispatchEvent(new KeyboardEvent('keydown', { keyCode:96+k }));
          }, 10,0);
        };

        window.addEventListener(ev, System._browser.video_capture.trigger_on_startup_motion);
      }
    }
  });

  if (files_added)
    DEBUG_show("Music/Motion list updated (key:" + keys_used.join(",") + ")", 3)
}
else if (motion_set_list.length) {
  System._browser.on_animation_update.add(()=>{ DragDrop.onDrop_finish({ isFileSystem:true, path:src + '#/' + motion_set_list[0].name }); }, 0,0);
}

if (!MMD_SA.jThree_ready) return;

const pmx_list = zip.file(/\.pmx$/i);
let vrm_list = [];
if (!pmx_list.length) {
  if (MMD_SA_options.use_THREEX)
    vrm_list = zip.file(/\.vrm$/i);

  files_added = files_added || !!vrm_list.length;
  if (!files_added) {
    if (!vrm_list.length)
      DEBUG_show("(No 3D model found)")
    return
  }
}

const sb = document.getElementById("LMMD_StartButton")

if (pmx_list.length) {
  MMD_SA._init_my_model = null;

  MMD_SA.THREEX.enabled = false

  const model_filename = pmx_list[0].name.replace(/^.+[\/\\]/, "")

  MMD_SA._init_my_model = function () {
    MMD_SA.init_my_model(src, pmx_list[0].name)
  };

  if (sb) {
    let info_extra = "";
    let model_json = zip.file(/model\.json$/i);
    if (model_json.length) {
      info_extra = "(+config)";
      const json = await model_json[0].async("text");
Object.assign(MMD_SA_options.model_para, JSON.parse(json, function (key, value) {
  if (typeof value == "string") {
    if (/^eval\((.+)\)$/.test(value)) {
      value = eval(decodeURIComponent(RegExp.$1))
    }
  }
  return value
}));
console.log("(model.json updated)");
    }

    sb._msg_mouseover = [
  model_filename + info_extra
 ,System._browser.translation.get('MMD.start.custom_model')
    ].join("\n");
    DEBUG_show(sb._msg_mouseover, -1);

    if (MMD_SA._click_to_reset)
      Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
    MMD_SA._click_to_reset = function () {
MMD_SA._init_my_model = null;
SystemAnimator_caches.delete(["/user-defined-local/my_model.zip", "/user-defined-local/my_model.vrm"]);
System.Gadget.Settings.writeString("LABEL_3D_model_path", "");
// reset THREEX.enabled to default
MMD_SA.THREEX.enabled = true
sb._msg_mouseover = sb._msg_mouseover_default;
DEBUG_show(sb._msg_mouseover, -1);
Ldebug.style.cursor = "default";
Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
MMD_SA._click_to_reset = null;
    };
    Ldebug.style.cursor = "pointer";
    Ldebug.addEventListener("click", MMD_SA._click_to_reset);
  }

  SystemAnimator_caches.put("/user-defined-local/my_model.zip", new Response(zip_file, {status:200, statusText:"custom_PC_model|my_model.zip"}));
  if (webkit_electron_mode)
    System.Gadget.Settings.writeString("LABEL_3D_model_path", src);
}
else if (vrm_list.length) {
  MMD_SA._init_my_model = null;

  MMD_SA.THREEX.enabled = true
  MMD_SA_options.THREEX_options.model_path = src + '#/' + vrm_list[0].name

  const model_filename = vrm_list[0].name.replace(/^.+[\/\\]/, "")

  if (sb) {
    let info_extra = ''
    let model_json = zip.file(/model\.json$/i);
    if (model_json.length) {
      info_extra = "(+config)";
      const json = await model_json[0].async("text");
Object.assign(MMD_SA_options.THREEX_options.model_para, JSON.parse(json, function (key, value) {
  if (typeof value == "string") {
    if (/^eval\((.+)\)$/.test(value)) {
      value = eval(decodeURIComponent(RegExp.$1))
    }
  }
  return value
}));
console.log("(model.json updated)");
    }

    sb._msg_mouseover = [
  model_filename + info_extra
 ,System._browser.translation.get('MMD.start.custom_model')
    ].join("\n");
    DEBUG_show(sb._msg_mouseover, -1);

    if (MMD_SA._click_to_reset)
      Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
    MMD_SA._click_to_reset = function () {
SystemAnimator_caches.delete(["/user-defined-local/my_model.zip", "/user-defined-local/my_model.vrm"]);
System.Gadget.Settings.writeString("LABEL_3D_model_path", "");
MMD_SA_options.THREEX_options.model_path = MMD_SA_options.THREEX_options.model_path_default;
sb._msg_mouseover = sb._msg_mouseover_default;
DEBUG_show(sb._msg_mouseover, -1);
Ldebug.style.cursor = "default";
Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
MMD_SA._click_to_reset = null;
    };
    Ldebug.style.cursor = "pointer";
    Ldebug.addEventListener("click", MMD_SA._click_to_reset);
  }

  SystemAnimator_caches.put("/user-defined-local/my_model.zip", new Response(zip_file, {status:200, statusText:"custom_PC_model|my_model.zip"}));
  if (webkit_electron_mode)
    System.Gadget.Settings.writeString("LABEL_3D_model_path", src);
}

//console.log(DragDrop)
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(vrm)$/i.test(src)) {
    if (MMD_SA.MMD_started) {
      if (MMD_SA.THREEX.enabled) {
        MMD_SA.THREEX.VRM.load_extra(src);
      }
      return;
    }

    if (!MMD_SA_options.use_THREEX) return;
    if (!MMD_SA.jThree_ready) return;

    MMD_SA._init_my_model = null;

    MMD_SA.THREEX.enabled = true
    MMD_SA_options.THREEX_options.model_path = src

    const sb = document.getElementById("LMMD_StartButton")

    const model_filename = src.replace(/^.+[\/\\]/, "")

    if (sb) {
      let info_extra = ''
      sb._msg_mouseover = [
  model_filename + info_extra
 ,System._browser.translation.get('MMD.start.custom_model')
      ].join("\n");
      DEBUG_show(sb._msg_mouseover, -1);

      if (MMD_SA._click_to_reset)
        Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
      MMD_SA._click_to_reset = function () {
SystemAnimator_caches.delete(["/user-defined-local/my_model.zip", "/user-defined-local/my_model.vrm"]);
System.Gadget.Settings.writeString("LABEL_3D_model_path", "");
MMD_SA_options.THREEX_options.model_path = MMD_SA_options.THREEX_options.model_path_default;
sb._msg_mouseover = sb._msg_mouseover_default;
DEBUG_show(sb._msg_mouseover, -1);
Ldebug.style.cursor = "default";
Ldebug.removeEventListener("click", MMD_SA._click_to_reset);
MMD_SA._click_to_reset = null;
      };
      Ldebug.style.cursor = "pointer";
      Ldebug.addEventListener("click", MMD_SA._click_to_reset);
    }

    if (browser_native_mode)
      SystemAnimator_caches.put("/user-defined-local/my_model.vrm", new Response(SA_topmost_window.DragDrop._path_to_obj[model_filename], {status:200, statusText:"custom_PC_model|"+model_filename}));
    if (webkit_electron_mode)
      System.Gadget.Settings.writeString("LABEL_3D_model_path", src);
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(vmd|bvh)$/i.test(src) || (item.isFileSystem && /([^\/\\]+)\.(fbx|glb|vrma)$/i.test(src) && (!MMD_SA.THREEX.enabled || MMD_SA.THREEX.utils.convert_THREEX_motion_to_VMD))) {
    const filename = RegExp.$1;

    if (/\.vrma$/i.test(src) && !MMD_SA.THREEX.enabled) {
      DEBUG_show("(VRMA is for VRM model only.)", 3);
      return;
    }

    if (MMD_SA.music_mode) {
      DEBUG_show("(no external motion while music is still playing)", 3);
      return
    }
    if (MMD_SA._busy_mode1_) {
      return
    }

    load_motion(async ()=>{
      const index = MMD_SA_options.motion_index_by_name[filename];
      if ((index != null) && MMD_SA.motion[index]) {
        MMD_SA_options.motion_shuffle = [index];
        MMD_SA_options.motion_shuffle_list_default = null;
        MMD_SA._force_motion_shuffle = true;
      }
      else {
        await MMD_SA.load_external_motion(src);
      }

      if (System._browser.camera.initialized) System._browser.on_animation_update.add(()=>{ System._browser.camera._update_camera_reset(); }, 1,1);
    });
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(fbx|glb)$/i.test(src)) {
    load_motion(async ()=>{
      const model = MMD_SA.THREEX.get_model(0);
      const action_index = model.animation.find_action_index(src.replace(/^.+[\/\\]/, "").replace(/\.(fbx|glb)$/i, ""));
      if (action_index != -1) {
        model.animation.play(action_index);
        model.animation.enabled = true;
      }
      else {
        DEBUG_show('(THREEX motion loading)', 2)

        // Load animation
        const clip = await MMD_SA.THREEX.utils.load_THREEX_motion( src, model );

        model.animation.add_clip(clip);
        model.animation.enabled = true;
//console.log(clip)
        MMD_SA.reset_camera();
        DEBUG_show('(THREEX motion ready)', 2)
      }
    });
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(exr|hdr)$/i.test(src)) {
    MMD_SA.THREEX.utils.HDRI.load(src, true);
  }
  else if (item.isFolder) {
    Audio_BPM.play_list.drop_folder(item)
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(mp3|wav|aac)$/i.test(src)) {
    if (MMD_SA_options.MMD_disabled) {
//      DEBUG_show("(music playback disabled)", 2)
if (!SL._media_player) {
  SL_MC_simple_mode = true

  SL._media_player = SL_MC_video_obj = new Audio()//document.createElement("audio")

  SL_MC_video_obj.addEventListener("canplaythrough", function (e) {
SL_MC_Place()

if (self.AudioFFT) {
  AudioFFT.connect(this)
}
  }, true)

  SL_MC_video_obj.addEventListener("playing", function (e) {
// mainly to prevent timeupdate event from detecting a wrong "stop" when playing the second (and so on) music
this._started = true
  }, true)

  SL_MC_video_obj.addEventListener("ended", function (e) {
SL_MC_Place(-1)
  }, true)

  SL_MC_video_obj.addEventListener("timeupdate", function (e) {
if (this._started && this.paused && !this.currentTime)
  SL_MC_Place(-1)
else
  SL_MC_Timeupdate(this)
  }, true)

  SL_MC_video_obj.autoplay = true
}
      SL_MC_video_obj = SL._media_player
      SL_MC_video_obj._started = false
      SL_MC_video_obj.src = toFileProtocol(src)
      return  
    }

    if (!THREE.MMD.motionPlaying) {
      DEBUG_show("(motion paused)", 2)
      return
    }

    var filename = RegExp.$1

    if (!MMD_SA_options.motion_shuffle) {
      if (!MMD_SA_options.motion_by_song_name) MMD_SA_options.motion_by_song_name = {}
      MMD_SA_options.motion_by_song_name[filename] = { motion_name:MMD_SA.MMD.motionManager.filename }
    }
    var motion_by_song_name = MMD_SA_options.motion_by_song_name && MMD_SA_options.motion_by_song_name[filename]

    let load_promise;
    if (motion_by_song_name) {
      vo.motion_by_song_name_mode = true
      MMD_SA.playbackRate = 0

      if (motion_by_song_name.video_path) {
        if (!vo.media_linked) vo.media_linked = [];
        let video = vo.media_linked.find(m=>m.id=='motion_bg_video');
        if (!video) {
          video = document.createElement('video');
          vo.media_linked.push(video);
          video.id = 'motion_bg_video';
          video.muted = true;
          video.autoplay = false;
          video.style.position = 'absolute';
          video.style.left = video.style.top = '0px';
          video.style.zIndex = 0;
          video.style.objectFit = "cover";
          video.style.visibility = 'hidden';
          const SL = MMD_SA.THREEX.SL;
          MMD_SA.THREEX.SL.parentElement.appendChild(video);

          video.style.width = SL.width + 'px';
          video.style.height = SL.height + 'px';
          window.addEventListener('SA_MMD_SL_resize', ()=>{
            video.style.width = SL.width + 'px';
            video.style.height = SL.height + 'px';
          });
        }
        load_promise = new Promise((resolve)=>{
          System._browser.update_obj_url(motion_by_song_name.video_path).then(()=>{
            video._src_raw = motion_by_song_name.video_path;
            video.src = toFileProtocol(motion_by_song_name.video_path);
            resolve();
          });
        });
      }
    }
    else if (MMD_SA_options.audio_to_dance_disabled) {
      return;
    }
    else {
      vo.motion_by_song_name_mode = false

      if (!MMD_SA.MMD.motionManager.para_SA.BPM) {
        if (MMD_SA_options._motion_shuffle && MMD_SA.motion[MMD_SA_options._motion_shuffle[0]].para_SA.BPM) {
          MMD_SA_options._motion_shuffle_list = null
          var song_para = MMD_SA_options.motion_shuffle_by_song_name && MMD_SA_options.motion_shuffle_by_song_name[filename]
          if (song_para) {
            MMD_SA_options._motion_shuffle_list = song_para.motion_shuffle_list.slice(0)

            var EC = MMD_SA_options.MME.PostProcessingEffects
            if (song_para.MME_bg_shuffle && EC && EC.enabled && EC.effects.length) {
              var sg = EC.shuffle_group[song_para.MME_bg_shuffle.group_id]
              sg.shuffle_list = song_para.MME_bg_shuffle.shuffle_list.slice(0)
              sg.shuffle_list_index = null
            }
          }
          MMD_SA_options.motion_shuffle = MMD_SA_options._motion_shuffle.slice(0)
          MMD_SA_options.motion_shuffle_list_default = null
          MMD_SA._force_motion_shuffle = true
        }
        else
          return
      }
    }

    var ao = vo.audio_obj = (item._winamp_JSON) ? vo.audio_obj_WINAMP : ((vo.audio_obj && !vo.audio_obj.is_winamp) ? vo.audio_obj : vo.audio_obj_HTML5)
    if (ao && ((ao._ao_linked || ao._ao_linked_list) || ((ao == vo.audio_obj_HTML5) && self.AudioFFT)))
      ao = null

    if (ao) {
      ao._timed = null
    }
    else {
      if (item._winamp_JSON) {
        ao = vo.audio_obj = vo.audio_obj_WINAMP = Audio_BPM.createPlayer(vo, item._winamp_JSON)
      }
      else {
        ao = vo.audio_obj = vo.audio_obj_HTML5 = Audio_BPM.createPlayer(vo)

        ao.addEventListener('play', ()=>{
vo.media_linked && vo.media_linked.forEach(m=>{
  const active = m._src_raw.indexOf(filename) != -1;
  if (active) {
    if (m.currentTime)
      m.currentTime = 0;
    m.play();
    m.style.visibility = 'inherit';
  }
});
        });
        ao.addEventListener('pause', ()=>{
vo.media_linked && vo.media_linked.forEach(m=>{
  const active = m._src_raw.indexOf(filename) != -1;
  if (active) {
    m.pause();
  }
});
        });
        ao.addEventListener('seeking', ()=>{
vo.media_linked && vo.media_linked.forEach(m=>{
  const active = m._src_raw.indexOf(filename) != -1;
  if (active) {
    m.currentTime = ao.currentTime;
  }
});
        });
        window.addEventListener('SA_audio_onended', ()=>{
vo.media_linked && vo.media_linked.forEach(m=>{
  const active = (m._src_raw.indexOf(filename) != -1) && (m.style.visibility != 'hidden');
  if (active) {
    m.pause();
    m.currentTime = 0;
    m.style.visibility = 'hidden';
  }
});
        });

        ao.onplaying = async function (e) {//ontimeupdate = function (e) {//
if (ao._timed) return;
ao._timed = true;
//if (!this.currentTime) return;
//if (this.currentTime) return;

if (vo.motion_by_song_name_mode) {
  let duration = Math.max(THREE.MMD.getCameraMotion().length && THREE.MMD.getCameraMotion()[0].duration, THREE.MMD.getModels()[0].skin.duration);
  if (vo.audio_obj.duration > duration) {
    jThree.MMD.duration = duration = vo.audio_obj.duration + 0.1;
// a must when duration is changed during playback (i.e. after MMD_SA.motion_shuffle())
    MMD_SA.MMD.motionManager.lastFrame_ = null;
  }

  MMD_SA.seek_motion(this.currentTime);

  MMD_SA.playbackRate = 1;

  const result = {};
  window.dispatchEvent(new CustomEvent("SA_motion_by_song_name_mode_onstart", { detail:{ result:result } }));
  if (result.promise) {
//    this.pause();
    SL_MC_Play();
    await result.promise;
  }
}

if (this.currentTime) DEBUG_show('Audio:START(' + (parseInt(this.currentTime*1000)/1000) + 's)', 2);
        }
      }

      ao._on_playing = function () {
if (ao._MMD_SA_on_playing_skipped) {
  ao._MMD_SA_on_playing_skipped = null
  return
}

if (ao.is_winamp)
  ao.ended = false

var mmd = MMD_SA.MMD
mmd.frame_time_ref = 0
if (vo.motion_by_song_name_mode) {
  if (!ao.ontimeupdate)
    MMD_SA.seek_motion(0)
}
else {
  var para = mmd.motionManager.para_SA.BPM || {}
  if (para.rewind) {
//    MMD_SA.seek_motion((mmd.motionManager.firstFrame_ + parseInt(ao.currentTime * 30 * vo._sender.playbackRate)) / 30)
  }
//DEBUG_show(ao.beat_reference,0,1)
/*
  if (ao.BPM < 110) {
    vo.playbackRate_scale = 1.50
    DEBUG_show("Playback rate x 1.5", 2)
  }
*/
}

SL_MC_video_obj = sender;
SL_MC_Place(1, 0,-64);

if (MMD_SA_options.PPE_disabled_on_idle) {
  var PPE = MMD_SA_options.MME.PostProcessingEffects
  if (MMD_SA_options._PPE_enabled && !PPE.enabled) {
    PPE.enabled = true
//    System._browser.update_tray()
  }
}
MMD_SA_options.audio_onstart && MMD_SA_options.audio_onstart()

if (!System._browser.video_capture.started) {
  MMD_SA.reset_camera();
}

if (!ao.ontimeupdate)
  DEBUG_show("Audio:START", 2)
      }
    }

    ao.AV_init && ao.AV_init(item.obj.obj.file)

    DragDrop._item = item;

    (load_promise || Promise.resolve()).then(()=>{
      Audio_BPM.findBPM(vo)
    });

    return false
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(png|jpg|jpeg|bmp|webp|mp4|mkv|webm)$/i.test(src)) {
//console.log(toFileProtocol(item.path), item)
    if (MMD_SA_options.user_camera.enabled || System._browser.camera.ML_enabled) {
      if (System._browser.camera.initialized && (!System._browser.camera.stream || (System._browser.camera.ML_enabled && 1))) {
        System._browser.camera.init_stream(src)
      }
      else {
        System._browser.camera.local_src = src;
        DEBUG_show('(local media file assigned)', 3);
      }
    }
    else {
      DEBUG_show('(motion tracking required)', 3)
    }
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(json)$/i.test(src)) {
    const response = fetch(toFileProtocol(src)).then(response=>{ response.json().then(json=>{
      const result = {};
      window.dispatchEvent(new CustomEvent('SA_dragdrop_JSON', { detail:{ json:json, result:result } }));

      if (json.System_Animator_motion_para) {
        for (const name in json.System_Animator_motion_para) {
          MMD_SA_options.motion_para[name] = Object.assign(MMD_SA_options.motion_para[name]||{}, json.System_Animator_motion_para[name]);
        }
        DEBUG_show('✅Motion config imported', 3);
      }
      else {
        if (!result.return_value)
          DEBUG_show('(Unsupported JSON config)', 3);
      }
    })});
  }
  else {
    if (!item._winamp_JSON)
      DragDrop_install(item)
  }
}

Audio_BPM.initBPMCounting(vo)
// audio END

  return { sender: sender, vo: vo }
};
