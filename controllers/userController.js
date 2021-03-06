const Constants = require("../constants");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Lesson = require('../models/lesson');
const AzureService = require('../services/azureService');
const timetableScraper = require('../scrapers/timetableScraper');

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

    User.create(user).then(user => {
        return timetableScraper.saveLessons(user.id, user.role === Constants.LECTURER);
    }).then(() => {
        console.log('Successfully scraped timetable for user ' + user.id);

        const token = jwt.sign({id: user.id, role: user.role}, process.env.TOKEN_SECRET, {
            expiresIn: 864000 // expires in 240 hours
        });

        res.status(200).json({token: token});
    }).catch(error => {
        res.status(500).json({ error: error });
    });
};

exports.setImage = function (req, res) {
    let user = req.user;
    user.referenceImage = Buffer.from(req.body.image, 'base64');

    //Check with azure to see if we can get a face ID, because we don't want to save the image if we can't
    AzureService.getFaceId(user.referenceImage).then(() => {
        return user.save();
    }).then(() => {
        res.status(200).json({});
    }).catch(error => {
        res.status(500).json({error: error});
    });
};

exports.scrapeTimetable = function (req, res) {
    timetableScraper.scrapeTimetable(req.query.id).then(Lesson.create).then(lessons => {
        res.status(200).json(lessons);
    }).catch(error => {
        res.status(500).json(error);
    });
};