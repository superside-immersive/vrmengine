// motion-para-part3.js — Motion parameters: walking, stand/sit IIFEs
// Extracted from animate.js lines 1448-2090
(function () {
  function XRA_dungeon() {
    return XRA_DungeonCompat();
  }

  function XRA_dungeonOptions() {
    return XRA_DungeonOptionsCompat();
  }

  Object.assign(MMD_SA_options.motion_para, {
    "モブ歩き男80f": {
  look_at_screen: false,

  _speed: 23.2/80 *30,

//  SFX: (()=>{ const s=[]; for (let i=0; i<12; i++) s.push({ frame:i*10+2, sound:{} }); return s; })(),

  SFX: [
    { frame:2,  sound:{} },
    { frame:22, sound:{} },
    { frame:42, sound:{} },
    { frame:62, sound:{} },
  ],

  motion_tracking_enabled: true, motion_tracking_upper_body_only: true,

  motion_tracking: {
    look_at_screen:true,
    motion_default_weight: {
      head: 1,
    },
    hip_adjustment: {
      rotation_weight: 0.5,
      displacement_weight: 1,
    },
  },
    }

   ,"stand_simple": (()=>{
      let center_view;
      let center_view_timestamp;

      return {
  center_view_enforced: true

 ,_cover_undies: false

 ,trackball_camera_limit: { "min": { length:8 } }

 ,motion_tracking_enabled: true
 ,get motion_tracking_upper_body_only() { return this.center_view_enforced || !XRA_dungeonOptions().character_movement_disabled; }

 ,camera_auto_adjust: false
 ,get camera_auto_adjust_fov() { return !!this.center_view_enforced; }

 ,motion_tracking: {
    hip_adjustment: {
      rotation_weight: 0.5,
      displacement_weight: 0.5,
    },
  }

 ,get center_view() {
if (center_view_timestamp == RAF_timestamp) return center_view;
center_view_timestamp = RAF_timestamp;

const modelX = MMD_SA.THREEX.get_model(0);
if (this.center_view_enforced) {
  const neck_y = modelX.get_bone_origin_by_MMD_name('首')[1];
//  const hips_y = modelX.get_bone_origin_by_MMD_name((MMD_SA.THREEX.enabled)?'センター':'下半身')[1];
  const height_ref = neck_y/3;//hips_y;//neck_y - hips_y;
  const cb = MMD_SA_options.camera_position_base;

// https://hofk.de/main/discourse.threejs/2022/CalculateCameraDistance/CalculateCameraDistance.html
// fov 50: 0.93261531630999718566001238959912
  let f_fov = 0.93261531630999718566001238959912;//2 * Math.tan(Math.PI/180 * MMD_SA.THREEX.camera.obj.fov / 2);
  let d = height_ref / f_fov;
//DEBUG_show(d+'/'+neck_y);
  let cz = -(cb[2] - Math.max(d*1.7, 10)) * XRA_dungeonOptions().camera_position_z_sign;

  center_view = [0, (neck_y-cb[1]), cz];
//DEBUG_show(Date.now()+'\n'+cz)
}
else {
  center_view = [0,0,0];
}

return center_view;
  }

 ,object_click_disabled: true

 ,IK_disabled: { test:(name)=>false, _IK_name_list:[] }
//(name.indexOf('腕ＩＫ') != -1) && System._browser.camera.poseNet.IK_disabled

// ,get look_at_screen() { return !System._browser.camera.facemesh.enabled; }
      };
    })()

   ,"sit_simple": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  center_view: [0,-3.5,5],

//  look_at_screen: true,
  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    hip_adjustment: {
      displacement_weight: 0.1
    }
  }
    }

   ,"i-shaped_balance_TDA_f0-50": {
  freeze_onended: true

 ,motion_tracking_enabled: true, motion_tracking_upper_body_only: true
 ,motion_tracking: {
    look_at_screen:true,
    hip_adjustment: {
      rotation_weight: 0.5,
      displacement_weight: 1,
    },
    arm_default_stickiness: { default_rotation_weight:0.5 },
  }

 ,adjustment_per_model: {
    _default_ : {
  skin_default: {
    "センター": (function () {
var scale
function get_scale() {
// 10.56958
  if (!scale) {
    let model = THREE.MMD.getModels()[0]
    let bones_by_name = model.mesh.bones_by_name
    let leg_length = MMD_SA._v3a.fromArray(bones_by_name["左足"].pmxBone.origin).distanceTo(MMD_SA._v3b.fromArray(bones_by_name["左足ＩＫ"].pmxBone.origin));
    scale = leg_length/10.56958
  }
  return scale;
}
return { keys_mod: [{ frame:50, pos:{ get x() { return 2.53*get_scale(); }, get y() { return 4.78*get_scale(); }, z:0.79 } }] };
    })()

   ,"左腕": { keys_mod: [{ frame:50, rot:{ x:8.3, y:23.7-15, z:-33.2-10 } }] }
   ,"右腕": { keys_mod: [{ frame:50, rot:{ x:8.0-3, y:2.3, z:79.6 } }] }
   ,"cover_undies": {
      "左腕": { rot:{x:-19.3, y:26.9, z:-20.6} }
     ,"左ひじ": { rot:{x:19.5+10, y:14.5, z:90.3-15} }

     ,"右腕": { rot:{x:23.1, y:-2.2, z:-66.2} }
     ,"右ひじ": { rot:{x:-1.5, y:27.8, z:-61.9} }
     ,"右手首": { rot:{x:-18.0, y:21.3, z:-23.8} }
    }
  }
    }
  }

    }

   ,"leg_hold": (function () {
      var _pos_, _rot_, _zoom_scale_;
      var cam_pos, cam_rot, cam_speed, cam_speed_rot;
      var model_speed;
      var timestamp;
      var _ground_plane_visible;
      var orgy_level, orgy_cooling, orgy_spasm;
      var orgy_morph = [
  {name:"あ",weight:0}, {name:"う",weight:0}
 ,{name:"笑い",weight:0.5}, {name:"びっくり",weight:0.5}
 ,{name:"あ２",alt:[{name:"あ",weight:1}],weight:0.75}, {name:"困る",weight:1}, {name:"涙",weight:1}, {name:"はぁと",alt:[{name:"瞳小"}],weight:1}, {name:"ぺろっ",weight:1}
      ];

      window.addEventListener("jThree_ready", function () {
cam_pos = new THREE.Vector3()
cam_rot = new THREE.Vector3()
cam_speed = new THREE.Vector3()
cam_speed_rot = new THREE.Vector3()
model_speed = new THREE.Vector3()
      });

      return {
  freeze_onended: true
// ,look_at_screen: false
 ,initial_physics_reset: true

 ,_cover_undies: false
// ,object_click_disabled: true

 ,look_at_screen_bone_list: [
    { name:"両目", weight_screen:0.3, weight_motion:1 }
  ]

 ,onstart: function () {
var model = THREE.MMD.getModels()[0].mesh
_pos_ = model.position.clone()
_rot_ = model.quaternion.clone()

_zoom_scale_ = MMD_SA.WebXR.zoom_scale
MMD_SA.WebXR.zoom_scale = 1

var camera = MMD_SA._trackball_camera.object
cam_pos.copy(camera.position)
cam_rot.setEulerFromQuaternion(MMD_SA.TEMP_q.setFromRotationMatrix(camera.matrixWorld),"YZX")
cam_speed.set(0,0,0)
cam_speed_rot.set(0,0,0)
model_speed.set(0,0,0)
timestamp = RAF_timestamp

_ground_plane_visible = MMD_SA.WebXR.ground_plane.visible

// lower the ground to prevent unexpected collisions due to .matrixWorld_physics_scale
jThree.MMD.groundLevel -= 10

orgy_level = 0
orgy_cooling = 0
orgy_spasm = 0
  }

 ,onended: function (loop_end) {
var model = THREE.MMD.getModels()[0].mesh
model.position.copy(_pos_)
model.quaternion.copy(_rot_)

MMD_SA.WebXR.zoom_scale = _zoom_scale_

MMD_SA.WebXR.ground_plane.visible = _ground_plane_visible

jThree.MMD.groundLevel = 0

XRA_dungeon().character.hp_add(9999)
  }

 ,onplaying: function () {
MMD_SA.WebXR.ground_plane.visible = false

var model = THREE.MMD.getModels()[0].mesh
var camera = MMD_SA._trackball_camera.object
model.position.copy(camera.position)
//model.position.y -= 11.5

var time_diff = (RAF_timestamp - timestamp) / 1000
var speed_ratio = Math.min(time_diff/0.2, 1)

var rot = MMD_SA.TEMP_v3.setEulerFromQuaternion(MMD_SA.TEMP_q.setFromRotationMatrix(camera.matrixWorld),"YZX")
var rot_speed = MMD_SA._v3a.copy(rot).sub(cam_rot).multiplyScalar(1/time_diff)
cam_speed_rot.multiplyScalar(1-speed_ratio).add(rot_speed.multiplyScalar(speed_ratio))

cam_rot.copy(rot)

rot.z = 0
rot.x = (rot.x < -0.9) ? (rot.x+0.9) : 0
//var rot_y = rot.y
//rot.y = 0
model.quaternion.setFromEuler(rot,"YZX")

var speed = MMD_SA.TEMP_v3.copy(camera.position).sub(cam_pos).multiplyScalar(1/time_diff)
cam_speed.multiplyScalar(1-speed_ratio)
cam_speed.add(speed.multiplyScalar(speed_ratio))
model_speed.copy(cam_speed).applyQuaternion(MMD_SA.TEMP_q.copy(model.quaternion).conjugate())

//model_speed.set(0,0,0)
cam_speed_rot.y = cam_speed_rot.y % (Math.PI*2);
if (cam_speed_rot.y > Math.PI)
  cam_speed_rot.y -= Math.PI*2
else if (cam_speed_rot.y < -Math.PI)
  cam_speed_rot.y += Math.PI*2
model_speed.x -= cam_speed_rot.y*3

//MMD_SA._custom_skin.push({ key:{ name:"全ての親", pos:[0,-11.5,0] ,rot:[0,0,0,1], interp:MMD_SA._skin_interp_default }, idx:model.bones_by_name["全ての親"]._index });
  }

 ,process_morphs: function (model, morph) {
var morph_name, _m_idx, _m;
var weight = model_speed.length()/5

var score = Math.min((Math.abs(model_speed.y)*3+Math.abs(model_speed.x)+Math.abs(model_speed.z))/20, 1)
var damage = (score > 0.5) ? -score : 0.1

XRA_dungeon().character.hp_add(damage, function (c) {
  var time_diff = (RAF_timestamp - timestamp) / 1000
  if (c.hp == 0) {
    orgy_cooling = 1
  }
  else {
// 10 sec to 0
    orgy_cooling = Math.max(orgy_cooling-time_diff/10, 0)
  }

  if (orgy_cooling) {
// 0.5 sec to max
    orgy_level = Math.min(orgy_level+time_diff*2, 1)
  }
  else {
    orgy_level = Math.max(orgy_level-time_diff*2, 0)
  }
  return {}
});

MMD_SA_options.auto_blink = !(orgy_level || (weight > 0.5));

if (orgy_level > 0.5) {
//DEBUG_show(orgy_level+'\n'+orgy_cooling)
  orgy_morph.forEach(function (m) {
    morph_name = m.name
    _m_idx = model.pmx.morphs_index_by_name[morph_name]
    if ((_m_idx == null) && m.alt) {
      m.alt.some(function (m2) {
        morph_name = m2.name
        _m_idx = model.pmx.morphs_index_by_name[morph_name]
        if (_m_idx != null) {
          if (m2.weight == null)
            m2.weight = m.weight
          m = m2
          return true
        }
      });
    }
    if (_m_idx != null) {
      _m = model.pmx.morphs[_m_idx]
      MMD_SA._custom_morph.push({ key:{ weight:m.weight, morph_type:_m.type, morph_index:_m_idx, override_weight:true }, idx:morph.target_index_by_name[morph_name] });
    }
   });

  return
}

weight = Math.min(weight, 1);

morph_name = "あ"
_m_idx = model.pmx.morphs_index_by_name[morph_name]
if (_m_idx != null) {
  _m = model.pmx.morphs[_m_idx]
  MMD_SA._custom_morph.push({ key:{ weight:0.1+weight*0.9, morph_type:_m.type, morph_index:_m_idx, override_weight:true }, idx:morph.target_index_by_name[morph_name] });
}

morph_name = "笑い"
_m_idx = model.pmx.morphs_index_by_name[morph_name]
if (_m_idx != null) {
  _m = model.pmx.morphs[_m_idx]
  MMD_SA._custom_morph.push({ key:{ weight:0.2+weight*0.2, morph_type:_m.type, morph_index:_m_idx }, idx:morph.target_index_by_name[morph_name] });
}

morph_name = "困る"
_m_idx = model.pmx.morphs_index_by_name[morph_name]
if (_m_idx != null) {
  _m = model.pmx.morphs[_m_idx]
  MMD_SA._custom_morph.push({ key:{ weight:0.5+weight*0.4, morph_type:_m.type, morph_index:_m_idx }, idx:morph.target_index_by_name[morph_name] });
}

morph_name = "涙"
_m_idx = model.pmx.morphs_index_by_name[morph_name]
if (_m_idx != null) {
  _m = model.pmx.morphs[_m_idx]
  MMD_SA._custom_morph.push({ key:{ weight:(weight>0.5)?1:0, morph_type:_m.type, morph_index:_m_idx }, idx:morph.target_index_by_name[morph_name] });
}
  }

 ,process_bones: function (model, skin) {
var mesh = model.mesh

var center = mesh.bones_by_name["センター"]
center.position.x -= Math.max(Math.min(model_speed.x/10, 2),-2)
center.position.y -= Math.max(Math.min(model_speed.y/10, 2),-2)

var rot

rot = MMD_SA.TEMP_v3.set(Math.max(Math.min(model_speed.y/50-model_speed.z/100, Math.PI/4),-Math.PI/4), 0, Math.max(Math.min(model_speed.x/100, Math.PI/4),-Math.PI/4));
if (orgy_level) {
  let time_diff = (RAF_timestamp - timestamp) / 1000
  orgy_spasm = (!orgy_spasm && (Math.random() < time_diff)) ? 2 : Math.max(orgy_spasm-time_diff*10, 0)
  let _ratio = orgy_level*orgy_level *(1+((orgy_spasm)?0.1*((orgy_spasm>1)?2-orgy_spasm:orgy_spasm):0)) *Math.PI/180
  rot.x += -30 *_ratio
  rot.z +=  15 *_ratio
}
rot = MMD_SA.TEMP_q.setFromEuler(rot.multiplyScalar(0.5), "YZX");
mesh.bones_by_name["首"].quaternion.multiply(rot)
mesh.bones_by_name["頭"].quaternion.multiply(rot)

rot = MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.set(Math.max(Math.min(model_speed.y/100, Math.PI/8),-Math.PI/8), Math.max(Math.min(model_speed.x/100, Math.PI/8),-Math.PI/8), 0), "YZX");
mesh.bones_by_name["左肩"].quaternion.multiply(rot)
mesh.bones_by_name["右肩"].quaternion.multiply(rot)

if (orgy_level > 0.5) {
  rot = MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.set(-10*Math.PI/180,0,0), "YZX");
  mesh.bones_by_name["両目"].quaternion.multiply(rot)
}

mesh.bones_by_name["全ての親"].position.setX(0).setY(-11.5).setZ(0)

// update at the very last (which should be process_bones)
timestamp = RAF_timestamp
cam_pos.copy(MMD_SA._trackball_camera.object.position)

//DEBUG_show(model_speed.toArray().join('\n'))
  }

 ,adjustment_per_model: {
    _default_ : {
  morph_default: {
    "涙": { weight:0 }
   ,"あ２": { weight:0 }
   ,"はぁと": { weight:0 }
   ,"ぺろっ": { weight:0 }
   ,"びっくり": { weight:0 }
  }
    }
  }


      };
    })()

   ,"Mixamo - Happy Idle": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  motion_tracking_enabled: true, motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    motion_default_weight: {
      'head': 0.5,
    },
    hip_adjustment: {
      rotation_weight: 0.5,
      displacement_weight: 1,
    },
    arm_default_stickiness: { default_rotation_weight:0.5 },
  },
    }

   ,"Mixamo - Sitting Idle01": {
  adjustment_per_model: {
    _default_: {
  skin_default: {
    "左腕": { rot_add:{x:0, y:0, z:-15} }
  }
    },
    'ボサ髪_naked_feet.pmx': {
  skin_default: {
    "左腕": { rot_add:{x:0, y:0, z:-5} }
  }
    },
  },

  center_view: [0,-5,5],

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    arm_default_stickiness: {
      'right': { default_rotation_weight: 0.5 },
      'left' : { parent:{ weight:{x:{left:0.5,right:0.5}, y:{down:0.5,up:0.5}, z:{backward:0,forward:0.5}} } },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'left',
      transformation: {
        position: {
          x: { scale:2 },
          y: { add:-0.1, min:0.05, scale:3 },
          z: { add:0.2, scale:2 },
          length_max: 1.2,
//          camera_weight: 0.5,
        },
        rotation: {
          y: { foot_ratio:0.5 },
        }
      },
    },
  }
    }

   ,"Mixamo - Sitting Idle02": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  center_view: [0,-5.5,7.5],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    motion_default_weight: {
      'head': 0,
      'upper_body': 0.5,
    },
    hip_adjustment: {
      rotation_weight: 1/3,
      displacement_weight: 0.1,
      feet_fixed_weight:0.8,
    },
    arm_default_stickiness: {
      default_rotation_weight:1, default_position_weight:1,
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'left',
      transformation: {
        position: {
          x: { scale:1.5 },
          y: { add:0.4, scale:1.75 },
          z: { add:0.4, scale:2 },
          camera_weight: 0.75,
        },
        rotation: {
          y: { scale:1.25 },
        },
      },
    },
  }
    }

   ,"Mixamo - Sitting02": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  center_view: [0,-3.5,5],

//  look_at_screen: true,
  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    arm_default_stickiness: {
      parent:{ weight: 1/3 },
    },
    hip_adjustment: {
      left: { feet_fixed_weight: 2/3 },
      right: { feet_fixed_weight: 0.9 },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'left',
      transformation: {
        position: {
          x: { scale:1.5 },
          y: { add:0.4, scale:1.5 },
          z: { add:0.3, scale:2 },
          camera_weight: 0.75,
        },
      },
    },
  }
    }

   ,"sitting_sexy01": {
//  look_at_screen: true,

  adjustment_per_model: {
    _default_: {
  skin_default: {
    '左足ＩＫ': { rot_add:{x:-30, y:0, z:0} },
//    '右足ＩＫ': { rot_add:{x:-15, y:0, z:0} }
  }
    },
    'DUMMY.pmx' : {
  skin_default: {
    '左足ＩＫ': { rot_add:{x:-30, y:0, z:0} },
    '右ひじ': { rot_add:{x:(31.4-(19)), y:(137.7-(153.5)), z:(74.7+10-(81.4))} },
    '右腕': { rot_add:{x:(6.9-(19.8)), y:(0.2-(11.9)), z:(-12-(-9.3))} },
  }
    },
  },

  center_view: [0,-2.5,5],

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  auto_fit: {
    table: {
      reference_bones: ['右ひじ'],
      depth_scale: 0.1,
      rotation: { x:0, y:-90, z:0 },
    },
    chair: {
      depth_scale: 0.5,
      depth_rotation: { x:0, y:-90, z:0 },
    },
  },

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 2,
    motion_default_weight: {
      'head': 1
    },
    hip_adjustment: {
      'left' : { feet_fixed_weight:1 },
      'right': { feet_fixed_weight:2/3, },
    },
    arm_default_stickiness: {
      'right': { parent:{name:'頭', weight:{ x:{left:1.5, right:0.5}, y:{down:1.5, up:0.5}, z:{backward:0.5, forward:1.5} }}, default_position_weight:0.1, default_rotation_weight:0.8 },
      'left' : { default_position_weight:1, default_rotation_weight:1 },
    },
    arm_tracking: {
      elbow_lock: {
        right: {},
      }
    },
    arm_as_leg: {
//      enabled: true,
//toes_disabled: true,
      linked_side: 'right',
      transformation: {
        position: {
          x: { scale:1.5 },
          y: { add:0.4, scale:1.5 },
          z: { add:0.3, scale:2 },
          camera_weight: 0.75,
        },
        rotation: {
          y: { foot_ratio:0.5 },
        },
      },
    },
  }
    }


  });
})();
