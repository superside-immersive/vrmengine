// item-base-part1.js — Item base entries: reticle, streamer_mode, pose
// Extracted from animate.js
(function () {
  if (!MMD_SA_options.Dungeon_options) return;
  Object.assign(MMD_SA_options.Dungeon_options.item_base, {
    "reticle" : {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/yellow-target_64x64.png'
 ,info_short: "AR reticle"

 ,is_base_inventory: is_mobile
// NOTE: use undefined for index_default ((null >= 0) is true...)
 ,index_default: undefined
// ,get index_default() { return (is_mobile) ? undefined : MMD_SA_options.Dungeon.inventory.max_base+1; }

 ,stock_default: (is_mobile) ? 1 : 0
 ,stock_max: 1
 ,action: {
    func: function (item) {
if (!MMD_SA.WebXR.session) {
//  DEBUG_show("(AR mode only)", 3); return true;
  MMD_SA_options.Dungeon.run_event("_ENTER_AR_",0)
}
else {
//SA_AR_dblclick
  const result = { return_value:null };
  window.dispatchEvent(new CustomEvent("SA_AR_dblclick", { detail:{ e:{}, is_item:true, result:result } }));
}
    }
  }
    }

   ,"streamer_mode": (()=>{
      const streamer_mode = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/streamer_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.streamer_mode.info_short'); }
// ,is_base_inventory: true

 ,index_default: (is_mobile) ? undefined : 0

 ,stock_max: 1
 ,stock_default: 1

 ,action: {
    func: function () { System._browser.camera.streamer_mode.start(); }
//    ,muted: true
//   ,anytime: true
  }

 ,get info() { return System._browser.translation.get('XR_Animator.UI.streamer_mode.info'); }
      };

      return streamer_mode;
    })()

   ,"pose": (function () {
      function morph_event(e) {
var mf = morph_form[morph_form_index]
if (mf) {
  let model = e.detail.model
  for (const morph_name in mf) {
    let _m_idx = model.pmx.morphs_index_by_name[morph_name]
    let _m = model.pmx.morphs[_m_idx]
    MMD_SA._custom_morph.push({ key:{ weight:mf[morph_name], morph_type:_m.type, morph_index:_m_idx }, idx:model.morph.target_index_by_name[morph_name] })
  }
}
//DEBUG_show(Date.now()+":"+MMD_SA._custom_morph.length)
      }

      let motion_loading = false;
      async function load_motion(index) {
// save some headaches and not using motion_loading to avoid using nested error handling if file loading fails
//motion_loading = true;
if (!MMD_SA.motion[index]) {
  const m = MMD_SA_options.motion[index];
  await MMD_SA.load_external_motion(m.path, false);
}
//motion_loading = false;
      }

      function load_motion_on_finish(index) {
MMD_SA_options._motion_shuffle_list_default = [index];
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
MMD_SA._force_motion_shuffle = true;
window.addEventListener('SA_MMD_model0_onmotionchange', ()=>{ MMD_SA.WebXR.ground_plane.visible=System._browser.camera.poseNet.ground_plane_visible }, {once:true});

System._browser.on_animation_update.add(()=>{
  if (MMD_SA_options._XRA_pose_list?.[0].find(p=>p.is_custom_motion && p.name==MMD_SA.MMD.motionManager.filename) != null) {
//DEBUG_show(MMD_SA.MMD.motionManager._timeMax)
    MMD_SA.motion_player_control.enabled = true;
  }
// needed for "auto_zoom" camera mod
  MMD_SA.reset_camera();

  if (MMD_SA.Wallpaper3D?.visible) {
    MMD_SA.Wallpaper3D.update_transform();
    MMD_SA.Wallpaper3D.update_mesh();
  }
}, 0,1);

MMD_SA_options.Dungeon_options.item_base.social_distancing && MMD_SA_options.Dungeon_options.item_base.social_distancing.reset();

if (System._browser.camera.initialized) System._browser.on_animation_update.add(()=>{ System._browser.camera._update_camera_reset(); }, 1,1);

if (MMD_SA_options.Dungeon._event_active.id == '_POSE_') MMD_SA_options.Dungeon.run_event(null,null,0);
      }

      async function change_motion(motion_index_absolute, ignore_event) {
const model_mesh = THREE.MMD.getModels()[0].mesh;
if (!model_mesh.visible) return true;

if (ignore_event) {
  if (motion_index_absolute == -1) {
    change_custom_motion();
    return;
  }
}
else if ((motion_index_absolute == null) && !MMD_SA_options.Dungeon.event_mode) {
  MMD_SA_options.Dungeon.run_event("_POSE_",0)
  return
}
else if ((motion_index_absolute != null) && (MMD_SA_options.Dungeon._event_active.id != "_POSE_"))
  return true

//DEBUG_show(MMD_SA.MMD.motionManager.filename)

if (!motion_loading) {//MMD_SA_options.motion_shuffle_list_default && (MMD_SA_options.motion_shuffle_list_default.indexOf(MMD_SA.MMD.motionManager._index) != -1)) {
  if (!morph_event_registered) {
    morph_event_registered = true
    window.addEventListener("SA_MMD_model0_process_morphs", morph_event)
  }

  let motion_list_index = (System._browser.camera.poseNet.enabled || System._browser.camera.VMC_receiver.mocap_enabled || System._browser.camera.VMC_receiver.bone_enabled) ? 2 : 1;

  let motion_list = _motion_list[motion_list_index]
  if (motion_list_index != _motion_list_index) {
    motion_index = ((motion_list_index == 1) && (_motion_list_index == -1)) ? 0 : -1
  }
  _motion_list_index = motion_list_index

  if (motion_index_absolute != null)
    motion_index = motion_index_absolute
  else
    motion_index++

  if (motion_index >= motion_list.length) {
    motion_index = 0
    if (++morph_form_index == morph_form.length) morph_form_index = 0;
  }

  let motion_name = motion_list[motion_index].name
  motion_list[motion_index].action && motion_list[motion_index].action(motion_name)

  const motion_para = MMD_SA_options.motion_para[motion_name];
  if (motion_para?._speed && !MMD_SA_options.Dungeon_options.character_movement_disabled) {
    const mov = MMD_SA_options.Dungeon.motion['PC movement forward'];
    mov.index = motion_para._index;
    mov.name = motion_name;
    mov.path = motion_para._path;

    const id_to_include = ['keyCode','motion_id','mov_speed'];
    mov.para = Object.assign({}, mov.para);
    Object.keys(mov.para).filter(p=>id_to_include.indexOf(p)==-1).forEach(p=>{
      if (motion_para[p] == null)
        delete mov.para[p];
    });
    Object.assign(mov.para, motion_para);

    MMD_SA_options.Dungeon.motion_filename_by_id['PC movement forward'] = motion_name;
    MMD_SA_options.Dungeon.motion_id_by_filename[motion_name] = 'PC movement forward';

    return;
  }

  const index = MMD_SA_options.motion_index_by_name[motion_name];
  await load_motion(index);
  load_motion_on_finish(index);
}
else {
  System._browser.camera.DEBUG_show('(motion still loading)', 3);
  return true
}
      }

      function change_custom_motion() {
const animation = MMD_SA.THREEX.get_model(0).animation;
const MMD_animation_customized = MMD_SA_options.motion.length > MMD_SA.motion_max_default;
const MMD_animation_on = THREE.MMD.getModels()[0].skin._motion_index >= MMD_SA.motion_max_default;

let animation_on;

if (animation.has_clip && (!MMD_animation_customized || animation.enabled || MMD_animation_on)) {
  animation.enabled = !animation.enabled;
  animation_on = animation.enabled;
  if (animation_on) {
    if (MMD_animation_on) {
      animation._motion_index = MMD_SA_options._motion_shuffle_list_default[0];
      MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
      MMD_SA._force_motion_shuffle = true;
    }
  }
  else {
    MMD_SA.THREEX.get_model(0).animation._motion_index = null;
  }
}
else if (MMD_animation_customized) {
  animation_on = !MMD_animation_on;
  if (!animation_on) {
    MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
    MMD_SA._force_motion_shuffle = true;
  }
  else {
    const index = MMD_SA_options.motion.length-1;
    load_motion(index).then(()=>{
      load_motion_on_finish(index);
    });
  }
}

return animation_on;
      }

      var morph_event_registered = false

      var morph_form = [null]
      var morph_form_index = 0

      var _motion_list_index = -1
      var _motion_list = []

      var motion_index

      window.addEventListener("jThree_ready", function () {
function delay_dialogue() {
  MMD_SA_options.Dungeon.run_event();
}

function export_motion_config() {
  const motion_para = MMD_SA.MMD.motionManager.para_SA;
  const motion_id = motion_para._path.replace(/^.+[\/\\]/, '').replace(/\.\w{3,4}$/, '');
  const config = {
    System_Animator_motion_para: {}
  };
  config.System_Animator_motion_para[motion_id] = { motion_tracking: motion_para.motion_tracking || {} };

  let json;
  try {
    json = JSON.stringify(config, null, '\t');
  }
  catch (err) {
    DEBUG_show('ERROR: The config of the current motion is not exportable.', 3);
    return;
  }

  System._browser.save_file('motion_para.json', json, 'application/json');
}

function sort_by_index(a,b) {
  return a.index-b.index;
}

const index_first = 2;
function swap_motion(index, index_to_swap=0, is_swap) {
//DEBUG_show(index+'/'+index_to_swap+'/'+!!is_swap,0,1)
  let motion_id;
  if (index == null) {
    motion_id = MMD_SA.MMD.motionManager.filename;//MMD_SA.MMD.motionManager.para_SA._path.replace(/^.+[\/\\]/, '').replace(/\.\w{3,4}$/, '');
    index = _motion_list[0].findIndex(m=>m.name==motion_id);
  }
  else {
    motion_id = _motion_list[0][index].name;
  }
//DEBUG_show(motion_id+'/'+index)
  if (index <= index_first) return;

  if (is_swap && (index_to_swap <= index_first))
    is_swap = false;

  if (is_swap) {
    const _index = _motion_list[0][index].index;
    _motion_list[0][index].index = _motion_list[0][index_to_swap].index;
    _motion_list[0][index_to_swap].index = _index;
  }
  else {
    _motion_list[0][index].index = Math.max(index_to_swap, index_first) + 0.5;
  }
  _motion_list[0].sort(sort_by_index);
  _motion_list[0].forEach((m,i)=>{ m.index=i; });

  for (let i = 1; i < _motion_list.length; i++)
    _motion_list[i].sort(sort_by_index);

  const list_index = (System._browser.camera.poseNet.enabled) ? 2 : 1;
  const index_new = _motion_list[list_index].findIndex(m=>m.name==motion_id);
  _motion_page = parseInt(index_new/9);
}

let motion_list_length_default;
function reset_list_order(order) {
  if (order) {
    _motion_list[0].sort((a,b)=>a.index_default-b.index_default);
    order.forEach((index,i)=>{
      if (index >= 1000) index = motion_list_length_default + (index - 1000);
      if (_motion_list[0][index])
        _motion_list[0][index].index = i;
    });
  }
  else {
    _motion_list[0].forEach(m=>{ m.index=m.index_default; });
  }

  for (let i = 0; i < _motion_list.length; i++)
    _motion_list[i].sort(sort_by_index);

  _motion_page = 0;
}

function clear_custom_motion() {
  let motion_list_index = (System._browser.camera.poseNet.enabled) ? 2 : 1;
  const reset_motion = _motion_list[motion_list_index].find(m=>m.is_custom_motion && m.name==MMD_SA.MMD.motionManager.filename);

  for (let i = 0; i < _motion_list.length; i++)
    _motion_list[i] = _motion_list[i].filter(m=>!m.is_custom_motion);

  if (reset_motion)
    change_motion(0, true);
}

function mirror_pose() {

function swap_LR(p, LR=['left','right']) {
  if ((p != null) && ((p[LR[0]] != null) || (p[LR[1]] != null))) {
    const _left = p[LR[0]];
    p[LR[0]] = p[LR[1]];
    p[LR[1]] = _left;
  }
}

const model_para = MMD_SA.MMD.motionManager.para_SA;
if (model_para.mirror_disabled) return;

const model = THREE.MMD.getModels()[0];
const mirror_scale = MMD_SA._v3a.set(1,-1,-1);
model.skin.targets.forEach(t=>{
  let b_name, b_idx;
  const k0 = t.keys[0];
  const is_LR = k0.name.charAt(0)=='左' || k0.name.charAt(0)=='右';
  if (is_LR) {
    b_name = ((k0.name.charAt(0)=='左')?'右':'左') + k0.name.substring(1);
    t.i = model.pmx.bones.findIndex(b=>b.name==b_name);
  }

  const k_length = t.keys.length;
  t.keys.forEach((k,i)=>{
    if (is_LR)
      k.name = b_name;
// skip cloned key
    if ((k_length > 1) && (i == k_length-1) && (t.keys[i-1].pos == k.pos)) return;

    k.pos[0] *= -1;

    MMD_SA.TEMP_v3.setEulerFromQuaternion(MMD_SA.TEMP_q.fromArray(k.rot), 'YXZ').multiply(mirror_scale);
    const rot = MMD_SA.TEMP_q.setFromEuler(MMD_SA.TEMP_v3, 'YXZ');
    k.rot[0] = rot.x;
    k.rot[1] = rot.y;
    k.rot[2] = rot.z;
    k.rot[3] = rot.w;
  });
});

if (model_para.center_view) {
  model_para.center_view[0] *= -1;
  MMD_SA.reset_camera();
}

const motion_tracking = [model_para.motion_tracking];

motion_tracking.forEach(mt=>{
  if (!mt) return;

  const hip_adjustment = mt.hip_adjustment;
  if (hip_adjustment) {
    swap_LR(hip_adjustment);
  }

  const arm_default_stickiness = mt.arm_default_stickiness;
  if (arm_default_stickiness) {
    if (arm_default_stickiness.left || arm_default_stickiness.right) {
      swap_LR(arm_default_stickiness);
    }
    for (const p of [arm_default_stickiness, arm_default_stickiness.left, arm_default_stickiness.right]) {
      const weight_x = p?.parent?.weight?.x;
      if (weight_x != null) {
        swap_LR(weight_x);
      }
    }
  }

  const arm_tracking = mt.arm_tracking;
  if (arm_tracking) {
    if (arm_tracking.elbow_lock) {
      swap_LR(arm_tracking.elbow_lock);
    }
  }

  const arm_as_leg = mt.arm_as_leg;
  if (arm_as_leg) {
    if (arm_as_leg.linked_side)
      arm_as_leg.linked_side = (arm_as_leg.linked_side == 'left') ? 'right' : 'left';
    const position = arm_as_leg.transformation?.position;
    if (position) {
      for (const a of ['x','y','z']) {
        if ((a == 'x') && position.x) {
          for (const m of ['min','max']) {
            const v = position.x[m];
            if (typeof v == 'number')
              position.x[m] = { left:v, right:v };
          }
          const L = { min:position.x?.max?.right, max:position.x?.min?.right };
          const R = { min:position.x?.max?.left,  max:position.x?.min?.left  };
          for (const m of ['min','max']) {
            if ((L[m] != null) && (R[m] != null)) {
              position.x[m] = { left:-L[m], right:-R[m] };
            }
            else if ((L[m] != null) || (R[m] != null)) {
              const v = (L[m] != null) ? L[m] : R[m];
              position.x[m] = { left:-v, right:-v };
            }
            else {
              delete position.x[m];
            }
          }
        }
        for (const p of ['add','scale']) {
          const para = position[a]?.[p];
          if (para != null) {
            swap_LR(para);
            if (a == 'x') {
              if (p == 'add') {
                if (typeof para == 'number') {
                  position.x.add *= -1;
                }
                else {
                  if (para.left != null)
                    para.left *= -1;
                  if (para.right != null)
                    para.right *= -1;
                }
              }
             }
          }
        }
      }

      const rotation = position.rotation;
      if (rotation && (rotation.y != null))
        rotation.y *= -1;

      const position_to_rotation = position.position_to_rotation;
      if (position_to_rotation) {
        for (const p of ['upper','lower']) {
          for (const a of ['x','y','z']) {
            swap_LR(position_to_rotation[p]?.[a]?.curve);
          }
        }
      }
    }
  }
});

}

window.addEventListener('SA_on_external_motion_loaded', (e)=>{
  const path = e.detail.path;
  if (/\.zip\#/i.test(path) || /_(camera|morph)\.vmd$/i.test(path)) return;

  if (_motion_list[0].some(m=>m.path==path)) return;

  const motion_id = path.replace(/^.+[\/\\]/, '').replace(/\.\w{3,4}$/, '');
  const para = MMD_SA_options.motion_para[motion_id];

  let info = motion_id.substring(0,20);
  info = info.substring(0, 10+Math.round(info.replace(/[^\u0000-\u00ff]/s, '').length/2));
  const m = { is_custom_motion:true, path:path, name:motion_id, info:'👤'+info+' (🙋)' };

  const i = e.detail.index || _motion_list[0].length;
  m.index_default = i;
  m.index = i;
  if (para && !para.motion_blending) {
    para.motion_blending = {
      fadein: {}
    };
  }

  _motion_list[0].push(m);
  _motion_list[1].push(m);
  _motion_list[2].push(m);
//  DEBUG_show(path);
});

var mf = MMD_SA_options.model_para_obj.morph_form
if (mf) {
  morph_form = morph_form.concat(Object.values(mf))
}

_motion_list[0] = [
  {name:"standmix2_modified", info:"Stand relaxed"},

  {
    name:"stand_simple", get info() { return 'Stand simple (💃➔' + System._browser.translation.get('XR_Animator.UI.pose.full_body_mocap') + ')'; },
    action: (name)=>{ MMD_SA_options.motion_para[name].center_view_enforced = false },
    is_full_body: true,
  },

  {
    name:"stand_simple", get info() { return 'Stand simple (🙋➔' + System._browser.translation.get('XR_Animator.UI.pose.upper_body_mocap') + ')'; },
    action: (name)=>{ MMD_SA_options.motion_para[name].center_view_enforced = true },
  },

// roomba
//{name:"gura_sit_01"},

  {name:"tsuna_standby", info:"Standby (🙋)"},

  {name:"Mixamo - Happy Idle", info:"Happy idle (🙋)"},

  {name:"i-shaped_balance_TDA_f0-50", info:"I-shaped balance (🙋)"},

//  {name:"leg_hold", info:"???", _MMD_only_:true},

  {name:"Mixamo - Sitting02", info:"Sit 01 (🙋/🦶)"},

  {name:"chair_sit01_armIK", info:"Sit 02 (🦶/🙋)"},

  {name:"Mixamo - Sitting Idle01", info:"Sit 03 (🙋/🦶)"},

  {name:"sitting_sexy01", info:"Sit 04 (🙋/🦶)"},

  {name:"Mixamo - Female Sitting Pose01", info:"Sit 05 (🙋/🦶)"},

  {name:"Mixamo - Female Sitting Pose02", info:"Sit 06 (🙋/🦶)"},

  {name:"sitting_sexy03", info:"Sit 07 (🙋/🦶)"},

  {name:"sitting_sexy04", info:"Sit 08 (🙋/🦶)"},

  {name:"Mixamo - Sitting Idle02", info:"Sit 09 (🙋/🦶)"},

//  {name:"gal_model_motion_with_legs-2_loop_v01", info:"Sit - Floating (🙋)"},

  {name:"sitting_sexy05", info:"Sit 10 (🙋/🦶)"},

  {name:"sitting_sexy06", info:"Sit 11 (🙋/🦶)"},

  {name:"sitting_sexy02", info:"Legs on table (🙋/🦶)"},

  {name:"prone_pose01", info:"Prone 01 (🙋/🦶)"},

  {name:"sitting_sexy07", info:"Sit 12 (🙋/🦶)"},

  {name:"sitting_sexy08", info:"Sit 13 (🙋/🦶)"},

  {name:"Mixamo - Female Laying Pose01", info:"Laying pose (🙋/🦶)"},

  {name:"モブ歩き男80f", info:"Walk (🙋/👟)"},

  {name:"walk_A34_f0-42", info:"Hip Walk (🙋/👟)"},

  {name:"run_H01_f0-24", info:"Run (🙋/👟)"},

  {name:"sitting_sexy09", info:"Sit 14 (🙋/🦶)"},

  {name:"sitting_sexy10", info:"Sit 15 (🙋/🦶)"},

  {name:"sit_simple", info:"Sit simple (🙋)"},

  {name:"model_pose01", info:"Model pose 01 (🙋)"},

  {name:"model_pose02", info:"Model pose 02 (🙋)"},

  {name:"model_pose03", info:"Model pose 03 (🙋/🦶)"},

  {name:"sitting_sexy11", info:"Sit 16 (🙋/🦶)"},

  {name:"sitting_sexy12", info:"Sit 17 (🙋)"},

].filter(m=>m!=null);

motion_list_length_default = _motion_list[0].length;

_motion_list[0].forEach(m=>{
  MMD_SA_options.motion_para[m.name].adjustment_by_scale = { 'センター':{ reference_value:11.36464 } };
});

_motion_list[1] = _motion_list[0].filter((m)=>!m._MMD_only_ || (!MMD_SA.THREEX.enabled/* && MMD_SA_options.WebXR.AR._adult_mode*/));

_motion_list[2] = _motion_list[0].filter((m)=>MMD_SA_options.motion_para[m.name].motion_tracking_enabled);

_motion_list[0].forEach((m,i)=>{
  const para = MMD_SA_options.motion_para[m.name];
  m.index_default = i;
  m.index = i;
  if (para && !para.motion_blending) {
    para.motion_blending = {
      fadein: {}
    };
  }
});

MMD_SA_options._XRA_pose_list = _motion_list;
MMD_SA_options._XRA_pose_reset = reset_list_order;
MMD_SA_options._XRA_clear_custom_motion = clear_custom_motion;
MMD_SA_options._XRA_mirror_pose = mirror_pose;

let _motion_page = 0;

let _has_custom_animation_;

function get_target_index(sb, key) {
  if (key != null) {
    const msg_branch_list = MMD_SA_options.Dungeon.dialogue_branch_mode.filter(b=>!b.sb_index);
    const branch = msg_branch_list?.findIndex(b=>((b.sb_index||0)==(sb.index||0)) && (b.key==key));
    return branch;
  }
}

const _on_drag = {
  outside_menu: {
    func: function (sb_drag, outside_menu) {
const list_index = (System._browser.camera.poseNet.enabled) ? 2 : 1;
const offset = list_index-1;

const index = get_target_index(sb_drag, sb_drag._drag_key_)+offset + _motion_page*9;

let index_to_swap;
//DEBUG_show(outside_menu)
if (outside_menu == 'bottom') {
  index_to_swap = 9999;
}
else if (outside_menu == 'left') {
  index_to_swap = index - 9-1;
}
else if (outside_menu == 'right') {
  index_to_swap = index + 9;
}
else {
  index_to_swap = 0;
}
//DEBUG_show(index+'/'+index_to_swap)
swap_motion(index, index_to_swap);

MMD_SA_options.Dungeon.run_event('_POSE_',0,0);
    }
  }
};

const _on_drop = {
  func: function (sb_drag, sb) {
const list_index = (System._browser.camera.poseNet.enabled) ? 2 : 1;
const offset = list_index-1;

let index = get_target_index(sb_drag, sb_drag._drag_key_)+offset + _motion_page*9;
let index_to_swap = get_target_index(sb, sb._branch_key_)+offset + _motion_page*9;
//DEBUG_show(index+'/'+index_to_swap+'/'+_motion_page,0,1)
if (index > index_to_swap) index_to_swap--;
swap_motion(index, index_to_swap, false);

MMD_SA_options.Dungeon.run_event('_POSE_',0,0);
  }
};

const hip_adjustment_set = ['_default_', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const hip_adjustment_set_emoji = ['', 'Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ', 'Ⓔ', 'Ⓕ', 'Ⓖ', 'Ⓗ'];

MMD_SA_options.Dungeon_options.events_default["_POSE_"] = [
//0
      [

        {
          func: ()=>{
if (THREE.MMD.motionPlaying) {
  window.addEventListener('SA_MMD_model0_process_bones_after_IK', delay_dialogue, {once:true});
}
else {
  MMD_SA_options.Dungeon.run_event();
}
          }
        },

        {
          message: {
  get content() {
const index = (System._browser.camera.poseNet.enabled || System._browser.camera.VMC_receiver.mocap_enabled || System._browser.camera.VMC_receiver.bone_enabled) ? 2 : 1;
_has_custom_animation_ = (MMD_SA.THREEX.enabled && MMD_SA.THREEX.get_model(0).animation.has_clip) || (MMD_SA_options.motion.length > MMD_SA.motion_max_default);

if (_motion_page * 9 >= _motion_list[index].length)
  _motion_page = 0;
let ini = _motion_page * 9;

const content =  _motion_list[index].slice(ini, ini+9).map((m,i)=>{
  const motion_para = MMD_SA_options.motion_para[m.name];
  let info_prefix = '';
  let info_suffix = '';
  if (motion_para == MMD_SA.MMD.motionManager.para_SA) {
    if ((m.name != 'stand_simple') || (!motion_para.motion_tracking_upper_body_only == !!m.is_full_body))
      info_prefix = '✔️';
  }
  if (motion_para?._speed && (MMD_SA_options.Dungeon.motion['PC movement forward'].name == m.name)) {
    info_suffix = '🏃';
  }

  const s = (m.is_full_body) ? null : System._browser.camera.poseNet.hip_adjustment_set_by_motion_name[m.name];
  let _index = hip_adjustment_set.findIndex(_s=>_s==s);
  if (_index == -1)
    _index = 0;
  info_suffix += hip_adjustment_set_emoji[_index];

  return (i+1)+'. ' + info_prefix + (m.info||m.name) + info_suffix;
}).join('\n')
+ ((_has_custom_animation_) ? '\n0. (👤' + System._browser.translation.get('XR_Animator.UI.pose.custom_pose') + ')' : '') + ('\nN. ⏭️' + System._browser.translation.get('XR_Animator.UI.pose.next_poses'));
//+ ((_has_custom_animation_) ? ('\n0. (👤Custom motion: ' + (((this._animation_on_ != null) ? this._animation_on_ : (MMD_SA.THREEX.enabled && MMD_SA.THREEX.get_model(0).animation.enabled) || (THREE.MMD.getModels()[0].skin._motion_index >= MMD_SA.motion_max_default))?'ON':'OFF') + ') (🙋)') : '');

//DEBUG_show(''+this._animation_on_,0,1)
//MMD_SA_options.SpeechBubble_branch.confirm_keydown=false

System._browser.on_animation_update.add(()=>{this._animation_on_ = null},0,0);

return content;
  },

  bubble_index: 3,
  para: { row_max:11, font_size:15, no_word_break:true },

  get branch_list() {
const index = (System._browser.camera.poseNet.enabled || System._browser.camera.VMC_receiver.mocap_enabled || System._browser.camera.VMC_receiver.bone_enabled) ? 2 : 1;

let ini = _motion_page * 9;

return _motion_list[index].slice(ini, ini+9).map((m,i) => { return { key:i+1, on_drag:(_motion_page || (i > 3-index))?_on_drag:null, on_drop:_on_drop, event_id:{ func:()=>{ change_motion(ini+i); System._browser.on_animation_update.add(()=>{MMD_SA_options.Dungeon.run_event('_POSE_',0,0)},20,0); }, } }; })
  .concat((_has_custom_animation_)?[{ key:0, event_id:{ func:()=>{ this._animation_on_=change_custom_motion(); System._browser.on_animation_update.add(()=>{MMD_SA_options.Dungeon.run_event('_POSE_',0,0)},20,0); }, } }]:[]);
  },
          },

          next_step: {},
        },

        {
message: {
  index: 1,
  bubble_index: 3,
  para: { row_max:12, font_scale:0.95 },
  get content() {
    const motion_id = MMD_SA.MMD.motionManager.filename;
    let m_obj = MMD_SA_options._XRA_pose_list[0].find(p=>p.name==motion_id);

    if ((motion_id == 'stand_simple') && MMD_SA.MMD.motionManager.para_SA.motion_tracking_upper_body_only)
      m_obj = MMD_SA_options._XRA_pose_list[0].find(p=>p.name==motion_id && !p.is_full_body);

    const info = m_obj?.info || 'N/A';

    return [
System._browser.translation.get('XR_Animator.UI.pose.pose') + (_motion_page*9+1) + '-' + (_motion_page*9+9) + ' (' + System._browser.translation.get('XR_Animator.UI.pose.page') + (_motion_page+1) + ')',
((_motion_page <= 1) ? '・' + System._browser.translation.get('XR_Animator.UI.pose.hotkey') + ': ' + ((_motion_page == 0) ? 'Alt' : 'Ctrl') + '+Numpad' + ((_has_custom_animation_) ? 0 : 1) + '-9' : '・' + System._browser.translation.get('XR_Animator.UI.pose.hotkey') + ': N/A'),
'・' + info,
'A. ┣ ' + System._browser.translation.get('XR_Animator.UI.pose.hip_adjustment_set') + ': ' + ((m_obj) ? ((!m_obj.is_full_body && System._browser.camera.poseNet.hip_adjustment_set_by_motion_name[motion_id]) || System._browser.translation.get('Misc.default')) : 'N/A') + '⬅️➡️',
System._browser.translation.get('XR_Animator.UI.pose.extra_current_pose'),
'E. ' + System._browser.translation.get('XR_Animator.UI.pose.shoulder_adjust') + ': ' + System._browser.translation.get('XR_Animator.UI.pose.shoulder_adjust.' + (MMD_SA.THREEX.shoulder_adjust||'Default')),
System._browser.translation.get('XR_Animator.UI.pose.extra'),
'X. ' + System._browser.translation.get('Misc.done'),
    ].join('\n');
  },
  branch_list: [
    { key:'any', func:(e)=>{
let step;

if (/Arrow(Left|Right)/.test(e.code)) {
  step = (e.code == 'ArrowLeft') ? -1 : 1;

  const motion_id = MMD_SA.MMD.motionManager.filename;
  const m_obj = MMD_SA_options._XRA_pose_list[0].find(p=>p.name==motion_id);
  if (!m_obj) return false;

  const is_full_body = (motion_id == 'stand_simple') && !MMD_SA.MMD.motionManager.para_SA.motion_tracking_upper_body_only;
  if (is_full_body) return true;

  const s = System._browser.camera.poseNet.hip_adjustment_set_by_motion_name[motion_id];
  let index = hip_adjustment_set.findIndex(_s=>_s==s);
  if (index == -1)
    index = 0;

  index += step;
  if (index < 0) {
    index = hip_adjustment_set.length-1;
  }
  else if (index >= hip_adjustment_set.length) {
    index = 0;
  }

  if (index == 0) {
    delete System._browser.camera.poseNet.hip_adjustment_set_by_motion_name[motion_id];
  }
  else {
    System._browser.camera.poseNet.hip_adjustment_set_by_motion_name[motion_id] = hip_adjustment_set[index];
  }
}
else {
  return false;
}

MMD_SA_options.Dungeon.run_event(null, 0, 0);

return true;
    } },

    { key:'A', event_index:0,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.hip_adjustment_set.tooltip')
);
      }
    },
    { key:'B', event_id:{ func:()=>{ mirror_pose(); }, goto_event:{id:'_POSE_',branch_index:0} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.mirror_current_pose.tooltip')
);
      }
    },
    { key:'C', event_id:{ func:()=>{ swap_motion(); }, goto_event:{id:'_POSE_',branch_index:0} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.push_current_pose_to_list_top.tooltip')
);
      }
    },
    { key:'D', event_id:{ func:()=>{ export_motion_config() }, goto_event:{id:'_POSE_',branch_index:0} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.export_current_pose_config.tooltip') 
);
      }
    },
    { key:'E', event_id:{ func:()=>{
const para = ['Full', '', 'Upper half', 'None'];
let index = (para.indexOf(MMD_SA.THREEX.shoulder_adjust||'')) + 1;
if (index >= para.length)
  index = 0;
MMD_SA.THREEX.shoulder_adjust = para[index];
System._browser.camera.DEBUG_show('NOTE: Restart the app for changes to apply to existing motions and poses.', 5);
      }, goto_event:{id:'_POSE_',branch_index:0} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.shoulder_adjust.tooltip')
);
      }
    },
    { key:'F', event_id:{ func:()=>{ reset_list_order(); DEBUG_show('(pose list reset)',3); }, goto_event:{id:'_POSE_',branch_index:0} },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.reset_pose_list_order.tooltip')
);
      }
    },
    { key:'G', event_id:{
        message: {
          index: 1,
          bubble_index: 3,
          content: System._browser.translation.get('XR_Animator.UI.pose.clear_all_custom_poses.confirm'),
          branch_list: [
            {key:'Y', event_id:{ func:()=>{ clear_custom_motion() }, goto_event:{id:'_POSE_',branch_index:0} } },
            {key:'N', branch_index:0 },
          ]
        },
      },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.pose.clear_all_custom_poses.tooltip')
);
      }
    },
    { key:'N', event_id:{ func:()=>{ _motion_page++ }, goto_event:{id:'_POSE_',branch_index:0} } },
    { key:'X', is_closing_event:true, event_id:{ next_step:{} } },
  ]
}
        },

        {
          func: ()=>{
          },
          ended: true,
        }
      ]
];

      });

      var pose = {
  icon_path: Settings.f_path + '/assets/assets.zip#/icon/tap-dance_64x64.png'
 ,get info_short() { return System._browser.translation.get('XR_Animator.UI.pose.info_short'); }
// ,is_base_inventory: true
 ,stock_max: 1
 ,stock_default: 1

 ,_change_motion_: change_motion
 ,action: {
    set _motion_list_index(v) { _motion_list_index = v; },
    func: function () { change_motion() }
//    ,muted: true
//   ,anytime: true
  }
 ,reset: function () {
if (morph_event_registered) {
  morph_event_registered = false
  window.removeEventListener("SA_MMD_model0_process_morphs", morph_event)
}

MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name["standmix2_modified"]]
  }

 ,get info() {
let info = '';

info = (System._browser.camera.ML_enabled) ? ((MMD_SA.MMD.motionManager.para_SA.motion_tracking_enabled) ? System._browser.translation.get('XR_Animator.UI.pose.info.ML_on.tracking_on').replace(/\<tracking_mode\>/, System._browser.translation.get('XR_Animator.UI.pose.info.ML_on.tracking_on.' + ((MMD_SA.MMD.motionManager.para_SA.motion_tracking_upper_body_only) ? 'upper_body' : 'full_body'))) : System._browser.translation.get('XR_Animator.UI.pose.info.ML_on.tracking_off')) : System._browser.translation.get('XR_Animator.UI.pose.info.ML_off');
info += '\n';

info += System._browser.translation.get('XR_Animator.UI.pose.info.extra').replace(/\<hotkey\>/, System._browser.hotkeys.config_by_id['arm_to_leg_control_mode']?.accelerator[0]||'');

return info;
  }
      };

      return pose;
    })()


  });
})();
