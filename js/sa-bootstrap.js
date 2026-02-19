/**
 * @file sa-bootstrap.js — Centralized bootstrap entry point for System Animator Online.
 *
 * Replaces the repeated 5-line HTML boilerplate with a single script tag:
 *
 *   Before (in each HTML page):
 *     <script src="js/globals.js"></script>
 *     <script src="js/module-loader.js"></script>
 *     <script src="js/core.js"></script>
 *     <script src="js/core_extra.js"></script>
 *     <script>SA_load_scripts()</script>
 *
 *   After:
 *     <script src="js/sa-bootstrap.js"></script>
 *
 * NOTE: Page-specific variables (use_SA_browser_mode, _url_search_params_)
 * must still be set in a <script> block BEFORE this bootstrap script.
 *
 * Load order (synchronous, via document.write):
 *   1. globals.js        — SA namespace, global state registry
 *   2. module-loader.js  — SA.loader API (loadScriptSync, loadScript, loadModule)
 *   3. core.js           — Platform detection, utility functions, Settings_default
 *   4. core_extra.js     — SA_load_scripts(), SA_load_body(), SA_load_body2()
 *   5. SA_load_scripts() — Loads _SA.js → app/ modules, EQP.js → eqp/ modules,
 *                          _SA2.js, MMD_SA.js → mmd/ modules, dungeon.js → dungeon/ modules
 *
 * DOM callbacks (must remain in HTML):
 *   - <body onload="init()">      — Main initialization
 *   - SA_load_body()              — Injects UI DOM elements
 *   - SA_load_body2()             — Injects additional DOM structure
 *
 * Future migration path:
 *   When the codebase moves to ES modules, this file becomes
 *   <script type="module" src="js/sa-bootstrap.js"> and uses
 *   SA.loader.loadModule() / dynamic import() for the chain.
 *
 * @version 8A
 * @see REFACTORING_PLAN.md
 */

// --- Bootstrap: load the core chain synchronously ---
document.write(
  '<script type="text/javascript" src="js/globals.js"><\/script>\n'
+ '<script type="text/javascript" src="js/module-loader.js"><\/script>\n'
+ '<script type="text/javascript" src="js/core.js"><\/script>\n'
+ '<script type="text/javascript" src="js/core_extra.js"><\/script>\n'
+ '<script>SA_load_scripts()<\/script>\n'
);
