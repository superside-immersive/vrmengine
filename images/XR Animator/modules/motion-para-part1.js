// motion-para-part1.js — Motion parameters: dance, emote, wall interactions
// Extracted from animate.js lines 229-853
(function () {
  Object.assign(MMD_SA_options.motion_para, {
    "stand" : { onended: function () { MMD_SA._no_fading=true; } }
   ,"standmix" : { onended: function () { MMD_SA._no_fading=true; } }
   ,"standmix2_modified" : { onended: function () { MMD_SA._no_fading=true; }

,allows_kissing: true
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]

,adjustment_per_model: {
    _default_ : {
  skin_default: {
    "左足ＩＫ": { keys: [{time:0, pos:{x: 0.2, y:0, z:0}, rot:{x:0, y: 10, z:0}}] }
   ,"右足ＩＫ": { keys: [{time:0, pos:{x:-0.2, y:0, z:0}, rot:{x:0, y:-10, z:0}}] }
  }
    }
}

    }
   ,"_sleep90" : { onended: function () { MMD_SA._no_fading=true; } }

   ,"恋はきっと☆まままＧＵＭＩ用 - modified" : { loop:[1,2], range:[{time:[4079,4278]}], BPM:{rewind:true, BPM: 143, beat_frame: 13 +60/143*30} }
   ,"真ん中_0-250_v2_GUMI" : { loop:[2,2], range:[{time:[0,150+22]}], BPM:{rewind:true, BPM: 115, beat_frame: 134} }
   ,"メダロット・ハク" : { loopback_fading:true, BPM:{rewind:true, BPM: 111.87, beat_frame: 204} }
   ,"after_school_stride" : { center_view:[-2.5,0,7.5], loopback_fading:true, BPM:{rewind:true, BPM: 112.5, beat_frame: 287} }
   ,"Masked bitcH" : { loopback_fading:true, BPM:{rewind:true, BPM: 125, beat_frame: 431} }
   ,"HAL Dance" : { center_view:[0,0,2.5], range:[{time:[407,0]}], loopback_fading:true, BPM:{rewind:true, BPM: 97.54*1.5, beat_frame: 446} }
   ,"Telephoneダンスモーション" : { loopback_fading:true, BPM:{rewind:true, BPM: 122, beat_frame: 4025} }
   ,"GetLucky(MP3)" : { range:[{time:[591,0]}], BPM:{rewind:true, BPM: 117.06, beat_frame: 767} }
   ,"It makes me ill - modified" : { loopback_fading:true, BPM:{rewind:true, BPM: 104.5, beat_frame: 119} }
   ,"magic_of_xyz" : { center_view:[0,0,2.5], loopback_fading:true, BPM:{rewind:true, BPM: 130, beat_frame: 498} }
   ,"monstar" : { center_view:[0,0,20], loopback_fading:true, BPM:{rewind:true, BPM: 116.03, beat_frame: 273} }
   ,"Walka_Not_A_Talka" : { center_view:[0,0,10], loopback_fading:true, BPM:{rewind:true, BPM: 106.7, beat_frame: 696} }
   ,"Ass_On_The_Floor" : { center_view:[-10,0,10], loopback_fading:true, BPM:{rewind:true, BPM: 127.03, beat_frame: 840} }
   ,"black_n_gold" : { center_view:[-2.5,0,12.5], loopback_fading:true, BPM:{rewind:true, BPM: 136.01, beat_frame: 96} }
   ,"louboutins" : { loopback_fading:true, BPM:{rewind:true, BPM: 105.03, beat_frame: 110} }
   ,"HeartBeats配布用" : { loopback_fading:true, range:[{time:[120,120+(30*(60+54)+21)]},{time:[120+(30*(180+31)),120+(30*(300)+10)]}], BPM:{rewind:true, BPM: 128.01, beat_frame: 820} }
   ,"circus" : { center_view:[-5,0,12.5], loopback_fading:true, range:[{time:[120,0]}], BPM:{rewind:true, BPM: 115, beat_frame: 834, match_even_beats_only:true} }
   ,"matryoshka_motion_0-5151" :  { center_view:[0,0,15], loopback_fading:true, range:[{time:[210,210+(30*(120+23)+10)]}], BPM:{rewind:true, BPM: 102.48, beat_frame: 959} }
   ,"musclecar" : { center_view:[2.5,0,5], loopback_fading:true, range:[{time:[300,0]}], BPM:{rewind:true, BPM: 129.13, beat_frame: 1055} }
   ,"まっさらブルージーンズ" : { center_view:[0,0,2.5], loopback_fading:true, range:[{time:[300,0]}], BPM:{rewind:true, BPM: 154.97, beat_frame: 704} }
   ,"sweetmagic-left" : { center_view:[-10,0,0], loopback_fading:true, BPM:{rewind:true, BPM: 123, beat_frame: 884} }
   ,"てるてる(通常モデル用)" : { center_view:[0,0,2.5], loopback_fading:true, range:[{time:[300,0]}], BPM:{rewind:true, BPM: 170.02, beat_frame: 1587} }
   ,"wavefile_lat" : { loopback_fading:true, range:[{time:[30,0]}], BPM:{rewind:true, BPM: 135.01, beat_frame: 427} }
   ,"love&joyお面無しver" : { center_view:[0,0,2.5], loopback_fading:true, range:[{time:[600,600+(30*(60+46)+2)]},{time:[600+(30*(120+8)+8),7780]}], BPM:{rewind:true, BPM: 173.03, beat_frame: 1393} }
   ,"HCPえりかver（Lat式用）" : { center_view:[0,0,0], loopback_fading:true, range:[{time:[90,0]}], BPM:{rewind:true, BPM: 164.01, beat_frame: 206} }
   ,"suki_yuki_maji_magic" : { center_view:[0,0,0], loopback_fading:true, range:[{time:[0,6145]}], BPM:{rewind:true, BPM: 167.02, beat_frame: 101} }
   ,"SS_準標準ボーン必須" : { center_view:[0,0,0], loopback_fading:true, range:[{time:[12*30,(2*60+33)*30]},{time:[(2*60+44)*30,0]}], BPM:{rewind:true, BPM: 144.01, beat_frame: 652+1} }
   ,"Tipsy" : { center_view:[0,0,15], loopback_fading:true, range:[{time:[133,0]}], BPM:{rewind:true, BPM: 93*1.5, beat_frame: 193} }
   ,"bout it" : { center_view:[0,0,12.5], loopback_fading:true, BPM:{rewind:true, BPM: 100*1.5, beat_frame: 306} }
   ,"恋空予報モーション" : { center_view:[0,0,0], loopback_fading:true, BPM:{rewind:true, BPM: 132.02, beat_frame: 110} }
   ,"SlavetotheRhythmダンス" :  { center_view:[0,0,7.5], loopback_fading:true, range:[{time:[230,1635]}], BPM:{rewind:true, BPM: 128, beat_frame: 480} }
   ,"DoWhatUWant（ダンスモーション）" : { center_view:[0,0,30], loopback_fading:true, range:[{time:[524,2470]}], BPM:{rewind:true, BPM: 97.51, beat_frame: 650} }
   ,"nyan - modified" : { center_view:[0,0,0], range:[{time:[282,1093]}], BPM:{rewind:true, BPM: 142.01, beat_frame: 282} }
   ,"lupin" : { center_view:[0,0,25], loopback_fading:true, range:[{time:[90,0]}], BPM:{rewind:true, BPM: 136.01, beat_frame: 1697} }
   ,"galaxias_miku_v2" : { center_view:[0,0,5], loopback_fading:true, range:[{time:[450,0]}], BPM:{rewind:true, BPM: 122.99, beat_frame: 835} }
   ,"Good Feeling" : { center_view:[-10,0,7.5], loopback_fading:true, range:[{time:[672,0]}], BPM:{rewind:true, BPM: 128, beat_frame: 1159} }
   ,"1_step-motion1" : { loopback_fading:true, BPM:{rewind:true, BPM: 123, beat_frame: 38} }
   ,"ゆっきゆっきゆっきダンス・ライクーP" : { loopback_fading:true, BPM:{rewind:true, BPM: 125.98, beat_frame: 190} }

//   ,"私の時間_short_Lat式ミク - with skirt physics" : { BPM:{rewind:true, BPM: 145, beat_frame: 603} }

//   ,"Viva Happy Motion (Imai)" : { BPM:{rewind:true, BPM: 147.98, beat_frame: 657} }
//   ,"tik tok" : { center_view:[0,0,0], loopback_fading:true, BPM:{rewind:true, BPM: 120*1.03, beat_frame: 142} }
//   ,"nekomimi_lat" : { center_view:[0,0,0], loopback_fading:true, range:[{time:[30,30+(30*(60+59)+27)]}], BPM:{rewind:true, BPM: 160, beat_frame: 1124} }
//   ,"you make me happy rea - MODIFIED" : { center_view:[0,0,0], loopback_fading:true, range:[{time:[0,0]}], BPM:{rewind:true, BPM: 124.06, beat_frame: 338} }

   ,"壁穴_モデルモーション_loop" : {
  random_range_disabled:true
 ,_cover_undies: false

 ,get look_at_screen_ratio() {
var f = THREE.MMD.getModels()[0].skin.time*30
var ratio = 1
if (f<=100)
  ratio = 0
else if ((f>100) && (f<130))
  ratio = (f-100)/30
else if ((f>184) && (f<=285))
  ratio = Math.max(1-(f-184)/16, 0)
else if ((f>285) && (f<330))
  ratio = (f-285)/45
else if ((f>625) && (f<=930))
  ratio = Math.max(1-(f-625)/55, 0)
else if ((f>930) && (f<960))
  ratio = (f-930)/30
else if ((f>1020) && (f<=1085))
  ratio = Math.max(1-(f-1020)/10, 0)
else if ((f>1085) && (f<1105))
  ratio = (f-1085)/20
else if ((f>1380) && (f<=1430))
  ratio = Math.max(1-(f-1380)/10, 0)
else if ((f>1430) && (f<1450))
  ratio = (f-1430)/20
else if (f>2015)
  ratio = Math.max(1-(f-2015)/5, 0)

return ratio
  }

 ,look_at_screen_bone_list: [
{ name:"両目", weight_screen:0.3, weight_motion:1 }
//    { name:"首", weight_screen:0.5, weight_motion:1/3 }
//   ,{ name:"頭", weight_screen:0.5, weight_motion:1/3 }
  ]

 ,onended: function (loop_end) {
MMD_SA._no_fading=true;

if (!loop_end) {
  MMD_SA.WebXR._wall.visible = false
}
  }
/*
 ,onstart: function (changed) {
if (!changed) return

var model = THREE.MMD.getModels()[0].mesh
MMD_SA.WebXR._wall.position.copy(model.position)
MMD_SA.WebXR._wall.quaternion.copy(model.quaternion)
MMD_SA.WebXR._wall.visible = true
  }
*/

// update every frame
 ,process_bones: function (model) {
if (!MMD_SA_options.WebXR.AR._adult_mode) return

var xr = MMD_SA.WebXR
var zoom_scale = xr.zoom_scale

var model_mesh = model.mesh
model_mesh.position.y = -11.5 + (xr.hitMatrix_anchor._hit_wall_y_ - xr.hit_ground_y)*10*zoom_scale;

xr._wall.position.copy(model_mesh.position)
xr._wall.quaternion.copy(model_mesh.quaternion)
xr._wall.scale.set(zoom_scale,zoom_scale,zoom_scale)
xr._wall.visible = true
  }

 ,_cover_undies: false
 ,object_click_disabled: true

 ,adjustment_per_model: {
    _default_ : {
  skin_default: {
  "全ての親": { pos_add:{ x:0, y:0, z:1 } }
  }
    }
  }
    }

   ,"gal_model_motion_with_legs-2_loop_v01" : {
  look_at_screen_angle_x_limit: [Math.PI*0.25, -Math.PI*0.5]

 ,center_view: [0,0,7.5]

 ,motion_tracking_enabled: true, motion_tracking_upper_body_only: true
 ,motion_tracking: {
    look_at_screen: true,
  }

// ,loop:[1,1]
 ,onended: function (last_frame) { MMD_SA._no_fading=last_frame&&(!this.loop||this.loop_count); }

 ,_cover_undies: false
 ,object_click_disabled: true

// ,gravity: [0,-0.1,0]
// ,gravity_reset: [0,0.5,0]
 ,gravity: [0,0,0]
 ,gravity_reset: [0,-0.5,0]

 ,adjustment_per_model: {
    _default_ : {
  skin_default: {
    "全ての親": { keys:
  [
    {time:0, pos:{x:0, y:4, z:-10}}
   ,{time:390*0.5/30, pos:{x:0, y:6, z:-10}}
   ,{time:390/30, pos:{x:0, y:4, z:-10}}
  ]
    }
//  "全ての親": { pos_add:{ x:-6.56+4, y:0+0.25, z:-6.47-3 }, rot_add:{ x:0, y:-54.4+20, z:0 } } 
  }
 ,morph_default:{
  "あ":{weight_scale:2/3}
 ,"High Heels OFF": { weight:1 }
// ,"素足":{weight:1}
  }
    }
  }

// ,center_view: [5-1,-5-2-1.05,-10] ,center_view_lookAt: [0-1,0-2+0.75,0] ,SpeechBubble_pos_mod: [-11+8,2,7]

// ,center_view: [5-1,-5-2,-10] ,center_view_lookAt: [0-1,0-2,0],SpeechBubble_pos_mod: [-1,2,8]
// ,center_view: [0,0-2.5,-30] ,center_view_lookAt: [20,5,20] ,SpeechBubble_pos_mod: [-8,6,10-2]
//[0,10,30], [0,10,0]
//,center_view: [0,0,-20-2.5] ,center_view_lookAt: [20,0,10+2.5] ,SpeechBubble_pos_mod: [-17,0,-10]


// ,SpeechBubble_flipH: true
// ,SpeechBubble_pos_mod: [0-8,4,-2+12]
//,SpeechBubble_pos_mod: [0,3,8]

 ,get look_at_screen_ratio() {
if (System._browser.camera.poseNet.enabled) return 1;

var f = THREE.MMD.getModels()[0].skin.time*30
var ratio = 1
if (f >= 157) {
  if (f <= 180)
    ratio = (180-f)/23
  else if (f <= 210)
    ratio = 0
  else if (f <= 233)
    ratio = (f-210)/23
}

return ratio
  }

 ,get look_at_screen_bone_list() {
var f = THREE.MMD.getModels()[0].skin.time*30
var ratio = 1
if (f >= 157) {
  if (f <= 180)
    ratio = (180-f)/23
  else if (f <= 210)
    ratio = 0
  else if (f <= 233)
    ratio = (f-210)/23
}

return (System._browser.camera.poseNet.enabled) ? [
  { name:"首", weight_screen:0.5, weight_screen_y:0.5, weight_motion:0 },
  { name:"頭", weight_screen:0.5, weight_screen_y:0.5, weight_motion:0 },
  { name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
  { name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.5, weight_motion:1 },
] : (System._browser.camera.facemesh.enabled) ? [
  { name:"首", weight_screen:0.5*ratio, weight_motion:1*(1-ratio) }
 ,{ name:"頭", weight_screen:0.5*ratio, weight_motion:1*(1-ratio) }
] : [
  { name:"首", weight_screen:0.4*ratio, weight_motion:1*(1-ratio) }
 ,{ name:"頭", weight_screen:0.4*ratio, weight_motion:1*(1-ratio) }
 ,{ name:"両目", weight_screen:0.2*ratio, weight_motion:1*(1-ratio), weight_screen_pow:2 }
];
  }

// ,look_at_mouse_z: -1

// ,look_at_screen_bone_list: [{ name:"両目", weight_screen:0.2, weight_motion:0}]
// ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].skin.mesh.bones_by_name["頭"].quaternion.clone(); }

 ,IK_disabled: { test: function (name) { return (name.indexOf("足ＩＫ")!=-1) || (name.indexOf("つま先ＩＫ")!=-1); } }
    }

   ,"emote-mod_お辞儀1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (MMD_SA_options.Dungeon_options.item_base.baseball._started && MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para) {
  MMD_SA.SpeechBubble.message(0, "Your score is " + MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para.hit_score + "!\nCongratulations!", 3*1000)
}
else {
  MMD_SA.SpeechBubble.message(0, "Thank you. 2 meter is what we need.", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((MMD_SA_options.Dungeon_options.item_base.baseball._started) ? ((Date.now() > this._duration_end_) ? !MMD_SA_options.Dungeon_options.item_base.baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (MMD_SA_options.Dungeon_options.item_base.social_distancing._started && !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))) {
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

   ,"emote-mod_お辞儀2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (MMD_SA_options.Dungeon_options.item_base.baseball._started && MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para) {
  MMD_SA.SpeechBubble.message(0, "Your score is " + MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para.hit_score + "!\nExcellent!", 3*1000)
}
else {
  MMD_SA.SpeechBubble.message(0, "Thank you. 2 meter is the distance we need.", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((MMD_SA_options.Dungeon_options.item_base.baseball._started) ? ((Date.now() > this._duration_end_) ? !MMD_SA_options.Dungeon_options.item_base.baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (MMD_SA_options.Dungeon_options.item_base.social_distancing._started && !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))) {
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

   ,"emote-mod_肯定する1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (MMD_SA_options.Dungeon_options.item_base.baseball._started && MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para) {
  MMD_SA.SpeechBubble.message(0, "Your score is " + MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para.hit_score + "! You are great!", 3*1000)
}
else {
  MMD_SA.SpeechBubble.message(0, "You got it, 2 meter~!", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((MMD_SA_options.Dungeon_options.item_base.baseball._started) ? ((Date.now() > this._duration_end_) ? !MMD_SA_options.Dungeon_options.item_base.baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (MMD_SA_options.Dungeon_options.item_base.social_distancing._started && !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))) {
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

   ,"emote-mod_肯定する2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
if (MMD_SA_options.Dungeon_options.item_base.baseball._started && MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para) {
  MMD_SA.SpeechBubble.message(0, "Your score is " + MMD_SA_options.Dungeon_options.item_base.baseball.action._ball_para.hit_score + "! Cool!", 3*1000)
}
else {
  MMD_SA.SpeechBubble.message(0, "This is it, 2 meter~!", 3*1000)
}
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((MMD_SA_options.Dungeon_options.item_base.baseball._started) ? ((Date.now() > this._duration_end_) ? !MMD_SA_options.Dungeon_options.item_base.baseball.action._distance_check()||true : false) || (Date.now() > this._duration_end_) : (Date.now() > this._duration_end_) || (MMD_SA_options.Dungeon_options.item_base.social_distancing._started && !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(2,4))) {
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

   ,"emote-mod_照れる1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
MMD_SA.SpeechBubble.message(0, "Hey... too close...", 3*1000)
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(0.75,2))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((Date.now() > this._duration_end_) || !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(0.75,2)) {
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

   ,"emote-mod_照れる2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
MMD_SA.SpeechBubble.message(0, "Isn't it too close...", 3*1000)
  }

/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(0.75,2))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((Date.now() > this._duration_end_) || !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(0.75,2)) {
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

   ,"surrender_v03": {
  onstart: function () {
MMD_SA.SpeechBubble.message(0, "I surrender! Please, stay back! >_<", 3*1000)
  } 
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
MMD_SA._freeze_onended=MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(0,1.5)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
//DEBUG_show(model.skin.time+'\n'+mm._timeMax)
if (model.skin.time > mm._timeMax) {
//MMD_SA._custom_skin = [{ key:{ name:"全ての親", pos:[Math.random(),Math.random(),Math.random()] ,rot:[0,0,0,1] ,interp:MMD_SA._skin_interp_default }, idx:model.mesh.bones_by_name["全ての親"]._index }]
  if (!MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(0,1.5)) {
    MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
    MMD_SA._force_motion_shuffle = true;
  }
  else if ((parseInt(model.skin.time) % 10 == 0) && !MMD_SA.SpeechBubble.visible) {
    MMD_SA.SpeechBubble.message(0, "I surrender! Please, stay back! >_<", 3*1000)
  }
}
  }

 ,auto_blink: false
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"surrender-R_v03": {
  onstart: function () {} 
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(999,999)
  }
 ,auto_blink: false
 ,adjust_center_view_disabled: true
 ,get look_at_screen_parent_rotation() { return THREE.MMD.getModels()[0].mesh.quaternion; }
,look_at_screen_bone_list: [
  { name:"首", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"頭", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.25, weight_motion:1 }
 ,{ name:"上半身",  weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
 ,{ name:"上半身2", weight_screen:0.5, weight_screen_x:0,weight_screen_y:0.75, weight_motion:1 }
]
    }

   ,"emote-mod_歓迎する1": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
MMD_SA.SpeechBubble.message(0, "Hey! Come closer~!", 3*1000)
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(4,6))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((Date.now() > this._duration_end_) || !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(4,6)) {
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

   ,"emote-mod_歓迎する2": {
  onstart: function () {
this._duration_end_ = Date.now() + (MMD_SA.MMD.motionManager._timeMax + Math.random()*3+0.5)*1000
MMD_SA.SpeechBubble.message(0, "Come on! I won't bite~!", 3*1000)
  }
/*
 ,onended: function (loop_end) {
MMD_SA._no_fading=true; MMD_SA._ignore_physics_reset=true;
if (MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(4,6))
  MMD_SA._freeze_onended=(Date.now()<this._duration_end_)
  }
*/

 ,freeze_onended: true
 ,onplaying: function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > mm._timeMax) {
  if ((Date.now() > this._duration_end_) || !MMD_SA_options.Dungeon_options.item_base.social_distancing.action._social_distance_check(4,6)) {
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


  });
})();
