// define module (Component)
define(['gk'], function () {
    return {
        name: 'header',
        template: "<div id='{{id}}' persist='{{persist}}' data-gk-click='{{onclick}}' data-position='fixed' data-role='header' >" + "  <h1>{{label}}</h1>{{content}}" + "</div>",
        script: function () {
            this.init = function () {
            };
            this.label = function (lab) {
                if (lab) {
                    var ele = this.$ele.find('h1')[0];
                    ele.innerHTML = lab;
                    return this.$ele;
                } else {
                    return this.$ele.children(1).html();
                }
            };
        }
    };
});