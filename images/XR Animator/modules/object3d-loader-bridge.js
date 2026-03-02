(function () {
  'use strict';

  const XR_Animator_Object3DLoaderBridge = {
    create(context) {
      if (!context) return null;

      const {
        MMD_SA_options,
        MMD_SA,
        System,
        object3d_list,
        object3d_cache,
        getObject3DIndex,
        setObject3DIndex,
        toLocalPath,
        change_HDRI,
        rotationEuler,
        build_octree,
        is_mobile,
        update_panorama_depth,
        toFileProtocol,
        getExplorerMode,
        getRafTimestampDelta,
      } = context;

      if (!MMD_SA_options || !MMD_SA || !object3d_list || !object3d_cache) {
        return null;
      }

      let _Object3D_proxy;

      function createObject3DProxyClass() {
        const _Object3D_proxy_base =
          (MMD_SA_options && MMD_SA_options.Dungeon && MMD_SA_options.Dungeon.Object3D_proxy_base)
          || class {
            constructor(object3d) {
              this._parent = object3d;
            }
          };

        return class extends _Object3D_proxy_base {
          constructor(object3d) {
            super(object3d);
          }

          set hidden(v) {
            if (MMD_SA.THREEX.enabled) {
              this._parent._obj.visible = !v;
            }
            else {
              ((this._parent._obj.children[0]?.isMesh) ? this._parent._obj.children[0] : this._parent._obj).visible = !v;
            }
            if (this._parent.parent_bone) this._parent.parent_bone.disabled = v;
          }
        };
      }

      _Object3D_proxy = createObject3DProxyClass();
      window.addEventListener('load', () => {
        _Object3D_proxy = createObject3DProxyClass();
      });

      function onload_common(url, obj_all) {
        const mesh = obj_all.scene;

        const _THREE = MMD_SA.THREEX._THREE;
        const THREE = MMD_SA.THREEX.THREE;

        var model_filename = toLocalPath(url).replace(/^.+[\/\\]/, '');
        var model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.(x|gltf|glb)$/, '.$1').replace(/[\-\_]v\d+\.(x|gltf|glb)$/, '.$1');
        var model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || {};

        const is_X_model = /\.x/i.test(url);
        if (!is_X_model && MMD_SA.THREEX.enabled && !MMD_SA.THREEX.utils.HDRI.path) {
          change_HDRI(1, (MMD_SA.THREEX.utils.HDRI.mode == 1) ? false : null);
        }

        let material_para = model_para.material_para || {};
        material_para = material_para._default_ || {};
        if (material_para.receiveShadow != false) {
          mesh.traverse((obj) => {
            if (obj.isMesh) obj.receiveShadow = true;
          });
        }

        if (MMD_SA.THREEX.enabled) {
        }
        else {
          if (model_para.instanced_drawing) {
            mesh.instanced_drawing = model_para.instanced_drawing;
          }

          mesh.useQuaternion = true;
        }

        var placement = model_para.placement || {};
        mesh.position.copy(_THREE.MMD.getModels()[0].mesh.position);
        if (placement.position) {
          mesh.position.add(placement.position);
        }
        if (placement.rotation) {
          mesh.quaternion.setFromEuler(rotationEuler.copy(placement.rotation).multiplyScalar(Math.PI / 180));
        }
        mesh.scale.setScalar(placement.scale || ((is_X_model) ? 10 : 1));

        if (obj_all._update_para_only) {
          window.object3D0 = object3d_list.find((obj) => obj.user_data.id == model_filename);
          Object.assign(window.object3D0, model_para);
          return;
        }

        var object3d = Object.assign({}, model_para);
        object3d.uuid = THREE.Math.generateUUID();
        if (!object3d.user_data) object3d.user_data = {};
        object3d._obj = object3d._mesh = mesh;
        object3d._obj_proxy = new _Object3D_proxy(object3d);

        var model_id = model_filename;
        if (object3d_cache.get(url)) {
          model_id += '(cloned)';
        }
        else {
          object3d_cache.set(url, object3d);
        }

        const obj_cached = object3d_cache.get(url);
        object3d._obj_base = obj_cached._obj_base || {
          octree_collider_radius: model_para.octree_collider_radius || 1,
        };

        object3d.no_collision = true;
        object3d.collision_by_mesh = true;
        object3d.collision_by_mesh_sort_range = 1;

        setObject3DIndex(object3d_list.length);
        object3d_list.push(object3d);
        MMD_SA.THREEX._object3d_list_ = object3d_list;

        if (object3d.parent_bone) {
          MMD_SA_options.Dungeon.accessory_list.push(object3d);
        }

        object3d.user_data.id = model_id;
        object3d.user_data.path = url;
        object3d.user_data.obj_all = obj_all;

        object3d.user_data._rotation_ = new THREE.Euler();
        if (placement.rotation) {
          object3d.user_data._rotation_.copy(placement.rotation).multiplyScalar(Math.PI / 180);
        }
        if (placement.rotation?.is_billboard) object3d.user_data.is_billboard = true;

        object3d.user_data._default_state_ = {
          position: (object3d.parent_bone) ? new THREE.Vector3() : mesh.position.clone(),
          scale: mesh.scale.x,
          parent_bone_name: (object3d.parent_bone && object3d.parent_bone.name) || '',
        };

        if (obj_all.animations && obj_all.animations.length && !object3d.animation_disabled) {
          object3d.user_data.animation_clip = obj_all.animations[0];
          object3d.user_data.animation_mixer = new MMD_SA.THREEX.THREE.AnimationMixer(mesh);
          object3d.user_data.animation_mixer.clipAction(object3d.user_data.animation_clip).play();
        }

        console.log(object3d);

        if (!object3d.parent_bone) {
          System._browser.camera.poseNet.ground_plane_visible = false;
          MMD_SA.WebXR.ground_plane.visible = System._browser.camera.poseNet.ground_plane_visible;

          System._browser.camera.display_floating = (MMD_SA_options.user_camera.display.floating_auto !== false);
        }

        MMD_SA.THREEX.scene.add(mesh);

        build_octree(object3d);

        if (placement.hidden) {
          object3d._obj_proxy.hidden = true;
        }
      }

      async function addObject3D(url, para = {}) {
        return new Promise((resolve) => {
          const obj_cached = object3d_cache.get(url);
          if (obj_cached) {
            const obj_cloned = { scene: obj_cached.user_data.obj_all.scene, animations: obj_cached.user_data.obj_all.animations };
            if (!para._no_clone) {
              obj_cloned.scene = obj_cloned.scene.clone();
              console.log('object3D CLONED', url);
            }
            else {
              obj_cloned._update_para_only = true;
              console.log('object3D UPDATED', url);
            }

            onload_common(url, obj_cloned);
            resolve();
          }
          else if (/\.pmx$/i.test(url)) {
            (() => {
              const THREE = MMD_SA.THREEX.THREE;
              const model_index = THREE.MMD.getModels().length;

              const model_filename_raw = url.replace(/^.+[\/\\]/, '');
              const model_filename = model_filename_raw;
              const model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.pmx$/, '.pmx').replace(/[\-\_]v\d+\.pmx$/, '.pmx');

              const model_para_obj = Object.assign({}, MMD_SA_options.model_para[model_filename_raw] || MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || {});
              model_para_obj._filename_raw = model_filename_raw;
              model_para_obj._filename = model_filename;
              model_para_obj._filename_cleaned = model_filename_cleaned;

              if (!model_para_obj.skin_default) model_para_obj.skin_default = { _is_empty: true };
              if (!model_para_obj.morph_default) model_para_obj.morph_default = {};

              if (!model_para_obj.MME) model_para_obj.MME = {};
              var MME_saved = MMD_SA_options.MME_saved[model_filename] || MMD_SA_options.MME_saved[model_filename_cleaned];
              if (MME_saved) {
                model_para_obj.MME.self_overlay = Object.clone(MME_saved.self_overlay);
                model_para_obj.MME.HDR = Object.clone(MME_saved.HDR);
                model_para_obj.MME.serious_shader = Object.clone(MME_saved.serious_shader);
              }
              else {
                model_para_obj.MME.self_overlay = model_para_obj.MME.self_overlay || { enabled: false };
                model_para_obj.MME.HDR = model_para_obj.MME.HDR || { enabled: false };
                model_para_obj.MME.serious_shader = model_para_obj.MME.serious_shader || { enabled: false };
              }

              model_para_obj._model_index = model_para_obj._model_index_default = model_index;
              model_para_obj.is_object = true;
              model_para_obj.shadow_darkness = 1;
              MMD_SA_options.model_para_obj_by_filename[model_filename_raw] = model_para_obj;

              MMD_SA_options.model_para_obj_all.push(model_para_obj);

              new THREE.MMD.PMX().load(url, (pmx) => {
                new THREE.MMD.Model(pmx).create({}, function (model) {
                  var mesh = model.mesh;
                  mesh.material.materials.forEach(function (v) {
                    v.fog = true;
                    v.lights = true;
                  });
                  THREE.MMD.addModel(model);

                  new MMD_SA.THREEX.MMD_dummy_obj(model_index);

                  const mesh_obj_id = 'mikuPmx' + model_index;
                  const mesh_obj = MMD_SA_options.mesh_obj_by_id['#' + mesh_obj_id] = MMD_SA_options.mesh_obj_by_id[mesh_obj_id] = {
                    id: '#' + mesh_obj_id,
                    scale: 1,
                    _obj: mesh,
                    hide: MMD_SA_options.mesh_obj_by_id['#mikuPmx0'].hide,
                    show: MMD_SA_options.mesh_obj_by_id['#mikuPmx0'].show,
                  };
                  Object.defineProperty(mesh_obj, 'visible', {
                    get: function () {
                      return this._obj.visible;
                    },
                    set: function (v) {
                      this._obj.visible = v;
                    }
                  });

                  const AP = MMD_SA.ammo_proxy;
                  if (AP) {
                    const c_list = [AP.cache_by_model, AP.cache_by_model_next, AP.cache_by_model_temp];
                    c_list.forEach(function (cache) {
                      var obj = cache.list[model_index] = { skin: {}, _skin: {} };
                      obj.matrixWorld = new THREE.Matrix4();
                      obj.matrixWorld_inv = new THREE.Matrix4();
                      obj.q_matrixWorld_inv = new THREE.Quaternion();
                    });
                  }

                  const _mesh = mesh;
                  mesh = new THREE.Object3D();
                  mesh.add(_mesh);

                  onload_common(url, { scene: mesh });
                  resolve();

                  System._browser.on_animation_update.add((() => {
                    const pos = mesh.position.clone();
                    const rot = mesh.quaternion.clone();
                    const scale = mesh.scale.clone();
                    return () => {
                      mesh.position.copy(pos);
                      mesh.quaternion.copy(rot);
                      mesh.scale.copy(scale);
                      _mesh.scale.setScalar(1);
                    };
                  })(), 0, 0);
                });
              });
            })();
          }
          else if (/\.x$/i.test(url)) {
            const THREE = MMD_SA.THREEX.THREE;
            new THREE.XLoader(url, function (mesh) {
              const _mesh = mesh;
              mesh = new THREE.Object3D();
              mesh.add(_mesh);

              onload_common(url, { scene: mesh });
              resolve();
            }, function () {
            });
          }
          else if (/\.(gltf|glb)$/i.test(url)) {
            MMD_SA.THREEX.utils.load_GLTF(url, (gltf) => {
              onload_common(url, gltf);
              resolve();
            });
          }
          else if (/\.(bpm|jpg|jpeg|png|webp|mp4|mkv|webm)$/i.test(url)) {
            const is_video = /\.(mp4|mkv|webm)$/i.test(url);
            const img = (is_video) ? document.createElement('video') : new Image();
            if (is_video) {
              img.autoplay = img.loop = true;
            }

            img.addEventListener((is_video) ? 'loadeddata' : 'load', async () => {
              const THREE = MMD_SA.THREEX.THREE;

              let mesh, geometry, texture, canvas;

              if (para.panorama) {
                canvas = document.createElement('canvas');

                const cw = (is_mobile) ? 2048 : 4096;
                const ch = 2048;
                canvas.width = cw;
                canvas.height = ch;

                canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, cw, ch);

                texture = new THREE.Texture(canvas);
                const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false, transparent: true });

                const sd = MMD_SA_options.Dungeon_options.skydome;
                let dw = para.panorama.json?.width_segments || sd.width_segments;
                let dh = para.panorama.json?.height_segments || sd.height_segments;
                geometry = new THREE.SphereGeometry(64 * 4, dw, dh);

                mesh = new THREE.Mesh(
                  geometry,
                  material,
                );

                if (para.panorama.depth) {
                  await new Promise((resolveDepth) => {
                    const image = new Image();
                    image.onload = () => {
                      update_panorama_depth(image, mesh, para.panorama.json);
                      resolveDepth();
                    };
                    image.onerror = () => {
                      resolveDepth();
                    };
                    image.src = toFileProtocol(para.panorama.depth);
                  });
                }
              }
              else {
                if (is_video) {
                  if (MMD_SA.THREEX.enabled) {
                    texture = new THREE.VideoTexture(img);
                  }
                  else {
                    canvas = document.createElement('canvas');
                    canvas.width = 1024;
                    canvas.height = 1024;
                    texture = new THREE.Texture(canvas);
                  }
                }
                else {
                  texture = new THREE.Texture(img);
                }

                geometry = new THREE.PlaneGeometry((img.videoWidth || img.width) / 100, (img.videoHeight || img.height) / 100);
                const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });

                mesh = new THREE.Mesh(geometry, material);
              }

              if (!MMD_SA.THREEX.enabled) mesh.useQuaternion = true;

              if (MMD_SA.THREEX.enabled && MMD_SA.THREEX.use_sRGBEncoding) texture.colorSpace = THREE.SRGBColorSpace;
              texture.needsUpdate = true;

              const obj_all = { scene: mesh };

              onload_common(url, obj_all);

              if (is_video) {
                const obj = object3d_list[object3d_list.length - 1];
                obj.user_data.video = img;
                obj.user_data.canvas = canvas;
              }

              resolve();
            });

            img.src = toFileProtocol(url);
          }
        });
      }

      function animateObject3D() {
        object3d_list.forEach((obj) => {
          const d = obj.user_data;
          if (d.animation_mixer) {
            d.animation_mixer.update(getRafTimestampDelta() / 1000);
          }
          if (d.video && d.canvas) {
            const canvas = d.canvas;
            canvas.getContext('2d').drawImage(d.video, 0, 0, canvas.width, canvas.height);
            obj._obj.material.map.needsUpdate = true;
          }
          if (d.is_billboard) {
            const mesh = obj._obj;
            if (d._rotation_) {
              mesh.quaternion.setFromEuler(d._rotation_);
            }
            const camera = MMD_SA._trackball_camera.object;
            const y = Math.atan2(camera.position.x - mesh.position.x, camera.position.z - mesh.position.z);
            mesh.quaternion.premultiply(MMD_SA.TEMP_q.set(0, Math.sin(y / 2), 0, Math.cos(y / 2)));
          }
        });
      }

      return {
        addObject3D,
        animateObject3D,
        getObject3DIndex,
        setObject3DIndex,
        getExplorerMode,
      };
    }
  };

  window.XR_Animator_Object3DLoaderBridge = XR_Animator_Object3DLoaderBridge;
})();
