// EQP resize — extracted from EQP.js (Step 7A)

/**
 * Resize all EQP parts (equalizer/visualizer elements) to the given scale.
 * Handles Silverlight, HTML IMG, CSS3 Transforms, and canvas modes.
 * @param {number} scale - Scale factor (0.5 = gadget docked, 1 = full)
 * @param {boolean} [no_msg] - Suppress debug messages
 */
function EQP_resize(scale, no_msg) {
  EQP_resize_CORE(scale, no_msg)


  const scale_org = EQP_size_scale
  if ((use_Silverlight && SL_ST_enabled) || use_CSS3_2D_Transforms)
    EQP_size_scale = 1


  if (EQP_use_HTML_IMG_FULL)
    EV_BG_allow_dummy = (EQP_size_scale == 1)

  for (let i = 0, i_max = EQP_ps.length; i < i_max; i++) {
    const ps = EQP_ps[i]

if (ps.use_Silverlight) {
  if (!SL_loaded)
    continue

  const img = ps.img
  if (!img)
    continue

  if (ps.use_HTML5) {
    const c_obj = img.canvas_parent
    c_obj.drawn = false

    const mask_obj_list = c_obj.mask_obj_list
    if (mask_obj_list) {
      for (let name in mask_obj_list)
        mask_obj_list[name].drawn = false
    }
  }

  if (ps.fixed_size) {
    img.Visibility = (((EQP_size_scale == 0.5) && ps.half_size) || ((EQP_size_scale == 1) && ps.full_size)) ? "Visible" : "Collapsed";
    continue
  }

  if (ps.w_org > 0)
    img.Width  = ps.w_org * EQP_size_scale
  if (ps.h_org > 0)
    img.Height = ps.h_org * EQP_size_scale
  img["Canvas.Left"] = (ps.x_org - EQP_SL_x) * EQP_size_scale
  img["Canvas.Top"]  = (ps.y_org - EQP_SL_y) * EQP_size_scale

  if (ps.is_video) {
    const obj_v = SL_root.FindName(img.Name + "_obj")
    if (ps.w_video > 0)
      obj_v.Width  = ps.w_video
    if (ps.h_video > 0)
      obj_v.Height = ps.h_video
  }

  continue
}

    if (ps.use_HTML_IMG && !use_CSS3_2D_Transforms) {
      if (EQP_size_scale == 0.5) {
        if (ps.img_GADGET) {
          ps.img = ps.img_GADGET
          ps.img.opacity = (ps.img_HTML) ? ps.img_HTML.opacity*100 : ps.o_min // [9D] ie9_mode always true
          ps.img_obj.style.display = "none"
        }
        else {
          ps.img_obj.style.display = (ps.half_size) ? "block" : "none"
          continue
        }
      }
      else {
        if (ps.img_GADGET) {
          if (ps.img_HTML) {
            ps.img = ps.img_HTML
            ps.img.opacity = ps.img_GADGET.opacity/100 // [9D] ie9_mode always true
          }
          else
            ps.img = null
          ps.img_GADGET.opacity = 0
          ps.img_obj.style.display = "block"
          continue
        }
        else {
          ps.img_obj.style.display = (ps.full_size) ? "block" : "none"
          continue
        }
      }
    }
    if (!ps.img)
      continue

    const w = ps.w_org * scale_org
    const h = ps.h_org * scale_org

    const img = ps.img
    img.left = (w - ps.w_org)/2 + ps.x_org * scale_org
    img.top  = (h - ps.h_org)/2 + ps.y_org * scale_org
    img.width  = w
    img.height = h
  }


  EQP_size_scale = scale_org

  const s = BG.style
  s.posLeft = Math.round(EQP_BG_x * EQP_size_scale)
  s.posTop  = Math.round(EQP_BG_y * EQP_size_scale)
  s.pixelWidth  = Math.round(EQP_BG_width  * EQP_size_scale)
  s.pixelHeight = Math.round(EQP_BG_height * EQP_size_scale)

  EV_width  = Math.round(EQP_EV_width  * EQP_size_scale)
  EV_height = Math.round(EQP_EV_height * EQP_size_scale)

  if (use_CSS3_2D_Transforms) {
    const ids = ["Lmain_obj", "Lgimage_BG"]
    for (let i = 0; i < ids.length; i++) {
      const cs = document.getElementById(ids[i]).style
      if (EQP_size_scale == 1) {
        cs.MozTransform = cs.MozTransformOrigin = "";
      }
      else {
        cs.MozTransform = "scale(" + EQP_size_scale + ")";
        cs.MozTransformOrigin = "0% 0%";
      }
    }
  }
  else if (use_Silverlight && SL_loaded) {
    const ss = SL_Host_Parent.style
    ss.pixelWidth  = Math.round(EQP_SL_w * EQP_size_scale)
    ss.pixelHeight = Math.round(EQP_SL_h * EQP_size_scale)
    ss.posLeft = Math.round(EQP_SL_x * EQP_size_scale)
    ss.posTop  = Math.round(EQP_SL_y * EQP_size_scale)

    if (use_HTML5) {
SL_object.width  = ss.pixelWidth
SL_object.height = ss.pixelHeight

SL_MC_Place(EQP_size_scale/2 + 0.5)

if (SL_mask['content_mask'] && SL_mask['content_mask'].Mask_src)
  SL_mask['content_mask'].drawn = false
    }
    else if (use_SVG) {
    }
    else {
      SL_ArrangeButtons()

      if (SL_ST_enabled) {
        const st = SL_root.FindName("content_ST")
        const tt = SL_root.FindName("content_TT")

        const scale = EQP_size_scale * SL_fullscreen_scale

        if (EQP_flipH) {
          tt.X = -ss.pixelWidth
          st.ScaleX = -scale
        }
        else
          st.ScaleX = scale

        if (EQP_flipV) {
          tt.Y = -ss.pixelHeight
          st.ScaleY = -scale
        }
        else
          st.ScaleY = scale

//        st.CenterX = ss.pixelWidth
//        st.CenterY = ss.pixelHeight
      }
    }
  }
}
