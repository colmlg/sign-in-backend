var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var moduleController = require('../controllers/moduleController');

router.get('/', authController.verifyToken, authController.verifyLecturer, moduleController.getModules);

router.post('/', authController.verifyToken, authController.verifyLecturer, moduleController.addModule);

router.post('/students', authController.verifyToken, authController.verifyLecturer, moduleController.addStudentsToModule);

router.post('/lecturers', authController.verifyToken, authController.verifyLecturer, moduleController.addLecturerToModule);


module.exports = router;
