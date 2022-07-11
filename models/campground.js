const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

// https://res.cloudinary.com/demo/image/upload/c_crop,g_north_west,h_150,w_200/sample.jpg

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

//We use virtual because we don't need to store this to our database
ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		price: Number,
		description: String,
		location: String,
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
	},
	opts
);

//To modify our campground to add new 'property' to it, as mapbox asks for
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `
	<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
	<p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
	//Colt's way
	if (doc) {
		await review.deleteMany({ _id: { $in: doc.reviews } });
	}
});

//model called campground using CampgroundSchema
module.exports = mongoose.model('Campground', CampgroundSchema);
