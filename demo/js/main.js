require.config({
	baseUrl:'js/webcomponent',
	paths : {
		gk : '../jquery.gk-0.4.min',
		domReady: '../require/domReady',
		jquery : 'http://code.jquery.com/jquery-1.9.1.min'
	},
	shim: {'gk': {deps: ['jquery']}
	}
});

define(['gmap','piechart'], function () {
   $.gk.init();
});