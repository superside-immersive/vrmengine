# Arquitectura del Tracking — SystemAnimatorOnline / XR Animator

## Resumen del pipeline completo

```
Cámara → OffscreenCanvas → RGBA pixels
  │
  ├──► PoseAT Worker   ──► ML body pose (BlazePose 33 pts) + manos (21 pts × 2)
  ├──► FacemeshAT Worker ──► ML cara (478 pts + 52 ARKit blendshapes)
  │
  ▼
SA_system_emulation.min.js (main thread)
  │
  ├── IK solver → frames.skin (quaterniones por hueso MMD)
  ├── Face solver → frames.morph (blendshapes interpolados)
  ├── jThree render → bones_by_name (estado final post-física)
  │
  ▼
vrm-direct-solver.js → Traduce MMD→VRM (BONE_MAP) → quaterniones VRM
vrm-direct-animator.js → tick() loop → aplica a nodos VRM + expressions
three-vrm.module.min.js → spring bones (pelo, ropa), physics
  │
  ▼
WebGLRenderer → Canvas
```

---

## 1. Captura de video

La cámara se inicializa en `SA_system_emulation.min.js` con `navigator.mediaDevices.getUserMedia()`.

- El video se dibuja en un `<canvas>` (o `OffscreenCanvas`) para extraer pixels RGBA
- Los frames se envían a workers vía `postMessage` con datos transferibles:
  ```
  { rgba: ArrayBuffer|ImageBitmap, w: number, h: number, options: {...} }
  ```
- `options` incluye: `timestamp`, `use_handpose`, `use_holistic`, `pose_enabled`, `z_depth_scale`, etc.

---

## 2. Workers — Arquitectura

Hay **tres tipos de workers** que corren ML inference en paralelo:

```
Main Thread
  │
  ├── postMessage(rgba) ──► PoseAT Worker (body + manos)
  │       │                    │
  │       │                    ├── postMessage(rgba) ──► HandsAT Sub-Worker (manos aparte)
  │       │                    │
  │       │                    ◄── postMessage(handpose)
  │       │
  │       ◄── postMessageAT(JSON) ── posenet + handpose + facemesh (holistic)
  │
  ├── postMessage(rgba) ──► FacemeshAT Worker (cara)
  │       │
  │       ◄── postMessageAT(JSON) ── faces + blendshapes
  │
  ▼
SA_system_emulation.min.js  ←  handlers Rt (pose) y v (face)
```

### Creación de workers

Definidos en `SA_system_emulation.min.js`:

| Worker | Script | Inicialización |
|--------|--------|----------------|
| **PoseAT** | `js/tracking/pose_worker.js` → importa `pose_lib.js` → importa `mocap_lib_module.js` | `new Worker('js/tracking/pose_worker.js?' + params)` |
| **HandsAT** | `js/tracking/hands_worker.js` → importa `hands_lib.js` → importa `mocap_lib_module.js` | Creado **dentro** del PoseAT worker como sub-worker |
| **FacemeshAT** | `js/tracking/facemesh_worker.js` → importa `facemesh_lib.js` | `new Worker('js/tracking/facemesh_worker.js?' + params)` |

Cada worker tiene un **modo no-worker** (fallback sin threads):
```js
// Modo worker:
U = new Worker('js/tracking/pose_worker.js?' + params);
U.onmessage = Rt;

// Modo no-worker (worker_disabled):
U = { postMessage: function(e,t) { PoseAT.onmessage({data:e}) } };
```

### Formato de mensajes

**PoseAT → Main thread** (`mocap-video-processor.js` L301):
```js
S.postMessageAT(JSON.stringify({
  posenet:  pose,              // { score, keypoints[], keypoints3D[], keypoints3D_raw[] }
  handpose: hands,             // [{ score, label, keypoints[][], annotations{}, worldLandmarks? }]
  facemesh: facemesh,          // { faces: [{ scaledMesh, faceBlendshapes, ... }] }  (solo holistic)
  object_detection: ...,
  _t, fps, _t_hands, fps_hands
}));
```

**FacemeshAT → Main thread** (`facemesh-processor.js` L131):
```js
S.postMessageAT(JSON.stringify({
  faces: [{ faceInViewConfidence, scaledMesh, mesh, eyes, bb_center, emotion, rotation, faceBlendshapes }],
  _t, fps
}));
```

---

## 3. Modelos ML

### Body Pose

Múltiples backends seleccionables por URL params. En `mocap-mediapipe-bridge.js`:

| Modelo | Flag | Archivo de modelo | Notas |
|--------|------|-------------------|-------|
| **MediaPipe PoseLandmarker** | `use_mediapipe_pose_landmarker` | `@mediapipe/tasks/pose_landmarker_full.task` | GPU delegate, VIDEO mode. **Ruta principal.** |
| **MediaPipe HolisticLandmarker** | `use_holistic_landmarker` | `@mediapipe/tasks/holistic_landmarker.task` | Todo-en-uno: pose+manos+cara. `outputFaceBlendshapes: true` |
| **MediaPipe Holistic (legacy)** | `use_holistic_legacy` | `@mediapipe/holistic/holistic.js` | API antigua |
| **MoveNet** | `use_movenet && !use_blazepose` | `@tensorflow-models/pose-detection` | SINGLEPOSE_THUNDER |
| **BlazePose (TFJS)** | `use_blazepose && !use_mediapipe` | `@mediapipe/pose-detection.js` | enableSmoothing |
| **PoseNet** | fallback | `@tensorflow-models/posenet` | MobileNetV1 o ResNet50 |
| **Human.js** | `use_human` | `human/dist/human.js` | body+hand |

### Manos

| Modelo | Dónde | Notas |
|--------|-------|-------|
| **MediaPipe HandLandmarker** | `mocap-mediapipe-bridge.js` L36-110 | `hand_landmarker.task`, GPU, 2 manos. Dos modelos con thresholds distintos (0.5 y 0.1) para sensibilidad adaptiva |
| **MediaPipe Hands (legacy)** | L498-530 | `@mediapipe/hands/hands.js` |
| **Human.js** | Parte de Human init | `handtrack.json`, `handskeleton.json` |

### Cara

| Modelo | Archivo | Notas |
|--------|---------|-------|
| **MediaPipe FaceLandmarker** | `facemesh-core.js` | `face_landmarker.task`, GPU, output: 52 blendshapes ARKit |
| **MediaPipe FaceMesh (legacy)** | `facemesh-core.js` | `@mediapipe/face-mesh` |
| **Human.js** | `facemesh-core.js` | WebGL/WASM |

---

## 4. Procesamiento de datos (dentro del worker)

### 4.1 Pose — `mocap-pose-processor.js`

La función `pose_adjust(S, pose, w, h, options)` procesa el output del ML:

```
ML output (PoseLandmarker)
  │
  ├── 33 landmarks 2D: {x, y, z, score, name}  (coords normalizadas 0-1)
  ├── 33 worldLandmarks 3D: {x, y, z}  (metros, raíz ≈ mid-hip)
  │
  ▼ pose_adjust()
  │
  ├── 1. Calcula shoulder_width (distancia hombro-hombro en pixels)
  ├── 2. OneEuroFilter en Z de cada landmark (solo filtro de profundidad)
  ├── 3. Calcula scores de visibilidad (clamp por distancia fuera del frame)
  ├── 4. Genera keypoints3D (hip-centered, escalado proporcional, Z ÷ z_depth_scale):
  │       keypoints3D[i] = { x: (lm.x - hip.x) * scale, ..., z * 1/z_depth_scale }
  ├── 5. Guarda keypoints3D_raw (worldLandmarks crudos sin modificar):
  │       keypoints3D_raw[i] = { x: worldLm.x, y: worldLm.y, z: worldLm.z }
  ├── 6. Convierte a formato MoveNet (compatibilidad):
  │       keypoints: [{ position: {x,y,z}, score, part: "leftShoulder" }]
  │
  ▼ Output
  {
    score: number,
    keypoints: [...],          // 2D + score, formato MoveNet
    keypoints3D: [...],        // 3D hip-centered, escalado
    keypoints3D_raw: [...]     // 3D crudo (metros, mundo)
  }
```

#### `keypoints3D` vs `keypoints3D_raw`

| Campo | Origen | Centro | Escala | Z | Uso |
|-------|--------|--------|--------|---|-----|
| `keypoints3D` | worldLandmarks transformados | Mid-hip (restado) | Escalado vs 2D proportions | Dividido por `z_depth_scale` (default 3) | SA IK solver |
| `keypoints3D_raw` | worldLandmarks sin tocar | MediaPipe native (≈ mid-hip) | Metros | Sin modificar | Fase 2 pose solver |

### 4.2 Manos — `mocap-hands-processor.js`

`hands_adjust(S, hands, nowInMs, pose, w, h, options)`:

```
ML output (HandLandmarker)
  │
  ├── multiHandLandmarks: [21 pts × N manos]  (coords normalizadas)
  ├── worldLandmarks: [21 pts × N manos]  (metros, 3D)
  ├── multiHandedness: [{score, label: "Left"|"Right"}]
  │
  ▼ hands_adjust()
  │
  ├── 1. Corrección de handedness (heurística por distancia)
  ├── 2. Proyección a pixels: landmark_adjust() o w*h directo
  ├── 3. Corrección de Z por ratio ancho/alto de palma
  ├── 4. Bone length enforcement (previene dedos colapsados)
  ├── 5. OneEuroFilter por landmark (palm-relative: restar palm → filtrar → sumar palm)
  ├── 6. Construye annotations:
  │       { palm: [wrist], thumb: [1,2,3,4], index: [5,6,7,8], middle, ring, pinky }
  │
  ▼ Output por mano
  {
    score: number,
    label: "Left" | "Right",
    keypoints: [[x,y,z], ...],     // 21 puntos en pixels
    annotations: { palm, thumb, index, middle, ring, pinky },
    worldLandmarks: {               // solo si tiene worldLandmarks
      keypoints: [...],             // 21 puntos 3D (metros)
      annotations: { ... }
    }
  }
```

### 4.3 Cara — `facemesh-processor.js`

```
ML output (FaceLandmarker)
  │
  ├── 478 landmarks (468 cara + 10 iris)
  ├── 52 faceBlendshapes (ARKit): [{categoryName, score}]
  │
  ▼ process_facemesh()
  │
  ├── 1. Escala landmarks a bounding box del video
  ├── 2. Pupil tracking vía iris landmarks (índices 468, 473) o puploc fallback
  ├── 3. Detección de emoción (si hay object detection worker)
  ├── 4. Head rotation desde geometría de mesh
  │
  ▼ Output
  {
    faces: [{
      faceInViewConfidence: 0-1,
      scaledMesh: [[x,y,z], ...],    // 478 puntos escalados
      mesh: [[x,y,z], ...],          // coords normalizadas
      eyes: { left, right, pupilL, pupilR },
      bb_center: {x, y},
      emotion: string,
      rotation: { pitch, yaw, roll },
      faceBlendshapes: [{categoryName, score}, ...]   // 52 ARKit shapes
    }]
  }
```

---

## 5. Recepción en main thread — `SA_system_emulation.min.js`

### Handler `Rt` (PoseAT results)

Recibe el JSON del PoseAT worker y:

1. **Parsea** `{ posenet, handpose, facemesh, _t, fps }`
2. **Ejecuta SA IK pipeline** → calcula quaterniones de huesos desde keypoints
3. **Escribe** `frames.skin[boneName] = [currentFrame, prevFrame]`:
   ```js
   frames.skin['上半身']  = [{ rot: Quaternion, pos: Vector3, t_delta, t_delta_frame }, prev]
   frames.skin['右腕']    = [{ rot: Quaternion, ... }, prev]
   frames.skin['左ひじ']  = [{ rot: Quaternion, ... }, prev]
   // ... etc para cada hueso MMD
   ```
4. **Calcula rotación de cabeza** desde mesh facial (landmarks 454, 234, 152, 10)
5. **Escribe** `frames.morph[blendshapeName] = [current, prev]`:
   ```js
   frames.morph['JawOpen']     = [{ weight: 0.5, t_delta, t_delta_frame, timestamp }, prev]
   frames.morph['EyeBlinkLeft'] = [{ weight: 0.8, ... }, prev]
   frames.morph['あ']           = [{ weight: 0.3, ... }, prev]   // MMD morphs
   ```
6. **Actualiza** wireframe overlay
7. **Forwards** facemesh data al FacemeshAT worker para drawing

### Handler `v` (FacemeshAT results)

Recibe cara y:
1. Almacena landmarks, blendshapes, datos de ojos
2. Computa head rotation desde puntos del mesh facial
3. Escribe `facemesh.frames.morph` con interpolación
4. Actualiza `facemesh.faceBlendshapes_list` (52 nombres ARKit)

### Almacenamiento de datos en globals

```
System._browser.camera
  │
  ├── .poseNet
  │     ├── .frames.skin[boneName]     // quaterniones IK (MMD-named)
  │     └── .frames._raw_keypoints3D   // (si expuesto) landmarks crudos
  │
  ├── .facemesh
  │     ├── .frames.morph[name]        // blendshapes interpolados
  │     └── .faceBlendshapes_list      // 52 nombres ARKit
  │
  └── .handpose                         // array de manos procesadas

THREE.MMD.getModels()[0].mesh
  └── .bones_by_name[boneName]          // estado final post-física (jThree)
```

---

## 6. Pipeline SA IK — `SA_system_emulation.min.js`

El SA IK solver (código minificado, función `Rt`) convierte keypoints → quaterniones:

### Huesos body

```
keypoints3D[11] (left_shoulder) ─┐
keypoints3D[13] (left_elbow)     ├── quaternión del brazo superior
keypoints3D[15] (left_wrist)     │
                                 ▼
                             frames.skin['左腕']  (leftUpperArm)
                             frames.skin['左ひじ'] (leftLowerArm)
                             frames.skin['左腕捩'] (leftArmTwist)
```

Lo mismo para cada grupo:
- **Centro**: `keypoints3D` centroide → `全ての親`, `センター`, `グルーブ`
- **Torso**: hombros/caderas → `上半身`, `上半身2`, `下半身`
- **Cabeza**: mesh facial → `首`, `頭`
- **Brazos**: hombro/codo/muñeca → `(左|右)腕`, `(左|右)ひじ`, `(左|右)手首`
- **Piernas**: cadera/rodilla/tobillo → `(左|右)足`, `(左|右)ひざ`
- **Dedos**: hand annotations → 15 huesos por mano (thumb×3, index×3, middle×3, ring×3, pinky×3)

### Descomposición de twist

Los huesos `腕捩` (arm twist) y `手捩` (wrist twist) se calculan descomponiendo la rotación del brazo en eje local del hueso (twist) vs perpendicular (swing).

### OneEuroFilter en IK

Dentro de SA core, cada hueso tiene su propio filtro:
- `head_rot` → type=4 (quaternion)
- `head_chest_rot` → type=3 (vector)
- `rot_chest_offset` → type=4 (quaternion)

---

## 7. Pipeline VRM Direct

### Módulos

| Archivo | Global | Función |
|---------|--------|---------|
| `vrm-direct-main.js` | `VRMDirect` | Orquestador, init, enable/disable |
| `vrm-direct-loader.js` | `VRMDirectLoader` | Carga VRM, crea scene/renderer propios |
| `vrm-direct-solver.js` | `VRMDirectSolver` | Lee MMD bones/morphs → formato VRM |
| `vrm-direct-pose-solver.js` | `VRMDirectPoseSolver` | Fase 2: BlazePose crudo → quaterniones VRM |
| `vrm-direct-animator.js` | `VRMDirectAnimator` | Loop de animación (tick) |

### Orden de carga (`_SA.js` L677-711)

```
threex-vrm.js →
vrm-direct-solver.js →
vrm-direct-pose-solver.js →     ← Fase 2 (IK propio)
vrm-direct-loader.js →
vrm-collision.js →
vrm-direct-animator.js →
vrm-direct-main.js
```

### Inicialización (`vrm-direct-main.js`)

```
DOMContentLoaded → _tryAutoEnable()
  │
  ├── Si MMD_SA existe: espera MMD_SA.THREEX.scene → enable() tras 500ms
  │     Reusa scene, renderer y cámara de MMD
  │
  └── Si standalone: VRMDirectLoader.createOwnContext()
        Crea su propio WebGLRenderer(alpha, antialias),
        PerspectiveCamera(30°, pos: 0,1.3,3.5),
        Scene con DirectionalLight + AmbientLight

enable() →
  1. VRMDirectLoader.load(config) → handle {vrm, mesh, isVRM1, getBoneNode(), setExpression(), update()}
  2. VRMDirectAnimator.start(handle)
  3. Si hay MMD: oculta avatar MMD, offset 15 units derecha para comparar
```

### El solver — `vrm-direct-solver.js`

#### `getMMDBones()` — 2 niveles de prioridad

```
Prioridad 1: THREE.MMD.getModels()[0].mesh.bones_by_name
             → Quaterniones post-física, post-IK de jThree
             → Dato más fiel (incluye spring bones, physics)

Prioridad 2: System._browser.camera.poseNet.frames.skin
             → Quaterniones del SA IK solver
             → Usa _wrapFramesSkin() para interpolar entre frames:
               rot = slerp(prev.rot, cur.rot, ratio)
               ratio = clamp(t_delta / t_delta_frame, 0, 1)
```

#### `solveBody(isVRM1)` — Traduce MMD → VRM

```
getMMDBones() → { '左腕': Quaternion, '右ひじ': Quaternion, ... }
  │
  ▼ For each bone in BONE_MAP:
  │
  ├── BONE_MAP['左腕'] = 'leftUpperArm'
  ├── Clone quaternion
  ├── flipForMeshRotation(q): q.x *= -1; q.z *= -1
  │   (corrige la rotación 180° Y del mesh VRM)
  │
  ├── Hips especial: compose 5 huesos raíz
  │   全ての親 × センター × グルーブ × 腰 × 下半身
  │
  ├── Spine especial: inverse(下半身) × 上半身
  │
  ├── Arm twist: descompone 腕捩/手捩 en axis-angle
  │
  ├── Hips position: desde posición del センター, flip x/z
  │
  └── _poseFrames merge: para huesos que Fase 1 NO provee,
      usa los de Fase 2 (VRMDirectPoseSolver)

Output: { hips: Q, spine: Q, leftUpperArm: Q, ..., _hipsPosition: V3 }
```

**BONE_MAP** — 68+ mappings (MMD japonés → VRM humanoid):

| MMD | VRM | Grupo |
|-----|-----|-------|
| `全ての親` | — (special) | Root |
| `センター` | — (special) | Root |
| `上半身` | spine | Torso |
| `上半身2` | chest | Torso |
| `首` | neck | Head |
| `頭` | head | Head |
| `左腕` | leftUpperArm | Arms |
| `左ひじ` | leftLowerArm | Arms |
| `左手首` | leftHand | Arms |
| `左親指０` | leftThumbMetacarpal | Fingers |
| `左人指１` | leftIndexProximal | Fingers |
| ... | ... | ... |
| `左足` | leftUpperLeg | Legs |
| `左ひざ` | leftLowerLeg | Legs |
| `左足首` | leftFoot | Legs |

#### `solveMMDMorphExpressions()` — Cara → VRM expressions

Lee de `facemesh.frames.morph` con interpolación temporal:

```js
function getBS(name) {
  var m = frames.morph[name];
  var ratio = clamp(m[0].t_delta / m[0].t_delta_frame, 0, 1);
  return m[0].weight * ratio + m[1].weight * (1 - ratio);
}
```

| ARKit blendshape | Expresión VRM | Fórmula |
|------------------|---------------|---------|
| JawOpen | `aa` | directo |
| MouthStretchL+R | `ih` | promedio |
| MouthPucker | `ou` | directo |
| MouthSmileL+R | `ee` | promedio |
| MouthFunnel | `oh` | directo |
| EyeBlinkL/R | `blinkLeft/Right` | × (1 - smile × 0.25) |
| MouthSmileL+R | `happy` | × 0.7 |
| BrowDownL+R | `angry` | × 0.6, clamped |
| BrowInnerUp + MouthFrown | `sad` | × 0.5, clamped |
| EyeSquintL+R | `relaxed` | × 0.2 × (1 - angry) |

### El animator — `vrm-direct-animator.js`

#### `tick()` — ejecuta cada frame

```
tick()
  │
  ├── 1. Sync posición VRM con modelo MMD (si existe) + offsets de config
  │      Si no hay MMD → posición (0, 0, 0)
  │
  ├── 2. mesh.quaternion = (0, 1, 0, 0)  ← 180° Y para mirar a cámara
  │
  ├── 3. VRMDirectPoseSolver.update()
  │      → lee _latestLms de BroadcastChannel
  │      → computa quaterniones por hueso
  │      → escribe VRMDirectSolver._poseFrames
  │
  ├── 4. VRMDirectSolver.solveBody(isVRM1)
  │      → lee getMMDBones() o _poseFrames
  │      → BONE_MAP + flipForMeshRotation
  │      → output: { boneName: Quaternion, _hipsPosition: Vector3 }
  │
  ├── 5. applyBody(handle, boneData)
  │      → handle.resetPose()  (limpia rotaciones previas)
  │      → boneNode.quaternion.copy(targetQ) para cada hueso
  │      → aplica hips position offset
  │
  ├── 6. VRMCollision.update()  (si habilitado)
  │
  ├── 7. Solve faces (3 tracks, prioridad ascendente):
  │      Track 0: solveAutoAnim()      ← auto-blink, VMD morphs
  │      Track 1: solveMMDMorphExpressions() ← face tracking estándar
  │      Track 2: solveFace()          ← ARKit directo (custom VRMs)
  │      Fallback: solveMMDMorphFallback() si no hay ARKit
  │
  ├── 8. applyFace(handle, standard, arkit, autoAnim)
  │      → Merge tracks (mayor prioridad gana)
  │      → em.setValue(name, weight) en VRM expressionManager
  │
  ├── 9. handle.update(dt)
  │      → three-vrm: spring bones, physics, expressions, lookAt
  │
  └── 10. Si standalone: renderer.render(scene, camera)
```

#### Scheduling

| Modo | Mecanismo | Timing |
|------|-----------|--------|
| Con MMD | `System._browser.on_animation_update.add(tick, 0, 1, -1)` | Post-MMD render |
| Standalone | `requestAnimationFrame` loop propio | ~60fps |

---

## 8. Pose Solver Fase 2 — `vrm-direct-pose-solver.js`

Pipeline alternativo que convierte BlazePose crudo → quaterniones VRM **sin pasar por SA IK ni jThree**.

### Comunicación

```
PoseAT Worker                     Main Thread
     │                                │
     │  S.postMessageAT(JSON)  ──────►│ SA core handler Rt
     │                                │   └── computa frames.skin
     │                                │
     │  BroadcastChannel ────────────►│ vrm-direct-pose-solver.js
     │  'vrm_pose'                    │   └── computa _poseFrames
     │  { lms, scores }              │
```

**NOTA**: El publisher del BroadcastChannel se debe agregar en el worker o main thread para completar esta ruta.

### Coordenadas

```
BlazePose world-space:      VRM space (mesh rotado 180° Y):
  +X = derecha de la cámara   +X = derecha del sujeto
  +Y = arriba                  +Y = arriba
  +Z = hacia la cámara         +Z = hacia la espalda

Transformación: negar X y Z en cada landmark
  _lmToVec(lm) = Vector3(-lm.x, lm.y, -lm.z)
```

### Cómputo por hueso

| Hueso VRM | Landmarks usados | Método |
|-----------|------------------|--------|
| **hips** | L_HIP(23), R_HIP(24), L_SHOULDER(11), R_SHOULDER(12) | Frame ortonormal: right=hip_L→hip_R, up=hips→shoulders, fwd=right×up |
| **spine, chest** | Mismos landmarks | Frame de hombros (rotado vs hips) |
| **neck, head** | Omitido intencionalmente — es ruidoso, conflictúa con face tracking |
| **leftUpperArm** | L_SHOULDER(11), L_ELBOW(13) | setFromUnitVectors(T-pose(−1,0,0), shoulder→elbow) |
| **leftLowerArm** | L_ELBOW(13), L_WRIST(15) | Relativo al upper arm (espacio local) |
| **leftHand** | L_WRIST(15), L_PINKY(17), L_INDEX(19), L_THUMB(21) | Palm-plane geometry: fwd=wrist→knuckles, normal=fwd×thumb |
| **leftUpperLeg** | L_HIP(23), L_KNEE(25) | setFromUnitVectors(T-pose(0,−1,0), hip→knee) |
| **leftLowerLeg** | L_KNEE(25), L_ANKLE(27) | Relativo al upper leg |
| **leftFoot** | L_HEEL(29), L_FOOT(31) | setFromUnitVectors((0,0,1), heel→toe) |
| (Análogo para lado derecho) | | |

### OneEuroFilter por hueso

Cada hueso tiene su propio `OneEuroFilter` type=4 (quaternion mode):

| Grupo | freq | minCutOff | beta | dCutOff |
|-------|------|-----------|------|---------|
| Body (hips, spine, chest) | 30 | 1.5 | 0.3 | 1.0 |
| Arms (upper, lower, hand) | 30 | 1.0 | 0.7 | 1.0 |
| Legs (upper, lower, foot) | 30 | 1.5 | 0.3 | 1.0 |

### Hold-on-loss

Cuando un landmark está ocluido (`score < 0.35`), el hueso correspondiente NO se recalcula — se mantiene el último quaternión bueno (`_lastGoodFrames`). Previene snap a T-pose.

---

## 9. OneEuroFilter — `one_euro_filter.js`

Filtro adaptivo de baja latencia para datos ruidosos.

```
Constructor: OneEuroFilter(freq, minCutOff, beta, dCutOff, type)

type=0: escalar
type=3: vector 3D (filtra x,y,z independientemente)
type=4: quaternion (slerp-based low-pass)
```

- **minCutOff** bajo = más suave / más latencia
- **beta** alto = menos latencia en movimientos rápidos
- **dCutOff** = cutoff de la derivada

Se usa en tres niveles:
1. **En el worker** (mocap-pose-processor): filtro Z de landmarks, filtro de manos
2. **En SA core** (SA_system_emulation.min.js): filtro de quaterniones de huesos
3. **En Fase 2** (vrm-direct-pose-solver.js): filtro de quaterniones por hueso

---

## 10. Rendering final

### three-vrm runtime

`handle.update(dt)` → `_vrm.update(deltaTime)` ejecuta:
- **Spring bones**: física de pelo, ropa, accesorios (colliders)
- **Expression manager**: aplica pesos de blendshapes mezclados
- **LookAt**: dirección de mirada
- **Constraint solver**: IK constraints del VRM

### Paths de rendering

| Modo | Renderer | Cámara | Escena |
|------|----------|--------|--------|
| Con MMD | jThree/MMD_SA renderer | MMD_SA camera | `MMD_SA.THREEX.scene` |
| Standalone | `WebGLRenderer` propio (alpha, antialias) | `PerspectiveCamera(30°)` en (0, 1.3, 3.5) | `Scene` propia con dir+ambient light |

---

## Diagrama completo de flujo de datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMERA / VIDEO                           │
│  getUserMedia → <video> → canvas → RGBA pixels                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ postMessage({rgba, w, h, options})
                         │
         ┌───────────────┼────────────────────┐
         ▼               ▼                    ▼
  ┌─────────────┐ ┌──────────────┐    ┌──────────────┐
  │  PoseAT     │ │  HandsAT     │    │  FacemeshAT  │
  │  Worker     │ │  Sub-Worker  │    │  Worker      │
  │             │ │              │    │              │
  │ BlazePose   │ │ HandLandmark │    │ FaceLandmark │
  │ 33 puntos   │ │ 21 pts ×2   │    │ 478 pts      │
  │             │ │              │    │ 52 blendshaps│
  │ pose_adjust │ │ hands_adjust │    │ process_fm   │
  └──────┬──────┘ └──────┬───────┘    └──────┬───────┘
         │               │                    │
         │ JSON string   │                    │ JSON string
         └───────┬───────┘                    │
                 ▼                            ▼
  ┌──────────────────────────────────────────────────────────┐
  │          SA_system_emulation.min.js  (Main Thread)       │
  │                                                          │
  │  Handler Rt (pose):                                      │
  │    keypoints3D → SA IK → frames.skin[boneName]           │
  │    handpose → finger IK → frames.skin[finger bones]      │
  │                                                          │
  │  Handler v (face):                                       │
  │    faceLandmarks → head rotation → frames.skin[首, 頭]   │
  │    faceBlendshapes → frames.morph[ARKit names]           │
  │    MMD morphs → frames.morph[あ, い, まばたき]            │
  │                                                          │
  │  jThree render:                                          │
  │    frames.skin → MMD bones → physics → bones_by_name     │
  └──────┬───────────────────────────────────┬───────────────┘
         │                                   │
         │  frames.skin / bones_by_name      │  frames.morph
         ▼                                   ▼
  ┌──────────────────────────────────────────────────────────┐
  │              VRM Direct Pipeline                         │
  │                                                          │
  │  vrm-direct-solver.js                                    │
  │    getMMDBones():                                        │
  │      Prio 1: bones_by_name (jThree post-physics)        │
  │      Prio 2: frames.skin (SA IK)                        │
  │                                                          │
  │    solveBody():                                          │
  │      BONE_MAP: MMD japonés → VRM humanoid                │
  │      flipForMeshRotation: negar x,z del quaternion       │
  │      Hips: compose 5 root bones                          │
  │      Arm twist: descomposición axis-angle                │
  │      + merge _poseFrames de Fase 2                       │
  │                                                          │
  │    solveMMDMorphExpressions():                           │
  │      ARKit → VRM expressions (aa, ih, blink, happy...)   │
  │                                                          │
  │  vrm-direct-pose-solver.js  (Fase 2 — alternativa)      │
  │    BroadcastChannel 'vrm_pose' ← keypoints3D_raw        │
  │    BlazePose → quaterniones VRM directamente             │
  │    Sin jThree / SA core                                  │
  │                                                          │
  │  vrm-direct-animator.js                                  │
  │    tick():                                               │
  │      1. PoseSolver.update() → _poseFrames               │
  │      2. solveBody() → { bone: Quaternion }               │
  │      3. applyBody() → boneNode.quaternion.copy()         │
  │      4. solveAutoAnim/solveFace/solveMorphs              │
  │      5. applyFace() → expressionManager.setValue()       │
  │      6. vrm.update(dt) → spring bones, physics          │
  │      7. renderer.render() (si standalone)                │
  └──────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────┐
  │  <canvas>    │
  │  WebGL       │
  │  VRM avatar  │
  │  animado     │
  └──────────────┘
```

---

## Canales de comunicación

| Mecanismo | De → A | Datos |
|-----------|--------|-------|
| `Worker.postMessage` | Main → PoseAT | RGBA frames |
| `Worker.postMessage` | PoseAT → HandsAT | RGBA + pose data |
| `S.postMessageAT` (`self.postMessage`) | Workers → Main | JSON results |
| `frames.skin[boneName]` | SA IK → VRMDirectSolver | Quaterniones de huesos |
| `frames.morph[name]` | SA face → VRMDirectSolver | Blendshapes interpolados |
| `bones_by_name[boneName]` | jThree → VRMDirectSolver | Estado final post-física |
| `BroadcastChannel('vrm_pose')` | Worker/Main → PoseSolver | Landmarks crudos |
| `VRMDirectSolver._poseFrames` | PoseSolver → Solver | Quaterniones Fase 2 |
| `System._browser.on_animation_update` | SA scheduler | Registro de tick (prioridad 0/1) |
| `window.VRMDirectModelStub` | Loader → XR_Ropes | Ref de mesh para ropes |
