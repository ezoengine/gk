// config resources
requirejs.config({
  context: 'gk',
  paths: {
    'excanvas': 'lib/flot/excanvas',
    'jquery.flot': 'lib/flot/jquery.flot',
    'jquery.flot.labels': 'lib/flot/jquery.flot.labels',
    'jquery.flot.axislabels': 'lib/flot/jquery.flot.axislabels'
  },
  shim: {
    'jquery.flot': {
      deps: ['excanvas']
    },
    'jquery.flot.labels': {
      deps: ['jquery.flot']
    },
    'jquery.flot.axislabels': {
      deps: ['jquery.flot']
    }
  }
});

// define component
define(['jquery.flot','jquery.flot.labels','jquery.flot.axislabels'], function() {
  return {
    template: "<div id='{{id}}' width='{{width}}' height='{{height}}' xlabel='{{xlabel}}' ylabel='{{ylabel}}' " + 
    					"showPoints='{{showPoints}}' showLabels='{{showLabels}}' labelPlacement='{{labelPlacement}}'></div>",
    
    script: function() {
      var $ele = this.$ele;
      
      var _config = {
        lines: {
          show: true
        },
        points: {
          show: $ele.attr('showPoints') === 'false' ? false : true
        },
        showLabels: $ele.attr('showLabels') === 'false' ? false : true,
        labelPlacement: typeof $ele.attr('labelPlacement') !== 'undefined' ? $ele.attr('labelPlacement') : "above",
        canvasRender: true
      };
      
      var _options = {
        xaxis: {
          axisLabel : $ele.attr('xlabel'),
          axisLabelUseCanvas : true,
          autoscaleMargin: 0.04
        },
        yaxis: {
          axisLabel : $ele.attr('ylabel'),
          axisLabelUseCanvas : true,
          autoscaleMargin: 0.02
        }
      };
      
      this.init = function() {
        var defaults = {
          width : '500px',
          height : '300px'
        };
        var settings = $.extend(defaults, {
          width : $ele.attr('width'),
          height : $ele.attr('height')
        });
        $ele.css(settings);
      };
      
      this.render = function(dataSet, options) {
        var _dataSet = [];
        
        if (typeof options !== 'undefined') {
          $.extend(true, _options, options);
        }
        $.each(dataSet, function(idx, val) {
          var _tempConfig = $.extend(true, {}, _config);
          _dataSet.push($.extend(true, _tempConfig, val));
        });
        return $.plot($ele, _dataSet, _options);
      };
      
    }
  };
});