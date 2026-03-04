// dungeon/ui.js — UI creation: CSS, DOM, inventory drag-drop, map, status bar
// Extracted from dungeon.js MMDStarted handler (Step 6G)
// Safety: d._setupUI() is called from MMDStarted, THREE is available at that point.
(function () {
var d = MMD_SA_options.Dungeon;

d._setupUI = function () {
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

if (!MMD_SA_options.Dungeon_options.combat_mode_enabled) {
  var ctx = Cdungeon_status_bar.getContext("2d")
  ctx.globalCompositeOperation = "copy";
  ctx.drawImage(canvas_status_bar, 0,0);
  return;
}

var _hp_width = Math.round((256-56-2) * c.hp/c.hp_max)
if (!always_update && (hp_width == _hp_width))
  return
hp_width = _hp_width

var ctx = Cdungeon_status_bar.getContext("2d")

ctx.globalCompositeOperation = "copy";
ctx.drawImage(canvas_status_bar, 0,0);

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

};
})();
