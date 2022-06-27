const express = require('express');
const router = express.Router();

//importing all controls from campgrounds controllers
const campgrounds = require('../controllers/campgrounds');

//importing necessary things to make routes work
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

//Fancy way to Restructure Routes:
router.route('/')
    //index page
    .get(catchAsync(campgrounds.index))
    //submit new camp form
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
// })


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