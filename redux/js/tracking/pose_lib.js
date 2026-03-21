// (2023-08-23)

var POSE_LIB_CACHE_BUST = '20260320-9';

var PoseAT = (function () {

  var module_common;
  var core;

  var _PoseAT = {
    type: 'PoseAT',
    init: async function init(_worker, param) {
// core START
  module_common = await import('../mocap_lib_module.js?v=' + encodeURIComponent((self && self.SA_CACHE_BUST) || POSE_LIB_CACHE_BUST));
core = new module_common.Core(_PoseAT);
// core END

await core.init(_worker, param);
    },
  };

  return _PoseAT;
})();
