// System Animator - Module Loader
// Provides controlled script loading to replace document.write('<script...>')
// during the refactoring transition. Supports both classic scripts and ES modules.
// (2026-02-18)

(function () {
  'use strict';

  function withCacheBust(src) {
    if (!src || !window.SA_CACHE_BUST) return src;
    if (!/^https?\:/i.test(location.protocol)) return src;
    if (/^(data|blob|javascript):/i.test(src)) return src;

    var hash = '';
    var hashIndex = src.indexOf('#');
    if (hashIndex !== -1) {
      hash = src.slice(hashIndex);
      src = src.slice(0, hashIndex);
    }

    var joiner = (src.indexOf('?') === -1) ? '?' : '&';
    return src + joiner + 'v=' + encodeURIComponent(window.SA_CACHE_BUST) + hash;
  }

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
    var resolvedSrc = withCacheBust(src);
    if (_registry[resolvedSrc]) return;
    _registry[resolvedSrc] = { status: 'loading', promise: null };
    document.write('<script type="text/javascript" language="javascript" src="' + resolvedSrc + '"></scr' + 'ipt>\n');
    _registry[resolvedSrc].status = 'loaded';
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
    var resolvedSrc = withCacheBust(src);

    if (_registry[resolvedSrc] && _registry[resolvedSrc].promise) {
      return _registry[resolvedSrc].promise;
    }

    var promise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      if (options.module) {
        script.type = 'module';
      } else {
        script.type = 'text/javascript';
      }
      script.src = resolvedSrc;
      script.async = (options.async !== false);

      script.onload = function () {
        _registry[resolvedSrc].status = 'loaded';
        resolve();
      };
      script.onerror = function (err) {
        _registry[resolvedSrc].status = 'error';
        console.error('[SA.loader] Failed to load: ' + resolvedSrc);
        reject(new Error('Failed to load script: ' + resolvedSrc));
      };

      document.head.appendChild(script);
    });

    _registry[resolvedSrc] = { status: 'loading', promise: promise };
    return promise;
  }

  /**
   * Load an ES module using dynamic import().
   * @param {string} src - Module path (relative or absolute)
   * @returns {Promise<*>} The module's exports
   */
  function loadModule(src) {
    var resolvedSrc = withCacheBust(src);

    if (_registry[resolvedSrc] && _registry[resolvedSrc].promise) {
      return _registry[resolvedSrc].promise;
    }

    var promise = import(resolvedSrc).then(function (mod) {
      _registry[resolvedSrc].status = 'loaded';
      return mod;
    }).catch(function (err) {
      _registry[resolvedSrc].status = 'error';
      console.error('[SA.loader] Failed to import module: ' + resolvedSrc, err);
      throw err;
    });

    _registry[resolvedSrc] = { status: 'loading', promise: promise };
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
