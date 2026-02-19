/*
  animate-core.js — Core animation logic (Step 5B extraction from _SA.js)
  Animate_core function (~505 lines, monolithic — deferred further split)
*/

function Animate_core() {
  var count_to_10fps = EV_sync_update.count_to_10fps
  var update, update_event, always_update_event
  if (EV_sync_update.enabled || EV_sync_update.allow_update_between_frames) {
    update = update_event = true
    // always update on the very first frame
    if (EV_sync_update.count == 0)
      always_update_event = true
  }
  else if (use_full_fps)
    update = true

  EV_sync_update.no_update_count++
  EV_sync_update.no_animation_count++
  if (--EV_sync_update.count <= 0) {
    EV_sync_update.count = count_to_10fps
    update = true

    PC_count_absolute++
    if (--PC_count <= 0) {
      PC_count = PC_count_max
      update_event = always_update_event = true
    }

    if (Settings.AllowExternalCommand) {
      if (!SA_external_command_JSON_path)
        SA_external_command_JSON_path = oShell.ExpandEnvironmentStrings("%TEMP%") + toLocalPath("\\_SA_external_command.json")

      if (FSO_OBJ.FileExists(SA_external_command_JSON_path)) {
        var f = SA_external_command_JSON_path.replace(/[\/\\][^\/\\]+$/, "")
        var p = SA_external_command_JSON_path.replace(/^.+[\/\\]/, "")

        var dir  = Shell_OBJ.NameSpace(f);
        var file = dir.ParseName(p);

        var mtime = file.ModifyDate;

        if ((SA_external_command_JSON_time_ref > -1) && (SA_external_command_JSON_time_ref < mtime)) {
          SA_external_command_JSON_time_ref = mtime
          try {
            var file = FSO_OBJ.OpenTextFile(SA_external_command_JSON_path, 1);
            var txt = file.ReadAll()
            file.Close()

            var json_command = JSON.parse(txt)
            if (json_command.command_list) {
              var delay = 0
              json_command.command_list.forEach(function (c) {
var func
switch (c.command_name) {
  case "DROP_FILE":
    func = function () { SA_DragDropEMU(c.path) }
    break
  default:
    DEBUG_show(c.command_name)
}

if (func)
  setTimeout(func, delay)
              });
            }
          }
          catch (err) {}
        }
        else {
          SA_external_command_JSON_time_ref = mtime
        }
      }
      else {
        SA_external_command_JSON_time_ref = 0
      }
    }
  }

  if (use_full_fps) {
    var ms_per_animation_frame = 1000 / (EV_sync_update.count_to_10fps_ * 5)
    if (RAF_animation_frame_unlimited || RAF_animation_frame_always_update) {
      EV_sync_update.last_frame_updated = false
      RAF_animation_frame_always_update = false
    }

    if (!EV_sync_update.last_frame_updated) {
      if (!RAF_animation_frame_timestamp_last)
        RAF_animation_frame_timestamp_last = RAF_timestamp
      else {
        var time_diff = (RAF_timestamp - RAF_animation_frame_timestamp_last) - ms_per_animation_frame
        RAF_animation_frame_time_delayed += time_diff
        if (RAF_animation_frame_time_delayed < -ms_per_animation_frame) {
          RAF_animation_frame_time_delayed = -ms_per_animation_frame
        }
        else if (RAF_animation_frame_time_delayed > ms_per_animation_frame) { // force next frame update
          RAF_animation_frame_time_delayed = ms_per_animation_frame//*0.5 //-= time_diff
//console.log(RAF_animation_frame_time_delayed)
          RAF_animation_frame_always_update = true
        }
        RAF_animation_frame_timestamp_last = RAF_timestamp
      }
    }
//RAF_animation_frame_always_update=true
  }

  // make sure there is no consecutive update, to prevent the screen from updating too fast
  if (!always_update_event && (EV_sync_update.last_frame_updated || !update)) {
    EV_sync_update.last_frame_updated = false

    if (EV_sync_update.func_extra)
      EV_sync_update.func_extra()
    return
  }

//DEBUG_show(PC_count_absolute)

  if (use_full_fps && update_event)
    always_update_event = true

  var update_bar
  if (update_event) {
    // for EV_sync_update.enabled (eg. sound monitor), make sure the animation and bar is updated at a rate of at least 10fps
    if (EV_sync_update.no_update_count >= count_to_10fps)
      always_update_event = true

    // basically for non-full-fps animations only
    if ((updateEvent(always_update_event) === false) || (EV_sync_update.allow_update_between_frames && !always_update_event && (EV_sync_update.no_update_count == count_to_10fps/2))) {
      if (EV_sync_update.func_extra)
        EV_sync_update.func_extra()
      if (EV_sync_update.no_update_count == count_to_10fps/2) {
//EV_sync_update.fps_count_func()
        if (EV_sync_update.func_extra_sub) {
          EV_sync_update.func_extra_sub()
          EV_sync_update.last_frame_updated = true
        }
      }
      return
    }

//EV_sync_update.fps_count_func()

    if (EV_sync_update.func_extra)
      EV_sync_update.func_extra()

    EV_sync_update.last_frame_updated = true
  }

  // 3D navigation START
  var r3d = Lbody3D_navigation._rotate3d
  if (Lbody3D_navigation._transformed) {
    Lbody3D_navigation._transformed = false

    var t3d = Lbody3D_navigation._translate3d

    var z = Lbody3D_navigation._z_origin + t3d[2]
    var toggle
    if (z > -Lbody3D_navigation._z_view) {
      if (!Lbody3D_navigation._backfaceHidden) {
        Lbody3D_navigation._backfaceHidden = true
        toggle = true
      }
    }
    else {
      if (Lbody3D_navigation._backfaceHidden) {
        Lbody3D_navigation._backfaceHidden = false
        toggle = true
      }
    }

    if (toggle && !is_SA_child_animation) {
      var vis = (Lbody3D_navigation._backfaceHidden) ? "hidden" : "visible"
      DEBUG_show("(backface visibility:" + vis + ")", 2)
      for (var i = 0; i < SA_child_animation_max; i++) {
        if (SA_child_animation[i])
          document.getElementById("Ichild_animation" + i).style.msBackfaceVisibility = vis
      }
    }

    Lbody3D_navigation.style.msTransformOrigin = "50% 50% " + z + "px"
    Lbody3D_navigation.style.msTransform = "rotateX(" + r3d[0] + "deg) rotateY(" + r3d[1] + "deg) rotateZ(" + r3d[2] + "deg) " + "translate3d(" + t3d[0] + "px," + t3d[1] + "px," + t3d[2] + "px)"
  }
  // END

  // HeadTracker AR START
  if (self.HeadTrackerAR && HeadTrackerAR.running) {
    HeadTrackerAR.getCameraXY()
    Lbody3D.style.msPerspectiveOrigin = HeadTrackerAR._cx + "% " + HeadTrackerAR._cy + "%"

    // draw camera
    if (HeadTrackerAR.laughing_man.complete) {
      var e = HeadTrackerAR.face_event
      var c = HeadTrackerAR.canvas_camera

      var context = c.getContext("2d")
      context.globalCompositeOperation = 'copy'
      context.save()
      context.translate(160,0)
      context.scale(-1,1)
      context.drawImage(HeadTrackerAR.video_input, 0,0,160,120)
      context.restore()

      context.globalCompositeOperation = 'source-over'
      if (e.width && e.height) {
        var h = Math.max(e.width, e.height)
        var w = h * 134/120
        var x = e.x - w/2
        var y = e.y - h/2
        context.drawImage(HeadTrackerAR.laughing_man, 0,0,134,120, x,y,w,h)

        context.translate(e.x, e.y)
        context.rotate(e.angle-(Math.PI/2));
        context.strokeStyle = "#00CC00";
        context.strokeRect((-(e.width/2)) >> 0, (-(e.height/2)) >> 0, e.width, e.height);
        context.rotate((Math.PI/2)-e.angle);
        context.translate(-e.x, -e.y);
      }
      else
        context.drawImage(HeadTrackerAR.laughing_man, (160-134)/2,0)
    }
  }
  // END

  var animation_update = (!EV_sync_update.fps_control || EV_sync_update.fps_control()) && ((use_full_fps && use_full_fps_registered) || (EV_sync_update.no_animation_count >= count_to_10fps-1))
  if (animation_update) {
    EV_sync_update.last_frame_updated = true
    EV_sync_update.count_frame++

    EV_sync_update.RAF_func.forEach(function (func) { func(); });
    EV_sync_update.RAF_func = [];

// Electron cursor/window data START
let _b, _top_b, _cursor, _window, _window_top, opacity_on_hover, IgnoreMouseEventsPartial, capture_pixel, use_screen_data
if (webkit_electron_mode) {
  _b = System._browser
  _top_b = SA_topmost_window.System._browser
  if (!SA_topmost_window.returnBoolean("AutoItStayOnDesktop")) {
    opacity_on_hover = System.Gadget.Settings.readString("OpacityOnHover")
    IgnoreMouseEventsPartial = SA_topmost_window.returnBoolean("IgnoreMouseEventsPartial")
  }
  capture_pixel = opacity_on_hover || IgnoreMouseEventsPartial;
  use_screen_data = System._browser.use_screen_data;
  _cursor = _b._electron_cursor_pos = _top_b._electron_cursor_pos = (use_screen_data) ? ((is_SA_child_animation && _top_b._electron_cursor_pos) || SA_top_window.getCursorPos()) : null;
  _window = _b._electron_window_pos = _top_b._electron_window_pos = (use_screen_data) ? ((is_SA_child_animation && _top_b._electron_window_pos) || SA_top_window.getPos()) : null;
}

if (use_screen_data) {
  _window_top = _window.slice(0)
  if (is_SA_child_animation) {
    let ani = parent.SA_child_animation[SA_child_animation_id]
    _window[0] += ani.x
    _window[1] += ani.y
  }

  let _x = _cursor.x - _window[0]
  let _y = _cursor.y - _window[1]
  let mk = _top_b._wallpaper_mousekey
  let mouse_over_old = !!_b._electron_mouse_over
  let mouse_over_new = ((_x >= 0) && (_x < B_content_width) && (_y >= 0) && (_y < B_content_height))
  if (mouse_over_new) {
    if (_top_b.capturePage_pixel && (_top_b.capturePage_pixel[3] == 0))
      mouse_over_new = false
/*
capturePage may crash the gadegt if:
- coordinates are beyond the window size (NOTE: document content size can be larger than the window, so window size must be checked)
- the window is in the process of being resized
NOTE: For performance reason, capturePage is used only when "opacity on hover" is enabled.
*/
    if (capture_pixel && (!self.MMD_SA || MMD_SA.MMD_started) && !_top_b.capturePage_in_process && !_top_b.resize_timerID) {
      if (!_top_b.resize_cooling_timestamp || (performance.now() > _top_b.resize_cooling_timestamp + 500)) {
        _top_b.capturePage_in_process = true
        _top_b.resize_cooling_timestamp = 0
        webkit_electron_remote.getGlobal("capturePage")(_cursor.x - _window_top[0], _cursor.y - _window_top[1])
      }
    }

    if (!capture_pixel && (self.MMD_SA && MMD_SA.MMD_started) && !WallpaperEngine_mode && SA_topmost_window.returnBoolean("AutoItStayOnDesktop")) {
      let evt
      if (!_b._wallpaper_mousedown || (mk && (_b._wallpaper_mousedown != mk))) {
if (mk==1 || mk==2 || mk==4) _b._wallpaper_outside_clicked = false
// mouseclick
        if (mk == 1) {
_b._wallpaper_mousedown = 1
//MMD_SA._trackball_camera.rotateSpeed = 0.01
evt = new MouseEvent("mousedown", {
  bubbles: true,
  cancelable: true,
  view: self,
  button: 0,
//  pageX:B_content_width/2, pageY:B_content_height/2, clientX:B_content_width/2, clientY:B_content_height/2
  pageX:_x, pageY:_y, clientX:_x, clientY:_y
});
Lbody_host.dispatchEvent(evt)
        }
        else if (mk == 4) {
_b._wallpaper_mousedown = 4
_b._wallpaper_mouse_deltaY_ref = _y
        }
      }
// mouseout
      else if (mk == 0) {
_b._wallpaper_mousedown = 0
evt = new MouseEvent("mouseup", {
  bubbles: true,
  cancelable: true,
  view: self,
});
document.body.dispatchEvent(evt)
      }
// mousemove
      else if ((_b._wallpaper_mouseX != _x) || (_b._wallpaper_mouseY != _y)) {
        _b._wallpaper_mouseX = _x
        _b._wallpaper_mouseY = _y
        if (mk == 1) {
evt = new MouseEvent("mousemove", {
  bubbles: true,
  cancelable: true,
  view: self,
  pageX:_x, pageY:_y, clientX:_x, clientY:_y
});
document.body.dispatchEvent(evt)
        }
        else if (mk == 4) {
evt = new WheelEvent("wheel", {
  bubbles: true,
  cancelable: true,
  view: self,
  deltaY:(_y - _b._wallpaper_mouse_deltaY_ref)
});
Lbody_host.dispatchEvent(evt)
_b._wallpaper_mouse_deltaY_ref = _y
        }
      }
    }

  }
  else {
// click outside animation (eg. taskbar)
// for some WTF unknown reasons, checking/assigning the status of ._wallpaper_mousedown to prevent repeated clicks doesn't work here
// _b._wallpaper_mousedown = 9999
    if (mk) {
      if (!_b._wallpaper_outside_clicked)
        _b._wallpaper_outside_clicked = 1
      else if (++_b._wallpaper_outside_clicked > 30) {
_b._wallpaper_outside_clicked = 1
MMD_SA.reset_camera(true)
DEBUG_show("(camera reset)", 2)
      }
    }
  }
  _b._electron_mouse_over = mouse_over_new

  if (IgnoreMouseEventsPartial && mouse_over_new && (_top_b.mouseout_timerID || _top_b._onmouseout_waiting_custom0_timerID)) {
var evt = new MouseEvent("mouseover", {
  bubbles: true,
  cancelable: true,
  view: top
});
SA_topmost_window.document.body.dispatchEvent(evt)
  }

  if (mouse_over_old != mouse_over_new) {
    if (IgnoreMouseEventsPartial) {
      webkit_window.setIgnoreMouseEvents(!mouse_over_new)
    }
    var _body = (is_SA_child_animation) ? parent.document.getElementById("Ichild_animation" + SA_child_animation_id) : _b.body
    var opacity_new = _b.Opacity * ((mouse_over_new) ? parseFloat(opacity_on_hover || 1) : 1)
    var opacity_old = parseFloat(_body.style.opacity || 1)
    if (opacity_new != opacity_old) {
      _body.style.opacity = opacity_new
//      DEBUG_show(""+mouse_over_new, 2)
    }
  }
}
// END

    if (!is_SA_child_animation && self.AudioFFT_active) {
      AudioFFT_active.process()
    }

    if (self.EV_animate_full) {
      System._browser.on_animation_update.run(0)
      EV_animate_full(RAF_timestamp)
      System._browser.on_animation_update.run(1)
    }

    if (Settings.CSSTransform3DBoxAnimate)
      Box3D.animate()

    if (use_SVG_Clock)
      SVG_Clock.update()

EV_sync_update.fps_count_func()
if (EV_sync_update.fps_last && ((is_SA_child_animation_host) ? is_SA_child_animation : !is_SA_child_animation)) { if (SA_topmost_window.EV_sync_update.fps_log) {console.log('FPS:' + EV_sync_update.fps_last); EV_sync_update.fps_last=0;} }
  }

  // 3D billboard START
  if (!is_SA_child_animation && Settings.CSSTransform3D) {
    var r = [Lbody._rotate3d, r3d]
    for (var i = 0; i < SA_child_animation_max; i++) {
      if (!SA_child_animation[i])
        continue

      var d = document.getElementById("Ichild_animation" + i)
      var w = d.contentWindow
      if (!w.loaded || !w.Settings.CSSTransform3DBillboard)
        continue

      var r_billboard = d._rotate3d_billboard
      var r_changed = false
      for (var lvl = 0; lvl < 2; lvl++) {
        for (var k = 0; k < 3; k++) {
          if (r[lvl][k] != r_billboard[lvl][k]) {
            r_changed = true
            break
          }
        }
      }
      if (!r_changed)
        continue

      for (var lvl = 0; lvl < 2; lvl++) {
        for (var k = 0; k < 3; k++) {
          r_billboard[lvl][k] = r[lvl][k]
        }
      }

      if (!d._translate3d) {
        d._translate3d = (d._transform_base && /translateZ\(([^\(]+)\)/.test(d._transform_base)) ? [0,0,parseFloat(RegExp.$1.trim())] : [0,0,0]
      }
      d.style.msTransformOrigin = "50% 50% " + d._translate3d[2] + "px"

      var t = []
      var axis = ["X", "Y", "Z"]
      for (var lvl = 0; lvl < 2; lvl++) {
        for (var k = 2; k >= 0; k--) {
          if (r[lvl][k])
            t.push('rotate' + axis[k] + '(' + (-r[lvl][k]) + 'deg)')
        }
      }
      d.style.msTransform = t.join(" ") + ((d._transform_base) ? d._transform_base : "")
    }
  }
  // END

  if (animation_update || use_full_fps) {
    if (Canvas_Effect && Canvas_Effect._use_default_canvas)
      Canvas_Effect.draw(Canvas_Effect.drawn)
//EV_sync_update.fps_count_func()
  }
  if (animation_update)
    EV_sync_update.no_animation_count = 0

  if (EV_sync_update.last_frame_updated) {
    EV_sync_update.no_update_count = 0
    update_bar = (animation_update || use_full_fps)
  }

  var needs_resize = false
  for (var i = 0, i_max = EV_usage_list.length; i < i_max; i++) {
    var ev_obj = (i_max == 1) ? self : EV_usage_list[i]

    var u = ev_obj.EV_usage
    var u_last = (ev_obj.EV_usage_last < 0) ? 0 : ev_obj.EV_usage_last
    if (Settings.ReverseAnimation) {
      u = 100 - u
      u_last = 100 - u_last
    }

    if (update_bar || (u != u_last)) {
      var id_prefix = "LCPU_main" + i
      var d = document.getElementById(id_prefix)
      if (!d) {
if (!Settings.Display)
  continue

d = document.createElement("div")
d.id = id_prefix
d.className = "CPU_bar"
d.style.zIndex = 3

var d_content = document.createElement("div")
d_content.id = id_prefix + "_content"
d_content.className = "CPU_bar_content"

var d_up = document.createElement("div")
d_up.id = id_prefix + "_up"
d_up.className = "CPU_bar_up"

var d_down = document.createElement("div")
d_down.id = id_prefix + "_down"
d_down.className = "CPU_bar_down"

d_content.appendChild(d_up)
d_content.appendChild(d_down)
d.appendChild(d_content)
document.getElementById("LCPU_main0").parentElement.appendChild(d)

needs_resize = true
      }

      var mod = barPhysics(u - u_last) + u_last
      var zoom = (ie9_mode) ? 1 : SA_zoom

      document.getElementById(id_prefix + "_content").style.pixelWidth = parseInt(mod * (B_width*zoom-2) / 100)
    }
  }

  if (needs_resize)
    resize()
}
