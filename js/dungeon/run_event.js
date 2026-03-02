// run_event.js — extracted from dungeon.js (Step 6B)
// Event execution engine and combat system for dungeon

MMD_SA_options.Dungeon._event_active = {};

MMD_SA_options.Dungeon.run_event = (function () {
    function statement(statement_obj) {
if (statement_obj._if) {
  if (condition.call(this, statement_obj._if)) {
    if (statement_obj._then)
      statement.call(this, statement_obj._then)
  }
  else {
    if (statement_obj._else)
      statement.call(this, statement_obj._else)
  }
}

event_main.call(this, statement_obj)
    }

    function condition(condition_obj) {
var bool

var c = condition_obj.condition
if (c) {
  var e
  if ((typeof c[0] == "string") || (c[0][1] == this.area_id)) {
    e = this.event_flag[c[0]]
  }
  else {
// array [0:area_id, 1:event_id]
    var event_flag = MMD_SA_options.Dungeon_options.options_by_area_id[c[0][0]]._saved.event_flag || {}
    e = event_flag[c[0][1]]
  }
  switch (c[1]) {
    case "===":
      bool = (e === c[2])
      break
    case "==":
      bool = (e == c[2])
      break
    case ">=":
      bool = (e >= c[2])
      break
    case "<=":
      bool = (e <= c[2])
      break
    case ">":
      bool = (e > c[2])
      break
    case "<":
      bool = (e < c[2])
      break
  }
}
else if (condition_obj._and) {
  bool = true
  for (var i = 0, i_max = condition_obj._and.length; i < i_max; i++) {
    if (!condition.call(this, condition_obj._and[i])) {
      bool = false
      break
    }
  }
}

return bool
    }

    function Combat(combat) {
Object.assign(this, combat)

this.event_obj = combat
this.enemy_list = []
    }
    Combat.prototype.ondefeated = (function () {
      function onenemyalldefeated_default() {
MMD_SA._force_motion_shuffle = true;
// override the current moion .onended event
window.addEventListener("SA_MMD_model0_onmotionended", onmotionended);
      }

      function onmotionended(e) {
MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[MMD_SA_options.Dungeon.motion["PC combat victory"].name]]
MMD_SA._no_fading = true
e.detail.result.return_value = true
window.removeEventListener("SA_MMD_model0_onmotionended", onmotionended);
      }

      return function (character_index) {
// backward compatibility
if (!this.enemy_list.length)
  return false

var d = MMD_SA_options.Dungeon

if (character_index == 0) {
  if (d.character.hp == 0) {
    if (this.onplayerdefeated && this.onplayerdefeated())
      return true
    if (d.character.ondefeated && d.character.ondefeated())
      return true
    if (!d._states.event_mode)
      d.run_event("_onplayerdefeated_default_")
    return true
  }
  return false
}

var c = d.object_base_list.find(function (obj_base) { return (obj_base.character_index==character_index); }).object_list[0];

var defeated
if (c && (c.hp == 0)) {
  if (c.ondefeated) {
    if (c.ondefeated())
      return true
  }
  else if (this.onenemydefeated) {
    if (this.onenemydefeated(c))
      return true
  }
  defeated = true
  c._obj_proxy.hidden = true
  c._obj.visible = false
  var model_para = MMD_SA_options.model_para_obj_all[character_index]
  model_para._motion_name_next = model_para.motion_name_default_combat
}

if (this.enemy_list.every(function (enemy) { return enemy.hp==0; })) {
  defeated = true
  if (this.onenemyalldefeated && this.onenemyalldefeated(onenemyalldefeated_default)) {
    return true
  }
  onenemyalldefeated_default()
//  MMD_SA_options.Dungeon.character.combat_mode = false
}

return defeated
      };
    })();

    function event_main(e) {
var that = this
var obj = this._event_active.obj

var sb_index = e.sb_index || 0;
var sb = MMD_SA.SpeechBubble.list[sb_index];
if (sb.visible && sb.msg_timerID && this._states.dialogue_mode) {
  sb.hide();
  if (sb_index == 0)
    that._states.dialogue_mode = false;
}

if (e.func && e.func()) {
  this.run_event()
  return
}

var c = this.character

if (e.message) {
  (function () {
const msg = e.message;
const _obj = obj;

const index = msg.index || 0;

const func = function () {
  if (msg.content) {
    const bubble_index = msg.bubble_index || 0;
    let para = msg.para || {};
    if (System._browser.camera.initialized)
      para.always_update = true;
    const duration = (msg.duration) ? msg.duration * 1000 : 0

    if (c.mount_para && c.mount_para.msg_para) {
      para = Object.clone(para)
      para.scale = (c.mount_para.msg_para.scale || 1) * (para.scale || 1);
      const _pos_mod = (c.mount_para.msg_para.pos_mod || [0,0,0])
      para.pos_mod = (para.pos_mod) ? para.pos_mod.map(function(v,idx){return v+_pos_mod[idx]}) : _pos_mod
    }

    if (msg.NPC) {
      para.head_pos = (_obj && _obj._obj.position.clone()) || THREE.MMD.getModels()[msg.NPC].mesh.position.clone()
      para.head_pos.y += 20
    }

    if (msg.branch_list) {
      msg.branch_list.forEach(b=>{ if (b.sb_index==null) b.sb_index=index; });
      that.dialogue_branch_mode = msg.branch_list;
    }

    MMD_SA.SpeechBubble.list[index].message(bubble_index, msg.content, duration, para)

    if ((index == 0) && !duration) {
      if (Lnumpad.style.visibility != "hidden")
        System._browser.virtual_numpad_toggle(true)
      that._states.dialogue_mode = true
    }
  }
  else {
    MMD_SA.SpeechBubble.list[index].hide();
    if (index == 0)
      that._states.dialogue_mode = false;
  }
};

const delay = (msg.delay) ? msg.delay * 1000 : 0;
if (delay) {
  setTimeout(function () { func() }, delay);
}
else {
  func();
}
  })();
}

if (e.turn_to_character) {
  var target_pos = (obj && obj._obj.position && (typeof e.turn_to_character != "number")) || THREE.MMD.getModels()[e.turn_to_character].mesh.position
  c.rot.y = Math.PI/2 - Math.atan2((target_pos.z-c.pos.z), (target_pos.x-c.pos.x))
  c.about_turn = false
  THREE.MMD.getModels()[0].mesh.quaternion.setFromEuler(c.rot)
  c.pos_update()
}

if (e.look_at_character) {
  MMD_SA._mouse_pos_3D = []
  if (obj && obj.cache_index && (typeof e.look_at_character != "number")) {
    MMD_SA_options.model_para_obj_all[0].look_at_target = (function () {
var target = obj
return function () {
  var pos = obj._obj.position.clone()
  pos.y += 15
  return pos
};
    })();
  }
  else
    MMD_SA_options.model_para_obj_all[0].look_at_character = e.look_at_character
}

if (e.NPC_turns_to_you) {
  var npc = (obj && obj._obj && (typeof e.NPC_turns_to_you != "number")) || THREE.MMD.getModels()[e.NPC_turns_to_you].mesh
  this._event_active._NPC_turns_back = { npc:npc, quat:npc.quaternion.clone() }
  MMD_SA.TEMP_v3.set(0, Math.PI/2 - Math.atan2((c.pos.z-npc.position.z), (c.pos.x-npc.position.x)), 0)
  npc.quaternion.setFromEuler(MMD_SA.TEMP_v3)
}

if (e.swap_PC) {
  if (typeof swap_PC == "number") {
    c.swap_character({character_index:e.swap_PC})
  }
  else {
    let id = this.object_id_translated[e.swap_PC] || e.swap_PC
    if (/^object(\d+)_(\d+)$/.test(id)) {
      c.swap_character(this.object_base_list[parseInt(RegExp.$1)].object_list[parseInt(RegExp.$2)])
    }
    else {
    }
  }
}

if (e.set_starting_position) {
  var area_id = e.set_starting_position.area_id || this.area_id
  var area_saved = MMD_SA_options.Dungeon_options.options_by_area_id[area_id]._saved
  var starting_position = e.set_starting_position.position
  if (!starting_position)
    area_saved.starting_position = null
  else if (typeof starting_position == "string")
    area_saved.starting_position = c.pos.clone()
  else
    area_saved.starting_position = starting_position
}

if (e.follow_PC) {
  for (var id in e.follow_PC) {
    var follower = e.follow_PC[id]

    var mesh, obj_base_index, obj_base
    id = this.object_id_translated[id] || id
    if (/^object(\d+)_(\d+)$/.test(id)) {
      obj_base_index = parseInt(RegExp.$1)
      obj_base = this.object_base_list[obj_base_index]
      mesh = obj_base.object_list[parseInt(RegExp.$2)]
      if (!mesh)
        continue
// trigger real object
      mesh._obj_proxy.hidden = false
      mesh._obj_proxy.visible = true

      mesh = mesh._obj
    }
    else {
    }

    this.PC_follower_list = this.PC_follower_list.filter(function (p) {
      return (p.obj._obj != mesh)
    });

    this.PC_follower_list.push({
  obj: {
    _obj: mesh
   ,pos_base: follower.pos_base
   ,rot_base: follower.rot_base
   ,follow_PC_ground_normal: obj_base && obj_base.use_PC_ground_normal_when_following
  }
    });
  }
}
if (e.unfollow_PC) {
  e.unfollow_PC.forEach(function (id) {
    var mesh
    id = that.object_id_translated[id] || id
    if (/^object(\d+)_(\d+)$/.test(id)) {
      var obj_base_index = parseInt(RegExp.$1)
      var obj_base = that.object_base_list[obj_base_index]
      mesh = obj_base.object_list[parseInt(RegExp.$2)]
      if (!mesh)
        return
// real object assumed
      mesh = mesh._obj
    }
    else {
    }

    that.PC_follower_list = that.PC_follower_list.filter(function (p) {
      return (p.obj._obj != mesh)
    });
  });
}

var objects = e.objects || {}
// backward compatibility
if (e.placement) {
  for (var id in e.placement) {
    objects[id] = { placement:e.placement[id] }
  }
  e.placement = null
}
if (objects) {
  var enemy_index = -1
  for (var id in objects) {
    var obj = objects[id]
    var p = obj.placement

    var character_index
    var mesh, _obj
    id = this.object_id_translated[id] || id
    if (id == "PC") {
      character_index = 0
      _obj = c
      mesh = THREE.MMD.getModels()[0].mesh
    }
    else if (/^object(\d+)_(\d+)$/.test(id)) {
      var obj_base_index = parseInt(RegExp.$1)
      var obj_base = this.object_base_list[obj_base_index]
      character_index = obj_base.character_index
      _obj = obj_base.object_list[parseInt(RegExp.$2)]
      if (!_obj)
        continue
      _obj._obj_proxy.hidden = p && p.hidden
      mesh = _obj._obj
    }
    else {
console.error("event error: invalid e.placement")
continue
    }

    var rot_mod, pos_center, center_mesh
    if (p) {
      if (p.position) {
        var pos = Object.assign(new THREE.Vector3(), p.position)
        if (pos.grid) {
          if (pos.grid.x == null) {
            pos.grid.x = ~~(mesh.position.x/this.grid_size)
            pos.grid.y = ~~(mesh.position.z/this.grid_size)
          }
          pos.add(new THREE.Vector3((pos.grid.x+0.5) * this.grid_size, 0, (pos.grid.y+0.5) * this.grid_size).add(pos))
        }
        if (pos.center) {
          let center_id = this.object_id_translated[pos.center.id] || pos.center.id
          if (center_id == "PC")
            center_mesh = THREE.MMD.getModels()[0].mesh
          else if (/^object(\d+)_(\d+)$/.test(center_id))
            center_mesh = this.object_base_list[parseInt(RegExp.$1)].object_list[parseInt(RegExp.$2)]._obj
          if (pos.center.offset) {
            let offset = MMD_SA.TEMP_v3.copy(pos.center.offset)
            if (pos.center.offset_rotation) {
              if (center_mesh.useQuaternion)
                offset.applyQuaternion(center_mesh.quaternion)
              else
                offset.applyEuler(center_mesh.rotation)
              offset.applyEuler(MMD_SA._v3b.copy(pos.center.offset_rotation).multiplyScalar(Math.PI/180))
            }
            pos_center = center_mesh.position.clone().add(offset)
          }
        }
        if (pos_center)
          pos.add(pos_center)
        if (p.behind_camera) {
          var camera = MMD_SA._trackball_camera
          MMD_SA.TEMP_v3.copy(camera.object.position).sub(camera.target).setY(0)
          var a = -Math.atan2(MMD_SA.TEMP_v3.z, MMD_SA.TEMP_v3.x) + Math.PI/2
//console.log(MMD_SA.TEMP_v3.toArray().join(",")+"/"+a)
          rot_mod = MMD_SA._v3a.set(0,a,0)
          Object.assign(pos, MMD_SA.TEMP_v3.set(pos.x,0,pos.z).applyEuler(rot_mod).add(camera.object.position))
        }
        if (pos.grounded) {
          var x = ~~(pos.x/this.grid_size)
          var y = ~~(pos.z/this.grid_size)
          pos.y = this.get_ground_y(pos)//this.get_para(x,y).ground_y || 0
        }
        if (character_index == 0) {
          c.pos.copy(pos)
        }
        else {
          mesh.position.copy(pos)
        }
      }
      if (p.rotation) {
        var rot = MMD_SA.TEMP_v3.copy(p.rotation).multiplyScalar(Math.PI/180)
        if (center_mesh) {
          if (center_mesh.useQuaternion) {
//            rot.add(MMD_SA._v3b.setEulerFromQuaternion(center_mesh.quaternion))
          }
          else
            rot.add(center_mesh.rotation)
        }
        if (rot_mod)
          rot.add(rot_mod)
        if (character_index == 0) {
          c.about_turn = false
          c.rot.copy(rot)
          mesh.quaternion.setFromEuler(rot)
        }
        else {
          if (mesh.useQuaternion)
            mesh.quaternion.setFromEuler(rot)
          else
            mesh.rotation.copy(rot)
        }
// avoid some conversion issue from Quaternion to Euler
if (mesh.useQuaternion && center_mesh && center_mesh.useQuaternion) mesh.quaternion.multiply(center_mesh.quaternion)
//if (p.rotation.y==90) DEBUG_show(rot.y*180/Math.PI+'\n\n'+MMD_SA.TEMP_v3.setEulerFromQuaternion(mesh.quaternion).multiplyScalar(180/Math.PI).toArray().join("\n"))
      }
      var vis = (p.hidden) ? false : true;
      mesh.visible = vis;
// update mesh reference after .visible update
      if (id != "PC")
        mesh = _obj._obj
      if (!MMD_SA.THREEX.enabled) mesh.children.forEach(function (c) { c.visible=vis; });
      if (character_index == 0) {
        c.pos_update()
        MMD_SA.reset_camera()
      }
    }

    if ((obj.hp != null) && _obj.hp_max) {
      _obj.hp = Math.min(obj.hp, _obj.hp_max)
    }

    var zom = obj.zone_of_movement || _obj._zone_of_movement
    if (zom) {
      if (!_obj.zone_of_movement)
        _obj.zone_of_movement = new THREE.Box3()
      _obj.zone_of_movement.copy(zom).translate(zom.center_position || pos_center || mesh.position)
    }

    if (obj.combat_stats) {
      Object.append(_obj.combat_stats, obj.combat_stats)
    }

    if (this._states.combat && (id != "PC") && (_obj.hp > 0) && (this._states.combat.enemy_list.indexOf(_obj) == -1)) {
      this._states.combat.enemy_list.push(_obj)
      if (this._states.combat.show_HP_bar) {
this.sprite.display(new this.sprite.TextureObject_HP_bar(++enemy_index), {
  pos_target: {
    mesh: mesh
   ,offset: new THREE.Vector3(0,mesh.geometry.boundingBox.max.y*mesh.scale.y+2,0)
  }
 ,get_value: (function () {
    var obj = _obj;
    var para = { index:enemy_index, border_color_default:"black" };
    return function () {
para.v = obj.hp/obj.hp_max
var combat = MMD_SA_options.Dungeon._states.combat
if (combat)
  para.border_color = (para.index == combat._target_enemy_index) ? "white" : "black"
return para;
    };
  })()
})
      }
    }

    obj.func && obj.func(_obj)
  }
  this.update_dungeon_blocks(true)
}

if (e.motion) {
  for (var index in e.motion) {
    index = parseInt(index)
    var motion = e.motion[index]
    if (index == 0) {
      if (!(motion instanceof Array))
        motion = [motion]
      var motion_name0 = motion[0].name
      var loop = motion[0].loop
      if (motion_name0 && ((this.motion[motion_name0] && this.motion[motion_name0].name) || MMD_SA_options.motion_index_by_name[motion_name0])) {
var motion_list = motion.map(function (m, idx) {
  var motion_name = motion[idx].name
  return MMD_SA_options.motion_index_by_name[(that.motion[motion_name] && that.motion[motion_name].name) || motion_name];
});
if (loop) {
  MMD_SA_options.motion_shuffle_list_default = motion_list
}
else {
//        MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[motion_id]]
// use ._motion_shuffle_list instead, because we have multiple motions running in order, but .motion_shuffle_list_default can be shuffled.
  MMD_SA_options._motion_shuffle_list = motion_list
  MMD_SA_options.motion_shuffle_list_default = null
}
      }
      else {
        MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
      }
      MMD_SA._force_motion_shuffle = true
    }
    else {
      var model_para = MMD_SA_options.model_para_obj_all[index]
      if (model_para)
        model_para._motion_name_next = (motion.name && ((this.motion[motion.name] && this.motion[motion.name].name) || motion.name)) || model_para.motion_name_default
//DEBUG_show(index+":"+motion.name+"/"+model_para._motion_name_next,0,1)
    }
  }
}

if ((e.object_motion_paused != null) && (obj && obj.motion)) {
  obj.motion.paused = e.object_motion_paused
}

if (e.inventory) {
  var inv = e.inventory
  if (!this.inventory.add(inv.item_id, inv.stock)) {
    MMD_SA.SpeechBubble.message(3, "Your inventory is full.", 0)
    this._states.dialogue_mode = true
    if (inv.onfailure) {
      inv.onfailure(e)
    }
    else {
      this.event_flag[this._event_active.id] = 0
      this._event_active.index = 999
    }
    return
  }

  if (inv.onsuccess) {
    inv.onsuccess(e)
  }
  else {
    MMD_SA.SpeechBubble.message(3, 'You found "' + this.item_base[inv.item_id].info_short + '" x' + inv.stock + '.', 0)
    var bi = ++this.event_flag[this._event_active.id]
    if (!this.events[this._event_active.id][bi])
      this.events[this._event_active.id][bi] = [{ message:{ bubble_index:3, content:"You found nothing." } }]
    this._event_active.index = 999
    this._states.dialogue_mode = true
  }
}

if (e.mount) {
  if (e.mount.target) {
    let id = this.object_id_translated[e.mount.target] || e.mount.target
    if (/^object(\d+)_(\d+)$/.test(id)) {
      e.mount.target = this.object_base_list[parseInt(RegExp.$1)].object_list[parseInt(RegExp.$2)]
    }
  }
  else
    e.mount.target = obj
  c.mount(e.mount)
}
if (e.dismount) {
  c.dismount()
}

if (e.sound) {
  var sound = e.sound
  var obj_parent
  if (sound.object_parent == "PC") {
    obj_parent = c._obj
  }
  var player_obj
  switch (sound.action) {
    case "play":
      player_obj = this.sound.audio_object_by_name[sound.name].play(obj_parent, sound.spawn_id)
      break
    case "pause":
      player_obj = this.sound.audio_object_by_name[sound.name].get_player_obj(obj_parent, sound.spawn_id)
      if (player_obj)
        player_obj.player.pause()
      break
  }
  if (player_obj) {
    if (sound.volume)
      player_obj.player.volume = sound.volume
  }
}

// backward compatibility
if (e.combat_mode) {
//  c.combat_mode = e.combat_mode
  e.combat = {
    enabled:true
  };
  delete e.combat_mode
}

if (e.combat) {
  if (e.combat.enabled != null) {
//if (e.combat.enabled) DEBUG_show((e.combat.ended_timestamp||0) + "/" + (Date.now() + e.combat.cooling_time),0,1)
    if ((e.combat.enabled != c.combat_mode) && (!e.combat.enabled || !e.combat.cooling_time || !e.combat.ended_timestamp || (Date.now() > e.combat.ended_timestamp+e.combat.cooling_time*1000))) {
      if (e.combat.enabled) {
        this._states.combat = new Combat(e.combat)
      }
      if (e.combat.onstatechange) {
        event_main.call(this, e.combat.onstatechange)
      }
      c.combat_mode = e.combat.enabled
    }
    else {
      event_main.call(this, e.combat.onstateunchange || { ended:true })
    }
  }
}

if (e.camera_focus) {
// for TPS camera
  MMD_SA.reset_camera(true)

  c.rot.y = Math.PI/2 - Math.atan2((e.camera_focus.z-c.pos.z), (e.camera_focus.x-c.pos.x))
  THREE.MMD.getModels()[0].mesh.quaternion.setFromEuler(c.rot)
  c.about_turn = false
  MMD_SA.reset_camera(true)
}

if (e.statement) {
  statement.call(this, e.statement)
}

if (e.set_event_flag) {
  if (e.set_event_flag.area_id && (e.set_event_flag.area_id != this.area_id)) {
    var _saved = MMD_SA_options.Dungeon_options.options_by_area_id[e.set_event_flag.area_id]._saved
    _saved.event_flag = _saved.event_flag || {}
    _saved.event_flag[e.set_event_flag.id||this._event_active.id] = e.set_event_flag.branch_index
  }
  else
    this.event_flag[e.set_event_flag.id||this._event_active.id] = e.set_event_flag.branch_index
}

if (e.load_area) {
  this.restart(e.load_area.id, ((e.load_area.refresh_state != null) ? e.load_area.refresh_state : 2))
}

if (e.goto_branch != null) {
  this.run_event(null, e.goto_branch, 0)
}

if (e.goto_event) {
  this.run_event(e.goto_event.id, e.goto_event.branch_index, e.goto_event.step||e.goto_event.event_index||0)
}

// backward compatibility
if (e.next_event) {
  e.next_step = e.next_event
  delete e.next_event
}
if (e.next_step) {
  if (e.next_step.delay != null)
    setTimeout(function () { MMD_SA_options.Dungeon.run_event() }, e.next_step.delay*1000)
  else
    this.run_event()
}

if (e.ended) {
  if ((typeof e.ended == 'string') && (e.ended != this._event_active.id)) return;

  document.getElementById('SB_tooltip').style.visibility = 'hidden';
//  MMD_SA_options.Dungeon.inventory._item_updated?.update_info(null, true);

  const sb_index = e.sb_index || 0;
  if (sb_index == 0) {
    MMD_SA.SpeechBubble.list.forEach(sb=>{
      if (sb.visible && !sb.msg_timerID)
        sb.hide();
    });

    if (this._event_active._NPC_turns_back)
      this._event_active._NPC_turns_back.npc.quaternion.copy(this._event_active._NPC_turns_back.quat)

    this._states.event_mode = this._states.dialogue_mode = this.dialogue_branch_mode = false
    this._event_active = {}

    MMD_SA._mouse_pos_3D = []
    MMD_SA_options.model_para_obj_all[0].look_at_character = null
    MMD_SA_options.model_para_obj_all[0].look_at_target = null

    MMD_SA.reset_camera()
  }
  else {
    const sb = MMD_SA.SpeechBubble.list[sb_index];
    if (sb.visible && !sb.msg_timerID)
      sb.hide();
  }
}
    }

    return function (event_id, branch_index, event_index) {
if (!event_id)
  event_id = this._event_active.id
else if (Array.isArray(event_id)) {
  this.events["_ONETIME_"] = event_id
  event_id = "_ONETIME_"
  if (branch_index == null)
    branch_index = 0
  if (event_index == null)
    event_index = 0
}
else if (event_id instanceof Object) {
  event_main.call(this, event_id)
  return
}

var events = this.events[event_id]
if (!events) {
  if (/^(.+)\_\d+$/.test(event_id)) {
    event_id_parent = RegExp.$1
    events = this.events[event_id_parent]
    if (events) {
      events = this.events[event_id] = Object.clone(events)
    }
    else
      return
  }
  else
    return
}

if (branch_index == null)
  branch_index = this.event_flag[event_id]
var e_branch = events[branch_index]
if (!e_branch) {
  branch_index = 0
  e_branch = events[0]
}

if (event_index == null)
  event_index = this._event_active.index || 0
//DEBUG_show([event_id, branch_index, event_index],0,1)

this._event_active.id     = event_id
this.event_flag[event_id] = branch_index
this._event_active.index  = event_index+1

var e = e_branch[event_index] || { ended:true }
this._states.event_mode = true
event_main.call(this, e)
    };
})();
