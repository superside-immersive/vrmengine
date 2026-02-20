// Gamepad — extracted from MMD_SA.js
// Original: MMD_SA.Gamepad IIFE

window.MMD_SA_createGamepad = function () {
  class Gamepad {
    constructor(id) {
if (typeof id == 'string') {
  this.id = id;
}
else {
  this.index = (typeof id == 'number') ? id : gamepads.length;
}

this.reset_control_profile();
    }

    process(gp_detected) {
Gamepad.update_button_state(gp_detected);

this.control_profile.on_process?.(gp_detected);

gp_detected.axes.forEach((a,i)=>{
  this.control_profile.axes[i]?.(i, gp_detected);
});

gp_detected.buttons.forEach((b,i)=>{
  this.control_profile.buttons[i]?.(i, gp_detected);
});

this._processed_ = true;
    }

    reset_control_profile() {
this.control_profile = {
  axes: {},
  buttons: {},
};
    }

    load_control_profile(id) {
this.reset_control_profile();
Object.assign(this.control_profile, control_profiles[id]);
    }

    static button_state = {};

    static update_button_state(gp_detected) {
let bs = Gamepad.button_state[gp_detected.index];
if (!bs) bs = Gamepad.button_state[gp_detected.index] = {};

gp_detected.buttons.forEach((b,i)=>{
  let s = bs[i];
  if (!s) s = bs[i] = {};

  s.on_press = !s.pressed && b.pressed;
  s.on_release = s.pressed && !b.pressed;

  if (b.pressed) {
    if (!s.pressed) {
      s.pressed = RAF_timestamp;
    }
  }
  else {
    if (s.pressed) {
      s.pressed = 0;
    }
  }
});
    }
  }

  function loop() {
gamepads.forEach(gp=>{ gp._processed_ = false; });

const gp_list = navigator.getGamepads();

let index = -1;
gp_list.forEach(gp_detected=>{
  if (!gp_detected?.connected) return;
  index++;

  let gp_obj;

  gp_obj = gamepads.find((gp, i)=>{
    if (gp._processed_) return false;
    return gp.id == gp_detected.id;
  });

  if (!gp_obj) {
    gp_obj = gamepads.find((gp, i)=>{
      if (gp._processed_) return false;
      return gp.index == index;
    });
  }

  if (!gp_obj) return;

//DEBUG_show(index+'/'+Date.now())

  gp_obj.process(gp_detected);
});
  }

  const control_profile = {
    camera_pan: {
      axes: {
        '0': (()=>{
          let panning;

          return function (i, gp) {
const tb = MMD_SA._trackball_camera;
if (!tb.enabled) return;

const axis_x = gp.axes[0];
const axis_y = gp.axes[1];

if ((Math.abs(axis_x) < 0.1) && (Math.abs(axis_y) < 0.1)) {
  panning = false;
  return;
}
//DEBUG_show(axis_x+'\n'+axis_y)

let x, y;

x = window.innerWidth/2;
y = window.innerHeight/2;
tb.getMouseOnScreen(x,y, tb._panStart);

if (!panning) {
  panning = true;
  tb._panEnd.copy(tb._panStart);
}
else {
  let scale = (MMD_SA_options.gamepad[0].axes[0].sensitivity_percent||100)/100;
  x += axis_x * window.innerWidth/60  * scale;
  y += axis_y * window.innerHeight/60 * scale;
  tb.getMouseOnScreen(x,y, tb._panEnd);
}
          };
        })(),

        '1': null,
      },
    },

    camera_rotate: {
      axes: {
        '2': (()=>{
          let rotating;

          return function (i, gp) {
const tb = MMD_SA._trackball_camera;
if (!tb.enabled) return;

const axis_x = gp.axes[2];
const axis_y = gp.axes[3];

if ((Math.abs(axis_x) < 0.1) && (Math.abs(axis_y) < 0.1)) {
  rotating = false;
  return;
}
//DEBUG_show(axis_x+'\n'+axis_y)

let x, y;

x = window.innerWidth/2;
y = window.innerHeight/2;
tb.getMouseProjectionOnBall(x,y, tb._rotateStart);

tb.rotate_with_up_fixed && tb._rotateEnd_fixed_up.copy(tb.getMouseOnScreen_fixed_up(x,y, tb._rotateStart_fixed_up));

if (!rotating) {
  rotating = true;
  tb._rotateEnd.copy(tb._rotateStart);
}
else {
  let scale = (MMD_SA_options.gamepad[0].axes[2].sensitivity_percent||100)/100;
  x += axis_x * window.innerWidth/60  * scale;
  y += axis_y * window.innerHeight/60 * scale;
  tb.getMouseProjectionOnBall(x,y, tb._rotateEnd);

  tb.rotate_with_up_fixed && tb.getMouseOnScreen_fixed_up(x,y, tb._rotateEnd_fixed_up);
}
          };
        })(),

        '3': null,
      },
    },

    camera_zoom: {
      buttons: {
        '6': function (i, gp) {
const tb = MMD_SA._trackball_camera;
if (!tb.enabled) return;

let scale = (MMD_SA_options.gamepad[0].buttons[6].sensitivity_percent||100)/100;
const zoom_in  = gp.buttons[6].value * scale;
const zoom_out = gp.buttons[7].value * scale;

let zoom = zoom_in - zoom_out;

if (Math.abs(zoom) < 0.1)  return;
//DEBUG_show(zoom+'/'+Date.now())

tb._zoomStart.y += zoom/1000;
        },

        '7': null,
      }
    },

    camera_reset: {
      buttons: {
        '10': function (i, gp) {
const bs = Gamepad.button_state[gp.index][i];
if (bs.on_press) {
  MMD_SA.reset_camera();
}
        }
      }
    },

    camera_lock: {
      buttons: {
        '11': function (i, gp) {
const bs = Gamepad.button_state[gp.index][i];
if (bs.on_press) {
  Object.values(System._browser.hotkeys.accelerators).find(k=>k.id=='camera_3D_lock').config.process();
}
        }
      }
    },

    camera_orbit_mode: {
      buttons: {
        '8': function (i, gp) {
const bs = Gamepad.button_state[gp.index][i];
if (bs.on_press) {
  const tb = MMD_SA._trackball_camera;
  tb.rotate_with_up_fixed = !tb.rotate_with_up_fixed;
  MMD_SA.reset_camera();
  System._browser.camera.DEBUG_show('Orbit camera:'+((tb.rotate_with_up_fixed)?'ON':'OFF'), 3);
}
        }
      }
    },

    avatar_move: {
      axes: {
        '0': (()=>{
          function keyboard_event(e_type, key_id) {
const d = MMD_SA_options.Dungeon;

var keyCode = d.key_map_by_id[key_id].keyCode;
if ((e_type == "keyup") && !d._key_pressed[keyCode])
  return;

var e = new KeyboardEvent(e_type, {bubbles:true, cancelable:true, keyCode:keyCode});
document.dispatchEvent(e);
          }

          return function (i, gp) {
let x = gp.axes[0];
let y = gp.axes[1];

if ((Math.abs(x) < 0.1) && (Math.abs(y) < 0.1)) {
  const key_pressed = {up:0, down:0, left:0, right:0};
  for (var key_id in key_pressed)
    keyboard_event("keyup", key_id);
  return;
}

const d = MMD_SA_options.Dungeon;

const key_pressed = {up:0, down:0, left:0, right:0};

let scale;
let threshold = (d.character.TPS_mode) ? 0 : 0.1;
let x_abs = Math.abs(x)
let y_abs = Math.abs(y);
if (x_abs > threshold) {
  scale = (d.character.TPS_mode) ? Math.min(x_abs*2, 1) : x_abs;
  if (x > 0)
    key_pressed.right = scale
  else
    key_pressed.left  = scale
}
if (y_abs > threshold) {
  scale = (d.character.TPS_mode) ? Math.min(y_abs*2, 1) : Math.min(y_abs*2, 1);
  if (y > 0)
    key_pressed.down = scale
  else
    key_pressed.up   = scale
}

for (let key_id in key_pressed) {
  let v = key_pressed[key_id]
  if (v) {
    let key_map = d.key_map_by_id[key_id]
    let key_data = key_map._data = key_map._data || {}
    key_data.scale = v
    keyboard_event("keydown", key_id)
  }
  else
    keyboard_event("keyup", key_id)
}
          };
        })(),

        '1': null,
      },
    },

    avatar_jump: {
      buttons: {
        '6': null,

        '7': function (i, gp) {
const bs = Gamepad.button_state[gp.index][i];
let e_name;
if (bs.on_press) {
  e_name = 'keydown';
}
else if (bs.on_release) {
  e_name = 'keyup';
}

if (!e_name) return;

let e = new KeyboardEvent(e_name, {bubbles:true, cancelable:true, keyCode:32, shiftKey:gp.buttons[6].pressed });
document.dispatchEvent(e);
        }
      }
    },

    mocap: {
      buttons: {
        '9': function (i, gp) {
const bs = Gamepad.button_state[gp.index][i];
if (bs.on_press) {
  if (!System._browser.camera.ML_enabled) {
    const inv = MMD_SA_options.Dungeon.inventory.find('streamer_mode');
    inv.action_check().then(actionable=>{
      if (actionable)
        inv.item.action.func();
    });
  }
  else {
    let e = new KeyboardEvent('keydown', {bubbles:true, cancelable:true, code:'Pause' });
    document.dispatchEvent(e);
  }
}
        }
      }
    },

    custom_buttons: {
      buttons: (()=>{
        const button_index_list = [0,1,2,3, 12,13,14,15];

        function process(i, gp) {
const bs = Gamepad.button_state[gp.index];
if (!bs[i].on_press) return;

const L1 = gp.buttons[4].pressed && 4;
const R1 = gp.buttons[5].pressed && 5;

const b_id = i + ((L1||R1) ? '+'+(L1||R1) : '');
const k = MMD_SA_options.gamepad[0].buttons[b_id]?.key;
//DEBUG_show(i+'/'+b_id+'/'+k)
if (!k) return;

// headless_mode
MMD_SA.THREEX.utils.press_key(k);
        }

        const buttons = {};

        button_index_list.map(index=>{
buttons[index] = process;
        });

        return buttons;
      })()
    },
  };

  let control_profiles = {};

  control_profiles['main'] = {
    on_process: function () {
Object.assign(this.axes, control_profile.camera_rotate.axes);
Object.assign(this.buttons, control_profile.camera_reset.buttons, control_profile.camera_lock.buttons, control_profile.camera_orbit_mode.buttons, control_profile.mocap.buttons);
if (MMD_SA_options._XRA_explorer_mode) {
  Object.assign(this.axes, control_profile.avatar_move.axes);
  Object.assign(this.buttons, control_profile.avatar_jump.buttons);
}
else {
  Object.assign(this.axes, control_profile.camera_pan.axes);
  Object.assign(this.buttons, control_profile.camera_zoom.buttons);
}
    },

    buttons: Object.assign({}, control_profile.custom_buttons.buttons),
  };

  let gamepads = [];

  let enabled = false;

  const _gamepad = {
    get enabled() { return enabled; },
    set enabled(v) {
if (enabled == !!v) return;
enabled = !!v;

System._browser.on_animation_update.remove(loop, 0);
if (enabled) {
  if (!gamepads.length) {
    this.create();
    gamepads[0].load_control_profile('main');
  }
  System._browser.on_animation_update.add(loop, 0,0,-1);
}
    },

    get gamepads() { return gamepads; },

    get control_profile() { return control_profile; },
    get control_profiles() { return control_profiles; },

    create: function (id) {
gamepads.push(new Gamepad(id));
    },
  };


};
