// Extracted from dungeon.js — Skydome setup, CircularSpectrum follower
// Called from Dungeon.init() as this._initSkydome()

(function () {
var Dungeon = MMD_SA_options.Dungeon;

Dungeon._initSkydome = function () {
var options = MMD_SA_options.Dungeon_options;

const sd = this.skydome = options.skydome;
if (sd) {
  if (!sd.texture_path_list)
    sd.texture_path_list = [System.Gadget.path + "/images/_dungeon/tex/ryntaro_nukata/angel_staircase.jpg"]
  sd.texture_cache_list = []
// NOTE: There is little to no reason to use too many polygons for depth-enabled skybox, as fewer polygons sometimes actually look smoother
  if (!sd.width_segments)
    sd.width_segments  = 64*2;
  if (!sd.height_segments)
    sd.height_segments = 64*2;

  sd.texture_path_list.forEach(function (path, idx) {
    var img = new Image()
    sd.texture_cache_list.push(img)
    System._browser.load_file(path, img)
  });

  if (!sd.texture_setup) {
    sd.texture_setup = (function () {
// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
parseInt(result[1], 16),
parseInt(result[2], 16),
parseInt(result[3], 16)
    ] : [0,0,0];
}
      return function () {
const THREE = MMD_SA.THREEX.THREE;

var dome_tex = MMD_SA.THREEX.mesh_obj.get_three('DomeMESH').material.map;
if (MMD_SA.THREEX.enabled && MMD_SA.THREEX.use_sRGBEncoding) dome_tex.colorSpace = THREE.SRGBColorSpace;
dome_tex.needsUpdate = true

var img = MMD_SA_options.Dungeon_options.skydome.texture_cache_list[this.texture_index||0]
var canvas = dome_tex.image;
// Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. (r135)
// https://threejs.org/docs/index.html#api/en/textures/Texture
// https://discourse.threejs.org/t/gl-invalid-value-offset-overflows-texture-dimensions/35561
var cw = (is_mobile) ? 2048 : 4096;
var ch = 2048;
if ((canvas.width != cw) || (canvas.height != ch)) {
  canvas.width  = cw
  canvas.height = ch
}

var context = canvas.getContext("2d")
context.globalAlpha = 1
context.clearRect(0,0,cw,ch)
context.drawImage(img, 0,0,img.width,img.height, 0,0,cw,ch)

MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.visible = true

var fog = this.fog
if (!fog)
  return

context.globalAlpha = fog.opacity || 1
var fill_color = fog.color || (MMD_SA_options.Dungeon.fog && MMD_SA_options.Dungeon.fog.color) || "#000000"
context.fillStyle = fill_color
var h = Math.round(ch * (0.5 + (fog.height||0.025)))
context.fillRect(0,(ch-h), cw,h)

var h_gradient = Math.round(ch * 0.0125)
var gradient = context.createLinearGradient(0,(ch-h-h_gradient), 0,(ch-h));
gradient.addColorStop(0,"rgba(" + hexToRgb(fill_color).join(",") + ",0)");
gradient.addColorStop(1,fill_color);
context.fillStyle = gradient
context.fillRect(0,(ch-h-h_gradient), cw,h_gradient)
      };
    })();
  }

  MMD_SA_options.mesh_obj_preload_list.push({ id:"DomeMESH", create:function () {
const THREE = MMD_SA.THREEX.THREE;

return new THREE.Mesh(
  new THREE.SphereGeometry( 64*4, 64,64 ),
  new THREE.MeshBasicMaterial( { map:new THREE.Texture(document.createElement('canvas')), side:THREE.BackSide, fog:false } )
);
  } });

  MMD_SA_options.mesh_obj.push({ id:"DomeMESH", scale:1 });

  window.addEventListener("MMDStarted", function () { MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.renderDepth = 99999; })

  if (!options.PC_follower_list)
    options.PC_follower_list = []
  options.PC_follower_list.push({id:"#DomeMESH"});
/*
MMD_SA_options.GOML_scene += [
  '<obj id="TEST_LIGHT" style="position:0 0 0; scale:1;">'
 ,'<light id="MuzzleFlash0LIGHT" type="Poi" style="lightIntensity: 1.0; lightDistance: ' + (32) + '; position: ' + ([0,16,0].join(" ")) + '; lightColor:#ffffff;" />'
 ,'</obj>'
].join("\n");
MMD_SA_options.mesh_obj.push({ id:"TEST_LIGHT", scale:1 });
options.PC_follower_list.push({id:"#MuzzleFlash0LIGHT"});
*/
}

if (MMD_SA_options.use_CircularSpectrum) {
  if (!options.PC_follower_list)
    options.PC_follower_list = []
  options.PC_follower_list.push({id:"#CircularSpectrumMESH"});
}
};

})();
