// OSC/VMC — STUB (Ronda 2: OSC protocol removed)
// Original: 189 lines → inert stub

window.MMD_SA_createOSC = function () {
    function VMC() {}
    VMC.prototype.enabled = false;
    VMC.prototype.sender_enabled = false;
    VMC.prototype.receiver_enabled = false;
    VMC.prototype.ready = false;
    VMC.prototype.init = function () {};
    VMC.prototype.Message = function () { return {}; };
    VMC.prototype.Bundle = function () { return {}; };
    VMC.prototype.send = function () {};

    var _OSC = {
        get enabled() { return false; },
        set enabled(v) {},
        get ready() { return false; },
        VMC_class: VMC,
        _VMC_warudo: null,
        VMC: null
    };

    Object.defineProperty(_OSC, 'VMC_camera', { get: function () { return null; } });
    Object.defineProperty(_OSC, 'VMC_misc', { get: function () { return null; } });

    // Lazy-init stub on window load (matches original pattern)
    window.addEventListener('load', function () {
        _OSC.VMC = new VMC();
    });

    return _OSC;
};
