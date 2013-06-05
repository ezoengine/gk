// define module (Component)
define(['gk', 'domReady'], function (gk) {
    return {
        name: 'gmap',
        template: "<div style='{{style}}'>" +
            "<div id='{{id}}' style='{{style}}' zoom='{{zoom}}' type='{{type}}' data-gk-click='{{onclick}}'></div>" +
            "<div ><content></content></div>" +
            "</div>",
        script: function () {
            var initGoogleMapScript = 'stop';
            var CallbackFunc = 'GK_GMap';
            var waitQueue = [];
            var HYBRID = "hybrid";
            var ROADMAP = "roadmap";
            var SATELLITE = "satellite";
            var TERRAIN = "terrain";
            var initScript = function initScript() {
                $.each(waitQueue, function (idx, obj) {
                    obj.initialize();
                });
            };
            this.init = function () {
                this.options = {};
                var h = document.documentElement.clientHeight;
                var w = document.documentElement.clientWidth;
                if (this.$ele.attr('data-gk-style') === '{{style}}') {
                    this.$ele.css({width: w + 'px', height: h + 'px'});
                } else {
                    this.$ele.attr('style', this.$ele.attr('data-gk-style'));
                }
                $(this.$ele).parent().attr('style', $(this.$ele).attr('style'));
                this.options['zoom'] = this.$ele.attr('zoom') ? parseInt(this.$ele.attr('zoom')) : '12';
                this.options['mapTypeId'] = this.$ele.attr('type') ? this.$ele.attr('type') : ROADMAP;
                this._address = $.trim(this.$ele[0].innerHTML);
                this.initMap();
            };
            this.height = function (h) {
                if (h) {
                    $(this.$ele).css('height', h);
                    this._height = h;
                    google.maps.event.trigger(this.map, "resize");
                } else {
                    return this._height;
                }
            };
            this.width = function (w) {
                if (w) {
                    $(this.$ele).css('width', w);
                    this._width = w;
                    google.maps.event.trigger(this.map, "resize");
                } else {
                    return this._width;
                }
            };
            this.initMap = function () {
                if (initGoogleMapScript === 'stop') {
                    initGoogleMapScript = 'running';
                    waitQueue.push(this);
                    window[CallbackFunc] = function () {
                        initScript();
                    };
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "https://maps.google.com/maps/api/js?sensor=false&callback=" + CallbackFunc;
                    document.getElementsByTagName('head')[0].appendChild(script);
                } else {
                    if (initGoogleMapScript === 'running') {
                        waitQueue.push(this);
                    } else {
                        this.initialize();
                    }
                }
            };
            this.initialize = function () {
                this.initGoogleMapScript = 'done.';
                if (this._address) {
                    this.address(_address);
                } else {
                    this.options['center'] = new google.maps.LatLng(22.604943497851177, 120.30919253826141);
                    this.map = new google.maps.Map(document.getElementById(this.id), this.options);
                    this.init();
                }
            };
            this.nowPos = function (address) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                });
            };
            this.location = function (lat, lng) {
                var latlng = new google.maps.LatLng(lat, lng);
                if (this.marker) {
                    this.marker.setMap(null);
                }
                this.marker = new google.maps.Marker({
                    position: latlng,
                    map: this.map,
                    title: this.options['title']
                });
                this.marker.setMap(this.map);
                this.map.setZoom(this.options['zoom']);
                this.map['setCenter'](latlng);
            };
            this.zoom = function (range) {
                this.options['zoom'] = range;
                this.map.setZoom(this.options['zoom']);
            };
            this.address = function (addr) {
                var self = this;
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    address: addr
                }, function (result, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var location = result[0].geometry.location;
                        if (!self.map) {
                            self.map = new google.maps.Map(document.getElementById(self.id), self.options);
                            self.init();
                        }
                        if (self.marker) {
                            self.marker.setMap(null);
                        }
                        self.marker = new google.maps.Marker({
                            position: location,
                            map: self.map,
                            title: addr
                        });
                        self.marker.setMap(self.map);
                        self.map.setZoom(self.options['zoom']);
                        self.map['setCenter'](location);
                    } else {
                    }
                });
            };
        }
    };
});