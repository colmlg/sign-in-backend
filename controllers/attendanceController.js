const Module = require('../models/module');
const Lesson = require('../models/lesson');
const Room = require('../models/room');
const moment = require('moment');
const AzureService = require('../services/azureService');

// db.lessons.update({moduleId: "CS4227"}, { $set: { studentsAttended: ["15148823"]} }, {multi: true} )

/* Marks a user as having attended a lesson.
First, we find the lesson currently on in this room.
Then, we check is this student registered for this module.
If they are, we use facial recognition to validate their identity.
If that succeeds we add them to the list of students that attended this class.
 */
exports.markAttendance = function (req, res) {
    Room.findOne({ id: req.body.roomNumber}).then(room => {
        return Lesson.find({roomNumber: room.roomNumber,
                            date: {
                                $gte: moment().startOf('day').toDate(),
                                $lte: moment().endOf('day').toDate()
                            }
        })
    }).then(lessons => {
        lessons = lessons.filter(l => moment() >= moment(l.startTime, "H:mm") && moment() <= moment(l.endTime, "HH:mm"));

        if(lessons.length === 0) {
            return Promise.reject({error: "No lesson on in this room right now."});
        }


        return lessons;
    }).then(lessons => {
        return Module.find({id: { $in: lessons.map(l => l.moduleId) }, students: req.userId}).then(modules => {
            let moduleIds = modules.map(m => m.id);
            lessons = lessons.filter(l => moduleIds.indexOf(l.moduleId) !== -1);

            if (lessons.length === 0) {
                return Promise.reject({error: "You are not registered for any module in this room right now."});
            }
            return lessons;
        });
    }).then(lessons => {
        return AzureService.compareFaces(req.user.referenceImage, req.body.image).then(identical => {
            if (!identical) {
                return Promise.reject({error: "Faces do not match."});
            }

            return lessons;
        });
    }).then(lessons => {
        lessons.forEach(lesson => {
            if (lesson.studentsAttended.indexOf(req.userId) === -1) {
                lesson.studentsAttended.push(req.userId);
            }
            lesson.save()
        });
    }).then(() => {
        res.status(200).json({});
    }).catch(error => {
        res.status(500).json(error);
    });
};