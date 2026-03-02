// background.js — BG rendering, OP selection, Canvas BDDraw (Step 5C extraction from _SA.js)

// BG
var BG_dim_calculate
var BG_img_objs
var EV_width_no_init, EV_height_no_init

function BG_Basic() {
  BG_AddShadow((!filter_objs[filter_index].filter_enabled && (SA_zoom == 1)))
}

function BG_AddShadow(basic_mode) {
  BG_dim_calculate()

  var mod = 1 // [9D] ie9_mode always true
  var w = EV_width  * mod
  var h = EV_height * mod

  var x_offset = 1
  var y_offset = 1

  var s = Lmain_obj.style
  s.posLeft = x_offset
  s.posTop  = y_offset
  s.clip = Lmain_obj.clip_org = 'rect(0px ' + (w) + 'px ' + (h) + 'px 0px)'

  w += x_offset * 2
  h += y_offset * 2

  EV_BG_src = ""
  BG.removeObjects()
  BG_img_objs = []

if (!basic_mode) {
  var bg_shadow = BG.addImageObject("js_filters/images/black.png", 0,0)
  bg_shadow.left = (w-100)/2
  bg_shadow.top = (h-100)/2
  bg_shadow.width = w
  bg_shadow.height = h
  bg_shadow.addShadow("black", 3, 75, 3,3)
  BG_img_objs.push(bg_shadow)

  s = LBG_dummy.style
  s.pixelWidth = w
  s.pixelHeight = h
//  s.backgroundColor = "white"
  s.display = "block"
}
else
  LBG_dummy.style.display = "none"

  var shadow_offset = (use_SA_browser_mode) ? 0 : 5

  EV_width  += (x_offset * 2) + shadow_offset
  EV_height += (y_offset * 2) + shadow_offset

  BG.style.pixelWidth  = EV_width  * mod
  BG.style.pixelHeight = EV_height * mod
}

function BG_AddBlackhole() {
  BG_dim_calculate()

  if (System.Gadget.docked && (EV_width <= 130)) {
    BG_AddShadow()
  }
  else {
    LBG_dummy.style.display = "none"

    EV_BG_src = ""
    BG.removeObjects()
    BG_img_objs = []

    var bg_blackhole
    var bg_choice = [Settings.f_path + toLocalPath('\\images\\bg_blackhole.png'), System.Gadget.path + toLocalPath('\\js_filters\\images\\bg_blackhole_' + EV_width + 'x' + EV_height + '.png')]
    for (var i = 0; i < bg_choice.length; i++) {
      var bg_src = ValidatePath(bg_choice[i])
      if (bg_src) {
        bg_blackhole = bg_src.path
        break
      }
    }
    if (!bg_blackhole)
      bg_blackhole = 'js_filters/images/bg_blackhole_130x130.png'

    BG_img_objs.push(BG.addImageObject(bg_blackhole, 0,0))

    var s = Lmain_obj.style
    s.posTop = 24
    s.posLeft = 24

    EV_width += 24*2
    EV_height += 24*2
  }

  BG.style.pixelWidth = EV_width
  BG.style.pixelHeight = EV_height
}

// OP selection START

var OP_SEQ_index = -1

function OP_gallery_sorting(a, b) {
  if (a.SEQ_index == OP_SEQ_index)
    return -1
  if (b.SEQ_index == OP_SEQ_index)
    return 1

  return Math.random() - 0.5
}

function OP_change() {
  if (gallery_cache_obj.SS_mode) {
    SEQ_gallery_index = -1
    return ((SEQ_gallery_shuffled_count == -1) ? OP_SEQ_index : SEQ_gallery_shuffled[SEQ_gallery_shuffled_count].SEQ_index)
  }

  if (++OP_SEQ_index >= SEQ_gallery.length)
    OP_SEQ_index = 0

  SEQ_gallery_shuffled = SEQ_gallery.sort(OP_gallery_sorting)

  SEQ_gallery_shuffled_count = 0
  SEQ_gallery_index = -1

  return OP_SEQ_index
}

var SEQ_fps_end_factor = 1
var SEQ_fps_frame_skip_mod = 0

function OP_change_event() {
  if (gallery_cache_obj.SS_mode)
    DEBUG_show((OP_change()+1)+' (=> '+((SEQ_gallery_shuffled_count == SEQ_gallery.length-1) ? 'END' : SEQ_gallery_shuffled[SEQ_gallery_shuffled_count+1].SEQ_index+1)+')', 1)
  else
    DEBUG_show((OP_change()+1)+'/'+SEQ_gallery.length, 1)
}

// END


var Canvas_BDDraw_disabled = true // [AUDIO REMOVED]

function Canvas_BDDraw(canvas, beat) {
  var cw = canvas.width
  var ch = canvas.height
  var context
  var co = ['source-over', 'source-over']
  if (self.CANVAS_cached_layer_effect && Canvas_Effect && (Canvas_Effect.canvas == SL)) {
    if (!CANVAS_cached_layer_effect.width) {
      co[1] = 'copy'
      CANVAS_cached_layer_effect.width  = cw
      CANVAS_cached_layer_effect.height = ch
    }

    context = CANVAS_cached_layer_effect.getContext("2d")
    context.globalCompositeOperation = co[1]
    context.globalAlpha = 1
    context.drawImage(Canvas_Effect.canvas_buffer, 0,0)

    co[1] = 'source-over'
  }

  if (Canvas_BDDraw_disabled)
    return

  if (beat == null)
    beat = (EV_usage_sub && EV_usage_sub.BD) ? EV_usage_sub.BD.beat2 : 0

  if (!beat)
    return

  CANVAS_must_redraw = true

  var bd_scale   = beat / (16 / Math.pow(2, Settings.BDScale))
  var bd_opacity = 0.5 + (Settings.BDOpacity-1) * 1/6
  bd_opacity = bd_opacity*0.25 + beat*bd_opacity*0.75

  var w = parseInt(cw * bd_scale)
  var h = parseInt(ch * bd_scale)

  if (self.CANVAS_cached_layer_effect) {
    context = CANVAS_cached_layer_dummy.getContext("2d")
    context.globalCompositeOperation = 'copy'
    CANVAS_cached_layer_dummy.width  = cw
    CANVAS_cached_layer_dummy.height = ch

    if (!CANVAS_cached_layer_effect.width) {
      co[1] = 'copy'
      CANVAS_cached_layer_effect.width  = cw
      CANVAS_cached_layer_effect.height = ch
    }
  }
  else {
    context = canvas.getContext("2d")
    context.globalCompositeOperation = 'source-over'
  }

  context.globalAlpha = bd_opacity
  context.drawImage(canvas, w/2,h/2,cw-w,ch-h, 0,0,cw,ch)

  if (self.CANVAS_cached_layer_effect) {
    var layers = [canvas, CANVAS_cached_layer_effect]
    for (var i = 0; i < 2; i++) {
      context = layers[i].getContext("2d")
      context.globalCompositeOperation = co[i]
      context.globalAlpha = 1
      context.drawImage(CANVAS_cached_layer_dummy, 0,0)
    }
  }
}
