// define resources
requirejs.config({
  context: 'gk',
  paths: {
    jqqrcode: 'lib/jquery.qrcode/jquery.qrcode',
    qrcodejs: 'lib/jquery.qrcode/qrcode'
  },
  shim: {
    'qrcodejs': {
      deps: ['jqqrcode']
    }
  }
});

// define module (component)
define(['qrcodejs'], function () {
  return {
    template: "<div id='{{id}}' render='{{render}}' style='{{style}}' w='{{width}}' h='{{height}}'><content></content></div>",
    script: function () {
      var $ele = this.$ele;
      this.text = '';

      this.init = function () {
        if(this.$ele.attr('w')!='{{width}}')
          this.$ele.css({'width':this.$ele.attr('w')});
        if(this.$ele.attr('h')!='{{height}}')
          this.$ele.css({'height':this.$ele.attr('h')});

        this.render(this.$originEle.text());
      };

      this.render = function (txt) {
        if (this.text !== txt) {
          this.text = txt;
          this.$ele.html('');
          this.$ele.qrcode({
            render: $ele.attr('render'),
            width: parseInt($ele.css('width'), 10),
            height: parseInt($ele.css('height'), 10),
            text: txt
          });
        }
      };
    }
  };
});
