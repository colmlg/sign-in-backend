const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
const constants = require('../constants');

const RoomSchema = new Schema({
    roomNumber: {type: String, required: true, unique: true, dropDups: true},
});

RoomSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;