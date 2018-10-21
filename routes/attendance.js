var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var attendanceController = require('../controllers/attendanceController');

router.post('/student', authController.verifyToken, authController.verifyStudent, attendanceController.markAttendance);

module.exports = router;
