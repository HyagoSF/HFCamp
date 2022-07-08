const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary/index');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};


module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body);
    newCamp.geometry = geodata.body.features[0].geometry

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

    //my req.files... makes me an array, and I cant push an array into an array, so i'm gonna create this variable imgs to make it an array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));

    //map over the array that has been added to req.files, take the path and the filename, make a new object of each one, put that into a new array: newCamp.images
    campground.images.push(...imgs);

    if (req.body.deleteImages) {

        //for each image I want to delete destroy it from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }

        //I'm gonna pull out from campground those images whose file name is in req.body.deleteImages, but only if there is deleteImages on the req.body
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }

    await campground.save();

    req.flash('success', `Your ${campground.title}, has been updated!!`)
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds');
}