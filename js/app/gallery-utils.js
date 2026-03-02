// gallery-utils.js — Image loading, smart preloading (Step 5C extraction from _SA.js)

function loadImageDimALL() {
  if (!SEQ_mode) {
    for (var k = 0; k < gallery.length; k++) {
      var obj = gallery[k]
      var dim = loadImageDim(obj.path, obj)

      var w,h
      obj.w = w = dim.w
      obj.h = h = dim.h

      if (w_max < w)
        w_max = w
      if (h_max < h)
        h_max = h
    }
  }
  else {
    for (var i = 0; i < SEQ_gallery_all.length; i++) {
      var g_obj = SEQ_gallery_all[i]
      if (g_obj.ss_w) {
        var w = g_obj.ss_w
        var h = g_obj.ss_h

        if (w_max < w)
          w_max = w
        if (h_max < h)
          h_max = h

        continue
      }

      var g = g_obj.gallery
      for (var k = 0; k < g.length; k++) {
        var obj = g[k]
        var dim = loadImageDim(obj.path, obj)

        var w,h
        obj.w = w = dim.w
        obj.h = h = dim.h

        if (w_max < w)
          w_max = w
        if (h_max < h)
          h_max = h
      }
    }
  }

/*
  if (w_max && h_max)
    DEBUG_show(w_max + "x" + h_max, 2)
*/
}

function loadImageDim(path, obj) {
  if (obj && obj.w && obj.h)
    return { w:obj.w, h:obj.h }

  var item = ValidatePath(path)
  if (!item)
    return { w:0, h:0 }

  var w,h
  var meta_dim
  if (Vista_or_above)
    meta_dim = item.metadata("Dimensions")
  else if (Shell_OBJ) {
    try {
      var f = path.replace(/[\/\\][^\/\\]+$/, "")
      var p = path.replace(/^.+[\/\\]/, "")

      var dir = Shell_OBJ.NameSpace(f);
      var img = dir.ParseName(p);

      meta_dim = img.ExtendedProperty("Dimensions");
      if (!meta_dim)
        meta_dim = dir.GetDetailsOf(img, 26);
    }
    catch (err) {}
  }

  if (meta_dim && /(\d+)\D+(\d+)/.test(meta_dim)) {
    w = parseInt(RegExp.$1)
    h = parseInt(RegExp.$2)
  }
  else {
    w = 130
    h = 130
  }

  return { w:w, h:h }
}

var SA_extra_info_on

var SEQ_SP_gallery = []
var SEQ_SP_gallery_index = 0
var SEQ_SP_pic_index = -1
var SEQ_SP_finished

function SEQ_SmartPreloading() {
  if (EV_usage > 5)
    return

  if (!SEQ_SP_gallery.length)
    SEQ_SP_gallery = (SEQ_gallery_by_percent.length || !SEQ_gallery_shuffled.length) ? SEQ_gallery_all : SEQ_gallery_shuffled.slice(0)

  var preload_count = 10
  while ((!SEQ_SmartPreloading_Core()) && (--preload_count > 0)) {}

if (!preload_count && SA_extra_info_on)
DEBUG_show('(SP)',1)
}

function SEQ_SmartPreloading_Core() {
  if (++SEQ_SP_pic_index >= SEQ_SP_gallery[SEQ_SP_gallery_index].gallery.length) {
    SEQ_SP_pic_index = 0
    if (++SEQ_SP_gallery_index >= SEQ_SP_gallery.length) {
//DEBUG_show('(SP Finished)',2)
      SEQ_SP_finished = true
      Seq.item("SEQ_SmartPreloading").Stop()
      return true
    }
  }

  var pic = SEQ_SP_gallery[SEQ_SP_gallery_index].gallery[SEQ_SP_pic_index]
  if (pic.w && pic.h)
    return false

if (SA_extra_info_on)
DEBUG_show('(SP ' + (SEQ_SP_pic_index+1) + '/' + (SEQ_SP_gallery_index+1) + '/' + SEQ_SP_gallery.length + ')',1)
  var dim = loadImageDim(pic.path)
  pic.w = dim.w
  pic.h = dim.h
  return true
}
