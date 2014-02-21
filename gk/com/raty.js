// define resources
requirejs.config({
  context: 'gk',
  paths: {
    ratyjs: 'lib/jquery.raty/jquery.raty.min'
  }
});

// define module (component)
define(['require', 'ratyjs'], function (req) {
  return {
    template: "<div id='{{id}}' score='{{score}}'><content></content></div>",
    script: function (attr) {
      this.init = function () {
        var baseURL = req.toUrl('');
        this.$ele.raty({
          starOff: baseURL + 'lib/jquery.raty/img/star-off.png',
          starOn: baseURL + 'lib/jquery.raty/img/star-on.png'
        });
        if (typeof this.$ele.attr('score') !== 'undefined') {
          $(this.$ele).raty('score', this.$ele.attr('score'));
        }
      }
      this.score = function (n) {
        if (n) {
          $(this.$ele).raty('score', n);
        }
        return $(this.$ele).raty('score');
      }
    }
  };
});