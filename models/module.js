const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../constants');

const ModuleSchema = new Schema({
    id: {type: String, required: true, unique: true, dropDups: true},
    lecturers: {type: [{type: String, required: true}], required: true},
    students: {type: [{type: String, required: true}], required: true},
});

const Module = mongoose.model(constants.MODULE_MODEL_NAME, ModuleSchema);

module.exports = Module;