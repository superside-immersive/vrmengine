# Redux Migration Guide (XR Animator limpio)

## Objetivo
Construir una versión limpia en `redux/` manteniendo:
- Tracking MediaPipe Holistic con filtros/smoothing actuales
- Avatar VRM 3D con Three.js + spring bones
- Menús de configuración de tracking/cámara
- Envío VMC (modo Electron)

Excluir:
- Juegos/dungeon
- Efectos extra no requeridos
- Galerías/imágenes/VRM no usados

## Reglas de ejecución (obligatorias)
1. Trabajar por fases pequeñas y reversibles.
2. Al finalizar cada fase: prueba rápida + registro en bitácora + checkpoint git.
3. Si una fase falla, rollback inmediato al checkpoint anterior.
4. No borrar del árbol original hasta validar aislamiento total de `redux/`.
5. Ningún archivo en `redux/` puede depender de rutas fuera de `redux/`.

## Fases

### Fase 0 — Baseline y control
- Confirmar estado de arranque actual (`XR_Animator.html`) y puertos.
- Registrar estado inicial y riesgos.
- Crear checkpoint inicial.

**Criterio de salida:** baseline confirmado + bitácora completada.

### Fase 1 — Scaffold mínimo de redux
- Crear `redux/`.
- Copiar entrypoint y bootstrap mínimo:
  - `XR_Animator.html`
  - `css/main.css`
  - `js/globals.js`
  - `js/module-loader.js`
  - `js/core.js`
  - `js/core_extra.js`
- Verificar que `redux/XR_Animator.html` responde 200.

**Criterio de salida:** scaffold mínimo accesible sin romper el árbol original.

### Fase 2 — Runtime core dinámico
- Migrar dependencias requeridas por:
  - `js/SA_system_emulation.min.js`
  - `js/SA_system_emulation_ext.js`
  - `js/_SA.js`
- Mantener estructura de rutas relativas para carga dinámica.

**Criterio de salida:** app arranca en `redux` y crea UI base.

### Fase 3 — Tracking Holistic + filtros
- Migrar `js/mocap_lib_module.js` y `js/tracking/**`.
- Conservar workers, one euro filter y opciones holistic/landmarker.

**Criterio de salida:** pose/manos/cara funcionando con smoothing.

### Fase 4 — VRM + Three + GUI + spring bones
- Migrar núcleo 3D:
  - `MMD.js/MMD_SA.js`
  - `js/mmd/defaults.js`
  - `js/mmd/threex-*.js`
  - `three.js/**`
- Mantener menús de configuración relevantes.

**Criterio de salida:** VRM renderizado + spring bones + ajustes GUI.

### Fase 5 — VRM default + fallback sin tracking
- Incluir VRM default actual y animaciones fallback.
- Configurar comportamiento por defecto sin tracking activo.

**Criterio de salida:** fallback funcional + override por tracking activo.

### Fase 6 — VMC sender (Electron)
- Migrar `js/mmd/osc.js` y flujo Electron (`js/electron_main.js`, preload, deps).
- Validar sender y menú OSC/VMC.

**Criterio de salida:** envío VMC operativo en Electron.

### Fase 7 — Poda por bloques
Eliminar en bloques separados (con prueba entre bloques):
1. demos HTML no XR
2. dungeon/juego
3. VFX no requeridos
4. assets extra

**Criterio de salida:** core intacto tras cada poda.

### Fase 8 — Aislamiento total
- Barrido de referencias fuera de `redux/` (imports, workers, fetch, loadScript).
- Prueba de independencia real.

**Criterio de salida:** `redux` corre solo.

## Protocolo de verificación por fase
1. Respuesta HTTP 200 del entrypoint en `redux`.
2. Consola sin errores críticos de carga.
3. Smoke test de feature objetivo de fase.
4. Registro de resultado en bitácora.
5. Checkpoint git.

## Plantilla de bitácora (copiar por fase)
```md
### Fase X — [nombre]
- Objetivo:
- Archivos tocados:
- Comandos de prueba:
- Resultado:
- Riesgos detectados:
- Checkpoint:
- Rollback aplicado: Sí/No
```

## Estado actual
- Fuente de verdad operativa: **`INSTRUCCIONES.md`** (estado vivo, setup y reglas de continuidad).
- Fases completadas: **Fase 0, Fase 1, Fase 2**.
- Fase activa: **Fase 3 — Verificar tracking MediaPipe Holistic + filtros**.
- Próximo paso inmediato: smoke test con cámara (pose/manos/cara + smoothing) y registro en `redux/PHASE_LOG.md`.
