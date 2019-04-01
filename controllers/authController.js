const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const constants = require('../constants');

exports.login = function (req, res) {
    User.findOne({id: req.body.id}, function (error, user) {
        if (error) {
            return res.status(500).json(error);
        }

        if (!user) {
            return res.status(401).json({error: 'Invalid user ID.'});
        }

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({error: 'Invalid password.'});
        }

        const token = jwt.sign({id: user.id, role: user.role}, process.env.TOKEN_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        let response = {token: token};
        if(user.referenceImage === undefined) {
            response.imageSet = false;
        }
        res.send(response);
    });
};

exports.verifyStudent = function (req, res, next) {
    if (req.role === constants.STUDENT) {
        next();
    } else {
        res.status(403).send({error: 'You must be a student to access this resource.'});
    }
};

exports.verifyLecturer = function (req, res, next) {
    if (req.role === constants.LECTURER) {
        next();
    } else {
        res.status(403).send({error: 'You must be a lecturer to access this resource.'});
    }
};

exports.verifyToken = function (req, res, next) {
    let token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).send({error: 'No token provided.'});
    }

    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({error: 'Invalid token.'});
        }

        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    });
};
