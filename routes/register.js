var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

router.post('/student', userController.registerStudent);

router.post('/lecturer', userController.registerLecturer);

module.exports = router;