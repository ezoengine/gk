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
        proto.bindEvent = function () {
            var self = this;
            var elem = document.getElementById(this.id);
            if (elem == null) {
                return;
            }
            for (var i = 0; i < elem.attributes.length; i++) {
                var attrib = elem.attributes[i];
                if (attrib.name.indexOf('data-gk-') == 0) {
                    var eventName = attrib.name.substring(8);
                    var onXXXEvent = 'on' + eventName;
                    this.$ele.unbind(eventName);
                    this.$ele.bind(eventName, function (evt) {
                        if (typeof(self[onXXXEvent]) == "function") {
                            self[onXXXEvent](evt);
                        }
                    });
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
        proto.template = function (html) {
            if (html) {
                TagLibrary.eventStore['template'][this.id] = html;
            } else {
                return TagLibrary.eventStore['template'][this.id];
            }
        };
        return WebComponent;
    })();

    var TagUtils = (function () {
        var TagUtils = {};
        fragDiv = document.createElement('div');
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
        CustomTag.replaceWith = function replaceWith(element) {
            if (typeof element === 'undefined') {
                return;
            }
            var TL = TagLibrary,
                TU = TagUtils,
                processTagElement = element,
                customTagElement = TU.cloneNode(TL.customTags[element.nodeName.toUpperCase()]),
                $customTagElement = $(customTagElement),
                clazz = $customTagElement.attr(this.CLASS) || 'WebComponent',
                newHTML = $customTagElement.html(),
                script, id, repHTML;

            if (typeof processTagElement.id === 'undefined' || processTagElement.id === '') {
                id = processTagElement.id = TL.getGenId();
            } else {
                id = processTagElement.id;
            }
            script = "$.gk.com('" + id + "' , new $.gk.components['" + clazz + "']('" + id + "'));";
            TL.eventStore['script'].push(script);
            repHTML = TU.innerHTML(processTagElement);
            this.gkm[id] = repHTML;
            newHTML = newHTML.replace(TL.gkm, repHTML);
            var onEvent = [];
            $.each(processTagElement.attributes, function (idx, att) {
                if (att.nodeName.indexOf('on') == 0) {
                    onEvent.push([att.nodeName, att.nodeValue]);
                }
                ;
                var regex = new RegExp('{{' + att.nodeName + '}}', "gi");
                newHTML = newHTML.replace(regex, att.nodeValue);
            });
            var newNode = TU.toElement(newHTML);
            $.each(onEvent, function (idx, evt) {
                $(newNode).attr(evt[0], evt[1]);
            });
            TU.replaceElement(processTagElement, newNode);
            return newNode;
        };
        return CustomTag;
    })();

    var TagLibrary = (function () {
        var TagLibrary = {};
        TagLibrary.serial = 0;
        TagLibrary.customTags = {};
        TagLibrary.gkm = "{{content}}";
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
            return this.customTags[tagName.toUpperCase()];
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
        TagLibrary.process = function process(ele) {
            var chk = $.type(ele),
                TL = TagLibrary;
            if (chk === "null" || chk === "undefined") {
                return;
            }
            var nodeName = ele.nodeName.toUpperCase();
            if (nodeName === 'TEMPLATE') {
                var id = $(ele.parentNode).attr('id');
                TL.eventStore['template'][id] = ele.innerHTML;
                ele.innerHTML = '';
            }
            if (TL.isComponent(nodeName)) {
                TL.process(CustomTag.replaceWith(ele));
            } else if (ele.firstChild) {
                TL.process(ele.firstChild);
            } else if (ele.nextSibling) {
                TL.process(ele.nextSibling);
            } else if (ele.parentNode && ele.parentNode.parentNode) {
                ele = ele.parentNode;
                while (ele.nextSibling == null) {
                    if (ele.parentNode) {
                        ele = ele.parentNode;
                    } else {
                        return;
                    }
                }
                TL.process(ele.nextSibling);
            }
        };
        return TagLibrary;
    })();


    var gk = function (selector) {
        if (selector.indexOf('#') == 0) {
            return $(selector).data(TagLibrary.DATAKEY);
        }
        return {
            html: function (setHTML) {
                var $selector = $(selector);
                if (setHTML) {
                    $selector.html(setHTML);
                    return $selector;
                } else {
                    var gul = $selector.html(),
                        html = $.gk['toHTML'](gul);
                    return html;
                }
            },
            toHTML: function () {
                $(selector).each(function (idx, ele) {
                    var $ele = $(ele),
                        gul = $ele.html(),
                        html = $.gk['toHTML'](gul);
                    $ele.html(html);
                });
            }
        };
    };

    gk.version = "0.5";
    gk.components = {
        "WebComponent": WebComponent
    };
    gk.model = {};
    gk.toHTML = function (html) {
        var ele = TagUtils.createDIVWrapper(html),
            newGKObj, val;
        TagLibrary.process(ele);
        newGKObj = (TagLibrary.eventStore['script'] || []).join(' ');
        val = ele.innerHTML + '<script>' + newGKObj + '</script>';
        TagLibrary.eventStore['script'] = [];
        return val.replace(/(\s*\w+=['"]\{\{\w+\}\}['"])|(\{\{\w+\}\})/g, "");
    };
    gk.com = function (id, obj) {
        if (obj) {
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
        } else {
            return $('#' + id).data(TagLibrary.DATAKEY);
        }
    };
    gk.registry = function (classes) {
        //create component's function
        $.each(classes, function (idx, clazz) {
            //registry Tag
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
            gk.components[clazz.name] = newComponent;
        });
    };
    gk.init = function (components) {
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
    };
    $.gk = gk;
    $.fn.gk = function (method) {
        if (arguments.length == 0) {
            return $(this).data(TagLibrary.DATAKEY);
        }
        var options = Array.prototype.slice.call(arguments, 1),
            firstResult;
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