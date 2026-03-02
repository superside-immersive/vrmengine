/**
 * THREEX Render System — extracted from MMD_SA.js THREEX IIFE (R3).
 * Contains renderer (WebGL + framebuffer management), camera (clone/update/resize),
 * and light (clone/update for DirectionalLight and AmbientLight).
 * @param {Object} TX - Shared state object with getter/setter proxies to THREEX closure vars.
 * @returns {{ renderer: Object, camera: Object, light: Object }}
 */
window.MMD_SA_createTHREEX_RenderSystem = function(TX) {
  return {

    renderer: (function () {
      var _device_framebuffer = null;

      window.addEventListener('jThree_ready', function () {
// a "hack" to set default framebuffer for WebXR
if (TX.threeX.enabled) {
  const state = TX.threeX.renderer.obj.state;
  state._bindFramebuffer = state.bindFramebuffer;
  state.bindFramebuffer = function ( target, framebuffer ) {
    return this._bindFramebuffer( target, (framebuffer === null) ? _device_framebuffer : framebuffer );
  };
}
      });

      window.addEventListener('MMDStarted', ()=>{
Object.defineProperty(MMD_SA._trackball_camera.object, 'fov', (()=>{
  let fov = MMD_SA._trackball_camera.object.fov;
  return {
    get: function () { return fov; },
    set: function (v) {
      if (fov != v)
        window.dispatchEvent(new CustomEvent('SA_MMD_camera_FOV_on_change'));
      fov = v;
    }
  };
})());
      });

      return {
        get obj() { return (TX.threeX.enabled) ? TX.data.renderer : MMD_SA._renderer; },

// device framebuffer (mainly for WebXR)
        get device_framebuffer() { return _device_framebuffer; },
        set device_framebuffer(fb) {
if (fb != _device_framebuffer) {
  _device_framebuffer = fb;
  const _gl = this.obj.getContext();
  if (TX.threeX.enabled) {
    this.obj.state.bindFramebuffer(_gl.FRAMEBUFFER, fb);
  }
  else {
    _gl.bindFramebuffer(_gl.FRAMEBUFFER, fb);
  }
}
        },

        get devicePixelRatio() { return (TX.threeX.enabled) ? this.obj.getPixelRatio() : this.obj.devicePixelRatio; },
        set devicePixelRatio(v) {
if (!TX.threeX.enabled) {
  this.obj.devicePixelRatio = v;
}
else {
  this.obj.setPixelRatio(v);
}
        },

        setSize: function (width, height) {
MMD_SA._renderer.setSize(width, height);
TX.threeX.enabled && this.obj.setSize(width, height);
        },

        render: function (scene, camera) {
if (!TX.threeX.enabled) return false

TX.threeX.camera.update(camera)

var lights = scene.__lights
lights.forEach(light=>{
  TX.threeX.light.update(light)
});

TX.obj_list.forEach((obj) => {
  var mesh = obj.obj
  var p = obj.parent
  if (!p) {
    mesh.visible = false
    return
  }

  mesh.position.copy(p.position)
  mesh.quaternion.copy(p.quaternion)
  if (!obj.no_scale)
    mesh.scale.copy(p.scale)
  mesh.visible = p.visible

  obj.update && obj.update()
});

if (MMD_SA.MMD_started) {
  TX._THREE.MMD.getModels().forEach((m,idx)=>{
    var mesh = m.mesh

// if mesh.matrixAutoUpdate is true, update the model matrixWorld here (AFTER the default routine of MMD mesh matrixWorld update)
    if (mesh.matrixAutoUpdate) {
      MMD_SA.THREEX.get_model(idx).update_model();
    }

// MMD physics (.simulate()) has been skipped. Do the necessary stuff here.
    if (mesh._reset_rigid_body_physics_ > 0) {
      mesh._reset_rigid_body_physics_ = Math.max(mesh._reset_rigid_body_physics_ - Math.min(RAF_timestamp_delta/1000*30, 1), 0)
    }

    m.simulateCallback && m.simulateCallback();
  });
}

if (!System._browser.rendering_check()) return true;

let obj_hidden_list = [];
if (MMD_SA.hide_3D_avatar) {
  const obj_check_list = [TX.models[0].mesh];
  if (MMD_SA_options.Dungeon?.started) {
    const domeMesh = MMD_SA_options.mesh_obj_by_id?.["DomeMESH"]?._obj;
    if (domeMesh) obj_check_list.push(domeMesh);
    if (MMD_SA.THREEX._object3d_list_ && !MMD_SA.THREEX._XR_Animator_scene_?.settings?.avatar_replacement_mode)
      obj_check_list.push(...MMD_SA.THREEX._object3d_list_.map(obj=>obj._obj).filter(Boolean));
  }
  obj_check_list.forEach(obj=>{
    if (obj.visible) {
      obj.visible = false;
      obj_hidden_list.push(obj);
    }
  });
}

if (TX.threeX.use_OutlineEffect) {
//  TX.data.renderer.autoClear = true
  TX.data.OutlineEffect.render( TX.data.scene, TX.data.camera );
//  TX.data.renderer.autoClear = false
}
else {
  if (!TX.threeX.PPE.render(TX.data.scene, TX.data.camera)) {
    TX.data.renderer.toneMapping = TX.THREE.NoToneMapping;
    TX.data.renderer.render(TX.data.scene, TX.data.camera);
  }
}

obj_hidden_list.forEach(obj=>{
  obj.visible = true;
});

//DEBUG_show(Date.now())
return true
        }
      };
    })(),

    camera: {
      get obj() { return (TX.threeX.enabled) ? TX.data.camera : (MMD_SA._renderer.__camera || MMD_SA._trackball_camera.object); },

      clone: function (camera) {
if (!TX.threeX.enabled) return

// camera.near needs to be big enough to avoid flickers in N8AO
var c = new TX.THREE.PerspectiveCamera( camera.fov, camera.aspect, Math.max(camera.near,1), camera.far )
camera._THREEX_child = c

if (!TX.data.camera) TX.data.camera = c
return c
      },

      update: function (camera) {
if (!TX.threeX.enabled) return;

var c = camera._THREEX_child;
if (!c) return;

c.position.copy(camera.position)
c.quaternion.copy(camera.quaternion)
c.up.copy(camera.up)

c.matrixAutoUpdate = camera.matrixAutoUpdate
if (!c.matrixAutoUpdate) {
  c.matrix.copy(camera.matrix);
  c.matrixWorld.copy(camera.matrixWorld);
}

// always update projection matrix when necessary, as there are compatibility issues simply by copying the projection matrix from the old camera
if (c.fov != camera.fov) {
  c.fov = camera.fov;
  c.updateProjectionMatrix();
}
      },

      resize: function (width, height) {
(MMD_SA._renderer.__camera || MMD_SA._trackball_camera.object).resize(width, height);
if (TX.threeX.enabled) {
  this.obj.aspect = width/height
  this.obj.updateProjectionMatrix()
}
      },

      control: {
        enabled: true
      }
    },

    light: (()=>{
      const obj = {
        AmbientLight: [],
        DirectionalLight: [],
      };

      return {
        obj: {
          get AmbientLight() { return (TX.threeX.enabled) ? obj.AmbientLight : []; },
          get DirectionalLight() { return (TX.threeX.enabled) ? obj.DirectionalLight : []; },
        },

        clone: function (light) {
if (!TX.threeX.enabled) return

var type
if (light instanceof TX._THREE.DirectionalLight) {
  type = 'DirectionalLight'
}
else if (light instanceof TX._THREE.AmbientLight) {
  type = 'AmbientLight'
}

var l = new TX.THREE[type]()
light._THREEX_child = l
l._THREE_parent = light;

obj[type].push(l);

// https://threejs.org/docs/#api/en/lights/DirectionalLight
if (type == 'DirectionalLight') {
  const para = MMD_SA_options.shadow_para
  l.shadow.mapSize.set(para.shadowMapWidth, para.shadowMapWidth)

  TX.data.scene.add(l.target)
}

TX.data.scene.add(l)
        },

        update: function (light) {
if (!TX.threeX.enabled) return

var c, c_max;
c = light._THREEX_child;
c.position.copy(light.position);
c.color.copy(light.color);
c_max = Math.max(c.color.r, c.color.g, c.color.b);

// r149 => r150
// https://github.com/mrdoob/three.js/wiki/Migration-Guide#r149--r150
//threeX.renderer.obj.physicallyCorrectLights=true;
//if (threeX.renderer.obj.physicallyCorrectLights) c_max *= 5;

c_max *= 5; // [9F] useLegacyLights comments removed (obsolete Three.js property)

if (c.type == 'DirectionalLight') {
  if (TX.use_VRM1)
    c.intensity = light.intensity * c_max;
  c.intensity *= 3;

  const c_scale = Math.min(1/c_max);
  c.color.multiplyScalar(c_scale);

  c.target.position.copy(light.target.position)

  if (c.castShadow != light.castShadow) {
    c.castShadow = light.castShadow
    if (c.castShadow) {
      const para = light//MMD_SA_options.shadow_para
      c.shadow.camera.left = para.shadowCameraLeft
      c.shadow.camera.right = para.shadowCameraRight
      c.shadow.camera.top = para.shadowCameraTop
      c.shadow.camera.bottom = para.shadowCameraBottom
      c.shadow.camera.updateProjectionMatrix()
//console.log(para)
/*
if (!this._shadow_camera_helper) {
const helper = this._shadow_camera_helper = new TX.THREE.CameraHelper( c.shadow.camera );
TX.data.scene.add(helper)
}
*/
      console.log('(THREEX shadow camera enabled)')
    }
  }
}
else if (c.type == 'AmbientLight') {
  if (TX.use_VRM1) {
    c.intensity = c_max * 0.5;
  }
  c.intensity *= 2/3;
}
        }
      };
    })()

  };
};
