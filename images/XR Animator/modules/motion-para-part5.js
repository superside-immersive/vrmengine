// motion-para-part5.js — Motion parameters: sitting_sexy continued, model_pose, gura
// Extracted from animate.js lines 2653-3246
(function () {
  Object.assign(MMD_SA_options.motion_para, {
    "sitting_sexy08": {
  adjustment_per_model: {
    'AliciaSolid.vrm' : {
  skin_default: {
    "右ひじ": { rot_add:{x:0, y:0, z:30} },
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
      'left' : { default_position_weight:1, default_rotation_weight:1, },
      'right': { parent:{ name:'頭', weight:{ x:{left:0.8, right:0.5}, y:{down:0.5, up:0.5}, z:{backward:0, forward:1.0} } }, default_position_weight:0.1, default_rotation_weight:0.75, },
    },
    arm_tracking: {
      transformation: {
        position: {
          y: { unit_length:1, min:'elbow+0' },
        }
      },
      elbow_lock: {
        left:{},
        right:{},
      },
    },
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
          y: { foot_ratio:0.75 },
        },
      },
    },
  }
    }


   ,"sitting_sexy09": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
  }
    },
    'DUMMY.pmx' : {
  skin_default: {
  }
    },
    'AliciaSolid.vrm' : {
  skin_default: {
'左ひじ': { rot_add:{x:0, y:0, z:-5} },
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
  center_view: [0,-3.5,5],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    motion_default_weight: {
      'head': 0.5,
    },
    hip_adjustment: {
      feet_fixed_weight:0.9,
//      rotation_weight:0.25,
//      displacement_weight:0,
    },
    arm_default_stickiness: {
      'left' : { parent:{ name:'頭', weight:{ x:{left:0.5, right:0.8}, y:{down:0.5, up:0.5}, z:{backward:0.5, forward:1.0} } }, default_position_weight:0.1, default_rotation_weight:0.75, },
//      'right': { parent:{ name:'頭', weight:{ x:{left:0.8, right:0.5}, y:{down:0.5, up:0.5}, z:{backward:0.5, forward:1.0} } }, default_position_weight:0.1, default_rotation_weight:0.75, },
      'right' : { default_position_weight:1, default_rotation_weight:1, },
    },
				"arm_as_leg": {
					"transformation": {
						"position": {
							"x": {
								"unit_length": 1,
								"add": {
									"left": 1,
									"right":-1
								},
								"min": {
									"left": 0.5,
									"right": -4
								},
								"max": {
									"left": 4,
									"right": -0.5
								},
								"scale": 1
							},
							"y": {
								"unit_length": 1,
								"add": 1,
								"min": 0,
								"scale": 1
							},
							"z": {
								"unit_length": 1,
								"min": 2,
								"max": 2
							},
							"length_max": 99,
							"position_to_rotation": {
								"upper": {
									"x": {
										"max": -65
									},
									"z": {
										"rot_formula": "z",
										"scale": -0.5
									},
									"y": {
										"rot_formula": "z",
										"scale": 0.5
									}
								},
								"lower": {
									"x": {
										"rot_formula": "x",
										"min": 0,
										"add": -30,
										"scale": 1.5
									}
								}
							}
						},
						"rotation": {
							"y": {
								"foot_ratio": 0.25
							}
						}
					},
				}
  }
    }

   ,"sitting_sexy10": {
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
    lean_reduction_power: 1.5,
    motion_default_weight: {
      'head': 0.5,
    },
    arm_default_stickiness: {
      left: { default_position_weight:1, default_rotation_weight:1, },
      right: { parent:{ weight: 2/3 } },
    },
    hip_adjustment: {
      left: { feet_fixed_weight: 0.9 },
      right: { feet_fixed_weight: 2/3 },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'right',
      transformation: {
        position: {
          x: { add:0.2, scale:1.5 },
          y: { add:0.4, scale:1.5 },
          z: { add:0.2, scale:1.75 },
          camera_weight: 0.75,
        },
      },
    },
  }
    }


   ,"prone_pose01": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
  }
    },
    'DUMMY.pmx' : {
  skin_default: {
  }
    }
  },

  get look_at_screen() { return System._browser.camera.poseNet.enabled; },
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.4, weight_motion:1 },
    { name:"頭", weight_screen:0.4, weight_motion:1 },
//    { name:"両目", weight_screen:0.5, weight_motion:1 },
  ],

  center_view: [0,-6.5,7.5],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
    look_at_screen: true,
    lean_reduction_power: 3,
    motion_default_weight: {
      'head': 0,
    },
    hip_adjustment: {
      feet_fixed_weight:0.25,
      rotation_weight:0.25,
//      displacement_weight:0,
    },
    arm_default_stickiness: {
      'left' : { default_position_weight:1, default_rotation_weight:1, },
      'right': { default_position_weight:1, default_rotation_weight:1, },
    },
    arm_tracking: {
      transformation: {
        position: {
          x: { unit_length:1, scale:1 },
          y: { unit_length:1, add:-2.5, min:'default+0', scale:2 },
          z: { unit_length:1, add:-4, min:'default+0', scale:2 },
          camera_weight: 0.5,
//          length_max: 1.2,
//          length_min: 0.5,
        },
      },
//      elbow_lock: {},
    },
    arm_as_leg: {
//      enabled: true,
//      linked_side: 'right',
      transformation: {
        position: {
          x: { unit_length:1, add:{left:-1, right:1}, min:{left:0, right:-4}, max:{left:4, right:0}, scale:1 },
          y: { unit_length:1, add:1, min:0, scale:2 },
          z: { unit_length:1, min:2, max:2 },
          length_max: 99,
//          length_min: 0.5,
//          camera_weight: 0.75,

          position_to_rotation: {
            upper: {
              z: { rot_formula:'z', scale:-1.5, curve:{left:{ini:0, end:60, pow_factor:1.5}, right:{ini:0, end:-60, pow_factor:1.5}} },
            },
            lower: {
//63.43494882292201 * 2
//, curve:{ini:0, end:120, pow_factor:1.5}
              x: { rot_formula:'x', add:-90, min:0, scale:-2, curve:{ini:0, end:120, pow_factor:1.5} },
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


   ,"Mixamo - Female Laying Pose01": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
    "右腕": { rot_add:{x:(56.1-(43.7))*-1, y:(-33.4-(-50.8))*-1, z:(-3.3-(-16.8))*-1} },
    "左ひざ": { rot_add:{x:-5, y:0, z:0} },
  }
    }
  },

  look_at_screen: false,
  center_view: [2,-6,14],

  motion_tracking_enabled: true,
  motion_tracking_upper_body_only: true,
  motion_tracking: {
//    look_at_screen: true,
    head_rotation_weight: 0.75,
    lean_reduction_power: 2,
    motion_default_weight: {
      'head': 1,
      'upper_body': 1,
      'shoulder': 1,
    },
    hip_adjustment: {
      feet_fixed_weight:1,
      rotation_weight:0.25,
      displacement_weight:0,
    },
    arm_rotation_offset_from_motion_weight: {
      right: 0,
    },
    arm_default_stickiness: {
      'left' : { default_position_weight:0.5, default_rotation_weight:0.5, },
      'right': { default_position_weight:0, default_rotation_weight:0.5, },
    },
    arm_tracking: {
      transformation: {
        position: {
          z: { "unit_length": 1, "add":{"right":1} },
          y: { unit_length:1, min:'elbow+0' },
          x: { add:{left:0, right:0}, scale:{left:1.5, right:1} },
        },
"root_rotation": {
	"left": {
		"x": 0,
		"y": 0,
		"z": 20,
		"order": "ZYX"
	},
	"right": {
		"x": 0,
		"y": -20,
		"z": 10,
		"order": "ZYX"
	}
}
      },
      elbow_lock: {
        right:{
          use_smallest_angle:true
        },
      },
    },
    arm_as_leg: {
//      enabled: true,
      linked_side: 'left',
      transformation: {
        position: {
          x: { add:0.2, min:0, scale:3 },
          y: { add:0.2, min:0, scale:3 },
          z: { min:0, scale:3 },
          length_max: 1.2,
          length_min: 0.4,
//          camera_weight: 0.75,
        },
      },
    },
  }
    }


   ,"model_pose01": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
'センター': { pos_add:{x:0, y:-0.5, z:0} },
  }
    },
  },
			"look_at_screen_bone_list": [
				{ "name":"首", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },	
				{ "name":"頭", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身",  "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身2", "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 }
			],
//			"look_at_screen": true,
			"motion_tracking_enabled": true,
			"motion_tracking_upper_body_only": true,
			"motion_tracking": {
"look_at_screen": true,
"hip_adjustment": {
	"left": { "feet_fixed_weight":0.8 }, "right": { "feet_fixed_weight":1 },
	"rotation_weight":0.5,
	"displacement_weight":1
},
"arm_default_stickiness": {
	"default_position_weight":0.25
}
			}
    }

   ,"model_pose02": {
			"look_at_screen_bone_list": [
				{ "name":"首", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },	
				{ "name":"頭", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身",  "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身2", "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 }
			],
//			"look_at_screen": true,
			"motion_tracking_enabled": true,
			"motion_tracking_upper_body_only": true,
"look_at_screen": true,
"center_view": [0,-3,7],
			"motion_tracking": {
"look_at_screen": true,
"hip_adjustment": {
	"feet_fixed_weight":0.75,
	"rotation_weight":0.25,
	"displacement_weight":0.75,
	"knee_fixed_weight":1
},
"arm_default_stickiness": {
	"default_position_weight":0.25
}
			}
    }

   ,"model_pose03": {
			"look_at_screen_bone_list": [
				{ "name":"首", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },	
				{ "name":"頭", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身",  "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身2", "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 }
			],
//			"look_at_screen": true,
			"motion_tracking_enabled": true,
			"motion_tracking_upper_body_only": true,
			"motion_tracking": {
"look_at_screen": true,
"hip_adjustment": {
	"left": { "feet_fixed_weight":1 },
	"right": { "feet_fixed_weight":0.5 },
	"rotation_weight":0.5,
	"displacement_weight":1
},
"arm_default_stickiness": {
	"left": { "default_position_weight":0.5 },
	"right": { "default_position_weight":0 }
},
"arm_as_leg": {
	"linked_side": "right",
	"transformation": {
		"position": {
			"x": { "unit_length":1, "add":0.31, "scale":2 },
			"y": { "unit_length":1, "add":-5.639580078125, "scale":2 },
			"z": { "unit_length":1, "add":-1, "min":0.05, "scale":2 },
			"__camera_weight":0
		},
		"rotation": {
			"y": { "add":-45, "__foot_ratio":0.5 }
		}
	}
}
			}
    }

	,"sitting_sexy11": {
  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_motion:1 },
  ],
//			"look_at_screen": true,
		"motion_tracking_enabled": true,
		"motion_tracking_upper_body_only": true,
		"look_at_screen": true,
		"center_view": [0,-6.5,8],
		"motion_tracking": {
			"look_at_screen": true,
			"hip_adjustment": {
				"feet_fixed_weight": 0.75,
				"rotation_weight": 0.25,
				"displacement_weight": 0.25,
				"knee_fixed_weight": 0
			},
			"arm_default_stickiness": {
				"default_position_weight": 0.75,
				"default_rotation_weight": 0.75
			},
			"arm_as_leg": {
				"transformation": {
					"position": {
						"x": {
							"unit_length": 1,
							"add": {
								"left": 4,
								"right":-4
							},
							"min": {
								"left": 1,
								"right": -10
							},
							"max": {
								"left": 10,
								"right": -1
							},
							"scale": 2
						},
						"y": {
							"unit_length": 1,
							"add": 10,
							"scale": -2,
							"min": 4
						},
						"z": {
							"min": 0,
							"max": 0
						},
						"rotation": {
							"x": 90,
							"y": 0,
							"z": 0
						}
					},
					"rotation": {
						"y": {
							"foot_ratio": 0.5
						}
					}
				}
			}
		}
	},

		"sitting_sexy12": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
    "左腕": { rot_add:{x:0, y:0, z:-5} },
  }
    },
  },
			"look_at_screen_bone_list": [
				{ "name":"首", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },	
				{ "name":"頭", "weight_screen":0.5, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身",  "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 },
				{ "name":"上半身2", "weight_screen":0.5, "weight_screen_x":0, "weight_screen_y":0.5, "weight_motion":1 }
			],
			"motion_tracking_enabled": true,
			"motion_tracking_upper_body_only": true,
"look_at_screen": true,
"center_view": [0,-5,8],
			"motion_tracking": {
"look_at_screen": true,
"hip_adjustment": {
	"feet_fixed_weight":0.75,
	"rotation_weight":0.25,
	"displacement_weight":0.5,
	"knee_fixed_weight":1
},
"arm_default_stickiness": {
	"left" : { "default_position_weight":0 },
	"right": { "default_position_weight":0.75 }
}
			}
		}

  });
})();
