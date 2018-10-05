var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var moduleController = require('../controllers/moduleController');

router.get('/', authController.verifyToken, authController.verifyLecturer, moduleController.getModule);

router.post('/', authController.verifyToken, authController.verifyLecturer, moduleController.addModule);

router.post('/isactive', authController.verifyToken, moduleController.isModuleActive);

module.exports = router;
