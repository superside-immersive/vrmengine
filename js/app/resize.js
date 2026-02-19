/*
  js/app/resize.js
  resize() function and related variables extracted from _SA.js (Step 5A)
  NOTE: This file exceeds 300 lines (~700) due to resize() being a monolithic function
  with extensive local variable dependencies. Marked for future refactoring.
*/

var webkit_saved_screenLeft, webkit_saved_screenTop

var EV_frame_offsetX, EV_frame_offsetY
var w_max_org, h_max_org
var SA_zoom_max = 2
var SA_zoom_filterType = "nearest"
var SA_zoom = 1//*1.5
var SA_rotate = 0//+90
var SA_body_offsetX, SA_body_offsetY
var SA_use_full_desktop
var SA_fullscreen_offsetX, SA_fullscreen_stretch_to_cover, SA_fullscreen_offsetY, is_SA_fullscreen_offset_custom
var B_content_width, B_content_height

// to absolutely make sure that there is no dead loop in resize
var _resize_loop_ = 0
var _resize_loop_timerID = null

function resize(no_focus, custom_resize, no_fullscreen_resize, fullscreen_adjust_position) {
// Fix some extreme cases in which resize can be run before DOM content is ready
  if (document.readyState == "loading")
    return

  if (++_resize_loop_ >= 100) {
    DEBUG_show("WARNING: dead loop in resize, possibly a bug",0,1)
    return
  }
  if (_resize_loop_timerID)
    clearTimeout(_resize_loop_timerID)
  _resize_loop_timerID = setTimeout(function(){_resize_loop_timerID=null; _resize_loop_=0;}, 100)


  var _SA_zoom = SA_zoom

  var screen_w, screen_h
  if (SA_use_full_desktop || (webkit_electron_mode && !is_SA_child_animation && returnBoolean("AutoItStayOnDesktop"))) {
    screen_w = screen.width
    screen_h = screen.height
  }
  else {
    screen_w = screen.availWidth
    screen_h = screen.availHeight
  }

// Native IMG START
if (use_native_img) {
  if (!w_max_org)
    w_max_org = w_max
  if (!h_max_org)
    h_max_org = h_max

  image_ratio = (System.Gadget.docked) ? 0.5 : 1

  BG.removeObjects()

  gallery_cache_obj.use_native_img = true
  gallery_cache_obj.clear()
  pic_last = null

  for (var i = 0; i < native_img_objs.length; i++)
    native_img_objs[i].clear()
}
// END

  if (custom_resize) {
    custom_resize()
  }
  else {
    if (self.EV_init)
      EV_init()
    if (self.EV_init2)
      EV_init2()
  }
  if (Settings.CSSTransform3DBoxAnimate && Box3D.init)
    Box3D.init()

  if (Canvas_Effect && !Canvas_Effect._initialized) {
    Canvas_Effect._initialized = true
    DEBUG_show("Use " + Canvas_Effect.name + " effect", 2)

    if (!EV_usage_sub)
      EV_usage_sub = EV_object[0].EV_usage_sub = EV_usage_sub_CREATE(null, "sound", 3)

//using absolute equality here
    if (Canvas_Effect.canvas === null) {
      Canvas_Effect._use_default_canvas = true

      var c_host = (returnBoolean("CSSTransform3DDisabledForContent")) ? document.getElementById("Lbody_host") : document.getElementById("Lbody")

      var c = Canvas_Effect.canvas = document.createElement("canvas")
      c.id = "CR"
      var cs = c.style
      cs.position = "absolute"
      cs.posLeft = cs.posTop = 0
      cs.zIndex = (Canvas_Effect.show_behind_content) ? 1 : 10
      c_host.appendChild(c)

      var c_for_hiding = c
      if (use_WebGL_2D) {
        WebGL_2D.createObject(c)
        c_for_hiding = (document.getElementById("SL")) ? null : c._WebGL_2D.canvas
      }

      // NOTE: global variable "CR" is not pointing to the CR canvas in some cases. Use direct reference to the canvas instead.
      if (use_SA_browser_mode && c_for_hiding)
        System._browser.mouseover_hide_list.push(c_for_hiding)
    }
  }

if (use_native_img) {
  w_max = w_max_org * image_ratio
  h_max = h_max_org * image_ratio
}

  if (!EV_frame_offsetX)
    EV_frame_offsetX = 0
  if (!EV_frame_offsetY)
    EV_frame_offsetY = 0

  var oBody = document.body.style

  var w_base, h_base
  if (System.Gadget.docked) {
    w_base = (w_max > 130) ? ((w_max < 140) ? w_max : 140) : 130
    h_base = 260
  }
  else {
    w_base = (w_max > 130) ? w_max : 130
    h_base = Math.max(h_max, 999)
  }

  b_width = (self.EV_b_width) ? EV_b_width : w_base
  b_height = (self.EV_b_height) ? EV_b_height : ((h_max > h_base) ? h_base : h_max)

  B_width = (self.EV_width) ? EV_width : b_width
  if (B_width < w_base)
    B_width = w_base
  B_height = (self.EV_height) ? EV_height : b_height

  if (self.EV_BG_src) {
    BG.src = EV_BG_src
//setTimeout('DEBUG_show("(BG: user defined)", 2)', 1000)
  }
  else {
    var bg_w, bg_h, bg_src
    if (self.EV_BG_src == "") {
      bg_w = BG.style.pixelWidth
      bg_h = BG.style.pixelHeight
    }
    else {
      bg_w = B_width  * SA_zoom
      bg_h = B_height * SA_zoom
    }

// IE9 fix
if (ie9) {
  if (bg_w < 130)
    bg_w = 130
}

    if (self.EV_BG_allow_dummy || (!MacFace_mode && !use_native_img && (!self.EV_init || (!self.EV_width && !self.EV_height)))) {
// IE9 fix
if (!ie9)
  bg_w = bg_h = 1

      bg_src = "images/_bg_dummy/1x1.png"
//DEBUG_show("(BG: OFF)", 2)
    }
    else {
      bg_src = "images/bg.png"
//setTimeout('DEBUG_show("(BG: default)", 2)', 1000)
    }

    BG.style.pixelWidth  = bg_w
    BG.style.pixelHeight = bg_h

    BG.src = bg_src

    // Windows 7's savior
    BG.opacity = 0
  }


  var bar_height = 8+((ie8_mode)?2:0)
  var bw = B_width
  var bh = B_height + ((Settings.Display > 0) ? bar_height*EV_usage_list.length : 0)
  var fullscreen = use_SA_browser_mode && Settings.CSSTransformFullscreen && (!is_SA_child_animation || is_SA_child_animation_host)

// Hopefully reduce the chance of random hang-ups during startup when running on Wallpaper Engine CEF
  if (WallpaperEngine_CEF_mode && self.MMD_SA && !MMD_SA_options.MMD_disabled && !MMD_SA.MMD_started && !is_SA_child_animation_host) fullscreen = false;

  if (fullscreen && !no_fullscreen_resize) {
    var w_ratio = screen_w / bw
    var h_ratio = screen_h / bh
    var zoom, stretch_to_cover
    if (SA_fullscreen_stretch_to_cover || (webkit_electron_mode && returnBoolean("AutoItStayOnDesktop"))) {
      var screen_aspect = screen_w / screen_h
      var ani_aspect = bw / bh
      if (((screen_aspect > ani_aspect) ? screen_aspect/ani_aspect : ani_aspect/screen_aspect) <= 1.25) {
        stretch_to_cover = true
        zoom = (w_ratio > h_ratio) ? w_ratio : h_ratio
      }
    }
    if (!zoom)
      zoom = (w_ratio < h_ratio) ? w_ratio : h_ratio

    // prevent dead loop due to roundup issues
    if (Math.abs(zoom - 1) > 0.05) {
      DEBUG_show("Fullscreen", 2)
      SA_zoom = zoom

if (stretch_to_cover) {
  SA_fullscreen_offsetX = (screen_w - Math.round(bw * zoom)) / 2
  SA_fullscreen_offsetY = (screen_h - Math.round(bh * zoom)) / 2
}
else {
  if (!is_SA_fullscreen_offset_custom)
    SA_fullscreen_offsetX = SA_fullscreen_offsetY = 0
}

// always disable CSS zoom for some animation types, even with child animations
      if (1 || !returnBoolean("CSSTransformToChildAnimation")) {
        if (self.EQP_size_scale && !self.EQP_video_options) {
          EQP_size_scale = zoom * EQP_size_scale
          SA_zoom = 1
          resize(true, function(){EQP_resize(EQP_size_scale)}, null,fullscreen_adjust_position)
          return
        }
        if ((self.MMD_SA && MMD_SA.use_jThree) || self.SV3D) {
          resize(null,null, true, fullscreen_adjust_position)
          return
        }
      }
    }

  }
  else {
    if (!is_SA_fullscreen_offset_custom)
      SA_fullscreen_offsetX = SA_fullscreen_offsetY = 0
  }

/*
  if ((SA_zoom != 1) && self.EQP_size_scale && use_WebGL_2D && (EQP_size_scale != SA_zoom)) {
//DEBUG_show(EQP_size_scale +','+ SA_zoom,0,1)
    EQP_size_scale = SA_zoom * EQP_size_scale
    SA_zoom = 1
    resize(null, function(){EQP_resize(EQP_size_scale)})
    return
  }
*/

  for (var i = 0, i_max = EV_usage_list.length; i < i_max; i++) {
    var id_prefix = "LCPU_main" + i
    var c = document.getElementById(id_prefix)
    if (!c)
      continue

    var cs = c.style
    if (Settings.Display > 0) {
      var color = bar_color[Settings.Display]
      document.getElementById(id_prefix + "_up").style.backgroundColor = color[0]
      document.getElementById(id_prefix + "_down").style.backgroundColor = color[1]

      if (ie8_mode) {
        document.getElementById(id_prefix + "_up").style.pixelHeight = document.getElementById(id_prefix + "_down").style.pixelHeight = document.getElementById(id_prefix + "_down").style.posTop = 4
        document.getElementById(id_prefix + "_content").style.pixelHeight = 8
      }

      if (w3c_mode && !bar_accelerate)
        document.getElementById(id_prefix + "_content").style.transition = "width " + (PC_count/10) + "s ease-out"

      cs.posTop = B_height + bar_height*i
      cs.pixelWidth = B_width - ((ie8_mode)?2:0)
      cs.visibility = "inherit"
    }
    else
      cs.visibility = "hidden"
  }

  var cs = Lmain_obj.style
  var bs = Lbody_host.style
  var x_shift = 0
  var y_shift = 0
  if (ie9_mode) {
    bs.pixelWidth  = bw
    bs.pixelHeight = bh

    var CSSTransform3D = Settings.CSSTransform3D
    if (w3c_mode && CSSTransform3D) {
      if (!is_SA_child_animation && !Lbody3D_navigation._transformOrigin) {
        if (/translateZ\(([^\)]+)\)|translate3d\([^\,]+\,[^\,]+\,([^\)]+)\)/.test(Settings.CSSTransform3D + " " + self.getComputedStyle(Lbody3D_main).msTransform))
          Lbody3D_navigation._z_view = parseFloat(RegExp.$1.trim())
        if (!Lbody3D_navigation._z_view)
          Lbody3D_navigation._z_view = 0

        Lbody3D_navigation._transformOrigin = Lbody3D_navigation.style.msTransformOrigin
        if (!Lbody3D_navigation._transformOrigin) {
          if (Settings.CSSTransform3DBoxAnimate) {
            Lbody3D_navigation._z_origin = Settings.CSSTransform3DBoxAnimate/2
          }
          else {
            Lbody3D_navigation._z_origin = -Lbody3D_navigation._z_view/2
          }
          Lbody3D_navigation.style.msTransformOrigin = Lbody3D_navigation._transformOrigin = "50% 50% " + Lbody3D_navigation._z_origin + "px"
        }
//DEBUG_show(Lbody3D_navigation._transformOrigin,0,1)

        Lbody3D_navigation._rotate3d = [0,0,0, 0]
        Lbody3D_navigation._translate3d = [0,0,0]
        Lbody3D_control.addEventListener("dblclick", function (event) {
Lbody3D_navigation.style.msTransform = ""
Lbody3D_navigation.style.msTransformOrigin = Lbody3D_navigation._transformOrigin
Lbody3D_navigation._rotate3d = [0,0,0, 0]
Lbody3D_navigation._translate3d = [0,0,0]

if (!is_SA_child_animation) {
  for (var i = 0; i < SA_child_animation_max; i++) {
    if (SA_child_animation[i])
      document.getElementById("Ichild_animation" + i).style.msBackfaceVisibility = "visible"
  }
}

DEBUG_show("(3D navigation reset)", 2)

event.stopPropagation()
        }, true)

// 3D Navigation
        Lbody3D_control._timerID = null
        Lbody3D_control.addEventListener("mousedown", function (event) {
if (this._timerID)
  clearTimeout(this._timerID)

if (event.button) return

this._timerID = setTimeout("Lbody3D_control._3d_navigation_start()", 250)
System._browser.onmouseup_custom = this._3d_navigation_cancel

this._x = event.clientX
this._y = event.clientY

event.stopPropagation()
        }, true)

        Lbody3D_control._3d_navigation_cancel = function () {
if (Lbody3D_control._timerID) {
  clearTimeout(Lbody3D_control._timerID)
  Lbody3D_control._timerID = null
}
System._browser.onmouseup_custom = null
        }

        Lbody3D_control._3d_navigation_start = function () {
this._timerID = null

var sb = System._browser
sb._drag_disabled_ORIGINAL = !!sb._drag_disabled
sb._drag_disabled = true
sb.onmousemove_custom = this._3d_navigation
sb.onmouseup_custom = this._3d_navigation_finish
sb.showFocus(true)

DEBUG_show("(3D navigation)", 2)
        }

        Lbody3D_control._3d_navigation = function (event) {
var ex = event.clientX
var ey = event.clientY

var x = ex - Lbody3D_control._x
var y = ey - Lbody3D_control._y

Lbody3D_control._x = ex
Lbody3D_control._y = ey

var rotate_y = x / B_content_width
var rotate_x = y / B_content_height

var r3d = Lbody3D_navigation._rotate3d
r3d[0] = (r3d[0] + (-rotate_x*360)) % 360
r3d[1] = (r3d[1] +  (rotate_y*360)) % 360
Lbody3D_navigation._transformed = true

System._browser.showFocus(true)
        }

        Lbody3D_control._3d_navigation_finish = function () {
var sb = System._browser
sb.onmousemove_custom = sb.onmouseup_custom = null
sb._drag_disabled = sb._drag_disabled_ORIGINAL
sb.showFocus(false)
        }

        Lbody3D_control.addEventListener(((webkit_mode)?"mousewheel":"DOMMouseScroll"), function (event) {
var rolled;
if ('wheelDelta' in event) {
  rolled = event.wheelDelta;
}
else {  // Firefox
  // The measurement units of the detail and wheelDelta properties are different.
  rolled = -40 * event.detail;
}
//DEBUG_show(rolled,0,1)
Lbody3D_navigation._translate3d[2] += rolled/12 *2
Lbody3D_navigation._transformed = true
        }, false)
      }

      var b3d = (is_SA_child_animation && returnBoolean("CSSTransformToChildAnimation")) ? parent.document.getElementById("Ichild_animation" + SA_child_animation_id) : Lbody3D_main

      if (/\{(.+)\}/.test(CSSTransform3D)) {
        var css = RegExp.$1.split(";")
        var prefix = "webkit" // [LEGACY REMOVED 1B] xul_mode/Moz prefix branch removed
        for (var i = 0; i < css.length; i++) {
          if (!/^(.+)\:(.+)$/.test(css[i].trim()))
            continue

          var n = RegExp.$1.trim()
          var v = RegExp.$2.trim()
          if (/transform|perspective/i.test(n))
            n = prefix + n.charAt(0).toUpperCase() + n.substr(1)
          n = n.replace(/\-(\w)/, function (str, p1) { return p1.toUpperCase() })

          b3d.style[n] = v
        }
      }
      else {
        b3d.style.msTransformOrigin = "50% 50%"
        b3d.style.msTransform = CSSTransform3D
      }
      b3d._transform_base = b3d.style.msTransform
    }

    var transform = []

    if (SA_rotate) {
var r = SA_rotate/180 * Math.PI
var a = Math.atan2(bh, bw)
var cos = Math.cos
var sin = Math.sin
var corners = [[cos(a+r),sin(a+r)], [cos(-a+r),sin(-a+r)]]

var max_x = 0
var max_y = 0
var abs = Math.abs
for (var i = 0; i < 2; i++) {
  var c = corners[i]
  var x = abs(c[0])
  var y = abs(c[1])
  if (max_x < x)
    max_x = x
  if (max_y < y)
    max_y = y
}

var diag = Math.sqrt(bw*bw + bh*bh)
x_shift = (max_x * diag - bw)  / 2
y_shift = (max_y * diag - bh) / 2

if (fullscreen) {
  var w_ratio = screen_w / (bw * SA_zoom + x_shift*2*SA_zoom)
  var h_ratio = screen_h / (bh * SA_zoom + y_shift*2*SA_zoom)
  SA_zoom *= (w_ratio < h_ratio) ? w_ratio : h_ratio
}

      transform.push("rotate(" + r + "rad)")
    }
    if ((SA_zoom != 1) || Settings.CSSTransformFlipH || Settings.CSSTransformFlipV) {
      const mod = SA_zoom - 1;
      transform.unshift("translate(" + (bw*mod/2) + "px," + (bh*mod/2) + "px)");
      transform.push("scale(" + (SA_zoom * ((Settings.CSSTransformFlipH)?-1:1)) + "," + (SA_zoom * ((Settings.CSSTransformFlipV)?-1:1)) + ")");
    }

    x_shift *= SA_zoom
    y_shift *= SA_zoom

    if (transform.length) {
// NOTE: assigning custom property to "style" (eg. Lbody_host.style._transformed) is not reliable
      Lbody_host._transformed = true
      bs.msTransformOrigin = "50% 50%"
      bs.msTransform = transform.join(" ")
      DEBUG_show("Use CSS Transform", 2)
    }
    else if (Lbody_host._transformed) {
      bs._transformed = false
      bs.msTransform = bs.msTransformOrigin = ""
    }
  }
  else {
    cs.pixelWidth  = B_width  * SA_zoom - (cs.posLeft * 2)
    cs.pixelHeight = B_height * SA_zoom - (cs.posTop  * 2)
    cs.filter = (SA_zoom == 1) ? "" : "progid:DXImageTransform.Microsoft.Matrix(M11=" + SA_zoom + ", M22=" + SA_zoom + ", FilterType='" + SA_zoom_filterType + "')"
  }

  if (Canvas_Effect && Canvas_Effect._use_default_canvas) {
    var cw = (Canvas_Effect.width)  ? Canvas_Effect.width  : B_width
    var ch = (Canvas_Effect.height) ? Canvas_Effect.height : B_height
    var dim = Canvas_Effect.resize(cw,ch, B_width)
    // NOTE: global variable "CR" is not pointing to the CR canvas in some cases. Use direct reference to the canvas instead.
    var c = Canvas_Effect.canvas
    c.style.posLeft = dim[0]
    c.style.posTop  = dim[1]
    c.width  = dim[2]
    c.height = dim[3]
  }

  if (SA_body_offsetX)
    x_shift += SA_body_offsetX
  if (SA_body_offsetY)
    y_shift += SA_body_offsetY

  if (SA_fullscreen_offsetX)
    x_shift += parseInt(SA_fullscreen_offsetX/SA_zoom)
  if (SA_fullscreen_offsetY)
    y_shift += parseInt(SA_fullscreen_offsetY/SA_zoom)

  B_content_width  = bw * SA_zoom + x_shift*2
  B_content_height = bh * SA_zoom + y_shift*2

  if (WallpaperEngine_mode && !is_SA_child_animation) {
    if (!SA_fullscreen_offsetX && (B_content_width  < screen_w) && (!self.MMD_SA || !fullscreen)) {
      x_shift += (screen_w - B_content_width)  / 2
    }
    if (!SA_fullscreen_offsetY && (B_content_height < screen_h) && (!self.MMD_SA || !fullscreen)) {
      y_shift += (screen_h - B_content_height) / 2
    }
  }

  B_content_width  = bw * SA_zoom + x_shift*2
  B_content_height = bh * SA_zoom + y_shift*2

  bs.posLeft = x_shift
  bs.posTop  = y_shift

  oBody.pixelWidth  = B_content_width
  oBody.pixelHeight = B_content_height

  if (use_SA_system_emulation) {
    let ls = Lquick_menu.style
    let qmb_list = document.getElementsByClassName("QuickMenu_button")
    let qmb_count = 6
    if ((B_content_height > screen_h-10)/* || fullscreen*/) {
      ls.posTop = 20+4
      for (var i = 0; i < qmb_list.length; i++)
        qmb_list[i].className = "QuickMenu_button QuickMenu_button_TL"
    }
    else {
      ls.posTop = ((browser_native_mode) ? screen_h : B_content_height) - (20+4)
      for (var i = 0; i < qmb_list.length; i++)
        qmb_list[i].className = "QuickMenu_button"
    }

    LbuttonTL.style.posLeft = ((browser_native_mode) ? screen_w : Math.min(B_content_width, screen_w)) - 24 - 12
    LbuttonTL.style.posTop  = 12
    if (is_mobile && (is_SA_child_animation_host || self.MMD_SA)) {
      if (document.fullscreenElement) {
        LbuttonFullscreen.style.visibility = "hidden"
        LbuttonRestore.style.visibility = "inherit"
      }
      else {
        LbuttonFullscreen.style.visibility = "inherit"
        LbuttonRestore.style.visibility = "hidden"
      }
    }
    else if (!is_SA_child_animation_host) {
      if ((_SA_zoom == 1) && !fullscreen && !SA_rotate) {
        LbuttonFullscreen.style.visibility = "inherit"
        LbuttonRestore.style.visibility = "hidden"
      }
      else {
        LbuttonFullscreen.style.visibility = "hidden"
        LbuttonRestore.style.visibility = "inherit"
      }
    }

    LbuttonLR.style.posLeft = ((browser_native_mode) ? screen_w : Math.min(B_content_width, screen_w)) - 24
    LbuttonLR.style.posTop  = ((browser_native_mode) ? screen_h : Math.min(B_content_height, screen.availHeight)) - 24

    if (!self.EQP_dragdrop_target) {
      Lquick_menu_gallery_button.style.display = "none"
      qmb_count--
    }

    if (!self.MMD_SA_options || !MMD_SA_options.WebXR || !MMD_SA_options.WebXR.AR) {
      Lquick_menu_ar_button.style.display = "none"
      qmb_count--
    }
//    ls.visibility = "inherit"

    if (WallpaperEngine_mode) {
      ls.posLeft = Math.min(B_content_width, screen_w) - (18*5+2)
      ls.posTop  = Math.min(B_content_height, screen.availHeight) - 24
    }

    ls.pixelWidth = (18*((is_mobile)?2:1)*qmb_count+2)

    if (is_mobile) {
      Lquick_menu.style.transform = Idialog.style.transform = "scale(" + (System._browser.css_scale*2) + ")"
    }
    if (is_mobile && self.MMD_SA_options) {
      Lnumpad.style.posLeft = B_content_width - 200
      Lnumpad.style.posTop  = 64
      Lnumpad.style.visibility = "inherit"
      Lnumpad.style.transform = "scale(" + (1 + (System._browser.css_scale-1)*0.5) + ")"
    }
  }

  if (browser_native_mode && !is_SA_child_animation) {
    Lbody_host.style.posLeft = Math.max((screen_w - B_content_width) /2, 0)
    Lbody_host.style.posTop  = Math.max((screen_h - B_content_height)/2, 0)
  }

  if (use_SVG_Clock)
    SVG_Clock.resize(B_width, B_height)

  if (!image_ratio)
    image_ratio = 1

  if (is_SA_child_animation) {
    var list = System._browser.mouseover_hide_list
    for (var i = 0; i < list.length; i++)
      list[i].style.visibility = "inherit"
    System._browser.WMPMask_Draw()
  }

  if ((fullscreen && fullscreen_adjust_position) || (webkit_electron_mode && returnBoolean("AutoItStayOnDesktop"))) {
//    var sx = parseInt((screen_w - B_content_width) / 2)
//    var sy = parseInt((screen_h - B_content_height) / 2)
    var _sx, _sy
    var sx = _sx = SA_top_window.screenLeftAbsolute
    var sy = _sy = SA_top_window.screenTopAbsolute

    screen_w = screen.availWidth
    screen_h = screen.availHeight

    var b = SA_top_window.getScreenBounds(sx, sy)

    if (sx > b.x + screen_w - B_content_width)
      sx = b.x + screen_w - B_content_width
    if (sy > b.y + screen_h - B_content_height)
      sy = b.y + screen_h - B_content_height

    if (sx < 0)
      sx = 0
    if (sy < 0)
      sy = 0

    if (webkit_electron_mode && ((sx != _sx) || (sy != _sy))) {
      System._browser._s_left = System._browser._s_top = null
      if (System._browser._window_move_timerID) {
        clearTimeout(System._browser._window_move_timerID)
        System._browser._window_move_timerID = null
      }
      let xy = SA_top_window.getPos()
      if ((xy[0] != sx) || (xy[1] != sy)) {
        System._browser._window_move_timerID = setTimeout("System._browser._window_move_timerID=null; SA_top_window.moveToAbsolute(" + sx + "," + sy + "); System._browser.moveWallpaper(" + sx + "," + sy + ");", 0)
      }
    }
  }

  if ((System._browser._s_left != null) && (System._browser._s_top != null)) {
    if (System._browser._window_move_timerID) {
      clearTimeout(System._browser._window_move_timerID)
      System._browser._window_move_timerID = null
    }
    let xy = SA_top_window.getPos()
    if ((xy[0] != System._browser._s_left) || (xy[1] != System._browser._s_top)) {
      System._browser._window_move_timerID = setTimeout(function () {
System._browser._window_move_timerID = null
SA_top_window.moveToAbsolute(System._browser._s_left, System._browser._s_top)
System._browser._s_left = System._browser._s_top = null
      }, 0);
    }
  }

// after all window moving/resizing timers (Electron v9+)
  if (webkit_mode)
    document.body.style._set()

  if (self.SL_MC_video_obj)
    SL_MC_Place()

// skip for HTA
  if (!ie9_native) {
    window.dispatchEvent(new CustomEvent("SA_resize"));
  }

  if (!no_focus) {
//if (!is_SA_child_animation) console.log(999)
    setTimeout('self.focus()', 250)//; if (webkit_mode) {System._browser.moveWallpaper()}', 300)
  }
}
