// 2024-12-10

(()=>{
  var TASKS_VISION_CACHE_BUST = '20260321-8';

  function get_cache_bust() {
    try {
      if (self && self.SA_CACHE_BUST) return String(self.SA_CACHE_BUST);
    } catch (e) {}

    try {
      var currentScript = (typeof document === 'object' && document.currentScript) ? document.currentScript : null;
      if (currentScript && currentScript.src) {
        var url = new URL(currentScript.src, self.location.href);
        var version = url.searchParams.get('v');
        if (version) return version;
      }
    } catch (e) {}

    return TASKS_VISION_CACHE_BUST;
  }

  function with_cache_bust(url) {
    if (!url || /[?&]v=/.test(url)) return url;
    return url + ((url.indexOf('?') === -1) ? '?' : '&') + 'v=' + encodeURIComponent(get_cache_bust());
  }

  function resolve_bundle_url() {
    // 1) Main thread: document.currentScript gives the real path to XRA_module_loader.js
    try {
      if (typeof document === 'object' && document.currentScript && document.currentScript.src) {
        return new URL('./vision_bundle.mjs', document.currentScript.src).href;
      }
    } catch (e) {}

    // 2) Worker context: self.location.href points to the WORKER script (e.g. tracking/pose_worker.js),
    //    NOT to @mediapipe/tasks/tasks-vision/. We must build the correct absolute path.
    try {
      // Derive site base from worker URL: strip everything after /redux/js/
      var loc = self.location.href;
      var jsIdx = loc.indexOf('/js/');
      if (jsIdx !== -1) {
        var base = loc.substring(0, jsIdx) + '/js/@mediapipe/tasks/tasks-vision/';
        return base + 'vision_bundle.mjs';
      }
    } catch (e) {}

    // 3) Last resort: relative to self.location (works if loader is in same dir)
    return new URL('./vision_bundle.mjs', self.location.href).href;
  }

  function load_module(m) {
//    console.log(m);
    for (const name of ['FilesetResolver', 'FaceLandmarker', 'PoseLandmarker', 'HandLandmarker', 'ObjectDetector', 'ImageClassifier'])//, 'HolisticLandmarker'])
      self[name] = m[name];
  }

  if (self.__saTasksVisionLoaderPromise) {
    return;
  }

  var bundleUrl = resolve_bundle_url();
  self.__saTasksVisionLoaderError = null;
  self.__saTasksVisionLoaderPromise = import(bundleUrl).then(load_module).catch((err) => {
    self.__saTasksVisionLoaderError = err;
    self.__saTasksVisionLoaderPromise = null;
    console.error('[SA][MediaPipe] Failed to import tasks vision bundle: ' + bundleUrl, err);
    throw err;
  });
})();

