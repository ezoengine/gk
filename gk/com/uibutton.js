requirejs.config({
  context: 'gk',
  paths: {
    'jquery-ui': 'lib/jquery-ui/jquery-ui-1.10.4.custom'
  }
});

// define module (component)
define(['jquery-ui', 'css!lib/jquery-ui/css/custom/jquery-ui-1.10.4.custom.css'], function () {
  return {
    template: '<button id="{{id}}" name="{{name}}" style="{{style}}" value="{{value}}"><content></content></button>',
    script: function () {
      'use strict';

      var self = this,
        $oriEle = self.$originEle,
        $ele = self.$ele,
        confirm = $oriEle.attr('confirm') === 'true',
        defaults = {
          disabled: $oriEle.attr('disable') === 'true',
          text: $oriEle.attr('text') === 'false' ? false : true
        },
        ready = false;

      $.extend(true, defaults, {
        label: $oriEle.attr('label'),
      });

      this.init = function () {
        $ele.button(defaults);

        if (confirm) {
          var $dialog = _createConfirmDialog();
          $ele.click(function (event) {
            if (ready) {
              ready = false;
              return;
            }
            event.stopImmediatePropagation();
            $dialog.dialog('open');
          });
        }
      };

      this.disable = function (disable) {
        if (typeof (disable) !== 'undefined') {
          return $ele.button('option', 'disabled', disable);
        } else {
          return $ele.button('option', 'disabled');
        }
      };

      this.label = function (label) {
        if (typeof (label) !== 'undefined') {
          return $ele.button('option', 'label', label);
        } else {
          return $ele.button('option', 'label');
        }
      };

      this.value = function (value) {
        if (typeof (value) !== 'undefined') {
          return $ele.val(value);
        } else {
          return $ele.val();
        }
      };

      function _createConfirmDialog() {
        var $dialog = $('<div title=' + self.label() + '視窗><p>確定要執行?</p></div>');
        $dialog.dialog({
          autoOpen: false,
          buttons: {
            '是': function () {
              $dialog.dialog('close');
              ready = true;
              $ele.trigger('click');
            },
            '否': function () {
              $dialog.dialog('close');
            }
          },
          draggable: false,
          modal: true,
          open: function () {
            $('.ui-dialog-titlebar-close', $dialog.parent()).hide();
          },
          resizable: false
        });
        return $dialog;
      }

    }
  };
});
