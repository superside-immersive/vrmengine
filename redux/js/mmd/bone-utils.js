// Bone utility functions
// Extracted from MMD_SA.js — Step 10G refactoring

window.MMD_SA_createBoneUtils = function () {
  var _face_camera = function (v3, q_to_apply, absolute_facing) {
    var cam = MMD_SA.camera_position
    var camR = cam.clone().sub(v3)
    if (q_to_apply)
      camR = camR.applyQuaternion(q_to_apply)

    var v3r = new THREE.Vector3()
    var _divisor
    var _x_diff = camR.x
    var _y_diff = camR.y
    var _z_diff = camR.z

    _divisor = Math.sqrt(Math.pow(_x_diff,2) + Math.pow(_z_diff,2))
    v3r.x = Math.atan2(-_y_diff, Math.abs(_divisor))
    if (absolute_facing && (_z_diff < 0)) {
      v3r.x = MMD_SA.normalize_angle((v3r.x > 0) ? Math.PI - v3r.x : -Math.PI - v3r.x)
    }

    _divisor = _z_diff
    v3r.y = Math.atan2(_x_diff, Math.abs(_divisor))
    if (absolute_facing && (_z_diff < 0)) {
    //  v3r.y = (v3r.y > 0) ? Math.PI - v3r.y : -Math.PI - v3r.y
      v3r.z = Math.PI
    }
    v3r.y *= Math.abs(Math.cos(v3r.x))

    return v3r
  };

  var _normalize_angle = function (r) {
    var circle = Math.PI * 2
    r = r % circle
    if (r > Math.PI)
      r -= circle
    else if (r < -Math.PI)
      r += circle

    return r
  };

  var _get_bone_position = (function () {
    var TEMP_m4, q1;
    window.addEventListener("jThree_ready", function () {
      TEMP_m4 = new THREE.Matrix4();
      q1 = new THREE.Quaternion();
    });

    return function (mesh, name, parent_to_stop, A_pose_enforced) {
      function convert_to_A_pose(bone) {
        return (!A_pose_enforced || !is_T_pose) ? bone.quaternion : q1.fromArray(MMD_SA.THREEX.utils.convert_T_pose_rotation_to_A_pose(bone.name, bone.quaternion.toArray()));
      }

      var pos = new THREE.Vector3();

      const mesh_by_number = typeof mesh == 'number';
      const is_THREEX = (mesh_by_number) ? MMD_SA.THREEX.enabled : !!mesh.model;
      const is_T_pose = MMD_SA.THREEX.get_model((mesh_by_number) ? mesh : mesh._model_index).is_T_pose;

      var model, bone;
      if (is_THREEX) {
        model = (mesh_by_number) ? MMD_SA.THREEX.get_model(mesh) : mesh;
        mesh = model.mesh;
        bone = model.get_bone_by_MMD_name(name);
      }
      else {
        if (mesh_by_number) mesh = THREE.MMD.getModels()[mesh].mesh;
        bone = (typeof name == "string") ? mesh.bones_by_name[name] : mesh.bones[name];
      }

      if (!bone) return pos;

      // should be safe and save some headaches without the need to set A_pose_enforced manually, since MMD bones should always operate on A pose
      if ((A_pose_enforced == null) && !mesh.model) A_pose_enforced = true;

      if (parent_to_stop && (typeof parent_to_stop == "string")) {
        parent_to_stop = (is_THREEX) ? model.get_bone_by_MMD_name(parent_to_stop) : mesh.bones_by_name[parent_to_stop];
      }

      pos.copy(bone.position);
      var _bone = bone;
      while ((_bone.parent !== mesh) && (_bone.parent !== parent_to_stop)) {
        _bone = _bone.parent;
        pos.applyMatrix4(TEMP_m4.makeRotationFromQuaternion(convert_to_A_pose(_bone)).setPosition(_bone.position));
      }
      if (is_THREEX) pos.multiply(mesh.scale);
      if (!parent_to_stop)
        pos.applyMatrix4(TEMP_m4.makeRotationFromQuaternion(mesh.quaternion).setPosition(mesh.position));

      return pos;
    };
  })();

  var _get_bone_rotation = (function () {
    var q1;
    window.addEventListener('jThree_ready', function () {
      q1 = new THREE.Quaternion();
    });

    return function (mesh, name, parent_only, parent_to_stop, A_pose_enforced) {
      function convert_to_A_pose(bone) {
        return (!A_pose_enforced || !is_T_pose) ? bone.quaternion : q1.fromArray(MMD_SA.THREEX.utils.convert_T_pose_rotation_to_A_pose(bone.name, bone.quaternion.toArray()));
      }

      const is_T_pose = MMD_SA.THREEX.get_model(mesh._model_index).is_T_pose;

      var rot = new THREE.Quaternion();
      var bone = (typeof name == "string") ? mesh.bones_by_name[name] : mesh.bones[name]
      if (!bone)
        return rot

      if (parent_to_stop && (typeof parent_to_stop == "string"))
        parent_to_stop = mesh.bones_by_name[parent_to_stop]

      if (!parent_only)
        rot.copy(convert_to_A_pose(bone));

      var _bone = bone;
      while ((_bone.parent !== mesh) && (_bone.parent !== parent_to_stop)) {
        _bone = _bone.parent;
      // parent x self
        rot.multiplyQuaternions(convert_to_A_pose(_bone), rot)
      }
      if (!parent_to_stop)
        rot.multiplyQuaternions(mesh.quaternion, rot)

      return rot.normalize();
    };
  })();

  var _get_bone_rotation_parent = function (mesh, name, parent_to_stop, A_pose_enforced) {
    return MMD_SA.get_bone_rotation(mesh, name, true, parent_to_stop, A_pose_enforced)
  };

  var _clean_axis_rotation = (function () {
    var rot_v3;
    window.addEventListener("jThree_ready", function () {
      rot_v3 = new THREE.Vector3();
    });

    return function (q, euler_order, clean_depth) {
      if (clean_depth == null) clean_depth = 1;
      rot_v3.setEulerFromQuaternion(q, euler_order)
      for (var i = 3-clean_depth; i < 3; i++)
        rot_v3[euler_order.charAt(i).toLowerCase()] = 0
      q.setFromEuler(rot_v3, euler_order)

      return rot_v3
    };
  })();

  var _get_bone_axis_rotation = (function () {
    var RE_arm = new RegExp("^(" + toRegExp(["左","右"],"|") + ")(" + toRegExp(["肩","腕","ひじ","手首"],"|") + "|." + toRegExp("指") + ".)");

    return function (mesh, name_full, use_THREEX_bone) {
      function bone_origin(name) {
        return (use_THREEX_bone) ? modelX.get_bone_origin_by_MMD_name(name): bones_by_name[name].pmxBone.origin;
      }

      var d = name_full.charAt(0)
      var sign_LR = (d=="左") ? 1 : -1

      var bones_by_name = mesh.bones_by_name

      const modelX = MMD_SA.THREEX.get_model(mesh._model_index);
      if (MMD_SA.THREEX.enabled && !bone_origin(name_full))
        use_THREEX_bone = false;

      var x_axis, y_axis, z_axis;

      const model_para = MMD_SA_options.model_para_obj_all[mesh._model_index];
      // Not using .localCoordinate by default as it can be screwed up for some models
      if (model_para.use_bone_localCoordinate && bones_by_name[name_full].pmxBone.localCoordinate) {
      // z from .localCoordinate is already inverted
        x_axis = MMD_SA._v3a.fromArray(bones_by_name[name_full].pmxBone.localCoordinate[0]);
      // z-axis inverted (?)
        z_axis = MMD_SA._v3b.fromArray(bones_by_name[name_full].pmxBone.localCoordinate[1])//.negate();
        if (sign_LR == -1) { x_axis.x *= -1; z_axis.x *= -1; }

        y_axis = MMD_SA.TEMP_v3.crossVectors(x_axis, z_axis).normalize().negate();
      }
      else {
        const axis_end = bones_by_name[name_full].pmxBone.end;
        const axis = (use_THREEX_bone || (typeof axis_end == 'number')) ? (((axis_end == -1) || !bone_origin(mesh.bones[axis_end]?.name)) ? MMD_SA._v3a.fromArray(bone_origin(name_full)).sub(MMD_SA._v3a_.fromArray(bone_origin(bones_by_name[name_full].parent.name))) : MMD_SA._v3a.fromArray(bone_origin(mesh.bones[axis_end].name)).sub(MMD_SA._v3a_.fromArray(bone_origin(name_full)))).normalize() : MMD_SA._v3a.fromArray(axis_end).normalize();

        if (RE_arm.test(name_full)) {
          x_axis = axis;
          if (sign_LR == -1) x_axis.x *= -1;

          z_axis = MMD_SA._v3b.set(0,0,1).applyQuaternion(MMD_SA._q1.setFromUnitVectors(MMD_SA._v3b_.set(1,0,0), x_axis));

          y_axis = MMD_SA.TEMP_v3.crossVectors(x_axis, z_axis).normalize().negate();
        } 
        else {
          y_axis = axis.negate();
          y_axis.z *= -1
          z_axis = MMD_SA._v3b.set(0,0,1).applyQuaternion(MMD_SA._q1.setFromUnitVectors(MMD_SA._v3b_.set(0,1,0), y_axis));
          sign_LR = 1

          x_axis = MMD_SA.TEMP_v3.crossVectors(y_axis, z_axis).normalize();
        }
      }

      let rot_m4 = MMD_SA.TEMP_m4.set(
          x_axis.x, x_axis.y, x_axis.z, 0,
          y_axis.x, y_axis.y, y_axis.z, 0,
          z_axis.x, z_axis.y, z_axis.z, 0,
          0,0,0,1
      );

      var r = new THREE.Quaternion().setFromBasis(rot_m4);

      // you can only invert 2+ axes directly in quaternion by inverting the signs
      // inverting .z and .y is the same as inverting .x and .w
      if (sign_LR==1) { r.z *= -1; r.y *= -1; }
      /*
      let a = MMD_SA.TEMP_v3.setEulerFromQuaternion(r, 'ZYX')
      a.z *= -1;
      a.y *= -1;
      r.setFromEuler(a, 'ZYX')
      */
      //console.log(name_full, x_axis.clone(), y_axis.clone(), z_axis.clone(), x_axis.angleTo(z_axis))
      //console.log(name_full, new THREE.Vector3().setEulerFromQuaternion(r, 'ZYX').multiplyScalar(180/Math.PI));

      if (MMD_SA.THREEX.enabled && !use_THREEX_bone) {
        if (name_full.indexOf('指') != -1) {
          const r_v3 = MMD_SA.TEMP_v3.setEulerFromQuaternion(r, 'ZYX');
          r_v3.z -= Math.sign(r_v3.z) * 37.4224/180*Math.PI;
          r.setFromEuler(r_v3, 'ZYX');
        }
        else if (name_full.indexOf('足首') == -1) {
          r.set(0,0,0,1)
        }
      }

      return r;
    };
  })();

  return {
    face_camera: _face_camera,
    normalize_angle: _normalize_angle,
    get_bone_position: _get_bone_position,
    get_bone_rotation: _get_bone_rotation,
    get_bone_rotation_parent: _get_bone_rotation_parent,
    clean_axis_rotation: _clean_axis_rotation,
    get_bone_axis_rotation: _get_bone_axis_rotation
  };
};
