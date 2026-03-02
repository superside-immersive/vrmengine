// mirrors.js — extracted from MMD_SA.js
// Mirror rendering: camera_list, depth_render_mode, createMirror

window.MMD_SA_createMirrors = function () {
return {

 camera_list: []

// depth render
 ,__depth_render_mode__: 0
 ,_depth_render_uniform_list: []
 ,get _depth_render_mode_() { return this.__depth_render_mode__ }
 ,set _depth_render_mode_(v) {
this.__depth_render_mode__ = v
var disabled_by_material = MMD_SA_options.MME.SAO.disabled_by_material
this._depth_render_uniform_list.forEach(function (obj) {
  var v_this = v
  if (v_this == 1) {
    if (disabled_by_material.indexOf(obj.name) != -1)
      v_this = 2
  }
  obj.uniform.value = v_this
});
  }


// mirrors
 ,_THREE_mirror: []
 ,_skip_render_list: []
 ,mirror_index: -1
 ,mirror_obj: []
 ,createMirror: function (para) {
if (para.created)
  return null
para.created = true

para.mirror_index = ++this.mirror_index
this.mirror_obj[this.mirror_index] = para

if (!para.plane && !para.geo_type)
  para.plane = [30,30]
if (para.plane) {
  para.geo_type  = "Plane"
  para.geo_param = para.plane
}

if (!para.baseTexture)
  para.baseTexture = System.Gadget.path + '/images/bg.png'

if (para.hidden)
  MMD_SA._skip_render_list.push('#Mirror' + this.mirror_index + 'MESH')

return {
  geo:  '<geo id="Mirror' + this.mirror_index + 'GEO" type="' + para.geo_type + '" param="' + para.geo_param.join(" ") + '" />\n'
 ,mtl:  '<mtl id="Mirror' + this.mirror_index + 'MTL" type="Mirror" param="mirror_index:' + this.mirror_index + '; mesh:#Mirror' + this.mirror_index + 'MESH; renderer:#MMD_renderer; camera:#MMD_camera; clipBias:0.003; textureWidth:' + (para.textureWidth||1024) + '; textureHeight:' + (para.textureHeight||1024) + ';' + ((para.clip_y != null) ? ' clip_y:' + para.clip_y + ';' : '') + '" />\n'
 ,mesh: '<mesh id="Mirror' + this.mirror_index + 'MESH" geo="#Mirror' + this.mirror_index + 'GEO" mtl="#Mirror' + this.mirror_index + 'MTL" style="' + para.style + '" />\n'
};
  }

};
};
