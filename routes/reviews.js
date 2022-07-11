const express = require('express');

//mergeParams to get access of all req.params from the app.js
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const review = require('../models/review');

//REVIEWS ROUTES
//create a review for a specific campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//deleting a review
router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

module.exports = router;
