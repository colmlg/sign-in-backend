const Module = require('../models/module');
const Event = require('../models/event');
const moment = require('moment');
const AzureService = require('../services/azureService');
require('moment-recur');

exports.markAttendance = function(req, res) {
    Event.find({ roomNumber: req.body.roomNumber }).then(events => {
        for(let i = 0; i < events.length; i++) {
            if (isEventCurrentlyOn(events[i])) {
                return events[i];
            }
        }
        return Promise.reject({ error: "No event on in this room right now."})
    }).then(event => {
        return Module.findOne({ id: event.moduleId }).then(module => {
            if (module.students.indexOf(req.userId) === -1) {
                return Promise.reject({ error: "You are not registered for this module."});
            }

            return event;
        })
    }).then(event => {
        return AzureService.compareFaces(req.user.referenceImage, req.body.image).then(identical => {
            if(!identical) {
                return Promise.reject({ error: "Faces do not match."});
            }

            return event;
        });
    }).then(event => {
        if (event.studentsAttended.indexOf(req.userId) === -1) {
            event.studentsAttended.push(req.userId);
        }

        return event.save()
    }).then(() => {
        res.status(200).json();
    }).catch(error => {
        res.status(500).json(error);
    });
};

function isEventCurrentlyOn(event) {
    const recurrence = moment().recur({
        start: event.startDate,
        end: event.startDate
    }).every(1).weeks();

    const today = moment().format("MM/DD/YYYY");

    //Moment-recur doesn't store any time information, so we have to check that separately
    const eventTime = moment(event.startTime, 'hh:mm').hours();
    const currentTime = moment().hours();

    const dateMatches = recurrence.matches(today);
    const timeMatches = currentTime >= eventTime && currentTime <= (eventTime + event.duration);

    return dateMatches && timeMatches;
}