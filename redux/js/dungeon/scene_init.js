// dungeon/scene_init.js — Grid material list, object base list, grid blocks initialization
// Extracted from dungeon.js MMDStarted handler (Step 6G)
// Safety: d._setupScene() is called from MMDStarted, THREE is available at that point.
(function () {
var d = MMD_SA_options.Dungeon;

d._setupScene = function () {
(function () {
  var _reset = function () {
if (this.disabled)
  return

this._initialized = false

for (var lvl = 0, lvl_max = this.geo_by_lvl.length; lvl < lvl_max; lvl++) {
  var lvl_obj = this.lvl[lvl]
// set .index to 0 effectively means the first obj is just for cloning and is never displayed
  lvl_obj.index = 0//-1
  lvl_obj.index_material_cloned = -1
  lvl_obj.list.concat(lvl_obj.list_material_cloned).forEach(function (obj) {
    obj.visible = false
    MMD_SA.THREEX.scene.remove(obj)
  });

  var i, i_max

  lvl_obj.reusable_list = []
  for (i = lvl_obj.index+1, i_max = lvl_obj.list.length; i < i_max; i++)
    lvl_obj.reusable_list.push(i)
  lvl_obj.index = Math.max(i_max-1, lvl_obj.index)

  lvl_obj.reusable_list_material_cloned = []
  for (i = lvl_obj.index_material_cloned+1, i_max = lvl_obj.list_material_cloned.length; i < i_max; i++)
    lvl_obj.reusable_list_material_cloned.push(i)
  lvl_obj.index_material_cloned = Math.max(i_max-1, lvl_obj.index_material_cloned)
}
  }

  var _get_obj = function (list) {
const THREE = MMD_SA.THREEX.THREE;

var plane0 = this.list[0]

var index, reusable_list
if (list == this.list) {
  index = "index"
  reusable_list = "reusable_list"
}
else {
  index = "index_material_cloned"
  reusable_list = "reusable_list_material_cloned"
}

var plane
var index_used = this[reusable_list].pop()
if (index_used != null) {
  plane = list[index_used]
}
else {
  index_used = ++this[index]
  plane = list[index_used]
  if (!plane) {
    plane = list[index_used] = (list == this.list) ? plane0.clone() : plane0.clone(new THREE.Mesh(plane0.geometry, plane0.material.clone()))
    plane.matrixAutoUpdate = false
    MMD_SA.THREEX.scene.add(plane)
  }
}

return [plane, index_used]
  }

  var _init = function () {
if (this.disabled || this._initialized)
  return this
this._initialized = true

for (var lvl = 0, lvl_max = this.geo_by_lvl.length; lvl < lvl_max; lvl++) {
  var lvl_obj = this.lvl[lvl]
  lvl_obj.list.concat(lvl_obj.list_material_cloned).forEach(function (obj) {
// NOTE: scene.add must come first, or .visible will always be reset to true.
    MMD_SA.THREEX.scene.add(obj)
    obj.visible = false
//    obj.renderDepth = 999999
  });
}

return this
  }

  MMD_SA_options.Dungeon.grid_material_list.forEach(function (p_obj, idx) {
    p_obj.reset = _reset
    p_obj.init  = _init

    if (p_obj.disabled)
      return

    p_obj.lvl = []
    for (var lvl = 0, lvl_max = p_obj.geo_by_lvl.length; lvl < lvl_max; lvl++) {
      var mesh_obj = MMD_SA_options.mesh_obj_by_id['DungeonPlane'+idx+'MESH_LV'+lvl]._obj;
      mesh_obj.useQuaternion = true
      mesh_obj.quaternion.setFromEuler(mesh_obj.rotation)
      p_obj.lvl[lvl] = {
  lvl: lvl
 ,lvl_max: lvl_max
 ,list:[mesh_obj]
 ,list_material_cloned:[]
 ,reusable_list:[]
 ,reusable_list_material_cloned:[]
 ,get_obj:_get_obj
      };
    }
  });
})();

(function () {
  var _init = function () {
if (this._initialized)
  return
this._initialized = true

var that = this

this.list.forEach(function (cache) {
// NOTE: scene.add must come first, or .visible will always be reset to true.
  if (!cache.parent)
    MMD_SA.THREEX.scene.add(cache)
  cache.visible = false;
  if (!MMD_SA.THREEX.enabled) cache.children.forEach(function (c) { c.visible=false; });
});
  }

  var _reset = function () {
var that = this
this._initialized = false

var stay_on_scene = this.obj_base.stay_on_scene && MMD_SA_options.Dungeon.object_list.some(function (obj) { return obj.object_index==that.obj_base.index; });
this.index = this.list.length - 1
this.reusable_list = []
this.list.forEach(function (cache, idx) {
  that.reusable_list.push(idx)
  cache.visible = false;
  if (!MMD_SA.THREEX.enabled) cache.children.forEach(function (c) { c.visible=false; });
  if (!stay_on_scene)
    MMD_SA.THREEX.scene.remove(cache)
});
  }

  d.object_base_list.forEach(function (obj, idx) {
    if (obj.is_dummy) return

    var mesh
    if (obj.construction && !obj.path) {
      obj._mesh_id = (obj.character_index != null) ? "mikuPmx"+obj.character_index : obj.construction.mesh_obj.id
      obj._obj = MMD_SA_options.mesh_obj_by_id[obj._mesh_id]
      mesh = obj._obj._obj

      var geo_list = []
      if (mesh.geometry) {
        geo_list.push(mesh.geometry)
      }
      else {
        mesh.children.forEach(function (mesh_child) {
          if (mesh_child.geometry)
            geo_list.push(mesh_child.geometry)
        });
      }
      geo_list.forEach(function (geo) {
        if (obj.construction.boundingBox_list) {
          geo.boundingBox_list = []
          obj.construction.boundingBox_list.forEach(function (bb) {
if (bb == null) {
  geo.boundingBox_list.push(geo.boundingBox)
}
else {
  var b3 = new THREE.Box3().set(bb.min, bb.max)
  b3.oncollide = bb.oncollide
  b3.onaway = bb.onaway
  geo.boundingBox_list.push(b3)
}
          });
          if (geo.boundingBox_list.length == 1)
            geo.boundingBox = geo.boundingBox_list[0]
        }
        if (!geo.boundingBox) {
          geo.computeBoundingBox();
        }
        if (!geo.boundingSphere) {
          geo.boundingSphere = geo.boundingBox.getBoundingSphere(new THREE.Sphere());
        }
//console.log(geo.boundingBox)
      });
    }
    else {
      if (obj.path) {
        obj._obj = MMD_SA_options.x_object_by_name[obj.path.replace(/^.+[\/\\]/, "").replace(/\.x$/i, "")]
      }
      else {
        obj._mesh_id = "mikuPmx"+obj.character_index
        obj._obj = MMD_SA_options.mesh_obj_by_id[obj._mesh_id]
      }
      mesh = obj._obj._obj
    }

// to get bounding host
    obj._obj._obj_proxy = new d.Object3D_proxy_base(obj._obj);

    if (!mesh.useQuaternion) mesh.quaternion.setFromEuler(mesh.rotation)
    mesh.useQuaternion = true
    mesh.children.forEach(function (mesh_child) {
      if (!mesh_child.useQuaternion) mesh_child.quaternion.setFromEuler(mesh_child.rotation)
      mesh_child.useQuaternion = true
    });

    var geo = mesh.geometry || mesh.children[0].geometry
    if (obj.collision_by_mesh && !obj.collision_by_mesh_sort_range && MMD_SA_options.Dungeon.use_octree) {
      obj.collision_by_mesh_sort_range = 1;
    }

    if (obj.collision_by_mesh_sort_range) {
      if (!d.mesh_sorting_worker) {
d.use_local_mesh_sorting = true;
if (d.use_local_mesh_sorting) {
  d.mesh_sorting_worker = {
    tree: {}
  };
}
else {
}
      }

      let a, b, c, index, _array;
      let vertices = geo.vertices;
      let collision_by_mesh_material_index_max = obj.collision_by_mesh_material_index_max || 999;
// https://0fps.net/2015/01/23/collision-detection-part-3-benchmarks/
if (d.use_local_mesh_sorting) {
  if (MMD_SA_options.Dungeon.use_octree) {
    const THREEX = MMD_SA.THREEX.THREEX;
    const octree = new THREEX.Octree();
    octree.fromGraphNode( mesh );
    obj.octree = octree;

    d.mesh_sorting_worker.tree[idx] = {};
  }

  if (!d.use_octree) {
// compute face normal when necessary (mainly for PMX model)
    if (!geo.faces[0].normal.lengthSq()) geo.computeFaceNormals();

// https://github.com/mourner/rbush
    let tree = rbush();

    _array = [];
    for (let f = 0, fl = geo.faces.length; f < fl; f++) {
      const face = geo.faces[f];
      if (face.materialIndex >= collision_by_mesh_material_index_max) break;

      a = vertices[face.a];
      b = vertices[face.b];
      c = vertices[face.c];

      _array.push({
minX: Math.min(a.x, b.x, c.x),
minY: Math.min(a.z, b.z, c.z),
maxX: Math.max(a.x, b.x, c.x),
maxY: Math.max(a.z, b.z, c.z),
index: f
      });
    }

    tree.load(_array);
    d.mesh_sorting_worker.tree[idx] = tree;
  }
}
else {
}

      _array = undefined
    }

    obj.cache = {
  obj_base: obj
 ,index: -1
 ,reusable_list: []
 ,list: [mesh]

 ,_initialized: false
 ,init: _init
 ,reset: _reset
    };

// PC swap ready
    if (obj.character_index != null) {
Object.defineProperty(obj.cache.list, "0", {
  get: function () {
//console.log(Date.now())
    return MMD_SA_options.mesh_obj_by_id[obj._mesh_id]._obj
  }
});
    }

    if (obj.character_index != null) {
      THREE.MMD.getModels()[obj.character_index]._clone_cache = obj.cache
    }

    obj.cache_LOD_far = {
  obj_base: obj
 ,is_LOD_far: true
 ,index: -1
 ,reusable_list: []
 ,list: []

 ,_initialized: false
 ,init: _init
 ,reset: _reset
    };

    if (obj.LOD_far) {
      const THREE = MMD_SA.THREEX.THREE;

      obj.LOD_far.boundingBox = geo.boundingBox
      obj.LOD_far.center = geo.boundingBox.center()
      obj.LOD_far.size = geo.boundingBox.size()
      let mesh_far = new THREE.Mesh(new THREE.CubeGeometry(obj.LOD_far.size.x, obj.LOD_far.size.y, obj.LOD_far.size.z), new THREE.MeshBasicMaterial( { color:'#'+MMD_SA.THREEX.scene.fog.color.getHexString() } ));
      mesh_far.visible = false
      MMD_SA.THREEX.scene.add(mesh_far)

      mesh_far.useQuaternion = true

      obj.cache_LOD_far.list.push(mesh_far)
    }
  });
})();

  MMD_SA.SpeechBubble.list.forEach(m=>{ m.renderDepth = 9999999 * ((!MMD_SA.THREEX.enabled) ? -1 : 1); });
  MMD_SA.SpeechBubble.list.forEach(b=>b.bubbles.forEach(b=>{
    b.pos_mod = [0,-2.5,0]
  }));

  d.grid_blocks = {
    objs: []
   ,xy: []

   ,hide: function () {
this.objs.forEach(function (obj) {
  obj._obj.visible = false
});
    }

   ,update: (function () {
//var xy = []
//var area_id = ""
var xy_list = [
[-1,-1], [ 0,-1], [ 1,-1],
[-1, 0],          [ 1, 0],
[-1, 1], [ 0, 1], [ 1, 1]
];
var pos_grid = { x:0, y:0, z:0 }

var v3a, v3b, v3c
v3a = new THREE.Vector3()
v3b = new THREE.Vector3()
v3c = new THREE.Vector3()

return function (pos) {
  var d = MMD_SA_options.Dungeon
  var grid_size = d.grid_size
  var gs_half = grid_size/2
  var map_w_max = d.RDG_options.width
  var map_h_max = d.RDG_options.height

  d.grid_blocks.objs[d.grid_blocks.objs.length-1]._obj.visible = (d.ceil_material_index_default != -1)

  var _x = Math.floor((pos.x) / grid_size)
  var _y = Math.floor((pos.z) / grid_size)
/*
  var xy_unchanged = (area_id == d.area_id) && (_x == xy[0]) && (_y == xy[1])
  area_id = d.area_id
  xy[0] = _x
  xy[1] = _y
*/
  xy_list.forEach(function (_xy, idx) {
    var x = _xy[0] + _x
    var y = _xy[1] + _y
    var c = v3a.set((x+0.5)*grid_size, 0, (y+0.5)*grid_size)
    var ground_y = 999

    var obj = d.grid_blocks.objs[idx]._obj
    var geo = obj.geometry

    var update
    if ((x < 0) || (x >= map_w_max) || (y < 0) || (y >= map_h_max) || (d.grid_array[y][x] == 1)) {
      update = true
    }
    else {
      ground_y = d.get_ground_y({x:(x*grid_size), y:0, z:(y*grid_size)}, -999)
      if (ground_y > pos.y+10) {
        update = true
      }
    }

    if (update) {
      obj.position.copy(c)
      geo.boundingBox.set(v3b.set(-gs_half, -999, -gs_half), v3c.set(gs_half, ground_y, gs_half))
// it will be updated in .check_collision() as a boundingSphere-hit object
//      obj.updateMatrixWorld()
      obj.visible = true
    }
    else {
      obj.visible = false
    }
  });
};
    })()

  };

  for (var i = 0; i < 8+1; i++) {
    var block = new THREE.Object3D()
    block.useQuaternion = true
    block.geometry = {
      boundingSphere: new THREE.Sphere()
     ,boundingBox: new THREE.Box3()
    };
    block.geometry.boundingSphere.radius = 999
    block.geometry.boundingBox_list = [block.geometry.boundingBox]

    var obj = {
      _mesh: block
     ,_obj: block
     ,skip_ground_obj_check: true
// dummy
     ,_obj_base: {}
    };
    obj._obj_proxy = new d.Object3D_proxy_base(obj);

    d.grid_blocks.objs[i] = obj
  }

};
})();
