/**
 * PathMotion — object path-following motion system for dungeon mode.
 * Extracted from dungeon.js (object motion section).
 *
 * LOAD-TIME SAFETY: This file is loaded via loadScriptSync BEFORE
 * three.core.min.js and MMD_SA.js. Therefore:
 *   - NO `new THREE.*()` at IIFE/construction time
 *   - NO `MMD_SA.*` at IIFE/construction time
 *   - Only `MMD_SA_options.Dungeon` is safe at load time
 *   - THREE objects are created lazily (inside functions called at runtime)
 */
(function () {
var d = MMD_SA_options.Dungeon;

var Motion = function (obj, para) {
  // Motion constructor runs at RUNTIME (game start), THREE is available
  this.obj = obj
  this.para = (obj.motion && Object.clone(obj.motion)) || para

  this.t_ini = 0
  this.path_index = 0
  this.path_alpha = 0
  this.pos_last  = new THREE.Vector3()
  this.mov_delta = new THREE.Vector3()
  this.rot_last  = new THREE.Vector3()
  this.rot_delta = new THREE.Vector3()
  this._paused = false

  if (this.para.path) {
    this.para.path.forEach(function (pt) {
if (pt.pos && !(pt.pos instanceof THREE.Vector3))
  pt.pos = new THREE.Vector3(pt.pos.x, pt.pos.y, pt.pos.z)
if (pt.rot && !(pt.rot instanceof THREE.Vector3))
  pt.rot = new THREE.Vector3(pt.rot.x, pt.rot.y, pt.rot.z)
    });
  }
}

Motion.prototype = {
  constructor: Motion

 ,get paused() {
return this._paused
  }

 ,set paused(v) {
v = !!v
if (this._paused == v)
  return
this._paused = v

if (v) {
  this._t_diff_paused = this._t - this.t_ini
}
else {
  this.t_ini = this._t - this._t_diff_paused
}
  }

 ,play: (function () {
// LAZY INIT: _v3 and _q allocated on first call, not at IIFE construction time
var _v3, _q;
var _lazy_inited = false;
function _lazy_init() {
  if (_lazy_inited) return;
  _lazy_inited = true;
  _v3 = new THREE.Vector3();
  _q  = new THREE.Quaternion();
}

var d = MMD_SA_options.Dungeon
var c = d.character

return function (t) {
  _lazy_init();

  var that = this

  if (!t)
    t = performance.now()
  this._t = t

  if (this.paused) {
    this.para.onframestart && this.para.onframestart(this)
    return
  }

  var pt_ini = this.para.path[this.path_index]
  var pt_end = this.para.path[this.path_index+1]

  if (!this.t_ini) {
    this.t_ini = t
    if (pt_ini.pos)
      this.pos_last.copy(pt_ini.pos)
    if (pt_ini.rot)
      this.rot_last.copy(pt_ini.rot)
    return
  }

  if (this.ending_delay) {
    if ((t - this.t_ini) / 1000 < this.ending_delay)
      return
  }
  else {
    var mesh_obj = this.obj._obj
// the first frame of a new point
    if (!this.path_alpha) {
      if (!this.para.is_relative_path) {
        if (pt_ini.pos)
          mesh_obj.position.copy(pt_ini.pos)
        if (pt_ini.rot) {
          mesh_obj.rotation.copy(pt_ini.rot)
// no need to update quaternion here since path motion operates on rotation
//          if (mesh_obj.useQuaternion) mesh_obj.quaternion.setFromEuler(mesh_obj.rotation)
        }
      }
      pt_ini.onstart && pt_ini.onstart(this)
    }

    this.para.onframestart && this.para.onframestart(this)

    this.path_alpha = Math.min((t - this.t_ini) / 1000 / pt_ini.duration, 1)
    if (!pt_ini.animate || !pt_ini.animate(this)) {
      this.path_alpha_position = this.path_alpha_rotation = this.path_alpha
    }

    if (pt_ini.pos) {
      _v3.copy(pt_ini.pos).lerp(pt_end.pos, this.path_alpha_position)
      this.mov_delta.copy(_v3).sub(this.pos_last)
      this.pos_last.copy(_v3)
    }

    if (pt_ini.rot) {
      _v3.copy(pt_ini.rot).lerp(pt_end.rot, this.path_alpha_rotation)
      this.rot_delta.copy(_v3).sub(this.rot_last).multiplyScalar(Math.PI/180)
      this.rot_last.copy(_v3)
    }

//console.log(pt_ini.pos.toArray().join(",")+'/'+pt_end.pos.toArray().join(",")+'/'+mov_delta.toArray().join(","))
//console.log(mesh_obj.position.toArray().join(",")+'/'+mov_delta.toArray().join(","))
    if (this.para.check_collision) {
      d._mov[this.obj._index] = this.mov_delta.clone()
    }
    else {
      mesh_obj.position.add(this.mov_delta)
    }

    mesh_obj.rotation.add(this.rot_delta)
    if (this.obj.is_PC) {
      THREE.MMD.getModels()[0].mesh.quaternion.setFromEuler(mesh_obj.rotation)
      c.about_turn = false
      c.pos_update()
      MMD_SA._trackball_camera.SA_adjust(this.mov_delta)//, this.rot_delta)
    }
    else if (mesh_obj.useQuaternion) {
      mesh_obj.quaternion.setFromEuler(mesh_obj.rotation)
    }

    if (this.para.mounted_list) {
      this.para.mounted_list.forEach(function (mounted) {
        if (mounted == "PC") {
          if (c.ground_obj && (c.ground_obj.obj == that.obj)) {
            c.ground_obj.mov = that.mov_delta.clone()
          }
        }
        else {
          mounted._obj.position.add(that.mov_delta)
          mounted._obj.rotation.add(that.rot_delta)
          if (mounted._obj.useQuaternion)
            mounted._obj.quaternion.multiply(_q.setFromEuler(that.rot_delta))
        }
      });
    }

    this.para.onframefinish && this.para.onframefinish(this)
  }

  if (this.path_alpha == 1) {
    this.t_ini = t
    if (this.ending_delay)
      this.ending_delay = 0
    else if (pt_ini.ending_delay) {
      this.ending_delay = pt_ini.ending_delay
      this.mov_delta.set(0,0,0)
      this.rot_delta.set(0,0,0)
      if (this.para.mounted_list && (this.para.mounted_list.indexOf("PC") != -1)) {
        if (c.ground_obj && (c.ground_obj.obj == this.obj)) {
          c.ground_obj.mov = this.mov_delta.clone()
        }
      }
      return
    }

    this.path_alpha = 0
    pt_ini.onended && pt_ini.onended(this)
    if (++this.path_index == this.para.path.length-1) {
      this.path_index = 0
      if (this.para.loop == false) {
        this.paused = true
        if (this.obj.is_PC) {
          MMD_SA_options.Dungeon.character.path_motion = null
          MMD_SA_options.Dungeon.character.ground_obj = null
          MMD_SA.reset_camera()
        }
      }
    }
  }
};
  })()
}

d.PathMotion = Motion;
})();
