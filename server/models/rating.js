'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RatingSchema = new Schema({
    value: { type: Number, required: true },
    business: { type: Schema.ObjectId, ref: 'Business', required: true },
    user: { type: Schema.ObjectId, ref: 'User' }
});

var Rating = mongoose.model('Rating', RatingSchema);
module.exports.Rating = Rating;