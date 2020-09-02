window.onresize = function(event) {
  var w = 0
  
  if($("#showNoteDiv").css("display") != "none") w = $("#showNoteDiv").outerWidth(true)
  if($("#showGraphDiv").css("display") != "none") w+= $("#showGraphDiv").outerWidth(true)
  //   // $("#showNoteDiv").width("700px")
  //   $("#main").width(($("#canvas").width() - $("#list").outerWidth(true) - $("#showNoteDiv").outerWidth(true)) + "px")
  // }
  $("#main").width($("#canvas").width() - $("#list").outerWidth(true) - w)
    // d3.select("#yearDiv").style("grid-template-columns", "repeat(" + Math.floor($("#yearDiv").width()/32) + ", 32px)")
  updateMainWidth()
}; 

document.addEventListener("visibilitychange", onchange);

function onchange(evt){
  if(document.hidden){
    var obj = {type: "toHidden", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
    addLog(obj)
  }
  else{
    var obj = {type: "toVisible", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
    addLog(obj)
  }
}

var selectedEntities = [], selectedData = [], hisStruc = [], hoverBegin = null
var curYear = 2013, showNoteWidth = 500;

function checkTutorial(){
  var obj = {type: "checkTutorial", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
  addLog(obj)
  window.open(window.location.origin + "/healthtutorial", "_blank")
}

// console.log(years)
Ui = function(){
	d3.select("#legendRect").styles({
		background: "rgb(67, 148, 218)",
		height: "20px",
		width: "40px",
	})
  $("#main").width(($("#canvas").width() - $("#list").outerWidth(true)) + "px")
	drawLeftList()
  initYears(years)
  getNoteCount()
  // setInterval(getNoteCount, 20000)

  $("#postitDiv").draggable();
	d3.select("#noteSaveButton").on("click", function(){
      $("#postit").prop("disabled", true)
      $("#controllersDiv > button").prop("disabled", true)
      saveAnno()
  })
  d3.select("#noteUpdateButton").on("click", function(){
      $("#postit").prop("disabled", true)
      $("#controllersDiv > button").prop("disabled", true)
      updateAnno()
  })
  d3.select("#noteCancelButton").on("click", function(){
      $("#postitDiv").css("display", "none")
      curMode.state = "normalMode"
  	curMode[curMode.state]()
    curMode[curMode.state + "Map"]()
  	curMode[curMode.state + "Note"]()
  	$("#postit").data("_id", null)
  	curNote.entityInNote = []
  	// if($("#showNoteDiv").css("display") != "none"){
  		// if(curNote.discussionNote) viewDiscussion()
      // else curNote.showNotes()
  	// }
    var obj = {type: "cancelNote", time: getFormatedTime(), user: curUser.username}
    addLog(obj)
  })
  d3.select("#editIcon").on("click", function(){
  	if(curMode.state == "normalMode"){
      var obj = {type: "clickInputNote", time: getFormatedTime(), user: curUser.username}
      addLog(obj)
  		annotation()
  	}
  }).on("mouseenter", function(){
  	showTooltip("Write a note.", d3.event.pageX - 12, d3.event.pageY)
  }).on("mouseleave", function(){
      d3.select("#tooltip").styles({
          visibility: "hidden",
      })
  })
  d3.select("#signOutButton").on("click", function(d){
      var obj = {type: "signout", time: getFormatedTime(), user: curUser.username}
      addLog(obj)
      curUser.signoutPro()
  })
  d3.select("#showNoteIcon").on("click", function(){
  	if($("#showNoteDiv").css("display") == "none"){
      var obj = {type: "showNotes", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
  		if(curNote.discussionNote) viewDiscussion()
  		else curNote.showNotes()
      curNote.updateFilter()
  	}
  	else{
      // clearInterval(curNote.noteInterval)
      var obj = {type: "hideNotes",  mode: curMode.state, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
  		$("#showNoteDiv").css("display", "none")
      $("#showGraphDiv").css("display", "none")
      $("#moveHandle1").css("display", "none")
      $("#moveHandle2").css("display", "none")      
      $("#main").width(($("#canvas").width() - $("#list").outerWidth(true)) + "px")
      updateMainWidth()
  	}
  }).on("mouseenter", function(){
  	showTooltip("Show notes.", d3.event.pageX - 12, d3.event.pageY)
  }).on("mouseleave", function(){
      d3.select("#tooltip").styles({
          visibility: "hidden",
      })
  })

  $("#postit").on("input", function(){
		var sh = this.scrollHeight - 4, ch = $(this).height()
    if(sh <= ch || ch > 250){
      $(this).height(ch)
    }
    else {
      $(this).height(sh);
    }
	}).mouseenter(function(){
    hoverBegin = getTime()
		var ens = $(this).data("entities")
		curUi.highlightTrace(ens)	
		curNote.highlightNotes(ens.filter(a => a.type == "note").map( a => a.note))
	}).mouseleave(function(){
    if(hoverBegin && getTime() - hoverBegin > 3000){
        var obj = {type: "hoverTextarea", time: getFormatedTime(), user: curUser.username}
        addLog(obj)
    }
    hoverBegin = 0
    curUi.dehighlightTrace()
  //   d3.select("#stackDiv").selectAll(".area").styles({
  //   		"fill-opacity": .6,
		//     "stroke-opacity": 0.2,
		// })
    	// d3.selectAll(".selectedLi").select("label").style("background", "rgba(204, 204, 204, 0.5)")
  	curNote.dehighlightNotes()
	});

  	// this.inWindow = false;
	this.initStackedArea()
	// this.widthHandler()
	// this.hoverHandler()
  curMap = new Map()
	// this.drawChartWindow()
}

function initYears(){
  yearAxisIns.draw()
  yearAxisIns.updateData(years)
  yearAxisIns.updateWidth()
}

function updateMainWidth(){
  curUi.stackWidthHeight()
  curUi.drawStackedArea()
  curMap.updateWidthHeight()
  curUi.updateYearLine(curYear)
  yearAxisIns.updateWidth()
}

function getNoteCount(){
	$.ajax({
       url: 'entitynote',
       type: 'POST',
       contentType:'application/json',
       data: JSON.stringify({username: curUser.username}),
       dataType:'json',
       success: function(res){
       		curNote.userEntityNote = res.entityNoteCount
          curNote.yearNoteCount = res.yearNoteCount
       		// userEntityNote.forEach(function(d){
       		// 	jobsPercentage[d.entity].count = d.count
       		// })
       		curNote.max = res.max
       		curNote.min = res.min
       		if(res.max <= 0) d3.select("#legendDiv").style("display", "none")
       		else{
       			d3.select("#legendDiv").style("display", "")
       			d3.select("#legendLabel").text(res.max + " related note(s)")
       		}
       		updateLeftList(curNote.userEntityNote)
          yearAxisIns.updateYearNoteCount(curNote.yearNoteCount)
       },
       error: function(){
        console.log("get entity note failed")
        }
   })
}

function drawLeftList(){
  var idcs = data.map((a) => { return {id: a.id, country: a.country} })
  idcs = idcs.filter( (v,i) => data.map(a => a.country).indexOf(v.country) == i).sort((a,b) => (a.country > b.country) ? 1 : ((b.country > a.country) ? -1 : 0))
	console.log(idcs.length)
  var entityData = d3.select("#countryDiv").selectAll(".rowGroup").data(idcs, function(d){return d.id})
	entityData.exit().remove()
	var entityEnter = entityData.enter().append("div").attrs({
		class: "rowGroup",
	})
	var g = entityEnter.append("div").attrs({
		class: "countGroup"
	})
	g.append("div").attrs({
		class: "countRect",
	}).styles({
		background: "rgb(67, 148, 218)",
		height: "24px",
		width: 0,
		cursor: "pointer"
	}).on("click", function(d){
    d3.select("#countryDiv").selectAll(".countRect").style("background", "rgb(67, 148, 218)")
    d3.select("#yearDiv").selectAll(".noteCountRect").style("fill", "rgb(67, 148, 218)")
    d3.select(this).style("background", "rgb(192, 98, 95)")
		curNote.entityFilter = {id: d.id, country: d.country}
    if(curNote.discussionNote){
      curNote.removeDiscussions()
    }
    var obj = {type: "viewCountryNote", mode: curMode.state, cid: d.id, time: getFormatedTime(), user: curUser.username}
    addLog(obj)
    curNote.showNotes()
    curNote.updateFilter()
    $("#showNoteDiv > .showNoteArea").animate({
        scrollTop: 0
    }, 1000);
	}).on("mouseenter", function(d){
    showTooltip("Click to view <b>" + d.noteCount + "</b> related note(s) on the right side.", d3.event.pageX - 12, d3.event.pageY)
  }).on("mouseleave", function(){
        d3.select("#tooltip").styles({
              visibility: "hidden",
          }) 
  })

	var entityLi = entityEnter.append("li").attrs({
		class: "entityli",
		id: function(d){return "li" + d.id},
	}).on("click", function(d){
    hoverBegin = 0
		if(!$(this).children(":checkbox").prop("checked")){
      var obj = {type: "selectCountry", mode: curMode.state, cid: d.id, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
			addEntity(d)
		}
		else{
      var obj = {type: "deselectCountry", mode: curMode.state, cid: d.id, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
      removeEntity(d)
    }
	}).on("mouseenter", function(d){
		if($(this).children(":checkbox").prop("checked"))
			d3.select(this).style("background", "rgba(67, 148, 218, .8)")
		else d3.select(this).style("background", "#bcbcbc")
    mouseEnter(d.id)
    hoverBegin = getTime()
	}).on("mouseleave", function(d){
    if(hoverBegin && getTime() - hoverBegin > 3000){
      var obj = {type: "hoverCountryLabel", mode: curMode.state, cid: d.id, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
    }
    hoverBegin = 0
		if($(this).children(":checkbox").prop("checked"))
			d3.select(this).style("background", "rgba(67, 148, 218, .4)")
		else d3.select(this).style("background", "none")
    mouseLeave(d.id)
	})
	entityLi.append("input").attrs({
		type: "checkbox",
		id: function(d){return "input" + d.id},
		name: "entityCheck"
	}).style("display", "none")

	entityLi.append("label").text(function(d){return d.country })

	entityData = entityEnter.merge(entityData)
}

function updateLeftList(userEntityNote){
	d3.selectAll(".countRect").transition().duration(500).styles({
		width: function(d){
			if(curNote.max <= 0) return "0px"
			var re = $.grep(userEntityNote, function(e){
				return e.entity == d.id
			})
			if(!re.length || !re[0].count){
        d.noteCount = 0
        return "0px"
      }
      d.noteCount = re[0].count
      if(40 * Math.log(re[0].count) / Math.log(curNote.max) < 5) 
        return "5px"
			return (40 * Math.log(re[0].count) / Math.log(curNote.max)) + "px"
		}
	})
	// d3.selectAll(".showEntityNoteText").style("display", function(d){
	// 	var re = $.grep(userEntityNote, function(e){
	// 			return e.entity == d.id
	// 		})
	// 	if(!re.length || !re[0].count) return "none"
	// 	return null
 //    })
}

window.onbeforeunload = function() {
    // for(var i = 0; i < discussionWindows.length; i++)
    //   if(discussionWindows[i])
    //     discussionWindows[i].close()
    var mode = curMode == ""? "normalMode": curMode.state
    var obj = {type: "endSession", mode: mode, time: getFormatedTime(), user: curUser.username}
    addLog(obj)
    if(hisStruc.length > 0) saveLog()
}

function addEntity(d){
  if(!selectedEntities.length) $("#deselectButton").css("display", "inline-block")
  document.getElementById("input" + d.id).checked = true;
  selectedEntities.push(d.id)
  var array = data.filter( a => a.id == d.id).sort((a,b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0))
  var obj = {}
  obj.country = d.country
  obj.id = d.id
  obj.data = array
  selectedData.push(obj)
  curMap.updateMapOutline(d.id, "#4394da")
  curUi.drawStackedArea()
  curUi.updateTooltip()
  curMode[curMode.state]()
  d3.select("#li" + d.id).style("background", "rgba(67, 148, 218, .4)")
}

function deselectAll(){
  for(var i = 0; i < selectedData.length; i++){
    var d = selectedData[i]
    document.getElementById("input" + d.id).checked = false;
    $("#li" + d.id).css("background", "none")
    curMap.updateMapOutline(d.id, "#999")
  }
  selectedEntities = []
  selectedData = []
  $("#deselectButton").css("display", "none")
  curUi.drawStackedArea()
  curUi.updateTooltip()
  curMode[curMode.state]()
  var obj = {type: "deselectAll", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
  addLog(obj)
}

function removeEntity(d){
	// var re = $.grep(selectedEntities, function(e){ return e.country == d.country})
	selectedEntities.splice(selectedEntities.indexOf(d.id), 1)
  var re = $.grep(selectedData, function(e){ return e.id == d.id})
  selectedData.splice( selectedData.indexOf(re[0]), 1)
  if(!selectedEntities.length)
      $("#deselectButton").css("display", "none")

	// }
  // console.log(selectedEntities)
	
	// console.log(selectedEntities)
	document.getElementById("input" + d.id).checked = false;
	$("#li" + d.id).css("background", "none")
  curMap.updateMapOutline(d.id, "#999")
	// $("#input" + d).prop("checked", false);
	// updateSelectedList()
	curUi.drawStackedArea()
	curUi.updateTooltip()
  curMode[curMode.state]()
}
