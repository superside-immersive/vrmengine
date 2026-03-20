// motion-para-part2.js — Motion parameters: social distance emotes, chair physics
// Extracted from animate.js lines 854-1447
(function () {
  function XRA_itemBase() {
    return XRA_DungeonOptionsCompat().item_base;
  }

  Object.assign(MMD_SA_options.motion_para, {
    "emote-mod_がっかり1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started) {
  if (XRA_itemBase().baseball.action._ball_para) {
    MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + ". Not bad.", 3*1000)
  }
  else {
    MMD_SA.SpeechBubble.message(0, "It's too close to throw the ball...", 3*1000)
  }
}
else {
  MMD_SA.SpeechBubble.message(0, "That's a lot more than 2 meter...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(6,8))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(6,8))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_がっかり2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started) {
  if (XRA_itemBase().baseball.action._ball_para) {
    MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + ". It's ok.", 3*1000)
  }
  else {
    MMD_SA.SpeechBubble.message(0, "I need more distance...", 3*1000)
  }
}
else {
  MMD_SA.SpeechBubble.message(0, "No, not that far away...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(6,8))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(6,8))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_肩をすくめる1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started) {
  if (XRA_itemBase().baseball.action._ball_para) {
    MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + ". Do better next time.", 3*1000)
  }
  else {
    MMD_SA.SpeechBubble.message(0, "Isn't it too close...", 3*1000)
  }
}
else {
  MMD_SA.SpeechBubble.message(0, "What's the point to stand so far away...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(6,8))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(6,8))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_肩をすくめる2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started) {
  if (XRA_itemBase().baseball.action._ball_para) {
    MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + ". Still room for improvement.", 3*1000)
  }
  else {
    MMD_SA.SpeechBubble.message(0, "5 meters apart at least, please...?", 3*1000)
  }
}
else {
  MMD_SA.SpeechBubble.message(0, "Come on, not that far away...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(6,8))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(6,8))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_すねる1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started && XRA_itemBase().baseball.action._ball_para) {
  MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + "... oh well...", 3*1000)
}
else {
  MMD_SA.SpeechBubble.message(0, "You don't like me, do you...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(8,999))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(8,999))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_すねる2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started && XRA_itemBase().baseball.action._ball_para) {
  MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + "...", 3*1000)
}
else {
  MMD_SA.SpeechBubble.message(0, "This is so boring...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(8,999))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(8,999))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_よろめく1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started) {
  if (XRA_itemBase().baseball.action._ball_para) {
    MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + "... isn't it too bad...", 3*1000)
  }
  else {
    MMD_SA.SpeechBubble.message(0, "You think I can throw a magical curveball...?", 3*1000)
  }
}
else {
  MMD_SA.SpeechBubble.message(0, "Am I a joke to you...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(8,999))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(8,999))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_よろめく2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (XRA_itemBase().baseball._started) {
  if (XRA_itemBase().baseball.action._ball_para) {
    MMD_SA.SpeechBubble.message(0, "Your score is " + XRA_itemBase().baseball.action._ball_para.hit_score + "... oh no...", 3*1000)
  }
  else {
    MMD_SA.SpeechBubble.message(0, "Can you stand in front of me, please...", 3*1000)
  }
}
else {
  MMD_SA.SpeechBubble.message(0, "Oh my God... do you have to stand so far away...", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (XRA_itemBase().social_distancing.action._social_distance_check(8,999))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((XRA_itemBase().baseball._started) ? ((Date.now() > this._duration_end_) ? !XRA_itemBase().baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (XRA_itemBase().social_distancing._started && !XRA_itemBase().social_distancing.action._social_distance_check(8,999))) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_おどろく1": {
  onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
  }

 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > 1) {
  if (MMD_SA._v3a.copy(MMD_SA.camera_position).setY(0).distanceTo(MMD_SA._v3b.copy(model.mesh.position).setY(0))/10 / MMD_SA.WebXR.zoom_scale < 1) {
    model.skin.time = 1
    model.morph.time = 1
  }
}
  }

 ,auto_blink: false//true
 ,adjust_center_view_disabled: true
/*
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
*/
    }

   ,"baseball_throw": {
  onstart: function () {
XRA_itemBase().baseball.action._ball_para = null
MMD_SA.SpeechBubble.message(0, "Catch this~!", 1*1000)
  }

 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (!loop_end) return;

var score = XRA_itemBase().baseball.action._ball_para.hit_score
if (score > 75) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_お辞儀1"], MMD_SA_options.motion_index_by_name["emote-mod_お辞儀2"], MMD_SA_options.motion_index_by_name["emote-mod_肯定する1"], MMD_SA_options.motion_index_by_name["emote-mod_肯定する2"]]
}
else if (score > 40) {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_がっかり1"], MMD_SA_options.motion_index_by_name["emote-mod_がっかり2"], MMD_SA_options.motion_index_by_name["emote-mod_肩をすくめる1"], MMD_SA_options.motion_index_by_name["emote-mod_肩をすくめる2"]]
}
else {
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_すねる1"], MMD_SA_options.motion_index_by_name["emote-mod_すねる2"], MMD_SA_options.motion_index_by_name["emote-mod_よろめく1"], MMD_SA_options.motion_index_by_name["emote-mod_よろめく2"]]
}

MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
  }

// ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time >= 140/30) {
  XRA_itemBase().baseball.action._ball_fly()
}
  }

 ,auto_blink: true
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"上半身",  weight_screen:1/3, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:2/3, weight_motion:1 }
]
    }

   ,"chair_sit01_armIK": (function () {
      return {
  onstart: function () {
this._ground_plane_visible = MMD_SA.WebXR.ground_plane.visible
  }

 ,onended: function (loop_end) {
if (MMD_SA.WebXR.session)
  MMD_SA.WebXR.ground_plane.visible = this._ground_plane_visible;
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
//MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
  }

 ,onplaying: function () {
if (MMD_SA.WebXR.session)
  MMD_SA.WebXR.ground_plane.visible = false;
//var model_para = MMD_SA_options.model_para_obj
//model_para._custom_skin = [{ key:{ name:"右腕ＩＫ", pos:[0,1,0] ,rot:[0,0,0,1] ,interp:MMD_SA._skin_interp_default }, idx:mesh.bones_by_name["右腕ＩＫ"]._index }]
  }

 ,center_view: [0,-7.5,7.5]

 ,mirror_disabled: true

 ,motion_tracking_enabled: true, motion_tracking_upper_body_only: true

 ,motion_tracking: {
    lean_reduction_power: 1.5,
    arm_as_leg: {
      enabled: true,
      transformation: {

        position: {
          x: { unit_length:1, scale:2 },
          y: { add:-0.1, min:0.15, scale:2 },
          z: { unit_length:1, add:0, min:7, scale:3 },
          length_max: 1.2,
        },

        rotation: {
//          y: { scale:1.25 },
          y: { foot_ratio:0.5 },
        },
      },
    }
  }

 ,process_bones: function (model, skin) {
var mesh = model.mesh
var leg_scale = MMD_SA.THREEX.get_model(0).para.left_leg_length/10.569580078125;
var chair_ground_y = mesh.bones_by_name["下半身"].pmxBone.origin[1] - 8 * ((!MMD_SA.THREEX.enabled) ? leg_scale : 1);
mesh.bones_by_name["全ての親"].position.y -= chair_ground_y * ((MMD_SA.THREEX.enabled) ? leg_scale : 1);

var xr = MMD_SA.WebXR
if (!xr.session) {
  xr.hit_ground_y = 0
  xr.hit_ground_y_lowest = -0.1
}

var ground_y_diff = (xr.hit_ground_y - xr.hit_ground_y_lowest) * 10 * xr.zoom_scale - chair_ground_y
if (ground_y_diff >= 0)
  return

if (ground_y_diff < -chair_ground_y)
  ground_y_diff = -chair_ground_y

var posL = mesh.bones_by_name["左足ＩＫ"].position
var posR = mesh.bones_by_name["右足ＩＫ"].position
posL.y -= ground_y_diff
posL.z -= ground_y_diff
posR.y -= ground_y_diff
posR.z -= ground_y_diff

const heel_height = MMD_SA_options.model_para_obj.left_heel_height;
posL.y += heel_height;
posR.y += heel_height;

//DEBUG_show(posL.toArray().join('\n'))

if (skin.time < 1) {
  let factor = Math.min(skin.time/1,1)
  factor = (1 - factor*factor) * Math.abs(ground_y_diff/chair_ground_y)
  let leg_stretch = 5 * factor
  let ankle_rot = MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.set(-30*Math.PI/180*factor,0,0), "YZX")
  posL.z += leg_stretch
  posR.z += leg_stretch
  mesh.bones_by_name["左足ＩＫ"].quaternion.multiply(ankle_rot)
  mesh.bones_by_name["右足ＩＫ"].quaternion.multiply(ankle_rot)
}

System._browser.camera.poseNet.enable_IK('左腕ＩＫ', true)
System._browser.camera.poseNet.enable_IK('右腕ＩＫ', true)
  }

 ,freeze_onended: true

 ,object_click_disabled: true

 ,auto_blink: true
// ,adjust_center_view_disabled: true

 ,adjustment_per_model: {
    _default_ : {
  skin_default: {
//    "両目": { rot_add:{x:-5, y:2.5, z:0} }
    "頭": { keys:[{time:0, rot:{x:-11.3,y:0,z:0}}] }
   ,"下半身": { rot_add:{x:50, y:0, z:0} }
   ,"上半身": { rot_add:{x:10, y:0, z:0} }
   ,"上半身2": { rot_add:{x:-10, y:0, z:0} }
//,'左手捩': { keys:[{time:0, rot:{x:0,y:0,z:0}}] },'右手捩': { keys:[{time:0, rot:{x:0,y:0,z:0}}] }
  }
 ,morph_default:{
//    "笑い": { weight:0.2 }
  }
    }
  }

 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.75, weight_screen_x:0,weight_screen_y:1, weight_motion:1 }
]
      };
    })()

   ,"walk_A34_f0-42": {
  adjustment_per_model: {
    _default_ : {
  skin_default: {
    "全ての親": { pos:{ x:0, y:0, z:5.1 } }
  }
    }
  },

  look_at_screen_bone_list: [
    { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
    { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  ],

  _speed: 360/1800 *30,

  SFX: [
    { frame:1,  sound:{} },
    { frame:21, sound:{} },
  ],

  motion_tracking_enabled: true, motion_tracking_upper_body_only: true,

  motion_tracking: {
    look_at_screen:true,
    motion_default_weight: {
      head: 0.5,
    },
    hip_adjustment: {
      rotation_weight: 0.5,
      displacement_weight: 1,
    },
  },
    }


  });
})();
