// ============================================================
// XRA Performance Overlay — always-visible on-screen HUD
// Shows FPS, frame time, GPU, memory, Three.js stats, MediaPipe status
// ============================================================
(function () {
  'use strict';

  // ── State ──
  var _panel = null;
  var _rows  = {};
  var _rafHandle = null;
  var _frameCount = 0;
  var _lastCountTime = 0;
  var _smoothFps = 0;
  var _frameTimes = [];
  var _gpu = '';
  var _collapsed = false;

  // ── Detect GPU once ──
  var _glContext = null; // keep reference for memory queries
  function _detectGPU() {
    try {
      var cv = document.createElement('canvas');
      var gl = cv.getContext('webgl2') || cv.getContext('webgl') || cv.getContext('experimental-webgl');
      if (!gl) return '(no WebGL)';
      _glContext = gl;
      // Try unmasked renderer (Chrome/Firefox)
      var r = '';
      try {
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) r = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
      } catch (e) {}
      // Fallback: gl.RENDERER (Safari returns "Apple GPU")
      if (!r) r = gl.getParameter(gl.RENDERER) || '';
      // Shorten ANGLE strings
      r = r.replace(/^ANGLE \(/, '').replace(/\)$/, '').replace(/,\s*Direct3D.*$/, '').replace(/,\s*OpenGL.*$/, '');
      if (r.length > 40) r = r.substring(0, 37) + '...';
      return r || '?';
    } catch (e) { return '?'; }
  }

  // ── Get Three.js renderer ──
  function _getRenderer() {
    try {
      // SA's main renderer
      if (window.THREE && THREE.MMD) {
        var r = THREE.MMD.getModels && THREE.MMD.getModels()[0];
        if (r && r.mesh && r.mesh.parent) {
          var scene = r.mesh.parent;
          while (scene.parent) scene = scene.parent;
        }
      }
      // Direct renderer reference from MMD_SA
      if (window.MMD_SA && MMD_SA.THREEX && MMD_SA.THREEX.renderer) return MMD_SA.THREEX.renderer;
      // VRM Direct standalone renderer
      if (window._VRMDirectHandle && _VRMDirectHandle.renderer) return _VRMDirectHandle.renderer;
    } catch (e) {}
    return null;
  }

  // ── Get tracking state from SA camera ──
  function _getTrackingInfo() {
    var info = {
      pose:  { loaded: false, enabled: false, fps: 0 },
      face:  { loaded: false, enabled: false, fps: 0 },
      hands: { loaded: false, enabled: false, fps: 0 },
      ml_fps: 0
    };
    try {
      var cam = window.System && System._browser && System._browser.camera;
      if (!cam) return info;

      // Pose
      if (cam.poseNet) {
        info.pose.loaded  = !!(cam.poseNet.model || cam.poseNet.pose_landmarker || cam.poseNet.posenet_initialized || cam.poseNet.initialized);
        info.pose.enabled = !!cam.poseNet.enabled;
        info.pose.fps     = cam.poseNet.fps || 0;
      }
      // Face
      if (cam.facemesh) {
        info.face.loaded  = !!(cam.facemesh.worker_initialized || cam.facemesh.initialized);
        info.face.enabled = !!cam.facemesh.enabled;
        info.face.fps     = cam.facemesh.fps || 0;
      }
      // Hands
      if (cam.handpose) {
        info.hands.loaded  = !!(cam.handpose.initialized || cam.handpose.worker_initialized);
        info.hands.enabled = !!cam.handpose.enabled;
        info.hands.fps     = cam.handpose.fps || 0;
      }
      // ML FPS
      if (cam.ML_fps != null) info.ml_fps = cam.ML_fps;
    } catch (e) {}
    return info;
  }

  // ── Build the panel DOM ──
  function _createPanel() {
    if (_panel) return;

    _panel = document.createElement('div');
    _panel.id = 'xra_perf_overlay';

    // Title bar (clickable to collapse)
    var titleBar = document.createElement('div');
    titleBar.id = 'xra_perf_overlay_title';
    titleBar.innerHTML = '<span class="perf-icon">&#9881;</span> PERF';
    function _toggleCollapse() {
      _collapsed = !_collapsed;
      var body = document.getElementById('xra_perf_overlay_body');
      if (body) body.style.display = _collapsed ? 'none' : '';
      titleBar.querySelector('.perf-icon').textContent = _collapsed ? '\u25B6' : '\u2699';
    }
    titleBar.addEventListener('click', _toggleCollapse);
    titleBar.addEventListener('touchend', function (e) { e.preventDefault(); _toggleCollapse(); });
    _panel.appendChild(titleBar);

    var body = document.createElement('div');
    body.id = 'xra_perf_overlay_body';
    _panel.appendChild(body);

    // Rows
    var sections = [
      { id: 'fps',      label: 'FPS' },
      { id: 'ft',       label: 'Frame' },
      { id: 'gpu',      label: 'GPU' },
      { id: 'mem',      label: 'Mem' },
      { id: 'tris',     label: 'Tris' },
      { id: 'draws',    label: 'Draws' },
      { id: 'programs', label: 'Progs' },
      { id: 'textures', label: 'Tex' },
      { id: 'sep1',     label: '──────── MediaPipe ────────', isSep: true },
      { id: 'pose',     label: 'Pose' },
      { id: 'face',     label: 'Face' },
      { id: 'hands',    label: 'Hands' },
      { id: 'mlfps',    label: 'ML-FPS' },
    ];

    sections.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'perf-row' + (s.isSep ? ' perf-sep' : '');
      if (s.isSep) {
        row.textContent = s.label;
      } else {
        var lbl = document.createElement('span');
        lbl.className = 'perf-label';
        lbl.textContent = s.label;
        var val = document.createElement('span');
        val.className = 'perf-value';
        val.id = 'perf_v_' + s.id;
        val.textContent = '--';
        row.appendChild(lbl);
        row.appendChild(val);
      }
      body.appendChild(row);
      _rows[s.id] = val || row;
    });

    document.body.appendChild(_panel);
  }

  // ── FPS graph (tiny canvas) ──
  var _graphCanvas = null;
  var _graphCtx    = null;
  var _graphData   = [];

  function _createGraph() {
    _graphCanvas = document.createElement('canvas');
    _graphCanvas.id = 'xra_perf_graph';
    // Scale for retina displays (iPad = 2x or 3x)
    var dpr = window.devicePixelRatio || 1;
    var logicalW = 160, logicalH = 32;
    _graphCanvas.width  = logicalW * dpr;
    _graphCanvas.height = logicalH * dpr;
    _graphCanvas.style.width  = logicalW + 'px';
    _graphCanvas.style.height = logicalH + 'px';
    var body = document.getElementById('xra_perf_overlay_body');
    if (body) body.insertBefore(_graphCanvas, body.firstChild);
    _graphCtx = _graphCanvas.getContext('2d');
    _graphCtx.scale(dpr, dpr);
    _graphLogicalW = logicalW;
    _graphLogicalH = logicalH;
  }
  var _graphLogicalW = 160;
  var _graphLogicalH = 32;

  function _drawGraph(fps) {
    if (!_graphCtx) return;
    _graphData.push(Math.min(fps, 120));
    var maxBars = _graphLogicalW;
    if (_graphData.length > maxBars) _graphData.shift();

    var w = _graphLogicalW, h = _graphLogicalH;
    _graphCtx.clearRect(0, 0, w, h);

    // 60 FPS guide line
    _graphCtx.strokeStyle = 'rgba(255,255,255,0.12)';
    _graphCtx.beginPath();
    var y60 = h - (60 / 120) * h;
    _graphCtx.moveTo(0, y60);
    _graphCtx.lineTo(w, y60);
    _graphCtx.stroke();

    // FPS bars
    for (var i = 0; i < _graphData.length; i++) {
      var v = _graphData[i];
      var barH = (v / 120) * h;
      var r = v < 20 ? 255 : v < 40 ? 255 : v < 55 ? 220 : 80;
      var g = v < 20 ? 60  : v < 40 ? 180 : v < 55 ? 220 : 230;
      var b = v < 20 ? 60  : v < 40 ? 60  : v < 55 ? 100 : 200;
      _graphCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
      _graphCtx.fillRect(i, h - barH, 1, barH);
    }
  }

  // ── Status badge helper ──
  function _badge(loaded, enabled, fps) {
    if (!loaded && !enabled) return '<span class="perf-off">OFF</span>';
    if (loaded && !enabled)  return '<span class="perf-loaded">READY</span>';
    if (enabled && fps > 0)  return '<span class="perf-on">' + fps.toFixed(0) + ' fps</span>';
    if (enabled)             return '<span class="perf-warm">INIT...</span>';
    return '<span class="perf-off">--</span>';
  }

  // ── Update tick ──
  function _update() {
    if (!_panel) return;

    var el;

    // FPS (smoothed, updated every 500ms by counter)
    el = document.getElementById('perf_v_fps');
    if (el) {
      var fpsVal = _smoothFps;
      var color = fpsVal >= 55 ? '#5eff7e' : fpsVal >= 30 ? '#ffe65e' : '#ff5e5e';
      el.innerHTML = '<span style="color:' + color + ';font-weight:700">' + fpsVal.toFixed(1) + '</span>';
    }

    // Frame time
    el = document.getElementById('perf_v_ft');
    if (el) {
      var avgFt = _frameTimes.length ? (_frameTimes.reduce(function(a,b){ return a+b; },0) / _frameTimes.length) : 0;
      el.textContent = avgFt.toFixed(1) + ' ms';
    }

    // GPU
    el = document.getElementById('perf_v_gpu');
    if (el) el.textContent = _gpu || '--';

    // Memory — Chrome has performance.memory; Safari uses WebGL memory estimate
    el = document.getElementById('perf_v_mem');
    if (el) {
      if (window.performance && performance.memory) {
        var used  = (performance.memory.usedJSHeapSize  / 1048576).toFixed(0);
        var total = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0);
        el.textContent = used + ' / ' + total + ' MB';
      } else {
        // Fallback: show WebGL resource counts from Three.js renderer
        var renderer_ = _getRenderer();
        if (renderer_ && renderer_.info && renderer_.info.memory) {
          var mi = renderer_.info.memory;
          el.textContent = 'G:' + (mi.geometries||0) + ' T:' + (mi.textures||0);
        } else {
          el.textContent = '(Safari)';
        }
      }
    }

    // Three.js renderer info
    var renderer = _getRenderer();
    if (renderer && renderer.info) {
      var ri = renderer.info;
      el = document.getElementById('perf_v_tris');
      if (el) el.textContent = (ri.render ? _formatNum(ri.render.triangles || 0) : '--');
      el = document.getElementById('perf_v_draws');
      if (el) el.textContent = (ri.render ? (ri.render.calls || 0) : '--');
      el = document.getElementById('perf_v_programs');
      if (el) el.textContent = (ri.programs ? ri.programs.length : '--');
      el = document.getElementById('perf_v_textures');
      if (el) el.textContent = (ri.memory ? ri.memory.textures : '--');
    }

    // MediaPipe tracking
    var track = _getTrackingInfo();
    el = document.getElementById('perf_v_pose');
    if (el) el.innerHTML = _badge(track.pose.loaded, track.pose.enabled, track.pose.fps);
    el = document.getElementById('perf_v_face');
    if (el) el.innerHTML = _badge(track.face.loaded, track.face.enabled, track.face.fps);
    el = document.getElementById('perf_v_hands');
    if (el) el.innerHTML = _badge(track.hands.loaded, track.hands.enabled, track.hands.fps);
    el = document.getElementById('perf_v_mlfps');
    if (el) {
      if (track.ml_fps > 0)
        el.textContent = track.ml_fps.toFixed(1) + ' fps';
      else
        el.textContent = '--';
    }

    // FPS graph
    _drawGraph(_smoothFps);
  }

  function _formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // ── RAF loop for counting frames ──
  function _rafLoop(ts) {
    _frameCount++;

    // Measure frame time
    if (_frameTimes._lastTs) {
      var dt = ts - _frameTimes._lastTs;
      _frameTimes.push(dt);
      if (_frameTimes.length > 60) _frameTimes.shift();
    }
    _frameTimes._lastTs = ts;

    _rafHandle = requestAnimationFrame(_rafLoop);
  }

  // ── Init ──
  function init() {
    _gpu = _detectGPU();
    _createPanel();
    _createGraph();

    // Start RAF counter
    _frameCount = 0;
    _lastCountTime = performance.now();
    _rafHandle = requestAnimationFrame(_rafLoop);

    // Update display every 500ms
    setInterval(function () {
      var now = performance.now();
      var elapsed = now - _lastCountTime;
      if (elapsed > 0) {
        var rawFps = (_frameCount / elapsed) * 1000;
        _smoothFps = _smoothFps * 0.3 + rawFps * 0.7;
      }
      _frameCount = 0;
      _lastCountTime = now;

      _update();
    }, 500);
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay so the 3D canvas and camera objects are likely available
    setTimeout(init, 2000);
  }

  // Expose toggle
  window.XRA_PerfOverlay = {
    toggle: function () {
      if (_panel) _panel.style.display = (_panel.style.display === 'none') ? '' : 'none';
    },
    show: function () { if (_panel) _panel.style.display = ''; },
    hide: function () { if (_panel) _panel.style.display = 'none'; }
  };
})();
