const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const moduleController = require('../controllers/moduleController');
const userController = require('../controllers/userController');


router.get('/', authController.verifyToken, userController.getUser, moduleController.getModules);

router.post('/students', authController.verifyToken, authController.verifyLecturer, moduleController.addStudentsToModule);

router.post('/lecturers', authController.verifyToken, authController.verifyLecturer, moduleController.addLecturerToModule);

router.get('/:id', authController.verifyToken, moduleController.getModule);

module.exports = router;
