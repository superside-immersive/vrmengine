// Gamepad — STUB (Ronda 2: gamepad input removed)
// Original: 440 lines → inert stub

window.MMD_SA_createGamepad = function () {
    var _enabled = false;
    var _gamepad = {
        get enabled() { return _enabled; },
        set enabled(v) { _enabled = false; }, // always disabled
        get gamepads() { return []; },
        get control_profile() { return {}; },
        get control_profiles() { return {}; },
        create: function () {}
    };
    return _gamepad;
};
