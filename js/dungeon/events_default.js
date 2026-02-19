// events_default.js — extracted from dungeon.js (Step 6B)
// Default event/dialogue data for dungeon system

MMD_SA_options.Dungeon.events_default = {
    "_PLAYER_MANUAL_": [
//0
      [
        {
          message: {
  content: "1. Basic Control\n2. Battle Control\n3. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:2 }
   ,{ key:3 }
  ]
          }
        }
      ]
//1
     ,[
        {
          message: {
  content: "Keyboard Control:\n* Move: WASD\n* Jump: SPACE\n* Change Camera: ↑\n* Toggle \"TPS Control Mode\" (*): ↓\n* Dialog/Event Branch: Numpad 1-9"
 ,bubble_index: 3
 ,para: { scale:1.5, font_scale:1 }
          }
        }
       ,{
          message: {
  content: "(*) - In default control mode, move the player character (PC) with WS keys, and rotate (PC and camera) with AD keys. In \"TPS Control Mode\", all WASD keys move PC with camera angle fixed. To change movement direction and camera angle, drag the mouse pointer."
 ,bubble_index: 3
 ,para: { scale:1.5, font_scale:1 }
          }
        }
       ,{
          message: {
  content: "Mouse Control:\n* Camera:\n - Drag/Wheel to rotate/zoom\n - Ctrl+Drag to pan\n - Double-click to reset\n* Item:\n - Double-click to use\n - Drag to re-position\n* PC/NPC/Object:\n  - Single/Double-click to interact"
 ,bubble_index: 3
 ,para: { scale:1.5, row_max:10, text_offset:{y:-10} }
          }
        }
      ]
//2
     ,[
        {
          message: {
  content: "Keyboard Combat Control:\n* Move: WASD\n* Jump: SPACE\n* Lock/Select Target: ←→\n* Unlock Target: ↓\n* Attack Combo (*): Numpad 4-9,+\n* Parry (Movable): Numpad 0"
 ,bubble_index: 3
 ,para: { scale:1.5 }
          }
        }
       ,{
          message: {
  content: "(*) - Attacks are combinations of different Numpad keys.\nExample: 5,5,4,6\nSome attack combos required the + key pressed.\nExample: +8,5,9"
 ,bubble_index: 3
 ,para: { scale:1.5 }
          }
        }
       ,{
          message: {
  content: "1. Full combo list\n2. End"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:3 }
   ,{ key:2 }
  ]
          }
        }
      ]
//3
     ,[
        {
          message: {
  content: "1) +8,5,9 (3RP LK LP)\n2) 4,4,4,5 (鬼哭連脚)\n3) 7,7,8 (鬼哭連拳)\n4) 45,45 (立ち中K-中K)\n5) 5,5,4,6 (ストンピングダブルニー)"
 ,bubble_index: 3
 ,para: { scale:1.5 }
          }
        }
       ,{
          message: {
  content: "6) 5,4,5,6 (アサルトラッシュ～ブルーサンダー)\n7) +8,7,9 (マッハコンビネーション)\n8) 45,56 (ステップキックソバット)\n9) +4,8,8,9 (ブラストコンビネーション)\n10) 8,7,7,5 (ラピッドフィストロー)"
 ,bubble_index: 3
 ,para: { scale:1.5 }
          }
        }
       ,{
          message: {
  content: "11) 456 (踵斧)\n12) 7,8,7,8,9 (弱P弱P中P強P強P)\n13) 4,7,8 (修羅覇王靠華山)\n14) +7,5,6 (ダークナイトコンビネーション)\n15) 78,78,8,9 (サラマンダーコンビネーション)"
 ,bubble_index: 3
 ,para: { scale:1.5 }
          }
        }
       ,{
          message: {
  content: "16) +7,7,8,9 (フラッシュアサルトコンボ-ターンイン-ボディストレート)\n17) 8,8,7,6 (基本攻撃)\n18) +4,5,8,9 (Albert-combo6)\n19) 56,56 (Albert-somersault-kick)"
 ,bubble_index: 3
 ,para: { scale:1.5 }
          }
        }
      ]
    ]

   ,"_SETTINGS_": [
//0
      [
        {
          message: {
  content: "1. Graphics Presets (PC)\n2. Graphics Effects (Scene)\n3. WebXR Options\n4. UI and Overlays\n5. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:6 }
   ,{ key:3, branch_index:10 }
   ,{ key:4, branch_index:11 }
   ,{ key:5 }
  ]
          }
        }
      ]
// 1
     ,[
        {
          message: {
  content: "1. MMD Default (i.e. MME effects OFF)\n2. Imported Model Default (SO4/HDR2)\n3. Adult-A (SO2B+/HDR2/AdultS2B+)\n4. Adult-B (SO5B+/HDR5/AdultS2)\n5. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1+1 }
   ,{ key:2, branch_index:1+2 }
   ,{ key:3, branch_index:1+3 }
   ,{ key:4, branch_index:1+4 }
   ,{ key:5 }
  ]
          }
        }
      ]
// 2
     ,[
        {
  func: function () {
MMD_SA_options.MME.self_overlay = { enabled:false }
MMD_SA_options.MME.HDR = { enabled:false }
MMD_SA_options.MME.serious_shader = { enabled:false }
//MMD_SA_options.MME.SAO = { disabled_by_material:[] }
MMD_SA._MME_uniforms_updated_ = Date.now()
System._browser.update_tray()
  }
 ,ended: true
        }
      ]
// 3
     ,[
        {
  func: function () {
MMD_SA_options.MME.self_overlay = { enabled:true, opacity:0.4 }
MMD_SA_options.MME.HDR = { enabled:true, opacity:0.2 }
MMD_SA_options.MME.serious_shader = { enabled:false }
//MMD_SA_options.MME.SAO = { disabled_by_material:[] }
MMD_SA._MME_uniforms_updated_ = Date.now()
System._browser.update_tray()
  }
 ,ended: true
        }
      ]
// 4
     ,[
        {
  func: function () {
MMD_SA_options.MME.self_overlay = { enabled:true, opacity:0.2, brightness:1 }
MMD_SA_options.MME.HDR = { enabled:true, opacity:0.2 }
MMD_SA_options.MME.serious_shader = { enabled:true, type:"AdultShaderS2", OverBright:1.3, shadow_opacity:0.4 }
//MMD_SA_options.MME.SAO = { disabled_by_material:[] }
MMD_SA._MME_uniforms_updated_ = Date.now()
System._browser.update_tray()
  }
 ,ended: true
        }
      ]
// 5
     ,[
        {
  func: function () {
MMD_SA_options.MME.self_overlay = { enabled:true, opacity:0.5, brightness:1 }
MMD_SA_options.MME.HDR = { enabled:true, opacity:0.5 }
MMD_SA_options.MME.serious_shader = { enabled:true, type:"AdultShaderS2" }
//MMD_SA_options.MME.SAO = { disabled_by_material:[] }
MMD_SA._MME_uniforms_updated_ = Date.now()
System._browser.update_tray()
  }
 ,ended: true
        }
      ]

// 6
     ,[
        {
          message: {
  content: "1. Shadow\n2. Model Outline\n3. 3D Resolution\n4. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:6+1 }
   ,{ key:2, branch_index:6+2 }
   ,{ key:3, branch_index:6+3 }
   ,{ key:4 }
  ]
          }
        }
      ]
// 7
     ,[
        {
  func: function () {
MMD_SA_options.use_shadowMap = !MMD_SA_options.use_shadowMap
MMD_SA.toggle_shadowMap()
DEBUG_show("Shadow:" + ((MMD_SA_options.use_shadowMap && "ON")||"OFF"), 3)
  }
 ,ended: true
        }
      ]
// 8
     ,[
        {
  func: (function () {
    var edgeScale_default = 0
    return function () {
var edgeScale = jThree.MMD.edgeScale
if (edgeScale) {
  edgeScale_default = edgeScale
  edgeScale = 0
}
else
  edgeScale = edgeScale_default
jThree.MMD.edgeScale = edgeScale
DEBUG_show("Model Outline:" + ((edgeScale && "ON")||"OFF"), 3)
    };
  })()
 ,ended: true
        }
      ]
// 9
     ,[
        {
  func: function () {
var is_default_res = (MMD_SA._renderer.devicePixelRatio == window.devicePixelRatio)
MMD_SA._renderer.devicePixelRatio = (is_default_res) ? ((window.devicePixelRatio > 1) ? 1 : 0.5) : window.devicePixelRatio
MMD_SA._renderer.__resize(EV_width, EV_height)
DEBUG_show("3D Resolution:" + (((is_default_res) && (Math.round(MMD_SA._renderer.devicePixelRatio/window.devicePixelRatio*100)+"%")) || "100%"), 3)
  }
 ,ended: true
        }
      ]
// 10
     ,[
        {
          goto_event: { id:"_WEBXR_OPTIONS_", branch_index:0 }
        }
      ]
// 11
     ,[
        {
          message: {
  get content() {
if (System._browser.overlay_mode)
  return System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.user_interface.UI_off' + ((is_mobile) ? '.mobile' : '')) + '\n1. ' + ((System._browser.overlay_mode == 2) ? 'UI: OFF + ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.user_interface.UI_off.green_screen') : System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.user_interface') + ': OFF') + '\n2. ' + System._browser.translation.get('Misc.done');
return '1. ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.user_interface') + ': ON' + ((MMD_SA_options.user_camera.ML_models.enabled && (System._browser.overlay_mode == 0)) ? '\n2. ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.camera_display') + ': ' + ((MMD_SA_options.user_camera.display.video.hidden) ? 'OFF' : ((MMD_SA_options.user_camera.display.video.hidden == null) ? System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.camera_display.non_webcam') : 'ON')) + '\n3. ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.wireframe_display') + ': ' + ((MMD_SA_options.user_camera.display.wireframe.hidden) ? 'OFF' : 'ON') + '\n4. ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.mocap_debug_display') + ': ' + ((MMD_SA_options.user_camera.ML_models.debug_hidden) ? 'OFF' : 'ON') + '\n5. ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.UI_sound_effects') + ': ' + ((MMD_SA_options.Dungeon.inventory.UI.muted)?'OFF':'ON') + '\n6. ' + System._browser.translation.get('Dungeon.UI.tome.settings.UI_and_overlays.UI_language') + ': ' + System._browser.translation.language_info + '\n7. ' + System._browser.translation.get('Misc.done') : '\n2. ' + System._browser.translation.get('Misc.done'));
  }
 ,para: { no_word_break:true }
 ,bubble_index: 3
 ,get branch_list() {
return [
  { key:1, branch_index:12 },
].concat((MMD_SA_options.user_camera.ML_models.enabled && (System._browser.overlay_mode == 0)) ? [
  { key:2, branch_index:13 },
  { key:3, branch_index:14 },
  { key:4, branch_index:15 },
  { key:5, branch_index:16 },
  { key:6, branch_index:17 },
  { key:7, is_closing_event:true }
] : [
  { key:2, is_closing_event:true }
]);
  }
          }
        }
      ]
// 12
     ,[
        {
  func: function () {
let mode = System._browser.overlay_mode
if (++mode > 2)
  mode = 0;
System._browser.overlay_mode = mode;
  }
 ,goto_branch: 11
        }
      ]
// 13
     ,[
        {
  func: function () {
MMD_SA_options.user_camera.display.video.hidden = (MMD_SA_options.user_camera.display.video.hidden == null) ? false : ((MMD_SA_options.user_camera.display.video.hidden) ? null : true);
  }
 ,goto_branch: 11
        }
      ]
// 14
     ,[
        {
  func: function () {
MMD_SA_options.user_camera.display.wireframe.hidden = !MMD_SA_options.user_camera.display.wireframe.hidden;
  }
 ,goto_branch: 11
        }
      ]
// 15
     ,[
        {
  func: function () {
MMD_SA_options.user_camera.ML_models.debug_hidden = !MMD_SA_options.user_camera.ML_models.debug_hidden;
DEBUG_show();
  }
 ,goto_branch: 11
        }
      ]
// 16
     ,[
        {
  func: function () {
MMD_SA_options.Dungeon.inventory.UI.muted = !MMD_SA_options.Dungeon.inventory.UI.muted;
  }
 ,goto_branch: 11
        }
      ]
// 17
     ,[
        {
  func: function () {
const language = ['', 'en', 'ja', 'zh'];
let index = language.indexOf(System._browser.translation.language_full);
if (index == -1) {
  index = 1;
}
else if (++index >= language.length) {
  index = 0;
}

System._browser.translation.language = language[index];
  }
 ,goto_branch: 11
        }
      ]
    ]

   ,"_WEBXR_OPTIONS_": [
//0
      [
        {
          message: {
  content: "1. DOM Overlay\n2. Light Estimation\n3. Anchors\n4. Framebuffer Scale\n5. Check Status\n6. DEBUG TEST\n7. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:2 }
   ,{ key:3, branch_index:3 }
   ,{ key:4, branch_index:4 }
   ,{ key:5, branch_index:8 }
   ,{ key:6, branch_index:10 }
   ,{ key:7 }
  ]
          }
        }
      ]
// 1
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options || !AR_options.dom_overlay) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.dom_overlay.enabled = (AR_options.dom_overlay.enabled !== false) ? false : true;
DEBUG_show("DOM Overlay:" + ((AR_options.dom_overlay.enabled && "ON")||"OFF"), 3)
  }
 ,ended: true
        }
      ]
// 2
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.light_estimation_enabled = (AR_options.light_estimation_enabled !== false) ? false : true;
DEBUG_show("Light Estimation:" + ((AR_options.light_estimation_enabled && "ON")||"OFF"), 3)
  }
 ,ended: true
        }
      ]
// 3
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.anchors_enabled = (AR_options.anchors_enabled !== false) ? false : true;
DEBUG_show("Anchors:" + ((AR_options.anchors_enabled && "ON")||"OFF"), 3)
  }
 ,ended: true
        }
      ]
// 4
     ,[
        {
          message: {
  content: "1. Default\n2. x0.5\n3. x0.25\n4. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:4+1 }
   ,{ key:2, branch_index:4+2 }
   ,{ key:3, branch_index:4+3 }
   ,{ key:4 }
  ]
          }
        }
      ]
// 5
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.framebufferScaleFactor = 0;
DEBUG_show("Framebuffer Scale:x" + (System._browser.url_search_params.xr_fb_scale||1), 3)
  }
 ,ended: true
        }
      ]
// 6
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.framebufferScaleFactor = 0.5;
DEBUG_show("Framebuffer Scale:x0.5", 3)
  }
 ,ended: true
        }
      ]
// 7
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.framebufferScaleFactor = 0.25;
DEBUG_show("Framebuffer Scale:x0.25", 3)
  }
 ,ended: true
        }
      ]
// 8
     ,[
        {
  func: (function () {
    var show_fps = false
    var timerID = null

    function fps() {
timerID = requestAnimationFrame(fps)
if (EV_sync_update.fps_last && !System._browser.camera.facemesh.enabled) {
  DEBUG_show(EV_sync_update.fps_last)
  EV_sync_update.fps_last = 0
}
    }

    return function () {
show_fps = !show_fps
if (show_fps) {
  if (!timerID)
    timerID = requestAnimationFrame(fps)
}
else {
  DEBUG_show("(FPS counter:hidden)", 2)
  if (timerID) {
    cancelAnimationFrame(timerID)
    timerID = null
  }
}
    };
  })(),
          message: {
  content: "1. DOM Overlay:{{(!self.XRSession||!('domOverlayState' in XRSession.prototype))?'NOT SUPPORTED':((MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR && MMD_SA_options.WebXR.AR.dom_overlay && (MMD_SA_options.WebXR.AR.dom_overlay.enabled!==false) && 'ON')||'OFF')}}\n2. Light Estimation:{{(!self.XRSession||!('updateWorldTrackingState' in XRSession.prototype))?'NOT SUPPORTED':((MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR && (MMD_SA_options.WebXR.AR.light_estimation_enabled!==false) && 'ON')||'OFF')}}\n3. Anchors:{{(!self.XRHitTestResult||!('createAnchor' in XRHitTestResult.prototype))?'NOT SUPPORTED':((MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR && (MMD_SA_options.WebXR.AR.anchors_enabled!==false) && 'ON')||'OFF')}}\n4. Framebuffer Scale:x{{((MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR && MMD_SA_options.WebXR.AR.framebufferScaleFactor)||System._browser.url_search_params.xr_fb_scale||1)}}\n5. Dummy WebGL Layer:{{(MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR && MMD_SA_options.WebXR.AR.dom_overlay && MMD_SA_options.WebXR.AR.dom_overlay.use_dummy_webgl && 'ON')||'OFF'}}\n6. User Camera:{{(MMD_SA.WebXR.user_camera.video && (MMD_SA.WebXR.user_camera.video.videoWidth+'x'+MMD_SA.WebXR.user_camera.video.videoHeight+'/'+MMD_SA.WebXR.user_camera.video_canvas.width+'x'+MMD_SA.WebXR.user_camera.video_canvas.height+'/'+window.devicePixelRatio))||'NOT IN USE'}}"
 ,bubble_index: 3
          }
        }
      ]
// 9
     ,[
        {
  ended: true
        }
      ]
// 10
     ,[
        {
          message: {
  content: "1. Dummy WebGL Layer\n2. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:11 }
   ,{ key:2 }
  ]
          }
        }
      ]
// 11
     ,[
        {
  func: function () {
var AR_options = MMD_SA_options.WebXR && MMD_SA_options.WebXR.AR;
if (!AR_options || !AR_options.dom_overlay) {
  DEBUG_show("(No WebXR mode available)", 3)
  return
}
var xr = MMD_SA.WebXR;
if (xr.session) {
  DEBUG_show("(This option cannot be changed during WebXR mode.)", 3)
  return
}

AR_options.dom_overlay.use_dummy_webgl = !AR_options.dom_overlay.use_dummy_webgl;
DEBUG_show("Dummy WebGL Layer:" + ((AR_options.dom_overlay.use_dummy_webgl && "ON")||"OFF"), 3)
  }
 ,ended: true
        }
      ]

    ]

   ,"_MISC_": [
//0
      [
        {
          message: {
  content: "1. Character form\n2. Use WASM-SIMD\n3. Debug Log\n4. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:2 }
   ,{ key:3, branch_index:3 }
   ,{ key:4 }
  ]
          }
        }
      ]
//1
     ,[
        {
  func: (function () {
    function morph_event(e) {
var mf = morph_form[morph_form_index]
if (mf) {
  let model = e.detail.model
  for (const morph_name in mf) {
    let _m_idx = model.pmx.morphs_index_by_name[morph_name]
    if (_m_idx != null) {
      let _m = model.pmx.morphs[_m_idx]
      MMD_SA._custom_morph.push({ key:{ weight:mf[morph_name], morph_type:_m.type, morph_index:_m_idx }, idx:model.morph.target_index_by_name[morph_name] })
    }
  }
}
//DEBUG_show(Date.now()+":"+MMD_SA._custom_morph.length)
    }

    var morph_event_registered = false

    var morph_form = [null]
    var morph_form_index = 0

    return function () {
var mf = MMD_SA_options.model_para_obj.morph_form
if (!mf) {
  DEBUG_show("(No other character form available)", 3)
  return
}

morph_form = [null].concat(Object.values(mf))

if (++morph_form_index >= morph_form.length) {
  morph_form_index = 0;
  morph_event_registered = false;
  window.removeEventListener("SA_MMD_model0_process_morphs", morph_event);
  DEBUG_show("Character form:DEFAULT", 3);
}
else {
  if (!morph_event_registered) {
    morph_event_registered = true
    window.addEventListener("SA_MMD_model0_process_morphs", morph_event)
  }
  DEBUG_show("Character form:" + morph_form_index, 3)
}
    };
  })()
 ,ended: true
        }
      ]
//2
     ,[
        {
  func: function () {
System._browser.use_WASM_SIMD = !System._browser.use_WASM_SIMD
DEBUG_show('WASM-SIMD:' + ((System._browser.use_WASM_SIMD)?'ON':'OFF'), 3)
  }
 ,ended: true
        }
      ]
//3
     ,[
        {
  func: function () {
DEBUG_show(System._browser.console.output_text, 60)
  }
 ,ended: true
        }
      ]
    ]

   ,"_onplayerdefeated_default_": [
//0
      [
        {
          message: {
  content: "You are defeated...\n1. Restart\n2. Cancel"
 ,para: { pos_mod:[0,15,0] }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2 }
  ]
          }
        }
      ]
//1
     ,[
        {
          load_area: { id:'start', refresh_state:1 }
        }
      ]
    ]
  };
