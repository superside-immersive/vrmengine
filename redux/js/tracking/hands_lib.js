// (2023-08-23)

var TRACKING_LIB_CACHE_BUST = '20260321-3';

function getTrackingLibCacheBust() {
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

  return TRACKING_LIB_CACHE_BUST;
}

function getTrackingModuleUrl() {
  return '../mocap_lib_module.js?v=' + encodeURIComponent(getTrackingLibCacheBust());
}

var HandsAT = (function () {

  var module_common;
  var core;

  var _HandsAT = {
    type: 'HandsAT',
    init: async function init(_worker, param) {
// core START
var moduleUrl = getTrackingModuleUrl();
try {
  module_common = await import(moduleUrl);
}
catch (err) {
  console.error('[HandsAT] Failed to import tracking module: ' + moduleUrl, err);
  throw err;
}
core = new module_common.Core(_HandsAT);
// core END

await core.init(_worker, param);
    }
  };

  return _HandsAT;
})();
