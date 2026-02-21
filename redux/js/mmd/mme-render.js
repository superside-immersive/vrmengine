// mme-render.js — extracted from MMD_SA.js
// MME rendering pipeline: shuffle, render(), render_extra(), composer management

window.MMD_SA_createMMERender = function () {
return {

 MME_shuffle: function (id, e_name) {
var EC = MMD_SA_options.MME.PostProcessingEffects
if (!EC || !EC.enabled || !EC.effects.length)
  return

var id_list = []
if (id == null) {
  for (id in EC.shuffle_group)
    id_list.push(id)
}
else
  id_list.push(id)

id_list.forEach(function (id) {
  var sg = EC.shuffle_group[id]
  var sg_effect_by_name
  sg.effects.forEach(function (e) {
if (!sg_effect_by_name && e_name && (e.name == e_name))
  sg_effect_by_name = true
EC._effects[e.name].enabled = false
  });

  var e
  if (sg_effect_by_name) {
    e = EC._effects[e_name]
  } else {
    if (sg.shuffle_list_index == null)
      sg.shuffle_list_index = -1
    if (!sg.shuffle_list || (++sg.shuffle_list_index >= sg.shuffle_list.length)) {
      var list = []
      for (var i = 0, i_max = sg.effects.length; i < i_max; i++)
        list.push(i)
      sg.shuffle_list = list.shuffle()
      sg.shuffle_list_index = 0
    }
    e = EC._effects[sg.effects[sg.shuffle_list[sg.shuffle_list_index]].name]
  }

  e.enabled = true
});

this.MME_set_renderToScreen()

this.MME_check_mipmap_render_target()
  }

 ,MME_set_renderToScreen: function () {
var EC = MMD_SA_options.MME.PostProcessingEffects
if (!EC || !EC.enabled || !EC.effects.length)
  return

EC.effects.forEach(function (e) {
  e.obj.renderToScreen = false
});

for (var i = EC.effects.length-1; i >= 0; i--) {
  var e_obj = EC.effects[i].obj
  if (e_obj.enabled) {
    e_obj.renderToScreen = true
    break
  }
}
  }

 ,MME_composer_disabled_check: (function () {
var check = function (c) {
  if ((c._index == 0) || !c.passes.length)
    return

  for (var i = 0, i_max = c.passes.length; i < i_max; i++) {
  if (c.passes[i]._shuffle_group_id != null) DEBUG_show(c.passes[i]._name,0,1)
    if (c.passes[i].enabled) {
      return
    }
  }

  c._disabled = true
};

return function (c) {
  check.call(this, c)
  this.MME_check_mipmap_render_target()
};
  })()

 ,_mipmap_render_target_list: []
 ,MME_check_mipmap_render_target: function () {
var EC = MMD_SA_options.MME.PostProcessingEffects
var mipmap_render_target_list = []
var changed

var effects_to_check = ["BloomPostProcess"]
effects_to_check.forEach(function (name) {
  var e = EC.effects_by_name[name]
  var c_index = -1
  if (e.obj.enabled && /SOURCE_READBUFFER(\d+)/.test(e.obj.textureID)) {
    c_index = parseInt(RegExp.$1)
    var c = EC._composers_list[c_index]
    if (c._disabled) {
      for (var i = c_index-1; i >= 0; i--) {
        if (!EC._composers_list[i]._disabled) {
          c_index = i
          break
        }
      }
    }
  }

  changed = (e._composer_index_active != c_index)
  e._composer_index_active = c_index
  mipmap_render_target_list.push({name:name, composer_index:c_index})
});

this._mipmap_render_target_list = mipmap_render_target_list
if (MMD_SA.MMD_started && EC._initialized && changed) {
  console.log("mipmap_render_target_list:")
  console.log(mipmap_render_target_list)
// trigger render target refresh
  EC._width = EC._height = 0
}

return mipmap_render_target_list
  }

 ,render: function (renderer) {

window.dispatchEvent(new CustomEvent("SA_MMD_before_render"));

if (!MMD_SA_options.MMD_disabled && MMD_SA_options.use_THREEX && MMD_SA.MMD_started) {
  const MMD_mesh0 = THREE.MMD.getModels()[0].mesh;
  const model0 = MMD_SA.THREEX.get_model(0);
//DEBUG_show(['頭', '上半身'].map(b=>model0.get_bone_position_by_MMD_name(b).distanceTo(MMD_SA._trackball_camera.object.position)).join('\n'))
  const avatar_visible_distance = MMD_SA_options.avatar_visible_distance || 3;
  if (MMD_mesh0.visible) {
    const check_list = ['頭', '上半身'].map(b=>model0.get_bone_position_by_MMD_name(b));
    check_list.push(MMD_SA.TEMP_v3.copy(check_list[check_list.length-1]).lerp(MMD_mesh0.position, 0.5));
    if (check_list.some(p=>p.distanceTo(MMD_SA._trackball_camera.object.position) < avatar_visible_distance)) {
      MMD_mesh0.visible = false;
      System._browser.on_animation_update.add(()=>{ MMD_mesh0.visible=true }, 0,0);
    }
  }
}

//if (!MMD_SA.MMD_started) return true
//var _t=performance.now()
MMD_SA._mirror_rendering_ = true
MMD_SA._THREE_mirror.forEach(function (m, idx) {
  var mirror_obj = MMD_SA.mirror_obj[idx]
  if (!mirror_obj.custom_action || !mirror_obj.custom_action(m))
    m.render()
});
MMD_SA._mirror_rendering_ = false

var _visible = {}
MMD_SA._skip_render_list.forEach(function (id) {
// jThree(id).three(0) works during loading
  var obj = (/^\#(.+)$/.test(id)) ? ((MMD_SA.MMD_started) ? MMD_SA_options.mesh_obj_by_id[RegExp.$1] : jThree(id).three(0)) : MMD_SA_options.x_object_by_name[id]
  if (obj && obj.visible) {
//DEBUG_show(id+"/"+Date.now())
    _visible[id] = true
    if (MMD_SA.MMD_started)
      obj.hide()
    else
      obj.visible = false
  }
});

var EC = MMD_SA_options.MME.PostProcessingEffects
if (EC && EC.enabled && EC.effects.length)
  this.render_extra(renderer)
else
  renderer.render( renderer.__camera.userData.scene, renderer.__camera )

for (var id in _visible) {
  var obj = (/^\#(.+)$/.test(id)) ? ((MMD_SA.MMD_started) ? MMD_SA_options.mesh_obj_by_id[RegExp.$1] : jThree(id).three(0)) : MMD_SA_options.x_object_by_name[id]
  if (obj) {
    if (MMD_SA.MMD_started)
      obj.show()
    else
      obj.visible = true
  }
}
//DEBUG_show(JSON.stringify(renderer.info.render))
//DEBUG_show(Math.round(performance.now()-_t)+'\n'+Date.now())

window.dispatchEvent(new CustomEvent("SA_MMD_after_render"));

return true
 }

 ,render_extra: function (renderer) {
var EC = MMD_SA_options.MME.PostProcessingEffects

var refresh_all_uniforms = false

if (!EC._initialized) {
refresh_all_uniforms = true

var composer, effect
//EC._composers = {}
EC._composers_list = []
//EC._render_targets = {}
EC._render_targets_list = []
EC._createRenderTarget = function (para_obj, push_render_targets_list) {
  var w, h
  if (para_obj.scale) {
     w = Math.round(this._width  * para_obj.scale)
     h = Math.round(this._height * para_obj.scale)
  }
  else {
    w = para_obj.width
    w = para_obj.height
  }
  var parameters = para_obj.para || { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false }
  var rt = new THREE.WebGLRenderTarget( w, h, parameters )
  if (para_obj.use_multisample)
    rt._use_multisample = 4
  if (push_render_targets_list) {
    EC._render_targets_list.push({ render_target:rt, para:para_obj, composer_index:para_obj.composer_index, onreload:para_obj.onreload })
  }
  return rt
}
EC._effects = {}
EC._width  = renderer.context.canvas.width
EC._height = renderer.context.canvas.height


// back ported to r58
renderer.getPixelRatio = function () { return this.devicePixelRatio; }
if (!THREE.PlaneBufferGeometry)
  THREE.PlaneBufferGeometry = THREE.PlaneGeometry
THREE.WebGLRenderTarget.prototype.setSize = function ( width, height ) {

		if ( this.width !== width || this.height !== height ) {

			this.width = width;
			this.height = height;

			this.dispose();

		}

};


// depth buffer START
EC._depthRenderTarget = new THREE.WebGLRenderTarget( EC._width, EC._height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
//EC._depthMaterial = new THREE.MeshDepthMaterial();
//EC._depthMaterial.blending = THREE.NoBlending;
// depth buffer END


composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, undefined, (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:THREE.RGBAFormat}; })() );
composer._index = 0
if (EC.use_FXAA) {
  composer.addPass( new THREE.RenderPass( renderer.__camera.userData.scene, renderer.__camera, null ) );
  EC._effects.FXAAShader = new THREE.ShaderPass(THREE.FXAAShader)
  composer.addPass(EC._effects.FXAAShader)
}
else {
  Object.defineProperty(composer, "_source_readBuffer", {
  get: function () {
if (this._buffer_written)
  return this.readBuffer
return this._source_readBuffer_
  }

 ,set: function (v) {
this._source_readBuffer_ = v
  }
  });

  var use_multisample = (!MMD_SA_options.MMD_disabled && MMD_SA.use_webgl2)
  MMD_SA.use_MSAA_FBO = use_multisample

  if (use_multisample && MMD_SA.MMD_started)
    DEBUG_show("Use MSAA FBO", 2)

  composer._source_readBuffer = EC._createRenderTarget({
    use_multisample:use_multisample

// mipmap check
   ,para: (function () { var c_index=0; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false }; })()

   ,scale:EC.SSAA_scale||((MMD_SA_options.MMD_disabled||use_multisample)?1:2)
   ,onreload:function (renderTarget_new) { EC._composers_list[0]._source_readBuffer=renderTarget_new; }
  }, true);
}

//composer.addPass( new THREE.BloomPass( 1, 15*2, 2, 512 ) );

//composer.readBuffer.premultiplyAlpha = composer.writeBuffer.premultiplyAlpha = false
/*
effect = new THREE.ShaderPass(THREE.CopyShader)
effect.renderToScreen = true;
composer.addPass( effect );
*/

var effect_count = {}
var composer_index_source_readBuffer = -1
var composer_index_source_readBuffer_USED = []
var source_readBuffer_effect0_group_id = null

for (var _e = 0, _e_length = EC.effects.length; _e < _e_length; _e++) {
  var e = EC.effects[_e]
  var name = e.name
  var index_sub
  var texture_id = undefined

  var e_source = EC.effects[_e + ((name == "EffectToNormalSize") ? -1 : 0)]
  if ((composer._source_readBuffer && (source_readBuffer_effect0_group_id == null)) || ((e_source.shuffle_group_id != null) && (e_source.shuffle_group_id == source_readBuffer_effect0_group_id))) {
  }
  else {
    composer_index_source_readBuffer = -1
    source_readBuffer_effect0_group_id = null
  }
  source_readBuffer_effect0_group_id = (e_source.shuffle_group_id != null) ? e_source.shuffle_group_id : "NOT_USED"
//  if (composer._source_readBuffer)
    composer_index_source_readBuffer = composer._index


  if (/^(BloomPostProcess|ChildAnimation|DiffusionX|JustSnow|SAOShader)$/.test(name) || e.create_composer) {
    composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, undefined, (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:THREE.RGBAFormat}; })() );
    composer._index = EC._composers_list.length-1

Object.defineProperty(composer, "_source_readBuffer", {
  get: function () {
    if (this._buffer_written)//(this.passes[0].enabled)
      return this.readBuffer

var composer_last_active_index = 0
for (var i = this._index-1; i >= 0; i--) {
  if (!EC._composers_list[i]._disabled) {
    composer_last_active_index = i
    break
  }
}
var c = EC._composers_list[composer_last_active_index]
return c._source_readBuffer || c.readBuffer
  }
});
  }
  else if (name == "EffectToNormalSize") {
    if (!e_source.scale)
      continue

    composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, undefined, (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:THREE.RGBAFormat}; })() );
    composer._index = EC._composers_list.length-1
//    texture_id = "MANUAL_ASSIGN"

    if (EC._composers_list[composer._index-1]._disabled)
      composer._disabled = true
  }
  else if (e.scale) {
    composer = EC._composers_list[EC._composers_list.length] = new THREE.EffectComposer( renderer, EC._createRenderTarget({ scale:e.scale, composer_index:EC._composers_list.length }, true), (function () { var c_index=EC._composers_list.length; return {get minFilter() { var use_mipmap=(MMD_SA._mipmap_render_target_list.some(function(r){return r.composer_index==c_index})); if (use_mipmap) { console.log("MIPMAP render target:"+c_index); return THREE.LinearMipMapLinearFilter; } else { return THREE.LinearFilter;}; }, format:null}; })() );
    composer._index = EC._composers_list.length-1
    texture_id = "MANUAL_ASSIGN"
  }

  if (!texture_id && (composer_index_source_readBuffer != -1)) {
    texture_id = "SOURCE_READBUFFER" + composer_index_source_readBuffer
    composer_index_source_readBuffer_USED[composer_index_source_readBuffer] = true
  }

  index_sub = effect_count[name] = effect_count[name] || 0
  if (index_sub)
    name += index_sub
  effect_count[name]++

  if (name == "BloomPass") {
    effect = e.obj = EC._effects[name] = new THREE.BloomPass(1*1.5, 15*2, 0.25, 512*2)
    effect.textureID = texture_id
//console.log(effect)
  }
  else
    effect = e.obj = EC._effects[name] = new THREE.ShaderPass(THREE[name], texture_id)

  effect._composer_index = composer._index
  effect._index_sub = index_sub
  effect._index = _e
  effect._name = name

  if (_e == _e_length-1)
    effect.renderToScreen = true
  composer.addPass(effect)

  effect._enabled = !!e.enabled || (e.enabled == null)
console.log(name+'/'+texture_id+'/'+effect._enabled)
  if (e.scale) {
    Object.defineProperty(effect, "enabled",
{
  get: function () {
return this._enabled
  }

 ,set: function (v) {
this._enabled = v

EC._composers_list[this._composer_index]._disabled = !v
if (EC._composers_list[this._composer_index+1])
  EC._composers_list[this._composer_index+1]._disabled = !v
  }
});
  }
  else {
    Object.defineProperty(effect, "enabled",
{
  get: function () {
return this._enabled && !EC._composers_list[this._composer_index]._disabled
  }

 ,set: function (v) {
this._enabled = v

if (v)
  EC._composers_list[this._composer_index]._disabled = false
  }
});
  }
  effect.enabled = !!effect._enabled

  if (e.shuffle_group_id != null) {
    effect.enabled = false
  }
}

EC._composers_list.forEach(function (c) {
  MMD_SA.MME_composer_disabled_check(c)
});

MMD_SA.MME_shuffle();

this.MME_check_mipmap_render_target().forEach(function (r) {
  if (r.composer_index == -1)
    return

  var c = EC._composers_list[r.composer_index]
  if (r.composer_index == 0) {
    c._source_readBuffer.minFilter = THREE.LinearMipMapLinearFilter
  }
  else {
    c.readBuffer.minFilter  = THREE.LinearMipMapLinearFilter
    c.writeBuffer.minFilter = THREE.LinearMipMapLinearFilter
  }
  console.log("Startup MIPMAP render target:"+r.composer_index)
});

// put it at the end to avoid unnecessary render target refresh during .MME_check_mipmap_render_target()
EC._initialized = true
}


var w = renderer.context.canvas.width
var h = renderer.context.canvas.height
if ((EC._width != w) || (EC._height != h)) {
  EC._width  = w
  EC._height = h

  refresh_all_uniforms = true

EC._depthRenderTarget.dispose()
EC._depthRenderTarget = new THREE.WebGLRenderTarget( EC._width, EC._height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
//EC._depthMaterial = new THREE.MeshDepthMaterial();
//EC._depthMaterial.blending = THREE.NoBlending;

  EC._render_targets_list.forEach(function (obj) {
    var rt = EC._createRenderTarget(obj.para)
    if (obj.composer_index != null) {
      EC._composers_list[obj.composer_index]._render_target_new = rt
    }
    else
      obj.render_target.dispose()
    obj.render_target = rt
  });

  EC._composers_list.forEach(function (c) {
    c.reset(c._render_target_new)
    c._render_target_new = undefined
  });

  EC._render_targets_list.forEach(function (obj) {
    if (obj.onreload)
      obj.onreload(obj.render_target)
  });

// to make sure that MMD_SA._trackball_camera has already been defined
  MMD_SA._trackball_camera && MMD_SA._trackball_camera.resize()

  DEBUG_show("(viewport resized)", 2)
}

for (var e_name in EC._effects) {
  THREE[e_name] && THREE[e_name]._refreshUniforms && THREE[e_name]._refreshUniforms(refresh_all_uniforms, EC._effects[e_name]._index_sub)
}


/*
var oldClearColor = renderer.getClearColor()
var oldClearAlpha = renderer.getClearAlpha()
renderer.setClearColor( oldClearColor, oldClearAlpha );
renderer.setClearColor( new THREE.Color("#008"), 0 );
*/


//MMD_SA._depth_render_mode_ = 1
if (!EC.use_FXAA) {
// Skip rendering after first one doesn't seem to help reduce GPU usage (maybe there is actually nothing rendered when the scene is empty), so comment out for now.
//  if (!MMD_SA_options.MMD_disabled || !EC._render_targets_list[0]._rendered) {
    renderer.render( renderer.__camera.userData.scene, renderer.__camera, EC._render_targets_list[0].render_target, true )
//    EC._render_targets_list[0]._rendered = true
//  }
}
//MMD_SA._depth_render_mode_ = 0

//return true


if (EC.use_SAO) {
  MMD_SA._depth_render_mode_ = 1
/*
var oldClearColor = renderer.getClearColor()
var oldClearAlpha = renderer.getClearAlpha()
renderer.setClearColor( new THREE.Color("#FFF"), 1 );
renderer.clearTarget(EC._depthRenderTarget)
renderer.autoClear = false
*/
/*
if (!self._depthMaterial_) {
		var depthShader = THREE.ShaderLib[ "depthRGBA" ];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
console.log(depthUniforms)
let _depthMaterial = self._depthMaterial_ =
//		_depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
//		_depthMaterialMorph = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true } );
//		_depthMaterialSkin = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, skinning: true } );
		_depthMaterialMorphSkin = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true, skinning: true } );

		_depthMaterial._shadowPass = true;
}
*/
//renderer.__camera.userData.scene.overrideMaterial = self._depthMaterial_
  renderer.render( renderer.__camera.userData.scene, renderer.__camera, EC._depthRenderTarget, true );
//renderer.__camera.userData.scene.overrideMaterial = null
/*
renderer.autoClear = true
renderer.setClearColor( oldClearColor, oldClearAlpha );
*/
  MMD_SA._depth_render_mode_ = 0
}


EC._composers_list.forEach(function (c) {
  c._buffer_written = false
  if (!c._disabled)
    c.render()
});

return true
  }

};
};
