// mocap-hands-processor.js — Hand landmark adjustment, visibility, and canvas clipping
// Extracted from mocap_lib_module.js (Step 2B)

import { get_pose_index } from './mocap-constants.js';

/**
 * Adjust raw hand landmarks into normalized format.
 * @param {Object} S - Shared state object
 * @param {*} hands - Raw hand results
 * @param {number} nowInMs - Current timestamp
 * @param {*} pose - Adjusted pose data
 * @param {number} w - Video width
 * @param {number} h - Video height
 * @param {Object} options - Processing options
 * @returns {Array} Adjusted hands
 */
export function hands_adjust(S, hands, nowInMs, pose, w, h, options) {
    function landmark_adjust(h, clip) {
const scale = clip[8];
const cw = S.canvas_hands.width;

return [
  (h.x*cw - clip[4])/scale + clip[0],
  (h.y*cw - clip[5])/scale + clip[1],
  h.z*cw/scale,
];
    }

    function process_handedness(i) {
if (discard_wrong_handedness) {
  hands.multiHandedness = hands.multiHandedness.filter((h,idx)=>idx != i);
  hands.multiHandLandmarks = hands.multiHandLandmarks.filter((h,idx)=>idx != i);
}
else {
  const h = hands.multiHandLandmarks[i];
  const label = hands.multiHandedness[i].categoryName;

  hands.multiHandedness[i].categoryName = hands.multiHandedness[i].label = (label == 'Left') ? 'Right' : 'Left';

  hands.multiHandLandmarks[i] = [
    h[0],
    h[17],h[18],h[19],h[20],
    h[13],h[14],h[15],h[16],
    h[9], h[10],h[11],h[12],
    h[5], h[6], h[7], h[8],
    h[1], h[2], h[3], h[4],
  ];

}
    }

    function palm_distance_squared(side) {
function get_wrist(i) {
  if (side && wrist) return true;

  let _side = hands.multiHandedness[i].categoryName;
  if (S.canvas_hands) {
    let clip_index = S.hand_clip.findIndex(c=>(_side=='Left') ? c[9]==1 : c[9]==-1);
    if (clip_index == -1) return false;

    clip = S.hand_clip[clip_index];
    wrist = [clip[10], clip[11]];
    return true;
  }
  else {
// assumed mirrored
    const kp = pose.keypoints[get_pose_index((_side=='Left')?10:9)];
    if (kp.score < S.score_threshold) return false;

    wrist = [kp.position.x, kp.position.y];
    return true;
  }
}

let clip, wrist;
let dis;
dis = hands.multiHandLandmarks.map((hand,i)=>{
  if (!get_wrist(i)) return 9999*9999;

  const palm = (S.canvas_hands) ? landmark_adjust(hand[0], clip) : [hand[0].x*w, hand[0].y*h];
  const x = wrist[0] - palm[0];
  const y = wrist[1] - palm[1];
//console.log(i, wrist.slice(), palm.slice())
  return x*x + y*y;
});

return dis;
    }

    function index_to_flip_by_distance(flip_side) {
let side = hands.multiHandedness[0].categoryName;
if (flip_side)
  side = (side == 'Left') ? 'Right' : 'Left';

const dis = palm_distance_squared(side);
//console.log((((dis[0] > dis[1]) ? hands.multiHandedness[0].score > hands.multiHandedness[1].score : hands.multiHandedness[0].score < hands.multiHandedness[1].score)?'higher':'lower')+' score discarded');

return (dis[0] > dis[1]) ? 0 : 1;
    }

    function clipped(i, flip_side) {
const h = hands.multiHandLandmarks[i];
const label = hands.multiHandedness[i].categoryName;

const side = (flip_side) ? 'Right' : 'Left';
let clip_index = S.hand_clip.findIndex(c=>(label==side) ? c[9]==1 : c[9]==-1);
if (clip_index == -1) return false;

let clip = S.hand_clip[clip_index];
const h_list = [landmark_adjust(h[0], clip), landmark_adjust(h[9], clip)];

return h_list.some(_h=>(_h[0] >= clip[0]) && (_h[1] >= clip[1]) && (_h[0] <= clip[0]+clip[2]) && (_h[1] <= clip[1]+clip[3]));
    }

    if (!hands || S.use_human_hands) return hands

    if (options.use_holistic_legacy) {
      const _result = hands
      hands = { image:_result.image, multiHandedness:[], multiHandLandmarks:[] }
      if (_result.leftHandLandmarks && _result.leftHandLandmarks.length) {
        hands.multiHandLandmarks.push(_result.leftHandLandmarks)
// LR flipped
        hands.multiHandedness.push({score:1, categoryName:'Right'})
      }
      if (_result.rightHandLandmarks && _result.rightHandLandmarks.length) {
        hands.multiHandLandmarks.push(_result.rightHandLandmarks)
        hands.multiHandedness.push({score:1, categoryName:'Left'})
      }
    }

    if (!hands.multiHandedness || !hands.multiHandedness.length)
      return [];

// legacy version of mediapipe hands may return more than 2 detections
//if (hands.multiHandedness.length > 2) console.log(hands.multiHandedness.length);
    hands.multiHandedness = hands.multiHandedness.slice(0,2);
    hands.multiHandLandmarks = hands.multiHandLandmarks.slice(0,2);
    

    var _hands = [];
    var iw = hands.image?.width  || w;
    var ih = hands.image?.height || h;

    const adjust_handedness = [];
    let discard_wrong_handedness = true;

    if (!pose || options.use_holistic) {}
    else if (S.canvas_hands) {
      if (hands.multiHandedness.length == 1) {
        if (!clipped(0)) {
          if (discard_wrong_handedness || clipped(0,true)) {
            adjust_handedness[0] = true;
//console.log('One side');
          }
        }
      }
      else {
        const idx_list = [0,1];
        if (hands.multiHandedness[0].categoryName != hands.multiHandedness[1].categoryName) {
          if (idx_list.every(i=>!clipped(i))) {
            if (discard_wrong_handedness || idx_list.some(i=>clipped(i,true))) {
              adjust_handedness[0] = adjust_handedness[1] = true;
//console.log('Both sides');
            }
          }
        }
        else {
          if (idx_list.every(i=>clipped(i))) {
            adjust_handedness[index_to_flip_by_distance()] = true;
//console.log('By dstance');
          }
          else if (idx_list.every(i=>clipped(i,true))) {
            if (discard_wrong_handedness) {
              adjust_handedness[0] = adjust_handedness[1] = true;
//console.log('Discarded');
            }
            else {
              adjust_handedness[index_to_flip_by_distance(true)] = true;
            }
//console.log('By dstance, flipped');
          }
          else {
            const idx_correct = idx_list.findIndex(i=>clipped(i));
            if (idx_correct != -1) {
              adjust_handedness[(idx_correct==0)?1:0] = true;
//console.log('Flip the wrong side');
            }
            else if (discard_wrong_handedness) {
              adjust_handedness[0] = adjust_handedness[1] = true;
//console.log('Discarded');
            }
          }
        }
      }
    }
    else {
      if ((hands.multiHandedness.length > 1) && (hands.multiHandedness[0].categoryName == hands.multiHandedness[1].categoryName)) {
        adjust_handedness[index_to_flip_by_distance()] = true;
//console.log('By dstance');
      }
    }

    for (let i = 0; i < 2; i++) {
      if (adjust_handedness[i]) {
        process_handedness(i);
      }
    }

    if (pose) {
      const _multiHandedness = [];
      const _multiHandLandmarks = [];
      const dis_to_palm = S.shoulder_width*S.shoulder_width*0.25;
      palm_distance_squared().forEach((dis,i)=>{
        if (dis < dis_to_palm) {
          _multiHandedness.push(hands.multiHandedness[i]);
          _multiHandLandmarks.push(hands.multiHandLandmarks[i]);
        }
      });
      hands.multiHandedness = _multiHandedness;
      hands.multiHandLandmarks = _multiHandLandmarks;
    }

    for (let i = 0; i < hands.multiHandedness.length; i++) {
      const label = hands.multiHandedness[i].label || hands.multiHandedness[i].categoryName;
//options.video_flipped
      let clip;
      if (!options.use_holistic && S.canvas_hands) {
        clip = S.hand_clip.find(c=>(label=='Left') ? c[9]==1 : c[9]==-1);
        if (!clip) continue;
      }

      const h = hands.multiHandLandmarks[i].map(_h=>{
if (options.use_holistic || !S.canvas_hands) {
  return [
_h.x*iw,
_h.y*ih,
_h.z*iw,
  ];
}
else {
  return landmark_adjust(_h, clip);
}
      });

      const worldLandmarks = (hands.worldLandmarks?.[i][0].x == null) ? hands.worldLandmarks?.[i] : null;

      _hands.push({
score: hands.multiHandedness[i].score,
label: hands.multiHandedness[i].label || hands.multiHandedness[i].categoryName,
keypoints: h,

worldLandmarks: worldLandmarks && {
  keypoints: worldLandmarks,
  annotations: {
    "palm":   [worldLandmarks[0]],
    "thumb":  [worldLandmarks[1], worldLandmarks[2], worldLandmarks[3], worldLandmarks[4]],
    "index":  [worldLandmarks[5], worldLandmarks[6], worldLandmarks[7], worldLandmarks[8]],
    "middle": [worldLandmarks[9], worldLandmarks[10],worldLandmarks[11],worldLandmarks[12]],
    "ring":   [worldLandmarks[13],worldLandmarks[14],worldLandmarks[15],worldLandmarks[16]],
    "pinky":  [worldLandmarks[17],worldLandmarks[18],worldLandmarks[19],worldLandmarks[20]]
  }
},
      });
    }
//console.log(_hands)


    _hands.forEach(hand=>{
const h = hand.keypoints;

//[0,1,5,9,13,17]
let palm_width, palm_height;
palm_width  = [h[1][0]-h[17][0], h[1][1]-h[17][1], h[1][2]-h[17][2]];
palm_height = [h[0][0]-h[9][0],  h[0][1]-h[9][1],  h[0][2]-h[9][2]];

const w_palm = Math.sqrt(palm_width[0]*palm_width[0] + palm_width[1]*palm_width[1] + palm_width[2]*palm_width[2]);
const h_palm = Math.sqrt(palm_height[0]*palm_height[0] + palm_height[1]*palm_height[1] + palm_height[2]*palm_height[2]);

let _adjust_ratio = h_palm / w_palm;

_adjust_ratio = (_adjust_ratio < 1.25) ? 1.25 : ((_adjust_ratio > 1.75) ? 1.75 : 1);
if (_adjust_ratio != 1) {
  const adjust_max = Math.max(Math.abs(palm_height[2]/h_palm), Math.abs(palm_width[2]/w_palm));

  const s = _adjust_ratio * _adjust_ratio;
  palm_width  = [h[1][0]-h[17][0], h[1][1]-h[17][1], h[1][2]-h[17][2]];
  palm_height = [h[0][0]-h[9][0],  h[0][1]-h[9][1],  h[0][2]-h[9][2]];
/*
1.5 * (x1*x1 + y1*y1 + (z1*s)*(z1*s)) = x2*x2 + y2*y2 + (z2*s)*(z2*s)
(z1*s)*(z1*s) - (z2*s)*(z2*s)/1.5 = (x2*x2 + y2*y2)/1.5 - (x1*x1 + y1*y1)
s*s = ((x2*x2 + y2*y2)/1.5 - (x1*x1 + y1*y1))/(z1*z1 - z2*z2/1.5)
*/
  _adjust_ratio = Math.min(Math.sqrt(Math.abs(((palm_height[0]*palm_height[0] + palm_height[1]*palm_height[1])/s - (palm_width[0]*palm_width[0] + palm_width[1]*palm_width[1])) / (palm_width[2]*palm_width[2] - palm_height[2]*palm_height[2]/s))), 1.5 + 1.5*adjust_max);
//console.log(_adjust_ratio)
  h.forEach(j=>{j[2] *= _adjust_ratio});
}
//hand.z_adjust_ratio = _adjust_ratio;


const palm0 = h[0];
for (let f_idx = 0; f_idx < 5; f_idx++) {
  const finger = [];
  for (let idx = 0; idx < 4; idx++)
    finger[idx] = h[f_idx*4+1+idx];

  let dx = finger[0][0] - palm0[0];
  let dy = finger[0][1] - palm0[1];
  let dz = finger[0][1] - palm0[1];
  const ref_length = Math.sqrt(dx*dx + dy*dy + dz*dz) * ((f_idx == 0) ? 2 : 0.75) * 0.5;

  for (let i = 0; i < 3; i++) {
    const f1 = [];
    for (let idx = 0; idx < 3; idx++)
      f1[idx] = finger[i+1][idx] - finger[i][idx];
    const min_length = ref_length * ((i < 2) ? 0.4 : 0.2);// * ((f_idx == 4) ? 0.75 : 1);
    if (f1[0]*f1[0] + f1[1]*f1[1] + f1[2]*f1[2] < min_length*min_length) {
      const z_mod = Math.sign(f1[2]) * Math.sqrt(min_length*min_length - (f1[0]*f1[0] + f1[1]*f1[1]));
//console.log(hand.label+f_idx+':'+z_mod);
      for (let j = i+1; j < 4; j++)
        finger[j][2] += z_mod;
    }
  }
}


if (S.data_filter[1]) {
  const d = hand.label;
  const palm0 = h[0].slice();
  h.forEach((j,idx)=>{
    j.forEach((v,i)=>{j[i] -= palm0[i]});
    const j_new = S.data_filter[1][d].landmarks[idx].filter(j, nowInMs);
    j.forEach((v,i)=>{j[i] = j_new[i] + palm0[i]});
  });
}

// ["thumb", "index", "middle", "ring", "pinky"]
hand.annotations = {
  "palm":   [h[0]],
  "thumb":  [h[1], h[2], h[3], h[4]],
  "index":  [h[5], h[6], h[7], h[8]],
  "middle": [h[9], h[10],h[11],h[12]],
  "ring":   [h[13],h[14],h[15],h[16]],
  "pinky":  [h[17],h[18],h[19],h[20]]
};
    });

    return _hands;
}


/**
 * Check if hands are visible in the current pose.
 * @param {Object} S - Shared state object
 * @param {*} pose - Adjusted pose data
 * @param {number} w - Video width
 * @param {number} h - Video height
 * @param {number} [limit_ratio=1] - Ratio to expand visibility bounds
 * @returns {Array|false} Array of visible sides or false
 */
export function is_hand_visible(S, pose, w, h, limit_ratio=1) {
    if (!pose || (pose.score < 0.1)) return false;

    const limit = S.shoulder_width/Math.max(w,h) * 0.5 * limit_ratio;

    const hand_visible = ['left','right'].filter((side)=>{
      const id = (side == 'left') ? 9 : 10;
      const kp = pose.keypoints[id+6];//get_pose_index(id)];
      return (kp.score > S.score_threshold) && (kp.position.x > -w*limit) && (kp.position.x < w*(1+limit)) && (kp.position.y > -h*limit) && (kp.position.y < h*(1+limit));
    });

    return (hand_visible.length) ? hand_visible : false;
}


/**
 * Crop hand regions from video frame for focused hand detection.
 * @param {Object} S - Shared state object
 * @param {*} pose - Adjusted pose data
 * @param {*} rgba - RGBA image data
 * @param {number} w - Video width
 * @param {number} h - Video height
 * @returns {*} Canvas with cropped hands or original rgba
 */
export function get_hand_canvas(S, pose, rgba, w, h) {
//return rgba;
if (!S.canvas_hands) return rgba;

const ctx = S.canvas_hands.getContext('2d');
ctx.save();

//ctx.beginPath();

S.hand_clip.length = 0;
let clip = [];
const radius = S.shoulder_width * (1 + Math.max(S.shoulder_width/Math.max(w,h)*5-0.5, 0.1)) /2 * ((S.use_hands_worker_parallel) ? 1.2 : 1);
for (const id of [9,10]) {
  const kp = pose.keypoints[get_pose_index(id)];
  if (kp.score < S.score_threshold) continue;

  let cw = radius * 2;
  let ch = radius * 2;
  let x = kp.position.x - radius;
  if (x < 0) {
    cw += x;
    x = 0;
  }
  let y = kp.position.y - radius;
  if (y < 0) {
    ch += y;
    y = 0;
  }
  if (x + cw > w)
    cw -= (x + cw) - w;
  if (y + ch > h)
    ch -= (y + ch) - h;

  if ((cw <= 0) || (ch <= 0)) continue;

//console.log(id+':',x,y, cw,ch)
// assumed mirrored
  clip.push([x,y, cw,ch, (id==9)?-1:1, kp.position.x,kp.position.y]);
}

if (clip.length) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0, S.canvas_hands.width,S.canvas_hands.height);

  let x = Math.min(...clip.map(v=>v[0]));
  let y = Math.min(...clip.map(v=>v[1]));
  let cw = Math.max(...clip.map(v=>v[0]+v[2])) - x;
  let ch = Math.max(...clip.map(v=>v[1]+v[3])) - y;

  const c_radius = S.canvas_hands.width/2;
  let scale;
  if ((cw < radius*4) && (ch < radius*4)) {
    scale = S.canvas_hands.width / Math.max(cw,ch);
    let x_offset, y_offset;
    if (cw > ch) {
      x_offset = 0;
      y_offset = (S.canvas_hands.width-ch*scale)/2;
    }
    else {
      x_offset = (S.canvas_hands.width-cw*scale)/2;
      y_offset = 0;
    }
    clip.forEach(c=>{
      const x2 = x_offset + (c[0]-x)*scale;
      const y2 = y_offset + (c[1]-y)*scale;
      S.hand_clip.push([c[0],c[1],c[2],c[3], x2,y2,cw*scale,ch*scale, scale, c[4], c[5],c[6]]);
    });
    ctx.drawImage(rgba, x,y,cw,ch, x_offset,y_offset,cw*scale,ch*scale);
  }
  else {
    scale = c_radius / (radius*2);
    clip.forEach((c,i)=>{
      const y2 = Math.max(Math.min( (((c[1] - y + c[3]/2) / ch) - 0.5) * 4, 1), -1) * c_radius/4 + c_radius/2;
//((options.video_flipped)?1:-1)
      const x2 = (c[4] == 1) ? 0 : c_radius;
      S.hand_clip[i] = [c[0],c[1],c[2],c[3], x2,y2,c[2]/(radius*2)*c_radius,c[3]/(radius*2)*c_radius];
      ctx.drawImage(rgba, ...S.hand_clip[i]);
      S.hand_clip[i].push(scale, c[4], c[5],c[6]);
    });
  }
}

ctx.restore();

return (clip.length) ? S.canvas_hands : rgba;
}
