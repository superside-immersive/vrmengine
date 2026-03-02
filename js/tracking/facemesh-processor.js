// facemesh-processor.js — process_facemesh, video processing, landmarks
// Refactored: Step 2C — extracted from js/facemesh_lib.js

export function fm_rgba_to_grayscale(S, rgba, center, radius) {
  radius *= 1.2
  const ncols = S.gray_w

  var r_min = parseInt(center[1] - radius)
  var c_min = parseInt(center[0] - radius)
  var r_max = parseInt(center[1] + radius) + r_min
  var c_max = parseInt(center[0] + radius) + c_min
  if (r_min < 0) {
    r_max += r_min
    r_min = 0
  }
  if (r_max >= S.gray_h) {
    r_max = S.gray_h - 1
  }
  if (c_min < 0) {
    c_max += c_min
    c_min = 0
  }
  if (c_max >= S.gray_w) {
    c_max = S.gray_w - 1
  }
  for (var r = r_min; r < r_max; ++r) {
    for (var c = c_min; c < c_max; ++c) {
    // gray = 0.2*red + 0.7*green + 0.1*blue
      const idx = r * 4 * ncols + 4 * c
      S.gray[r * ncols + c] = ((2 * rgba[idx + 0] + 7 * rgba[idx + 1] + 1 * rgba[idx + 2]) / 10)
    }
  }
  return S.gray;
}

export async function fm_process_video_buffer(S, rgba, w, h, options) {
  try {
    await S.load_lib(options)
  }
  catch (err) {
    console.error(err);
    S.postMessageAT('Facemesh ERROR:' + err)
    return
  }

  let _t_list = []
  let _t, _t_now
  _t = _t_now = performance.now()

  const bb = options.bb
  let sx = bb.x
  let sy = bb.y
  let cw = bb.w
  let ch = bb.h

  if (rgba instanceof ArrayBuffer)
    rgba = new ImageData(new Uint8ClampedArray(rgba), cw, ch)

  let faces
  if (S.use_mediapipe_facemesh) {
    if (S.use_mediapipe_face_landmarker) {
      if (options.timestamp != null) {
        S.vt = options.timestamp + S.vt_offset;
        if (S.vt <= S.vt_last) {
          S.vt_offset = (S.vt_last - options.timestamp) + 16.6667;
          S.vt = options.timestamp + S.vt_offset;
        }
        S.vt_last = S.vt;
      }
      else {
        S.vt = _t;
      }

      faces = S.model.detect(rgba, S.vt);
    }
    else {
      faces = await S.model.estimateFaces({ input: rgba });
    }
  }
  else if (S.use_human_facemesh) {
    const result = await S.human.detect(rgba);
    faces = result.face
  }
  else {
    faces = (S.use_faceLandmarksDetection) ? await S.model.estimateFaces({ input: rgba }) : await S.model.estimateFaces(rgba);
  }

  _t_now = performance.now()
  _t_list[0] = _t_now - _t
  _t = _t_now

  if ((S.use_mediapipe_facemesh) ? !faces.multiFaceLandmarks?.length : (!faces.length || ((faces[0].faceInViewConfidence || faces[0].confidence || faces[0].faceScore) < 0.5))) {
    S.postMessageAT(JSON.stringify({ faces: [], _t: _t_list.reduce((a, c) => a + c) }));
    S.draw([], w, h, options)
    return
  }

  const faceBlendshapes = faces.faceBlendshapes;

  // Store rgba ref for legacy puploc code path in process_facemesh
  S._rgba_ref = rgba;
  faces = fm_process_facemesh(S, faces, w, h, bb, _t_list);

  let face = faces[0]
  let sm = face.scaledMesh;

  S.emotion_detection(rgba, face.boundingBox, options);

  _t_now = performance.now()
  _t_list[1] = _t_now - _t
  _t = _t_list.reduce((a, c) => a + c)

  S.fps_ms += _t
  if (++S.fps_count >= 20) {
    S.fps = 1000 / (S.fps_ms / S.fps_count)
    S.fps_count = S.fps_ms = 0
  }

  let bb_center = face.bb_center;
  let bb_scale = face.bb_scale;

  let draw_camera// = true;

  face.emotion = S.object_detection_data?.detections.map(d => {
    const e = d.categories[0];
    return { emotion: e.categoryName, score: e.score };
  });
  if (face.emotion)
    face.emotion.push({ t: S.object_detection_data.t, detection_id: S.object_detection_data.detection_id });

  S.postMessageAT(JSON.stringify({ faces: [{ faceInViewConfidence: face.faceScore || face.faceInViewConfidence || 0, scaledMesh: (S.canvas) ? { 454: sm[454], 234: sm[234] } : sm, mesh: face.mesh, eyes: S.eyes, bb_center: bb_center, bb_scale: bb_scale, emotion: face.emotion, rotation: face.rotation, faceBlendshapes: faceBlendshapes?.[0] }], _t: _t, fps: S.fps, recalculate_z_rotation_from_scaledMesh: S.recalculate_z_rotation_from_scaledMesh }));

  if (draw_camera) {
    if (!S.canvas_camera) {
      S.canvas_camera = new OffscreenCanvas(cw, ch);
    }
    else {
      if ((S.canvas_camera.width != cw) || (S.canvas_camera.height != ch)) {
        S.canvas_camera.width = cw
        S.canvas_camera.height = ch
      }
    }
    if (rgba instanceof ImageData)
      S.canvas_camera.getContext("2d").putImageData(rgba, 0, 0)
    else
      S.canvas_camera.drawImage(rgba, 0, 0)
  }

  if (rgba instanceof ImageBitmap) rgba.close();
  rgba = undefined;

  S.draw(faces, w, h, options)
}

export function fm_process_facemesh(S, faces, w, h, bb, _t_list) {
  let sx = bb.x
  let sy = bb.y
  let cw = bb.w
  let ch = bb.h

  let scale = 1 / bb.scale;

  S.eyes = []

  let face;
  if (S.use_mediapipe_facemesh) {
    face = {}
    face.faceInViewConfidence = 1
    let min_x = 9999, min_y = 9999, max_x = -9999, max_y = -9999;
    let mesh = [], scaledMesh = [];
    faces.multiFaceLandmarks[0].forEach((f) => {
      var x = f.x * cw
      var y = f.y * ch
      var z = f.z * cw

      min_x = Math.min(min_x, x)
      min_y = Math.min(min_y, y)
      max_x = Math.max(max_x, x)
      max_y = Math.max(max_y, y)

      mesh.push([f.x, f.y, f.z])
      scaledMesh.push([x * scale, y * scale, z * scale])
    });
    face.boundingBox = { topLeft: [min_x * scale, min_y * scale], bottomRight: [max_x * scale, max_y * scale] }
    face.scaledMesh = scaledMesh
    face.mesh = mesh
    const size = Math.max(max_x - min_x, max_y - min_y);
    face.mesh.forEach(coords => {
      coords[0] *= 256 * cw / size;
      coords[1] *= 256 * ch / size;
      coords[2] *= 256 * cw / size;
    });
    faces = [face]
  }
  else {
// obsolete
// not yet considering scale
    face = faces[0]
    if (S.use_human_facemesh) {
      face.faceInViewConfidence = face.confidence
      face.scaledMesh = face.mesh
      face.mesh = face.meshRaw
      face.boundingBox = face.boxRaw
// human v1.1.9+
      face.boundingBox = { topLeft: [face.boxRaw[0] * cw, face.boxRaw[1] * ch], bottomRight: [(face.boxRaw[0] + face.boxRaw[2]) * cw, (face.boxRaw[1] + face.boxRaw[3]) * ch] }
      const size = Math.max(face.boxRaw[2] * cw, face.boxRaw[3] * ch) / 1.5;
      face.mesh.forEach(coords => {
        coords[0] *= 256 * cw / size;
        coords[1] *= 256 * ch / size;
        coords[2] *= 256;
      });
    }
    else if (S.facemesh_version == '@0.0.3') {
      face.boundingBox = { topLeft: face.boundingBox.topLeft[0], bottomRight: face.boundingBox.bottomRight[0] }
    }
  }

  let sm = face.scaledMesh;

  let eye_bb, eye_center, eye_w, eye_h, eye_radius;

// face LR:234,454
// right eye LR: 33,133  TB: 159,145
// left eye  LR: 362,263 TB: 386,374

  let eye_LR = ["L", "R"]

  let m454 = face.mesh[454]
  let m234 = face.mesh[234]
  let dx = m454[0] - m234[0]
  let dy = m454[1] - m234[1]
  let dz = m454[2] - m234[2]
  let dis = Math.sqrt(dx * dx + dy * dy + dz * dz)
  let z_rot = Math.asin(dy / dis)

  for (var i = 0; i < 2; i++) {
    let LR = eye_LR[i]
    if (LR == "L") {
      eye_bb = [[Math.min(sm[33][0], sm[133][0], sm[159][0], sm[145][0]), Math.min(sm[33][1], sm[133][1], sm[159][1], sm[145][1])], [Math.max(sm[33][0], sm[133][0], sm[159][0], sm[145][0]), Math.max(sm[33][1], sm[133][1], sm[159][1], sm[145][1])]];
    }
    else {
      eye_bb = [[Math.min(sm[362][0], sm[263][0], sm[386][0], sm[374][0]), Math.min(sm[362][1], sm[263][1], sm[386][1], sm[374][1])], [Math.max(sm[362][0], sm[263][0], sm[386][0], sm[374][0]), Math.max(sm[362][1], sm[263][1], sm[386][1], sm[374][1])]];
    }

    eye_center = [(eye_bb[0][0] + eye_bb[1][0]) / 2, (eye_bb[0][1] + eye_bb[1][1]) / 2]
    eye_w = eye_bb[1][0] - eye_bb[0][0]
    eye_h = eye_bb[1][1] - eye_bb[0][1]
    eye_radius = Math.max(eye_w, eye_h) / 2

    let yx;
    if (S.use_faceLandmarksDetection) {
// https://github.com/nickthedude/nicksern.es/blob/master/nicksern.es/static/js/face-landmarks-detection/src/mediapipe-facemesh/keypoints.ts
// NOTE: video source is assumed to be mirrored (eg. video L == landmarks R)
      yx = (LR == ((S.use_mediapipe_facemesh) ? "R" : "L")) ? [sm[473][1], sm[473][0]] : [sm[468][1], sm[468][0]];
    }
    else {
      if ((S.gray_w != cw) || (S.gray_h != ch)) {
        S.gray_w = cw
        S.gray_h = ch
        S.gray = new Uint8Array(cw * ch);
      }

      const image = {
        "pixels": S.gray,
        "nrows": ch,
        "ncols": cw,
        "ldim": cw
      };

      let r, c, s;
      r = eye_center[1];
      c = eye_center[0];
      s = eye_radius * 2;
      fm_rgba_to_grayscale(S, S._rgba_ref, eye_center, eye_radius)
      yx = S.do_puploc(r, c, s, 63, image);
    }

    if ((yx[0] >= 0) && (yx[1] >= 0)) {
      let confidence = (0.25 + Math.min(Math.max(eye_radius - 5, 0) / 30, 1) * 0.5)
      dx = (eye_center[0] - yx[1]) / eye_radius
      dy = (eye_center[1] - yx[0]) / eye_radius
      dis = Math.sqrt(dx * dx + dy * dy)
      let eye_z_rot = Math.atan2(dy, dx) - z_rot
      let eye_x = S.eyes_xy_last[i][0] = Math.max(Math.min(Math.cos(eye_z_rot) * dis, 1), -1) * confidence + S.eyes_xy_last[i][0] * (1 - confidence)
      let eye_y = S.eyes_xy_last[i][1] = Math.max(Math.min(Math.sin(eye_z_rot) * dis * Math.max(1.5 - Math.abs(z_rot) / (Math.PI / 4) * 0.5, 1), 1), -1) * confidence + S.eyes_xy_last[i][1] * (1 - confidence)
      S.eyes[i] = [yx[1] + sx, yx[0] + sy, eye_x, eye_y, [LR]]
    }
  }

  if (!S.use_faceLandmarksDetection) {
// practically only the first eye data is used
    if (S.eyes.length) {
      if (!S.eyes[0])
        S.eyes = [S.eyes[1]]

      let eye_x = null
      let eye_y = null
      if (eye_x == null) {
        S.eyes.forEach((e) => { eye_x += e[2] })
        eye_x /= S.eyes.length
      }
      if (eye_y == null) {
        S.eyes.forEach((e) => { eye_y += e[3] })
        eye_y /= S.eyes.length
      }
      S.eyes.forEach((e) => { e[2] = eye_x; e[3] = eye_y; })
      S.eyes[0][4].push(_t_list[1])
    }
  }

  if (sx || sy) {
    sm.forEach(xyz => { xyz[0] += sx; xyz[1] += sy; });
  }

  faces[0].bb = bb;

  faces[0].bb_center = [(face.boundingBox.topLeft[0] + (face.boundingBox.bottomRight[0] - face.boundingBox.topLeft[0]) / 2 + sx) / w / scale, (face.boundingBox.topLeft[1] + (face.boundingBox.bottomRight[1] - face.boundingBox.topLeft[1]) / 2 + sy) / h / scale];

  faces[0].bb_scale = Math.max((face.boundingBox.bottomRight[0] - face.boundingBox.topLeft[0]), (face.boundingBox.bottomRight[1] - face.boundingBox.topLeft[1])) / Math.min(cw, ch);

  return faces
}
