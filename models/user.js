const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//passing the passportLocalMongoose to UserSchema's plugin, and this is going to add on to our Schema an username and a password
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
