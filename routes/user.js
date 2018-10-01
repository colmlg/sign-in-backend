var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', authController.verifyToken, userController.getStudent);

module.exports = router;
