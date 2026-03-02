// object_setup.js - PC follower list, x_object, GOML construction
// Extracted Step 6H from dungeon.js
(function () {
var d = MMD_SA_options.Dungeon;

d._setupObjects = function () {
  var options = MMD_SA_options.Dungeon_options;

this.PC_follower_list = options.PC_follower_list || []
this.PC_follower_list_default = this.PC_follower_list.slice()

if (!MMD_SA_options.x_object)
  MMD_SA_options.x_object = []

if (!MMD_SA_options.model_path_extra)
  MMD_SA_options.model_path_extra = []

this.object_base_index_by_id = {}
this.object_base_list.forEach(function (obj, idx) {
  if (obj.is_dummy) return

  var c = obj.construction

  obj.index = idx

  if (obj.id)
    MMD_SA_options.Dungeon.object_base_index_by_id[obj.id] = idx

  if (obj.path && /\.pmx[^\/\\]*$/i.test(obj.path)) {
    MMD_SA_options.model_path_extra.push(obj.path);
    obj.character_index = MMD_SA_options.model_path_extra.length;
  }

  if (obj.character_index) {
    if (obj.model_scale) {
      window.addEventListener("jThree_ready", function () {
        MMD_SA_options.model_para_obj_all[obj.character_index].model_scale = obj.model_scale
      });
    }
    if (obj.path) {
      if (c && c.model_para) {
        const model_filename_cleaned = obj.path.replace(/^.+[\/\\]/, "").replace(/\#clone(\d+)\.pmx$/, ".pmx").replace(/[\-\_]copy\d+\.pmx$/, ".pmx").replace(/[\-\_]v\d+\.pmx$/, ".pmx");
        MMD_SA_options.model_para[model_filename_cleaned] = c.model_para;
      }
      delete obj.path;
    }
    return
  }

  if (c && !obj.path) {
    if (c.GOML_head)
      MMD_SA_options.GOML_head  += c.GOML_head
    if (c.GOML_scene)
      MMD_SA_options.GOML_scene += c.GOML_scene
    if (c.mesh_obj)
      MMD_SA_options.mesh_obj.push(c.mesh_obj)
//console.log(MMD_SA_options.GOML_head)
//console.log(MMD_SA_options.GOML_scene)
    c.build && c.build();
    return
  }

  if (c && c.model_para && obj.path) {
    let model_filename_cleaned = obj.path.replace(/^.+[\/\\]/, "").replace(/[\-\_]copy\d+\.x$/, ".x").replace(/[\-\_]v\d+\.x$/, ".x")
    MMD_SA_options.model_para[model_filename_cleaned] = c.model_para
//console.log(999, model_filename_cleaned, c.model_para)
  }

  MMD_SA_options.x_object.push(
    {
  path: obj.path
 ,style: 'scale:0;'
// ,scale: (obj.placement && obj.placement.scale) || 10
 ,boundingBox_list: c && c.boundingBox_list
 ,castShadow:    c && c.castShadow
 ,receiveShadow: c && c.receiveShadow
 ,bb_adjust: (obj.collision_by_mesh_enforced) ? { min:{x:0, y:-10, z:0} } : null
    }
  );
});

};
})();
