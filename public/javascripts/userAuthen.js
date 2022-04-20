UserAuthen = function(){
  this.emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  this.diaObj = {}
  this.userVali = false
  this.emailVali = false
  this.passVali = false;
  this.username = ""
  self = this
  $("#usernameButton").on("click", function(){
    if(self.username == "")
      self.signinDia()
    else self.signoutPro()
  })
}

UserAuthen.prototype.signinDia = function(mess = ""){
  // $("#dialog-form").prop("title", "Sign in")
  var self = this
  var ele = d3.select("#dialog-form fieldset")
  var div;
  $("fieldset").empty();
  ele.append("label").attrs({
    "for": "username"
  }).text("Username")
  ele.append("input").attrs({
    "type": "text",
    "id": "username",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusin", function(){ d3.select("#message").text(""); })
  ele.append("label").attrs({
    "for": "password"
  }).text("Password")
  ele.append("input").attrs({
    "type": "password",
    "id": "password",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusin", function(){ d3.select("#message").text(""); })
  ele.append("label").text("Forgot username?").append("a").text(" Get my username.").attr("class", "usernameLink").append("br")
  ele.append("label").text("Forgot password?").append("a").text(" Reset my password.").attr("class", "passwordLink").append("br")
  ele.append("label").text("No account?").append("a").text(" Sign up.").attr("class", "signupLink").append("br")
  ele.append("label").attr("id", "message")

  $(".usernameLink").on("click", function(){
    self.getUsernameDia()
  })
  $(".passwordLink").on("click", function(){
    self.forgotPasswordDia()
  })
  $(".signupLink").on("click", function(){
    self.signupDia()
  })

  this.diaObj = {
    title: "Sign in",
    autoOpen: false,
    height: 350,
    width: 350,
    modal: true,
    dialogClass: "ui-dialog",
    buttons: [{
        text: "Sign in",
        id: "signinButton",
       click: function(){
        self.signinPro()
      }},
      {
        text: "Cancel",
        click: function() {
        self.authenDia()
        //$("#dialog-form").dialog( "close" );
      }}
    ],
    close: function() {
      //form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    }
  }
  $("#dialog-form").off("keypress")
  $("#dialog-form").dialog(self.diaObj)  
  $("#dialog-form").dialog("open")              
  // $(".ui-dialog-titlebar-close").hide()
  $("#username").focus();
  d3.select("#message").text(mess).styles({color: "green"})
  $("#dialog-form").on("keypress", function(e) {
    if (e.keyCode == $.ui.keyCode.ENTER) {
      // console.log("signin")
      $("#signinButton").click()
    }
  });

}

UserAuthen.prototype.signupDia = function(){
  this.userVali = this.passVali = this.emailVali= false;

  // $("#dialog-form").prop("title", "Sign up")
  var self = this
  var fieldset = d3.select("#dialog-form fieldset")
  $("fieldset").empty();
  // fieldset.append("label").text("By signing up, you agree with ").append("a").text("the consent form of participation.\n\n").attrs({
  //   "href": "https://drive.google.com/file/d/1WsGSiAkgje90wWuD9bejg0mGDkTJhsxg/view?usp=sharing",
  //   "target": "_blank"
  // })
  var div = fieldset.append("div").attr("class", "infoLabel")
  div.append("label").attrs({
    "for": "username",
  }).text("Username")
  div.append("label").attr("id", "nameErrorLabel")
  fieldset.append("input").attrs({
    type: "text",
    id: "username",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusout", function(){
    self.checkUser()
  }).on("focusin", function(d){
    d3.select("#nameErrorLabel").text("");
  })

  div = fieldset.append("div").attr("class", "infoLabel")
  div.append("label").attrs({
    "for": "email",
  }).text("Email")
  div.append("label").attr("id", "emailErrorLabel")
  fieldset.append("input").attrs({
    type: "text",
    id: "email",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusout", function(){
    self.checkEmail()
  }).on("focusin", function(d){
    d3.select("#emailErrorLabel").text("")
  })


  div = fieldset.append("div").attr("class", "infoLabel")
  div.append("label").attrs({
    "for": "password",
  }).text("Password")
  div.append("label").attr("id", "passErrorLabel")
  fieldset.append("input").attrs({
    type: "password",
    id: "password",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusout", function(){
    self.checkPass()
  }).on("focusin", function(d){
    d3.select("#passErrorLabel").text("")
  });
  fieldset.append("label").text("Already have an account?").append("a").text(" Sign in.").attr("class", "signinLink")

  // $("fieldset").add("label").text("Forgot password?").add("a").text("Reset password.").addClass("passwordLink")
  // $("fieldset").add("label").text("No account?").add("a").text("Sign up.").addClass("signupLink")
  // $(".usernameLink").on("click", getUsernameDia)
  // $(".passwordLink").on("click", resetPasswordDia)
  $(".signinLink").on("click", function(){
    self.signinDia()
  })

  this.diaObj = {
    title: "Sign up",
    autoOpen: false,
    height: 370,
    width: 420,
    modal: true,
    buttons: {
      "Sign up": function(){
        self.checkUser(true)
      },
      Cancel: function() {
        self.authenDia()
        //$("#dialog-form").dialog( "close" );
      }
    },
    close: function() {
      // form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    }
  }

  $("#dialog-form").off("keypress")
  $("#dialog-form").dialog(self.diaObj)              
  $(".ui-dialog-titlebar-close").hide()
  $("#dialog-form").dialog("open")
  $("#username").focus();
  $("#dialog-form").on("keypress", function(e) {
    // console.log("ssign")
    if (e.keyCode == $.ui.keyCode.ENTER) {
      $("#dialog-form").parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click");
    }
  });
}

UserAuthen.prototype.checkPass = function(forward = false){
  var self = this
    self.passVali = false;
    var d = $("#password").val().trim();
    if(d == "") d3.select("#passErrorLabel").text( "  Please input a password.").style("color", "red")
    else{ 
      $("#passErrorLabel").html("&#10004;").css({ color: "green" })
      self.passVali = true;
      if(forward) self.signupPro()
    }
}

UserAuthen.prototype.checkUser = function(forward = false){
  var self = this
  self.userVali = false;
  var nameVali = ["document", "dtcbio", "effect", "entitie", "log", "note", "user"]
  var d = $("#username").val().trim();
  if(d == "") d3.select("#nameErrorLabel").text( "  Please input a username.").style("color", "red")
  // else if(!(/^[a-z]+$/i.test(d.trim()))) d3.select("#nameErrorLabel").text( "  Only letters are allowed in Username.").style("color", "red")
  else if(nameVali.indexOf(d) > -1) d3.select("#nameErrorLabel").text( "  This username already exists.").style("color", "red")
  else 
  $.ajax({
    type: "POST",
    url: "/user/usernamedup/?username=" + d,
    dataType: "json",
    success: function(response){
      if(response.a){ $("#nameErrorLabel").html("&#10004;").css({
          color: "green"
        })
        self.userVali = true;
        if(forward)
          self.checkEmail(true)
      }
      else d3.select("#nameErrorLabel").text("  This username already exists.").style("color", "red")
    },
    error: function () {console.log("username dup error!")}
  })
}

UserAuthen.prototype.checkEmail = function(forward = false){
  var self = this
  self.emailVali = false;
  var d = $("#email").val().trim();
  if(d == "") d3.select("#emailErrorLabel").text( "  Please input an email address.").style("color", "red")
  else if(!self.emailRegex.test(d)) d3.select("#emailErrorLabel").text( "  Please input a right email address.").style("color", "red")
  else $.ajax({
    type: "POST",
    url: "/user/emaildup/?email=" + d,
    dataType: "json",
    success: function(response){
      if(response.a){ 
        $("#emailErrorLabel").html("&#10004;").css({color: "green"})
        self.emailVali = true;
        if(forward) self.checkPass(true)
      }
      else d3.select("#emailErrorLabel").text("  Email already registered. Please sign in.").style("color", "red")
    },
    error: function () {console.log("email error!")}
  })
}

UserAuthen.prototype.signupPro = function(){
  var self = this

  if(!this.userVali || !this.emailVali || !this.passVali){
    return;
  }
  var user = {username: $("#username").val().trim(), email: $("#email").val().trim(), password: $("#password").val().trim(), version: "health"}
  $.ajax({
      type: "POST",
      url: "/user/signup",
      dataType: "json",
      contentType:'application/json',
      data: JSON.stringify(user),
      success: function(response){
        self.signinDia("You signed up successfully, please sign in.");
      },
      error: function () {console.log("sign up error!")}
    })
}

UserAuthen.prototype.signinPro = function(){
  var self = this
  var user = {username: $("#username").val().trim(), password: $("#password").val().trim(), version: "health"}
  $.ajax({
      type: "POST",
      url: "/user/login",
      dataType: "json",
      contentType:'application/json',
      data: JSON.stringify(user),
      success: function(response){
        if(response.success){
          self.username = user.username;
          
          document.cookie = "coemissionSession="+response.session;
          var obj = {type: "startSession", mode: "normalMode", time: getFormatedTime(), user: self.username}
          addLog(obj) 
          // yearAxisIns = new yearAxis()
          // curMode = new ModeClass()
          // curNote = new Note()
          // curUi = new Ui()
          // if(handlerIns == "")
          //     handlerIns = new Handler()
          // proveMode = new ModeClass("grid")
          // curUi.initStackedArea()
          // drawNoteFramework()
          // gloDiv = "#main";
          // getEntityList()
          d3.select("#usernameButton").text(self.username).on("mouseenter", function(){
            showTooltip("Click to log out.", d3.event.pageX - 60, d3.event.pageY)
          }).on("mouseleave", function(){
            d3.select("#tooltip").style("visibility", "hidden")
          })
          $("#dialog-form").dialog("close")
          getNoteCount()
          if($("#showNoteDiv").css("display") != "none")
            $("#showNoteIcon").click()
          d3.select("#editIcon").style("display", null)
          // taskDia(false)
        }
        else if(response.message == 'Incorrect version.'){
          window.open(window.location.origin + "/medi", "_self")
        }
        else{
          //console.log("error")
          d3.select("#message").text("Username or password incorrect.").styles({color: "red"})
        }
      },
      error: function () {console.log("sign in error!")}
    })
}

UserAuthen.prototype.getUsernameDia = function(){
  var self = this;
  var fieldset = d3.select("#dialog-form fieldset")
  $("fieldset").empty();
  fieldset.append("label").attrs({
    "for": "email"
  }).text("Email")
  fieldset.append("input").attrs({
    type: "text",
    id: "email",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusin", function(){
    d3.select("#message").text("")
  })
  fieldset.append("label").text("Know your Username?").append("a").text(" Sign in.").attr("class", "signinLink").append("br")
  fieldset.append("label").attr("id", "message").text("")
  $(".signinLink").on("click", function(){
    self.signinDia()
  })

  this.diaObj = {
    title: "Get username",
    autoOpen: false,
    height: 260,
    width: 350,
    modal: true,
    buttons: {
      "Get username": function(){
        self.getUsernamePro()
      },
      Cancel: function() {
        self.authenDia()
        //$("#dialog-form").dialog( "close" );
      }
    },
    // [{
    //     text: "Get username",
    //     id: "getUsernameButton",
    //     click: self.getUsernamePro,
    //   },
    //   {text: "Cancel",
    //   click: self.authenDia
    //     //$("#dialog-form").dialog( "close" );
    // }],
    close: function() {
      //form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    }
  }
  // $("#dialog-form").dialog("close")
  $("#dialog-form").off("keypress")
  $("#dialog-form").dialog(self.diaObj)              
  // $(".ui-dialog-titlebar-close").hide()
  // $("#dialog-form").dialog("open")
  $("#email").focus();
  $("#dialog-form").on("keypress", function(e) {
    if (e.keyCode == $.ui.keyCode.ENTER) {
      $("#dialog-form").parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click");
    }
  });
}

UserAuthen.prototype.forgotPasswordDia = function(){
  var self = this
  var fieldset = d3.select("#dialog-form fieldset")
  $("fieldset").empty();
  fieldset.append("label").attrs({
    "for": "email"
  }).text("Email")
  fieldset.append("input").attrs({
    type: "text",
    id: "email",
    class: "text ui-widget-content ui-corner-all"
  }).on("focusin", function(){
    d3.select("#message").text("")
  })
  fieldset.append("label").text("Remember password?").append("a").text(" Sign in.").attr("class", "signinLink").append("br")
  fieldset.append("label").text("").attr("id", "message")
  $(".signinLink").on("click", function(){
    self.signinDia()
  })

  this.diaObj = {
    title: "Reset password",
    autoOpen: false,
    height: 260,
    width: 350,
    modal: true,
    buttons: {
      "Reset": function(){self.forgotPasswordPro()},
      Cancel: function() {
        self.authenDia()
        //$("#dialog-form").dialog( "close" );
      }
    },
    close: function() {
      //form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    }
  }
  $("#dialog-form").off("keypress")  
  $("#dialog-form").dialog(self.diaObj)              
  // $(".ui-dialog-titlebar-close").hide()
  // $("#dialog-form").dialog("open")
  $("#email").focus();
  
  $("#dialog-form").keypress(function(e) {
    if (e.keyCode == $.ui.keyCode.ENTER) {
      // console.log("forget")
      $("#dialog-form").parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click");
    }
  });
}

UserAuthen.prototype.authenDia = function(){
  var fieldset = d3.select("#dialog-form fieldset")
  $("fieldset").empty();
  var self = this

  this.diaObj = {
    title: "Authentication",
    autoOpen: false,
    height: 80,
    width: 180,
    modal: true,
    buttons: {
      "Sign in": function(){self.signinDia()},
      "Sign up": function(){self.signupDia()},
    }
    // close: function() {
    //   //form[ 0 ].reset();
    //   //allFields.removeClass( "ui-state-error" );
    // }
  }
  $("#dialog-form").off("keypress")
  $("#dialog-form").dialog(self.diaObj)
  // $(".ui-dialog-titlebar-close").hide()
  // $("#dialog-form").dialog("open")
}

UserAuthen.prototype.getUsernamePro = function(){
  var self = this
  var d = $("#email").val().trim();
  if(d == ""){
    d3.select("#message").text( "Please input an email address.").style("color", "red")
    return
  }
  if(!self.emailRegex.test(d)){
    d3.select("#message").text( "Please input a right email address.").style("color", "red")
    return
  }
  
  $.ajax({
    type: "POST",
    url: "/user/getusername",
    dataType: "json",
    contentType:'application/json',
    data: JSON.stringify({email: d}),
    success: function(response){
      if(response.success){
        d3.select("#message").text(response.message).style("color", "green")
      } 
      else{
        console.log("error")
        d3.select("#message").text(response.message).styles({color: "red"})
      }
    },
    error: function () {console.log("get username error!")}
  })
}

UserAuthen.prototype.forgotPasswordPro = function(){
  var self = this
  var d = $("#email").val().trim();
  if(d == "") d3.select("#message").text( "Please input an email address.").style("color", "red")
  else if(!self.emailRegex.test(d)) d3.select("#message").text( "Please input a right email address.").style("color", "red")
  else
  $.ajax({
      type: "POST",
      url: "/user/forgot",
      dataType: "json",
      contentType:'application/json',
      data: JSON.stringify({email: d}),
      success: function(response){
        //console.log(response)
        if(response.success){
          d3.select("#message").text(response.message).style("color", "green")
        } 
        else{
          console.log("error")
          d3.select("#message").text(response.message).styles({color: "red"})
        }
      },
      error: function () {console.log("reset password error!")}
    })
}

UserAuthen.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

UserAuthen.prototype.checkCookie = function() {
    var session = this.getCookie("coemissionSession");
    var self = this
    // console.log(session)
    if(session != "\"\""){
        $.ajax({
          type: "POST",
          url: "/user/login",
          dataType: "json",
          contentType:'application/json',
          data: JSON.stringify({session: session}),
          success: function(response){
            //console.log(response)
            if(response.message == "login"){
              document.cookie = "coemissionSession="+"\"\""
              // self.signupDia()
              self.username = "";
              yearAxisIns = new yearAxis()
              curMode = new ModeClass()
              curNote = new Note()
              curUi = new Ui()
              if(handlerIns == "")
                handlerIns = new Handler()
              d3.select("#usernameButton").text("Sign in").on("mouseenter", function(){
                showTooltip("Click to sign in.", d3.event.pageX - 60, d3.event.pageY)
              }).on("mouseleave", function(){
                d3.select("#tooltip").style("visibility", "hidden")
              })
              d3.select("#editIcon").style("display", "none")
            } 
            else{
              console.log("cookie in")
              self.username = response.user;
              var obj = {type: "startSession",  mode: "normalMode", time: getFormatedTime(), user: self.username}
              addLog(obj)
              yearAxisIns = new yearAxis()
              curMode = new ModeClass()
              curNote = new Note()
              curUi = new Ui()
              if(handlerIns == "")
                handlerIns = new Handler()
              d3.select("#usernameButton").text(self.username).on("mouseenter", function(){
                showTooltip("Click to log out.", d3.event.pageX - 60, d3.event.pageY)
              }).on("mouseleave", function(){
                d3.select("#tooltip").style("visibility", "hidden")
              })
              d3.select("#editIcon").style("display", null)
            }
          },
          error: function () {console.log("sign in session error!")}
        })
    }
    else{
        console.log("signuo?")
        // this.signupDia()
        self.username = "";
        yearAxisIns = new yearAxis()
        curMode = new ModeClass()
        curNote = new Note()
        curUi = new Ui()
        if(handlerIns == "")
          handlerIns = new Handler()
        d3.select("#usernameButton").text("Sign in").on("mouseenter", function(){
          showTooltip("Click to sign in.", d3.event.pageX - 60, d3.event.pageY)
        }).on("mouseleave", function(){
          d3.select("#tooltip").style("visibility", "hidden")
        })
        d3.select("#editIcon").style("display", "none")
    }
}

UserAuthen.prototype.signoutPro = function(){
  document.cookie = "coemissionSession="+"\"\"";

  d3.select("#usernameButton").text("Sign in").on("mouseenter", function(){
    showTooltip("Click to sign in.", d3.event.pageX - 60, d3.event.pageY)
  }).on("mouseleave", function(){
    d3.select("#tooltip").style("visibility", "hidden")
  })
  self.username = "";
  // selectedEntities = []
  // selectedData = []
  // yearAxisIns = null
  // curNote = null
  // curMode = null
  // curMap = null
  // curUi = null
  // $("#stackDiv").empty()
  // $("#yearDiv").empty()
  // $("#mapDiv").empty()
  // $("#countryDiv").empty()
  if(curMode != "normalMode"){
    curMode.state = "normalMode"
    curMode[curMode.state]()
    curMode[curMode.state + "Map"]()
    curMode[curMode.state + "Note"]()
    $("#postit").data("_id", null)
    curNote.entityInNote = []
    getNoteCount()
  }
  $("#postitDiv").css("display", "none")
  // $("#showNoteDiv").empty()
  // $("#graphSvg").empty()
  
  if($("#showNoteDiv").css("display") != "none")
    $("#showNoteIcon").click()
  // $("#showGraphDiv").css("display", "none")
  // $("#deselectButton").css("display", "none")
  d3.select("#editIcon").style("display", "none")
  this.signinDia();
}

function taskDia(click = true){
  if(click){
    var obj = {type: "checkTask", mode: curMode.state, time: getFormatedTime(), user: curUser.username}
    addLog(obj)
  }
  var ele = d3.select("#dialog-form fieldset")
  //var div;
  $("fieldset").empty();
  ele.append("label").attr("class", "taskLabel").html("Freely explore the data and others\' notes, and publish <b>at least five notes</b> which indicate your discoveries about the data.");
  ele.append("label").attr("class", "taskLabel").html("Note: Each note should contain <b>at least one type of reference</b>, such as a view or another note, to help with your narrative.");//"Please fill in at least 3 tasks of drug-target relations that you want to explore. Please involve at least one drug, mutation, or cancer name in each task description.")
  ele.append("label").attr("class", "taskLabel").html("After you finish the task, you can proceed to the questionnaire by clicking on the link at the top bar.")

  curUser.diaObj = {
    title: "Task",
    autoOpen: false,
    height: 300,
    width: 500,
    modal: true,
    // dialogClass: "ui-dialog",
    buttons: {
      // "OK": $("#dialog-form").dialog( "close" ),//taskInputPro,
      "OK": function() {
        // authenDia()
        $("#dialog-form").dialog( "close" );
      }
    },
    close: function() {
      //form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    }
  }
  $("#dialog-form").off("keypress")
  $("#dialog-form").dialog(curUser.diaObj)              
  // $(".ui-dialog-titlebar-close").hide()
  $("#dialog-form").dialog("open")
  $("#dialog-form").on("keypress", function(e) {
    // console.log("ssign")
    if (e.keyCode == $.ui.keyCode.ENTER) {
      $("#dialog-form").parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click");
    }
  });
  // $("#descrip0").focus()
}
