;
(function (window, func) {
  var $ = window.jQuery;
  $ && func(window, window.document, $);
})(window, function (window, document, $, undefined) {
  (function (){
    if (typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      }
    }
  })();
  var __extends = function (d, b) {
    function __() {
      this.constructor = d;
    }

    __.prototype = b.prototype;
    d.prototype = new __();
  };
  var WebComponent = (function () {
    function WebComponent(args) {
      this.id = args;
      this.$ele = $('#' + this.id);
      this.$originEle = $(CustomTag.tag[this.id]);
    }

    var proto = WebComponent.prototype;
    proto.beforeParse = function (html) {
      return html;
    };
    proto.bindEvent = function () {
      var self = this;
      var elem = document.getElementById(this.id);
      if (elem == null) {
        return;
      }
      for (var i = 0, len = elem.attributes.length; i < len; i++) {
        var attr = elem.attributes[i];
        if (attr.name.indexOf('data-gk-') == 0) {
          var eventName = attr.name.substring(8);
          this.$ele.unbind(eventName);
          this.$ele.bind(eventName, self['on' + eventName]);
        }
      }
    };
    return WebComponent;
  })();

  var TagUtils = (function () {
    var TagUtils = {};
    var fragDiv = document.createElement('div');
    TagUtils.safeDocumentFrag = document.createDocumentFragment();
    TagUtils.safeDocumentFrag.appendChild(fragDiv);
    TagUtils.createElement = function createElement(tag) {
      if (!$.support.leadingWhitespace) {
        document.createElement(tag);
        TagUtils.safeDocumentFrag['createElement'](tag);
      }
    };
    TagUtils.createDIVWrapper = function createDIVWrapper(html) {
      var div;
      fragDiv.innerHTML = "<div>" + html + "</div>";
      fragDiv.removeChild(div = fragDiv.firstChild);
      return div;
    };
    TagUtils.cloneNode = function cloneNode(element) {
      var clone;
      if (!$.support.leadingWhitespace) {
        fragDiv.innerHTML = element.outerHTML;
        fragDiv.removeChild(clone = fragDiv.firstChild);
      } else {
        clone = element.cloneNode(true);
      }
      return clone;
    };
    TagUtils.replaceElement = function replaceElement(originEle, newEle) {
      var originPar = originEle.parentNode;
      while (newEle != null) {
        var tmp = newEle.nextSibling;
        originPar.insertBefore(newEle, originEle);
        newEle = tmp;
      }
      originPar.removeChild(originEle);
    };
    TagUtils.toElement = function toElement(html) {
      var _div = TagUtils.createDIVWrapper(html);
      return _div.firstChild;
    };
    TagUtils.innerHTML = function innerHTML(ele) {
      var text = '';
      var node = ele;
      if (node != null) {
        if (ele.innerHTML !== '') {
          return ele.innerHTML;
        }
        while (node.nextSibling) {
          node = node.nextSibling;
          if (node.nodeType === 3) {
            text += node.nodeValue.trim();
            node.nodeValue = '';
          } else if (node.nodeType === 1) {
            break;
          }
        }
      }
      return text
    };
    return TagUtils;
  })();

  var CustomTag = (function () {
    var CustomTag = {
      CLASS: 'use', tag: {}, PREFIX: '_gk_src_'
    };
    CustomTag.replaceWith = function replaceWith(tagName, processTagElement) {
      if (typeof processTagElement === 'undefined') {
        return null;
      }
      var customTagElement = TagUtils.cloneNode(TagLibrary.customTags[tagName]),
          $customTagElement = $(customTagElement),
          clazz = $customTagElement.attr(this.CLASS) || 'WebComponent',
          newHTML = $customTagElement.html(),
          script, id, repHTML, newNode, $newNode;

      newHTML = TagLibrary.unDecorateSpecialAttr(newHTML);
      if (typeof processTagElement.id === 'undefined' || processTagElement.id === '') {
        id = processTagElement.id = TagLibrary.getGenId();
      } else {
        id = processTagElement.id;
      }
      script = "$.gk.com('" + id + "' , new $.gk.components['" + clazz + "']('" + id + "'));";
      TagLibrary.eventStore['script'].push(script);
      repHTML = TagUtils.innerHTML(processTagElement);
      CustomTag.tag[id] = $(processTagElement).clone().wrap("<div></div>").parent().html().trim();
      newHTML = newHTML.replace(TagLibrary.content, repHTML);
      newHTML = $.gk.components[tagName].prototype['beforeParse'](newHTML);
      var onEvent = [], attrs = {};
      $.each(processTagElement.attributes, function (idx, att) {
        if (att.nodeName.indexOf('on') == 0) {
          onEvent.push([att.nodeName, att.nodeValue]);
        }
        attrs[att.nodeName] = att.nodeValue;
        var regex = new RegExp('{{' + att.nodeName + '}}', "gi");
        newHTML = newHTML.replace(regex, att.nodeValue);
      });
      newNode = TagUtils.toElement(newHTML);
      $newNode = $(newNode);
      $.each(onEvent, function (idx, evt) {
        $newNode.attr(evt[0], evt[1]);
      });
      $.each(attrs, function (key, value) {
        $newNode.data(CustomTag.PREFIX + key, value);
      });
      $newNode.addClass('gk-component-'+clazz.toLowerCase());
      TagUtils.replaceElement(processTagElement, newNode);
      return newNode;
    };
    return CustomTag;
  })();

  var TagLibrary = (function () {
    var TagLibrary = {},
        specialAttr = "style|class",
        reDecoSA = new RegExp("\\s+(" + specialAttr + ")(?==[\'\"].*?[\'\"]\\s?)", "gi"),
        reUnDecoSA = /\s+(?:data-gksa-(.*?))(?==['"].*?['"])/gi;

    TagLibrary.serial = 0;
    TagLibrary.customTags = {};
    TagLibrary.content = new RegExp("<content\s*>\S*<\/content>", "ig");
    TagLibrary.DATAKEY = "_gk_";
    TagLibrary.genIdPrefix = "_gk_gen_";
    TagLibrary.eventStore = [];
    TagLibrary.eventStore.script = [];
    TagLibrary.decorateSpecialAttr = function decorateSpecialAttr(str) {
      str = str.replace(reDecoSA, " data-gksa-$1");
      reDecoSA.lastIndex = 0;
      return str;
    };
    TagLibrary.unDecorateSpecialAttr = function unDecorateSpecialAttr(str) {
      str = str.replace(reUnDecoSA, " $1");
      reUnDecoSA.lastIndex = 0;
      return str;
    };
    TagLibrary.getGenId = function getGenId() {
      return this.genIdPrefix + this.serial++;
    };
    TagLibrary.isComponent = function isComponent(tagName) {
      return TagLibrary.customTags[tagName.toUpperCase()];
    };
    TagLibrary.enhance = function (selector) {
      $(selector).each(function (idx, ele) {
        var $ele = $(ele);
        if (selector === '*[is]') {
          $ele = $ele.parent();
        }
        var html = $ele.html();
        html = $ele.prop("tagName") === 'BODY' ?
            html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : html;
        $ele.html($.gk.toHTML(html));
      });
    };
    TagLibrary.process = function process(ele) {
      var chk = $.type(ele);
      if (chk === "null" || chk === "undefined") {
        return;
      }
      var tagName = ele.nodeName.toUpperCase();
      if (tagName.charAt(0) !== '#' && ele.getAttribute('is') != null) {
        tagName = ele.getAttribute('is').toUpperCase();
      }
      if (TagLibrary.isComponent(tagName)) {
        TagLibrary.process(CustomTag.replaceWith(tagName, ele));
      } else if (ele.firstChild) {
        TagLibrary.process(ele.firstChild);
      } else if (ele.nextSibling) {
        TagLibrary.process(ele.nextSibling);
      } else if (ele.parentNode && ele.parentNode.parentNode) {
        ele = ele.parentNode;
        while (ele.nextSibling == null) {
          if (ele.parentNode) {
            ele = ele.parentNode;
          } else {
            return;
          }
        }
        TagLibrary.process(ele.nextSibling);
      }
    };
    return TagLibrary;
  })();

  $.gk = {
    version: "0.6",
    components: {"WebComponent": WebComponent},
    createTag: function (tages) {
      for (var i in tages) {
        TagUtils.createElement(tages[i].replace(/\S*\//g, ''));
      }
    },
    init: function () {
      TagLibrary.enhance('*[gk-app]');
      TagLibrary.enhance('*[is]');
      $(document).triggerHandler("gkComponentsReady");
    },
    toHTML: function (html) {
      var ele = TagUtils.createDIVWrapper(html), newGKObj, val;
      TagLibrary.process(ele);
      newGKObj = (TagLibrary.eventStore['script'] || []).join(' ');
      val = newGKObj.length > 0 ? ele.innerHTML + '<script>' + newGKObj + '</script>' : ele.innerHTML;
      TagLibrary.eventStore['script'] = [];
      return val.replace(/(\s(?!(data-gk-))[\w-]+=['"]\{\{[^\{\}]+\}\}['"])/g, "");
    },
    registry: function (name, exec) {
      if (name == null || typeof name !== "string") {
        return;
      }
      var clazz, htmlStr;
      if (typeof exec === "function") {
        clazz = exec();
      } else if (typeof exec === "object" && exec.constructor === Object) {
        clazz = exec;
      }
      clazz.name = name.toUpperCase();
      htmlStr = "<gk:view use='" + clazz.name + "'>" + clazz.template + "</gk:view>";
      htmlStr = TagLibrary.decorateSpecialAttr(htmlStr);
      TagLibrary.customTags[clazz.name] = $(htmlStr)[0];
      var Component = function (id) {
        WebComponent.call(this, id);
        clazz.script && clazz.script.call(this);
        this.bindEvent.call(this);
      };
      __extends(Component, WebComponent);
      if (clazz.beforeParse) {
        Component.prototype.beforeParse = clazz.beforeParse;
      }
      $.gk.components[clazz.name] = Component;
    },
    com: function (id, obj) {
      $('#' + id).data(TagLibrary.DATAKEY, obj);
      obj['init'] && obj['init']();
    }
  };
  $.fn.gk = function (method) {
    if (arguments.length == 0) {
      return $(this).data(TagLibrary.DATAKEY);
    }
    var options = Array.prototype.slice.call(arguments, 1), firstResult = null;
    this.each(function (idx, ele) {
      var gkObj = $(ele).data(TagLibrary.DATAKEY);
      if (gkObj instanceof Object && $.type(gkObj[method]) === "function") {
        var result = gkObj[method].apply(gkObj, options);
        if (idx == 0) {
          firstResult = result;
        }
      }
    });
    return firstResult;
  };
  if (typeof define === 'function') {
    define('jquery', function(){
      return $;
    });
    define('gk', ['jquery'], function () {
      return $.gk;
    });
  } else {
    window.define = function () {
      $.gk.registry.apply(this, arguments);
    };
    $(document).ready(function () {
      $.gk.init();
    });
  }
});
