#!/usr/bin/env python3
"""Ronda 1: Remove XR_Ropes IIFE and headless/WebSocket block from animate.js"""
import sys

path = "/Users/mpalenque/demobodytracking/SystemAnimatorOnline/redux/images/XR Animator/animate.js"
lines = open(path, "r").readlines()
total_before = len(lines)

# Cut from bottom to top to preserve line numbers

# Cut 1: XR_Ropes (lines 15318-16419, 0-indexed 15317-16418)
# Keep line 15317-1 (the blank line before) and line 16419+ (EV_sync_update.fps_control)
cut1_start = 15317  # 0-indexed: "const XR_Ropes = (()=>{"
cut1_end = 16419    # 0-indexed: line after the last "});" of event listeners (exclusive)
# Replace with a comment
lines[cut1_start:cut1_end] = ["  // [REMOVED] XR_Ropes — rope/hair physics simulation (Ronda 1)\n", "\n"]

# Cut 2: headless/WebSocket block (lines 14851-15198, 0-indexed 14850-15197)
# Line 14851 is the WebSocket listener start, line 15197 is "// headless_mode END"
# Line 15198 is blank
cut2_start = 14850  # 0-indexed: "window.addEventListener('SA_WebSocket_server_on_message'"
cut2_end = 15198    # 0-indexed: after blank line (exclusive)
# Replace with a comment
lines[cut2_start:cut2_end] = ["  // [REMOVED] headless/WebSocket remote control (Ronda 1)\n", "\n"]

total_after = len(lines)
print(f"Before: {total_before} lines")
print(f"After: {total_after} lines")
print(f"Removed: {total_before - total_after} lines")

open(path, "w").writelines(lines)
print("Written OK.")
