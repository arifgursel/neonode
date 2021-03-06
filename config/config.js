//Config Variables
var devURL = "http://127.0.0.1";
var prodURL = "https://arifneonode.herokuapp.com";
var devDB = 'mongodb://localhost/devDB';
var prodDB = 'mongodb://arifgursel:EssahSaha1@ds151163.mlab.com:51163/heroku_xzm76jmp';
var devPort = 8080;
var testPort = 8080;
var admin = {
  firstName : "God",
  lastName : "Almighty",
  email : "contact@arifgursel.com",
  pwHash : "$2a$08$w2UmNzssFxyt1mMSgRzk8e9c/wPyTb6Ab7xUS7psnUlMs7EwLp9wu",
  type: 3
}

//Config Object To Export
module.exports = {
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || prodURL,
  apiPrefix: '/api',
  development: {
    db: devDB,
    port: devPort,
    url: devURL,
    app: {
      name: 'arifneonode dev'
    },
    secretKey: "v1b3h3@^y",
    adminAccount: admin,
    passportFacebook: {
      clientID: '1186832174749919',
      clientSecret: 'bbb868d12fd9f771e2cff738507761c9',
      callbackURL: devURL+":"+devPort+"/api/auth/facebook/callback",
      enableProof: true,
      profileFields: ['id', 'displayName', 'name', 'email', 'friends']
    },
    passportTwitter: {
      consumerKey: 'vFgpl2oroJwUMKZyuyPBic4zn',
	    consumerSecret: 'bthKdgLxPHOYdTYPbgmFScPSzlXTRCHsYnfNEneT5qrJlPB6qN',
	    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
	    callbackURL: devURL+":"+devPort+"/api/auth/twitter/callback"
    },
    passportGoogle: {
      clientID: "623922084598-336obi0jav7s6l4s1nincem4gu4ufiaa.apps.googleusercontent.com",
	    clientSecret: "HjZQNpb_sWeNv-MiX8cKAaxA",
	    callbackURL: devURL+":"+devPort+"/api/auth/google/callback"
    },
    passportLinkedIn: {
      consumerKey: '86b7lxz4f1athj',
	    consumerSecret: 'fOLNuLnuj6iMmWW2',
	    profileFields: ['id', 'first-name', 'last-name', 'email-address'],
	    callbackURL: devURL+":"+devPort+"/api/auth/linkedin/callback"
    },
    passportGithub: {
      clientID: "2569c6c472fef0828620",
	    clientSecret: "23f9f61bcb6e658d012dfb3679914a245e2eaaa1",
	    callbackURL: devURL+":"+devPort+"/api/auth/github/callback"
    }
  },
  test: {
    port: testPort,
    app: {
      name: 'arifneonode test'
    }
  },
  stage: {
    port: process.env.PORT,
    app: {
      name: 'arifneonode stage'
    }
  },
  production: {
    db: prodDB,
    port: process.env.PORT || 8080,
    url: prodURL,
    app: {
      name: 'arifneonode production'
    },
    secretKey: "v1b3h3@^y",
    adminAccount: admin,
    passportFacebook: {
      clientID: '1186832174749919',
      clientSecret: 'bbb868d12fd9f771e2cff738507761c9',
      callbackURL: prodURL + "/api/auth/facebook/callback",
      enableProof: true,
      profileFields: ['id', 'displayName', 'name', 'photos', 'email', 'friends']
    },
    passportTwitter: {
      consumerKey: 'vFgpl2oroJwUMKZyuyPBic4zn',
      consumerSecret: 'bthKdgLxPHOYdTYPbgmFScPSzlXTRCHsYnfNEneT5qrJlPB6qN',
	    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
	    callbackURL: prodURL + "/api/auth/twitter/callback"
    },
    passportGoogle: {
      clientID: "623922084598-336obi0jav7s6l4s1nincem4gu4ufiaa.apps.googleusercontent.com",
      clientSecret: "HjZQNpb_sWeNv-MiX8cKAaxA",
	    callbackURL: prodURL + "/api/auth/google/callback"
    },
    passportLinkedIn: {
      consumerKey: '86b7lxz4f1athj',
	    consumerSecret: 'fOLNuLnuj6iMmWW2',
	    profileFields: ['id', 'first-name', 'last-name', 'email-address'],
      callbackURL: prodURL + "/api/auth/linkedin/callback"
    },
    passportGithub: {
      clientID: "2569c6c472fef0828620",
	    clientSecret: "23f9f61bcb6e658d012dfb3679914a245e2eaaa1",
      callbackURL: prodURL + "/api/auth/github/callback"
    }
  }
};
