// mocap-pose-processor.js — Pose adjustment and facemesh processing
// Extracted from mocap_lib_module.js (Step 2B)

import { BLAZEPOSE_KEYPOINTS, get_pose_index } from './mocap-constants.js';
console.log('[mocap-pose-processor] v20260321-7 loaded');

/**
 * Adjust raw pose data into normalized format.
 * @param {Object} S - Shared state object
 * @param {*} pose - Raw pose result
 * @param {number} w - Video width
 * @param {number} h - Video height
 * @param {Object} options - Processing options
 * @returns {Object} Adjusted pose
 */
export function pose_adjust(S, pose, w, h, options) {
    S.shoulder_width = Math.max(w,h)/7;

    function synthesize_keypoints3D_from_pose_landmarks(landmarks) {
      if (!landmarks || !landmarks.length) return null;

      const hipL = landmarks[23] || landmarks[0];
      const hipR = landmarks[24] || hipL;
      const hipCenter = {
        x: (hipL.x + hipR.x) / 2,
        y: (hipL.y + hipR.y) / 2,
        z: (hipL.z + hipR.z) / 2,
      };

      return landmarks.map((landmark, i) => ({
        x: landmark.x - hipCenter.x,
        y: hipCenter.y - landmark.y,
        z: landmark.z - hipCenter.z,
        name: BLAZEPOSE_KEYPOINTS[i]
      }));
    }

    if (!window._pa_found) {
      window._pa_frames = (window._pa_frames || 0) + 1;
      var _hasPL = !!(pose && pose.poseLandmarks?.length);
      if (_hasPL) {
        window._pa_found = true;
        console.warn('[pose_adjust] FIRST LANDMARKS at frame ' + window._pa_frames + ':', JSON.stringify({
          use_movenet: !!S.use_movenet,
          use_mediapipe_pose_landmarker: !!S.use_mediapipe_pose_landmarker,
          poseLandmarks_len: pose.poseLandmarks.length,
          za: !!(pose.za),
          ea: !!(pose.ea),
          result_keys: Object.keys(pose).slice(0,15)
        }));
      } else if (window._pa_frames === 60) {
        console.error('[pose_adjust] NO poseLandmarks after 60 frames. Last flags:', JSON.stringify({
          pose_truthy: !!pose, use_movenet: !!S.use_movenet,
          use_mediapipe_pose_landmarker: !!S.use_mediapipe_pose_landmarker,
          result_keys: pose ? Object.keys(pose).slice(0,15) : []
        }));
      }
    }

    if (!pose || !S.use_movenet) return pose

// latest human
    if (S.use_human_pose) {
      pose.keypoints.forEach((kp) => {
        if (kp.position.length)
          kp.position = {x:kp.position[0], y:kp.position[1]}
      });
      return pose;
    }

    let _keypoints3D;
    let assign_keypoints3D;
    if (options.use_holistic || S.use_mediapipe_pose_landmarker) {
      const _result = pose
//console.log(_result)
      _keypoints3D = _result.ea || _result.za;
      if (_result.poseLandmarks?.length) {
// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/blazepose_mediapipe/detector.ts

        const iw = _result.image?.width  || w;
        const ih = _result.image?.height || h

        pose  = [{
  score: 1,
  keypoints: _result.poseLandmarks.map((landmark, i) => ({
x: landmark.x * iw,
y: landmark.y * ih,
z: landmark.z * iw,
name: BLAZEPOSE_KEYPOINTS[i]
  })),
        }];

        if (!_keypoints3D?.length) {
          _keypoints3D = synthesize_keypoints3D_from_pose_landmarks(_result.poseLandmarks);
          if (_keypoints3D && !window._synth3d_logged) {
            window._synth3d_logged = true;
            console.warn('[mocap-pose-processor] worldLandmarks missing — using synthesized keypoints3D fallback (' + _keypoints3D.length + ' pts)');
          }
        }
      }
      else {
        pose = []
      }
    }

    if (!pose.length)
      return {score:0,keypoints:[]}

    const armL_pos = pose[0].keypoints[get_pose_index(5)];
    const armR_pos = pose[0].keypoints[get_pose_index(6)];
    const arm_diff = [armL_pos.x-armR_pos.x, armL_pos.y-armR_pos.y, (armL_pos.z-armR_pos.z)/3];
    S.shoulder_width = Math.sqrt(arm_diff[0]*arm_diff[0] + arm_diff[1]*arm_diff[1] + arm_diff[2]*arm_diff[2]);

    if (S.data_filter[0]) {
      let filter_factor = Math.max(w,h)/S.shoulder_width;
      filter_factor = (filter_factor < 5) ? 1 : Math.min(filter_factor/5, 3);
//console.log(filter_factor)
      for (const p of ['landmarks', 'worldLandmarks']) {
        for (let i = 0; i < 33; i++) {
          const f = S.data_filter[0][p][i];
//          f.minCutOff = 1 * (1 + (filter_factor-1)/2);
//          f.minCutOff = filter_factor;
          f.beta = filter_factor;
          f.dCutOff = 2 * filter_factor;
        }
      }
    }

    if (pose[0].keypoints[0].score == null) {
      const score = pose[0].keypoints.map(landmark=>{
if (landmark.visibility != null) return landmark.visibility;

let score = 1;
for (const d of ['x','y']) {
  const dim = (d == 'x') ? w : h;
  const v = landmark[d]/dim;
  const limit = (S.shoulder_width/1)/dim;
  if (v < 0) {
    score *= Math.max(1 + v/limit, 0);
  }
  else if (v > 1) {
    score *= Math.max(1 - (v-1)/limit, 0);
  }
}

return score;
      });

      pose[0].keypoints.forEach((p,i)=>{p.score=score[i]});

      if (_keypoints3D) {
        if (S.pose_model_quality == 'Best') {
const z_scale = 1 / S.pose_model_z_depth_scale;

const hipL = pose[0].keypoints[23];
const hipR = pose[0].keypoints[24];
const hip = {
  x:(hipL.x+hipR.x)/2,
  y:(hipL.y+hipR.y)/2,
  z:(hipL.z+hipR.z)/2
};
const hip_dis = {
  x:(hipL.x-hipR.x),
  y:(hipL.y-hipR.y),
  z:(hipL.z-hipR.z)*z_scale
};
const hip3D_dis = {
  x:(_keypoints3D[23].x-_keypoints3D[24].x),
  y:(_keypoints3D[23].y-_keypoints3D[24].y),
  z:(_keypoints3D[23].z-_keypoints3D[24].z)
};
const scale = Math.sqrt(Math.sqrt(hip3D_dis.x*hip3D_dis.x + hip3D_dis.y*hip3D_dis.y + hip3D_dis.z*hip3D_dis.z)) / Math.sqrt(hip_dis.x*hip_dis.x + hip_dis.y*hip_dis.y + hip_dis.z*hip_dis.z);

pose[0].keypoints3D = pose[0].keypoints.map((landmark, i)=>({
  x: (landmark.x - hip.x) * scale,
  y: (landmark.y - hip.y) * scale,
  z: (landmark.z - hip.z) * scale * z_scale,
  name: BLAZEPOSE_KEYPOINTS[i]
}));

//console.log((pose[0].keypoints3D[23].z-pose[0].keypoints3D[24].z)/(_keypoints3D[23].z-_keypoints3D[24].z), hipL.name,hipR.name);

pose[0].keypoints3D_raw = _keypoints3D.map((landmark, i) => ({
  x: landmark.x,
  y: landmark.y,
  z: landmark.z,
  name: BLAZEPOSE_KEYPOINTS[i]
}));
        }
        else {
          pose[0].keypoints3D = _keypoints3D.map((landmark, i) => ({
x: landmark.x,
y: landmark.y,
z: landmark.z,
name: BLAZEPOSE_KEYPOINTS[i]
          }));
        }
      }

      pose[0].keypoints3D?.forEach((p,i)=>{p.score=score[i]});
    }

    let keypoints_movenet = []
    pose[0].keypoints.forEach((kp) => {
      keypoints_movenet.push({
  position: {x:kp.x, y:kp.y, z:kp.z},
  score: kp.score,
  part: kp.name.replace(/\_(\w)/, (match, p1)=>p1.toUpperCase()),
      });
    });

    if (S.use_blazepose && S.use_mediapipe && pose[0].keypoints && pose[0].keypoints.length) {
// temp fix for undefined .score
      pose[0].score = 1
    }

    let result = { score:pose[0].score, keypoints:keypoints_movenet };
    if (pose[0].keypoints3D)
      result.keypoints3D = pose[0].keypoints3D
    if (pose[0].keypoints3D_raw)
      result.keypoints3D_raw = pose[0].keypoints3D_raw

//console.log(result)
    return result;
}


/**
 * Process facemesh landmarks into eye/face data.
 * @param {Object} S - Shared state object
 * @param {*} faces - Raw face landmarks
 * @param {number} w - Video width
 * @param {number} h - Video height
 * @param {Object} bb - Bounding box {x, y, w, h, ratio, scale}
 * @param {*} rgba - RGBA image data (for non-faceLandmarksDetection path)
 * @returns {Array} Processed faces
 */
export function process_facemesh(S, faces, w,h, bb, rgba) {
  let sx = bb.x
  let sy = bb.y
  let cw = bb.w
  let ch = bb.h

  S.eyes = []

  let face;
  if (S.use_mediapipe_facemesh) {
    face = {}
    face.faceInViewConfidence = 1
    let min_x=9999, min_y=9999, max_x=-9999, max_y=-9999;
    let mesh=[], scaledMesh=[];
    faces.multiFaceLandmarks[0].forEach((f)=>{
      var x = f.x * cw
      var y = f.y * ch
      var z = f.z * cw

      min_x = Math.min(min_x, x)
      min_y = Math.min(min_y, y)
      max_x = Math.max(max_x, x)
      max_y = Math.max(max_y, y)

      mesh.push([f.x, f.y, f.z])
      scaledMesh.push([x, y, z])
    });
    face.boundingBox = { topLeft:[min_x,min_y], bottomRight:[max_x,max_y] }
    face.scaledMesh = scaledMesh
    face.mesh = mesh
    const size = Math.max(max_x-min_x, max_y-min_y);
    face.mesh.forEach(coords=>{
      coords[0] *= 256 * cw / size;
      coords[1] *= 256 * ch / size;
      coords[2] *= 256 * cw / size;
    });
    faces = [face]
//console.log(face)
  }
  else {
    face = faces[0]
    if (S.use_human_facemesh) {
      face.faceInViewConfidence = face.confidence
      face.scaledMesh = face.mesh
      face.mesh = face.meshRaw
      face.boundingBox = face.boxRaw
// human v1.1.9+
      face.boundingBox = { topLeft:[face.boxRaw[0]*cw,face.boxRaw[1]*ch], bottomRight:[(face.boxRaw[0]+face.boxRaw[2])*cw,(face.boxRaw[1]+face.boxRaw[3])*ch] }
      const size = Math.max(face.boxRaw[2]*cw, face.boxRaw[3]*ch) / 1.5;
      face.mesh.forEach(coords=>{
        coords[0] *= 256 * cw / size;
        coords[1] *= 256 * ch / size;
        coords[2] *= 256;
      });
    }
    else if (S.facemesh_version == '@0.0.3') {
      face.boundingBox = { topLeft:face.boundingBox.topLeft[0], bottomRight:face.boundingBox.bottomRight[0]}
    }
  }

//  let bb = face.boundingBox;
//  let face_radius = Math.min(bb.bottomRight[0][0]-bb.topLeft[0][0], bb.bottomRight[0][1]-bb.topLeft[0][1])/2;

  let sm = face.scaledMesh;

  let eye_bb, eye_center, eye_w, eye_h, eye_radius;

// face LR:234,454
// right eye
// LR: 33,133
// TB: 159,145
// left eye
// LR: 362,263
// TB: 386,374

//  let z_diff = face.mesh[454][2] - face.mesh[234][2]
//  let eye_LR = (z_diff > 0) ? ["L","R"] : ["R","L"]
  let eye_LR = ["L","R"] 

  let m454 = face.mesh[454]
  let m234 = face.mesh[234]
  let dx = m454[0] - m234[0]
  let dy = m454[1] - m234[1]
  let dz = m454[2] - m234[2]
  let dis = Math.sqrt(dx*dx + dy*dy + dz*dz)
  let z_rot = Math.asin(dy / dis)

  for (var i = 0; i < 2; i++) {
    let LR = eye_LR[i]
    if (LR == "L") {
      eye_bb = [[Math.min(sm[33][0],sm[133][0],sm[159][0],sm[145][0]), Math.min(sm[33][1],sm[133][1],sm[159][1],sm[145][1])], [Math.max(sm[33][0],sm[133][0],sm[159][0],sm[145][0]), Math.max(sm[33][1],sm[133][1],sm[159][1],sm[145][1])]];
    }
    else {
      eye_bb = [[Math.min(sm[362][0],sm[263][0],sm[386][0],sm[374][0]), Math.min(sm[362][1],sm[263][1],sm[386][1],sm[374][1])], [Math.max(sm[362][0],sm[263][0],sm[386][0],sm[374][0]), Math.max(sm[362][1],sm[263][1],sm[386][1],sm[374][1])]];
    }

    eye_center = [(eye_bb[0][0] + eye_bb[1][0])/2, (eye_bb[0][1] + eye_bb[1][1])/2]
    eye_w = eye_bb[1][0]-eye_bb[0][0]
    eye_h = eye_bb[1][1]-eye_bb[0][1]
    eye_radius = Math.max(eye_w, eye_h)/2

    let yx;
if (S.use_faceLandmarksDetection) {
// https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/src/mediapipe-facemesh/keypoints.ts
// NOTE: video source is assumed to be mirrored (eg. video L == landmarks R)
    yx = (sm[473]) ? ((LR == ((S.use_mediapipe_facemesh)?"R":"L")) ? [sm[473][1], sm[473][0]] : [sm[468][1], sm[468][0]]) : [];
}
else {
  if ((S.gray_w != cw) || (S.gray_h != ch)) {
    S.gray_w = cw
    S.gray_h = ch
    S.gray = new Uint8Array(cw*ch);
  }

  const image = {
    "pixels": S.gray,
    "nrows": ch,
    "ncols": cw,
    "ldim": cw
  };

  let r,c,s;
  r = eye_center[1];
  c = eye_center[0];
  s = eye_radius*2;
  rgba_to_grayscale(rgba, eye_center, eye_radius)
  yx = do_puploc(r, c, s, 63, image);
}

    if ((yx[0] >=0) && (yx[1] >= 0)) {
      let confidence = (0.25 + Math.min(Math.max(eye_radius-5,0)/30, 1) * 0.5)
      dx = (eye_center[0] - yx[1]) / eye_radius
      dy = (eye_center[1] - yx[0]) / eye_radius
      dis = Math.sqrt(dx*dx + dy*dy)
      let eye_z_rot = Math.atan2(dy, dx) - z_rot
      let eye_x = S.eyes_xy_last[i][0] = Math.max(Math.min(Math.cos(eye_z_rot)*dis, 1), -1) * confidence + S.eyes_xy_last[i][0] * (1-confidence)
      let eye_y = S.eyes_xy_last[i][1] = Math.max(Math.min(Math.sin(eye_z_rot)*dis*Math.max(1.5-Math.abs(z_rot)/(Math.PI/4)*0.5,1), 1), -1) * confidence + S.eyes_xy_last[i][1] * (1-confidence)

      S.eyes[i] = [yx[1]+sx,yx[0]+sy, eye_x,eye_y, [LR]]
    }
  }

if (!S.use_faceLandmarksDetection) {
// practically only the first eye data is used
  if (S.eyes.length) {
    if (!S.eyes[0])
      S.eyes = [S.eyes[1]]
//    let score = S.eyes[0][5] - ((S.eyes[1] && S.eyes[1][5])||99999)
//    if (score > 0) S.eyes = [S.eyes[1],S.eyes[0]]

let eye_x = null
let eye_y = null
//_eyes = (S.eyes.length==1) ? [S.eyes[0],S.eyes[0]] : S.eyes
//eye_x = (Math.sign(_eyes[0][2]) + Math.sign(_eyes[1][2]) == 0) ? null : ((Math.abs(_eyes[0][2]) > Math.abs(_eyes[1][2])) ? Math.abs(_eyes[0][2]) : Math.abs(_eyes[1][2]));
//eye_y = (Math.sign(_eyes[0][3]) + Math.sign(_eyes[1][3]) == 0) ? null : ((Math.abs(_eyes[0][3]) > Math.abs(_eyes[1][3])) ? Math.abs(_eyes[0][3]) : Math.abs(_eyes[1][3]));
if (eye_x == null) {
  S.eyes.forEach((e)=>{eye_x+=e[2]})
  eye_x /= S.eyes.length
}
if (eye_y == null) {
  S.eyes.forEach((e)=>{eye_y+=e[3]})
  eye_y /= S.eyes.length
}
S.eyes.forEach((e)=>{e[2]=eye_x;e[3]=eye_y;})
    S.eyes[0][4].push(S._t_list[1])
  }
}

  if (sx || sy) {
    sm.forEach(xyz => {xyz[0]+=sx; xyz[1]+=sy;});
  }

  faces[0].bb = bb
  faces[0].bb_center = [(face.boundingBox.topLeft[0]+(face.boundingBox.bottomRight[0]-face.boundingBox.topLeft[0])/2+sx)/w, (face.boundingBox.topLeft[1]+(face.boundingBox.bottomRight[1]-face.boundingBox.topLeft[1])/2+sy)/h]

  return faces
}
