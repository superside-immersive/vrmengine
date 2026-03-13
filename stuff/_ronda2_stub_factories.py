#!/usr/bin/env python3
"""Ronda 2: Replace factory modules with minimal stubs."""
import os

BASE = os.path.join(os.path.dirname(__file__), '..', 'redux', 'js', 'mmd')

stubs = {
    'webxr.js': '''\
// MMD_SA WebXR — STUB (Ronda 2: AR/VR removed)
// Original: 898 lines → inert stub

window.MMD_SA_createWebXR = function () {
    var xr = {
        can_AR: false,
        input_event: { inputSources: [], touches: [] },
        zoom_scale: 1,
        hits: [],
        hits_searching: false,
        hit_found: false,
        anchors: new Set(),
        xrViewerSpaceHitTestSource: null,
        xrTransientInputHitTestSource: null,
        user_camera: null,
        enter_AR: async function () {},
        onSessionStart: async function () {},
        restore_scene: function () {},
        onSessionEnd: function () {},
        onARFrame: function () {},
        hit_test: function () {}
    };
    return xr;
};
''',

    'gamepad.js': '''\
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
''',

    'osc.js': '''\
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
''',

    'wallpaper3d.js': '''\
// Wallpaper3D — STUB (Ronda 2: 3D wallpaper/panorama removed)
// Original: 1511 lines → inert stub

window.MMD_SA_createWallpaper3D = function () {
    var _wallpaper_3D = {
        scale_base: 200,
        tex_dim: 2048,
        depth_dim: 512,
        get enabled() { return false; },
        set enabled(v) {},
        depth_model_name: {},
        SR_model_name: {},
        depth_effect: {
            get enabled() { return false; },
            set enabled(v) {},
            get ready() { return false; },
            needsUpdate: false,
            type: '',
            update_depth: function () {},
            load: async function () {},
            stop: function () {},
            apply: function () {}
        },
        converter: {
            get running() { return false; },
            get stage() { return ''; },
            start: async function () {},
            pause: function () {},
            play: function () {},
            stop: function () {}
        },
        options_to_save: [],
        options_by_filename: {},
        options_general: {},
        options: {},
        busy: false,
        get visible() { return false; },
        set visible(v) {},
        get ar() { return 1; },
        get camera_factor() { return 1; },
        get d_to_full_screen() { return 1; },
        generate_mesh: function () {},
        generate_depth_map: async function () {},
        end_worker: function () {},
        init_worker: async function () {},
        update_frame_common: function () {},
        update_frame: function () {},
        init: async function () {},
        load: async function () {},
        update_camera_factor: function () {},
        update_transform: function () {},
        update_mesh: function () {},
        export_mesh: async function () {}
    };
    return _wallpaper_3D;
};
'''
}

for filename, content in stubs.items():
    path = os.path.join(BASE, filename)
    before = len(open(path).readlines())
    with open(path, 'w') as f:
        f.write(content)
    after = len(content.strip().splitlines())
    print(f"{filename}: {before} → {after} lines")

print("\nAll stubs written.")
