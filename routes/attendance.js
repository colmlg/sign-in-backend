const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');
const userController = require('../controllers/userController');

router.post('/student', authController.verifyToken, authController.verifyStudent, userController.getUser, attendanceController.markAttendance);

module.exports = router;
