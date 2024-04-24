const http = require('http');

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const session = require("express-session");

var indexRouter = require("./routes/index/index");
var usersRouter = require("./routes/users/users");
var hostRouter = require("./routes/hosts/hosts");
var quoteRouter = require("./routes/quotes/quotes");
var gsRouter = require("./routes/gameStation/gameStation");
var adminRouter = require("./routes/admin/admin");
var bookingsRouter = require("./routes/bookings/bookings");
var gamesRouter = require("./routes/games/games");
var feedbackRouter = require("./routes/feedback/feedback")
var blogRouter = require("./routes/blog/blog");
var slotRouter = require("./routes/slots/slots");
var paymentRouter = require("./routes/payment/payment");
var bankDetailsRouter = require("./routes/bankDetails/bankDetails");

const Razorpay = require('razorpay');

require("./DB/conn");

require("./middlewares/passportConfig");

var app = express();

app.use(
  session({
    secret: ["cyberwolve"],
    saveUninitialized: false,
  })
);


const corsOptions = {
  origin: "*", 
  methods: "GET,POST,PUT,DELETE", 
  credentials: true,
  optionsSuccessStatus: 204, 
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));

app.use("/images", express.static("public/images"));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/hosts", hostRouter);
app.use("/quotes", quoteRouter);
app.use("/gameStation", gsRouter);
app.use("/admin", adminRouter);
app.use("/bookings", bookingsRouter);
app.use("/games", gamesRouter);
app.use("/feedback", feedbackRouter);
app.use("/blogs", blogRouter);
app.use("/slots", slotRouter);
app.use("/payment", paymentRouter);
app.use("/bankDetails", bankDetailsRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
