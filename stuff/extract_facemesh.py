#!/usr/bin/env python3
"""Extract _FACEMESH_OPTIONS_ IIFE from animate.js into modular files.

Creates:
  - facemesh-options-core.js     : All helper functions + closure vars + _FMO exposure
  - facemesh-branches-1.js       : Branches 0-5
  - facemesh-branches-2.js       : Branches 6-28
  - facemesh-branches-3.js       : Branch 29 (large IIFE)
  - facemesh-branches-4.js       : Branches 30-42
  - facemesh-options-assemble.js : Final assembly

Modifies:
  - animate.js : Replaces IIFE with [], adds load calls
"""
import re
import os
import sys

REPO = '/Users/mpalenque/demobodytracking/SystemAnimatorOnline/redux'
ANIMATE_JS = os.path.join(REPO, 'images/XR Animator/animate.js')
MODULES_DIR = os.path.join(REPO, 'images/XR Animator/modules')

# ---- LINE NUMBERS (1-based) ----
# IIFE: line 910: "_FACEMESH_OPTIONS_": (function () {
# Helpers: lines 911-2804
# return [: line 2805
# Branch content: lines 2806-6019
# ]; : line 6020
# })() : line 6021

# Chunk boundaries (1-based, inclusive)
# Chunk 1: lines 2806-3450 (branches 0-5, includes IIFE-A)
# Chunk 2: lines 3451-3981 (branches 6-28, includes IIFE-B)
# Chunk 3: lines 3982-5329 (branch 29 IIFE-C, + trailing empty line)
# Chunk 4: lines 5330-6019 (branches 30-42, includes IIFE-D)

# Convert to 0-based
IIFE_START   = 909   # line 910
HELPERS_START = 910   # line 911
HELPERS_END   = 2803  # line 2804 (inclusive)
RETURN_LINE   = 2804  # line 2805
IIFE_CLOSE    = 6020  # line 6021

CHUNKS = [
    (2805, 3449),  # chunk 1: 0-based [2805:3450] = lines 2806-3450
    (3450, 3980),  # chunk 2: 0-based [3450:3981] = lines 3451-3981
    (3981, 5328),  # chunk 3: 0-based [3981:5329] = lines 3982-5329
    (5329, 6018),  # chunk 4: 0-based [5329:6019] = lines 5330-6019
]

# Mutable variables that need F. prefix in branch files
MUTABLE_VARS = [
    'wallpaper_dialog_enabled',
    'wallpaper_generator_dialog_enabled',
    'explorer_mode',
    'dome_axis_angle',
    'dome_rotation_speed',
    '_overlay_mode',
    'object3d_index',
    'explorer_ground_y',
    'bg_state_default',
    'bg_color_default',
    'bg_wallpaper_default',
    'webcam_as_bg_default',
    '_onDrop_finish',
    'object3d_list',
]

# Items to destructure in branch files (constants + functions + shared objects)
DESTRUCTURE_ITEMS = [
    # Branch index constants
    'bg_branch', 'done_branch', 'panorama_branch', 'object3D_branch',
    'about_branch', 'other_options_branch', 'record_motion_branch',
    'mocap_options_branch', 'facemesh_options_branch', 'motion_control_branch',
    # Functions called from branches
    'onDrop_change_panorama', 'onDrop_JSON_change_facemesh_calibration',
    'animate_object3D', 'adjust_object3D', 'build_octree', 'add_grid',
    'change_panorama', 'rotate_dome', 'remove_skybox', 'change_HDRI', 'remove_HDRI',
    'ML_off', 'mirror_3D_off', 'reset_scene_explorer', 'reset_scene_UI', 'reset_scene',
    'onDrop_add_object3D',
    # Shared objects (non-reassigned)
    'HDRI_list', 'object3d_cache',
]

# All items exposed on _FMO (for the core file)
ALL_EXPOSE = DESTRUCTURE_ITEMS + MUTABLE_VARS


def transform_mutable_refs(text):
    """Replace bare references to mutable vars with F.varName"""
    for var_name in MUTABLE_VARS:
        escaped = re.escape(var_name)
        # Match varName NOT preceded by . or word char, NOT followed by word char
        pattern = r'(?<![.\w])' + escaped + r'(?!\w)'
        text = re.sub(pattern, 'F.' + var_name, text)
    return text


def strip_leading_comma(text):
    """Strip the first comma that introduces an array element in branch content"""
    # Match: optional whitespace/comments, then comma before [ or (
    return re.sub(r'(^(?:\s*(?://[^\n]*\n))*\s*),(\s*[\[\(])', r'\1 \2', text, count=1)


def build_fmo_exposure():
    """Build the window._FMO object literal for the core file"""
    lines = []
    lines.append('')
    lines.append('// --- Expose scope for branch files ---')
    lines.append('window._FMO = {')
    lines.append('  // Branch index constants')
    for i in range(0, 10, 5):
        group = DESTRUCTURE_ITEMS[i:i+5]
        lines.append('  ' + ', '.join(group) + ',')
    lines.append('')
    lines.append('  // Functions')
    funcs = DESTRUCTURE_ITEMS[10:-2]  # functions slice
    for i in range(0, len(funcs), 4):
        group = funcs[i:i+4]
        lines.append('  ' + ', '.join(group) + ',')
    lines.append('')
    lines.append('  // Shared objects')
    objs = DESTRUCTURE_ITEMS[-2:]
    lines.append('  ' + ', '.join(objs) + ',')
    lines.append('')
    lines.append('  // Mutable state (getter/setter for cross-file access)')
    # Variables that are WRITTEN from branches need setter
    writable = {
        'wallpaper_dialog_enabled', 'wallpaper_generator_dialog_enabled',
        'explorer_mode', 'dome_axis_angle', 'dome_rotation_speed',
        '_overlay_mode', 'object3d_index', 'object3d_list',
    }
    for var_name in MUTABLE_VARS:
        lines.append(f'  get {var_name}() {{ return {var_name}; }},')
        if var_name in writable:
            lines.append(f'  set {var_name}(v) {{ {var_name} = v; }},')
    lines.append('')
    lines.append('  // Branch assembly')
    lines.append('  branches: [],')
    lines.append('};')
    return '\n'.join(lines)


def build_destructure_header():
    """Build the destructuring header for branch files"""
    lines = []
    lines.append('var F = window._FMO;')
    lines.append('var {')
    for i in range(0, len(DESTRUCTURE_ITEMS), 5):
        group = DESTRUCTURE_ITEMS[i:i+5]
        lines.append('  ' + ', '.join(group) + ',')
    lines.append('} = F;')
    return '\n'.join(lines)


def main():
    with open(ANIMATE_JS, 'r') as f:
        lines = f.readlines()
    
    total = len(lines)
    print(f'Read {total} lines from animate.js')

    # ---- VERIFY key lines ----
    line_910 = lines[909].strip()
    if '"_FACEMESH_OPTIONS_"' not in line_910:
        print(f'ERROR: Line 910 does not contain _FACEMESH_OPTIONS_: "{line_910}"')
        sys.exit(1)
    
    line_6021 = lines[6020].strip()
    if line_6021 != '})()':
        print('ERROR: Line 6021 is not "})()": "' + line_6021 + '"')
        sys.exit(1)
    
    line_2805 = lines[2804].strip()
    if not line_2805.startswith('return ['):
        print(f'ERROR: Line 2805 does not start with "return [": "{line_2805}"')
        sys.exit(1)
    
    print('Line verification passed ✓')

    # ---- 1. Create core file ----
    helper_text = ''.join(lines[HELPERS_START:HELPERS_END+1])
    fmo_block = build_fmo_exposure()
    
    core_content = (
        '// facemesh-options-core.js\n'
        '// All helper functions, closure variables, and event listeners for _FACEMESH_OPTIONS_\n'
        '(function () {\n'
        + helper_text
        + fmo_block + '\n'
        '})();\n'
    )
    
    core_path = os.path.join(MODULES_DIR, 'facemesh-options-core.js')
    with open(core_path, 'w') as f:
        f.write(core_content)
    print(f'Created facemesh-options-core.js ({core_content.count(chr(10))} lines)')

    # ---- 2. Create branch files ----
    destr_header = build_destructure_header()
    
    for idx, (start_0, end_0) in enumerate(CHUNKS):
        chunk_num = idx + 1
        chunk_lines = lines[start_0:end_0+1]
        chunk_text = ''.join(chunk_lines)
        
        # For chunks 2+, strip leading comma
        if chunk_num > 1:
            chunk_text = strip_leading_comma(chunk_text)
        
        # Transform mutable variable references
        chunk_text = transform_mutable_refs(chunk_text)
        
        branch_content = (
            f'// facemesh-branches-{chunk_num}.js\n'
            '(function () {\n'
            + destr_header + '\n\n'
            'F.branches.push(\n'
            + chunk_text + '\n'
            ');\n'
            '})();\n'
        )
        
        branch_path = os.path.join(MODULES_DIR, f'facemesh-branches-{chunk_num}.js')
        with open(branch_path, 'w') as f:
            f.write(branch_content)
        print(f'Created facemesh-branches-{chunk_num}.js ({branch_content.count(chr(10))} lines, chunk lines {start_0+1}-{end_0+1})')

    # ---- 3. Create assembly file ----
    assemble_content = (
        '// facemesh-options-assemble.js\n'
        '// Final assembly: set _FACEMESH_OPTIONS_ and clean up\n'
        '(function () {\n'
        '  MMD_SA_options.Dungeon_options.events_default["_FACEMESH_OPTIONS_"] = window._FMO.branches;\n'
        '  delete window._FMO;\n'
        '})();\n'
    )
    
    assemble_path = os.path.join(MODULES_DIR, 'facemesh-options-assemble.js')
    with open(assemble_path, 'w') as f:
        f.write(assemble_content)
    print(f'Created facemesh-options-assemble.js')

    # ---- 4. Modify animate.js ----
    # Replace lines 910-6021 (0-based 909-6020) with placeholder
    new_lines = list(lines[:IIFE_START])
    new_lines.append('    "_FACEMESH_OPTIONS_": []\n')
    new_lines.extend(lines[IIFE_CLOSE+1:])
    
    removed = total - len(new_lines)
    print(f'Removed {removed} lines from animate.js ({total} -> {len(new_lines)})')

    # ---- 5. Add load calls after events-default-base.js ----
    load_calls = [
        '// --- FACEMESH_OPTIONS modules ---\n',
        "SA.loader.loadScriptSync('images/XR Animator/modules/facemesh-options-core.js');\n",
        "SA.loader.loadScriptSync('images/XR Animator/modules/facemesh-branches-1.js');\n",
        "SA.loader.loadScriptSync('images/XR Animator/modules/facemesh-branches-2.js');\n",
        "SA.loader.loadScriptSync('images/XR Animator/modules/facemesh-branches-3.js');\n",
        "SA.loader.loadScriptSync('images/XR Animator/modules/facemesh-branches-4.js');\n",
        "SA.loader.loadScriptSync('images/XR Animator/modules/facemesh-options-assemble.js');\n",
    ]
    
    insert_idx = None
    for i, line in enumerate(new_lines):
        if 'events-default-base.js' in line:
            insert_idx = i + 1
            break
    
    if insert_idx is None:
        print('WARNING: Could not find events-default-base.js load call. Adding at end of load section.')
        # Fallback: find last item-base load call
        for i, line in enumerate(new_lines):
            if 'item-base-part3.js' in line:
                insert_idx = i + 2  # after the events-default-base line
                break
    
    if insert_idx:
        for j, call in enumerate(load_calls):
            new_lines.insert(insert_idx + j, call)
        print(f'Added {len(load_calls)} load calls at line {insert_idx + 1}')
    else:
        print('ERROR: Could not find insertion point for load calls')
        sys.exit(1)

    # ---- 6. Write modified animate.js ----
    with open(ANIMATE_JS, 'w') as f:
        f.writelines(new_lines)
    
    final_count = len(new_lines)
    print(f'Final animate.js: {final_count} lines')

    # ---- Summary ----
    print('\n--- Summary ---')
    print(f'animate.js: {total} -> {final_count} lines (-{total - final_count})')
    print(f'New files: facemesh-options-core.js, facemesh-branches-1..4.js, facemesh-options-assemble.js')


if __name__ == '__main__':
    main()
