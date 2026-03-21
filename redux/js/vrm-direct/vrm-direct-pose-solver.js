/**
 * VRM Direct Pose Solver (Fase 2)
 *
 * Reads raw BlazePose 33-point world-space landmarks via BroadcastChannel
 * 'vrm_pose' (published each frame by mocap-video-processor.js) and computes
 * VRM humanoid bone quaternions WITHOUT any jThree / MMD dependency.
 *
 * Output is stored in VRMDirectSolver._poseFrames (bones_by_name-compatible)
 * so getMMDBones() priority-1 picks it up transparently.
 *
 * BlazePose world-space:  +X = cam-right (= subject LEFT), +Y = up, +Z = toward cam
 * VRM space (180° Y mesh): +X = subject RIGHT, +Y = up, +Z = toward back
 * → negate X and Z on every landmark.
 *
 * Disabled by default. Activate with: VRMDirectPoseSolver.enable()
 *
 * @module VRMDirectPoseSolver
 */
(function () {
  'use strict';

  // ─── BlazePose 33-point indices ──────────────────────────────────────────
  var LM = {
    NOSE:             0,
    LEFT_SHOULDER:   11,  RIGHT_SHOULDER:  12,
    LEFT_ELBOW:      13,  RIGHT_ELBOW:     14,
    LEFT_WRIST:      15,  RIGHT_WRIST:     16,
    // auxiliary hand landmarks (around the palm)
    LEFT_PINKY:      17,  RIGHT_PINKY:     18,
    LEFT_INDEX:      19,  RIGHT_INDEX:     20,
    LEFT_THUMB:      21,  RIGHT_THUMB:     22,
    LEFT_HIP:        23,  RIGHT_HIP:       24,
    LEFT_KNEE:       25,  RIGHT_KNEE:      26,
    LEFT_ANKLE:      27,  RIGHT_ANKLE:     28,
    LEFT_HEEL:       29,  RIGHT_HEEL:      30,
    LEFT_FOOT:       31,  RIGHT_FOOT:      32
  };

  // ─── OneEuroFilter parameters ────────────────────────────────────────────
  // minCutOff: lower = smoother / more latency
  // beta:      higher = less latency on fast movements
  var FILTER_BODY = { freq: 30, minCutOff: 1.5, beta: 0.3, dCutOff: 1.0 };
  var FILTER_ARMS = { freq: 30, minCutOff: 1.0, beta: 0.7, dCutOff: 1.0 };
  var FILTER_LEGS = { freq: 30, minCutOff: 1.5, beta: 0.3, dCutOff: 1.0 };

  // ─── Module state ─────────────────────────────────────────────────────────
  var _enabled = false;
  var _filters = {};   // boneName → OneEuroFilter (type=4, quaternion [x,y,z,w])
  var _latestLms    = null;   // latest lms array from BroadcastChannel 'vrm_pose'
  var _latestScores = null;   // parallel visibility scores [0-1] per landmark
  var _bc = null;             // BroadcastChannel instance
  var SCORE_THRESH = 0.35;    // below this score a landmark is considered occluded
  var _autoEnabled  = false;  // true when enable() was triggered automatically by first data
  var _lastGoodFrames = {};   // last successfully computed quaternion per bone (for hold-on-loss)

  // ─── THREE accessor ───────────────────────────────────────────────────────
  function _getTHREE() {
    if (window._VRMDirectTHREE) return window._VRMDirectTHREE;
    if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX._THREE || MMD_SA.THREEX.THREE;
    return window.THREE;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function _getFilter(name, cfg) {
    if (!_filters[name]) {
      // type=4 → quaternion mode: filter([x,y,z,w]) → [x,y,z,w]
      _filters[name] = new OneEuroFilter(cfg.freq, cfg.minCutOff, cfg.beta, cfg.dCutOff, 4);
    }
    return _filters[name];
  }

  /** BlazePose landmark → THREE.Vector3 in VRM world space (negate X and Z). */
  function _lmToVec(T, lm) {
    return new T.Vector3(-lm.x, lm.y, -lm.z);
  }

  /** Quaternion that rotates unit vector `from` onto unit vector `to`. Returns null if degenerate. */
  function _quatFromTo(T, from, to) {
    var f = from.clone().normalize();
    var t = to.clone().normalize();
    // Avoid NaN when vectors are nearly antiparallel
    if (f.dot(t) < -0.9999) return null;
    var q = new T.Quaternion();
    q.setFromUnitVectors(f, t);
    // Validate — no NaN
    if (isNaN(q.x) || isNaN(q.y) || isNaN(q.z) || isNaN(q.w)) return null;
    return q;
  }

  /** Run a quaternion through a OneEuroFilter (array [x,y,z,w] round-trip). Returns identity on null input. */
  function _filterQuat(T, filter, q, ts) {
    if (!q) return new T.Quaternion(); // identity — don't crash on degenerate input
    var out = filter.filter([q.x, q.y, q.z, q.w], ts);
    var result = new T.Quaternion(out[0], out[1], out[2], out[3]).normalize();
    // Guard against NaN filter output
    if (isNaN(result.x) || isNaN(result.y) || isNaN(result.z) || isNaN(result.w)) {
      return new T.Quaternion();
    }
    return result;
  }

  /** Returns null if vector is near-zero, otherwise returns new normalized clone. */
  function _safeNorm(v) {
    var l = v.length();
    return (l < 1e-6) ? null : v.clone().divideScalar(l);
  }

  /**
   * Polyfill for Matrix4.makeBasis(x, y, z) — sets rotation columns directly.
   * Works on all THREE builds (some minified builds omit makeBasis).
   */
  function _makeBasis(m, x, y, z) {
    if (typeof m.makeBasis === 'function') {
      m.makeBasis(x, y, z);
    } else {
      // Column-major layout: col0=x, col1=y, col2=z, col3=(0,0,0,1)
      var e = m.elements;
      e[0]=x.x; e[4]=y.x; e[8] =z.x; e[12]=0;
      e[1]=x.y; e[5]=y.y; e[9] =z.y; e[13]=0;
      e[2]=x.z; e[6]=y.z; e[10]=z.z; e[14]=0;
      e[3]=0;   e[7]=0;   e[11]=0;   e[15]=1;
    }
    return m;
  }

  // ─── Per-bone solvers ─────────────────────────────────────────────────────

  /**
   * Hips: builds orthonormal basis from hip-right / torso-up / forward.
   */
  function _computeHips(T, lms, ts) {
    var lHip = _lmToVec(T, lms[LM.LEFT_HIP]);
    var rHip = _lmToVec(T, lms[LM.RIGHT_HIP]);
    var lSh  = _lmToVec(T, lms[LM.LEFT_SHOULDER]);
    var rSh  = _lmToVec(T, lms[LM.RIGHT_SHOULDER]);

    var hipRight = _safeNorm(rHip.clone().sub(lHip));
    var hipMid   = lHip.clone().add(rHip).multiplyScalar(0.5);
    var shMid    = lSh.clone().add(rSh).multiplyScalar(0.5);
    var up       = _safeNorm(shMid.clone().sub(hipMid));
    if (!hipRight || !up) return null;

    var fwd  = hipRight.clone().cross(up).normalize();
    var reUp = fwd.clone().cross(hipRight).normalize();

    var q = new T.Quaternion();
    var m = new T.Matrix4();
    _makeBasis(m, hipRight, reUp, fwd.clone().negate());
    q.setFromRotationMatrix(m).normalize();
    if (isNaN(q.x) || isNaN(q.y) || isNaN(q.z) || isNaN(q.w)) return null;
    return _filterQuat(T, _getFilter('hips', FILTER_BODY), q, ts);
  }

  /**
   * Spine + Chest: same torso plane, two separate filtered channels.
   */
  function _computeSpineChest(T, lms, ts) {
    var lHip = _lmToVec(T, lms[LM.LEFT_HIP]);
    var rHip = _lmToVec(T, lms[LM.RIGHT_HIP]);
    var lSh  = _lmToVec(T, lms[LM.LEFT_SHOULDER]);
    var rSh  = _lmToVec(T, lms[LM.RIGHT_SHOULDER]);

    var shRight = _safeNorm(rSh.clone().sub(lSh));
    var hipMid  = lHip.clone().add(rHip).multiplyScalar(0.5);
    var shMid   = lSh.clone().add(rSh).multiplyScalar(0.5);
    var up      = _safeNorm(shMid.clone().sub(hipMid));
    if (!shRight || !up) return null;

    var fwd  = shRight.clone().cross(up).normalize();
    var reUp = fwd.clone().cross(shRight).normalize();

    var q = new T.Quaternion();
    var m = new T.Matrix4();
    _makeBasis(m, shRight, reUp, fwd.clone().negate());
    q.setFromRotationMatrix(m).normalize();
    if (isNaN(q.x) || isNaN(q.y) || isNaN(q.z) || isNaN(q.w)) return null;

    return {
      spine: _filterQuat(T, _getFilter('spine', FILTER_BODY), q, ts),
      chest: _filterQuat(T, _getFilter('chest', FILTER_BODY), q.clone(), ts)
    };
  }

  /**
   * Neck + Head: shoulder-midpoint → nose direction.
   */
  function _computeNeckHead(T, lms, ts) {
    var lSh  = _lmToVec(T, lms[LM.LEFT_SHOULDER]);
    var rSh  = _lmToVec(T, lms[LM.RIGHT_SHOULDER]);
    var nose = _lmToVec(T, lms[LM.NOSE]);

    var shMid  = lSh.clone().add(rSh).multiplyScalar(0.5);
    var neckUp = _safeNorm(nose.clone().sub(shMid));
    if (!neckUp) return null;

    var q = _quatFromTo(T, new T.Vector3(0, 1, 0), neckUp);
    if (!q) return null;
    return {
      neck: _filterQuat(T, _getFilter('neck', FILTER_BODY), q, ts),
      head: _filterQuat(T, _getFilter('head', FILTER_BODY), q.clone(), ts)
    };
  }

  /**
   * Upper + lower arm for one side.
   * Upper arm: T-pose axis → shoulder-to-elbow direction (world space).
   * Lower arm: relative to upper arm (local space elbow-to-wrist).
   */
  function _computeArm(T, lms, side, shIdx, elIdx, wrIdx, ts) {
    var sh = _lmToVec(T, lms[shIdx]);
    var el = _lmToVec(T, lms[elIdx]);
    var wr = _lmToVec(T, lms[wrIdx]);

    var upperDir = _safeNorm(el.clone().sub(sh));
    if (!upperDir) return null;

    var tpose = (side === 'right') ? new T.Vector3(1, 0, 0) : new T.Vector3(-1, 0, 0);

    var upperQ = _filterQuat(T, _getFilter(side + 'UpperArm', FILTER_ARMS),
                             _quatFromTo(T, tpose, upperDir), ts);

    var lowerDir = _safeNorm(wr.clone().sub(el));
    if (!lowerDir) return { upper: upperQ, lower: new T.Quaternion() };

    // Express wrist direction in upper-arm local space → relative forearm rotation
    var localLower = lowerDir.clone().applyQuaternion(upperQ.clone().conjugate());
    var lowerQ = _filterQuat(T, _getFilter(side + 'LowerArm', FILTER_ARMS),
                             _quatFromTo(T, tpose, localLower), ts);

    return { upper: upperQ, lower: lowerQ };
  }

  /**
   * Upper + lower leg for one side.
   * Upper leg: T-pose axis (0,−1,0) → hip-to-knee direction.
   * Lower leg: relative to upper leg (local space knee-to-ankle).
   */
  function _computeLeg(T, lms, side, hIdx, kIdx, aIdx, ts) {
    var hip   = _lmToVec(T, lms[hIdx]);
    var knee  = _lmToVec(T, lms[kIdx]);
    var ankle = _lmToVec(T, lms[aIdx]);

    var upperDir = _safeNorm(knee.clone().sub(hip));
    if (!upperDir) return null;

    var tpose  = new T.Vector3(0, -1, 0);
    var upperQ = _filterQuat(T, _getFilter(side + 'UpperLeg', FILTER_LEGS),
                             _quatFromTo(T, tpose, upperDir), ts);

    var lowerDir = _safeNorm(ankle.clone().sub(knee));
    if (!lowerDir) return { upper: upperQ, lower: new T.Quaternion() };

    var localAnkle = lowerDir.clone().applyQuaternion(upperQ.clone().conjugate());
    var lowerQ = _filterQuat(T, _getFilter(side + 'LowerLeg', FILTER_LEGS),
                             _quatFromTo(T, tpose, localAnkle), ts);

    return { upper: upperQ, lower: lowerQ };
  }

  /**
   * Wrist / hand bone rotation using the palm-plane geometry.
   *
   * BlazePose provides 4 auxiliary hand landmarks (index 17-22):
   *   pinky-base, index-base, thumb — all in world-space around the wrist.
   * We build an orthonormal palm frame:
   *   forward = midpoint(index-base, pinky-base) − wrist
   *   normal  = forward × (thumb − wrist)  (palm-back direction)
   * Then compute the rotation from the VRM T-pose hand rest direction (0,0,-1).
   *
   * @param {string} side  'left' | 'right'
   */
  function _computeHand(T, lms, side, wristIdx, pinkyIdx, indexIdx, thumbIdx, ts) {
    var wrist = _lmToVec(T, lms[wristIdx]);
    var pinky = _lmToVec(T, lms[pinkyIdx]);
    var idx   = _lmToVec(T, lms[indexIdx]);
    var thumb = _lmToVec(T, lms[thumbIdx]);

    // palm forward: from wrist toward the knuckle midpoint
    var knuckleMid = pinky.clone().add(idx).multiplyScalar(0.5);
    var fwd = _safeNorm(knuckleMid.clone().sub(wrist));
    if (!fwd) return null;

    // palm normal: cross product gives the back-of-hand direction
    var thumbDir = _safeNorm(thumb.clone().sub(wrist));
    if (!thumbDir) return null;
    var normal = _safeNorm(new T.Vector3().crossVectors(fwd, thumbDir));
    if (!normal) return null;

    // rebuild orthonormal right
    var right = _safeNorm(new T.Vector3().crossVectors(normal, fwd));
    if (!right) return null;

    // rotation matrix → quaternion
    // VRM T-pose: hand points along +Z (left) or −Z (right)  → use fwd as target
    var tposeFwd = new T.Vector3(0, 0, side === 'left' ? 1 : -1);
    var palmQ = _quatFromTo(T, tposeFwd, fwd);

    return _filterQuat(T, _getFilter(side + 'Hand', FILTER_ARMS), palmQ, ts);
  }

  /**
   * Foot bone rotation.
   * Uses ankle → foot-index direction to compute the plantar flex / dorsiflexion.
   *
   * @param {string} side  'left' | 'right'
   */
  function _computeFoot(T, lms, side, ankleIdx, heelIdx, toeIdx, ts) {
    var ankle = _lmToVec(T, lms[ankleIdx]);
    var heel  = _lmToVec(T, lms[heelIdx]);
    var toe   = _lmToVec(T, lms[toeIdx]);

    // foot forward: heel → toe
    var fwd = _safeNorm(toe.clone().sub(heel));
    if (!fwd) return null;

    // VRM T-pose foot direction is (0, 0, 1) for left, (0, 0, 1) for right
    var tposeFwd = new T.Vector3(0, 0, 1);
    var footQ = _quatFromTo(T, tposeFwd, fwd);
    return _filterQuat(T, _getFilter(side + 'Foot', FILTER_LEGS), footQ, ts);
  }

  // ─── Main update ──────────────────────────────────────────────────────────

  /**
   * Run one solver frame.
   * Called every tick by VRMDirectAnimator (before solveBody).
   * No-op when disabled.
   */
  /** Returns true only if ALL given landmark indices have score >= SCORE_THRESH. */
  function _ok(/* ...indices */) {
    if (!_latestScores) return true; // no scores → always proceed
    for (var i = 0; i < arguments.length; i++) {
      var s = _latestScores[arguments[i]];
      if (s != null && s < SCORE_THRESH) return false;
    }
    return true;
  }

  function update() {
    if (!_enabled) return;

    var T = _getTHREE();
    if (!T) return;

    var lms = _latestLms;
    if (!lms || lms.length < 29) return;

    var ts = performance.now() / 1000;
    var frames = {};

    // Hips (always compute — anchors everything else)
    if (_ok(LM.LEFT_HIP, LM.RIGHT_HIP)) {
      var hipsQ = _computeHips(T, lms, ts);
      if (hipsQ) frames['hips'] = hipsQ;
      // NOTE: _hipsPosition intentionally NOT set from Fase 2.
      // BlazePose world-space coords (meters, hip-centered) don't map cleanly
      // to VRM local bone offsets. Hip translation comes from Fase-1 / bones_by_name.
    }

    // Spine + chest
    if (_ok(LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER)) {
      var sc = _computeSpineChest(T, lms, ts);
      if (sc) {
        frames['spine'] = sc.spine;
        frames['chest'] = sc.chest;
      }
    }

    // Neck + head intentionally omitted from Fase 2:
    // BlazePose has no true neck/head landmarks (only nose + shoulders), so the
    // derived orientation is noisy and fights the face solver.  Let face tracking
    // (threex-vrm.js / facemesh) own neck and head entirely.

    // Left arm
    if (_ok(LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST)) {
      var lA = _computeArm(T, lms, 'left',
        LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST, ts);
      if (lA) {
        frames['leftUpperArm'] = lA.upper;
        frames['leftLowerArm'] = lA.lower;
      }
    }

    // Right arm
    if (_ok(LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST)) {
      var rA = _computeArm(T, lms, 'right',
        LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST, ts);
      if (rA) {
        frames['rightUpperArm'] = rA.upper;
        frames['rightLowerArm'] = rA.lower;
      }
    }

    // Wrist / hand bones (uses auxiliary palm landmarks 17-22)
    if (_ok(LM.LEFT_WRIST, LM.LEFT_PINKY, LM.LEFT_INDEX)) {
      var lH = _computeHand(T, lms, 'left',
        LM.LEFT_WRIST, LM.LEFT_PINKY, LM.LEFT_INDEX, LM.LEFT_THUMB, ts);
      if (lH) frames['leftHand'] = lH;
    }

    if (_ok(LM.RIGHT_WRIST, LM.RIGHT_PINKY, LM.RIGHT_INDEX)) {
      var rH = _computeHand(T, lms, 'right',
        LM.RIGHT_WRIST, LM.RIGHT_PINKY, LM.RIGHT_INDEX, LM.RIGHT_THUMB, ts);
      if (rH) frames['rightHand'] = rH;
    }

    // Left leg
    if (_ok(LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE)) {
      var lL = _computeLeg(T, lms, 'left',
        LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE, ts);
      if (lL) {
        frames['leftUpperLeg'] = lL.upper;
        frames['leftLowerLeg'] = lL.lower;
      }
    }

    // Right leg
    if (_ok(LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE)) {
      var rL = _computeLeg(T, lms, 'right',
        LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE, ts);
      if (rL) {
        frames['rightUpperLeg'] = rL.upper;
        frames['rightLowerLeg'] = rL.lower;
      }
    }

    // Feet (ankle orientation from heel → toe)
    if (_ok(LM.LEFT_ANKLE, LM.LEFT_HEEL, LM.LEFT_FOOT)) {
      var lF = _computeFoot(T, lms, 'left',
        LM.LEFT_ANKLE, LM.LEFT_HEEL, LM.LEFT_FOOT, ts);
      if (lF) frames['leftFoot'] = lF;
    }

    if (_ok(LM.RIGHT_ANKLE, LM.RIGHT_HEEL, LM.RIGHT_FOOT)) {
      var rF = _computeFoot(T, lms, 'right',
        LM.RIGHT_ANKLE, LM.RIGHT_HEEL, LM.RIGHT_FOOT, ts);
      if (rF) frames['rightFoot'] = rF;
    }

    // ─── Hold-on-loss: fill any missing bones from last good frame ───────────
    // This prevents the VRM from snapping to T-pose when landmarks are briefly
    // occluded (e.g. hands leave frame). Mirrors the MMD model's stable fallback.
    for (var boneName in _lastGoodFrames) {
      if (!(boneName in frames)) frames[boneName] = _lastGoodFrames[boneName];
    }
    // Update cache with fresh data
    for (var freshBone in frames) {
      _lastGoodFrames[freshBone] = frames[freshBone];
    }

    // Publish — merged into solveBody() via Object.assign
    if (window.VRMDirectSolver) VRMDirectSolver._poseFrames = frames;
  }

  /**
   * Called internally when BroadcastChannel receives the first message.
   * Resets filters exactly like a manual enable() call.
   */
  function _onFirstData() {
    if (_enabled) return;
    _enabled        = true;
    _autoEnabled    = true;
    _filters        = {};
    _lastGoodFrames = {};
    console.log('[VRMDirect] PoseSolver AUTO-ENABLED on first pose data (Fase 2)');
  }

  function pushPoseData(data) {
    if (!data) return;

    if (data && data.lms) {
      _onFirstData();
      _latestLms = data.lms;
      _latestScores = data.scores || null;
      return;
    }

    if (Array.isArray(data)) {
      _onFirstData();
      _latestLms = data;
      _latestScores = null;
    }
  }

  /**
   * Open the BroadcastChannel listener immediately so auto-enable works
   * as soon as the worker starts broadcasting — no manual enable() needed.
   */
  function _initChannel() {
    if (_bc) return;
    try {
      _bc = new BroadcastChannel('vrm_pose');
      _bc.onmessage = function (e) {
        var data = e.data;
        if (data && data.lms) {
          _onFirstData();
          _latestLms    = data.lms;
          _latestScores = data.scores || null;
        } else if (Array.isArray(data)) {
          _onFirstData();
          _latestLms    = data;
          _latestScores = null;
        }
      };
    } catch(e) {
      console.warn('[VRMDirect] BroadcastChannel unavailable:', e);
    }
  }

  /**
   * Enable standalone IK (Fase 2).
   * Resets all filters so first frame starts clean.
   */
  function enable() {
    _enabled      = true;
    _autoEnabled  = false;
    _filters      = {};
    _lastGoodFrames = {};
    _latestLms    = null;
    _latestScores = null;
    _initChannel();
    console.log('[VRMDirect] PoseSolver ENABLED (Fase 2 — raw BlazePose IK, no jThree)');
  }

  /**
   * Disable standalone IK — pipeline falls back to frames.skin or jThree.
   * If `permanent` is true the BroadcastChannel is also closed (stops auto-enable).
   * Default (no arg): only disables processing, channel stays open for re-enable.
   */
  function disable(permanent) {
    _enabled        = false;
    _autoEnabled    = false;
    _latestLms      = null;
    _latestScores   = null;
    _lastGoodFrames = {};
    if (permanent && _bc) { _bc.close(); _bc = null; }
    if (window.VRMDirectSolver) VRMDirectSolver._poseFrames = null;
    console.log('[VRMDirect] PoseSolver disabled (fallback: frames.skin / jThree)');
  }

  // ─── Auto-init channel on load ───────────────────────────────────────────
  // Opens the BroadcastChannel immediately so Fase 2 activates automatically
  // the moment the pose worker starts sending data — no manual enable() needed.
  _initChannel();

  // ─── Public API ──────────────────────────────────────────────────────────
  window.VRMDirectPoseSolver = {
    update:    update,
    enable:    enable,
    disable:   disable,
    pushPoseData: pushPoseData,
    isEnabled: function () { return _enabled; },
    /** Adjust landmark visibility threshold (default 0.35). Lower = more permissive. */
    setScoreThresh: function (v) { SCORE_THRESH = v; },
    /** Close the channel and stop auto-enable. Call to fully shut down Fase 2. */
    disablePermanent: function () { disable(true); }
  };

})();
