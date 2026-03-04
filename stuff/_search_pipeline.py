#!/usr/bin/env python3
"""Search for arm/elbow IK solve, shoulder, and VMC patterns."""
import re

with open('redux/js/SA_system_emulation.min.js', 'r', encoding='utf-8') as f:
    content = f.read()

patterns = [
    (r'setFromVectorSpherical', 'vector to spherical'),
    (r'toSphericalCoords', 'to spherical coords'),
    (r'atan2', 'atan2 angle calc'),
    (r'angleTo', 'angleTo'),
    (r'toAxisAngle', 'toAxisAngle'),
    (r'VMC_receiver', 'VMC protocol receiver'),
    (r'bone_map_VRM_to_MMD', 'VRM to MMD bone mapping'),
    (r'convert_T_pose', 'T-pose conversion'),
    (r'convert_A_pose', 'A-pose conversion'),
    (r'全ての親', 'root bone (all parents)'),
    (r'kps3d|keypoints3d|kps_3d', 'lowercase keypoints3d variants'),
    (r'SA_camera_poseNet_update', 'pose update event'),
    (r'worker_onmessage', 'worker onmessage handler'),
    (r'hip_adjustment', 'hip adjustment algorithm'),
    (r'motion_tracking_upper_body_only', 'upper body only mode'),
]

for pat_str, desc in patterns:
    flags = re.IGNORECASE if 'kps3d' in pat_str else 0
    matches = list(re.finditer(pat_str, content, flags))
    if not matches:
        print(f'=== {pat_str} ({desc}) === 0 matches')
        print()
        continue
    print(f'=== {pat_str} ({desc}) === {len(matches)} matches')
    shown = matches[:5] if len(matches) > 5 else matches
    for m in shown:
        s = max(0, m.start() - 150)
        e = min(len(content), m.end() + 150)
        snippet = content[s:e]
        rel_start = m.start() - s
        rel_end = m.end() - s
        marked = snippet[:rel_start] + '>>>' + snippet[rel_start:rel_end] + '<<<' + snippet[rel_end:]
        print(f'  @{m.start()}:')
        print(f'    {repr(marked[:400])}')
    if len(matches) > 5:
        print(f'  ... and {len(matches)-5} more matches')
    print()
