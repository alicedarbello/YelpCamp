const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
    //find o campground atual
    const campground = await Campground.findById(req.params.id);
    //todo o objeto enviado por el formulario será guardado em
    //req.body.review que será = review[body] + review[rating]
    const review = new Review(req.body.review);
    review.author = req.user._id; //adiciona o id do usuário atual
    //agrega o novo review ao campground atual
    // ("reviews é o array de campground")
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
  }

  module.exports.deleteReview = async(req, res) =>{
  const { id, reviewId} = req.params;
  // primeiro vamos atualizar o campground especifico deletando o ObjetctId
  // do review que vamos deletar (através de pull)
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  await Review.findByIdAndDelete(reviewId)
  req.flash('success', 'Successfully deleted a review!');
  res.redirect(`/campgrounds/${id}`);
}