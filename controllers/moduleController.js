
exports.addModule = function(req, res) {
    var db = req.db;
    var module = req.body;
    module.lecturer = req.userId;

    db.collection('modules').insert(req.body, {}, function(error, module) {
        if (error) {
            return res.status(500).send("Error adding module.js");
        }

        res.status(200).send();
    });
};

exports.getModule = function(req, res) {
    var db = req.db;

    db.collection('modules').findOne({ moduleId: req.query.moduleId }, {}, function(error, module) {
        if(error || !module) {
            return res.status(500).send("Error finding module");
        }

        if (module.lecturer != req.userId) {
            return res.status(401).send("Unauthorized");
        }

        res.status(200).json(module)
    });
};