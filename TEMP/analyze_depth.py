#!/usr/bin/env python3
"""Analyze brace depth in dungeon.js to find true IIFE-top-level declarations."""
import re
import sys

with open('js/dungeon.js', 'r') as f:
    lines = f.readlines()

depth = 0
in_string = False
string_char = None
escape_next = False
in_block_comment = False
results = []

for line_num, line in enumerate(lines, 1):
    # Track depth at start of line
    line_depth = depth

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

        # Block comment handling
        if in_block_comment:
            if ch == '*' and i + 1 < len(line) and line[i + 1] == '/':
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_string:
            if ch == string_char:
                # For template literals, don't end on ${
                in_string = False
            i += 1
            continue

        # Check for comments
        if ch == '/' and i + 1 < len(line):
            if line[i + 1] == '/':
                break  # rest of line is comment
            if line[i + 1] == '*':
                in_block_comment = True
                i += 2
                continue

        # Check for regex - skip simple cases
        # (this is imperfect but good enough)

        if ch in ('"', "'", '`'):
            in_string = True
            string_char = ch
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1

        i += 1

    # Check if line has a declaration at depth 1 (inside main IIFE only)
    stripped = line.lstrip()
    if line_depth == 1 and re.match(r'^(var |function |class |const |let )', stripped):
        results.append((line_num, line.rstrip()))

print(f"=== IIFE Top-Level Declarations (brace depth 1) ===")
print(f"Found {len(results)} declarations\n")
for line_num, text in results:
    print(f"  {line_num}: {text}")
