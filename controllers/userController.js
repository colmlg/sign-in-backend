var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');

exports.registerUser = function(req, res) {
    var user = req.body;
    user.password = bcrypt.hashSync(user.password, 8);
    User.create(user, function (error, user) {
        if(error) {
            return res.status(500).json(error);
        }

        var token = jwt.sign({ id: user.id, role: user.role}, process.env.TOKEN_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).json({token: token});
    });
};

exports.getUser = function(req, res) {
    User.find({ id: req.query.id }, function (error, user) {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(200).json(user);

    });
};

exports.setImage = function(req, res) {
    User.findOne({ id: req.userId }, function (error, user) {
        if (error) {
            return res.status(500).json(error);
        }

        user.referenceImage = req.body.image;
        user.save(function(error) {
            if (error) {
                return res.status(500).json(error);
            }


            return res.status(200).json({});
        });
    });
};
