const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');

//REGISTER
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));


// LOGIN
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);


// LOGOUT - using the previously version of passport 0.5.0
router.get('/logout', users.logout)

module.exports = router;
