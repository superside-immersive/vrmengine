// Defaults — extracted from MMD_SA.js
// Original: standalone IIFE at end of MMD_SA.js

window.MMD_SA_initDefaults = function () {
// defaults START
  use_full_fps_registered = true

  if (browser_native_mode && !webkit_window)
    SA_fullscreen_stretch_to_cover = true

  if (!MMD_SA_options)
    MMD_SA_options = {}

  MMD_SA_options.custom_default && MMD_SA_options.custom_default()
  window.dispatchEvent(new CustomEvent("SA_MMD_init"))


// THREEX_options START

if (!MMD_SA_options.MMD_disabled && (MMD_SA_options.use_THREEX !== false)) MMD_SA_options.use_THREEX = true;

if (!MMD_SA_options.THREEX_options)
  MMD_SA_options.THREEX_options = {};

MMD_SA_options.THREEX_options.model_path_default = MMD_SA_options.THREEX_options.model_path || '';

if (!MMD_SA_options.THREEX_options.model_para)
  MMD_SA_options.THREEX_options.model_para = {};

// THREEX_options END


// save some headaches
  if (is_mobile && !is_SA_child_animation) {
    SA_fullscreen_stretch_to_cover = true
    Settings.CSSTransformFullscreen = true
  }
//  if (is_mobile) MMD_SA_options.texture_resolution_limit = MMD_SA_options.texture_resolution_limit_mobile || 1024;
MMD_SA_options.texture_resolution_limit=2048


// model selection START
  if (!MMD_SA_options.model_path)
    MMD_SA_options.model_path = System.Gadget.path + "\\jThree\\model\\alicia.min.zip#/Alicia_solid_v02.pmx"
  MMD_SA.use_jThree = true;// /\.pmx$/i.test(MMD_SA_options.model_path);


// use absolute path
  if (!/^((file|https?|\w)\:|\/)/i.test(MMD_SA_options.model_path))
    MMD_SA_options.model_path = System.Gadget.path + "/" + MMD_SA_options.model_path
  MMD_SA_options.model_path_default = MMD_SA_options.model_path = toLocalPath(MMD_SA_options.model_path)

//  if (!MMD_SA_options.model_path)
//    MMD_SA_options.model_path = 'MMD.js/model/m_GUMI/m_GUMI - standard bones.pmd'
  var _model_path = LABEL_LoadSettings("LABEL_MMD_model_path", "")
  if (_model_path) {
    MMD_SA_options.model_path = _model_path
    if (!returnBoolean("MMDOverrideDefaultForExternalModel"))
      System.Gadget.Settings.writeString("LABEL_MMD_model_path", "")
  }

  if (!FSO_OBJ.FileExists(MMD_SA_options.model_path))
    MMD_SA_options.model_path = MMD_SA_options.model_path_default
// END

  if (!MMD_SA_options.model_para)
    MMD_SA_options.model_para = {}

// SA demo default
  if (!MMD_SA_options.model_para["Appearance Miku_BDEF_mod.pmx"]) {
    MMD_SA_options.model_para["Appearance Miku_BDEF_mod.pmx"] = {
      morph_default:{ "瞳小":{weight_scale:0.5} }
    };
  }
  if (!MMD_SA_options.model_para["Appearance Miku_BDEF_mod.pmx"].bone_constraint) {
    MMD_SA_options.model_para["Appearance Miku_BDEF_mod.pmx"].bone_constraint = {
  "左前スカート": { rotation:{ x:[[-20*Math.PI/180,0],[75*2*Math.PI/180]] }}//,y:[[-30*Math.PI/180,0],[30*Math.PI/180,0]],z:[[-30*Math.PI/180,0],[30*Math.PI/180,0]] } }
 ,"右前スカート": { rotation:{ x:[[-20*Math.PI/180,0],[75*2*Math.PI/180]] }}//,y:[[-30*Math.PI/180,0],[30*Math.PI/180,0]],z:[[-30*Math.PI/180,0],[30*Math.PI/180,0]] } }
 ,"左後スカート": { rotation:{ x:[[-75*2*Math.PI/180],[20*Math.PI/180,0]] }}//,y:[[-30*Math.PI/180,0],[30*Math.PI/180,0]],z:[[-30*Math.PI/180,0],[30*Math.PI/180,0]] } }
 ,"右後スカート": { rotation:{ x:[[-75*2*Math.PI/180],[20*Math.PI/180,0]] }}//,y:[[-30*Math.PI/180,0],[30*Math.PI/180,0]],z:[[-30*Math.PI/180,0],[30*Math.PI/180,0]] } }
 ,"左横スカート": { rotation:{ z:[[-20*Math.PI/180,0],[75*2*Math.PI/180]] }}//,y:[[-30*Math.PI/180,0],[30*Math.PI/180,0]],x:[[-30*Math.PI/180,0],[30*Math.PI/180,0]] } }
 ,"右横スカート": { rotation:{ z:[[-75*2*Math.PI/180],[20*Math.PI/180,0]] }}//,y:[[-30*Math.PI/180,0],[30*Math.PI/180,0]],x:[[-30*Math.PI/180,0],[30*Math.PI/180,0]] } }
    };
  }

  if (!MMD_SA_options.model_para["Appearance teto_BDEF_1.6.pmx"])
    MMD_SA_options.model_para["Appearance teto_BDEF_1.6.pmx"] = Object.assign({}, MMD_SA_options.model_para["Appearance Miku_BDEF_mod.pmx"])
  if (!MMD_SA_options.model_para["Appearance Teto_IS_1.0.5.pmx"])
    MMD_SA_options.model_para["Appearance Teto_IS_1.0.5.pmx"] = Object.assign({}, MMD_SA_options.model_para["Appearance Miku_BDEF_mod.pmx"])

  var model_filename = MMD_SA_options.model_path.replace(/^.+[\/\\]/, "")
  var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx")
  MMD_SA_options.model_para_obj = Object.assign({}, MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || MMD_SA_options.model_para._default_ || {})
  MMD_SA_options.model_para_obj._filename_raw = model_filename
  MMD_SA_options.model_para_obj._filename = model_filename
  MMD_SA_options.model_para_obj._filename_cleaned = model_filename_cleaned

  window.addEventListener("MMDStarted", ()=>{
    THREE.MMD.getModels().forEach((model,i)=>{
      var bones_by_name = model.mesh.bones_by_name
      var model_para = MMD_SA_options.model_para_obj_all[i]

      if (bones_by_name["左足"] && bones_by_name["左ひざ"] && bones_by_name["左足首"])
        model_para.left_leg_length = (bones_by_name["左足"].pmxBone.origin[1] - bones_by_name["左ひざ"].pmxBone.origin[1]) + (bones_by_name["左ひざ"].pmxBone.origin[1] - bones_by_name["左足首"].pmxBone.origin[1]);
    });
  });

  if (!MMD_SA_options.model_para_obj.skin_default)
    MMD_SA_options.model_para_obj.skin_default = { _is_empty:true }
// save some headaches and make sure that every VMD has morph (at least a dummy) in "Dungeon" mode
  if (!MMD_SA_options.model_para_obj.morph_default) MMD_SA_options.model_para_obj.morph_default = {}//{ _is_empty:!MMD_SA_options.Dungeon }//

//window.addEventListener("MMDStarted", function () { console.log(MMD_SA_options.model_para_obj.motion_name_default) });
//  MMD_SA_options.model_para_obj.motion_name_default_combat = MMD_SA_options.model_para_obj.motion_name_default

  if (!MMD_SA_options.motion)
    MMD_SA_options.motion = [{path:System.Gadget.path + '/MMD.js/motion/stand.vmd'}]
  if (!MMD_SA_options.motion_para)
    MMD_SA_options.motion_para = {}

  if (!MMD_SA_options.motion_para["_cover_undies_blush"]) {
    MMD_SA_options.motion_para["_cover_undies_blush"] = { adjustment_per_model: {} }
  }
  if (!MMD_SA_options.motion_para["_cover_undies_blush"].adjustment_per_model._default_) {
    MMD_SA_options.motion_para["_cover_undies_blush"].adjustment_per_model._default_ = {
  skin_default: {
    "左腕": { rot_add: {x:-5, y:0, z:0} }
   ,"右腕": { rot_add: {x:-5, y:0, z:0} }
  }
    };
  }

//MMD_SA_options.motion = [{path:System.Gadget.path + '/MMD.js/motion/stand.vmd'}]
//MMD_SA_options.motion.motion_shuffle_pool_size = MMD_SA_options.motion_shuffle = null

  MMD_SA_options.motion.forEach(function (motion) {
    motion.path = toLocalPath(motion.path)
  });

  if (!MMD_SA_options.x_object)
    MMD_SA_options.x_object = []
  if (!MMD_SA_options.custom_action)
    MMD_SA_options.custom_action = ["kissing"]
  MMD_SA_options.custom_action.unshift("motion_blending_model0")
  if (!MMD_SA_options.AR_camera_mod)
    MMD_SA_options.AR_camera_mod = 1.2
  if (!MMD_SA_options.light_mod)
    MMD_SA_options.light_mod = 1
  if (MMD_SA_options.auto_blink == null)
    MMD_SA_options.auto_blink = true

  if (!MMD_SA_options.camera_position)
    MMD_SA_options.camera_position = [0,10,30];
  MMD_SA_options.camera_position_base = MMD_SA_options.camera_position.slice();
  if (!MMD_SA_options.camera_lookAt)
    MMD_SA_options.camera_lookAt = [0,MMD_SA_options.camera_position[1],0]
  if (!MMD_SA_options.camera_rotation)
    MMD_SA_options.camera_rotation = [0,0,0]
  if (!MMD_SA_options.camera_fov)
    MMD_SA_options.camera_fov = 50;
//MMD_SA_options.use_random_camera=true
  if (MMD_SA_options.use_random_camera) {
    if (!MMD_SA_options.random_camera)
      MMD_SA_options.random_camera = {}
    if (!MMD_SA_options.random_camera.distance)
      MMD_SA_options.random_camera.distance = [1,1.5]
    if (!MMD_SA_options.random_camera.rotation)
      MMD_SA_options.random_camera.rotation = {}
    if (!MMD_SA_options.random_camera.rotation.x)
      MMD_SA_options.random_camera.rotation.x = [-15,15]
    if (!MMD_SA_options.random_camera.rotation.y)
      MMD_SA_options.random_camera.rotation.y = [-40,40]
    if (!MMD_SA_options.random_camera.rotation.z)
      MMD_SA_options.random_camera.rotation.z = [0,0]
  }

  if (!MMD_SA_options.user_camera)
    MMD_SA_options.user_camera = {}

  if (MMD_SA_options.user_camera.mirror_3D == null)
    MMD_SA_options.user_camera.mirror_3D = 0//1

  if (!MMD_SA_options.user_camera.pixel_limit)
    MMD_SA_options.user_camera.pixel_limit = {}
  if (!MMD_SA_options.user_camera.pixel_limit._default_)
    MMD_SA_options.user_camera.pixel_limit._default_ = (is_mobile) ? [960,540] : [1280,720];

  if (!MMD_SA_options.user_camera.display)
    MMD_SA_options.user_camera.display = {}
  if (!MMD_SA_options.user_camera.display.video)
    MMD_SA_options.user_camera.display.video = {}
  if (!MMD_SA_options.user_camera.display.wireframe)
    MMD_SA_options.user_camera.display.wireframe = {}

  if (!MMD_SA_options.user_camera.ML_models)
    MMD_SA_options.user_camera.ML_models = {};
  ['facemesh','pose','hands'].forEach((model)=>{
    var m = MMD_SA_options.user_camera.ML_models[model]
    if (!m)
      m = MMD_SA_options.user_camera.ML_models[model] = {}
    if (!m.events)
      m.events = {}
  });

  if (!MMD_SA_options.user_camera.streamer_mode)
    MMD_SA_options.user_camera.streamer_mode = {};
  if (!MMD_SA_options.user_camera.streamer_mode.camera_preference)
    MMD_SA_options.user_camera.streamer_mode.camera_preference = {};

  if (MMD_SA_options.user_camera.ML_models.facemesh.use_mediapipe == null)
    MMD_SA_options.user_camera.ML_models.facemesh.use_mediapipe = true//System._browser.url_search_params.use_mediapipe_facemesh
  if (MMD_SA_options.user_camera.ML_models.use_holistic == null)
    MMD_SA_options.user_camera.ML_models.use_holistic = !!System._browser.url_search_params.use_holistic || null
  if (MMD_SA_options.user_camera.ML_models.worker_disabled == null)
    MMD_SA_options.user_camera.ML_models.worker_disabled = (typeof OffscreenCanvas == "undefined") || System._browser.url_search_params.ML_worker_disabled

  if (MMD_SA_options.user_camera.ML_models.facemesh.use_mediapipe || MMD_SA_options.user_camera.ML_models.worker_disabled)
    System._browser.camera.facemesh.use_mediapipe = true
  if (typeof MMD_SA_options.user_camera.ML_models.use_holistic == 'boolean')
    System._browser.camera.poseNet._use_holistic_ = MMD_SA_options.user_camera.ML_models.use_holistic

  if (MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent == null)
    MMD_SA_options.user_camera.ML_models.hands.depth_adjustment_percent = 50;
  if (MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent == null)
    MMD_SA_options.user_camera.ML_models.hands.palm_shoulder_scale_percent = 22;
  if (MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent == null)
    MMD_SA_options.user_camera.ML_models.hands.depth_scale_percent = 50;

  if (!MMD_SA_options.gamepad)
    MMD_SA_options.gamepad = [{}];
  MMD_SA_options.gamepad.forEach(g=>{
    if (!g.axes) g.axes = { '0':{}, '2':{} };
    if (!g.buttons) g.buttons = { '6':{} };
  });

  if (!MMD_SA_options.OSC)
    MMD_SA_options.OSC = {};
  if (!MMD_SA_options.OSC.VMC)
    MMD_SA_options.OSC.VMC = {};
  if (!MMD_SA_options.OSC.VMC.send)
    MMD_SA_options.OSC.VMC.send = { port:39539 };
  if (!MMD_SA_options.OSC.VMC.open)
    MMD_SA_options.OSC.VMC.open = { port:39540 };

  var _trackball_camera_limit_adjust = function () {}
  if (MMD_SA_options.trackball_camera_limit) {
    if (MMD_SA_options.trackball_camera_limit.adjust)
      _trackball_camera_limit_adjust = MMD_SA_options.trackball_camera_limit.adjust
  }
  else
    MMD_SA_options.trackball_camera_limit = {}

  if (!MMD_SA_options.MMD_disabled) {
    if (!MMD_SA_options.trackball_camera_limit.min)
      MMD_SA_options.trackball_camera_limit.min = {}
    if (!MMD_SA_options.trackball_camera_limit.min.length) {
      window.addEventListener("MMDStarted", function () {
var bb = THREE.MMD.getModels()[0].mesh.geometry.boundingBox
MMD_SA_options.trackball_camera_limit.min.length = (bb.max.y - bb.min.y) + 2
      });
      Object.defineProperty(MMD_SA_options.trackball_camera_limit.min, "length", (function () {
var length = 25;
return {
  get: function () {
    var limit = Math.max(10, length-10)
    var trackball_camera_limit = MMD_SA.MMD.motionManager.para_SA.trackball_camera_limit
    if (trackball_camera_limit && trackball_camera_limit.min && trackball_camera_limit.min.length)
      limit = Math.min(limit, trackball_camera_limit.min.length)
    return limit
  }
 ,set: function (v) { length = v; }
};
      })());
    }

    MMD_SA_options.trackball_camera_limit.adjust = function (eye) {
var result = { return_value:null }
window.dispatchEvent(new CustomEvent("SA_MMD_trackball_camera_limit_adjust", { detail:{ eye:eye, result:result } }));
if (result.return_value != null)
  return result.return_value

return _trackball_camera_limit_adjust(eye)
    }
  }

  if (MMD_SA_options.GOML_import)
    MMD_SA.GOML_import += MMD_SA_options.GOML_import
  if (MMD_SA_options.GOML_head)
    MMD_SA.GOML_head   += MMD_SA_options.GOML_head
  if (MMD_SA_options.GOML_scene)
    MMD_SA.GOML_scene  += MMD_SA_options.GOML_scene

  if (MMD_SA_options.GOML_head_list)
    MMD_SA.GOML_head_list = MMD_SA.GOML_head_list.concat(MMD_SA_options.GOML_head_list);
  if (MMD_SA_options.GOML_scene_list)
    MMD_SA.GOML_scene_list = MMD_SA.GOML_scene_list.concat(MMD_SA_options.GOML_scene_list);

  if (MMD_SA_options.reset_rigid_body_physics_step == null)
    MMD_SA_options.reset_rigid_body_physics_step = 10

  if (MMD_SA_options.matrixWorld_physics_scale == null)
    MMD_SA_options.matrixWorld_physics_scale = 0.25

  if (MMD_SA_options.SeriousShader_OverBright_adjust == null)
    MMD_SA_options.SeriousShader_OverBright_adjust = 0

  MMD_SA_options._MME_ = MMD_SA_options.MME || {}
  MMD_SA_options._MME  = Object.clone(MMD_SA_options._MME_)
  Object.defineProperty(MMD_SA_options, "MME",
{
  get: function () {
return this.model_para_obj.MME || this._MME
  }
});
  MMD_SA_options.model_para_obj.MME = MMD_SA_options.MME
  MMD_SA_options.model_para_obj.MME.PostProcessingEffects = MMD_SA_options.model_para_obj.MME.PostProcessingEffects || MMD_SA_options._MME.PostProcessingEffects

  try {
    var _file = FSO_OBJ.OpenTextFile(System.Gadget.path + '\\MMD.js\\data\\MMD_MME_by_model.json', 1);
    var _json = _file.ReadAll()
    _file.Close()
    MMD_SA_options.MME_saved = JSON.parse(_json)
  }
  catch (err) {
//setTimeout(function () {DEBUG_show(err,0,1)}, 2000)
    MMD_SA_options.MME_saved = {}
  }

  MMD_SA.MME_init()
  MMD_SA_options.MME._toFloat = function toFloat(v) {
    if (v.constructor === Array) {
      for (var i = 0, i_max = v.length; i < i_max; i++) {
        var _v = v[i]
        v[i] = (_v == parseInt(_v)) ? _v + ".0" : _v
      }
      return v
    }
    else {
      return (v == parseInt(v)) ? v + ".0" : v
    }
  };


// adjust Dungeon options
  if (MMD_SA_options.Dungeon) {
    if (!MMD_SA_options.Dungeon_options.camera_position_z_sign)
      MMD_SA_options.Dungeon_options.camera_position_z_sign = (!MMD_SA_options.WebXR || !MMD_SA_options.WebXR.AR) ? -1 : 1;

    Object.defineProperty(MMD_SA_options.Dungeon.character, 'camera_position_base_default', (function () {
      function get_camera_default() {
return MMD_SA_options.camera_position_base.map((n,i)=>n*((i==2)?MMD_SA_options.Dungeon_options.camera_position_z_sign:1));
      }

      let _camera_position_base_default;
      return {
        get: ()=>{
return _camera_position_base_default || get_camera_default();
        },
        set: (v)=>{
const dc = get_camera_default();
if (v.every((n,i)=>n==dc[i])) {
  _camera_position_base_default = null;
}
else {
  console.log('camera_position_base_default', v.slice());
  _camera_position_base_default = v;
}
        },
      };
    })());
  }


// extra models START
  MMD_SA_options.model_para_obj_all = [MMD_SA_options.model_para_obj]

  if (!MMD_SA_options.model_path_extra)
    MMD_SA_options.model_path_extra = []

  for (var i = 0, i_max = MMD_SA_options.model_path_extra.length; i < i_max; i++) {
    var path = MMD_SA_options.model_path_extra[i] = toLocalPath(MMD_SA_options.model_path_extra[i])

    var model_filename_raw = path.replace(/^.+[\/\\]/, "")
    var model_filename = model_filename_raw
    var clone_index = -1
    if (/\#clone(\d+)\.pmx$/.test(model_filename)) {
      clone_index = parseInt(RegExp.$1)
      model_filename = model_filename.replace(/\#clone(\d+)\.pmx$/, ".pmx")
    }
    var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx")
    var model_para_obj = Object.assign({}, MMD_SA_options.model_para[model_filename_raw] || MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || {})
    model_para_obj._filename_raw = model_filename_raw
    model_para_obj._filename = model_filename
    model_para_obj._filename_cleaned = model_filename_cleaned

    if (!model_para_obj.skin_default)
      model_para_obj.skin_default = { _is_empty:true }
// save some headaches and make sure that every VMD has morph (at least a dummy) in "Dungeon" mode
  if (!model_para_obj.morph_default) model_para_obj.morph_default = {}//{ _is_empty:!MMD_SA_options.Dungeon }//

    if (!model_para_obj.MME)
      model_para_obj.MME = {}
    var MME_saved = MMD_SA_options.MME_saved[model_filename] || MMD_SA_options.MME_saved[model_filename_cleaned]
    if (MME_saved) {
      model_para_obj.MME.self_overlay = Object.clone(MME_saved.self_overlay)
      model_para_obj.MME.HDR = Object.clone(MME_saved.HDR)
      model_para_obj.MME.serious_shader = Object.clone(MME_saved.serious_shader)
    }
    else {
      model_para_obj.MME.self_overlay = model_para_obj.MME.self_overlay || { enabled:false }
      model_para_obj.MME.HDR = model_para_obj.MME.HDR || { enabled:false }
      model_para_obj.MME.serious_shader = model_para_obj.MME.serious_shader || { enabled:false }
    }

    MMD_SA_options.model_para_obj_all.push(model_para_obj)
  }

  if (MMD_SA_options.mirror_motion_from_first_model == null)
    MMD_SA_options.mirror_motion_from_first_model = 99

  if (!MMD_SA_options.multi_model_position_offset) {
    var _multi_model_position_offset = [
  [{x:  0, y:0, z:0}]
 ,[{x: -7, y:0, z:0}, {x:  7, y:0, z:0}]
 ,[{x:  0, y:0, z:0}, {x:-12, y:0, z:0}, {x: 12, y:0, z:0}]
 ,[{x:-12, y:0, z:0}, {x: 12, y:0, z:0}, {x: -6, y:0, z:6}, {x:  6, y:0, z:12}]
 ,[{x:  0, y:0, z:0}, {x:-12, y:0, z:0}, {x: 12, y:0, z:0}, {x: -6, y:0, z:12}, {x:  6, y:0, z:12}]
    ]

    var model_object = 0
    MMD_SA_options.multi_model_position_offset = []
    MMD_SA_options.model_para_obj_all.forEach(function (obj, idx) {
      if (obj.is_object)
        model_object += 1

      if (idx == 0)
        return

      MMD_SA_options.multi_model_position_offset.push([])
      if (idx < MMD_SA_options.model_para_obj_all.length-1)
        return

      var offset_index = idx - model_object
      if (offset_index < 0)
        offset_index = 0
      else if (offset_index > _multi_model_position_offset.length-1)
        offset_index = _multi_model_position_offset.length-1

      var _idx = 0
      var pos_offset = MMD_SA_options.multi_model_position_offset[MMD_SA_options.multi_model_position_offset.length-1]
      MMD_SA_options.model_para_obj_all.forEach(function (obj) {
        pos_offset.push((obj.is_object) ? {x:0, y:0, z:0} : (_multi_model_position_offset[offset_index][_idx++] || {x:0, y:0, z:0}))
      });
    });
  }
//console.log(MMD_SA_options.multi_model_position_offset)
//MMD_SA_options.multi_model_position_offset = []

  MMD_SA_options.model_para_obj_by_filename = {}
  var model_count = MMD_SA_options.model_para_obj_all.length
  MMD_SA_options.model_para_obj_all.forEach(function (obj, idx) {
    obj._model_index = obj._model_index_default = idx
    MMD_SA_options.model_para_obj_by_filename[obj._filename_raw] = obj

    if (obj.is_object) {
      obj.mirror_motion_from_first_model = false
      if (!obj.morphTargets_length_fixed && (!obj.morph_default || obj.morph_default._is_empty || !Object.keys(obj.morph_default).length))
        obj.morphTargets_length_fixed = 0
    }

    obj._mirror_motion_from_first_model = obj.mirror_motion_from_first_model
    Object.defineProperty(obj, "mirror_motion_from_first_model", {
  get: function () {
return (this._mirror_motion_from_first_model !== false) && (this._mirror_motion_from_first_model || (MMD_SA_options.mirror_motion_from_first_model >= this._model_index))
  }
 ,set: function (v) {
this._mirror_motion_from_first_model = v
  }
    });

    if (model_count == 1)
      return
    var pos_offset = MMD_SA_options.multi_model_position_offset[model_count-2]
    if (!pos_offset)
      return

    obj.skin_default._is_empty = false
    var pos_para = obj.skin_default["全ての親"]
    if (!pos_para)
      pos_para = obj.skin_default["全ての親"] = {}
    pos_para.pos_add_absolute = {x:pos_offset[idx].x, y:pos_offset[idx].y, z:pos_offset[idx].z}
  });
// END

// save headaches for morph target stuff once and for all
  if (!MMD_SA_options.morphTargets_length_fixed)
    MMD_SA_options.morphTargets_length_fixed = 40

  if (MMD_SA_options.physics_maxSubSteps == null)
    MMD_SA_options.physics_maxSubSteps = (MMD_SA_options.model_para_obj_all.length < 3) ? 3 : 2

  MMD_SA_options.MME._EV_usage_PROCESS = function (u, decay_factor) {
if (use_full_fps)
  decay_factor *= ((RAF_animation_frame_unlimited)?1:2)/EV_sync_update.count_to_10fps_

// decay control
if (Settings.ReverseAnimation) {
  if (u - decay_factor > this._u_last)
    u = this._u_last + decay_factor
}
else {
  if (u + decay_factor < this._u_last)
    u = this._u_last - decay_factor
}
this._u_last = u

return u
  }

  var PPE = MMD_SA_options.MME.PostProcessingEffects = MMD_SA_options.MME.PostProcessingEffects || { enabled:false }
  PPE.enabled = !!(PPE.enabled || returnBoolean("Use3DPPE"))

  PPE.effects_by_name = {}
  if (!PPE.shuffle_group)
    PPE.shuffle_group = {}
  if (!PPE.effects)
    PPE.effects = []
  if (!PPE.SeriousShader_OverBright_adjust)
    PPE.SeriousShader_OverBright_adjust = MMD_SA_options.SeriousShader_OverBright_adjust || 0.05

  if (!PPE.effects.some(function (e) { return e.name=="SAOShader" })) {
    var _enabled = !!(PPE.use_SAO || returnBoolean("Use3DSAO"))
    PPE.effects.unshift(
  { name:"SAOShader", enabled:_enabled }
, { name:"DepthLimitedBlurShaderV", enabled:_enabled }
, { name:"DepthLimitedBlurShaderH", enabled:_enabled }
    );

    if (_enabled)
      MMD_SA_options.SeriousShader_OverBright_adjust = PPE.SeriousShader_OverBright_adjust
  }

  if (!PPE.effects.some(function (e) { return e.name=="DiffusionX" })) {
    var _enabled = (PPE.use_Diffusion || returnBoolean("Use3DDiffusion")) ? [1,1,0] : [0,0,((PPE.effects.some(function (e) { return e.name=="BloomPass" }))?0:1)]
    PPE.effects.push(
  { name:"DiffusionX", enabled:_enabled[0] }
 ,{ name:"DiffusionY", enabled:_enabled[1] }
 ,{ name:"CopyShader", enabled:_enabled[2] }
    );
  }

  if (!PPE.effects.some(function (e) { return e.name=="BloomPostProcess" })) {
    var _enabled = !!(PPE.use_BloomPostProcess || returnBoolean("Use3DBloomPostProcess"))
    var difusionX_index = PPE.effects.findIndex(function (e) { return e.name=="DiffusionX" })
    PPE.effects = PPE.effects.slice(0, difusionX_index).concat({ name:"BloomPostProcess", enabled:_enabled, blur_size:parseFloat(System.Gadget.Settings.readString("Use3DBloomPostProcessBlurSize")||0.5), threshold:parseFloat(System.Gadget.Settings.readString("Use3DBloomPostProcessThreshold")||0.5), intensity:parseFloat(System.Gadget.Settings.readString("Use3DBloomPostProcessIntensity")||0.5) }, PPE.effects.slice(difusionX_index))
  }

  PPE.effects.forEach(function (effect) {
    effect.enabled = !!effect.enabled || (effect.enabled == null)

    // temp dummy
    effect.obj = effect

    PPE.effects_by_name[effect.name] = effect
    effect._EV_usage_PROCESS = MMD_SA_options.MME._EV_usage_PROCESS
    if (effect.shuffle_group_id != null) {
      var sg = PPE.shuffle_group[effect.shuffle_group_id]
      if (!sg)
        sg = PPE.shuffle_group[effect.shuffle_group_id] = {}
      if (!sg.effects)
        sg.effects = []
      sg.effects.push(effect)
    }
  });

  Object.defineProperty(PPE, "use_SAO", {
  get: function () {
return this.effects_by_name["SAOShader"].obj.enabled
  }

 ,set: function (v) {
if (!this._initialized)
  return

var SAO = []
SAO[0] = this._effects["SAOShader"]
if (!SAO[0])
  return

SAO[1] = this._effects["DepthLimitedBlurShaderV"]
SAO[2] = this._effects["DepthLimitedBlurShaderH"]

SAO.forEach(function (e) {
  if (e) {
    e.enabled = v
  }
});

MMD_SA.MME_composer_disabled_check(this._composers_list[SAO[0]._composer_index])

MMD_SA_options.SeriousShader_OverBright_adjust = (v) ? this.SeriousShader_OverBright_adjust : 0

MMD_SA.MME_set_renderToScreen()
  }
  });

  Object.defineProperty(PPE, "use_BloomPostProcess", {
  get: function () {
return this.effects_by_name["BloomPostProcess"].obj.enabled
  }

 ,set: function (v) {
if (!this._initialized)
  return

if (!MMD_SA.use_webgl2)
  return

var BloomPostProcess = this._effects["BloomPostProcess"]
if (!BloomPostProcess)
  return

BloomPostProcess.enabled = v

MMD_SA.MME_composer_disabled_check(this._composers_list[BloomPostProcess._composer_index])

MMD_SA.MME_set_renderToScreen()
  }
  });

  Object.defineProperty(PPE, "use_Diffusion", {
  get: function () {
return this.effects_by_name["DiffusionX"].obj.enabled
  }

 ,set: function (v) {
if (!this._initialized)
  return

var Diffusion = []
Diffusion[0] = this._effects["DiffusionX"]
if (!Diffusion[0])
  return

Diffusion[1] = this._effects["DiffusionY"]
Diffusion[2] = ((Diffusion[1]._index+1 < this.effects.length) && (this.effects[Diffusion[1]._index+1].name == "CopyShader")) ? this.effects[Diffusion[1]._index+1].obj : {}

var _enabled = (v) ? [1,1,0] : [0,0,1]

Diffusion.forEach(function (e, i) {
  e.enabled = _enabled[i]
});

MMD_SA.MME_composer_disabled_check(this._composers_list[Diffusion[0]._composer_index])

MMD_SA.MME_set_renderToScreen()
  }
  });

  MMD_SA_options._light_color = MMD_SA_options.light_color || '#606060'
  Object.defineProperty(MMD_SA_options, "light_color",
{
  get: function () {
return System.Gadget.Settings.readString("MMDLightColor") || MMD_SA_options._light_color;
  },
  set: function (v) {
MMD_SA_options._light_color = v;
  }
});

  if (!MMD_SA_options.light_position_scale)
    MMD_SA_options.light_position_scale = 40

  if (!MMD_SA_options.shadow_para)
    MMD_SA_options.shadow_para = {}
  if (!MMD_SA_options.shadow_para.shadowBias)
    MMD_SA_options.shadow_para.shadowBias = -0.0025*1
//  if (!MMD_SA_options.shadow_para.shadowDarkness)
//    MMD_SA_options.shadow_para.shadowDarkness = 0.7;
  if (!MMD_SA_options.shadow_para.shadowMapWidth)
    MMD_SA_options.shadow_para.shadowMapWidth = 1024*2;
  if (!MMD_SA_options.shadow_para.shadowMapHeight)
    MMD_SA_options.shadow_para.shadowMapHeight = 1024*2;
  if (!MMD_SA_options.shadow_para.shadowCameraNear)
    MMD_SA_options.shadow_para.shadowCameraNear = 1;
  if (!MMD_SA_options.shadow_para.shadowCameraFar)
    MMD_SA_options.shadow_para.shadowCameraFar = MMD_SA_options.light_position_scale * 2;
  if (!MMD_SA_options.shadow_para.shadowCameraLeft)
    MMD_SA_options.shadow_para.shadowCameraLeft = -20*1;
  if (!MMD_SA_options.shadow_para.shadowCameraRight)
    MMD_SA_options.shadow_para.shadowCameraRight = 20*1;
  if (!MMD_SA_options.shadow_para.shadowCameraBottom)
    MMD_SA_options.shadow_para.shadowCameraBottom = -20*1;
  if (!MMD_SA_options.shadow_para.shadowCameraTop)
    MMD_SA_options.shadow_para.shadowCameraTop = 20*1;

  if (!MMD_SA_options.shadow_para.use_cascaded_shadow_map)
    MMD_SA_options.shadow_para.use_cascaded_shadow_map = false//!!MMD_SA_options.Dungeon
  if (!MMD_SA_options.shadow_para.shadowCascadeCount)
    MMD_SA_options.shadow_para.shadowCascadeCount = 2//3
  if (!MMD_SA_options.shadow_para.shadowCascadeBias)
    MMD_SA_options.shadow_para.shadowCascadeBias = [MMD_SA_options.shadow_para.shadowBias, MMD_SA_options.shadow_para.shadowBias, MMD_SA_options.shadow_para.shadowBias];
  if (!MMD_SA_options.shadow_para.shadowCascadeWidth)
    MMD_SA_options.shadow_para.shadowCascadeWidth = [MMD_SA_options.shadow_para.shadowMapWidth, MMD_SA_options.shadow_para.shadowMapWidth, MMD_SA_options.shadow_para.shadowMapWidth];
  if (!MMD_SA_options.shadow_para.shadowCascadeHeight)
    MMD_SA_options.shadow_para.shadowCascadeHeight = [MMD_SA_options.shadow_para.shadowMapHeight, MMD_SA_options.shadow_para.shadowMapHeight, MMD_SA_options.shadow_para.shadowMapHeight];
  if (!MMD_SA_options.shadow_para.shadowCascadeNearZ)
    MMD_SA_options.shadow_para.shadowCascadeNearZ = (MMD_SA_options.shadow_para.shadowCascadeCount == 2) ? [-0.9999, 0.9985] : [-0.9999, 0.9970, 0.9990]
  if (!MMD_SA_options.shadow_para.shadowCascadeFarZ)
    MMD_SA_options.shadow_para.shadowCascadeFarZ =  (MMD_SA_options.shadow_para.shadowCascadeCount == 2) ? [ 0.9985, 0.9999] : [ 0.9970, 0.9990, 0.9999]

  if (!MMD_SA_options.shadow_para.shadowBias_range)
    MMD_SA_options.shadow_para.shadowBias_range = (MMD_SA_options.Dungeon_options) ? [0.1, 100] : [0.1, 2]//[1,1] : [1,1]//[0.1,0.1] : [0.1,0.1]//

  if (!MMD_SA_options.ripple_max)
    MMD_SA_options.ripple_max = 20
  if (!MMD_SA_options.ripple_range)
    MMD_SA_options.ripple_range = 128
  MMD_SA_options.ripple_range = parseInt(MMD_SA_options.ripple_range)

  MMD_SA_options._light_position = MMD_SA_options.light_position || [1,1,1]
  Object.defineProperty(MMD_SA_options, "light_position",
{
  get: function () {
var light_pos = JSON.parse(System.Gadget.Settings.readString("MMDLightPosition") || "null") || MMD_SA_options.model_para_obj.light_position || MMD_SA_options._light_position
light_pos = light_pos.slice()
for (var i = 0; i < 3; i++)
  light_pos[i] *= MMD_SA_options.light_position_scale

return light_pos
  }
 ,set: function (pos) { this._light_position = pos; }
});


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
var v

var range = (para_SA.range && para_SA.range[mm.range_index])
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
var v

var range = (para_SA.range && para_SA.range[mm.range_index])
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

var music_mode = MMD_SA.music_mode && (this.look_at_screen_music_mode != true)

var mm = (model && (model._model_index > 0)) ? MMD_SA.motion[model.skin._motion_index] : MMD_SA.MMD.motionManager
var para_SA = mm.para_SA

// cache the return value for better performance in case of getter functions
var v

var range = (para_SA.range && para_SA.range[mm.range_index])
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
var music_mode = MMD_SA.music_mode && (this.look_at_screen_music_mode != true)

var mm = MMD_SA.MMD.motionManager
var para_SA = mm.para_SA

if (!this.look_at_screen)
  return false

// cache the return value for better performance in case of getter functions
var v

var range = (para_SA.range && para_SA.range[mm.range_index])
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
var v

var range = (para_SA.range && para_SA.range[mm.range_index])
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

  if (MMD_SA_options.user_camera.ML_models.enabled) {
    MMD_SA_options.look_at_mouse = false

    window.addEventListener("jThree_ready", function () {
MMD_SA_options.model_para_obj_all.forEach(function (model_para_obj) {
  model_para_obj.use_default_boundingBox = true
});

var facemesh_morph = {}
if (MMD_SA_options.model_para_obj.facemesh_morph) {
  for (const name in MMD_SA_options.model_para_obj.facemesh_morph) {
    let name_new;
    switch (name) {
      case "mouth_narrow":
        name_new = "ω"
        break
      default:
        name_new = name
    }
    facemesh_morph[name_new] = MMD_SA_options.model_para_obj.facemesh_morph[name]
  }
}
MMD_SA_options.model_para_obj.facemesh_morph = facemesh_morph
//console.log(facemesh_morph)
    });

    window.addEventListener("SA_MMD_before_motion_init", function () {
var morph_default = MMD_SA_options.model_para_obj.morph_default = MMD_SA_options.model_para_obj.morph_default || {};

var facemesh_morph = MMD_SA_options.model_para_obj.facemesh_morph;
var morphs_index_by_name = THREE.MMD.getModels()[0].pmx.morphs_index_by_name;

// "まばたきL", "まばたきR"
// お <==> ∧
System._browser.camera.facemesh.MMD_morph_list.forEach(function (m) {
  if (!facemesh_morph[m]) {
    const morph_alt = [];
    switch (m) {
case "びっくり":
  morph_alt.push(m, '驚き');
  break;
case "にやり":
  morph_alt.push('横伸ばし', '口幅大', m, '←→');
  break;
case "ω":
  morph_alt.push('横潰し', '口幅小', m, '→←');
  break;
case "口角上げ":
  morph_alt.push(m, '∪', 'スマイル');
  break;
case "口角下げ":
  morph_alt.push(m, '∩', 'む', 'ん', 'んあ');
  break;
case "上":
case "下":
  morph_alt.push(m, 'まゆ'+m, '眉'+((m=='上')?'↑':'↓'));
  break;
case "照れ":
  morph_alt.push(m, '赤面');
  break;
default:
  morph_alt.push(m);
    }
    morph_alt.some(ma=>{
if (morphs_index_by_name[ma] != null) {
  facemesh_morph[m] = { name:ma, weight:(morph_default[ma] && morph_default[ma].weight_scale)||1 };
  return true;
}
    });
  }

  if (facemesh_morph[m]) {
    const mm = facemesh_morph[m].name;
    if (!morph_default[mm]) morph_default[mm] = { weight:0 };
  }
});
    });
  }
  if (MMD_SA_options.WebXR) {
    window.addEventListener("MMDStarted", function () {
THREE.MMD.getModels().forEach(function (model) {
  model.mesh.frustumCulled = false
});
    });
  }


  MMD_SA_options.x_object_by_name = {}

  if (!MMD_SA_options.mesh_obj)
    MMD_SA_options.mesh_obj = []
  MMD_SA_options.mesh_obj_by_id = {}

  if (!MMD_SA_options.mesh_obj_preload_list)
    MMD_SA_options.mesh_obj_preload_list = []

  if (!MMD_SA_options.MMD_disabled) {
    for (var i = 0, i_max = MMD_SA_options.model_para_obj_all.length; i < i_max; i++) {
      MMD_SA_options.mesh_obj.push({ id:"mikuPmx"+i })
    }
  }

// Circular spectrum
  if (MMD_SA_options.use_CircularSpectrum) {
    const _r = MMD_SA_options.CircularSpectrum_radius || 10
    const _divider = 128
    const _cube_size = _r * 2 * Math.PI / (_divider * 2)

    MMD_SA_options.mesh_obj_preload_list.push({ id:'CircularSpectrumMESH', create:function () {
const THREE = MMD_SA.THREEX.THREE;

const geometry = new THREE.BoxGeometry(_cube_size,_cube_size,_cube_size);
const material = new THREE.MeshBasicMaterial({ color:(MMD_SA_options.CircularSpectrum_color || '#0f0') });

const obj = new THREE.Object3D();
for (let i = 0; i < _divider; i++) {
  const _a = (i / _divider) * Math.PI * 2;
  const mesh = MMD_SA.THREEX.mesh_obj.set('CircularSpectrum' + i + 'MESH', new THREE.Mesh(geometry, material), true);
  mesh.position.set(_r*Math.sin(_a), _r*Math.cos(_a), 0);
  mesh.rotation.set(0, 0, -_a);
  obj.add(mesh);
}
obj.position.fromArray(MMD_SA_options.CircularSpectrum_position || [0,10,0]);

obj.scale.set(0,0,0)

return obj;
    } });

    MMD_SA_options.mesh_obj.push({ id:"CircularSpectrumMESH", scale:0 })
  }

// Kiss
  if (!MMD_SA_options.MMD_disabled && MMD_SA_options.allows_kissing && (MMD_SA_options.custom_action.indexOf("kissing") == -1))
    MMD_SA_options.custom_action.push("kissing")
  if (MMD_SA_options.custom_action.indexOf("kissing") != -1) {
    MMD_SA_options.mesh_obj_preload_list.push({ id:'KissMESH', create:function () {
const THREE = MMD_SA.THREEX.THREE;

const para = { map:MMD_SA.load_texture(System.Gadget.path + '/images/kiss_mark_red_o66.png'), depthTest:false };
if (!MMD_SA.THREEX.enabled) {
  para.useScreenCoordinates = false;
}
const material = new THREE.SpriteMaterial(para);

return new THREE.Sprite(material);
    } });
    MMD_SA_options.mesh_obj.push({ id:"KissMESH" })
  }

// X-ray START
  if (MMD_SA_options._use_xray) {
    if (!MMD_SA_options._xray_opacity)
      MMD_SA_options._xray_opacity = 0

    if (!MMD_SA_options._xray_radius)
      MMD_SA_options._xray_radius = 3
    var _r = MMD_SA_options._xray_radius

    MMD_SA.GOML_head +=
  '<geo id="XrayGEO" type="Cube" param="' + [_r*2, _r*2/100, _r*2/100].join(" ") + '" />\n'
+ '<mtl id="XrayMTL" type="MeshBasic" param="color:#000;" />\n';

    MMD_SA.GOML_scene +=
  '<obj id="XrayMESH" style="position:0 0 0; scale:0;">\n'

+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ 0, _r, _r].join(" ") + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ 0,-_r, _r].join(" ") + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ 0, _r,-_r].join(" ") + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ 0,-_r,-_r].join(" ") + ';" />\n'

+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ _r, _r, 0].join(" ") + '; rotateY:' + (Math.PI/2) + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [-_r, _r, 0].join(" ") + '; rotateY:' + (Math.PI/2) + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ _r,-_r, 0].join(" ") + '; rotateY:' + (Math.PI/2) + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [-_r,-_r, 0].join(" ") + '; rotateY:' + (Math.PI/2) + ';" />\n'

+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ _r, 0, _r].join(" ") + '; rotateZ:' + (Math.PI/2) + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [-_r, 0, _r].join(" ") + '; rotateZ:' + (Math.PI/2) + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [ _r, 0,-_r].join(" ") + '; rotateZ:' + (Math.PI/2) + ';" />\n'
+ '<mesh geo="#XrayGEO" mtl="#XrayMTL" style="position:' + [-_r, 0,-_r].join(" ") + '; rotateZ:' + (Math.PI/2) + ';" />\n'

+ '</obj>\n';

    MMD_SA_options.mesh_obj.push({ id:"XrayMESH" })
  }
// X-ray END

// Mirrors
  if (MMD_SA_options.mirror_obj) {
    MMD_SA_options.mirror_obj.forEach(function (para, idx) {
if (para.created)
  return
var obj = MMD_SA.createMirror(para)
MMD_SA.GOML_head  += obj.geo + obj.mtl
MMD_SA.GOML_scene += obj.mesh
MMD_SA_options.mesh_obj.push({ id:"Mirror" + idx + "MESH", use_child_animation_texture:/^\#ChildAnimation/.test(para.baseTexture), scale:(para.scale||1), hidden_on_start:para.hidden })
    });
  }

// child animation as texture
  if (!is_SA_child_animation && MMD_SA_options.child_animation_as_texture) {
    if (!MMD_SA_options.child_animation_width)
      MMD_SA_options.child_animation_width = 512
    if (!MMD_SA_options.child_animation_height)
      MMD_SA_options.child_animation_height = 512
    if (!MMD_SA_options.child_animation_opacity)
      MMD_SA_options.child_animation_opacity = 1

    for (var i = 0; i < MMD_SA_options.child_animation_as_texture; i++) {
var c_id = 'j3_childAnimationCanvas' + i

MMD_SA.GOML_import +=
  '<canvas id="' + c_id + '"></canvas>\n'

MMD_SA.GOML_head +=
  '<txr id="ChildAnimation' + i + 'TXR" canvas="#' + c_id + '" animation="false" />\n'
    }
  }

  if (!MMD_SA_options.width)
    MMD_SA_options.width  = AR_para.video_width  || 512
  if (!MMD_SA_options.height)
    MMD_SA_options.height = AR_para.video_height || 512

  if (MMD_SA_options.use_speech_bubble) {
    MMD_SA.SpeechBubble.init()
  }

// save some headaches for physics glitches on start
  window.addEventListener("MMDStarted", function () {
     THREE.MMD.getModels().forEach(function (m) {
if (!m.physi) return;

m.resetPhysics(30)

//m.physi.reset();
    });
  });

// defaults END


  var _motion_map = []
  if (MMD_SA_options.motion_by_song_name) {
    for (var song_name in MMD_SA_options.motion_by_song_name) {
      var m = MMD_SA_options.motion_by_song_name[song_name]
      var motion_index = m.motion_index
      if (motion_index != null) {
        _motion_map[motion_index] = MMD_SA_options.motion[motion_index]
      }
    }
  }

  if (MMD_SA_options.motion_shuffle_pool_size) {
    var _motion_must_load = []
    for (var k = 0, k_max = MMD_SA_options.motion.length; k < k_max; k++) {
      var m = MMD_SA_options.motion[k]
      if (m.must_load)
        _motion_map[k] = _motion_must_load[_motion_must_load.length] = m
    }
    if (MMD_SA_options.motion_shuffle_list_default) {
      for (var k = 0, k_max = MMD_SA_options.motion_shuffle_list_default.length; k < k_max; k++) {
        var motion_index = MMD_SA_options.motion_shuffle_list_default[k]
        _motion_map[motion_index] = MMD_SA_options.motion[motion_index]
      }
    }

    if (!MMD_SA_options.motion_shuffle) {
      MMD_SA_options.motion_shuffle = []
      MMD_SA_options.motion.forEach(function (motion, idx) {
        if (!motion.no_shuffle)
          MMD_SA_options.motion_shuffle.push(idx)
      });
      MMD_SA_options.motion_shuffle.shuffle().slice(0, MMD_SA_options.motion_shuffle_pool_size)
    }


    var _motion_shuffle_existed = []

    var _motion_shuffle = MMD_SA_options.motion_shuffle.slice(0)
    for (var k = 0, k_max = _motion_shuffle.length; k < k_max; k++)
      _motion_shuffle_existed[_motion_shuffle[k]] = true

    var _motion_shuffle_spare = []
    if (MMD_SA_options.motion_shuffle_list_default) {
      for (var k = 0, k_max = MMD_SA_options.motion_shuffle_list_default.length; k < k_max; k++) {
        var motion_index = MMD_SA_options.motion_shuffle_list_default[k]
        if (!_motion_shuffle_existed[motion_index]) {
          _motion_shuffle_existed[motion_index] = true
          _motion_shuffle_spare.push(motion_index)
        }
      }
    }

    var _shuffle = []
    for (var i = 0, i_max = MMD_SA_options.motion.length; i < i_max; i++) {
      if (!_motion_shuffle_existed[i] && !MMD_SA_options.motion[i].no_shuffle)
        _shuffle.push(MMD_SA_options.motion[i])
    }

    var _motion = []
    for (var k = 0, k_max = _motion_shuffle.length; k < k_max; k++)
      _motion.push(MMD_SA_options.motion[_motion_shuffle[k]])
    for (var k = 0, k_max = _motion_shuffle_spare.length; k < k_max; k++)
      _motion.push(MMD_SA_options.motion[_motion_shuffle_spare[k]])

    MMD_SA_options.motion = (MMD_SA_options.motion_shuffle_pool_size <= _motion_shuffle.length) ? _motion : _motion.concat(_shuffle.shuffle().slice(0, MMD_SA_options.motion_shuffle_pool_size-_motion_shuffle_spare.length))


    MMD_SA_options.motion_shuffle = []
    for (var i = 0, i_max = Math.min(MMD_SA_options.motion_shuffle_pool_size, MMD_SA_options.motion.length); i < i_max; i++)
      MMD_SA_options.motion_shuffle.push(i)

    // find the new motion index for "motion_shuffle_list_default"
    if (MMD_SA_options.motion_shuffle_list_default) {
      for (var k = 0, k_max = MMD_SA_options.motion_shuffle_list_default.length; k < k_max; k++) {
        var motion_index = MMD_SA_options.motion_shuffle_list_default[k]
        var m = _motion_map[motion_index]
        for (var i = 0, i_max = MMD_SA_options.motion.length; i < i_max; i++) {
          if (m == MMD_SA_options.motion[i]) {
            MMD_SA_options.motion_shuffle_list_default[k] = i
            break
          }
        }
      }
    }

    for (var k = 0, k_max = _motion_must_load.length; k < k_max; k++) {
      var motion_existed = false
      var m = _motion_must_load[k]
      for (var i = 0, i_max = MMD_SA_options.motion.length; i < i_max; i++) {
        if (m == MMD_SA_options.motion[i]) {
          motion_existed = true
          break
        }
      }

      if (!motion_existed)
        MMD_SA_options.motion.push(m)
    }
  }

  MMD_SA_options.motion_index_by_name = {};
  for (var i = 0, i_max = MMD_SA_options.motion.length; i < i_max; i++) {
    MMD_SA_options.motion_index_by_name[MMD_SA_options.motion[i].path.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "")] = i;
  }

  // backup these lists for default use, just in case they are modified later
  if (MMD_SA_options.motion_shuffle)
    MMD_SA_options._motion_shuffle = MMD_SA_options.motion_shuffle.slice(0)
  if (MMD_SA_options.motion_shuffle_list_default)
    MMD_SA_options._motion_shuffle_list_default = MMD_SA_options.motion_shuffle_list_default.slice(0)

  MMD_SA_options.motion.forEach(function (m) {
    m.path = toLocalPath(m.path)
  })

  MMD_SA.normal_action_length = MMD_SA_options.motion.length

  // Reserve a place for external motion
  MMD_SA.motion_index_for_external = MMD_SA_options.motion.length
  MMD_SA_options.motion.push({})


/*
  if (!SA_body_offsetX)
    SA_body_offsetX = 24
  if (!SA_body_offsetY)
    SA_body_offsetY = 24
*/

  if (MMD_SA_options.MMD_disabled && document.getElementById("Lchild_animation_parent")) {
    DragDrop.relay_id = 0
  }

  self.EV_init = function () {
if (MMD_SA.initialized) {
// resize
//use_solid_bg
  const fullscreen = (!is_SA_child_animation || is_SA_child_animation_host) && Settings.CSSTransformFullscreen && (SA_fullscreen_stretch_to_cover || returnBoolean("AutoItStayOnDesktop"));
  let w, h;
  if (fullscreen) {
    w = EV_width  = screen.availWidth
    h = EV_height = screen.availHeight
  }
  else {
// a trick to allow custom zoom
    const zoom = (SA_zoom != 1) ? SA_zoom : (parseFloat(Settings.CSSTransformScale) || 1);//SA_zoom;//
    w = EV_width  = Math.round(MMD_SA_options.width  * zoom)
    h = EV_height = Math.round(MMD_SA_options.height * zoom)
  }

// MMD_SA.jThree_ready finished already
  if (!MMD_SA.jThree_ready)
    MMD_SA._renderer.__resize(w,h)
/*
  if (self.ChatboxAT) {
    let zoom = Math.min(w/1280, h/720)
    document.getElementById("CB_Lwindow0").style.transform = (zoom >= 1) ? "" : "scale(" + zoom + ")";
  }
*/
//DEBUG_show(SA_zoom,0,1)
  SA_zoom = 1;
}

if (MMD_SA_options.init)
  MMD_SA_options.init()
else
  MMD_SA.init()
  }

var js
var js_prefix = "v2.1.2_"
//js_prefix = ""; MMD_SA.use_jThree_v1 = true;

if (MMD_SA.use_jThree) {
//MMD_SA_options.ammo_version="2.82"
  js = [
  "jThree/jquery.min.js"
/*//  "jThree/jquery-2.1.1.min.js"*/
  ];

  if (MMD_SA_options.MMD_disabled) {}
  else if (1) {
    js.push(
//  "jThree/MMDplugin/ammo" + ((MMD_SA_options.ammo_version) ? "_v" + MMD_SA_options.ammo_version : "") + ".js",
  "jThree/MMDplugin/ammo_proxy.js"
    );
  }
/*
  else {
//MMD_SA_options.ammo_version=30
//https://github.com/kripken/ammo.js/issues/36
self.Module = { TOTAL_MEMORY:52428800*2 };
    js.push("jThree/MMDplugin/ammo" + ((MMD_SA_options.ammo_version) ? "_v" + MMD_SA_options.ammo_version : "") + ".js");
    if (MMD_SA_options.ammo_version) {
      js.push('Ammo().then(function () { MMD_SA._ammo_async_loaded_=true; console.log("Ammo.js async loaded"); if (self.jThree && jThree._ammo_async_init_) { console.log(jThree._ammo_async_init_.length); jThree._ammo_async_init_.forEach(function (func) { func() }); jThree._ammo_async_init_=[]; } else { console.log(0); }; });')
//      js.push('MMD_SA._ammo_async_loaded_=true; console.log("Ammo.js loaded");')
    }
  }
*/
  const js_min_mode = self._js_min_mode_ || (browser_native_mode && !webkit_window && !localhost_mode) || (webkit_electron_mode && !/AT_SystemAnimator_v0001\.gadget/.test(System.Gadget.path));

  if (js_min_mode) {
console.log("three.core.min.js")
    js.push(
  "jThree/three.core.min.js"
    );
  }
  else {
    js.push(
  "_private/js/XMLHttpRequestZIP.js"
 ,"js/jszip.js"

 ,"jThree/script/"+js_prefix+"jThree.js"
 ,"jThree/MMDplugin/"+js_prefix+"jThree.MMD.js"

 ,"jThree/plugin/CameraHelper.js"
 ,"jThree/plugin/jThree.XFile.js"
 ,"jThree/plugin/MODShadowMapPlugin.js"
 ,"jThree/plugin/three_mirror2.js"
 ,"jThree/plugin/"+js_prefix+"jThree.Trackball.js"
 ,"jThree/plugin/three.audio.js"

// ,"jThree/plugin/three.proton.js"

 ,"jThree/index.js"

// ,"jThree/three.ShaderParticles.js"
// ,"jThree/three.SPE.js"

  ,"js/tracking/one_euro_filter.js"
    );
  }

  var EC = MMD_SA_options.MME && MMD_SA_options.MME.PostProcessingEffects
  if (EC && EC.effects.length) {
    if (js_min_mode) {
console.log("three.core.min.effect.js")
      js.push(
  "jThree/three.core.effect.min.js"
      );
    }
    else {
      js.push(
  "jThree/plugin/three_CopyShader.js"
 ,"jThree/plugin/three_EffectComposer.js"
 ,"jThree/plugin/three_MaskPass.js"
 ,"jThree/plugin/three_RenderPass.js"
 ,"jThree/plugin/three_ShaderPass.js"
 ,"jThree/plugin/three_TexturePass.js"
// ,"jThree/plugin/three_ConvolutionShader.js"
// ,"jThree/plugin/three_BloomPass.js"
      );
    }

//threeoctree.min.js
//console.log("threeoctree.min.js")
//js.push("jThree/plugin/Octree.js")

    if (EC.use_FXAA)
      js.push("jThree/plugin/three_FXAAShader.js")

    var _effect_loaded = { CopyShader:true }
    EC.effects.forEach(function (effect) {
      if (EC.use_solid_bg)
        effect.use_solid_bg = true
      if (!_effect_loaded[effect.name]) {
js.push("jThree/plugin/three_" + effect.name + ".js")
       }
      _effect_loaded[effect.name] = true
    });
  }

  if (MMD_SA_options.shadow_darkness == null)
    MMD_SA_options.shadow_darkness = parseFloat(System.Gadget.Settings.readString('MMDShadow') || ((MMD_SA_options.use_shadowMap && 0.5)||0))
  if (MMD_SA_options.use_shadowMap == null)
    MMD_SA_options.use_shadowMap = !!MMD_SA_options.shadow_darkness
}

  if (!Array.prototype.shuffle) {
Array.prototype.shuffle = function () {
  var i = this.length, j, temp;
  if ( i == 0 ) return;
  while ( --i ) {
    j = Math.floor( Math.random() * ( i + 1 ) );
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }

  return this;
};
  }

  System._browser.translation.dictionary = {
	"MMD": {
		"start": {
			"_translation_": {
				"_default_": "Press START to begin loading.\n\n- Drop a MMD model zip<VRM>to use your own 3D model.\n- Drop a VMD/FBX motion to convert 3D to simple video file.",
				"ja": "START を押してロードを開始します。\n\n- 3Dモデルを使用するには、MMDモデルのzip<VRM>をドロップします。\n- VMD/FBXモーションをドロップして3Dをビデオファイルに変換します。",
				"zh": "按 START 開始載入程序。\n\n- 拖曳ZIP壓縮的MMD模型<VRM>作為你的3D人物。\n- 拖曳VMD/FBX動作檔案以自動轉換成簡單的影像檔案。"
			},
			"custom_model": {
				"_translation_": {
					"_default_": "Press START to begin with your custom 3D model.\n\n(Click here to reset to the default model.)",
					"ja": "START を押してカスタム 3D モデルを開始します。\n\n(ここをクリックしてデフォルトのモデルにリセットします。)",
					"zh": "按 START 以你的自訂人物模型開始載入程序。\n\n(按此重置並使用預設模型。)"
				}
			}
		}
	}
  };

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
  const import_map = {
    'imports': {
      'three': './three.js/' + MMD_SA.THREEX.three_filename,
      './libs/': './three.js/libs/',
      './curves/': './three.js/libs/',
      './math/': './three.js/',
      './postprocessing/': './three.js/postprocessing/',
      './shaders/': './three.js/shaders/',
    }
  };

  var html = [
'<script type="importmap">',
JSON.stringify(import_map),
'</scr'+'ipt>\n',
  ].join('');

  js.forEach(function (str) {
    html += (/\;/.test(str)) ? '<script>' + str + '</scr'+'ipt>\n' : '<script language="JavaScript" src="' + str + '"></scr'+'ipt>\n';
  });

  document.write(html);

  // [AUDIO REMOVED] media/audio controls removed
  document.write('<script type="text/goml"></scr'+'ipt>');
};
