/*
  animate.js — Animation loop entry points (Step 5B extraction from _SA.js)
  EV_sync_update, RAF variables, Animate_RAF, Animate
*/

var EV_usage, EV_usage_float, EV_usage_last, EV_usage_last_float

var PC_count_max = 10
var PC_count = 1


var EV_sync_update = {
  enabled: false
 ,count: 0

 ,count_to_10fps_: 4
 ,count_to_10fps: 4

 ,count_frame: 0

 ,no_update_count: 0
 ,no_animation_count: 99

 ,requestAnimationFrame_auto: true

// fps count
 ,fps_count: 0
 ,fps_count_start_time: 0
 ,fps_last: 0
 ,fps_count_func: function (inc) {
var now = Date.now()
if (this.fps_count >= 100) {
  this.fps_last = 1000 / ((now - this.fps_count_start_time) / this.fps_count)
  this.fps_count = 0
}
if (!this.fps_count)
  this.fps_count_start_time = now

this.fps_count += (inc == null) ? 1 : inc
  }

// function to detect frame change at a 10fps basis
 ,frame_changed_count: []
 ,frame_changed: function (name) {
var count = this.frame_changed_count[name]
var changed = (!count || (count != PC_count_absolute))
this.frame_changed_count[name] = PC_count_absolute

return changed
  }

// timer
 ,timer_time_min: 99999
 ,timer_time_max: 0
 ,timer_start: function () {
this.timer_time_start = Date.now()
  }
 ,timer_stop: function () {
var t = this.timer_time_start
if (!t)
  return
var t_diff = Date.now() - t
if (this.timer_time_min > t_diff)
  this.timer_time_min = t_diff
if (this.timer_time_max < t_diff)
  this.timer_time_max = t_diff
DEBUG_show(this.timer_time_min+'/'+this.timer_time_max+','+t_diff)
  }

// Seq timer RAF mode TEST
 ,Seq_func: {}

 ,RAF_func: []

// misc
 ,_beat_last1: 0
 ,_beat_last2: 0
}

if (use_SA_browser_mode) {
  Object.defineProperty(EV_sync_update, "count_to_10fps",
{
  get: function () {
if (is_SA_child_animation && parent.loaded)
  this.count_to_10fps_ = parent.EV_sync_update.count_to_10fps_
return this.count_to_10fps_
  }

 ,set: function (v) {
this.count_to_10fps_ = v
  }
});
}

var use_RAF = !!window.requestAnimationFrame
var RAF_timerID = null
var RAF_timestamp = 0
var RAF_timestamp_delta = 0
var RAF_timestamp_delta_accumulated = 0
var RAF_frame_time_delayed = 0
var RAF_frame_drop = 0

var Animate_RAF = function (timestamp) {
//EV_sync_update.fps_count_func()
  if (EV_sync_update.requestAnimationFrame_auto)
    RAF_timerID = requestAnimationFrame(Animate_RAF)
  else
    RAF_timerID = null
//RAF_timerID = setTimeout(function () { Animate_RAF(performance.now()) }, 1000/60)

  if (EV_sync_update.RAF_paused) {
    RAF_timestamp = timestamp
    return
  }

  if (RAF_timestamp) {
    RAF_timestamp_delta = timestamp - RAF_timestamp + RAF_timestamp_delta_accumulated

    let ms_per_frame = 1000 / (EV_sync_update.count_to_10fps_ * 10)
    let time_diff = RAF_timestamp_delta - ms_per_frame
    RAF_frame_time_delayed += time_diff

    if (RAF_frame_time_delayed < -ms_per_frame) {
// funny that -= or += makes no big difference as fps control (-= seems more logical though)
      RAF_frame_time_delayed -= time_diff
//DEBUG_show(~~RAF_frame_time_delayed+'/'+ ~~time_diff,0,1)
//console.log(++RAF_frame_drop)
      return
    }
    else if (RAF_frame_time_delayed > ms_per_frame) {
      RAF_frame_time_delayed = ms_per_frame
    }
  }
  RAF_timestamp = timestamp
/*
// Seq timer RAF mode TEST
  try {
    for (var name in EV_sync_update.Seq_func) {
      EV_sync_update.Seq_func[name]()
      delete EV_sync_update.Seq_func[name]
    }
  }
  catch (err) { console.error(err) }
*/
  Animate()
}

function Animate() {
//EV_sync_update.fps_count_func()
//if (!is_SA_child_animation && EV_sync_update.fps_last) { console.log('FPS:' + EV_sync_update.fps_last); EV_sync_update.fps_last=0; }
  var active_child = []
  // [9D] ie9_mode always true — unwrapped
  if (!is_SA_child_animation) {
    for (var i = 0; i < SA_child_animation_max; i++) {
      if (SA_child_animation[i])
        active_child.push(i)
    }
  }
  var child_loaded_max = active_child.length

  if (!EV_sync_update.loaded_synced) {
    var child_loaded = 0
    for (var i = 0; i < child_loaded_max; i++) {
      try {
        var w = document.getElementById("Ichild_animation" + active_child[i]).contentWindow
        if (w.loaded)
          child_loaded++
      }
      catch (err) {}
    }

    if (child_loaded == child_loaded_max)
      EV_sync_update.loaded_synced = true
    else
      return
  }

  Animate_core()

//var sync_label = EV_sync_update.count+"|"+EV_sync_update.no_update_count+"|"+EV_sync_update.no_animation_count
  for (var i = 0; i < child_loaded_max; i++) {
    try {
      var w = document.getElementById("Ichild_animation" + active_child[i]).contentWindow
      if (w.loaded) {
        w.RAF_timestamp = RAF_timestamp
        w.Animate()
//if (w.EV_sync_update.count+"|"+w.EV_sync_update.no_update_count+"|"+w.EV_sync_update.no_animation_count != sync_label) DEBUG_show("asynced",0,1)
      }
    }
    catch (err) {}
  }

  // for embeded Spetcurm Analyser, to avoid the effects of any possible thread racing issues
  if (EV_sync_update.count % 2) {
    if (spectrum_analyser) {
      try {
        var w = spectrum_analyser.contentWindow
        if (w.SA_update_mode && w.loaded)
          w.updateDisplay()
      }
      catch (err) {}
    }
  }
}

var RAF_animation_frame_timestamp_last = 0
var RAF_animation_frame_time_delayed = 0
var RAF_animation_frame_always_update = false
var RAF_animation_frame_unlimited = returnBoolean("Use60FPS")
//RAF_animation_frame_unlimited = true

var SA_external_command_JSON_time_ref = -1
var SA_external_command_JSON_path
