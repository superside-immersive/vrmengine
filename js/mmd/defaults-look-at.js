// Look-at-screen/mouse system: bone lists, property definitions
// Extracted from defaults.js — called by MMD_SA_initDefaults()

window.MMD_SA_initDefaults_lookAt = function () {
  if (MMD_SA_options.look_at_screen_bone_list) {
    MMD_SA_options._look_at_screen_bone_list = [MMD_SA_options.look_at_screen_bone_list, MMD_SA_options.look_at_screen_bone_list]
  }
  else {
    MMD_SA_options._look_at_screen_bone_list = [
  [
  { name:"首", weight_screen:0.5, weight_motion:0.5 }
 ,{ name:"頭", weight_screen:0.5, weight_motion:0.5 }
  ]

 ,[
  { name:"首", weight_screen:0.25, weight_motion:0.5 }
 ,{ name:"頭", weight_screen:0.25, weight_motion:0.5 }
 ,{ name:"両目", weight_screen:0.15, weight_motion:0.5 }
  ]
    ]
// ,{ name:"両目", weight_screen:0.15, weight_motion:1 }

//    MMD_SA_options._look_at_screen_bone_list = [
//  { name:"上半身2", weight_screen:0.5, weight_motion:0.5 }
// ,{ name:"上半身",  weight_screen:0.5, weight_motion:0.5 }
//    ]

  }

  MMD_SA_options.look_at_screen_bone_list_by_model = function (model) {
const mm = (model && (model._model_index > 0)) ? MMD_SA.motion[model.skin._motion_index] : MMD_SA.MMD.motionManager;
const para_SA = mm.para_SA;

// cache the return value for better performance in case of getter functions
let v

const range = (para_SA.range && para_SA.range[mm.range_index])
if (range)
  v = range.look_at_screen_bone_list
if (v == null) {
  v = para_SA.look_at_screen_bone_list
  if (v == null)
    v = this._look_at_screen_bone_list
}

if (v[0] instanceof Array) {
  v = v[(MMD_SA_options.look_at_mouse)?1:0]
}

return v;
  };

// somewhat obsolete
  Object.defineProperty(MMD_SA_options, "look_at_screen_bone_list",
{
  get: function () {
return this.look_at_screen_bone_list_by_model();
  }

 ,set: function (list) {
this._look_at_screen_bone_list = list;
  }
});

  if (MMD_SA_options.look_at_screen_parent_rotation)
    MMD_SA_options._look_at_screen_parent_rotation = MMD_SA_options.look_at_screen_parent_rotation

  MMD_SA_options.look_at_screen_parent_rotation_by_model = function (model) {
const mm = (model && (model._model_index > 0)) ? MMD_SA.motion[model.skin._motion_index] : MMD_SA.MMD.motionManager;
const para_SA = mm.para_SA;

// cache the return value for better performance in case of getter functions
let v

const range = (para_SA.range && para_SA.range[mm.range_index])
if (range)
  v = range.look_at_screen_parent_rotation
if (v == null) {
  v = para_SA.look_at_screen_parent_rotation
  if (v == null)
    v = this._look_at_screen_parent_rotation
}

// clone it to avoid unexpected modification
return v && v.clone();
  };

// somewhat obsolete
  Object.defineProperty(MMD_SA_options, "look_at_screen_parent_rotation",
{
  get: function () {
return this.look_at_screen_parent_rotation_by_model();
  }

 ,set: function (v) {
this._look_at_screen_parent_rotation = v;
  }
});

  if (MMD_SA_options.look_at_screen == null)
    MMD_SA_options.look_at_screen = returnBoolean("MMDLookAtCamera")

  if (MMD_SA_options.look_at_mouse == null)
    MMD_SA_options.look_at_mouse = returnBoolean("MMDLookAtMouse")
  if (MMD_SA_options.WebXR || is_mobile || (!webkit_electron_mode && !WallpaperEngine_CEF_mode))
    MMD_SA_options.look_at_mouse = false

  MMD_SA_options._look_at_screen = MMD_SA_options.look_at_screen;
  MMD_SA_options.look_at_screen_by_model = function (model) {
if (System._browser.camera.VMC_receiver.pose_full_body) return false;

const music_mode = MMD_SA.music_mode && (this.look_at_screen_music_mode != true)

const mm = (model && (model._model_index > 0)) ? MMD_SA.motion[model.skin._motion_index] : MMD_SA.MMD.motionManager
const para_SA = mm.para_SA

// cache the return value for better performance in case of getter functions
let v

const range = (para_SA.range && para_SA.range[mm.range_index])
if (range)
  v = range.look_at_screen
if (v == null) {
  v = para_SA.look_at_screen
  if (v == null) {
    if (music_mode)
      return false
    v = (model && (model._model_index > 0)) || this._look_at_screen
  }
}

return v && (this.look_at_screen_ratio_by_model(model) != 0);
  };
  Object.defineProperty(MMD_SA_options, "look_at_screen",
{
  get: MMD_SA_options.look_at_screen_by_model

 ,set: function (v) {
this._look_at_screen = v
  }
});

  MMD_SA_options._look_at_mouse = MMD_SA_options.look_at_mouse;
  Object.defineProperty(MMD_SA_options, "look_at_mouse",
{
  get: function () {
const music_mode = MMD_SA.music_mode && (this.look_at_screen_music_mode != true)

const mm = MMD_SA.MMD.motionManager
const para_SA = mm.para_SA

if (!this.look_at_screen)
  return false

// cache the return value for better performance in case of getter functions
let v

const range = (para_SA.range && para_SA.range[mm.range_index])
if (range)
  v = range.look_at_mouse
if (v == null) {
  v = para_SA.look_at_mouse
  if (v == null) {
    if (music_mode)
      return false
    v = this._look_at_mouse
  }
}

return v;
  }

 ,set: function (v) {
this._look_at_mouse = v
  }
});

  if (MMD_SA_options.look_at_screen_ratio == null)
    MMD_SA_options.look_at_screen_ratio = 1

  MMD_SA_options._look_at_screen_ratio = MMD_SA_options.look_at_screen_ratio;

  MMD_SA_options.look_at_screen_ratio_by_model = function (model) {
const mm = (model && (model._model_index > 0)) ? MMD_SA.motion[model.skin._motion_index] : MMD_SA.MMD.motionManager;
const para_SA = mm.para_SA;

if ((System._browser.camera.ML_enabled || System._browser.camera.VMC_receiver.mocap_enabled) && ((MMD_SA_options.user_camera.ML_models.look_at_screen === false) || (!para_SA.motion_tracking?.look_at_screen && !MMD_SA.WebXR.session))) return 0;

// cache the return value for better performance in case of getter functions
let v

const range = (para_SA.range && para_SA.range[mm.range_index])
if (range)
  v = range.look_at_screen_ratio
if (v == null) {
  v = para_SA.look_at_screen_ratio
  if (v == null)
    v = this._look_at_screen_ratio
}

return v;
  };

// somewhat obsolete
  Object.defineProperty(MMD_SA_options, "look_at_screen_ratio",
{
  get: function () {
return this.look_at_screen_ratio_by_model();
  }

 ,set: function (v) {
this._look_at_screen_ratio = v
  }
});
};
