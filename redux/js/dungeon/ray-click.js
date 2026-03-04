/**
 * @file ray-click.js
 * @description Ray intersection, mouse-on-object detection, and click handler wiring.
 * Extracted from dungeon.js — assigns d.check_ray_intersection, d.check_mouse_on_object,
 * and wires dblclick/click/mousedown on the content host.
 */
(function () {
var d = MMD_SA_options.Dungeon;
var Object3D_proxy_base = d.Object3D_proxy_base;

d.check_ray_intersection = (function () {
var THREEX;
var object_bs, object_bb, c, ray, intersection, rayX, _m4, _v3;
var _lazy_inited = false;

function _lazy_init() {
  if (_lazy_inited) return;
  _lazy_inited = true;
  object_bs  = new THREE.Sphere();
  object_bb  = new THREE.Box3();
  c = new THREE.Vector3();
  ray = new THREE.Ray();
  intersection = new THREE.Vector3();
  _v3 = new THREE.Vector3();
  THREEX = MMD_SA.THREEX.THREEX;
  rayX = new THREEX.Ray();
  _m4 = new THREEX.Matrix4();
}

return function (s, dir, para) {
  _lazy_init();
  if (!para)
    para = {}

  var that = this

  var dis = dir.length()
  ray.set(s, _v3.copy(dir).normalize())

  var intersected = []
  var nearest = { distance:999999 }

  this.object_list.concat(MMD_SA.THREEX._object3d_list_||[]).forEach(function (obj, idx) {
if (obj.is_dummy)
  return

var cache = obj._obj
if (!cache.visible)
  return

if (obj.no_collision)
  return

if (para.filter && para.filter(obj))
  return

var obj_base = obj._obj_base || MMD_SA_options.Dungeon.object_base_list[obj.object_index];

object_bs.copy(obj._obj_proxy.boundingSphere)
object_bs.center.add(cache.position)
object_bs.radius *= Math.max(cache.scale.x, cache.scale.y, cache.scale.z) * ((obj_base.construction && obj_base.construction.boundingSphere_radius_scale) || ((obj_base.character_index) ? 0.5 : 1))

// c: the center point of the sphere
c.copy(object_bs.center)
// r: its radius
var r = object_bs.radius

if (s.distanceTo(c) > dis+r)
  return

if (!obj._obj_proxy.boundingBox)
  return

var skip_bb_index_list = [];
obj._obj_proxy.boundingBox_list.forEach(function (bb, bb_idx) {
  if (obj_base.construction && obj_base.construction.boundingBox_list && obj_base.construction.boundingBox_list[bb_idx] && obj_base.construction.boundingBox_list[bb_idx].no_camera_collision)
    return

  if (skip_bb_index_list.indexOf(bb_idx) != -1)
    return

  object_bb.copy(bb).applyMatrix4(cache.matrixWorld)
  if (!ray.intersectBox(object_bb, intersection))
    return

  var i_dis = s.distanceTo(intersection)
  if (i_dis > dis)
    return

  if (bb.skip_bb_index_list)
    skip_bb_index_list = skip_bb_index_list.concat(bb.skip_bb_index_list)

  const i_obj = { distance:i_dis, obj:obj, bb_index:bb_idx, oncollide:!!bb.oncollide }
  intersected.push(i_obj)
  if (nearest.distance > i_dis)
    nearest = i_obj
});

if (!obj_base.octree) return;

rayX.copy(ray);
rayX.applyMatrix4(_m4.copy(cache.matrixWorld).invert());
const octree_result = obj_base.octree.rayIntersect(rayX, true);
if (octree_result) {
  const i_dis = s.distanceTo(octree_result.position.applyMatrix4(cache.matrixWorld));
  if (i_dis > dis)
    return;

  const i_obj = { distance:i_dis, obj:obj };
  intersected.push(i_obj);
  if (nearest.distance > i_dis)
    nearest = i_obj;
}
  });

  return ((intersected.length && !nearest.oncollide) ? { nearest:nearest, intersected:intersected } : null)
};
  })();

  d.check_mouse_on_object = (function () {
var vectorMouse, bs, s, d, c, p, a, i, intersection, normal
var ray, bb, _v3, _v3a
var _lazy_inited2 = false;

function _lazy_init2() {
  if (_lazy_inited2) return;
  _lazy_inited2 = true;
  vectorMouse = new THREE.Vector3();
  bs = new THREE.Sphere()
  s = new THREE.Vector3()
  d = new THREE.Vector3()
  c = new THREE.Vector3()
  p = new THREE.Vector3()
  a = new THREE.Vector3()
  intersection = new THREE.Vector3()
  ray = new THREE.Ray()
  bb = new THREE.Box3()
  _v3  = new THREE.Vector3()
  _v3a = new THREE.Vector3()
}

return function (e, obj_list) {
  _lazy_init2();
  var list_all_clickable;
  if (!e) {
    list_all_clickable = true
    e = { button:0 }
  }

  if (e.button !== 0) return;

  var that = this

  var camera = MMD_SA._trackball_camera.object

  if (list_all_clickable) {
    vectorMouse.set(0, 0, 0.5);
  }
  else {
// https://github.com/mrdoob/three.js/issues/5587
    vectorMouse.set(
   (e.clientX/B_content_width)  * 2 - 1
 ,-(e.clientY/B_content_height) * 2 + 1
 ,0.5
    );
    vectorMouse.unproject(camera).sub(camera.position).normalize();
//DEBUG_show(vectorMouse.toArray())
  }

  var obj_sorted = []
  var click_range_default = this.grid_size * this.view_radius * 0.5

  if (!obj_list)
    obj_list = this.object_list_click

  var is_dblclick = (e.type == "dblclick")

  var PC_pos = this.character.pos

  obj_list.forEach(function (obj) {
if (!obj.onclick)
  return

var cache = obj._obj
if (!cache.visible)
  return

var click_range = []
obj.onclick.forEach(function (click) {
  click_range.push((!list_all_clickable && (is_dblclick != !!click.is_dblclick)) ? 0 : (click.click_range || click_range_default) + ((click.boundingSphere_included) ? obj._obj_proxy.boundingSphere.radius*Math.max(cache.scale.x,cache.scale.y,cache.scale.z) : 0))
});

obj._click_index = -1
var dis = PC_pos.distanceToSquared(_v3.copy(obj._obj_proxy.boundingSphere.center).multiply(cache.scale).add(cache.position))
for (var i = 0, i_max = click_range.length; i < i_max; i++) {
  if (dis <= click_range[i]*click_range[i]) {
    obj._click_index = i
    break
  }
}
//console.log(obj,dis,click_range)
if (obj._click_index == -1)
  return

obj_sorted.push(obj)
obj._dis_from_PC = dis
  });

  if (!obj_sorted.length) {
//DEBUG_show("(no object clickable)")
    return
  }

  if (!list_all_clickable) {
    obj_sorted.sort(function (a,b) { return (a._sort_weight || b._sort_weight) ? (b._sort_weight||0)-(a._sort_weight||0): a._dis_from_PC - b._dis_from_PC; });
  }

// https://gamedev.stackexchange.com/questions/96459/fast-ray-sphere-collision-code
// s: the start point of the ray
  s.copy(camera.position)
// d: a unit vector in the direction of the ray. 
  d.copy(vectorMouse)
//console.log(camera)
//console.log([s.toArray(), vectorMouse.toArray(), camera.up.toArray()].join("\n"))

  var obj_clicked_list = []

  for (var k = 0, k_max = obj_sorted.length; k < k_max; k++) {
let obj = obj_sorted[k]
let cache = obj._obj

intersection.set(0,0,0)
if (obj._obj_proxy.boundingBox) {
  let bb_list = obj._obj_proxy.boundingBox_list || [obj._obj_proxy.boundingBox];

  let click = obj.onclick[obj._click_index]
  bb_list.some(function (b3, bb_idx) {
    if (bb_idx) {
      if (!click.func && !click.event_id && (!click.events || !click.events[bb_idx]))
        return
    }

    bb.copy(b3)
    if (obj._mesh.bones) {
      let _mesh = obj._mesh._mesh_parent || obj._mesh
      let b_center = _mesh.bones_by_name["センター"]
      if (b_center.pmxBone)
        bb.translate(_v3.copy(b_center.position).sub(_v3a.fromArray(b_center.pmxBone.origin)))
    }
    bb.applyMatrix4(cache.matrixWorld)
//console.log(bb)
    let e = click.events && click.events[bb_idx]
    if (e) {
      if ((e.is_dblclick != null) && (is_dblclick != e.is_dblclick))
        return
      let click_range = e.click_range
      if (click_range && (bb.center(_v3).distanceToSquared(PC_pos) > click_range*click_range))
        return
    }

    ray.set(s,d)
    if (list_all_clickable || ray.intersectBox(bb, intersection)) {
      let _obj = {}
      _obj.obj = obj
      if (bb_list.length > 1)
        _obj.bb_index = bb_idx
      obj_clicked_list.push(_obj)

      if (list_all_clickable) {
         bb.center(_v3)
         _v3.y = bb.min.y + Math.min(bb.max.y+3, 25)
        _obj.pos = _v3.clone()
      }
      else
        return true
    }
  });

  if (!list_all_clickable && obj_clicked_list.length)
    break
}
else if (list_all_clickable) {
  obj_clicked_list.push({obj:obj})
}
else {
  bs.copy(obj._obj_proxy.boundingSphere)
  bs.center.add(cache.position)
  bs.radius *= Math.max(cache.scale.x, cache.scale.y, cache.scale.z)

// collision detetcion START
// c: the center point of the sphere
  c.copy(bs.center)
// r: its radius
  let r = bs.radius

// Calculate ray start's offset from the sphere center
//float3 p = s - c;
  p.copy(s).sub(c);

//float rSquared = r * r;
//float p_d = dot(p, d);
  let rSquared = r * r;
  let p_d = p.dot(d);

// The sphere is behind or surrounding the start point.
//if(p_d > 0 || dot(p, p) < rSquared)
// return NO_COLLISION;
  if (p_d > 0 || p.dot(p) < rSquared)
    continue

// Flatten p into the plane passing through c perpendicular to the ray.
// This gives the closest approach of the ray to the center.
//float3 a = p - p_d * d;
  a.copy(p).sub(_v3.copy(d).multiplyScalar(p_d));

//float aSquared = dot(a, a);
  let aSquared = a.dot(a);

// Closest approach is outside the sphere.
//if(aSquared > rSquared)
//  return NO_COLLISION;
  if (aSquared > rSquared)
    continue

  obj_clicked_list.push({obj:obj})
  break

// Calculate distance from plane where ray enters/exits the sphere.    
//float h = sqrt(rSquared - aSquared);
//var h = Math.sqrt(rSquared - aSquared);

// Calculate intersection point relative to sphere center.
//float3 i = a - h * d;
//i.copy(d).multiplyScalar(-h).sub(a);

//float3 intersection = c + i;
//float3 normal = i/r;
//intersection.copy(c).add(i);
//normal.copy(i).multiplyScalar(1/r);

// We've taken a shortcut here to avoid a second square root.
// Note numerical errors can make the normal have length slightly different from 1.
// If you need higher precision, you may need to perform a conventional normalization.
//return (intersection, normal);
// collision detection END
}
  }

  if (list_all_clickable) {
    return obj_clicked_list
  }

  if (!obj_clicked_list.length)
    return

  var obj_clicked = obj_clicked_list[0].obj
  var bb_index_clicked = obj_clicked_list[0].bb_index

//  if (obj_clicked)
//    DEBUG_show(obj_clicked.object_index)
//  else
//    DEBUG_show("(nothing clicked)")

  var click = obj_clicked.onclick[obj_clicked._click_index]
  if (click.func) {
    click.func(e, intersection, bb_index_clicked)
  }
  else {
    this._event_active.obj = obj_clicked
    this.run_event((click.events && click.events[bb_index_clicked] && click.events[bb_index_clicked].id) || click.event_id)
  }

  return true
};
  })();


  (function () {
var d = MMD_SA_options.Dungeon

var obj_character = {
  _sort_weight:-99
 ,onclick:[{ is_dblclick:true, click_range:320, func:function (e, intersected) {
    if (!MMD_SA.MMD.motionManager.para_SA.object_click_disabled)
      window.dispatchEvent(new CustomEvent('SA_Dungeon_character_clicked', { detail:{ target:e.target, intersected:intersected } }));
  }}]
};
obj_character._obj_proxy = new Object3D_proxy_base(obj_character);

var _boundingBox_expand

var e_func = function (e) {
  if (!self.THREE || !THREE.MMD || !THREE.MMD.getModels)
    return

  if (d.object_click_disabled) {
    return
  }

  var is_dblclick = (e.type == "dblclick")

  var obj_list
  if ((is_dblclick == obj_character.onclick[0].is_dblclick) && !MMD_SA.MMD.motionManager.para_SA.click_disabled) {
    obj_list = d.object_list_click.slice()

    const model_list = THREE.MMD.getModels()
    if (!model_list || !model_list.length || !model_list[0].mesh)
      return

    const c_mesh = model_list[0].mesh;
    obj_character._obj = obj_character._mesh = c_mesh;
    obj_list.push(obj_character);
  }
  else {
    obj_list = d.object_list_click
  }

  var clicked = d.check_mouse_on_object(e, obj_list)

  return clicked
};

var c_host = (returnBoolean("CSSTransform3DDisabledForContent")) ? document.getElementById("Lbody_host") : document.getElementById("Lbody")

if (!c_host)
  c_host = document.getElementById("Lbody") || document.getElementById("Lbody_host") || document.body

if (!c_host)
  return

var _mousedown_timestamp = 0

c_host.addEventListener( 'dblclick', function (e) {
  _mousedown_timestamp = 0
  if (e_func(e)) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

c_host.addEventListener( 'mousedown', function (e) {
  _mousedown_timestamp = performance.now()
//  e_func(e)
});
c_host.addEventListener( 'click', function (e) {
  if (performance.now()-_mousedown_timestamp < 500)
    e_func(e)
  _mousedown_timestamp = 0
});

if (c_host.ondblclick) {
  c_host._ondblclick = c_host.ondblclick
  c_host.addEventListener( 'dblclick', c_host.ondblclick)
  c_host.ondblclick = null
}

  })();

})();
