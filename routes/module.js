const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const moduleController = require('../controllers/moduleController');

router.get('/', authController.verifyToken, authController.verifyLecturer, moduleController.getModules);

router.post('/', authController.verifyToken, authController.verifyLecturer, moduleController.addModule);

router.post('/students', authController.verifyToken, authController.verifyLecturer, moduleController.addStudentsToModule);

router.post('/lecturers', authController.verifyToken, authController.verifyLecturer, moduleController.addLecturerToModule);

router.get('/room', moduleController.getRoomNumbers);

router.get('/:id', authController.verifyToken, authController.verifyLecturer, moduleController.getModule);

module.exports = router;
