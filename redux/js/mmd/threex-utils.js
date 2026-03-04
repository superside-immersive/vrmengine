// threex-utils.js - Misc utilities extracted from MMD_SA.js
// Part of Etapa 10D refactoring

window.MMD_SA_createTHREEX_Utils = function(TX) {
  return {
      load_THREEX: async function () {
if (!self.THREEX) {
  DEBUG_show('Loading THREEX...', 2)

  TX.THREE = TX._THREE = self.THREE;

  const THREE_module = await System._browser.load_script(System.Gadget.path + '/three.js/' + TX.threeX.three_filename, true);
  self.THREE = {};
  Object.assign(self.THREE, THREE_module);

  TX.THREE = self.THREEX = self.THREE;
  self.THREE = TX._THREE;

  TX.init_common();
}
      },

      computeBoundingBox: function (obj) {
const bb = new TX.THREE.Box3();

const _pos = obj.position.clone();
const _rot = obj.quaternion.clone();
const _scale = obj.scale.clone();

obj.position.set(0,0,0);
obj.quaternion.set(0,0,0,1);
obj.scale.set(1,1,1);
obj.updateMatrix();
obj.updateMatrixWorld();

obj.traverse(c => {
  if (c.isMesh && c.geometry) {
    if (!c.geometry.boundingBox)
      c.geometry.computeBoundingBox();

    c.geometry.boundingBox.applyMatrix4(c.matrixWorld);

    bb.union(c.geometry.boundingBox);
  }
});

obj.position.copy(_pos);
obj.quaternion.copy(_rot);
obj.scale.copy(_scale);
obj.updateMatrix();
obj.updateMatrixWorld();

return bb;
      },

      convert_A_pose_rotation_to_T_pose: (function () {
//"肩",
        var RE = new RegExp("^(" + toRegExp(["左","右"],"|") + ")(" + toRegExp(["肩","腕","ひじ","手"],"|") + "|." + toRegExp("指") + ")(.*)$");

        return function (name, rot, sign_inverted) {
if (!RE.test(name)) return rot;

var dir = (RegExp.$1 == '左') ? 1 : -1;
if (sign_inverted) dir *= -1;

TX.q1.fromArray(rot);

if (RegExp.$3.indexOf('捩') != -1) {
// It seems that 捩 bone rotation is always screwed for any modified T-pose MMD model. Just ignore it for now (you don't really need to modify it to transfer this rotation to other non-MMD model anyways).
// NOTE: May need to be calculated in the future since this may affect MMD_SA.get_bone_position()/.get_bone_position() calculations...?
}
else if (RegExp.$3.indexOf('+') == -1) {
  const rs = TX.rot_shoulder_axis[(sign_inverted) ? 0 : 1];
  const rot_axis = (RegExp.$2 == '肩') ? rs : TX.rot_arm_axis;//rot_arm_axis;//

// NOTE: It seems rotating the axis of rot by q is the same as (q x rot x -q)
//  const aa = TX.q1.toAxisAngle(); TX.q1.setFromAxisAngle(aa[0].applyQuaternion(rot_axis[dir]), aa[1])
  TX.q1.premultiply(rot_axis[dir]).multiply(rot_axis[-dir]);

  if (RegExp.$2 == '腕') {
    TX.q1.premultiply(TX.rot_arm_axis[-dir]);
    if (!RegExp.$3) TX.q1.premultiply(rs[dir]);
  }
  else if (RegExp.$2 == '肩') {
    if (!RegExp.$3) TX.q1.premultiply(rs[-dir]);
  }
}

TX.q1.toArray().forEach((v,i)=>{ rot[i]=v });
return rot;
        };
      })(),

      convert_T_pose_rotation_to_A_pose: function (name, rot) {
return this.convert_A_pose_rotation_to_T_pose(name, rot, true);
      },

// https://pixiv.github.io/three-vrm/packages/three-vrm/examples/humanoidAnimation/index.html
// https://pixiv.github.io/three-vrm/packages/three-vrm/examples/humanoidAnimation/loadMixamoAnimation.js

      rig_map: {
        'mixamo': {
          VRM: {
mixamorigHips:'hips',
mixamorigSpine:'spine',
mixamorigSpine1:'chest',
mixamorigSpine2:'upperChest',
mixamorigNeck:'neck',
mixamorigHead:'head',
mixamorigLeftShoulder:'leftShoulder',
mixamorigLeftArm:'leftUpperArm',
mixamorigLeftForeArm:'leftLowerArm',
mixamorigLeftHand:'leftHand',
mixamorigLeftHandThumb1:'leftThumbMetacarpal',
mixamorigLeftHandThumb2:'leftThumbProximal',
mixamorigLeftHandThumb3:'leftThumbDistal',
mixamorigLeftHandIndex1:'leftIndexProximal',
mixamorigLeftHandIndex2:'leftIndexIntermediate',
mixamorigLeftHandIndex3:'leftIndexDistal',
mixamorigLeftHandMiddle1:'leftMiddleProximal',
mixamorigLeftHandMiddle2:'leftMiddleIntermediate',
mixamorigLeftHandMiddle3:'leftMiddleDistal',
mixamorigLeftHandRing1:'leftRingProximal',
mixamorigLeftHandRing2:'leftRingIntermediate',
mixamorigLeftHandRing3:'leftRingDistal',
mixamorigLeftHandPinky1:'leftLittleProximal',
mixamorigLeftHandPinky2:'leftLittleIntermediate',
mixamorigLeftHandPinky3:'leftLittleDistal',
mixamorigRightShoulder:'rightShoulder',
mixamorigRightArm:'rightUpperArm',
mixamorigRightForeArm:'rightLowerArm',
mixamorigRightHand:'rightHand',
mixamorigRightHandPinky1:'rightLittleProximal',
mixamorigRightHandPinky2:'rightLittleIntermediate',
mixamorigRightHandPinky3:'rightLittleDistal',
mixamorigRightHandRing1:'rightRingProximal',
mixamorigRightHandRing2:'rightRingIntermediate',
mixamorigRightHandRing3:'rightRingDistal',
mixamorigRightHandMiddle1:'rightMiddleProximal',
mixamorigRightHandMiddle2:'rightMiddleIntermediate',
mixamorigRightHandMiddle3:'rightMiddleDistal',
mixamorigRightHandIndex1:'rightIndexProximal',
mixamorigRightHandIndex2:'rightIndexIntermediate',
mixamorigRightHandIndex3:'rightIndexDistal',
mixamorigRightHandThumb1:'rightThumbMetacarpal',
mixamorigRightHandThumb2:'rightThumbProximal',
mixamorigRightHandThumb3:'rightThumbDistal',
mixamorigLeftUpLeg:'leftUpperLeg',
mixamorigLeftLeg:'leftLowerLeg',
mixamorigLeftFoot:'leftFoot',
mixamorigLeftToeBase:'leftToes',
mixamorigRightUpLeg:'rightUpperLeg',
mixamorigRightLeg:'rightLowerLeg',
mixamorigRightFoot:'rightFoot',
mixamorigRightToeBase:'rightToes',
          },
        },
      },


      camera_auto_targeting: (()=>{
        let target_data, target_data2;
        let c_rot_data;
        window.addEventListener('load', ()=>{
Object.defineProperty(MMD_SA_options, 'camera_face_locking_percent', (()=>{
  let camera_face_locking_percent;
  return {
    get: function () { return (camera_face_locking_percent == null) ? 100 : camera_face_locking_percent; },
    set: function (v) { camera_face_locking_percent = v; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_look_at_target_percent', (()=>{
  let camera_face_locking_look_at_target_percent;
  return {
    get: function () { return (camera_face_locking_look_at_target_percent == null) ? -20 : camera_face_locking_look_at_target_percent; },
    set: function (v) { camera_face_locking_look_at_target_percent = v; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_movement_x_percent', (()=>{
  let camera_face_locking_movement_x_percent;
  return {
    get: function () { return (camera_face_locking_movement_x_percent == null) ? -60 : camera_face_locking_movement_x_percent; },
    set: function (v) { camera_face_locking_movement_x_percent = v; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_movement_y_percent', (()=>{
  let camera_face_locking_movement_y_percent;
  return {
    get: function () { return (camera_face_locking_movement_y_percent == null) ? -60 : camera_face_locking_movement_y_percent; },
    set: function (v) { camera_face_locking_movement_y_percent = v; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_movement_z_percent', (()=>{
  let camera_face_locking_movement_z_percent;
  return {
    get: function () { return (camera_face_locking_movement_z_percent == null) ? 0 : camera_face_locking_movement_z_percent; },
    set: function (v) { camera_face_locking_movement_z_percent = v; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_z_min', (()=>{
  let camera_face_locking_z_min;
  return {
    get: function () { return (camera_face_locking_z_min == null) ? 1 : camera_face_locking_z_min; },
    set: function (v) { camera_face_locking_z_min = Math.round(v*10)/10; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_vertical_constraint_percent', (()=>{
  let camera_face_locking_vertical_constraint_percent;
  return {
    get: function () { return (camera_face_locking_vertical_constraint_percent == null) ? 0 : camera_face_locking_vertical_constraint_percent; },
    set: function (v) { camera_face_locking_vertical_constraint_percent = v; }
  };
})());
Object.defineProperty(MMD_SA_options, 'camera_face_locking_smooth_time', (()=>{
  let camera_face_locking_smooth_time;
  return {
    get: function () { return (camera_face_locking_smooth_time == null) ? 0.5 : camera_face_locking_smooth_time; },
    set: function (v) {
      camera_face_locking_smooth_time = Math.round(v*10)/10;
      target_data.filters[0].filter.minCutOff = System._browser.data_filter.calculate_one_euro_minCutoff_from_transition_time(camera_face_locking_smooth_time);
      target_data2.filters[0].filter.minCutOff = target_data.filters[0].filter.minCutOff;
//console.log(target_data.filters[0].filter, camera_face_locking_smooth_time);
    }
  };
})());

target_data = new System._browser.data_filter([{ type:'one_euro', id:'camera_face_locking', transition_time:0.5, para:[30, 1,0.1/5,1, 3] }]);
target_data2 = new System._browser.data_filter([{ type:'one_euro', id:'camera_face_locking2', transition_time:0.5, para:[30, 1,0.1/5,1, 3] }]);

c_rot_data = new System._browser.data_filter([{ type:'one_euro', id:'c_rot', para:[30, 0.5,0.5,1, 4] }]);
        });

        let head_pos_absolute, cam_height_offset;
        window.addEventListener('jThree_ready', ()=>{
head_pos_absolute = new TX.THREE.Vector3();
cam_height_offset = new TX.THREE.Vector3();
        });

        function targeting() {
if (!target_current.enabled && ((target_current.enabled === false) || (target_current.condition && !target_current.condition()))) {
  MMD_SA.Camera_MOD.adjust_camera(target_current.id, TX.v1.set(0,0,0), TX.v1.set(0,0,0));
  return;
}

// filter to prevent camera distortion when avatar is extremely close
if (!MMD_SA._trackball_camera?.object) return;
// Guard against NaN quaternion (can happen when camera pos == target during init)
const _camQ = MMD_SA._trackball_camera.object.quaternion;
if (isNaN(_camQ.w) || isNaN(_camQ.x)) {
  MMD_SA._trackball_camera.object.quaternion.set(0, 0, 0, 1);
  return;
}
const c_rot = TX.q1.fromArray(c_rot_data.filter(_camQ.toArray()));

const target_pos = TX.v4.copy(target_current.get_target_position());
const target_pos_z0 = target_pos.z;

const target_pos_cancel_z = MMD_SA.TEMP_v3.set(1,1,0);
target_pos_cancel_z.applyQuaternion(c_rot);
target_pos.multiply(target_pos_cancel_z);

target_pos.fromArray(target_data.filter(target_pos.toArray()));
//DEBUG_show(target_pos.toArray().join('\n'))

const cam_pos = TX.v1.copy(target_pos);
const cam_pos_mul = MMD_SA.TEMP_v3.set(MMD_SA_options.camera_face_locking_movement_x_percent/100, MMD_SA_options.camera_face_locking_movement_y_percent/100, 1);
cam_pos_mul.applyQuaternion(c_rot);
cam_pos.multiply(cam_pos_mul);
//DEBUG_show(cam_pos.toArray().map(v=>v.toFixed(2)).join('\n'))

const cam_base = TX.v2.fromArray(MMD_SA_options.camera_position_base).add(MMD_SA.TEMP_v3.fromArray(MMD_SA.center_view)).setX(0).setY(0);
const model_scale = MMD_SA.THREEX.get_model(0).para.spine_length / 4.97462;
const z_base = cam_base.z;
let z = z_base - target_pos_z0;
//System._browser.camera.DEBUG_show(z+'=\n'+z_base+'-\n'+target_pos_z0)

z = Math.max(z - Math.min(MMD_SA_options.camera_face_locking_z_min*10 * model_scale, z_base), 0);
//System._browser.camera.DEBUG_show(z)
z = -z * MMD_SA_options.camera_face_locking_movement_z_percent/100;

cam_base.z = z;
cam_base.applyQuaternion(c_rot);

cam_pos.add(cam_base);

target_pos_mul = MMD_SA.TEMP_v3.set(MMD_SA_options.camera_face_locking_look_at_target_percent/100, MMD_SA_options.camera_face_locking_look_at_target_percent/100, 1);
target_pos_mul.applyQuaternion(c_rot);
target_pos.multiply(target_pos_mul);

const target_pos_z = MMD_SA.TEMP_v3.set(0, 0, head_pos_absolute.z - TX.threeX.get_model(0).mesh.position.z);
//DEBUG_show(z+'\n'+target_pos_z.z+'\n'+Math.min(MMD_SA_options.camera_face_locking_z_min*10 * model_scale, z_base));
target_pos_z.applyQuaternion(c_rot);
target_pos.add(target_pos_z);

MMD_SA.Camera_MOD.adjust_camera(target_current.id, cam_pos, target_pos);
//DEBUG_show(MMD_SA._trackball_camera.object.position.toArray().join('\n')+'\n\n'+MMD_SA._trackball_camera.target.toArray().join('\n')+'\n\n'+z);

cam_height_offset.set(0,0,0);
const camera = MMD_SA._trackball_camera.object;
let matrix_updated;
if (MMD_SA_options.camera_face_locking_vertical_constraint_percent) {
  TX.m1.copy(camera.matrix);
  TX.m2.copy(camera.matrixWorld);
  camera.updateMatrixWorld();
  matrix_updated = true;

  const c_pos = MMD_SA._v3b_.copy(head_pos_absolute).project(camera);
  const height_limit = 1 - MMD_SA_options.camera_face_locking_vertical_constraint_percent/100;
  if (Math.abs(c_pos.y) > height_limit) {
    c_pos.y = Math.sign(c_pos.y) * height_limit;
    c_pos.z = 0.5;

    const ray_direction = c_pos.unproject(camera).sub(camera.position).normalize();

    const plane = TX.p1.setFromNormalAndCoplanarPoint(ray_direction, head_pos_absolute);

    const ray = TX.r1.set(camera.position, ray_direction);

    const intersectionPoint = TX.v2;
    if (ray.intersectPlane(plane, intersectionPoint)) {
      intersectionPoint.sub(head_pos_absolute);
      cam_height_offset.copy(intersectionPoint).negate();
    }
  }
}

cam_height_offset.fromArray(target_data2.filter(cam_height_offset.toArray()));

cam_pos.add(cam_height_offset);
target_pos.add(cam_height_offset);

MMD_SA.Camera_MOD.adjust_camera(target_current.id, cam_pos, target_pos);

// restore updated matrix to make things like speech bubble mouseover to work
if (matrix_updated) {
  camera.matrix.copy(TX.m1);
  camera.matrixWorld.copy(TX.m2);
}
        }

        var target_current;

        var target_face = {
  id: 'face',
  get_target_position: ()=>{
const model = TX.threeX.get_model(0);
const model_MMD = MMD_SA.THREEX._THREE.MMD.getModels()[0];

let head_pos;
let pos = TX.v3.set(0,0,0);

const head_pos_ref = TX.v1.fromArray(model.get_bone_origin_by_MMD_name('頭')).sub(TX.v2.fromArray(model.get_bone_origin_by_MMD_name('上半身')));
const neck_y = model.get_bone_origin_by_MMD_name('頭')[1] - model.get_bone_origin_by_MMD_name('首')[1];
head_pos_ref.y += neck_y;
//DEBUG_show(head_pos_ref.toArray().join('\n'))

const camera_lookAt = TX.v4.fromArray(MMD_SA_options.camera_lookAt).add(TX.v2.fromArray(MMD_SA.center_view_lookAt));

pos.add(model_MMD.mesh.position);
pos.add(camera_lookAt);
pos.add(model.get_bone_position_by_MMD_name('センター',true).setY(0).applyQuaternion(model_MMD.mesh.quaternion));

head_pos = model.get_bone_position_by_MMD_name('頭').add(TX.v2.set(0,neck_y,0).applyQuaternion(model.get_bone_rotation_by_MMD_name('頭')));
head_pos_absolute.copy(head_pos);

head_pos.sub(model.get_bone_position_by_MMD_name('上半身'));
head_pos.sub(head_pos_ref);
//DEBUG_show(head_pos.toArray().join('\n'))

const c_base = MMD_SA.Camera_MOD.get_camera_base();//['camera_lock']);//,'face']);
pos.sub(c_base.target);
//DEBUG_show(pos.toArray().join('\n'))

head_pos.add(pos).multiplyScalar(MMD_SA_options.camera_face_locking_percent/100);
//DEBUG_show(head_pos.toArray().join('\n'))

if (MMD_SA_options.Dungeon?.started) {
  head_pos.add(MMD_SA.TEMP_v3.copy(camera_raw.pos).setZ(0));
}

//DEBUG_show(head_pos.toArray().join('\n'))
return head_pos;
  },
        };

//window.addEventListener('MMDStarted', ()=>{ System._browser.on_animation_update.add(()=>{DEBUG_show(MMD_SA.THREEX.get_model(0).get_bone_position_by_MMD_name('上半身').toArray().join('\n')+'\n'+Date.now())},0,1,-1) });

        return function (target) {
if (!target) {
  if (!target_current) return;
  System._browser.on_animation_update.remove(targeting, 1);
  MMD_SA.Camera_MOD.adjust_camera(target_current.id, null, TX.v1.set(0,0,0));
  target_current = null;
  return;
}

if (target_current && (target.id == target_current.id)) {
  target_current = Object.assign(target_current, target);
  return;
}

if (!target_current)
  System._browser.on_animation_update.add(targeting, 0,1,-1);

if (target.id == 'face')
  target = Object.assign(target_face, target);;

target_current = target;
        };
      })(),

      load_octree: async function () {
await TX.threeX.utils.load_THREEX();

const Octree_module = await System._browser.load_script(System.Gadget.path + '/three.js/libs/Octree.js', true);
for (const name in Octree_module) TX.THREE[name] = Octree_module[name];
      },

      HDRI: (()=>{
        let EXRLoader, EXR_loader, RGBELoader, RGBE_loader;
        let pmremGenerator;

        let HDRI_renderTarget_last;

        let path_now, path_next;

        let load_promise;

        let initialized, loading;
        async function init() {
if (initialized) return;
initialized = true;

EXRLoader = await System._browser.load_script(System.Gadget.path + '/three.js/loaders/EXRLoader.js', true);
EXR_loader = new EXRLoader.EXRLoader();

RGBELoader = await System._browser.load_script(System.Gadget.path + '/three.js/loaders/RGBELoader.js', true);
RGBE_loader = new RGBELoader.RGBELoader();

const renderer = TX.threeX.renderer.obj;
pmremGenerator = new TX.THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
        }

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_envmaps_exr.html
        function load_core(path, set_background) {
return new Promise((resolve)=>{
  path_now = path;

  ((/\.exr$/i.test(path)) ? EXR_loader : RGBE_loader).load( toFileProtocol(path), function ( texture ) {
    texture.mapping = TX.THREE.EquirectangularReflectionMapping;

    const exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );

    display(exrCubeRenderTarget, set_background);

    if (HDRI_renderTarget_last)
      HDRI_renderTarget_last.dispose();
    HDRI_renderTarget_last = exrCubeRenderTarget;

console.log('HDRI', path)
    resolve();
  });
});
        }

        function display(exrCubeRenderTarget, set_background) {
TX.threeX.scene.environment = exrCubeRenderTarget.texture;
//set_background=true
if (set_background) {
  TX.threeX.scene.background = exrCubeRenderTarget.texture;
//TX.threeX.scene.backgroundBlurriness = 0.5
  System._browser.camera.display_floating = (MMD_SA_options.user_camera.display.floating_auto !== false);

  if (MMD_SA_options.mesh_obj_by_id["DomeMESH"])
    MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.visible = false;
}
        }

        let mode;

        return {
          get mode() { return (mode == null) ? 1 : mode; },
          set mode(v) {
const _mode = this.mode;
mode = v;

if ((_mode != this.mode) && (this.mode != 1)) {
  if (mode == 2) {
    if (this.path && !TX.threeX.scene.background) {
      TX.threeX.scene.background = HDRI_renderTarget_last.texture;
      System._browser.camera.display_floating = (MMD_SA_options.user_camera.display.floating_auto !== false);
    }
  }
  else {
    TX.threeX.scene.background = null;
  }
}
          },

          get path() { return TX.threeX.enabled && TX.threeX.scene.environment && path_now; },

          load: async function (path, set_background) {
if (!TX.threeX.enabled) return false;
if (loading) return false;

if ((set_background == null) || !this.mode)
  set_background = (!this.mode) ? false : ((this.mode == 1) ? (!MMD_SA_options.mesh_obj_by_id["DomeMESH"]?._obj.visible && (!!MMD_SA.THREEX.scene.background || !MMD_SA.THREEX._object3d_list_?.length)) : true);

if (path == this.path) {
  display(HDRI_renderTarget_last, set_background);
  return false;
}

if (load_promise) {
  path_next = path;
}
else {
  load_promise = new Promise(async (resolve)=>{
    await init();

    await load_core(path, set_background);

    resolve();
    load_promise = null;

    if (path_next && (path_now != path_next))
      load_promise = this.load(path_next);
    path_next = null;
  });
}

return load_promise;
          }
        };
      })(),

      dispose: function (obj) {
if (!TX.threeX.enabled && (obj.children.length == 1) && (obj.children[0]._model_index != null)) {
  TX._THREE.MMD.removeModel(TX._THREE.MMD.getModels()[obj.children[0]._model_index]);
}

let geo_disposed = 0, map_disposed = 0, mtrl_disposed = 0, misc_disposed = 0;
obj.traverse(node => {
  if (!node.isMesh && !node.geometry) {
    if (node.dispose) {
      node.dispose();
      misc_disposed++;
    }
    return;
  }

  if (node.geometry) {
    node.geometry.dispose();
    geo_disposed++;
  }

  if (node.material) {
    const materials = node.material.materials || (Array.isArray(node.material) && node.material) || [node.material];
    materials.forEach(mtrl => {
      if (mtrl.map)         { mtrl.map.dispose(); map_disposed++; }
      if (mtrl.lightMap)    { mtrl.lightMap.dispose(); map_disposed++; }
      if (mtrl.bumpMap)     { mtrl.bumpMap.dispose(); map_disposed++; }
      if (mtrl.normalMap)   { mtrl.normalMap.dispose(); map_disposed++; }
      if (mtrl.specularMap) { mtrl.specularMap.dispose(); map_disposed++; }
      if (mtrl.envMap)      { mtrl.envMap.dispose(); map_disposed++; }

      mtrl.dispose();
      mtrl_disposed++;
    });
  }
});

console.log('geo_disposed:' + geo_disposed, 'map_disposed:' + map_disposed, 'mtrl_disposed:' + mtrl_disposed, 'misc_disposed:' + misc_disposed);
      },

      display_helper: (()=>{
        const helpers = {};

        let position, quaternion, scale, matrixWorld;
        let _q1, _e1;
        window.addEventListener('jThree_ready', ()=>{
position = new TX.THREE.Vector3();
quaternion = new TX.THREE.Quaternion();
scale = new TX.THREE.Vector3();
matrixWorld = new TX.THREE.Matrix4();

_q1 = new TX.THREE.Quaternion();
_e1 = new TX.THREE.Euler();
        });

        window.addEventListener('SA_MMD_before_render', ()=>{
for (const id in helpers) {
  const helper_para = helpers[id];
  const helper = helper_para.obj;
  if (RAF_timestamp < helper_para.timestamp_ini + helper_para.duration) {
    let helper_parent = helper_para.parent;
    if (typeof helper_parent == 'string') {
      const modelX = TX.threeX.get_model(0);
      const is_MMD_dummy = (modelX.type=='MMD_dummy');

      const bone = modelX.get_bone_by_MMD_name(TX.threeX.VRM.bone_map_VRM_to_MMD[helper_parent]);
      const bone_matrix = (is_MMD_dummy) ? bone.skinMatrix : bone.matrixWorld;

      position.setFromMatrixPosition(bone_matrix);
      quaternion.setFromRotationMatrix(matrixWorld.extractRotation(bone_matrix));

// multiply, instead of premultiply
      if (!is_MMD_dummy && !modelX.is_VRM1) quaternion.multiply(_q1.set(0,-1,0,0));

      if (is_MMD_dummy) {
        position.applyQuaternion(modelX.mesh.quaternion).add(modelX.mesh.position);
        quaternion.premultiply(modelX.mesh.quaternion);
      }

      matrixWorld.compose(position, quaternion, scale.set(1,1,1));
    }
    else {
      matrixWorld.copy(helper_parent.matrixWorld).decompose(position, quaternion, scale);
    }

    if (!helper_para.use_parent_scale)
      helper.scale.set(1/scale.x, 1/scale.y, 1/scale.z);
    helper.updateMatrix();

    helper.matrixWorld.multiplyMatrices( matrixWorld, helper.matrix );
    helper.matrix.copy(helper.matrixWorld);

    helper.visible = true;
  }
  else {
    helper.visible = false;
  }
}
        });

        return function (helper_id, helper_parent, para) {
let helper;
let helper_para = helpers[helper_id];
if (!helper_para) {
  helper_para = helpers[helper_id] = {};

  const THREE = TX.threeX.THREE;
  if (para.type == 'plane') {
    helper = helper_para.obj = new TX.THREE.GridHelper(3, 30, '#ff8', '#ff8');
  }
  else if (para.type == 'line') {
    const material = new TX.THREE.LineBasicMaterial({ color:'#8ff' });

    let geometry;
    if (TX.threeX.enabled) {
      geometry = new TX.THREE.BufferGeometry().setFromPoints( para.line.map(p=>new TX.THREE.Vector3().copy(p)) );
    }
    else {
      geometry = new TX.THREE.Geometry();
      geometry.vertices.push(...para.line.map(p=>new TX.THREE.Vector3().copy(p)));
    }

    helper = helper_para.obj = new TX.THREE.Line( geometry, material );

    helper_para.use_parent_scale = true;
  }
  else {
    helper = helper_para.obj = new THREE[(TX.threeX.enabled)?'AxesHelper':'AxisHelper'](1);
  }

  helper.matrixAutoUpdate = false;
  if (TX.threeX.enabled)
    helper.renderOrder = 99;
  helper.material.depthTest = false;

  TX.threeX.scene.add(helper);
}
else {
  helper = helper_para.obj;
  if (para.type == 'line') {
    if (TX.threeX.enabled) {
      const pos = helper.geometry.getAttribute('position');
      para.line.forEach((v,i)=>{
        pos.array[i*3+0] = v.x;
        pos.array[i*3+1] = v.y;
        pos.array[i*3+2] = v.z;
      });
      pos.needsUpdate = true;
    }
    else {
      const geometry = helper.geometry;
      geometry.vertices.forEach((v,i)=>{
        v.copy(para.line[i]);
      });
      geometry.verticesNeedUpdate = true;
    }
  }
}

helper_para.parent = helper_parent;
helper_para.timestamp_ini = RAF_timestamp;
helper_para.duration = 5000;

if (para.pos)
  helper.position.set(para.pos.x, para.pos.y, para.pos.z);

if (para.rot) {
  d2r = Math.PI/180;
  helper.quaternion.copy(quaternion.setFromEuler(_e1.set(para.rot.x*d2r, para.rot.y*d2r, para.rot.z*d2r)));
}
        };
      })(),

// headless_mode
  };
};
