#!/usr/bin/env python3
"""Check brace depth at specific lines and find sub-IIFE boundaries."""
import re

with open('js/dungeon.js', 'r') as f:
    lines = f.readlines()

# Track depth at key lines
check_lines = [8660, 8779, 8824, 10784, 10819, 11140, 11320, 12830, 12839, 13510, 13535, 14042]

depth = 0
in_string = False
string_char = None
escape_next = False
in_block_comment = False

# Track depth at every line
depth_at_line = {}

for line_num, line in enumerate(lines, 1):
    depth_at_line[line_num] = depth

    i = 0
    while i < len(line):
        ch = line[i]

        if escape_next:
            escape_next = False
            i += 1
            continue

        if ch == '\\':
            if in_string:
                escape_next = True
            i += 1
            continue

        if in_block_comment:
            if ch == '*' and i + 1 < len(line) and line[i + 1] == '/':
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_string:
            if ch == string_char:
                in_string = False
            i += 1
            continue

        if ch == '/' and i + 1 < len(line):
            if line[i + 1] == '/':
                break
            if line[i + 1] == '*':
                in_block_comment = True
                i += 2
                continue

        if ch in ('"', "'", '`'):
            in_string = True
            string_char = ch
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1

        i += 1

print("=== Brace depth at target section boundaries ===")
for ln in check_lines:
    text = lines[ln-1].rstrip()[:80]
    print(f"  Line {ln}: depth={depth_at_line[ln]}  {text}")

print("\n=== Brace depth at _jump_physics references ===")
for ln in [8779, 8824, 8825, 8826, 10784, 10808, 10819]:
    text = lines[ln-1].rstrip()[:80]
    print(f"  Line {ln}: depth={depth_at_line[ln]}  {text}")

# Find sub-IIFE boundaries (function expressions followed by ()) in the range 8000-14070
print("\n=== Sub-IIFE patterns in target range ===")
for ln in range(8000, 14070):
    line = lines[ln-1]
    if re.search(r'\(function\s*\(', line) and depth_at_line[ln] <= 3:
        text = line.rstrip()[:100]
        print(f"  Line {ln}: depth={depth_at_line[ln]}  {text}")

# Find which depth the _jump_physics calls are at relative to any enclosing function
print("\n=== Look for enclosing function of _jump_physics refs ===")
# Check lines around 8779 to understand the context
for ln in range(8750, 8790):
    text = lines[ln-1].rstrip()[:100]
    d = depth_at_line[ln]
    if d <= 4:
        print(f"  Line {ln}: depth={d}  {text}")
