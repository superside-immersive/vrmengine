// (2024-12-29)
// Refactored: Step 2C — sub-modules in js/tracking/facemesh-*.js
// Original: 1134 lines → orchestrator ~150 lines + 4 sub-modules

var FacemeshAT = (function () {

  var is_worker = (typeof window !== "object");

  // --- Shared state object (replaces closure variables) ---
  var S = {
    // Environment
    is_worker: is_worker,
    postMessageAT: null,
    _worker: null,

    // Config (set during init)
    use_faceLandmarksDetection: undefined,
    use_human_facemesh: undefined,
    use_mediapipe_facemesh: undefined,
    use_mediapipe_face_landmarker: undefined,
    facemesh_version: undefined,
    use_SIMD: undefined,

    // Model state
    model: undefined,
    model_inference_device: undefined,
    human: undefined,
    facemesh_initialized: false,
    recalculate_z_rotation_from_scaledMesh: undefined,
    do_puploc: undefined,

    // Canvas & drawing
    canvas: undefined,
    context: undefined,
    RAF_timerID: null,
    flip_canvas: undefined,
    canvas_camera: undefined,
    TRIANGULATION: undefined,

    // Video timestamp
    vt: undefined,
    vt_offset: 0,
    vt_last: -1,

    // Grayscale buffer (legacy puploc)
    gray: undefined,
    gray_w: undefined,
    gray_h: undefined,

    // Eyes
    eyes: undefined,
    eyes_xy_last: [[0,0],[0,0]],
    _rgba_ref: undefined,

    // Emotion detection
    object_detection_worker: undefined,
    object_detection_worker_ready: undefined,
    object_detection_data: undefined,

    // FPS
    fps: 0,
    fps_count: 0,
    fps_ms: 0,

    // Pose/hand data (set by _onmessage)
    posenet: undefined,
    pose_w: undefined,
    pose_h: undefined,
    handpose: undefined,
    handpose_last: undefined,
    handpose_last_timestamp: 0,
    cw: undefined,
    ch: undefined,
    face_cover: undefined,

    // Cross-module function references (set after import)
    load_lib: null,
    emotion_detection: null,
    draw: null,
    process_video_buffer: null,
  };

  S.postMessageAT = (is_worker) ? postMessage.bind(self) : function (msg, transfer) {
    S._worker.onmessage({data:msg})
  };

  var FACEMESH_LIB_CACHE_BUST = '20260321-8';

  function getFacemeshCacheBust() {
    try {
      if (self && self.SA_CACHE_BUST) return String(self.SA_CACHE_BUST);
    } catch (e) {}

    try {
      var currentScript = (typeof document === 'object' && document.currentScript) ? document.currentScript : null;
      if (currentScript && currentScript.src) {
        var url = new URL(currentScript.src, self.location.href);
        var version = url.searchParams.get('v');
        if (version) return version;
      }
    } catch (e) {}

    return FACEMESH_LIB_CACHE_BUST;
  }

  // Sub-module imports (loaded in init)
  // import() in importScripts-loaded code resolves relative to the importScripts
  // source URL (js/facemesh_lib.js), same as <script src> in main thread.
  var _mod_base = './tracking/';
  var _mod_suffix = '?v=' + encodeURIComponent(getFacemeshCacheBust());
  var _modules_loaded = false;
  async function _load_modules() {
    if (_modules_loaded) return;

    const moduleUrls = [
      _mod_base + 'facemesh-core.js' + _mod_suffix,
      _mod_base + 'facemesh-processor.js' + _mod_suffix,
      _mod_base + 'facemesh-emotions.js' + _mod_suffix,
      _mod_base + 'facemesh-draw.js' + _mod_suffix,
    ];

    const [core, processor, emotions, draw_mod] = await Promise.all(moduleUrls.map((url) => {
      return import(url).catch((err) => {
        console.error('[FacemeshAT] Failed to import module: ' + url, err);
        throw err;
      });
    }));

    // Wire cross-module function references into S
    S.load_lib = (options) => core.fm_load_lib(S, options);
    S.emotion_detection = (rgba, bb, options) => emotions.fm_emotion_detection(S, rgba, bb, options);
    S.draw = (faces, w, h, options) => draw_mod.fm_draw(S, faces, w, h, options);
    S.process_video_buffer = (rgba, w, h, options) => processor.fm_process_video_buffer(S, rgba, w, h, options);

    _FacemeshAT.path_adjusted = core.fm_path_adjusted;

    _modules_loaded = true;
  }

  async function init(_worker, param) {
    await _load_modules();

    const coreUrl = _mod_base + 'facemesh-core.js' + _mod_suffix;
    const core = await import(coreUrl).catch((err) => {
      console.error('[FacemeshAT] Failed to import init module: ' + coreUrl, err);
      throw err;
    });
    await core.fm_init(S, _worker, param);
  }

  function _onmessage(e) {
    let t = performance.now()
    let data = (typeof e.data === "string") ? JSON.parse(e.data) : e.data;

    if (data.options) {
      S.flip_canvas = data.options.flip_canvas
    }

    if (data.canvas) {
      S.canvas = data.canvas
      S.context = S.canvas.getContext("2d")
    }

    if (data.rgba) {
      S.cw = data.w
      S.ch = data.h
      S.process_video_buffer(data.rgba, S.cw, S.ch, data.options);
      data.rgba = undefined
    }

    if (data.posenet) {
      S.posenet = data.posenet
      S.pose_w = data.w
      S.pose_h = data.h
      S.handpose = data.handpose
      data.posenet = undefined
      data.handpose = undefined

      S.flip_canvas = data.flip_canvas

      if (S.handpose) {
        S.handpose_last = S.handpose
        S.handpose_last_timestamp = t
      }
      else {
        S.handpose = S.handpose_last
        if (t - S.handpose_last_timestamp > 500)
          S.handpose_last = undefined
      }

      if (data.draw_canvas) {
        S.cw = data.w
        S.ch = data.h
        if (data.facemesh) {
          S.eyes = data.facemesh[0].eyes
          data.facemesh[0].bb = {x:0, y:0, w:S.cw, h:S.ch}
        }
        S.draw(data.facemesh||[], data.w, data.h, {draw_canvas:true})
      }
    }

    data = undefined
  }

  var _FacemeshAT = {
    init,
    path_adjusted: function(url) { return url }, // placeholder until modules load
  };

  if (is_worker) {
    onmessage = _onmessage
  }
  else {
    _FacemeshAT.onmessage = _onmessage
  }

  return _FacemeshAT;
})();
