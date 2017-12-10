//Config Variables
var devURL = "http://127.0.0.1";
var prodURL = "http://commonwealth.herokuapp.com";
var devDB = 'mongodb://localhost/devDB';
var prodDB = 'mongodb://commonwealthadmins:!4OurCommonGood@ds042688.mongolab.com:42688/commonwealthdb';
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
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || 'http://127.0.0.1',
  apiPrefix: '/api',
  development: {
    db: devDB,
    port: devPort,
    url: devURL,
    app: {
      name: 'commonwealth dev'
    },
    secretKey: "v1b3h3@^y",
    adminAccount: admin,
    passportFacebook: {
      clientID: '104627854481',
      clientSecret: 'de22de02648563ec3653830a1ab02727',
      callbackURL: devURL+":"+devPort+"/api/auth/facebook/callback",
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
    passportSoundcloud: {
      clientID: '081fe1dd030195124bfc0f29b3ecf550',
	    clientSecret: '184c96b13ea997ac12675ed3e7f8ea3f',
	    callbackURL: devURL+":"+devPort+"/api/auth/soundcloud/callback"
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
      name: 'commonwealth test'
    }
  },
  stage: {
    port: process.env.PORT,
    app: {
      name: 'commonwealth stage'
    }
  },
  production: {
    db: prodDB,
    port: process.env.PORT || 8080,
    url: prodURL,
    app: {
      name: 'commonwealth production'
    },
    secretKey: "v1b3h3@^y",
    adminAccount: admin,
    passportFacebook: {
      clientID: '104627854481',
      clientSecret: 'de22de02648563ec3653830a1ab02727',
      callbackURL: prodURL + "/api/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'name', 'photos', 'email', 'friends']
    },
    passportTwitter: {
      consumerKey: 'UbfPxgQSUn80Ggg0qLluplQ4v',
	    consumerSecret: 'PJgTZqP5nrTwiRzGATXnGWqTCdJ3ziAEPCCLWpDBsbWaekIOg9',
	    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
	    callbackURL: prodURL + "/api/auth/twitter/callback"
    },
    passportGoogle: {
      clientID: "903414418856-mkvtt3qhr5jnhs325t20t845463qk37g.apps.googleusercontent.com",
	    clientSecret: "4LDXxljtDDLAYAzbKktJroCZ",
	    callbackURL: prodURL + "/api/auth/google/callback"
    },
    passportLinkedIn: {
      consumerKey: '86b7lxz4f1athj',
	    consumerSecret: 'fOLNuLnuj6iMmWW2',
	    profileFields: ['id', 'first-name', 'last-name', 'email-address'],
	    callbackURL: devURL + "/api/auth/linkedin/callback"
    },
    passportSoundcloud: {
      clientID: '081fe1dd030195124bfc0f29b3ecf550',
	    clientSecret: '184c96b13ea997ac12675ed3e7f8ea3f',
	    callbackURL: devURL + "/api/auth/soundcloud/callback"
    },
    passportGithub: {
      clientID: "2569c6c472fef0828620",
	    clientSecret: "23f9f61bcb6e658d012dfb3679914a245e2eaaa1",
	    callbackURL: devURL + "/api/auth/github/callback"
    }
  }
};
