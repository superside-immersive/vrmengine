// dungeon/shadow_toggle.js — SA_MMD_toggle_shadowMap handler
// Extracted from dungeon.js init() (Step 6G)
// Safety: d._setupShadowToggle() registers an event handler.
//         Handler body runs at runtime when THREE is available.
(function () {
var d = MMD_SA_options.Dungeon;

d._setupShadowToggle = function () {
window.addEventListener("SA_MMD_toggle_shadowMap", function (e) {
  var enabled = !!MMD_SA_options.use_shadowMap

  var p = MMD_SA_options.Dungeon.grid_material_list
  for (var i = 0, i_max = p.length; i < i_max; i++) {
    var p_obj = p[i]
    if (p_obj.disabled)
      continue

    for (var lvl = 0, lvl_max = p_obj.geo_by_lvl.length; lvl < lvl_max; lvl++) {
      p_obj.lvl[lvl].list.concat(p_obj.lvl[lvl].list_material_cloned).forEach(function (mesh_obj) {
mesh_obj.receiveShadow = enabled;
mesh_obj.material.needsUpdate = true;
      });
    }
  }

  MMD_SA_options.Dungeon.object_base_list.forEach(function (obj) {
    if (obj.is_dummy) return

    var construction = obj.construction
    var c = obj.cache.list
    var has_child = (obj.character_index == null) && c[0].children.length

    var castShadow, receiveShadow
    var updated0
    if (obj.character_index != null) {
//      updated0 = true

      const model_para = MMD_SA_options.model_para_obj_all[obj.character_index];
      const material_para = (model_para.material_para && model_para.material_para._default_) || {};

      castShadow =    enabled && ((material_para.castShadow != null)    ? !!material_para.castShadow : ((construction && (construction.castShadow != null)) ? construction.castShadow : true));
      receiveShadow = enabled && ((material_para.receiveShadow != null) ? !!material_para.receiveShadow : model_para.is_object || !MMD_SA_options.ground_shadow_only);
    }
    else {
      updated0 = !!obj.path

      const x_obj = (obj.path) ? MMD_SA_options.x_object_by_name[obj.path.replace(/^.+[\/\\]/, "").replace(/\.x$/i, "")] : MMD_SA_options.mesh_obj_by_id[construction.mesh_obj.id];
      castShadow =    enabled && !!x_obj.castShadow;
      receiveShadow = enabled && !!x_obj.receiveShadow;
    }

    for (var i = 0, i_max = c.length; i < i_max; i++) {
      if ((i == 0) && updated0)
        continue

      var cache = c[i]
      var mesh_list = (has_child) ? cache.children : [cache]
      mesh_list.forEach(function (mesh) {
        mesh.castShadow    = castShadow
        mesh.receiveShadow = receiveShadow

// no need to update materials for clones
        if (i)
          return
// non-mesh (e.g. light)
        if (!mesh.material)
          return

        if (mesh.material.materials) {
          mesh.material.materials.forEach(function (m) {
            m.needsUpdate = true
          });
        }
        else {
          mesh.material.needsUpdate = true
        }
      });
    }
  });
});
};
})();
