/*

_SA.js (2025-02-22)

System Animator
(c) Butz Yung / Anime Theme. All rights reserved.
- Homepage: http://www.animetheme.com/

*/

// Load app modules (Step 5A extraction)
SA.loader.loadScriptSync('js/app/utils.js')
SA.loader.loadScriptSync('js/app/events.js')
SA.loader.loadScriptSync('js/app/init-ui.js')
SA.loader.loadScriptSync('js/app/resize.js')
// Load app modules (Step 5B extraction)
SA.loader.loadScriptSync('js/app/ev-init.js')
SA.loader.loadScriptSync('js/app/animate.js')
SA.loader.loadScriptSync('js/app/animate-core.js')
SA.loader.loadScriptSync('js/app/ev-processing.js')
SA.loader.loadScriptSync('js/app/seq-animate.js')
// Load app modules (Step 5C extraction)
SA.loader.loadScriptSync('js/app/sa-init.js')
SA.loader.loadScriptSync('js/app/dragdrop-handler.js')
SA.loader.loadScriptSync('js/app/load-main.js')
SA.loader.loadScriptSync('js/app/settings-io.js')
SA.loader.loadScriptSync('js/app/background.js')
SA.loader.loadScriptSync('js/app/gallery-utils.js')

// [9F] Seq_speed_delay removed (always 1)


var loaded
// [LEGACY REMOVED 1B] Silverlight vars removed
var use_Silverlight = true // semantic flag: use SVG/HTML5/Canvas rendering path
// [LEGACY REMOVED 9B] use_Silverlight_only removed (always false, dead)
// [LEGACY REMOVED 1B] xul_mode/xul_path/xul_transparent_mode branches removed
var is_SA_BG_transparent = webkit_transparent_mode

var absolute_screen_mode = (webkit_electron_mode && !returnBoolean("MoveWithinPrimaryScreen") && !is_SA_child_animation)

var spectrum_analyser, use_full_fps, use_full_fps_registered

var use_SVG_Clock = returnBoolean("UseSVGClock") // [9D] ie9_mode always true

var use_EQP_ripple = returnBoolean("UseCanvasRipple") // [9D] ie9_mode always true
var use_EQP_fireworks = returnBoolean("UseCanvasFireworks") // [9D] ie9_mode always true

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
        if (use_HTML5 && (returnBoolean("UseMatrixRain") || false /* [AUDIO REMOVED] */)) {
var dim = loadImageDim(path)
var w = dim.w
var h = dim.h

self.EV_width  = self.EQP_ref_width  = w
self.EV_height = self.EQP_ref_height = h
self.EQP_parts_path = "/"
self.EQP_ps = [{src:path.replace(/^.+[\/\\]/, ""), xy:w+'x'+h, o_min:-1}]

// [LEGACY REMOVED 9C] use_WMP/WMP_hidden assignment removed (WMP support deleted in Phase 1)

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

SA.loader.loadScriptSync('js/EQP.js')
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
    self.EQP_video_options = { play_sound:false, loop_forever:true } // [AUDIO REMOVED]
    self.EQP_bg_border = "2px solid black"
    EQP_video_options.hide_EQ = true
    Settings.Display = "0"
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
    // [AUDIO REMOVED] audio.js and sfx.js no longer loaded
    SA.loader.loadScriptSync('js/mmd/speech-bubble.js')
    SA.loader.loadScriptSync('js/ui/panel-manager.js')
    SA.loader.loadScriptSync('js/mmd/vfx.js')
    SA.loader.loadScriptSync('js/mmd/webxr.js')
    SA.loader.loadScriptSync('js/mmd/osc.js')
    SA.loader.loadScriptSync('js/mmd/gamepad.js')
    SA.loader.loadScriptSync('js/mmd/wallpaper3d.js')
    SA.loader.loadScriptSync('js/mmd/sprite.js')
    SA.loader.loadScriptSync('js/mmd/camera-shake.js')
    SA.loader.loadScriptSync('js/mmd/defaults.js')
    SA.loader.loadScriptSync('js/mmd/threex-vrm.js')
    SA.loader.loadScriptSync('js/mmd/threex-ppe.js')
    SA.loader.loadScriptSync('js/mmd/threex-motion.js')
    SA.loader.loadScriptSync('js/mmd/threex-utils.js')
    SA.loader.loadScriptSync('js/mmd/threex-gui.js')
    SA.loader.loadScriptSync('js/mmd/threex-model.js')
    SA.loader.loadScriptSync('js/mmd/threex-scene.js')
    SA.loader.loadScriptSync('js/mmd/threex-render-system.js')
    SA.loader.loadScriptSync('js/mmd/camera-view.js')
    SA.loader.loadScriptSync('js/mmd/shadowmap-spectrum.js')
    SA.loader.loadScriptSync('js/mmd/webgl2-convert.js')
    SA.loader.loadScriptSync('js/mmd/ripple.js')
    SA.loader.loadScriptSync('js/mmd/bone-utils.js')
    SA.loader.loadScriptSync('js/mmd/tray-menu.js')
    SA.loader.loadScriptSync('js/mmd/custom-actions.js')
    SA.loader.loadScriptSync('js/mmd/motion-control.js')
    SA.loader.loadScriptSync('js/mmd/mme-shaders.js')
    SA.loader.loadScriptSync('js/mmd/mme-render.js')
    SA.loader.loadScriptSync('js/mmd/mirrors.js')
    SA.loader.loadScriptSync('js/mmd/camera-mod.js')
  }

  if (gallery_js)
    document.write(SystemEXT.ReadJS(gallery_js, true))
  else if (self.MMD_SA_options) {
    SA.loader.loadScriptSync('MMD.js/MMD_SA.js')
  }
  else if (!EQP_gallery && returnBoolean("UseFilters"))
    SA.loader.loadScriptSync('js/animate_filters.js')
})();
