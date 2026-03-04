/**
 * @file collision.js
 * @description Collision detection system for the dungeon mode.
 * Handles sphere-sphere, bounding-box, mesh-based, and octree capsule collisions.
 * Extracted from dungeon.js — assigns d.check_collision.
 */
(function () {
var d = MMD_SA_options.Dungeon;

d.check_collision = (function () {
var subject_bs, object_bs
var s, d, c, p, a, i, intersection, normal
var moved_final, _moved_final, moved_before_bb_check
var _v3, _v3a, _v3b, _v3c, _v3d, _v3e
var _q, _q2

var subject_bb, object_bb, ray, ray_normal, subject_bb_moved
var _m4, _bb, _c, _d, intersection2, s_bb, s_bb_moved

var character = MMD_SA_options.Dungeon.character
var bb_translate_offset
var local_mesh_sorting_range_buffer = 8
var _lazy_inited = false

function _lazy_init() {
  if (_lazy_inited) return
  _lazy_inited = true
  subject_bs = new THREE.Sphere()
  object_bs  = new THREE.Sphere()
  s = new THREE.Vector3()
  d = new THREE.Vector3()
  c = new THREE.Vector3()
  p = new THREE.Vector3()
  a = new THREE.Vector3()
  i = new THREE.Vector3()
  intersection = new THREE.Vector3()
  normal = new THREE.Vector3()
  moved_final = new THREE.Vector3()
  _moved_final = new THREE.Vector3()
  moved_before_bb_check = new THREE.Vector3()
  _v3  = new THREE.Vector3()
  _v3a = new THREE.Vector3()
  _v3b = new THREE.Vector3()
  _v3c = new THREE.Vector3()
  _v3d = new THREE.Vector3()
  _v3e = new THREE.Vector3()
  _q  = new THREE.Quaternion()
  _q2 = new THREE.Quaternion()
  subject_bb = new THREE.Box3()
  object_bb  = new THREE.Box3()
  ray = new THREE.Ray()
  ray_normal = new THREE.Ray()
  subject_bb_moved = new THREE.Box3()
  _bb = new THREE.Box3()
  _m4 = new THREE.Matrix4()
  _c = new THREE.Vector3()
  _d = new THREE.Vector3()
  s_bb = new THREE.Vector3()
  s_bb_moved = new THREE.Vector3()
  bb_translate_offset = new THREE.Vector3()
}

return function (_subject, mov_delta, skip_ground_obj_check, para={}) {
  _lazy_init()
  function center_rotate(q, inversed, restored) {
    var identity = (para.collision_centered) ? !inversed : inversed;
    identity = (restored) ? !identity : identity;
    if (identity) {
      return _q.set(0,0,0,1)
    }

    _q.copy(q)
    if (inversed)
      _q.conjugate()

    return _q
  }

  para._subject = _subject

  var use_bb_translate_offset
  var subject_is_PC = (_subject.obj == character)
  if (subject_is_PC) {
    if (!para.bb_translate)
      para.bb_translate = character.bb_translate
// bb_translate offset for mesh collision
    if (para.bb_translate && para.bb_translate._default) {
      use_bb_translate_offset = true
      bb_translate_offset.copy(para.bb_translate._default).sub(para.bb_translate)
    }
//DEBUG_show([para.bb_translate.x,para.bb_translate.y,para.bb_translate.z].join("\n")+"\n\n"+ bb_translate_offset.toArray().join("\n")+"\n\n"+ Date.now())
  }

  var that = this

  var subject = _subject.obj._obj

  subject_bs.copy(subject.geometry.boundingSphere)
  subject_bs.radius *= Math.max(subject.scale.x, subject.scale.y, subject.scale.z)
  var bb_translate
  if (para.bb_translate) {
    bb_translate = _v3a.set(subject_bs.radius,subject_bs.radius,subject_bs.radius).multiply(para.bb_translate).applyQuaternion(center_rotate(subject.quaternion))
    bb_translate.add(subject.position)
  }
  else {
    bb_translate = subject.position
  }
//var XYZ = bb_translate.clone()
//var DEF = subject_bs.center.clone()
  subject_bs.center.add(bb_translate)
//var ABC = subject_bs.center.clone()
  if (para.bb_expand) {
    subject_bs.radius *= Math.max(para.bb_expand.x, para.bb_expand.y, para.bb_expand.z) + 1
  }

  var null_move
  var mov_delta_length, moved_dis_max

// https://gamedev.stackexchange.com/questions/96459/fast-ray-sphere-collision-code
// s: the start point of the ray
  s.copy(subject_bs.center)
// d: a unit vector in the direction of the ray. 
  d.copy(mov_delta).normalize()

  var collision = false
  var collision_by_mesh_checked = false
  var collision_by_mesh_failed = false
  var obj_hit, ground_obj
  moved_final.copy(mov_delta).applyQuaternion(center_rotate(subject.quaternion, true))

  subject_bb.copy(subject.geometry.boundingBox)

// save some headache for octree intersect
  if (subject_bb.min.y < 0) subject_bb.min.y = 0;

/*
// save some headaches by setting xz center as (0,0), with equal xz size
  subject_bb.size(_v3)
  var _xz = (_v3.x+_v3.z)*0.5
  subject_bb.min.x = subject_bb.min.z = -_xz
  subject_bb.max.x = subject_bb.max.z =  _xz
*/

  subject_bb.size(_v3)
  if (para.bb_translate) {
    bb_translate = _v3a.copy(_v3).multiply(para.bb_translate).applyQuaternion(center_rotate(subject.quaternion))
    bb_translate.add(subject.position)
  }
  else
    bb_translate = subject.position
  if (para.bb_expand) {
    subject_bb.expandByVector(_v3b.copy(_v3).multiply(para.bb_expand).multiplyScalar(0.5))
//DEBUG_show(subject_bb.size(_v3).toArray())
  }

  if (use_bb_translate_offset) {
    if (para.bb_expand)
      bb_translate_offset.multiply(_v3a.copy(para.bb_expand).addScalar(1))
    bb_translate_offset.multiply(_v3).applyQuaternion(center_rotate(subject.quaternion))
//DEBUG_show(bb_translate_offset.toArray()+'n'+Date.now())
  }

// updating from .quaternion/.position instead of .matrixWorld should be more updated
  subject_bb.applyMatrix4(_m4.makeRotationFromQuaternion(center_rotate(subject.quaternion)))//subject.matrixWorld)//
  subject_bb.translate(bb_translate)
//  var b_center = subject.bones_by_name["センター"]
//  subject_bb.translate(_v3.copy(subject.position).add(b_center.position).sub(_v3a.fromArray(b_center.pmxBone.origin)))
  subject_bb.center(s_bb)


  ray_normal.set(_v3.copy(s_bb).add(_v3a.copy(d).multiplyScalar(-999)), d);

  var obj_base_dummy = { character_index:0 }
  var followed = {}
  if (subject_is_PC) {
    this.PC_follower_list.forEach(function (follower) {
      if (follower.obj && (follower.obj._obj.id != null))
        followed[follower.obj._obj.id] = true
    });
  }

  var obj_list
  if (para.object_list) {
    obj_list = para.object_list
  }
  if (MMD_SA.THREEX._object3d_list_) {
    obj_list = (obj_list||[]).concat(MMD_SA.THREEX._object3d_list_);
  }
  if (!obj_list || para.check_grid_blocks) {
    obj_list = (obj_list && obj_list.concat(this.grid_blocks.objs)) || this.object_list_in_view
    this.grid_blocks.update(subject.position)
  }

  obj_list.forEach(function (obj, idx) {
if (obj.is_dummy)
  return

if (obj._mesh == subject)
  return

if (obj.no_collision || MMD_SA_options.Dungeon.no_collision)
  return

var cache = obj._obj
if (!cache.visible)
  return

if (para.collision_by_mesh_disabled && obj.collision_by_mesh_enforced)
  return

if (subject_is_PC && (cache.id != null) && followed[cache.id])
  return

if (obj.oncollisioncheck && obj.oncollisioncheck(subject))
  return

var obj_base = obj._obj_base || that.object_base_list[obj.object_index] || obj_base_dummy;

object_bs.copy(obj._obj_proxy.boundingSphere)
object_bs.center.add(cache.position)

var object_scale = Math.max(cache.scale.x, cache.scale.y, cache.scale.z)
object_bs.radius *= object_scale * ((obj_base.construction && obj_base.construction.boundingSphere_radius_scale) || 1)//((obj_base.character_index != null) ? 0.5 : 1))

// c: the center point of the sphere
c.copy(object_bs.center)
// r: its radius
var r = object_bs.radius

null_move = !moved_final.x && !moved_final.y && !moved_final.z
mov_delta_length = moved_final.length()
moved_dis_max = subject_bs.radius + mov_delta_length

subject_bb_moved.copy(subject_bb).translate(moved_final).center(s_bb_moved)

var dis = s.distanceTo(c)
//if (para.filter_obj) DEBUG_show((ABC.distanceTo(subject.position)+'/'+XYZ.distanceTo(subject.position))+'\n'+dis+'\n'+subject.position.distanceTo(cache.position)+'\n'+(dis-subject.position.distanceTo(cache.position))+'\n'+s.length()+'\n'+c.length()+'\n'+Date.now())

// NOTE: _dis (distance between mesh sorted position and subject's current position) is scaled by obj's scale (object_scale).
var _dis = 0
var _collision_by_mesh_sort_range = 0
if (dis < (moved_dis_max + r) + ((that.use_local_mesh_sorting && local_mesh_sorting_range_buffer) || Math.min((obj.collision_by_mesh_sort_range||64)*0.5, r))) {
  cache.updateMatrixWorld()
  if (!that.use_octree && obj.collision_by_mesh_sort_range && !para.collision_by_mesh_disabled) {
    _v3.copy(s_bb).applyMatrix4(_m4.getInverse(cache.matrixWorld))
    let _index = (_subject.obj._index != null) ? _subject.obj._index+1 : 0;
    let mesh_sorted = obj.mesh_sorted = obj.mesh_sorted_list[_index] = obj.mesh_sorted_list[_index] || {};
if (that.use_local_mesh_sorting) {
  _dis = (mesh_sorted.position) ? Math.sqrt(Math.pow(mesh_sorted.position.x-_v3.x,2)+Math.pow(mesh_sorted.position.z-_v3.z,2)) + mov_delta_length/object_scale : 9999
  if (_dis > local_mesh_sorting_range_buffer/object_scale) {
    _collision_by_mesh_sort_range = Math.max(Math.min(Math.ceil(subject_bs.radius||10 + Math.sqrt(moved_final.x*moved_final.x+moved_final.z*moved_final.z)), obj.collision_by_mesh_sort_range) + local_mesh_sorting_range_buffer, 8) / object_scale
    mesh_sorted.position = _v3.clone()

    if (that.use_octree) {}
    else {
//    let _t = performance.now()

      mesh_sorted.index_list = that.mesh_sorting_worker.tree[obj.object_index].search({
minX: _v3.x-_collision_by_mesh_sort_range,
minY: _v3.z-_collision_by_mesh_sort_range,
maxX: _v3.x+_collision_by_mesh_sort_range,
maxY: _v3.z+_collision_by_mesh_sort_range
      }).map(function (a) { return a.index; });

//    console.log("Mesh sorted:" + obj._index + "," + mesh_sorted.index_list.length + "/" + (_collision_by_mesh_sort_range) + "-" + Math.round(performance.now()-_t) + "ms/" + Date.now())
    }
  }
}
else {
}
  }
}

if (dis > moved_dis_max+r) {
//if (obj.character_index == 0) DEBUG_show(dis+'/'+(moved_dis_max+r),0,1)
//if (obj.character_index==0 && para.filter_obj) DEBUG_show(dis+'/'+(moved_dis_max+r),0,1)
  return
}


if (obj._obj_proxy.boundingBox) {

  let move_blocked
  moved_before_bb_check.copy(moved_final)

  let hit_moved_once
  let collision_by_mesh = !para.collision_by_mesh_disabled && obj.collision_by_mesh

let skip_bb_index_list = []
obj._obj_proxy.boundingBox_list.some(function (bb, bb_idx) {
  if (skip_bb_index_list.indexOf(bb_idx) != -1)
    return

  if (para.filter_obj && !para.filter_obj(obj, bb, true)) {
    return
  }

  var _skip_ground_obj_check = skip_ground_obj_check || obj.skip_ground_obj_check

  if (!para.collision_centered) {
    object_bb.copy(bb).applyMatrix4(cache.matrixWorld)
  }
  else {
    _q.copy(center_rotate(subject.quaternion, true))
    object_bb.copy(bb).applyMatrix4(_m4.makeRotationFromQuaternion(_q2.copy(cache.quaternion).multiply(_q))).translate(_v3a.copy(subject.position).add(_v3.copy(cache.position).sub(subject.position).applyQuaternion(_q)))
  }
  object_bb.center(_c)

  var hit_moved = subject_bb_moved.isIntersectionBox(object_bb)
  if (hit_moved) {
    _bb.copy(subject_bb_moved).intersect(object_bb).size(_v3);
     if (_subject.mass && !null_move && obj.mass) {
      let feedback = 1 - obj.mass / (obj.mass + _subject.mass)
//feedback = 0.1
//if (subject._model_index > 0) DEBUG_show(feedback+'/'+Date.now())
/*
      var fb_x = Math.abs(moved_final.x) * feedback
      var fb_z = Math.abs(moved_final.z) * feedback
      feedback = Math.min(Math.min(fb_x,_v3.x)/fb_x, Math.min(fb_z,_v3.z)/fb_z)
*/
      _v3a.copy(moved_final).multiply(_v3b.set(feedback,1,feedback))
      object_bb.translate(_v3a)
      _c.add(_v3a)
      cache.position.add(_v3a.setY(0).applyQuaternion(center_rotate(subject.quaternion, false, true)))

      hit_moved = subject_bb_moved.isIntersectionBox(object_bb)
    }
  }

  if (!_skip_ground_obj_check && ((character.ground_obj && (character.ground_obj.obj == obj) && character.ground_obj.bb_y_scale[bb_idx]) || (Math.abs(subject_bb.min.y - object_bb.max.y) < 1))) {
    ray.set(_v3.copy(s_bb).setY(999), _v3a.set(0,-1,0))
    if (ray.intersectBox(object_bb, intersection)) {
      collision = true
      if (!ground_obj)
        ground_obj = character.ground_obj
      if (!ground_obj || (ground_obj.obj != obj))
        ground_obj = { obj:obj, bb_y_scale:{} }
      if (!ground_obj.bb_y_scale[bb_idx])
        ground_obj.bb_y_scale[bb_idx] = 1
    }
    else {
      if (character.ground_obj && (character.ground_obj.obj == obj))
        delete character.ground_obj.bb_y_scale[bb_idx]
    }
  }

// for simplicity
  if (!hit_moved) {
    if (bb.onaway) {
      let result = bb.onaway()
      if (result.blocked) {
collision = true
obj_hit = obj
moved_final.copy(_c).sub(s_bb).setY(0).normalize()
moved_before_bb_check.copy(moved_final)
subject_bb_moved.copy(subject_bb).translate(moved_final)
//collision_by_mesh = false
//DEBUG_show(moved_final.toArray())//,0,1)
move_blocked = true
return true
      }
    }
    return
  }
  else {
    hit_moved_once = true
    if (collision_by_mesh && !bb.oncollide && !bb.onaway)
      return
  }

  var hit = subject_bb.isIntersectionBox(object_bb)
//if (hit) DEBUG_show(Date.now())
//  _bb.copy(subject_bb).intersect(object_bb).size(_v3)
//  if (_v3.x<0.1 || _v3.y<0.1 || _v3.z<0.1) hit = false;

// intersected == intersection
  var intersected
  intersected = ray_normal.intersectBox(object_bb, intersection)
  if (!intersected) {
    ray.set(_v3.copy(_c).add(_v3a.copy(d).multiplyScalar(999)), _v3a.copy(d).negate())
    intersected = ray.intersectBox(subject_bb, intersection)
    if (intersected && !hit)
      object_bb.clampPoint(intersected,intersected)
  }

  if (!hit && !hit_moved && !intersected)
    return

  if (!intersected) {
    _d.copy(_c).sub(s_bb).normalize()
    ray.set(_v3.copy(s_bb).add(_v3a.copy(_d).multiplyScalar(-999)), _d)
    intersected = ray.intersectBox(object_bb, intersection)
  }

  if (!intersected)
    return

  if (!hit) {
    if (subject_bb.distanceToPoint(intersected) > mov_delta_length)
      return
  }

  _moved_final.copy(moved_final)
  if (bb.oncollide) {
    if (bb.skip_bb_index_list)
      skip_bb_index_list = skip_bb_index_list.concat(bb.skip_bb_index_list)

    let result = bb.oncollide({subject:subject, mov_delta:moved_final, null_move:null_move, skip_ground_obj_check:_skip_ground_obj_check, obj:obj, object_bb:object_bb, bb_idx:bb_idx, intersected:intersected, _moved_final:_moved_final, ground_obj:ground_obj})
    if (result) {
      if (result.returnValue != null) {
//DEBUG_show(Date.now())
        return result.returnValue
      }
      if (result.ground_obj)
        ground_obj = result.ground_obj
    }
  }
  else if ((!ground_obj || (ground_obj.obj == obj)) && (Math.abs(intersection.y - object_bb.max.y) < 0.001) && (intersection.y <= subject_bb.min.y + _moved_final.y + 2)) {
//console.log(intersection.y+'/'+object_bb.max.y)
    if (!_skip_ground_obj_check) {
      if (!ground_obj || (ground_obj.obj != obj))
        ground_obj = { obj:obj, bb_y_scale:{} }
      ground_obj.bb_y_scale[bb_idx] = 1
//console.log(bb_idx)
    }
  }
  else if (hit) {
    _bb.copy(subject_bb).intersect(object_bb)
    let y_diff = _bb.max.y - _bb.min.y

    let ground = ground_obj || character.ground_obj
    if (ground && (ground.obj == obj) && object_bb.containsPoint(_v3.copy(c).setY(_c.y))) {
      _moved_final.y = y_diff
    }
    else {
// push character back
      _moved_final.copy(s_bb).sub(_c)//.normalize().multiplyScalar(mov_delta_length)

      let xz = Math.sqrt(_moved_final.x*_moved_final.x + _moved_final.z*_moved_final.z)
      if (_bb.max.x - _bb.min.x < _bb.max.z - _bb.min.z) {
        _moved_final.x = (_moved_final.x) ? ((_moved_final.x>0)?1:-1)*xz : 0
        _moved_final.z = 0
      }
      else {
        _moved_final.z = (_moved_final.z) ? ((_moved_final.z>0)?1:-1)*xz : 0
        _moved_final.x = 0
      }
      if ((y_diff > (subject_bb.max.y - subject_bb.min.y)/2) || (y_diff > (object_bb.max.y - object_bb.min.y)/2))
        _moved_final.y = 0
      _moved_final.normalize().multiplyScalar(Math.max(mov_delta_length,1))
    }
  }
  else {
    _moved_final.copy(intersected).sub(_bb.copy(subject_bb).clampPoint(intersected, _v3)).multiplyScalar(0.75)
    if (_bb.translate(_moved_final).isIntersectionBox(object_bb) || (mov_delta_length/4 > _moved_final.length())) {
// blocked, for simplicity
      _moved_final.set(0,0,0)
    }
  }

  if (para.filter_obj && !para.filter_obj(obj, bb)) {
    return
  }

  collision = true
  obj_hit = obj
  moved_final.copy(_moved_final)
});

if (collision_by_mesh) {// && hit_moved_once) {
  collision_by_mesh_checked = true

// NOTE: I give up changing the mesh collision system to work with x/z rotation of the object (for now at least). It requires too many changes on existing codes, especially the part to get ground_y.
  let _t_ = performance.now();
  let result

  let subject_bb_MS = subject_bb
  let moved_before_bb_check_MS = moved_before_bb_check
  if (use_bb_translate_offset) {
    subject_bb_MS = subject_bb.clone().translate(bb_translate_offset)
    moved_before_bb_check_MS = moved_before_bb_check.clone().sub(bb_translate_offset)
  }


  null_move = !moved_before_bb_check_MS.x && !moved_before_bb_check_MS.y && !moved_before_bb_check_MS.z;
  const subject_bb_to_collide = (null_move) ? subject_bb_MS : subject_bb_moved;
  let mov_octree, result_octree, ground_octree;
  if (that.use_octree) {
// https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
    const THREEX = MMD_SA.THREEX.THREEX;

    const obj_m4_inv = _m4.getInverse(cache.matrixWorld);

    const height = subject_bb_to_collide.max.y - subject_bb_to_collide.min.y;
    const radius = height/8 * (obj_base.octree_collider_radius||1) *1.5;

    const pos = new THREE.Vector3();
    subject_bb_to_collide.center(pos);
    pos.y = subject_bb_to_collide.min.y;

    const c = new THREEX.Capsule( new THREEX.Vector3( 0, radius, 0 ), new THREEX.Vector3( 0, Math.max(height-radius*2, radius), 0 ), radius );
    c.translate(pos);

    c.start.applyMatrix4(obj_m4_inv);
    c.end.applyMatrix4(obj_m4_inv);
    c.radius /= object_scale;

    const mov_extended = _v3.copy(moved_before_bb_check_MS).add(cache.position).applyMatrix4(obj_m4_inv).setY(0).normalize();

    const octree = obj_base.octree;

    const ground_upper_limit = height/2;

    const ray_origin = _v3a.copy(pos);
    ray_origin.y += ground_upper_limit;
    const ray = new THREEX.Ray(ray_origin, new THREEX.Vector3(0,-1,0)).applyMatrix4(obj_m4_inv);

    const grounds = [];
    ground_octree = octree.rayIntersect(ray);
    grounds.push(ground_octree);

    ray_origin.copy(pos).add(mov_extended.multiplyScalar(radius));
    ray_origin.y += ground_upper_limit;
    grounds.push(octree.rayIntersect(ray));

    pos.applyMatrix4(obj_m4_inv).applyQuaternion(cache.quaternion);

    let ground_y = -9999;
    const grounded = [];
    grounds.forEach(g=>{
      if (!g) return;

      g.position.applyQuaternion(cache.quaternion);

      const y = g.position.y//+0.1;
      if (y - pos.y > ground_upper_limit) return;

      g.triangle.getNormal(_v3).applyQuaternion(cache.quaternion);
      if (_v3.y < 0.5) return;

      grounded.push(g);

      if (y < pos.y) return;

      ground_y = Math.max(y, ground_y);
    });

    const mov_offset = _v3b.set(0,0,0);
    if (ground_y > -9999) {
//DEBUG_show((ground_y - pos.y)+'/'+Date.now())
      mov_offset.y += ground_y - pos.y;
      c.translate(mov_offset);
      moved_before_bb_check.add(mov_offset.multiply(cache.scale));
    }

    result_octree = octree.capsuleIntersect(c);

    mov_octree = _v3a.set(0,0,0);
    if (result_octree) {
      mov_octree.add( result_octree.normal.multiplyScalar( result_octree.depth ) );
//DEBUG_show(mov_octree.toArray().join('\n'))
      if (!grounded.length) {
//applyMatrix4(obj_m4_inv)
        const face_v3 = MMD_SA.TEMP_v3.set(0,0,1).applyQuaternion(subject.quaternion).applyQuaternion(MMD_SA.TEMP_q.copy(cache.quaternion).conjugate()).normalize().multiplyScalar(result_octree.depth*1.5).negate();
        mov_octree.add(face_v3);
//DEBUG_show(result_octree.depth,0,1);
      }
	}

    result = {
      updated: !!result_octree,
      ground_y: (ground_octree) ? ground_octree.position.y : -9999,
    };
//DEBUG_show(result.updated+'/'+(result_octree.depth||0)+'/'+result.ground_y+'\n'+pos.toArray().join('\n'))
  }
  else {
    result = subject_bb_to_collide.intersectObject(obj, subject_bb_MS);
  }


  let pos_in_obj = new THREE.Vector3().copy(subject.position).applyMatrix4(_m4.getInverse(cache.matrixWorld));

  let ground_y;
  if (result.ground_y > -999) {
    ground_y = result.ground_y * object_scale + cache.position.y;

    let ground_y_current = ground_obj || character.ground_obj
    ground_y_current = ground_y_current && ground_y_current.bb_y_scale.mesh
//DEBUG_show(ground_y_current+'/'+Date.now())

// prevent big drop in height
    if ((ground_y_current != null) && (ground_y_current > ground_y+(obj.collision_by_mesh_drop_limit||999))) {
      result.bb_static_collided = result.updated = false
    }
// cancel drop if the ground is below certain limit
    else if ((obj.collision_by_mesh_ground_limit != null) && (ground_y < obj.collision_by_mesh_ground_limit)) {
      result.bb_static_collided = result.updated = false
    }
// ground_y+ fixes some possible glitches in ground level changes
    else if (!ground_obj || (ground_obj.bb_y_scale.mesh == null) || (ground_obj.bb_y_scale.mesh < ground_y+3)) {
//if (ground_obj && ground_obj.bb_y_scale.mesh > ground_y) DEBUG_show(ground_y_current+'/'+ground_obj.bb_y_scale.mesh+'/'+ground_y+'/'+Date.now())
      ground_obj = { obj:obj, bb_y_scale:{ mesh:ground_y } }
      collision = true
//DEBUG_show(ground_obj.bb_y_scale.mesh+'/'+Date.now())
    }
    else {
      ground_y = null
    }
  }

  if (that.use_octree) {
    if (result_octree && result.updated) {
      collision = true;
      obj_hit = obj;

      mov_octree.applyQuaternion(cache.quaternion).multiply(cache.scale);
      moved_final.copy(moved_before_bb_check).add(mov_octree);
//console.log(moved_final.toArray(), ground_y);
      if (ground_y) {
        that.character.ground_normal = (that.character.ground_normal || new THREE.Vector3(0,1,0)).lerp(ground_octree.triangle.getNormal(_v3).applyQuaternion(cache.quaternion), 0.5);
      }
    }
    else {
      moved_final.copy(moved_before_bb_check);
    }
    return;
  }

// old collision 01

}

  return;
}


// Calculate ray start's offset from the sphere center
//float3 p = s - c;
p.copy(s).sub(c);

//float rSquared = r * r;
//float p_d = dot(p, d);
var rSquared// = r * r;
var p_d = p.dot(d);

// The sphere is behind or surrounding the start point.
//if(p_d > 0 || dot(p, p) < rSquared)
// return NO_COLLISION;
if (p_d > 0)// || p.dot(p) < rSquared)
  return

if (subject_bs.intersectsSphere(object_bs)) {
  collision = true
  obj_hit = obj
  moved_final.copy(p).normalize().multiplyScalar(((r+subject_bs.radius)-dis)*0.95)
  return
}

// Flatten p into the plane passing through c perpendicular to the ray.
// This gives the closest approach of the ray to the center.
//float3 a = p - p_d * d;
a.copy(p).sub(_v3.copy(d).multiplyScalar(p_d));

//float aSquared = dot(a, a);
var aSquared = a.dot(a);

// AT: adding radius of both, since this case is a moving sphere instead of just a line
rSquared = r+subject_bs.radius;
rSquared *= rSquared;

//DEBUG_show(["s:"+s.toArray(),"d:"+d.toArray(),"c:"+c.toArray(),"r:"+r,"p:"+p.toArray(),"p_d:"+p_d,"a:"+a.toArray(),aSquared,rSquared].join("\n"))

// Closest approach is outside the sphere.
//if(aSquared > rSquared)
//  return NO_COLLISION;
if (aSquared > rSquared)
  return

// Calculate distance from plane where ray enters/exits the sphere.    
//float h = sqrt(rSquared - aSquared);
var h = Math.sqrt(rSquared - aSquared);

// Calculate intersection point relative to sphere center.
//float3 i = a - h * d;
i.copy(d).multiplyScalar(-h).sub(a);

//float3 intersection = c + i;
//float3 normal = i/r;
intersection.copy(c).add(i);
//normal.copy(i).multiplyScalar(1/r);

// We've taken a shortcut here to avoid a second square root.
// Note numerical errors can make the normal have length slightly different from 1.
// If you need higher precision, you may need to perform a conventional normalization.
//return (intersection, normal);

dis = intersection.distanceTo(s)
if (dis > moved_dis_max)
  return

collision = true
obj_hit = obj
moved_final.copy(intersection.sub(s))
  });

  this.grid_blocks.hide()

  if (!ground_obj || !ground_obj.bb_y_scale.mesh)
    this.character.ground_normal = null

//if (collision && obj_hit) console.log(mov_delta.toArray()+'\n'+moved_final.toArray())
  return ((collision) ? { moved_final:moved_final.applyQuaternion(center_rotate(subject.quaternion, false, true)), obj_hit:!!obj_hit, ground_obj:ground_obj, collision_by_mesh_checked:collision_by_mesh_checked, collision_by_mesh_failed:collision_by_mesh_failed } : { collision_by_mesh_checked:collision_by_mesh_checked, collision_by_mesh_failed:collision_by_mesh_failed });
};
  })();

})();
