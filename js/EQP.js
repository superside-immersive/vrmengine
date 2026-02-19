// EQP (v3.3.1)

//  SA defaults
var EV_init
var EV_width, EV_height
var EV_BG_src, EV_BG_allow_dummy
var EV_animate_full

var use_full_spectrum = true
// END


var use_EQP_normal = true

var EQP_use_HTML_IMG, EQP_use_HTML_IMG_FULL
if (w3c_mode) { EQP_use_HTML_IMG = EQP_use_HTML_IMG_FULL = true }

// No 'EQP_HTML_bg_color' by default since v3.7.6
var EQP_HTML_bg_color = "";

var EQP_EV_width, EQP_EV_height
var EQP_ref_width, EQP_ref_height
var EQP_BG_width, EQP_BG_height
var EQP_BG_x, EQP_BG_y
var EQP_init_extra, EQP_animate_extra
var EQP_EQ_mode, EQP_EQ_index
var EQP_EQ_min = 99
var EQP_EQ_max = 0
var EQP_o_min, EQP_o_max
var EQP_allow_resize
var EQP_size_scale
var EQP_size_scale_auto = true
var EQP_SS_path

var EQP_ps

var EQP_SL_xaml = []

/*
"EQP_decay_factor" is applied to the opacity. It's 0.2 by default (i.e. value can drop no more than 20% of the maximum value in a single update at 10fps).
"EQP_decay_factor2" is applied to the system activity value. It's 1.0 by default (i.e. value can drop fully).
Changing these values may produce some interesting results.
*/
var EQP_decay_factor
var EQP_decay_factor2

var use_EQP_FB


// [extracted] eqp/resize.js — EQP_resize function


var EQP_meter_count = 1

var EQP_EV_initialized

var EQP_EV_init = function () {
  if (EQP_EV_initialized) {
    if (EQP_allow_resize)
      EQP_resize()

    return
  }
  EQP_EV_initialized = true

  EQP_EV_width  = EV_width
  EQP_EV_height = EV_height

  if (use_HTML5 && use_MatrixRain) {
    if (MatrixRain_para && MatrixRain_para.content_mask)
      MatrixRain_para.content_mask = (Settings.f_path_folder + '\\' + ((EQP_parts_path) ? EQP_parts_path + '\\' : '')) + MatrixRain_para.content_mask

    EQP_matrix_rain = new MatrixRain(EV_width, EV_height, MatrixRain_para)
    EQP_matrix_rain.matrixCreate()

    EQP_matrix_rain._SA_draw = function(skip_matrix) {
if (!this._SA_active)
  return

if (use_full_fps && !skip_matrix)
  skip_matrix = !EV_sync_update.frame_changed("matrixDraw")

this.matrixDraw(skip_matrix)

this.draw(SL)

var context = SL.getContext("2d")
context.globalAlpha = 1
context.globalCompositeOperation = 'copy'
if (Settings.UseCanvasPPE) {
  WebGL_2D._matrix_rain = this
}
else
  context.drawImage(this.canvas, 0,0)

CANVAS_must_redraw = true
    }

    DEBUG_show("Use Matrix rain", 2)
  }


// Defaults START
  var size_default = (System.Gadget.docked) ? 0.5 : 1
  if ((EQP_size_scale == null) || !use_Silverlight) {
    if (ie9_mode && !returnBoolean("CSSTransformToChildAnimation") && (SA_zoom != 1)) {
      EQP_size_scale = SA_zoom
      SA_zoom = 1
    }
    else {
      EQP_size_scale = parseFloat(LABEL_LoadSettings("LABEL_EQP_size_scale", size_default))
      if (EQP_size_scale % 0.25)
        EQP_size_scale = 1
    }
  }
  if (EQP_size_scale != size_default)
    EQP_size_scale_default = EQP_size_scale

  EQP_SS_path = LABEL_LoadSettings("LABEL_EQP_SS_path", "")

  if (!EQP_ref_width)
    EQP_ref_width = EV_width
  if (!EQP_ref_height)
    EQP_ref_height = EV_height

  if (!EQP_BG_width)
    EQP_BG_width = EV_width
  if (!EQP_BG_height)
    EQP_BG_height = EV_height
  if (!EQP_BG_x)
    EQP_BG_x = 0
  if (!EQP_BG_y)
    EQP_BG_y = 0

  if (EQP_parts_path == "/")
    EQP_parts_path = ""
  else if (!EQP_parts_path)
    EQP_parts_path = "parts_" + EV_width + "x" + EV_height

  if (!EQP_use_HTML_IMG)
    EQP_use_HTML_IMG = false

  if (EQP_EQ_mode == null)
    EQP_EQ_mode = true

  if (EQP_decay_factor == null)
    EQP_decay_factor = 0.2
  if (EQP_decay_factor2 == null)
    EQP_decay_factor2 = 1

  if (EQP_o_min == null)
    EQP_o_min = 0
  if (EQP_o_max == null)
    EQP_o_max = 100

  if (EQP_EQ_index == null)
    EQP_EQ_index = 0

  if (Canvas_Effect && use_HTML5 && !Canvas_Effect.show_behind_content)
    Canvas_Effect.canvas = "SL"
// END


//  BG.removeObjects()
  var _SL_TL = []
  var _SL_LR = []

  var svg_objs = []

  var ani_path = Settings.f_path_folder + '\\' + ((EQP_parts_path) ? EQP_parts_path + '\\' : '')
  for (var i = 0, i_max = EQP_ps.length; i < i_max; i++) {
    var ps = EQP_ps[i]

// Defaults START
    ps.z = ps.index = i
    ps.src = ps.src.replace(/\//g, "\\")

    var RE = /\.(bmp|gif|jpg|jpeg|png|wmv|webm|mp4|mkv)$/i;
    ps.file_ext = (RE.test(ps.src)) ? RegExp.$1 : 'png'
    ps.is_video = /wmv|webm|mp4|mkv/i.test(ps.file_ext)

    if (ps.is_video && !use_Silverlight)
      continue

    ps.src = ps.src.replace(RE, "")
    var img_path = ani_path + ps.src + '.' + ps.file_ext

    if (ps.o_min == null)
      ps.o_min = EQP_o_min
    else if (ps.o_min == -1) {
      ps.o_min = 100
      ps.static_alpha = true
    }
    if (ps.o_max == null)
      ps.o_max = EQP_o_max
    if (ps.o_min == ps.o_max)
      ps.static_alpha = true

    if (!ps.scale)
      ps.scale = {}

    if (!ps.rotate)
      ps.rotate = {}
    if (ps.rotation)
      ps.rotate.min = ps.rotate.max = ps.rotation

    for (var j = 0; j < 3; j++) {
      var pp
      if (j == 0)
        pp = ps
      else if (j == 1)
        pp = ps.scale
      else
        pp = ps.rotate

      pp._u = 0

      if (pp.u_min == null)
        pp.u_min = ps.u_min || 0
      if (pp.u_max == null)
        pp.u_max = ps.u_max || 100
      if (pp.u_min_hidden == null)
        pp.u_min_hidden = ps.u_min_hidden || -1
      if (pp.u_max_hidden == null)
        pp.u_max_hidden = ps.u_max_hidden || 999

      pp.decay  = {}
      pp.decay2 = {}
      if (pp.decay_factor  == null)
        pp.decay_factor  = ps.decay_factor  || EQP_decay_factor
      if (pp.decay_factor2 == null)
        pp.decay_factor2 = ps.decay_factor2 || EQP_decay_factor2
    }

    ps.static_scale = (ps.scale.min == null) || (ps.scale.min == ps.scale.max)
    ps.scale._scale = (ps.static_scale && ps.scale.min) || 1

    ps.static_rotate = ((ps.rotate.min == null) || (ps.rotate.min == ps.rotate.max)) && (ps.rotate.rpm_min == null)
    ps.rotate._rotate = ps.rotate._rotate_static = (ps.static_rotate && ps.rotate.min) || 0
    ps.rotate._rotate_by_rpm = 0

    ps.static_part = ps.static_alpha && ps.static_scale && ps.static_rotate

    ps.load = EQP_MM_Load
// END


// Find the min and max EQ bar used - START
if (ps.g_EQ || ps.g_num) {
  var g = (ps.g_EQ) ? ps.g_EQ : ps.g_num

  for (var k = 0; k < g.length; k++) {
    var v = g[k]
    var EQ_min, EQ_max

    if (ps.g_EQ) {
      EQ_min = v[0]
      EQ_max = v[v.length-1]
    }
    else {
      if (v == 0) {
        EQ_min = 0
        EQ_max = 3
      }
      else if (v == 1) {
        EQ_min = 4
        EQ_max = 11
      }
      else {
        EQ_min = 12
        EQ_max = 15
      }
    }

    if (EQP_EQ_min > EQ_min)
      EQP_EQ_min = EQ_min
    if (EQP_EQ_max < EQ_max)
      EQP_EQ_max = EQ_max
  }
}
// END


    var w = -1
    var h = -1

    var x = null
    var y = null
    if (ps.x != null)
      x = ps.x
    if (ps.y != null)
      y = ps.y
    if ((x == null) && (y == null)) {
      if (/_(\d+)x(\d+)$/.test(ps.src) || (ps.xy && /^(\d+)x(\d+)$/.test(ps.xy))) {
        x = EQP_ref_width - parseInt(RegExp.$1) + ((ps.x_offset) ? ps.x_offset : 0)
        y = EQP_ref_height - parseInt(RegExp.$2) + ((ps.y_offset) ? ps.y_offset : 0)
      }
    }

    ps.use_HTML_IMG_ = ps.use_HTML_IMG
    if (ps.use_HTML_IMG || use_SA_browser_mode)
      EQP_use_HTML_IMG = true
    ps.use_HTML_IMG = EQP_use_HTML_IMG
    var use_GADGET_IMG = !EQP_use_HTML_IMG

    if (EQP_use_HTML_IMG) {
      if (w3c_mode)
        EQP_allow_resize = false

      if (i == 0) {
        EQP_use_HTML_IMG_FULL = true

        if (EQP_HTML_bg_color == null)
          EQP_HTML_bg_color = "black"
      }
      if (EQP_HTML_bg_color) {
        var bg = document.createElement("div")
        bg.style.position = "absolute"
        bg.style.posLeft = 0
        bg.style.posTop = 0
        bg.style.pixelWidth = EV_width
        bg.style.pixelHeight = EV_height
        bg.style.backgroundColor = EQP_HTML_bg_color

        L_EV_content.appendChild(bg)

        // Make sure it is used only ONCE.
        EQP_HTML_bg_color = ""
      }

      if (x == null)
        x = y = 0
      ps.x_org = x
      ps.y_org = y

      var use_alpha = ps.use_alpha = (ps.o_min < 100)

if (use_SVG) {
  ps.use_SVG = ps.use_Silverlight = true

  var img_id = "main" + i + ((ps.is_video) ? "v" : "i")

  if (ps.w != null)
    w = ps.w
  if (ps.h != null)
    h = ps.h

  var svg = SVG_Object(img_id, ps)
  svg['Canvas.ZIndex'] = i
  svg['Canvas.Left'] = x
  svg['Canvas.Top'] = y
  if (use_alpha)
    svg.Opacity = ps.o_min/100

  if (ps.is_video) {}
  else {
    if (w == -1) {
      var dim = loadImageDim(img_path)
      w = dim.w
      h = dim.h
    }

    ps.img_obj_i = svg
  }

  ps.img = svg_objs[svg_objs.length] = svg

  ps.w_org = w
  ps.h_org = h

  svg.Source = toFileProtocol(img_path)

  if (ps.dragdrop)
    EQP_DragDrop_Init(ps)
}
else if (use_HTML5) {
  ps.use_HTML5 = ps.use_Silverlight = true

  var img_id = "main" + i + ((ps.is_video) ? "v" : "i")

  var mask = EQP_SS_init("EQP_ps[" + i + "]", img_id)

  if (ps.is_wallpaper) {
    ps.is_canvas = true
  }
  else if (ps.stretch_to_fill) {
    var dim = loadImageDim(img_path)
    var _w = dim.w
    var _h = dim.h
    var _ratio = Math.max(EQP_ref_width/_w, EQP_ref_height/_h)

    ps.w = Math.round(_w * _ratio)
    ps.h = Math.round(_h * _ratio)
    x += (EQP_ref_width  - ps.w)/2
    y += (EQP_ref_height - ps.h)/2
    ps.x_org = x
    ps.y_org = y
console.log(["ps" + i, ps.w,ps.h, x,y])
  }

  if (ps.w != null)
    w = ps.w
  if (ps.h != null)
    h = ps.h

  var c_obj = new CANVAS_Object(img_id, ps)
  var canvas = c_obj.canvas
  canvas['Canvas.ZIndex'] = i
  canvas['Canvas.Left'] = x
  canvas['Canvas.Top']  = y
  if (use_alpha)
    canvas.Opacity = ps.o_min/100

  if (ps.is_video) {}
  else {
    if (w == -1) {
      if (ps.is_wallpaper) {
        w = screen.width
        h = screen.height
      }
      else {
        var dim = loadImageDim(img_path)
        w = dim.w
        h = dim.h
      }
    }

    ps.img_obj_i = canvas
  }

  ps.img = canvas

  ps.w_org = w
  ps.h_org = h

  if (mask) {
    c_obj.load_mask(mask)
  }
  canvas.Source = toFileProtocol(img_path)

  if (ps.dragdrop)
    EQP_DragDrop_Init(ps)
}
else if (use_Silverlight) {
  ps.use_Silverlight = true

  var img_id = "main" + i

  if (ps.w != null)
    w = ps.w
  if (ps.h != null)
    h = ps.h

  var xaml_para = 'Canvas.ZIndex="' + i + '" Canvas.Left="' + x + '" Canvas.Top="' + y + '"' + ((use_alpha) ? ' Opacity="' + (ps.o_min/100) + '"' : '') + ' ';
  var xaml_src  = 'Source="' + toFileProtocol(img_path) + '" ';

  var xaml
  if (ps.is_video) {
    img_id += "v"

    var mask = ''
    if (para.mask) {
      mask =
  '<Canvas.OpacityMask>\n'
+ '<ImageBrush x:Name="' + img_id + '_mask" ImageSource="' + toFileProtocol(para.mask) + '"/>\n'
+ '</Canvas.OpacityMask>\n'
    }

    var mask_v = ''
    if (para.mask_v) {
      mask_v =
  '<MediaElement.OpacityMask>\n'
+ '<ImageBrush x:Name="' + img_id + '_obj_mask" ImageSource="' + toFileProtocol(para.mask_v) + '"/>\n'
+ '</MediaElement.OpacityMask>\n'
    }

    xaml =
  '<Canvas xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" x:Name="' + img_id + '" '
+ xaml_para
+ '>\n'
+ mask
+ '<MediaElement x:Name="' + img_id + '_obj" '
+ xaml_src
+ ((w > 0) ? 'Width="' + w + '" Height="' + h + '" ' : '')
+ 'MediaOpened="SL_MediaOpened" MediaEnded="SL_MediaEnded" '
+ ((ps.use_media_control) ? 'MouseEnter="SL_Media_MouseEnter" ' : '')
+ ((ps.play_sound) ? 'Volume="1"' : 'IsMuted="true"')
+ '>\n'
+ mask_v
+ '</MediaElement>\n'
+ '</Canvas>'

    ps.w_video = w
    ps.h_video = h
  }
  else {
    img_id += "i"

    var mask = EQP_SS_init("EQP_ps[" + i + "]", img_id)

    xaml =
  '<Image xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" x:Name="' + img_id + '" '
+ xaml_para + xaml_src
+ ((mask) ? 'Stretch="UniformToFill" ' : '')
+ '>\n'
+ mask
+ '</Image>'

    if (w == -1) {
      var dim = loadImageDim(img_path)
      w = dim.w
      h = dim.h
    }
  }

  if ((i > 0) && ps.group_id) {
    var i_last = i - 1
    var ps_last = EQP_ps[i_last]
    if (ps_last.group_id == ps.group_id) {
      xaml = EQP_SL_xaml[i_last] + '\n' + xaml
      EQP_SL_xaml[i_last] = null
    }
  }

  EQP_SL_xaml[i] = xaml

  ps.img = img_id

  ps.w_org = w
  ps.h_org = h

  if (ps.dragdrop)
    EQP_DragDrop_Init(ps)
}
else {
  var img = document.createElement("img")
  img.style.position = "absolute"
  img.style.posLeft = x
  img.style.posTop = y
  img.src = toFileProtocol(img_path)
  if (use_alpha) {
    if (ie9_mode)
      img.style.opacity = ps.o_min/100
    else
      img.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + ps.o_min + ")"
  }

  L_EV_content.appendChild(img)
  ps.img_obj = img

  if (use_alpha)
    ps.img = ps.img_HTML = (ie9_mode) ? img.style : img.filters.item("DXImageTransform.Microsoft.Alpha")
}

      if (EQP_allow_resize) {
        ps.full_size = (ps.full_size == null) ? true : ps.full_size
        ps.half_size = (ps.half_size == null) ? true : ps.half_size

        if (ps.full_size && ps.half_size) {
          use_GADGET_IMG = !use_Silverlight
        }
        else
          ps.fixed_size = true
      }
    }
    else {
      if (use_Silverlight)
        SL_ST_enabled = false
    }

    if (use_GADGET_IMG) {
      if (!ps.static_alpha) {
        if (ps.o_min > 99)
          ps.o_min = 99
        if (ps.o_max > 99)
          ps.o_max = 99
      }

      var img = BG.addImageObject(img_path, 0,0)
      w = ps.w_org = img.width
      h = ps.h_org = img.height

      if (x == null) {
        x = parseInt((EQP_ref_width - img.width) / 2)
        y = parseInt((EQP_ref_height - img.height) / 2)
        if (x % 2)
          x++
        if (y % 2)
          y++
      }

      x = ps.x_org = x - EQP_BG_x
      y = ps.y_org = y - EQP_BG_y

      img.left = x
      img.top = y
      img.opacity = ps.o_min
      ps.img = ps.img_GADGET = img

      if (use_Silverlight)
        SL_PP_enabled = false
    }

var _SL_TL_x = _SL_TL[0]
if ((_SL_TL_x == null) || (_SL_TL_x > x))
  _SL_TL[0] = x
var _SL_TL_y = _SL_TL[1]
if ((_SL_TL_y == null) || (_SL_TL_y > y))
  _SL_TL[1] = y

var _SL_LR_x = _SL_LR[0]
if ((_SL_LR_x == null) || (_SL_LR_x < x+w))
  _SL_LR[0] = x+w
var _SL_LR_y = _SL_LR[1]
if ((_SL_LR_y == null) || (_SL_LR_y < y+h))
  _SL_LR[1] = y+h

    // cross-script compatibility
    ps.x_default = x
    ps.y_default = y
    ps.w_default = w
    ps.h_default = h
  }


  EQP_Process_CanvasEffect_Mask(EQP_EV_width, EQP_EV_height)

  if (use_HTML5)
    EQP_allow_resize = true
  if ((w3c_mode) && !use_Silverlight)
    EQP_allow_resize = use_CSS3_2D_Transforms = true
  if (EQP_allow_resize && !document.body.ondblclick) {
//    if (!use_Silverlight_only && !webkit_electron_mode)
//      document.body.title += ', double-click to change size'
    if (!WallpaperEngine_mode)
      document.body.ondblclick = EQP_onresize
  }

  EV_BG_src = ""

  var s = BG.style
  s.posLeft = EQP_BG_x
  s.posTop = EQP_BG_y
  s.pixelWidth = EQP_BG_width
  s.pixelHeight = EQP_BG_height

//DEBUG_show(EQP_EQ_min+'-'+EQP_EQ_max)
  if (!EV_usage_sub)
    EV_usage_sub = EV_object[0].EV_usage_sub = EV_usage_sub_CREATE(null, "sound", 3)

  if (use_Silverlight_only && !EQP_SL_xaml.length)
    use_Silverlight = false

  if (EQP_allow_resize || use_Silverlight)
    EQP_resize()
  else {
    if (EQP_use_HTML_IMG_FULL)
      EV_BG_allow_dummy = (EQP_size_scale == 1)
  }

  if (EQP_init_extra)
    EQP_init_extra()


// Silverlight
  if (use_Silverlight) {
//DEBUG_show(_SL_TL+'x'+_SL_LR,0,true)
    var x = _SL_TL[0]
    var y = _SL_TL[1]
    EQP_SL_x = x
    EQP_SL_y = y
    EQP_SL_w = _SL_LR[0] - x
    EQP_SL_h = _SL_LR[1] - y
//DEBUG_show(EQP_SL_x+','+EQP_SL_y+'/'+EQP_SL_w+'x'+EQP_SL_h,0,true)

    if (use_HTML5) {
      EQP_SL_x = EQP_SL_y = 0
      EQP_SL_w = EQP_EV_width
      EQP_SL_h = EQP_EV_height
//DEBUG_show(EQP_SL_x+','+EQP_SL_y+'/'+EQP_SL_w+'x'+EQP_SL_h,0,true)
      HTML5_Init()
    }
    else if (use_SVG)
      SVG_Init(svg_objs)
    else
      SL_Init()
  }
  else if ((w3c_mode) && use_WMP) {
// SVG filter test
  }
}

if (!EV_init)
  EV_init = EQP_EV_init


// [extracted] eqp/animate.js

// [extracted] eqp/wallpaper_mode.js


// CORE
SA.loader.loadScriptSync('js/EQP_core.js');


// EQP - Free BG version
if (use_EQP_FB)
  SA.loader.loadScriptSync('js/EQP_FB.js');

// EQP extracted modules (Step 7A)
SA.loader.loadScriptSync('js/eqp/resize.js');
SA.loader.loadScriptSync('js/eqp/animate.js');
SA.loader.loadScriptSync('js/eqp/wallpaper_mode.js');


// Silverlight
var EV_SL_init = function () {

try {
  var group_id
  for (var i = 0; i < EQP_SL_xaml.length; i++) {
    var xaml = EQP_SL_xaml[i]
    if (!xaml) {
      group_id = EQP_ps[i].group_id
      continue
    }

    if (group_id) {
      xaml =
  '<Canvas xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" x:Name="' + group_id + '" '
+ 'Canvas.ZIndex="' + i + '"'
+ '>\n'
+ xaml + '\n'
+ '</Canvas>'
      group_id = null
    }

    SL_content.children.add(SL.content.createFromXaml(xaml, false));
  }
}
catch (err) { DEBUG_show(err.description, 0,true) }

try {
  var i
  for (i = 0; i < EQP_ps.length; i++) {
    var ps = EQP_ps[i]

    if (!ps.use_Silverlight)
      continue

    var img = ps.img
    if (!img)
      continue

    var name = ps.img
    img = ps.img = SL_root.FindName(name)

    if (ps.is_video)
      ps.img_obj_v = img
    else
      ps.img_obj_i = img
  }
}
catch (err) { DEBUG_show(err.description + '(' + i + ')', 0,true) }

// Enforce proper resizing
resize()

}


// Silverlight scripts
// [LEGACY REMOVED] Silverlight support removed
if (use_HTML5) {
  SA.loader.loadScriptSync('js/html5.js');
}
else if (use_SVG) {
  SA.loader.loadScriptSync('js/svg.js');
}
