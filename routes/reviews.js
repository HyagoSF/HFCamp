const express = require('express');

//mergeParams to get access of all req.params from the app.js
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');



//REVIEWS ROUTES
//create a review for a specific campground
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save()
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//deleting a review
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition. So below: find the campground whose id is in URL, and pull off of the reviews array the review whose Id is in URL
    const updatedCampground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //removing the review inside the campground inside campgrounds collection.

    //deleting the review from the 'reviews' collection.
    const deletedReview = await Review.findByIdAndDelete(reviewId)

    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;




