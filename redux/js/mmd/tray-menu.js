// Tray menu dispatch handler
// Extracted from MMD_SA.js — Step 10G refactoring

window.MMD_SA_createTrayMenu = function () {
  return function (para) {
switch (para[0]) {
  case "MODEL":
    if (para[1] == "override_default") {
      var bool = parseInt(para[2])
      System.Gadget.Settings.writeString('MMDOverrideDefaultForExternalModel', ((!bool)?"non_default":""))
      if (!bool)
        System.Gadget.Settings.writeString('LABEL_MMD_model_path', '')
      if (linux_mode)
        System._browser.update_tray()
      return
    }

    var model_path = decodeURIComponent(para[1])
    if (!/^(\w+\:|\/)/.test(model_path))
      model_path = System.Gadget.path + toLocalPath("\\" + model_path)
    if ((model_path == MMD_SA_options.model_path) || (MMD_SA_options.model_path_extra.indexOf(model_path) != -1)) {
      DEBUG_show("(model already in use)", 2)
      System._browser.update_tray({MMD_model_path:MMD_SA_options.model_path})
      return
    }
    if (!confirm("This will restart the gadget.")) {
      System._browser.update_tray({MMD_model_path:MMD_SA_options.model_path})
      return
    }

    DragDrop_install({ path:model_path })
    return
  case "VISUAL_EFFECTS":
    var model_filename_cleaned = MMD_SA_options.model_para_obj._filename_cleaned
    switch (para[1]) {
      case "load_default":
        if (!confirm("This will load the default visual effect settings."))
          return
        MMD_SA_options.MME.self_overlay = Object.clone(MMD_SA_options.MME._self_overlay)
        MMD_SA_options.MME.HDR = Object.clone(MMD_SA_options.MME._HDR)
        MMD_SA_options.MME.serious_shader = Object.clone(MMD_SA_options.MME._serious_shader)
        MMD_SA_options.MME.SAO = Object.clone(MMD_SA_options.MME._SAO)
        MMD_SA._MME_uniforms_updated_ = Date.now()
        System._browser.update_tray()
        break
      case "save_default":
        if (!confirm("This will save the current visual effect settings as the default for the current MMD model, which will be applied to any System Animator animations that uses the same MMD model.\n\nIf this is an external model, this model path will also be added to the model list, which can be selected from the tray menu for any other System Animator MMD animations."))
          return
        var MME_saved = MMD_SA_options.MME_saved[model_filename_cleaned]
        if (!MME_saved)
          MME_saved = MMD_SA_options.MME_saved[model_filename_cleaned] = {}
        delete MMD_SA_options.MME.self_overlay.use_default
        delete MMD_SA_options.MME.HDR.use_default
        delete MMD_SA_options.MME.serious_shader.use_default
// update saved
        var model_path = MMD_SA_options.model_path
        if (model_path.indexOf(System.Gadget.path) == 0)
          model_path = model_path.substr(System.Gadget.path.length+1)
        MME_saved.path_full = model_path
        MME_saved.self_overlay = Object.clone(MMD_SA_options.MME.self_overlay)
        MME_saved.HDR = Object.clone(MMD_SA_options.MME.HDR)
        MME_saved.serious_shader = Object.clone(MMD_SA_options.MME.serious_shader)
        MME_saved.SAO = Object.clone(MMD_SA_options.MME.SAO)
// update default
        MMD_SA_options.MME._self_overlay = Object.clone(MME_saved.self_overlay)
        MMD_SA_options.MME._HDR = Object.clone(MME_saved.HDR)
        MMD_SA_options.MME._serious_shader = Object.clone(MME_saved.serious_shader)
        MMD_SA_options.MME._SAO = Object.clone(MME_saved.SAO)
        try {
          var f = FSO_OBJ.OpenTextFile(System.Gadget.path + '\\MMD.js\\data\\MMD_MME_by_model.json', 2, true);
          f.Write(JSON.stringify(MMD_SA_options.MME_saved))
          f.Close()
          DEBUG_show("(MME settings saved)", 2)
        }
        catch (err) {}
        System._browser.update_tray()
        break
      case "delete_default":
        if (!MMD_SA_options.MME_saved[model_filename_cleaned]) {
          DEBUG_show("(No saved settings exist)", 3)
          return
        }
        if (!confirm("This will delete the saved visual effect and model list settings for the current MMD model."))
          return
        delete MMD_SA_options.MME_saved[model_filename_cleaned]
        try {
          var f = FSO_OBJ.OpenTextFile(System.Gadget.path + '\\MMD.js\\data\\MMD_MME_by_model.json', 2, true);
          f.Write(JSON.stringify(MMD_SA_options.MME_saved))
          f.Close()
          DEBUG_show("(MME settings deleted)", 2)
          System._browser.update_tray()
        }
        catch (err) {}
        break
      case "reset":
        if (!confirm("This will reset all visual effect settings to the original defaults (i.e. model-based effects enabled with default parameters, post-processing effects disabled)."))
          return
        MMD_SA_options.MME.self_overlay = { enabled:true }
        MMD_SA_options.MME.HDR = { enabled:true }
        MMD_SA_options.MME.serious_shader = { enabled:true }
        MMD_SA_options.MME.SAO = { disabled_by_material:[] }
        var PPE = MMD_SA_options.MME.PostProcessingEffects
        PPE.use_SAO = PPE.use_Diffusion = PPE.use_BloomPostProcess = false
        System.Gadget.Settings.writeString('Use3DSAO', '')
        System.Gadget.Settings.writeString('Use3DDiffusion', '')
        MMD_SA._MME_uniforms_updated_ = Date.now()
        System._browser.update_tray()
        break
      case "OFF":
        if (!confirm("This will disable all visual effects, and reset lighting/shadow to its default state."))
          return
        MMD_SA_options.MME.self_overlay = { enabled:false }
        MMD_SA_options.MME.HDR = { enabled:false }
        MMD_SA_options.MME.serious_shader = { enabled:false }
        MMD_SA_options.MME.SAO = { disabled_by_material:[] }
        var PPE = MMD_SA_options.MME.PostProcessingEffects
        PPE.enabled = PPE.use_SAO = PPE.use_Diffusion = PPE.use_BloomPostProcess = false
        System.Gadget.Settings.writeString('Use3DPPE', '')
        System.Gadget.Settings.writeString('Use3DSAO', '')
        System.Gadget.Settings.writeString('Use3DDiffusion', '')
        System.Gadget.Settings.writeString('MMDLightColor', '')
        System.Gadget.Settings.writeString('MMDLightPosition', '')
        System.Gadget.Settings.writeString('MMDShadow', '')
        var light = MMD_SA.light_list[1].obj
        light.color.set(MMD_SA_options.light_color)
        light.position.fromArray(MMD_SA_options.light_position).add(THREE.MMD.getModels()[0].mesh.position)
        MMD_SA._MME_uniforms_updated_ = Date.now()
        System._browser.update_tray()
        break
      case "Shadow":
        var shadow = parseFloat(para[2])
        if (shadow < 0)
          return
        if (shadow == 0) {
          MMD_SA_options.use_shadowMap = false
          System.Gadget.Settings.writeString('MMDShadow', '')
        }
        else {
          MMD_SA_options.use_shadowMap = true
          MMD_SA_options.shadow_darkness = shadow
          System.Gadget.Settings.writeString('MMDShadow', shadow)
        }
        MMD_SA.toggle_shadowMap()
//        System._browser.update_tray()
        break
      case "Light":
        var light = MMD_SA.light_list[1].obj
        switch (para[2]) {
          case "color":
            var color = parseInt(para[4])
            if (color < 0)
              return
            var index
            switch (para[3]) {
              case "red":
                index = 0
                break
              case "green":
                index = 1
                break
              case "blue":
                index = 2
                break
            }
            var color_p = ["r", "g", "b"]
            light.color[color_p[index]] = color / 255
            var hex = '#' + light.color.getHexString()
            System.Gadget.Settings.writeString('MMDLightColor', hex)
            DEBUG_show("Light color:" + hex, 3)
            break
          case "position":
            var pos = parseFloat(para[4])
            if (pos < -1)
              return
            var index
            switch (para[3]) {
              case "X":
                index = 0
                break
              case "Y":
                index = 1
                break
              case "Z":
                index = 2
                break
            }
            var model_pos = THREE.MMD.getModels()[0].mesh.position
            var pos_p = ["x", "y", "z"]
            var p = pos_p[index]
            light.position[p] = pos * MMD_SA_options.light_position_scale + model_pos[p]
            var pos_array = MMD_SA.TEMP_v3.copy(light.position).sub(model_pos).toArray()
            for (var i = 0; i < 3; i++)
              pos_array[i] = Math.round(pos_array[i]/MMD_SA_options.light_position_scale * 10) / 10
            System.Gadget.Settings.writeString('MMDLightPosition', JSON.stringify(pos_array))
            DEBUG_show("Light position:" + pos_array, 3)
            break
          case "reset":
            if (!confirm("This will reset lighting to its default state."))
              return
            System.Gadget.Settings.writeString('MMDLightColor', '')
            System.Gadget.Settings.writeString('MMDLightPosition', '')
            light.color.set(MMD_SA_options.light_color)
            light.position.fromArray(MMD_SA_options.light_position).add(THREE.MMD.getModels()[0].mesh.position)
            System._browser.update_tray()
            break
        }
        break
      case "PPE":
        var PPE = MMD_SA_options.MME.PostProcessingEffects
        switch (para[2]) {
          case "enabled":
            PPE.enabled = MMD_SA_options._PPE_enabled = !!parseInt(para[3])
            System.Gadget.Settings.writeString('Use3DPPE', ((PPE.enabled)?"non_default":""))
            System._browser.update_tray()
            break
          case "SAO":
            switch (para[3]) {
              case "disabled_by_material":
                var m_name = para[4]
                var disabled_by_material = MMD_SA_options.MME.SAO.disabled_by_material
                if (parseInt(para[5])) {
                  if (disabled_by_material.indexOf(m_name) == -1)
                    disabled_by_material.push(m_name)
                }
                else
                  MMD_SA_options.MME.SAO.disabled_by_material = disabled_by_material.filter(function (v) { return (v != m_name) })
                System._browser.update_tray()
                DEBUG_show('(Click "Save default" to save changes.)', 5)
                break
              default:
                PPE.use_SAO = !!parseInt(para[3])
                System.Gadget.Settings.writeString('Use3DSAO', ((PPE.use_SAO)?"non_default":""))
                break
            }
            break
          case "Diffusion":
            PPE.use_Diffusion = !!parseInt(para[3])
            System.Gadget.Settings.writeString('Use3DDiffusion', ((PPE.use_Diffusion)?"non_default":""))
            break
          case "BloomPostProcess":
            switch (para[3]) {
              case "blur_size":
                var v = parseFloat(para[4])
                if (v == -1)
                  return
                PPE.effects_by_name["BloomPostProcess"].blur_size = v
                System.Gadget.Settings.writeString('Use3DBloomPostProcessBlurSize', (v==0.5)?"":v)
                break
              case "threshold":
                var v = parseFloat(para[4])
                if (v == -1)
                  return
                PPE.effects_by_name["BloomPostProcess"].threshold = v
                System.Gadget.Settings.writeString('Use3DBloomPostProcessThreshold', (v==0.5)?"":v)
                break
              case "intensity":
                var v = parseFloat(para[4])
                if (v == -1)
                  return
                PPE.effects_by_name["BloomPostProcess"].intensity = v
                System.Gadget.Settings.writeString('Use3DBloomPostProcessIntensity', (v==0.5)?"":v)
                break
              default:
                PPE.use_BloomPostProcess = !!parseInt(para[3])
                System.Gadget.Settings.writeString('Use3DBloomPostProcess', ((PPE.use_BloomPostProcess)?"non_default":""))
                System._browser.update_tray()
                break
            }
            break
        }
        break
      case "SelfOverlay":
        var mme = MMD_SA_options.MME.self_overlay
        switch (para[2]) {
          case "opacity":
            var opacity = parseFloat(para[3])
            if (opacity < 0)
              return
            if (opacity == 0)
              mme.enabled = false
            else {
              mme.enabled = true
              mme.opacity = opacity
            }
            break
          case "brightness":
            var brightness = parseFloat(para[3])
            if (brightness < 0)
              return
            mme.brightness = brightness
            break
          case "color_adjust":
            var color = parseFloat(para[4])
            if (color < 0)
              return
            var color_adjust = mme.color_adjust || [1.5,1,1]
            var index
            switch (para[3]) {
              case "red":
                index = 0
                break
              case "green":
                index = 1
                break
              case "blue":
                index = 2
                break
            }
            color_adjust[index] = color
            mme.color_adjust = color_adjust
            break
          case "use_default":
            var use_default = parseInt(para[3])
            if (use_default) {
              MMD_SA_options.MME.self_overlay = Object.clone(MMD_SA_options.MME._self_overlay)
              MMD_SA._MME_uniforms_updated_ = Date.now()
              System._browser.update_tray()
              return
            }
            break
        }
        MMD_SA._MME_uniforms_updated_ = Date.now()
        MMD_SA_options.MME.self_overlay.use_default = false
        System._browser.update_tray()
        break
      case "HDR":
        var mme = MMD_SA_options.MME.HDR
        switch (para[2]) {
          case "opacity":
            var opacity = parseFloat(para[3])
            if (opacity < 0)
              return
            if (opacity == 0)
              mme.enabled = false
            else {
              mme.enabled = true
              mme.opacity = opacity
            }
            break
          case "use_default":
            var use_default = parseInt(para[3])
            if (use_default) {
              MMD_SA_options.MME.HDR = Object.clone(MMD_SA_options.MME._HDR)
              MMD_SA._MME_uniforms_updated_ = Date.now()
              System._browser.update_tray()
              return
            }
            break
        }
        MMD_SA._MME_uniforms_updated_ = Date.now()
        MMD_SA_options.MME.HDR.use_default = false
        System._browser.update_tray()
        break
      case "SeriousShader":
        var mme = MMD_SA_options.MME.serious_shader
        switch (para[2]) {
          case "OFF":
            mme.enabled = false
            break
          case "mode":
            mme.enabled = true
            var mode = parseInt(para[3])
            if (mode == 0)
              mme.type = "SeriousShader"
            else if (mode == 1)
              mme.type = "AdultShaderS2"
            else
              mme.type = "AdultShaderS"
//            mme.OverBright = (mme.type == "AdultShaderS2") ? 1.15 : 1.2
            break
          case "shadow_opacity":
            switch (para[3]) {
              case "material_x_0.5":
                if (!mme.material)
                  mme.material = {}
                var name = MMD_SA._material_list[para[4]]
                var v = (parseInt(para[5])) ? 0.5 : 1
                if (mme.material[name])
                  mme.material[name].shadow_opacity_scale = v
                else
                  mme.material[name] = { shadow_opacity_scale:v }
                break
              default:
                var opacity = parseFloat(para[3])
                if (opacity < 0)
                  return
                mme.shadow_opacity = opacity
              break
            }
            break
          case "OverBright":
            var over_bright = parseFloat(para[3])
            if (over_bright < 0)
              return
            mme.OverBright = over_bright
            break
          case "use_default":
            var use_default = parseInt(para[3])
            if (use_default) {
              MMD_SA_options.MME.serious_shader = Object.clone(MMD_SA_options.MME._serious_shader)
              MMD_SA._MME_uniforms_updated_ = Date.now()
              System._browser.update_tray()
              return
            }
            break
        }
        MMD_SA._MME_uniforms_updated_ = Date.now()
        MMD_SA_options.MME.serious_shader.use_default = false
        System._browser.update_tray()
        break
    }
    break

  case "look_at_camera":
    var _bool = !!parseInt(para[1])
    if (_bool)
      MMD_SA_options.look_at_screen = true
    else
      MMD_SA_options.look_at_screen = MMD_SA_options.look_at_mouse = false
    System.Gadget.Settings.writeString('MMDLookAtCamera', ((!MMD_SA_options.look_at_screen)?"non_default":""))
    System.Gadget.Settings.writeString('MMDLookAtMouse',  ((!MMD_SA_options.look_at_mouse) ?"non_default":""))
    break

  case "look_at_mouse":
    var _bool = !!parseInt(para[1])
    if (_bool)
      MMD_SA_options.look_at_mouse = MMD_SA_options.look_at_screen = true
    else
      MMD_SA_options.look_at_mouse = false
    System.Gadget.Settings.writeString('MMDLookAtCamera', ((!MMD_SA_options.look_at_screen)?"non_default":""))
    System.Gadget.Settings.writeString('MMDLookAtMouse',  ((!MMD_SA_options.look_at_mouse) ?"non_default":""))
    break

  case "trackball_camera":
    MMD_SA._trackball_camera.enabled = !!parseInt(para[1])
    System.Gadget.Settings.writeString('MMDTrackballCamera', ((!MMD_SA._trackball_camera.enabled)?"non_default":""))
    break

  case "random_camera":
    System.Gadget.Settings.writeString('MMDRandomCamera', ((!parseInt(para[1]))?"non_default":""))
    MMD_SA.reset_camera()
    break

  case "OSC_VMC_CLIENT":
    switch (para[1]) {
      case "enabled":
        MMD_SA.OSC.VMC.sender_enabled = !!parseInt(para[2]);
        break;
      case "send_camera_data":
        MMD_SA.OSC.VMC.send_camera_data = !!parseInt(para[2]);
        break;
      case "app_mode":
        MMD_SA.OSC.app_mode = para[2];
        break;
      case "hide_3D_avatar":
        MMD_SA.hide_3D_avatar = !!parseInt(para[2]);
        break;
    }
    break
}

if (linux_mode)
  System._browser.update_tray()
  };
};
