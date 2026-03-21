/**
 * VRM Direct Solver
 * 
 * Reads tracking data from the existing MediaPipe → MMD pipeline
 * and provides it in VRM-ready format for application to a separate VRM model.
 * 
 * Data sources:
 * - Body bones: MMD mesh bone quaternions (TX._THREE.MMD)
 * - Face blendshapes: facemesh.frames.morph (ARKit blendshapes from MediaPipe)
 * 
 * @module VRMDirectSolver
 */
(function() {
  'use strict';

  // ─── MMD bone name → VRM humanoid bone name (same as threex-vrm.js) ───
  var BONE_MAP = {
    'センター': 'hips',
    '上半身':   'spine',
    '上半身2':  'chest',
    '上半身3':  'upperChest',
    '首':       'neck',
    '頭':       'head',

    '右肩':     'rightShoulder',
    '右腕':     'rightUpperArm',
    '右ひじ':   'rightLowerArm',
    '右手首':   'rightHand',
    '右親指０': 'rightThumbMetacarpal',
    '右親指１': 'rightThumbProximal',
    '右親指２': 'rightThumbDistal',
    '右小指１': 'rightLittleProximal',
    '右小指２': 'rightLittleIntermediate',
    '右小指３': 'rightLittleDistal',
    '右薬指１': 'rightRingProximal',
    '右薬指２': 'rightRingIntermediate',
    '右薬指３': 'rightRingDistal',
    '右中指１': 'rightMiddleProximal',
    '右中指２': 'rightMiddleIntermediate',
    '右中指３': 'rightMiddleDistal',
    '右人指１': 'rightIndexProximal',
    '右人指２': 'rightIndexIntermediate',
    '右人指３': 'rightIndexDistal',

    '左肩':     'leftShoulder',
    '左腕':     'leftUpperArm',
    '左ひじ':   'leftLowerArm',
    '左手首':   'leftHand',
    '左親指０': 'leftThumbMetacarpal',
    '左親指１': 'leftThumbProximal',
    '左親指２': 'leftThumbDistal',
    '左小指１': 'leftLittleProximal',
    '左小指２': 'leftLittleIntermediate',
    '左小指３': 'leftLittleDistal',
    '左薬指１': 'leftRingProximal',
    '左薬指２': 'leftRingIntermediate',
    '左薬指３': 'leftRingDistal',
    '左中指１': 'leftMiddleProximal',
    '左中指２': 'leftMiddleIntermediate',
    '左中指３': 'leftMiddleDistal',
    '左人指１': 'leftIndexProximal',
    '左人指２': 'leftIndexIntermediate',
    '左人指３': 'leftIndexDistal',

    '右目':     'rightEye',
    '左目':     'leftEye',

    '右足':     'rightUpperLeg',
    '右ひざ':   'rightLowerLeg',
    '右足首':   'rightFoot',
    '右足先EX': 'rightToes',
    '左足':     'leftUpperLeg',
    '左ひざ':   'leftLowerLeg',
    '左足首':   'leftFoot',
    '左足先EX': 'leftToes'
  };

  // Bones that require special computation (not a simple copy)
  var SPECIAL_BONES = {
    'センター': true, '全ての親': true, 'グルーブ': true,
    '腰': true, '下半身': true, '上半身': true,
    '左腕捩': true, '右腕捩': true, '左手捩': true, '右手捩': true
  };

  // ─── Finger bone VRM names — need extra quaternion smoothing ───
  // The original jThree path applies per-bone OneEuroFilter(30,1,1,1,4) to rotation
  // references. The VRM Direct path bypasses jThree entirely, so finger bones read
  // from bones_by_name have NO additional quaternion-level filtering — only the
  // worker-layer landmark filter (beta=0.001). This causes visible jitter.
  var FINGER_BONES = {
    'rightThumbMetacarpal':1, 'rightThumbProximal':1, 'rightThumbDistal':1,
    'rightLittleProximal':1, 'rightLittleIntermediate':1, 'rightLittleDistal':1,
    'rightRingProximal':1, 'rightRingIntermediate':1, 'rightRingDistal':1,
    'rightMiddleProximal':1, 'rightMiddleIntermediate':1, 'rightMiddleDistal':1,
    'rightIndexProximal':1, 'rightIndexIntermediate':1, 'rightIndexDistal':1,
    'leftThumbMetacarpal':1, 'leftThumbProximal':1, 'leftThumbDistal':1,
    'leftLittleProximal':1, 'leftLittleIntermediate':1, 'leftLittleDistal':1,
    'leftRingProximal':1, 'leftRingIntermediate':1, 'leftRingDistal':1,
    'leftMiddleProximal':1, 'leftMiddleIntermediate':1, 'leftMiddleDistal':1,
    'leftIndexProximal':1, 'leftIndexIntermediate':1, 'leftIndexDistal':1
  };

  // OneEuroFilter config for finger bone quaternions.
  // minCutOff=1: moderate smoothing floor (matches hand landmark filters)
  // beta=0.5: moderate speed-adaptation (less than arms@0.7, more than body@0.3)
  // Matches the dual-layer original: worker filters landmarks, then jThree filters quats.
  var FILTER_FINGERS = { freq: 30, minCutOff: 1.0, beta: 0.5, dCutOff: 1.0 };
  var _fingerFilters = {};  // vrmName → OneEuroFilter (type=4, quaternion)

  function _getFingerFilter(vrmName) {
    if (!_fingerFilters[vrmName] && typeof OneEuroFilter === 'function') {
      _fingerFilters[vrmName] = new OneEuroFilter(
        FILTER_FINGERS.freq, FILTER_FINGERS.minCutOff,
        FILTER_FINGERS.beta, FILTER_FINGERS.dCutOff, 4
      );
    }
    return _fingerFilters[vrmName];
  }

  /** Apply OneEuroFilter to a finger bone quaternion (reduces jitter from raw bones_by_name). */
  function _filterFingerQuat(T, vrmName, q) {
    var filter = _getFingerFilter(vrmName);
    if (!filter) return q;
    var ts = performance.now();
    var out = filter.filter([q.x, q.y, q.z, q.w], ts);
    var result = new T.Quaternion(out[0], out[1], out[2], out[3]).normalize();
    if (isNaN(result.x) || isNaN(result.y) || isNaN(result.z) || isNaN(result.w)) return q;
    return result;
  }

  // Lazy-init temp quaternion (THREE only available after jThree_ready)
  var _q1 = null;

  // Snapshot de morphs/expresiones (escrito opcionalmente por threex-vrm.js mientras MMD corra).
  // Variable PRIVADA — no expuesta en el API público.
  var _autoAnimSnapshot = null;

  // Estado del auto-blink propio (fallback standalone — siempre activo cuando no hay snapshot)
  var _autoBlinkState = {
    phase:         0,
    nextBlink:     3.0,
    blinkDuration: 0.15,
    minInterval:   3.5,
    maxInterval:   2.5
  };

  function _getTHREE() {
    if (window._VRMDirectTHREE) return window._VRMDirectTHREE;
    if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX._THREE || MMD_SA.THREEX.THREE;
    return window.THREE;
  }

  /**
   * Adapta frames.skin de SA core a la interfaz de bones_by_name.
   * frames.skin[boneName] = [currentFrame, prevFrame]
   * currentFrame = { rot: Quaternion, pos: Vector3, t_delta, t_delta_frame }
   */
  function _wrapFramesSkin(skin) {
    var T = _getTHREE();
    var wrapped = {};
    for (var boneName in skin) {
      var frames = skin[boneName];
      if (!frames || !frames[0]) continue;
      var cur  = frames[0];
      var prev = frames[1];
      var q;
      if (prev && prev.rot && cur.t_delta_frame > 0) {
        var ratio = Math.max(0, Math.min(cur.t_delta / cur.t_delta_frame, 1));
        q = prev.rot.clone().slerp(cur.rot, ratio);
      } else {
        q = cur.rot ? cur.rot.clone() : new T.Quaternion();
      }
      wrapped[boneName] = { quaternion: q };
      if (cur.pos) wrapped[boneName].position = cur.pos.clone();
    }
    return wrapped;
  }

  /**
   * Get bone rotation data from the best available MMD-named source.
   *
   * Returns MMD-named bone objects ({ quaternion }) used by solveBody()'s BONE_MAP loop.
   * Provides body + finger bones for the Fase-1 path, and FINGER bones as fallback
   * when Fase 2 (VRMDirectPoseSolver) is active.
   *
   * Body-bone overrides from _poseFrames (Fase 2, VRM-named) are applied AFTER
   * this function returns, at the end of solveBody().
   *
   * Priority 1: System._browser…frames.skin  (SA IK — body+fingers during tracking)
   * Priority 2: MMD bones_by_name            (read-only mirror — VMD + idle, always avail)
   *
   * @returns {Object|null}
   */
  function getMMDBones() {
    // NOTE: VRMDirectSolver._poseFrames (Fase 2) is intentionally NOT handled here.
    // _poseFrames uses VRM bone names (hips, leftUpperArm…), while this function returns
    // MMD-named bone sources used by solveBody()'s BONE_MAP loop.
    // Fase 2 body overrides are merged AFTER the loop in solveBody().
    //
    // Priority 1: bones_by_name del MMD — the FINAL post-physics, post-IK state of every
    // bone AFTER the MMD rendering pipeline has run (spring bones, foot IK, SA IK, etc.).
    // This is always richer than frames.skin and matches exactly what the MMD model shows.
    try {
      var models = window.THREE && THREE.MMD && THREE.MMD.getModels();
      if (models && models[0] && models[0].mesh && models[0].mesh.bones_by_name) {
        return models[0].mesh.bones_by_name;
      }
    } catch(e) {}

    // Priority 2: frames.skin de SA core — raw SA IK result before physics.
    // Used when bones_by_name is unavailable (MMD model not yet loaded).
    try {
      var skin = System._browser.camera.poseNet.frames.skin;
      if (skin && Object.keys(skin).length > 0) return _wrapFramesSkin(skin);
    } catch(e) {}

    return null;
  }

  /**
   * Flip x and z in a quaternion.
   * Mathematically equivalent to conjugating by a 180° Y rotation:
   *   R^-1 * q * R  where R = (0,1,0,0)
   * Required because we rotate the VRM mesh 180° around Y to face the camera.
   * (Same operation threex-vrm.js applies via process_rotation for VRM 0.x)
   */
  function flipForMeshRotation(q) {
    q.x *= -1;
    q.z *= -1;
    return q;
  }

  /**
   * Solve body bone rotations by reading from MMD mesh bones.
   *
   * @param {boolean} isVRM1 - true if target VRM is version 1.0
   * @returns {Object|null} { vrmBoneName: THREE.Quaternion, _hipsPosition: THREE.Vector3 }
   */
  function solveBody(isVRM1) {
    var bones = getMMDBones();
    // If no MMD bones AND no Fase-2 pose frames, there's nothing to apply.
    if (!bones && !(window.VRMDirectSolver && VRMDirectSolver._poseFrames)) return null;

    var T = _getTHREE();
    if (!T) return null;
    if (!_q1) _q1 = new T.Quaternion();
    var result = {};

    // ─── Fase-1 path: read from MMD-named bones ─────────────────────────────
    // Skipped when bones is null (Fase-2-only mode, no MMD/jThree running).
    // In Fase-2-with-MMD mode, this fills finger bones + any bones not in _poseFrames.
    if (bones) {

      // ─── Regular bones: direct quaternion copy ───
      for (var mmdName in BONE_MAP) {
        if (SPECIAL_BONES[mmdName]) continue;

        var vrmName = BONE_MAP[mmdName];
        var mmdBone = bones[mmdName];
        if (!mmdBone) continue;

        var q = mmdBone.quaternion.clone();
        flipForMeshRotation(q);

        // Apply OneEuroFilter smoothing to finger bone quaternions.
        // Replaces the per-bone quaternion filter that jThree/index.js provides
        // in the original render path but is absent in VRM Direct.
        if (FINGER_BONES[vrmName]) {
          q = _filterFingerQuat(T, vrmName, q);
        }

        result[vrmName] = q;
      }

      // ─── Hips rotation: compose root × center × groove × waist × lower_body ───
      // (same order as threex-vrm.js: 全ての親 premultiply after センター×グルーブ×腰, then ×下半身)
      var hipsRot = new T.Quaternion();
      var hipBones = ['全ての親', 'センター', 'グルーブ', '腰', '下半身'];
      for (var i = 0; i < hipBones.length; i++) {
        var bone = bones[hipBones[i]];
        if (bone) hipsRot.multiply(bone.quaternion);
      }
      flipForMeshRotation(hipsRot);
      result['hips'] = hipsRot;

      // ─── Spine rotation: inverse(lower_body) × upper_body ───
      var lowerBody = bones['下半身'];
      var upperBody = bones['上半身'];
      if (lowerBody && upperBody) {
        var spineRot = lowerBody.quaternion.clone().conjugate();
        spineRot.multiply(upperBody.quaternion.clone());
        flipForMeshRotation(spineRot);
        result['spine'] = spineRot;
      }

      // ─── Arm twist bones (腕捩=upper arm twist, 手捩=lower arm twist) ───
      var sides = ['左', '右'];
      var sideVRM = ['left', 'right'];
      var twistParts = [['腕', 'Upper'], ['手', 'Lower']];

      for (var si = 0; si < sides.length; si++) {
        var lr = sides[si];
        var dir = sideVRM[si];
        var signDir = (si === 0) ? 1 : -1;

        for (var ti = 0; ti < twistParts.length; ti++) {
          var twistBone = bones[lr + twistParts[ti][0] + '捩'];
          if (!twistBone) continue;

          try {
            var axisAngle = twistBone.quaternion.toAxisAngle();
            var axis  = axisAngle[0];
            var angle = axisAngle[1];
            if (angle) {
              var sign = (Math.sign(axis.x) === signDir) ? 1 : -1;
              var twistVrmName = dir + twistParts[ti][1] + 'Arm';
              _q1.setFromAxisAngle(
                new T.Vector3(signDir * sign, 0, 0), angle
              );
              flipForMeshRotation(_q1);
              if (result[twistVrmName]) {
                result[twistVrmName].multiply(_q1.clone());
              }
            }
          } catch (e) { /* toAxisAngle might not be available */ }
        }
      }

      // ─── Hips position from center bone ───
      var centerBone = bones['センター'];
      if (centerBone && centerBone.position) {
        var pos = centerBone.position.clone();
        pos.x *= -1; pos.z *= -1;
        result._hipsPosition = pos;
      }

    } // end if (bones)

    // ─── Fase 2 supplement ───
    // _poseFrames (Fase 2) only fills bones that Fase 1 did NOT already provide.
    // When frames.skin (SA IK) is running it owns all body bones, so the VRM tracks
    // identically to the MMD model — stable fallback positions, consistent hands.
    // Fase 2 only takes over a bone when Fase 1 has no data for it (e.g. standalone mode).
    if (window.VRMDirectSolver && VRMDirectSolver._poseFrames) {
      var pf = VRMDirectSolver._poseFrames;
      for (var pfKey in pf) {
        if (pfKey === '_hipsPosition') continue; // never take hips position from Fase 2
        if (!(pfKey in result)) {
          result[pfKey] = pf[pfKey];
        }
      }
    }

    return result;
  }

  // ─── MMD morph name → VRM 1.0 expression name (kept for reference) ───
  // Not used directly — threex-vrm.js zeros the MMD morphs before our code runs.

  /**
   * Solve face expressions by reading ARKit blendshapes from MediaPipe facemesh
   * and mapping them to standard VRM 1.0 expressions.
   *
   * This is the REAL face tracking data — same source as threex-vrm.js line 649-655.
   * threex-vrm.js zeroes the MMD morphs after reading them, so we CANNOT read from
   * morphs_weight_by_name. Instead we read directly from facemesh.frames.morph.
   *
   * @returns {Object|null} { vrmExpressionName: weight, ... }
   */
  var _faceDiagDone = false;

  function solveMMDMorphExpressions() {
    try {
      // Try multiple paths to get face data
      var facemesh, f;
      try { facemesh = System._browser.camera.facemesh; } catch(e) { return null; }
      if (!facemesh) return null;

      f = facemesh.frames;
      if (!f || !f.morph) return null;

      // One-time diagnostic
      if (!_faceDiagDone) {
        _faceDiagDone = true;
        var morphKeys = Object.keys(f.morph);
        var sample = {};
        ['JawOpen','EyeBlinkLeft','MouthSmileLeft','CheekPuff'].forEach(function(k) {
          var m = f.morph[k];
          sample[k] = m ? { w: m[0] && m[0].weight, td: m[0] && m[0].t_delta } : 'MISSING';
        });
        console.log('[VRMDirect] Face diag:', {
          enabled: facemesh.enabled,
          use_faceBlendshapes: facemesh.use_faceBlendshapes,
          cam_init: System._browser.camera.initialized,
          morphKeys: morphKeys.length,
          firstKeys: morphKeys.slice(0, 5),
          sample: sample
        });
      }

      // Helper: get interpolated ARKit blendshape value
      function getBS(name) {
        var m = f.morph[name];
        if (!m || !m[0]) return 0;
        var ratio = Math.max(Math.min(m[0].t_delta / m[0].t_delta_frame, 1), 0);
        return m[0].weight * ratio + m[1].weight * (1 - ratio);
      }

      var result = {};

      // ─── Mouth vowels: ARKit → Japanese vowel expressions ───
      // あ (aa) — jaw open
      result['aa'] = getBS('JawOpen');

      // い (ih) — mouth stretch (wide)
      var mouthStretch = (getBS('MouthStretchLeft') + getBS('MouthStretchRight')) * 0.5;
      result['ih'] = mouthStretch;

      // う (ou) — mouth pucker
      result['ou'] = getBS('MouthPucker');

      // え (ee) — mouth smile + funnel
      result['ee'] = (getBS('MouthSmileLeft') + getBS('MouthSmileRight')) * 0.5;

      // お (oh) — mouth funnel (rounded)
      result['oh'] = getBS('MouthFunnel');

      // ─── Blink ───
      var blinkL = getBS('EyeBlinkLeft');
      var blinkR = getBS('EyeBlinkRight');
      var smile = (getBS('MouthSmileLeft') + getBS('MouthSmileRight')) * 0.5;
      var blinkFactor = 1 - smile * 0.25;
      result['blinkLeft']  = blinkL * blinkFactor;
      result['blinkRight'] = blinkR * blinkFactor;

      // ─── Emotions ───
      result['happy']   = smile * 0.7;
      result['angry']   = Math.min((getBS('BrowDownLeft') + getBS('BrowDownRight')) * 0.5, 1) * 0.6;
      result['sad']     = Math.min(getBS('BrowInnerUp') * 0.5 + (getBS('MouthFrownLeft') + getBS('MouthFrownRight')) * 0.25, 1) * 0.5;
      result['relaxed'] = (getBS('EyeSquintLeft') + getBS('EyeSquintRight')) * 0.2 * (1 - (result['angry'] || 0));

      // Filter out very small values
      for (var key in result) {
        if (result[key] < 0.01) delete result[key];
      }

      if (Object.keys(result).length === 0) return null;
      return result;
    } catch (e) {
      return null;
    }
  }

  /**
   * Solve face expressions from MediaPipe ARKit blendshapes.
   *
   * Reads from System._browser.camera.facemesh.frames.morph and
   * interpolates between current and previous frame values.
   * Returns raw ARKit blendshape weights for VRMs with custom ARKit expressions.
   *
   * @returns {Object|null} { arkitName: weight (0-1), ... }
   */
  function solveFace() {
    try {
      var facemesh;
      try { facemesh = System._browser.camera.facemesh; } catch(e) { return null; }
      if (!facemesh) return null;

      var f = facemesh.frames;
      if (!f || !f.morph) return null;

      var list = facemesh.faceBlendshapes_list;
      if (!list) return null;

      var result = {};
      for (var idx = 0; idx < list.length; idx++) {
        var name = list[idx];
        var m = f.morph[name];
        if (!m || !m[0]) continue;

        // Interpolate current/previous frame (same as threex-vrm.js)
        var ratio = Math.max(Math.min(m[0].t_delta / m[0].t_delta_frame, 1), 0);
        var weight = m[0].weight * ratio + m[1].weight * (1 - ratio);
        if (weight > 0.001) result[name] = weight;
      }

      if (Object.keys(result).length === 0) return null;
      return result;
    } catch (e) {
      return null;
    }
  }

  // ─── MMD morph name → VRM expression name maps ───
  // Same tables as threex-vrm.js lines 967-1022
  var MMD_TO_VRM1 = {
    'あ': 'aa', 'あ２': 'aa',
    'い': 'ih',
    'う': 'ou',
    'え': 'ee',
    'お': 'oh',
    'まばたき': 'blink',
    'まばたきL': 'blinkLeft', 'ウィンク': 'blinkLeft', 'ウィンク２': 'blinkLeft',
    'まばたきR': 'blinkRight', 'ウィンク右': 'blinkRight', 'ｳｨﾝｸ２右': 'blinkRight',
    'にこり': 'relaxed',
    '困る': 'sad',
    '怒り': 'angry',
    '笑い': 'happy'
  };

  var MMD_TO_VRM0 = {
    'あ': 'a', 'あ２': 'a',
    'い': 'i',
    'う': 'u',
    'え': 'e',
    'お': 'o',
    'まばたき': 'blink',
    'まばたきL': 'blink_l', 'ウィンク': 'blink_l', 'ウィンク２': 'blink_l',
    'まばたきR': 'blink_r', 'ウィンク右': 'blink_r', 'ｳｨﾝｸ２右': 'blink_r',
    'にこり': 'fun',
    '困る': 'sorrow',
    '怒り': 'angry',
    '笑い': 'joy'
  };

  /**
   * Fallback face solver: reads the ALWAYS-AVAILABLE MMD morph names from
   * facemesh.frames.morph (あ, い, う, え, お, まばたき, etc.) and maps
   * them to VRM expression names.  Used when ARKit blendshape keys are not
   * present (i.e. main model's use_faceBlendshapes is false).
   *
   * @param {boolean} isVRM1 - true → VRM 1.0 names; false → VRM 0.x names
   * @returns {Object|null} { vrmExpressionName: weight, ... }
   */
  var _mmdFallbackDiagDone = false;

  function solveMMDMorphFallback(isVRM1) {
    try {
      var facemesh;
      try { facemesh = System._browser.camera.facemesh; } catch(e) { return null; }
      if (!facemesh || !facemesh.enabled) return null;

      var f = facemesh.frames;
      if (!f || !f.morph) return null;

      var map = isVRM1 !== false ? MMD_TO_VRM1 : MMD_TO_VRM0;
      var result = {};
      var found = 0;

      for (var mmdName in map) {
        var m = f.morph[mmdName];
        if (!m || !m[0]) continue;
        var ratio = Math.max(Math.min(m[0].t_delta / m[0].t_delta_frame, 1), 0);
        var weight = m[0].weight * ratio + m[1].weight * (1 - ratio);
        if (weight > 0.01) {
          result[map[mmdName]] = Math.max(result[map[mmdName]] || 0, weight);
          found++;
        }
      }

      // One-time diagnostic
      if (!_mmdFallbackDiagDone && found > 0) {
        _mmdFallbackDiagDone = true;
        console.log('[VRMDirect] MMD morph fallback diag:', {
          isVRM1: isVRM1,
          morphKeysTotal: Object.keys(f.morph).length,
          mmdKeysFound: found,
          sample: result
        });
      }

      return found > 0 ? result : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Return automatic animation weights (auto blink, VMD motion morphs).
   *
   * PRIMARY: threex-vrm.js snapshots VRM expression names into _autoAnimSnapshot
   * before zeroing MMD morph weights — includes VMD keyframes + morph_noise.
   *
   * FALLBACK: sinusoidal auto-blink (standalone, no MMD required).
   *
   * @param {boolean} isVRM1
   * @param {number}  dt  delta-time in seconds
   * @returns {Object|null}
   */
  function solveAutoAnim(isVRM1, dt) {
    // Primario: snapshot de morphs (nombres VRM) — escrito por threex-vrm.js si MMD corre
    var snap = _autoAnimSnapshot;
    if (snap && Object.keys(snap).length > 0) {
      _autoAnimSnapshot = null;  // consumir — evita datos obsoletos
      return snap;
    }

    // Fallback standalone: auto-blink sinusoidal (cuando no hay snapshot MMD)
    var s = _autoBlinkState;
    s.phase += (dt || 0.016);
    if (s.phase >= s.nextBlink) {
      var t = s.phase - s.nextBlink;
      if (t < s.blinkDuration) {
        var bw = Math.sin((t / s.blinkDuration) * Math.PI);
        var blinkResult = {};
        blinkResult[isVRM1 !== false ? 'blinkLeft'  : 'blink_l'] = bw;
        blinkResult[isVRM1 !== false ? 'blinkRight' : 'blink_r'] = bw;
        return blinkResult;
      } else if (t > s.blinkDuration + 0.05) {
        s.nextBlink = s.phase + s.minInterval + Math.random() * s.maxInterval;
      }
    }
    return null;
  }

  /**
   * Check if body tracking is currently active
   * @returns {boolean}
   */
  function isTrackingActive() {
    try {
      return !!(
        System._browser.camera.poseNet &&
        System._browser.camera.poseNet.enabled &&
        System._browser.camera.initialized
      );
    } catch (e) {
      return false;
    }
  }

  // ─── Public API ───
  window.VRMDirectSolver = {
    BONE_MAP:                   BONE_MAP,
    solveBody:                  solveBody,
    solveMMDMorphExpressions:   solveMMDMorphExpressions,
    solveFace:                  solveFace,
    solveMMDMorphFallback:      solveMMDMorphFallback,
    solveAutoAnim:              solveAutoAnim,
    isTrackingActive:           isTrackingActive,
    // setAnimSnapshot: optional bridge — called by threex-vrm.js if MMD is running.
    // In full-standalone mode this is never called; auto-blink fallback handles blinking.
    setAnimSnapshot: function(snap) { _autoAnimSnapshot = snap; },
    _poseFrames:                null   // written by vrm-direct-pose-solver.js (Fase 2)
  };

})();
