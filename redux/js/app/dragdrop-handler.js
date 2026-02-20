// dragdrop-handler.js — Drag-drop handling, reload logic (Step 5C extraction from _SA.js)

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
