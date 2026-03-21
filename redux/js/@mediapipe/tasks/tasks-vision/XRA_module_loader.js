// 2024-12-10

(()=>{
  var TASKS_VISION_CACHE_BUST = '20260321-7';

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
    var baseUrl = self.location && self.location.href;
    try {
      if (typeof document === 'object' && document.currentScript && document.currentScript.src) {
        baseUrl = document.currentScript.src;
      }
    } catch (e) {}

    return with_cache_bust(new URL('./vision_bundle.mjs', baseUrl).href);
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

