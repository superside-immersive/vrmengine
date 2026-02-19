// MMD_SA OSC — Open Sound Control / VMC protocol
// Extracted from MMD_SA.js (OSC IIFE)

window.MMD_SA_createOSC = function () {

  class VMC {
    constructor(options={}) {
if (!options.plugin) {
  options.plugin = {
    open: MMD_SA_options.OSC?.VMC.open,
    send: MMD_SA_options.OSC?.VMC.send,
  };
}

this.options = options;
this.options_default = Object.clone(options);
    }

    #VMC_enabled=false;
    #VMC_initialized;
    #VMC_ready;
    #VMC_sender_enabled=false;
    #VMC_receiver_enabled=false;

    get enabled() { return this.#VMC_enabled; }
    set enabled(v) {
if (this.#VMC_enabled == !!v) return;

this.#VMC_enabled = !!v;

if (this.#VMC_enabled) {
  _OSC.enabled = true;
  this.init();
}
else {
  this.#VMC_sender_enabled = this.#VMC_receiver_enabled = false;
}
    }

    get sender_enabled() { return this.#VMC_sender_enabled; }
    set sender_enabled(v) {
if (this.#VMC_sender_enabled == !!v) return;

this.#VMC_sender_enabled = !!v;

if (this.#VMC_sender_enabled) {
  this.enabled = true;
  DEBUG_show('(OSC/VMC sender:ON/Port:' + this.options.plugin.send.port + ')', 5);
}
else {
  if (!this.#VMC_receiver_enabled)
    this.enabled = false;
  DEBUG_show('(OSC/VMC sender:OFF)', 3)
}

// Warudo mode
_OSC.VMC_camera.sender_enabled = v;
_OSC.VMC_misc.sender_enabled = v;
    }

    get receiver_enabled() { return this.#VMC_receiver_enabled; }
    set receiver_enabled(v) {
if (this.#VMC_receiver_enabled == !!v) return;

this.#VMC_receiver_enabled = !!v;

if (this.#VMC_receiver_enabled) {
// socket has to be recreated
// https://stackoverflow.com/questions/56003679/check-if-udp-socket-is-runing-on-a-certain-port-close-it-then-run-it-again
  if (!this.vmc) {
    this.enabled = false;
    this.#VMC_initialized = false;
  }

  this.enabled = true;
  this.vmc.open();
}
else {
  if (!this.#VMC_sender_enabled) this.enabled = false;
  this.vmc.close();

  this.vmc = null;
}
    }

    get ready() { return this.#VMC_enabled && this.#VMC_ready; }
    set ready(v) { this.#VMC_ready = v; }

    init() {
if (this.#VMC_initialized) return;
this.#VMC_initialized = true;

OSC_init();

this.plugin = new OSC.DatagramPlugin(this.options.plugin);
this.vmc = new OSC({ plugin:this.plugin });

this.vmc.on('open', () => {
//  this.#VMC_ready = true;
  DEBUG_show('(OSC/VMC receiver:ON/Port:' + this.options.plugin.open.port + ')', 5);
});

this.#VMC_ready = true;
    }

    Message(address, args=[], types) {
const msg = new OSC.Message(address, ...args);
if (types) msg.types = types;
return msg;
    }

    Bundle(...args) {
return new OSC.Bundle([...args], 0);
    }

    send(...args) {
this.vmc.send(...args);
    }
  }

  function OSC_init() {
if (initialized) return;
initialized = true;

OSC = require('node_modules.asar/OSC-js/node_modules/osc-js');
//console.log(OSC)

ready = true;
  }

  var OSC;
  var enabled=false, initialized, ready;

  var _OSC = {
    get enabled() { return enabled; },
    set enabled(v) {
if (enabled == !!v) return;

enabled = !!v;

if (enabled) {
  OSC_init();
}
    },

    get ready() { return enabled && ready; },

    VMC_class: VMC,
  };

// Warudo mode
//  _OSC.app_mode = 'Warudo';

  _OSC._VMC_warudo = null;

  (()=>{
    function VMC_warudo() {
if (_OSC.app_mode == 'Warudo') {
  _OSC._VMC_warudo = _OSC._VMC_warudo || new VMC({ plugin:{ send: { port:19190, host:_OSC.VMC.options.plugin.send.host||'localhost' } } });
  if (_OSC.VMC.options.plugin.send.host && _OSC._VMC_warudo.plugin && (_OSC._VMC_warudo.plugin.options.send.host != _OSC.VMC.options.plugin.send.host))
    _OSC._VMC_warudo.plugin.options.send.host = _OSC.VMC.options.plugin.send.host
}
else {
  _OSC._VMC_warudo = _OSC.VMC;
}

return _OSC._VMC_warudo;
    }

    Object.defineProperty(_OSC, 'VMC_camera', {
      get: ()=>{
return VMC_warudo();
      }
    });

    Object.defineProperty(_OSC, 'VMC_misc', {
      get: ()=>{
return VMC_warudo();
      }
    });
  })();

  window.addEventListener('load', ()=>{
    _OSC.VMC = new VMC();//{ plugin:{ send:MMD_SA_options.OSC?.VMC.send } });
  });

  return _OSC;

};
