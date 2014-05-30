define(function () {
  return {
    template: "<div id='{{id}}' gk-decorator='{{decorator}}' gk-undecorator='{{undecorator}}' gk-id='{{id}}' gk-format='{{format}}' gk-edittype='{{type}}' align='{{align}}' gk-hidden='{{hidden}}' sortable='{{sortable}}' frozen='{{frozen}}' label='{{label}}' name='{{name}}' index='{{index}}' width='{{width}}' search='{{search}}' editable='{{editable}}' url='{{url}}' value='{{value}}' maxlength='{{maxlength}}' allowblank='{{allowblank}}' onclick='{{onclick}}' onfocus='{{onfocus}}' onchange='{{onchange}}'><content></content></div>",
    script: function () {
      "use strict";

      var _record,
          _gkPluginKey = "jqGrid",
          $ = window.jQuery,
          self = this,
          $ele = self.$ele,
          cYearReg = /[y|Y]{4}/g;

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
        'maxlength': '',
        'allowblank': true,
        'onclick': '',
        'onfocus': '',
        'onchange': '',
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
          }
        });

        val = _parseAttrsType(val);
        _record = $.extend({}, valGK, val);

        return val;
      };

      var _setCommonAttrs = function (settings) {
        if (!_parseBoolean(settings["allowblank"])) {
          if (settings["editrules"]) {
            settings["editrules"]["required"] = true;
          } else {
            settings["editrules"] = {required: true};
          }
        }
      };

      var _dateFormatter = function (fmt, val) {
        var isCY = fmt.match(cYearReg) ? true : false,
            y = isCY ? parseInt(val.slice(0, 4)) : parseInt(val.slice(0, 4)) - 1911,
            o = {
              "m+": parseInt(val.slice(4, 6)),
              "d+": parseInt(val.slice(6))
            };
        if (/(y+)/.test(fmt)) {
          if (isCY) {
            fmt = fmt.replace(RegExp.$1, (y + "").substr(4 - RegExp.$1.length));
          } else {
            for (var i = 0; i < 3 - String(y).length; i++) {
              y = "0" + String(y);
            }
            fmt = fmt.replace(RegExp.$1, (y + "").substr(3 - RegExp.$1.length));
          }
        }
        for (var k in o) {
          if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
          }
        }
        return fmt;
      };

      var _twdatepicker = function () {
        var orig_generateMonthYearHeader = $.datepicker._generateMonthYearHeader,
            orig_get = $.datepicker._get;
        $.extend($.datepicker, {
          _generateMonthYearHeader: function (a, b, c, d, e, f, g, h) {
            var htmlYearMonth = orig_generateMonthYearHeader.apply(this, [a, b, c, d, e, f, g, h]);
            if ($(htmlYearMonth).find(".ui-datepicker-year").length > 0) {
              htmlYearMonth = $(htmlYearMonth).find(".ui-datepicker-year").find("option").each(function (i, e) {
                if (Number(e.value) - 1911 > 0) {
                  $(e).text(Number(e.innerText) - 1911);
                }
              }).end().end().get(0).outerHTML;
            }
            return htmlYearMonth;
          },
          _get: function (a, b) {
            a.selectedYear = a.selectedYear - 1911 < 0 ? a.selectedYear + 1911 : a.selectedYear;
            a.drawYear = a.drawYear - 1911 < 0 ? a.drawYear + 1911 : a.drawYear;
            a.curreatYear = a.curreatYear - 1911 < 0 ? a.curreatYear + 1911 : a.curreatYear;
            return orig_get.apply(this, [a, b]);
          }
        });
      };

      var _doEdittype = function (settings, gridId, decKey, value) {
        switch (value) {
          case "text":
            settings["editoptions"] = {
              maxlength: settings["maxlength"]
            };
            break;
          case "number":
            settings[decKey] = "text";
            settings["formatter"] = function (cellval, opts, rwd, act) {
              return $.formatNumber(cellval, {format: settings["gk-format"], locale: "tw"});
            };
            settings["unformat"] = function (cellval, opts) {
              return $.parseNumber(cellval, {format: settings["gk-format"], locale: "tw"});
            };
            settings["editrules"] = {
              number: true
            };
            settings["editoptions"] = {
              maxlength: settings["maxlength"]
            };
            break;
          case "textarea":
            settings[decKey] = value;
            settings["formatter"] = "textarea";
            settings["editoptions"] = {
              rows: 2,
              cols: 10
            };
            break;
          case "date":
            var fmt = 'Y/m/d',
                yFmtReg = /(y+)/,
                format = settings["gk-format"].toLowerCase(),
                isCY = false;
            // only support 'yyy' and 'yyyy' year format
            if (format.length > 0) {
              fmt = format.replace(yFmtReg, "Y");
              fmt = fmt.replace("mm", "m");
              fmt = fmt.replace("dd", "d");
              isCY = cYearReg.test(format);
              if (!isCY) {
                _twdatepicker();
                format = format.replace(yFmtReg, 'yyy');
              }
            }
            settings["sorttype"] = function (cell) {
              if (cell.length === 0) {
                return -1;
              }
              return parseInt(cell, 10);
            };
            settings["formatter"] = function (cellval, opts, rwd, act) {
              return _dateFormatter(format, cellval);
            };
            settings["unformat"] = function (cellval, opts) {
              var year,
                  date = $.datepicker.parseDate(format.replace(yFmtReg, 'yy'), cellval);
              if (isCY) {
                year = date.getFullYear();
              } else {
                var yearStr = String(date.getFullYear());
                if (yearStr.length === 4) {
                  yearStr = yearStr.slice(-2);
                }
                year = Number(yearStr) + 1911;
              }
              return year + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
            };
            settings["formatoptions"] = {
              srcformat: 'Ymd',
              newformat: fmt,
              parseRe: /(\d{1,4})\/?(\d{1,2})\/?(\d{1,2})/
            };
            settings["editoptions"] = {
              size: 15,
              dataInit: function (el) {
                $(el).datepicker();
                $('.ui-datepicker').css('font-size', '12px');
                $('.ui-datepicker-trigger').css('vertical-align', 'middle').css('padding-left', '2px');
              }
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
            if (settings["url"]) {
              settings["editoptions"] = {dataUrl: settings["url"]};
            } else {
              settings["editoptions"] = {value: settings["value"]};
            }
            settings["editoptions"].dataEvents = [{
              type: 'change',
              fn: function (e) {
                var exec = new Function(settings['onchange']);
                exec();
              }
            }];
            break;
          case "checkbox":
            settings[decKey] = "checkbox";
            settings["editoptions"] = {value: settings["value"]};
            settings["formatter"] = "checkbox";
            settings["formatoptions"] = {
              disabled: false
            };
            break;
          case "button":
            settings[decKey] = "button";
            settings["search"] = false;
            settings["editable"] = false;
            settings["editoptions"] = {value: settings["label"]};
            settings["formatter"] = function (cellval) {
              return "<input type='button' name='" + cellval + "' value='" + settings['label'] + "' onclick='" + settings['onclick'] + "' />";
            };
            break;
          case "image":
            settings[decKey] = "image";
            settings["editable"] = false;
            settings["search"] = false;
            settings["formatter"] = function (cellval) {
              var imgSrc;
              if (cellval) {
                imgSrc = cellval;
              } else {
                imgSrc = settings['value'];
              }
              return "<img src='" + imgSrc + "' title='" + settings['label'] + "' />";
            };
          case "trigger":
            settings[decKey] = "custom";
            settings["editoptions"] = {custom_element: triggerelem, custom_value: triggervalue};
        }
        _setCommonAttrs(settings, gridId, decKey, value);
        return settings;
      };

      var triggerelem = function (cellData, options) {
        var htmlStr = "<input type='text' style='width:90%' name='" + options.id + "' value='" + cellData + "'";
        if (_record.onfocus) {
          htmlStr += " onfocus='" + _record.onfocus + "'";
        }
        return htmlStr += " />";
      };

      var triggervalue = function (elem, operation, value) {
        if (operation === 'get') {
          return $(elem).val();
        } else if (operation === 'set') {

        }
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