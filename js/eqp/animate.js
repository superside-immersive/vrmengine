// EQP animate — extracted from EQP.js (Step 7A)

/** @type {boolean} Flag indicating canvas needs redraw this frame */
var CANVAS_must_redraw

/**
 * Per-frame animation loop for EQP parts.
 * Updates opacity, scale, and rotation based on audio EV_usage values.
 * Composites all HTML5 canvas parts into the main SL canvas.
 * @global
 */
var EQP_EV_animate_full = function () {
//DEBUG_show(PC_count_absolute)
  if (use_Silverlight && !SL_loaded)
    return

  const timestamp = performance.now()

  for (let i = 0, i_max = EQP_ps.length; i < i_max; i++) {
    const ps = EQP_ps[i]
    if (ps.use_HTML5 && !ps.img.canvas_parent.drawn && ps.img.Opacity) {
      CANVAS_must_redraw = true
    }
    if (ps.static_part)
      continue

    for (let j = 0; j < 3; j++) {
      let pp
      if (j == 0) {
        if (ps.static_alpha)
          continue
        pp = ps
      }
      else if (j == 1) {
        if (ps.static_scale)
          continue
        pp = ps.scale
      }
      else {
        if (ps.static_rotate)
          continue
        pp = ps.rotate
      }

      let u = -1
      if (EV_usage_sub) {
        let g_EQ   = pp.g_EQ
        let g_num  = pp.g_num
        let g_beat = pp.g_beat
        if (!g_EQ && !g_num && !g_beat) {
          g_EQ   = ps.g_EQ
          g_num  = ps.g_num
          g_beat = ps.g_beat
        }

        if (EQP_EQ_mode && g_EQ && g_EQ[EQP_EQ_index]) {
          const EQ = g_EQ[EQP_EQ_index]

          u = 0
          for (let k = 0, k_max = EQ.length; k < k_max; k++)
            u += EV_usage_sub.sound_raw[EQ[k]].usage_raw * Sound_EQBand_mod
          u /= EQ.length

          u = EV_usage_PROCESS(null, u)
        }
        else if (g_num && (g_num[EQP_EQ_index] >= 0))
          u = EV_usage_sub.sound[g_num[EQP_EQ_index]].EV_usage_float
        else if (g_beat && g_beat[EQP_EQ_index]) {
          u = (EV_usage_sub.BD) ? EV_usage_PROCESS(null, EV_usage_sub.BD.beat*100) : 0
        }
      }

      if (u == -1)
        u = EV_usage_float

      u = EQP_EV_usage_PROCESS(pp.decay2, u, pp.decay_factor2)

      const u_min = pp.u_min
      const u_max = pp.u_max
      if (u < u_min)
        u = (u <= pp.u_min_hidden) ? -1 : 0
      else if (u >= u_max)
        u = (u >= pp.u_max_hidden) ? -1 : 100
      else
        u = (u_max == u_min) ? 100 : (u - u_min) / (u_max - u_min) * 100

      pp._u = (u == -1) ? -1 : EQP_EV_usage_PROCESS(pp.decay, u, pp.decay_factor)
      if (pp._u_last != pp._u) {
        pp._u_last = pp._u
        pp._needs_update = true
        CANVAS_must_redraw = ps.use_HTML5
      }
    }

    if (!ps.static_alpha) {
      if (ps._needs_update) {
        const u = ps._u
        const opacity = (u == -1) ? 0 : parseInt(ps.o_min + (ps.o_max - ps.o_min) * u/100)
//if (opacity == 100) DEBUG_show(opacity+','+i)
        if (ps.use_Silverlight) {
          ps.img.Opacity = opacity / 100
          CANVAS_must_redraw = ps.use_HTML5
        }
        else
          ps.img.opacity = opacity/100 // [9D] ie9_mode always true
        ps._needs_update = false
      }
    }

    let pp, u
    if (!ps.static_scale) {
      pp = ps.scale 
      if (pp._needs_update) {
        u = pp._u
        pp._scale = (u == -1) ? pp.min : pp.min + (pp.max - pp.min) * u/100
        pp._needs_update = false
      }
    }

    if (!ps.static_rotate) {
      pp = ps.rotate
      u = pp._u
      if ((pp.min != null) && pp._needs_update) {
        pp._rotate_static = (u == -1) ? pp.min : pp.min + (pp.max - pp.min) * u/100
        pp._needs_update = false
      }
      if (pp.rpm_min != null) {
        if (pp._timestamp) {
          const r = (u == -1) ? pp.rpm_min : pp.rpm_min + (pp.rpm_max - pp.rpm_min) * u/100
          if (r) {
            pp._rotate_by_rpm = (pp._rotate_by_rpm + r * ((timestamp - pp._timestamp) / 1000 / 60)) % 1
            CANVAS_must_redraw = ps.use_HTML5
          }
          pp._rotate = pp._rotate_static + pp._rotate_by_rpm * 360
//DEBUG_show([r,pp._rotate,pp._rotate_static,pp._rotate_by_rpm])
        }
        pp._timestamp = timestamp
        pp._needs_update = false
      }
    }
  }

  if (use_HTML5) {
    if (Canvas_Effect && Canvas_Effect.drawn)
      CANVAS_must_redraw = true
  }

  const update_WMP_wallpaper_mask = CANVAS_must_redraw
  WebGL_2D_must_redraw = CANVAS_must_redraw
  if (CANVAS_must_redraw) {
    SL._drawn_id = Date.now()

    const context = SL.getContext("2d")
    context.globalCompositeOperation = 'copy'

    if (EQP_flipH || EQP_flipV) {
      const wxh = SL.width+'x'+SL.height
      if (SL._transformed != wxh) {
        context.translate(((EQP_flipH)?SL.width:0), ((EQP_flipV)?SL.height:0))
        context.scale(((EQP_flipH)?-1:1), ((EQP_flipV)?-1:1))
        SL._transformed = wxh
      }
    }

    let canvas_drawn = 0
    for (let i = 0, i_max = EQP_ps.length; i < i_max; i++) {
      const ps = EQP_ps[i]
      if (!ps.use_HTML5)
        continue

const canvas = ps.img
const opacity = canvas.Opacity
if (!opacity)
  continue

// make sure it is already drawn once
canvas.canvas_parent.draw(true)

if (canvas_drawn++ == 1)
  context.globalCompositeOperation = 'source-over'

context.globalAlpha = opacity
/*
if (ps.rotation) {
  var a = ps.rotation/180 * Math.PI

  context.save()

  context.translate(SL.width/2, SL.height/2)
  context.rotate(a)

  var x = -SL.width/2  + canvas.x_resized+canvas.width/2
  var y = -SL.height/2 + canvas.y_resized+canvas.height/2
  var r = Math.sqrt(x*x + y*y)
  a = Math.atan2(y,x) - a

  x = Math.cos(a) * r
  y = Math.sin(a) * r
  context.translate(x,y)

  context.drawImage(canvas, -canvas.width/2,-canvas.height/2)

  context.restore()
}
*/
if (((ps.scale._scale || 1) != 1) || ps.rotate._rotate) {
  context.save()

  const x = (ps.x_org - EQP_SL_x) * EQP_size_scale
  const y = (ps.y_org - EQP_SL_y) * EQP_size_scale
  const w = ps.w_org * EQP_size_scale
  const h = ps.h_org * EQP_size_scale

// adjust x/y rounding offset due to resized canvas, moving to the accurate resized (0,0)
  const x_resized_offset = canvas.x_resized-x
  const y_resized_offset = canvas.y_resized-y
  context.translate(x_resized_offset, y_resized_offset)

  const scale = ps.scale._scale || 1
  if (scale != 1) {
    context.scale(scale, scale)
  }

  let x_adjusted = w*(1-scale)*0.5 + x
  let y_adjusted = h*(1-scale)*0.5 + y

  const rotate = ps.rotate._rotate
  if (rotate) {
    let a = rotate/180 * Math.PI

    context.translate(w/2, h/2)
    context.rotate(a)
    context.translate(-w/2, -h/2)

    const r = Math.sqrt(x_adjusted*x_adjusted + y_adjusted*y_adjusted)
    a = Math.atan2(y_adjusted,x_adjusted) - a

    x_adjusted = Math.cos(a) * r
    y_adjusted = Math.sin(a) * r
  }

  context.translate(x_adjusted/scale, y_adjusted/scale)

//DEBUG_show(ps.w_org+'x'+ps.h_org)

  context.drawImage(canvas, 0,0)

  context.restore()
}
else {
  context.drawImage(canvas, canvas.x_resized,canvas.y_resized)
}
    }

    if (SL_mask['content_mask'] && SL_mask['content_mask'].Mask_src) {
const mask_obj = SL_mask['content_mask']
mask_obj.draw(true)

context.globalAlpha = 1
context.globalCompositeOperation = 'destination-in'
context.drawImage(mask_obj.canvas, 0,0)
    }

    CANVAS_must_redraw = false
  }

  if (use_HTML5) {
    if (Canvas_Effect)
      Canvas_Effect.draw()

    Canvas_BDDraw(SL)

    if (EQP_matrix_rain)
      EQP_matrix_rain._SA_draw()

    if (update_WMP_wallpaper_mask && self.C_WMP_wallpaper_mask) {
      for (let k = 0; k < SA_child_animation_max; k++) {
        if (!SA_child_animation[k])
          continue

        document.getElementById("Ichild_animation" + k).contentWindow.System._browser.WMPMask_Draw(SL)
      }
    }
  }

  if (EQP_animate_extra)
    EQP_animate_extra()

  if (use_HTML5 && SL._WebGL_2D && WebGL_2D_must_redraw)
    SL._WebGL_2D.draw()
}

if (!EV_animate_full)
  EV_animate_full = EQP_EV_animate_full
