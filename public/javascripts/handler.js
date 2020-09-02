Handler = function(){
  this.widthHandler()
  this.hoverHandler()
}

Handler.prototype.widthHandler = function(){
    // $("#moveHandle1").on("drag");
    var self = this
    $(function() {
        self.isDragging1 = false;
        self.isDragging2 = false;
        self.startX = undefined;
        self.endX = undefined;
        self.mainWidth = undefined;
        self.noteWidth = undefined;
        self.graphWidth = undefined;

        $("#moveHandle1").mousedown(function(event) {
            event.stopPropagation();
            //  console.log("MD");
            if ( !self.isDragging1 && !self.isDragging2 ) {
                self.startX = event.clientX; //#set-vis-container
                self.mainWidth = $("#main").width()
                self.noteWidth = $("#showNoteDiv").width()
                // leftWidth = $(".ui-layout-west").width();
                // rightLeft = $(".ui-layout-center").offset().left;
                self.isDragging1 = true;
                // console.log("start")
            }
        });

        $("#moveHandle2").mousedown(function(event) {
            event.stopPropagation();
            //  console.log("MD");
            if ( !self.isDragging1 && !self.isDragging2 ) {
                self.startX = event.clientX; //#set-vis-container
                self.mainWidth = $("#main").width()
                self.graphWidth = $("#showGraphDiv").width()
                // leftWidth = $(".ui-layout-west").width();
                // rightLeft = $(".ui-layout-center").offset().left;
                self.isDragging2 = true;
            }
        });

        $(window).mouseup(function() {
            if (self.isDragging1){
              self.isDragging1 = false;
              curNote.updateWidth()
            }
            if(self.isDragging2) self.isDragging2 = false;
        });
    });

};

Handler.prototype.hoverHandler = function(){
  var self = this
  // this.curYear = 0
  function mousemoveEvent(event, div, inPostit){
    if(inPostit){
      if(curUi["curYear" + div]){
        if(hoverBegin && getTime() - hoverBegin > 3000){
          var s = "note"
          if(curNote.discussionNote) s = "discussion"
          var obj = {type: "hoverSpecificYear", session: s, mode: curMode.state, year: self["curYear" + div], note: div.substring(1), time: getFormatedTime(), user: curUser.username}
          addLog(obj)
        }
        hoverBegin = 0
        curUi.hideMouselineinChart(div)
        curUi["curYear" + div] = 0
      }
      return
    }
    curUi["rect" + div] = document.getElementById(div).getElementsByClassName("overlayRect")[0].getBoundingClientRect()
    var cx = event.clientX - curUi["rect" + div].left, cy = event.clientY - curUi["rect" + div].top//, bx = d3.select(".browser").node().getBBox().x;
   
    if(cx >= 0 && cx <= curUi["rect" + div].width && cy >= 0 && cy <= curUi["rect" + div].height){
      var x0 = curUi["x" + div].invert(cx),
        ye = x0.getFullYear(), //d3.mouse(this)[0]
        mo = x0.getMonth(),
        i = curUi.bisectDate(years, ye, 1),
        index = mo > 5 ? i + 1 : i;
        // console.log(i)
      if(years[index] == curUi["curYear" + div]) return
      if(hoverBegin && getTime() - hoverBegin > 3000){
        var s = "note"
        if(curNote.discussionNote) s = "discussion"
        var obj = {type: "hoverSpecificYear", session: s, mode: curMode.state, year: curUi["curYear" + div], note: div.substring(1), time: getFormatedTime(), user: curUser.username}
        addLog(obj)
      }
      hoverBegin = getTime()
      curUi["curYear" + div] = years[index]
      // console.log(self)
      curUi.displayMouselineinChart(years[index], div)
      
      if(div == "stackDiv"){
        $("#" + div + " .mouseLine").data("year", years[index])
        $("#" + div + " .mouseLine").data("entities", JSON.parse(JSON.stringify(selectedEntities)))
        $("#" + div + " .mouseLine").data("countries", selectedData.map(a => a.country))
        $("#" + div + " .mouseLine").data("text", years[index] + curUi.selectedEntitiesText)
      }
    }
    else if(curUi["curYear" + div]){
      if(hoverBegin && getTime() - hoverBegin > 3000){
        var s = "note"
        if(curNote.discussionNote) s = "discussion"
        var obj = {type: "hoverSpecificYear", session: s, mode: curMode.state, year: curUi["curYear" + div], note: div.substring(1), time: getFormatedTime(), user: curUser.username}
        addLog(obj)
      }
      hoverBegin = 0
      curUi.hideMouselineinChart(div)
      curUi["curYear" + div] = 0
    }
  }
  $(window).mousemove(function(event) {
    if (self.isDragging1 || self.isDragging2) {
        self.endX = event.clientX;
        // event.stopPropagation();
        event.preventDefault()
        if(self.isDragging1){
          if(self.noteWidth - (self.endX - self.startX) < 500 && $("#showNoteDiv").width() > 500){
            $("#showNoteDiv").width(500)
            showNoteWidth = 500
            $("#main").width(self.noteWidth + self.mainWidth - 500)
            updateMainWidth()
          }
          else if(self.noteWidth - (self.endX - self.startX) >= 500){
            showNoteWidth = self.noteWidth - (self.endX - self.startX)
            $("#showNoteDiv").width(showNoteWidth)
            $("#main").width(self.mainWidth + (self.endX - self.startX))
            updateMainWidth()
          }
          // console.log(showNoteWidth)
          // updateNoteWidth()
        }
        if(self.isDragging2){
          if(self.graphWidth - (self.endX - self.startX) < 150 && $("#showGraphDiv").width() > 150){
            curNote.graphWidth = 150
            $("#showGraphDiv").width(150)
            $("#main").width(self.mainWidth + self.graphWidth - 150)
            updateMainWidth()
          }
          else if(self.graphWidth - (self.endX - self.startX) >= 150){
            curNote.graphWidth = self.graphWidth - (self.endX - self.startX)
            $("#showGraphDiv").width(curNote.graphWidth)
            $("#main").width(self.mainWidth + (self.endX - self.startX))
            updateMainWidth()
          }
          console.log(curNote.graphWidth)
          // updateGraphWidth()
        }

        // $(".ui-layout-west").width( leftWidth + (endX - startX) );
        // $("#vis").width( leftWidth + (endX - startX) );
//                $("#vis svg").width( leftWidth + (endX - startX) );
//                $("#right").offset( { left: rightLeft + (endX - startX) } );
//                $("#right").width( rightLeft - (endX - startX) );

        // $(EventManager).trigger( "vis-svg-resize", { newWidth:+(leftWidth + (endX - startX)) });
        return
    }
    //todo: if inside postit, return
    if($("#postitDiv").hasClass("ui-draggable-dragging")) return
    var postitRect, inPostit = false
    if($("#postitDiv").css("display") != "none"){
      postitRect = document.getElementById("postitDiv").getBoundingClientRect()
      
      var tx = event.clientX - postitRect.left, ty = event.clientY - postitRect.top//, bx = d3.select(".browser").node().getBBox().x;
      if(tx >= 0 && tx <= postitRect.width && ty >= 0 && ty <= postitRect.height){
        inPostit = true
      }
    }
    
    d3.selectAll(".entityNoteDispDiv").each(function(d){
      var id = $(this).attr('id')
      if($(this).find("#c" + id.substring(2)).find("svg").length){
        mousemoveEvent(event, "c" + id.substring(2), inPostit)
      }
    })
//     // if(self.inWindow){
//     //   mousemoveEvent(event, "grid")
//     //   return
//     // }
    if(!selectedEntities.length) return
    mousemoveEvent(event, "stackDiv", inPostit)
  })
}