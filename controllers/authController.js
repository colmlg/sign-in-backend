var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

exports.studentLogin = function(req, res) {
    var db = req.db;
    db.collection('students').findOne({studentNumber: req.body.studentNumber},{},function(error, student) {
        if (student == null || error) {
            return res.status(400).send("Invalid student number.");
        }

        if (bcrypt.compareSync(req.body.password, student.password)) {
            var token = jwt.sign({ id: student.studentNumber, role: "student" }, process.env.TOKEN_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send({ token: token });
        } else {
            res.status(400).send("Invalid password.");
        }
    });
};


exports.lecturerLogin = function(req, res) {
    var db = req.db;
    db.collection('lecturers').findOne({ staffNumber: req.body.staffNumber },{},function(error, lecturer) {
        if (lecturer == null || error) {
            return res.status(400).send("Invalid staff number.");
        }

        if (bcrypt.compareSync(req.body.password, lecturer.password)) {
            var token = jwt.sign({ id: lecturer.staffNumber, role: "lecturer" }, process.env.TOKEN_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send({ token: token });
        } else {
            res.status(400).send("Invalid password.");
        }
    });
};

exports.verifyStudent = function(req, res, next) {
    if (req.role == "student") {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

exports.verifyLecturer = function(req, res, next) {
    if (req.role == "lecturer") {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

exports.verifyToken = function(req, res, next) {
    var token = req.headers['x-access-token'];

    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    });
};
