require.config({
	baseUrl:'js/webcomponent',
	paths : {
		raphael: '../raphael/raphael',
		'g.raphael': '../raphael/g.raphael',
		'g.pie':  '../raphael/g.pie',
		'g.line': '../raphael/g.line',
		'g.bar':  '../raphael/g.bar'
	},
	shim: {
		'g.raphael': {deps:['raphael']},
		'g.pie' : {deps: ['g.raphael']}
	}
});

define(['gk','g.pie'],function(gk){
	TagLibrary = gk.TagLibrary,
	TagUtils = gk.TagUtils,
	components = gk.components,
	WebComponent = components['WebComponent'];
	
	TagLibrary.customTags['PIECHART'] = $("<gk:view use='PieChart'><div id=\"${id}\" width='${width}' height='${height}' cx='${cx}' cy='${cy}' direction='${direction}' radius='${radius}'></div>${content}  </gk:view>")[0];
	components['PieChart'] = (function (_super) {gk.__extends(PieChart, _super);function PieChart(id) {_super.call(this, id);}
	var cx = 190,cy=190,direction='north';
	var r,radius=100;
	PieChart.prototype._init = function(){
	this.ele.parent().css('width','100%');
	this.ele.parent().css('height','100%');
	var w = this.ele.attr('width');
	var h = this.ele.attr('height');
	if(this.ele.attr('direction')!='${direction}'){
	  direction = this.ele.attr('direction');
	}
	if(this.ele.attr('radius')!='${radius}'){
	  radius = parseInt(this.ele.attr('radius'));
	}
	if(this.ele.attr('cx')!='${cx}'){
	  cx = parseInt(this.ele.attr('cx'));
	}
	if(this.ele.attr('cy')!='${cy}'){
	  cy = parseInt(this.ele.attr('cy'));
	}
	  this.ele.css('width',w === '${width}' ? '480px':w);
	  this.ele.css('height',h === '${height}' ? '480px':h);
	  r = Raphael(this.id);
	};
	PieChart.prototype.onclick = function(){};
	PieChart.prototype.render = function(){
	if(arguments.length==1){
	  var newData = [],data=arguments[0];
	for(var key in data){
		newData.push({'label':key,'value':data[key]});
	}
	  data = newData;
	}else{
	  data =  Array.prototype.slice.call(arguments);
	}
	var self = this;
	var itemLabel = [] , itemValue = [];
	$.each(data,function(idx,obj){
	 itemLabel.push(obj.label);
	 itemValue.push(obj.value);
	});
	r.clear();
	var pie = r.piechart(cx,cy, radius, 
		 itemValue,  { legend: itemLabel, legendpos: direction});
	pie.hover(function () {
	  this.sector.stop();
	  this.sector.scale(1.1, 1.1, this.cx, this.cy);
	  if (this.label) {
		this.label[0].stop();
		this.label[0].attr({ r: 7.5 });
		this.label[1].attr({ "font-weight": 800 });
	  }
	}, function () {
	  this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");
	  if (this.label) {
		this.label[0].animate({ r: 5 }, 500, "bounce");
		this.label[1].attr({ "font-weight": 400 });
	  }
	});
	pie.click(function(){
	  self.onclick(itemLabel[this.value.order]);
	});
	};
	return PieChart;})(WebComponent);	
    return {};
});