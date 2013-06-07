function loadCss(url) {
  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  document.getElementsByTagName("head")[0].appendChild(link);
}
loadCss('js/jquery-ui/jquery-ui-1.10.2.custom/css/ui-ezo/jquery-ui-1.10.2.custom.min.css');
loadCss('js/jqgrid/jqgrid-4.5.2/css/ui.jqgrid.css');
loadCss('js/jqgrid/jqgrid-4.5.2/css/ui.jqgrid.gk.css');

// define resource
require.config({
  baseUrl: 'js/webcomponent',
  paths: {
    'jqgrid_core': '../jqgrid/jqgrid-4.5.2/js/jquery.jqGrid.min',
    'jqgrid_i18n_tw': '../jqgrid/jqgrid-4.5.2/js/i18n/grid.locale-tw',
    'blockUI': '../blockUI/jquery.blockUI.min'
  },
  shim: {
    'jqgrid_core': {
      deps: ['jquery', 'gk']
    },
    'jqgrid_i18n_tw': {
      deps: ['jqgrid_core']
    }
  }
});

define(['jqgrid_core', 'jqgrid_i18n_tw', 'blockUI'], function() {
  return {
    name: 'JQGrid',
    template: "<table id='{{id}}' altRows='{{stripe}}' gridview='{{gridview}}' gk-headervisible='{{headervisible}}' gk-init='{{init}}' rownumbers='{{seqposition}}' gk-onRow='{{onrow}}' gk-pager='{{page}}' rowNum='{{pagesize}}' gk-rowList='{{pagesizelist}}' gk-rowEditor='{{roweditor}}' filterToolbar='{{filtertoolbar}}' gk-height='{{height}}' gk-width='{{width}}' multiselect='{{checkbox}}' caption='{{heading}}' shrinkToFit='{{shrinktofit}}'>  <tbody>    <tr>      <td><content></content>        <JQColEnd/>      </td>    </tr>  </tbody></table><div id='{{id}}_pager'></div>",
    script: function() {
      var _id, _record, _$jqGrid,
        $ = window.jQuery,
        isgk = !! window.gk,
        _gkPluginKey = "jqGrid";

      var _default = {
        'width': '100%',
        'height': '150',
        'multiselect': true,
        'caption': ' ',
        'shrinkToFit': true,
        'filterToolbar': false,
        'rowNum': 1000,
        'rowList': [],
        'rownumbers': false,
        'gridview': false,
        'altRows': true
      };

      var _defaultGK = {
        'gk-pager': '',
        'gk-width': '',
        'gk-height': '',
        'gk-rowEditor': '',
        'gk-rowList': '',
        'gk-onRow': '',
        'gk-init': '',
        'gk-headervisible': "true"
      };

      var _defaultNoEdit = {
        'datatype': 'local',
        'viewrecords': true,
        'cellsubmit': 'clientArray',
        'editurl': 'clientArray',
        'cellEdit': false,
        'multiboxonly': false,
        'autowidth': true,
        'scroll': false,
        'autoencode': true,
        'loadui': 'disable',
        'altclass': 'gk-row-alt'
      };

      var _attrs = $.map(_default, function(value, key) {
        return key + "";
      });

      var _attrsGK = $.map(_defaultGK, function(value, key) {
        return key + "";
      });

      var _extendAttrs = function(settings, settingsGK) {
        var val = $.extend({}, _defaultNoEdit, _default),
          valGK = $.extend({}, _defaultGK),
          rg = /{{.*}}/i,
          rgPrefix = /gk-/i,
          gridId = _id,
          lastSelectRowId,
          excepAttrs = ["gk-init", "gk-onRow", "gk-headervisible"];

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
          if ($.inArray(key, excepAttrs) !== -1) {
            return;
          }

          var decKey = key.replace(rgPrefix, "");
          switch (key) {
            case "gk-rowList":
              var ary = value.split(',');
              for (var i = 0, len = ary.length; i < len; i++) {
                if (ary[i]) {
                  val[decKey].push(ary[i]);
                }
              }
              break;
            case "gk-rowEditor":
              if (value === "true") {
                val.onSelectRow = function(id, status, evt) {
                  if (id && id !== lastSelectRowId) {
                    var $grid = $("#" + gridId);
                    $grid.jqGrid('saveRow', lastSelectRowId);
                    $grid.jqGrid('editRow', id, {
                      keys: true,
                      aftersavefunc: function() {
                        lastSelectRowId = null;
                      }
                    });
                    lastSelectRowId = id;
                  }
                };
              }
              break;
            case "gk-pager":
              if (value === "true") {
                val[decKey] = '#' + gridId + "_pager";
                val["scroll"] = false;
              }
              break;
            case "gk-width":
              val[decKey] = value;
              if (value.length > 0 && value !== "100%") {
                val['autowidth'] = false;
              }
              break;
            default:
              val[decKey] = value;
              break;
          }
        });

        val = _parseAttrsType(val);
        _record = $.extend({}, valGK, val);
        return val;
      };

      var _checkSettings = function(settings) {
        var val = $.extend({}, settings);
        if (!val.onSelectRow) {
          var colModel = val.colModel;
          for (var i = 0, len = colModel.length; i < len; i++) {
            if (colModel[i].editable) {
              val.cellEdit = true;
            }
          }
        }
        return val;
      };

      var _onEvent = function($el) {
        if (_record['gk-onRow']) {
          $el.on('jqGridSelectRow', function() {
            if (isgk) {
              gk.event(_record['gk-onRow']);
            }
          });
        }
        if (_record['gk-init']) {
          $el.on('jqGridInitGrid', function() {
            if (isgk) {
              gk.event(_record['gk-init']);
            }
          });
        }
      };

      var _clearAttr = function($el) {
        $el instanceof jQuery ? '' : ($el = $($el));
        var all = _attrs.concat(_attrsGK);
        $.each(all, function() {
          $el.removeAttr(this);
        });
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

      var jqgrid_caption = function() {
        var $jqGrid = _$jqGrid;
        if ($jqGrid) {
          $jqGrid.find('.ui-jqgrid-title').height(14);
          if (_record['gk-headervisible'] === "true") {
            $jqGrid.find('.ui-jqgrid-titlebar').show();
          } else {
            $jqGrid.find('.ui-jqgrid-titlebar').hide();
          }
        }
      };

      var jqgrid_adjustSize = function(thisObj) {
        // _$jqGrid should exist after initialize 
        if (_$jqGrid) {
          thisObj.width(_$jqGrid.width());
          thisObj.height(_$jqGrid.height());
        }
      };

      var jqgrid_override = function(thisObj) {
        var $ele = thisObj.$ele;
        // resolve the problem of getting data after filtering
        $.jgrid.gkoldfrom = $.jgrid.from;
        $.jgrid.gkData = {};
        $.jgrid.from = function() {
          var result = $.jgrid.gkoldfrom.apply(this, arguments),
            old_select = result.select;
          result.select = function() {
            var val = old_select.apply(this, arguments);
            $ele.triggerHandler("gk.jqGridLastSelected", [val.slice(0)]);
            return val;
          };
          return result;
        };
      };

      var jqgrid_updateRowNum = function(thisObj, data) {
        // disable rowNum limit
        var $ele = thisObj.$ele,
            size;
        if ($.type(data) !== "array" || !thisObj) {
            return false;
        }
        size = data.length;
        if (_record['gk-pager'] !== "true") {
            $ele.jqGrid("setGridParam", {
              rowNum: size
            });
        }
      };

      this.init = function() {
        var self = this,
            settings, settingsGK;

        // support jqgrid of gul
        _id = self.id;
        if (isgk && gk._addIdMap) {
            gk._addIdMap(_gkPluginKey, _id);
        }

        settings = _getAttr(self, _attrs);
        settings.colModel = [];
        settingsGK = _getAttr(self, _attrsGK);
        settings = _extendAttrs(settings, settingsGK);
        _clearAttr(self.$ele);
        self.options = $.extend({}, settings);
      };

      this.jqGrid = function() {
        var self = this,
            $ele = self.$ele,
            settings = self.options,
            colMod = settings['colModel'],
            width = settings.width + "",
            height = settings.height + "";
        if (arguments.length === 0) {
            settings = _checkSettings(settings);
            $ele.one("jqGridInitGrid", function() {
                self.filterToolbar(settings.filterToolbar);
                _$jqGrid = $ele.closest(".ui-jqgrid");
                jqgrid_caption();
                if (isNaN(width)) {
                  self.width(width);
                }
                if (isNaN(height)) {
                  self.height(height);
                }
                jqgrid_override(self);
            });
            _onEvent($ele);
            $ele.jqGrid(settings);
        } else {
            return $ele.jqGrid(arguments[0], arguments[1], arguments[2]);
        }
        $ele.triggerHandler("gk.jqGridInit");
      };

      this.width = function(width) {
        var self = this,
            $ele = self.$ele,
            newWidth = width,
            $jqGrid = _$jqGrid ? _$jqGrid : $ele.closest(".ui-jqgrid"),
            $parent;

        if (typeof width === "string" && width.match("^(100|[1-9][0-9])%$")) {
            width = width.replace("%", "");
            $parent = $jqGrid.closest('[class*=x-component]');
            if ($parent.length === 0) {
              // support jqgrid of html
              $parent = $jqGrid.parent(); 
            }
            newWidth = $parent.outerWidth() * width / 100;
        }
        if (!isNaN(newWidth)) {
            $ele.jqGrid('setGridWidth', newWidth);
        }
      };

      this.height = function(height) {
        var self = this,
            $ele = self.$ele,
            newHeight = height,
            $jqGrid = _$jqGrid ? _$jqGrid : $ele.closest(".ui-jqgrid"),
            $titlebar = $jqGrid[0] ? $jqGrid.find('.ui-jqgrid-titlebar') : [],
            $pager = $jqGrid[0] ? $jqGrid.find('.ui-jqgrid-pager') : [],
            $hdiv = $jqGrid[0] ? $jqGrid.find('.ui-jqgrid-hdiv') : [],
            $parent;
        if (typeof height === "string" && height.match("^(100|[1-9][0-9])%$")) {
            height = height.replace("%", "");
            $parent = $jqGrid.closest('[class*=x-component]');
            if ($parent.length === 0) {
              // support jqgrid of html
              $parent = $jqGrid.parent();
            }
            newHeight = $parent.outerHeight() * height / 100;
        }
        if ($hdiv.length > 0 && $hdiv.css('display').toLowerCase() !== "none") {
            newHeight -= $hdiv.outerHeight();
        }
        if ($titlebar.length > 0 && $titlebar.css('display').toLowerCase() !== "none") {
            newHeight -= $titlebar.outerHeight();
        }
        if ($pager.length > 0 && $pager.css('display').toLowerCase() !== "none") {
            newHeight -= $pager.outerHeight();
        }
        if (!isNaN(newHeight)) {
            $ele.jqGrid('setGridHeight', newHeight);
        }
      };

      this.heading = function (heading) {
        var self = this,
            $ele = self.$ele;
        if (_record['gk-headervisible'] === "true") {
            $ele.jqGrid("setCaption", heading);
        }
      };

      this.row = function () {
        var rowid = this.$ele.jqGrid("getGridParam", "selrow"),
          data = this.$ele.jqGrid("getRowData", rowid);
        if (rowid) {
          data.id = data.id ? data.id : rowid;
        }
        return data;
      };

      this.selectRow = function () {
        var rowids = this.$ele.jqGrid("getGridParam", "selarrrow");
        var rowdata = [],
          data;
        if (rowids.length > 0) {
          for (var i = 0, len = rowids.length; i < len; i++) {
            data = this.$ele.jqGrid("getRowData", rowids[i]);
            data.id = data.id ? data.id : rowids[i];
            rowdata.push(data);
          }
        }
        return rowdata;
      };

      this.info = function(args) {
        var self = this,
          $ele = self.$ele,
          options;

        if (!$ele.jqGrid("getGridParam")) {
          // support jqgrid of html
          $ele.one("gk.jqGridInit", args, function (evt) {
            $(this).gk("info", evt.data);
          });
          return false;
        } else {
          if (arguments.length == 0) {
            var p = $ele.jqGrid("getGridParam");
            if (p.search === true) {
              return $.jgrid.gkData.afterFilterData;
            }
            return p.data;
          } else {
            if ($.type(args) === "object") {
              var temp = [];
              temp.push(args);
              args = temp;
            }
            if ($.type(args) !== "array") {
              return false;
            }
            $ele.jqGrid("destroyFrozenColumns");
            $ele.jqGrid("clearGridData");
            jqgrid_updateRowNum(self, args);
            $ele.jqGrid("setGridParam", {
              data: args
            });
            $ele.jqGrid("setFrozenColumns").trigger("reloadGrid", [{current: true}]);
            jqgrid_adjustSize(self);
          }
        }
      };

      this.frozen = function() {
        var self = this,
          $ele = self.$ele,
          settings = self.options,
          length = arguments.length;

        var val = _parseBoolean(arguments[0]);
        if (val === true) {
          var args = arguments[1] && arguments[1].constructor === Array ? arguments[1] : [];
          $ele.jqGrid("destroyFrozenColumns");
          var colModel = settings['colModel'];
          for (var i = 0, len = colModel.length; i < len; i++) {
            if ($.inArray(colModel[i].name, args) > -1) {
              $ele.jqGrid("setColProp", colModel[i].name, {
                frozen: true
              });
            } else {
              $ele.jqGrid("setColProp", colModel[i].name, {
                frozen: false
              });
            }
          }
          $ele.jqGrid("setFrozenColumns").trigger("reloadGrid", [{current: true}]);
        } else if (val === false) {
          $ele.jqGrid("destroyFrozenColumns");
        }
      };

      this.filterToolbar = function(args) {
        var $ele = this.$ele;
        if (args === true) {
          $ele.jqGrid('filterToolbar', {
            searchOnEnter: false,
            enableClear: false
          });
        } else {
          $ele.jqGrid('destroyFilterToolbar');
        }
      };

      this.filter = function(value) {
        var $ele = this.$ele,
          p = $ele.jqGrid('getGridParam'),
          colModel = p.colModel,
          sdata = {},
          sopt = {},
          sd = false,
          val = "",
          nm, so;

        if (value && typeof value === "string") {
          val = value;
          sd = true;
        }

        $.each(colModel, function() {
          nm = this.index || this.name;
          so = (this.searchoptions && this.searchoptions.sopt) ? this.searchoptions.sopt[0] : this.stype == 'select' ? 'eq' : 'bw';
          sdata[nm] = val;
          sopt[nm] = so;
        });

        if (p.datatype === "local") {
          var ruleGroup = "{\"groupOp\":\"OR\",\"rules\":[",
            gi = 0;
          if (sd === false) {
            ruleGroup = null;
          } else {
            $.each(sdata, function(i, n) {
              if (gi > 0) {
                ruleGroup += ",";
              }
              ruleGroup += "{\"field\":\"" + i + "\",";
              ruleGroup += "\"op\":\"" + sopt[i] + "\",";
              ruleGroup += "\"data\":\"" + n.replace(/\\/g, '\\\\').replace(/\"/g, '\\"') + "\"}";
              gi++;
            });
            ruleGroup += "]}";
            $ele.one("gk.jqGridLastSelected", function(evt, lastSelected) {
              var gkData = $.jgrid.gkData;
              if (typeof gkData === "object") {
                gkData.afterFilterData = lastSelected;
              }
            });
          }
          $.extend(p.postData, {
            filters: ruleGroup
          });
          $ele.jqGrid("setGridParam", {
            search: sd
          }).trigger("reloadGrid", [{
              page: 1
            }
          ]);
          jqgrid_adjustSize(this);
        }
      };

      this.addRowData = function(rdata) {
        if (rdata) {
          var $ele = this.$ele;
          if ($.isArray(rdata)) {
            $ele.jqGrid("addRowData", "id", rdata);
          } else {
            $ele.jqGrid("addRowData", rdata.id, rdata);
          }
        }
      };

      this.setCell = function(rowid, colName, cellData, addclass, attrs) {
        if (cellData) {
          this.$ele.jqGrid("setCell", rowid, colName, cellData, addclass, attrs);
        }
      };

      this.getCell = function(rowid, colName) {
        return this.$ele.jqGrid("getCell", rowid, colName);
      };

      this.delRowData = function() {
        var $ele = this.$ele,
          rowids, rowSize;
        if (arguments.length === 0 || arguments[0] === "") {
          rowids = $ele.jqGrid("getGridParam", "selarrrow");
          rowSize = rowids.length;
          for (var i = 0; i < rowSize; i++) {
            $ele.jqGrid("delRowData", rowids[0]);
          }
        } else {
          rowids = arguments[0];
          if ($.type(rowids) === "string" || $.isNumeric(rowids)) {
            $ele.jqGrid("delRowData", rowids);
          } else if ($.type(rowids) === "array") {
            rowSize = rowids.length;
            for (var i = 0; i < rowSize; i++) {
              $ele.jqGrid("delRowData", rowids[i]);
            }
          }
        }
      };

      this.hidden = function(colName, isHidden) {
        var $ele = this.$ele,
          gridWidth = $ele.getGridParam("width");
        if (_parseBoolean(isHidden) === true) {
          $ele.jqGrid("hideCol", colName);
        } else {
          $ele.jqGrid("showCol", colName);
        }
        $ele.setGridWidth(gridWidth);
      };

      this.mask = function(param) {
        var val = param + "",
          $grid = _$jqGrid,
          obj = {
            css: {
              border: 'none',
              padding: '5px',
              backgroundColor: '#000',
              '-webkit-border-radius': '10px',
              '-moz-border-radius': '10px',
              opacity: .6,
              color: '#fff'
            }
          };

        if (!$.blockUI) {
          return;
        }
        if (val === "false") {
          $grid.unblock();
        } else if (val === "true") {
          $grid.block();
        } else if (typeof param === "object") {
          $grid.block(param);
        } else {
          obj.message = val;
          $grid.block(obj);
        }
      };
    }
  }
});