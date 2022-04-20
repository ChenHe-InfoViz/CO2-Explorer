Note = function(){
	this.entityInNote = []
	this.drawNoteFramework()
	this.entityFilter = null
	this.userEntityNote = null //count of notes related to each entity
	this.entityMax = -1
	this.entityMin = 1000
	this.discussionNote = null //d3 element
	this.discussionNotes = null //data
	this.graphWidth = 150
	this.notes = null //record current displayed notes
	// this.displayGraph = true;
	this.graph = new Graph()
	this.curHighlighted = null
}

function annotation(obj = null){
	$("#postitDiv").css("display", "flex");
	// $("#publicBox").prop("checked", "checked")
	// $("#publicBox").prop("disabled", false)

	$("#postit").focus()
	document.getElementById("postit").value = '';
	$("#postit").prop("disabled", false)
	$("#controllersDiv > button").prop("disabled", false)
	// $("#noteSaveButton").prop("disabled", false)
	var canvas = document.getElementById("checkArrow")
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if(obj){
		// $("#publicBox").prop("checked", !obj.public)
		// $("#publicBox").prop("disabled", true)
		$("#postit").val(obj.note)
		// $("#addEntityButton").css("display", null)

		$("#noteSaveButton").css("display", "none")
		$("#noteUpdateButton").css("display", "")
		$("#postit").data("_id", obj._id)
		// $("#postit").data("public", obj.public)
		$("#postit").data("note", obj.note)
		curNote.entityInNote = obj.entities.slice()
		$("#postit").data("entities", curNote.entityInNote)
	}
	else{
		$("#postit").data("_id", null)
		$("#noteSaveButton").css("display", "")
		$("#noteUpdateButton").css("display", "none")
		$("#postit").height(180)
		$("#entityDiv").height(0)
	}
	updatePostit(false)
	curMode.state = "addEntityMode"
    curMode[curMode.state]()
    curMode[curMode.state + "Map"]()
    curMode[curMode.state + "Note"]()
}

Note.prototype.showNotes = function(){
	if($("#showNoteDiv").css("display") == "none"){
		// curNote.noteInterval = setInterval(retrieveNotesAuto, 10000)
		$("#showNoteDiv").css("display", "block");
		$("#moveHandle1").css("display", "inline-block");
		// $("#showNoteDiv").css("min-width", showNoteWidth)
		$("#showNoteDiv").css("width", showNoteWidth)
		// $("#main").width(($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true)) + "px")
		$("#main").width($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true))
		updateMainWidth()
	}
	// console.log("retrieve notes")
	var self = this
	$.ajax({
        type: "POST",
        url: "/note",
        contentType:'application/json',
        dataType: "json",
        data: JSON.stringify({username: curUser.username, entity: self.entityFilter}),
        success: function(response){
            try{
            	// response.forEach(function(d) {console.log(d.entities)})
            	self.notes = response
            	self.updateNotes(response)
            	curMode[curMode.state + "Note"]()
            	if(curNote.curHighlighted){
            		self.dehighlightNotes(false)
            		self.highlightNotes(curNote.curHighlighted.ids, curNote.curHighlighted.center)
            	}
            	updateNoteDis()
            }
            catch(e){
              console.log("error catch " + e)
            }
            // updateEntityList();
            
            //d3.select("#showNoteDiv").select(".refreshNote").text("\uf021")
        },
        error: function () {
            console.log("get page request failed.");
            //d3.select("#showNoteDiv").select(".refreshNote").text("\uf021")
        },
    })
}

function updatePostit(add = true){
	// console.log(entityInNote)
	var h = $("#entityDiv").height()
	// if(add && curNote.entityInNote[curNote.entityInNote.length - 1].type != "note"){
	// 	var t = $("#postit").val() + "\n" + curNote.entityInNote[curNote.entityInNote.length - 1].text;
	// 	$("#postit").val(t)
	// 	var sh = $("#postit")[0].scrollHeight - 4, ch = $("#postit").height()
	// 	// console.log(sh)
	// 	if(sh <= ch || ch > 250){
	// 		$("#postit").height(ch)
	// 	}
	// 	else $("#postit").height(sh);
	// }
	$("#postit").data("entities", curNote.entityInNote)
	var reverseEntities = curNote.entityInNote.slice().reverse()
	var entityData = d3.select("#entityDiv").selectAll(".entityNoteGroup").data(reverseEntities, function(d){return d.text})
	entityData.exit().remove()
	// console.log(reverseEntities)
    // entityData.select("label").text(function(d){return d.value})

	var entityEnter = entityData.enter().append("div").attr("class", "entityNoteGroup").style("margin-bottom", "4px")
		.on("mouseenter", function(d){
			hoverBegin = getTime()
	    	if(d.type == "note") curNote.highlightNotes([d.note])
	    	else curUi.highlightTrace([d])
	    }).on("mouseleave", function(d){
	    	if(hoverBegin && getTime() - hoverBegin > 3000){
		    	var obj = {type: "hoverEntityInNote", entity: d, time: getFormatedTime(), user: curUser.username}
		  		addLog(obj)
			}
			hoverBegin = 0
	    	if(d.type == "note"){
	    		curNote.dehighlightNotes()
	    		// var re = d3.selectAll(".noteDisDiv").filter(function(a){ return a._id == d.note })
	    		// re.style("background", "#c1fbdf").select("p").style("background", "#e0fcef")
	    		// if(curNote.discussionNote) highlightDiscussionNote()
	    	}
	    	else{
	    		curUi.dehighlightTrace()
			}
	    })
	entityEnter.append("text").text("\uf00d").attr("class", "awesomeButton").styles({
    	"padding-right": "3px",
    	"padding-left": "3px",
    }).on("click", function(d){
    	hoverBegin = 0
    	var re = $.grep(curNote.entityInNote, function(e){
    		return e.text == d.text
    	})
    	// console.log(re[0])
    	var obj = {type: "removeEntity", entity: JSON.parse(JSON.stringify(re[0])), time: getFormatedTime(), user: curUser.username}
  		addLog(obj)
    	curNote.entityInNote.splice(curNote.entityInNote.indexOf(re[0]), 1)
    	if(re[0].type == "note"){
    		$(".citeNoteButton").filter(function(){return $(this).prop("__data__")['_id'] == re[0].note}).css("color", "black").prop("disabled", false)
		}
    	// console.log(curNote.entityInNote)
    	updatePostit(false)
    	if(d.type == "note"){
    		var re = d3.selectAll(".noteDisDiv").filter(function(a){ return a._id == d.note })
    		re.style("background", "#c1fbdf").select("p").style("background", "#e0fcef")
    		if(curNote.discussionNote) highlightDiscussionNote()
    	}
    	else{
    		curUi.dehighlightTrace()
		}
    	
    })

	entityEnter.append("label").attrs({
        class: "entityNoteLabel"
    })

    entityEnter = entityEnter.merge(entityData)
    entityEnter.selectAll(".entityNoteLabel").html(function(d){return d.text})
    // wrap(entityEnter.selectAll(".entityNoteLabel"), $(this).width())
    entityEnter.selectAll(".entityNoteLabel").each(function(d){
    	if((d.type != "year" && d.type != "chart")|| d.entities.length < 2) return
    	if(d.type == "year")
    		$(this).text(d.year + ", ");
    	else $(this).text("");

    	var labelData = d3.select(this).selectAll("span").data(d.countries)
    	labelData.exit().remove()
    	var labelEnter = labelData.enter().append("span").styles({
    		background: "#aaa",
    		"margin-right": "3px",
    		display: "inline-block"
    	})
    	labelEnter.append("label").attrs({
    		class: "awesomeButton"
    	}).text("\uf00d").on("click", function(d){
    		hoverBegin = 0
    		var dat = $(this).parent().parent().prop("__data__")
    		var re = $.grep(curNote.entityInNote, function(e){
	    		return e.text == dat.text
	    	})
	    	var ind = re[0].countries.indexOf(d)
	    	re[0].countries.splice(ind, 1)
	    	var cid = null
	    	for(var i = 0; i < data.length; i++){
	    		if(data[i].country == d){
	    			cid = data[i].id
		    		break;
		    	}
	    	}
	    	re[0].entities.splice(re[0].entities.indexOf(cid), 1)
	    	if(dat.type == "year"){
	    		var obj = {type: "removeFromYear", cid: cid, entity: JSON.parse(JSON.stringify(re[0])), time: getFormatedTime(), user: curUser.username}
      			addLog(obj)
	    		re[0].text = re[0].year + ", "
	    	}
	    	else{
	    		var obj = {type: "removeFromChart", cid: cid, entity: JSON.parse(JSON.stringify(re[0])), time: getFormatedTime(), user: curUser.username}
      			addLog(obj)
	    		re[0].text = ""
	    	}

	    	if(re[0].countries.length == 1) re[0].text +=  re[0].countries[0]
	    	// else if(re[0].countries.length == 2) re[0].text = re[0].year + ", " + re[0].countries[0] + ", and " + re[0].countries[1]
	    	else{
	    		re[0].text += re[0].countries[0]
	    		 for(var i = 1; i < re[0].countries.length - 1; i++){
		    		re[0].text += ", " + re[0].countries[i]
		    	}
		    	re[0].text += ", and " + re[0].countries[re[0].countries.length - 1]
			}
	    	
    		// console.log(curNote.entityInNote)
    		updatePostit(false)
    	})
    	labelEnter.append("label").text(function(d){ return d })
    })

    omitText('.entityNoteLabel', 72)
   
    entityEnter.order()
    var enscro = $("#entityDiv")[0].scrollHeight
    // updateRightHeight()
    if(enscro <= h || $("#entityDiv").height() > 250 ){
    	$("#entityDiv").height(h)
    }
    else{
    	$("#entityDiv").height(enscro)
    }
    // console.log($("#entityDiv").height() + $("#postit").height() + $("#controllersDiv").height())
    // $("#postitDiv").height($("#entityDiv").height() + $("#postit").height() + $("#controllersDiv").height())
    // entityEnter.select("label").text(function(d){return d.value})
}

function highlightDiscussionNote(){
	curNote.discussionNote.select("p").style("background", "#fc9f9d")
    curNote.discussionNote.style("background", "#ffbebd")
    var id = curNote.discussionNote.datum()._id
    var discussionNode = d3.select("#graphSvg").selectAll(".node").filter(function(d){
		return d._id == id
	}).attr("fill", "#fc9f9d")
}

Note.prototype.highlightNotes = function(noteids, center = null){
	this.curHighlighted = {ids: noteids, center: center}
	// console.log(noteids + " " + center)
	var centerEle = null
	// console.log(center)
	
	var relatedDivs = d3.selectAll(".noteDisDiv").filter(function(d){
		if(d._id == center) centerEle = this
		return noteids.indexOf(d._id) > -1
	}) 
	relatedDivs.style("background", "rgba(250, 242, 164, 0.8)")
	relatedDivs.select("p").style("background", "rgba(252, 248, 193, 0.5)")
	if(centerEle) d3.select(centerEle).style("background", "#fac67a").select("p").style("background", "#ffdca8")

	centerEle = null
	
	if($("#graphSvg").css("display") != "none"){
		var relatedNodes = d3.select("#graphSvg").selectAll(".node").filter(function(d){
			if(d._id == center) centerEle = this
			return noteids.indexOf(d._id) > -1
		})
		if(centerEle) d3.select(centerEle).attr("fill", "#fac67a")
		relatedNodes.attr("fill", "rgba(250, 242, 164)")
		var relatedLinks = d3.select("#graphSvg").selectAll(".edgepath").filter(function(d){
			// console.log(d.target)
			return center == d.target._id || center == d.source._id
		})
		// console.log(relatedLinks)
		relatedLinks.style("opacity", "1")
	}
}

Note.prototype.dehighlightNotes = function(discard = true){
	if(discard) this.curHighlighted = null
	d3.select("#graphSvg").selectAll(".node").attr("fill", "#aaa")//"#c1fbdf")
	d3.select("#graphSvg").selectAll(".edgepath").style("opacity", ".4")
    d3.selectAll(".noteDisDiv").style("background", null)//"#c1fbdf")
    d3.selectAll(".noteDisDiv").select("p").style("background", null)//"#e0fcef")
    if(curNote.discussionNote){
    	highlightDiscussionNote()
    }
}

Note.prototype.updateFilter = function(div = "#showNoteDiv"){
	var d3div = d3.select(div)
	var self = this
	
	if(this.entityFilter || this.discussionNote){
		d3div.select(".insLabel").text("All notes related to: ")
		d3div.select(".filterGroup").style("display", null)
		// d3div.select(".externalButton").style("display", null)
		if(this.discussionNote){
			d3div.select(".filtername").text("discussion")
			// d3div.select(".externalButton").text("\uf08e")
			//if(div == "#showNoteDiv")
			d3div.select(".filterRemove").text("\uf00d").on("click", function(){
		    	var obj = {type: "removeDiscussion", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
      			addLog(obj)
      			self.removeDiscussions()
		    	self.showNotes()
		    })
		    d3div.select(".filterGroup").style("background", "#ffbebd")
		    // $(div + " > .filterGroup").css("background", "#90cafc")
		}
		
	    else{
	    	var t = (self.entityFilter.hasOwnProperty("country")? self.entityFilter.country : self.entityFilter.year)
			d3div.select(".filtername").text(t)
			// d3div.select(".externalButton").style("display", "none")
			//if(div == "#showNoteDiv")
			d3div.select(".filterRemove").text("\uf00d")
		    .on("click", function(){
		    	var obj = {type: "removeFilter", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
      			addLog(obj)
		    	d3.select("#countryDiv").selectAll(".countRect").style("background", "rgb(67, 148, 218)")
    			d3.select("#yearDiv").selectAll(".noteCountRect").style("fill", "rgb(67, 148, 218)")
		    	self.entityFilter = null
		    	self.updateFilter()
		    	self.showNotes()
		    	$("#showNoteDiv > .showNoteArea").animate({
	                scrollTop: 0
	            }, 1000);
		    })
		    d3div.select(".filterGroup").style("background", "#ccc")
	    }
	}
	else{ 
		d3div.select(".insLabel").text("All notes: ")
    	d3div.select(".filterGroup").style("display", "none")
	}

	d3div.select(".showNoteArea").style("height", ($(div).height() - $(div + " > .noteFilterDiv").height() - $(div + " > .noteDisControlDiv").height() - 15) + "px")

}

Note.prototype.updateNotes = function(notes){
	var self = this
    var divs = d3.select("#showNoteDiv").select(".showNoteArea").selectAll(".noteDisDiv").data(notes, function(d){return d._id});
    divs.exit().remove();

    var divsEnter = divs.enter().append("div").attrs({
    	class: "noteDisDiv"
    })

    var firstDiv = divsEnter.append("div").attr("class", "firstRowDiv")
    firstDiv.append("label").styles({
    	color: "#666"
    })

    firstDiv.append("text").text("\uf014").attr("class", "deleteNoteButton firstRowButton").on("click", function(d){
		if($(this).prop("disabled")) return
		var s = "note"
		if(curNote.discussionNote) s = "discussion"
		var obj = {type: "deleteNote", session: s, mode: curMode.state, note: d._id, time: getFormatedTime(), user: curUser.username}
      	addLog(obj)
		removeNote(d, this)
	}).on("mouseenter", function(){
		showTooltip("Delete this note.", d3.event.pageX - 12, d3.event.pageY)
	}).on("mouseleave", function(){
		d3.select("#tooltip").styles({
        	visibility: "hidden",
    	})
	})
	firstDiv.append("text").text("\uf044").attr("class", "editNoteButton firstRowButton").on("click", function(d){
		if($(this).prop("disabled")) return
		var s = "note"
		if(curNote.discussionNote) s = "discussion"
		var obj = {type: "clickEditNote", session: s, note: d._id, time: getFormatedTime(), user: curUser.username}
      	addLog(obj)
		annotation(d)
	}).on("mouseenter", function(){
		showTooltip("Edit this note.", d3.event.pageX - 12, d3.event.pageY)
	}).on("mouseleave", function(){
		d3.select("#tooltip").styles({
        	visibility: "hidden",
    	})
	})

	if(curUser.username != "")
		firstDiv.append("text").text("\uf10e").attr("class", "citeNoteButton firstRowButton").on("click", function(d){
			if($(this).prop("disabled")) return
			if(curMode.state == "normalMode"){
				var s = "note"
				if(curNote.discussionNote) s = "discussion"
				var obj = {type: "replyToNote", session: s, note: d._id, time: getFormatedTime(), user: curUser.username}
		      	addLog(obj)
				annotation()
			}
			addEntityToNote({note: d._id, text: d.note, type: "note"})
	    	d3.select(this).style("color", "#999")
	    	$(this).prop("disabled", true)
		}).on("mouseenter", function(d){
			var re = curNote.entityInNote.filter( a => a.type == "note").map(a => a.note)
			var text = ""
			if(re.indexOf(d._id) > -1) {
				text = "Referred."
			}
			else if(d._id == $("#postit").data("_id")){
				text = "In edit."
			}
			else text = "Refer to this note."
			showTooltip(text, d3.event.pageX - 12, d3.event.pageY)
		}).on("mouseleave", function(){
			d3.select("#tooltip").styles({
	        	visibility: "hidden",
	    	})
		})

	firstDiv.append("text").text("\uf086").attr("class", "viewHisButton firstRowButton").on("click", function(d){
		self.discussionNote = d3.select(this.parentNode.parentNode)
		var obj = {type: "viewDiscussion", mode: curMode.state, note: self.discussionNote.datum()._id, time: getFormatedTime(), user: curUser.username}
      	addLog(obj)
		// console.log(self.discussionNote.datum()._id)
		viewDiscussion(true)
		self.updateFilter()
		$("#showNoteDiv > .showNoteArea").animate({
            scrollTop: 0
        }, 1000);
	}).on("mouseenter", function(){
		showTooltip("View discussion.", d3.event.pageX - 12, d3.event.pageY)
	}).on("mouseleave", function(){
		d3.select("#tooltip").styles({
        	visibility: "hidden",
    	})
	})

	divsEnter.append("p").on("mouseenter", function(d){
		hoverBegin = getTime()
		// console.log(d)
		var relatedNotes = d.citeBy.map(a => a._id).concat(d.entities.filter(a => a.type == "note").map( a => a.note))
		// console.log("highlight notes")
		// curUi.highlightTrace(d.entities.filter(a => a.type != "note"))
		curNote.highlightNotes(relatedNotes, d._id)
	}).on("mouseleave", function(d){
		if(hoverBegin && getTime() - hoverBegin > 3000){
			var session = "note"
			if(curNote.discussionNote) session = "discussion"
			var obj = {type: "hoverNoteText", mode: curMode.state, session: session, note: d._id, time: getFormatedTime(), user: curUser.username}
      		addLog(obj)
		}
		hoverBegin = 0
    	curNote.dehighlightNotes()
    })
	
	var entityDiv = divsEnter.append("div").attr("id", function(d){
		return "en" + d._id
	}).attr("class", "entityNoteDispDiv")

		entityDiv.append("div").attrs({
		class: "yearProveDiv",
		id: function(d){
			return "y" + d._id
		}
	}).style("height", "30px").datum(null)
	entityDiv.append("div").attrs({
		class: "mapProveDiv",
		id: function(d){
			return "m" + d._id
		}
	}).style("height", "300px").datum(null)
	entityDiv.append("div").attrs({
		class: "chartProveDiv",
		id: function(d){
			return "c" + d._id
		}
	}).style("height", "200px").datum(null)

	var relatedNoteDiv = divsEnter.append("div").attr("class", "noteEntityDiv")
	relatedNoteDiv.append("label").attr("class", "noteDisLabel").text("Refer to: ")

	//update entity data
	// divs.select(".entityNoteDispDiv")
	divsEnter.each(function(d){
		curMap.iniProveMap(d._id)
		curUi.initStackedArea("c" + d._id)
		yearAxisIns.draw(d._id)
	})
	divsEnter = divsEnter.merge(divs)
    divsEnter.order();
    divsEnter.style("display", "block")
	self.updateElements(divsEnter)
	self.updateNoteArea(divsEnter)
	self.updateChartArea(divsEnter)
	self.updateWidth()
}

Note.prototype.updateElements = function(divsEnter){
	var self = this
	divsEnter.select(".firstRowDiv").select("label").text(function(d){
    	return toDisplayTime(d.time)
    })
	divsEnter.select("p").html(function(d){return d.note;})//.styles({
	 //    	background: function(){
	 //    		//console.log(d.username)
	 //    		//console.log(username)
	 //    		if(d.username == curUser.username){
	 //    			if(d.public) return "#e0fcef"
	 //    			return "#fbe0ee"
	 //    		}
	 //    		return "#e0fcef"
	 //    	}
	 //    })
	 //    d3.select(this).select(".entityNoteDispDiv").styles({
	 //    	background: function(){
	 //    		if(d.username == curUser.username){
	 //    			if(d.public) return "#c1fbdf"
	 //    			return "#f9b6d5"
	 //    		}
	 //    		return "#c1fbdf"
	 //    	}
		// });
		// var buttonDiv = d3.select(this).select(".noteButtonDiv")//.styles({
	 //    	background: function(){
	 //    		if(d.username == curUser.username){
	 //    			if(d.public) return "#c1fbdf"
	 //    			return "#f9b6d5"
	 //    		}
	 //    		return "#c1fbdf"
	 //    	}
		// })
		// buttonDiv.select(".upNoteButton").style({
		// 	"color": function(d){if(d.up.indexOf(username) > -1) return "green"; return "black"}
		// })
		// // buttonDiv.select(".upCountText").text(function(d){return d.up.length;})
		// buttonDiv.select(".downNoteButton").style({			
		// 	"color": function(d){if(d.down.indexOf(username) > -1) return "green"; return "black"}
		// })
		// // buttonDiv.select(".downCountText").text(function(d){return d.down.length;})
	divsEnter.select(".viewHisButton").styles({
		display: function(d){
			// console.log(d.entities.filter(a => a.type == "note").length)
			if(self.discussionNote) return "none"
			var re = d.citeBy.filter(a => a.public == true || a.username == curUser.username)
			if(d.entities.filter(a => a.type == "note" && a.note != null).length || re.length) 
				return null; 
			return "none"
		}

	})
}

Note.prototype.updateNoteArea = function(divsEnter){
	var self = this
	divsEnter.select(".noteEntityDiv").each(function(da){

	// divsEnter.each(function(da){
		// console.log(da._id)

		var noteEntities = da.entities.filter(a => a.type == "note")
		if(!noteEntities.length){
			d3.select(this).style("display", "none")
			return
		}
		d3.select(this).style("display", null)


		// if(noteEntities.length > 0){
		//    var label = d3.select(this).select(".noteEntityDiv").selectAll(".noteDisLabel").data([1])
		//    var labelEnter = label.enter().append("label").attr("class", "noteDisLabel").text("Reply to: ")
		//    label.exit().remove()
		// }
		// else{
		// 	$(".noteEntityDiv", this).empty()
		// }
		var inputs = d3.select(this)/*.select(".noteEntityDiv")*/.selectAll(".entityNoteDisLabel").data(noteEntities, function(d){return d; })
    	var inputsEnter = inputs.enter().append("label").attrs({ class: "entityNoteDisLabel" })//.text(function(d){return d.value.text;})
	       
        inputs.exit().remove();
        inputsEnter = inputsEnter.merge(inputs)
        inputsEnter.order();
        inputsEnter.on("mouseenter", function(d){
        	hoverBegin = getTime()
        	curNote.highlightNotes([d.note], da._id)
        }).on("mouseleave", function(d){
        	if(hoverBegin && getTime() - hoverBegin > 3000){
        		var session = "note"
        		if(self.discussionNote) session = "discussion"
		    	var obj = {type: "hoverNoteInNote", mode: curMode.state, session: session, note: da._id, relatedNote: d.note, time: getFormatedTime(), user: curUser.username}
		  		addLog(obj)
			}
			hoverBegin = 0
        	self.dehighlightNotes()
        	
        	
   //      	d3.select("#stackDiv").select(".highlightGroup").style("display", "none")
			// d3.select("#stackDiv").selectAll(".area").styles({
			// 	"fill-opacity": .6,
			// 	"stroke-opacity": 0.2,
			// })
			// d3.selectAll(".selectedLi").select("label").style("background", "rgba(204, 204, 204, 0.5)")
        }).html(function(d){return d.text;})
    })
    omitText(".entityNoteDisLabel", 120)

}

Note.prototype.updateChartArea = function(divsEnter){
	// var chartEn = [], mapEn = []
	d3.selectAll(".noteDisDiv").select(".entityNoteDispDiv").each(function(da){
		var mapEn = da.entities.filter(a => a.type == "map" || a.type == "mapPoint")
		var chartEn = da.entities.filter(a => a.type == "line" || a.type == "year" || a.type == "chart")
		if(!chartEn.length && !mapEn.length){
			$("#en" + da._id).css("display", "none")
			$("#y" + da._id).css("display", "none")
			$("#m" + da._id).css("display", "none")
			$("#c" + da._id).css("display", "none")
			return
		}
		$("#en" + da._id).css("display", "")
		var ys = []
		mapEn.forEach(function(e){
			ys.push(e.year)
		})
		ys = ys.filter((v,i) => ys.indexOf(v) === i).sort()
		if(ys.length > 1){
			$("#y" + da._id).css("display", "flex")
			yearAxisIns.updateData(ys, da._id)
		}
		// //if before it is playing, now only one year after an update
		else{
			$("#y" + da._id).css("display", "none")
			if(yearAxisIns.hasOwnProperty("playerState" + da._id) && yearAxisIns["playerState" + da._id]){
				yearAxisIns["playerState" + da._id] = false;
				clearInterval(yearAxisIns["player" + da._id]);
			}
		}
		var entities = []
		chartEn.forEach(function(e){
			entities = entities.concat(e.entities)
		})
		entities = entities.filter((v,i) => entities.indexOf(v) === i)
		// if(!chartEn.length || !mapEn.length){
		if(chartEn.length){
			$("#c" + da._id).css("display", "flex")
			var entityData = []
			entities.forEach(function(d){
			  var array = data.filter( a => a.id == d).sort((a,b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0))
			  var obj = {}
			  obj.country = array[0].country
			  obj.id = d
			  obj.data = array
			  entityData.push(obj)
			})
			curUi.drawProveChart(entities, entityData, "c" + da._id)
			// console.log(da)
		}
		else $("#c" + da._id).css("display", "none")
		if(mapEn.length){
			$("#m" + da._id).css("display", "flex")
			entities.forEach(function(d){
				curMap.updateMapOutline(d, "#4394da", "m" + da._id)
			})
			if(yearAxisIns.hasOwnProperty("curYear" + da._id) && ys.indexOf(yearAxisIns["curYear" + da._id]) > -1) updateYear(yearAxisIns["curYear" + da._id], da._id)
			else updateYear(ys[0], da._id)
		}
		else $("#m" + da._id).css("display", "none")

	})
}

Note.prototype.updateWidth = function(){
	d3.selectAll(".entityNoteDispDiv").each(function(d){
		if($("#y" + d._id).css("display") != "none"){
			yearAxisIns.updateWidth(d._id)
		}
		if($("#m" + d._id).css("display") != "none"){
			curMap.updateWidthHeight(d._id)
		}
		if($("#c" + d._id).css("display") != "none"){
			curUi.stackWidthHeight("c" + d._id)
			var chartEn = d.entities.filter(a => a.type == "year")
			var entities = []
			chartEn.forEach(function(e){
				entities = entities.concat(e.entities)
			})
			entities = entities.filter((v,i) => entities.indexOf(v) === i)
			curUi.highlightTrace(d.entities, entities, "c" + d._id)
		}
	})
}

Note.prototype.removeDiscussions = function(){
	this.discussionNote.style("background", null)//"#c1fbdf")
	this.discussionNote.select("p").style("background", null)//"#e0fcef")
	this.discussionNote = null
	this.updateFilter()
	$("#showNoteDiv > .showNoteArea").animate({
        scrollTop: 0
    }, 1000);
	$("#showGraphDiv").css("display", "none");
	$("#moveHandle2").css("display", "none");
	$("#main").width($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true))
	updateMainWidth()
}

Note.prototype.showGraph = function(){
	var links = []

	this.discussionNotes.forEach(function(d){
		var ens = d.entities.filter(a => a.type == "note" && a.note != null)
		for(var i = 0; i < ens.length; i++){
			links.push({source: ens[i].note, target: d._id})
		}
	})
	this.graph.drawGraph(this.discussionNotes, links)
}


function retrieveNotesAuto(){
	if(curNote.discussionNote) viewDiscussion()
  	else curNote.showNotes()
}

function viewDiscussion(click = false){
	// console.log(curNote.discussionNote)
	if($("#showNoteDiv").css("display") == "none"){
		$("#showNoteDiv").css("display", "block");
		// curNote.noteInterval = setInterval(retrieveNotesAuto, 10000)
		// $("#showNoteDiv").css("min-width", showNoteWidth)
		$("#showNoteDiv").css("width", showNoteWidth)
		$("#showGraphDiv").css("display", "block");
		$("#moveHandle2").css("display", "inline-block");
		$("#moveHandle1").css("display", "inline-block");
		// $("#showGraphDiv").css("min-width", curNote.graphWidth)		
		$("#showGraphDiv").css("width", curNote.graphWidth)
		// $("#main").width(($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true) - $("#showGraphDiv").outerWidth(true)) + "px")
		$("#main").width($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true) - $("#showGraphDiv").outerWidth(true))
		updateMainWidth()
	}

	if(click){
		$("#showGraphDiv").css("display", "block");
		$("#moveHandle2").css("display", "inline-block");
		// $("#showGraphDiv").css("min-width", curNote.graphWidth)
		$("#showGraphDiv").css("width", curNote.graphWidth)
		// $("#main").width(($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true) - $("#showGraphDiv").outerWidth(true)) + "px")
		$("#main").width($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true) - $("#showGraphDiv").outerWidth(true))
		updateMainWidth()
	}
	
	$.ajax({
       url: '/viewdiscussion',
       type: 'POST',
       contentType:'application/json',
       data: JSON.stringify({username: curUser.username, id: curNote.discussionNote.datum()._id}),
       dataType:'json',
       success: function(res){
       		// console.log(res)
       		curNote.discussionNotes = res
       		curNote.updateNotes(res)
       		curMode[curMode.state + "Note"]()
       		curNote.showGraph()
       		highlightDiscussionNote()
       		if(curNote.curHighlighted){
       			curNote.dehighlightNotes(false)
       			curNote.highlightNotes(curNote.curHighlighted.ids, curNote.curHighlighted.center)
       		}
       		updateNoteDis()
       		//current note back: yellow
       		//filter: discussion (add on top of the current filter)
       },
       error: function()
       {
           	console.log("view discussion error!");
       }
   });
}

// function updateNotes(div){
// 	var d3div = d3.select(div)
// 	d3div.selectAll(".noteDisDiv").each(function(d){
// 		d3.select(this).select("p").text(function(){return d.note;})//.styles({
	 //    	background: function(){
	 //    		//console.log(d.username)
	 //    		//console.log(username)
	 //    		if(d.username == curUser.username){
	 //    			if(d.public) return "#e0fcef"
	 //    			return "#fbe0ee"
	 //    		}
	 //    		return "#e0fcef"
	 //    	}
	 //    })
	 //    d3.select(this).select(".entityNoteDispDiv").styles({
	 //    	background: function(){
	 //    		if(d.username == curUser.username){
	 //    			if(d.public) return "#c1fbdf"
	 //    			return "#f9b6d5"
	 //    		}
	 //    		return "#c1fbdf"
	 //    	}
		// });
		// var buttonDiv = d3.select(this).select(".noteButtonDiv")//.styles({
	 //    	background: function(){
	 //    		if(d.username == curUser.username){
	 //    			if(d.public) return "#c1fbdf"
	 //    			return "#f9b6d5"
	 //    		}
	 //    		return "#c1fbdf"
	 //    	}
		// })
		// buttonDiv.select(".upNoteButton").style({
		// 	"color": function(d){if(d.up.indexOf(username) > -1) return "green"; return "black"}
		// })
		// // buttonDiv.select(".upCountText").text(function(d){return d.up.length;})
		// buttonDiv.select(".downNoteButton").style({			
		// 	"color": function(d){if(d.down.indexOf(username) > -1) return "green"; return "black"}
		// })
		// // buttonDiv.select(".downCountText").text(function(d){return d.down.length;})
		// d3.select(this).select(".viewHisButton").styles({
		// 	display: function(){
		// 		// console.log(d.entities.filter(a => a.type == "note").length)
		// 		if(curNote.discussionNote) return "none"
		// 		if(d.entities.filter(a => a.type == "note" && a.note != null).length || d.citeBy.length) 
		// 			return null; 
		// 		return "none"
		// 	}
		// d3.select(this).select(".entityNoteDispDiv").selectAll(".entityNoteLabel").each(function(da){
		// 	console.log(da.entity)
	// 	})
	    
	// })
	// d3div.selectAll(".noteEntityDiv").each(function(){
	// 	d3.select(this).selectAll(".entityNoteDisLabel").text(function(d){return d.text;})
 //    })
 //    omitText(".entityNoteDisLabel", 120)

    //d3div.selectAll(".noteButtonDiv").selectAll("button").data(function(d){
    	//console.log(d.note)
    	//return [d];
    //})
// }

// function updateNoteLabelBack(div = "#showNoteDiv"){
// 	var d3div = d3.select(div)
// 	d3div.selectAll(".entityNoteLabel").style("background", function(d){
// 		var re = $.grep(visObj.selectedEntities, function(e){
// 			return e.entity == d.entity
// 		})
// 		if(re.length > 0) return "#999999";
// 		return "#ddd";
// 	})
// }

function updateNoteDis(click = false){
	if(click){
		var obj;
		if($("#myprivate").is(":checked")) obj = {type: "onlyShowMine", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
	  	else obj = {type: "alsoShowPublic", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
	  	addLog(obj)
	}
	d3.select("#showNoteDiv").selectAll(".noteDisDiv").each(function(d){
		if($("#myprivate").is(":checked")){
			if(d.username == curUser.username)
			// if(d.public){
			// 	if($("#mypublic").is(":checked")) d3.select(this).style("display", "block")
			// 	else d3.select(this).style("display", "none")
			// }
			// else{
				 d3.select(this).style("display", "block")
			else if(curNote.discussionNote){
				d3.select(this).style("display", "block")
				d3.select(this).style("opacity", .3)

			}
			else d3.select(this).style("display", "none")
			// }
		}
		// else if($("#otherpublic").is(":checked")) d3.select(this).style("display", "block")
		else{
			d3.select(this).style("display", "block")
			d3.select(this).style("opacity", 1)
		}
	})
	if(curNote.discussionNote){
		if($("#myprivate").is(":checked")){
    		d3.select("#graphSvg").selectAll(".node").each(function(d){
				if(d.username == curUser.username)
					d3.select(this).style("opacity", 1)
				else d3.select(this).style("opacity", .3)
			})
		}
		else{
			d3.select("#graphSvg").selectAll(".node").style("opacity", 1)
		}
	}
}

function saveAnno(){
	//console.log("save note")
	var note = $("#postit").val().trim();
	var time = getFormatedTime()
	// var public = $("#publicBox").prop("checked")

	// console.log(curNote.entityInNote)
	if(note.length > 0){
		$.ajax({
           url: 'savenote',
           type: 'POST',
           contentType:'application/json',
           data: JSON.stringify({time: time, note: note, username: curUser.username, public: false, entities: curNote.entityInNote, version: "health"}),
           dataType:'json',
           success: function(res){
           	//console.log(res)
           		// writeAction(res.id, time) //time is the _id of the write action
               	drawCheck()
               	curMode.state = "normalMode"
    			curMode[curMode.state]()
    			curMode[curMode.state + "Map"]()
    			curMode[curMode.state + "Note"]()
    			$("#postit").data("_id", null)
    			curNote.entityInNote = []
    			getNoteCount()
    			var obj = {type: "saveNote", note: res.id, time: getFormatedTime(), user: curUser.username}
	  			addLog(obj)
    			if($("#showNoteDiv").css("display") != "none"){
    				if(curNote.discussionNote) viewDiscussion()
               		else curNote.showNotes()
    			}
               	//if($("#showNoteDiv").css("display") == "block") showNotes(noteFilterEntity)
           },
           error: function()
           {
           		var canvas = document.getElementById("checkArrow");
				var ctx = canvas.getContext("2d");
				//ctx.font = "30px Arial";
				ctx.fillText("Server error, please try again later.", 5, 15);
               	console.log("writing error!");
           }
       });
	}
	else{
		$("#postit").prop("disabled", false)
        $("#controllersDiv > button").prop("disabled", false)
	}
}

function updateAnno(){
	var note = $("#postit").val().trim();
	var time = getFormatedTime()
	// var public = $("#publicBox").prop("checked")
	// console.log(!public)
	//console.log("update note")
	// if(note.length > 0 && note != $('#postit').data("note") ){//|| $('#publicBox').is(":checked") != $('#postit').data("public"))){
		$.ajax({
           url: 'updatenote',
           type: 'POST',
           contentType:'application/json',
           data: JSON.stringify({oldid: $('#postit').data("_id"), time: time, note: note, username: curUser.username, public: false, entities: curNote.entityInNote, version: "health"}),  //$('#publicBox').is(":checked")
           dataType:'json',
           success: function(res){
           	//console.log(res)
           		//if(note != $('#postit').data("note"))
           			//editAction(res.id, time) //note id, do not change the action tree
           		var obj = {type: "updateNote", note: res.id, time: getFormatedTime(), user: curUser.username}
	  			addLog(obj)
               	drawCheck()
               	curMode.state = "normalMode"
    			curMode[curMode.state]()
    			curMode[curMode.state + "Map"]()
    			curMode[curMode.state + "Note"]()
    			$("#postit").data("_id", null)
    			curNote.entityInNote = []
    			getNoteCount()
    			if($("#showNoteDiv").css("display") != "none"){
               		if(curNote.discussionNote) viewDiscussion()
               		else curNote.showNotes()
               	}
               	//if($("#showNoteDiv").css("display") == "block") showNotes(noteFilterEntity)
           },
           error: function()
           {
           		var canvas = document.getElementById("checkArrow");
				var ctx = canvas.getContext("2d");
				//ctx.font = "30px Arial";
				ctx.fillText("Server error, please try again later.", 5, 15);
               	console.log("writing error!");
           }
       });
	// }
	// else{
	// 	$("#postit").prop("disabled", false)
 //        $("#controllersDiv > button").prop("disabled", false)
	// }
}

function upVote(d, element){
	$.ajax({
	   url: 'upnote/?id=' + d._id + "&username=" + curUser.username,
       type: 'POST',
       dataType:'json',
       success: function(res){
       	 return;
       },
       error: function()
       {
         console.log("up vote error!");
       }
	})
	if(d.up.indexOf(curUser.username) > -1){
	   d.up.splice(d.up.indexOf(curUser.username), 1)
	   $(element).css("color", "black")
	   upAction(d._id, false)
	}
	else {
		d.up.push(curUser.username)
		$(element).css("color", "green")
		upAction(d._id, true)
	}
	// $(element).next().text(function(){ return d.up.length})
}

function downVote(d, element){
	$.ajax({
	   url: 'downnote/?id=' + d._id + "&username=" + curUser.username,
       type: 'POST',
       dataType:'json',
       success: function(res){
       	 return;
       },
       error: function()
       {
         console.log("down vote error!");
       }
	})
	// console.log(d._id)
	if(d.down.indexOf(curUser.username) > -1) {
		$(element).css("color", "black")
		d.down.splice(d.down.indexOf(curUser.username), 1)
		downAction(d._id, false)
	}
	else {
		$(element).css("color", "green")
		d.down.push(curUser.username)
		downAction(d._id, true)
	}
	// $(element).next().text(function(){ return d.down.length})
}

function removeNote(d, ele){
	var noteid = d._id; //console.log(noteid)
	//if cited in note under editing, remove
	if(curMode.state == "addEntityMode"){
		var re = curNote.entityInNote.filter(a => a.type == "note" && a.note == d._id)
		if(re.length){
			re[0].note = null
			re[0].text = "<i>Deleted.</i>"
			updatePostit()
		}
	}
	
	$.ajax({
       url: 'removenote/?id=' + noteid,
       type: 'POST',
       dataType:'json',
       success: function(res){
       	$(ele).closest(".noteDisDiv").hide("slow", function(){
       		if(curNote.discussionNote && curNote.discussionNote.datum()._id == $(this).prop("__data__")._id){
       			curNote.removeDiscussions()
       		}
       		// console.log(curNote.discussionNote.datum()._id)
	       	if(curNote.discussionNote) viewDiscussion()
	       	else curNote.showNotes()
       		// console.log($(this).prop("__data__")._id)
			$(this).remove()
		})
		getNoteCount()
		
		// updateEntityList()
           	 //return;
       },
       error: function()
       {
         console.log("deleting error!");
       }
   })
}

function drawCheck(){
	var start = 5;
	var mid = 8;
	var end = 16;
	var width = 2;
	var leftX = start;
	var leftY = start;
	var rightX = start + 3;
	var rightY = start + 3;
	var animationSpeed = 100;

	var ctx = document.getElementById('checkArrow').getContext('2d');
	ctx.lineWidth = width;
	ctx.strokeStyle = 'rgba(0, 150, 0, 1)';

	for (i = start; i < mid; i++) {
	    var drawLeft = window.setTimeout(function () {
	        ctx.beginPath();
	        ctx.moveTo(start, start);
	        ctx.lineTo(leftX, leftY);
	        ctx.lineCap = 'round';
	        ctx.stroke();
	        leftX++;
	        leftY++;
	    }, 1 + (i * animationSpeed) / 3);
	}

	for (i = mid; i < end; i++) {
	    var drawRight = window.setTimeout(function () {
	        ctx.beginPath();
	        ctx.moveTo(leftX, leftY);
	        ctx.lineTo(rightX, rightY);
	        ctx.stroke();
	        rightX++;
	        rightY--;
	    }, 1 + (i * animationSpeed) / 3);
	}

	window.setTimeout(function(){
		$("#postitDiv").css("display", "none")
	}, 1 + ((end + 2) * animationSpeed) / 3)

}

Note.prototype.drawNoteFramework = function(div = "#showNoteDiv"){
    var d3div = d3.select(div);
    var self = this
    if(div == "#showNoteDiv"){
  //   	d3div.append("text").text("\uf021").attr("class", "refreshNote")
  //   	.style({"font-family": "FontAwesome",
		// 	    "font-size": 15,
		// 	    "text-anchor": "start",
		// 		"alignment-baseline": "hanging",
		// 		float: "right",
		// 		margin: "2px",
		// 		cursor: "pointer"
		// }).on("click", function(){
		// 	//console.log("click refresh")
		// 	d3.select(this).text("\uf04c")
		// 	showNotes(noteFilterEntity)
		// })
		var control = d3div.append("div").attr("class", "noteDisControlDiv")
        control.append("input").attrs({
            type: "checkbox",
            id: "myprivate",
        }).property("checked", false).on("click", function(){updateNoteDis(true)})
        control.append("label").attrs({
            for: "myprivate",
        })/*.style("background", "#f9b6d5")*/.text("Only show my notes")
        control.append("br")

        // d3div.append("input").attr({
        //     type: "checkbox",
        //     id: "mypublic",
        // }).property("checked", true)
        // d3div.append("label").attr({
        //     for: "mypublic",
        // }).style("background", "#f8feb3").text("My public notes")
        // d3div.append("br")

        // control.append("input").attrs({
        //     type: "checkbox",
        //     id: "otherpublic",
        // }).property("checked", true).on("click", updateNoteDis)
        // control.append("label").attrs({
        //     for: "otherpublic",
        // }).style("background", "#c1fbdf").text("Other public notes")
        // control.append("br")
    }

    var filterDiv = d3div.append("div").attr("class", "noteFilterDiv")
    filterDiv.append("label").attr("class", "insLabel")
    var filterLabel = filterDiv.append("label").attr("class", "filterGroup").styles({
		background: "#ccc",
        "padding-left": "2px",
        "padding-right": "2px",
        "padding-bottom": "3px"
	})
    filterLabel.append("text").attr("class", "filtername")
 //    filterLabel.append("text").attr("class", "externalButton awesomeButton").on("click", function(){
	// 	self.showGraph()

	// 	// var discussionWindow = window.open("javascripts/discussion.html", "discuss" + discussionWindows.length)
	// 	// discussionWindow.nodes = self.discussionNotes
	// 	// discussionWindow.links = links
	// 	// discussionWindow.username = curUser.username
	// 	// discussionWindow.curNote = curNote.discussionNote.datum()
	// 	// discussionWindows.push(discussionWindow)
	// }).style("padding-left", "3px")
    filterLabel.append("text").attr("class", "filterRemove awesomeButton").styles({
		"padding-left": "3px"
	})
    d3div.append("div").attr("class", "showNoteArea")
}
