var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var userController = require('../controllers/userController');

router.post('/student', userController.register);

module.exports = router;