var Module = require('../models/module');

exports.addModule = function(req, res) {
    Module.create(req.body, function(error, module) {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).send(module);
    });
};

exports.getModule = function(req, res) {

    Module.findOne({ id: req.query.id }, function (error, module) {
        if (error || !module) {
            return res.status(500).json(error);
        }

        if (module.lecturers.indexOf(req.userId) == -1) {
            return res.status(401).send("Unauthorized");
        }
        res.status(200).json(module)
    });
};