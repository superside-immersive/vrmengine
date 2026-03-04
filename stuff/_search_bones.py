#!/usr/bin/env python3
"""Search SA_system_emulation.min.js for bone computation patterns."""
import re
import sys

with open('redux/js/SA_system_emulation.min.js', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File length: {len(content)} chars")
print()

patterns = [
    # Japanese bone names
    ('センター', 'center bone'),
    ('上半身', 'upper body/spine'),
    ('下半身', 'lower body/hips'),
    ('首', 'neck'),
    ('頭', 'head'),
    ('右腕', 'right arm'),
    ('左腕', 'left arm'),
    ('右ひじ', 'right elbow'),
    ('左ひじ', 'left elbow'),
    ('右手首', 'right wrist'),
    ('左手首', 'left wrist'),
    ('右肩', 'right shoulder'),
    ('左肩', 'left shoulder'),
    ('右足', 'right leg/foot'),
    ('左足', 'left leg/foot'),
    ('右ひざ', 'right knee'),
    ('左ひざ', 'left knee'),
    ('右足首', 'right ankle'),
    ('左足首', 'left ankle'),
    ('右足ＩＫ', 'right foot IK'),
    ('左足ＩＫ', 'left foot IK'),
    # Finger bones
    ('親指', 'thumb'),
    ('人指', 'index finger'),
    ('中指', 'middle finger'),
    ('薬指', 'ring finger'),
    ('小指', 'pinky finger'),
]

for pat, desc in patterns:
    matches = list(re.finditer(re.escape(pat), content))
    print(f'=== {pat} ({desc}) === {len(matches)} matches')
    for m in matches:
        s = max(0, m.start() - 200)
        e = min(len(content), m.end() + 200)
        snippet = content[s:e]
        # Mark the match
        rel_start = m.start() - s
        rel_end = m.end() - s
        marked = snippet[:rel_start] + '>>>' + snippet[rel_start:rel_end] + '<<<' + snippet[rel_end:]
        print(f'  @char_offset {m.start()}:')
        print(f'    {repr(marked)}')
    print()
