const Module = require('../models/module');
const Lesson = require('../models/lesson');
const Constants = require('../constants');

exports.getModules = function (req, res) {
    const findObj = req.user.role === Constants.STUDENT ? {students: req.userId} : {lecturers: req.userId};

    Module.find(findObj).select({ id: 1, _id: 0}).sort({id: 1}).then(modules => {
        res.status(200).json(modules)
    }).catch(error => {
        res.status(500).json({error: error});
    });
};

exports.getModule = function (req, res) {
    Module.findOne({id: req.params.id}).select({ id: 1, students: 1, lecturers: 1, _id: 0}).then(module => {
        /*if (module.lecturers.indexOf(req.userId) === -1) {
            return res.status(403).send({error: 'You are not a lecturer of this module.'});
        }*/
        return Lesson.find({moduleId: module.id}).select({ _id: 0, __v: 0}).sort({date: -1}).then(lessons => {


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