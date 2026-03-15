#!/usr/bin/env python3
"""Ronda 3: Remove dance motions and BPM configs from animate.js.

Precise line-range approach:
- Remove lines 15-134 (1-indexed): dance motion entries 1-29 in the motion:[] array
- Remove lines 253-296 (1-indexed): BPM dance configs in motion_para
- Fix motion_shuffle_pool_size and motion_shuffle
- Fix motion_shuffle_list_default (old index 30 → new index 1)
"""
import os

FILE = os.path.join(os.path.dirname(__file__), '..', 'redux', 'images', 'XR Animator', 'animate.js')

lines = open(FILE, 'r').readlines()
before = len(lines)
print(f"Before: {before} lines")

# Verify markers at expected positions (1-indexed → 0-indexed)
assert 'magic_of_xyz' in lines[15], f"Expected magic_of_xyz at line 16, got: {lines[15].strip()[:50]}"
assert 'ゆっきゆっき' in lines[132], f"Expected ゆっきゆっき near line 133, got: {lines[132].strip()[:50]}"

# Dance motion entries to remove: lines 15-134 (0-indexed 14-133)
# This is from the ,{ path:.../magic_of_xyz line through the // 30 comment
dance_motion_lines = set(range(14, 135))  # 0-indexed, lines 15-135

# BPM dance entries to remove: lines 253-296 (0-indexed 252-295)
# Verify boundary
assert 'BPM:{' in lines[252], f"Expected BPM at line 253, got: {lines[252].strip()[:50]}"

bpm_lines = set()
for i in range(252, 300):
    l = lines[i].strip()
    if 'BPM:{' in l:
        bpm_lines.add(i)
    elif l.startswith('//') and 'BPM:{' in l:
        bpm_lines.add(i)
    elif l == '':
        # Blank line between BPM entries
        if i > 252 and (i-1) in bpm_lines:
            bpm_lines.add(i)

print(f"Dance motion lines to remove: {len(dance_motion_lines)} (lines 15-135)")
print(f"BPM config lines to remove: {len(bpm_lines)} (lines ~253-296)")

all_remove = dance_motion_lines | bpm_lines

# Find motion_shuffle lines to modify
shuffle_pool_idx = None
shuffle_idx = None
shuffle_default_idx = None
for i, l in enumerate(lines):
    if 'motion_shuffle_pool_size:' in l and not l.strip().startswith('//'):
        shuffle_pool_idx = i
    elif ',motion_shuffle:' in l and 'list' not in l and 'by_song' not in l and not l.strip().startswith('//'):
        shuffle_idx = i
    elif 'motion_shuffle_list_default:' in l and not l.strip().startswith('//'):
        shuffle_default_idx = i

print(f"motion_shuffle_pool_size: line {shuffle_pool_idx+1 if shuffle_pool_idx else 'N/A'}")
print(f"motion_shuffle: line {shuffle_idx+1 if shuffle_idx else 'N/A'}")
print(f"motion_shuffle_list_default: line {shuffle_default_idx+1 if shuffle_default_idx else 'N/A'}")

# Build new file
new_lines = []
for i, l in enumerate(lines):
    if i in all_remove:
        continue
    
    # Replace motion_shuffle_pool_size
    if i == shuffle_pool_idx:
        new_lines.append(' ,motion_shuffle_pool_size: 1\n')
        continue
    
    # Replace motion_shuffle
    if i == shuffle_idx:
        new_lines.append(' ,motion_shuffle: [0]\n')
        continue
    
    # Fix motion_shuffle_list_default: [30] → [1]  
    # (old index 30 = first must_load entry, now at index 1 after removing 29 entries)
    if i == shuffle_default_idx:
        new_lines.append(' ,motion_shuffle_list_default: [1]\n')
        continue
    
    new_lines.append(l)

after = len(new_lines)
removed = before - after
print(f"\nAfter: {after} lines")
print(f"Removed: {removed} lines")

# Verify the motion array still makes sense
print("\nFirst few motion entries after trim:")
in_array = False
count = 0
for i, l in enumerate(new_lines):
    if ',motion: [' in l:
        in_array = True
    if in_array and 'path:' in l:
        print(f"  [{count}] line {i+1}: {l.strip()[:80]}")
        count += 1
        if count >= 5:
            break

with open(FILE, 'w') as f:
    f.writelines(new_lines)
print("\nWritten OK.")
