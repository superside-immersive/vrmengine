// sfx_check.js — extracted from dungeon.js (Step 6B)
// Sound effects check for dungeon animations

MMD_SA_options.Dungeon.SFX_check = (function () {
    var footstep_sound_default = { name:"footstep_default" };

    return function (model, para_SA, animation, dt) {
if (!para_SA.SFX)
  return

var that = this

var frame0 = animation.time
var frame1 = frame0 + dt
frame0 *= 30
frame1 *= 30

para_SA.SFX.some(function (obj) {
//DEBUG_show([frame0, frame1, Date.now()].join("\n"))
  if (!((obj.frame > frame0) && (obj.frame <= frame1)))
    return false

  if (obj.condition && !obj.condition(model, para_SA, animation, dt))
    return false

  var model_para = MMD_SA_options.model_para_obj_all[model._model_index]

  var sound = obj.sound
  if (sound) {
    let name = sound.name
    if (!name) {
      let x = ~~(model.mesh.position.x / that.grid_size)
      let y = ~~(model.mesh.position.z / that.grid_size)
      let footstep_sound = that.get_para(x,y,true).footstep_sound || model_para.footstep_sound || footstep_sound_default
      name = footstep_sound && footstep_sound.name
    }
    if (name)
      that.sound.audio_object_by_name[name].play(model.mesh, true)
  }

  return true
});
    };
})();
