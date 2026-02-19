/*

_SA.js (2025-02-22)

System Animator
(c) Butz Yung / Anime Theme. All rights reserved.
- Homepage: http://www.animetheme.com/

*/

// Load app modules (Step 5A extraction)
document.write('<script language="JavaScript" src="js/app/utils.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/events.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/init-ui.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/resize.js"></scr'+'ipt>')
// Load app modules (Step 5B extraction)
document.write('<script language="JavaScript" src="js/app/ev-init.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/animate.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/animate-core.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/ev-processing.js"></scr'+'ipt>')
document.write('<script language="JavaScript" src="js/app/seq-animate.js"></scr'+'ipt>')

// obsolete
var Seq_speed_delay = 1


var loaded
// [LEGACY REMOVED 1B] Silverlight vars (use_Silverlight, use_Silverlight_only, Silverlight_native_capable) removed
var use_Silverlight = true // kept for cross-file compatibility, always true
var use_Silverlight_only = false // kept for cross-file compatibility, always false
// [LEGACY REMOVED 1B] xul_mode/xul_path/xul_transparent_mode branches removed
var is_SA_BG_transparent = webkit_transparent_mode

var absolute_screen_mode = (webkit_electron_mode && !returnBoolean("MoveWithinPrimaryScreen") && !is_SA_child_animation)

var spectrum_analyser, use_full_fps, use_full_fps_registered

var use_SVG_Clock = (ie9_mode && returnBoolean("UseSVGClock"))

var use_EQP_ripple = (ie9_mode && returnBoolean("UseCanvasRipple"))
var use_EQP_fireworks = (ie9_mode && returnBoolean("UseCanvasFireworks"))

var use_WebGL = (w3c_mode)
var use_WebGL_2D// = (use_WebGL && webkit_transparent_mode && returnBoolean("UseWebGLForCanvas2D"))

var use_MatrixRain

var Canvas_Effect
var use_full_spectrum
if (use_EQP_ripple || use_EQP_fireworks) {
  use_full_spectrum = true
}

var use_HTML5 = use_SA_browser_mode
var use_SVG
// [LEGACY REMOVED 1B] use_Silverlight/use_Silverlight_only compatibility assignments removed


function init() {
/*
try{
var perfmon = SA_require('perfmon');
//perfmon.list('Network Interface', function(err, data) {	DEBUG_show(JSON.stringify(data),0,1); });
perfmon('\\LogicalDisk(*)\\% Disk Time', function(err, data) {	if (err) {DEBUG_show("ERROR:"+JSON.stringify(err),0,1)} else {DEBUG_show(JSON.stringify(data))}; });
//setTimeout(function () { perfmon('\\LogicalDisk(D:)\\% Disk Time', function(err, data) {	if (err) {DEBUG_show("ERROR:"+JSON.stringify(err),0,1)} else {DEBUG_show(JSON.stringify(data))}; }); }, 500)
} catch (err) { DEBUG_show("ERROR:"+err,0,1) }
*/
  loaded = true

  if (use_SVG_Clock)
    SVG_Clock.draw()

  // [LEGACY REMOVED 1B] xul_mode/XUL_onload branch removed
  if (webkit_mode)
    WebKit_onload()

try {
  System.Gadget.onDock = CheckDockState;
  System.Gadget.onUndock = CheckDockState;
}
catch (err) {
  DEBUG_show(err.description)
}

  System.Gadget.settingsUI = "settings.html"
  System.Gadget.onSettingsClosed = SettingsClosed;

// main
  if (!is_SA_child_animation) {
    if (use_RAF) {
      DEBUG_show('Use "requestAnimationFrame"', 2)
      setTimeout('RAF_timerID = requestAnimationFrame(Animate_RAF)', 200)
    }
    else {
      Seq.item("Animate").At(0.2, "Animate", -1, 0.1/EV_sync_update.count_to_10fps)
      Seq.item("Animate").Play()
    }
  }

  if (SEQ_mode) {
    Seq.item("SEQ").At(0, "SEQ_Animate", -1, 0.1)
    Seq.item("SEQ").use_SA_RAF = webkit_mode
    Seq.item("SEQ").Play()
  }

  if (MacFace_mode)
    VistaFace.main()

  if (!BG_dim_calculate) {
    BG_dim_calculate = function () {
      if (!self.EV_width)
        EV_width_no_init = true
      if (!self.EV_height)
        EV_height_no_init = true

      if (EV_width_no_init)
        EV_width  = ((w_max > 130) ? 130 : w_max)
      if (EV_height_no_init)
        EV_height = ((h_max > 130) ? 130 : h_max)
    }
  }

  DragDrop.init(document.body, DragDrop_install, function (item) { return (item.isFolder || (item.isFileSystem && DragDrop_RE.test(item.path))) })

  SystemEXT._default.config_folder = Settings.f_path_folder
  SystemEXT._default.config_folder_full = Settings.f_path


  if (use_SA_system_emulation) {
    SA_init_browser_ui()
  }

  if (ie9_mode) {
    for (var i = 0; i < SA_child_animation_max; i++) {
      var d = document.getElementById("Ichild_animation" + i)
      if (d) {
        d.onmouseout = function (e) {
// check if contentWindow.System is missing for any reason
if (!this.contentWindow.System)
  return

this.contentWindow.System._browser.onmouseout()
        }
      }
    }

    spectrum_analyser = document.getElementById("Ichild_animation99")
    if (spectrum_analyser) {
      DEBUG_show("**Spectrum Analyser loaded**", 2)
    }
  }

  if (use_SA_browser_mode) {
    self.onbeforeunload = function () {
window.dispatchEvent(new CustomEvent('SA_writeSettings'));

if (WallpaperEngine_CEF_mode)
  return

System.Gadget.Settings._writeSettings();
SA_OnBeforeUnload_Common();

if (!is_SA_child_animation) {
  if (SA_top_window.is_SA_hosted) {
    SA_top_window.opener.closeSA(SA_top_window.SA_child_animation_id);
  }

  if (webkit_electron_mode) {
    if (WebKit_object.monitor_winstate.process) {
      Seq.item("MonitorWinstateSTDIN").Stop()
      try {
        WebKit_object.monitor_winstate.process.stdin.write("KILL\n")
//        WebKit_object.monitor_winstate.process.kill()
        WebKit_object.monitor_winstate.process = null
      }
      catch (err) {}
    }
    if (WebKit_object.monitor_winamp.process) {
      Seq.item("MonitorWinampSTDIN").Stop()
      try {
        WebKit_object.monitor_winamp.process.stdin.write("KILL\n")
        WebKit_object.monitor_winamp.process = null
      }
      catch (err) {}
    }
  }
}
    }

    self.onerror = function (msg, filename, line) {
var err_msg = 'ERROR('+filename.replace(/^.+\//, "")+': L' + line + ' / ' + msg
console.error(err_msg)
//if (WallpaperEngine_CEF_mode) { DEBUG_show(err_msg,0,1) } else
DEBUG_show(err_msg)
return true
    }
  }
  else {
    document.onkeydown = SA_OnKeyDown_Gadget
//    document.onmousedown = SA_OnMouseDown

    self.onunload = function () { SA_OnBeforeUnload_Common() }
  }

  if (is_mobile) {
    if (!is_SA_child_animation) {
      Lquick_menu.style.visibility = "inherit"
      Lquick_menu._activated = true
    }
/*
    window.addEventListener('blur', function () {
Lquick_menu.style.visibility = LbuttonTL.style.visibility = LbuttonLR.style.visibility = "hidden";
    });
*/
  }

  loadMain()
}


async function SA_DragDropEMU(file) {
//if (file) DEBUG_show(file.constructor,0,1)
//DEBUG_show(self.URL.createObjectURL(file),0,1)
  var is_file = (typeof file != "string")
  var item = (is_file) ? new System.Shell._FolderItem(new WebKit_object["Shell.Application"]._FolderItem({path:(webkit_electron_mode&&file.path)||file.name, file:file})) : System.Shell.itemFromPath(file)
//console.log(item)
  if (/*WallpaperEngine_CEF_mode && */is_file) {// && DragDrop._obj_url_RE && DragDrop._obj_url_RE.test(file.name)) {
console.log("File input:", file)
    var dd = SA_topmost_window.DragDrop
    if (!dd._path_to_obj) {
      dd._path_to_obj = {}
      dd._obj_url = {}
    }
    dd._path_to_obj[file.name.replace(/^(.+)[\/\\]/, "")] = file
/*
    if (/(\.zip)$/i.test(file.name)) {
      let obj_url_zip = dd._obj_url[file.name] = SA_topmost_window.URL.createObjectURL(file)
      dd._path_to_obj[obj_url_zip+RegExp.$1] = file
    }
*/
  }
//console.log(item)
  DragDrop._no_relay = true
  if (DragDrop.validate_func(item, true)) {
    await DragDrop.onDrop_finish(item, true);
  }
  else
    DEBUG_show("(Invalid input type)")
  DragDrop._no_relay = false
}


var DragDrop_RE_default_array = ["bmp","gif","jpg","jpeg","png","webp","wmv","webm","mp4","mkv"]
if (w3c_mode) {
  DragDrop_RE_default_array.push("pmd")
  DragDrop_RE_default_array.push("pmx")
}
var DragDrop_RE_default = eval('/\\.(' + DragDrop_RE_default_array.join("|") + ')$/i')
var DragDrop_RE = DragDrop_RE_default

function DragDrop_install(item) {
  var path = item.path
  var path_folder = (item.isFolder) ? path : path.replace(/[\/\\][^\/\\]+$/, "");

  if (/\.(pmd|pmx)$/i.test(path) && self.MMD_SA) {
    if (/\.pmd$/i.test(path)) {
      DEBUG_show('(PMD model is no longer supported. Use PMX instead.)', 3);
      return;
    }
    if (MMD_SA_options.Dungeon_options) {
      DEBUG_show('(Drop a zipped MMD model instead.)', 3);
      return;
    }

    System.Gadget.Settings.writeString("LABEL_MMD_model_path", path)

    Settings.f_path = Settings.f_path_original
    System.Gadget.Settings.writeString("Folder", Settings.f_path_original)
    SA_Reload_PRE(Settings.f_path, Settings.f_path_folder)
    return
  }

  var folder_changed = (path_folder != Settings.f_path_folder)
  if (use_SA_browser_mode) {
// folder changed/saving on different config file
    if (folder_changed || webkit_mode) {
      folder_changed = true
      Settings.f_path = Settings.f_path_original
      System.Gadget.Settings.writeString("Folder", Settings.f_path_original)
    }
    else {
// updating settings with no animation folder change, or changing images/videos inside the same folder (i.e. folder path unchanged, saving on the same config file for non-webkit mode)
      Settings.f_path = path
      System.Gadget.Settings.writeString("Folder", path)
    }

    if (EQP_gallery_append_mode) {
      if (item.isFolder) {
        if (/\.EQP\-gallery$/.test(path) || ValidatePath(path + '\\animate.js'))
          EQP_gallery_append_mode = false
      }
      else
        EQP_gallery_append_mode = false
    }
  }

  if ((use_SA_browser_mode || SA_animation_append_mode) && !EQP_gallery_append_mode) {
    var update_existing_config
    if (folder_changed) {
      if (path_demo_by_url[path_folder])
        update_existing_config = ValidatePath(System.Gadget.path + '\\TEMP\\_config_local\\' + path_folder.replace(/^.+[\/\\]/, "") + '.js')
      else if (webkit_mode && (path != path_folder))
        update_existing_config = ValidatePath(System.Gadget.path + '\\TEMP\\_config_local\\_SA_' + System._hash_sha256.hash(path) + '.js')
      else
        update_existing_config = ValidatePath(path_folder + '\\_config_local.js')
    }

    if (update_existing_config) {
      SystemEXT.SaveLocalSettings(null, path_folder, path)
    }
    else {
      var excluded_settings
      if (SA_animation_append_mode) {
        excluded_settings = {
   Opacity: true

  ,IgnoreMouseEvents: true

  ,HTALoadSpectrumAnalyser: true
  ,WallpaperAsBG: true
  ,DisableWallpaperMask: true
  ,XULTransparentBG: true

  ,CSSTransformScale: true
  ,CSSTransformRotate: true
  ,CSSTransformFullscreen: true
  ,CSSTransformFlipH: true
  ,CSSTransformFlipV: true
  ,CSSTransform3D: true
  ,CSSTransform3DBoxAnimate: true
  ,CSSTransformToChildAnimation: true
  ,CSSTransform3DBillboard: true
  ,CSSTransform3DDisabledForContent: true

  ,UseMatrixRain: true
  ,MatrixRainColor: true

  ,UseCanvasRipple: true
  ,UseCanvasFireworks: true
  ,UseSVGClock: true

  ,AutoItRunAsAU3: true
  ,AutoItAlwaysOnTop: true
  ,AutoItStayOnDesktop: true
  ,AutoItAutoPause: true
  ,AutoItWinampMode: true
        }
      }
      Settings_writeJS(path, excluded_settings)
    }
  }

  if (SA_animation_append_mode) {
    if (is_SA_child_animation) {
      DEBUG_show("(No child animation allowed inside another child animation)", 5)
      return
    }

    var child_animation_id = -1
    for (var i = 0; i < SA_child_animation_max; i++) {
      if (!SA_child_animation[i]) {
        child_animation_id = i
        break
      }
    }

    if (child_animation_id == -1) {
      DEBUG_show("(No more child animation allowed)", 5)
      return
    }

    var ani
    ani = SA_child_animation[child_animation_id] = { f:path, x:10, y:10, z:0, opacity:1 }

    // In webkit (NW.js) mode, node.js object may not be initialized in dynamically generated IFRAME. Restart the animation to fix the problem.
    if (webkit_nwjs_mode) {
      path_folder = Settings.f_path_folder
      path = Settings.f_path_original
    }
    else {
// use encodeURI instead of encodeURIComponent
      var ds = SA_Generate_IChild(child_animation_id, System._child_html_filename + "?f=" + encodeURI(path)).style
      ds.posLeft = ani.x
      ds.posTop  = ani.y
      ds.zIndex  = ani.z
      return
    }
  }

  if (EQP_gallery_append_mode) {
    System.Gadget.Settings.writeString("LABEL_EQP_SS_path", path_folder)
    path_folder = Settings.f_path_folder
    path = Settings.f_path_original
  }

  SA_Reload_PRE(path, path_folder)
}

function SA_Reload_PRE(path, path_folder, restart_app) {
  var path_to_launch = (webkit_mode) ? path : path_folder
  if (use_SA_browser_mode && !is_SA_child_animation) {
    if (SA_top_window.is_SA_hosted) {
      setTimeout(function () { SA_top_window.opener.new_animation_path = path_to_launch; SA_top_window.close(); }, 0)
    }
    else {
var args = []
var app_path = ""
var app_path_current = ""
if (webkit_mode) {
  app_path = SystemEXT.GetWebKitPath(webkit_path)
  app_path_current = webkit_path
  args = [app_path, System.Gadget.path, path_to_launch]
}
// [LEGACY REMOVED 1B] xul_mode and HTA else branches removed

if (SystemEXT.enforce_WSH)
  args.push("wsh")

if (RAF_timerID) {
  cancelAnimationFrame(RAF_timerID)
  RAF_timerID = null
}

if (!self.oHTA) {
  if (webkit_electron_mode) {
    if (System._restart_full || (app_path != app_path_current) || WMI_perfmon.loaded || !webkit_version_milestone["1.4.11"] || (!WallpaperEngine_mode && ((!linux_mode && (path_to_launch != Settings.f_path)) || System.Gadget.Settings._changed["DisableTransparency"])) || (!WallpaperEngine_mode && System.Gadget.Settings._changed["AutoItStayOnDesktop"] && webkit_transparent_mode))
      restart_app = true

    if (WallpaperEngine_mode) {
      const fs = SA_require('fs')
      fs.writeFileSync(System.Gadget.path + '\\TEMP\\animation_path_default.txt', path_demo_by_url[path_to_launch]||path_to_launch)
    }

// a workaround for perfmon, to avoid errors on main process when reloading window to restart.
// NOTE: It seems it's better just always use relaunch for restarting, to avoid issues.
//  restart_app = true
    if (restart_app) {
      if (WallpaperEngine_mode) {
        self.onbeforeunload()
        DEBUG_show("NOTE: Please reload the wallpaper from Wallpaper Engine's panel for the changes to take effect.", 30)
      }
      else {
        webkit_electron_remote.getGlobal("relaunch")([path_to_launch], (((app_path != app_path_current) && app_path) || ""))
      }
      return
    }
  }

  const cmd_line = []
  args.forEach(function (v) {
// use encodeURI instead of encodeURIComponent
    cmd_line.push(encodeURI(v))
  })
  setTimeout(function () { self.location.replace(self.location.href.replace(/\?.+$/, "") + "?cmd_line=" + cmd_line.join("|")) }, 0)
  return
}

// [LEGACY REMOVED] WSH/SA_launcher.js support removed
    }
    return
  }

  if (!use_SA_browser_mode) {
    if (!EQP_gallery_append_mode)
      System.Gadget.Settings.writeString("Folder", path)
  }
  else if (is_SA_child_animation) {
    parent.System.Gadget.Settings._settings_need_update = true
    parent.SA_child_animation[SA_child_animation_id].f = path
// use encodeURI instead of encodeURIComponent
    setTimeout('self.location.replace(System._child_html_filename + "?f=' + encodeURI(path_to_launch) + '&id=' + SA_child_animation_id + '");', 0)
    return
  }

  SA_Reload()
}

function SA_Reload() {
// IE9 fix (RC)
  if (ie9)
    setTimeout('self.location.reload()', 0)
  else
    setTimeout('self.location.href = self.location.href', 0)
}

var Settings = {}

var WMI_ev_obj_pages

var f_path_default = path_demo[Settings_default.Folder]

var bar_color = [
  null,
  ["#51C6E2", "#0A809B"],
  ["#6DE298", "#34AA53"],
  ["#E1B775", "#DA7C0C"],
  ["#E296F6", "#CE5AD9"],
  ["#c0a0f0", "#905be5"],
  ["#6090e0", "#2b6dd5"],
  ["#f0b0c0", "#e67a96"],
  ["#31cfcc", "#249c9a"]
]

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

  if (returnBoolean("Use32BandSpectrum") && /SOUND/.test(Settings.EventToMonitor) && (Settings.UseAudioFFT || (is_SA_child_animation && (webkit_mode || (xul_version >= 26))))) {
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

function Settings_writeJS(f_path, excluded_settings) {
try {
  if (!f_path && ie9_mode && !is_SA_child_animation) {
    for (var i = 0; i < SA_child_animation_max; i++) {
      var ani = SA_child_animation[i]

      var v
      if (ani) {
        var f = ani.f
        var f_obj = ValidatePath(f)
        var is_folder = (!f_obj || f_obj.isFolder)
        var f_folder = (is_folder) ? f : f.replace(/[\/\\][^\/\\]+$/, "")

        if (f.indexOf(SA_HTA_folder) == 0)
          v = '$SA_HTA_folder$' + f.substr(SA_HTA_folder.length)
        else if (f.indexOf(SA_HTA_folder_parent) == 0)
          v = '$SA_HTA_folder_parent$' + f.substr(SA_HTA_folder_parent.length)
        else if (System.Gadget._path_folder() == f_folder.replace(/[\/\\][^\/\\]+$/, "")) {
          v = '$System.Gadget._path_folder()$\\' + ((is_folder) ? '' : f_folder.replace(/^.+[\/\\]/, toLocalPath("\\"))) + f.replace(/^.+[\/\\]/, "")
        }
        else
          v = f
        v += "|"+ani.x+"|"+ani.y+"|"+ani.z+"|"+ani.opacity
      }
      else
        v = ""

      System.Gadget.Settings.writeString("ChildAnimation"+i, v)
    }
  }

var animation_changed, path_obj, cf, f_path_full
if (f_path) {
  animation_changed = true

  path_obj = ValidatePath(f_path)
  cf = (path_obj.isFolder) ? f_path : f_path.replace(/[\/\\][^\/\\]+$/, "")
}
else {
  f_path = loadFolder_CORE()
  path_obj = ValidatePath(f_path)
}
var f_path_raw = f_path

f_path_full = "$SA_HTA_folder$" + ((path_obj.isFolder) ? "" : encodeURIComponent(f_path.replace(/^.+[\/\\]/, toLocalPath("\\"))))

var _settings = {}
var demo_found
demo_found = path_demo_by_url[f_path]
if (demo_found)
  _settings.Folder = demo_found
//if (!demo_found)
  f_path = f_path_full
//alert(SA_HTA_folder+','+path_obj.path)

  var q = '"'

  var saved_settings = []
  for (var i = 0; i < Setting_name_list.length; i++) {
    var s = Setting_name_list[i]
    var v = _settings[s] || System.Gadget.Settings.readString(s, true)
    if (!v || (v == Settings_default[s]))
      continue
    if (excluded_settings && excluded_settings[s])
      continue

if (animation_changed && /^ChildAnimation\d/.test(s))
  continue

v = (s == "Folder") ? ((/^demo/.test(v)) ? v : f_path) : encodeURIComponent(v);
    saved_settings.push(q + s + q + ':' + q + v + q)
  }
  for (var i = 0; i < Setting_name_list_boolean.length; i++) {
    var s = Setting_name_list_boolean[i]
    var v = returnBoolean(s)
    if (v == Settings_default[s])
      continue
    if (excluded_settings && excluded_settings[s])
      continue

    saved_settings.push(q + s + q + ':"non_default"')
  }
  saved_settings.push('"_screenLeft":"' + ((use_SA_browser_mode && !is_SA_child_animation) ? ((webkit_saved_screenLeft) ? webkit_saved_screenLeft : SA_top_window.screenLeftAbsolute) : 100) + '"')
  saved_settings.push('"_screenTop":"'  + ((use_SA_browser_mode && !is_SA_child_animation) ? ((webkit_saved_screenTop)  ? webkit_saved_screenTop  : SA_top_window.screenTopAbsolute)  : 100) + '"')

  if (use_SA_browser_mode) {
    var settings = System.Gadget.Settings._settings
    for (var s in settings) {
      if (!/^(LABEL|SA)_/.test(s))
        continue

      var v = System.Gadget.Settings.readString(s)
      if (!v)
        continue

v = (s == "LABEL_Folder") ? ((animation_changed) ? "" : f_path) : encodeURIComponent(v);
      saved_settings.push(q + s + q + ':' + q + v + q)
    }
  }
//alert(saved_settings)
  SystemEXT.SaveLocalSettings(saved_settings, cf, f_path_raw)
}
catch (err) {}
}

function SettingsClosed(event) {
  var ok = (event.closeAction == event.Action.commit)

  if (webkit_electron_mode && (!ok || is_SA_child_animation)) {
    if (SA_topmost_window.webkit_IgnoreMouseEvents_disabled) {
      SA_topmost_window.SA_OnKeyDown({ keyCode:73 }, true)
    }
  }

// User hits OK on the settings page.
  if (ok) {
if (use_SA_browser_mode) {
  SA_animation_append_mode = false
  EQP_gallery_append_mode = false
  DragDrop_install(System.Shell.itemFromPath(loadFolder_CORE()))
  return
}

if (!use_SA_browser_mode && SystemEXT._default._settings)
  Settings_writeJS()

SA_Reload()
return
  }
}


// BG
var BG_dim_calculate
var BG_img_objs
var EV_width_no_init, EV_height_no_init

function BG_Basic() {
  BG_AddShadow((!filter_objs[filter_index].filter_enabled && (SA_zoom == 1)))
}

function BG_AddShadow(basic_mode) {
  BG_dim_calculate()

  var mod = (ie9_mode) ? 1 : SA_zoom
  var w = EV_width  * mod
  var h = EV_height * mod

  var x_offset = 1
  var y_offset = 1

  var s = Lmain_obj.style
  s.posLeft = x_offset
  s.posTop  = y_offset
  s.clip = Lmain_obj.clip_org = 'rect(0px ' + (w) + 'px ' + (h) + 'px 0px)'

  w += x_offset * 2
  h += y_offset * 2

  EV_BG_src = ""
  BG.removeObjects()
  BG_img_objs = []

if (!basic_mode) {
  var bg_shadow = BG.addImageObject("js_filters/images/black.png", 0,0)
  bg_shadow.left = (w-100)/2
  bg_shadow.top = (h-100)/2
  bg_shadow.width = w
  bg_shadow.height = h
  bg_shadow.addShadow("black", 3, 75, 3,3)
  BG_img_objs.push(bg_shadow)

  s = LBG_dummy.style
  s.pixelWidth = w
  s.pixelHeight = h
//  s.backgroundColor = "white"
  s.display = "block"
}
else
  LBG_dummy.style.display = "none"

  var shadow_offset = (use_SA_browser_mode) ? 0 : 5

  EV_width  += (x_offset * 2) + shadow_offset
  EV_height += (y_offset * 2) + shadow_offset

  BG.style.pixelWidth  = EV_width  * mod
  BG.style.pixelHeight = EV_height * mod
}

function BG_AddBlackhole() {
  BG_dim_calculate()

  if (System.Gadget.docked && (EV_width <= 130)) {
    BG_AddShadow()
  }
  else {
    LBG_dummy.style.display = "none"

    EV_BG_src = ""
    BG.removeObjects()
    BG_img_objs = []

    var bg_blackhole
    var bg_choice = [Settings.f_path + toLocalPath('\\images\\bg_blackhole.png'), System.Gadget.path + toLocalPath('\\js_filters\\images\\bg_blackhole_' + EV_width + 'x' + EV_height + '.png')]
    for (var i = 0; i < bg_choice.length; i++) {
      var bg_src = ValidatePath(bg_choice[i])
      if (bg_src) {
        bg_blackhole = bg_src.path
        break
      }
    }
    if (!bg_blackhole)
      bg_blackhole = 'js_filters/images/bg_blackhole_130x130.png'

    BG_img_objs.push(BG.addImageObject(bg_blackhole, 0,0))

    var s = Lmain_obj.style
    s.posTop = 24
    s.posLeft = 24

    EV_width += 24*2
    EV_height += 24*2
  }

  BG.style.pixelWidth = EV_width
  BG.style.pixelHeight = EV_height
}

// OP selection START

var OP_SEQ_index = -1

function OP_gallery_sorting(a, b) {
  if (a.SEQ_index == OP_SEQ_index)
    return -1
  if (b.SEQ_index == OP_SEQ_index)
    return 1

  return Math.random() - 0.5
}

function OP_change() {
  if (gallery_cache_obj.SS_mode) {
    SEQ_gallery_index = -1
    return ((SEQ_gallery_shuffled_count == -1) ? OP_SEQ_index : SEQ_gallery_shuffled[SEQ_gallery_shuffled_count].SEQ_index)
  }

  if (++OP_SEQ_index >= SEQ_gallery.length)
    OP_SEQ_index = 0

  SEQ_gallery_shuffled = SEQ_gallery.sort(OP_gallery_sorting)

  SEQ_gallery_shuffled_count = 0
  SEQ_gallery_index = -1

  return OP_SEQ_index
}

var SEQ_fps_end_factor = 1
var SEQ_fps_frame_skip_mod = 0

function OP_change_event() {
  if (gallery_cache_obj.SS_mode)
    DEBUG_show((OP_change()+1)+' (=> '+((SEQ_gallery_shuffled_count == SEQ_gallery.length-1) ? 'END' : SEQ_gallery_shuffled[SEQ_gallery_shuffled_count+1].SEQ_index+1)+')', 1)
  else
    DEBUG_show((OP_change()+1)+'/'+SEQ_gallery.length, 1)
}

// END


// Gallery building START

var gallery, gallery_js, pic_last
var image_ratio
var b_width, b_height
var B_width, B_height

var w_max, h_max
// NOTE: w_max/h_max may already be initialized in some cases.
w_max = w_max || 0
h_max = h_max || 0

var gallery_dim_predefined, gallery_preload_always
var SEQ_mode, SEQ_fps, SEQ_fps_ini, SEQ_fps_end, SEQ_ani_count, SEQ_ani_count_overridden
var SEQ_gallery_all, SEQ_gallery, SEQ_gallery_by_name, SEQ_gallery_by_percent
var SEQ_gallery_index, SEQ_gallery_percent_index, SEQ_gallery_percent_name
var SEQ_gallery_memory_saving_mode
var MacFace_mode
var use_2nd_monitor
var use_GIMAGE

var EQP_gallery

var gallery_cache_obj = new imgCache_Object("img_obj", "Lmain_animation")

function ValidatePath(path) {
  var p = null
  try {
    p = System.Shell.itemFromPath(path)
  }
  catch (err) {}

  return p
}

function ItemsFromFolder(path, is_root) {
  var f = ValidatePath(path)

  if (!f && is_root) {
    if (path != f_path_default)
      ItemsFromFolder(f_path_default, true)
    return true
  }

  if (/\.mcface$/i.test(path)) {
    MacFace_mode = true
    use_2nd_monitor = true
    return
  }

  if (is_root) {
    if (!f.isFolder && f.isFileSystem) {
      var path = f.path
      Settings.f_path_folder = Settings.f_path.replace(/[\/\\][^\/\\]+$/, "")

      var animate_js = Settings.f_path_folder + toLocalPath('\\animate.js')
      if (!(is_SA_child_animation_host && !is_SA_child_animation) && ValidatePath(animate_js))
        gallery_js = animate_js

      if (/\.gif$/i.test(path)) {
        gallery = [{frame:0, path:path, path_file:toFileProtocol(path)}]

        self.EV_init = function () {
self.EV_b_width  = w_max
self.EV_b_height = h_max
        }
      }
      else if (/\.(pmd|pmx)$/i.test(path) && !gallery_js) {
        self.MMD_SA_options = { model_path: path }
      }
      else if (/_gimage\.\w+$/i.test(path)) {
        if (use_HTML5 && (returnBoolean("UseMatrixRain") || Settings.UseAudioFFT)) {
var dim = loadImageDim(path)
var w = dim.w
var h = dim.h

self.EV_width  = self.EQP_ref_width  = w
self.EV_height = self.EQP_ref_height = h
self.EQP_parts_path = "/"
self.EQP_ps = [{src:path.replace(/^.+[\/\\]/, ""), xy:w+'x'+h, o_min:-1}]

self.use_WMP = self.WMP_hidden = true

self.EQP_init_extra = function () {
  if (use_EQP_ripple) {
    if (/\.png$/i.test(path) && !EQP_Ripple.options_length) {
      var options = {
  mask: path.replace(/^.+[\/\\]/, "").replace(/\.png$/i, "")
 ,mask_alpha_base: 51
 ,mask_alpha_base_feather: -1
// ,mask_inverted: true
      }
      EQP_Ripple.load_options(options)
    }
  }
}

document.write('<script language="JavaScript" src="js/EQP.js"></scr'+'ipt>')
        }
        else {
          use_native_img = true
          gallery = [{frame:0, path:path, path_file:toFileProtocol(path)}]

          self._image_ratio = parseFloat(LABEL_LoadSettings("LABEL_image_ratio", 0));
          var image_ratio_default = (System.Gadget.docked) ? 0.5 : 1
          if (_image_ratio == image_ratio_default)
            _image_ratio = 0

          self.EV_initialized = false
          self.EV_init = function () {
if (!EV_initialized) {
  EV_initialized = true

  document.body.title += ', double-click to change size'
  document.body.ondblclick = function () {
var image_ratio_default = (System.Gadget.docked) ? 0.5 : 1
if (!_image_ratio)
  _image_ratio = image_ratio_default
if (_image_ratio <= 0.25)
  _image_ratio = 1
else
  _image_ratio -= 0.25

if (_image_ratio == image_ratio_default)
  _image_ratio = 0

resize()
  }

  var path = gallery[0].path
  if (use_EQP_ripple && /\.png$/i.test(path) && !EQP_Ripple.options_length) {
    var options = {
  mask: path.replace(/^.+[\/\\]/, "").replace(/\.png$/i, "")
 ,mask_alpha_base: 51
 ,mask_alpha_base_feather: -1
// ,mask_inverted: true
    }
    EQP_Ripple.load_options(options)
  }
}

if (_image_ratio)
  image_ratio = _image_ratio
DEBUG_show('Size:' + (image_ratio*100) + '%', 2)
System.Gadget.Settings.writeString("LABEL_image_ratio", image_ratio)
self.EV_b_width  = w_max_org * image_ratio
self.EV_b_height = h_max_org * image_ratio
          }
        }
      }
      else {
        EQP_gallery = [path]

        var js_path = path.replace(/[^\\\/]+$/, "animate.js")
        if (!(is_SA_child_animation_host && !is_SA_child_animation) && ValidatePath(js_path))
          gallery_js = js_path

        if (/\.(jpg|jpeg|png)$/i.test(path)) {
          if (use_SA_browser_mode && !use_HTML5) {
            use_HTML5 = true
          }
        }
        else if (/\.(webm|mp4|mkv)$/i.test(path)) {
// [LEGACY REMOVED 1B] else { use_Silverlight = true } branch removed (ie9_mode always true)
  EQP_use_HTML5_video = true
  if (!gallery_js) {
    self.EQP_video_options = { play_sound:true, loop_forever:true }
    self.EQP_bg_border = "2px solid black"
    var ev = System.Gadget.Settings.readString("EventToMonitor")
    if (!ev || !/SOUND/.test(Settings_default.EventToMonitor)) {
      EQP_video_options.hide_EQ = true
      Settings.Display = "0"
    }
  }
        }
      }
      return
    }

    if (/\.EQP-gallery$/i.test(path))
      EQP_gallery = []
  }

  var SEQ_RE = /([^\/\\]+)\.SEQ\-(\d+)\-(\d+)$/i

  var SEQ_sub_obj = null
  if (SEQ_RE.test(path)) {
    SEQ_mode = true

    var fps_ini = parseInt(RegExp.$2)
    if (fps_ini < 1)
      fps_ini = 1
    else if (fps_ini > 30)
      fps_ini = 30

    var fps_end = parseInt(RegExp.$3)
    if (fps_end < 1)
      fps_end = 1
    else if (fps_end > 30)
      fps_end = 30

    var s_name = RegExp.$1
    if (!is_root && SEQ_gallery_by_name[s_name])
      s_name += "|" + path
    SEQ_sub_obj = { SEQ_name:s_name, SEQ_fps_ini:fps_ini, SEQ_fps_end:fps_end, loop_factor:1, count:0 }

    if (is_root) {
      SEQ_gallery_all = []
      SEQ_gallery = []
      SEQ_gallery_by_name = {}
      SEQ_gallery_by_percent = []

      SEQ_fps_ini = SEQ_fps_end = 1
      SEQ_ani_count = 0
      SEQ_gallery_index = -1
      SEQ_gallery_percent_index = -1
    }
  }
  else if (is_root)
    SEQ_mode = false

  var g = []
  var ss_frame_count = 0
  var ss_path_list = []
  var ss_w = 0
  var ss_h = 0

  var ss_path_raw_list = []
  var ss_ref_frame = {}
  var ss_frame_copy = {}

  var items = f.SHFolder.Items
//console.log(items.count)
  for (var i = 0, i_max = items.count; i < i_max; i++) {
    var item = items.item(i)

    if (item.isLink) {
      var item_linked
      try {
        item_linked = System.Shell.itemFromPath(item.link.path)
      }
      catch (err) {}

      if (!item_linked)
        continue

      item = item_linked
    }

    if (item.isFolder) {
// Settings.to_include_subfolders
      if (SEQ_mode && SEQ_RE.test(item.path)) {
        if (!ItemsFromFolder(item.path))
          return false
      }
    }
    else if (item.isFileSystem) {
      var path = item.path

      if (is_root && /animate\.js$/i.test(path)) {
        if (!(is_SA_child_animation_host && !is_SA_child_animation))
          gallery_js = path
        continue
      }

      if (EQP_gallery) {
        if (!/\.(bmp|gif|jpg|jpeg|png|wmv|webm|mp4|mkv)$/i.test(path))
          continue

        if (/\.(wmv|webm|mp4|mkv)$/i.test(path)) {
          var alt_format = null
          // [LEGACY REMOVED 1B] xul_mode format preference branch removed
          if (/\.(webm)$/i.test(path))
            alt_format = ["wmv", "mp4", "mkv"]

          if (alt_format) {
            var alt_format_found
            for (var k = 0 ; k < alt_format.length; k++) {
              if (ValidatePath(path.replace(/\.\w{3,4}$/, "." + alt_format[k]))) {
                alt_format_found = true
                break
              }
            }
            if (alt_format_found)
              continue
          }

EQP_use_HTML5_video = /\.(webm|mp4|mkv)$/i.test(path)
// [LEGACY REMOVED 1B] use_Silverlight fallback removed
        }

        EQP_gallery.push(path)
        continue
      }

      if (!/\.(bmp|gif|jpg|jpeg|png)$/i.test(path))
        continue

      var frames = []
      var FO = null

      if (/[\\\/](\d+)(x\d+)?\.\w+$/i.test(path)) {
        var frame = parseInt(RegExp.$1)

        var frame_copy = 1
        if (RegExp.$2) {
          if (/x(\d+)/i.test(RegExp.$2))
            frame_copy = parseInt(RegExp.$1)
        }

        frames[0] = { frame:frame, frame_copy:frame_copy }
      }
      else if (/ss\-(\d+)x(\d+)\-(\d+)(_[x\-\d]+)?\.\w+$/i.test(path)) {
gallery_cache_obj.SS_mode = true
SEQ_gallery_memory_saving_mode = true
        var w, h
        w = ss_w = parseInt(RegExp.$1)
        h = ss_h = parseInt(RegExp.$2)
        var frames_max = parseInt(RegExp.$3)

        var frame_copy_list = []
        if (RegExp.$4) {
          var fc_str = RegExp.$4
          var fc = fc_str.replace(/^_/, "").split("-")
          for (var k = 0; k < fc.length; k++) {
            if (/(\d+)x(\d+)/i.test(fc[k]))
              frame_copy_list[RegExp.$1] = parseInt(RegExp.$2)
          }
        }

        for (var k = 0; k < frames_max; k++) {
          var x = (k % 10)
          var y = parseInt(k/10)

          var frame = ss_frame_count + k

          var frame_copy = frame_copy_list[k]
          if (frame_copy)
            ss_frame_copy[frame] = frame_copy
          else
            frame_copy = 1

          frames.push({ frame:frame, frame_copy:frame_copy,  ss_mode:true, ss_x:x*w, ss_y:y*h, w:w, h:h })
        }

        FO = FrameObject()
      }
      else
        continue

      var path_file = toFileProtocol(path)
      ss_path_raw_list.push(path)
      ss_path_list.push(path_file)

if (!SEQ_gallery_memory_saving_mode) {
  for (var k = 0, k_max = frames.length; k < k_max; k++) {
    var ff = frames[k]

    var frame = ff.frame
    var obj = (FO) ? new FO(frame) : { frame:frame }

    var is_ref_frame = (!ff.ss_mode || (frame == ss_frame_count))
    var obj_ref = obj
    if (is_ref_frame) {
      if (ff.ss_mode) {
        obj_ref = FO.prototype

        obj_ref.ss_mode = true
        obj_ref.w = ff.w
        obj_ref.h = ff.h
      }
      obj_ref.path = path
      obj_ref.path_file = path_file
    }

    if (ff.ss_mode) {
      obj.ss_x = ff.ss_x
      obj.ss_y = ff.ss_y
    }

    for (var c = 0; c < ff.frame_copy; c++)
      g.push(obj)
  }
}

      ss_ref_frame[ss_frame_count] = true

      ss_frame_count += frames_max
      if (ss_frame_count > 999)
        return false
    }
  }

  if (SEQ_sub_obj && (g.length || ss_frame_count)) {
    SEQ_sub_obj.ss_w = ss_w
    SEQ_sub_obj.ss_h = ss_h
    if (SEQ_gallery_memory_saving_mode) {
      SEQ_sub_obj.ss_frame_count = ss_frame_count
      SEQ_sub_obj.ss_path_raw_list = ss_path_raw_list
      SEQ_sub_obj.ss_frame_copy = ss_frame_copy
      SEQ_sub_obj.ss_ref_frame = ss_ref_frame
    }
    else {
      SEQ_sub_obj.gallery = g
    }

    if (ss_path_list.length)
      SEQ_sub_obj.ss_path_list = ss_path_list

    if (!is_root || !SEQ_gallery.length) {
      SEQ_sub_obj.SEQ_index = SEQ_gallery.length
      SEQ_gallery_all.push(SEQ_sub_obj)
      SEQ_gallery.push(SEQ_sub_obj)
      SEQ_gallery_by_name[SEQ_sub_obj.SEQ_name] = SEQ_sub_obj
    }
  }

  if (is_root) {
    if (SEQ_mode && SEQ_gallery.length)
      gallery = (SEQ_gallery[0].gallery) ? SEQ_gallery[0].gallery : SEQ_generate_gallery(SEQ_gallery[0])
    else
      gallery = g
  }

  return true
}

// To reduce memory usage by assigning a constructor to all frames of the same sprite sheet, and use prototyping on repeated properties
function FrameObject() {
  return (function (frame) { this.frame=frame })
}

var SEQ_gallery_ref

function SEQ_generate_gallery(g_obj) {
  var max = g_obj.ss_frame_count
  var ss_frame_copy = g_obj.ss_frame_copy
  var ss_ref_frame = g_obj.ss_ref_frame
  var w = g_obj.ss_w
  var h = g_obj.ss_h

  var path_index = 0

  var FO
  var g = []
  for (var frame = 0; frame < max; frame++) {
    var is_ref_frame = ss_ref_frame[frame]
    if (is_ref_frame)
      FO = FrameObject()

    var obj = new FO(frame)

    if (is_ref_frame) {
      var path = g_obj.ss_path_raw_list[path_index++]
      var path_file = toFileProtocol(path)

      var obj_ref = FO.prototype
      obj_ref.ss_mode = true
      obj_ref.w = w
      obj_ref.h = h
      obj_ref.path = path
      obj_ref.path_file = path_file
    }

    obj.ss_x = (frame % 10) * w
    obj.ss_y = parseInt(frame/10) * h

    var frame_copy = ss_frame_copy[frame]
    if (!frame_copy)
      frame_copy = 1

    for (var c = 0; c < frame_copy; c++)
      g.push(obj)
  }

  SEQ_gallery_ref = g
  return g
}

function loadImageDimALL() {
  if (!SEQ_mode) {
    for (var k = 0; k < gallery.length; k++) {
      var obj = gallery[k]
      var dim = loadImageDim(obj.path, obj)

      var w,h
      obj.w = w = dim.w
      obj.h = h = dim.h

      if (w_max < w)
        w_max = w
      if (h_max < h)
        h_max = h
    }
  }
  else {
    for (var i = 0; i < SEQ_gallery_all.length; i++) {
      var g_obj = SEQ_gallery_all[i]
      if (g_obj.ss_w) {
        var w = g_obj.ss_w
        var h = g_obj.ss_h

        if (w_max < w)
          w_max = w
        if (h_max < h)
          h_max = h

        continue
      }

      var g = g_obj.gallery
      for (var k = 0; k < g.length; k++) {
        var obj = g[k]
        var dim = loadImageDim(obj.path, obj)

        var w,h
        obj.w = w = dim.w
        obj.h = h = dim.h

        if (w_max < w)
          w_max = w
        if (h_max < h)
          h_max = h
      }
    }
  }

/*
  if (w_max && h_max)
    DEBUG_show(w_max + "x" + h_max, 2)
*/
}

function loadImageDim(path, obj) {
  if (obj && obj.w && obj.h)
    return { w:obj.w, h:obj.h }

  var item = ValidatePath(path)
  if (!item)
    return { w:0, h:0 }

  var w,h
  var meta_dim
  if (Vista_or_above)
    meta_dim = item.metadata("Dimensions")
  else if (Shell_OBJ) {
    try {
      var f = path.replace(/[\/\\][^\/\\]+$/, "")
      var p = path.replace(/^.+[\/\\]/, "")

      var dir = Shell_OBJ.NameSpace(f);
      var img = dir.ParseName(p);

      meta_dim = img.ExtendedProperty("Dimensions");
      if (!meta_dim)
        meta_dim = dir.GetDetailsOf(img, 26);
    }
    catch (err) {}
  }

  if (meta_dim && /(\d+)\D+(\d+)/.test(meta_dim)) {
    w = parseInt(RegExp.$1)
    h = parseInt(RegExp.$2)
  }
  else {
    w = 130
    h = 130
  }

  return { w:w, h:h }
}

var SA_extra_info_on

var SEQ_SP_gallery = []
var SEQ_SP_gallery_index = 0
var SEQ_SP_pic_index = -1
var SEQ_SP_finished

function SEQ_SmartPreloading() {
  if (EV_usage > 5)
    return

  if (!SEQ_SP_gallery.length)
    SEQ_SP_gallery = (SEQ_gallery_by_percent.length || !SEQ_gallery_shuffled.length) ? SEQ_gallery_all : SEQ_gallery_shuffled.slice(0)

  var preload_count = 10
  while ((!SEQ_SmartPreloading_Core()) && (--preload_count > 0)) {}

if (!preload_count && SA_extra_info_on)
DEBUG_show('(SP)',1)
}

function SEQ_SmartPreloading_Core() {
  if (++SEQ_SP_pic_index >= SEQ_SP_gallery[SEQ_SP_gallery_index].gallery.length) {
    SEQ_SP_pic_index = 0
    if (++SEQ_SP_gallery_index >= SEQ_SP_gallery.length) {
//DEBUG_show('(SP Finished)',2)
      SEQ_SP_finished = true
      Seq.item("SEQ_SmartPreloading").Stop()
      return true
    }
  }

  var pic = SEQ_SP_gallery[SEQ_SP_gallery_index].gallery[SEQ_SP_pic_index]
  if (pic.w && pic.h)
    return false

if (SA_extra_info_on)
DEBUG_show('(SP ' + (SEQ_SP_pic_index+1) + '/' + (SEQ_SP_gallery_index+1) + '/' + SEQ_SP_gallery.length + ')',1)
  var dim = loadImageDim(pic.path)
  pic.w = dim.w
  pic.h = dim.h
  return true
}

function LABEL_LoadSettings(name, v_default) {
  if (Settings.LABEL_matched) {
    var v = System.Gadget.Settings.readString(name)
    return ((v) ? v : v_default)
  }

  System.Gadget.Settings.writeString(name, "")
  return v_default
}

function loadFolder_CORE() {
  Settings.f_path = System.Gadget.Settings.readString("Folder")
  if (Settings.f_path) {
    if (/^demo\d+$/.test(Settings.f_path))
      Settings.f_path = path_demo[Settings.f_path]
  }
  else {
    Settings.f_path = f_path_default
  }

  return Settings.f_path
}

var Canvas_BDDraw_disabled = !returnBoolean("EnableBeatDetection") || !returnBoolean("EnableMotionEffectForAnimatedPicture")

function Canvas_BDDraw(canvas, beat) {
  var cw = canvas.width
  var ch = canvas.height
  var context
  var co = ['source-over', 'source-over']
  if (self.CANVAS_cached_layer_effect && Canvas_Effect && (Canvas_Effect.canvas == SL)) {
    if (!CANVAS_cached_layer_effect.width) {
      co[1] = 'copy'
      CANVAS_cached_layer_effect.width  = cw
      CANVAS_cached_layer_effect.height = ch
    }

    context = CANVAS_cached_layer_effect.getContext("2d")
    context.globalCompositeOperation = co[1]
    context.globalAlpha = 1
    context.drawImage(Canvas_Effect.canvas_buffer, 0,0)

    co[1] = 'source-over'
  }

  if (Canvas_BDDraw_disabled)
    return

  if (beat == null)
    beat = (EV_usage_sub && EV_usage_sub.BD) ? EV_usage_sub.BD.beat2 : 0

  if (!beat)
    return

  CANVAS_must_redraw = true

  var bd_scale   = beat / (16 / Math.pow(2, Settings.BDScale))
  var bd_opacity = 0.5 + (Settings.BDOpacity-1) * 1/6
  bd_opacity = bd_opacity*0.25 + beat*bd_opacity*0.75

  var w = parseInt(cw * bd_scale)
  var h = parseInt(ch * bd_scale)

  if (self.CANVAS_cached_layer_effect) {
    context = CANVAS_cached_layer_dummy.getContext("2d")
    context.globalCompositeOperation = 'copy'
    CANVAS_cached_layer_dummy.width  = cw
    CANVAS_cached_layer_dummy.height = ch

    if (!CANVAS_cached_layer_effect.width) {
      co[1] = 'copy'
      CANVAS_cached_layer_effect.width  = cw
      CANVAS_cached_layer_effect.height = ch
    }
  }
  else {
    context = canvas.getContext("2d")
    context.globalCompositeOperation = 'source-over'
  }

  context.globalAlpha = bd_opacity
  context.drawImage(canvas, w/2,h/2,cw-w,ch-h, 0,0,cw,ch)

  if (self.CANVAS_cached_layer_effect) {
    var layers = [canvas, CANVAS_cached_layer_effect]
    for (var i = 0; i < 2; i++) {
      context = layers[i].getContext("2d")
      context.globalCompositeOperation = co[i]
      context.globalAlpha = 1
      context.drawImage(CANVAS_cached_layer_dummy, 0,0)
    }
  }
}


// main
// "loadFolder()"
(function () {
  Settings.Folder_original = System.Gadget.Settings.readString("Folder")
  Settings.f_path_original = loadFolder_CORE()

  Settings.f_path_folder = Settings.f_path

  Settings.LABEL_f_path = System.Gadget.Settings.readString("LABEL_Folder")
  if (Settings.LABEL_f_path && (Settings.LABEL_f_path == Settings.f_path))
    Settings.LABEL_matched = true
  else
    System.Gadget.Settings.writeString("LABEL_Folder", Settings.f_path)

// obsolete
//  Settings.to_include_subfolders = returnBoolean("IncludeSubfolders")

// main
  gallery = []
  pic_last = null

  ItemsFromFolder(Settings.f_path, true)
  if (MacFace_mode) {
    document.write(
  '<script language="JavaScript" src="js/PlistXMLParser.js"></scr'+'ipt>\n'
+ '<script language="JavaScript" src="js/vistaFace.js"></scr'+'ipt>'
    )
    return
  }

  if (!(is_SA_child_animation_host && !is_SA_child_animation) && !gallery_js && !gallery.length && (!EQP_gallery || !EQP_gallery.length) && !self.MMD_SA_options) {
    EQP_gallery = null
    ItemsFromFolder(f_path_default, true)
  }

  // Load mmd/ dependencies before any path that loads MMD_SA.js
  if (gallery_js || self.MMD_SA_options) {
    document.write('<script language="JavaScript" src="js/mmd/audio.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/sfx.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/speech-bubble.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/vfx.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/webxr.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/osc.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/gamepad.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/wallpaper3d.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/sprite.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/camera-shake.js"></scr'+'ipt>')
    document.write('<script language="JavaScript" src="js/mmd/defaults.js"></scr'+'ipt>')
  }

  if (gallery_js)
    document.write(SystemEXT.ReadJS(gallery_js, true))
  else if (self.MMD_SA_options) {
    document.write('<script language="JavaScript" src="MMD.js/MMD_SA.js"></scr'+'ipt>')
  }
  else if (!EQP_gallery && returnBoolean("UseFilters"))
    document.write('<script language="JavaScript" src="js_filters/animate.js"></scr'+'ipt>')
})();
