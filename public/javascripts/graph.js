Graph = function(){
    var group = d3.select("#graphSvg").append("g").attr("id", "graphGroup")
    this.pathGroup = group.append("g")
    this.circleGroup = group.append("g")

    group.append('defs').append('marker')
    .attrs({'id':'arrowhead',
        'viewBox':'0 -2 6 6',
        'refX':5,
        // 'refY':0,
        'orient':'auto',
        'markerWidth': 6,
        'markerHeight': 6,
        'xoverflow':'visible'})
    .append('path')
    .attr('d', 'M 0,-2 L 6,0 L 0,2')
    .attr('fill', 'black')
    .style('stroke','none');

    
    this.wasMoved = false
    this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {return d._id;}).distance(20).strength(.8))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("x", d3.forceX().x(function(d) {
          return $("#showGraphDiv").width() / 2;
        }))

    this.nodes = []
    this.diameter = 16
    
        // .force("center", d3.forceCenter($(window).width() / 2, $(window).height() / 2));
}

Graph.prototype.drawGraph = function(nodes, links) {
  this.width = $("#showGraphDiv").width()
  this.height = $("#showGraphDiv").height()
  this.count = 0
  var eIds = this.nodes.map(a => a._id)
  var newIds = nodes.map(a => a._id) 
  var nodesExist = this.nodes.filter(a => newIds.indexOf(a._id) > -1)
  var nodesNew = $.grep(nodes, function(e){
    return eIds.indexOf(e._id) < 0
  })
    this.nodes = nodesExist.concat(nodesNew);
    this.links = links;
    var self = this
    var svg = d3.select("#graphGroup")
    
    var timeArray = this.nodes.map(a => a.time).sort()
    var yScale = d3.scaleLinear().domain([0, timeArray.length - 1]).range([20, $("#showGraphDiv").height() - 20]);
    
    this.simulation.nodes(this.nodes)
    this.simulation.force("link").links(this.links);
    this.simulation.force("y", d3.forceY().y(function(d) {
          return yScale(timeArray.indexOf(d.time));
        }))
    this.simulation.alpha(0.3).restart();

    var edgepaths = this.pathGroup.selectAll(".edgepath").data(this.links)
    edgepaths.exit().remove()
    var egdepathEnter = edgepaths.enter().append('path').attrs({
            'class': 'edgepath',
            'marker-mid': 'url(#arrowhead)'
        })

    var nodeData = this.circleGroup.selectAll(".node").data(this.nodes)
    nodeData.exit().remove()
    var nodeEnter = nodeData.enter().append("circle").attrs({//.append("foreignObject").attr("class", "node").styles({
      //width: "600px",
      class: "node",
      r: self.diameter / 2 + "px",
      fill: "#aaa"//"#c1fbdf"
    }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
    
    nodeEnter.on("mouseenter", function(d){
      showTooltip("Click to scroll to this note.", d3.event.pageX - 12, d3.event.pageY)
      hoverBegin = getTime()
      var relatedNotes = d.citeBy.map(a => a._id).concat(d.entities.filter(a => a.type == "note").map( a => a.note))

      // console.log(d)
      // curUi.highlightTrace(d.entities.filter(a => a.type != "note"))
      // console.log(relatedNotes)
      curNote.highlightNotes(relatedNotes, d._id)
    }).on("mouseleave", function(d){
      d3.select("#tooltip").styles({
          visibility: "hidden",
      })
      if(hoverBegin && getTime() - hoverBegin > 3000){
        var obj = {type: "hoverNode", mode: curMode.state, note: d._id, time: getFormatedTime(), user: curUser.username}
        addLog(obj)
      }
      hoverBegin = 0
      curNote.dehighlightNotes()
    }).on("click", function(d){
      hoverBegin = 0
      if(self.wasMoved) return
      var obj = {type: "scrollToView", mode: curMode.state, note: d._id, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
      var ele = $(".noteDisDiv").filter(function(){return $(this).prop("__data__")['_id'] == d._id})
      
      if(!isScrolledIntoView(ele, $("#showNoteDiv > .showNoteArea"))){
       // console.log($(ele).offset().top)
       // console.log($("#showNoteDiv > .showNoteArea").scrollTop())
        $("#showNoteDiv > .showNoteArea").animate({
            scrollTop: $("#showNoteDiv > .showNoteArea").scrollTop() + $(ele).offset().top - 60
        }, 1000);
      }
    })

    // d3.select("#graphGroup").style("visibility", "hidden")

    // this.simulation
    // highlightDiscussionNote()
    this.simulation.on("tick", ticked);
    
    // dragended(null)
    // this.simulation.force("link").links(this.links);
}

function ticked() {

    d3.selectAll(".node").attr("transform", function (d) {
      d.x = Math.max(curNote.graph.diameter, Math.min(curNote.graph.width - curNote.graph.diameter, d.x))
      d.y = Math.max(curNote.graph.diameter, Math.min(curNote.graph.height - curNote.graph.diameter, d.y))
      return "translate(" + (d.x) + ", " + (d.y) + ")";});
    d3.selectAll(".edgepath").attr('d', function (d) {
        // console.log(d.source.x)
        return 'M ' + d.source.x + ',' + d.source.y + ' L ' + ((d.source.x + d.target.x) / 2) + ',' + ((d.source.y + d.target.y) / 2) + ' L ' + d.target.x + ',' + d.target.y;
    });
    curNote.graph.count++;
    if(curNote.graph.simulation.alpha() < 0.01 || curNote.graph.count > 500){
      // console.log(count + " " + curNote.graph.simulation.alpha())
      // curNote.graph.simulation.stop()
      d3.selectAll(".node").attr("transform", function (d) { d.fx = d.x; d.fy = d.y; return "translate(" + (d.x /*- $(this).width() / 2*/) + ", " + (d.y /*- $(this).height() / 2*/) + ")";});
    }
}

function dragstarted(d) {
  hoverBegin = 0
  curNote.graph.wasMoved = false;
    if (!d3.event.active) curNote.graph.simulation.alpha(0.3).restart()
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    curNote.graph.wasMoved = true;
}

function dragended(d) {
  if(!curNote.graph.wasMoved) return
    var obj = {type: "dragNode", mode: curMode.state, note: d._id, time: getFormatedTime(), user: curUser.username}
    addLog(obj)

    // var matrix =  d3.select("#canvasGroup").node().getBBox();
    // // console.log(matrix)
    // d3.select("#canvasSvg").attrs({
    //     transform: "translate(" + (-matrix.x + 10) + "," + (-matrix.y + 10) + ")"
    //     // x: matrix.x,
    //     // y: matrix.y
    // })
    // var w = $("#canvasGroup").width()
    // if(w > $(window).width() - 20) $("#canvasSvg").width(w + 20)
    // else $("#canvasSvg").width("100vw")
    // var h = $("#canvasGroup").height()
    // if(h > $(window).height() - 20)  $("#canvasSvg").height(h + 20)
    // else $("#canvasSvg").height("100vh")
   // if (!d3.event.active) simulation.alphaTarget(0);
   // d.fx = undefined;
   // d.fy = undefined;
}