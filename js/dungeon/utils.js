// utils.js — extracted from dungeon.js (Step 6B)
// Utility functions for dungeon system (combat, grid, bounding box, tooltip)

MMD_SA_options.Dungeon.utils = {

    create_combat_character: function (object_index, para) {
if (!para)
  para = {}

var d = MMD_SA_options.Dungeon

var combat = {
  combat_seed: para.combat_seed || 4
 ,parry_level: para.parry_level || 3

 ,action_check: (function () {
    var combat_action = para.combat_action || [
  "PC combat attack 01"
 ,"PC combat attack 02"
 ,"PC combat attack 03"
 ,"PC combat attack 04"
 ,"PC combat attack 05"
 ,"PC combat attack 06"
 ,"PC combat attack 07"
 ,"PC combat attack 08"
 ,"PC combat attack 09"
 ,"PC combat attack 10"
 ,"PC combat attack 11"
 ,"PC combat attack 12"
 ,"PC combat attack 13"
 ,"PC combat attack 14"
 ,"PC combat attack 15"
 ,"PC combat attack 16"
 ,"PC combat attack 17"
 ,"PC combat attack 18"
 ,"PC combat attack 19"
    ];

    return function (attacker) {
var action_obj = {}
var seed_max = (d._combat_seed_ != null) ? d._combat_seed_ : Math.max(combat.combat_seed, 2)
var seed = random(seed_max)

var dis = attacker._obj.position.distanceTo(d.character.pos)

if (0&& (seed_max > 2) && (seed == seed_max-1) && (dis < 48)) {
  action_obj.motion_id = combat_action[random(combat_action.length)]//"PC combat attack 12"//
}
else if ((seed % 2 == 0) && (dis < 64)) {
  action_obj.type = "STAY"
}
else {
  action_obj.type = "MOVE"
}
//action_obj = { type:"MOVE" }
return action_obj
    };
  })()

 ,parry_check: function (def, atk_para) {
var t = Date.now()

if (!def._parry_mod_)
  def._parry_mod_ = {}
var p = def._parry_mod_[atk_para.motion_id]
if (!p)
  p = def._parry_mod_[atk_para.motion_id] = { lvl:0, time:t }

p.lvl = Math.max(p.lvl - (t - p.time)/(1000*30), 0)
p.time = t

var combat_para = atk_para.para[atk_para.index]
var hit_level = combat_para.hit_level || 1
p.lvl = Math.min(p.lvl + hit_level/(10), 3)
//console.log(def)
//DEBUG_show(atk_para.motion_id+'/'+p.lvl)

return Math.floor(Math.random() * (((d._parry_level_ != null) ? d._parry_level_ : combat.parry_level) || 1) + p.lvl)
  }
};

var obj = {
  placement: {
    can_overlap: true
   ,hidden: true
  }
 ,no_camera_collision: true
 ,view_distance: 999

 ,mass: para.mass || 1
 ,hp: para.hp || 100
 ,combat: combat
 ,animate: "combat_default"
};

if (typeof object_index == 'number')
  obj.object_index = object_index
else
  obj.object_id = object_index

if (para.p_to_assign) {
  obj = Object.assign(obj, para.p_to_assign)
}

return obj;
    }

   ,create_combat_event: (function () {
      var ray, box3, dir_v3, origin_v3, v3a, v3b, v3c;
      var center_rot_y = [0, 45, -45, 90, -90, 135, -135, 180].map(function (ry) { return ry/180*Math.PI; });
      window.addEventListener("MMDStarted", function () {
ray = new THREE.Ray()
box3 = new THREE.Box3()
dir_v3 = new THREE.Vector3()
origin_v3 = new THREE.Vector3()
v3a = new THREE.Vector3()
v3b = new THREE.Vector3()
v3c = new THREE.Vector3()
      });

      return function (x, y, para) {
if (!para.grid_id_excluded)
  para.grid_id_excluded = []
para.grid_id_excluded.push(1)

var d = MMD_SA_options.Dungeon
var d_options = d.RDG_options

var c_grid_id = d.grid_array[y][x]
//if (c_grid_id != 3) return null

function condition(x,y) {
  return ((para.zone_condition) ? para.zone_condition(x,y) : (d.grid_array_free[y][x] && (para.grid_id_excluded.indexOf(d.grid_array[y][x]) == -1)))
}

//.grid_array[y][x]
//.grid_array_free[y][x]
if (d.character.combat_mode || d._check_points || d.event_mode) {
//console.log(999)
  return null
}

if (!condition(x,y))
  return null

var dis_min = (para.dis_min != null) ? para.dis_min : 1

// move along the x/y-axis, and find the min/max x/y from the starting point with no obstacle along the paths
var min_y
for (var i = y, i_min = Math.max(0, y-(para.dis_max||3)); i >= i_min; i--) {
  if (condition(x,i))
    min_y = i
  else
    break
}

var max_y
for (var i = y, i_max = Math.min(d_options.height-1, y+(para.dis_max||3)); i <= i_max; i++) {
  if (condition(x,i))
    max_y = i
  else
    break
}

if (max_y - min_y < dis_min)
  return null

var min_x
for (var i = x, i_min = Math.max(0, x-(para.dis_max||3)); i >= i_min; i--) {
  if (condition(i,y))
    min_x = i
  else
    break
}

var max_x
for (var i = x, i_max = Math.min(d_options.width-1, x+(para.dis_max||3)); i <= i_max; i++) {
  if (condition(i,y))
    max_x = i
  else
    break
}

if (max_x - min_x < dis_min)
  return null

var box = { area:0, center_factor:0, min:{}, max:{} }
// move along the y-axis, from starting point to min_y (top side)
for (var y0 = y; y0 >= min_y; y0--) {
// find the min/max x for each y0
  var min_x0
  for (var x0 = x; x0 >= min_x; x0--) {
    if (condition(x0,y0))
      min_x0 = x0
    else
      break
  }

  var max_x0
  for (var x0 = x; x0 <= max_x; x0++) {
    if (condition(x0,y0))
      max_x0 = x0
    else
      break
  }

  if (max_x0 - min_x0 < dis_min)
    continue

// move along the x-axis and find the max_y (bottom side) along each x1
  var max_y1 = {}
  for (var x1 = min_x0; x1 <= max_x0; x1++) {
    for (var y1 = y0; y1 <= max_y; y1++) {
      if (condition(x1,y1))
        max_y1[x1] = y1
      else
        break
    }
  }

// min_x0 to x (left side)
  for (var x1 = min_x0; x1 <= x; x1++) {
    var y1 = max_y1[x1]
// no max_y on the left side of x1 should be bigger than the current max_y
    for (var x2 = min_x0; x2 < x1; x2++)
      max_y1[x2] = Math.min(max_y1[x2], y1)
  }
// max_x0 to x (right side)
  for (var x1 = max_x0; x1 >= x; x1--) {
    var y1 = max_y1[x1]
// no max_y on the right side of x1 should be bigger than the current max_y
    for (var x2 = max_x0; x2 > x1; x2--)
      max_y1[x2] = Math.min(max_y1[x2], y1)
  }

// Pick a point from each side along the x-axis, find the common (i.e. smallest) max_y between them, and then we have the box.
  for (var x1 = min_x0; x1 <= x; x1++) {
    if (max_y1[x1] < y)
      continue

    for (var x2 = max_x0; x2 >= x; x2--) {
      var length_x = x2 - x1
      if (length_x < dis_min)
        continue

      var max_y0 = Math.min(max_y1[x1], max_y1[x2])
      if (max_y0 < y)
        continue

      var length_y = max_y0 - y0
      if (length_y < dis_min)
        continue

      var area = (length_x+1) * (length_y+1)
      if (area < box.area)
        continue

      var center_factor = (x2-x) * (x-x1) * (max_y0-y) * (y-y0)
      if ((area == box.area) && (center_factor < box.center_factor))
        continue

      box.area = area
      box.center_factor = center_factor
      box.min.x = x1
      box.min.y = y0
      box.max.x = x2
      box.max.y = max_y0
    }
  }
}

if (box.area < (para.area||3))
  return null

box3.set(v3a.set(box.min.x, -999, box.min.y), v3b.set(box.max.x+1, 999, box.max.y+1))

var rot_y = 0
if (para.rotation !== false) {
  origin_v3.set(x+0.5, 0, y+0.5)

  var ry_list = []
  var is_best_ry = center_rot_y.some(function (ry) {
    rot_y = d.character.rot.y + ry
    dir_v3.set(0,0,1).applyEuler(v3a.set(0,rot_y,0))

// cast outside the box in the opposite direction
    ray.set(v3a.copy(origin_v3).add(v3b.copy(dir_v3).multiplyScalar(9999)), v3c.copy(dir_v3).negate())

    var intersection = ray.intersectBox(box3, v3a)
    box.encounter_center = origin_v3.clone().add(intersection).multiplyScalar(0.5)

    if (box.area == 1)
      return true

    var dis = origin_v3.distanceToSquared(box.encounter_center)
    if (dis > 1)
      return true

    ry_list.push({ dis:dis, rot_y:rot_y, encounter_center:box.encounter_center })
  });

  if (!is_best_ry) {
    var best_ry = ry_list.sort(function (a,b) { return a-b; }).pop();
    rot_y = best_ry.rot_y
    box.encounter_center = best_ry.encounter_center
  }
}

//return box

var grid_size = d.grid_size
var event_id = "_COMBAT_AUTO_"

box3.max.multiplyScalar(grid_size)
box3.min.multiplyScalar(grid_size)
var center_v3 = box3.center()

box.encounter_center = (box.encounter_center && box.encounter_center.multiplyScalar(grid_size)) || center_v3.clone()

var zone_of_movement = box3.clone().translate(v3a.copy(center_v3).negate())
zone_of_movement.center_position = center_v3.clone()

var check_point = {
  position: center_v3.clone()
 ,range: [
    {
      zone: box3.clone()
     ,onenter: { event_id: event_id + "_onenter0" }
     ,onexit:  { event_id: event_id + "_onexit0", condition: function () { return !d.character.combat_mode; } }
    }
  ]
};

var objs_enter = {}
var objs_exit = {}
para.enemy_list.forEach(function (enemy, idx) {
  var pos_offset = enemy.pos_offset
  if (pos_offset)
    pos_offset = v3a.copy(pos_offset)
  else {
    if (idx % 2 == 0) {
      pos_offset = v3a.set(-idx/2    *grid_size*0.25, 0, 0)
    }
    else {
      pos_offset = v3a.set((idx+1)/2 *grid_size*0.25, 0, 0)
    }
  }

  if (rot_y)
    pos_offset.applyEuler(v3b.set(0,rot_y,0))
//console.log(d.character.rot.y, rot_y)
  var pos = box.encounter_center.clone().add(pos_offset)
  pos.y = d.get_ground_y(pos)

  var obj = {
    placement: {
      position: pos
    }
   ,hp: enemy.hp || 100
   ,zone_of_movement: zone_of_movement
  };

  var obj_id = (enemy.index != null) ? "object" + enemy.index + "_0" : d.object_id_translated[enemy.id];
  objs_enter[obj_id] = obj;

  objs_exit[obj_id] = { placement:{hidden:true} };
});


if (!para.events)
  para.events = {}
var e = para.events

var onplayerdefeated, onenemyalldefeated
if (e.onplayerdefeated) {
  onplayerdefeated = function () {
  }
}
if (e.onenemyalldefeated) {
  onenemyalldefeated = function (onenemyalldefeated_default) {
    var events = e.onenemyalldefeated.slice().concat([{func:onenemyalldefeated_default, ended:true}])
    d.run_event([events])
    return true
  }
}

d.events[event_id + "_onenter0"] = [
//0
      [
        {
          combat: {
  enabled:true
// ,cooling_time: 99999
 ,show_HP_bar: true
 ,onplayerdefeated:   onplayerdefeated
 ,onenemyalldefeated: onenemyalldefeated
 ,onstatechange: {
    goto_branch: 1
  }
          }
        }
      ]

// 1
     ,(function () { var events = (e.onbeforecombatstart && e.onbeforecombatstart.slice()) || []; events.push({goto_branch:2}); return events; })()

//2
     ,[
        {
          objects: objs_enter
         ,camera_focus: box.encounter_center
         ,goto_branch: 3
        }
      ]

// 3
     ,(function () { var events = (e.onaftercombatstart && e.onaftercombatstart.slice()) || []; events.push({set_event_flag:{branch_index:0}, ended:true}); return events; })()

];

d.events[event_id + "_onexit0"] = [
      [
        {
          combat: {
  enabled:false
 ,onstatechange: {
    objects: objs_exit
  }
          }
         ,ended: true
        }
      ]
];

d._check_points = d.check_points
d.check_points = [check_point]

console.log(check_point)

return box;

      };
    })()

   ,grid_array_by_object: function (RDG_options, para) {
if (RDG_options._grid_array_by_object)
  return RDG_options._grid_array_by_object

var d = MMD_SA_options.Dungeon

var obj_base = d.object_base_list[para.object_index]
var mesh = obj_base._obj._obj
var bb = obj_base._obj._obj_proxy.boundingBox;
var scale = para.scale || (obj_base.placement && obj_base.placement.scale) || 10

var w = Math.max(Math.abs(bb.min.x), Math.abs(bb.max.x)) * scale * 2
var h = Math.max(Math.abs(bb.min.z), Math.abs(bb.max.z)) * scale * 2

var area_options = MMD_SA_options.Dungeon_options.options_by_area_id[d.area_id]
var grid_size
if (!area_options.grid_size) {
  grid_size = Math.max(w,h) / 100
  grid_size = area_options.grid_size = (grid_size <= 64) ? 64 : Math.pow(2, Math.ceil(Math.log2(grid_size)))
}
if (!area_options.view_radius)
  area_options.view_radius = Math.max(Math.round(512/grid_size), 4)

w = Math.ceil(w/grid_size)
h = Math.ceil(h/grid_size)
if (w % 2 == 0) w++
if (h % 2 == 0) h++

RDG_options.width  = w
RDG_options.height = h

var _grid_array = RDG_options._grid_array_by_object = []
for (var y = 0, y_max = h+2; y <= y_max; y++) {
  _grid_array[y] = []
  for (var x = 0, x_max = w+2; x <= x_max; x++)
    _grid_array[y][x] = (y==0 || y==y_max || x==0 || x==x_max) ? 1 : 0
}
_grid_array[~~(h/2)+1][~~(w/2)+1] = 2

return _grid_array
    }

   ,adjust_boundingBox: function (geo, model_para={}) {
if (!model_para.is_object && !model_para.use_default_boundingBox) {
  const THREE = MMD_SA.THREEX.THREE;

// save some headaches by setting xz center as (0,0), with equal xz size (z no bigger than x)
  const _v3 = geo.boundingBox.size()
  const _xz = (_v3.x + ((_v3.z > _v3.x) ? _v3.x : _v3.z))*0.5 *0.5 *(MMD_SA_options.Dungeon._bb_xz_factor_||1)
  geo.boundingBox.min.x = geo.boundingBox.min.z = -_xz
  geo.boundingBox.max.x = geo.boundingBox.max.z =  _xz

  geo.boundingSphere = geo.boundingBox.getBoundingSphere(new THREE.Sphere())
  geo.boundingSphere.radius *= 0.5
}
    }

   ,tooltip: (()=>{
      let scale;
      return function (x,y, content) {
const SB_tooltip = document.getElementById('SB_tooltip');
if (content)
  SB_tooltip.textContent = content;

let _scale = MMD_SA_options.Dungeon.inventory.UI.info.scale / window.devicePixelRatio;
if (scale != _scale) {
  scale = _scale;
  SB_tooltip.style.transform = 'scale(' + scale + ')';
}

const w = 280+5+5;
SB_tooltip.style.left = ((x > MMD_SA.THREEX.SL.width/2) ? x/window.devicePixelRatio - 40 - w * (1+(scale-1)/2) : x/window.devicePixelRatio + 40 + w * (scale-1)/2) + 'px';
SB_tooltip.style.top  = (y/window.devicePixelRatio + 40) + 'px';
SB_tooltip.style.visibility = 'inherit';
      };
    })()

  };
