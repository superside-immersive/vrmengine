// Extracted from dungeon.js — Sound defaults, PC click reactions, combat sounds
// Called from Dungeon.init() as this._initSoundsAndClickReaction()

(function () {
var Dungeon = MMD_SA_options.Dungeon;

Dungeon._initSoundsAndClickReaction = function () {
var options = MMD_SA_options.Dungeon_options;

if (!options.sound)
  options.sound = []

if (!options.sound.some(function(s){return(s.name=="interface_item_access")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/interface/interface1.aac"
   ,name: "interface_item_access"
   ,channel: "SFX"
  });
}
if (!options.sound.some(function(s){return(s.name=="interface_item_deny")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/interface/interface6.aac"
   ,name: "interface_item_deny"
   ,channel: "SFX"
  });
}
if (!options.sound.some(function(s){return(s.name=="interface_item_drop")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/interface/interface3.aac"
   ,name: "interface_item_drop"
   ,channel: "SFX"
  });
}

if (!options.sound.some(function(s){return(s.name=="footstep_default")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/251788__vkproduktion__footstep-01-mono.aac"
   ,name: "footstep_default"
   ,channel: "SFX"
   ,can_spawn: true
  });
}
if (!options.sound.some(function(s){return(s.name=="footstep_water")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/270429__littlerobotsoundfactory__footstep-water-03.aac"
   ,name: "footstep_water"
   ,channel: "SFX"
   ,can_spawn: true
  });
}
if (!options.sound.some(function(s){return(s.name=="footstep_grass")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/456273__soundfx-studio__footsteps-grass.aac"
   ,name: "footstep_grass"
   ,channel: "SFX"
   ,can_spawn: true
  });
}
if (!options.sound.some(function(s){return(s.name=="footstep_sand")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/456273__soundfx-studio__footsteps-sand.aac"
   ,name: "footstep_sand"
   ,channel: "SFX"
   ,can_spawn: true
  });
}
if (!options.sound.some(function(s){return(s.name=="car_engine01")})) {
  options.sound.push({
    url: System.Gadget.path + "/sound/SFX_pack01.zip#/car_engine_loop_5x5.aac"
   ,name: "car_engine01"
   ,channel: "SFX"
   ,can_spawn: true
   ,loop: true
  });
}


// PC click reaction default START
if (options.use_PC_click_reaction_default) {

  if (!options.sound.some(function(s){return(s.name=="hit-1")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/162370__lewisisminted__punch-1.aac"
     ,name: "hit-1"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
  if (!options.sound.some(function(s){return(s.name=="hit-3")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/104183__ekokubza123__punch.aac"
     ,name: "hit-3"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
  if (!options.sound.some(function(s){return(s.name=="anime_wow")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/Anime_Wow_Sound.oga"
     ,name: "anime_wow"
     ,channel: "SFX"
//     ,can_spawn: true
    });
  }

MMD_SA_options.custom_default = function () {
  var custom_action_new = []
  if (!MMD_SA_options.custom_action || (MMD_SA_options.custom_action.indexOf("cover_undies") == -1)) custom_action_new.push("cover_undies")

  var _hit_head = {
    action: {
      condition: function (is_bone_action, objs) {
if (objs._model_index) return false

return MMD_SA._hit_head_;
      }

     ,onFinish: function () {
MMD_SA._hit_head_=false;
MMD_SA_options.Dungeon._states.object_click_disabled = false
      }

     ,get look_at_screen_ratio() {
return ((this.frame >= 27) ? 0 : (27 - this.frame)/27)
      }
    }

   ,motion: {path:'MMD.js/motion/motion_rpg_pack01.zip#/hit/h01_何かにぶつかる小.vmd', match:{skin_jThree:{ test: function(name) { return !((name=='センター') || (name=='上半身') || (name=='下半身') || (name.indexOf("ＩＫ") != -1) || (/^(\u5DE6|\u53F3)(\u8DB3|\u3072\u3056)/.test(name))); } }, morph_jThree:{test:function(name){ return (name!="瞳小") }} }}

   ,animation_check: MMD_SA.custom_action_default["cover_undies"].animation_check
  }
  custom_action_new.push(_hit_head)

  var _cover_chest = {
    action: {
      condition: function (is_bone_action, objs) {
if (objs._model_index) return false

if (MMD_SA._hit_chest_ || this._cover_chest_) {
  if (is_bone_action && !this.frame) {
    MMD_SA.copy_first_bone_frame(this.motion_index, objs, {bone_group:["腕"], skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369)/})
  }
  this._cover_chest_ = true
}

return this._cover_chest_;
      }

     ,onFinish: function () {
if (!MMD_SA._hit_body_but_chest_)
  MMD_SA_options.Dungeon._states.object_click_disabled = false

if (MMD_SA._hit_chest_) {
  this.frame=10
} else {
  this._cover_chest_=false
}
     }
   }

   ,motion: {path:'MMD.js/motion/motion_basic_pack01.zip#/cover_chest_v02b.vmd', match:{bone_group:["腕","指"], all_morphs:true, skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369|.\u6307.)/, morph_jThree:true}}

   ,animation_check: MMD_SA.custom_action_default["cover_undies"].animation_check
  }
  custom_action_new.push(_cover_chest)

  MMD_SA_options.custom_action = (MMD_SA_options.custom_action) ? custom_action_new.concat(MMD_SA_options.custom_action) : custom_action_new

  MMD_SA._hit_body_defined_ = true
  Object.defineProperty(MMD_SA, "_hit_body_", {
  get: function ()  { return (MMD_SA._hit_head_ || MMD_SA._hit_chest_ || MMD_SA._hit_hip_ || MMD_SA._hit_legs_) }
 ,set: function (v) { MMD_SA._hit_head_ = MMD_SA._hit_chest_ = MMD_SA._hit_hip_ = MMD_SA._hit_hip_ = v }
  });
  Object.defineProperty(MMD_SA, "_hit_body_but_chest_", {
  get: function ()  { return (MMD_SA._hit_head_ || MMD_SA._hit_hip_ || MMD_SA._hit_legs_) }
  });
  Object.defineProperty(MMD_SA, "_hit_body_but_hip_", {
  get: function ()  { return (MMD_SA._hit_head_ || MMD_SA._hit_chest_ || MMD_SA._hit_legs_) }
  });


  var _key_pressed_when_character_clicked = {}
  document.addEventListener('keydown', function (e) {
if (!_key_pressed_when_character_clicked[e.keyCode]) {
  MMD_SA._hit_chest_ = false
  MMD_SA._hit_hip_   = false
}
  });

  var _cursor_timerID
  window.addEventListener('SA_Dungeon_character_clicked', function (e) {
if (MMD_SA.music_mode || System._browser.camera.ML_enabled) return false;

var d = MMD_SA_options.Dungeon
var intersected = e.detail.intersected.sub(d.character.pos)

//DEBUG_show(intersected.sub(d.character.pos).toArray()+'/'+Date.now())
MMD_SA._hit_body_ = false

var pressed, moving
_key_pressed_when_character_clicked = {}
for (var i = 0, i_max = d.key_map_list.length; i < i_max; i++) {
  var k = d.key_map_list[i]
  var key_map = d.key_map[k.keyCode]
  var id = k.id
  if (key_map.down && !/^(up|left|down|right)$/.test(id))
    return

  if (key_map.down) {
    pressed = true
    _key_pressed_when_character_clicked[k.keyCode] = true
    if (/^(up|down)$/.test(id))
      moving = true
  }
}

var mesh = THREE.MMD.getModels()[0].mesh
var bb_max_y = mesh.geometry.boundingBox.max.y

if (intersected.y > bb_max_y*0.8) {
  MMD_SA._hit_head_ = true
  d.sound.audio_object_by_name["hit-3"].play(mesh)
}
else if (intersected.y > bb_max_y*0.6) {
  MMD_SA._hit_chest_ = true
  d.sound.audio_object_by_name["anime_wow"].play(mesh)
}
else if (intersected.y > bb_max_y*0.4){
  MMD_SA._hit_hip_ = true
  d.sound.audio_object_by_name["anime_wow"].play(mesh)
//  MMD_SA._gravity_ = [0,1,0]
//  MMD_SA._gravity_factor = 1
}
else if (intersected.y < bb_max_y*0.2) {
  if (!pressed) {
    MMD_SA._hit_legs_ = true
    d.character_movement_disabled = true
    // use ._motion_shuffle_list instead, because we have multiple motions running in order, but .motion_shuffle_list_default can be shuffled.
    MMD_SA_options._motion_shuffle_list = [MMD_SA_options.motion_index_by_name["w01_すべって尻もち"], MMD_SA_options.motion_index_by_name["女の子座り→立ち上がる_gumi_v01"]]
    MMD_SA_options.motion_shuffle_list_default = null
    MMD_SA._force_motion_shuffle = true
  }
  else if (moving) {
    MMD_SA._hit_legs_ = true
    d.character_movement_disabled = true
    // use ._motion_shuffle_list instead, because we have multiple motions running in order, but .motion_shuffle_list_default can be shuffled.
    MMD_SA_options._motion_shuffle_list = [MMD_SA_options.motion_index_by_name["r01_普通に転ぶ"], MMD_SA_options.motion_index_by_name["OTL→立ち上がり"]]
    MMD_SA_options.motion_shuffle_list_default = null
    MMD_SA._force_motion_shuffle = true
  }
  else {
    return
  }
  d.sound.audio_object_by_name["hit-3"].play(mesh)
}
else
  return

d._states.object_click_disabled = true

if (_cursor_timerID)
  clearTimeout(_cursor_timerID)
e.detail.target.style.cursor = ((webkit_mode)?"-webkit-":"")+"grab"
_cursor_timerID = setTimeout(function () {
  e.detail.target.style.cursor = ((webkit_mode)?"-webkit-":"")+"grabbing"
  _cursor_timerID = setTimeout(function () {
    _cursor_timerID = null
    e.detail.target.style.cursor = "auto"
  }, 1000);
}, 200);
  });

//if (EV_sync_update.fps_last) DEBUG_show('FPS:' + EV_sync_update.fps_last);
}

}
// PC click reaction default END


if (options.combat_mode_enabled) {
  if (options.simple_combat_input_mode_enabled == null)
    options.simple_combat_input_mode_enabled = is_mobile

  if (!options.sound.some(function(s){return(s.name=="hit-1")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/162370__lewisisminted__punch-1.aac"
     ,name: "hit-1"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
  if (!options.sound.some(function(s){return(s.name=="hit-2")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/216198__rsilveira-88__cartoon-punch-02.aac"
     ,name: "hit-2"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
  if (!options.sound.some(function(s){return(s.name=="hit-3")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/104183__ekokubza123__punch.aac"
     ,name: "hit-3"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
  if (!options.sound.some(function(s){return(s.name=="swing")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/battle/swing.aac"
     ,name: "swing"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
  if (!options.sound.some(function(s){return(s.name=="hit_slash")})) {
    options.sound.push({
      url: System.Gadget.path + "/sound/SFX_pack01.zip#/35213__abyssmal__slashkut.aac"
     ,name: "hit_slash"
     ,channel: "SFX"
     ,can_spawn: true
    });
  }
}
};

})();
