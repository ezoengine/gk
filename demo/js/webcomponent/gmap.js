define(['gk','domReady'],function(){
	
	var _gk = $.gk._gk,
	__extends = _gk.__extends,
	TagLibrary = _gk.TagLibrary,
	TagUtils = _gk.TagUtils,
	components = _gk.components,
	WebComponent = components['WebComponent'];

	TagUtils.createElement('GMAP');
	TagLibrary.customTags['GMAP'] = $("<gk:view use='GMap'><div style='${style}'>  <div id='${id}' style='${style}' zoom='${zoom}'   type='${type}' data-gk-click='${onclick}'></div>  <div >${content}</div></div>  </gk:view>")[0];
	components['GMap'] = (function (_super) {__extends(GMap, _super);function GMap(id) {_super.call(this, id);}
	GMap.prototype._init = function () {
	  this.options = {};
	  var h = document.documentElement.clientHeight;
	  var w = document.documentElement.clientWidth;
		if(this.ele.attr('data-gk-style')==='${style}'){
			this.ele.css({width:w+'px',height:h+'px'});
		}else{
			this.ele.attr('style',this.ele.attr('data-gk-style'));
		}
		this.ele.removeAttr('data-gk-style');
	  this.replaceAttr('zoom', '${zoom}', '12');
	  this.replaceAttr('type', '${type}', GMap.ROADMAP);
	  this.replaceAttr('data-gk-click', '${onclick}', '');
	  $(this.ele).parent().attr('style', $(this.ele).attr('style'));
	  this.options['zoom'] = parseInt(this.ele.attr('zoom'));
	  this.options['mapTypeId'] = this.ele.attr('type');
	  this._address = $.trim(this.ele[0].innerHTML);
	  this.initMap();
	}
	GMap.initGoogleMapScript = 'stop';
	GMap.CallbackFunc = 'GK_GMap';
	GMap.waitQueue = [];
	GMap.HYBRID = "hybrid";
	GMap.ROADMAP = "roadmap";
	GMap.SATELLITE = "satellite";
	GMap.TERRAIN = "terrain";
	GMap.initScript = function initScript() {
	  $.each(GMap.waitQueue, function (idx, obj) {
	    obj.initialize();
	  });
	}
	GMap.prototype.height = function (h) {
	  if (h) {
	    $(this.ele).css('height', h);
	    this._height = h;
	    google.maps.event.trigger(this.map, "resize");
	  } else {
	    return this._height;
	  }
	};
	GMap.prototype.width = function (w) {
	  if (w) {
	    $(this.ele).css('width', w);
	    this._width = w;
	    google.maps.event.trigger(this.map, "resize");
	  } else {
	    return this._width;
	  }
	};
	GMap.prototype.initMap = function () {
	  if (GMap.initGoogleMapScript === 'stop') {
	    GMap.initGoogleMapScript = 'running';
	    GMap.waitQueue.push(this);
	    window[GMap.CallbackFunc] = function () {
	      GMap.initScript();
	    };
	    var script = document.createElement("script");
	    script.type = "text/javascript";
	    script.src = "https://maps.google.com/maps/api/js?sensor=false&callback=" + GMap.CallbackFunc;
			document.getElementsByTagName('head')[0].appendChild(script);
	  } else {
	    if (GMap.initGoogleMapScript === 'running') {
	      GMap.waitQueue.push(this);
	    } else {
	      this.initialize();
	    }
	  }
	};
	GMap.prototype.initialize = function () {
	  GMap.initGoogleMapScript = 'done.';
	  if (this._address) {
	    this.address(this._address);
	  } else {
	    this.options['center'] = new google.maps.LatLng(22.604943497851177, 120.30919253826141);
	    this.map = new google.maps.Map(document.getElementById(this.id), this.options);
	    this.init();
	  }
	};
	GMap.prototype.nowPos = function (address) {
	  navigator.geolocation.getCurrentPosition(function (position) {
	    var lat = position.coords.latitude;
	    var lng = position.coords.longitude;
	  });
	};
	GMap.prototype.location = function (lat, lng) {
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
	GMap.prototype.zoom = function(range){
		this.options['zoom'] = range;
		this.map.setZoom(this.options['zoom']);
	};
	GMap.prototype.address = function (addr) {
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
	    } else {}
	  });
	};
	return GMap;})(WebComponent);	
	
    return {};
});