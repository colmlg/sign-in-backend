const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../constants');

const WeekSchema = new Schema({
    id: {type: String, required: true, unique: true, dropDups: true},
    date: {type: Date, required: true},
});

const Week = mongoose.model('Week', WeekSchema);

module.exports = Week;