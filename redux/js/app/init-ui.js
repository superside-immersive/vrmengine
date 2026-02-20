/*
  js/app/init-ui.js
  System._browser and UI button initialization extracted from _SA.js init() (Step 5A)
*/

function SA_init_browser_ui() {
    var sb = System._browser
    sb.init()

    sb._onmouseover_custom = [function () {
// in SA_child_animation_host mode, hide the menu of parent window
if (is_SA_child_animation_host && !is_SA_child_animation) return

Lquick_menu.style.visibility = "inherit"
Lquick_menu._activated = true

if (this._onmouseout_waiting_custom0_timerID) {
  clearTimeout(this._onmouseout_waiting_custom0_timerID)
  this._onmouseout_waiting_custom0_timerID = null
}

if (this._drag_disabled)
  return

if ((B_content_width > 64) && (B_content_height > 64))
  LbuttonTL.style.visibility = "inherit"
if ((B_content_width > 64) && (B_content_height > 32))
  LbuttonLR.style.visibility = "inherit"
    }]

    sb._onmouseout_waiting_custom0_timerID = null
    sb._onmouseout_waiting_custom = [
(function () {
  var hide = function () { Lquick_menu.style.visibility = LbuttonTL.style.visibility = LbuttonLR.style.visibility = "hidden" }
  return function () {
if (returnBoolean("IgnoreMouseEventsPartial")) {
  if (sb._onmouseout_waiting_custom0_timerID)
    clearTimeout(sb._onmouseout_waiting_custom0_timerID)
  sb._onmouseout_waiting_custom0_timerID = setTimeout(hide, 3000)
}
else
  hide()

if (document.getElementById("SL_Host_Parent"))
  SL_Host_Parent.style.zIndex = 10
  }
})()
    ]

    sb._onmouseover_custom_all = function () {
var func = System._browser._onmouseover_custom
for (var i = 0; i < func.length; i++)
  func[i]()
    }

    sb._onmouseout_waiting_custom_all = function () {
var func = System._browser._onmouseout_waiting_custom
for (var i = 0; i < func.length; i++)
  func[i]()
    }

    if (sb.onmouseover_custom)
      sb._onmouseover_custom.push(sb.onmouseover_custom)
    if (sb.onmouseout_waiting_custom)
      sb._onmouseout_waiting_custom.push(sb.onmouseout_waiting_custom)

    Object.defineProperty(sb, "onmouseover_custom",
{
  get: function () {
return this._onmouseover_custom_all
  }

 ,set: function(func) {
this._onmouseover_custom.push(func)
  }
});

    Object.defineProperty(sb, "onmouseout_waiting_custom",
{
  get: function () {
return this._onmouseout_waiting_custom_all
  }

 ,set: function(func) {
this._onmouseout_waiting_custom.push(func)
  }
});

    if (browser_native_mode && !webkit_window && !is_SA_child_animation) {
//document.addEventListener('fullscreenerror', (e) => {DEBUG_show(9,0,1)});
      window.addEventListener("resize", function (e) {
function _resize() {
// temp fix for a WebXR dom overlay issue
//  if (self.MMD_SA && MMD_SA.WebXR.session && (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||0) > 85)) return;
//  SA_zoom = 1
  resize()
}

if (1||Settings.CSSTransformFullscreen) {
  System._browser.on_animation_update.remove(_resize, 0)
  System._browser.on_animation_update.add(_resize, (is_mobile)?10:0, 0)
}
      });
    }

    LbuttonFullscreen.addEventListener("click", async function (event) {
if (is_SA_child_animation) {
  if (is_SA_child_animation_host) {
    parent.document.getElementById("LbuttonFullscreen").click()
    LbuttonFullscreen.style.visibility = "hidden"
    LbuttonRestore.style.visibility = "inherit"
  }
  else
    DEBUG_show("(no fullscreen mode for child animation)", 2)
  return
}

if (is_mobile && (is_SA_child_animation_host || self.MMD_SA)) {
  LbuttonFullscreen.style.visibility = "hidden"
  LbuttonRestore.style.visibility = "inherit"
// Some browsers (e.g. Safari) does not return promise for requestFullscreen. Use await instead of then().
  await document.documentElement.requestFullscreen()
  DEBUG_show('Fullscreen:ON',2)
  return
}

System.Gadget.Settings.writeString("CSSTransformFullscreen", "non_default")
Settings.CSSTransformFullscreen = true
SA_zoom = 1

resize(null,null,null, true)

event.stopPropagation()
    }, true)

    LbuttonRestore.addEventListener("click", function (event) {
if (is_SA_child_animation_host && is_SA_child_animation) {
  parent.document.getElementById("LbuttonRestore").click()
  LbuttonFullscreen.style.visibility = "inherit"
  LbuttonRestore.style.visibility = "hidden"
  return
}

if (is_mobile && (is_SA_child_animation_host || self.MMD_SA)) {
  LbuttonFullscreen.style.visibility = "inherit"
  LbuttonRestore.style.visibility = "hidden"
  document.exitFullscreen().then(()=>{DEBUG_show('Fullscreen:OFF',2)});
  return
}

System.Gadget.Settings.writeString("CSSTransformFullscreen", "")
System.Gadget.Settings.writeString("CSSTransformScale", 1)
System.Gadget.Settings.writeString("CSSTransformRotate", 0)
Settings.CSSTransformFullscreen = false
Settings.CSSTransformScale  = SA_zoom   = 1
Settings.CSSTransformRotate = SA_rotate = 0

if (self.EQP_size_scale)
  EQP_size_scale = 1

resize()

event.stopPropagation()
    }, true)

    LbuttonMinimize.addEventListener("click", function (event) {
if (is_SA_child_animation) {
  if (is_SA_child_animation_host)
    parent.document.getElementById("LbuttonMinimize").click()
  else
    DEBUG_show("(not applicable for child animation)", 2)
  return
}

if (webkit_mode) {
  try {
    webkit_window.minimize()
  }
  catch (err) {}
}
else {
  if (window.minimize)
    window.minimize()
}

event.stopPropagation()
    }, true)

    LbuttonLR.addEventListener("dblclick", function (event) {
if (LbuttonResize._timerID) {
  clearTimeout(LbuttonResize._timerID)
  LbuttonResize._timerID = null
}

if (LbuttonResize.style.visibility == "hidden") {
  LbuttonResize.style.visibility = "inherit"
  LbuttonRotate.style.visibility = "hidden"
}
else {
  LbuttonResize.style.visibility = "hidden"
  LbuttonRotate.style.visibility = "inherit"
}

event.stopPropagation()
    }, true)

// resize
    LbuttonResize._timerID = null
    LbuttonResize.addEventListener("mousedown", function (event) {
if (this._timerID)
  clearTimeout(this._timerID)
this._timerID = setTimeout("LbuttonResize._resize_start()", 500)
System._browser.onmouseup_custom = this._resize_cancel

this._x = event.clientX
this._y = event.clientY

event.stopPropagation()
    }, true)

    LbuttonResize._resize_cancel = function () {
if (LbuttonResize._timerID) {
  clearTimeout(LbuttonResize._timerID)
  LbuttonResize._timerID = null
}
System._browser.onmouseup_custom = null
    }

    LbuttonResize._resize_start = function () {
this._timerID = null

var sb = System._browser
sb._drag_disabled = true
sb.onmousemove_custom = this._resize
sb.onmouseup_custom = this._resize_finish
sb.showFocus(true)

LbuttonResize._scale = 1;

DEBUG_show("(resizing)", 2)
    }

    LbuttonResize._resize = function (event) {
var x = event.clientX - LbuttonResize._x
var y = event.clientY - LbuttonResize._y

var scale_x = (B_content_width + x)  / B_content_width
var scale_y = (B_content_height + y) / B_content_height
var scale = LbuttonResize._scale = Math.max(scale_x, scale_y)

var s = document.body.style
s.pixelWidth  = parseInt(B_content_width  * scale)
s.pixelHeight = parseInt(B_content_height * scale)

System._browser.showFocus(true)
    }

    LbuttonResize._resize_finish = function () {
var sb = System._browser
sb.onmousemove_custom = sb.onmouseup_custom = null
sb._drag_disabled = false
sb.showFocus(false)

var use_EQP_size_scale = (self.EQP_size_scale && !self.EQP_video_options)
var zoom = (use_EQP_size_scale) ? EQP_size_scale : ((self.MMD_SA_options && !Settings.CSSTransformFullscreen) ? Math.max(B_content_width/MMD_SA_options.width, B_content_height/MMD_SA_options.height) : SA_zoom);

var scale = LbuttonResize._scale = Math.round(LbuttonResize._scale*zoom*1000)/1000
if (is_SA_child_animation_host && is_SA_child_animation) {
  parent.System.Gadget.Settings.writeString("CSSTransformScale", scale)
  parent.Settings.CSSTransformScale = parent.SA_zoom = scale
  parent.resize()
  resize(true)
  return
}
//DEBUG_show(zoom+'=>'+scale)
System.Gadget.Settings.writeString("CSSTransformScale", scale)
Settings.CSSTransformScale = SA_zoom = scale

if (use_EQP_size_scale) {
  EQP_size_scale = scale
  SA_zoom = 1
  resize(true, function(){EQP_resize(EQP_size_scale)})
}
else
  resize(true)
    }

// rotate
    LbuttonRotate._timerID = null
    LbuttonRotate.addEventListener("mousedown", function (event) {
if (this._timerID)
  clearTimeout(this._timerID)
this._timerID = setTimeout("LbuttonRotate._rotate_start()", 500)
System._browser.onmouseup_custom = this._rotate_cancel

var x = event.clientX - (B_content_width / 2)
var y = (B_content_height / 2) - event.clientY
LbuttonRotate._angle_base = Math.atan2(y,x)

event.stopPropagation()
    }, true)

    LbuttonRotate._rotate_cancel = function () {
if (LbuttonRotate._timerID) {
  clearTimeout(LbuttonRotate._timerID)
  LbuttonRotate._timerID = null
}
System._browser.onmouseup_custom = null
    }

    LbuttonRotate._rotate_start = function () {
this._timerID = null

var sb = System._browser
sb._drag_disabled = true
sb.onmousemove_custom = this._rotate
sb.onmouseup_custom = this._rotate_finish
sb.showFocus(true)

DEBUG_show("(rotating)", 2)
    }

    LbuttonRotate._rotate = function (event) {
var x = event.clientX - (B_content_width / 2)
var y = (B_content_height / 2) - event.clientY
var angle = Math.atan2(y,x)

LbuttonRotate._angle = LbuttonRotate._angle_base - angle
    }

    LbuttonRotate._rotate_finish = function () {
var sb = System._browser
sb.onmousemove_custom = sb.onmouseup_custom = null
sb._drag_disabled = false
sb.showFocus(false)

var angle = Math.round((LbuttonRotate._angle * 180 / Math.PI)*1000)/1000 + SA_rotate
System.Gadget.Settings.writeString("CSSTransformRotate", angle)
Settings.CSSTransformRotate = SA_rotate = angle

resize()
    }

    if (is_SA_child_animation) {
      document.addEventListener("dblclick", function (e) {
if (!parent.Lbody3D_navigation._3d_navigation_mode)
  return

var dblclickEvt = parent.document.createEvent("MouseEvents");
dblclickEvt.initEvent("dblclick");
parent.Lbody3D_control.dispatchEvent(dblclickEvt);

e.stopPropagation()
      }, true)
    }

    document.onkeydown = SA_OnKeyDown
    System.Gadget.Settings._writeSettings_CORE = Settings_writeJS
}
