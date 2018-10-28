const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../constants');

const UserSchema = new Schema({
    id: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true},
    role: {type: String, enum: [constants.STUDENT, constants.LECTURER], required: true},
    referenceImage: Buffer
});

const User = mongoose.model('User', UserSchema);

module.exports = User;