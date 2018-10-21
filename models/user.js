var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var constants = require('../constants');

var UserSchema = new Schema({
    id: { type: String, required: true, unique : true, dropDups: true },
    password: { type: String, required: true },
    role: { type: String, enum: [constants.STUDENT, constants.LECTURER], required: true }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;