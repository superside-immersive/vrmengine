// threex-motion.js - Motion import/export utilities extracted from MMD_SA.js
// Part of Etapa 10C refactoring

window.MMD_SA_createTHREEX_Motion = function(TX) {
  return {
      convert_THREEX_motion_to_VMD: true,
      load_THREEX_motion: (function () {
        var loader;
        var _interp;

        async function load_THREEX_scripts() {
await TX.threeX.utils.load_THREEX();

if (MMD_SA.MMD_started) {
  TX.init_on_MMDStarted();
}
else {
  window.addEventListener("MMDStarted", ()=>{
    TX.init_on_MMDStarted();
  });
}

// Mar 14, 2024
const FBXLoader_module = await System._browser.load_script(System.Gadget.path + '/three.js/loaders/FBXLoader.js', true);
for (const name in FBXLoader_module) TX.THREE[name] = FBXLoader_module[name];
        }

        function BoneKey(name, time, pos, rot) {
this.name = name
this.time = time
this.pos = pos
this.rot = rot
// not using .prototype as keys will be "cloned" in .generateSkinAnimation()
this.interp = _interp
        }

        function MorphKey(name, time, weight) {
this.name = name;
this.time = time;
this.weight = weight;
        }

        function THREEX_VMD(boneKeys, morphKeys, timeMax) {
this.boneKeys = boneKeys;
this.morphKeys = morphKeys;
this.timeMax = timeMax;
        }

        function init(VMD) {
if (initialized) return;
initialized = true;

_interp = new Uint8Array([20,20,20,20,20,20,20,20, 107,107,107,107,107,107,107,107]);

if (VMD) {
  THREEX_VMD.prototype = Object.create(VMD.prototype);
  THREEX_VMD.prototype.cameraKeys = [];
  THREEX_VMD.prototype.lightKeys = [];
}
        }

        const build_rig_map = (()=>{
function MMD_LR(name) {
  var dir;
  if (/left/i.test(name))
    dir = '左';
  else if (/right/i.test(name))
    dir = '右';
  else if (/^(l|r)_/i.test(name) || /_(l|r)$/i.test(name) || /_(l|r)_/i.test(name))
    dir = (RegExp.$1.toLowerCase() == 'r') ? '右' : '左';
  else if (/_(L|R)/.test(name))
    dir = (RegExp.$1 == 'R') ? '右' : '左';

  return dir;
}

const nj_list = ["０","１","２","３"];
function MMD_finger(name) {
  let j_index;
// use 'middle' instead of /middle/, as regular expression will change RegExp.$ values
  var f = finger_map[RegExp.$1.toLowerCase().replace('middle', 'mid')];
  if (f) {
    j_index = parseInt(RegExp.$2);
  }
  else if (!f && (RegExp.$1.toLowerCase() == 'finger')) {
    f = Object.values(finger_map)[RegExp.$2.charAt(0)];
    j_index = (RegExp.$2.length == 1) ? 1 : (parseInt(RegExp.$2.charAt(1))+1);
  }

  if (f == '親')
    j_index--;

  f += '指' + nj_list[j_index];
  return MMD_LR(name) + f;
}

const spine_list = ['上半身','上半身2','上半身3'];
const arm_list = ["腕","ひじ","手首"];
const leg_list = ['足','ひざ','足首','足先EX'];
const finger_map = {
  thumb:"親",
  index:"人",
  mid:"中",
  ring:"薬",
  pinky:"小",
  little:"小",
};

          return (asset)=>{
function rig(k, v) {
  if (!_rig_map[k])
    _rig_map[k] = v
}

function is_armature(obj) {
  if (!has_armature) return false;
/*
// FBX-to-glTF test
  do {
    obj = obj.parent;
    if (!obj) return false;
    if (obj.name == 'Armature') return true;
  }
  while (obj?.name);
*/
  return false;
}

const bone_map = [];
let has_armature;
if (Array.isArray(asset)) {
  asset.forEach(t=>{
    const [name, property] = t.name.split('.');
    if (/position|quaternion/.test(property))
      bone_map.push(name);
  });
}
else {
  asset.traverse((obj)=>{
    if (obj.name == 'Armature') {
      has_armature = true;
    }
    else if (obj.isBone || is_armature(obj)) {
      if (bone_map.findIndex(name=>name==obj.name) == -1)
        bone_map.push(obj.name);
    }
// fingersbase
    else if (is_XRA_rig && /^(left|right)hand$/i.test(obj.name)) {
      bone_map.push(obj.name);
      console.log('XRA-rig-fix', obj.name);
    }
  });
}

const _rig_map = {};

bone_map.forEach(name=>{
  if (/^J_(Aim|Roll|Sec)/.test(name)) return;

  if (/hip|waist|pelvis/i.test(name) && !_rig_map['センター']) {
    rig('センター', name);
  }
  else if (/waist|spine|chest/i.test(name)) {
    const spine_name = spine_list.find(s_name=>!_rig_map[s_name]);
    if (spine_name)
      rig(spine_name, name);
  }
  else if (/neck/i.test(name)) {
    rig('首', name);
  }
  else if (/head/i.test(name)) {
    rig('頭', name);
  }
  else if (/(thumb|index|mid\D*|ring|pinky|little|finger)(\d+)($|_[LR]$)/i.test(name)) {
    const name_MMD = MMD_finger(name);
    if (!/twist|share/i.test(name))
      rig(name_MMD, name);
  }
  else if (/shoulder|clavicle/i.test(name)) {
    const dir = MMD_LR(name);
    rig(dir+'肩', name);
  }
  else if (/arm|hand/i.test(name)) {
    if (!/twist|share/i.test(name)) {
      const dir = MMD_LR(name);
      const arm_name = arm_list.find(a_name=>!_rig_map[dir+a_name]);
      if (arm_name)
        rig(dir+arm_name, name);
    }
  }
  else if (/leg|thigh|calf|foot|toe/i.test(name)) {
    if (!/twist|share/i.test(name)) {
      const dir = MMD_LR(name);
      const leg_name = leg_list.find(l_name=>!_rig_map[dir+l_name]);
      if (leg_name)
        rig(dir+leg_name, name);
    }
  }
});

const rig_map = { VRM:{}, MMD:{} };
Object.entries(_rig_map).forEach(e=>{
  rig_map.MMD[e[1]] = e[0];
  rig_map.VRM[e[1]] = VRM.bone_map_MMD_to_VRM[e[0]];
});

console.log(bone_map, rig_map)
return rig_map;
          };
        })();

        function convert_AnimationClip_to_VMD(clip, tracks, para) {
  const { url, rig_map, hips_height, morphKeys } = para;

  const boneKeys = {};
  for (const name in rig_map.MMD) {
    let name_MMD = rig_map.MMD[name];
    if (!name_MMD) continue;

    const tracks_by_name = tracks.filter(t=>t.name.split('.')[0]==name_MMD);
    if (!tracks_by_name.length) continue;

    let track_pos, track_rot;
    tracks_by_name.forEach(t=>{
      if (t instanceof TX.THREE.QuaternionKeyframeTrack) {
        track_rot = t;
      }
      else {
        track_pos = t;
      }
    });

    let pos_index = 0;
    let rot_index = 0;
    let f_last = -1;
    let keys;

    const time_max = Math.max(clip.duration, 1/30);

    if (name_MMD == 'センター') {
      pos_index = 0;
      f_last = -1;
      keys = [];

// offset the adjustment when applying VMD center position to VRM (.update_model())
      const leg_scale = TX.threeX.get_model(0).para.left_leg_length / MMD_SA_options.model_para_obj.left_leg_length;

      while (track_pos && (pos_index < track_pos.times.length)) {
        const f = Math.round(track_pos.times[pos_index]*30);
        if (f > f_last) {
          const pos = [track_pos.values[pos_index*3]/leg_scale, (track_pos.values[pos_index*3+1]-hips_height)/leg_scale, track_pos.values[pos_index*3+2]/leg_scale];
          const key = new BoneKey('センター', f/30, pos, [0,0,0,1]);
          keys.push(key);
          f_last = f;
        }
        pos_index++;
      }
      if (keys.length) {
        if (time_max - track_pos.times[track_pos.times.length-1] > 1/1000)
          keys.push(Object.assign({}, keys[keys.length-1], { time:time_max }));
        boneKeys['センター'] = keys;
      }

      name_MMD = '下半身';
    }

    rot_index = 0;
    f_last = -1;
    keys = [];
    while (track_rot && (rot_index < track_rot.times.length)) {
      const f = Math.round(track_rot.times[rot_index]*30);
      if (f > f_last) {
        let rot = [track_rot.values[rot_index*4], track_rot.values[rot_index*4+1], track_rot.values[rot_index*4+2], track_rot.values[rot_index*4+3]];
        const key = new BoneKey(name_MMD, f/30, [0,0,0], rot);
        keys.push(key);
        f_last = f;
      }
      rot_index++;
    }
    if (keys.length) {
      if (time_max - track_rot.times[track_rot.times.length-1] > 1/1000)
        keys.push(Object.assign({}, keys[keys.length-1], { time:time_max }));
      boneKeys[name_MMD] = keys;
    }
  }

  for (const _combo of [['上半身', '下半身','上半身'], ['上半身2', '上半身2','上半身3']]) {
    const bone_name = _combo[0];
    const combo = _combo.slice(1);

    const tracks_combo = combo.map(name=>boneKeys[name]);
    const rot_index = combo.map(name=>0);

    let f_last = -1;
    const keys = [];
    while (tracks_combo.some((t,i)=>t && (rot_index[i] < t.length))) {
      const f_rot = tracks_combo.map((t,i)=>(t) ? Math.round(t[rot_index[i]].time*30) : Infinity);

      let key;
// nearest next key
      const f = Math.min(...f_rot);
      if (f > f_last) {
        key = new BoneKey(bone_name, f/30, [0,0,0]);
        key._rot = {};
        keys.push(key);
        f_last = f;
      }
      else {
        key = keys[keys.length-1];
      }

// add rot if only there is no existing rot and the frame index is the same as the current key
      tracks_combo.forEach((t,i)=>{
        if (t && (f == f_rot[i])) {
          if (!key._rot[i])
            key._rot[i] = t[rot_index[i]].rot.slice();
          rot_index[i]++;
        }
      });
    }

    const key_next = combo.map(name=>null);
    keys.forEach((k, idx)=>{
      const rots = [];
      for (let i = 0, i_max = combo.length; i < i_max; i++) {
        if (!tracks_combo[i]) continue;

        if (k._rot[i]) {
          rots[i] = k._rot[i];
          continue;
        }

        const k_last = keys[idx-1];

        k_next = key_next[i];
        if (!k_next) {
          for (let n = idx+1, n_max = keys.length; n < n_max; n++) {
            if (keys[n]._rot[i]) {
              k_next = key_next[i] = keys[n];
              break;
            }
          }
        }
        if (!k_next) {
          rots[i] = k_last._rot[i];
          continue
        }
//if (!k_last._rot) { console.log(k_last.name); continue; }
        const q_last = TX.q1.fromArray(k_last._rot[i]);
        const q_next = TX.q2.fromArray(k_next._rot[i]);
        rots[i] = q_last.slerp(q_next, (k.time-k_last.time)/(k_next.time-k_last.time)).toArray();
      }

      const rot_final = TX.q1.set(0,0,0,1);
      for (let i = 0, i_max = combo.length; i < i_max; i++) {
        if (rots[i])
          rot_final.multiply(TX.q2.fromArray(rots[i]));
      }
      k.rot = rot_final.toArray();

      delete k._rot;
    });

    if (keys.length) boneKeys[bone_name] = keys;
  }

  delete boneKeys['上半身3'];
//console.log(boneKeys);

  const key_names = Object.keys(boneKeys);
  const vmd = new THREEX_VMD(
[...key_names.map(name=>boneKeys[name]).flat()],
[...Object.keys(morphKeys).map(name=>morphKeys[name]).flat()],
Math.max(...key_names.map(name=>boneKeys[name][boneKeys[name].length-1].time))
  );

  vmd.url = url;
  MMD_SA.vmd_by_filename[decodeURIComponent(vmd.url.replace(/^.+[\/\\]/, "").replace(/\.(fbx|glb|vrma)$/i, ""))] = vmd;

console.log(vmd);
  return vmd;
        }

        function get_sub_track_value(track_main, track_sub, time_index, para) {
function frame_id(t) {
  return Math.round(t*600);
}

if (time_index == 0)
  para.time_index = 0;

const f = frame_id(track_main.times[time_index]);
while ((para.time_index < track_sub.times.length) && (f > frame_id(track_sub.times[para.time_index]))) {
  para.time_index++;
}
para.time_index = Math.min(para.time_index, track_sub.times.length-1);

const dim = (track_main instanceof TX.THREE.QuaternionKeyframeTrack) ? 4 : 3;
const k1 = para.time_index * dim;
const value = (dim == 4) ? q1 : v1;
value.fromArray(track_sub.values.slice(k1, k1+dim));

if ((para.time_index > 0) && (f != frame_id(track_sub.times[para.time_index]))) {
  const time_max = Math.max(track_main.times[time_index], track_sub.times[para.time_index]);
  const time_delta = time_max - track_main.times[time_index];
  const time_range = time_max - track_sub.times[para.time_index-1];
  if ((time_delta > 0) && (time_range > 0)) {
    const k0 = (para.time_index-1) * dim;
    if (dim == 4) {
//if (TX.q1.toArray().some(v=>isNaN(v))) console.log(track_sub, para.time_index+'/'+(track_sub.times.length-1), k1);
      TX.q2.fromArray(track_sub.values.slice(k0, k0+4));
      TX.q1.slerp(q2, time_delta/time_range);
    }
    else if (dim == 3) {
      TX.v2.fromArray(track_sub.values.slice(k0, k0+3));
      TX.v1.lerp(v2, time_delta/time_range);
    }
  }
}

para.time_index++;

return value.toArray();
        }

        window.addEventListener('jThree_ready', ()=>{
TX.threeX.utils.convert_AnimationClip_to_VMD = convert_AnimationClip_to_VMD;
        });

        let motion_format, rig_name, is_XRA_rig, is_XRA_rig_VRM0, is_XRA_rig_VRM1;

        let initialized;

        return async function ( url, model, VMD ) {
          init(VMD);

if (/\.vrma$/i.test(url)) {
// three-vrm-animation
// https://github.com/pixiv/three-vrm/tree/dev/packages/three-vrm-animation

// https://pixiv.github.io/three-vrm/packages/three-vrm-animation/lib/three-vrm-animation.module.js
  if (!THREEX.createVRMAnimationClip) {
    const three_vrma_module = await System._browser.load_script(System.Gadget.path + '/three.js/three-vrm-animation.module.js', true);
//console.log(three_vrma_module)
    Object.assign(THREEX, three_vrma_module);

    GLTF_loader.register((parser) => {
      return new THREEX.VRMAnimationLoaderPlugin( parser );
    });
  }

  const modelX = TX.threeX.get_model(0);
  const model_scale = modelX.model_scale;

  const gltfVrma = await GLTF_loader.loadAsync( url );
  const vrmAnimation = gltfVrma.userData.vrmAnimations[ 0 ];
// create animation clip
  const clip = THREEX.createVRMAnimationClip( vrmAnimation, modelX.model );
//console.log(clip);

  const rig_map = build_rig_map(clip.tracks);

  clip.tracks.forEach(t=>{
    const [ name, property ] = t.name.split('.');
    if (rig_map.MMD[name])
      t.name = rig_map.MMD[name] + '.' + property;

    if (property == 'position') {
      const values = t.values;
      for (let i = 0, i_max = values.length/3; i < i_max; i++) {
        const _i = i*3;
        TX.v1.set(values[_i], values[_i+1], values[_i+2]);
        modelX.process_position(v1).multiplyScalar(model_scale);
        values[_i]   = TX.v1.x;
        values[_i+1] = TX.v1.y;
        values[_i+2] = TX.v1.z;
      }
    }
    else if (property == 'quaternion') {
      const values = t.values;
      for (let i = 0, i_max = values.length/4; i < i_max; i++) {
        const _i = i*4;
        TX.q1.set(values[_i], values[_i+1], values[_i+2], values[_i+3]);
        modelX.process_rotation(q1);
        values[_i]   = TX.q1.x;
        values[_i+1] = TX.q1.y;
        values[_i+2] = TX.q1.z;
        values[_i+3] = TX.q1.w;
      }
    }
  });
//console.log(clip.tracks)

  const hips_height = modelX.para.pos0['hips'][1] * model_scale;
//console.log(hips_height)
  const vmd = convert_AnimationClip_to_VMD(clip, clip.tracks, { url, rig_map, hips_height, morphKeys:{} });

  return vmd;
}

          motion_format = (/\.fbx$/i.test(url)) ? 'FBX' : 'GLTF';

          await load_THREEX_scripts();

          const THREEX_enabled = MMD_SA.THREEX.enabled;

          loader = loader || new TX.THREE.FBXLoader(); // A loader which loads FBX

          const q_list = [];

          const load_promise = (motion_format == 'FBX') ? loader.loadAsync( toFileProtocol(url) ) : new Promise((resolve)=>{ this.load_GLTF(toFileProtocol(url), resolve); });

          return load_promise.then( ( asset ) => {
const MMD_started = MMD_SA.MMD_started;
const to_VMD = !THREEX_enabled || !MMD_started || this.convert_THREEX_motion_to_VMD;
let VRM_mode;

let vrm;
let bones_by_name;
let model_type;

if (!to_VMD) {
  VRM_mode = true;
  vrm = model.model;
  model_type = 'VRM';
}
else {
  bones_by_name = model.mesh.bones_by_name;
  model_type = 'MMD';
}

const modelX = (!to_VMD) ? model : ((!THREEX_enabled) ? MMD_SA.THREEX.get_model(model._model_index) : MMD_SA.THREEX.models_dummy[0]);

if (!to_VMD) delete model.animation._single_frame;

let clip = TX.THREE.AnimationClip.findByName( asset.animations, 'mixamo.com' ); // extract the AnimationClip
if (clip) {
  rig_name = 'mixamo';
}
else {
  clip = asset.animations.sort((a,b)=>b.duration-a.duration)[0];//[asset.animations.length-1];
  rig_name = clip.name;//clip.tracks[0].name.split('.')[0].substring(0,5);
}
console.log(rig_name, asset);

const rig_para = rig_name.split('|');
is_XRA_rig = rig_para[0] == 'XRAnimator';
is_XRA_rig_VRM0 = is_XRA_rig && (rig_para[1] == 'VRM0');
is_XRA_rig_VRM1 = is_XRA_rig && (rig_para[1] == 'VRM1');

if (motion_format == 'GLTF') asset = asset.scene;

let rig_map = this.rig_map[rig_name];
if (!rig_map) {
  rig_map = build_rig_map(asset);
//  return null;
}

let skeletons = [];
if (1||motion_format == 'GLTF') {
  asset.traverse((obj)=>{
    if (obj.isSkinnedMesh && obj.skeleton && (skeletons.findIndex(s=>s==obj.skeleton) == -1))
      skeletons.push(obj.skeleton);
  });
}
//skeletons.length=0;
console.log('skeletons', skeletons)

const bone_clones = {};
Object.entries(rig_map.VRM).forEach(kv=>{
  const b = asset.getObjectByName(kv[0]);
  bone_clones[kv[1]] = {
    bone: b,
    clone: b.clone()
  };
});

skeletons.forEach(s=>s.pose());

// FBX-to-glTF test
//if (!skeletons.length) skeletons = [{}];

console.log('bone_clones', bone_clones)

VRM.fix_rig_map(rig_map.VRM);
if (!rig_map.MMD) {
  rig_map.MMD = {};
  for (const k in rig_map.VRM) {
    const MMD_name = VRM.bone_map_VRM_to_MMD[rig_map.VRM[k]];
    if (MMD_name)
      rig_map.MMD[k] = MMD_name;
  }
}

let tracks = []; // KeyframeTracks compatible with VRM will be added here

const restRotation = new TX.THREE.Quaternion();
const restRotationInverse = new TX.THREE.Quaternion();
const parentRestWorldRotation = new TX.THREE.Quaternion();
const _quatA = new TX.THREE.Quaternion();
const _quatB = new TX.THREE.Quaternion();
const _vec3 = new TX.THREE.Vector3();

let hipsPositionScale;

// Adjust with reference to hips height.
let motion_hips = asset.getObjectByName( Object.entries(rig_map.VRM).find(kv=>kv[1]=='hips')[0] );
console.log('motion_hips', motion_hips);
//let hips_q = motion_hips.quaternion.clone();//motion_hips.getWorldQuaternion(new TX.THREE.Quaternion());

const axis_vector = { y:new TX.THREE.Vector3(), x:new TX.THREE.Vector3() };
Object.keys(axis_vector).forEach(dir=>{
  const axis = axis_vector[dir];
  if (dir == 'y') {
    for (const name of ['上半身','上半身2','上半身3','首']) {
      const kv = Object.entries(rig_map.MMD).find(kv=>kv[1]==name);
      if (kv) {
        const bone = asset.getObjectByName( kv[0] );
        if (bone)
          axis.add(bone.position);
      }
    }
  }
  else {
    axis.copy(asset.getObjectByName( Object.entries(rig_map.MMD).find(kv=>kv[1]=='左肩')[0] ).position).sub(asset.getObjectByName( Object.entries(rig_map.MMD).find(kv=>kv[1]=='右肩')[0] ).position);
  }
//console.log(axis.toArray())
  const max = Math.max(...axis.normalize().toArray().map(v=>Math.abs(v)));
  if (max == Math.abs(axis.x)) {
    axis.set(Math.sign(axis.x),0,0);
  }
  else if (max == Math.abs(axis.y)) {
    axis.set(0,Math.sign(axis.y),0);
  }
  else {
    axis.set(0,0,Math.sign(axis.z))
  }
});
const x_axis = axis_vector.x;
const y_axis = axis_vector.y;
const z_axis = TX.v1.crossVectors(x_axis, y_axis);
TX.m1.set(
  x_axis.x, x_axis.y, x_axis.z, 0,
  y_axis.x, y_axis.y, y_axis.z, 0,
  z_axis.x, z_axis.y, z_axis.z, 0,
  0,0,0,1
);
const rig_rot = new TX.THREE.Quaternion().copy(MMD_SA._q1.setFromBasis(m1));

hips_q = motion_hips.getWorldQuaternion(new TX.THREE.Quaternion());
//console.log(hips_q.toArray())

hips_q.conjugate().premultiply(rig_rot);
//console.log(rig_rot.toArray())

const hips_q_inv = hips_q.clone().conjugate();

console.log('rig_rot,[hips_q]', rig_rot, [hips_q.clone()]);//, motion_hips.quaternion, motion_hips.parent.getWorldQuaternion(new TX.THREE.Quaternion()), new TX.THREE.Quaternion().copy(hips_q_inv).premultiply(motion_hips.quaternion).multiply(TX.q2.copy(motion_hips.quaternion).conjugate()).multiply(hips_q)]);
let _rig_rot_perpendicular = Math.abs(rig_rot.w) % 1 < 0.0001;
/*
// FBX-to-glTF test
if (1) {
    hips_q.set(-0.707,0,0,0.707).normalize();
    hips_q_inv.copy(hips_q).conjugate();
//    rig_rot.copy(hips_q)
}
else
*/
if (skeletons.length && (bone_clones['hips'].clone.quaternion.w != 1)) {
  if (_rig_rot_perpendicular) {
    hips_q.copy(rig_rot);
    hips_q_inv.copy(hips_q).conjugate();
  }
}

let hips_height;
// always use native model bone measuremenet if even the motion is loaded in MMD mode (e.g. loading FBX on app start)
if (THREEX_enabled) {
  const model_native = (!to_VMD) ? model : MMD_SA.THREEX.get_model(model._model_index);
  const vrmHipsY = model_native.para.pos0['hips'][1] * ((!to_VMD) ? 1 : model_native.model_scale);
  const vrmRootY = 0;//vrm.scene.getWorldPosition( _vec3 ).y;

  hips_height = Math.abs( vrmHipsY - vrmRootY );
}
else {
  hips_height = bones_by_name["左足"].pmxBone.origin[1];
}


let motionHipsHeight;
if (skeletons.length) {
  const _modelX = MMD_SA.THREEX.get_model(model._model_index);

  const _leftFoot = bone_clones['leftFoot'].bone;
  motionHipsHeight = 0;
  let _leg_node = _leftFoot;
  while (_leg_node?.position && rig_map.VRM[_leg_node.name] != 'leftUpperLeg') {
    motionHipsHeight += _leg_node.position.length();
    _leg_node = _leg_node.parent;
  }

  const _hips_height = TX.v1.fromArray(_modelX.get_bone_origin_by_MMD_name('左足')).distanceTo(TX.v2.fromArray(_modelX.get_bone_origin_by_MMD_name('左ひざ'))) + TX.v2.distanceTo(TX.v1.fromArray(_modelX.get_bone_origin_by_MMD_name('左足首')));

  hipsPositionScale = _hips_height / motionHipsHeight;
  console.log('_hips_height', _hips_height, motionHipsHeight);
}
else {
  const hips = bone_clones['hips'].bone.getWorldPosition(v1);
  const feet = (bone_clones['leftToes'] || bone_clones['leftFoot']).bone.getWorldPosition(v2);
  if (feet.y < 0) {
console.log('feet.y',feet.y);
    hips.y -= feet.y;
  }
// can be negative
  motionHipsHeight = hips.applyQuaternion(bone_clones['hips'].bone.getWorldQuaternion(q1).conjugate().premultiply(rig_rot)).y;
//  motionHipsHeight = TX.v1.copy((motion_hips.position.lengthSq()) ? motion_hips.position : motion_hips.parent.position).applyQuaternion(TX.q1.copy(motion_hips.quaternion).conjugate().premultiply(rig_rot)).y;
  hipsPositionScale = hips_height / motionHipsHeight;
}

console.log('hipsPositionScale', hipsPositionScale);

//hips_height = Math.abs(motionHipsHeight) * hipsPositionScale;
console.log('hips_height', hips_height,motionHipsHeight);

const morphKeys = {};

clip.tracks.forEach( ( track ) => {

  if (is_XRA_rig_VRM1)
    track.name = track.name.replace(/^Normalized_/, '');

  // Convert each tracks for VRM use, and push to `tracks`
  const trackSplitted = track.name.split( '.' );
  const mixamoRigName = trackSplitted[ 0 ];
  const propertyName = trackSplitted[trackSplitted.length-1];

  if (!/position|quaternion/.test(propertyName)) {
    if (/^VRMExpression_(.+)$/.test(mixamoRigName)) {
      const expression_name = RegExp.$1;
      const name_MMD = Object.entries((TX.threeX.enabled) ? TX.models[0].blendshape_map_by_MMD_name : VRM.blendshape_map_by_MMD_name_VRM1).find(kv=>kv[1]==expression_name)?.[0];
      if (name_MMD) {
        const time_max = Math.max(clip.duration, 1/30);

        let pos_index = 0;
        let f_last = -1;
        let keys = [];
        while (pos_index < track.times.length) {
          const f = Math.round(track.times[pos_index]*30);
          if (f > f_last) {
            const weight = track.values[pos_index*3];
            const key = new MorphKey(name_MMD, f/30, weight);
            keys.push(key);
            f_last = f;
          }
          pos_index++;
        }

        if (keys.length) {
          if (time_max - track.times[track.times.length-1] > 1/1000)
            keys.push(Object.assign({}, keys[keys.length-1], { time:time_max }));
          morphKeys[name_MMD] = keys;
        }
      }
    }
    return;
  }

  const vrmBoneName = rig_map[model_type][ mixamoRigName ];
  const vrmNodeName = ((vrmBoneName == '上半身3') && vrmBoneName) || modelX.getBoneNode(vrmBoneName, true)?.name;

  if ( vrmNodeName != null ) {
    const MMD_node_name = (VRM_mode && VRM.bone_map_VRM_to_MMD[vrmBoneName]) || vrmBoneName;

    const mixamoRigNode = asset.getObjectByName( mixamoRigName );

// probably need a better solution
    let adjust_center = (skeletons.length && (MMD_node_name == 'センター')) ? (_rig_rot_perpendicular && (Math.abs(TX.q1.copy(hips_q_inv).premultiply(motion_hips.quaternion).multiply(TX.q2.copy(motion_hips.quaternion).conjugate()).multiply(hips_q).normalize().w) < 0.999)) : false;

const b_intermediate = [];

const b = modelX.getBoneNode(vrmBoneName, false);
if (b) {
  let b_parent = b;
  let b_parent_name;
  do {
    b_parent = (VRM_mode) ? b_parent.parent : modelX.get_MMD_bone_parent(b_parent.name);
    b_parent_name = (b_parent && ((VRM_mode) ? model.bone_three_to_vrm_name[b_parent.name] : b_parent.name)) || '';
  }
  while (b_parent && b_parent.isBone && (Object.values(rig_map[model_type]).indexOf(b_parent_name) == -1));

  let rig_parent = mixamoRigNode.parent;
// in case of MMD, ignore the missing 上半身3 here and combine with 上半身2 later instead
  while (rig_parent.isBone && (!b_parent || !b_parent.isBone || (!modelX.getBoneNode(rig_map[model_type][rig_parent.name], false) && (VRM_mode || (rig_map[model_type][rig_parent.name] != '上半身3'))))) {
    b_intermediate.push(rig_parent.name);
    rig_parent = rig_parent.parent;
  }
// a simplified case (for QuickMagic) to ignore b_intermediate if b_parent_name is センター instead of the expected bone parent (may need to watch out for cases of 上半身=>センター in which there may be valid b_intermediate in between)
  if (b_intermediate.length && (b_parent_name == 'センター')) {
    console.log('b_intermediate (skipped)', vrmBoneName, b_parent_name);
    b_intermediate.length = 0;
  }
  if (b_intermediate.length) console.log('b_intermediate', vrmBoneName, b_intermediate, b_parent_name);
}


    // Store rotations of rest-pose.
    mixamoRigNode.getWorldQuaternion( restRotationInverse ).invert();
    mixamoRigNode.parent.getWorldQuaternion( parentRestWorldRotation );
    restRotation.copy(restRotationInverse).conjugate();
//if (MMD_node_name=='左腕') console.log(MMD_node_name, restRotation.toArray())


//if (MMD_node_name.indexOf('肩') != -1) console.log(MMD_node_name, mixamoRigNode.parent.name, parentRestWorldRotation.toArray())
if (b_intermediate.length) {
  b_intermediate.forEach((name, idx)=>{
    const tracks = clip.tracks.filter(t=>t.name.split('.')[0]==name);
    if (!tracks.length) {
      if (q_list[idx])
        q_list[idx].tracks = null;
      return;
    }

    const q = q_list[idx] = q_list[idx] || {
      restRotationInverse: new TX.THREE.Quaternion(),
      parentRestWorldRotation: new TX.THREE.Quaternion(),
      restRotation: new TX.THREE.Quaternion(),
    };
    q.tracks = {};
    tracks.forEach(track=>{
      q.tracks[track.name.split('.')[1]] = track;
    });

    const b = asset.getObjectByName( name );
    b.getWorldQuaternion(q.restRotationInverse).invert();
    b.parent.getWorldQuaternion(q.parentRestWorldRotation);
    q.restRotation.copy(q.restRotationInverse).conjugate();
  });
}


    if ( track instanceof TX.THREE.QuaternionKeyframeTrack ) {

      // Retarget rotation of mixamoRig to NormalizedBone.
      for ( let i = 0; i < track.values.length; i += 4 ) {

        let flatQuaternion = track.values.slice( i, i + 4 );

        _quatA.fromArray( flatQuaternion );

        // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
        _quatA
          .premultiply( parentRestWorldRotation )
          .multiply( restRotationInverse );


        _quatA.premultiply(hips_q).multiply(hips_q_inv);


if (b_intermediate.length) {
  _quatB.set(0,0,0,1);
  b_intermediate.forEach((name, idx)=>{
    const q = q_list[idx];
    if (!q || !q.tracks || !q.tracks.quaternion) return;

    const q_track = q.tracks.quaternion;
    const q_flat = get_sub_track_value(track, q_track, i/4, q);
    TX.q1.fromArray(q_flat);

    // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
    q1
      .premultiply( q.parentRestWorldRotation )
      .multiply( q.restRotationInverse );

    TX.q1.premultiply(hips_q).multiply(hips_q_inv);

    _quatB.multiply(q1);
  });

  _quatA.premultiply(_quatB);
}

        if (adjust_center) _quatA.premultiply(hips_q_inv);

        _quatA.toArray().forEach( ( v, index ) => {
          track.values[ index + i ] = v;
        } );

      }

      const _track_name = `${vrmNodeName}.${propertyName}`;
      const _track = new TX.THREE.QuaternionKeyframeTrack(
_track_name,
track.times,
track.values.map( ( v, i ) => ( (VRM_mode && (!TX.use_VRM1 || vrm.meta?.metaVersion === '0') && (i % 2 === 0)) ? - v : v ) ),
      );
      _track._rig_name = [mixamoRigName, vrmBoneName];

      const _track_index = tracks.findIndex(t=>(t.name||t[0].name)==_track_name);
      if (_track_index != -1) {
        if (!Array.isArray(tracks[_track_index]))
          tracks[_track_index] = [tracks[_track_index]];
        tracks[_track_index].push(_track);
      }
      else {
        tracks.push(_track);
      }

// a trick to fix animation mixing issue when the FBX animation has only one frame
if (VRM_mode && (track.times.length == 1) && VRM.is_MMD_bone_motion_mixed.test(VRM.bone_map_VRM_to_MMD[vrmBoneName])) {
  if (!model.animation._single_frame) model.animation._single_frame = {};
  model.animation._single_frame[vrmBoneName] = tracks[tracks.length-1].values.slice();
}
    }
    else if ( track instanceof TX.THREE.VectorKeyframeTrack ) {
      if (!VRM_mode && (propertyName != 'position')) return;
      if (MMD_node_name != 'センター') return;


const vq = _quatA.copy(mixamoRigNode.quaternion).conjugate().premultiply(rig_rot);//_quatA.copy(restRotationInverse);

for ( let i = 0, i_max = track.values.length; i < i_max; i += 3 ) {
  const v_flat = track.values.slice( i, i + 3 );
  _vec3.fromArray(v_flat)

  if (propertyName == 'position') {


if (b_intermediate.length) {
  const v_offset = TX.v4.set(0,0,0);
  b_intermediate.forEach((name, idx)=>{
    const q = q_list[idx];
    if (!q || !q.tracks || !q.tracks.position) return;

    const v_track = q.tracks.position;
    const v_flat = get_sub_track_value(track, v_track, i/3, q);

    const b = asset.getObjectByName(name);
    v_offset.add(TX.v1.fromArray(v_flat)).applyQuaternion(TX.q1.copy(b.quaternion).conjugate());
  });
  _vec3.add(v_offset);
}


    _vec3.applyQuaternion(vq);
//_vec3.set(0,0,0)
  }

// probably need a better solution
  if (skeletons.length && _rig_rot_perpendicular) _vec3.applyQuaternion(TX.q4.copy(vq).conjugate());

  if (is_XRA_rig_VRM0) { _vec3.x *= -1; _vec3.z *= -1; }

  _vec3.toArray().map( ( v, idx ) => ( (VRM_mode && (propertyName == 'position') && (!TX.use_VRM1 || vrm.meta?.metaVersion === '0') && (idx % 3 !== 1)) ?  -v : v ) * hipsPositionScale ).forEach( ( v, index ) => {
    track.values[ index + i ] = v;
  });
}
//console.log(track.values)

const _track_name = `${vrmNodeName}.${propertyName}`;
const _track = new TX.THREE.VectorKeyframeTrack( _track_name, track.times, track.values );
_track._rig_name = [mixamoRigName, vrmBoneName];

const _track_index = tracks.findIndex(t=>(t.name||t[0].name)==_track_name);
if (_track_index != -1) {
  if (!Array.isArray(tracks[_track_index]))
    tracks[_track_index] = [tracks[_track_index]];
  tracks[_track_index].push(_track);
}
else {
  tracks.push(_track);
}


//      const value = track.values.map( ( v, i ) => ( (VRM_mode && (!TX.use_VRM1 || vrm.meta?.metaVersion === '0') && (i % 3 !== 1)) ? - v : v ) * hipsPositionScale );
//      tracks.push( new TX.THREE.VectorKeyframeTrack( (!VRM_mode)?vrmNodeName:`${vrmNodeName}.${propertyName}`, track.times, value ) );

    }

  }

} );

tracks = tracks.map(track=>{
  if (!Array.isArray(track)) return track;

  track.forEach(t=>{
    t._order_ = Object.keys(rig_map[model_type]).indexOf(t._rig_name[0]);
  });
  track.sort((a,b)=>a._order_-b._order_);

  const track_main = track[0];
  const [node_name, property_name] = track_main.name.split('.');
  if (property_name == 'quaternion') {
    const para_list = [];
    for (let j = 1; j < track.length; j++)
      para_list[i] = {};
    for ( let i = 0, i_max = track.values.length; i < i_max; i += 4 ) {
      const flatQuaternion = track_main.values.slice( i, i + 4 );
      _quatA.fromArray(flatQuaternion);

      for (let j = 1; j < track.length; j++) {
        const track_sub = track[j];
        const q_flat = get_sub_track_value(track_main, track_sub, i/4, para_list[j]);
        _quatA.multiply(TX.q1.fromArray(q_flat));
      }

      _quatA.toArray().forEach( ( v, index ) => {
        track_main.values[ index + i ] = v;
      });
    }
//console.log(track_main._rig_name, track)
  }

  return track_main;
});
//console.log(tracks)

if (!VRM_mode) {
  return convert_AnimationClip_to_VMD(clip, tracks, { url, rig_map, hips_height, morphKeys });
}

return new TX.THREE.AnimationClip( decodeURIComponent(url.replace(/^.+[\/\\]/, "").replace(/\.(fbx|glb)$/i, "")), clip.duration, tracks );

          } );
        };
      })(),

      load_GLTF: (function () {
        var GLTF_loader;

        async function init() {
if (GLTF_loader) return;

if (!TX.threeX.enabled) {
  const GLTFLoader_module = await import(System.Gadget.path + '/three.js/loaders/GLTFLoader.js');
  Object.assign(TX.THREE, GLTFLoader_module);
}

GLTF_loader = new TX.THREE.GLTFLoader();
        }

        return async function (url, onload) {
await init();

GLTF_loader.load(
	// resource URL
	toFileProtocol(url),
	// called when the resource is loaded
	function ( gltf ) {
/*
scene.add( gltf.scene );

gltf.animations; // Array<TX.THREE.AnimationClip>
gltf.scene; // TX.THREE.Group
gltf.scenes; // Array<TX.THREE.Group>
gltf.cameras; // Array<TX.THREE.Camera>
gltf.asset; // Object
*/
onload(gltf);
	},
	// called while loading is progressing
	function ( xhr ) {

//		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'ERROR: GLTF loading failed', url );

	}
);
        };
      })(),

      export_GLTF_motion: async function (filename, vmd) {
const model = TX.threeX.get_model(0);
const vrm = model.model;

let time_max = 0;

const boneKeys_by_name = {};
vmd.boneKeys.forEach((k,idx)=>{
  if (!boneKeys_by_name[k.name])
    boneKeys_by_name[k.name] = { keys:[], keys_full:[] }
  boneKeys_by_name[k.name].keys.push(k);
  time_max = Math.max(time_max, k.time);
});

const morphKeys_by_name = {};
vmd.morphKeys?.forEach((k,idx)=>{
  if (!morphKeys_by_name[k.name])
    morphKeys_by_name[k.name] = { keys:[] }
  morphKeys_by_name[k.name].keys.push(k);
  time_max = Math.max(time_max, k.time);
});

const f_max = Math.round(time_max*30) + 1;

const name_sync = ['全ての親','センター','上半身','下半身'];
for (const d of ['左','右']) {
  if (boneKeys_by_name[d+'手捩']) {
    if (boneKeys_by_name[d+'ひじ'] && ((boneKeys_by_name[d+'手捩'].keys.length > 2) || boneKeys_by_name[d+'手捩'].keys.some(k=>k.rot[3]!=1))) {
      name_sync.push(d+'ひじ', d+'手捩');
    }
  }
}

for (const name of name_sync) {
  const bk = boneKeys_by_name[name];
  if (!bk) continue;

  let f = 0;
  const bk_keys = bk.keys;
  const bk_keys_full = bk.keys_full;
  bk_keys.forEach((k,idx)=>{
    const _f = Math.round(k.time*30);
    if (_f > f) {
      let k_last = bk_keys[idx-1];
      const _f_last = Math.round(k_last.time*30);
      const _f_diff = _f - _f_last;
      for (let i = 1; i < _f_diff; i++) {
        const k_new = { time:(_f_last+i)/30, pos:TX.v1.fromArray(k_last.pos).lerp(TX.v2.fromArray(k.pos), i/_f_diff).toArray(), rot:TX.q1.fromArray(k_last.rot).slerp(TX.q2.fromArray(k.rot), i/_f_diff).toArray() };
        bk_keys_full.push(k_new);
      }
    }

    bk_keys_full.push(k);
    f++;
  });

  if (bk_keys_full.length < f_max) {
    const k_last = bk_keys_full[bk_keys_full.length-1];
    for (let i = bk_keys_full.length; i < f_max; i++) {
      const k = Object.assign({}, k_last);
      k.time = i/30;
      bk_keys_full.push(k);
    }
  }
}

const tracks = [];

for (const name_MMD in boneKeys_by_name) {
  let name = VRM.bone_map_MMD_to_VRM[name_MMD];
  let name_MMD_translated = name_MMD;
  if (!name && (name_MMD.indexOf('足ＩＫ') != -1)) {
    name_MMD_translated = name_MMD.charAt(0) + '足首';
    name = VRM.bone_map_MMD_to_VRM[name_MMD_translated];
  }

  if (name) {
    const d = (/(left|right)LowerArm/.test(name)) ? ((RegExp.$1 == 'left') ? '左' : '右') : null;
    const keys = (boneKeys_by_name[name_MMD].keys_full.length) ? boneKeys_by_name[name_MMD].keys_full : boneKeys_by_name[name_MMD].keys;

    let times = [];
    let q_values = [];
    let v_values = [];

    const leg_scale = model.para.left_leg_length / MMD_SA_options.model_para_obj.left_leg_length;

    keys.forEach((k,f)=>{
      let q_multiply, q_premultiply;

      if (name == 'hips') {
        const pos = TX.v1.fromArray(k.pos);
        const bone_move = boneKeys_by_name['全ての親'];
        if (bone_move) {
          pos.add(TX.v2.fromArray(bone_move.keys_full[f].pos));
        }

        pos.multiplyScalar(1/VRM.vrm_scale);
        pos.multiplyScalar(leg_scale);
        pos.add(TX.v2.fromArray(model.para.pos0['hips']));

        v_values.push(...model.process_position(pos).toArray());

        const bone_lower_body = boneKeys_by_name['下半身'];
        if (bone_lower_body)
          q_multiply = bone_lower_body.keys_full[f].rot;
      }
      else if (name == 'spine') {
        const bone_lower_body = boneKeys_by_name['下半身'];
        if (bone_lower_body)
          q_premultiply = TX.q1.fromArray(bone_lower_body.keys_full[f].rot).conjugate().toArray();
      }
      else if (d) {
        const bone_twist = boneKeys_by_name[d+'手捩'];
        if (bone_twist)
          q_multiply = bone_twist.keys_full[f].rot;
      }

      const q = TX.q1.fromArray(k.rot);
      if (q_multiply)
        q.multiply(TX.q2.fromArray(q_multiply));
      if (q_premultiply)
        q.premultiply(TX.q2.fromArray(q_premultiply));

      q_values.push(...model.process_rotation(q).toArray());

      times.push(k.time);
    });

// need to use normalized bones, or the rotations will be transformed when exported
    const node_name = model.get_bone_by_MMD_name(name_MMD_translated).name;//.replace(/Normalized_/, '');

    if (v_values.length)
      tracks.push(new TX.THREE.VectorKeyframeTrack(node_name+'.position', times, v_values));

    tracks.push(new TX.THREE.QuaternionKeyframeTrack(node_name+'.quaternion', times, q_values));
  };
}

for (const name_MMD in morphKeys_by_name) {
  const name = model.blendshape_map_by_MMD_name[name_MMD];

  if (name) {
    const keys = morphKeys_by_name[name_MMD].keys;

    let times = [];
    let m_values = [];

    keys.forEach((k,f)=>{
      m_values.push(k.weight, k.weight, k.weight);
      times.push(k.time);
    });

    const trackName = vrm.expressionManager.getExpressionTrackName(name).replace(/\.weight$/, '.scale');
    tracks.push(new TX.THREE.VectorKeyframeTrack(trackName, times, m_values));
  }
}

const animation_clip = new TX.THREE.AnimationClip('XRAnimator|VRM'+((model.is_VRM1)?1:0)+'|', time_max, tracks);

console.log(animation_clip);

//model.mesh.animations[0] = animation_clip;

//SA_topmost_window.EV_sync_update.RAF_paused = true;

model.reset_pose = true;

// must reset MMD pos/rot here for some unknown reasons
const mesh_MMD = TX.threeX._THREE.MMD.getModels()[0].mesh;
const _pos = mesh_MMD.position.clone();
const _rot = mesh_MMD.quaternion.clone();
mesh_MMD.position.set(0,0,0);
mesh_MMD.quaternion.set(0,0,0,1);
if (!model.is_VRM1) mesh_MMD.quaternion.premultiply(TX.q1.set(0,1,0,0));

System._browser.on_animation_update.add(async ()=>{
  await this.export_GLTF('motion_'+Date.now(), model.mesh, { animations:[animation_clip], onlyVisible:false });

  mesh_MMD.position.copy(_pos);
  mesh_MMD.quaternion.copy(_rot);

  model.reset_pose = false;

//  SA_topmost_window.EV_sync_update.RAF_paused = false;
}, 1,0);
      },

      export_GLTF: (()=>{
        async function init() {
if (TX.THREE.GLTFExporter) return;

// April 27, 2024
const GLTFExporter_module = await System._browser.load_script(System.Gadget.path + '/three.js/exporters/GLTFExporter.js', true);
for (const name in GLTFExporter_module) TX.THREE[name] = GLTFExporter_module[name];

exporter = new THREEX.GLTFExporter();
        }

        let exporter;

        return async function (filename='model', scene, options={}) {
await init();

return new Promise((resolve)=>{
setTimeout(()=>{
  exporter.parse(
	scene,
	// called when the gltf has been generated
	function ( gltf ) {

		console.log( gltf );
		System._browser.save_file(filename+'.glb', gltf, 'application/octet-stream');

		resolve();
	},
	// called when there is an error in the generation
	function ( error ) {

		console.error( error );

	},
    Object.assign({ binary:true }, options)
  );
}, 1000);
});
        };
      })(),

      export_VRMA: (()=>{
        let convertBVHToVRMAnimation, BVHLoader;

        let initialized;
        async function init() {
if (initialized) return;
initialized = true;

const module_bvh2vrma = await System._browser.load_script(System.Gadget.path+'/three.js/bvh2vrma/convertBVHToVRMAnimation.js',true);
convertBVHToVRMAnimation = module_bvh2vrma.convertBVHToVRMAnimation;

// change BVHLoader.js to _BVHLoader.js to prevent XRA module name conflict
const module_bvh = await System._browser.load_script(System.Gadget.path+'/three.js/loaders/_BVHLoader.js',true);
BVHLoader = new module_bvh.BVHLoader();
        }

        return async function () {
await init();

let filename;
let vmd = System._browser.camera.motion_recorder.vmd;
if (vmd) {
  filename = 'motion_' + Date.now();
}
else {
  filename = MMD_SA.MMD.motionManager.filename;
  vmd = MMD_SA.vmd_by_filename[filename];
}

await System._browser.load_script(toFileProtocol(System.Gadget.path + '/js/BVH_filewriter.js'));
const bvh_txt = BVH_FileWriter(null, vmd.boneKeys);

// https://github.com/vrm-c/bvh2vrma/blob/main/src/components/LoadBVH.tsx#L43
const bvh = BVHLoader.parse(bvh_txt);
const vrmaBuffer = await convertBVHToVRMAnimation(bvh, {
        scale: 0.01
});

System._browser.save_file(filename+'.vrma', vrmaBuffer, 'application/octet-stream');
        };
      })(),
  };
};
