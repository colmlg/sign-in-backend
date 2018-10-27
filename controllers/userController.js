var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var request = require('request');
var constants =require('../constants');

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

        getFaceId(user.referenceImage, function(error, faceId) {
            if (error) {
                return res.status(500).json(error);
            }

            return res.status(200).json({ faceId: faceId });
        });
    });
};

exports.compareFaces = function(req, res) {
    User.findOne({ id: req.userId }, function (error, user) {
        if (error) {
            return res.status(500).json(error);
        }

        if (user.referenceImage === undefined) {
            return res.status(500).json({ error: "No face image for this user."});
        }

        var imageToCompare = Buffer.from(req.body.image, 'base64');

        getFaceId(user.referenceImage, function(error, faceId1) {
            if (error) return res.status(500).json(error);

            getFaceId(imageToCompare, function (error, faceId2) {
                if (error) return res.status(500).json(error);

                compareFaces(faceId1, faceId2, function(error, response) {
                    if (error) return res.status(500).json(error);

                    return res.status(200).json(JSON.parse(response));
                });
            });
        });
    });
};


var getFaceId = function(image, callback) {
    var params = {
        'returnFaceId': 'true',
        'returnFaceLandmarks': 'false'
    };

    var options = {
        uri: constants.AZURE_BASE_URL + 'detect',
        qs: params,
        body: image,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key' : process.env.AZURE_KEY
        }
    };

    request.post(options, function (error, response, body) {
        if (error) {
            return callback(error);
        }

        body = JSON.parse(body);

        if (body[0] === undefined) {
            return callback({ error: 'No Faces Detected' });
        }


        callback(null, body[0].faceId);
    });
};

var compareFaces = function(faceId1, faceId2, callback) {

    var body = {
        faceId1: faceId1,
        faceId2: faceId2
    };

    var options = {
        uri: constants.AZURE_BASE_URL + 'verify',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : process.env.AZURE_KEY
        }
    };

    request.post(options, function (error, response, body) {
        if (error) return callback(error);

        callback(null, body);
    });
};
