var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var constants = require('../constants');

exports.login = function(req, res) {
    User.findOne({ id: req.body.id }, function(error, user) {
        if(error) {
            return res.status(500).json(error);
        }

        if(!user) {
            return res.status(401).json({ error: 'Invalid student number.' });
        }

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({error: 'Invalid password.'});
        }

        var token = jwt.sign({ id: user.id, role: user.role }, process.env.TOKEN_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.send({ token: token });
    });
};

exports.verifyStudent = function(req, res, next) {
    if (req.role === constants.STUDENT) {
        next();
    } else {
        res.status(403).send({ error: 'You must be a student to access this resource.' });
    }
};

exports.verifyLecturer = function(req, res, next) {
    if (req.role === constants.LECTURER) {
        next();
    } else {
        res.status(403).send({ error: 'You must be a lecturer to access this resource.' });
    }
};

exports.verifyToken = function(req, res, next) {
    var token = req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({ error: 'No token provided.'});
    }

    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err) {
            return res.status(500).send({ error: 'Invalid token.'});
        }

        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    });
};
