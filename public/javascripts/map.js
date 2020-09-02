// function drawYears(years, id = "earDiv"){
//   d3.select("#y" + id).style("grid-template-columns", "repeat(" + Math.floor($("#y" + id).width()/32) + ", 32px)")
//   var yearData = d3.select("#y" + id).selectAll(".yearCell").data(years)
//   yearData.exit().remove()
//   var yearEnter = yearData.enter().append("div").attrs({
//     class: "yearCell",
//     id: function(d) {return "y" + id + d}
//   }).styles({
//     cursor: "pointer",
//   }).on("click", function(d){
//     var id = d3.select(this.parentNode).attr("id")
//     updateYear(d, id.substring(1))
//   }).on("mouseenter", function(d){
//     var id = d3.select(this.parentNode).attr("id")
//     if(id == "yearDiv") id = "mapDiv"
//     if(d == $("#m" + id.substring(1)).data("year"))
//       d3.select(this).style("background", "rgba(67, 148, 218, 0.8)")
//     else d3.select(this).style("background", "#bcbcbc")
//   }).on("mouseleave", function(d){
//     var id = d3.select(this.parentNode).attr("id")
//     if(id == "yearDiv") id = "mapDiv"
//     if(d == $("#m" + id.substring(1)).data("year")) d3.select(this).style("background", "rgba(67, 148, 218, 0.4)")
//     else d3.select(this).style("background", "none")
//   }).append("label").text(function(d){ return d }).style("cursor", "pointer")

//   yearEnter = yearEnter.merge(yearData)
// }

yearAxis = function(){
	this.speed = 250
}

yearAxis.prototype.updateYearNoteCount = function(yearNoteCount){
	// console.log(yearNoteCount)
	var svg = d3.select("#yearDiv").select("svg")
	var rectHeight = 40
	svg.select(".noteCountGroup").selectAll("rect").transition().duration(200).attr("height", function(d){
		var re = $.grep(yearNoteCount, function(e){ return e.year == d.year})
		if(!re.length || !re[0].count){
			d.noteCount = 0
			return 0
		}
		d.noteCount = re[0].count
		if(rectHeight * Math.log(re[0].count) / Math.log(curNote.max) < 5) return 5
		return rectHeight * Math.log(re[0].count) / Math.log(curNote.max)
	})
}

yearAxis.prototype.draw = function(id = "earDiv"){
	var self = this

	d3.select("#y" + id).append("label").attrs({
		// class: "awesomeButton",
		class: "playerButton"
	}).on("click", function(){
		self.playerUpdate(id)
	})

	var svg = d3.select("#y" + id).append("svg")
	var rectHeight = 0
    if(id == "earDiv"){
    	rectHeight = 40
		svg.append("g").attrs({
			class: "noteCountGroup",
			transform: "translate(15, 0)"
		})
	}

	svg.append("g").attrs({
		class: "rectGroup",
		transform: "translate(15," + rectHeight + ")"
	})
	var g = svg.append("g").attrs({
		class: "xaxis",
		transform: "translate(15, " + rectHeight + ")"
	})
}

yearAxis.prototype.updateData = function(years, id = "earDiv"){
	if(!this.hasOwnProperty("playerState" + id)){
		this["playerState" + id] = false
		this["player" + id] = null
	}
	this["years" + id] = years
	// this["player" + id] = null
	// this["curYear" + id] = 2013
	this["yearEnd" + id] = years[years.length-1]
	this["yearStart" + id] = years[0]
	
	var self = this

	d3.select("#y" + id).select("label").text(function(){
		if(self["playerState" + id]) return "\uf28b"
		return "\uf144"
	})

	// var width = $("#y" + id).width() - 60
	var x = d3.scaleBand().domain(years)//.range([0,width]);//d3.scaleTime().range([0, width]).domain(d3.extent(years, function(d){return parseDate(d)}))
	var xAxis = d3.axisBottom(x)
	var svg = d3.select("#y" + id).select("svg")
	var rectHeight = 0

    if(id == "earDiv"){
    	rectHeight = 40
		svg.select(".noteCountGroup").selectAll("rect").data(function(){return years.map(a => ({year: a, noteCount: 0}))}, function(d){return d.year}).enter().append("rect").attrs({
			class: "noteCountRect"//function(d){ return "noteCountRect" + d}
		}).style("fill", "rgb(67, 148, 218)")
		  .style("cursor", "pointer")
		  // .attr("x", function(d){ return x(d) + 2; })
		  // .attr("width", x.bandwidth() - 4)
		  .attr("y", rectHeight)
		  // .attr("transform", function(d){ return "rotate(180, " + (x(d) + x.bandwidth()/2) + "," + rectHeight + ")"})
		  .attr("height", function(d){
		  	return 0
		  }).on("mouseenter", function(d){
	  		showTooltip("Click to view <b>" + d.noteCount + "</b> related note(s) on the right side.", d3.event.pageX - 12, d3.event.pageY)
		  	// d3.select("#y" + id).select(".text" + d).style("font-weight", "bold")
		  	// d3.select(this).style("opacity", .5)
		  }).on("mouseleave", function(){
			  d3.select("#tooltip").styles({
		          visibility: "hidden",
		      }) 	
		  	// d3.select("#y" + id).select(".text" + d).style("font-weight", "normal")
		  	// d3.select(this).style("opacity", 0)
		  }).on("click", function(d){
		  	d3.select(this.parentNode).selectAll("rect").style("fill", "rgb(67, 148, 218)")
		  	d3.select("#countryDiv").selectAll(".countRect").style("background", "rgb(67, 148, 218)")
		  	d3.select(this).style("fill", "rgb(192, 98, 95)")
		  	curNote.entityFilter = {year: d.year}
		  	if(curNote.discussionNote){
			  	curNote.removeDiscussions()
			}
			var obj = {type: "viewYearNote", mode: curMode.state, year: d.year, time: getFormatedTime(), user: curUser.username}
    		addLog(obj)
	    	curNote.showNotes()
	    	curNote.updateFilter()
	    	$("#showNoteDiv > .showNoteArea").animate({
                scrollTop: 0
            }, 1000);
		  	// updateYear(d, id)
		  });
		}

	var rect = svg.select(".rectGroup").selectAll("rect").data(years, function(d){return d})
	rect.exit().remove()
	var rectEnter = rect.enter().append("rect").attrs({
		class: function(d){ return "rect" + d}
	}).style("fill", "#999")
      .style("cursor", "pointer")
      .style("opacity", 0)
      // .attr("x", function(d) { return x(d) + 2; })
      // .attr("width", x.bandwidth() - 4)
      .attr("y", 0 )
      .attr("height", "30px").on("mouseenter", function(d){
      	hoverBegin = getTime()
      	d3.select("#y" + id).select(".text" + d).style("font-weight", "bold")
      	d3.select(this).style("opacity", .5)
      	//mouseline in the chart
      	if(id == "earDiv"){ 
      		if(curUi.hasOwnProperty("datastackDiv"))
      			curUi.displayMouselineinChart(d)
      	}
      	else if(curUi.hasOwnProperty("datac" + id)) curUi.displayMouselineinChart(d, "c" + id)
      }).on("mouseleave", function(d){
      	if(hoverBegin && getTime() - hoverBegin > 3000){
      		var s = "note"
	    	if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverYearLabel", session: s, mode: curMode.state, year: d, note: id, time: getFormatedTime(), user: curUser.username}
      		addLog(obj)
  		}
  		hoverBegin = 0

      	d3.select("#y" + id).select(".text" + d).style("font-weight", "normal")
      	d3.select(this).style("opacity", 0)
      	//remove mouseline in the chart
      	if(id == "earDiv") curUi.hideMouselineinChart() 
      	else curUi.hideMouselineinChart("c" + id)
      }).on("click", function(d){
      	hoverBegin = 0
      	// d3.select("#y" + id).select(".text" + curYear).style("fill", "#000")
      	// d3.select("#y" + id).select(".text" + d).style("fill", "rgb(192, 98, 95)")
      	// self["curYear" + id] = d
      	var s = "note"
      	if(curNote.discussionNote) s = "discussion"
      	var obj = {type: "selectYear", mode: curMode.state, session: s, year: d, note: id, time: getFormatedTime(), user: curUser.username}
    	addLog(obj)
      	updateYear(d, id)
      });

	var g = svg.select(".xaxis").call(xAxis).selectAll("text")
	  .attr("class", function(d){ return "text" + d})
      .style("text-anchor", "end")
      .attr("dx", "-.7em") 
      .attr("dy", "0em")
      .attr("transform", "rotate(-60)" ).style("cursor", "pointer").on("mouseenter", function(d){
      	hoverBegin = getTime()
      	d3.select(this).style("font-weight", "bold")
      	d3.select("#y" + id).select(".rect" + d).style("opacity", .5)
      	//mouseline in the chart
      	if(id == "earDiv"){
      		if(curUi.hasOwnProperty("datastackDiv"))
      			curUi.displayMouselineinChart(d)
      	}
      	else if(curUi.hasOwnProperty("datac" + id)) curUi.displayMouselineinChart(d, "c" + id)
      }).on("mouseleave", function(d){
		d3.select(this).style("font-weight", "normal")
      	d3.select("#y" + id).select(".rect" + d).style("opacity", 0)

      	if(id == "earDiv") curUi.hideMouselineinChart()
      	else curUi.hideMouselineinChart("c" + id)
      	if(hoverBegin && getTime() - hoverBegin > 3000){
      		var s = "note"
	    	if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverYearLabel", session: s, mode: curMode.state, year: d, note: id, time: getFormatedTime(), user: curUser.username}
      		addLog(obj)
  		}
  		hoverBegin = 0
      }).on("click", function(d){
      	hoverBegin = 0
      	updateYear(d, id)
      	var s = "note"
      	if(curNote.discussionNote) s = "discussion"
      	var obj = {type: "selectYear", mode: curMode.state, session: s, year: d, note: id, time: getFormatedTime(), user: curUser.username}
    	addLog(obj)
      });
	
}

yearAxis.prototype.updateWidth = function(id = "earDiv"){
	var self = this
	var rectHeight = 40
	var width = $("#y" + id).width() - 60
	var x = d3.scaleBand().domain(this["years" + id]).range([0, width]);//d3.scaleTime().range([0, width]).domain(d3.extent(years, function(d){return parseDate(d)}))
	var xAxis = d3.axisBottom(x)
	if(id == "earDiv")
		d3.select("#y" + id).select(".noteCountGroup").selectAll("rect")
			.attr("x", function(d){ return x(d.year) + 2; })
			.attr("width", x.bandwidth() - 4)
			.attr("transform", function(d){ return "rotate(180, " + (x(d.year) + x.bandwidth()/2) + "," + rectHeight + ")"})
		  
	d3.select("#y" + id).select(".xaxis").call(xAxis)
	d3.select("#y" + id).select(".rectGroup").selectAll("rect").attr("x", function(d) { return x(d) + 2; })
      .attr("width", x.bandwidth() - 4)

    d3.select("#y" + id).select("svg").attrs({
		width: $("#y" + id).width() - 35,
		height: $("#y" + id).find(".xaxis").height() + rectHeight
	})
}

yearAxis.prototype.incremental = function(id) {
	var  y = this["curYear" + id]
	d3.select("#y" + id).select(".text" + y).style("fill", "#000")
	var index = this["years" + id].indexOf(y)
	if(index == this["years" + id].length - 1)
		index = 0
	else index++
	y = this["years" + id][index];
	this["curYear" + id] = y
    d3.select("#y" + id).select(".text" + y).style("fill", "rgb(192, 98, 95)")
    updateYear(y, id)
};

yearAxis.prototype.playerUpdate = function(id) {
	var self = this
	var s = "note"
	if(curNote.discussionNote) s = "discussion"
	if (!this["playerState" + id]) {
		var obj = {type: "play", mode: curMode.state, session: s, note: id, time: getFormatedTime(), user: curUser.username}
    	addLog(obj)
		this["playerState" + id] = true;
		d3.select("#y" + id).select(".playerButton").text('\uf28b');
		this["player" + id] = setInterval(function(){self.incremental(id)}, this.speed);
	} else {
		var obj = {type: "stop", mode: curMode.state, session: s, note: id, time: getFormatedTime(), user: curUser.username}
    	addLog(obj)
		this["playerState" + id] = false;
		d3.select("#y" + id).select(".playerButton").text('\uf144');
		clearInterval(this["player" + id]);
	}
};

// yearAxis.prototype.update = function(id = "earDiv"){
// 	var self = this
// 	var rectHeight = 40
// 	var width = $("#y" + id).width() - 60
// 	var x = d3.scaleBand().domain(this["years" + id]).range([0, width]);//d3.scaleTime().range([0, width]).domain(d3.extent(years, function(d){return parseDate(d)}))
// 	var xAxis = d3.axisBottom(x)
// 	d3.select("#y" + id).select(".noteCountGroup").selectAll("rect")
// 		.attr("x", function(d){ return x(d) + 2; })
// 		.attr("width", x.bandwidth() - 4)
// 		.attr("transform", function(d){ return "rotate(180, " + (x(d) + x.bandwidth()/2) + "," + rectHeight + ")"})
		  
// 	d3.select("#y" + id).select(".xaxis").call(xAxis)
// 	d3.select("#y" + id).select(".rectGroup").selectAll("rect").attr("x", function(d) { return x(d) + 2; })
//       .attr("width", x.bandwidth() - 4)

//     d3.select("#y" + id).select("svg").attrs({
// 		width: $("#y" + id).width(),
// 		height: $("#y" + id).find(".xaxis").height() + rectHeight
// 	})
// }

function updateYear(y, id){
  // d3.select("#y" + id).selectAll(".yearCell").style("background", "none")
  // d3.select("#y" + id + y).style("background", "rgba(67, 148, 218, 0.4)")
  d3.select("#y" + id).select(".text" + yearAxisIns["curYear" + id]).style("fill", "#000")
  d3.select("#y" + id).select(".text" + y).style("fill", "rgb(192, 98, 95)")
  yearAxisIns["curYear" + id] = y
  
  if(id == "earDiv"){
    curUi.updateYearLine(y)
    curMap.updateMap(y)
    curYear = y
  }
  else{
  	var entities = d3.select("#en" + id).datum().entities
  	var mapEn = entities.filter(a => a.type == "map" && a.year == y)
  	var points = entities.filter(a => a.type == "mapPoint" && a.year == y)

  	if(mapEn.length)
  		curMap.updateMap(y, "m" + id)
  	else{
  		var temp = [].concat.apply([], points.map(a => a.entities))
  		// console.log(temp)
  		curMap.updateMap(y, "m" + id, temp)
  	}
  	d3.select("#m" + id).selectAll("path").style("stroke", "#999")
  	var chartEn = entities.filter(a => a.type == "line" || a.type == "year" || a.type == "chart")
  	var enids = []
  	chartEn.forEach(function(e){
        enids = enids.concat(e.entities)
    })
    enids = enids.filter((v,i) => enids.indexOf(v) === i)
  	enids.forEach(function(d){
	    curMap.updateMapOutline(d, "#4394da", "m" + id)
	})

	points.forEach(function(a){
	    curMap.updateMapOutline(a.entities[0], "#ed7a76", "m" + id)
	})
  }
    // console.log(d)
}

Map = function(obj = null, callback = null, para = null){
	var self = this
	this.color = d3.scaleLinear().domain([0, 200, 800, 1600, 3200, coMax])
	    .range(["#00a6ca", "#00ccbc", "#f29e2e", "#e76818", "#c11518", "#800155"]);
	d3.json("javascripts/world-countries.json").then(function(world) {
		self.world = world
		var bounds = d3.geoBounds(world)
        self.center = d3.geoCentroid(world);
		self.distance = d3.geoDistance(bounds[0], bounds[1])
		if(callback)
			obj[callback](para)
		else self.iniMap()
	})
	
}

Map.prototype.iniMap = function(){
	var self = this
	$("#mapDiv").height( ($("#main").height() - $("#yearDiv").height()) * 2 / 3 )
	var height = $("#mapDiv").height(), width = $("#mapDiv").width() - 60

	var svg = d3.select("#mapDiv").append("svg")
	svg.append("text").attrs({
		x: 10,
		y: 10,
		"dominant-baseline": "hanging"
	}).styles({
		"font-size": "32px",
	})

	svg.append("text").attrs({
		x: 80,
		y: 10,
		"dominant-baseline": "hanging",
		class: "addEntityText",
		id: "addMapButton"
	}).text("\uf055").on("click", function(){
		addEntityToNote({year: curYear, entities: [], text: "map, " + curYear, type: "map"})
	}).on("mouseenter", function(){
		showTooltip("Click to add <b>map, " + curYear + "</b> to your note.", d3.event.pageX, d3.event.pageY)
	}).on("mouseleave", function(){
		d3.select("#tooltip").style("visibility", "hidden")
	})

	var g = svg.append("g").attrs({
		class: "mapGroup",
		transform: "translate(60, 0)"
		// height: height,
		// width: width
	})

	var gradient = [
		{offset: "0%", color: "#00a6ca"},
	    {offset: 200 / coMax, color: "#00ccbc"},
	    {offset: 800 / coMax, color: "#f29e2e"},
	    {offset: 1600 / coMax, color: "#e76818"},
	    {offset: 3200 / coMax, color: "#c11518"},
	    {offset: "100%", color: "#800155"}]
    var legendGroup = svg.append("g").attr("class", "legendGroup")
    var defs = legendGroup.append('defs');

	// append a linearGradient element to the defs and give it a unique id
	var linearGradient = defs.append('linearGradient')
		.attr('id', 'linear-gradient').attr("gradientTransform", "rotate(90)");
	linearGradient.selectAll("stop").data(gradient).enter().append("stop")
	  .attr("offset", function(d) { 
	    return d.offset; 
	  }).attr("stop-color", function(d) { 
	    return d.color; 
	  });

	legendGroup.append("rect")
	  .attr("x", 10)
	  .attr("y", 50)
	  .attr("width", 10)
	  .attr("height", $("#mapDiv").height() - 60)
	  .style("fill", "url(#linear-gradient)")
	  // .style("opacity", ".85");

	var xLeg = d3.scaleLinear().domain([0, coMax]).range([0, $("#mapDiv").height() - 60]);

	var axisLeg = d3.axisRight(xLeg).tickValues(this.color.domain())

	legendGroup.append("g").attr("class", "axis")
	  .attr("transform", "translate(20, 50)")
	  .call(axisLeg);
	
    var scale = height / self.distance / Math.sqrt(2);
    if(height >= width)
    	scale = width / self.distance / Math.sqrt(2);

    var projection = d3.geoMercator().scale(scale).center(self.center).translate([width/2, height/2]);;
	var path = d3.geoPath().projection(projection);
	// console.log(self.world)
	var geoData = g.selectAll("path").data(self.world.features)
	geoData.exit().remove()
    var geoEnter = geoData.enter().append("path").attr("d", path)
	    .attrs({
	    	class: function(d){return d.id}
	    }).styles({
	    	stroke: '#999',
	    	'stroke-width': 1,
	    	cursor: function(d){
	    		if(wholeIds.indexOf(d.id) > -1) return "pointer"
	    		return null
	    	},
	    	// opacity: .85
	    })

    geoEnter = geoEnter.merge(geoData)
    updateYear(2013, "earDiv")
    // console.log(curMode.state)
	curMode[curMode.state + "Map"]()
	    // console.log(i)

}

Map.prototype.updateWidthHeight = function(id = "apDiv"){
	var self = this
	var height = $("#m" + id).height(), width = $("#m" + id).width()

	if(id == "apDiv"){
		height = ($("#main").height() - $("#yearDiv").height()) * 2 / 3
		$("#mapDiv").height(height)
		d3.select("#mapDiv").select(".legendGroup").select("rect").attr("height", height - 60)
		var xLeg = d3.scaleLinear().domain([0, coMax]).range([0, height - 60]);
		var axisLeg = d3.axisRight(xLeg).tickValues(this.color.domain())
		  
		d3.select("#mapDiv").select(".legendGroup").select(".axis").call(axisLeg);
	}

	var scale = height / self.distance / Math.sqrt(2);
    if(height >= width)
    	scale = width / self.distance / Math.sqrt(2);
    // console.log(distance)
    var projection = d3.geoMercator().scale(scale).center(self.center).translate([width/2, height/2]);;
	var path = d3.geoPath().projection(projection);

	d3.select("#m" + id).select(".mapGroup").selectAll("path").attr("d", path)

}

Map.prototype.updateMapOutline = function(countryid, color, div = "mapDiv"){
	d3.select("#" + div).select(".mapGroup").select("." + countryid).style("stroke", color)
}

function mouseEnter(id, mdiv = "mapDiv", cdiv = "stackDiv"){
	// console.log(id)
	d3.select("#" + cdiv).select(".stackedGroup").select("." + id).select("path").style("stroke", "#c0625f")
    d3.select("#" + cdiv).select(".stackedGroup").select("." + id).selectAll(".dot").style("fill", "#c0625f")

	d3.select("#" + mdiv).select(".mapGroup").select("." + id).style("stroke-width", 2);
}

function mouseLeave(id, mdiv = "mapDiv", cdiv = "stackDiv"){
  d3.select("#" + mdiv).select(".mapGroup").select("." + id).style("stroke-width", 1);

  d3.select("#" + cdiv).select(".stackedGroup").select("." + id).select("path").style("stroke", "#ffab00")
  d3.select("#" + cdiv).select(".stackedGroup").select("." + id).selectAll(".dot").style("fill", "#ffab00")
}

Map.prototype.iniProveMap = function(id){
	var self = this
	var height = $("#m" + id).height(), width = $("#m" + id).width()
	var svg = d3.select("#m" + id).append("svg")
	svg.append("text").attrs({
		x: 10,
		y: 10,
		"dominant-baseline": "hanging"
	}).styles({
		"font-size": "32px",
	})

	var g = svg.append("g").attrs({
		class: "mapGroup",
		transform: "translate(30, 0)"
	})

	var scale = height / self.distance / Math.sqrt(2);
    if(height >= width)
    	scale = width / self.distance / Math.sqrt(2);
    // console.log(height + " " + width + " " + self.center + " " + scale)
    var projection = d3.geoMercator().scale(scale).center(self.center).translate([width/2, height/2]);;
	var path = d3.geoPath().projection(projection);
	// console.log(self.world)
	var geoData = g.selectAll("path").data(self.world.features)
	geoData.exit().remove()
    var geoEnter = geoData.enter().append("path").attr("d", path).attrs({
	    	class: function(d){return d.id}
	    }).style('stroke', '#999').style('stroke-width', 1)

    geoEnter = geoEnter.merge(geoData)
	curMode.normalModeMap("m" + id, "c" + id)
}

Map.prototype.updateMap = function(year, id = "mapDiv", enIds = null){
	var self = this
    var curDataArray = data.filter(a => a.year == year)
    $("#" + id).data("year", year)

	d3.select("#" + id).select("text").text(year)
	d3.select("#" + id).select(".mapGroup").selectAll("path").style("fill", function(d) {
		var re = []
		if(enIds){
			if(enIds.indexOf(d.id) > -1)
				re = $.grep(curDataArray, function(e){ return e.id == d.id})
			else re = []
		}
      	else re = $.grep(curDataArray, function(e){ return e.id == d.id})
      	if(re.length){
      		if(id == "mapDiv")
      			d.properties.value = re[0].value
      		return self.color(re[0].value)
      	}
      	else{
      		if(id == "mapDiv")
      			d.properties.value = null
      	}
      	return "#eee";
    })
}