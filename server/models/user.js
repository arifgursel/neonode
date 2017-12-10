// This is the s file located at /server/models/friend.js
// We want to create a file that has the schema for our friends and creates a model that we can then call upon in our controller
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 100],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var UserSchema = new Schema({
  firstName: { type: String, required: true, trim: true, validate: nameValidator},
  lastName:  { type: String, required: true, trim: true, validate: nameValidator},
  location: {type: [Number] }, // [LONG, LAT]
  hometown: {type: [Number] }, // [LONG, LAT]
  email:      { type: String, required: true, trim: true},
  pwHash:    { type: String, required: true, trim: true},
  profilePic: { type: String, trim: true},
  type:       { type: Number, default: 0 }, // 0 === default, 1 == admin, 2 == super admin 3 == GOD
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  favorites: [{ type: Schema.ObjectId, ref: 'Business' }],
  reviews: [{ type: Schema.ObjectId, ref: 'Review' }]
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
UserSchema.index({location: '2dsphere'});
UserSchema.index({hometown: '2dsphere'});

UserSchema.pre('save', function(next){
  //assign a variabe for the UserSchema object
  var user = this;
  if (!user.isModified('pwHash')){
    return next();
  } else {
    console.log("user pwHash change occured and creating password for:",user.pwHash)
    user.pwHash = bcrypt.hashSync(user.pwHash, 8);
    next();
  }
});

//Custom methods extending the object we just created
UserSchema.methods.comparePassword = function(password) {
//assign a variabe for the UserSchema object
  var user = this;

  return bcrypt.compareSync(password, user.pwHash);
};
UserSchema.methods.swapPassword = function(password) {
//assign a variabe for the UserSchema object
  var user = this;

  user.pwHash = bcrypt.hashSync(password, 8);
};

// use the schema to create the model
// Note that creating a model CREATES the collection in the database (makes the collection lowercase and plural)
mongoose.model('User', UserSchema);
// notice that we aren't exporting anything -- this is because this file will be run when we require it using our config file
// and then since the model is defined we'll be able to access it from our controller
