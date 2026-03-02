// (2025-02-09)

MMD_SA_options.Dungeon = (function () {

class Object3D_proxy_base {
  constructor(_parent) {
    this._parent = _parent;
  }

  get #bounding_host() {
return MMD_SA.get_bounding_host(this._parent._obj);
  }

  get boundingSphere() {
return this.#bounding_host.boundingSphere;
  }

  get boundingBox() {
return this.#bounding_host.boundingBox;
  }

  get boundingBox_list() {
return this.#bounding_host.boundingBox_list;
  }
}

function CombatStats(stats) {
  Object.assign(this, stats)

  if (!this.weapon)
    this.weapon = {}
  if (!this.weapon.combo_type_RE)
    this.weapon.combo_type_RE = /bare\-handed|kick/

  if (!this.attack)
    this.attack = {}
  if (this.attack.scale == null)
    this.attack.scale = 1

  if (!this.defense)
    this.defense = {}
  if (this.defense.scale == null)
    this.defense.scale = 1
}

function _jump_physics(s, frame) {
  var t = frame/30

// s = v*t + 0.5*(a)*t^2
// s = v*t + 0.5*(-v/t)*t^2
// s = v*t + 0.5*-v*t
// s/t/0.5 = v
  v =  s/t/0.5
  a = -v/t

  return {v:v, a:a}
}

function AreaDataSaved() {
  this.object_by_index = {}
}

var _bb_xz_factor_ = 0.5

return {
  _bb_xz_factor_:_bb_xz_factor_
 ,_jump_physics:_jump_physics

 ,Object3D_proxy_base: Object3D_proxy_base

 ,_CombatStats: CombatStats
 ,_AreaDataSaved: AreaDataSaved

 ,get use_octree() { return true; }//MMD_SA_options.Dungeon_options.use_octree; }

//https://github.com/Matthew-Burfield/random-dungeon-generator
 ,RDG: (function () {
/*
if (xul_mode) {
  var module
//  R("dungeon-generator", function (err, m) {
  R("index.umd", function (err, m) {
    module = m;
  });
console.log(module)
  return module;
}
*/
//return require("index.umd.js");

// https://www.npmjs.com/package/dungeon-generator
return {
//  DG: require("dungeon-generator")
  get DG() { return Dungeon }
 ,dungeon: null
 ,NewDungeon: function (options) {
this.dungeon = new this.DG({
    "size": [options.width, options.height],
    "rooms": {
        "initial": {
            "min_size": [options.minRoomSize, options.minRoomSize],
            "max_size": [options.minRoomSize, options.minRoomSize],
            "max_exits": 1
        },
        "any": {
            "min_size": [options.minRoomSize, options.minRoomSize],
            "max_size": [options.maxRoomSize, options.maxRoomSize],
            "max_exits": 4
        }
    },
    "max_corridor_length": 6,
    "min_corridor_length": 2,
    "corridor_density": 0.5,
    "symmetric_rooms": false,
    "interconnects": 1,
    "max_interconnect_length": 10,
    "room_count": options.DG_room_count || Math.round(Math.sqrt(options.width * options.height) * 0.5)
});

this.dungeon.generate()
console.log(this.dungeon)

var g = []
for (var y = 0, y_max = options.height; y < y_max; y++) {
  g[y] = []
  for (var x = 0, x_max = options.width; x < x_max; x++) {
    g[y][x] = (this.dungeon.walls.get([x,y])) ? 1 : 0
  }
}

var room_index = 2
this.dungeon.children.forEach(function (c, idx) {
  var pos = c.position
  if (c.tag) {
    for (var y = pos[1]+1, y_max = pos[1] + c.size[1]-1; y < y_max; y++) {
      for (var x = pos[0]+1, x_max = pos[0] + c.size[0]-1; x < x_max; x++) {
        g[y][x] = room_index
      }
    }
    room_index++
  }
});

return g
  }
};
  })()

 ,area_id: ""

 ,battle_model_index_list: []

// [extracted] character → js/dungeon/character.js

// [extracted] inventory → js/dungeon/inventory.js


// [extracted] map (check_grid_blocking, GOML_dungeon_blocks, get_ground_y, get_para, update_dungeon_blocks) → js/dungeon/map.js


// [extracted] restart → js/dungeon/restart.js

 ,update_shadow_para: function () {
var shadow_camera_width = this.shadow_camera_width || 64*4

MMD_SA_options.shadow_para.shadowCameraLeft   = -shadow_camera_width;
MMD_SA_options.shadow_para.shadowCameraRight  =  shadow_camera_width;
MMD_SA_options.shadow_para.shadowCameraBottom = -shadow_camera_width;
MMD_SA_options.shadow_para.shadowCameraTop    =  shadow_camera_width;
MMD_SA_options.shadow_para.shadowCameraFar    =  MMD_SA_options.light_position_scale*3;//shadow_camera_width*1.5;//
//console.log(shadow_camera_width+'/'+MMD_SA_options.shadow_para.shadowCameraFar )
for (var i = 1, i_max = MMD_SA.light_list.length; i < i_max; i++) {
  var light = MMD_SA.light_list[i].obj
  if (light instanceof THREE.PointLight)
    continue

  for (var p in MMD_SA_options.shadow_para)
    light[p] = MMD_SA_options.shadow_para[p]

  if (light.shadowCamera instanceof THREE.OrthographicCamera) {
// left, right, top, bottom, near, far
    light.shadowCamera.left   = light.shadowCameraLeft
    light.shadowCamera.right  = light.shadowCameraRight
    light.shadowCamera.top    = light.shadowCameraTop
    light.shadowCamera.bottom = light.shadowCameraBottom
    light.shadowCamera.near   = light.shadowCameraNear
    light.shadowCamera.far    = light.shadowCameraFar
    light.shadowCamera.updateProjectionMatrix()
//DEBUG_show(light.position.toArray(),0,1)
  }

// AT: cascaded shadow map
  else if (light.shadowCascadeArray) {
    light.shadowCascadeArray.forEach(function (_light) {
      _light.shadowCamera.far = light.shadowCameraFar
    });
//DEBUG_show(light.position.toArray(),0,1)
  }

}
  }

 ,init: function () {
var that = this

System._browser.translation.dictionary = {
	"Dungeon": {
		"UI": {
			"backpack": {
				"_translation_": {
					"_default_": "Backpack",
					"ja": "バックパック",
					"zh": "背包"
				}
			},
			"tome": {
				"settings": {
					"UI_and_overlays": {
						"user_interface": {
							"_translation_": {
								"_default_": "User interface",
								"ja": "ユーザーインターフェース",
								"zh": "使用者介面"
							},
							"UI_off": {
								"_translation_": {
									"_default_": "User interface is now OFF. Press Esc to toggle the bottom menu display.",
									"ja": "ユーザーインターフェースはオフになりました。 Esc キーを押すと、下部のメニュー表示が切り替わります。",
									"zh": "使用者介面現已關閉。 按 Esc 鍵切換下方介面的顯示。"
								},
								"mobile": {
									"_translation_": {
										"_default_": "User interface is now OFF. Touch and hold for 1 second, and press / key to toggle the bottom menu display.",
										"ja": "ユーザーインターフェースはオフになりました。 1 秒間タッチしたままにして、/ キーを押すと、下部のメニュー表示が切り替わります。",
										"zh": "使用者介面現已關閉。 點擊螢幕並按住 1 秒鐘，然後按 / 鍵切換下方介面的顯示。"
									}
								},
								"green_screen": {
									"_translation_": {
										"_default_": "green screen",
										"ja": "グリーンスクリーン",
										"zh": "綠幕"
									}
								}
							}
						},
						"camera_display": {
							"_translation_": {
								"_default_": "Video input display",
								"ja": "ビデオ入力表示",
								"zh": "影像輸入顯示"
							},
							"non_webcam": {
								"_translation_": {
									"_default_": "Non-webcam",
									"ja": "非ウェブカメラ",
									"zh": "非網路攝影機"
								}
							}
						},
						"wireframe_display": {
							"_translation_": {
								"_default_": "Wireframe display",
								"ja": "ワイヤーフレーム表示",
								"zh": "線框顯示"
							}
						},
						"mocap_debug_display": {
							"_translation_": {
								"_default_": "Mocap debug display",
								"ja": "モーキャプのデバッグ表示",
								"zh": "動捕偵錯顯示"
							}
						},
						"UI_sound_effects": {
							"_translation_": {
								"_default_": "UI sound effects",
								"ja": "UI音響効果",
								"zh": "介面聲效"
							}
						},
						"UI_language": {
							"_translation_": {
								"_default_": "UI language",
								"ja": "UI言語",
								"zh": "介面語言"
							}
						}
					}
				}
			}
		}
	},
	"Misc": {
		"done": {
			"_translation_": {
				"_default_": "Done",
				"ja": "終了",
				"zh": "結束"
			}
		},
		"finish": {
			"_translation_": {
				"_default_": "Finish",
				"ja": "終了",
				"zh": "完成"
			}
		},
		"cancel": {
			"_translation_": {
				"_default_": "Cancel",
				"ja": "キャンセル",
				"zh": "取消"
			}
		},
		"default": {
			"_translation_": {
				"_default_": "Default",
				"ja": "デフォルト",
				"zh": "預設"
			}
		},
		"none": {
			"_translation_": {
				"_default_": "None",
				"ja": "なし",
				"zh": "沒有"
			}
		},
		"full": {
			"_translation_": {
				"_default_": "Full",
				"ja": "フル",
				"zh": "完全"
			}
		},
		"Full": {
			"_translation_": {
				"_default_": "Full",
				"ja": "フル",
				"zh": "完全"
			}
		},
		"yes": {
			"_translation_": {
				"_default_": "Yes",
				"ja": "はい",
				"zh": "是"
			}
		},
		"no": {
			"_translation_": {
				"_default_": "No",
				"ja": "いいえ",
				"zh": "否"
			}
		},
		"others": {
			"_translation_": {
				"_default_": "Others",
				"ja": "その他",
				"zh": "其他"
			}
		},
		"auto": {
			"_translation_": {
				"_default_": "Auto",
				"ja": "自動",
				"zh": "自動"
			}
		},
		"Normal": {
			"_translation_": {
				"_default_": "Normal",
				"ja": "普通",
				"zh": "普通"
			}
		},
		"Medium": {
			"_translation_": {
				"_default_": "Medium",
				"ja": "中",
				"zh": "中"
			}
		},
		"Low": {
			"_translation_": {
				"_default_": "Low",
				"ja": "低",
				"zh": "低"
			}
		},
		"High": {
			"_translation_": {
				"_default_": "High",
				"ja": "高",
				"zh": "高"
			}
		},
		"Very high": {
			"_translation_": {
				"_default_": "Very high",
				"ja": "とても高い",
				"zh": "非常高"
			}
		},
		"Max": {
			"_translation_": {
				"_default_": "Max",
				"ja": "最大",
				"zh": "最大"
			}
		},
		"Min": {
			"_translation_": {
				"_default_": "Min",
				"ja": "最小",
				"zh": "最小"
			}
		},
		"Best": {
			"_translation_": {
				"_default_": "Best",
				"ja": "最高",
				"zh": "最佳"
			}
		},
		"Small": {
			"_translation_": {
				"_default_": "Small",
				"ja": "小",
				"zh": "小"
			}
		},
		"Large": {
			"_translation_": {
				"_default_": "Large",
				"ja": "大",
				"zh": "大"
			}
		}
	}
};

// Dungeon
var options = MMD_SA_options.Dungeon_options// && Object.clone(MMD_SA_options.Dungeon_options)
if (!options)
  options = MMD_SA_options.Dungeon_options = {}

if (use_SA_browser_mode && (!is_SA_child_animation && (!webkit_electron_mode || !options.transparent_background))) {
//  Settings_default._custom_.WallpaperAsBG = "non_default"
  Settings_default._custom_.DisableTransparency = "non_default"
}

if (browser_native_mode && !webkit_window) {
  Settings_default._custom_.CSSTransformFullscreen = "non_default"
}

SA_fullscreen_stretch_to_cover = true

document.addEventListener("DOMContentLoaded", function(e) {
//  if (Settings_default._custom_.DisableTransparency == "non_default") document.body.style.backgroundColor = "black";

  var d = MMD_SA_options.Dungeon
  for (var item_name in d.item_base) {
//console.log(item_name)
    var item = d.item_base[item_name]
    if (item.sound) {
      item.sound.forEach(function (sound) {
        if (options.sound.findIndex(function(s){return (s.url==sound.url)}) == -1) {
          options.sound.push({
  url: sound.url
 ,name: sound.name
 ,channel: sound.channel || "SFX"
 ,can_spawn: !!sound.can_spawn
          });
        }
      });
    }
  }

  if (options.NPC_physics_disabled) {
    for (var i = 1, i_max = MMD_SA_options.model_para_obj_all.length; i < i_max; i++)
      MMD_SA_options.model_para_obj_all[i].physics_disabled = true
    console.log("NPC physics OFF")
  }

  if (is_mobile && !options.joystick_disabled)
    Ljoystick.style.visibility = "inherit"
});

window.addEventListener("jThree_ready", function () {
  var c = MMD_SA_options.Dungeon.character.icon = document.createElement("canvas")
  c.width = c.height = 64

  MMD_SA_options.model_para_obj_all.forEach(function (para_SA, idx) {
    if (para_SA.is_PC_candidate || (idx == 0)) {
      para_SA.is_PC_candidate = true
      if (!para_SA.character)
        para_SA.character = {}
      if (!para_SA.character.combat_stats_base)
        para_SA.character.combat_stats_base = (idx == 0) ? MMD_SA_options.Dungeon.character.combat_stats_base||{} : {}
      if (!para_SA.character.combat_stats_base.attack_combo_list)
        para_SA.character.combat_stats_base.attack_combo_list = MMD_SA_options.Dungeon_options._attack_combo_list
    }

    const para_SAX = MMD_SA.THREEX.get_model(idx).model_para;
    if (!para_SAX.icon_path)
      return
//System.Gadget.path + '\\icon_SA_512x512.png'

    if (!/^\w+\:/.test(para_SAX.icon_path))
      para_SAX.icon_path = MMD_SA.THREEX.get_model(idx).model_path.replace(/[^\/\\]+$/, "") + para_SAX.icon_path

    var icon_canvas = para_SA._icon_canvas = para_SAX._icon_canvas = document.createElement("canvas")
    icon_canvas.width = icon_canvas.height = 64
    System._browser.load_file(para_SAX.icon_path, async function (xhr) {
      const bitmap = await createImageBitmap(xhr.response);//, { resizeWidth:64, resizeHeight:64, resizeQuality:'high' });
      const ctx = icon_canvas.getContext("2d")
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(bitmap, 0,0,64,64);
      bitmap.close()
    }, 'blob', true);
  });

  MMD_SA_options.Dungeon.character.combat_stats_base = MMD_SA_options.model_para_obj.character.combat_stats_base
});

window.addEventListener("SA_Dungeon_onstart", function () {
//https://github.com/yoannmoinet/nipplejs
  if (Ljoystick.style.visibility == "hidden")
    return

  var d = MMD_SA_options.Dungeon;

  (function () {
    var css_scale = System._browser.css_scale

    function keyboard_event(e_type, key_id) {
var keyCode = d.key_map_by_id[key_id].keyCode
if ((e_type == "keyup") && !d._key_pressed[keyCode])
  return

var e = new KeyboardEvent(e_type, {bubbles:true, cancelable:true, keyCode:keyCode});
document.dispatchEvent(e);
    }

    function joystick_resize() {
Ljoystick.style.posLeft = 16
Ljoystick.style.posTop  = B_content_height - (Ljoystick.style.pixelWidth+32)
//Ljoystick.style.transform = "scale(" + css_scale + ")"
Ljoystick.style.visibility = "inherit"
    }

    Ljoystick.style.pixelWidth = Ljoystick.style.pixelHeight = 256 * css_scale

    var nipple_radius = 64 * css_scale
    d.nipplejs_manager = nipplejs.create({
      zone: Ljoystick
     ,color: "black"
//     ,mode: "static"
     ,size: nipple_radius*2
     ,position: { top:"50%", left:"50%" }
//,dynamicPage:true
     ,fadeTime: 10
    });

    d.nipplejs_manager.on("move", function (ev, data) {
//DEBUG_show(d.key_map_by_id.up.keyCode)
//DEBUG_show(JSON.stringify(data))
var key_pressed = {up:0, down:0, left:0, right:0}
var xy = data.instance.frontPosition
var x = xy.x
var y = xy.y
//DEBUG_show(JSON.stringify(xy))
var dis = Math.sqrt(x*x + y*y)
if (dis > nipple_radius/10) {
  var scale
  var threshold = (d.character.TPS_mode) ? 0 : nipple_radius/10
  var x_abs = Math.abs(x)
  var y_abs = Math.abs(y)
  if (x_abs > threshold) {
    scale = (d.character.TPS_mode) ? x_abs/dis * Math.min(dis/nipple_radius*2, 1) : (x_abs/nipple_radius-0.1)/0.9
    if (x > 0)
      key_pressed.right = scale
    else
      key_pressed.left  = scale
  }
  if (y_abs > threshold) {
    scale = (d.character.TPS_mode) ? y_abs/dis * Math.min(dis/nipple_radius*2, 1) : Math.min(y_abs/nipple_radius*2, 1)
    if (y > 0)
      key_pressed.down = scale
    else
      key_pressed.up   = scale
  }
}

for (var key_id in key_pressed) {
  var v = key_pressed[key_id]
  if (v) {
    var key_map = d.key_map_by_id[key_id]
    var key_data = key_map._data = key_map._data || {}
    key_data.scale = v
    keyboard_event("keydown", key_id)
  }
  else
    keyboard_event("keyup", key_id)
}
    });

    d.nipplejs_manager.on("end", function (ev) {
var key_pressed = {up:0, down:0, left:0, right:0}
for (var key_id in key_pressed)
  keyboard_event("keyup", key_id)
    });

    joystick_resize()
    window.addEventListener("resize", function (e) {
joystick_resize()
    });
  })();
});


// defaults for MMD_SA_options START
if (!MMD_SA_options.GOML_head)
  MMD_SA_options.GOML_head = ""
if (!MMD_SA_options.GOML_scene)
  MMD_SA_options.GOML_scene = ""
if (!MMD_SA_options.mesh_obj)
  MMD_SA_options.mesh_obj = []
if (!MMD_SA_options.mesh_obj_preload_list)
  MMD_SA_options.mesh_obj_preload_list = []

if (MMD_SA_options.hidden_before_start == null)
  MMD_SA_options.hidden_before_start = true
//MMD_SA_options.hidden_on_start = true

MMD_SA_options.use_speech_bubble = true

if (!MMD_SA_options.mirror_motion_from_first_model)
  MMD_SA_options.mirror_motion_from_first_model = 0

if (!MMD_SA_options.light_position_scale)
  MMD_SA_options.light_position_scale = 64*2;

if (!MMD_SA_options.shadow_para)
  MMD_SA_options.shadow_para = {};
if (!MMD_SA_options.shadow_para.shadowCameraLeft)
  MMD_SA_options.shadow_para.shadowCameraLeft = -64*4;
if (!MMD_SA_options.shadow_para.shadowCameraRight)
  MMD_SA_options.shadow_para.shadowCameraRight = 64*4;
if (!MMD_SA_options.shadow_para.shadowCameraBottom)
  MMD_SA_options.shadow_para.shadowCameraBottom = -64*4;
if (!MMD_SA_options.shadow_para.shadowCameraTop)
  MMD_SA_options.shadow_para.shadowCameraTop = 64*4;

// use default fog para unless in AR mode
if (!MMD_SA_options.fog && (!MMD_SA_options.WebXR || !MMD_SA_options.WebXR.AR))
  MMD_SA_options.fog = options.fog || {}

if (!MMD_SA_options.light_position)
  MMD_SA_options.light_position = [0,1,0]

if (MMD_SA_options.light_color == null)
  MMD_SA_options.light_color = "#202020"
if (MMD_SA_options.ambient_light_color == null)
  MMD_SA_options.ambient_light_color = "#404040"
if (MMD_SA_options.ground_shadow_only == null)
  MMD_SA_options.ground_shadow_only = true

if (!MMD_SA_options.camera_param)
  MMD_SA_options.camera_param = "far:" + (128*16*8) + ";"

if (MMD_SA_options.meter_motion_disabled == null)
  MMD_SA_options.meter_motion_disabled = true
// defaults for MMD_SA_options END


if (!options.game_id)
  options.game_id = Settings.f_path.replace(/^.+[\/\\]/, "")
if (!options.game_version)
  options.game_version = "1.0"
if (!options.chapter_id)
  options.chapter_id = "1"


// [extracted] sound defaults, PC click reaction, combat sounds → js/dungeon/pc_click_reaction.js
this._initSoundsAndClickReaction();


// [extracted] skydome, CircularSpectrum follower → js/dungeon/skydome.js
this._initSkydome();

// [extracted] items, grid_material_list defaults, inventory init → js/dungeon/items.js
this._initItems();

if (!MMD_SA_options.trackball_camera_limit)
  MMD_SA_options.trackball_camera_limit = { max:{ length:64*3 }, min:{} }
MMD_SA_options.trackball_camera_limit.min.y = -9

window.addEventListener("SA_MMD_trackball_camera_limit_adjust", (function () {
  var para = {
    filter: function (obj) {
      return obj.no_camera_collision
    }
  };
  return function (e) {
var eye = e.detail.eye

var d = MMD_SA_options.Dungeon
var camera_limit_scale = MMD_SA_options.Dungeon_options.options_by_area_id[d.area_id].camera_limit_scale || 1

// feel less glitchy than using MMD_SA.camera_position
var camera_pos = MMD_SA._v3a_.copy(d.character.pos); camera_pos.y += 10;//MMD_SA.camera_position;
var rv = ((d.ceil_material_index_default != -1) && (eye.y > d.ceil_height*camera_limit_scale*0.8)) || d.check_grid_blocking(MMD_SA.TEMP_v3.copy(eye).add(d.character.pos), d.grid_blocking_camera_offset) || (!d.no_camera_collision && d.check_ray_intersection(camera_pos, eye, para));
if (rv) {
//DEBUG_show(d.check_grid_blocking(MMD_SA.TEMP_v3.copy(eye).add(d.character.pos), d.grid_blocking_camera_offset)+'/'+Date.now())
  e.detail.result.return_value = rv
}
  };
})() );


window.addEventListener("MMDStarted", function (e) {

// UI START
(function () {
var ss = document.createElement('style')
ss.id = 'CSSdungeon'
document.head.appendChild(ss)

ss.sheet.insertRule([
  '.Dungeon_inventory_item_info_short:hover:after{'
// ,'background: #333;'
 ,'background: rgba(0,0,0,.8);'
 ,'border-radius: 5px;'
 ,'color: #fff;'
 ,'padding: 5px 5px;'
 ,'position: absolute;'
 ,'top:  -' + (5+5+12*1) + 'px;'
 ,'left: -16px;'
 ,'z-index: 999;'
 ,'width: 80px;'
 ,'height: ' + (5+5+12*1) + 'px;'
 ,'font-size:10px;'
 ,'content: attr(data-info_short);'
 ,'}'
].join('\n'), 0);

ss.sheet.insertRule([
  '.Dungeon_inventory_item_info:hover:after{'
// ,'background: #333;'
 ,'background: rgba(0,0,0,.8);'
 ,'border-radius: 5px;'
 ,'color: #fff;'
 ,'padding: 5px 5px;'
 ,'position: absolute;'
 ,'top:  -' + (5+5+12*7) + 'px;'
 ,'left: -16px;'
 ,'z-index: 999;'
 ,'width: 280px;'
 ,'height: ' + (5+5+12*7) + 'px;'
 ,'font-size: 10px;'
 ,'content: attr(data-info);'//"' + this.item.info + '";'//
// https://www.digitalocean.com/community/tutorials/css-line-break-content-property
// https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
 ,'white-space: pre-wrap;'

 ,'transform-origin: bottom center;'
 ,'transform: scale(' + MMD_SA_options.Dungeon.inventory.UI.info.scale + ');'
 ,'}'
].join('\n'), 0);

ss.sheet.insertRule([
  '.Dungeon_inventory_item_info_display::after{'
// ,'background: #333;'
 ,'background: rgba(0,0,0,.8);'
 ,'border-radius: 5px;'
 ,'color: #fff;'
 ,'padding: 5px 5px;'
 ,'position: absolute;'
 ,'top: ' + ((is_mobile) ? -(5+5+12*7) : 'calc(-50vh + ' + (5+5+12*7 +50) + 'px)') + ';'
 ,'left: -16px;'
 ,'z-index: 999;'
 ,'width: 280px;'
 ,'height: ' + (5+5+12*7) + 'px;'
 ,'font-size: 10px;'
 ,'content: attr(data-info);'//"' + this.item.info + '";'//
// https://www.digitalocean.com/community/tutorials/css-line-break-content-property
// https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
 ,'white-space: pre-wrap;'

 ,'transform-origin: bottom center;'
 ,'transform: scale(' + MMD_SA_options.Dungeon.inventory.UI.info.scale + ');'
 ,'}'
].join('\n'), 0);


const SB_tooltip = document.createElement('div');
SB_tooltip.id = 'SB_tooltip';
const _s = SB_tooltip.style;
_s.background = 'rgba(0,0,0,.8)';
_s.borderRadius = '5px';
_s.color = '#fff';
_s.padding = '5px 5px';
_s.position = 'absolute';
_s.zIndex = 999;
_s.width = '280px';
_s.height = (5+5+12*7) + 'px';
_s.fontSize = '10px';
_s.whiteSpace = 'pre-wrap';
_s.visibility = 'hidden';

_s.transformOrigin = 'top center';
_s.transform = 'scale(' + MMD_SA_options.Dungeon.inventory.UI.info.scale + ')';

document.getElementById('SL_Host').appendChild(SB_tooltip);


var d, ds;

var dungeon_UI = d = document.createElement("div")
ds = d.style
d.id = "Ldungeon_UI"
ds.position = "absolute"
ds.left = ds.top = '0px'
ds.zIndex = 2
ds.visibility = "inherit"
SL_Host.appendChild(d)

d = document.createElement("div")
ds = d.style
d.id = "Ldungeon_map"
ds.position = "absolute"
ds.backgroundColor = "rgba(0,0,0, 0.5)"
ds.zIndex = 2
ds.opacity = 0.75
ds.transformOrigin = "100% 100%"
dungeon_UI.appendChild(d)

d = document.createElement("canvas")
ds = d.style
d.id = "Cdungeon_map_canvas"
ds.position = "absolute"
ds.posLeft = ds.posTop = 8
ds.zIndex = 1
Ldungeon_map.appendChild(d)

d = document.createElement("canvas")
ds = d.style
d.id = "Cdungeon_map_compass_canvas"
d.width = d.height = 33
ds.position = "absolute"
ds.zIndex = 2
Ldungeon_map.appendChild(d)

if (MMD_SA_options.Dungeon_options.multiplayer) {
  for (var i = 1, i_max = MMD_SA_options.Dungeon_options.multiplayer.OPC_list.length; i <= i_max; i++) {
    d = document.createElement("div")
    ds = d.style
    d.id = "Ldungeon_map_spot_OPC" + i
    ds.position = "absolute"
    ds.backgroundColor = "yellow"
    ds.zIndex = 3
    Ldungeon_map.appendChild(d)
  }
}

d = document.createElement("div")
ds = d.style
d.id = "Ldungeon_map_spot"
ds.position = "absolute"
ds.backgroundColor = "white"
ds.zIndex = 3
Ldungeon_map.appendChild(d)

d = document.createElement("canvas")
ds = d.style
d.id = "Cdungeon_status_bar"
ds.position = "absolute"
ds.posLeft = 8
ds.posTop = 24+22+4
ds.zIndex = 3
ds.transformOrigin = "0% 0%"
dungeon_UI.appendChild(d)

d = document.createElement("div")
ds = d.style
d.id = "Ldungeon_inventory"
ds.position = "absolute"
ds.zIndex = 4
ds.transformOrigin = "50% 100%"
SL_Host.appendChild(d)

d = document.createElement("div")
ds = d.style
d.id = "Ldungeon_inventory_backpack"
ds.position = "absolute"
ds.zIndex = 3
ds.visibility = "hidden"
ds.transformOrigin = "50% 100%"
SL_Host.appendChild(d)

var inv = MMD_SA_options.Dungeon.inventory

var drop_item = function (index_source, index) {
  if (index_source == index) return

  var inv_source = inv.list[index_source]
  if (inv_source.item.is_base_inventory && (index >= inv.max_base)) {
    if (!MMD_SA_options.Dungeon.inventory.UI.muted)
      MMD_SA_options.Dungeon.sound.audio_object_by_name["interface_item_deny"].play();
    return
  }

  var inv_target = inv.list[index]
  if (inv_target.item.is_base_inventory && (index_source >= inv.max_base)) {
    if (!MMD_SA_options.Dungeon.inventory.UI.muted)
      MMD_SA_options.Dungeon.sound.audio_object_by_name["interface_item_deny"].play();
    return
  }

  if (!MMD_SA_options.Dungeon.inventory.UI.muted)
    MMD_SA_options.Dungeon.sound.audio_object_by_name[((inv_source.item.sound && inv_source.item.sound.find(function(i){return i.is_drag})) || {name:"interface_item_drop"}).name].play();

  if (inv_target.item?.on_drop) {
    inv_target.item.on_drop(inv_target, inv_source);
  }
  else {
    inv.swap(index_source, index);
  }
};

var _touchstart;
for (let r = 0, r_max = inv.max_row; r < r_max; r++) {
for (let i = 0, i_max = inv.max_base; i < i_max; i++) {
  let idx = r * i_max + i

  var d_inv = d = document.createElement("div")
  ds = d.style
  d.id = "Ldungeon_inventory_item" + idx
  d.className = "Dungeon_inventory_item_info_short"
  ds.position = "absolute"
  ds.posLeft = i * 64
  ds.posTop  = (r) ? (r-1)*64 : 0
  ds.width = ds.height = "64px"
  ds.backgroundImage = "url(" + MMD_SA_options.Dungeon.blob_url.get("BlankSlot.png") + ")"

  d.addEventListener("mouseover", function (e) {
const _idx = inv.get_inventory_index(idx);
var inv_item = inv.list[_idx]
inv_item.item.onmouseover && inv_item.item.onmouseover(e, _idx);

// not accessing .info directly as it may be a getter function
if ("info" in inv_item.item) {
  this.className = (System._browser.overlay_mode) ? 'Dungeon_inventory_item_info_short' : 'Dungeon_inventory_item_info';
  this.setAttribute("data-info", inv_item.item.info_short + ':\n' + inv_item.item.info);
}
  }, true);
  d.addEventListener("mouseout", function (e) {
const _idx = inv.get_inventory_index(idx);
var inv_item = inv.list[_idx]
inv_item.item.onmouseout && inv_item.item.onmouseout(e, _idx);
  }, true);

  d.draggable  = true
  d.addEventListener("mousedown", function (e) {
const _idx = inv.get_inventory_index(idx);
e.stopPropagation();
if (is_mobile) {
  e.preventDefault()
/*
  if (inv.item_selected_index != null) {
    if (Date.now() > _touchstart+500) {
      drop_item(inv.item_selected_index, _idx)
      inv.item_selected_index = null
    }
  }
  else if (inv.list[_idx].item_id) {
    inv.item_selected_index = _idx
    _touchstart = Date.now()
  }
*/
}
  }, true);
  d.addEventListener("dblclick", async function (e) {
const _idx = inv.get_inventory_index(idx);
e.stopPropagation();

inv.item_selected_index = null

var inv_item = inv.list[_idx]
if (!await inv_item.action_check()) {
  return
}

if (inv_item.item.action.func(inv_item.item, inv_item)) {
  if (!MMD_SA_options.Dungeon.inventory.UI.muted)
    MMD_SA_options.Dungeon.sound.audio_object_by_name["interface_item_deny"].play();
  return;
}

if (!MMD_SA_options.Dungeon.inventory.UI.muted && !inv_item.item.action.muted)
  MMD_SA_options.Dungeon.sound.audio_object_by_name[((inv_item.item.sound && inv_item.item.sound[0]) || {name:"interface_item_access"}).name].play();

if (inv_item.item.stock_max != 1) {
  if (--inv_item.stock == 0)
    inv_item.clear()
  else
    document.getElementById("Ldungeon_inventory_item" + idx + "_stock").textContent = inv_item.stock
}
  }, true);
/*
  if (is_mobile) {
    d.addEventListener("touchstart", (e)=>{});
    d.addEventListener("drag", (e)=>{});
// https://github.com/timruffles/mobile-drag-drop#polyfill-requires-dragenter-listener
    d.addEventListener("dragenter", (e)=>{ e.preventDefault(); });
  }
*/
  d.addEventListener("dragstart", function (e) {
const _idx = inv.get_inventory_index(idx);
if (!inv.list[_idx].item_id)
  return
e.stopPropagation();
e.dataTransfer.clearData();
e.dataTransfer.setData("text/plain", _idx);
e.dataTransfer.setDragImage(inv.list[_idx].item.icon, 30,30);
e.dataTransfer.dropEffect = "move";
  }, true);
  d.addEventListener("dragover", function (e) {
e.preventDefault();
e.dataTransfer.dropEffect = "move"
  });
  d.addEventListener("drop", function (e) {
const _idx = inv.get_inventory_index(idx);
e.stopPropagation();
e.preventDefault();
var index_source = e.dataTransfer.getData("text");
if (!index_source)
  return
//DEBUG_show(index_source,0,1)
drop_item(index_source, _idx);
  });

  if (r)
    Ldungeon_inventory_backpack.appendChild(d)
  else
    Ldungeon_inventory.appendChild(d)

  var img_icon = d = document.createElement("img")
  ds = d.style
  d.id = "Ldungeon_inventory_item" + idx + "_icon"
// AFTER
ds.pointerEvents = 'none';

  ds.position = "absolute"
  ds.posLeft = ds.posTop = 0
  ds.zIndex = 1

  var img_border = d = document.createElement("img")
  ds = d.style
  d.id = "Ldungeon_inventory_item" + idx + "_border"
// AFTER
ds.pointerEvents = 'none';

  ds.position = "absolute"
  ds.posLeft = ds.posTop = 0
  ds.zIndex = 2

  var d_stock = d = document.createElement("div")
  ds = d.style
  d.id = "Ldungeon_inventory_item" + idx + "_stock"
  ds.position = "absolute"
  ds.posLeft = 0
  ds.posTop = 64-10-8
  ds.pixelWidth = 64-8
  ds.textAlign = "right"
  ds.fontFamily = "Segoe Print,Segoe UI,Arial"
  ds.fontSize = "10px"
  ds.fontWeight = "bold"
  ds.color = "gold"
  ds.textShadow = "black 0px 0px 4px"
  ds.zIndex = 3

  d_inv.appendChild(img_icon)
  d_inv.appendChild(img_border)
  d_inv.appendChild(d_stock)
}
}

var draw_dungeon_map = function (e) {
  var d = MMD_SA_options.Dungeon

  var scale = Math.min(B_content_width, B_content_height) / (Math.max(d.RDG_options.width, d.RDG_options.height)*2)
  if (scale >= 8)
    scale = 8
  else if (scale >= 4)
    scale = 4
  else
    scale = 2

  if (d.map_display_scale != scale) {
    d.map_display_scale = scale

    Cdungeon_map_canvas.width  = d.RDG_options.width  * scale
    Cdungeon_map_canvas.height = d.RDG_options.height * scale

    var context = Cdungeon_map_canvas.getContext("2d")
    context.clearRect(0,0,Cdungeon_map_canvas.width,Cdungeon_map_canvas.height)
    for (var y = 0, y_max = d.RDG_options.height; y < y_max; y++) {
      for (var x = 0, x_max = d.RDG_options.width; x < x_max; x++) {
        if (d.get_para(x,y,true).hidden_on_map) {
          d.map_grid_drawn[y][x] = true
        }
        else if (d.map_grid_drawn[y][x]) {
          context.fillStyle = d.get_para(x,y,true).map_grid_color || "green"
          context.fillRect(x*scale,y*scale, scale,scale)
        }
      }
    }
  }

  var ds = Ldungeon_map.style
  var w = Cdungeon_map_canvas.width  + 16
  var h = Cdungeon_map_canvas.height + 16
  ds.pixelWidth  = w
  ds.pixelHeight = h
  ds.posLeft = B_content_width  - w - 8
  ds.posTop  = B_content_height - h - 8

  var spot_size = Math.min(scale/2, 2)
  Ldungeon_map_spot.style.pixelWidth = Ldungeon_map_spot.style.pixelHeight = spot_size
  if (MMD_SA_options.Dungeon_options.multiplayer) {
    for (var i = 1, i_max = MMD_SA_options.Dungeon_options.multiplayer.OPC_list.length; i <= i_max; i++) {
      ds = document.getElementById("Ldungeon_map_spot_OPC" + i).style
      ds.pixelWidth = ds.pixelHeight = spot_size
    }
  }
};

MMD_SA_options.Dungeon.update_status_bar = (function () {
  var canvas_status_bar = document.createElement("canvas")
  canvas_status_bar.width  = 256
  canvas_status_bar.height = 72

  var hp_width = 0

  var update_status_bar = function (always_update) {
var c = MMD_SA_options.Dungeon.character

var _hp_width = Math.round((256-56-2) * c.hp/c.hp_max)
if (!always_update && (hp_width == _hp_width))
  return
hp_width = _hp_width

var ctx = Cdungeon_status_bar.getContext("2d")

ctx.globalCompositeOperation = "copy";
ctx.drawImage(canvas_status_bar, 0,0);

if (!MMD_SA_options.Dungeon_options.combat_mode_enabled) return;

let hp_bar_color;
if (c.hp > 75) {
  hp_bar_color = "rgb(0,255,0)";
}
else {
  const g = (c.hp > 50) ? 255 : Math.round(64 + (c.hp/50)*(255-64));
  const r = Math.round(Math.pow((75-c.hp)/75,0.5)*255);
  hp_bar_color = "rgb("+r+","+g+",0)";
}

ctx.globalCompositeOperation = "destination-over";
ctx.fillStyle = hp_bar_color;
ctx.fillRect(56,56, hp_width,8);
ctx.fillStyle = "rgba(0,0,0, 0.5)";
ctx.fillRect(56,56, hp_width,8);
  }

  return function (always_update) {
if (!always_update) {
  update_status_bar()
  return
}

Cdungeon_status_bar.width  = 256
Cdungeon_status_bar.height = 72

var ctx = canvas_status_bar.getContext("2d")

ctx.globalCompositeOperation = "copy";
ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(36,36, 32, 0, 2*Math.PI);
ctx.fill();

ctx.globalCompositeOperation = "source-in";
var icon = MMD_SA_options.Dungeon.character.icon
ctx.drawImage(icon, 0,0,icon.width,icon.height, 4,4,64,64)

ctx.globalCompositeOperation = "destination-over";
ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(36,36, 36, 0, 2*Math.PI);
ctx.fill();

if (MMD_SA_options.Dungeon_options.combat_mode_enabled) {
  const gradient = ctx.createLinearGradient(0,0,(256-36),0);
  gradient.addColorStop(0,"white");
  gradient.addColorStop(0.5,"white");
  gradient.addColorStop(1,"rgba(255,255,255,0)");

  ctx.fillStyle = gradient; 
  ctx.fillRect(36,68,(256-36),4);
  ctx.fillRect(36,48,(256-36),4);

  ctx.fillStyle = "rgba(0,0,0, 0.75)";
  ctx.fillRect(56,64, (256-56),2);
  ctx.fillRect(56,54, (256-56),2);
  ctx.fillRect((256-2),56, 2,8);
}

update_status_bar(true)
  };
})();

var place_inventory = function (e) {
  Ldungeon_inventory.style.posLeft = Ldungeon_inventory_backpack.style.posLeft = (B_content_width - (inv.max_base)*64) * ((System._browser.overlay_mode && (Ldungeon_inventory.style.visibility == "hidden")) ? 1 : 0.5);
  Ldungeon_inventory.style.posTop  = B_content_height - 64 - 4
  Ldungeon_inventory.style.pixelWidth  = (inv.max_base)*64
  Ldungeon_inventory.style.pixelHeight = 64

  Ldungeon_inventory_backpack.style.posTop = B_content_height - (inv.max_row)*64 - 4
  Ldungeon_inventory_backpack.style.pixelWidth  = (inv.max_base)*64
  Ldungeon_inventory_backpack.style.pixelHeight = (inv.max_row)*64
}

var draw_UI = function (e) {
  draw_dungeon_map(e)
  place_inventory(e)
  MMD_SA_options.Dungeon.update_status_bar(true)
  Ldungeon_map.style.transform = Ldungeon_inventory.style.transform = Ldungeon_inventory_backpack.style.transform = Cdungeon_status_bar.style.transform = "scale(" + System._browser.css_scale + ")"
}

window.addEventListener("SA_Dungeon_after_map_generation", function (e) { draw_UI(); });
window.addEventListener("SA_resize", function (e) { draw_UI(); if (MMD_SA_options.Dungeon.started) MMD_SA_options.Dungeon.update_dungeon_blocks(true); });

})();
// UI END

// object motion START
(function () {
var Motion = function (obj, para) {
  this.obj = obj
  this.para = (obj.motion && Object.clone(obj.motion)) || para

  this.t_ini = 0
  this.path_index = 0
  this.path_alpha = 0
  this.pos_last  = new THREE.Vector3()
  this.mov_delta = new THREE.Vector3()
  this.rot_last  = new THREE.Vector3()
  this.rot_delta = new THREE.Vector3()
  this._paused = false

  if (this.para.path) {
    this.para.path.forEach(function (pt) {
if (pt.pos && !(pt.pos instanceof THREE.Vector3))
  pt.pos = new THREE.Vector3(pt.pos.x, pt.pos.y, pt.pos.z)
if (pt.rot && !(pt.rot instanceof THREE.Vector3))
  pt.rot = new THREE.Vector3(pt.rot.x, pt.rot.y, pt.rot.z)
    });
  }
}

Motion.prototype = {
  constructor: Motion

 ,get paused() {
return this._paused
  }

 ,set paused(v) {
v = !!v
if (this._paused == v)
  return
this._paused = v

if (v) {
  this._t_diff_paused = this._t - this.t_ini
}
else {
  this.t_ini = this._t - this._t_diff_paused
}
  }

 ,play: (function () {
var _v3 = new THREE.Vector3()
var _q  = new THREE.Quaternion()

var d = MMD_SA_options.Dungeon
var c = d.character

return function (t) {
  var that = this

  if (!t)
    t = performance.now()
  this._t = t

  if (this.paused) {
    this.para.onframestart && this.para.onframestart(this)
    return
  }

  var pt_ini = this.para.path[this.path_index]
  var pt_end = this.para.path[this.path_index+1]

  if (!this.t_ini) {
    this.t_ini = t
    if (pt_ini.pos)
      this.pos_last.copy(pt_ini.pos)
    if (pt_ini.rot)
      this.rot_last.copy(pt_ini.rot)
    return
  }

  if (this.ending_delay) {
    if ((t - this.t_ini) / 1000 < this.ending_delay)
      return
  }
  else {
    var mesh_obj = this.obj._obj
// the first frame of a new point
    if (!this.path_alpha) {
      if (!this.para.is_relative_path) {
        if (pt_ini.pos)
          mesh_obj.position.copy(pt_ini.pos)
        if (pt_ini.rot) {
          mesh_obj.rotation.copy(pt_ini.rot)
// no need to update quaternion here since path motion operates on rotation
//          if (mesh_obj.useQuaternion) mesh_obj.quaternion.setFromEuler(mesh_obj.rotation)
        }
      }
      pt_ini.onstart && pt_ini.onstart(this)
    }

    this.para.onframestart && this.para.onframestart(this)

    this.path_alpha = Math.min((t - this.t_ini) / 1000 / pt_ini.duration, 1)
    if (!pt_ini.animate || !pt_ini.animate(this)) {
      this.path_alpha_position = this.path_alpha_rotation = this.path_alpha
    }

    if (pt_ini.pos) {
      _v3.copy(pt_ini.pos).lerp(pt_end.pos, this.path_alpha_position)
      this.mov_delta.copy(_v3).sub(this.pos_last)
      this.pos_last.copy(_v3)
    }

    if (pt_ini.rot) {
      _v3.copy(pt_ini.rot).lerp(pt_end.rot, this.path_alpha_rotation)
      this.rot_delta.copy(_v3).sub(this.rot_last).multiplyScalar(Math.PI/180)
      this.rot_last.copy(_v3)
    }

//console.log(pt_ini.pos.toArray().join(",")+'/'+pt_end.pos.toArray().join(",")+'/'+mov_delta.toArray().join(","))
//console.log(mesh_obj.position.toArray().join(",")+'/'+mov_delta.toArray().join(","))
    if (this.para.check_collision) {
      d._mov[this.obj._index] = this.mov_delta.clone()
    }
    else {
      mesh_obj.position.add(this.mov_delta)
    }

    mesh_obj.rotation.add(this.rot_delta)
    if (this.obj.is_PC) {
      THREE.MMD.getModels()[0].mesh.quaternion.setFromEuler(mesh_obj.rotation)
      c.about_turn = false
      c.pos_update()
      MMD_SA._trackball_camera.SA_adjust(this.mov_delta)//, this.rot_delta)
    }
    else if (mesh_obj.useQuaternion) {
      mesh_obj.quaternion.setFromEuler(mesh_obj.rotation)
    }

    if (this.para.mounted_list) {
      this.para.mounted_list.forEach(function (mounted) {
        if (mounted == "PC") {
          if (c.ground_obj && (c.ground_obj.obj == that.obj)) {
            c.ground_obj.mov = that.mov_delta.clone()
          }
        }
        else {
          mounted._obj.position.add(that.mov_delta)
          mounted._obj.rotation.add(that.rot_delta)
          if (mounted._obj.useQuaternion)
            mounted._obj.quaternion.multiply(_q.setFromEuler(that.rot_delta))
        }
      });
    }

    this.para.onframefinish && this.para.onframefinish(this)
  }

  if (this.path_alpha == 1) {
    this.t_ini = t
    if (this.ending_delay)
      this.ending_delay = 0
    else if (pt_ini.ending_delay) {
      this.ending_delay = pt_ini.ending_delay
      this.mov_delta.set(0,0,0)
      this.rot_delta.set(0,0,0)
      if (this.para.mounted_list && (this.para.mounted_list.indexOf("PC") != -1)) {
        if (c.ground_obj && (c.ground_obj.obj == this.obj)) {
          c.ground_obj.mov = this.mov_delta.clone()
        }
      }
      return
    }

    this.path_alpha = 0
    pt_ini.onended && pt_ini.onended(this)
    if (++this.path_index == this.para.path.length-1) {
      this.path_index = 0
      if (this.para.loop == false) {
        this.paused = true
        if (this.obj.is_PC) {
          MMD_SA_options.Dungeon.character.path_motion = null
          MMD_SA_options.Dungeon.character.ground_obj = null
          MMD_SA.reset_camera()
        }
      }
    }
  }
};
  })()
}

MMD_SA_options.Dungeon.PathMotion = Motion;
})();
// object motion END


  window.addEventListener("SA_camera_adjust", function (e) {
if (MMD_SA_options.Dungeon.check_grid_blocking(MMD_SA.TEMP_v3.copy(e.detail.pos_v3).add(MMD_SA_options.Dungeon.character.pos), MMD_SA_options.Dungeon.grid_blocking_camera_offset)) {
  e.detail.result.return_value = true
}
else {
  var rot_delta = e.detail.rot_delta
  MMD_SA_options.camera_rotation[0] += rot_delta.x
  MMD_SA_options.camera_rotation[1] += rot_delta.y
  MMD_SA_options.camera_rotation[2] += rot_delta.z
}
  });

  var d = MMD_SA_options.Dungeon;

  d.check_collision = (function () {
var subject_bs, object_bs
var s, d, c, p, a, i, intersection, normal
var moved_final, _moved_final, moved_before_bb_check
var _v3, _v3a, _v3b, _v3c, _v3d, _v3e
var _q, _q2

subject_bs = new THREE.Sphere()
object_bs  = new THREE.Sphere()
s = new THREE.Vector3()
d = new THREE.Vector3()
c = new THREE.Vector3()
p = new THREE.Vector3()
a = new THREE.Vector3()
i = new THREE.Vector3()
intersection = new THREE.Vector3()
normal = new THREE.Vector3()
moved_final = new THREE.Vector3()
_moved_final = new THREE.Vector3()
moved_before_bb_check = new THREE.Vector3()
_v3  = new THREE.Vector3()
_v3a = new THREE.Vector3()
_v3b = new THREE.Vector3()
_v3c = new THREE.Vector3()
_v3d = new THREE.Vector3()
_v3e = new THREE.Vector3()
_q  = new THREE.Quaternion()
_q2 = new THREE.Quaternion()

var subject_bb, object_bb, ray, ray_normal, subject_bb_moved
var _m4, _bb, _c, _d, intersection2, s_bb, s_bb_moved
subject_bb = new THREE.Box3()
object_bb  = new THREE.Box3()
ray = new THREE.Ray()
ray_normal = new THREE.Ray()
subject_bb_moved = new THREE.Box3()

_bb = new THREE.Box3()
_m4 = new THREE.Matrix4()
_c = new THREE.Vector3()
_d = new THREE.Vector3()
s_bb = new THREE.Vector3()
s_bb_moved = new THREE.Vector3()

var character = MMD_SA_options.Dungeon.character
var bb_translate_offset = new THREE.Vector3()

var local_mesh_sorting_range_buffer = 8

return function (_subject, mov_delta, skip_ground_obj_check, para={}) {
  function center_rotate(q, inversed, restored) {
    var identity = (para.collision_centered) ? !inversed : inversed;
    identity = (restored) ? !identity : identity;
    if (identity) {
      return _q.set(0,0,0,1)
    }

    _q.copy(q)
    if (inversed)
      _q.conjugate()

    return _q
  }

  para._subject = _subject

  var use_bb_translate_offset
  var subject_is_PC = (_subject.obj == character)
  if (subject_is_PC) {
    if (!para.bb_translate)
      para.bb_translate = character.bb_translate
// bb_translate offset for mesh collision
    if (para.bb_translate && para.bb_translate._default) {
      use_bb_translate_offset = true
      bb_translate_offset.copy(para.bb_translate._default).sub(para.bb_translate)
    }
//DEBUG_show([para.bb_translate.x,para.bb_translate.y,para.bb_translate.z].join("\n")+"\n\n"+ bb_translate_offset.toArray().join("\n")+"\n\n"+ Date.now())
  }

  var that = this

  var subject = _subject.obj._obj

  subject_bs.copy(subject.geometry.boundingSphere)
  subject_bs.radius *= Math.max(subject.scale.x, subject.scale.y, subject.scale.z)
  var bb_translate
  if (para.bb_translate) {
    bb_translate = _v3a.set(subject_bs.radius,subject_bs.radius,subject_bs.radius).multiply(para.bb_translate).applyQuaternion(center_rotate(subject.quaternion))
    bb_translate.add(subject.position)
  }
  else {
    bb_translate = subject.position
  }
//var XYZ = bb_translate.clone()
//var DEF = subject_bs.center.clone()
  subject_bs.center.add(bb_translate)
//var ABC = subject_bs.center.clone()
  if (para.bb_expand) {
    subject_bs.radius *= Math.max(para.bb_expand.x, para.bb_expand.y, para.bb_expand.z) + 1
  }

  var null_move
  var mov_delta_length, moved_dis_max

// https://gamedev.stackexchange.com/questions/96459/fast-ray-sphere-collision-code
// s: the start point of the ray
  s.copy(subject_bs.center)
// d: a unit vector in the direction of the ray. 
  d.copy(mov_delta).normalize()

  var collision = false
  var collision_by_mesh_checked = false
  var collision_by_mesh_failed = false
  var obj_hit, ground_obj
  moved_final.copy(mov_delta).applyQuaternion(center_rotate(subject.quaternion, true))

  subject_bb.copy(subject.geometry.boundingBox)

// save some headache for octree intersect
  if (subject_bb.min.y < 0) subject_bb.min.y = 0;

/*
// save some headaches by setting xz center as (0,0), with equal xz size
  subject_bb.size(_v3)
  var _xz = (_v3.x+_v3.z)*0.5
  subject_bb.min.x = subject_bb.min.z = -_xz
  subject_bb.max.x = subject_bb.max.z =  _xz
*/

  subject_bb.size(_v3)
  if (para.bb_translate) {
    bb_translate = _v3a.copy(_v3).multiply(para.bb_translate).applyQuaternion(center_rotate(subject.quaternion))
    bb_translate.add(subject.position)
  }
  else
    bb_translate = subject.position
  if (para.bb_expand) {
    subject_bb.expandByVector(_v3b.copy(_v3).multiply(para.bb_expand).multiplyScalar(0.5))
//DEBUG_show(subject_bb.size(_v3).toArray())
  }

  if (use_bb_translate_offset) {
    if (para.bb_expand)
      bb_translate_offset.multiply(_v3a.copy(para.bb_expand).addScalar(1))
    bb_translate_offset.multiply(_v3).applyQuaternion(center_rotate(subject.quaternion))
//DEBUG_show(bb_translate_offset.toArray()+'n'+Date.now())
  }

// updating from .quaternion/.position instead of .matrixWorld should be more updated
  subject_bb.applyMatrix4(_m4.makeRotationFromQuaternion(center_rotate(subject.quaternion)))//subject.matrixWorld)//
  subject_bb.translate(bb_translate)
//  var b_center = subject.bones_by_name["センター"]
//  subject_bb.translate(_v3.copy(subject.position).add(b_center.position).sub(_v3a.fromArray(b_center.pmxBone.origin)))
  subject_bb.center(s_bb)


  ray_normal.set(_v3.copy(s_bb).add(_v3a.copy(d).multiplyScalar(-999)), d);

  var obj_base_dummy = { character_index:0 }
  var followed = {}
  if (subject_is_PC) {
    this.PC_follower_list.forEach(function (follower) {
      if (follower.obj && (follower.obj._obj.id != null))
        followed[follower.obj._obj.id] = true
    });
  }

  var obj_list
  if (para.object_list) {
    obj_list = para.object_list
  }
  if (MMD_SA.THREEX._object3d_list_) {
    obj_list = (obj_list||[]).concat(MMD_SA.THREEX._object3d_list_);
  }
  if (!obj_list || para.check_grid_blocks) {
    obj_list = (obj_list && obj_list.concat(this.grid_blocks.objs)) || this.object_list_in_view
    this.grid_blocks.update(subject.position)
  }

  obj_list.forEach(function (obj, idx) {
if (obj.is_dummy)
  return

if (obj._mesh == subject)
  return

if (obj.no_collision || MMD_SA_options.Dungeon.no_collision)
  return

var cache = obj._obj
if (!cache.visible)
  return

if (para.collision_by_mesh_disabled && obj.collision_by_mesh_enforced)
  return

if (subject_is_PC && (cache.id != null) && followed[cache.id])
  return

if (obj.oncollisioncheck && obj.oncollisioncheck(subject))
  return

var obj_base = obj._obj_base || that.object_base_list[obj.object_index] || obj_base_dummy;

object_bs.copy(obj._obj_proxy.boundingSphere)
object_bs.center.add(cache.position)

var object_scale = Math.max(cache.scale.x, cache.scale.y, cache.scale.z)
object_bs.radius *= object_scale * ((obj_base.construction && obj_base.construction.boundingSphere_radius_scale) || 1)//((obj_base.character_index != null) ? 0.5 : 1))

// c: the center point of the sphere
c.copy(object_bs.center)
// r: its radius
var r = object_bs.radius

null_move = !moved_final.x && !moved_final.y && !moved_final.z
mov_delta_length = moved_final.length()
moved_dis_max = subject_bs.radius + mov_delta_length

subject_bb_moved.copy(subject_bb).translate(moved_final).center(s_bb_moved)

var dis = s.distanceTo(c)
//if (para.filter_obj) DEBUG_show((ABC.distanceTo(subject.position)+'/'+XYZ.distanceTo(subject.position))+'\n'+dis+'\n'+subject.position.distanceTo(cache.position)+'\n'+(dis-subject.position.distanceTo(cache.position))+'\n'+s.length()+'\n'+c.length()+'\n'+Date.now())

// NOTE: _dis (distance between mesh sorted position and subject's current position) is scaled by obj's scale (object_scale).
var _dis = 0
var _collision_by_mesh_sort_range = 0
if (dis < (moved_dis_max + r) + ((that.use_local_mesh_sorting && local_mesh_sorting_range_buffer) || Math.min((obj.collision_by_mesh_sort_range||64)*0.5, r))) {
  cache.updateMatrixWorld()
  if (!that.use_octree && obj.collision_by_mesh_sort_range && !para.collision_by_mesh_disabled) {
    _v3.copy(s_bb).applyMatrix4(_m4.getInverse(cache.matrixWorld))
    let _index = (_subject.obj._index != null) ? _subject.obj._index+1 : 0;
    let mesh_sorted = obj.mesh_sorted = obj.mesh_sorted_list[_index] = obj.mesh_sorted_list[_index] || {};
if (that.use_local_mesh_sorting) {
  _dis = (mesh_sorted.position) ? Math.sqrt(Math.pow(mesh_sorted.position.x-_v3.x,2)+Math.pow(mesh_sorted.position.z-_v3.z,2)) + mov_delta_length/object_scale : 9999
  if (_dis > local_mesh_sorting_range_buffer/object_scale) {
    _collision_by_mesh_sort_range = Math.max(Math.min(Math.ceil(subject_bs.radius||10 + Math.sqrt(moved_final.x*moved_final.x+moved_final.z*moved_final.z)), obj.collision_by_mesh_sort_range) + local_mesh_sorting_range_buffer, 8) / object_scale
    mesh_sorted.position = _v3.clone()

    if (that.use_octree) {}
    else {
//    let _t = performance.now()

      mesh_sorted.index_list = that.mesh_sorting_worker.tree[obj.object_index].search({
minX: _v3.x-_collision_by_mesh_sort_range,
minY: _v3.z-_collision_by_mesh_sort_range,
maxX: _v3.x+_collision_by_mesh_sort_range,
maxY: _v3.z+_collision_by_mesh_sort_range
      }).map(function (a) { return a.index; });

//    console.log("Mesh sorted:" + obj._index + "," + mesh_sorted.index_list.length + "/" + (_collision_by_mesh_sort_range) + "-" + Math.round(performance.now()-_t) + "ms/" + Date.now())
    }
  }
}
else {
}
  }
}

if (dis > moved_dis_max+r) {
//if (obj.character_index == 0) DEBUG_show(dis+'/'+(moved_dis_max+r),0,1)
//if (obj.character_index==0 && para.filter_obj) DEBUG_show(dis+'/'+(moved_dis_max+r),0,1)
  return
}


if (obj._obj_proxy.boundingBox) {

  let move_blocked
  moved_before_bb_check.copy(moved_final)

  let hit_moved_once
  let collision_by_mesh = !para.collision_by_mesh_disabled && obj.collision_by_mesh

let skip_bb_index_list = []
obj._obj_proxy.boundingBox_list.some(function (bb, bb_idx) {
  if (skip_bb_index_list.indexOf(bb_idx) != -1)
    return

  if (para.filter_obj && !para.filter_obj(obj, bb, true)) {
    return
  }

  var _skip_ground_obj_check = skip_ground_obj_check || obj.skip_ground_obj_check

  if (!para.collision_centered) {
    object_bb.copy(bb).applyMatrix4(cache.matrixWorld)
  }
  else {
    _q.copy(center_rotate(subject.quaternion, true))
    object_bb.copy(bb).applyMatrix4(_m4.makeRotationFromQuaternion(_q2.copy(cache.quaternion).multiply(_q))).translate(_v3a.copy(subject.position).add(_v3.copy(cache.position).sub(subject.position).applyQuaternion(_q)))
  }
  object_bb.center(_c)

  var hit_moved = subject_bb_moved.isIntersectionBox(object_bb)
  if (hit_moved) {
    _bb.copy(subject_bb_moved).intersect(object_bb).size(_v3);
     if (_subject.mass && !null_move && obj.mass) {
      let feedback = 1 - obj.mass / (obj.mass + _subject.mass)
//feedback = 0.1
//if (subject._model_index > 0) DEBUG_show(feedback+'/'+Date.now())
/*
      var fb_x = Math.abs(moved_final.x) * feedback
      var fb_z = Math.abs(moved_final.z) * feedback
      feedback = Math.min(Math.min(fb_x,_v3.x)/fb_x, Math.min(fb_z,_v3.z)/fb_z)
*/
      _v3a.copy(moved_final).multiply(_v3b.set(feedback,1,feedback))
      object_bb.translate(_v3a)
      _c.add(_v3a)
      cache.position.add(_v3a.setY(0).applyQuaternion(center_rotate(subject.quaternion, false, true)))

      hit_moved = subject_bb_moved.isIntersectionBox(object_bb)
    }
  }

  if (!_skip_ground_obj_check && ((character.ground_obj && (character.ground_obj.obj == obj) && character.ground_obj.bb_y_scale[bb_idx]) || (Math.abs(subject_bb.min.y - object_bb.max.y) < 1))) {
    ray.set(_v3.copy(s_bb).setY(999), _v3a.set(0,-1,0))
    if (ray.intersectBox(object_bb, intersection)) {
      collision = true
      if (!ground_obj)
        ground_obj = character.ground_obj
      if (!ground_obj || (ground_obj.obj != obj))
        ground_obj = { obj:obj, bb_y_scale:{} }
      if (!ground_obj.bb_y_scale[bb_idx])
        ground_obj.bb_y_scale[bb_idx] = 1
    }
    else {
      if (character.ground_obj && (character.ground_obj.obj == obj))
        delete character.ground_obj.bb_y_scale[bb_idx]
    }
  }

// for simplicity
  if (!hit_moved) {
    if (bb.onaway) {
      let result = bb.onaway()
      if (result.blocked) {
collision = true
obj_hit = obj
moved_final.copy(_c).sub(s_bb).setY(0).normalize()
moved_before_bb_check.copy(moved_final)
subject_bb_moved.copy(subject_bb).translate(moved_final)
//collision_by_mesh = false
//DEBUG_show(moved_final.toArray())//,0,1)
move_blocked = true
return true
      }
    }
    return
  }
  else {
    hit_moved_once = true
    if (collision_by_mesh && !bb.oncollide && !bb.onaway)
      return
  }

  var hit = subject_bb.isIntersectionBox(object_bb)
//if (hit) DEBUG_show(Date.now())
//  _bb.copy(subject_bb).intersect(object_bb).size(_v3)
//  if (_v3.x<0.1 || _v3.y<0.1 || _v3.z<0.1) hit = false;

// intersected == intersection
  var intersected
  intersected = ray_normal.intersectBox(object_bb, intersection)
  if (!intersected) {
    ray.set(_v3.copy(_c).add(_v3a.copy(d).multiplyScalar(999)), _v3a.copy(d).negate())
    intersected = ray.intersectBox(subject_bb, intersection)
    if (intersected && !hit)
      object_bb.clampPoint(intersected,intersected)
  }

  if (!hit && !hit_moved && !intersected)
    return

  if (!intersected) {
    _d.copy(_c).sub(s_bb).normalize()
    ray.set(_v3.copy(s_bb).add(_v3a.copy(_d).multiplyScalar(-999)), _d)
    intersected = ray.intersectBox(object_bb, intersection)
  }

  if (!intersected)
    return

  if (!hit) {
    if (subject_bb.distanceToPoint(intersected) > mov_delta_length)
      return
  }

  _moved_final.copy(moved_final)
  if (bb.oncollide) {
    if (bb.skip_bb_index_list)
      skip_bb_index_list = skip_bb_index_list.concat(bb.skip_bb_index_list)

    let result = bb.oncollide({subject:subject, mov_delta:moved_final, null_move:null_move, skip_ground_obj_check:_skip_ground_obj_check, obj:obj, object_bb:object_bb, bb_idx:bb_idx, intersected:intersected, _moved_final:_moved_final, ground_obj:ground_obj})
    if (result) {
      if (result.returnValue != null) {
//DEBUG_show(Date.now())
        return result.returnValue
      }
      if (result.ground_obj)
        ground_obj = result.ground_obj
    }
  }
  else if ((!ground_obj || (ground_obj.obj == obj)) && (Math.abs(intersection.y - object_bb.max.y) < 0.001) && (intersection.y <= subject_bb.min.y + _moved_final.y + 2)) {
//console.log(intersection.y+'/'+object_bb.max.y)
    if (!_skip_ground_obj_check) {
      if (!ground_obj || (ground_obj.obj != obj))
        ground_obj = { obj:obj, bb_y_scale:{} }
      ground_obj.bb_y_scale[bb_idx] = 1
//console.log(bb_idx)
    }
  }
  else if (hit) {
    _bb.copy(subject_bb).intersect(object_bb)
    let y_diff = _bb.max.y - _bb.min.y

    let ground = ground_obj || character.ground_obj
    if (ground && (ground.obj == obj) && object_bb.containsPoint(_v3.copy(c).setY(_c.y))) {
      _moved_final.y = y_diff
    }
    else {
// push character back
      _moved_final.copy(s_bb).sub(_c)//.normalize().multiplyScalar(mov_delta_length)

      let xz = Math.sqrt(_moved_final.x*_moved_final.x + _moved_final.z*_moved_final.z)
      if (_bb.max.x - _bb.min.x < _bb.max.z - _bb.min.z) {
        _moved_final.x = (_moved_final.x) ? ((_moved_final.x>0)?1:-1)*xz : 0
        _moved_final.z = 0
      }
      else {
        _moved_final.z = (_moved_final.z) ? ((_moved_final.z>0)?1:-1)*xz : 0
        _moved_final.x = 0
      }
      if ((y_diff > (subject_bb.max.y - subject_bb.min.y)/2) || (y_diff > (object_bb.max.y - object_bb.min.y)/2))
        _moved_final.y = 0
      _moved_final.normalize().multiplyScalar(Math.max(mov_delta_length,1))
    }
  }
  else {
    _moved_final.copy(intersected).sub(_bb.copy(subject_bb).clampPoint(intersected, _v3)).multiplyScalar(0.75)
    if (_bb.translate(_moved_final).isIntersectionBox(object_bb) || (mov_delta_length/4 > _moved_final.length())) {
// blocked, for simplicity
      _moved_final.set(0,0,0)
    }
  }

  if (para.filter_obj && !para.filter_obj(obj, bb)) {
    return
  }

  collision = true
  obj_hit = obj
  moved_final.copy(_moved_final)
});

if (collision_by_mesh) {// && hit_moved_once) {
  collision_by_mesh_checked = true

// NOTE: I give up changing the mesh collision system to work with x/z rotation of the object (for now at least). It requires too many changes on existing codes, especially the part to get ground_y.
  let _t_ = performance.now();
  let result

  let subject_bb_MS = subject_bb
  let moved_before_bb_check_MS = moved_before_bb_check
  if (use_bb_translate_offset) {
    subject_bb_MS = subject_bb.clone().translate(bb_translate_offset)
    moved_before_bb_check_MS = moved_before_bb_check.clone().sub(bb_translate_offset)
  }


  null_move = !moved_before_bb_check_MS.x && !moved_before_bb_check_MS.y && !moved_before_bb_check_MS.z;
  const subject_bb_to_collide = (null_move) ? subject_bb_MS : subject_bb_moved;
  let mov_octree, result_octree, ground_octree;
  if (that.use_octree) {
// https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
    const THREEX = MMD_SA.THREEX.THREEX;

    const obj_m4_inv = _m4.getInverse(cache.matrixWorld);

    const height = subject_bb_to_collide.max.y - subject_bb_to_collide.min.y;
    const radius = height/8 * (obj_base.octree_collider_radius||1) *1.5;

    const pos = new THREE.Vector3();
    subject_bb_to_collide.center(pos);
    pos.y = subject_bb_to_collide.min.y;

    const c = new THREEX.Capsule( new THREEX.Vector3( 0, radius, 0 ), new THREEX.Vector3( 0, Math.max(height-radius*2, radius), 0 ), radius );
    c.translate(pos);

    c.start.applyMatrix4(obj_m4_inv);
    c.end.applyMatrix4(obj_m4_inv);
    c.radius /= object_scale;

    const mov_extended = _v3.copy(moved_before_bb_check_MS).add(cache.position).applyMatrix4(obj_m4_inv).setY(0).normalize();

    const octree = obj_base.octree;

    const ground_upper_limit = height/2;

    const ray_origin = _v3a.copy(pos);
    ray_origin.y += ground_upper_limit;
    const ray = new THREEX.Ray(ray_origin, new THREEX.Vector3(0,-1,0)).applyMatrix4(obj_m4_inv);

    const grounds = [];
    ground_octree = octree.rayIntersect(ray);
    grounds.push(ground_octree);

    ray_origin.copy(pos).add(mov_extended.multiplyScalar(radius));
    ray_origin.y += ground_upper_limit;
    grounds.push(octree.rayIntersect(ray));

    pos.applyMatrix4(obj_m4_inv).applyQuaternion(cache.quaternion);

    let ground_y = -9999;
    const grounded = [];
    grounds.forEach(g=>{
      if (!g) return;

      g.position.applyQuaternion(cache.quaternion);

      const y = g.position.y//+0.1;
      if (y - pos.y > ground_upper_limit) return;

      g.triangle.getNormal(_v3).applyQuaternion(cache.quaternion);
      if (_v3.y < 0.5) return;

      grounded.push(g);

      if (y < pos.y) return;

      ground_y = Math.max(y, ground_y);
    });

    const mov_offset = _v3b.set(0,0,0);
    if (ground_y > -9999) {
//DEBUG_show((ground_y - pos.y)+'/'+Date.now())
      mov_offset.y += ground_y - pos.y;
      c.translate(mov_offset);
      moved_before_bb_check.add(mov_offset.multiply(cache.scale));
    }

    result_octree = octree.capsuleIntersect(c);

    mov_octree = _v3a.set(0,0,0);
    if (result_octree) {
      mov_octree.add( result_octree.normal.multiplyScalar( result_octree.depth ) );
//DEBUG_show(mov_octree.toArray().join('\n'))
      if (!grounded.length) {
//applyMatrix4(obj_m4_inv)
        const face_v3 = MMD_SA.TEMP_v3.set(0,0,1).applyQuaternion(subject.quaternion).applyQuaternion(MMD_SA.TEMP_q.copy(cache.quaternion).conjugate()).normalize().multiplyScalar(result_octree.depth*1.5).negate();
        mov_octree.add(face_v3);
//DEBUG_show(result_octree.depth,0,1);
      }
	}

    result = {
      updated: !!result_octree,
      ground_y: (ground_octree) ? ground_octree.position.y : -9999,
    };
//DEBUG_show(result.updated+'/'+(result_octree.depth||0)+'/'+result.ground_y+'\n'+pos.toArray().join('\n'))
  }
  else {
    result = subject_bb_to_collide.intersectObject(obj, subject_bb_MS);
  }


  let pos_in_obj = new THREE.Vector3().copy(subject.position).applyMatrix4(_m4.getInverse(cache.matrixWorld));

  let ground_y;
  if (result.ground_y > -999) {
    ground_y = result.ground_y * object_scale + cache.position.y;

    let ground_y_current = ground_obj || character.ground_obj
    ground_y_current = ground_y_current && ground_y_current.bb_y_scale.mesh
//DEBUG_show(ground_y_current+'/'+Date.now())

// prevent big drop in height
    if ((ground_y_current != null) && (ground_y_current > ground_y+(obj.collision_by_mesh_drop_limit||999))) {
      result.bb_static_collided = result.updated = false
    }
// cancel drop if the ground is below certain limit
    else if ((obj.collision_by_mesh_ground_limit != null) && (ground_y < obj.collision_by_mesh_ground_limit)) {
      result.bb_static_collided = result.updated = false
    }
// ground_y+ fixes some possible glitches in ground level changes
    else if (!ground_obj || (ground_obj.bb_y_scale.mesh == null) || (ground_obj.bb_y_scale.mesh < ground_y+3)) {
//if (ground_obj && ground_obj.bb_y_scale.mesh > ground_y) DEBUG_show(ground_y_current+'/'+ground_obj.bb_y_scale.mesh+'/'+ground_y+'/'+Date.now())
      ground_obj = { obj:obj, bb_y_scale:{ mesh:ground_y } }
      collision = true
//DEBUG_show(ground_obj.bb_y_scale.mesh+'/'+Date.now())
    }
    else {
      ground_y = null
    }
  }

  if (that.use_octree) {
    if (result_octree && result.updated) {
      collision = true;
      obj_hit = obj;

      mov_octree.applyQuaternion(cache.quaternion).multiply(cache.scale);
      moved_final.copy(moved_before_bb_check).add(mov_octree);
//console.log(moved_final.toArray(), ground_y);
      if (ground_y) {
        that.character.ground_normal = (that.character.ground_normal || new THREE.Vector3(0,1,0)).lerp(ground_octree.triangle.getNormal(_v3).applyQuaternion(cache.quaternion), 0.5);
      }
    }
    else {
      moved_final.copy(moved_before_bb_check);
    }
    return;
  }

// old collision 01

}

  return;
}


// Calculate ray start's offset from the sphere center
//float3 p = s - c;
p.copy(s).sub(c);

//float rSquared = r * r;
//float p_d = dot(p, d);
var rSquared// = r * r;
var p_d = p.dot(d);

// The sphere is behind or surrounding the start point.
//if(p_d > 0 || dot(p, p) < rSquared)
// return NO_COLLISION;
if (p_d > 0)// || p.dot(p) < rSquared)
  return

if (subject_bs.intersectsSphere(object_bs)) {
  collision = true
  obj_hit = obj
  moved_final.copy(p).normalize().multiplyScalar(((r+subject_bs.radius)-dis)*0.95)
  return
}

// Flatten p into the plane passing through c perpendicular to the ray.
// This gives the closest approach of the ray to the center.
//float3 a = p - p_d * d;
a.copy(p).sub(_v3.copy(d).multiplyScalar(p_d));

//float aSquared = dot(a, a);
var aSquared = a.dot(a);

// AT: adding radius of both, since this case is a moving sphere instead of just a line
rSquared = r+subject_bs.radius;
rSquared *= rSquared;

//DEBUG_show(["s:"+s.toArray(),"d:"+d.toArray(),"c:"+c.toArray(),"r:"+r,"p:"+p.toArray(),"p_d:"+p_d,"a:"+a.toArray(),aSquared,rSquared].join("\n"))

// Closest approach is outside the sphere.
//if(aSquared > rSquared)
//  return NO_COLLISION;
if (aSquared > rSquared)
  return

// Calculate distance from plane where ray enters/exits the sphere.    
//float h = sqrt(rSquared - aSquared);
var h = Math.sqrt(rSquared - aSquared);

// Calculate intersection point relative to sphere center.
//float3 i = a - h * d;
i.copy(d).multiplyScalar(-h).sub(a);

//float3 intersection = c + i;
//float3 normal = i/r;
intersection.copy(c).add(i);
//normal.copy(i).multiplyScalar(1/r);

// We've taken a shortcut here to avoid a second square root.
// Note numerical errors can make the normal have length slightly different from 1.
// If you need higher precision, you may need to perform a conventional normalization.
//return (intersection, normal);

dis = intersection.distanceTo(s)
if (dis > moved_dis_max)
  return

collision = true
obj_hit = obj
moved_final.copy(intersection.sub(s))
  });

  this.grid_blocks.hide()

  if (!ground_obj || !ground_obj.bb_y_scale.mesh)
    this.character.ground_normal = null

//if (collision && obj_hit) console.log(mov_delta.toArray()+'\n'+moved_final.toArray())
  return ((collision) ? { moved_final:moved_final.applyQuaternion(center_rotate(subject.quaternion, false, true)), obj_hit:!!obj_hit, ground_obj:ground_obj, collision_by_mesh_checked:collision_by_mesh_checked, collision_by_mesh_failed:collision_by_mesh_failed } : { collision_by_mesh_checked:collision_by_mesh_checked, collision_by_mesh_failed:collision_by_mesh_failed });
};
  })();

  d.check_ray_intersection = (function () {
const THREEX = MMD_SA.THREEX.THREEX;

var object_bs  = new THREE.Sphere();
var object_bb  = new THREE.Box3();

var c = new THREE.Vector3();

var ray = new THREE.Ray();
var intersection = new THREE.Vector3();

var rayX = new THREEX.Ray();
var _m4 = new THREEX.Matrix4()

var _v3 = new THREE.Vector3();

return function (s, dir, para) {
  if (!para)
    para = {}

  var that = this

  var dis = dir.length()
  ray.set(s, _v3.copy(dir).normalize())

  var intersected = []
  var nearest = { distance:999999 }

  this.object_list.concat(MMD_SA.THREEX._object3d_list_||[]).forEach(function (obj, idx) {
if (obj.is_dummy)
  return

var cache = obj._obj
if (!cache.visible)
  return

if (obj.no_collision)
  return

if (para.filter && para.filter(obj))
  return

var obj_base = obj._obj_base || MMD_SA_options.Dungeon.object_base_list[obj.object_index];

object_bs.copy(obj._obj_proxy.boundingSphere)
object_bs.center.add(cache.position)
object_bs.radius *= Math.max(cache.scale.x, cache.scale.y, cache.scale.z) * ((obj_base.construction && obj_base.construction.boundingSphere_radius_scale) || ((obj_base.character_index) ? 0.5 : 1))

// c: the center point of the sphere
c.copy(object_bs.center)
// r: its radius
var r = object_bs.radius

if (s.distanceTo(c) > dis+r)
  return

if (!obj._obj_proxy.boundingBox)
  return

var skip_bb_index_list = [];
obj._obj_proxy.boundingBox_list.forEach(function (bb, bb_idx) {
  if (obj_base.construction && obj_base.construction.boundingBox_list && obj_base.construction.boundingBox_list[bb_idx] && obj_base.construction.boundingBox_list[bb_idx].no_camera_collision)
    return

  if (skip_bb_index_list.indexOf(bb_idx) != -1)
    return

  object_bb.copy(bb).applyMatrix4(cache.matrixWorld)
  if (!ray.intersectBox(object_bb, intersection))
    return

  var i_dis = s.distanceTo(intersection)
  if (i_dis > dis)
    return

  if (bb.skip_bb_index_list)
    skip_bb_index_list = skip_bb_index_list.concat(bb.skip_bb_index_list)

  const i_obj = { distance:i_dis, obj:obj, bb_index:bb_idx, oncollide:!!bb.oncollide }
  intersected.push(i_obj)
  if (nearest.distance > i_dis)
    nearest = i_obj
});

if (!obj_base.octree) return;

rayX.copy(ray);
rayX.applyMatrix4(_m4.copy(cache.matrixWorld).invert());
const octree_result = obj_base.octree.rayIntersect(rayX, true);
if (octree_result) {
  const i_dis = s.distanceTo(octree_result.position.applyMatrix4(cache.matrixWorld));
  if (i_dis > dis)
    return;

  const i_obj = { distance:i_dis, obj:obj };
  intersected.push(i_obj);
  if (nearest.distance > i_dis)
    nearest = i_obj;
}
  });

  return ((intersected.length && !nearest.oncollide) ? { nearest:nearest, intersected:intersected } : null)
};
  })();

  d.check_mouse_on_object = (function () {
var vectorMouse = new THREE.Vector3();

var bs = new THREE.Sphere()
var s, d, c, p, a, i, intersection, normal
s = new THREE.Vector3()
d = new THREE.Vector3()
c = new THREE.Vector3()
p = new THREE.Vector3()
a = new THREE.Vector3()
//i = new THREE.Vector3()
intersection = new THREE.Vector3()
//normal = new THREE.Vector3()

var ray = new THREE.Ray()
var bb = new THREE.Box3()

var _v3  = new THREE.Vector3()
var _v3a = new THREE.Vector3()

return function (e, obj_list) {
  var list_all_clickable;
  if (!e) {
    list_all_clickable = true
    e = { button:0 }
  }

  if (e.button !== 0) return;

  var that = this

  var camera = MMD_SA._trackball_camera.object

  if (list_all_clickable) {
    vectorMouse.set(0, 0, 0.5);
  }
  else {
// https://github.com/mrdoob/three.js/issues/5587
    vectorMouse.set(
   (e.clientX/B_content_width)  * 2 - 1
 ,-(e.clientY/B_content_height) * 2 + 1
 ,0.5
    );
    vectorMouse.unproject(camera).sub(camera.position).normalize();
//DEBUG_show(vectorMouse.toArray())
  }

  var obj_sorted = []
  var click_range_default = this.grid_size * this.view_radius * 0.5

  if (!obj_list)
    obj_list = this.object_list_click

  var is_dblclick = (e.type == "dblclick")

  var PC_pos = this.character.pos

  obj_list.forEach(function (obj) {
if (!obj.onclick)
  return

var cache = obj._obj
if (!cache.visible)
  return

var click_range = []
obj.onclick.forEach(function (click) {
  click_range.push((!list_all_clickable && (is_dblclick != !!click.is_dblclick)) ? 0 : (click.click_range || click_range_default) + ((click.boundingSphere_included) ? obj._obj_proxy.boundingSphere.radius*Math.max(cache.scale.x,cache.scale.y,cache.scale.z) : 0))
});

obj._click_index = -1
var dis = PC_pos.distanceToSquared(_v3.copy(obj._obj_proxy.boundingSphere.center).multiply(cache.scale).add(cache.position))
for (var i = 0, i_max = click_range.length; i < i_max; i++) {
  if (dis <= click_range[i]*click_range[i]) {
    obj._click_index = i
    break
  }
}
//console.log(obj,dis,click_range)
if (obj._click_index == -1)
  return

obj_sorted.push(obj)
obj._dis_from_PC = dis
  });

  if (!obj_sorted.length) {
//DEBUG_show("(no object clickable)")
    return
  }

  if (!list_all_clickable) {
    obj_sorted.sort(function (a,b) { return (a._sort_weight || b._sort_weight) ? (b._sort_weight||0)-(a._sort_weight||0): a._dis_from_PC - b._dis_from_PC; });
  }

// https://gamedev.stackexchange.com/questions/96459/fast-ray-sphere-collision-code
// s: the start point of the ray
  s.copy(camera.position)
// d: a unit vector in the direction of the ray. 
  d.copy(vectorMouse)
//console.log(camera)
//console.log([s.toArray(), vectorMouse.toArray(), camera.up.toArray()].join("\n"))

  var obj_clicked_list = []

  for (var k = 0, k_max = obj_sorted.length; k < k_max; k++) {
let obj = obj_sorted[k]
let cache = obj._obj

intersection.set(0,0,0)
if (obj._obj_proxy.boundingBox) {
  let bb_list = obj._obj_proxy.boundingBox_list || [obj._obj_proxy.boundingBox];

  let click = obj.onclick[obj._click_index]
  bb_list.some(function (b3, bb_idx) {
    if (bb_idx) {
      if (!click.func && !click.event_id && (!click.events || !click.events[bb_idx]))
        return
    }

    bb.copy(b3)
    if (obj._mesh.bones) {
      let _mesh = obj._mesh._mesh_parent || obj._mesh
      let b_center = _mesh.bones_by_name["センター"]
      if (b_center.pmxBone)
        bb.translate(_v3.copy(b_center.position).sub(_v3a.fromArray(b_center.pmxBone.origin)))
    }
    bb.applyMatrix4(cache.matrixWorld)
//console.log(bb)
    let e = click.events && click.events[bb_idx]
    if (e) {
      if ((e.is_dblclick != null) && (is_dblclick != e.is_dblclick))
        return
      let click_range = e.click_range
      if (click_range && (bb.center(_v3).distanceToSquared(PC_pos) > click_range*click_range))
        return
    }

    ray.set(s,d)
    if (list_all_clickable || ray.intersectBox(bb, intersection)) {
      let _obj = {}
      _obj.obj = obj
      if (bb_list.length > 1)
        _obj.bb_index = bb_idx
      obj_clicked_list.push(_obj)

      if (list_all_clickable) {
         bb.center(_v3)
         _v3.y = bb.min.y + Math.min(bb.max.y+3, 25)
        _obj.pos = _v3.clone()
      }
      else
        return true
    }
  });

  if (!list_all_clickable && obj_clicked_list.length)
    break
}
else if (list_all_clickable) {
  obj_clicked_list.push({obj:obj})
}
else {
  bs.copy(obj._obj_proxy.boundingSphere)
  bs.center.add(cache.position)
  bs.radius *= Math.max(cache.scale.x, cache.scale.y, cache.scale.z)

// collision detetcion START
// c: the center point of the sphere
  c.copy(bs.center)
// r: its radius
  let r = bs.radius

// Calculate ray start's offset from the sphere center
//float3 p = s - c;
  p.copy(s).sub(c);

//float rSquared = r * r;
//float p_d = dot(p, d);
  let rSquared = r * r;
  let p_d = p.dot(d);

// The sphere is behind or surrounding the start point.
//if(p_d > 0 || dot(p, p) < rSquared)
// return NO_COLLISION;
  if (p_d > 0 || p.dot(p) < rSquared)
    continue

// Flatten p into the plane passing through c perpendicular to the ray.
// This gives the closest approach of the ray to the center.
//float3 a = p - p_d * d;
  a.copy(p).sub(_v3.copy(d).multiplyScalar(p_d));

//float aSquared = dot(a, a);
  let aSquared = a.dot(a);

// Closest approach is outside the sphere.
//if(aSquared > rSquared)
//  return NO_COLLISION;
  if (aSquared > rSquared)
    continue

  obj_clicked_list.push({obj:obj})
  break

// Calculate distance from plane where ray enters/exits the sphere.    
//float h = sqrt(rSquared - aSquared);
//var h = Math.sqrt(rSquared - aSquared);

// Calculate intersection point relative to sphere center.
//float3 i = a - h * d;
//i.copy(d).multiplyScalar(-h).sub(a);

//float3 intersection = c + i;
//float3 normal = i/r;
//intersection.copy(c).add(i);
//normal.copy(i).multiplyScalar(1/r);

// We've taken a shortcut here to avoid a second square root.
// Note numerical errors can make the normal have length slightly different from 1.
// If you need higher precision, you may need to perform a conventional normalization.
//return (intersection, normal);
// collision detection END
}
  }

  if (list_all_clickable) {
    return obj_clicked_list
  }

  if (!obj_clicked_list.length)
    return

  var obj_clicked = obj_clicked_list[0].obj
  var bb_index_clicked = obj_clicked_list[0].bb_index

//  if (obj_clicked)
//    DEBUG_show(obj_clicked.object_index)
//  else
//    DEBUG_show("(nothing clicked)")

  var click = obj_clicked.onclick[obj_clicked._click_index]
  if (click.func) {
    click.func(e, intersection, bb_index_clicked)
  }
  else {
    this._event_active.obj = obj_clicked
    this.run_event((click.events && click.events[bb_index_clicked] && click.events[bb_index_clicked].id) || click.event_id)
  }

  return true
};
  })();


  (function () {
var d = MMD_SA_options.Dungeon

var obj_character = {
  _sort_weight:-99
 ,onclick:[{ is_dblclick:true, click_range:320, func:function (e, intersected) {
    if (!MMD_SA.MMD.motionManager.para_SA.object_click_disabled)
      window.dispatchEvent(new CustomEvent('SA_Dungeon_character_clicked', { detail:{ target:e.target, intersected:intersected } }));
  }}]
};
obj_character._obj_proxy = new Object3D_proxy_base(obj_character);

var _boundingBox_expand
var _v3 = new THREE.Vector3()

var e_func = function (e) {
  if (d.object_click_disabled) {
    return
  }

  var is_dblclick = (e.type == "dblclick")

  var obj_list
  if ((is_dblclick == obj_character.onclick[0].is_dblclick) && !MMD_SA.MMD.motionManager.para_SA.click_disabled) {
    obj_list = d.object_list_click.slice()

    const c_mesh = THREE.MMD.getModels()[0].mesh;
    obj_character._obj = obj_character._mesh = c_mesh;
    obj_list.push(obj_character);
  }
  else {
    obj_list = d.object_list_click
  }

  var clicked = d.check_mouse_on_object(e, obj_list)

  return clicked
};

var c_host = (returnBoolean("CSSTransform3DDisabledForContent")) ? document.getElementById("Lbody_host") : document.getElementById("Lbody")

var _mousedown_timestamp = 0

c_host.addEventListener( 'dblclick', function (e) {
  _mousedown_timestamp = 0
  if (e_func(e)) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

c_host.addEventListener( 'mousedown', function (e) {
  _mousedown_timestamp = performance.now()
//  e_func(e)
});
c_host.addEventListener( 'click', function (e) {
  if (performance.now()-_mousedown_timestamp < 500)
    e_func(e)
  _mousedown_timestamp = 0
});

if (c_host.ondblclick) {
  c_host._ondblclick = c_host.ondblclick
  c_host.addEventListener( 'dblclick', c_host.ondblclick)
  c_host.ondblclick = null
}

  })();


//SA_MMD_model_all_process_bones
//SA_MMD_model0_process_bones
window.addEventListener("SA_MMD_model_all_process_bones", (function () {

var d = MMD_SA_options.Dungeon
var c = d.character
var movement_v3 = new THREE.Vector3()
var rotation_v3 = new THREE.Vector3()
var _movement_v3 = new THREE.Vector3()
var movement_extra_v3 = new THREE.Vector3()
var _v3a = new THREE.Vector3()
var _v3b = new THREE.Vector3()
var _v3c = new THREE.Vector3()
var _q = new THREE.Quaternion()
var _b3 = new THREE.Box3()

var dir_block = [null, ["x"],["z"],["y"], ["x","z"],["x","y"],["z","y"]];

var mov_delta = d._mov_delta = (function () {

  function DataLast() {
    this.by_motion = {}
  }
  DataLast.prototype.init = function (para) {
    var m = this.by_motion[para._index]
    if (!m) {
      m = this.by_motion[para._index] = { acceleration_mov_last:[], t:9999 }
      for (var i = 0, i_max = para.mov_speed.length; i < i_max; i++)
        m.acceleration_mov_last[i] = new THREE.Vector3()
    }
    return this
  };
  DataLast.prototype.reset = function (para) {
    this.by_motion[para._index].acceleration_mov_last.forEach(function (v3) { v3.set(0,0,0); });
  };

  var data_last = []
  window.addEventListener("SA_Dungeon_onrestart", function () {
    for (var i = 0, i_max = MMD_SA_options.model_para_obj_all.length; i < i_max; i++) {
      data_last[i] = new DataLast()
    }
  });

  return function (model, para, t_diff, t) {
var mov_speed = para.mov_speed
if (typeof mov_speed == "number")
  return movement_v3.set(0,0,t_diff*para.mov_speed)

/*
var motion_id = para.motion_id
if (d.motion[para.motion_id])
  motion_id = d.motion[para.motion_id].name
//(MMD_SA.motion[model.skin._motion_index].filename == motion_id)
*/
if (t == null)
  t = (MMD_SA.motion[model.skin._motion_index].para_SA == para) ? model.skin.time - t_diff : 0
if (t < 0)
  t = 0

var d_last = data_last[model._model_index].init(para)
var m = d_last.by_motion[para._index]
if (t + t_diff < m.t) {
//DEBUG_show(para._index+':'+t+'/'+m.t,0,1)
  d_last.reset(para)
}
m.t = t + t_diff

var y_accelerated
var t_diff_remaining = t_diff
for (var i = 0, i_max = mov_speed.length; i < i_max; i++) {
  var _t = t
  var obj = mov_speed[i]
  var t_start = obj.frame/30

  var mov_delta_finished
  if (t >= t_start) {
    mov_delta_finished = true
  }
  else if (t + t_diff >= t_start) {
    t_diff = (t + t_diff) - t_start
    _t = t_start
  }
  else
    continue

  if (obj.acceleration) {
    var _t_diff = (_t + t_diff) - t_start
    movement_v3.copy(obj.speed).multiplyScalar(_t_diff).add(_v3a.copy(obj.acceleration).multiplyScalar(0.5*_t_diff*_t_diff))

    _v3b.copy(movement_v3)
    movement_v3.sub(m.acceleration_mov_last[i])
    m.acceleration_mov_last[i].copy(_v3b)

    if (obj.acceleration.y)
      y_accelerated = true
  }
  else {
    movement_v3.copy(obj.speed).multiplyScalar(t_diff)
  }

  if (mov_delta_finished)
    break

  t_diff = t_diff_remaining - t_diff
}

// if y has been accelerated, make sure y is non-zero as a "trick" to indicate it's a floating motion
if (y_accelerated && !movement_v3.y)
  movement_v3.y = Number.MIN_VALUE
//DEBUG_show(movement_v3.y,0,1)
//DEBUG_show(t+'/'+t_diff,0,1)
return movement_v3
  };
})();


// key events START
  d._key_pressed = {}

  document.addEventListener("keyup", function (e) {
var k = e.keyCode
d._key_pressed[k] = 0

var key_map = d.key_map[k]
if (!key_map) {
  return
}
key_map.is_down = 0
key_map._data = null

if (key_map.onkeyup && key_map.onkeyup())
  return

if (key_map.motion_duration) return

if (key_map.type_combat && d.character_combat_locked) {
  if (d.character_combat_locked == key_map.id) {
    return
  }
}

key_map.down = 0
  });

  d.SA_keydown = function (e) {
const k = e.detail.keyCode;
const _e = e.detail.e;
const k_code = (is_mobile && (k == 111)) ? 'Escape' : _e.code;

const result = {};
window.dispatchEvent(new CustomEvent("SA_Dungeon_keydown", { detail:{ e:_e, result:result } }));
if (result.return_value) {
  e.detail.result.return_value = true;
  return;
}

// use RAF_timestamp instead, making it easier to track if a key is pressed in the same frame
var t = RAF_timestamp//performance.now()
// Raw key press data. Avoid altering it besides keyboard events.
if (!d._key_pressed[k]) d._key_pressed[k] = t

var msg_branch_list = d.dialogue_branch_mode
if (msg_branch_list) {
// save some headaches and ignore alpha keys for now as it may affect movement and action
  if (!d._states.action_allowed_in_event_mode || ((k >= 96) && (k <= 96+9)) || ((k >= 48) && (k <= 48+9)))// || /Key[A-Z]/.test(k_code))
    e.detail.result.return_value = true;
  for (var i = 0, i_max = msg_branch_list.length; i < i_max; i++) {
    const branch = msg_branch_list[i]
    const sb_index = branch.sb_index || 0;
    const sb = MMD_SA.SpeechBubble.list[sb_index];

    if (branch.key == 'any') {
      if ((_e.keyCode >= 96) && (_e.keyCode <= 96+9)) {
        _e.key = (_e.keyCode - 96).toString();
      }
      const result = branch.func(e.detail.e);
      if (result) {
        e.detail.result.return_value = true;
        break;
      }
    }

    if (!is_mobile && (_e.ctrlKey || _e.shiftKey || _e.altKey)) break;

    const keys = (Array.isArray(branch.key)) ? branch.key : [branch.key];
    if (branch.is_closing_event) keys.push('Esc');

    const key_matched = keys.find(key=>{
if (typeof key == 'number') return (k == 96+key) || (k == 48+key);
if (key == 'Esc') return k_code == 'Escape';
return k_code == 'Key'+branch.key;
    });

    if (key_matched != null) {
      e.detail.result.return_value = true;

      if (MMD_SA_options.SpeechBubble_branch && MMD_SA_options.SpeechBubble_branch.confirm_keydown && (key_matched != sb._branch_key_) && (sb.msg_line.some(msg=>MMD_SA_options.SpeechBubble_branch.RE.test(msg)&&(RegExp.$1==key_matched)))) {
        sb._branch_key_ = key_matched
        sb._update_placement(true)
      }
      else {
        sb._branch_key_ = null;
        if (!branch.keep_dialogue_branch_list)
          d.dialogue_branch_mode = sb_index;

        branch.func?.();
        if ((branch.event_id != null) || (branch.branch_index != null) || (branch.event_index != null))
          d.run_event(branch.event_id, branch.branch_index, branch.event_index||0)
        else
          d.run_event()
      }
      break
    }
  }

  if (e.detail.result.return_value)
    return;
}
else {
  if (k_code == 'Escape') {
// headless_mode
    if (MMD_SA_options._XRA_headless_mode) {} else
    if (System._browser.overlay_mode == 0) {
      System._browser.overlay_mode = System._browser.overlay_mode_TEMP = 1;
    }
    else if (System._browser.overlay_mode_TEMP) {
      System._browser.overlay_mode = System._browser.overlay_mode_TEMP = 0;
    }
    else {
      document.getElementById('Ldungeon_inventory').style.visibility = (document.getElementById('Ldungeon_inventory').style.visibility == 'hidden') ? 'inherit' : 'hidden';
    }
    e.detail.result.return_value = true;
    return;
  }
}

var key_map = d.key_map[k]
if (d._states.dialogue_mode && !msg_branch_list && (!key_map || !/^(up|left|down|right)$/.test(key_map.id))) {
  d.run_event()
  e.detail.result.return_value = true
  return
}

if (!key_map) {
//  DEBUG_show(k,0,1)
  return
}

_keydown(e, key_map, t)
  };

  window.addEventListener("SA_keydown", d.SA_keydown);

  var _keydown = (function () {
    var e_dummy = {detail:{result:{}}};
    return function (e, key_map, t) {
if (!e)
  e = e_dummy

var first_press
if (!key_map.is_down) {
  first_press = true
  key_map.is_down = t
}

if ((key_map.type_movement && (d.character_movement_disabled || e.detail.e?.altKey || e.detail.e?.ctrlKey)) || (key_map.type_combat && d.character_combat_locked)) {
  e.detail.result.return_value = true
  return
}

if (key_map.ondown && key_map.ondown(e))
  return

if (!key_map.down) {
  if (!d.character.grounded && (key_map.type_movement || key_map.type_combat) && !key_map.motion_can_float) {
// save some headaches and prevent unnecessary motion change/etc from the default keydown events
    e.detail.result.return_value = true
    return
  }
  key_map.down = t
  if (first_press && key_map.onfirstpress && key_map.onfirstpress(e))
    return
}

e.detail.result.return_value = true
    };
  })();

/*
function reset_key_map(id_list) {
  var keys
  if (id_list) {
    keys = []
    id_list.forEach(function (id) {
      keys.push(d.key_map_by_id[id])
    });
  }
  else
    keys = d.key_map_list

  keys.forEach(function (key_map) {
    key_map.down = 0
  });
}
*/
// key events END

var combat_para_default = (function () {
  var _v3a_cp = new THREE.Vector3()
  var _v3a = new THREE.Vector3()

  return {
  collision_by_mesh_disabled: true

 ,collision_centered: true

 ,filter_obj: function (obj, bb, simple_mode) {
    if (!obj.mass || !obj.hp)
      return false

    if (simple_mode)
      return true

    var attacker_index = this.combat_para.attacker.obj._index
    var attacker_combat_stats = this.combat_para.attacker.obj.combat_stats
// enforce PC (attack_index == -1) vs NPC (and vice versa)
//    if ((attacker_index == -1) ? false : (obj.character_index > 0)) return true

    var hit_obj = (bb.hp == null) ? obj : bb
    if (!hit_obj._combat_hit)
      hit_obj._combat_hit = {}

    var t = Date.now()
    var _hit = hit_obj._combat_hit[attacker_index] || {}
    var timestamp = _hit.timestamp || 0
// assuming no combat action hit range (same combat action index) is longer than 500ms
    var attack_ignored = _hit.combat_para && ((this.combat_para.para == _hit.combat_para.para) ? ((this.combat_para.index <= _hit.combat_para.index) && (t < timestamp+500)) : 0)//(t < timestamp+500))
//if (_hit.combat_para) DEBUG_show(JSON.stringify(this.combat_para.para)+'/'+Date.now()+'\n'+this.combat_para.index +','+ _hit.combat_para.index)
    if (!attack_ignored) {
      _hit = { combat_para:this.combat_para, timestamp:t }

      if (obj.character_index != null) {
        let vfx

        let combat_para = this.combat_para.para[this.combat_para.index]
        let hit_level = combat_para.hit_level || 1
        let model = THREE.MMD.getModels()[obj.character_index]
        let model_para = MMD_SA_options.model_para_obj_all[obj.character_index]
        let motion_para = MMD_SA.motion[model.skin._motion_index].para_SA

        let motion_prefix = (obj.character_index == 0) ? "PC " : "NPC-" + obj.character_index + " "

        let super_armor_level = (motion_para.super_armor && motion_para.super_armor.level) || 0

        let hit_motion, parried_level
        if (motion_para.combat_para) {
          if (d._combat_para.some(function(p){return(p.attacker.obj==obj);})) {
//DEBUG_show("Double HIT!",0,1)
//            hit_motion = "PC combat parry broken"
          }
          else {
            let frame_before_end = (combat_para.frame_range[1]-1) - this.combat_para.frame
            if (frame_before_end > 0) {
              let motion_frame = model.skin.time * 30 + Math.min(frame_before_end, 3)
              if (motion_para.combat_para.some(function(hit){return((motion_frame >= hit.frame_range[0]) && (motion_frame <= hit.frame_range[1]));})) {
//DEBUG_show("Double HITING!(" + (attacker_index+"vs"+obj._index) + ")",0,1)
                return false
              }
            }
          }
        }

        hit_obj._combat_hit[attacker_index] = _hit

        let super_armor_hit = (super_armor_level >= hit_level)

if (!super_armor_hit) {
        hit_motion = hit_motion || combat_para.hit_motion
        parried_level = motion_para.parry_level
        let NPC_parried_level = (obj.character_index != 0) && (obj.combat && obj.combat.parry_check(obj, this.combat_para))
        if (!parried_level) {
          if (obj.character_index == 0) {
            parried_level = motion_para.PC_parry_level
          }
          else {
            parried_level = ((motion_para.PC_parry_level || (!motion_para.motion_command_disabled && !motion_para.NPC_motion_command_disabled)) && NPC_parried_level) || 0
          }
        }
        if (parried_level) {
          if (parried_level >= hit_level) {
            hit_motion = motion_prefix + "combat parrying"
            vfx = "blocked"
          }
          else if (parried_level == hit_level - 1) {
            hit_motion = motion_prefix + "combat parry broken"
            vfx = "blocked"
          }
          else
            parried_level = 0
        }
}

        if (!parried_level) {
// damage
          if (d._states.combat) {
let damage = combat_para.damage
if (damage == null) {
  damage = (d._states.combat.enemy_list.length) ? Math.min(hit_level * 5, 20) * Math.min(1 + this.combat_para.index*0.2, 2) : 0
}
damage *= attacker_combat_stats.attack.scale * obj.combat_stats.defense.scale * ((super_armor_hit) ? (motion_para.super_armor.damage_scale || 0) : 1)
obj.hp_add(-damage)
//DEBUG_show(damage+'/'+Date.now())
if (damage && (obj.hp == 0)) {
  hit_motion = "PC combat hit down"
}
if ((damage > 0) || (!super_armor_hit && (damage == 0)))
  vfx = "hit"
          }
        }

        if (combat_para.SFX) {
          if (vfx) {
let para = { scale:1, speed:1, depth:1 }
if (combat_para.SFX.bone_to_pos) {
  let bone_to_pos = MMD_SA.get_bone_position(this.combat_para.attacker.obj._mesh, combat_para.SFX.bone_to_pos)
//console.log(bone_to_pos)
  _v3a_cp.copy(bone_to_pos)
  _v3a.copy(bone_to_pos).sub(obj._obj.position).setY(0)
  let radius = _v3a.length()
  _v3a_cp.sub(_v3a.normalize().multiplyScalar(Math.max(radius/2, radius-obj._obj.geometry.boundingSphere.radius)))

  para.pos = _v3a_cp.clone()
  if (combat_para.SFX.pos_offset)
    para.pos.add(combat_para.SFX.pos_offset)
}

let SFX_para = {}

if (combat_para.SFX.visual && combat_para.SFX.visual[vfx]) {
  if (combat_para.SFX.visual[vfx].sprite) {
    SFX_para.sprite = []
    combat_para.SFX.visual[vfx].sprite.forEach((s) => {
      SFX_para.sprite.push(Object.assign({}, para, s))
    });
  }
}
else {
  para.depth = null

  if (obj.combat_stats.hurt_vfx) {
    Object.assign(para, obj.combat_stats.hurt_vfx)
  }
  else {
    switch (vfx) {
      case "hit":
        para.name = "blood_01"
        break
      case "blocked":
        para.name = "hit_yellow_01"
        break
    }
  }
//  para.name = "blood_01"//"explosion_purple_01"//"hit_yellow_01"//
  if (hit_level == 1) {
    para.scale *= 0.5
    para.speed *= 2
  }
  else if (hit_level == 2) {
    para.scale *= 0.75
    para.speed *= 1.5
  }
  else if (hit_level > 3) {
    para.scale *= 1.5
    para.speed *= 1
  }

  SFX_para.sprite = [para];
}

model_para._SFX_one_time = model_para._SFX_one_time||[];
model_para._SFX_one_time.push(SFX_para);
//d.sprite.animate(para.name, para)
//console.log(_v3a_cp.clone())

if (combat_para.SFX.sound) {
  let sound = combat_para.SFX.sound[vfx]
  if (!sound)
    sound = { name:"hit-1" }
  let ao = d.sound.audio_object_by_name[sound.name]
  let mesh = this.combat_para.attacker.obj._mesh
  let spawn_id = sound.name + RAF_timestamp
  let po = ao.get_player_obj(mesh, spawn_id)
  if (!po) {
    ao.play(mesh, spawn_id)
  }
}
          }
        }

        if (super_armor_hit && !hit_motion)
          return

        if (!hit_motion) {
          switch (hit_level) {
case 1:
  hit_motion = motion_prefix + "combat hit small"
  break
case 2:
  hit_motion = motion_prefix + "combat hit medium"
  break
default:
  hit_motion = motion_prefix + "combat hit down"
          }
        }

        if (obj.character_index == 0) {
          this._attacker_list.push({ attacker:this._subject, hit_level:hit_level, motion_id:(d.motion[hit_motion] && d.motion[hit_motion].name) });
//DEBUG_show(hit_motion,0,1)
        }
        else {
          model_para._motion_name_next = (d.motion[hit_motion] && d.motion[hit_motion].name) || model_para.motion_name_default_combat
        }
      }
    }
    return true
  }

// ,_bb_expand: {x:0.5, y:0, z:0.5}
// ,_bb_translate: {x:0, y:0, z:0.5}
 ,_bb_expand: {x:(1+0.5)/_bb_xz_factor_-1, y:0, z:(1+0.5)/_bb_xz_factor_-1}
 ,_bb_translate: {x:0, y:0, z:0.5/_bb_xz_factor_}
  };
})();

if (MMD_SA_options.Dungeon_options.combat_para_default) {
  Object.assign(combat_para_default, MMD_SA_options.Dungeon_options.combat_para_default)
}

d.combat_para_process = function (attacker, combat_para_parent, frame) {
  combat_para_parent.combat_para.some(function (hit, idx) {
if ((frame >= hit.frame_range[0]) && (frame <= hit.frame_range[1])) {
  let hit_level = ((hit.hit_level && Math.min(hit.hit_level,3))||1)
  let sound_name = hit.sound_name || ("hit-" + hit_level)
  let ao = d.sound.audio_object_by_name[sound_name]
  if (!ao) {
    sound_name = "hit-1"
    ao = d.sound.audio_object_by_name[sound_name]
  }
  let mesh = attacker.obj._obj
  let spawn_id = sound_name+idx
  let po = ao.get_player_obj(mesh, spawn_id)
  if (!po || (Date.now() > po.timestamp+500)) {
    ao.play(mesh, spawn_id)
  }

  if (mesh._model_index == 0) {
    if ((hit_level > 1) && (frame > hit.frame_range[0] + Math.min(~~(hit.frame_range[1]-hit.frame_range[0])/2, 3))) {
      let model_para = MMD_SA_options.model_para_obj;
      model_para._SFX_one_time = model_para._SFX_one_time||[];
      model_para._SFX_one_time.push({ id:'cs'+idx, camera_shake:{magnitude:hit_level*0.2,duration:250} });
//DEBUG_show('cs'+idx,0,1)
    }
  }

  d._combat_para.push({ attacker:attacker, para:combat_para_parent.combat_para, motion_id:combat_para_parent.motion_id, index:idx, frame:frame })
  return true
}
  });
};

var time_last, time_diff, gravity_obj
var time_falling
/*
// a "hack" to make target-locking camera works
var rot_camera = {
  ini_count: 0
 ,ini_count_max: 2
 ,get enabled () { return (this.ini_count > this.ini_count_max); }
 ,v3: new THREE.Vector3()
}
d._rot_camera = rot_camera
*/
window.addEventListener("SA_Dungeon_onrestart", function () {
  time_last = 0
  gravity_obj = { y:0, mov_y_last:0, time:1/30 }

//  rot_camera.ini_count = 0

  time_falling = -10
});

var key_pressed_stats = {}

return function (e) {
//  var model = e.detail.model
  var model = THREE.MMD.getModels()[0]

  var grid_para = d.get_para(c.xy[0], c.xy[1])
  if (grid_para.onstay && grid_para.onstay())
    return

  if (d.check_states())
    return

// use performance.now() from topmost window (the same window where RAF_timestamp comes from), as this value can be different among different child windows
  var t = SA_topmost_window.performance.now()

  time_diff = Math.min((time_last) ? (t - time_last)/1000 : 1/30, 1/20)
  time_last = t

// a trick to simulate a keydown event on every physically pressed key (since the usual keydown event can't detect multiple keys pressed at the same time)
  d.key_map_list.forEach(function (key_map) {
if (key_map.is_down && !key_map.down) {
  _keydown(null, key_map, t)
}
  });

  d._combat_para = []
  d._mov = []
  d.object_list.forEach(function (obj) {
    obj.animate && obj.animate(t)
    obj.motion && obj.motion.play(t)
  });
  window.dispatchEvent(new CustomEvent("SA_Dungeon_object_animation"));

  if (c.path_motion) {
    c.path_motion.play(t)
    return
  }

//DEBUG_show(model.mesh.position.toArray())
//DEBUG_show(MMD_SA_options.Dungeon.character.pos)

  var mov, rot, about_turn, motion_id, can_lock_target
  var rot_absolute, rot_absolute_with_camera
  var motion_reset = []
  var mm = MMD_SA.MMD.motionManager

  var model_para = MMD_SA_options.model_para_obj_all[model._model_index]
  var para_SA = MMD_SA.MMD.motionManager.para_SA//(MMD_SA.motion[(model.skin||model.morph||{})._motion_index] || MMD_SA.MMD.motionManager).para_SA
  var pos_delta = MMD_SA.bone_to_position.call(model, para_SA)

  var key_motion_disabled = c.mount_para

  var TPS_mode = c.TPS_mode, TPS_mode_in_action, TPS_character_rotated, TPS_use_last_rot, TPS_camera_ry, TPS_camera_lookAt, TPS_camera_lookAt_
//TPS_mode = true
  if (c.combat_mode) {
    let combat = d._states.combat
    let target_enemy_index = combat._target_enemy_index
    if (target_enemy_index >= 0) {
      let enemy = combat.enemy_list[target_enemy_index]
      if (enemy.hp) {
        TPS_mode = true
        TPS_camera_lookAt_ = enemy._obj.position
      }
      else {
        do {
          if (++target_enemy_index >= combat.enemy_list.length)
            target_enemy_index = 0
          enemy = combat.enemy_list[target_enemy_index]
          if (enemy.hp)
            break
        } while (target_enemy_index != combat._target_enemy_index);
        if (target_enemy_index == combat._target_enemy_index) {
          combat._target_enemy_index = -1
        }
        else {
          combat._target_enemy_index = target_enemy_index
          TPS_mode = true
          TPS_camera_lookAt_ = enemy._obj.position
        }
      }
    }
  }
  c.TPS_camera_lookAt_ = TPS_camera_lookAt_

  var key_para  = { t:t }

// check if the upcoming motion change is .motion_command_disabled
if (MMD_SA._force_motion_shuffle) DEBUG_show(Date.now())
  var motion_command_disabled = para_SA.motion_command_disabled
  if (TPS_mode && !motion_command_disabled && MMD_SA._force_motion_shuffle && MMD_SA_options.motion_shuffle_list_default) {
    motion_command_disabled = MMD_SA.motion[MMD_SA_options.motion_shuffle_list_default[0]].para_SA.motion_command_disabled
DEBUG_show(MMD_SA_options.motion_shuffle_list_default[0]+'/'+Date.now())
  }

  var PC = { obj:c, mass:c.mass }
  var key_used = {}
  var any_key_down
  d.key_map_list.forEach(function (k) {
    var key_map = k//d.key_map[k.keyCode]
// prevent dummy keys from running
    if (key_used[k.keyCode]) {
//DEBUG_show(k.keyCode_default,0,1)
      return
    }
    key_used[k.keyCode] = true

    var id = k.id

    if (para_SA.motion_command_disabled) {
      key_map.down = 0
    }

    var key_motion_running
    var motion_time = 0
    if (key_motion_disabled) {
      if (key_map.down && key_map.motion_id) {
        var _motion_index = MMD_SA_options.motion_index_by_name[d.motion[key_map.motion_id].name]
        var _mm = MMD_SA.motion[_motion_index]
        key_motion_running =  !key_map._motion_time || (key_map._motion_time < _mm.lastFrame_/30)
      }
      if (key_motion_running) {
        if (!key_map._motion_time)
          key_map._motion_time = 0
        key_map._motion_time += (t - key_map.down)/1000
        motion_time = key_map._motion_time
      }
      else
        key_map._motion_time = 0
    }
    else {
      key_motion_running = (mm.filename == key_map.motion_filename)
      if (key_motion_running) {// && (!key_map.type_movement || !d.character_movement_disabled)) {
        motion_time = model.skin.time
      }
    }

// For one-time motion (ie. key_map.motion_duration, eg. jump), let it finish naturally
    if (key_map.down && (!key_map.motion_duration || !key_motion_running)) {
      if (key_map.type_movement && d.character_movement_disabled) {
        key_map.down = 0
      }
      if (key_map.type_combat && (!d.character.combat_mode || (d.character_combat_locked && (d.character_combat_locked != key_map.id))) ) {
        key_map.down = 0
      }
    }

    var key_map_by_mode

    if (TPS_mode)
      key_map_by_mode = key_map.TPS_mode
    if (!key_map_by_mode)
      key_map_by_mode = key_map

    if (key_map_by_mode.motion_filename && key_map.down) {
let _k = key_pressed_stats[k.keyCode] = key_pressed_stats[k.keyCode] || { first_press:0, pressed:0 };
if (mm.filename != key_map_by_mode.motion_filename) {
  _k.first_press = key_map.is_down
}
if (key_map.is_down) {
  if (_k.first_press)
    _k.pressed = t - _k.first_press
}
else {
// reset first_press to prevent repeated presses
  _k.first_press = 0
}
key_para.pressed = _k.pressed
//if (/jump/i.test(key_map_by_mode.motion_filename)) DEBUG_show(_k.pressed)
    }

    var t_diff, motion_duration, t2, motion_para
    var result
    if (key_map.onupdate) {
      if (key_map.down) {
        motion_para = key_map_by_mode.motion_id && d.motion[key_map_by_mode.motion_id].para
        t_diff = Math.min((t - key_map.down)/1000, time_diff) * ((motion_para && motion_para.playbackRate_by_model_index && motion_para.playbackRate_by_model_index[0]) || 1)
        key_para.t_diff = t_diff
      }
      result = key_map.onupdate(key_para)
    }
    if (result) {
      if (result.TPS_mode != null) {
        if (!result.TPS_mode)
          key_map_by_mode = key_map
      }
      if (result.return_value)
        return
    }

    var key_map_data = key_map._data || {}

    if (key_map.down) {
      any_key_down = true
      motion_para = key_map_by_mode.motion_id && d.motion[key_map_by_mode.motion_id].para
      t_diff = Math.min((t - key_map.down)/1000, time_diff) * ((motion_para && motion_para.playbackRate_by_model_index && motion_para.playbackRate_by_model_index[0]) || 1)
// always define .motion_duration for non-looping motion
      motion_duration = key_map_by_mode.motion_duration// || (46/30)
      if (motion_duration) {
//DEBUG_show((key_map==d.key_map[para_SA.keyCode])+'/'+para_SA.keyCode,0,1)
        t2 = ((key_motion_running) ? motion_time - t_diff: 0) + ((result && result.t2_extended) || 0)
//if (t2 < motion_duration) t_diff = Math.min(t_diff, motion_duration-t2)
        if (t2 < 0) { t_diff -= t2; t2 = 0; }
//DEBUG_show(t2+'/'+t_diff+'/'+motion_time,0,1)
//DEBUG_show(t2+t_diff,0,1)
      }

      if (key_map_by_mode.motion_id) {
        motion_id = key_map_by_mode.motion_filename
      }

      if (!motion_duration || (t2 < motion_duration)) {
// not sure if it may be better to use a local variable (let _TPS_mode_in_action) here
        TPS_mode_in_action = TPS_mode_in_action || (key_map_by_mode == key_map.TPS_mode)

        if (key_map_by_mode.mov_speed) {
          let _mov = (mov) ? _movement_v3.copy(mov) : null
// .mov_speed can change among modes, safer to reassign it
          motion_para.mov_speed = key_map_by_mode.mov_speed
          mov = mov_delta(model, motion_para, t_diff, t2).multiplyScalar(key_map_data.scale||1)
          if (_mov) {
            let mov_length = mov.length()
            mov.lerp(_mov, 0.5).normalize().multiplyScalar(Math.max(_mov.length(), mov_length))
          }
        }

        if (pos_delta && key_motion_running)
          mov = (mov) ? mov.add(pos_delta) : movement_v3.copy(pos_delta)

//if (pos_delta && key_map.keyCode==105) { DEBUG_show(key_map.keyCode+'/'+Date.now()); console.log(key_map); }
        if (key_map_by_mode.rot_speed) {
          rot = rotation_v3.copy(key_map_by_mode.rot_speed).multiplyScalar(t_diff * (key_map_data.scale||1));
// v0.25.0
//          if (c.about_turn) rot.y *= -1;
        }

        if (TPS_mode_in_action) {
          if (!TPS_camera_lookAt_) {
            let camera = MMD_SA._trackball_camera
            TPS_camera_ry = Math.PI/2 - Math.atan2((camera.target.z-camera.object.position.z), (camera.target.x-camera.object.position.x))
            c.camera_TPS_rot.set(0,TPS_camera_ry,0)
          }
          else {
            TPS_camera_ry = c.camera_rotation_from_preset.y// + c.camera_TPS_rot.y
            c.camera_TPS_rot.set(0,0,0)
          }
//TPS_camera_ry=0

//TPS_character_rotated = key_map_by_mode.mov_to_rot_absolute
// case: use mov direction as rotation
          if (key_map_by_mode.mov_to_rot_absolute && (mov && (mov.x || mov.z))) {
            TPS_character_rotated = true
            rot = rotation_v3.set(0, Math.PI/2 - Math.atan2(mov.z, mov.x), 0)
            if (!TPS_camera_lookAt_) {
              let cy = (c.rot.y - TPS_camera_ry) % (Math.PI*2)
              let r_diff = (cy - rot.y) % (Math.PI*2)
              if (Math.abs(r_diff) > Math.PI)
                r_diff = r_diff + Math.PI*2 * ((r_diff>0)?-1:1)
              let r_max = Math.PI/8 * time_diff*30
              if (Math.abs(r_diff) > r_max) {
                rot.y = cy + r_max * ((r_diff>0)?-1:1)
              }
            }
//DEBUG_show(rot.y*180/Math.PI+'\n'+TPS_camera_ry*180/Math.PI+'\n'+Date.now())
          }
// case: no rotation from mov
          else if (key_map_by_mode.no_rotation) {
// if TPS_camera_lookAt_ exists (e.g. combat mode with target locked), use TPS_camera_lookAt_ rotation (will be added to rot later)
            if (TPS_camera_lookAt_) {
              rot = rotation_v3.set(0,0,0)
            }
// otherwise, use PC's current rotation (minus TPS_camera_ry which will be added to rot later)
            else {
              rot = rotation_v3.copy(c.rot)
              rot.y -= TPS_camera_ry
              if (motion_id && (motion_id == key_map_by_mode.motion_filename) && /^(.+)(forward|right|backward|left)$/.test(key_map_by_mode.motion_id)) {
                let dir = ["forward","right","backward","left"]
                let dir_index = Math.round(dir.indexOf(RegExp.$2) - (-rot.y / (Math.PI/2))) % 4
                if (dir_index < 0) dir_index += 4
                let motion = d.motion[RegExp.$1 + dir[dir_index]]
                if (motion)
                  motion_id = motion.name
//DEBUG_show(motion_id + '\n' + rot.y*(180/Math.PI)+'\n'+Date.now())
              }
            }
          }
          else {
            TPS_use_last_rot = true
//            rot = rotation_v3.set(0,0,0)
            rot = rotation_v3.copy(c.rot)
//            rot.y -= TPS_camera_ry
            if (mov)
              mov.applyEuler(rot)
          }
        }

        if (key_map_by_mode.about_turn != null) {
          if (c.about_turn == !key_map_by_mode.about_turn) {
            c.about_turn = key_map_by_mode.about_turn
            about_turn = true
          }
        }

        if (key_map.type_combat) {
          if (!d.character_combat_locked) {
            d.character_combat_locked = id
            can_lock_target = true
          }
          if (t2 && key_map_by_mode.combat_para) {
            d.combat_para_process(PC, key_map_by_mode, t2*30)
          }
        }

        if (key_map_by_mode.key_id_cancel_list) {
          key_map_by_mode.key_id_cancel_list.forEach(function (kc_id) {
            if (d.key_map_by_id[kc_id])
              d.key_map_by_id[kc_id].down = 0
          });
        }

        key_map.down = t
      }
      else {
        if (key_map_by_mode.motion_id)
          motion_reset.push(key_map_by_mode)

        var key_id_cancel_list = (key_map_by_mode.key_id_cancel_list) ? key_map_by_mode.key_id_cancel_list.slice() : []
        if (key_map.type_combat) {
          if (d.character_combat_locked == id) {
            d.character_combat_locked = null
            key_id_cancel_list.push("up","down","left","right")
          }
        }

        key_id_cancel_list.forEach(function (kc_id) {
          var km = d.key_map_by_id[kc_id]
          if (!d.character_movement_disabled && km.type_movement) {
            if (km.is_down)
              km.down = t
          }
        });

        key_map.down = 0
      }
    }
    else {
      if (key_map_by_mode.motion_id && (!key_map.type_movement || !d.character_movement_disabled)) {
        motion_reset.push(key_map_by_mode);
      }

      if (key_map.type_combat) {
        if (d.character_combat_locked == id) {
          d.character_combat_locked = null
        }
      }
    }
  });


  var reset_motion = !mov// || (!mov.x && !mov.y && !mov.z)
//if (reset_motion) DEBUG_show(Date.now())

//  var use_rot_camera
  c.camera_TPS_mode = TPS_mode//TPS_mode_in_action
//if (TPS_mode) DEBUG_show(Date.now())
  if (TPS_mode_in_action) {
    if (!mov)
      mov = movement_v3.set(0,0,0)
    c.about_turn = about_turn = false

    let rot_self = _v3b.set(0,0,0)
    TPS_camera_lookAt = TPS_camera_lookAt_
    if (TPS_use_last_rot) {
      TPS_camera_lookAt = TPS_camera_lookAt_ = null
    }
    else if (TPS_camera_lookAt) {
let cy = Math.PI/2 - Math.atan2((TPS_camera_lookAt.z-c.pos.z), (TPS_camera_lookAt.x-c.pos.x))
mov.applyEuler(_v3a.set(0,TPS_camera_ry+cy,0))

if (TPS_character_rotated) {
  rot.y += TPS_camera_ry
  rot_self.copy(rot)
}
rot.copy(_v3a.set(0,cy,0))

/*
if (++rot_camera.ini_count <= rot_camera.ini_count_max+1) {
  rot_camera.v3.set(0,0,0)
  MMD_SA.reset_camera()
}
use_rot_camera = true
*/
// always reset when not using rot_camera
MMD_SA.reset_camera()
    }
    else if (TPS_camera_ry) {
      _v3a.set(0,TPS_camera_ry,0)
      mov.applyEuler(_v3a)
      rot.add(_v3a)
    }

    c.rot.copy(rot_self)
    model.mesh.quaternion.setFromEuler(rot_self)
  }
//if (rot) DEBUG_show(rot.y*180/Math.PI+'\n'+c.rot.y*180/Math.PI+'\n'+TPS_mode_in_action+'\n'+(d.key_map_list.map(function(k){return((k.down)?k.id:0)}))+'\n'+para_SA._path+'\n'+Date.now())
//  if (!use_rot_camera && (mov || rot)) rot_camera.ini_count = 0;

  if (mov)
    mov.multiplyScalar((c.mount_para && c.mount_para.speed_scale) || c.speed_scale)

// check ground movement START
  var ground_y = d.get_ground_y(c.pos)
  if (c.ground_obj) {
    const g = c.ground_obj.obj;
    const g_obj = g._obj;
    for (var index in c.ground_obj.bb_y_scale) {
      ground_y = (index == "mesh") ? Math.max(((c.ground_obj.obj.collision_by_mesh_enforced)?-999:ground_y), c.ground_obj.bb_y_scale.mesh) : Math.max(ground_y, g._obj_proxy.boundingBox_list[index].max.y * g_obj.scale.y * c.ground_obj.bb_y_scale[index] + g_obj.position.y)
    }
  }
  var ground_y_delta = 0
  var floating = c.floating || (mov && mov.y)// || d.key_map[32].down
  var gravity_y = 0
  var time_to_ground
  const falling_height_threshold = MMD_SA_options.Dungeon_options.falling_height_threshold || 10;
  if (!floating) {
    let v = (gravity_obj.y + gravity_obj.mov_y_last) / gravity_obj.time
// downward is positive
    gravity_y = v * time_diff + 0.5 * (98*1.5) * time_diff * time_diff
//DEBUG_show(gravity_y+'/'+Date.now()+'\n'+gravity_obj.y +','+ gravity_obj.mov_y_last)
//if (gravity_y > 3) DEBUG_show(gravity_y,0,1)
//gravity_y=3
    if (c.pos.y > ground_y+falling_height_threshold) {
// http://www.math.com/students/calculators/source/quadratic.htm
      let _a = 0.5 * (98*1.5)
      let _b = v
      let _c = -(c.pos.y - ground_y)
      let _x0 = Math.pow(Math.pow(_b,2)-4*_a*_c,0.5)/2/_a;
      time_to_ground = -_b/2/_a + _x0
      if (!(time_to_ground > 0))
        time_to_ground = -_b/2/_a - _x0
    }
  }
  if (!floating || (c.pos.y < ground_y)) {
    ground_y_delta = (c.pos.y > ground_y + gravity_y) ? -gravity_y : ground_y - c.pos.y
// if ground_obj.mov and not free falling (up or down)
    if (c.ground_obj && c.ground_obj.mov && ((Math.abs(ground_y_delta) != Math.abs(gravity_y)) || (gravity_y < 0.1))) {
      if (!mov)
        mov = movement_v3.set(0,0,0)
      mov.add(_v3a.copy(c.ground_obj.mov).applyQuaternion(_q.copy(model.mesh.quaternion).conjugate()))
    }
  }
//if (mov) DEBUG_show(!!floating + '\n' + mov.y+'\n'+ground_y+'/'+Date.now())
//if (c.ground_obj) console.log(JSON.stringify(c.ground_obj.bb_y_scale)+'/'+ground_y+'/'+ground_y_delta)

// downward movement only for simplicity
  gravity_obj.mov_y_last = (mov && (mov.y < 0)) ? -mov.y : 0
  gravity_obj.time = time_diff
  if (!floating)
    gravity_obj.y = gravity_y
  else
    gravity_obj.y = 0
// check ground movement END

  if (rot) {
    c.rot.add(rot)
    model.mesh.quaternion.multiply(MMD_SA.TEMP_q.setFromEuler(rot))
  }

// always initialize mov, to check collision against moving objects
  if (!mov)
    mov = movement_v3.set(0,0,0)
  var null_mov = !mov.x && !mov.y && !mov.z

  var moved
  if (c.about_turn) {
    mov.x = -mov.x
    mov.z = -mov.z
  }
  _v3a.copy(mov)
  if (!TPS_mode_in_action)
    _v3a.applyEuler(c.rot)

// check falling
//MMD_SA.playbackRate = 1
  model_para._playbackRate = 1
// time_falling is negative on map restart, to prevent false falling scenario on startup when the character is grounded even though initial ground_y is negative (usually when stage object is used).
  if (time_falling < 0) {
    time_falling++
  }
  else {
    let landing = (mm.filename == d.motion["PC landing"].name)
    let falling = (!key_motion_disabled && (ground_y_delta < 0) && (c.pos.y > ground_y+falling_height_threshold))
    if (falling || (landing && !c.grounded)) {
      if (!landing) {
        d.key_map_list.forEach(function (key_map) {
          if (mm.filename == key_map.motion_filename) {
            key_map.down = 0
            if (key_map.type_combat) {
              if (d.character_combat_locked == key_map.id) {
                d.character_combat_locked = null
              }
            }
          }
        });
        time_falling = 0
      }
      else {
        time_falling += time_diff
      }

      motion_id = null
      mov.copy(c.inertia).multiplyScalar(time_diff * Math.pow(0.95, time_diff*30))
      null_mov = !mov.x && !mov.y && !mov.z
      if (about_turn) {
        c.about_turn = !c.about_turn
        about_turn = false
      }
//d.character_movement_disabled = true
    }
//else if (landing) d.character_movement_disabled = false

    if (falling) {
      if (time_to_ground > 5/30) {
//DEBUG_show(time_to_ground,0,1)
        if (!landing) {
          MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[d.motion["PC landing"].name]]
          MMD_SA._force_motion_shuffle = true
        }
        model_para._playbackRate = 0.001

// "dummy" motion_id as if it's a key with motion
        motion_id = d.motion["PC landing"].name
// not needed anymore
        reset_motion = false
      }
    }
    else if (landing && (time_falling > 0.8)) {
//DEBUG_show(time_falling)
      if (!d.event_mode)
        d.character_movement_disabled = true
      if ((time_falling > 1.2) && c.grounded) {
d.sound.audio_object_by_name["hit-3"].play(model.mesh)
MMD_SA_options._motion_shuffle_list = [MMD_SA_options.motion_index_by_name["r01_普通に転ぶ"], MMD_SA_options.motion_index_by_name["OTL→立ち上がり"]]
MMD_SA_options.motion_shuffle_list_default = null
MMD_SA._force_motion_shuffle = true
      }
    }
    else {
      time_falling = 0
    }
  }

// combat_para START
  var _pos_restored = []
  movement_extra_v3.copy(model.mesh.position)

// check hit-box collision among combat characters
  combat_para_default._attacker_list = []
  d._combat_para.forEach(function (para) {
    combat_para_default.combat_para = para
    var attacker = para.attacker
    if (attacker != PC) {
      combat_para_default.object_list = [c]
      let mesh = attacker.obj._obj
// reset the position that has been modified in jThree.MMD.js
      if (mesh._bone_to_position_last) {
        mesh.position.sub(mesh._bone_to_position_last.pos_delta_rotated)
        _pos_restored[attacker.obj._index] = true
      }
    }
    else
      combat_para_default.object_list = null

// ,_bb_expand: {x:0.5, y:0, z:0.5}
// ,_bb_translate: {x:0, y:0, z:0.5}
    var para_hit = para.para[para.index]
    combat_para_default.bb_expand    = para_hit.bb_expand    || combat_para_default._bb_expand//{x:0,y:0,z:99}//
    combat_para_default.bb_translate = para_hit.bb_translate || combat_para_default._bb_translate

    d.check_collision(attacker, ((attacker != PC)?(d._mov[attacker.obj._index]||new THREE.Vector3()):_v3a), true, combat_para_default);
  });
  var motion_id_enforced = combat_para_default._attacker_list.length

  if (motion_id_enforced) {
    var hit_para = combat_para_default._attacker_list.sort(function (a,b) { return a.hit_level-b.hit_level; }).pop()
    motion_id = hit_para.motion_id
//DEBUG_show(motion_id,0,1)
    rot_absolute = new THREE.Vector3().set(0, Math.PI/2 - Math.atan2((hit_para.attacker.obj._obj.position.z-c.pos.z), (hit_para.attacker.obj._obj.position.x-c.pos.x)), 0)
  }
// combat_para END
//DEBUG_show(Math.round(performance.now()-t)+'\n'+Date.now())
// use TPS_camera_lookAt_ instead of TPS_camera_lookAt
  if (!rot_absolute && c.combat_mode && can_lock_target && TPS_camera_lookAt_) {
    rot_absolute = new THREE.Vector3().set(0, Math.PI/2 - Math.atan2((TPS_camera_lookAt_.z-c.pos.z), (TPS_camera_lookAt_.x-c.pos.x)), 0)
  }

  if (!TPS_mode) {
    rot_absolute_with_camera = rot_absolute;
    rot_absolute = null;
  }

  var combat = d._states.combat

// general collision check for all moving objects (objects with .motion and para .check_collision=true, basically just combat members for now)
  var _object_list
  d.object_list.forEach(function (obj, idx) {
    var _mov = d._mov[idx]
    if (!_mov)
      return

// for performance reason, we need an optimized object list for collision test. Just use PC, combat characters and grid blocks (check_grid_blocks:true) as the collision check targets for now.
    if (!_object_list) _object_list = [c].concat((combat && combat.enemy_list) || [])//.concat(d.object_list)//

    var mesh = obj._obj
    if (mesh._bone_to_position_last && !_pos_restored[idx]) {
// reset the position that has been modified in jThree.MMD.js
      mesh.position.sub(mesh._bone_to_position_last.pos_delta_rotated)
    }

    var result = d.check_collision({ obj:obj, mass:obj.mass }, _mov, true, { collision_by_mesh_disabled:true, check_grid_blocks:true, object_list:_object_list })

    if (result.obj_hit) {
      var _y = _mov.y
      _mov.copy(result.moved_final).setY(_y)
    }
    mesh.position.add(_mov)
  });
//DEBUG_show(Math.round(performance.now()-t)+'\n'+Date.now())
// ground combat NPCs
  if (combat) {
    combat.enemy_list.forEach(function (enemy) {
      var mesh = enemy._obj
      if (mesh.visible) {
        mesh.position.y = d.get_ground_y(mesh.position)
      }
    });
  }

  movement_extra_v3.sub(model.mesh.position).negate()
  if (movement_extra_v3.x || movement_extra_v3.y || movement_extra_v3.z) {
//DEBUG_show(8,0,1)
    model.mesh.position.add(movement_extra_v3)
    mov = _v3a.add(movement_extra_v3)
    null_mov = false
    movement_extra_v3.set(0,0,0)
  }
// use the following line instead of the above block to possibly save some calculations, at the expense of some accuracy in collision checks.
//  c.pos.add(movement_extra_v3)

  if (!motion_id && pos_delta) {
    mov = _v3a.add(model.mesh._bone_to_position_last.pos_delta_rotated)
    null_mov = false
  }

  var ground_obj_checked, collision_by_mesh_failed
  for (var i = 0, i_max = dir_block.length; i < i_max; i++) {
    _v3b.copy(_v3a)
    var b_list = dir_block[i]
    if (b_list) {
      b_list.forEach(function (b) {
        _v3b[b] = 0
      });
      if (!null_mov && (!_v3b.x && !_v3b.y && !_v3b.z))
        continue
    }
    if (true) {//!d.check_grid_blocking(_v3c.copy(_v3b).add(c.pos), d.grid_blocking_character_offset, (null_mov)?null:_v3b)) {//
//let _t = performance.now()
      var result = d.check_collision(PC, _v3b, ground_obj_checked)
//DEBUG_show(Math.round(performance.now()-_t))
      collision_by_mesh_failed = result.collision_by_mesh_failed

      if (!ground_obj_checked) {
        ground_obj_checked = true
        c.ground_obj = result.ground_obj
      }

      if (result.obj_hit) {
        _v3b.copy(result.moved_final)
      }
      else if (null_mov)
        break

      if (_v3b.x || _v3b.y || _v3b.z) {
        mov.copy(_v3b)
        moved = true
        break
      }

      if (result.collision_by_mesh_checked)
        break
    }
    if (moved)
      break
  }

  if (reset_motion) {
    motion_reset.some(function (key_map) {
//      reset_key_map([key_map.id])
      if (mm.filename == key_map.motion_filename) {
        MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
        MMD_SA._force_motion_shuffle = true
        return true
      }
    });
  }

// check ground movement START
  ground_y = (collision_by_mesh_failed) ? c.pos.y : d.get_ground_y(c.pos)
  if (c.ground_obj) {
    const g = c.ground_obj.obj;
    const g_obj = g._obj
    for (var index in c.ground_obj.bb_y_scale) {
      ground_y = (index == "mesh") ? Math.max(((c.ground_obj.obj.collision_by_mesh_enforced)?-999:ground_y), c.ground_obj.bb_y_scale.mesh) : Math.max(ground_y, g._obj_proxy.boundingBox_list[index].max.y * g_obj.scale.y * c.ground_obj.bb_y_scale[index] + g_obj.position.y)
    }
  }
  var reset_camera// = (d.camera_y_default_non_negative && (c.ground_y != ground_y) && ((c.ground_y < 0) || (ground_y < 0)))
  c.ground_y = ground_y
  c.grounded = false
  if (!floating || (c.pos.y < ground_y)) {
    ground_y_delta = (c.pos.y > ground_y + gravity_y) ? -gravity_y : ground_y - c.pos.y
    c.grounded = ground_y_delta > -0.5
  }
//if (c.ground_obj) console.log(JSON.stringify(c.ground_obj.bb_y_scale)+'/'+ground_y+'/'+ground_y_delta)

  if (c.pos.y - ground_y < gravity_obj.y + gravity_obj.mov_y_last)
    gravity_obj.y = gravity_obj.mov_y_last = 0
// check ground movement END

  var change_motion = motion_id_enforced
/*
  if (!change_motion && (ground_y_delta < 0) && (c.pos.y > ground_y+10)) {
//    MMD_SA.playbackRate = 0.5
//    model_para._playbackRate = 0.5
  }
  else {
//    MMD_SA.playbackRate = 1
//    model_para._playbackRate = 1
    if (motion_id && !key_motion_disabled && (mm.filename != motion_id))
      change_motion = true
  }
*/
  if (motion_id && !key_motion_disabled && (mm.filename != motion_id))
    change_motion = true
  if (change_motion) {
    MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[motion_id]]
    MMD_SA._force_motion_shuffle = true
  }

  if (!moved && ground_y_delta) {
    moved = true
  }

  if (collision_by_mesh_failed) {
    moved = false
  }

  var camera_y_offset = 0
  if (movement_extra_v3.x || movement_extra_v3.y || movement_extra_v3.z)
    moved = true
  if (moved) {
    if (!mov)
      mov = movement_v3.set(0,0,0)
    mov.y += ground_y_delta
    if (c.pos.y + mov.y < ground_y)
      mov.y = ground_y - c.pos.y

    var _y = c.pos.y
    c.pos.add(mov)
    if (d.camera_y_default_non_negative && (c.pos.y < 0))
      camera_y_offset = (mov.y < 0) ? Math.min(_y, 0) - c.pos.y : 0
    else
      camera_y_offset = -MMD_SA._camera_y_offset_
    MMD_SA._camera_y_offset_ += camera_y_offset
  }
  else
    mov = null

  if (mov) {
// per second
    c.inertia.copy(mov).setY(0).multiplyScalar(1/time_diff)
  }
  else {
    c.inertia.set(0,0,0)
  }

  var update_dungeon_blocks
  if (mov || rot) {
    c.pos_update()
    let _mov_camera
    if (mov) {
      _mov_camera = _v3a.copy(mov.add(movement_extra_v3))
      _mov_camera.y += camera_y_offset
      _mov_camera = [_mov_camera, mov]
    }
    let _rot_camera = (TPS_mode_in_action && !TPS_camera_lookAt) ? null : rot;//(rot_camera.enabled && rot && rot_camera.v3.negate().add(rot))||rot;
    MMD_SA._trackball_camera.SA_adjust(_mov_camera, _rot_camera)
/*
    if (rot_camera.enabled && rot) {
//DEBUG_show(_rot_camera.clone().multiplyScalar(180/Math.PI).toArray().concat(Date.now()).join('\n'))
      rot_camera.v3.copy(rot)
    }
*/
    update_dungeon_blocks = true
  }
  else {
    d.PC_follower_list.forEach(function (para) {
var id = para.id
var obj = para.obj
if (!obj)
  return

para.onidle && para.onidle()
    });
  }

  if (about_turn) {
    model.mesh.quaternion.multiply(MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.set(0,Math.PI,0)))
  }

  if (rot_absolute || rot_absolute_with_camera) {
    if (!rot_absolute)
      rot_absolute = _v3b.set(0,0,0)
    if (rot_absolute_with_camera) {
      rot_absolute.add(rot_absolute_with_camera)
      rot_absolute_with_camera = _v3a.copy(rot_absolute_with_camera).sub(c.rot)
    }
    c.about_turn = false
    c.rot.copy(rot_absolute)
    model.mesh.quaternion.setFromEuler(rot_absolute)
    if (rot_absolute_with_camera)
      MMD_SA._trackball_camera.SA_adjust(null, rot_absolute_with_camera)
  }

  if (update_dungeon_blocks)
    d.update_dungeon_blocks()

  if (reset_camera) {
    MMD_SA.reset_camera()
  }


  var cp_events = []
  d.check_points.forEach(function (cp) {
    var pos
    if (cp.position)
      pos = _v3a.copy(cp.position)
    if (cp.object_index != null)
      pos.add(d.object_list[cp.object_index]._obj.position)
    cp.range.forEach(function (r) {
      var is_inside
      if (r.distance) {
        is_inside = (c.pos.distanceTo(pos) < r.distance)
      }
      else {
        is_inside = _b3.copy(r.zone).containsPoint(c.pos)
//DEBUG_show(is_inside+'/'+c.pos.toArray()+'\n'+_b3.min.toArray()+'/'+_b3.max.toArray())
      }

      if (is_inside) {
        if (r.onenter && !r._entered)
          cp_events.push(r.onenter)
        if (r.onstay)
          cp_events.push(r.onstay)
        r._entered = true
        if (r.onexit)
          r.onexit._pos_last = c.pos.clone()
      }
      else {
        if (r.onexit && r.onexit.condition && !r.onexit.condition()) {
//return
          _v3b.copy(r.onexit._pos_last).sub(c.pos)
          c.pos.copy(r.onexit._pos_last)

          c.pos_update()
          MMD_SA._trackball_camera.SA_adjust(_v3b)

//          MMD_SA.reset_camera()
          return
        }
        if (r.onexit && r._entered)
          cp_events.push(r.onexit)
        r._entered = false
      }
    });
  });
  cp_events.forEach(function (ev) {
    d.run_event(ev.event_id)
  });

//DEBUG_show(Math.round(performance.now()-t)+'\n'+Date.now())
//  model.mesh.bones_by_name["針回転"].quaternion=new THREE.Quaternion().setFromEuler(MMD_SA.TEMP_v3.set(0*Math.PI/180, -((d.getHours()+d.getMinutes()/60+(d.getSeconds()+d.getMilliseconds()/1000)/(60*60))/24*720)*Math.PI/180, 0*Math.PI/180));
};

  })() );

(function () {
  var _reset = function () {
if (this.disabled)
  return

this._initialized = false

for (var lvl = 0, lvl_max = this.geo_by_lvl.length; lvl < lvl_max; lvl++) {
  var lvl_obj = this.lvl[lvl]
// set .index to 0 effectively means the first obj is just for cloning and is never displayed
  lvl_obj.index = 0//-1
  lvl_obj.index_material_cloned = -1
  lvl_obj.list.concat(lvl_obj.list_material_cloned).forEach(function (obj) {
    obj.visible = false
    MMD_SA.THREEX.scene.remove(obj)
  });

  var i, i_max

  lvl_obj.reusable_list = []
  for (i = lvl_obj.index+1, i_max = lvl_obj.list.length; i < i_max; i++)
    lvl_obj.reusable_list.push(i)
  lvl_obj.index = Math.max(i_max-1, lvl_obj.index)

  lvl_obj.reusable_list_material_cloned = []
  for (i = lvl_obj.index_material_cloned+1, i_max = lvl_obj.list_material_cloned.length; i < i_max; i++)
    lvl_obj.reusable_list_material_cloned.push(i)
  lvl_obj.index_material_cloned = Math.max(i_max-1, lvl_obj.index_material_cloned)
}
  }

  var _get_obj = function (list) {
const THREE = MMD_SA.THREEX.THREE;

var plane0 = this.list[0]

var index, reusable_list
if (list == this.list) {
  index = "index"
  reusable_list = "reusable_list"
}
else {
  index = "index_material_cloned"
  reusable_list = "reusable_list_material_cloned"
}

var plane
var index_used = this[reusable_list].pop()
if (index_used != null) {
  plane = list[index_used]
}
else {
  index_used = ++this[index]
  plane = list[index_used]
  if (!plane) {
    plane = list[index_used] = (list == this.list) ? plane0.clone() : plane0.clone(new THREE.Mesh(plane0.geometry, plane0.material.clone()))
    plane.matrixAutoUpdate = false
    MMD_SA.THREEX.scene.add(plane)
  }
}

return [plane, index_used]
  }

  var _init = function () {
if (this.disabled || this._initialized)
  return this
this._initialized = true

for (var lvl = 0, lvl_max = this.geo_by_lvl.length; lvl < lvl_max; lvl++) {
  var lvl_obj = this.lvl[lvl]
  lvl_obj.list.concat(lvl_obj.list_material_cloned).forEach(function (obj) {
// NOTE: scene.add must come first, or .visible will always be reset to true.
    MMD_SA.THREEX.scene.add(obj)
    obj.visible = false
//    obj.renderDepth = 999999
  });
}

return this
  }

  MMD_SA_options.Dungeon.grid_material_list.forEach(function (p_obj, idx) {
    p_obj.reset = _reset
    p_obj.init  = _init

    if (p_obj.disabled)
      return

    p_obj.lvl = []
    for (var lvl = 0, lvl_max = p_obj.geo_by_lvl.length; lvl < lvl_max; lvl++) {
      var mesh_obj = MMD_SA_options.mesh_obj_by_id['DungeonPlane'+idx+'MESH_LV'+lvl]._obj;
      mesh_obj.useQuaternion = true
      mesh_obj.quaternion.setFromEuler(mesh_obj.rotation)
      p_obj.lvl[lvl] = {
  lvl: lvl
 ,lvl_max: lvl_max
 ,list:[mesh_obj]
 ,list_material_cloned:[]
 ,reusable_list:[]
 ,reusable_list_material_cloned:[]
 ,get_obj:_get_obj
      };
    }
  });
})();

(function () {
  var _init = function () {
if (this._initialized)
  return
this._initialized = true

var that = this

this.list.forEach(function (cache) {
// NOTE: scene.add must come first, or .visible will always be reset to true.
  if (!cache.parent)
    MMD_SA.THREEX.scene.add(cache)
  cache.visible = false;
  if (!MMD_SA.THREEX.enabled) cache.children.forEach(function (c) { c.visible=false; });
});
  }

  var _reset = function () {
var that = this
this._initialized = false

var stay_on_scene = this.obj_base.stay_on_scene && MMD_SA_options.Dungeon.object_list.some(function (obj) { return obj.object_index==that.obj_base.index; });
this.index = this.list.length - 1
this.reusable_list = []
this.list.forEach(function (cache, idx) {
  that.reusable_list.push(idx)
  cache.visible = false;
  if (!MMD_SA.THREEX.enabled) cache.children.forEach(function (c) { c.visible=false; });
  if (!stay_on_scene)
    MMD_SA.THREEX.scene.remove(cache)
});
  }

  d.object_base_list.forEach(function (obj, idx) {
    if (obj.is_dummy) return

    var mesh
    if (obj.construction && !obj.path) {
      obj._mesh_id = (obj.character_index != null) ? "mikuPmx"+obj.character_index : obj.construction.mesh_obj.id
      obj._obj = MMD_SA_options.mesh_obj_by_id[obj._mesh_id]
      mesh = obj._obj._obj

      var geo_list = []
      if (mesh.geometry) {
        geo_list.push(mesh.geometry)
      }
      else {
        mesh.children.forEach(function (mesh_child) {
          if (mesh_child.geometry)
            geo_list.push(mesh_child.geometry)
        });
      }
      geo_list.forEach(function (geo) {
        if (obj.construction.boundingBox_list) {
          geo.boundingBox_list = []
          obj.construction.boundingBox_list.forEach(function (bb) {
if (bb == null) {
  geo.boundingBox_list.push(geo.boundingBox)
}
else {
  var b3 = new THREE.Box3().set(bb.min, bb.max)
  b3.oncollide = bb.oncollide
  b3.onaway = bb.onaway
  geo.boundingBox_list.push(b3)
}
          });
          if (geo.boundingBox_list.length == 1)
            geo.boundingBox = geo.boundingBox_list[0]
        }
        if (!geo.boundingBox) {
          geo.computeBoundingBox();
        }
        if (!geo.boundingSphere) {
          geo.boundingSphere = geo.boundingBox.getBoundingSphere(new THREE.Sphere());
        }
//console.log(geo.boundingBox)
      });
    }
    else {
      if (obj.path) {
        obj._obj = MMD_SA_options.x_object_by_name[obj.path.replace(/^.+[\/\\]/, "").replace(/\.x$/i, "")]
      }
      else {
        obj._mesh_id = "mikuPmx"+obj.character_index
        obj._obj = MMD_SA_options.mesh_obj_by_id[obj._mesh_id]
      }
      mesh = obj._obj._obj
    }

// to get bounding host
    obj._obj._obj_proxy = new Object3D_proxy_base(obj._obj);

    if (!mesh.useQuaternion) mesh.quaternion.setFromEuler(mesh.rotation)
    mesh.useQuaternion = true
    mesh.children.forEach(function (mesh_child) {
      if (!mesh_child.useQuaternion) mesh_child.quaternion.setFromEuler(mesh_child.rotation)
      mesh_child.useQuaternion = true
    });

    var geo = mesh.geometry || mesh.children[0].geometry
    if (obj.collision_by_mesh && !obj.collision_by_mesh_sort_range && MMD_SA_options.Dungeon.use_octree) {
      obj.collision_by_mesh_sort_range = 1;
    }

    if (obj.collision_by_mesh_sort_range) {
      if (!d.mesh_sorting_worker) {
d.use_local_mesh_sorting = true;
if (d.use_local_mesh_sorting) {
  d.mesh_sorting_worker = {
    tree: {}
  };
}
else {
}
      }

      let a, b, c, index, _array;
      let vertices = geo.vertices;
      let collision_by_mesh_material_index_max = obj.collision_by_mesh_material_index_max || 999;
// https://0fps.net/2015/01/23/collision-detection-part-3-benchmarks/
if (d.use_local_mesh_sorting) {
  if (MMD_SA_options.Dungeon.use_octree) {
    const THREEX = MMD_SA.THREEX.THREEX;
    const octree = new THREEX.Octree();
    octree.fromGraphNode( mesh );
    obj.octree = octree;
    console.log('octree', obj);

    d.mesh_sorting_worker.tree[idx] = {};
  }

  if (!d.use_octree) {
// compute face normal when necessary (mainly for PMX model)
    if (!geo.faces[0].normal.lengthSq()) geo.computeFaceNormals();

// https://github.com/mourner/rbush
    let tree = rbush();

    _array = [];
    for (let f = 0, fl = geo.faces.length; f < fl; f++) {
      const face = geo.faces[f];
      if (face.materialIndex >= collision_by_mesh_material_index_max) break;

      a = vertices[face.a];
      b = vertices[face.b];
      c = vertices[face.c];

      _array.push({
minX: Math.min(a.x, b.x, c.x),
minY: Math.min(a.z, b.z, c.z),
maxX: Math.max(a.x, b.x, c.x),
maxY: Math.max(a.z, b.z, c.z),
index: f
      });
    }

    tree.load(_array);
    d.mesh_sorting_worker.tree[idx] = tree;
  }
}
else {
}

      _array = undefined
    }

    obj.cache = {
  obj_base: obj
 ,index: -1
 ,reusable_list: []
 ,list: [mesh]

 ,_initialized: false
 ,init: _init
 ,reset: _reset
    };

// PC swap ready
    if (obj.character_index != null) {
Object.defineProperty(obj.cache.list, "0", {
  get: function () {
//console.log(Date.now())
    return MMD_SA_options.mesh_obj_by_id[obj._mesh_id]._obj
  }
});
    }

    if (obj.character_index != null) {
      THREE.MMD.getModels()[obj.character_index]._clone_cache = obj.cache
    }

    obj.cache_LOD_far = {
  obj_base: obj
 ,is_LOD_far: true
 ,index: -1
 ,reusable_list: []
 ,list: []

 ,_initialized: false
 ,init: _init
 ,reset: _reset
    };

    if (obj.LOD_far) {
      const THREE = MMD_SA.THREEX.THREE;

      obj.LOD_far.boundingBox = geo.boundingBox
      obj.LOD_far.center = geo.boundingBox.center()
      obj.LOD_far.size = geo.boundingBox.size()
      let mesh_far = new THREE.Mesh(new THREE.CubeGeometry(obj.LOD_far.size.x, obj.LOD_far.size.y, obj.LOD_far.size.z), new THREE.MeshBasicMaterial( { color:'#'+MMD_SA.THREEX.scene.fog.color.getHexString() } ));
      mesh_far.visible = false
      MMD_SA.THREEX.scene.add(mesh_far)

      mesh_far.useQuaternion = true

      obj.cache_LOD_far.list.push(mesh_far)
    }
  });
})();

  MMD_SA.SpeechBubble.list.forEach(m=>{ m.renderDepth = 9999999 * ((!MMD_SA.THREEX.enabled) ? -1 : 1); });
  MMD_SA.SpeechBubble.list.forEach(b=>b.bubbles.forEach(b=>{
    b.pos_mod = [0,-2.5,0]
  }));

  d.grid_blocks = {
    objs: []
   ,xy: []

   ,hide: function () {
this.objs.forEach(function (obj) {
  obj._obj.visible = false
});
    }

   ,update: (function () {
//var xy = []
//var area_id = ""
var xy_list = [
[-1,-1], [ 0,-1], [ 1,-1],
[-1, 0],          [ 1, 0],
[-1, 1], [ 0, 1], [ 1, 1]
];
var pos_grid = { x:0, y:0, z:0 }

var v3a, v3b, v3c
v3a = new THREE.Vector3()
v3b = new THREE.Vector3()
v3c = new THREE.Vector3()

return function (pos) {
  var d = MMD_SA_options.Dungeon
  var grid_size = d.grid_size
  var gs_half = grid_size/2
  var map_w_max = d.RDG_options.width
  var map_h_max = d.RDG_options.height

  d.grid_blocks.objs[d.grid_blocks.objs.length-1]._obj.visible = (d.ceil_material_index_default != -1)

  var _x = Math.floor((pos.x) / grid_size)
  var _y = Math.floor((pos.z) / grid_size)
/*
  var xy_unchanged = (area_id == d.area_id) && (_x == xy[0]) && (_y == xy[1])
  area_id = d.area_id
  xy[0] = _x
  xy[1] = _y
*/
  xy_list.forEach(function (_xy, idx) {
    var x = _xy[0] + _x
    var y = _xy[1] + _y
    var c = v3a.set((x+0.5)*grid_size, 0, (y+0.5)*grid_size)
    var ground_y = 999

    var obj = d.grid_blocks.objs[idx]._obj
    var geo = obj.geometry

    var update
    if ((x < 0) || (x >= map_w_max) || (y < 0) || (y >= map_h_max) || (d.grid_array[y][x] == 1)) {
      update = true
    }
    else {
      ground_y = d.get_ground_y({x:(x*grid_size), y:0, z:(y*grid_size)}, -999)
      if (ground_y > pos.y+10) {
        update = true
      }
    }

    if (update) {
      obj.position.copy(c)
      geo.boundingBox.set(v3b.set(-gs_half, -999, -gs_half), v3c.set(gs_half, ground_y, gs_half))
// it will be updated in .check_collision() as a boundingSphere-hit object
//      obj.updateMatrixWorld()
      obj.visible = true
    }
    else {
      obj.visible = false
    }
  });
};
    })()

  };

  for (var i = 0; i < 8+1; i++) {
    var block = new THREE.Object3D()
    block.useQuaternion = true
    block.geometry = {
      boundingSphere: new THREE.Sphere()
     ,boundingBox: new THREE.Box3()
    };
    block.geometry.boundingSphere.radius = 999
    block.geometry.boundingBox_list = [block.geometry.boundingBox]

    var obj = {
      _mesh: block
     ,_obj: block
     ,skip_ground_obj_check: true
// dummy
     ,_obj_base: {}
    };
    obj._obj_proxy = new Object3D_proxy_base(obj);

    d.grid_blocks.objs[i] = obj
  }

  for (var id in MMD_SA_options.Dungeon_options.options_by_area_id) {
    MMD_SA_options.Dungeon_options.options_by_area_id[id]._saved = new AreaDataSaved()
  }

  d.restart()
});


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


this.GOML_dungeon_blocks()

this.object_base_list = options.object_base_list || []

if (MMD_SA_options.model_path_extra) {
  var _model_path = LABEL_LoadSettings("LABEL_MMD_model_path", "")
  if (_model_path) {
    var index = MMD_SA_options.model_path_extra.indexOf(_model_path)
    if (index != -1)
      MMD_SA_options.model_path_extra[index] = System.Gadget.path + "\\jThree\\model\\Appearance Miku\\Appearance Miku_BDEF_mod-v04.pmx"
  }
}

if (options.multiplayer) {
  if (!MMD_SA_options.model_para)
    MMD_SA_options.model_para = {}
  if (!MMD_SA_options.model_path_extra)
    MMD_SA_options.model_path_extra = []

  let that = this
  let OPC_index = options.multiplayer.OPC_index0 = 1 + MMD_SA_options.model_path_extra.length
  options.multiplayer.OPC_list.forEach(function (opc, idx) {
    MMD_SA_options.model_path_extra.push(opc.path)

    var path = toLocalPath(opc.path)
    var model_filename_raw = path.replace(/^.+[\/\\]/, "")
    var para = MMD_SA_options.model_para[model_filename_raw] = opc.para || MMD_SA_options.model_para[model_filename_raw] || {}
    para.is_PC_candidate = true
    para.is_OPC = true

    that.object_base_list.push({
  character_index: OPC_index++
 ,is_OPC: true
 ,id: "OPC-" + idx
 ,placement: {
    grid_id: 2
   ,can_overlap: true
   ,hidden: true
  }
 ,no_collision: true
    });
  });
}

if (options.character) {
  Object.assign(this.character, options.character)
}


// [extracted] motions, combat motions, NPC motion cloning → js/dungeon/motions.js
this._initMotions();
this.key_map = options.key_map || {};

var ULDR_indexd = []
//WASD
var ULDR_keyCode = [87,65,83,68]
var ULDR_id = ["up","left","down","right"]

for (var key in this.key_map) {
  var id = this.key_map[key].id
  var index = id && ULDR_id.indexOf(id)
  if (index >= 0)
    ULDR_indexd[index] = true
}

ULDR_id.forEach((id, idx)=>{
  if (ULDR_indexd[idx])
    return

  var key_map = that.key_map[ULDR_keyCode[idx]] = { order:1000+idx, id:id, type_movement:true };

  switch (id) {
    case "up":
      key_map.about_turn = false
      key_map.key_id_cancel_list = ["down"]
      key_map.motion_id = "PC movement forward"
      Object.defineProperty(key_map, 'mov_speed', { get:()=>this.motion["PC movement forward"].para._speed, });
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["down"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{x:0, y:0, get z() { return MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }} }]
      }
      break
    case "down":
      key_map.about_turn = true
      key_map.key_id_cancel_list = ["up"]
      key_map.motion_id = "PC movement forward"
      Object.defineProperty(key_map, 'mov_speed', { get:()=>this.motion["PC movement forward"].para._speed, });
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["up"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{x:0, y:0, get z() { return -MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }} }]
      }
      break
    case "left":
      key_map.rot_speed = {x:0, y: Math.PI*0.75, z:0}
      key_map.key_id_cancel_list = ["right"]
//      key_map.motion_id = "PC movement forward"
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["right"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{get x() { return MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }, y:0, z:0 } }]
      }
      break
    case "right":
      key_map.rot_speed = {x:0, y:-Math.PI*0.75, z:0}
      key_map.key_id_cancel_list = ["left"]
//      key_map.motion_id = "PC movement forward"
      key_map.motion_can_float = true
      key_map.TPS_mode = {
  mov_to_rot_absolute: true
 ,key_id_cancel_list: ["left"]
 ,motion_id: "PC movement forward"
 ,mov_speed: [{ frame:0, speed:{get x() { return -MMD_SA_options.Dungeon.motion["PC movement forward"].para._speed; }, y:0, z:0 } }]
      }
      break
  }
});

if (!this.key_map[38]) {
  this.key_map[38] = { order:838, id:"camera_preset_switch", keyCode:38
   ,onfirstpress: (function () {
var d = MMD_SA_options.Dungeon;
var c = d.character;

let v3a;
const camera_position_preset_length = 3;
function camera_position_preset(index) {
  const dc = MMD_SA_options.camera_position_base;
  switch (index) {
    case 1:
      return v3a.set(dc[0]*2, dc[1]*2+10, dc[2]*2*MMD_SA_options.Dungeon_options.camera_position_z_sign).toArray();
    case 2:
      return v3a.set(dc[0]*3, dc[1]*3+15, dc[2]*4*MMD_SA_options.Dungeon_options.camera_position_z_sign).toArray();
    default:
      return v3a.set(dc[0], dc[1], dc[2]*MMD_SA_options.Dungeon_options.camera_position_z_sign).toArray();;
  }
}

d.update_camera_position_base = function (pos) {
  if (pos) MMD_SA_options.camera_position_base = pos;

  d.key_map[38].camera_position_preset_index = 0;
  c.camera_position_base_default = camera_position_preset(0);
  c.camera_position_base = c.camera_position_base_default.slice();

  MMD_SA.reset_camera(true);
};

window.addEventListener("jThree_ready", function () {
  v3a = new THREE.Vector3();

  d.key_map[38].camera_position_preset_index = 0;

  c.camera_rotation_from_preset = new THREE.Vector3();
});

window.addEventListener("SA_Dungeon_onrestart", function () {
  if (c.mount_para) return;

  c.camera_position_base_default = camera_position_preset(d.key_map[38].camera_position_preset_index);
  c.camera_position_base = c.camera_position_base_default.slice();
});

return function () {
  if (d.event_mode) return;
  if (c.mout_para) return;

  if (++this.camera_position_preset_index >= camera_position_preset_length)
    this.camera_position_preset_index = 0;

  c.camera_position_base_default = camera_position_preset(this.camera_position_preset_index);
  c.camera_position_base = c.camera_position_base_default.slice();

  c.rot.set(0,0,0);
  THREE.MMD.getModels()[0].mesh.quaternion.set(0,0,0,1);

  c.about_turn = false;
  c.camera_TPS_rot.set(0,0,0);
  c.camera_update();

//  if (c.TPS_camera_lookAt_) d._rot_camera.v3.set(0,0,0);

  MMD_SA.reset_camera();

  var tc = MMD_SA._trackball_camera;
  c.camera_rotation_from_preset.y = Math.PI/2 - Math.atan2((tc.target.z-tc.object.position.z), (tc.target.x-tc.object.position.x));

  DEBUG_show("Camera preset:" + (this.camera_position_preset_index+1)+'/'+camera_position_preset_length, 2);
};
    })()
  };
}
if (!this.key_map[40]) {
  this.key_map[40] = { order:840, id:"TPS_mode_toggle", keyCode:40
   ,onfirstpress: function () {
if (MMD_SA_options.Dungeon.event_mode) return;
/*
var look_at_screen = MMD_SA_options._look_at_screen
MMD_SA_options.look_at_screen = MMD_SA_options.look_at_mouse = !look_at_screen
MMD_SA.reset_camera()

DEBUG_show("Look at screen:" + ((!look_at_screen)?"ON":"OFF"), 2)
*/

var c = that.character;
var combat = c.combat_mode && that._states.combat;
if (combat && (combat._target_enemy_index >= 0)) {
  combat._target_enemy_index = -1
  if (!c.TPS_mode)
    MMD_SA.reset_camera(true)
}
else {
  c.TPS_mode = !c.TPS_mode
  MMD_SA.reset_camera(true)
  DEBUG_show("TPS control mode:" + ((c.TPS_mode)?"ON":"OFF"), 2)
}
    }
  };
}

(function () {

  function select_target(counter) {
var c = that.character
if (!c.combat_mode)
  return

var combat = that._states.combat
if (!combat.enemy_list.some(function (enemy) { return enemy.hp; }))
  return

var target_enemy_index = (combat._target_enemy_index == null) ? -1 : combat._target_enemy_index
var enemy
while (true) {
  target_enemy_index += counter
  if (target_enemy_index >= combat.enemy_list.length)
    target_enemy_index = 0
  else if (target_enemy_index < 0)
    target_enemy_index = combat.enemy_list.length - 1

  enemy = combat.enemy_list[target_enemy_index]
  if (!enemy.hp)
    continue

  combat._target_enemy_index = target_enemy_index
  break
}

//c.rot.y = Math.PI/2 - Math.atan2((enemy._obj.position.z-c.pos.z), (enemy._obj.position.x-c.pos.x))
//THREE.MMD.getModels()[0].mesh.quaternion.setFromEuler(c.rot)
  }

  if (!that.key_map[37]) {
    that.key_map[37] = { order:837, id:"target_select_L", keyCode:37
     ,onfirstpress: function () {
select_target(-1)
      }
    };
  }
  if (!that.key_map[39]) {
    that.key_map[39] = { order:839, id:"target_select_R", keyCode:39
     ,onfirstpress: function () {
select_target(1)
      }
    };
  }

})();

this.key_map_reset = function () {
  this.key_map_by_id = {}
  this.key_map_list = []
  for (var key in this.key_map) {
    var k = this.key_map[key]
    k.keyCode_default = k.keyCode_default || k.keyCode
    k.keyCode = key
    k.id_default = k.id_default || k.id
    this.key_map_by_id[k.id_default||key] = this.key_map_by_id[k.id||key] = k
    this.key_map_list.push(k)
  }
  this.key_map_list.sort(function(a,b){return a.order-b.order})
};

this.key_map_reset()
if (!this.key_map[32] && !this.key_map_by_id["jump"]) {
  let _onfirstpress = function (e) {
    var keyCode = (that.key_map_by_id["up"].down || that.key_map_by_id["down"].down || that.key_map_by_id["left"].down || that.key_map_by_id["right"].down || !e.detail.e.shiftKey) ? 1320 : 1321

    var key_map = that.key_map[32] = that.key_map_by_id["jump"] = that.key_map[keyCode]
    key_map.keyCode = 32
    key_map.id = "jump"
    key_map.is_down = this.is_down
    key_map.down = this.down
    if (this != key_map) {
      this.keyCode = this.keyCode_default
      this.id = this.id_default
      this.is_down = 0
      this.down = 0
    }
//DEBUG_show(keyCode,0,1)
  };
  let _onupdate = (function () {
    var va_default = _jump_physics((15+10), 11);
    return function (para) {
if (!this.down)
  return

var model = THREE.MMD.getModels()[0]
var motion_para = MMD_SA_options.Dungeon.motion[this.motion_id].para

var scale = 0.25 + Math.min(para.pressed,250)/250*0.75

var t_diff = para.t_diff
var frame = model.skin.time*30
var frame_base = frame - t_diff*30

var result = {}
var va
if ((frame >= 12) && (frame < 12+22)) {
  let playbackRate_last = motion_para.playbackRate_by_model_index[0] || 1
  let _t_diff = (frame_base >= 12) ? t_diff : (frame - 12)/30
//if (_t_diff != t_diff) DEBUG_show((t_diff-_t_diff)/t_diff,0,1)
  let playbackRate = motion_para.playbackRate_by_model_index[0] = (t_diff-_t_diff)/t_diff*playbackRate_last + _t_diff/t_diff*1/scale
  if (playbackRate_last != playbackRate) {
    result.t2_extended = (playbackRate - playbackRate_last) * t_diff
  }
  va = _jump_physics((15+10)*scale, 11)
}
else {
  motion_para.playbackRate_by_model_index[0] = 1
  va = va_default
}
motion_para.mov_speed[1] = { frame:12, speed:{x:0, y:va.v, z:41/22*30*scale}, acceleration:{x:0, y:va.a, z:0}}

return result
/*
 ,mov_speed: (function () {
var va = _jump_physics((15+10), 11)
return [
  { frame:34, speed:{x:0, y:0,    z:22.8/12*30}}
 ,{ frame:12, speed:{x:0, y:va.v, z:41/22*30}, acceleration:{x:0, y:va.a, z:0}}
 ,{ frame:0,  speed:{x:0, y:0,    z:22.8/12*30}}
];
  })()
*/
    };
  })();
  let _ondown = function (e) {
var c = MMD_SA_options.Dungeon.character
if (c.mount_para && !c.mount_para.can_jump)
  return true
  };
  this.key_map[1320] = { order:999, id:"jump_forward", type_movement:true, keyCode:1320, onkeyup:function(){}, motion_id:"PC forward jump", key_id_cancel_list:["up","down"]
   ,onfirstpress: _onfirstpress
   ,ondown: _ondown
   ,onupdate: _onupdate
   ,TPS_mode: {
      motion_id:"PC forward jump"
     ,key_id_cancel_list:["up","down","left","right"]
    }
  };
  this.key_map[1321] = { order:999, id:"jump_high", type_movement:true, keyCode:1321, onkeyup:function(){}, motion_id:"PC high jump", key_id_cancel_list:["up","down"]
   ,onfirstpress: _onfirstpress
   ,ondown: _ondown
//   ,onupdate: _onupdate
   ,TPS_mode: {
      motion_id:"PC high jump"
     ,key_id_cancel_list:["up","down","left","right"]
    }
  };
  this.key_map[32] = this.key_map[1320]
}

this.key_map_default = {}
Object.assign(this.key_map_default, this.key_map)

// initialize to assign .duration for all necessary motions (BEFORE .generateSkinAnimation()) to prevent looping
window.addEventListener("SA_MMD_init", ()=>{
  MMD_SA_options.Dungeon.character.assign_keys()
});

if (options.combat_mode_enabled) {
  (function () {
    var d = MMD_SA_options.Dungeon
    var c = d.character
    var combo_str = ""
    var combo_timestamp = 0

    if (!MMD_SA_options.Dungeon_options.attack_combo_list) {
      MMD_SA_options.Dungeon_options.attack_combo_list = [
  { keyCode:20085, combo_RE:"8,5", motion_id:"PC combat attack 01", plus_down:true }
 ,{ keyCode:10044, combo_RE:"4,4", motion_id:"PC combat attack 02", combo_type:"kick" }
 ,{ keyCode:10077, combo_RE:"7,7", motion_id:"PC combat attack 03" }
 ,{ keyCode:14545, combo_RE:"45,45", motion_id:"PC combat attack 04", combo_type:"kick" }
 ,{ keyCode:10055, combo_RE:"5,5", motion_id:"PC combat attack 05", combo_type:"kick" }
 ,{ keyCode:10054, combo_RE:"5,4", motion_id:"PC combat attack 06", combo_type:"kick" }
 ,{ keyCode:20087, combo_RE:"8,7", motion_id:"PC combat attack 07", plus_down:true }
 ,{ keyCode:14556, combo_RE:"45,56", motion_id:"PC combat attack 08", combo_type:"kick" }
 ,{ keyCode:20048, combo_RE:"4,8", motion_id:"PC combat attack 09", plus_down:true }
 ,{ keyCode:10087, combo_RE:"8,7", motion_id:"PC combat attack 10" }
 ,{ keyCode:10456, combo_RE:"456", motion_id:"PC combat attack 11", combo_type:"kick" }
 ,{ keyCode:10078, combo_RE:"7,8", motion_id:"PC combat attack 12" }
 ,{ keyCode:10047, combo_RE:"4,7", motion_id:"PC combat attack 13" }
 ,{ keyCode:20075, combo_RE:"7,5", motion_id:"PC combat attack 14", plus_down:true }
 ,{ keyCode:17878, combo_RE:"78,78", motion_id:"PC combat attack 15" }
 ,{ keyCode:20077, combo_RE:"7,7", motion_id:"PC combat attack 16", plus_down:true }
 ,{ keyCode:10088, combo_RE:"8,8", motion_id:"PC combat attack 17" }
 ,{ keyCode:20045, combo_RE:"4,5", motion_id:"PC combat attack 18", plus_down:true }
 ,{ keyCode:15656, combo_RE:"56,56", motion_id:"PC combat attack 19", combo_type:"kick" }

 ,{ keyCode:50000, combo_RE:"5,5", motion_id:"PC combat attack 2-handed weapon 01", combo_type:"2-handed" }

 ,{ keyCode:10022, combo_RE:"2,2", motion_id:"PC combat attack twin weapon 01", combo_type:"twin" }
 ,{ keyCode:10021, combo_RE:"2,1", motion_id:"PC combat attack twin weapon 02", combo_type:"twin" }
 ,{ keyCode:11212, combo_RE:"12,12", motion_id:"PC combat attack twin weapon 03", combo_type:"twin" }
 ,{ keyCode:12323, combo_RE:"23,23", motion_id:"PC combat attack twin weapon 04", combo_type:"twin" }
 ,{ keyCode:20022, combo_RE:"2,2", motion_id:"PC combat attack twin weapon 05", plus_down:true, combo_type:"twin" }
 ,{ keyCode:22323, combo_RE:"23,23", motion_id:"PC combat attack twin weapon 06", plus_down:true, combo_type:"twin" }
 ,{ keyCode:10012, combo_RE:"1,2", motion_id:"PC combat attack twin weapon 07", combo_type:"twin" }
 ,{ keyCode:10123, combo_RE:"123", motion_id:"PC combat attack twin weapon 08", combo_type:"twin" }

 ,{ keyCode:30012, combo_RE:"1,2", motion_id:"PC combat attack 1-handed weapon 01", combo_type:"1-handed slash" }
 ,{ keyCode:31212, combo_RE:"12,12", motion_id:"PC combat attack 1-handed weapon 02", combo_type:"1-handed slash" }
// ,{ keyCode:30212, combo_RE:"2,12", motion_id:"PC combat attack 1-handed weapon 03", combo_type:"1-handed slash" }
      ];
    }

    MMD_SA_options.Dungeon_options._attack_combo_list = MMD_SA_options.Dungeon_options.attack_combo_list
    Object.defineProperty(MMD_SA_options.Dungeon_options, "attack_combo_list", {
      get: function () {
        return (MMD_SA_options.Dungeon.character.combat_stats_base && MMD_SA_options.Dungeon.character.combat_stats_base.attack_combo_list) || MMD_SA_options.Dungeon_options._attack_combo_list;
      }
    });

    window.addEventListener("jThree_ready", ()=>{
      MMD_SA_options.Dungeon_options._attack_combo_list.forEach((c)=>{
        c.combo_type = c.combo_type || "bare-handed"
        d.motion[c.motion_id].para.attack_combo_para = c
      });
    });

    var combo_onfirstpress = function (e) {
var that = this

var t = performance.now()
if (t > combo_timestamp + 300) {
  combo_str = ""
}
combo_timestamp = t

var c_str = this.keyCode - 96

if (combo_str.length) {
  var c_last = /(\d+)$/.test(combo_str) && RegExp.$1;
  var c_last_array = []
  for (var i = 0; i < c_last.length; i++)
    c_last_array[i] = parseInt(c_last.charAt(i))

  if (c_last_array.indexOf(c_str) != -1)
    combo_str += "," + c_str
  else if (c_last_array.some(function (digit) { return !d.key_map[digit + 96].is_down; }))
    combo_str += "," + c_str
  else {
    combo_str += c_str
    c_last_array.push(c_str)
    combo_str = combo_str.replace(/\d+$/, c_last_array.sort().join(""))
  }
}
else
  combo_str += c_str

while (combo_str.length > 20) {
  combo_str = combo_str.replace(/^\d+\,/, "")
}

var para_SA = MMD_SA.MMD.motionManager.para_SA
if (MMD_SA._force_motion_shuffle) {
  para_SA = MMD_SA.motion[MMD_SA_options.motion_shuffle_list_default[0]].para_SA
}

if (!para_SA.motion_duration_by_combo) {
  let combos = MMD_SA_options.Dungeon_options.attack_combo_list.filter(function (combo) {
    if ((combo.combo_type != "free") && !c.combat_stats.weapon.combo_type_RE.test(combo.combo_type))
      return false

    let _RE = (MMD_SA_options.Dungeon_options.simple_combat_input_mode_enabled) ? combo._RE_simple : combo._RE
    let index = combo_str.search(_RE)
    if (index == -1)
      return false
    if (!MMD_SA_options.Dungeon_options.simple_combat_input_mode_enabled && ((combo.plus_down) ? !d.key_map[107].is_down : d.key_map[107].is_down))
      return false

    combo._index_ = index + RegExp.lastMatch.length
    return true
  });

  if (combos.length) {
    let combo = combos.shuffle()[0]

    let key_map = d.key_map[combo.keyCode]
    key_map.down = t

    combo_str = combo_str.substr(combo._index_)

    let motion_index = MMD_SA_options.motion_index_by_name[d.motion[key_map.motion_id].name]
    let motion_para = MMD_SA.motion[motion_index].para_SA
    if (motion_para.motion_duration_by_combo) {
      key_map.motion_duration = motion_para.motion_duration = motion_para.motion_duration_by_combo[motion_para.motion_duration_by_combo.length-1].motion_duration
//DEBUG_show(combo.keyCode+'/'+that.motion_duration,0,1)
    }

    if (!key_map.type_combat || !d.character_combat_locked) {
      if (!para_SA.motion_command_disabled) {
        para_SA = motion_para
        MMD_SA_options.motion_shuffle_list_default = [motion_index]
        MMD_SA._force_motion_shuffle = true
//DEBUG_show(combo.keyCode,0,1)
      }
    }
  }
}
//DEBUG_show(combo_str)

if (!para_SA.motion_duration_by_combo || !combo_str.length)
  return

var key_map = d.key_map[para_SA.keyCode]
var motion_duration = para_SA.motion_duration
para_SA.motion_duration_by_combo.some(function (combo) {
  let _RE = (MMD_SA_options.Dungeon_options.simple_combat_input_mode_enabled) ? combo._RE_simple : combo._RE
  if (!_RE || (combo_str.search(_RE) == 0)) {
    if (combo.motion_duration > motion_duration) {
      key_map.motion_duration = para_SA.motion_duration = combo.motion_duration
//DEBUG_show(combo_str+'/'+combo.motion_duration+'/'+para_SA.keyCode,0,1)
    }
    return true
  }
});
    };

/*
107: +
97-105: 1-9
*/
    var combo_keys = [107]
    for (var k = 97; k < 96+10; k++)
      combo_keys.push(k)
    combo_keys.forEach(function (k) {
      if (!d.key_map[k]) {
        d.key_map[k] = { order:700+k, id:"k"+k, keyCode:k
         ,ondown: function (e) {
if (!MMD_SA_options.Dungeon.character.combat_mode)
  return true
          }
         ,onfirstpress: (k != 107) ? combo_onfirstpress : null
         ,onupdate: function () { return { return_vale:true }; }
        };
      }
    });
  })();

  this.key_map_combat = options.key_map_combat || []
  this.key_map_parry  = options.key_map_parry  || []

  if (!this.key_map[96] && !this.key_map_by_id["combat_parry"]) {
    this.key_map[96] = this.key_map_combat[this.key_map_combat.length] = { order:950, id:"combat_parry", type_movement:true, keyCode:96, TPS_mode:{ no_rotation:true }
     ,key_id_cancel_list: ["jump"]
     ,onupdate: function () {
var d = MMD_SA_options.Dungeon
var parry_mode = (d.key_map[87].motion_id == "PC combat movement forward")

var TPS_mode

if (this.is_down) {
  if (!d.character.combat_mode)
    MMD_SA.reset_camera()
  if (!parry_mode && d.can_parry) {
    MMD_SA_options.motion_shuffle_list_default  = MMD_SA_options.Dungeon._motion_shuffle_list_default_parry.slice()
    MMD_SA_options._motion_shuffle_list_default = MMD_SA_options.motion_shuffle_list_default.slice()
    d.key_map_swap(d.key_map_parry)
    MMD_SA._force_motion_shuffle = true
//    MMD_SA.reset_camera()
  }
}
else {
  if (parry_mode && (!d.character.combat_mode || d.can_parry)) {
    MMD_SA_options.motion_shuffle_list_default  = MMD_SA_options.Dungeon._motion_shuffle_list_default_combat.slice()
    MMD_SA_options._motion_shuffle_list_default = MMD_SA_options.motion_shuffle_list_default.slice()
    d.key_map_swap(d.key_map_combat)
    MMD_SA._force_motion_shuffle = true
  }
}

return { TPS_mode:TPS_mode }
      }
    };
  }

  ULDR_id.forEach(function (id, idx) {
    var keyCode = ULDR_keyCode[idx]
    if (that.key_map_parry.some(function (kmc) { return kmc.keyCode==keyCode; }))
      return

    that.key_map_combat[that.key_map_combat.length] = that.key_map_by_id[id]

    var key_map = that.key_map_parry[that.key_map_parry.length] = { order:1000+idx, id:id, keyCode:keyCode, about_turn:false, type_movement:true, TPS_mode:{ no_rotation:true } };

    switch (id) {
      case "up":
        key_map.motion_id = key_map.TPS_mode.motion_id = "PC combat movement forward"
        that.motion[key_map.motion_id].para.mov_speed = [{ frame:0, speed:{x:0, y:0, z: 0.5*30} }]
        break
      case "down":
        key_map.motion_id = key_map.TPS_mode.motion_id = "PC combat movement backward"
        that.motion[key_map.motion_id].para.mov_speed = [{ frame:0, speed:{x:0, y:0, z:-0.5*30} }]
        break
      case "left":
        key_map.motion_id = key_map.TPS_mode.motion_id = "PC combat movement left"
        that.motion[key_map.motion_id].para.mov_speed = [{ frame:0, speed:{x: 0.5*30, y:0, z:0} }]
        break
      case "right":
        key_map.motion_id = key_map.TPS_mode.motion_id = "PC combat movement right"
        that.motion[key_map.motion_id].para.mov_speed = [{ frame:0, speed:{x:-0.5*30, y:0, z:0} }]
        break
    }
  });
}

this.key_map_swap = function (key_map) {
  if (!Array.isArray(key_map)) {
    key_map = Object.keys(key_map).map(function (name) { return key_map[name]; });
  }

  var that = this
  key_map.forEach(function (k) {
    var key_replaced, key_new
    if (typeof k == "number") {
      if (k < 0) {
        delete that.key_map[-k]
      }
      else if (that.key_map_default[k]) {
        key_replaced = that.key_map[k]
        key_new = that.key_map_default[k]
        that.key_map[k] = key_new
      }
    }
    else {
      key_replaced = that.key_map[k.keyCode]
      key_new = k
      that.key_map[k.keyCode] = key_new
    }

    if (key_replaced && (key_replaced != key_new)) {
      key_replaced.is_down = 0
      key_replaced.down = 0
    }
  });

  this.key_map_reset()
};
// dungeon motion END


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
  }


 ,_states: {}

 ,get event_mode() { return (this._states.event_mode_locked || this._states.event_mode || this._states.dialogue_mode); }
 ,set event_mode(v) { this._states.event_mode = v; }

 ,get dialogue_branch_mode() { return this._states.dialogue_branch_mode; }
 ,set dialogue_branch_mode(v) {
    let v_current = this._states.dialogue_branch_mode;
    if (Array.isArray(v_current) && Array.isArray(v)) {
      const sb_index = {};
      v.forEach(k=>sb_index[k.sb_index||0]=true);
      for (const i in sb_index)
        v_current = v_current.filter(k=>(k.sb_index||0) != i);

      const v_append = [];
      v.forEach(k=>{
        const index = v_current.findIndex(k0=>{
const keys0 = (Array.isArray(k0.key)) ? k0.key : [k0.key];
const keys1 = (Array.isArray(k.key))  ? k.key  : [k.key];
return keys0.some(kk0=>keys1.indexOf(kk0) != -1);
        });
        if (index > -1) {
          v_current[index] = k;
        }
        else {
          v_append.push(k);
        }
      });
      v = v_current.concat(v_append);
    }
    else if (typeof v == 'number') {
      if (Array.isArray(v_current)) {
        v = v_current.filter(k=>(k.sb_index||0) != v);
        if (!v.length)
          v = null;
      }
      else {
        v = null;
      }
    }
    this._states.dialogue_branch_mode = v;
  }

 ,get character_movement_disabled() { return (this._states.character_movement_disabled || (this.event_mode && !this._states.action_allowed_in_event_mode) || this.character_combat_locked || MMD_SA_options.Dungeon_options.character_movement_disabled); }
 ,set character_movement_disabled(v) { this._states.character_movement_disabled = v; }

 ,get can_parry() {
if (!this.character.combat_mode)
  return false
if (this.character_combat_locked)
  return false

var para_SA = MMD_SA.MMD.motionManager.para_SA
return (!para_SA.super_armor && (!para_SA.motion_command_disabled));
  }

 ,get character_combat_locked()  {
if (this.event_mode && !this._states.action_allowed_in_event_mode)
  return "<ALL>"

return (this._states.character_combat_locked);
  }
 ,set character_combat_locked(v) { this._states.character_combat_locked = v; }

 ,get object_click_disabled() { return (this._states.object_click_disabled || this.event_mode || (MMD_SA.WebXR.reticle && MMD_SA.WebXR.reticle.visible)); }
 ,set object_click_disabled(v) { this._states.object_click_disabled = v; }

// [extracted] check_states → js/dungeon/check_states.js

// [extracted] events_default → js/dungeon/events_default.js

// [extracted] run_event → js/dungeon/run_event.js


// [extracted] SFX_check → js/dungeon/sfx_check.js


 ,get sound() { return MMD_SA.Audio3D; }

 ,get sprite() { return MMD_SA.Sprite; }



// [extracted] multiplayer → js/dungeon/multiplayer.js


 ,blob_url: (function () {
    var cache = {}

    return {
  set: function (url) {
System._browser.load_file(url, function (xhr) {
  cache[url.replace(/^.+[\/\\]/, "")] = URL.createObjectURL(xhr.response)
});
  }

 ,get: function (name) {
return cache[name]
  }
    };
  })()

 ,seed_base: Date.now()
 ,generate_seed: function (str_list) {
var d_options = MMD_SA_options.Dungeon_options
if (!str_list) {
  str_list = [d_options.game_id, d_options.game_version, d_options.chapter_id, this.area_id]
}

var _this = str_list.join("|") + "|" + this.seed_base + "|" + Math.random()
//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
var hash = 0, i, chr;
if (_this.length === 0) return hash;
for (i = 0; i < _this.length; i++) {
  chr   = _this.charCodeAt(i);
  hash  = ((hash << 5) - hash) + chr;
  hash |= 0; // Convert to 32bit integer
}
//_random_seed
console.log("seed", _this, hash)
return hash;
  }

// [extracted] utils → js/dungeon/utils.js

  };
})();


// mersenne-twister.js
var MT;

Array.prototype.shuffleMT = function () {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
    j = Math.floor( MT.random() * ( i + 1 ) );
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }

  return this;
};

if (self._js_min_mode_ || (browser_native_mode && !webkit_window && !localhost_mode)) {
  console.log("dungeon.core.min.js")
  document.write('<script language="JavaScript" src="js/dungeon.core.min.js"></scr'+'ipt>');
}
else {
  document.write('<script language="JavaScript" src="js/mersenne-twister.js"></scr'+'ipt>');
  document.write('<script language="JavaScript" src="js/dungeon-generator.js"></scr'+'ipt>');
  document.write('<script language="JavaScript" src="js/terrain.js"></scr'+'ipt>');

  document.write('<script language="JavaScript" src="js/rbush.min.js"></scr'+'ipt>');
//document.write('<script language="JavaScript" src="node_modules/box-intersect.js"></scr'+'ipt>');

  document.write('<script language="JavaScript" src="js/nipplejs.js"></scr'+'ipt>');
}

// extracted modules (Step 6A)
SA.loader.loadScriptSync('js/dungeon/inventory.js');
SA.loader.loadScriptSync('js/dungeon/restart.js');
SA.loader.loadScriptSync('js/dungeon/multiplayer.js');

// extracted modules (Step 6B)
SA.loader.loadScriptSync('js/dungeon/check_states.js');
SA.loader.loadScriptSync('js/dungeon/events_default.js');
SA.loader.loadScriptSync('js/dungeon/run_event.js');
SA.loader.loadScriptSync('js/dungeon/sfx_check.js');
SA.loader.loadScriptSync('js/dungeon/utils.js');

// extracted modules (Step 6C)
SA.loader.loadScriptSync('js/dungeon/character.js');
SA.loader.loadScriptSync('js/dungeon/map.js');

// extracted modules (Step 6D)
SA.loader.loadScriptSync('js/dungeon/items.js');
SA.loader.loadScriptSync('js/dungeon/pc_click_reaction.js');
SA.loader.loadScriptSync('js/dungeon/skydome.js');
SA.loader.loadScriptSync('js/dungeon/motions.js');

document.write('<script>MMD_SA_options.Dungeon.init();</scr'+'ipt>');
