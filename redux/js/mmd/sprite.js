// Sprite — extracted from MMD_SA.js
// Original: MMD_SA.Sprite IIFE

window.MMD_SA_createSprite = function () {
    var sprite_obj_list = []


MMD_SA_options.use_sprite=true;

(function () {

function thunder_onloop(animator) {
// .numberOfTiles_extended is a trick to delay the start of the next loop by freezing the last frame
  animator.numberOfTiles_extended = animator.numberOfTiles + 4 + random(12);
// animator.speed (undefined by default) is a trick to adjust the individual animator speed at any time (onloop)
  animator.speed = 0.5 + Math.random() * 1;

  const rot = (((Math.random() > 0.5) ? 0 : 180) + (Math.random()-0.5) * 60) * Math.PI/180;
  if (MMD_SA.THREEX.enabled) {
    animator.parent.sprite.material.rotation = rot;
  }
  else {
    animator.parent.sprite.rotation = rot;
  }
//console.log(animator.sprite.material.map.sourceFile)
}

var _hit_box_offset;
window.addEventListener("jThree_ready",() => {
  _hit_box_offset = new THREE.Vector3();
  const p = 'thunder_particle';
  MMD_SA_options._thunder_SFX_ = {
      onloop: thunder_onloop,
      sprite:[
//  {bone_ref:"頭", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"上半身2", sticky:true, name:p, depth:3},
  {bone_ref:"上半身", sticky:true, name:p, depth:3},
  {bone_ref:"下半身", sticky:true, name:p, depth:3},
  {bone_ref:"左腕", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"左ひじ", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"左手首", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"右腕", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"右ひじ", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"右手首", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"左足", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"左ひざ", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"左足首", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"右足", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"右ひざ", sticky:true, name:p, depth:3, scale:0.5},
  {bone_ref:"右足首", sticky:true, name:p, depth:3, scale:0.5},
      ],
  };

  MMD_SA_options.model_para_obj.SFX = [
//    MMD_SA_options._thunder_SFX_
  ];
});

if (webkit_electron_mode&& MMD_SA_options.Dungeon_options) {
  MMD_SA_options.Dungeon.motion["PC Power Up"] = {
//456
      path:'MMD.js\\motion\\motion_rpg_pack01.zip#\\misc\\this_is_power.vmd'
     ,para: { adjust_center_view_disabled:true, onended: function () { MMD_SA._no_fading=true; }
 ,onstart: function () {
// [AUDIO REMOVED]
  }
 ,onplaying: (function () {
    var power_SFX = {
      id: "this_is_power",
//      frame_range:[0,999],
      onloop: thunder_onloop,
      sprite:[
  {bone_ref:"頭", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"上半身2", sticky:true, name:"thunder_particle", depth:3},
  {bone_ref:"上半身", sticky:true, name:"thunder_particle", depth:3},
  {bone_ref:"下半身", sticky:true, name:"thunder_particle", depth:3},
  {bone_ref:"左腕", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"左ひじ", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"左手首", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"右腕", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"右ひじ", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"右手首", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"左足", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"左ひざ", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"左足首", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"右足", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"右ひざ", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
  {bone_ref:"右足首", sticky:true, name:"thunder_particle", depth:3, scale:0.5},
      ],

      VFX:[
  {name:"aura01", sticky:true, pos_target:{ mesh:"model" }},
//  {name:"aura_ring01", sticky:true, pos_target:{ mesh:"model", offset:{x:0,y:8,z:0} }},
      ],
    };

    var SFX_action = {
  onloop: function (animator) {
animator.parent.sprite.rotation = Math.random() * Math.PI*2
  },
  sprite: [{instance_per_frame:1, name:"explosion_sinestesia-01_03", depth:1}],
    };

    var this_is_power = {
  action: function () {
var model_para = MMD_SA_options.model_para_obj;
model_para._SFX_one_time = model_para._SFX_one_time||[];
model_para._SFX_one_time.push(power_SFX);

var d = MMD_SA_options.Dungeon
if (!d.character.combat_mode) return

var para_SA = MMD_SA.MMD.motionManager.para_SA
if (!para_SA.combat_para) return

var model = THREE.MMD.getModels()[0]
var f = model.skin.time*30

var SFX;
para_SA.combat_para.some((p) => {
  if (!p.frame_range || !p.SFX || !p.SFX.bone_to_pos || (para_SA.SFX && para_SA.SFX.some(sfx => ((f >= sfx.frame_range[0]) && (f <= sfx.frame_range[1])))) || (f > p.frame_range[1]))
    return

  SFX = SFX_action;

  var sprite = SFX.sprite[0]
  sprite.bone_ref = p.SFX.bone_to_pos
  var obj = d.character.combat_stats.weapon.obj
  if (obj && (para_SA.attack_combo_para.combo_type.indexOf(obj.user_data.weapon.type) != -1)) {
    sprite.pos_offset = _hit_box_offset.copy(obj.user_data.weapon.hit_box_offset)
    sprite.pos_offset_rotated = true
  }
  else {
    sprite.pos_offset = sprite.pos_offset_rotated = null
  }

  return true
});

if (SFX) {
  model_para._SFX_one_time.push(SFX);
}

var morph_name = "Bad Gura"
var _m_idx = model.pmx.morphs_index_by_name[morph_name]
if (_m_idx != null) {
  let _m = model.pmx.morphs[_m_idx]
  MMD_SA._custom_morph.push({ key:{ weight:1, morph_type:_m.type, morph_index:_m_idx, override_weight:true }, idx:model.morph.target_index_by_name[morph_name] });
}
  },
    };

    return function (model_index) {
var mm = MMD_SA.MMD.motionManager
var model = THREE.MMD.getModels()[model_index]
if (model.skin.time > 72/30) {
  MMD_SA_options.Dungeon.character.states.this_is_power = this_is_power;
}
    };
  })()

       ,model_index_list: [0]
//       ,mov_speed: [{ frame:0, speed:{x:0, y:0, z: 0.05*30} }]
       ,adjustment_per_model: {
  _default_ : {
    morph_default: {
    }
  }
        }
//       ,motion_command_disabled: true
       ,NPC_motion_command_disabled: true
       ,super_armor: { level:99 }
       ,combat_para: [
  { frame_range:[72,80], hit_level:3, damage:1, bb_expand:{x:0.5*100, y:0, z:0.5*100} }
        ]
       ,motion_duration: 153/30

       ,SFX: [
  {frame_range:[0,10], camera_shake:{magnitude:0.2, duration:72/30*1000, graph:{reversed:true,decay_power:0.5}}},
  {
    frame_range:[72,82],
    VFX:[
  {
    name:"aura_ring01", sticky:true, pos_target:{ mesh:"model", offset:{x:0,y:8,z:0} },
    custom: {duration:500},
  },
    ],
    camera_shake:{magnitude:0.5,duration:1000},
  },
        ]
      }
  };

  if (MMD_SA_options.Dungeon_options.combat_mode_enabled) {
    MMD_SA_options.Dungeon_options.attack_combo_list.push(
      { keyCode:10369, combo_RE:"POWER", motion_id:"PC Power Up", combo_type:"item" }
    );

    MMD_SA_options.Dungeon.item_base.power_up = {
      icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/misc_icon/superpower_64x64.png'
     ,info_short: "????"
     ,index_default: MMD_SA_options.Dungeon.inventory.max_base-3
     ,stock_max: 1
     ,action: {
  func: function () {
var d = MMD_SA_options.Dungeon
if (!d.character.combat_mode || d.character_combat_locked)
  return true
//DEBUG_show(Date.now())
var t = performance.now()
var key_map = d.key_map[10369]
key_map.down = t

var motion_index = MMD_SA_options.motion_index_by_name[d.motion["PC Power Up"].name]
MMD_SA_options.motion_shuffle_list_default = [motion_index]
MMD_SA._force_motion_shuffle = true

//var motion_para = MMD_SA.motion[motion_index].para_SA
//console.log(motion_para)
    },
    muted: true,
      }
    };

    // [AUDIO REMOVED]
  }
}

})();


// sprite animator START
    if (!MMD_SA_options.sprite_sheet)
      MMD_SA_options.sprite_sheet = []

    if (MMD_SA_options.Dungeon_options || MMD_SA_options.use_sprite) {
      MMD_SA_options.sprite_sheet.push(
  { name:"explosion_purple_01", url:System.Gadget.path+'/images/sprite_sheet.zip#/explosions/explosion_03_strip13_v01-min.png', col:6, row:2, frame_count:12 },
  { name:"blood_01", url:System.Gadget.path+'/images/sprite_sheet.zip#/blood/blood_hit_splash-min.png', col:4, row:4, frame_count:16, scale:20 },
  { name:"hit_yellow_01", url:System.Gadget.path+'/images/sprite_sheet.zip#/hit/hit_yellow_v00-min.png', col:4, row:4, frame_count:16, scale:20 },
  { name:"pointer_blue_01", url:System.Gadget.path+'/images/_dungeon/item_icon.zip#/misc_icon/arrow_down_blue_128x128.png', col:1, row:1, frame_count:1, scale:2 },

  { name:"explosion_red_01", url:System.Gadget.path+'/images/sprite_sheet.zip#/explosions/explosion_01_strip13_v01-min.png', col:6, row:2, frame_count:12 },
  { name:"explosion_sinestesia-01_03",  url:System.Gadget.path+'/images/sprite_sheet.zip#/explosions/explosion_sinestesia-01_03_v01-min.png', col:4, row:8, frame_count:32, scale:20, blending:"additive" },
  { name:"_explosion_sinestesia-01_03", url:System.Gadget.path+'/images/sprite_sheet.zip#/explosions/explosion_sinestesia-01_03_v01-min.png', col:4, row:8, frame_count:32, scale:20, blending:"subtractive",
texture_variant: {
  id: "BW",
  pixel_transform: function (pixels) {
    for (var i = 0, i_length = pixels.length; i < i_length; i += 4) {
//color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722
      let lightness = ~~(pixels[i]*0.2126 + pixels[i + 1]*0.7152 + pixels[i + 2]*0.0722);
      pixels[i] = lightness;
      pixels[i + 1] = lightness;
      pixels[i + 2] = lightness;
    }
  },
},
  },


  { name:"thunder_particle", url:System.Gadget.path+'/images/sprite_sheet.zip#/thunder/thunder_particle' + ((webkit_transparent_mode) ? '-transparent' : '') + '_v01-min.png', col:4, row:2, frame_count:8, scale:3, blending:(webkit_transparent_mode)?null:"additive" },

//  { name:"smoke_01", url:'C:\\Users\\user\\Downloads\\firespritesheet\\fireSheet5x5.png', col:5, row:5, frame_count:25, scale:5, blending:(webkit_transparent_mode)?null:"additive" },
      );
    }

    var sprite_sheet_by_name = {}
    var ss_texture_by_filename = {}

    MMD_SA_options.sprite_sheet.forEach(function (ss) {
ss.filename = ss.url.replace(/^.+[\/\\]/, "").replace(/\.png$/i, "")
if (!ss.name)
  ss.name = ss.filename
sprite_sheet_by_name[ss.name] = new SpriteSheet(ss)

ss_texture_by_filename[ss.filename] = {
  url: ss.url,
  variant: {},
};
    });

    if (!MMD_SA_options.GOML_head) MMD_SA_options.GOML_head = "";

    window.addEventListener('jThree_ready', ()=>{
for (let name in ss_texture_by_filename) {
  MMD_SA.THREEX.mesh_obj.set(name + '_TXR', MMD_SA.load_texture(ss_texture_by_filename[name].url), true);
}
    });

    function SpriteSheet(obj) {
Object.assign(this, obj)

if (!this.scale)
  this.scale = 10

if (!this.frame_interval)
  this.frame_interval = 1000/30
    }

// inspired by:
// https://stemkoski.github.io/Three.js/Texture-Animation.html

    function SpriteAnimator(obj) {
this.parent = obj
    }

    SpriteAnimator.prototype.reset = function (ss) {
const use_THREEX = MMD_SA.THREEX.enabled;

// NOTE: r58 sets uv offset/scale from the sprite material, not the texture.
var sprite = this.parent.sprite
var texture = sprite.material
if (use_THREEX) texture = texture.map;

var para = this.parent.para

this.sprite_sheet = ss

	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = ss.col;
	this.tilesVertical = ss.row;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = ss.frame_count;

this.numberOfTiles_extended = para.frame_count || ss.frame_count;

  if (use_THREEX) {
    texture.repeat.set( 1/this.tilesHorizontal, 1/this.tilesVertical );
    texture.offset.x = texture.offset.y = 0
//  texture.needsUpdate = true;
  }
  else {
    texture.uvScale.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );
    texture.uvOffset.x = texture.uvOffset.y = 0
  }

	// how long should each image be displayed?
	this.tileDisplayDuration = ss.frame_interval;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

sprite.rotation = 0

this.started = false
this.loop = !!para.loop

sprite.visible = true
    }

    SpriteAnimator.prototype.update = function( milliSec ) {
const use_THREEX = MMD_SA.THREEX.enabled;

//DEBUG_show(milliSec)
var sprite = this.parent.sprite
var texture = sprite.material
var offset
if (use_THREEX) {
  texture = texture.map
  offset = 'offset'
}
else {
  offset = 'uvOffset'
}

var para = this.parent.para

if (!this.started && para.onloop) {
  this.started = true
  para.onloop(this)
//console.log(sprite.material.map.sourceFile);DEBUG_show(Date.now());
}

		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles_extended) {
if (!this.loop) {
  sprite.visible = false
  break
}

				this.currentTile = 0;

if (para.onloop) {
  para.onloop(this)
//DEBUG_show(Date.now())
}
			}

var currentTile = Math.min(this.currentTile, this.numberOfTiles-1);

			var currentColumn = currentTile % this.tilesHorizontal;
//			texture.offset.x = currentColumn / this.tilesHorizontal;
texture[offset].x = currentColumn / this.tilesHorizontal;
//			var currentRow = Math.floor( currentTile / this.tilesHorizontal );
var currentRow = (this.tilesVertical-1) - Math.floor( currentTile / this.tilesHorizontal );
//			texture.offset.y = currentRow / this.tilesVertical;
//var currentRow = Math.ceil( currentTile / this.tilesHorizontal );
texture[offset].y = currentRow / this.tilesVertical;
		}
    };
// sprite animator END

    var TextureObject_HP_bar = function (index) {
this.id = "HP_bar" + index;
    };
    TextureObject_HP_bar.prototype.init = function () {
var canvas = this.canvas
canvas.width  = 32
canvas.height = 4
this._obj.drawBorder(this, "black")
//console.log(this)
    };
    TextureObject_HP_bar.prototype.drawBorder = function (that, color) {
var canvas = that.canvas
var context = canvas.getContext("2d")
context.fillStyle = color
context.fillRect(0,0, canvas.width,1)
context.fillRect(0,3, canvas.width,1)
context.fillRect(0,0, 1,canvas.height)
context.fillRect(canvas.width-1,0, 1,canvas.height)
    };
    TextureObject_HP_bar.prototype.update = function (para) {
if (!para)
  para = {}

var v = para.v
if (v == null)
  v = 1

var return_value = false
if (para.border_color_default != para.border_color) {
  para.border_color_default = para.border_color
  this._obj.drawBorder(this, para.border_color)
  return_value = true
}

var v_max = this.canvas.width - 2
v = Math.round(v * v_max)
if (this.value == v)
  return return_value
this.value == v

var canvas = this.canvas
var context = canvas.getContext("2d")
context.fillStyle = "#0F0"
context.fillRect(1,1, v,2)
if (v < v_max) {
  context.fillStyle = "#0A809B"
  context.fillRect(v+1,1, (v_max-v),2)
}

return true
    };

    var Texture_Object = (function () {
var texture_obj_list = []

function TextureObject(texture_obj) {
  const use_THREEX = MMD_SA.THREEX.enabled;
  const THREE = MMD_SA.THREEX.THREE;

  this._obj = texture_obj
  Object.assign(this, texture_obj)

  this.init = texture_obj.init
  this._update = texture_obj.update
  this.update = function (v) {
    var result = this._update(v)
    this.adjust_scale()
    return result
  }

  this.canvas = document.createElement("canvas")
  this.canvas.width = this.canvas.height = 1

  this.texture = new THREE.Texture(this.canvas)
//  if (use_THREEX) this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
  if (use_THREEX && MMD_SA.THREEX.use_sRGBEncoding) this.texture.colorSpace = THREE.SRGBColorSpace;
  this.texture.needsUpdate = true
}

TextureObject.prototype.adjust_scale = function () {
  var scale = this.obj_parent.para.scale || 1
  var aspect = Math.min(this.canvas.width, this.canvas.height)
  this.obj_parent.sprite.scale.set(scale*(this.canvas.width/aspect),scale*(this.canvas.height/aspect), 1);
};

return function (texture_obj) {
  var obj = texture_obj_list.find(function (_obj) {
    return (texture_obj.id == _obj.id);
  });
  if (obj) {
    obj.value = null
    return obj
  }

  var obj = new TextureObject(texture_obj)
  texture_obj_list.push(obj)
  console.log("sprite canvas count:" + texture_obj_list.length)
  return obj
};
    })();

    function create_sprite_obj(texture) {
const use_THREEX = MMD_SA.THREEX.enabled;
const THREE = MMD_SA.THREEX.THREE;

//  console.log(explosion_texture)
var material = new THREE.SpriteMaterial({ map:texture.clone() });// , useScreenCoordinates:true /*,alignment:THREE.SpriteAlignment.topLeft*/  } );
material.depthTest = false;//true;//
material.sizeAttenuation = true;
if (!use_THREEX) {
  material.useScreenCoordinates = false;
  material.scaleByViewport = false;
}

var sprite = new THREE.Sprite( material );
//console.log(sprite)
//console.log(MMD_SA.SpeechBubble._mesh)
//sprite.renderDepth = 999999
MMD_SA.THREEX.scene.add( sprite );

var obj_free = { sprite:sprite }
sprite_obj_list.push(obj_free)
console.log("sprite object count:" + sprite_obj_list.length)
return obj_free
    }

    window.addEventListener("SA_Dungeon_after_map_generation", function () {
sprite_obj_list.concat(VFX.obj_list).forEach(function (ss) {
  ss.sprite.visible = false
});
    });

// use SA_MMD_after_updateMotion event to make sure they are added LAST after all motion updates
    window.addEventListener("MMDStarted", () => {
      window.addEventListener("SA_MMD_after_updateMotion", ()=>{
THREE.MMD.getModels().forEach((model, idx) => {
  var mesh = model.mesh

// MMD mesh is wrapped by a "dummy" Object3D
// set to false to manually update MMD/model matrixWorld, BEFORE (and skipping) the default routine of MMD mesh matrixWorld update
  mesh.parent.matrixAutoUpdate = mesh.matrixAutoUpdate = false;

  if (!mesh.matrixAutoUpdate) {
// external PMX needs updates on parent
    mesh.parent.updateMatrix();
    mesh.parent.updateMatrixWorld();

    mesh.updateMatrix();
    mesh.updateMatrixWorld();

    MMD_SA.THREEX.get_model(idx).update_model();
  }
});
      });

      window.addEventListener("SA_MMD_after_updateMotion", (function () {
function get_bone_list(_SFX) {
  var bone_list = {}

  _SFX.forEach((SFX, idx) => {
    if (SFX.sprite||SFX.VFX) {
      (SFX.sprite||[]).concat(SFX.VFX||[]).forEach((sprite, s_idx) => {
        if (sprite.bone_ref) {
          if (!bone_list[sprite.bone_ref])
            bone_list[sprite.bone_ref] = {}
          bone_list[sprite.bone_ref].pos = true
          if (sprite.pos_offset_rotated)
            bone_list[sprite.bone_ref].rot = true
        }
      });
    }
  });

  return bone_list
}

var _data = {}

var TEMP_m4 = new THREE.Matrix4();

return function (e) {
  THREE.MMD.getModels().forEach((model) => {
var skin = model.skin
if (!skin) return

var model_para = MMD_SA_options.model_para_obj_all[model._model_index]
var para_SA = MMD_SA.motion[skin._motion_index].para_SA
var _SFX = para_SA.SFX || []
if (!_SFX.length && !model_para.SFX && !model_para._SFX_one_time) return

var mesh = model.mesh

var f = skin.time*30

var data = _data[mesh._model_index]
if (!data)
  data = _data[mesh._model_index] = { bone:{}, motion:{} }

var motion_data = data.motion[skin._motion_index]
if (!motion_data) {
  motion_data = data.motion[skin._motion_index] = { SFX:{}, bone_list:get_bone_list(_SFX) }
}

var bone_list = Object.assign({}, motion_data.bone_list)

if (model_para.SFX) {
  Object.assign(bone_list, get_bone_list(model_para.SFX))
  _SFX = _SFX.concat(model_para.SFX)
}

if (model_para._SFX_one_time) {
  Object.assign(bone_list, get_bone_list(model_para._SFX_one_time))
  _SFX = _SFX.concat(model_para._SFX_one_time)
}

var bone_data = {}
Object.keys(bone_list).forEach((bone_name) => {
  bone_data[bone_name] = {}
});

const modelX = MMD_SA.THREEX.get_model(mesh._model_index);
const mesh_m4 = modelX.mesh.matrixWorld;//TEMP_m4.makeRotationFromQuaternion(mesh.quaternion).setPosition(mesh.position);//
for (let bone_name in bone_list) {
  const b = bone_list[bone_name]
  if (b.pos) {
    bone_data[bone_name].pos = modelX.get_bone_position_by_MMD_name(bone_name, true) || modelX.get_bone_position_by_MMD_name('上半身', true);//MMD_SA.get_bone_position(mesh, bone_name, mesh);//
//    if (mesh._bone_to_position_last) bone_data[bone_name].pos.sub(mesh._bone_to_position_last.bone_pos_offset);
// ignore scale
    bone_data[bone_name].pos.applyQuaternion(modelX.mesh.quaternion).add(modelX.mesh.position);//applyMatrix4(mesh_m4)
  }
  if (b.rot)
    bone_data[bone_name].rot = modelX.get_bone_rotation_by_MMD_name(bone_name);//MMD_SA.get_bone_rotation(mesh, bone_name);//
}

_SFX.forEach((SFX, idx) => {
  if (SFX.frame_range) {
    if ((f < SFX.frame_range[0]) || (f > SFX.frame_range[1]))
      return
  }

  var SFX_id = SFX.id||idx
  var motion_SFX = motion_data.SFX[SFX_id]
  if (!motion_SFX)
    motion_SFX = motion_data.SFX[SFX_id] = { sprite:[] }

  if (SFX.camera_shake && (motion_SFX._loop_timestamp != skin._loop_timestamp)) {
    MMD_SA.CameraShake.shake(SFX.camera_shake.id, SFX.camera_shake.magnitude, SFX.camera_shake.duration, SFX.camera_shake.graph);
  }

  if (SFX.sprite||SFX.VFX) {
    (SFX.sprite||[]).concat(SFX.VFX||[]).forEach((sprite, s_idx) => {
//      var is_sprite = SFX.sprite && (s_idx < SFX.sprite.length);

      var md = motion_SFX.sprite[s_idx]
      if (!md)
        md = motion_SFX.sprite[s_idx] = {_f:f, _loop_timestamp:null}

      var para = {
  name:sprite.name,
  speed:sprite.speed||1,
  scale:sprite.scale||1,
  loop: sprite.sticky && (sprite.loop !== false),

  depth:sprite.depth,

  pos_target:sprite.pos_target,

  onloop: sprite.onloop || SFX.onloop,
// not considering looping as motion end (i.e. _loop_timestamp==skin._loop_timestamp), for now at least
  onmotionended: (sprite.sticky) ? { model_index:model._model_index, motion_index:skin._motion_index, _loop_timestamp:/*md._loop_timestamp||*/skin._loop_timestamp } : null,

  custom: sprite.custom,
      };

      var sprite_list = []
      if (sprite.instance_per_frame) {
        let f_ini = md._f
        let f_delta = f - f_ini
        if (md._loop_timestamp != skin._loop_timestamp) {
          f_ini = f
          f_delta = 0
        }
        else if (SFX.frame_range && (md._f < SFX.frame_range[0])) {
          f_ini = SFX.frame_range[0]
        }

        let f_step = 1/sprite.instance_per_frame
        for (let i = 1; f_ini + (i+0.2)*f_step < f; i++) {
          let para_clone = Object.assign({}, para)
          para_clone.lerp = 1 - (f - f_ini+i*f_step) / f_delta
          sprite_list.push(para_clone)
//DEBUG_show(i,0,1)
        }
        sprite_list.push(para)
      }
      else {
        if (md._loop_timestamp == skin._loop_timestamp) {
          if (!sprite.sticky)
            return
        }

        sprite_list.push(para)
      }

      sprite_list.forEach((para, instance) => {
        if (sprite.sticky)
          para.id = [mesh._model_index, skin._motion_index, SFX_id, s_idx, instance].join("_")//, skin._loop_timestamp].join("_")

        if (sprite.bone_ref) {
          let b = bone_data[sprite.bone_ref]
          para.pos = (para.lerp) ? b.pos.clone().lerp(data.bone[sprite.bone_ref].pos, para.lerp) : b.pos

          if (sprite.pos_offset)
            para.pos.add((sprite.pos_offset_rotated) ? sprite.pos_offset.clone().applyQuaternion((para.lerp) ? b.rot.clone().slerp(data.bone[sprite.bone_ref].rot, para.lerp) : b.rot) : sprite.pos_offset)
        }
        else {
          para.pos = sprite.pos||new THREE.Vector3()
        }

        if (para.pos_target) {
          if (para.pos_target.mesh == "model")
            para.pos_target.mesh = mesh
        }

        MMD_SA.Sprite.animate(para.name, para)
      });

      md._f = f
      md._loop_timestamp = skin._loop_timestamp
    });
  }

  motion_SFX._loop_timestamp = skin._loop_timestamp;
});

Object.assign(data.bone, bone_data);

model_para._SFX_one_time = null;
  });
};
      })());

      window.addEventListener("SA_MMD_after_updateMotion", function () {
if (MMD_SA_options.Dungeon) {
  sprite_obj_list.forEach(function (ss) {
    if (ss.para.id && /^pointer_/.test(ss.para.id))
      ss.sprite.visible = false
  });

  let list = MMD_SA_options.Dungeon.check_mouse_on_object()
  if (list) {
    list.forEach(obj_clickable => {
      var obj = obj_clickable.obj
      var id = "pointer_" + obj.id
      MMD_SA.Sprite.animate("pointer_blue_01", {
        id: id,
        loop: 1,
        pos: obj_clickable.pos,
      });
    });
  }
}

/*
MMD_SA_options.Dungeon.sprite.animate("pointer_blue_01", {
  id: "PC",
  loop: 1,
  pos_target: {
    mesh: THREE.MMD.getModels()[0].mesh,
    offset: {x:0, y:20, z:0},
  },
});
*/

sprite_obj_list.concat(VFX.obj_list).forEach(function (ss, idx) {
  var sprite = ss.sprite
  if (!sprite.visible)
    return

  var para = ss.para

  if (para.onmotionended) {
    let skin = THREE.MMD.getModels()[para.onmotionended.model_index].skin
    if ((skin._motion_index != para.onmotionended.motion_index) || (skin._loop_timestamp != para.onmotionended._loop_timestamp)) {
//if (idx >= sprite_obj_list.length) DEBUG_show([RAF_timestamp].join(','))
      sprite.visible = false
      return
    }
  }

  var pos_target = para.pos_target
  if (pos_target) {
    if (pos_target.mesh) {
      if (!pos_target.mesh.visible) {
        sprite.visible = false
        return
      }
      sprite.position.copy(pos_target.mesh.position)
      if (pos_target.offset)
        sprite.position.add(pos_target.offset)
//if (idx >= sprite_obj_list.length) sprite.quaternion.copy(pos_target.mesh.quaternion)
//DEBUG_show(VFX.obj_list.map((o)=>o.sprite.visible).join(',')+'/'+RAF_timestamp)
    }
    para._pos.copy(sprite.position)
  }

  if (para.depth > 0) {
    sprite.position.copy(para._pos).add(MMD_SA.TEMP_v3.copy(MMD_SA._trackball_camera.object.position).sub(para._pos).normalize().multiplyScalar(para.depth))
  }

  if (ss.animator) {
    ss.animator.update(RAF_timestamp_delta)
  }
  else {
    if (ss.texture_obj.update(para.get_value && para.get_value()))
      sprite.material.map.needsUpdate = true
  }
});
      });
    });


// VFX — loaded from js/mmd/vfx.js
  var VFX = MMD_SA_createVFX();
// VFX END


    return {
  animate: function (name, para) {
var ss = sprite_sheet_by_name[name]
if (!ss) {
  VFX.animate(name, para)
  return
}

const THREE = MMD_SA.THREEX.THREE;

var texture = MMD_SA.THREEX.mesh_obj.get_three(ss.filename + "_TXR");
if (ss.texture_variant) {
  let variant = ss_texture_by_filename[ss.filename].variant
  if (variant[ss.texture_variant.id]) {
    texture = variant[ss.texture_variant.id]
  }
  else {
    let tex = texture.clone()

    let canvas = document.createElement("canvas")
    canvas.width  = tex.image.width
    canvas.height = tex.image.height
    let ctx = canvas.getContext("2d")
    ctx.drawImage(tex.image,0,0)
    let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    let pixels = imgData.data;
    ss.texture_variant.pixel_transform(pixels)
    ctx.putImageData(imgData, 0, 0);

    tex.image = canvas
    tex.needsUpdate = true
    texture = variant[ss.texture_variant.id] = tex
//console.log(texture, tex)
  }
/*
texture_variant: {
  id: "BW",
  pixel_transform: function (pixels) {
*/
}

var obj_free = (para.id && sprite_obj_list.find(obj => (obj.para.id == para.id))) || sprite_obj_list.find(obj => !obj.sprite.visible);

var obj_needs_reset
if (!obj_free) {
  obj_free = create_sprite_obj(texture)
  obj_needs_reset = true
}
else {
  obj_needs_reset = !obj_free.sprite.visible
}

obj_free.para = para
// clear it, just in case it was a HP bar or something that didn't animate
obj_free.texture_obj = null

if (ss.blending) {
  if ((ss.blending == 'additive') && MMD_SA.THREEX.enabled) {
// https://threejs.org/docs/index.html#api/en/constants/CustomBlendingEquations
    obj_free.sprite.material.blending = THREE.CustomBlending;
    obj_free.sprite.material.blendEquation = THREE.MaxEquation;
//obj_free.sprite.material.blendSrc = THREE.SrcAlphaFactor;
//obj_free.sprite.material.blendDst = THREE.OneMinusSrcAlphaFactor;
  }
  else {
    obj_free.sprite.material.blending = THREE[ss.blending.charAt(0).toUpperCase() + ss.blending.substring(1).toLowerCase() + 'Blending'];
  }
}
else {
  obj_free.sprite.material.blending = THREE.NormalBlending;
}

obj_free.sprite.material.depthTest = (para.depth != null)
obj_free.sprite.material.map = texture

if (para.pos)
  obj_free.sprite.position.copy(para.pos)
para._pos = (para._pos || new THREE.Vector3()).copy(obj_free.sprite.position)

var scale = ss.scale * (para.scale || 1)
obj_free.sprite.scale.set(scale,scale, 1);

if (obj_needs_reset) {
  if (!obj_free.animator)
    obj_free.animator = new SpriteAnimator(obj_free)
  obj_free.animator.reset(ss)
}
obj_free.animator.tileDisplayDuration = para.frame_interval || (ss.frame_interval / (obj_free.animator.speed || para.speed || 1));

return obj_free
  }

 ,display: function (texture_obj, para) {
const use_THREEX = MMD_SA.THREEX.enabled;
const THREE = MMD_SA.THREEX.THREE;

texture_obj = Texture_Object(texture_obj)
var texture = texture_obj.texture

var obj_free = sprite_obj_list.find(function (obj) {
  return !obj.sprite.visible;
});

if (!obj_free) {
  obj_free = create_sprite_obj(texture)
}

obj_free.para = para
obj_free.animator = null

obj_free.texture_obj = texture_obj
texture_obj.obj_parent = obj_free
texture_obj.init()
texture_obj.update()

obj_free.sprite.material.blending = (para.blending) ? THREE[ss.blending.charAt(0).toUpperCase() + ss.blending.substring(1).toLowerCase() + 'Blending'] : THREE.NormalBlending
obj_free.sprite.material.depthTest = false
obj_free.sprite.material.map = texture
if (use_THREEX) {
  texture.repeat.set(1,1)
  texture.offset.set(0,0)
}
else {
  obj_free.sprite.material.uvScale.set(1,1)
  obj_free.sprite.material.uvOffset.set(0,0)
}

if (para.pos)
  obj_free.sprite.position.copy(para.pos)
para._pos = obj_free.sprite.position.clone()

obj_free.sprite.rotation = 0

obj_free.sprite.visible = true
  }

 ,get_obj_by_id: function (id) {
return sprite_obj_list.find(function (obj) { return obj.texture_obj && (obj.texture_obj.id == id); });
  }

 ,TextureObject_HP_bar:TextureObject_HP_bar
    };
};
