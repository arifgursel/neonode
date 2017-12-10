// This is a config file that connects to MongoDB and loads all of our models

// load the event logger
var logger = require('../../config/logger');
// require file-system so that we can load, read, require all of the model files
var fs = require('fs');
// require mongoose
var mongoose = require('mongoose');
// require file-system so that we can load, read, require all of the model files
var fs = require('fs');

module.exports = function(config) {
  // connect mongoose
  if(!mongoose.connection.readyState) {
    mongoose.connect(config.db, { useMongoClient: true }, function(err) {
      if (err) throw err;
      logger.info("Connected to Mongo at: " + config.db);
    });
  }

  // specify the path to all of the models
  var models_path = __dirname + '/../models'
  // read all of the files in the models_path and for each one check if it is a javascript file before requiring it
  fs.readdirSync(models_path).forEach(function(file) {
      if (~file.indexOf('.js')) {
          logger.info('loading model(s) from: ' + models_path + '/' + file);
          require(models_path + '/' + file);
      }
  });
}
