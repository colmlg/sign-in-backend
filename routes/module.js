const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const moduleController = require('../controllers/moduleController');

router.get('/', authController.verifyToken, authController.verifyLecturer, moduleController.getModule);

router.post('/', authController.verifyToken, authController.verifyLecturer, moduleController.addModule);

router.post('/students', authController.verifyToken, authController.verifyLecturer, moduleController.addStudentsToModule);

module.exports = router;
