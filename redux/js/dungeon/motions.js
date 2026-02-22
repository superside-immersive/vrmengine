// [extracted from dungeon.js] motion definitions, combat motion setup, NPC motion cloning
// Dependencies: MMD_SA_options.Dungeon (must exist), MMD_SA_options.Dungeon_options

(function () {
var Dungeon = MMD_SA_options.Dungeon;

Dungeon._initMotions = function () {
var options = MMD_SA_options.Dungeon_options;
var that = this;
var _jump_physics = Dungeon._jump_physics;
var _bb_xz_factor_ = Dungeon._bb_xz_factor_;

// dungeon motion START
this.motion_by_name = {}
this.motion = options.motion || {}

this.motion["PC default"] = Object.assign({
  path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/tsuna/tsuna_standby.vmd',
  para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; },
  }
}, this.motion["PC default"]||{});
Object.assign(this.motion["PC default"].para, this.motion["PC default"].para_SA||{});
delete this.motion["PC default"].para_SA;

this.motion["PC movement forward"] = Object.assign({
  path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/walk_n_run/run_H57_f0-20.vmd',
  para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; },
motion_tracking_enabled:true,
motion_tracking_upper_body_only:true,

// h01: 2000/1800
// h16: 1474.79/1800
// h26: 2700/1800
// h45: 2500/1800
// h46: 2500/3600
// h57: 2700/3600
// A34: 360/1800
  _speed: 2700/1800 *30,

  SFX: [
    { frame:2,  sound:{} },
    { frame:12, sound:{} },
  ],

  adjustment_per_model: {
    _default_ : {
  skin_default: {}
 ,morph_default:{
  "あ":{weight:0.13}
 ,"い":{weight:0.27}

// ,"なごみ":{weight:0.29*0.5}
// ,"はぅ":{weight:0.15}
 ,"じと目":{weight:0.25}

 ,"困る":{weight:0.23}
 ,"下":{weight:0.64}
  }
// ,skin_filter: { test:function(name){ return ((name.indexOf("スカート")==-1) && (name.indexOf("パーカー")==-1) && (name.indexOf("胸")==-1) && (name.indexOf("乳")==-1)) } }
    }
   ,"TdaHaku_Bikini_TypeB.pmx" : {
  skin_default: {}
 ,morph_default:{
  "あ":{weight:0.13}
 ,"い":{weight:0.27}

// ,"なごみ":{weight:0.29*0.5}
// ,"はぅ":{weight:0.15}
 ,"じと目":{weight:0.25}

 ,"困る":{weight:0.23}
 ,"下":{weight:0.64}
  }
 ,skin_filter: { test:function(name){ return ((name.indexOf("前髪")==-1)) } }
    }
   ,"TdaRin_Bikini_TypeDS_SauWai.pmx" : {
  skin_default: {}
 ,morph_default:{
  "あ":{weight:0.13}
 ,"い":{weight:0.27}

// ,"なごみ":{weight:0.29*0.5}
// ,"はぅ":{weight:0.15}
 ,"じと目":{weight:0.25}

 ,"困る":{weight:0.23}
 ,"下":{weight:0.64}
  }
    }

  },
    }
}, this.motion["PC movement forward"]||{});
console.log(Object.assign({}, this.motion["PC movement forward"]));
Object.assign(this.motion["PC movement forward"].para, this.motion["PC movement forward"].para_SA||{});
delete this.motion["PC movement forward"].para_SA;
/*
  this.motion["PC movement forward"] = { path:System.Gadget.path + '/MMD.js/motion/walk_n_run/run_H45_f0-360.vmd',
    para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
 ,adjustment_per_model: {
    _default_ : {
  skin_default: {}
 ,morph_default:{
  "なごみ":{weight:0.28}
 ,"はぅ":{weight:0.15}
 ,"ω□":{weight:0.55}
 ,"困る":{weight:0.48}
 ,"下":{weight:1}
  }
    }
  }
    }
  };
*/

if (!this.motion["PC forward jump"]) {
  this.motion["PC forward jump"] = { path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/tsuna/tsuna_small_jump.vmd',
    para: { adjust_center_view_disabled:true, motion_duration:(46-12)/30, onended: function () { MMD_SA._no_fading=true; }

,motion_tracking_enabled:true
,motion_tracking_upper_body_only:true

 ,adjustment_per_model: {
    _default_ : {
//  skin_filter: { test:function(name){ return ((name.indexOf("スカート")==-1) && (name.indexOf("パーカー")==-1) && (name.indexOf("胸")==-1) && (name.indexOf("乳")==-1)) } }
    }
   ,"TdaHaku_Bikini_TypeB.pmx" : {
//  skin_filter: { test:function(name){ return ((name.indexOf("前髪")==-1) && (name.indexOf("胸")==-1)) } }
    }
  }
 ,mov_speed: (function () {
var va = _jump_physics((15+10), 11)
return [
  { frame:34, speed:{x:0, y:0,     z:22.8/12*30}}
 ,{ frame:12, speed:{x:0, y:va.v,  z:41/22*30}, acceleration:{x:0, y:va.a, z:0}}
 ,{ frame:3,  speed:{x:0, y:0.001, z:22.8/12*30}}
 ,{ frame:0,  speed:{x:0, y:0,     z:22.8/12*30}}
];
  })()
 ,SFX: [
    { frame:6+1, sound:{} },
    {
      frame:34,
      condition: (model) => ((model.mesh._model_index != 0) || (model.mesh.position.y < MMD_SA_options.Dungeon.character.ground_y+5)),
      sound:{},
    },
  ]
 ,range:[{time:[6,0]}]
 ,playbackRate_by_model_index: {}
 ,bb_translate: { limit:{ max:{x:0, y:0, z:0.75} } }
    }
  };
}

if (!this.motion["PC high jump"]) {
  this.motion["PC high jump"] = { path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/landing/05_magical_jump_v01.vmd',
    para: { adjust_center_view_disabled:true, motion_duration:(162)/30, onended: function () { MMD_SA._no_fading=true; }

,motion_tracking_enabled:true
,motion_tracking_upper_body_only:true

 ,look_at_screen:false
 ,range:[{time:[10,0]}]
 ,adjustment_per_model: {
    _default_ : {
//  skin_filter: { test:function(name){ return ((name.indexOf("胸")==-1) && (name.indexOf("乳")==-1)) } }
    }
  }

 ,motion_blending: {
    fadein: {}
   ,fadeout: { condition:()=>false }
  }

 ,bone_to_position: [{ name:"センター", frame_range:[[23,89]], scale:{x:0,y:1,z:0}, position_disabled:true }]
 ,mov_speed: (function () {
var va_y1 = _jump_physics((100), 28)
var va_y2 = _jump_physics((100), 38)
var va_z2 = _jump_physics((20) , 38)
return [
  { frame:128, speed:{x:0, y:0,       z: 0}}
 ,{ frame:89,  speed:{x:0, y:0.001,   z: 0}}
//20-38-56
 ,{ frame:51,  speed:{x:0, y:0.001,   z:va_z2.v}, acceleration:{x:0, y:va_y2.a, z:va_z2.a}}
 ,{ frame:23,  speed:{x:0, y:va_y1.v, z: 0},      acceleration:{x:0, y:va_y1.a, z:0}}
 ,{ frame:0,   speed:{x:0, y:0,       z: 0}}
];
  })()
 ,SFX: [
    { frame:23, sound:{} },
    {
      frame:128,
      condition: (model) => ((model.mesh._model_index != 0) || (model.mesh.position.y < MMD_SA_options.Dungeon.character.ground_y+5)),
      sound:{},
    },
  ]
    }
  };
}
if (!this.motion["PC landing"]) {
  this.motion["PC landing"] = { path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/landing/04_deep_landing.vmd',
    para: { adjust_center_view_disabled:true, duration:(57)/30

,motion_tracking_enabled:true
,motion_tracking_upper_body_only:true

 ,onended: function (loop_end) {
MMD_SA._no_fading=true;
if (loop_end) {
  MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
  if (!MMD_SA_options.Dungeon._states.event_mode) {
    MMD_SA_options.Dungeon.character_movement_disabled = false;
  }
}
  }
 ,look_at_screen:false
 ,range:[{time:[11,0]}]
 ,adjustment_per_model: {
    _default_ : {
//  skin_filter: { test:function(name){ return ((name.indexOf("胸")==-1) && (name.indexOf("乳")==-1)) } },
  skin_default: {
    "全ての親": { pos_add:{x:0, y:0, z:4} }
  }
    }
  }
 ,SFX: [
    { frame:16, sound:{} }
   ,{ frame:20, sound:{} }
  ]
 ,bone_to_position: [{ name:"センター", frame_range:[[0,16]], scale:{x:0,y:1,z:0}, position_disabled:true }]
// ,bb_translate: { limit:{ min:{x:0, y:0, z:0.75} } }
    }
  };
}

if (!this.motion["NPC talk A"]) {
  this.motion["NPC talk A"] = { path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/talk/xs-talk8-west-negotiate.vmd'
   ,para: {
  onended: function () { MMD_SA._no_fading=true; }
 ,adjustment_per_model: {
    _default_ : {
  skin_default: {
    "全ての親": { keys:[{ pos:{x:1.05, y:0, z:-8.72}, rot:{x:0, y:89, z:0} }] }
  }
    }
  }
    }
  };
}
if (!this.motion["NPC walk A"]) {
  this.motion["NPC walk A"] = { path:System.Gadget.path + '/MMD.js/motion/motion_rpg_pack01.zip#/walk_n_run/walk_A01_f0-40_s9.85.vmd' };
}
if (!this.motion["PC fall on ass"]) {
  this.motion["PC fall on ass"] = { path:'MMD.js/motion/motion_rpg_pack01.zip#/hit/w01_すべって尻もち.vmd'
   ,para:{
  adjust_center_view_disabled:true, get look_at_screen_ratio() { var t=THREE.MMD.getModels()[0].skin.time; return ((t>1)?0:1-t); }
 ,super_armor: { level:99 }
 ,SFX: [ { frame:21, sound:{} } ]
 ,onended: function () {
MMD_SA._ignore_physics_reset=true; MMD_SA._no_fading=true;
  }

 ,auto_blink: false
 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if (MMD_SA_options.WebXR) {
    let dis = MMD_SA._v3a.copy(MMD_SA.camera_position).setY(0).distanceTo(MMD_SA._v3b.copy(THREE.MMD.getModels()[0].mesh.position).setY(0))/10 / MMD_SA.WebXR.zoom_scale;
    if (dis < 1)
      return
  }
}
else {
  return
}
// cannot use MMD_SA._force_motion_shuffle here
// will trigger .onended afterwards
if (!this._freeze_onended)
  model.skin.time = mm.lastFrame_/30;
  }

 ,adjustment_per_model: {
    _default_ : {
  morph_default: {"瞳小": { weight_scale:0.75 }}
    }
  }
    }
  };
}
if (!this.motion["PC stand up from ass"]) {
  this.motion["PC stand up from ass"] = { path:'MMD.js/motion/motion_rpg_pack01.zip#/casual/女の子座り→立ち上がる_gumi_v01.vmd'
   ,para: {
  adjust_center_view_disabled:true, get look_at_screen_ratio() { var t=THREE.MMD.getModels()[0].skin.time; return ((t>1)?1:t); }
 ,super_armor: { level:99 }
 ,onended: function () {
MMD_SA._hit_legs_=false; MMD_SA._no_fading=true;
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
if (!MMD_SA_options.Dungeon._states.event_mode) {
  MMD_SA_options.Dungeon.character_movement_disabled = false;
  MMD_SA_options.Dungeon._states.object_click_disabled = false;
}
  }
 ,adjustment_per_model: {
    _default_ : {
  skin_default: {
  "右足ＩＫ": { keys_mod:[{ frame:0, pos:{x:-2.33-0.5, y:-0.4, z:1.3} }, { frame:7,  pos:{x:-2.33-0.5, y:-0.4, z:1.3} }] }
 ,"左足ＩＫ": { keys_mod:[{ frame:0, pos:{x: 2.33+0.5, y:-0.4, z:1.3} }, { frame:47, pos:{x: 2.33+0.5, y:-0.4, z:1.3} }] }
//がくっぽいどver.2.11.pmd
 ,"センター": { pos_scale:{ auto_adjust:{ref_length:11.69667} } }
  }
    }
   ,"TdaMeiko_Bikini_TypeA.pmx" : {
  skin_default: {
  "右足ＩＫ": { keys_mod:[{ frame:0, pos:{x:-2.33-1, y:-0.4, z:1.3} }, { frame:7,  pos:{x:-2.33-1, y:-0.4, z:1.3} }] }
 ,"左足ＩＫ": { keys_mod:[{ frame:0, pos:{x: 2.33+1, y:-0.4, z:1.3} }, { frame:47, pos:{x: 2.33+1, y:-0.4, z:1.3} }] }
//がくっぽいどver.2.11.pmd
 ,"センター": { pos_scale:{ auto_adjust:{ref_length:11.69667} } }
  }
    }
  }

     ,motion_blending: {
        fadein: { duration:10/30 }
      }
    }
  };
}

if (!this.motion["PC fall from trip"]) {
  this.motion["PC fall from trip"] = { path:'MMD.js/motion/motion_rpg_pack01.zip#/hit/r01_普通に転ぶ.vmd'
   ,para: { adjust_center_view_disabled:true, get look_at_screen_ratio() { var f=THREE.MMD.getModels()[0].skin.time*30; return ((f>10)?0:(10-f)/10); }
     ,super_armor: { level:99 }
     ,SFX: [ { frame:19, sound:{} } ]
     ,onended: function () {
MMD_SA._ignore_physics_reset=true; MMD_SA._no_fading=true;
      }

 ,auto_blink: false
 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if (MMD_SA_options.WebXR) {
    let dis = MMD_SA._v3a.copy(MMD_SA.camera_position).setY(0).distanceTo(MMD_SA._v3b.copy(THREE.MMD.getModels()[0].mesh.position).setY(0))/10 / MMD_SA.WebXR.zoom_scale;
    if (dis < 2)
      return
  }
}
else {
  return
}
// cannot use MMD_SA._force_motion_shuffle here
// will trigger .onended afterwards
if (!this._freeze_onended)
  model.skin.time = mm.lastFrame_/30;
  }

     ,adjustment_per_model: {
        _default_ : {
      skin_default: {
  "全ての親": { keys:[{ time:0/30, pos:{x:0, y:0, z:0} }, { time:19/30, pos:{x:0, y:1.5, z:-8}, rot:{x:-5, y:0, z:0} }] }
      }
     ,morph_default: {"瞳小": { weight_scale:0.75 }}
        },

        'Amelia Watson_MMD_ver 1.0.pmx': {
      skin_default: {
  "全ての親": { keys:[{ time:0/30, pos:{x:0, y:0, z:0} }, { time:19/30, pos:{x:0, y:1.5, z:-8}, rot:{x:-5, y:0, z:0} }] },
  "センター": { keys_mod:[{ frame:23, pos:{x:-0.65, y:-6.06-1.5, z:0.67} }, { frame:30,  pos:{x:-1.19, y:-5.02-1.5, z:-0.13-1} }, { frame:39,  pos:{x:-1.19, y:-5.17-1.5, z:0.28-2} }, { frame:68,  pos:{x:-1.19, y:-5.17-1.5, z:0.28-2} }] },
      },
      morph_default: {"瞳小": { weight_scale:0.75 }},
        },

      }
    }
  };
}

if (!this.motion["PC stand up from face down"]) {
  this.motion["PC stand up from face down"] = { path:'MMD.js/motion/motion_rpg_pack01.zip#/casual/OTL→立ち上がり.vmd'
   ,para: { adjust_center_view_disabled:true, get look_at_screen_ratio() { var f=THREE.MMD.getModels()[0].skin.time*30; return ((f<29)?0:((f>47)?1:(f-29)/18)); }
     ,super_armor: { level:99 }
     ,onended: function () {
MMD_SA._hit_legs_=false; MMD_SA._no_fading=true;
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
MMD_SA_options.Dungeon.character_movement_disabled = false;
MMD_SA_options.Dungeon._states.object_click_disabled = false;
      }
     ,adjustment_per_model: {
        _default_ : {
      skin_default: {
  "全ての親": { pos_add:{x:0, y:0, z:3} }
      }
        }
      }

     ,motion_blending: {
        fadein: { duration:10/30 }
      }
    }
  };
}

if (!this.motion["PC down"]) {
  this.motion["PC down"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション３\\ナイトミク\\k.miku-down_modified.vmd',
    para: { adjust_center_view_disabled:true
     ,duration: 2
     ,auto_blink: false
     ,super_armor: { level:99 }
     ,motion_command_disabled: true, look_at_screen: false
     ,model_index_list:[0], NPC_turns_to_you:true
     ,onended_NPC: function (model_index) {
var d = MMD_SA_options.Dungeon
if (d._states.combat && d._states.combat.ondefeated(model_index)) {
  return
}

//var model_para = MMD_SA_options.model_para_obj_all[model_index]
//model_para._motion_name_next = that.motion["NPC-" + model_index + " combat get up"].name
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return

MMD_SA._freeze_onended = true

var d = MMD_SA_options.Dungeon
if (d._states.combat && d._states.combat.ondefeated(0)) {
  return
}

if (d._event_active.id != "_onplayerdefeated_default_")
  d.run_event("_onplayerdefeated_default_")
      }
    }
  };
}


var NPC_motion_list = []

if (options.combat_mode_enabled) {

  this.battle_model_index_list.push(0);

  (function () {
function basic_check(model_index, x_object) {
  if (!x_object._obj.visible)
    return false
  var p_bone = x_object.parent_bone
  if (!p_bone)
    return false
  if (model_index != (p_bone.model_index||0))
    return false
  return true
}

function two_handed_weapon_equipped(model_index) {
  function _two_handed_weapon_equipped(x_object) {
if (!basic_check(model_index, x_object))
  return false
return (x_object.user_data.weapon && (x_object.user_data.weapon.type == "2-handed"))
  }

  return MMD_SA_options.Dungeon.accessory_list.some(_two_handed_weapon_equipped);
}

function one_handed_weapon_equipped(model_index) {
  function _one_handed_weapon_equipped(x_object) {
if (!basic_check(model_index, x_object))
  return false
return (x_object.user_data.weapon && (x_object.user_data.weapon.type == "1-handed"))
  }

  return MMD_SA_options.Dungeon.accessory_list.some(_one_handed_weapon_equipped);
}

function twin_weapon_equipped(model_index) {
  function _twin_weapon_equipped(x_object) {
if (!basic_check(model_index, x_object))
  return false
return (x_object.user_data.weapon && (x_object.user_data.weapon.type == "twin"))
  }

  return MMD_SA_options.Dungeon.accessory_list.some(_twin_weapon_equipped);
}

// /^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369|.\u6307.)/
var RE_skin_jThree = new RegExp("^(" + toRegExp(["左","右"],"|") + ")(" + toRegExp(["肩","腕","ひじ","手首","手捩","ダミー"],"|") + "|." + toRegExp("指") + ".)");
var RE_skin_jThree_one_handed_guard = new RegExp(toRegExp(["上半身","両目"],"|"));
var RE_skin_jThree_hand_R = new RegExp("^" + toRegExp("右") + "(" + toRegExp("ダミー") + "|." + toRegExp("指") + ".)");

//var RE_arms = new RegExp(toRegExp(["待機","構え歩","怯み"],"|") + "|jump|^run");
var RE_arms  = /^(PC movement forward|PC.+jump|PC combat default|PC combat movement|PC combat hit small|PC combat hit medium)/
var RE_parry = /^PC combat (parry|parrying)$/

if (!MMD_SA_options.custom_action)
  MMD_SA_options.custom_action = [];

MMD_SA_options.custom_action.push(
  {
    action: {
      condition: function (is_bone_action, objs) {
var skin = THREE.MMD.getModels()[objs._model_index].skin
var motion_id = MMD_SA_options.Dungeon.motion_id_by_filename[MMD_SA.motion[skin._motion_index].filename] || ""
return RE_arms.test(motion_id) && two_handed_weapon_equipped(objs._model_index);
      }

     ,onFinish: function () {}
   }

// bone_group is possibly useful only if .copy_first_bone_frame is used
//bone_group:["腕","指"]
   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション３/2-handed_weapon_arms.vmd', match:{skin_jThree:RE_skin_jThree, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }
 ,{
    action: {
      condition: function (is_bone_action, objs) {
var skin = THREE.MMD.getModels()[objs._model_index].skin
var motion_id = MMD_SA_options.Dungeon.motion_id_by_filename[MMD_SA.motion[skin._motion_index].filename] || ""
return RE_parry.test(motion_id) && two_handed_weapon_equipped(objs._model_index);
      }

     ,onFinish: function () {}
   }

   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション３/2-handed_weapon_guard.vmd', match:{skin_jThree:{ test: function(name) { return ((name=='上半身') || RE_skin_jThree.test(name)); } }, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }

 ,{
    action: {
      condition: function (is_bone_action, objs) {
var skin = THREE.MMD.getModels()[objs._model_index].skin
var motion_id = MMD_SA_options.Dungeon.motion_id_by_filename[MMD_SA.motion[skin._motion_index].filename] || ""
return RE_arms.test(motion_id) && one_handed_weapon_equipped(objs._model_index);
      }

     ,onFinish: function () {}
   }

// bone_group is possibly useful only if .copy_first_bone_frame is used
//bone_group:["腕","指"]
   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション５/1-handed_weapon_arms.vmd', match:{skin_jThree:RE_skin_jThree, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }
 ,{
    action: {
      condition: function (is_bone_action, objs) {
var skin = THREE.MMD.getModels()[objs._model_index].skin
var motion_id = MMD_SA_options.Dungeon.motion_id_by_filename[MMD_SA.motion[skin._motion_index].filename] || ""
return RE_parry.test(motion_id) && one_handed_weapon_equipped(objs._model_index);
      }

     ,onFinish: function () {}
   }

   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション５/1-handed_weapon_guard.vmd', match:{skin_jThree:{ test: function(name) { return (RE_skin_jThree_one_handed_guard.test(name) || RE_skin_jThree.test(name)); } }, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }

 ,{
    action: {
      condition: function (is_bone_action, objs) {
var skin = THREE.MMD.getModels()[objs._model_index].skin
var motion_id = MMD_SA_options.Dungeon.motion_id_by_filename[MMD_SA.motion[skin._motion_index].filename] || ""
return MMD_SA_options.Dungeon.character.combat_mode && RE_arms.test(motion_id) && twin_weapon_equipped(objs._model_index);
      }
     ,onFinish: function () {}
   }
   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション４/twin_weapon_arms.vmd', match:{skin_jThree:RE_skin_jThree, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }
 ,{
    action: {
      condition: function (is_bone_action, objs) {
var skin = THREE.MMD.getModels()[objs._model_index].skin
var motion_id = MMD_SA_options.Dungeon.motion_id_by_filename[MMD_SA.motion[skin._motion_index].filename] || ""
return RE_parry.test(motion_id) && twin_weapon_equipped(objs._model_index);
      }
     ,onFinish: function () {}
   }
   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション４/twin_weapon_guard.vmd', match:{skin_jThree:{ test: function(name) { return ((name=='上半身') || RE_skin_jThree.test(name)); } }, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }

 ,{
    action: {
      condition: function (is_bone_action, objs) {
return one_handed_weapon_equipped(objs._model_index);
      }

     ,onFinish: function () {}
   }

   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/粗製のモーション５/hand_R_weapon_hold.vmd', match:{skin_jThree:RE_skin_jThree_hand_R, morph_jThree:false}, para_SA:{model_index_list:MMD_SA_options.Dungeon.battle_model_index_list}}
  }
);
  })();

  if (!this.motion["PC combat default"]) {
    this.motion["PC combat default"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　待機.vmd',
      para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list:[0]
      }
    };
    NPC_motion_list.push("PC combat default");
  }
  if (!this.motion["PC combat movement forward"]) {
    this.motion["PC combat movement forward"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　構え歩き前進.vmd',
      para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,PC_parry_level: 3
      }
    };
    NPC_motion_list.push("PC combat movement forward");
  }
  if (!this.motion["PC combat movement backward"]) {
    this.motion["PC combat movement backward"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　構え歩きバック.vmd',
      para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,PC_parry_level: 3
      }
    };
    NPC_motion_list.push("PC combat movement backward");
  }
  if (!this.motion["PC combat movement left"]) {
    this.motion["PC combat movement left"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　構え歩き左.vmd',
      para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,PC_parry_level: 3
      }
    };
    NPC_motion_list.push("PC combat movement left");
  }
  if (!this.motion["PC combat movement right"]) {
    this.motion["PC combat movement right"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　構え歩き右.vmd',
      para: { adjust_center_view_disabled:true, loop_on_blending:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,PC_parry_level: 3
      }
    };
    NPC_motion_list.push("PC combat movement right");
  }
  if (!this.motion["PC combat parry"]) {
    this.motion["PC combat parry"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　ガード.vmd',
      para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,duration: 1
       ,PC_parry_level: 3
      }
    };
  }
  if (!this.motion["PC combat parrying"]) {
    this.motion["PC combat parrying"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　ガードヒット.vmd',
      para: { adjust_center_view_disabled:true
       ,PC_parry_level: 3
       ,motion_command_disabled: true
       ,model_index_list:[0], NPC_turns_to_you:true
       ,onended_NPC: function (model_index) {
var model_para = MMD_SA_options.model_para_obj_all[model_index]
model_para._motion_name_next = model_para.motion_name_default_combat
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
        }
      }
    };
    NPC_motion_list.push("PC combat parrying");
  }
  if (!this.motion["PC combat parry broken"]) {
    this.motion["PC combat parry broken"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\格闘簡易作成用モーション\\格闘シーン簡易作成用モーション２．１\\ktntk-albert-2.1\\Albert-guard-broken.vmd',
      para: { adjust_center_view_disabled:true
       ,motion_command_disabled: true
       ,model_index_list:[0], NPC_turns_to_you:true
       ,onended_NPC: function (model_index) {
var model_para = MMD_SA_options.model_para_obj_all[model_index]
model_para._motion_name_next = model_para.motion_name_default_combat
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
        }
      }
    };
    NPC_motion_list.push("PC combat parry broken");
  }
  if (!this.motion["PC combat hit small"]) {
    this.motion["PC combat hit small"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\怯み弱.vmd',
      para: { adjust_center_view_disabled:true
       ,adjustment_per_model: {
  _default_ : {
    morph_default: {
  "じと目": { weight:1 }
 ,"え": { weight:1 }
 ,"困る": { weight:1 }
 ,"涙": { weight:1 }
    }
  }
        }
       ,motion_command_disabled: true
       ,model_index_list:[0], NPC_turns_to_you:true
       ,onended_NPC: function (model_index) {
var model_para = MMD_SA_options.model_para_obj_all[model_index]
model_para._motion_name_next = model_para.motion_name_default_combat
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
        }
      }
    };
    NPC_motion_list.push("PC combat hit small");
  }
  if (!this.motion["PC combat hit medium"]) {
    this.motion["PC combat hit medium"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\怯み中.vmd',
      para: { adjust_center_view_disabled:true
       ,bone_to_position: [{ name:"全ての親" }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { keys:[{ time:0/30, pos:{x:0, y:0, z:0} }, { time:10/30, pos:{x:0, y:0, z:3} }] }
    }
   ,morph_default: {
  "じと目": { weight:1 }
 ,"え": { weight:1 }
 ,"困る": { weight:1 }
 ,"涙": { weight:1 }
    }
  }
        }
       ,motion_command_disabled: true
       ,model_index_list:[0], NPC_turns_to_you:true
       ,onended_NPC: function (model_index) {
var model_para = MMD_SA_options.model_para_obj_all[model_index]
model_para._motion_name_next = model_para.motion_name_default_combat
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
        }
      }
    };
    NPC_motion_list.push("PC combat hit medium");
  }
  if (!this.motion["PC combat hit down"]) {
    this.motion["PC combat hit down"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\ふっとび　全親無し.vmd',
      para: { adjust_center_view_disabled:true
       ,duration: 2
       ,auto_blink: false
       ,super_armor: { level:99 }
       ,bone_to_position: [{ name:"全ての親" }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { keys:[{ time:0/30, pos:{x:0, y:0, z:0} }, { time:37/30, pos:{x:0, y:0, z:20} }] }
// ,"左足ＩＫ": { rot_scale:{x:1, y:0, z:0} }
// ,"右足ＩＫ": { rot_scale:{x:1, y:0, z:0} }
    }
   ,morph_default: {
  "はぅ": { weight:1 }
 ,"え": { weight:1 }
 ,"困る": { weight:1 }
    }
  }
 ,"yukari_mob_v04_x2.8_arm-z-35.pmx" : {
    skin_default: {
  "全ての親": { keys:[{ time:0/30, pos:{x:0, y:0, z:0} }, { time:37/30, pos:{x:0, y:0, z:20} }] }
 ,"グルーブ": { keys_mod: [
   { frame:18, pos:{x:0, y:-12.65+1.5, z:0} }
  ,{ frame:23, pos:{x:0, y:-12.00+1.5, z:0} }
  ,{ frame:27, pos:{x:0, y:-12.65+1.5, z:0} }
  ,{ frame:30, pos:{x:0, y:-12.30+1.5, z:0} }
  ,{ frame:33, pos:{x:0, y:-12.65+1.5, z:0} }
    ]
  }
// ,"左足ＩＫ": { rot_scale:{x:1, y:0, z:0} }
// ,"右足ＩＫ": { rot_scale:{x:1, y:0, z:0} }
    }
   ,morph_default: {
  "はぅ": { weight:1 }
 ,"え": { weight:1 }
 ,"困る": { weight:1 }
    }
  }
        }
       ,motion_command_disabled: true, look_at_screen: false
       ,model_index_list:[0], NPC_turns_to_you:true
       ,onended_NPC: function (model_index) {
var d = MMD_SA_options.Dungeon
if (d._states.combat && d._states.combat.ondefeated(model_index)) {
  return
}

var model_para = MMD_SA_options.model_para_obj_all[model_index]
model_para._motion_name_next = that.motion["NPC-" + model_index + " combat get up"].name
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return

var d = MMD_SA_options.Dungeon
if (d._states.combat && d._states.combat.ondefeated(0)) {
  MMD_SA._freeze_onended = true
  return
}

MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[that.motion["PC combat get up"].name]]
MMD_SA._force_motion_shuffle = true
        }
      }
    };
    NPC_motion_list.push("PC combat hit down");
  }
  if (!this.motion["PC combat get up"]) {
    this.motion["PC combat get up"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\起き上がり.vmd',
      para: { adjust_center_view_disabled:true
       ,motion_command_disabled: true
       ,super_armor: { level:99 }
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
//  "左足ＩＫ": { keys_mod:[{frame:0, rot:{x:64.3, y:0, z:0}}] }
// ,"右足ＩＫ": { keys_mod:[{frame:0, rot:{x:64.3, y:0, z:0}}] }
    }
   ,morph_default: {
  "じと目": { weight:0.5 }
 ,"真面目": { weight:1 }
    }
  }
 ,"yukari_mob_v04_x2.8_arm-z-35.pmx" : {
    skin_default: {
  "グルーブ": { keys_mod: [
   { frame: 0, pos:{x:0, y:-12.65+1.5, z:0} }
  ,{ frame:26, pos:{x:0, y:-12.65+1.5, z:0} }
  ,{ frame:40, pos:{x:0, y:-12.65+1.5, z:0} }
    ]
  }
// ,"左足ＩＫ": { keys_mod:[{frame:0, rot:{x:64.3, y:0, z:0}}] }
// ,"右足ＩＫ": { keys_mod:[{frame:0, rot:{x:64.3, y:0, z:0}}] }
    }
   ,morph_default: {
  "じと目": { weight:0.5 }
 ,"真面目": { weight:1 }
    }
  }

        }
       ,model_index_list:[0]
       ,onended_NPC: function (model_index) {
var model_para = MMD_SA_options.model_para_obj_all[model_index]
model_para._motion_name_next = model_para.motion_name_default_combat
        }
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
if (!natural_end)
  return
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
        }
      }
    };
    NPC_motion_list.push("PC combat get up");
  }
  if (!this.motion["PC combat victory"]) {
    this.motion["PC combat victory"] = { path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\emote\\happy1.vmd',
      para: { adjust_center_view_disabled:true
       ,motion_command_disabled: true
       ,onended: function (natural_end) {
MMD_SA._no_fading = true
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true

MMD_SA_options.Dungeon.character.combat_mode = false
        }
      }
    };
//    NPC_motion_list.push("PC combat victory");
  }

  if (!this.motion["PC combat attack 01"]) {
    this.motion["PC combat attack 01"] = {
//+8,5,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\ともみ【3RP LK LP】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 4, 6], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[15,18], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[29,35], hit_level:3, SFX:{ bone_to_pos:"左手首" } }
        ]
       ,motion_duration: 37/30
       ,motion_duration_by_combo: [
  { combo_RE: "9", motion_duration:37/30 }
// ,{ combo_RE: "5",  motion_duration:22/30 }
 ,{ motion_duration:22/30 }//9/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 01");
  }
  if (!this.motion["PC combat attack 02"]) {
    this.motion["PC combat attack 02"] = {
//4,4,4,5
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\RED白【鬼哭連脚】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.25*30} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
//RS白_冬期軽装型_v011-Bk-R.pmx
  "センター": { pos_scale:{ auto_adjust:{ref_length:11.65455} } }
 ,"左足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.65455-1.78831, scale:0.5} } }
 ,"右足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.65455-1.78831, scale:0.5} } }
    }
  }
        }
       ,combat_para: [
  { frame_range:[ 4, 6], hit_level:1, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[ 7, 9], hit_level:1, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[10,12], hit_level:1, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[13,15], hit_level:1, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[16,20], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
        ]
       ,motion_duration: 28/30
       ,motion_duration_by_combo: [
  { combo_RE: "4,5", motion_duration:28/30 }
 ,{ combo_RE: "4",   motion_duration:15.5/30 }
 ,{ motion_duration:9.5/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 02");
  }
  if (!this.motion["PC combat attack 03"]) {
    this.motion["PC combat attack 03"] = {
//7,7,8
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\RED黒【鬼哭連拳】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 2, 4], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[ 5, 7], hit_level:1, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[10,13], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
        ]
       ,motion_duration: 20/30
       ,motion_duration_by_combo: [
  { combo_RE: "8", motion_duration:20/30 }
 ,{ motion_duration:8/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 03");
  }
  if (!this.motion["PC combat attack 04"]) {
    this.motion["PC combat attack 04"] = {
//45,45
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\まこと【立ち中K-中K】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
//菊地真カジュアル Ver2.0a_簡易版.pmx
  "センター": { pos_scale:{ auto_adjust:{ref_length:11.03743} } }
 ,"左足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.03743-1.3733, scale:0.5} } }
 ,"右足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.03743-1.3733, scale:0.5} } }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 3, 6], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[12,16], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
        ]
       ,motion_duration: 28/30
      }
    };
    NPC_motion_list.push("PC combat attack 04");
  }
  if (!this.motion["PC combat attack 05"]) {
    this.motion["PC combat attack 05"] = {
//5,5,4,6
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\千早【LF～ストンピングダブルニー～左構え】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }, { name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { pos_add:{x:15.6, y:0, z:0}, rot_add:{x:0, y:90, z:0} }
//如月千早カジュアル Ver.2.0a_簡易版.pmx
 ,"センター": { pos_scale:{ auto_adjust:{ref_length:11.57427} } }
 ,"左足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.57427-1.5702, scale:0.5} } }
 ,"右足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.57427-1.5702, scale:0.5} } }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 5,10], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[18,21], hit_level:1, SFX:{ bone_to_pos:"右ひざ" } }
 ,{ frame_range:[23,28], hit_level:3, SFX:{ bone_to_pos:"左ひざ" } }
        ]
       ,motion_duration: 44/30
       ,motion_duration_by_combo: [
  { combo_RE: "4,6", motion_duration:44/30 }
 ,{ motion_duration:15/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 05");
  }
  if (!this.motion["PC combat attack 06"]) {
    this.motion["PC combat attack 06"] = {
//5,4,5,6
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\千早【RF~アサルトラッシュ～ブルーサンダー～RF】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.25*30} }]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }, { name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { pos_add:{x:-2.4, y:0, z:0}, rot_add:{x:0, y:90, z:0} }
//如月千早カジュアル Ver.2.0a_簡易版.pmx
 ,"センター": { pos_scale:{ auto_adjust:{ref_length:11.57427} } }
 ,"左足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.57427-1.5702, scale:0.5} } }
 ,"右足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.57427-1.5702, scale:0.5} } }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 2, 5], hit_level:2, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[ 9,11], hit_level:1, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[20,24], hit_level:2, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[38,43], hit_level:3, SFX:{ bone_to_pos:"右足首" } }
        ]
       ,motion_duration: 62/30
       ,motion_duration_by_combo: [
  { combo_RE: "5,6", motion_duration:62/30 }
 ,{ combo_RE: "5",   motion_duration:30/30 }
 ,{ motion_duration:12/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 06");
  }
  if (!this.motion["PC combat attack 07"]) {
    this.motion["PC combat attack 07"] = {
//+8,7,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\千早【RF～マッハコンビネーション】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }, { name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { pos_add:{x:28.35, y:0, z:0}, rot_add:{x:0, y:90, z:0} }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 6,10], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[18,21], hit_level:1, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[27,35], hit_level:3, SFX:{ bone_to_pos:"右手首" } }
        ]
       ,motion_duration: 60/30
       ,motion_duration_by_combo: [
  { combo_RE: "9", motion_duration:60/30 }
 ,{ motion_duration:25/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 07");
  }
  if (!this.motion["PC combat attack 08"]) {
    this.motion["PC combat attack 08"] = {
//45,56
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\千早【左構え～ステップキックソバット～LF】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }, { name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { pos_add:{x:-8.5, y:0, z:0}, rot_add:{x:0, y:90, z:0} }
//如月千早カジュアル Ver.2.0a_簡易版.pmx
 ,"センター": { pos_scale:{ auto_adjust:{ref_length:11.57427} } }
 ,"左足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.57427-1.5702, scale:0.5} } }
 ,"右足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.57427-1.5702, scale:0.5} } }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 8,11], hit_level:2, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[21,26], hit_level:3, SFX:{ bone_to_pos:"左足首" } }
        ]
       ,motion_duration: 41/30
      }
    };
    NPC_motion_list.push("PC combat attack 08");
  }
  if (!this.motion["PC combat attack 09"]) {
    this.motion["PC combat attack 09"] = {
//+4,8,8,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\千早【左構え～ブラストコンビネーション】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }, { name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { pos_add:{x:-28.7, y:0, z:0}, rot_add:{x:0, y:90, z:0} }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 4, 7], hit_level:1, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[12,15], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[22,25], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[29,32], hit_level:3, SFX:{ bone_to_pos:"左手首" } }
        ]
       ,motion_duration: 60/30
       ,motion_duration_by_combo: [
  { combo_RE: "8,9", motion_duration:60/30 }
 ,{ combo_RE: "8",   motion_duration:27/30 }
 ,{ motion_duration:20/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 09");
  }
  if (!this.motion["PC combat attack 10"]) {
    this.motion["PC combat attack 10"] = {
//8,7,7,5
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\千早【左構え～ラピッドフィストロー～RF】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }, { name:"センター", scale:{x:0,y:0,z:1} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { pos_add:{x:-8.5, y:0, z:0}, rot_add:{x:0, y:90, z:0} }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 7,10], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[15,18], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[21,24], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[29,32], hit_level:2, SFX:{ bone_to_pos:"右足首" } }
        ]
       ,motion_duration: 47/30
       ,motion_duration_by_combo: [
  { combo_RE: "7,5", motion_duration:47/30 }
 ,{ combo_RE: "7",   motion_duration:26/30 }
 ,{ motion_duration:19/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 10");
  }
  if (!this.motion["PC combat attack 11"]) {
    this.motion["PC combat attack 11"] = {
//456
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\日高舞『踵斧』.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
//       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.05*30} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { rot_add:{x:0, y:-90, z:0} }
//日高舞.pmx
 ,"センター": { pos_scale:{ auto_adjust:{ref_length:11.67395} } }
 ,"左足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.67395-1.750509, scale:0.5} } }
 ,"右足ＩＫ": { pos_scale:{ auto_adjust:{ref_length:11.67395-1.750509, scale:0.5} } }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:2, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[41,50], hit_level:5, SFX:{ bone_to_pos:"左足首", pos_offset:{x:0, y:10, z:0}, visual:{ hit:{ sprite:[{name:"explosion_red_01", scale:2}] } } }, bb_expand:{x:0.5*3, y:0, z:0.5*3} }
        ]
       ,motion_duration: 95/30

,SFX: [{frame_range:[41,999], sprite:[{bone_ref:"左足首",name:"explosion_sinestesia-01_03",scale:3,depth:5}]/*, camera_shake:{magnitude:0.2,duration:500}*/}]
      }
    };
    NPC_motion_list.push("PC combat attack 11");
  }
  if (!this.motion["PC combat attack 12"]) {
    this.motion["PC combat attack 12"] = {
//7,8,7,8,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\狂気フラン【TC-弱P弱P中P強P強P】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:1,y:0,z:0} }]
       ,adjustment_per_model: {
  _default_ : {
    skin_default: {
  "全ての親": { rot_add:{x:0, y:-90, z:0} }
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 1, 3], hit_level:1, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[ 9,11], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[19,21], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[31,35], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[38,43], hit_level:3, SFX:{ bone_to_pos:"左手首", pos_offset:{x:0, y:-5, z:0} } }
        ]
       ,motion_duration: 47/30
       ,motion_duration_by_combo: [
  { combo_RE: "7,8,9", motion_duration:47/30 }
 ,{ combo_RE: "7,8",   motion_duration:36/30 }
 ,{ combo_RE: "7",     motion_duration:25/30 }
 ,{ motion_duration:17/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 12");
  }
  if (!this.motion["PC combat attack 13"]) {
    this.motion["PC combat attack 13"] = {
//4,7,8
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\東豪寺麗華【修羅覇王靠華山】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 2, 4], hit_level:1, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[10,12], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[16,19], hit_level:2, SFX:{ bone_to_pos:"右ひじ" } }
        ]
       ,motion_duration: 29/30
       ,motion_duration_by_combo: [
  { combo_RE: "8", motion_duration:29/30 }
 ,{ motion_duration:13/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 13");
  }
  if (!this.motion["PC combat attack 14"]) {
    this.motion["PC combat attack 14"] = {
//+7,5,6
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\美心【背向け-RPRKWK-ダークナイトコンビネーション】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 5, 7], hit_level:1, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[14,17], hit_level:2, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[31,34], hit_level:3, SFX:{ bone_to_pos:"右足首" } }
        ]
       ,motion_duration: 45/30
       ,motion_duration_by_combo: [
  { combo_RE: "6", motion_duration:45/30 }
 ,{ motion_duration:23/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 14");
  }
  if (!this.motion["PC combat attack 15"]) {
    this.motion["PC combat attack 15"] = {
//78,78,8,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\渋谷凛【サラマンダーコンビネーション】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 4, 7], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[12,14], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[18,20], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[24,26], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[37,41], hit_level:3, SFX:{ bone_to_pos:"左手首" } }
        ]
       ,motion_duration: 43/30
       ,motion_duration_by_combo: [
  { combo_RE: "8,9", motion_duration:43/30 }
 ,{ combo_RE: "8",   motion_duration:28/30 }
 ,{ motion_duration:22/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 15");
  }
  if (!this.motion["PC combat attack 16"]) {
    this.motion["PC combat attack 16"] = {
//+7,7,8,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\FIGHT - モコキッカーのクソモーション詰め合わせ★13杯\\+-+-+通常、必殺技BOX\\渋谷凛【フラッシュアサルトコンボ-ターンイン-ボディストレート】.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"センター", scale:{x:0,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 2, 4], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[ 5, 7], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[ 8,11], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[13,16], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[27,30], hit_level:3, SFX:{ bone_to_pos:"右手首" } }
        ]
       ,motion_duration: 35/30
       ,motion_duration_by_combo: [
  { combo_RE: "8,9", motion_duration:35/30 }
 ,{ combo_RE: "8",   motion_duration:18/30 }
 ,{ motion_duration:12/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 16");
  }
  if (!this.motion["PC combat attack 17"]) {
    this.motion["PC combat attack 17"] = {
//8,8,7,6
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\攻撃配布用\\咲夜　基本攻撃.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.25*30} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 2, 5], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[13,15], hit_level:2, SFX:{ bone_to_pos:"右手首" } }
 ,{ frame_range:[25,28], hit_level:1, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[36,40], hit_level:3, SFX:{ bone_to_pos:"右足首" } }
        ]
       ,motion_duration: 53/30
       ,motion_duration_by_combo: [
  { combo_RE: "7,6", motion_duration:53/30 }
 ,{ combo_RE: "7",   motion_duration:30/30 }
 ,{ motion_duration:18/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 17");
  }
  if (!this.motion["PC combat attack 18"]) {
    this.motion["PC combat attack 18"] = {
//+4,5,8,9
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\格闘簡易作成用モーション\\格闘シーン簡易作成用モーション\\格闘簡易作成用モーション\\Albert-combo6.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.5*30} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 7, 9], hit_level:1, SFX:{ bone_to_pos:"右足首" } }
 ,{ frame_range:[13,16], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[23,26], hit_level:2, SFX:{ bone_to_pos:"左手首" } }
 ,{ frame_range:[33,37], hit_level:3, SFX:{ bone_to_pos:"右手首" } }
        ]
       ,motion_duration: 54/30
       ,motion_duration_by_combo: [
  { combo_RE: "8,9", motion_duration:53/30 }
 ,{ combo_RE: "8",   motion_duration:31/30 }
 ,{ motion_duration:22/30 }
        ]
      }
    };
    NPC_motion_list.push("PC combat attack 18");
  }
  if (!this.motion["PC combat attack 19"]) {
    this.motion["PC combat attack 19"] = {
//56,56
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\格闘簡易作成用モーション\\格闘シーン簡易作成用モーション\\格闘簡易作成用モーション\\Albert-somersault-kick.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.25*30} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,combat_para: [
  { frame_range:[ 9,12], hit_level:2, SFX:{ bone_to_pos:"左足首" } }
 ,{ frame_range:[15,18], hit_level:3, SFX:{ bone_to_pos:"右足首" } }
        ]
       ,motion_duration: 38/30
      }
    };
    NPC_motion_list.push("PC combat attack 19");
  }

  if (!this.motion["PC combat attack 2-handed weapon 01"]) {
    this.motion["PC combat attack 2-handed weapon 01"] = {
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション３\\ナイトミク\\k.miku-2hand-Claymore（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:2, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[12,14], hit_level:2, SFX:{ bone_to_pos:"右手首" }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2} }
 ,{ frame_range:[41,43], hit_level:3, SFX:{ bone_to_pos:"右手首" }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2} }
        ]
       ,motion_duration: 88/30
//       ,duration: 88/30+10
//       ,duration_NPC: 88/30
      }
    };
    NPC_motion_list.push("PC combat attack 2-handed weapon 01");
  }

  if (!this.motion["PC combat attack twin weapon 01"]) {
    this.motion["PC combat attack twin weapon 01"] = {
// 2,2
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-handaxe1（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[18,20], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[43,45], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
        ]
       ,motion_duration: 76/30
       ,motion_duration_by_combo: [
  { combo_RE: "3",   motion_duration:76/30 }
 ,{ motion_duration: 28/30 }
        ]
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 01");
  }
  if (!this.motion["PC combat attack twin weapon 02"]) {
    this.motion["PC combat attack twin weapon 02"] = {
// 2,1
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-handaxe2（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[23,26], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[28,30], hit_level:1, SFX:{ bone_to_pos:"左手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[47,50], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
        ]
       ,motion_duration: 78/30
       ,motion_duration_by_combo: [
  { combo_RE: "3",   motion_duration:78/30 }
 ,{ motion_duration: 34/30 }
        ]
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 02");
  }
  if (!this.motion["PC combat attack twin weapon 03"]) {
    this.motion["PC combat attack twin weapon 03"] = {
// 12,12
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-longsword1（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[13,15], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[36,38], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
        ]
       ,motion_duration: 64/30
       ,motion_duration_by_combo: [
  { combo_RE: "3",   motion_duration:64/30 }
 ,{ motion_duration: 22/30 }
        ]
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 03");
  }
  if (!this.motion["PC combat attack twin weapon 04"]) {
    this.motion["PC combat attack twin weapon 04"] = {
// 23,23
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-longsword2（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
//       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[21,24], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*3, y:0, z:0.5*3}, bb_translate:{x:0, y:0, z:0.5*1}, sound_name:"swing" }
        ]
       ,motion_duration: 60/30
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 04");
  }
  if (!this.motion["PC combat attack twin weapon 05"]) {
    this.motion["PC combat attack twin weapon 05"] = {
// +2,2
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-rapier1（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[12,15], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*1, y:0, z:0.5*1}, bb_translate:{x:0, y:0, z:0.5*3}, sound_name:"swing" }
 ,{ frame_range:[36,39], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*1, y:0, z:0.5*1}, bb_translate:{x:0, y:0, z:0.5*3}, sound_name:"swing" }
        ]
       ,motion_duration: 66/30
       ,motion_duration_by_combo: [
  { combo_RE: "3",   motion_duration:66/30 }
 ,{ motion_duration: 22/30 }
        ]
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 05");
  }
  if (!this.motion["PC combat attack twin weapon 06"]) {
    this.motion["PC combat attack twin weapon 06"] = {
// +23,23
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-rapier2（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
//       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[16,19], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*1, y:0, z:0.5*1}, bb_translate:{x:0, y:0, z:0.5*3}, sound_name:"swing" }
        ]
       ,motion_duration: 50/30
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 06");
  }
  if (!this.motion["PC combat attack twin weapon 07"]) {
    this.motion["PC combat attack twin weapon 07"] = {
// 1,2
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-scimitar1（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[15,18], hit_level:1, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[25,28], hit_level:2, SFX:{ bone_to_pos:"左手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[47,50], hit_level:1, SFX:{ bone_to_pos:"左手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[58,62], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
        ]
       ,motion_duration: 90/30
       ,motion_duration_by_combo: [
  { combo_RE: "1,3", motion_duration:90/30 }
 ,{ combo_RE: "1",   motion_duration:52/30 }
 ,{ motion_duration: 36/30 }
        ]
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 07");
  }
  if (!this.motion["PC combat attack twin weapon 08"]) {
    this.motion["PC combat attack twin weapon 08"] = {
// 123
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション４\\astora\\2sword\\astora-2sword-scimitar2（全親追従）.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
//       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[20,24], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*3, y:0, z:0.5*3}, bb_translate:{x:0, y:0, z:0.5*1}, sound_name:"swing" }
        ]
       ,motion_duration: 54/30
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack twin weapon 08");
  }

  if (!this.motion["PC combat attack 1-handed weapon 01"]) {
    this.motion["PC combat attack 1-handed weapon 01"] = {
// 1,2
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション５\\astorias\\astora-astorias-attack3_v01.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[13,16], hit_level:1, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[36,39], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[72,75], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
        ]
       ,motion_duration: 118/30
       ,motion_duration_by_combo: [
  { combo_RE: "2,3", motion_duration:(90+28*0)/30 }
 ,{ combo_RE: "2",   motion_duration:58/30 }
 ,{ motion_duration: 24/30 }
        ]
       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack 1-handed weapon 01");
  }
  if (!this.motion["PC combat attack 1-handed weapon 02"]) {
    this.motion["PC combat attack 1-handed weapon 02"] = {
// 12,12
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション５\\astorias\\astora-astorias-attack9-10_v01.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
//       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[22,28], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*3, y:0, z:0.5*3}, sound_name:"swing" },
  { frame_range:[32,38], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*3, y:0, z:0.5*3}, sound_name:"swing" },
  { frame_range:[66,82], hit_level:1, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*1, y:0, z:0.5*1} },
  { frame_range:[87,90], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*3}, sound_name:"swing" },
        ]
       ,range:[{time:[8,0]}]
       ,motion_duration: 128/30
       ,motion_duration_by_combo: [
  { combo_RE: "2,13", motion_duration:128/30 },
  { combo_RE: "2",  motion_duration:58/30 },
  { motion_duration: 32/30 },
        ]
       ,playbackRate_by_model_index: {"0":1.25}
      }
    };
    NPC_motion_list.push("PC combat attack 1-handed weapon 02");
  }
/*
  if (!this.motion["PC combat attack 1-handed weapon 03"]) {
    this.motion["PC combat attack 1-handed weapon 03"] = {
// 12,2
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\粗製のモーション５\\astorias\\astora-astorias-attack8-10_v01.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
       ,model_index_list: [0]
       ,bone_to_position: [{ name:"全ての親", scale:{x:1,y:0,z:1} }]
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
//       ,super_armor: { level:1, damage_scale:0.5 }
       ,combat_para: [
  { frame_range:[13,16], hit_level:2, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*2}, sound_name:"swing" }
 ,{ frame_range:[75,78], hit_level:3, SFX:{ bone_to_pos:"右手首", sound:{hit:{ name:"hit_slash"}} }, bb_expand:{x:0.5*2, y:0, z:0.5*2}, bb_translate:{x:0, y:0, z:0.5*3}, sound_name:"swing" }
        ]
       ,motion_duration: 117/30
       ,motion_duration_by_combo: [
  { combo_RE: "23", motion_duration:(101+16*0)/30 }
 ,{ motion_duration: 42/30 }
        ]
//       ,playbackRate_by_model_index: {"0":1.5}
      }
    };
    NPC_motion_list.push("PC combat attack 1-handed weapon 03");
  }
*/
}
/*
if (!this.motion["DUMMY"]) {
  this.motion["DUMMY"] = {
    path: "MMD.js/motion/motion_basic_pack01.zip#/center_dummy.vmd"
   ,para: {
      model_name_RegExp: {
        test: function (model_filename) {
var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx")
var model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned]
if (model_para && model_para.is_object && (!model_para.motion_name_default || !MMD_SA_options.motion_para[model_para.motion_name_default])) {
//  model_para.motion_name_default = "center_dummy"
  return true
}
return false
        }
      }
    }
  }
}
*/
this.motion_filename_by_id = {}
this.motion_id_by_filename = {}

window.addEventListener("SA_MMD_init", function (e) {

for (var name in that.motion) {
  let motion = that.motion[name]
  motion.name = decodeURIComponent(((motion.path)?motion:MMD_SA_options.motion[motion.index]).path.replace(/^.+[\/\\]/, "").replace(/\.vmd$/i, ""))

  that.motion_filename_by_id[name] = motion.name
  that.motion_id_by_filename[motion.name] = name

  if (motion.index != null) {
    if (motion.path) {
      MMD_SA_options.motion[motion.index] = { must_load:true, no_shuffle:true, path:motion.path }
    }
  }
  else {
    let index = MMD_SA_options.motion.findIndex(function (obj) { return (!obj || (obj.path == motion.path)) })
    if ((index == -1) || (!MMD_SA_options.motion[index])) {
      motion.index = (index == -1) ? MMD_SA_options.motion.length : index
      MMD_SA_options.motion[motion.index] = { must_load:true, no_shuffle:true, path:motion.path }
    }
    else
      motion.index = index
  }

  let para = motion.para
  if (para) {
    if (para.combat_para) {
      if (para.look_at_screen == null)
        para.look_at_screen = false

// define combat motion.duration to prevent looping
      if (para.motion_duration && !para.duration) {
        para.duration = Math.max(10,para.motion_duration) + (para.duration_NPC||0)
      }

      let xz = ["x","z"]
      para.combat_para.forEach(function (p) {
        if (p.bb_expand) {
          xz.forEach(function (_xz) {
            p.bb_expand[_xz] = (1+p.bb_expand[_xz])/_bb_xz_factor_ - 1
          });
        }
        if (p.bb_translate) {
          xz.forEach(function (_xz) {
            if (p.bb_translate[_xz])
              p.bb_translate[_xz] = p.bb_translate[_xz]/_bb_xz_factor_
          });
        }
      });
    }
    MMD_SA_options.motion_para[motion.name] = para
  }
  else {
    para = MMD_SA_options.motion_para[motion.name]
  }

  if (para && !para.motion_blending) {
    para.motion_blending = {
      fadein: {}
    };
  }

  if (name == "PC default") {
    if (!MMD_SA_options.motion_shuffle_list_default) {
      MMD_SA_options.motion_shuffle_list_default = [motion.index]
    }
  }
}
if (MMD_SA_options.model_path_extra) {
  let motion_PC_default = that.motion["PC default"]

  MMD_SA_options.model_path_extra.forEach(function (path, idx) {
    var model_filename = path.replace(/^.+[\/\\]/, "")
    var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx")
    var model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned]
    if (!model_para)
      model_para = MMD_SA_options.model_para[model_filename] = {}

    if (motion_PC_default) {
      if (!model_para.motion_name_default)
        model_para.motion_name_default = motion_PC_default.name
    }

// backward compatibility (.motion_includes)
    model_para.motion_included = model_para.motion_included || model_para.motion_includes

    if (model_para.motion_included) {
//console.log(model_para.motion_included)
      for (var name in that.motion) {
        var motion = that.motion[name]
        if ((model_para.motion_included.indexOf(name) != -1) || (model_para.motion_included.indexOf(motion.name) != -1)) {
          var motion_para = MMD_SA_options.motion_para[motion.name]
          if (!motion_para.model_index_list)
            motion_para.model_index_list = []
          if (motion_para.model_index_list.indexOf(idx+1) == -1)
            motion_para.model_index_list.push(idx+1)
        }
      }
    }

    model_para.look_at_character = (model_para.look_at_character == -1) ? null : (model_para.look_at_character || 0)
//    if (!model_para.rigid_filter) model_para.rigid_filter = /^DISABLED$/
  });
}

NPC_motion_list.forEach(function (motion_name) {
  that.object_base_list.forEach(function (obj_base) {
    if ((obj_base.character_index == null) || !obj_base.use_combat_motion)
      return

    that.battle_model_index_list.push(obj_base.character_index)

    var path = MMD_SA_options.model_path_extra[obj_base.character_index-1]
    var model_filename = path.replace(/^.+[\/\\]/, "")
    var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx")
    var model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned]

    var NPC_motion_name = motion_name.replace(/^PC/, "NPC-" + obj_base.character_index)
    var NPC_motion_name_translated = (that.motion[NPC_motion_name] && NPC_motion_name) || (model_para.motion_map && model_para.motion_map[NPC_motion_name]) || motion_name
    that.motion[NPC_motion_name] = that.motion[NPC_motion_name_translated]

    if (!that.motion[NPC_motion_name].para.model_index_list)
      that.motion[NPC_motion_name].para.model_index_list = []
    that.motion[NPC_motion_name].para.model_index_list.push(obj_base.character_index)

// PC doesn't need .motion_name_default/.motion_name_default_combat
    if (/combat default/.test(NPC_motion_name)) {
      model_para.motion_name_default_combat = model_para.motion_name_default_combat || that.motion[NPC_motion_name].path.replace(/^.+[\/\\]/, "").replace(/\.vmd$/i, "")
      model_para.motion_name_default        = model_para.motion_name_default        || model_para.motion_name_default_combat
    }
  });
});

window.addEventListener("MMDStarted", function (e) {
  var d = MMD_SA_options.Dungeon
  d._motion_shuffle_list_default = MMD_SA_options.motion_shuffle_list_default.slice()
  d._motion_shuffle_list_default_combat = (d.motion["PC combat default"]) ? [MMD_SA_options.motion_index_by_name[d.motion["PC combat default"].name || "PC combat default"]] : null
  d._motion_shuffle_list_default_parry  = (d.motion["PC combat parry"])   ? [MMD_SA_options.motion_index_by_name[d.motion["PC combat parry"].name   || "PC combat parry"]]   : null
});

});

};

})();
