'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    images: [ {type: Schema.ObjectId, ref: 'Image'}],
    addedBy: {type: Schema.ObjectId, ref: 'User'}
});

var Category = mongoose.model('Category', CategorySchema);
module.exports.Category = Category;