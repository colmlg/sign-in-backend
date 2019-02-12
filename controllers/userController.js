const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const request = require('request');
const requestPromise = require('request-promise-native');
const constants = require('../constants');

exports.getUser = function (req, res, next) {
    User.findOne({id: req.userId}, function (error, user) {
        if (error) return res.status(500).json(error);

        if (!user) return res.status(404).json({error: "User not found."});

        req.user = user;
        next();
    });
};

exports.registerUser = function (req, res) {
    let user = req.body;
    user.password = bcrypt.hashSync(user.password, 8);
    User.create(user, function (error, user) {
        if (error) {
            return res.status(500).json(error);
        }

        const token = jwt.sign({id: user.id, role: user.role}, process.env.TOKEN_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).json({token: token});
    });
};

exports.setImage = function (req, res) {
    let user = req.user;
    user.referenceImage = Buffer.from(req.body.image, 'base64');
    user.save(function (error) {
        if (error) return res.status(500).json(error);

        return res.status(200).json({});
    });
};

exports.getFaceId = function (req, res) {
    const user = req.user;
    if (user.referenceImage === undefined) {
        return res.status(500).json({error: "No face image for this user."});
    }

    getFaceId(user.referenceImage).then(faceId => {
        res.status(200).json({faceId: faceId});
    }).catch(error => {
        res.status(500).json(error);
    });
};

exports.compareFaces = function (req, res) {
    const user = req.user;
    if (user.referenceImage === undefined) {
        return Promise.reject({ error: "No face image for this user."});
    }

    const imageToCompare = Buffer.from(req.body.image, 'base64');

    return Promise.all([getFaceId(user.referenceImage), getFaceId(imageToCompare)]).then(faceIds => {
        return compareFaces(faceIds[0], faceIds[1]);
    }).then(response => {
        if (response.body.isIdentical) {
            return true
        } else {
            return Promise.reject({error: "Faces do not match."})
        }
    })
};


function getFaceId(image) {
    const params = {
        'returnFaceId': 'true',
        'returnFaceLandmarks': 'false'
    };

    const options = {
        uri: constants.AZURE_BASE_URL + 'detect',
        qs: params,
        body: image,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY
        }
    };

    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            if (error) return reject(error);

            body = JSON.parse(body);

            if (body[0] === undefined) {
                return reject({error: 'No Faces Detected'});
            }

            //The array of faces returned from Azure is sorted in descending order on rectangle size.
            //We are only interested in the first face, as this is the largest and most likely
            //to belong to the user.
            resolve(body[0].faceId);
        });

    });
}

function compareFaces(faceId1, faceId2) {

    const body = {
        faceId1: faceId1,
        faceId2: faceId2
    };

    const options = {
        uri: constants.AZURE_BASE_URL + 'verify',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY
        }
    };

    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            if (error) return reject(error);

            resolve(body);
        });
    });
}

function createClasses(userId) {

    const url = 'http://35.189.65.75/id-timetable-v2.php/id/' + userId + '/staff/true';

    const options = {
        uri: url
    };

    return requestPromise.get(options).then(timetable => {
        return timetable.classes.map(function(aClass){
            return {
                type: aClass.type.split('-')[1],
                roomNumber: aClass.room,
                startTime: aClass.time.split('-')[0],
                endTime: aClass.time.split('-')[1],
                day: aClass.day,
                startWeek: aClass.weeks.split('-')[0],
                endWeek: aClass.weeks.split('-')[1]
            }
        });
    }).then(Event.create)
}
