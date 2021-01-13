const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    user_id: String,
    latitude: Number,
    longitude: Number,
    speed: Number,
    course: Number
});

module.exports = mongoose.model('Users', UserSchema);