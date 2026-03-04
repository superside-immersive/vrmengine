// facemesh-options-assemble.js
// Final assembly: set _FACEMESH_OPTIONS_ and clean up
(function () {
  MMD_SA_options.Dungeon_options.events_default["_FACEMESH_OPTIONS_"] = window._FMO.branches;
  delete window._FMO;
})();
