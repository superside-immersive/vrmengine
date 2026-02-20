// MMD_SA VFX — visual effects system (aura, ring effects etc.)
// Extracted from MMD_SA.js (VFX section inside Sprite IIFE)

/**
 * Create the VFX subsystem.
 * Returns the VFX object used inside MMD_SA.Sprite.
 * All referenced names (MMD_SA, MMD_SA_options, THREE) are globals.
 * @returns {object}
 */
window.MMD_SA_createVFX = function () {
  var VFX = (function () {
    var obj_list = {};

    return {
      FX: (function () {
        function FX(fx, mesh, para) {
this.FX = fx
this.sprite = mesh
this.para = para

this.animator = new Animator(this)
        }

        function Animator(obj) {
this.parent = obj
        }

        Animator.prototype.reset = function () {
function reset_material(obj) {
  if (obj.children) {
    obj.children.forEach((c) => {
      reset_material(c)
    });
  }
  if (obj.material) {
    obj.material.opacity = 1
  }
}

this.animation_data = { time:0 }

reset_material(this.parent.sprite)
        };

        Animator.prototype.update = function (ms) {
this.parent.FX.animate(this.parent, ms, this.animation_data)
        };

        return function (obj_name, init, _init_3D, _create, animate) {
this.obj_name = obj_name

if (!obj_list[obj_name])
  obj_list[obj_name] = []

this.obj_list = obj_list[obj_name]

this.init = init;

this.init_3D = (function () {
  var initialized = false;
  return function () {
    if (initialized) return
    initialized = true

    _init_3D.call(this)
  };
})();

this.create = function (para) {
  this.init_3D()

  var mesh = _create.call(this, para)

  if (!MMD_SA.THREEX.enabled) mesh.useQuaternion = true;

  MMD_SA.THREEX.scene.add(mesh)

  var obj = new FX(this, mesh, para);
  this.obj_list.push(obj)
//DEBUG_show(this.obj_list.length,0,1)
  return obj
};

this.animate = animate;
        };
      })(),

      init: function () {
var txr_preload_list = {}

for (let name in this.list) {
  let fx = this.list[name]
  fx.init()

  if (fx.txr_preload_list)
    Object.assign(txr_preload_list, fx.txr_preload_list)
}

window.addEventListener('jThree_ready', ()=>{
  for (let name in txr_preload_list) {
    let ss = txr_preload_list[name]
    MMD_SA.THREEX.mesh_obj.set(name, MMD_SA.load_texture(ss.url), true);
  }
});
      },

      animate: function (name, para) {
var fx = VFX.list[name]
var obj_list = fx.obj_list

var obj_free = (para.id && obj_list.find(obj => (obj.para.id == para.id))) || obj_list.find(obj => !obj.sprite.visible);

var obj_needs_reset
if (!obj_free) {
  obj_free = fx.create(para)
  obj_needs_reset = true
}
else {
  obj_needs_reset = !obj_free.sprite.visible
}

obj_free.para = para

obj_free.sprite.visible = true

if (para.pos)
  obj_free.sprite.position.copy(para.pos)
para._pos = (para._pos || new THREE.Vector3()).copy(obj_free.sprite.position)

if (obj_needs_reset) {
  obj_free.animator.reset()
}

return obj_free;
      },

      get obj_list() {
var _obj_list = []
for (let name in obj_list) {
  _obj_list = _obj_list.concat(obj_list[name])
}

return _obj_list
      },
    };
  })();

  VFX.list = (function () {
    return {
      "aura01": new VFX.FX(
        "aura01",
// init
        function () {
this.txr_preload_list = {
  "aura01_TXR": { url:System.Gadget.path + '/images/sprite_sheet.zip#/texture/shockwave' + ((webkit_transparent_mode) ? '-transparent' : '') + '_min.png' },
};
        },
// init_3D
        function () {
const THREE = MMD_SA.THREEX.THREE;

// THREE.CylinderGeometry = function ( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded )
this.geo = new THREE.CylinderGeometry( 15, 10, 5, 8*2, 1, true );
this.geo.applyMatrix(new THREE.Matrix4().setPosition(new THREE.Vector3().set(0, 2.5, 0)));
/*
this.geo.faceVertexUvs[ 0 ].forEach((v) => {
  v.forEach((uv) => {
    uv.x *= 80
  });
});
*/
this.tex = MMD_SA.THREEX.mesh_obj.get_three("aura01_TXR");
this.tex_repeat_x = 4
        },
// create
        function () {
const THREE = MMD_SA.THREEX.THREE;

var tex = this.tex.clone()
tex.repeat.x = this.tex_repeat_x
tex.wrapS = THREE.RepeatWrapping;
//tex.wrapT =
tex.needsUpdate = true

var mesh = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({
  map:tex,
  blending: (webkit_transparent_mode) ? THREE.NormalBlending : THREE.AdditiveBlending,
//  side:/*THREE.BackSide*/THREE.DoubleSide,
  transparent:true,
}));

if (!MMD_SA.THREEX.enabled) mesh.useQuaternion = true;

//console.log(mesh)
//return mesh

mesh.material.side = THREE.BackSide
var mesh2 = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({
  map:tex,
  blending: (webkit_transparent_mode) ? THREE.NormalBlending : THREE.AdditiveBlending,
//  side:/*THREE.BackSide*/THREE.DoubleSide,
  transparent:true,
}));

if (!MMD_SA.THREEX.enabled) mesh2.useQuaternion = true;

mesh2.scale.set(1.001,1,1.001);

Object.defineProperty(mesh, "visible", (function () {
  var visible = mesh.visible;
  return {
    get: function () {
      return visible && this.parent.visible;
    },
    set: function (v) { visible = v; },
  };
})());

Object.defineProperty(mesh2, "visible", (function () {
  var visible = mesh2.visible;
  return {
    get: function () {
      return visible && this.parent.visible;
    },
    set: function (v) { visible = v; },
  };
})());

var obj = new THREE.Object3D();

if (!MMD_SA.THREEX.enabled) obj.useQuaternion = true;

obj.add(mesh);
obj.add(mesh2);
return obj;
        },
// animate
        function (obj, ms, data) {
//DEBUG_show(ms)

if (!data.mod) {
  data.mod = 1
  data.uv_y = 0.5
  data.uv_y_limit = 1
}

data.time += ms

data.uv_y += ms/1000 *2 * data.mod
var condition = (data.mod > 0) ? (data.uv_y >= data.uv_y_limit) : (data.uv_y <= data.uv_y_limit);
if (condition) {
  data.uv_y = data.uv_y_limit
  data.mod = -data.mod
  data.uv_y_limit = (data.mod > 0) ? 1 - Math.random()*0.1 : 0.4 + Math.random()*0.1;
}

var tex = obj.sprite.children[0].material.map
tex.repeat.set(this.tex_repeat_x, 1/data.uv_y)
//tex.offset.set(0,(1-data.uv_y))

obj.sprite.quaternion.setFromEuler(MMD_SA.TEMP_v3.set(0, (data.time/1000*0.5)%1, 0).multiplyScalar(Math.PI*2))
        },
      ),

      "aura_ring01": new VFX.FX(
        "aura_ring01",
// init
        function () {
this.txr_preload_list = {
  "aura01_TXR": { url:System.Gadget.path + '/images/sprite_sheet.zip#/texture/shockwave' + ((webkit_transparent_mode) ? '-transparent' : '') + '_min.png' },
};
        },
// init_3D
        function () {
const THREE = MMD_SA.THREEX.THREE;

// THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength )
this.geo = new THREE.RingGeometry( 5, 10, 8*2, 1 );
this.geo.applyMatrix(new THREE.Matrix4().makeRotationFromEuler(new THREE.Vector3().set(-Math.PI/2, 0, 0)));

this.tex = MMD_SA.THREEX.mesh_obj.get_three("aura01_TXR");
this.tex_repeat_x = 8
        },
// create
        function () {
var tex = this.tex.clone()
tex.repeat.x = this.tex_repeat_x
tex.wrapS = THREE.RepeatWrapping;
//tex.wrapT = 
tex.needsUpdate = true

var mesh = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({
  map:tex,
  blending: (webkit_transparent_mode) ? THREE.NormalBlending : THREE.AdditiveBlending,
//  side:THREE.BackSide,//THREE.DoubleSide,
  transparent:true,
}));

if (!MMD_SA.THREEX.enabled) mesh.useQuaternion = true;

//console.log(mesh)
return mesh
        },
// animate
        function (obj, ms, data) {
//DEBUG_show(ms)

if (!data.duration) {
  let p = obj.para.custom || {}
  data.duration = p.duration || 1000*10
  data.scale_min = p.scale_min || 1
  data.scale_max = p.scale_max || 30
//DEBUG_show(data.duration,0,1)
}

data.time += ms
//return

var t = (data.duration - data.time) / data.duration
if (t <= 0) {
  obj.sprite.visible = false
  return
}

var scale = data.scale_min + (1-t)*(data.scale_max-data.scale_min)
obj.sprite.scale.set(scale,scale,scale)

var opacity = 0.25 + Math.pow(t, 0.5)*0.75
var material = obj.sprite.material
material.opacity = opacity

var tex = material.map
tex.repeat.set(this.tex_repeat_x, 1)
//tex.offset.set(0,(1-data.uv_y))
        },
      ),
    };
  })();


  VFX.init();
  return VFX;
};
