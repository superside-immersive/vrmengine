/**
 * Game loop — SA_MMD_model_all_process_bones handler + key events.
 * Extracted from dungeon.js.
 *
 * LOAD-TIME SAFETY: This file is loaded via loadScriptSync BEFORE
 * three.core.min.js and MMD_SA.js. Therefore:
 *   - NO `new THREE.*()` at IIFE/construction time
 *   - NO `MMD_SA.*` at IIFE/construction time
 *   - Only `MMD_SA_options.Dungeon` is safe at load time
 *
 * This module defines d._setupGameLoop(), which is called from the
 * MMDStarted handler in dungeon.js. At that point THREE and MMD_SA
 * are fully available, so no lazy init is needed inside.
 */
(function () {
var d = MMD_SA_options.Dungeon;

d._setupGameLoop = function () {

// --- closure variables (THREE available at call time) ---
var c = d.character
var movement_v3 = new THREE.Vector3()
var rotation_v3 = new THREE.Vector3()
var _movement_v3 = new THREE.Vector3()
var movement_extra_v3 = new THREE.Vector3()
var _v3a = new THREE.Vector3()
var _v3b = new THREE.Vector3()
var _v3c = new THREE.Vector3()
var _q = new THREE.Quaternion()
var _b3 = new THREE.Box3()

var dir_block = [null, ["x"],["z"],["y"], ["x","z"],["x","y"],["z","y"]];

var mov_delta = d._mov_delta = (function () {

  function DataLast() {
    this.by_motion = {}
  }
  DataLast.prototype.init = function (para) {
    var m = this.by_motion[para._index]
    if (!m) {
      m = this.by_motion[para._index] = { acceleration_mov_last:[], t:9999 }
      for (var i = 0, i_max = para.mov_speed.length; i < i_max; i++)
        m.acceleration_mov_last[i] = new THREE.Vector3()
    }
    return this
  };
  DataLast.prototype.reset = function (para) {
    this.by_motion[para._index].acceleration_mov_last.forEach(function (v3) { v3.set(0,0,0); });
  };

  var data_last = []
  window.addEventListener("SA_Dungeon_onrestart", function () {
    for (var i = 0, i_max = MMD_SA_options.model_para_obj_all.length; i < i_max; i++) {
      data_last[i] = new DataLast()
    }
  });

  return function (model, para, t_diff, t) {
var mov_speed = para.mov_speed
if (typeof mov_speed == "number")
  return movement_v3.set(0,0,t_diff*para.mov_speed)

/*
var motion_id = para.motion_id
if (d.motion[para.motion_id])
  motion_id = d.motion[para.motion_id].name
//(MMD_SA.motion[model.skin._motion_index].filename == motion_id)
*/
if (t == null)
  t = (MMD_SA.motion[model.skin._motion_index].para_SA == para) ? model.skin.time - t_diff : 0
if (t < 0)
  t = 0

var d_last = data_last[model._model_index].init(para)
var m = d_last.by_motion[para._index]
if (t + t_diff < m.t) {
//DEBUG_show(para._index+':'+t+'/'+m.t,0,1)
  d_last.reset(para)
}
m.t = t + t_diff

var y_accelerated
var t_diff_remaining = t_diff
for (var i = 0, i_max = mov_speed.length; i < i_max; i++) {
  var _t = t
  var obj = mov_speed[i]
  var t_start = obj.frame/30

  var mov_delta_finished
  if (t >= t_start) {
    mov_delta_finished = true
  }
  else if (t + t_diff >= t_start) {
    t_diff = (t + t_diff) - t_start
    _t = t_start
  }
  else
    continue

  if (obj.acceleration) {
    var _t_diff = (_t + t_diff) - t_start
    movement_v3.copy(obj.speed).multiplyScalar(_t_diff).add(_v3a.copy(obj.acceleration).multiplyScalar(0.5*_t_diff*_t_diff))

    _v3b.copy(movement_v3)
    movement_v3.sub(m.acceleration_mov_last[i])
    m.acceleration_mov_last[i].copy(_v3b)

    if (obj.acceleration.y)
      y_accelerated = true
  }
  else {
    movement_v3.copy(obj.speed).multiplyScalar(t_diff)
  }

  if (mov_delta_finished)
    break

  t_diff = t_diff_remaining - t_diff
}

// if y has been accelerated, make sure y is non-zero as a "trick" to indicate it's a floating motion
if (y_accelerated && !movement_v3.y)
  movement_v3.y = Number.MIN_VALUE
//DEBUG_show(movement_v3.y,0,1)
//DEBUG_show(t+'/'+t_diff,0,1)
return movement_v3
  };
})();


// key events START
  d._key_pressed = {}

  document.addEventListener("keyup", function (e) {
var k = e.keyCode
d._key_pressed[k] = 0

var key_map = d.key_map[k]
if (!key_map) {
  return
}
key_map.is_down = 0
key_map._data = null

if (key_map.onkeyup && key_map.onkeyup())
  return

if (key_map.motion_duration) return

if (key_map.type_combat && d.character_combat_locked) {
  if (d.character_combat_locked == key_map.id) {
    return
  }
}

key_map.down = 0
  });

  d.SA_keydown = function (e) {
const k = e.detail.keyCode;
const _e = e.detail.e;
const k_code = (is_mobile && (k == 111)) ? 'Escape' : _e.code;

const result = {};
window.dispatchEvent(new CustomEvent("SA_Dungeon_keydown", { detail:{ e:_e, result:result } }));
if (result.return_value) {
  e.detail.result.return_value = true;
  return;
}

// use RAF_timestamp instead, making it easier to track if a key is pressed in the same frame
var t = RAF_timestamp//performance.now()
// Raw key press data. Avoid altering it besides keyboard events.
if (!d._key_pressed[k]) d._key_pressed[k] = t

var msg_branch_list = d.dialogue_branch_mode
if (msg_branch_list) {
// save some headaches and ignore alpha keys for now as it may affect movement and action
  if (!d._states.action_allowed_in_event_mode || ((k >= 96) && (k <= 96+9)) || ((k >= 48) && (k <= 48+9)))// || /Key[A-Z]/.test(k_code))
    e.detail.result.return_value = true;
  for (var i = 0, i_max = msg_branch_list.length; i < i_max; i++) {
    const branch = msg_branch_list[i]
    const sb_index = branch.sb_index || 0;
    const sb = MMD_SA.SpeechBubble.list[sb_index];

    if (branch.key == 'any') {
      if ((_e.keyCode >= 96) && (_e.keyCode <= 96+9)) {
        _e.key = (_e.keyCode - 96).toString();
      }
      const result = branch.func(e.detail.e);
      if (result) {
        e.detail.result.return_value = true;
        break;
      }
    }

    if (!is_mobile && (_e.ctrlKey || _e.shiftKey || _e.altKey)) break;

    const keys = (Array.isArray(branch.key)) ? branch.key : [branch.key];
    if (branch.is_closing_event) keys.push('Esc');

    const key_matched = keys.find(key=>{
if (typeof key == 'number') return (k == 96+key) || (k == 48+key);
if (key == 'Esc') return k_code == 'Escape';
return k_code == 'Key'+branch.key;
    });

    if (key_matched != null) {
      e.detail.result.return_value = true;

      if (MMD_SA_options.SpeechBubble_branch && MMD_SA_options.SpeechBubble_branch.confirm_keydown && (key_matched != sb._branch_key_) && (sb.msg_line.some(msg=>MMD_SA_options.SpeechBubble_branch.RE.test(msg)&&(RegExp.$1==key_matched)))) {
        sb._branch_key_ = key_matched
        sb._update_placement(true)
      }
      else {
        sb._branch_key_ = null;
        if (!branch.keep_dialogue_branch_list)
          d.dialogue_branch_mode = sb_index;

        branch.func?.();
        if ((branch.event_id != null) || (branch.branch_index != null) || (branch.event_index != null))
          d.run_event(branch.event_id, branch.branch_index, branch.event_index||0)
        else
          d.run_event()
      }
      break
    }
  }

  if (e.detail.result.return_value)
    return;
}
else {
  if (k_code == 'Escape') {
// headless_mode
    if (MMD_SA_options._XRA_headless_mode) {} else
    if (System._browser.overlay_mode == 0) {
      System._browser.overlay_mode = System._browser.overlay_mode_TEMP = 1;
    }
    else if (System._browser.overlay_mode_TEMP) {
      System._browser.overlay_mode = System._browser.overlay_mode_TEMP = 0;
    }
    else {
      document.getElementById('Ldungeon_inventory').style.visibility = (document.getElementById('Ldungeon_inventory').style.visibility == 'hidden') ? 'inherit' : 'hidden';
    }
    e.detail.result.return_value = true;
    return;
  }
}

var key_map = d.key_map[k]
if (d._states.dialogue_mode && !msg_branch_list && (!key_map || !/^(up|left|down|right)$/.test(key_map.id))) {
  d.run_event()
  e.detail.result.return_value = true
  return
}

if (!key_map) {
//  DEBUG_show(k,0,1)
  return
}

_keydown(e, key_map, t)
  };

  window.addEventListener("SA_keydown", d.SA_keydown);

  var _keydown = (function () {
    var e_dummy = {detail:{result:{}}};
    return function (e, key_map, t) {
if (!e)
  e = e_dummy

var first_press
if (!key_map.is_down) {
  first_press = true
  key_map.is_down = t
}

if ((key_map.type_movement && (d.character_movement_disabled || e.detail.e?.altKey || e.detail.e?.ctrlKey)) || (key_map.type_combat && d.character_combat_locked)) {
  e.detail.result.return_value = true
  return
}

if (key_map.ondown && key_map.ondown(e))
  return

if (!key_map.down) {
  if (!d.character.grounded && (key_map.type_movement || key_map.type_combat) && !key_map.motion_can_float) {
// save some headaches and prevent unnecessary motion change/etc from the default keydown events
    e.detail.result.return_value = true
    return
  }
  key_map.down = t
  if (first_press && key_map.onfirstpress && key_map.onfirstpress(e))
    return
}

e.detail.result.return_value = true
    };
  })();

/*
function reset_key_map(id_list) {
  var keys
  if (id_list) {
    keys = []
    id_list.forEach(function (id) {
      keys.push(d.key_map_by_id[id])
    });
  }
  else
    keys = d.key_map_list

  keys.forEach(function (key_map) {
    key_map.down = 0
  });
}
*/
// key events END

// combat_para_default alias
var combat_para_default = d.combat_para_default;

var time_last, time_diff, gravity_obj
var time_falling
/*
// a "hack" to make target-locking camera works
var rot_camera = {
  ini_count: 0
 ,ini_count_max: 2
 ,get enabled () { return (this.ini_count > this.ini_count_max); }
 ,v3: new THREE.Vector3()
}
d._rot_camera = rot_camera
*/
window.addEventListener("SA_Dungeon_onrestart", function () {
  time_last = 0
  gravity_obj = { y:0, mov_y_last:0, time:1/30 }

//  rot_camera.ini_count = 0

  time_falling = -10
});

var key_pressed_stats = {}

window.addEventListener("SA_MMD_model_all_process_bones", function (e) {
//  var model = e.detail.model
  var model = THREE.MMD.getModels()[0]

  var grid_para = d.get_para(c.xy[0], c.xy[1])
  if (grid_para.onstay && grid_para.onstay())
    return

  if (d.check_states())
    return

// use performance.now() from topmost window (the same window where RAF_timestamp comes from), as this value can be different among different child windows
  var t = SA_topmost_window.performance.now()

  time_diff = Math.min((time_last) ? (t - time_last)/1000 : 1/30, 1/20)
  time_last = t

// a trick to simulate a keydown event on every physically pressed key (since the usual keydown event can't detect multiple keys pressed at the same time)
  d.key_map_list.forEach(function (key_map) {
if (key_map.is_down && !key_map.down) {
  _keydown(null, key_map, t)
}
  });

  d._combat_para = []
  d._mov = []
  d.object_list.forEach(function (obj) {
    obj.animate && obj.animate(t)
    obj.motion && obj.motion.play(t)
  });
  window.dispatchEvent(new CustomEvent("SA_Dungeon_object_animation"));

  if (c.path_motion) {
    c.path_motion.play(t)
    return
  }

//DEBUG_show(model.mesh.position.toArray())
//DEBUG_show(MMD_SA_options.Dungeon.character.pos)

  var mov, rot, about_turn, motion_id, can_lock_target
  var rot_absolute, rot_absolute_with_camera
  var motion_reset = []
  var mm = MMD_SA.MMD.motionManager

  var model_para = MMD_SA_options.model_para_obj_all[model._model_index]
  var para_SA = MMD_SA.MMD.motionManager.para_SA//(MMD_SA.motion[(model.skin||model.morph||{})._motion_index] || MMD_SA.MMD.motionManager).para_SA
  var pos_delta = MMD_SA.bone_to_position.call(model, para_SA)

  var key_motion_disabled = c.mount_para

  var TPS_mode = c.TPS_mode, TPS_mode_in_action, TPS_character_rotated, TPS_use_last_rot, TPS_camera_ry, TPS_camera_lookAt, TPS_camera_lookAt_
//TPS_mode = true
  if (c.combat_mode) {
    let combat = d._states.combat
    let target_enemy_index = combat._target_enemy_index
    if (target_enemy_index >= 0) {
      let enemy = combat.enemy_list[target_enemy_index]
      if (enemy.hp) {
        TPS_mode = true
        TPS_camera_lookAt_ = enemy._obj.position
      }
      else {
        do {
          if (++target_enemy_index >= combat.enemy_list.length)
            target_enemy_index = 0
          enemy = combat.enemy_list[target_enemy_index]
          if (enemy.hp)
            break
        } while (target_enemy_index != combat._target_enemy_index);
        if (target_enemy_index == combat._target_enemy_index) {
          combat._target_enemy_index = -1
        }
        else {
          combat._target_enemy_index = target_enemy_index
          TPS_mode = true
          TPS_camera_lookAt_ = enemy._obj.position
        }
      }
    }
  }
  c.TPS_camera_lookAt_ = TPS_camera_lookAt_

  var key_para  = { t:t }

// check if the upcoming motion change is .motion_command_disabled
if (MMD_SA._force_motion_shuffle) DEBUG_show(Date.now())
  var motion_command_disabled = para_SA.motion_command_disabled
  if (TPS_mode && !motion_command_disabled && MMD_SA._force_motion_shuffle && MMD_SA_options.motion_shuffle_list_default) {
    motion_command_disabled = MMD_SA.motion[MMD_SA_options.motion_shuffle_list_default[0]].para_SA.motion_command_disabled
DEBUG_show(MMD_SA_options.motion_shuffle_list_default[0]+'/'+Date.now())
  }

  var PC = { obj:c, mass:c.mass }
  var key_used = {}
  var any_key_down
  d.key_map_list.forEach(function (k) {
    var key_map = k//d.key_map[k.keyCode]
// prevent dummy keys from running
    if (key_used[k.keyCode]) {
//DEBUG_show(k.keyCode_default,0,1)
      return
    }
    key_used[k.keyCode] = true

    var id = k.id

    if (para_SA.motion_command_disabled) {
      key_map.down = 0
    }

    var key_motion_running
    var motion_time = 0
    if (key_motion_disabled) {
      if (key_map.down && key_map.motion_id) {
        var _motion_index = MMD_SA_options.motion_index_by_name[d.motion[key_map.motion_id].name]
        var _mm = MMD_SA.motion[_motion_index]
        key_motion_running =  !key_map._motion_time || (key_map._motion_time < _mm.lastFrame_/30)
      }
      if (key_motion_running) {
        if (!key_map._motion_time)
          key_map._motion_time = 0
        key_map._motion_time += (t - key_map.down)/1000
        motion_time = key_map._motion_time
      }
      else
        key_map._motion_time = 0
    }
    else {
      key_motion_running = (mm.filename == key_map.motion_filename)
      if (key_motion_running) {// && (!key_map.type_movement || !d.character_movement_disabled)) {
        motion_time = model.skin.time
      }
    }

// For one-time motion (ie. key_map.motion_duration, eg. jump), let it finish naturally
    if (key_map.down && (!key_map.motion_duration || !key_motion_running)) {
      if (key_map.type_movement && d.character_movement_disabled) {
        key_map.down = 0
      }
      if (key_map.type_combat && (!d.character.combat_mode || (d.character_combat_locked && (d.character_combat_locked != key_map.id))) ) {
        key_map.down = 0
      }
    }

    var key_map_by_mode

    if (TPS_mode)
      key_map_by_mode = key_map.TPS_mode
    if (!key_map_by_mode)
      key_map_by_mode = key_map

    if (key_map_by_mode.motion_filename && key_map.down) {
let _k = key_pressed_stats[k.keyCode] = key_pressed_stats[k.keyCode] || { first_press:0, pressed:0 };
if (mm.filename != key_map_by_mode.motion_filename) {
  _k.first_press = key_map.is_down
}
if (key_map.is_down) {
  if (_k.first_press)
    _k.pressed = t - _k.first_press
}
else {
// reset first_press to prevent repeated presses
  _k.first_press = 0
}
key_para.pressed = _k.pressed
//if (/jump/i.test(key_map_by_mode.motion_filename)) DEBUG_show(_k.pressed)
    }

    var t_diff, motion_duration, t2, motion_para
    var result
    if (key_map.onupdate) {
      if (key_map.down) {
        motion_para = key_map_by_mode.motion_id && d.motion[key_map_by_mode.motion_id].para
        t_diff = Math.min((t - key_map.down)/1000, time_diff) * ((motion_para && motion_para.playbackRate_by_model_index && motion_para.playbackRate_by_model_index[0]) || 1)
        key_para.t_diff = t_diff
      }
      result = key_map.onupdate(key_para)
    }
    if (result) {
      if (result.TPS_mode != null) {
        if (!result.TPS_mode)
          key_map_by_mode = key_map
      }
      if (result.return_value)
        return
    }

    var key_map_data = key_map._data || {}

    if (key_map.down) {
      any_key_down = true
      motion_para = key_map_by_mode.motion_id && d.motion[key_map_by_mode.motion_id].para
      t_diff = Math.min((t - key_map.down)/1000, time_diff) * ((motion_para && motion_para.playbackRate_by_model_index && motion_para.playbackRate_by_model_index[0]) || 1)
// always define .motion_duration for non-looping motion
      motion_duration = key_map_by_mode.motion_duration// || (46/30)
      if (motion_duration) {
//DEBUG_show((key_map==d.key_map[para_SA.keyCode])+'/'+para_SA.keyCode,0,1)
        t2 = ((key_motion_running) ? motion_time - t_diff: 0) + ((result && result.t2_extended) || 0)
//if (t2 < motion_duration) t_diff = Math.min(t_diff, motion_duration-t2)
        if (t2 < 0) { t_diff -= t2; t2 = 0; }
//DEBUG_show(t2+'/'+t_diff+'/'+motion_time,0,1)
//DEBUG_show(t2+t_diff,0,1)
      }

      if (key_map_by_mode.motion_id) {
        motion_id = key_map_by_mode.motion_filename
      }

      if (!motion_duration || (t2 < motion_duration)) {
// not sure if it may be better to use a local variable (let _TPS_mode_in_action) here
        TPS_mode_in_action = TPS_mode_in_action || (key_map_by_mode == key_map.TPS_mode)

        if (key_map_by_mode.mov_speed) {
          let _mov = (mov) ? _movement_v3.copy(mov) : null
// .mov_speed can change among modes, safer to reassign it
          motion_para.mov_speed = key_map_by_mode.mov_speed
          mov = mov_delta(model, motion_para, t_diff, t2).multiplyScalar(key_map_data.scale||1)
          if (_mov) {
            let mov_length = mov.length()
            mov.lerp(_mov, 0.5).normalize().multiplyScalar(Math.max(_mov.length(), mov_length))
          }
        }

        if (pos_delta && key_motion_running)
          mov = (mov) ? mov.add(pos_delta) : movement_v3.copy(pos_delta)

//if (pos_delta && key_map.keyCode==105) { DEBUG_show(key_map.keyCode+'/'+Date.now()); console.log(key_map); }
        if (key_map_by_mode.rot_speed) {
          rot = rotation_v3.copy(key_map_by_mode.rot_speed).multiplyScalar(t_diff * (key_map_data.scale||1));
// v0.25.0
//          if (c.about_turn) rot.y *= -1;
        }

        if (TPS_mode_in_action) {
          if (!TPS_camera_lookAt_) {
            let camera = MMD_SA._trackball_camera
            TPS_camera_ry = Math.PI/2 - Math.atan2((camera.target.z-camera.object.position.z), (camera.target.x-camera.object.position.x))
            c.camera_TPS_rot.set(0,TPS_camera_ry,0)
          }
          else {
            TPS_camera_ry = c.camera_rotation_from_preset.y// + c.camera_TPS_rot.y
            c.camera_TPS_rot.set(0,0,0)
          }
//TPS_camera_ry=0

//TPS_character_rotated = key_map_by_mode.mov_to_rot_absolute
// case: use mov direction as rotation
          if (key_map_by_mode.mov_to_rot_absolute && (mov && (mov.x || mov.z))) {
            TPS_character_rotated = true
            rot = rotation_v3.set(0, Math.PI/2 - Math.atan2(mov.z, mov.x), 0)
            if (!TPS_camera_lookAt_) {
              let cy = (c.rot.y - TPS_camera_ry) % (Math.PI*2)
              let r_diff = (cy - rot.y) % (Math.PI*2)
              if (Math.abs(r_diff) > Math.PI)
                r_diff = r_diff + Math.PI*2 * ((r_diff>0)?-1:1)
              let r_max = Math.PI/8 * time_diff*30
              if (Math.abs(r_diff) > r_max) {
                rot.y = cy + r_max * ((r_diff>0)?-1:1)
              }
            }
//DEBUG_show(rot.y*180/Math.PI+'\n'+TPS_camera_ry*180/Math.PI+'\n'+Date.now())
          }
// case: no rotation from mov
          else if (key_map_by_mode.no_rotation) {
// if TPS_camera_lookAt_ exists (target locked), use TPS_camera_lookAt_ rotation (will be added to rot later)
            if (TPS_camera_lookAt_) {
              rot = rotation_v3.set(0,0,0)
            }
// otherwise, use PC's current rotation (minus TPS_camera_ry which will be added to rot later)
            else {
              rot = rotation_v3.copy(c.rot)
              rot.y -= TPS_camera_ry
              if (motion_id && (motion_id == key_map_by_mode.motion_filename) && /^(.+)(forward|right|backward|left)$/.test(key_map_by_mode.motion_id)) {
                let dir = ["forward","right","backward","left"]
                let dir_index = Math.round(dir.indexOf(RegExp.$2) - (-rot.y / (Math.PI/2))) % 4
                if (dir_index < 0) dir_index += 4
                let motion = d.motion[RegExp.$1 + dir[dir_index]]
                if (motion)
                  motion_id = motion.name
//DEBUG_show(motion_id + '\n' + rot.y*(180/Math.PI)+'\n'+Date.now())
              }
            }
          }
          else {
            TPS_use_last_rot = true
//            rot = rotation_v3.set(0,0,0)
            rot = rotation_v3.copy(c.rot)
//            rot.y -= TPS_camera_ry
            if (mov)
              mov.applyEuler(rot)
          }
        }

        if (key_map_by_mode.about_turn != null) {
          if (c.about_turn == !key_map_by_mode.about_turn) {
            c.about_turn = key_map_by_mode.about_turn
            about_turn = true
          }
        }

        if (key_map.type_combat) {
          if (!d.character_combat_locked) {
            d.character_combat_locked = id
            can_lock_target = true
          }
          if (t2 && key_map_by_mode.combat_para) {
            d.combat_para_process(PC, key_map_by_mode, t2*30)
          }
        }

        if (key_map_by_mode.key_id_cancel_list) {
          key_map_by_mode.key_id_cancel_list.forEach(function (kc_id) {
            if (d.key_map_by_id[kc_id])
              d.key_map_by_id[kc_id].down = 0
          });
        }

        key_map.down = t
      }
      else {
        if (key_map_by_mode.motion_id)
          motion_reset.push(key_map_by_mode)

        var key_id_cancel_list = (key_map_by_mode.key_id_cancel_list) ? key_map_by_mode.key_id_cancel_list.slice() : []
        if (key_map.type_combat) {
          if (d.character_combat_locked == id) {
            d.character_combat_locked = null
            key_id_cancel_list.push("up","down","left","right")
          }
        }

        key_id_cancel_list.forEach(function (kc_id) {
          var km = d.key_map_by_id[kc_id]
          if (!d.character_movement_disabled && km.type_movement) {
            if (km.is_down)
              km.down = t
          }
        });

        key_map.down = 0
      }
    }
    else {
      if (key_map_by_mode.motion_id && (!key_map.type_movement || !d.character_movement_disabled)) {
        motion_reset.push(key_map_by_mode);
      }

      if (key_map.type_combat) {
        if (d.character_combat_locked == id) {
          d.character_combat_locked = null
        }
      }
    }
  });


  var reset_motion = !mov// || (!mov.x && !mov.y && !mov.z)
//if (reset_motion) DEBUG_show(Date.now())

//  var use_rot_camera
  c.camera_TPS_mode = TPS_mode//TPS_mode_in_action
//if (TPS_mode) DEBUG_show(Date.now())
  if (TPS_mode_in_action) {
    if (!mov)
      mov = movement_v3.set(0,0,0)
    c.about_turn = about_turn = false

    let rot_self = _v3b.set(0,0,0)
    TPS_camera_lookAt = TPS_camera_lookAt_
    if (TPS_use_last_rot) {
      TPS_camera_lookAt = TPS_camera_lookAt_ = null
    }
    else if (TPS_camera_lookAt) {
let cy = Math.PI/2 - Math.atan2((TPS_camera_lookAt.z-c.pos.z), (TPS_camera_lookAt.x-c.pos.x))
mov.applyEuler(_v3a.set(0,TPS_camera_ry+cy,0))

if (TPS_character_rotated) {
  rot.y += TPS_camera_ry
  rot_self.copy(rot)
}
rot.copy(_v3a.set(0,cy,0))

/*
if (++rot_camera.ini_count <= rot_camera.ini_count_max+1) {
  rot_camera.v3.set(0,0,0)
  MMD_SA.reset_camera()
}
use_rot_camera = true
*/
// always reset when not using rot_camera
MMD_SA.reset_camera()
    }
    else if (TPS_camera_ry) {
      _v3a.set(0,TPS_camera_ry,0)
      mov.applyEuler(_v3a)
      rot.add(_v3a)
    }

    c.rot.copy(rot_self)
    model.mesh.quaternion.setFromEuler(rot_self)
  }
//if (rot) DEBUG_show(rot.y*180/Math.PI+'\n'+c.rot.y*180/Math.PI+'\n'+TPS_mode_in_action+'\n'+(d.key_map_list.map(function(k){return((k.down)?k.id:0)}))+'\n'+para_SA._path+'\n'+Date.now())
//  if (!use_rot_camera && (mov || rot)) rot_camera.ini_count = 0;

  if (mov)
    mov.multiplyScalar((c.mount_para && c.mount_para.speed_scale) || c.speed_scale)

// check ground movement START
  var ground_y = d.get_ground_y(c.pos)
  if (c.ground_obj) {
    const g = c.ground_obj.obj;
    const g_obj = g._obj;
    for (var index in c.ground_obj.bb_y_scale) {
      ground_y = (index == "mesh") ? Math.max(((c.ground_obj.obj.collision_by_mesh_enforced)?-999:ground_y), c.ground_obj.bb_y_scale.mesh) : Math.max(ground_y, g._obj_proxy.boundingBox_list[index].max.y * g_obj.scale.y * c.ground_obj.bb_y_scale[index] + g_obj.position.y)
    }
  }
  var ground_y_delta = 0
  var floating = c.floating || (mov && mov.y)// || d.key_map[32].down
  var gravity_y = 0
  var time_to_ground
  const falling_height_threshold = MMD_SA_options.Dungeon_options.falling_height_threshold || 10;
  if (!floating) {
    let v = (gravity_obj.y + gravity_obj.mov_y_last) / gravity_obj.time
// downward is positive
    gravity_y = v * time_diff + 0.5 * (98*1.5) * time_diff * time_diff
//DEBUG_show(gravity_y+'/'+Date.now()+'\n'+gravity_obj.y +','+ gravity_obj.mov_y_last)
//if (gravity_y > 3) DEBUG_show(gravity_y,0,1)
//gravity_y=3
    if (c.pos.y > ground_y+falling_height_threshold) {
// http://www.math.com/students/calculators/source/quadratic.htm
      let _a = 0.5 * (98*1.5)
      let _b = v
      let _c = -(c.pos.y - ground_y)
      let _x0 = Math.pow(Math.pow(_b,2)-4*_a*_c,0.5)/2/_a;
      time_to_ground = -_b/2/_a + _x0
      if (!(time_to_ground > 0))
        time_to_ground = -_b/2/_a - _x0
    }
  }
  if (!floating || (c.pos.y < ground_y)) {
    ground_y_delta = (c.pos.y > ground_y + gravity_y) ? -gravity_y : ground_y - c.pos.y
// if ground_obj.mov and not free falling (up or down)
    if (c.ground_obj && c.ground_obj.mov && ((Math.abs(ground_y_delta) != Math.abs(gravity_y)) || (gravity_y < 0.1))) {
      if (!mov)
        mov = movement_v3.set(0,0,0)
      mov.add(_v3a.copy(c.ground_obj.mov).applyQuaternion(_q.copy(model.mesh.quaternion).conjugate()))
    }
  }
//if (mov) DEBUG_show(!!floating + '\n' + mov.y+'\n'+ground_y+'/'+Date.now())
//if (c.ground_obj) console.log(JSON.stringify(c.ground_obj.bb_y_scale)+'/'+ground_y+'/'+ground_y_delta)

// downward movement only for simplicity
  gravity_obj.mov_y_last = (mov && (mov.y < 0)) ? -mov.y : 0
  gravity_obj.time = time_diff
  if (!floating)
    gravity_obj.y = gravity_y
  else
    gravity_obj.y = 0
// check ground movement END

  if (rot) {
    c.rot.add(rot)
    model.mesh.quaternion.multiply(MMD_SA.TEMP_q.setFromEuler(rot))
  }

// always initialize mov, to check collision against moving objects
  if (!mov)
    mov = movement_v3.set(0,0,0)
  var null_mov = !mov.x && !mov.y && !mov.z

  var moved
  if (c.about_turn) {
    mov.x = -mov.x
    mov.z = -mov.z
  }
  _v3a.copy(mov)
  if (!TPS_mode_in_action)
    _v3a.applyEuler(c.rot)

// check falling
//MMD_SA.playbackRate = 1
  model_para._playbackRate = 1
// time_falling is negative on map restart, to prevent false falling scenario on startup when the character is grounded even though initial ground_y is negative (usually when stage object is used).
  if (time_falling < 0) {
    time_falling++
  }
  else {
    let landing = (mm.filename == d.motion["PC landing"].name)
    let falling = (!key_motion_disabled && (ground_y_delta < 0) && (c.pos.y > ground_y+falling_height_threshold))
    if (falling || (landing && !c.grounded)) {
      if (!landing) {
        d.key_map_list.forEach(function (key_map) {
          if (mm.filename == key_map.motion_filename) {
            key_map.down = 0
            if (key_map.type_combat) {
              if (d.character_combat_locked == key_map.id) {
                d.character_combat_locked = null
              }
            }
          }
        });
        time_falling = 0
      }
      else {
        time_falling += time_diff
      }

      motion_id = null
      mov.copy(c.inertia).multiplyScalar(time_diff * Math.pow(0.95, time_diff*30))
      null_mov = !mov.x && !mov.y && !mov.z
      if (about_turn) {
        c.about_turn = !c.about_turn
        about_turn = false
      }
//d.character_movement_disabled = true
    }
//else if (landing) d.character_movement_disabled = false

    if (falling) {
      if (time_to_ground > 5/30) {
//DEBUG_show(time_to_ground,0,1)
        if (!landing) {
          MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[d.motion["PC landing"].name]]
          MMD_SA._force_motion_shuffle = true
        }
        model_para._playbackRate = 0.001

// "dummy" motion_id as if it's a key with motion
        motion_id = d.motion["PC landing"].name
// not needed anymore
        reset_motion = false
      }
    }
    else if (landing && (time_falling > 0.8)) {
//DEBUG_show(time_falling)
      if (!d.event_mode)
        d.character_movement_disabled = true
      if ((time_falling > 1.2) && c.grounded) {
d.sound.audio_object_by_name["hit-3"].play(model.mesh)
MMD_SA_options._motion_shuffle_list = [MMD_SA_options.motion_index_by_name["r01_普通に転ぶ"], MMD_SA_options.motion_index_by_name["OTL→立ち上がり"]]
MMD_SA_options.motion_shuffle_list_default = null
MMD_SA._force_motion_shuffle = true
      }
    }
    else {
      time_falling = 0
    }
  }

// legacy action hitbox pipeline START
  var _pos_restored = []
  movement_extra_v3.copy(model.mesh.position)

// check hit-box collision among action-enabled characters
  combat_para_default._attacker_list = []
  d._combat_para.forEach(function (para) {
    combat_para_default.combat_para = para
    var attacker = para.attacker
    if (attacker != PC) {
      combat_para_default.object_list = [c]
      let mesh = attacker.obj._obj
// reset the position that has been modified in jThree.MMD.js
      if (mesh._bone_to_position_last) {
        mesh.position.sub(mesh._bone_to_position_last.pos_delta_rotated)
        _pos_restored[attacker.obj._index] = true
      }
    }
    else
      combat_para_default.object_list = null

// ,_bb_expand: {x:0.5, y:0, z:0.5}
// ,_bb_translate: {x:0, y:0, z:0.5}
    var para_hit = para.para[para.index]
    combat_para_default.bb_expand    = para_hit.bb_expand    || combat_para_default._bb_expand//{x:0,y:0,z:99}//
    combat_para_default.bb_translate = para_hit.bb_translate || combat_para_default._bb_translate

    d.check_collision(attacker, ((attacker != PC)?(d._mov[attacker.obj._index]||new THREE.Vector3()):_v3a), true, combat_para_default);
  });
  var motion_id_enforced = combat_para_default._attacker_list.length

  if (motion_id_enforced) {
    var hit_para = combat_para_default._attacker_list.sort(function (a,b) { return a.hit_level-b.hit_level; }).pop()
    motion_id = hit_para.motion_id
//DEBUG_show(motion_id,0,1)
    rot_absolute = new THREE.Vector3().set(0, Math.PI/2 - Math.atan2((hit_para.attacker.obj._obj.position.z-c.pos.z), (hit_para.attacker.obj._obj.position.x-c.pos.x)), 0)
  }
// combat_para END
//DEBUG_show(Math.round(performance.now()-t)+'\n'+Date.now())
// use TPS_camera_lookAt_ instead of TPS_camera_lookAt
  if (!rot_absolute && c.combat_mode && can_lock_target && TPS_camera_lookAt_) {
    rot_absolute = new THREE.Vector3().set(0, Math.PI/2 - Math.atan2((TPS_camera_lookAt_.z-c.pos.z), (TPS_camera_lookAt_.x-c.pos.x)), 0)
  }

  if (!TPS_mode) {
    rot_absolute_with_camera = rot_absolute;
    rot_absolute = null;
  }

  var combat = d._states.combat

// general collision check for all moving objects (objects with .motion and para .check_collision=true, basically just combat members for now)
  var _object_list
  d.object_list.forEach(function (obj, idx) {
    var _mov = d._mov[idx]
    if (!_mov)
      return

// for performance reason, we need an optimized object list for collision test. Just use PC, combat characters and grid blocks (check_grid_blocks:true) as the collision check targets for now.
    if (!_object_list) _object_list = [c].concat((combat && combat.enemy_list) || [])//.concat(d.object_list)//

    var mesh = obj._obj
    if (mesh._bone_to_position_last && !_pos_restored[idx]) {
// reset the position that has been modified in jThree.MMD.js
      mesh.position.sub(mesh._bone_to_position_last.pos_delta_rotated)
    }

    var result = d.check_collision({ obj:obj, mass:obj.mass }, _mov, true, { collision_by_mesh_disabled:true, check_grid_blocks:true, object_list:_object_list })

    if (result.obj_hit) {
      var _y = _mov.y
      _mov.copy(result.moved_final).setY(_y)
    }
    mesh.position.add(_mov)
  });
//DEBUG_show(Math.round(performance.now()-t)+'\n'+Date.now())
// ground combat NPCs
  if (combat) {
    combat.enemy_list.forEach(function (enemy) {
      var mesh = enemy._obj
      if (mesh.visible) {
        mesh.position.y = d.get_ground_y(mesh.position)
      }
    });
  }

  movement_extra_v3.sub(model.mesh.position).negate()
  if (movement_extra_v3.x || movement_extra_v3.y || movement_extra_v3.z) {
//DEBUG_show(8,0,1)
    model.mesh.position.add(movement_extra_v3)
    mov = _v3a.add(movement_extra_v3)
    null_mov = false
    movement_extra_v3.set(0,0,0)
  }
// use the following line instead of the above block to possibly save some calculations, at the expense of some accuracy in collision checks.
//  c.pos.add(movement_extra_v3)

  if (!motion_id && pos_delta) {
    mov = _v3a.add(model.mesh._bone_to_position_last.pos_delta_rotated)
    null_mov = false
  }

  var ground_obj_checked, collision_by_mesh_failed
  for (var i = 0, i_max = dir_block.length; i < i_max; i++) {
    _v3b.copy(_v3a)
    var b_list = dir_block[i]
    if (b_list) {
      b_list.forEach(function (b) {
        _v3b[b] = 0
      });
      if (!null_mov && (!_v3b.x && !_v3b.y && !_v3b.z))
        continue
    }
    if (true) {//!d.check_grid_blocking(_v3c.copy(_v3b).add(c.pos), d.grid_blocking_character_offset, (null_mov)?null:_v3b)) {//
//let _t = performance.now()
      var result = d.check_collision(PC, _v3b, ground_obj_checked)
//DEBUG_show(Math.round(performance.now()-_t))
      collision_by_mesh_failed = result.collision_by_mesh_failed

      if (!ground_obj_checked) {
        ground_obj_checked = true
        c.ground_obj = result.ground_obj
      }

      if (result.obj_hit) {
        _v3b.copy(result.moved_final)
      }
      else if (null_mov)
        break

      if (_v3b.x || _v3b.y || _v3b.z) {
        mov.copy(_v3b)
        moved = true
        break
      }

      if (result.collision_by_mesh_checked)
        break
    }
    if (moved)
      break
  }

  if (reset_motion) {
    motion_reset.some(function (key_map) {
//      reset_key_map([key_map.id])
      if (mm.filename == key_map.motion_filename) {
        MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
        MMD_SA._force_motion_shuffle = true
        return true
      }
    });
  }

// check ground movement START
  ground_y = (collision_by_mesh_failed) ? c.pos.y : d.get_ground_y(c.pos)
  if (c.ground_obj) {
    const g = c.ground_obj.obj;
    const g_obj = g._obj
    for (var index in c.ground_obj.bb_y_scale) {
      ground_y = (index == "mesh") ? Math.max(((c.ground_obj.obj.collision_by_mesh_enforced)?-999:ground_y), c.ground_obj.bb_y_scale.mesh) : Math.max(ground_y, g._obj_proxy.boundingBox_list[index].max.y * g_obj.scale.y * c.ground_obj.bb_y_scale[index] + g_obj.position.y)
    }
  }
  var reset_camera// = (d.camera_y_default_non_negative && (c.ground_y != ground_y) && ((c.ground_y < 0) || (ground_y < 0)))
  c.ground_y = ground_y
  c.grounded = false
  if (!floating || (c.pos.y < ground_y)) {
    ground_y_delta = (c.pos.y > ground_y + gravity_y) ? -gravity_y : ground_y - c.pos.y
    c.grounded = ground_y_delta > -0.5
  }
//if (c.ground_obj) console.log(JSON.stringify(c.ground_obj.bb_y_scale)+'/'+ground_y+'/'+ground_y_delta)

  if (c.pos.y - ground_y < gravity_obj.y + gravity_obj.mov_y_last)
    gravity_obj.y = gravity_obj.mov_y_last = 0
// check ground movement END

  var change_motion = motion_id_enforced
/*
  if (!change_motion && (ground_y_delta < 0) && (c.pos.y > ground_y+10)) {
//    MMD_SA.playbackRate = 0.5
//    model_para._playbackRate = 0.5
  }
  else {
//    MMD_SA.playbackRate = 1
//    model_para._playbackRate = 1
    if (motion_id && !key_motion_disabled && (mm.filename != motion_id))
      change_motion = true
  }
*/
  if (motion_id && !key_motion_disabled && (mm.filename != motion_id))
    change_motion = true
  if (change_motion) {
    MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[motion_id]]
    MMD_SA._force_motion_shuffle = true
  }

  if (!moved && ground_y_delta) {
    moved = true
  }

  if (collision_by_mesh_failed) {
    moved = false
  }

  var camera_y_offset = 0
  if (movement_extra_v3.x || movement_extra_v3.y || movement_extra_v3.z)
    moved = true
  if (moved) {
    if (!mov)
      mov = movement_v3.set(0,0,0)
    mov.y += ground_y_delta
    if (c.pos.y + mov.y < ground_y)
      mov.y = ground_y - c.pos.y

    var _y = c.pos.y
    c.pos.add(mov)
    if (d.camera_y_default_non_negative && (c.pos.y < 0))
      camera_y_offset = (mov.y < 0) ? Math.min(_y, 0) - c.pos.y : 0
    else
      camera_y_offset = -MMD_SA._camera_y_offset_
    MMD_SA._camera_y_offset_ += camera_y_offset
  }
  else
    mov = null

  if (mov) {
// per second
    c.inertia.copy(mov).setY(0).multiplyScalar(1/time_diff)
  }
  else {
    c.inertia.set(0,0,0)
  }

  var update_dungeon_blocks
  if (mov || rot) {
    c.pos_update()
    let _mov_camera
    if (mov) {
      _mov_camera = _v3a.copy(mov.add(movement_extra_v3))
      _mov_camera.y += camera_y_offset
      _mov_camera = [_mov_camera, mov]
    }
    let _rot_camera = (TPS_mode_in_action && !TPS_camera_lookAt) ? null : rot;//(rot_camera.enabled && rot && rot_camera.v3.negate().add(rot))||rot;
    MMD_SA._trackball_camera.SA_adjust(_mov_camera, _rot_camera)
/*
    if (rot_camera.enabled && rot) {
//DEBUG_show(_rot_camera.clone().multiplyScalar(180/Math.PI).toArray().concat(Date.now()).join('\n'))
      rot_camera.v3.copy(rot)
    }
*/
    update_dungeon_blocks = true
  }
  else {
    d.PC_follower_list.forEach(function (para) {
var id = para.id
var obj = para.obj
if (!obj)
  return

para.onidle && para.onidle()
    });
  }

  if (about_turn) {
    model.mesh.quaternion.multiply(MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.set(0,Math.PI,0)))
  }

  if (rot_absolute || rot_absolute_with_camera) {
    if (!rot_absolute)
      rot_absolute = _v3b.set(0,0,0)
    if (rot_absolute_with_camera) {
      rot_absolute.add(rot_absolute_with_camera)
      rot_absolute_with_camera = _v3a.copy(rot_absolute_with_camera).sub(c.rot)
    }
    c.about_turn = false
    c.rot.copy(rot_absolute)
    model.mesh.quaternion.setFromEuler(rot_absolute)
    if (rot_absolute_with_camera)
      MMD_SA._trackball_camera.SA_adjust(null, rot_absolute_with_camera)
  }

  if (update_dungeon_blocks)
    d.update_dungeon_blocks()

  if (reset_camera) {
    MMD_SA.reset_camera()
  }


  var cp_events = []
  d.check_points.forEach(function (cp) {
    var pos
    if (cp.position)
      pos = _v3a.copy(cp.position)
    if (cp.object_index != null)
      pos.add(d.object_list[cp.object_index]._obj.position)
    cp.range.forEach(function (r) {
      var is_inside
      if (r.distance) {
        is_inside = (c.pos.distanceTo(pos) < r.distance)
      }
      else {
        is_inside = _b3.copy(r.zone).containsPoint(c.pos)
//DEBUG_show(is_inside+'/'+c.pos.toArray()+'\n'+_b3.min.toArray()+'/'+_b3.max.toArray())
      }

      if (is_inside) {
        if (r.onenter && !r._entered)
          cp_events.push(r.onenter)
        if (r.onstay)
          cp_events.push(r.onstay)
        r._entered = true
        if (r.onexit)
          r.onexit._pos_last = c.pos.clone()
      }
      else {
        if (r.onexit && r.onexit.condition && !r.onexit.condition()) {
//return
          _v3b.copy(r.onexit._pos_last).sub(c.pos)
          c.pos.copy(r.onexit._pos_last)

          c.pos_update()
          MMD_SA._trackball_camera.SA_adjust(_v3b)

//          MMD_SA.reset_camera()
          return
        }
        if (r.onexit && r._entered)
          cp_events.push(r.onexit)
        r._entered = false
      }
    });
  });
  cp_events.forEach(function (ev) {
    d.run_event(ev.event_id)
  });

//DEBUG_show(Math.round(performance.now()-t)+'\n'+Date.now())
//  model.mesh.bones_by_name["針回転"].quaternion=new THREE.Quaternion().setFromEuler(MMD_SA.TEMP_v3.set(0*Math.PI/180, -((d.getHours()+d.getMinutes()/60+(d.getSeconds()+d.getMilliseconds()/1000)/(60*60))/24*720)*Math.PI/180, 0*Math.PI/180));
});

}; // end of d._setupGameLoop

})();
