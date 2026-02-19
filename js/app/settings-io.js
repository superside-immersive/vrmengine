// settings-io.js — Settings write/save and settings dialog (Step 5C extraction from _SA.js)

function Settings_writeJS(f_path, excluded_settings) {
try {
  if (!f_path && ie9_mode && !is_SA_child_animation) {
    for (var i = 0; i < SA_child_animation_max; i++) {
      var ani = SA_child_animation[i]

      var v
      if (ani) {
        var f = ani.f
        var f_obj = ValidatePath(f)
        var is_folder = (!f_obj || f_obj.isFolder)
        var f_folder = (is_folder) ? f : f.replace(/[\/\\][^\/\\]+$/, "")

        if (f.indexOf(SA_HTA_folder) == 0)
          v = '$SA_HTA_folder$' + f.substr(SA_HTA_folder.length)
        else if (f.indexOf(SA_HTA_folder_parent) == 0)
          v = '$SA_HTA_folder_parent$' + f.substr(SA_HTA_folder_parent.length)
        else if (System.Gadget._path_folder() == f_folder.replace(/[\/\\][^\/\\]+$/, "")) {
          v = '$System.Gadget._path_folder()$\\' + ((is_folder) ? '' : f_folder.replace(/^.+[\/\\]/, toLocalPath("\\"))) + f.replace(/^.+[\/\\]/, "")
        }
        else
          v = f
        v += "|"+ani.x+"|"+ani.y+"|"+ani.z+"|"+ani.opacity
      }
      else
        v = ""

      System.Gadget.Settings.writeString("ChildAnimation"+i, v)
    }
  }

var animation_changed, path_obj, cf, f_path_full
if (f_path) {
  animation_changed = true

  path_obj = ValidatePath(f_path)
  cf = (path_obj.isFolder) ? f_path : f_path.replace(/[\/\\][^\/\\]+$/, "")
}
else {
  f_path = loadFolder_CORE()
  path_obj = ValidatePath(f_path)
}
var f_path_raw = f_path

f_path_full = "$SA_HTA_folder$" + ((path_obj.isFolder) ? "" : encodeURIComponent(f_path.replace(/^.+[\/\\]/, toLocalPath("\\"))))

var _settings = {}
var demo_found
demo_found = path_demo_by_url[f_path]
if (demo_found)
  _settings.Folder = demo_found
//if (!demo_found)
  f_path = f_path_full
//alert(SA_HTA_folder+','+path_obj.path)

  var q = '"'

  var saved_settings = []
  for (var i = 0; i < Setting_name_list.length; i++) {
    var s = Setting_name_list[i]
    var v = _settings[s] || System.Gadget.Settings.readString(s, true)
    if (!v || (v == Settings_default[s]))
      continue
    if (excluded_settings && excluded_settings[s])
      continue

if (animation_changed && /^ChildAnimation\d/.test(s))
  continue

v = (s == "Folder") ? ((/^demo/.test(v)) ? v : f_path) : encodeURIComponent(v);
    saved_settings.push(q + s + q + ':' + q + v + q)
  }
  for (var i = 0; i < Setting_name_list_boolean.length; i++) {
    var s = Setting_name_list_boolean[i]
    var v = returnBoolean(s)
    if (v == Settings_default[s])
      continue
    if (excluded_settings && excluded_settings[s])
      continue

    saved_settings.push(q + s + q + ':"non_default"')
  }
  saved_settings.push('"_screenLeft":"' + ((use_SA_browser_mode && !is_SA_child_animation) ? ((webkit_saved_screenLeft) ? webkit_saved_screenLeft : SA_top_window.screenLeftAbsolute) : 100) + '"')
  saved_settings.push('"_screenTop":"'  + ((use_SA_browser_mode && !is_SA_child_animation) ? ((webkit_saved_screenTop)  ? webkit_saved_screenTop  : SA_top_window.screenTopAbsolute)  : 100) + '"')

  if (use_SA_browser_mode) {
    var settings = System.Gadget.Settings._settings
    for (var s in settings) {
      if (!/^(LABEL|SA)_/.test(s))
        continue

      var v = System.Gadget.Settings.readString(s)
      if (!v)
        continue

v = (s == "LABEL_Folder") ? ((animation_changed) ? "" : f_path) : encodeURIComponent(v);
      saved_settings.push(q + s + q + ':' + q + v + q)
    }
  }
//alert(saved_settings)
  SystemEXT.SaveLocalSettings(saved_settings, cf, f_path_raw)
}
catch (err) {}
}

function SettingsClosed(event) {
  var ok = (event.closeAction == event.Action.commit)

  if (webkit_electron_mode && (!ok || is_SA_child_animation)) {
    if (SA_topmost_window.webkit_IgnoreMouseEvents_disabled) {
      SA_topmost_window.SA_OnKeyDown({ keyCode:73 }, true)
    }
  }

// User hits OK on the settings page.
  if (ok) {
if (use_SA_browser_mode) {
  SA_animation_append_mode = false
  EQP_gallery_append_mode = false
  DragDrop_install(System.Shell.itemFromPath(loadFolder_CORE()))
  return
}

if (!use_SA_browser_mode && SystemEXT._default._settings)
  Settings_writeJS()

SA_Reload()
return
  }
}
