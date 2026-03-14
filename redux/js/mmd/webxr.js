// MMD_SA WebXR — STUB (Ronda 2: AR/VR removed)
// Original: 898 lines → inert stub

window.MMD_SA_createWebXR = function () {
    var xr = {
        can_AR: false,
        session: null,
        input_event: { inputSources: [], touches: [] },
        zoom_scale: 1,
        hits: [],
        hits_searching: false,
        hit_found: false,
        anchors: new Set(),
        xrViewerSpaceHitTestSource: null,
        xrTransientInputHitTestSource: null,
        user_camera: System._browser.camera,
        enter_AR: async function () {},
        onSessionStart: async function () {},
        restore_scene: function () {},
        onSessionEnd: function () {},
        onARFrame: function () {},
        hit_test: function () {}
    };
    return xr;
};
