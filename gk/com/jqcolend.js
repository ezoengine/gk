define(function () {
  return {
    template: "<div id='{{id}}'></div><content></content>",
    script: function () {
      var _destroy = function (self) {
        self.$ele.off();
        self.$ele.removeData();
        self.$ele = null;
      };

      this.init = function () {
        var gridId = this.$ele.closest('table').attr('id');
        $('#' + gridId).gk('jqGrid');
        _destroy(this);
      };
    }
  };
});