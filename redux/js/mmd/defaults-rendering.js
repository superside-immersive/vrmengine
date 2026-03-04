// Rendering defaults: PPE effects, shadows, lighting
// Extracted from defaults.js — called by MMD_SA_initDefaults()

window.MMD_SA_initDefaults_rendering = function () {
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

  const PPE = MMD_SA_options.MME.PostProcessingEffects = MMD_SA_options.MME.PostProcessingEffects || { enabled:false }
  PPE.enabled = false
  PPE.use_SAO = false
  PPE.use_Diffusion = false
  PPE.use_BloomPostProcess = false

  PPE.effects_by_name = {}
  if (!PPE.shuffle_group)
    PPE.shuffle_group = {}
  if (!PPE.effects)
    PPE.effects = []
  if (!PPE.SeriousShader_OverBright_adjust)
    PPE.SeriousShader_OverBright_adjust = MMD_SA_options.SeriousShader_OverBright_adjust || 0.05

  if (!PPE.effects.some(function (e) { return e.name=="SAOShader" })) {
    const _enabled = false
    PPE.effects.unshift(
  { name:"SAOShader", enabled:_enabled }
, { name:"DepthLimitedBlurShaderV", enabled:_enabled }
, { name:"DepthLimitedBlurShaderH", enabled:_enabled }
    );

    if (_enabled)
      MMD_SA_options.SeriousShader_OverBright_adjust = PPE.SeriousShader_OverBright_adjust
  }

  if (!PPE.effects.some(function (e) { return e.name=="DiffusionX" })) {
    const _enabled = PPE.use_Diffusion ? [1,1,0] : [0,0,((PPE.effects.some(function (e) { return e.name=="BloomPass" }))?0:1)]
    PPE.effects.push(
  { name:"DiffusionX", enabled:_enabled[0] }
 ,{ name:"DiffusionY", enabled:_enabled[1] }
 ,{ name:"CopyShader", enabled:_enabled[2] }
    );
  }

  if (!PPE.effects.some(function (e) { return e.name=="BloomPostProcess" })) {
    const _enabled = false
    const difusionX_index = PPE.effects.findIndex(function (e) { return e.name=="DiffusionX" })
    PPE.effects = PPE.effects.slice(0, difusionX_index).concat({ name:"BloomPostProcess", enabled:_enabled, blur_size:0.5, threshold:0.5, intensity:0.5 }, PPE.effects.slice(difusionX_index))
  }

  PPE.effects.forEach(function (effect) {
    effect.enabled = !!effect.enabled || (effect.enabled == null)

    // temp dummy
    effect.obj = effect

    PPE.effects_by_name[effect.name] = effect
    effect._EV_usage_PROCESS = MMD_SA_options.MME._EV_usage_PROCESS
    if (effect.shuffle_group_id != null) {
      let sg = PPE.shuffle_group[effect.shuffle_group_id]
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

const SAO = []
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

const Diffusion = []
Diffusion[0] = this._effects["DiffusionX"]
if (!Diffusion[0])
  return

Diffusion[1] = this._effects["DiffusionY"]
Diffusion[2] = ((Diffusion[1]._index+1 < this.effects.length) && (this.effects[Diffusion[1]._index+1].name == "CopyShader")) ? this.effects[Diffusion[1]._index+1].obj : {}

const _enabled = (v) ? [1,1,0] : [0,0,1]

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
let light_pos = JSON.parse(System.Gadget.Settings.readString("MMDLightPosition") || "null") || MMD_SA_options.model_para_obj.light_position || MMD_SA_options._light_position
light_pos = light_pos.slice()
for (let i = 0; i < 3; i++)
  light_pos[i] *= MMD_SA_options.light_position_scale

return light_pos
  }
 ,set: function (pos) { this._light_position = pos; }
});
};
