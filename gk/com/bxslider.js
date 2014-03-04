// define resources
requirejs.config({
  context: 'gk',
  paths: {
    'bxslider': 'lib/jquery.bxslider/jquery.bxslider.min'
  }
});
// define module (component)
define(['bxslider', 'css!../lib/jquery.bxslider/cssreset','css!../lib/jquery.bxslider/jquery.bxslider'], function () {
  return {
    template:
      '<div id="{{id}}_wrapper" style="{{style}}" ><ul id="{{id}}" style="{{style}}" captions="{{captions}}" class="bxslider">'+
      '<content></content>' +
      '</ul></div>',
    script: function () {
      this.init = function(){
      };
    }
  };
});
