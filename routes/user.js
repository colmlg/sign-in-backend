const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/image', authController.verifyToken, authController.verifyStudent, userController.getUser, userController.setImage);

router.get('/timetable', userController.scrapeTimetable);

module.exports = router;
