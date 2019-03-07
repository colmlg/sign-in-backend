const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

/* GET users listing. */
// router.get('/', authController.verifyToken, authController.verifyStudent, userController.getUser);

router.post('/image', authController.verifyToken, authController.verifyStudent, userController.getUser, userController.setImage);


module.exports = router;
