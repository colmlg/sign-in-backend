var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');

router.post('/student', authController.studentLogin);

router.post('/lecturer', authController.lecturerLogin);

module.exports = router;