// facemesh-options-core.js
// All helper functions, closure variables, and event listeners for _FACEMESH_OPTIONS_
(function () {
function speech_bubble2(msg, duration, para={}) {
  MMD_SA.SpeechBubble.list[1].message(3, msg, duration*1000, Object.assign({scale:0.75}, para));
}

let wallpaper_src;
let wallpaper_dialog_enabled, wallpaper_generator_dialog_enabled;
async function onDrop_change_wallpaper(e) {
  let resolve_to_return, return_value;
  e.detail.promises_to_return.push(new Promise((resolve)=>{ resolve_to_return=resolve; }));

  const item = e.detail.item;
  const src = item.path

  if ((wallpaper_dialog_enabled || (MMD_SA_options.image_input_handler_as_wallpaper || /xra\-3d\-wallpaper_[^\/\\]+$/i.test(src))) && item.isFileSystem && (/([^\/\\]+)\.(png|jpg|jpeg|bmp|webp)$/i.test(src) || /xra\-3d\-wallpaper_[^\/\\]+\.mp4$/i.test(src) || (wallpaper_dialog_enabled && !MMD_SA.Wallpaper3D.enabled && /([^\/\\]+)\.(mp4|mkv|webm)$/i.test(src)))) {
    wallpaper_src = src;

    if (/xra\-3d\-wallpaper_[^\/\\]+$/i.test(src)) {
      LdesktopBG.style.backgroundImage = 'none';
//      document.body.style.backgroundColor = "#000000";
//      LdesktopBG_host.style.backgroundColor = "#000000";
      LdesktopBG_host.style.display = 'block';
    }
    else {
      System._browser.updateWallpaper(toFileProtocol(src), (MMD_SA.Wallpaper3D.enabled)?10:undefined);
      LdesktopBG_host.style.display = 'block';
    }

    await MMD_SA.Wallpaper3D.load(src);

    return_value = true;
  }

  resolve_to_return(return_value);
}

window.addEventListener('SA_Dungeon_onstart', ()=>{
  window.addEventListener('SA_dragdrop_start', onDrop_change_wallpaper);
});

async function onDrop_change_panorama(item) {
  var src = item.path
  if (item.isFileSystem && /([^\/\\]+)\.zip$/i.test(src)) {
    let zip_file = SA_topmost_window.DragDrop._path_to_obj && SA_topmost_window.DragDrop._path_to_obj[src.replace(/^(.+)[\/\\]/, "")];
    if (!zip_file) {
      const blob = await new Promise((resolve, reject) => {
const xhr = new XMLHttpRequestZIP;
xhr.onload = function () {
  resolve(this.response);
};
xhr.open( "GET", src, true );
xhr.responseType = "blob";
xhr.send();
      });

      const file = new File([blob], src);

// from SA_DragDropEMU()
      console.log("File input (emulated):", file);
      const dd = SA_topmost_window.DragDrop;
      if (!dd._path_to_obj) {
        dd._path_to_obj = {};
        dd._obj_url = {};
      }
      dd._path_to_obj[file.name.replace(/^(.+)[\/\\]/, "")] = file;

      zip_file = file;
    }

    const zip = await new self.JSZip().loadAsync(zip_file);

// will be called, even if content is corrupted

    XMLHttpRequestZIP.zip_by_url(src, zip);

    let panorama_list = zip.file(/\.(png|jpg|jpeg)$/i);
    if (!panorama_list.length) {
      DEBUG_show("(No panorama found)");
      return;
    }

    const panorama_filename = (panorama_list.filter(n=>!/_depth\.\w{3,4}$/i.test(n.name))[0] || panorama_list[0]).name;//.name;
    const panorama_path = src + "#/" + panorama_filename;
    const panorama_depth_filename = panorama_list.filter(n=>n.name.indexOf(panorama_filename.replace(/\.(\w{3,4})$/, '_depth')) == 0)[0]?.name;
    const panorama_depth_path = (panorama_depth_filename) ? src + "#/" + panorama_depth_filename : '';
    console.log(src, panorama_filename, panorama_depth_filename);

//    object3d_cache.set(model_path, null);

    const panorama_json = zip.file(/panorama\.json$/i);
    let json;
    if (panorama_json.length) {
      const json_text = await panorama_json[0].async("text");
      json = JSON.parse(json_text);
      console.log("(panorama.json updated)");
    }

    await System._browser.update_obj_url(panorama_path);
    if (panorama_depth_path)
      await System._browser.update_obj_url(panorama_depth_path);

    await change_panorama(0, panorama_path, { full_path:src, depth:panorama_depth_path, json:json });
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(png|jpg|jpeg|bmp)$/i.test(src)) {
    await change_panorama(0, src)
  }
  else {
    _onDrop_finish.call(DragDrop, item)
  }
}

function onDrop_JSON_change_facemesh_calibration(e) {
  const json = e.detail.json;  
  if (json.facemesh_calibration_type) {
    e.detail.result.return_value = true;
    speech_bubble2('✅Facemesh calibration', 3, { no_word_break:true });
    System._browser.camera.facemesh.import_calibration(json);
  }
  MMD_SA_options.Dungeon.run_event(null,done_branch,0);
}

var object3d_list = [];
var object3d_index = 0;
var object3d_cache = new Map();

async function onDrop_add_object3D(item) {
  function update_model_para(url) {
    if (!item._obj_json) return;

    const model_filename = toLocalPath(url).replace(/^.+[\/\\]/, "");
    const model_filename_cleaned = model_filename.replace(/[\-\_]copy\d+\.(x|gltf|glb|bpm|jpg|jpeg|png|webp)$/, ".$1").replace(/[\-\_]v\d+\.(x|gltf|glb|bpm|jpg|jpeg|png|webp)$/, ".$1");
    const model_para = MMD_SA_options.model_para[model_filename] || MMD_SA_options.model_para[model_filename_cleaned] || {};

    MMD_SA_options.model_para[model_filename] = MMD_SA_options.model_para[model_filename_cleaned] = Object.assign(model_para, item._obj_json.model_para);
  }

  var src = item.path;
  if (item.isFileSystem && /([^\/\\]+)\.zip$/i.test(src)) {
    let zip_file = SA_topmost_window.DragDrop._path_to_obj && SA_topmost_window.DragDrop._path_to_obj[src.replace(/^(.+)[\/\\]/, "")];
    if (!zip_file) {
      const blob = await new Promise((resolve, reject) => {
const xhr = new XMLHttpRequestZIP;
xhr.onload = function () {
  resolve(this.response);
};
xhr.open( "GET", src, true );
xhr.responseType = "blob";
xhr.send();
      });

      const file = new File([blob], src);

// from SA_DragDropEMU()
      console.log("File input (emulated):", file);
      const dd = SA_topmost_window.DragDrop;
      if (!dd._path_to_obj) {
        dd._path_to_obj = {};
        dd._obj_url = {};
      }
      dd._path_to_obj[file.name.replace(/^(.+)[\/\\]/, "")] = file;

      zip_file = file;
    }

    const zip = await new self.JSZip().loadAsync(zip_file);

// will be called, even if content is corrupted

    XMLHttpRequestZIP.zip_by_url(src, zip);

    let model_list = (!MMD_SA.THREEX.enabled) ? zip.file(/\.pmx$/i) : [];
    if (!model_list.length) {
      model_list = zip.file(/\.x$/i);
    }

    if (model_list.length) {
      const model_filename = model_list[0].name.replace(/^.+[\/\\]/, "");
      const model_path = src + "#/" + model_list[0].name;
      console.log(src, model_filename, model_path);

//      object3d_cache.set(model_path, null);

      const model_json = zip.file(/model\.json$/i);
      if (model_json.length) {
        const json = await model_json[0].async("text");
        MMD_SA_options.model_para = Object.assign(MMD_SA_options.model_para, JSON.parse(json, function (key, value) {
          if (typeof value == "string") {
            if (/^eval\((.+)\)$/.test(value)) {
              value = eval(decodeURIComponent(RegExp.$1));
            }
          }
          return value;
        }));
        console.log("(model.json updated)");
      }

      update_model_para(model_path);

      await add_object3D(model_path, item);

      DEBUG_show('✅PMX/X model (' + model_filename + ')');
    }
    else {
      let panorama_list = zip.file(/\.(png|jpg|jpeg)$/i);
      if (!panorama_list.length) {
        DEBUG_show("(No model found)");
        return;
      }

      const panorama_filename = (panorama_list.filter(n=>!/_depth\.\w{3,4}$/i.test(n.name))[0] || panorama_list[0]).name;//.name;
      const panorama_path = src + "#/" + panorama_filename;
      const panorama_depth_filename = panorama_list.filter(n=>n.name.indexOf(panorama_filename.replace(/\.(\w{3,4})$/, '_depth')) == 0)[0]?.name;
      const panorama_depth_path = (panorama_depth_filename) ? src + "#/" + panorama_depth_filename : '';
      console.log(src, panorama_filename, panorama_depth_filename);

//    object3d_cache.set(model_path, null);

      const panorama_json = zip.file(/panorama\.json$/i);
      let json;
      if (panorama_json.length) {
        const json_text = await panorama_json[0].async("text");
        json = JSON.parse(json_text);
        console.log("(panorama.json updated)");
      }

      await System._browser.update_obj_url(panorama_path);
      if (panorama_depth_path)
        await System._browser.update_obj_url(panorama_depth_path);

      update_model_para(panorama_path);

      await add_object3D(panorama_path, { panorama:{ depth:panorama_depth_path, json:json } });

      DEBUG_show('✅Panorama mini (' + panorama_filename + ')');
    }
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(gltf|glb)$/i.test(src)) {
    if (!MMD_SA.THREEX.enabled) {
      DEBUG_show('(GLTF/GLB not available in MMD mode)');
      return;
    }

    const model_filename = src.replace(/^.+[\/\\]/, "");

//    object3d_cache.set(src, null);

    update_model_para(src);

    await add_object3D(src, item);

    DEBUG_show('✅GLTF model (' + model_filename + ')');
  }
  else if (item.isFileSystem && /([^\/\\]+)\.(bpm|jpg|jpeg|png|webp|mp4|mkv|webm)$/i.test(src)) {
    const file_type = RegExp.$2.toUpperCase();
    const model_filename = src.replace(/^.+[\/\\]/, "");

//    object3d_cache.set(src, null);

    update_model_para(src);

    await add_object3D(src);

    DEBUG_show('✅' + file_type + ' (' + model_filename + ')');
  }
  else {
    _onDrop_finish.call(DragDrop, item)
  }
}

if (window.SA && SA.loader && (typeof SA.loader.loadScriptSync === 'function')) {
  SA.loader.loadScriptSync('images/XR Animator/modules/object3d-loader-bridge.js');
}

const XR_Animator_object3DLoaderBridge =
  (window.XR_Animator_Object3DLoaderBridge && (typeof window.XR_Animator_Object3DLoaderBridge.create === 'function'))
    ? window.XR_Animator_Object3DLoaderBridge.create({
      MMD_SA_options,
      MMD_SA,
      System,
      object3d_list,
      object3d_cache,
      getObject3DIndex: ()=>object3d_index,
      setObject3DIndex: (value)=>{ object3d_index = value; },
      toLocalPath,
      change_HDRI,
      rotationEuler: e1,
      build_octree,
      is_mobile,
      update_panorama_depth,
      toFileProtocol,
      getExplorerMode: ()=>explorer_mode,
      getRafTimestampDelta: ()=>RAF_timestamp_delta,
    })
    : null;

if (!XR_Animator_object3DLoaderBridge && window.console && console.warn) {
  console.warn('[XR Animator] Object3D loader bridge module unavailable');
}

const add_object3D = async function (url, para={}) {
  if (XR_Animator_object3DLoaderBridge && (typeof XR_Animator_object3DLoaderBridge.addObject3D === 'function')) {
    return XR_Animator_object3DLoaderBridge.addObject3D(url, para);
  }

  return Promise.resolve();
};

function animate_object3D() {
  if (XR_Animator_object3DLoaderBridge && (typeof XR_Animator_object3DLoaderBridge.animateObject3D === 'function')) {
    XR_Animator_object3DLoaderBridge.animateObject3D();
  }
}
// v0.37.3
window.addEventListener('SA_MMD_before_render', animate_object3D);

const adjust_object3D = (function () {
  const parent_bone_list = ['ROOT', '頭','首', '上半身2','上半身','左腕','左ひじ','左手首','右腕','右ひじ','右手首', '左足','左ひざ','左足首','右足','右ひざ','右足首'];

  let pos_scale = 0;

  let use_avatar_as_center = false;

  return function(e) {
if (!object3d_list.length) return;

const THREE = MMD_SA.THREEX.THREE;
const _THREE = MMD_SA.THREEX._THREE;

const c_pos = _THREE.MMD.getModels()[0].mesh.position;

let obj = object3d_list[object3d_index];
let mesh = obj._obj;
let ds = obj.user_data._default_state_;

let p = (obj.parent_bone) ? obj.parent_bone : mesh;

let pos_inc = ((obj.parent_bone) ? 0.1 : 0.5) * Math.pow(2, pos_scale);

let rot_inc = Math.PI/90;

const sign_center = (use_avatar_as_center) ? -1 : 1;

const ev = e.detail.e;

let pos = v3a.set(0,0,0);
let rot = e1.set(0,0,0);
let scale = 1;

let keyCode = e.detail.keyCode;
// backward compatibility
if (ev?.key == '+') {
  keyCode = 107;
}
else if (ev?.key == '-') {
  keyCode = 109;
}

switch (keyCode) {
// left
  case 37:
    if (ev.ctrlKey) {
      rot.y -= rot_inc;
    }
    else if (ev.shiftKey) {
      rot.z -= rot_inc;
    }
    else {
      pos.x -= pos_inc * sign_center;
    }
    break
// top
  case 38:
    if (ev.ctrlKey) {
      rot.x += rot_inc;
    }
    else if (ev.shiftKey) {
      pos.y += pos_inc * sign_center;
    }
    else if (ev.altKey) {
      if (explorer_mode)
        MMD_SA_options.Dungeon.para_by_grid_id[2].ground_y += pos_inc;
    }
    else {
      pos.z -= pos_inc * sign_center;
    }
    break;
// right
  case 39:
    if (ev.ctrlKey) {
      rot.y += rot_inc;
    }
    else if (ev.shiftKey) {
      rot.z += rot_inc;
    }
    else {
      pos.x += pos_inc * sign_center;
    }
    break
// down
  case 40:
    if (ev.ctrlKey) {
      rot.x -= rot_inc;
    }
    else if (ev.shiftKey) {
      pos.y -= pos_inc * sign_center;
    }
    else if (ev.altKey) {
      if (explorer_mode)
        MMD_SA_options.Dungeon.para_by_grid_id[2].ground_y -= pos_inc;
    }
    else {
      pos.z += pos_inc * sign_center;
    }
    break;
// +
  case 107:
    if (ev.ctrlKey) {
      pos_inc /= Math.pow(2, pos_scale);
      pos_scale = Math.min(pos_scale+1, 4);
      pos_inc *= Math.pow(2, pos_scale);
    }
    else {
      scale *= 1.1;
    }
    break;
// -
  case 109:
    if (ev.ctrlKey) {
      pos_inc /= Math.pow(2, pos_scale);
      pos_scale = Math.max(pos_scale-1, -4);
      pos_inc *= Math.pow(2, pos_scale);
    }
    else {
      scale *= 1/1.1;
    }
    break;
// B
  case 66:
    const parent_bone_index = (!obj.parent_bone) ? -1 : parent_bone_list.indexOf(obj.parent_bone.name);
    if (obj.parent_bone && (parent_bone_index == -1))
      parent_bone_list.push(obj.parent_bone.name);
    if ((parent_bone_index == -1) || (parent_bone_index < parent_bone_list.length-1)) {
      use_avatar_as_center = false;
      const parent_bone_name = parent_bone_list[parent_bone_index+1];
      obj.parent_bone = { model_index:0, name:parent_bone_name, position:{x:0,y:0,z:-1}, rotation:{x:0,y:0,z:0} };
      if (parent_bone_index == -1) {
        MMD_SA_options.Dungeon.accessory_list.push(obj);
      }
      p = obj.parent_bone;
    }
    else {
      delete obj.parent_bone;
      use_avatar_as_center = explorer_mode;
      MMD_SA_options.Dungeon.accessory_list = MMD_SA_options.Dungeon.accessory_list.filter(a => a !== obj);
      p = mesh;
      mesh.position.copy(c_pos);
// re-enable .matrixAutoUpdate as accessory disabled it
      mesh.matrixAutoUpdate = true;
    }
    obj.no_collision = !explorer_mode || !!obj.parent_bone;
    break;
// C
  case 67:
    if (obj.parent_bone) {
      speech_bubble2(System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.note_object_fixed_as_center'), 5);
      return;
    }
    if (explorer_mode) {
      speech_bubble2(System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.note_avatar_fixed_as_center'), 8);
      return;
    }
    use_avatar_as_center = !use_avatar_as_center;
    speech_bubble2(System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.' + ((use_avatar_as_center) ? 'avatar' : 'object') + '_as_center'), 2);
    break;
// O
  case 79:
    if (++object3d_index >= object3d_list.length)
      object3d_index = 0;

    obj = object3d_list[object3d_index];
    mesh = obj._obj;
    ds = obj.user_data._default_state_;

    p = (obj.parent_bone) ? obj.parent_bone : mesh;

    pos_inc = ((obj.parent_bone) ? 0.1 : 0.5) * Math.pow(2, pos_scale);
    break;
// R
  case 82:
    if (!e.detail.reset_confirmed) {
      MMD_SA_options.Dungeon.run_event({
message: {
  index: 1,
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.reset'); },
  para: { scale:0.75 },
  branch_list: [
    { key:8, event_id:{ sb_index:1, func:()=>{setTimeout(()=>{adjust_object3D({detail:{reset_confirmed:true,keyCode:82,ev:{},result:{}}})},0)}, ended:true } },
    { key:[9,'Esc'], event_id:{ sb_index:1, ended:true } },
  ]
}
      });
    }
    else {
      let p_rot;
      if (ds.parent_bone_name) {
        if (!obj.parent_bone) {
          obj.parent_bone = { model_index:0, name:ds.parent_bone_name, position:{x:0,y:0,z:-1}, rotation:{x:0,y:0,z:0} };
          MMD_SA_options.Dungeon.accessory_list.push(obj);
        }
        p = obj.parent_bone;
        p_rot = p.rotation;
      }
      else {
        if (obj.parent_bone) {
          delete obj.parent_bone;
          MMD_SA_options.Dungeon.accessory_list = MMD_SA_options.Dungeon.accessory_list.filter(a => a !== obj);
        }
        p = mesh;
        p_rot = obj.user_data._rotation_;
        p_rot.x = p_rot.y = p_rot.z = 0;
// re-enable .matrixAutoUpdate as accessory disabled it
        mesh.matrixAutoUpdate = true;
      }
      if (!obj.parent_bone) {
        mesh.position.copy(ds.position);
      }

      mesh.scale.setScalar(ds.scale);

      use_avatar_as_center = !ds.parent_bone_name && explorer_mode;

      speech_bubble2('(' + System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.reset.successful') + ')', 3);
    }
    break;
// X
  case 88:
    if (!e.detail.remove_confirmed) {
      MMD_SA_options.Dungeon.run_event({
message: {
  index: 1,
  get content() { return System._browser.translation.get('XR_Animator.UI.UI_options.scene.3D_scene_builder.remove'); },
  para: { scale:0.75 },
  branch_list: [
    { key:8, event_id:{ sb_index:1, func:()=>{setTimeout(()=>{adjust_object3D({detail:{remove_confirmed:true,keyCode:88,ev:{},result:{}}})},0)}, ended:true } },
    { key:[9,'Esc'], event_id:{ sb_index:1, ended:true } },
  ]
}
      });
    }
    else {
      remove_object3D(object3d_index);

      if (!object3d_index.length) {
        System._browser.DEBUG_show();
        e.detail.result.return_value = true;
        return;
      }

      obj = object3d_list[object3d_index];
      mesh = obj._obj;
      ds = obj.user_data._default_state_;

      p = (obj.parent_bone) ? obj.parent_bone : mesh;

      pos_inc = ((obj.parent_bone) ? 0.1 : 0.5) * Math.pow(2, pos_scale);
    }
    break;
  default:
    return;
}

explorer_ground_y = MMD_SA_options.Dungeon.para_by_grid_id[2].ground_y;

if (use_avatar_as_center && !obj.parent_bone) {
  pos.add(v3b.copy(p.position).sub(c_pos).multiplyScalar(scale)).applyEuler(rot).add(c_pos);
}
else {
  pos.add(v3b.copy(p.position));
}

p.position.x = pos.x;
p.position.y = pos.y;
p.position.z = pos.z;

if (obj.parent_bone) {
  rot.fromArray(rot.toArray().slice(0,3).map(v=>Math.round(v*180/Math.PI)));
  p.rotation.x += rot.x;
  p.rotation.y += rot.y;
  p.rotation.z += rot.z;
}
else {
  obj.user_data._rotation_.add(rot);
}

mesh.scale.multiplyScalar(scale);

System._browser.DEBUG_show([
  (object3d_index+1) + '/' + object3d_list.length + ': ' + obj.user_data.id,
  '',
  'Position(±' + (Math.round(pos_inc*1000)/1000) + '): ' + ((obj.parent_bone) ? v3a.copy(p.position) : v3a.copy(p.position).sub(c_pos)).toArray().map(v=>Math.round(v*10)/10),
  'Rotation(±' + (2) + '°): ' + ((obj.parent_bone) ? e1.copy(p.rotation).toArray().slice(0,3) : e1.copy(obj.user_data._rotation_).toArray().slice(0,3).map(v=>Math.round(v*180/Math.PI))),
  'Scale: ' + Math.round(mesh.scale.x*10)/10,
  '',
  'Ground Y(±' + (Math.round(pos_inc*1000)/1000) + '): ' + Math.round(MMD_SA_options.Dungeon.para_by_grid_id[2].ground_y*10)/10,
  '',
  ((obj.parent_bone) ? 'Attach to: ' + (MMD_SA.THREEX.VRM.bone_map_MMD_to_VRM[obj.parent_bone.name] || obj.parent_bone.name) : 'Center: ' + ((use_avatar_as_center) ? 'Avatar' : 'Object')),
].join('\n'));

if (!obj.parent_bone)
  mesh.quaternion.setFromEuler(obj.user_data._rotation_);

highlight_object(obj);

e.detail.result.return_value = true;
  };
})();

var explorer_mode = false;
window.addEventListener('jThree_ready', ()=>{
  Object.defineProperty(MMD_SA_options, '_XRA_explorer_mode', {
    get: ()=>explorer_mode,
  });
});

function build_octree(object3d) {
  object3d.no_collision = !explorer_mode || !!object3d.parent_bone;

  if (!object3d.use_octree && (!explorer_mode || object3d.parent_bone)) return;

  const obj_cached = object3d_cache.get(object3d.user_data.path);
  const mesh_parent = obj_cached._obj;

  const bounding_host = MMD_SA.get_bounding_host(mesh_parent);
  if (!bounding_host.boundingBox) {
    bounding_host.boundingBox = MMD_SA.THREEX.utils.computeBoundingBox(mesh_parent);
  }
  if (!bounding_host.boundingBox_list)
    bounding_host.boundingBox_list = [bounding_host.boundingBox];
  if (!bounding_host.boundingSphere)
    bounding_host.boundingSphere = bounding_host.boundingBox.getBoundingSphere(new THREE.Sphere());

  if (!object3d._obj_base.octree) {
    const octree = new THREEX.Octree();
    octree.fromGraphNode( object3d._obj );
    object3d._obj_base.octree = octree;

    octree._is_back_side = (mesh_parent.material?.side == MMD_SA.THREEX.THREE.BackSide) ? true : false;

    console.log('octree', object3d);
  }
}

var grid_plane;
function add_grid() {
  if (grid_plane) {
    if (!explorer_mode) {
      grid_plane.visible = true;
      grid_plane.children.forEach(c=>c.visible=true);
    }
    return;
  }

  const THREE = MMD_SA.THREEX.THREE;
  const _THREE = MMD_SA.THREEX._THREE;

  const geometry_base = new THREE.PlaneGeometry( 30*5, 30*5 );

  const m4 = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90));
  geometry_base.applyMatrix(m4);

  const line = new THREE.GridHelper( 30*5, 30, '#000', '#000' );
  line.material.transparent = true;

  grid_plane = new THREE.Object3D();
  grid_plane.add(line);

  const material_base = new THREE.MeshBasicMaterial( { color:'#FFF', transparent:true });
  const mesh_base = new THREE.Mesh(geometry_base, material_base);
  mesh_base.position.y -= 0.05;
  grid_plane.add(mesh_base);

  grid_plane.position.copy(_THREE.MMD.getModels()[0].mesh.position);
  grid_plane.position.y += 0.1;

  MMD_SA.THREEX.scene.add(grid_plane);

// can be changed only after scene.add for _THREE
  if (grid_plane.children[1])
    grid_plane.children[1].material.opacity = 0.5;
}

window.addEventListener('SA_Dungeon_onrestart', ()=>{remove_object3D()});

function remove_object3D(index) {
  ((index == null) ? object3d_list : [object3d_list[index]]).forEach(object3d => {
    MMD_SA.THREEX.scene.remove(object3d._obj);

    if (object3d.parent_bone)
      MMD_SA_options.Dungeon.accessory_list = MMD_SA_options.Dungeon.accessory_list.filter(a => a !== object3d);

    const d = object3d.user_data;
    if (d.animation_mixer) {
      d.animation_mixer.stopAllAction();
      d.animation_mixer.uncacheClip(d.animation_clip);
    }
    if (d.video) {
      d.video.pause();
      delete d.video;
    }

    MMD_SA.THREEX.utils.dispose(object3d._obj);

    delete object3d._obj;
    delete object3d._mesh;

    if (MMD_SA.THREEX._XR_Animator_scene_?.object3D_list) {
      MMD_SA.THREEX._XR_Animator_scene_.object3D_list = MMD_SA.THREEX._XR_Animator_scene_.object3D_list.filter(v=>v._object3d_uuid != object3d.uuid);
//console.log(MMD_SA.THREEX._XR_Animator_scene_.object3D_list.length)
    }
  });

  if (index == null) {
    object3d_list.length = 0;
  }
  else {
    const path = object3d_list[index].user_data.path;
    object3d_list = MMD_SA.THREEX._object3d_list_ = object3d_list.filter(object3d=>object3d._obj);
//    if (!object3d_list.some(object3d=>object3d.user_data.path==path)) object3d_cache.delete(path);
  }

  object3d_index = 0;

  if (!object3d_list.length) {
    object3d_cache.clear();
    delete MMD_SA.THREEX._object3d_list_;
  }
}

var panorama_loading;
var panorama_src, panorama_index;
var panorama_list = [
  '',
  System.Gadget.path + '/images/_dungeon/tex/ryntaro_nukata/blue_sky.jpg',
  System.Gadget.path + '/images/_dungeon/tex/ryntaro_nukata/angel_staircase.jpg',
  System.Gadget.path + '/images/_dungeon/tex/stars_milky_way.jpg',
];

var canvas_dummy, canvas_dummy2;
function update_panorama_depth(image, mesh, para={}) {
  const THREE = MMD_SA.THREEX.THREE;

  const m = mesh.material;

  const canvas = document.createElement('canvas');
  canvas.width  = image.width; 
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(image, 0,0);

  canvas_dummy = canvas_dummy || document.createElement('canvas');
  canvas_dummy.width  = 1;
  canvas_dummy.height = image.height;
  const ctx_dummy = canvas_dummy.getContext('2d');
  ctx_dummy.globalCompositeOperation = 'source-over';
  ctx_dummy.globalAlpha = 1;
  ctx_dummy.drawImage(image, 0,0,1,image.height, 0,0,1,image.height);
  ctx_dummy.globalAlpha = 0.5;
  ctx_dummy.drawImage(image, image.width-1,0,1,image.height, 0,0,1,image.height);
  for (let x = 0; x < 1; x++) {
    ctx.drawImage(canvas_dummy, 0,0,1,image.height, x,0,1,image.height);
    ctx.drawImage(canvas_dummy, 0,0,1,image.height, image.width-1-x,0,1,image.height);
  }

  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(canvas, 0,0);

  if (m.transparent && para.depth_to_alpha) {
    canvas_dummy.width  = image.width; 
    canvas_dummy.height = image.height;
    ctx_dummy.globalAlpha = 1;
    ctx_dummy.drawImage(canvas, 0,0);

    const depth_to_alpha_fadeout_start = para.depth_to_alpha.fadeout_start || 0.3;
    const depth_to_alpha_fadeout_end   = para.depth_to_alpha.fadeout_end   || 0.1;
    ctx_dummy.globalAlpha = 1;

    let c = ~~((1-depth_to_alpha_fadeout_start)*256);
    ctx_dummy.fillStyle = 'rgb(' + [c,c,c].join(' ') + ')';
    ctx_dummy.globalCompositeOperation = 'lighter';
    ctx_dummy.fillRect(0,0,image.width,image.height);

    c = ~~((depth_to_alpha_fadeout_start * (1-depth_to_alpha_fadeout_end))*256);
    ctx_dummy.fillStyle = 'rgb(' + [c,c,c].join(' ') + ')';
    ctx_dummy.globalCompositeOperation = 'color-burn';
    ctx_dummy.fillRect(0,0,image.width,image.height);

  // CONV. STEP: move a component channel to alpha-channel
    let idata = ctx_dummy.getImageData(0, 0, canvas_dummy.width, canvas_dummy.height);
    let data32 = new Uint32Array(idata.data.buffer);
    let i = 0, len = data32.length;
    while(i < len) {
      data32[i] = data32[i++] << 8; // shift blue channel into alpha (little-endian)
    }
  // update canvas
    ctx_dummy.putImageData(idata, 0, 0); 
    idata = data32 = undefined;

    const canvas_color = m.map.image;
    const ctx_color = canvas_color.getContext('2d');
    ctx_color.globalCompositeOperation = 'destination-in';
    ctx_color.drawImage(canvas_dummy, 0,0,canvas_color.width,canvas_color.height);
    ctx_color.globalCompositeOperation = 'copy';
  }

  ctx.globalCompositeOperation = 'copy';
  ctx.filter = 'blur(16px)';
  ctx.drawImage(canvas, 0,0);
  ctx.filter = 'none';

  const canvas_disp = canvas_dummy2 = canvas_dummy2 || document.createElement('canvas');
  const sd = MMD_SA_options.Dungeon_options.skydome;
  let dw = canvas_disp.width  = para.width_segments  || sd.width_segments;
  let dh = canvas_disp.height = para.height_segments || sd.height_segments;
  const ctx_disp = canvas_disp.getContext('2d');
  ctx_disp.globalCompositeOperation = 'source-over';
  ctx_disp.globalAlpha = 1;
  ctx_disp.drawImage(canvas, 0,0,dw,dh);
  const depth_idata = ctx_disp.getImageData(0,0,dw,dh);

  if (MMD_SA.THREEX.enabled) {
    const pos = mesh.geometry.getAttribute('position');
    const uv  = mesh.geometry.getAttribute('uv');
//console.log(pos.count,uv.count,mesh.geometry.getIndex().count)
    for (let i = 0, i_max = pos.count; i < i_max; i++) {
      let x = uv.array[i*2];
      let y = uv.array[i*2+1];
      if (x < 0) x += 1;
      if (y < 0) y += 1;
      y = 1-y;

      x = Math.round(x*dw);
      y = Math.round(y*dh);
      if (x == dw) x = 0;
      if (y == dh) y = 0;

      const depth = 1 - depth_idata.data[(y*dw + x) * 4]/255 * (192/256);
//continue
      for (let j = 0; j < 3; j++)
        pos.array[i*3+j] *= depth;
    }
  }
  else {
    const pos  = mesh.geometry.vertices;
    const uv   = mesh.geometry.faceVertexUvs[0];
    const face = mesh.geometry.faces;

    const v_index = {};
    const face_a = ['a', 'b', 'c'];
    for (let i = 0, i_max = face.length; i < i_max; i++) {
      const f_obj = face[i];
      for (let f = 0; f < 3; f++) {
        const vi = f_obj[face_a[f]];
        if (v_index[vi]) break;
        v_index[vi] = true;

        let x = uv[i][f].x;
        let y = uv[i][f].y;
        if (x < 0) x += 1;
        if (y < 0) y += 1;
        y = 1-y;

        x = Math.round(x*dw);
        y = Math.round(y*dh);
        if (x == dw) x = 0;
        if (y == dh) y = 0;

        const depth = 1 - depth_idata.data[(y*dw + x) * 4]/255 * (192/256);
//continue
        pos[vi].multiplyScalar(depth);
      }
    }
  }

/*
  if (!m.displacementMap)
    m.displacementMap = new THREE.Texture(canvas);
  m.displacementMap.needsUpdate = true;
  m.displacementScale = -192;
*/
//ctx.drawImage(canvas_dummy, 0,0,canvas.width,canvas.height); return;
}

async function change_panorama(index, src, para={}) {
  function show() {
    panorama_loading = false;
    sd.texture_index = index;
    sd.texture_setup();
    System._browser.camera.display_floating = (MMD_SA_options.user_camera.display.floating_auto !== false);

    if (MMD_SA.THREEX.enabled) {
      MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.traverse(obj=>{
       obj.layers.enable(MMD_SA.THREEX.PPE.N8AO.NO_AO);
      });

      MMD_SA.THREEX.scene.background = null;
    }

    panorama_index = index;
    panorama_src = para.full_path || src;
  }

  var sd = MMD_SA_options.Dungeon_options.skydome
  if (panorama_loading) {
    DEBUG_show('(panorama still loading)', 2)
    return
  }
  if (index && sd.texture_cache_list[index] && sd.texture_cache_list[index].complete) {
    show()
    return
  }

  if (!src) src = panorama_list[index];

  panorama_loading = true;

  await new Promise((resolve)=>{
    const image = sd.texture_cache_list[index] = sd.texture_cache_list[index] || new Image();
    image.onload = ()=>{
      resolve();
    };
    image.onerror = ()=>{
      panorama_loading = false;
      resolve();
    };
    image.src = toFileProtocol(src);
  });

  if (panorama_loading && para.depth) {
    panorama_loading = true;
    await new Promise((resolve)=>{
      const image = sd.texture_cache_list[-1] = sd.texture_cache_list[-1] || new Image();
      image.onload = ()=>{
        update_panorama_depth(image, MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj, para.json);
        resolve();
      };
      image.onerror = ()=>{
//        panorama_loading = false;
        resolve();
      };
      image.src = toFileProtocol(para.depth);
    });
  }

  if (panorama_loading)
    show();
}

var dome_axis_angle = 0;
var dome_rotation_speed = 0;
var dome_rotation = 0;
function rotate_dome() {
  var axis = v3a.set(0,1,0);
  axis.applyEuler(e1.set(0, 0, dome_axis_angle/180*Math.PI));
  dome_rotation = (dome_rotation + RAF_timestamp_delta/(1000*60*10) * dome_rotation_speed * 360) % 360;

  MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.quaternion.setFromAxisAngle(axis, dome_rotation/180*Math.PI);

  if (!MMD_SA.THREEX.enabled) {
    MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.useQuaternion = true;
  }
  else {
    e1.setFromQuaternion(MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.quaternion);

    if (MMD_SA.THREEX.scene.environment)
      MMD_SA.THREEX.scene.environmentRotation.copy(e1);
    if (MMD_SA.THREEX.scene.background)
      MMD_SA.THREEX.scene.backgroundRotation.copy(e1);
  }
}

function remove_skybox() {
  MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.visible = false;
  MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.quaternion.set(0,0,0,1);

  dome_rotation = 0;
//  dome_axis_angle = 0;
//  dome_rotation_speed = 0;

  System._browser.on_animation_update.remove(rotate_dome,1);
}

const HDRI_list = [
  'colorful_studio.hdr',
  'rustig_koppie_puresky.hdr',
  'ballroom.hdr',
  'photo_studio_loft_hall.hdr',
  'blue_photo_studio.exr',
];

async function change_HDRI(index, use_background) {
  if ((use_background == null) || !MMD_SA.THREEX.utils.HDRI.mode)
    use_background = (!MMD_SA.THREEX.utils.HDRI.mode) ? false : ((MMD_SA.THREEX.utils.HDRI.mode == 1) ? (!MMD_SA_options.mesh_obj_by_id["DomeMESH"]?._obj.visible && (!!MMD_SA.THREEX.scene.background || !MMD_SA.THREEX._object3d_list_?.length)) : true);

  await MMD_SA.THREEX.utils.HDRI.load(System.Gadget.path + '/images/_dungeon/hdri/' + ((use_background)?'full/':'') + HDRI_list[index-1], use_background);

  if (use_background) {
    remove_skybox();

    if (dome_rotation_speed) {
      System._browser.on_animation_update.remove(rotate_dome,1);
      System._browser.on_animation_update.add(rotate_dome,0,1,-1);
    }
  }
}

function remove_HDRI() {
  if (!MMD_SA.THREEX.enabled) return;

  MMD_SA.THREEX.scene.background = null;
  MMD_SA.THREEX.scene.environment = null
  MMD_SA.THREEX.scene.environmentRotation.set(0,0,0);
  MMD_SA.THREEX.scene.backgroundRotation.set(0,0,0);

  System._browser.on_animation_update.remove(rotate_dome,1);
}

const scene_json_for_export = {
  XR_Animator_scene: {}
};

const onDrop_scene_JSON = (function () {
  const RE_arm = new RegExp("^(" + toRegExp(["左","右"],"|") + ")(" + toRegExp(["肩","腕","ひじ","手"],"|") + "|." + toRegExp("指") + ")(.*)$");

  window.addEventListener('SA_XR_Animator_scene_onload', ()=>{
const od = System._browser.camera.object_detection;
MMD_SA.THREEX._XR_Animator_scene_?.object3D_list?.forEach(obj=>{
  if (obj.model_para.object_detection) {
    obj.model_para.object_detection.class_name_list.forEach(name=>{
      od.options_by_class_name[name] = obj.model_para.object_detection;
    });
  }
});
  });

  window.addEventListener('SA_XR_Animator_scene_onunload', ()=>{
const od = System._browser.camera.object_detection;
od.options_by_class_name = {};
od.data_by_class_name = {};
  });

  function adjust_parent_bone(p_bone, is_T_pose) {
if (!RE_arm.test(p_bone.name)) return;

const pos_vector = MMD_SA.TEMP_v3.set(p_bone.position.x, p_bone.position.y, -p_bone.position.z);
const dir = (RegExp.$1 == '左') ? 1 : -1;
const rot_axis = MMD_SA.THREEX.rot_arm_axis[dir * ((is_T_pose) ? 1 : -1)];
pos_vector.applyQuaternion(rot_axis);
p_bone.position.x =  pos_vector.x;
p_bone.position.y =  pos_vector.y;
p_bone.position.z = -pos_vector.z;

const obj_rot = MMD_SA._q1.setFromEuler(MMD_SA.TEMP_v3.set(-p_bone.rotation.x, -p_bone.rotation.y, p_bone.rotation.z).multiplyScalar(Math.PI/180), 'YXZ');
/*
if (is_T_pose) {
  obj_rot.fromArray(MMD_SA.THREEX.utils.convert_A_pose_rotation_to_T_pose(p_bone.name, obj_rot.toArray()));
}
else {
  obj_rot.fromArray(MMD_SA.THREEX.utils.convert_T_pose_rotation_to_A_pose(p_bone.name, obj_rot.toArray()));
}
*/
obj_rot.premultiply(rot_axis);

const obj_rot_euler = MMD_SA.TEMP_v3.setEulerFromQuaternion(obj_rot, 'YXZ').multiplyScalar(180/Math.PI);
p_bone.rotation.x = -obj_rot_euler.x;
p_bone.rotation.y = -obj_rot_euler.y;
p_bone.rotation.z =  obj_rot_euler.z;

p_bone.is_T_pose = is_T_pose;
  }

  async function parse_scene(json, scene_src) {
    async function locate_file(zip, obj, type) {
      if (!obj || !obj.path) return false;

      switch (obj.path.replace(/^.+[\/\\]/, '').replace(/\.js$/i, '')) {
        case 'scene_auto_fit':
          obj.path = System.Gadget.path + '\\js\\scene_auto_fit.js';
          return true;
      }

      if (!/\.([a-z0-9]{1,4})$/i.test(obj.path))
        obj.path += (MMD_SA.THREEX.enabled) ? '.glb' : '.zip';

      const filename = obj.path.replace(/^.+[\/\\]/, '');
      if (!zip) {
        if (!/^\w+\:/.test(obj.path))
          obj.path = scene_src.replace(/[^\/\\]+$/, '') + obj.path.replace(/^[\/\\]/, '');
        if (FSO_OBJ.FileExists(obj.path)) return true;
        show_status('❌"' + filename + '"');
        return false;
      }

      const obj_list = zip.file(new RegExp(toRegExp(filename), "i"));
      if (!obj_list.length) {
        show_status('"' + filename + '" not found');
        return false;
      }
      obj.path = zip_path + '#\\' + obj_list[0].name.replace(/\//g, '\\');
      await System._browser.update_obj_url(obj.path, type);
      return true;
    }

    async function parse_motion(motion_list) {
      if (!motion_list) return;

      let load_count = 0
      const _motion_list = [];
      for (const motion of motion_list) {
        const filename = motion.path.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "");
        if (MMD_SA_options.motion_index_by_name[filename] || MMD_SA_options._XRA_pose_list[0].find(m=>m.name==filename) || await locate_file(zip, motion))
          _motion_list.push(motion);
      }

      const promise_list = [];
      _motion_list.forEach((motion)=>{
        let p;
        const filename = motion.path.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "");

        if (motion.para) {
          if (!MMD_SA_options.motion_para[filename]?.motion_tracking?._default_)
            MMD_SA_options.motion_para[filename] = Object.assign(MMD_SA_options.motion_para[filename]||{}, motion.para);
//console.log(Object.assign({}, MMD_SA_options.motion_para[filename]))
        }

        const motion_index = MMD_SA_options._XRA_pose_list[0].findIndex(m=>m.name==filename);
        if (motion_index != -1) {
          p = Promise.resolve(true);//new Promise((resolve)=>{ System._browser.on_animation_update.add(resolve, 1,0); });
          if (motion.play_on_ready) {
            p.then(()=>{ MMD_SA_options.Dungeon_options.item_base.pose._change_motion_(motion_index, true); });
          }
          else {
            const index = MMD_SA_options.motion_index_by_name[filename];
            if (!MMD_SA.motion[index]) {
              const m = MMD_SA_options.motion[index];
              p = MMD_SA.load_external_motion(m.path, false);
            }
          }
        }
        else {
          if (MMD_SA_options.motion_index_by_name[filename]) {
            p = Promise.resolve(true);
          }
          else {
            p = MMD_SA.load_external_motion(motion.path, false);
          }

          if (motion.play_on_ready) {
            p.then(()=>{
MMD_SA_options._motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[filename]];
MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
MMD_SA._force_motion_shuffle = true;
            });
          }
        }
        promise_list.push(p);
      });
      return Promise.all(promise_list);
    }

    async function parse_event(ev, event_name) {
      if (!ev) return;

      const e = ev[event_name];
      if (!e) return;

      const module_list = e.module || [e];

      for (let i = 0; i < module_list.length; i++) {
        const m = module_list[i];
        if (await locate_file(zip, m, 'text/javascript')) {
          const filename = m.path.replace(/^.+[\/\\]/, '').replace(/\.js$/i, '');
          const module = await import(toFileProtocol(m.path));
          await module[event_name](event_para);
          show_status('✅Event: ' + event_name + '(' + filename + ')');
        }
      }

      if (e.motion) {
        await parse_motion(e.motion);

        if (!e.motion.find(m=>m.play_on_ready)) {
          MMD_SA_options._motion_shuffle_list_default = e.motion.map(motion=>MMD_SA_options.motion_index_by_name[motion.path.replace(/^.+[\/\\]/, "").replace(/\.([a-z0-9]{1,4})$/i, "")]);
          MMD_SA_options.motion_shuffle_list_default = MMD_SA_options._motion_shuffle_list_default.slice();
          MMD_SA._force_motion_shuffle = true;
        }
      }
    }

    async function check_loaded(count=0) {
      loaded_count += count;
      if (loaded_counting || (loaded_count < loaded_count_max)) return;

      await parse_event(json.XR_Animator_scene.on, 'load');

      show_status('✅Scene loaded (' + (loaded_count + '/' + loaded_count_max) + ')', 5);
      resolve_func();
    }

    if (!json.XR_Animator_scene) {
      show_status('No scene data found');
      return;
    }

    show_status('Loading scene...', 99);

    const zip_path = (/.zip$/i.test(scene_src)) ? scene_src : null;

    const zip = (zip_path) ? XMLHttpRequestZIP.zip_by_url(zip_path) : null;

    let scene_needs_reset, update_scene_only;
    const object3D_list = json.XR_Animator_scene.object3D_list;
    if (MMD_SA.THREEX._XR_Animator_scene_?.object3D_list && object3D_list) {
      update_scene_only = object3D_list.every(obj=>{
        if (obj.type == 'object3D') {
          const filename = obj.path.replace(/^.+[\/\\]/, '').replace(/\.[^\.]+$/, '');
// a simple trick to allow simple object scene to just update para instead of adding duplicated objects, probably won't work well for complicated cases when the existing scene has object clones.
          const _no_clone = MMD_SA.THREEX._XR_Animator_scene_.object3D_list.filter(v=>v.path.replace(/^.+[\/\\]/, '').replace(/\.[^\.]+$/, '')==filename).length == 1;
          return _no_clone;
        }
      });
//console.log('update_scene_only',update_scene_only)
      scene_needs_reset = !update_scene_only;
    }

    if (scene_needs_reset) {
      await new Promise((resolve)=>{
        reset_scene(true);
        System._browser.on_animation_update.add(()=>{ resolve(); }, 2,1);
      });
      show_status('✅(Scene reset)');
    }

    let loaded_count = 0;
    let loaded_count_max = 0;
    let loaded_counting = true;
    let resolve_func;
    const promise = new Promise((resolve)=>{ resolve_func=resolve; });

    const event_para = { json:json, zip:zip, zip_path:zip_path, locate_file:locate_file };

    await parse_event(json.XR_Animator_scene.on, 'init');

    const wallpaper = json.XR_Animator_scene.wallpaper;
    if (wallpaper) {
      const v_bg = document.getElementById("VdesktopBG");
      if (v_bg) {
        v_bg.pause();
        v_bg.style.visibility = 'hidden';
      }

      if (wallpaper.path) {
        if (await locate_file(zip, wallpaper)) {
          if (wallpaper.settings_3d) {
            loaded_count_max++;

            MMD_SA.Wallpaper3D.enabled = true;
            MMD_SA.Wallpaper3D.options_by_filename[wallpaper.path.replace(/^.+[\/\\]/, '')] = wallpaper.settings_3d;
          }

          const SR_mode = MMD_SA.Wallpaper3D.options.SR_mode;
          MMD_SA.Wallpaper3D.options.SR_mode = 0;
          const image_input_handler_as_wallpaper = MMD_SA_options.image_input_handler_as_wallpaper;
          MMD_SA_options.image_input_handler_as_wallpaper = true;
          onDrop_change_wallpaper({ detail:{ item:{ isFileSystem:true, path:wallpaper.path }, promises_to_return:[] } }).then(()=>{
            MMD_SA.Wallpaper3D.options.SR_mode = SR_mode;
            MMD_SA_options.image_input_handler_as_wallpaper = image_input_handler_as_wallpaper;
            if (wallpaper.settings_3d) {
              show_status('✅3D wallpaper');
              check_loaded(1);
            }
          });
        }
      }
      if (wallpaper.color) {
        document.body.style.backgroundColor = wallpaper.color;
        if (!wallpaper_src)
          LdesktopBG_host.style.display = "none";
      }

      show_status('✅Wallpaper');
      loaded_count++;
      loaded_count_max++;
    }

    const HDRI = MMD_SA.THREEX.enabled && json.XR_Animator_scene.HDRI;
    if (HDRI) {
      if (HDRI.path) {
        if (!await locate_file(zip, HDRI)) {
          HDRI.path = null;
          HDRI.index = 1;
        }
      }
      if (HDRI.path || HDRI.index) {
        loaded_count_max++;

        MMD_SA.THREEX.utils.HDRI.mode = HDRI.mode;
        MMD_SA.THREEX.scene.environmentIntensity = MMD_SA.THREEX.scene.backgroundIntensity = HDRI.intensity || 1;

// use await to make sure that HDRI is loaded before 3D objects
        await ((HDRI.path) ? MMD_SA.THREEX.utils.HDRI.load(HDRI.path, HDRI.use_background) : change_HDRI(HDRI.index, HDRI.use_background));
        show_status('✅HDRI');
        check_loaded(1);

        if (HDRI.rotation_speed) {
          dome_axis_angle = panorama.axis_angle;
          dome_rotation_speed = panorama.rotation_speed;
          System._browser.on_animation_update.remove(rotate_dome,1);
          System._browser.on_animation_update.add(rotate_dome,0,1,-1);
        }
        else if (HDRI.axis_angle) {
          const a = HDRI.axis_angle * Math.PI/180;
          MMD_SA.THREEX.scene.backgroundRotation.y = MMD_SA.THREEX.scene.environmentRotation.y = a;
        }
      }
    }

    const panorama = !HDRI?.mode && json.XR_Animator_scene.panorama;
    if (panorama) {
      if (panorama.path) {
        if (!await locate_file(zip, panorama))
          panorama.index = -1;
      }
      if (panorama.index >= 0) {
        loaded_count_max++;
        ((panorama.index == 0) ? onDrop_change_panorama({isFileSystem:true, path:panorama.path}) : change_panorama(panorama.index, panorama.path)).then(()=>{
          show_status('✅Panorama');
          check_loaded(1);
        });

        if (panorama.rotation_speed) {
          dome_axis_angle = panorama.axis_angle;
          dome_rotation_speed = panorama.rotation_speed;
          System._browser.on_animation_update.remove(rotate_dome,1);
          System._browser.on_animation_update.add(rotate_dome,0,1,-1);
        }
        else if (panorama.axis_angle) {
          const a = panorama.axis_angle * Math.PI/180;
          MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.quaternion.copy(MMD_SA.TEMP_q.set(0,Math.sin(a),0, Math.cos(a)));
          if (!MMD_SA.THREEX.enabled)
            MMD_SA_options.mesh_obj_by_id["DomeMESH"]._obj.useQuaternion = true;
        }
      }
    }

    const motion_list = json.XR_Animator_scene.motion_list;
    if (motion_list) {
      scene_json_for_export.XR_Animator_scene.motion_list = motion_list;

      loaded_count_max++;
      await parse_motion(motion_list);
      show_status('✅Motion');
      check_loaded(1);
    }

    if (object3D_list) {
      const is_T_pose = MMD_SA.THREEX.get_model(0).is_T_pose;
      for (const obj of object3D_list) {
        if (obj.type == 'object3D') {
          if (!await locate_file(zip, obj)) continue;

          const filename = obj.path.replace(/^.+[\/\\]/, '').replace(/\.[^\.]+$/, '');
          if (typeof obj.model_para.parent_bone == 'number') obj.model_para.parent_bone = obj.model_para.parent_bone_list[obj.model_para.parent_bone];
          const pb_list = [obj.model_para.parent_bone, ...(obj.model_para.parent_bone_list||[])];
          pb_list.forEach(p_bone=>{
            if (p_bone && (p_bone.is_T_pose != null) && ((p_bone.is_T_pose) ? !is_T_pose : is_T_pose)) {
              adjust_parent_bone(p_bone, is_T_pose);
            }
          });

          if (!obj.id) obj.id = filename;

// a simple trick to allow simple object scene to just update para instead of adding duplicated objects, probably won't work well for complicated cases when the existing scene has object clones.
          const _no_clone = MMD_SA.THREEX._XR_Animator_scene_?.object3D_list?.filter(v=>v.path.replace(/^.+[\/\\]/, '').replace(/\.[^\.]+$/, '')==filename).length == 1;
//console.log('no clone', _no_clone)
          let obj_old;
          if (_no_clone) {
            if (MMD_SA.THREEX._XR_Animator_scene_?.object3D_list) {
              obj_old = MMD_SA.THREEX._XR_Animator_scene_.object3D_list.find(v=>v.path.replace(/^.+[\/\\]/, '').replace(/\.[^\.]+$/, '')==filename);
              if (obj_old) {
                MMD_SA.THREEX._XR_Animator_scene_.object3D_list = MMD_SA.THREEX._XR_Animator_scene_.object3D_list.filter(v=>v!=obj_old);
              }
            }
            if (MMD_SA.THREEX._XR_Animator_scene_?.auto_fit_list) {
              const auto_fit_list = [];
              MMD_SA.THREEX._XR_Animator_scene_.auto_fit_list = MMD_SA.THREEX._XR_Animator_scene_.auto_fit_list.forEach((v_list,i)=>{
                const list = v_list.filter(v=>v.object_id!=filename);
                if (list.length)
                  auto_fit_list.push(list);
              });
              MMD_SA.THREEX._XR_Animator_scene_.auto_fit_list = auto_fit_list;
            }
          }

          loaded_count_max++;
// need to use await (i.e. loading in order) to work with cloned objects
          await onDrop_add_object3D({ isFileSystem:true, path:obj.path, _obj_json:obj, _no_clone:_no_clone });

          if (obj_old) {
            obj._object3d_uuid = obj_old._object3d_uuid;
            const x_object = object3d_list.find(_obj=>_obj.uuid==obj._object3d_uuid);
            if (x_object && (x_object.parent_bone_list?.length == 1)) {
              x_object.parent_bone_list = [x_object.parent_bone];
            }
          }
          else {
            obj._object3d_uuid = object3d_list[object3d_list.length-1].uuid;
          }

          show_status('✅"' + filename + '"' + ((_no_clone) ? ' (updated)' : ''));
          check_loaded(1);
        }
      }
    }

    const settings = json.XR_Animator_scene.settings;
    if (settings) {
      if (settings.explorer_mode?.ground_y != null) {
        explorer_ground_y = settings.explorer_mode.ground_y;
        if (explorer_mode)
          MMD_SA_options.Dungeon.para_by_grid_id[2].ground_y = explorer_ground_y;
      }

      if (settings.camera) {
        if (settings.camera.fov) {
          MMD_SA._trackball_camera.object.fov = settings.camera.fov;
          MMD_SA._trackball_camera.object.updateProjectionMatrix();
        }
      }
    }

    loaded_counting = false;
    check_loaded().then(()=>{
if (MMD_SA.THREEX._XR_Animator_scene_) {
  if (!json.XR_Animator_scene.on) {
    json.XR_Animator_scene.on = MMD_SA.THREEX._XR_Animator_scene_.on;
  }
  else {
    const p_list = {};
    for (const p in json.XR_Animator_scene.on)
      p_list[p] = true;
    for (const p in MMD_SA.THREEX._XR_Animator_scene_.on)
      p_list[p] = true;

    for (const p in p_list)
      json.XR_Animator_scene.on[p] = Object.assign({}, MMD_SA.THREEX._XR_Animator_scene_.on?.[p], json.XR_Animator_scene.on[p]);
  }

  if (!json.XR_Animator_scene.object3D_list) {
    json.XR_Animator_scene.object3D_list = MMD_SA.THREEX._XR_Animator_scene_.object3D_list;
  }
  else {
    json.XR_Animator_scene.object3D_list = [...(MMD_SA.THREEX._XR_Animator_scene_.object3D_list||[]), ...json.XR_Animator_scene.object3D_list];
  }

  if (!json.XR_Animator_scene.auto_fit_list) {
    json.XR_Animator_scene.auto_fit_list = MMD_SA.THREEX._XR_Animator_scene_.auto_fit_list;
  }
  else {
    json.XR_Animator_scene.auto_fit_list = [...(MMD_SA.THREEX._XR_Animator_scene_.auto_fit_list||[]), ...json.XR_Animator_scene.auto_fit_list];
  }

  if (!json.XR_Animator_scene.settings) {
    json.XR_Animator_scene.settings = MMD_SA.THREEX._XR_Animator_scene_.settings;
  }
}

if (json.XR_Animator_scene.on) {
  scene_json_for_export.XR_Animator_scene.on = json.XR_Animator_scene.on;
}
else {
  json.XR_Animator_scene.on = {};
}

if (json.XR_Animator_scene.auto_fit_list) {
  scene_json_for_export.XR_Animator_scene.auto_fit_list = json.XR_Animator_scene.auto_fit_list;
}

if (json.XR_Animator_scene.settings) {
  scene_json_for_export.XR_Animator_scene.settings = settings;
}

MMD_SA.THREEX._XR_Animator_scene_ = json.XR_Animator_scene;

window.dispatchEvent(new CustomEvent("SA_XR_Animator_scene_onload"));
    });

    return promise;
  }

  function show_status(msg, duration=msg_duration) {
    msg_log.push(msg.toString().substring(0,30));
    msg_duration = duration;
    if (msg_log.length > 8) {
      const ini = msg_log.length - 8;
      msg_log = msg_log.slice(ini, ini+8);
    }
    speech_bubble2(msg_log.join('\n'), msg_duration);
  };

  let msg_log = [];
  let msg_duration = 5;

  return async function (e) {
    function reset_UI() {
      if (MMD_SA_options.Dungeon.event_mode)
        document.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape' }));
//      reset_scene_UI();
    }

    let resolve_to_return, return_value;
    e.detail.promises_to_return.push(new Promise((resolve)=>{ resolve_to_return=resolve; }));

    const item = e.detail.item;
    const src = item.path

    msg_log.length = 0;
    msg_duration = 0;

    if (item.isFileSystem && /([^\/\\]+)\.zip$/i.test(src)) {
      let zip_file = SA_topmost_window.DragDrop._path_to_obj && SA_topmost_window.DragDrop._path_to_obj[src.replace(/^(.+)[\/\\]/, "")];

      const zip = await new self.JSZip().loadAsync(zip_file);

// will be called, even if content is corrupted

      XMLHttpRequestZIP.zip_by_url(src, zip);

      const scene_list = zip.file(/scene\.json$/i);
      if (scene_list.length) {
        const txt = await scene_list[0].async("text");
        const json = JSON.parse(txt);

        parse_scene(json, src);

        reset_UI();
        return_value = true;
      }
    }
    else if (item.isFileSystem && /([^\/\\]+)\.json$/i.test(src)) {
      if (!webkit_electron_mode) {
        speech_bubble2('NOTE: In browser mode, you need to drop the zip including all assets and "scene.json".', 5);
      }
      else {
        window.addEventListener('SA_dragdrop_JSON', (e)=>{
          const json = e.detail.json;
          if (json.XR_Animator_scene) {
            e.detail.result.return_value = true;
            parse_scene(json, src);

            reset_UI();
          }
        }, {once:true});
      }
    }

    resolve_to_return(return_value);
  };
})();

window.addEventListener('SA_Dungeon_onstart', ()=>{
  window.addEventListener('SA_dragdrop_start', onDrop_scene_JSON);
});

function export_scene_JSON(para) {
  DEBUG_show('(Scene export is removed from this build.)', 4);
  return;

  const scene_json = {};

  const object3D_list_json = scene_json.object3D_list = [];
  (!para?.includes || para.includes.object3d) && object3d_list.forEach(obj=>{
    const mesh = obj._obj;
    const ds = obj.user_data._default_state_;

    const obj_json = { type:'object3D', path:obj.user_data.path.replace(/(\.zip)\#[^\#]+$/i, '$1') };
    const model_para = obj_json.model_para = {};
    if (obj.object_detection)
      model_para.object_detection = obj.object_detection;
    if (obj.VMC_tracker_index != null)
      model_para.VMC_tracker_index = obj.VMC_tracker_index;
    const placement = model_para.placement = (obj.placement?.scale_offset) ? { scale:obj.placement.scale, scale_offset:obj.placement.scale_offset } : { scale:mesh.scale.x };

    if (obj.parent_bone) {
      if (!obj.parent_bone_list) obj.parent_bone_list = [];
      obj.parent_bone_list[0] = obj.parent_bone;

      const parent_bone_list = [];
      obj.parent_bone_list.forEach(parent_bone=>{
        const pb = { model_index:0, is_T_pose:MMD_SA.THREEX.get_model(0).is_T_pose, name:parent_bone.name, position:parent_bone.position, rotation:parent_bone.rotation };
        if (parent_bone.disabled)
          pb.disabled = true;
        parent_bone_list.push(pb);

        const accessory = parent_bone.accessory_data;

        if (accessory) {
          const transform = accessory.transform = {};

          if (accessory.scale_base)
            transform.scale_percent = placement.scale / accessory.scale_base * 100;

          const pos = MMD_SA.TEMP_v3.copy(parent_bone.position).multiplyScalar(1/MMD_SA.THREEX.VRM.vrm_scale);
          transform.position = { x:-pos.x, y:pos.y, z:-pos.z };

          const rot = MMD_SA.TEMP_v3.copy(parent_bone.rotation);
          if (accessory.euler_order && (accessory.euler_order != 'YXZ')) {
            rot.multiplyScalar(Math.PI/180);
            const q = MMD_SA.TEMP_q.setFromEuler(rot, accessory.euler_order);
            rot.setEulerFromQuaternion(q, 'YXZ');
            rot.multiplyScalar(180/Math.PI);
          }
          transform.rotation = { x:-rot.x, y:rot.y, z:-rot.z };
          for (const p of ['x','y','z']) {
            if (transform.rotation[p] < 0)
              transform.rotation[p] += 360;
          }

          pb.accessory_data = accessory;
        }
      });

      model_para.parent_bone = parent_bone_list[0];
      if (parent_bone_list.length > 1)
        model_para.parent_bone_list = parent_bone_list;
    }
    else {
      const c_pos = MMD_SA.THREEX._THREE.MMD.getModels()[0].mesh.position;
      const pos = v3a.copy(mesh.position).sub(c_pos);
      placement.position = { x:pos.x, y:pos.y, z:pos.z };

      const rot = e1.copy(obj.user_data._rotation_).multiplyScalar(180/Math.PI);
      placement.rotation = { x:Math.round(rot.x), y:Math.round(rot.y), z:Math.round(rot.z) };
    }

    object3D_list_json.push(obj_json);
  });

  if ((!para?.includes || para.includes.wallpaper) && wallpaper_src) {
    scene_json.wallpaper = { path:wallpaper_src, color:document.body.style.backgroundColor };
    if (para?.includes?.wallpaper)
      scene_json.wallpaper.wallpaper_only = true;
    if (MMD_SA.Wallpaper3D.visible)
      scene_json.wallpaper.settings_3d = Object.assign({}, MMD_SA.Wallpaper3D.options_by_filename[wallpaper_src.replace(/^.+[\/\\]/, '')]);
  }
  else if (LdesktopBG_host.style.display == 'none') {
    scene_json.wallpaper = { color:document.body.style.backgroundColor };
  }

  if ((!para?.includes || para.includes.panorama) && (panorama_index != null)) {
    scene_json.panorama = {
      index: panorama_index,
      axis_angle: dome_axis_angle,
      rotation_speed: dome_rotation_speed,
    };
    if (panorama_index == 0)
      scene_json.panorama.path = panorama_src;
  }

  const HDRI_path = MMD_SA.THREEX.utils.HDRI.path;
  if ((!para?.includes || para.includes.HDRI) && HDRI_path) {
    let HDRI_filename = HDRI_path.replace(/^.+[\/\\]/, '');
    let HDRI_index = ((HDRI_path != HDRI_filename) && (HDRI_list.indexOf(HDRI_filename)+1)) || null;
    scene_json.HDRI = {
      index: HDRI_index,
      use_background: !!MMD_SA.THREEX.scene.background,
      mode: MMD_SA.THREEX.utils.HDRI.mode,
      intensity: MMD_SA.THREEX.scene.environmentIntensity,
      axis_angle: dome_axis_angle,
      rotation_speed: dome_rotation_speed,
    };
    if (!HDRI_index)
      scene_json.HDRI.path = MMD_SA.THREEX.utils.HDRI.path;
  }

  scene_json.settings = {};
  if (!para?.includes || para.includes.settings) {
    scene_json.settings = Object.assign(scene_json.settings, scene_json_for_export.XR_Animator_scene.settings||{});
    scene_json.settings.explorer_mode = {
      ground_y: explorer_ground_y,
    };
    delete scene_json_for_export.XR_Animator_scene.settings;

    Object.assign(scene_json, scene_json_for_export.XR_Animator_scene);
  }

  System._browser.save_file('scene.json', JSON.stringify({ XR_Animator_scene:scene_json }, null, '\t'), 'application/json');
}

var v3a, v3b;
var e1, e2;
var q1, q2;
window.addEventListener('jThree_ready', ()=>{
  const THREE = MMD_SA.THREEX.THREE;
  v3a = new THREE.Vector3();
  v3b = new THREE.Vector3();
  e1 = new THREE.Euler();
  e2 = new THREE.Euler();
  q1 = new THREE.Quaternion();
  q2 = new THREE.Quaternion();

  MMD_SA.THREEX.utils.camera_auto_targeting({
    id:'face',
// use .condition instead of .enabled to save some headaches when .camera_face_locking can change at any time
//    enabled: MMD_SA_options.camera_face_locking,
    condition: ()=>{
return MMD_SA_options.camera_face_locking || ((MMD_SA_options.camera_face_locking !== false) && !explorer_mode && !MMD_SA_options.Dungeon_options.item_base.hand_camera._hand_camera_active && MMD_SA_options.Dungeon.started && (MMD_SA.Wallpaper3D?.visible || MMD_SA_options.mesh_obj_by_id["DomeMESH"]?._obj?.visible || (MMD_SA.THREEX.enabled && MMD_SA.THREEX.scene.background) || object3d_list.some(obj=>!obj.parent_bone)) && !MMD_SA.THREEX._THREE.MMD.getCameraMotion().length);
    },
  });

//  MMD_SA_options._XRA_export_scene_JSON = export_scene_JSON;
});


function ML_off() {
  MMD_SA.WebXR.user_camera.facemesh.enabled = false;
  MMD_SA.WebXR.user_camera.poseNet.enabled = false;
  MMD_SA.WebXR.user_camera.handpose.enabled = false;
}

function mirror_3D_off() {
  if (MMD_SA_options.user_camera.mirror_3D) {
    System._browser.camera.hide()
    MMD_SA_options.user_camera.mirror_3D = 0
    System._browser.camera.show()
  }
}

var bg_state_default, bg_color_default, bg_wallpaper_default, webcam_as_bg_default;
var _onDrop_finish;

window.addEventListener('jThree_ready', (e)=>{
  LdesktopBG_host.style.display = "none";
  document.body.style.backgroundColor = "#000000";
  LdesktopBG.style.backgroundImage = "none";
  MMD_SA_options.user_camera.display.webcam_as_bg = false;

  bg_state_default = LdesktopBG_host.style.display;
  bg_color_default = document.body.style.backgroundColor;
  bg_wallpaper_default = LdesktopBG.style.backgroundImage;
  webcam_as_bg_default = !!MMD_SA_options.user_camera.display.webcam_as_bg;

  _onDrop_finish = DragDrop._ondrop_finish;
});

var explorer_ground_y = 0;

function reset_scene_explorer(enforced) {
  if (explorer_mode && !enforced) return;

  explorer_mode = false;
  MMD_SA_options.user_camera.ML_models.look_at_screen = null;

  MMD_SA_options.Dungeon._states.action_allowed_in_event_mode = false;
  MMD_SA_options.Dungeon_options.character_movement_disabled = true;

  if (MMD_SA_options.Dungeon_options.camera_position_z_sign != 1) {
    MMD_SA_options.Dungeon_options.camera_position_z_sign = 1;
    MMD_SA_options.Dungeon.update_camera_position_base();

    const c = MMD_SA_options.Dungeon.character;
    if (c.about_turn) {
      c.about_turn = false;
      c.rot.y += Math.PI;
    }
    c.pos_update();
  }

  MMD_SA_options.Dungeon.para_by_grid_id[2].ground_y = THREE.MMD.getModels()[0].mesh.position.y;//.ground_y_visible

  object3d_list.forEach(object3d=>{
    object3d.no_collision = true;
  });
}

var outline_para = {
  thickness: 0.01,
  color: [ 1, 1, 1 ],
  alpha: 0.8,
  visible: true,
};

function highlight_object(obj) {
  if (!MMD_SA.THREEX.enabled) return;

  MMD_SA.THREEX.use_OutlineEffect = true;

  clear_highlight();

  if (obj.user_data.highlighted) return;
  obj.user_data.highlighted = true;

  obj._obj.traverseVisible(obj=>{
    if (obj.isMesh) {
      obj.userData.outlineParameters = { visible:true };
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m=>{
          m.userData.outlineParameters = outline_para;
        });
      }
      else {
        obj.material.userData.outlineParameters = outline_para;
      }
    }
  });
}

function clear_highlight() {
  if (!MMD_SA.THREEX.enabled) return;

  object3d_list.forEach(obj=>{
    if (!obj.user_data.highlighted) return;
    obj.user_data.highlighted = false;

    obj._obj.traverseVisible(obj=>{
      if (obj.isMesh && obj.userData.outlineParameters)
        obj.userData.outlineParameters.visible = false;
    });
  });
}

function reset_scene_UI() {
  reset_scene_explorer();

  clear_highlight();
  MMD_SA.THREEX.use_OutlineEffect = false;

  DragDrop.onDrop_finish = _onDrop_finish;
  for (const json_func of [onDrop_JSON_change_facemesh_calibration])
    window.removeEventListener('SA_dragdrop_JSON', json_func);
  window.removeEventListener('SA_keydown', adjust_object3D);

  System._browser.camera._info = '';
  Ldebug.style.transformOrigin = Ldebug.style.transform = '';
  DEBUG_show();
  if (grid_plane) {
    grid_plane.visible = false;
    grid_plane.children.forEach(c=>c.visible=false);
  }
}

function reset_scene(keep_background) {
  if (!keep_background) {
    const v_bg = document.getElementById("VdesktopBG");
    if (v_bg) {
      v_bg.pause();
      v_bg.style.visibility = 'hidden';
    }

    MMD_SA.Wallpaper3D.visible = false;

    LdesktopBG_host.style.display = bg_state_default;
    document.body.style.backgroundColor = bg_color_default;
    LdesktopBG.style.backgroundImage = bg_wallpaper_default;
    MMD_SA_options.user_camera.display.webcam_as_bg = webcam_as_bg_default;

    remove_skybox();
    remove_HDRI();
  }

  remove_object3D();

  scene_json_for_export.XR_Animator_scene = {};
  MMD_SA.THREEX._XR_Animator_scene_ = null;

  System._browser.camera.update_display_floating();

  window.dispatchEvent(new CustomEvent("SA_XR_Animator_scene_onunload"));
}

var _overlay_mode = -1;

var bg_branch = 5;
var done_branch = bg_branch + 6;//11
var panorama_branch = done_branch + 1;//12
var object3D_branch = panorama_branch + 6;//18
var about_branch = object3D_branch + 3;//21
var export_motion_branch = about_branch + 1;//22
var other_options_branch = export_motion_branch + 1;//23
var record_motion_branch = export_motion_branch + 3;//25
var mocap_options_branch = MMD_SA_options._mocap_options_branch_ = record_motion_branch + 4;//29
var facemesh_options_branch = mocap_options_branch + 5;//34
var motion_control_branch = facemesh_options_branch + 6;//40


// --- Expose scope for branch files ---
window._FMO = {
  // Branch index constants
  bg_branch, done_branch, panorama_branch, object3D_branch, about_branch,
  other_options_branch, record_motion_branch, mocap_options_branch, facemesh_options_branch, motion_control_branch,

  // Functions
  onDrop_change_panorama, onDrop_JSON_change_facemesh_calibration, animate_object3D, adjust_object3D,
  build_octree, add_grid, change_panorama, rotate_dome,
  remove_skybox, change_HDRI, remove_HDRI, ML_off,
  mirror_3D_off, reset_scene_explorer, reset_scene_UI, reset_scene,
  onDrop_add_object3D,

  // Shared objects
  HDRI_list, object3d_cache,

  // Mutable state (getter/setter for cross-file access)
  get wallpaper_dialog_enabled() { return wallpaper_dialog_enabled; },
  set wallpaper_dialog_enabled(v) { wallpaper_dialog_enabled = v; },
  get wallpaper_generator_dialog_enabled() { return wallpaper_generator_dialog_enabled; },
  set wallpaper_generator_dialog_enabled(v) { wallpaper_generator_dialog_enabled = v; },
  get explorer_mode() { return explorer_mode; },
  set explorer_mode(v) { explorer_mode = v; },
  get dome_axis_angle() { return dome_axis_angle; },
  set dome_axis_angle(v) { dome_axis_angle = v; },
  get dome_rotation_speed() { return dome_rotation_speed; },
  set dome_rotation_speed(v) { dome_rotation_speed = v; },
  get _overlay_mode() { return _overlay_mode; },
  set _overlay_mode(v) { _overlay_mode = v; },
  get object3d_index() { return object3d_index; },
  set object3d_index(v) { object3d_index = v; },
  get explorer_ground_y() { return explorer_ground_y; },
  get bg_state_default() { return bg_state_default; },
  get bg_color_default() { return bg_color_default; },
  get bg_wallpaper_default() { return bg_wallpaper_default; },
  get webcam_as_bg_default() { return webcam_as_bg_default; },
  get _onDrop_finish() { return _onDrop_finish; },
  get object3d_list() { return object3d_list; },
  set object3d_list(v) { object3d_list = v; },

  // Branch assembly
  branches: [],
};
})();
