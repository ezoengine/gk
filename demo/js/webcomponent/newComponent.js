// define Component Resource
require.config({
    baseUrl: 'js/webcomponent'
});
// define module (Component)
define(['$module'], function (gk) {
    return {
        name: '$tagName',
        template: "$template",
        script: function () {
            this._init = function () {
            };
        }
    };
})
;