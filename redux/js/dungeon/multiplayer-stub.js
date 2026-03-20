// multiplayer-stub.js - Safe compatibility stub for XR-only runtime

MMD_SA_options.Dungeon.multiplayer = {
  disabled: true,
  online: false,
  is_host: false,
  is_client: false,

  init: function (sb_func) {
    if (typeof sb_func == 'function')
      sb_func();
  },

  connect: function (peer_id, para_connect) {
    if (para_connect && typeof para_connect.onerror == 'function') {
      try {
        para_connect.onerror({ disabled:true, peer_id:peer_id });
      }
      catch (err) {}
    }
    return Promise.resolve(null);
  },

  process_remote_online_data: function () {},
  update_online_data: function () {},
  arrange_OPC: function () {},
};