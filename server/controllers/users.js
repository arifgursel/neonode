// this is our friends.js file located at /server/controllers/friends.js

// First add the following two lines at the top of the friends controller so that
// we can access our model through var Friend
// need to require mongoose to be able to run mongoose.model()
var logger = require('../../config/logger.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Visa = mongoose.model('Visa');
var bcrypt = require('bcryptjs');
var global = require('../../config/config.js');
var env = process.env.NODE_ENV || 'development';
var config = global[env];
var secretKey = config.secretKey;
//JSON Web Toekn
var jsonwebtoken = require('jsonwebtoken');

//Private Method: Token Creation
function  createToken(user) {
	console.log('secret:' + secretKey);
	var token = jsonwebtoken.sign({
									id: user._id,
									name: user.firstName,
									type: user.type.toString()
								  },
								  secretKey,
								  { expiresIn: "2 days" }
								  );
	return token;
}

// Export: Note the immediate function and the object that is returned
module.exports = (function() {
	return {
	    create: function(req, res){
			console.log('Got Create For: '+JSON.stringify(req.body));

	        //Express Form Validation
	        req.checkBody('firstName', "First name is required").notEmpty();
	        req.checkBody('lastName', "Last name is required").notEmpty();
	        req.checkBody('email', "Email is required").notEmpty();
	        req.checkBody('email', "Not a valid email address").isEmail();
	        req.checkBody('password', "Password is required").notEmpty();

	        //check for errors
	        var errors = req.validationErrors();
	        if (errors){
	        	//Go back
	        	res.json({
	        				success: false,
	        				errors: errors,
	        				place: "validation",
	        				body: req.body
	        	});
	        } else { //All clear
	        	var user = new User({
				 	firstName: req.body.firstName,
				 	lastName: req.body.lastName,
				 	email: req.body.email,
				 	pwHash: req.body.password,
				 	createdAt: Date.now(),
				 	updatedAt: Date.now()
				 });

				 var token = createToken(user);

				 user.save(function(err){
				 	if (err) {
				 		console.log("API-POST (/signup) error:", err);
				 		res.json({
									success: false,
									message: "User not registered",
									token: null
								});
				 	} else {
				 		res.json({
									success: true,
									message: "User registered",
									token: token
								});
				 	}
				 })
	        }
	  	},
	  	readAll: function(req, res) {
	  		console.log("Inside the read all users route")
			User.find({}, function(err, users){
				if (err){
					res.json({
								success: false,
								message: "Users not found, error: "+err,
								users: null
							});
				} else {
					res.json({
								success: true,
								message: "Users found",
								users: users
							});
				}
			});
	  	},
	  	readOne: function(req, res) {
			User.findOne({_id:req.params.id}, function(err, user){
				if (err){
					res.json(err);
				} else {
					res.json(user);
				}
			});
	  	},
	  	update: function(req, res) {
			User.findOneAndUpdate( {_id:req.params.id}, req.body, {new: true}, function(err, newUser){
				if (err){
					res.json(err);
				} else {
					res.json(newUser);
				}
			});
	  	},
	  	delete: function(req, res) {
			User.findOneAndRemove({_id:req.params.id}, function(err, user){
				if (err){
					res.json({
							success: false,
							message: "User not found",
							user: null
						});
				} else {
					res.json({
							success: true,
							message: "User found and deleted",
							user: user
						});
				}
			});
	  	},
	  	login: function(req, res) {
			User.findOne({
						email: req.body.email
					 })
					.select('firstName type pwHash')
					.exec(function(err, user){
						if (err)
							res.json(err);
						if (!user){
							res.json({
									success: false,
									message: "User not found in system, please register",
									token: null,
									type: null
								});
						} else {
							var validPassword = user.comparePassword(req.body.pwHash);
							if (!validPassword) {
								res.json({
									success: false,
									message: "Password and email mismatch",
									token: null,
									type: null
								});
							} else {
								//Get token
								var token = createToken(user);
								console.log("token:",token);
								res.json({
									success: true,
									message: "User Logged in succesfully!",
									token: token,
									type: user.type
								});
							}
						}
					});
		},
		updatePassword: function(req, res) {
			console.log("Calling updatePassword")
			User.findOne({_id:req.params.id}, function(err, user){
				if (err){
					console.log("Findone Failed");
					res.json({
							success: false,
							message: "User not found",
							user: null
						});
				} else {
					var validPassword = user.comparePassword(req.body.oldPass);
					if (!validPassword) {
						res.json({
							success: false,
							message: "Password mismatch",
							user: null
						});
					} else {
						user.swapPassword(req.body.newPass);
						User.findOneAndUpdate( {_id:user._id}, user, {new: true}, function(err, newUser){
							console.log("err: "+err+" newUser:", newUser);
							if (err){
								res.json({
									success: false,
									message: "updating user password had error: "+err,
									user: null
								});
							} else {
								console.log("Updated user password and user is:", JSON.stringify(newUser));
								res.json({
									success: true,
									message: "Password updated",
									user: newUser
								});
							}
						});
					}

				}
			});
		},
		authenticate: function (req, res, next){
			console.log("authenticating api call | user level");
			var token = req.body.token || req.params.token || req.headers['x-access-token'];
			// check if token exist
			if(token){
				jsonwebtoken.verify(token, secretKey, function(err, decoded){
					if (err){
						res.status(403).send({success: false, message: "Can't authenticate user"});
					} else {
						req.decoded = decoded;
						next();
					}
				});
			} else {
						res.status(403).send({success: false, message: "No Token Provided"});
			}
		},
		//Admin Methods
		adminCheck: function (req, res, next){
			console.log("Calling adminCheck");
			if(req.decoded.type > 0){
				next();
			} else {
				res.status(403).send({success: false, message: "User doesn't have admin rights"});
			}
		},
		makeAdmin: function(req, res){
			User.findOneAndUpdate({_id:req.params.id}, {type: 1}, {new: true}, function(err, user){
				if (err){
					res.json({
							success: false,
							message: "User not found",
							user: null
						});
				} else {
					res.json({
							success: true,
							message: "User made an admin",
							user: user
						});
				}
			});
		},
		makeSuperAdmin: function(req, res){
			User.findOneAndUpdate({_id:req.params.id}, {type: 2}, {new: true}, function(err, user){
				if (err){
					res.json({
							success: false,
							message: "User not found",
							user: null
						});
				} else {
					res.json({
							success: true,
							message: "User made a super admin",
							user: user
						});
				}
			});
		},
		removeAdmin: function(req, res){
			User.findOneAndUpdate({_id:req.params.id}, {type: 0}, {new: true}, function(err, user){
				if (err){
					res.json({
							success: false,
							message: "User not found",
							user: null
						});
				} else {
					res.json({
							success: true,
							message: "User had admin status removed",
							user: user
						});
				}
			});
		},
		//Facebook Methods
		fbAuthorize: function(accessToken, refreshToken, profile, done){
			logger.info('Seaching for FB user');
			User.findOne( {email: profile.emails[0].value}, function(err,user){
				if(err) { //Handle err
					console.log("*** Error trying to find user from DB in FB auth ***");
					done(err);
				} if(user) { //User found, use ID to determine validity of their visa to pass to FB land
					logger.info('Found user looking for Visa');
					Visa.findOne( {providerUserId: profile.id}, function(err,visa) {
				    //handle err or return data
					    if(err){
					    	console.log("*** Error in trying to find visa object ***");
					    	return done(err);
					    } if(visa){
					    	Visa.findOneAndUpdate({_id: visa._id}, {connections: JSON.stringify(profile._json.friends)}, function(err,visa){
					    		if(err){
					    			return done(err);
					    		} if(visa){
					    			console.log("*** User Visa exist, and updated to current friend list ***");
					    			return done(null,user);
					    		}
					    	})
					    } else {
					    	console.log("*** User Visa doesn't exist, must be created ***");
					    	//Check to see if user exist
					    	var visaInstance = new Visa({
						 		provider:  profile.provider,
							  	providerUserId:  profile.id,
							  	accessToken: accessToken,
							  	connections: JSON.stringify(profile._json.friends.data),
							  	userId: user._id,
							 	created_at: Date.now(),
							 	updated_at: Date.now()
						 	});
						 	visaInstance.save(function(err,newVisa){
						 		if(err){
					 				console.log("*** error creating creating visa for current user in FB auth ***");
					 				return done(err);
						 		} if(newVisa){
						 			return done(null,user);
						 		}
						 	});
					    }
					});
				} else {
					//No user found in DB, Create them their visa to FB land
					var userInstance = new User({
					 	firstName: profile.name.givenName,
					 	lastName: profile.name.familyName,
					 	email: profile.emails[0].value,
					 	pwHash: accessToken,
				 		profilePic: profile.photos[0].value,
					 	created_at: Date.now(),
					 	updated_at: Date.now()
					});
					userInstance.save(function(err,newUser){
					 	if(err) {
					 		console.log("*** error creating user in FB auth ***:", err);
					 		return done(err);
					 	} if(newUser) {
							console.log("New user is:", JSON.stringify(newUser));
					 		var visaInstance = new Visa({
						 		provider:  profile.provider,
							  	providerUserId:  profile.id,
							  	accessToken: accessToken,
							  	connections: JSON.stringify(profile._json.friends.data),
							  	userId: newUser._id,
							 	created_at: Date.now(),
							 	updated_at: Date.now()
						 	});
						 	visaInstance.save(function(err,newVisa){
						 		if(err){
					 				console.log("*** error creating creating visa for new user in FB auth ***");
					 				done(err);
						 		} if(newVisa){
									console.log("New visa is:", JSON.stringify(newVisa));
									console.log("Parsed connections:", JSON.parse(newVisa.connections));
						 			return done(null,newUser);
						 		}
						 	});
					 	}
					 });
				}
			});
		},
		fbLogin: function(req, res){
			var token = createToken(req.user);
			res.redirect("#/home?token="+token);
		},
		socialLogin: function (req, res) {
			var token = createToken(req.user);
			res.token = token;
			res.redirect("#/home?token=" + token);
		}
	}
})();
