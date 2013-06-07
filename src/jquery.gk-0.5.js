;
(function (window, func) {
    var $ = window.jQuery;
    $ && func(window, window.document, $);
})(window, function (window, document, $, undefined) {
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
            this.bindEvent();
        }

        var proto = WebComponent.prototype;

        proto.init = proto._init = function () {
        };
        proto.beforeParse = function (html) {
            return html;
        };
        proto.bindEvent = function () {
            var self = this;
            var elem = document.getElementById(this.id);
            if (elem == null) {
                return;
            }
            for (var i = 0; i < elem.attributes.length; i++) {
                var attr = elem.attributes[i];
                if (attr.name.indexOf('data-gk-') == 0) {
                    var eventName = attr.name.substring(8);
                    this.$ele.unbind(eventName);
                    this.$ele.bind(eventName, self['on' + eventName]);
                }
            }
        };
        proto.className = function () {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((this)['constructor'].toString());
            var className = (results && results.length > 1) ? results[1] : "";
            return className.split('(')[0];
        };
        proto.gkm = function () {
            return CustomTag.gkm[this.id];
        };
        proto.infoArray = function (info) {
            var replaceHTML = '';
            var _self = this;
            $.each(info, function (idx, obj) {
                var _newHTML = TagLibrary.template(_self.id);
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        var value = obj[key];
                        var regex = new RegExp('{{' + key + '}}', "g");
                        _newHTML = _newHTML.replace(regex, value);
                    }
                }
                replaceHTML += _newHTML;
            });
            replaceHTML = $.gk['toHTML'](replaceHTML);
            return replaceHTML;
        };
        proto.infoObject = function (info) {
            var replaceHTML = '';
            var _newHTML = TagLibrary.template(this.id);
            for (var key in info) {
                if (info.hasOwnProperty(key)) {
                    var value = info[key];
                    var regex = new RegExp('{{' + key + '}}', "g");
                    _newHTML = _newHTML.replace(regex, value);
                }
            }
            replaceHTML += _newHTML;
            replaceHTML = $.gk['toHTML'](replaceHTML);
            return replaceHTML;
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
        TagUtils.createElement('template');
        return TagUtils;
    })();

    var CustomTag = (function () {
        var CustomTag = {
            CLASS: 'use',
            gkm: {}
        };
        CustomTag.replaceWith = function replaceWith(processTagElement) {
            if (typeof processTagElement === 'undefined') {
                return null;
            }
            var customTagElement = TagUtils.cloneNode(TagLibrary.customTags[processTagElement.nodeName.toUpperCase()]),
                $customTagElement = $(customTagElement),
                clazz = $customTagElement.attr(this.CLASS) || 'WebComponent',
                newHTML = $customTagElement.html(),
                rgContent = new RegExp(TagLibrary.content, "i"),
                script, id, repHTML;

            if (typeof processTagElement.id === 'undefined' || processTagElement.id === '') {
                id = processTagElement.id = TagLibrary.getGenId();
            } else {
                id = processTagElement.id;
            }
            script = "$.gk.com('" + id + "' , new $.gk.components['" + clazz + "']('" + id + "'));";
            TagLibrary.eventStore['script'].push(script);
            repHTML = TagUtils.innerHTML(processTagElement);
            CustomTag.gkm[id] = repHTML;
            newHTML = newHTML.replace(rgContent, repHTML);
            newHTML = $.gk.components[processTagElement.nodeName.toUpperCase()].prototype['beforeParse'](newHTML);
            var onEvent = [];
            $.each(processTagElement.attributes, function (idx, att) {
                if (att.nodeName.indexOf('on') == 0) {
                    onEvent.push([att.nodeName, att.nodeValue]);
                }
                var regex = new RegExp('{{' + att.nodeName + '}}', "gi");
                newHTML = newHTML.replace(regex, att.nodeValue);
            });
            var newNode = TagUtils.toElement(newHTML);
            $.each(onEvent, function (idx, evt) {
                $(newNode).attr(evt[0], evt[1]);
            });
            TagUtils.replaceElement(processTagElement, newNode);
            return newNode;
        };
        return CustomTag;
    })();

    var TagLibrary = (function () {
        var TagLibrary = {};
        TagLibrary.serial = 0;
        TagLibrary.customTags = {};
        TagLibrary.content = "<content></content>";
        TagLibrary.DATAKEY = "_gk_";
        TagLibrary.genIdPrefix = "_gk_gen_";
        TagLibrary.eventStore = [];
        TagLibrary.eventStore.script = [];
        TagLibrary.eventStore.template = {};
        TagLibrary.getGenId = function getGenId() {
            return this.genIdPrefix + this.serial++;
        };
        TagLibrary.template = function template(id) {
            return this.eventStore['template'][id];
        };
        TagLibrary.isComponent = function isComponent(tagName) {
            return TagLibrary.customTags[tagName.toUpperCase()];
        };
        TagLibrary.process = function process(ele) {
            var chk = $.type(ele);
            if (chk === "null" || chk === "undefined") {
                return;
            }
            var nodeName = ele.nodeName.toUpperCase();
            if (nodeName === 'TEMPLATE') {
                var id = $(ele.parentNode).attr('id');
                TagLibrary.eventStore['template'][id] = ele.innerHTML;
                ele.innerHTML = '';
            }
            if (TagLibrary.isComponent(nodeName)) {
                TagLibrary.process(CustomTag.replaceWith(ele));
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
        version: "0.5",
        components: {"WebComponent": WebComponent},
        model: {},
        createTag: function (tages) {
            for (var i in tages) {
                TagUtils.createElement(tages[i].replace(/\S*\//g, ''));
            }
        },
        init: function (components) {
            if (arguments.length > 0) {
                $.gk.registry(components);
            }
            $('[gk-app]').each(function (idx, ele) {
                var $ele = $(ele);
                var html = $.gk['toHTML']($ele.html());
                $ele.html(html);
            });
            $('*[gk-obj]').each(function (idx, ele) {
                var $ele = $(ele),
                    id = $ele.attr('id'),
                    com = $ele.attr('gk-obj'),
                    component = $.gk.components[com];
                if (component) {
                    $.gk.com(id, component(id));
                }
            });
        },
        toHTML: function (html) {
            var ele = TagUtils.createDIVWrapper(html), newGKObj, val;
            TagLibrary.process(ele);
            newGKObj = (TagLibrary.eventStore['script'] || []).join(' ');
            val = newGKObj.length > 0 ? ele.innerHTML + '<script>' + newGKObj + '</script>' : ele.innerHTML;
            TagLibrary.eventStore['script'] = [];
            return val.replace(/(\S*\w+=['"]\{\{\w+\}\}['"])|(\{\{\w+\}\})/g, "");
        },
        registry: function (classes) {
            $.each(classes, function (idx, clazz) {
                if (typeof clazz === 'function') {
                    return;
                }
                clazz.name = clazz.name.toUpperCase();
                TagLibrary.customTags[clazz.name] = $("<gk:view use='" + clazz.name + "'>" + clazz.template + "</gk:view>")[0];
                var newComponent = function (id) {
                    WebComponent.call(this, id);
                };
                __extends(newComponent, WebComponent);
                clazz.script.call(newComponent.prototype);
                newComponent.prototype._init = newComponent.prototype.init;
                newComponent.prototype.init = function () {
                };
                $.gk.components[clazz.name] = newComponent;
            });
        },
        com: function (id, obj) {
            $('#' + id).data(TagLibrary.DATAKEY, obj);
            var model = $.gk['model'][id];
            if (model) {
                for (var prop in model) {
                    if (model.hasOwnProperty(prop)) {
                        obj[prop] = model[prop];
                    }
                }
            }
            obj['_init']();
            obj['init']();
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
        define(function () {
            return $.gk;
        });
    } else {
        var $doc = $(document);
        $doc.triggerHandler("gkComponentsInit");
        $doc.ready(function () {
            $.gk.init();
        });
    }
});