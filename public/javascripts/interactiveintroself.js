 function startIntro(){
    var intro = introJs();
    var introSteps = [
        {
            element: "#main",
            intro: 'The visualization shows the CO<sub>2</sub> emission data of various countries from 1960 to 2013. The map gives a global view of each country\'s CO<sub>2</sub> emission <b>of a selected year</b>.',
            position: "right",
        },
        {
            element: "#yearDiv",
            // elements: "#yearDiv, #mapDiv",
            intro: 'You can select a year by clicking on the label of a certain year.',
            position: "bottom-right-aligned"
            // condition: function(){            
            //     if(visObj.selectedEntities.length == 1 && visObj.selectedEntities[0].entity == "Bladder")
            //         return true;
            //     return false;
            // }
        },
        {
            element: "#list",
            intro: 'Please <b>select 2 random countries</b> from the list.',
        },
        {
            element: "#stackDiv",
            intro: 'The timeline displays the CO<sub>2</sub> emission data of the selected countries.'
        },
        {
            element: '#showNoteIcon',
            intro: 'Please click on the <i class="fa fa-sticky-note-o awesomeButton" aria-hidden="true"></i> icon, and then click Next.'
        },
        {
            element: "#showNoteDiv",
            intro: 'Here, you can see <b>other people\'s as well as your own notes</b>. These example notes are for demonstration purposes. Please click on the <i class="fa fa-comments awesomeButton" aria-hidden="true"></i> icon of the second note, and then click Next.'
        },
        {
            element: "#showGraphDiv",
            intro: 'The graph shows how your selected discussion flows where each node represents a note. <i class="fa fa-circle awesomeButton" aria-hidden="true" style="color: #fc9f9d;"></i> denotes the note you just selected.'
        },
        {
            element: ".noteFilterDiv",
            intro: 'Please close the discussion view by clicking on the <i class="fa fa-times awesomeButton" aria-hidden="true"></i> icon, and then click Next.'
        },
        {
            element: "#editIcon",
            intro: 'Please click on the <i class="fa fa-pencil-square-o" aria-hidden="true"></i> icon, and then click Next.'
        },
        {
            element: "#postitDiv",
            intro: 'Here, you can input your discovery about the data. You can also add <b>5 types of references</b> to <b>help with your narrative</b>.'
        },
        {
            element: '#main',
            intro: '1. You can click on the <span style="color: #42bc82;"><i class="fa fa-plus-circle awesomeButton" aria-hidden="true"></i></span> icon to refer to the corresponding chart in your note.'
        },
        {
            element: '#mapDiv',
            intro: '2. You can click on a country on the map to refer to <b>this country\'s CO<sub>2</sub> emission value of the selected year</b> in your note.'
        },
        // {
        //     element: '#stackDiv',
        //     intro: '3. Please click on the <span style="color: #42bc82;"><i class="fa fa-plus-circle" aria-hidden="true"></i></span> icon to refer to the chart in your note.'
        // },
        // {
        //     element: '#postitDiv',
        //     intro: 'The first row describes the countries you just added. You can remove the country to which you do not want to refer by clicking on the <i class="fa fa-times awesomeButton" aria-hidden="true"></i> icon of the country.'
        // },
        {
            element: '#stackDiv',
            intro: '3. You can click on <span style="color: #ffab00;">an orange line</span> to refer to the timeline of the country in your note.'
        },
        {
            element: '#stackDiv',
            intro: '4. Please mouse-over the chart and click on <b>the black vertical line</b> to refer to <b>a certain year of the chart</b> in your note.'
        },
        {
            element: '#postitDiv',
            intro: 'The fist row describes <b>the black vertial line</b> you just added. You can remove the country to which you do not want to refer by clicking on the <i class="fa fa-times awesomeButton" aria-hidden="true"></i> icon of the country.'
        },
        {
            element: '#showNoteDiv',
            intro: '5. You can also refer to other notes by clicking on the <i class="fa fa-quote-right awesomeButton" aria-hidden="true"></i> icon of the target note to create a discussion.'
        },
        {
            element: '#postitDiv',
            intro: 'After you input some texts and publish the note, a visualization generated from your referred view component(s), along with your referred note(s), will be attached to your note. Please click Done.'
        }
    ]
    // console.log(introSteps.length) //17
    // intro.setOptions({
    //     steps: introSteps
    // });
    intro.addSteps(introSteps)

    // intro.onbeforechange(function() {
    // //$(".introjs-nextbutton").onclick = function(){
    //     console.log(intro._currentStep)
    //     if(intro._currentStep == 0) return;
    //     var stepObj = intro._introItems[intro._currentStep - 1];
    //     if(typeof(stepObj.condition) == "function"){
    //         if(!stepObj.condition()){
    //             intro._currentStep--;
    //             //this.goToStepNumber(this._currentStep);
    //             //intro.previousStep();//
    //             return;
    //         }
    //     }
    // //}
        
    // });

    intro.onafterchange(function() {
        // console.log("changed")        
        // console.log(intro._currentStep)
        if(this._currentStep == introSteps.length - 1){
            $('.introjs-skipbutton').show();
        }
        //this.goToStepNumber(intro._currentStep)
    })
    intro.setOptions({
      exitOnOverlayClick: false,
      'doneLabel': 'Done'
    }).start().oncomplete(function() {
        window.location = "https://forms.gle/1qrWRcNosyNudGJf6";
          //window.location.href = '/tutorialhistory';
    });
    $('.introjs-skipbutton').hide();
    $('.introjs-bullets').hide();
    $(".introjs-helperNumberLayer").hide()
    $('.introjs-progress').css("display", "block")
}

// function introSecondStart(){
//     var intro = introJs();
//     var introSteps = [
//             {
//                 element: '#grid',
//                 intro: 'This is an example page of the provenance view of a note. The context-aware layout depicts interaction steps hierachically from left to right. The row span of a node contains the rows of all its related lower-level nodes. <br/> Context-aware: The content of the node is sometimes connected to the content of the node on its left side. E.g., for the current provenance view, pivot actions of the nodes are conducted on the view of the left node. Viewing order: left to right and up to down.'
//             },
//             {
//                 element: '#selectSpan',
//                 intro: 'Please switch to "timeline layout".'
//             },
//             {
//                 element: '#grid',
//                 intro: '"Timeline layout" arranges the interaction steps from left to right in a time series. '
//             },
//             // {
//             //     element: '#instruA',
//             //     intro: 'More instructions are accessible here.'
//             // }
//         ]

//     intro.setOptions({
//         steps: introSteps
//     })
//     intro.onafterchange(function() {
//         // console.log("changed")        
//         // console.log(intro._currentStep)
//         if(this._currentStep == introSteps.length - 1){
//             $('.introjs-skipbutton').show();
//         }
//         //this.goToStepNumber(intro._currentStep)
//     })

//     intro.setOptions({
//       exitOnOverlayClick: false,
//       'doneLabel': 'Done'
//     }).start().oncomplete(function(){
//         window.location = "https://goo.gl/forms/hB9mSaQdUpnkV1kC3";
//     })

//     $('.introjs-skipbutton').hide();
//     $('.introjs-bullets').hide();
//     $('.introjs-progress').css("display", "block")
// }

// $('#info').click(function () {
//         startIntro();
// })