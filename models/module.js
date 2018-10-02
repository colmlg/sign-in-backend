var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModuleSchema = new Schema({
    id: { type: String, required: true, unique: true, dropDups: true },
    lecturers: { type: [ { type: Number, required: true } ], required: true },
    students: { type: [ { type: Number, required: true } ], required: true }
});

var Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;