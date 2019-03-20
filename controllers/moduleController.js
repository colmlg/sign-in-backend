const Module = require('../models/module');
const Lesson = require('../models/lesson');

exports.getModules = function (req, res) {
    Module.find({lecturers: req.userId}).populate('events').exec().then(modules => {
        res.status(200).json(modules)
    }).catch(error => {
        res.status(500).json({error: error});
    });
};

exports.getModule = function (req, res) {

    Module.findOne({id: req.params.id}).exec().then(module => {
        /*if (module.lecturers.indexOf(req.userId) === -1) {
            return res.status(403).send({error: 'You are not a lecturer of this module.'});
        }*/
        return Lesson.find({moduleId: module.id}).sort({date: 1}).then(lessons => {


            res.status(200).json({
                module: module,
                lessons: lessons
            });
        });
    }).catch(error => {
        res.status(500).json({error: error});
    });
};

exports.addStudentsToModule = function (req, res) {
    Module.findOne({id: req.body.id}).populate('events').exec(function (error, module) {
        if (error || !module) {
            return res.status(500).json(error);
        }

        if (module.students.indexOf(req.body.students) === -1) {
            module.students.push(req.body.students);
        }


        module.save(function (error, updatedModule) {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json({module: updatedModule});
        });
    });
};

exports.addLecturerToModule = function (req, res) {
    Module.findOne({id: req.body.id}).populate('events').exec().then(module => {
        if (module.lecturers.indexOf(req.body.lecturer) === -1) {
            module.lecturers.push(req.body.lecturer);
        }

       return module.save();
    }).then(updatedModule => {
            res.status(200).json({module: updatedModule});
    }).catch(error => {
        res.status(500).json({ error: error });
    });
};