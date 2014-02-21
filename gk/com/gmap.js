// define resources
requirejs.config({
  context: 'gk',
  paths: {
    'google.map': 'https://maps.google.com/maps/api/js?sensor=false&callback=gmapReady'
  }
});

// define module (component)
define(['require'], function (require) {
  return {
    template: "<div id='{{id}}' data-gk-style='{{style}}' zoom='{{zoom}}' latitude='{{latitude}}' longitude='{{longitude}}' address='{{address}}' markerTitle='{{markerTitle}}'  mapTypeId='{{mapTypeId}}'>" + 
        "<div></div>" +
        "<div><content></content></div>" + 
        "</div>",
    script: function () {
      window.gmapReady = function () {
        $(document).triggerHandler('gmapReady');
      };
      this.init = function () {
        var self = this;
        var $page = self.$ele.parents('[data-role="page"]');
        var initialize = function () {
          self.$map = $(self.$ele.children()[0]);
          self.options = {};
          var h = document.documentElement.clientHeight;
          var w = document.documentElement.clientWidth;
          if (self.$ele.attr('data-gk-style') === '{{style}}') {
            self.$ele.css({
              width: w + 'px',
              height: h + 'px'
            });
          } else {
            self.$ele.attr('style', self.$ele.attr('data-gk-style'));
          }
          self.options['zoom'] = self.$ele.attr('zoom') ? parseInt(self.$ele.attr('zoom')) : '12';
          self.options['mapTypeId'] = self.$ele.attr('mapTypeId') ? self.$ele.attr('mapTypeId') : google.maps.MapTypeId.ROADMAP;
          self.options['title'] = self.$ele.attr('markerTitle') ? self.$ele.attr('markerTitle') : '';
          var address = (typeof self.$ele.attr('address') !== 'undefined') ? self.$ele.attr('address') : $.trim(self.$map.next().html());
          var latitude = self.$ele.attr('latitude'), longitude = self.$ele.attr('longitude');
          if ($.isNumeric(latitude) && $.isNumeric(longitude)) {
            self.options['center'] = new google.maps.LatLng(parseFloat(latitude, 10), parseFloat(longitude, 10));
            self.map = new google.maps.Map(document.getElementById(self.id), self.options);
            self.markerTitle();
          } else if (address) {
            self.address(address);
          } else {
            self.options['center'] = new google.maps.LatLng(22.606444, 120.301617);
            self.map = new google.maps.Map(document.getElementById(self.id), self.options);
          }

          $page.on('pageshow', function () {
            google.maps.event.trigger(self.map, 'resize');
          });
        };
        
        $(document).on('gmapReady', function () {
          if ($page.length && !$page.hasClass('ui-page-active')) {
            $page.one('pageshow', initialize);
          } else {
            initialize();
          }
        });
        require(['google.map']);
      };
      this.height = function (h) {
        if (h) {
          this.$ele.css('height', h);
          this._height = h;
          google.maps.event.trigger(this.map, "resize");
        } else {
          return this._height;
        }
      };
      this.width = function (w) {
        if (w) {
          this.$ele.css('width', w);
          this._width = w;
          google.maps.event.trigger(this.map, "resize");
        } else {
          return this._width;
        }
      };
      this.nowPos = function (markerTitle) {
        var self = this;
        markerTitle = (markerTitle) ? markerTitle : 'You are here now.';
        navigator.geolocation.getCurrentPosition(
            function success(position) {
              var lat = position.coords.latitude;
              var lng = position.coords.longitude;
              self.location(lat, lng);
              self.markerTitle(markerTitle);
            },
            function error(err) {
              console.warn('ERROR(' + err.code + '): ' + err.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
        );
      };
      this.location = function (lat, lng) {
        this.options['center'] = new google.maps.LatLng(lat, lng);
        this.map.setZoom(parseInt(this.options['zoom'], 10));
        this.map.setCenter(this.options['center']);
      };
      this.zoom = function (zoom) {
        if (typeof zoom !== 'undefined') {
          this.options['zoom'] = zoom;
          this.map.setZoom(parseInt(this.options['zoom'], 10));
          this.map.setCenter(this.options['center']);
        } else {
          return this.map.zoom;
        }
      };
      this.address = function (addr) {
        var self = this;
        new google.maps.Geocoder().geocode(
            {address: addr},
            function (result, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                self.options['center'] = result[0].geometry.location;
                if (!self.map) {
                  self.map = new google.maps.Map(document.getElementById(self.id), self.options);
                } else {
                  self.map.setZoom(parseInt(self.options['zoom'], 10));
                  self.map.setCenter(self.options['center']);
                }
                self.markerTitle(self.options['title'] ? self.options['title'] : addr);
              }
            }
        );
      };
      this.markerTitle = function (markerTitle) {
        if (typeof markerTitle !== 'undefined') {
          this.options['title'] = markerTitle;
        }
        if (this.marker) {
          this.marker.setMap(null);
        }
        this.marker = new google.maps.Marker({
          map: this.map,
          position: this.options['center'],
          title: this.options['title']
        });
      };
    }
  };
});
