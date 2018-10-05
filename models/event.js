var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var constants = require('../constants');

var EventSchema = new Schema({
    startTime: { type: String , required: true },
    duration: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    roomNumber: { type: String, required: true }
});

var Event = mongoose.model(constants.EVENT_MODEL_NAME, EventSchema);

module.exports = Event;