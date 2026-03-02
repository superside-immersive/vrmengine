// CameraShake — extracted from MMD_SA.js
// Original: MMD_SA.CameraShake IIFE

window.MMD_SA_createCameraShake = function () {

  var CS_offset_pos;
  window.addEventListener("jThree_ready", (e) => {
    CS_offset_pos = new THREE.Vector3()
  });

  var CS_offset_angle = 0
  var CS_frame_interval = 1000/30
  var CS_frame_time = CS_frame_interval

  var CS = function (id, magnitude, duration, graph={}) {
    this.id = id
    this.magnitude = magnitude
    this.duration = duration

    graph.decay_power = graph.decay_power||2
    this.graph = graph

    this.time = 0
  };

  var CS_list = []

  window.addEventListener("MMDStarted", (e) => {
//MMD_SA.CameraShake.shake("", 0.1, 3*1000, 0)

    window.addEventListener("SA_MMD_before_render", (e) => {
var CS_magnitude = 0
CS_list = CS_list.filter((cs) => {
  if (cs.started) {
    cs.time += RAF_timestamp_delta
    if (cs.time > cs.duration)
      return false
  }
  cs.started = true

  var magnitude = cs.magnitude
  if (cs.graph.func) {
    magnitude *= cs.graph.func(cs)
  }
  else {
    let t = (cs.duration - cs.time) / cs.duration
    if (cs.graph.reversed)
      t = 1-t
    magnitude *= Math.pow(t, cs.graph.decay_power)
  }
  if (CS_magnitude < magnitude)
    CS_magnitude = magnitude

  return true
});

if (CS_magnitude) {
  CS_frame_time += RAF_timestamp_delta
  if (CS_frame_time > CS_frame_interval) {
    CS_frame_time = CS_frame_time % CS_frame_interval
    CS_offset_angle = (CS_offset_angle + Math.PI/2 + Math.random() * Math.PI) % (Math.PI*2)
    CS_offset_pos.set(Math.cos(CS_offset_angle), Math.sin(CS_offset_angle), 0).multiplyScalar(CS_magnitude).applyQuaternion(MMD_SA._trackball_camera.object.quaternion)
  }
  MMD_SA._trackball_camera.object.position.add(CS_offset_pos)
}
else {
  CS_offset_pos.set(0,0,0)
  CS_offset_angle = 0
  CS_frame_time = CS_frame_interval
}
    });

    window.addEventListener("SA_MMD_after_render", (e) => {
MMD_SA._trackball_camera.object.position.sub(CS_offset_pos);
    });
  });

  return {
    shake: function (id, magnitude, duration, graph) {
var cs = new CS(id, magnitude, duration, graph)

if (cs.id) {
  let index = CS_list.findIndex((_cs)=>(cs.id==_cs.id))
  if (index != -1)
    CS_list[index] = cs
}
else
  CS_list.push(cs)
    },
  };

};
