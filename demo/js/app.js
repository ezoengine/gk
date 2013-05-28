require.config({
    baseUrl: 'js/webcomponent',
    paths: {
        gk: ['../../../src/jquery.gk-0.5', '../jquery.gk-0.5.min'],
        domReady: '../require/domReady',
        jquery: ['../jquery-1.9.1.min', 'http://code.jquery.com/jquery-1.9.1.min']
    },
    shim: {
        'gk': {
            deps: ['jquery']
        }
    }
});
/** fix ie8 **/
require(['gk'], function () {
    $.gk.createTag(['jqm/page', 'jqm/header']);
});

define(['domReady', 'jqm/page', 'jqm/header'], function () {
    $.gk.init(arguments);
    require(['../jquerymobile/jquery.mobile-1.3.1.min']);
});