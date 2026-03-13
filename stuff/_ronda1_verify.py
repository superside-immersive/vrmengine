#!/usr/bin/env python3
"""Verify cut boundaries for Ronda 1."""
import sys

path = "/Users/mpalenque/demobodytracking/SystemAnimatorOnline/redux/images/XR Animator/animate.js"
lines = open(path, "r").readlines()
total = len(lines)
print(f"Total lines: {total}")

# Cut 1: XR_Ropes IIFE + its event listeners
# Find start
for i, l in enumerate(lines):
    if "const XR_Ropes = (()=>{" in l:
        print(f"\nXR_Ropes start: line {i+1}: {l.strip()[:60]}")
        print(f"  Line before: {lines[i-1].strip()[:60]}")
        break

# Find end of XR_Ropes event listeners
for i, l in enumerate(lines):
    if "XR_Ropes.update();" in l:
        print(f"XR_Ropes.update(): line {i+1}: {l.strip()[:60]}")
        # Look ahead for closing
        for j in range(i+1, min(i+6, total)):
            print(f"  +{j-i} line {j+1}: {lines[j].strip()[:60]}")
        break

# Cut 2: headless/WebSocket block
for i, l in enumerate(lines):
    if "SA_WebSocket_server_on_message" in l:
        print(f"\nWebSocket start: line {i+1}: {l.strip()[:60]}")
        print(f"  Line before: {lines[i-1].strip()[:60]}")
        break

for i, l in enumerate(lines):
    if "// headless_mode END" in l:
        print(f"headless_mode END: line {i+1}: {l.strip()[:60]}")
        print(f"  Line after: {lines[i+1].strip()[:60]}")
        print(f"  Line after+1: {lines[i+2].strip()[:60]}")
        break
