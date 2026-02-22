// threex-gui.js - GUI and load_scripts extracted from MMD_SA.js
// Part of Etapa 10E refactoring

window.MMD_SA_createTHREEX_GUI = function(TX) {
  return {
    GUI: {
      obj: {},

      create: function () {
const gui = new TX.THREE.GUI();

const host = SL_Host;
host.appendChild(gui.domElement);
gui.domElement.addEventListener('mousedown', (e)=>{
//  e.preventDefault();
  e.stopPropagation();
});

gui.domElement.addEventListener('click', (e)=>{ e.stopPropagation(); });
document.addEventListener('click', (e)=>{
  let d = document.activeElement;
  while (d) {
    d = d.parentElement;
    if (d == gui.domElement) {
      document.activeElement.blur();
//DEBUG_show(Date.now())
    }
  }
});

gui.add({
  'Hide Controls': function () {
    gui.hide();
  },
}, 'Hide Controls');
console.log(gui);

gui.hide();

return gui;
      },

      update: function (gui) {
gui.controllers.forEach(c=>{
  const v = c.object[c._name];
  if (typeof c != 'function')
    c.setValue(v);
});
      },

      init: async function () {
const GUI = await import(System.Gadget.path + '/three.js/libs/lil-gui.module.min.js');
TX.THREE.GUI = GUI.GUI;

const gui = this.obj.visual_effects = this.create();

const gui_light_and_camera = gui.addFolder( 'Light and camera' );

window.addEventListener('MMDStarted', (()=>{
  function update_tray() {
    function f() {
      if (System._browser.camera.initialized) {
        System._browser.update_tray();
      }
      else {
        MMD_SA.reset_camera();
      }
    }

    System._browser.on_animation_update.remove(f, 0);
    System._browser.on_animation_update.add(f, 0,0);
  }

  function reset_camera() {
    function f() {
      System._browser.camera._update_camera_reset();
    }

    MMD_SA.reset_camera();
    System._browser.on_animation_update.remove(f, 1);
    System._browser.on_animation_update.add(f, 1,1);
  }

  return ()=>{
let dir_light_pos = MMD_SA_options._light_position;
TX.threeX.light.params_directional_light_default = {
  color: MMD_SA_options._light_color,
  x: dir_light_pos[0],
  y: dir_light_pos[1],
  z: dir_light_pos[2],
};

const params = TX.threeX.light.params_directional_light = Object.assign({
  reset: function () {
/*
    const light = MMD_SA.light_list[1].obj;
    System.Gadget.Settings.writeString('MMDLightColor', '');
    System.Gadget.Settings.writeString('MMDLightPosition', '');
    light.color.set(MMD_SA_options.light_color);
    light.position.fromArray(MMD_SA_options.light_position).add(TX.THREE.MMD.getModels()[0].mesh.position);
    System._browser.update_tray();
*/
    gui_directional_light.controllers.forEach(c=>{c.reset()});
  },
}, TX.threeX.light.params_directional_light_default);

const gui_directional_light = gui_light_and_camera.addFolder( 'Directional Light Parameters' );
gui_directional_light.addColor( params, 'color' ).onChange( function ( value ) {
  const light = MMD_SA.light_list[1].obj;
  System.Gadget.Settings.writeString('MMDLightColor', value);
  light.color.set(MMD_SA_options.light_color);
  update_tray();
});
for (const d of ['x', 'y', 'z']) {
  gui_directional_light.add( params, d, -1,1 ).onChange( function ( value ) {
    const v = Number(value);
    const light = MMD_SA.light_list[1].obj;
    TX.v1.set(params.x, params.y, params.z);
    TX.v1[d] = v;
    System.Gadget.Settings.writeString('MMDLightPosition', '[' + TX.v1.toArray().join(',') + ']');
    light.position.fromArray(MMD_SA_options.light_position).add(TX._THREE.MMD.getModels()[0].mesh.position);
    update_tray();
  });
}
gui_directional_light.add( params, 'reset' );

dir_light_pos = MMD_SA_options.light_position;
Object.assign(params, {
  color: MMD_SA_options.light_color,
  x: dir_light_pos[0]/MMD_SA_options.light_position_scale,
  y: dir_light_pos[1]/MMD_SA_options.light_position_scale,
  z: dir_light_pos[2]/MMD_SA_options.light_position_scale,
});
gui_directional_light.controllers.forEach(c=>{c.updateDisplay()});

gui_directional_light.close();

const params_camera = Object.assign({
  reset: function () {
    gui_camera.controllers.forEach(c=>{c.reset()});
    reset_camera();
  },
}, {
  'FOV (main camera)': 50,
  'FOV (hand camera)': 60,
});

const hand_camera = MMD_SA_options.Dungeon_options?.item_base.hand_camera;

const gui_camera = gui_light_and_camera.addFolder( 'Camera' );
gui_camera.add( params_camera, 'FOV (main camera)', 30, 120, 1 ).onChange( function ( value ) {
  System.Gadget.Settings.writeString('LABEL_CameraFOV', (value==50)?'':value);
  MMD_SA._trackball_camera.object.fov = value;
  MMD_SA._trackball_camera.object.updateProjectionMatrix();

  reset_camera();
});
gui_camera.add( params_camera, 'FOV (hand camera)', 30, 120, 1 ).onChange( function ( value ) {
  if (hand_camera)
    hand_camera.fov = value;
});
gui_camera.add( params_camera, 'reset' );
gui_camera.close();

if (System.Gadget.Settings.readString('LABEL_CameraFOV'))
  params_camera['FOV (main camera)'] = parseInt(System.Gadget.Settings.readString('LABEL_CameraFOV'));
if (hand_camera) {
  if (hand_camera.fov) {
    params_camera['FOV (hand camera)'] = hand_camera.fov;
  }
  else {
    hand_camera.fov = params_camera['FOV (hand camera)'];
  }
}
TX.threeX.GUI.update(gui_camera);
  };
})());
      },
    },

    load_scripts: async function () {
TX.loading = true

//await System._browser.load_script('./three.js/three.min.js');

const THREE_module = await import(System.Gadget.path + '/three.js/' + TX.threeX.three_filename);
self.THREE = {};
Object.assign(self.THREE, THREE_module);

const Geometry_module = await import(System.Gadget.path + '/three.js/Geometry.js');
Object.assign(self.THREE, Geometry_module);

self.THREE.XLoader = TX._THREE.XLoader;

if (MMD_SA_options.THREEX_options.use_OutlineEffect) {
// Jun 10, 2023
  const OutlineEffect_module = await import(System.Gadget.path + '/three.js/postprocessing/OutlineEffect.js');
  Object.assign(self.THREE, OutlineEffect_module);
  console.log('OutlineEffect.js loaded')
}

if (MMD_SA_options.THREEX_options.use_MMD) {
  const MMD_module = await import(System.Gadget.path + '/three.js/loaders/MMDLoader.js');
  Object.assign(self.THREE, MMD_module);
  console.log('MMDLoader.js loaded')
  if (MMD_SA_options.THREEX_options.use_MMDAnimationHelper) {
    const MMDAnimationHelper_module = await import(System.Gadget.path + '/three.js/animation/MMDAnimationHelper.js');
    Object.assign(self.THREE, MMDAnimationHelper_module);
    console.log('MMDAnimationHelper.js loaded')
  }
}

// Apr 3, 2024
const GLTFLoader_module = await import(System.Gadget.path + '/three.js/loaders/GLTFLoader.js');
Object.assign(self.THREE, GLTFLoader_module);

//const GLTFExporter_module = await import(System.Gadget.path + '/three.js/loaders/GLTFExporter.js');
//Object.assign(self.THREE, GLTFExporter_module);

// three-vrm 1.0
if (TX.use_VRM1) {
//  await System._browser.load_script('./three.js/three-vrm.min_OLD.js');
  const three_vrm_module = await System._browser.load_script(System.Gadget.path + '/three.js/three-vrm.module.min.js', true);
  Object.assign(self.THREE, three_vrm_module);
}
else {
  await System._browser.load_script('./three.js/three-vrm.min_v0.6.11.js');
}

TX.THREE = self.THREEX = self.THREE
self.THREE = TX._THREE

//await this.PPE.init();

if (MMD_SA_options.Dungeon_options && MMD_SA_options.Dungeon?.use_octree) await this.utils.load_octree();


// extend three-vrm START
// three.vrm 1.0
if (TX.use_VRM1 && !TX.THREE.VRMSpringBoneManager.prototype.setCenter) {
// https://github.com/pixiv/three-vrm/issues/1112
// https://pixiv.github.io/three-vrm/packages/three-vrm/docs/classes/VRMSpringBoneManager.html#joints
  TX.THREE.VRMSpringBoneManager.prototype.setCenter = function (obj3d) {
    this.joints.forEach(joint=>{
//console.log(joint.center)
      joint.center = obj3d;
    });
  };
}
// extend three-vrm END


// extend three.js START

// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
// https://github.com/mrdoob/three.js/blob/master/src/math/Vector4.js
TX.THREE.Quaternion.prototype.toAxisAngle = function () {
  if (this.w > 1) this.normalize(); // if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
  var angle = 2 * Math.acos(this.w);
  var s = Math.sqrt(1-this.w*this.w); // assuming quaternion normalised then w is less than 1, so term always positive.
  if (s < 0.0001) { // test to avoid divide by zero, s is always positive due to sqrt
    // if s close to zero then direction of axis not important
    x = 1;//this.x; // if it is important that axis is normalised then replace with x=1; y=z=0;
    y = 0;//this.y;
    z = 0;//this.z;
  } else {
    x = this.x / s; // normalise axis
    y = this.y / s;
    z = this.z / s;
  }

  return [new TX.THREE.Vector3(x,y,z), angle]
};

// backward compatibility START

TX.THREE.Euler.prototype.multiplyScalar = TX.THREE.Vector3.prototype.multiplyScalar;
TX.THREE.Euler.prototype.add = TX.THREE.Vector3.prototype.add;
TX.THREE.Euler.prototype.setEulerFromQuaternion = TX.THREE.Euler.prototype.setFromQuaternion;
TX.THREE.Euler.prototype.copy = function ( euler ) {
  if (euler._order === undefined) {
    this._x = euler.x;
    this._y = euler.y;
    this._z = euler.z;
  }
  else {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;
  }

  this._onChangeCallback();
  return this;
};

TX.THREE.Box3.prototype.size = function (size_v3=new TX.THREE.Vector3()) {
  return this.getSize(size_v3);
};
TX.THREE.Box3.prototype.center = function (center_v3=new TX.THREE.Vector3()) {
  return this.getCenter(center_v3);
};

TX.THREE.Vector3.prototype.getPositionFromMatrix = TX.THREE.Vector3.prototype.setFromMatrixPosition;

TX.THREE.Quaternion.prototype.setFromEuler = (function () {
  const setFromEuler = TX.THREE.Quaternion.prototype.setFromEuler;

  return function (euler, order) {
    if (order) euler._order = order;
    return setFromEuler.call(this, euler);
  };
})();

TX.THREE.Matrix4.decompose = (function () {
  const decompose = TX.THREE.Matrix4.decompose;

  return function (position, quaternion, scale) {
    if (position) return decompose.call(this, position, quaternion, scale);

    position = new TX.THREE.Vector3();
    quaternion = new TX.THREE.Quaternion();
    scale = new TX.THREE.Vector3();

    decompose.call(this, position, quaternion, scale);
    return [position, quaternion, scale];
  };
})();

TX.THREE.BufferGeometry.prototype.applyMatrix = THREEX.BufferGeometry.prototype.applyMatrix4;

TX.THREE.Math = TX.THREE.MathUtils;

Object.defineProperty(TX.THREE.Object3D.prototype, 'renderDepth', {
  get: function () { return this.renderOrder; },
  set: function (v) { this.renderOrder = v; },
});

Object.defineProperty(THREEX.Mesh.prototype, 'useQuaternion', {
  get: ()=>true,
  set: ()=>{},
});

// backward compatibility END

// extend three.js END


TX.loading = false;
TX.loaded = true;

TX.resolve_loading && TX.resolve_loading();
    },
  };
};
