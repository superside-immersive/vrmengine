// mocap-video-processor.js — Main video frame processing loops
// Extracted from mocap_lib_module.js (Step 2B)

import { get_pose_index } from './mocap-constants.js';
import { pose_adjust, process_facemesh } from './mocap-pose-processor.js?v=20260321-7';
import { hands_adjust, is_hand_visible, get_hand_canvas } from './mocap-hands-processor.js';

/**
 * Process a video frame for pose+hands+face detection (PoseAT path).
 * @param {Object} S - Shared state object
 * @param {Object} frame - { rgba, w, h, options } (mutable)
 */
export async function PoseAT_process_video_buffer(S, frame) {
  let rgba = frame.rgba;
  const w = frame.w;
  const h = frame.h;
  const options = frame.options;

  async function process_hands_worker(_pose=pose) {
    if (!S.hands_worker_ready) await new Promise((resolve)=>{ setTimeout(resolve, 0); });

    if (S.hands_worker_ready) {
S.hands_worker_pose = _pose;

options.pose = _pose;
options.shoulder_width = S.shoulder_width;

let _rgba = rgba;
if (S.use_hands_worker_parallel) {
  _rgba = await createImageBitmap(_rgba);
}
else if (!(_rgba instanceof ImageBitmap)) {
  rgba = undefined;
  frame.rgba = undefined;
  _rgba = _rgba.data.buffer;
}

let data_to_transfer = [_rgba];
let data = { w:w, h:h, options:options, rgba:_rgba };
if (S._canvas_hands_worker) {
  data.canvas_hands = S._canvas_hands_worker;
  data_to_transfer.push(S._canvas_hands_worker);
}

S.hands_worker.postMessage(data, data_to_transfer);

S._canvas_hands_worker = null;

data_to_transfer.length = 0;
data_to_transfer = undefined;
data.rgba = _rgba = undefined;

S.hands_worker_ready = false;
    }
  }

  let _t = performance.now();

  if (options.timestamp != null) {
    S.vt = options.timestamp + S.vt_offset;
    if (S.vt <= S.vt_last + 1) {
      S.vt_offset = (S.vt_last - options.timestamp) + 16.6667;
      S.vt = options.timestamp + S.vt_offset;;
    }
    S.vt_last = S.vt;
  }
  else {
    S.vt = _t;
  }
//console.log(S.vt)

  if (rgba instanceof ArrayBuffer)
    rgba = new ImageData(new Uint8ClampedArray(rgba), w,h)
//rgba = tf.browser.fromPixels(rgba)

  let pose, hands, facemesh;
  S.score_threshold = (S.use_movenet) ? 0.3 : 0.5;

//  S.use_mediapipe_facemesh = true
//  S.use_faceLandmarksDetection = true

  S.pose_model_z_depth_scale = options.z_depth_scale || 3;

  if (options.use_holistic_legacy) {
    const result = await S.holistic_model.predict(rgba, {}, S.vt);
//console.log(result)

    pose = pose_adjust(S, result, w, h, options);
    hands = hands_adjust(S, result, S.vt, pose, w, h, options);

    if (result.faceLandmarks && result.faceLandmarks.length) {
      let faces = process_facemesh(S, {multiFaceLandmarks:[result.faceLandmarks]}, w,h, {x:0, y:0, w:w, h:h, ratio:0, scale:1}, rgba);

      let face = faces[0]
      let sm = face.scaledMesh;
// NOTE: pass the full scaledMesh as it is needed to be passed and drawn on the facemesh worker
      facemesh = { faces:[{ faceInViewConfidence:face.faceScore||face.faceInViewConfidence||0, scaledMesh:sm, mesh:face.mesh, eyes:S.eyes, bb_center:face.bb_center, emotion:face.emotion, rotation:face.rotation }] };
//console.log(facemesh)
    }
  }
  else if (S.use_human_only) {
    const result = await S.human.detect(rgba, {hand:{enabled:options.use_handpose}})
//    console.log(result)

    pose = result.body[0]
    hands = result.hand

// human v2.0+
    if (pose.keypoints && pose.keypoints.length && Array.isArray(pose.keypoints[0].position)) {
      pose.keypoints.forEach((kp)=>{
        kp.position = {x:kp.position[0], y:kp.position[1]}
      });
    }
  }
  else {//if (S.no_hand_countdown <= 0) {
    let _use_hands_worker_parallel;
    if (S.use_hands_worker_parallel && S.pose_last && is_hand_visible(S, S.pose_last, w, h)) {
      _use_hands_worker_parallel = true;
      S.hands_worker_data = null;
      await process_hands_worker(S.pose_last);
    }

    let result;
    if (options.pose_enabled) {
      result = await ((S.use_human_pose) ? S.human.detect(rgba) : ((S.use_movenet) ? S.posenet.estimatePoses(rgba, {}, S.vt) : S.posenet_model.estimateSinglePose(rgba, {})));
      pose = pose_adjust(S, (S.use_human_pose) ? result.body[0] : result, w, h, options);
    }
    if (!window._vp_kp3d_found) {
      window._vp_frames = (window._vp_frames || 0) + 1;
      var _kp3d = pose?.keypoints3D;
      if (_kp3d?.length) {
        window._vp_kp3d_found = true;
        console.warn('[video-proc] FIRST keypoints3D at frame ' + window._vp_frames + ', len=' + _kp3d.length);
      } else if (window._vp_frames === 60) {
        console.error('[video-proc] NO keypoints3D after 60 frames. pose type=' + typeof pose + ', keys=' + (pose ? Object.keys(pose) : 'null'));
      }
    }

    if (S.use_hands_worker_parallel) S.pose_last = pose;

    if (options.object_detection?.enabled) {
      if (!S.object_detection_worker) {
        await new Promise((resolve)=>{
          S.object_detection_worker = new Worker('object_detection_worker.js');
          S.object_detection_worker.onmessage = function (e) {
let data = ((typeof e.data == "string") && (e.data.charAt(0) === "{")) ? JSON.parse(e.data) : e.data;

if (typeof data === "string") {
  if (data == 'OK') {
    console.log('(Object Detection worker loaded)');
    resolve();
  }
  S.object_detection_worker_ready = true;
}
else {
  S.object_detection_data = data;
//  console.log(Date.now(), S.object_detection_data);
}
          };
        });
      }
      else if (S.object_detection_worker_ready) {
const hand_visible = is_hand_visible(S, pose, w, h, 0.2);
if (hand_visible) {
  S.object_detection_worker_ready = false;

  options.pose = pose;
  options.hand_visible = hand_visible;
  options.vt = S.vt;

  let _rgba = await createImageBitmap(rgba);

  let data_to_transfer = [_rgba];
  let data = { w:w, h:h, options:options, rgba:_rgba };
  S.object_detection_worker.postMessage(data, data_to_transfer);

  _rgba = undefined;
}
else {
  S.object_detection_data = null;
}
      }
    }
    else {
      S.object_detection_data = null;
    }

    if (options.use_holistic_landmarker) {
      hands = hands_adjust(S, result, S.vt, pose, w, h, options);

      if (result.faceLandmarks && result.faceLandmarks.length) {
        let faces = process_facemesh(S, {multiFaceLandmarks:result.faceLandmarks}, w,h, {x:0, y:0, w:w, h:h, ratio:0, scale:1}, rgba);

        let face = faces[0]
        let sm = face.scaledMesh;
// NOTE: pass the full scaledMesh as it is needed to be passed and drawn on the facemesh worker
        facemesh = { faces:[{ faceInViewConfidence:face.faceScore||face.faceInViewConfidence||0, scaledMesh:sm, mesh:face.mesh, eyes:S.eyes, bb_center:face.bb_center, emotion:face.emotion, rotation:face.rotation, faceBlendshapes:result.faceBlendshapes?.[0] }] };
//console.log(facemesh)
      }
    }
    else if (options.use_handpose && (S.use_hands_worker || ((S.handpose_model || S.use_human_hands) && (S.use_hands_worker || (S.skip_hand_countdown-- <= 0))))) {
      S.skip_hand_countdown = options.skip_hand_countdown_max||0;
      if (!options.pose_enabled || is_hand_visible(S, pose, w, h)) {
        if (S.use_hands_worker_parallel) {
          if (_use_hands_worker_parallel && !S.hands_worker_data) await new Promise((resolve)=>{ S.resolve_hands_worker_parallel = resolve; });
          S.resolve_hands_worker_parallel = null;
        }
        else if (S.use_hands_worker) {
          await process_hands_worker();
        }
        else if (S.handpose_model) {
          S.handpose_model.set_score?.(w,h, options);
          hands = await S.handpose_model.estimateHands(get_hand_canvas(S, pose, rgba, w, h), S.vt);
          hands = hands_adjust(S, hands, S.vt, pose, w, h, options);
        }
        else {
          const result = await S.human.detect(rgba)
          hands = result.hand
        }
        S.no_hand_countdown = S.no_hand_countdown_max
      }
      else {
        if (S.use_hands_worker_parallel) {
// basically dummy to wait for hands worker to finish
          if (_use_hands_worker_parallel && !S.hands_worker_data) await new Promise((resolve)=>{ S.resolve_hands_worker_parallel = resolve; });
// ignore use_hands_worker_parallel for next frame
          S.pose_last = null;
        }

        S.no_hand_countdown--;
// discard outdated data when hands are hidden
        S.hands_worker_data = null;
      }
    }
  }
/*
  else {
    let p_list = [(S.use_human_pose) ? S.human.detect(rgba).then(result=>result.body[0]) : ((S.use_movenet) ? S.posenet.estimatePoses(rgba, {}, S.vt) : S.posenet_model.estimateSinglePose(rgba, {})).then(_pose=>_pose)]
    if (options.use_handpose && (S.handpose_model || S.use_human_hands) && (S.skip_hand_countdown-- <= 0)) {
      S.skip_hand_countdown = options.skip_hand_countdown_max||0
      p_list.push((S.handpose_model) ? S.handpose_model.estimateHands(get_hand_canvas(S), S.vt).then(_hands=>_hands) : S.human.detect(rgba).then(result=>result.hand));
    }

    const values = await Promise.all(p_list);

    pose = pose_adjust(S, values[0], w, h, options)
    if (p_list.length > 1) {
      if (is_hand_visible(S, pose, w, h)) {
        hands = hands_adjust(S, values[1], S.vt, pose, w, h, options)
        S.no_hand_countdown = S.no_hand_countdown_max
      }
      else {
        S.no_hand_countdown--
      }
    }
  }
*/

  _t = performance.now() - _t +(options._t||0);

  S.fps_ms += _t
  if (++S.fps_count >= 20) {
    S.fps = 1000 / (S.fps_ms/S.fps_count)
    S.fps_count = S.fps_ms = 0
  }

  let _t_hands, fps_hands;

  if (S.use_hands_worker_parallel && S.hands_worker_data) {
    hands = S.hands_worker_data.handpose;
    S.hands_worker_data = null;
  }

  if (S.hands_worker_data) {
//console.log(S.hands_worker_data)
    _t_hands = S.hands_worker_data._t;
    fps_hands = S.hands_worker_data.fps;

    hands = S.hands_worker_data.handpose;
    for (const id of [9,10]) {
      const hand = hands.find(h=>h.label==((id==9)?'Left':'Right'));
      if (!hand) continue;

      const kp = pose.keypoints[get_pose_index(id)];
      if (kp.score < S.score_threshold) continue;

      const kp_hands = S.hands_worker_pose.keypoints[get_pose_index(id)];
      if (kp_hands.score < S.score_threshold) continue;

      const x_offset = kp.position.x - kp_hands.position.x;
      const y_offset = kp.position.y - kp_hands.position.y;
      hand.keypoints.forEach(k=>{
        k[0] += x_offset;
        k[1] += y_offset;
      });
    }

    S.hands_worker_data = null;
  }
  else if (hands) {
    _t_hands = _t;
    fps_hands = S.fps;
    hands = hands.filter((h)=>h.annotations&&Object.keys(h.annotations).length);
  }
 
  if (facemesh) {
    facemesh._t = _t
    facemesh.fps = S.fps
  }

  S.postMessageAT(JSON.stringify({ posenet:pose, object_detection:S.object_detection_data, handpose:hands, facemesh:facemesh, _t:_t, fps:S.fps, _t_hands:_t_hands, fps_hands:fps_hands }));

  // Broadcast raw 3D landmarks for VRMDirect Fase 2 (main thread reads via BroadcastChannel)
  try {
    if (pose && pose.keypoints3D && pose.keypoints3D.length) {
      var _posePacket = {
        lms: (pose.keypoints3D_raw && pose.keypoints3D_raw.length === pose.keypoints3D.length)
          ? pose.keypoints3D_raw : pose.keypoints3D,
        scores: pose.keypoints3D.map(function(l){ return l.score != null ? l.score : 1; })
      };

      if (!window._push_logged) {
        window._push_logged = true;
        console.warn('[video-proc] pushPoseData FIRST CALL, lms=' + _posePacket.lms.length +
          ', solver=' + !!(window.VRMDirectPoseSolver?.pushPoseData));
      }

      if (typeof window === 'object' && window.VRMDirectPoseSolver && typeof window.VRMDirectPoseSolver.pushPoseData === 'function') {
        window.VRMDirectPoseSolver.pushPoseData(_posePacket);
      }

      if (!self._vrmd_bc) self._vrmd_bc = new BroadcastChannel('vrm_pose');
      self._vrmd_bc.postMessage(_posePacket);
    }
  } catch(e) { /* non-critical — don't break the main pose pipeline */ }

  // cleanup
  if (rgba instanceof ImageBitmap) rgba.close();
  frame.rgba = undefined;
}


/**
 * Process a video frame for hands-only detection (HandsAT path).
 * @param {Object} S - Shared state object
 * @param {Object} frame - { rgba, w, h, options } (mutable)
 */
export async function HandsAT_process_video_buffer(S, frame) {
  let rgba = frame.rgba;
  const w = frame.w;
  const h = frame.h;
  const options = frame.options;

  let _t = performance.now();

  if (options.timestamp != null) {
    S.vt = options.timestamp + S.vt_offset;
    if (S.vt <= S.vt_last + 1) {
      S.vt_offset = (S.vt_last - options.timestamp) + 16.6667;
      S.vt = options.timestamp + S.vt_offset;;
    }
    S.vt_last = S.vt;
  }
  else {
    S.vt = _t;
  }
//console.log(S.vt)

  if (rgba instanceof ArrayBuffer)
    rgba = await createImageBitmap(new ImageData(new Uint8ClampedArray(rgba), w,h));
//rgba = tf.browser.fromPixels(rgba)

  let pose, hands;
  let score_threshold = 0.5;

  pose = options.pose;
  S.shoulder_width = options.shoulder_width;

  S.handpose_model.set_score?.(w,h, options);
  hands = await S.handpose_model.estimateHands(get_hand_canvas(S, pose, rgba, w, h), S.vt);
  // Use local score_threshold for HandsAT (set S.score_threshold for hands_adjust)
  S.score_threshold = score_threshold;
  hands = hands_adjust(S, hands, S.vt, pose, w, h, options);

  _t = performance.now() - _t +(options._t||0);

  S.fps_ms += _t
  if (++S.fps_count >= 20) {
    S.fps = 1000 / (S.fps_ms/S.fps_count)
    S.fps_count = S.fps_ms = 0
  }

  if (hands) {
    hands = hands.filter((h)=>h.annotations&&Object.keys(h.annotations).length);
  }

  S.postMessageAT(JSON.stringify({ handpose:hands, _t:_t, fps:S.fps }));

  // cleanup
  if (rgba instanceof ImageBitmap) rgba.close();
  frame.rgba = undefined;
}
