// We want to create a file that has the schema for our visas and creates a model that we can then call upon in our controller
var mongoose = require('mongoose');

//need to add association logic to refernce a specific user
ObjectId = mongoose.Schema.ObjectId;

//Visa schema definition
var VisaSchema = new mongoose.Schema({
  provider:  String,
  providerUserId:  String,
  accessToken: String,
  connections: String,
  userId: {type: ObjectId, ref: 'User'},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// use the schema to create the model
// Note that creating a model CREATES the collection in the database (makes the collection lowercase and plural)
mongoose.model('Visa', VisaSchema);
// notice that we aren't exporting anything -- this is because this file will be run when we require it using our config file 
// and then since the model is defined we'll be able to access it from our controller




