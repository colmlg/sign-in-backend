var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var constants = require('../constants');

var UserSchema = new Schema({
    firstName: { type: String, required: true },
    surname: { type: String, required: true },
    id: { type: Number, required: true, unique : true, dropDups: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    password: { type: String, required: true },
    modules: [ { type: Schema.Types.ObjectId, ref: constants.MODULE_MODEL_NAME, required: true }],
    role: { type: String, enum: [constants.STUDENT, constants.LECTURER], required: true }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;