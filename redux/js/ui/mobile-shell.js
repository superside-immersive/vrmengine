(function () {
  'use strict';

  if (!window.XRA_MOBILE_SHELL) return;

  var state = {
    initialized: false,
    bootFinished: false,
    autoStartAttempted: false,
    cameras: [],
    activeTab: 'capture',
    previewTimer: null
  };

  var DEFAULT_HIP_Y_OFFSET_PERCENT = -12;

  var api = window.XRA_MobileShell = {
    init: init,
    openSettingsPanel: openSettingsPanel,
    closeSettingsPanel: closeSettingsPanel,
    switchTab: switchTab
  };

  function isIpadDesktopRuntime() {
    return !!window._is_ipad_device;
  }

  function assetBase() {
    try {
      if (window.System && System.Gadget && System.Gadget.path) return System.Gadget.path;
    } catch (e) {}
    return '.';
  }

  function asset(name) {
    return assetBase() + '/.figma-assets/' + name;
  }

  function ensureCameraOptions() {
    if (!window.MMD_SA_options) return null;
    MMD_SA_options.user_camera = MMD_SA_options.user_camera || {};
    MMD_SA_options.user_camera.pixel_limit = MMD_SA_options.user_camera.pixel_limit || { _default_: [1280, 720] };
    MMD_SA_options.user_camera.display = MMD_SA_options.user_camera.display || {};
    MMD_SA_options.user_camera.display.wireframe = MMD_SA_options.user_camera.display.wireframe || {};
    MMD_SA_options.user_camera.ML_models = MMD_SA_options.user_camera.ML_models || {};
    MMD_SA_options.user_camera.ML_models.facemesh = MMD_SA_options.user_camera.ML_models.facemesh || {};
    MMD_SA_options.user_camera.ML_models.pose = MMD_SA_options.user_camera.ML_models.pose || {};
    MMD_SA_options.user_camera.streamer_mode = MMD_SA_options.user_camera.streamer_mode || { camera_preference: {} };
    MMD_SA_options.user_camera.streamer_mode.camera_preference = MMD_SA_options.user_camera.streamer_mode.camera_preference || {};
    if (window.XRA_PORTRAIT_FIRST && MMD_SA_options.user_camera.portrait_mode == null)
      MMD_SA_options.user_camera.portrait_mode = 1;
    if (MMD_SA_options.user_camera.ML_models.pose.auto_grounding == null)
      MMD_SA_options.user_camera.ML_models.pose.auto_grounding = true;
    if (MMD_SA_options.user_camera.ML_models.pose.hip_y_position_offset_percent == null)
      MMD_SA_options.user_camera.ML_models.pose.hip_y_position_offset_percent = DEFAULT_HIP_Y_OFFSET_PERCENT;
    if (!window.XRA_DEBUG_MODE) {
      MMD_SA_options.user_camera.display.wireframe.hidden = true;
      MMD_SA_options.user_camera.ML_models.debug_hidden = true;
    }

    if (isIpadDesktopRuntime()) {
      MMD_SA_options.user_camera.ML_models.worker_disabled = true;
      MMD_SA_options.user_camera.ML_models.facemesh.worker_disabled = true;
      MMD_SA_options.user_camera.ML_models.use_holistic = false;
      try {
        if (window.System && System._browser && System._browser.camera && System._browser.camera.poseNet) {
          System._browser.camera.poseNet._use_holistic_ = false;
          System._browser.camera.poseNet.use_holistic = false;
          System._browser.camera.poseNet.use_holistic_legacy = false;
        }
      } catch (e) {}
      if (!MMD_SA_options.user_camera.streamer_mode.mocap_type) {
        MMD_SA_options.user_camera.streamer_mode.mocap_type = 'Full Body';
      }
    }

    return MMD_SA_options.user_camera;
  }

  function applyTrackingDefaults() {
    var options = ensureCameraOptions();
    var poseOptions = options && options.ML_models && options.ML_models.pose;
    var camera = window.System && System._browser && System._browser.camera;
    var poseNet = camera && camera.poseNet;

    if (poseOptions) {
      poseOptions.auto_grounding = true;
      if (poseOptions.hip_y_position_offset_percent == null || poseOptions.hip_y_position_offset_percent === 0)
        poseOptions.hip_y_position_offset_percent = DEFAULT_HIP_Y_OFFSET_PERCENT;
    }

    if (!poseNet) return false;

    poseNet.auto_grounding = true;
    if (poseNet.hip_y_position_offset_percent == null || poseNet.hip_y_position_offset_percent === 0)
      poseNet.hip_y_position_offset_percent = DEFAULT_HIP_Y_OFFSET_PERCENT;

    try {
      if (window.MMD_SA && MMD_SA.WebXR && MMD_SA.WebXR.ground_plane) {
        MMD_SA.WebXR.ground_plane.visible = !!poseNet.ground_plane_visible;
      }
    } catch (e) {}

    return true;
  }

  function scheduleTrackingDefaults() {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (applyTrackingDefaults() || tries > 80) clearInterval(timer);
    }, 250);
  }

  function init() {
    if (state.initialized || !document.body) return;
    state.initialized = true;
    document.body.classList.add('xra-mobile-shell-enabled');
    if (window.XRA_DEBUG_MODE) document.body.classList.add('xra-debug-mode');

    var root = document.createElement('div');
    root.id = 'xra_mobile_shell';
    root.innerHTML = [
      '<div id="xra_loading_shell" class="xra-loading-shell">',
      '  <div class="xra-loading-shell__grid"></div>',
      '  <div class="xra-loading-shell__center">',
      '    <img class="xra-loading-shell__mascot" alt="Snoovatar loading" src="' + asset('84195019cc2cb822339abd3cbd6cd964c04ffe10.png') + '">',
      '  </div>',
      '  <div class="xra-loading-shell__dock">',
      '    <div class="xra-loading-shell__pill"><span id="xra_loading_message">Snoovatar waking up...</span></div>',
      '    <div id="xra_loading_subtitle" class="xra-loading-shell__subtitle">Preparing camera, model, and tracking…</div>',
      '  </div>',
      '</div>',
      '<button id="xra_shell_launcher" class="xra-shell-launcher" type="button" aria-label="Open XR Animator menu"><span class="xra-shell-launcher__dot"></span></button>',
      '<div id="xra_settings_sheet" class="xra-settings-sheet" aria-hidden="true">',
      '  <div id="xra_settings_backdrop" class="xra-settings-sheet__backdrop"></div>',
      '  <section class="xra-settings-sheet__panel" role="dialog" aria-modal="true" aria-label="XR Animator settings">',
      '    <header class="xra-settings-sheet__header">',
      '      <div><div class="xra-settings-sheet__eyebrow">XR Animator</div><h2 class="xra-settings-sheet__title">Control center</h2></div>',
      '      <button id="xra_settings_close" class="xra-settings-sheet__close" type="button" aria-label="Close menu">×</button>',
      '    </header>',
      '    <div class="xra-settings-sheet__tabs">',
      '      <button type="button" class="xra-settings-sheet__tab is-active" data-xra-tab="capture">Capture</button>',
      '      <button type="button" class="xra-settings-sheet__tab" data-xra-tab="advanced">Advanced</button>',
      '    </div>',
      '    <div class="xra-settings-sheet__body">',
      '      <div id="xra_settings_capture" class="xra-settings-sheet__view is-active">',
      '        <div class="xra-settings-card">',
      '          <div class="xra-settings-card__title-row"><h3>Camera</h3><button id="xra_refresh_cameras" class="xra-chip-button" type="button">Refresh</button></div>',
      '          <label class="xra-field"><span>Webcam</span><select id="xra_camera_select" class="xra-select"><option>Detecting cameras…</option></select></label>',
      '          <div class="xra-camera-preview">',
      '            <video id="xra_camera_preview" class="xra-camera-preview__video" autoplay muted playsinline></video>',
      '            <div id="xra_camera_preview_label" class="xra-camera-preview__label">Preview appears once webcam starts.</div>',
      '          </div>',
      '          <div class="xra-grid-2">',
      '            <label class="xra-field"><span>Resolution</span><select id="xra_resolution_select" class="xra-select"><option value="default">Default</option><option value="640x480">640×480</option><option value="1280x960">1280×960</option><option value="1920x1080">1920×1080</option><option value="3840x2160">3840×2160</option><option value="nolimit">No limit</option></select></label>',
      '            <label class="xra-field"><span>Frame rate</span><select id="xra_fps_select" class="xra-select"><option value="default">Default</option><option value="24">24 fps</option><option value="30">30 fps</option><option value="60">60 fps</option></select></label>',
      '          </div>',
      '          <div class="xra-grid-2">',
      '            <label class="xra-field"><span>Orientation</span><select id="xra_portrait_select" class="xra-select"><option value="1">Portrait (height × width)</option><option value="2">Portrait rotate clockwise</option><option value="3">Portrait rotate anticlockwise</option><option value="0">Landscape / off</option></select></label>',
      '            <label class="xra-toggle"><input id="xra_flip_camera" type="checkbox"><span>Mirror camera</span></label>',
      '          </div>',
      '          <label class="xra-field"><span>Tracking mode</span><select id="xra_mocap_select" class="xra-select"><option value="">Automatic</option><option value="Face">Face</option><option value="Full Body">Full Body</option><option value="Full Body Holistic">Full Body Holistic</option></select></label>',
      '          <div class="xra-inline-actions"><button id="xra_apply_capture" class="xra-primary-button" type="button">Apply</button><button id="xra_restart_capture" class="xra-secondary-button" type="button">Restart webcam</button></div>',
      '          <p id="xra_capture_status" class="xra-muted-copy">Webcam starts automatically when loading finishes.</p>',
      '        </div>',
      '        <div class="xra-settings-card">',
      '          <div class="xra-settings-card__title-row"><h3>Shortcuts</h3></div>',
      '          <div class="xra-inline-actions"><button id="xra_open_ar" class="xra-secondary-button" type="button">Enter AR</button><button id="xra_open_advanced_btn" class="xra-secondary-button" type="button">Open advanced</button></div>',
      '          <p class="xra-muted-copy">Tracking turns on automatically after load. The old tracking button stays hidden.</p>',
      '        </div>',
      '      </div>',
      '      <div id="xra_settings_advanced" class="xra-settings-sheet__view">',
      '        <div class="xra-settings-card">',
      '          <div class="xra-settings-card__title-row"><h3>Advanced settings</h3></div>',
      '          <p class="xra-muted-copy">Legacy settings remain available here, inside the new shell.</p>',
      '          <iframe id="xra_settings_iframe" class="xra-settings-iframe" title="XR Animator advanced settings" loading="lazy"></iframe>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </section>',
      '</div>'
    ].join('');
    document.body.appendChild(root);

    bindEvents();
    patchSettingsLauncher();
    syncControls();
    refreshCameraList(false);
    updateLoadingMessage(window.XRA_BOOT_STATUS && window.XRA_BOOT_STATUS.lastMessage);
    scheduleTrackingDefaults();
    syncCameraPreview();
    ensurePreviewTimer();

    try {
      navigator.mediaDevices && navigator.mediaDevices.addEventListener && navigator.mediaDevices.addEventListener('devicechange', function () {
        refreshCameraList(false);
      });
    } catch (e) {}
  }

  function bindEvents() {
    byId('xra_shell_launcher').addEventListener('click', function () { openSettingsPanel('capture'); });
    byId('xra_settings_close').addEventListener('click', closeSettingsPanel);
    byId('xra_settings_backdrop').addEventListener('click', closeSettingsPanel);
    byId('xra_refresh_cameras').addEventListener('click', function () { refreshCameraList(true); });
    byId('xra_apply_capture').addEventListener('click', applyCaptureSettings);
    byId('xra_restart_capture').addEventListener('click', restartCapture);
    byId('xra_open_advanced_btn').addEventListener('click', function () { openSettingsPanel('advanced'); });
    byId('xra_open_ar').addEventListener('click', function () {
      try { (window.AvatarRuntime || window.MMD_SA).WebXR.enter_AR(); } catch (e) {}
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-xra-tab]')).forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-xra-tab')); });
    });

    window.addEventListener('XRA_debug_status', function (e) {
      updateLoadingMessage(e.detail && e.detail.msg);
    });

    window.addEventListener('MMDStarted', function () {
      updateLoadingMessage('Final touches…');
      scheduleTrackingDefaults();
      syncCameraPreview();
      patchCameraConstraints();
      setTimeout(finishLoadingShell, 900);
    });

    window.addEventListener('SA_XR_Animator_scene_onload', function () {
      updateLoadingMessage('Scene ready. Starting webcam…');
      scheduleTrackingDefaults();
      syncCameraPreview();
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSettingsPanel();
    });
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function updateLoadingMessage(msg) {
    var title = byId('xra_loading_message');
    var subtitle = byId('xra_loading_subtitle');
    var text = (msg == null) ? '' : String(msg).replace(/[()]/g, '').trim();
    if (!text) text = 'Snoovatar waking up...';
    if (title) title.textContent = text;
    if (subtitle) subtitle.textContent = state.bootFinished ? 'Everything is ready.' : 'Preparing camera, model, and tracking…';
  }

  function finishLoadingShell() {
    if (state.bootFinished) return;
    state.bootFinished = true;
    var loading = byId('xra_loading_shell');
    if (loading) loading.classList.add('is-hidden');
    attemptAutoStart();
  }

  function openSettingsPanel(tab) {
    var sheet = byId('xra_settings_sheet');
    if (!sheet) return false;
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    syncControls();
    refreshCameraList(false);
    syncCameraPreview();
    switchTab(tab || 'capture');
    return true;
  }

  function closeSettingsPanel() {
    var sheet = byId('xra_settings_sheet');
    if (!sheet) return;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
  }

  function switchTab(tab) {
    state.activeTab = (tab === 'advanced') ? 'advanced' : 'capture';
    Array.prototype.slice.call(document.querySelectorAll('[data-xra-tab]')).forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-xra-tab') === state.activeTab);
    });
    ['capture', 'advanced'].forEach(function (id) {
      var view = byId('xra_settings_' + id);
      if (view) view.classList.toggle('is-active', id === state.activeTab);
    });
    if (state.activeTab === 'advanced') {
      var iframe = byId('xra_settings_iframe');
      if (iframe && !iframe.getAttribute('src')) iframe.setAttribute('src', 'settings.html?xra_embed=1');
    }
  }

  function setStatus(text, isError) {
    var node = byId('xra_capture_status');
    if (!node) return;
    node.textContent = text;
    node.classList.toggle('is-error', !!isError);
  }

  function cameraLabel(device, index) {
    if (!device) return 'Camera';
    return device.label || ('Camera ' + ((index || 0) + 1));
  }

  function cameraLabelScore(device) {
    var label = String((device && device.label) || '').toLowerCase();
    var score = 0;

    if (!label) return score;

    if (/(ultra\s*wide\s*front|front\s*ultra\s*wide)/.test(label)) score += 300;
    if (/(front|facetime|user|selfie|true.?depth)/.test(label)) score += 180;
    if (/(center\s*stage)/.test(label)) score += 120;
    if (/(back|rear|environment|world|desk\s*view|continuity)/.test(label)) score -= 260;
    if (/(telephoto|macro|external|virtual)/.test(label)) score -= 80;
    if (/(ultra\s*wide|wide)/.test(label) && !/(front|facetime|user|selfie)/.test(label)) score -= 40;

    return score;
  }

  function getPreferredCamera(cameras) {
    if (!cameras || !cameras.length) return null;
    return cameras.slice().sort(function (a, b) {
      return cameraLabelScore(b) - cameraLabelScore(a);
    })[0] || null;
  }

  function shouldAutoChoosePreferredCamera(options) {
    var preference = options && options.streamer_mode && options.streamer_mode.camera_preference;
    if (!preference) return true;
    if (preference.selection_source === 'manual') return false;
    return true;
  }

  function storeCameraPreference(device, source) {
    var options = ensureCameraOptions();
    if (!options || !device) return;
    options.streamer_mode.camera_preference = Object.assign(options.streamer_mode.camera_preference || {}, {
      label: device.label || '',
      deviceId: device.deviceId || '',
      selection_source: source || 'auto'
    });
  }

  function getCameraPreviewStream() {
    var camera = window.System && System._browser && System._browser.camera;
    if (!camera) return null;
    if (camera.stream) return camera.stream;
    if (camera.video && camera.video.srcObject) return camera.video.srcObject;
    return null;
  }

  function syncCameraPreview() {
    var preview = byId('xra_camera_preview');
    var label = byId('xra_camera_preview_label');
    var options = ensureCameraOptions();
    if (!preview || !label) return;

    var stream = getCameraPreviewStream();
    if (preview.srcObject !== stream) preview.srcObject = stream || null;

    if (stream) {
      preview.classList.add('is-live');
      preview.play && preview.play().catch(function () {});
      label.textContent = (options && options.streamer_mode && options.streamer_mode.camera_preference && options.streamer_mode.camera_preference.label) || 'Live webcam preview';
    }
    else {
      preview.classList.remove('is-live');
      label.textContent = 'Preview appears once webcam starts.';
    }
  }

  function ensurePreviewTimer() {
    if (state.previewTimer) return;
    state.previewTimer = setInterval(syncCameraPreview, 700);
  }

  function syncControls() {
    var options = ensureCameraOptions();
    if (!options) return;

    var resolution = byId('xra_resolution_select');
    var fps = byId('xra_fps_select');
    var portrait = byId('xra_portrait_select');
    var flip = byId('xra_flip_camera');
    var mocap = byId('xra_mocap_select');

    if (resolution) {
      if (options.pixel_limit.disabled) resolution.value = 'nolimit';
      else if (options.pixel_limit.current) resolution.value = options.pixel_limit.current.join('x');
      else resolution.value = 'default';
    }
    if (fps) fps.value = (options.fps && (options.fps.exact || options.fps)) ? String(options.fps.exact || options.fps) : 'default';
    if (portrait) portrait.value = String((options.portrait_mode == null) ? 1 : options.portrait_mode);
    if (flip) flip.checked = !!options.streamer_mode.camera_preference.video_flipped;
    if (mocap) mocap.value = options.streamer_mode.mocap_type || '';
  }

  async function refreshCameraList(requestAccess) {
    var select = byId('xra_camera_select');
    if (!select || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;

    try {
      if (requestAccess && navigator.mediaDevices.getUserMedia) {
        var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(function (track) { track.stop(); });
      }
      var devices = await navigator.mediaDevices.enumerateDevices();
      state.cameras = devices.filter(function (device) { return device.kind === 'videoinput'; });
      var options = ensureCameraOptions();
      var preferred = getPreferredCamera(state.cameras);
      if (preferred && shouldAutoChoosePreferredCamera(options)) {
        storeCameraPreference(preferred, 'auto');
      }

      state.cameras = state.cameras.slice().sort(function (a, b) {
        return cameraLabelScore(b) - cameraLabelScore(a);
      });
      select.innerHTML = '';
      if (!state.cameras.length) {
        select.innerHTML = '<option value="">No webcam detected</option>';
        return;
      }
      state.cameras.forEach(function (device, index) {
        var option = document.createElement('option');
        option.value = device.deviceId || ('camera-' + index);
        option.textContent = cameraLabel(device, index);
        option.dataset.label = device.label || '';
        select.appendChild(option);
      });
      var wanted = options && options.streamer_mode.camera_preference.label;
      if (wanted) {
        var match = state.cameras.find(function (device) { return device.label === wanted; });
        if (match) select.value = match.deviceId;
      }
      if (!select.value && preferred) select.value = preferred.deviceId;
      if (!select.value && state.cameras[0]) select.value = state.cameras[0].deviceId;
      syncCameraPreview();
    } catch (e) {
      setStatus('Camera list unavailable until permission is granted.', true);
    }
  }

  function applyCaptureSettings() {
    var options = ensureCameraOptions();
    if (!options) return;

    var select = byId('xra_camera_select');
    var resolution = byId('xra_resolution_select');
    var fps = byId('xra_fps_select');
    var portrait = byId('xra_portrait_select');
    var flip = byId('xra_flip_camera');
    var mocap = byId('xra_mocap_select');

    if (select && select.selectedOptions && select.selectedOptions[0]) {
      options.streamer_mode.camera_preference = Object.assign(options.streamer_mode.camera_preference || {}, {
        label: select.selectedOptions[0].dataset.label || select.selectedOptions[0].textContent,
        deviceId: select.value || '',
        video_flipped: !!(flip && flip.checked),
        selection_source: 'manual'
      });
    }

    if (resolution) {
      if (resolution.value === 'nolimit') {
        options.pixel_limit.disabled = true;
        options.pixel_limit.current = null;
      }
      else if (resolution.value === 'default') {
        options.pixel_limit.disabled = false;
        options.pixel_limit.current = null;
      }
      else {
        options.pixel_limit.disabled = false;
        options.pixel_limit.current = resolution.value.split('x').map(function (value) { return parseInt(value, 10); });
      }
    }

    if (fps) options.fps = (fps.value === 'default') ? null : { ideal: parseInt(fps.value, 10), exact: parseInt(fps.value, 10) };
    if (portrait) options.portrait_mode = parseInt(portrait.value, 10);
    if (mocap) options.streamer_mode.mocap_type = mocap.value || null;

    var camera = window.System && System._browser && System._browser.camera;
    if (camera && camera.video_track && typeof camera.set_constraints === 'function') {
      camera.video_track.applyConstraints(camera.set_constraints()).then(function () {
        setStatus('Camera settings applied.', false);
        syncCameraPreview();
      }).catch(function () {
        setStatus('Saved. Some changes apply the next time webcam restarts.', false);
      });
    }
    else {
      setStatus('Saved. Webcam will use the new configuration on restart.', false);
    }
  }

  async function primePreferredCamera() {
    var options = ensureCameraOptions();
    if (!options) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;

    var probe = null;
    try {
      if (navigator.mediaDevices.getUserMedia) probe = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      var devices = await navigator.mediaDevices.enumerateDevices();
      var cameras = devices.filter(function (device) { return device.kind === 'videoinput'; });
      var preferred = getPreferredCamera(cameras);
      if (preferred && shouldAutoChoosePreferredCamera(options)) {
        storeCameraPreference(preferred, 'auto');
      }
      state.cameras = cameras;
      await refreshCameraList(false);
    } finally {
      if (probe) probe.getTracks().forEach(function (track) { track.stop(); });
    }
  }

  function startStreamerMode() {
    try {
      if (window.System && System._browser && System._browser.camera && System._browser.camera.streamer_mode && typeof System._browser.camera.streamer_mode.start === 'function') {
        System._browser.camera.streamer_mode.start();
        return true;
      }
    } catch (e) {}
    return false;
  }

  async function attemptAutoStart() {
    if (state.autoStartAttempted || !window.XRA_AUTO_START_STREAMER) return;
    state.autoStartAttempted = true;
    try {
      await primePreferredCamera();
      setStatus(isIpadDesktopRuntime() ? 'Starting webcam and iPad-safe MediaPipe tracking…' : 'Starting webcam automatically…', false);
      if (!startStreamerMode()) {
        setStatus('Webcam could not start automatically. Open the menu to retry.', true);
      }
      syncCameraPreview();
    } catch (e) {
      setStatus('Webcam needs permission. Open the menu to retry.', true);
    }
  }

  async function restartCapture() {
    applyCaptureSettings();
    // Stop existing stream so a fresh getUserMedia picks up the new deviceId
    try {
      var camera = window.System && System._browser && System._browser.camera;
      if (camera && camera.stream) {
        camera.stream.getTracks().forEach(function (t) { t.stop(); });
        camera.video_track = null;
        camera.stream = null;
        if (camera.video) camera.video.srcObject = null;
        camera.initialized = false;
        console.log('[MobileShell] stopped existing stream for camera switch');
      }
    } catch (e) {}
    state.autoStartAttempted = false;
    await attemptAutoStart();
  }

  /**
   * Monkey-patch System._browser.camera.set_constraints so that when a deviceId
   * is stored in camera_preference, it's injected into the constraints object.
   * On mobile Safari, getUserMedia can't have both deviceId and facingMode,
   * so we also need to ensure the SA start() path removes facingMode when
   * a specific deviceId is requested.
   */
  function patchCameraConstraints() {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      var camera = window.System && System._browser && System._browser.camera;
      if (camera && typeof camera.set_constraints === 'function' && !camera._xra_patched_constraints) {
        clearInterval(timer);
        var _orig = camera.set_constraints.bind(camera);
        camera.set_constraints = function (extra) {
          var result = _orig(extra);
          try {
            var pref = MMD_SA_options.user_camera.streamer_mode.camera_preference;
            if (pref && pref.deviceId && pref.selection_source === 'manual') {
              result.deviceId = { exact: pref.deviceId };
              // deviceId and facingMode are mutually exclusive in getUserMedia
              delete result.facingMode;
            }
          } catch (e) {}
          return result;
        };
        camera._xra_patched_constraints = true;
        console.log('[MobileShell] camera.set_constraints patched for deviceId injection');

        // Also wrap navigator.mediaDevices.getUserMedia to strip facingMode
        // when deviceId is present (SA's mobile path adds facingMode:"user"
        // AFTER set_constraints, which conflicts with deviceId).
        if (navigator.mediaDevices && !navigator.mediaDevices._xra_patched_gum) {
          var _origGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (constraints) {
            try {
              if (constraints && constraints.video && typeof constraints.video === 'object') {
                if (constraints.video.deviceId && constraints.video.facingMode) {
                  delete constraints.video.facingMode;
                  console.log('[MobileShell] stripped facingMode from getUserMedia (deviceId present)');
                }
              }
            } catch (e) {}
            return _origGUM(constraints);
          };
          navigator.mediaDevices._xra_patched_gum = true;
        }
      }
      if (tries > 120) clearInterval(timer);
    }, 250);
  }

  function patchSettingsLauncher() {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (window.System && System._browser && typeof System._browser.onSettings === 'function') {
        clearInterval(timer);
        System._browser.onSettings = function () {
          return openSettingsPanel('advanced');
        };
      }
      if (tries > 120) clearInterval(timer);
    }, 250);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
