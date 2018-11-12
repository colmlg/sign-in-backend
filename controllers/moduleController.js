var Module = require('../models/module');
var Event = require('../models/event');
require('moment-recur');

exports.addModule = function(req, res) {
    Event.create(req.body.events, function(error, events) {
        if (error) {
            return res.status(500).json(error);
        }

        req.body.events = events.map(function(event){
            return event._id;
        });

        Module.create(req.body, function(error, module) {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).send(module);
        });
    });
};

exports.getModules = function(req, res) {
    Module.find({ lecturers: req.userId }).populate('events').exec(function (error, modules) {
        if (error || !modules) {
            return res.status(500).json(error);
        }

        res.status(200).json(modules)
    });
};

exports.getModule = function(req, res) {

    Module.findOne({ id: req.query.id }).populate('events').exec(function (error, module) {
        if (error || !module) {
            return res.status(500).json(error);
        }

        if (module.lecturers.indexOf(req.userId) === -1) {
            return res.status(403).send({ error: 'You are not a lecturer of this module.'});
        }
        res.status(200).json(module)
    });
};

exports.addStudentsToModule = function(req, res) {
    Module.findOne({ id: req.body.id }).populate('events').exec(function (error, module) {
        if (error || !module) {
            return res.status(500).json(error);
        }

        if (module.lecturers.indexOf(req.userId) === -1) {
            return res.status(403).send({error: 'You are not a lecturer of this module.'});
        }

        module.students.push(req.body.students);

        module.save(function(error, updatedModule){
            if(error) {
                return res.status(500).json(error);
            }
            res.status(200).json({ module: updatedModule });
        });
    });
};

exports.addLecturerToModule = function(req, res) {
    Module.findOne({ id: req.body.id }).populate('events').exec(function (error, module) {
        if (error || !module) {
            return res.status(500).json(error);
        }

        if (module.lecturers.indexOf(req.userId) === -1) {
            return res.status(403).send({error: 'You are not a lecturer of this module.'});
        }

        module.students.push(req.body.lecturer);

        module.save(function(error, updatedModule){
            if(error) {
                return res.status(500).json(error);
            }
            res.status(200).json({ module: updatedModule });
        });
    });
};