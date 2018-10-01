var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

router.post('/student', userController.registerStudent);

module.exports = router;