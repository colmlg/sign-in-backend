const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../constants');

const EventSchema = new Schema({
    type: {type: String, enum: [constants.LECTURE, constants.LAB, constants.TUTORIAL]},
    moduleId: {type: String, required: true},
    startTime: {type: String, required: true},
    duration: {type: Number, required: true},
    startDate: {type: String, required: true},
    endDate: {type: String, required: true},
    roomNumber: {type: String, required: true},
    studentsAttended: [String]
});

const Event = mongoose.model(constants.EVENT_MODEL_NAME, EventSchema);

module.exports = Event;