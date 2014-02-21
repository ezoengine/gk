(function () {
  var gfont = {
    template: '<div id="{{id}}" class="{{class}}" size="{{size}}" family="{{family}}"><content></content></div>',
    script: function () {
      //default font
      this.family = 'Freckle Face';
      this.size = '128px';
      this.weight = '400';
      this.shadow = '4px 4px 4px #aaa';

      this.init = function () {
        this.css('font-family', 'family');
        this.css('font-size', 'size');
        this.css('font-weight', 'weight');
        this.css('text-shadow', 'shadow');
        this.loadCSS(this.family.replace(/ +/, "+"));
      };

      this.css = function (cssKey, gkAttr) {
        if (this.$ele.attr(gkAttr)) {
          this[gkAttr] = this.$ele.attr(gkAttr);
        }
        var cssSet = {};
        cssSet[cssKey] = this[gkAttr];
        this.$ele.css(cssSet);
      };

      this.loadCSS = function (fontFamily) {
        var url = 'http://fonts.googleapis.com/css?family=' + fontFamily;
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
      };
    }
  };

  if (typeof define === 'function') {
    if (typeof define.amd === 'undefined') {
      define('gfont', gfont);
    } else {
      define(gfont);
    }
  } else {
    return gfont;
  }
}());