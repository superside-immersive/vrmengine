# Fase 3 — Checklist manual (tracking MediaPipe)

## Precondición
- Servidor corriendo: `python3 nocache_server.py 8080`
- URL: `http://127.0.0.1:8080/redux/XR_Animator.html`
- Preflight automático OK: `bash redux/scripts/phase3_preflight.sh`

## Smoke test manual
1. Abrir `redux/XR_Animator.html`.
2. Habilitar cámara en el navegador.
3. Activar tracking (pose/manos/cara) desde la UI.
4. Mover cuerpo, manos y rostro durante 20-30s.
5. Verificar que el avatar siga landmarks sin freeze.
6. Verificar smoothing activo (sin jitter excesivo).
7. Revisar consola: sin errores críticos de carga/modelo/worker.

## Criterio de salida de Fase 3
- Pose, manos y cara funcionales.
- Smoothing/filtros activos y estables.
- Sin errores críticos en consola.

## Registro sugerido en `redux/PHASE_LOG.md`
```md
### Fase 3 — Tracking Holistic + filtros
- Resultado: completada.
- Evidencia: smoke manual con cámara OK (pose/manos/cara + smoothing).
- Riesgos detectados: [si aplica].
```
