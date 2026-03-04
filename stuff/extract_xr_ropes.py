#!/usr/bin/env python3
"""Extract XR_Ropes IIFE from animate.js into a module file.

Creates:
  - modules/xr-ropes.js : The XR_Ropes IIFE, assigned to self.XR_Ropes

Modifies:
  - animate.js : Removes IIFE + self assignment, updates references
"""
import os
import sys

REPO = '/Users/mpalenque/demobodytracking/SystemAnimatorOnline/redux'
ANIMATE_JS = os.path.join(REPO, 'images/XR Animator/animate.js')
MODULES_DIR = os.path.join(REPO, 'images/XR Animator/modules')

def main():
    with open(ANIMATE_JS, 'r') as f:
        lines = f.readlines()

    total = len(lines)
    print(f'Read {total} lines from animate.js')

    # Find XR_Ropes IIFE start
    iife_start = None
    for i, line in enumerate(lines):
        if 'const XR_Ropes = (()=>{' in line:
            iife_start = i
            break

    if iife_start is None:
        print('ERROR: Could not find XR_Ropes IIFE start')
        sys.exit(1)

    print(f'XR_Ropes IIFE starts at line {iife_start + 1}')

    # Find the matching })(); closing
    # Count parens/braces to find the matching close
    iife_end = None
    depth = 0
    for i in range(iife_start, len(lines)):
        line = lines[i]
        for ch in line:
            if ch in '({':
                depth += 1
            elif ch in ')}':
                depth -= 1
        if depth == 0 and i > iife_start:
            iife_end = i
            break

    if iife_end is None:
        print('ERROR: Could not find XR_Ropes IIFE end')
        sys.exit(1)

    print(f'XR_Ropes IIFE ends at line {iife_end + 1}')

    # Find the self.XR_Ropes assignment line after the IIFE
    self_assign = None
    for i in range(iife_end + 1, min(iife_end + 5, len(lines))):
        if 'self.XR_Ropes = XR_Ropes' in lines[i]:
            self_assign = i
            break

    if self_assign is None:
        print('WARNING: Could not find self.XR_Ropes assignment')
        self_assign = iife_end  # just remove the IIFE
    else:
        print(f'self.XR_Ropes assignment at line {self_assign + 1}')

    # Extract IIFE content (just the body, without 'const XR_Ropes = ')
    iife_lines = lines[iife_start:iife_end + 1]
    iife_text = ''.join(iife_lines)

    # Build module file
    # Replace "const XR_Ropes = (()=>{" with "self.XR_Ropes = (()=>{"
    module_text = iife_text.replace('const XR_Ropes = (()=>{', 'self.XR_Ropes = (()=>{', 1)

    module_content = (
        '// xr-ropes.js\n'
        '// XR_Ropes module - rope/string physics simulation for XR Animator\n'
        + module_text + '\n'
    )

    module_path = os.path.join(MODULES_DIR, 'xr-ropes.js')
    with open(module_path, 'w') as f:
        f.write(module_content)
    print(f'Created xr-ropes.js ({module_content.count(chr(10))} lines)')

    # Remove lines from animate.js (iife_start through self_assign inclusive)
    # Also remove any blank line right before the IIFE
    remove_start = iife_start
    # Check if previous lines are blank
    while remove_start > 0 and lines[remove_start - 1].strip() == '':
        remove_start -= 1

    new_lines = list(lines[:remove_start])
    new_lines.append('\n')  # Keep one blank line
    new_lines.extend(lines[self_assign + 1:])

    removed = total - len(new_lines)
    print(f'Removed {removed} lines from animate.js')

    # Replace remaining XR_Ropes references with self.XR_Ropes
    for i in range(len(new_lines)):
        line = new_lines[i]
        # Only replace bare XR_Ropes (not self.XR_Ropes or other prefixed)
        if 'XR_Ropes' in line and 'self.XR_Ropes' not in line:
            new_lines[i] = line.replace('XR_Ropes', 'self.XR_Ropes')

    # Add load call for xr-ropes.js after facemesh-options-assemble.js
    insert_idx = None
    for i, line in enumerate(new_lines):
        if 'facemesh-options-assemble.js' in line:
            insert_idx = i + 1
            break

    if insert_idx is None:
        # Fallback: after events-default-base.js
        for i, line in enumerate(new_lines):
            if 'events-default-base.js' in line:
                insert_idx = i + 1
                break

    if insert_idx:
        new_lines.insert(insert_idx, "// --- XR_Ropes module ---\n")
        new_lines.insert(insert_idx + 1, "SA.loader.loadScriptSync('images/XR Animator/modules/xr-ropes.js');\n")
        print(f'Added load call at line {insert_idx + 1}')

    # Write modified animate.js
    with open(ANIMATE_JS, 'w') as f:
        f.writelines(new_lines)

    final_count = len(new_lines)
    print(f'\n--- Summary ---')
    print(f'animate.js: {total} -> {final_count} lines (-{total - final_count})')
    print(f'xr-ropes.js: {module_content.count(chr(10))} lines')

if __name__ == '__main__':
    main()
