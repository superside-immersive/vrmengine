#!/usr/bin/env python3
"""Ronda 1C: Gut _SA2.js Electron/desktop-only code."""

path = "/Users/mpalenque/demobodytracking/SystemAnimatorOnline/redux/js/_SA2.js"
lines = open(path, "r").readlines()
total_before = len(lines)

# Find key boundaries
ipc_iife_start = None  # "(function () {"
ipc_guard_return = None  # "if (!webkit_electron_mode)"
ipc_iife_end = None  # "})();" closing the IPC IIFE
loader_iife_start = None  # second "(function () {" after IPC end
gadget_local_start = None  # "SA_GadgetLocalConfig"
electron_iife_start = None  # last "(function () {" 

for i, l in enumerate(lines):
    s = l.strip()
    if s == "(function () {" and ipc_iife_start is None:
        ipc_iife_start = i
    if "if (!webkit_electron_mode)" in s and ipc_guard_return is None:
        ipc_guard_return = i

# The IPC IIFE ends at "})();" after a long block ending ~line 385
# Find it by looking for "})();" after the IPC block  
for i in range(384, 390):
    if lines[i].strip() == "})();":
        ipc_iife_end = i
        break

print(f"IPC IIFE: lines {ipc_iife_start+1}-{ipc_iife_end+1}")
print(f"  guard at line {ipc_guard_return+1}")

# Strategy: Replace entire IPC IIFE with a slim version that just has contextmenu + early return
new_ipc = """// (2025-08-24) — [SIMPLIFIED Ronda 1: Electron IPC removed]

var IPC

;(function () {
  document.addEventListener("contextmenu", function (event) { event.preventDefault(); }, false);
  // [REMOVED] Electron IPC object (~375 lines) — browser-only mode
})();

"""

# Find SA_GadgetLocalConfig IIFE and Electron IIFE
gadget_start = None
electron_start = None
for i, l in enumerate(lines):
    if "SA_GadgetLocalConfig" in l:
        gadget_start = i
        break

# gadget_start is a comment line, the IIFE starts one line after
# Find the IIFE boundaries for GadgetLocalConfig
for i in range(gadget_start, gadget_start+3):
    if lines[i].strip() == "(function () {":
        gadget_iife_start = i
        break

# Find its end — look for })(); 
gadget_iife_end = None
for i in range(gadget_iife_start+1, len(lines)):
    if lines[i].strip() == "})();":
        gadget_iife_end = i
        break

print(f"GadgetLocalConfig IIFE: lines {gadget_iife_start+1}-{gadget_iife_end+1}")

# Electron IIFE starts right after
electron_iife_start = None
for i in range(gadget_iife_end+1, len(lines)):
    if lines[i].strip() == "(function () {":
        electron_iife_start = i
        break

# Find its end
electron_iife_end = None
for i in range(electron_iife_start+1, len(lines)):
    if lines[i].strip() == "})();":
        electron_iife_end = i
        break

print(f"Electron IIFE: lines {electron_iife_start+1}-{electron_iife_end+1}")

# Build new file: 
# 1) New slim IPC
# 2) Loader block (keep as-is, lines ipc_iife_end+1 to gadget_iife_start-1)
# 3) Stub GadgetLocalConfig
# 4) Stub Electron IIFE

new_gadget = """// "SA_GadgetLocalConfig()" — [REMOVED Ronda 1: desktop-only]
;(function () {
  if (use_SA_browser_mode) return;
  // [REMOVED] desktop-only settings (~20 lines)
})();

"""

new_electron = """// Electron window setup — [REMOVED Ronda 1: desktop-only]
;(function () {
  if (!use_SA_system_emulation || is_SA_child_animation) return;
  // [REMOVED] Electron always-on-top, ipcRenderer, window setup (~90 lines)
})();
"""

# Assemble
loader_block = lines[ipc_iife_end+1 : gadget_start]  # includes blank lines + loader IIFE
result = new_ipc + "".join(loader_block) + new_gadget + new_electron

open(path, "w").write(result)

total_after = len(result.splitlines())
print(f"\nBefore: {total_before} lines")
print(f"After: {total_after} lines")
print(f"Removed: {total_before - total_after} lines")
print("Written OK.")
