// this is our friends.js file located at /server/controllers/friends.js

// First add the following two lines at the top of the friends controller so that 
// we can access our model through var Friend
// need to require mongoose to be able to run mongoose.model()
var mongoose = require('mongoose');
var Visa = mongoose.model('Visa');

// note the immediate function and the object that is returned
module.exports = (function() {
	return {
	    create: function(req, res) {
			console.log('Got Create For: '+req.body);

	  	},
	  	readAll: function(req, res) {
			Visa.find({}, function(err, visas) {
				if(err) {
				 console.log(err);
				 res.json(false)
				} 
				else {
				 console.log("All visas read and returned from DB...");
				 res.json(visas);
				}
	   		})
	  	},
	  	readOne: function(req, res) {
			Visa.findById(req.params.id, function(err, visa) {
				if(err) {
				 console.log(err);
				 res.json(err)
				} 
				else {
				 console.log("Visa was retrieved and returned from DB");
				 res.json(visa);
				}
	   		})
	  	},
	  	update: function(req, res) {
			Visa.findByIdAndUpdate(req.body.id, 
								   {
								   	first_name: req.body.first_name,
								 	last_name: req.body.last_name,
								 	email: req.body.email,
								 	updated_at: Date.now()
								   },
								   function(err, visa) {
										if(err) {
										 console.log(err);
										 res.json(err);
										} 
										else {
										 console.log("Updated visa details successfully");
										 res.json(visa);
										}
							   		})
	  	},
	  	delete: function(req, res) {
			Visa.findByIdAndRemove(req.params.id, function(err, visas) {
				if(err) {
					console.log(err);
					res.json(err);
				} 
				else {
				 	console.log("Deleted a visa profile successfully");
					res.json(visas);
				}
	   		})
	  	}
	}
})();