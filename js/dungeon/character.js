// character.js — extracted from dungeon.js (Step 6C)
// Character controller: position, rotation, camera, combat mode, mount/dismount, key bindings

MMD_SA_options.Dungeon.character = {

    pos: null
   ,rot: null
   ,inertia: null
   ,about_turn: false
   ,xy: [-1,-1]
   ,ground_y: 0
   ,ground_normal: null
   ,grounded: false
   ,camera_position_base_default: null
   ,camera_position_base: null
   ,speed_scale: 1
//   ,boundingBox_scale: {x:2, y:1, z:2}

   ,TPS_camera_lookAt_: null

   ,mass: 1

   ,bb_translate: {
      x:0, y:0, z:0.5
     ,_default: {x:0, y:0, z:0.5}
     ,update: function () {
var mesh = THREE.MMD.getModels()[0].mesh
this.z = 0.5 + (MMD_SA.get_bone_position(mesh, (mesh.bones_by_name["上半身2"] && "上半身2") || "上半身", mesh).z - MMD_SA.get_bone_position(mesh, "センター", mesh).z) / (mesh.geometry.boundingSphere.radius * (Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z) || 1))

var para_SA = MMD_SA.MMD.motionManager.para_SA
if (para_SA.bb_translate && para_SA.bb_translate.limit) {
  if (para_SA.bb_translate.limit.max)
    this.z = Math.min(this.z, para_SA.bb_translate.limit.max.z)
  if (para_SA.bb_translate.limit.min)
    this.z = Math.max(this.z, para_SA.bb_translate.limit.min.z)
}
//DEBUG_show(this.z)
      }
    }

// mainly for .check_collision()
   ,get _obj()  { return THREE.MMD.getModels()[0].mesh; }
   ,get _mesh() { return THREE.MMD.getModels()[0].mesh; }
   ,character_index: 0
   ,_index: -1

   ,TPS_mode: false

   ,_combat_mode: false
   ,get combat_mode() { return this._combat_mode }
   ,set combat_mode(bool) {
bool = !!bool
if (bool == this._combat_mode)
  return

this._combat_mode = bool
var d = MMD_SA_options.Dungeon
if (bool) {
  MMD_SA_options.motion_shuffle_list_default  = MMD_SA_options.Dungeon._motion_shuffle_list_default_combat.slice()
  MMD_SA_options._motion_shuffle_list_default = MMD_SA_options.motion_shuffle_list_default.slice()
  d.key_map_swap(d.key_map_combat)
  MMD_SA._force_motion_shuffle = true

  MMD_SA_options.look_at_screen = false

  if (this.boundingBox_scale)
    this.update_boundingBox(new THREE.Vector3().set(1.0, 1, 1.0).divide(this.boundingBox_scale))
}
else {
  if (d._states.combat) {
    d._states.combat.event_obj.ended_timestamp = Date.now()
    d._states.combat = null
    this.TPS_camera_lookAt_ = null
  }

// If temporary check point is in use, restore the original check points.
  if (d._check_points) {
    d.check_points = d._check_points;
    d._check_points = null;
  }

  MMD_SA_options.motion_shuffle_list_default  = MMD_SA_options.Dungeon._motion_shuffle_list_default.slice()
  MMD_SA_options._motion_shuffle_list_default = MMD_SA_options.motion_shuffle_list_default.slice()
  d.key_map_swap(d.key_map_default)

  MMD_SA_options.look_at_screen = true

  if (this.boundingBox_scale)
    this.update_boundingBox()

  MMD_SA.reset_camera(true)
}
    }

   ,states: {}

   ,pos_update: function () {
var that = this
var d = MMD_SA_options.Dungeon

var model_mesh = THREE.MMD.getModels()[0].mesh
var moved = !model_mesh.position.equals(this.pos)
model_mesh.position.copy(this.pos)

this.rot.set(this.rot.x % (Math.PI*2), this.rot.y % (Math.PI*2), this.rot.z % (Math.PI*2));

for (var i = 1, i_max = d.PC_light_max; i < i_max; i++) {
  var light = MMD_SA.light_list[i]
  light.obj.position.copy(light._pos_base).add(this.pos)

  if (light.obj.target) {
    light.obj.target.position.copy(light._target_pos_base).add(this.pos)
  }
}

d.PC_follower_list.forEach(function (para) {
  var id = para.id
  var obj = para.obj
  if (!obj)
    return

  if (obj.rot_base) {
    obj._obj.rotation.copy(MMD_SA.TEMP_v3.copy(obj.rot_base)).multiplyScalar(Math.PI/180).add(that.rot)
    if (that.about_turn)
      obj._obj.rotation.add(MMD_SA.TEMP_v3.set(0,Math.PI,0))
    obj._obj.quaternion.setFromEuler(obj._obj.rotation)
    if (that.ground_normal && obj.follow_PC_ground_normal) {
      if (!obj._ground_normal)
        obj._ground_normal = new THREE.Vector3(0,1,0)
      if (MMD_SA.TEMP_v3.crossVectors(obj._ground_normal, that.ground_normal).lengthSq() > 0.2*0.2) {
        if (moved)
          obj._ground_normal.lerp(that.ground_normal, 0.1)
      }
      else
        obj._ground_normal.copy(that.ground_normal)
      const ground_q = new THREE.Quaternion().setFromRotationMatrix(MMD_SA.TEMP_m4.lookAt(MMD_SA.TEMP_v3.set(0,0,0), MMD_SA._v3a.set(0,0,-1), obj._ground_normal))

      MMD_SA.TEMP_q.copy(obj._obj.quaternion)
      obj._obj.quaternion.copy(ground_q).multiply(MMD_SA.TEMP_q)
    }
    else
      obj._ground_normal = null
  }

  var pos = obj._obj.position
  para._pos_old = pos.clone()
  pos.copy(obj.pos_base)
  if (obj.rot_base) {
    pos.applyQuaternion(obj._obj.quaternion)
  }
  pos.add(that.pos)
  if (para.grounded) {
    const x = ~~(pos.x/d.grid_size)
    const y = ~~(pos.z/d.grid_size)
    pos.y = d.get_para(x,y,true).ground_y || 0
  }

  para.onupdate && para.onupdate()
});

this.camera_update()
    }

   ,camera_TPS_mode: false
   ,camera_TPS_rot: null
   ,camera_update: (function () {
      var c
      window.addEventListener("MMDStarted", function (e) {
c = MMD_SA_options.Dungeon.character
c.camera_TPS_rot = new THREE.Vector3()
      });

      window.addEventListener("MMDCameraReset", function (e) {
if (!e.detail.enforced) return;

c.camera_TPS_rot.set(0, c.rot.y, 0)
c.camera_update()
      });

      return function () {
var d = MMD_SA_options.Dungeon

var pos = MMD_SA._v3a.copy(this.pos)
if (d.camera_y_default_non_negative)
  pos.y = Math.max(this.pos.y,0)

MMD_SA.TEMP_v3.fromArray(this.camera_position_base)

if (this.camera_TPS_mode) {
  MMD_SA.TEMP_v3.applyEuler(this.camera_TPS_rot)
}
else {
  this.camera_TPS_rot.set(0,0,0)
  MMD_SA.TEMP_v3.applyEuler(this.rot)
}

MMD_SA.TEMP_v3.add(pos)
var blocked = d.check_grid_blocking(MMD_SA.TEMP_v3, d.grid_blocking_camera_offset)

MMD_SA_options.camera_position = pos.toArray()

MMD_SA.TEMP_v3.sub(pos)
MMD_SA_options.camera_position[0] += MMD_SA.TEMP_v3.x
MMD_SA_options.camera_position[1] += MMD_SA.TEMP_v3.y
MMD_SA_options.camera_position[2] += MMD_SA.TEMP_v3.z
//DEBUG_show(MMD_SA_options.camera_position,0,1)

if (blocked) {
  MMD_SA.reset_camera()
}
      };
    })()

   ,hp: 100
   ,hp_max: 100
   ,hp_add: function (num, check_hp) {
if (!num)
  return

var hp_last = this.hp
this.hp += num
if (num > 0) {
  if (this.hp > this.hp_max) {
    this.hp = this.hp_max
  }
}
else {
  if (this.hp <= 0) {
    this.hp = 0
  }
}
MMD_SA_options.Dungeon.update_status_bar()

if (check_hp && check_hp(this))
  return

// default events here
    }

   ,mount_para: null
   ,mount: function (para) {
var d = MMD_SA_options.Dungeon
this.dismount()

this.mount_para = para
if (para.onmount) {
  d.run_event(para.onmount)
}

var target = para.target._obj
d.PC_follower_list.push({
  obj: {
    _obj: target
   ,pos_base: new THREE.Vector3()
   ,rot_base: new THREE.Vector3()
   ,follow_PC_ground_normal: (para.target.use_PC_ground_normal_when_following !== false)
  }
 ,onupdate: para.onupdate
 ,onidle: para.onidle
});

if (para.PC_hidden)
  MMD_SA._skip_render_list.push("#mikuPmx0")
//if (para.speed_scale) this.speed_scale = para.speed_scale;
if (para.camera_position_base)
  this.camera_position_base = para.camera_position_base.slice()
if (para.camera_target_offset)
  MMD_SA.center_view_lookAt_offset = para.camera_target_offset
if (para.mount_position || para.mount_rotation) {
  this._mount_position = function (e) {
    var mesh = e.detail.model.mesh
// use a dummy morph_index (0)
    mesh._bone_morph["全ての親"] = { 0:{ pos_v3:para.mount_position||new THREE.Vector3(), rot_q:(para.mount_rotation && new THREE.Quaternion().setFromEuler(MMD_SA.TEMP_v3.copy(para.mount_rotation).multiplyScalar(Math.PI/180)))||new THREE.Quaternion() } }
  };
  window.addEventListener("SA_MMD_model0_process_bones", this._mount_position);
}

this.pos.copy(target.position)
this.pos_update()
MMD_SA.reset_camera()
    }

   ,dismount: function () {
var para = this.mount_para
if (!para)
  return

var d = MMD_SA_options.Dungeon

if (para.ondismount) {
  d.run_event(para.ondismount)
}

var target = para.target._obj
d.PC_follower_list = d.PC_follower_list.filter(function (p) {
  return (p.obj._obj != target)
});

if (para.PC_hidden) {
  MMD_SA._skip_render_list = MMD_SA._skip_render_list.filter(function (p) {
    return (p != "#mikuPmx0")
  });
}
//if (para.speed_scale) this.speed_scale = 1;
if (para.camera_position_base)
  this.camera_position_base = this.camera_position_base_default.slice()
if (para.camera_target_offset)
  MMD_SA.center_view_lookAt_offset = null
if (para.mount_position || para.mount_rotation) {
  window.removeEventListener("SA_MMD_model0_process_bones", this._mount_position);
  this._mount_position = null
}
if (para.dismount_position) {
  this.pos.add(MMD_SA.TEMP_v3.copy(para.dismount_position).applyQuaternion(THREE.MMD.getModels()[0].mesh.quaternion))
  this.pos_update()
}
MMD_SA.reset_camera()

var saved = MMD_SA_options.Dungeon_options.options_by_area_id[d.area_id]._saved.object_by_index
saved = saved[para.target._index] = saved[para.target._index] || {}
if (!saved.position)
  saved.position = {}
if (!saved.rotation)
  saved.rotation = {}

this.mount_para = null
    }

   ,update_boundingBox: function (scale) {
var model_mesh = THREE.MMD.getModels()[0].mesh
if (!this.boundingBox)
  this.boundingBox = (MMD_SA_options.model_para_obj.boundingBox && new THREE.Box3().set(MMD_SA_options.model_para_obj.boundingBox.min, MMD_SA_options.model_para_obj.boundingBox.max)) || model_mesh.geometry.boundingBox.clone()
model_mesh.geometry.boundingBox = new THREE.Box3().set(this.boundingBox.min, this.boundingBox.max)
model_mesh.geometry.boundingBox_list = [model_mesh.geometry.boundingBox]

if (!scale)
  scale = MMD_SA._v3a.set(1,1,1)
var bb_scale = this.boundingBox_scale || MMD_SA._v3b.set(1,1,1)
var size = this.boundingBox.size(MMD_SA.TEMP_v3)
model_mesh.geometry.boundingBox.expandByVector(new THREE.Vector3(size.x*(bb_scale.x*scale.x-1)*0.5, size.y*(bb_scale.y*scale.y-1)*0.5, size.z*(bb_scale.z*scale.z-1)*0.5))
    }

   ,swap_character: function (character) {
if (character) {
  let is_NPC = (character.object_index != null)

  if (character.character_index != 0) {
    THREE.MMD.swapModels(0, character.character_index, function () {
      if (!is_NPC)
        return

// hide the old mesh
      character._obj_proxy.visible = false
// show the new mesh
      character._obj_proxy.visible = true
    });
  }
}

var para_SA = MMD_SA_options.model_para_obj

if (para_SA.is_PC_candidate) {
  if (!para_SA.character.combat_stats)
    para_SA.character.combat_stats = new MMD_SA_options.Dungeon._CombatStats(para_SA.character.combat_stats_base)
  this.combat_stats_base = para_SA.character.combat_stats_base
  this.combat_stats = para_SA.character.combat_stats

  this.states = {}

  this.assign_keys()
}

if (para_SA._icon_canvas)
  this.icon.getContext("2d").drawImage(para_SA._icon_canvas, 0,0)
MMD_SA_options.Dungeon.update_status_bar(true)

this.update_boundingBox()
    }

   ,assign_keys: function () {
var d = MMD_SA_options.Dungeon;

if (MMD_SA_options.Dungeon_options.combat_mode_enabled) {
  const key_map_new = {};
  Object.keys(d.key_map).filter((k)=>k<10000).forEach((k)=>{key_map_new[k]=d.key_map[k]});
  d.key_map = key_map_new;

  MMD_SA_options.Dungeon_options.attack_combo_list.forEach(function (combo) {
    combo._RE = new RegExp("(^|\\,)" + combo.combo_RE.replace(/\,/g, "\\,") + "(\\,|$)");
    combo._RE_simple = new RegExp("(^|\\,)" + ((/^(123|456|789)$/.test(combo.combo_RE)) ? combo.combo_RE.replace(/123/, "3\\,3").replace(/456/, "6\\,6").replace(/789/, "9\\,9") : combo.combo_RE.replace(/\,/g, "\\,").replace(/[123]+/g, "[123]").replace(/[456]+/g, "[456]").replace(/[789]+/g, "[789]")) + "(\\,|$)");
    d.key_map[combo.keyCode] = { order:combo.keyCode, id:"combo-"+combo.keyCode, type_combat:true, keyCode:combo.keyCode
     ,motion_id: combo.motion_id
    };
  });
}

Object.keys(d.key_map).map((key)=>d.key_map[key]).concat(d.key_map_combat||[]).concat(d.key_map_parry||[]).forEach((function () {
  var p_to_sync = ["combat_para", "mov_speed", "keyCode", "motion_duration"];
  var modes = ["", "TPS_mode"]

  return function (key_map) {
    modes.forEach(function (mode) {
var km = (mode) ? key_map[mode] : key_map;
if (!km)
  return

if (!('motion_filename' in km))
  Object.defineProperty(km, 'motion_filename', { get:function () { return this.motion_id && MMD_SA_options.Dungeon.motion_filename_by_id[this.motion_id]; } });

var para = km.motion_id && d.motion[km.motion_id].para
if (para) {
  para.motion_id = km.motion_id

  if (para.motion_duration_by_combo) {
    para.motion_duration_by_combo.forEach(function (combo) {
      if (combo.combo_RE) {
        combo._RE = new RegExp("^" + combo.combo_RE.replace(/\,/g, "\\,") + "(\\,|$)")
        combo._RE_simple = new RegExp("^" + combo.combo_RE.replace(/\,/g, "\\,").replace(/\d+/g, "\\d") + "(\\,|$)")
      }
    });
  }

  p_to_sync.forEach(function (p) {
    km[p] = para[p] = km[p] || para[p] || key_map[p];
  });

  if (km.motion_duration) {
    para.duration = 10
    para.duration_NPC = km.motion_duration
  }
}
    });
  };
})());

d.key_map_reset()
    }

   ,reset: function () {
if (!this._obj_proxy) this._obj_proxy = new MMD_SA_options.Dungeon.Object3D_proxy_base(this);

this.dismount()

this.ground_obj = null
this.grounded = false
this.floating = false
this.xy = [-1,-1]
this.ground_y = 0
this.ground_normal = null
this.camera_position_base = this.camera_position_base_default.slice()
this.pos = new THREE.Vector3()
this.rot = new THREE.Vector3()
this.inertia = new THREE.Vector3()
this.about_turn = false
this.speed_scale = 1

this.combat_mode = false
this.hp_add(this.hp_max)
this.combat_stats_base = this.combat_stats_base || {}
this.combat_stats = new MMD_SA_options.Dungeon._CombatStats(this.combat_stats_base)

this.states = {}

var model_mesh = THREE.MMD.getModels()[0].mesh
model_mesh.position.set(0,0,0)
model_mesh.quaternion.set(0,0,0,1)

this.update_boundingBox()

for (var i = 1, i_max = MMD_SA_options.Dungeon.PC_light_max; i < i_max; i++) {
  var light = MMD_SA.light_list[i]
  if (!light._pos_base || !(light.obj instanceof THREE.DirectionalLight))
    light._pos_base = light.obj.position.clone()

  if (light.obj.target) {
    if (!light._target_pos_base)
      light._target_pos_base = light.obj.target.position.clone()
//console.log(light._target_pos_base)
  }
}

MMD_SA_options.Dungeon.PC_follower_list.forEach(function (para) {
  var id = para.id
  var obj = para.obj
  if (!obj) {
    obj = para.obj = MMD_SA_options.mesh_obj_by_id[id.substr(1)]
  }
  if (!obj)
    return
  if (!obj.pos_base)
    obj.pos_base = obj._obj.position.clone()
//DEBUG_show(id+':'+obj.pos_base.toArray(),0,1)
});
    }
  }
;
