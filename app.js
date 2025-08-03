if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // erro -fetch

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet = require('helmet');

// REQUIRE ROUTES
const userRoutes = require("./routes/users");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

// const dbUrl= process.env.DB_URL
const dbUrl = process.env.DB_URL 
// mongoose.connect(dbUrl);
mongoose.connect(dbUrl);
 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected!");
});

const app = express();
 
app.set('query parser', 'extended');

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")))
app.use(sanitizeV5({ replaceWith: '_' }));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, // configuração para atualizar a sessão após 24 horas
  crypto: {
      secret 
  }
});

store.on("error", function(e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = { 
  store, // Use MongoStore to store sessions in MongoDB 
  name: '32131232', // Use a unique name for the session cookie
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    // secure: true, // Uncomment this line if using HTTPS 
	  expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
	  maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/"
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dsvbf6yrb/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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
  res.locals.reviewError = req.flash('reviewError');
  res.locals.errorMessages = req.flash('errorMessages')[0] || {};;
  res.locals.formData = req.flash('formData')[0] || {};;
  next();
})

// USE ROUTES
app.use('/', userRoutes)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
 