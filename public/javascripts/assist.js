//wrap d3 text; for "span", getComputedTextLength() not defined.
function wrap(text, width) {
  text.each(function() {
    var textNode = d3.select(this);
    var words = textNode.text().trim().split(" ").reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // ems
        x = textNode.attr("x"),
        y = textNode.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        tspan = textNode.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
    while (word = words.pop()) {
      // word = word.trim()
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
          lineNumber++
          line.pop();
          // if(lineNumber > 2){
          //   tspan.text(line.join(" ") + "..");
          //   break
          // }
          // line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = textNode.append("tspan").attr("x", x).attr("y", y)
            .attr("dy", (lineHeight * lineNumber + dy) + "em")
            .text(word);
        }
    }
    //if(countLine > 0) text.selectAll("tspan").attr("transform", "translate(0, -8)" )
  });
}

function isScrolledIntoView(elem, frame)
{
    var docViewTop = 0//frame.scrollTop();
    // console.log(docViewTop)
    var docViewBottom = docViewTop + frame.height();

    var elemTop = elem.offset().top - 60;
    // console.log(elemTop)
    var elemBottom = elemTop + elem.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}


function addLog(obj){
  hisStruc.push(obj)
  if(hisStruc.length > 10 || obj.type == "gotoQuestionnaire")
    saveLog()
}

function saveLog(){
    var temp = hisStruc;
    hisStruc = [];
    $.ajax({
        url: 'savelog',
       type: 'POST',
       contentType:'application/json',
       data: JSON.stringify(temp),
       dataType:'json',
       success: function(res){
        //console.log(res)
          console.log("writing log success!")
       },
       error: function()
       {
          console.log("writing log error!");
          hisStruc = hisStruc.concat(temp)
       }
    })
}

var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
var ctrlKey = isMac ? "metaKey" : "ctrlKey";
window.onkeydown = function(e){
   if((e.keyCode == 102 || e.keyCode == 70) && e[ctrlKey]){
      var obj = {type: "find", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
      addLog(obj)
   }
}

function forcePercent(){
  var yearTotal = new Array(years.length).fill(0);
  d3.keys(jobs).forEach(function(d){
    for(i = 0; i < years.length; i++){
      yearTotal[i] += jobs[d]['men'][i]
      yearTotal[i] += jobs[d]['women'][i]
    }
  })
  d3.keys(jobs).forEach(function(d){
    jobsPercentage[d] = {}
    jobsPercentage[d]['men'] = []
    jobsPercentage[d]['women'] = []
    for(i = 0; i < years.length; i++){
      jobsPercentage[d]['men'].push(jobs[d]['men'][i] / yearTotal[i])
      jobsPercentage[d]['women'].push(jobs[d]['women'][i] / yearTotal[i])
    }
  })
  download(JSON.stringify(jobsPercentage), 'json.txt', 'text/javascript');

}

function omitText(elementClass, showChar){
  // var showChar = 70;
  var ellipsestext = "..";
  // var moretext = "more";
  // var lesstext = "less";
  $(elementClass).each(function() {
    if(d3.select(this).datum().type == "year" || d3.select(this).datum().type == "chart") return
    var content = $(this).html();

    if(content.length > showChar) {

      var first = content.substr(0, showChar);
      // var second = content.substr(showChar-1, 2*showChar)
      // var h = content.substr(showChar-1, content.length - showChar);

      var html = first + ellipsestext
      $(this).html(html);
    }
  })
}

function readCsv(){
  d3.csv("javascripts/data.csv").then(function(data){
    console.log(data[0])
    var array = data.filter(a => a.Subject == "CO? emissions from fuel combustion").map( a => +a.Value)//{ return {id: a.LOCATION, country: a.Country, year: +a.Year, value: +a.Value} })
    download(JSON.stringify(array), "data.json", "json")
  });

  //max, min value
  // var min = 10000, max = -5, cmin = "", cmax = ""
  // data.forEach(function(d){
  //   if(d.id == "WLD" || d.id == "OECD") return
  //   if(d.value > max){
  //     max = d.value
  //     cmax = d.country
  //   }
  //   if(d.value < min){
  //     min = d.value
  //     cmin = d.country
  //   }
  // })
  // console.log(min + " " + cmin)
  // console.log(max + " " + cmax)
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function getTime(){
  return new Date().getTime();
}

function toDisplayTime(time){
  var options = { year: 'numeric', month: 'short', day: 'numeric' };
  var now  = new Date(time);

  // console.log(now.toLocaleDateString("en-US", options) + ' ' + now.toLocaleTimeString()); // 9/17/2016
  return now.toLocaleDateString("en-US", options) + ' ' + now.toLocaleTimeString()
}

function getFormatedTime(){
  var date = new Date().toLocaleString("en-US", {timeZone: "GMT"});
  date = new Date(date);
  return date.getFullYear() + "-" + ((date.getMonth() + 1)<10?'0':'') + (date.getMonth() + 1) + "-" + (date.getDate()<10?'0':'') + date.getDate()  + "T" + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds() + '.' + date.getMilliseconds() + 'Z'
}