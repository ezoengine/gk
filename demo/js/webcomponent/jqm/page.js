// define module (Component)
define(['gk'], function () {
    return {
        name: 'page',
        template: "<div id='{{id}}' data-gk-click='{{onclick}}' data-role='page' class='{{class}}'>{{content}}</div>",
        script: function () {
            this.init = function () {
            };
        }
    };
});