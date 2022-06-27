const express = require('express');
const router = express.Router();

//importing all controls from campgrounds controllers
const campgrounds = require('../controllers/campgrounds');

//importing necessary things to make routes work
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


//Fancy way to Restructure Routes:
router.route('/')
    //index page
    .get(catchAsync(campgrounds.index))
    //submit new camp form
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));


//new 1 - FORM
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    //show form page
    .get(catchAsync(campgrounds.showCampground))
    //update campground
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    //delete
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


//to update 1 - FORM
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;