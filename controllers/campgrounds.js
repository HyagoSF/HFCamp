const Campground = require('../models/campground');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};


module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res, next) => {
    const newCamp = new Campground(req.body);

    //map over the array that has been added to req.files, take the path and the filename, make a new object of each one, put that into a new array: newCamp.images
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

    newCamp.author = req.user._id
    await newCamp.save();
    req.flash('success', 'Your campground has been created!!')
    res.redirect(`/campgrounds/${newCamp._id}`)
};


module.exports.showCampground = async (req, res) => {
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
}


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Could not find this campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', `Your ${campground.title}, has been updated!!`)
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds');
}