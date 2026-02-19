/*
  seq-animate.js — Sequence animation and frame rendering (Step 5B extraction from _SA.js)
  SEQ_Animate, SEQ_CalculateFPS, EV_AdjustTimer, AnimateFrame
*/

function SEQ_CalculateFPS(isEV) {
  var fps_ini, fps_end
  if (isEV) {
    fps_ini = EV_fps_ini
    fps_end = EV_fps_end
  }
  else {
    fps_ini = SEQ_fps_ini
    fps_end = Math.round(SEQ_fps_end * SEQ_fps_end_factor)
  }

  SEQ_fps = fps_ini + EV_usage_float/100 * (fps_end - fps_ini)
//  fps_ini * Math.exp(EV_usage_float/100 * Math.log(fps_end / fps_ini))

  var fps = (SEQ_fps > 30) ? 30 : SEQ_fps
  return parseInt(1000/fps)
}

var SEQ_last_update_time = 0

var SEQ_gallery_shuffled = []
var SEQ_gallery_shuffled_count = -1

function EV_AdjustTimer(ms, ms_last, isEV) {
  if (ms+16 >= ms_last)
    return -1

  var t_diff

  var t = Date.now()
  var last_update_time = (isEV) ? EV_last_update_time : SEQ_last_update_time
  t_diff = t - last_update_time

  t_diff = ms - t_diff
  return ((t_diff < 0) ? 0 : t_diff)
}

var EV_first_idle_time = -1

var SEQ_gallery_shuffled_mode = true
var SEQ_gallery_shuffled = []
var SEQ_gallery_shuffled_count = -1
var SEQ_gallery_preset_order

function random_sorting(a,b) { return Math.random() - 0.5 }

function SEQ_gallery_restore_order(a,b) { return a.SEQ_index - b.SEQ_index }

function SEQ_Animate() {
  var t = Date.now()
  SEQ_last_update_time = t

  if (SEQ_gallery_by_percent.length) {
    var g_index = -1

    var percent_name = null
    if (SEQ_gallery_percent_name)
      percent_name = (self.EV_return_SEQ_gallery_percent_name) ? EV_return_SEQ_gallery_percent_name() : SEQ_gallery_percent_name

    for (var i = SEQ_gallery_by_percent.length-1; i >= 0; i--) {
      var obj = SEQ_gallery_by_percent[i]

      var f = obj.index
      var is_event = isNaN(f)
      if (percent_name) {
        if (is_event) {
          if (f != percent_name)
            continue
        }
        else
          break
      }
      else if (is_event || (f >= EV_usage))
        continue

      g_index = i
      break
    }
    if (g_index == -1)
      g_index = 0

if ((PC_count_max < 5) && (SEQ_gallery_percent_index != -1)) {
  if (g_index > 0)
    EV_first_idle_time = -1
  else if ((g_index == 0) && (SEQ_gallery_percent_index != g_index)) {
    if (EV_first_idle_time == -1) {
      EV_first_idle_time = t
      g_index = SEQ_gallery_percent_index
    }
    else if (t - EV_first_idle_time < 600)
      g_index = SEQ_gallery_percent_index
  }
}

    if (SEQ_gallery_percent_index != g_index) {
      SEQ_gallery_percent_name = percent_name

      SEQ_gallery_percent_index = g_index
      SEQ_gallery = SEQ_gallery_by_percent[g_index].SEQ_gallery
      SEQ_gallery_index = -1

      SEQ_gallery_shuffled_count = -1
    }
  }

  if (SEQ_gallery_index == -1) {
    if (self.EV_on_SEQ_gallery_change)
      EV_on_SEQ_gallery_change()

    if (SEQ_gallery_shuffled_mode) {
      if (SEQ_gallery_shuffled_count == -1) {
// NOTE: Array IS modified by the sorting function.
        if (SEQ_gallery_preset_order) {
          SEQ_gallery = SEQ_gallery.sort(SEQ_gallery_restore_order)

          SEQ_gallery_shuffled = []
          for (var i = 0; i < SEQ_gallery_preset_order.length; i++)
            SEQ_gallery_shuffled.push(SEQ_gallery[SEQ_gallery_preset_order[i]])
        }
        else
          SEQ_gallery_shuffled = (gallery_cache_obj.SS_mode) ? SEQ_gallery.sort(OP_gallery_sorting) : SEQ_gallery.shuffle()
        SEQ_gallery_shuffled_count = 0
      }

      SEQ_gallery_index = SEQ_gallery_shuffled[SEQ_gallery_shuffled_count].SEQ_index

      if (gallery_cache_obj.SS_mode) {
        gallery_cache_obj.SS_path_list_lvl = gallery_cache_obj.SS_path_list_index = 0
        gallery_cache_obj.SS_path_list[0] = SEQ_gallery_all[SEQ_gallery_index].ss_path_list
      }

      var SS_index = -1
      if (++SEQ_gallery_shuffled_count >= SEQ_gallery.length) {
        SEQ_gallery_shuffled_count = -1

        if (gallery_cache_obj.SS_mode)
          SS_index = OP_SEQ_index = Math.floor(Math.random() * SEQ_gallery.length)
      }
      else if (gallery_cache_obj.SS_mode)
        SS_index = SEQ_gallery_shuffled[SEQ_gallery_shuffled_count].SEQ_index

      if (SS_index != -1) {
        if (gallery_cache_obj.SS_path_list[0].length == 1) {
          gallery_cache_obj.SS_path_list_lvl = 1
          gallery_cache_obj.SS_path_list_index = -1
        }
        else {
          gallery_cache_obj.SS_path_list_lvl = 0
          gallery_cache_obj.SS_path_list_index = 0
        }

        gallery_cache_obj.SS_path_list[1] = SEQ_gallery_all[SS_index].ss_path_list
      }
    }
    else
      SEQ_gallery_index = Math.floor(Math.random() * SEQ_gallery.length)

    if (self.EV_on_after_SEQ_gallery_change)
      EV_on_after_SEQ_gallery_change()

    var gallery_obj = SEQ_gallery_all[SEQ_gallery_index]
    gallery = (gallery_obj.gallery) ? gallery_obj.gallery : SEQ_generate_gallery(gallery_obj)
    gallery_obj.count = 0

if (gallery_obj.loop_absolute)
  gallery_obj.loop = gallery_obj.loop_absolute
else {
  var loop_f = gallery.length
  if (loop_f < 10)
    loop_f = 10
  else if (loop_f > 30)
    loop_f = 30
  var loop = Math.round(loop_f * 5 * gallery_obj.loop_factor / gallery.length)
  if (!loop)
    loop = 1

  gallery_obj.loop = loop + ((gallery.length > 350) ? 0 : Math.floor(Math.random() * (loop+1)))
}

    SEQ_fps_ini = gallery_obj.SEQ_fps_ini
    SEQ_fps_end = gallery_obj.SEQ_fps_end
    if (SEQ_mode)
      Seq.item("SEQ").interval = SEQ_CalculateFPS()

    if (SEQ_ani_count_overridden) {
      SEQ_ani_count = SEQ_ani_count_overridden
      SEQ_ani_count_overridden = null
    }
    else
      SEQ_ani_count = 0

    if (self.EV_SEQ_refresh)
      EV_SEQ_refresh()
  }

  var pic = gallery[SEQ_ani_count]

  if (++SEQ_ani_count >= gallery.length) {
    SEQ_ani_count = 0

    var gallery_obj = SEQ_gallery_all[SEQ_gallery_index]
    if (++gallery_obj.count >= gallery_obj.loop) {
      SEQ_gallery_index = -1

      if (gallery_obj.onfinish)
        gallery_obj.onfinish()
    }
  }

// handle frame skipping
  if (SEQ_fps_frame_skip_mod >= 1) {
    SEQ_fps_frame_skip_mod -= 1
    SEQ_Animate()
    return
  }

  AnimateFrame(pic)

  if (SEQ_fps > 30)
    SEQ_fps_frame_skip_mod += (SEQ_fps - 30) / 30
}

var Gallery_h_align = "center"
var Gallery_v_align = "bottom"

function AnimateFrame(pic) {
  if (!pic.w && !pic.h) {
    var dim = loadImageDim(pic.path)
    pic.w = dim.w
    pic.h = dim.h
  }
  var w = pic.w
  var h = pic.h

  if (self.EV_AnimateFrame) {
    var obj = EV_AnimateFrame(pic, w,h)
    if (!obj)
      return

    pic = obj.pic
    w = obj.w
    h = obj.h
  }

  var ds = Lmain_animation.style
  ds.posLeft = EV_frame_offsetX
  ds.posTop = EV_frame_offsetY
  ds.pixelWidth = b_width
  ds.pixelHeight = b_height

  if (pic_last == pic)
    return
  pic_last = pic

  var path
  if (use_GIMAGE) {
    if (!pic.path_GIMAGE)
      pic.path_GIMAGE = "gimage:///" + pic.path + ("?width=" + w + "&height=" + h)
    path = pic.path_GIMAGE
  }
  else
    path = pic.path_file

  if (gallery_cache_obj.SS_mode && (gallery_cache_obj.SS_path != path)) {
    gallery_cache_obj.SS_path = path

    setTimeout('gallery_cache_obj.SS_preload()', 0)
//DEBUG_show('Preload => ' + SEQ_gallery_index + '/' + gallery_cache_obj.SS_path_list_lvl + ',' + gallery_cache_obj.SS_path_list_index)
  }

  if (!gallery_cache_obj.load(path)) {
    w *= image_ratio
    h *= image_ratio

    ds = img_obj.style
    ds.posLeft = (Gallery_h_align == "left") ? 0 : (b_width -  w) * ((Gallery_h_align == "center") ? 0.5 : 1)
    ds.posTop =  (Gallery_v_align == "top")  ? 0 : (b_height - h) * ((Gallery_v_align == "center") ? 0.5 : 1)

    if (use_native_img || (image_ratio != 1)) {
      ds.pixelWidth = w
      ds.pixelHeight = h
    }
    else {
      ds.width = "auto"
      ds.height = "auto"
    }

    img_obj.initialized = true

    gallery_cache_obj.styleUpdate()
  }

  if (pic.ss_mode) {
    var x = pic.ss_x
    var y = pic.ss_y

    ds = img_obj.style
    ds.posLeft = -x
    ds.posTop = -y
    ds.clip = 'rect(' + y + 'px ' + (x+w) + 'px ' + (y+h) + 'px ' + x + 'px)'

    gallery_cache_obj.styleUpdate()
  }

// filters
  if (self.use_ghosting)
    Ghosting.frame_final()
}

