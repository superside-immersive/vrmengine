#!/usr/bin/env python3
"""Extract events_default entries (pre-FACEMESH_OPTIONS) from animate.js."""
import os

SRC = 'animate.js'
MODULES_DIR = 'modules'

with open(SRC, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# events_default: { is at line 909. Entries start at line 910.
# _FACEMESH_OPTIONS_ starts at line 1738.
# The entries before it end at line 1737 (or 1736 if 1737 is blank).
# We extract lines 910-1737 as the content.

start, end = 910, 1737
chunk_lines = lines[start-1:end]

# Fix first entry: remove leading comma/space if needed
if chunk_lines and chunk_lines[0].lstrip().startswith('"'):
    pass  # already OK, first entry of events_default
elif chunk_lines and chunk_lines[0].lstrip().startswith(','):
    idx = chunk_lines[0].index(',')
    chunk_lines[0] = chunk_lines[0][:idx] + ' ' + chunk_lines[0][idx+1:]

fname = 'events-default-base.js'
out_path = os.path.join(MODULES_DIR, fname)
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(f'// {fname} — events_default: SELFIE, ENTER_AR, FACEMESH, VMC, RECORDER\n')
    f.write(f'// Extracted from animate.js\n')
    f.write('(function () {\n')
    f.write('  if (!MMD_SA_options.Dungeon_options) return;\n')
    f.write('  Object.assign(MMD_SA_options.Dungeon_options.events_default, {\n')
    for line in chunk_lines:
        f.write(line)
    f.write('\n  });\n')
    f.write('})();\n')

line_count = end - start + 1 + 7
print(f'{fname}: {line_count} lines')

# Now modify animate.js: remove lines 910-1737, keep events_default: {}
# Line 909: ` ,events_default: {`
# We want ` ,events_default: {}`
# Line 1738: `   ,"_FACEMESH_OPTIONS_": ...`

before = lines[:908]       # lines 1-908
remaining = lines[1737:]   # from _FACEMESH_OPTIONS_ onwards

# Replace events_default content
new_content = before
new_content.append(' ,events_default: {\n')
new_content.extend(remaining)

with open(SRC, 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print(f'animate.js: {len(lines)} -> {len(new_content)} lines (removed {len(lines) - len(new_content)})')
print('Done.')
