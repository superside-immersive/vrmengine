/*
  js/app/events.js
  Keyboard and mouse event handlers extracted from _SA.js (Step 5A)
*/

function SA_OnKeyDown_Gadget() {
  var k = event.keyCode
/*
  if (k == 67) {
// c
    if (!SA_confirm_HTA_creation_waiting)
      SA_CreateHTA()
  }
  else if (k == 72) {
// h
    if (SA_confirm_HTA_creation_waiting)
      SA_CreateHTA()
  }
*/
  if ((k == 71) && self.use_EQP_core) {
// g
    SA_animation_append_mode = false
    EQP_gallery_append_mode = !EQP_gallery_append_mode
    DEBUG_show('Gallery Append Mode:' + ((EQP_gallery_append_mode) ? 'ON' : 'OFF'), 2)
  }
}

var EQP_gallery_append_mode = false

function SA_OnDocument() {
  if (0&&webkit_electron_mode) {
// https://github.com/electron/electron/blob/master/docs/api/dialog.md
    try {
      webkit_window.setAlwaysOnTop(false)
    }
    catch (err) {}

    webkit_electron_dialog.showOpenDialog(null, {title:"Choose an input file."}
,function (v) {
  try {
    webkit_window.setAlwaysOnTop(returnBoolean("AutoItAlwaysOnTop"))
  }
  catch (err) {}

  if (v)
    SA_DragDropEMU(v[0])
}
    );

    return
  }

  var url = "SystemAnimator_browse.html?title=" + encodeURIComponent("Choose an input file.")// + "&seed=" + Date.now()
  if (use_inline_dialog) {
    if (document.getElementById("Idialog").style.visibility == "hidden") {
      document.getElementById("Idialog").contentWindow.location.replace(url)
    }
    return
  }

  var v = showModalDialog(url)
  v = (w3c_mode) ? self.returnValue : v

  if (v)
    SA_DragDropEMU(v)
}

function SA_OnFolder(info) {
  if (!info)
    info = "Choose an input folder."

  if (webkit_electron_mode) {
// https://github.com/electron/electron/blob/master/docs/api/dialog.md
    try {
      webkit_window.setAlwaysOnTop(false)
    }
    catch (err) {}

    webkit_electron_dialog.showOpenDialog(null, {title:info, properties:["openDirectory"]}
,function (v) {
  try {
    webkit_window.setAlwaysOnTop(returnBoolean("AutoItAlwaysOnTop"))
  }
  catch (err) {}

  if (v)
    SA_DragDropEMU(v[0])
}
    );

    return true
  }

  try {
    var f = Shell_OBJ.BrowseForFolder(0, info, 0)
    if (!f)
      return false
    if (use_inline_dialog)
      return true

    SA_DragDropEMU(f.Self.Path)
  }
  catch (err) { alert(err.message); return false; }

  return true
}

function SA_OnGallery() {
  SA_animation_append_mode = false
  EQP_gallery_append_mode = true
  if (SA_OnFolder("Choose a picture folder."))
    return

  EQP_gallery_append_mode = false
  EQP_SS_path = ""
  System.Gadget.Settings.writeString("LABEL_EQP_SS_path", "")
  DEBUG_show("(reload animation to reset gallery)", 2)
}

function SA_ClearInterface(event) {
  var w = (is_SA_child_animation) ? parent : self
  var w_list = [w]
  for (var i = 0; i < SA_child_animation_max; i++) {
    if (w.SA_child_animation[i])
      w_list.push(w.document.getElementById("Ichild_animation" + i).contentWindow)
  }

  try {
    w_list.forEach(function (wo) {
      wo.System._browser.onmouseout_waiting(event)
      if (wo.SL_MC_MouseLeave) {
        wo.SL_MC_MouseLeave(10)
      }
    })
  } catch (err) { console.error(err.message) }
}

// cannot use const as it won't appear under self
var SA_OnKeyDown = (()=>{

  let shift_location, ctrl_location, alt_location;

return function (event, enforced) {
// event object used here may not be native, and thus it may not have native properties/functions.
  event.preventDefault && event.preventDefault();

  var k = event.keyCode
  if (k > 249) return

  switch (event.key) {
    case 'Control':
      ctrl_location = event.location;
      break;
    case 'Shift':
      shift_location = event.location;
      break;
    case 'Alt':
      alt_location = event.location;
      break;
  }

  const is_altKey = event.altKey;
  const is_safe_key = is_altKey || !self.MMD_SA || !MMD_SA_options.Dungeon_options || !event.preventDefault;

  var p_win = (is_SA_child_animation) ? parent : self
  if (!enforced && webkit_electron_mode && p_win.returnBoolean("AutoItStayOnDesktop") && !p_win.webkit_IgnoreMouseEvents_disabled) {
    return
  }

  System._browser.showFocus(true)

  if (webkit_electron_mode && (p_win.returnBoolean("IgnoreMouseEvents") || p_win.returnBoolean("AutoItStayOnDesktop")) && !p_win.webkit_IgnoreMouseEvents_disabled) {
    var w = IPC.active_window
    if (w != self) {
      w.SA_OnKeyDown(event, true)
      System._browser.showFocus(false)
      return
    }
  }

  var result = { return_value:null }
  window.dispatchEvent(new CustomEvent("SA_keydown", { detail:{ e:event, keyCode:k, shift_location:shift_location, ctrl_location:ctrl_location, alt_location:alt_location, result:result } }));

  var _browser_onkeydown
  if (result.return_value) {
    if (result.return_value == "nondefault")
      return
  }
  else if (browser_native_mode && !webkit_window) { _browser_onkeydown=true }
  else if (k == 73) {}
  else if (k == 65 && is_safe_key) {
// a
    if (is_SA_child_animation) {
      parent.SA_AnimationAppend_Switch(event)
      parent.focus()
    }
    else
      SA_AnimationAppend_Switch(event)
  }
  else if (k == 68 && is_safe_key) {
// d
    SA_OnDocument()
  }
  else if (k == 70 && is_safe_key) {
// f
    SA_OnFolder()
  }
  else if ((k == 71) && self.use_EQP_core && is_safe_key) {
// g
    SA_animation_append_mode = false
    EQP_gallery_append_mode = !EQP_gallery_append_mode
    DEBUG_show('Gallery Append Mode:' + ((EQP_gallery_append_mode) ? 'ON' : 'OFF'), 2)
  }
  else if (k == 72 && is_safe_key) {
// h
    if (is_SA_child_animation) {
      parent.SA_OnKeyDown(event)
      parent.focus()
    }
    else if (self.HeadTrackerAR) {
      if (HeadTrackerAR.running)
        HeadTrackerAR.stop()
      else
        HeadTrackerAR.start()
    }
  }
  else if (k == 77 && is_safe_key) {
// m
    // [LEGACY REMOVED 9C] WMP_mask toggle removed (WMP support deleted)
  }
  else if (k == 84 && is_safe_key) {
// t
    if (Lbody3D_navigation._transformOrigin) {
      var t = Lbody3D_navigation._3d_navigation_mode = !Lbody3D_navigation._3d_navigation_mode
      Lbody3D_control.style.visibility = (t) ? "inherit" : "hidden"
      DEBUG_show("3D Navigation Mode:" + ((t) ? "ON" : "OFF"), 2)
    }
    else if (is_SA_child_animation && parent.Lbody3D_navigation._transformOrigin) {
      parent.SA_OnKeyDown(event)
      parent.focus()
    }

    var p = (is_SA_child_animation) ? parent : self
    p.System._browser._child_drag_disabled = p.document.getElementById("Lbody3D_navigation")._3d_navigation_mode
  }
  else if (k == 86 && is_safe_key) {
// v
    if (self.HeadTrackerAR && HeadTrackerAR.running)
      HeadTrackerAR.canvas_camera.style.display = (HeadTrackerAR.canvas_camera.style.display == "none") ? "block" : "none"
  }
  else if ((k >= 37) && (k <= 40) && is_safe_key) {
//left top right bottom
    if (Lbody3D_navigation._3d_navigation_mode) {
      if ((k == 38) || (k == 40)) {
        Lbody3D_navigation._translate3d[2] += (k == 38) ? 10 : -10
      }
      else {
        var r3d = Lbody3D_navigation._rotate3d
        r3d[2] = (r3d[2] + ((k == 37) ? -2 : 2)) % 360
      }
      Lbody3D_navigation._transformed = true
    }
    event.preventDefault()
  }
  else { _browser_onkeydown=true }

  if (_browser_onkeydown && !System._browser.onkeydown(event)) {
    if (!event.ctrlKey && !event.shiftKey && !is_altKey) {
      DEBUG_show();
      DEBUG_show(k,2);
    }
    System._browser.showFocus(false);
    return;
  }

  if (webkit_electron_mode && (p_win.returnBoolean("IgnoreMouseEvents") || p_win.returnBoolean("AutoItStayOnDesktop"))) {
    if ((k == 73) || !p_win.webkit_IgnoreMouseEvents_disabled) {
      p_win.webkit_IgnoreMouseEvents_disabled = !p_win.webkit_IgnoreMouseEvents_disabled
      try {
        if (p_win.returnBoolean("AutoItStayOnDesktop") && !WallpaperEngine_mode)
          WebKit_object.stay_on_desktop(!p_win.webkit_IgnoreMouseEvents_disabled)
        webkit_window.setIgnoreMouseEvents(!p_win.webkit_IgnoreMouseEvents_disabled)
        webkit_window.setFocusable(p_win.webkit_IgnoreMouseEvents_disabled)
      }
      catch (err) {}

      if (!p_win.webkit_IgnoreMouseEvents_disabled) {
        SA_ClearInterface(new CustomEvent("key_TEMP"))
      }
      else {
        if (is_SA_child_animation) {
          parent.System._browser.arrangeChildZ(SA_child_animation_id)
        }
      }

      p_win.DEBUG_show("Mouse event: " + ((p_win.webkit_IgnoreMouseEvents_disabled) ? "ON (press I to turn OFF)" : "OFF"), 10)
    }
  }

  System._browser.showFocus(false)
};

})();

var SA_animation_append_mode

function SA_AnimationAppend_Switch(event) {
  var k = event.keyCode
  if (k != 65)
    return
  if (is_SA_child_animation)
    return

  EQP_gallery_append_mode = false
  SA_animation_append_mode = !SA_animation_append_mode
  DEBUG_show("Animation Append Mode:" + ((SA_animation_append_mode) ? "ON" : "OFF"), 2)
}

var SA_confirm_HTA_creation_waiting
var SA_confirm_HTA_creation_timerID

function SA_OnMouseDown() {
  if ((event.clientX > 20) || (event.clientY < document.body.style.pixelHeight-20))
    return

  SA_CreateHTA()
}

function SA_CreateHTA() {
  if (Settings.f_path.indexOf(System.Gadget.path) != -1)
    return

  if (SA_confirm_HTA_creation_waiting) {
    SA_confirm_HTA_creation_waiting = false
    if (SA_confirm_HTA_creation_timerID) {
      clearTimeout(SA_confirm_HTA_creation_timerID)
      SA_confirm_HTA_creation_timerID = null
    }

    Settings_writeJS();

    DEBUG_show('(HTA created in the animation folder)', 5)
  }
  else {
    SA_confirm_HTA_creation_waiting = true
    SA_confirm_HTA_creation_timerID = setTimeout('SA_confirm_HTA_creation_timerID=null; SA_confirm_HTA_creation_waiting=false', 5*1000)
    DEBUG_show('(' + ((event && (event.type == "keydown")) ? "Press H" : "Click again") + ' to confirm creating a HTA for this animation.)', 5)
  }
}
