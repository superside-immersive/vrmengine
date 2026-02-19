#!/usr/bin/env python3
"""Find depth-3 vars in motion section and trace init: property."""
import re

with open('js/dungeon.js', 'r') as f:
    lines = f.readlines()

# Compute depth
depth = 0
in_string = False
string_char = None
escape_next = False
in_block_comment = False
depth_at_line = {}

for line_num, line in enumerate(lines, 1):
    depth_at_line[line_num] = depth
    i = 0
    while i < len(line):
        ch = line[i]
        if escape_next:
            escape_next = False; i += 1; continue
        if ch == '\\':
            if in_string: escape_next = True
            i += 1; continue
        if in_block_comment:
            if ch == '*' and i+1 < len(line) and line[i+1] == '/':
                in_block_comment = False; i += 2; continue
            i += 1; continue
        if in_string:
            if ch == string_char: in_string = False
            i += 1; continue
        if ch == '/' and i+1 < len(line):
            if line[i+1] == '/': break
            if line[i+1] == '*':
                in_block_comment = True; i += 2; continue
        if ch in ('"', "'", '`'):
            in_string = True; string_char = ch
        elif ch == '{': depth += 1
        elif ch == '}': depth -= 1
        i += 1

# Find the init: property - look for depth 2 lines with "init" before line 8660
print("=== Looking for 'init' property definition (depth 2) ===")
for ln in range(1, 8660):
    if depth_at_line[ln] == 2:
        text = lines[ln-1].rstrip()
        if 'init' in text.lower() and ':' in text:
            print(f"  {ln}: {text[:120]}")

# Show depth-3 vars in motion section 
print("\n=== Var declarations at depth <= 4 in motion section (8660-11140) ===")
for ln in range(8660, 11140):
    if depth_at_line[ln] <= 4:
        text = lines[ln-1].rstrip()
        stripped = text.lstrip()
        if re.match(r'^(var |function |const |let )', stripped):
            print(f"  {ln}: depth={depth_at_line[ln]}  {text[:100]}")

# Show depth-3 vars in utils section
print("\n=== Var declarations at depth <= 3 in utils section (13535-14042) ===")
for ln in range(13535, 14042):
    if depth_at_line[ln] <= 3:
        text = lines[ln-1].rstrip()
        stripped = text.lstrip()
        if re.match(r'^(var |function |const |let )', stripped):
            print(f"  {ln}: depth={depth_at_line[ln]}  {text[:100]}")

# Check: does the events section (11320-12830) reference _jump_physics or _bb_xz_factor_?
print("\n=== Events section refs to closure vars ===")
for ln in range(11320, 12830):
    text = lines[ln-1]
    if '_jump_physics' in text or '_bb_xz_factor_' in text or 'CombatStats' in text or 'AreaDataSaved' in text:
        print(f"  {ln}: {text.rstrip()[:100]}")

# Check: does the multiplayer section reference closure vars?
print("\n=== Multiplayer section refs to closure vars ===")
for ln in range(12839, 13510):
    text = lines[ln-1]
    if '_jump_physics' in text or '_bb_xz_factor_' in text or 'CombatStats' in text or 'AreaDataSaved' in text:
        print(f"  {ln}: {text.rstrip()[:100]}")

# Check: does the utils section reference closure vars?
print("\n=== Utils section refs to closure vars ===")
for ln in range(13535, 14042):
    text = lines[ln-1]
    if '_jump_physics' in text or '_bb_xz_factor_' in text or 'CombatStats' in text or 'AreaDataSaved' in text:
        print(f"  {ln}: {text.rstrip()[:100]}")
