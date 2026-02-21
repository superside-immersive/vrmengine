/**
 * ShadowMap toggling, VMD Spectrum, MME init — extracted from MMD_SA.js (R3).
 * Returns properties merged into MMD_SA via Object.assign.
 */
window.MMD_SA_createShadowmapSpectrum = function() {
  return {

  VMDSpectrum_EV_usage_PROCESS: function (obj, u, decay_factor) {
u /= 100
if (use_full_fps)
  decay_factor *= ((RAF_animation_frame_unlimited)?1:2)/EV_sync_update.count_to_10fps_

// decay control
if (Settings.ReverseAnimation) {
  if (u - decay_factor > obj.u_last)
    u = obj.u_last + decay_factor
}
else {
  if (u + decay_factor < obj.u_last)
    u = obj.u_last - decay_factor
}
obj.u_last = u

return u// * 100
  }

 ,VMDSpectrum_process: function (model, model_para) {
if (!model_para.VMDSpectrum_initialized) {
  model_para.VMDSpectrum_initialized = true

  if (!model_para.VMDSpectrum_band) {
    model_para.VMDSpectrum_band = []
    for (var m_name in model_para.morph_default) {
      if (/^band(\d+)$/.test(m_name))
        model_para.VMDSpectrum_band.push(parseInt(RegExp.$1))
    }
  }
  model_para._VMDSpectrum_decay = []
  model_para.VMDSpectrum_band.forEach(function (b) {
    model_para._VMDSpectrum_decay.push({})
  });
}

if (!MMD_SA.music_mode)
  return

model_para._custom_morph = []
model_para.VMDSpectrum_band.forEach(function (i, idx) {
  var v = 0
  model_para.VMDSpectrum_band16_to_band[i-1].forEach(function (band) {
    v += EV_usage_sub.sound_raw[band].usage_raw
  });
  var weight = MMD_SA.VMDSpectrum_EV_usage_PROCESS(model_para._VMDSpectrum_decay[idx], Math.min(v/model_para.VMDSpectrum_band16_to_band[i-1].length,100), 0.2)

  var m_name = "band" + i
  var _m_idx = model.pmx.morphs_index_by_name[m_name]
  var _m = model.pmx.morphs[_m_idx]
  model_para._custom_morph.push({ key:{ name:m_name, weight:weight, morph_type:_m.type, morph_index:_m_idx }, idx:model.morph.target_index_by_name[m_name] })
});
  }

// shadowMap
 ,toggle_shadowMap: function (enabled) {
if (enabled == null)
  enabled = MMD_SA_options.use_shadowMap
else
  MMD_SA_options.use_shadowMap = enabled

enabled = !!enabled

var renderer = MMD_SA.renderer
renderer.shadowMapAutoUpdate = enabled;

//					renderer.shadowMapEnabled = true;
					//renderer.shadowMapType = THREE.BasicShadowMap;
					//renderer.shadowMapType = THREE.PCFShadowMap;
//					renderer.shadowMapType = THREE.PCFSoftShadowMap;
					//renderer.shadowMapCullFace = THREE.CullFaceBack;
//					renderer.shadowMapDebug = true;
// AT: cascaded shadow map
renderer.shadowMapCascade = MMD_SA_options.shadow_para.use_cascaded_shadow_map
//renderer.shadowMapDebug = true;

// http://learningthreejs.com/blog/2012/01/20/casting-shadows/
//var light_id = "#MMD_DirLight"//"#light_spo" //
//var light = jThree(light_id).three( 0 );

// http://www20.atpages.jp/katwat/three.js_r58/examples/mytest34/menu.html
// var lightParam = {length:40, angle:-30/180*Math.PI},

for (var i = 1, i_max = MMD_SA.light_list.length; i < i_max; i++) {
  var light = MMD_SA.light_list[i].obj
  if (light instanceof THREE.PointLight)
    continue

  light.castShadow = enabled;
  if (enabled && renderer.shadowMapCascade) {
    light.shadowCascade = true
    console.log("Use cascaded shadow map")
  }
//light.onlyShadow = true;
  for (var p in MMD_SA_options.shadow_para)
    light[p] = MMD_SA_options.shadow_para[p]
//light.shadowCameraVisible = true; // for debug

//setTimeout(function(){console.log(light)}, 3000)
}

THREE.MMD.getModels().forEach(function (model, idx) {
  var mesh = model.mesh

  var model_para = MMD_SA_options.model_para_obj_all[idx];
  var material_para = (model_para.material_para && model_para.material_para._default_) || {};

  var cs = !!mesh.castShadow
  var rs = !!mesh.receiveShadow
  mesh.castShadow    = enabled && ((material_para.castShadow != null)    ? !!material_para.castShadow : true);
  mesh.receiveShadow = enabled && ((material_para.receiveShadow != null) ? !!material_para.receiveShadow : model_para.is_object || !MMD_SA_options.ground_shadow_only);

  if (/*(cs != mesh.castShadow) || */(rs != mesh.receiveShadow)) {
    mesh.material.materials.forEach(function(m) {
      m.needsUpdate = true;
    });
  }
});

MMD_SA_options.x_object.forEach(function (x_object, idx) {
  var obj = x_object._obj
  var mesh = ((obj.children.length==1) && (obj.children[0].children.length==0) && obj.children[0]) || obj;

  var cs = !!mesh.castShadow
  var rs = !!mesh.receiveShadow
  obj.castShadow    = mesh.castShadow    = enabled && !!x_object.castShadow;
  obj.receiveShadow = mesh.receiveShadow = enabled && !!x_object.receiveShadow;

  if (/*(cs != mesh.castShadow) || */(rs != mesh.receiveShadow)) {
    mesh.material.materials.forEach(function (m) {
      m.needsUpdate = true;
    });
  }
});

window.dispatchEvent(new CustomEvent("SA_MMD_toggle_shadowMap"));

  }

 ,light_list: []

 ,MME_init: function () {
var MME_saved = MMD_SA_options.MME_saved[MMD_SA_options.model_para_obj._filename] || MMD_SA_options.MME_saved[MMD_SA_options.model_para_obj._filename_cleaned]
if (MME_saved) {
  MMD_SA_options.MME.self_overlay = Object.clone(MME_saved.self_overlay)
  MMD_SA_options.MME.HDR = Object.clone(MME_saved.HDR)
  MMD_SA_options.MME.serious_shader = Object.clone(MME_saved.serious_shader)
  MMD_SA_options.MME.SAO = Object.clone(MME_saved.SAO)
}

MMD_SA_options.MME.self_overlay = MMD_SA_options.MME.self_overlay || { enabled:false }
MMD_SA_options.MME.HDR = MMD_SA_options.MME.HDR || { enabled:false }
MMD_SA_options.MME.serious_shader = MMD_SA_options.MME.serious_shader || { enabled:false }
MMD_SA_options.MME.SAO = MMD_SA_options.MME.SAO || { disabled_by_material:[] }

MMD_SA_options.MME._self_overlay = Object.clone(MMD_SA_options.MME.self_overlay)
MMD_SA_options.MME._HDR = Object.clone(MMD_SA_options.MME.HDR)
MMD_SA_options.MME._serious_shader = Object.clone(MMD_SA_options.MME.serious_shader)
MMD_SA_options.MME._SAO = Object.clone(MMD_SA_options.MME.SAO)
//console.log(MMD_SA_options.MME)
  }

  };
};
