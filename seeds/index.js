//IMPORTS
const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const Reviews = require('../models/review');
const { places, descriptors } = require('./seedHelpers');

//import the cities data
const cities = require('./cities')


//CONNECT MONGOOSE
main()
    .then(() => console.log('Mongo connection opened!'))
    .catch(err => console.log(err))

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp')
}


//GET RANDOM ELEMENT FROM THE ARRAY OF PLACES AND DESCRIPTORS
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}


//GET 50 RANDOM CITIES ADDRESS
const seedDB = async () => {
    await Campground.deleteMany({});
    await Reviews.deleteMany({});

    //loop many times to get some random campground's names
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62b5afe5fbc74c6aa23d551d',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,

            //descriptors[random number between 0 and the total elements of the array]
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            
            //price: price, is the same of leaving just price:
            price
        })
        await camp.save();
    }
}


//WE MUST CLOSE THIS CONNECTION, WE DON'T THIS IN A SEEDS FILE...
seedDB().then(() => {
    mongoose.connection.close();
})
