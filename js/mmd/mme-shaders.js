// mme-shaders.js — extracted from MMD_SA.js
// MME PostProcessing Effects: scale getter, init, refresh uniforms, main shader generation
// MME shader effects: self_overlay, HDR, serious_shader
// 2D shaders, GOML strings

window.MMD_SA_createMMEShaders = function () {
return {

 MME_PPE_scale_getter: function (w, h) {
// return a non-zero dummy value (0.5) when MMD_SA has not been initialized
var v = (MMD_SA.initialized) ? Math.min((w * h) / (SL.width * SL.height), 1) : 0.5
//setTimeout('DEBUG_show("' + (v+'/'+SL.width +"x"+ SL.height) + '",0,1)', 1000)
return v
  }

 ,MME_PPE_init: function (effect_name, tex_list, para) {
var EC = MMD_SA_options.MME.PostProcessingEffects
if (!EC._texture_common)
  EC._texture_common = {}

this._texture_list = tex_list || []

if ((this._texture_list.indexOf('[music canvas]') != -1) && !EC._music_canvas) {
  EC._music_canvas = document.createElement("canvas")
  EC._music_canvas.width  = 512
  EC._music_canvas.height = 2
}

this._texture_list.forEach(function (src) {
  var src_para = src.split("|")
  src = src_para[0]
  var filename = src.replace(/^.+[\/\\]/, "")
//console.log(filename+'/'+src)
  if (filename == '[music canvas]') {
    if (!EC._texture_common[filename]) {
      var mc = EC._texture_common[filename] = new THREE.Texture(EC._music_canvas)
      mc.generateMipmaps = false
      mc.minFilter = mc.magFilter
      mc.needsUpdate = true
    }
  }
  else {
    var _src
    if (src_para.length==1) {
      _src = toFileProtocol(src)
    }
    else {
      if (/^(.+\_)0(\.\w{3,4})$/.test(src)) {
        _src = []
        var re1 = RegExp.$1
        var re2 = RegExp.$2
        for (var i = 0; i < 6; i++)
          _src.push(toFileProtocol(re1 + i + re2))
//console.log(_src)
      }
    }

    EC._texture_common[filename] = EC._texture_common[filename] || THREE.ImageUtils[(src_para.length==1) ? "loadTexture" : "loadTextureCube"](_src, undefined, function (tex) { tex.needsUpdate=true });
    EC._texture_common[filename].wrapS = EC._texture_common[filename].wrapT = THREE.RepeatWrapping;
  }
});

var u_para = {'iResolution':{}, 'iGlobalTime':{}}
if (para) {
  for (var u_name in para)
    u_para[u_name] = para[u_name]
}

var u = this.uniforms

u["tDiffuse"] = { type: "t", value: null }
u["SA_idle"] =  { type: "i", value: 0 }
u["SA_idle_hidden"] =  { type: "i", value: 0 }
if (u_para["iResolution"])
  u["iResolution"] =  { type: "v3", value: new THREE.Vector3(640,480,1) }
if (u_para["iGlobalTime"])
  u["iGlobalTime"] =  { type: "f", value: 0 }
if (u_para["ST_opacity"])
  u["ST_opacity"] =  { type: "f", value: 0 }

for (var i = 0, i_max = this._texture_list.length; i < i_max; i++) {
  u["iChannel" + i] = { type: "t", value: null }
}

var fs_uniforms = [
		"varying vec2 vUv;",
"uniform sampler2D tDiffuse;",
((u_para["iResolution"]) ? "uniform vec3 iResolution;"  : ""),
((u_para["iGlobalTime"]) ? "uniform float iGlobalTime;" : ""),
"uniform bool SA_idle;",
"uniform bool SA_idle_hidden;"
];

this._texture_list.forEach(function (src, i) {
  fs_uniforms.push("uniform " + ((src.split("|").length==1) ? "sampler2D" : "samplerCube") + " iChannel" + i + ";")
});

if (u_para.ST_opacity) {
  fs_uniforms.push("uniform float ST_opacity;")
}

if (/^(AbstractCorridor|Cubescape|FractalCondos|FunkyDiscoBall|RemnantX|Ribbons|SubterraneanFlyThrough)$/.test(effect_name)) {
  fs_uniforms.push('#define SOLID_BG')
}
else if (WallpaperEngine_CEF_mode) {
  if (!returnBoolean("SA_Shadertoy_transparent"))
    fs_uniforms.push('#define SOLID_BG')
}
else if (EC.use_solid_bg || (EC.effects_by_name[effect_name] && EC.effects_by_name[effect_name].use_solid_bg) || ((EC.use_solid_bg == null) && !MMD_SA_options.MMD_disabled && returnBoolean("CSSTransformFullscreen") && (returnBoolean("AutoItStayOnDesktop") || returnBoolean("DisableTransparency")))) {
  fs_uniforms.push('#define SOLID_BG')
}

this.fragmentShader = fs_uniforms.join("\n") + "\n" + this.fragmentShader
  }

 ,MME_PPE_refreshUniforms: function (effect_name, refresh_all_uniforms, para) {
var EC = MMD_SA_options.MME.PostProcessingEffects
var e = EC._effects[effect_name]

var u_para = {'iResolution':{}, 'iGlobalTime':{}}
if (para) {
  for (var u_name in para)
    u_para[u_name] = para[u_name]
}

if (refresh_all_uniforms) {
  if (u_para['iResolution'])
    e.uniforms[ 'iResolution' ].value = new THREE.Vector3(EC._width, EC._height, 1);

  this._texture_list.forEach(function (src, idx) {
    var filename = src.split("|")[0].replace(/^.+[\/\\]/, "")
    e.uniforms[ 'iChannel' + idx ].value = EC._texture_common[filename]
  });
}

var idle_effect_disabled = EC.effects_by_name[effect_name] && EC.effects_by_name[effect_name].idle_effect_disabled
e.uniforms[ 'SA_idle' ].value = (MMD_SA.music_mode) ? 0 : 1
if (EC.idle_effect_disabled || ((EC.idle_effect_disabled !== false) && (idle_effect_disabled || ((idle_effect_disabled == null) && /^(AbstractMusic|Adrenaline|AmbilightVisualization2|AudioEQCircles|AudioSurfII|DancingDots|EmbellishedAV|Ribbons)$/.test(effect_name))))) {
  e.uniforms[ 'SA_idle_hidden' ].value = e.uniforms[ 'SA_idle' ].value
}

if (u_para['iGlobalTime']) {
  e.uniforms[ 'iGlobalTime' ].value = performance.now()/1000 * (u_para['iGlobalTime'].scale||1) + (u_para['iGlobalTime'].base||0);
}

if (u_para['ST_opacity']) {
  var w_beat = (MMD_SA_options.MMD_disabled && (DragDrop.relay_id != null)) ? document.getElementById("Ichild_animation" + DragDrop.relay_id).contentWindow : self
  var beat = (w_beat.EV_usage_sub && w_beat.EV_usage_sub.BD) ? w_beat.EV_usage_sub.BD.beat : 0

  var beat_pow = u_para['ST_opacity'].pow || 1
  var beat_decay = u_para['ST_opacity'].decay || 0.2
  var beat_min = (u_para['ST_opacity'].min == null) ? 0.25 : u_para['ST_opacity'].min
  var beat_max = u_para['ST_opacity'].max || 1-beat_min
  var beat_idle = (u_para['ST_opacity'].idle == null) ? 1 : u_para['ST_opacity'].idle

  e.uniforms[ 'ST_opacity' ].value = (!MMD_SA.music_mode && (!MMD_SA_options.MMD_disabled || !(self.AudioFFT && AudioFFT.use_live_input)) && beat_idle) || beat_min + Math.pow(EC.effects_by_name[effect_name]._EV_usage_PROCESS(beat, beat_decay), beat_pow) * beat_max
}
  }

 ,MME_PPE_main: function (effect_name) {
var PPE = MMD_SA_options.MME.PostProcessingEffects || { effects_by_name:{} }
var PPE_by_name = PPE.effects_by_name[effect_name] || {}

var fg_opacity = 0.8
var effect_opacity = 1.0
var shader_color_adjust_pre = []
var shader_color_adjust_post = []
var use_simple_blending = false
var effect_on_top = false

var bg_blackhole_opacity  = 0.8
var feather_width = 0.25

var is_render_target = PPE_by_name.scale || PPE_by_name.is_render_target

switch (effect_name) {
  case "JustSnow":
    effect_on_top = true
    bg_blackhole_opacity = 0
    break
  case "AudioEQCircles":
    feather_width *= 0.5
  case "AbstractMusic":
  case "AudioSurfII":
  case "EmbellishedAV":
    effect_opacity = 0.8
  case "AudioSurfIII":
  case "NoiseAnimationFlow":
  case "NoiseAnimationElectric":
    bg_blackhole_opacity = 0
    break
  case "GalaxyOfUniverses":
//    bg_blackhole_opacity = 0.5
    shader_color_adjust_post = [
//(color.r + color.g + color.b) / 3.0
//color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722
'color.rgb = mix(vec3((color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722) * 0.5), color.rgb, ST_opacity);'
    ];
    break
  case "DeformReliefTunnel":
    bg_blackhole_opacity = 0
  case "AbstractCorridor":
  case "Cubescape":
  case "FractalCondos":
  case "RemnantX":
  case "SubterraneanFlyThrough":
  case "FunkyDiscoBall":
    fg_opacity = 0.9
  case "NV15SpaceCurvature":
    use_simple_blending = true
    break
/*
  case "BloomPostProcess":
    is_render_target = true
    feather_width = 0
    bg_blackhole_opacity = 0
    break
*/
}

if (PPE_by_name.fg_opacity)
  fg_opacity = PPE_by_name.fg_opacity

var fullscreen = returnBoolean("CSSTransformFullscreen") && returnBoolean("AutoItStayOnDesktop")
//console.log(fullscreen)
bg_blackhole_opacity = (PPE_by_name.bg_blackhole_opacity==0 || (PPE.bg_blackhole_opacity==0 && !PPE_by_name.bg_blackhole_opacity) || fullscreen) ? 0 : bg_blackhole_opacity
feather_width = (PPE_by_name.feather_width==0 || (PPE.feather_width==0 && !PPE_by_name.feather_width) || fullscreen) ? 0 : (PPE_by_name.feather_width || PPE.feather_width || feather_width)

var toFloat = MMD_SA_options.MME._toFloat

var shader_feather = [
'vec2 xy = vUv - vec2(0.5, 0.5);',
'float len = length(xy);'
];

if (feather_width) {
  shader_feather.push(
'#ifndef SOLID_BG',
'if (len > 0.0) {',
'  float scale = 0.5 / max(abs(xy.x), abs(xy.y));',
'  xy *= scale;',
'  float len_max = length(xy);',
'  color.a *= smoothstep(len_max,len_max * ' + toFloat(1-feather_width) + ', len);',
'}',
'#endif'
  );
} 

var shader_bg_blackhole = []
if (bg_blackhole_opacity) {
  shader_bg_blackhole.push(
'#ifndef SOLID_BG',
'float bg_a = smoothstep(1.0,0.5, clamp(len * 2.0, 0.0,1.0)) * ' + toFloat((is_render_target) ? Math.pow(bg_blackhole_opacity, 0.5) : bg_blackhole_opacity) + ';',//toFloat((is_render_target) ? bg_blackhole_opacity : Math.pow(bg_blackhole_opacity, 0.5)) + ';',
'if (bg_a > 0.0) {',

//(gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0
//(max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)) + min(gl_FragColor.r, min(gl_FragColor.g, gl_FragColor.b))) / 2.0
//gl_FragColor.r*0.2126 + gl_FragColor.g*0.7152 + gl_FragColor.b*0.0722
//vec3(0.0), gl_FragColor.rgb, gl_FragColor.a + (1.0-gl_FragColor.a) * (1.0-pow(bg_a,0.5))
//mix(vec3(), vec3(0.0), bg_a), gl_FragColor.rgb, gl_FragColor.a

'  gl_FragColor = vec4(mix(vec3(0.0), gl_FragColor.rgb, gl_FragColor.a + (1.0-gl_FragColor.a) * (1.0-pow(bg_a,1.0/2.718281828459))), bg_a + (1.0-bg_a) * gl_FragColor.a);',//bg_a + (1.0-bg_a) * ' + ((is_render_target) ? 'gl_FragColor.a' : 'pow(gl_FragColor.a, 0.5)') + ');',

//'  gl_FragColor = vec4(mix(vec3(0.0), gl_FragColor.rgb, gl_FragColor.a), max(bg_a, gl_FragColor.a));',
'}',
'#endif'
  );
}
//else
if (!is_render_target) {
  shader_bg_blackhole.push(
'gl_FragColor.a = pow(gl_FragColor.a, 0.5);'
  );
}

var shader = [
'vec4 texel = texture2D( tDiffuse, vUv );',

'if (SA_idle_hidden) { gl_FragColor = vec4(texel.rgb, pow(texel.a, 0.5)); return; }',

'vec4 color;',
'vec2 coord = vec2(0.5) + (vUv * (iResolution.xy - vec2(1.0)));',
'mainImage(color, coord);'
];

if (is_render_target) {
  shader.push(
shader_feather.join("\n"),

'#ifdef SOLID_BG',
//'  gl_FragColor = color;',
'  gl_FragColor = vec4(mix(vec3(0.0),color.rgb,color.a), 1.0);',
'#else',
'  gl_FragColor = color;',
'#endif',

shader_bg_blackhole.join("\n")
  );
}
else {
  shader.push(
//http://entropymine.com/imageworsener/grayscale/
//http://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
//https://en.wikipedia.org/wiki/Luma_%28video%29
//The formula for luminosity is 0.2126×Red + 0.7152×Green + 0.0722×Blue
//'color.a = (color.r + color.g + color.b) / 3.0;',
'color.rgb = clamp(color.rgb, 0.0,1.0);',

((PPE_by_name.opacity < 1) ? 'color.a *= ' + toFloat(PPE_by_name.opacity) + ';' : ''),

shader_color_adjust_pre.join("\n"),

'#ifdef SOLID_BG',

shader_color_adjust_post.join("\n"),

'gl_FragColor = vec4(texel.rgb + color.rgb * (1.0 - texel.a * ' + toFloat(fg_opacity) + '), 1.0);',
'#else',

shader_feather.join("\n")
  );

  if (use_simple_blending) {
    shader.push(
shader_color_adjust_post.join("\n"),
'gl_FragColor = vec4(texel.rgb + color.rgb * (1.0 - texel.a * ' + toFloat(fg_opacity) + '), texel.a + color.a * (1.0 - texel.a));'
    );
  }
  else {
    shader.push(
'float c_max = max(color.r, max(color.g, color.b));',

'if (c_max > 0.001) {',
'  color.rgb *= 1.0/c_max;',
'  color.a *= c_max * ' + toFloat(effect_opacity) + ';',
'}',
'else { color.a = 0.0; }',

shader_color_adjust_post.join("\n")
    );

    if (effect_on_top) {
      shader.push(
'gl_FragColor = vec4(mix(texel.rgb, color.rgb, color.a), texel.a + color.a * (1.0 - texel.a));'
      );
    }
    else {
      shader.push(
'float color_a = pow(color.a * (1.0 - texel.a*0.8), texel.a * 1.0/max(1.0+(color.a-texel.a), 0.001));',
'gl_FragColor = vec4(texel.rgb * clamp(texel.a * 1.5 / max(color_a, 0.001), 0.0,1.0) + color.rgb * color_a, texel.a + color.a * (1.0 - texel.a));'
      );
    }
  }

  shader.push(
shader_bg_blackhole.join("\n"),

'#endif'
  );
}
//console.log(shader.join("\n"))

return shader.join("\n")
  }

 ,vshader_2d:
  'attribute vec2 a_position;\n'
+ 'attribute vec2 a_texCoord;\n'
+ 'uniform vec2 u_resolution;\n'
+ 'varying vec2 v_texCoord;\n'
+ 'void main() {\n'
+ '  // convert the rectangle from pixels to 0.0 to 1.0\n'
+ '  vec2 zeroToOne = a_position / u_resolution;\n'
+ '  // convert from 0->1 to 0->2\n'
+ '  vec2 zeroToTwo = zeroToOne * 2.0;\n'
+ '  // convert from 0->2 to -1->+1 (clipspace)\n'
+ '  vec2 clipSpace = zeroToTwo - 1.0;\n'
+ '  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n'
+ '  // pass the texCoord to the fragment shader\n'
+ '  // The GPU will interpolate this value between points.\n'
+ '  v_texCoord = a_texCoord;\n'
+ '}\n'

 ,fshader_2d:
  'precision mediump float;\n'
+ '// our texture\n'
+ 'uniform sampler2D u_image;\n'
+ 'uniform float uAlpha;\n'
+ '// the texCoords passed in from the vertex shader.\n'
+ 'varying vec2 v_texCoord;\n'
+ 'void main() {\n'
//+ '  gl_FragColor = texture2D(u_image, v_texCoord);\n'
+ '  vec4 textureColor = texture2D(u_image, v_texCoord);\n'
+ '  gl_FragColor = vec4(textureColor.rgb, textureColor.a * uAlpha);\n'
+ '}\n'

 ,MME_shader_inline_switch_mode: true

 ,MME_shader_branch: function (name, is_open, _not_) {
if (this.MME_shader_inline_switch_mode) {
  return (is_open) ? 'if (' + ((_not_) ? '!' : '') + name + ') {\n' : '}\n'
}
else {
  return (is_open) ? '#if' + ((_not_) ? 'n' : '') + 'def ' + name + '\n' : '#endif\n'
}
  }

 ,MME_shader_fshader: {}

 ,MME_shader: function (name) {
var fvar = ""
var fshader = ""
var mme = MMD_SA_options.MME[name]
if (!(mme.enabled==null || mme.enabled)) {
  if (!this.MME_shader_inline_switch_mode)
    return { fvar:fvar, fshader:fshader }
}

if (!this.MME_shader_fshader[name]) {
  this.MME_shader_fshader[name] = {}

  var toFloat = MMD_SA_options.MME._toFloat

  fvar +=
  ((this.MME_shader_inline_switch_mode) ? 'uniform bool ' + name.toUpperCase() + ';' : '#define ' + name.toUpperCase()) + '\n'

  switch (name) {
    case "self_overlay":
// concepts borrowed from "o_SelfOverlay" MME effect for MMD, by おたもん

fvar +=
  'uniform float self_overlay_opacity;\n'
+ 'uniform float self_overlay_brightness;\n'
+ 'uniform vec3 self_overlay_color_adjust;\n'

fshader +=
  this.MME_shader_branch("SELF_OVERLAY", true)

+ 'vec4 color_temp_self_overlay = gl_FragColor;\n'
+ 'color_temp_self_overlay.rgb *= self_overlay_brightness;\n'
+ 'color_temp_self_overlay.rgb = mix(color_temp_self_overlay.rgb * self_overlay_color_adjust, color_temp_self_overlay.rgb, color_temp_self_overlay.rgb);\n'


+ 'color_temp_self_overlay.r = (gl_FragColor.r < 0.5) ? gl_FragColor.r * color_temp_self_overlay.r * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - color_temp_self_overlay.r);\n'
+ 'color_temp_self_overlay.g = (gl_FragColor.g < 0.5) ? gl_FragColor.g * color_temp_self_overlay.g * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - color_temp_self_overlay.g);\n'
+ 'color_temp_self_overlay.b = (gl_FragColor.b < 0.5) ? gl_FragColor.b * color_temp_self_overlay.b * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - color_temp_self_overlay.b);\n'

/*
branchless test
http://stackoverflow.com/questions/4176247/efficiency-of-branching-in-shaders
- using mix to replace branch
http://stackoverflow.com/questions/20982307/glsl-hlsl-multiple-single-line-conditional-statements-as-opposed-to-single-blo
- it seems ()?: is already considered branchless in some cases?
*/
/*
+ 'color_temp_self_overlay.r = mix(gl_FragColor.r * color_temp_self_overlay.r * 2.0, 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - color_temp_self_overlay.r), float(gl_FragColor.r >= 0.5));\n'
+ 'color_temp_self_overlay.g = mix(gl_FragColor.g * color_temp_self_overlay.g * 2.0, 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - color_temp_self_overlay.g), float(gl_FragColor.g >= 0.5));\n'
+ 'color_temp_self_overlay.b = mix(gl_FragColor.b * color_temp_self_overlay.b * 2.0, 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - color_temp_self_overlay.b), float(gl_FragColor.b >= 0.5));\n'
*/

+ 'gl_FragColor.rgb = mix(gl_FragColor.rgb, color_temp_self_overlay.rgb, self_overlay_opacity);\n'

+ this.MME_shader_branch("SELF_OVERLAY", false)
break

    case "HDR":
// concepts borrowed from "o_Bleach-bypass" MME effect for MMD, by おたもん

fvar +=
  '#define HDR_GAMMA 2.2\n'
+ 'const vec3 LumiFactor = vec3(0.2126, 0.7152, 0.0722);\n'
+ 'uniform float HDR_opacity;\n'

fshader +=
  this.MME_shader_branch("HDR", true)

+ 'vec4 color_temp_HDR = gl_FragColor;\n'

+ 'vec3 negativeGray = pow(color_temp_HDR.rgb, vec3(HDR_GAMMA));\n'
+ 'negativeGray = vec3(1.0 - pow(dot(LumiFactor, negativeGray), 1.0/HDR_GAMMA));\n'

+ 'color_temp_HDR.r = (gl_FragColor.r < 0.5) ? gl_FragColor.r * negativeGray.r * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - negativeGray.r);\n'
+ 'color_temp_HDR.g = (gl_FragColor.g < 0.5) ? gl_FragColor.g * negativeGray.g * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - negativeGray.g);\n'
+ 'color_temp_HDR.b = (gl_FragColor.b < 0.5) ? gl_FragColor.b * negativeGray.b * 2.0 : 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - negativeGray.b);\n'

+ 'color_temp_HDR.r = (gl_FragColor.r < 0.5) ? pow(color_temp_HDR.r, 2.0 * (1.0 - gl_FragColor.r)) : pow(color_temp_HDR.r, 1.0 / (2.0 * gl_FragColor.r));\n'
+ 'color_temp_HDR.g = (gl_FragColor.g < 0.5) ? pow(color_temp_HDR.g, 2.0 * (1.0 - gl_FragColor.g)) : pow(color_temp_HDR.g, 1.0 / (2.0 * gl_FragColor.g));\n'
+ 'color_temp_HDR.b = (gl_FragColor.b < 0.5) ? pow(color_temp_HDR.b, 2.0 * (1.0 - gl_FragColor.b)) : pow(color_temp_HDR.b, 1.0 / (2.0 * gl_FragColor.b));\n'

+ 'gl_FragColor.rgb = mix(gl_FragColor.rgb, color_temp_HDR.rgb, HDR_opacity);\n'

+ this.MME_shader_branch("HDR", false)
break

    case "serious_shader":
/*
concepts borrowed from the following MME effects for MMD, by Elle/データP
- SeriousShader
- AdultShader
*/

if (!mme.type)
  mme.type = "SeriousShader"

fvar +=
  'uniform float serious_shader_shadow_opacity;\n'
+ 'uniform float OverBright;\n'
//+ '#define OverBright ' + toFloat((mme.OverBright || ((mme.type == "AdultShaderS2") ? 1.15 : 1.2)) + MMD_SA_options.SeriousShader_OverBright_adjust) + '\n'// 白飛びする危険性をおかして明るくする。
+ 'uniform float ShadowDarkness;\n'// セルフシャドウの最大暗さ
+ 'uniform float ToonPower;\n'// 影の暗さ

//if (mme.type == "SeriousShader") {
  fvar +=
  '#define UnderSkinDiffuse ' + toFloat(mme.UnderSkinDiffuse || 0.2) + '\n'// 皮下散乱
//}
//else {
  fvar +=
  '#define FresnelCoef ' + toFloat(mme.FresnelCoef || 0.08) + '\n'// フレネル項の係数
+ '#define FresnelFact ' + toFloat(mme.FresnelFact || 5) + '\n'// フレネル項
+ 'uniform float EyeLightPower;\n'// 視線方向での色合いの変化
+ 'uniform int serious_shader_mode;\n'
//}

fshader +=
  this.MME_shader_branch("SERIOUS_SHADER", true)

+ '#ifdef METAL\n'
+ '  gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient + totalSpecular );\n'
+ '  #ifdef MMD_TOONMAP\ngl_FragColor.xyz *= totalToon;\n#endif\n'
+ '#else\n'
//+ 'gl_FragColor.xyz = vec3(0.5); ShadowColor.xyz = vec3(0.5);\n'
+ '  gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient );\n'
+ '  ShadowColor.xyz = ShadowColor.xyz * ( (emissive + totalDiffuse)*(1.0-serious_shader_shadow_opacity) + ambientLightColor * ambient );\n'

// NOTE: MMD_TOONMAP is undefined when there in no toon map. However, in original MME (full.fx), no toon map merely means a full white one.
+ '  float comp = 1.0;\n'
+ '  #ifdef MMD_TOONMAP\n'
+ '    ShadowColor.rgb *= pow(totalToon, vec3(ToonPower));\n'//ToonPower);\n'
+ '  #endif\n'

+ 'if (serious_shader_mode == 0) { gl_FragColor.rgb *= OverBright; }\n'
//+ ((mme.type == "SeriousShader") ? 'gl_FragColor.rgb *= OverBright;\n' : '')//OverBright;

// NOTE: MAX_DIR_LIGHTS > 0 causes ERROR on Electron (v0.33.4) for unknown reasons
+ '  #ifdef MAX_DIR_LIGHTS\n'
+ '    comp = 0.0;\n'
+ '    for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n'

+ 'comp += comp_list[i] * ((comp_list[i]>=0.0) ? (shadowColor.x-1.0)*ShadowDarkness+1.0 : ((serious_shader_mode == 0) ? ShadowDarkness-1.0 : 0.0));\n'
//+ 'comp += comp_list[i] * ((comp_list[i]>=0.0) ? (shadowColor.x-1.0)*ShadowDarkness+1.0 : ' + ((mme.type == "SeriousShader") ? 'ShadowDarkness-1.0' : '0.0') + ');\n'

+ '    }\n'
+ '    comp = clamp(comp, 0.0, 1.0);\n'
+ '  #endif\n'

// Using RGBtoYCbCr here is bugged for some unknown reasons
+ '  Y  =  0.298912 * ShadowColor.r + 0.586611 * ShadowColor.g + 0.114478 * ShadowColor.b;\n'
+ '  Cb = -0.168736 * ShadowColor.r - 0.331264 * ShadowColor.g + 0.5      * ShadowColor.b;\n'
+ '  Cr =  0.5      * ShadowColor.r - 0.418688 * ShadowColor.g - 0.081312 * ShadowColor.b;\n'
+ '  shadowColor.x = mix(1.0-MMDShadow,1.0, shadowColor.x);\n'
+ '  gl_FragColor.rgb = mix(mix(clamp(YCbCrtoRGB(Y *shadowColor.x, Cb, Cr), vec3(0.),vec3(1.)), ShadowColor.rgb *shadowColor.x, 0.5), gl_FragColor.rgb, comp);\n'
//+ '  gl_FragColor.rgb = mix(ShadowColor.rgb *shadowColor.x, gl_FragColor.rgb, comp);\n'
+ '  gl_FragColor.xyz += totalSpecular;\n'

//if (mme.type == "SeriousShader") {
  fshader +=
  'if (serious_shader_mode == 0) {\n'
+ '  float d = pow(abs(dot(normal, viewPosition)), UnderSkinDiffuse);\n'//pow(abs(dot(normalize(IN.Normal),normalize(IN.Eye))),UnderSkinDiffuse);\n'
+ '  gl_FragColor.xyz += totalSpecular * (1.0 - d);\n'
+ '}\n'
//}
//else {
  fshader +=
  'else {\n'
+ '  float EN = abs(dot(normal, viewPosition));\n'
+ '  float d = pow(EN, EyeLightPower);\n'//EyeLightPower	0.7 / 2.0
+ '  gl_FragColor.rgb *= mix(gl_FragColor.rgb, vec3(OverBright), d);\n'//OverBright
+ '  gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 1.0);\n'

//  if (/AdultShaderS/.test(mme.type)) {
//    fshader +=
//+ '  if ((serious_shader_mode == 1) || (serious_shader_mode == 2)) {\n'
+ '    d = FresnelCoef * pow(1.0-EN, FresnelFact) * (comp*0.4+0.6);\n'//FresnelCoef/FresnelFact
+ '    gl_FragColor.rgb += totalSpecular * d;\n'
//+ '  }\n'
+ '}\n'
//  }
//}

fshader +=
  '#endif\n'

+ this.MME_shader_branch("SERIOUS_SHADER", false)

    default:
break
  }

  this.MME_shader_fshader[name] = { fvar:fvar, fshader:fshader }
}

return this.MME_shader_fshader[name]
  }

 ,GOML_import: ""
 ,GOML_head: ""
 ,GOML_scene: ""

 ,GOML_head_list: []
 ,GOML_scene_list: []

};
};
