// threex-ppe.js - Post-Processing Effects module extracted from MMD_SA.js
// Part of Etapa 10B refactoring

window.MMD_SA_createTHREEX_PPE = function(TX) {
      let PPE_stub_notice_shown;
      const create_resettable = function (obj) {
return Object.assign({
  reset: function () {}
}, obj || {});
      };

      let PPE_stub_enabled = false;
      const PPE_stub = {
  get enabled() { return PPE_stub_enabled; },
  set enabled(v) { PPE_stub_enabled = !!v; },

  initialized: false,
  gui: {
folders: [],
controllers: []
  },

  init: async function () {
if (PPE_stub_notice_shown) return this;

PPE_stub_notice_shown = true;
this.initialized = true;
DEBUG_show('(Post-processing effects are removed from this build.)', 4);
return this;
  },

  setup: function () {},
  render: function () { return false; },

  DOF: {
enabled: false,
effectController: create_resettable()
  },

  N8AO: {
enabled: false,
AO_MASK: 2,
NO_AO: 3,
effectController: create_resettable(),
effectController_vrm: create_resettable()
  },

  UnrealBloom: {
enabled: false,
NO_BLOOM: 1,
params: create_resettable(),
params_vrm: create_resettable()
  }
      };

      return PPE_stub;

      let PPE_initialized, PPE_initializing;

      let renderScene;
      let renderScene_with_depthTexture, scene_depthTexture;

      let effects_composer;

      let PPE_options_default, PPE_options;

      const PPE_list = ['DOF', 'N8AO', 'UnrealBloom'];

      const ENTIRE_SCENE = 0, NO_BLOOM = 1, AO_MASK = 2, NO_AO = 3;

      let Pass;

      let OutputPass, SMAAPass;

      function close_other_GUI(gui) {
PPE.gui.folders.forEach(f=>{
  if (f != gui)
    f.close();
});
      }

      function create_depthTexture() {
const dt = new TX.THREE.DepthTexture(TX.threeX.SL.width, TX.threeX.SL.height, TX.THREE.UnsignedIntType);
dt.format = TX.THREE.DepthFormat;
return dt;
      }

      const PPE = {
        get enabled() { return PPE_options.enabled; },
        set enabled(v) {
PPE_options.enabled = !!v;
this.gui.controllers[0].updateDisplay();

if (v && !PPE_list.some(n=>PPE[n].enabled)) {
  PPE['UnrealBloom'].enabled = true;
}

PPE['UnrealBloom'].setup_rim_light();
        },

        get initialized() { return PPE_initialized; },

        init: async function () {
if (PPE_initialized) return;
PPE_initializing = true;

// Oct 11, 2023
const _Pass = await import(System.Gadget.path + '/three.js/postprocessing/Pass.js');
Pass = _Pass.Pass;

const EffectComposer = await import(System.Gadget.path + '/three.js/postprocessing/EffectComposer.js');

// not using commit from Aug 23, 2023 as it breaks MSAA
const RenderPass = await import(System.Gadget.path + '/three.js/postprocessing/RenderPass.js');

// May 24, 2023
const ShaderPass = await import(System.Gadget.path + '/three.js/postprocessing/ShaderPass.js');

TX.THREE.EffectComposer = EffectComposer.EffectComposer;
TX.THREE.RenderPass = RenderPass.RenderPass;
TX.THREE.ShaderPass = ShaderPass.ShaderPass;

//TX.THREE.SMAAPass = (await import(System.Gadget.path + '/three.js/postprocessing/SMAAPass.js')).SMAAPass;

// Dec 19, 2023
TX.THREE.OutputPass = (await import(System.Gadget.path + '/three.js/postprocessing/OutputPass.js')).OutputPass;

PPE_options_default = {
  enabled: false,
};

PPE_options = Object.assign({
}, PPE_options_default);

for (const name of PPE_list) {
  const effect = this[name];
  await effect.init();
}

if (MMD_SA.MMD_started) {
  this.setup();
}
else {
  window.addEventListener('MMDStarted', ()=>{
    this.setup();
  });
}
        },

        setup: function () {
const gui = this.gui = TX.threeX.GUI.obj.visual_effects.addFolder( 'Post-Processing Effects' );
gui.add(PPE_options, 'enabled').onChange( ( value )=>{
  this.enabled = value;
});

renderScene = new TX.THREE.RenderPass( TX.data.scene, TX.data.camera );

renderScene_with_depthTexture = new TX.THREE.RenderPass( TX.data.scene, TX.data.camera );
renderScene_with_depthTexture._renderTarget_with_depthTexture = new TX.THREE.WebGLRenderTarget( TX.threeX.SL.width, TX.threeX.SL.height, { type:TX.THREE.HalfFloatType, samples:4 } );
scene_depthTexture = renderScene_with_depthTexture._renderTarget_with_depthTexture.depthTexture = create_depthTexture();

OutputPass = new TX.THREE.OutputPass();

PPE_list.forEach(name=>{
  const effect = this[name];
//effect.enabled = true;
  effect.setup();
});

effects_composer = new TX.THREE.EffectComposer(TX.data.renderer);
effects_composer.addPass(renderScene_with_depthTexture);
effects_composer.addPass(PPE.N8AO.pass);
effects_composer.addPass(PPE.UnrealBloom.mix_pass);
effects_composer.addPass(PPE.DOF.pass);
effects_composer.addPass(OutputPass);

//SMAAPass = new TX.THREE.SMAAPass(SL.width, SL.height);
//effects_composer.addPass(SMAAPass);

PPE_list.map(name=>{ return { name:name, order:this[name].UI_order }; }).sort((a,b)=>a.order-b.order).forEach(obj=>{
  const effect = this[obj.name];
  effect.setup_UI();
  effect.gui.domElement.addEventListener('click', ()=>{
    close_other_GUI(effect.gui);
  });
  effect.gui.close();
});

window.addEventListener('SA_MMD_SL_resize', ()=>{
  const SL = TX.threeX.SL;
  const width = SL.width;
  const height = SL.height;

  PPE_list.forEach(name=>{
    const effect = this[name];
    if (effect.enabled)
      effect.resize(width, height);
  });

  effects_composer.setSize( width, height );
});

PPE_initializing = false;
PPE_initialized = true;
        },

        render: function (scene, camera) {
//return false;
if (!PPE_initialized || !this.enabled) return false;

if (MMD_SA.SpeechBubble.list.some(sb=>sb.visible)) return false;

let rendered = false;
PPE_list.forEach(name=>{
  const effect = this[name];
  if (effect.enabled)
    rendered = effect.render(scene, camera) || rendered;
});

if (!rendered) return false;

//effects_composer.writeBuffer = effects_composer.renderTarget1;
//effects_composer.readBuffer  = effects_composer.renderTarget2;

if (!PPE.N8AO.enabled) {
  renderScene_with_depthTexture.enabled = true;
//  SMAAPass.enabled = false;
}
else {
  renderScene_with_depthTexture.enabled = false;
//  SMAAPass.enabled = true;
}

effects_composer.render();

return true;
        },


        DOF: (()=>{
          let postprocessing;

          let DOFPass;
          let gui_DOF;
          let effectController, effectController_default, _effectController;

          const shaderSettings = {
rings: 3,
samples: 4
          };

const matChanger = function () {
					for ( const e in effectController ) {

						if ( e in postprocessing.bokeh_uniforms ) {

							postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];

						}

					}

					postprocessing.enabled = DOF.enabled = effectController.enabled;
};

function shaderUpdate() {

				postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings;
				postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples;
				postprocessing.materialBokeh.needsUpdate = true;

}

          const DOF = {
            get effectController() { return effectController || _effectController; },
            set effectController(v) {
_effectController = v;
if (PPE_initialized) {
  Object.assign(effectController, v);
  TX.threeX.GUI.update(this.gui);
//console.log(effectController)
}
            },

            init: async function () {
const BokehShader = await import(System.Gadget.path + '/three.js/shaders/BokehShader2.js');
TX.THREE.BokehShader = BokehShader.BokehShader;

effectController_default = {
					enabled: false,//true,
//					jsDepthCalculation: true,
					shaderFocus: true,//false,

					fstop: 2.2,
					maxblur: 2.0,//1.0,

					showFocus: false,
//					focalDepth: 2.8,
					manualdof: false,
					vignetting: false,
					depthblur: false,

					threshold: 0.5,
					gain: 1.0,//2.0,
					bias: 0.5,
					fringe: 0.7,

//					focalLength: 35,
					noise: true,
					pentagon: false,

					dithering: 0.0001,

  'focus target': 'Auto',
};

effectController = Object.assign({
  reset: function () {
    gui_DOF.controllers.forEach((c,i)=>{if (i>0) c.reset()});
  },
}, effectController_default);
            },

            setup: function () {
const renderer = TX.data.renderer;
const SL = TX.threeX.SL;
const w = SL.width;
const h = SL.height;

DOFPass = class extends Pass {
  constructor( obj ) {
    super();

    this.obj = obj;
  }

  render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {
    const obj = this.obj
    const SL = TX.threeX.SL;
    const w = SL.width;
    const h = SL.height;

    obj.bokeh_uniforms[ 'tColor' ].value = readBuffer.texture;
    obj.bokeh_uniforms[ 'tDepth' ].value = (PPE.N8AO.enabled) ? PPE.N8AO.pass._AO_mask.depthTexture : scene_depthTexture;
    obj.bokeh_uniforms[ 'textureWidth' ].value  = w;
    obj.bokeh_uniforms[ 'textureHeight' ].value = h;

    const camera = TX.data.camera;
    obj.bokeh_uniforms[ 'znear' ].value = camera.near;
    obj.bokeh_uniforms[ 'zfar' ].value = camera.far;
    obj.bokeh_uniforms[ 'focalLength' ].value = camera.getFocalLength();

    if ( this.renderToScreen ) {
      renderer.setRenderTarget(null);
    }
    else {
      renderer.setRenderTarget( writeBuffer );
    // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
      if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
    }

    renderer.render( obj.scene, obj.camera );
  }

  dispose() {
    this.obj.materialBokeh.dispose();
    this.obj.quad.dispose();
  }
};

postprocessing = { enabled: true };


postprocessing.scene = new TX.THREE.Scene();

postprocessing.camera = new TX.THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, - 10000, 10000 );
postprocessing.camera.position.z = 100;

postprocessing.scene.add( postprocessing.camera );

//				postprocessing.rtTextureDepth = new TX.THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
//				postprocessing.rtTextureColor = new TX.THREE.WebGLRenderTarget( SL.width, SL.height );

const bokeh_shader = TX.THREE.BokehShader;

postprocessing.bokeh_uniforms = TX.THREE.UniformsUtils.clone( bokeh_shader.uniforms );

postprocessing.materialBokeh = new TX.THREE.ShaderMaterial( {
	uniforms: postprocessing.bokeh_uniforms,
	vertexShader: bokeh_shader.vertexShader,
	fragmentShader: bokeh_shader.fragmentShader,
	defines: {
		RINGS: shaderSettings.rings,
		SAMPLES: shaderSettings.samples
	}
} );

postprocessing.quad_w = w;
postprocessing.quad_h = h;

//postprocessing.quad = new TX.THREE.Mesh( new TX.THREE.PlaneGeometry( 1, 1 ), postprocessing.materialBokeh ); postprocessing.quad.scale.set(w,h,1);
postprocessing.quad = new TX.THREE.Mesh( new TX.THREE.PlaneGeometry( w, h ), postprocessing.materialBokeh );
postprocessing.quad.position.z = - 500;
postprocessing.scene.add( postprocessing.quad );

DOF.pass = new DOFPass(postprocessing);
DOF.pass.enabled = this.enabled;
            },

            UI_order: 2,
            setup_UI: function () {
gui_DOF = this.gui = PPE.gui.addFolder( 'Depth of Field Parameters' );

gui_DOF.add( effectController, 'enabled' ).onChange( matChanger );
//gui_DOF.add( effectController, 'jsDepthCalculation' ).onChange( matChanger );
//gui_DOF.add( effectController, 'shaderFocus' ).onChange( matChanger );
//gui_DOF.add( effectController, 'focalDepth', 0.0, 200.0 ).listen().onChange( matChanger );

gui_DOF.add( effectController, 'fstop', 0.1, 22, 0.001 ).onChange( matChanger );
gui_DOF.add( effectController, 'maxblur', 0.0, 5.0, 0.025 ).onChange( matChanger );

gui_DOF.add( effectController, 'showFocus' ).onChange( matChanger );
gui_DOF.add( effectController, 'manualdof' ).onChange( matChanger );
gui_DOF.add( effectController, 'vignetting' ).onChange( matChanger );

gui_DOF.add( effectController, 'depthblur' ).onChange( matChanger );

gui_DOF.add( effectController, 'threshold', 0, 1, 0.001 ).onChange( matChanger );
gui_DOF.add( effectController, 'gain', 0, 100, 0.001 ).onChange( matChanger );
gui_DOF.add( effectController, 'bias', 0, 3, 0.001 ).onChange( matChanger );
gui_DOF.add( effectController, 'fringe', 0, 5, 0.001 ).onChange( matChanger );

//gui_DOF.add( effectController, 'focalLength', 16, 80, 0.001 ).onChange( matChanger );

gui_DOF.add( effectController, 'noise' ).onChange( matChanger );

gui_DOF.add( effectController, 'dithering', 0, 0.001, 0.0001 ).onChange( matChanger );

gui_DOF.add( effectController, 'pentagon' ).onChange( matChanger );

gui_DOF.add( shaderSettings, 'rings', 1, 8 ).step( 1 ).onChange( shaderUpdate );
gui_DOF.add( shaderSettings, 'samples', 1, 13 ).step( 1 ).onChange( shaderUpdate );

gui_DOF.add( effectController, 'focus target', ['Auto', 'Head', 'Chest', 'Hands', 'Feet', 'Screen center'] );

gui_DOF.add( effectController, 'reset' );

Object.assign(effectController, _effectController||{});
TX.threeX.GUI.update(gui_DOF);
            },

            resize: function () {
const SL = TX.threeX.SL;
const w = SL.width;
const h = SL.height;

postprocessing.camera.left = w / - 2;
postprocessing.camera.right = w / 2;
postprocessing.camera.top = h / 2;
postprocessing.camera.bottom = h / - 2;
postprocessing.camera.updateProjectionMatrix();

postprocessing.quad.geometry.scale(w/postprocessing.quad_w, h/postprocessing.quad_h, 1);
postprocessing.quad_w = w;
postprocessing.quad_h = h;
            },

            render: (()=>{
              function get_pos(t) {
let p, c;
switch (t) {
  case 'Head':
    p = modelX.get_bone_position_by_MMD_name('頭').add(TX.v1.set(0,0.8,1).applyQuaternion(modelX.get_bone_rotation_by_MMD_name('頭')));
    break;
  case 'Chest':
    p = modelX.get_bone_position_by_MMD_name('上半身2').add(modelX.get_bone_position_by_MMD_name('首')).multiplyScalar(0.5).add(TX.v1.set(0,0,1.5).applyQuaternion(modelX.get_bone_rotation_by_MMD_name('上半身2')));
    break;
  case 'Left hand':
    p = modelX.get_bone_position_by_MMD_name('左中指１');
    break;
  case 'Right hand':
    p = modelX.get_bone_position_by_MMD_name('右中指１');
    break;
  case 'Left foot':
    p = modelX.get_bone_position_by_MMD_name('左足首').add(TX.v1.set(0,-0.5,1).applyQuaternion(modelX.get_bone_rotation_by_MMD_name('左足首')));
    break;
  case 'Right foot':
    p = modelX.get_bone_position_by_MMD_name('右足首').add(TX.v1.set(0,-0.5,1).applyQuaternion(modelX.get_bone_rotation_by_MMD_name('右足首')));
    break;
}

if (p) {
  c = get_coords(p);
  if (c.some(v=>(v<0)||(v>1))) {
    p = c = null;
  }
}

return [p,c,t];
              }

              function get_coords(pos) {
const p = TX.v1.copy(pos).project(camera);
return [p.x/2+0.5, p.y/2+0.5, p.z];
              }

              let camera, modelX;

              let target_last, distance_last;

              return function () {
camera = TX.data.camera;

let target = effectController['focus target'];
modelX = TX.threeX.get_model(0);

let obj, pos, coords;

if (target == 'Auto') {
  const poseNet = System._browser.camera.poseNet;
  if (poseNet.enabled) {
    const motion_para = MMD_SA.MMD.motionManager.para_SA;
    if (motion_para.motion_tracking?.arm_as_leg?.enabled && ['左','右'].some(d=>poseNet.frames.skin[d+'足首'] && poseNet.frames.get_blend_default_motion('skin', d+'足首')<1)) {
      target = 'Feet';
    }
    else {
      if (MMD_SA_options.Dungeon_options?.item_base.hand_camera?._hand_camera_active) {
        target = 'Head';
      }
      else {
        const head = get_pos('Head');
        if (head?.[0]) {
          const dim = poseNet.shoulder_width;
          const w = dim/TX.threeX.SL.width /2 *1.1;
          const h = dim/TX.threeX.SL.height/2 *1.1;
          obj = [get_pos('Left hand'), get_pos('Right hand')].filter(v=>v[0] && (v[1][0]>head[1][0]-w) && (v[1][0]<head[1][0]+w) && (v[1][1]>head[1][1]-h) && (v[1][1]<head[1][1]+h)).map(v=>[...v, v[0].distanceTo(camera.position)]).sort((a,b)=>a[3]-b[3])[0];
          if (obj) {
            target = '';
          }
          else {
            target = 'Head';
          }
        }
        else {
          target = 'Hands';
        }
      }
    }
  }
  else {
    target = 'Head';
  }
}

switch (target) {
  case 'Head':
  case 'Chest':
    obj = get_pos(target);
    break;
  case 'Hands':
    obj = [get_pos('Left hand'), get_pos('Right hand')].filter(v=>v[0]).map(v=>[...v, v[0].distanceTo(camera.position)]).sort((a,b)=>a[3]-b[3])[0];
    break;
  case 'Feet':
    obj = [get_pos('Left foot'), get_pos('Right foot')].filter(v=>v[0]).map(v=>[...v, v[0].distanceTo(camera.position)]).sort((a,b)=>a[3]-b[3])[0];
    break;
  default:
    target = '';
}

if (!obj && target) {
  for (const part of ['Head', 'Chest']) {
    obj = get_pos(part);
    if (obj) break;
  }
}

if (obj) {
  pos = obj[0];
  coords = obj[1];
  target = obj[2];
}

if (pos) {
  let distance = pos.distanceTo(camera.position);
  if (target_last) {
    const distance_diff = distance - distance_last;
    distance_last += Math.sign(distance_diff) * Math.min(RAF_timestamp_delta/1000 * Math.max(30, Math.abs(distance_diff)), Math.abs(distance_diff));
    distance = distance_last;
  }
  target_last = target;
  distance_last = distance;

  postprocessing.bokeh_uniforms[ 'focalDepth' ].value = distance;
  effectController[ 'focalDepth' ] = distance;
//System._browser.camera.DEBUG_show(target+'/'+distance)
}
else {
  target_last = distance_last = null;
  coords = [0.5,0.5];
}

postprocessing.bokeh_uniforms[ 'shaderFocus' ].value = !pos;
postprocessing.bokeh_uniforms[ 'focusCoords' ].value.fromArray(coords);

return true;
              };
            })(),

            get enabled() { return effectController.enabled },
            set enabled(v) {
effectController.enabled = !!v;
this.gui.controllers[0].updateDisplay();

this.pass.enabled = v;

if (v) {
  if (!PPE.enabled)
    PPE.enabled = true;
}
else {
  if (PPE_list.every(n=>!PPE[n].enabled))
    PPE.enabled = false;
}
            },
          };

          return DOF;
        })(),

        N8AO: (()=>{
          let effectController_default, effectController, _effectController;
          let effectController_vrm_default, effectController_vrm, _effectController_vrm;
          let gui_N8AO, gui_vrm;

          const N8AO = {
            AO_MASK: AO_MASK,
            NO_AO: NO_AO,

            get effectController() { return effectController || _effectController; },
            set effectController(v) {
_effectController = v;
if (PPE_initialized) {
  Object.assign(effectController, v);
  TX.threeX.GUI.update(this.gui);
//console.log(effectController)
}
            },

            get effectController_vrm() { return effectController_vrm || _effectController_vrm; },
            set effectController_vrm(v) {
_effectController_vrm = v;
if (PPE_initialized) {
  Object.assign(effectController_vrm, v);
  TX.threeX.GUI.update(this.gui);
//console.log(effectController_vrm)
}
            },

            init: async function () {
const N8AO = await import(System.Gadget.path + '/three.js/postprocessing/N8AO.js');
TX.THREE.N8AOPass = N8AO.N8AOPass;

effectController_default = {
  enabled: false,//true,
  quality: 'Medium',

        aoSamples: 16.0,
        denoiseSamples: 8.0,
        denoiseRadius: 12.0,
// smaller aoRadius reduces GPU usage in some cases (e.g. zoom-in avatar with MSAA)
        aoRadius: 3.0,//5.0,
        distanceFalloff: 0.6,//1.0,
        intensity: 5.0,
        color: '#000000',
        halfRes: true,
        renderMode: "Combined",

  screenSpaceRadius: false,//true,
};

effectController = Object.assign({
  reset: function () {
    gui_N8AO.controllers.forEach((c,i)=>{if (i>0) c.reset()});
  },
}, effectController_default);

effectController_vrm_default = {
  'AO opacity': 1,
  'AO color': '#804020',
};

effectController_vrm = Object.assign({
  reset: function () {
    gui_vrm.controllers.forEach(c=>{c.reset()});
  },
}, effectController_vrm_default);
            },

            setup: function() {
const renderer = TX.data.renderer;
const scene = TX.data.scene;
const camera = TX.data.camera;
const SL = TX.threeX.SL;

this.pass = new TX.THREE.N8AOPass(
        scene,
        camera,
        SL.width,
        SL.height
);
this.pass.enabled = this.enabled;
            },

            UI_order: 1,
            setup_UI: function () {
gui_N8AO = this.gui = PPE.gui.addFolder( 'SSAO (Selective) Parameters' );
gui_N8AO.add(effectController, 'enabled').onChange( ( value )=>{
  this.enabled = value;
});
gui_N8AO.add(effectController, "quality", ["Performance", "Low", "Medium", "High", "Ultra"]).onChange(v=>{
  this.pass.setQualityMode(v);
  for (const p of ['aoSamples', 'denoiseSamples', 'denoiseRadius']) {
    effectController[p] = this.pass.configuration[p];
    gui_N8AO.controllers.forEach(c=>{c.updateDisplay()});
  }
});
gui_N8AO.add(effectController, "aoSamples", 1.0, 64.0, 1.0);
gui_N8AO.add(effectController, "denoiseSamples", 1.0, 64.0, 1.0);
gui_N8AO.add(effectController, "denoiseRadius", 0.0, 24.0, 0.01);
gui_N8AO.add(effectController, "aoRadius", 1.0, 64.0, 0.01);
gui_N8AO.add(effectController, "distanceFalloff", 0.0, 2.0, 0.01);
gui_N8AO.add(effectController, "intensity", 0.0, 10.0, 0.01);
gui_N8AO.addColor(effectController, "color");
gui_N8AO.add(effectController, "halfRes");
gui_N8AO.add(effectController, "renderMode", ["Combined", "AO", "No AO", "Split", "Split AO"]);
gui_N8AO.add(effectController, 'reset' );

gui_vrm = this.gui_vrm = gui_N8AO.addFolder( 'VRM Specific Parameters' );
gui_vrm.add(effectController_vrm, 'AO opacity', 0.0, 1.0);
gui_vrm.addColor(effectController_vrm, 'AO color');
gui_N8AO.add(effectController_vrm, 'reset');

Object.assign(effectController, _effectController||{});
Object.assign(effectController_vrm, _effectController_vrm||{});
TX.threeX.GUI.update(gui_N8AO);
TX.threeX.GUI.update(gui_vrm);
            },

            resize: function (width, height) {
//this.pass.setSize(width, height);
            },

            render: function (scene, camera) {
this.pass.configuration.aoRadius = effectController.aoRadius;
this.pass.configuration.distanceFalloff = effectController.distanceFalloff;
this.pass.configuration.intensity = effectController.intensity;
this.pass.configuration.aoSamples = effectController.aoSamples;
this.pass.configuration.denoiseRadius = effectController.denoiseRadius;
this.pass.configuration.denoiseSamples = effectController.denoiseSamples;
this.pass.configuration.renderMode = ["Combined", "AO", "No AO", "Split", "Split AO"].indexOf(effectController.renderMode);
this.pass.configuration.halfRes = effectController.halfRes;
this.pass.configuration.screenSpaceRadius = effectController.screenSpaceRadius;

const color_base = this.pass._color_base_material[0].color;
color_base.set(effectController['color']);
this.pass._color_base_material.forEach(m=>{ m.color.copy(color_base); });

const color = this.pass._color_vrm_material[0].color;
color.set(effectController_vrm['AO color']);
for (const c of ['r','g','b'])
  color[c] = color[c] + (1-color[c]) * (1-effectController_vrm['AO opacity']);
this.pass._color_vrm_material.forEach(m=>{ m.color.copy(color); });

this.pass.configuration.gammaCorrection = false;//!(PPE.UnrealBloom.enabled || PPE.DOF.enabled);

return true;
            },

            get enabled() { return effectController.enabled; },
            set enabled(v) {
effectController.enabled = !!v;
this.gui.controllers[0].updateDisplay();

this.pass.enabled = v;

if (v) {
  if (!PPE.enabled)
    PPE.enabled = true;
}
else {
  if (PPE_list.every(n=>!PPE[n].enabled))
    PPE.enabled = false;
}
            },
          };

          return N8AO;
        })(),

        UnrealBloom: (()=>{
          let no_bloom_layer;
          let params_default, params, _params;
          let params_vrm_default, params_vrm, _params_vrm;
          let gui_bloom, gui_bloom_vrm;
          let darkMaterial, materials;
          let bloomComposer;
          let bloomPass;

          const vertexShader = [
'			varying vec2 vUv;',

'			void main() {',

'				vUv = uv;',

'				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

'			}',
          ].join('\n');

          const fragmentShader = [
'			uniform sampler2D baseTexture;',
'			uniform sampler2D bloomTexture;',

'			varying vec2 vUv;',

'			void main() {',

//'				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );',

'vec4 base_color = texture2D(baseTexture, vUv);',
'vec4 bloom_color = texture2D(bloomTexture, vUv);',
//'gl_FragColor = base_color + bloom_color;',

'float lum = 0.21 * bloom_color.r + 0.71 * bloom_color.g + 0.07 * bloom_color.b;',
//'gl_FragColor = vec4(mix(bloom_color.rgb, base_color.rgb + bloom_color.rgb, base_color.a), max(base_color.a, lum));',
'gl_FragColor = vec4(base_color.rgb + bloom_color.rgb, max(base_color.a, lum));',

// https://discourse.threejs.org/t/srgbencoding-with-post-processing/12582/6
//'				gl_FragColor = LinearTosRGB(( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) ));',
//'gl_FragColor = LinearTosRGB(gl_FragColor);',//mix(gl_FragColor, LinearTosRGB(gl_FragColor), 0.6667);',

'			}',
          ].join('\n');

          let vrm_bloom_factor = 0.2;

          const UnrealBloom = {
            get params() { return params || _params; },
            set params(v) {
_params = v;
if (PPE_initialized) {
  Object.assign(params, v);
  TX.threeX.GUI.update(this.gui);
//console.log(params)
}
            },

            get params_vrm() { return params_vrm || _params_vrm; },
            set params_vrm(v) {
_params_vrm = v;
if (PPE_initialized) {
  Object.assign(params_vrm, v);
  TX.threeX.GUI.update(this.gui_vrm);
//console.log(params_vrm)
}
            },

            NO_BLOOM: NO_BLOOM,

            init: async function () {
const UnrealBloomPass = await import(System.Gadget.path + '/three.js/postprocessing/UnrealBloomPass.js');
TX.THREE.UnrealBloomPass = UnrealBloomPass.UnrealBloomPass;

no_bloom_layer = new TX.THREE.Layers();
no_bloom_layer.set( NO_BLOOM );

params_default = {
  enabled: false,//true,
//  exposure: 1,
  bloomStrength: 0.4,//0.8,
  bloomRadius: 0.4,
  bloomThreshold: 0.43,//0.3,
};

params = Object.assign({
  reset: function () {
    gui_bloom.controllers.forEach((c,i)=>{if (i>0) c.reset()});
  },
}, params_default);

params_vrm_default = {
/*
const p = m.userData.gltfExtensions.VRMC_materials_mtoon;
m.parametricRimFresnelPowerFactor = p.parametricRimFresnelPowerFactor * 2;
m.parametricRimLiftFactor = p.parametricRimLiftFactor * 2
//m.rimLightingMixFactor = p.rimLightingMixFactor * 2
//m.parametricRimColorFactor.set('white')
//m.matcapFactor.set('white')
*/
  bloom_factor: vrm_bloom_factor,
  RimFresnelPower: 1,
  RimLift: 1,
};

params_vrm = Object.assign({
  reset: function () {
    gui_bloom_vrm.controllers.forEach(c=>{c.reset()});
  },
}, params_vrm_default);

darkMaterial = new TX.THREE.MeshBasicMaterial( { color: 'black' } );
materials = {};
            },

            setup: function() {
const renderer = TX.data.renderer;
const scene = TX.data.scene;
const camera = TX.data.camera;
const SL = TX.threeX.SL;

//THREEX.ColorManagement.enabled = false;
//renderer.outputColorSpace = TX.THREE.LinearSRGBColorSpace;
//renderer.toneMapping = TX.THREE.ReinhardToneMapping;

bloomPass = new TX.THREE.UnrealBloomPass( new TX.THREE.Vector2( SL.width, SL.height ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

bloomComposer = new TX.THREE.EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

this.mix_pass = new TX.THREE.ShaderPass(
  new TX.THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
// not using bloomComposer.renderTarget2.texture since the final mix in UnrealBloom.js has been canceled (when it is not rendered to screen)
      bloomTexture: { value: bloomPass.renderTargetsHorizontal[ 0 ].texture }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    defines: {}
  } ),
  'baseTexture'
);
this.mix_pass.needsSwap = true;
this.mix_pass.enabled = this.enabled;
            },

            UI_order: 0,
            setup_UI: function () {
gui_bloom = this.gui = PPE.gui.addFolder( 'Unreal Bloom (Selective) Parameters' );
gui_bloom.add( params, 'enabled' ).onChange( ( value )=>{
  this.enabled = value;
});

gui_bloom.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
  bloomPass.threshold = Number( value );
});

gui_bloom.add( params, 'bloomStrength', 0.0, 10.0 ).onChange( function ( value ) {
  bloomPass.strength = Number( value );
});

gui_bloom.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
  bloomPass.radius = Number( value );
});
gui_bloom.add( params, 'reset' );

gui_bloom_vrm = this.gui_vrm = gui_bloom.addFolder( 'VRM Specific Parameters' );
gui_bloom_vrm.add( params_vrm, 'bloom_factor', 0.0, 1.0 ).onChange( function ( value ) {
  vrm_bloom_factor = Number( value );
});
gui_bloom_vrm.add( params_vrm, 'RimFresnelPower', 0.0, 5.0 ).onChange( function ( value ) {
  const v = Number( value );
  MMD_SA.THREEX.get_model(0).model.materials.forEach(m=>{
    const p = m.userData.gltfExtensions.VRMC_materials_mtoon;
    m.parametricRimFresnelPowerFactor = (('parametricRimFresnelPowerFactor' in p) ? p.parametricRimFresnelPowerFactor : 5) * v;
 });
});
gui_bloom_vrm.add( params_vrm, 'RimLift', 0.0, 5.0 ).onChange( function ( value ) {
  const v = Number( value );
  MMD_SA.THREEX.get_model(0).model.materials.forEach(m=>{
    const p = m.userData.gltfExtensions.VRMC_materials_mtoon;
    m.parametricRimLiftFactor = (('parametricRimLiftFactor' in p) ? p.parametricRimLiftFactor : 0.1) * v;
 });
});
gui_bloom_vrm.add( params_vrm, 'reset' );

Object.assign(params, _params||{});
Object.assign(params_vrm, _params_vrm||{});
TX.threeX.GUI.update(gui_bloom);
TX.threeX.GUI.update(gui_bloom_vrm);
            },

            resize: function (width, height) {
bloomComposer.setSize( width, height );
            },

            render: function (scene, camera) {
function renderBloom( mask ) {
  const _backgroundIntensity = scene.backgroundIntensity;
  scene.backgroundIntensity *= 0.25;
  const _environmentIntensity = scene.environmentIntensity;
  scene.environmentIntensity *= 0.25;

  if ( mask === true ) {
    MMD_SA.THREEX.get_model(0).model.materials.forEach(m=>{
// assign rgb values directly instead of using *= or /= (not working probably because of its getter/setting nature)
// https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-materials-mtoon/src/MToonMaterial.ts#L63
// should be safe to assume (1,1,1) by default
//      if (!m._color_) m._color_ = m.color.clone();

      m.color.r = vrm_bloom_factor;
      m.color.g = vrm_bloom_factor;
      m.color.b = vrm_bloom_factor;
    });

    scene.traverse( darkenNonBloomed );
    bloomComposer.render();
    scene.traverse( restoreMaterial );

    MMD_SA.THREEX.get_model(0).model.materials.forEach(m=>{
//      m.color.copy(m._color_);
      m.color.r = m.color.g = m.color.b = 1;
    });
  }
  else {
    camera.layers.set( ENTIRE_SCENE);
    bloomComposer.render();
    camera.layers.set( ENTIRE_SCENE );
  }

  scene.backgroundIntensity = _backgroundIntensity;
  scene.environmentIntensity = _environmentIntensity;
}

function darkenNonBloomed( obj ) {
  if ( (obj.isMesh || obj.isSprite) && no_bloom_layer.test( obj.layers ) === true ) {
    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial( obj ) {
  if ( materials[ obj.uuid ] ) {
    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];
  }
}

//return false;

// https://github.com/mrdoob/three.js/wiki/Migration-Guide#154--155
// The inline tone mapping controlled via WebGLRenderer.toneMapping only works when rendering to screen now (similar to WebGLRenderer.outputColorSpace). In context of post processing, use OutputPass to apply tone mapping and color space conversion.
// TX.data.renderer.toneMapping = TX.THREE.ReinhardToneMapping;

// render scene with bloom
renderBloom( true );

TX.data.renderer.toneMapping = TX.THREE.NoToneMapping;//LinearToneMapping;//ACESFilmicToneMapping;//

return true;
            },

            setup_rim_light: function () {
const enabled = PPE.enabled && this.enabled;
if (enabled) {
  vrm_bloom_factor = params_vrm.bloom_factor;
  MMD_SA.THREEX.get_model(0).model.materials.forEach(m=>{
    const p = m.userData.gltfExtensions.VRMC_materials_mtoon;
    if ('parametricRimFresnelPowerFactor' in p) {
      m.parametricRimFresnelPowerFactor = p.parametricRimFresnelPowerFactor * params_vrm.RimFresnelPower;
    }
    else {
      const c = 0.25;//Math.min(TX.threeX.light.obj.DirectionalLight[0].intensity/20, 1);
      m.parametricRimColorFactor.setRGB(c,c,c);
      m.parametricRimFresnelPowerFactor = 5 * params_vrm.RimFresnelPower;
    }

    m.parametricRimLiftFactor = (('parametricRimLiftFactor' in p) ? p.parametricRimLiftFactor : 0.1) * params_vrm.RimLift;

//m.matcapFactor.set('white')
//m.parametricRimColorFactor.setRGB(0.1,0.1,0.1)
//m.rimLightingMixFactor=1
//m.parametricRimFresnelPowerFactor=5
//m.parametricRimLiftFactor=1
  });
}
else {
  vrm_bloom_factor = params_vrm_default.bloom_factor;
  MMD_SA.THREEX.get_model(0).model.materials.forEach(m=>{
// https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-materials-mtoon/src/MToonMaterial.ts#L411
    const p = m.userData.gltfExtensions.VRMC_materials_mtoon;
    if ('parametricRimFresnelPowerFactor' in p) {
      m.parametricRimFresnelPowerFactor =  p.parametricRimFresnelPowerFactor;
    }
    else {
      m.parametricRimColorFactor.setRGB(0,0,0);
      m.parametricRimFresnelPowerFactor = 1;
    }

    m.parametricRimLiftFactor = (('parametricRimLiftFactor' in p) ? p.parametricRimLiftFactor : 0);
  });
}
            },

            get enabled() { return params.enabled; },
            set enabled(v) {
params.enabled = !!v;
this.gui.controllers[0].updateDisplay();

this.mix_pass.enabled = v;

if (v) {
  if (!PPE.enabled)
    PPE.enabled = true;
}
else {
  if (PPE_list.every(n=>!PPE[n].enabled))
    PPE.enabled = false;
}

this.setup_rim_light();
            },

          };

          return UnrealBloom;
        })(),
      };

      return PPE;
};
