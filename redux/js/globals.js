// System Animator - Global State Registry
// Central namespace for all shared state. Legacy global aliases are maintained
// in core.js and core_extra.js for backward compatibility.
// (2026-02-18)

/**
 * @namespace SA
 * Root namespace for all System Animator shared state.
 * 
 * Sub-namespaces:
 *   SA.platform  - Runtime environment detection flags
 *   SA.settings  - Default settings, setting name lists
 *   SA.debug     - Debug display state
 *   SA.child     - Child animation state (iframe-based)
 *   SA.paths     - File/folder path references
 *   SA.shell     - Shell/filesystem objects (Electron/NW.js)
 *   SA.ui        - UI state flags
 *   SA.os        - Operating system detection
 */
window.SA = window.SA || {};

// --- Platform Detection ---
// Populated by core.js after environment detection IIFE runs.
SA.platform = {
  // Browser/engine flags
  is_chrome: false,
  browser_native_mode: false,
  localhost_mode: false,
  w3c_mode: false,
  use_inline_dialog: false,

  // WebKit/Electron/NW.js
  webkit_mode: false,
  webkit_version: undefined,
  webkit_version_number: undefined,
  webkit_version_milestone: {},
  webkit_path: undefined,
  webkit_dir: undefined,
  webkit_transparent_mode: false,
  webkit_nwjs_mode: false,
  webkit_electron_mode: false,
  webkit_electron_remote: undefined,
  webkit_window: undefined,
  webkit_electron_screen: undefined,
  webkit_electron_dialog: undefined,
  webkit_IgnoreMouseEvents_disabled: false,

  // Wallpaper Engine / CEF
  WallpaperEngine_mode: false,
  WallpaperEngine_CEF_mode: false,
  WallpaperEngine_CEF_native_mode: false,
  Settings_WE: {},

  // [9D] Legacy IE flags — kept for child animation iframe propagation
  // ie9_mode/ie8_mode: always true; ie9_native: false in modern; ie_64bit: always false
  ie9: false,
  ie9_native: false,
  ie9_mode: false,
  ie8_mode: false,
  ie_64bit: false,
  xul_mode: false,
  xul_version: 0,
  xul_path: undefined,

  // Mobile
  is_mobile: false,

  // Compatibility flags
  non_windows_native_mode: false
};

// --- Operating System ---
SA.os = {
  windows_mode: false,
  linux_mode: false,
  mac_mode: false,
  Vista_or_above: false,
  W7_or_above: false,
  W8_or_above: false
};

// --- Settings ---
// Populated by core.js with default values and setting name lists.
SA.settings = {
  defaults: null,        // Will reference Settings_default object
  name_list: null,       // Will reference Setting_name_list array
  name_list_boolean: null // Will reference Setting_name_list_boolean array
};

// --- Debug ---
SA.debug = {
  count: 0,
  timerID: null,
  always_visible: false,
  hide_sec: 0,
  last_display_time: 0
};

// --- Child Animation ---
SA.child = {
  is_child: false,
  is_host: false,
  max: 10,
  list: [],
  id: undefined,
  topmost_window: null,
  top_window: null
};

// --- Paths ---
SA.paths = {
  SA_HTA_folder: undefined,
  SA_HTA_folder_parent: undefined,
  SA_HTA_folder_full: undefined,
  path_demo: undefined,
  path_demo_by_url: undefined,
  p_js: undefined
};

// --- Shell / Filesystem ---
SA.shell = {
  oShell: undefined,
  Shell_OBJ: undefined,
  FSO_OBJ: undefined
};

// --- UI State ---
SA.ui = {
  use_SA_browser_mode: false,
  use_SA_gimage_emulation: false,
  use_SA_system_emulation: true,
  absolute_screen_mode: false,
  HTA_use_GPU_acceleration: false,
  save_settings_by_localStorage: false
};

// --- Project ---
SA.project = {
  JSON: null
};

/**
 * Sync all SA namespace values FROM legacy global variables.
 * Called at the end of core.js and core_extra.js after globals are set.
 */
SA.syncFromGlobals = function () {
  var p = SA.platform;
  var o = SA.os;

  // Platform
  p.is_chrome = !!self.is_chrome;
  p.browser_native_mode = !!self.browser_native_mode;
  p.localhost_mode = !!self.localhost_mode;
  p.w3c_mode = !!self.w3c_mode;
  p.use_inline_dialog = !!self.use_inline_dialog;

  // WebKit/Electron
  p.webkit_mode = !!self.webkit_mode;
  p.webkit_version = self.webkit_version;
  p.webkit_version_number = self.webkit_version_number;
  p.webkit_version_milestone = self.webkit_version_milestone || {};
  p.webkit_path = self.webkit_path;
  p.webkit_dir = self.webkit_dir;
  p.webkit_transparent_mode = !!self.webkit_transparent_mode;
  p.webkit_nwjs_mode = !!self.webkit_nwjs_mode;
  p.webkit_electron_mode = !!self.webkit_electron_mode;
  p.webkit_electron_remote = self.webkit_electron_remote;
  p.webkit_window = self.webkit_window;
  p.webkit_electron_screen = self.webkit_electron_screen;
  p.webkit_electron_dialog = self.webkit_electron_dialog;
  p.webkit_IgnoreMouseEvents_disabled = !!self.webkit_IgnoreMouseEvents_disabled;

  // Wallpaper Engine
  p.WallpaperEngine_mode = !!self.WallpaperEngine_mode;
  p.WallpaperEngine_CEF_mode = !!self.WallpaperEngine_CEF_mode;
  p.WallpaperEngine_CEF_native_mode = !!self.WallpaperEngine_CEF_native_mode;
  p.Settings_WE = self.Settings_WE || {};

  // Legacy platform
  p.ie9 = !!self.ie9;
  // [9D] Legacy IE flags — propagated to child animation iframes
  p.ie9_native = !!self.ie9_native;
  p.ie9_mode = !!self.ie9_mode;
  p.ie8_mode = !!self.ie8_mode;
  p.ie_64bit = !!self.ie_64bit;
  p.xul_mode = !!self.xul_mode;
  p.xul_version = self.xul_version || 0;
  p.xul_path = self.xul_path;

  // Mobile
  p.is_mobile = !!self.is_mobile;
  p.non_windows_native_mode = !!self.non_windows_native_mode;

  // OS
  o.windows_mode = !!self.windows_mode;
  o.linux_mode = !!self.linux_mode;
  o.mac_mode = !!self.mac_mode;
  o.Vista_or_above = !!self.Vista_or_above;
  o.W7_or_above = !!self.W7_or_above;
  o.W8_or_above = !!self.W8_or_above;

  // Settings
  SA.settings.defaults = self.Settings_default || null;
  SA.settings.name_list = self.Setting_name_list || null;
  SA.settings.name_list_boolean = self.Setting_name_list_boolean || null;

  // Debug
  SA.debug.count = self.DEBUG_count || 0;
  SA.debug.timerID = self.DEBUG_timerID || null;
  SA.debug.always_visible = !!self.DEBUG_always_visible;
  SA.debug.hide_sec = self.DEBUG_hide_sec || 0;
  SA.debug.last_display_time = self.DEBUG_last_display_time || 0;

  // Child
  SA.child.is_child = !!self.is_SA_child_animation;
  SA.child.is_host = !!self.is_SA_child_animation_host;
  SA.child.max = self.SA_child_animation_max || 10;
  SA.child.list = self.SA_child_animation || [];
  SA.child.id = self.SA_child_animation_id;
  SA.child.topmost_window = self.SA_topmost_window || null;
  SA.child.top_window = self.SA_top_window || null;

  // Paths
  SA.paths.SA_HTA_folder = self.SA_HTA_folder;
  SA.paths.SA_HTA_folder_parent = self.SA_HTA_folder_parent;
  SA.paths.SA_HTA_folder_full = self.SA_HTA_folder_full;
  SA.paths.path_demo = self.path_demo;
  SA.paths.path_demo_by_url = self.path_demo_by_url;
  SA.paths.p_js = self.p_js;

  // Shell
  SA.shell.oShell = self.oShell;
  SA.shell.Shell_OBJ = self.Shell_OBJ;
  SA.shell.FSO_OBJ = self.FSO_OBJ;

  // UI
  SA.ui.use_SA_browser_mode = !!self.use_SA_browser_mode;
  SA.ui.use_SA_gimage_emulation = !!self.use_SA_gimage_emulation;
  SA.ui.use_SA_system_emulation = (self.use_SA_system_emulation !== false);
  SA.ui.absolute_screen_mode = !!self.absolute_screen_mode;
  SA.ui.HTA_use_GPU_acceleration = !!self.HTA_use_GPU_acceleration;
  SA.ui.save_settings_by_localStorage = !!self.save_settings_by_localStorage;

  // Project
  SA.project.JSON = self.SA_project_JSON || null;
};

/**
 * Sync all SA namespace values BACK TO legacy global variables.
 * Use this if you modify SA.* and need legacy code to see the changes.
 */
SA.syncToGlobals = function () {
  var p = SA.platform;
  var o = SA.os;

  self.is_chrome = p.is_chrome;
  self.browser_native_mode = p.browser_native_mode;
  self.localhost_mode = p.localhost_mode;
  self.w3c_mode = p.w3c_mode;
  self.use_inline_dialog = p.use_inline_dialog;

  self.webkit_mode = p.webkit_mode;
  self.webkit_version = p.webkit_version;
  self.webkit_version_number = p.webkit_version_number;
  self.webkit_version_milestone = p.webkit_version_milestone;
  self.webkit_path = p.webkit_path;
  self.webkit_dir = p.webkit_dir;
  self.webkit_transparent_mode = p.webkit_transparent_mode;
  self.webkit_nwjs_mode = p.webkit_nwjs_mode;
  self.webkit_electron_mode = p.webkit_electron_mode;
  self.webkit_electron_remote = p.webkit_electron_remote;
  self.webkit_window = p.webkit_window;
  self.webkit_electron_screen = p.webkit_electron_screen;
  self.webkit_electron_dialog = p.webkit_electron_dialog;
  self.webkit_IgnoreMouseEvents_disabled = p.webkit_IgnoreMouseEvents_disabled;

  self.WallpaperEngine_mode = p.WallpaperEngine_mode;
  self.WallpaperEngine_CEF_mode = p.WallpaperEngine_CEF_mode;
  self.WallpaperEngine_CEF_native_mode = p.WallpaperEngine_CEF_native_mode;
  self.Settings_WE = p.Settings_WE;

  self.ie9 = p.ie9;
  // [9D] Legacy IE flags — received from parent iframe
  self.ie9_native = p.ie9_native;
  self.ie9_mode = p.ie9_mode;
  self.ie8_mode = p.ie8_mode;
  self.ie_64bit = p.ie_64bit;
  self.xul_mode = p.xul_mode;
  self.xul_version = p.xul_version;
  self.xul_path = p.xul_path;

  self.is_mobile = p.is_mobile;
  self.non_windows_native_mode = p.non_windows_native_mode;

  self.windows_mode = o.windows_mode;
  self.linux_mode = o.linux_mode;
  self.mac_mode = o.mac_mode;

  self.is_SA_child_animation = SA.child.is_child;
  self.is_SA_child_animation_host = SA.child.is_host;
  self.SA_child_animation_max = SA.child.max;
  self.SA_child_animation = SA.child.list;
  self.SA_child_animation_id = SA.child.id;
  self.SA_topmost_window = SA.child.topmost_window;
  self.SA_top_window = SA.child.top_window;

  self.SA_HTA_folder = SA.paths.SA_HTA_folder;
  self.SA_HTA_folder_parent = SA.paths.SA_HTA_folder_parent;

  self.oShell = SA.shell.oShell;
  self.Shell_OBJ = SA.shell.Shell_OBJ;
  self.FSO_OBJ = SA.shell.FSO_OBJ;

  self.use_SA_browser_mode = SA.ui.use_SA_browser_mode;
};

// --- Media control globals ---
// Originally declared implicitly in html5.js / EQP_core.js (now quarantined).
// Referenced by MMD_SA.js, motion-control.js, webxr.js, resize.js, and
// SA_system_emulation.min.js.  Declaring them here prevents
// "ReferenceError: SL_MC_video_obj is not defined" spam.
if (typeof SL_MC_video_obj === 'undefined')  self.SL_MC_video_obj  = null;
if (typeof SL_MC_simple_mode === 'undefined') self.SL_MC_simple_mode = false;

console.log('[SA] Global state registry initialized');
