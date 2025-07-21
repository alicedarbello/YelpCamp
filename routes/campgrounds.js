const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware");

// ROUTES /campgrounds

router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/form", { campground: undefined });
});

router.get("/:id/edit", isLoggedIn, isAuthor, async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/form", { campground });
});

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      { new: true }
    );
    req.flash("success", "Successfully edit a campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }
);

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  async (req, res, next) => {
    //req.body.campground devolve o objeto "Campground"
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // adiciona o autor do campground
    await campground.save();
    req.flash("success", "Successfully created a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }
);

// show route for each Campground:
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    // populate o Review e em cada Review
    .populate({
      // populate o autor de cada review
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  res.render("campgrounds/show", { campground });
});

router.delete("/:id", isLoggedIn, isAuthor, async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully remove a campground!");
  res.redirect("/campgrounds");
});

module.exports = router;
