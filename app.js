if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user');


// REQUIRE ROUTES
const userRoutes = require("./routes/users");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected!");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")))

const sessionConfig = {
  secret: 'thishouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
	  expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
	  maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Define middlewares para serem usados em todos os templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
	next();
})

// USE ROUTES
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use('/', userRoutes)

app.get("/", (req, res) => {
  res.render("home");
});

// para todos os requests (.all), para todos os paths/(.*)/
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// our default error handling middleware
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(status).render("error", { err });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
 