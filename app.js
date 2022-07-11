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

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

//CONNECTING MONGOOSE
main()
	.then(() => console.log('Mongo connection opened!'))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect('mongodb://localhost:27017/yelp-camp');
}

//SET TEMPLATE ENGINE
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//USE MIDDLEWARE FOR EVERY REQUEST
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	// store: mongoStoreSoon
	cookie: {
		//for basic security:
		httpOnly: true,

		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

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
