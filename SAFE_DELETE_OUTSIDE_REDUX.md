# Safe delete fuera de `redux` (modo XR-only)

Este repo ya está preparado para correr por:

- `http://127.0.0.1:8080/redux/XR_Animator.html`

Si ese es tu único objetivo, podés borrar casi todo lo demás.

## Mantener (mínimo recomendado)

- `redux/`
- `nocache_server.py` (opcional, pero recomendado para servir sin caché)
- `.git/` (si querés conservar historial git)
- `SAFE_DELETE_OUTSIDE_REDUX.md` (este archivo)

## Opcional mantener

- `INSTRUCCIONES.md`
- `docs/REDUX_MIGRATION_GUIDE.md`
- `redux/PHASE_LOG.md`
- `redux/PRUNING_NOTES.md`

## Borrado seguro (dry-run primero)

Desde la raíz del proyecto:

```bash
cd /Users/mpalenque/demobodytracking/SystemAnimatorOnline

# 1) Ver qué se borraría (dry-run)
find . -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name 'redux' \
  ! -name 'nocache_server.py' \
  ! -name 'SAFE_DELETE_OUTSIDE_REDUX.md' \
  -print
```

Si la lista te cierra, ejecutar borrado real:

```bash
find . -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name 'redux' \
  ! -name 'nocache_server.py' \
  ! -name 'SAFE_DELETE_OUTSIDE_REDUX.md' \
  -exec rm -rf {} +
```

## Verificación después de borrar

```bash
python3 nocache_server.py 8080
```

En otra terminal:

```bash
curl -s -o /dev/null -w "XR:%{http_code}\n" http://127.0.0.1:8080/redux/XR_Animator.html
```

Debe devolver `XR:200`.
