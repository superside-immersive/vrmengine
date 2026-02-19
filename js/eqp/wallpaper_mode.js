// EQP wallpaper mode — extracted from EQP.js (Step 7A)

var EQP_wallpaper_mode_enabled
var EQP_wallpaper_mode_options

var EQP_wallpaper_mode = {
  x_ratio: 0.5
 ,y_ratio: 0.5

 ,init: function () {
if (EQP_wallpaper_mode_options) {
  for (var name in EQP_wallpaper_mode_options)
    this[name] = EQP_wallpaper_mode_options[name]
}

EV_init = function () {
// support "fullscreen" child animation as well
  var fullscreen = (use_SA_browser_mode && Settings.CSSTransformFullscreen)
  if (fullscreen) {
    EV_width  = EQP_EV_width  = EQP_SL_w = Math.max(screen.availWidth,  EQP_ref_width)
    EV_height = EQP_EV_height = EQP_SL_h = Math.max(screen.availHeight, EQP_ref_height)
    SA_zoom = EQP_size_scale = 1
//    resize(true, function () { _WE_adjust_pos(1,1); EQP_resize(1); }, true,true)
  }
  else {
    EV_width  = EQP_EV_width  = EQP_SL_w = EQP_ref_width
    EV_height = EQP_EV_height = EQP_SL_h = EQP_ref_height
  }

  var first_resize = !EQP_EV_initialized
  if (!first_resize)
    EQP_wallpaper_mode.adjust_pos()

  EQP_EV_init()

  if (first_resize) {
    EQP_wallpaper_mode.adjust_pos()
    EQP_resize(EQP_size_scale)
  }
}
  }

 ,adjust_pos: function () {
    var x_ratio = this.x_ratio
    var y_ratio = this.y_ratio

    EQP_ps.forEach(function (ps) {
if (ps._x_org_ == null)
  ps._x_org_ = ps.x_org
if (ps._y_org_ == null)
  ps._y_org_ = ps.y_org

ps.x_org = ps._x_org_ + (EV_width -EQP_ref_width)  * x_ratio
ps.y_org = ps._y_org_ + (EV_height-EQP_ref_height) * y_ratio
//console.log([ps.x_org,ps.y_org])
    });

    if (use_EQP_fireworks && self.CanvasEffect_options) {
      if (CanvasEffect_options._start_x_ == null)
        CanvasEffect_options._start_x_ = CanvasEffect_options.start_x || 0
      if (CanvasEffect_options._start_y_ == null)
        CanvasEffect_options._start_y_ = CanvasEffect_options.start_y || 0

      CanvasEffect_options.start_x = (CanvasEffect_options._start_x_ * EQP_ref_width /2 + (EV_width -EQP_ref_width) /2 * (x_ratio - 0.5) * 2) / (EV_width /2)
      CanvasEffect_options.start_y = (CanvasEffect_options._start_y_ * EQP_ref_height/2 + (EV_height-EQP_ref_height)/2 * (y_ratio - 0.5) * 2) / (EV_height/2)
//console.log([CanvasEffect_options.start_x,CanvasEffect_options.start_y])
      if (self.EQP_Fireworks) {
        EQP_Fireworks.start_x = CanvasEffect_options.start_x
        EQP_Fireworks.start_y = CanvasEffect_options.start_y
      }
    }

    if (self.WebGL_2D_options) {
      if (WebGL_2D_options._zoomblur_center_x_ == null)
        WebGL_2D_options._zoomblur_center_x_ = WebGL_2D_options.zoomblur_center_x || 0
      if (WebGL_2D_options._zoomblur_center_y_ == null)
        WebGL_2D_options._zoomblur_center_y_ = WebGL_2D_options.zoomblur_center_y || 0

      WebGL_2D_options.zoomblur_center_x = (WebGL_2D_options._zoomblur_center_x_ * EQP_ref_width /2 + (EV_width -EQP_ref_width) /2 * (x_ratio - 0.5) * 2) / (EV_width /2)
      WebGL_2D_options.zoomblur_center_y = (WebGL_2D_options._zoomblur_center_y_ * EQP_ref_height/2 + (EV_height-EQP_ref_height)/2 * (y_ratio - 0.5) * 2) / (EV_height/2)
    }
  }
}

if (EQP_wallpaper_mode_enabled)
  EQP_wallpaper_mode.init()
