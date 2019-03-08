const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../constants');

const LessonSchema = new Schema({
    type: {type: String, enum: [constants.LECTURE, constants.LAB, constants.TUTORIAL]},
    moduleId: {type: String, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
    week: {type: String, required: true},
    roomNumber: {type: String, required: true},
    studentsAttended: [String],
    _id:{type: String}
});

const Lesson = mongoose.model(constants.LESSON_MODEL_NAME, LessonSchema);

module.exports = Lesson;