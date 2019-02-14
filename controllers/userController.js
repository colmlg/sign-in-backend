const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const requestPromise = require('request-promise-native');

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


// function createClasses(userId) {
//
//     const url = 'http://35.189.65.75/id-timetable-v2.php/id/' + userId + '/staff/true';
//
//     const options = {
//         uri: url
//     };
//
//     return requestPromise.get(options).then(timetable => {
//         return timetable.classes.map(function(aClass){
//             return {
//                 type: aClass.type.split('-')[1],
//                 roomNumber: aClass.room,
//                 startTime: aClass.time.split('-')[0],
//                 endTime: aClass.time.split('-')[1],
//                 day: aClass.day,
//                 startWeek: aClass.weeks.split('-')[0],
//                 endWeek: aClass.weeks.split('-')[1]
//             }
//         });
//     }).then(Event.create)
// }
