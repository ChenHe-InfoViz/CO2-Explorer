ModeClass = function(){
	this.state = "normalMode"
}

ModeClass.prototype.addEntityMode = function(div = "stackDiv"){
	// var self = this
	// $("#" + div + " .hoverGroup").css("pointer-events", "all")
	// d3.select("#" + div).selectAll(".tooltipGroup").select("circle").style("stroke-width", "2px")
	d3.select("#" + div).selectAll(".browser").on("mouseenter", function(d){
		hoverBegin = getTime()
	    showTooltip("Click to add <b>" + d.country + "</b> to your note.", d3.event.pageX, d3.event.pageY)
	    mouseEnter(d.id)
	}).on("mouseleave", function(d){
	    d3.select("#tooltip").styles({
	        visibility: "hidden",
	    })
	    mouseLeave(d.id)
	    if(hoverBegin && getTime() - hoverBegin > 3000){
	    	var s = "note"
	    	if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverTimeline", session: s, cid: d.id, note: div.substring(1), mode: "addEntityMode", time: getFormatedTime(), user: curUser.username}
      		addLog(obj)
  		}
  		hoverBegin = 0
	}).on("click", function(d){
		hoverBegin = 0
	    addEntityToNote({entities: [d.id], text: d.country, type: "line"})
	})

	d3.select("#" + div).select(".mouseLine").on("mouseenter", function(d){
		hoverBegin = getTime()
	  showTooltip("Click to add <b>" + $(this).data("text").toLowerCase() + "</b> to your note.", d3.event.pageX, d3.event.pageY)
	}).on("mouseleave", function(){
      d3.select("#tooltip").style("visibility", "hidden")
      if(hoverBegin && getTime() - hoverBegin > 3000){
      	var s = "note"
	    if(curNote.discussionNote) s = "discussion"
    	var obj = {type: "hoverMouseline", session: s, note: div.substring(1), year: $(this).data("year"), mode: "addEntityMode", time: getFormatedTime(), user: curUser.username}
  		addLog(obj)
		}
		hoverBegin = 0
	}).on("click", function(){
		hoverBegin = 0
	  addEntityToNote({year:$(this).data("year"), entities: $(this).data("entities"), countries: $(this).data("countries"), text: $(this).data("text"), type: "year"})
	})
	// d3.select("#" + div).selectAll(".tooltipGroup").on("mouseenter", function(){
 //      showTooltip("Click to add <b>" + $(this).data("text").toLowerCase() + "</b> to your note.", d3.event.pageX, d3.event.pageY)
	// }).on("mouseleave", function(){
	//   d3.select("#tooltip").style("visibility", "hidden")
	// }).on("click", function(){
	// 	addEntityToNote({year: $(this).data("year"), gender: $(this).data("gender"), entities: [$(this).data("entity")], value: $(this).data("value"), text: $(this).data("text").toLowerCase(), type: "point"} )
	// })

	if(selectedEntities.length)
		d3.select("#addChartButton").style("display", "inline-block")
	else d3.select("#addChartButton").style("display", "none")

}

ModeClass.prototype.addEntityModeMap = function(){
	$("#addSpan").css("display", "inline-block")
	d3.select("#addMapButton").style("display", "inline-block")
	d3.select("#mapDiv").select(".mapGroup").selectAll("path").on("mouseenter", function(d){
		hoverBegin = getTime()
		if(wholeIds.indexOf(d.id) > -1){
			mouseEnter(d.id)
			if(d.properties.value)
				showTooltip("Click to add <b>" + d.properties.name + ", " + curYear + ", " + d.properties.value + "</b> to your note.", d3.event.pageX, d3.event.pageY)
			else showTooltip(d.properties.name, d3.event.pageX, d3.event.pageY)
		}
	}).on("mouseleave", function(d){
		if(hoverBegin && getTime() - hoverBegin > 3000){
			var s = "note"
			if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverMapPoint", session: s, note: "apDiv", year: curYear, cid: d.id, mode: "addEntityMode", time: getFormatedTime(), user: curUser.username}
	  		addLog(obj)
		}
		hoverBegin = 0
		d3.select("#tooltip").style("visibility", "hidden")
		mouseLeave(d.id)
	}).on("click", function(d){
		hoverBegin = 0
		if(wholeIds.indexOf(d.id) > -1){
			if(d.properties.value)
				addEntityToNote({entities: [d.id], value: d.properties.value, year: curYear, text: d.properties.name + ", " + curYear + ", " + d.properties.value, type: "mapPoint"})
		}
	}).styles({
		"opacity": .85,
		cursor: function(d){
    		if(wholeIds.indexOf(d.id) > -1) return "pointer"
    		return null
    	},
	})
	d3.select("#mapDiv").select(".legendGroup").select("rect").style("opacity", .85)
}

ModeClass.prototype.normalModeMap = function(div = "mapDiv", cDiv = "stackDiv"){
	if(div == "mapDiv"){
		$("#addSpan").css("display", "none")
		d3.selectAll(".addEntityText").style("display", "none")
		d3.select("#" + div).select(".mapGroup").selectAll("path").on("click", null)//function(d){
			// var country = d.properties.name
	  //   	if(selectedEntities.indexOf(d.id) > -1){
	  //   		removeEntity({id: d.id, country: country})
	  //   	}
	  //   	else{
	  //   		addEntity({id: d.id, country: country})
	  //   	}
	    //})
	    .styles({
	    	opacity: 1,
	    	cursor: "default"
	    })
	    d3.select("#mapDiv").select(".legendGroup").select("rect").style("opacity", 1)
	}
	d3.select("#" + div).select(".mapGroup").selectAll("path").on("mouseenter", function(d){
		hoverBegin = getTime()
		if(wholeIds.indexOf(d.id) > -1){
		  var re = $.grep(data, function(e){
		  	return e.id == d.id && e.year == $("#" + div).data("year")
		  })
		  if(re.length)
          	showTooltip(d.properties.name + " " + re[0].value, d3.event.pageX, d3.event.pageY)
          else
          	showTooltip(d.properties.name, d3.event.pageX, d3.event.pageY)
          mouseEnter(d.id, div, cDiv)
        }
	}).on("mouseleave", function(d){
		if(hoverBegin && getTime() - hoverBegin > 3000){
			var y;
			if(div == "mapDiv") y = yearAxisIns["curYearearDiv"]
			else y = yearAxisIns["curYear" + div.substring(1)]
			var s = "note"
			if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverMapPoint", session: s, year: y, note: div.substring(1), cid: d.id, mode: curMode.state, time: getFormatedTime(), user: curUser.username}
	  		addLog(obj)
		}
		hoverBegin = 0
		d3.select("#tooltip").style("visibility", "hidden")
		mouseLeave(d.id, div, cDiv)
	})
	
}

ModeClass.prototype.addEntityModeNote = function(){
	d3.selectAll(".citeNoteButton").style("display", null)
	d3.selectAll(".citeNoteButton").style("color", function(d){
		var re = curNote.entityInNote.filter( a => a.type == "note").map(a => a.note)
		if(re.indexOf(d._id) > -1) {
			$(this).prop("disabled", true)
			return "#999"
		}
		if(d._id == $("#postit").data("_id")){
			$(this).prop("disabled", true)
			return "#999"
		}
		$(this).prop("disabled", false)
		return "black"
	})
	d3.selectAll(".deleteNoteButton").property("disabled", function(d){
		if(d._id == $("#postit").data("_id")){
			d3.select(this).style("color", "#999")
			return true
		}
		return false
	})
	d3.selectAll(".editNoteButton").style("color", "#999").property("disabled", true)

}

ModeClass.prototype.normalModeNote = function(){
	d3.selectAll(".noteDisDiv").each(function(d){
		d3.select(this).select(".citeNoteButton").style("color", "black").property("disabled", false)
		
		d3.select(this).select(".deleteNoteButton").property("disabled", false).styles({
			display: function(){ if(d.username == curUser.username) return null; return "none"},
			color: "black"
		})
		d3.select(this).select(".editNoteButton").styles({
			display: function(){ if(d.username == curUser.username) return null; return "none"},
			color: "black"
		}).property("disabled", false)
	})

}

ModeClass.prototype.normalMode = function(div = "stackDiv"){
	// var self = this
	// $("#" + div + " .hoverGroup").css("pointer-events", "none")
	// if(div == "stackDiv")
		d3.select("#" + div).select(".mouseLine").on("mouseenter", function(d){
			hoverBegin = getTime()
		}).on("mouseleave", function(){
	      if(hoverBegin && getTime() - hoverBegin > 3000){
	      	var s = "note"
	    	if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverMouseline", session: s, note: div.substring(1), year: $(this).data("year"), mode: curMode.state, time: getFormatedTime(), user: curUser.username}
	  		addLog(obj)
			}
			hoverBegin = 0
		}).on("click", null)//function(){
			// if(div == "stackDiv")
	      	//updateYear($(this).data("year"), "earDiv")
	      	// else updateYear($(this).data("year"), div.substring(1))
	    //})
	// d3.select("#" + div).selectAll(".tooltipGroup").select("circle").style("stroke-width", "1px")
	d3.select("#" + div).selectAll(".browser").on("mouseenter", function(d){
	    // showTooltip(d.country, d3.event.pageX, d3.event.pageY)
	    hoverBegin = getTime()
	    if(div == "stackDiv")
	    	mouseEnter(d.id, "mapDiv", "stackDiv")
	    else mouseEnter(d.id, "m" + div.substring(1), div)
	}).on("mouseleave", function(d){
	    // d3.select("#tooltip").styles({
	    //     visibility: "hidden",
	    // })
	    if(hoverBegin && getTime() - hoverBegin > 3000){
	    	var s = "note"
	    	if(curNote.discussionNote) s = "discussion"
	    	var obj = {type: "hoverTimeline", session: s, note: div.substring(1), cid: d.id, mode: curMode.state, time: getFormatedTime(), user: curUser.username}
	  		addLog(obj)
		}
		hoverBegin = 0
	    if(div == "stackDiv")
	    	mouseLeave(d.id, "mapDiv", "stackDiv")
	    else mouseLeave(d.id, "m" + div.substring(1), div)
	}).on("click", null)

}

function showTooltip(text, x, y){

  d3.select("#tipName").html(text)
  d3.select("#tooltip").styles({
    left: (x + 12) + "px",   
    top: (y + 6) + "px",
    visibility: "visible"
  })
}

function addEntityToNote(entity){
	// var t = $(this).data("data").toLowerCase()
	//check duplicate
	var re = $.grep(curNote.entityInNote, function(e){
		if(entity.type == "note"){
			if(e.type == "note" && e.note == entity.note) return true
			return false
		}
		else if(entity.type == "chart" && e.type == "chart"){
			if(e.entities.sort().join(", ") == entity.entities.sort().join(", "))
				return true
			return false
		}
		else if(entity.type == "year" && e.type == "year"){
			if(e.entities.sort().join(", ") == entity.entities.sort().join(", ") && e.year == entity.year)
				return true
			return false
		}
		else if(e.text == entity.text) return true
		return false
	})
	if(re.length){
		curNote.entityInNote.splice(curNote.entityInNote.indexOf(re[0]), 1);
	    curNote.entityInNote.push(re[0]);
	    var obj = {type: "addEntityRepeat", entity: JSON.parse(JSON.stringify(entity)), time: getFormatedTime(), user: curUser.username}
    	addLog(obj)
	}
	else{
		var obj = {type: "addEntity", entity: JSON.parse(JSON.stringify(entity)), time: getFormatedTime(), user: curUser.username}
    	addLog(obj)
		curNote.entityInNote.push(entity)
	}
	// console.log(entity)
	updatePostit()
}

// Ui.prototype.drawChartWindow = function(){
//   var self = this
//   var diaObj = {
//     autoOpen: false,
//     height: $(window).height() * .9,
//     width: $(window).width() * .7,
//     modal: true,
//     dialogClass: "ui-dialog",
//     position: { my: 'right top', at: 'right-250 top+30' },
//     buttons: {
//     },
//     open:function(event, ui) {   //added here
// 	    $('.ui-widget-overlay').on('click', function() {
// 	      	$('#historyDialog').dialog('close');
//     	});
//   	},
//     close: function() {
//     	self.inWindow = false
//     }
//   }
// 	$("#historyDialog").dialog(diaObj);
// 	$(".ui-dialog-titlebar").hide();   
//  //    d3.select("#grid").select("svg").append("g").attrs({
// 	// 	id: "highlightGroup",
// 	// 	transform: 'translate(' + self.margin.left + ',' + self.margin.top + ')',
// 	// })
// }

Ui.prototype.drawProveChart = function(entityArray, entityData, div){
	// this.stackWidthHeight(div)
	this.drawStackedArea(entityArray, entityData, div)
	this.updateTooltip(entityArray.length, div)
    curMode.normalMode(div)
}

Ui.prototype.dehighlightTrace = function(){
	d3.select("#stackDiv").select(".highlightGroup").style("display", "none")

	d3.select("#stackDiv").select(".stackedGroup").selectAll(".browser").select("path").style("stroke", "#ffab00")
	d3.select("#stackDiv").select(".stackedGroup").selectAll(".browser").selectAll(".dot").style("fill", "#ffab00")
	
	d3.select("#mapDiv").select(".mapGroup").selectAll("path").style("opacity", .85).style("stroke-width", "1px")
}

Ui.prototype.highlightTrace = function(entities, entityArray = selectedEntities, div = "stackDiv"){
	var self = this
	var g = d3.select("#" + div).select(".highlightGroup").style("display", null)
	var yearEntities = entities.filter(d => d.type == "year")
	var yearData = g.selectAll(".lineTrace").data(yearEntities, function(d){return d})
	yearData.exit().remove()
	var yearEnter = yearData.enter().append("path").attr("class", "lineTrace")
	    .style("stroke", "black")
	    .style("stroke-width", "8px")
	    .style("opacity", "0.6")
	yearEnter = yearEnter.merge(yearData)
	yearEnter.attr("d", function(entity) {
	      var x = self["x" + div](self.parseDate(entity.year))
          var d = "M" + x + "," + self["height" + div];
          d += " " + x + "," + 0;
          return d;
      	}).style("display", function(entity){
      		var t = entity.entities.filter(value => -1 !== entityArray.indexOf(value))
      		if(t.length) return null;
      		return "none"
      	})

    if(div != "stackDiv") return
    var lineEntities = entities.filter(d => d.type == "line" || d.type == "chart")
	var lineArray = [].concat.apply([], lineEntities.map(a => a.entities))
    var lineEle = d3.select("#" + div).select(".stackedGroup").selectAll(".browser").filter(function(){
    	return lineArray.indexOf($(this).attr('class').split(' ')[1]) > -1
    })
    lineEle.select("path").style("stroke", "#c0625f")
    lineEle.selectAll(".dot").style("fill", "#c0625f")

    var mapEntities = entities.filter(d => d.type == "map" && d.year == curYear)
    if(mapEntities.length){
    	d3.select("#mapDiv").select(".mapGroup").selectAll("path").style("opacity", 1)
    	return;
    }
	
    var pointEntities = entities.filter(d => d.type == "mapPoint" && d.year == curYear)
    var pointArray = [].concat.apply([], pointEntities.map(a => a.entities))
    d3.select("#mapDiv").select(".mapGroup").selectAll("path").filter(function(){
    	return pointArray.indexOf($(this).attr('class')) > -1
    }).style("opacity", 1).style("stroke-width", "2px")


    // var pointData = g.selectAll(".pointTrace").data(pointEntities, function(d){return d})
	// pointData.exit().remove()
	// var pointEnter = pointData.enter().append("circle").attrs({
	// 		class: "pointTrace",
	// 		r: 5,
	// 	}).style("stroke", "#a81010")
 //    	.style("fill", "none")
	//     .style("stroke-width", "2px")
	//     .style("opacity", "0.6")
	// pointEnter = pointEnter.merge(pointData)
	// pointEnter.attrs({
	// 	cx: function(d){return self["x" + div](self.parseDate(d.year))},
 //    	cy: function(entity){
 //    		var index = years.indexOf(entity.year), i = entityArray.indexOf(entity.entities[0]) * 2,
 //    		array = self["stackData" + div].map(d => d[index][1]);
 //    		if(entity.gender == "men")
 //    			i += 1
 //    		return self["y" + div](array[i])
 //    	}
 //    }).style("display", function(entity){
 //    	if(entityArray.indexOf(entity.entities[0]) > -1) return null;
 //    	return "none"
 //    })

 //    if(div == "stackDiv"){
 //    	pointEntities.forEach(function(d){
	// 		var t = d.entities[0]
	// 		if(entityArray.indexOf(t) > -1){
 //    			var keys = t.trim().split(/\s|\//g)
 //        		var name = keys.join("")
 //        		d3.select("#" + div).selectAll("." + name).select("." + d.gender).styles({
	// 				"fill-opacity": 1,
	// 				"stroke-opacity": 1,
	// 			})
 //    		}
	// 	})
 //    	fillinArea()
 //    }
 //    function fillinArea(){
 //    	var indiEntities = []
	// 	entities.filter(d => d.type != "point" && d.type != "note").forEach(function(d){
	// 		indiEntities = indiEntities.concat(d.entities)
	// 	})
	// 	indiEntities = indiEntities.filter((v,i) => indiEntities.indexOf(v) === i)
 //    	indiEntities.forEach(function(d){
 //    		if(entityArray.indexOf(d) > -1){
 //    			var keys = d.trim().split(/\s|\//g)
 //        		var name = keys.join("")
 //        		highlightArea("stackDiv", name)
 //    		}
 //    	})
 //    }

}

// function highlightArea(div, name){
// 	d3.select("#" + div).selectAll("." + name).select(".area").styles({
// 		"fill-opacity": 1,
// 		"stroke-opacity": 1,
// 	})
//    	d3.select("#label" + name).select("label").style("background", "rgba(204, 204, 204, 1)")
// }

// function dehighlightArea(div, name){
// 	d3.select("#" + div).selectAll("." + name).select(".area").styles({
// 		"fill-opacity": .6,
// 		"stroke-opacity": .2,
// 	})
//    	d3.select("#label" + name).select("label").style("background", "rgba(204, 204, 204, .5)")
// }
