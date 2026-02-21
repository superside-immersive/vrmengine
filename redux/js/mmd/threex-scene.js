/**
 * THREEX Scene sub-module — extracted from MMD_SA.js THREEX IIFE (R3).
 * Contains mesh_obj system (create/get/set), GOML head/scene list processing,
 * x_object loading, and preload list handling.
 * @param {Object} TX - Shared state object with getter/setter proxies to THREEX closure vars.
 * @returns {{ mesh_obj: Object }} mesh_obj property for threeX
 */
window.MMD_SA_createTHREEX_Scene = function(TX) {
  return {
    mesh_obj: (function () {
      function mesh_obj(id, obj) {
this.id = id
this._obj = obj

mesh_obj_by_id[id] = this
      }

      mesh_obj.prototype.three = function () {
return this._obj;
      };

      mesh_obj.prototype.show = function () {
this._obj.visible = true;
if (!TX.threeX.enabled) {
  this._obj.traverse(c=>{
    if (c.isMesh) c.visible = true;
  });
}
      };

      mesh_obj.prototype.hide = function () {
this._obj.visible = false;
if (!TX.threeX.enabled) {
  this._obj.traverse(c=>{
    if (c.isMesh) c.visible = false;
  });
}
      };

      const mesh_obj_by_id = {};

      let mesh_obj_list = [];

      window.addEventListener("jThree_ready", () => {
const THREE = TX.threeX.THREE;

const img_dummy = (MMD_SA.THREEX.enabled) ? null : document.createElement('canvas');
if (!MMD_SA.THREEX.enabled) img_dummy.width = img_dummy.height = 1;

MMD_SA_options.x_object.forEach((x_obj, idx) => {
  if (!x_obj.path) return

// separating url and toFileProtocol(url) here, but x_obj.path is almost always a zip url, so they are effectively the same anyways (i.e. not a blob url)
  const url = x_obj.path;
  new THREE.XLoader( toFileProtocol(url), function( mesh ) {
var model_filename = toLocalPath(url).replace(/^.+[\/\\]/, "")
var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.x$/, ".x").replace(/[\-\_]v\d+\.x$/, ".x")
var model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || {}

const _mesh = mesh;
mesh = new THREE.Object3D()
mesh.add(_mesh)
//console.log(mesh)

let material_para = model_para.material_para || {}
material_para = material_para._default_ || {}
if (material_para.receiveShadow != false)
  mesh.receiveShadow = true

if (MMD_SA.THREEX.enabled) {
}
else {
  if (model_para.instanced_drawing)
    mesh.instanced_drawing = model_para.instanced_drawing
//  mesh.instanced_drawing = 99

  mesh.useQuaternion = true
}

TX.threeX.mesh_obj.set("x_object" + idx, mesh)

mesh.scale.set(0,0,0)

//console.log(mesh)
MMD_SA.fn.setupUI()
  }, function() {
  });
});

MMD_SA.GOML_head_list.sort((...ab)=>{
  const score = [];
  ab.forEach((obj,i)=>{
    switch (obj.tag) {
      case 'txr':
        score[i] = -3;
        break;
      case 'geo':
        score[i] = -2;
        break;
      default:
        score[1] = 0;
    }
  });

  return score[0] - score[1];
});

var mtl_id_used = {};

MMD_SA.GOML_head_list.forEach(obj=>{
  if (obj.tag == 'txr') {
// { tag:'txr', id:'DungeonPlane'+i+'TXR', src:p_obj.map, para:{ repeat:[1,1] } }
    const tex = new THREE.Texture(img_dummy);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    if (obj.para.repeat) tex.repeat.set(...obj.para.repeat);
    if (MMD_SA.THREEX.enabled) tex.colorSpace = THREE.SRGBColorSpace;

    const img = new Image();
    img.onload = ()=>{
      tex.image = img;
      tex.needsUpdate = true;
      MMD_SA.fn.setupUI();
    };
    img.src = toFileProtocol(obj.src);

    TX.threeX.mesh_obj.set(obj.id, tex, true);
  }
  else if (obj.tag == 'geo') {
// { tag:'geo', id:'DungeonGEO_' + (geo), type:'Plane', para:[1,1, parseInt(RegExp.$1),parseInt(RegExp.$2)] }
    const geo = new THREE[obj.type + 'Geometry'](...obj.para);
    TX.threeX.mesh_obj.set(obj.id, geo, true);
    MMD_SA.fn.setupUI();
  }
  else if (obj.tag == 'mtl') {
// { tag:'mtl', id:'DungeonPlane'+i+'MTL', type:'MeshPhong', para:mtl_param_common, para_extra:mtl_param_common_extra }
/*
  var mtl_param_common = {};
  if (p_obj.opacity == null) mtl_param_common.transparent = false;
//'renderOrder' : 'renderDepth'
  if (p_obj.renderDepth != null) mtl_param_common.renderDepth = p_obj.renderDepth;
  if (p_obj.side) mtl_param_common.side = p_obj.side;
  if (p_obj.map) mtl_param_common.map = 'DungeonPlane'+p_obj.map_id+'TXR';
  if (p_obj.normalMap) mtl_param_common.normalMap = 'DungeonPlane'+p_obj.normalMap_id+'TXR_N';
//'color' : 'ambient'
  if (p_obj.ambient) mtl_param_common.ambient = p_obj.ambient;
  if (p_obj.specularMap) {
    mtl_param_common.specularMap = 'DungeonPlane'+p_obj.specularMap_id+'TXR_S';
    mtl_param_common.specular = '#FFFFFF';
  }
  else {
    if (p_obj.specular) mtl_param_common.specular = p_obj.specular;
  }
  if (p_obj.emissive) mtl_param_common.emissive = p_obj.emissive;
*/
    const mtl = new THREE[obj.type + 'Material']();

    if (MMD_SA.THREEX.enabled) {
      if (obj.renderDepth) {
        obj.renderOrder = obj.renderDepth;
        delete obj.renderDepth;
      }
      if (obj.ambient) {
        obj.color = obj.ambient;
        delete obj.ambient;
      }
    }

    const mtl_id_used_count = mtl_id_used[obj.id]||0;
    mtl_id_used[obj.id] = mtl_id_used_count + 1;

    for (const map of ['map', 'normalMap', 'specularMap', 'displacementMap']) {
      if (obj.para[map])
        obj.para[map] = TX.threeX.mesh_obj.get_three(obj.para[map]);
// a workaround for material.repeat trick in old THREE
      if (!MMD_SA.THREEX.enabled && (map == 'map') && (mtl_id_used_count > 0)) {
console.log('THREEX: Texture cloned (' + obj.id + '.' + map + ')');
        obj.para[map] = obj.para[map].clone();
      }
//if (map != 'map') delete obj.para[map];
    }

    for (const color of ['color', 'ambient', 'specular', 'emissive']) {
      if (obj.para[color]) {
        if (mtl[color] != null) {
          obj.para[color] = mtl[color].set(obj.para[color]);
        }
        else {
console.error('THREEX error: No .' + color + ' in material');
          delete obj.para[color];
        }
      }
    }

    Object.assign(mtl, obj.para, obj.para_extra);

    TX.threeX.mesh_obj.set(obj.id, mtl, true);
    MMD_SA.fn.setupUI();
  }
});

MMD_SA.GOML_scene_list.forEach(obj=>{
  if (obj.tag == 'mesh') {
// { tag:'mesh', id:'DungeonPlane'+i+'MESH_LV'+lvl, geo:'DungeonGEO_'+geo_id, mtl:'DungeonPlane'+i+'MTL' + ((p_obj.displacementMap && (geo_id != "1x1"))?'_D':''), instanced_drawing:instanced_drawing||null, style:{ scale:0, opacity:p_obj.opacity||null } }
    const mesh = new THREE.Mesh();
    mesh.geometry = TX.threeX.mesh_obj.get_three(obj.geo);
    mesh.material = TX.threeX.mesh_obj.get_three(obj.mtl);
    if (obj.instanced_drawing && !MMD_SA.THREEX.enabled)
      mesh.instanced_drawing = obj.instanced_drawing;
    if (obj.style.scale != null)
      mesh.scale.setScalar(obj.style.scale);
    if (obj.style.opacity != null)
      mesh.opacity = obj.style.opacity;

    TX.threeX.mesh_obj.set(obj.id, mesh);
  }
});
      });

      let scene_obj_waiting_list = [];

      window.addEventListener("GOML_ready", () => {
scene_obj_waiting_list.forEach(obj=>{
  TX.threeX.scene.add(obj);
  obj.visible = false;
});
scene_obj_waiting_list.length = 0;

MMD_SA_options.mesh_obj_preload_list.forEach(obj => {
  TX.threeX.mesh_obj.set(obj.id, obj.create())
});
      });

      return {
get: function (id) {
  id = id.replace(/^\#/, '');
  return mesh_obj_by_id[id] || jThree('#' + id);
},

get_three: function (id) {
  return this.get(id).three(0);
},

set: function (id, obj, skip_scene) {
  new mesh_obj(id, obj)

  if (!skip_scene) {
    if (TX.threeX.scene) {
      TX.threeX.scene.add(obj)
      obj.visible = false
    }
    else {
      scene_obj_waiting_list.push(obj);
    }
  }

  return obj
}
      };
    })()
  };
};
