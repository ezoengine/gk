require.config({
    baseUrl: 'js/webcomponent',
    paths: {
        gk: ['../../../src/jquery.gk-0.5', '../jquery.gk-0.5.min'],
        domReady: '../require/domReady',
        jquery: ['../jquery-1.9.1.min', 'http://code.jquery.com/jquery-1.9.1.min'],
        jqgrid: 'jqgrid/jqgrid',
        jqcol: 'jqgrid/jqcol',
        jqcolend: 'jqgrid/jqcolend'
    },
    shim: {'gk': {deps: ['jquery']}
    }
});

/** fix ie8 **/
require(['gk'], function () {
    $.gk.createTag(['gmap', 'piechart', 'jqgrid', 'jqcol', 'jqcolend']);
});

require(['gmap', 'piechart', 'jqgrid', 'jqcol', 'jqcolend'], function () {
    $.gk.init(arguments);
});