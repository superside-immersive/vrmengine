// System Animator - Module Loader
// Provides controlled script loading to replace document.write('<script...>')
// during the refactoring transition. Supports both classic scripts and ES modules.
// (2026-02-18)

(function () {
  'use strict';

  /**
   * Registry of loaded modules/scripts to prevent double-loading.
   * @type {Object<string, {status: string, promise: Promise|null}>}
   */
  var _registry = {};

  /**
   * Load a classic (non-module) script tag synchronously via document.write.
   * This is the legacy method — kept for backward compatibility during transition.
   * @param {string} src - Script path relative to root
   * @returns {void}
   */
  function loadScriptSync(src) {
    if (_registry[src]) return;
    _registry[src] = { status: 'loading', promise: null };
    document.write('<script type="text/javascript" language="javascript" src="' + src + '"></scr' + 'ipt>\n');
    _registry[src].status = 'loaded';
  }

  /**
   * Load a script asynchronously by creating a <script> element.
   * Returns a Promise that resolves when the script is loaded.
   * @param {string} src - Script path relative to root
   * @param {Object} [options]
   * @param {boolean} [options.module=false] - Load as ES module (type="module")
   * @param {boolean} [options.async=true] - Load asynchronously
   * @returns {Promise<void>}
   */
  function loadScript(src, options) {
    options = options || {};

    if (_registry[src] && _registry[src].promise) {
      return _registry[src].promise;
    }

    var promise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      if (options.module) {
        script.type = 'module';
      } else {
        script.type = 'text/javascript';
      }
      script.src = src;
      script.async = (options.async !== false);

      script.onload = function () {
        _registry[src].status = 'loaded';
        resolve();
      };
      script.onerror = function (err) {
        _registry[src].status = 'error';
        console.error('[SA.loader] Failed to load: ' + src);
        reject(new Error('Failed to load script: ' + src));
      };

      document.head.appendChild(script);
    });

    _registry[src] = { status: 'loading', promise: promise };
    return promise;
  }

  /**
   * Load an ES module using dynamic import().
   * @param {string} src - Module path (relative or absolute)
   * @returns {Promise<*>} The module's exports
   */
  function loadModule(src) {
    if (_registry[src] && _registry[src].promise) {
      return _registry[src].promise;
    }

    var promise = import(src).then(function (mod) {
      _registry[src].status = 'loaded';
      return mod;
    }).catch(function (err) {
      _registry[src].status = 'error';
      console.error('[SA.loader] Failed to import module: ' + src, err);
      throw err;
    });

    _registry[src] = { status: 'loading', promise: promise };
    return promise;
  }

  /**
   * Load multiple scripts in order (sequential).
   * @param {Array<string|{src:string, module?:boolean}>} scripts
   * @returns {Promise<void>}
   */
  function loadScriptsSequential(scripts) {
    var chain = Promise.resolve();
    scripts.forEach(function (item) {
      chain = chain.then(function () {
        if (typeof item === 'string') {
          return loadScript(item);
        }
        return item.module ? loadModule(item.src) : loadScript(item.src, item);
      });
    });
    return chain;
  }

  /**
   * Load multiple scripts in parallel.
   * @param {Array<string|{src:string, module?:boolean}>} scripts
   * @returns {Promise<void[]>}
   */
  function loadScriptsParallel(scripts) {
    var promises = scripts.map(function (item) {
      if (typeof item === 'string') {
        return loadScript(item);
      }
      return item.module ? loadModule(item.src) : loadScript(item.src, item);
    });
    return Promise.all(promises);
  }

  /**
   * Check if a script/module has been loaded.
   * @param {string} src
   * @returns {boolean}
   */
  function isLoaded(src) {
    return _registry[src] && _registry[src].status === 'loaded';
  }

  /**
   * Get the full registry (for debugging).
   * @returns {Object}
   */
  function getRegistry() {
    return _registry;
  }

  // Expose on SA namespace
  SA.loader = {
    loadScriptSync: loadScriptSync,
    loadScript: loadScript,
    loadModule: loadModule,
    loadScriptsSequential: loadScriptsSequential,
    loadScriptsParallel: loadScriptsParallel,
    isLoaded: isLoaded,
    getRegistry: getRegistry
  };

  console.log('[SA] Module loader initialized');
})();
