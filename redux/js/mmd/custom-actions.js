// custom-actions.js — extracted from MMD_SA.js
// Bone matching, frame copying, parent bone list, and default custom actions
// (motion_blending_model0, kissing, cover_undies)

window.MMD_SA_createCustomActions = function () {
return {

 match_bone: function (name, match) {
if (!match || match.all_bones || (match.bone_name && (match.bone_name.indexOf(name) != -1)) || (match.bone_group && MMD_SA.model.bone_table_by_name[name] && (match.bone_group.indexOf(MMD_SA.model.bone_table_by_name[name].group_name) != -1) && (!match.bone_name_RE || match.bone_name_RE.test(name))))
  return true
return false
  }

 ,copy_first_bone_frame: function (index, bones, match) {
var mm = MMD_SA.motion[index]
if (!match)
  match = MMD_SA_options.motion[index].match

for (var name in bones) {
  if (!MMD_SA.match_bone(name, match) || !bones[name])
    continue
  var bm = mm.modelMotions[0].boneMotions[name]
  if (!bm)
    continue

  bm[0].location = bones[name].location
  bm[0].rotation = bones[name].rotation
}
  }

 ,get_parent_bone_list: function (model, bone_name) {
var bt = model.bone_table_by_name[bone_name]
if (!bt)
  return []

var bone_index = bt.index
var bones = model.bones
var bone = bones[bone_index]
if (bone.parent_bone_name_list)
  return bone.parent_bone_name_list

var list = []
var table = model.bone_table
var p_index = bone.parent_bone_index
while (table[p_index] && (p_index != bone_index)) {
  list.push(bones[p_index].name)
  p_index = bones[p_index].parent_bone_index
}

bone.parent_bone_name_list = list
return list
  }

 ,custom_action_default: {
    "motion_blending_model0": {
      action: {
        condition: function (is_bone_action, objs) {
if (objs._model_index) return false

if (objs != MMD_SA.Animation_dummy) {
  let mm = MMD_SA.motion[objs._motion_index]

  let duration = this.blending_options.duration || 5/30
  let blending_ratio = 1 - ((RAF_timestamp - this._time_ini)/1000 / duration)
  if (blending_ratio <= 0) {
    let model = THREE.MMD.getModels()[0]
    model.skin_MMD_SA_extra[0] = model.morph_MMD_SA_extra[0] = MMD_SA.Animation_dummy
    return false
  }
  objs._blending_ratio_ = blending_ratio
//DEBUG_show(mm.filename + '/'+this._delta0_from_last_loop+'/'+blending_ratio);return false;
  if (this._seek_time_ != null) {
    objs._seek_time_ = this._seek_time_
    this._seek_time_ = null
  }

  return true
}

return false
        }

       ,onFinish: function (model_index) {
        }
      }

     ,motion: {}
    }

   ,"kissing": {
      action: {
        condition: (function () {
  var motion_name;

  return function (is_bone_action, objs) {
var is_kissing
var busy = MMD_SA.use_jThree && (((MMD_SA_options.allows_kissing) ? MMD_SA.MMD.motionManager.para_SA.allows_kissing===false : !MMD_SA.MMD.motionManager.para_SA.allows_kissing) || (MMD_SA_options.Dungeon && MMD_SA_options.Dungeon?.event_mode) || System._browser.camera.facemesh.enabled || MMD_SA.music_mode || MMD_SA._busy_mode1_ || MMD_SA._horse_machine_mode_)

if (MMD_SA.use_jThree && this._kissing && motion_name && (motion_name != MMD_SA.MMD.motionManager.filename))
  this.onFinish()
motion_name = MMD_SA.MMD.motionManager.filename

const scale = MMD_SA.camera_auto_adjust_scale;
if (MMD_SA.use_jThree && !busy && (MMD_SA.camera_position.y > MMD_SA._head_pos.y - 2*scale) && (Math.abs(MMD_SA.camera_position.x - MMD_SA._head_pos.x) < 10*scale) && (MMD_SA._head_pos.distanceTo(MMD_SA.camera_position) < 10*scale)) {
  is_kissing = true
}
else {
  is_kissing = self.HeadTrackerAR && HeadTrackerAR.running && (HeadTrackerAR._cz > 1+0.333*0.25);
}

if (MMD_SA.use_jThree) {
  var _vmd = MMD_SA.vmd_by_filename[MMD_SA.MMD.motionManager.filename]
  if (_vmd && _vmd.use_armIK)
    is_kissing = false
}

if (is_kissing) {
  if (!this._kissing) {
    this.frame = 0
  }
  if (is_bone_action && !this.frame)
    MMD_SA.copy_first_bone_frame(this.motion_index, objs, {bone_group:["腕"], skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369)/})
  this._kissing = MMD_SA.meter_motion_disabled = true
}

if (is_bone_action && this._kissing) {
  if (self.HeadTrackerAR)
    HeadTrackerAR._cz_mod = 2/HeadTrackerAR._cz

  var m = MMD_SA.motion[this.motion_index||1]
  var mod
  if (this.frame > m.lastFrame-15)
    mod = m.lastFrame - this.frame
  else if (this.frame < 15)
    mod = this.frame
  else
    mod = 15
  mod = mod*2 / 180 * Math.PI

  if (MMD_SA.use_jThree) {
    var bones = objs.mesh.bones_by_name
    var head = bones["頭"]
    var neck = bones["首"]

    var head_ry = (head) ? MMD_SA._v3a.setEulerFromQuaternion(head.quaternion).y : 0
    var neck_ry = (neck) ? MMD_SA._v3a.setEulerFromQuaternion(neck.quaternion).y : 0
//DEBUG_show(bones["上半身"])
//    MMD_SA.process_bone(bones["上半身"], [mod, head_ry+neck_ry, 0])
    MMD_SA.process_bone(head, [-mod/2, 0, 0], (head_ry)?[1,0,1]:null)
    MMD_SA.process_bone(neck, [-mod/2, 0, 0], (neck_ry)?[1,0,1]:null)

    if (this.frame >= 44) {
      var ratio = (this.frame - 44) / ((m.lastFrame-15) - 44)
      if (ratio > 1)
        ratio = 1

      var kiss = MMD_SA_options.mesh_obj_by_id["KissMESH"]
      var head_pos = MMD_SA._v3a.copy(MMD_SA._head_pos)
//      head_pos.y += 1
      kiss._obj.position.copy(head_pos.add(MMD_SA._v3b.copy(MMD_SA.camera_position).sub(head_pos).multiplyScalar(0.2 + ratio*0.6)))
      kiss._obj.scale.x = kiss._obj.scale.y = kiss._obj.scale.z = 0.5 + ratio * 0.5
      kiss.show()
    }

//    if (MMD_SA_options.use_speech_bubble && (this.frame == 0)) MMD_SA.SpeechBubble.message(0, ["Here is your X'mas kiss~\n\u2661"].shuffle()[0], 5000, { pos_mod:[-3,-5,0] });
//"主人，錫錫～\u2661", "飛吻啊，主人～\u2661"
  }
}

return this._kissing
  };
        })()

       ,look_at_mouse_disabled: true

       ,_HeadTrackerAR_timerID: null
       ,onFinish: function () {
var that = this
if (this._HeadTrackerAR_timerID)
  clearTimeout(this._HeadTrackerAR_timerID)
this._HeadTrackerAR_timerID = setTimeout(function () { if (!that.kissing && self.HeadTrackerAR) HeadTrackerAR._cz_mod=1; }, 100)

if (MMD_SA.use_jThree)
  MMD_SA_options.mesh_obj_by_id["KissMESH"].hide()

this._kissing = MMD_SA.meter_motion_disabled = false
        }
//       ,motion_index: 1
      }

     ,motion: {path:'MMD.js/motion/motion_basic_pack01.zip#/_kiss2_blush_v02.vmd', match:{all_morphs:true, skin_jThree:true, morph_jThree:true}}
    }

   ,"cover_undies": {
      action: {
        condition: function (is_bone_action, objs) {
if (objs._model_index) return false

var busy = MMD_SA._busy_mode1_ || !MMD_SA_options.look_at_screen || System._browser.camera.ML_enabled;
if (MMD_SA._hit_hip_ || ((MMD_SA_options.model_para_obj._cover_undies != false) && (MMD_SA.MMD.motionManager.para_SA._cover_undies != false) && !busy && !MMD_SA.custom_action_default.kissing.action._kissing && this._condition(is_bone_action, objs, (((MMD_SA._rx*180/Math.PI) % 360 > 45 * ((MMD_SA.use_jThree) ? 0.75 : 1)) )/* && !Audio_BPM.vo.motion_by_song_name_mode*/) )) {
  this._undies_visible = true

  if (!this._adjust(is_bone_action, objs)) {
    if (is_bone_action && MMD_SA.use_jThree) {
      MMD_SA._update_with_look_at_screen_ = { bone_list:[{name:["左肩","右肩"],ratio:1}], parent_list:["上半身2", "上半身"] }
//bone_list:[{name:["左肩","右肩"],ratio:0.2}, {name:["左腕","右腕"],ratio:0.2}, {name:["左ひじ","右ひじ"],ratio:1}, {name:["左手首"],ratio:-0.5}, {name:["右手首"],ratio:0.5}]
    }
  }

  if (!this._cover_undies) {
    this.frame = 0
    if (MMD_SA_options.use_speech_bubble)
      this._onmessage()
  }
  if (is_bone_action && !this.frame) {
    MMD_SA.copy_first_bone_frame(this.motion_index, objs, {bone_group:["腕"], skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369)/})
  }

  this._cover_undies = true
}
else
  this._undies_visible = false
//DEBUG_show(this.frame); 
return this._cover_undies
        }

       ,_condition: function (is_bone_action, objs, _default) {
return _default;
        }

       ,_adjust: (function () {
var skin;
var key_by_motion_name = { _default_:{} };
var key_name = "_default_";
var bone_list = ["左肩","左腕","左ひじ","左手捩","左手首", "右肩","右腕","右ひじ","右手捩","右手首"];

function assign_motion(name) {
  if (key_name == name) return;
  key_name = name

  var key = key_by_motion_name[name]
  skin.forEach(function (s) {
    var kb = key[s.keys[0].name]
    if (kb)
      s.keys.forEach(k => {k.rot=kb.rot});
  });
}

return function (is_bone_action, objs) {
  if (!is_bone_action)
    return false

  var mm = MMD_SA.MMD.motionManager
  if (key_by_motion_name[mm.filename]) {
    assign_motion(mm.filename)
    return true
  }

  var model_para_obj = MMD_SA_options.model_para_obj
  var motion_para = mm.para_SA
  var motion_sd = motion_para && motion_para.adjustment_per_model && (motion_para.adjustment_per_model[model_para_obj._filename] || motion_para.adjustment_per_model[model_para_obj._filename_cleaned] || motion_para.adjustment_per_model._default_);
  motion_sd = motion_sd && motion_sd.skin_default && motion_sd.skin_default["cover_undies"];

  if (!motion_sd) {
    assign_motion("_default_")
    return false
  }

  if (!skin) {
    let cache = THREE.MMD.getModels()[0]._MMD_SA_cache
    skin = cache[Object.keys(cache).find(e => /_cover_undies_blush/.test(e))]
    if (!skin)
      return false

    skin = skin.skin.targets.filter(s => s.keys.length && (bone_list.indexOf(s.keys[0].name) != -1));
    skin.forEach(function (s) {
      key_by_motion_name._default_[s.keys[0].name] = { rot:s.keys[0].rot } 
    });
  }

  var key = key_by_motion_name[mm.filename] = {}

  skin.forEach(function (s) {
    var name = s.keys[0].name;
    var kb = motion_sd[name];
    key[name] = { rot:(kb) ? MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.fromArray([-kb.rot.x, kb.rot.y, -kb.rot.z].map((n,i) => n*Math.PI/180)), 'YXZ').toArray() : [0,0,0,1] };
  });

  assign_motion(mm.filename)
  return true
};
      })()

       ,_onmessage: function () {
if (MMD_SA_options.Dungeon && MMD_SA_options.Dungeon_options.use_PC_click_reaction_default) return
MMD_SA.SpeechBubble.message(((MMD_SA.music_mode)?2:0), ["Hey...\n>_<", "Where are you looking at...\n>_<"].shuffle()[0])
        }

       ,onFinish: function () {
if (MMD_SA._hit_body_defined_ && !MMD_SA._hit_body_but_hip_)
  MMD_SA_options.Dungeon._states.object_click_disabled = false

if (this._undies_visible) {
  this.frame=15
} else {
  this._cover_undies=false
}
        }
//       ,motion_index: 2
      }

     ,motion: {path:'MMD.js/motion/motion_basic_pack01.zip#/_cover_undies_blush.vmd', match:{bone_group:["腕","指"], all_morphs:true, skin_jThree:/^(\u5DE6|\u53F3)(\u80A9|\u8155|\u3072\u3058|\u624B\u9996|\u624B\u6369|.\u6307.)/, morph_jThree:true}}

     ,animation_check: function (idx) {
if (!MMD_SA.use_jThree)
  return true

var _vmd = MMD_SA.vmd_by_filename[MMD_SA.MMD.motionManager.filename];
if (this._is_skin) {
  return _vmd && !_vmd.use_armIK && !MMD_SA._horse_machine_mode_;
}
/*
var keys = this.targets[idx].keys
var name = keys[0].name
var model_para_obj = MMD_SA_options.model_para_obj_all[this._model_index]
var md = model_para_obj.morph_default && model_para_obj.morph_default[name]
if (md && (!md.weight_scale || md.weight)) {
  keys[0].weight = keys[1].weight = (!md.motion_filter || md.motion_filter.test(decodeURIComponent(_vmd.url))) ? ((md.weight!=null)?md.weight:1) : 0
}
*/
return true
      }
    }
  }

};
};
