function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}
loadCss('js/jquerymobile/jquery.mobile-1.3.1.min.css');
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