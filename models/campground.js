const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    //Colt's way
    if (doc) {
        await review.deleteMany({ _id: { $in: doc.reviews } })
    }

    // //my way - both are correct
    // if (doc.reviews.length) {
    //     const res = await review.deleteMany({ _id: { $in: doc.reviews } })
    //     console.log(res);
    // }
})






//model called campground using CampgroundSchema
module.exports = mongoose.model('Campground', CampgroundSchema);
//db.campgrounds.find()
//db.campgrounds.deleteMany()




//DELETING MIDDLEWARE FROM MY FARM/PRODUCT EXAMPLE

// farmSchema.post('findOneAndDelete', async function (farm) {
//     //if there is a product
//     if (farm.products.length) {
//         //delete all products where the _id is in the products Array for the farm that we just deleted
//         const res = await Product.deleteMany({ _id: { $in: farm.products } });
//         console.log(res);
//     }
// })