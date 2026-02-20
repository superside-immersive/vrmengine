// MMD_SA Audio3D — 3D positional audio system (THREE.Audio wrapper)
// Extracted from MMD_SA.js lines 6590-6878 (MMD_SA.Audio3D IIFE)

/**
 * Create the Audio3D subsystem.
 * Returns the same object that was previously assigned to MMD_SA.Audio3D.
 * All referenced names (MMD_SA, MMD_SA_options, THREE, System) are globals.
 * @returns {object}
 */
window.MMD_SA_createAudio3D = function () {
    var use_THREE_Audio = true

    if (MMD_SA_options.Dungeon_options) {
// before object creation
      window.addEventListener("SA_Dungeon_after_map_generation", function () { MMD_SA_options.Dungeon.sound.detach_positional_audio(); });

      window.addEventListener("jThree_ready", function () {
        MMD_SA_options.Dungeon_options.sound.forEach(function (sound) {
          MMD_SA_options.Dungeon.sound.load(sound)
        });
      });
    }

    var listener
    window.addEventListener("jThree_ready", function () {
      listener = new THREE.AudioListener();
      listener.setMasterVolume(0.5);
    });
    window.addEventListener("MMDStarted", function () { MMD_SA._trackball_camera.object.add(listener); });

    var _audio_player = []
    var _channel_locked = {}

// THREE.Audio START
    function THREE_Audio(positional) {
this.audio = (positional) ? new THREE.PositionalAudio( listener ) : new THREE.Audio(listener);
this.audio._player = this

this.events = {}
    }

    THREE_Audio.prototype = {
  constructor: THREE_Audio

 ,get loop()  { return this.audio.getLoop(); }
 ,set loop(v) { this.audio.setLoop(v);  }

 ,get volume()  { return this.audio.getVolume(); }
 ,set volume(v) { this.audio.setVolume(v);  }

 ,get paused() { return !this.audio.isPlaying; }

// ,get currentTime() { return this.audio.context.currentTime; }

 ,get autoplay()  { return this.audio.autoplay; }
 ,set autoplay(v) { this.audio.autoplay = v;  }

 ,set src(v) {
this.audio.isPlaying && this.audio.stop()
this.audio.setBuffer( v )
  }

 ,play: function () {
!this.audio.isPlaying && this.audio.play()
  }

 ,pause: function () {
this.audio.isPlaying && this.audio.pause()
  }

 ,_dispatchEvent: function (event_type) {
if (this.events[event_type]) {
  var that = this
  this.events[event_type].forEach(function (func) {
    func.call(that)
  });
}
  }

 ,addEventListener: function (event_type, func) {
if (!this.events[event_type])
  this.events[event_type] = []
this.events[event_type].push(func)
  }
    };
// THREE.Audio END

    function Audio_Player(positional) {
var that = this

// Audio player version
this.timestamp = 0
this.player = (use_THREE_Audio) ? new THREE_Audio(positional) : document.createElement("audio")

this.positional = !!positional
this.obj_parent = null
this.obj_parent_attached = null

this.player.addEventListener("playing", function (e) {
  that.attach_obj_parent()

  that.timestamp = Date.now()
  that.occupied = true
});

this.player.addEventListener("ended", function (e) {
  if (!this.loop)
    that.occupied = false
});

_audio_player.push(this)
console.log("Audio_Player count", _audio_player.length)
    }

    Audio_Player.prototype.detach_obj_parent = function () {
if (!this.positional)
  return
if (!this.obj_parent_attached)
  return

this.obj_parent_attached.remove(this.player.audio)
this.obj_parent_attached = null
console.log("Audio_Player (positional) - obj_parent DETACHED")
    };

    Audio_Player.prototype.attach_obj_parent = function () {
if (!this.positional)
  return
if (this.obj_parent_attached && (this.obj_parent_attached == this.obj_parent))
  return

this.detach_obj_parent()

var p_audio = this.player.audio
p_audio.setRefDistance( 20 )

this.obj_parent_attached = this.obj_parent
this.obj_parent_attached.add(p_audio)
p_audio.updateMatrixWorld(true)
console.log("Audio_Player (positional) - obj_parent ATTACHED")
    };


    function Audio_Object(para) {
this.para = para

this.object_url = null

if (para.channel) {
  if (para.channel === true)
    para.channel = para.name
}
    }

    Audio_Object.prototype = {
  constructor:  Audio_Object

 ,obj_parent_matched: function (obj_parent, ap) {
return ((!obj_parent && !ap.positional) || (ap.positional && (!ap.obj_parent || (obj_parent == ap.obj_parent))));
  }

 ,get_player_obj: function (obj_parent, spawn_id) {
var that = this
var para = this.para

return _audio_player.find(function (ap) {
  return (/*ap.occupied && */((para.name == ap.name) || ((/^BGM$/.test(para.channel) || para.is_exclusive_channel) && (para.channel == ap.channel))) && (!para.can_spawn || !spawn_id || (spawn_id == ap.spawn_id)) && that.obj_parent_matched(obj_parent, ap));
});
  }

 ,play: function (obj_parent, spawn_id) {
if (!this.object_url)
  return null

var that = this
var para = this.para

if (para.can_spawn) {
  if (typeof spawn_id == "boolean") {
    spawn_id = THREE.Math.generateUUID()
  }
  else if (!spawn_id)
    spawn_id = para.name
}
else {
  spawn_id = null
}

var player_obj = this.get_player_obj(obj_parent, spawn_id)
if (player_obj) {
  if (para.name == player_obj.name) {
    player_obj.obj_parent = obj_parent
    if (!player_obj.occupied || player_obj.player.paused) {
      player_obj.player.play()
    }
    return player_obj
  }
}
else {
  player_obj = _audio_player.find(function (ap) {
    return (!ap.occupied && that.obj_parent_matched(obj_parent, ap));
  });
  if (!player_obj) {
    player_obj = new Audio_Player(!!obj_parent)
  }
}

player_obj.name = para.name
player_obj.channel = para.channel
player_obj.spawn_id = spawn_id
player_obj.occupied = true
player_obj.obj_parent = obj_parent

// https://developers.google.com/web/updates/2018/11/web-audio-autoplay
// to save headaches, System Animator game will always begin with a startup screen requesting user interaction (e.g. mouse click), which should ensure that autoplay is always usable.
player_obj.player.autoplay = (!para.channel || !_channel_locked[para.channel])

player_obj.player.loop = para.loop
player_obj.player.volume = (para.volume || 1)

// https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
try {
  player_obj.player.src = this.object_url
}
catch (err) {
// Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.
  console.error(err.message)
}

return player_obj
  }
    };

    return {
  audio_object_by_name: {}

 ,load: function (para) {
var url = para.url
var name = para.name = para.name || url.replace(/^.+[\/\\]/, "").replace(/\.\w+$/, "")
var ao = this.audio_object_by_name[name]
// NOTE: For now, Audio_Object that requires positional support (at least the first player) should avoid using .autoplay
if (ao) {
  if (para.autoplay)
    ao.play()
  return
}

ao = this.audio_object_by_name[name] = new Audio_Object(para)

System._browser.load_file(url, function (xhr) {
  if (use_THREE_Audio) {
// https://github.com/mrdoob/three.js/blob/dev/src/loaders/AudioLoader.js
			// Create a copy of the buffer. The `decodeAudioData` method
			// detaches the buffer when complete, preventing reuse.
// NOTE: no need to reuse the source buffer at this moment
THREE.AudioContext.getContext().decodeAudioData( xhr.response/*.slice( 0 )*/, function ( audioBuffer ) {
  ao.object_url = audioBuffer;
  if (para.autoplay)
    ao.play()
});
  }
  else {
    ao.object_url = URL.createObjectURL(xhr.response)
    if (para.autoplay)
      ao.play()
  }
}, "arraybuffer");
  }

 ,pause_channel: function (channel, locked) {
if (locked)
  _channel_locked[channel] = true

_audio_player.forEach(function (ap) {
  if (ap.occupied && (ap.channel == channel))
    ap.player.pause()
});
  }

 ,resume_channel: function (channel) {
_channel_locked[channel] = null

_audio_player.forEach(function (ap) {
  if (ap.occupied && (ap.channel == channel))
    ap.player.play()
});
  }

 ,detach_positional_audio: function (obj_parent) {
_audio_player.forEach(function (ap) {
  if (ap.positional && (!obj_parent || (obj_parent == ap.obj_parent_attached)))
    ap.detach_obj_parent()
});
  }
    };
};
