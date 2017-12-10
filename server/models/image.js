'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    filepath: { type: String, trim: true, required: true },
    imageType: { type: Number, required: true }, // 0 = thumbnail, 1 = profile
    uploadedBy: { type: Schema.ObjectId, ref: 'User' }
});

var Image = mongoose.model('Image', ImageSchema);
module.exports.Image = Image;