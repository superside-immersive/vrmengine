// motion-para-part4.js — Motion parameters: sitting_sexy series
// Extracted from animate.js lines 2091-2652
(function () {
  Object.assign(MMD_SA_options.motion_para, {
    "sitting_sexy02": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [0,2,10],

  auto_fit: {
    table: {
      reference_bones: ['左足首','右足首'],
//      depth_scale: 0.1,
    },
    chair: {
      depth_scale: 0.1,
    },
  },

//  look_at_screen: true,
  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 1.5,
    hip_adjustment: {
      rotation_weight: 0.5,
      feet_fixed_weight: 0.75,
    },
    arm_default_stickiness: {
      default_position_weight:1, default_rotation_weight:1,
    },
    arm_as_leg: {
//      enabled: true,
      transformation: {
        position: {
          x: { unit_length:1, add:{'left':-0, 'right':2}, min:{'left':-10, 'right':2.2-10.5}, max:{'left':10, 'right':2.2+10.5}, scale:{'left':1, 'right':1} },
          y: { unit_length:1, add:{'left':5, 'right':3}, min:{'left':4.5, 'right':3.5}, max:{'left':15, 'right':3.5+0.5},scale:{'left':1.75, 'right':0.3} },
          z: { unit_length:1, add:3, min:{'left':5, 'right':11.2-10}, max:{'left':12, 'right':11.2}, scale:{'left':2, 'right':2} },
/*
          process: (legs)=>{
if (legs.length < 2) return;

const diff = (1 - Math.abs(legs[0].pos.y - legs[1].pos.y)) / 2;
if (diff > 0) {

  if (legs[0].pos.y < legs[1].pos.y) {
    const y0 = legs[0].pos.y;
    legs[0].pos.y = legs[1].pos.y;
    legs[1].pos.y = y0;
  }

  const sign = (legs[0].pos.y > legs[1].pos.y) ? 1 : -1;
  legs[0].pos.y += diff * sign;
  legs[1].pos.y -= diff * sign;
}
          },
*/
        },
        rotation: {
          y: { foot_ratio:0.75 },
        },
      },
    },
  }
    }

   ,"Mixamo - Female Sitting Pose01": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [0,-3,5],

//  look_at_screen: true,
  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 2,
    hip_adjustment: {
      'left' : { feet_fixed_weight:1 },
      'right': { feet_fixed_weight:2/3, },
    },
    arm_default_stickiness: {
      'left': { parent:{ name:'右足', weight:1 } },
      'right': { parent:{ weight:1 } },
    },
/*
    arm_as_leg: {
//      enabled: true,
      linked_side: 'right',
      transformation: {
        position: {
          x: { scale:1.5 },
          y: { add:0.15, scale:1.5 },
          z: { add:0.4, scale:2 },
          rotation: { x:0, y:15, z:0 },
          camera_weight: 0.5,
        },
      },
    },
*/

    arm_as_leg: {
//      enabled: true,
      linked_side: 'right',
      transformation: {
        position: {
          x: { unit_length:1, add:1.5, min:-4, max:4, scale:1 },
          y: { unit_length:1, add:1, min:0, scale:1 },
          z: { unit_length:1, min:2, max:2 },
          length_max: 99,
//          length_min: 0.5,
//          camera_weight: 0.75,

          position_to_rotation: {

            upper: {
              x: { max:-100 },
              z: { rot_formula:"z", scale:-0.5 },
              y: { rot_formula:"z", scale:0.8 },
            },

            lower: {
//63.43494882292201 * 2
//, curve:{ini:0, end:120, pow_factor:1.5}
              x: { rot_formula:'x', min:0, add:-30, scale:1.5 },
            },
          },
        },

        rotation: {
          y: { foot_ratio:0.75 },
        },
      },
    },


  }
    }

   ,"Mixamo - Female Sitting Pose02": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [0,-3.5,5],

//  look_at_screen: true,
  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 2,
    motion_default_weight: {
      'head': 0.5,
      'upper_body': 0.75,
    },
    hip_adjustment: {
      feet_fixed_weight:1,
    },
    arm_default_stickiness: {
      'right': { parent:{ weight:0.8 } },
      'left': { parent:{ weight:0.8 } },
    },
/*
    arm_as_leg: {
//      enabled: true,
      linked_side: 'right',
      transformation: {
        position: {
          x: { scale:1.5 },
          y: { add:0.15, scale:1.5 },
          z: { add:0.4, scale:2 },
          rotation: { x:0, y:15, z:0 },
          camera_weight: 0.5,
        },
      },
    },
*/

    arm_as_leg: {
      transformation: {
        position: {
          x: { unit_length:1, add:{"left":8,"right":-8}, min:{"left":-0.25,"right":-8}, max:{"left":8,"right":0.25}, scale: 1 },
          y: { unit_length:1, add:1, min:0, scale:1 },
          z: { unit_length:1, min:2, max:2 },
          length_max: 99,
//          length_min: 0.5,
//          camera_weight: 0.75,

          position_to_rotation: {
            upper: {
              x: { max:-112 },
              z: { rot_formula:"z", scale:-0.35 },
              y: { rot_formula:"z", scale:0.08 },
            },
            lower: {
//63.43494882292201 * 2
//, curve:{ini:0, end:120, pow_factor:1.5}
              x: { rot_formula:'x', min:0, add:-30, scale:1.5 },
            },
          },
        },

        rotation: {
          y: { foot_ratio:0.5 },
        },
      },
    },

  }
    }

   ,"sitting_sexy03": {
  adjustment_per_model: {
    _default_: {
  skin_default: {
//    '右腕': { rot_add:{x:(39.5-(50.6))*0.5, y:(-7.9-(-4.3))*0.5, z:(-41.1-(-38.5))*0.5} },
  }
    },
    'DUMMY.pmx' : {
  skin_default: {
    '右腕': { rot_add:{x:(39.5-(50.6))*3, y:(-7.9-(-4.3))*3, z:(-41.1-(-38.5))*3} },
    '右ひじ': { rot_add:{x:0, y:0, z:15} },
  }
    },
  },


  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [-2.5,-5.5,10],

//  look_at_screen: false,
  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 1.5,
    motion_default_weight: {
      'head': 0.5,
    },
    hip_adjustment: {
      feet_fixed_weight:1,
      rotation_weight:1/3,
    },
    arm_default_stickiness: {
      'right' : { parent:{ name:'頭', weight:{ x:{left:1.5, right:0.5}, y:{down:1.5, up:0.5}, z:{backward:0.5, forward:1.5} } }, default_position_weight:0.1, default_rotation_weight:0.5, },
      'left': { default_position_weight:1, default_rotation_weight:1, },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'left',
      transformation: {
        position: {
          x: { scale:1.5 },
          y: { add:0.6, scale:1.5 },
          z: { add:0.4, scale:2 },
          rotation: { x:0, y:-20, z:0 },
          camera_weight: 0.5,
        },
      },
    },
  }
    }

   ,"sitting_sexy04": {
  adjustment_per_model: {
    'DUMMY.pmx' : {
  skin_default: {
    "左腕": { rot_add:{x:(45.4-(57.5))*1.5, y:(-23.4-(-35.7))*1.5, z:(24.9-(15.2))*1.5} },
    "左ひじ": { rot_add:{x:0, y:0, z:-30} },
  }
    }
  },

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [0,-6,7.5],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 1.5,
    motion_default_weight: {
      'head': 1,
    },
    hip_adjustment: {
      feet_fixed_weight:1,
      rotation_weight:0.25,
    },
    arm_default_stickiness: {
      'left' : { parent:{ name:'頭', weight:{ x:{left:0.5, right:1.5}, y:{down:1.5, up:0.5}, z:{backward:0.5, forward:1.5} } }, default_position_weight:0.1, default_rotation_weight:0.5, },
      'right': { default_position_weight:0.5, default_rotation_weight:0.5, },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'left',
      transformation: {
        position: {
/*
          x: { unit_length:1, scale:2 },
          y: { unit_length:1, min:8, add:5, scale:4 },
          z: { scale:0 },
          rotation: { x:-90, y:0, z:0 },
*/

          x: { scale:1.5 },
          y: { add:0.4, scale:1.5 },
          z: { add:0.3, scale:2 },
          camera_weight: 0.75,

        },
      },
    },
  }
    }

   ,"sitting_sexy05": {
  adjustment_per_model: {
    'DUMMY.pmx' : {
  skin_default: {
    '左足ＩＫ': { pos_add:{ x:0.4, y:0, z:0 } },
    '右足ＩＫ': { pos_add:{ x:-0.4, y:0, z:0 } },
  }
    }
  },

  onstart: (()=>{
    let adjusted;
    return function () {
if (adjusted) return;
adjusted = true;

const z_para = this.motion_tracking?.arm_as_leg?.transformation?.position?.z;
if (z_para) {
  z_para.min.left -= 0.4;
  z_para.max.left -= 0.4;
  z_para.min.right += 0.4;
  z_para.max.right += 0.4;
}
    };
  })(),

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [0,-6,7.5],

  mirror_disabled: true,

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 1.5,
    motion_default_weight: {
      'head': 0.5,
    },
    hip_adjustment: {
      feet_fixed_weight:0.9,
      rotation_weight:0.25,
    },
    arm_default_stickiness: {
      parent:{ weight:0.5 }, default_position_weight:1, default_rotation_weight:0.5,
    },
    arm_as_leg: {
//      enabled: true,
//      linked_side: 'left',
      transformation: {
        position: {
/*
          x: { unit_length:1, min:{left:-0.85,right:0.5}, max:{left:-0.85,right:0.5}, scale:0.2 },
          y: { add:0.3, scale:1.5 },
          z: { add:0, min:0.75, scale:3 },
*/

          x: { add:0.75, min:0.75, scale:{left:1.5, right:-1.5} },
          y: { add:0.3, scale:1.5, min:0 },
          z: { unit_length:1, min:{left:0.85,right:-0.5}, max:{left:0.85,right:-0.5}, scale:0.2 },
          rotation: { x:0, y:-90, z:0 },

//          camera_weight: 0.5,
        },
        rotation: {
          y: { foot_ratio:0.5 },
        }
      },
    },
  }
    }

   ,"sitting_sexy06": {
  adjustment_per_model: {
    'DUMMY.pmx' : {
  skin_default: {
  }
    }
  },

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.75, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 },
  ],

  center_view: [0,-5,7.5],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    motion_default_weight: {
      'head': 0.5,
    },
    hip_adjustment: {
      feet_fixed_weight:1,
      rotation_weight:0.25,
      displacement_weight:0,
    },
    arm_default_stickiness: {
      'left' : { default_position_weight:1, default_rotation_weight:1, },
      'right': { default_position_weight:0.8, default_rotation_weight:0.5, },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'right',
      transformation: {
        position: {
          x: { add:-0.3, max:-0.1, scale:3 },
          y: { unit_length:1, add:-1.5, min:0.5, scale:2 },
          z: { add:-0.3, min:0.1, scale:3 },
          length_max: 1.2,
          length_min: 0.5,
//          camera_weight: 0.75,
        },
      },
    },
  }
    }

   ,"sitting_sexy07": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
'左手首': { rot_add:{x:0, y:0, z:-5} },
'右手首': { rot_add:{x:0, y:0, z: 5} },
  }
    },
    'DUMMY.pmx' : {
  skin_default: {
'左ひじ': { rot_add:{x:(22.9-(18.7))*0.5, y:(-143.2-(-153.3))*0.5, z:(-59.5-(-63.1))*0.5-15} },
'右ひじ': { rot_add:{x:(22.8-(18.4))*0.5, y:(143.2-(153.9))*0.5, z:(58.9-(62.7))*0.5+15} },
'左手首': { rot_add:{x:0, y:0, z: 5} },
'右手首': { rot_add:{x:0, y:0, z:-5} },
  }
    },
    'AliciaSolid.vrm' : {
  skin_default: {
'左ひじ': { rot_add:{x:0, y:0, z:-20} },
'右ひじ': { rot_add:{x:0, y:0, z: 20} },
'左手首': { rot_add:{x:0, y:0, z: 10} },
'右手首': { rot_add:{x:0, y:0, z:-10} },
  }
    }
  },

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

//  look_at_screen: true,
  center_view: [0,0,5],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 2,
    motion_default_weight: {
      'head': 0.5,
    },
    hip_adjustment: {
      feet_fixed_weight:2/3,
//      rotation_weight:0.25,
//      displacement_weight:0,
    },
    arm_default_stickiness: {
      'left' : { parent:{ name:'頭', weight:{ x:{left:0.5, right:0.8}, y:{down:0.5, up:0.5}, z:{backward:0.5, forward:1.0} } }, default_position_weight:0.1, default_rotation_weight:0.75, },
      'right': { parent:{ name:'頭', weight:{ x:{left:0.8, right:0.5}, y:{down:0.5, up:0.5}, z:{backward:0.5, forward:1.0} } }, default_position_weight:0.1, default_rotation_weight:0.75, },
    },
    arm_tracking: {
      transformation: {
        position: {
          y: { unit_length:1, min:'elbow+0' },
        }
      },
      elbow_lock: {
        left: {},
        right: {},
      },
    },
    arm_as_leg: {
      transformation: {
        position: {
          x: { unit_length:1, add:{"left":-1.0,"right":1.0}, min:{"left":-0.25,"right":-4}, max:{"left":4,"right":0.25}, scale: 1 },
          y: { unit_length:1, add:1, min:0, scale:1 },
          z: { unit_length:1, min:2, max:2 },
          length_max: 99,
//          length_min: 0.5,
//          camera_weight: 0.75,

          position_to_rotation: {
            upper: {
              x: { max:-105 },
              z: { rot_formula:"z", scale:-0.2 },
              y: { rot_formula:"z", scale:0.8 },
            },
            lower: {
//63.43494882292201 * 2
//, curve:{ini:0, end:120, pow_factor:1.5}
              x: { rot_formula:'x', min:0, add:-30, scale:1.5 },
            },
          },
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
