'use strict';

var mongoose = require('mongoose');
var Category = mongoose.model('Category');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = (function() {
    return {
        index: function(req, res) {
            Category.find({}, function(err, categories) {
                    if (err){
                        res.json({
                                    success: false,
                                    message: "Categories not found, error: "+err,
                                    categories: null
                                });
                        return;
                    } else {
                        res.json({
                                    success: true,
                                    message: "Categories found",
                                    categories: categories
                                });
                    }
            });
        },

        create: function(req, res){
            console.log("New Category Data: " + JSON.stringify(req.body));
            var newCategory = new Category(req.body);
            newCategory.save(function(err, category) {
                if (err) {
                    res.json({
                                success: false,
                                message: "Could not add Category, error: " + err,
                                category: null
                            });
                    console.log("Error creating category: ", err);
                    return;
                } else {
                    res.json({
                                success: true,
                                message: "Added Category",
                                category: category
                            });
                    console.log("New Category: ", category);
                    return;
                }
            })
        }
    }
})()