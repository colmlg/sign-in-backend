var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

exports.login = function(req, res) {
    var db = req.db;
    db.collection('students').findOne({studentNumber: req.body.studentNumber},{},function(error, student) {
        if (student == null || error) {
            return res.status(400).send("Invalid student number.");
        }

        if (bcrypt.compareSync(req.body.password, student.password)) {
            var token = jwt.sign({ id: student._id}, process.env.TOKEN_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send({ token: token });
        } else {
            res.status(400).send("Invalid password.");
        }
    });
};