// multiplayer.js - Extracted from dungeon.js (Step 6A)

MMD_SA_options.Dungeon.multiplayer = (function () {
    var enabled;

    var net = System._browser.P2P_network
    var d_options = MMD_SA_options.Dungeon_options

    if (self.ChatboxAT && !Chatbox_intro_msg) {
      Chatbox_intro_msg =
  '<p>Anime Theme World Online 3D - Chatbox Mini (' + ChatboxAT.Chatbox_version + ')</p>\n'
+ '<p>New comer? <a href="readme_multiplayer.txt" target="_blank" class=AutoChatCommand>Click here</a> to know more about this game.</p>\n'
+ '<p>Not a member? <a href="http://www.animetheme.com/cgi-bin/ikonboard/register.cgi" target="_blank" class=AutoChatCommand>Register now!</a></p>';
    }

    var online_data_cache_default = { data:{ OPC:{} } };
    var online_data_cache = Object.clone(online_data_cache_default);

    var PC_data = {
  game: {
    chapter_id: ""
   ,area_id: ""
  }
 ,motion: {
    name: ""
   ,changed: false
   ,time: 0
   ,playbackRate: 1
  }
 ,model: {
    position: []
   ,quaternion: []
  }
    };

    var _init_func;
    var peer_para_default = {
  events: {
    peer: {
      open: function (peer) {
ChatboxAT.smallMsg("(P2P network: Peer initialized successfully)")

if (parent.System._browser.url_search_params.host_peer_id) {
  MMD_SA_options.Dungeon.multiplayer.connect(parent.System._browser.url_search_params.host_peer_id, { onconnect:_init_func, onerror:_init_func })
}
else {
  _init_func()
}
      }
     ,error: function (peer, err) {
ChatboxAT.smallMsg("(P2P network: Peer error / " + (err.type) + ")")
      }
    }
   ,connection: {
      handshake_request: function (peer, connection) {
console.log("P2P_network: Remote Peer" + "(" + connection.peer + "/" + connection.label + "/host) responding handshake request from Peer-" + peer.index + "(" + peer.id + ")")
ChatboxAT.smallMsg("(P2P network: Connecting to host...)")
connection.send({ handshake:{ request:true, para:{ game_id:d_options.game_id, game_version:d_options.game_version, chapter_id:d_options.chapter_id } } })
      }
     ,handshake_respond: function (peer, connection, handshake) {
var mp = MMD_SA_options.Dungeon.multiplayer
if (handshake.request) {
// accept or reject
  var console_msg_rejected = "P2P_network: Remote Peer" + "(" + connection.peer + "/" + connection.label + "/host) rejected handshake request from Peer-" + peer.index + "(" + peer.id + ")"

  if (!handshake.para || (d_options.game_id != handshake.para.game_id) || (d_options.game_version != handshake.para.game_version) || (d_options.chapter_id != handshake.para.chapter_id)) {
    console.log(console_msg_rejected+'/'+"incompatible game", handshake.para)
    connection.send({ handshake:{ rejected:true, para:{ msg:"incompatible game" } } })
    connection.close(peer)
    return
  }

  if (mp.is_client) {
    console.log(console_msg_rejected+'/'+"not host", handshake.para)
    connection.send({ handshake:{ rejected:true, para:{ msg:"not host" } } })
    connection.close(peer)
    return
  }

  var connection_count = peer.connections.length
  var connection_max = d_options.multiplayer.OPC_list.length
  if (connection_count > connection_max) {
    console.log(console_msg_rejected+'/'+"host full", handshake.para)
    connection.send({ handshake:{ rejected:true, para:{ msg:"host full" } } })
    connection.close(peer)
    return
  }

  mp.is_host = true

  mp.online = true
  connection.status = "connected"
  console.log("P2P_network: Remote Peer" + "(" + connection.peer + "/" + connection.label + "/client)'s handshake request accepted from Peer-" + peer.index + "(" + peer.id + ")")

  var OPC_index_used = {}
  for (var id in peer.connections) {
    var connection = peer.connections[id]
    if (connection._para && connection._para.OPC_index)
      OPC_index_used[connection._para.OPC_index] = true
  }
  var OPC_index
  for (var i = 1; i < connection_max+1; i++) {
    if (!OPC_index_used[i]) {
      OPC_index = i
      break
    }
  }

  connection._para = { OPC_index:OPC_index }
  var para = {
    OPC_index:OPC_index
  };
  connection.send({ handshake:{ accepted:true, para:para } })

//  ChatboxAT.smallMsg("(P2P network: Remote Peer" + "(" + (handshake.para.name || (connection.peer + "/" + connection.label)) + ") connected (" + (connection_count+1) + "/" + (connection_max+1) + ")")
  var msg = "Player-" + (OPC_index+1) + " has joined the game (" + (connection_count+1) + "/" + (connection_max+1) + ")."
  ChatboxAT.smallMsg(msg)
  online_data_cache.data.msg_out = (online_data_cache.data.msg_out || []).concat(['<p class=Msg_Default>' + msg + '</p>'])
}
else if (handshake.accepted) {
  mp.is_client = true

  mp.online = true
  connection.status = "connected"
  console.log("P2P_network: Remote Peer" + "(" + connection.peer + "/" + connection.label + "/host) accepted handshake request from Peer-" + peer.index + "(" + peer.id + ")")
// resolve() from Peer.connect's Promise
  if (peer.para.events.connection.handshake_request_accecpted && peer.para.events.connection.handshake_request_accecpted[connection.label]) {
    peer.para.events.connection.handshake_request_accecpted[connection.label]({peer, connection, handshake})
    delete peer.para.events.connection.handshake_request_accecpted[connection.label]
  }
}
else {
  console.log("P2P_network: Remote Peer" + "(" + connection.peer + "/" + connection.label + "/host) rejected handshake request from Peer-" + peer.index + "(" + peer.id + ")")
// reject() from Peer.connect's Promise
  if (peer.para.events.connection.handshake_request_rejected && peer.para.events.connection.handshake_request_rejected[connection.label]) {
    let return_value = peer.para.events.connection.handshake_request_rejected[connection.label]({peer, connection, handshake})
    delete peer.para.events.connection.handshake_request_rejected[connection.label]
    if (return_value)
      return
  }
  connection.close(peer)
}
      }
     ,data: (function () {
        var send_data_timestamp = 0;
        return function (peer, connection, data) {
if (!data.data)
  return

var time = Date.now()

if (data.data.msg) {
  online_data_cache.data.msg = (online_data_cache.data.msg || []).concat(data.data.msg)
}

var OPC_data_all = data.data.OPC
if (OPC_data_all) {
  var OPC_data_cache = online_data_cache.data.OPC

  Object.keys(OPC_data_all).forEach(function (index) {
    var OPC_data = OPC_data_all[index]
    var cache = OPC_data_cache[index]
// ignore "dummy" data if cache exists
    if (!OPC_data.game && cache)
      delete OPC_data_all[index]
    else {
// motion.changed is reset if only it has been processed
      if (OPC_data.motion && cache && cache.motion && cache.motion.changed)
        OPC_data.motion.changed = true
    }
  });
  Object.append(OPC_data_cache, OPC_data_all)
}

// to counter background throttling, by utilizing the network events from other peers as "timer" (i.e. events of connection.send())
if (document.hidden) {
  if (time > send_data_timestamp + 1000/30) {
    MMD_SA_options.Dungeon.multiplayer.process_remote_online_data()
    MMD_SA_options.Dungeon.multiplayer.update_online_data()
    send_data_timestamp = time
  }
}
        };
      })()
     ,close: function (peer, connection) {
var mp = MMD_SA_options.Dungeon.multiplayer
if (connection._para) {
  if (connection._para.OPC_index != null) {
    var msg = "Player-" + (connection._para.OPC_index+1) + " has left the game."
    ChatboxAT.smallMsg(msg)
    online_data_cache.data.msg_out = (online_data_cache.data.msg_out || []).concat(['<p class=Msg_Default>' + msg + '</p>'])
    delete online_data_cache.data.OPC[connection._para.OPC_index]
  }
}
if (peer.connections.length <= 1) {
// clear OPC
  online_data_cache = Object.clone(online_data_cache_default)
  mp.process_remote_online_data()

  mp.online = false
  mp.is_host = false
  mp.is_client = false

  console.log("(No connected player)")
  ChatboxAT.smallMsg("(No connected player)")
}
      }
    }
   ,send_message: (function () {
      var host_command_timestamp = 0;
      var host_command_timerID;
      return function (para) {
/*
return
- "": send no message
- null: send original message
- custom: send customized message
*/
var mp = MMD_SA_options.Dungeon.multiplayer
if (!para.command) {
  if (para.id && para.pass)
    return null

  var name = para.name
  if (!mp.online) {
    name += "(offline)"
  }
  else {
    name += "(PC-" + (mp.OPC_index[0]+1) + ")"
  }

  var msg = name + ": " + para.msg
  if (!mp.online || mp.is_host)
    ChatboxAT.ChatShow([msg])
  if (mp.online)
    online_data_cache.data.msg_out = (online_data_cache.data.msg_out || []).concat([msg])
}
else {
  var peer = net.peer_default
  switch (para.command) {
    case "host":
      if (mp.is_client) {
        ChatboxAT.smallMsg("You cannot host a game in client mode.")
        break
      }

      var time = Date.now()
      if (time < host_command_timestamp + 30*1000) {
        ChatboxAT.smallMsg("No repeated host command in " + Math.round(30 - (time - host_command_timestamp) / 1000) + " second(s)")
        break
      }
      host_command_timestamp = time

      mp.is_host = true

      if (!para.para1) {
        if (!ChatboxAT.Chatbox_online_mode()) {
          try {
            setTimeout(function () {
Fchat_msg.value = peer.id
Fchat_msg.select()
document.execCommand("copy")
            }, 100);
          }
          catch (err) {}
        }

        if (host_command_timerID) clearInterval(host_command_timerID);
        host_command_timerID = setInterval(function () {
ChatboxAT.SendData_ChatSend([System._browser.P2P_network.process_message('/host auto', true)])
// every 3 minutes
        }, 3*60*1000);
      }
      else {
// auto update
      }

//($game_id, $game_path, $connection_count, $connection_max)
      var path_local = Settings.f_path
      if (path_local.indexOf(System.Gadget.path) == 0)
        path_local = path_local.substring(System.Gadget.path.length).replace(/\\/g, "/").replace(/^\/+/, "/")
      return "/host [" + peer.id + "] " + encodeURIComponent([d_options.game_id+"/v"+(d_options.game_version), path_local, peer.connections.length, d_options.multiplayer.OPC_list.length].join("|"))
    case "connect":
      if (!para.para1)
        ChatboxAT.smallMsg("No host peer ID specified")
      else
        mp.connect(para.para1)
      break
    default:
      return null
  }
}

return ""
      };
    })()
  }
    };

    var v3a, q1

    return {
  online: false

 ,get online_data_cache() { return online_data_cache; }

 ,init: function (init_func) {
if (!SA_project_JSON || !SA_project_JSON.P2P_network)
  delete d_options.multiplayer

var enabled = !!d_options.multiplayer
if (!enabled) {
  init_func()
  return 
}

System._browser.on_animation_update.add(function () {
  MMD_SA_options.Dungeon.multiplayer.process_remote_online_data()
},0,0, -1);

System._browser.on_animation_update.add(function () {
  MMD_SA_options.Dungeon.multiplayer.update_online_data()
},0,1, -1);

for (var i = 0, i_max = d_options.multiplayer.OPC_list.length; i <= i_max; i++)
  this.OPC_index[i] = i

this.OPC_index.forEach(function (idx) {
  var model_para = MMD_SA_options.model_para_obj_all[(idx == 0) ? 0 : idx-1 + d_options.multiplayer.OPC_index0]
  model_para.OPC_index = idx
  if (idx > 0) {
    model_para.look_at_character = null
    model_para.look_at_target = null
    model_para.look_at_screen = false
  }
});

//MMD_SA_options.look_at_screen = false
//MMD_SA_options.look_at_mouse = false

window.addEventListener("jThree_ready", function () {
v3a = new THREE.Vector3()
q1 = new THREE.Quaternion()

// temp
//MMD_SA_options.Dungeon.multiplayer.online = true
//MMD_SA_options.Dungeon.multiplayer.arrange_OPC([1,0])
});

_init_func = init_func

if (net.status != "off") {
  init_func()
  return
}

ChatboxAT.smallMsg("(P2P network: Initializing peer...)")
new net.peer(peer_para_default)
  }

 ,connect: function (peer_id, para_connect={}) {
if (!net.peer_default) {
  ChatboxAT.smallMsg("(P2P network: Peer not initialized yet)")
  return
}
if (net.peer_default.status == "connecting") {
  ChatboxAT.smallMsg("(P2P network: Still connecting)")
  return
}
if (this.is_host) {
  ChatboxAT.smallMsg("You cannot join another game in host mode.")
  return
}
if (net.peer_default.connections.length) {
  ChatboxAT.smallMsg("You have joined a game already.")
  return
}

var that = this
net.peer_default.connect(peer_id).then(function (para) {
// peer, connection, handshake
  var peer = para.peer
  var connection = para.connection
  var handshake = para.handshake

  var list = [handshake.para.OPC_index]
  for (var i = 1, i_max = d_options.multiplayer.OPC_list.length; i <= i_max; i++) {
    list.push((handshake.para.OPC_index == i) ? 0 : i)
  }
  that.arrange_OPC(list)
//console.log(list)
  ChatboxAT.smallMsg("(P2P network: Host connected / Player " + (handshake.para.OPC_index+1) + "/" + (d_options.multiplayer.OPC_list.length+1) + ")")

  net.peer_default.status = "connected"
  para_connect.onconnect && para_connect.onconnect(para)
//}).catch(function () {
}).catch(function (err) {
//  if (err && err.type)
  ChatboxAT.smallMsg("(P2P network: Remote connection failed, check console for details)")

  net.peer_default.status = "connected"
  para_connect.onerror && para_connect.onerror()
});

// to prevent simultaneous connection attempts
net.peer_default.status = "connecting"
  }

 ,OPC_index: []
 ,arrange_OPC: function (list) {
var that = this

var path_list = [MMD_SA_options.model_path].concat(MMD_SA_options.model_path_extra)
var swapped_index = []
list.forEach(function (OPC_index, idx) {
  var c_index_OLD = (idx == 0) ? 0 : idx-1 + d_options.multiplayer.OPC_index0
  if (swapped_index[c_index_OLD])
    return
  swapped_index[c_index_OLD] = true

  var c_index_NEW = (OPC_index == 0) ? 0 : OPC_index-1 + d_options.multiplayer.OPC_index0
  if (swapped_index[c_index_NEW])
    return
  swapped_index[c_index_NEW] = true

  var model_para_obj_OLD = MMD_SA_options.model_para_obj_all[c_index_OLD]
  var model_para_obj_NEW = MMD_SA_options.model_para_obj_all[c_index_NEW]
  MMD_SA_options.model_para_obj_all[c_index_OLD] = model_para_obj_NEW
  MMD_SA_options.model_para_obj_all[c_index_NEW] = model_para_obj_OLD
  model_para_obj_OLD._model_index = c_index_NEW
  model_para_obj_NEW._model_index = c_index_OLD
  if (c_index_OLD == 0) {
    MMD_SA_options.model_para_obj = model_para_obj_NEW
    MMD_SA_options.model_para_obj.is_OPC = false
    if (!MMD_SA_options.MME.PostProcessingEffects)
      MMD_SA_options.MME.PostProcessingEffects = (model_para_obj_OLD.MME && model_para_obj_OLD.MME.PostProcessingEffects) || MMD_SA_options._MME.PostProcessingEffects
    model_para_obj_OLD.is_OPC = true
    model_para_obj_OLD.is_PC_candidate = true
  }
  else {
    model_para_obj_NEW.is_OPC = true
    model_para_obj_NEW.is_PC_candidate = true
  }

  var path_OLD = path_list[c_index_OLD]
  var path_NEW = path_list[c_index_NEW]
  path_list[c_index_OLD] = path_NEW
  path_list[c_index_NEW] = path_OLD
});

list.forEach(function (OPC_index, idx) {
  var model_para = MMD_SA_options.model_para_obj_all[(idx == 0) ? 0 : idx-1 + d_options.multiplayer.OPC_index0]
  model_para.OPC_index = idx
  model_para.look_at_screen = (idx == 0) ? null : false
});

var clone_list = {}
path_list.forEach(function (path) {
  var filename = path.replace(/^.+[\/\\]/, "").replace(/\.pmx$/i, "")
  var clone_index = 0
  if (/^(.+)\#clone(\d+)/.test(filename)) {
    filename = RegExp.$1
    clone_index = RegExp.$2
  }
  var path_obj = path_list[filename] = path_list[filename] || { clone_max:0 }
  path_obj.clone_max = Math.max(clone_index, path_obj.clone_max)
});
path_list.forEach(function (path, idx) {
  var filename = path.replace(/^.+[\/\\]/, "").replace(/\.pmx$/i, "")
  var clone_index = 0
  if (/^(.+)\#clone(\d+)/.test(filename)) {
    filename = RegExp.$1
    clone_index = RegExp.$2
  }
  var path_obj = path_list[filename]
  if (path_obj.clone_max) {
    if (!path_obj._index)
      path = path.replace(/\#clone(\d+)/, "")
    else
      path = path.replace(/\#clone(\d+)/, "").replace(/\.pmx$/i, "") + "#clone" + path_obj._index + ".pmx"
    path_obj._index = (path_obj._index||0) + 1
  }
  path_list[idx] = path
});

MMD_SA_options.model_path = path_list[0]
MMD_SA_options.model_path_extra = path_list.slice(1)

this.OPC_index = list
  }

 ,update_online_data: (function () {
    var last_updated = 0

    return function () {
var d = MMD_SA_options.Dungeon
if (!this.online)
  return

var time = Date.now()
//30fps
if (time - last_updated < 1000/30) return
last_updated = time

if (d.started) {
  var mm = MMD_SA.MMD.motionManager
  var model = THREE.MMD.getModels()[0]
  var model_para = MMD_SA_options.model_para_obj
  var mesh = model.mesh

  PC_data.game.chapter_id = d.chapter_id
  PC_data.game.area_id = d.area_id

  PC_data.motion.changed = (PC_data.motion.name != mm.filename) || (mm.para_SA.BPM && (Math.abs(PC_data.motion.time - model.skin.time) > 1))// || ((model_para._playbackRate_OPC_ || 1) != PC_data.motion.playbackRate)
  PC_data.motion.time = model.skin.time
  PC_data.motion.name = mm.filename
  PC_data.motion.playbackRate = model_para._playbackRate_OPC_ || 1

  PC_data.model.position = mesh.position.toArray()
  PC_data.model.quaternion = mesh.quaternion.toArray()
}

this.send_online_data()
    };
  })()

 ,send_online_data: function () {
var d = MMD_SA_options.Dungeon
if (!this.online)
  return

// inline version of online_data_cache_default (faster)
var online_data = { data:{ OPC:{} } };//Object.clone(online_data_cache_default)

var need_update
if (online_data_cache.data.msg_out) {
  need_update = true
  online_data.data.msg = online_data_cache.data.msg_out
  delete online_data_cache.data.msg_out
}

if (d.started) {
  need_update = true
  online_data.data.OPC[this.OPC_index[0]] = PC_data;

  var OPC_data_cache = online_data_cache.data.OPC
  if (this.is_host) {
    for (var index in OPC_data_cache) {
      var OPC_data = OPC_data_cache[index]
      online_data.data.OPC[index] = Object.assign({}, OPC_data)
    }
  }
  for (var index in OPC_data_cache) {
    var OPC_data = OPC_data_cache[index]
// sent cache can be safely cleared after processed
    OPC_data._sent = true
  }
}

// send dummy data even when there is no update, to counter background throttling, by providing the network events as "timer" for peers in background (i.e. events of connection.send())
//if (!need_update) return

for (var id in net.peer_default.connections) {
  var c = net.peer_default.connections[id]
  c.send(online_data)
}

// temp (simulate the event when online data is received from remote
/*
online_data.data.OPC[0] = online_data.data.OPC[1]
delete online_data.data.OPC[1]
System._browser.on_animation_update.add(function () {
  MMD_SA_options.Dungeon.multiplayer.process_remote_online_data(online_data)
},0,0);
*/
  }

 ,process_remote_online_data: function (online_data) {
var d = MMD_SA_options.Dungeon
if (!this.online)
  return

var that = this

if (!online_data)
  online_data = online_data_cache

if (online_data.data.msg) {
  ChatboxAT.ChatShow(online_data.data.msg)
  if (this.is_host)
    online_data_cache.data.msg_out = (online_data_cache.data.msg_out || []).concat(online_data_cache.data.msg)
  delete online_data.data.msg
}

var OPC_data_all = online_data.data.OPC
this.OPC_index.forEach(function (OPC_index, idx) {
// ignore index for PC
  if (OPC_index == 0)
    return
  OPC_index--

  var id, obj_base_index, obj_base, character_index, _obj
  if (d.started) {
    id = d.object_id_translated["OPC-"+OPC_index]
    if (/^object(\d+)_(\d+)$/.test(id)) {
      obj_base_index = parseInt(RegExp.$1)
      obj_base = d.object_base_list[obj_base_index]
      character_index = obj_base.character_index
      _obj = obj_base.object_list[parseInt(RegExp.$2)]
    }
  }

  var OPC_data = OPC_data_all[idx]
// offline/unused OPC
  if (!OPC_data) {
    if (_obj) {
      _obj._obj_proxy.hidden = true
      _obj._obj_proxy.visible = false
    }
    return
  }

// no update
  if (!OPC_data.game)
    return

// game not started yet
  if (!_obj || !d.started)
    return

// not in the same chapter/area
  if ((OPC_data.game.chapter_id != d.chapter_id) || (OPC_data.game.area_id != d.area_id)) {
    _obj._obj_proxy.hidden = true
    _obj._obj_proxy.visible = false
    return
  }

// Set .visible to true if model is current hidden. Otherwise, let the game decide whether the model should be shown (by view distance, etc).
  var reset_visible = _obj._obj_proxy.hidden
  _obj._obj_proxy.hidden = false
  if (reset_visible)
    _obj._obj_proxy.visible = true

  var npc_model = THREE.MMD.getModels()[character_index]
// use _obj._obj because it works with ._obj_proxy
  var mesh = _obj._obj//npc_model.mesh

  if (OPC_data.motion) {
    var npc_motion = MMD_SA.motion[npc_model.skin._motion_index]
    var model_para = MMD_SA_options.model_para_obj_all[character_index]
    if (OPC_data.motion.changed/* || (npc_motion.filename != OPC_data.motion.name)*/) {
      var npc_motion_para = MMD_SA.motion[npc_model.skin._motion_index].para_SA
      model_para._motion_name_next = OPC_data.motion.name
      model_para._firstFrame_ = OPC_data.motion.time*30
//DEBUG_show(Date.now())
    }
    model_para._playbackRate_OPC_ = OPC_data.motion.playbackRate
  }

  if (OPC_data.model) {
    mesh.position.fromArray(OPC_data.model.position)
// temp
//mesh.position.x+=10
    mesh.quaternion.fromArray(OPC_data.model.quaternion)
//DEBUG_show(Date.now())
  }

// cache can be safely reset if it has been sent
  if (OPC_data._sent)
    OPC_data_all[idx] = {}
});
  }
    };
})();
