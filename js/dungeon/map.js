// map.js — extracted from dungeon.js (Step 6C)
// Map rendering: grid blocking, GOML dungeon blocks, ground height, grid params, block updates

var d = MMD_SA_options.Dungeon;

d.grid_blocking_camera_offset = 2;
d.grid_blocking_character_offset = 4;
d.check_grid_blocking = (function () {
    var blk_v3
    window.addEventListener("MMDStarted", function () {
blk_v3 = new THREE.Vector3()
    });
    return function (pos, offset, dir) {
var grid_size = this.grid_size

if ((this.ceil_material_index_default != -1) && (pos.y > this.ceil_height - 20)) {
  return true//{ limited:{y:1} }
}
var is_camera = (offset == this.grid_blocking_camera_offset)
var no_ceil_camera_high = (this.ceil_material_index_default == -1) && is_camera && (pos.y > this.ceil_height)

var _x = Math.floor((pos.x) / grid_size)
var _y = Math.floor((pos.z) / grid_size)

var X = {}
var Y = {}
X[_x] = true
Y[_y] = true
X[Math.floor((pos.x+offset) / grid_size)] = true
Y[Math.floor((pos.z+offset) / grid_size)] = true
X[Math.floor((pos.x-offset) / grid_size)] = true
Y[Math.floor((pos.z-offset) / grid_size)] = true

for (var x in X) {
  for (var y in Y) {
    if ((x < 0) || (x >= this.RDG_options.width) || (y < 0) || (y >= this.RDG_options.height) || (!no_ceil_camera_high && (this.grid_array[y][x] == 1))) {
      if (!dir)
        return true
//DEBUG_show(blk_v3.set(_x-x,0,_y-y).dot(dir))
      if (blk_v3.set(_x-x,0,_y-y).dot(dir) < 0)
        return true
    }
    else if (!is_camera && (this.get_ground_y({x:(x*grid_size), y:0, z:(y*grid_size)}, -999) > pos.y+10)) {
//DEBUG_show(pos.y)
      return true// { limited:{y:-1} }
    }
  }
}
    };
  })()

// GOML_dungeon_blocks START
d.GOML_dungeon_blocks = function () {
var grid_size = this.grid_size
var d_options = this.RDG_options

var geo_dim = {}
var tex_head = ""
var mtl_head = ""
var mesh_scene = ""

var tex_list = [];
var mtl_list = [];
var mesh_scene_list = [];
var geo_list = [];

var use_waveNoiseTexture

var txr_map_id = {}
var txr_normalMap_id = {}
var txr_specularMap_id = {}
var txr_displacementMap_id = {}

var terrain_height_map = {}

var p = this.grid_material_list
for (var i = 0, i_max = p.length; i < i_max; i++) {
  var p_obj = p[i]
  if (p_obj.disabled)
    continue

  if (p_obj.waveBaseSpeed!=null)
    use_waveNoiseTexture = true

//  var repeat = "1 1";//(p_obj.repeat || [1,1]).join(" ");//
  p_obj.map_id = p_obj.map && txr_map_id[p_obj.map]
  if (p_obj.map && (p_obj.map_id == null)) {
    p_obj.map_id = txr_map_id[p_obj.map] = i
//    tex_head +=
//  '<txr id="DungeonPlane'+i+'TXR" src="' + toFileProtocol(p_obj.map) + '" param="repeat:' + repeat + ';" />\n';

    tex_list.push({ tag:'txr', id:'DungeonPlane'+i+'TXR', src:p_obj.map, para:{ repeat:[1,1] } });
  }
  p_obj.normalMap_id = p_obj.normalMap && txr_normalMap_id[p_obj.normalMap];
  if (p_obj.normalMap && (txr_normalMap_id[p_obj.normalMap] == null)) {
    p_obj.normalMap_id = txr_normalMap_id[p_obj.normalMap] = i
//    tex_head +=
//  '<txr id="DungeonPlane'+i+'TXR_N" src="' + toFileProtocol(p_obj.normalMap) + '" param="repeat:' + repeat + ';" />\n';

    tex_list.push({ tag:'txr', id:'DungeonPlane'+i+'TXR_N', src:p_obj.normalMap, para:{ repeat:[1,1] } });
  }
  p_obj.specularMap_id = p_obj.specularMap && txr_specularMap_id[p_obj.specularMap];
  if (p_obj.specularMap && (txr_specularMap_id[p_obj.specularMap] == null)) {
    p_obj.specularMap_id = txr_specularMap_id[p_obj.specularMap] = i
//    tex_head +=
//  '<txr id="DungeonPlane'+i+'TXR_S" src="' + toFileProtocol(p_obj.specularMap) + '" param="repeat:' + repeat + ';" />\n';

    tex_list.push({ tag:'txr', id:'DungeonPlane'+i+'TXR_S', src:p_obj.specularMap, para:{ repeat:[1,1] } });
  }

  if ((p_obj.mirrorTextureIndex!=null) && (!MMD_SA_options.mirror_obj || !MMD_SA_options.mirror_obj[p_obj.mirrorTextureIndex])) {
    console.log("(Mirror-" + p_obj.mirrorTextureIndex + " not found)")
    p_obj.mirrorTextureIndex = null
  }
/*
  var mtl_param_common = ((p_obj.opacity == null)?'transparent:false;':'') + ((p_obj.renderDepth != null)?'renderDepth:'+p_obj.renderDepth+';':'') + ((p_obj.side)?'side:'+p_obj.side+';':'')
+ ((p_obj.map)?'map:#DungeonPlane'+p_obj.map_id+'TXR;':'') + ((p_obj.normalMap)?'normalMap:#DungeonPlane'+p_obj.normalMap_id+'TXR_N;':'') + ((p_obj.ambient)?'ambient:'+p_obj.ambient+';':'')
+ ((p_obj.specularMap)?'specularMap:#DungeonPlane'+p_obj.specularMap_id+'TXR_S;specular:#FFFFFF;':((p_obj.specular)?'specular:'+p_obj.specular+';':'')) + ((p_obj.emissive)?'emissive:'+p_obj.emissive+';':'')
+ ((p_obj.mirrorTextureIndex!=null)?'mirrorTextureIndex:'+(p_obj.mirrorTextureIndex)+';':'') + ((p_obj.waveBaseSpeed!=null)?'waveBaseSpeed:'+(p_obj.waveBaseSpeed)+';':'')
+ ((typeof p_obj.uniTexture=='object')?'uniTexture:{'+encodeURIComponent(JSON.stringify(p_obj.uniTexture).replace(/^\{/,'').replace(/\}$/,''))+'};':'');
*/
  var mtl_param_common = {};
  if (p_obj.opacity == null) mtl_param_common.transparent = false;
//'renderOrder' : 'renderDepth'
  if (p_obj.renderDepth != null) mtl_param_common.renderDepth = p_obj.renderDepth;
  if (p_obj.side) mtl_param_common.side = p_obj.side;
  if (p_obj.map) mtl_param_common.map = 'DungeonPlane'+p_obj.map_id+'TXR';
  if (p_obj.normalMap) mtl_param_common.normalMap = 'DungeonPlane'+p_obj.normalMap_id+'TXR_N';
//'color' : 'ambient'
  if (p_obj.ambient) mtl_param_common.ambient = p_obj.ambient;
  if (p_obj.specularMap) {
    mtl_param_common.specularMap = 'DungeonPlane'+p_obj.specularMap_id+'TXR_S';
    mtl_param_common.specular = '#FFFFFF';
  }
  else {
    if (p_obj.specular) mtl_param_common.specular = p_obj.specular;
  }
  if (p_obj.emissive) mtl_param_common.emissive = p_obj.emissive;

  var mtl_param_common_extra = {};
  if (p_obj.mirrorTextureIndex!=null) mtl_param_common_extra.mirrorTextureIndex = p_obj.mirrorTextureIndex;
  if (p_obj.waveBaseSpeed!=null) mtl_param_common_extra.waveBaseSpeed = p_obj.waveBaseSpeed;
  if (typeof p_obj.uniTexture=='object') mtl_param_common_extra.uniTexture = p_obj.uniTexture;

  if (p_obj.displacementMap || p_obj.random_terrain) {
    var d_map_id, d_map_draw
    if (p_obj.random_terrain) {
      d_map_id = p_obj.random_terrain.id
      var t_map = terrain_height_map[d_map_id]
      if (!t_map) {
var w = p_obj.random_terrain.width
var h = p_obj.random_terrain.height
var terrain = generateTerrain(w-1, h-1, p_obj.random_terrain.smoothness||1)
//console.log(terrain)
var z_min = 1
var z_max = -1
terrain.forEach(function (x) {
  x.forEach(function (z) {
    z_min = Math.min(z, z_min)
    z_max = Math.max(z, z_max)
  });
});
var z_scale = z_max - z_min
//console.log(z_min+'/'+z_max + '/' + z_scale)
var canvas = document.createElement("canvas")
canvas.width  = w
canvas.height = h
var ctx = canvas.getContext("2d")
var image_data = ctx.getImageData(0,0,w,h)//ctx.createImageData(w,h)
var data = image_data.data
for (var y = 0; y < h; y++) {
  for (var x = 0; x < w; x++) {
    var index = (y*w + x) * 4
    data[index+0] = data[index+1] = data[index+2] = ~~((terrain[y][x] - z_min) / z_scale * 255)//random(256)//
    data[index+3] = 255
  }
}
//console.log(image_data)
ctx.putImageData(image_data, 0,0)
//console.log(ctx.getImageData(0,0,w,h))

var canvas_d = canvas
/*
canvas_d = document.createElement("canvas")
canvas_d.width  = w*2
canvas_d.height = h*2
var ctx_d = canvas_d.getContext("2d")

ctx_d.drawImage(canvas, 0,0)

ctx_d.save();
ctx_d.scale(-1, 1);
ctx_d.drawImage(canvas, -w*2,0);
ctx_d.scale( 1, -1);
ctx_d.drawImage(canvas, -w*2,-h*2);
ctx_d.scale(-1, 1);
ctx_d.drawImage(canvas,    0,-h*2);
ctx_d.restore();

image_data = ctx_d.getImageData(0,0,canvas_d.width,canvas_d.height);
*/
t_map = terrain_height_map[d_map_id] = {
  image_data: image_data
}

d_map_draw = true
p_obj.displacementMap = canvas_d.toDataURL()
      }
      else {
// dummy
        p_obj.displacementMap = d_map_id
      }

      p_obj.random_terrain.image_data = t_map.image_data

      p_obj.uDisplacementCustomUVScale = 1 / (p_obj.random_terrain.divider||1)
      p_obj.uDisplacementBias =  p_obj.random_terrain.height_bias  || -32
      p_obj.uDisplacementScale = p_obj.random_terrain.height_scale || 64
    }
    else {
      d_map_id = txr_displacementMap_id[p_obj.displacementMap]
      if (!d_map_id) {
        d_map_id = txr_displacementMap_id[p_obj.displacementMap] = i
        d_map_draw = true
      }
    }

    p_obj.displacementMap_id = d_map_id
    if (d_map_draw) {
//      tex_head +=
//  '<txr id="DungeonPlane'+d_map_id+'TXR_D" src="' + toFileProtocol(p_obj.displacementMap) + '" param="repeat:' + repeat + ';" />\n';
      tex_list.push({ tag:'txr', id:'DungeonPlane'+d_map_id+'TXR_D', src:p_obj.displacementMap, para:{ repeat:[1,1] } });
    }
//    mtl_head +=
//  '<mtl id="DungeonPlane'+i+'MTL_D" type="MeshPhong" param="'
// + mtl_param_common + ('displacementMap:#DungeonPlane'+d_map_id+'TXR_D;uDisplacementScale:'+(p_obj.uDisplacementScale||1)+';uDisplacementBias:'+(p_obj.uDisplacementBias||0)+';uDisplacementCustomUVScale:'+(p_obj.uDisplacementCustomUVScale||0)+';')+ '" />\n';
    const mtl_para = Object.assign({ displacementMap:'DungeonPlane'+d_map_id+'TXR_D', uDisplacementScale:p_obj.uDisplacementScale||1, uDisplacementBias:p_obj.uDisplacementBias||0 }, mtl_param_common);
    const mtl_para_extra = Object.assign({ uDisplacementCustomUVScale:p_obj.uDisplacementCustomUVScale||0 }, mtl_param_common_extra);
    mtl_list.push({ tag:'mtl', id:'DungeonPlane'+i+'MTL_D', type:'MeshPhong', para:mtl_para, para_extra:mtl_para_extra });
  }

//  mtl_head +=
//  '<mtl id="DungeonPlane'+i+'MTL" type="MeshPhong" param="' + mtl_param_common + '" />\n';
  mtl_list.push({ tag:'mtl', id:'DungeonPlane'+i+'MTL', type:'MeshPhong', para:mtl_param_common, para_extra:mtl_param_common_extra });

  for (var lvl = 0, lvl_max = p_obj.geo_by_lvl.length; lvl < lvl_max; lvl++) {
    var geo = p_obj.geo_by_lvl[lvl]
    var geo_id = geo[0]+"x"+geo[1]
    geo_dim[geo_id] = true
    var instanced_drawing = (p_obj.instanced_drawing_by_lvl && p_obj.instanced_drawing_by_lvl[lvl]) || 0;
//    mesh_scene +=
//  '<mesh id="DungeonPlane'+i+'MESH_LV'+lvl+'" geo="#DungeonGEO_'+geo_id+'" mtl="#DungeonPlane'+i+'MTL' + ((p_obj.displacementMap && (geo_id != "1x1"))?'_D':'') + '" '
//+ ((instanced_drawing)?'instanced_drawing="'+instanced_drawing+'" ':'') + 'style="scale:0;' + ((p_obj.opacity != null)?'opacity:'+p_obj.opacity+';':'') + '" />\n';
    mesh_scene_list.push({ tag:'mesh', id:'DungeonPlane'+i+'MESH_LV'+lvl, geo:'DungeonGEO_'+geo_id, mtl:'DungeonPlane'+i+'MTL' + ((p_obj.displacementMap && (geo_id != "1x1"))?'_D':''), instanced_drawing:instanced_drawing||null, style:{ scale:0, opacity:p_obj.opacity||null } });
    MMD_SA_options.mesh_obj.push( { id:'DungeonPlane'+i+'MESH_LV'+lvl } );
  }
}

if (use_waveNoiseTexture) {
//    tex_head +=
//  '<txr id="waveNoiseTexture" src="' + toFileProtocol(System.Gadget.path + "/images/watershader_cloud.png") + '" />\n';
    tex_list.push({ tag:'txr', id:'waveNoiseTexture', src:System.Gadget.path + "/images/watershader_cloud.png", para:{} });
}

for (var geo in geo_dim) {
  if (/^(\d+)x(\d+)$/.test(geo)) {
//    MMD_SA_options.GOML_head +=
//  '<geo id="DungeonGEO_' + (geo) + '" type="Plane" param="' + [1,1, parseInt(RegExp.$1),parseInt(RegExp.$2)].join(" ") + '" />\n';
    geo_list.push({ tag:'geo', id:'DungeonGEO_' + (geo), type:'Plane', para:[1,1, parseInt(RegExp.$1),parseInt(RegExp.$2)] });
  }
}

MMD_SA_options.GOML_head +=
  tex_head
+ mtl_head;

MMD_SA_options.GOML_scene +=
  ((MMD_SA_options.Dungeon_options.use_point_light==false) ? '' : '<light id="pointlight_main" type="Poi" style="lightIntensity: 1.0; lightDistance: ' + (0) + '; position: ' + ([0,0,0].join(" ")) + '; lightColor:#ffffff;" />\n')
+ mesh_scene;

MMD_SA_options.GOML_head_list = (MMD_SA_options.GOML_head_list||[]).concat(tex_list, geo_list, mtl_list);
MMD_SA_options.GOML_scene_list = (MMD_SA_options.GOML_scene_list||[]).concat(mesh_scene_list);

//console.log(MMD_SA_options.GOML_head)
//console.log(MMD_SA_options.GOML_scene)
  }


d.get_ground_y = (function () {
// http://strauss.pas.nu/js-bilinear-interpolation.html

    // compute vector index from matrix one
    function ivect(ix, iy, w) {
        // byte array, r,g,b,a
        return((ix + w * iy) * 4);
    }

    function bilinear(srcImg, destImg, scale) {
        // c.f.: wikipedia english article on bilinear interpolation
        // taking the unit square, the inner loop looks like this
        // note: there's a function call inside the double loop to this one
        // maybe a performance killer, optimize this whole code as you need
        function inner(f00, f10, f01, f11, x, y) {
            var un_x = 1.0 - x; var un_y = 1.0 - y;
            return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
        }
        var i, j;
        var iyv, iy0, iy1, ixv, ix0, ix1;
        var idxD, idxS00, idxS10, idxS01, idxS11;
        var dx, dy;
        var r, g, b, a;
        for (i = destImg.y; i < destImg.y+10; ++i) {
            iyv = i / scale;
            iy0 = Math.floor(iyv);
            // Math.ceil can go over bounds
            iy1 = ( Math.ceil(iyv) > (srcImg.height-1) ? (srcImg.height-1) : Math.ceil(iyv) );
            for (j = destImg.x; j < destImg.x+10; ++j) {
                ixv = j / scale;
                ix0 = Math.floor(ixv);
                // Math.ceil can go over bounds
                ix1 = ( Math.ceil(ixv) > (srcImg.width-1) ? (srcImg.width-1) : Math.ceil(ixv) );
                idxD = ivect(j-destImg.x, i-destImg.y, destImg.width);
                // matrix to vector indices
                idxS00 = ivect(ix0, iy0, srcImg.width);
                idxS10 = ivect(ix1, iy0, srcImg.width);
                idxS01 = ivect(ix0, iy1, srcImg.width);
                idxS11 = ivect(ix1, iy1, srcImg.width);
                // overall coordinates to unit square
                dx = ixv - ix0; dy = iyv - iy0;
                // I let the r, g, b, a on purpose for debugging
                r = inner(srcImg.data[idxS00], srcImg.data[idxS10],
                    srcImg.data[idxS01], srcImg.data[idxS11], dx, dy);
                destImg.data[idxD] = r;
/*
                g = inner(srcImg.data[idxS00+1], srcImg.data[idxS10+1],
                    srcImg.data[idxS01+1], srcImg.data[idxS11+1], dx, dy);
                destImg.data[idxD+1] = g;

                b = inner(srcImg.data[idxS00+2], srcImg.data[idxS10+2],
                    srcImg.data[idxS01+2], srcImg.data[idxS11+2], dx, dy);
                destImg.data[idxD+2] = b;

                a = inner(srcImg.data[idxS00+3], srcImg.data[idxS10+3],
                    srcImg.data[idxS01+3], srcImg.data[idxS11+3], dx, dy);
                destImg.data[idxD+3] = a;
*/
            }
        }
    }

    var dummy_destImg = { width:10, height:10, data:[] }

    return function (pos, fixed_value_for_random_terrain) {
var x = ~~(pos.x/this.grid_size)
var y = ~~(pos.z/this.grid_size)
var grid_para = this.get_para(x,y, true)

var ground_y = grid_para.ground_y || 0

var material_id = grid_para.floor_material_index
if (material_id == null)
  material_id = this.floor_material_index_default
if (material_id == -1)
  return ground_y

var p_obj = this.grid_material_list[material_id]
if (!p_obj.random_terrain)
  return ground_y

if (fixed_value_for_random_terrain != null)
  return fixed_value_for_random_terrain

var image_data = p_obj.random_terrain.image_data
var xx =                   (((x % p_obj.random_terrain.divider) + ((pos.x - x*this.grid_size)/this.grid_size))*p_obj.uDisplacementCustomUVScale * image_data.width)//    - 0.5
// y inverted
var yy_offset = p_obj.random_terrain.divider-(y % p_obj.random_terrain.divider)
// clumsy, but it works lol
if (yy_offset == p_obj.random_terrain.divider)
  yy_offset = 0
var yy = image_data.height-((yy_offset + (1-(pos.z - y*this.grid_size)/this.grid_size))*p_obj.uDisplacementCustomUVScale * image_data.height)// - 0.5
/*
if (yy < 0) {
DEBUG_show(y + "/" + (pos.z/this.grid_size) + "/" + (yy/image_data.height) + " - " + Date.now());
yy+=image_data.height;
//yy = Math.abs(yy);
}
else {
DEBUG_show(y + "/" + (pos.z/this.grid_size) + "/" + (yy/image_data.height) + " - " + Date.now());
}
*/
dummy_destImg.x = (~~xx)*10
dummy_destImg.y = (~~yy)*10
bilinear(image_data, dummy_destImg, 10)
var height = dummy_destImg.data[(~~((yy%1)*10)*10+(~~((xx%1)*10)))*4]
//DEBUG_show([x,y]+'\n'+[xx+0.5,yy+0.5]+'\n'+[(pos.x - x * this.grid_size) / this.grid_size,(pos.z - y * this.grid_size) / this.grid_size]+'\n'+[height_by_x, height_by_y])
ground_y += p_obj.uDisplacementBias + (height/255) * p_obj.uDisplacementScale

return ground_y
    };
  })()

d.get_para = (function () {
var dummy = {}
return function (x,y, full) {
  var ro = this.RDG_options
  if (x<0 || x>=ro.width || y<0 || y>= ro.height)
    return dummy

  var grid_id = this.grid_array[y][x]
  if (full) {
    return Object.assign({}, (this.para_by_map && this.para_by_map(x,y))||dummy, this.para_by_grid_id[grid_id]||dummy, this.para_by_xy[x+"x"+y]||dummy)
  }

  return this.para_by_xy[x+"x"+y] || this.para_by_grid_id[grid_id] || (this.para_by_map && this.para_by_map(x,y)) || dummy
};
  })()


d.update_dungeon_blocks = (function () {
var that
var grid_size, c
var view_radius, radius_sq, d_options, w, h, d

// directions are "inverted" on the default camera view (i.e. looking at the character's back)
var TRBL = [
  { id:"T", id_opposite:"B", xy:[ 0,-1], rotY: Math.PI*1, posXZ:[0.5,0], curved_out:[[ 1,-1],[-1,-1]], curved_in:[1,3] }
 ,{ id:"R", id_opposite:"L", xy:[ 1, 0], rotY: Math.PI/2, posXZ:[1,0.5], curved_out:[[ 1, 1],[ 1,-1]], curved_in:[2,0] }
 ,{ id:"B", id_opposite:"T", xy:[ 0, 1], rotY: Math.PI*0, posXZ:[0.5,1], curved_out:[[-1, 1],[ 1, 1]], curved_in:[3,1] }
 ,{ id:"L", id_opposite:"R", xy:[-1, 0], rotY:-Math.PI/2, posXZ:[0,0.5], curved_out:[[-1,-1],[-1, 1]], curved_in:[0,2] }
];

TRBL.forEach(function (dir) {
  dir.rotY_q = [0,Math.sin(dir.rotY/2),0,Math.cos(dir.rotY/2)]
});

var flat_rotX_q = [Math.sin((-Math.PI/2)/2),0,0,Math.cos((-Math.PI/2)/2)]

var no_wall

function is_visible_wall(x, y) {
  if (d[y][x] == 1) {
    return true
  }

  if (1||no_wall) return false

  var is_hidden_door = false
  if (d[y][x] == 0) {
    is_hidden_door = TRBL.some(function (dir) {
      var _x = x + dir.xy[0]
      var _y = y + dir.xy[1]
      if ((_y < 0) || (_y >= h) || (_x < 0) || (_x >= w))
        return false

      var room_id = d[_y][_x]
      if (room_id > 1) {
        return true
      }
      return false
    });
  }

  return is_hidden_door
}

var v3a
window.addEventListener("MMDStarted", function () {
  v3a = new THREE.Vector3()
});

//var released_count = 0
var grid_cache = {
  xy: {}

 ,release: function (xy, visibility_kept) {
    if (!this.xy[xy])
      return

    this.xy[xy].forEach(function (cache) {
      if (!visibility_kept)
        cache.list[cache.index].visible = false
      cache.obj[(cache.list==cache.obj.list)?"reusable_list":"reusable_list_material_cloned"].push(cache.index)
//released_count++
    });

    delete this.xy[xy]
//DEBUG_show(MMD_SA.scene.children.length+'\n'+released_count+'\n'+Date.now())
  }

 ,release_outdated: function () {
    MMD_SA_options.Dungeon.grid_material_list.forEach(function (p_obj) {
      if (p_obj.disabled || (p_obj.lvl.length == 1))
        return

      p_obj.lvl.forEach(function (obj) {
        obj.reusable_list.forEach(function (index) {
          obj.list[index].visible = false
        });
        obj.reusable_list_material_cloned.forEach(function (index) {
          obj.list_material_cloned[index].visible = false
        });
      });
    });

    var timestamp
    for (var xy in this.xy) {
      timestamp = this.xy[xy][0].RAF_timestamp
      if (timestamp != RAF_timestamp)
        this.release(xy, (timestamp == -1))
    }
  }

 ,add: function (xy, obj, list, index) {
    var cache = this.xy[xy] = this.xy[xy] || [];

    cache.push({ obj:obj, list:list, index:index });

    if ((obj.lvl_max > 1) || (cache[0].RAF_timestamp == -1)) {
// invalidate this grid cache, and make the cached objects reusable after .release_outdated at the end
      cache[0].RAF_timestamp = -1
    }
    else
      this.update_timestamp(xy)
  }

 ,update_timestamp: function (xy) {
    this.xy[xy][0].RAF_timestamp = RAF_timestamp
  }
};
window.addEventListener("SA_Dungeon_after_map_generation", function () {
  grid_cache.xy = {}
});

return function (forced) {
  that = this

  c = this.character

  grid_size = this.grid_size
  view_radius = this.view_radius
  radius_sq = view_radius * view_radius

  var xx = ~~(c.pos.x/grid_size)
  var yy = ~~(c.pos.z/grid_size)

  var compass = Cdungeon_map_compass_canvas.getContext("2d")
//  compass.globalAlpha = 0.5
  compass.globalCompositeOperation = "copy";
  compass.fillStyle = "rgba(255,255,255, 0.4)";

  compass.translate(16,16)
  compass.rotate(-c.rot.y + ((!c.about_turn)?Math.PI:0))
  compass.translate(-16,-16)

  compass.beginPath()
  compass.moveTo(16,0)
  compass.lineTo(10,32-8)
  compass.lineTo(32-10,32-8)
  compass.closePath()
  compass.fill()

  compass.setTransform(1, 0, 0, 1, 0, 0);

  var map_display_scale = this.map_display_scale
  if (MMD_SA_options.Dungeon_options.multiplayer) {
    let length = view_radius * grid_size
    let lengthSq = length * length
    for (var i = 1, i_max = MMD_SA_options.Dungeon_options.multiplayer.OPC_list.length; i <= i_max; i++) {
      let ds = document.getElementById("Ldungeon_map_spot_OPC" + i).style
      let OPC_index = i-1 + MMD_SA_options.Dungeon_options.multiplayer.OPC_index0
      let OPC_mesh = THREE.MMD.getModels()[OPC_index].mesh
      if (OPC_mesh.visible) {
        ds.posLeft = 8+ ~~(OPC_mesh.position.x/grid_size)*map_display_scale + ~~(map_display_scale/4)
        ds.posTop  = 8+ ~~(OPC_mesh.position.z/grid_size)*map_display_scale + ~~(map_display_scale/4)
        ds.visibility = "inherit"
      }
      else
        ds.visibility = "hidden"

      let id = this.object_id_translated["OPC-"+(i-1)]
      if (!/^object(\d+)_(\d+)$/.test(id))
        continue
      let obj_base_index = parseInt(RegExp.$1)
      let obj_base = this.object_base_list[obj_base_index]
      let obj = obj_base.object_list[parseInt(RegExp.$2)]

      if (obj._obj_proxy.hidden)
        continue
      let cache = obj._obj
      let d_sq = cache.position.distanceToSquared(c.pos)
      obj._obj_proxy.visible = (d_sq < (lengthSq * obj.view_distance_sq))
    }
  }

  var _xx = c.xy[0]
  var _yy = c.xy[1]
  if (!forced && (_xx == xx) && (_yy == yy)) return
  c.xy = [xx, yy]

  window.dispatchEvent(new CustomEvent("SA_Dungeon_update_dungeon_blocks"));

  var grid_para_last = this.get_para(_xx, _yy, true)
  var grid_para_now  = this.get_para( xx,  yy, true)

  d = this.grid_array
  var c_grid_id = d[yy][xx]
  var grid_id_changed = (_xx == -1) || (d[_yy][_xx] != c_grid_id)
//  var grid_para_changed = grid_id_changed || (grid_para_last.id != grid_para_now.id)

  if (grid_para_last.onexit && grid_para_last.onexit({x:_xx, y:_yy, grid_id_changed:grid_id_changed})) return
  if (grid_para_now.onenter && grid_para_now.onenter({x:xx,  y:yy,  grid_id_changed:grid_id_changed})) return

  d_options = this.RDG_options
  w = d_options.width
  h = d_options.height

  var p = this.grid_material_list
  var m = this.map_grid_drawn
  var context = Cdungeon_map_canvas.getContext("2d")

  Ldungeon_map_spot.style.posLeft = 8+ xx*map_display_scale + ~~(map_display_scale/4)
  Ldungeon_map_spot.style.posTop  = 8+ yy*map_display_scale + ~~(map_display_scale/4)

  Cdungeon_map_compass_canvas.style.posLeft = Ldungeon_map_spot.style.posLeft - 16 + (Ldungeon_map_spot.style.pixelWidth  - 1) * 0.5
  Cdungeon_map_compass_canvas.style.posTop  = Ldungeon_map_spot.style.posTop  - 16 + (Ldungeon_map_spot.style.pixelHeight - 1) * 0.5

  no_wall = this.para_by_grid_id[1] && this.para_by_grid_id[1].hidden_on_map
//DEBUG_show(c.xy+'/'+no_wall+'\n'+(this.get_para(xx,yy,true).map_grid_color||""))
  var mirror_active = {}

//var grid_cache_hit = 0
  for (var y = yy - view_radius, y_max = yy + view_radius; y < y_max; y++) {
    if ((y < -1) || (y >= h+1))
      continue

    for (var x = xx - view_radius, x_max = xx + view_radius; x < x_max; x++) {
      if ((x < -1) || (x >= w+1))
        continue
      var xy = x + "x" + y
      if ((x-xx)*(x-xx)+(y-yy)*(y-yy) > radius_sq) {
//p[material_id].lvl[lvl]
        grid_cache.release(xy)
        continue
      }

      var grid_id = ((y>=0) && (y<h) && (x>=0) && (x<w)) ? d[y][x] : 1
      if ((y>=0) && (y<h) && (x>=0) && (x<w) && !m[y][x]) {
        var is_hidden_door = ((grid_id == 0) && is_visible_wall(x,y))
        if (no_wall || (grid_id == c_grid_id) || ((grid_id == 0) && !is_hidden_door)) {
          var draw_grid = false
          if (!no_wall && (grid_id == 0) && (Math.abs(x-xx)+Math.abs(y-yy) > 1)) {
            draw_grid = TRBL.some(function (dir, idx) {
              var _x = x + dir.xy[0]
              var _y = y + dir.xy[1]
              if ((_y < 0) || (_y >= h) || (_x < 0) || (_x >= w) || (d[_y][_x] != c_grid_id) || (d[_y][_x] == 0))
                return false
              return true
            });
          }
          else
            draw_grid = true

          if (draw_grid) {
            m[y][x] = true
            if (!is_hidden_door) {
              context.fillStyle = this.get_para(x,y,true).map_grid_color || "green"
              context.fillRect(x*map_display_scale,y*map_display_scale, map_display_scale,map_display_scale)
            }
          }
        }
      }

      if (grid_cache.xy[xy]) {
//grid_cache_hit++
//DEBUG_show(xy,0,1)
        grid_cache.update_timestamp(xy)
        continue
      }

      var p_obj
      var obj_y_extended
      var ground_y = this.get_para(x,y,true).ground_y || 0
      var ground_y_visible = this.get_para(x,y,true).ground_y_visible || 0
      if ((y < 0) || (y >= h) || (x < 0) || (x >= w) || (is_visible_wall(x,y) && (x!=xx || y!=yy))) {
        var has_visible_plane
        var _TRBL = []
        var _TRBL_grid_para = []
        TRBL.forEach(function (dir, idx) {
          var _x = x + dir.xy[0]
          var _y = y + dir.xy[1]
          if ((_y < 0) || (_y >= h) || (_x < 0) || (_x >= w) || (d[_y][_x]==1))//is_visible_wall(_x,_y))//
            return

          var grid_para = _TRBL_grid_para[idx] = that.get_para(_x, _y)
          if (grid_para.no_wall && (grid_para.no_wall.all || grid_para.no_wall[dir.id_opposite])) {
            return
          }

          _TRBL[idx] = has_visible_plane = true
        });
        if (!has_visible_plane)
          continue

        var lvl_by_material_id = []
        var dis = Math.max(Math.abs(x-xx), Math.abs(y-yy))

        TRBL.forEach(function (dir, idx) {
          if (!_TRBL[idx])
            return
//if (idx > 1) return
          var _x, _y

          var grid_para = _TRBL_grid_para[idx]
          var material_id = grid_para.wall_material_index
          if (material_id == null)
            material_id = that.wall_material_index_default
          if (material_id == -1)
            return

          p_obj = p[material_id].init()

          var lvl = lvl_by_material_id[material_id]
//          if (lvl == null) lvl = grid_para.geo_lvl
          if (lvl == null) {
            lvl = p_obj.geo_by_lvl.length-1
            for (var i = 0, i_max = p_obj.distance_by_lvl.length; i < i_max; i++) {
              if (dis <= p_obj.distance_by_lvl[i])
                break
              lvl--
            }
            lvl_by_material_id[material_id] = lvl
          }
//DEBUG_show(material_id+'/'+lvl,0,1)
//curved_in, curved_out
var L_curved, R_curved, cout_xy
var geo_by_lvl = p_obj.geo_by_lvl[lvl]
if ((geo_by_lvl[0] > 1) || (geo_by_lvl[1] > 1)) {
  cout_xy = dir.curved_out[0]
  _x = x + cout_xy[0]
  _y = y + cout_xy[1]
  if ((_y < 0) || (_y >= h) || (_x < 0) || (_x >= w) || is_visible_wall(_x,_y)) {
    L_curved = -Math.PI/4
//if (xx==0&&yy==0) DEBUG_show("L-out-"+dir.id+":"+[x,y],0,1)
  }
  else if (_TRBL[dir.curved_in[0]]) {
    L_curved = Math.PI/4
//DEBUG_show("L-in-"+dir.id+":"+[x,y],0,1)
  }

  cout_xy = dir.curved_out[1]
  _x = x + cout_xy[0]
  _y = y + cout_xy[1]
  if ((_y < 0) || (_y >= h) || (_x < 0) || (_x >= w) || is_visible_wall(_x,_y)) {
    R_curved = Math.PI/4
//if (xx==0&&yy==0) DEBUG_show("R-out-"+dir.id+":"+[x,y],0,1)
  }
  else if (_TRBL[dir.curved_in[1]]) {
    R_curved = -Math.PI/4
//DEBUG_show("R-in-"+dir.id+":"+[x,y],0,1)
  }
}

          var obj = p_obj.lvl[lvl]
          var plane
          if ((L_curved || R_curved) && (p_obj.geo_by_lvl[lvl] != "1x1")) {
            plane = obj.get_obj(obj.list_material_cloned)
            grid_cache.add(xy, obj, obj.list_material_cloned, plane[1])
            plane = plane[0]
          }
          else {
            plane = obj.get_obj(obj.list)
            grid_cache.add(xy, obj, obj.list, plane[1])
            plane = plane[0]
          }

          plane.scale.set(grid_size,grid_size,grid_size)
          plane.position.set((x+dir.posXZ[0])*grid_size, grid_size*0.5, (y+dir.posXZ[1])*grid_size)
//          plane.rotation.set(0,dir.rotY,0)
          plane.quaternion.fromArray(dir.rotY_q)
          plane.material.edgeRotateDisplacementL = L_curved || 0
          plane.material.edgeRotateDisplacementR = R_curved || 0
          plane.material.edgeScaleDisplacementU  = (that.ceil_material_index_default != -1) ? 1 : 0
          plane.material.uDisplacementScale = (p_obj.uDisplacementScale||1)/grid_size
          plane.material.uDisplacementBias  = (p_obj.uDisplacementBias ||0)/grid_size
//var dis = c.pos.distanceTo(plane.position)
//plane.material.opacity = (dis > (view_radius-1)*grid_size) ? Math.max(((view_radius)*grid_size-dis)/grid_size,0): 1
          plane.visible = true

          if (!plane.matrixAutoUpdate) plane.updateMatrix()

          if (p_obj.mirrorTextureIndex != null)
            mirror_active[p_obj.mirrorTextureIndex] = true

          if (!obj_y_extended)
            obj_y_extended = {}
          obj_y_extended[idx] = { obj:p_obj.lvl[0], ground_y:ground_y_visible, ceil_height:that.ceil_height }
        });

        if ((this.ceil_material_index_default == -1) && (this.wall_material_index_default != -1)) {
          p_obj = p[this.wall_material_index_default].init()

          var obj = p_obj.lvl[0]
          var plane = obj.get_obj(obj.list)
          grid_cache.add(xy, obj, obj.list, plane[1])
          plane = plane[0]

          plane.scale.set(grid_size,grid_size,1)
          plane.position.set((x+0.5)*grid_size, grid_size, (y+0.5)*grid_size)
//          plane.rotation.set(-Math.PI/2,0,0)
          plane.quaternion.fromArray(flat_rotX_q)
          plane.visible = true

          if (!plane.matrixAutoUpdate) plane.updateMatrix()

          if (p_obj.mirrorTextureIndex != null)
            mirror_active[p_obj.mirrorTextureIndex] = true
        }
      }
      else {
        var grid_para = this.get_para(x, y)
        var material_id = grid_para.floor_material_index
        if (material_id == null)
          material_id = this.floor_material_index_default
        if (material_id == -1)
          continue

        let p_obj0 = p[material_id].init()

        var material_id_ground = -1
        if ((ground_y_visible != ground_y) && (p_obj0.opacity < 1)) {
          material_id_ground = grid_para.floor_material_index_ground
          if (material_id_ground == null)
            material_id_ground = this.floor_material_index_default
        }

        let p_obj1
        if (material_id_ground != -1) {
          p_obj1 = p[material_id_ground].init()
        }

        var p_obj_list = [p_obj0, p_obj1]

        var ground_y_list = [ground_y_visible, ground_y]
        p_obj_list.forEach(function (_p_obj, idx) {
p_obj = _p_obj
if (!p_obj)
  return
var _ground_y = ground_y_list[idx]

        var dis = Math.max(Math.abs(x-xx), Math.abs(y-yy))
        var lvl// = grid_para.geo_lvl
//        if (lvl == null) {
          lvl = p_obj.geo_by_lvl.length-1
          for (var i = 0, i_max = p_obj.distance_by_lvl.length; i < i_max; i++) {
            if (dis <= p_obj.distance_by_lvl[i])
              break
            lvl--
          }
//        }

        var obj = p_obj.lvl[lvl]
        var plane
        if (p_obj.random_terrain && (p_obj.uDisplacementCustomUVScale < 1) && (p_obj.geo_by_lvl[lvl] != "1x1")) {
          plane = obj.get_obj(obj.list_material_cloned)
          grid_cache.add(xy, obj, obj.list_material_cloned, plane[1])
          plane = plane[0]

          plane.material.uDisplacementCustomUVScale = p_obj.uDisplacementCustomUVScale
// y inverted
          plane.material.uDisplacementCustomUVOffset.set((x % p_obj.random_terrain.divider), p_obj.random_terrain.divider-(y % p_obj.random_terrain.divider)).multiplyScalar(p_obj.uDisplacementCustomUVScale)
        }
        else {
          plane = obj.get_obj(obj.list)
          grid_cache.add(xy, obj, obj.list, plane[1])
          plane = plane[0]
        }
        plane.scale.set(grid_size,grid_size,1)
        plane.position.set((x+0.5)*grid_size, _ground_y, (y+0.5)*grid_size)
//        plane.rotation.set(-Math.PI/2,0,0)
        plane.quaternion.fromArray(flat_rotX_q)
//        plane.material.uDisplacementScale = (p_obj.uDisplacementScale||1)/grid_size
//        plane.material.uDisplacementBias  = (p_obj.uDisplacementBias ||0)/grid_size
//        plane.material.waveBumpScale = (p_obj.waveBumpScale||5)/grid_size
        plane.visible = true

        if (!plane.matrixAutoUpdate) plane.updateMatrix()

        if (p_obj.mirrorTextureIndex != null)
          mirror_active[p_obj.mirrorTextureIndex] = true

// no need to check pitfall for material on ground_y_visible (e.g. water)
        if (!p_obj1 || (idx == 1))
          obj_y_extended = { 0:{ obj:p_obj.lvl[0], ground_y:_ground_y } }

        });
      }

      if (!obj_y_extended)// && ((this.ceil_material_index_default != -1) || (this.wall_material_index_default != -1)))
        continue

      TRBL.forEach(function (dir, idx) {
        var _x = x + dir.xy[0]
        var _y = y + dir.xy[1]
        if ((_y < 0) || (_y >= h) || (_x < 0) || (_x >= w) || is_visible_wall(_x,_y))
          return

        var _obj = obj_y_extended[idx] || obj_y_extended[0];
        if (!_obj) return

        var obj = _obj.obj
        var obj_ground_y = _obj.ground_y

        var _ground_y = that.get_para(_x,_y,true).ground_y || 0
        if (obj_ground_y > _ground_y) {
          var pitfall_y = obj_ground_y - _ground_y
          for (var i = 0, i_max = Math.ceil(pitfall_y/grid_size); i < i_max; i++) {
            var plane = obj.get_obj(obj.list)
            grid_cache.add(xy, obj, obj.list, plane[1])
            plane = plane[0]

            plane.scale.set(grid_size,grid_size,grid_size)
            plane.position.set((x+dir.posXZ[0])*grid_size, -grid_size*(i+0.5)+obj_ground_y, (y+dir.posXZ[1])*grid_size)
//          plane.rotation.set(0,dir.rotY,0)
            plane.quaternion.fromArray(dir.rotY_q)
            plane.visible = true

            if (!plane.matrixAutoUpdate) plane.updateMatrix()
          }
        }

        if (_obj.ceil_height && (_obj.ceil_height > grid_size) && (this.ceil_material_index_default != -1)) {
          for (var i = 1, i_max = Math.ceil(_obj.ceil_height/grid_size); i < i_max; i++) {
            var plane = obj.get_obj(obj.list)
            grid_cache.add(xy, obj, obj.list, plane[1])
            plane = plane[0]

            plane.scale.set(grid_size,grid_size,grid_size)
            plane.position.set((x+dir.posXZ[0])*grid_size, grid_size*(i+0.5), (y+dir.posXZ[1])*grid_size)
//          plane.rotation.set(0,dir.rotY,0)
            plane.quaternion.fromArray(dir.rotY_q)
            plane.visible = true

            if (!plane.matrixAutoUpdate) plane.updateMatrix()
          }
        }
      });
    }
  }
//DEBUG_show(grid_cache_hit+'/'+Date.now())

  grid_cache.release_outdated()
/*
var _msg_ = []
  MMD_SA_options.Dungeon.grid_material_list.forEach(function (p_obj, idx) {
if (!p_obj.lvl) return
    for (var lvl = 0, lvl_max = p_obj.geo_by_lvl.length; lvl < lvl_max; lvl++) {
      var obj = p_obj.lvl[lvl]
_msg_.push(idx+'/'+lvl+':'+(obj.reusable_list.length+obj.reusable_list_material_cloned.length)+'/'+(obj.list.length+obj.list_material_cloned.length))
    }
  });
DEBUG_show(_msg_.join('\n')+'\n'+Date.now())
*/
  MMD_SA._THREE_mirror.forEach(function (mirror, idx) {
    mirror.visible = MMD_SA_options.mesh_obj_by_id["Mirror" + idx + "MESH"]._obj.visible = !!mirror_active[idx]
//DEBUG_show(MMD_SA_options.mesh_obj_by_id["Mirror" + idx + "MESH"]._obj.scale.toArray()+'/'+Date.now())
//console.log("B:"+MMD_SA_options.mesh_obj_by_id["Mirror" + 0 + "MESH"].visible+'/'+MMD_SA_options.mesh_obj_by_id["Mirror" + 0 + "MESH"]._obj.visible)
//console.log(mirror)
//console.log(MMD_SA_options.mesh_obj_by_id["Mirror" + 0 + "MESH"]._obj)
  });

  var length = view_radius * grid_size
  var lengthSq = length * length
  var lengthFarSq = lengthSq * (3 * 3)
  this.object_list.forEach(function (obj) {
    if (obj.is_dummy)
      return
// faster than .hidden getter
    if (obj._obj_proxy._hidden)
      return
    var cache = obj._obj
    d_sq = cache.position.distanceToSquared(c.pos)
    var v = obj._obj_proxy.visible = (d_sq < (lengthSq * obj.view_distance_sq))
    if (obj._obj_LOD_far)
      obj._obj_LOD_far_proxy.visible = !v && (d_sq < lengthFarSq)
  });

  this.object_list_in_view = this.object_list.filter(function (obj) {
if (obj.is_dummy)
  return false

if (obj.no_collision)
  return false

return obj._obj.visible
  });
  this.object_list_in_view = this.object_list_in_view.concat(this.grid_blocks.objs);

};
  })()
// GOML_dungeon_blocks END
