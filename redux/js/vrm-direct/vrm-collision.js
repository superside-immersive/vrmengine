/**
 * VRM Body Collision System v5 (MeshBVH)
 *
 * Goal:
 * - Keep tracking / animation as-is
 * - Only apply correction when hand penetrates body surface
 * - Preserve skinning by applying bounded arm rotations
 *
 * Runtime model:
 * - Build static proxy geometry from selected skinned meshes using
 *   three-mesh-bvh StaticGeometryGenerator.
 * - Build MeshBVH once.
 * - On update, refresh proxy geometry and refit BVH adaptively when hands are near body.
 * - For each hand: closest-point query against body surface, compute penetration depth,
 *   apply minimal bounded correction to upper/lower arm.
 */
(function () {
  'use strict';

  // === Configuration ===
  var _enabled = true;
  var _debugVis = false;
  var _margin = 0.005;

  var MAX_CORRECTION_ANGLE = 0.55; // ~31.5°
  var UPPER_ARM_FRACTION = 0.65;
  var LOWER_ARM_FRACTION = 0.35;

  // Refit BVH when any hand is within this distance of body center sphere
  var REFIT_NEAR_DISTANCE = 0.55;

  // Remote module source (CDN runtime)
  var BVH_MODULE_URL = 'https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.8.3/build/index.module.js';

  // === State ===
  var _handle = null;
  var _initialized = false;
  var _diagDone = false;

  var _bvhLoading = false;
  var _bvhReady = false;
  var _bvhError = null;

  var _MeshBVH = null;
  var _StaticGeometryGenerator = null;
  var _getTriangleHitPointInfo = null;

  var _proxyGeometry = null;
  var _proxyMesh = null;
  var _proxyCenter = [0, 0, 0];
  var _proxyRadius = 0.25;

  var _generator = null;
  var _collisionMeshes = [];
  var _handRadii = {};

  var _lastRefitFrame = -1;
  var _frameCounter = 0;

  var HAND_RADIUS_FALLBACK = 0.06;

  var BODY_BONES = [
    'head',
    'neck',
    'upperChest',
    'chest',
    'spine',
    'hips'
  ];

  var LIMB_DEFS = [
    { bone: 'leftHand', upperArm: 'leftUpperArm', lowerArm: 'leftLowerArm' },
    { bone: 'rightHand', upperArm: 'rightUpperArm', lowerArm: 'rightLowerArm' }
  ];

  // === Temp objects ===
  var _tempPos = null;
  var _tempNorm = null;
  var _tempClosest = null;
  var _tempTriInfo = null;
  var _tempHand = null;
  var _tempPush = null;

  function _getTHREE() {
    if (window.MMD_SA && MMD_SA.THREEX) {
      if (MMD_SA.THREEX._VRMDirectTHREE) return MMD_SA.THREEX._VRMDirectTHREE;
      if (MMD_SA.THREEX._THREE) return MMD_SA.THREEX._THREE;
    }
    if (window.THREE) return window.THREE;
    return null;
  }

  function _allocTemps() {
    var THREE = _getTHREE();
    if (!THREE) return false;
    if (!_tempPos) {
      _tempPos = new THREE.Vector3();
      _tempNorm = new THREE.Vector3();
      _tempClosest = new THREE.Vector3();
      _tempTriInfo = { face: { normal: new THREE.Vector3() } };
      _tempHand = new THREE.Vector3();
      _tempPush = new THREE.Vector3();
    }
    return true;
  }

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
      a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
    ];
  }

  function _qConj(q) {
    return [-q[0], -q[1], -q[2], q[3]];
  }

  function _qNormalize(q) {
    var len = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    if (len > 1e-8) {
      q[0] /= len; q[1] /= len; q[2] /= len; q[3] /= len;
    }
    return q;
  }

  function _worldQuat(node) {
    var e = node.matrixWorld.elements;
    var sx = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
    var sy = Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6]);
    var sz = Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10]);
    if (sx < 1e-8) sx = 1; if (sy < 1e-8) sy = 1; if (sz < 1e-8) sz = 1;
    var m00 = e[0] / sx, m10 = e[1] / sx, m20 = e[2] / sx;
    var m01 = e[4] / sy, m11 = e[5] / sy, m21 = e[6] / sy;
    var m02 = e[8] / sz, m12 = e[9] / sz, m22 = e[10] / sz;
    var tr = m00 + m11 + m22, s, qx, qy, qz, qw;
    if (tr > 0) {
      s = 0.5 / Math.sqrt(tr + 1); qw = 0.25 / s;
      qx = (m21 - m12) * s; qy = (m02 - m20) * s; qz = (m10 - m01) * s;
    } else if (m00 > m11 && m00 > m22) {
      s = 2 * Math.sqrt(1 + m00 - m11 - m22); qw = (m21 - m12) / s;
      qx = 0.25 * s; qy = (m01 + m10) / s; qz = (m02 + m20) / s;
    } else if (m11 > m22) {
      s = 2 * Math.sqrt(1 + m11 - m00 - m22); qw = (m02 - m20) / s;
      qx = (m01 + m10) / s; qy = 0.25 * s; qz = (m12 + m21) / s;
    } else {
      s = 2 * Math.sqrt(1 + m22 - m00 - m11); qw = (m10 - m01) / s;
      qx = (m02 + m20) / s; qy = (m12 + m21) / s; qz = 0.25 * s;
    }
    return _qNormalize([qx, qy, qz, qw]);
  }

  function _quatFromTo(from, to) {
    var d = from[0] * to[0] + from[1] * to[1] + from[2] * to[2];
    if (d > 0.999999) return [0, 0, 0, 1];
    if (d < -0.999999) {
      var ax = [1, 0, 0];
      if (Math.abs(from[0]) > 0.9) ax = [0, 1, 0];
      var vx = from[1] * ax[2] - from[2] * ax[1];
      var vy = from[2] * ax[0] - from[0] * ax[2];
      var vz = from[0] * ax[1] - from[1] * ax[0];
      var l = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (l < 1e-8) return [0, 0, 0, 1];
      vx /= l; vy /= l; vz /= l;
      return [vx, vy, vz, 0];
    }
    var cx = from[1] * to[2] - from[2] * to[1];
    var cy = from[2] * to[0] - from[0] * to[2];
    var cz = from[0] * to[1] - from[1] * to[0];
    var qw = 1 + d;
    return _qNormalize([cx, cy, cz, qw]);
  }

  function _slerpIdentity(q, t) {
    if (t <= 0) return [0, 0, 0, 1];
    if (t >= 1) return [q[0], q[1], q[2], q[3]];

    var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    if (qw < 0) { qx = -qx; qy = -qy; qz = -qz; qw = -qw; }

    var half = Math.acos(Math.min(1, Math.max(-1, qw)));
    var sinHalf = Math.sin(half);
    if (sinHalf < 1e-6) return [0, 0, 0, 1];

    var newHalf = half * t;
    var scale = Math.sin(newHalf) / sinHalf;
    return _qNormalize([qx * scale, qy * scale, qz * scale, Math.cos(newHalf)]);
  }

  function _applyArmCorrection(vrm, limb, handWP, correctedWP) {
    var upperArmNode = vrm.humanoid.getNormalizedBoneNode(limb.upperArm);
    if (!upperArmNode) return false;

    var shoulderWP = _wp(upperArmNode);
    var oldDir = [
      handWP[0] - shoulderWP[0],
      handWP[1] - shoulderWP[1],
      handWP[2] - shoulderWP[2]
    ];
    var newDir = [
      correctedWP[0] - shoulderWP[0],
      correctedWP[1] - shoulderWP[1],
      correctedWP[2] - shoulderWP[2]
    ];

    var oldLen = _normalize(oldDir);
    var newLen = _normalize(newDir);
    if (oldLen < 0.01 || newLen < 0.01) return false;

    var wDelta = _quatFromTo(oldDir, newDir);

    var halfAngle = Math.acos(Math.min(1, Math.abs(wDelta[3])));
    var fullAngle = halfAngle * 2;
    if (fullAngle > MAX_CORRECTION_ANGLE) {
      wDelta = _slerpIdentity(wDelta, MAX_CORRECTION_ANGLE / fullAngle);
    }

    var parentNode = upperArmNode.parent;
    var pWQ = parentNode ? _worldQuat(parentNode) : [0, 0, 0, 1];
    var pWQi = _qConj(pWQ);
    var localDeltaUpper = _qMul(_qMul(pWQi, wDelta), pWQ);
    var upperDelta = _slerpIdentity(localDeltaUpper, UPPER_ARM_FRACTION);

    var uq = upperArmNode.quaternion;
    var curUpper = [uq.x, uq.y, uq.z, uq.w];
    var newUpper = _qMul(upperDelta, curUpper);
    _qNormalize(newUpper);
    upperArmNode.quaternion.set(newUpper[0], newUpper[1], newUpper[2], newUpper[3]);

    var lowerArmNode = vrm.humanoid.getNormalizedBoneNode(limb.lowerArm);
    if (lowerArmNode) {
      var lowerParent = lowerArmNode.parent;
      var lpWQ = lowerParent ? _worldQuat(lowerParent) : [0, 0, 0, 1];
      var lpWQi = _qConj(lpWQ);
      var localDeltaLower = _qMul(_qMul(lpWQi, wDelta), lpWQ);
      var lowerDelta = _slerpIdentity(localDeltaLower, LOWER_ARM_FRACTION);

      var lq = lowerArmNode.quaternion;
      var curLower = [lq.x, lq.y, lq.z, lq.w];
      var newLower = _qMul(lowerDelta, curLower);
      _qNormalize(newLower);
      lowerArmNode.quaternion.set(newLower[0], newLower[1], newLower[2], newLower[3]);
    }

    return true;
  }

  function _isSkinnedMesh(obj) {
    return !!(obj && obj.isSkinnedMesh && obj.geometry && obj.skeleton);
  }

  function _buildBodyBoneNameSet() {
    var set = {};
    for (var i = 0; i < BODY_BONES.length; i++) set[BODY_BONES[i]] = true;
    return set;
  }

  function _collectCollisionMeshes(vrm) {
    var targetBones = _buildBodyBoneNameSet();
    var meshes = [];

    vrm.scene.traverse(function (obj) {
      if (!_isSkinnedMesh(obj)) return;

      var skeleton = obj.skeleton;
      var hasRelevantBone = false;
      if (skeleton && skeleton.bones) {
        for (var bi = 0; bi < skeleton.bones.length; bi++) {
          var bn = skeleton.bones[bi] ? skeleton.bones[bi].name : '';
          if (!bn) continue;
          for (var kb in targetBones) {
            if (bn.toLowerCase().indexOf(kb.toLowerCase()) !== -1) {
              hasRelevantBone = true;
              break;
            }
          }
          if (hasRelevantBone) break;
        }
      }

      if (hasRelevantBone) meshes.push(obj);
    });

    return meshes;
  }

  function _measureHandRadii(vrm, scale) {
    _handRadii = {};
    var skinnedMeshes = [];
    vrm.scene.traverse(function (obj) {
      if (_isSkinnedMesh(obj)) skinnedMeshes.push(obj);
    });

    for (var hi = 0; hi < LIMB_DEFS.length; hi++) {
      var handBone = LIMB_DEFS[hi].bone;
      var handRawNode = null;
      try { handRawNode = vrm.humanoid.getRawBoneNode(handBone); } catch (e) {}
      if (!handRawNode) {
        _handRadii[handBone] = HAND_RADIUS_FALLBACK * scale;
        continue;
      }

      var handBoneIdx = -1, handSkel = null;
      for (var hsi = 0; hsi < skinnedMeshes.length; hsi++) {
        var hs = skinnedMeshes[hsi].skeleton;
        if (!hs || !hs.bones) continue;
        for (var hk = 0; hk < hs.bones.length; hk++) {
          if (hs.bones[hk] === handRawNode || hs.bones[hk].name === handRawNode.name) {
            handBoneIdx = hk; handSkel = hs; break;
          }
        }
        if (handBoneIdx !== -1) break;
      }

      var handMaxDist = 0;
      var handVertCount = 0;
      if (handBoneIdx !== -1) {
        var handBoneNode = vrm.humanoid.getNormalizedBoneNode(handBone);
        var handBoneWP = handBoneNode ? _wp(handBoneNode) : [0, 0, 0];

        for (var hmi = 0; hmi < skinnedMeshes.length; hmi++) {
          var hsm = skinnedMeshes[hmi];
          if (hsm.skeleton !== handSkel) continue;

          var hpos = hsm.geometry.getAttribute('position');
          var hsi2 = hsm.geometry.getAttribute('skinIndex');
          var hsw = hsm.geometry.getAttribute('skinWeight');
          if (!hpos || !hsi2 || !hsw) continue;

          for (var hvi = 0; hvi < hpos.count; hvi++) {
            var hs0 = hsi2.getX(hvi), hs1 = hsi2.getY(hvi), hs2 = hsi2.getZ(hvi), hs3 = hsi2.getW(hvi);
            var hw0 = hsw.getX(hvi), hw1 = hsw.getY(hvi), hw2 = hsw.getZ(hvi), hw3 = hsw.getW(hvi);
            var htw = 0;
            if (hs0 === handBoneIdx) htw += hw0;
            if (hs1 === handBoneIdx) htw += hw1;
            if (hs2 === handBoneIdx) htw += hw2;
            if (hs3 === handBoneIdx) htw += hw3;
            if (htw < 0.25) continue;

            handVertCount++;
            var hvx = hpos.getX(hvi), hvy = hpos.getY(hvi), hvz = hpos.getZ(hvi);
            var hmw = hsm.matrixWorld.elements;
            var hwx = hmw[0] * hvx + hmw[4] * hvy + hmw[8] * hvz + hmw[12];
            var hwy = hmw[1] * hvx + hmw[5] * hvy + hmw[9] * hvz + hmw[13];
            var hwz = hmw[2] * hvx + hmw[6] * hvy + hmw[10] * hvz + hmw[14];
            var hd = Math.sqrt((hwx - handBoneWP[0]) * (hwx - handBoneWP[0]) +
              (hwy - handBoneWP[1]) * (hwy - handBoneWP[1]) +
              (hwz - handBoneWP[2]) * (hwz - handBoneWP[2]));
            if (hd > handMaxDist) handMaxDist = hd;
          }
        }
      }

      if (handVertCount > 5 && handMaxDist > 0.001) {
        _handRadii[handBone] = handMaxDist;
      } else {
        _handRadii[handBone] = HAND_RADIUS_FALLBACK * scale;
      }
    }
  }

  function _updateProxyBounds() {
    if (!_proxyGeometry || !_proxyGeometry.attributes || !_proxyGeometry.attributes.position) return;
    _proxyGeometry.computeBoundingSphere();
    var bs = _proxyGeometry.boundingSphere;
    if (!bs) return;
    _proxyCenter[0] = bs.center.x;
    _proxyCenter[1] = bs.center.y;
    _proxyCenter[2] = bs.center.z;
    _proxyRadius = bs.radius;
  }

  function _ensureBVHModule() {
    if (_bvhReady || _bvhLoading || _bvhError) return;
    _bvhLoading = true;

    try {
      import(BVH_MODULE_URL).then(function (mod) {
        _MeshBVH = mod.MeshBVH;
        _StaticGeometryGenerator = mod.StaticGeometryGenerator;
        _getTriangleHitPointInfo = mod.getTriangleHitPointInfo;

        if (!_MeshBVH || !_StaticGeometryGenerator || !_getTriangleHitPointInfo) {
          throw new Error('three-mesh-bvh exports missing');
        }

        _bvhReady = true;
        _bvhLoading = false;

        if (_handle) {
          try { _buildProxyAndBVH(); } catch (e) { _bvhError = e; console.warn('[VRMCollision BVH] Build failed:', e); }
        }
      }).catch(function (e) {
        _bvhError = e;
        _bvhLoading = false;
        console.warn('[VRMCollision BVH] Module load failed:', e);
      });
    } catch (e) {
      _bvhError = e;
      _bvhLoading = false;
      console.warn('[VRMCollision BVH] Module load exception:', e);
    }
  }

  function _buildProxyAndBVH() {
    if (!_handle || !_handle.vrm || !_handle.vrm.scene || !_handle.vrm.humanoid) return;
    if (!_bvhReady) return;

    var THREE = _getTHREE();
    if (!THREE) return;

    var vrm = _handle.vrm;
    _collisionMeshes = _collectCollisionMeshes(vrm);

    if (_collisionMeshes.length === 0) {
      throw new Error('No collision SkinnedMeshes found for body bones');
    }

    _generator = new _StaticGeometryGenerator(_collisionMeshes);
    _generator.attributes = ['position'];
    _generator.applyWorldTransforms = true;

    _proxyGeometry = _generator.generate(new THREE.BufferGeometry());
    _proxyGeometry.computeVertexNormals();
    _proxyGeometry.boundsTree = new _MeshBVH(_proxyGeometry, { maxLeafTris: 12 });

    _proxyMesh = new THREE.Mesh(_proxyGeometry);
    _proxyMesh.matrixAutoUpdate = false;
    _proxyMesh.matrixWorld.identity();

    _updateProxyBounds();

    var scale = _handle.config ? _handle.config.scale : 11;
    _measureHandRadii(vrm, scale);

    _initialized = true;
    _diagDone = false;
    _lastRefitFrame = -1;

    console.log('[VRMCollision BVH] Init done:', {
      meshes: _collisionMeshes.length,
      verts: _proxyGeometry.attributes.position.count,
      tris: _proxyGeometry.index ? (_proxyGeometry.index.count / 3) : 0,
      proxyRadius: _proxyRadius,
      handRadii: _handRadii
    });
  }

  function _refitProxyGeometryIfNeeded(vrm) {
    if (!_proxyGeometry || !_proxyGeometry.boundsTree || !_generator) return false;

    var near = false;
    for (var i = 0; i < LIMB_DEFS.length; i++) {
      var hand = vrm.humanoid.getNormalizedBoneNode(LIMB_DEFS[i].bone);
      if (!hand) continue;
      var hwp = _wp(hand);
      var d = _dist(hwp, _proxyCenter);
      if (d < (_proxyRadius + REFIT_NEAR_DISTANCE)) {
        near = true;
        break;
      }
    }
    if (!near) return false;

    if (_frameCounter === _lastRefitFrame) return false;

    _generator.generate(_proxyGeometry);
    _proxyGeometry.computeVertexNormals();
    _proxyGeometry.attributes.position.needsUpdate = true;
    if (_proxyGeometry.attributes.normal) _proxyGeometry.attributes.normal.needsUpdate = true;
    _proxyGeometry.boundsTree.refit();
    _updateProxyBounds();
    _lastRefitFrame = _frameCounter;

    return true;
  }

  function init(handle) {
    _handle = handle || null;
    _initialized = false;
    _diagDone = false;
    _bvhError = null;

    _proxyGeometry = null;
    _proxyMesh = null;
    _generator = null;
    _collisionMeshes = [];

    _ensureBVHModule();

    if (_bvhReady) {
      try { _buildProxyAndBVH(); } catch (e) { _bvhError = e; console.warn('[VRMCollision BVH] Init failed:', e); }
    }
  }

  function _queryClosestPointAndNormal(handWP) {
    if (!_proxyGeometry || !_proxyGeometry.boundsTree) return null;

    _tempHand.set(handWP[0], handWP[1], handWP[2]);

    var hit = _proxyGeometry.boundsTree.closestPointToPoint(_tempHand, {});
    if (!hit || !hit.point) return null;

    _tempClosest.copy(hit.point);

    var info = _getTriangleHitPointInfo(_tempClosest, _proxyGeometry, hit.faceIndex, _tempTriInfo);
    if (!info || !info.face || !info.face.normal) return null;

    _tempNorm.copy(info.face.normal);
    if (_tempNorm.lengthSq() < 1e-10) return null;
    _tempNorm.normalize();

    return {
      closest: _tempClosest,
      normal: _tempNorm,
      distance: hit.distance
    };
  }

  function update() {
    if (!_enabled || !_handle || !_handle.vrm || !_handle.vrm.humanoid) return false;
    if (!_allocTemps()) return false;
    if (_bvhError) return false;

    if (!_bvhReady || !_initialized) {
      _ensureBVHModule();
      if (_debugVis && !_bvhReady && !_bvhLoading && !_bvhError) {
        console.log('[VRMCollision BVH] Waiting for module...');
      }
      return false;
    }

    var vrm = _handle.vrm;
    _frameCounter++;

    try { _handle.mesh.updateMatrixWorld(true); } catch (e) {}
    _refitProxyGeometryIfNeeded(vrm);

    var scale = _handle.config ? _handle.config.scale : 11;
    var anyCollision = false;

    for (var li = 0; li < LIMB_DEFS.length; li++) {
      var limb = LIMB_DEFS[li];
      var handNode = vrm.humanoid.getNormalizedBoneNode(limb.bone);
      if (!handNode) continue;

      var handWP = _wp(handNode);
      var handR = _handRadii[limb.bone] || (HAND_RADIUS_FALLBACK * scale);
      var threshold = handR + _margin * scale;

      var closest = _queryClosestPointAndNormal(handWP);
      if (!closest) continue;

      var penetration = threshold - closest.distance;
      if (penetration <= 0.0005) continue;

      // Use normal from surface; if it points toward hand, flip so push goes outwards.
      _tempPush.copy(closest.normal);
      var toHandX = handWP[0] - closest.closest.x;
      var toHandY = handWP[1] - closest.closest.y;
      var toHandZ = handWP[2] - closest.closest.z;
      var dot = _tempPush.x * toHandX + _tempPush.y * toHandY + _tempPush.z * toHandZ;
      if (dot > 0) {
        _tempPush.multiplyScalar(-1);
      }

      // Move hand to surface boundary (minimal correction)
      var corrWP = [
        handWP[0] + _tempPush.x * penetration,
        handWP[1] + _tempPush.y * penetration,
        handWP[2] + _tempPush.z * penetration
      ];

      var applied = _applyArmCorrection(vrm, limb, handWP, corrWP);
      if (applied) anyCollision = true;
    }

    if (anyCollision) {
      try { _handle.mesh.updateMatrixWorld(true); } catch (e2) {}
    }

    if (!_diagDone) {
      _diagDone = true;
      console.log('[VRMCollision BVH] First update:', {
        ready: _bvhReady,
        initialized: _initialized,
        proxyRadius: _proxyRadius,
        handRadii: _handRadii,
        collision: anyCollision
      });
    }

    if (_debugVis) _updateDebugVis();

    return anyCollision;
  }

  // === Debug overlay (lightweight) ===
  var _debugCanvas = null;
  var _debugCtx = null;

  function _ensureDebugCanvas() {
    if (_debugCanvas) return true;
    try {
      _debugCanvas = document.createElement('canvas');
      _debugCanvas.id = 'vrm-collision-bvh-debug-overlay';
      _debugCanvas.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
      _debugCanvas.width = window.innerWidth;
      _debugCanvas.height = window.innerHeight;
      document.body.appendChild(_debugCanvas);
      _debugCtx = _debugCanvas.getContext('2d');
      return true;
    } catch (e) {
      console.warn('[VRMCollision BVH] Cannot create debug canvas:', e);
      return false;
    }
  }

  function _removeDebugCanvas() {
    if (_debugCanvas && _debugCanvas.parentNode) _debugCanvas.parentNode.removeChild(_debugCanvas);
    _debugCanvas = null;
    _debugCtx = null;
  }

  function _projectToScreen(worldPos) {
    var cam = null;
    try { cam = MMD_SA.THREEX.camera.obj || MMD_SA.THREEX.data.camera; } catch (e) {}
    if (!cam || !_debugCanvas) return null;

    if (cam.matrixWorldInverse && cam.matrixWorld) {
      if (cam.matrixWorldInverse.getInverse) cam.matrixWorldInverse.getInverse(cam.matrixWorld);
      else if (cam.matrixWorldInverse.copy) cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
    }

    var mwi = cam.matrixWorldInverse;
    var pm = cam.projectionMatrix;
    if (!mwi || !pm || !mwi.elements || !pm.elements) return null;

    var me1 = mwi.elements;
    var me2 = pm.elements;

    var vx = me1[0] * worldPos[0] + me1[4] * worldPos[1] + me1[8] * worldPos[2] + me1[12];
    var vy = me1[1] * worldPos[0] + me1[5] * worldPos[1] + me1[9] * worldPos[2] + me1[13];
    var vz = me1[2] * worldPos[0] + me1[6] * worldPos[1] + me1[10] * worldPos[2] + me1[14];
    var vw = me1[3] * worldPos[0] + me1[7] * worldPos[1] + me1[11] * worldPos[2] + me1[15];

    var cx = me2[0] * vx + me2[4] * vy + me2[8] * vz + me2[12] * vw;
    var cy = me2[1] * vx + me2[5] * vy + me2[9] * vz + me2[13] * vw;
    var cz = me2[2] * vx + me2[6] * vy + me2[10] * vz + me2[14] * vw;
    var cw = me2[3] * vx + me2[7] * vy + me2[11] * vz + me2[15] * vw;

    if (Math.abs(cw) < 1e-6) return null;
    var ndcX = cx / cw, ndcY = cy / cw, ndcZ = cz / cw;
    if (ndcZ < -1 || ndcZ > 1) return null;

    return [
      (ndcX * 0.5 + 0.5) * _debugCanvas.width,
      (-ndcY * 0.5 + 0.5) * _debugCanvas.height,
      cw
    ];
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

  function _updateDebugVis() {
    if (!_debugVis || !_enabled || !_handle || !_handle.vrm || !_handle.vrm.humanoid) return;
    if (!_ensureDebugCanvas()) return;

    if (_debugCanvas.width !== window.innerWidth || _debugCanvas.height !== window.innerHeight) {
      _debugCanvas.width = window.innerWidth;
      _debugCanvas.height = window.innerHeight;
    }

    _debugCtx.clearRect(0, 0, _debugCanvas.width, _debugCanvas.height);

    var vrm = _handle.vrm;

    // Draw proxy center/radius
    var cp = _projectToScreen(_proxyCenter);
    if (cp) {
      _drawCircle(cp[0], cp[1], 6, 'rgba(0,255,180,0.9)', 'BVH center');
    }

    // Draw hands and closest points
    for (var i = 0; i < LIMB_DEFS.length; i++) {
      var limb = LIMB_DEFS[i];
      var hand = vrm.humanoid.getNormalizedBoneNode(limb.bone);
      if (!hand) continue;
      var hwp = _wp(hand);

      var hp = _projectToScreen(hwp);
      if (hp) _drawCircle(hp[0], hp[1], 8, 'rgba(80,120,255,0.9)', limb.bone);

      var closest = _queryClosestPointAndNormal(hwp);
      if (closest) {
        var cp2 = _projectToScreen([closest.closest.x, closest.closest.y, closest.closest.z]);
        if (cp2) _drawCircle(cp2[0], cp2[1], 5, 'rgba(255,120,80,0.9)', 'closest');
      }
    }

    _debugCtx.fillStyle = 'rgba(0,0,0,0.65)';
    _debugCtx.fillRect(6, 6, 300, 42);
    _debugCtx.fillStyle = '#0f0';
    _debugCtx.font = '11px monospace';
    _debugCtx.fillText('BVH:' + (_bvhReady ? 'ready' : (_bvhLoading ? 'loading' : 'off')) +
      '  init:' + _initialized + '  refitFrame:' + _lastRefitFrame, 10, 20);
    _debugCtx.fillText('proxyR:' + _proxyRadius.toFixed(3) + '  meshes:' + _collisionMeshes.length,
      10, 35);
  }

  window.VRMCollision = {
    init: init,

    update: function () {
      return update();
    },

    // Backward-compatible no-op (legacy pipeline called this before v5)
    applyCorrections: function () {},

    setEnabled: function (val) {
      _enabled = !!val;
      if (!_enabled) _removeDebugCanvas();
      console.log('[VRMCollision BVH] Enabled:', _enabled);
    },

    isEnabled: function () { return _enabled; },

    setDebugVisualization: function (val) {
      _debugVis = !!val;
      if (!_debugVis) _removeDebugCanvas();
      console.log('[VRMCollision BVH] Debug vis:', _debugVis);
    },

    isDebugVis: function () { return _debugVis; },

    setMargin: function (v) { _margin = Math.max(0, Math.min(0.2, v)); },
    getMargin: function () { return _margin; },

    // Kept for API compatibility
    setDamping: function () {},
    getDamping: function () { return 1; },

    getStats: function () {
      return {
        version: 5,
        enabled: _enabled,
        initialized: _initialized,
        bvhReady: _bvhReady,
        bvhLoading: _bvhLoading,
        bvhError: _bvhError ? String(_bvhError) : null,
        collisionMeshes: _collisionMeshes.length,
        proxyVerts: _proxyGeometry && _proxyGeometry.attributes && _proxyGeometry.attributes.position
          ? _proxyGeometry.attributes.position.count : 0,
        proxyTris: _proxyGeometry && _proxyGeometry.index ? (_proxyGeometry.index.count / 3) : 0,
        proxyRadius: _proxyRadius,
        handRadii: _handRadii,
        refitNearDistance: REFIT_NEAR_DISTANCE,
        maxCorrectionAngle: MAX_CORRECTION_ANGLE,
        isReady: _enabled && _initialized && _bvhReady && !_bvhError
      };
    },

    reinit: function () {
      if (_handle) init(_handle);
    }
  };

})();
