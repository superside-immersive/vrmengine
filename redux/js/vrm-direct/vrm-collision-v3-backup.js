/**
 * VRM Body Collision System v3
 *
 * Mesh-based sphere colliders: at init, scans SkinnedMesh vertices to compute
 * accurate per-bone bounding spheres (handles big heads, wide torsos, etc.).
 * At runtime, prevents hands from penetrating body with damped correction
 * to avoid stutter/oscillation.
 *
 * Key design decisions:
 *   - Only HANDS are tested (not elbows) to avoid double-correcting same arm
 *   - Damped correction (lerp factor) prevents snap oscillation
 *   - No vrm.update(0) after correction — avoids spring bone feedback loop
 *   - All collision math uses raw floats — no cross-module THREE.js dependency
 *
 * @module VRMCollision
 */
(function () {
  'use strict';

  // === Configuration ===
  var _enabled = true;
  var _debugVis = false;
  var _margin = 0.005;     // push-out margin in model-local meters
  var _dampFactor = 0.85;  // how much of the correction to apply per frame (1=full, 0=none)

  // === State ===
  var _handle = null;
  var _initialized = false;
  var _diagDone = false;
  var _colliders = [];  // [{ boneName, radius (world), boneNode }]

  // Body bones to generate colliders for.
  // fallbackRadius: used if no mesh vertices found for this bone.
  var BODY_BONES = [
    { bone: 'head',       fallbackRadius: 0.12 },
    { bone: 'upperChest', fallbackRadius: 0.12 },
    { bone: 'chest',      fallbackRadius: 0.12 },
    { bone: 'spine',      fallbackRadius: 0.10 },
    { bone: 'neck',       fallbackRadius: 0.04 },
    { bone: 'hips',       fallbackRadius: 0.10 }
  ];

  // Only test hands — elbows caused double-correction stutter.
  var LIMB_DEFS = [
    { bone: 'leftHand',  upperArm: 'leftUpperArm'  },
    { bone: 'rightHand', upperArm: 'rightUpperArm' }
  ];

  var HAND_RADIUS_LOCAL = 0.03; // collision sphere around hand in model-local

  // === Pure math helpers (no THREE dependency) ===

  function _wp(node) {
    var e = node.matrixWorld.elements;
    return [e[12], e[13], e[14]];
  }

  function _dist(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function _normalize(v) {
    var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (len > 1e-8) { v[0] /= len; v[1] /= len; v[2] /= len; }
    return len;
  }

  function _qMul(a, b) {
    return [
      a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
      a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
      a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3],
      a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]
    ];
  }

  function _qConj(q) {
    return [-q[0], -q[1], -q[2], q[3]];
  }

  function _worldQuat(node) {
    var e = node.matrixWorld.elements;
    var sx = Math.sqrt(e[0]*e[0] + e[1]*e[1] + e[2]*e[2]);
    var sy = Math.sqrt(e[4]*e[4] + e[5]*e[5] + e[6]*e[6]);
    var sz = Math.sqrt(e[8]*e[8] + e[9]*e[9] + e[10]*e[10]);
    if (sx < 1e-8) sx = 1; if (sy < 1e-8) sy = 1; if (sz < 1e-8) sz = 1;
    var m00=e[0]/sx, m10=e[1]/sx, m20=e[2]/sx;
    var m01=e[4]/sy, m11=e[5]/sy, m21=e[6]/sy;
    var m02=e[8]/sz, m12=e[9]/sz, m22=e[10]/sz;
    var tr=m00+m11+m22, s, qx, qy, qz, qw;
    if (tr > 0) {
      s=0.5/Math.sqrt(tr+1); qw=0.25/s;
      qx=(m21-m12)*s; qy=(m02-m20)*s; qz=(m10-m01)*s;
    } else if (m00>m11 && m00>m22) {
      s=2*Math.sqrt(1+m00-m11-m22); qw=(m21-m12)/s;
      qx=0.25*s; qy=(m01+m10)/s; qz=(m02+m20)/s;
    } else if (m11>m22) {
      s=2*Math.sqrt(1+m11-m00-m22); qw=(m02-m20)/s;
      qx=(m01+m10)/s; qy=0.25*s; qz=(m12+m21)/s;
    } else {
      s=2*Math.sqrt(1+m22-m00-m11); qw=(m10-m01)/s;
      qx=(m02+m20)/s; qy=(m12+m21)/s; qz=0.25*s;
    }
    var nlen = Math.sqrt(qx*qx+qy*qy+qz*qz+qw*qw);
    if (nlen>1e-8) { qx/=nlen; qy/=nlen; qz/=nlen; qw/=nlen; }
    return [qx, qy, qz, qw];
  }

  function _quatFromTo(from, to) {
    var d = from[0]*to[0] + from[1]*to[1] + from[2]*to[2];
    if (d > 0.999999) return [0,0,0,1];
    if (d < -0.999999) {
      var ax=[1,0,0]; if(Math.abs(from[0])>0.9) ax=[0,1,0];
      var cx=from[1]*ax[2]-from[2]*ax[1];
      var cy=from[2]*ax[0]-from[0]*ax[2];
      var cz=from[0]*ax[1]-from[1]*ax[0];
      var cl=Math.sqrt(cx*cx+cy*cy+cz*cz);
      return [cx/cl,cy/cl,cz/cl,0];
    }
    var cx2=from[1]*to[2]-from[2]*to[1];
    var cy2=from[2]*to[0]-from[0]*to[2];
    var cz2=from[0]*to[1]-from[1]*to[0];
    var w=1+d;
    var n=Math.sqrt(cx2*cx2+cy2*cy2+cz2*cz2+w*w);
    return [cx2/n,cy2/n,cz2/n,w/n];
  }

  // === THREE ref (debug vis only) ===
  var _THREE = null;
  function _getTHREE() {
    if (_THREE) return _THREE;
    if (window.MMD_SA && MMD_SA.THREEX) { _THREE = MMD_SA.THREEX._THREE || MMD_SA.THREEX.THREE; return _THREE; }
    if (window._VRMDirectTHREE) { _THREE = window._VRMDirectTHREE; return _THREE; }
    _THREE = window.THREE; return _THREE;
  }
  function _getScene() {
    if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.scene;
    if (window._VRMDirectScene) return window._VRMDirectScene;
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  //  INIT — scan mesh geometry to compute per-bone bounding spheres
  // ═══════════════════════════════════════════════════════════════

  function init(handle) {
    _handle = handle;
    _initialized = false;
    _colliders = [];
    _diagDone = false;

    if (!handle || !handle.vrm || !handle.vrm.humanoid) {
      console.warn('[VRMCollision] No valid VRM handle');
      return;
    }

    var vrm = handle.vrm;
    var scale = handle.config ? handle.config.scale : 11;

    // 1. Collect all SkinnedMesh children with geometry
    var skinnedMeshes = [];
    handle.mesh.traverse(function(c) {
      if (c.isSkinnedMesh && c.geometry && c.skeleton) {
        skinnedMeshes.push(c);
      }
    });

    if (skinnedMeshes.length === 0) {
      // fallback: try any mesh
      handle.mesh.traverse(function(c) {
        if (c.isMesh && c.geometry) skinnedMeshes.push(c);
      });
    }

    console.log('[VRMCollision v3] Found', skinnedMeshes.length, 'skinned meshes');

    // 2. For each body bone, find its raw bone node and its index in skeleton.bones
    //    Then scan all vertices to find max distance from bone center → radius.
    for (var bi = 0; bi < BODY_BONES.length; bi++) {
      var def = BODY_BONES[bi];
      var normalizedNode = vrm.humanoid.getNormalizedBoneNode(def.bone);
      if (!normalizedNode) continue;

      // Find this bone's rest-pose position (from matrixWorld before any animation)
      var boneWP = _wp(normalizedNode);

      // Try to get raw bone node and find its skeleton index
      var rawNode = null;
      try { rawNode = vrm.humanoid.getRawBoneNode(def.bone); } catch(e) {}

      var maxDistFromBone = 0;
      var vertexCount = 0;

      for (var si = 0; si < skinnedMeshes.length; si++) {
        var sm = skinnedMeshes[si];
        if (!sm.skeleton || !sm.skeleton.bones) continue;

        var skeleton = sm.skeleton;
        var posAttr = sm.geometry.getAttribute('position');
        var skinIdxAttr = sm.geometry.getAttribute('skinIndex');
        var skinWgtAttr = sm.geometry.getAttribute('skinWeight');
        if (!posAttr || !skinIdxAttr || !skinWgtAttr) continue;

        // Find this bone's index in skeleton.bones[]
        var boneIdx = -1;
        if (rawNode) {
          for (var k = 0; k < skeleton.bones.length; k++) {
            if (skeleton.bones[k] === rawNode) { boneIdx = k; break; }
          }
        }
        // Also try by name matching
        if (boneIdx === -1 && rawNode) {
          for (var k2 = 0; k2 < skeleton.bones.length; k2++) {
            if (skeleton.bones[k2].name === rawNode.name) { boneIdx = k2; break; }
          }
        }

        if (boneIdx === -1) continue;

        // Scan vertices: find those primarily weighted to this bone
        var numVerts = posAttr.count;
        for (var vi = 0; vi < numVerts; vi++) {
          // Check if this vertex has significant weight for this bone
          var si0 = skinIdxAttr.getX(vi), si1 = skinIdxAttr.getY(vi);
          var si2 = skinIdxAttr.getZ(vi), si3 = skinIdxAttr.getW(vi);
          var sw0 = skinWgtAttr.getX(vi), sw1 = skinWgtAttr.getY(vi);
          var sw2 = skinWgtAttr.getZ(vi), sw3 = skinWgtAttr.getW(vi);

          var totalWeight = 0;
          if (si0 === boneIdx) totalWeight += sw0;
          if (si1 === boneIdx) totalWeight += sw1;
          if (si2 === boneIdx) totalWeight += sw2;
          if (si3 === boneIdx) totalWeight += sw3;

          // Include vertex if it has >= 25% weight for this bone
          if (totalWeight < 0.25) continue;

          vertexCount++;

          // Compute vertex world pos (rest pose):
          // vertex is in local mesh space, apply mesh's matrixWorld to get world pos
          var vx = posAttr.getX(vi);
          var vy = posAttr.getY(vi);
          var vz = posAttr.getZ(vi);
          var mw = sm.matrixWorld.elements;
          var wx = mw[0]*vx + mw[4]*vy + mw[8]*vz + mw[12];
          var wy = mw[1]*vx + mw[5]*vy + mw[9]*vz + mw[13];
          var wz = mw[2]*vx + mw[6]*vy + mw[10]*vz + mw[14];

          var dx = wx - boneWP[0];
          var dy = wy - boneWP[1];
          var dz = wz - boneWP[2];
          var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist > maxDistFromBone) maxDistFromBone = dist;
        }
      }

      // Compute final radius
      var radiusWorld;
      if (vertexCount > 10) {
        // Use mesh-measured radius (already in world space since mesh has scale applied)
        radiusWorld = maxDistFromBone;
      } else {
        // Fallback: use configured fallback radius * scale
        radiusWorld = def.fallbackRadius * scale;
      }

      // Ensure a minimum
      if (radiusWorld < def.fallbackRadius * scale * 0.3) {
        radiusWorld = def.fallbackRadius * scale;
      }

      _colliders.push({
        boneName: def.bone,
        radius: radiusWorld,
        vertexCount: vertexCount
      });
    }

    _initialized = _colliders.length > 0;
    console.log('[VRMCollision v3] Initialized:', {
      colliders: _colliders.map(function(c) {
        return c.boneName + '(r=' + c.radius.toFixed(2) + ', verts=' + c.vertexCount + ')';
      }),
      scale: scale,
      meshes: skinnedMeshes.length
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  MAIN UPDATE
  // ═══════════════════════════════════════════════════════════════

  function update() {
    if (!_enabled || !_initialized || !_handle) return false;
    var vrm = _handle.vrm;
    if (!vrm || !vrm.humanoid) return false;

    var scale = _handle.config ? _handle.config.scale : 11;
    var anyCollision = false;

    // 1. Collect body collider world positions + radii
    var bodyColls = [];
    for (var ci = 0; ci < _colliders.length; ci++) {
      var col = _colliders[ci];
      var boneNode = vrm.humanoid.getNormalizedBoneNode(col.boneName);
      if (!boneNode) continue;
      var wp = _wp(boneNode);
      bodyColls.push({
        cx: wp[0], cy: wp[1], cz: wp[2],
        r: col.radius,
        name: col.boneName
      });
    }
    if (bodyColls.length === 0) return false;

    // 2. For each hand, check against all body colliders
    for (var li = 0; li < LIMB_DEFS.length; li++) {
      var limb = LIMB_DEFS[li];
      var handNode = vrm.humanoid.getNormalizedBoneNode(limb.bone);
      if (!handNode) continue;

      var handWP = _wp(handNode);
      var handR = HAND_RADIUS_LOCAL * scale;

      // Find the deepest penetration across all body colliders
      var bestPush = 0;
      var bestDirX = 0, bestDirY = 0, bestDirZ = 0;

      for (var bi = 0; bi < bodyColls.length; bi++) {
        var bc = bodyColls[bi];
        var dx = handWP[0] - bc.cx;
        var dy = handWP[1] - bc.cy;
        var dz = handWP[2] - bc.cz;
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        var minSep = bc.r + handR + _margin * scale;

        if (dist < minSep) {
          var pen = minSep - dist;
          if (pen > bestPush) {
            bestPush = pen;
            if (dist > 1e-6) {
              bestDirX = dx / dist;
              bestDirY = dy / dist;
              bestDirZ = dz / dist;
            } else {
              // Hand exactly at bone center — push outward (forward Z)
              bestDirX = 0; bestDirY = 0; bestDirZ = 1;
            }
          }
        }
      }

      if (bestPush < 0.001) continue;

      // 3. Compute corrected hand position (on surface + margin)
      //    Apply damping to avoid stutter — don't push 100%, let it converge
      anyCollision = true;
      var dampedPush = bestPush * _dampFactor;
      var corrX = handWP[0] + bestDirX * dampedPush;
      var corrY = handWP[1] + bestDirY * dampedPush;
      var corrZ = handWP[2] + bestDirZ * dampedPush;

      // 4. Rotate the upperArm to move the hand to the corrected position
      var upperArmNode = vrm.humanoid.getNormalizedBoneNode(limb.upperArm);
      if (!upperArmNode) continue;

      var shoulderWP = _wp(upperArmNode);

      // Direction from shoulder to current hand vs corrected hand
      var oldDir = [
        handWP[0] - shoulderWP[0],
        handWP[1] - shoulderWP[1],
        handWP[2] - shoulderWP[2]
      ];
      var newDir = [
        corrX - shoulderWP[0],
        corrY - shoulderWP[1],
        corrZ - shoulderWP[2]
      ];

      var oldLen = _normalize(oldDir);
      var newLen = _normalize(newDir);

      // Skip if arm is zero-length (shouldn't happen)
      if (oldLen < 0.01 || newLen < 0.01) continue;

      // World-space rotation delta: rotate oldDir → newDir
      var wDelta = _quatFromTo(oldDir, newDir);

      // Convert to local space of upperArm:
      // localDelta = parentWorldQ^-1 * worldDelta * parentWorldQ
      var parentNode = upperArmNode.parent;
      var pWQ, pWQi;
      if (parentNode) {
        pWQ = _worldQuat(parentNode);
        pWQi = _qConj(pWQ);
      } else {
        pWQ = [0,0,0,1];
        pWQi = [0,0,0,1];
      }

      var localDelta = _qMul(_qMul(pWQi, wDelta), pWQ);

      // Compose: newLocal = localDelta * currentLocal
      var cq = upperArmNode.quaternion;
      var curLocal = [cq.x, cq.y, cq.z, cq.w];
      var newLocal = _qMul(localDelta, curLocal);

      // Normalize
      var nLen = Math.sqrt(
        newLocal[0]*newLocal[0] + newLocal[1]*newLocal[1] +
        newLocal[2]*newLocal[2] + newLocal[3]*newLocal[3]
      );
      if (nLen > 1e-8) {
        newLocal[0]/=nLen; newLocal[1]/=nLen;
        newLocal[2]/=nLen; newLocal[3]/=nLen;
      }

      // Write back
      upperArmNode.quaternion.set(newLocal[0], newLocal[1], newLocal[2], newLocal[3]);
    }

    // 5. Propagate corrections without triggering spring bone physics
    //    Just update the scene matrix hierarchy — NOT vrm.update(0)
    if (anyCollision) {
      try {
        _handle.mesh.updateMatrixWorld(true);
      } catch(e) { /* ignore */ }
    }

    // One-time diagnostic
    if (!_diagDone) {
      _diagDone = true;
      var info = {};
      for (var dd = 0; dd < LIMB_DEFS.length; dd++) {
        var ln = vrm.humanoid.getNormalizedBoneNode(LIMB_DEFS[dd].bone);
        info[LIMB_DEFS[dd].bone] = ln ? _wp(ln).map(function(v){return v.toFixed(1);}) : null;
      }
      console.log('[VRMCollision v3] First update:', {
        bodyColliders: bodyColls.length,
        colliderRadii: bodyColls.map(function(c){return c.name+'='+c.r.toFixed(2);}),
        anyCollision: anyCollision,
        handPositions: info,
        dampFactor: _dampFactor
      });
    }

    return anyCollision;
  }

  // ═══════════════════════════════════════════════════════════════
  //  DEBUG VISUALIZATION  (2D canvas overlay — avoids cross-THREE issues)
  // ═══════════════════════════════════════════════════════════════

  var _debugCanvas = null;
  var _debugCtx = null;

  function _ensureDebugCanvas() {
    if (_debugCanvas) return true;
    try {
      _debugCanvas = document.createElement('canvas');
      _debugCanvas.id = 'vrm-collision-debug-overlay';
      _debugCanvas.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'pointer-events:none;z-index:99999;';
      _debugCanvas.width  = window.innerWidth;
      _debugCanvas.height = window.innerHeight;
      document.body.appendChild(_debugCanvas);
      _debugCtx = _debugCanvas.getContext('2d');
      return true;
    } catch(e) {
      console.warn('[VRMCollision] Cannot create debug canvas:', e);
      return false;
    }
  }

  function _removeDebugCanvas() {
    if (_debugCanvas && _debugCanvas.parentNode) {
      _debugCanvas.parentNode.removeChild(_debugCanvas);
    }
    _debugCanvas = null;
    _debugCtx = null;
  }

  var _projDiagDone = false;

  /** Project a world-position [x,y,z] to screen [px_x, px_y, depth] */
  function _projectToScreen(worldPos) {
    var cam = null;
    // MMD_SA.THREEX.camera is a wrapper; .obj is the real THREE.PerspectiveCamera
    try {
      cam = MMD_SA.THREEX.camera.obj || MMD_SA.THREEX.data.camera;
    } catch(e) {}
    if (!cam) { if (!_projDiagDone) { _projDiagDone = true; console.warn('[VRMCollision] proj: no camera'); } return null; }

    // Ensure matrixWorldInverse is up-to-date
    if (cam.matrixWorldInverse && cam.matrixWorld) {
      if (cam.matrixWorldInverse.getInverse) {
        cam.matrixWorldInverse.getInverse(cam.matrixWorld);
      } else if (cam.matrixWorldInverse.copy) {
        cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
      }
    }

    var mwi = cam.matrixWorldInverse;
    var pm  = cam.projectionMatrix;
    if (!mwi || !pm || !mwi.elements || !pm.elements) {
      if (!_projDiagDone) {
        _projDiagDone = true;
        console.warn('[VRMCollision] proj: missing matrices', {
          hasMWI: !!mwi, hasPM: !!pm,
          mwiElements: mwi && !!mwi.elements, pmElements: pm && !!pm.elements,
          camType: cam.constructor && cam.constructor.name,
          camKeys: Object.keys(cam).slice(0, 20)
        });
      }
      return null;
    }

    var me1 = mwi.elements;
    var me2 = pm.elements;

    // View transform
    var vx = me1[0]*worldPos[0] + me1[4]*worldPos[1] + me1[8]*worldPos[2]  + me1[12];
    var vy = me1[1]*worldPos[0] + me1[5]*worldPos[1] + me1[9]*worldPos[2]  + me1[13];
    var vz = me1[2]*worldPos[0] + me1[6]*worldPos[1] + me1[10]*worldPos[2] + me1[14];
    var vw = me1[3]*worldPos[0] + me1[7]*worldPos[1] + me1[11]*worldPos[2] + me1[15];

    // Projection
    var cx = me2[0]*vx + me2[4]*vy + me2[8]*vz  + me2[12]*vw;
    var cy = me2[1]*vx + me2[5]*vy + me2[9]*vz  + me2[13]*vw;
    var cz = me2[2]*vx + me2[6]*vy + me2[10]*vz + me2[14]*vw;
    var cw = me2[3]*vx + me2[7]*vy + me2[11]*vz + me2[15]*vw;

    if (!_projDiagDone) {
      _projDiagDone = true;
      console.log('[VRMCollision] proj diag:', {
        worldPos: worldPos,
        view: [vx.toFixed(2), vy.toFixed(2), vz.toFixed(2), vw.toFixed(2)],
        clip: [cx.toFixed(2), cy.toFixed(2), cz.toFixed(2), cw.toFixed(2)],
        ndc: cw !== 0 ? [(cx/cw).toFixed(3), (cy/cw).toFixed(3), (cz/cw).toFixed(3)] : 'cw=0',
        camPos: cam.position ? [cam.position.x.toFixed(1), cam.position.y.toFixed(1), cam.position.z.toFixed(1)] : 'N/A',
        camFov: cam.fov
      });
    }

    if (Math.abs(cw) < 1e-6) return null;
    var ndcX = cx / cw;
    var ndcY = cy / cw;
    var ndcZ = cz / cw;

    // NDC must be in front of camera
    if (ndcZ < -1 || ndcZ > 1) return null;

    var w = _debugCanvas.width;
    var h = _debugCanvas.height;
    var sx = ( ndcX * 0.5 + 0.5) * w;
    var sy = (-ndcY * 0.5 + 0.5) * h;

    return [sx, sy, cw];
  }

  /** Get approximate screen-space radius for a world-space sphere */
  function _screenRadius(worldRadius, depth) {
    if (depth <= 0.01) return 5;
    var cam = null;
    try { cam = MMD_SA.THREEX.camera.obj || MMD_SA.THREEX.data.camera; } catch(e) {}
    if (!cam) return 10;
    var fov = cam.fov || 30;
    var h = _debugCanvas.height;
    var pixelsPerUnit = h / (2 * depth * Math.tan(fov * Math.PI / 360));
    return Math.max(3, Math.min(300, worldRadius * pixelsPerUnit));
  }

  function _drawCircle(sx, sy, sr, color, label) {
    if (!_debugCtx) return;
    _debugCtx.beginPath();
    _debugCtx.arc(sx, sy, sr, 0, Math.PI * 2);
    _debugCtx.strokeStyle = color;
    _debugCtx.lineWidth = 1.5;
    _debugCtx.stroke();

    if (label) {
      _debugCtx.font = '10px monospace';
      _debugCtx.fillStyle = color;
      _debugCtx.fillText(label, sx + sr + 3, sy + 3);
    }
  }

  var _debugDiagDone = false;

  function _updateDebugVis() {
    if (!_debugVis || !_initialized || !_handle) return;
    if (!_ensureDebugCanvas()) return;

    // Resize if needed
    if (_debugCanvas.width !== window.innerWidth || _debugCanvas.height !== window.innerHeight) {
      _debugCanvas.width  = window.innerWidth;
      _debugCanvas.height = window.innerHeight;
    }

    _debugCtx.clearRect(0, 0, _debugCanvas.width, _debugCanvas.height);

    var vrm = _handle.vrm;
    if (!vrm || !vrm.humanoid) return;

    var scale = _handle.config ? _handle.config.scale : 11;
    var drawn = 0;

    // Body colliders (green circles)
    for (var ci = 0; ci < _colliders.length; ci++) {
      var col = _colliders[ci];
      var boneNode = vrm.humanoid.getNormalizedBoneNode(col.boneName);
      if (!boneNode) continue;
      var wp = _wp(boneNode);
      var proj = _projectToScreen(wp);
      if (!proj) continue;
      var sr = _screenRadius(col.radius, proj[2]);
      _drawCircle(proj[0], proj[1], sr, 'rgba(0,255,0,0.6)', col.boneName);
      drawn++;

      // One-time diagnostic
      if (!_debugDiagDone) {
        console.log('[VRMCollision] Debug diag:', {
          bone: col.boneName,
          worldPos: wp,
          screenPos: [proj[0].toFixed(1), proj[1].toFixed(1)],
          depth: proj[2].toFixed(3),
          screenRadius: sr.toFixed(1),
          canvasSize: [_debugCanvas.width, _debugCanvas.height],
          canvasInDOM: !!_debugCanvas.parentNode,
          canvasZindex: _debugCanvas.style.zIndex
        });
      }
    }

    // Hand spheres (blue circles)
    for (var li = 0; li < LIMB_DEFS.length; li++) {
      var handNode = vrm.humanoid.getNormalizedBoneNode(LIMB_DEFS[li].bone);
      if (!handNode) continue;
      var wp2 = _wp(handNode);
      var proj2 = _projectToScreen(wp2);
      if (!proj2) continue;
      var sr2 = _screenRadius(HAND_RADIUS_LOCAL * scale, proj2[2]);
      _drawCircle(proj2[0], proj2[1], sr2, 'rgba(80,80,255,0.8)', LIMB_DEFS[li].bone);
    }

    // Shoulder joints (red circles)
    for (var li2 = 0; li2 < LIMB_DEFS.length; li2++) {
      var armNode = vrm.humanoid.getNormalizedBoneNode(LIMB_DEFS[li2].upperArm);
      if (!armNode) continue;
      var wp3 = _wp(armNode);
      var proj3 = _projectToScreen(wp3);
      if (!proj3) continue;
      var sr3 = _screenRadius(0.2 * scale * 0.05, proj3[2]);
      _drawCircle(proj3[0], proj3[1], sr3, 'rgba(255,80,80,0.8)', LIMB_DEFS[li2].upperArm);
      drawn++;
    }

    // Diagnostic & test marker
    if (!_debugDiagDone) {
      _debugDiagDone = true;
      if (drawn === 0) {
        // No projections succeeded — check camera
        var cam2 = null;
        try { cam2 = MMD_SA.THREEX.camera; } catch(e) {}
        console.warn('[VRMCollision] Debug: 0 circles drawn!', {
          camera: !!cam2,
          hasMWI: cam2 && !!cam2.matrixWorldInverse,
          hasPM: cam2 && !!cam2.projectionMatrix,
          colliders: _colliders.length
        });
      } else {
        console.log('[VRMCollision] Debug: drew', drawn, 'circles');
      }
      // Always draw a test marker in corner to verify canvas is visible
      _debugCtx.fillStyle = 'rgba(255,0,255,0.9)';
      _debugCtx.fillRect(10, 10, 80, 20);
      _debugCtx.fillStyle = '#fff';
      _debugCtx.font = '12px monospace';
      _debugCtx.fillText('COLLISION DBG', 12, 25);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  window.VRMCollision = {
    init: init,

    update: function () {
      var result = update();
      if (_debugVis) _updateDebugVis();
      return result;
    },

    setEnabled: function (val) {
      _enabled = !!val;
      if (!_enabled) _removeDebugCanvas();
    },
    isEnabled: function () { return _enabled; },

    setDebugVisualization: function (val) {
      _debugVis = !!val;
      if (!_debugVis) _removeDebugCanvas();
      console.log('[VRMCollision] Debug vis:', _debugVis,
        'colliders:', _colliders.length);
    },
    isDebugVis: function () { return _debugVis; },

    setMargin: function (v) { _margin = Math.max(0, Math.min(0.2, v)); },
    getMargin: function () { return _margin; },

    setDamping: function (v) { _dampFactor = Math.max(0.1, Math.min(1.0, v)); },
    getDamping: function () { return _dampFactor; },

    getStats: function () {
      return {
        initialized: _initialized,
        enabled: _enabled,
        version: 3,
        colliders: _colliders.length,
        colliderDetails: _colliders.map(function(c) {
          return { bone: c.boneName, radius: c.radius.toFixed(2), verts: c.vertexCount };
        }),
        limbChecks: LIMB_DEFS.length,
        dampFactor: _dampFactor,
        isReady: _initialized && _enabled
      };
    },

    reinit: function () {
      if (_handle) init(_handle);
    }
  };

})();
