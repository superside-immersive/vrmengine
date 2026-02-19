// mocap_lib_module.js — Orchestrator for body/hand/face tracking
// Refactored: Step 2B — sub-modules in js/tracking/mocap-*.js
// Original: 1970 lines → orchestrator ~280 lines + 5 sub-modules

import { PoseAT_load_lib, HandsAT_load_lib, create_mediapipe_hand_landmarker } from './tracking/mocap-mediapipe-bridge.js';
import { PoseAT_process_video_buffer, HandsAT_process_video_buffer } from './tracking/mocap-video-processor.js';

const is_worker = (typeof window !== "object");

function path_adjusted(url) {
  if (!is_worker && !/^\w+\:/i.test(url)) {
    url = url.replace(/^(\.?\/?)([\w\@])/, "$1js/$2")
  }
  return url
}

async function load_scripts(url) {
  if (is_worker) {
    // Worker is at js/tracking/, resources are at js/ — prepend ../
    if (!/^\w+\:/i.test(url) && !/^\.\.\//.test(url)) {
      url = url.replace(/^(\.\/)?/, '../')
    }
    importScripts(url)
  }
  else {
    return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.onload = () => { resolve() };
      script.src = path_adjusted(url);
      document.head.appendChild(script);
    });
  }
}

function Core(AT) {

// --- Shared state object (replaces closure variables) ---
const S = {
  // Environment & utilities
  is_worker,
  path_adjusted,
  load_scripts,
  postMessageAT: null,

  // Canvas (set by _onmessage)
  canvas: undefined,
  context: undefined,
  _canvas_hands: undefined,
  _canvas_hands_worker: undefined,
  canvas_hands: undefined,

  // Init flags
  posenet_initialized: false,
  handpose_initialized: false,
  holistic_initialized: false,
  human_initialized: false,

  // Config flags (set during PoseAT_init/HandsAT_init)
  use_human: undefined,
  use_mixed_human: undefined,
  use_tfjs: undefined,
  use_tfjs_posenet: undefined,
  use_mediapipe: undefined,
  use_blazepose: undefined,
  use_movenet: undefined,
  use_holistic: undefined,
  use_mediapipe_hands: undefined,
  use_mediapipe_hand_landmarker: undefined,
  use_mediapipe_pose_landmarker: undefined,
  use_human_only: undefined,
  use_human_pose: undefined,
  use_human_hands: undefined,
  use_mobilenet: undefined,
  use_hands_worker: undefined,
  use_hands_worker_parallel: undefined,

  // Model references
  posenet: undefined,
  posenet_model: undefined,
  handpose_model: undefined,
  holistic_model: undefined,
  human: undefined,
  pose_landmarker: undefined,
  holistic_landmarker: undefined,
  mediapipe_hand_landmarker: null, // set below

  // Pose state
  pose_model_quality: undefined,
  pose_model_z_depth_scale: undefined,
  shoulder_width: undefined,
  pose_last: undefined,

  // Worker state
  hands_worker: undefined,
  hands_worker_data: undefined,
  hands_worker_pose: undefined,
  hands_worker_ready: undefined,
  resolve_hands_worker_parallel: undefined,

  // Object detection
  object_detection_worker: undefined,
  object_detection_worker_ready: undefined,
  object_detection_data: undefined,

  // Counters & FPS
  no_hand_countdown: 0,
  no_hand_countdown_max: 3,
  fps: 0,
  fps_count: 0,
  fps_ms: 0,
  skip_hand_countdown: 0,

  // Eyes / face
  eyes: undefined,
  eyes_xy_last: [[0,0],[0,0]],
  use_mediapipe_facemesh: true,
  use_faceLandmarksDetection: true,
  use_human_facemesh: undefined,
  facemesh_version: undefined,
  gray: undefined,
  gray_w: undefined,
  gray_h: undefined,
  _t_list: undefined,

  // Timing
  vt: undefined,
  vt_offset: 0,
  vt_last: -1,

  // Score
  score_threshold: undefined,

  // Filters & clip data
  data_filter: [],
  hand_clip: [],
};

// Create mediapipe hand landmarker adapter
S.mediapipe_hand_landmarker = create_mediapipe_hand_landmarker(S);


// --- Init ---

function init_common(_worker, param, _onmessage) {
  this.AT._worker = _worker;

  if (is_worker) {
    onmessage = (e)=>{ _onmessage.call(this, e); }
  }
  else {
    this.AT.onmessage = (e)=>{ _onmessage.call(this, e); }
  }

  if (param) {
    param = (function () {
      var _param = {};
      param.forEach((p)=>{
        if (/(\w+)\=(\w+)/.test(p))
          _param[RegExp.$1] = RegExp.$2
      });
      return {
        get: function (id) {
          return _param[id]
        }
      };
    })();
  }
  else {
    param = new URLSearchParams(self.location.search.substring(1));
  }

  return param;
}

async function PoseAT_init(_worker, param) {

function _onmessage(e) {
  let t = performance.now()
  let data = (typeof e.data === "string") ? JSON.parse(e.data) : e.data;

  if (data.canvas) {
    S.canvas = data.canvas
    S.context = S.canvas.getContext("2d")
  }
  if (data.canvas_hands)
    S._canvas_hands = data.canvas_hands;
  S.canvas_hands = (data.options.use_canvas_hands && !data.options.use_holistic) ? S._canvas_hands : null;
  if (data.canvas_hands) console.log('(Transferred - canvas_hands)');

  if (data.canvas_hands_worker)
    S._canvas_hands_worker = data.canvas_hands_worker;

  if (data.rgba) {
    process_video_buffer.call(this, data.rgba, data.w,data.h, data.options);

    data.rgba = undefined
    data = undefined
  }
}

// common
param = init_common.call(this, _worker, param, _onmessage);

//if (is_worker) this.AT._canvas_for_imagedata = new OffscreenCanvas(1,1);

if (S.use_human || param.get('use_human')) {
  S.use_human_only = true

  S.use_human = true
  S.use_tfjs = false
  S.use_tfjs_posenet = false

  S.use_human_pose = true
  S.use_human_hands = true
}
else if (S.use_mixed_human || param.get('use_mixed_human')) {
  S.use_mixed_human = true

  S.use_human = true
  S.use_tfjs = true
  S.use_tfjs_posenet = true

  S.use_human_hands = true
}
else {
  S.use_human = false
  S.use_tfjs = true
  S.use_tfjs_posenet = true
}

if (S.use_blazepose || param.get('use_blazepose')) {
  S.use_blazepose = true
//S.use_mediapipe=true
//S.use_holistic=true
}

if (S.use_tfjs && (S.use_mediapipe || param.get('use_mediapipe'))) {
  S.use_mediapipe = true
  if (S.use_human) {
// use human for pose, mediapipe for hands
    S.use_tfjs = false
    S.use_tfjs_posenet = false

    S.use_human_pose = true
    S.use_human_hands = false
  }
  else if (S.use_holistic || param.get('use_holistic')) {
    S.use_holistic = true
  }
}

// new hand-pose-detection
// assumed mediapipe version for now
if (!S.use_human || !S.use_human_hands) S.use_mediapipe_hands = true;

//if (S.use_mediapipe || S.use_mediapipe_hands) process=undefined;

if (S.use_movenet || param.get('use_movenet')) {
  S.use_movenet = true
}

S.use_mediapipe_hand_landmarker = S.use_mediapipe_pose_landmarker = S.use_mediapipe;

S.use_mobilenet = param.get('use_mobilenet');

if (is_worker) {
  importScripts('./one_euro_filter.js');
}

S.postMessageAT('(Pose worker initialized)')
S.postMessageAT('OK')
}

async function HandsAT_init(_worker, param) {

function _onmessage(e) {
  let t = performance.now()
  let data = (typeof e.data === "string") ? JSON.parse(e.data) : e.data;

  if (data.canvas) {
    S.canvas = data.canvas
    S.context = S.canvas.getContext("2d")
  }
  if (data.canvas_hands)
    S._canvas_hands = data.canvas_hands;
  S.canvas_hands = (data.options.use_canvas_hands && !data.options.use_holistic) ? S._canvas_hands : null;
  if (data.canvas_hands) console.log('(Transferred - canvas_hands_workers)');

  if (data.rgba) {
    process_video_buffer.call(this, data.rgba, data.w,data.h, data.options);

    data.rgba = undefined
    data = undefined
  }
}

// common
  param = init_common.call(this, _worker, param, _onmessage);

  if (is_worker) importScripts('./one_euro_filter.js');

  S.postMessageAT('(Hands worker initialized)');
  S.postMessageAT('OK');
}


// --- Process video buffer (dispatcher) ---

async function process_video_buffer(rgba, w, h, options) {
  S.hand_clip.length = 0;

  try {
    await this.load_lib(options);
  }
  catch (err) {
    console.error(err);
    S.postMessageAT('Facemesh/PoseNet/Handpose ERROR:' + err);
    return;
  }

  const frame = { rgba, w, h, options };

  if (this.AT.type == 'PoseAT') {
    await PoseAT_process_video_buffer(S, frame);
  }
  else if (this.AT.type == 'HandsAT') {
    await HandsAT_process_video_buffer(S, frame);
  }
}


// --- Core setup ---
this.AT = AT;

AT.path_adjusted = path_adjusted;

S.postMessageAT = (is_worker) ? postMessage.bind(self) : function (msg, transfer) {
  AT._worker.onmessage({data:msg});
};

if (AT.type == 'PoseAT') {
  this.init = PoseAT_init;
  this.load_lib = (options) => PoseAT_load_lib(S, options);
}
else if (AT.type == 'HandsAT') {
  this.init = HandsAT_init;
  this.load_lib = (options) => HandsAT_load_lib(S, options);
}

// core END

}

export { Core };
