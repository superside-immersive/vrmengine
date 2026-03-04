#!/usr/bin/env python3
"""Search SA_system_emulation.min.js for math/pipeline patterns."""
import re

with open('redux/js/SA_system_emulation.min.js', 'r', encoding='utf-8') as f:
    content = f.read()

patterns = [
    # Math patterns
    (r'setFromAxisAngle', 'setFromAxisAngle'),
    (r'setFromEuler', 'setFromEuler'),
    (r'setFromUnitVectors', 'setFromUnitVectors'),
    (r'setFromRotationMatrix', 'setFromRotationMatrix'),
    (r'lookAt', 'lookAt'),
    (r'slerp', 'slerp'),
    # IK
    (r'_update_IK', 'IK update'),
    (r'enable_IK', 'IK enable'),
    (r'足ＩＫ', 'foot IK'),
    (r'腕ＩＫ', 'arm IK'),
    (r'つま先ＩＫ', 'toe IK'),
    # Filtering
    (r'one_euro', 'one euro filter'),
    (r'OneEuro', 'OneEuro filter'),
    (r'data_filter', 'data filter'),
    # Input pipeline
    (r'keypoints3D', 'keypoints3D'),
    (r'kps3D', 'kps3D'),
    (r'keypoints', 'keypoints'),
    (r'poseLandmarks', 'poseLandmarks'),
    (r'worldLandmarks', 'worldLandmarks'),
    (r'posenet', 'posenet'),
    (r'poseNet', 'poseNet'),
    (r'onmessage', 'onmessage'),
    (r'process_bones', 'process_bones'),
    (r'process_rotation', 'process_rotation'),
    (r'process_position', 'process_position'),
]

for pat_str, desc in patterns:
    matches = list(re.finditer(pat_str, content))
    if not matches:
        print(f'=== {pat_str} ({desc}) === 0 matches')
        print()
        continue
    print(f'=== {pat_str} ({desc}) === {len(matches)} matches')
    # Show first 5 matches only for very common patterns
    shown = matches[:8] if len(matches) > 8 else matches
    for m in shown:
        s = max(0, m.start() - 150)
        e = min(len(content), m.end() + 150)
        snippet = content[s:e]
        rel_start = m.start() - s
        rel_end = m.end() - s
        marked = snippet[:rel_start] + '>>>' + snippet[rel_start:rel_end] + '<<<' + snippet[rel_end:]
        print(f'  @{m.start()}:')
        print(f'    {repr(marked[:400])}')
    if len(matches) > 8:
        print(f'  ... and {len(matches) - 8} more matches')
    print()
