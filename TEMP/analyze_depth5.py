#!/usr/bin/env python3
"""Check init: locals before 8660 and their usage in target sections."""
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

# init: starts at line 3456, depth 2
# Inside init:, depth is 3
# Find all depth-3 var/function declarations in init BEFORE line 8660
print("=== init: method locals (depth 3) declared before 8660 ===")
init_vars = []
for ln in range(3456, 8660):
    if depth_at_line[ln] == 3:
        text = lines[ln-1].rstrip()
        stripped = text.lstrip()
        if re.match(r'^(var |function |const |let )', stripped):
            # Extract variable name
            m = re.match(r'^(?:var|function|const|let)\s+(\w+)', stripped)
            if m:
                name = m.group(1)
                init_vars.append((ln, name, text[:100]))
                print(f"  {ln}: {text[:100]}")

# Now check which of those are referenced in target sections
print(f"\n=== Checking {len(init_vars)} init locals against target sections ===")
for ln, name, text in init_vars:
    refs = []
    for section_name, start, end in [
        ("motion", 8660, 11140),
        ("events", 11320, 12830),
        ("multiplayer", 12839, 13510),
        ("utils", 13535, 14042)
    ]:
        for sln in range(start, end):
            if re.search(r'\b' + re.escape(name) + r'\b', lines[sln-1]):
                refs.append(f"{section_name}:{sln}")
    if refs:
        print(f"  L{ln} '{name}' -> {', '.join(refs[:10])}")

# Where does init: end?
print("\n=== Where does init: method end? ===")
# After init starts at 3456 (depth 2 -> 3 on {), find where depth returns to 2
in_init = False
for ln in range(3457, 14070):
    if depth_at_line[ln] == 2 and depth_at_line[ln-1] == 3:
        # Check if this is a closing brace
        text = lines[ln-1].rstrip()
        if text.strip().startswith('}'):
            print(f"  init: possibly ends around line {ln}: {text[:80]}")
            # Check next few lines to confirm
            for k in range(ln, min(ln+5, 14070)):
                print(f"    {k}: depth={depth_at_line[k]}  {lines[k-1].rstrip()[:80]}")
            break
