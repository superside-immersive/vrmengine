// MMD_SA WebXR — AR/VR session management
// Extracted from MMD_SA.js (WebXR property IIFE)

window.MMD_SA_createWebXR = function () {
    var xr;
    var _camera;

    var createAnchor_compatibility_mode;

    window.addEventListener("MMDStarted", function () {
      _camera = MMD_SA._trackball_camera.object.clone()

      var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
      if (AR_options && AR_options.dom_overlay) {
        AR_options.dom_overlay.root = (AR_options.dom_overlay.root && document.getElementById(AR_options.dom_overlay.root)) || document.body;//document.documentElement;//
      }
    });

    window.addEventListener("SA_AR_dblclick", (function () {
      function update_obj_default(model_mesh, first_call) {
xr.hit_ground_y = xr.hitMatrix_anchor.decomposed[0].y;
xr.hit_ground_y_lowest = (xr.hit_ground_y_lowest == null) ? xr.hit_ground_y : Math.min(xr.hit_ground_y, xr.hit_ground_y_lowest);

if (first_call) {
  model_mesh.lookAt(MMD_SA.TEMP_v3.copy(model_mesh.position).add(xr.camera._pos_XR).sub(xr.hitMatrix_anchor.decomposed[0]).setY(model_mesh.position.y))
  MMD_SA_options.mesh_obj_by_id["CircularSpectrumMESH"] && MMD_SA_options.mesh_obj_by_id["CircularSpectrumMESH"]._obj.rotation.setEulerFromQuaternion(model_mesh.quaternion)
}
      }

      function update_anchor(hit, update_obj) {
function init_anchor(anchor) {
//  DEBUG_show("anchor created")
  if (model_mesh._anchor) {
    if (model_mesh._anchor.delete)
      model_mesh._anchor.delete()
    else
      model_mesh._anchor.detach()
    xr.anchors.delete(model_mesh._anchor)
  }
  model_mesh._anchor = anchor

  anchor._data = {
    obj: model_mesh
   ,update: update_obj
  };
  xr.anchors.add(anchor)
}

const AR_options = MMD_SA_options.WebXR.AR;
let model_mesh = THREE.MMD.getModels()[0].mesh;

xr.hitMatrix_anchor = {
  obj: xr.hitMatrix.obj.clone()
 ,decomposed: xr.hitMatrix.decomposed.slice()
 ,_pos_: xr.hitMatrix.decomposed[0]
 ,game_geo: {
    position: model_mesh.position.clone().setY(0)
  }
};

if (!update_obj)
  update_obj = update_obj_default
update_obj(model_mesh, true)

if (xr.can_requestHitTestSource && hit.createAnchor && (AR_options.anchors_enabled !== false)) {
  if (!createAnchor_compatibility_mode) {
    hit.createAnchor().then(init_anchor).catch(function (err) {
      createAnchor_compatibility_mode = true
    });
  }
  if (createAnchor_compatibility_mode) {
    hit.createAnchor(new XRRigidTransform()).then(init_anchor).catch(function (err) {
      DEBUG_show(".createAnchor ERROR:" + err)
    });
  }
}

xr.hit_found = true

try {
  xr.xrViewerSpaceHitTestSource && xr.xrViewerSpaceHitTestSource.cancel();
}
catch (err) { DEBUG_show("FAILED: xr.xrViewerSpaceHitTestSource.cancel()") }
xr.xrViewerSpaceHitTestSource = null
xr.hits_searching = false

xr.reticle.visible = false

xr.restore_scene()
MMD_SA.reset_gravity()

let ao = SL_MC_video_obj && SL_MC_video_obj.vo && SL_MC_video_obj.vo.audio_obj;
if (ao && ao.paused) {
  SL_MC_Play()
}

if (MMD_SA_options.Dungeon) {
  MMD_SA_options.Dungeon.object_click_disabled = false
}
      }

      return function (e) {
const AR_options = MMD_SA_options.WebXR.AR;
if (xr.reticle.visible) {
  e.detail.result.return_value = true

  let update_obj

  let axis = xr.hitMatrix.decomposed[3];
//DEBUG_show(axis.toArray().join("\n"))

  if (Math.abs(axis.y) < 0.5) {
//DEBUG_show("wall hit",0,1)
    if (!AR_options.onwallhit) {
      DEBUG_show("(Model cannot be placed here.)", 3)
      return
    }
    if (AR_options.onwallhit(e)) {
      return
    }
    update_obj = e.detail.result.update_obj
  }
  else {
//DEBUG_show("ground hit",0,1)
    if (AR_options.ongroundhit) {
      if (AR_options.ongroundhit(e)) {
        return
      }
      update_obj = e.detail.result.update_obj
    }
  }

  xr._update_anchor = function (hit) { update_anchor(hit, update_obj) };
}
else if (xr.hit_found && AR_options.item_reticle_id && xr.session.domOverlayState && !e.detail.is_item) {
  e.detail.result.return_value = true
  DEBUG_show("(Use item to reactivate AR reticle.)",3)
}
else if (xr.hit_found) {
  e.detail.result.return_value = true

  xr.hit_found = false
  xr.reticle.position.copy(xr.hitMatrix_anchor.game_geo.position)
  xr.reticle.visible = true
//  document.getElementById("SL_Host").style.visibility = "hidden"

  if (MMD_SA_options.Dungeon) {
    MMD_SA_options.Dungeon.object_click_disabled = true
  }
}
      };
    })());

    var zoom_scale = 1
    var _zoom_distance_last

    var e_touch = {
      touches: [
        { pageX:0, pageY:0 }
       ,{ pageX:0, pageY:0 }
      ]
    };

    function touchstart(e) {
if (e.touches.length != 2) return

var dx = e.touches[0].pageX - e.touches[1].pageX;
var dy = e.touches[0].pageY - e.touches[1].pageY;
_zoom_distance_last = Math.sqrt( dx * dx + dy * dy );
    }

    function touchmove(e) {
if (e.touches.length != 2) return

var dx = e.touches[0].pageX - e.touches[1].pageX;
var dy = e.touches[0].pageY - e.touches[1].pageY;
var dis = Math.sqrt( dx * dx + dy * dy );
xr.zoom_scale = zoom_scale * _zoom_distance_last/dis;
_zoom_distance_last = dis
    }

    function DOM_event_dblclick(e) {
e.stopPropagation();
e.stopImmediatePropagation();
e.preventDefault();
//DEBUG_show(Date.now())

//SA_AR_dblclick
var result = { return_value:null }
window.dispatchEvent(new CustomEvent("SA_AR_dblclick", { detail:{ e:e, result:result } }));
if (result.return_value) {
  return
}
    }

    xr = {
  can_AR: false

 ,enter_AR: async function () {
if (!this.can_AR) {
  DEBUG_show("(AR not supported by this device)", 2)
  return
}
if (!MMD_SA.MMD_started) {
  DEBUG_show("(AR not available before MMD loading is complete)", 3)
  return
}
if (this.session) {
  DEBUG_show("(XR session already active)", 2)
  return
}

this.user_camera.hide()

EV_sync_update.requestAnimationFrame_auto = false
if (RAF_timerID) {
  cancelAnimationFrame(RAF_timerID)
  RAF_timerID = null
}

const AR_options = MMD_SA_options.WebXR.AR;
try {
// https://immersive-web.github.io/dom-overlays/
// https://klausw.github.io/three.js/examples/webvr_lorenzattractor.html
  let options = (xr.can_requestHitTestSource) ? {requiredFeatures:["hit-test"]} : {};
  if (AR_options.dom_overlay && (AR_options.dom_overlay.enabled !== false)) {
    options.domOverlay = {root:AR_options.dom_overlay.root};
    options.optionalFeatures = ["dom-overlay","dom-overlay-for-handheld-ar"];
  }
  if (AR_options.light_estimation_enabled !== false) {
    if (!options.optionalFeatures)
      options.optionalFeatures = []
    options.optionalFeatures.push("light-estimation")
  }
  if (AR_options.anchors_enabled !== false) {
    if (!options.optionalFeatures)
      options.optionalFeatures = []
    options.optionalFeatures.push("anchors")
  }
  const session = await navigator.xr.requestSession('immersive-ar', options);

  this.onSessionStart(session)
}
catch (err) {
  console.error(err)
//  DEBUG_show("(AR session failed 01)")

  try {
// for Chrome 80+
    let options = {};
    if (AR_options.dom_overlay && (AR_options.dom_overlay.enabled !== false)) {
      options.optionalFeatures = ["dom-overlay","dom-overlay-for-handheld-ar"];
    }
    const session = await navigator.xr.requestSession('immersive-ar', options);

    this.onSessionStart(session)
  }
  catch (err2) {
    console.error(err2)
    DEBUG_show("(AR session failed 02)")

    EV_sync_update.requestAnimationFrame_auto = true
    if (RAF_timerID) {
      cancelAnimationFrame(RAF_timerID)
      RAF_timerID = null
    }
    RAF_timerID = requestAnimationFrame(Animate_RAF)
  }
}
  }

 ,input_event: { inputSources:[], touches:[] }

 ,get zoom_scale() { return zoom_scale; }
 ,set zoom_scale(v) {
zoom_scale = v;
window.dispatchEvent(new CustomEvent("SA_AR_zoom_scale_update"));
  }

 ,hits: []
 ,hits_searching: false
 ,hit_found: false

 ,anchors: new Set()

 ,xrViewerSpaceHitTestSource: null
 ,xrTransientInputHitTestSource: null
 ,onSessionStart: async function (session) {
const THREE = MMD_SA.THREEX.THREE;

this.session = session

const AR_options = MMD_SA_options.WebXR.AR;

session.addEventListener('end', this.onSessionEnd);

session.addEventListener('inputsourceschange', function (e) {
  var inputSources = e.session.inputSources;
  xr.input_event.inputSources = []
  for (var i = 0, i_max = inputSources.length; i < i_max; i++) {
    xr.input_event.inputSources[i] = inputSources[i];
  }
//DEBUG_show(xr.input_event.inputSources.length,0,1)
  xr.input_event.touches = xr.input_event.inputSources.filter(inputSource => ((inputSource.targetRayMode == "screen") && inputSource.gamepad));
});

session.addEventListener('selectstart', function (e) {
  var time = Date.now()
  xr.input_event.touchdown = time
});

session.addEventListener('selectend', function (e) {
  if (!xr.input_event.touchdown)
    return

  var result

  var time = Date.now()
  var time_diff = time - xr.input_event.touchdown
  xr.input_event.touchdown = null

  if (time_diff > 400)
    return

  if (xr.input_event.click && (time - xr.input_event.click < 400)) {
    xr.input_event.click = false

    result = { return_value:null }
    window.dispatchEvent(new CustomEvent("SA_AR_dblclick", { detail:{ e:e, result:result } }));
    if (result.return_value) {
      return
    }
  }

  result = { return_value:null }
  window.dispatchEvent(new CustomEvent("SA_AR_click", { detail:{ e:e, result:result } }));
  if (result.return_value) {
    return
  }

  xr.input_event.click = time
});

session.addEventListener('select', function (e) {
  var time = Date.now()
  if (xr.screen_clicked && (time - xr.screen_clicked < 400))
    xr.screen_dblclicked = time
  xr.screen_clicked = time
});

/*
// https://github.com/immersive-web/hit-test/blob/master/hit-testing-explainer.md
// https://storage.googleapis.com/chromium-webxr-test/r740830/proposals/phone-ar-hit-test.html
        session.requestHitTestSourceForTransientInput({
          profile : "generic-touchscreen"
        }).then(transient_input_hit_test_source => {
          console.debug("Hit test source for generic touchscreen created!");
          xrTransientInputHitTestSource = transient_input_hit_test_source;
        });
*/

let c_host = (returnBoolean("CSSTransform3DDisabledForContent")) ? document.getElementById("Lbody_host") : document.getElementById("Lbody");
xr.zoom_scale = 1;
c_host.addEventListener( 'touchstart', touchstart, false );
c_host.addEventListener( 'touchmove', touchmove, false );

this.camera = MMD_SA._trackball_camera.object

// abstract object (the actual render is renderer.obj)
this.renderer = MMD_SA.THREEX.renderer;
//this.renderer.autoClear = false;

this.gl = this.renderer.obj.getContext();

this.use_dummy_webgl = session.domOverlayState && AR_options.dom_overlay && AR_options.dom_overlay.use_dummy_webgl;
if (this.use_dummy_webgl) {
  DEBUG_show("Use dummy WebGL (AR)",5)
  if (!this.user_camera.initialized)
    this.gl = document.createElement("canvas").getContext("webgl2");
}

try {
  await this.gl.makeXRCompatible();

  let DPR = this.renderer.devicePixelRatio / window.devicePixelRatio
  let framebufferScaleFactor
  if (DPR != 1) {
    framebufferScaleFactor = DPR
    this.renderer.devicePixelRatio = window.devicePixelRatio
  }
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.gl, ((framebufferScaleFactor||AR_options.framebufferScaleFactor||System._browser.url_search_params.xr_fb_scale) && {framebufferScaleFactor:Math.max(0,Math.min(1,framebufferScaleFactor||AR_options.framebufferScaleFactor||parseFloat(System._browser.url_search_params.xr_fb_scale)||1))}) || null) });
  this.frameOfRef = await session.requestReferenceSpace('local');
  this.frameOfRef_viewer = await session.requestReferenceSpace('viewer');
}
catch (err) {
  session.end()
  console.error(err)
  DEBUG_show("AR session error:" + err,0,1)
  return
}

this.light_color_base = jThree("#MMD_DirLight").three(0).color.clone()
this.light_position_base = jThree("#MMD_DirLight").three(0).position.clone()
if (AR_options.light_estimation_enabled !== false) {
//DEBUG_show(".requestLightProbe:" + ("requestLightProbe" in XRSession.prototype))
  if (session.requestLightProbe) {
    try {
      this.lightProbe = await session.requestLightProbe();
//      DEBUG_show(".requestLightProbe OK")
    }
    catch (err) {
      DEBUG_show(".requestLightProbe ERROR:" + err)
    }
  }
  else if (session.updateWorldTrackingState) {
    try {
      session.updateWorldTrackingState({
// https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/modules/xr/xr_world_tracking_state.idl
//        "planeDetectionState" : { "enabled" : true}
        "lightEstimationState" : { "enabled" : true}
      });
    }
    catch (err) {
      DEBUG_show("light-estimation failed to init")
    }
  }
}

if (!this.reticle) {
  let geometry = new THREE.RingGeometry(0.1, 0.11, 24, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90)));
  let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  let reticle0 = new THREE.Mesh(geometry, material);

  this.reticle = new THREE.Object3D()
  if (!MMD_SA.THREEX.enabled) this.reticle.useQuaternion = true
  this.reticle.add(reticle0)

  MMD_SA.THREEX.scene.add(this.reticle)
  this.reticle.scale.set(10,10,10)

  Object.defineProperty(this.reticle, "visible", {
    get: function () {
return this._visible_;
    }

   ,set: function (v) {
this._visible_ = reticle0.visible = v
if (xr.ground_plane)
  xr.ground_plane.visible = !v
    }
  });

  if (AR_options.dom_overlay && (AR_options.dom_overlay.enabled !== false)) {
    AR_options.dom_overlay.root.addEventListener('beforexrselect', (ev) => {
      ev.preventDefault();
    });
  }
}
this.reticle.visible = false

this.hit_ground_y = null
this.hit_ground_y_lowest = null

MMD_SA.reset_camera()
MMD_SA._reset_camera = MMD_SA.reset_camera
MMD_SA.reset_camera = function () {}
MMD_SA._trackball_camera.enabled = false
this.camera.matrixAutoUpdate = false;

self.THREE.MMD.getModels()[0].mesh.visible = false
//document.getElementById("SL_Host").style.visibility = "hidden"

let ao = SL_MC_video_obj && SL_MC_video_obj.vo && SL_MC_video_obj.vo.audio_obj;
if (ao && !ao.paused) {
  SL_MC_Play()
}

if (1) {
  if (!this.use_dummy_webgl) {
    document.getElementById("SL").style.visibility = MMD_SA.THREEX.SL.style.visibility = "hidden"
  }
  document.getElementById("LdesktopBG_host").style.visibility = "hidden"
  document.getElementById("Lquick_menu").style.display = "none"

  Ldebug.style.posLeft = Ldebug.style.posTop = 10

  c_host.addEventListener("dblclick", DOM_event_dblclick)
// push the .onclick AFTER the AR event handler
  if (c_host.ondblclick) {
    c_host._ondblclick = c_host.ondblclick
    c_host.addEventListener( 'dblclick', c_host.ondblclick)
    c_host.ondblclick = null
  }
  else if (c_host._ondblclick) {
    c_host.removeEventListener("dblclick", c_host._ondblclick)
    c_host.addEventListener("dblclick", c_host._ondblclick)
  }
}

window.dispatchEvent(new CustomEvent("SA_AR_onSessionStarted"));

session.requestAnimationFrame(xr.onARFrame);
  }

 ,restore_scene: function () {
THREE.MMD.getModels()[0].mesh.visible = true
MMD_SA.SpeechBubble.hide();
//System._browser.on_animation_update.add(function () { document.getElementById("SL_Host").style.visibility = "visible"; },0,0);
  }

 ,onSessionEnd: function () {
this.frameOfRef = null
this.frameOfRef_viewer = null
this.session = null

this.xrViewerSpaceHitTestSource = null
this.xrTransientInputHitTestSource = null

this.hits = []
this.hits_searching = false
this.hit_found = false
this.hitMatrix = null
this.hitMatrix_anchor = null
this._update_anchor = null

this.hit_ground_y = null
this.hit_ground_y_lowest = null

this.reticle.visible = false

this.lightProbe = null

for (const anchor of this.anchors) {
  anchor._data.obj._anchor = null
}
this.anchors.clear()

let c_host = (returnBoolean("CSSTransform3DDisabledForContent")) ? document.getElementById("Lbody_host") : document.getElementById("Lbody");
xr.zoom_scale = 1;
c_host.removeEventListener( 'touchstart', touchstart, false );
c_host.removeEventListener( 'touchmove', touchmove, false );

jThree("#MMD_DirLight").three(0).color.copy(this.light_color_base)
jThree("#MMD_DirLight").three(0).position.copy(this.light_position_base)

this.input_event = { inputSources:[], touches:[] }

var model_mesh = THREE.MMD.getModels()[0].mesh
this.restore_scene()

model_mesh.position.y = 0
model_mesh.quaternion.set(0,0,0,1)
MMD_SA_options.mesh_obj_by_id["CircularSpectrumMESH"] && MMD_SA_options.mesh_obj_by_id["CircularSpectrumMESH"]._obj.rotation.set(0,0,0)

if (MMD_SA_options.motion_shuffle_list_default && (MMD_SA_options.motion_shuffle_list_default[0] != MMD_SA_options._motion_shuffle_list_default[0])) {
  MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
  MMD_SA._force_motion_shuffle = true
}

MMD_SA.reset_camera = MMD_SA._reset_camera
MMD_SA.reset_camera()
MMD_SA._trackball_camera.enabled = true
this.camera.matrixAutoUpdate = true

EV_sync_update.requestAnimationFrame_auto = true
if (RAF_timerID) {
  cancelAnimationFrame(RAF_timerID)
  RAF_timerID = null
}
RAF_timerID = requestAnimationFrame(Animate_RAF)

if (1) {
  document.getElementById("SL").style.visibility = MMD_SA.THREEX.SL.style.visibility = "inherit"
  document.getElementById("LdesktopBG_host").style.visibility = "visible"
  document.getElementById("Lquick_menu").style.display = "block"

  Ldebug.style.posLeft = Ldebug.style.posTop = 0

  c_host.removeEventListener("dblclick", DOM_event_dblclick)
}

this.renderer.device_framebuffer = null;
window.dispatchEvent(new Event('resize'));

this.user_camera.hide()

window.dispatchEvent(new CustomEvent("SA_AR_onSessionEnd"));

//DEBUG_show("session ended",0,1)
  }

 ,onARFrame: function (time, frame) {
//let _now = performance.now();
let session = frame.session;
session.requestAnimationFrame(this.onARFrame);

const AR_options = MMD_SA_options.WebXR.AR;

let pose;
try {
  pose = frame.getViewerPose(this.frameOfRef);
} catch (err) { DEBUG_show("Err:no pose",0,1)}

if (pose) {
  let framebuffer_changed = !!this.renderer.device_framebuffer;
  if (!this.use_dummy_webgl || (this.user_camera.initialized && !this.user_camera.visible)) {
    this.renderer.device_framebuffer = session.renderState.baseLayer.framebuffer;
    if (framebuffer_changed) {
      document.getElementById("SL").style.visibility = MMD_SA.THREEX.SL.style.visibility = "hidden"
    }
  }
  else {
    this.renderer.device_framebuffer = null;
    if (framebuffer_changed) {
      document.getElementById("SL").style.visibility = MMD_SA.THREEX.SL.style.visibility = "inherit"
// this works for both THREE and THREEX
      MMD_SA._renderer.__resize(EV_width, EV_height)
//      window.dispatchEvent(new Event('resize'))
    }
  }

  const DPR = ((MMD_SA.THREEX.enabled) ? 1 : this.renderer.devicePixelRatio) / window.devicePixelRatio;
  for (let view of pose.views) {
    const viewport = session.renderState.baseLayer.getViewport(view);
    this.renderer.obj.setViewport(viewport.x*DPR, viewport.y*DPR, viewport.width*DPR, viewport.height*DPR);

    this.camera.projectionMatrix.fromArray(view.projectionMatrix);
    if (MMD_SA.THREEX.enabled) MMD_SA.THREEX.data.camera.projectionMatrix.fromArray(view.projectionMatrix);
    this.camera.matrix.fromArray(view.transform.matrix);

//    this.camera.updateMatrixWorld(true);
// update .matrixWorld mnaully, to avoid repeated .updateMatrixWorld from below (to avoid issues for positional audio, etc)
if ( this.camera.parent === undefined ) {
  this.camera.matrixWorld.copy( this.camera.matrix );
}
else {
  this.camera.matrixWorld.multiplyMatrices( this.camera.parent.matrixWorld, this.camera.matrix );
}

    this.camera._pos_XR = (this.camera._pos_XR||new THREE.Vector3()).getPositionFromMatrix(this.camera.matrix);

    _camera.matrixWorld.copy(this.camera.matrixWorld);
    _camera.projectionMatrix.copy(this.camera.projectionMatrix);
  }
//DEBUG_show(parseInt(performance.now()-_now))

// https://immersive-web.github.io/webxr/#xrinputsource
// https://github.com/immersive-web/webxr-gamepads-module/blob/master/gamepads-module-explainer.md
  let is_touchstart
  let touches = xr.input_event.touches
  touches.forEach(function (touch) {
    if (!touch._initialized) {
      touch._initialized = true
      is_touchstart = true
    }
  });
  if (!session.domOverlayState && (touches.length == 2)) {
    e_touch.touches[0].pageX = touches[0].gamepad.axes[0]
    e_touch.touches[0].pageY = touches[0].gamepad.axes[1]
    e_touch.touches[1].pageX = touches[1].gamepad.axes[0]
    e_touch.touches[1].pageY = touches[1].gamepad.axes[1]
    if (is_touchstart) {
      touchstart(e_touch)
    }
    else {
      touchmove(e_touch)
    }
//DEBUG_show(Date.now()+":"+new THREE.Matrix4().fromArray(frame.getPose(touches[0].targetRaySpace, this.frameOfRef).transform.matrix).decompose()[0].toArray());
  }
//xr.input_event.touches.length && DEBUG_show('(v2)'+Date.now()+'('+xr.input_event.touches.length+'):'+xr.input_event.touches[0]._data)

  let hit_result = this.hit_test(frame)
  if (hit_result) {
    if (!this.hit_found && hit_result.hitMatrix) {
      if (this.hitMatrix_anchor) {
        this.reticle.position.copy(this.hitMatrix_anchor.game_geo.position).add(MMD_SA.TEMP_v3.copy(this.hitMatrix.decomposed[0]).sub(this.hitMatrix_anchor.decomposed[0]).multiplyScalar(10*zoom_scale));
      }
      else {
        this.reticle.position.copy(this.hitMatrix.decomposed[0]).multiplyScalar(10);
      }
      this.reticle.quaternion.copy(this.hitMatrix.decomposed[1]);

      this.reticle.visible = true;
    }
  }

  try {
    if (AR_options.light_estimation_enabled !== false) {
      let lightEstimate, li, ld
      if (this.lightProbe) {
// https://github.com/immersive-web/lighting-estimation/blob/master/lighting-estimation-explainer.md
        lightEstimate = frame.getLightEstimate(this.lightProbe)
        li = lightEstimate.primaryLightIntensity
        ld = lightEstimate.primaryLightDirection
      }
      else if (frame.worldInformation && frame.worldInformation.lightEstimation) {
// https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/modules/xr/xr_world_information.idl
// https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/modules/xr/xr_light_estimation.idl
// https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/modules/xr/xr_light_probe.idl
        lightEstimate = frame.worldInformation.lightEstimation.lightProbe
        li = lightEstimate.mainLightIntensity
        ld = lightEstimate.mainLightDirection
      }
      if (lightEstimate) {
//DEBUG_show([ld.x, ld.y, ld.z, ld.w])
        let L = jThree("#MMD_DirLight").three(0)
//        L.position.copy(ld).multiplyScalar(MMD_SA_options.light_position_scale)
        let c = L.color
        c.copy(this.light_color_base)
        c.r *= Math.min(1.5, 0.75 * Math.sqrt(li.x))
        c.g *= Math.min(1.5, 0.75 * Math.sqrt(li.y))
        c.b *= Math.min(1.5, 0.75 * Math.sqrt(li.z))
      }
    }
  }
  catch (err) { DEBUG_show(".lightEstimation failed") }

  const trackedAnchors = frame.trackedAnchors;
  if (trackedAnchors) {
// https://github.com/immersive-web/anchors/blob/master/explainer.md
// view-source:https://storage.googleapis.com/chromium-webxr-test/r695783/proposals/phone-ar-plane-detection-anchors.html
    try {
      for (const anchor of trackedAnchors) {
//DEBUG_show(time+'\n'+JSON.stringify(frame.getPose(anchor.anchorSpace, this.frameOfRef).transform.position))
//if ((time != anchor.lastChangedTime) || !anchor._data || !anchor._data.update)
if (!xr.anchors.has(anchor) || !anchor._data || !anchor._data.update)
  continue

let pose = frame.getPose(anchor.anchorSpace, this.frameOfRef);
if (!pose)
  continue
let transform = pose.transform;
if (!transform)
  continue

let checksum = transform.matrix.reduce((n0,n1)=>n0+n1);
if (checksum == xr.hitMatrix_anchor._checksum)
  continue

xr.hitMatrix_anchor._checksum = checksum
xr.hitMatrix_anchor.obj = (xr.hitMatrix_anchor.obj||new THREE.Matrix4()).fromArray(transform.matrix);
xr.hitMatrix_anchor.decomposed = [new THREE.Vector3().copy(transform.position), new THREE.Quaternion().copy(transform.orientation), null];
xr.hitMatrix_anchor.decomposed[3] = new THREE.Vector3(0,1,0).applyQuaternion(xr.hitMatrix_anchor.decomposed[1]);

anchor._data.update(anchor._data.obj);

//DEBUG_show(time+','+xr.anchors.size+'/'+trackedAnchors.size+':anchor(v4)\n'+MMD_SA.TEMP_v3.copy(xr.hitMatrix_anchor._pos_).sub(xr.hitMatrix_anchor.decomposed[0]).toArray().join("\n"))
      }
    }
    catch (err) { DEBUG_show('AE:'+err) }
  }

// xyz
  let camera_ref = (this.hitMatrix_anchor && this.hitMatrix_anchor.decomposed) || (this.hitMatrix && this.hitMatrix.decomposed);
  if (camera_ref) {
    let camera_diff = MMD_SA.TEMP_v3.getPositionFromMatrix(this.camera.matrix).sub(camera_ref[0]);
    this.camera.matrix.elements[12] += camera_diff.x * (zoom_scale-1)
    this.camera.matrix.elements[13] += camera_diff.y * (zoom_scale-1)
    this.camera.matrix.elements[14] += camera_diff.z * (zoom_scale-1)
  }

  this.camera.matrix.elements[12] *= 10
  this.camera.matrix.elements[13] *= 10
  this.camera.matrix.elements[14] *= 10

  if (this.hitMatrix_anchor) {
    this.camera.matrix.elements[12] += this.hitMatrix_anchor.game_geo.position.x - this.hitMatrix_anchor.decomposed[0].x*10
    this.camera.matrix.elements[13] += this.hitMatrix_anchor.game_geo.position.y - this.hitMatrix_anchor.decomposed[0].y*10
    this.camera.matrix.elements[14] += this.hitMatrix_anchor.game_geo.position.z - this.hitMatrix_anchor.decomposed[0].z*10
  }

  if (this.user_camera.visible && this.user_camera.mirror_3D) {
    let cm_decomposed = this.camera.matrix.decompose()
    this.camera.position.copy(cm_decomposed[0])
    this.camera.matrix.makeFromPositionQuaternionScale(cm_decomposed[0], cm_decomposed[1].multiply(MMD_SA.TEMP_q.setFromAxisAngle(MMD_SA.TEMP_v3.set(0,1,0), Math.PI)), cm_decomposed[2])
  }
  else {
    this.camera.position.getPositionFromMatrix(this.camera.matrix)
  }

  this.camera.updateMatrixWorld(true);
}
//else { DEBUG_show(0,0,1) }

window.dispatchEvent(new CustomEvent("SA_AR_onARFrame"));

if (1||!this.use_dummy_webgl) {
// a trick to ensure that no frame is skipped
  RAF_frame_time_delayed = 999
  Animate_RAF(time)
}
else {
  if (!RAF_timerID)
    RAF_timerID = requestAnimationFrame(Animate_RAF)
}
  }

 ,hit_test: function (frame) {
if (this.hit_found)
  return {}

// https://storage.googleapis.com/chromium-webxr-test/r740830/proposals/phone-ar-hit-test.html
if (xr.xrViewerSpaceHitTestSource) {
  this.hits = frame.getHitTestResults(xr.xrViewerSpaceHitTestSource);
//DEBUG_show(Date.now()+'/'+this.hits.length)
}

if (this.hits.length) {
  let hit = this.hits[0]
  this.hits = []
  this.hitMatrix = this.hitMatrix || {};
  this.hitMatrix.obj = this.hitMatrix.obj || new THREE.Matrix4();
  if (this.can_requestHitTestSource) {
    let transform = hit.getPose(this.frameOfRef).transform;
    this.hitMatrix.obj.fromArray(transform.matrix);
    this.hitMatrix.decomposed = [new THREE.Vector3().copy(transform.position), new THREE.Quaternion().copy(transform.orientation), null];
  }
  else {
    this.hitMatrix.obj.fromArray(hit.hitMatrix);
    this.hitMatrix.decomposed = this.hitMatrix.obj.decompose();
  }
  this.hitMatrix.decomposed[3] = new THREE.Vector3(0,1,0).applyQuaternion(this.hitMatrix.decomposed[1]);

  if (this._update_anchor) {
    this._update_anchor(hit)
    this._update_anchor = null
    return {}
  }

  return { hitMatrix:this.hitMatrix  };
}

if (!this.hits_searching) {
  this.hits_searching = true

  if (xr.can_requestHitTestSource) {
// https://storage.googleapis.com/chromium-webxr-test/r740830/proposals/phone-ar-hit-test.html
    this.session.requestHitTestSource({
      space : this.frameOfRef_viewer,
//      entityTypes : ["plane"],
          //space : xrLocalFloor, // WIP: change back to viewer
          //space : xrOffsetSpace, // WIP: change back to viewer
//      offsetRay : xrray
          //offsetRay : new XRRay(new DOMPointReadOnly(0,.5,-.5), new DOMPointReadOnly(0, -0.5, -1)) // WIP: change back to default
    }).then((hitTestSource) => {
      xr.xrViewerSpaceHitTestSource = hitTestSource;
    }).catch(error => {
//          console.error("Error when requesting hit test source", error);
      xr.hits_searching = false;
    });
  }
  else {
    this.raycaster = this.raycaster || new THREE.Raycaster();
    this.raycaster.setFromCamera({ x:0, y:0 }, _camera);
    const ray = this.raycaster.ray;

    let xrray = new XRRay(new DOMPoint(ray.origin.x, ray.origin.y, ray.origin.z), new DOMPoint(ray.direction.x, ray.direction.y, ray.direction.z));

    this.session.requestHitTest(xrray, this.frameOfRef).then(function (hits) {
      xr.hits = hits;
      xr.hits_searching = false;
    }).catch(function (err) {
      xr.hits_searching = false;
    });
  }
}

return null
  }

 ,user_camera: System._browser.camera

    };

    try {
if (navigator.xr) {
  if (navigator.xr.isSessionSupported && XRSession.prototype.requestHitTestSource) {
    navigator.xr.isSessionSupported('immersive-ar').then(()=>{
      xr.can_AR = true
      xr.can_requestHitTestSource = true
    }).catch((err)=>{});
  }
  else if (XRSession.prototype.requestHitTest) {
    navigator.xr.supportsSession('immersive-ar').then(()=>{
      xr.can_AR = true
      xr.can_requestHitTest = true
    }).catch((err)=>{});
  }
}
    } catch (err) { console.error(err) }

    xr.onSessionEnd = xr.onSessionEnd.bind(xr);
    xr.onARFrame = xr.onARFrame.bind(xr);

    return xr;
};
