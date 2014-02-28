requirejs.config({
  context: 'gk',
  paths: {
    'jstree': 'lib/jstree/jstree'
  }
});

// define module (component)
define(['jstree', 'css!lib/jstree/themes/default/style.css'], function () {
  return {
    template: '<div id="{{id}}"><content></content></div>',
    script: function () {
      'use strict';

      var self = this,
        $oriEle = self.$originEle,
        $ele = self.$ele,

        checkbox = $oriEle.attr('checkbox'),
        dots = $oriEle.attr('dots'),
        dnd = $oriEle.attr('dnd'),
        icons = $oriEle.attr('icons'),
        sort = $oriEle.attr('sort'),
        stripes = $oriEle.attr('stripes'),
        remote = $oriEle.attr('remote'),

        defaults = {
          'core': {
            'animation': false,
            'check_callback': true,
            'themes': {
              'dots': dots === 'true',
              'icons': icons === 'false' ? false : true,
              'stripes': stripes === 'true'
            }
          },
          'plugins': ['unique']
        };

      this.init = function () {
        var content = $.trim($oriEle.html());
        if (content.length !== 0) {
          if (content.charAt(0) === '[') {
            defaults.core.data = JSON.parse(content);
          }
        }

        if (checkbox === 'true') {
          defaults.checkbox = {
            keep_selected_style: false
          };
          defaults.plugins.push('checkbox');
        }

        if (dnd === 'true') {
          defaults.plugins.push('dnd');
        }

        if (sort === 'true') {
          defaults.plugins.push('sort');
        }

        if (remote) {
          defaults.core.data = _prepareAjaxData(remote);
        }

        $ele.jstree(defaults);
      };

      function _prepareAjaxData(url) {
        var reg = /\.go$/,
          result = {
            url: function () {
              if (reg.test(url)) {
                return url + '?json';
              } else {
                return url;
              }
            },
            data: function (node) {
              if (reg.test(url)) {
                var info = {
                  i: {
                    src: node.id,
                    url: window.location.href,
                    node: node
                  },
                  t: 'map'
                };
                return 'j=' + encodeURIComponent(JSON.stringify(info));
              } else {
                return node;
              }
            }
          };
        return result;
      }

      this.expand = function (obj) {
        if (typeof (obj) === 'undefined') {
          $ele.jstree('open_all');
        } else {
          $ele.jstree('open_node', obj);
        }
      };

      this.collapse = function (obj) {
        if (typeof (obj) === 'undefined') {
          $ele.jstree('close_all');
        } else {
          $ele.jstree('close_node', obj);
        }
      };

      this.select = function (obj) {
        if (typeof (obj) === 'undefined') {
          $ele.jstree('select_all');
        } else {
          $ele.jstree('select_node', obj);
        }
      };

      this.deselect = function (obj) {
        if (typeof (obj) === 'undefined') {
          $ele.jstree('deselect_all');
        } else {
          $ele.jstree('deselect_node', obj);
        }
      };

      this.get_selected = function (full) {
        if (typeof (full) === 'boolean') {
          return $ele.jstree('get_selected', full);
        } else {
          return $ele.jstree('get_selected', true);
        }
      };

      this.get_node = function (obj) {
        return $ele.jstree('get_node', obj);
      };

      this.add = function (parent, obj, position) {
        return $ele.jstree('create_node', parent, obj, position);
      };

      this.del = function (obj) {
        return $ele.jstree('delete_node', obj);
      };

      this.value = function (data) {
        if (typeof (data) === 'undefined') {
          return $ele.jstree('get_json');
        } else {
          $ele.jstree('destroy');
          defaults.core.data = data;
          return $ele.jstree(defaults);
        }
      };
    }
  };
});
