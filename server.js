
//******************|  Load Express and Config  |********************|
// load express and bind to app variable
var express = require('express');
var app = express();
// load config file  and bind as element on app variable
var config = require('./config/config');
var env = process.env.NODE_ENV || 'development';
app.config = config[env];

//*************|  Load DB  |***************|
// Load the DB and ORM config file
require('./server/config/mongoose.js')(app.config);

//*************|  Load Utilities & Helpers |***************|
//load the utility library
var util = require('./util');
//Load the path object for file access
var path = require('path');
//load the logger module
var logger = require('./config/logger');

//*********************|  Start Middleware  |************************|
//Favicon Support: Uncomment line below once you have a custom icon
//var favicon = require('serve-favicon');
//app.use(favicon(__dirname + '/client/favicon.ico'));

//Body-Parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Morgan - Logger of request - Anything below will be logged
var morgan = require('morgan');
app.use(morgan('dev'));

//Express Validator: Back up detection
// In this example, the formParam value is going to get morphed into form body format useful for printing.
var expressValidator = require('express-validator');
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Express Session
var session = require('express-session');
app.use(session({secret: 'keyboard cat', resave: true,  saveUninitialized: true}));

//Passport
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

//Static File Location
app.use(express.static(path.join(__dirname, './client')));
logger.info('Static Folder: ' + path.join(__dirname, './client'));

//Setup CORS
app.use(util.allowCrossDomain);
logger.info('allowing origin: ' + JSON.stringify(config.corsAllowOrigin));

//******************|  End Middleware  |********************|
//*******************************************************************|
//**********************************************************|
//Get and use route defintions
var api = require('./server/config/api.js')(app,express);
//prepend '/api' to api routes
app.use('/api', api);
app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: path.join(__dirname, './client') });
});
// app.use(function(req, res) {
//     res.sendFile(__dirname + '/client/index.html');
// });

//start server and listen for http request
app.listen(app.config.port, function() {
  logger.info('environment: ' + env);
  logger.info('Website running on port: '+app.config.port);
  logger.info('Admin account:', JSON.stringify(app.config.adminAccount, null, 2));
});
