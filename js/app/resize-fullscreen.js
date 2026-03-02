/*
  js/app/resize-fullscreen.js
  Fullscreen zoom calculation and window position adjustment extracted from resize.js
*/

/**
 * Calculate fullscreen zoom and offset.
 * Returns true if resize() should return early (recursive resize was triggered).
 */
function resize_calcFullscreenZoom(screen_w, screen_h, bw, bh, fullscreen, no_fullscreen_resize, fullscreen_adjust_position) {
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
          resize(true, function(){EQP_resize(EQP_size_scale)}, null, fullscreen_adjust_position)
          return true
        }
        if ((self.MMD_SA && MMD_SA.use_jThree) || self.SV3D) {
          resize(null, null, true, fullscreen_adjust_position)
          return true
        }
      }
    }
  }
  else {
    if (!is_SA_fullscreen_offset_custom)
      SA_fullscreen_offsetX = SA_fullscreen_offsetY = 0
  }

  return false
}

/**
 * Adjust window position for fullscreen/StayOnDesktop modes.
 */
function resize_adjustWindowPosition(screen_w, screen_h, fullscreen, fullscreen_adjust_position) {
  if ((fullscreen && fullscreen_adjust_position) || (webkit_electron_mode && returnBoolean("AutoItStayOnDesktop"))) {
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
}
