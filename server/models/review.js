'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var path = require('path');

var ReviewSchema = new Schema({
	text: { type: String, trim: true, required: true },
    rating  : {type: Schema.ObjectId, ref: 'Rating', trim: true, required: true },
    user  : {type: Schema.ObjectId, ref: 'User', required: true },
    business  : {type: Schema.ObjectId, ref: 'Business', required: true}
})

var Review = mongoose.model('Review', ReviewSchema);
module.exports.Review = Review;