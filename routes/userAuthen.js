var express = require('express');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('./user').User;
var passport = require('./user').passport;
var path = require('path');
var app = express.Router();
var concat = require('array-concat')


app.post('/login', function(req, res, next) {
	if(req.body.hasOwnProperty("session")){
		User.find({session: req.body.session}, function(err, docs){
			//console.log(docs)
			if(err) return next(err);
			if(docs.length == 0 || docs.length > 1) return res.json({message: "login"})
			return res.json({message: "success", user: docs[0].username})
		})
	}
	else
  passport.authenticate('local', function(err, user, info) {
  	//console.log(err);
  	//console.log(info)
    if (err) return next(err)
    if (!user) {
    	 console.log(user)
       return res.json({success: false, message: info.message})
    }
    else req.logIn(user, function(err) {
      if (err) return next(err);
      crypto.randomBytes(10, function(err, buf){
      	if(err) return next(err);
      	user.session = buf.toString('hex');
      	//console.log(user.session)
      	user.save(function(err) {
      		if(err) return next(err);
      		return res.json({success: true, session: user.session});
        });
      })
    });
  })(req, res, next);
});

app.post('/signup', function(req, res) {
  var user = new User({
      username: req.body.username,
      nameLower: req.body.username.toLowerCase(),
      email: req.body.email,
      password: req.body.password,
      version: req.body.version,
    });

  user.save(function(err) {
	if(err) res.json(500);
	else res.json({success: true})
  });
});

app.post('/usernamedup', function(req, res){
	var obj = {};
	obj.nameLower = req.query.username.toLowerCase();
	//console.log(obj)
	User.findOne(obj, function(err, user){
    if(err) res.json(500)
		if(!user) res.json({a:true})
		else res.json({a:false})
	})
})

app.post('/emaildup', function(req, res){
	var obj = {};
	obj.email = req.query.email;
	User.findOne(obj, function(err, user){
		if(!user) res.json({a:true})
		else res.json({a:false})
	})
})

app.post('/getusername', function(req, res){
	User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return res.json({success: false, message: 'No account with that email address exists.'});
        }
        var smtpTransport = nodemailer.createTransport({
	        service: 'Gmail',
	        auth: {
	          user: '',
	          pass: ''
	        }
      	});
      var mailOptions = {
        to: user.email,
        from: '',
        subject: 'CO2 emission explorer Worker ID Notification',
        text: 'You are receiving this email because you have requested to retrieve the Worker ID of your account.\n\n' +
          'Your Worker ID: ' + user.username + '\n\n' + 'Please follow the link to sign in https://ss-18.it.helsinki.fi/' + user.version 
          + ' \n\n If you did not request this, please ignore this email.\n\n'
          + 'Best regards,\n' + 'The CO2 emission explorer team\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
      	if(err){
          console.log(err)
          return res.json({success: false, message: 'Server error, please try again later.'});
        }
        res.json({success: true, message:'An e-mail has been sent to ' + user.email + ' containing your Worker ID.'});
      });

    })
})

app.post('/forgot', function(req, res) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return res.json({success: false, message: 'No account with that email address exists.'});
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
	        service: 'Gmail',
	        auth: {
	          user: '',
	          pass: ''
	        }
        })

      var mailOptions = {
        to: user.email,
        from: '',
        subject: 'CO2 emission explorer Password Reset',
        text: 'You are receiving this because you have requested the reset of the password for your account.\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/user/reset/?token=' + token + '\n\n' +
          'The reset link will expire in an hour. \n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' + 
          'Best regards,\n' + 'The CO2 emission explorer team\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, message:'An e-mail has been sent to ' + user.email + ' with further instructions.'});
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err){ //return next(err);
      console.log(err)
    	res.json({success: false, message: 'Server error, please try again later.'});
    }
  });
});

app.get('/reset', function(req, res) {
	//console.log(req.query.token)
  User.findOne({ resetPasswordToken: req.query.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.json({success: false, message: 'Password reset token is invalid or has expired.'});
    }
    //return res.json({success: true});
    return res.sendFile('reset.html', { root: path.join(__dirname, '../public/javascripts') });
  });
});

app.post('/reset', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.json({success: false, message: 'Password reset token is invalid or has expired.'});
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: '',
          pass: ''
        }
      });
      var mailOptions = {
        to: user.email,
        from: '',
        subject: 'Your CO2 emission explorer password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\n' +
          'Best regards,\n' + 'The CO2 emission explorer team\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, message: 'Success! Your password has been changed.', redirect: '/' + user.version});
        done(err, 'done');
      });
    }
  ], function(err) {
  	console.log(err)
  	if(err)
    	return res.json({success: false, message: 'Server error, please try again later.'});
    //console.log("send file")
    //return res.redirect('/')//res.sendFile('index.html', { root: path.join(__dirname, 'public/javascripts') });

  });
});

app.post('/savetask', function(req, res) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if(err) res.json(500)
    type = req.body.type;
    user[type] = user[type].concat(req.body[type])
    user.save(function(err){
      if(err) res.json(500)
      else res.json(200)
    })
  })
})

app.post('/gettask', function(req, res) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if(err) res.json(500)
    res.json({tasks: user.tasks})
  })
})

app.post('/getfeedback', function(req, res) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if(err) res.json(500)
    res.json({comments: user.comments})
  })
})

module.exports = app;