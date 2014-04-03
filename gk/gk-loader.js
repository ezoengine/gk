(function (window, $) {

  'use strict';

  var script = getScript(),
    baseUrl = script.getAttribute('gk-baseUrl') || getScriptFolder(script),
    gkPkg = (script.getAttribute('gk-pkg') || 'com').replace(/\./g, '/'),
    gkTags = (script.getAttribute('gk-tags') || '').split(/[\s,]+/),
    callback = script.getAttribute('callback') || '',
    context = 'gk',
    config = {
      map: {
        '*': {
          css: 'lib/require-css/css'
        }
      }
    },
    defined;

  function each(ary, func) {
    if (ary) {
      for (var i = 0, len = ary.length; i < len; i += 1) {
        if (ary[i] && func(ary[i], i, ary)) {
          break;
        }
      }
    }
  }

  function getKeys(o) {
    var a = [];
    for (var p in o) {
      if (o.hasOwnProperty(p)) {
        a.push(p);
      }
    }
    return a;
  }

  function getScript() {
    var scs = document.getElementsByTagName('script');
    for (var i = scs.length - 1; i > -1; i -= 1) {
      if (scs[i].getAttribute('gk-tags')) {
        return scs[i];
      }
    }
    return scs[scs.length - 1];
  }

  function getScriptFolder(script) {
    return script.src.split('?')[0].split('/').slice(0, -1).join('/');
  }

  function setUpRequire() {
    baseUrl && (config.baseUrl = baseUrl);
    context && (config.context = context);
    requirejs.config(config);
    defined = requirejs.s.contexts[context || '_'].defined;
    requirejs.s.contexts[context || '_'].comMap = {};
  }

  function checkRegistry() {
    each(['_', context], function (ctx) {
      var registry = requirejs.s.contexts[ctx].registry;
      each(getKeys(registry), function (com) {
        var factory = registry[com].factory;
        defined[com] = typeof factory === 'function' ? factory() : factory;
        delete registry[com];
      });
    });
  }

  function checkUndefined(coms) {
    var undef = false;
    each(coms, function (com) {
      if (!defined[com]) {
        undef = true;
        return true;
      }
    });
    return undef;
  }

  function toComponents(tags) {
    var coms = [];
    each(tags, function (tag) {
      coms.push(defined[tag] ? tag : (tag.indexOf(':') === -1 ? (gkPkg + '/' + tag) : tag.replace(/\:/, '/')));
    });
    return coms;
  }

  function toTagName(com) {
    return com.substr(com.lastIndexOf('/') + 1);
  }

  window.registryGK = function (tags, callback) {
    checkRegistry();
    var coms = toComponents(tags);
    if (checkUndefined(coms)) {
      requirejs.config(config)(coms, function () {
        var modules = arguments;
        each(coms, function (val, idx) {
          var tagName = toTagName(val);
          requirejs.s.contexts[context || '_'].comMap[tagName] = val;
          modules[idx] && $.gk.registry(tagName, modules[idx]);
        });
        if (typeof callback === 'function') {
          callback(modules);
        }
      });
    } else {
      var modules = [],
        m;
      each(coms, function (com) {
        var tagName = toTagName(com);
        requirejs.s.contexts[context || '_'].comMap[tagName] = com;
        m = defined[com];
        m && $.gk.registry(tagName, m);
        modules.push(m);
      });
      if (typeof callback === 'function') {
        callback(modules);
      }
    }
  };

  setUpRequire();
  if (gkTags.length) {
    registryGK(gkTags, function () {
      $.gk.init();
      callback && new Function('return ' + callback)()();
    });
  }

}(window, jQuery));