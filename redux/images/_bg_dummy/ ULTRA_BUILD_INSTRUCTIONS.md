

Plan: ULTRA — Extracción limpia MediaPipe Holistic + VRM
TL;DR: Crear una carpeta /ULTRA con una aplicación standalone que ejecute MediaPipe Holistic tracking (cuerpo, manos, cara con blendshapes + emociones), suavizado OneEuroFilter, conversión tracking→bone rotations (FK + IK), visualización en VRM (AliciaSolid) con spring bones, rope physics (Verlet), y salida VMC/OSC. Todo usando solo THREE.js moderno (sin jThree, sin MMD.js legacy). El archivo SA_system_emulation.min.js es el corazón del problema: es un monolito minificado de ~300KB en una sola línea que contiene el bridge tracking→bones mezclado con miles de líneas de UI/sistema que no se necesitan. La estrategia es: copiar archivos modulares que ya están limpios + reescribir el bridge como módulos nuevos.

Steps

Fase 1: Estructura base y archivos copiables directamente
Crear carpeta ULTRA/ con subcarpetas: js/, js/tracking/, js/mmd/, js/@mediapipe/, three.js/, three.js/loaders/, three.js/model/, css/

Copiar archivos de tracking que ya son modulares y limpios (no requieren modificación):

js/tracking/one_euro_filter.js — filtro de suavizado
js/tracking/mocap-constants.js — nombres keypoints BlazePose
js/tracking/mocap-mediapipe-bridge.js — carga modelos MediaPipe
js/tracking/mocap-video-processor.js — loop por frame
js/tracking/mocap-pose-processor.js — normalización pose
js/tracking/mocap-hands-processor.js — procesamiento manos
js/tracking/facemesh-core.js — init face mesh
js/tracking/facemesh-processor.js — procesamiento caras
js/tracking/facemesh-emotions.js — detección emociones
js/tracking/facemesh-draw.js — visualización wireframe cara (revisar si necesario)
js/tracking/pose_worker.js + pose_lib.js — worker pose
js/tracking/hands_worker.js + hands_lib.js — worker manos
js/tracking/facemesh_worker.js — worker cara
Copiar orquestadores de tracking (requieren revisión menor para quitar dependencias innecesarias):

js/mocap_lib_module.js — orquestador pose/manos
js/facemesh_lib.js — orquestador face mesh
js/facemesh_triangulation.json — datos triangulación cara
Copiar assets THREE.js y MediaPipe (sin modificación):

three.js/three.module.min.js — THREE.js core
three.js/three-vrm.module.min.js — @pixiv/three-vrm
three.js/three-vrm-animation.module.js
three.js/loaders/GLTFLoader.js — loader GLTF/VRM
three.js/Geometry.js — backwards compat
three.js/model/AliciaSolid.zip — modelo VRM
Carpeta completa js/@mediapipe/tasks/ — modelos ML y WASM runtime
Fase 2: Nuevo archivo — ULTRA/js/ultra-vrm-loader.js
Crear módulo limpio de carga VRM que reemplace js/mmd/threex-vrm.js + js/mmd/threex-gui.js. Debe contener:
Importación de THREE.js, GLTFLoader, three-vrm como ES modules
Registro de VRMLoaderPlugin en GLTFLoader
Función loadVRM(url) → retorna { vrm, scene, boneMap }
Mapa de bones MMD→VRM (extraído de threex-vrm.js:893-954)
Función updateVRM(vrm, boneRotations, blendshapes, delta) que aplique rotaciones a bones VRM, expressions/blendshapes, y llame vrm.update(delta) para spring bones
La lógica de process_rotation() para negar x,z en quaterniones (compat VRM0/VRM1)
El mapeo de expressions MMD→VRM (あ→aa, まばたき→blink, etc.) de threex-vrm.js:500-610
Aplicación de ARKit blendshapes directos cuando el modelo los soporta, de threex-vrm.js:610-686
Lógica de lookAt de threex-vrm.js:686
Reset de spring bones y control de stiffness de threex-vrm.js:197-300
Fase 3: Nuevo archivo — ULTRA/js/ultra-tracking-bridge.js
Crear el módulo más crítico y difícil: el bridge tracking→bones. Este reemplaza la funcionalidad relevante de SA_system_emulation.min.js. Extraer/reescribir:

Objeto _t (bone manager): sistema add("skin", boneName, {rot, pos}) + double-buffer por frame
Camera init (Ye): getUserMedia(), setup video element, canvas para captura, flip/mirror
Pose worker spawn: creación del Worker con params, onmessage handler (Rt)
Facemesh worker spawn: creación y manejo de mensajes (v handler)
Hands integration: coordinator entre pose worker y hands worker
Pose→Bone rotation pipeline:
Hombros: vector shoulder-to-shoulder → quaternion cuerpo
Upper body: shoulder-center a hip-center → rotación con OneEuroFilter
Brazos FK: keypoints → setFromBasis matrix → rotación
Brazos IK: keypoints → posición target 腕ＩＫ
Piernas IK: posición desde estimación hip + grounding
Head/neck: facemesh OR pose keypoints → quaternion split cuello+cabeza
Dedos: handpose → rotaciones por joint (5 dedos × 3-4 joints)
Measurement function (B()): medición de proporciones del modelo (largo brazo, ancho hombros, piernas, spine)
OneEuroFilter usage: filtros en main thread para head, chest, arms, hip
Facemesh morphs: blendshapes → morph targets (blink, mouth, etc.)
IMPORTANTE: SA_system_emulation.min.js está minificado en 1 línea. Se debe leer cuidadosamente buscando las funciones por sus patrones (_t.add, Rt=function, Et=function, ze=function, ee=function, Ne=function, B=function, Ye.start). Cada función debe ser extraída, deobfuscada, y reescrita como código limpio.

Fase 4: IK Solver limpio — ULTRA/js/ultra-ik-solver.js
Crear un solver IK simple (CCD o FABRIK) que reemplace la dependencia de CCDIKSolver.js de MMD. Solo necesita resolver cadenas de 2-3 joints (shoulder→elbow→wrist para brazos, hip→knee→ankle para piernas). Extraer la lógica IK relevante de CCDIKSolver simplificada sin dependencias MMD.
Fase 5: Rope system — ULTRA/js/ultra-ropes.js
Extraer el sistema de Ropes de animate.js:15323-16389. Adaptar:
Reemplazar get_THREE() → import directo de THREE
Reemplazar get_scene() → recibir scene como parámetro
Reemplazar get_camera() → recibir camera como parámetro
Reemplazar get_modelX() → recibir { mesh, model_scale } directamente
Eliminar THREE.MMD.getModels() guard → usar flag propio de readiness
Eliminar UI panel (ensure_ui()) — o simplificar a mínimo
Mantener: Verlet integration, distance constraints, root tension, mesh collision, turbulence, billboard rendering, floor collision
Fase 6: VMC Output — ULTRA/js/ultra-vmc.js
Extraer/adaptar VMC sender de js/mmd/osc.js + threex-vrm.js:696-870:
OSC transport via osc-js (DatagramPlugin UDP)
Envío de /VMC/Ext/Bone/Pos para todos los huesos
Envío de /VMC/Ext/Blend/Val para blendshapes/expressions
Envío de /VMC/Ext/Root/Pos para posición root
Envío de /VMC/Ext/Cam para cámara
Envío de /VMC/Ext/OK heartbeat
Soporte de app modes (VSeeFace, Warudo, VNyan)
Copiar también la dependencia osc-js desde node_modules si existe, o incluir como script
Fase 7: Entry point — ULTRA/index.html + ULTRA/js/ultra-main.js
Crear index.html mínimo:

<video> element para webcam (hidden)
<canvas> para render THREE.js
Imports de ES modules
Sin menú, sin controles extras — solo el render 3D
Crear ultra-main.js como orquestador principal:

Init THREE.js scene, camera, renderer, lights
Llamar loadVRM('three.js/model/AliciaSolid.zip#/AliciaSolid.vrm')
Init camera (getUserMedia)
Spawn tracking workers (pose, facemesh, hands)
Render loop: recibir tracking → bridge → updateVRM → ropes.update → VMC send → renderer.render
Manejo de resize
Fase 8: CSS mínimo
Crear ULTRA/css/ultra.css — solo estilos para canvas fullscreen y video element oculto
Verificación

Abrir ULTRA/index.html en navegador (requiere servidor local por CORS de workers y ES modules)
Verificar que la cámara se activa y MediaPipe carga los modelos
Verificar que AliciaSolid.vrm aparece y sigue el tracking del cuerpo
Verificar suavizado (movimientos fluidos sin jitter)
Verificar blendshapes faciales (blink, mouth, etc.)
Verificar spring bones (pelo/ropa reacciona al movimiento)
Verificar ropes (partículas Verlet visibles sobre el modelo)
Verificar VMC output (conectar VSeeFace y ver si recibe datos)
Verificar emociones (console.log de la detección de emociones)
Decisiones

FK + IK ambos: Se incluye FK como path principal desde keypoints, e IK como CCD solver simplificado para brazos/piernas (sin dependencia MMDAnimationHelper)
Sin jThree: El pipeline usa bones MMD como representación intermedia (nombres japoneses) pero se mapea directamente a VRM sin pasar por la capa jThree
Sin MMD.js legacy: MMD_SA.js se elimina — su funcionalidad relevante (VRM load, bone map, expressions) se reescribe limpio en ultra-vrm-loader.js
SA_system_emulation.min.js: No se copia — se reescribe como ultra-tracking-bridge.js extrayendo solo las funciones de tracking→bones
Archivos resultantes en ULTRA/
A continuación te presento el contenido del archivo ULTRA_BUILD_INSTRUCTIONS.md que deberías crear. Estas instrucciones están diseñadas para que distintos chats puedan ir implementando fase por fase sin romper nada, respetando el límite de ventana de contexto:










# ULTRA — Instrucciones de Implementación Paso a Paso

## Objetivo
Extraer de `redux/` una aplicación standalone limpia que ejecute:
- **MediaPipe Holistic tracking** (cuerpo, manos, cara) con suavizado OneEuroFilter
- **Análisis de face features** (blendshapes ARKit, eye tracking, emociones)
- **Visualización VRM** (AliciaSolid) con spring bones
- **Rope physics** (Verlet) sobre el modelo VRM
- **VMC/OSC output** a apps externas

**Sin**: jThree, MMD.js legacy, menús, UI extras, System Gadget emulation.
**Solo**: THREE.js moderno + @pixiv/three-vrm.

---

## Arquitectura

```
Camera → Workers(MediaPipe) → ultra-tracking-bridge → ultra-vrm-loader → THREE.js render
                                      ↓                       ↓
                                  ultra-vmc.js          ultra-ropes.js
```

El tracking corre en Web Workers. Los resultados se envían al main thread donde `ultra-tracking-bridge.js` convierte landmarks a rotaciones de bones (usando nombres MMD como representación intermedia). `ultra-vrm-loader.js` mapea esos nombres MMD a bones VRM y actualiza el modelo. `ultra-ropes.js` añade ropes Verlet sobre el mesh. `ultra-vmc.js` envía los datos via OSC/UDP.

---

## Reglas Generales para Cada Chat/Sesión

1. **Una fase por sesión** — no intentar hacer todo de golpe
2. **Verificar que compila/corre** al final de cada fase antes de avanzar
3. **No modificar archivos COPIADOS** de tracking/ a menos que sea necesario para quitar dependencias externas
4. **Los archivos NUEVOS** (ultra-*.js) son ES modules con `import`/`export`
5. **Los archivos de tracking/** son scripts clásicos (no modules) porque corren en Web Workers via `importScripts()`
6. **Siempre leer los archivos fuente de redux/** antes de extraer código — no asumir

---

## FASE 1: Estructura y archivos copiados sin modificación
**Estimación**: Chat corto, solo copias

### Paso 1.1 — Crear estructura de carpetas
```
mkdir -p ULTRA/{css,js/tracking,js/@mediapipe,three.js/loaders,three.js/model}
```

### Paso 1.2 — Copiar THREE.js y assets (sin modificación)
```
cp redux/three.js/three.module.min.js ULTRA/three.js/
cp redux/three.js/three-vrm.module.min.js ULTRA/three.js/
cp redux/three.js/three-vrm-animation.module.js ULTRA/three.js/
cp redux/three.js/Geometry.js ULTRA/three.js/
cp redux/three.js/loaders/GLTFLoader.js ULTRA/three.js/loaders/
cp redux/three.js/model/AliciaSolid.zip ULTRA/three.js/model/
```

### Paso 1.3 — Copiar MediaPipe assets (sin modificación, carpeta completa)
```
cp -r redux/js/@mediapipe ULTRA/js/@mediapipe
```

### Paso 1.4 — Copiar archivos de tracking (sin modificación)
```
cp redux/js/tracking/one_euro_filter.js ULTRA/js/tracking/
cp redux/js/tracking/mocap-constants.js ULTRA/js/tracking/
cp redux/js/tracking/mocap-mediapipe-bridge.js ULTRA/js/tracking/
cp redux/js/tracking/mocap-video-processor.js ULTRA/js/tracking/
cp redux/js/tracking/mocap-pose-processor.js ULTRA/js/tracking/
cp redux/js/tracking/mocap-hands-processor.js ULTRA/js/tracking/
cp redux/js/tracking/facemesh-core.js ULTRA/js/tracking/
cp redux/js/tracking/facemesh-processor.js ULTRA/js/tracking/
cp redux/js/tracking/facemesh-emotions.js ULTRA/js/tracking/
cp redux/js/tracking/facemesh-draw.js ULTRA/js/tracking/
cp redux/js/tracking/pose_worker.js ULTRA/js/tracking/
cp redux/js/tracking/pose_lib.js ULTRA/js/tracking/
cp redux/js/tracking/hands_worker.js ULTRA/js/tracking/
cp redux/js/tracking/hands_lib.js ULTRA/js/tracking/
cp redux/js/tracking/facemesh_worker.js ULTRA/js/tracking/
```

### Paso 1.5 — Copiar orquestadores de tracking
```
cp redux/js/mocap_lib_module.js ULTRA/js/
cp redux/js/facemesh_lib.js ULTRA/js/
cp redux/js/facemesh_triangulation.json ULTRA/js/
cp redux/js/module-loader.js ULTRA/js/
```

### Paso 1.6 — Verificación Fase 1
- Verificar que todos los archivos existen con `find ULTRA/ -type f | wc -l`
- Los archivos de tracking NO deben ser modificados aún
- Verificar que `AliciaSolid.zip` se copió correctamente (debe ser ~5-10MB)

---

## FASE 2: index.html + CSS + THREE.js Scene básica
**Estimación**: Chat corto

### Paso 2.1 — Crear `ULTRA/css/ultra.css`
Estilos mínimos:
- `body`: margin 0, overflow hidden, background black
- `#canvas3d`: width/height 100vw/100vh, display block
- `#video`: display none (hidden webcam)
- `#overlay`: posición absoluta para debug info (fps, estado)

### Paso 2.2 — Crear `ULTRA/index.html`
HTML mínimo:
- DOCTYPE html5
- Link a `css/ultra.css`
- `<video id="video" playsinline autoplay muted></video>` (hidden)
- `<canvas id="canvas3d"></canvas>`
- `<div id="overlay"></div>` (opcional, para FPS)
- `<script type="module" src="js/ultra-main.js"></script>`
- NO incluir ningún menú, barra lateral, settings panel

### Paso 2.3 — Crear esqueleto de `ULTRA/js/ultra-main.js`
ES module inicial que:
1. Importa THREE.js desde `'../three.js/three.module.min.js'`
2. Crea `WebGLRenderer` con el canvas `#canvas3d`, antialias, alpha
3. Crea `PerspectiveCamera` (FOV ~30, near 0.1, far 100)
4. Crea `Scene` con background color o transparent
5. Añade luces: `DirectionalLight` + `AmbientLight` (o `HemisphereLight`)
6. Render loop con `requestAnimationFrame`
7. Window resize handler
8. Camera posición inicial mirando al modelo (pos: 0, 1.3, 3)

### Paso 2.4 — Verificación Fase 2
- Abrir `ULTRA/index.html` con servidor local (`npx serve ULTRA` o `python -m http.server`)
- Debe mostrar canvas negro/vacío sin errores en consola
- Verificar que THREE.js se importa correctamente

---

## FASE 3: Carga de VRM — `ultra-vrm-loader.js`
**Estimación**: Chat medio

### Contexto necesario
Leer estos archivos de redux/ antes de escribir:
- `redux/js/mmd/threex-vrm.js` — líneas 1-30 (imports), 25-28 (VRMLoaderPlugin), 68-170 (VRM_object constructor), 893-954 (bone map), 500-686 (expressions/blendshapes)
- `redux/js/mmd/threex-gui.js` — líneas 200-250 (script imports, SpringBone center fix)
- `redux/three.js/loaders/GLTFLoader.js` — verificar que es ES module o classic

### Paso 3.1 — Crear `ULTRA/js/ultra-vrm-loader.js`
ES module que exporta:

```
export async function loadVRM(url, scene, THREE_module)
export function updateVRM(vrmData, boneRotations, expressions, delta)
export const BONE_MAP_MMD_TO_VRM = { ... }
```

Implementar:
1. **`loadVRM(url, scene)`**:
   - Importar GLTFLoader dinámicamente
   - Importar three-vrm (`VRMLoaderPlugin`, `VRMUtils`, `VRM`)
   - Crear `GLTFLoader`, registrar `VRMLoaderPlugin`
   - Manejar archivos `.zip` (si AliciaSolid está en zip, necesitar JSZip o descomprimirlo previamente — **verificar si GLTFLoader de redux ya maneja zip**)
   - On load: `VRMUtils.removeUnnecessaryVertices()`, `VRMUtils.combineSkeletons()` 
   - Retornar `{ vrm, scene: gltf.scene, boneMap, jointSettings }`
   - Almacenar default spring bone joint settings para reset

2. **`updateVRM(vrmData, boneRotations, expressions, delta)`**:
   - Reset pose: `vrm.humanoid.resetNormalizedPose()`
   - Para cada entry en `boneRotations`: obtener bone VRM via `BONE_MAP_MMD_TO_VRM`, aplicar quaternion con `process_rotation()` (negar x,z para compatibilidad)
   - Aplicar expressions/blendshapes (MMD→VRM mapping)
   - Aplicar ARKit blendshapes directos si el modelo los soporta
   - Look at: si hay datos de ojos → `vrm.lookAt`
   - `vrm.update(delta)` — actualiza spring bones

3. **`BONE_MAP_MMD_TO_VRM`**: Diccionario extraído de `threex-vrm.js:893-954`:
   - `"センター" → "hips"`, `"上半身" → "spine"`, `"首" → "neck"`, `"頭" → "head"`, etc.
   - Incluir todos los bones de dedos

4. **`resetSpringBones(vrm, stiffnessPercent)`**: Reset spring bones con stiffness configurable

### Paso 3.2 — Problema del ZIP
El modelo `AliciaSolid.zip` requiere descompresión. Opciones:
- **Opción A**: Descomprimir el zip y poner `AliciaSolid.vrm` directamente en `three.js/model/`. Eliminar dependencia de JSZip.
- **Opción B**: Copiar `redux/js/jszip.js` y el handler de zip del loader.

**Recomendación**: Opción A — descomprimir el zip previamente. Más limpio.

### Paso 3.3 — Integrar en ultra-main.js
- Importar `loadVRM` 
- Después de crear scene: `const vrmData = await loadVRM('three.js/model/AliciaSolid.vrm', scene)`
- En render loop: `updateVRM(vrmData, currentBoneRotations, currentExpressions, delta)`

### Paso 3.4 — Verificación Fase 3
- El modelo AliciaSolid debe aparecer en el canvas en T-pose
- Spring bones deben reaccionar (pelo se mueve si rotás la cámara)
- Sin errores en consola

---

## FASE 4: Camera + Tracking Workers
**Estimación**: Chat medio-largo

### Contexto necesario
Leer de redux/:
- `redux/js/SA_system_emulation.min.js` — buscar patrones: `getUserMedia`, `new Worker("js/tracking/pose_worker`, `new Worker("js/tracking/facemesh_worker`, `Ye.start`, `Ye={`
- `redux/js/tracking/pose_worker.js` y `pose_lib.js` — entender los URL params que esperan
- `redux/js/tracking/facemesh_worker.js` — entender params
- `redux/js/mocap_lib_module.js` — primeras 100 líneas para entender init

### Paso 4.1 — Crear módulo de cámara en `ultra-main.js` o separado
Función `initCamera()`:
- `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })`
- Asignar stream a `<video>` element
- Esperar `video.onloadedmetadata` → `video.play()`
- Retornar video element

### Paso 4.2 — Spawn Pose Worker
```js
const poseWorker = new Worker('js/tracking/pose_worker.js?use_mediapipe=1&use_blazepose=1');
```
- Configurar `onmessage` handler que reciba datos de tracking
- En cada frame: capturar video frame como `ImageBitmap` via `createImageBitmap(video)`
- Enviar al worker: `poseWorker.postMessage({ image, options... }, [image])`

**IMPORTANTE**: Los workers de tracking usan `importScripts()` con paths relativos. Verificar que los paths funcionan desde `ULTRA/js/tracking/`. Los archivos de tracking importan:
- `pose_worker.js` → `importScripts('pose_lib.js')`
- `pose_lib.js` → `import('../mocap_lib_module.js')` (dynamic import)
- `mocap_lib_module.js` → importa sub-módulos de `tracking/`

Puede ser necesario ajustar path de `module-loader.js` si los workers lo usan.

### Paso 4.3 — Spawn Facemesh Worker
```js
const faceWorker = new Worker('js/tracking/facemesh_worker.js?use_mediapipe_facemesh=1&use_face_landmarks=1');
```
- `onmessage` handler para datos de cara
- Enviar frames de video (o región recortada de cara)

### Paso 4.4 — Verificar workers
- Los workers deben cargar sin errores (check console)
- MediaPipe models deben descargarse/cargarse (face_landmarker.task, pose_landmarker_full.task, etc.)
- Verificar que `onmessage` recibe datos (log temporal)

### Paso 4.5 — Verificación Fase 4
- Cámara se activa (LED de webcam encendida)
- Workers cargan sin errores
- Console muestra datos de tracking recibidos (landmarks de pose, cara, manos)
- El modelo VRM sigue en T-pose (aún no conectado)

---

## FASE 5: Tracking Bridge — `ultra-tracking-bridge.js`
**Estimación**: Chat largo (FASE MÁS COMPLEJA)

### Contexto necesario
Este es el paso más difícil. `SA_system_emulation.min.js` es un archivo minificado de ~300KB en una sola línea. Contiene la lógica de conversión de landmarks a rotaciones de bones mezclada con miles de líneas de código que NO se necesitan.

**Estrategia de extracción**: 
1. Buscar en SA_system_emulation.min.js los patrones clave
2. Extraer funciones por sus signatures
3. Reescribir como código limpio con nombres descriptivos

### Funciones a extraer de SA_system_emulation.min.js

| Función minificada | Propósito | Buscar patrón |
|---|---|---|
| `Rt` | Pose worker onmessage handler | `Rt=function` o `U.onmessage=Rt` |
| `Et` | Head/neck rotation processor | `Et=function` near `首` or `頭` |
| `ze` | Generic bone rotation applier | `ze=function` near `_t.add` |
| `ee` | Center bone (hip) position | `ee=function` near `センター` |
| `Ne` | Hip position estimator | `Ne=function` near `hip` |
| `B` | Model bone measurement init | `B=function` near `shoulder_width` or `arm_length` |
| `Pt` | Lean/tilt from facemesh | `Pt=function` near `lean` or `tilt` |
| finger processing | Finger bone rotations | Buscar `親指` or `人指` nearby `handpose` |
| `data_filter` / OneEuroFilter | Main thread smoothing | Buscar `new.*OneEuroFilter` or `data_filter` |

### Paso 5.1 — Crear estructura base de `ultra-tracking-bridge.js`
```js
export class TrackingBridge {
  constructor(vrmData) { ... }
  
  // Bone rotation buffer
  _boneRotations = {};
  _bonePositions = {};
  
  // OneEuroFilters for smoothing
  _filters = {};
  
  // Model measurements
  _measurements = {};
  
  // Process pose tracking result
  processPoseResult(data) { ... }
  
  // Process facemesh result  
  processFacemeshResult(data) { ... }
  
  // Process hand tracking result
  processHandResult(data) { ... }
  
  // Initialize model measurements
  measureModel(vrm) { ... }
  
  // Get current bone rotations for VRM update
  getBoneRotations() { ... }
  getExpressions() { ... }
}
```

### Paso 5.2 — Implementar `processPoseResult(data)`
Extraer de `Rt` handler en SA_system_emulation.min.js:

1. **Recibir** `data.posenet` (array de 33 keypoints con x,y,z,score)
2. **Hombros**: calcular vector desde `left_shoulder` a `right_shoulder`, cross product con up → quaternion de rotación del torso
3. **Upper body**: vector desde mid-hip a mid-shoulder → rotación upper body. Aplicar OneEuroFilter (freq=30, minCutOff=0.25, beta=0.5)
4. **Brazos**: Para cada lado (left/right):
   - Path IK: posición wrist como target → almacenar en `_bonePositions["左腕ＩＫ"]`
   - Path FK: construir basis matrix desde shoulder→elbow→wrist vectors → `Quaternion.setFromRotationMatrix()`
5. **Piernas**: posición hip estimada → `_bonePositions["左足ＩＫ"]`

### Paso 5.3 — Implementar `processFacemeshResult(data)`
Extraer del handler `v` en SA_system_emulation.min.js:

1. **Head rotation**: quaternion de rotación de cabeza desde facemesh
2. **Split neck/head**: dividir rotación total entre neck y head bones
3. **Eye tracking**: datos de gaze → bone `左目`/`右目`
4. **Blendshapes**: lista de ARKit blendshapes → `_expressions`
5. **Blink detection**: de blendshapes `eyeBlinkLeft`/`eyeBlinkRight`
6. **Emociones**: si facemesh-emotions.js envía datos → almacenar

### Paso 5.4 — Implementar `processHandResult(data)`
Extraer de processing de `handpose` en SA_system_emulation.min.js:

1. **Para cada mano** (Left/Right):
2. **Wrist rotation**: quaternion de muñeca
3. **Finger rotations**: Para cada dedo (thumb, index, middle, ring, pinky):
   - 3-4 joints por dedo
   - Calcular ángulo de flexión desde landmarks
   - Nombres: `左親指０`→`左親指２`, `左人指１`→`左人指３`, etc.
4. **Smoothing**: OneEuroFilter por joint

### Paso 5.5 — Implementar `measureModel(vrm)`
Extraer de función `B` en SA_system_emulation.min.js:
- Calcular distancias entre bones del VRM:
  - `shoulder_width`: distancia left_shoulder → right_shoulder
  - `arm_length`: shoulder → elbow + elbow → wrist
  - `leg_length`: hip → knee + knee → ankle
  - `spine_length`: hips → head
- Almacenar para escalar posiciones de tracking

### Paso 5.6 — Integrar bridge en ultra-main.js
```js
const bridge = new TrackingBridge(vrmData);

poseWorker.onmessage = (e) => bridge.processPoseResult(e.data);
faceWorker.onmessage = (e) => bridge.processFacemeshResult(e.data);

// En render loop:
updateVRM(vrmData, bridge.getBoneRotations(), bridge.getExpressions(), delta);
```

### Paso 5.7 — Verificación Fase 5
- El modelo VRM debe seguir el movimiento del cuerpo
- Movimientos deben ser suaves (OneEuroFilter funcionando)
- Dedos deben moverse con las manos
- Cara debe parpadear y mover boca
- Head tracking debe funcionar (cabeza sigue la cara)

---

## FASE 6: IK Solver — `ultra-ik-solver.js`
**Estimación**: Chat corto-medio

### Contexto necesario
Leer `redux/three.js/animation/CCDIKSolver.js` para entender la implementación CCD IK.

### Paso 6.1 — Implementar CCD IK simplificado
Solo necesita resolver cadenas cortas:
- **Brazo**: shoulder → elbow → wrist (3 joints, target = hand position)
- **Pierna**: hip → knee → ankle (3 joints, target = foot position)

```js
export class SimpleIKSolver {
  solve(chain, target, iterations = 10) { ... }
}
```

El algoritmo CCD (Cyclic Coordinate Descent):
1. Para cada iteración:
2. Desde el último joint hasta el primero:
3. Calcular vector joint→end_effector y joint→target
4. Calcular rotación que alinea end_effector con target
5. Aplicar rotación al joint (con clamp de ángulo máximo)
6. Repetir

### Paso 6.2 — Integrar IK en tracking bridge
- Si IK está habilitado: usar `SimpleIKSolver.solve()` para brazos/piernas
- Si FK: usar rotaciones directas desde keypoints
- Permitir toggle FK/IK runtime

### Paso 6.3 — Verificación Fase 6
- Brazos siguen la posición de las manos de forma natural
- Piernas se posicionan correctamente
- Comparar calidad FK vs IK

---

## FASE 7: Rope Physics — `ultra-ropes.js`
**Estimación**: Chat medio

### Contexto necesario
Leer `redux/images/XR Animator/animate.js` líneas 15323-16389 (el IIFE de XR_Ropes).

### Paso 7.1 — Extraer XR_Ropes como módulo ES
1. Copiar el IIFE completo (líneas 15323-16389)
2. Convertir a ES module con `export`
3. Reemplazar dependencias:
   - `get_THREE()` → recibir THREE como parámetro de `init()`
   - `get_scene()` → recibir scene como parámetro
   - `get_camera()` → recibir camera como parámetro
   - `get_modelX()` → recibir `{ mesh, model_scale }` como parámetro
   - `THREE.MMD.getModels()?.length` → flag `isModelReady`
4. Eliminar o simplificar `ensure_ui()` (el panel de control CSS) — dejar config como objeto JS
5. Eliminar event listeners de `jThree_ready`, `MMDStarted`, `SA_MMD_before_render`

### Paso 7.2 — API del módulo
```js
export function init(THREE, scene, camera) { ... }
export function setModel(modelData) { ... }  // { mesh, model_scale }
export function update(delta) { ... }  // llamar cada frame
export function setConfig(config) { ... }  // count, gravity, damping, etc.
```

### Paso 7.3 — Integrar en ultra-main.js
```js
import * as Ropes from './ultra-ropes.js';
Ropes.init(THREE, scene, camera);
// Después de cargar VRM:
Ropes.setModel({ mesh: vrm.scene, model_scale: 1 });
// En render loop:
Ropes.update(delta);
```

### Paso 7.4 — Verificación Fase 7
- Ropes visibles sobre el modelo (hilos/pelo Verlet)
- Reaccionan a gravedad y movimiento
- Collision con mesh funciona
- Floor collision funciona

---

## FASE 8: VMC Output — `ultra-vmc.js`
**Estimación**: Chat corto-medio

### Contexto necesario
Leer:
- `redux/js/mmd/osc.js` — clase VMC, transport init
- `redux/js/mmd/threex-vrm.js` líneas 696-870 — construcción de mensajes OSC

### Paso 8.1 — Dependencia osc-js
Verificar si `osc-js` está en `node_modules` o como archivo standalone. Si no:
- Instalar `npm install osc-js` en ULTRA/
- O copiar el bundle desde redux si existe

**NOTA**: VMC usa UDP via `DatagramPlugin`. Esto solo funciona en Electron/Node.js, NO en un browser puro. Si ULTRA va a correr en browser, el VMC output NO funcionará a menos que se use WebSocket transport. Documentar esta limitación.

### Paso 8.2 — Crear `ultra-vmc.js`
```js
export class VMCSender {
  constructor(options = { port: 39539 }) { ... }
  
  start() { ... }  // Init OSC transport
  stop() { ... }
  
  // Send bone data
  sendBones(boneRotations) { ... }
  
  // Send blendshapes
  sendExpressions(expressions) { ... }
  
  // Send root position
  sendRoot(position, rotation) { ... }
  
  // Send camera
  sendCamera(camera) { ... }
  
  // Heartbeat
  sendOK() { ... }
  
  // Full update (llamar cada frame)  
  update(vrmData, boneRotations, expressions, camera) { ... }
}
```

### Paso 8.3 — Mensajes OSC
Extraer de `threex-vrm.js`:
- `/VMC/Ext/Root/Pos` → `"root", x, y, z, qx, qy, qz, qw`
- `/VMC/Ext/Bone/Pos` → por cada bone: `name, x, y, z, qx, qy, qz, qw`
- `/VMC/Ext/Blend/Val` → por cada expression: `name, weight`
- `/VMC/Ext/Blend/Apply` → señal de batch completo
- `/VMC/Ext/Cam` → `"Camera", x, y, z, qx, qy, qz, qw, fov`
- `/VMC/Ext/OK` → `1`

### Paso 8.4 — App modes
Soportar ajustes de coordenadas para:
- VSeeFace
- Warudo  
- VNyan

### Paso 8.5 — Verificación Fase 8
- (Solo en Electron) Conectar VSeeFace y verificar que recibe datos
- Console muestra mensajes OSC siendo enviados
- Bones y expressions se transmiten correctamente

---

## FASE 9: Integración Final y Pulido
**Estimación**: Chat medio

### Paso 9.1 — Conectar todo en ultra-main.js
Verificar el flujo completo:
1. `initCamera()` → video element
2. `loadVRM()` → modelo en scene
3. Spawn workers → tracking activo
4. Bridge recibe tracking → convierte a bones
5. `updateVRM()` → modelo se mueve
6. `Ropes.update()` → ropes siguen al modelo
7. `vmc.update()` → datos salen por OSC
8. `renderer.render()` → frame visible

### Paso 9.2 — Performance
- Verificar FPS (target: 30+ fps)
- Si lento: reducir resolución de cámara, reducir ropes count
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`

### Paso 9.3 — Error handling
- Cámara denegada → mostrar mensaje
- Workers fallan → fallback a main thread
- VRM no carga → mostrar error
- MediaPipe models no cargan → mostrar progreso

### Paso 9.4 — Verificación Final
- [ ] Cámara se activa
- [ ] MediaPipe carga modelos sin error
- [ ] Tracking de cuerpo funciona (modelo sigue movimientos)
- [ ] Tracking de manos funciona (dedos se mueven)
- [ ] Tracking de cara funciona (parpadeo, boca, head rotation)
- [ ] Suavizado OneEuroFilter activo (movimientos fluidos, sin jitter)
- [ ] Face blendshapes ARKit aplicados
- [ ] Detección de emociones funciona
- [ ] Spring bones funcionan (pelo/ropa reacciona)
- [ ] Ropes Verlet visibles y con física
- [ ] VMC output envía datos (Electron only)
- [ ] Sin errores en consola
- [ ] Sin dependencias de jThree
- [ ] Sin dependencias de MMD.js (excepto bone names como strings)
- [ ] Sin UI extras (menús, settings panels, etc.)

---

## Referencia Rápida de Archivos Fuente en Redux

| Archivo ULTRA | Fuente en Redux | Tipo |
|---|---|---|
| `js/ultra-main.js` | NUEVO | Orquestador |
| `js/ultra-vrm-loader.js` | Extraído de `js/mmd/threex-vrm.js` + `threex-gui.js` | VRM |
| `js/ultra-tracking-bridge.js` | Reescrito de `js/SA_system_emulation.min.js` | Bridge |
| `js/ultra-ik-solver.js` | Simplificado de `three.js/animation/CCDIKSolver.js` | IK |
| `js/ultra-ropes.js` | Extraído de `images/XR Animator/animate.js:15323-16389` | Ropes |
| `js/ultra-vmc.js` | Extraído de `js/mmd/osc.js` + `js/mmd/threex-vrm.js:696-870` | VMC |
| `js/tracking/*` | Copiados de `js/tracking/` | Tracking |
| `js/mocap_lib_module.js` | Copiado de `js/` | Tracking |
| `js/facemesh_lib.js` | Copiado de `js/` | Tracking |
| `three.js/*` | Copiados de `three.js/` | THREE |

## Notas Importantes

1. **SA_system_emulation.min.js** es el archivo más difícil de trabajar. Está minificado en UNA sola línea. Usar búsqueda de patrones (ej: buscar `_t.add` o `"skin"` o nombres de bones japoneses) para localizar las funciones relevantes.

2. **Los workers de tracking** usan `importScripts()` con paths relativos. Si la estructura de carpetas cambia, los paths en `pose_worker.js`, `hands_worker.js`, `facemesh_worker.js`, `pose_lib.js`, `hands_lib.js` deben ajustarse.

3. **El modelo VRM** usa nombres de bones **japoneses MMD** como representación intermedia interna. Esto es por diseño del sistema original. El mapa `BONE_MAP_MMD_TO_VRM` en `ultra-vrm-loader.js` convierte a nombres VRM estándar.

4. **Los archivos de tracking** pueden tener dependencias en `self.S` (shared state object de mocap_lib_module.js) que espera ciertas propiedades inicializadas. Verificar que el shared state se construye correctamente.

5. **three-vrm.module.min.js** es un ES module que importa THREE internamente. Puede necesitar un import map o que THREE esté en el scope global dependiendo de cómo está bundleado.