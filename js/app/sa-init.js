// sa-init.js — Main init() function (Step 5C extraction from _SA.js)

function init() {
/*
try{
var perfmon = SA_require('perfmon');
//perfmon.list('Network Interface', function(err, data) {	DEBUG_show(JSON.stringify(data),0,1); });
perfmon('\\LogicalDisk(*)\\% Disk Time', function(err, data) {	if (err) {DEBUG_show("ERROR:"+JSON.stringify(err),0,1)} else {DEBUG_show(JSON.stringify(data))}; });
//setTimeout(function () { perfmon('\\LogicalDisk(D:)\\% Disk Time', function(err, data) {	if (err) {DEBUG_show("ERROR:"+JSON.stringify(err),0,1)} else {DEBUG_show(JSON.stringify(data))}; }); }, 500)
} catch (err) { DEBUG_show("ERROR:"+err,0,1) }
*/
  loaded = true

  if (use_SVG_Clock)
    SVG_Clock.draw()

  // [LEGACY REMOVED 1B] xul_mode/XUL_onload branch removed
  if (webkit_mode)
    WebKit_onload()

try {
  System.Gadget.onDock = CheckDockState;
  System.Gadget.onUndock = CheckDockState;
}
catch (err) {
  DEBUG_show(err.description)
}

  System.Gadget.settingsUI = "settings.html"
  System.Gadget.onSettingsClosed = SettingsClosed;

// main
  if (!is_SA_child_animation) {
    if (use_RAF) {
      DEBUG_show('Use "requestAnimationFrame"', 2)
      setTimeout('RAF_timerID = requestAnimationFrame(Animate_RAF)', 200)
    }
    else {
      Seq.item("Animate").At(0.2, "Animate", -1, 0.1/EV_sync_update.count_to_10fps)
      Seq.item("Animate").Play()
    }
  }

  if (SEQ_mode) {
    Seq.item("SEQ").At(0, "SEQ_Animate", -1, 0.1)
    Seq.item("SEQ").use_SA_RAF = webkit_mode
    Seq.item("SEQ").Play()
  }

  if (MacFace_mode)
    VistaFace.main()

  if (!BG_dim_calculate) {
    BG_dim_calculate = function () {
      if (!self.EV_width)
        EV_width_no_init = true
      if (!self.EV_height)
        EV_height_no_init = true

      if (EV_width_no_init)
        EV_width  = ((w_max > 130) ? 130 : w_max)
      if (EV_height_no_init)
        EV_height = ((h_max > 130) ? 130 : h_max)
    }
  }

  DragDrop.init(document.body, DragDrop_install, function (item) { return (item.isFolder || (item.isFileSystem && DragDrop_RE.test(item.path))) })

  SystemEXT._default.config_folder = Settings.f_path_folder
  SystemEXT._default.config_folder_full = Settings.f_path


  if (use_SA_system_emulation) {
    SA_init_browser_ui()
  }

  // [9D] ie9_mode always true — unwrapped
  {
    for (var i = 0; i < SA_child_animation_max; i++) {
      var d = document.getElementById("Ichild_animation" + i)
      if (d) {
        d.onmouseout = function (e) {
// check if contentWindow.System is missing for any reason
if (!this.contentWindow.System)
  return

this.contentWindow.System._browser.onmouseout()
        }
      }
    }

    spectrum_analyser = document.getElementById("Ichild_animation99")
    if (spectrum_analyser) {
      DEBUG_show("**Spectrum Analyser loaded**", 2)
    }
  }

  if (use_SA_browser_mode) {
    self.onbeforeunload = function () {
window.dispatchEvent(new CustomEvent('SA_writeSettings'));

if (WallpaperEngine_CEF_mode)
  return

System.Gadget.Settings._writeSettings();
SA_OnBeforeUnload_Common();

if (!is_SA_child_animation) {
  if (SA_top_window.is_SA_hosted) {
    SA_top_window.opener.closeSA(SA_top_window.SA_child_animation_id);
  }

  if (webkit_electron_mode) {
    if (WebKit_object.monitor_winstate.process) {
      Seq.item("MonitorWinstateSTDIN").Stop()
      try {
        WebKit_object.monitor_winstate.process.stdin.write("KILL\n")
//        WebKit_object.monitor_winstate.process.kill()
        WebKit_object.monitor_winstate.process = null
      }
      catch (err) {}
    }
    if (WebKit_object.monitor_winamp.process) {
      Seq.item("MonitorWinampSTDIN").Stop()
      try {
        WebKit_object.monitor_winamp.process.stdin.write("KILL\n")
        WebKit_object.monitor_winamp.process = null
      }
      catch (err) {}
    }
  }
}
    }

    self.onerror = function (msg, filename, line) {
var err_msg = 'ERROR('+filename.replace(/^.+\//, "")+': L' + line + ' / ' + msg
console.error(err_msg)
//if (WallpaperEngine_CEF_mode) { DEBUG_show(err_msg,0,1) } else
DEBUG_show(err_msg)
return true
    }
  }
  else {
    document.onkeydown = SA_OnKeyDown_Gadget
//    document.onmousedown = SA_OnMouseDown

    self.onunload = function () { SA_OnBeforeUnload_Common() }
  }

  if (is_mobile) {
    if (!is_SA_child_animation) {
      Lquick_menu.style.visibility = "inherit"
      Lquick_menu._activated = true
    }
/*
    window.addEventListener('blur', function () {
Lquick_menu.style.visibility = LbuttonTL.style.visibility = LbuttonLR.style.visibility = "hidden";
    });
*/
  }

  loadMain()
}
