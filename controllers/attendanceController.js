var Module = require('../models/module');
var moment = require('moment');
require('moment-recur');

exports.markAttendance = function(req, res) {
    Module.findOne({ id: req.body.moduleId }).populate('events').exec(function (error, module) {
        if (error) {
            return res.status(500).json(error);
        }

        if(!module) {
            return res.status(404).send();
        }

        if(module.students.indexOf(req.userId) === -1) {
            return res.status(403).json({ error: 'You are not registered in this module.'});
        }

        for(var i = 0; i < module.events.length; i++) {
            var event = module.events[i]._doc;

            if (isEventCurrentlyOn(event) && event.roomNumber === req.body.roomNumber) {

                if (event.studentsAttended.indexOf(req.userId) === -1) {
                    event.studentsAttended.push(req.userId);
                }

                return module.events[i].save(function(error, updatedEvent){
                   if(error) {
                       return res.status(500).json(error);
                   }
                   res.status(200).json({occurring: true, event: updatedEvent});
                });

            }
        }

        return res.status(200).json({ occurring: false });

    });
};

var isEventCurrentlyOn = function(event) {
    var recurrence = moment().recur({
        start: event.startDate,
        end: event.startDate
    }).every(1).weeks();

    var today = moment().format("MM/DD/YYYY");

    //Moment-recur doesn't store any time information, so we have to check that separately
    var eventTime = moment(event.startTime, 'hh:mm').hours();
    var currentTime= moment().hours();

    var dateMatches = recurrence.matches(today);
    var timeMatches = currentTime >= eventTime && currentTime <= (eventTime + event.duration);

    return dateMatches && timeMatches;
};