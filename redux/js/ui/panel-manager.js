// ============================================================
// XRA Panel Manager
// Replaces 3D speech bubbles with modern CSS DOM panels
// ============================================================

(function () {
  'use strict';

  // ── Singleton ──
  var XRA = window.XRA_PanelManager = {};

  var _container = null;
  var _activePanels = {};   // keyed by sb_index
  var _hooked = false;

  // Branch regex — same as the 3D system uses
  var BRANCH_RE = null; // set from MMD_SA_options.SpeechBubble_branch.RE

  // ── Init ──
  XRA.init = function () {
    _container = document.getElementById('Lxra_panels');
    if (!_container) {
      // body may not exist yet during script loading — defer
      if (!document.body) {
        console.warn('[XRA] document.body not ready, deferring init');
        document.addEventListener('DOMContentLoaded', function () { XRA.init(); });
        return;
      }
      _container = document.createElement('div');
      _container.id = 'Lxra_panels';
      document.body.appendChild(_container);
    }

    // Tooltip element used by speech-bubble.js mouse handler — create if missing
    if (!document.getElementById('SB_tooltip')) {
      var tip = document.createElement('div');
      tip.id = 'SB_tooltip';
      tip.style.cssText = 'position:fixed;z-index:9999;visibility:hidden;pointer-events:none;';
      document.body.appendChild(tip);
    }

    XRA.installHooks();

    // Build the unified bottom toolbar
    XRA._createToolbar();

    // Apply glass-morphism to media control bar
    XRA._styleMediaBar();
  };

  // ── Install monkey-patches on every SpeechBubble instance ──
  XRA.installHooks = function () {
    if (_hooked) return;

    var SB = MMD_SA.SpeechBubble;
    if (!SB || !SB.list || !SB.list.length) {
      console.warn('[XRA] SpeechBubble not ready, deferring hook install');
      return;
    }

    BRANCH_RE = (MMD_SA_options.SpeechBubble_branch && MMD_SA_options.SpeechBubble_branch.RE) || /^([\dA-Z])\.\s/;

    SB.list.forEach(function (sb) {
      var sbIndex = sb.index || 0;

      // Save originals
      sb._xra_origMessage = sb.message.bind(sb);
      sb._xra_origHide    = sb.hide.bind(sb);

      // Patch message()
      sb.message = function (bubble_index, msg, duration, para) {
        // Call original so all internal state (group, timer, position) stays correct
        sb._xra_origMessage(bubble_index, msg, duration, para);

        // Now also render a DOM panel
        XRA._onMessage(sbIndex, bubble_index, msg, duration, para);
      };

      // Patch hide()
      sb.hide = function () {
        sb._xra_origHide();
        XRA._onHide(sbIndex);
      };
    });

    // Suppress the 3D sprite rendering by hiding the WebGL meshes
    _suppressSprites();

    _hooked = true;
    console.log('[XRA] Panel hooks installed for', SB.list.length, 'speech bubbles');
  };

  // ── Suppress 3D sprite visibility ──
  function _suppressSprites() {
    try {
      MMD_SA.SpeechBubble.list.forEach(function (sb) {
        var meshId = 'SpeechBubbleMESH' + (sb.index || '');
        var meshRef = MMD_SA.THREEX.mesh_obj.get(meshId);
        if (meshRef) {
          // Override show() to prevent sprite from reappearing
          var origShow = meshRef.show;
          meshRef.show = function () {
            // don't show 3D sprite — DOM panel handles it
            // Still dispatch the event so internal state is updated
          };
          // Hide it now if visible
          if (meshRef._mesh) {
            meshRef._mesh.visible = false;
          }
        }
      });
    } catch (e) {
      console.warn('[XRA] Could not suppress sprites:', e.message);
    }
  }

  // ── Handle message event ──
  XRA._onMessage = function (sbIndex, bubble_index, msg, duration, para) {
    // Remove existing panel for this SB slot
    XRA._removePanel(sbIndex, true);

    if (!msg) return;

    // Parse message lines
    var lines = msg.split('\n');
    var branches = [];
    var plainLines = [];

    lines.forEach(function (line) {
      if (!BRANCH_RE) {
        plainLines.push(line);
        return;
      }
      var m = BRANCH_RE.exec(line);
      if (m) {
        branches.push({
          key: m[1],
          label: line.replace(BRANCH_RE, '').trim(),
          raw: line
        });
      } else {
        plainLines.push(line);
      }
    });

    var hasBranches = branches.length > 0;

    if (hasBranches) {
      // Menu panel with clickable options
      XRA._showMenuPanel(sbIndex, plainLines, branches, duration, para);
    } else if (duration && duration > 0) {
      // Timed message → toast
      XRA._showToast(sbIndex, msg, duration);
    } else {
      // Persistent message (dialogue mode)
      if (sbIndex === 1) {
        XRA._showInfoPanel(sbIndex, msg);
      } else {
        XRA._showMenuPanel(sbIndex, lines, [], duration, para);
      }
    }
  };

  // ── Handle hide event ──
  XRA._onHide = function (sbIndex) {
    XRA._removePanel(sbIndex, false);
  };

  // ── Remove panel by SB index ──
  XRA._removePanel = function (sbIndex, immediate) {
    var existing = _activePanels[sbIndex];
    if (!existing) return;

    if (existing._xra_timerID) {
      clearTimeout(existing._xra_timerID);
      existing._xra_timerID = null;
    }

    var el = existing.element;
    if (el && el.parentNode) {
      if (immediate) {
        el.parentNode.removeChild(el);
      } else {
        var closeClass = el.classList.contains('xra-toast') ? 'xra-toast--closing' : 'xra-panel--closing';
        el.classList.add(closeClass);
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 200);
      }
    }

    delete _activePanels[sbIndex];
  };

  // ── Show menu panel ──
  XRA._showMenuPanel = function (sbIndex, headerLines, branches, duration, para) {
    var panel = document.createElement('div');
    panel.className = 'xra-panel xra-panel--bottom-center';
    if (branches.length > 5) panel.classList.add('xra-panel--wide');

    var html = '';

    // Header area (non-branch text)
    var headerText = headerLines.filter(function (l) { return l.trim(); }).join('\n');
    if (headerText) {
      html += '<div class="xra-panel__header">';
      html += '  <div class="xra-panel__title">' + _escapeHtml(headerText) + '</div>';
      html += '</div>';
    }

    // Branch options
    if (branches.length) {
      html += '<div class="xra-panel__body">';
      branches.forEach(function (b) {
        var isCancel = /cancel|back|return|exit|close|cerrar|volver|salir|esc/i.test(b.label) || b.key === '0';
        html += '<div class="xra-option' + (isCancel ? ' xra-option--cancel' : '') + '" data-branch-key="' + _escapeHtml(b.key) + '" tabindex="0">';
        html += '  <span class="xra-option__badge">' + _escapeHtml(b.key) + '</span>';
        html += '  <span class="xra-option__label">' + _escapeHtml(b.label) + '</span>';
        html += '  <span class="xra-option__hint">' + _escapeHtml(b.key) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    } else if (!headerText) {
      // No branches, no header — just show all text
      html += '<div class="xra-panel__body" style="padding:14px 20px;">';
      html += '  <div style="color:#d4d8e0;white-space:pre-wrap;">' + _escapeHtml(headerLines.join('\n')) + '</div>';
      html += '</div>';
    }

    panel.innerHTML = html;
    _container.appendChild(panel);

    // Wire click handlers for branches
    var optionEls = panel.querySelectorAll('.xra-option');
    optionEls.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var key = el.getAttribute('data-branch-key');
        _dispatchBranchKey(key);
      });

      // Touch support
      el.addEventListener('touchend', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var key = el.getAttribute('data-branch-key');
        _dispatchBranchKey(key);
      });

      // Hover highlight
      el.addEventListener('mouseenter', function () {
        optionEls.forEach(function (o) { o.classList.remove('xra-option--focused'); });
        el.classList.add('xra-option--focused');
      });
      el.addEventListener('mouseleave', function () {
        el.classList.remove('xra-option--focused');
      });
    });

    // Store reference
    _activePanels[sbIndex] = { element: panel, type: 'menu', _xra_timerID: null };

    // Auto-hide for timed messages without branches
    if (duration && duration > 0 && !branches.length) {
      _activePanels[sbIndex]._xra_timerID = setTimeout(function () {
        XRA._removePanel(sbIndex, false);
      }, duration);
    }
  };

  // ── Show toast notification ──
  XRA._showToast = function (sbIndex, msg, duration) {
    var toast = document.createElement('div');
    toast.className = 'xra-toast';
    toast.textContent = msg;
    _container.appendChild(toast);

    var entry = { element: toast, type: 'toast', _xra_timerID: null };
    _activePanels[sbIndex] = entry;

    entry._xra_timerID = setTimeout(function () {
      toast.classList.add('xra-toast--closing');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
      if (_activePanels[sbIndex] === entry) {
        delete _activePanels[sbIndex];
      }
    }, duration);
  };

  // ── Show info panel (secondary SB) ──
  XRA._showInfoPanel = function (sbIndex, msg) {
    var panel = document.createElement('div');
    panel.className = 'xra-info-panel';
    // Position top-right for secondary info
    panel.style.top = '80px';
    panel.style.right = '16px';
    panel.textContent = msg;
    _container.appendChild(panel);

    _activePanels[sbIndex] = { element: panel, type: 'info', _xra_timerID: null };
  };

  // ── Dispatch branch key selection ──
  function _dispatchBranchKey(key) {
    var ev = {};
    var num = parseInt(key);
    if (!isNaN(num) && num >= 0) {
      ev.keyCode = 96 + num;
    } else {
      ev.code = 'Key' + key;
    }
    // Use the same dispatch path as the original speech bubble click handler
    if (typeof SA_OnKeyDown === 'function') {
      SA_OnKeyDown(ev);
    }
  }

  // ── Keyboard navigation: visual feedback on active panels ──
  window.addEventListener('SA_keydown', function (e) {
    var k = e.detail.keyCode;
    var _e = e.detail.e;

    for (var idx in _activePanels) {
      var entry = _activePanels[idx];
      if (entry.type !== 'menu') continue;
      var options = entry.element.querySelectorAll('.xra-option');
      options.forEach(function (opt) {
        var bKey = opt.getAttribute('data-branch-key');
        var numKey = parseInt(bKey);
        var matched = false;
        if (!isNaN(numKey)) {
          matched = (k === 96 + numKey) || (k === 48 + numKey);
        } else if (bKey && _e && _e.code) {
          matched = _e.code === 'Key' + bKey;
        }
        if (matched) {
          opt.classList.add('xra-option--focused');
          setTimeout(function () {
            opt.classList.remove('xra-option--focused');
          }, 200);
        }
      });
    }
  });

  // ── Hide all panels (utility) ──
  XRA.hideAll = function () {
    for (var idx in _activePanels) {
      XRA._removePanel(idx, false);
    }
  };

  // ── Unified Bottom Toolbar ──
  var _toolbar = null;

  XRA._createToolbar = function () {
    if (_toolbar) return;

    _toolbar = document.createElement('div');
    _toolbar.className = 'xra-toolbar-unified';
    _toolbar.id = 'Lxra_toolbar';

    var isNative = typeof browser_native_mode !== 'undefined' && browser_native_mode;

    var buttons = [
      { icon: isNative ? '⟳' : '✕', title: isNative ? 'Reload' : 'Close', cls: 'xra-toolbar-btn--danger',
        action: function () { System._browser.confirmClose(true); } },
      'sep',
      { icon: '⚙️', title: 'Settings',
        action: function () { System._browser.onSettings(); } },
      { icon: '📁', title: 'Folder',
        action: function () { if (typeof SA_OnFolder === 'function') SA_OnFolder(); } },
      { icon: '📄', title: 'File',
        action: function () { if (typeof SA_OnDocument === 'function') SA_OnDocument(); } },
      { icon: '🖼️', title: 'Gallery',
        action: function () { if (typeof SA_OnGallery === 'function') SA_OnGallery(); } },
    ];

    // AR button only when WebXR API is available
    if (navigator.xr) {
      buttons.push('sep');
      buttons.push({
        icon: '📱', title: 'AR Mode', cls: 'xra-toolbar-btn--accent',
        action: function () {
          if (typeof MMD_SA !== 'undefined' && MMD_SA.WebXR && typeof MMD_SA.WebXR.enter_AR === 'function') {
            MMD_SA.WebXR.enter_AR();
          }
        }
      });
    }

    buttons.forEach(function (b) {
      if (b === 'sep') {
        var sep = document.createElement('div');
        sep.className = 'xra-toolbar-sep';
        _toolbar.appendChild(sep);
        return;
      }
      var btn = document.createElement('button');
      btn.className = 'xra-toolbar-btn' + (b.cls ? ' ' + b.cls : '');
      btn.setAttribute('title', b.title);
      btn.innerHTML = '<span>' + b.icon + '</span>';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        b.action();
      });
      _toolbar.appendChild(btn);
    });

    document.body.appendChild(_toolbar);
  };

  // ── Media Bar Glass-morphism ──
  XRA._styleMediaBar = function () {
    var mc = document.getElementById('C_media_control');
    if (!mc) return;

    // Add glass-morphism class immediately
    if (!mc.classList.contains('xra-media-bar')) {
      mc.classList.add('xra-media-bar');
    }

    // Watch for visibility changes to keep class applied
    var obs = new MutationObserver(function () {
      if (!mc.classList.contains('xra-media-bar')) {
        mc.classList.add('xra-media-bar');
      }
    });
    obs.observe(mc, { attributes: true, attributeFilter: ['style', 'class'] });
  };

  // ── Utility ──
  function _escapeHtml(text) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(text));
    return d.innerHTML;
  }

  // ── Auto-init on MMDStarted if not already done ──
  window.addEventListener('MMDStarted', function () {
    // Delay slightly to ensure SpeechBubble.init() has completed
    setTimeout(function () {
      if (!_hooked) {
        XRA.init();
      }
    }, 500);
  });

})();
