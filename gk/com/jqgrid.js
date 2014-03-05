// define resources
requirejs.config({
  context: 'gk',
  paths: {
    'jqgrid_core': 'lib/jqgrid/js/jquery.jqGrid.src',
    'jqgrid_i18n_tw': 'lib/jqgrid/js/i18n/grid.locale-tw',
    'blockUI': 'lib/blockUI/jquery.blockUI.min'
  },
  shim: {
    'jqgrid_i18n_tw': {
      deps: ['jqgrid_core']
    }
  }
});

// define module (component)
define(['./jqcolend', 'jqgrid_core', 'jqgrid_i18n_tw', 'blockUI', 'css!./jqgrid/css/jquery-ui-1.10.2.custom.min', 'css!./jqgrid/css/ui.jqgrid.gk', 'css!lib/jqgrid/css/ui.jqgrid'], function (jqcolend) {
  if ($ && $.gk && typeof $.gk.registry === "function") {
    $.gk.registry("jqcolend", jqcolend);
  }
  return {
    template: "<table id='{{id}}' altRows='{{stripe}}' gridview='{{gridview}}' gk-headervisible='{{headervisible}}' gk-init='{{init}}' rownumbers='{{seqposition}}' gk-onRow='{{onrow}}' gk-pager='{{page}}' rowNum='{{pagesize}}' gk-rowList='{{pagesizelist}}' gk-rowEditor='{{roweditor}}' filterToolbar='{{filtertoolbar}}' gk-height='{{height}}' gk-width='{{width}}' multiselect='{{checkbox}}' caption='{{heading}}' shrinkToFit='{{shrinktofit}}'>  <tbody>    <tr>      <td><content></content>        <JQColEnd/>      </td>    </tr>  </tbody></table><div id='{{id}}_pager'></div>",
    script: function () {
      "use strict";

      var _id, _record, _$jqGrid,
          self = this,
          $ele = self.$ele,
          $ = window.jQuery,
          isgk = !! window.gk,
          _gkPluginKey = "jqGrid";

      // remote page grid(rpg) objects
      var rpgInfo,
          rpgBarId = ".pagebar";
      var rpgPage = {
        "offset": 0,
        "pageSize": 10,
        "pageSort": false,
        "sortField": "",
        "sortDir": "none"
      };

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

      var _attrs = $.map(_default, function (value, key) {
        return key + "";
      });

      var _attrsGK = $.map(_defaultGK, function (value, key) {
        return key + "";
      });

      var _extendAttrs = function (settings, settingsGK) {
        var val = $.extend({}, _defaultNoEdit, _default),
            valGK = $.extend({}, _defaultGK),
            rg = /{{.*}}/i,
            rgPrefix = /gk-/i,
            gridId = _id,
            lastSelectRowId,
            excepAttrs = ["gk-init", "gk-onRow", "gk-headervisible"];

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
              // use first value of page size list when no page size setup
              if (typeof self.$originEle.attr("rowNum") === "undefined") {
                val["rowNum"] = parseInt(ary[0]);
              }
              break;
            case "gk-rowEditor":
              if (value === "true") {
                val.onSelectRow = function (id, status, evt) {
                  if (id && id !== lastSelectRowId) {
                    var $grid = $("#" + gridId);
                    $grid.jqGrid('saveRow', lastSelectRowId);
                    $grid.jqGrid('editRow', id, {
                      keys: true,
                      aftersavefunc: function () {
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

      var _checkSettings = function (settings) {
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

      var _onEvent = function ($el) {
        if (_record['gk-onRow']) {
          $el.on('jqGridSelectRow', function () {
            if (isgk) {
              gk.event(_record['gk-onRow']);
            }
          });
        }
        if (_record['gk-init']) {
          $el.on('jqGridInitGrid', function () {
            if (isgk) {
              gk.event(_record['gk-init']);
            }
          });
        }
      };

      var _clearAttr = function () {
        $ele instanceof jQuery ? '' : ($ele = $($ele));
        var all = _attrs.concat(_attrsGK);
        $.each(all, function () {
          $ele.removeAttr(this);
        });
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

      var _orgRemotePageGridConfig = function (rpgData) {
        var currentPage = $ele.jqGrid("getGridParam", "page"),
            pageSize = _getRowNum();

        rpgInfo = $.extend(true, {}, {
          "i": {
            "src": _id,
            "url": window.location.href
          },
          "t": "map"
        });
        rpgInfo["i"][_id + rpgBarId] = {};
        rpgPage.pageSize = parseInt(pageSize);
        rpgPage.offset = (currentPage - 1) * pageSize;
        $.extend(true, rpgInfo["i"][_id + rpgBarId], rpgPage);
        $.extend(true, rpgInfo["i"], rpgData.data);
      };

      var _offsetFrozenRoof = function () {
        // have to change the selector
        var $frozenDiv = $('.frozen-div'),
            $frozenBdiv = $('#' + self.id + '_frozen').parent();
        $frozenDiv.offset({'top': $frozenDiv.offset().top - 21});
        $frozenBdiv.offset({'top': $frozenBdiv.offset().top - 21});
      };

      var jqgrid_caption = function () {
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

      var jqgrid_adjustSize = function (thisObj) {
        // _$jqGrid should exist after initialize
        if (_$jqGrid) {
          thisObj.width(_$jqGrid.outerWidth(true));
          thisObj.height(_$jqGrid.outerHeight(true));
        }
      };

      var jqgrid_override = function () {
        // resolve the problem of getting data after filtering
        if (!$.jgrid.gkoldfrom) {
          $.jgrid.gkoldfrom = $.jgrid.from;
          $.jgrid.gkData = {};
          $.jgrid.from = function () {
            var result = $.jgrid.gkoldfrom.apply(this, arguments),
              old_select = result.select;
            result.select = function () {
              var val = old_select.apply(this, arguments);
              $ele.triggerHandler("gk.jqGridLastSelected", [val.slice(0)]);
              return val;
            };
            return result;
          };
        }
      };

      var jqgrid_updateRowNum = function (data) {
        // disable rowNum limit
        var size;
        if ($.type(data) !== "array" || !self) {
          return false;
        }
        size = data.length;
        if (_record['gk-pager'] !== "true") {
          $ele.jqGrid("setGridParam", {
            rowNum: size
          });
        }
      };

      var _getRowNum = function () {
        return parseInt($ele.getGridParam("rowNum"));
      };

      var _getRealRowNum = function () {
        return parseInt($('#' + _id + '_pager .ui-pg-selbox').val());
      };

      var _getUserPage = function () {
        return parseInt($('#' + _id + '_pager .ui-pg-input').val());
      };

      var _setUserPage = function (page) {
        return parseInt($('#' + _id + '_pager .ui-pg-input').val(page));
      };

      var _setGridParam = function (isRpg, args) {
        jqgrid_updateRowNum(args);
        if (isRpg) {
          $ele.jqGrid("setGridParam", {
            url: args.url + "?data",
            editurl: args.url + "?data",
            postData: "&j=" + encodeURIComponent(JSON.stringify(rpgInfo)),
            mtype: "POST",
            datatype: "json",
            gridview: true,
            jsonReader: {
              repeatitems: false,
              records: function (rpgData) {
                return rpgData[_id]["totalSize"];
              },
              total: function (rpgData) {
                return Math.ceil(rpgData[_id]["totalSize"] / _getRealRowNum());
              },
              root: function (rpgData) {
                if (rpgData[_id]) {
                  return rpgData[_id]["data"];
                }
              }
            },
            onPaging: function (operation) {
              var currentPage = parseInt($ele.getGridParam("page"));
              if (operation === "next_g1_pager") {
                rpgInfo["i"][_id + rpgBarId]["offset"] += _getRowNum();
              } else if (operation === "prev_g1_pager") {
                rpgInfo["i"][_id + rpgBarId]["offset"] -= _getRowNum();
              } else if (operation === "last_g1_pager") {
                var lastPage = $ele.getGridParam("lastpage");
                rpgInfo["i"][_id + rpgBarId]["offset"] = (lastPage - 1) * _getRowNum();
              } else if (operation === "first_g1_pager") {
                rpgInfo["i"][_id + rpgBarId]["offset"] = 0;
              } else if (operation === "records") {
                var newPageSize = _getRealRowNum();
                debugger;
                // 判斷舊的停留頁數是否大於修改過後的總頁數，若大於，則停留在最後一頁
                rpgInfo["i"][_id + rpgBarId]["offset"] = (currentPage - 1) * newPageSize;
                rpgInfo["i"][_id + rpgBarId]["pageSize"] = newPageSize;
              } else if (operation === "user") {
                var userPage = _getUserPage();
                if (userPage <= $ele.getGridParam("lastpage")) {
                  rpgInfo["i"][_id + rpgBarId]["offset"] = (_getUserPage() - 1) * _getRowNum();
                } else {
                  _setUserPage(currentPage);
                }
              } else {
                return;
              }

              $ele.jqGrid("setGridParam", {
                postData: "&j=" + encodeURIComponent(JSON.stringify(rpgInfo))
              });
            },
            loadComplete: function (rpgData) {
              // callback process
            }
          });
        } else {
          $ele.jqGrid("setGridParam", {
            data: args,
            gridview: true
          });
        }
      };

      var _doRender = function (isRpg, args) {
        $ele.jqGrid("destroyFrozenColumns");
        $ele.jqGrid("clearGridData");
        _setGridParam(isRpg, args);
        $ele.trigger("reloadGrid", [
          {
            current: true
          }
        ]);
        $ele.jqGrid("setFrozenColumns").trigger("jqGridAfterGridComplete");
        jqgrid_adjustSize(self);
        // offset frozen-div when header non-visible
        if (_record["gk-headervisible"] === "false") {
          _offsetFrozenRoof();
        }
      };

      this.init = function () {
        var settings, settingsGK;

        // support jqgrid of gul
        _id = self.id;
        if (isgk && gk._addIdMap) {
          gk._addIdMap(_gkPluginKey, _id);
        }

        settings = _getAttr(_attrs);
        settings.colModel = [];
        settingsGK = _getAttr(_attrsGK);
        settings = _extendAttrs(settings, settingsGK);
        _clearAttr();
        self.options = $.extend(true, {}, settings);
      };

      this.jqGrid = function () {
        var settings = self.options,
            colMod = settings['colModel'],
            width = settings.width + "",
            height = settings.height + "";

        if (arguments.length === 0) {
          settings = _checkSettings(settings);
          $ele.one("jqGridInitGrid", function () {
            self.filterToolbar(settings.filterToolbar);
            _$jqGrid = $ele.closest(".ui-jqgrid");
            jqgrid_caption();
            // reset width and height. The original data aren't what we mean.
            self.width(width);
            self.height(height);
            jqgrid_override();
          });
          _onEvent($ele);
          $ele.jqGrid(settings);
        } else {
          return $ele.jqGrid(arguments[0], arguments[1], arguments[2]);
        }
        $ele.triggerHandler("gk.jqGridInit");
      };

      this.width = function (width) {
        var newWidth = width,
            $jqGrid = _$jqGrid ? _$jqGrid : $ele.closest(".ui-jqgrid"),
            otherWidth = $jqGrid.length > 0 ? $jqGrid.outerWidth(true) - $jqGrid.width() : 0,
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
        // subtract padding, border and margin
        if (newWidth > otherWidth) {
          newWidth -= otherWidth;
        }
        if (!isNaN(newWidth)) {
          $ele.jqGrid('setGridWidth', newWidth);
        }
      };

      this.height = function (height) {
        var newHeight = height,
            $jqGrid = _$jqGrid ? _$jqGrid : $ele.closest(".ui-jqgrid"),
            $titlebar = $jqGrid[0] ? $jqGrid.find('.ui-jqgrid-titlebar') : [],
            $pager = $jqGrid[0] ? $jqGrid.find('.ui-jqgrid-pager') : [],
            $hdiv = $jqGrid[0] ? $jqGrid.find('.ui-jqgrid-hdiv') : [],
            otherHeight = $jqGrid.length > 0 ? $jqGrid.outerHeight(true) - $jqGrid.height() : 0,
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
        // subtract padding, border, mragin
        if (newHeight > otherHeight) {
          newHeight -= otherHeight;
        }
        if (!isNaN(newHeight)) {
          $ele.jqGrid('setGridHeight', newHeight);
        }
      };

      this.heading = function (heading) {
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

      this.render = function (args) {
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
            if ($.type(args) !== "array") {
              if ($.type(args) === "object") {
                // remote page grid injection
                if (args.url && args.data) {
                  _orgRemotePageGridConfig(args);
                  _doRender(true, args);
                } else {
                  return false;
                }
              }
            } else {
              _doRender(false, args);
            }
          }
        }
      };

      this.frozen = function () {
        var settings = self.options;
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

          $ele.trigger("reloadGrid", [{
            current: true
          }]);
          $ele.jqGrid("setFrozenColumns").trigger("jqGridAfterGridComplete");

          // offset frozen-div when header non-visible
          if (_record["gk-headervisible"] === "false") {
            _offsetFrozenRoof();
          }
        } else if (val === false) {
          $ele.jqGrid("destroyFrozenColumns");
        }
      };

      this.filterToolbar = function (args) {
        if (args === true) {
          $ele.jqGrid('filterToolbar', {
            searchOnEnter: false,
            enableClear: false,
            defaultSearch: 'cn'
          });
        } else {
          $ele.jqGrid('destroyFilterToolbar');
        }
      };

      this.filter = function (value) {
        var p = $ele.jqGrid('getGridParam'),
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

        $.each(colModel, function () {
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
            $.each(sdata, function (i, n) {
              if (gi > 0) {
                ruleGroup += ",";
              }
              ruleGroup += "{\"field\":\"" + i + "\",";
              ruleGroup += "\"op\":\"" + sopt[i] + "\",";
              ruleGroup += "\"data\":\"" + n.replace(/\\/g, '\\\\').replace(/\"/g, '\\"') + "\"}";
              gi++;
            });
            ruleGroup += "]}";
            $ele.one("gk.jqGridLastSelected", function (evt, lastSelected) {
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

      this.addRowData = function (rdata) {
        if (rdata) {
          if ($.isArray(rdata)) {
            $ele.jqGrid("addRowData", "id", rdata);
          } else {
            $ele.jqGrid("addRowData", rdata.id, rdata);
          }
        }
      };

      this.setCell = function (rowid, colName, cellData, addclass, attrs) {
        if (cellData) {
          this.$ele.jqGrid("setCell", rowid, colName, cellData, addclass, attrs);
        }
      };

      this.getCell = function (rowid, colName) {
        return this.$ele.jqGrid("getCell", rowid, colName);
      };

      this.delRowData = function () {
        var rowids, rowSize;
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

      this.hidden = function (colName, isHidden) {
        var gridWidth = $ele.getGridParam("width");
        if (_parseBoolean(isHidden) === true) {
          $ele.jqGrid("hideCol", colName);
        } else {
          $ele.jqGrid("showCol", colName);
        }
        $ele.setGridWidth(gridWidth);
      };

      this.mask = function (param) {
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
  };
});