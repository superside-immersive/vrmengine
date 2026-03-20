// Scene objects: ML camera morphs, mesh preloads, X-ray, mirrors, child animation
// Extracted from defaults.js — called by MMD_SA_initDefaults()

window.MMD_SA_initDefaults_sceneObjects = function () {
  if (MMD_SA_options.user_camera.ML_models.enabled) {
    MMD_SA_options.look_at_mouse = false

    window.addEventListener("jThree_ready", function () {
MMD_SA_options.model_para_obj_all.forEach(function (model_para_obj) {
  model_para_obj.use_default_boundingBox = true
});

const facemesh_morph = {}
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
const morph_default = MMD_SA_options.model_para_obj.morph_default = MMD_SA_options.model_para_obj.morph_default || {};

const facemesh_morph = MMD_SA_options.model_para_obj.facemesh_morph;
const morphs_index_by_name = THREE.MMD.getModels()[0].pmx.morphs_index_by_name;

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
    for (let i = 0, i_max = MMD_SA_options.model_para_obj_all.length; i < i_max; i++) {
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
  if (!MMD_SA_options.interaction_animation_disabled && !MMD_SA_options.MMD_disabled && MMD_SA_options.allows_kissing && (MMD_SA_options.custom_action.indexOf("kissing") == -1))
    MMD_SA_options.custom_action.push("kissing")
  if (!MMD_SA_options.interaction_animation_disabled && (MMD_SA_options.custom_action.indexOf("kissing") != -1)) {
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
    const _r = MMD_SA_options._xray_radius

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
const obj = MMD_SA.createMirror(para)
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

    for (let i = 0; i < MMD_SA_options.child_animation_as_texture; i++) {
const c_id = 'j3_childAnimationCanvas' + i

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
};
