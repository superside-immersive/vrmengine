/**
 * VRM Direct Loader
 * 
 * Loads a VRM model independently from the existing MMD pipeline.
 * Creates its own GLTFLoader + VRMLoaderPlugin for complete isolation.
 * 
 * @module VRMDirectLoader
 */
(function() {
  'use strict';

  var DEFAULT_CONFIG = {
    vrmUrl:  'finalsnoo.vrm',
    scale:   11,
    offsetX: 15,   // to the right of the main model
    offsetY: 0,
    offsetZ: 0
  };

  var _vrm    = null;
  var _mesh   = null;
  var _isVRM1 = true;
  var _loader = null;
  var _loading = false;
  var _config  = {};
  var _blendshapeMap        = null;
  var _blendshapeConvention = null;

  // ──────────────────────────────────────────────
  //  Internal helpers
  // ──────────────────────────────────────────────

  /** Return the VRM-capable THREE namespace */
  function _getTHREE() {
    if (window._VRMDirectTHREE) return window._VRMDirectTHREE;
    if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.THREE || MMD_SA.THREEX._THREE;
    return window.THREE;
  }

  /** Return THREEX (the private THREE inside MMD_SA closure) */
  function _getTHREEX() {
    if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.THREEX || {};
    return window.THREEX || {};
  }

  /** Return the scene */
  function _getScene() {
    if (window._VRMDirectScene) return window._VRMDirectScene;
    if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.scene;
    return null;
  }

  /**
   * Get a GLTFLoader with VRMLoaderPlugin registered.
   * Priority: 1) _VRMDirectLoader (own), 2) MMD_SA loader, 3) new GLTFLoader
   */
  function createLoader() {
    if (_loader) return _loader;

    if (window._VRMDirectLoader) {
      _loader = window._VRMDirectLoader;
      console.log('[VRMDirect] Using _VRMDirectLoader');
      return _loader;
    }

    try {
      if (window.MMD_SA && MMD_SA.THREEX && MMD_SA.THREEX.GLTF_loader) {
        _loader = MMD_SA.THREEX.GLTF_loader;
        console.log('[VRMDirect] Using existing GLTF_loader from MMD_SA');
        return _loader;
      }
    } catch (e) {}

    console.log('[VRMDirect] Creating own GLTFLoader');
    var T  = _getTHREE();
    var TX = _getTHREEX();
    _loader = new T.GLTFLoader();
    if (TX && TX.VRMLoaderPlugin) {
      _loader.register(function(parser) { return new TX.VRMLoaderPlugin(parser); });
    } else {
      console.warn('[VRMDirect] VRMLoaderPlugin not found — VRM may not load correctly');
    }
    return _loader;
  }

  /**
   * Detect how the VRM model exposes ARKit-compatible blendshapes.
   * Returns 'asis' | 'prefixed' | 'camel' | null
   */
  function detectBlendshapeConvention(vrm) {
    var em = vrm.expressionManager;
    if (!em || !em.customExpressionMap) return null;
    if (em.customExpressionMap['CheekPuff'])            return 'asis';
    if (em.customExpressionMap['BlendShape.CheekPuff']) return 'prefixed';
    if (em.customExpressionMap['cheekPuff'])             return 'camel';
    return null;
  }

  /**
   * Build ARKit blendshape name → VRM expression name mapping
   */
  function buildBlendshapeMap(convention) {
    if (!convention) return null;
    try {
      var list = System._browser.camera.facemesh.faceBlendshapes_list;
      if (!list) return null;

      var map = {};
      for (var i = 0; i < list.length; i++) {
        var n = list[i];
        switch (convention) {
          case 'asis':     map[n] = n; break;
          case 'prefixed': map[n] = 'BlendShape.' + n; break;
          case 'camel':    map[n] = n.charAt(0).toLowerCase() + n.substring(1); break;
        }
      }
      return map;
    } catch (e) {
      return null;
    }
  }

  /**
   * Create own WebGLRenderer, PerspectiveCamera and Scene.
   * Used in standalone mode (no MMD/jThree).
   */
  function _createOwnRenderer() {
    var T = _getTHREE();

    var canvas = document.createElement('canvas');
    canvas.id = 'vrm-direct-canvas';
    canvas.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'pointer-events:none', 'z-index:10'
    ].join(';');
    document.body.appendChild(canvas);

    var renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    try { renderer.outputColorSpace = T.SRGBColorSpace; }
    catch(e) { try { renderer.outputEncoding = T.sRGBEncoding; } catch(e2) {} }

    var camera = new T.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 20);
    camera.position.set(0, 1.3, 3.5);

    var scene = new T.Scene();
    var dirLight = new T.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);
    scene.add(new T.AmbientLight(0xffffff, 0.4));

    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log('[VRMDirect] Own renderer created');
    return { renderer: renderer, camera: camera, scene: scene };
  }

  // ──────────────────────────────────────────────
  //  Public methods
  // ──────────────────────────────────────────────

  /**
   * Load the VRM model and add it to the scene.
   * @param {Object} [config] - Optional overrides for DEFAULT_CONFIG
   * @returns {Promise} Resolves with VRM handle object
   */
  function load(config) {
    if (_loading) return Promise.reject(new Error('[VRMDirect] Already loading'));
    if (_vrm)     return Promise.resolve(getHandle());

    _config  = Object.assign({}, DEFAULT_CONFIG, config || {});
    _loading = true;

    return new Promise(function(resolve, reject) {
      var loader = createLoader();
      var url    = _config.vrmUrl;

      console.log('[VRMDirect] Loading VRM:', url);

      // Safety timeout
      var timeout = setTimeout(function() {
        _loading = false;
        reject(new Error('[VRMDirect] Load timeout (30 s)'));
      }, 30000);

      try {
        loader.load(
          url,

          // ── onLoad ──
          function(gltf) {
            clearTimeout(timeout);
            try {
              // VRM post-processing — exactly like threex-vrm.js
              var T = _getTHREE();
              if (T.VRMUtils) {
                T.VRMUtils.combineMorphs && T.VRMUtils.combineMorphs(gltf.userData.vrm);
                T.VRMUtils.removeUnnecessaryVertices(gltf.scene);
                T.VRMUtils.combineSkeletons(gltf.scene);
              }

              var vrm = gltf.userData.vrm;
              if (!vrm) {
                _loading = false;
                reject(new Error('[VRMDirect] No VRM data in loaded file'));
                return;
              }

              _vrm    = vrm;
              _mesh   = vrm.scene;
              _isVRM1 = !!(vrm.meta && vrm.meta.metaVersion);

              // Critical for VRM 1.0: enable autoUpdateHumanBones
              // (same as threex-vrm.js line 349)
              if (_isVRM1 && vrm.humanoid) {
                vrm.humanoid.autoUpdateHumanBones = true;
              }

              // Scale and offset
              _mesh.scale.set(_config.scale, _config.scale, _config.scale);
              _mesh.position.set(_config.offsetX, _config.offsetY, _config.offsetZ);

              // Critical: disable frustum culling + enable AO layer
              // (same as threex-vrm.js line 1183-1186)
              // AO_MASK = 2 es el valor estándar de SAO para la máscara de oclusión ambiental
              var aoMask = 2;
              _mesh.traverse(function(obj) {
                obj.frustumCulled = false;
                obj.layers.enable(aoMask);
              });

              // Enable shadow casting
              if (window.MMD_SA_options && MMD_SA_options.use_shadowMap) {
                _mesh.traverseVisible(function(obj) {
                  if (obj.isMesh) obj.castShadow = true;
                });
              }

              // Debug: log mesh info for visibility diagnosis
              var meshCount = 0, matCount = 0, visCount = 0;
              _mesh.traverse(function(obj) {
                if (obj.isMesh) {
                  meshCount++;
                  if (obj.visible) visCount++;
                  if (obj.material) matCount++;
                }
              });
              console.log('[VRMDirect] Mesh debug:', {
                meshes: meshCount,
                visible: visCount,
                materials: matCount,
                rootVisible: _mesh.visible,
                worldPos: _mesh.position.toArray(),
                worldScale: _mesh.scale.toArray()
              });

              // Add to Three.js scene
              var scene = _getScene();
              if (scene) {
                _mesh.visible = true;
                // Cross-THREE-build safe add (bypasses instanceof check)
                if (_mesh.parent) {
                  var _ri = _mesh.parent.children.indexOf(_mesh);
                  if (_ri !== -1) _mesh.parent.children.splice(_ri, 1);
                }
                _mesh.parent = scene;
                scene.children.push(_mesh);
                if (_mesh.dispatchEvent) _mesh.dispatchEvent({ type: 'added' });
                _mesh.updateMatrixWorld(true);
                console.log('[VRMDirect] Added to scene, children:', scene.children.length);
              } else {
                console.warn('[VRMDirect] No scene found to add mesh');
              }

              // Blendshape convention detection
              _blendshapeConvention = detectBlendshapeConvention(vrm);
              _blendshapeMap        = buildBlendshapeMap(_blendshapeConvention);

              var boneCount = 0;
              try { boneCount = Object.keys(vrm.humanoid.humanBones).length; } catch(e) {}

              console.log('[VRMDirect] VRM loaded', {
                isVRM1:      _isVRM1,
                blendshapes: _blendshapeConvention || 'standard',
                bones:       boneCount
              });

              // Dump ALL available expressions for debugging
              try {
                var em = vrm.expressionManager;
                if (em) {
                  var exprNames = [];
                  if (em.expressionMap) exprNames = Object.keys(em.expressionMap);
                  var customNames = [];
                  if (em.customExpressionMap) customNames = Object.keys(em.customExpressionMap);
                  console.log('[VRMDirect] EXPRESSIONS available:', {
                    standard: exprNames,
                    custom: customNames,
                    total: exprNames.length + customNames.length
                  });
                } else {
                  console.warn('[VRMDirect] NO expressionManager on VRM!');
                }
              } catch(e) { console.warn('[VRMDirect] Expression dump error:', e); }

              _loading = false;
              resolve(getHandle());

              // Expose a model stub for XR_Ropes so it can sample the VRM mesh surface.
              // XR_Ropes calls get_modelX() → expects { mesh, model_scale }.
              window.VRMDirectModelStub = {
                mesh:        _mesh,
                model_scale: _config.scale
              };
              console.log('[VRMDirect] VRMDirectModelStub set (scale=' + _config.scale + ')');
              // Trigger XR_Ropes to rebuild anchors on the VRM mesh
              try { if (self.XR_Ropes) self.XR_Ropes.rebuild(); } catch(e) {}

            } catch (e) {
              _loading = false;
              console.error('[VRMDirect] Processing error:', e);
              reject(e);
            }
          },

          // ── onProgress ──
          function(p) {
            if (p.total) {
              var pct = Math.round(p.loaded / p.total * 100);
              if (pct % 25 === 0) console.log('[VRMDirect] Loading: ' + pct + '%');
            }
          },

          // ── onError ──
          function(err) {
            clearTimeout(timeout);
            _loading = false;
            console.error('[VRMDirect] Load error:', err);
            reject(err);
          }
        );
      } catch (e) {
        clearTimeout(timeout);
        _loading = false;
        reject(e);
      }
    });
  }

  /**
   * Remove VRM from scene and dispose GPU resources
   */
  function unload() {
    if (_mesh) {
      var scene = _getScene();
      if (scene) scene.remove(_mesh);
    }
    if (_vrm) {
      try {
        if (_vrm.dispose) _vrm.dispose();
        if (_mesh) {
          _mesh.traverse(function(obj) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach(function(m) { m.dispose(); });
              } else {
                obj.material.dispose();
              }
            }
          });
        }
      } catch (e) {
        console.warn('[VRMDirect] Dispose warning:', e);
      }
    }

    _vrm    = null;
    _mesh   = null;
    _loading = false;
    _blendshapeMap        = null;
    _blendshapeConvention = null;

    // Clear model stub so XR_Ropes falls back to MMD
    window.VRMDirectModelStub = null;
    try { if (self.XR_Ropes) self.XR_Ropes.rebuild(); } catch(e) {}
  }

  /**
   * Get the VRM handle for use by the animator.
   * @returns {Object|null} Handle with helper methods
   */
  function getHandle() {
    if (!_vrm) return null;

    return {
      vrm:                   _vrm,
      mesh:                  _mesh,
      isVRM1:                _isVRM1,
      config:                _config,
      blendshapeMap:         _blendshapeMap,
      blendshapeConvention:  _blendshapeConvention,

      /** Get a normalized bone Object3D by VRM humanoid name */
      getBoneNode: function(vrmBoneName) {
        try { return _vrm.humanoid.getNormalizedBoneNode(vrmBoneName); }
        catch (e) { return null; }
      },

      /** Set an expression weight on the VRM */
      setExpression: function(name, value) {
        try { _vrm.expressionManager.setValue(name, value); }
        catch (e) {}
      },

      /** Advance VRM runtime (physics, spring bones, expressions) */
      update: function(deltaTime) {
        try { _vrm.update(deltaTime); }
        catch (e) {}
      },

      /** Reset all normalized bones to their rest pose */
      resetPose: function() {
        try { _vrm.humanoid.resetNormalizedPose(); }
        catch (e) {}
      }
    };
  }

  // ─── Public API ───
  window.VRMDirectLoader = {
    load:             load,
    unload:           unload,
    getHandle:        getHandle,
    createOwnContext: _createOwnRenderer,
    isLoaded:         function() { return !!_vrm; },
    isLoading:        function() { return _loading; }
  };

})();
