/**
 * THREEX Model sub-module — extracted from MMD_SA.js THREEX IIFE (R3).
 * Contains Model_obj class (with Animation inner class), MMD_dummy_obj,
 * find_bone / get_MMD_bone_parent, and internal MMD (PMX) loader.
 * @param {Object} TX - Shared state object with getter/setter proxies to THREEX closure vars.
 * @returns {{ Model_obj: Function, MMD_dummy_obj: Function, MMD: Object }}
 */
window.MMD_SA_createTHREEX_Model = function(TX) {

  const Model_obj = (function () {
    class Animation {
      #_enabled = false;

      #_mixer;

      clips = [];
      actions = [];

      get enabled() {
return this.#_enabled;
      }

      set enabled(v) {
this.#_enabled = !!v;

const THREE = MMD_SA.THREEX.THREE;

if (v) {
  this._motion_index = TX._THREE.MMD.getModels()[this.model.index].skin._motion_index;
  this.play();

  System._browser.on_animation_update.add(()=>{MMD_SA.motion_player_control.enabled = true;}, 0,1);
}
else {
  this.stop();
}
      }

      get mixer() {
const THREE = MMD_SA.THREEX.THREE;

if (!this.#_mixer) {
  this.#_mixer = new THREE.AnimationMixer(this.model.mesh);
}
return this.#_mixer;
      }

      get has_clip() { return this.clips.length; }

      get action() { return this.actions[this.action_index]; }

      get motion_index() {
return (this.enabled) ? this.action_index : TX._THREE.MMD.getModels()[this.model.index].skin._motion_index;
      }

      get time() {
return (this.enabled) ? this.action.time : TX._THREE.MMD.getModels()[this.model.index].skin.time;
      }

      get duration() {
return (this.enabled) ? this.action.getClip().duration : TX._THREE.MMD.getModels()[this.model.index].skin.duration;
      }

      add_clip(clip)  {
this.stop();

const action = this.mixer.clipAction( clip );
if (this.actions.indexOf(action) == -1) {
  this.action_index = this.actions.length;
  this.actions.push(action);
}
if (this.clips.indexOf(clip) == -1) this.clips.push(clip);

this.play();
      }

      action_index = -1;
      find_action_index(name) {
//this.mixer.existingAction(name)
return this.actions.findIndex(action=>action._clip.name==name);
      }

      play(index = this.action_index) {
if (index > -1) {
  this.action_index = index;
  this.actions[index].paused = false;
  this.actions[index].play();
}
      }

      pause(index = this.action_index) {
//  this.actions.forEach(action=>{ action.play(); });
if (index > -1) {
  this.action_index = index;
  this.actions[index].paused = true;
}
      }

      stop(index = this.action_index) {
if (index > -1) {
  this.actions[index].stop();
}
else {
  this.mixer.stopAllAction();
}
      }

      clear() {
var mixer = this.mixer;

mixer.stopAllAction();
this.action_index = -1;
this.clips.forEach(clip=>{ mixer.uncacheClip(clip); });
this.clips = [];
this.actions = [];
      }

      constructor(model) {
this.model = model;
      }
    }

    return function (index, model, para) {
this.index = this.index_default = index;

if (model)
  this.model = model;
if (para)
  this.para = para;

this.animation = new Animation(this);

/*
 define the following properties on each inherited class
.mesh
.is_T_pose
.use_tongue_out
.get_bone_by_MMD_name()
.update_model()
*/

TX.models[index] = this
    };
  })();

  const MMD_dummy_obj = function (index) {
Model_obj.call(this, index);
  };

// three-vrm 1.0
  const use_VRM1 = TX.use_VRM1;

  Model_obj.prototype = {
    constructor: Model_obj,

    get model_scale() {
return this.mesh.scale.y;
    },

    get model_para() {
if (!TX.threeX.enabled) return MMD_SA_options.model_para_obj_all[this.index];

return MMD_SA_options.THREEX_options.model_para[this.model_path.replace(/^.+[\/\\]/, '')] || {};
    },

    get model_path() {
if (!TX.threeX.enabled) {
  return decodeURIComponent((MMD_SA.MMD_started) ? this.model.pmx.url : ((this.index == 0) ? MMD_SA_options.model_path : MMD_SA_options.model_path_extra[this.index-1]));
}

return decodeURIComponent((MMD_SA.MMD_started) ? this.para.url : ((this.index == 0) ? MMD_SA_options.THREEX_options.model_path : MMD_SA_options.THREEX_options.model_path_extra[this.index-1]));
    },

    para: (()=>{
      const handler = {
        get(obj, prop) {
return MMD_SA_options.model_para_obj[prop];
        },
      };

      return new Proxy({}, handler);
    })(),

    get_bone_origin_by_MMD_name: (()=>{
      let v1, v2;
      window.addEventListener('jThree_ready', ()=>{
v1 = new TX.THREE.Vector3();
v2 = new TX.THREE.Vector3();
      });

      return function (name, root_origin) {
if (TX.threeX.enabled && !root_origin) {
  const VRM = TX.VRM;
  return this.para.pos0[VRM.bone_map_MMD_to_VRM[name]]?.slice().map(v=>v*this.model_scale);
}

let b = (!TX.threeX.enabled) ? this.get_bone_by_MMD_name(name) : TX._THREE.MMD.getModels()[0].mesh.bones_by_name[name];
if (!b) return null;
if (!root_origin) return b.pmxBone.origin;

v1.fromArray(b.pmxBone.origin);
while (b.parent?.pmxBone) {
  b = b.parent;
  v1.sub(v2.fromArray(b.pmxBone.origin));
}

return v1.toArray();
      };
    })(),

    get_bone_position_by_MMD_name: function (name, local_only) {
var bone = this.get_bone_by_MMD_name(name);
if (!bone) return null;

const is_MMD_dummy = (this.type=='MMD_dummy');
const bone_matrix = (is_MMD_dummy) ? bone.skinMatrix : bone.matrixWorld;

const pos = new TX.THREE.Vector3().setFromMatrixPosition(bone_matrix);

if (local_only) {
  if (!is_MMD_dummy)
    pos.sub(this.mesh.position).applyQuaternion(TX.q1.copy(this.mesh.quaternion).conjugate());
}
else {
  if (is_MMD_dummy)
    pos.applyQuaternion(this.mesh.quaternion).add(this.mesh.position);
}

return pos;
    },

    get_bone_rotation_by_MMD_name: (function () {
      var _m1, _q1;
      window.addEventListener('jThree_ready', ()=>{
const THREE = MMD_SA.THREEX.THREE;
_m1 = new THREE.Matrix4();
_q1 = new THREE.Quaternion();
      });

      return function (name, local_only) {
var bone = this.get_bone_by_MMD_name(name);
if (!bone) return null;

const is_MMD_dummy = (this.type=='MMD_dummy');
//if (parent_only) bone = bone.parent;
const bone_matrix = (is_MMD_dummy) ? bone.skinMatrix : bone.matrixWorld;

const rot = new TX.THREE.Quaternion().setFromRotationMatrix(_m1.extractRotation(bone_matrix));
// multiply, instead of premultiply
if (!is_MMD_dummy && !this.is_VRM1) rot.multiply(_q1.set(0,-1,0,0));

if (local_only) {
  if (!is_MMD_dummy)
    rot.premultiply(_q1.copy(this.mesh.quaternion.conjugate()))
}
else {
  if (is_MMD_dummy)
    rot.premultiply(this.mesh.quaternion)
}

return rot;
      };
    })(),

    get_MMD_bone_parent: (function () {
const MMD_bone_tree = { name:'センター', children: [
  { name:'上半身', children: [
    { name:'上半身2', children: [
      { name:'上半身3', children: [
        { name:'首', children: [
          { name:'頭', children: [
            { name:'目', children: [
            ]},
          ]},
        ]},
        { name:'肩', children: [
          { name:'腕', children: [
            { name:'ひじ', children: [
              { name:'手首', children: [
                { name:'親指０', children: [
                  { name:'親指１', children: [
                    { name:'親指２', children: [
                    ]},
                  ]},
                ]},
                { name:'人指１', children: [
                  { name:'人指２', children: [
                    { name:'人指３', children: [
                    ]},
                  ]},
                ]},
                { name:'中指１', children: [
                  { name:'中指２', children: [
                    { name:'中指３', children: [
                    ]},
                  ]},
                ]},
                { name:'薬指１', children: [
                  { name:'薬指２', children: [
                    { name:'薬指３', children: [
                    ]},
                  ]},
                ]},
                { name:'小指１', children: [
                  { name:'小指２', children: [
                    { name:'小指３', children: [
                    ]},
                  ]},
                ]},
              ]},
            ]},
          ]},
        ]},
      ]},
    ]},
  ]},
  { name:'足', children: [
    { name:'ひざ', children: [
      { name:'足首', children: [
        { name:'足先EX', children: [
        ]},
      ]},
    ]},
  ]},
]};

function find_bone(name, tree, tree_parent) {
  tree = tree || MMD_bone_tree;
  if (name) {
    if (tree.name == name)
      return tree;
  }
  else {
    if (tree_parent)
      tree.parent = tree_parent;
  }

  for (const tree_child of tree.children) {
    const _tree = find_bone(name, tree_child, tree);
    if (_tree)
      return _tree;
  }
}

find_bone();

      return function (name) {
let dir = name.charAt(0);
if (dir == '左' || dir == '右') {
  name = name.substring(1, name.length);
}
else {
  dir = '';
}

let bone_parent = find_bone(name);

const b = this.mesh.bones_by_name;

do {
  bone_parent = bone_parent.parent;
}
while (bone_parent && !b[bone_parent.name] && !b[dir+bone_parent.name]);

// console.log(name, bone_parent && bone_parent.name, bone_parent && (b[bone_parent.name] || b[dir+bone_parent.name]))
return bone_parent && (b[bone_parent.name] || b[dir+bone_parent.name]);
      };
    })(),

    resetPhysics: function () {
if (TX.threeX.enabled) {
//  if (this.type == 'VRM') {}
}
else {
  this.model.resetPhysics();
}
    },

    update_model: function () {}
  };

  MMD_dummy_obj.prototype = Object.create( Model_obj.prototype );

  Object.defineProperties(MMD_dummy_obj.prototype, {
    type: {
      value: 'MMD_dummy'
    },

    is_T_pose: {
      value: false
    },

    use_tongue_out: {
      get: function () { return (MMD_SA_options.model_para_obj.facemesh_morph['ぺろっ']?.name in this.model.pmx.morphs_index_by_name); },
    },

    model: {
      get: function () { return TX._THREE.MMD.getModels()[this.index]; }
    },

    mesh: {
      get: function () { return this.model.mesh; }
    },

    getBoneNode: {
      get: function () { return this.get_bone_by_MMD_name; }
    },

    get_bone_by_MMD_name: {
      value: function (name) { return this.mesh.bones_by_name[name]; }
    }
  });


// MMD (PMX loader) START
  const MMD = (function () {

    function init() {
      if (TX.THREE.MMDAnimationHelper) {
        TX.data.MMDAnimationHelper = new TX.THREE.MMDAnimationHelper();
        TX.data.MMDAnimationHelper_clock = new TX.THREE.Clock();
      }
    }

    function PMX_object(index, pmx, para) {
Model_obj.call(this, index, pmx, para);
this.mesh = pmx;

if (!MMD_SA.MMD_started)
  pmx_list.push(this)
    }

    PMX_object.prototype = Object.create( Model_obj.prototype );

    Object.defineProperties(PMX_object.prototype, {
      type: {
        value: 'PMX'
      },

      is_T_pose: {
        value: false
      },

      getBoneNode: {
        get: function () { return this.get_bone_by_MMD_name; }
      },

      get_bone_by_MMD_name : {
        value: function (name) {
return this.bones_by_name[name];
        }
      },

      update_model: {
        value: function () {
var mesh = this.mesh
//mesh.matrixAutoUpdate = false

// bone START

var mesh_MMD = TX._THREE.MMD.getModels()[0].mesh
var bones_by_name = mesh_MMD.bones_by_name

mesh.position.copy(mesh_MMD.position);
mesh.quaternion.copy(mesh_MMD.quaternion);

TX.data.MMDAnimationHelper && TX.data.MMDAnimationHelper.update(TX.data.MMDAnimationHelper_clock.getDelta());
        }
      }
    });

    var pmx_list = [];

    return {
      get pmx_list() { return pmx_list; },
      set pmx_list(v) { pmx_list = v; },

      init: init,

      load: async function (url, para) {
MMD_SA.fn.load_length_extra++

var url_raw = url;
var model_filename = url.replace(/^.+[\/\\]/, '')

var object_url;
await new Promise((resolve) => {
  if (!/\.zip\#/i.test(url)) {
    url = toFileProtocol(url)
    resolve()
    return
  }

  System._browser.load_file(url, function(xhr) {
    object_url = url = URL.createObjectURL(xhr.response);
    resolve();
  }, 'blob', true);
});

const loader = new TX.THREE.MMDLoader();

loader.loadWithAnimation(

  // URL of the PMX you want to load
  url,
System.Gadget.path + '/MMD.js/motion/demo/after_school_stride/after_school_stride.vmd',

  function ( mmd ) {
const mesh = mmd.mesh

TX.data.MMDAnimationHelper && TX.data.MMDAnimationHelper.add( mmd.mesh, { animation:mmd.animation, physics:false } );

if (MMD_SA_options.use_shadowMap) {
  mesh.castShadow = true
}

TX.data.scene.add( mesh );
console.log(mesh)

var pmx_obj = new PMX_object(para.pmx_index, mesh, { url:url_raw });

var bones_by_name = {}
mesh.skeleton.bones.forEach(b=>{
  bones_by_name[b.name] = b;
});

pmx_obj.bones_by_name = bones_by_name;

var obj = Object.assign({
  data: pmx_obj,
  obj: mesh,
  get parent() { return this.get_parent(); },

  no_scale: true,
}, para);//, MMD_SA_options.THREEX_options.model_para[model_filename]||{});

TX.obj_list.push(obj)

if (object_url) {
  URL.revokeObjectURL(object_url)
}

MMD_SA.fn.setupUI()

  },

  // called while loading is progressing
  (progress) => {},

  // called when loading has errors
  (error) => console.error(error)

);
      },

    };
  })();
// MMD END

  return { Model_obj, MMD_dummy_obj, MMD };
};
