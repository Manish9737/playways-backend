const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const Host = require("../model/hostSchema");
const jwt = require("jsonwebtoken");

require("dotenv").config();

passport.use(
  "host-login",
  new LocalStrategy(
    {
      usernameField: "emailOrPhone",
      passwordField: "password",
    },
    async (emailOrPhone, password, done) => {
      try {
        let host;

        const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
        if (isEmail) {
          host = await Host.findOne({ email: emailOrPhone }).select(
            "+password"
          );
        } else {
          host = await Host.findOne({ phone: emailOrPhone }).select(
            "+password"
          );
        }

        if (!host) {
          return done(null, false, { message: "Host not found" });
        }

        const isMatch = await bcrypt.compare(password, host.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, host);
      } catch (error) {
        console.error(error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((host, done) => {
  done(null, host.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const host = await Host.findById(id);
    done(null, host);
  } catch (error) {
    done(error);
  }
});

// Middleware to generate JWT token
function generateToken(host) {
  return jwt.sign({ id: host._id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
}

module.exports = {
  passport,
  generateToken,
};
