#!/usr/bin/env python3
"""Map animate.js structure for Ronda 3+4 planning."""
import re

lines = open('redux/images/XR Animator/animate.js').readlines()
total = len(lines)
print(f"Total lines: {total}")

# 1. Find motion array boundaries
motion_start = None
motion_end = None
for i, l in enumerate(lines):
    if ',motion: [' in l or 'motion: [' in l:
        motion_start = i + 1
    if motion_start and l.strip() == ']' and i > 150:
        motion_end = i + 1
        break
print(f"\nMotion catalog: lines {motion_start}-{motion_end}")

# Count motion entries and types
f_paths = 0
zip_paths = 0
must_load = 0
for i in range(motion_start - 1, motion_end):
    l = lines[i]
    if 'path:' in l:
        if "F:\\" in l or "C:\\" in l:
            f_paths += 1
        if '.zip#' in l:
            zip_paths += 1
        if 'must_load' in l:
            must_load += 1
print(f"  F:\\ paths: {f_paths}, zip paths: {zip_paths}, must_load: {must_load}")

# 2. Find motion_para boundaries using brace counting
mp_start = None
for i, l in enumerate(lines):
    if ',motion_para:' in l or 'motion_para:' in l:
        mp_start = i
        break

if mp_start:
    depth = 0
    mp_end = None
    for i in range(mp_start, total):
        depth += lines[i].count('{') - lines[i].count('}')
        if depth <= 0 and i > mp_start + 5:
            mp_end = i + 1
            break
    print(f"\nmotion_para: lines {mp_start+1}-{mp_end} ({mp_end - mp_start} lines)")

# 3. Find Dungeon_options
dopt_start = None
for i, l in enumerate(lines):
    if 'Dungeon_options:' in l and i > 3000:
        dopt_start = i
        break

dopt_end = None
if dopt_start:
    depth = 0
    started = False
    for i in range(dopt_start, total):
        depth += lines[i].count('{') - lines[i].count('}')
        if depth > 0:
            started = True
        if started and depth <= 0:
            dopt_end = i + 1
            break
    print(f"\nDungeon_options: lines {dopt_start+1}-{dopt_end} ({dopt_end - dopt_start if dopt_end else '?'} lines)")
else:
    print("\nDungeon_options: NOT FOUND")

# 4. Find item_base entries within Dungeon_options
print("\nitem_base entries (>30 lines):")
# Find item_base start
ib_start = None
for i in range(dopt_start, dopt_end or total):
    if 'item_base:' in lines[i]:
        ib_start = i
        break

if ib_start:
    # Find entries: look for patterns like ",name:" or "name:" at depth ~3
    entry_re = re.compile(r'^\s*,?(\w+):\s*\{')
    entries = []
    cur_name = None
    cur_start = None
    depth = 0
    
    for i in range(ib_start + 1, dopt_end or total):
        l = lines[i]
        d_change = l.count('{') - l.count('}')
        
        # At depth 1 relative to item_base, we're at entry level
        if depth <= 1:
            m = entry_re.match(l.strip())
            if m and depth == 0:
                if cur_name and cur_start:
                    entries.append((cur_name, cur_start + 1, i + 1, i - cur_start))
                cur_name = m.group(1)
                cur_start = i
        
        depth += d_change
        if depth < 0:
            if cur_name and cur_start:
                entries.append((cur_name, cur_start + 1, i + 1, i - cur_start))
            break
    
    for name, start, end, count in entries:
        if count > 30:
            print(f"  {name}: lines {start}-{end} ({count} lines)")

# 5. Find events within Dungeon_options 
print("\nSearching for events block:")
for i in range(dopt_start or 0, dopt_end or total):
    l = lines[i]
    if re.match(r'\s*,?events:', l):
        print(f"  events starts at line {i+1}: {l.strip()[:70]}")
        break

# 6. What's after Dungeon_options?
print(f"\nAfter Dungeon_options (line {dopt_end} to {total}):")
for i in range(dopt_end - 1 if dopt_end else 0, min((dopt_end or 0) + 30, total)):
    l = lines[i].strip()
    if l and not l.startswith('//') and l != '':
        print(f"  line {i+1}: {l[:80]}")
