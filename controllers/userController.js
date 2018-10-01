var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


exports.registerStudent = function(req, res) {
    var db = req.db;
    var student = req.body;
    student.password = bcrypt.hashSync(student.password, 8);
    db.collection('students').insert(student, function (error, user) {
        if (error) {
            return res.status(400).send("Student already registered.");
        }

        var token = jwt.sign({ id: student.studentNumber }, process.env.TOKEN_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.send({ success: true, token: token});
    });
};

exports.getStudent = function(req, res) {
    var db = req.db;
    db.collection('students').findOne({ studentNumber: req.userId }, { _id: 0,  password: 0}, function(error, user) {
        if (error || !user) {
            return res.status(500).send("Unable to find user.");
        }

        res.status(200).json(user);
    });
};
