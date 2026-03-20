// facemesh-options-assemble.js
// Final assembly: set _FACEMESH_OPTIONS_ and clean up
(function () {
  XRA_DungeonOptionsCompat().events_default["_FACEMESH_OPTIONS_"] = window._FMO.branches;
  delete window._FMO;
})();
