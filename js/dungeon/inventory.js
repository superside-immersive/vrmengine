// inventory.js - Extracted from dungeon.js (Step 6A)

MMD_SA_options.Dungeon.inventory = (function () {
var inventory;

var INV = function (index, page_index) {
  this.index = index
  this.page_index = page_index

  this.item_id = ""
  this.item = null
  this.stock = 0
};

INV.prototype = {
  constructor: INV

 ,add: function (item_id, stock, swap_if_necessary) {
var item_id_old, stock_old;
if (swap_if_necessary && this.item_id) {
  if (this.item_id != item_id) {
    item_id_old = this.item_id
    stock_old = this.stock
  }
}

this.item = MMD_SA_options.Dungeon.item_base[item_id]
var stock_ini = (this.item_id == item_id) ? this.stock : 0
var stock_added = (this.item.stock_max && (stock + stock_ini > this.item.stock_max)) ? this.item.stock_max - stock_ini : stock
this.stock = stock_ini + stock_added
this.item_id = item_id

if (stock_added)
  this.update_UI()

if (item_id_old) {
  inventory.add(item_id_old, stock_old)
}

return stock - stock_added
  }

 ,clear: function () {
this.item_id = ""
this.item = MMD_SA_options.Dungeon.item_base._empty_
this.stock = 0

this.update_UI()
  }

 ,stock_add: function (num) {
  }

 ,update_info: function (info, display, page_index=inventory.get_page_index(this.index), index) {
if ((page_index > -1) && (page_index != inventory.page_index)) return;

if (index == null)
  index = inventory.get_UI_index(this.index);

const d = document.getElementById("Ldungeon_inventory_item" + index);

let className;
if (info) {
  inventory._item_updated = this;
  className = (display) ? 'Dungeon_inventory_item_info_display' : 'Dungeon_inventory_item_info';
  d.setAttribute("data-info", info);
}
else {
  inventory._item_updated = null;
// not accessing .info directly as it may be a getter function
  if ("info" in this.item) {
    className = 'Dungeon_inventory_item_info';
    d.setAttribute("data-info", this.item.info_short + ':\n' + this.item.info);
  }
  else {
    className = 'Dungeon_inventory_item_info_short';
  }
}
d.setAttribute("data-info_short", this.item.info_short||("Item"+index));

d.className = className;
  }

 ,update_UI: function () {
const page_index = inventory.get_page_index(this.index);
if ((page_index > -1) && (page_index != inventory.page_index)) return;

var index = inventory.get_UI_index(this.index);

var icon = document.getElementById("Ldungeon_inventory_item" + index + "_icon")
icon.src = this.item.icon.src
icon.style.opacity = 1

document.getElementById("Ldungeon_inventory_item" + index + "_border").src = item_border[this.item.rarity].src

var d_stock = document.getElementById("Ldungeon_inventory_item" + index + "_stock")
d_stock.textContent = this.stock
d_stock.style.visibility = (this.stock && (this.item.stock_max != 1)) ? "inherit" : "hidden"

const d = document.getElementById("Ldungeon_inventory_item" + index)

this.update_info(null, false, page_index,index);

d.style.visibility = (this.item.is_always_visible) ? "visible" : "inherit"
  }

 ,action_check: (function () {
    var sound_item_deny = { name:"interface_item_deny" };
    return async function () {
var action = this.item.action
if (!action) {
  MMD_SA_options.Dungeon.sound.audio_object_by_name[((this.item.sound && this.item.sound.find(function(i){return i.is_no_action})) || sound_item_deny).name].play()
  return false
}

if (!action.anytime && inventory.action_disabled) {
  const branch = MMD_SA_options.Dungeon.dialogue_branch_mode?.find(b=>b.is_closing_event);
  if (!branch) {
    MMD_SA_options.Dungeon.sound.audio_object_by_name[sound_item_deny.name].play();
    return false;
  }

  const key = (Array.isArray(branch.key)) ? branch.key[0] : branch.key;
  let code, keyCode;
  if (typeof key == 'number') {
    keyCode = key + 96;
  }
  else if (key == 'Esc') {
    code = 'Escape';
  }
  else {
    code = 'Key' + key;
  }

  document.dispatchEvent(new KeyboardEvent('keydown', { code:code, keyCode:keyCode }));

  await new Promise((resolve)=>{
    System._browser.on_animation_update.add(resolve, 0,0);
  });
}
return true;
    };
  })()
};

var item_border = {}
item_border.inactive = new Image()
System._browser.load_file(System.Gadget.path + '/images/_dungeon/item_icon.zip#/inventory/RarityBorders/mono_L-50_V11.png', item_border.inactive)
item_border.normal = new Image()
System._browser.load_file(System.Gadget.path + '/images/_dungeon/item_icon.zip#/inventory/RarityBorders/monoV11.png', item_border.normal)

var UI_muted;

inventory = {
  max_row: 4
 ,max_base: 8
 ,max_page: 3
 ,list: []

 ,page_index: 0

 ,UI: {
    info: {
      scale: 1.5
    },

    get _muted() { return UI_muted; },
    get muted() { return UI_muted || System._browser.overlay_mode; },
    set muted(v) { UI_muted = v; },
  }

 ,get_UI_index: function (idx) {
return (idx < this.max_base) ? idx : this.max_base + (idx - this.max_base) % (this.max_base*(this.max_row-1));
  }

 ,get_inventory_index: function (idx) {
return ((idx < this.max_base) || (idx > this.max_base * this.max_row)) ? idx : idx + this.page_index * this.max_base * (this.max_row-1);
  }

 ,get_page_index: function (idx) {
return (idx < this.max_base) ? -1 : Math.floor((idx - this.max_base) / (this.max_base*(this.max_row-1)));
  }

// for mobile
 ,_item_selected_index: null
 ,get item_selected_index()  { return this._item_selected_index }
 ,set item_selected_index(v) {
if (!is_mobile)
  return

if (typeof this._item_selected_index === 'number')
  document.getElementById("Ldungeon_inventory_item" + this.get_UI_index(this._item_selected_index)).style.opacity = 1;

if (v)
  v = parseInt(v)
this._item_selected_index = v

if (typeof v === 'number')
  document.getElementById("Ldungeon_inventory_item" + this.get_UI_index(v)).style.opacity = 0.75;
  }

 ,get action_disabled() { return (MMD_SA_options.Dungeon.event_mode); }

 ,initialize: function () {
let count = 0;
for (let i = 0; i < this.max_base; i++)
  this.list.push(new INV(count++, 0))

for (let p = 0; p < this.max_page; p++) {
  for (let r = 1; r < this.max_row; r++) {
    for (let i = 0; i < this.max_base; i++) {
      this.list.push(new INV(count++, p))
    }
  }
}
  }

 ,add: (function () {
var item_id

function filter(inv) {
  return !inv.item_id || (inv.item_id == item_id)
}

function sort(a, b) {
  var a_is_item = (a.item_id == item_id)
  var b_is_item = (b.item_id == item_id)
  if (a_is_item && !b_is_item)
    return -1
  if (!a_is_item && b_is_item)
    return 1
  return a.index - b.index
}

return function (id, stock) {
  item_id = id
  var success = this.list.filter(filter).sort(sort).some(function (inv, idx) {
    stock = inv.add(item_id, stock)
    if (!stock)
      return true
  });
  return success
};
  })()

 ,find: function (item_id, page_index) {
const inv = MMD_SA_options.Dungeon.inventory.list;
const page_size = this.max_base * (this.max_row-1);

let ini, end;
if (page_index == -1) {
  ini = 0;
  end = this.max_base;
}
else if (page_index != null) {
  ini = this.max_base + page_index * page_size;
  end = ini + page_size;
}
else {
  ini = 0;
  end = this.max_base + this.max_page * page_size;
}

for (let i = ini; i < end; i++) {
  if (inv[i].item_id == item_id)
    return inv[i];
}

return null;
  }

 ,unshift: function (source_index, page_index, forced) {
const inv = MMD_SA_options.Dungeon.inventory.list;
const page_size = this.max_base * (this.max_row-1);

let ini, end;
if (page_index == -1) {
  ini = 0;
  end = this.max_base;
}
else if (page_index != null) {
  ini = this.max_base + page_index * page_size;
  end = ini + page_size;
}
else {
  ini = 0;
  end = this.max_base + this.max_page * page_size;
}

let target_index;
for (let i = ini; i < end; i++) {
  if (!inv[i].item_id) {
    target_index = i;
    break;
  }
}

if (target_index != null) {
  this.swap(source_index, target_index);
  return inv[target_index];
}

if (forced)
  return this.unshift(source_index);
  }

 ,copy: function (source_index, target_index) {
this.swap(source_index, target_index, true);
  }

 ,swap: function (source_index, target_index, copy) {
var inv = MMD_SA_options.Dungeon.inventory.list

var inv_source = inv[source_index]
var inv_target = inv[target_index]
var _item_id = inv_source.item_id
var _item = inv_source.item
var _stock = inv_source.stock
if (!copy) {
  inv_source.item_id = inv_target.item_id;
  inv_source.item = inv_target.item;
  inv_source.stock = inv_target.stock;
}

inv_target.item_id = _item_id
inv_target.item = _item
inv_target.stock = _stock

if (!copy)
  inv_source.update_UI();
inv_target.update_UI();
  }

 ,update_page: function (page_index) {
if (this.page_index == page_index) return;
this.page_index = page_index;

var ini = this.max_base + page_index * this.max_base * (this.max_row-1);
var end = ini + this.max_base * (this.max_row-1);
//DEBUG_show(ini+'/'+end,0,1)
for (let i = ini; i < end; i++)
  this.list[i].update_UI();
  }

 ,reset: function () {
var that = this

this.item_selected_index = null

this.list.forEach(function (inv) {
  inv.clear()
});

for (var id in MMD_SA_options.Dungeon.item_base) {
  var item = MMD_SA_options.Dungeon.item_base[id]
  item.reset && item.reset()
  if (item.index_default >= 0) {
    this.list[item.index_default].add(id, item.stock_default||1, true)
  }
  else if (item.stock_default) {
    this.add(id, item.stock_default)
  }
}

var options = MMD_SA_options.Dungeon_options
if (options.inventory && options.inventory.list) {
  options.inventory.list.forEach(function (item) {
if (item.index == null)
  that.add(item.item_id, item.stock)
else
  that.list[item.index].add(item.item_id, item.stock)
  });
}
  }
};

return inventory;
})();
