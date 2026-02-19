// restart.js - Extracted from dungeon.js (Step 6A)

MMD_SA_options.Dungeon.restart = (function () {
    class Object3D_proxy extends MMD_SA_options.Dungeon.Object3D_proxy_base {
      constructor (_parent, _cache) {
super(_parent);

this._cache = _cache
this._cache_index = -1
this._obj_name = (!_cache.is_LOD_far) ? "_obj" : "_obj_LOD_far"

// dummy
this.children = []

// to indicate the visibility of mesh/proxy/proxy_far as a whole
// not linked to .visible to avoid some issues (and therefore you need to change both .hidden and .visible for visibility)
this._hidden = false

this.position = new THREE.Vector3()
this.rotation = new THREE.Vector3()
this.quaternion = new THREE.Quaternion()
this.scale = new THREE.Vector3()
    }

      is_Object3D_proxy = true;

      get hidden() {
return this._hidden;
      }
      set hidden(v) {
this._hidden = v;
if (v) {
  MMD_SA_options.Dungeon.sound.detach_positional_audio(this._parent._obj);
}
      }

      get useQuaternion() {
return this._cache.list[0].useQuaternion;
      }

      get visible() { return false; }
      set visible(v) {
var p = this._parent
var cache = this._cache
var cache0 = cache.list[0]
var obj_source = p._obj
var obj_mesh
cache.init()
if (v) {
  if (!p[this._obj_name].is_Object3D_proxy)
    return

  if (cache.reusable_list.length) {
    this._cache_index = cache.reusable_list.shift()
    obj_mesh = p[this._obj_name] = cache.list[this._cache_index]
//console.log("object cache reused:"+this._cache_index+'/'+cache.list.length+'|'+!cache.is_LOD_far+'/'+!!obj_mesh)
  }
  else {
    this._cache_index = ++cache.index
    obj_mesh = p[this._obj_name] = cache.list[this._cache_index]
    if (!obj_mesh) {
      obj_mesh = p[this._obj_name] = cache.list[this._cache_index] = cache0.clone()

      if (obj_mesh.bones) {
        obj_mesh._mesh_parent = cache0
        if (!cache0._RAF_timestamp_) cache0._RAF_timestamp_ = -1
        obj_mesh.updateMatrixWorld = (function () {
var updateMatrixWorld = obj_mesh._mesh_parent.updateMatrixWorld
return function () {
  updateMatrixWorld.call(this)
  this.boneMatrices.set(this._mesh_parent.boneMatrices)
  if (this.useVertexTexture) {
    this.boneTexture.needsUpdate = true;
  }
};
        })();
      }

      if (!cache.is_LOD_far) {
        MMD_SA.get_bounding_host(obj_mesh).boundingBox_list = MMD_SA.get_bounding_host(cache0).boundingBox_list;
      }

      MMD_SA.THREEX.scene.add(obj_mesh)
    }
  }

  if (!cache.is_LOD_far) {
    p.cache_index = this._cache_index
// .mesh is obsolete. In most cases, just use ._obj instead if you need to get the 3D object
    p._mesh = (obj_mesh.geometry || obj_mesh.isObject3D) ? obj_mesh : obj_mesh.children[0];
    if (p.cache_index == 0)
      MMD_SA_options.Dungeon.object_base_list[p.object_index]._obj.scale = obj_source.scale.x
  }

  obj_mesh.position.copy(obj_source.position)
  obj_mesh.rotation.copy(obj_source.rotation)
  obj_mesh.quaternion.copy(obj_source.quaternion)
  obj_mesh.scale.copy(obj_source.scale)

  if (cache.is_LOD_far)
    obj_mesh.position.add(MMD_SA.TEMP_v3.copy(cache.obj_base.LOD_far.center).multiply(obj_source.scale))

  if (!p.matrixAutoUpdate) {
    obj_mesh.matrixAutoUpdate = false
    obj_mesh.updateMatrix()
  }
}
else {
  if (p[this._obj_name].is_Object3D_proxy) {
//if (this._cache_index != -1) DEBUG_show(this._cache_index,0,1)
    return
  }

  obj_mesh = p[this._obj_name]

  this.position.copy(obj_source.position)
  this.rotation.copy(obj_source.rotation)
  this.quaternion.copy(obj_source.quaternion)
  this.scale.copy(obj_source.scale)

  cache.reusable_list.push(this._cache_index)
  this._cache_index = -1

  p[this._obj_name] = this
  if (!cache.is_LOD_far)
    p._mesh = this
}

obj_mesh.visible = v;
if (!MMD_SA.THREEX.enabled) obj_mesh.children.forEach(function (c) { c.visible = v; });
  }
    }

    var animate_combat_default = function () {
var that = this

var d = MMD_SA_options.Dungeon
var c = d.character
var npc = this._obj
if (!npc.visible)
  return
if (!c.combat_mode || d.event_mode)
  return

var npc_model = THREE.MMD.getModels()[this.character_index]
var npc_motion_para = MMD_SA.motion[npc_model.skin._motion_index].para_SA
var model_para = MMD_SA_options.model_para_obj_all[this.character_index]
if (npc_motion_para.NPC_motion_command_disabled || npc_motion_para.motion_command_disabled) {
//DEBUG_show(Date.now())
  this.motion = null

  if (npc_motion_para.duration_NPC && (npc_model.skin.time > npc_motion_para.duration_NPC)) {
    model_para._motion_name_next = model_para.motion_name_default_combat
  }

  var mov = new THREE.Vector3()
  if (npc_motion_para.mov_speed)
    mov.copy(d._mov_delta(npc_model, npc_motion_para, Math.max(npc_model.skin.time-(this._skin_time_last||0), 0)))
  this._skin_time_last = npc_model.skin.time
//DEBUG_show(mov.toArray().join("\n"))
  var pos_delta = (npc_motion_para.bone_to_position) ? npc._bone_to_position_last.pos_delta : null
  if (pos_delta) {
//DEBUG_show(pos_delta.toArray().join("\n")+'\n'+Date.now())
    mov.add(pos_delta)
  }

  if (npc_motion_para.combat_para) {
//console.log(npc_motion_para)
    d.combat_para_process({ obj:this, mass:this.mass }, npc_motion_para, npc_model.skin.time*30);
  }

  d._mov[this._index] = (mov.x || mov.y || mov.z) ? mov.applyQuaternion(npc.quaternion) : mov

  return
}

if (this.motion && !this.motion.paused)
  return


var motion_prefix = "NPC-" + this.character_index + " "
var pc = THREE.MMD.getModels()[0].mesh
var dis = npc.position.distanceTo(pc.position)

MMD_SA.TEMP_v3.set(0, Math.PI/2 - Math.atan2((pc.position.z-npc.position.z), (pc.position.x-npc.position.x)), 0)
npc.quaternion.setFromEuler(MMD_SA.TEMP_v3)
var rot = new THREE.Vector3().setEulerFromQuaternion(npc.quaternion)

//DEBUG_show(Date.now())
var zm = this.zone_of_movement
var inside_zone = zm.containsPoint(npc.position)
//DEBUG_show(npc.position.toArray()+"/"+inside_zone+'\n'+JSON.stringify(zm))

var action_obj = this.combat.action_check(this)

if (action_obj.type == "STAY") {
  var duration = 0.5 + Math.random()

  this.motion = {
    path: [
      {
  pos: npc.position.clone()
 ,rot: rot
 ,duration: duration
      }
     ,{
  pos: npc.position.clone()
 ,rot: rot
      }
    ]
   ,loop: false
  };
  this.motion = new d.PathMotion(this)
  model_para._motion_name_next = model_para.motion_name_default_combat
}
else if ((action_obj.type == "MOVE") || !inside_zone) {
  var duration = 0.5 + Math.random()
  var mov_scale = duration*10

  var dir
  if (inside_zone) {
    let grid_size = d.grid_size
    let x_npc = ~~(npc.position.x / grid_size)
    let y_npc = ~~(npc.position.z / grid_size)
    let x_pc = ~~(pc.position.x / grid_size)
    let y_pc = ~~(pc.position.z / grid_size)
// space station
let avoid_obstacle// = true
    if (avoid_obstacle && (dis > grid_size*0.5) && ((x_npc != x_pc) || (y_npc != y_pc))) {
      let x_diff = x_pc - x_npc;
      let y_diff = y_pc - y_npc;
      let dir_list = [(Math.abs(x_diff) > Math.abs(y_diff)) ? [((x_diff>0)?1:-1), 0] : [0, ((y_diff>0)?1:-1)]].concat([[0,1],[-1,0],[0,-1,],[1,0]]);

      let d_options = d.RDG_options
      let w = d_options.width
      let h = d_options.height
      let grid = d.grid_array
      let dir_final = dir_list.find(function (xy) {
        var x = x_npc + xy[0]
        var y = y_npc + xy[1]
        return ((x >= 0) && (x < w) && (y >= 0) && (y < h) && (grid[y][x] != 1))
      });

      if (dir_final[0]) {
        let y_center_offset = grid_size*0.5 - (npc.position.z % grid_size)
        if (Math.abs(y_center_offset) > mov_scale)
          dir_final = [0, ((y_center_offset > 0)?1:-1)]
      }
      else {
        let x_center_offset = grid_size*0.5 - (npc.position.x % grid_size)
        if (Math.abs(x_center_offset) > mov_scale)
          dir_final = [((x_center_offset > 0)?1:-1), 0]
      }

      let x_target = (x_npc + dir_final[0]*0.5 + 0.5) * grid_size
      let y_target = (y_npc + dir_final[1]*0.5 + 0.5) * grid_size

MMD_SA.TEMP_v3.set(0, Math.PI/2 - Math.atan2((y_target-npc.position.z), (x_target-npc.position.x)), 0)
npc.quaternion.setFromEuler(MMD_SA.TEMP_v3)
rot.setEulerFromQuaternion(npc.quaternion)

      dir = ["U"]
    }
    else {
      if (dis > 64)
        dir = ["U"]
      else if (dis > 32)
        dir = ["U","L","R"]
      else if (dis < 8)
        dir = ["D","L","R"]
    }
  }
  if (!dir)
    dir = ["U","D","L","R"]

  var dir_letter = dir[random(dir.length)]
  var v3_dir = new THREE.Vector3()
  var motion_name
  switch (dir_letter) {
    case "U":
      v3_dir.set( 0, 0, 1)
      motion_name = motion_prefix + "combat movement forward"
      break
    case "D":
      v3_dir.set( 0, 0,-1)
      motion_name = motion_prefix + "combat movement backward"
      break
    case "L":
      v3_dir.set(-1, 0, 0)
      motion_name = motion_prefix + "combat movement left"
      break
    case "R":
      v3_dir.set( 1, 0, 0)
      motion_name = motion_prefix + "combat movement right"
      break
  }

  var end_pt = npc.position.clone().add(v3_dir.multiplyScalar(mov_scale).applyQuaternion(npc.quaternion));

  ["x","z"].forEach(function (p) {
    if (end_pt[p] < zm.min[p])
      end_pt[p] = zm.min[p]
    else if (end_pt[p] > zm.max[p])
      end_pt[p] = zm.max[p]
  });
//DEBUG_show(end_pt.toArray())
  this.motion = {
    path: [
      {
  pos: npc.position.clone()
 ,rot: rot
 ,duration: duration
      }
     ,{
  pos: end_pt.clone()
 ,rot: rot
      }
    ]
   ,loop: false
   ,check_collision: true
  };
  this.motion = new d.PathMotion(this)
  model_para._motion_name_next = d.motion[motion_name].name
//DEBUG_show(motion_name+'/'+Date.now())
}
else {
  var motion_id = action_obj.motion_id
  model_para._motion_name_next = d.motion[motion_id].name
}
    };

    var hp_add = function (num) {
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
    };

    var id_for_save = ["map_grid_drawn", "event_flag"]

    return function (area_id, refresh_state) {
if (!refresh_state)
  refresh_state = 0

this.character.dismount()

var that = this

// options default START
var options_base  = MMD_SA_options.Dungeon_options
var options_start = MMD_SA_options.Dungeon_options.options_by_area_id["start"]
var options

if (this.area_id) {
// unload
  options = MMD_SA_options.Dungeon_options.options_by_area_id[this.area_id]
  if (options.event_listener) {
    for (var event_id in options.event_listener) {
      var e = options.event_listener[event_id]
      var target = e.target || window
      target.removeEventListener(event_id, e.func)
    }
  }
  if (this.ceil_material_index_default != -1) {
    var ceil = this.grid_material_list[this.ceil_material_index_default].lvl[0].list[1]
    if (ceil)
      ceil.visible = false
  }
  // save current area data
  for (var index in options._saved.object_by_index) {
    var saved = options._saved.object_by_index[index]
    var obj = this.object_list[index]
    for (var p in saved) {
      if (p == "position") {
        saved.position.data = obj._obj.position.clone()
      }
      if (p == "rotation") {
        saved.rotation.data = obj._obj[(obj._obj.useQuaternion)?"quaternion":"rotation"].clone()
      }
    }
  }

// refresh state
  if (refresh_state == 0) {
// total refresh
    for (var id in MMD_SA_options.Dungeon_options.options_by_area_id) {
      var area_options = MMD_SA_options.Dungeon_options.options_by_area_id[id]
      area_options._random_seed = null
    }
  }
  if (refresh_state <= 1) {
// clear saved
    for (var id in MMD_SA_options.Dungeon_options.options_by_area_id) {
      var area_options = MMD_SA_options.Dungeon_options.options_by_area_id[id]
      area_options._saved = new MMD_SA_options.Dungeon._AreaDataSaved()
    }
  }
  else {
// save stuff
    id_for_save.forEach(function (id) {
      options._saved[id] = that[id]
    });
  }
console.log("RESTART - state:" + refresh_state)
}

if (refresh_state <= 1) {
  Object.assign(this.key_map, this.key_map_default)
  this.key_map_reset()
}

if (!this.area_id)
  area_id = "start"

if (area_id)
  this.area_id = area_id

options = MMD_SA_options.Dungeon_options.options_by_area_id[this.area_id]

if (!options._random_seed) {
  options._random_seed = this.generate_seed()
}
MT = new MersenneTwister(options._random_seed)

if (options.event_listener) {
  for (var event_id in options.event_listener) {
    var e = options.event_listener[event_id]
    var target = e.target || window
    target.addEventListener(event_id, e.func)
  }
}

this.RDG_options = options.RDG_options || {
  width: 50,
  height: 50,
  minRoomSize: 5,
  maxRoomSize: 20
};

this.no_camera_collision = options.no_camera_collision
this.camera_y_default_non_negative = (options.camera_y_default_non_negative !== false)

this.para_by_grid_id = (options.para_by_grid_id && Object.clone(options.para_by_grid_id)) || {};
this.para_by_xy = (options.para_by_xy && Object.clone(options.para_by_xy)) || {};
this.para_by_map = options.para_by_map && Object.clone(options.para_by_map)
/*
for (var p in this.para_by_grid_id)
  this.para_by_grid_id[p].id = "grid_id-" + p
for (var p in this.para_by_xy)
  this.para_by_grid_id[p].id = "xy-" + p
if (this.para_by_map)
  this.para_by_map.id = "map"
*/
this.ceil_material_index_default  = (options.ceil_material_index_default != null)  ? options.ceil_material_index_default  : 0;
this.floor_material_index_default = (options.floor_material_index_default != null) ? options.floor_material_index_default : 1;
this.wall_material_index_default  = (options.wall_material_index_default != null)  ? options.wall_material_index_default  : 2;


var d_options = this.RDG_options
var grid_array = this.grid_array = (this.RDG_options.grid_array && this.RDG_options.grid_array.map(function (x) { return x.slice() })) || this.RDG.NewDungeon(d_options);
//console.log(this.grid_array)


this.grid_size   = options.grid_size   || options_start.grid_size   || 64;
this.view_radius = options.view_radius || options_start.view_radius || 8;

this.ceil_height = options.ceil_height || this.grid_size;

MMD_SA_options.trackball_camera_limit.max.length = this.grid_size * 3

this.grid_material_list.forEach(function (m, idx) {
  var x, y
  if (m.repeat_base) {
    x = that.grid_size / m.repeat_base[0]
    y = that.grid_size / m.repeat_base[1]
  }
  else {
    x = y = 1
  }
// save tons of headaches by using material.repeat hack
  m.lvl.forEach(function (m2) {
    var mtl = m2.list[0].material//jThree("#DungeonPlane" + idx + "MTL").three(0)//
    if (MMD_SA.THREEX.enabled) {
      mtl.map.repeat.set(x,y);
    }
    else {
      mtl.offset = mtl.map.offset.clone()
      mtl.repeat = mtl.map.repeat.clone().set(x,y)
    }
  });
});

/*
var DG = require("dungeon-generator")
let _dungeon = new DG(
{
    "size": [100, 100],
    "rooms": {
        "initial": {
            "min_size": [3, 3],
            "max_size": [3, 3],
            "max_exits": 1
        },
        "any": {
            "min_size": [3, 3],
            "max_size": [20, 20],
            "max_exits": 4
        }
    },
    "max_corridor_length": 6,
    "min_corridor_length": 2,
    "corridor_density": 0.5,
    "symmetric_rooms": false,
    "interconnects": 1,
    "max_interconnect_length": 10,
    "room_count": 50
}
);
_dungeon.generate()
console.log(_dungeon)
*/

this.room_max_default = 0
for (var y = 0, y_max = d_options.height; y < y_max; y++) {
  for (var x = 0, x_max = d_options.width; x < x_max; x++) {
    this.room_max_default = Math.max(this.room_max_default, grid_array[y][x])
  }
}

this.grid_by_index = []
this.room_info = []
if (this.para_by_grid_id[1] && this.para_by_grid_id[1].hidden_on_map) {
  var para_new_room = this.para_by_grid_id[this.room_max_default]
  if (!para_new_room) {
    para_new_room = this.para_by_grid_id[this.room_max_default] = Object.clone(this.para_by_grid_id[1])
  }
  this.grid_by_index[1] = []
  this.room_info[1] = { x_min:999, x_max:-1, y_min:999, y_max:-1 }
}

this.map_grid_drawn = []
this.grid_array_free = []
var map_str = ""
for (var y = 0, y_max = d_options.height; y < y_max; y++) {
  this.map_grid_drawn[y] = []
  this.grid_array_free[y] = []
  for (var x = 0, x_max = d_options.width; x < x_max; x++) {
    this.grid_array_free[y][x] = true

    var para = this.get_para(x,y)
    if ((grid_array[y][x] == 1) && para.hidden_on_map) {
      grid_array[y][x] = this.room_max_default
    }
    para.grid_setup && para.grid_setup(x,y)
    var index = grid_array[y][x]

    if (!this.grid_by_index[index]) {
      this.grid_by_index[index] = []
      this.room_info[index] = { x_min:999, x_max:-1, y_min:999, y_max:-1 }
    }
    this.grid_by_index[index].push([x,y])
    var room = this.room_info[index]
    room.x_min = Math.min(room.x_min, x)
    room.y_min = Math.min(room.y_min, y)
    room.x_max = Math.max(room.x_max, x)
    room.y_max = Math.max(room.y_max, y)
    map_str += (index < 10) ? index : String.fromCharCode(65+(index-10))
  }
  map_str += "\n"
}

if (options._saved.map_grid_drawn) {
  this.map_grid_drawn = options._saved.map_grid_drawn
}

for (var id in this.para_by_grid_id) {
  if (/^room_max_default([\+\-])(\d+)$/.test(id))
    this.para_by_grid_id[this.room_max_default + ((RegExp.$1=="+")?1:-1) * parseInt(RegExp.$2)] = this.para_by_grid_id[id]
}

console.log(map_str)

for (var index in this.room_info) {
  var room = this.room_info[index]
  room.width  = (room.x_max - room.x_min) + 1
  room.height = (room.y_max - room.y_min) + 1
}

for (var id in this.para_by_grid_id) {
  if (/^\d+$/.test(id)) {
    let para = this.para_by_grid_id[id]
    if (para.para_by_xy) {
      let room = this.room_info[id]
      para.para_by_xy.forEach(function (para_xy) {
        let x = ~~(Math.min(para_xy.x, 0.9999) * room.width)  + room.x_min
        let y = ~~(Math.min(para_xy.y, 0.9999) * room.height) + room.y_min
        that.para_by_xy[x+"x"+y] = Object.assign(that.para_by_xy[x+"x"+y]||{}, para_xy.para)
//console.log(x,y, para_xy, that.para_by_xy[x+"x"+y])
      });
    }
  }
}

this.grid_by_index_free = []
this.grid_by_index.forEach(function (g) {
  that.grid_by_index_free.push(g.slice())
});

// ensure proper map redraw
this.map_display_scale = 0

MMD_SA_options.trackball_camera_limit.max.length = this.grid_size * 3 * (options.camera_limit_scale||1)


window.dispatchEvent(new CustomEvent("SA_Dungeon_after_map_generation", { detail:{ refresh_state:refresh_state, options:options } }));


this.PC_light_max = Math.min((options.PC_light_max || options_base.PC_light_max || 3), MMD_SA.light_list.length)

MMD_SA_options.ambient_light_color = options.ambient_light_color || MMD_SA_options.ambient_light_color;
jThree("#MMD_AmbLight").three(0).color = new THREE.Color(MMD_SA_options.ambient_light_color);

var dir_light = jThree("#MMD_DirLight").three(0)
MMD_SA_options.light_color = options.light_color || MMD_SA_options.light_color;
dir_light.color = new THREE.Color(MMD_SA_options.light_color);
MMD_SA_options.light_position = options.light_position || options_base.light_position || MMD_SA_options._light_position
dir_light.position.fromArray(MMD_SA_options.light_position)
MMD_SA.light_list.find(function (light) { return (light.obj == dir_light); })._pos_base = null

var point_light = jThree("#pointlight_main").three(0)
if (point_light) {
  point_light.intensity = (options.point_light && options.point_light.intensity) || 1
  point_light.color = new THREE.Color((options.point_light && options.point_light.color) || "#ffffff")
  point_light.distance = (options.point_light && options.point_light.distance) || this.grid_size*2
  point_light.position.copy((options.point_light && options.point_light.position) || { x:0, y:this.grid_size*0.5, z:0 })
}

this._event_active = {}
this.event_flag = {}
// not cloning events for now, saving some headaches for getters/setters
this.events = options.events||{}//(options.events && Object.clone(options.events)) || {}
Object.assign(this.events, MMD_SA_options.Dungeon.events_default, options_base.events_default||{})

if (options.object_list && !options._object_list_initialized) {
  options._object_list_initialized = true
  options.object_list = options.object_list.map(function (obj) { return ((obj._constructor && obj._constructor()) || obj); });
}
this.object_list = (options.object_list && Object.clone(options.object_list)) || []
//console.log(options.object_list)
// options default END

var fog = this.fog = options.fog || MMD_SA_options.fog
if (fog) {
// update the old THREE scene fog (THREEX version will copy it)
  const scene = MMD_SA.scene;

  if (scene.fog instanceof THREE.Fog) {
    scene.fog.near = fog.near || this.grid_size * this.view_radius * (fog.near_ratio||0.5)
    scene.fog.far  = fog.far  || this.grid_size * this.view_radius * (fog.far_ratio ||0.9)
  }

  scene.fog.color = new THREE.Color(fog.color||"#000")
  if (use_MatrixRain && MMD_SA.matrix_rain.greenness) {
    let gray = 0.3 * scene.fog.color.r + 0.59 * scene.fog.color.g + 0.11 * scene.fog.color.b;
    scene.fog.color.setRGB(scene.fog.color.r*(1-MMD_SA.matrix_rain.greenness), gray*MMD_SA.matrix_rain.greenness + scene.fog.color.g*(1-MMD_SA.matrix_rain.greenness), scene.fog.color.b*(1-MMD_SA.matrix_rain.greenness));
  }
console.log("Fog:"+ ((scene.fog instanceof THREE.Fog) ? scene.fog.near+'/'+scene.fog.far : 'EXP2') +'/'+scene.fog.color.getHexString())

  this.object_base_list.forEach(function (obj) {
    if (obj.is_dummy) return

    if (obj.cache_LOD_far.list.length)
      obj.cache_LOD_far.list[0].material.color.copy(scene.fog.color)
  });
}

if (options_base.skydome) {
  let dome_obj = MMD_SA_options.mesh_obj_by_id["DomeMESH"]
  if (options.skydome) {
    dome_obj.scale = MMD_SA._trackball_camera.object.far*0.5/(64*4)//(this.grid_size * (this.view_radius * 4)) / (64*4)
    this.ceil_material_index_default = options.ceil_material_index_default = -1
    if (use_MatrixRain) {
      dome_obj._obj._uniTexture_fadeout = 0.5 + ((options.skydome.fog && options.skydome.fog.height)||0.025);
      dome_obj._obj._uniTexture_scale = 10
    }

    if (!options.skydome.texture_setup)
      options.skydome.texture_setup = options_base.skydome.texture_setup

    if (options.skydome.visible !== false) {
      dome_obj._obj.visible = true
      options.skydome.texture_setup()
    }
    else {
      dome_obj._obj.visible = false
    }
  }
  else {
    dome_obj._obj.visible = false
  }
}
  
if (this.ceil_material_index_default != -1) {
  const THREE = MMD_SA.THREEX.THREE;

  var p = this.grid_material_list
  var ceil = p[this.ceil_material_index_default].lvl[0].list[1]
  if (ceil) {
    ceil.visible = true
  }
  else {
    var w = this.RDG_options.width
    var h = this.RDG_options.height
    var grid_size = this.grid_size

// disable hiding when updaing dungeon blocks
    p[this.ceil_material_index_default].disabled = true

    var ceil0 = p[this.ceil_material_index_default].lvl[0].list[0]//MMD_SA_options.mesh_obj_by_id['DungeonPlane'+this.ceil_material_index_default+'MESH_LV'+0]._obj
    var ceil  = p[this.ceil_material_index_default].lvl[0].list[1] = ceil0.clone(new THREE.Mesh(ceil0.geometry, ceil0.material.clone()));
    if (MMD_SA.THREEX.enabled) {
      ceil.material.map.repeat.set(w,h);
    }
    else {
      ceil.material.offset = ceil.material.map.offset.clone();
      ceil.material.repeat = ceil.material.map.repeat.clone().set(w,h);
    }
/*
    ["map", "normalMap", "displacementMap"].forEach(function (tex) {
      texture = ceil.material[tex]
      if (texture) {
        texture.repeat.x = w
        texture.repeat.y = h
      }
    });
*/
    ceil.position.set(w*grid_size*0.5, this.ceil_height, h*grid_size*0.5)
//    ceil.rotation.x = Math.PI/2
    ceil.quaternion.set(Math.sin((Math.PI/2)/2),0,0,Math.cos((Math.PI/2)/2))
    ceil.scale.set(w*grid_size, h*grid_size, 1)
    MMD_SA.THREEX.scene.add(ceil)
    ceil.visible = true
//    console.log(ceil)

    var obj = this.grid_blocks.objs[this.grid_blocks.objs.length-1]._obj
    var geo = obj.geometry
    obj.position.copy(ceil.position)
    geo.boundingBox.set(MMD_SA._v3a.set(-w*grid_size*0.5, 0, -h*grid_size*0.5), MMD_SA._v3b.set(w*grid_size*0.5, 999, h*grid_size*0.5))
// it will be updated in .check_collision() as a boundingSphere-hit object
//      obj.updateMatrixWorld()
  }
}


if (options._saved.event_flag) {
  this.event_flag = options._saved.event_flag
}
else {
  for (var event_id in this.events) {
    this.event_flag[event_id] = 0
  }
}

this.grid_material_list.forEach(function (p_obj) {
  p_obj.reset()
});

this.object_base_list.forEach(function (obj, idx) {
  if (obj.is_dummy) return

  obj.cache.reset()
  obj.cache_LOD_far.reset()
  obj.object_list = []
});

var d = this

var _object_list = this.object_list.map(function (obj) { return [obj] });

if (MMD_SA_options.Dungeon_options.multiplayer) {
  for (var i = 0, i_max = MMD_SA_options.Dungeon_options.multiplayer.OPC_list.length; i < i_max; i++) {
    _object_list.push([{ object_id:"OPC-"+i }]);
  }
}

var _object_list_child = []
d.object_base_list.forEach(function (obj_base, obj_index) {
  if (obj_base.parent_object_list && !_object_list.some((obj)=>(obj_index==obj[0].object_index)||(obj_base.id && obj_base.id==obj[0].object_id))) {
    obj_base.parent_object_list.some(function (p) {
      if (p != "PC") {
        let p_index, p_id;
        if (typeof p == 'string') {
          p_id = p
          p_index = d.object_base_index_by_id[p_id]
        }
        else {
          p_index = p
          let p_obj = d.object_base_list[p_index]
          p_id = p_obj.id
        }
        if (!_object_list.some((obj)=>(p_index==obj[0].object_index)||(p_id && p_id==obj[0].object_id)))
          return false
      }

      _object_list_child.push([{object_index:obj_index}])
      return true
    });
  }
});
_object_list = _object_list.concat(_object_list_child)
//console.log(_object_list.slice())

_object_list.forEach(function (obj_list, i) {
  var obj = obj_list[0]
  var obj_index = obj.object_index = (obj.object_id) ? d.object_base_index_by_id[obj.object_id] : obj.object_index
  var obj_base  = d.object_base_list[obj_index]

  var placement = obj.placement || obj_base.placement || {}
  var clone_list = placement.grid_id_filter && placement.grid_id_filter(_object_list, i)
  if (clone_list) {
    clone_list.forEach(function (para, idx) {
      var clone = Object.clone(obj)
      clone._clone_index = idx
      if (!clone.placement)
        clone.placement = Object.clone(placement)
      clone.placement.grid_id = para.grid_id
      if (para.para) {
        for (var name in para.para) {
          if (name == "placement") {
            for (var p_name in para.para.placement) {
              clone.placement[p_name] = para.para.placement[p_name]
//console.log(clone.placement[p_name])
            }
          }
          else {
            clone[name] = para.para[name]
          }
        }
      }
//console.log(clone)
      obj_list[idx] = clone
    });
  }
});

this.object_list = []
_object_list.forEach(function (obj_list) {
  obj_list.forEach(function (obj) {
    d.object_list.push(obj)
  });
});


this.accessory_list = []
this.object_id_translated = {}

this.object_id_translated[(MMD_SA_options.model_para_obj.character && MMD_SA_options.model_para_obj.character.name) || 'PC'] = 'PC';

this.object_list.forEach(function (obj, idx) {
  obj._index = idx
  var obj_index = obj.object_index
  var obj_base  = d.object_base_list[obj_index]
  if (obj_base.is_dummy) {
    obj.is_dummy = true
    return
  }

  var id = "object" + obj_index + "_" + obj_base.object_list.length
  if (!obj.id && obj_base.id && (obj_base.object_list.length == 0))
    obj.id = obj_base.id
  if (obj.id) {
    that.object_id_translated[obj.id] = id
  }
  else {
    obj.id = id
  }
  obj_base.object_list.push(obj)

  obj.path = obj_base.path
  obj.character_index = obj_base.character_index

  if (obj.character_index) {
    const c = MMD_SA_options.model_para_obj_all[obj.character_index].character;
    if (c && c.name)
      that.object_id_translated[c.name] = id;
  }

  if (obj._clone_index == null)
    obj._clone_index = -1

  obj.is_OPC = obj_base.is_OPC

  var obj_mesh, obj_LOD_far_mesh
  obj_mesh = obj._obj = obj._mesh = obj._obj_proxy = new Object3D_proxy(obj, obj_base.cache)
  if (obj_base.LOD_far)
    obj_LOD_far_mesh = obj._obj_LOD_far = obj._obj_LOD_far_proxy = new Object3D_proxy(obj, obj_base.cache_LOD_far)

  var placement = obj.placement = obj.placement || (obj_base.placement && Object.clone(obj_base.placement)) || {}
  if (!placement.position)
    placement.position = {x:0,y:0,z:0}

  obj_mesh.scale.x = obj_mesh.scale.y = obj_mesh.scale.z = obj.placement.scale = obj_base._obj.scale = placement.scale || ((obj_base.path) ? 10 : 1)

//console.log(obj_mesh)

  obj.view_distance = obj_base.view_distance || obj.view_distance || 1
  obj.view_distance_sq = obj.view_distance * obj.view_distance

  var pos = [0,0]
  var grid_occupied = placement.grid_occupied
  if ((placement.setup && placement.setup(obj)) || placement.grid_pos_absolute) {
    pos = placement.grid_pos_absolute.slice()
  }
  else if (placement.grid_id != null) {
    if (placement.grid_xy) {
      var room = d.room_info[placement.grid_id]
      pos[0] = ~~(Math.min(placement.grid_xy[0], 0.9999) * room.width)  + room.x_min
      pos[1] = ~~(Math.min(placement.grid_xy[1], 0.9999) * room.height) + room.y_min
    }
    else {
      d._object_active_ = obj
      var grid_list = d.grid_by_index_free[placement.grid_id]
      if (placement.grid_filter) {
        grid_list = d.grid_by_index_free[placement.grid_id].filter(placement.grid_filter).shuffleMT()
      }
      if (placement.grid_sort) {
        grid_list.sort(placement.grid_sort)
      }
      if (!grid_list.length) {
        console.error("object index:" + obj_index + " / gird sorting failed")
        grid_list = d.grid_by_index_free[placement.grid_id]
      }
      pos = grid_list[Math.floor(MT.random()*grid_list.length)].slice()
    }
    placement.grid_pos_absolute = pos.slice()
    if (!grid_occupied && !placement.can_overlap)
      grid_occupied = [[0,0]]
  }
  else {
    placement.grid_pos_absolute = [0,0]
  }

  placement.onposition && placement.onposition(obj)

  var rot
  if (placement.rotation) {
    rot = {}
    rot.x = placement.rotation.x
    rot.y = placement.rotation.y
    rot.z = placement.rotation.z
    for (var dir in rot) {
      if (rot[dir] == null)
        rot[dir] = MT.random()*360
    }
    obj_mesh.rotation.copy(rot).multiplyScalar(Math.PI/180)
    obj_mesh.quaternion.setFromEuler(obj_mesh.rotation)
  }
  else {
// always reset clone rotation
    obj_mesh.rotation.set(0,0,0)
    obj_mesh.quaternion.set(0,0,0,1)
  }

  if (grid_occupied) {
    if (rot) {
      var rot_q = MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.copy(rot).multiplyScalar(Math.PI/180))
      grid_occupied = grid_occupied.map(function (xy) {
        if (xy[0] || xy[1]) {
          MMD_SA.TEMP_v3.set(xy[0], 0, xy[1]).applyQuaternion(rot_q)
          return [Math.round(MMD_SA.TEMP_v3.x), Math.round(MMD_SA.TEMP_v3.z)]
        }
        return xy
      });
    }

//var _i = d.grid_by_index_free[placement.grid_id].length
    var x = pos[0]
    var y = pos[1]
    d.grid_by_index_free[placement.grid_id] = d.grid_by_index_free[placement.grid_id].filter(function (xy) {
var occupied = grid_occupied.some(function (xy_mod) {
//if (grid_occupied.length>1 && !i0 && !i1) console.log(xy.join(",")+'/'+xy_mod.join(",")+'/'+x+','+y)
  var hit = ((xy[0] == x+xy_mod[0]) && (xy[1] == y+xy_mod[1]))
  if (hit)
    d.grid_array_free[xy[1]][xy[0]] = false
  return hit
});
return !occupied
    });
//if (grid_occupied.length>1) console.log(_i-d.grid_by_index_free[placement.grid_id].length)
  }

  obj._grid_xy = pos.slice()
  obj._zone_of_movement = obj.zone_of_movement || obj_base.zone_of_movement
  if (obj._zone_of_movement) {
    if (obj.zone_of_movement.min.y == obj.zone_of_movement.max.y) {
      obj.zone_of_movement.min.y -= 10
      obj.zone_of_movement.max.y += 10
    }
    obj.zone_of_movement = new THREE.Box3().copy(obj._zone_of_movement).translate(MMD_SA.TEMP_v3.set((pos[0]+0.5)*d.grid_size, 0, (pos[1]+0.5)*d.grid_size))
  }

  pos[0] *= d.grid_size
  pos[1] *= d.grid_size
  obj_mesh.position.set(pos[0],0,pos[1]).add(MMD_SA.TEMP_v3.set(d.grid_size/2+placement.position.x, placement.position.y, d.grid_size/2+placement.position.z))
  obj_mesh.position.y += (placement.grounded) ? d.get_ground_y(obj_mesh.position) : Math.max(d.get_para(~~pos[0],~~pos[1],true).ground_y||0, 0)

  if (placement.hidden) {
    obj_mesh.hidden = true
  }

  if (!obj.onclick)
    obj.onclick = obj_base.onclick && Object.clone(obj_base.onclick)
  if (obj.onclick) {
    obj.onclick.forEach(function (e) {
      var _clone_index = (e.clone_event_by_index) ? obj_base.object_list.length-1 : obj._clone_index
      if (_clone_index == -1)
        return

      if (e.event_id) {
        if (typeof e.event_id == 'string') {
          e.event_id += "_" + _clone_index
        }
        else {
          for (var bb_index in e.event_id)
            e.event_id[bb_index] += "_" + _clone_index
        }
      }
    });
  }

  obj.use_PC_ground_normal_when_following = obj_base.use_PC_ground_normal_when_following
  if (obj.mass == null)
    obj.mass = obj_base.mass

  if (obj.hp == null)
    obj.hp = obj_base.hp
  if (obj.hp_max == null)
    obj.hp_max = obj_base.hp_max
  if (obj.hp) {
    if (!obj.hp_max)
      obj.hp_max = obj.hp
  }
  else {
    obj.hp = obj.hp_max
  }
  if (obj.hp) {
    obj.combat_stats = new MMD_SA_options.Dungeon._CombatStats(Object.assign({}, obj_base.combat_stats, obj.combat_stats))
    obj.hp_add = hp_add
  }

  if (obj.no_collision == null)
    obj.no_collision = obj_base.no_collision
  if (obj.no_camera_collision == null)
    obj.no_camera_collision = obj_base.no_camera_collision
  obj.collision_by_mesh = obj_base.collision_by_mesh
  obj.collision_by_mesh_material_index_max = obj_base.collision_by_mesh_material_index_max
  obj.collision_by_mesh_enforced = obj_base.collision_by_mesh_enforced
  obj.collision_by_mesh_face_grounded = obj_base.collision_by_mesh_face_grounded
  obj.collision_by_mesh_sort_range = obj_base.collision_by_mesh_sort_range
  obj.collision_by_mesh_drop_limit = obj_base.collision_by_mesh_drop_limit
  obj.collision_by_mesh_ground_limit = obj_base.collision_by_mesh_ground_limit
  if (obj.collision_by_mesh_sort_range) {
//    obj.collision_by_mesh_sort_range /= placement.scale
    obj.mesh_sorted_list = {}
    obj.mesh_sorted = null//{ position:null, index_list:null }
  }

// this seems to fix a glitch when collision detection is done on the top-most point of the boundingBox, which may override mesh collision
  if (obj.collision_by_mesh) {
    const bb_host = MMD_SA.get_bounding_host(obj_base.cache.list[0]);
    if (!bb_host._boundingBox) bb_host._boundingBox = bb_host.boundingBox.clone();
    bb_host.boundingBox.max.y = bb_host._boundingBox.max.y + 1;
  }

  obj.oncreate = obj.oncreate || obj_base.oncreate
  obj.oncreate && obj.oncreate()

  obj.oncollisioncheck = obj.oncollisioncheck || obj_base.oncollisioncheck

  obj.motion = obj.motion || obj_base.motion
  if (obj.motion)
    obj.motion = new d.PathMotion(obj)

  obj.animate = obj.animate || obj_base.animate
  if (obj.animate && (typeof obj.animate == "string") && (obj.animate == "combat_default"))
    obj.animate = animate_combat_default

  if (obj.combat == null)
    obj.combat = obj_base.combat && Object.clone(obj_base.combat)

  obj.matrixAutoUpdate = !!(obj.matrixAutoUpdate || obj_base.matrixAutoUpdate || (obj.character_index != null) || obj.motion || obj.animate)

  if (obj.parent_bone) {
    d.accessory_list.push(obj)
  }

  obj.user_data = obj.user_data || (obj_base.user_data && Object.clone(obj_base.user_data)) || {}

  obj.data_to_save = obj.data_to_save || obj_base.data_to_save
  if (obj.data_to_save) {
    var saved = options._saved.object_by_index
    saved = saved[idx] = saved[idx] || {}
    for (var p in obj.data_to_save) {
      if (!saved[p])
        saved[p] = {}
    }
  }
});

this.object_list_click = this.object_list.filter(obj => obj.onclick);

//console.log(this.accessory_list)

for (var index in options._saved.object_by_index) {
  var para = options._saved.object_by_index[index]
  var obj = this.object_list[index]
  if (para.position && para.position.data)
    obj._obj.position.copy(para.position.data)
  if (para.rotation && para.rotation.data) {
    obj._obj[(obj._obj.useQuaternion)?"quaternion":"rotation"].copy(para.rotation.data)
  }
}


window.dispatchEvent(new CustomEvent("SA_Dungeon_after_object_placement"));


if (options.sound) {
  options.sound.forEach(function (sound) {
    d.sound.load(sound)
  });
}

d.check_points = options.check_points || []
d.check_points.forEach(function (cp) {
  cp.range.forEach(function (r) {
    r._entered = false
  });
});
// clear temporary check points
d._check_points = null

this._states = {}
this.inventory.reset()

var pos = options._saved.starting_position || options.starting_position
var rot = options._saved.starting_rotation || options.starting_rotation
if (!pos) {
  pos = new THREE.Vector3()
  if (options.starting_position_full) {
    let xy = null
    if (options.starting_position_full.grid_id)
      xy = this.grid_by_index[options.starting_position_full.grid_id][0]
    else if (options.starting_position_full.grid_xy)
      xy = options.starting_position_full.grid_xy
    if (xy) {
      let ground_y = d.get_para(xy[0],xy[1],true).ground_y||0
      if (!options.starting_position_full.grounded)
        ground_y = Math.max(ground_y, 0)
      pos.set((xy[0]+0.5)*this.grid_size, ground_y, (xy[1]+0.5)*this.grid_size)
    }

    if (options.starting_position_full.position)
      pos.add(options.starting_position_full.position)

    if (options.starting_position_full.rotation)
      rot = options.starting_position_full.rotation
  }
  else {
    let x = this.grid_by_index[2][0][0]
    let y = this.grid_by_index[2][0][1]
    pos = pos.set((x+0.5)*this.grid_size, Math.max(d.get_para(x,y,true).ground_y||0, 0), (y+0.5)*this.grid_size)
  }
}

var c = this.character
Object.assign(c, options.character||options_base.character||{})
c.reset()
c.swap_character()

c.pos.copy(pos)
if (!rot && (MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR)) {
//  c.TPS_mode = true
}
if (rot) {
  c.TPS_mode = true
  c.pos_update()

  rot = new THREE.Vector3().copy(rot).multiplyScalar(Math.PI/180)
  c.rot.add(rot)
  THREE.MMD.getModels()[0].mesh.quaternion.multiply(MMD_SA.TEMP_q.setFromEuler(rot))
}
else
  c.pos_update()

THREE.MMD.getModels()[0].resetMotion()
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
//console.log(MMD_SA_options.motion_shuffle_list_default)
this.shadow_camera_width = options.shadow_camera_width || options_base.shadow_camera_width || 64*4
this.update_shadow_para()

//console.log(d.object_base_list.filter(function (obj_base) { return obj_base.cache.reusable_list.some(function (idx) { return obj_base.cache.list[idx].visible; }); }))


window.dispatchEvent(new CustomEvent("SA_Dungeon_onrestart"));
this.update_dungeon_blocks()


//console.log(d.object_base_list.filter(function (obj_base) { return obj_base.cache.reusable_list.some(function (idx) { return obj_base.cache.list[idx].visible; }); }))
//d.object_base_list.forEach(function (obj_base) { if (obj_base.is_dummy) return; obj_base.cache.reusable_list.forEach(function (idx) { obj_base.cache.list[idx].visible=false; }); })
//console.log(d.object_base_list)

MMD_SA.reset_camera()
//MMD_SA._trackball_camera.SA_adjust()


// avoid some issues by running this after a few frame skips
var frame_to_skip = 2
if (MMD_SA_options.model_para_obj._icon_canvas) {
/*
// drawn in c.swap_character() already
  MMD_SA_options.Dungeon.character.icon.getContext("2d").drawImage(MMD_SA_options.model_para_obj._icon_canvas, 0,0)
  MMD_SA_options.Dungeon.update_status_bar(true)
*/
}
else if (MMD_SA.THREEX.enabled && (MMD_SA.THREEX.get_model(0).type == 'VRM') && ((MMD_SA.THREEX.get_model(0).is_VRM1) ? MMD_SA.THREEX.get_model(0).model.meta.thumbnailImage : MMD_SA.THREEX.get_model(0).model.meta.texture)) {
  const model = MMD_SA.THREEX.get_model(0);
  const para_SAX = model.model_para;
  const para_SA = MMD_SA_options.model_para_obj;

  const canvas = MMD_SA_options.Dungeon.character.icon;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage((model.is_VRM1)?model.model.meta.thumbnailImage:model.model.meta.texture.source.data, 0,0,64,64);

  const icon_canvas = para_SA._icon_canvas = para_SAX._icon_canvas = document.createElement("canvas");
  icon_canvas.width = icon_canvas.height = 64;
  icon_canvas.getContext("2d").drawImage(canvas, 0,0);

  MMD_SA_options.Dungeon.update_status_bar(true);
}
else {
//  SL_Host.style.visibility = "hidden"

  let dir_light = jThree("#MMD_DirLight").three(0)
  let _dir_light_pos = dir_light.position.clone()

  let _look_at_screen = MMD_SA_options._look_at_screen
  let _look_at_mouse  = MMD_SA_options._look_at_mouse

  MMD_SA_options.look_at_screen = MMD_SA_options.look_at_mouse = false

  System._browser.on_animation_update.add(function () {
jThree("#MMD_AmbLight").three(0).color = new THREE.Color("#FFF")

dir_light.color = new THREE.Color('#606060')
dir_light.position.set(1,1,1).multiplyScalar(MMD_SA_options.light_position_scale).add(c.pos)

var point_light = jThree("#pointlight_main").three(0)
if (point_light) {
  point_light.color = new THREE.Color("#000")
}

var mesh = THREE.MMD.getModels()[0].mesh
mesh.geometry.boundingBox.expandByScalar(20)
mesh.geometry.boundingSphere.radius += 20

// .get_bone_position_by_MMD_name() not working (bone.matrixWorld not updated with mesh position yet?)
var head_pos_absolute = MMD_SA.get_bone_position(0, "頭");//MMD_SA.THREEX.get_model(0).get_bone_position_by_MMD_name("頭");//
var head_pos = MMD_SA._v3a.copy(head_pos_absolute).sub(mesh.position);
//DEBUG_show(head_pos.toArray())

var camera_obj = MMD_SA._trackball_camera.object
camera_obj.position.set(head_pos_absolute.x, head_pos_absolute.y-0.25, head_pos_absolute.z+4+12);
//camera_obj.up.set(0, 1, 0);
//console.log(head_pos)
camera_obj.lookAt(MMD_SA.TEMP_v3.set(head_pos_absolute.x, head_pos_absolute.y-0.25+1, head_pos_absolute.z));
  }, (frame_to_skip-1), 0);

  System._browser.on_animation_update.add(function () {
const SL = MMD_SA.THREEX.SL;
var d_min = Math.min(SL.width, SL.height) * 0.2
var canvas = MMD_SA_options.Dungeon.character.icon
var ctx = canvas.getContext("2d")
ctx.imageSmoothingQuality = "high"
ctx.drawImage(SL, (SL.width-d_min)/2,(SL.height-d_min)/2,d_min,d_min, 0,0,canvas.width,canvas.height);

// sharpen
//https://gist.github.com/mikecao/65d9fc92dc7197cb8a7c
(function () {
  var w = canvas.width
  var h = canvas.height
  var mix = 0.2//0.4

    var x, sx, sy, r, g, b, a, dstOff, srcOff, wt, cx, cy, scy, scx,
        weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
        katet = Math.round(Math.sqrt(weights.length)),
        half = (katet * 0.5) | 0,
        dstData = ctx.createImageData(w, h),
        dstBuff = dstData.data,
        srcBuff = ctx.getImageData(0, 0, w, h).data,
        y = h;

    while (y--) {
        x = w;
        while (x--) {
            sy = y;
            sx = x;
            dstOff = (y * w + x) * 4;
            r = 0;
            g = 0;
            b = 0;
//            a = 0;

            for (cy = 0; cy < katet; cy++) {
                for (cx = 0; cx < katet; cx++) {
                    scy = sy + cy - half;
                    scx = sx + cx - half;

                    if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                        srcOff = (scy * w + scx) * 4;
                        wt = weights[cy * katet + cx];

                        r += srcBuff[srcOff] * wt;
                        g += srcBuff[srcOff + 1] * wt;
                        b += srcBuff[srcOff + 2] * wt;
//                        a += srcBuff[srcOff + 3] * wt;
                    }
                }
            }

            dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
            dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
            dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
            dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
        }
    }

    ctx.putImageData(dstData, 0, 0);
})();

MMD_SA_options.model_para_obj._icon_canvas = document.createElement("canvas")
MMD_SA_options.model_para_obj._icon_canvas.width = MMD_SA_options.model_para_obj._icon_canvas.height = 64
MMD_SA_options.model_para_obj._icon_canvas.getContext("2d").drawImage(canvas, 0,0)

MMD_SA_options.Dungeon.update_status_bar(true)

jThree("#MMD_AmbLight").three(0).color = new THREE.Color(MMD_SA_options.ambient_light_color);

var dir_light = jThree("#MMD_DirLight").three(0)
dir_light.color = new THREE.Color(MMD_SA_options.light_color);
dir_light.position.copy(_dir_light_pos)

var point_light = jThree("#pointlight_main").three(0)
if (point_light) {
  point_light.color = new THREE.Color((options.point_light && options.point_light.color) || "#ffffff")
}

var mesh = THREE.MMD.getModels()[0].mesh
mesh.geometry.boundingBox.expandByScalar(-20)
mesh.geometry.boundingSphere.radius -= 20

MMD_SA_options.look_at_screen = _look_at_screen
MMD_SA_options.look_at_mouse  = _look_at_mouse

MMD_SA.reset_camera()

//System._browser.on_animation_update.add(function () { SL_Host.style.visibility = "inherit"; }, 0, 0);
  }, (frame_to_skip-1), 1);
}

SL_Host.style.visibility = "hidden";

MMD_SA_options.Dungeon.event_mode = true
System._browser.on_animation_update.add(function () {
  if (!MMD_SA_options.Dungeon.started)
    window.dispatchEvent(new CustomEvent("SA_Dungeon_onstart"));
  MMD_SA_options.Dungeon.started = true

  THREE.MMD.getModels().forEach((model) => {
    model.resetPhysics(60)
  });

  MMD_SA_options.Dungeon.event_mode = false
  MMD_SA_options.Dungeon.run_event("onstart")

  options._startup_position_ = c.pos.clone();

  SL_Host.style.visibility = "inherit";
}, frame_to_skip+3, 0);
    };
})();
