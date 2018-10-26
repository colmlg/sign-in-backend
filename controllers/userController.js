var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var request = require('request');

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
    User.findOne({ id: req.query.id }, function (error, user) {
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

        user.referenceImage = Buffer.from(req.body.image, 'base64');
        user.save(function(error) {
            if (error) {
                return res.status(500).json(error);
            }


            return res.status(200).json({});
        });
    });
};

exports.getFaceId = function(req, res) {
    User.findOne({ id: req.userId }, function (error, user) {
        if (error) {
            return res.status(500).json(error);
        }

        if (user.referenceImage === undefined) {
            return res.status(500).json({ error: "No face image for this user."});
        }


        var uriBase = 'https://northeurope.api.cognitive.microsoft.com/face/v1.0/detect';
        var params = {
            'returnFaceId': 'true'
        };

        var options = {
            uri: uriBase,
            qs: params,
            body: user.referenceImage,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : process.env.AZURE_KEY
            }
        };

        request.post(options, function (error, response, body) {
            if (error) {
                return res.status(500).json(error);
            }

            res.status(200).json(body);
         });
    });
};
