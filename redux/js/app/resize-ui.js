/*
  js/app/resize-ui.js
  UI layout (CPU bars, fullscreen buttons, mobile scaling, centering, child animation)
  extracted from resize.js
*/

/**
 * Layout CPU usage bars.
 */
function resize_layoutCPUBars(bw, bh, bar_height) {
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

      document.getElementById(id_prefix + "_up").style.pixelHeight = document.getElementById(id_prefix + "_down").style.pixelHeight = document.getElementById(id_prefix + "_down").style.posTop = 4
      document.getElementById(id_prefix + "_content").style.pixelHeight = 8

      if (w3c_mode && !bar_accelerate)
        document.getElementById(id_prefix + "_content").style.transition = "width " + (PC_count/10) + "s ease-out"

      cs.posTop = bh + bar_height*i
      cs.pixelWidth = bw - 2
      cs.visibility = "inherit"
    }
    else
      cs.visibility = "hidden"
  }
}

/**
 * Layout system emulation UI elements (buttons, numpad, dialog scaling).
 */
function resize_layoutSystemUI(_SA_zoom, screen_w, screen_h, fullscreen) {
  if (!use_SA_system_emulation) return

  let qmb_count = 6

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

  if (is_mobile) {
    Idialog.style.transform = "scale(" + (System._browser.css_scale*2) + ")"
  }
  if (is_mobile && self.MMD_SA_options) {
    Lnumpad.style.posLeft = B_content_width - 200
    Lnumpad.style.posTop  = 64
    Lnumpad.style.visibility = "inherit"
    Lnumpad.style.transform = "scale(" + (1 + (System._browser.css_scale-1)*0.5) + ")"
  }
}

/**
 * Center content for browser native mode and handle child animation visibility.
 */
function resize_layoutBrowserAndChild(screen_w, screen_h) {
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
}
