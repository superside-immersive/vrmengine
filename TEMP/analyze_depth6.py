#!/usr/bin/env python3
"""Find where init: method actually ends."""
import re

with open('js/dungeon.js', 'r') as f:
    lines = f.readlines()

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

# Find ALL depth=2 lines between 3456 and 14070 (these are return object properties, outside init:)
print("=== All depth=2 non-empty lines after init: starts (3456-14069) ===")
for ln in range(3457, 14070):
    if depth_at_line[ln] == 2:
        text = lines[ln-1].rstrip()
        if text.strip() and not text.strip().startswith('//'):
            print(f"  {ln}: {text[:120]}")
