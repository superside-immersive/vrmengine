// item-base-part2.js — Item base entries: selfie, facemesh, baseball, hand_camera
// Extracted from animate.js
(function () {
  if (!MMD_SA_options.Dungeon_options) return;
  Object.assign(MMD_SA_options.Dungeon_options.item_base, {
    "selfie" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/' + ((is_mobile) ? 'selfie_64x64.png' : 'webcamera_64x64.png')
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.webcam_media.info_short.' + ((is_mobile) ? 'selfie_camera' : 'webcam_media')); }
// ,is_base_inventory: true
 ,stock_max: 1
 ,stock_default: 1

 ,action: {
    func: function (item) {
if (System._browser.camera.streamer_mode.running) return true;

if (MMD_SA.WebXR.session && !MMD_SA.WebXR.user_camera.initialized) {
  DEBUG_show("(You need to activate it before entering AR mode.)", 3)
  return true
}

if (!MMD_SA.WebXR.user_camera.initialized || !MMD_SA.WebXR.user_camera.visible) {
//  if (MMD_SA_options.Dungeon.inventory.action_disabled) return true
  MMD_SA_options.Dungeon.run_event("_SELFIE_",0)
}
else {
  MMD_SA.WebXR.user_camera.start()
}
    }
//   ,anytime: true
  }

 ,get info() {
var info = ''

if (System._browser.camera.visible) {
  if (System._browser.camera.ML_enabled) {
    info += System._browser.translation.get('XR_Animator.UI.webcam_media.info.camera_on.ML_on');
  }
  else {
    info += System._browser.translation.get('XR_Animator.UI.webcam_media.info.camera_on.ML_off');
  }
}
else {
  info += System._browser.translation.get('XR_Animator.UI.webcam_media.info.camera_off');
}

return info;
  }
    }

   ,"facemesh" : (()=>{
      function mocap_hotkeys(e) {
if (System._browser.hotkeys.disabled) return;

const ev = e.detail.e;
switch (ev.code) {
  case 'Pause':
    const camera = System._browser.camera;
    if (camera.initialized && camera.ML_enabled) {
      if (mocap_pause_timerID) {
        clearInterval(mocap_pause_timerID);
        mocap_pause_timerID = null;
      }

      if (camera.video.paused) {
        camera.video.play();
        camera.DEBUG_show('');
      }
      else {
        mocap_pause_countdown = 3;
        mocap_pause_timerID = setInterval(()=>{
          if (--mocap_pause_countdown == 0) {
            clearInterval(mocap_pause_timerID);
            mocap_pause_timerID = null;

            camera.video.pause();
            System._browser.on_animation_update.add(()=>{DEBUG_show('⏸️PAUSED', 3);}, 0,1);
          }
          else {
            camera.DEBUG_show('⏸️Pausing in...' + mocap_pause_countdown);
          }
        }, 1000);

        camera.DEBUG_show('⏸️Pausing in...' + mocap_pause_countdown);
      }
    }
    break
  default:
    return;
}

e.detail.result.return_value = true;
      }

      let mocap_pause_timerID, mocap_pause_countdown;

      window.addEventListener('MMDStarted', ()=>{
        window.addEventListener('SA_keydown', mocap_hotkeys);
      });

      return {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/motion-capture_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.motion_capture.info_short'); }
// ,is_base_inventory: true
 ,stock_max: 1
 ,stock_default: 1

 ,action: {
    func: function (item) {
if (MMD_SA.WebXR.user_camera.bodyPix.enabled) {
  DEBUG_show("(You can't enable motion capture and Selfie Segmentation AI at the same time.)", 5)
  return true
}

if (System._browser.camera.motion_recorder.speed) {
  System._browser.camera.motion_recorder.speed = 0
}
else if (!MMD_SA.WebXR.user_camera.ML_enabled) {
  MMD_SA_options.Dungeon.run_event("_FACEMESH_",0)
}
else  {
  MMD_SA_options.Dungeon.run_event("_FACEMESH_OPTIONS_",0)
}
    }
//   ,anytime: true
  }

 ,get info() {
var info = ''

if (System._browser.camera._info) {
  info += System._browser.camera._info;
}
else if (System._browser.camera.motion_recorder.speed) {
   info += System._browser.translation.get('XR_Animator.UI.motion_capture.ML_on.record_motion.choose_speed.begin_recording.info');
}
else if (System._browser.camera.ML_enabled) {
  if (!System._browser.camera.visible)
    info += System._browser.translation.get('XR_Animator.UI.motion_capture.info.ML_on.camera_off') + '\n';
  info += System._browser.translation.get('XR_Animator.UI.motion_capture.info.ML_on');
}
else {
  info += System._browser.translation.get('XR_Animator.UI.motion_capture.info.ML_off');
}

return info;
  }

//'123 \\A 123 \\A 789 \\A 789 \\A 789'
/*
 ,onmouseover: function (e, index) {
var SB = MMD_SA.SpeechBubble.list[1]
SB.message(0, 'Enable motion capture to control the avatar with your body.', 4*1000, {group_index:0, group:{name:"motion_capture", loop:1}})
SB.message(0, 'You can track your face, ' + ((System._browser.camera.poseNet.use_holistic) ? 'or full body (Holistic).' : 'full body, or something in between.'), 4*1000, {group:{name:"motion_capture"}})
  }
// ,onmouseout: function (e) {}
*/
      };
    })()

   ,"baseball" : (function () {
      var baseball_started;

      var v3a, v3b;
      window.addEventListener("jThree_ready", function () {
v3a = new THREE.Vector3()
v3b = new THREE.Vector3()
      });

      var baseball = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/baseball_64x64.png'
 ,info_short: "Baseball catcher"
// ,is_base_inventory: true

 ,get index_default() { return (is_mobile) ? 5 : (MMD_SA_options.Dungeon.inventory.max_base+MMD_SA_options.Dungeon.inventory.max_base*(MMD_SA_options.Dungeon.inventory.max_row-1))+1; }
// ,get index_default() { return (is_mobile) ? undefined : MMD_SA_options.Dungeon.inventory.max_base+1; }

 ,stock_max: 1
 ,stock_default: 1

 ,action: {
    func: function (item) {
var model_mesh = THREE.MMD.getModels()[0].mesh
if (!model_mesh.visible)
  return true

var d = MMD_SA_options.Dungeon
if (d.event_mode && !baseball_started)
  return true

if (baseball_started) {
  item.reset()
  DEBUG_show("Baseball catcher:OFF", 2)

  return false
}
//DEBUG_show(MMD_SA.MMD.motionManager.filename)

if (!MMD_SA_options._XRA_pose_list[0].some(p=>p.name == MMD_SA.MMD.motionManager.filename))
  return true
if (MMD_SA_options.Dungeon_options.item_base.social_distancing._started)
  return

baseball_started = true

d._states.event_mode_locked = true

DEBUG_show("Baseball catcher:ON", 2)

this._ball_para = null
this._distance_check()
    }
   ,anytime: true

   ,_distance: function () {
return v3a.copy(MMD_SA.camera_position).distanceTo(v3b.copy(THREE.MMD.getModels()[0].mesh.position))/10// / MMD_SA.WebXR.zoom_scale;
    }

   ,_distance_check: function () {
this._ball_para = null

var dis = this._distance()

if (dis < 5) {
  if (MMD_SA_options._motion_shuffle_list_default[0] == MMD_SA_options.motion_index_by_name["emote-mod_がっかり1"])
    return true
  MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_がっかり1"], MMD_SA_options.motion_index_by_name["emote-mod_がっかり2"], MMD_SA_options.motion_index_by_name["emote-mod_肩をすくめる1"], MMD_SA_options.motion_index_by_name["emote-mod_肩をすくめる2"]]
}
else {
  let r = MMD_SA.face_camera(MMD_SA._head_pos, THREE.MMD.getModels()[0].mesh.quaternion.clone().conjugate(), true)
//DEBUG_show(r.x+'\n'+r.y)
  if ((Math.abs(r.x) > Math.PI/3) || (Math.abs(r.y) > Math.PI/3)) {
    if (MMD_SA_options._motion_shuffle_list_default[0] == MMD_SA_options.motion_index_by_name["emote-mod_すねる1"])
      return true
    MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["emote-mod_すねる1"], MMD_SA_options.motion_index_by_name["emote-mod_すねる2"], MMD_SA_options.motion_index_by_name["emote-mod_よろめく1"], MMD_SA_options.motion_index_by_name["emote-mod_よろめく2"]]
  }
  else {
    MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["baseball_throw"]]
  }
}

MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
    }

   ,_ball_fly: function () {
var mesh = THREE.MMD.getModels()[0].mesh
var obj = MMD_SA_options.Dungeon.object_base_list[0].object_list[0]._obj

if (!this._ball_para) {
  let pos_ini = obj.position.clone()
  let pos_end = MMD_SA._trackball_camera.object.position.clone()

  let dis = pos_ini.distanceTo(pos_end)
  let f = Math.max(dis/100,1)
  let velocity = pos_end.clone().sub(pos_ini).multiplyScalar(1/f)

  let rot_ini = MMD_SA._v3a.set((Math.random()-0.5)*Math.PI/20/f, (Math.random()-0.5)*Math.PI/20/f, 0)
  let rot_end = MMD_SA._v3b.set((Math.random()-0.5)*Math.PI/10/f, (Math.random()-0.5)*Math.PI/10/f, 0)
//rot_ini.set(0,0,0);rot_end.set(0,0,0);

  this._ball_para = {
    pos_ini:pos_ini,
    pos_end:pos_end,
    velocity:velocity,
    rot_self: rot_end.clone(),
    rot_ini:new THREE.Quaternion().setFromEuler(rot_ini),
    rot_end:new THREE.Quaternion().setFromEuler(rot_end.add(rot_ini)),

    timestamp_ini:RAF_timestamp,
    timestamp:RAF_timestamp,
  };
}

var time_diff = (RAF_timestamp - this._ball_para.timestamp) / 1000
this._ball_para.timestamp = RAF_timestamp

var time = (RAF_timestamp - this._ball_para.timestamp_ini) / 1000

var v = MMD_SA._v3b.copy(this._ball_para.velocity).multiplyScalar(time_diff).applyQuaternion(MMD_SA.TEMP_q.copy(this._ball_para.rot_ini).slerp(this._ball_para.rot_end, Math.pow(Math.min(time, 1), 2)))
obj.position.add(v)
obj.quaternion.copy(MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3.copy(this._ball_para.rot_self).multiplyScalar(time*50)))

obj.matrixAutoUpdate = false
obj.updateMatrix()

var c_pos = this._ball_para.pos_ini
var c_to_camera = c_pos.distanceTo(MMD_SA._trackball_camera.object.position)
var c_to_ball = c_pos.distanceTo(obj.position)

//DEBUG_show(c_to_ball+'\n'+c_to_camera)
if (c_to_ball > c_to_camera) {
  if (this._ball_para.hit_score == null) {
    let v_path = MMD_SA._v3a_.copy(this._ball_para.ball_pos_last).sub(c_pos)
    let v_path_length = v_path.length()
    if (v_path_length < c_to_camera) {
      let v_scale = (c_to_camera-v_path_length)/v.length()
      v_path.copy(this._ball_para.ball_pos_last).add(v.multiplyScalar(v_scale)).sub(c_pos)
//DEBUG_show([c_to_camera,c_to_ball,v_path.length(),v_scale,Date.now()].join('\n'))
    }

    let v_axis = MMD_SA._v3a.copy(v_path).normalize()
    let z_axis = MMD_SA._v3b.set(0,0,1)
//    let q = MMD_SA.TEMP_q.setFromAxisAngle(MMD_SA.TEMP_v3.crossVectors(v_axis,z_axis).normalize(), v_axis.angleTo(z_axis))
    let q = MMD_SA.TEMP_q.setFromUnitVectors(v_axis,z_axis)
//DEBUG_show(v_path.clone().applyQuaternion(q).toArray().join('\n'))
    let v_path_camera = MMD_SA._v3a.copy(MMD_SA._trackball_camera.object.position).sub(c_pos)
    let v_score = MMD_SA._v3b.copy(v_path_camera).applyQuaternion(q)
    let score = Math.round(100 - Math.min(Math.max(Math.sqrt(v_score.x*v_score.x + v_score.y*v_score.y)-1, 0), 5) * 20)
//DEBUG_show(score)
//score = 100
    this._ball_para.hit_score = score

    let sprite_pos = v_path.normalize().lerp(v_path_camera.normalize(), 0.8).multiplyScalar(c_to_camera-2).add(c_pos)

    let para = { scale:1, speed:1 }
    para.pos = sprite_pos.clone()
    para.name = "hit_yellow_01"
/*
    if (score < 33) {
      para.scale *= 0.5
      para.speed *= 2
    }
    else if (score < 66) {
      para.scale *= 0.75
      para.speed *= 1.5
    }
    else {
      para.scale *= 1.5
      para.speed *= 1
    }
*/
    para.scale *= 0.1;
    para.scale *= 1.5;
    MMD_SA_options.Dungeon.sprite.animate(para.name, para)
    MMD_SA_options.Dungeon.sound.audio_object_by_name["hit-1"].play()
  }
}

this._ball_para.ball_pos_last = this._ball_para.ball_pos_last && this._ball_para.ball_pos_last.copy(obj.position) || obj.position.clone();
    }

  }
 ,reset: function () {
if (!baseball_started)
  return
baseball_started = false

MMD_SA_options.Dungeon._states.event_mode_locked = false

this.action._ball_para = null

MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["standmix2_modified"]]
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice()
MMD_SA._force_motion_shuffle = true
  }

 ,get _started() { return baseball_started; }
      };

      return baseball;
    })()

   ,"hand_camera": (()=>{
      let camera_near_last;
      let no_camera_collision;
      let avatar_visible_distance;

      let camera_toggle_timestamp = 0;

      let selfie_mode;

      let fov_last;
      function update_fov(fov) {
if (MMD_SA._trackball_camera.object.fov != fov) {
  MMD_SA._trackball_camera.object.fov = fov;
  MMD_SA._trackball_camera.object.updateProjectionMatrix();
}
      }

      function hand_camera() {
const _hand_camera_active = hand_camera_active;
hand_camera_active = false;

if (!hand_camera_enabled) return;

const c = System._browser.camera;
// checking ._motion_path, in case frames.reset is triggered
if (!c.poseNet.frames._motion_path || (!c.poseNet.pose_enabled && !c.VMC_receiver.pose_enabled)) {
  disable_hand_camera();
  return;
}

const d = hand_camera_side;
const motion_para = MMD_SA.MMD.motionManager.para_SA;

const model = THREE.MMD.getModels()[0];
const mesh = model.mesh;
const modelX = MMD_SA.THREEX.get_model(0);
const hand_pos = modelX.get_bone_position_by_MMD_name(d+'手首');//MMD_SA.get_bone_position(mesh, d+'手首');//

let selfie_mode = _hand_camera.selfie_mode;

let camera_off = (!c.poseNet.data_detected && !c.VMC_receiver.pose_enabled) || !motion_para.motion_tracking_enabled || motion_para.motion_tracking?.hand_camera_disabled || (motion_para.motion_tracking?.arm_as_leg?.enabled && (motion_para.motion_tracking.arm_as_leg.linked_side != ((d=='左')?'right':'left')));
if (motion_para.motion_tracking_upper_body_only) {
  camera_off = camera_off || (System._browser.camera.poseNet.frames.get_blend_default_motion('skin', d+'手首') > 0.5);
}
else {
  camera_off = camera_off || ((modelX.get_bone_position_by_MMD_name(d+'腕').y - hand_pos.y) > v1.fromArray(modelX.get_bone_origin_by_MMD_name(d+'手首')).distanceTo(v2.fromArray(modelX.get_bone_origin_by_MMD_name(d+'腕'))) * 0.5);
//  if (System._browser.camera.poseNet._upper_body_only_mode && !selfie_mode) camera_off = camera_off || ((System._browser.camera.handpose.hand_visible_session[d]||0) < 1000);
}

if (!motion_para.motion_tracking_upper_body_only && (c.poseNet.data_detected || c.VMC_receiver.pose_enabled) && !(_hand_camera_active ^ camera_off)) {
  if (RAF_timestamp > camera_toggle_timestamp + 500) {
    camera_toggle_timestamp = RAF_timestamp;
  }
  else {
    camera_off = !_hand_camera_active;
  }
}

if (camera_off) {
  c.poseNet._arm_IK_adjust[hand_camera_side] = null;
  MMD_SA.Camera_MOD.adjust_camera('hand_camera', v1.set(0,0,0), v2.set(0,0,0), null);

  restore_camera();

  if (_hand_camera_active)
    MMD_SA.reset_camera();

  return;
}

hand_camera_active = true;

//if (c.poseNet.pose_enabled)
  c.poseNet.frames._reset_disabled = true;

if (MMD_SA.THREEX.enabled) {
  const camera = MMD_SA.THREEX.data.camera;
  if (camera.near != 0.1) {
    camera_near_last = camera.near;
    camera.near = 0.1;
    camera.updateProjectionMatrix();
  }
  if (MMD_SA_options.Dungeon.no_camera_collision !== true) {
// convert to non-null boolean
    no_camera_collision = !!MMD_SA_options.Dungeon.no_camera_collision;
    MMD_SA_options.Dungeon.no_camera_collision = true;
  }
  avatar_visible_distance = MMD_SA_options.avatar_visible_distance;
  MMD_SA_options.avatar_visible_distance = 1;
}

if (!fov_last) fov_last = MMD_SA._trackball_camera.object.fov;
update_fov(_hand_camera.fov);

const frames = c.poseNet.frames;
if (c.handpose.enabled || c.VMC_receiver.hand_enabled) {
  window.addEventListener('SA_camera_poseNet_process_bones_onended', ()=>{
    finger_list.forEach((f,i)=>{
      let ini = (i == 0) ? 0 : 1;
      for (let n = ini; n < ini+3; n++) {
        const f_name = d+f+'指'+nj_list[n];
        mesh.bones_by_name[f_name]?.quaternion.set(0,0,0,1);
      }
    });
  }, {once:true});
}

const sign_LR = (d=='左')?1:-1;

const mod = (c.poseNet.pose_enabled) ? 1 : 0.5;
c.poseNet._arm_IK_adjust[hand_camera_side] = { add:{x:-0.08*sign_LR*mod}, min:{z:0.5}, scale:{x:1+0.25*mod, y:1, z:1+0.5*mod} };
if (frames.skin[d+'腕ＩＫ']) frames.skin[d+'腕ＩＫ'][0].data_filter = {};

let target = v1;
if (selfie_mode) {
  const head_target = modelX.get_bone_position_by_MMD_name('首');
  const neck_y = modelX.get_bone_origin_by_MMD_name('頭')[1] - modelX.get_bone_origin_by_MMD_name('首')[1];
  head_target.y += neck_y*2;

  const arm_axis = modelX.get_bone_position_by_MMD_name(d+'ひじ').sub(hand_pos).negate().normalize();
  const arm_rot = q1.setFromUnitVectors(MMD_SA.TEMP_v3.set(sign_LR,0,0), arm_axis);
  hand_pos.add(v3.set(0,0.4,0).applyQuaternion(arm_rot));
  hand_pos.y += neck_y*2;

  window.addEventListener('SA_camera_poseNet_process_bones_onended', ()=>{
    mesh.bones_by_name[d+'手首'].quaternion.set(0,0,0,1);
    mesh.bones_by_name[d+'手捩']?.quaternion.set(0,0,0,1);
  }, {once:true});

  target.copy(head_target.sub(hand_pos)).normalize();
}
else {
  const hand_rot = modelX.get_bone_rotation_by_MMD_name(d+'手首');
//hand_rot.multiply(MMD_SA.TEMP_q.copy(mesh.quaternion).conjugate());

  target.set(0,-sign_LR,0);
  if (!MMD_SA.THREEX.enabled && MMD_SA_options.model_para_obj.rot_arm_adjust) target.applyQuaternion(MMD_SA_options.model_para_obj.rot_arm_adjust[d+'腕'].axis_rot);
  target.applyQuaternion(hand_rot).multiplyScalar(sign_LR);
//target.applyQuaternion(mesh.quaternion);
//hand_rot.multiply(mesh.quaternion);

//v2.setEulerFromQuaternion(hand_rot, 'ZYX').multiplyScalar(180/Math.PI);
//System._browser.camera.DEBUG_show(v2.toArray().join('\n')+'\n\n'+target.toArray().join('\n'))

  const hand_shift = v3.set(1,0,0);
  if (!MMD_SA.THREEX.enabled && MMD_SA_options.model_para_obj.rot_arm_adjust) hand_shift.applyQuaternion(MMD_SA_options.model_para_obj.rot_arm_adjust[d+'腕'].axis_rot);
  hand_shift.applyQuaternion(hand_rot).multiplyScalar(sign_LR);

  hand_pos.add(v2.copy(target).multiplyScalar(0.4)).add(hand_shift);
}

const filter = target_filter[d].filters[0].filter;
if (selfie_mode) {
  filter.minCutOff = 0.1;
  filter.beta = 0.2;
}
else {
  filter.minCutOff = 0.25;
  filter.beta = 0.5;
}
target.fromArray(target_filter[d].filter(target.toArray()));

target.multiplyScalar(30).add(hand_pos);

const c_base = MMD_SA.Camera_MOD.get_camera_base(['camera_lock','hip_camera','auto_zoom','face']);
hand_pos.sub(c_base.pos);
target.sub(c_base.target);

MMD_SA.Camera_MOD.adjust_camera('hand_camera', hand_pos, target, null);
      }

      function restore_camera() {
System._browser.camera.poseNet.frames._reset_disabled = null;

if (MMD_SA.THREEX.enabled) {
  if (camera_near_last) {
    const camera = MMD_SA.THREEX.data.camera;
    camera.near = camera_near_last;
    camera.updateProjectionMatrix();
    camera_near_last = null;
  }
  if (no_camera_collision != null) {
    MMD_SA_options.Dungeon.no_camera_collision = no_camera_collision;
    no_camera_collision = null;
  }
  MMD_SA_options.avatar_visible_distance = avatar_visible_distance;
}

if (fov_last)
  update_fov(fov_last);
fov_last = null;
      }

      function disable_hand_camera() {
hand_camera_enabled = false;
hand_camera_active = false;
System._browser.camera.poseNet._arm_IK_adjust = {};

MMD_SA_options.look_at_screen = returnBoolean("MMDLookAtCamera");

restore_camera();

for (const d of ['左','右'])
  delete System._browser.camera.poseNet.frames.skin[d+'腕ＩＫ']?.[0]?.data_filter;

MMD_SA.Camera_MOD.adjust_camera('hand_camera', v1.set(0,0,0), v2.set(0,0,0), null);

System._browser.camera.DEBUG_show('Hand camera:OFF', 3);
      }

      var finger_list = ["親", "人", "中", "薬", "小"];
      var nj_list = ["０","１","２","３"];

      let hand_camera_enabled, hand_camera_active;
      let hand_camera_side;

      const target_filter = {};

      let v1, v2, v3;
      let q1;
      window.addEventListener('SA_Dungeon_onstart', ()=>{
v1 = new THREE.Vector3();
v2 = new THREE.Vector3();
v3 = new THREE.Vector3();
q1 = new THREE.Quaternion();

for (const d of ['左', '右']) target_filter[d] = new System._browser.data_filter([{ type:'one_euro', id:'target_filter', para:[30, 0.5,0.5,1, 3] }]);

window.addEventListener('MMDCameraReset', (e)=>{
  if (System._browser.camera.poseNet.frames._reset_disabled)
    e.detail.result.return_value = true;
});

//System._browser.on_animation_update.add(()=>{
window.addEventListener('SA_MMD_before_render', ()=>{
  hand_camera();
});
//}, 0,1,-1);
      });

      const _hand_camera = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/hand_camera_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.hand_camera.info_short'); }
// ,is_base_inventory: true

 ,get index_default() { return (is_mobile) ? undefined : 6; }
// ,get index_default() { return (is_mobile) ? undefined : (browser_native_mode) ? 4 : 6;}//MMD_SA_options.Dungeon.inventory.max_base+4; }

 ,stock_max: 1
 ,stock_default: 1

 ,get selfie_mode() { return selfie_mode; }
 ,set selfie_mode(v) { selfie_mode = v; }

 ,get _hand_camera_enabled() { return hand_camera_enabled; }
 ,get _hand_camera_active() { return hand_camera_enabled && hand_camera_active; }
 ,get _hand_camera_side() { return hand_camera_enabled && hand_camera_side; }

 ,action: {
    func: function (item) {
const c = System._browser.camera;
if (!c.poseNet.pose_enabled && !c.VMC_receiver.pose_enabled) {
  DEBUG_show('(For mocap mode only)', 3);
  return true;
}

if (!hand_camera_enabled) {
  hand_camera_enabled = true;
  hand_camera_side = '右';

  System._browser.camera.poseNet._arm_IK_adjust = {};

  MMD_SA_options.look_at_screen = false;

  c.DEBUG_show('Hand camera:ON (left hand)', 5);
}
else {
  if (hand_camera_side == '右') {
    hand_camera_side = '左';

    System._browser.camera.poseNet._arm_IK_adjust = {};

    c.DEBUG_show('Hand camera:ON (right hand)', 5);
  }
  else {
    disable_hand_camera();
  }
}
    }
   ,anytime: true
  }

 ,get info() {
/*
return [
'- Press ' + (System._browser.hotkeys.config_by_id['hand_camera']?.accelerator[0]||'') + ' / double-click to use your hand as camera during mocap (status: ' + ((hand_camera_enabled) ? ((hand_camera_side == '右') ? 'left hand' : 'right hand') : 'OFF') + ').',
'- Repeat to switch among left hand, right hand, and OFF.',
'- Press ' + (System._browser.hotkeys.config_by_id['selfie_mode']?.accelerator[0]||'') + ' to toggle "Selfie mode" which automatically focuses on your face (status: ' + ((_hand_camera.selfie_mode) ? 'ON' : 'OFF') + ').',
'- Press ' + (System._browser.hotkeys.config_by_id['auto_look_at_camera']?.accelerator[0]||'') + ' to toggle auto "look at camera" (status: ' + ((System._browser.camera.facemesh.auto_look_at_camera) ? 'ON' : 'OFF') + ').',
  ].join('\n');
*/
return System._browser.translation.get('XR_Animator.UI.hand_camera.info').replace(/\<hand_camera_hotkey\>/, System._browser.hotkeys.config_by_id['hand_camera']?.accelerator[0]||'').replace(/\<hand_camera_status\>/, (hand_camera_enabled) ? ((hand_camera_side == '右') ? System._browser.translation.get('XR_Animator.UI.hand_camera.info.left_hand') : System._browser.translation.get('XR_Animator.UI.hand_camera.info.right_hand')) : 'OFF').replace(/\<selfie_mode_hotkey\>/, System._browser.hotkeys.config_by_id['selfie_mode']?.accelerator[0]||'').replace(/\<selfie_mode_status\>/, (_hand_camera.selfie_mode) ? 'ON' : 'OFF').replace(/\<auto_look_at_camera_hotkey\>/, System._browser.hotkeys.config_by_id['auto_look_at_camera']?.accelerator[0]||'').replace(/\<auto_look_at_camera_status\>/, (System._browser.camera.facemesh.auto_look_at_camera) ? 'ON' : 'OFF');
  }
      };

      return _hand_camera;
    })()


  });
})();
