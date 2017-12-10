'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BusinessSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, default: "" },
    onlineOnly: { type: Boolean, required: true, trim: true, default: false},
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    location: {type: [Number] }, // [LONG, LAT]
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    website: { type: String, trim: true },
    hours: { type: String, trim: true },
    blackOwned: { type: Boolean, trim: true },
    blackListed: { type: Boolean, trim: true },
    addedBy: { type: Schema.ObjectId, ref: 'User', required: true },
    owner: { type: Schema.ObjectId, ref: 'User' },
    categories: [ { type: Schema.ObjectId, ref: 'Category' }],
    reviews: [{ type: Schema.ObjectId, ref: 'Review' }],
    ratings: [{ type: Schema.ObjectId, ref: 'Rating' }],
    images: [ {type: Schema.ObjectId, ref: 'Image' }]
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
BusinessSchema.index({location: '2dsphere'});

BusinessSchema.virtual('ratingAggregate').get(() => new Promise((resolve, reject) => {
   Review.find({ business: this.id }, function(err, reviews) {
        if(err) {
            console.log("error:" + err);
            return res.status(500).send(err);
        }

        console.log('aggregating ' + reviews.length + ' reviews for ' + this.name);
        var reviewValues = [];
        var totalRating = 0;
        for(var i = 0; i < reviews.length; i++) {
            totalRating += reviews[i].rating === 'Good' ? 1 : 0;
        }

        console.log('total rating: ' + totalRating);

        var aggregateRating = totalRating > (reviews.length / 2) ? 'Good' : 'Bad';
        this._ratingAggregate =  aggregateRating;
        return resolve(aggregateRating);
    });
   return 5;
}));

BusinessSchema.set('toObject', {
  getters: true
});

BusinessSchema.statics.addReview = function(biz, user, review, cb) {
    var Review = mongoose.model('Review');
    var reviewObject = new Review(review);

    reviewObject.user = user;
    reviewObject.business = biz;

    console.log('ADDREVIEW BIZ: ' + biz.name);

    reviewObject.save(function(err, doc) {
        if(err) {
            logger.error('addReview: error while adding review: ' + err);
            return cb(err,null);
        }
        return cb(null, reviewObject);
    })
};


var Business = mongoose.model('Business', BusinessSchema);
module.exports.Business = Business;