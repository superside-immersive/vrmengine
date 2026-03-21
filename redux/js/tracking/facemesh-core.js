// facemesh-core.js — FacemeshAT init, model loading
// Refactored: Step 2C — extracted from js/facemesh_lib.js

export function fm_path_adjusted(url) {
  var is_worker = (typeof window !== "object");
  if (is_worker) {
    // Worker is in js/tracking/, but resources are in js/
    if (!/^\w+\:/i.test(url) && !/^\.\.\//.test(url)) {
      url = '../' + url
    }
  }
  else if (!/^\w+\:/i.test(url)) {
    url = url.replace(/^(\.?\/?)([\w\@])/, "$1js/$2")
  }
  return url
}

export async function fm_load_scripts(S, url) {
  if (/^https?:\/\//i.test(url)) {
    throw new Error('External script URL blocked by privacy mode: ' + url);
  }

  var cacheBust = '';
  try {
    cacheBust = String((self && self.SA_CACHE_BUST) || '20260321-6');
  } catch (e) {
    cacheBust = '20260321-6';
  }

  function withCacheBust(src) {
    if (!src || /[?&]v=/.test(src)) return src;
    return src + ((src.indexOf('?') === -1) ? '?' : '&') + 'v=' + encodeURIComponent(cacheBust);
  }

  if (S.is_worker) {
    // Worker is at js/tracking/, resources are at js/ — prepend ../
    if (!/^\w+\:/i.test(url) && !/^\.\.\//.test(url)) {
      url = url.replace(/^(\.\/)?/, '../')
    }
    url = withCacheBust(url);
    try {
      importScripts(url)
    }
    catch (err) {
      throw new Error('Failed to import script: ' + url + ((err && err.message) ? (' (' + err.message + ')') : ''));
    }
  }
  else {
    return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.onload = () => { resolve() };
      let resolvedUrl = withCacheBust(fm_path_adjusted(url));
      script.onerror = () => { reject(new Error('Failed to load script: ' + resolvedUrl)); };
      script.src = resolvedUrl;
      document.head.appendChild(script);
    });
  }
}

function fm_wait_for_tasks_vision_loader() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timerID = setInterval(() => {
      if (self.__saTasksVisionLoaderError) {
        clearInterval(timerID);
        reject(self.__saTasksVisionLoaderError);
        return;
      }

      if (self.__saTasksVisionLoaderPromise) {
        clearInterval(timerID);
        Promise.resolve(self.__saTasksVisionLoaderPromise).then(resolve).catch(reject);
        return;
      }

      if ('FilesetResolver' in self) {
        clearInterval(timerID);
        resolve();
        return;
      }

      if ((Date.now() - start) > 10000) {
        clearInterval(timerID);
        reject(new Error('Timed out waiting for MediaPipe Tasks loader'));
      }
    }, 50);
  });
}

export async function fm_init(S, _worker, param) {
  S._worker = _worker;

  if (param) {
    param = (function () {
      var _param = {};
      param.forEach((p) => {
        if (/(\w+)\=(\w+)/.test(p))
          _param[RegExp.$1] = RegExp.$2
      });
      return {
        get: function (id) {
          return _param[id]
        }
      };
    })();
  }
  else {
    param = new URLSearchParams(self.location.search.substring(1));
  }

  S.use_faceLandmarksDetection = param.get('use_face_landmarks');
  S.use_human_facemesh = param.get('use_human_facemesh');
  S.use_mediapipe_facemesh = param.get('use_mediapipe_facemesh');
  S.use_mediapipe_face_landmarker = S.use_mediapipe_facemesh;
  S.facemesh_version = (S.use_faceLandmarksDetection || S.use_human_facemesh || S.use_mediapipe_facemesh) ? '' : '@0.0.3';

  fetch(fm_path_adjusted('facemesh_triangulation.json'))
    .then(response => response.json())
    .then(data => { S.TRIANGULATION = data });

  S.postMessageAT('OK')
}

export async function fm_load_lib(S, options) {
  if (S.facemesh_initialized) {
    if (S.use_mediapipe_face_landmarker && (S.model_inference_device != options.model_inference_device)) {
      S.model_inference_device = options.model_inference_device;
      await S.model.f.setOptions({
        baseOptions: {
          delegate: S.model_inference_device
        },
      });
      console.log('Facemesh - delegate:' + S.model_inference_device);
    }
    return;
  }

  if (S.use_mediapipe_facemesh) {
    await _fm_model_init(S, options);
  }
  else {
// https://github.com/nickthedude/nicksern.es/blob/84e6aab81a32f4c3a6ab16ff18bda77746f77c33/nicksern.es/static/js/wasm-check.js
    S.use_SIMD = false;

    if (S.use_human_facemesh) {
      process = undefined

      await fm_load_scripts(S, './human/dist/human.js');
      S.human = new Human.default();

      S.human.load({
        backend: 'wasm',
        cacheSensitivity: 0.999,
        filter: { enabled: false },
        gesture: { enabled: false },
        face: {
          enabled: true,
          detector: {
            modelPath: './human/models/blazeface.json',
            rotation: S.use_faceLandmarksDetection,
            maxDetected: 1,
            skipTime: 500,
          },
          mesh: {
            enabled: true,
            modelPath: './human/models/facemesh.json',
            returnRawData: true
          },
          iris: {
            enabled: S.use_faceLandmarksDetection,
            modelPath: './human/models/iris.json'
          },
          description: { enabled: false },
          age: { enabled: false },
          gender: { enabled: false },
          emotion: {
            enabled: S.use_faceLandmarksDetection,
            skipTime: 500,
            modelPath: './human/models/emotion.json'
          }
        },
        body: { enabled: false },
        hand: { enabled: false }
      });

      S.postMessageAT('(Use Human Facemesh/' + ((S.human.config.backend == 'wasm') ? 'WASM' + ((S.use_SIMD && '-SIMD') || '') : S.human.config.backend) + ')')
      S.postMessageAT('OK')
    }
    else {
      let tfjs_version = '';

      await fm_load_scripts(S, 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs' + tfjs_version);

      if (1) {
        await fm_load_scripts(S, 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm' + tfjs_version + '/dist/tf-backend-wasm.js');

        if (tfjs_version == '@2.1.0') {
          tf.wasm.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm' + tfjs_version + '/dist/tfjs-backend-wasm' + ((S.use_SIMD) ? '-simd' : '') + '.wasm');
        }
        else {
          tf.wasm.setWasmPaths('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm' + tfjs_version + '/dist/');
        }

        await tf.setBackend("wasm")

        console.log('Facemesh: TFJS WASM' + ((S.use_SIMD) ? '-SIMD' : '') + ' backend')
      }
      else {
        console.log('Facemesh: TFJS WebGL backend')
      }

      await _fm_model_init(S)
    }
  }

  if (!S.use_faceLandmarksDetection) {
// https://tehnokv.com/posts/puploc-with-trees/demo/
    S.do_puploc = function(r, c, s, nperturbs, pixels, nrows, ncols, ldim) { return [-1.0, -1.0]; };
    S.postMessageAT('(puploc disabled - external download blocked)');
  }

  S.facemesh_initialized = true
}

function run_face_detection(detector, input, nowInMs) {
  if (typeof ImageData !== 'undefined' && input instanceof ImageData) {
    let canvas = detector.__saVideoInputCanvas;
    if (!canvas || canvas.width !== input.width || canvas.height !== input.height) {
      canvas = (typeof OffscreenCanvas !== 'undefined')
        ? new OffscreenCanvas(input.width, input.height)
        : self.document.createElement('canvas');
      canvas.width = input.width;
      canvas.height = input.height;
      detector.__saVideoInputCanvas = canvas;
    }
    detector.__saVideoInputCanvas.getContext('2d').putImageData(input, 0, 0);
    input = detector.__saVideoInputCanvas;
  }

  return detector.detectForVideo(input, nowInMs);
}

async function _fm_model_init(S, options) {
  if (S.use_mediapipe_facemesh) {
    if (S.use_mediapipe_face_landmarker) {
      await fm_load_scripts(S, '@mediapipe/tasks/tasks-vision/XRA_module_loader.js');
      await fm_wait_for_tasks_vision_loader();

      const vision = await FilesetResolver.forVisionTasks(
        fm_path_adjusted('@mediapipe/tasks/tasks-vision/wasm')
      );

      S.model_inference_device = options.model_inference_device;

      const f = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: fm_path_adjusted('@mediapipe/tasks/face_landmarker.task'),
            delegate: S.model_inference_device
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        }
      );
      console.log('Facemesh - delegate:' + S.model_inference_device);

      S.model = {
        f: f,
        detect: function (video, nowInMs) {
          const result = run_face_detection(f, video, nowInMs);
          return Object.assign({ multiFaceLandmarks: result.faceLandmarks }, result);
        }
      };

      console.log('(Mediapipe Face Landmarker initialized)')
      S.postMessageAT('(Mediapipe Face Landmarker initialized)')
    }
    else {
      await fm_load_scripts(S, '@mediapipe/face_mesh/face_mesh.js');

      await (async function () {
        var face = new FaceMesh({ locateFile: (file) => {
          return ((S.is_worker) ? '' : System.Gadget.path + '/') + fm_path_adjusted('@mediapipe/face_mesh/' + file);
        }});

        face.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        var facemesh_results;
        face.onResults((results) => {
          facemesh_results = results;
        });

        await face.initialize();

        S.model = {
          estimateFaces: async function (obj, config) {
            await face.send({ image: obj.input });
            return facemesh_results;
          }
        };
      })();

      console.log('(Mediapipe facemesh initialized)')
      S.postMessageAT('(Mediapipe facemesh initialized)')
    }
  }
  else if (S.use_faceLandmarksDetection) {
    await fm_load_scripts(S, 'https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection' + '@0.0.3' + '/dist/face-landmarks-detection.js');

    S.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, { maxFaces: 1 });

    S.recalculate_z_rotation_from_scaledMesh = true
    S.postMessageAT('(Face-landmarks-detection initialized)')
  }
  else {
    await fm_load_scripts(S, 'https://cdn.jsdelivr.net/npm/@tensorflow-models/facemesh' + S.facemesh_version);

    S.model = await facemesh.load({ maxFaces: 1 });
    console.log('(Facemesh initialized)')

    S.postMessageAT('(Facemesh initialized' + ((S.use_SIMD) ? '/use SIMD' : '') + ')')
  }
}
