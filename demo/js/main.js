require.config({
    baseUrl: 'js/webcomponent',
    paths: {
        gk: ['../../../src/jquery.gk-0.5', '../jquery.gk-0.5.min'],
        domReady: '../require/domReady',
        jquery: ['../jquery-1.9.1.min', 'http://code.jquery.com/jquery-1.9.1.min']
    },
    shim: {'gk': {deps: ['jquery']}
    }
});

define(['gmap', 'piechart'], function () {
    $.gk.init(arguments);
});