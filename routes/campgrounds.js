const express = require("express");
const router = express.Router();
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer  = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

// ROUTES /campgrounds

router
  .route("/")
  .get(campgrounds.index)
  .post(isLoggedIn, upload.array('image'), validateCampground,campgrounds.createCampground);
  

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(campgrounds.showCampground)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    campgrounds.editCampground
  )
  .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  campgrounds.renderEditForm
);

module.exports = router;
