var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', authController.verifyToken, authController.verifyStudent, userController.getUser);

router.post('/image', authController.verifyToken, authController.verifyStudent, userController.setImage);

router.get('/faceId', authController.verifyToken, authController.verifyStudent, userController.getFaceId);

router.post('/verify', authController.verifyToken, authController.verifyStudent, userController.compareFaces);

module.exports = router;
