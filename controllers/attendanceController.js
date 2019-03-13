const Module = require('../models/module');
const Lesson = require('../models/lesson');
const Week = require('../models/week');
const Room = require('../models/room');
const moment = require('moment');
const AzureService = require('../services/azureService');

/* Marks a user as having attended a lesson.
First, we find the lesson currently on in this room.
Then, we check is this student registered for this module.
If they are, we use facial recognition to validate their identity.
If that succeeds we add them to the list of students that attended this class.
 */
exports.markAttendance = function (req, res) {
    Room.findOne({ id: req.body.roomNumber}).then(roomNumber => {
        return Lesson.find({roomNumber: roomNumber}).then(lessons => {
            for (let i = 0; i < lessons.length; i++) {
                if (isEventCurrentlyOn(lessons[i])) {
                    return lessons[i];
                }
            }
            return Promise.reject({error: "No lesson on in this room right now."})
        });
    }).then(lesson => {
        return Module.findOne({id: lesson.moduleId}).then(module => {
            if (module.students.indexOf(req.userId) === -1) {
                return Promise.reject({error: "You are not registered for this module."});
            }

            return lesson;
        })
    }).then(event => {
        return AzureService.compareFaces(req.user.referenceImage, req.body.image).then(identical => {
            if (!identical) {
                return Promise.reject({error: "Faces do not match."});
            }

            return event;
        });
    }).then(event => {
        if (event.studentsAttended.indexOf(req.userId) === -1) {
            event.studentsAttended.push(req.userId);
        }

        return event.save()
    }).then(() => {
        res.status(200).json({});
    }).catch(error => {
        res.status(500).json(error);
    });
};

function isEventCurrentlyOn(event) {
    const today = moment().format("DD/MM/YYYY");

    const startTime = moment(event.startTime, 'hh:mm').hours();
    const currentTime = moment().hours();

    const endTime = moment(event.endTime, 'hh:mm').hours();
    const duration = endTime - startTime;

    const dateMatches = event.date.isSame(today, 'day');
    const timeMatches = currentTime >= startTime && currentTime <= (startTime + duration);

    return dateMatches && timeMatches;
}