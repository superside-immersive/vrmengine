// load-main.js — loadMain() function — reads settings & initializes (Step 5C extraction from _SA.js)

function loadMain() {
  Settings.EventToMonitor = System.Gadget.Settings.readString("EventToMonitor")
  if (!Settings.EventToMonitor)
    Settings.EventToMonitor = Settings_default.EventToMonitor

  Settings.EventToMonitorVF = System.Gadget.Settings.readString("EventToMonitorVF")
  if (!Settings.EventToMonitorVF)
    Settings.EventToMonitorVF = Settings_default.EventToMonitorVF

  Settings.MonitorSensitivity = System.Gadget.Settings.readString("MonitorSensitivity")
  if (!Settings.MonitorSensitivity)
    Settings.MonitorSensitivity = Settings_default.MonitorSensitivity

  Settings.Monitor2Sensitivity = System.Gadget.Settings.readString("Monitor2Sensitivity")
  if (!Settings.Monitor2Sensitivity)
    Settings.Monitor2Sensitivity = Settings_default.Monitor2Sensitivity

  Settings.UpdateInterval = System.Gadget.Settings.readString("UpdateInterval")
  if (!Settings.UpdateInterval)
    Settings.UpdateInterval = Settings_default.UpdateInterval

  // Settings.Display can be pre-defined in some cases (such as simple MP4 playback)
  Settings.Display = Settings.Display || System.Gadget.Settings.readString("Display")
  if (!Settings.Display)
    Settings.Display = Settings_default.Display

  Settings.ReverseAnimation = returnBoolean("ReverseAnimation")
  Settings.UseMarkers = returnBoolean("UseMarkers")
  Settings.UseImgCache = use_gallery_img_cache = returnBoolean("UseImgCache")

  Settings.MonitorSensitivity = parseFloat(Settings.MonitorSensitivity)
  Settings.Monitor2Sensitivity = parseFloat(Settings.Monitor2Sensitivity)
  Settings.UpdateInterval = PC_count_max = parseInt(Settings.UpdateInterval)
  Settings.Display = parseInt(Settings.Display)

  Settings.CCPU = System.Gadget.Settings.readString("CCPU")
  if (!Settings.CCPU)
    Settings.CCPU = Settings_default.CCPU
  Settings.CCPU = parseInt(Settings.CCPU)

  Settings.UseAudioFFTLiveInputGain = System.Gadget.Settings.readString("UseAudioFFTLiveInputGain")
  if (!Settings.UseAudioFFTLiveInputGain)
    Settings.UseAudioFFTLiveInputGain = Settings_default.UseAudioFFTLiveInputGain
  Settings.UseAudioFFTLiveInputGain = parseFloat(Settings.UseAudioFFTLiveInputGain)

  Settings.UseCanvasNotebookDrawings = returnBoolean("UseCanvasNotebookDrawings")
  Settings.UseCanvasWatercolor = returnBoolean("UseCanvasWatercolor")
  Settings.UseCanvasVanGogh = returnBoolean("UseCanvasVanGogh")
  Settings.UseCanvasPPE = w3c_mode && self.WebGL_2D && (Settings.UseCanvasNotebookDrawings || Settings.UseCanvasWatercolor || Settings.UseCanvasVanGogh)

  Settings.UseCanvasPPEQuality = parseInt(System.Gadget.Settings.readString("UseCanvasPPEQuality") || Settings_default.UseCanvasPPEQuality)
  Settings.UseCanvasPPEContrast = parseInt(System.Gadget.Settings.readString("UseCanvasPPEContrast") || Settings_default.UseCanvasPPEContrast)
  Settings.UseCanvasPPEBrightness = parseInt(System.Gadget.Settings.readString("UseCanvasPPEBrightness") || Settings_default.UseCanvasPPEBrightness)

  Settings.CSSTransformScale = System.Gadget.Settings.readString("CSSTransformScale")
  if (!Settings.CSSTransformScale)
    Settings.CSSTransformScale = Settings_default.CSSTransformScale
  SA_zoom = parseFloat(Settings.CSSTransformScale)
  if (!SA_zoom || (SA_zoom < 0) || (SA_zoom > 3))
    SA_zoom = 1

  Settings.CSSTransformFullscreen = Settings.CSSTransformFullscreen || returnBoolean("CSSTransformFullscreen")
  if (Settings.CSSTransformFullscreen)
    SA_zoom = 1

  Settings.CSSTransformFlipH = returnBoolean("CSSTransformFlipH")
  Settings.CSSTransformFlipV = returnBoolean("CSSTransformFlipV")

  Settings.CSSTransformRotate = System.Gadget.Settings.readString("CSSTransformRotate")
  if (!Settings.CSSTransformRotate)
    Settings.CSSTransformRotate = Settings_default.CSSTransformRotate
  SA_rotate = parseFloat(Settings.CSSTransformRotate)
  if (!SA_rotate)
    SA_rotate = 0

  Settings.CSSTransform3D = System.Gadget.Settings.readString("CSSTransform3D")
  if (!Settings.CSSTransform3D || !(w3c_mode) || (!is_SA_child_animation && (!/perspective/.test(Settings.CSSTransform3D + " " + self.getComputedStyle(Lbody3D_main).msTransform) && !parseInt(self.getComputedStyle(Lbody3D).msPerspective))))
    Settings.CSSTransform3D = Settings_default.CSSTransform3D
  else if (!is_SA_child_animation) {
    if (/perspective\(\s*(\d+)/.test(Settings.CSSTransform3D)) {
      Lbody3D.style.msPerspective = RegExp.$1 + "px"
      Lbody3D._perspective = RegExp.$1
//DEBUG_show(RegExp.$1,0,1)
      Settings.CSSTransform3D = Settings.CSSTransform3D.replace(/perspective\([^\)]+\)/, "")
//DEBUG_show(Settings.CSSTransform3D,0,1)
      if (!Settings.CSSTransform3D || /^\s+$/.test(Settings.CSSTransform3D))
        Settings.CSSTransform3D = Settings_default.CSSTransform3D
    }
    else
      Lbody3D._perspective = parseInt(self.getComputedStyle(Lbody3D).msPerspective)
  }
  if (Settings.CSSTransform3D)
    Lbody._rotate3d = [0,0,0]

  Settings.CSSTransform3DBillboard = (is_SA_child_animation && returnBoolean("CSSTransform3DBillboard"))
  if (Settings.CSSTransform3DBillboard)
    parent.document.getElementById("Ichild_animation" + SA_child_animation_id)._rotate3d_billboard = [[0,0,0], [0,0,0]]

  Settings.BDSpectrumToBeat = System.Gadget.Settings.readString("BDSpectrumToBeat")
  if (!Settings.BDSpectrumToBeat)
    Settings.BDSpectrumToBeat = Settings_default.BDSpectrumToBeat

  if (returnBoolean("Use32BandSpectrum") && /SOUND/.test(Settings.EventToMonitor) && (Settings.UseAudioFFT || (is_SA_child_animation && webkit_mode))) { // [9E] xul_version always 0
    Settings.Use32BandSpectrum = true
    DEBUG_show("Use 32-band spectrum", 2)
  }

//  Settings.BPMByWebAudioAPI = returnBoolean("BPMByWebAudioAPI")
  Settings.BPMByWebAudioAPI = (w3c_mode) && !returnBoolean("AutoItBPMByBASS")

  Settings.EnableBeatDetection = returnBoolean("EnableBeatDetection")
  Settings.BDScale = System.Gadget.Settings.readString("BDScale")
  if (!Settings.BDScale)
    Settings.BDScale = Settings_default.BDScale
  Settings.BDDecay = System.Gadget.Settings.readString("BDDecay")
  if (!Settings.BDDecay)
    Settings.BDDecay =  Settings_default.BDDecay
  Settings.BDOpacity = System.Gadget.Settings.readString("BDOpacity")
  if (!Settings.BDOpacity)
    Settings.BDOpacity =  Settings_default.BDOpacity
  Settings.BDBassKick = System.Gadget.Settings.readString("BDBassKick")
  if (!Settings.BDBassKick)
    Settings.BDBassKick =  Settings_default.BDBassKick

  Settings.BDSpectrumToBeat = parseInt(Settings.BDSpectrumToBeat)
  Settings.BDScale    = parseInt(Settings.BDScale)
  Settings.BDDecay    = parseInt(Settings.BDDecay)
  Settings.BDOpacity  = parseInt(Settings.BDOpacity)
  Settings.BDBassKick = parseInt(Settings.BDBassKick)

  Settings.AllowExternalCommand = !is_SA_child_animation && returnBoolean("AllowExternalCommand")

// obsolete
/*
  Settings.HandleOversize = System.Gadget.Settings.readString("HandleOversize")
  if (!Settings.HandleOversize)
    Settings.HandleOversize = Settings_default.HandleOversize
*/

// main
  if (MacFace_mode && Settings.UseMarkers) {
    WMI_ev_obj_pages = new WMI_Refresher("Win32_PerfFormattedData_PerfOS_Memory", "EV")
    WMI_ev_obj_pages.init()
  }

  var t = initEV(0)
  initEV(1)

// sync update
if (!use_2nd_monitor && (PC_count_max == 1) && (EV_object[0].EV_parser() == "SOUND")) {
  EV_sync_update.enabled = true
}

if (self.MMD_SA_options && MMD_SA_options.WebXR) {
  RAF_animation_frame_unlimited = true
  console.log("UNLIMITED fps enforced in WebXR")
}

if (returnBoolean("UseFullFrameRate") || (use_SA_browser_mode && use_full_fps_registered)) {
  use_full_fps = true
  if (!is_SA_child_animation) {
    if (use_RAF)// && returnBoolean("Use30FPS"))
      EV_sync_update.count_to_10fps = 6
    DEBUG_show("full frame rate (" + (EV_sync_update.count_to_10fps * ((RAF_animation_frame_unlimited)?10:5)) + "fps)", 2)
    if (RAF_animation_frame_unlimited)
      console.log("UNLIMITED fps (effectively 60fps)")
  }
  else
    DEBUG_show("full frame rate", 2)
}

//  if (!webkit_electron_mode)
//    document.body.title = t

  EV_usage = EV_usage_float = EV_usage_last = EV_usage_last_float = -1

  PC_count = 1
  PC_count_absolute = 0

// main
  if (SEQ_mode && (SEQ_gallery_all.length == 1) && (!SEQ_gallery_all[0].ss_path_list || (SEQ_gallery_all[0].ss_path_list.length == 1))) {
    if (gallery_cache_obj.SS_mode)
      SEQ_gallery_all[0].gallery = gallery

    gallery_cache_obj.SS_mode = false
  }

  if (w_max && h_max) {
    gallery_dim_predefined = true

    gallery_preload_always = !!System.Gadget.Settings.readString("PreloadGalleryAlways")
    if (gallery_preload_always)
      loadImageDimALL()
    else {
      if (SEQ_mode && !gallery_cache_obj.SS_mode) {
        Seq.item("SEQ_SmartPreloading").At(0.25, "SEQ_SmartPreloading", -1, 0.25)
        Seq.item("SEQ_SmartPreloading").Play()
      }
    }
  }
  else
    loadImageDimALL()

// Give it a delay and see if it can reduce the chance of hang-up in Wallpaper Engine
// NOTE: Not suitable to have a delay here because it will break some animations.
//  setTimeout(function () {
resize()

if (!is_SA_child_animation && Lbody3D_navigation._transformOrigin) {
  SA_OnKeyDown({ keyCode:84 })
}

var _delayed_properties = (WallpaperEngine_CEF_native_mode && is_SA_child_animation && parent.wallpaperPropertyListener._delayed_properties[SA_child_animation_id])
if (_delayed_properties) {
  _delayed_properties.forEach(function (p) {
    parent.wallpaperPropertyListener.applyUserProperties(p)
  });
  delete parent.wallpaperPropertyListener._delayed_properties[SA_child_animation_id]
}
//  }, 0);


  if (webkit_electron_mode) {
    setTimeout(function () { webkit_window.show() }, 1000)
  }

// not needed in Electron anymore I suppose
/*
  if (webkit_mode && use_HTML5 && self.use_EQP_core) {
    Seq.item("WebKit_RefreshCanvas").At(10, function(){CANVAS_must_redraw=true}, -1, 10)
    Seq.item("WebKit_RefreshCanvas").Play()
  }
*/
}
