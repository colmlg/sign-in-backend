var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var constants = require('../constants');

var ModuleSchema = new Schema({
    id: { type: String, required: true, unique: true, dropDups: true },
    lecturers: { type: [ { type: String, required: true } ], required: true, default: undefined },
    students: { type: [ { type: String, required: true } ], required: true, default: undefined },
    events: { type: [ { type:  Schema.Types.ObjectId, ref: constants.EVENT_MODEL_NAME, required: true } ], required: true, default: undefined }
});

var Module = mongoose.model(constants.MODULE_MODEL_NAME, ModuleSchema);

module.exports = Module;