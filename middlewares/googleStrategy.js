const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/userSchema'); // Adjust this path based on your file structure

const setupGoogleStrategy = (passport) => {
  passport.use('google-login', new GoogleStrategy({
    response_type: 'code',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:1000/users/auth/google/callback',
    passReqToCallback: true,
    scope: ['profile', 'email'] // Define the required scope here
  },
  async (req, accessToken, refreshToken, profile, done) => {
    // console.log(`Profile: ${JSON.stringify(profile)}`);
    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      } else {
        const newUser = new User({
          userName: profile.displayName, 
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

module.exports = setupGoogleStrategy;
