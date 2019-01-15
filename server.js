const express = require('express');
const cors = require('cors');
const path = require('path');
var passport = require('passport');
var config = require('./config');
var user = require("./models/users");
//routes
const videoRoutes = require('./api/routes/videos');
//make it an express app
const app = express();


//tell our app what modules to use
app.use(cors());
app.use('/videos', videoRoutes);


//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
var OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
var users = [];

//integrate passport serialize/deserialize users
passport.serializeUser(function(user, done) {
  done(null, user.oid);
});

passport.deserializeUser(function(oid, done) {
  findByOid(oid, function(err, user) {
    done(err, user);
  });
});

var findByOid = function(oid, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    log.info("we are using user: ", user);
    if (user.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

// OIDCStrategy supported by Passport through Azure
passport.use(
  new OIDCStrategy(
    {
      identityMetadata: config.creds.identityMetadata,
      clientID: config.creds.clientID,
      responseType: config.creds.responseType,
      responseMode: config.creds.responseMode,
      redirectUrl: config.creds.redirectUrl,
      allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
      clientSecret: config.creds.clientSecret,
      validateIssuer: config.creds.validateIssuer,
      isB2C: config.creds.isB2C,
      issuer: config.creds.issuer,
      passReqToCallback: config.creds.passReqToCallback,
      scope: config.creds.scope,
      loggingLevel: config.creds.loggingLevel,
      nonceLifetime: config.creds.nonceLifetime,
      nonceMaxAmount: config.creds.nonceMaxAmount,
      useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
      cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
      clockSkew: config.creds.clockSkew
    },
    function(iss, sub, profile, accessToken, refreshToken, done) {
      if (!profile.oid) {
        return done(new Error("No oid found"), null);
      }
      // asynchronous verification, for effect
      process.nextTick(function() {
        findByOid(profile.oid, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            if (profile._json.extension_Role == "Coach") {
              paymentConfirmed = false;
              User.createCoachTables(
                profile.oid,
                profile.name.givenName,
                profile.name.familyName,
                profile._json.extension_Email,
                profile._json.extension_School,
                profile._json.extension_Team
              );
            }
            users.push(profile);
            console.log("view profile in json");
            console.log(profile);
            return done(null, profile);
          }
          console.log(user);
          return done(null, user);
        });
      });
    }
  )
);

//passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res, next) => {
    passport.authenticate("azuread-openidconnect", {
      response: res, // required
      resourceURL: config.resourceURL, // optional. Provide a value if you want to specify the resource.
      customState: "my_state", // optional. Provide a value if you want to provide custom state value.
      failureRedirect: "http://localhost:3000/error"
    })(req, res, next);
  },
  function(req, res) {
    log.info("Login was called in the Sample");
    res.redirect("http://localhost:3000/home");
  }
);

//GET from Azure sign up
app.get("/auth/openid/return", (req, res, next) => {
    passport.authenticate("azuread-openidconnect", {
      response: res, // required
      failureRedirect: "http://localhost:3000/error"
    })(req, res, next);
  },
  function(req, res) {
    log.info("We received a return from AzureAD.");
    res.redirect("http://localhost:3000/home");
  }
);

//POST from Azure sign up
app.post('/auth/openid/return', (req, res, next) => {
  console.log('hello from /auth/openid/return')
    passport.authenticate("azuread-openidconnect", {
      response: res,
      failureRedirect: "http://localhost:3000/error"
    })(req, res, next);
  },
  function(req, res) {
    log.info("We received a return from AzureAD.");
    res.redirect("http://localhost:3000/home");
  }
);

// 'logout' route, logout from passport, and destroy the session with AAD.
app.get("/logout", (req, res) => {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      req.logout();
      res.redirect(config.destroySessionUrl);
    }
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//handle a page not found, 404
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

//handle other errors, 500
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

//misc
app.use(express.static(path.join(__dirname, "public")));
app.listen(3001, () => console.log("Server is up on port 3001."));




//MAY NEED LATER
// const util = require("util");
// const uniqueString = require("unique-string");
// const readDir = util.promisify(fs.readdir);

// Blob Storage
// var Connection = require('tedious').Connection;
// var Request = require('tedious').Request;