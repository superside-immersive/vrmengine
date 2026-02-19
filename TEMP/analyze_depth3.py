#!/usr/bin/env python3
"""Find what property each target section belongs to and cross-references."""
import re

with open('js/dungeon.js', 'r') as f:
    lines = f.readlines()

# Compute depth at each line
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

# Show lines at depth 2 (return object properties) near each target section
print("=== Property context at depth 2 near motion definitions (8600-8680) ===")
for ln in range(8600, 8680):
    if depth_at_line[ln] == 2:
        text = lines[ln-1].rstrip()[:100]
        if text.strip():
            print(f"  {ln}: {text}")

print("\n=== Property context at depth 2 near events (11280-11340) ===")
for ln in range(11280, 11340):
    if depth_at_line[ln] == 2:
        text = lines[ln-1].rstrip()[:100]
        if text.strip():
            print(f"  {ln}: {text}")

print("\n=== Property context at depth 2 near multiplayer (12830-12850) ===")
for ln in range(12830, 12860):
    if depth_at_line[ln] == 2:
        text = lines[ln-1].rstrip()[:100]
        if text.strip():
            print(f"  {ln}: {text}")

print("\n=== Property context at depth 2 near utils (13520-13560) ===")
for ln in range(13500, 13560):
    if depth_at_line[ln] == 2:
        text = lines[ln-1].rstrip()[:100]
        if text.strip():
            print(f"  {ln}: {text}")

# Check: vars from sub-IIFEs in the events/dialogue section (11320-12830)
# that might be referenced elsewhere
print("\n=== Var declarations at depth <= 3 in events section (11320-12830) ===")
for ln in range(11320, 12830):
    if depth_at_line[ln] <= 3:
        text = lines[ln-1].rstrip()
        stripped = text.lstrip()
        if re.match(r'^(var |function |const |let )', stripped):
            print(f"  {ln}: depth={depth_at_line[ln]}  {text[:100]}")

# Check for variables in the multiplayer sub-IIFE (12839-13510) at low depth
print("\n=== Var declarations at depth <= 3 in multiplayer section (12839-13510) ===")
for ln in range(12839, 13510):
    if depth_at_line[ln] <= 3:
        text = lines[ln-1].rstrip()
        stripped = text.lstrip()
        if re.match(r'^(var |function |const |let )', stripped):
            print(f"  {ln}: depth={depth_at_line[ln]}  {text[:100]}")
