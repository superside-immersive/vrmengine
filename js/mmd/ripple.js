// Ripple water effect processor
// Extracted from MMD_SA.js — Step 10G refactoring

window.MMD_SA_createRipple = function () {
    var drop_list = []
    var pos_to_track
    var _timestamp = 0
    var _timestamp_to_renew = 0

    var v3_bone, v3a

    function get_pos(mesh, bone_name, v3) {
      return (v3||v3_bone).getPositionFromMatrix(mesh.bones_by_name[bone_name].skinMatrix).applyMatrix4(mesh.matrixWorld)
    }

    function ripple_reset() {
      for (var i = 0, i_max = MMD_SA_options.ripple_max; i < i_max; i++)
        drop_list[i] = new THREE.Vector4()
      pos_to_track = {}
      _timestamp = 0
      _timestamp_to_renew = 0
    }

    window.addEventListener("MMDStarted", function () {
      v3_bone = new THREE.Vector3()
      v3a = new THREE.Vector3()
      ripple_reset()
    });

    window.addEventListener("SA_Dungeon_onrestart", function () {
      ripple_reset()
    });

    return function () {
if (!MMD_SA.MMD_started)
  return drop_list

var timestamp = RAF_timestamp
if (_timestamp == timestamp)
  return drop_list

// first frame: initialize and return
if (!_timestamp) {
  _timestamp = timestamp
//左足首//ＩＫ
//右足首
  let mesh = THREE.MMD.getModels()[0].mesh
  pos_to_track.PC = {
    timestamp:_timestamp
   ,bones: [
  { name:"左足首", pos:get_pos(mesh, "左足首").clone() }
 ,{ name:"右足首", pos:get_pos(mesh, "右足首").clone() }
    ]
  };
  return drop_list
}

var t_diff = (timestamp - _timestamp) / 1000
_timestamp = timestamp

var index_free = []
var index_spare = []
var active_drop_count = 0
drop_list.forEach(function (drop, idx) {
  if (!drop.z) {
    index_free.push(idx)
    return
  }

  drop.w += 0.1 * t_diff*60*1.5
  if (drop.w > 50) {
    drop.z = 0
    index_free.push(idx)
  }
  else {
    active_drop_count++
    index_spare.push({ idx:idx, w:drop.w })
  }
});

//DEBUG_show([active_drop_count,drop_list[0].w,Date.now()].join("\n"))

// renew drop 10 times/sec
if (_timestamp_to_renew == PC_count_absolute)
  return drop_list
_timestamp_to_renew = PC_count_absolute

var d = MMD_SA_options.Dungeon

var index_spare_sorted = false
for (var model_name in pos_to_track) {
  var model_obj = pos_to_track[model_name]
  t_diff = (timestamp - model_obj.timestamp) / 1000
  if (t_diff == 0)
    continue

  var mesh
  if (model_name == "PC") {
    mesh = THREE.MMD.getModels()[0].mesh
  }

  var pos_base = get_pos(mesh, "全ての親", v3a)
  
  if (d) {
    let x = ~~(pos_base.x/d.grid_size)
    let y = ~~(pos_base.z/d.grid_size)
    let grid_para = d.get_para(x,y)
    let material_id = grid_para.floor_material_index
    if (material_id == null)
      material_id = d.floor_material_index_default
    let p = d.grid_material_list[material_id]
    if (!p || !p.waveBaseSpeed) continue

    let ground_y_water = d.get_para(x,y,true).ground_y_visible || 0
    if (pos_base.y > ground_y_water) continue

//DEBUG_show(pos_base.toArray().join("\n") + "\n\n" + get_pos(mesh, "左足首").toArray().join("\n"))
  }

  var drop_new_list = []
  model_obj.bones.forEach(function (bone, idx) {
    var pos = get_pos(mesh, bone.name)
    var dis_in_1_sec = pos.distanceTo(bone.pos) / t_diff
//DEBUG_show(dis_in_1_sec+'\n'+Date.now())
    if (dis_in_1_sec > 10) {
      var z = dis_in_1_sec/(30*2)
      drop_new_list.push({ bone_idx:idx, z:z })
    }
    bone.pos.copy(pos)
  });

  model_obj.timestamp = timestamp
  if (drop_new_list.length) {
    drop_new_list.sort(function (a,b) { return b.z-a.z })
    var drop_new_max = Math.min(2, drop_new_list.length, MMD_SA_options.ripple_max)
    if (index_free.length < drop_new_max) {
      if (!index_spare_sorted) {
        index_spare_sorted = true
        index_spare.sort(function (a,b) { return b.w-a.w })
      }
      for (var i = 0, i_max = drop_new_max-index_free.length; i < i_max; i++)
        index_free.push(index_spare.shift().idx)
    }

    for (var i = 0; i < drop_new_max; i++) {
      var drop_new = drop_list[index_free.shift()]
      var drop_new_para = drop_new_list[i]
      pos_base = model_obj.bones[drop_new_para.bone_idx].pos
      drop_new.x = pos_base.x
      drop_new.y = pos_base.z
      drop_new.z = Math.min(drop_new_para.z, 2)
//DEBUG_show(z_max*30+'\n'+Date.now())
      drop_new.w = 0//-2//
    }
  }
}

return drop_list
    };
};
