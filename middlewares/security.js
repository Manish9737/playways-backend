const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

module.exports = (app) => {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
};