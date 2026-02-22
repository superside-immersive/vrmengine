// Extracted from dungeon.js — Item definitions, grid material defaults, inventory init
// Called from Dungeon.init() as this._initItems()

(function () {
var Dungeon = MMD_SA_options.Dungeon;

Dungeon._initItems = function () {
var options = MMD_SA_options.Dungeon_options;

// dungeon general options default START
this.grid_material_list = options.grid_material_list || [
// ceil
  {
  map: System.Gadget.path + "\\images\\_dungeon\\tex\\3dtextures.me\\Stone Wall 002\\Stone_Wall_002_COLOR_AO.jpg"
 ,normalMap: System.Gadget.path + "\\images\\_dungeon\\tex\\3dtextures.me\\Stone Wall 002\\Stone_Wall_002_NRM.jpg"
 ,geo_by_lvl: [[1,1]]
 ,distance_by_lvl: []
  }
// floor
 ,{
  map: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Floor 003/Pavement_006_COLOR_AO-50.jpg"
 ,normalMap: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Floor 003/Pavement_006_NRM_c80.jpg"
 ,specularMap: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Floor 003/Pavement_006_SPEC_c80.jpg"
// ,displacementMap: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Floor 003/Pavement_006_DISP_256x256.png"
// ,uDisplacementBias: -0.5
 ,geo_by_lvl: [[1,1]]// [[1,1],[16,16],[32,32],[128,128]]//
 ,distance_by_lvl: []// [1,2,4]//
  }
// wall
 ,{
  map: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Wall 004/Wall Stone 004_COLOR_AO.jpg"
 ,normalMap: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Wall 004/Wall Stone 004_NRM_c80.jpg"
 ,specularMap: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Wall 004/Wall Stone 004_SPEC_c90.jpg"
// ,displacementMap: System.Gadget.path + "/images/_dungeon/tex/3dtextures.me/Stone Wall 004/Wall Stone 004_DISP_256x256.png"
// ,uDisplacementScale: 3
 ,geo_by_lvl: [[1,1]]// [[1,1],[16,16],[32,32],[128,128]]//
 ,distance_by_lvl: []// [1,3,5]//
  }
];

if (options.inventory) {
  if (options.inventory.max_base)
    this.inventory.max_base = options.inventory.max_base
  if (options.inventory.max_row)
    this.inventory.max_row  = options.inventory.max_row
  if (options.inventory.UI) {
    if (options.inventory.UI.info)
      Object.assign(this.inventory.UI.info, options.inventory.UI.info);
    this.inventory.UI.muted = options.inventory.UI.muted;
  }
}
this.inventory.initialize()

this.item_base = options.item_base || {}

this.item_base._empty_ = Object.assign({
  icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/empty.gif'
 ,rarity: "inactive"
 ,info_short: "Empty"
}, this.item_base._empty_||{});

this.item_base._backpack_ = Object.assign({
  icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/fantasy_icon/backpack_64x64.png'
 ,get info_short() { return System._browser.translation.get('Dungeon.UI.backpack'); }
 ,index_default: MMD_SA_options.Dungeon.inventory.max_base-1
 ,is_base_inventory: true
// ,is_always_visible: true
 ,stock_max: 1
 ,sound: [
    {
  url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/interface/interface2.aac"
 ,name: "item_backpack"
 ,is_drag: true
    }
  ]
 ,action: {
    func: function () {
if (System._browser.overlay_mode) {
  if (Ldungeon_inventory.style.visibility == "hidden")
    Ldungeon_inventory.style.visibility = "inherit"
  else if (Ldungeon_inventory_backpack.style.visibility != "hidden")
    Ldungeon_inventory.style.visibility = Ldungeon_inventory_backpack.style.visibility = "hidden"
  else
    Ldungeon_inventory_backpack.style.visibility = "inherit"
}
else {
  Ldungeon_inventory_backpack.style.visibility = (Ldungeon_inventory_backpack.style.visibility != "hidden") ? "hidden" : "inherit"
}

if (Ldungeon_inventory_backpack.style.visibility != 'hidden') {
  MMD_SA_options.Dungeon.inventory.update_page(0);
}

//Ldungeon_inventory.style.posLeft = Ldungeon_inventory_backpack.style.posLeft = (B_content_width - (MMD_SA_options.Dungeon.inventory.max_base)*64) * ((System._browser.overlay_mode && (Ldungeon_inventory.style.visibility == "hidden")) ? 1 : 0.5);

if (MMD_SA_options.Dungeon.nipplejs_manager)
  Ljoystick.style.visibility = ((Ldungeon_inventory_backpack.style.visibility != "hidden") || MMD_SA_options.Dungeon_options.joystick_disabled) ? "hidden" : "inherit"
    }
   ,anytime: true
  }
}, this.item_base._backpack_||{});

const Bag = (()=>{
  function clone(inv) {
const page_index = this._page_index;

const inventory = MMD_SA_options.Dungeon.inventory;
const _inv = inventory.find('bag'+addZero(page_index), page_index)
//DEBUG_show(_inv?.index||-1,0,1)
if (!_inv) {
  inventory.copy(inv.index, inventory.max_base + page_index * inventory.max_base * (inventory.max_row-1));
}
  }

  function action(item, inv) {
const page_index = this._page_index;

clone.call(this, inv);

Ldungeon_inventory_backpack.style.visibility = 'inherit';

const inventory = MMD_SA_options.Dungeon.inventory;
if (inventory.page_index != page_index) {
  this._page_index_ = inventory.get_page_index(inv.index);
  MMD_SA_options.Dungeon.inventory.update_page(page_index);
}
else {
  MMD_SA_options.Dungeon.inventory.update_page(Math.max(this._page_index_,0));
}
  }

  const Bag = function (page_index) {
this._page_index = page_index;

this.icon_path = System.Gadget.path + '/images/_dungeon/item_icon.zip#/misc_icon/bag_64x64.png';
this.info_short = "Bag";
//   ,index_default: MMD_SA_options.Dungeon.inventory.max_base
this.stock_max = 1;
this.sound = [{
  url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/interface/interface2.aac",
  name: "item_backpack",
  is_drag: true,
}];

this.action = {
  func: (item, inv)=>{ return action.call(this, item, inv); },
  anytime: true,
}
  };

  Bag.prototype.on_drop = function (item, inv) {
const page_index = this._page_index;

clone.call(this, inv);

const inventory = MMD_SA_options.Dungeon.inventory;
inventory.unshift(inv.index, (inventory.page_index != page_index) ? page_index : this._page_index_);
/*
System._browser.on_animation_update.add(()=>{
  item.update_UI();
  inv.update_UI();
},0,0);
*/
  };

  return Bag;
})();

this.item_base.bag01 = Object.assign(new Bag(1), this.item_base.bag01||{});
this.item_base.bag02 = Object.assign(new Bag(2), this.item_base.bag02||{});

this.item_base._map_ = Object.assign({
  icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/fantasy_icon/map_64x64.png'
 ,info_short: "Map"
 ,index_default: MMD_SA_options.Dungeon.inventory.max_base-2
 ,stock_max: 1
 ,action: {
    func: function () {
Ldungeon_map.style.visibility = (Ldungeon_map.style.visibility != "hidden") ? "hidden" : "inherit"
    }
   ,anytime: true
  }
}, this.item_base._map_||{});

this.item_base.menu = Object.assign({
  icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/fantasy_icon/tome_64x64.png'
 ,info_short: "Tome (Menu)"
 ,index_default: MMD_SA_options.Dungeon.inventory.max_base
 ,stock_max: 1
 ,sound: [
    {
  url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPGsounds_Kenney/bookOpen.ogg"
 ,name: "item_book_open"
 ,is_drag: true
    }
  ]
 ,action: {
    func: function () { MMD_SA_options.Dungeon.run_event("_MENU_",0); }
// ,anytime: true
  }
}, this.item_base.menu||{});
this.events_default["_MENU_"] = [
//0
      [
        {
          message: {
  content: "1. Restart\n2. Player Manual\n3. Settings\n4. Misc\n5. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:6 }
   ,{ key:3, branch_index:7 }
   ,{ key:4, branch_index:8 }
   ,{ key:5 }
  ]
          }
        }
      ]
//1
     ,[
        {
          message: {
  content: "1. Restart\n2. Restart (full)\n3. Cancel"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:2 }
   ,{ key:2, branch_index:4 }
   ,{ key:3 }
  ]
          }
        }
      ]
//2
     ,[
        {
          message: {
  content: "This will restart the game, preserving all procedurally generated maps and content.\n1. OK\n2. Cancel"
 ,bubble_index: 3
 ,para: { scale:1.5, font_scale:1 }
 ,branch_list: [
    { key:1, branch_index:3 }
   ,{ key:2 }
  ]
          }
        }
      ]
//3
     ,[
        {
          load_area: { id:'start', refresh_state:1 }
        }
      ]
//4
     ,[
        {
          message: {
  content: "This will restart the game, resetting all procedurally generated maps and content.\n1. OK\n2. Cancel"
 ,bubble_index: 3
 ,para: { scale:1.5, font_scale:1 }
 ,branch_list: [
    { key:1, branch_index:5 }
   ,{ key:2 }
  ]
          }
        }
      ]
//5
     ,[
        {
          load_area: { id:'start', refresh_state:0 }
        }
      ]
//6
     ,[
        {
          goto_event: { id:"_PLAYER_MANUAL_", branch_index:0 }
        }
      ]
//7
     ,[
        {
          goto_event: { id:"_SETTINGS_", branch_index:0 }
        }
      ]
//8
     ,[
        {
          goto_event: { id:"_MISC_", branch_index:0 }
        }
      ]
];

if (!this.item_base.coin) {
  this.item_base.coin = {
    icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/fantasy_icon/coin_64x64.png'
   ,info_short: "Gold Coin"
   ,stock_max: 999999
   ,sound: [
      {
  url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/inventory/coin3.aac"
 ,name: "item_coin"
 ,is_drag: true
 ,is_no_action: true
      }
    ]
  };
}

if (!this.item_base.potion_hp_50) {
  this.item_base.potion_hp_50 = {
    icon_path: System.Gadget.path + '/images/_dungeon/item_icon.zip#/potions/pt1_64x64.png'
   ,info_short: "HP Potion (M)"
   ,stock_max: 9
   ,sound: [
      {
  url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/inventory/bubble2.aac"
 ,name: "item_potion_drink01"
      }
     ,{
  url: System.Gadget.path + "/sound/SFX_pack01.zip#/RPG Sound Pack/inventory/bottle.aac"
 ,name: "item_potion01"
 ,is_drag: true
      }
    ]
   ,action: {
  func: function () {
var c = MMD_SA_options.Dungeon.character
if (c.hp == c.hp_max)
  return true
c.hp_add(c.hp_max/2)
  }
    }
  };
}

[
  System.Gadget.path + '/images/_dungeon/item_icon.zip#/inventory/BlankSlot.png'
].forEach(function (url) {
  MMD_SA_options.Dungeon.blob_url.set(url)
});

var d = this;
window.addEventListener("jThree_ready", function () {
  for (var id in d.item_base) {
    var item = d.item_base[id]
    if (!item.rarity)
      item.rarity = "normal"
    item.icon = new Image()
    System._browser.load_file(item.icon_path, item.icon)
  }
});
// dungeon general options default END
};

})();
