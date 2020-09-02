Ui.prototype.stackWidthHeight = function(div = "stackDiv"){
  var self = this
  if(div == "stackDiv"){
    $("#stackDiv").height( (($("#main").height() - $("#yearDiv").height()) / 3) + "px" )
    $("#stackDiv").width(($("#main").width()) + "px")
  }

  var width = $("#" + div).width() - this.margin.left - this.margin.right;
  // this["height" + div] = $("#" + div).width()*3/4 - this.margin.top - this.margin.bottom;
  // if(this["height" + div] > ($("#" + div).height() - 25 - this.margin.top - this.margin.bottom)){
  this["height" + div] = $("#" + div).height() - this.margin.top - this.margin.bottom;
  if(div == "stackDiv"){
    $("#stackDiv > .labelDiv").css("height", "24px")
    this["height" + div] -= 26
  }
    // width = $("#" + div).height() * 4/3 - this.margin.left - this.margin.right;
  // }
  d3.select("#" + div).select("svg").attrs({
    width: width + self.margin.left + self.margin.right,
    height: self["height" + div] + self.margin.top + self.margin.bottom
  })
  this.parseDate = d3.timeParse('%Y');
  // var years = data.map(a => a.year)
  // years = years.filter( (v,i) => years.indexOf(v) == i).sort()
  this["x" + div] = d3.scaleTime().range([0, width]).domain(d3.extent(years, function(d){return self.parseDate(d)}))//.nice();
  this["xAxis" + div] = d3.axisBottom(self["x" + div])//.tickValues(years.map(d => self.parseDate(d)))
  
  d3.select("#" + div).select(".xaxis").attr('transform', 'translate(0,' + this["height" + div] + ')').call(self["xAxis" + div])

  this.bisectDate = d3.bisector(function(d){
      return d;
  }).left;

  d3.select("#" + div).select(".overlayRect").attrs({
    width: width,
    height: self["height" + div]
  })

  var line = d3.line()
      .x(function(d) { return self["x" + div](self.parseDate(d.year)); })
      .y(function(d) { return self["y" + div](d.value); })

  var browser = d3.select("#" + div).selectAll('.browser')
  browser.select('path').datum(function(d){return d.data}).transition()
        .attr("d", line); 
  browser.selectAll(".dot").transition()
    .attr("cx", function(d) { return self["x" + div](self.parseDate(d.year)) })
  // this["rect" + div] = document.getElementById(div).getElementsByClassName("overlayRect")[0].getBoundingClientRect()
  // console.log(div)
}

Ui.prototype.updateYearLine = function(y, div = "stackDiv"){
  var self = this
  var localX = self["x" + div](self.parseDate(y))
  d3.select("#" + div).select(".yearLine").attr("d", function() {
      var d = "M" + localX + "," + self["height" + div];
      d += " " + localX + "," + 0;
      return d;
  })
}

Ui.prototype.initStackedArea = function(div = "stackDiv"){
  var self = this
  this.margin = {top: 10, right: 20, bottom: 30, left: 40};
  // this.color = ["#af9ccb", "#f9b298"]
  if(div == "stackDiv"){
    var labelGroup = d3.select('#' + div).append("div").attr("class", "labelDiv")
    labelGroup.append("label")
      .attr("class", "yLabel")
      .style("margin-right", "10px")
      .text("Million tonnes")
    
    labelGroup.append("label").attrs({
        class: "addEntityText",
        id: "addChartButton"
    }).text("\uf055").on("mouseenter", function(d){
      showTooltip("Click to add <b>" + curUi.selectedEntitiesText.substring(2) + "</b> to your note.", d3.event.pageX, d3.event.pageY)
      d3.select("#stackDiv").selectAll(".browser").select(".line").styles({
        stroke: "#c0625f",
      })
      d3.select("#stackDiv").selectAll(".browser").selectAll(".dot").styles({
        fill: "#c0625f",
      })
    }).on("mouseleave", function(d){
      d3.select("#tooltip").style("visibility", "hidden")
      d3.select("#stackDiv").selectAll(".browser").select(".line").styles({
        stroke: "#ffab00",
      })
      d3.select("#stackDiv").selectAll(".browser").selectAll(".dot").styles({
        fill: "#ffab00",
      })
    }).on("click", function(d){
      addEntityToNote({entities: JSON.parse(JSON.stringify(selectedEntities)), countries: selectedData.map(a => a.country), text: curUi.selectedEntitiesText.substring(2), type: "chart"})
    })
  }

  var svg = d3.select('#' + div).append('svg')
      .attr("class", "stackSvg")
      // .attr('width', self.width + self.margin.left + self.margin.right)
      // .attr('height', self.height + self.margin.top + self.margin.bottom)
  svg.append("rect").attrs({
    class: "overlayRect",
    transform: 'translate(' + self.margin.left + ',' + self.margin.top + ')',
  }).styles({
    fill: "none",
    "pointer-events": "all"
    // "fill-opacity": 0.2
  })

  d3.select("#" + div).select("svg").append("g").attrs({
    class: "highlightGroup",
    transform: 'translate(' + self.margin.left + ',' + self.margin.top + ')',
  })

  var lineGroup = svg.append("g").attrs({
    class: "hoverLines",
    transform: 'translate(' + self.margin.left + ',' + self.margin.top + ')',
  })
  lineGroup.append("path").attr("class", "yearLine")
    .style("stroke", "#c0625f")
    .style("stroke-width", "8px")
  lineGroup.append("path").attr("class", "mouseLine")
    .style("stroke", "black")
    .style("stroke-width", "8px")
    .style("opacity", "0") 

  svg.append('g').attrs({
    'transform': 'translate(' + self.margin.left + ',' + self.margin.top + ')',
    class: "stackedGroup"
  });
  svg.append("g").attrs({
    class: "hoverGroup",
    transform: 'translate(' + self.margin.left + ',' + self.margin.top + ')',
  })

  var group = d3.select('#' + div).select(".stackedGroup")
  group.append('g').attr('class', 'xaxis')

  group.append('g').attr('class', 'yaxis')

  self.stackWidthHeight(div)
  
}

Ui.prototype.drawStackedArea = function(entities = selectedEntities, entityData = selectedData, div = "stackDiv"){
  var self = this
  if(div == "stackDiv"){
    self.selectedEntitiesText = ""
    var country = ""
    if(selectedEntities.length == 1){
      for(var i = 0; i < entityData.length; i++){
        if(entityData[i].id == selectedEntities[0]){
          country = entityData[i].country
          break;
        }
      }
      self.selectedEntitiesText = ", " + country
    }
    else selectedEntities.forEach(function(d, j){
      for(var i = 0; i < entityData.length; i++){
        if(entityData[i].id == d){
          country = entityData[i].country
          break;
        }
      }
      if(j == selectedEntities.length - 1) self.selectedEntitiesText += ", and " + country
      else self.selectedEntitiesText += ", " + country
    })
  }
  self["data" + div] = entityData
  self["curYear" + div] = 0
  // var formatSi = d3.format(".3s");

  // var formatNumber = d3.format(".1f"),
  //     formatBillion = function(x) { return formatNumber(x / 1e9); };
  // var x = 
  //.tickFormat(d3.timeFormat("%Y"))
  // console.log(x(parseDate(1850)))

  self["y" + div] = d3.scaleLinear().range([self["height" + div], 0]);

  // var color = d3.scaleOrdinal(d3.schemeCategory20);
  // console.log(years)
  var yAxis = d3.axisLeft(self["y" + div])
  var group = d3.select("#" + div).select(".stackedGroup")
  var maxDateVal = d3.max(entityData, function(d){
    return d3.max(d.data, function(e){
      return e.value
    })
  });
  // console.log(maxDateVal)
  self["y" + div].domain([0, maxDateVal])
  // group.select('.x').call(xAxis)
  group.select('.yaxis').call(yAxis)
  var line = d3.line()
      .x(function(d) { return self["x" + div](self.parseDate(d.year)); })
      .y(function(d) { return self["y" + div](d.value); })
      // .y1(function(d) { return self["y" + div](d[1]); });
  var browser = group.selectAll('.browser').data(entityData, function(d){return d.id})
  browser.exit().remove()
  browser.select('path').datum(function(d){return d.data}).transition()
        .attr("d", line);
  browser.selectAll(".dot")//.transition()
    .attr("cx", function(d) { return self["x" + div](self.parseDate(d.year)) })
    .attr("cy", function(d) { return self["y" + div](d.value) })

  var browserEnter = browser.enter().append('g').attr('class', function(d){
      return 'browser ' + d.id; 
  })

  browserEnter.append('path').datum(function(d){return d.data}).attr('class', function(d){
    return 'line'
  }).styles({
    fill: "none",
    stroke: "#ffab00",
    "stroke-width": "3px",
    // "stroke-opacity": 1,
    // "stroke-alignment": "inner"
  }).attr("d", line)

  var dotData = browserEnter.selectAll(".dot").data(function(d){ return d.data })
  dotData.exit().remove()
  var dotEnter = dotData.enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d) { return self["x" + div](self.parseDate(d.year)) })
    .attr("cy", function(d) { return self["y" + div](d.value) })
    .attr("r", 5)
    .styles({
      fill: "#ffab00",
      stroke: "white",
      "stroke-width": "1px"
    })
  
  browserEnter = browserEnter.merge(browser)
  //browserEnter.select("path").datum(function(d){return d.data}).attr("d", line)

}

Ui.prototype.updateTooltip = function(number = selectedEntities.length, div = "stackDiv"){
  var tipData = d3.select("#" + div).select(".hoverGroup").selectAll(".tooltipGroup").data(Array(number).fill().map((x,i)=>i), function(d){return d})
  tipData.exit().remove()
  var tipEnter = tipData.enter().append("g").attrs({
    class: "tooltipGroup",
  }).styles({
    display: "none"
  })
  // tipEnter.append("circle").attr("r", 3).styles({
  //   stroke: "#a81010",
  //   "stroke-width": "1px",
  //   fill: "none"
  // });
  tipEnter.append("text").style("alignment-baseline", "middle");
}

Ui.prototype.hideMouselineinChart = function(div = "stackDiv"){
  d3.select("#" + div).select(".mouseLine").style("opacity", 0)
  d3.select("#" + div).selectAll(".tooltipGroup").style("display", "none")
}

Ui.prototype.displayMouselineinChart = function(year, div = "stackDiv"){
  var self = this
  d3.select("#" + div).select(".mouseLine").style("opacity", .6)
  d3.select("#" + div).selectAll(".tooltipGroup").style("display", null)
  var localX = self["x" + div](self.parseDate(year)),
     array = self["data" + div].map((d) => {
      var re = $.grep(d.data, function(e){ return e.year == year})
      if(re.length)
        return {country: d.country, value: re[0].value}
      return {country: d.country, value: null}
    });

  d3.select("#" + div).select(".mouseLine").attr("d", function() {
      var d = "M" + localX + "," + self["height" + div];
      d += " " + localX + "," + 0;
      return d;
  })

  d3.select("#" + div).selectAll(".tooltipGroup").style("display", function(d, i){
    if(array[i].value) return null
    return "none";
  })

  d3.select("#" + div).selectAll(".tooltipGroup").select("circle").attrs({
    cx: localX,
    cy: function(d, i){return self["y" + div](array[i].value)}
  })
  d3.select("#" + div).selectAll(".tooltipGroup").select("text").attrs({
    x: localX + 9,
    y: function(d, i){return self["y" + div](array[i].value)}
  }).text(function(d, i){
    if(array[i].value) return array[i].country + " " + array[i].value
    return ""
  }).style("text-anchor", function(){
    if( (parseFloat(d3.select(this).attr("x")) + d3.select(this).node().getComputedTextLength() + self.margin.left) > $("#" + div + " > .stackSvg").width()){
      d3.select(this).attr("x", localX - 9)
      return "end"
    }
    d3.select(this).attr("x", localX + 9)
    return "start"
  })
}




