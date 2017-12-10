'use strict';

var mongoose = require('mongoose');
var Business = mongoose.model('Business');
var Review = mongoose.model('Review');
var Rating = mongoose.model('Rating');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = (function() {
    return {
        index: function(req, res) {
            Business.find({}, function(err, businesses) {
                    if (err){
                        res.json({
                                    success: false,
                                    message: "Businesses not found, error: "+err,
                                    businesses: null
                                });
                        return;
                    } else {
                        res.json({
                                    success: true,
                                    message: "Businesses found",
                                    businesses: businesses
                                });
                    }
            });
        },

        create: function(req, res){
            console.log("New Business Data!: " + JSON.stringify(req.body));
            var newBusiness = new Business(req.body);
            newBusiness.save(function(err, business) {
                if (err){
                    res.json({
                                success: false,
                                message: "Could not add Business, error: " + err,
                                business: null
                            });
                    console.log("Response", res.data);
                    return;
                } else {
                    res.json({
                                success: true,
                                message: "Added Business",
                                business: business
                            });
                    console.log("Response", res.data);
                    return;
                }
            })
        },

        findOne: function(req,res) {
            console.log('in findOne');
            console.log("looking for: " + req.params.id); 

            Business.findById(req.params.id)
                    .populate('reviews')
                    .populate('ratings')
                    .populate('categories')
                    .exec(function(err, doc) {
                        console.log("Type of ID: " + (typeof req.params.id));
                        if (err) {
                            console.log("error:" + err);
                            res.json({
                                        success: false,
                                        message: "Business not found, error: "+ err,
                                        business: null
                                    });
                            return;
                        }

                        if (doc === null || doc == undefined) {
                            res.json({
                                success: false,
                                message: "Business undefined, error: "+ err,
                                business: null
                            });     
                            return;
                        }

                        var opts = [
                                    { path: 'reviews.rating', model: 'Rating' },
                                    { path: 'reviews.user', model: 'User' }
                                  ]

                        console.log("Business (reviews populate)", doc);

                        Business.populate(doc, opts, function(err, doc) {
                            if (err) {
                                console.log("error:" + err);
                                res.json({
                                            success: false,
                                            message: "Business not found, error: "+ err,
                                            business: null
                                        });
                                return;
                            }
                            console.log("Business (reviews.rating populate)", doc);

                            res.json({
                                        success: true,
                                        message: "Business found",
                                        business: doc
                                    });
                        });
                        /*
                        doc.toObject().ratingAggregate.then(function(rating) {
                            var result = doc.toObject();
                            result.ratingAggregate = rating;
                            res.status(200).send(JSON.stringify(result));
                            console.log("got rating: " + rating);
                        });
                        */
                    });
        },

        addReview: function(req, res) {
            console.log('in addReview');
            console.log("Body", req.body);

            var newRating = new Rating({ value: req.body.rating, business: req.body.business, user: req.body.user });
            newRating.save(function(err, rating) {
                if (err) {
                    console.log('Rating error', err);
                    res.json({
                                success: false,
                                message: "Could not create Rating for Review, error: " + err,
                                rating: null
                            });
                    return;
                }
                else {
                    req.body.rating = rating;
                    var newReview = new Review(req.body);
                    newReview.save(function(err, review) {
                        if (err){
                            console.log('Review error', err);
                            res.json({
                                        success: false,
                                        message: "Could not add Review, error: " + err,
                                        review: null
                                    });
                            return;
                        } else {
                            Business.findByIdAndUpdate(
                                review.business,
                                {
                                    $push: { "ratings": rating, "reviews": review }
                                },
                                { upsert: false, new : true},
                                function(err, business) {
                                    console.log("Business ID", review.business._id);
                                    console.log("Business (from review)", review.business);
                                    console.log("Business", business);
                                }
                            );

                            res.json({
                                        success: true,
                                        message: "Added Review",
                                        review: review
                                    });
                            return;
                        }
                    })
                }
            })
        },

        searchBusinesses: function(req,res) {
            console.log('in searchBusinesses');
            console.log('Body: ' + JSON.stringify(req.params.search));
            var query = req.params.search; //req.params.name;
            var nameTokens = query.split(" ");
            var nameRegex = nameTokens.join(".*|.*");
            nameRegex = ".*" + nameRegex + ".*";
            console.log(nameRegex);
            var results = [];

            Array.prototype.getUnique = function(){
               var u = {}, a = [];
               for(var i = 0, l = this.length; i < l; ++i){
                  if(u.hasOwnProperty(this[i])) {
                     continue;
                  }
                  a.push(this[i]);
                  u[this[i]] = 1;
               }
               return a;
            }

            console.log("searching " + query);
            Business.find({name: new RegExp(nameRegex, "i")}, function(err, docs)
            {
                if(err) {
                    console.log("error:" + err)
                    return res.status(500).send(err)
                }
                //console.log("found " + bizs)
                var querySet = nameTokens.getUnique();
                //var queryLength = query.length;

                // Sort by wack Jaccard similarity (no union term)
                docs.sort(function (c1, c2) {
                    var intersection1 = 0;
                    var intersection2 = 0;
                    console.log(querySet);
                    for (var i = 0; i < querySet.length; i++) { 
                        //console.log("uhhh" + new RegExp(".*" + querySet[i] + ".*", "i").test(c1.name))
                        if (new RegExp(".*" + querySet[i] + ".*", "i").test(c1.name))
                        {
                            intersection1++;
                        }
                        if (new RegExp(".*" + querySet[i] + ".*", "i").test(c2.name))
                        {
                            intersection2++;
                        }
                    }
                    //console.log(intersection1);
                    // var totalLength1 = c1.name.length;
                    // var totalLength2 = c2.name.length;
                    return intersection2 - intersection1;
                })

                if (err){
                    res.json({
                                success: false,
                                message: "Businesses not found, error: "+err,
                                businesses: null
                            });
                    return;
                } else {
                    res.json({
                                success: true,
                                message: "Businesses found",
                                businesses: docs
                            });
                }
            })
        }
    }
})()