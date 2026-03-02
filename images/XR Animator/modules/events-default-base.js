// events-default-base.js — events_default: SELFIE, ENTER_AR, FACEMESH, VMC, RECORDER
// Extracted from animate.js
(function () {
  if (!MMD_SA_options.Dungeon_options) return;
  Object.assign(MMD_SA_options.Dungeon_options.events_default, {
    "_SELFIE_": [
//0
      [
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.webcam_media'); }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:2 }
   ,{ key:3, is_closing_event:true }
   ,{ key:4, branch_index:3 }
  ]
          }
        }
      ]
// 1
     ,[
        {
          func: function () {
MMD_SA.WebXR.user_camera.video_flipped=false;
MMD_SA.WebXR.user_camera.start((0&&webkit_electron_mode) ? toFileProtocol("C:\\Users\\user\\Documents\\_.mp4") : null);
          }
         ,ended: "_SELFIE_"
        }
      ]
// 2
     ,[
        {
          func: function () {
MMD_SA.WebXR.user_camera.video_flipped=true;
MMD_SA.WebXR.user_camera.start((0&&webkit_electron_mode) ? toFileProtocol("C:\\Users\\user\\Documents\\_.mp4") : null);
          }
         ,ended: "_SELFIE_"
        }
      ]

     ,...(()=>{
        let options;

        return [
//3
      [
        {
          func: function () {
options = {
  pixel_limit: {
    disabled: MMD_SA_options.user_camera.pixel_limit.disabled,
    current: MMD_SA_options.user_camera.pixel_limit.current?.slice(),
  },
  portrait_mode: MMD_SA_options.user_camera.portrait_mode,
  fps: MMD_SA_options.user_camera.fps,
};
          },
          next_step: {}
        },

        {
          message: {
  get content() {
    return [
'1. ' + System._browser.translation.get('XR_Animator.UI.webcam_media.options.resolution_limit') + ': ' + ((options.pixel_limit.disabled) ? System._browser.translation.get('XR_Animator.UI.webcam_media.options.auto_no_limit') : (options.pixel_limit.current||MMD_SA_options.user_camera.pixel_limit._default_).join('x') + ((!options.pixel_limit.current) ? ' (' + System._browser.translation.get('Misc.default') + ')' : '')),
'2. ┗ ' + System._browser.translation.get('XR_Animator.UI.webcam_media.options.portrait_mode') + ': ' + ((options.portrait_mode) ? System._browser.translation.get('XR_Animator.UI.webcam_media.options.portrait_mode.' + ((options.portrait_mode == 1) ? 'height_x_width' : ((options.portrait_mode == 2) ? 'rotate_90d_clockwise' : 'rotate_90d_anticlockwise'))) : 'OFF'),
'3. ' + System._browser.translation.get('XR_Animator.UI.webcam_media.options.frame_rate') + ': ' + (options.fps?.exact || options.fps || System._browser.translation.get('Misc.default')),
'4. ' + System._browser.translation.get('XR_Animator.UI.webcam_media.options.save_and_return'),
'5. ' + System._browser.translation.get('Misc.cancel')
    ].join('\n');
  }
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:4,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.webcam_media.options.resolution_limit.tooltip')
);
      }
    },
    { key:2, event_id:{ func:()=>{
options.portrait_mode = (options.portrait_mode||0) + 1;
if (options.portrait_mode > 3)
  options.portrait_mode = 0;
if (options.portrait_mode)
  options.pixel_limit.disabled = false;
  
      }, goto_event: { branch_index:3, step:1 } },
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.webcam_media.options.portrait_mode.tooltip')
);
      }
    },
    { key:3, branch_index:5,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.webcam_media.options.frame_rate.tooltip')
);
      }
    },
    { key:4, branch_index:0,
      func: ()=>{
Object.assign(MMD_SA_options.user_camera.pixel_limit, options.pixel_limit);
MMD_SA_options.user_camera.portrait_mode = options.portrait_mode;
MMD_SA_options.user_camera.fps = options.fps;

const camera = System._browser.camera;
camera.video_track?.applyConstraints(camera.set_constraints()).then(function () {
  camera.DEBUG_show("(camera size updated)", 3);
}).catch(function (err) {
  camera.DEBUG_show("ERROR:camera size failed to update", 5);
});
      }
    },
    { key:5, is_closing_event:true }
  ]
          }
        }
      ],
// 4
      [
        {
          func: function () {
const no_limit = 5;
let index = (options.pixel_limit.disabled) ? no_limit : ((options.pixel_limit.current) ? [[640,480], [1280,960], [1920,1080], [3840,2160]].findIndex(r=>r.every((v,i)=>v==options.pixel_limit.current[i]))+1 : 0);
if (++index > no_limit)
  index = 0;

switch (index) {
  case 1:
    options.pixel_limit.disabled = false;
    options.pixel_limit.current = [640,480];
    break;
  case 2:
    options.pixel_limit.disabled = false;
    options.pixel_limit.current = [1280,960];
    break;
  case 3:
    options.pixel_limit.disabled = false;
    options.pixel_limit.current = [1920,1080];
    break;
  case 4:
    options.pixel_limit.disabled = false;
    options.pixel_limit.current = [3840,2160];
    break;
  case no_limit:
    options.pixel_limit.disabled = true;
    options.pixel_limit.current = null;
    break;
  default:
    options.pixel_limit.disabled = false;
    options.pixel_limit.current = null;
    break;
}
          }
         ,goto_event: { branch_index:3, step:1 }
        }
      ],
// 5
      [
        {
          func: function () {
options.fps = (options.fps) ? null : { exact:30 };
          }
         ,goto_event: { branch_index:3, step:1 }
        }
      ],
        ];
      })()
    ]

   ,"_ENTER_AR_": [
//0
      [
        {
          message: {
  content: "Enter Augmented Reality (AR) mode?\n1. Yes\n2. No"
 ,bubble_index: 3
 ,branch_list: [
    { key:1, branch_index:1 }
   ,{ key:2, is_closing_event:true }
  ]
          }
        }
      ]
// 1
     ,[
        {
          func: function () {
MMD_SA.WebXR.enter_AR()
          }
         ,ended: true
        }
      ]
    ]

   ,"_FACEMESH_": [
//0
      [
        {
          message: {
  get content() { return System._browser.translation.get('XR_Animator.UI.motion_capture.ML_off'); }
 ,bubble_index: 3
 ,get branch_list() {
return [
    { key:1, branch_index:1 }
   ,{ key:2, branch_index:2 }
   ,{ key:3, branch_index:3 }
   ,{ key:4, branch_index:4 }
   ,{ key:5, branch_index:5,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.ML_off.full_body_mediapipe_vision.tooltip')
);
      }
    }
   ,{ key:6, branch_index:6,
      onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.motion_capture.ML_off.full_body_legacy_holistic.tooltip')
);
      }
    }
   ,{ key:7, branch_index:7 }
   ,{ key:8, is_closing_event:true }
];
  }
          }
        }
      ]
// NOTE: Models that need to be used should be enabled first before disabling other models.
// 1
     ,[
        {
          func: function () {
System._browser.camera.streamer_mode.init_mocap('Face');
          }
         ,ended: true
        }
      ]
// 2
     ,[
        {
          func: function () {
System._browser.camera.streamer_mode.init_mocap('Body');
          }
         ,ended: true
        }
      ]
// 3
     ,[
        {
          func: function () {
System._browser.camera.streamer_mode.init_mocap('Body+Hands');
          }
         ,ended: true
        }
      ]
// 4
     ,[
        {
          func: function () {
System._browser.camera.streamer_mode.init_mocap('Face+Body');
          }
         ,ended: true
        }
      ]
// 5
     ,[
        {
          func: function () {
System._browser.camera.streamer_mode.init_mocap('Full Body');
          }
         ,ended: true
        }
      ]
// 6
     ,[
        {
          func: function () {
System._browser.camera.streamer_mode.init_mocap('Full Body Holistic');
          }
         ,ended: true
        }
      ]
// 7
     ,[
        {
          goto_event: { id:"_FACEMESH_OPTIONS_", get branch_index() { return MMD_SA_options._mocap_options_branch_; } }
        }
      ]
    ]

   ,"_VMC_PROTOCOL_": (()=>{
const key_any = { key:'any', func:(e)=>{
let cancel_default = true;

const branch_to_return = (VMC_receiver_index == -1) ? 0 : 3;
if (/(\+|\-)/.test(e.key) && (VMC_receiver_index != -1)) {
  step = (e.key == '+') ? 1 : -1;
  System._browser.camera.VMC_receiver.config.prop_mocap_factor_percent = THREE.Math.clamp(System._browser.camera.VMC_receiver.config.prop_mocap_factor_percent + step, 0,100);

  MMD_SA_options.Dungeon.run_event(null,branch_to_return,0);
}
else if (/Arrow(Left|Right)/.test(e.code) && (VMC_receiver_index != -1)) {
  step = (e.code == 'ArrowLeft') ? -1 : 1;
  VMC_receiver_index += step;
  if (VMC_receiver_index < 0) {
    VMC_receiver_index = System._browser.camera.VMC_receiver.receiver_max-1;
  }
  else if (VMC_receiver_index >= System._browser.camera.VMC_receiver.receiver_max) {
    VMC_receiver_index = 0;
  }

  MMD_SA_options.Dungeon.run_event(null,branch_to_return,0);
}
else if (change_port) {
  if (/^\d$/.test(e.key)) {
    if (port.length == 5) port = '';
    port += e.key;
    MMD_SA_options.Dungeon.run_event(null,null,0);
  }
  else if (e.key == 'Enter') {
    const port_number = parseInt(port);
    const port_min = 99;

    const port_used = {};

    if (VMC_receiver_index != -1) {
      port_used[MMD_SA.OSC.VMC.options.plugin.send.port] = true;
//      port_used[MMD_SA.OSC.VMC.options_default.plugin.send.port] = true;
    }

    System._browser.camera.VMC_receiver.options.receiver.forEach((r,i)=>{
      if (VMC_receiver_index != i) {
        port_used[r.port] = true;
//        port_used[r.port_default] = true;
      }
    });

    if (port_used[port]) {
      msg = '(❌' + 'port already used/reserved' + ')';
      port = '';
      MMD_SA_options.Dungeon.run_event(null,null,0);
    }
    else if ((port_number > port_min) && (port_number < 65536)) {
      if (VMC_receiver_index == -1) {
        MMD_SA.OSC.VMC.options.plugin.send.port = port_number;
        if (MMD_SA.OSC.VMC.plugin)
          MMD_SA.OSC.VMC.plugin.options.send.port = port_number;
      }
      else {
        const R = System._browser.camera.VMC_receiver;
        const o = R.options.receiver[VMC_receiver_index];
        if (o.port != port_number) {
          const r = R.receiver[VMC_receiver_index];
          o.port = r.VMC.options.plugin.open.port = r.VMC.options_default.plugin.open.port = port_number;
          if (r.enabled) {
// recreate socket
            r.enabled = false;
            r.enabled = true;

            DEBUG_show('VMC receiver-' + VMC_receiver_index + ' port changed:' + port_number, 5);
          }
        }
      }

      MMD_SA_options.Dungeon.run_event(null,branch_to_return,0);
    }
    else {
      msg = (port_number) ? ((port_number <= port_min) ? '(❌' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port.3_digit_number_at_least') + ')' : '(❌' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port.no_bigger_than_65535') + ')') : '(❌' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port.invalid_port_number') + ')';
      port = '';
      MMD_SA_options.Dungeon.run_event(null,null,0);
    }
  }
  else if (e.code == 'KeyR') {
    port = (VMC_receiver_index == -1) ? MMD_SA.OSC.VMC.options_default.plugin.send.port : System._browser.camera.VMC_receiver.options.receiver[VMC_receiver_index].port_default;
    msg = '';
    MMD_SA_options.Dungeon.run_event(null,null,0);
  }
  else if (e.code == 'Escape') {
    port = '';
    MMD_SA_options.Dungeon.run_event(null,branch_to_return,0);
  }
  else {
    cancel_default = false;
  }
}
else if (change_host) {
  if (/^[\d\.]$/.test(e.key)) {
    host += e.key;
    MMD_SA_options.Dungeon.run_event(null,null,0);
  }
  else if (e.key == 'Enter') {
    let valid_host;
    if (host == MMD_SA.OSC.VMC.options_default.plugin.send.host) {
      valid_host = true;
    }
    else if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(host)) {
      valid_host = [RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4].every(d=>parseInt(d) < 256);
    }

    if (valid_host) {
      MMD_SA.OSC.VMC.options.plugin.send.host = host;
      if (MMD_SA.OSC.VMC.plugin)
        MMD_SA.OSC.VMC.plugin.options.send.host = host;

      MMD_SA_options.Dungeon.run_event(null,0,0);
    }
    else {
      msg = '(❌' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.host.invalid_IP_address') + ')';
      host = '';
      MMD_SA_options.Dungeon.run_event(null,null,0);
    }
  }
  else if (e.code == 'KeyR') {
    host = MMD_SA.OSC.VMC.options_default.plugin.send.host;
    msg = '';
    MMD_SA_options.Dungeon.run_event(null,null,0);
  }
  else if (e.code == 'Escape') {
    host = '';
    MMD_SA_options.Dungeon.run_event(null,0,0);
  }
  else {
    cancel_default = false;
  }
}
else {
  cancel_default = false;
}

return cancel_default;
  } };

const branch_list = [
  key_any,
  { key:'A', branch_index:1 },
  { key:'B', branch_index:2 },
  { key:1, event_id:{ func:()=>{ MMD_SA.OSC.VMC.sender_enabled   = MMD_SA_options.user_camera.streamer_mode.VMC_sender_enabled   = !MMD_SA.OSC.VMC.sender_enabled; System._browser.update_tray(); }, goto_event: { id:"_VMC_PROTOCOL_", branch_index:0 } },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.tooltip')
);
    }
  },
  { key:2, event_id:{ func:()=>{ MMD_SA.OSC.VMC.send_camera_data = MMD_SA_options.user_camera.streamer_mode.VMC_send_camera_data = !MMD_SA.OSC.VMC.send_camera_data; System._browser.update_tray(); }, goto_event: { id:"_VMC_PROTOCOL_", branch_index:0 } },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.send_camera_data.tooltip')
);
    }
  },
  { key:3, event_id:{ func:()=>{
const app_mode = [
  'Others',
  'Warudo',
  'VNyan',
  'VNyan(+Z)',
  'VSeeFace',
];

let app_index = Math.max(app_mode.indexOf(MMD_SA.OSC.app_mode), 0) + 1;
if (app_index >= app_mode.length)
  app_index = 0;
MMD_SA.OSC.app_mode = app_mode[app_index];

System._browser.update_tray();
    }, goto_event: { id:"_VMC_PROTOCOL_", branch_index:0 } },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.app_mode.tooltip')
);
    }
  },
  { key:4, event_id:{ func:()=>{ MMD_SA.hide_3D_avatar=!MMD_SA.hide_3D_avatar; System._browser.update_tray(); }, goto_event: { id:"_VMC_PROTOCOL_", branch_index:0 } },
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.3D_avatar_display.tooltip')
);
    }
  },
  { key:5, func:()=>{ VMC_receiver_index=0; },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.tooltip')
);
    }
  },
  { key:'X', is_closing_event:true },
];

const branch_list_VMC_receiver = [
  key_any,
  { key:1, branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.VMC_receiver.tooltip')
);
    }
  },
  { key:2, func:()=>{
const R = System._browser.camera.VMC_receiver;
const o = R.options.receiver[VMC_receiver_index];
const r = R.receiver[VMC_receiver_index];
o.enabled = !r.enabled;
if (o.enabled) {
  r.enabled = true;
  DEBUG_show('VMC receiver-' + VMC_receiver_index + ':ON', 3);
}
else {
  r.enabled = false;
  DEBUG_show('VMC receiver-' + VMC_receiver_index + ':OFF', 3);
}
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.status.tooltip')
);
    },
  },
  { key:3, branch_index:1 },
  { key:4, func:()=>{
const R = System._browser.camera.VMC_receiver;
const r = R.receiver[VMC_receiver_index];
if (++r.config.face > 3)
  r.config.face = 0;

r.config.pose = 0;

if (r.enabled) r.reset();
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.face.tooltip')
);
    },
  },
  { key:5, func:()=>{
const R = System._browser.camera.VMC_receiver;
const r = R.receiver[VMC_receiver_index];
if (++r.config.pose > 2)
  r.config.pose = 0;

r.config.face = r.config.hand = 0;

if (r.enabled) r.reset();
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.pose.tooltip')
);
    },
  },
  { key:6, func:()=>{
const R = System._browser.camera.VMC_receiver;
const r = R.receiver[VMC_receiver_index];
if (++r.config.hand > 3)
  r.config.hand = 0;

r.config.pose = 0;

if (r.enabled) r.reset();
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.hand.tooltip')
);
    },
  },
  { key:'A', func:()=>{
const R = System._browser.camera.VMC_receiver;
R.config.mocap_expression_constraint = (R.config.mocap_expression_constraint) ? 0 : 1;

R.reset();
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_expression_constraint.tooltip')
);
    },
  },
  { key:'B', func:()=>{
const R = System._browser.camera.VMC_receiver;
R.config.mocap_head_constraint = (R.config.mocap_head_constraint) ? 0 : 1;

R.reset();
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_head_constraint.tooltip')
);
    },
  },
  { key:'C', func:()=>{
const R = System._browser.camera.VMC_receiver;
R.config.mocap_wrist_constraint = (R.config.mocap_wrist_constraint) ? 0 : 1;

R.reset();
    },
    branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_wrist_constraint.tooltip')
);
    },
  },
  { key:'D', branch_index:3,
    onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.prop_mocap_factor.tooltip')
);
    }
  },
  { key:'X', func:()=>{ System._browser.on_animation_update.remove(update_VMC_status, 0); }, is_closing_event:true },
];

let change_port, change_host;
let port, host;
let msg;

let VMC_receiver_index = -1;
const VMC_receiver_icon = {
  0: '①',
  1: '②',
  2: '③',
  3: '④',
};

let VMC_status_countdown = 60;
function update_VMC_status() {
  if ((VMC_receiver_index != -1) && !change_port && (--VMC_status_countdown == 0)) {
    VMC_status_countdown = 60;
    MMD_SA_options.Dungeon.run_event(null,3,0);
  }
}

window.addEventListener('SA_Dungeon_onstart', ()=>{
  if (System._browser.camera.VMC_receiver.options.receiver.some(ro=>ro.enabled))
    System._browser.camera.VMC_receiver.enabled = true;
});

return [
//0
      [
        {
          func: function () {
change_port = false;
change_host = false;

VMC_receiver_index = -1;

MMD_SA.SpeechBubble.list[1].hide();

System._browser.on_animation_update.remove(update_VMC_status, 0);
System._browser.on_animation_update.add(update_VMC_status, 0,0,-1);
          },
          message: {
  get content() {
    return [
System._browser.translation.get('XR_Animator.UI.VMC_protocol.parameters'),
'A. ┣ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port') + ': ' + MMD_SA.OSC.VMC.options.plugin.send.port,
'B. ┗ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.host') + ': ' + MMD_SA.OSC.VMC.options.plugin.send.host,
'1. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.info_short') + ': ' + ((MMD_SA.OSC.VMC.sender_enabled) ? 'ON' : 'OFF'),
'2. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.send_camera_data') + ': ' + ((MMD_SA.OSC.VMC.send_camera_data) ? 'ON':  'OFF'),
'3. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.app_mode') + ': ' + ((MMD_SA.OSC.app_mode && (MMD_SA.OSC.app_mode != 'Others')) ? MMD_SA.OSC.app_mode : System._browser.translation.get('Misc.others')),
'4. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.3D_avatar_display') + ': ' + ((MMD_SA.hide_3D_avatar) ? 'OFF' : 'ON'),
'5. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options'),
'X. ' + System._browser.translation.get('Misc.done')
    ].join('\n');
  }
 ,bubble_index: 3
 ,branch_list: branch_list
          }
        }
      ],
//1
      [
        {
          func: function () {
if (!change_port) {
  msg = '';
  port = '';
}

change_port = true;
change_host = false;
          },
          message: {
  get content() {
return System._browser.translation.get('XR_Animator.UI.VMC_protocol.port.current_port') + ': ' + (port||((VMC_receiver_index == -1) ? MMD_SA.OSC.VMC.options.plugin.send.port : System._browser.camera.VMC_receiver.options.receiver[VMC_receiver_index].port)) + ((msg) ? '\n'+msg : '') + '\n・' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port.enter_valid_port') + '\n' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port_host_extra');
  }
 ,index: 1
 ,bubble_index: 3
 ,get branch_list() { return (VMC_receiver_index == -1) ? branch_list : branch_list_VMC_receiver; }
          }
        }
      ],
//2
      [
        {
          func: function () {
if (!change_host) {
  msg = '';
  host = '';
}

change_port = false;
change_host = true;
          },
          message: {
  get content() {
return System._browser.translation.get('XR_Animator.UI.VMC_protocol.host.current_host') + ': ' + (host||MMD_SA.OSC.VMC.options.plugin.send.host) + ((msg) ? '\n'+msg : '') + '\n・' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.host.enter_valid_IP') + '\n' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port_host_extra');
  }
 ,index: 1
 ,bubble_index: 3
 ,branch_list: branch_list
          }
        }
      ],

// 3
      [
        {
          func: function () {
change_port = false;
change_host = false;

System._browser.camera.VMC_receiver.init();

MMD_SA.SpeechBubble.list[1].hide();
          },
          message: {
  get content() {
    const face = {
0: 'OFF',
1: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.face.expression_only'),
2: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.face.expression_plus_head_absolute'),
3: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.face.expression_plus_head_relative'),
  };

    const pose = {
0: 'OFF',
1: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.pose.upper_body'),
2: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.pose.full_body'),
    };

    const hand = {
0: 'OFF',
1: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.hand.fingers_only'),
2: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.hand.fingers_plus_wrist_absolute'),
3: System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.hand.fingers_plus_wrist_relative'),
    };

    const R = System._browser.camera.VMC_receiver;

    const VMC_status = R.receiver.map((r,i)=>{
//if (i == VMC_receiver_index) return VMC_receiver_icon[i];
if (!R.receiver[i].enabled)
  return '⚫';
return (R.receiver[i].active || R.receiver[i].expression_active) ? '🟢' : '🔴';
    }).join('');

    return [
'1. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.VMC_receiver') + ': ' + VMC_receiver_icon[VMC_receiver_index] + VMC_status + '⬅️➡️',
'2. ┣ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.status') + ': ' + ((!R.receiver[VMC_receiver_index].enabled) ? '⚫' : ((R.receiver[VMC_receiver_index].active || R.receiver[VMC_receiver_index].expression_active) ? '🟢' : '🔴')) + ((R.receiver[VMC_receiver_index].enabled) ? 'ON' : 'OFF'),
'3. ┣ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.port') + ': ' + R.receiver[VMC_receiver_index].config.port,
'4. ┣ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.face') + ': ' + face[R.receiver[VMC_receiver_index].config.face],
'5. ┣ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.pose') + ': ' + pose[R.receiver[VMC_receiver_index].config.pose],
'6. ┗ ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.hand') + ': ' + hand[R.receiver[VMC_receiver_index].config.hand],
'A. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_expression_constraint') + ': ' + ((R.config.mocap_expression_constraint) ? System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_expression_constraint.mouth') : 'OFF'),
'B. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_head_constraint') + ': ' + ((R.config.mocap_head_constraint) ? 'ON' : 'OFF'),
'C. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.mocap_wrist_constraint') + ': ' + ((R.config.mocap_wrist_constraint) ? 'ON' : 'OFF'),
'D. ' + System._browser.translation.get('XR_Animator.UI.VMC_protocol.VMC_receiver_options.prop_mocap_factor') + ': ' + (R.prop_mocap_factor_percent + '%') + '➕➖',
'X. ' + System._browser.translation.get('Misc.done'),
    ].join('\n');
  }
 ,bubble_index: 3
 ,para: { row_max:11, font_scale:0.95 }
 ,branch_list: branch_list_VMC_receiver
          }
        }
      ],
];
    })()

   ,"_MEDIA_RECORDER_OPTIONS_": (()=>{

      return [
//0
  [
    {
      message: {
        content: 'Media recorder options have been removed from this build.\nX. Done',
        bubble_index: 3,
        branch_list: [
          { key:'X', is_closing_event:true }
        ]
      }
    }
  ],
      ];
    })()


  });
})();
