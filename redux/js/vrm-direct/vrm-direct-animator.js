/**
 * VRM Direct Animator
 * 
 * Per-frame animation loop that reads tracking data via VRMDirectSolver
 * and applies it to the direct VRM model.
 *
 * Scheduling (auto-detected at start):
 *   - SA scheduler (System._browser.on_animation_update) when MMD is running
 *   - requestAnimationFrame loop when running standalone
 *
 * Pose source priority (resolved per-frame in getMMDBones):
 *   1. VRMDirectPoseSolver._poseFrames  (Fase 2 — raw BlazePose IK)
 *   2. System._browser…frames.skin      (Fase 1 — SA core IK)
 *
 * @module VRMDirectAnimator
 */
(function() {
  'use strict';

  var _active          = false;
  var _handle          = null;   // VRM handle from VRMDirectLoader
  var _lerpFactor      = 0.5;    // Interpolation factor (0=frozen, 1=instant)
  var _prevTimestamp   = 0;
  var _useSAScheduler  = false;  // true si se registró en on_animation_update
  var _bodyDiagDone    = false;  // one-time body diagnostic flag
  var _tickCount       = 0;      // frame counter for delayed diagnostics
  var _collisionErrorLogged = false;  // one-time collision error flag

  // ──────────────────────────────────────────────
  //  Bone & face application
  // ──────────────────────────────────────────────

  /**
   * Apply solved bone rotations to the VRM model.
   * Uses direct quaternion copy (same as threex-vrm.js) — NOT slerp.
   */
  function applyBody(handle, boneData) {
    if (!boneData) return;

    // For VRM 1.0 with autoUpdateHumanBones, reset normalized pose each frame
    // (exactly like threex-vrm.js line 352)
    handle.resetPose();

    for (var vrmName in boneData) {
      // Skip metadata keys (prefixed with _)
      if (vrmName.charAt(0) === '_') continue;

      var boneNode = handle.getBoneNode(vrmName);
      if (!boneNode) continue;

      var targetQ = boneData[vrmName];
      if (!targetQ) continue;

      // Direct copy — same as threex-vrm.js bone.quaternion.copy(q)
      boneNode.quaternion.copy(targetQ);
    }

    // Apply hips position from center/hip bones
    if (boneData._hipsPosition) {
      var hipsNode = handle.getBoneNode('hips');
      if (hipsNode && handle._hipsPos0) {
        var invScale = 1 / handle.config.scale;
        hipsNode.position.fromArray(handle._hipsPos0);
        hipsNode.position.x += boneData._hipsPosition.x * invScale;
        hipsNode.position.y += boneData._hipsPosition.y * invScale;
        hipsNode.position.z += boneData._hipsPosition.z * invScale;
      }
    }
  }

  var _faceApplyDiagDone = false;

  /**
   * Apply face expressions to the VRM model.
   * Three tracks applied in priority order (lowest→highest):
   *   Track 0 (base)  : autoAnimData  — auto blink, VMD morph keyframes, morph_noise
   *   Track 1         : standardData  — face-tracking ARKit→VRM expression mapping
   *   Track 2 (top)   : arkitData     — direct ARKit custom expressions (model-specific)
   * Higher tracks override lower tracks when the same key appears.
   */
  function applyFace(handle, standardData, arkitData, autoAnimData) {
    var em = handle.vrm && handle.vrm.expressionManager;
    if (!em) return;

    var weights = {};

    // Track 0: Automatic animations (auto blink, VMD morphs, morph_noise) — base layer
    if (autoAnimData) {
      for (var autoName in autoAnimData) {
        weights[autoName] = autoAnimData[autoName];
      }
    }

    // Track 1: Standard VRM expressions (aa, ih, ou, blink, happy, etc.)
    // Face tracking always wins over auto anim when present
    if (standardData) {
      for (var name in standardData) {
        weights[name] = standardData[name];
      }
    }

    // Track 2: Direct ARKit custom expressions (only if VRM supports them)
    if (arkitData && handle.blendshapeMap) {
      for (var arkitName in arkitData) {
        var exprName = handle.blendshapeMap[arkitName];
        if (exprName) {
          weights[exprName] = arkitData[arkitName];
        }
      }
    }

    // One-time diagnostic: what are we sending vs what exists
    if (!_faceApplyDiagDone && Object.keys(weights).length > 0) {
      _faceApplyDiagDone = true;
      var available = {};
      if (em.expressionMap) {
        for (var k in em.expressionMap) available[k] = true;
      }
      var matched = [], unmatched = [];
      for (var n in weights) {
        if (available[n]) matched.push(n + '=' + weights[n].toFixed(3));
        else unmatched.push(n);
      }
      console.log('[VRMDirect] applyFace diag:', {
        weightsToSet: Object.keys(weights),
        matched: matched,
        unmatched: unmatched,
        availableExprs: Object.keys(available)
      });
    }

    // Apply all expression weights
    for (var name in weights) {
      em.setValue(name, weights[name]);
    }
  }

  // ──────────────────────────────────────────────
  //  Animation tick (called every frame)
  // ──────────────────────────────────────────────

  function tick() {
    if (!_active || !_handle) return;

    var now = performance.now();
    var dt  = (_prevTimestamp > 0) ? (now - _prevTimestamp) / 1000 : 1 / 60;
    _prevTimestamp = now;

    // ─── Sync position with MMD model (optional) or use fixed config ───
    if (_handle.mesh) {
      var posSet = false;
      try {
        var mainObj = window.MMD_SA && MMD_SA.THREEX && MMD_SA.THREEX.obj_list[0];
        if (mainObj && mainObj.parent) {
          _handle.mesh.position.copy(mainObj.parent.position);
          posSet = true;
        }
      } catch(e) {}

      if (!posSet) _handle.mesh.position.set(0, 0, 0);

      _handle.mesh.position.x += (_handle.config.offsetX || 0);
      _handle.mesh.position.y += (_handle.config.offsetY || 0);
      _handle.mesh.position.z += (_handle.config.offsetZ || 0);
    }

    // Rotate 180° around Y so the VRM faces the camera (same direction as the main model)
    // Quaternion (0, 1, 0, 0) = 180° Y rotation
    if (_handle.mesh) {
      _handle.mesh.quaternion.set(0, 1, 0, 0);
    }

    // ─── BODY ─────────────────────────────────────────────────────────────
    // Fase 2: si el pose solver propio está activo, escribe _poseFrames antes de solveBody
    // Si está desactivado, getMMDBones() cae a frames.skin (Fase 1) o jThree (legacy)
    if (window.VRMDirectPoseSolver) VRMDirectPoseSolver.update();

    // autoUpdateHumanBones must be true each frame so resetNormalizedPose +
    // normalized-bone writes are respected by vrm.update(dt) below.
    if (_handle.isVRM1 && _handle.vrm && _handle.vrm.humanoid) {
      _handle.vrm.humanoid.autoUpdateHumanBones = true;
    }
    var bodyData = VRMDirectSolver.solveBody(_handle.isVRM1);
    applyBody(_handle, bodyData);

    // COLLISION: detect and correct BEFORE vrm.update so spring bones use corrected pose.
    // Single-pass: reads current tracking pose, checks mesh, corrects arm if hand penetrates.
    if (window.VRMCollision && VRMCollision.isEnabled()) {
      try { VRMCollision.update(); } catch(e) {
        if (!_collisionErrorLogged) { _collisionErrorLogged = true; console.warn('[VRMDirect] Collision error:', e); }
      }
    }

    // One-time body diagnostic — fires ~3 s after start so tracking has time to initialise
    if (!_bodyDiagDone) {
      _tickCount++;
      if (_tickCount > 180) {
        _bodyDiagDone = true;
        var _skinAvail = false;
        try { _skinAvail = !!(System._browser.camera.poseNet.frames.skin &&
          Object.keys(System._browser.camera.poseNet.frames.skin).length > 0); } catch(e) {}
        var _bonesAvail = false;
        try { _bonesAvail = !!(THREE.MMD.getModels()[0].mesh.bones_by_name); } catch(e) {}
        console.log('[VRMDirect] Body diag:', {
          bodyDataKeys:      bodyData ? Object.keys(bodyData) : null,
          pose2_enabled:     window.VRMDirectPoseSolver ? VRMDirectPoseSolver.isEnabled() : 'absent',
          frames_skin_ok:    _skinAvail,
          bones_by_name_ok:  _bonesAvail,
          poseFrames:        window.VRMDirectSolver ? !!VRMDirectSolver._poseFrames : 'absent'
        });
      }
    }

    // ─── FACE: always try (face tracking runs independently of body) ───
    // Track 0: automatic animations (auto blink, VMD morphs, morph_noise) — base layer
    var autoAnim = VRMDirectSolver.solveAutoAnim(_handle.isVRM1, dt);

    var mmdFace   = VRMDirectSolver.solveMMDMorphExpressions();
    var arkitFace = VRMDirectSolver.solveFace();
    // Fallback: when ARKit blendshape keys are absent (main model lacks
    // use_faceBlendshapes), read the always-available MMD morph names instead.
    var isArkitEmpty = !arkitFace || Object.keys(arkitFace).length === 0;
    if (!mmdFace && isArkitEmpty) {
      mmdFace = VRMDirectSolver.solveMMDMorphFallback(_handle.isVRM1);
    }
    applyFace(_handle, mmdFace, arkitFace, autoAnim);

    // Advance VRM runtime (spring bones, physics, expressions, lookAt)
    _handle.update(dt);


    // Renderear con el renderer propio si existe (standalone mode)
    if (_handle.renderer && _handle.camera && window._VRMDirectScene) {
      _handle.renderer.render(window._VRMDirectScene, _handle.camera);
    }
  }

  // ──────────────────────────────────────────────
  //  Start / Stop
  // ──────────────────────────────────────────────

  /**
   * Start the animation loop.
   * @param {Object} handle - VRM handle from VRMDirectLoader.getHandle()
   */
  function start(handle) {
    if (_active) return;
    _handle        = handle;
    _active        = true;
    _prevTimestamp  = 0;

    // Set autoUpdateHumanBones for VRM 1.0 (required for normalized bone nodes)
    // Same as threex-vrm.js line 349
    if (_handle.isVRM1 && _handle.vrm && _handle.vrm.humanoid) {
      _handle.vrm.humanoid.autoUpdateHumanBones = true;
    }

    // Initialize body collision system
    if (window.VRMCollision) {
      try {
        VRMCollision.init(_handle);
        console.log('[VRMDirect] Body collision initialized:', VRMCollision.getStats());
      } catch(e) { console.warn('[VRMDirect] Collision init failed:', e); }
    }

    // Store rest-pose hips position for offset calculation
    try {
      var hNode = _handle.vrm.humanoid.getNormalizedBoneNode('hips');
      if (hNode) _handle._hipsPos0 = hNode.position.toArray();
    } catch(e) {}

    // Registrar en SA scheduler si está disponible (garantiza orden post-MMD)
    // Si no, usar RAF propio (modo standalone)
    _useSAScheduler = false;
    try {
      if (window.System && System._browser && System._browser.on_animation_update) {
        System._browser.on_animation_update.add(tick, 0, 1, -1);
        _useSAScheduler = true;
        console.log('[VRMDirect] Usando SA scheduler (post-MMD)');
      }
    } catch(e) {}

    if (!_useSAScheduler) {
      _prevTimestamp = 0;
      (function rafLoop(timestamp) {
        if (!_active) return;
        tick();
        requestAnimationFrame(rafLoop);
      })(performance.now());
      console.log('[VRMDirect] Usando RAF propio (standalone)');
    }

    console.log('[VRMDirect] Animator started (autoUpdateHumanBones=' +
      !!(_handle.vrm && _handle.vrm.humanoid && _handle.vrm.humanoid.autoUpdateHumanBones) + ')');
  }

  /**
   * Stop the animation loop.
   */
  function stop() {
    if (!_active) return;
    _active = false;

    if (_useSAScheduler) {
      try { System._browser.on_animation_update.remove(tick, 1); } catch(e) {}
      _useSAScheduler = false;
    }
    // Si se usó RAF, _active = false detiene el loop

    _handle        = null;
    _prevTimestamp  = 0;

    console.log('[VRMDirect] Animator stopped');
  }

  /**
   * Set interpolation smoothness.
   * @param {number} value - 0.01 (very smooth / laggy) to 1 (instant)
   */
  function setLerp(value) {
    _lerpFactor = Math.max(0.01, Math.min(1, value));
  }

  // ─── Public API ───
  window.VRMDirectAnimator = {
    start:    start,
    stop:     stop,
    setLerp:  setLerp,
    getLerp:  function() { return _lerpFactor; },
    isActive: function() { return _active; }
  };

})();
