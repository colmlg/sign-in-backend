const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');

router.post('/student', authController.verifyToken, authController.verifyStudent, attendanceController.markAttendance);

module.exports = router;
