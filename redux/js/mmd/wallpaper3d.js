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
