# Plan: VRM Direct Standalone — Remover dependencia del stack MMD

**Objetivo**: que `vrm-direct` funcione completamente sin `jThree/`, `MMD_SA`, `three.core.min.js` ni `SA_system_emulation.min.js`.

**Pipeline objetivo**:
```
MediaPipe Worker
    → keypoints3D_raw  (33 pts BlazePose + 21 pts por mano)
    → vrm-direct-pose-solver.js   ← nuevo, IK math propio
    → vrm-direct-solver.js        ← face + body → VRM bones/expressions
    → vrm-direct-animator.js      ← RAF loop propio
    → finalsnoo.vrm
```

---

## Dependencias actuales a eliminar

| Dependencia | Archivo | Línea aprox | Por qué existe actualmente |
|---|---|---|---|
| `THREE.MMD.getModels()[0].mesh.bones_by_name` | `vrm-direct-solver.js` | `getMMDBones()` | Lee quaterniones post-IK de jThree |
| `MMD_SA.THREEX.scene` | `vrm-direct-loader.js` | `_getScene()` | Agrega VRM mesh a la escena de MMD |
| `MMD_SA.THREEX.THREE` / `MMD_SA.THREEX._THREE` | `vrm-direct-loader.js` + `vrm-direct-solver.js` | `_getTHREE()` | Reutiliza la instancia THREE de MMD |
| `MMD_SA.THREEX.GLTF_loader` | `vrm-direct-loader.js` | `createLoader()` | Reutiliza el loader de MMD (ya tiene VRMLoaderPlugin) |
| `MMD_SA.THREEX.PPE.N8AO.AO_MASK` | `vrm-direct-loader.js` | onLoad | Máscara para oclusión ambiental |
| `MMD_SA.THREEX.obj_list[0]` | `vrm-direct-animator.js` | `tick()` | Sincroniza posición del VRM con el MMD |
| `System._browser.on_animation_update` | `vrm-direct-animator.js` | `start()` / `stop()` | Registra el tick en el scheduler de MMD |
| `VRMDirectSolver._autoAnimSnapshot` | `vrm-direct-solver.js` + `threex-vrm.js` | `solveAutoAnim()` | Auto-blink/VMD morphs provistos por el stack MMD |
| Evento `jThree_ready` | `vrm-direct-main.js` | al final del archivo | Espera que jThree esté listo antes de iniciar |
| `System._browser.camera.poseNet.frames.skin` | `vrm-direct-solver.js` | `getMMDBones()` (Fase 2) | Quaterniones calculados por SA core (Fase 1 los usa, Fase 2 los elimina) |

## Lo que ya es independiente (NO tocar)

- `System._browser.camera.facemesh.frames.morph` — ARKit blendshapes, llegan directo del worker de cara
- `System._browser.camera.facemesh.faceBlendshapes_list` — ídem
- `solveMMDMorphExpressions()`, `solveFace()`, `solveMMDMorphFallback()` — ya funcionan sin MMD
- `three-vrm.module.min.js` — librería estándar, no es parte de jThree

---

## FASE 1 — Desacoplar de jThree (sin reescribir el IK math)

**Qué se logra**: VRM Direct tiene su propia escena, renderer y loop RAF.
Para body tracking sigue usando `frames.skin` (SA core sigue corriendo), pero ya no depende de jThree ni de `MMD_SA`.

**Pre-condición**: `SA_system_emulation.min.js` sigue corriendo para el IK. Solo eliminamos la dependencia estructural de jThree/MMD_SA.

---

### Tarea 1.1 — `vrm-direct-loader.js`: renderer, cámara y escena propios

**Archivo**: `js/vrm-direct/vrm-direct-loader.js`

#### Paso 1.1.1 — Agregar `_createOwnRenderer()` (función nueva, añadir antes de `load()`)

```js
function _createOwnRenderer() {
  var T = _getTHREE();

  // Canvas propio superpuesto al canvas principal (fondo transparente)
  var canvas = document.createElement('canvas');
  canvas.id = 'vrm-direct-canvas';
  canvas.style.cssText = [
    'position:fixed', 'top:0', 'left:0',
    'width:100%', 'height:100%',
    'pointer-events:none', 'z-index:10'
  ].join(';');
  document.body.appendChild(canvas);

  var renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // three.js r152+: outputColorSpace = THREE.SRGBColorSpace
  // three.js <r152:  outputEncoding  = THREE.sRGBEncoding
  try { renderer.outputColorSpace = T.SRGBColorSpace; }
  catch(e) { try { renderer.outputEncoding = T.sRGBEncoding; } catch(e2) {} }

  var camera = new T.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 20);
  camera.position.set(0, 1.3, 3.5);

  var scene = new T.Scene();
  var dirLight = new T.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(1, 2, 3);
  scene.add(dirLight);
  scene.add(new T.AmbientLight(0xffffff, 0.4));

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  console.log('[VRMDirect] Own renderer created');
  return { renderer: renderer, camera: camera, scene: scene };
}
```

#### Paso 1.1.2 — Modificar `_getTHREE()`

**Código actual** (líneas 35-38):
```js
function _getTHREE() {
  return (window.MMD_SA && MMD_SA.THREEX) ? MMD_SA.THREEX.THREE : window.THREE;
}
```

**Código nuevo**:
```js
function _getTHREE() {
  // Preferir el THREE propio (asignado por vrm-direct-main.js al importar)
  if (window._VRMDirectTHREE) return window._VRMDirectTHREE;
  // Fallback: usar el de MMD si está disponible
  if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.THREE || MMD_SA.THREEX._THREE;
  return window.THREE;
}
```

#### Paso 1.1.3 — Modificar `_getTHREEX()`

**Código actual** (líneas 40-43):
```js
function _getTHREEX() {
  return (window.MMD_SA && MMD_SA.THREEX) ? MMD_SA.THREEX.THREEX : (window.THREEX || {});
}
```

**Código nuevo**:
```js
function _getTHREEX() {
  if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.THREEX || {};
  return window.THREEX || {};
}
```

#### Paso 1.1.4 — Modificar `_getScene()`

**Código actual** (líneas 45-47):
```js
function _getScene() {
  return (window.MMD_SA && MMD_SA.THREEX) ? MMD_SA.THREEX.scene : null;
}
```

**Código nuevo**:
```js
function _getScene() {
  // Preferir escena propia; fallback a escena de MMD
  if (window._VRMDirectScene) return window._VRMDirectScene;
  if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX.scene;
  return null;
}
```

#### Paso 1.1.5 — Modificar `createLoader()` para no depender de `MMD_SA.THREEX.GLTF_loader`

**Código actual** (líneas 52-63):
```js
function createLoader() {
  if (_loader) return _loader;
  try {
    _loader = MMD_SA.THREEX.GLTF_loader;
    console.log('[VRMDirect] Using existing GLTF_loader (VRMLoaderPlugin already registered)');
  } catch (e) {
    console.warn('[VRMDirect] Falling back to new GLTFLoader');
    var T  = _getTHREE();
    var TX = _getTHREEX();
    _loader = new T.GLTFLoader();
    _loader.register(function(parser) {
      return new TX.VRMLoaderPlugin(parser);
    });
  }
  return _loader;
}
```

**Código nuevo** (el fallback pasa a ser el camino principal):
```js
function createLoader() {
  if (_loader) return _loader;

  // Si hay un loader propio ya registrado (con VRMLoaderPlugin), usarlo
  if (window._VRMDirectLoader) {
    _loader = window._VRMDirectLoader;
    console.log('[VRMDirect] Using _VRMDirectLoader');
    return _loader;
  }

  // Intentar reutilizar el loader de MMD (ya tiene VRMLoaderPlugin)
  try {
    if (window.MMD_SA && MMD_SA.THREEX && MMD_SA.THREEX.GLTF_loader) {
      _loader = MMD_SA.THREEX.GLTF_loader;
      console.log('[VRMDirect] Using existing GLTF_loader from MMD_SA');
      return _loader;
    }
  } catch (e) {}

  // Crear loader propio — requires GLTFLoader + VRMLoaderPlugin disponibles como globals
  console.log('[VRMDirect] Creating own GLTFLoader');
  var T  = _getTHREE();
  var TX = _getTHREEX();
  _loader = new T.GLTFLoader();
  if (TX.VRMLoaderPlugin) {
    _loader.register(function(parser) { return new TX.VRMLoaderPlugin(parser); });
  } else {
    console.warn('[VRMDirect] VRMLoaderPlugin not found — VRM may not load correctly');
  }
  return _loader;
}
```

#### Paso 1.1.6 — Reemplazar `MMD_SA.THREEX.PPE.N8AO.AO_MASK` por valor hardcodeado

En `load()` → callback `onLoad`, buscar:
```js
var aoMask = 2;
try { aoMask = MMD_SA.THREEX.PPE.N8AO.AO_MASK; } catch(e) {}
```

Cambiar a:
```js
// AO_MASK = 2 es el valor estándar de SAO para la máscara de oclusión ambiental
var aoMask = 2;
```

(Eliminar el bloque `try/catch` — ya no lo necesitamos.)

#### Paso 1.1.7 — Agregar función `createOwnContext()` al API público

Al final del módulo, en `window.VRMDirectLoader = { ... }`, agregar:
```js
createOwnContext: _createOwnRenderer
```

---

### Tarea 1.2 — `vrm-direct-main.js`: init sin `jThree_ready`

**Archivo**: `js/vrm-direct/vrm-direct-main.js`

#### Paso 1.2.1 — Modificar `enable()`: quitar el gate de `MMD_SA.THREEX.scene`

**Código actual** (líneas ~55-64):
```js
/* Scene must be ready (MMD_SA.THREEX.scene is the public scene accessor) */
var sceneReady = false;
try { sceneReady = !!(window.MMD_SA && MMD_SA.THREEX && MMD_SA.THREEX.scene); } catch(e) {}
if (!sceneReady) {
  console.warn('[VRMDirect] Scene not ready – retrying in 2 s');
  setTimeout(enable, 2000);
  return;
}
```

**Código nuevo**:
```js
/* Asegurarse de que tenemos una escena (propia o de MMD) */
var sceneReady = !!(window._VRMDirectScene ||
                   (window.MMD_SA && window.MMD_SA.THREEX && MMD_SA.THREEX.scene));
if (!sceneReady) {
  console.warn('[VRMDirect] Scene not ready – retrying in 2 s');
  setTimeout(enable, 2000);
  return;
}
```

#### Paso 1.2.2 — Reemplazar el listener de `jThree_ready` por init propio

**Código actual** (al final del archivo, líneas ~143-149):
```js
/* jThree_ready fires once the 3-D scene is initialised */
if (window.addEventListener) {
  window.addEventListener('jThree_ready', function () {
    /* Delay to let the main pipeline fully settle */
    setTimeout(enable, 3000);
  });
}
```

**Código nuevo**:
```js
/* Inicializar en cuanto el DOM y THREE estén listos.
 * Si jThree también dispara el evento, se acepta — enable() es idempotente. */
function _tryAutoEnable() {
  // Crear contexto propio (renderer/camera/scene) si THREE está disponible
  var T = window._VRMDirectTHREE || window.THREE;
  if (!T) {
    setTimeout(_tryAutoEnable, 200);
    return;
  }
  if (!window._VRMDirectScene) {
    var ctx = VRMDirectLoader.createOwnContext();
    window._VRMDirectScene    = ctx.scene;
    window._VRMDirectCamera   = ctx.camera;
    window._VRMDirectRenderer = ctx.renderer;
  }
  setTimeout(enable, 500);
}

/* Si jThree está presente, esperar su evento para no competir con su renderer */
if (window.addEventListener) {
  window.addEventListener('jThree_ready', function () {
    // jThree ya creó escena y renderer — NO crear los nuestros, reusar los de MMD
    window._VRMDirectScene    = null;  // deja que _getScene() use MMD_SA.THREEX.scene
    window._VRMDirectCamera   = null;
    window._VRMDirectRenderer = null;
    setTimeout(enable, 3000);
  });
}

/* Si jThree no existe (modo standalone), arrancar por nuestra cuenta */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(_tryAutoEnable, 100);
  });
} else {
  setTimeout(_tryAutoEnable, 100);
}
```

**Nota**: De esta forma el código sigue funcionando con MMD (`jThree_ready` toma control) pero también funciona en modo standalone (sin jThree).

#### Paso 1.2.3 — Pasar `renderer` y `camera` al handle después del load

En `enable()`, dentro de `.then(function(handle) { ... })`, agregar:
```js
// Inyectar renderer y cámara al handle para que el animator pueda renderear
handle.renderer = window._VRMDirectRenderer;
handle.camera   = window._VRMDirectCamera;
```

---

### Tarea 1.3 — `vrm-direct-animator.js`: RAF propio + eliminar syncs con MMD

**Archivo**: `js/vrm-direct/vrm-direct-animator.js`

#### Paso 1.3.1 — Reemplazar posición sync con MMD (`tick()`, bloque try/catch ~líneas 148-170)

**Código actual**:
```js
try {
  var mainObj = MMD_SA.THREEX.obj_list[0];
  if (mainObj && _handle.mesh) {
    var p = mainObj.parent;
    if (p) {
      _handle.mesh.position.copy(p.position);
      _handle.mesh.position.x += _handle.config.offsetX || 0;
      _handle.mesh.position.y += _handle.config.offsetY || 0;
      _handle.mesh.position.z += _handle.config.offsetZ || 0;
    }
  }
} catch (e) {
  try {
    var models = window.THREE && THREE.MMD && THREE.MMD.getModels();
    if (models && models[0] && models[0].mesh && _handle.mesh) {
      _handle.mesh.position.copy(models[0].mesh.position);
      _handle.mesh.position.x += _handle.config.offsetX || 0;
      _handle.mesh.position.y += _handle.config.offsetY || 0;
      _handle.mesh.position.z += _handle.config.offsetZ || 0;
    }
  } catch (e2) {}
}
```

**Código nuevo**:
```js
// Posición: intentar seguir al modelo MMD si existe, sino usar config fija
if (_handle.mesh) {
  var posSet = false;
  // Intentar sincronizar con MMD (opcional, no bloquea si no existe)
  try {
    var mainObj = window.MMD_SA && MMD_SA.THREEX && MMD_SA.THREEX.obj_list[0];
    if (mainObj && mainObj.parent) {
      _handle.mesh.position.copy(mainObj.parent.position);
      posSet = true;
    }
  } catch(e) {}

  if (!posSet) {
    _handle.mesh.position.set(0, 0, 0);
  }

  _handle.mesh.position.x += (_handle.config.offsetX || 0);
  _handle.mesh.position.y += (_handle.config.offsetY || 0);
  _handle.mesh.position.z += (_handle.config.offsetZ || 0);
}
```

#### Paso 1.3.2 — Agregar render call al final de `tick()`

Agregar justo antes de `_handle.update(dt)` (o después):
```js
// Renderear con el renderer propio si existe
// (si usamos la escena de MMD, su renderer ya se encarga)
if (_handle.renderer && _handle.camera) {
  var scene = window._VRMDirectScene;
  if (scene) _handle.renderer.render(scene, _handle.camera);
}
```

#### Paso 1.3.3 — Reemplazar `System._browser.on_animation_update` por RAF propio

**Código actual en `start()`** (líneas ~237-241):
```js
// Register in phase 1 (post-animate), infinite loop (-1)
System._browser.on_animation_update.add(tick, 0, 1, -1);
```

**Código nuevo en `start()`**:
```js
// Si el sistema SA está disponible, usar su scheduler (garantiza orden post-MMD)
var usedSAScheduler = false;
try {
  if (window.System && System._browser && System._browser.on_animation_update) {
    System._browser.on_animation_update.add(tick, 0, 1, -1);
    _useSAScheduler = true;
    usedSAScheduler = true;
    console.log('[VRMDirect] Usando SA scheduler (post-MMD)');
  }
} catch(e) {}

// Fallback: RAF propio (standalone, sin SA)
if (!usedSAScheduler) {
  _prevTimestamp = 0;
  var rafLoop = function(timestamp) {
    if (!_active) return;
    var dt = _prevTimestamp > 0 ? Math.min((timestamp - _prevTimestamp) / 1000, 0.1) : 1/60;
    _prevTimestamp = timestamp;
    tick(dt);
    requestAnimationFrame(rafLoop);
  };
  requestAnimationFrame(rafLoop);
  console.log('[VRMDirect] Usando RAF propio (standalone)');
}
```

Agregar variable `_useSAScheduler = false` al inicio del módulo.

**Código actual en `stop()`**:
```js
System._browser.on_animation_update.remove(tick, 1);
```

**Código nuevo en `stop()`**:
```js
if (_useSAScheduler) {
  try { System._browser.on_animation_update.remove(tick, 1); } catch(e) {}
  _useSAScheduler = false;
}
// Si se usó RAF, simplemente _active = false detiene el loop
```

#### Paso 1.3.4 — Modificar `tick()` para que el dt venga del RAF cuando corresponda

El `tick()` actual no recibe `dt` como parámetro — lo calcula internamente con `performance.now()`. Esto ya funciona con RAF. **No es necesario cambiar la firma de tick.**

---

### Tarea 1.4 — `vrm-direct-solver.js`: leer `frames.skin` en lugar de `bones_by_name`

**Archivo**: `js/vrm-direct/vrm-direct-solver.js`

#### Paso 1.4.1 — Modificar `_getTHREE()` en el solver

**Código actual** (líneas ~86-91):
```js
function _getTHREE() {
  if (window.MMD_SA && MMD_SA.THREEX) {
    return MMD_SA.THREEX._THREE || MMD_SA.THREEX.THREE;
  }
  return window.THREE;
}
```

**Código nuevo**:
```js
function _getTHREE() {
  if (window._VRMDirectTHREE) return window._VRMDirectTHREE;
  if (window.MMD_SA && MMD_SA.THREEX) return MMD_SA.THREEX._THREE || MMD_SA.THREEX.THREE;
  return window.THREE;
}
```

#### Paso 1.4.2 — Agregar `_wrapFramesSkin()` antes de `getMMDBones()`

```js
/**
 * Adapta frames.skin (del sistema SA) a la misma interfaz que bones_by_name.
 * frames.skin[boneName] = [currentFrame, prevFrame]
 * currentFrame = { rot: THREE.Quaternion, pos: THREE.Vector3, t_delta, t_delta_frame }
 * La salida imita: bones_by_name[name].quaternion  y  bones_by_name[name].position
 */
function _wrapFramesSkin(skin) {
  var T = _getTHREE();
  var wrapped = {};
  for (var boneName in skin) {
    var frames = skin[boneName];
    if (!frames || !frames[0]) continue;
    var cur  = frames[0];
    var prev = frames[1];
    var q;
    if (prev && prev.rot && cur.t_delta_frame > 0) {
      var ratio = Math.max(0, Math.min(cur.t_delta / cur.t_delta_frame, 1));
      q = prev.rot.clone().slerp(cur.rot, ratio);
    } else {
      q = cur.rot ? cur.rot.clone() : new T.Quaternion();
    }
    wrapped[boneName] = { quaternion: q };
    if (cur.pos) wrapped[boneName].position = cur.pos.clone();
  }
  return wrapped;
}
```

#### Paso 1.4.3 — Modificar `getMMDBones()`

**Código actual** (líneas ~95-107):
```js
function getMMDBones() {
  try {
    var models = window.THREE && THREE.MMD && THREE.MMD.getModels();
    if (models && models[0] && models[0].mesh) {
      return models[0].mesh.bones_by_name;
    }
    var T = _getTHREE();
    models = T.MMD && T.MMD.getModels();
    if (models && models[0] && models[0].mesh) return models[0].mesh.bones_by_name;
    return null;
  } catch (e) {
    return null;
  }
}
```

**Código nuevo** (3 niveles de prioridad):
```js
function getMMDBones() {
  // Prioridad 1: pose solver propio (Fase 2 — cuando esté implementado)
  if (window.VRMDirectSolver && VRMDirectSolver._poseFrames) {
    return VRMDirectSolver._poseFrames;
  }

  // Prioridad 2: frames.skin de SA core (Fase 1 — elimina dep de jThree)
  try {
    var skin = System._browser.camera.poseNet.frames.skin;
    if (skin && Object.keys(skin).length > 0) {
      return _wrapFramesSkin(skin);
    }
  } catch(e) {}

  // Prioridad 3: bones_by_name de jThree (legacy fallback)
  try {
    var models = window.THREE && THREE.MMD && THREE.MMD.getModels();
    if (models && models[0] && models[0].mesh) return models[0].mesh.bones_by_name;
    var T = _getTHREE();
    models = T && T.MMD && T.MMD.getModels();
    if (models && models[0] && models[0].mesh) return models[0].mesh.bones_by_name;
  } catch(e) {}

  return null;
}
```

#### Paso 1.4.4 — Agregar `_poseFrames` al API público (para Fase 2)

En `window.VRMDirectSolver = { ... }`, agregar:
```js
_poseFrames:   null,   // setado por vrm-direct-pose-solver.js en Fase 2
```

---

### Tarea 1.5 — Auto-blink interno (elimina dependencia de `threex-vrm.js`)

**Archivo**: `js/vrm-direct/vrm-direct-solver.js`

#### Paso 1.5.1 — Agregar estado de blink junto a otras vars privadas

Agregar al inicio del módulo (después de `var _faceDiagDone`):
```js
// Estado del auto-blink propio (usado cuando _autoAnimSnapshot es null)
var _autoBlinkState = {
  phase:         0,
  nextBlink:     3.0,    // segundos hasta el primer parpadeo
  blinkDuration: 0.15,   // duración del cierre (segundos)
  minInterval:   3.5,
  maxInterval:   2.5
};
```

#### Paso 1.5.2 — Modificar `solveAutoAnim()`

**Código actual** (líneas ~447-477):
```js
function solveAutoAnim(isVRM1) {
  // Primary: threex-vrm.js snapshot (already VRM expression names)
  var snap = VRMDirectSolver._autoAnimSnapshot;
  if (snap && Object.keys(snap).length > 0) {
    VRMDirectSolver._autoAnimSnapshot = null;
    return snap;
  }
  // Fallback: read raw MMD morphs and translate to VRM expression names
  try {
    var models = window.THREE && THREE.MMD && THREE.MMD.getModels();
    if (!models || !models[0]) return null;
    var mw = models[0].mesh && models[0].mesh.geometry && models[0].mesh.geometry.morphs_weight_by_name;
    if (!mw) return null;
    var map = isVRM1 !== false ? MMD_TO_VRM1 : MMD_TO_VRM0;
    var result = {};
    var found = 0;
    for (var mmdName in map) {
      var w = mw[mmdName];
      if (!w || w < 0.01) continue;
      var vrmName = map[mmdName];
      result[vrmName] = Math.max(result[vrmName] || 0, w);
      found++;
    }
    return found > 0 ? result : null;
  } catch (e) {
    return null;
  }
}
```

**Código nuevo**:
```js
function solveAutoAnim(isVRM1, dt) {
  // Primario: snapshot de threex-vrm.js (ya tiene nombres VRM, incluye VMD morphs)
  var snap = VRMDirectSolver._autoAnimSnapshot;
  if (snap && Object.keys(snap).length > 0) {
    VRMDirectSolver._autoAnimSnapshot = null;  // consumir para evitar datos obsoletos
    return snap;
  }

  // Secundario: morphs_weight_by_name de MMD si está disponible
  try {
    var models = window.THREE && THREE.MMD && THREE.MMD.getModels();
    if (models && models[0]) {
      var mw = models[0].mesh && models[0].mesh.geometry && models[0].mesh.geometry.morphs_weight_by_name;
      if (mw) {
        var map = isVRM1 !== false ? MMD_TO_VRM1 : MMD_TO_VRM0;
        var result = {}, found = 0;
        for (var mmdName in map) {
          var w = mw[mmdName];
          if (!w || w < 0.01) continue;
          var vn = map[mmdName];
          result[vn] = Math.max(result[vn] || 0, w);
          found++;
        }
        if (found > 0) return result;
      }
    }
  } catch(e) {}

  // Fallback standalone: auto-blink por timer sinusoidal (cuando MMD no está)
  var s = _autoBlinkState;
  var frameDt = dt || 0.016;
  s.phase += frameDt;
  if (s.phase >= s.nextBlink) {
    var t = s.phase - s.nextBlink;
    if (t < s.blinkDuration) {
      var w = Math.sin((t / s.blinkDuration) * Math.PI);
      var blinkResult = {};
      blinkResult[isVRM1 !== false ? 'blinkLeft'  : 'blink_l'] = w;
      blinkResult[isVRM1 !== false ? 'blinkRight' : 'blink_r'] = w;
      return blinkResult;
    } else if (t > s.blinkDuration + 0.05) {
      // Reiniciar con intervalo aleatorio
      s.nextBlink = s.phase + s.minInterval + Math.random() * s.maxInterval;
    }
  }
  return null;
}
```

#### Paso 1.5.3 — Pasar `dt` a `solveAutoAnim` desde el animator

En `vrm-direct-animator.js`, en `tick()`, cambiar:
```js
var autoAnim = VRMDirectSolver.solveAutoAnim(_handle.isVRM1);
```
a:
```js
var autoAnim = VRMDirectSolver.solveAutoAnim(_handle.isVRM1, dt);
```

---

### Verificación Fase 1

1. Arrancar servidor: `cd redux && python3 ../stuff/nocache_server.py 8080`
2. Abrir `http://127.0.0.1:8080/XR_Animator.html`
3. **Consola**: sin errores de `MMD_SA is not defined`, `THREE.MMD is not defined`, o `on_animation_update`
4. **Modo con MMD corriendo**: comparar visual A/B — el body del VRM Direct debe seguir al MMD igual que antes
5. **Face tracking**: abrir la boca, pestañear — se mapea correctamente al VRM
6. **Auto-blink**: parpadea cada ~5s sin necesitar `threex-vrm.js`
7. **Debug**: `console.log(JSON.stringify(Object.keys(VRMDirectSolver.solveBody(true))))` debe mostrar ≥ 25 huesos

---

## FASE 2 — Reescribir IK math (elimina `SA_system_emulation.min.js`)

**Qué se logra**: VRM Direct calcula los quaterniones de huesos directamente desde los `keypoints3D_raw` de MediaPipe, sin depender de `SA_system_emulation.min.js`.

**Nuevo archivo**: `js/vrm-direct/vrm-direct-pose-solver.js`

---

### Tarea 2.1 — Exponer landmarks crudos en el main thread

**Archivo**: `js/tracking/mocap-pose-processor.js`

#### Paso 2.1.1 — Encontrar dónde llegan los datos del worker

Buscar en el archivo el callback que recibe el `postMessage` del worker. Buscar:
```js
// algo como: onmessage, addEventListener('message'), S.postMessageAT, etc.
```

#### Paso 2.1.2 — Agregar exposición de keypoints3D_raw

Dentro del callback, después de que `keypoints3D_raw` esté disponible, agregar:
```js
// Exponer landmarks crudos para vrm-direct-pose-solver.js
if (window.System && System._browser && System._browser.camera && System._browser.camera.poseNet) {
  System._browser.camera.poseNet.frames._raw_keypoints3D     = pose.keypoints3D_raw  || pose.keypoints3D;
  System._browser.camera.poseNet.frames._raw_keypoints_score = pose.score;
}
```

**Archivo**: `js/tracking/mocap-hands-processor.js`

#### Paso 2.1.3 — Verificar exposición de worldLandmarks de manos

Buscar si ya existe `System._browser.camera.handpose`. Si no existe o no incluye `worldLandmarks`, agregar:
```js
System._browser.camera.handpose = processedHands; // array con worldLandmarks por mano
```

---

### Tarea 2.2 — Crear `vrm-direct-pose-solver.js`

**Nuevo archivo**: `js/vrm-direct/vrm-direct-pose-solver.js`

Estructura del archivo:

```
(function() {
  'use strict';

  // ─── Constantes BlazePose ───
  // ─── Variables privadas (filtros, estado) ───
  // ─── Helpers geométricos (vec3, midpoint, orthoFrame) ───
  // ─── Computadores por grupo de huesos ───
  //     computeHips(kps)
  //     computeSpineChest(kps, hipsQ)
  //     computeNeckHead(kps, chestQ_world)
  //     computeArm(side, kps, torsoQ_world)
  //     computeLeg(side, kps, hipsQ_world)
  //     computeFingers(handWorldLandmarks, side, isVRM1)
  // ─── solveFromLandmarks(kps, handL, handR, isVRM1) → _poseFrames ───
  // ─── API público: window.VRMDirectPoseSolver ───
})();
```

#### Paso 2.2.1 — Índices BlazePose

```js
var BP = {
  NOSE:0, L_EYE_INNER:1, L_EYE:2, L_EYE_OUTER:3,
  R_EYE_INNER:4, R_EYE:5, R_EYE_OUTER:6,
  L_EAR:7, R_EAR:8, MOUTH_L:9, MOUTH_R:10,
  L_SHOULDER:11, R_SHOULDER:12, L_ELBOW:13, R_ELBOW:14,
  L_WRIST:15, R_WRIST:16,
  L_PINKY:17, R_PINKY:18, L_INDEX:19, R_INDEX:20, L_THUMB:21, R_THUMB:22,
  L_HIP:23, R_HIP:24, L_KNEE:25, R_KNEE:26,
  L_ANKLE:27, R_ANKLE:28, L_HEEL:29, R_HEEL:30,
  L_FOOT_INDEX:31, R_FOOT_INDEX:32
};
```

#### Paso 2.2.2 — Helpers geométricos

```js
function _getTHREE() {
  return window._VRMDirectTHREE || window.THREE;
}

// Punto medio entre dos landmarks
function midpoint(a, b) {
  var T = _getTHREE();
  return new T.Vector3(
    (a.x + b.x) * 0.5,
    (a.y + b.y) * 0.5,
    (a.z + b.z) * 0.5
  );
}

// Vector normalizado de landmark a a b
function dirVec(a, b) {
  var T = _getTHREE();
  return new T.Vector3(b.x - a.x, b.y - a.y, b.z - a.z).normalize();
}

// Construir quaternion desde frame ortonormal (right, up, fwd)
// Usa la convención: X=right, Y=up, Z=-forward (OpenGL)
function quatFromFrame(right, up, fwd) {
  var T = _getTHREE();
  var m = new T.Matrix4();
  m.makeBasis(right, up, fwd.clone().negate());
  return new T.Quaternion().setFromRotationMatrix(m);
}

// flipForMeshRotation: equivale a conjugar con rotación 180°Y
// Necesario porque el VRM mesh está rotado 180° en Y para mirar a cámara
function flipQ(q) {
  q.x *= -1; q.z *= -1;
  return q;
}
```

#### Paso 2.2.3 — OneEuroFilter por landmark

```js
var _bodyFilters = null;
var _handFilters = null;

function _initFilters() {
  if (_bodyFilters) return;
  // OneEuroFilter(freq, minCutoff, beta, dCutoff)
  // Params similares a los usados en mocap-pose-processor.js
  _bodyFilters = [];
  for (var i = 0; i < 33; i++) {
    _bodyFilters.push({
      x: new OneEuroFilter(30, 1.0, 0.007, 1.0),
      y: new OneEuroFilter(30, 1.0, 0.007, 1.0),
      z: new OneEuroFilter(30, 1.0, 0.007, 1.0)
    });
  }
  _handFilters = { Left: [], Right: [] };
  ['Left', 'Right'].forEach(function(side) {
    for (var j = 0; j < 21; j++) {
      _handFilters[side].push({
        x: new OneEuroFilter(30, 1.0, 0.01, 1.0),
        y: new OneEuroFilter(30, 1.0, 0.01, 1.0),
        z: new OneEuroFilter(30, 1.0, 0.01, 1.0)
      });
    }
  });
}

function filterBodyLandmarks(kps) {
  _initFilters();
  return kps.map(function(lm, i) {
    var f = _bodyFilters[i];
    return { x: f.x.filter(lm.x), y: f.y.filter(lm.y), z: f.z.filter(lm.z) };
  });
}

function filterHandLandmarks(kps, side) {
  _initFilters();
  var filters = _handFilters[side] || _handFilters['Left'];
  return kps.map(function(lm, i) {
    var f = filters[i];
    return {
      x: f.x.filter(lm.x !== undefined ? lm.x : lm[0]),
      y: f.y.filter(lm.y !== undefined ? lm.y : lm[1]),
      z: f.z.filter(lm.z !== undefined ? lm.z : lm[2])
    };
  });
}
```

#### Paso 2.2.4 — `computeHips(kps)`

```js
function computeHips(kps) {
  var T = _getTHREE();

  var hipMid = midpoint(kps[BP.L_HIP], kps[BP.R_HIP]);
  var shoulderMid = midpoint(kps[BP.L_SHOULDER], kps[BP.R_SHOULDER]);

  // X: de cadera derecha a izquierda (eje lateral del cuerpo)
  var right = dirVec(kps[BP.R_HIP], kps[BP.L_HIP]);
  // Y: de cadera hacia hombros (eje vertical del torso)
  var up = new T.Vector3(
    shoulderMid.x - hipMid.x,
    shoulderMid.y - hipMid.y,
    shoulderMid.z - hipMid.z
  ).normalize();
  // Z: forward = right × up
  var fwd = new T.Vector3().crossVectors(right, up).normalize();
  // Re-ortogonalizar up: up = fwd × right
  up = new T.Vector3().crossVectors(fwd, right).normalize();

  var q = quatFromFrame(right, up, fwd);
  flipQ(q);

  return {
    rot: q,
    pos: new T.Vector3(hipMid.x, hipMid.y, hipMid.z)
  };
}
```

#### Paso 2.2.5 — `computeSpineChest(kps, hipsQ_world)`

```js
function computeSpineChest(kps, hipsQ_world) {
  var T = _getTHREE();
  var hipMid = midpoint(kps[BP.L_HIP], kps[BP.R_HIP]);
  var shoulderMid = midpoint(kps[BP.L_SHOULDER], kps[BP.R_SHOULDER]);

  var right = dirVec(kps[BP.R_SHOULDER], kps[BP.L_SHOULDER]);
  var up = new T.Vector3(
    shoulderMid.x - hipMid.x,
    shoulderMid.y - hipMid.y,
    shoulderMid.z - hipMid.z
  ).normalize();
  var fwd = new T.Vector3().crossVectors(right, up).normalize();
  up = new T.Vector3().crossVectors(fwd, right).normalize();

  var q_world = quatFromFrame(right, up, fwd);

  // Local = inverse(hipsQ_world) * q_world
  var q_local = hipsQ_world.clone().conjugate().multiply(q_world);
  flipQ(q_local);

  // Dividir en spine (60%) y chest (40%) usando slerp con identity
  var identity = new T.Quaternion();
  var spineQ = identity.clone().slerp(q_local, 0.6);
  var chestQ = identity.clone().slerp(q_local, 0.4);

  return { spine: spineQ, chest: chestQ, q_world: q_world };
}
```

#### Paso 2.2.6 — `computeNeckHead(kps, chestQ_world)`

```js
function computeNeckHead(kps, chestQ_world) {
  var T = _getTHREE();
  var earMid = midpoint(kps[BP.L_EAR], kps[BP.R_EAR]);
  var shoulderMid = midpoint(kps[BP.L_SHOULDER], kps[BP.R_SHOULDER]);

  var right = dirVec(kps[BP.R_EAR], kps[BP.L_EAR]);
  var up = new T.Vector3(
    earMid.x - shoulderMid.x,
    earMid.y - shoulderMid.y,
    earMid.z - shoulderMid.z
  ).normalize();
  // Forward: oreja → nariz
  var nose = kps[BP.NOSE];
  var fwd = new T.Vector3(
    nose.x - earMid.x,
    nose.y - earMid.y,
    nose.z - earMid.z
  ).normalize();
  // Re-ortogonalizar
  fwd = new T.Vector3().crossVectors(right, up).normalize();
  up = new T.Vector3().crossVectors(fwd, right).normalize();

  var q_world = quatFromFrame(right, up, fwd);
  var q_local = chestQ_world.clone().conjugate().multiply(q_world);
  flipQ(q_local);

  var identity = new T.Quaternion();
  return {
    neck: identity.clone().slerp(q_local, 0.5),
    head: identity.clone().slerp(q_local, 0.5)
  };
}
```

#### Paso 2.2.7 — `computeArm(side, kps, torsoQ_world)`

```js
// side: 'L' | 'R'
function computeArm(side, kps, torsoQ_world) {
  var T = _getTHREE();
  var isLeft = (side === 'L');
  var shoulderIdx = isLeft ? BP.L_SHOULDER : BP.R_SHOULDER;
  var elbowIdx    = isLeft ? BP.L_ELBOW    : BP.R_ELBOW;
  var wristIdx    = isLeft ? BP.L_WRIST    : BP.R_WRIST;

  // T-pose: brazo extendido lateralmente (±X)
  var tPose = new T.Vector3(isLeft ? -1 : 1, 0, 0);

  // Upper arm: hombro → codo
  var upperDir = dirVec(kps[shoulderIdx], kps[elbowIdx]);
  var upperQ_world = new T.Quaternion().setFromUnitVectors(tPose, upperDir);
  var upperQ_local = torsoQ_world.clone().conjugate().multiply(upperQ_world);
  flipQ(upperQ_local);

  // Forearm: codo → muñeca (relativo al upper arm)
  var lowerDir = dirVec(kps[elbowIdx], kps[wristIdx]);
  var lowerQ_world = new T.Quaternion().setFromUnitVectors(tPose, lowerDir);
  var lowerQ_local = upperQ_world.clone().conjugate().multiply(lowerQ_world);
  flipQ(lowerQ_local);

  var prefix = isLeft ? 'left' : 'right';
  var result = {};
  result[prefix + 'Shoulder']  = new T.Quaternion(); // shoulder lo resolvemos aparte
  result[prefix + 'UpperArm']  = upperQ_local;
  result[prefix + 'LowerArm']  = lowerQ_local;

  return { bones: result, upperQ_world: upperQ_world };
}
```

#### Paso 2.2.8 — `computeLeg(side, kps, hipsQ_world)`

```js
// side: 'L' | 'R'
function computeLeg(side, kps, hipsQ_world) {
  var T = _getTHREE();
  var isLeft = (side === 'L');
  var hipIdx    = isLeft ? BP.L_HIP    : BP.R_HIP;
  var kneeIdx   = isLeft ? BP.L_KNEE   : BP.R_KNEE;
  var ankleIdx  = isLeft ? BP.L_ANKLE  : BP.R_ANKLE;
  var heelIdx   = isLeft ? BP.L_HEEL   : BP.R_HEEL;
  var toeIdx    = isLeft ? BP.L_FOOT_INDEX : BP.R_FOOT_INDEX;

  // T-pose: pierna cuelga hacia abajo (-Y)
  var tPose = new T.Vector3(0, -1, 0);

  // Upper leg: cadera → rodilla
  var upperDir = dirVec(kps[hipIdx], kps[kneeIdx]);
  var upperQ_world = new T.Quaternion().setFromUnitVectors(tPose, upperDir);
  var upperQ_local = hipsQ_world.clone().conjugate().multiply(upperQ_world);
  flipQ(upperQ_local);

  // Lower leg: rodilla → tobillo
  var lowerDir = dirVec(kps[kneeIdx], kps[ankleIdx]);
  var lowerQ_world = new T.Quaternion().setFromUnitVectors(tPose, lowerDir);
  var lowerQ_local = upperQ_world.clone().conjugate().multiply(lowerQ_world);
  flipQ(lowerQ_local);

  // Pie: talón → punta del pie
  var footFwd = dirVec(kps[heelIdx], kps[toeIdx]);
  var footUp  = new T.Vector3(0, 1, 0);
  var footRight = new T.Vector3().crossVectors(footFwd, footUp).normalize();
  footUp = new T.Vector3().crossVectors(footRight, footFwd).normalize();
  var footQ_world = quatFromFrame(footRight, footUp, footFwd);
  var footQ_local = lowerQ_world.clone().conjugate().multiply(footQ_world);
  flipQ(footQ_local);

  var prefix = isLeft ? 'left' : 'right';
  var result = {};
  result[prefix + 'UpperLeg'] = upperQ_local;
  result[prefix + 'LowerLeg'] = lowerQ_local;
  result[prefix + 'Foot']     = footQ_local;

  return result;
}
```

#### Paso 2.2.9 — `computeFingers(handWorldLandmarks, side, isVRM1)`

Los 21 landmarks de la mano MediaPipe tienen este layout:
- 0: wrist
- 1-4: thumb (CMC, MCP, IP, tip)
- 5-8: index, 9-12: middle, 13-16: ring, 17-20: pinky

```js
// Mapeo: índice base → nombre VRM (proximal, intermediate, distal)
var FINGER_MAP_VRM1 = {
  L: {
    thumb:  ['leftThumbMetacarpal', 'leftThumbProximal',  'leftThumbDistal'],
    index:  ['leftIndexProximal',   'leftIndexIntermediate',  'leftIndexDistal'],
    middle: ['leftMiddleProximal',  'leftMiddleIntermediate', 'leftMiddleDistal'],
    ring:   ['leftRingProximal',    'leftRingIntermediate',   'leftRingDistal'],
    pinky:  ['leftLittleProximal',  'leftLittleIntermediate', 'leftLittleDistal']
  },
  R: {
    thumb:  ['rightThumbMetacarpal', 'rightThumbProximal',  'rightThumbDistal'],
    index:  ['rightIndexProximal',   'rightIndexIntermediate',  'rightIndexDistal'],
    middle: ['rightMiddleProximal',  'rightMiddleIntermediate', 'rightMiddleDistal'],
    ring:   ['rightRingProximal',    'rightRingIntermediate',   'rightRingDistal'],
    pinky:  ['rightLittleProximal',  'rightLittleIntermediate', 'rightLittleDistal']
  }
};

// Grupos de landmarks por dedo: [base, mid1, mid2, tip]
var FINGER_INDICES = {
  thumb:  [1, 2, 3, 4],
  index:  [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring:   [13, 14, 15, 16],
  pinky:  [17, 18, 19, 20]
};

function computeFingers(handWorldLandmarks, side, isVRM1) {
  if (!handWorldLandmarks || handWorldLandmarks.length < 21) return {};
  var T = _getTHREE();
  var result = {};
  var map = FINGER_MAP_VRM1[side]; // usar VRM1 para ambas versiones por ahora
  if (!map) return {};

  var wrist = handWorldLandmarks[0];

  for (var fingerName in FINGER_INDICES) {
    var indices = FINGER_INDICES[fingerName];
    var boneNames = map[fingerName];
    if (!boneNames) continue;

    for (var b = 0; b < 3; b++) {
      var baseIdx = indices[b];
      var tipIdx  = indices[b + 1];
      var baseLm  = handWorldLandmarks[baseIdx];
      var tipLm   = handWorldLandmarks[tipIdx];
      if (!baseLm || !tipLm) continue;

      // Dirección de la falange en espacio de la mano
      var dir = dirVec(baseLm, tipLm);

      // T-pose del dedo: extendido en -Z (dedos apuntan hacia adelante en hand space)
      var tPose = new T.Vector3(0, 0, -1);
      var q = new T.Quaternion().setFromUnitVectors(tPose, dir);
      flipQ(q);

      result[boneNames[b]] = q;
    }
  }

  return result;
}
```

#### Paso 2.2.10 — `solveFromLandmarks()` — función principal

```js
function solveFromLandmarks(keypoints3D, handLeft, handRight, isVRM1) {
  if (!keypoints3D || keypoints3D.length < 33) return null;
  if (typeof OneEuroFilter === 'undefined') return null;  // filtro no cargado aún

  var T = _getTHREE();

  // Filtrar landmarks
  var kps = filterBodyLandmarks(keypoints3D);

  var result = {};

  // ─── Hips ───
  var hipsData = computeHips(kps);
  result['hips'] = hipsData.rot;
  result._hipsPosition = hipsData.pos;
  var hipsQ_world = hipsData.rot.clone();
  flipQ(hipsQ_world);  // deshacer el flip para world space

  // ─── Spine / Chest ───
  var spineChestData = computeSpineChest(kps, hipsQ_world);
  result['spine'] = spineChestData.spine;
  result['chest'] = spineChestData.chest;
  var chestQ_world = spineChestData.q_world;

  // ─── Neck / Head ───
  var neckHeadData = computeNeckHead(kps, chestQ_world);
  result['neck'] = neckHeadData.neck;
  result['head'] = neckHeadData.head;

  // ─── Brazos ───
  var leftArm  = computeArm('L', kps, chestQ_world);
  var rightArm = computeArm('R', kps, chestQ_world);
  for (var bn in leftArm.bones)  result[bn] = leftArm.bones[bn];
  for (var bn in rightArm.bones) result[bn] = rightArm.bones[bn];

  // ─── Piernas ───
  var leftLeg  = computeLeg('L', kps, hipsQ_world);
  var rightLeg = computeLeg('R', kps, hipsQ_world);
  for (var bn in leftLeg)  result[bn] = leftLeg[bn];
  for (var bn in rightLeg) result[bn] = rightLeg[bn];

  // ─── Dedos ───
  if (handLeft && handLeft.worldLandmarks) {
    var leftFingers = computeFingers(
      filterHandLandmarks(handLeft.worldLandmarks, 'Left'), 'L', isVRM1
    );
    for (var bn in leftFingers) result[bn] = leftFingers[bn];
  }
  if (handRight && handRight.worldLandmarks) {
    var rightFingers = computeFingers(
      filterHandLandmarks(handRight.worldLandmarks, 'Right'), 'R', isVRM1
    );
    for (var bn in rightFingers) result[bn] = rightFingers[bn];
  }

  return result;
}
```

#### Paso 2.2.11 — API público

```js
window.VRMDirectPoseSolver = {
  solveFromLandmarks: solveFromLandmarks,
  // Exposición de filtros para calibración en runtime
  getBodyFilters: function() { return _bodyFilters; },
  getHandFilters: function() { return _handFilters; }
};
```

---

### Tarea 2.3 — Conectar pose solver al tick del animator

**Archivo**: `js/vrm-direct/vrm-direct-animator.js`

En `tick()`, agregar al principio (antes de `solveBody()`):
```js
// ─── Si el pose solver propio está disponible, usarlo ───
if (window.VRMDirectPoseSolver && window.VRMDirectSolver) {
  var rawKps = null, handL = null, handR = null;
  try {
    rawKps = System._browser.camera.poseNet.frames._raw_keypoints3D;
  } catch(e) {}
  try {
    var hp = System._browser.camera.handpose;
    if (hp) {
      hp.forEach(function(h) {
        if (h.label === 'Left')  handL = h;
        if (h.label === 'Right') handR = h;
      });
    }
  } catch(e) {}

  if (rawKps) {
    VRMDirectSolver._poseFrames = VRMDirectPoseSolver.solveFromLandmarks(
      rawKps, handL, handR, _handle.isVRM1
    );
  }
}
```

---

### Tarea 2.4 — Cargar `vrm-direct-pose-solver.js`

El archivo se carga DESPUÉS de `one_euro_filter.js` y ANTES de `vrm-direct-animator.js`.

En `js/core_extra.js` (o donde se carguen los scripts de vrm-direct), buscar la carga de:
```js
'js/vrm-direct/vrm-direct-solver.js'
```

Y agregar antes del animator:
```js
'js/vrm-direct/vrm-direct-pose-solver.js'
```

---

### Verificación Fase 2

1. `console.log(VRMDirectSolver._poseFrames)` — debe tener ≥ 25 huesos en cada frame
2. Comparar visual con Fase 1 (`frames.skin`): movimiento similar
3. Testear: levantar brazos, agacharse, girar cabeza, mover dedos
4. Comentar temporalmente `SA_system_emulation.min.js` y verificar que el VRM sigue funcionando
5. Benchmark CPU (DevTools Performance): diferencia < 5ms/frame es aceptable

---

## FASE 3 — Limpieza final

Una vez Fase 1 + 2 estables y confirmadas:

1. Remover carga de `SA_system_emulation.min.js` del HTML (verificar que ningún otro sistema lo necesite)
2. Eliminar fallback legacy en `getMMDBones()` (bloque jThree)
3. Eliminar `VRMDirectSolver._autoAnimSnapshot` del API público y el snapshot de `threex-vrm.js`
4. Evaluar si `MMD_SA` puede desactivarse completamente

---

## Archivos a modificar / crear (en orden)

| Orden | Archivo | Fase | Tipo | Descripción del cambio |
|---|---|---|---|---|
| 1 | `js/vrm-direct/vrm-direct-loader.js` | 1 | Modificar | `_getTHREE`, `_getScene`, `createLoader`, `_createOwnRenderer`, hardcodear AO_MASK |
| 2 | `js/vrm-direct/vrm-direct-main.js` | 1 | Modificar | Quitar gate MMD scene, reemplazar `jThree_ready` con `_tryAutoEnable` |
| 3 | `js/vrm-direct/vrm-direct-animator.js` | 1 | Modificar | RAF propio fallback, position sync opcional, render call, dt en solveAutoAnim |
| 4 | `js/vrm-direct/vrm-direct-solver.js` | 1+2 | Modificar | `_getTHREE`, `getMMDBones` con 3 niveles, `_wrapFramesSkin`, `solveAutoAnim` con blink interno, `_poseFrames` |
| 5 | `js/tracking/mocap-pose-processor.js` | 2 | Modificar | Exponer `_raw_keypoints3D` |
| 6 | `js/tracking/mocap-hands-processor.js` | 2 | Modificar | Verificar/exponer `worldLandmarks` |
| 7 | `js/vrm-direct/vrm-direct-pose-solver.js` | 2 | **Crear** | IK math completo (BlazePose → quaterniones VRM) |
| 8 | Cargador de scripts (core_extra.js o similar) | 2 | Modificar | Agregar carga de `vrm-direct-pose-solver.js` |

---

## Riesgos y mitigación

| Riesgo | Prob | Mitigación |
|---|---|---|
| `frames.skin` no tiene los huesos necesarios | Media | Verificar `Object.keys(frames.skin)` antes de cambiar |
| Coordenadas de `frames.skin` en espacio MMD ≠ VRM Direct | Alta | `flipForMeshRotation` ya en `solveBody()` — verificar que sigue aplicando al leer frames.skin |
| Landmarks crudos `_raw_keypoints3D` no disponibles | Media | Agregar exposición en Paso 2.1.2 |
| `VRMLoaderPlugin` no disponible como global standalone | Media | Verificar antes del load; documentar imports necesarios |
| Rendimiento del pose solver propio | Baja | OneEuroFilter por landmark es O(N), < 2ms/frame |
| Auto-blink desfasado con face tracking | Baja | Ajustar `blinkInterval`/`blinkDuration` en runtime |

---

## Estado por feature en cada etapa

| Feature | Ahora | Fase 1 | Fase 2 |
|---|---|---|---|
| Face / ARKit blendshapes | ✅ Independiente | ✅ Sin cambios | ✅ Sin cambios |
| Auto-blink | ✅ via threex-vrm.js | ✅ Timer interno propio | ✅ Timer interno |
| Body tracking | ✅ via jThree bones_by_name | ✅ via frames.skin (SA core) | ✅ via pose solver propio |
| Manos / dedos | ✅ via jThree bones_by_name | ✅ via frames.skin | ✅ via landmarks crudos |
| Spring bones VRM (cabello, ropa) | ✅ three-vrm nativo | ✅ sin cambios | ✅ sin cambios |
| Loop de render | ❌ SA scheduler (MMD) | ✅ RAF propio (fallback) | ✅ RAF propio |
| Escena / Renderer | ❌ MMD_SA.THREEX | ✅ Propio si MMD ausente | ✅ Propio |
| Dep. de jThree | ❌ Requerida | ✅ Eliminada | ✅ Eliminada |
| Dep. de SA_system_emulation | ❌ Requerida | ❌ Aún necesaria | ✅ Eliminada |
