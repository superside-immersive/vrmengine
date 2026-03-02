// key_map.js - keyboard bindings (WASD, camera, jump)
// Extracted Step 6H from dungeon.js
(function () {
var d = MMD_SA_options.Dungeon;

d._setupKeyMap = function () {
  var that = this;
  var options = MMD_SA_options.Dungeon_options;

this.key_map = options.key_map || {};

var ULDR_indexd = []
//WASD
var ULDR_keyCode = [87,65,83,68]
var ULDR_id = ["up","left","down","right"]

for (var key in this.key_map) {
  var id = this.key_map[key].id
  var index = id && ULDR_id.indexOf(id)
  if (index >= 0)
    ULDR_indexd[index] = true
}

ULDR_id.forEach((id, idx)=>{
  if (ULDR_indexd[idx])
    return

  var key_map = that.key_map[ULDR_keyCode[idx]] = { order:1000+idx, id:id, type_movement:true };

  switch (id) {
    case "up":
      key_map.about_turn = false
      key_map.key_id_cancel_list = ["down"]
      key_map.motion_id = "PC movement forward"
      Object.defineProperty(key_map, 'mov_speed', { get:()=>this.motion["PC movement forward"].para._speed, });
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["down"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{x:0, y:0, get z() { return MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }} }]
      }
      break
    case "down":
      key_map.about_turn = true
      key_map.key_id_cancel_list = ["up"]
      key_map.motion_id = "PC movement forward"
      Object.defineProperty(key_map, 'mov_speed', { get:()=>this.motion["PC movement forward"].para._speed, });
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["up"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{x:0, y:0, get z() { return -MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }} }]
      }
      break
    case "left":
      key_map.rot_speed = {x:0, y: Math.PI*0.75, z:0}
      key_map.key_id_cancel_list = ["right"]
//      key_map.motion_id = "PC movement forward"
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["right"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{get x() { return MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }, y:0, z:0 } }]
      }
      break
    case "right":
      key_map.rot_speed = {x:0, y:-Math.PI*0.75, z:0}
      key_map.key_id_cancel_list = ["left"]
//      key_map.motion_id = "PC movement forward"
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["left"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{get x() { return -MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }, y:0, z:0 } }]
      }
      break
  }
});

if (!this.key_map[38]) {
  this.key_map[38] = { order:838, id:"camera_preset_switch", keyCode:38
   ,onfirstpress: (function () {
var d = MMD_SA_options.Dungeon;
var c = d.character;

let v3a;
const camera_position_preset_length = 3;
function camera_position_preset(index) {
  const dc = MMD_SA_options.camera_position_base;
  switch (index) {
    case 1:
      return v3a.set(dc[0]*2, dc[1]*2+10, dc[2]*2*MMD_SA_options.Dungeon_options.camera_position_z_sign).toArray();
    case 2:
      return v3a.set(dc[0]*3, dc[1]*3+15, dc[2]*4*MMD_SA_options.Dungeon_options.camera_position_z_sign).toArray();
    default:
      return v3a.set(dc[0], dc[1], dc[2]*MMD_SA_options.Dungeon_options.camera_position_z_sign).toArray();;
  }
}

d.update_camera_position_base = function (pos) {
  if (pos) MMD_SA_options.camera_position_base = pos;

  d.key_map[38].camera_position_preset_index = 0;
  c.camera_position_base_default = camera_position_preset(0);
  c.camera_position_base = c.camera_position_base_default.slice();

  MMD_SA.reset_camera(true);
};

window.addEventListener("jThree_ready", function () {
  v3a = new THREE.Vector3();

  d.key_map[38].camera_position_preset_index = 0;

  c.camera_rotation_from_preset = new THREE.Vector3();
});

window.addEventListener("SA_Dungeon_onrestart", function () {
  if (c.mount_para) return;

  c.camera_position_base_default = camera_position_preset(d.key_map[38].camera_position_preset_index);
  c.camera_position_base = c.camera_position_base_default.slice();
});

return function () {
  if (d.event_mode) return;
  if (c.mout_para) return;

  if (++this.camera_position_preset_index >= camera_position_preset_length)
    this.camera_position_preset_index = 0;

  c.camera_position_base_default = camera_position_preset(this.camera_position_preset_index);
  c.camera_position_base = c.camera_position_base_default.slice();

  c.rot.set(0,0,0);
  THREE.MMD.getModels()[0].mesh.quaternion.set(0,0,0,1);

  c.about_turn = false;
  c.camera_TPS_rot.set(0,0,0);
  c.camera_update();

//  if (c.TPS_camera_lookAt_) d._rot_camera.v3.set(0,0,0);

  MMD_SA.reset_camera();

  var tc = MMD_SA._trackball_camera;
  c.camera_rotation_from_preset.y = Math.PI/2 - Math.atan2((tc.target.z-tc.object.position.z), (tc.target.x-tc.object.position.x));

  DEBUG_show("Camera preset:" + (this.camera_position_preset_index+1)+'/'+camera_position_preset_length, 2);
};
    })()
  };
}
if (!this.key_map[40]) {
  this.key_map[40] = { order:840, id:"TPS_mode_toggle", keyCode:40
   ,onfirstpress: function () {
if (MMD_SA_options.Dungeon.event_mode) return;
/*
var look_at_screen = MMD_SA_options._look_at_screen
MMD_SA_options.look_at_screen = MMD_SA_options.look_at_mouse = !look_at_screen
MMD_SA.reset_camera()

DEBUG_show("Look at screen:" + ((!look_at_screen)?"ON":"OFF"), 2)
*/

var c = that.character;
var combat = c.combat_mode && that._states.combat;
if (combat && (combat._target_enemy_index >= 0)) {
  combat._target_enemy_index = -1
  if (!c.TPS_mode)
    MMD_SA.reset_camera(true)
}
else {
  c.TPS_mode = !c.TPS_mode
  MMD_SA.reset_camera(true)
  DEBUG_show("TPS control mode:" + ((c.TPS_mode)?"ON":"OFF"), 2)
}
    }
  };
}

(function () {

  function select_target(counter) {
var c = that.character
if (!c.combat_mode)
  return

var combat = that._states.combat
if (!combat.enemy_list.some(function (enemy) { return enemy.hp; }))
  return

var target_enemy_index = (combat._target_enemy_index == null) ? -1 : combat._target_enemy_index
var enemy
while (true) {
  target_enemy_index += counter
  if (target_enemy_index >= combat.enemy_list.length)
    target_enemy_index = 0
  else if (target_enemy_index < 0)
    target_enemy_index = combat.enemy_list.length - 1

  enemy = combat.enemy_list[target_enemy_index]
  if (!enemy.hp)
    continue

  combat._target_enemy_index = target_enemy_index
  break
}

//c.rot.y = Math.PI/2 - Math.atan2((enemy._obj.position.z-c.pos.z), (enemy._obj.position.x-c.pos.x))
//THREE.MMD.getModels()[0].mesh.quaternion.setFromEuler(c.rot)
  }

  if (!that.key_map[37]) {
    that.key_map[37] = { order:837, id:"target_select_L", keyCode:37
     ,onfirstpress: function () {
select_target(-1)
      }
    };
  }
  if (!that.key_map[39]) {
    that.key_map[39] = { order:839, id:"target_select_R", keyCode:39
     ,onfirstpress: function () {
select_target(1)
      }
    };
  }

})();

this.key_map_reset = function () {
  this.key_map_by_id = {}
  this.key_map_list = []
  for (var key in this.key_map) {
    var k = this.key_map[key]
    k.keyCode_default = k.keyCode_default || k.keyCode
    k.keyCode = key
    k.id_default = k.id_default || k.id
    this.key_map_by_id[k.id_default||key] = this.key_map_by_id[k.id||key] = k
    this.key_map_list.push(k)
  }
  this.key_map_list.sort(function(a,b){return a.order-b.order})
};

this.key_map_reset()
if (!this.key_map[32] && !this.key_map_by_id["jump"]) {
  let _onfirstpress = function (e) {
    var keyCode = (that.key_map_by_id["up"].down || that.key_map_by_id["down"].down || that.key_map_by_id["left"].down || that.key_map_by_id["right"].down || !e.detail.e.shiftKey) ? 1320 : 1321

    var key_map = that.key_map[32] = that.key_map_by_id["jump"] = that.key_map[keyCode]
    key_map.keyCode = 32
    key_map.id = "jump"
    key_map.is_down = this.is_down
    key_map.down = this.down
    if (this != key_map) {
      this.keyCode = this.keyCode_default
      this.id = this.id_default
      this.is_down = 0
      this.down = 0
    }
//DEBUG_show(keyCode,0,1)
  };
  let _onupdate = (function () {
    var va_default = d._jump_physics((15+10), 11);
    return function (para) {
if (!this.down)
  return

var model = THREE.MMD.getModels()[0]
var motion_para = MMD_SA_options.Dungeon.motion[this.motion_id].para

var scale = 0.25 + Math.min(para.pressed,250)/250*0.75

var t_diff = para.t_diff
var frame = model.skin.time*30
var frame_base = frame - t_diff*30

var result = {}
var va
if ((frame >= 12) && (frame < 12+22)) {
  let playbackRate_last = motion_para.playbackRate_by_model_index[0] || 1
  let _t_diff = (frame_base >= 12) ? t_diff : (frame - 12)/30
//if (_t_diff != t_diff) DEBUG_show((t_diff-_t_diff)/t_diff,0,1)
  let playbackRate = motion_para.playbackRate_by_model_index[0] = (t_diff-_t_diff)/t_diff*playbackRate_last + _t_diff/t_diff*1/scale
  if (playbackRate_last != playbackRate) {
    result.t2_extended = (playbackRate - playbackRate_last) * t_diff
  }
  va = d._jump_physics((15+10)*scale, 11)
}
else {
  motion_para.playbackRate_by_model_index[0] = 1
  va = va_default
}
motion_para.mov_speed[1] = { frame:12, speed:{x:0, y:va.v, z:41/22*30*scale}, acceleration:{x:0, y:va.a, z:0}}

return result
/*
 ,mov_speed: (function () {
var va = d._jump_physics((15+10), 11)
return [
  { frame:34, speed:{x:0, y:0,    z:22.8/12*30}}
 ,{ frame:12, speed:{x:0, y:va.v, z:41/22*30}, acceleration:{x:0, y:va.a, z:0}}
 ,{ frame:0,  speed:{x:0, y:0,    z:22.8/12*30}}
];
  })()
*/
    };
  })();
  let _ondown = function (e) {
var c = MMD_SA_options.Dungeon.character
if (c.mount_para && !c.mount_para.can_jump)
  return true
  };
  this.key_map[1320] = { order:999, id:"jump_forward", type_movement:true, keyCode:1320, onkeyup:function(){}, motion_id:"PC forward jump", key_id_cancel_list:["up","down"]
   ,onfirstpress: _onfirstpress
   ,ondown: _ondown
   ,onupdate: _onupdate
   ,TPS_mode: {
      motion_id:"PC forward jump"
     ,key_id_cancel_list:["up","down","left","right"]
    }
  };
  this.key_map[1321] = { order:999, id:"jump_high", type_movement:true, keyCode:1321, onkeyup:function(){}, motion_id:"PC high jump", key_id_cancel_list:["up","down"]
   ,onfirstpress: _onfirstpress
   ,ondown: _ondown
//   ,onupdate: _onupdate
   ,TPS_mode: {
      motion_id:"PC high jump"
     ,key_id_cancel_list:["up","down","left","right"]
    }
  };
  this.key_map[32] = this.key_map[1320]
}

this.key_map_default = {}
Object.assign(this.key_map_default, this.key_map)

// initialize to assign .duration for all necessary motions (BEFORE .generateSkinAnimation()) to prevent looping
window.addEventListener("SA_MMD_init", ()=>{
  MMD_SA_options.Dungeon.character.assign_keys()
});


// Store ULDR constants for optional key map extensions
d._ULDR_keyCode = [87,65,83,68];
d._ULDR_id = ["up","left","down","right"];
};
})();
