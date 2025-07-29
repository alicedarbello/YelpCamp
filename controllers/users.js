const User = require("../models/user");

module.exports.registerForm = (req, res) => {
  res.render("users/register");
}

module.exports.loginForm = (req, res) => {
  res.render("users/login");
}

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err); 
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
}

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}