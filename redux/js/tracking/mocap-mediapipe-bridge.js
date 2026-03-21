// mocap-mediapipe-bridge.js — ML model loading: MediaPipe, TF.js, Human.js
// Extracted from mocap_lib_module.js (Step 2B)

function _privacy_local_only_url(url) {
  if (/^https?:\/\//i.test(url)) {
    throw new Error('External script URL blocked by privacy mode: ' + url);
  }
  return url;
}

function wait_for_tasks_vision_loader() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timerID = setInterval(() => {
      if (self.__saTasksVisionLoaderError) {
        clearInterval(timerID);
        reject(self.__saTasksVisionLoaderError);
        return;
      }

      if (self.__saTasksVisionLoaderPromise) {
        clearInterval(timerID);
        Promise.resolve(self.__saTasksVisionLoaderPromise).then(resolve).catch(reject);
        return;
      }

      if ('FilesetResolver' in self) {
        clearInterval(timerID);
        resolve();
        return;
      }

      if ((Date.now() - start) > 10000) {
        clearInterval(timerID);
        reject(new Error('Timed out waiting for MediaPipe Tasks loader'));
      }
    }, 50);
  });
}

/**
 * Load MediaPipe Vision common dependencies.
 * @param {Object} S - Shared state object
 * @returns {Promise<Object>} Vision filesetResolver instance
 */
export async function load_vision_common(S) {
  await S.load_scripts('@mediapipe/tasks/tasks-vision/XRA_module_loader.js');
  await wait_for_tasks_vision_loader();

  const vision = await FilesetResolver.forVisionTasks(
// path/to/wasm/root
//"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
S.path_adjusted('@mediapipe/tasks/tasks-vision/wasm')
  );

  return vision;
}

function get_tasks_vision_delegate(options) {
  const requested = String((options && (options.model_inference_device || options.delegate)) || '').toUpperCase();
  if (requested === 'CPU' || requested === 'GPU') return requested;

  const ua = String((self && self.navigator && self.navigator.userAgent) || '').toLowerCase();
  const vendor = String((self && self.navigator && self.navigator.vendor) || '').toLowerCase();
  const isiPadLike = /ipad|iphone|ipod/.test(ua) || (/macintosh/.test(ua) && 'ontouchend' in self);
  const isWebKitSafari = /apple/.test(vendor) && /safari/.test(ua) && !/crios|fxios|edgios|chrome|android/.test(ua);

  return (isiPadLike || isWebKitSafari) ? 'CPU' : 'GPU';
}

function get_tasks_vision_video_input(detector, input) {
  if (typeof ImageData !== 'undefined' && input instanceof ImageData) {
    let canvas = detector.__saVideoInputCanvas;
    if (!canvas || canvas.width !== input.width || canvas.height !== input.height) {
      canvas = (typeof OffscreenCanvas !== 'undefined')
        ? new OffscreenCanvas(input.width, input.height)
        : self.document.createElement('canvas');
      canvas.width = input.width;
      canvas.height = input.height;
      detector.__saVideoInputCanvas = canvas;
    }
    detector.__saVideoInputCanvas.getContext('2d').putImageData(input, 0, 0);
    return detector.__saVideoInputCanvas;
  }
  return input;
}

function run_tasks_vision_detection(detector, input, nowInMs) {
  return detector.detectForVideo(get_tasks_vision_video_input(detector, input), nowInMs);
}


/**
 * Create MediaPipe hand landmarker adapter.
 * @param {Object} S - Shared state object
 * @returns {Object} Hand landmarker with load() and setup() methods
 */
export function create_mediapipe_hand_landmarker(S) {
  return {

    load: async function () {
  const vision = await load_vision_common(S);
  const delegate = get_tasks_vision_delegate(S.worker_options || {});

  const f = [];
  const score_list = [0.5, 0.1];//0.3, 0.1];
  for (let i = 0; i < score_list.length; i++) {
    const score = score_list[i];
    f[i] = await HandLandmarker.createFromOptions(
vision,
{
  baseOptions: {
    modelAssetPath: S.path_adjusted('@mediapipe/tasks/hand_landmarker.task'),
    delegate: delegate
  },
  runningMode: 'VIDEO',

  numHands: 2,
  minHandDetectionConfidence: score,
  minHandPresenceConfidence: 0.5,//score,
  minTrackingConfidence: score,
}
    );
  }

  console.log('Hand Landmarker delegate:' + delegate);

  let f_index = 0;

  this.setup();

  console.log('(Mediapipe Hand Landmarker initialized)');
  S.postMessageAT('(Mediapipe Hand Landmarker initialized)');

  return {
set_score: (()=>{
  let timestamp = 0;
  return function (w,h, options) {
    if (!options.pose_enabled) {
      f_index = 1;
      return;
    }
//f_index=1;return;
//    let s = Math.min(Math.max(Math.max(w,h)/S.shoulder_width-5, 0)/5, 2);
    let s = Math.min(Math.max(Math.max(w,h)/S.shoulder_width-7.5, 0), 1);
    let index = (options.minHandDetectionConfidence != null) ? ((options.minHandDetectionConfidence < 0.5) ? 1 : 0) : Math.ceil(s);
//console.log(s, index);
    if (index != f_index) {
      const t = Date.now();
      if (t > timestamp + 1000) {
        f_index = index;
        timestamp = t;
//console.log(f_index, timestamp);
      }
    }
  };
})(),

estimateHands: (()=>{
  let initialized;
  return function (video, nowInMs) {
    let result;
    if (!initialized) {
      initialized = true;
      f.forEach(d=>{
        result = run_tasks_vision_detection(d, video, nowInMs);
      });
    }
    else {
      result = run_tasks_vision_detection(f[f_index], video, nowInMs);
    }
//console.log(result)

// left and right hand labels swapped/handednesses=>handedness in v0.10.5
    result.handedness?.forEach(hand=>{hand.forEach(h=>{
const label = (h.categoryName == 'Left') ? 'Right' : 'Left';
h.categoryName = h.displayName = label;
    })});

//    result.worldLandmarks?.forEach((hand,i)=>{ result.worldLandmarks[i] = hand.map(f=>[f.x,f.y,f.z]); });

    return Promise.resolve(Object.assign({ multiHandLandmarks:result.landmarks, multiHandedness:result.handedness?.map(h=>h[0]) }, result));

//    return Promise.resolve(Object.assign({ multiHandLandmarks:result.landmarks, multiHandedness:result.handednesses?.map(h=>h[0]) }, result));
  };
})(),
  };
    },

    setup: function () {
S.data_filter[1] = {
  Left: {
    landmarks: [],
  },
  Right: {
    landmarks: [],
  },
};
for (const d of ['Left', 'Right']) {
  for (let i = 0; i < 21; i++) {
    S.data_filter[1][d].landmarks[i] = new OneEuroFilter(30, 1,1/1000,1, 3);
  }
}
    },

  };
}


/**
 * Load pose detection libraries (MediaPipe, TF.js, Human.js, etc.)
 * @param {Object} S - Shared state object
 * @param {Object} options - Detection options
 */
export async function PoseAT_load_lib(S, options) {
options = options || {};
S.worker_options = options;

if (options.use_holistic_legacy && !S.holistic_initialized) {
  try {
    await S.load_scripts('@mediapipe/holistic/holistic.js');

    await (async ()=>{
      var holistic = new Holistic({locateFile: (file) => {
return S.path_adjusted('@mediapipe/holistic/' + file);
//return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }});

      S.pose_model_quality = options.model_quality || '';
      holistic.setOptions({
  modelComplexity: 1,
smoothLandmarks: true,
minDetectionConfidence: 0.5,
minTrackingConfidence: 0.5,
refineFaceLandmarks: true,
      });

      var holistic_results;
      holistic.onResults((results)=>{
holistic_results = results;
      });

      await holistic.initialize();

      S.holistic_model = {
predict: async function (img, config, timestamp) {
  await holistic.send({image:img}, timestamp);
  return holistic_results;
}
      };

      S.holistic_initialized = true
    })();

    console.log('(Mediapipe Holistic initialized)')
    S.postMessageAT('(Mediapipe Holistic initialized)')
  }
  catch (err) {
    options.use_holistic_legacy = false;
    console.warn('Mediapipe Holistic legacy unavailable, fallback to non-legacy pipeline.', err);
    S.postMessageAT('(Mediapipe Holistic legacy unavailable - fallback)');
  }
}

if (!S.use_mediapipe_pose_landmarker && !options.use_holistic && S.use_tfjs && !S.posenet_initialized) {
  if (S.use_mediapipe && S.use_blazepose) {
    await S.load_scripts('@mediapipe/pose/pose.js');//'https://cdn.jsdelivr.net/npm/@mediapipe/pose');
  }

  if (!(((S.use_mediapipe && S.use_blazepose) || S.use_human_pose) && S.use_mediapipe_hands)) {
// https://blog.tensorflow.org/2020/03/face-and-hand-tracking-in-browser-with-mediapipe-and-tensorflowjs.html
    let tfjs_version = '';//'@3.9.0';//'@3.5.0';//'@3.3.0';//@2.8.5';
    await S.load_scripts(_privacy_local_only_url('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs' + tfjs_version));
    console.log('Use TFJS (pose/hands)')
  }
}

if (S.use_human && !S.human_initialized) {
  await S.load_scripts('./human/dist/human.js');

  S.human = new Human.default();//(is_worker) ? new Human.default() : new Human();
//import Human from './human/dist/human.esm.js';
//human = new Human();

  S.human.load({
    backend: 'webgl',
//warmup: 'full',

    filter: {
      enabled: false
    },

    gesture: {
      enabled: false
    },

    face: {
      enabled: false
    },

    body: {
      enabled: S.use_human_pose,
//      maxDetections: 1,
      maxDetected: 1,
      modelPath: S.path_adjusted('./human/models/' + ((S.use_blazepose) ? 'blazepose' : ((S.use_movenet) ? 'movenet-thunder' : 'posenet')) + '.json'),
//modelType: 'posenet-resnet', modelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/resnet50/quant2/model-stride16.json', outputStride: 16,
//      modelType: 'ResNet', modelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/resnet50/quant2/model-stride16.json', outputStride: 16,
//scoreThreshold: 0.1,
    },

    hand: {
      enabled: S.use_human_hands,
//      maxHands: 2,
      maxDetected: 2,
      rotation: true,
      detector: {
        modelPath: S.path_adjusted('./human/models/handtrack.json')//handdetect.json')//
      },
      skeleton: {
        modelPath: S.path_adjusted('./human/models/handskeleton.json')
      },
//iouThreshold:0.3, scoreThreshold:0.75, skipFrames:2
/*
iouThreshold: 0.3,
scoreThreshold:0.5,
*/
skipFrames:5,
minConfidence: 0.2
    }
  });
//human.warmup().then(()=>{console.log('OK')});

  console.log('(Human - body:' + !!S.use_human_pose + '/hand:' + !!S.use_human_hands + ')')

  S.human_initialized = true
}

if (!options.use_holistic_legacy && !S.use_human_pose) {

if ((options.use_holistic_landmarker) ? !S.holistic_initialized : !S.posenet_initialized) {
/*
  await S.load_scripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js');
  tf.wasm.setWasmPaths('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/');
  await tf.setBackend("wasm")
*/
  if (S.use_mediapipe_pose_landmarker) {
    const vision = await load_vision_common(S);
    const delegate = get_tasks_vision_delegate(options);

    if (options.use_holistic_landmarker) {
      S.holistic_landmarker = await HolisticLandmarker.createFromOptions(
vision,
{
  baseOptions: {
    modelAssetPath: S.path_adjusted('@mediapipe/tasks/' + 'holistic_landmarker' + '.task'),
    delegate: delegate
  },
  runningMode: 'VIDEO',

  outputFaceBlendshapes: true
}
      );

  console.log('Holistic Landmarker delegate:' + delegate);

      S.mediapipe_hand_landmarker.setup();
    }
    else {
      S.pose_model_quality = options.model_quality || '';
      S.pose_landmarker = await PoseLandmarker.createFromOptions(
vision,
{
  baseOptions: {
    modelAssetPath: S.path_adjusted('@mediapipe/tasks/pose_landmarker_full.task'),
    delegate: delegate
  },
  runningMode: 'VIDEO',
//minPoseDetectionConfidence:0.8, minPosePresenceConfidence:0.8, minTrackingConfidence:0.8,
  numPoses: 1
}
      );
      console.log('Pose Landmarker delegate:' + delegate);
      console.log('Pose model quality:' + (S.pose_model_quality||'Normal'));
    }

    S.data_filter[0] = {
      landmarks: [],
      worldLandmarks: [],
    };
    for (let i = 0; i < 33; i++) {
      S.data_filter[0].landmarks[i] = new OneEuroFilter(30, 1,1,2, 3);
      S.data_filter[0].worldLandmarks[i] = new OneEuroFilter(30, 1,1,2, 3);
    }
    S.data_filter[0].poseLandmarks = S.data_filter[0].landmarks;
    S.data_filter[0].poseWorldLandmarks = S.data_filter[0].worldLandmarks;

    S.posenet = {
estimatePoses: function (video, dummy, nowInMs) {
  const landmarker = (options.use_holistic_landmarker) ? S.holistic_landmarker : S.pose_landmarker;
  let result = run_tasks_vision_detection(landmarker, video, nowInMs);
//console.log(result)

  let pose_names;
  let result_hands, result_face;
  if (options.use_holistic_landmarker) {
// https://github.com/google/mediapipe/blob/master/mediapipe/tasks/web/vision/holistic_landmarker/holistic_landmarker_result.ts
    pose_names = ['poseLandmarks', 'poseWorldLandmarks'];
    result_face = { multiFaceLandmarks:result.faceLandmarks };

    const multiHandLandmarks = [];
    const multiHandedness = [];
    [result.leftHandLandmarks, result.rightHandLandmarks].forEach((hand,i)=>{
      if (hand.length) {
        multiHandLandmarks.push(hand[0]);
// swapped label since v0.10.5
        const label = (i==1)?'Left':'Right';
        multiHandedness.push({ index:i, score:1, categoryName:label, displayName:label });
      }
    });
    result_hands = { multiHandLandmarks:multiHandLandmarks, multiHandedness:multiHandedness };
  }
  else {
    pose_names = ['landmarks', 'worldLandmarks'];
  }

  for (const p of pose_names) {
    const c = result[p]?.[0];
    if (!c) continue;

    for (let i = 0; i < 33; i++) {
      const v = c[i];

//      const v3 = S.data_filter[0][p][i].filter([v.x, v.y, v.z], nowInMs);
//      v.x = v3[0];
//      v.y = v3[1];

      const v3 = S.data_filter[0][p][i].filter([0, 0, v.z], nowInMs);
      v.z = v3[2];
   }
  }

//console.log(Object.assign(result, { poseLandmarks:result[pose_names[0]][0], za:result[pose_names[1]][0] }, result_face, result_hands))

  if (!S._ep_diag) {
    S._ep_diag = true;
    var _lm0 = result[pose_names[0]];
    var _wl0 = result[pose_names[1]];
    console.warn('[estimatePoses] DIAG raw result:', JSON.stringify({
      result_keys: Object.keys(result),
      pose_names: pose_names,
      landmarks_exists: !!_lm0,
      landmarks_len: _lm0?.length || 0,
      landmarks0_len: _lm0?.[0]?.length || 0,
      worldLandmarks_exists: !!_wl0,
      worldLandmarks_len: _wl0?.length || 0,
      worldLandmarks0_len: _wl0?.[0]?.length || 0,
      poseLandmarks_final: !!(_lm0?.[0]),
      za_final: !!(_wl0?.[0])
    }));
  }

  return Promise.resolve(Object.assign(result, { poseLandmarks:result[pose_names[0]][0], za:result[pose_names[1]][0] }, result_face, result_hands));
}
    };

    if (options.use_holistic_landmarker) {
      console.log('(Mediapipe Holistic Landmarker initialized)');
    }
    else {
      console.log('(Mediapipe Pose Landmarker initialized)');
      S.postMessageAT('(Mediapipe Pose Landmarker initialized)');
    }
  }
  else if (S.use_movenet) {
    await S.load_scripts((S.use_mediapipe && S.use_blazepose)?'@mediapipe/pose-detection.js':_privacy_local_only_url('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection'));

    if (S.use_blazepose) {
      const detectorConfig = (S.use_mediapipe) ?
{
  runtime: 'mediapipe',
//  modelType: 'heavy'
//  solutionPath: 'base/node_modules/@mediapipe/pose'
}
:
{
  runtime: 'tfjs',
  enableSmoothing: true,
  modelType: 'full'
};
      S.posenet = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig);

      let msg = '(' + ((S.use_mediapipe) ? 'Mediapipe' : 'TFJS') + ' BlazePose initialized)';
      console.log(msg)
      S.postMessageAT(msg)
    }
    else {
      const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};//{modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};//
      S.posenet = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

      console.log('(MoveNet initialized)')
      S.postMessageAT('(MoveNet initialized)')
    }
  }
  else {
    await S.load_scripts(_privacy_local_only_url('https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet'));

    S.posenet_model = await S.posenet.load((S.use_mobilenet) ?
{
  architecture: 'MobileNetV1',
  outputStride: 16,
//  inputResolution: { width: 640, height: 480 },
  multiplier: 0.75
}
:
{
  architecture: 'ResNet50',
  outputStride: 32,
//  inputResolution: { width: 257, height: 200 },
  quantBytes: 2/2
}
    );

    console.log('(PoseNet initialized)')
    S.postMessageAT('(PoseNet initialized)')
  }

  if (options.use_holistic_landmarker) {
    S.holistic_initialized = true;
  }
  else {
    S.posenet_initialized = true;
  }
}
else {
  if (!options.use_holistic_landmarker && S.use_mediapipe_pose_landmarker && (options.model_quality != null) && (S.pose_model_quality != options.model_quality)) {
    S.pose_model_quality = options.model_quality;
    S.pose_landmarker.setOptions({
      baseOptions: {
        modelAssetPath: S.path_adjusted('@mediapipe/tasks/pose_landmarker_full.task'),
        delegate: "GPU"
      },
    });
    console.log('Pose model quality:' + (S.pose_model_quality||'Normal'));
  }
}

}

S.use_hands_worker = options.pose_enabled && options.use_hands_worker;// = true;
S.use_hands_worker_parallel = (S.use_hands_worker == 2);

if (S.use_hands_worker) {
  if (!S.hands_worker)
    S.handpose_initialized = false;
}
else {
  S.hands_worker_data = null;
  if (!S.handpose_model)
    S.handpose_initialized = false;
}

if (!options.use_holistic && !S.use_human_hands && options.use_handpose && !S.handpose_initialized) {
  if (S.use_hands_worker) {
    await new Promise((resolve)=>{
      S.hands_worker = new Worker('hands_worker.js');
      S.hands_worker.onmessage = function (e) {
var data = ((typeof e.data == "string") && (e.data.charAt(0) === "{")) ? JSON.parse(e.data) : e.data;

if (typeof data === "string") {
  if (data == 'OK') {
    S.hands_worker_ready = true;
    resolve();
  }
  else {
    S.postMessageAT(data);
  }
}
else {
  S.hands_worker_ready = true;
  S.hands_worker_data = data;
  if (S.resolve_hands_worker_parallel) S.resolve_hands_worker_parallel();
}
      };
    });
  }
  else if (S.use_mediapipe_hand_landmarker) {
    S.handpose_model = await S.mediapipe_hand_landmarker.load();
  }
  else {
    await S.load_scripts('@mediapipe/hands/hands.js');//'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');//

    await (async ()=>{
      var hands = new Hands({locateFile: (file) => {
return S.path_adjusted('@mediapipe/hands/' + file);
//return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }});

      hands.setOptions({
maxNumHands: 2,
minDetectionConfidence: 0.5,
minTrackingConfidence: 0.5,
modelComplexity: 1,
      });

      var hands_results;
      hands.onResults((results)=>{
hands_results = results;
      });

      await hands.initialize();

      S.handpose_model = {
estimateHands: async function (img, config) {
  await hands.send({image:img});
  return hands_results;
}
      };
    })();

    console.log('(Mediapipe hands initialized)')
    S.postMessageAT('(Mediapipe hands initialized)')
  }

  S.handpose_initialized = true
}
}


/**
 * Load hand detection library for hands-only worker.
 * @param {Object} S - Shared state object
 * @param {Object} options - Detection options
 */
export async function HandsAT_load_lib(S, options) {
if (!S.handpose_initialized) {
  S.handpose_model = await S.mediapipe_hand_landmarker.load();

  console.log('(Mediapipe hands initialized)')
  S.postMessageAT('(Mediapipe hands initialized)')
}

S.handpose_initialized = true
}
