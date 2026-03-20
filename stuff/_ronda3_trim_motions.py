#!/usr/bin/env python3
"""Ronda 3: Remove dance motions from motion catalog and their BPM entries from motion_para.

Strategy:
- In the motion:[] array, keep: index 0 (standmix2_modified, idle) and indices 30+ (must_load emotes/poses/tracking motions)
- Remove indices 1-29 (all dance VMDs, many with F:\ paths that don't resolve anyway)
- Remove the corresponding BPM dance entries from motion_para (lines 253-290 area)
- Fix motion_shuffle to reference only remaining indices
- All must_load entries shift down by 29 positions
"""
import re, sys, os

FILE = os.path.join(os.path.dirname(__file__), '..', 'redux', 'images', 'XR Animator', 'animate.js')

lines = open(FILE, 'r').readlines()
before = len(lines)
print(f"Before: {before} lines")

# ── Phase 1: Remove dance motions 1-29 from the motion:[] array ──
# Motion array starts at line 8 (0-indexed 7) with " ,motion: ["
# Entry 0 = standmix2_modified (line 12, must keep)
# Entries 1-29 = dance VMDs we want to remove
# Entry 30+ = must_load entries we keep

# Find motion array start
motion_start_idx = None
for i, l in enumerate(lines):
    if ',motion: [' in l or 'motion: [' in l:
        motion_start_idx = i
        break

# Find each motion entry (lines with 'path:' inside the array)
motion_entries = []
entry_start = None
brace_depth = 0
in_motion_array = False

for i in range(motion_start_idx, len(lines)):
    l = lines[i]
    
    if not in_motion_array:
        if '[' in l:
            in_motion_array = True
            brace_depth = 0
        continue
    
    # Track when we've exited the array
    stripped = l.strip()
    if stripped == ']':
        break
    
    # Detect entry boundaries by looking for { and path:
    if 'path:' in l:
        # This line or nearby is a motion entry
        # Find entry start (line with { before path)
        start = i
        while start > motion_start_idx and '{' not in lines[start]:
            start -= 1
        # Find entry end (line with } after path)
        end = i
        # Scan forward for closing of this entry
        depth = 0
        for j in range(start, len(lines)):
            depth += lines[j].count('{') - lines[j].count('}')
            if depth <= 0:
                end = j
                break
        
        motion_entries.append({
            'index': len(motion_entries),
            'start': start,
            'end': end,
            'path_line': l.strip(),
            'must_load': 'must_load' in l or any('must_load' in lines[k] for k in range(start, end+1))
        })

print(f"\nFound {len(motion_entries)} motion entries")
for e in motion_entries[:5]:
    print(f"  [{e['index']}] lines {e['start']+1}-{e['end']+1}: {e['path_line'][:60]}")
print(f"  ...")
for e in motion_entries[28:33]:
    print(f"  [{e['index']}] lines {e['start']+1}-{e['end']+1} {'MUST_LOAD' if e['must_load'] else ''}: {e['path_line'][:60]}")

# Entries to remove: indices 1-29 (dance motions)
entries_to_remove = [e for e in motion_entries if 1 <= e['index'] <= 29]
lines_to_remove_motion = set()
for e in entries_to_remove:
    for j in range(e['start'], e['end'] + 1):
        lines_to_remove_motion.add(j)
    # Also remove the comma/blank line after entry
    if e['end'] + 1 < len(lines) and lines[e['end'] + 1].strip() == '':
        lines_to_remove_motion.add(e['end'] + 1)

print(f"\nRemoving {len(entries_to_remove)} dance entries ({len(lines_to_remove_motion)} lines from motion array)")

# ── Phase 2: Remove BPM dance entries from motion_para ──
# These are lines 253-290 area, each is a single-line BPM config for a dance
# Pattern: ,"somename" : { ... BPM:{ ... } }
# Keep entries WITHOUT BPM (tracking motions, emotes, special poses)

bpm_lines_to_remove = set()
# Also remove commented-out BPM lines
for i, l in enumerate(lines):
    stripped = l.strip()
    # Single-line BPM entries (dance configs)
    if 'BPM:{' in stripped and stripped.startswith(',"') and i > 250 and i < 300:
        bpm_lines_to_remove.add(i)
    # Commented-out BPM entries
    elif stripped.startswith('//') and 'BPM:{' in stripped and i > 250 and i < 300:
        bpm_lines_to_remove.add(i)

print(f"Removing {len(bpm_lines_to_remove)} BPM dance entries from motion_para")

# ── Phase 3: Fix motion_shuffle ──
# The original motion_shuffle references dance indices 1-29 and must_load indices 30+
# After removing 1-29, all must_load indices shift down by 29
# But motion_shuffle already references specific indices — we'll simplify it to just [0]
# (only idle motion remains as shuffleable)

# Find motion_shuffle lines
shuffle_lines = {}
for i, l in enumerate(lines):
    if 'motion_shuffle_pool_size:' in l and not l.strip().startswith('//'):
        shuffle_lines['pool_size'] = i
    elif 'motion_shuffle:' in l and 'motion_shuffle_list' not in l and 'motion_shuffle_by_song' not in l and not l.strip().startswith('//'):
        shuffle_lines['shuffle'] = i

print(f"motion_shuffle lines: {shuffle_lines}")

# ── Phase 4: Apply all changes ──
all_lines_to_remove = lines_to_remove_motion | bpm_lines_to_remove

# Build new file
new_lines = []
for i, l in enumerate(lines):
    if i in all_lines_to_remove:
        continue
    
    # Fix motion_shuffle_pool_size
    if i == shuffle_lines.get('pool_size'):
        new_lines.append(' ,motion_shuffle_pool_size: 1\n')
        continue
    
    # Fix motion_shuffle
    if i == shuffle_lines.get('shuffle'):
        new_lines.append(' ,motion_shuffle: [0]\n')
        continue
    
    # Fix motion_shuffle_list_default (reference to old index 30 → now index 1)
    if 'motion_shuffle_list_default:' in l and not l.strip().startswith('//'):
        new_lines.append(' ,motion_shuffle_list_default: [0]\n')
        continue
    
    new_lines.append(l)

after = len(new_lines)
removed = before - after
print(f"\nAfter: {after} lines")
print(f"Removed: {removed} lines")

with open(FILE, 'w') as f:
    f.writelines(new_lines)
print("Written OK.")
