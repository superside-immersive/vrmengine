#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8080}"
RUN_VRM_CHECK="${RUN_VRM_CHECK:-1}"

URLS=(
  "$BASE_URL/redux/XR_Animator.html"
  "$BASE_URL/redux/js/mocap_lib_module.js"
  "$BASE_URL/redux/js/tracking/mocap-mediapipe-bridge.js"
  "$BASE_URL/redux/js/tracking/one_euro_filter.js"
  "$BASE_URL/redux/js/@mediapipe/tasks/pose_landmarker_full.task"
  "$BASE_URL/redux/js/@mediapipe/tasks/face_landmarker.task"
  "$BASE_URL/redux/js/@mediapipe/tasks/hand_landmarker.task"
  "$BASE_URL/redux/js/@mediapipe/tasks/tasks-vision/wasm/vision_wasm_internal.wasm"
)

echo "[Phase3 Preflight] BASE_URL=$BASE_URL"

ALL_OK=1
for url in "${URLS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  printf "%s %s\n" "$code" "$url"
  if [[ "$code" != "200" ]]; then
    ALL_OK=0
  fi
done

if [[ "$ALL_OK" -ne 1 ]]; then
  echo "[Phase3 Preflight] FAIL: hay endpoints no-200"
  exit 1
fi

echo "[Phase3 Preflight] OK: todos los endpoints críticos responden 200"

if [[ "$RUN_VRM_CHECK" == "1" ]]; then
  echo "[Phase3 Preflight] VRM console-check: buscando [XRA][VRM_LOADED]"
  node redux/scripts/vrm_console_check.mjs "$BASE_URL/redux/XR_Animator.html"
  echo "[Phase3 Preflight] VRM console-check OK"
fi

exit 0
