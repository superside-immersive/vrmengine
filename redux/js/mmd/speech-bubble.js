// MMD_SA SpeechBubble
// Extracted from MMD_SA.js (SpeechBubble IIFE property)

window.MMD_SA_createSpeechBubble = function () {
    var bb_cache = {}


    var bb_list = []

    function SB(index, para) {
this.index = index || '';

bb_list.push(this);
this.list = bb_list

this.bubble_index = -1

// this is always true now basically
this.use_sprite = true

this._canvas = null
this._txr = null
this._mesh = null
this.loaded = false

this.flipH_side = false
this.flipH_bubble = false

this.msg_group = {
  group_name_current: "",
  group_by_name: {}
};

this.msg = ""
this.msg_timerID = null

this.visible = false

this.hidden_time_ref = Date.now()

this.bubbles = [
  {
    image_url:System.Gadget.path+'/images/SB_kakukaku01.png'
   ,font: '"Segoe Print",fantasy'
   ,font_unicode: 'DFKai-SB,"Microsoft JhengHei"'
   ,font_size: 18
//   ,column_max: 50-3
//   ,column_max_unicode: 25
   ,row_max: 8
   ,auto_wrap: true

   ,bounding_box: [43-4,123-8, 452,252]
   ,left_sided: true
  },

  {
    image_url:System.Gadget.path+'/images/SB_irregular01.png'
   ,font: '"Segoe Print",fantasy'
   ,font_unicode: 'DFKai-SB,"Microsoft JhengHei"'
   ,font_size: 18
//   ,column_max: 36-3
//   ,column_max_unicode: 18
   ,row_max: 8
   ,auto_wrap: true

   ,bounding_box: [135-4,144-8, 313,221]
  },

  {
    image_url:System.Gadget.path+'/images/SB_mokumoku01.png'
   ,font: '"Segoe Print",fantasy'
   ,font_unicode: 'DFKai-SB,"Microsoft JhengHei"'
   ,font_size: 18
//   ,column_max: 42-3
//   ,column_max_unicode: 21
   ,row_max: 8
   ,auto_wrap: true

   ,bounding_box: [87-4,133-8, 373,233]
   ,left_sided: true
  },

  {
    image_url:System.Gadget.path+'/images/SB_mokumoku01a.png'
   ,font: '"Segoe Print",fantasy'
   ,font_unicode: 'DFKai-SB,"Microsoft JhengHei"'
   ,font_size: 18
//   ,column_max: 42-3
//   ,column_max_unicode: 21
   ,row_max: 8
   ,auto_wrap: true

   ,bounding_box: [87-4,133-8, 373,233]
   ,left_sided: true
  }
];

para && Object.assign(this, para);
    }

    SB.prototype.create = function (index) { return new SB(index) };

    SB.prototype.init = function () {
bb_list.forEach((b)=>{ b._init() });
    };

    SB.prototype._init = function () {
for (var i = 0, i_length = this.bubbles.length; i < i_length; i++) {
  let b = this.bubbles[i]
  let cache = bb_cache[b.image_url]
  if (!cache) {
    cache = bb_cache[b.image_url] = new Image()
    cache.src = toFileProtocol(b.image_url)
  }
  b.image = cache
}

  MMD_SA_options.mesh_obj_preload_list.push({ id:'SpeechBubbleMESH' + this.index, create:function () {
const THREE = MMD_SA.THREEX.THREE;

const material = new THREE.SpriteMaterial({
  map: new THREE.Texture(document.createElement('canvas')),
  sizeAttenuation: false,
  depthTest: false,
});

if (!MMD_SA.THREEX.enabled) {
  material.useScreenCoordinates = false;
  material.scaleByViewport = false;
}
else {
  material.map.colorSpace = THREE.SRGBColorSpace;
//  material.depthWrite = false;
}

const sprite = new THREE.Sprite( material );

if (MMD_SA.THREEX.enabled) {
  window.addEventListener('MMDStarted', ()=>{sprite.renderOrder = 999;});
  sprite.layers.enable(MMD_SA.THREEX.PPE.UnrealBloom.NO_BLOOM);
//  sprite.layers.enable(MMD_SA.THREEX.PPE.N8AO.AO_MASK);
}

return sprite;
  } });

    };

    SB.prototype.onload = function () {
bb_list.forEach((b)=>{ b._onload() });
    };

    SB.prototype._onload = function () {
this.loaded = true

for (var i = 0, i_length = this.bubbles.length; i < i_length; i++) {
  let b = this.bubbles[i]
  let bb_f = b.bounding_box_flipH = b.bounding_box.slice(0)
  bb_f[0] = b.image.width - bb_f[0] - bb_f[2]
}

this._mesh = MMD_SA.THREEX.mesh_obj.get_three('SpeechBubbleMESH' + this.index);
this._txr = this._mesh.material.map;
this._canvas = this._txr.image;
this._mesh.renderDepth = 0

this.pos_base_ref = {
  center: new THREE.Vector3()
 ,dir: new THREE.Vector3()
 ,character_pos_ref: new THREE.Vector3()
 ,_v3: new THREE.Vector3()
};
    };

    SB.prototype.get_flipH_bubble = function (msg_changed) {
var rot = this._mesh._rotation || ((this.use_sprite) ? {x:0,y:0,z:0} : this._mesh.rotation)

var flipH_bubble = (Math.PI/2 - Math.abs(rot.y) < Math.PI/20) ? ((msg_changed) ? false : ((this.flipH_side) ? !this.flipH_bubble : this.flipH_bubble)) : rot.z
if (this.flipH_side)
  flipH_bubble = !flipH_bubble

return !!flipH_bubble
    };

    SB.prototype.update_bubble = function (flipH_bubble, para) {
if (!para)
  para = this.para;
this.flipH_bubble = flipH_bubble

bubble_index = this.bubble_index
var b = this.bubbles[bubble_index]

msg = this.msg.replace(/\{\{(.+?)\}\}/g, function (match, p1) { return eval(p1) })

var canvas = this._canvas;
var context = this._context;
if (!context) {
  context = this._context = canvas.getContext('2d');
// NOTE: In THREEX, texture's dimension has to be fixed once initialized
  let w_max = 0, h_max = 0;
  this.bubbles.forEach(b=>{
    w_max = Math.max(b.image.width);
    h_max = Math.max(b.image.height);
  });
  canvas.width = w_max;
  canvas.height = h_max;
}
else {
  context.clearRect(0,0,canvas.width,canvas.height);
}

// CJK detection
// http://stackoverflow.com/questions/1366068/whats-the-complete-range-for-chinese-characters-in-unicode
// http://kourge.net/projects/regexp-unicode-block

var use_ascii = !/^(ja|zh)/.test(System._browser.translation.language) && (/^[\x00-\x7F]+$/.test(msg) || !/[^\x00-\x7F]{6}.*[^\x00-\x7F]{6}/.test(msg));
//DEBUG_show((!b.column_max_unicode && !para.column_max_unicode)+'/'+use_ascii+"",0,1)
var font = para.font || b.font
var font_size = para.font_size || b.font_size
var column_max = para.column_max || b.column_max || parseInt(b.bounding_box[2]/font_size*2)
var column_max_ascii = column_max
var row_max = para.row_max || b.row_max || 10
if (!use_ascii) {
  font = para.font_unicode || System._browser.translation.font || b.font_unicode || font;
  column_max = para.column_max_unicode || b.column_max_unicode || column_max;//Math.round(column_max*0.5);
  row_max = para.row_max_unicode || b.row_max_unicode || row_max;
}
var column_unicode_scale = column_max_ascii / column_max

var row = msg.replace(/\n+/, "\n").split("\n").length - 1
row += Math.max((msg.length - row * column_max*0.5) / column_max , 0)
var font_scale
if (para.font_scale)
  font_scale = para.font_scale
else if (row <= 2)
  font_scale = 2
else if (row <= row_max/2)
  font_scale = 1.5
else
  font_scale = 1
if (font_scale != 1) {
  font_size = parseInt(font_size * (font_scale * 0.9))
  column_max_ascii = parseInt(column_max_ascii/font_scale)
  column_max = parseInt(column_max/font_scale)
}

context.globalAlpha = MMD_SA_options.SpeechBubble_opacity || ((System._browser.overlay_mode > 1) && 1) || ((Math.max(MMD_SA.THREEX.SL.width, MMD_SA.THREEX.SL.height) < 1280) ? 0.9 : 0.8);
context.font = "bold " + font_size + 'px ' + font
context.textBaseline = 'top'

context.save()

//if (para.invertH_side) flipH_bubble=!flipH_bubble
var flipH, flipV;
flipV = (MMD_SA_options.camera_type=='Ort');
flipH = !!flipH_bubble ^ flipV;
if (flipV || flipH) {
  context.translate((flipH)?canvas.width:0, (flipV)?canvas.height:0);
  context.scale((flipH)?-1:1, (flipV)?-1:1);
}
context.drawImage(b.image, 0,0)

context.restore()

context.globalAlpha = 1

var msg_line
if ((msg.length > column_max) && ((para.auto_wrap || b.auto_wrap) || (msg.indexOf("\n") == -1))) {
  msg_line = []
  var ini = 0
  var end = 0
  var i = -1
  while (ini < msg.length) {
    i++

    var column_count = 0
    var char_count = 0
    while ((ini+char_count < msg.length) && (column_count < column_max_ascii)) {
      column_count += (msg.charCodeAt(ini+char_count) > 255) ? column_unicode_scale : 1
      char_count++
    }

    var bw = b.bounding_box[2] + 5
    var msg_length = msg.length - ini
    while (context.measureText(msg.substr(ini, Math.min(msg_length, char_count))).width > bw) {
      char_count--
    }

    if ((i == row_max-1) && (msg.length-ini > char_count)) {
      end = char_count - 3
      msg_line[i] = msg.substr(ini, end) + "..."
      break
    }

    end = Math.min(msg.length-ini, char_count)
    var line = msg.substr(ini, end).replace(/^\n+/, function (match) { ini += match.length; end -= match.length; return ""; })
    if (/(\n+)/.test(line)) {
      const break_index = line.indexOf(RegExp.$1);
//DEBUG_show(break_index,0,1)
      msg_line[i] = msg.substr(ini, break_index)
      ini += break_index + RegExp.$1.length
      continue
    }
    if (/^(\s)/.test(line)) {
      const s_length = RegExp.$1.length
      ini += s_length
      end -= s_length
    }

    if (para.no_word_break && use_ascii && (ini+end < msg.length)) {
      if (/^([^\s]+)/.test(msg.substring(ini+end-1))) {
        end += RegExp.$1.length;
      }
    }

    var tail_length = 5;
    if ((ini+end < msg.length) && (end > tail_length*2)) {
      let msg_tail = msg.substr(ini+end-tail_length, tail_length);
      if (/(\s+)/.test(msg_tail)) {
        const break_index = msg_tail.indexOf(RegExp.$1) + (end-tail_length);
        msg_line[i] = msg.substr(ini, break_index)
        ini += break_index + RegExp.$1.length
        continue
      }
      msg_tail += msg.charAt(ini+end)
      if (/\w{4}$/.test(msg_tail)) {
        end -= 1
        msg_line[i] = msg.substr(ini, end) + "-"
        ini += end
        continue
      }
    }

    msg_line[i] = msg.substr(ini, end)
    ini += end
  }
}
else
  msg_line = msg.split("\n")

this.msg_line = msg_line;

const msg_obj_old = this.msg_obj;
this.msg_obj = msg_line.map(msg=>{
  return {};
});

var w_max = 0, h_max = font_size
for (let i = 0, i_length = msg_line.length; i < i_length; i++) {
  const _msg = msg_line[i];
  const m = context.measureText(_msg);
  this.msg_obj[i].w = m.width;
  if (w_max < m.width)
    w_max = m.width;

  let b_length;
  if (_msg.indexOf('➕➖') == _msg.length-2) {
    b_length = 2;
  }
  else if (_msg.indexOf('⬅️➡️') == _msg.length-4) {
    b_length = 4;
  }

  if (b_length) {
    const msg_width = context.measureText(_msg.substring(0, _msg.length-b_length)).width;
    const button_width = context.measureText(_msg.substring(_msg.length-b_length)).width;

    const ev = (b_length == 2) ? [{ key:'+' }, { key:'-' }] : [{ code:'ArrowLeft' }, { code:'ArrowRight' }];

    const id = _msg.replace(/\:.+$/, '');
    const b_list_old = msg_obj_old?.[i]?.b_list;
    const msg_identical = id == b_list_old?.[0].id;

    this.msg_obj[i].b_list = [
{ id:id, w:msg_width, _mouse_:(msg_identical)?b_list_old[0]._mouse_:{} },
{ w:msg_width+button_width/2, event:ev[0], _mouse_:(msg_identical)?b_list_old[1]._mouse_:{}, b:_msg.substring(_msg.length-b_length,   _msg.length-b_length/2) },
{ w:msg_width+button_width,   event:ev[1], _mouse_:(msg_identical)?b_list_old[2]._mouse_:{}, b:_msg.substring(_msg.length-b_length/2, _msg.length) },
    ];
  }
}

var w = w_max
var h = msg_line.length * h_max + (msg_line.length-1) * 10
var bb = (flipH_bubble) ? b.bounding_box_flipH : b.bounding_box
var x = bb[0] + parseInt((bb[2] - w)/2) + ((para.text_offset && para.text_offset.x) || 0)
var y = bb[1] + parseInt((bb[3] - h)/2) + ((para.text_offset && para.text_offset.y) || 0)

context.fillStyle = "black"

context.save()

flipH = !!System._browser.camera.mirror_3D ^ flipV;
if (flipV || flipH) {
  context.translate((flipH)?canvas.width:0, (flipV)?canvas.height:0);
  context.scale((flipH)?-1:1, (flipV)?-1:1);
}

var branch_index = -1
for (var i = 0, i_length = msg_line.length; i < i_length; i++) {
  if (MMD_SA_options.SpeechBubble_branch) {
    if (MMD_SA_options.SpeechBubble_branch.RE.test(msg_line[i]))
      branch_index = RegExp.$1
    let fillStyle = (branch_index != -1) ? ((branch_index == this._drag_key_) ? 'Green' : (MMD_SA_options.SpeechBubble_branch.fillStyle || 'Navy')) : 'black';
    if ((MMD_SA_options.SpeechBubble_branch.confirm_keydown || (MMD_SA_options.SpeechBubble_branch.use_cursor !== false)) && (this._branch_key_ != null)) {
      if ((branch_index != -1) && (branch_index == this._branch_key_)) {
        fillStyle = 'red'
      }
    }
    context.fillStyle = fillStyle
  }

  const y_final = y + i*(h_max+10);
  context.fillText(msg_line[i], x, y_final);

  const msg_obj = this.msg_obj[i];
  msg_obj.branch_key = (branch_index == -1) ? null : branch_index;
  msg_obj.x = x;
  msg_obj.y = y_final;
  msg_obj.h = h_max+10;
}

context.restore()

this._txr.needsUpdate = true
    };

    SB.prototype.message = function (bubble_index, msg, duration, para) {
this._duration = duration;

if (!para)
  para = {};
this.para = para;

var group = para.group
var msg_group = this.msg_group
var group_name_current = msg_group.group_name_current
if (group_name_current && (!group || (group.name != group_name_current))) {
  delete msg_group.group_by_name[group_name_current]
  msg_group.group_name_current = ""
}

var our_group
if (group) {
  our_group = msg_group.group_by_name[group.name]
  if (our_group) {
    if (para.group_index == null) {
      if (!our_group.list_locked) {
        para.group_index = our_group.list.length
        our_group.list.push([bubble_index, msg, duration, para])
      }
      return
    }
    our_group.list_locked = true
    if (para.group_index != our_group.index)
      return
  }
  else {
// It is recommended that group_index (0) is always manually assigned for the first (and only the first) message in a message group.
// - to prevent repeated addition of message group list if the same message group is called more than once while it is still active
    para.group_index = 0
    msg_group.group_name_current = group.name
    our_group = msg_group.group_by_name[group.name] = { index:-1, para:group, list:[[bubble_index, msg, duration, para]] }
  }
}

if (this.msg_timerID) {
  clearTimeout(this.msg_timerID)
  this.msg_timerID = null
}

var msg_changed = (this.bubble_index != bubble_index) || (this.msg != msg) || para.always_update;
var b = this.bubbles[bubble_index]

var para_SA = MMD_SA.MMD.motionManager.para_SA

var cam = MMD_SA.camera_position

var head_pos = para.head_pos || MMD_SA._head_pos;//MMD_SA.get_bone_position(THREE.MMD.getModels()[0].mesh, "頭");//

var x_diff = cam.x - head_pos.x
var left_sided = b.left_sided
if (para.flipH)
  left_sided = !left_sided
var flipH_side = (para.flipH_side != null) ? para.flipH_side : (Math.abs(x_diff) < 2) ? ((msg_changed) ? false : this.list[0].flipH_side) : ((left_sided) ? (x_diff>0) : (x_diff<0))
if (!!para.invertH_side ^ !!this.invertH_side) {
  flipH_side = !flipH_side
}
if (para_SA.SpeechBubble_flipH)
  flipH_side = !flipH_side
this.flipH_side = !!flipH_side

var pos_mod = (para.pos_mod) || para_SA.SpeechBubble_pos_mod || b.pos_mod || ((MMD_SA_options.model_para_obj_all.length>1) ? [-2,2,-5] : [0,0,0])
var x_mod = ((flipH_side && !left_sided) || (!flipH_side && left_sided)) ? -13 : 13;
x_mod /= this.get_fov_factor(true);

this.distance_scale = (para.distance_scale || 1) * Math.min(Math.pow(MMD_SA.camera_position.distanceTo(THREE.MMD.getModels()[0].mesh.position)/30,2), 1);
this.scale = (para.scale || 1) * (MMD_SA_options.SpeechBubble_scale||1)

this.pos_base_ref.center.copy(head_pos);
this.pos_base_ref.dir.set(
  x_mod + pos_mod[0] * ((x_mod > 0) ? 1 : -1)
 ,2.5 + pos_mod[1]
 ,pos_mod[2]
);
this.pos_base_ref.character_pos_ref.copy(THREE.MMD.getModels()[0].mesh.position)

if (para.pos_fixed || MMD_SA_options.SpeechBubble_pos_fixed) {
  let pos_fixed;
  if (para.pos_fixed) {
    this._pos_fixed = para.pos_fixed;
  }
  else {
    const xy = (Array.isArray(MMD_SA_options.SpeechBubble_pos_fixed)) ? MMD_SA_options.SpeechBubble_pos_fixed : ((SL.width > SL.height)  ? [[-0.4,0.2], [0.4,0.2]] : [[-0.2,0.4], [0.2,-0.4]]);
    this._pos_fixed = xy[this.index||0];
  }
}
else {
  this._pos_fixed = null;
}

this.update_position()

var flipH_bubble = this.get_flipH_bubble(msg_changed)

if (msg_changed || (this.flipH_bubble != flipH_bubble)) {
  this.bubble_index = bubble_index
  this.msg = msg

  this.update_bubble(flipH_bubble, para)
}

this.show()

if (duration == null)
  duration = 2000 + ((msg.length > 10) ? (msg.length - 10) * 100 : 0)
if (duration) {
  let that = this
  this.msg_timerID = setTimeout(function () {
that.msg_timerID = null
that.hide()

if (our_group) {
  that.msg_timerID = setTimeout(function () {
    our_group.index += (our_group.index == -1) ? 2 : 1
    if (our_group.index >= our_group.list.length) {
      if (!our_group.para.loop || !(our_group.para.loop--)) {
        delete msg_group.group_by_name[group_name_current]
        msg_group.group_name_current = ""
        return
      }
      our_group.index = 0
      if (our_group.para.allow_shuffle)
        our_group.list.shuffle()
    }
    var g = our_group.list[our_group.index]
    that.message(g[0], g[1], g[2], g[3])
  }, (our_group.para.interval||2000));
}
  }, duration);
}
    };

    Object.defineProperty(SB.prototype, 'pos_fixed', {
      get: function () {
return this.para?.pos_fixed || (MMD_SA_options.Dungeon?.dialogue_branch_mode && this._pos_fixed);
      }
    });

    SB.prototype.update_position = function (scale) {
if (!scale)
  scale = 1

var is_portrait, is_landscape
if (is_mobile && screen.orientation) {
  if (/landscape/.test(screen.orientation.type))
    is_landscape = true
  else
    is_portrait = true
}

if (this.pos_fixed) {
  const v3_screen = MMD_SA.TEMP_v3.set(
    this._pos_fixed[0]
   ,this._pos_fixed[1]
   ,0.5
  );

  const camera = MMD_SA._trackball_camera.object;
  v3_screen.unproject(camera).sub(camera.position).normalize();
  const v3_look_at = MMD_SA._v3a.copy(v3_screen).applyQuaternion(MMD_SA.TEMP_q.copy(camera.quaternion).conjugate());
//DEBUG_show(this.index||0+':\n'+v3_look_at.toArray().join('\n'));
  v3_screen.multiplyScalar(10/Math.abs(v3_look_at.z)).add(camera.position);

  this._mesh.position.copy(v3_screen);
}
else {
  this._mesh.position.copy(this.pos_base_ref.dir).multiplyScalar(this.distance_scale * ((is_portrait && 0.25) || 1) * scale).add(this.pos_base_ref._v3.copy(this.pos_base_ref.center).sub(this.pos_base_ref.character_pos_ref).add(THREE.MMD.getModels()[0].mesh.position));

  if (MMD_SA.THREEX.enabled && MMD_SA.THREEX._object3d_list_) {
    this._pos0 = (this._pos0||new THREE.Vector3()).copy(this._mesh.position);
    this._mesh.position.sub(MMD_SA._trackball_camera.object.position).normalize().multiplyScalar(2).add(MMD_SA._trackball_camera.object.position);
  }
}

this._mesh.scale.set(1,1,1).multiplyScalar(this.scale * scale * ((is_landscape && 1.5) || 1) * ((this.use_sprite)?1/3:1))

//this.pos_base.copy(this._mesh.position).sub(this.pos_base_ref.character_pos_ref)
   };

    SB.prototype.update_placement = function (enforced) {
function update_placement() {
  if (bb_list.some(b=>b._pos_fixed)) {
    MMD_SA._trackball_camera.object.updateMatrixWorld();
  }

  bb_list.forEach(b=>{b._update_placement(enforced)});
}

if (!MMD_SA_options.use_speech_bubble)
  return

window.removeEventListener('SA_MMD_before_render', update_placement);
window.addEventListener('SA_MMD_before_render', update_placement, {once:true});
    };

    SB.prototype._update_placement = function (enforced) {
var mesh = this._mesh
if (!mesh.visible)
  return

let scale;
if (this.pos_fixed) {
  scale = 1;
}
else {
  let dis = ((MMD_SA.THREEX.enabled && MMD_SA.THREEX._object3d_list_ && this._pos0) || this._mesh.position).distanceTo(MMD_SA._trackball_camera.object.position);
  scale = (!this.use_sprite && (dis > 32)) ? 1 + (dis-32)/64 : 1;

  if (1) {//!this.index) {
    let sight_v3 = MMD_SA._v3a.copy(MMD_SA._trackball_camera.object._lookAt).sub(MMD_SA._trackball_camera.object.position).normalize()
    let PC_v3 = MMD_SA._v3b.copy(this.pos_base_ref.center).sub(MMD_SA._trackball_camera.object.position).normalize()
    if ((dis < 20) || (sight_v3.angleTo(PC_v3) > Math.PI/4)) {
      this.pos_base_ref.center.copy(sight_v3).multiplyScalar(30+MMD_SA.center_view[2]*1).add(MMD_SA._trackball_camera.object.position);
    }
  }
}

this.update_position(scale)

mesh._rotation = MMD_SA.face_camera(this.position, null, true)
if (!this.use_sprite)
  mesh.rotation.copy(mesh._rotation)

var flipH_bubble = this.get_flipH_bubble()
if (enforced || (flipH_bubble != this.flipH_bubble)) {
  this.update_bubble(flipH_bubble)
}
    };

    Object.defineProperty(SB.prototype, 'position', {
get: function () { return this._mesh.position }
    });

    SB.prototype.show = function () {
if (!this.visible) {
  this.visible = true
  window.dispatchEvent(new CustomEvent("SA_SpeechBubble_show" + this.index));
}
MMD_SA.THREEX.mesh_obj.get( "SpeechBubbleMESH" + this.index ).show();
    };

    Object.defineProperty(SB.prototype, 'hidden_time', {
get: function () { return ((this.visible) ? 0 : Date.now() - this.hidden_time_ref) }
    });

    SB.prototype.hidden_time_check = function (duration) {
if (this.hidden_time < duration)
  return false

if (Math.random() < 0.5) {
  this.hidden_time_ref += random(duration)
  return false
}

return true
    };

    SB.prototype.hide = function () {
if (this.msg_timerID) {
  clearTimeout(this.msg_timerID)
  this.msg_timerID = null
}

if (this.visible) {
  this.msg = "";
  this._branch_key_ = this._drag_key_ = null;

  this.hidden_time_ref = Date.now()

  this.visible = false
  window.dispatchEvent(new CustomEvent("SA_SpeechBubble_hide" + this.index));
}

MMD_SA.THREEX.mesh_obj.get( "SpeechBubbleMESH" + this.index ).hide();
    };

    SB.prototype.get_fov_factor = function (enforced=MMD_SA.THREEX.enabled) {
// https://github.com/mrdoob/three.js/issues/12150
      return (enforced) ? 1 / (Math.tan(MMD_SA.THREEX.camera.obj.fov/2 * Math.PI/180)*2) : 1;
    };

    window.addEventListener('SA_MMD_model0_onmotionchange', (e)=>{
if ((e.detail.motion_old == e.detail.motion_new) && !MMD_SA._force_motion_shuffle) return;
//DEBUG_show(Date.now())

System._browser.on_animation_update.add(()=>{
  bb_list.forEach(b=>{
    if (b._mesh.visible) {
      b.message(b.bubble_index, b.msg, b._duration, b.para);
    }
  });
// delay for motion transition
}, 20,0);
    });

    new SB();

    new SB(1, {invertH_side:true});

    if (self.MMD_SA_options?.Dungeon_options && (MMD_SA_options.SpeechBubble_branch?.use_cursor !== false)) {
window.addEventListener('MMDStarted', ()=>{
  function highlight() {
    function clear_highlight(sb) {
      if (sb._branch_key_ != null) {
        sb._branch_key_ = null;
        sb._update_placement(true);
      }
    }

    ignore_click = false;

    let is_pointer = false;
    bb_list.forEach(sb=>{
      if (!sb.visible || (mouse_x == null)) {
        clear_highlight(sb);
        return;
      }

      const width = SL.width, height = SL.height;
      const widthHalf = width / 2, heightHalf = height / 2;

      const pos = v1.copy(sb._mesh.position).project(MMD_SA._trackball_camera.object);
      pos.x = ( pos.x * widthHalf ) + widthHalf;
      pos.y = - ( pos.y * heightHalf ) + heightHalf;

      pos.x = mouse_x - pos.x;
      pos.y = mouse_y - pos.y;

      const b = sb.bubbles[sb.bubble_index];
      const w = b.image.width;
      const h = b.image.height;

      const scale = v2.copy(sb._mesh.scale).multiplyScalar(SL.height/h * MMD_SA.SpeechBubble.get_fov_factor());//(Math.min(SL.width/w, SL.height/h));
      pos.x /= scale.x;
      pos.y /= scale.y;

      pos.x += w/2;
      pos.y += h/2;

//DEBUG_show('scale:'+scale.x+'\n'+mouse_x+','+mouse_y+'\n'+ (~~pos.x) +','+ (~~pos.y)+'\n\n'+sb.msg_obj.map((o,i)=>i+':'+ ~~o.x + 'x' + ~~o.y + '/' + ~~o.w + 'x' + ~~o.h).join('\n'))

      const sb_drag = get_target_sb('_drag_key_');
      if (sb == sb_drag) {
        if (pos.x < 0) {
          outside_menu = 'left';
        }
        else if (pos.x > w) {
          outside_menu = 'right';
        }
        else if (pos.y < 0) {
          outside_menu = 'top';
        }
        else if (pos.y > h) {
          outside_menu = 'bottom';
        }
        else {
          outside_menu = null;
        }
      }

      if ((pos.x < 0) || (pos.x > w) || (pos.y < 0) || (pos.y > h)) {
        clear_highlight(sb);
        return;
      }

      let msg_obj, msg_obj_index;
      for (let i = sb.msg_obj.length-1; i >= 0; i--) {
        const obj = sb.msg_obj[i];
        if ((pos.x > obj.x) && (pos.y > obj.y)) {
          if ((pos.x-obj.x < obj.w*1.2) && ((i < sb.msg_obj.length-1) || (pos.y-obj.y < obj.h*1.2))) {
            msg_obj = sb.msg_obj[i];
            msg_obj_index = i;
          }
          break;
        }
      }

      let is_no_click_zone;

      let mouseover = msg_obj?.branch_key != null;
      if ((msg_obj?.branch_key != null) ? sb._branch_key_ != msg_obj.branch_key : sb._branch_key_ != null) {
        sb._branch_key_ = (msg_obj?.branch_key != null) ? msg_obj.branch_key : null;
        sb._update_placement(true);

        const branch = get_target_branch(sb, sb._branch_key_);
        if (branch) {
          mouseover = branch.onmouseover;
          branch.onmouseover?.({ clientX:mouse_x, clientY:mouse_y });
        }
//DEBUG_show(sb._branch_key_+'/'+Date.now())
      }
      else if (msg_obj?.b_list) {
        const x = pos.x - msg_obj.x;
        const b = msg_obj.b_list.find(b=>b._mouse_.down) || msg_obj.b_list.find((b,i)=>{
          return (b.b && (x > (msg_obj.b_list[i-1]?.w||0)) && (x < b.w));
        });

        is_no_click_zone = !b;

        if (b && mouse_down) {
          ignore_click = true;

          let b_clicked;
          if (!b._mouse_.down) {
            b._mouse_.down = mouse_down;
            b_clicked = true;
          }
          else {
            b._mouse_.down += RAF_timestamp_delta;
            if (mouse_down + 500 < b._mouse_.down) {
              b._mouse_.click_interval += RAF_timestamp_delta;
              b_clicked = b._mouse_.click_interval > 1000/15;
            }
          }

          if (b_clicked) {
            b._mouse_.click_interval = 0;
            document.dispatchEvent(new KeyboardEvent('keydown', b.event));
//DEBUG_show(msg_obj_index+'/'+(b?.b||'')+'/'+JSON.stringify(b.event)+'/'+Date.now())
          }
//DEBUG_show(msg_obj_index+'/'+(b?.b||'')+'/'+Date.now())
        }
        else {
          msg_obj.b_list.forEach(b=>{ b._mouse_.down=null; });
        }
      }

      if (!mouseover) {
        document.getElementById('SB_tooltip').style.visibility = 'hidden';
//MMD_SA_options.Dungeon.inventory._item_updated?.update_info(null, true);
      }

      is_pointer = is_pointer || (!is_no_click_zone && (sb._branch_key_ != null));
//      DEBUG_show(pos.toArray().join('\n')+'\n\n'+((msg_obj)?msg_obj.branch_index:-1));
    });

    d_target.style.cursor = cursor || ((is_pointer) ? 'pointer' : 'auto');
  }

  function get_target_branch(sb, key) {
    if (key != null) {
      const msg_branch_list = MMD_SA_options.Dungeon.dialogue_branch_mode;
      const branch = msg_branch_list?.find(b=>((b.sb_index||0)==(sb.index||0)) && (b.key==key));
      return branch;
    }
  }

  function get_target_sb(key='_branch_key_') {
    return bb_list.slice().sort((a,b)=>a._mesh.position.distanceToSquared(MMD_SA.THREEX.camera.obj.position) - b._mesh.position.distanceToSquared(MMD_SA.THREEX.camera.obj.position)).find(sb=>sb[key]!=null);
  }

//  const THREE = MMD_SA.THREEX.THREE;
  const SL = MMD_SA.THREEX.SL;

  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();

  let mouse_x, mouse_y;
  let mouse_down, mouse_drag;
  let drag_target;
  let cursor;
  let outside_menu;

  const d_target = document.getElementById('SL_Host');

  const ev_mouse_move = (!is_mobile) ? 'mousemove' : 'touchmove';
  d_target.addEventListener(ev_mouse_move, (e)=>{
    let sb;
    if (!mouse_drag) {
      if (mouse_down && (mouse_down > -1) && (mouse_down < RAF_timestamp - 250)) {
        mouse_down = -1;
        sb = drag_target?.[0];
        if (sb) {
          const branch = get_target_branch(sb, drag_target[1]);
          if (branch?.on_drag) {
            mouse_drag = true;
            sb._drag_key_ = drag_target[1];
            cursor = 'grabbing';
            MMD_SA._trackball_camera.enabled = false;
          }
          else {
            if (!ignore_click)
              cursor = 'not-allowed';
          }
        }
      }
    }
    else {
      sb = get_target_sb();
      if (sb) {
        const branch = get_target_branch(sb, sb._branch_key_);
        if (branch?.on_drop) {
          cursor = 'grabbing';
        }
        else {
          cursor = 'not-allowed';
        }
      }
      else {
        const sb_drag = get_target_sb('_drag_key_');
        const drag_branch = get_target_branch(sb_drag, sb_drag._drag_key_);
        if (drag_branch?.on_drag?.outside_menu) {
          cursor = drag_branch.on_drag.outside_menu.cursor || 'move';
        }
        else {
          cursor = 'not-allowed';
        }
      }
    }

    if (!is_mobile) {
      mouse_x = e.clientX * window.devicePixelRatio;
      mouse_y = e.clientY * window.devicePixelRatio;
    }
    else {
      if (sb) {
        mouse_x = (e.touches[0]?.clientX||0) * window.devicePixelRatio;
        mouse_y = (e.touches[0]?.clientY||0) * window.devicePixelRatio;
      }
    }
  });

  const ev_mouse_down = (!is_mobile) ? 'mousedown' : 'touchstart';
  d_target.addEventListener(ev_mouse_down, (e)=>{
    if (is_mobile) {
      mouse_x = (e.touches[0]?.clientX||0) * window.devicePixelRatio;
      mouse_y = (e.touches[0]?.clientY||0) * window.devicePixelRatio;
    }

    let sb = get_target_sb();
    if (!sb) {
      if (is_mobile) {
//DEBUG_show(mouse_x+','+mouse_y)
        highlight(); sb = get_target_sb();
        if (!sb) {
          mouse_x = mouse_y = null;
          return;
        }
      }
      else
        return;
    }

    MMD_SA._trackball_camera.enabled = false;
    e.stopPropagation();

    if (!mouse_down) {
      mouse_down = RAF_timestamp;
    }

    drag_target = [sb, sb._branch_key_];
  });

  let ignore_click;
  let ignore_dblclick;
  const ev_mouse_up = (!is_mobile) ? 'click' : 'touchend';
  d_target.addEventListener(ev_mouse_up, (e)=>{
    mouse_down = null;

    if (MMD_SA._trackball_camera.enabled != !!returnBoolean("MMDTrackballCamera")) {
      MMD_SA._trackball_camera.enabled = !!returnBoolean("MMDTrackballCamera");
      e.stopPropagation();
    }

// AFTER resetting _trackball_camera.enabled
    if (ignore_click) {
      ignore_click = false;
      ignore_dblclick = true;
      System._browser.on_animation_update.add(()=>{ ignore_dblclick=false; }, 0,0);
      return;
    }

    cursor = null;
    drag_target = null;

    let sb;
    if (mouse_drag) {
      mouse_drag = null;

      const sb_drag = get_target_sb('_drag_key_');
      sb = get_target_sb();
      if (sb) {
        const branch = get_target_branch(sb, sb._branch_key_);
        if (branch?.on_drop) {
          branch.on_drop.func(sb_drag, sb);
        }
      }
      else {
        const branch = get_target_branch(sb_drag, sb_drag._drag_key_);
        if (branch.on_drag?.outside_menu) {
          branch.on_drag.outside_menu.func(sb_drag, outside_menu);
        }
      }

      sb_drag._drag_key_ = null;
      return;
    }

    if (!is_mobile && (d_target.style.cursor != 'pointer')) return;

    sb = get_target_sb();
    if (!sb) return;

/*
    if (is_mobile) {
      mouse_x = e.clientX * window.devicePixelRatio;
      mouse_y = e.clientY * window.devicePixelRatio;
      highlight();
      const sb_confirm = bb_list.find(sb=>sb._branch_key_!=null);
      if ((sb != sb_confirm) || (sb._branch_key_ != sb_confirm._branch_key_)) {
        mouse_x = mouse_y = null;
        return;
      }
    }
*/
    mouse_x = mouse_y = null;

    const ev = {};
    const num = parseInt(sb._branch_key_);
    if (num >= 0) {
      ev.keyCode = 96+num;
    }
    else {
      ev.code = 'Key'+sb._branch_key_;
    }

    SA_OnKeyDown(ev);
  });

  d_target.addEventListener('dblclick', (e)=>{
    if (ignore_dblclick) {
      ignore_dblclick = false;
      e.stopPropagation();
    }
  });

// https://stackoverflow.com/questions/11586527/converting-world-coordinates-to-screen-coordinates-in-three-js-using-projection

  System._browser.on_animation_update.add(highlight, 0,0,-1);
});
    }

    return bb_list[0];
};
