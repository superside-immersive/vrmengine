// Wallpaper3D — extracted from MMD_SA.js
// Original: MMD_SA.Wallpaper3D IIFE

window.MMD_SA_createWallpaper3D = function () {
  let img, video;
  let canvas_tex, canvas_depth, canvas_depth_transformed, canvas_depth_effect, canvas_img, canvas_temp1;
  let transformers_worker;
  let ar;
  let camera_factor = 1;
  let d_to_full_screen;

  let update_depth_transform_timerID;

  let resolve_loaded;

  let _access_general_options_only_;

  let enabled = true;

  const depth_model_name = {
'onnx-community/depth-anything-v2-small': 'Depth Anything v2 small',
'onnx-community/depth-anything-v2-base' : 'Depth Anything v2 base',
'onnx-community/depth-anything-v2-large': 'Depth Anything v2 large',
  };

  const SR_model_name = {
'Xenova/swin2SR-lightweight-x2-64': 'Swin2SR x2 lite',
'Xenova/swin2SR-classical-sr-x4-64': 'Swin2SR x4',
'Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr' : 'Swin2SR x4 PSNR',
  };

  function update_depth(time=500) {
if (!_wallpaper_3D.depth_map_ready) return;

if (update_depth_transform_timerID) clearTimeout(update_depth_transform_timerID);
update_depth_transform_timerID = setTimeout(()=>{
  update_depth_transform_timerID = null;

  _wallpaper_3D.update_transform();
  _wallpaper_3D.update_mesh();
}, time);
  }

  window.addEventListener('SA_MMD_SL_resize', ()=>{ update_depth(100); });
  window.addEventListener('SA_MMD_camera_FOV_on_change', ()=>{ update_depth(100); });

  const depth_effect = (()=>{
    let enabled = false;

    let effect_obj;

    let busy;

    let img, video;

    let resolve_video_loaded;

    function apply_effect() {
_depth_effect.apply();
    }

    function update_video_frame() {
video.requestVideoFrameCallback(update_video_frame);
_depth_effect.needsUpdate = true;
    }

    const _depth_effect = {
      get enabled() { return enabled; },
      set enabled(v) {
if (!!v == !!enabled) return;

enabled = v;
if (enabled) {
  this.update_depth();
}
      },

      get ready() { return this.enabled && !busy && effect_obj && _wallpaper_3D.depth_map_ready; },

      needsUpdate: false,

      type: '',

      update_depth: function () {
if (!this.ready) return;

let ctx;

canvas_depth_effect.width  = canvas_depth.width;
canvas_depth_effect.height = canvas_depth.height
ctx = canvas_depth_effect.getContext('2d');
ctx.filter = 'brightness(300%) invert(100%) brightness(75%)';
ctx.drawImage(canvas_depth, 0,0);
ctx.filter = 'none';

  // CONV. STEP: move a component channel to alpha-channel
const idata = ctx.getImageData(0, 0, canvas_depth_effect.width, canvas_depth_effect.height);
const data32 = new Uint32Array(idata.data.buffer);
let i = 0, len = data32.length;
while(i < len) {
  data32[i] = data32[i++] << 8; // shift blue channel into alpha (little-endian)
}
// update canvas
ctx.putImageData(idata, 0, 0);

this.needsUpdate = true;
      },

      load: async function (src) {
if (busy) return;

busy = true;

if (/([^\/\\]+)\.(png|jpg|jpeg|bmp|webp)$/i.test(src)) {
  this.type = 'image';

  if (video) video.pause();

  if (!img) {
    img = new Image();
  }
  effect_obj = img;

  await new Promise((resolve)=>{
    effect_obj.onload = ()=>{ resolve(); };
    effect_obj.src = toFileProtocol(src);
  });
}
else if (/([^\/\\]+)\.(mp4|mkv|webm)$/i.test(src)) {
  this.type = 'video';

  if (!video) {
    video = document.createElement('video');
    video.autoplay = true;
    video.loop = true;
    video.addEventListener('canplay', ()=>{ resolve_video_loaded(); });
    video.requestVideoFrameCallback(update_video_frame);
  }
  effect_obj = video;

  await new Promise((resolve)=>{
    resolve_video_loaded = resolve;
    effect_obj.src = toFileProtocol(src);
  });
}

this.needsUpdate = true;

System._browser.on_animation_update.remove(apply_effect, 0);
System._browser.on_animation_update.add(apply_effect, 0,0,-1);

busy = false;

this.enabled = true;
      },

      stop: function () {
if (!effect_obj) return;

if (this.type == 'video')
  video.pause();

effect_obj = null;

if (_wallpaper_3D.depth_map_ready) {
  canvas_tex.getContext('2d').drawImage(canvas_img, 0,0);
  _wallpaper_3D.mesh.material.map.needsUpdate = true;
}
      },

      apply: function () {
if (!this.ready) return;

if (!this.needsUpdate) {
  if (this.type == 'video') {
    if (!('requestVideoFrameCallback' in video))
      this.needsUpdate = true;
  }
}

if (!this.needsUpdate) return;
this.needsUpdate = false;

let ctx;

canvas_temp1.width  = canvas_depth.width;
canvas_temp1.height = canvas_depth.height
ctx = canvas_temp1.getContext('2d');
ctx.drawImage(canvas_depth_effect, 0,0);

ctx.globalCompositeOperation = "source-in";
ctx.drawImage(effect_obj, 0,0,canvas_temp1.width,canvas_temp1.height);

ctx = canvas_tex.getContext('2d');
ctx.drawImage(canvas_img, 0,0);
//ctx.globalCompositeOperation = 'lighten';
ctx.drawImage(canvas_temp1, 0,0,canvas_tex.width,canvas_tex.height);
//ctx.globalCompositeOperation = 'source-over';

_wallpaper_3D.mesh.material.map.needsUpdate = true;
      }
    };

    return _depth_effect;
  })();

  const _wallpaper_3D = {
    scale_base: 200,
    tex_dim: 2048,
    depth_dim: 512,

    get enabled() { return !!enabled; },
    set enabled(v) {
enabled = !!v;
this.visible = v;

if (v) {
  if (this.is_video && video.paused)
    video.play();
}
    },

    depth_model_name: depth_model_name,
    SR_model_name: SR_model_name,

    depth_effect: depth_effect,

    generate_mesh: function (use_depth_transform_shader=true) {//MMD_SA.THREEX.enabled) {
const THREE = MMD_SA.THREEX.THREE;

const geometry = new THREE.PlaneGeometry(1,1, (this.depth_dim-1),(this.depth_dim-1));

let material;
if (!use_depth_transform_shader) {
  material = new THREE.MeshBasicMaterial( { map:this.texture, fog:false } );
}
else {
  let vertexShader;
  if (MMD_SA.THREEX.enabled) {
    vertexShader = THREE.ShaderLib.basic.vertexShader.replace(
'void main() {',
[
  'uniform sampler2D Wallpaper3D_displacementMap;',
  'uniform float Wallpaper3D_camera_factor;',
  'uniform float Wallpaper3D_camera_distance_offset;',
  'uniform float Wallpaper3D_scale_z;',
  'uniform vec3 Wallpaper3D_pos_offset;',
//  'uniform mat4 Wallpaper3D_modelViewMatrix;',

  'void main() {',
].join('\n')
  ).replace(
'#include <project_vertex>',
[
  'float _depth = texture2D( Wallpaper3D_displacementMap, vMapUv ).x;',
  'float _depth_factor = max((1.0 - _depth) * (1.0 - Wallpaper3D_pos_offset.z) * Wallpaper3D_scale_z + (Wallpaper3D_camera_distance_offset + Wallpaper3D_pos_offset.z * Wallpaper3D_scale_z), Wallpaper3D_camera_distance_offset) * Wallpaper3D_camera_factor;',
  'transformed.xy += Wallpaper3D_pos_offset.xy;',
  'transformed.xy *= _depth_factor;',
  'transformed.z += _depth;',

  '#include <project_vertex>',
].join('\n')	
    );
  }

  const uniforms = (MMD_SA.THREEX.enabled) ? THREE.UniformsUtils.clone(THREE.ShaderLib.basic.uniforms) : {};

  canvas_depth_transformed.width = canvas_depth_transformed.height = this.depth_dim;
  uniforms.Wallpaper3D_displacementMap = { value:new THREE.Texture(canvas_depth_transformed) };
  uniforms.Wallpaper3D_camera_factor = { get value() { return camera_factor; } };
  uniforms.Wallpaper3D_camera_distance_offset = { get value() { return (MMD_SA_options.camera_position_base[2] + MMD_SA.center_view[2]) / _wallpaper_3D.scale_base; } };
  uniforms.Wallpaper3D_scale_z = { get value() { return _wallpaper_3D.options.scale_z_percent/100; } };
  uniforms.Wallpaper3D_pos_offset = (()=>{
    let update_timestamp = 0;
    const pos = new THREE.Vector3();

    return {
      get value() {
if (update_timestamp != RAF_timestamp) {
  update_timestamp = RAF_timestamp;

  let pos_x_offset_percent = _wallpaper_3D.options.pos_x_offset_percent;
  let pos_y_offset_percent = _wallpaper_3D.options.pos_y_offset_percent;
  let pos_z_offset_percent = _wallpaper_3D.options.pos_z_offset_percent;

  pos.set(pos_x_offset_percent/100, pos_y_offset_percent/100, pos_z_offset_percent/100);
}
return pos;
      }
    }
  })();

  if (!MMD_SA.THREEX.enabled) {
    uniforms.Wallpaper3D_displacementMap.type = 't';
    uniforms.Wallpaper3D_camera_factor.type = 'f';
    uniforms.Wallpaper3D_camera_distance_offset.type = 'f';
    uniforms.Wallpaper3D_scale_z.type = 'f';
    uniforms.Wallpaper3D_pos_offset.type = 'v3';
  }

  if (MMD_SA.THREEX.enabled) {
    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: THREE.ShaderLib.basic.fragmentShader,
      uniforms: uniforms
    });
    material.color = new THREE.Color( 0xffffff );
    material.isMeshBasicMaterial = true;

// https://stackoverflow.com/questions/77534730/the-fps-reduced-to-half-when-i-set-the-encoding-of-a-realtime-updated-texture-to
    material.onBeforeCompile = function ( shader ) {
      shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <map_fragment>',
                            `
              #ifdef USE_MAP
              
                 vec4 sampledDiffuseColor = texture2D( map, vMapUv );
              
                 // inline sRGB decode
                 sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.a );

                diffuseColor *= sampledDiffuseColor;

              #endif

                            `
      );
    };
  }
  else {
    material = new THREE.MeshBasicMaterial({});
    material.XRA_WALLPAPER_3D = true;
    material._uniforms_append = uniforms;
/*
    material = new THREE.ShaderMaterial({
      vertexShader: THREE.ShaderLib.basic.vertexShader,
      fragmentShader: THREE.ShaderLib.basic.fragmentShader,
      uniforms: uniforms
    });
*/
console.log(material)
  }

  material.color = new THREE.Color( 0xffffff );
  material.map = this.texture;
  material.fog = false;
}

const mesh = new THREE.Mesh( geometry, material )
mesh.userData.use_depth_transform_shader = use_depth_transform_shader;

return mesh;
    },

    generate_depth_map: async function (src) {
await this.init_worker();

let img = src;
if (typeof img == 'string') {
  img = new Image();
  await new Promise((resolve)=>{
    img.onload = function () {
      resolve();
    };
    img.src = toFileProtocol(src);
  });
}

let w = img.width;
let h = img.height;

const bitmap = await createImageBitmap(img);

const options = {
  depth:{
    enabled: true,
    model: this.options.depth_model,
    get_map_only: true,
  },
  SR:{
    model: this.options.SR_model,
  },
};

//options.SR.enabled = this.options.SR_mode && (((w < 1280) || (h < 720)) && (w*h < 1920*1080));

let data = { rgba:bitmap, width:w, height:h, options:options };
transformers_worker.postMessage(data, [data.rgba]);

data = data.rgba = undefined;

return new Promise((resolve)=>{
  resolve_loaded = resolve;
});
    },

    converter: (()=>{
      let c_img;

      let running, paused, stopping;
      let stage;
      let resolve_paused;

      let fs, spawn, execSync;
      let cp;
      let resolve_cp;

      let converter_image_format, converter_image_quality;

      async function ffmpeg(path, args) {
return new Promise((resolve)=>{
  resolve_cp = resolve;

  try {
    cp = spawn(
      toLocalPath(path + '/ffmpeg'),//(linux_mode) ? toLocalPath(path + '/ffmpeg') : 'ffmpeg',
      args,
      {
        cwd: path
      }
    );

    const log = [];
    cp.stderr.on('data', (data) => {
      data = data.toString();
      log.push(data);
      if (/^frame\=\s*(\d+).+speed\=([\d\.]+)x/i.test(data)) {
        MMD_SA_options._Wallpaper3D_status2_ = ((stage == 0) ? 'Decoding' : 'Encoding') + ' (frame=' + RegExp.$1 + '/speed=' + parseFloat(RegExp.$2).toFixed(1) + 'x)';
      }
    });

    cp.on('close', (code) => {
      if (code) {
        console.error('FFMPEG decoding failed', log);
      }
      cp = resolve_cp = undefined;
      resolve(!code);
    });
  }
  catch (err) {
    console.error(err);
    cp = resolve_cp = undefined;
    resolve(false);
  }
});
      }

      async function process_image(src, is_folder) {
const items = (is_folder) ? Shell_ReturnItemsFromFolder(src, { skip_subfolder:true, skip_link:true, RE_items:/\.(png|jpg|jpeg|bmp|webp)$/i }) : [{ path:src, path_file:toFileProtocol(src) }];

if (is_folder) {
  let dir_path = toLocalPath(src + '/_XRA_');
  try {
    if (!fs.existsSync(dir_path))
      fs.mkdirSync(dir_path);
  }
  catch (err) {
    running = false;
    MMD_SA_options._Wallpaper3D_status2_ = '❌ERROR: Failed to create folder';
    console.error(err);
    return;
  }
}

const i_max = items.length;
let i;
for (i = 0; i < i_max; i++) {
  if (paused) {
    await new Promise((resolve)=>{
      resolve_paused = resolve;
    });
  }

  if (stopping) break;

  const item = items[i];

  let path_to_write;
  if (is_folder) {
    path_to_write = toLocalPath(src + '/_XRA_/xra-3d-wallpaper_' + item.path.replace(/^.+[\/\\]/, '').replace(/\.(\w+)$/, '') + '.' + converter_image_format.replace('jpeg', 'jpg'));
    if (fs.existsSync(path_to_write)) continue;
  }

  MMD_SA_options._Wallpaper3D_status2_ = 'Processing depth (image ' + (i+1) + '/' + i_max + ')';

  const img = new Image();
  await new Promise((resolve)=>{
    img.onload = function () {
      resolve();
    };
    img.src = item.path_file;
  });

  let w = img.width;
  let h = img.height;

  let image_data = await _wallpaper_3D.generate_depth_map(img);

  let ctx;

  canvas_temp1 = canvas_temp1 || document.createElement('canvas');

  canvas_temp1.width  = image_data.width;
  canvas_temp1.height = image_data.height;
  ctx = canvas_temp1.getContext('2d');
  ctx.putImageData(image_data, 0,0);

  if (options.downscale_allowed) {
    w = image_data.width;
    h = image_data.height;
  }

  c_img = c_img || document.createElement('canvas');

  c_img.width  = w*2;
  c_img.height = h;
  ctx = c_img.getContext('2d');
  ctx.drawImage(img, 0,0,img.width,img.height, 0,0,w,h);
  ctx.drawImage(canvas_temp1, 0,0,canvas_temp1.width,canvas_temp1.height, w,0,w,h);

  if (is_folder) {
    await new Promise((resolve)=>{
      c_img.toBlob(
async (blob)=>{
  const b = Buffer.from(await blob.arrayBuffer());
  try {
    fs.writeFileSync(path_to_write, b);
  }
  catch (err) {
    console.error(err);
  }

  resolve();
},
'image/' + converter_image_format,
(converter_image_format == 'png') ? 1 : converter_image_quality/100,
      );
    });
  }
  else {
    System._browser.save_file('xra-3d-wallpaper_' + item.path.replace(/^.+[\/\\]/, '').replace(/\.\w+$/, '') + '.png', c_img.toDataURL('image/png'), 'Data URL');
  }
}

MMD_SA_options._Wallpaper3D_status2_ = (stopping) ? '🛑Some images processed (' + (i+1) + '/' + i_max + ')' : '✔️All images processed (' + i_max + '/' + i_max + ')';

_wallpaper_3D.end_worker();

return true;
      }

      const _converter = {
        get running() { return running; },

        get stage() { return (running) ? stage : -1; },

        start: async function (src, is_folder, options={}) {
if (running) {
  MMD_SA_options._Wallpaper3D_status2_ = 'Existing conversion still in progress';
  return;
}

running = true;
paused = false;
stopping = false;

stage = -1;

resolve_paused = null;

if (webkit_electron_mode && !fs) {
  try {
    fs = SA_require('fs');
    ({ spawn, execSync } = SA_require('child_process'));
  }
  catch (err) {
    running = false;
    MMD_SA_options._Wallpaper3D_status2_ = '❌ERROR: Failed to initialize';
    console.error(err);
    return;
  }
}

let is_video;
let session, session_to_save;
if (!src) {
  session = session_to_save = _wallpaper_3D.options.converter_session;
  src = session.src;

  try {
    if (!fs.existsSync(src))
      src = null;
  }
  catch (err) {
    src = null;
  }

  if (!src) {
    running = false;
    _wallpaper_3D.options.converter_session = null;
    MMD_SA_options._Wallpaper3D_status2_ = '❌Last session not found';
    return;
  }

  is_folder = session.is_folder;
  is_video = session.is_video;
  converter_image_format  = session.converter_image_format  || _wallpaper_3D.options.converter_image_format;
  converter_image_quality = session.converter_image_quality || _wallpaper_3D.options.converter_image_quality;
}
else {
  is_video = !is_folder && /\.(mp4|mkv|webm|mov)$/i.test(src);

  converter_image_format  = _wallpaper_3D.options.converter_image_format;
  converter_image_quality = _wallpaper_3D.options.converter_image_quality;

  _wallpaper_3D.options.converter_session = null;

  session_to_save = {
    src, is_folder, is_video, converter_image_format, converter_image_quality
  };
}

MMD_SA_options._Wallpaper3D_status2_ = (session) ? 'Resuming from last session...' : 'Starting...';
await new Promise((resolve)=>{
  System._browser.on_animation_update.add(resolve, 1,0);
});

let ffmpeg_path;
let src_folder;
if (is_video) {
  stage = 0;

  ffmpeg_path = toLocalPath(System.Gadget.path.replace(/[^\/\\]+$/, '') + '/accessories/ffmpeg');

  if (!session) {
    if (linux_mode) {
      try {
        const ffmpeg = toLocalPath(ffmpeg_path + '/ffmpeg');
        try {
          fs.accessSync(ffmpeg, fs.constants.X_OK);
        }
        catch (err) {
          execSync('chmod +x "' + ffmpeg + '"');
        }
      }
      catch (err) {
        running = false;
        MMD_SA_options._Wallpaper3D_status2_ = '❌ERROR: Failed to execute FFmpeg';
        console.error(err);
        return;
      }
    }

    let dir_path = toLocalPath(ffmpeg_path + '/TEMP');
    try {
      if (fs.existsSync(dir_path)) {
        fs.rmSync(dir_path, { recursive: true, force: true });
      }
      fs.mkdirSync(dir_path);
    }
    catch (err) {
      running = false;
      MMD_SA_options._Wallpaper3D_status2_ = '❌ERROR: Failed to create folder';
      console.error(err);
      return;
    }

    let result0 = await ffmpeg(ffmpeg_path, [
'-i', src, '-vf', 'fps=30, scale=if(gte(iw\\,ih)\\,min(1920\\,iw)\\,-2):if(lt(iw\\,ih)\\,min(1920\\,ih)\\,-2)', '-qscale:v', '2', 'TEMP/output_%05d.' + ((converter_image_format == 'png') ? 'png' : 'jpg')
    ]);

    if (!result0) {
      running = false;
      MMD_SA_options._Wallpaper3D_status2_ = (stopping) ? '🛑Decoding stopped' :  '❌Decoding ERROR (check console)';
      return;
    }

    MMD_SA_options._Wallpaper3D_status2_ = '✔️Decoding finished';
  }

  src_folder = toLocalPath(ffmpeg_path + '/TEMP');
  is_folder = true;
}
else {
  src_folder = src;
}

_wallpaper_3D.options.converter_session = session_to_save;

stage = 1;
let result1 = await process_image(src_folder, is_folder);

if (result1 && is_video && !stopping) {
  stage = 2;

  const output_file = src.replace(/([^\/\\]+)\.\w+$/, 'xra-3d-wallpaper_$1.mp4');

  try {
    if (fs.existsSync(output_file)) {
      fs.unlinkSync(output_file);
    }

    let result2 = await ffmpeg(ffmpeg_path, [
'-framerate', '30', '-i', 'TEMP/_XRA_/xra-3d-wallpaper_output_%05d.' + converter_image_format.replace('jpeg','jpg'), '-c:v', 'libx264', '-r', '30', '-pix_fmt', 'yuv420p', '-b:v', '15M', output_file
    ]);

    if (!result2) {
      running = false;
      MMD_SA_options._Wallpaper3D_status2_ = (stopping) ? '🛑Encoding stopped' :  '❌Encoding ERROR (check console)';
      return;
    }

//    const output_path = src.replace(/[\/\\][^\/\\]+$/, '');
    MMD_SA_options._Wallpaper3D_status2_ = '✔️Finished';
  }
  catch (err) {
    running = false;
    MMD_SA_options._Wallpaper3D_status2_ = '❌ERROR: Failed to output file';
    console.error(err);
    return;
  }
}

if (!stopping)
  _wallpaper_3D.options.converter_session = null;

running = false;

// refresh branch options on speech bubble dialog
MMD_SA_options._Wallpaper3D_status2_ = MMD_SA_options._Wallpaper3D_status2_;
        },

        pause: function () {
if (!running) {
  MMD_SA_options._Wallpaper3D_status2_ = 'No conversion in progress';
}
else if (stage != 1) {
  MMD_SA_options._Wallpaper3D_status2_ = 'No pausing in this stage';
}
else if (!paused) {
  paused = true;
  MMD_SA_options._Wallpaper3D_status2_ = '⏸️Conversion PAUSED';
}
else {
  paused = false;
  if (resolve_paused) {
    resolve_paused();
    resolve_paused = null;
  }
}
        },

        play: function () {
if (paused) this.pause();
        },

        stop: function () {
if (!running) {
  MMD_SA_options._Wallpaper3D_status2_ = 'No conversion in progress';
}
else {
  stopping = true;

  if (stage == 1) {
    MMD_SA_options._Wallpaper3D_status2_ = 'Stopping conversion...';
    this.play();
  }
  else {
    if (cp) {
      try {
        cp.kill();
      }
      catch (err) {
        MMD_SA_options._Wallpaper3D_status2_ = '❌ERROR: Failed to kill FFmpeg process';
        console.error(err);
      }

      resolve_cp(false);
      cp = resolve_cp = undefined;
    }
  }
}
        },
      };

      return _converter;
    })(),

    end_worker: function () {
if (transformers_worker && !this.options.keeps_worker_thread) {
  transformers_worker.terminate();
  transformers_worker = null;
}
    },

    init_worker: async function () {
if (transformers_worker) return;

return new Promise((resolve)=>{
//  MMD_SA_options._Wallpaper3D_status_ = '(🌐Loading Transformers.js...)';
  transformers_worker = new Worker('js/transformers_worker.js', {type: 'module'});

  transformers_worker.onmessage = (e)=>{
    if (typeof e.data == 'string') {
      if (e.data == 'OK') {
        resolve();
      }
      else {
        MMD_SA_options._Wallpaper3D_status_ = e.data;
      }
    }
    else {
      let img_raw = new Uint8ClampedArray(e.data.depth_rgba);
      let image_data = new ImageData(e.data.depth_width, e.data.depth_height);
      for (let i = 0, i_max = image_data.data.length/4; i < i_max; i++) {
        image_data.data[i*4] = image_data.data[i*4+1] = image_data.data[i*4+2] = img_raw[i];
        image_data.data[i*4+3] = 255;
      }
//console.log(image_data);
/*
canvas_tex.depth_width  = e.data.depth_width;
canvas_tex.depth_height = e.data.depth_height;
canvas_tex.getContext('2d').putImageData(image_data, 0,0);
this.mesh.material.map.needsUpdate = true;
*/

      if (e.data.get_map_only) {
        if (resolve_loaded) {
          resolve_loaded(image_data);
          resolve_loaded = null;
        }
        image_data = undefined;
        return;
      }

      let ctx;

      ctx = canvas_tex.getContext('2d');
      if (!e.data.upscaled_rgba) {
        canvas_img.width  = canvas_tex.width;
        canvas_img.height = canvas_tex.height;
        canvas_img.getContext('2d').drawImage(img, 0,0,canvas_tex.width,canvas_tex.height);

        ctx.drawImage(canvas_img, 0,0);
      }
      else {
        canvas_img.width  = e.data.upscaled_width;
        canvas_img.height = e.data.upscaled_height;
        canvas_img.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(e.data.upscaled_rgba), e.data.upscaled_width,e.data.upscaled_height), 0,0);
        System._browser.save_file(this.filename.replace(/\.\w+$/, '') + '_SR.png', canvas_img.toDataURL('image/png'), 'Data URL');

        ctx.drawImage(canvas_img, 0,0,canvas_tex.width,canvas_tex.height);

        canvas_img.width  = canvas_tex.width;
        canvas_img.height = canvas_tex.height;
        canvas_img.getContext('2d').drawImage(canvas_tex, 0,0);
      }

      canvas_depth.width  = e.data.depth_width;
      canvas_depth.height = e.data.depth_height;
      ctx = canvas_depth.getContext('2d');
      ctx.putImageData(image_data, 0,0);

      e.data = e.data.depth_rgba = e.data.upscaled_rgba = img_raw = image_data = undefined;

      this.update_frame_common();

      this.busy = false;

      if (resolve_loaded) {
        resolve_loaded();
        resolve_loaded = null;
      }

      this.end_worker();
    }
  }
});
    },

    update_frame_common: function () {
this.mesh.material.map.needsUpdate = true;
this.update_transform();

this.depth_map_ready = true;
this.mesh.visible = true;
this.update_mesh();

depth_effect.update_depth();

System._browser.camera.display_floating = (MMD_SA_options.user_camera.display.floating_auto !== false);
    },

    update_frame: function (c, w,h) {
let ctx;

if ((canvas_img.width != w) || (canvas_img.height != h)) {
  canvas_img.width  = w;
  canvas_img.height = h;
}
ctx = canvas_img.getContext('2d');
ctx.drawImage(c, 0,0,w,h, 0,0,w,h);

ctx = canvas_tex.getContext('2d');
ctx.drawImage(canvas_img, 0,0,canvas_tex.width,canvas_tex.height);

ctx = canvas_depth.getContext('2d');
if ((canvas_depth.width != w) || (canvas_depth.height != h)) {
  canvas_depth.width  = w;
  canvas_depth.height = h;
  ctx.globalAlpha = 1;
}
else if (c == video) {
  ctx.globalAlpha = 1 - this.options.depth_smoothing_percent/100;
  ctx.globalCompositeOperation = 'source-over';
//DEBUG_show(ctx.globalCompositeOperation+'/'+Date.now())
}
ctx.drawImage(c, w,0,w,h, 0,0,w,h);
ctx.globalAlpha = 1;

this.update_frame_common();
    },

    init: async function () {
await this.init_worker();

if (this.mesh) return;

img = new Image();
canvas_depth = document.createElement('canvas');
canvas_depth_transformed = document.createElement('canvas');
canvas_depth_effect = document.createElement('canvas');
canvas_img = document.createElement('canvas');

canvas_temp1 = canvas_temp1 || document.createElement('canvas');

const THREE = MMD_SA.THREEX.THREE;

canvas_tex = document.createElement('canvas');
canvas_tex.width = canvas_tex.height = this.tex_dim;
canvas_tex.getContext('2d').clearRect(0,0,canvas_tex.width,canvas_tex.height);

this.texture = new THREE.Texture(canvas_tex);

// NOTE: Updating sRGB texture is very slow on some devices. Use inline shader to convert sRGB instead
// https://github.com/mrdoob/three.js/issues/26183
//if (MMD_SA.THREEX.enabled && MMD_SA.THREEX.use_sRGBEncoding) texture.colorSpace = THREE.SRGBColorSpace;

this.mesh = this.mesh_default = this.generate_mesh();

MMD_SA.THREEX.scene.add(this.mesh);

this.mesh.visible = false;

if (!MMD_SA.THREEX.enabled) {
  this.mesh.useQuaternion = true;
  if (MMD_SA.WebXR.ground_plane) MMD_SA.WebXR.ground_plane.visible = false;
  System._browser.camera.poseNet.ground_plane_visible = false;
}
    },

    options_to_save: ['enabled', 'scale_xy_percent', 'scale_z_percent', 'depth_shift_percent', 'depth_contrast_percent', 'depth_blur', 'depth_smoothing_percent', 'pos_x_offset_percent', 'pos_y_offset_percent', 'pos_z_offset_percent', 'depth_model', 'SR_mode', 'SR_model', 'keeps_worker_thread', 'converter_image_format', 'converter_image_quality', 'converter_session'],

    options_by_filename: {},

    options_general: new Proxy({}, {
        get(obj, prop, receiver) {
_access_general_options_only_ = true;
const v = _wallpaper_3D.options[prop];
_access_general_options_only_ = false;

return v;
        },
        set(obj, prop, value) {
_access_general_options_only_ = true;
_wallpaper_3D.options[prop] = value;
_access_general_options_only_ = false;
        }
    }),

    options: (()=>{
      const options_default = {
scale_xy_percent: 110,
scale_z_percent: 100,
depth_shift_percent: 0,
depth_contrast_percent: 0,
depth_blur: 2,
depth_smoothing_percent: 80,
pos_x_offset_percent: 0,
pos_y_offset_percent: 0,
pos_z_offset_percent: 0,

// general options
depth_model: 'onnx-community/depth-anything-v2-small',
SR_mode: 0,
SR_model: 'Xenova/swin2SR-lightweight-x2-64',
keeps_worker_thread: false,
exported_camera_position_y: 0,
exported_camera_position_z: 0,

converter_image_format: 'jpeg',
converter_image_quality: 95,
converter_session: null,
      };

      const options_general = {};

      return new Proxy(options_general, {
        get(obj, prop, receiver) {
if (prop == 'enabled') return _wallpaper_3D.enabled;

switch (prop) {
  case 'depth_model':
  case 'SR_mode':
  case 'SR_model':
  case 'keeps_worker_thread':
  case 'exported_camera_position_y':
  case 'exported_camera_position_z':
  case 'converter_image_format':
  case 'converter_image_quality':
  case 'converter_session':
    return (options_general[prop] == null) ? options_default[prop] : options_general[prop];
}

const options = !_access_general_options_only_ && _wallpaper_3D.options_by_filename[_wallpaper_3D.filename];
return (options?.[prop] != null) ? options[prop] : ((obj[prop] != null) ? obj[prop] : options_default[prop]);
        },

        set(obj, prop, value) {
if (prop == 'enabled') {
  _wallpaper_3D.enabled = value;
  return;
}

switch (prop) {
  case 'depth_model':
  case 'SR_mode':
  case 'SR_model':
  case 'keeps_worker_thread':
  case 'exported_camera_position_y':
  case 'exported_camera_position_z':
  case 'converter_image_format':
  case 'converter_image_quality':
  case 'converter_session':
    options_general[prop] = value;
    return;
}

// no changing settings if depth map is still loading (can change if wallpaper 3D has not been initialized yet)
if (_wallpaper_3D.mesh && !_wallpaper_3D.depth_map_ready) return;

const options = (!_access_general_options_only_ && _wallpaper_3D.options_by_filename[_wallpaper_3D.filename]) || obj;

if (options[prop] == value) return;
options[prop] = value;

switch (prop) {
  case 'scale_xy_percent':
    if (_wallpaper_3D.depth_map_ready)
      _wallpaper_3D.update_transform();
    break;
  case 'scale_z_percent':
  case 'pos_x_offset_percent':
  case 'pos_y_offset_percent':
  case 'pos_z_offset_percent':
    if (_wallpaper_3D.mesh?.userData.use_depth_transform_shader) {
      _wallpaper_3D.update_transform();
      break;
    }
  default:
    update_depth();
};
        }
      });
    })(),

    busy: false,

    load: (()=>{
      function v_update_frame() {
v_timerID = null;

if (_wallpaper_3D.enabled) {
  _wallpaper_3D.update_frame(video, w,h);
}
else {
  if (!video.paused) video.pause();
}

requestVideoFrameCallback();
      }

      function draw_bg() {
const c = document.getElementById('Cwallpaper3D_bg');
c.width  = canvas_img.width;
c.height = canvas_img.height;
c.getContext('2d').drawImage(canvas_img, 0,0);
c.style.visibility = 'inherit';
      }

      function video_loaded() {
v_resolve();
requestVideoFrameCallback();
      }

      let v_timerID;
      function requestVideoFrameCallback() {
if (v_timerID) video.cancelVideoFrameCallback(v_timerID);
v_timerID = video.requestVideoFrameCallback(v_update_frame);
      }

      let w, h;
      let v_resolve;

      return async function (src) {
if (/xra\-3d\-wallpaper_[^\/\\]+$/i.test(src)) this.enabled = true;

if (!this.enabled) return;

if (this.busy) return;
this.busy = true;

this.depth_map_ready = false

this.filename = src.replace(/^.+[\/\\]/, '');
if (!this.options_by_filename[this.filename]) {
  const options = {};
  for (const p of ['scale_xy_percent', 'scale_z_percent', 'depth_shift_percent', 'depth_contrast_percent', 'depth_blur', 'depth_smoothing_percent', 'pos_x_offset_percent', 'pos_y_offset_percent', 'pos_z_offset_percent']) {
    options[p] = this.options[p];
  }
// after values are copied from general options
  this.options_by_filename[this.filename] = options;
}

await this.init();

this.mesh.visible = false;

let c;
if (/xra\-3d\-wallpaper_[^\/\\]+\.mp4$/i.test(src)) {
  this.is_video = true;

  if (!video) {
    video = document.createElement('video');
//    video.autoplay = true;
    video.loop = true;
  }

// 'canplay' event may return 0 for videoWidth/videoHeight
  video.removeEventListener('loadedmetadata', video_loaded);
  video.addEventListener('loadedmetadata', video_loaded);

  c = video;

  await new Promise((resolve)=>{
    v_resolve = resolve;
    c.src = toFileProtocol(src);
  });

  w = c.videoWidth;
  h = c.videoHeight;

// force resizing of canvas, indicating that this is the first frame, skipping depth map smoothing
  canvas_depth.width = canvas_depth.height = 1;

  video.play();
}
else {
  this.is_video = false;

  c = img;
  if (video) video.pause();

  await new Promise((resolve)=>{
    c.onload = function () {
      resolve();
    };
    c.src = toFileProtocol(src);
  });

  w = c.width;
  h = c.height;
}

if (src.indexOf('xra-3d-wallpaper_') != -1) {
  if (!document.getElementById('Cwallpaper3D_bg')) {
    const c = document.createElement('canvas');
    c.id = 'Cwallpaper3D_bg';
    const cs = c.style;
    cs.position = 'absolute';
    cs.top = cs.left = '0px';
    cs.width = cs.height = '100%';
    cs.objectFit = "cover";
    LdesktopBG_host.appendChild(c);
  }

  w /= 2;
  ar = w/h;

  this.update_frame(c, w,h);

  if (/mp4$/i.test(src)) {
    video.requestVideoFrameCallback(draw_bg);
  }
  else {
    draw_bg();
  }

  this.busy = false;

  return;
}

ar = w/h;

const bitmap = await createImageBitmap(c);

const options = {
  depth:{
    enabled: true,
    model: this.options.depth_model,
  },
  SR:{
    model: this.options.SR_model,
  }
};

options.SR.enabled = this.options.SR_mode && (((w < 1280) || (h < 720)) && (w*h < 1920*1080));

let data = { rgba:bitmap, width:w, height:h, options:options };
transformers_worker.postMessage(data, [data.rgba]);

data = data.rgba = undefined;

return new Promise((resolve)=>{
  resolve_loaded = resolve;
});
      };
    })(),

    update_camera_factor: function () {
// https://hofk.de/main/discourse.threejs/2022/CalculateCameraDistance/CalculateCameraDistance.html
// box_h = d * (2 * Math.tan(camera.fov / 2))
const ar_camera = MMD_SA.THREEX.SL.width/MMD_SA.THREEX.SL.height;
camera_factor = 2 * Math.tan(MMD_SA.THREEX.camera.obj.fov * Math.PI/180 / 2) * ar_camera / ((ar > 1) ? ar : 1) * ((ar > ar_camera) ? ar/ar_camera : 1);
    },

    update_transform: function (options={}) {
if (!this.mesh) return;

let scale_xy = this.options.scale_xy_percent/100;
let scale_z = this.options.scale_z_percent/100;
let pos_z_offset_percent = this.options.pos_z_offset_percent;

this.update_camera_factor();

this.mesh.scale.set(((ar>1)?ar:1)*scale_xy, ((ar>1)?1:1/ar)*scale_xy, scale_z).multiplyScalar(this.scale_base);

const camera_position = options.camera_position || [0,0,0];
const center_view = MMD_SA.center_view;
for (let i = 1; i < 3; i++) {
  if (!camera_position[i])
    camera_position[i] = MMD_SA_options.camera_position_base[i] + center_view[i];
}
//console.log(camera_position)

d_to_full_screen = this.scale_base * scale_z + camera_position[2];

this.mesh.position.copy((!MMD_SA_options.MMD_disabled) ? MMD_SA.THREEX.get_model(0).mesh.position : MMD_SA.TEMP_v3.set(0,0,0));
this.mesh.position.y += camera_position[1];
this.mesh.position.z += camera_position[2] - d_to_full_screen - this.mesh.scale.z * pos_z_offset_percent/100;

window.dispatchEvent(new CustomEvent('SA_MMD_Wallpaper3D_on_update_transform'));
    },

    update_mesh: function () {
if (!this.depth_map_ready) return;

let scale_z = this.options.scale_z_percent/100;
let depth_shift_percent = this.options.depth_shift_percent;
let depth_contrast_percent = this.options.depth_contrast_percent;
//let depth_scale_percent = this.options.depth_scale_percent;
let depth_blur = this.options.depth_blur;
let pos_x_offset_percent = this.options.pos_x_offset_percent;
let pos_y_offset_percent = this.options.pos_y_offset_percent;
let pos_z_offset_percent = this.options.pos_z_offset_percent;

this.update_camera_factor();

let ctx;
canvas_depth_transformed.width = canvas_depth_transformed.height = this.depth_dim;
ctx = canvas_depth_transformed.getContext('2d');
ctx.globalCompositeOperation = 'copy';
ctx.globalAlpha = 1;

if (depth_shift_percent || depth_contrast_percent) {// || (depth_scale_percent != 100)) {
  canvas_temp1.width  = canvas_depth.width;
  canvas_temp1.height = canvas_depth.height;
  ctx = canvas_temp1.getContext('2d');
  ctx.globalAlpha = 1;
  if (depth_shift_percent && (depth_contrast_percent < 0)) {

    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    ctx.fillColor = 'black';
    ctx.fillRect(0,0,canvas_temp1.width,canvas_temp1.height);
    ctx.globalAlpha = (depth_contrast_percent+100)/100;
    ctx.drawImage(canvas_depth, 0,0);
    ctx.globalAlpha = 1;

/*
    ctx.globalCompositeOperation = 'copy';
    ctx.filter = 'contrast(' + (depth_contrast_percent+100) + '%)';
    ctx.drawImage(canvas_depth, 0,0);
    ctx.filter = 'none';
*/
  }
  else {
    ctx.globalCompositeOperation = 'copy';
    ctx.filter = 'none';
    ctx.drawImage(canvas_depth, 0,0);
  }

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
// https://en.wikipedia.org/wiki/Blend_modes
  if (depth_shift_percent) {
    ctx.globalCompositeOperation = (depth_shift_percent < 0) ? 'multiply' : 'screen';
    let power = Math.abs(depth_shift_percent/100);
    while (power > 0) {
      ctx.globalAlpha = Math.min(power, 1);
      ctx.drawImage(canvas_temp1, 0,0);
      power--;
    }
  }

  if (depth_contrast_percent > 0) {
    ctx.globalCompositeOperation = 'overlay';//'soft-light';//
    let power = Math.abs(depth_contrast_percent/100);
//    if (depth_contrast_percent < 0) ctx.filter = 'invert(100%)';
    while (power > 0) {
      ctx.globalAlpha = power;
      ctx.drawImage(canvas_temp1, 0,0);
      power--;
    }
  }

  ctx = canvas_depth_transformed.getContext('2d');

  let filters = [];

  if (!depth_shift_percent && (depth_contrast_percent < 0)) filters.push('contrast(' + (depth_contrast_percent+100) + '%)');
//if (depth_scale_percent != 100) filters.push('brightness(' + depth_scale_percent + '%)');

  if (depth_blur) filters.push('blur(' + depth_blur + 'px)');

  ctx.filter = (filters.length) ? filters.join(' ') : 'none';
//DEBUG_show(ctx.filter)

  ctx.drawImage(canvas_temp1, 0,0,canvas_depth_transformed.width,canvas_depth_transformed.height);
  ctx.filter = 'none';
}
else {
  ctx.drawImage(canvas_depth, 0,0,canvas_depth_transformed.width,canvas_depth_transformed.height);
}

if (this.mesh.userData.use_depth_transform_shader) {
  if (this.mesh.material.uniforms?.Wallpaper3D_displacementMap) {
    this.mesh.material.uniforms.Wallpaper3D_displacementMap.value.needsUpdate = true;
  }
  else {
// MMD mode doesn't have material.uniforms until program has compiled
    System._browser.on_animation_update.add(()=>{ this.mesh.material.uniforms.Wallpaper3D_displacementMap.value.needsUpdate = true; }, 1,0);
  }
  return;
}

const z_offset = pos_z_offset_percent/100 * scale_z * camera_factor;
let h_max = d_to_full_screen / this.scale_base * camera_factor;
let h_min = (d_to_full_screen - this.scale_base * scale_z) / this.scale_base * camera_factor;
h_max -= h_min + z_offset;

const center_x = 0.5 - pos_x_offset_percent/100;
const center_y = 0.5 - pos_y_offset_percent/100;
//console.log(h_max,center_y)

const dw = this.depth_dim;
const dh = this.depth_dim;
const depth_idata = ctx.getImageData(0,0,dw,dh);

//if (1) {} else
if (MMD_SA.THREEX.enabled) {
  const pos = this.mesh.geometry.getAttribute('position');
  const uv  = this.mesh.geometry.getAttribute('uv');
//console.log(pos.count,uv.count,this.mesh.geometry.getIndex().count)
  for (let i = 0, i_max = pos.count; i < i_max; i++) {
    let x = uv.array[i*2];
    let y = uv.array[i*2+1];
    if (x < 0) x += 1;
    if (y < 0) y += 1;
    y = 1-y;

    x = Math.round(x*(dw-1));
    y = Math.round(y*(dh-1));

    let depth = depth_idata.data[(y*dw + x) * 4]/255;
//if (isNaN(depth)) console.log(x,y)
    pos.array[i*3+2] = depth;

    let w = x/(dw-1) - center_x;
    let h = 1-y/(dh-1) - center_y;
    let scale = Math.max((1-depth) * h_max + (h_min+z_offset), h_min);
    pos.array[i*3]   = w * scale;
    pos.array[i*3+1] = h * scale;
  }

  pos.needsUpdate = true;
}
else {
  const pos  = this.mesh.geometry.vertices;
  const uv   = this.mesh.geometry.faceVertexUvs[0];
  const face = this.mesh.geometry.faces;

//  const v_index = {};
  const face_a = ['a', 'b', 'c'];
  for (let i = 0, i_max = face.length; i < i_max; i++) {
    const f_obj = face[i];
    for (let f = 0; f < 3; f++) {
      const vi = f_obj[face_a[f]];
//      if (v_index[vi]) break;
//      v_index[vi] = true;

      let x = uv[i][f].x;
      let y = uv[i][f].y;
      if (x < 0) x += 1;
      if (y < 0) y += 1;
      y = 1-y;

      x = Math.round(x*(dw-1));
      y = Math.round(y*(dh-1));

      let depth = depth_idata.data[(y*dw + x) * 4]/255;
      pos[vi].z = depth;

      let w = x/(dw-1) - center_x;
      let h = 1-y/(dh-1) - center_y;
      let scale = Math.max((1-depth) * h_max + (h_min+z_offset), h_min);
      pos[vi].x = w * scale;
      pos[vi].y = h * scale;
    }
  }

  this.mesh.geometry.verticesNeedUpdate = true;
}
    },

    export_mesh: async function () {
if (!MMD_SA.THREEX.enabled) {
  return;
}

this.mesh = this.generate_mesh(false);

MMD_SA.THREEX.scene.add(this.mesh);

const scale = 1 / MMD_SA.THREEX.VRM.vrm_scale;

this.update_transform({ camera_position:[0, this.options.exported_camera_position_y/scale, this.options.exported_camera_position_z/scale] });
this.update_mesh();

this.mesh_default.visible = false;
if (!MMD_SA_options.MMD_disabled) {
  this.mesh.position.sub(MMD_SA.THREEX.get_model(0).mesh.position);
}

this.mesh.quaternion.set(0,1,0,0);

this.mesh.position.multiplyScalar(scale).applyQuaternion(this.mesh.quaternion);
this.mesh.scale.multiplyScalar(scale);

await MMD_SA.THREEX.utils.export_GLTF('wallpaper_3d', this.mesh);

MMD_SA.THREEX.scene.remove(this.mesh);
this.mesh.geometry.dispose();
this.mesh.material.dispose();

this.mesh_default.visible = true;
this.mesh = this.mesh_default;
    },

    get visible() { return this.mesh?.visible; },
    set visible(v) {
if (this.mesh)
  this.mesh.visible = !!v;
if (v)
  MMD_SA_options._Wallpaper3D_status_ = '(✔️Ready)';

const c = document.getElementById('Cwallpaper3D_bg');
if (c)
  c.style.visibility = (v) ? 'inherit' : 'hidden';
    },

    get ar() { return ar; },
    get camera_factor() { return camera_factor; },
    get d_to_full_screen() { return d_to_full_screen; },
  };


};
