// xr-ropes.js
// XR_Ropes module - rope/string physics simulation for XR Animator
  self.XR_Ropes = (()=>{
    function get_THREE() {
      return self.THREEX || MMD_SA?.THREEX?.THREE || self.THREE;
    }

    /* ── reusable temp vectors (lazy-init, same THREE as the mesh) ── */
    let _tv0, _tv1, _tv2, _te1, _te2, _tnrm, _tsr, _tst, _tsm;
    function _alloc_temps() {
      if (_tv0) return true;
      const T = get_THREE(); if (!T) return false;
      _tv0 = new T.Vector3(); _tv1 = new T.Vector3(); _tv2 = new T.Vector3();
      _te1 = new T.Vector3(); _te2 = new T.Vector3(); _tnrm = new T.Vector3();
      _tsr  = new T.Vector3(); _tst  = new T.Vector3(); _tsm  = new T.Matrix4();
      return true;
    }

    const state = {
      enabled: !!self.XRA_ROPES_ENABLED_DEFAULT,
      count: 6350,
      resolution: 8,
      max_count: 20000,
      min_count: 100,
      max_resolution: 64,
      min_resolution: 2,
      segment_length: 0.08,
      rope_length: 0.45,
      min_rope_length: 0.05,
      max_rope_length: 2.00,
      gravity: -0.003,
      damping: 0.08,
      solver_iterations: 2,
      color: '#ffffff',
      opacity: 0.45,
      line_width: 0.012,
      max_line_width: 0.1,
      min_line_width: 0.001,
      floor_enabled: false,
      gravity_scale: 0.35,
      root_tension: 0.00,
      root_tension_span: 0.05,
      mesh_collision: true,
      mesh_collision_radius_scale: 0.85,
      mesh_collision_surface: 0.30,
      mesh_collision_hardness: 1.00,
      mesh_collision_offset: 0.08,
      turbulence: 0.0,
      taper: 0.85,
    };
    if (self.XRA_ROPES_PRESET && typeof self.XRA_ROPES_PRESET === 'object') {
      Object.assign(state, self.XRA_ROPES_PRESET);
    }

    const data = {
      anchors: [],
      positions: null,
      positions_prev: null,
      line_positions: null,
      geometry: null,
      material: null,
      mesh: null,
      panel: null,
      labels: {},
      needs_rebuild: true,
      active_count: 0,
      active_resolution: 0,
      last_ts: 0,
      root: null,
      sampler: null,
      floor_mesh: null,
      floor_material: null,
      line_colors: null,
      hemi_light: null,
      collision_box: null,
      collision_sphere: null,
      turb_time: 0,
    };

    function clamp_int(v, min, max) {
      return Math.max(min, Math.min(max, parseInt(v) || min));
    }

    function get_scene() {
      return MMD_SA?.THREEX?.scene;
    }

    function get_modelX() {
      // ALWAYS prefer VRM Direct stub — ropes should live on the VRM model
      if (self.VRMDirectModelStub && self.VRMDirectModelStub.mesh) {
        return self.VRMDirectModelStub;
      }
      // Fallback to MMD only if VRM is not loaded
      try {
        return MMD_SA?.THREEX?.get_model?.(0);
      }
      catch (err) {
        return null;
      }
    }

    function has_any_model() {
      // VRM is available
      if (self.VRMDirectModelStub && self.VRMDirectModelStub.mesh) return true;
      // MMD is available
      try { return !!(THREE.MMD?.getModels?.()?.length); } catch(e) { return false; }
    }

    function get_model_scale() {
      const modelX = get_modelX();
      return modelX?.model_scale || 1;
    }

    /* ── mesh-surface helpers ── */

    function collect_skinned_meshes() {
      // ALWAYS prefer VRM meshes — ropes must attach to VRM, not MMD
      if (self.VRMDirectModelStub && self.VRMDirectModelStub.mesh) {
        const out = [];
        const root = self.VRMDirectModelStub.mesh;
        if (root.traverse) {
          root.traverse((c) => {
            if ((c.isSkinnedMesh || c.isMesh) && c.geometry &&
                c.geometry.getAttribute && c.geometry.getAttribute('position'))
              out.push(c);
          });
        }
        // If we found meshes on VRM, use them exclusively (never fall back to MMD)
        if (out.length > 0) return out;
      }
      // Fallback: no VRM loaded, use MMD model
      const modelX = get_modelX();
      if (!modelX || !modelX.mesh) return [];
      const out = [];
      const root = modelX.mesh;
      if (root.traverse) {
        root.traverse((c) => {
          if ((c.isSkinnedMesh || c.isMesh) && c.geometry &&
              c.geometry.getAttribute && c.geometry.getAttribute('position'))
            out.push(c);
        });
      }
      if (out.length === 0 && root.geometry &&
          root.geometry.getAttribute && root.geometry.getAttribute('position'))
        out.push(root);
      return out;
    }

    function build_mesh_sampler(meshes) {
      if (!_alloc_temps()) return { entries:[], totalArea:0 };
      const entries = [];  let totalArea = 0;
      const va = _tv0, vb = _tv1, vc = _tv2;
      for (const sm of meshes) {
        const geo = sm.geometry;
        const posAttr = geo.getAttribute('position');
        if (!posAttr) continue;
        const ix = geo.getIndex();
        const fc = ix ? (ix.count / 3) : (posAttr.count / 3);
        for (let f = 0; f < fc; f++) {
          let i0, i1, i2;
          if (ix) { i0 = ix.getX(f*3); i1 = ix.getX(f*3+1); i2 = ix.getX(f*3+2); }
          else     { i0 = f*3; i1 = f*3+1; i2 = f*3+2; }
          va.fromBufferAttribute(posAttr, i0);
          vb.fromBufferAttribute(posAttr, i1);
          vc.fromBufferAttribute(posAttr, i2);
          const ax = vb.x-va.x, ay = vb.y-va.y, az = vb.z-va.z;
          const bx = vc.x-va.x, by = vc.y-va.y, bz = vc.z-va.z;
          const cx = ay*bz-az*by, cy = az*bx-ax*bz, cz = ax*by-ay*bx;
          const area = Math.sqrt(cx*cx+cy*cy+cz*cz) * 0.5;
          if (area < 1e-10) continue;
          totalArea += area;
          entries.push({ sm, i0, i1, i2, ca: totalArea });
        }
      }
      return { entries, totalArea };
    }

    function sample_surface_point(sampler) {
      const { entries, totalArea } = sampler;
      if (!entries.length) return { sm:null, i0:0, i1:0, i2:0, u:.33, v:.33, w:.34 };
      const r = Math.random() * totalArea;
      let lo = 0, hi = entries.length - 1;
      while (lo < hi) { const m = (lo+hi)>>1; if (entries[m].ca < r) lo = m+1; else hi = m; }
      const e = entries[lo];
      const r1 = Math.random(), r2 = Math.random(), s = Math.sqrt(r1);
      return { sm: e.sm, i0: e.i0, i1: e.i1, i2: e.i2, u: 1-s, v: s*(1-r2), w: s*r2 };
    }

    function skin_vertex(sm, posAttr, vi, out) {
      out.fromBufferAttribute(posAttr, vi);
      if (sm.isSkinnedMesh && sm.skeleton && sm.skeleton.boneMatrices) {
        if (typeof sm.applyBoneTransform === 'function') {
          sm.applyBoneTransform(vi, out);
        } else {
          const siA = sm.geometry.getAttribute('skinIndex');
          const swA = sm.geometry.getAttribute('skinWeight');
          const bm  = sm.skeleton.boneMatrices;
          if (siA && swA && bm) {
            out.applyMatrix4(sm.bindMatrixInverse);
            _tsr.set(0,0,0);
            const si = [siA.getX(vi),siA.getY(vi),siA.getZ(vi),siA.getW(vi)];
            const sw = [swA.getX(vi),swA.getY(vi),swA.getZ(vi),swA.getW(vi)];
            for (let k = 0; k < 4; k++) {
              if (sw[k] === 0) continue;
              _tsm.fromArray(bm, si[k]*16);
              _tst.copy(out).applyMatrix4(_tsm);
              _tsr.addScaledVector(_tst, sw[k]);
            }
            out.copy(_tsr).applyMatrix4(sm.bindMatrix);
          }
        }
      }
      out.applyMatrix4(sm.matrixWorld);
      return out;
    }

    function get_surface_position(anchor, outPos, outNorm) {
      if (!anchor || !anchor.sm || !anchor.sm.geometry) {
        outPos.set(0,0,0); if (outNorm && outNorm.set) outNorm.set(0,1,0); return;
      }
      if (!_alloc_temps()) {
        outPos.set(0,0,0); if (outNorm && outNorm.set) outNorm.set(0,1,0); return;
      }
      const sm = anchor.sm;
      const posAttr = sm.geometry.getAttribute('position');
      if (!posAttr) {
        outPos.set(0,0,0); if (outNorm && outNorm.set) outNorm.set(0,1,0); return;
      }
      skin_vertex(sm, posAttr, anchor.i0, _tv0);
      skin_vertex(sm, posAttr, anchor.i1, _tv1);
      skin_vertex(sm, posAttr, anchor.i2, _tv2);

      outPos.set(
        anchor.u*_tv0.x + anchor.v*_tv1.x + anchor.w*_tv2.x,
        anchor.u*_tv0.y + anchor.v*_tv1.y + anchor.w*_tv2.y,
        anchor.u*_tv0.z + anchor.v*_tv1.z + anchor.w*_tv2.z
      );

      if (outNorm && outNorm.set) {
        _te1.subVectors(_tv1, _tv0);
        _te2.subVectors(_tv2, _tv0);
        outNorm.crossVectors(_te1, _te2);
        const nl = outNorm.length();
        if (nl > 1e-6) outNorm.divideScalar(nl); else outNorm.set(0,1,0);
      }
    }

    function destroy_floor() {
      const scene = get_scene();
      if (data.floor_mesh) {
        if (scene) scene.remove(data.floor_mesh);
        data.floor_mesh.geometry?.dispose?.();
        data.floor_material?.dispose?.();
        data.floor_mesh = null;
        data.floor_material = null;
      }
    }

    function ensure_floor() {
      const T = get_THREE();
      const scene = get_scene();
      if (!T || !scene) return;
      if (!state.floor_enabled) { destroy_floor(); return; }
      if (data.floor_mesh) return;
      const modelX = get_modelX();
      const scale = get_model_scale();
      const sz = scale * 3;
      const geo = new T.PlaneGeometry(sz, sz);
      data.floor_material = new T.MeshBasicMaterial({
        color: 0x222233,
        transparent: true,
        opacity: 0.55,
        side: T.DoubleSide,
        depthWrite: false,
      });
      data.floor_mesh = new T.Mesh(geo, data.floor_material);
      data.floor_mesh.name = 'XR_Ropes_Floor';
      data.floor_mesh.rotation.x = -Math.PI / 2;
      let fy = 0;
      if (modelX && modelX.mesh) {
        fy = modelX.mesh.position.y;
      }
      data.floor_mesh.position.set(
        modelX?.mesh?.position?.x || 0,
        fy,
        modelX?.mesh?.position?.z || 0
      );
      data.floor_mesh.renderOrder = 998;
      scene.add(data.floor_mesh);
    }

    function update_floor_position() {
      if (!data.floor_mesh) return;
      const modelX = get_modelX();
      if (!modelX || !modelX.mesh) return;
      data.floor_mesh.position.x = modelX.mesh.position.x;
      data.floor_mesh.position.z = modelX.mesh.position.z;
    }

    function destroy_mesh() {
      if (data.mesh) {
        const scene = get_scene();
        if (scene)
          scene.remove(data.mesh);
      }
      data.geometry?.dispose?.();
      data.material?.dispose?.();
      data.geometry = null;
      data.material = null;
      data.mesh = null;
      data.positions = null;
      data.positions_prev = null;
      data.line_positions = null;
      data.line_colors = null;
      data.last_ts = 0;
    }

    function get_camera() {
      return MMD_SA?.THREEX?.camera?.obj;
    }

    function update_collision_volume() {
      if (!state.mesh_collision)
        return false;

      const T = get_THREE();
      const modelX = get_modelX();
      if (!T || !modelX || !modelX.mesh)
        return false;

      if (!data.collision_box) {
        data.collision_box = new T.Box3();
        data.collision_sphere = new T.Sphere();
      }

      data.collision_box.setFromObject(modelX.mesh);
      if (data.collision_box.isEmpty())
        return false;

      data.collision_box.getBoundingSphere(data.collision_sphere);
      data.collision_sphere.radius *= Math.max(0.05, Math.min(1.0, state.mesh_collision_radius_scale));
      return data.collision_sphere.radius > 0;
    }

    /* ── cheap hash-based 3D noise for turbulence ── */
    function turb_noise(x, y, z) {
      let n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
      return (n - Math.floor(n)) * 2 - 1;
    }

    function apply_root_tension(base, points_per_rope, root, nrm, segment_len) {
      const tension = Math.max(0, Math.min(1, state.root_tension));
      if (tension <= 0)
        return;

      const span = Math.max(0.05, Math.min(1, state.root_tension_span));
      const rigid_segments = Math.max(1, Math.min(points_per_rope - 1, Math.round((points_per_rope - 1) * span)));

      for (let j = 1; j <= rigid_segments; j++) {
        const idx = base + j * 3;
        const falloff = 1 - (j - 1) / rigid_segments;
        const blend = tension * falloff;

        const tx = root.x + nrm.x * j * segment_len;
        const ty = root.y + nrm.y * j * segment_len;
        const tz = root.z + nrm.z * j * segment_len;

        data.positions[idx]     = data.positions[idx]     * (1 - blend) + tx * blend;
        data.positions[idx + 1] = data.positions[idx + 1] * (1 - blend) + ty * blend;
        data.positions[idx + 2] = data.positions[idx + 2] * (1 - blend) + tz * blend;

        data.positions_prev[idx]     = data.positions_prev[idx]     * (1 - blend) + tx * blend;
        data.positions_prev[idx + 1] = data.positions_prev[idx + 1] * (1 - blend) + ty * blend;
        data.positions_prev[idx + 2] = data.positions_prev[idx + 2] * (1 - blend) + tz * blend;
      }
    }

    function apply_mesh_collision(base, points_per_rope, root, nrm, segment_len, has_volume_collision) {
      if (!state.mesh_collision)
        return;

      const hardness = Math.max(0, Math.min(1, state.mesh_collision_hardness));
      if (hardness <= 0)
        return;

      const offset = Math.max(0, state.mesh_collision_offset) * segment_len;

      /*
       * Half-space constraint per rope with PROXIMITY fade:
       * The anchor surface defines a plane (root, nrm).
       * Particles that cross "inside" (dot < offset) get pushed back out.
       *
       * To avoid the infinite-plane problem (where hanging particles
       * far from the body get pushed by a plane that extends into
       * empty space), we fade the constraint based on the particle's
       * ACTUAL 3D distance from the root. Only particles close to
       * the surface are constrained; distant hanging particles are free.
       *
       * proximity_radius: beyond this distance the constraint is zero.
       * We use ~3 segment lengths — enough to cover the first few
       * segments near the skin; beyond that, hair hangs freely.
       */

      const proximity_radius = segment_len * 3.0;
      const inv_proximity = (proximity_radius > 1e-8) ? 1.0 / proximity_radius : 0;

      for (let j = 1; j < points_per_rope; j++) {
        const idx = base + j * 3;

        let px = data.positions[idx];
        let py = data.positions[idx + 1];
        let pz = data.positions[idx + 2];

        /* vector from root to particle */
        const rx = px - root.x;
        const ry = py - root.y;
        const rz = pz - root.z;

        /* proximity fade based on real 3D distance from anchor */
        const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);
        const proximity = Math.max(0, 1 - dist * inv_proximity);
        if (proximity <= 0) continue;   /* particle is far from surface — skip */

        /* signed distance from particle to surface plane */
        const nd = rx * nrm.x + ry * nrm.y + rz * nrm.z;

        if (nd < offset) {
          /* particle is below the surface — push it out */
          const push = (offset - nd) * hardness * proximity;

          px += nrm.x * push;
          py += nrm.y * push;
          pz += nrm.z * push;

          /* also correct prev to avoid velocity kick (prevents jitter) */
          data.positions_prev[idx]     += nrm.x * push * 0.9;
          data.positions_prev[idx + 1] += nrm.y * push * 0.9;
          data.positions_prev[idx + 2] += nrm.z * push * 0.9;
        }

        data.positions[idx] = px;
        data.positions[idx + 1] = py;
        data.positions[idx + 2] = pz;
      }
    }

    function refresh_line_positions() {
      if (!data.positions || !data.line_positions)
        return;

      const cam = get_camera();
      if (!cam) return;

      const count = data.active_count;
      const resolution = data.active_resolution;
      const points_per_rope = resolution + 1;
      const hw = state.line_width * get_model_scale() * 0.5;
      const taper_amount = Math.max(0, Math.min(1, state.taper));

      const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;

      /* ── parse base colour for per-vertex AO tinting ── */
      const _bc = parseInt(state.color.replace('#',''), 16);
      const _br = ((_bc >> 16) & 0xff) / 255;
      const _bgc = ((_bc >> 8) & 0xff) / 255;
      const _bb = (_bc & 0xff) / 255;
      const _hasCol = !!data.line_colors;

      let vi = 0;
      for (let i = 0; i < count; i++) {
        const base = i * points_per_rope * 3;

        /* ── pre-compute per-vertex billboard offsets (smooth, shared at junctions) ── */
        /* For each vertex j (0..resolution), compute the billboard side-vector
           scaled by the tapered width. Adjacent segments then share the same
           offset at their junction vertex → no cracks. */

        /* reuse a flat array – 3 floats (ox,oy,oz) per vertex */
        const ppr = points_per_rope;  /* resolution + 1 */
        /* lazily allocate scratch buffer (once, then reuse) */
        if (!data._voff || data._voff.length < ppr * 3)
          data._voff = new Float32Array(ppr * 3);
        const voff = data._voff;

        for (let j = 0; j < ppr; j++) {
          const pi = base + j * 3;
          const px = data.positions[pi], py = data.positions[pi+1], pz = data.positions[pi+2];

          /* tangent: average of prev and next segment tangent */
          let tdx = 0, tdy = 0, tdz = 0;
          if (j < resolution) {
            const ni = pi + 3;
            tdx += data.positions[ni] - px;
            tdy += data.positions[ni+1] - py;
            tdz += data.positions[ni+2] - pz;
          }
          if (j > 0) {
            const pi2 = pi - 3;
            tdx += px - data.positions[pi2];
            tdy += py - data.positions[pi2+1];
            tdz += pz - data.positions[pi2+2];
          }

          /* view vector */
          const vvx = cx - px, vvy = cy - py, vvz = cz - pz;

          /* cross product: tangent × view → side normal */
          let sx = tdy*vvz - tdz*vvy;
          let sy = tdz*vvx - tdx*vvz;
          let sz = tdx*vvy - tdy*vvx;
          let sl = Math.sqrt(sx*sx + sy*sy + sz*sz);
          if (sl < 1e-10) { sx=0; sy=1; sz=0; sl=1; }
          else { const inv = 1/sl; sx*=inv; sy*=inv; sz*=inv; }

          /* tapered width at this vertex */
          const t = j / resolution;
          const w = hw * (1 - taper_amount * t * t);

          const oi = j * 3;
          voff[oi]   = sx * w;
          voff[oi+1] = sy * w;
          voff[oi+2] = sz * w;
        }

        /* ── build quads from shared vertex offsets ── */
        let prev_dx = 0, prev_dy = 0, prev_dz = 0;
        for (let j = 0; j < resolution; j++) {
          const a = base + j * 3;
          const b = a + 3;

          const ax = data.positions[a],   ay = data.positions[a+1], az = data.positions[a+2];
          const bx = data.positions[b],   by = data.positions[b+1], bz = data.positions[b+2];
          let tx = bx-ax, ty = by-ay, tz = bz-az;

          const oi0 = j * 3;
          const oi1 = (j+1) * 3;
          const ox0 = voff[oi0], oy0 = voff[oi0+1], oz0 = voff[oi0+2];
          const ox1 = voff[oi1], oy1 = voff[oi1+1], oz1 = voff[oi1+2];

          data.line_positions[vi]    = ax - ox0;
          data.line_positions[vi+1]  = ay - oy0;
          data.line_positions[vi+2]  = az - oz0;

          data.line_positions[vi+3]  = ax + ox0;
          data.line_positions[vi+4]  = ay + oy0;
          data.line_positions[vi+5]  = az + oz0;

          data.line_positions[vi+6]  = bx - ox1;
          data.line_positions[vi+7]  = by - oy1;
          data.line_positions[vi+8]  = bz - oz1;

          data.line_positions[vi+9]  = ax + ox0;
          data.line_positions[vi+10] = ay + oy0;
          data.line_positions[vi+11] = az + oz0;

          data.line_positions[vi+12] = bx + ox1;
          data.line_positions[vi+13] = by + oy1;
          data.line_positions[vi+14] = bz + oz1;

          data.line_positions[vi+15] = bx - ox1;
          data.line_positions[vi+16] = by - oy1;
          data.line_positions[vi+17] = bz - oz1;

          vi += 18;

          /* ── per-vertex ambient-occlusion tint ── */
          if (_hasCol) {
            const t0 = j / resolution;
            const t1 = (j + 1) / resolution;
            const root0 = Math.min(1, t0 * 5);
            const root1 = Math.min(1, t1 * 5);
            const tip0 = 0.82 + 0.18 * (1 - t0 * t0);
            const tip1 = 0.82 + 0.18 * (1 - t1 * t1);
            let bend_ao = 1.0;
            if (j > 0) {
              const lp = Math.sqrt(prev_dx*prev_dx + prev_dy*prev_dy + prev_dz*prev_dz);
              const lc = Math.sqrt(tx*tx + ty*ty + tz*tz);
              if (lp > 1e-8 && lc > 1e-8) bend_ao = 0.55 + 0.45 * Math.max(0, (prev_dx*tx + prev_dy*ty + prev_dz*tz) / (lp * lc));
            }
            prev_dx = tx; prev_dy = ty; prev_dz = tz;
            const ed = 0.88;
            const ao0 = root0 * tip0 * bend_ao;
            const ao1 = root1 * tip1 * bend_ao;
            const r0 = _br*ao0*ed, g0 = _bgc*ao0*ed, b0 = _bb*ao0*ed;
            const r1 = _br*ao1*ed, g1 = _bgc*ao1*ed, b1 = _bb*ao1*ed;
            const ci = vi - 18;
            data.line_colors[ci]=r0;    data.line_colors[ci+1]=g0;    data.line_colors[ci+2]=b0;
            data.line_colors[ci+3]=r0;  data.line_colors[ci+4]=g0;    data.line_colors[ci+5]=b0;
            data.line_colors[ci+6]=r1;  data.line_colors[ci+7]=g1;    data.line_colors[ci+8]=b1;
            data.line_colors[ci+9]=r0;  data.line_colors[ci+10]=g0;   data.line_colors[ci+11]=b0;
            data.line_colors[ci+12]=r1; data.line_colors[ci+13]=g1;   data.line_colors[ci+14]=b1;
            data.line_colors[ci+15]=r1; data.line_colors[ci+16]=g1;   data.line_colors[ci+17]=b1;
          }
        }
      }

      data.geometry.attributes.position.needsUpdate = true;
      if (_hasCol && data.geometry.attributes.color)
        data.geometry.attributes.color.needsUpdate = true;
      data.geometry.computeBoundingSphere();
    }

    function rebuild() {
      const T = get_THREE();
      if (!T)
        return;

      destroy_mesh();

      const scene = get_scene();
      if (!scene || !state.enabled)
        return;

      const count = clamp_int(state.count, state.min_count, state.max_count);
      const resolution = clamp_int(state.resolution, state.min_resolution, state.max_resolution);

      data.active_count = count;
      data.active_resolution = resolution;
      state.count = count;
      state.resolution = resolution;

      {
        const meshes = collect_skinned_meshes();
        if (meshes.length > 0) {
          data.sampler = build_mesh_sampler(meshes);
          data.anchors = new Array(count).fill(0).map(() => sample_surface_point(data.sampler));
        } else {
          data.anchors = new Array(count).fill(0).map(() =>
            ({ sm:null, i0:0, i1:0, i2:0, u:.33, v:.33, w:.34 }));
        }
      }

      const points_per_rope = resolution + 1;
      const point_count = count * points_per_rope;
      data.positions = new Float32Array(point_count * 3);
      data.positions_prev = new Float32Array(point_count * 3);

      const tri_verts_per_seg = 6;
      const total_tris_verts = count * resolution * tri_verts_per_seg;
      data.line_positions = new Float32Array(total_tris_verts * 3);
      data.line_colors = null;

      data.geometry = new T.BufferGeometry();
      const attr = new T.BufferAttribute(data.line_positions, 3);
      attr.setUsage(T.DynamicDrawUsage);
      data.geometry.setAttribute('position', attr);

      /* ── Flat white material — no AO, no lighting ── */
      data.material = new T.MeshBasicMaterial({
        color: state.color,
        vertexColors: false,
        transparent: true,
        opacity: state.opacity,
        side: T.DoubleSide,
        depthWrite: false,
      });

      data.mesh = new T.Mesh(data.geometry, data.material);
      data.mesh.name = 'XR_Ropes';
      data.mesh.frustumCulled = false;
      data.mesh.renderOrder = 999;
      scene.add(data.mesh);

      /* ── Hemisphere light for ambient / GI-like illumination ── */
      if (!data.hemi_light) {
        data.hemi_light = new T.HemisphereLight(0xeeeeff, 0x333344, 1.0);
        scene.add(data.hemi_light);
      }

      const root = data.root || (data.root = new T.Vector3());
      _alloc_temps();
      const nrm = _tnrm || new T.Vector3(0,1,0);
      const rope_length = Math.max(state.min_rope_length, Math.min(state.max_rope_length, state.rope_length));
      const seg_len = (rope_length / Math.max(1, resolution)) * get_model_scale();
      for (let i = 0; i < count; i++) {
        get_surface_position(data.anchors[i], root, nrm);
        const base = i * points_per_rope * 3;
        for (let j = 0; j < points_per_rope; j++) {
          const idx = base + j * 3;
          data.positions[idx] = data.positions_prev[idx] = root.x + nrm.x * j * seg_len;
          data.positions[idx + 1] = data.positions_prev[idx + 1] = root.y + nrm.y * j * seg_len;
          data.positions[idx + 2] = data.positions_prev[idx + 2] = root.z + nrm.z * j * seg_len;
        }
      }

      refresh_line_positions();
      data.needs_rebuild = false;
      update_labels();
    }

    function simulate() {
      if (!data.positions || !data.positions_prev)
        return;

      const now = performance.now();
      let dt = (data.last_ts) ? (now - data.last_ts) / (1000 / 60) : 1;
      data.last_ts = now;
      dt = Math.max(0.5, Math.min(2.0, dt));

      const count = data.active_count;
      const resolution = data.active_resolution;
      const points_per_rope = resolution + 1;
      const scale = get_model_scale();
      const damping = 1 - state.damping;
      const gravity = state.gravity * Math.max(-1, Math.min(1, state.gravity_scale)) * dt * scale;
      const rope_length = Math.max(state.min_rope_length, Math.min(state.max_rope_length, state.rope_length));
      const segment_len = (rope_length / Math.max(1, resolution)) * scale;
      const has_volume_collision = update_collision_volume();

      const turb_str = Math.max(0, Math.min(1, state.turbulence)) * scale * 0.004;
      data.turb_time = (data.turb_time || 0) + dt * 0.07;
      const tt = data.turb_time;

      const root = data.root;
      if (!root)
        return;

      _alloc_temps();

      for (let i = 0; i < count; i++) {
        const base = i * points_per_rope * 3;

        get_surface_position(data.anchors[i], root, _tnrm);
        data.positions[base] = root.x;
        data.positions[base + 1] = root.y;
        data.positions[base + 2] = root.z;
        data.positions_prev[base] = root.x;
        data.positions_prev[base + 1] = root.y;
        data.positions_prev[base + 2] = root.z;

        for (let j = 1; j < points_per_rope; j++) {
          const idx = base + j * 3;

          const px = data.positions_prev[idx];
          const py = data.positions_prev[idx + 1];
          const pz = data.positions_prev[idx + 2];

          const cx = data.positions[idx];
          const cy = data.positions[idx + 1];
          const cz = data.positions[idx + 2];

          let nx = cx + (cx - px) * damping;
          let ny = cy + (cy - py) * damping + gravity;
          let nz = cz + (cz - pz) * damping;

          /* turbulence — cheap hash noise per particle */
          if (turb_str > 0) {
            const seed = i * 7.31 + j * 3.17;
            nx += turb_noise(cx * 11.3 + tt, seed, cz * 7.7) * turb_str;
            ny += turb_noise(seed, cy * 13.1 + tt, cx * 5.3) * turb_str;
            nz += turb_noise(cz * 9.7, tt + seed, cy * 6.1) * turb_str;
          }

          data.positions_prev[idx] = cx;
          data.positions_prev[idx + 1] = cy;
          data.positions_prev[idx + 2] = cz;

          data.positions[idx] = nx;
          data.positions[idx + 1] = ny;
          data.positions[idx + 2] = nz;
        }

        for (let iter = 0; iter < state.solver_iterations; iter++) {
          data.positions[base] = root.x;
          data.positions[base + 1] = root.y;
          data.positions[base + 2] = root.z;

          for (let j = 1; j < points_per_rope; j++) {
            const idx = base + j * 3;
            const pidx = idx - 3;

            const dx = data.positions[idx] - data.positions[pidx];
            const dy = data.positions[idx + 1] - data.positions[pidx + 1];
            const dz = data.positions[idx + 2] - data.positions[pidx + 2];

            const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.000001;
            const scale = segment_len / len;

            data.positions[idx] = data.positions[pidx] + dx * scale;
            data.positions[idx + 1] = data.positions[pidx + 1] + dy * scale;
            data.positions[idx + 2] = data.positions[pidx + 2] + dz * scale;
          }
        }

        apply_root_tension(base, points_per_rope, root, _tnrm, segment_len);
        apply_mesh_collision(base, points_per_rope, root, _tnrm, segment_len, has_volume_collision);

        data.positions[base] = root.x;
        data.positions[base + 1] = root.y;
        data.positions[base + 2] = root.z;
        for (let j = 1; j < points_per_rope; j++) {
          const idx = base + j * 3;
          const pidx = idx - 3;

          const dx = data.positions[idx] - data.positions[pidx];
          const dy = data.positions[idx + 1] - data.positions[pidx + 1];
          const dz = data.positions[idx + 2] - data.positions[pidx + 2];

          const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.000001;
          const s = segment_len / len;

          data.positions[idx] = data.positions[pidx] + dx * s;
          data.positions[idx + 1] = data.positions[pidx + 1] + dy * s;
          data.positions[idx + 2] = data.positions[pidx + 2] + dz * s;
        }
      }
    }

    function update_labels() {
      if (data.labels.count) data.labels.count.textContent = state.count;
      if (data.labels.resolution) data.labels.resolution.textContent = state.resolution;
      if (data.labels.line_width) data.labels.line_width.textContent = state.line_width.toFixed(3);
      if (data.labels.opacity) data.labels.opacity.textContent = state.opacity.toFixed(2);
      if (data.labels.gravity_scale) data.labels.gravity_scale.textContent = state.gravity_scale.toFixed(2);
      if (data.labels.rope_length) data.labels.rope_length.textContent = state.rope_length.toFixed(2);
      if (data.labels.root_tension) data.labels.root_tension.textContent = state.root_tension.toFixed(2);
      if (data.labels.root_tension_span) data.labels.root_tension_span.textContent = state.root_tension_span.toFixed(2);
      if (data.labels.mesh_collision_hardness) data.labels.mesh_collision_hardness.textContent = state.mesh_collision_hardness.toFixed(2);
      if (data.labels.mesh_collision_offset) data.labels.mesh_collision_offset.textContent = state.mesh_collision_offset.toFixed(2);
      if (data.labels.turbulence) data.labels.turbulence.textContent = state.turbulence.toFixed(2);
      if (data.labels.taper) data.labels.taper.textContent = state.taper.toFixed(2);
    }

    function ensure_ui() {
      if (data.panel || !document.body)
        return;

      const panel = document.createElement('div');
      panel.id = 'XRA_rope_panel';
      panel.style.cssText = [
        'position:fixed',
        'top:12px',
        'right:12px',
        'z-index:99999',
        'background:rgba(0,0,0,0.60)',
        'color:#fff',
        'padding:10px 12px',
        'border:1px solid rgba(255,255,255,0.25)',
        'border-radius:8px',
        'font-family:Arial, sans-serif',
        'font-size:12px',
        'line-height:1.3',
        'width:260px',
        'user-select:none',
      ].join(';');

      panel.innerHTML = ''
        + '<div style="font-weight:bold; margin-bottom:8px;">XR Ropes</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Cantidad: <span id="XRA_rope_count_label"></span></label>'
        + '  <input id="XRA_rope_count" type="range" min="' + state.min_count + '" max="' + state.max_count + '" step="50" value="' + state.count + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Resolución: <span id="XRA_rope_resolution_label"></span></label>'
        + '  <input id="XRA_rope_resolution" type="range" min="' + state.min_resolution + '" max="' + state.max_resolution + '" step="1" value="' + state.resolution + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Longitud: <span id="XRA_rope_length_label"></span></label>'
        + '  <input id="XRA_rope_length" type="range" min="' + state.min_rope_length + '" max="' + state.max_rope_length + '" step="0.01" value="' + state.rope_length + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Grosor: <span id="XRA_rope_width_label"></span></label>'
        + '  <input id="XRA_rope_width" type="range" min="' + state.min_line_width + '" max="' + state.max_line_width + '" step="0.001" value="' + state.line_width + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Punta (taper): <span id="XRA_rope_taper_label"></span></label>'
        + '  <input id="XRA_rope_taper" type="range" min="0" max="1.0" step="0.01" value="' + state.taper + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Opacidad: <span id="XRA_rope_opacity_label"></span></label>'
        + '  <input id="XRA_rope_opacity" type="range" min="0.02" max="1.0" step="0.01" value="' + state.opacity + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Gravedad: <span id="XRA_rope_gravity_scale_label"></span></label>'
        + '  <input id="XRA_rope_gravity_scale" type="range" min="-1.0" max="1.0" step="0.01" value="' + state.gravity_scale + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Tramo rígido: <span id="XRA_rope_root_tension_span_label"></span></label>'
        + '  <input id="XRA_rope_root_tension_span" type="range" min="0.05" max="1.0" step="0.01" value="' + state.root_tension_span + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Tensión raíz: <span id="XRA_rope_root_tension_label"></span></label>'
        + '  <input id="XRA_rope_root_tension" type="range" min="0" max="1.0" step="0.01" value="' + state.root_tension + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Dureza colisión: <span id="XRA_rope_collision_hardness_label"></span></label>'
        + '  <input id="XRA_rope_collision_hardness" type="range" min="0" max="1.0" step="0.01" value="' + state.mesh_collision_hardness + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Turbulencia: <span id="XRA_rope_turbulence_label"></span></label>'
        + '  <input id="XRA_rope_turbulence" type="range" min="0" max="1.0" step="0.01" value="' + state.turbulence + '" style="width:100%;">'
        + '</div>'
        + '<div style="margin-bottom:8px;">'
        + '  <label style="display:block; margin-bottom:3px;">Color:</label>'
        + '  <input id="XRA_rope_color" type="color" value="' + state.color + '" style="width:100%; height:30px; border:none; cursor:pointer; background:transparent;">'
        + '</div>'
        + '<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">'
        + '  <label style="display:flex; align-items:center; gap:6px;"><input id="XRA_rope_enabled" type="checkbox" ' + ((state.enabled) ? 'checked' : '') + '>Activo</label>'
        + '  <label style="display:flex; align-items:center; gap:6px;"><input id="XRA_rope_floor" type="checkbox" ' + ((state.floor_enabled) ? 'checked' : '') + '>Floor</label>'
        + '  <label style="display:flex; align-items:center; gap:6px;"><input id="XRA_rope_collision" type="checkbox" ' + ((state.mesh_collision) ? 'checked' : '') + '>Colisión</label>'
        + '  <button id="XRA_rope_reset" style="font-size:11px; padding:3px 8px; cursor:pointer; border-radius:4px; border:1px solid rgba(255,255,255,0.3); color:#fff; background:rgba(255,255,255,0.1);">Reset</button>'
        + '</div>';

      (document.getElementById('Lbody') || document.body).appendChild(panel);

      {
        const offset_wrap = document.createElement('div');
        offset_wrap.style.cssText = 'margin-bottom:8px;';
        offset_wrap.innerHTML = ''
          + '<label style="display:block; margin-bottom:3px;">Offset colisión: <span id="XRA_rope_collision_offset_label"></span></label>'
          + '<input id="XRA_rope_collision_offset" type="range" min="0" max="0.30" step="0.005" value="' + state.mesh_collision_offset + '" style="width:100%;">';

        const controls_row = panel.querySelector('#XRA_rope_reset')?.parentElement;
        if (controls_row) controls_row.before(offset_wrap);
        else panel.appendChild(offset_wrap);
      }

      panel.addEventListener('pointerdown', (e)=>{ e.stopPropagation(); });
      panel.addEventListener('mousedown', (e)=>{ e.stopPropagation(); });
      panel.addEventListener('touchstart', (e)=>{ e.stopPropagation(); }, {passive:true});
      panel.addEventListener('pointermove', (e)=>{ e.stopPropagation(); });
      panel.addEventListener('mousemove', (e)=>{ e.stopPropagation(); });
      panel.addEventListener('touchmove', (e)=>{ e.stopPropagation(); }, {passive:true});

      const count_input = panel.querySelector('#XRA_rope_count');
      const res_input = panel.querySelector('#XRA_rope_resolution');
      const length_input = panel.querySelector('#XRA_rope_length');
      const width_input = panel.querySelector('#XRA_rope_width');
      const opacity_input = panel.querySelector('#XRA_rope_opacity');
      const gravity_scale_input = panel.querySelector('#XRA_rope_gravity_scale');
      const root_tension_span_input = panel.querySelector('#XRA_rope_root_tension_span');
      const root_tension_input = panel.querySelector('#XRA_rope_root_tension');
      const collision_hardness_input = panel.querySelector('#XRA_rope_collision_hardness');
      const collision_offset_input = panel.querySelector('#XRA_rope_collision_offset');
      const turbulence_input = panel.querySelector('#XRA_rope_turbulence');
      const taper_input = panel.querySelector('#XRA_rope_taper');
      const color_input = panel.querySelector('#XRA_rope_color');
      const enabled_input = panel.querySelector('#XRA_rope_enabled');
      const floor_input = panel.querySelector('#XRA_rope_floor');
      const collision_input = panel.querySelector('#XRA_rope_collision');
      const reset_btn = panel.querySelector('#XRA_rope_reset');

      data.labels.count = panel.querySelector('#XRA_rope_count_label');
      data.labels.resolution = panel.querySelector('#XRA_rope_resolution_label');
      data.labels.rope_length = panel.querySelector('#XRA_rope_length_label');
      data.labels.line_width = panel.querySelector('#XRA_rope_width_label');
      data.labels.opacity = panel.querySelector('#XRA_rope_opacity_label');
      data.labels.gravity_scale = panel.querySelector('#XRA_rope_gravity_scale_label');
      data.labels.root_tension_span = panel.querySelector('#XRA_rope_root_tension_span_label');
      data.labels.root_tension = panel.querySelector('#XRA_rope_root_tension_label');
      data.labels.mesh_collision_hardness = panel.querySelector('#XRA_rope_collision_hardness_label');
      data.labels.mesh_collision_offset = panel.querySelector('#XRA_rope_collision_offset_label');
      data.labels.turbulence = panel.querySelector('#XRA_rope_turbulence_label');
      data.labels.taper = panel.querySelector('#XRA_rope_taper_label');

      count_input.addEventListener('input', ()=>{
        state.count = clamp_int(count_input.value, state.min_count, state.max_count);
        data.needs_rebuild = true;
        update_labels();
      });

      res_input.addEventListener('input', ()=>{
        state.resolution = clamp_int(res_input.value, state.min_resolution, state.max_resolution);
        data.needs_rebuild = true;
        update_labels();
      });

      length_input.addEventListener('input', ()=>{
        state.rope_length = Math.max(state.min_rope_length, Math.min(state.max_rope_length, parseFloat(length_input.value) || state.min_rope_length));
        update_labels();
      });

      width_input.addEventListener('input', ()=>{
        state.line_width = Math.max(state.min_line_width, Math.min(state.max_line_width, parseFloat(width_input.value) || state.min_line_width));
        update_labels();
      });

      opacity_input.addEventListener('input', ()=>{
        state.opacity = Math.max(0.02, Math.min(1.0, parseFloat(opacity_input.value) || 0.5));
        if (data.material) data.material.opacity = state.opacity;
        update_labels();
      });

      gravity_scale_input.addEventListener('input', ()=>{
        state.gravity_scale = Math.max(-1.0, Math.min(1.0, parseFloat(gravity_scale_input.value) || 0));
        update_labels();
      });

      root_tension_span_input.addEventListener('input', ()=>{
        state.root_tension_span = Math.max(0.05, Math.min(1.0, parseFloat(root_tension_span_input.value) || 0.05));
        update_labels();
      });

      root_tension_input.addEventListener('input', ()=>{
        state.root_tension = Math.max(0, Math.min(1.0, parseFloat(root_tension_input.value) || 0));
        update_labels();
      });

      collision_hardness_input.addEventListener('input', ()=>{
        state.mesh_collision_hardness = Math.max(0, Math.min(1.0, parseFloat(collision_hardness_input.value) || 0));
        update_labels();
      });

      collision_offset_input.addEventListener('input', ()=>{
        state.mesh_collision_offset = Math.max(0, Math.min(0.30, parseFloat(collision_offset_input.value) || 0));
        update_labels();
      });

      turbulence_input.addEventListener('input', ()=>{
        state.turbulence = Math.max(0, Math.min(1.0, parseFloat(turbulence_input.value) || 0));
        update_labels();
      });

      taper_input.addEventListener('input', ()=>{
        state.taper = Math.max(0, Math.min(1.0, parseFloat(taper_input.value) || 0));
        update_labels();
      });

      color_input.addEventListener('input', ()=>{
        state.color = color_input.value;
        if (data.material) {
          const T = get_THREE();
          if (T) data.material.emissive = new T.Color(state.color);
        }
      });

      enabled_input.addEventListener('change', ()=>{
        state.enabled = !!enabled_input.checked;
        if (!state.enabled) {
          destroy_mesh();
        }
        else {
          data.needs_rebuild = true;
        }
      });

      floor_input.addEventListener('change', ()=>{
        state.floor_enabled = !!floor_input.checked;
        if (!state.floor_enabled) destroy_floor();
        else ensure_floor();
      });

      collision_input.addEventListener('change', ()=>{
        state.mesh_collision = !!collision_input.checked;
      });

      reset_btn.addEventListener('click', ()=>{
        data.needs_rebuild = true;
      });

      update_labels();
      data.panel = panel;
    }

    function update() {
      const T = get_THREE();
      if (!T)
        return;

      ensure_ui();

      if (!state.enabled)
        return;

      if (!has_any_model())
        return;

      if (data.needs_rebuild || !data.mesh)
        rebuild();

      if (!data.mesh)
        return;

      ensure_floor();
      update_floor_position();

      simulate();
      refresh_line_positions();
    }

    return {
      state,
      ensure_ui,
      update,
      rebuild: ()=>{ data.needs_rebuild = true; },
      destroy: destroy_mesh,
    };
  })();

