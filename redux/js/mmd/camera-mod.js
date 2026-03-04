// camera-mod.js — extracted from MMD_SA.js
// Camera modification system: positional offsets, rotation, multi-mod stacking

window.MMD_SA_createCameraMod = function () {
return (function () {
    let camera_mod;

    let vp, vt;
    let v1, v2, v3, v4, v5;
    window.addEventListener('jThree_ready', ()=>{
      vp = new THREE.Vector3();
      vt = new THREE.Vector3();
      v1 = new THREE.Vector3();
      v2 = new THREE.Vector3();
      v3 = new THREE.Vector3();
      v4 = new THREE.Vector3();
      v5 = new THREE.Vector3();

      camera_mod = class Camera_mod {
constructor(id) {
  this.id = id;
  this.pos_last = new THREE.Vector3();
  this.target_last = new THREE.Vector3();

  this.up_z_last = 0;

  Camera_mod.mod_list[id] = this;
}

adjust(pos, target, up_z) {
  Camera_mod.update_camera_base();

  const obj = MMD_SA._trackball_camera;

  if (pos) {
    Camera_mod.pos_last.sub(this.pos_last).add(pos);
    obj.object.position.copy(Camera_mod.c_pos).add(Camera_mod.pos_last);
    this.pos_last.copy(pos);
  }
  if (target) {
    Camera_mod.target_last.sub(this.target_last).add(target);
    obj.target.copy(Camera_mod.c_target).add(Camera_mod.target_last);
    this.target_last.copy(target);
  }
  if (up_z != null) {
    Camera_mod.up_z_last = Camera_mod.up_z_last - this.up_z_last + up_z;
    Camera_mod.rotate_up_z(obj.object.up, Camera_mod.c_up, Camera_mod.up_z_last);
    this.up_z_last = up_z;
  }
}

static update_camera_base() {
  const obj = MMD_SA._trackball_camera;

  Camera_mod.c_pos.copy(obj.object.position).sub(Camera_mod.pos_last);
  Camera_mod.c_target.copy(obj.target).sub(Camera_mod.target_last);

  if (Math.abs(Camera_mod.up_z_last) > 0.0001) {
    Camera_mod.rotate_up_z(Camera_mod.c_up, obj.object.up, -Camera_mod.up_z_last);
  }
}

static rotate_up_z(up_target, up, z) {
  const obj = MMD_SA._trackball_camera;

  const axis = Camera_mod.#v1.copy(obj.object.position).sub(obj.target);
  // Guard: if position == target, axis is zero-length → normalize() returns NaN
  if (axis.lengthSq() < 1e-10) return up_target.copy(up);
  axis.normalize();
  const up_rot = Camera_mod.#q1.setFromAxisAngle(axis, z);
  return up_target.copy(up).applyQuaternion(up_rot);
}

static #up = new THREE.Vector3(0,1,0);
static #q1 = new THREE.Quaternion();
static #q2 = new THREE.Quaternion();
static #v1 = new THREE.Vector3();
static #v2 = new THREE.Vector3();

static c_pos = new THREE.Vector3();
static c_target = new THREE.Vector3();
static pos_last = new THREE.Vector3();
static target_last = new THREE.Vector3();

static c_up = new THREE.Vector3();
static up_z_last = 0;

static mod_list = {};
static get_mod(id) {
  return Camera_mod.mod_list[id] || new Camera_mod(id);
}
      }

      window.addEventListener('MMDCameraReset_after', (e)=>{
        if (e.detail.enforced === false) return;

        System._browser.on_animation_update.add(()=>{
          var obj = MMD_SA._trackball_camera;
          obj.object.position.add(camera_mod.pos_last);
          obj.target.add(camera_mod.target_last);

          camera_mod.rotate_up_z(obj.object.up, obj.object.up, camera_mod.up_z_last);
        },0,0);
      });
    });

    return {
      get _obj() { return camera_mod; },

      adjust_camera: function (id, pos, target, up) {
if (!MMD_SA.MMD_started) return;

const c_mod = camera_mod.get_mod(id);
c_mod.adjust(pos, target, up);

return c_mod;
      },

      get_mod: function (id) {
return camera_mod.get_mod(id);
      },

      get_camera_base: function (ignore_list, update_camera_base) {
if (update_camera_base !== false)
  camera_mod.update_camera_base();

const pos = vp.copy(camera_mod.c_pos);
const target = vt.copy(camera_mod.c_target);
let up_z = camera_mod.up_z_last;

((ignore_list === true) ? Object.keys(camera_mod.mod_list) : ignore_list)?.forEach(id=>{
  const c = camera_mod.mod_list[id];
  if (c) {
    pos.add(c.pos_last);
    target.add(c.target_last);
    up_z += c.up_z_last;
  }
});

return {
  pos:pos,
  target:target,
  up_z: up_z,
};
      },

      get_camera_raw: function (update_camera_base, offset_rotation) {
const obj = MMD_SA._trackball_camera;

const cam_base_mod = this.get_camera_base(true, update_camera_base);
const pos_base = v4.copy(cam_base_mod.pos);
const target_base = v5.copy(cam_base_mod.target);
const up_z_base = cam_base_mod.up_z;
      
const cam_base_mod2 = this.get_camera_base(null, false);

let z = v1.setEulerFromQuaternion(obj.object.quaternion, 'YXZ').z;
const z_offset = up_z_base - cam_base_mod2.up_z;
z -= z_offset;

const pos = v2.copy(obj.object.position);
const pos_offset = pos_base.sub(cam_base_mod2.pos);
pos.sub(pos_offset);

const target = v3.copy(obj.target);
const target_offset = target_base.sub(cam_base_mod2.target);
target.sub(target_offset);

const model_pos = THREE.MMD.getModels()[0].mesh.position;
const cam_base_pos = v4.fromArray(MMD_SA_options.camera_position_base).add(MMD_SA.TEMP_v3.fromArray(MMD_SA.center_view)).add(model_pos);
const cam_base_target = v5.copy(THREE.MMD.getModels()[0].mesh.position).add(MMD_SA.TEMP_v3.fromArray(MMD_SA.center_view_lookAt)).add(MMD_SA.TEMP_v3.fromArray(MMD_SA_options.camera_lookAt));
if (offset_rotation) {
  const axis = v1.copy(cam_base_pos).sub(cam_base_target).normalize();
  const q = MMD_SA.TEMP_q.setFromUnitVectors(axis, MMD_SA.TEMP_v3.copy(pos).sub(target).normalize());
  pos.sub(target).applyQuaternion(q.conjugate()).add(target);
}

return {
  pos: pos.sub(cam_base_pos),
  target: target.sub(cam_base_target),
  up_z: z,
};
      },
    };
  })();
};
