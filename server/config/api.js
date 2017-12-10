// This is the api route file:
// Since we are api driven all server side routes are in api.js
// ********

//load the logger module
var logger = require('../../config/logger');

//JSON Web Token: User creation
var jsonwebtoken = require('jsonwebtoken');

// Load ORM: Mongoose/Mongo + Models
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Visa = mongoose.model('Visa');

//Get * Controllers
var users = require('../controllers/users');
var businesses = require('../controllers/businesses');
var categories = require('../controllers/categories');




//Project Configuration Settings
module.exports = function(app,express) {
	var api = express.Router();
	var config = app.config;

	//Token Creation function
	function createToken(user) {
		var token = jsonwebtoken.sign({
										id: user._id,
										name: user.firstName,
										type: user.type.toString()
									  },
									  config.secretKey,
									  { expiresIn: "2 days" }
									  );
		return token;
	}
	//Account Creation Route
	api.post('/signup', function(req, res){	return users.create(req, res);	});
	//User Login Route
	api.post('/login', function(req, res){ return users.login(req, res); });

	//*****************************************//
	// Passport Config  								       //
	//*****************************************//
	//passport strategies
	var passport = require('passport')
	  , FacebookStrategy = require('passport-facebook').Strategy
	  , TwitterStrategy = require('passport-twitter').Strategy
	  , GoogleStrategy = require('passport-google-oauth20').Strategy
		, LinkedInStrategy = require('passport-linkedin').Strategy
	  , GitHubStrategy = require('passport-github2').Strategy;
	//Passport-Facebook
	passport.use(new FacebookStrategy({
	    clientID: app.config.passportFacebook.clientID,
	    clientSecret: app.config.passportFacebook.clientSecret,
	    callbackURL: app.config.passportFacebook.callbackURL,
	    profileFields: app.config.passportFacebook.profileFields
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	users.fbAuthorize(accessToken, refreshToken, profile, done);
	  }
	));
	//Passport-Twitter
	passport.use(new TwitterStrategy({
	    consumerKey: app.config.passportTwitter.consumerKey,
	    consumerSecret: app.config.passportTwitter.consumerSecret,
	    callbackURL: app.config.passportTwitter.callbackURL
	  },
	  function(token, tokenSecret, profile, done) {
	  	console.log("Twitter Email:", profile._json.email);
	  	console.log("Twitter Profile:", profile);
	  	User.findOne( {email: profile._json.email}, function(err,user){
			if(err) { //Handle err
				console.log("*** Error trying to find user from DB in Twitter auth ***");
				done(err);
			} if(user) { //User found, use ID to determine validity of their visa to pass to Twitter land
				Visa.findOne( {providerUserId: profile.id}, function(err,visa) {
			    //handle err or return data
				    if(err){
				    	console.log("*** Error in trying to find visa object ***");
				    	return done(err);
				    } if(visa){
				    	console.log("*** User Visa exist, send to login ***");
				    	return done(null,user)
				    } else {
				    	console.log("*** User Visa doesn't exist, must be created ***");
				    	//Check to see if user exist
				    	var visaInstance = new Visa({
					 		provider:  profile.provider,
						  	providerUserId:  profile.id,
						  	accessToken: token,
						  	userId: user._id,
						 	created_at: Date.now(),
						 	updated_at: Date.now()
					 	});
					 	visaInstance.save(function(err,newVisa){
					 		if(err){
				 				console.log("*** error creating creating visa for current user in Twitter auth ***");
				 				return done(err);
					 		} if(newVisa){
					 			return done(null,user);
					 		}
					 	});
				    }
				});
			} else {
				//No user found in DB, Create them their visa to Twitter land
				var names = profile._json.name.split(" ");
				console.log("Name is now: ", names);
				var userInstance = new User({
				 	firstName: names[0],
				 	lastName: names[1],
				 	email: profile._json.email,
			 	  profilePic: profile.photos[0].value,
				 	pwHash: token,
				 	createdAt: Date.now(),
				 	updatedAt: Date.now()
				 });
				console.log("New user is:", JSON.stringify(userInstance));
				 userInstance.save(function(err,newUser){
				 	if(err) {
				 		console.log("*** error creating user in Twitter auth ***:", err);
				 		return done(err);
				 	} if(newUser) {
				 		var visaInstance = new Visa({
					 		provider:  profile.provider,
						  	providerUserId:  profile.id,
						  	accessToken: token,
						  	userId: newUser._id,
						 	createdAt: Date.now(),
						 	updatedAt: Date.now()
					 	});
					 	visaInstance.save(function(err,newVisa){
					 		if(err){
				 				console.log("*** error creating creating visa for new user in Twitter auth ***");
				 				done(err);
					 		} if(newVisa){
					 			return done(null,newUser);
					 		}
					 	});
				 	}
				 });
			}
	  	});
	  }
	));
	//Passport-Google
	passport.use(new GoogleStrategy({
	    clientID: app.config.passportGoogle.clientID,
	    clientSecret: app.config.passportGoogle.clientSecret,
	    callbackURL: app.config.passportGoogle.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	console.log("Google Profile:", profile);
		 	User.findOne( {email: profile.emails[0].value}, function(err,user){
				if(err) { //Handle err
					console.log("*** Error trying to find user from DB in Google auth ***");
					done(err);
				} if(user) { //User found, use ID to determine validity of their visa to pass to Google land
						console.log("*** User with email: "+profile.emails[0].value+" already exist in DB ***");
						Visa.findOne( {providerUserId: profile.id}, function(err,visa) {
				    //handle err or return data
					    if(err){
					    	console.log("*** Error in trying to find visa object ***");
					    	return done(err);
					    } if(visa){
					    	console.log("*** User Visa exist, send to login ***");
					    	return done(null,user)
					    } else {
					    	console.log("*** User Visa doesn't exist, must be created ***");
					    	//Check to see if user exist
						    var visaInstance = new Visa({
							 		provider:  profile.provider,
							  	providerUserId:  profile.id,
							  	accessToken: accessToken,
							  	userId: user._id,
								 	created_at: Date.now(),
								 	updated_at: Date.now()
							 	});
							 	visaInstance.save(function(err,newVisa){
							 		if(err){
						 				console.log("*** error creating creating visa for current user in Google auth ***");
						 				return done(err);
							 		} if(newVisa){
							 			return done(null,user);
							 		}
							 	});
						  }
						});
				} else {
					//No user found in DB, Create them their visa to Google land
					var userInstance = new User({
					 	first_name: profile.name.givenName,
					 	last_name: profile.name.familyName,
					 	email: profile.emails[0].value,
					 	pw_hash: accessToken,
					 	profilePic: profile.photos[0].value,
					 	created_at: Date.now(),
					 	updated_at: Date.now()
					 });
					console.log("New user is:", JSON.stringify(userInstance));
					userInstance.save(function(err,newUser){
					 	if(err) {
					 		console.log("*** error creating user in Google auth ***:", err);
					 		return done(err);
					 	} if(newUser) {
					 		var visaInstance = new Visa({
						 		provider:  profile.provider,
							  	providerUserId:  profile.id,
							  	accessToken: accessToken,
							  	userId: newUser._id,
							 	created_at: Date.now(),
							 	updated_at: Date.now()
						 	});
						 	visaInstance.save(function(err,newVisa) {
						 		if(err) {
					 				console.log("*** error creating creating visa for new user in Google auth ***");
					 				done(err);
						 		} if(newVisa) {
						 			return done(null,newUser);
						 		}
						 	});
					 	}
					 });
				}
	  	});
  	}
	));
	// //Passport-Linkedin
	passport.use(new LinkedInStrategy({
	    consumerKey: config.passportLinkedIn.consumerKey,
	    consumerSecret: config.passportLinkedIn.consumerSecret,
	    profileFields: config.passportLinkedIn.profileFields,
	    callbackURL: config.passportLinkedIn.callbackURL
	  },
	  function(token, tokenSecret, profile, done) {
	    console.log("LinkedIn Email:", profile.emails[0].value);
	  	console.log("LinkedIn Profile:", profile);
	  	User.findOne( {email: profile.emails[0].value}, function(err,user){
			if(err) { //Handle err
				console.log("*** Error trying to find user from DB in LinkedIn auth ***");
				done(err);
			} if(user) { //User found, use ID to determine validity of their visa to pass to LinkedIn land
				console.log("*** User found that matches LinkedIn auth ***");
				Visa.findOne( {providerUserId: profile.id}, function(err,visa) {
			    //handle err or return data
				    if(err){
				    	console.log("*** Error in trying to find visa object ***");
				    	return done(err);
				    } if(visa){
				    	console.log("*** User Visa exist, send to login ***");
				    	return done(null,user)
				    } else {
				    	console.log("*** User Visa doesn't exist, must be created ***");
				    	//Check to see if user exist
				    	var visaInstance = new Visa({
					 		provider:  profile.provider,
						  	providerUserId:  profile.id,
						  	accessToken: token,
						  	userId: user._id,
						 	created_at: Date.now(),
						 	updated_at: Date.now()
					 	});
					 	visaInstance.save(function(err,newVisa){
					 		if(err){
				 				console.log("*** error creating creating visa for current user in LinkedIn auth ***");
				 				return done(err);
					 		} if(newVisa){
					 			return done(null,user);
					 		}
					 	});
				    }
				});
			} else {
				//No user found in DB, Create them their visa to LinkedIn land
				var userInstance = new User({
				 	first_name: profile.name.givenName,
				 	last_name: profile.name.familyName,
				 	email: profile.emails[0].value,
				 	pw_hash: token,
				 	created_at: Date.now(),
				 	updated_at: Date.now()
				 });
				console.log("New user is:", JSON.stringify(userInstance));
				 userInstance.save(function(err,newUser){
				 	if(err) {
				 		console.log("*** error creating user in LinkedIn auth ***:", err);
				 		return done(err);
				 	} if(newUser) {
				 		var visaInstance = new Visa({
					 		provider:  profile.provider,
						  	providerUserId:  profile.id,
						  	accessToken: token,
						  	userId: newUser._id,
						 	created_at: Date.now(),
						 	updated_at: Date.now()
					 	});
					 	visaInstance.save(function(err,newVisa){
					 		if(err){
				 				console.log("*** error creating creating visa for new user in LinkedIn auth ***");
				 				done(err);
					 		} if(newVisa){
					 			return done(null,newUser);
					 		}
					 	});
				 	}
				 });
			}
	  	});
	  }
	));
	//Passport-Github
	passport.use(new GitHubStrategy({
	    clientID: config.passportGithub.clientID,
	    clientSecret: config.passportGithub.clientSecret,
	    callbackURL: config.passportGithub.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	console.log("GitHub Profile:", profile);
		 	User.findOne( {email: profile.emails[0].value}, function(err,user){
				if(err) { //Handle err
					console.log("*** Error trying to find user from DB in GitHub auth ***");
					done(err);
				} if(user) { //User found, use ID to determine validity of their visa to pass to GitHub land
					console.log("*** User with email: "+profile.emails[0].value+" already exist in DB ***");
					Visa.findOne( {providerUserId: profile.id}, function(err,visa) {
				    //handle err or return data
					    if(err){
					    	console.log("*** Error in trying to find visa object ***");
					    	return done(err);
					    } if(visa){
					    	console.log("*** User Visa exist, send to login ***");
					    	return done(null,user)
					    } else {
					    	console.log("*** User Visa doesn't exist, must be created ***");
					    	//Check to see if user exist
					    	var visaInstance = new Visa({
						 		provider:  profile.provider,
							  	providerUserId:  profile.id,
							  	accessToken: accessToken,
							  	userId: user._id,
							 	created_at: Date.now(),
							 	updated_at: Date.now()
						 	});
						 	visaInstance.save(function(err,newVisa){
						 		if(err){
					 				console.log("*** error creating creating visa for current user in GitHub auth ***");
					 				return done(err);
						 		} if(newVisa){
						 			return done(null,user);
						 		}
						 	});
					    }
					});
				} else {
					//No user found in DB, Create them their visa to GitHub land
					var userInstance = new User({
					 	first_name: profile.name.givenName,
					 	last_name: profile.name.familyName,
					 	email: profile.emails[0].value,
					 	pw_hash: accessToken,
					 	profilePic: profile.photos[0].value,
					 	created_at: Date.now(),
					 	updated_at: Date.now()
					 });
					console.log("New user is:", JSON.stringify(userInstance));
					 userInstance.save(function(err,newUser){
					 	if(err) {
					 		console.log("*** error creating user in GitHub auth ***:", err);
					 		return done(err);
					 	} if(newUser) {
					 		var visaInstance = new Visa({
						 		provider:  profile.provider,
							  	providerUserId:  profile.id,
							  	accessToken: accessToken,
							  	userId: newUser._id,
							 	created_at: Date.now(),
							 	updated_at: Date.now()
						 	});
						 	visaInstance.save(function(err,newVisa){
						 		if(err){
					 				console.log("*** error creating creating visa for new user in GitHub auth ***");
					 				done(err);
						 		} if(newVisa){
						 			return done(null,newUser);
						 		}
						 	});
					 	}
					 });
					}
			  	});
		  }
	));
	//*****************************************//
	// Passport Routes 								         //
	//*****************************************//
	// Redirect the user to Facebook for authentication.
	api.get('/auth/facebook', passport.authenticate('facebook',{ scope: ['email', 'user_friends']}));
	// Facebook will redirect the user to this URL after approval.
	api.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { failureRedirect: '/login', session: false}), function(req, res){ users.socialLogin(req,res); });
	// Redirect the user to Twitter for authentication.
	api.get('/auth/twitter', passport.authenticate('twitter'));
	// Twitter will redirect the user to this URL after approval.
	api.get('/auth/twitter/callback',
	  passport.authenticate('twitter', { failureRedirect: '#/login'}), function(req, res){
	  	var token = createToken(req.user);
			res.redirect("#/home?token="+token);
		});
	// Redirect the user to Google for authentication.
	api.get('/auth/google', passport.authenticate('google',{ scope: ['profile','email']} ));
	// google will redirect the user to this URL after approval.
	api.get('/auth/google/callback',
	  passport.authenticate('google', { failureRedirect: '/login', session: false}), function(req, res){
	  	var token = createToken(req.user);
		res.redirect("#/home?token="+token);
	  });
	// Redirect the user to LinkedIn for authentication.
	api.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
	// linked will redirect the user to this URL after approval.
	api.get('/auth/linkedin/callback',
	  passport.authenticate('linkedin', { failureRedirect: '/login', session: false}), function(req, res){
	  	var token = createToken(req.user);
			res.redirect("#/home?token="+token);
	  });
	// Redirect the user to GitHub for authentication.
	api.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));
	// github will redirect the user to this URL after approval.
	api.get('/auth/github/callback',
	  passport.authenticate('github', { failureRedirect: '/login', session: false}), function(req, res){
		var token = createToken(req.user);
		res.redirect("/home?token="+token);
	  });

	//*****************************************//
	// Non Secure Routes: Pre-Auth			       //
	//*****************************************//

	// retrive all businesses
	api.get('/businesses',
		function(req, res) {
			return businesses.index(req, res);
		}
	);

	// query the business collection
	api.get('/businesses/search/:search',
		function(req, res) {
			return businesses.searchBusinesses(req, res);
		}
	);

	// retrieve a specific business (by ID)
	api.get('/businesses/:id',
		function(req, res) {
			return businesses.findOne(req, res);
		}
	);

	// see reveiews for a specific business (by ID)
	api.get('/businesses/:id/reviews',
		function(req, res) {
		  businesses.findBusinessReviews(req, res);
		}
	);

	// create a business
	api.post('/businesses/create',
		function(req, res) {
			console.log('in api businesses/create');
			return businesses.create(req, res);
	});

	// create a business category
	api.post('/reviews/create',
		function(req, res) {
			return businesses.addReview(req, res);
	});

	// retrive all categories
	api.get('/categories',
		function(req, res) {
			return categories.index(req, res);
	});

	// create a business category
	api.post('/categories/create',
		function(req, res) {
			return categories.create(req, res);
	});

	//*****************************************//
	// Start: Users Authorization  Middleware  //
	//*****************************************//
	api.use(function(req, res, next){ return users.authenticate(req, res, next); });

	//Token - Identity Retrival
	api.get('/me', function(req,res){
		console.log("me:", req.decoded);
		res.json(req.decoded); });

	//*****************************************//
	// Finish: Users Authorization  Middleware //
	//*****************************************//



	//*****************************************//
	// Post-Authentication Routes Below        //
	//*****************************************//

	//User Level: Get your own profile
	api.get('/users/:id', function(req, res){ return users.readOne(req, res); });

	//User Level: Update your own profile
	api.post('/users/:id', function(req, res){ return users.update(req, res); });

	//User Level: Update your own profile
	api.post('/users/password/:id', function(req, res){ return users.updatePassword(req, res); });

	//*****************************************//
	// Start: Admin Authorization  Middleware  //
	//*****************************************//

	api.use(function(req, res, next){ return users.adminCheck(req, res, next); });

	//*****************************************//
	// Finish: Admin Authorization  Middleware //
	//*****************************************//


	//Admin: Get All Users Route
	api.get('/users', function(req, res){ return users.readAll(req, res); });

	//Admin: Make a user an admin
	api.post('/users/:id/admin', function(req, res){ return users.makeAdmin(req, res); });

	//Admin: Make a user an admin
	api.post('/users/:id/superadmin', function(req, res){ return users.makeSuperAdmin(req, res); });

	//Admin: Make a user a regular user
	api.post('/users/:id/removeAdmin', function(req, res){ return users.removeAdmin(req, res); });

	//Admin: Delete specific user
	api.delete('/users/:id', function(req, res){ return users.delete(req, res); });

	return api;
}
