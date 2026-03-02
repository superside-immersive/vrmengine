/*
  js/app/resize-3d-navigation.js
  3D navigation initialization extracted from resize.js
  Sets up mouse/wheel handlers for 3D CSS transform navigation.
  Only runs once (guarded by Lbody3D_navigation._transformOrigin check).
*/

function resize_init3DNavigation() {
  if (is_SA_child_animation || Lbody3D_navigation._transformOrigin) return

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

  Lbody3D_navigation._rotate3d = [0,0,0, 0]
  Lbody3D_navigation._translate3d = [0,0,0]
  Lbody3D_control.addEventListener("dblclick", function (event) {
    Lbody3D_navigation.style.msTransform = ""
    Lbody3D_navigation.style.msTransformOrigin = Lbody3D_navigation._transformOrigin
    Lbody3D_navigation._rotate3d = [0,0,0, 0]
    Lbody3D_navigation._translate3d = [0,0,0]

    if (!is_SA_child_animation) {
      for (let i = 0; i < SA_child_animation_max; i++) {
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

    const sb = System._browser
    sb._drag_disabled_ORIGINAL = !!sb._drag_disabled
    sb._drag_disabled = true
    sb.onmousemove_custom = this._3d_navigation
    sb.onmouseup_custom = this._3d_navigation_finish
    sb.showFocus(true)

    DEBUG_show("(3D navigation)", 2)
  }

  Lbody3D_control._3d_navigation = function (event) {
    const ex = event.clientX
    const ey = event.clientY

    const x = ex - Lbody3D_control._x
    const y = ey - Lbody3D_control._y

    Lbody3D_control._x = ex
    Lbody3D_control._y = ey

    const rotate_y = x / B_content_width
    const rotate_x = y / B_content_height

    const r3d = Lbody3D_navigation._rotate3d
    r3d[0] = (r3d[0] + (-rotate_x*360)) % 360
    r3d[1] = (r3d[1] +  (rotate_y*360)) % 360
    Lbody3D_navigation._transformed = true

    System._browser.showFocus(true)
  }

  Lbody3D_control._3d_navigation_finish = function () {
    const sb = System._browser
    sb.onmousemove_custom = sb.onmouseup_custom = null
    sb._drag_disabled = sb._drag_disabled_ORIGINAL
    sb.showFocus(false)
  }

  Lbody3D_control.addEventListener(((webkit_mode)?"mousewheel":"DOMMouseScroll"), function (event) {
    let rolled;
    if ('wheelDelta' in event) {
      rolled = event.wheelDelta;
    }
    else {  // Firefox
      rolled = -40 * event.detail;
    }
    Lbody3D_navigation._translate3d[2] += rolled/12 *2
    Lbody3D_navigation._transformed = true
  }, false)
}
