var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');

exports.login = function(req, res) {
    User.findOne({ id: req.body.id }, function(error, user) {
        if(error) {
            return res.status(500).json(error);
        }

        if(!user) {
            return res.status(400).json({ error: "Invalid student number." });
        }

        if (bcrypt.compareSync(req.body.password, user.password)) {
            var token = jwt.sign({ id: user.id, role: user.role }, process.env.TOKEN_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });

            res.send({ token: token });
        } else {
            res.status(400).json({ error: "Invalid password." });
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
