// facemesh-draw.js — Canvas drawing, visualization
// Refactored: Step 2C — extracted from js/facemesh_lib.js

// https://github.com/tensorflow/tfjs-models/tree/master/posenet/src/keypoints.ts
var pose_connected_pairs = [
  ['leftHip', 'leftShoulder'], ['leftElbow', 'leftShoulder'],
  ['leftElbow', 'leftWrist'], ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'], ['rightHip', 'rightShoulder'],
  ['rightElbow', 'rightShoulder'], ['rightElbow', 'rightWrist'],
  ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
  ['leftShoulder', 'rightShoulder'], ['leftHip', 'rightHip']
];

// https://github.com/tensorflow/tfjs-models/blob/master/handpose/demo/index.js
var fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  index: [0, 5, 6, 7, 8],
  middle: [0, 9, 10, 11, 12],
  ring: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20]
};

var facemesh_drawn;

// https://github.com/tensorflow/tfjs-models/blob/master/facemesh/demo/index.js
function fm_drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0] / 2, points[0][1] / 2);
  for (let i = 1; i < 3; i++) {
    const point = points[i];
    region.lineTo(point[0] / 2, point[1] / 2);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

export function fm_draw(S, faces, w, h, options) {
  if (S.canvas && options.draw_canvas) {
    if (S.RAF_timerID)
      cancelAnimationFrame(S.RAF_timerID)
    S.RAF_timerID = requestAnimationFrame(function () {
      S.RAF_timerID = null
      fm_draw_facemesh(S, faces, w, h);
      fm_draw_pose(S)
    });
  }
}

function fm_draw_facemesh(S, faces, w_full, h_full, rgba) {
  function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  }

  const w = Math.round(w_full / 2);
  const h = Math.round(h_full / 2);

  if ((S.canvas.width != w) || (S.canvas.height != h)) {
    S.canvas.width = w
    S.canvas.height = h
  }

  S.context.globalAlpha = 0.5

  S.context.save()

  if (S.flip_canvas) {
    S.context.translate(S.canvas.width, 0)
    S.context.scale(-1, 1)
  }

  S.context.clearRect(0, 0, w, h)

  S.context.fillStyle = 'black'
  S.context.fillRect(0, 0, w, h)

  if (!S.TRIANGULATION || !faces.length) {
    facemesh_drawn = false
    S.context.restore()
    return
  }

  facemesh_drawn = true

  const bb = faces[0].bb
  if (S.canvas_camera) {
    S.context.globalAlpha = 1
    S.context.drawImage(S.canvas_camera, bb.x / 2, bb.y / 2, bb.w / 2, bb.h / 2)
  }

  S.context.fillStyle = '#32EEDB';
  S.context.strokeStyle = '#32EEDB';
  S.context.lineWidth = 0.5;
  const keypoints = faces[0].scaledMesh;
  for (let i = 0, i_max = S.TRIANGULATION.length / 3; i < i_max; i++) {
    const points = [
      S.TRIANGULATION[i * 3], S.TRIANGULATION[i * 3 + 1],
      S.TRIANGULATION[i * 3 + 2]
    ].map(index => keypoints[index]);
    fm_drawPath(S.context, points, true);
  }

  if (S.canvas_camera && S.use_faceLandmarksDetection) {
    const ctx = S.context;

    const NUM_KEYPOINTS = 468;
    const NUM_IRIS_KEYPOINTS = 5;
    const RED = "#FF2C35";

    ctx.strokeStyle = RED;
    ctx.lineWidth = 1;

    const leftCenter = keypoints[NUM_KEYPOINTS];
    const leftDiameterY = distance(
      keypoints[NUM_KEYPOINTS + 4],
      keypoints[NUM_KEYPOINTS + 2]);
    const leftDiameterX = distance(
      keypoints[NUM_KEYPOINTS + 3],
      keypoints[NUM_KEYPOINTS + 1]);

    ctx.beginPath();
    ctx.ellipse(leftCenter[0] / 2, leftCenter[1] / 2, leftDiameterX / 2 / 2, leftDiameterY / 2 / 2, 0, 0, 2 * Math.PI);
    ctx.stroke();

    if (keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
      const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
      const rightDiameterY = distance(
        keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
        keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
      const rightDiameterX = distance(
        keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
        keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

      ctx.beginPath();
      ctx.ellipse(rightCenter[0] / 2, rightCenter[1] / 2, rightDiameterX / 2 / 2, rightDiameterY / 2 / 2, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  else {
    S.eyes.forEach(function (eye) {
      if (!eye) return
      var c = eye[0] / 2
      var r = eye[1] / 2
      S.context.beginPath();
      S.context.arc(c, r, 1, 0, 2 * Math.PI, false);
      S.context.lineWidth = 3;
      S.context.strokeStyle = 'red';
      S.context.stroke();
    });
  }

  if ((bb.w < w_full) || (bb.h < h_full)) {
    S.context.globalAlpha = 1 / 3
    S.context.strokeStyle = 'white';
    S.context.lineWidth = 3;
    const region = new Path2D();

    region.moveTo(bb.x / 2, bb.y / 2);
    region.lineTo(bb.x / 2 + bb.w / 2, bb.y / 2);
    region.lineTo(bb.x / 2 + bb.w / 2, bb.y / 2 + bb.h / 2);
    region.lineTo(bb.x / 2, bb.y / 2 + bb.h / 2);

    region.closePath();
    S.context.stroke(region);
  }

  S.context.restore()
}

function fm_draw_pose(S) {
  if (!S.posenet || (S.posenet.score < 0.1)) return;

  S.context.save()

  if (S.flip_canvas) {
    S.context.translate(S.canvas.width, 0)
    S.context.scale(-1, 1)
  }

  var scale = S.pose_w / S.cw * 2

  var part = {}
  S.posenet.keypoints.forEach(function (p, idx) {
    part[p.part] = p

    if (p.score <= 0) return;
    if (/nose|Eye|Ear/.test(p.part) && facemesh_drawn) return;

    const { y, x } = p.position;

    S.context.beginPath();
    S.context.arc(x / scale, y / scale, 3, 0, 2 * Math.PI);
    S.context.fillStyle = 'aqua';
    S.context.fill();
  });

  pose_connected_pairs.forEach(function (pair) {
    var L = part[pair[0]]
    var R = part[pair[1]]
    if ((L.score <= 0) || (R.score <= 0)) return;

    var ax = L.position.x, ay = L.position.y, bx = R.position.x, by = R.position.y;
    S.context.beginPath();
    S.context.moveTo(ax / scale, ay / scale);
    S.context.lineTo(bx / scale, by / scale);
    S.context.lineWidth = 2;
    S.context.strokeStyle = 'aqua';
    S.context.stroke();
  });

  fm_draw_hand(S);

  S.context.restore()
}

function fm_draw_hand(S) {
  if (!S.handpose || !S.handpose.length) return;

  var scale = S.pose_w / S.cw * 2

  S.context.strokeStyle = 'pink';
  S.context.fillStyle = 'pink';

  S.handpose.forEach(function (hand) {
    const keypoints = hand.keypoints;

    keypoints.forEach(function (p) {
      S.context.beginPath();
      S.context.arc((p[0] - 2) / scale, (p[1] - 2) / scale, 3, 0, 2 * Math.PI);
      S.context.fill();
    });

    Object.keys(fingerLookupIndices).forEach(function (finger) {
      const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);

      const region = new Path2D();
      region.moveTo(points[0][0] / scale, points[0][1] / scale);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point[0] / scale, point[1] / scale);
      }
      S.context.stroke(region);
    });
  });
}
