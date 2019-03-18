const Room = require('../models/room');

exports.getAllRoomNumbers = function(req, res) {
    Room.find({}).select({ _id: 0, __v: 0}).sort({ id: 1}).then(rooms => {

        if(req.query.hex === "true") {
            rooms = rooms.map(room => {
                return {
                    id: room.id.toString(16).toUpperCase(),
                    roomNumber: room.roomNumber,
                };
            });
        }

        res.status(200).json(rooms);
    }).catch(error => res.status(500).json({error: error}));
};

exports.getRoomId = function(req, res) {
    const roomId = req.params.id.toUpperCase();
    Room.findOne({roomNumber: roomId}).select({ _id: 0, __v: 0}).then(room => {
        res.status(200).json({
            hexId: room.id.toString(16).toUpperCase(),
        });
    }).catch(error => res.status(500).json({error: error}));
};