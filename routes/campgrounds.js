const express = require('express');
const router = express.Router();

//importing necessary things to make routes work
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');




//index page - all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))


//new 1 - FORM
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

//new 2 - SUBMIT THE FORM
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body);
    newCamp.author = req.user._id
    await newCamp.save();
    req.flash('success', 'Your campground has been created!!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))


//show page 
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({

        //populate the reviews from Campground, and then populate the author of each rev.
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Could not find this campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}))


//to update 1 - FORM
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Could not find this campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}))

//to update 2 - SUBMIT THE FORM
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', `Your ${campground.title}, has been updated!!`)
    res.redirect(`/campgrounds/${campground._id}`);
}))


//to delete something
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds');
}))


module.exports = router;