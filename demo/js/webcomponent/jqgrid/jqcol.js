define(['gk'], function() {
    return {
        name: 'JQCol',
        template: "<div id='{{id}}' gk-decorator='{{decorator}}' gk-undecorator='{{undecorator}}' gk-id='{{id}}' gk-format='{{format}}' gk-edittype='{{type}}' align='{{align}}' gk-hidden='{{hidden}}' editable='{{celleditor}}' sortable='{{sortable}}' frozen='{{frozen}}' label='{{label}}' name='{{name}}' index='{{index}}' width='{{width}}' search='{{search}}'><content></content></div>",
        script: function() {
            var _record,
                _gkPluginKey = "jqGrid",
                $ = window.jQuery;

            var _default = {
                'align': 'center',
                'sortable': true,
                'frozen': false,
                'name': '',
                'index': '',
                'width': 150,
                'search': true,
                'editable': false,
                'edittype': 'text',
                'label': ' ',
                'gk-id': '',
                'gk-format': '',
                'gk-decorator': '',
                'gk-undecorator': ''
            };

            var _defaultGK = {
                'gk-hidden': false,
                'gk-edittype': 'text'
            };

            var _defaultNoEdit = {
                'stype': 'text',
                'sorttype': 'text',
                'classes' : 'gk-column'
            };

            var _attrs = $.map(_default, function(value, key) {
                return key + "";
            });

            var _attrsGK = $.map(_defaultGK, function(value, key) {
                return key + "";
            });

            var _extendAttrs = function(settings, settingsGK, gridId) {
                var val = $.extend({}, _defaultNoEdit, _default),
                    valGK = $.extend({}, _defaultGK),
                    rg = /\${.*}/i,
                    rgPrefix = /gk-/i;

                $.each(settings, function(key, value) {
                    if (!rg.test(value + "") && value !== undefined) {
                        val[key] = value;
                    }
                });

                $.each(settingsGK, function(key, value) {
                    if (!rg.test(value + "") && value !== undefined) {
                        valGK[key] = value;
                    }
                });
                $.each(valGK, function(key, value) {
                    if (!value && value.length <= 0) {
                        return;
                    }
                    var decKey = key.replace(rgPrefix, "");
                    switch (key) {
                        case "gk-hidden":
                            (value === "true") && (val[decKey] = true);
                            break;
                        case "gk-edittype":
                            _doEdittype(val, gridId, decKey, value);
                            break;
                        default:
                            break;
                    }
                });

                val = _parseAttrsType(val);
                _record = $.extend({}, valGK, val);

                return val;
            };

            var _doEdittype = function(settings, gridId, decKey, value) {
                switch (value) {
                    case "textarea":
                        settings[decKey] = value;
                        break;
                    case "date":
                        var fmt = 'Y/m/d',
                            format = settings["gk-format"].toLowerCase(),
                            newFormatParseRe;
                        if (format.length > 0) {
                            fmt = format.replace("yyyy", "Y");
                            fmt = fmt.replace("mm", "m");
                            fmt = fmt.replace("dd", "d");
                        }
                        newFormatParseRe = _getDateParseRe(format);
                        settings["sorttype"] = function(cell) {
                            if (cell.length === 0) {
                                return -1;
                            }
                            return parseInt(cell, 10);
                        };
                        settings["formatter"] = "date";
                        settings["unformat"] = function(cellvalue, options) {
                            var op = $.extend(true, {}, options.colModel);
                            op.formatoptions.parseRe = newFormatParseRe;
                            return $.unformat.date.call(this, cellvalue, op);
                        };
                        settings["formatoptions"] = {
                            srcformat: 'Ymd',
                            newformat: fmt,
                            parseRe: /(\w{1,4})\/?(\w{1,2})\/?(\w{1,2})/
                        };
                        break;
                    case "label":
                        settings[decKey] = "text";
                        settings["editable"] = false;
                        if (settings["gk-decorator"].length > 0) {
                            settings["formatter"] = _getFmtTypeValue(value);
                            _setFormatter(_getFmtTypeValue(value), gridId);
                        }
                        break;
                }
                return settings;
            };


            var _getDateParseRe = function(format) {
                var ft = String(format).toLowerCase(),
                    rg = /[^ymd]/g,
                    idx = [],
                    finalstr = ft,
                    re = /(\w{1,4})\/?(\w{1,2})\/?(\w{1,2})/,
                    i, a, b, c;

                try {
                    if (ft.length > 0) {
                        for (rg.exec(ft); rg.lastIndex !== 0;) {
                            idx.push(rg.lastIndex);
                            rg.exec(ft);
                        }
                        for (i = idx.length - 1; i >= 0; i--) {
                            a = finalstr.substring(0, idx[i] - 1);
                            b = finalstr.substring(idx[i] - 1, idx[i]);
                            c = finalstr.substring(idx[i]);
                            finalstr = a + "\\" + b + "?" + c;
                        }
                        finalstr = finalstr.replace("yyyy", "(\\w{1,4})");
                        finalstr = finalstr.replace("mm", "(\\w{1,2})");
                        finalstr = finalstr.replace("dd", "(\\w{1,2})");
                        re = new RegExp(finalstr);
                    }
                } catch (e) {}
                return re;
            };

            var _getFmtTypeValue = function(fmtType) {
                return "gk_fmt_" + fmtType;
            };

            var _getFmtType = function(fmtTypeValue) {
                return fmtTypeValue.substring(7);
            };

            var _setFormatter = function(fmtTypeValue, gridId) {
                if (typeof $.jgrid !== "undefined") {
                    _formatter(fmtTypeValue);
                } else {
                    $("#" + gridId).one("jqGridBeforeRequest", function() {
                        _formatter(fmtTypeValue);
                    });
                }
            };

            var _formatter = function(fmtTypeValue) {
                var fmatter = $.fn.fmatter,
                    fmtobj = {},
                    unfmtobj = {};
                if (typeof fmatter[fmtTypeValue] === "undefined") {
                    switch (_getFmtType(fmtTypeValue)) {
                        case "label":
                            var doAction = function(cellvalue, options, dataOrCell, funcStr) {
                                var val = cellvalue,
                                    methodFunc = window,
                                    methodStr;
                                if (funcStr) {
                                    methodStr = funcStr.split(".");
                                    for (var i = 0, len = methodStr.length; i < len; i++) {
                                        methodFunc = methodFunc[methodStr[i]] ? methodFunc[methodStr[i]] : null;
                                        if (!methodFunc) {
                                            break;
                                        }
                                    }
                                    if (typeof methodFunc === "function") {
                                        val = methodFunc(cellvalue, options, dataOrCell);
                                    }
                                }
                                return val;
                            };
                            fmtobj[fmtTypeValue] = function(cellvalue, options, rowdata) {
                                var decorator = options.colModel['gk-decorator'];
                                return doAction(cellvalue, options, rowdata, decorator);
                            };
                            unfmtobj['unformat'] = function(cellvalue, options, cellElement) {
                                var undecorator = options.colModel['gk-undecorator'];
                                return doAction(cellvalue, options, cellElement, undecorator);
                            };
                            $.extend(fmatter, fmtobj);
                            $.extend(fmatter[fmtTypeValue], unfmtobj);
                            break;
                    }
                }
            };

            var _parseAttrsType = function(settings) {
                var val = $.extend({}, settings);
                $.each(_default, function(key, value) {
                    if (typeof value === "boolean") {
                        val[key] = _parseBoolean(val[key]);
                    }
                });
                return val;
            };

            var _parseBoolean = function(bol) {
                var val = bol;
                if (typeof val === "string") {
                    if (val.toLowerCase() === "true") {
                        val = true;
                    } else if (val.toLowerCase() === "false") {
                        val = false;
                    }
                }
                return val;
            };

            var _destroy = function(self) {
                self.$ele.off();
                self.$ele.removeData();
                self.$ele = null;
            };

            // support gul gk engine
            var _gkApi = function(gridId, columnId, columnName) {
                if (typeof gk !== "undefined" && gk._addIdMap) {
                    gk._addIdMap(_gkPluginKey, columnId);
                    var md = gk._getComMethod(_gkPluginKey);
                    if (md) {
                        var decoId = md.decorate.call(this, columnName, gridId);
                        gk._addIdDeco(columnId, decoId);
                    } else {
                        gk._addIdDeco(columnId, gridId + "::" + columnName);
                    }
                }
            };

            var _getAttr = function(self, keys) {
                var $ele = self.$ele, 
                    obj = {},
                    value, defaultVal;
                for (var i = 0, len = keys.length; i < len; i++) {
                    value = $ele.attr(keys[i]);
                    defaultVal = '{{' + keys[i] + '}}';
                    if (value !== defaultVal) {
                        obj[keys[i]] = value;
                    }
                }
                return obj;
            };

            this.init = function() {
                var self = this,
                    $ele = self.$ele,
                    gridId = $ele.closest('table').attr('id'),
                    gridSettings = $('#' + gridId).gk().options,
                    settings, settingsGK;

                settings = _getAttr(self, _attrs);
                settingsGK = _getAttr(self, _attrsGK);
                settings = _extendAttrs(settings, settingsGK, gridId);
                gridSettings.colModel.push(settings);
                _gkApi(gridId, self.id, settings['name']);
                _destroy(self);
            };
        }
    }
});