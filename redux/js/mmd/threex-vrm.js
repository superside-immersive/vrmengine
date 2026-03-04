/**
 * THREEX VRM sub-module — extracted from MMD_SA.js THREEX IIFE (Step 10A).
 * Manages VRM model loading, bone mapping, blendshape morphing, and VMC output.
 * @param {Object} TX - Shared state object with getter/setter proxies to THREEX closure vars.
 * @returns {Object} VRM interface object
 */
window.MMD_SA_createTHREEX_VRM = function(TX) {
    var _self;

    function init() {

// three-vrm 1.0
if (TX.use_VRM1) {
// https://github.com/pixiv/three-vrm/blob/dev/docs/migration-guide-1.0.md
// In VRM1.0, linear workflow is explicitly recommended, as GLTFLoader recommends.
// https://github.com/mrdoob/three.js/wiki/Migration-Guide#151--152
// WebGLRenderer.outputEncoding has been replaced with WebGLRenderer.outputColorSpace with THREE.SRGBColorSpace as the default value.

// https://threejs.org/docs/#manual/en/introduction/Color-management
// r149 => r150
// https://github.com/mrdoob/three.js/wiki/Migration-Guide#r149--r150
  THREEX.ColorManagement.enabled = true;

// Install GLTFLoader plugin
  TX.GLTF_loader.register((parser) => {
    const plugin = new THREEX.VRMLoaderPlugin(parser);
// v3.0.0 - https://github.com/pixiv/three-vrm/pull/1415
    plugin.metaPlugin.needThumbnailImage = true;
    return plugin;
  });

// backward compatibility
// /three-vrm-core/types/humanoid/VRMHumanBoneName.d.ts
  TX.THREE.VRMSchema = _self.VRMSchema;
}

      window.addEventListener('jThree_ready', ()=>{
rot_parent_upper_body_inv = new TX.THREE.Quaternion();
      });

      window.addEventListener("MMDStarted", ()=>{
        vrm_list.forEach(vrm=>{
vrm.boundingBox = TX.threeX.utils.computeBoundingBox(vrm.model.scene);
vrm.boundingBox.min.multiplyScalar(vrm_scale);
vrm.boundingBox.max.multiplyScalar(vrm_scale);

vrm.boundingSphere = vrm.boundingBox.getBoundingSphere(new TX.THREE.Sphere());
if (MMD_SA_options.Dungeon)
  MMD_SA_options.Dungeon.utils.adjust_boundingBox(vrm);

const MMD_geo = TX._THREE.MMD.getModels()[vrm.index].mesh.geometry;
MMD_geo.boundingBox = new TX._THREE.Box3().copy(vrm.boundingBox);
MMD_geo.boundingBox_list = [MMD_geo.boundingBox];
MMD_geo.boundingSphere = new TX._THREE.Sphere().copy(vrm.boundingSphere);

if (MMD_SA_options.Dungeon)
  MMD_SA_options.Dungeon.character.boundingBox = MMD_geo.boundingBox.clone();
        });
      });
    }

    function get_MMD_bone_pos(mesh, bone, v) {
return v.fromArray(mesh.geometry.bones[bone._index].pos).negate().add(bone.position);
    }

    function VRM_object(index, vrm, para) {
this.is_VRM1 = (parseInt(vrm.meta.metaVersion) > 0);

var para = Object.assign({ pos0:{}, q0:{}, name_parent0:{} }, para);
var humanBones = vrm.humanoid.humanBones;
var bone_three_to_vrm_name = this.bone_three_to_vrm_name = {};
var bone_vrm_to_three_name = this.bone_vrm_to_three_name = {};
for (const name in humanBones) {
  let bone_array = humanBones[name];
// three-vrm 1.0
  if (!TX.use_VRM1) bone_array = bone_array[0];

  if (!bone_array) continue;

  let bone =  bone_array.node;
  bone_three_to_vrm_name[bone.name] = name;
  bone_vrm_to_three_name[name] = bone.name;
  const pos = TX.v1.set(0,0,0);
  const q = TX.q1.set(0,0,0,1);

  while (bone.type == 'Bone') {
    q.premultiply(bone.quaternion);
    bone = bone.parent;
  }
  para.q0[name] = para.q0[bone_array.node.name] = q.toArray();

  bone =  bone_array.node;
  while (bone.type == 'Bone') {
    if (para.q0[bone.name]) TX.q2.fromArray(para.q0[bone.name]);
    pos.add(TX.v2.copy(bone.position).applyQuaternion(TX.q2));

    bone = bone.parent;
  }
  para.pos0[name] = this.process_position(pos).toArray();

}

for (const name in humanBones) {
  let bone_array = humanBones[name];
// three-vrm 1.0
  if (!TX.use_VRM1) bone_array = bone_array[0];

  if (!bone_array) continue;

  let bone =  bone_array.node;
  while (bone.type == 'Bone') {
    const name_parent = bone_three_to_vrm_name[bone.parent.name];
    if (!name_parent) {
      bone = bone.parent;
    }
    else {
      para.name_parent0[name] = name_parent;
      break
    }
  }
}

para.shoulder_width = (para.pos0['leftUpperArm'][0] - para.pos0['rightUpperArm'][0]) * vrm_scale;;
para.left_arm_length = TX.v1.fromArray(para.pos0['leftUpperArm']).distanceTo(TX.v2.fromArray(para.pos0['leftHand'])) * vrm_scale;
para.left_palm_length = TX.v1.fromArray(para.pos0['leftHand']).distanceTo(TX.v2.fromArray(para.pos0['leftMiddleProximal'])) * vrm_scale;
para.left_leg_length = ((para.pos0['leftUpperLeg'][1] - para.pos0['leftLowerLeg'][1]) + (para.pos0['leftLowerLeg'][1] - para.pos0['leftFoot'][1])) * vrm_scale;
para.spine_length = (para.pos0['neck'][1] - para.pos0['leftUpperLeg'][1]) * vrm_scale;

const b3 = new TX.THREE.Box3().setFromObject(vrm.scene);
para.head_height_absolute = (b3.max.y - para.pos0['head'][1]) * vrm_scale;

para.left_heel_height = para.pos0['leftFoot'][1] * vrm_scale;
para.hip_center = new TX.THREE.Vector3().fromArray(para.pos0['leftUpperLeg']).setX(0).multiplyScalar(vrm_scale);
para.hip_center_offset = new TX.THREE.Vector3().fromArray(para.pos0['hips']).multiplyScalar(vrm_scale).sub(para.hip_center);

para.lower_arm_fixedAxis = {};
for (const d of ['左','右']) {
  const dir = (d=='左') ? 'left' : 'right';
  para.lower_arm_fixedAxis[d] = TX.v1.fromArray(para.pos0[dir+'Hand']).sub(TX.v2.fromArray(para.pos0[dir+'LowerArm'])).normalize().toArray();
}

para.bone_dummy = {};
para.spine_to_hips_ratio = (para.pos0['chest']) ? 0 : 1 - TX.THREE.Math.clamp((para.pos0['neck'][1] - para.pos0['spine'][1]) / (para.pos0['neck'][1] - para.pos0['hips'][1]) * 2, 0,1);

TX.Model_obj.call(this, index, vrm, para);
this.mesh = vrm.scene;

this._joints_settings = [];
for ( const e of vrm.springBoneManager.joints ) {
  this._joints_settings.push(Object.assign({}, e.settings));
}

if (!MMD_SA.MMD_started)
  vrm_list.push(this)
    }

    VRM_object.prototype = Object.create( TX.Model_obj.prototype );

    Object.defineProperties(VRM_object.prototype, {
      type: {
        value: 'VRM'
      },

      is_T_pose: {
        value: true
      },

      use_faceBlendshapes: {
        get: function () { return this._use_faceBlendshapes && !this._disable_faceBlendshapes; },
        set: function (v) { this._use_faceBlendshapes=v; },
      },

      use_tongue_out: {
        get: function () { return this.use_faceBlendshapes; },
      },

      bone_map_MMD_to_VRM: {
        get: ()=>{ return bone_map_MMD_to_VRM; }
      },

      get_bone_by_MMD_name: {
        value: function (name) {
name = bone_map_MMD_to_VRM[name];
return (!name) ? null : this.getBoneNode(name);
        }
      },

// three-vrm
      getBoneNode: {
        value: function (name, normalized) {
// three-vrm 1.0 normalized
return (!TX.use_VRM1) ? (TX.THREE.VRMSchema.HumanoidBoneName[name.charAt(0).toUpperCase()+name.substring(1)] &&  this.model.humanoid.getBoneNode(name)) : ((normalized || ((normalized == null) && this.model.humanoid.autoUpdateHumanBones)) ? this.model.humanoid.getNormalizedBoneNode(name) : this.model.humanoid.getRawBoneNode(name));
        }
      },

      resetPhysics: {
        value: function () {
if (this.index > 0) return;

const restrict_physics = MMD_SA.motion[TX._THREE.MMD.getModels()[this.index].skin._motion_index].para_SA.mov_speed;
const settings_default = this._joints_settings;
let i = 0;
for ( const e of this.model.springBoneManager.joints ) {
  const _scale = vrm_scale;
  e.settings.stiffness = settings_default[i].stiffness * ((restrict_physics) ? 10 : 1) * _self.joint_stiffness_percent/100 * _scale;
  e.settings.gravityPower = settings_default[i].gravityPower * _scale;
  i++;
};

this.model.springBoneManager.reset();
        }
      },

      build_blendshape_map_name: {
        value: function (map0, map1) {
this._map_to_v = [{}, {}];
for (const name in map0) {
  this._map_to_v[1][map0[name]] = map1[name];
  this._map_to_v[0][map1[name]] = map0[name];
}
        }
      },

      blendshape_map_name: {
        value: function (name, is_VRM1) {
const v = (is_VRM1) ? 1 : 0;
return this._map_to_v[v][name] || name;
        }
      },

      scale: {
        value: function (scale) {
// fix bugs in VRM physics/MToon material outline when the mesh is scaled
const mesh_obj = this.mesh;
if (mesh_obj.scale.x == scale) return;

mesh_obj.scale.set(scale, scale, scale);

const vrm = this.model;
const model_para = this.para;

if (vrm.springBoneManager) {
  if (!TX.use_VRM1) {
    vrm.springBoneManager.setCenter(mesh_obj);
  }
  else {
    if (!model_para._joints)
      model_para._joints = {};
// scale joints
    let i = 0;
    for ( const joint of vrm.springBoneManager.joints ) {
      let j = model_para._joints[i];
      if (!j)
        j = model_para._joints[i] = { settings:this._joints_settings[i] };
      i++;

      const _scale = (joint._center) ? 1 : scale;
      joint.settings.stiffness = j.settings.stiffness * _scale;
      joint.settings.gravityPower = j.settings.gravityPower * _scale;

      joint.settings.hitRadius = j.settings.hitRadius * scale;
    }

    if (!model_para._colliders)
      model_para._colliders = {};
// scale colliders
    i = 0;
    for ( const collider of vrm.springBoneManager.colliders ) {
      const shape = collider.shape;

      let c = model_para._colliders[i];
      if (!c)
        c = model_para._colliders[i] = { shape:{ radius:shape.radius, tail:shape.tail?.clone() } };
      i++;

      shape.radius = c.shape.radius * scale;
      shape.tail?.copy(c.shape.tail).multiplyScalar( scale );
    }
  }
}

if (!model_para._materials)
  model_para._materials = {};

const _model_para = this.model_para;
vrm.materials.forEach((m,i)=>{
  const outlineWidthFactor = (_model_para?.material_para?.[i] || _model_para?.material_para?.[m.name])?.outlineWidthFactor;
  if (outlineWidthFactor != null) {
    m.outlineWidthFactor = outlineWidthFactor;
  }
  else {
    let _m = model_para._materials[i];
    if (!_m)
      _m = model_para._materials[i] = { outlineWidthFactor:m.outlineWidthFactor };

    if (m.isMToonMaterial && (m.outlineWidthMode != 'screenCoordinates')) m.outlineWidthFactor = _m.outlineWidthFactor * scale;
// v3.1.2 (?) - https://github.com/pixiv/three-vrm/pull/1492
    if (m.isMToonMaterial && (m.outlineWidthMode == 'screenCoordinates')) m.outlineWidthFactor = _m.outlineWidthFactor / (1+(scale-1)*0.25);
  }
});
        }
      },

      process_rotation: {
        value: function (rot, name) {
if (!this.is_VRM1) {
  rot.x *= -1;
  rot.z *= -1;
}
return rot;
        }
      },

      process_position: {
        value: function (pos) {
if (!this.is_VRM1) {
  pos.x *= -1;
  pos.z *= -1;
}
return pos
        }
      },

      update_model: {
        value: function () {
const that = this;

const is_VRM1 = this.is_VRM1;
const mesh = this.mesh
mesh.matrixAutoUpdate = false

const vrm = this.model
const VRMSchema = TX.THREE.VRMSchema

if (this.animation._motion_index != null) {
  if (this.animation.enabled) {
    if (this.animation._motion_index != TX._THREE.MMD.getModels()[this.index].skin._motion_index)
      this.animation.enabled = false;
  }
  else {
    if (this.animation._motion_index == TX._THREE.MMD.getModels()[this.index].skin._motion_index)
      this.animation.enabled = true;
  }
}

const animation_enabled = this.animation.enabled;

// three-vrm 1.0 normalized
vrm.humanoid.autoUpdateHumanBones = TX.use_VRM1 && (this.is_VRM1 || animation_enabled);

if (vrm.humanoid.autoUpdateHumanBones) {
  vrm.humanoid.resetNormalizedPose();
}
else {
  if (TX.use_VRM1) {
    vrm.humanoid.resetRawPose();
  }
  else {
    vrm.humanoid.resetPose();
  }
}

const time_delta = RAF_timestamp_delta/1000;

if (this.reset_pose) {
  this.scale(1);

  if (MMD_SA.hide_3D_avatar) { vrm._update_core(time_delta) } else
  vrm.update(time_delta);

  if (!mesh.matrixAutoUpdate) {
    mesh.updateMatrix()
    mesh.updateMatrixWorld()
  }
  return;
}
this.scale(vrm_scale);

if (!is_VRM1) mesh.quaternion.premultiply(TX.q1.set(0,1,0,0));

if (animation_enabled) {
  this.animation.mixer.update(time_delta);

  rot_parent_upper_body_inv.set(0,0,0,1);
  for (const name of ["Hips", "Spine", "Chest", "UpperChest"]) {
    const bone_name = VRMSchema.HumanoidBoneName[name];
    if (!bone_name) continue;

    const bone = this.getBoneNode(bone_name);
    if (!bone) continue;

    rot_parent_upper_body_inv.multiply(bone.quaternion);
  }
  rot_parent_upper_body_inv.conjugate();

  if (System._browser.camera.poseNet.enabled) {
    const frames = System._browser.camera.poseNet.frames;
    rot_parent_upper_body_inv.multiply(frames._rot_camera_offset);
    frames.upper_body_rotation_limiter(rot_parent_upper_body_inv);
  }
}

// bone START

var mesh_MMD = TX._THREE.MMD.getModels()[0].mesh
var bones_by_name = mesh_MMD.bones_by_name
MMD_bone_list.forEach(MMD_name=>{
  let bone = this.get_bone_by_MMD_name(MMD_name);

  let bone_linked, MMD_name_linked;
  if (!bone) {
// special and simplified case for 上半身2
    if (MMD_name == '上半身2') {
      MMD_name_linked = '上半身';
      bone_linked = this.get_bone_by_MMD_name(MMD_name_linked);
      if (!bone_linked) return;

      bone = this.para.bone_dummy[MMD_name];
      if (!bone)
        bone = this.para.bone_dummy[MMD_name] = { quaternion:new TX.THREE.Quaternion() };
    }
    else
      return;
  }

  const bone_MMD = bones_by_name[MMD_name];
  if (!bone_MMD) return;

  const vrm_bone_name = bone_map_MMD_to_VRM[MMD_name];
  TX.q1.copy(bone_MMD.quaternion);
  this.process_rotation(TX.q1, vrm_bone_name);

  if (!animation_enabled || (System._browser.camera.ML_enabled && !is_MMD_bone_motion_skipped.test(MMD_name))) {
    if (animation_enabled && System._browser.camera.poseNet.enabled && is_MMD_bone_motion_mixed.test(MMD_name)) {
      if (this.animation._single_frame && this.animation._single_frame[vrm_bone_name]) bone.quaternion.fromArray(this.animation._single_frame[vrm_bone_name]);
      bone.quaternion.multiply(TX.q1);
    }
    else {
      if (animation_enabled && System._browser.camera.ML_enabled && is_MMD_bone_motion_parent_limited.test(MMD_name)) {
        if (/(left|right)/.test(vrm_bone_name)) {
          if (!System._browser.camera.poseNet.enabled) return;

          const d = RegExp.$1;
          TX.q2.copy(rot_parent_upper_body_inv).conjugate();
          const shoulder_name = VRMSchema.HumanoidBoneName[d.charAt(0).toUpperCase() + d.substring(1) + 'Shoulder'];
          if (shoulder_name) {
            const shoulder = this.getBoneNode(shoulder_name);
            if (shoulder)
              TX.q2.multiply(shoulder.quaternion);
          }
          bone.quaternion.copy(TX.q2.conjugate()).multiply(TX.q1);
        }
        else {
          bone.quaternion.copy(rot_parent_upper_body_inv).multiply(TX.q1);
        }
      }
      else {
        if (!animation_enabled || !System._browser.camera.ML_enabled || System._browser.camera.poseNet.enabled || is_MMD_bone_motion_face.test(MMD_name))
          bone.quaternion.copy(TX.q1);
      }
    }
  }

  if (bone_linked) {
    bone_linked.quaternion.multiply(bone.quaternion);
  }
});

const MMD_model_para = MMD_SA_options.model_para_obj_all[this.index];
const leg_scale = this.para.left_leg_length / MMD_model_para.left_leg_length;

const center_bone_pos = TX.v1.set(0,0,0);
const hips_rot = TX.q1.set(0,0,0,1);

if (!animation_enabled) {
  ['センター', 'グルーブ', '腰'].forEach(hip_name => {
    const hip_bone = bones_by_name[hip_name];
    const hip_bone_pos = get_MMD_bone_pos(mesh_MMD, hip_bone, TX.v4);
    const hip_bone_offset = TX.v2.fromArray(MMD_model_para._hip_offset[hip_name]);
    hip_bone_pos.add(TX.v3.copy(hip_bone_offset).applyQuaternion(hip_bone.quaternion).sub(hip_bone_offset).applyQuaternion(hips_rot));
    center_bone_pos.add(hip_bone_pos);

    hips_rot.multiply(hip_bone.quaternion);
  });
}

if (!animation_enabled) {
  const root_bone = bones_by_name['全ての親'];
  const root_bone_pos = get_MMD_bone_pos(mesh_MMD, root_bone, TX.v2);
  center_bone_pos.multiplyScalar(leg_scale).add(root_bone_pos).multiplyScalar(1/vrm_scale).applyQuaternion(root_bone.quaternion);

  this.getBoneNode('hips').position.fromArray(this.para.pos0['hips']).add(this.process_position(center_bone_pos));

  hips_rot.premultiply(root_bone.quaternion);
}

if (!animation_enabled) {
  const upper_body_bone = bones_by_name['上半身'];
  const lower_body_bone = bones_by_name['下半身'];

  hips_rot.multiply(lower_body_bone.quaternion);

  const spine_rot = TX.q2.set(0,0,0,1);
  spine_rot.copy(lower_body_bone.quaternion).conjugate();
  spine_rot.multiply(upper_body_bone.quaternion);

  this.getBoneNode('spine').quaternion.copy(this.process_rotation(spine_rot, 'spine'));
}

if (!animation_enabled) {
  this.getBoneNode('hips').quaternion.copy(this.process_rotation(hips_rot, 'hips'));
}
else {
  this.getBoneNode('hips').quaternion.multiply(this.process_rotation(hips_rot, 'hips'));
}

if (this.para.bone_dummy['上半身2'])
  this.getBoneNode('spine').quaternion.multiply(this.para.bone_dummy['上半身2'].quaternion);

if (this.para.spine_to_hips_ratio) {
  const spine_rot = TX.q2.set(0,0,0,1).slerp(this.getBoneNode('spine').quaternion, this.para.spine_to_hips_ratio);
  const spine_rot_inv = TX.q3.copy(spine_rot).conjugate();

  this.getBoneNode('hips').quaternion.multiply(spine_rot);
  this.getBoneNode('leftUpperLeg').quaternion.premultiply(spine_rot_inv);
  this.getBoneNode('rightUpperLeg').quaternion.premultiply(spine_rot_inv);
  this.getBoneNode('spine').quaternion.premultiply(spine_rot_inv);
}

if (!animation_enabled || System._browser.camera.poseNet.enabled) {
  ['左','右'].forEach((LR,d)=>{['腕','手'].forEach((b_name,b_i)=>{
    const bone = bones_by_name[LR + b_name + '捩']
    if (!bone) return

    const [axis, angle] = bone.quaternion.toAxisAngle();
    if (angle) {
      const dir = (d == 0) ? 1 : -1;
      const sign = (Math.sign(axis.x) == dir) ? 1 : -1;
      const name = ((dir==1)?'left':'right') + ((b_i==0)?'Upper':'Lower') + 'Arm';
      this.getBoneNode(name).quaternion.multiply(this.process_rotation(TX.q1.setFromAxisAngle(TX.v1.set(dir*sign,0,0), angle), name));
    }
  })});
}

// bone END


// morph START

const blendshape_weight = {};

const MMD_morph_weight = mesh_MMD.geometry.morphs_weight_by_name;
this.MMD_morph_list.forEach(name => {
  const w = MMD_morph_weight[name]
  if (w == null) return

  const blendshape_name = this.blendshape_map_by_MMD_name[name]
  blendshape_weight[blendshape_name] = Math.max(blendshape_weight[blendshape_name]||0, w)
});

const name_blink = this.blendshape_map_name('blink', TX.use_VRM1);
const name_blink_l = this.blendshape_map_name('blink_l', TX.use_VRM1);
const name_blink_r = this.blendshape_map_name('blink_r', TX.use_VRM1);

const blink = blendshape_weight[name_blink] || 0;
const blink_factor = 1 - (blendshape_weight[this.blendshape_map_name('fun', TX.use_VRM1)]||0) * 0.25;
blendshape_weight[name_blink_l] = Math.max(blendshape_weight[name_blink_l]||0, blink) * blink_factor;
blendshape_weight[name_blink_r] = Math.max(blendshape_weight[name_blink_r]||0, blink) * blink_factor;
blendshape_weight[name_blink] = 0;

//じと目
if (MMD_morph_weight['じと目']) {
  const w = MMD_morph_weight['じと目'] * (1 - Math.max(blendshape_weight[name_blink_l], blendshape_weight[name_blink_r])) * 0.3;
  blendshape_weight[name_blink] = w;
}

// びっくり
if (MMD_morph_weight['びっくり']) {
  const w = 1 + MMD_morph_weight['びっくり'] * 2;
  blendshape_weight[name_blink_l] = Math.pow(blendshape_weight[name_blink_l], w);
  blendshape_weight[name_blink_r] = Math.pow(blendshape_weight[name_blink_r], w);
  blendshape_weight[name_blink] = Math.pow(blendshape_weight[name_blink], w);
}

// にやり, ω
const mouth_open = Math.max(
  blendshape_weight[this.blendshape_map_name('a', TX.use_VRM1)]||0,
  blendshape_weight[this.blendshape_map_name('i', TX.use_VRM1)]||0,
  blendshape_weight[this.blendshape_map_name('u', TX.use_VRM1)]||0,
  blendshape_weight[this.blendshape_map_name('e', TX.use_VRM1)]||0,
  blendshape_weight[this.blendshape_map_name('o', TX.use_VRM1)]||0
);
[{n:'e', w:MMD_morph_weight['にやり']}, {n:'u', w:MMD_morph_weight['ω']}].forEach(obj => {
  if (!obj.w) return

  const name = this.blendshape_map_name(obj.n, TX.use_VRM1);
  const w = blendshape_weight[name] || 0;
  blendshape_weight[name] = w + (1-w) * obj.w * (mouth_open*0.8 + (1-mouth_open)*0.2);
});

// Expose final blendshape_weight snapshot for VRM Direct before we zero out morphs.
// Uses the public setter so _autoAnimSnapshot stays private to the vrm-direct module.
if (window.VRMDirectSolver && VRMDirectSolver.setAnimSnapshot) {
  VRMDirectSolver.setAnimSnapshot(Object.assign({}, blendshape_weight));
}

// should be safe to reset geometry.morphs_weight_by_name after blendshape update, when MMD is not used
for (const name in MMD_morph_weight) {
  MMD_morph_weight[name] = 0
}

// three-vrm
const expressionManager = (TX.use_VRM1) ? vrm.expressionManager : vrm.blendShapeProxy;

const facemesh = System._browser.camera.facemesh;
let use_faceBlendshapes;
if (this.use_faceBlendshapes && facemesh.enabled) {
  use_faceBlendshapes = facemesh.use_faceBlendshapes && System._browser.camera.initialized;
  if (use_faceBlendshapes) {
    const f = facemesh.frames;

    if (facemesh.auto_blink || !facemesh.eye_tracking) {
      for (const b of [
'EyeBlinkLeft',
'EyeBlinkRight',
])
      {
        if (f.morph[b]) f.morph[b][0].weight = Math.max(f.morph[b][0].weight, blendshape_weight[(b=='EyeBlinkLeft')?name_blink_l:name_blink_r]);
      }
    }

    for (const name in blendshape_weight) {
      if (this.emotion_list.indexOf(name) == -1) {
        blendshape_weight[name] = 0;
      }
    }

    if (facemesh.auto_look_at_camera) {
      for (const b of [
'EyeLookUpLeft',
'EyeLookUpRight',
'EyeLookDownLeft',
'EyeLookDownRight',
'EyeLookInLeft',
'EyeLookInRight',
'EyeLookOutLeft',
'EyeLookOutRight',
])
      {
        if (f.morph[b]) f.morph[b][0].weight = 0;
      }
    }

    facemesh.faceBlendshapes_list.forEach(b=>{
      const m = f.morph[b];
      let weight = 0;
      if (m) {
        let ratio = Math.max(Math.min(m[0].t_delta/m[0].t_delta_frame,1),0);
        weight = m[0].weight * ratio + m[1].weight * (1-ratio);
      }
      blendshape_weight[this.faceBlendshapes_map[b]] = weight;
    });
  }
}
else if (System._browser.camera.VMC_receiver.expression_active) {
  const f = facemesh.frames;
  for (const b in f.morph) {
    const m = f.morph[b];
    let ratio = Math.max(Math.min(m[0].t_delta/m[0].t_delta_frame,1),0);
    blendshape_weight[this.faceBlendshapes_map[b]||b] = m[0].weight * ratio + m[1].weight * (1-ratio);
  }
}

for (const name in blendshape_weight) {
  expressionManager.setValue(name, blendshape_weight[name])
}

// morph END

//両目
// skip when using ARKit blendshapes
if (!use_faceBlendshapes) {
  const eye_bone = bones_by_name['両目'];
  const lookAt = vrm.lookAt;
  if (System._browser.camera.facemesh.auto_look_at_camera) {
    lookAt.lookAt(MMD_SA._trackball_camera.object.position);
  }
  else {
    const eye_aa = eye_bone.quaternion.toAxisAngle();
    lookAt.lookAt(lookAt.getLookAtWorldPosition(TX.v1).add( TX.v2.set(0,0,100).applyQuaternion(this.get_bone_rotation_by_MMD_name('頭').multiply(TX.q1.setFromAxisAngle(eye_aa[0], eye_aa[1]*5))) ));
  }
}


// update BEFORE VMC (especially for lookAt)
if (this._reset_physics_) { delete this._reset_physics_; this.resetPhysics(); }

if (MMD_SA.hide_3D_avatar) { vrm._update_core(time_delta) } else
vrm.update(time_delta);


if (MMD_SA.OSC.VMC.sender_enabled && MMD_SA.OSC.VMC.ready) {
  MMD_SA.OSC.VMC.ready = false;

  const model_pos_scale = 1/vrm_scale;

  const model_position0 = MMD_SA_options.Dungeon_options.options_by_area_id[MMD_SA_options.Dungeon.area_id]._startup_position_;
  const model_position_offset = TX.v4.copy(mesh.position).sub(model_position0).multiplyScalar(model_pos_scale);

  const warudo_mode = MMD_SA.OSC.app_mode == 'Warudo';
  const VNyan_mode = MMD_SA.OSC.app_mode && (MMD_SA.OSC.app_mode.indexOf('VNyan') != -1);
  const VSeeFace_mode = (MMD_SA.OSC.app_mode == 'VSeeFace') && MMD_SA.OSC.VMC.send_camera_data;

  let root_turned_around = warudo_mode || (MMD_SA.OSC.app_mode === 'VNyan(+Z)');
  let model_turned_around = MMD_SA.OSC.VMC.send_camera_data && (MMD_SA.OSC.app_mode === 'VNyan');

  const model_rot = TX.q4.copy(mesh.quaternion);
  if (!model_turned_around ^ !!this.is_VRM1) model_rot.premultiply(TX.q2.set(0,1,0,0));

  const pos_msgs = [
'root',
...((VSeeFace_mode) ? ((System._browser.camera.poseNet.enabled && MMD_SA.MMD.motionManager.para_SA.motion_tracking_upper_body_only && MMD_SA.MMD.motionManager.para_SA.center_view_enforced) ? [0,0,-5/10] : [0, 5/10, -60/10]) : [model_position_offset.x*((root_turned_around)?-1:1), model_position_offset.y, -model_position_offset.z*((root_turned_around)?-1:1)]),
-model_rot.x, -model_rot.y, model_rot.z, model_rot.w,
  ];
  if (System._browser.camera.poseNet.no_pose_data && (System._browser.camera.poseNet.hide_avatar_on_tracking_loss > 1)) pos_msgs[2] -= 999;

  let camera_msgs;
  if (MMD_SA.OSC.VMC.send_camera_data && !VSeeFace_mode) {
    const camera = MMD_SA.THREEX.camera.obj;
    const camera_pos = TX.v1.copy(camera.position).sub(mesh.position).multiplyScalar(model_pos_scale);

    const camera_rot = TX.q1.copy(camera.quaternion);
    if (!model_turned_around) camera_rot.premultiply(TX.q2.set(0,1,0,0));

    camera_pos.add(model_position_offset);

    camera_msgs = [
'Camera',
camera_pos.x*((!model_turned_around)?-1:1), camera_pos.y, -camera_pos.z*((!model_turned_around)?-1:1),
-camera_rot.x, -camera_rot.y, camera_rot.z, camera_rot.w,
camera.fov,
    ];
  }


setTimeout(()=>{

  const bone_msgs = [];
  for (let name_VMC in VRMSchema.HumanoidBoneName) {
    const name = VRMSchema.HumanoidBoneName[name_VMC];
    const bone = this.getBoneNode(name);
    if (!bone) continue;

    let b_pos, b_rot;
    if (this.is_VRM1) {
      b_pos = TX.v1.copy(bone.position);
      b_pos.x *= -1;
      b_pos.z *= -1;
      b_rot = TX.q1.copy(bone.quaternion);
      b_rot.x *= -1;
      b_rot.z *= -1;
    }
    else {
      b_pos = bone.position;
      b_rot = bone.quaternion;
    }

    bone_msgs.push([
(this.is_VRM1 && !VNyan_mode)?name_VMC:bone_map_VRM1_to_VRM0[name_VMC],
b_pos.x, b_pos.y, -b_pos.z,
-b_rot.x, -b_rot.y, b_rot.z, b_rot.w,
    ]);
  }

  const morph_msgs = [];
  for (const name of ['lookUp', 'lookDown', 'lookLeft', 'lookRight']) {
    const v = expressionManager.getValue(name);
    if (v != null)
      blendshape_weight[name] = v;
  }

  for (const name in blendshape_weight) {
    const name_for_blendshapes = (use_faceBlendshapes && this.faceBlendshapes_map_reversed[name]) || name;
    morph_msgs.push([
this.blendshape_map_name(name_for_blendshapes, this.is_VRM1),
blendshape_weight[name],
    ]);
  }


  let tracker_msgs = [];
  let tracker_index = 0;
  MMD_SA.THREEX._object3d_list_?.forEach(x_object=>{
    const p_bone = x_object.parent_bone;
    if (p_bone) {
      const obj = x_object._mesh;
      const obj_pos = (p_bone.disabled && !obj.visible) ? TX.v1.set(0,-999,0) : TX.v1.copy(obj.position).sub(mesh.position).multiplyScalar(model_pos_scale);

      const obj_rot = TX.q1.copy(obj.quaternion);
      let sign = 1;
      if (!model_turned_around) {
        sign = -1;
        obj_rot.multiply(TX.q2.set(0,1,0,0));
      }

      tracker_msgs.push([
'XRAnimator-tracker-' + ((x_object.VMC_tracker_index != null) ? x_object.VMC_tracker_index : tracker_index),
obj_pos.x*sign, obj_pos.y, -obj_pos.z*sign,
-obj_rot.x*sign, -obj_rot.y, obj_rot.z*sign, obj_rot.w,
      ]);

      if ((x_object._tracker_scale_ != obj.scale.x) || !x_object._tracker_scale_counter_) {
        x_object._tracker_scale_  = obj.scale.x;
        x_object._tracker_scale_counter_ = 60;

        const _tracker_index = ((x_object.VMC_tracker_index != null) ? x_object.VMC_tracker_index : tracker_index);
        if (warudo_mode) {
          const msg = 'XRAnimator|set_tracker_scale|' + (_tracker_index + ((_tracker_index < 10) ? ' ' : '')) + '|' + (x_object._tracker_scale_ * model_pos_scale);
          System._browser.WebSocket.send_message('ws://localhost:19190', msg);
        }
      }
      else if (x_object._tracker_scale_counter_) {
        x_object._tracker_scale_counter_--;
      }

      tracker_index++;
    }
  });


  MMD_SA.OSC.VMC.send(MMD_SA.OSC.VMC.Message("/VMC/Ext/Root/Pos",
    pos_msgs,
    'sfffffff'
  ));

  MMD_SA.OSC.VMC.send(MMD_SA.OSC.VMC.Bundle(
    ...bone_msgs.map(msg=>MMD_SA.OSC.VMC.Message(
"/VMC/Ext/Bone/Pos",
msg,
'sfffffff'
    ))
  ));

  MMD_SA.OSC.VMC.send(MMD_SA.OSC.VMC.Bundle(
    ...morph_msgs.map(msg=>MMD_SA.OSC.VMC.Message(
"/VMC/Ext/Blend/Val",
msg,
'sf'
    )),
    MMD_SA.OSC.VMC.Message("/VMC/Ext/Blend/Apply")
  ));

  if (camera_msgs) {
    MMD_SA.OSC.VMC_camera.send(MMD_SA.OSC.VMC_camera.Message("/VMC/Ext/Cam",
      camera_msgs,
      'sffffffff'
    ));
  }

  if (tracker_msgs.length) {
    MMD_SA.OSC.VMC_misc.send(MMD_SA.OSC.VMC_misc.Bundle(
      ...tracker_msgs.map(msg=>MMD_SA.OSC.VMC_misc.Message(
"/VMC/Ext/Tra/Pos",
msg,
'sfffffff'
      ))
    ));
  }

  MMD_SA.OSC.VMC.send(MMD_SA.OSC.VMC.Message("/VMC/Ext/OK", [1], 'i'));

  MMD_SA.OSC.VMC.ready = true;
}, 0);

}


if (!mesh.matrixAutoUpdate) {
  mesh.updateMatrix()
  mesh.updateMatrixWorld()
}
        }
      }
    });

    const vrm_scale = 11;

    let vrm_list = [];

    let rot_parent_upper_body_inv;

    const is_MMD_bone_motion_mixed = new RegExp(toRegExp(['上半身','肩'],'|'));
    const is_MMD_bone_motion_skipped = new RegExp(toRegExp(['センター','下半身','足','ひざ'],'|'));
    const is_MMD_bone_motion_parent_limited = new RegExp('^'+toRegExp(['首','腕'],'|'));
    const is_MMD_bone_motion_face = new RegExp(toRegExp(['頭','目'],'|'));

    let bone_map_MMD_to_VRM, bone_map_VRM_to_MMD;
    const bone_map_VRM1_to_VRM0 = {};
    const bone_map_VRM0_to_VRM1 = {};

    let MMD_bone_list = [];
    window.addEventListener('jThree_ready', ()=>{
      bone_map_MMD_to_VRM = _self.fix_rig_map({
センター:"hips",
上半身:"spine",
上半身2:"chest",
上半身3:"upperChest",
首:"neck",
頭:"head",
右肩:"rightShoulder",
右腕:"rightUpperArm",
右ひじ:"rightLowerArm",
右手首:"rightHand",
右親指０:"rightThumbMetacarpal",
右親指１:"rightThumbProximal",
右親指２:"rightThumbDistal",
右小指１:"rightLittleProximal",
右小指２:"rightLittleIntermediate",
右小指３:"rightLittleDistal",
右薬指１:"rightRingProximal",
右薬指２:"rightRingIntermediate",
右薬指３:"rightRingDistal",
右中指１:"rightMiddleProximal",
右中指２:"rightMiddleIntermediate",
右中指３:"rightMiddleDistal",
右人指１:"rightIndexProximal",
右人指２:"rightIndexIntermediate",
右人指３:"rightIndexDistal",
左肩:"leftShoulder",
左腕:"leftUpperArm",
左ひじ:"leftLowerArm",
左手首:"leftHand",
左親指０:"leftThumbMetacarpal",
左親指１:"leftThumbProximal",
左親指２:"leftThumbDistal",
左小指１:"leftLittleProximal",
左小指２:"leftLittleIntermediate",
左小指３:"leftLittleDistal",
左薬指１:"leftRingProximal",
左薬指２:"leftRingIntermediate",
左薬指３:"leftRingDistal",
左中指１:"leftMiddleProximal",
左中指２:"leftMiddleIntermediate",
左中指３:"leftMiddleDistal",
左人指１:"leftIndexProximal",
左人指２:"leftIndexIntermediate",
左人指３:"leftIndexDistal",
右目:"rightEye",
左目:"leftEye",
右足:"rightUpperLeg",
右ひざ:"rightLowerLeg",
右足首:"rightFoot",
右足先EX:"rightToes",
左足:"leftUpperLeg",
左ひざ:"leftLowerLeg",
左足首:"leftFoot",
左足先EX:"leftToes",
      });

      bone_map_VRM_to_MMD = {};
      Object.entries(bone_map_MMD_to_VRM).forEach(([MMD_name, VRM_name])=>{ bone_map_VRM_to_MMD[VRM_name] = MMD_name; });

      MMD_bone_list = Object.keys(bone_map_MMD_to_VRM);

      for (let name_VMC in _self.VRMSchema.HumanoidBoneName) {
        bone_map_VRM1_to_VRM0[name_VMC] = name_VMC.replace(/ThumbProximal/, 'ThumbIntermediate').replace(/ThumbMetacarpal/, 'ThumbProximal');
        bone_map_VRM0_to_VRM1[bone_map_VRM1_to_VRM0[name_VMC]] = name_VMC;
      }
    });

// three-vrm 1.0
    const blendshape_map_by_MMD_name_VRM1 = {
"あ": "aa",
"あ２": "aa",

"い": "ih",

"う": "ou",

"え": "ee",

"お": "oh",

"まばたき": "blink",

"まばたきL": "blinkLeft",
"ウィンク": "blinkLeft",
"ウィンク２": "blinkLeft",

"まばたきR": "blinkRight",
"ウィンク右": "blinkRight",
"ｳｨﾝｸ２右": "blinkRight",

"にこり": "relaxed",
"困る": "sad",
"怒り": "angry",
"笑い": "happy",
    };

    const blendshape_map_by_MMD_name_VRM0 = {
"あ": "a",
"あ２": "a",

"い": "i",

"う": "u",

"え": "e",

"お": "o",

"まばたき": "blink",

"まばたきL": "blink_l",
"ウィンク": "blink_l",
"ウィンク２": "blink_l",

"まばたきR": "blink_r",
"ウィンク右": "blink_r",
"ｳｨﾝｸ２右": "blink_r",

"にこり": "fun",
"困る": "sorrow",
"怒り": "angry",
"笑い": "joy",
    };

    const finger_list = {"親":0, "人":1, "中":2, "薬":3, "小":4};
    const finger_list_en = ["Thumb", "Index", "Middle", "Ring", "Little"];
    const nj_list = ["０","１","２","３"];

    let joint_stiffness_percent;
    function resetPhysics() {
MMD_SA.THREEX.get_model(0).resetPhysics();
    }

    _self = {
      get list() { return vrm_list; },
      set list(v) { vrm_list = v; },

      get vrm_scale() { return vrm_scale; },

      get joint_stiffness_percent () { return (joint_stiffness_percent == null) ? 100 : joint_stiffness_percent; },
      set joint_stiffness_percent (v) {
joint_stiffness_percent = v;
if (MMD_SA_options.Dungeon.started) {
  System._browser.on_animation_update.remove(resetPhysics, 0);
  System._browser.on_animation_update.add(resetPhysics, 60,0);
}
      },

      get bone_map_MMD_to_VRM() { return bone_map_MMD_to_VRM; },
      get bone_map_VRM_to_MMD() { return bone_map_VRM_to_MMD; },

      get bone_map_VRM1_to_VRM0() { return bone_map_VRM1_to_VRM0; },
      get bone_map_VRM0_to_VRM1() { return bone_map_VRM0_to_VRM1; },

      get blendshape_map_by_MMD_name_VRM0() { return blendshape_map_by_MMD_name_VRM1; },
      get blendshape_map_by_MMD_name_VRM1() { return blendshape_map_by_MMD_name_VRM1; },

      get is_MMD_bone_motion_mixed() { return is_MMD_bone_motion_mixed; },

      VRMSchema: { HumanoidBoneName:{
Hips: "hips",
Spine: "spine",
Chest: "chest",
UpperChest: "upperChest",
Neck: "neck",
Head: "head",
LeftEye: "leftEye",
RightEye: "rightEye",
Jaw: "jaw",
LeftUpperLeg: "leftUpperLeg",
LeftLowerLeg: "leftLowerLeg",
LeftFoot: "leftFoot",
LeftToes: "leftToes",
RightUpperLeg: "rightUpperLeg",
RightLowerLeg: "rightLowerLeg",
RightFoot: "rightFoot",
RightToes: "rightToes",
LeftShoulder: "leftShoulder",
LeftUpperArm: "leftUpperArm",
LeftLowerArm: "leftLowerArm",
LeftHand: "leftHand",
RightShoulder: "rightShoulder",
RightUpperArm: "rightUpperArm",
RightLowerArm: "rightLowerArm",
RightHand: "rightHand",
LeftThumbMetacarpal: "leftThumbMetacarpal",
LeftThumbProximal: "leftThumbProximal",
LeftThumbDistal: "leftThumbDistal",
LeftIndexProximal: "leftIndexProximal",
LeftIndexIntermediate: "leftIndexIntermediate",
LeftIndexDistal: "leftIndexDistal",
LeftMiddleProximal: "leftMiddleProximal",
LeftMiddleIntermediate: "leftMiddleIntermediate",
LeftMiddleDistal: "leftMiddleDistal",
LeftRingProximal: "leftRingProximal",
LeftRingIntermediate: "leftRingIntermediate",
LeftRingDistal: "leftRingDistal",
LeftLittleProximal: "leftLittleProximal",
LeftLittleIntermediate: "leftLittleIntermediate",
LeftLittleDistal: "leftLittleDistal",
RightThumbMetacarpal: "rightThumbMetacarpal",
RightThumbProximal: "rightThumbProximal",
RightThumbDistal: "rightThumbDistal",
RightIndexProximal: "rightIndexProximal",
RightIndexIntermediate: "rightIndexIntermediate",
RightIndexDistal: "rightIndexDistal",
RightMiddleProximal: "rightMiddleProximal",
RightMiddleIntermediate: "rightMiddleIntermediate",
RightMiddleDistal: "rightMiddleDistal",
RightRingProximal: "rightRingProximal",
RightRingIntermediate: "rightRingIntermediate",
RightRingDistal: "rightRingDistal",
RightLittleProximal: "rightLittleProximal",
RightLittleIntermediate: "rightLittleIntermediate",
RightLittleDistal: "rightLittleDistal",
      }},

      init: init,

      fix_rig_map: function (rig_map) {
if (TX.use_VRM1) return rig_map;

Object.keys(rig_map).forEach(name=>{
  switch (rig_map[name]) {
    case "rightThumbMetacarpal":
      rig_map[name] = "rightThumbProximal";
      break;
    case "rightThumbProximal":
      rig_map[name] = "rightThumbIntermediate";
      break;
    case "leftThumbMetacarpal":
      rig_map[name] = "leftThumbProximal";
      break;
    case "leftThumbProximal":
      rig_map[name] = "leftThumbIntermediate";
      break;
  }
});

return rig_map;
      },

      load: async function (url, para) {
if (!MMD_SA.MMD_started)
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

await new Promise((resolve) => {

TX.GLTF_loader.load(

  // URL of the VRM you want to load
  url,

  // called when the resource is loaded
  (function () {
    function main(vrm) {
// https://github.com/pixiv/three-vrm/releases/tag/v3.3.0
TX.THREE.VRMUtils.combineMorphs?.( vrm );

console.log(vrm);

const mesh_obj = vrm.scene
if (MMD_SA_options.use_shadowMap) {
  mesh_obj.traverseVisible(obj=>{
    if (obj.isMesh) obj.castShadow = true;
  });
}

mesh_obj.traverse( ( obj ) => {
  obj.frustumCulled = false;
  obj.layers.enable(MMD_SA.THREEX.PPE.N8AO.AO_MASK);
} );

// headless_mode
if (!MMD_SA.MMD_started && !MMD_SA_options._XRA_headless_mode) {
  // Cross-THREE-build safe add (bypasses instanceof check)
  if (mesh_obj.parent) {
    var _ri = mesh_obj.parent.children.indexOf(mesh_obj);
    if (_ri !== -1) mesh_obj.parent.children.splice(_ri, 1);
  }
  mesh_obj.parent = TX.data.scene;
  TX.data.scene.children.push(mesh_obj);
  if (mesh_obj.dispatchEvent) mesh_obj.dispatchEvent({ type: 'added' });
}

var vrm_obj = new VRM_object(para.vrm_index, vrm, { url:url_raw });

console.log('[XRA][VRM_LOADED]', {
  index: para.vrm_index,
  url: url_raw,
  isVRM1: !!vrm_obj.is_VRM1,
  metaVersion: vrm.meta?.metaVersion || null
});

vrm_obj.faceBlendshapes_map = {};
if (vrm.expressionManager.customExpressionMap['CheekPuff']) {
  vrm_obj.use_faceBlendshapes = true;
  System._browser.camera.facemesh.faceBlendshapes_list.map(b=>{
    vrm_obj.faceBlendshapes_map[b] = b;
  });
}
else if (vrm.expressionManager.customExpressionMap['BlendShape.CheekPuff']) {
  vrm_obj.use_faceBlendshapes = true;
  System._browser.camera.facemesh.faceBlendshapes_list.map(b=>{
    vrm_obj.faceBlendshapes_map[b] = 'BlendShape.' + b;
  });
}
else if (vrm.expressionManager.customExpressionMap['cheekPuff']) {
  vrm_obj.use_faceBlendshapes = true;
  System._browser.camera.facemesh.faceBlendshapes_list.map(b=>{
    vrm_obj.faceBlendshapes_map[b] = b.charAt(0).toLowerCase() + b.substring(1);
  });
}

if (vrm_obj.use_faceBlendshapes) {
  vrm_obj.faceBlendshapes_map_reversed = {};
  Object.entries(vrm_obj.faceBlendshapes_map).forEach(e=>{
    vrm_obj.faceBlendshapes_map_reversed[e[1]] = e[0];
  });
}

vrm_obj.emotion_list = (TX.use_VRM1) ? ['relaxed','happy','sad','angry'] : ['fun','joy','sorrow','angry'];
const _blendshape_map_by_MMD_name = {};
for (const name in vrm.expressionManager.expressionMap) {
  if (/surprise/i.test(name)) {
    _blendshape_map_by_MMD_name['びっくり'] = name;
    vrm_obj.emotion_list.push(name);
  }
  else if (/blush|shy/i.test(name)) {
    _blendshape_map_by_MMD_name['照れ'] = name;
    vrm_obj.emotion_list.push(name);
  }
  else if (!/tongueout/i.test(name) && /tongue|scornful/i.test(name)) {
    _blendshape_map_by_MMD_name['ぺろっ'] = name;
    vrm_obj.emotion_list.push(name);
  }
}
const blendshape_map_by_MMD_name = (TX.use_VRM1) ? blendshape_map_by_MMD_name_VRM1 : blendshape_map_by_MMD_name_VRM0;
vrm_obj.blendshape_map_by_MMD_name = Object.assign({}, blendshape_map_by_MMD_name, _blendshape_map_by_MMD_name);
vrm_obj.MMD_morph_list = Object.keys(vrm_obj.blendshape_map_by_MMD_name);
vrm_obj.build_blendshape_map_name(Object.assign({}, blendshape_map_by_MMD_name_VRM0, _blendshape_map_by_MMD_name), Object.assign({}, blendshape_map_by_MMD_name_VRM1, _blendshape_map_by_MMD_name));
console.log(vrm_obj.emotion_list, vrm_obj.MMD_morph_list);

if (!vrm_obj.is_VRM1) mesh_obj.quaternion.set(0,1,0,0);

if (TX.data.OutlineEffect && _self.use_OutlineEffect) {
  mesh_obj.traverseVisible(obj=>{
    if (obj.isMesh) obj.userData.outlineParameters = { visible: true };
  });
}

vrm._update_core = function (delta) {
  this.humanoid.update();

  if (this.lookAt) {
    this.lookAt.update(delta);
  }

  if (this.expressionManager) {
    this.expressionManager.update();
  }
};

vrm_obj.scale(vrm_scale);

var obj = Object.assign({
  data: vrm_obj,
  obj: mesh_obj,
  get parent() { return this.get_parent(); },

  no_scale: true,
}, para);

TX.obj_list[para.vrm_index] = obj;

if (object_url) {
  URL.revokeObjectURL(object_url)
}

if (!MMD_SA.MMD_started)
  MMD_SA.fn.setupUI();

resolve();
    }

    return function (gltf) {
TX.THREE.VRMUtils.removeUnnecessaryVertices( gltf.scene );
TX.THREE.VRMUtils.combineSkeletons( gltf.scene );

// three-vrm 1.0
if (TX.use_VRM1) {
  const vrm = gltf.userData.vrm;
  main(vrm);
}
else {
  THREEX.VRM.from(gltf).then(main);
}
    };
  })(),

  // called while loading is progressing
  (progress) => {},

  // called when loading has errors
  (error) => console.error(error)

);

});
      },

      load_extra: (()=>{
        let loading;

        return async function (src) {
const filename_new = src.replace(/^.+[\/\\]/, '');
let index_new = TX.threeX.models.findIndex(m=>filename_new == m.model_path.replace(/^.+[\/\\]/, ''));
if (index_new == 0) return;

if (loading) return;
loading = true;

if (index_new == -1) {
  index_new = TX.threeX.models.length;

  if (!MMD_SA_options.THREEX_options.model_path_extra)
    MMD_SA_options.THREEX_options.model_path_extra;
  MMD_SA_options.THREEX_options.model_path_extra[index_new-1] = src;

  await TX.threeX.VRM.load(src, {
vrm_index: index_new,

get_parent: function () {
  this.parent_data = TX.threeX._THREE.MMD.getModels()[0];
  return this.parent_data.mesh;
},

update: function () {}
  });
}

loading = false;

this.swap_model(index_new);
        };
      })(),

      swap_model: (()=>{
        let loading = false;
        return function (index_new) {
if ((index_new >= TX.threeX.models.length) || (index_new == 0)) return;

if (loading) return;
loading = true;

System._browser.on_animation_update.add(()=>{
  if (index_new > 3) {
    const index_last = TX.threeX.models.findIndex(m=>m.index_default==3);

    const model_now = TX.threeX.models[index_last];
    const model_new = TX.threeX.models[index_new];

    TX.threeX.utils.dispose(model_now.model.scene);
    TX.threeX.scene.remove(model_now.model.scene);

    model_new.index_default = 3;
    model_new.index = index_last;
    TX.threeX.models[index_last] = model_new;
    TX.threeX.models.length--;
    TX.obj_list.length--;

    index_new = index_last;
  }

  const model_now = TX.threeX.models[0];
  const model_new = TX.threeX.models[index_new];

  model_new.index = 0;
  model_now.index = index_new;
  TX.threeX.models.sort((a,b)=>a.index-b.index);
  TX.obj_list.sort((a,b)=>a.data.index-b.data.index);

  // Cross-THREE-build safe remove
  var _rmChild = model_now.model.scene;
  var _rmIdx = TX.threeX.scene.children.indexOf(_rmChild);
  if (_rmIdx !== -1) TX.threeX.scene.children.splice(_rmIdx, 1);
  _rmChild.parent = null;
  if (_rmChild.dispatchEvent) _rmChild.dispatchEvent({ type: 'removed' });

  // Cross-THREE-build safe add
  var _addChild = model_new.model.scene;
  if (_addChild.parent) {
    var _ri2 = _addChild.parent.children.indexOf(_addChild);
    if (_ri2 !== -1) _addChild.parent.children.splice(_ri2, 1);
  }
  _addChild.parent = TX.threeX.scene;
  TX.threeX.scene.children.push(_addChild);
  if (_addChild.dispatchEvent) _addChild.dispatchEvent({ type: 'added' });

  const icon = (model_new.is_VRM1) ? model_new.model.meta.thumbnailImage : model_new.model.meta.texture?.source.data;
  if (icon) {
    const canvas = MMD_SA_options.Dungeon.character.icon;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(icon, 0,0,64,64);
    MMD_SA_options.Dungeon.update_status_bar(true);
  }

  MMD_SA._force_motion_shuffle = true;

  loading = false;
}, 0,0);
        };
      })(),

      get use_OutlineEffect() { return this._use_OutlineEffect; },
      set use_OutlineEffect(v) { this._use_OutlineEffect = v; },
    };
    return _self;
};
