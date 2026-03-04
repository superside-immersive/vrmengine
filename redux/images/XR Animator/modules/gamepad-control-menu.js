(function () {
  if (window.XR_Animator_GamepadControlMenu)
    return

  window.XR_Animator_GamepadControlMenu = {
    buildEvents: function (MMD_SA_options) {
      const button_alpha_list = ['A','B','C','D','E','F','G','H'];
      const button_name_list = ['Ⓐ','Ⓑ','Ⓧ','Ⓨ','▲','▼','◀','▶'];
      const button_index_list = [0,1,2,3, 12,13,14,15];

      let hotkey_id, hotkey_combo, hotkey_acc;
      let button_append;

      let page2_type;

      let default_control_option_active = 'joystick_left';
      const default_control_options = ['joystick_left', 'joystick_right', 'L2/R2'];

      const branch_list = [
{ key:'any', func:(e)=>{
let page_index = 9;
if ((page2_type == 'default_control') && /Arrow(Up|Down)/.test(e.code)) {
  page_index = 10;
  let index = default_control_options.findIndex(v=>v==default_control_option_active);
  index -= (e.code == 'ArrowUp') ? 1 : -1;
  if (index < 0) {
    index = default_control_options.length-1;
  }
  else if (index > default_control_options.length-1) {
    index = 0;
  }
  default_control_option_active = default_control_options[index];
}
else if ((page2_type == 'default_control') && /Arrow(Left|Right)/.test(e.code)) {
  page_index = 10;
  const v = (e.code == 'ArrowRight') ? 1 : -1;
  switch (default_control_option_active) {
    case 'joystick_left':
MMD_SA_options.gamepad[0].axes[0].sensitivity_percent = THREE.Math.clamp((MMD_SA_options.gamepad[0].axes[0].sensitivity_percent||100) + v*2, 50,200);
      break;
    case 'joystick_right':
MMD_SA_options.gamepad[0].axes[2].sensitivity_percent = THREE.Math.clamp((MMD_SA_options.gamepad[0].axes[2].sensitivity_percent||100) + v*2, 50,200);
      break;
    case 'L2/R2':
MMD_SA_options.gamepad[0].buttons[6].sensitivity_percent = THREE.Math.clamp((MMD_SA_options.gamepad[0].buttons[6].sensitivity_percent||100) + v*2, 50,200);
      break;
  }
}
else {
  if (!hotkey_id) return false;
  if (!hotkey_combo) return false;

  if (System._browser.hotkeys.disabled) {
    if (/Alt|Control|Shift/.test(e.key)) {
      hotkey_combo[0] = e.key.replace(/Control/, 'Ctrl');
    }
    else if (/Key([A-Z])/.test(e.code)) {
      hotkey_combo[1] = RegExp.$1;
    }
    else if (/^(Numpad\d|Digit\d|F\d+|Escape|Pause|NumpadAdd|NumpadSubtract|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space)$/.test(e.code)) {
// space=32, LURD=37-40, +=107, -=109
      hotkey_combo[1] = e.code;
    }
    else if (e.key == 'Enter') {
      if (!hotkey_combo[1]) {
        hotkey_combo[0] = '';
        hotkey_acc = '';
      }
      else {
        hotkey_acc = (hotkey_combo[0]) ? hotkey_combo.join('+') : hotkey_combo[1];
      }
      System._browser.hotkeys.disabled = false;
    }
  }
  else {
    return false;
  }
}

MMD_SA_options.Dungeon.run_event(null,null,page_index);

return true;
} },
...button_index_list.map((id,i)=>{
  return { key:button_alpha_list[i], event_id:{ func:()=>{
hotkey_id = id + ((button_append)?'+'+button_append:'');
hotkey_combo = hotkey_acc = null;
    }, goto_event:{event_index:9} }
  };
}),

{ key:'K', event_id:{ func:()=>{
if (!hotkey_id) return;

System._browser.hotkeys.disabled = true;

hotkey_combo = ['',''];
hotkey_acc = null;
}, goto_event:{event_index:9} } },

{ key:'R', event_id:{ func:()=>{
System._browser.hotkeys.disabled = false;

if (!hotkey_id) return;

hotkey_id = hotkey_combo = hotkey_acc = null;
}, goto_event:{event_index:9} } },

{ key:'S', event_id:{ func:()=>{
System._browser.hotkeys.disabled = false;

if (!hotkey_id) return;

if (hotkey_acc) {
  MMD_SA_options.gamepad[0].buttons[hotkey_id] = { key:hotkey_acc };
}
else {
  delete MMD_SA_options.gamepad[0].buttons[hotkey_id];
}

hotkey_id = hotkey_combo = hotkey_acc = null;
}, goto_event:{event_index:9} } },

{ key:'M', event_id:{ func:()=>{
default_control_option_active = 'joystick_left';
  }, goto_event:{event_index:10} },
  sb_index: 1,
  onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.joystick_left.tooltip').replace(/\<press_to_adjust\>/, (default_control_option_active == 'joystick_left') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.press_to_adjust')+')' : '')
);
  },
},

{ key:'N', event_id:{ func:()=>{
default_control_option_active = 'joystick_right';
}, goto_event:{event_index:10} },
  sb_index: 1,
  onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.joystick_right.tooltip').replace(/\<press_to_adjust\>/, (default_control_option_active == 'joystick_right') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.press_to_adjust')+')' : '')
);
  },
},

{ key:'O', event_id:{ func:()=>{
default_control_option_active = 'L2/R2';
}, goto_event:{event_index:10} },
  sb_index: 1,
  onmouseover: function (e) {
MMD_SA_options.Dungeon.run_event(this.event_id);
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.L2_R2.tooltip').replace(/\<press_to_adjust\>/, (default_control_option_active == 'L2/R2') ? ' ('+System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.press_to_adjust')+')' : '')
);
  },
},

{ key:'I', event_id:{ func:()=>{
if (!button_append) {
button_append = 4;
}
else if (button_append == 4) {
button_append = 5;
}
else {
button_append = null;
}
}, goto_event:{event_index:10} } },

{ key:1, event_id:{ func:()=>{
MMD_SA.Gamepad.enabled = !MMD_SA.Gamepad.enabled;
  }, goto_event:{event_index:9} },
  onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.tooltip')
);
  },
},

{ key:2, event_id:{ func:()=>{
page2_type = 'default_control';
  }, goto_event:{event_index:10} },
  onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.tooltip')
);
  },
},

{ key:3, event_id:{ func:()=>{
page2_type = 'custom_control';
  }, goto_event:{event_index:10} },
  onmouseover: function (e) {
MMD_SA_options.Dungeon.utils.tooltip(
  e.clientX, e.clientY,
  System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls.tooltip')
);
  },
},

{ key:'X', get is_closing_event() { return !System._browser.hotkeys.disabled; }, event_id:{ func:()=>{
System._browser.hotkeys.disabled = false;

hotkey_id = hotkey_combo = hotkey_acc = null;
page2_type = null;
}, goto_event:{event_index:99} } },
      ];

      return [
// 9
        {
          func: ()=>{
if (page2_type) {
  MMD_SA_options.Dungeon.run_event();
}
else {
  MMD_SA.SpeechBubble.list[1].hide();
}
          },
          message: {
get content() {
let msgs;
if (hotkey_id) {
  let [b, r] = hotkey_id.split('+');
  msgs = [
System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.button') + ': ' + button_name_list[button_index_list.findIndex(i=>i==b)] + ((r) ? '+' + ((r==4)?'L1':'R1') : ''),
  ];
  if (hotkey_combo && System._browser.hotkeys.disabled) {
    msgs = msgs.concat([
' ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls.new_key') + ': ' + ((hotkey_combo.join('') && hotkey_combo.join('+')) || '(None)'),
System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls.changing_key'),
    ]);
  }
  else {
    msgs = msgs.concat([
' ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls.current_key') + ': ' + (hotkey_acc || ((hotkey_acc == '') && '(None)') || MMD_SA_options.gamepad[0].buttons[hotkey_id]?.key || '(None)'),
'K. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls.change_key'),
'R. ' + System._browser.translation.get('Misc.cancel'),
'S. ' + System._browser.translation.get('Misc.finish'),
    ]);
  }
}
else {
  msgs = [
'1. 🎮' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control') + ': ' + ((MMD_SA.Gamepad.enabled) ? 'ON': 'OFF'),
'2. ┣ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls'),
'3. ┗ ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls'),
'X. ' + System._browser.translation.get('Misc.done')
  ];
}

return msgs.join('\n')
},
bubble_index: 3,
para: { no_word_break:true, font_scale:1.25 },
branch_list: branch_list,
          },
        },

// 10
        {
          message: {
get content() {
let msgs;
if (page2_type == 'default_control') {
  msgs = [
System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.info'),
'M. 🕹️L: ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.joystick_left')  + (MMD_SA_options.gamepad[0].axes[0].sensitivity_percent||100) + '%' + ((default_control_option_active == 'joystick_left') ? '⬅️➡️' : ''),
'N. 🕹️R: ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.joystick_right') + (MMD_SA_options.gamepad[0].axes[2].sensitivity_percent||100) + '%' + ((default_control_option_active == 'joystick_right') ? '⬅️➡️' : ''),
'O. L2/R2: ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.adjust_default_controls.L2_R2') + (MMD_SA_options.gamepad[0].buttons[6].sensitivity_percent||100) + '%' + ((default_control_option_active == 'L2/R2') ? '⬅️➡️' : ''),
''
  ];
}
else {
  msgs = button_alpha_list.map((b,i)=>{
return b+'. ' + button_name_list[i] + ((button_append) ? '+' + ((button_append==4)?'L1':'R1') : '') + ': ' + (MMD_SA_options.gamepad[0].buttons[button_index_list[i] + ((button_append)?'+'+button_append:'')]?.key || '(None)');
  }).concat([
'I. ' + System._browser.translation.get('XR_Animator.UI.UI_options.miscellaneous_options.gamepad_control.change_custom_controls.next_8_button_combos'),
  ]);
}

return msgs.join('\n')
},
index: 1,
bubble_index: 3,
para: { row_max:11, font_scale:0.9, },
branch_list: branch_list,
          },
        },
      ];
    },
  }
})();
