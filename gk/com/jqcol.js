define(function () {
  return {
    template: "<div id='{{id}}' gk-decorator='{{decorator}}' gk-undecorator='{{undecorator}}' gk-id='{{id}}' gk-format='{{format}}' gk-edittype='{{type}}' align='{{align}}' gk-hidden='{{hidden}}' sortable='{{sortable}}' frozen='{{frozen}}' label='{{label}}' name='{{name}}' index='{{index}}' width='{{width}}' search='{{search}}' editable='{{editable}}' url='{{url}}' value='{{value}}' onclick='{{onclick}}'><content></content></div>",
    script: function () {
      "use strict";

      var _record,
          _gkPluginKey = "jqGrid",
          $ = window.jQuery,
          self = this,
          $ele = self.$ele;

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
        'url': '',
        'value': '',
        'onclick': '',
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
        'classes': 'gk-column'
      };

      var _attrs = $.map(_default, function (value, key) {
        return key + "";
      });

      var _attrsGK = $.map(_defaultGK, function (value, key) {
        return key + "";
      });

      var _extendAttrs = function (settings, settingsGK, gridId) {
        var val = $.extend({}, _defaultNoEdit, _default),
          valGK = $.extend({}, _defaultGK),
          rg = /\${.*}/i,
          rgPrefix = /gk-/i;

        $.each(settings, function (key, value) {
          if (!rg.test(value + "") && value !== undefined) {
            val[key] = value;
          }
        });

        $.each(settingsGK, function (key, value) {
          if (!rg.test(value + "") && value !== undefined) {
            valGK[key] = value;
          }
        });
        $.each(valGK, function (key, value) {
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

      var radioelem = function (cellData, options) {
        var htmlStr = '',
            radios = _record.value.split(":");
        $.each(radios, function (idx, val) {
          htmlStr += "<input type='radio' name='" + options.id + "'>" + val + "</input>";
        });
        return htmlStr;
      };

      var radiovalue = function (elem, operation, value) {
        if (operation === 'get') {
          return $(elem).val();
        } else if (operation === 'set') {
          if ($(elem).is(':checked') === false) {
            $(elem).filter('[value=' + value + ']').attr('checked', true);
          }
        }
      };

      var _dateFormatter = function (fmt, val) {
        var y = parseInt(val.slice(0, 4)) - 1911,
            o = {
              "m+": parseInt(val.slice(4, 6)),
              "d+": parseInt(val.slice(6))
            };
        if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (y + "").substr(3 - RegExp.$1.length));
        }
        for (var k in o) {
          if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
          }
        }
        return fmt;
      };

      var _doEdittype = function (settings, gridId, decKey, value) {
        switch (value) {
          case "textarea":
            settings[decKey] = value;
            break;
          case "date":
            var fmt = 'Y/m/d',
                format = settings["gk-format"].toLowerCase(),
                newFormatParseRe,
                cYearReg = /[y|Y]{4}/g,
                isCY = false;

            if (format.length > 0) {
              if (format.match(cYearReg)) {
                isCY = true;
              }
              fmt = format.replace(/yyyy|yyy|yy/g, "Y");
              fmt = fmt.replace("mm", "m");
              fmt = fmt.replace("dd", "d");
            }
            newFormatParseRe = _getDateParseRe(format);
            settings["sorttype"] = function (cell) {
              if (cell.length === 0) {
                return -1;
              }
              return parseInt(cell, 10);
            };
            if (isCY) {
              settings["formatter"] = "date";
            } else {
              settings["formatter"] = function (cellval, opts, rwd, act) {
                return _dateFormatter(format, cellval);
              };
            }
            settings["editoptions"] = {
              dataInit: function (el) {
                $(el).datepicker();
              }
            };
            settings["unformat"] = function (cellvalue, options) {
              var op = $.extend(true, {}, options.colModel);
              op.formatoptions.parseRe = newFormatParseRe;
              return $.unformat.date.call(this, cellvalue, op);
            };
            settings["formatoptions"] = {
              srcformat: 'Ymd',
              newformat: fmt,
              parseRe: /(\w{1,4})\/?(\w{1,2})\/?(\w{1,2})/g
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
          case "select":
            settings[decKey] = "select";
            settings["edittype"] = "select";
            if (settings["url"]) {
              settings["editoptions"] = {dataUrl: settings["url"]};
            } else {
              settings["editoptions"] = {value: settings["value"]};
            }
            break;
          case "checkbox":
            settings[decKey] = "checkbox";
            settings["edittype"] = "checkbox";
            settings["editoptions"] = {value: settings["value"]};
            settings["formatter"] = "checkbox";
            settings["formatoptions"] = {
              disabled: false
            };
            break;
          case "radio":
            settings[decKey] = "radio";
            settings["edittype"] = "radio";
            settings["editable"] = false;
            //settings["editoptions"] = {custom_element: radioelem, custom_value: radiovalue};
            //settings["formatter"] = "radio";

            settings["formatter"] = function (cellData, options) {
              var htmlStr = '',
                  radios = options.colModel.value.split(":");
              $.each(radios, function (idx, val) {
                htmlStr += "<input type='radio' name='" + settings['name'] + "_" + options.rowId + "'>" + val + "</input>";
              });
              return htmlStr;
            };
            break;
          case "button":
            settings[decKey] = "button";
            settings["search"] = false;
            settings["edittype"] = "button";
            settings["editable"] = false;
            settings["editoptions"] = {value: settings["label"]};
            settings["formatter"] = function (cellData, options) {
              return "<input type='button' name='" + cellData + "' value='" + settings['label'] + "' onclick='" + settings['onclick'] + "' />";
            };
            break;
          default:
            break;
        }
        return settings;
      };

      var _getDateParseRe = function (format) {
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

      var _getFmtTypeValue = function (fmtType) {
        return "gk_fmt_" + fmtType;
      };

      var _getFmtType = function (fmtTypeValue) {
        return fmtTypeValue.substring(7);
      };

      var _setFormatter = function (fmtTypeValue, gridId) {
        if (typeof $.jgrid !== "undefined") {
          _formatter(fmtTypeValue);
        } else {
          $("#" + gridId).one("jqGridBeforeRequest", function () {
            _formatter(fmtTypeValue);
          });
        }
      };

      var _formatter = function (fmtTypeValue) {
        var fmatter = $.fn.fmatter,
            fmtobj = {},
            unfmtobj = {};

        if (typeof fmatter[fmtTypeValue] === "undefined") {
          switch (_getFmtType(fmtTypeValue)) {
            case "label":
              var doAction = function (cellvalue, options, dataOrCell, funcStr) {
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
              fmtobj[fmtTypeValue] = function (cellvalue, options, rowdata) {
                var decorator = options.colModel['gk-decorator'];
                return doAction(cellvalue, options, rowdata, decorator);
              };
              unfmtobj['unformat'] = function (cellvalue, options, cellElement) {
                var undecorator = options.colModel['gk-undecorator'];
                return doAction(cellvalue, options, cellElement, undecorator);
              };
              $.extend(fmatter, fmtobj);
              $.extend(fmatter[fmtTypeValue], unfmtobj);
              break;
          }
        }
      };

      var _parseAttrsType = function (settings) {
        var val = $.extend({}, settings);
        $.each(_default, function (key, value) {
          if (typeof value === "boolean") {
            val[key] = _parseBoolean(val[key]);
          }
        });
        return val;
      };

      var _parseBoolean = function (bol) {
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

      var _destroy = function () {
        $ele.off();
        $ele.removeData();
        $ele = null;
      };

      // support gul gk engine
      var _gkApi = function (gridId, columnId, columnName) {
        if (typeof gk !== "undefined" && gk._addIdMap) {
          gk._addIdMap(_gkPluginKey, function (id) {
            var rg = new RegExp("^" + columnId + "(_[0-9]+)?$");
            return rg.test(id);
          });
          gk._addIdEnhance(function (id) {
            var ary = null,
                rg = new RegExp("^" + columnId + "(?:_([0-9]+))?$"),
                matchAry;
            if (rg.test(id) === true) {
              matchAry = id.match(rg);
              ary = {
                'grid': gridId,
                'column': columnName,
                'row': matchAry[1]
              };
            }
            return ary;
          });
        }
      };

      var _getAttr = function (keys) {
        var obj = {},
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

      this.init = function () {
        var gridId = $ele.closest('table').attr('id'),
            gridSettings = $('#' + gridId).gk().options,
            settings, settingsGK;

        settings = _getAttr(_attrs);
        settingsGK = _getAttr(_attrsGK);
        settings = _extendAttrs(settings, settingsGK, gridId);
        gridSettings.colModel.push(settings);
        _gkApi(gridId, self.id, settings['name']);
        _destroy();
      };
    }
  };
});