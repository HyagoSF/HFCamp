if (process.env.NODE_env !== 'production') {
	require('dotenv').config();
}

//IMPORTING
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
// const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
 
const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

//CONNECTING MONGOOSE
main()
	.then(() => console.log('Mongo connection opened!'))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect(dbUrl);
}
// 'mongodb://localhost:27017/yelp-camp';

//SET TEMPLATE ENGINE
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//USE MIDDLEWARE FOR EVERY REQUEST
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret: 'thisshouldbeabettersecret',
	touchAfter: 24 * 3600,
});

store.on('error', function (e) {
	console.log('SECTION STORE ERROR', e);
});

const sessionConfig = {
	store,
	secret: 'thisshouldbeabettersecret',
	touchAfter: 24 * 3600,
	name: 'session',
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	// store: mongoStoreSoon
	cookie: {
		httpOnly: true, //for basic security
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());

//using helmet
// app.use(helmet()); //including this breaks the CSP

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net/',
	'https://res.cloudinary.com/dc1grqjs4/',
	'https://res.cloudinary.com/douqbebwk/',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/',
	'https://res.cloudinary.com/dc1grqjs4/',
	'https://res.cloudinary.com/douqbebwk/',
];
const connectSrcUrls = [
	'https://*.tiles.mapbox.com',
	'https://api.mapbox.com',
	'https://events.mapbox.com',
	'https://res.cloudinary.com/dc1grqjs4/',
	'https://res.cloudinary.com/douqbebwk/',
];
const fontSrcUrls = ['https://res.cloudinary.com/dc1grqjs4/'];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/dc1grqjs4/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://res.cloudinary.com/douqbebwk/',
				'https://images.unsplash.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			mediaSrc: [
				'https://res.cloudinary.com/dc1grqjs4/',
				'https://res.cloudinary.com/douqbebwk/',
			],
			childSrc: ['blob:'],
		},
	})
);

//session() has to be always before passport.session()
app.use(passport.initialize());
app.use(passport.session());

//here we're saying 'hello passport, we'd like you to use the LocalStrategy, ant for the authentication method is going to be located on User Model and it's called authenticate.
passport.use(new LocalStrategy(User.authenticate()));

//serialize is basically how do we store a user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//NAVIGATING
app.get('/', (req, res) => {
	res.render('home');
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

//ERROR HANDLING
app.all('*', (req, res, next) => {
	next(new ExpressError('Not found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', { err });
});

//LISTENING ON PORT 8080
app.listen(8080, (req, res) => {
	console.log('Serving on port 8080');
});
