/**
 * Camera view computed properties — extracted from MMD_SA.js init() body (R3).
 * Sets up camera_auto_adjust_scale, center_view, center_view_lookAt, etc.
 * Called once from MMD_SA.init().
 */
window.MMD_SA_setupCameraView = function() {

Object.defineProperty(MMD_SA, "camera_auto_adjust_scale_enabled", {
  get: function () {
return MMD_SA_options.camera_auto_adjust && !THREE.MMD.getCameraMotion().length && (this.MMD.motionManager.para_SA.camera_auto_adjust !== false) && !this.MMD.motionManager.para_SA.use_mother_bone;
  }
});

Object.defineProperty(MMD_SA, "camera_auto_adjust_fov_enabled", {
  get: function () {
return MMD_SA_options.camera_auto_adjust && !THREE.MMD.getCameraMotion().length && ((this.MMD.motionManager.para_SA.camera_auto_adjust !== false) || this.MMD.motionManager.para_SA.camera_auto_adjust_fov);
  }
});

Object.defineProperty(MMD_SA, "camera_auto_adjust_scale",
{
  get: function () {
if (!this.camera_auto_adjust_scale_enabled) return 1;

const modelX = MMD_SA.THREEX.get_model(0);
let scale1 = modelX.para.left_leg_length / 10.569580078125;
let scale2 = modelX.para.spine_length / 4.97462;
if (((scale1 > 1) && (scale2 < 1)) || ((scale1 < 1) && (scale2 > 1))) return 1;

let scale = (scale1+scale2)/2;//(scale1 > 1) ? Math.min(scale1, scale2) : Math.max(scale1, scale2);//

const mod = 0.9;
const mod2 = 1 * ((scale < 1) ? Math.pow(scale, 0.25) : 1);

scale = (scale > 1) ? Math.max(scale*mod, 1) : Math.min(scale/mod, 1);
scale = 1 + (scale-1) * mod2;

return scale;
  }
});

Object.defineProperty(MMD_SA, "center_view_raw",
{
  get: function () {
if (MMD_SA_options.MMD_disabled)
  return [0,0,0];

var para_SA = this.MMD.motionManager.para_SA;
var cv = (para_SA.center_view || MMD_SA_options.center_view || [0,0,0]).slice();

if (MMD_SA_options.Dungeon && !MMD_SA.music_mode) {
  if (!para_SA.center_view_enforced)
    cv[2] = -cv[2];
}

let scale = this.camera_auto_adjust_scale;
if (scale != 1) {
  const c_base = MMD_SA._v3a_.fromArray(MMD_SA_options.camera_position_base).add(MMD_SA.TEMP_v3.fromArray(cv));
  c_base.multiplyScalar(scale);
  cv = c_base.sub(MMD_SA.TEMP_v3.fromArray(MMD_SA_options.camera_position_base)).toArray();
  cv[2] *= MMD_SA_options.Dungeon_options.camera_position_z_sign;
}
else if (MMD_SA_options.camera_auto_adjust && ((cv[1] == 0) || this.MMD.motionManager.para_SA.use_mother_bone)) {

  const modelX = MMD_SA.THREEX.get_model(0);
  let scale_offset = (modelX.para.hip_center.y + modelX.para.spine_length/2) - (11.364640235900879 + 4.97462/2);
  scale_offset *= 0.75;
  if (scale_offset < 0) scale_offset *= 0.85;
  cv[1] += scale_offset*0.5;

}

if (this.camera_auto_adjust_fov_enabled) {
// https://hofk.de/main/discourse.threejs/2022/CalculateCameraDistance/CalculateCameraDistance.html
// fov 50: 0.93261531630999718566001238959912
  let f_fov = 2 * Math.tan(Math.PI/180 * MMD_SA.THREEX.camera.obj.fov / 2);
  let fov_mod = 0.93261531630999718566001238959912/f_fov;
  fov_mod = 1 + (fov_mod-1) * 0.5;
  cz = MMD_SA_options.camera_position_base[2] * MMD_SA_options.Dungeon_options.camera_position_z_sign;
  cv[2] = ((cv[2] + cz) * fov_mod - cz);
}

return cv
  }
});

Object.defineProperty(MMD_SA, "center_view",
{
  get: function () {
let cv = this.center_view_raw;

if (MMD_SA_options.Dungeon && !MMD_SA.music_mode) {
  let c = MMD_SA_options.Dungeon.character
  let rot = c.rot//.clone()
//  if (c.mount_para && c.mount_para.mount_rotation) rot.add(MMD_SA.TEMP_v3.copy(c.mount_para.mount_rotation).multiplyScalar(Math.PI/180))
  cv = MMD_SA._v3a_.fromArray(cv).applyEuler(rot).toArray()
}

return cv
  }
});

Object.defineProperty(MMD_SA, "center_view_lookAt",
{
  get: function () {
if (MMD_SA_options.MMD_disabled)
  return [0,0,0];

var para_SA = this.MMD.motionManager.para_SA;
var center_view_lookAt = para_SA.center_view_lookAt || MMD_SA_options.center_view_lookAt;

let scale = this.camera_auto_adjust_scale;
if (!center_view_lookAt) {
  center_view_lookAt = this.center_view_raw.slice(0,2);
  center_view_lookAt.push(0)
}
else {
  if (scale != 1)
    center_view_lookAt = MMD_SA._v3a_.fromArray(center_view_lookAt).multiplyScalar(scale).toArray();
}

if (MMD_SA.center_view_lookAt_offset) {
  center_view_lookAt = center_view_lookAt.slice();
  for (var i = 0; i < 3; i++)
    center_view_lookAt[i] += MMD_SA.center_view_lookAt_offset[i] * scale;
}


if (MMD_SA_options.Dungeon && !MMD_SA.music_mode) {
  center_view_lookAt = MMD_SA._v3a_.fromArray(center_view_lookAt).applyEuler(MMD_SA_options.Dungeon.character.rot).toArray();
}

return center_view_lookAt
  }
});

};
